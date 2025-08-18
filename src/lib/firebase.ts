"use client";

import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyC9oqJ54-YMX8MGCcNjWtEB4OoLC_2tmBs",
    authDomain: "dsa-wake-up.firebaseapp.com",
    projectId: "dsa-wake-up",
    storageBucket: "dsa-wake-up.firebasestorage.app",
    messagingSenderId: "85611582133",
    appId: "1:85611582133:web:65eafc423698e3a34864fc",
};

// This is a public key, safe to expose.
const VAPID_KEY = "BAlb_hY8ZfYRB-zk_2j_Izo2Cb6i-P22aYyL9nQLT5vG0mJ5zY_n1-1X9_5K8CgW8jXl8sM6t-W_v7nZ_jX_f9Y";

const initializeFirebaseApp = () => {
  if (typeof window !== 'undefined' && !getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

export const initializeFirebaseMessaging = () => {
    const app = initializeFirebaseApp();
    
    if (typeof window !== 'undefined' && app) {
        const messaging = getMessaging(app);
        
        onMessage(messaging, (payload) => {
            console.log('Foreground message received. ', payload);
            const notificationTitle = payload.notification?.title || "New Message";
            const notificationOptions = {
                body: payload.notification?.body || "",
                icon: payload.notification?.icon || "/icon.png",
                data: payload.data
            };

            // Show notification using the browser's Notification API
            const notification = new Notification(notificationTitle, notificationOptions);
            
            // Handle notification click
            notification.onclick = (event) => {
                event.preventDefault(); 
                if (payload.data?.url && typeof clients !== 'undefined') {
                    clients.openWindow(payload.data.url);
                }
                notification.close();
            };
        });
        return messaging;
    }
    return null;
};

export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  
  const permission = Notification.permission;
  if (permission === 'granted') {
    await getAndLogToken();
    return 'granted';
  }

  if (permission === 'denied') {
    return 'denied';
  }
  
  const newPermission = await Notification.requestPermission();
  if (newPermission === 'granted') {
    await getAndLogToken();
  }
  
  return newPermission;
};

const getAndLogToken = async () => {
    const app = initializeFirebaseApp();
    if (app && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            const messaging = getMessaging(app);
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            
            const fcmToken = await getToken(messaging, { 
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (fcmToken) {
                console.log('FCM Token:', fcmToken);
                // In a real app, you would send this token to your server.
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token. ', err);
        }
    }
};
