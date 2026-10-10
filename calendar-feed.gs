/* ============================================================
   חיבור יומן הגוגל של הישיבה למערכת (לשונית "יומן")
   ------------------------------------------------------------
   הקובץ הזה לא רץ באתר — מעתיקים אותו לפרויקט Apps Script חדש:

   1. https://script.google.com → New project → מדביקים את כל הקובץ במקום הקוד הקיים
   2. ממלאים למטה את CALENDAR_ID (Google Calendar → הגדרות היומן של הישיבה → "מזהה יומן")
      ואת FEED_KEY (מחרוזת סודית כלשהי, אותיות ומספרים)
   3. Deploy → New deployment → סוג: Web app
        Execute as: Me   |   Who has access: Anyone
      → Deploy → מאשרים הרשאות → מעתיקים את ה-URL שמסתיים ב-/exec
   4. במערכת: לשונית "יומן" → "הגדרות חיבור" (מנהל מערכת בלבד) → מדביקים:
        כתובת: ה-URL מסעיף 3
        מפתח: אותו FEED_KEY
        מזהה יומן: אותו CALENDAR_ID (לתצוגת היומן המוטמע)

   החשבון שמפעיל את הסקריפט צריך לראות את יומן הישיבה (בעלים או שותף).
   הסקריפט רק קורא אירועים — הוא לא משנה ולא מוחק כלום ביומן.
   ============================================================ */

const CALENDAR_ID = 'PASTE_CALENDAR_ID_HERE';
const FEED_KEY = 'PASTE_SECRET_KEY_HERE';

function doGet(e){
  const p = (e && e.parameter) || {};
  if (FEED_KEY && p.key !== FEED_KEY) return json_({ error: 'unauthorized' });

  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!cal) return json_({ error: 'calendar_not_found' });
  const tz = cal.getTimeZone() || 'Asia/Jerusalem';

  const from = p.from ? new Date(p.from + 'T00:00:00') : new Date();
  const to = p.to ? new Date(p.to + 'T23:59:59') : new Date(from.getTime() + 120 * 864e5);

  const fmt = (d, f) => Utilities.formatDate(d, tz, f);
  const events = cal.getEvents(from, to).map(ev => {
    const allDay = ev.isAllDayEvent();
    const start = ev.getStartTime();
    let end = ev.getEndTime();
    // באירוע של יום שלם, תאריך הסיום בגוגל הוא היום שאחרי (לא כולל) — מחזירים את היום האחרון בפועל
    if (allDay) end = new Date(end.getTime() - 864e5);
    return {
      // אירוע חוזר מקבל אותו getId() בכל מופע — מוסיפים את תאריך המופע כדי שכל מופע יהיה ייחודי
      id: ev.getId() + '|' + fmt(start, 'yyyy-MM-dd'),
      title: ev.getTitle() || '',
      description: ev.getDescription() || '',
      location: ev.getLocation() || '',
      all_day: allDay,
      start_date: fmt(start, 'yyyy-MM-dd'),
      start_time: allDay ? '' : fmt(start, 'HH:mm'),
      end_date: fmt(end, 'yyyy-MM-dd'),
      end_time: allDay ? '' : fmt(end, 'HH:mm'),
    };
  });
  return json_({ events: events });
}

function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
