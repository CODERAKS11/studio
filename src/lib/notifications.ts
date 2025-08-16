export const showNotification = async (title: string, options: NotificationOptions) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        
        // Fallback for browsers that don't support push but support notifications
        if ('Notification' in window && Notification.permission === 'granted') {
             new Notification(title, {
                ...options,
                icon: '/icon.png',
             });
        }
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        // Instead of showing notification directly, we simulate a push event.
        // In a real app, this would come from a server.
        // For this app's purpose, we can use the broadcast channel to tell the SW to show a notification.
        if ('active' in registration && registration.active) {
            // A real app would send a push subscription to a server,
            // which would then send a push message. For this simulation,
            // we'll just ask the service worker to show the notification directly.
            // This is a simplified approach for demonstration.
            await registration.showNotification(title, {
                ...options,
                icon: '/icon.png',
                badge: '/icon.png',
            });
        }
    } catch (error) {
        console.error('Error showing notification:', error);
    }
};