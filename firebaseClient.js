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
  { key: 'manage_trip_types',    label: 'ניהול סוגי טיולים' },
  { key: 'delete_trip_types',    label: 'מחיקת סוגי טיולים' },
  { key: 'manage_classes',       label: 'ניהול כיתות (הוספה/עריכה)' },
  { key: 'delete_classes',       label: 'מחיקת כיתות' },
  { key: 'manage_announcements', label: 'ניהול עדכוני האתר הציבורי' },
  { key: 'manage_users',         label: 'ניהול משתמשים (יצירה/עריכה/הרשאות)' },
];

// --- תפקידים קבועים והרשאות ברירת מחדל לכל אחד מהם ---
// "מותאם אישית" (custom) לא מופיע כאן בכוונה — הוא פותח את הצ'קבוקסים לעריכה חופשית.
const ROLE_PRESETS = {
  'מחנך':        { manage_class_roster:true, create_trips:true, edit_trip_details:true },
  'ראש הישיבה':  { view_all_classes:true, manage_announcements:true, create_trips:true, edit_trip_details:true, manage_trip_types:true, manage_classes:true },
  'רכז חברתי':   { view_all_classes:true, create_trips:true, edit_trip_details:true, manage_trip_types:true, manage_announcements:true },
  'מורה מקצועי': {},
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
function genTempPassword(){
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(2, 6).toUpperCase() + '!1';
}
function genToken(){
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
