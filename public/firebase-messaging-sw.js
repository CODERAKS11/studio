// Import the Firebase app and messaging services
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker with your project's config
const firebaseConfig = {
    apiKey: "AIzaSyC9oqJ54-YMX8MGCcNjWtEB4OoLC_2tmBs",
    authDomain: "dsa-wake-up.firebaseapp.com",
    projectId: "dsa-wake-up",
    storageBucket: "dsa-wake-up.firebasestorage.app",
    messagingSenderId: "85611582133",
    appId: "1:85611582133:web:65eafc423698e3a34864fc",
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon.png',
    data: payload.data, // This will be the data object from the push notification
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: Add a listener for notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
