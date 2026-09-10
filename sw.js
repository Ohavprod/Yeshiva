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
// חשוב: ה-Apps Script שולח payload מסוג "data" בלבד (לא "notification") בכוונה —
// כך שהדפדפן לא מציג שום דבר אוטומטית מעצמו, וההצגה היחידה היא זו שאנחנו יוזמים
// כאן. זה מה שפתר את בעיית "שתי התראות על כל דבר" (אחת אוטומטית של הדפדפן בלי
// אייקון, ואחת שלנו עם אייקון אבל בלי טיפול בקליק).
messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || 'עדכון חדש';
  const body = data.body || '';
  const clickUrl = data.click_url || self.registration.scope;
  self.registration.showNotification(title, {
    body,
    icon: '/assets/img/icon-192.png',
    badge: '/assets/img/badge-192.png',
    data: { url: clickUrl },
  });
});

// טיפול בלחיצה על ההתראה: מתמקדים בטאב קיים של האתר אם יש כזה פתוח, אחרת פותחים חדש.
// בלי המאזין הזה, ללחוץ על ההתראה שיצרנו ידנית למעלה לא היה עושה שום דבר.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find(w => w.url.includes(new URL(url).pathname));
      if (existing) return existing.focus();
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
