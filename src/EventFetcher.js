// Google Calendar API fetcher using API key and calendar ID from .env.local
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

function parseGoogleEvent(event) {
  return {
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date),
    end: event.end ? new Date(event.end.dateTime || event.end.date) : null,
    calendarName: event.organizer && event.organizer.displayName ? event.organizer.displayName : 'Google Calendar',
    color: '#4285F4', // Default Google blue, or you can add color logic
  };
}

export async function fetchAllEvents() {
  const nowISO = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&singleEvents=true&orderBy=startTime&timeMin=${nowISO}`;
  try {
    console.log('[EventFetcher] Fetching:', url);
    const response = await fetch(url);
    console.log('[EventFetcher] Response status:', response.status);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log('[EventFetcher] API data:', data);
    if (!data.items) {
      console.log('[EventFetcher] No items in API response');
      return [];
    }
    const allEvents = data.items.map(parseGoogleEvent);
    console.log('[EventFetcher] Parsed events:', allEvents);
    const now = new Date();
    // Only future or ongoing events
    const upcoming = allEvents.filter(e => e.end ? e.end >= now : e.start >= now);
    console.log('[EventFetcher] Upcoming events:', upcoming);
    // Sort: ongoing (now between start and end) first, then by start time
    const ongoing = upcoming.filter(e => e.start <= now && (e.end ? e.end >= now : false));
    const future = upcoming.filter(e => !(e.start <= now && (e.end ? e.end >= now : false)));
    future.sort((a, b) => a.start - b.start);
    // Pin ongoing events to top
    const sorted = [...ongoing, ...future].slice(0, 10);
    console.log('[EventFetcher] Sorted events:', sorted);
    return sorted.map(e => ({
      ...e,
      isOngoing: e.start <= now && (e.end ? e.end >= now : false),
    }));
  } catch (err) {
    console.error('Failed to fetch Google Calendar events', err);
    return [];
  }
} 