import { useEffect, useState } from 'react';
import { fetchAllEvents } from './EventFetcher';
import './App.css';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
  const opts = { weekday: 'long', month: 'long', day: 'numeric' };
  const parts = date.toLocaleDateString('es-ES', opts).split(',');
  // Capitaliza el nombre del día
  if (parts.length > 1) {
    return capitalize(parts[0].trim()) + ',' + parts.slice(1).join(',');
  }
  return capitalize(date.toLocaleDateString('es-ES', opts));
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function EventItem({ event }) {
  return (
    <div className="event-item compact">
      <span className="event-color" style={{ background: event.color }} />
      <div className="event-details compact-details">
        <div className="event-title-date-row">
          <span className="event-title compact-title">{event.title}</span>
          <span className="event-date compact-date">
            {formatDate(event.start)}{' '}
            {formatTime(event.start)}
            {event.end && event.end.toDateString() === event.start.toDateString() && (
              <span> - {formatTime(event.end)}</span>
            )}
          </span>
        </div>
        <div className="event-time-row">
          {event.isOngoing && <span className="event-now compact-now">Ahora</span>}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    setLoading(true);
    const evs = await fetchAllEvents();
    setEvents(evs);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 10 * 60 * 1000); // every 10 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <h1>Futuros eventos</h1>
      {loading ? (
        <div className="placeholder">Cargando...</div>
      ) : events.length === 0 ? (
        <div className="placeholder">No hay eventos próximos</div>
      ) : (
        <div className="event-list">
          {events.map((event, i) => (
            <EventItem event={event} key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
