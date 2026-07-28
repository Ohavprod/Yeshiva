// חיבור Supabase משותף לכל דפי האתר.
// המפתח כאן הוא מפתח "anon" ציבורי — מיועד לרוץ בדפדפן, וההרשאות עצמן
// נאכפות בצד השרת דרך Row Level Security (ר' התיעוד הפרויקטלי).
const SUPABASE_URL = "https://mydtpagnkhfnxqqyudnl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15ZHRwYWdua2hmbnhxcXl1ZG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjE3MTIsImV4cCI6MjA5OTUzNzcxMn0.91ZugJRSM8YzE2B2VhCo2ZqB0wSKjJRXgQSS3mWKLK4";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
