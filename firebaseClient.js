// חיבור Firebase משותף לכל דפי האתר.
const firebaseConfig = {
  apiKey: "AIzaSyD8jhBcx3fel2fMN2r9E8OILfNzrr8QfDk",
  authDomain: "yeshiva-afula.firebaseapp.com",
  projectId: "yeshiva-afula",
  storageBucket: "yeshiva-afula.firebasestorage.app",
  messagingSenderId: "605642764867",
  appId: "1:605642764867:web:ce6d81552434d2f6cb5af6",
  measurementId: "G-TJ55PDJF9F"
};

// חשוב: משתמשים רק ב-SDK מסוג compat (התואם לתגי ה-<script> שנטענים ב-HTML).
// אין להוסיף כאן initializeApp()/getAnalytics() מהסגנון המודרני (v9+ מודולים) —
// זה יזרוק ReferenceError ויעצור את כל שאר הקובץ מלרוץ (כולל auth/db).
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- הגדרת כל ההרשאות האפשריות במערכת ---
const ALL_PERMISSIONS = [
  { key: 'view_all_classes',     label: 'צפייה בכל הכיתות והטיולים (לא רק כיתה משויכת)' },
  { key: 'manage_class_roster',  label: 'ניהול תלמידי הכיתה המשויכת (הוספה/עריכה/מחיקה)' },
  { key: 'create_trips',         label: 'יצירת טיולים חדשים' },
  { key: 'edit_trip_details',    label: 'עריכת פרטי טיולים קיימים' },
  { key: 'manage_classes',       label: 'ניהול כיתות (הוספה/עריכה)' },
  { key: 'delete_classes',       label: 'מחיקת כיתות' },
  { key: 'manage_announcements', label: 'ניהול עדכוני האתר הציבורי' },
  { key: 'manage_users',         label: 'ניהול משתמשים (יצירה/עריכה/הרשאות)' },
  { key: 'manage_events',        label: 'ניהול לוח אירועים ופרוטוקולי ישיבות צוות' },
  { key: 'manage_payments',      label: 'ניהול תשלומי טיולים' },
  { key: 'manage_staff_announcements', label: 'ניהול הודעות עדכון למורים (במסך הראשי)' },
];

// --- תפקידים קבועים והרשאות ברירת מחדל לכל אחד מהם ---
// "מותאם אישית" (custom) לא מופיע כאן בכוונה — הוא פותח את הצ'קבוכים לעריכה חופשית.
// "ראש הישיבה" ו"מזכירה" מקבלים את כל ההרשאות, כולל ניהול תשלומים —
// כך שגם ראש הישיבה חשוף לתשלומים וגם למזכירה יש את כל מה שיש לראש הישיבה.
const ROLE_PRESETS = {
  'מחנך':        { manage_class_roster:true, create_trips:true, edit_trip_details:true },
  'ראש הישיבה':  Object.fromEntries(ALL_PERMISSIONS.map(p=>[p.key, true])),
  'רכז חברתי':   { view_all_classes:true, create_trips:true, edit_trip_details:true, manage_announcements:true, manage_events:true },
  'מורה מקצועי': {},
  'מזכירה':      Object.fromEntries(ALL_PERMISSIONS.map(p=>[p.key, true])),
};

async function createStaffAccountKeepingSession(email, tempPassword){
  const secondaryApp = firebase.initializeApp(firebaseConfig, 'Secondary-' + Date.now());
  try{
    const cred = await secondaryApp.auth().createUserWithEmailAndPassword(email, tempPassword);
    await secondaryApp.auth().signOut();
    return cred.user.uid;
  } finally {
    await secondaryApp.delete();
  }
}
/* סיסמה זמנית קצרה וקריאה — בלי תווים מבלבלים (0/O, 1/I/L) כדי שיהיה נוח להקליד מהטלפון */
function genTempPassword(){
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let pass = '';
  for (let i = 0; i < 6; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}
function genToken(){
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
