// Service Worker מינימלי — מטרתו היחידה היא לאפשר "התקנה" של האתר כאפליקציה
// (הוספה למסך הבית עם אייקון) בדפדפנים שדורשים זאת. אין כאן שמירת מידע אופליין.
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());
self.addEventListener('fetch', () => {}); // pass-through, no caching
