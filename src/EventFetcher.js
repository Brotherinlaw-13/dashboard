// Eventos de todos los calendarios vía /api/calendar (iCal leído en el servidor).
const CALENDAR_COLORS = ["#33658A", "#86BBD8", "#2F4858", "#F6AE2D", "#F26419"];

export async function fetchAllEvents() {
  try {
    const r = await fetch('/api/calendar');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (data.errors?.length) console.error('[EventFetcher] Calendarios con error:', data.errors);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const events = (data.events || []).map(e => {
      const parse = s => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? (([y, m, d]) => new Date(y, m - 1, d))(s.split('-').map(Number)) : new Date(s));
      const start = parse(e.start);
      const end = e.end ? parse(e.end) : null;
      return {
        title: e.title || 'Evento sin título',
        start, end,
        allDay: e.allDay,
        location: e.location,
        calendarId: e.calendar,
        color: CALENDAR_COLORS[e.index % CALENDAR_COLORS.length],
        isOngoing: start <= now && (end ? end >= now : false),
      };
    }).filter(e => (e.end || e.start) >= todayStart);
    const ongoing = events.filter(e => e.isOngoing);
    const rest = events.filter(e => !e.isOngoing).sort((a, b) => a.start - b.start);
    return [...ongoing, ...rest];
  } catch (err) {
    console.error('[EventFetcher] Failed to fetch events', err);
    return [];
  }
}
