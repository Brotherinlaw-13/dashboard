import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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

function isToday(date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function EventItem({ event }) {
  return (
    <div className="event-item compact">
      <span
        className="event-accent"
        style={{ background: event.color }}
      />
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

function TodayEvents({ events, onHeightChange }) {
  const todayEvents = events.filter(event => isToday(event.start));
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (containerRef.current && onHeightChange) {
      const height = containerRef.current.offsetHeight;
      onHeightChange(height);
    }
  }, [todayEvents, onHeightChange]);
  
  return (
    <div className="today-dashboard" ref={containerRef}>
      <h1 className="today-title">Hoy</h1>
      {todayEvents.length === 0 ? (
        <div className="today-placeholder">No hay eventos hoy</div>
      ) : (
        <div className="today-event-list">
          {todayEvents.map((event, i) => (
            <EventItem event={event} key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarModal({ isOpen, onClose, events, selectedDate }) {
  if (!isOpen) return null;

  const dayEvents = events.filter(event => isSameDay(event.start, selectedDate));
  const dateString = selectedDate.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{capitalize(dateString)}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {dayEvents.length === 0 ? (
            <div className="modal-no-events">No hay eventos este día</div>
          ) : (
            <div className="modal-events">
              {dayEvents.map((event, i) => (
                <div key={i} className="modal-event-item">
                  <span
                    className="modal-event-accent"
                    style={{ background: event.color }}
                  />
                  <div className="modal-event-content">
                    <div className="modal-event-time">
                      {formatTime(event.start)}
                      {event.end && (
                        <span> - {formatTime(event.end)}</span>
                      )}
                    </div>
                    <div className="modal-event-title">{event.title}</div>
                    {event.isOngoing && <span className="modal-event-now">Ahora</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthlyCalendar({ events, hoyHeight, onModalOpen }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayEvents = events.filter(event => isSameDay(event.start, date));
    const today = new Date();
    
    // Check if date is in the past
    const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Get the calendar color for events on this day
    let eventColor = null;
    if (dayEvents.length > 0) {
      eventColor = dayEvents[0].color; // Use the first event's calendar color
    }
    
    calendarDays.push({
      date,
      day,
      hasEvents: dayEvents.length > 0,
      isToday: isToday(date),
      isPast,
      eventColor
    });
  }

  const handleDayClick = (dayData) => {
    console.log('Day clicked:', dayData);
    if (dayData && dayData.hasEvents) {
      console.log('Opening modal for date:', dayData.date);
      onModalOpen(dayData.date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div 
      className="calendar-dashboard"
      style={{ 
        top: hoyHeight ? `${hoyHeight + 40}px` : '200px'
      }}
    >
      <div className="calendar-header">
        <button className="calendar-nav" onClick={goToPreviousMonth}>‹</button>
        <h2 className="calendar-title">{monthNames[month]} {year}</h2>
        <button className="calendar-nav" onClick={goToNextMonth}>›</button>
      </div>
      
      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        
        {calendarDays.map((dayData, index) => (
          <div
            key={index}
            className={`calendar-day ${dayData ? 'has-content' : 'empty'} ${dayData?.isToday ? 'today' : ''} ${dayData?.hasEvents ? 'has-events' : ''} ${dayData?.isPast ? 'past' : ''}`}
            onClick={() => handleDayClick(dayData)}
          >
            {dayData && (
              <span 
                className="day-number"
                style={{ 
                  color: dayData.hasEvents ? dayData.eventColor : '#111',
                  fontWeight: dayData.hasEvents ? 'bold' : 'normal'
                }}
              >
                {dayData.day}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoyHeight, setHoyHeight] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  async function loadEvents() {
    setLoading(true);
    const evs = await fetchAllEvents();
    setEvents(evs);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="dashboard">
        <h1 className="dashboard-title">Futuros eventos</h1>
        {loading ? (
          <div className="placeholder">Cargando...</div>
        ) : events.length === 0 ? (
          <div className="placeholder">No hay eventos próximos</div>
        ) : (
          <div className="event-list">
            {events
              .filter(event => !isToday(event.start))
              .filter(event => !event.title.toLowerCase().includes('basura'))
              .slice(0, 11)
              .map((event, i) => (
                <EventItem event={event} key={i} />
              ))}
          </div>
        )}
      </div>
      
      <TodayEvents events={events} onHeightChange={setHoyHeight} />
      
      <MonthlyCalendar 
        events={events} 
        hoyHeight={hoyHeight}
        onModalOpen={(date) => {
          setSelectedDate(date);
          setIsModalOpen(true);
        }}
      />

      {isModalOpen && createPortal(
        <CalendarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          events={events}
          selectedDate={selectedDate}
        />,
        document.body
      )}
    </>
  );
}

export default App;
