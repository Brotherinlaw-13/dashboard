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
  const isBasura = event.title.toLowerCase().includes('basura');
  return (
    <div className="event-item compact">
      <span
        className="event-accent"
        style={{ background: isBasura ? '#4CAF50' : event.color }}
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
  const todayEvents = events.filter(event => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const eventEnd = event.end || event.start;

    // Incluye el evento si se solapa con el día de hoy
    return event.start < endOfDay && eventEnd >= startOfDay;
  }).sort((a, b) => a.start - b.start);
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

function WeatherModal({ isOpen, onClose, weatherData, selectedPeriod }) {
  const [activeTab, setActiveTab] = useState('temperature');
  
  if (!isOpen || !weatherData) return null;

  const periodNames = {
    'Mañana': 'Mañana (6:00 - 11:00)',
    'Mediodía': 'Mediodía (12:00 - 17:00)',
    'Tarde': 'Tarde (18:00 - 21:00)',
    'Noche': 'Noche (22:00 - 5:00)'
  };

  const title = selectedPeriod ? periodNames[selectedPeriod] : 'Clima de hoy';

  // Mock data for precipitation and wind (in a real app, this would come from the API)
  const precipitationData = weatherData.map((hour, index) => ({
    ...hour,
    precipitation: Math.floor(Math.random() * 40) + 10, // 10-50%
    wind: Math.floor(Math.random() * 15) + 5 // 5-20 km/h
  }));

  const renderTemperatureChart = () => {
    // Filter data to show every 3 hours
    const filteredData = weatherData.filter((_, index) => index % 3 === 0);
    const times = filteredData.map(hour => 
      hour.time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    );
    const temperatures = filteredData.map(hour => hour.temperature);
    
    return (
      <div className="weather-chart-container">
        <div className="weather-chart">
          <svg width="100%" height="200" viewBox="0 0 700 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={40 + i * 40}
                x2="700"
                y2={40 + i * 40}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            ))}
            
            {/* Temperature line */}
            <polyline
              points={temperatures.map((temp, i) => {
                const x = 50 + (i * 600) / (temperatures.length - 1);
                const y = 180 - ((temp - Math.min(...temperatures)) / (Math.max(...temperatures) - Math.min(...temperatures))) * 120;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#F6AE2D"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Temperature points */}
            {temperatures.map((temp, i) => {
              const x = 50 + (i * 600) / (temperatures.length - 1);
              const y = 180 - ((temp - Math.min(...temperatures)) / (Math.max(...temperatures) - Math.min(...temperatures))) * 120;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="#F6AE2D" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#333">
                    {temp}°
                  </text>
                </g>
              );
            })}
            
            {/* Time labels */}
            {times.map((time, i) => {
              const x = 50 + (i * 600) / (times.length - 1);
              return (
                <text key={i} x={x} y="195" textAnchor="middle" fontSize="10" fill="#666">
                  {time}
                </text>
              );
            })}
          </svg>
        </div>
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Máxima:</span>
            <span className="summary-value">{Math.max(...temperatures)}°C</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Mínima:</span>
            <span className="summary-value">{Math.min(...temperatures)}°C</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Promedio:</span>
            <span className="summary-value">{Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length)}°C</span>
          </div>
        </div>
      </div>
    );
  };

  const renderPrecipitationChart = () => {
    // Filter data to show every 3 hours
    const filteredData = precipitationData.filter((_, index) => index % 3 === 0);
    const times = filteredData.map(hour => 
      hour.time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    );
    const precipitations = filteredData.map(hour => hour.precipitation);
    
    return (
      <div className="weather-chart-container">
        <div className="weather-chart">
          <svg width="100%" height="200" viewBox="0 0 700 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={40 + i * 40}
                x2="700"
                y2={40 + i * 40}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            ))}
            
            {/* Precipitation bars */}
            {precipitations.map((precip, i) => {
              const x = 50 + (i * 600) / (precipitations.length - 1);
              const height = (precip / 50) * 120; // Max 50%
              const y = 180 - height;
              return (
                <g key={i}>
                  <rect
                    x={x - 15}
                    y={y}
                    width="30"
                    height={height}
                    fill="#86BBD8"
                    opacity="0.8"
                  />
                  <text x={x} y={y - 5} textAnchor="middle" fontSize="12" fill="#333">
                    {precip}%
                  </text>
                </g>
              );
            })}
            
            {/* Time labels */}
            {times.map((time, i) => {
              const x = 50 + (i * 600) / (times.length - 1);
              return (
                <text key={i} x={x} y="195" textAnchor="middle" fontSize="10" fill="#666">
                  {time}
                </text>
              );
            })}
          </svg>
        </div>
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Máxima:</span>
            <span className="summary-value">{Math.max(...precipitations)}%</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Promedio:</span>
            <span className="summary-value">{Math.round(precipitations.reduce((a, b) => a + b, 0) / precipitations.length)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderWindChart = () => {
    // Filter data to show every 3 hours
    const filteredData = precipitationData.filter((_, index) => index % 3 === 0);
    const times = filteredData.map(hour => 
      hour.time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    );
    const winds = filteredData.map(hour => hour.wind);
    
    return (
      <div className="weather-chart-container">
        <div className="weather-chart">
          <svg width="100%" height="200" viewBox="0 0 700 200">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={40 + i * 40}
                x2="700"
                y2={40 + i * 40}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            ))}
            
            {/* Wind line */}
            <polyline
              points={winds.map((wind, i) => {
                const x = 50 + (i * 600) / (winds.length - 1);
                const y = 180 - ((wind - Math.min(...winds)) / (Math.max(...winds) - Math.min(...winds))) * 120;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#33658A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Wind points */}
            {winds.map((wind, i) => {
              const x = 50 + (i * 600) / (winds.length - 1);
              const y = 180 - ((wind - Math.min(...winds)) / (Math.max(...winds) - Math.min(...winds))) * 120;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="#33658A" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#333">
                    {wind}
                  </text>
                </g>
              );
            })}
            
            {/* Time labels */}
            {times.map((time, i) => {
              const x = 50 + (i * 600) / (times.length - 1);
              return (
                <text key={i} x={x} y="195" textAnchor="middle" fontSize="10" fill="#666">
                  {time}
                </text>
              );
            })}
          </svg>
        </div>
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Máximo:</span>
            <span className="summary-value">{Math.max(...winds)} km/h</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Promedio:</span>
            <span className="summary-value">{Math.round(winds.reduce((a, b) => a + b, 0) / winds.length)} km/h</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="weather-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="weather-tabs">
            <button 
              className={`weather-tab ${activeTab === 'temperature' ? 'active' : ''}`}
              onClick={() => setActiveTab('temperature')}
            >
              Temperatura
            </button>
            <button 
              className={`weather-tab ${activeTab === 'precipitation' ? 'active' : ''}`}
              onClick={() => setActiveTab('precipitation')}
            >
              Precipitación
            </button>
            <button 
              className={`weather-tab ${activeTab === 'wind' ? 'active' : ''}`}
              onClick={() => setActiveTab('wind')}
            >
              Viento
            </button>
          </div>
          
          <div className="weather-tab-content">
            {activeTab === 'temperature' && renderTemperatureChart()}
            {activeTab === 'precipitation' && renderPrecipitationChart()}
            {activeTab === 'wind' && renderWindChart()}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherWidget({ onHeightChange }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [weatherSummary, setWeatherSummary] = useState('');
  const [weatherSummaryTitle, setWeatherSummaryTitle] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const city = 'Maidenhead, UK';
        
        console.log('Fetching weather for:', city);
        
        // First get coordinates for the city using Google Geocoding API
        const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${API_KEY}`;
        
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        
        if (!geocodeData.results || geocodeData.results.length === 0) {
          throw new Error('City not found');
        }
        
        const location = geocodeData.results[0].geometry.location;
        const lat = location.lat;
        const lng = location.lng;
        
        console.log('Coordinates:', lat, lng);
        
        // Use Open-Meteo API for current weather and hourly forecast
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,weather_code&hourly=temperature_2m,weather_code&timezone=auto`;
        
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
          throw new Error('Failed to fetch weather');
        }
        
        const weatherData = await weatherResponse.json();
        console.log('Weather data:', weatherData);
        
        // Convert weather code to description and icon
        const currentWeatherCode = weatherData.current.weather_code;
        const currentWeatherInfo = getWeatherInfo(currentWeatherCode);
        
        // Get today's date
        const today = new Date();
        
        // Get all hourly data for today
        const todayForecast = weatherData.hourly.time
          .map((time, index) => ({
            time: new Date(time),
            temperature: weatherData.hourly.temperature_2m[index],
            weatherCode: weatherData.hourly.weather_code[index]
          }))
          .filter(forecast => {
            const forecastDate = forecast.time.toISOString().split('T')[0];
            return forecastDate === today.toISOString().split('T')[0];
          });
        
        // Define time periods: morning (6-11), noon (12-17), afternoon (18-21), night (22-5)
        const getTimePeriod = (hour) => {
          if (hour >= 6 && hour <= 11) return 'morning';
          if (hour >= 12 && hour <= 17) return 'noon';
          if (hour >= 18 && hour <= 21) return 'afternoon';
          return 'night';
        };
        
        // Group by time periods and get average/representative data
        const periodData = {};
        todayForecast.forEach(forecast => {
          const period = getTimePeriod(forecast.time.getHours());
          if (!periodData[period]) {
            periodData[period] = {
              temperatures: [],
              weatherCodes: [],
              times: []
            };
          }
          periodData[period].temperatures.push(forecast.temperature);
          periodData[period].weatherCodes.push(forecast.weatherCode);
          periodData[period].times.push(forecast.time);
        });
        
        // Calculate representative data for each period
        const periods = [
          { key: 'morning', name: 'Mañana', hours: [6, 7, 8, 9, 10, 11] },
          { key: 'noon', name: 'Mediodía', hours: [12, 13, 14, 15, 16, 17] },
          { key: 'afternoon', name: 'Tarde', hours: [18, 19, 20, 21] },
          { key: 'night', name: 'Noche', hours: [22, 23, 0, 1, 2, 3, 4, 5] }
        ];
        
        const dailyForecast = periods.map(period => {
          const data = periodData[period.key];
          if (!data || data.temperatures.length === 0) {
            return null;
          }
          
          // Get average temperature and most common weather code
          const avgTemp = data.temperatures.reduce((a, b) => a + b, 0) / data.temperatures.length;
          const mostCommonCode = data.weatherCodes.sort((a, b) => 
            data.weatherCodes.filter(v => v === a).length - data.weatherCodes.filter(v => v === b).length
          ).pop();
          
          return {
            period: period.name,
            temperature: Math.round(avgTemp),
            weatherCode: mostCommonCode,
            time: data.times[Math.floor(data.times.length / 2)] // Middle time of the period
          };
        }).filter(Boolean);
        
        // Prepare detailed 24-hour data
        const detailed24h = todayForecast.map(forecast => ({
          time: forecast.time,
          temperature: Math.round(forecast.temperature),
          condition: getWeatherInfo(forecast.weatherCode).description,
          icon: getWeatherInfo(forecast.weatherCode).icon
        }));
        
        console.log('Detailed 24h data prepared:', detailed24h.length, 'hours');
        
        const convertedData = {
          current: {
            temperature: weatherData.current.temperature_2m,
            apparentTemperature: weatherData.current.apparent_temperature,
            condition: currentWeatherInfo.description,
            icon: currentWeatherInfo.icon
          },
          hourly: dailyForecast.map(forecast => ({
            time: forecast.time,
            temperature: forecast.temperature,
            condition: getWeatherInfo(forecast.weatherCode).description,
            icon: getWeatherInfo(forecast.weatherCode).icon,
            period: forecast.period
          })),
          detailed24h: detailed24h
        };
        
        console.log('Setting weather data with detailed24h:', convertedData.detailed24h.length, 'hours');
        setWeather(convertedData);
        setError(null);
        
        // Generate AI weather summary after data is set
        try {
          setSummaryLoading(true);
          console.log('Generating AI summary with', detailed24h.length, 'hours of data...');
          const { title, summary } = await generateDailySummary(detailed24h);
          console.log('Setting weather summary:', summary);
          setWeatherSummary(summary);
          setWeatherSummaryTitle(title);
        } catch (error) {
          console.error('Error generating summary:', error);
          const fallbackData = generateSimpleSummary();
          console.log('Using fallback summary:', fallbackData);
          setWeatherSummary(fallbackData.summary);
          setWeatherSummaryTitle(fallbackData.title);
        } finally {
          setSummaryLoading(false);
        }
        
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('No se pudo cargar el clima');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Update every 30 minutes
    return () => clearInterval(interval);
  }, []);

  // Function to convert WMO weather codes to descriptions and icons
  function getWeatherInfo(code) {
    const weatherCodes = {
      0: { description: 'Despejado', icon: '01d' },
      1: { description: 'Mayormente despejado', icon: '02d' },
      2: { description: 'Parcialmente nublado', icon: '03d' },
      3: { description: 'Nublado', icon: '04d' },
      45: { description: 'Neblinoso', icon: '50d' },
      48: { description: 'Neblina con escarcha', icon: '50d' },
      51: { description: 'Llovizna ligera', icon: '09d' },
      53: { description: 'Llovizna moderada', icon: '09d' },
      55: { description: 'Llovizna densa', icon: '09d' },
      61: { description: 'Lluvia ligera', icon: '10d' },
      63: { description: 'Lluvia moderada', icon: '10d' },
      65: { description: 'Lluvia fuerte', icon: '10d' },
      71: { description: 'Nieve ligera', icon: '13d' },
      73: { description: 'Nieve moderada', icon: '13d' },
      75: { description: 'Nieve fuerte', icon: '13d' },
      77: { description: 'Granizo', icon: '13d' },
      80: { description: 'Chubascos ligeros', icon: '09d' },
      81: { description: 'Chubascos moderados', icon: '09d' },
      82: { description: 'Chubascos fuertes', icon: '09d' },
      85: { description: 'Chubascos de nieve ligeros', icon: '13d' },
      86: { description: 'Chubascos de nieve fuertes', icon: '13d' },
      95: { description: 'Tormenta', icon: '11d' },
      96: { description: 'Tormenta con granizo', icon: '11d' },
      99: { description: 'Tormenta fuerte con granizo', icon: '11d' }
    };
    
    return weatherCodes[code] || { description: 'Desconocido', icon: '01d' };
  }

  function handlePeriodClick(period) {
    setSelectedPeriod(period);
    setIsModalOpen(true);
  }

  // Function to generate daily weather summary using OpenAI
  async function generateDailySummary(weatherDataParam = null) {
    const dataToUse = weatherDataParam || (weather && weather.detailed24h);
    
    if (!dataToUse || dataToUse.length === 0) {
      console.log('No weather data available for summary. Data:', dataToUse);
      return '';
    }
    
    try {
      console.log('Starting OpenAI API call with', dataToUse.length, 'hours of data...');
      const weatherData = dataToUse.map(hour => ({
        time: hour.time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        temperature: hour.temperature,
        condition: hour.condition
      }));

      console.log('Weather data for OpenAI:', weatherData);

      const prompt = `Eres un colega majo que explica el tiempo de HOY con humor negro y sarcasmo. SIEMPRE empieza con "Hoy" y ve directo al grano. Añade algo de humor negro sobre el tiempo. NO te despidas al final.

Aquí tienes el tiempo hora por hora para HOY:
${weatherData.map(hour => `${hour.time}: ${hour.temperature}°C, ${hour.condition}`).join('\n')}

Sé MUY específico con las horas. Si va a llover, di exactamente a qué hora y con qué probabilidad. Por ejemplo: "Hoy nublado pero a las 12 de la mañana y a las 3 de la tarde lloverá con bastante posibilidad". 

Analiza los datos y da un resumen práctico pero con humor negro. Máximo 2 emojis. Máximo 3-4 frases. SIEMPRE empieza con "Hoy". Menciona horas específicas cuando sea relevante.

Formato de respuesta:
TÍTULO: [un título corto y atractivo sobre el tiempo de HOY]
RESUMEN: [resumen específico del día con humor negro]`;

      console.log('OpenAI API Key available:', !!import.meta.env.VITE_OPENAI_API_KEY);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      console.log('OpenAI response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`Failed to fetch from OpenAI: ${response.status}`);
      }

      const data = await response.json();
      console.log('OpenAI response data:', data);
      
      const fullResponse = data.choices[0].message.content;
      console.log('Full AI response:', fullResponse);
      
      // Parse the response to extract title and summary
      const titleMatch = fullResponse.match(/TÍTULO:\s*(.+?)(?:\n|$)/i);
      const summaryMatch = fullResponse.match(/RESUMEN:\s*(.+?)(?:\n|$)/i);
      
      let title = 'Resumen del tiempo hoy'; // fallback
      let summary = fullResponse; // fallback to full response
      
      if (titleMatch && summaryMatch) {
        title = titleMatch[1].trim();
        summary = summaryMatch[1].trim();
      } else if (summaryMatch) {
        summary = summaryMatch[1].trim();
      }
      
      console.log('Parsed title:', title);
      console.log('Parsed summary:', summary);
      
      return { title, summary };
      
    } catch (error) {
      console.error('Error generating weather summary:', error);
      // Fallback to simple summary if API fails
      return generateSimpleSummary();
    }
  }

  // Fallback function for when OpenAI API fails
  function generateSimpleSummary() {
    if (!weather || !weather.hourly || weather.hourly.length === 0) return { title: 'Resumen del tiempo hoy', summary: '' };
    
    const temperatures = weather.hourly.map(h => h.temperature);
    const conditions = weather.hourly.map(h => h.condition);
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    const avgTemp = Math.round(temperatures.reduce((a, b) => a + b, 0) / temperatures.length);
    
    // Get most common condition
    const conditionCounts = {};
    conditions.forEach(condition => {
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });
    const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) => 
      conditionCounts[a] > conditionCounts[b] ? a : b
    );
    
    // Generate summary text
    let summary = `Hoy ${mostCommonCondition.toLowerCase()}`;
    
    if (maxTemp - minTemp > 8) {
      summary += ` con variación de temperatura. Máxima de ${maxTemp}°C y mínima de ${minTemp}°C.`;
    } else {
      summary += ` con temperaturas estables alrededor de ${avgTemp}°C.`;
    }
    
    // Add specific details based on conditions
    if (mostCommonCondition.includes('Lluvia') || mostCommonCondition.includes('Llovizna')) {
      summary += ' Lleva paraguas.';
    } else if (mostCommonCondition.includes('Nublado')) {
      summary += ' Cielo cubierto.';
    } else if (mostCommonCondition.includes('Despejado')) {
      summary += ' Día soleado.';
    }
    
    return { title: 'Resumen del tiempo hoy', summary };
  }

  useEffect(() => {
    if (containerRef.current && onHeightChange) {
      const updateHeight = () => {
        const height = containerRef.current.offsetHeight;
        onHeightChange(height);
      };
      
      updateHeight();
      
      // También actualizar cuando cambie el contenido
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(containerRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, [weather, loading, error, onHeightChange]);

  if (loading) {
    return (
      <div className="weather-dashboard" ref={containerRef}>
        <h1 className="weather-title">Tiempo ahora</h1>
        <div className="weather-placeholder">Cargando...</div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="weather-dashboard" ref={containerRef}>
        <h1 className="weather-title">Tiempo ahora</h1>
        <div className="weather-placeholder">{error || 'No disponible'}</div>
      </div>
    );
  }

  const current = weather.current;
  const temp = Math.round(current.temperature);
  const feelsLike = Math.round(current.apparentTemperature);
  const description = current.condition;
  const icon = current.icon;

  return (
    <>
      <div className="weather-dashboard" ref={containerRef}>
        <h1 className="weather-title">Tiempo ahora</h1>
        <div className="weather-content">
          <div className="weather-main">
            <div className="weather-icon">
              <img 
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt={description}
                width="65"
                height="65"
              />
            </div>
            <div className="weather-temp">
              <span className="temp-main">{temp}°C</span>
              <span className="temp-feels">Sensación {feelsLike}°C</span>
            </div>
          </div>
          {/* <div className="weather-desc">{description}</div> */}
          
          <div className="weather-summary">
            <span className="weather-summary-title">{weatherSummaryTitle}</span>
            {summaryLoading ? (
              'Generando resumen...'
            ) : weatherSummary ? (
              weatherSummary
            ) : (
              generateSimpleSummary().summary
            )}
          </div>
          

        </div>
      </div>

      {isModalOpen && createPortal(
        <WeatherModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          weatherData={weather.detailed24h}
          selectedPeriod={selectedPeriod}
        />,
        document.body
      )}
    </>
  );
}

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoyHeight, setHoyHeight] = useState(0);
  const [weatherHeight, setWeatherHeight] = useState(0);
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
              .filter(event => !isToday(event.start)) // excluir hoy
              .filter(event => !event.isOngoing)      // excluir eventos en curso que empezaron antes
              .filter(event => !event.title.toLowerCase().includes('basura'))
              .slice(0, 11)
              .map((event, i) => (
                <EventItem event={event} key={i} />
              ))}
          </div>
        )}
      </div>
      
      <WeatherWidget onHeightChange={setWeatherHeight} />
      
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
