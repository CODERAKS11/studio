"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlarmStore } from '@/hooks/useAlarmStore';
import { useNotificationStore } from '@/hooks/useNotificationStore';
import { useDsaProgress } from '@/hooks/useDsaProgress';
import { allQuestions } from '@/lib/dsa';
import { isToday, startOfTomorrow } from 'date-fns';
import { playSound } from '@/lib/audio';

const activatedAlarms = new Set<string>();
const LAST_AUTO_ALARM_CHECK_KEY = 'last-auto-alarm-check';

export function AlarmManager() {
  const { alarms, activateAlarm, addOrUpdateAlarm } = useAlarmStore();
  const { notificationPermission } = useNotificationStore();
  const { progress } = useDsaProgress();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAlarms = () => {
      const now = Date.now();
      
      alarms.forEach(alarm => {
        if (alarm.isActive || alarm.questionIds.length === 0) {
          return;
        }
        
        const hasSnoozeExpired = alarm.snoozeUntil && now >= alarm.snoozeUntil;
        const isInitialAlarmTime = now >= alarm.alarmDateTime && !alarm.snoozeUntil && !activatedAlarms.has(alarm.id);

        if (hasSnoozeExpired || isInitialAlarmTime) {
           if (isInitialAlarmTime) {
             activatedAlarms.add(alarm.id);
           }
           activateAlarm(alarm.id);
           
           if (notificationPermission === 'granted') {
             new Notification('DSA Alarm!', {
               body: 'Time to solve your daily DSA problems.',
               icon: '/icon.png',
             });
           }
           playSound(alarm.sound);
           router.push(`/alarm/active?alarmId=${alarm.id}`);
        }
      });
    };

    const interval = setInterval(checkAlarms, 1000 * 5); // Check every 5 seconds
    checkAlarms();

    return () => clearInterval(interval);
  }, [alarms, router, activateAlarm, notificationPermission]);

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
            
            const nextQuestions = allQuestions.slice(nextQuestionIndex, nextQuestionIndex + 3);

            if (nextQuestions.length > 0) {
                const nextDayAlarmTime = new Date(tomorrow);
                nextDayAlarmTime.setHours(7, 0, 0, 0);

                addOrUpdateAlarm({
                    dateTime: nextDayAlarmTime.getTime(),
                    questions: nextQuestions.map(q => q.id),
                    sound: 'classic'
                });

                if (notificationPermission === 'granted') {
                    new Notification('DSA Alarm', {
                        body: `We've automatically set an alarm for you tomorrow at 7 AM. Keep the streak going!`,
                        icon: '/icon.png',
                    });
                }
            }
        }
        
        localStorage.setItem(LAST_AUTO_ALARM_CHECK_KEY, Date.now().toString());
    };
    
    const dailyCheckInterval = setInterval(autoSetNextDayAlarm, 1000 * 60);
    autoSetNextDayAlarm(); 

    return () => clearInterval(dailyCheckInterval);

  }, [alarms, progress, addOrUpdateAlarm, notificationPermission]);

  return null;
}
