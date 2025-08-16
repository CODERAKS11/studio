"use client"

import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './use-local-storage';

export function useNotificationStore() {
    const [notificationPermission, setNotificationPermission] = useLocalStorage<NotificationPermission>('notification-permission', 'default');
    
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const requestNotificationPermission = useCallback(async () => {
        // This function is now a placeholder, actual permission request is handled by firebase.ts
        // We keep this structure to avoid breaking components that use it.
        // The permission state will be updated via the Dashboard component.
        console.log("Requesting notification permission via store (placeholder)...");
    }, []);

    return { notificationPermission, requestNotificationPermission, setNotificationPermission };
}
