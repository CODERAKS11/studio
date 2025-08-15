
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlarmStore } from '@/hooks/useAlarmStore';
import { useNotificationStore } from '@/hooks/useNotificationStore';

// Store activated alarms to prevent re-triggering on component re-renders
const activatedAlarms = new Set<string>();

export function AlarmManager() {
  const { alarms, activateAlarm } = useAlarmStore();
  const { notificationPermission } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAlarms = () => {
      const now = Date.now();
      
      alarms.forEach(alarm => {
        if (alarm.isActive || activatedAlarms.has(alarm.id) || alarm.questionIds.length === 0) {
          return;
        }

        if (alarm.snoozeUntil && now < alarm.snoozeUntil) {
          return;
        }
        
        if (now >= alarm.alarmDateTime) {
           activatedAlarms.add(alarm.id);
           activateAlarm(alarm.id);
           
           if (notificationPermission === 'granted') {
             new Notification('DSA Wake-Up!', {
               body: 'Time to solve your daily DSA problems.',
               icon: '/icon.png',
             });
           }
           router.push(`/alarm/active?alarmId=${alarm.id}`);
        }
      });
    };

    const interval = setInterval(checkAlarms, 1000 * 10); // Check every 10 seconds
    checkAlarms();

    return () => clearInterval(interval);
  }, [alarms, router, activateAlarm, notificationPermission]);

  return null;
}
