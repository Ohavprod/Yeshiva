// Service Worker — מאפשר "התקנה" של האתר כאפליקציה (PWA),
// וגם מטפל בהתראות פוש שמגיעות כשהאתר סגור לגמרי (Firebase Cloud Messaging).

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());
self.addEventListener('fetch', () => {}); // pass-through, no caching

// ---- Firebase Cloud Messaging (התראות ברקע) ----
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD8jhBcx3fel2fMN2r9E8OILfNzrr8QfDk",
  authDomain: "yeshiva-afula.firebaseapp.com",
  projectId: "yeshiva-afula",
  storageBucket: "yeshiva-afula.firebasestorage.app",
  messagingSenderId: "605642764867",
  appId: "1:605642764867:web:ce6d81552434d2f6cb5af6",
});

const messaging = firebase.messaging();

// כשההתראה מגיעה בזמן שהאתר/PWA סגור לגמרי — מציגים אותה כהתראת מערכת רגילה.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'עדכון חדש';
  const body = payload.notification?.body || '';
  self.registration.showNotification(title, {
    body,
    icon: 'assets/img/icon-192.png',
  });
});
