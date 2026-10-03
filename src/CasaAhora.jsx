// "La casa ahora": lee el API local de la Pi (127.0.0.1:8787). Fuera de la Pi no existe y el bloque no se pinta.
import { useEffect, useState, useCallback } from 'react';

const API = 'http://127.0.0.1:8787';
const OCULTAR = ['Salon1', 'Salon2']; // válvulas del salón: manda el termostato
const NOMBRE = { 'Habitacion Dante': 'Dante', 'Habitacion Tristan': 'Tristán', 'Habitacion Paichons': 'Papás', 'Salon': 'Salón' };
const LUZ = { Lampara: 'Lámpara', Led: 'Led', Luz: 'Luz' };

export default function CasaAhora() {
  const [casa, setCasa] = useState(null);
  const [ocupado, setOcupado] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const r = await fetch(`${API}/casa`, { cache: 'no-store' });
      setCasa(r.ok ? await r.json() : null);
    } catch { setCasa(null); }
  }, []);

  useEffect(() => { cargar(); const t = setInterval(cargar, 15000); return () => clearInterval(t); }, [cargar]);

  async function accion(clave, path, body) {
    setOcupado(clave);
    try { await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); }
    catch { /* el siguiente refresco enseña el estado real */ }
    await cargar(); setOcupado(null);
  }

  if (!casa) return null;
  const zonas = (casa.hive || []).filter(z => !OCULTAR.includes(z.nombre));
  const luces = (casa.luces || []).filter(l => l.online);
  const robo = casa.robotina;
  const caldera = (casa.hive || []).some(z => z.calentando);

  return (
    <div className="casa-ahora">
      <div className="casa-titulo">La casa ahora{caldera && <span className="casa-caldera"> · 🔥 caldera encendida</span>}</div>

      {zonas.length > 0 && (
        <div className="casa-fila">
          {zonas.map(z => {
            const boost = z.modo === 'BOOST';
            const apagada = z.modo === 'OFF';
            return (
              <button key={z.id} className={`casa-zona${boost ? ' boost' : ''}${apagada ? ' off' : ''}`} disabled={ocupado === z.id}
                onClick={() => boost ? accion(z.id, `/calefaccion/${z.id}/programa`) : accion(z.id, `/calefaccion/${z.id}/boost`, { minutos: 30, temp: 21 })}>
                <span className="casa-temp">{z.actual != null ? `${Number(z.actual).toFixed(1)}°` : '–'}</span>
                <span className="casa-nombre">{NOMBRE[z.nombre] || z.nombre}</span>
                <span className="casa-sub">{boost ? `boost · toca para quitar` : apagada ? 'apagada' : `pide ${z.consigna}°`}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="casa-fila">
        {luces.map(l => (
          <button key={l.nombre} className={`casa-luz${l.on ? ' on' : ''}`} disabled={ocupado === l.nombre}
            onClick={() => accion(l.nombre, `/luz/${encodeURIComponent(l.nombre)}`, { on: !l.on })}>
            <span className="casa-icono">{l.on ? '💡' : '○'}</span>{LUZ[l.nombre] || l.nombre}
          </button>
        ))}
        {robo && (
          <div className="casa-robo">
            <span className="casa-robo-estado">🧹 Robotina · {robo.estado} · {robo.bateria}%</span>
            <span className="casa-robo-botones">
              <button disabled={ocupado === 'robo'} onClick={() => accion('robo', '/robotina/limpiar')}>Limpiar</button>
              <button disabled={ocupado === 'robo'} onClick={() => accion('robo', '/robotina/base')}>A la base</button>
              <button disabled={ocupado === 'robo'} onClick={() => accion('robo', '/robotina/buscar')}>¿Dónde estás?</button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
