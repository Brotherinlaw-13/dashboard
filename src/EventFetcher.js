// Google Calendar API fetcher using API key and multiple calendar IDs from .env.local
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_IDS_RAW = import.meta.env.VITE_GOOGLE_CALENDAR_IDS;
const CALENDAR_IDS = JSON.parse(CALENDAR_IDS_RAW || '[]');

console.log('[EventFetcher] Your calendar IDs:', CALENDAR_IDS);

// Color palette for calendars (in order) - sophisticated colors
const CALENDAR_COLORS = [
  "#33658A", // Lapis Lazuli
  "#86BBD8", // Carolina blue
  "#2F4858", // Charcoal
  "#F6AE2D", // Hunyadi yellow
  "#F26419", // Orange Pantone
];

function getCalendarColor(calendarId) {
  // Find the index of this calendar in the array
  const index = CALENDAR_IDS.indexOf(calendarId);
  const color = CALENDAR_COLORS[index] || CALENDAR_COLORS[0];
  console.log(`[EventFetcher] Calendar ${calendarId} (index ${index}) gets color: ${color}`);
  return color;
}

function parseGoogleEvent(event, calendarId) {
  return {
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date),
    end: event.end ? new Date(event.end.dateTime || event.end.date) : null,
    calendarId,
    color: getCalendarColor(calendarId),
  };
}

async function fetchCalendarEvents(calendarId) {
  const nowISO = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${API_KEY}&singleEvents=true&orderBy=startTime&timeMin=${nowISO}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[EventFetcher] Failed to fetch calendar ${calendarId}:`, response.status);
      return [];
    }
    const data = await response.json();
    if (!data.items) return [];
    return data.items.map(event => parseGoogleEvent(event, calendarId));
  } catch (err) {
    console.error(`[EventFetcher] Failed to fetch calendar ${calendarId}:`, err);
    return [];
  }
}

export async function fetchAllEvents() {
  if (!CALENDAR_IDS || CALENDAR_IDS.length === 0) {
    return [];
  }
  try {
    // Fetch events from all calendars in parallel
    const allCalendarEvents = await Promise.all(
      CALENDAR_IDS.map(calendarId => fetchCalendarEvents(calendarId))
    );
    // Combine all events from all calendars
    const allEvents = allCalendarEvents.flat();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Mantén los eventos que aún no han finalizado antes de hoy
    const relevant = allEvents.filter(e => {
      if (e.end) {
        return e.end >= todayStart; // El evento ocurre hoy o en el futuro
      }
      // Si no hay fecha de fin explícita, usa la fecha de inicio
      return e.start >= todayStart;
    });

    // Marca los eventos en curso
    const enriched = relevant.map(e => ({
      ...e,
      isOngoing: e.start <= now && (e.end ? e.end >= now : false),
    }));

    // Ordena: primero los eventos en curso y luego por hora de inicio
    const ongoing = enriched.filter(e => e.isOngoing);
    const rest = enriched.filter(e => !e.isOngoing).sort((a, b) => a.start - b.start);

    return [...ongoing, ...rest];
  } catch (err) {
    console.error('Failed to fetch Google Calendar events', err);
    return [];
  }
} 