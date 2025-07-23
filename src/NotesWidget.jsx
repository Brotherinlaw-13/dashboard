import { useState, useEffect } from 'react';
import { getDailyMessages, getBotInfo } from './TelegramBot';

function NotesWidget({ weatherHeight }) {
  const [messages, setMessages] = useState({});
  const [botInfo, setBotInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar mensajes
  const loadMessages = () => {
    const dailyMessages = getDailyMessages();
    setMessages(dailyMessages);
  };

  // Función para obtener información del bot
  const loadBotInfo = async () => {
    const info = await getBotInfo();
    setBotInfo(info);
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadMessages();
    loadBotInfo();
    setLoading(false);

    // Actualizar cada 30 segundos
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Actualizar posición cuando cambie la altura del weather
  useEffect(() => {
    if (weatherHeight) {
      console.log('[NotesWidget] Altura del weather actualizada:', weatherHeight);
    }
  }, [weatherHeight]);

  // Función para formatear la hora
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="notes-dashboard">
        <h1 className="notes-title">Notas del día</h1>
        <div className="notes-placeholder">Cargando...</div>
      </div>
    );
  }

  const messageCount = Object.keys(messages).length;

  return (
    <div 
      className="notes-dashboard"
      style={{ 
        top: weatherHeight ? `${weatherHeight + 40}px` : '280px'
      }}
    >
      <h1 className="notes-title">Notas del día</h1>
      
      {botInfo && (
        <div className="bot-info">
          <span className="bot-name">@{botInfo.username}</span>
        </div>
      )}

      <div className="notes-content">
        {messageCount === 0 ? (
          <div className="notes-placeholder">
            No hay notas hoy
            <div className="notes-instruction">
              Envía un mensaje al bot para agregar una nota
            </div>
          </div>
        ) : (
          <div className="notes-list">
            {Object.entries(messages).map(([userId, data]) => (
              <div key={userId} className="note-item">
                <div className="note-header">
                  <span className="note-author">{data.name}</span>
                  <span className="note-time">{formatTime(data.timestamp)}</span>
                </div>
                <div className="note-message">{data.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}

export default NotesWidget; 