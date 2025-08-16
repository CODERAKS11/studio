"use client"

import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './use-local-storage';
import { requestNotificationPermission as requestFirebaseNotificationPermission } from '@/lib/firebase';

export function useNotificationStore() {
    const [notificationPermission, setNotificationPermission] = useLocalStorage<NotificationPermission>('notification-permission', 'default');
    
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const requestNotificationPermission = useCallback(async () => {
        const permission = await requestFirebaseNotificationPermission();
        setNotificationPermission(permission);
    }, [setNotificationPermission]);

    return { notificationPermission, requestNotificationPermission, setNotificationPermission };
}