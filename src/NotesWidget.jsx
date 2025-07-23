import { useState, useEffect } from 'react';

function NotesWidget({ weatherHeight }) {
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Función para cargar mensajes desde localStorage
  const loadMessages = () => {
    const savedDate = localStorage.getItem('notesDate');
    const currentDate = getCurrentDate();
    
    // Si la fecha guardada es diferente a la actual, resetear todo
    if (savedDate !== currentDate) {
      localStorage.setItem('notesDate', currentDate);
      localStorage.removeItem('notesMessages');
      setMessages({});
      return;
    }
    
    // Si es el mismo día, cargar el estado guardado
    const savedMessages = localStorage.getItem('notesMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  };

  // Función para guardar mensajes en localStorage
  const saveMessages = (newMessages) => {
    localStorage.setItem('notesMessages', JSON.stringify(newMessages));
    localStorage.setItem('notesDate', getCurrentDate());
  };

  // Función para añadir un mensaje
  const addMessage = () => {
    if (!newMessage.trim() || !userName.trim()) return;

    const userId = Date.now().toString(); // ID único temporal
    const newMessages = {
      ...messages,
      [userId]: {
        name: userName,
        message: newMessage,
        timestamp: new Date().toISOString()
      }
    };

    setMessages(newMessages);
    saveMessages(newMessages);
    setNewMessage('');
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadMessages();
    setLoading(false);
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
      
      <div className="notes-input">
        <input
          type="text"
          placeholder="Tu nombre"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="notes-name-input"
        />
        <div className="notes-message-input">
          <input
            type="text"
            placeholder="Escribe tu nota..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addMessage()}
            className="notes-text-input"
          />
          <button onClick={addMessage} className="notes-add-btn">
            +
          </button>
        </div>
      </div>

      <div className="notes-content">
        {Object.keys(messages).length === 0 ? (
          <div className="notes-placeholder">
            No hay notas hoy
            <div className="notes-instruction">
              Escribe tu nombre y añade una nota
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