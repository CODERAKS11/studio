"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAlarmStore } from '@/hooks/useAlarmStore';
import { useNotificationStore } from '@/hooks/useNotificationStore';

export function AlarmManager() {
  const { alarm, activateAlarm } = useAlarmStore();
  const { notificationPermission } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAlarm = () => {
      if (alarm.isActive || alarm.questionIds.length < 3) {
        return;
      }

      const now = new Date();
      if (alarm.snoozeUntil && now.getTime() < alarm.snoozeUntil) {
          return;
      }
      
      const [hours, minutes] = alarm.alarmTime.split(':').map(Number);
      
      const lastActivationStorage = localStorage.getItem('dsa-alarm-last-activation');
      const todayStr = new Date().toISOString().split('T')[0];

      if(lastActivationStorage === todayStr) {
        return;
      }

      const alarmDate = new Date();
      alarmDate.setHours(hours, minutes, 0, 0);

      if (now >= alarmDate) {
         localStorage.setItem('dsa-alarm-last-activation', todayStr);
         activateAlarm();
         
         if (notificationPermission === 'granted') {
           new Notification('DSA Wake-Up!', {
             body: 'Time to solve your daily DSA problems.',
             icon: '/icon.png',
           });
         }
         router.push('/alarm/active');
      }
    };

    const interval = setInterval(checkAlarm, 1000 * 30);
    checkAlarm();

    return () => clearInterval(interval);
  }, [alarm, router, activateAlarm, notificationPermission]);

  return null;
}
