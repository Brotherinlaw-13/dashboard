// Junta varios calendarios iCal (colegio, Google con dirección secreta...) desde el servidor.
// ICS_CALENDARS = [{"name":"Familia Pichones","url":"https://..."}, ...]. Las URLs nunca llegan al navegador.
import ical from 'node-ical';

const val = v => (v && typeof v === 'object' && 'val' in v ? v.val : v);
const dayKey = d => new Date(d).toISOString().slice(0, 10);

export default async function handler(req, res) {
  let cals = [];
  try { cals = JSON.parse(process.env.ICS_CALENDARS || '[]'); } catch { cals = []; }
  const now = new Date();
  const from = new Date(now.getTime() - 2 * 864e5);
  const to = new Date(now.getTime() + 90 * 864e5);
  const events = [];
  const errors = [];

  await Promise.all(cals.map(async (cal, index) => {
    try {
      const url = cal.url.replace(/^webcal:/i, 'https:');
      const r = await fetch(url, { headers: { 'User-Agent': 'pichones-dashboard' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = ical.sync.parseICS(await r.text());
      for (const ev of Object.values(data)) {
        if (ev.type !== 'VEVENT' || !ev.start || ev.status === 'CANCELLED') continue;
        const start0 = new Date(ev.start);
        const dur = (ev.end ? new Date(ev.end) : start0) - start0;
        const allDay = ev.datetype === 'date';
        const push = (s, src = ev) => {
          const st = new Date(src.start && src !== ev ? src.start : s);
          const en = src !== ev && src.end ? new Date(src.end) : new Date(st.getTime() + dur);
          if (en < from || st > to) return;
          const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          events.push({ title: val(src.summary) || 'Evento sin título', start: allDay ? ymd(st) : st.toISOString(), end: allDay ? ymd(en) : en.toISOString(),
            allDay, location: val(src.location) || null, calendar: cal.name, index });
        };
        if (ev.rrule) {
          const ex = ev.exdate || {};
          for (const d of ev.rrule.between(from, to, true)) {
            const k = dayKey(d);
            if (ex[k]) continue;
            const ov = ev.recurrences && ev.recurrences[k];
            if (ov) { if (ov.status !== 'CANCELLED') push(d, ov); } else push(d);
          }
        } else push(start0);
      }
    } catch (e) {
      errors.push({ calendar: cal.name, error: String(e.message || e) });
    }
  }));

  events.sort((a, b) => a.start.localeCompare(b.start));
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
  res.status(200).json({ calendars: cals.map(c => c.name), events, errors });
}
