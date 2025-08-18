// In a real application with a backend, you would make an API call 
// to your server here. The server would then use the stored FCM token to
// send a push notification via Firebase Cloud Messaging.

// Since this is a client-only demo, we will simulate the notification locally
// using the browser's Notification API, which only works when the browser tab is open.
// The service worker will handle notifications when the tab is closed.

export const showNotification = async (title: string, options: NotificationOptions) => {
    // Check if the Notification API is available and permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        
        // This is a simulation for foreground notifications.
        // The service worker handles background notifications.
        try {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification(title, {
                ...options,
                icon: '/icon.png',
                badge: '/icon.png',
            });
        } catch (error) {
            console.error('Error showing notification via Service Worker:', error);
            // Fallback to basic notification if SW fails
            new Notification(title, {
                ...options,
                icon: '/icon.png',
            });
        }
    } else {
        console.warn('Notifications are not permitted or not supported in this browser.');
    }
};
