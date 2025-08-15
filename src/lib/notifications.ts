export const showNotification = async (title: string, options: NotificationOptions) => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
            ...options,
            icon: '/icon.png',
        });
    } catch (error) {
        console.error('Error showing notification:', error);
    }
};
