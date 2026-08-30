// חיבור Firebase משותף לכל דפי האתר (מחליף את supabaseClient.js הישן).
//
// ⚠️ לפני שהאתר יעבוד יש להחליף את הערכים למטה בערכים האמיתיים של הפרויקט שלך:
// Firebase Console → ⚙️ Project settings → Your apps → (אם אין אפליקציית Web, ליצור אחת) → SDK setup and configuration
//
// שימו לב: apiKey כאן הוא ציבורי בכוונה (בדיוק כמו ה-anon key שהיה ב-Supabase) —
// האבטחה האמיתית נאכפת בצד השרת דרך Firestore Security Rules (ר' firestore.rules).
const firebaseConfig = {
  apiKey: "AIzaSyD8jhBcx3fel2fMN2r9E8OILfNzrr8QfDk",
  authDomain: "yeshiva-afula.firebaseapp.com",
  projectId: "yeshiva-afula",
  storageBucket: "yeshiva-afula.firebasestorage.app",
  messagingSenderId: "605642764867",
  appId: "1:605642764867:web:ce6d81552434d2f6cb5af6",
  measurementId: "G-TJ55PDJF9F"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(users);

// --- הגדרת ברירת המחדל של כל ההרשאות האפשריות במערכת ---
// כל תפקיד הוא בסך הכל שם חופשי + מפה של ההרשאות האלו שסומנו לו ב-checkboxes.
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

// יצירת חשבון צוות חדש בלי לנתק את הסשן של המנהל המחובר.
// עובד על ידי הפעלת מופע Firebase שני וזמני, ומחיקתו מיד לאחר מכן.
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
  // מזהה קישור אישור ציבורי — מספיק ארוך וקשה לניחוש (128 סיביות).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
}
