
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlarmStore } from '@/hooks/useAlarmStore';
import { useNotificationStore } from '@/hooks/useNotificationStore';
import { useDsaProgress } from '@/hooks/useDsaProgress';
import { allQuestions } from '@/lib/dsa';
import { isToday, startOfTomorrow, formatDistanceToNow } from 'date-fns';
import { playSound } from '@/lib/audio';
import { showNotification } from '@/lib/notifications';

const activatedAlarms = new Set<string>();
const LAST_AUTO_ALARM_CHECK_KEY = 'last-auto-alarm-check';
const UNANSWERED_ALARM_TIMEOUT = 2 * 60 * 1000; // 2 minutes

export function AlarmManager() {
  const { alarms, activateAlarm, addOrUpdateAlarm, getAlarmById, snoozeAlarm } = useAlarmStore();
  const { notificationPermission } = useNotificationStore();
  const { progress } = useDsaProgress();
  const router = useRouter();

  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller === null) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.error('Service Worker registration failed:', error));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAlarms = () => {
      const now = Date.now();
      
      alarms.forEach(alarm => {
        if (alarm.questionIds.length === 0) {
          return;
        }
        
        // Handle unanswered active alarm
        if (alarm.isActive && alarm.activatedAt && now - alarm.activatedAt > UNANSWERED_ALARM_TIMEOUT) {
          console.log(`Alarm ${alarm.id} unanswered. Re-triggering.`);
          activateAlarm(alarm.id); // This will reset activatedAt to now
           
           showNotification('Still there? Your DSA alarm is waiting!', {
             body: 'Time to solve your daily DSA problems.',
             data: { url: `/alarm/active?alarmId=${alarm.id}` },
           });
           playSound(alarm.sound);
           router.push(`/alarm/active?alarmId=${alarm.id}`);
           return;
        }
        
        if (alarm.isActive) return;

        const hasSnoozeExpired = alarm.snoozeUntil && now >= alarm.snoozeUntil;
        const isInitialAlarmTime = now >= alarm.alarmDateTime && !alarm.snoozeUntil && !activatedAlarms.has(alarm.id);

        if (hasSnoozeExpired || isInitialAlarmTime) {
           if (isInitialAlarmTime) {
             activatedAlarms.add(alarm.id);
           }
           activateAlarm(alarm.id);
           
           showNotification('DSA Alarm!', {
             body: 'Time to solve your daily DSA problems.',
             data: { url: `/alarm/active?alarmId=${alarm.id}` },
           });
           playSound(alarm.sound);
           router.push(`/alarm/active?alarmId=${alarm.id}`);
        }
      });
    };

    const interval = setInterval(checkAlarms, 1000 * 5); // Check every 5 seconds
    checkAlarms();

    return () => clearInterval(interval);
  }, [alarms, router, activateAlarm]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const autoSetNextDayAlarm = () => {
        const lastCheck = localStorage.getItem(LAST_AUTO_ALARM_CHECK_KEY);
        if (lastCheck && isToday(new Date(parseInt(lastCheck, 10)))) {
            return;
        }

        const tomorrow = startOfTomorrow();
        const hasAlarmForTomorrow = alarms.some(alarm => {
            const alarmDate = new Date(alarm.alarmDateTime);
            return alarmDate >= tomorrow && alarmDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
        });

        if (!hasAlarmForTomorrow) {
            const lastCompletedQuestionIndex = allQuestions.findLastIndex(q => progress[q.id]);
            const nextQuestionIndex = lastCompletedQuestionIndex === -1 ? 0 : lastCompletedQuestionIndex + 1;
            
            const nextQuestions = allQuestions.slice(nextQuestionIndex, nextQuestionIndex + 1);

            if (nextQuestions.length > 0) {
                const nextDayAlarmTime = new Date(tomorrow);
                nextDayAlarmTime.setHours(7, 0, 0, 0);

                addOrUpdateAlarm({
                    dateTime: nextDayAlarmTime.getTime(),
                    questions: nextQuestions.map(q => q.id),
                    sound: 'classic'
                });

                showNotification('DSA Alarm Set', {
                    body: `We've automatically set an alarm for you tomorrow at 7 AM. Keep the streak going!`,
                    data: { url: `/` }
                });
            }
        }
        
        localStorage.setItem(LAST_AUTO_ALARM_CHECK_KEY, Date.now().toString());
    };
    
    const dailyCheckInterval = setInterval(autoSetNextDayAlarm, 1000 * 60);
    autoSetNextDayAlarm(); 

    return () => clearInterval(dailyCheckInterval);

  }, [alarms, progress, addOrUpdateAlarm]);

    const handleSnooze = (alarmId: string) => {
        snoozeAlarm(alarmId);
        showNotification('Alarm Snoozed', {
            body: `Your alarm will ring again in 2 minutes.`,
            data: { url: `/` },
        });
        router.push('/');
    };

  return null;
}
