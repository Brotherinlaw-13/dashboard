import { useState, useEffect } from 'react';

function VitaminTracker() {
  const [vitamins, setVitamins] = useState({
    raquel: {
      vitaminaC: false,
      magnesio: false
    },
    diego: {
      vitaminaC: false,
      creatina: false
    },
    dante: {
      vitaminas: false
    },
    tristan: {
      vitaminas: false
    }
  });

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Función para cargar el estado desde localStorage
  const loadVitaminsState = () => {
    const savedDate = localStorage.getItem('vitaminsDate');
    const currentDate = getCurrentDate();
    
    // Si la fecha guardada es diferente a la actual, resetear todo
    if (savedDate !== currentDate) {
      localStorage.setItem('vitaminsDate', currentDate);
      localStorage.removeItem('vitaminsState');
      return {
        raquel: { vitaminaC: false, magnesio: false },
        diego: { vitaminaC: false, creatina: false },
        dante: { vitaminas: false },
        tristan: { vitaminas: false }
      };
    }
    
    // Si es el mismo día, cargar el estado guardado
    const savedState = localStorage.getItem('vitaminsState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    
    return {
      raquel: { vitaminaC: false, magnesio: false },
      diego: { vitaminaC: false, creatina: false },
      dante: { vitaminas: false },
      tristan: { vitaminas: false }
    };
  };

  // Función para guardar el estado en localStorage
  const saveVitaminsState = (newState) => {
    localStorage.setItem('vitaminsState', JSON.stringify(newState));
    localStorage.setItem('vitaminsDate', getCurrentDate());
  };

  // Cargar estado inicial
  useEffect(() => {
    setVitamins(loadVitaminsState());
  }, []);

  // Función para manejar cambios en los checkboxes
  const handleVitaminChange = (person, vitamin) => {
    const newVitamins = {
      ...vitamins,
      [person]: {
        ...vitamins[person],
        [vitamin]: !vitamins[person][vitamin]
      }
    };
    setVitamins(newVitamins);
    saveVitaminsState(newVitamins);
  };

  // Función para calcular el progreso de cada persona
  const getPersonProgress = (person) => {
    const personVitamins = vitamins[person];
    const total = Object.keys(personVitamins).length;
    const completed = Object.values(personVitamins).filter(Boolean).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  // Función para obtener el color de progreso
  const getProgressColor = (percentage) => {
    if (percentage === 100) return '#4CAF50'; // Verde
    if (percentage >= 50) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  return (
    <div className="vitamin-dashboard">
      <h1 className="vitamin-title">Vitaminas de hoy</h1>
      <div className="vitamin-content">
        {/* Raquel */}
        <div className="person-section">
          <div className="person-accent" style={{ background: '#33658A' }} />
          <div className="person-header">
            <h3 className="person-name">Raquel</h3>
            <div className="person-progress">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${getPersonProgress('raquel').percentage}%`,
                  backgroundColor: getProgressColor(getPersonProgress('raquel').percentage)
                }}
              />
              <span className="progress-text">
                {getPersonProgress('raquel').completed}/{getPersonProgress('raquel').total}
              </span>
            </div>
          </div>
          <div className="vitamin-list">
            <label className="vitamin-item">
              <input
                type="checkbox"
                checked={vitamins.raquel.vitaminaC}
                onChange={() => handleVitaminChange('raquel', 'vitaminaC')}
                className="vitamin-checkbox"
              />
              <span className={`vitamin-label ${vitamins.raquel.vitaminaC ? 'completed' : ''}`}>
                Vitamina C
              </span>
            </label>
            <label className="vitamin-item">
              <input
                type="checkbox"
                checked={vitamins.raquel.magnesio}
                onChange={() => handleVitaminChange('raquel', 'magnesio')}
                className="vitamin-checkbox"
              />
              <span className={`vitamin-label ${vitamins.raquel.magnesio ? 'completed' : ''}`}>
                Magnesio
              </span>
            </label>
          </div>
        </div>

        {/* Diego */}
        <div className="person-section">
          <div className="person-accent" style={{ background: '#86BBD8' }} />
          <div className="person-header">
            <h3 className="person-name">Diego</h3>
            <div className="person-progress">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${getPersonProgress('diego').percentage}%`,
                  backgroundColor: getProgressColor(getPersonProgress('diego').percentage)
                }}
              />
              <span className="progress-text">
                {getPersonProgress('diego').completed}/{getPersonProgress('diego').total}
              </span>
            </div>
          </div>
          <div className="vitamin-list">
            <label className="vitamin-item">
              <input
                type="checkbox"
                checked={vitamins.diego.vitaminaC}
                onChange={() => handleVitaminChange('diego', 'vitaminaC')}
                className="vitamin-checkbox"
              />
              <span className={`vitamin-label ${vitamins.diego.vitaminaC ? 'completed' : ''}`}>
                Vitamina C
              </span>
            </label>
            <label className="vitamin-item">
              <input
                type="checkbox"
                checked={vitamins.diego.creatina}
                onChange={() => handleVitaminChange('diego', 'creatina')}
                className="vitamin-checkbox"
              />
              <span className={`vitamin-label ${vitamins.diego.creatina ? 'completed' : ''}`}>
                Creatina
              </span>
            </label>
          </div>
        </div>

        {/* Dante */}
        <div className="person-section">
          <div className="person-accent" style={{ background: '#2F4858' }} />
          <div className="person-header">
            <h3 className="person-name">Dante</h3>
            <div className="person-progress">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${getPersonProgress('dante').percentage}%`,
                  backgroundColor: getProgressColor(getPersonProgress('dante').percentage)
                }}
              />
              <span className="progress-text">
                {getPersonProgress('dante').completed}/{getPersonProgress('dante').total}
              </span>
            </div>
          </div>
          <div className="vitamin-list">
            <label className="vitamin-item">
              <input
                type="checkbox"
                checked={vitamins.dante.vitaminas}
                onChange={() => handleVitaminChange('dante', 'vitaminas')}
                className="vitamin-checkbox"
              />
              <span className={`vitamin-label ${vitamins.dante.vitaminas ? 'completed' : ''}`}>
                Vitaminas
              </span>
            </label>
          </div>
        </div>

        {/* Tristan */}
        <div className="person-section">
          <div className="person-accent" style={{ background: '#F26419' }} />
          <div className="person-header">
            <h3 className="person-name">Tristan</h3>
            <div className="person-progress">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${getPersonProgress('tristan').percentage}%`,
                  backgroundColor: getProgressColor(getPersonProgress('tristan').percentage)
                }}
              />
              <span className="progress-text">
                {getPersonProgress('tristan').completed}/{getPersonProgress('tristan').total}
              </span>
            </div>
          </div>
          <div className="vitamin-list">
            <label className="vitamin-item">
              <input
                type="checkbox"
                checked={vitamins.tristan.vitaminas}
                onChange={() => handleVitaminChange('tristan', 'vitaminas')}
                className="vitamin-checkbox"
              />
              <span className={`vitamin-label ${vitamins.tristan.vitaminas ? 'completed' : ''}`}>
                Vitaminas
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VitaminTracker; 