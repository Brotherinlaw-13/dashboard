// Pantalla de cocina: estilo tarjetas oscuras (Mushroom/Apple Home). Iconos SVG: la Pi no tiene fuente de emojis.
import { useEffect, useState, useCallback } from 'react';
import './cocina.css';

const API = 'http://127.0.0.1:8787';
const OCULTAR = ['Salon1', 'Salon2'];
const NOMBRE = { 'Habitacion Dante': 'Dante', 'Habitacion Tristan': 'Tristán', 'Habitacion Paichons': 'Papás', 'Salon': 'Salón' };
const LUZ = { Lampara: 'Lámpara', Led: 'Led', Luz: 'Luz' };
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const Ico = {
  luz: <svg viewBox="0 0 24 24"><path d="M9 21h6M10 18h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V16h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3z"/></svg>,
  fuego: <svg viewBox="0 0 24 24"><path d="M12 3s5 4.5 5 9.5a5 5 0 0 1-10 0C7 10 9 8.5 9 8.5s.5 2.5 2 3c0-3 1-6.5 1-8.5z"/></svg>,
  robot: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="9" r="2"/><path d="M7 15h10"/></svg>,
  termo: <svg viewBox="0 0 24 24"><path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/></svg>,
};

const hhmm = d => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const mismoDia = (a, b) => a.toDateString() === b.toDateString();

function Reloj() {
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setAhora(new Date()), 10000); return () => clearInterval(t); }, []);
  return (
    <div className="k-reloj">
      <div className="k-hora">{hhmm(ahora)}</div>
      <div className="k-fecha">{DIAS[ahora.getDay()]} {ahora.getDate()} de {MESES[ahora.getMonth()]}</div>
    </div>
  );
}

function Agenda({ events }) {
  const hoy = new Date();
  const deHoy = events.filter(e => mismoDia(e.start, hoy) || e.isOngoing);
  const prox = events.filter(e => !mismoDia(e.start, hoy) && !e.isOngoing && e.start > hoy)
    .filter(e => !/^club/i.test(e.title)).slice(0, 7);
  const linea = (e, i, conDia) => (
    <div className="k-ev" key={i}>
      <span className="k-ev-barra" style={{ background: e.color }} />
      <div className="k-ev-txt">
        <div className="k-ev-titulo">{e.title.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '').trim()}</div>
        <div className="k-ev-cuando">
          {conDia && `${DIAS[e.start.getDay()].slice(0, 3)} ${e.start.getDate()}`}
          {conDia && !e.allDay && ' · '}
          {!e.allDay ? hhmm(e.start) : (!conDia ? 'todo el día' : '')}
        </div>
      </div>
    </div>
  );
  return (
    <div className="k-col-izq">
      <Reloj />
      <div className="k-card">
        <div className="k-card-tit">Hoy</div>
        {deHoy.length ? deHoy.map((e, i) => linea(e, i, false)) : <div className="k-vacio">Nada en el calendario</div>}
      </div>
      <div className="k-card k-crece">
        <div className="k-card-tit">Próximos</div>
        {prox.map((e, i) => linea(e, i, true))}
      </div>
    </div>
  );
}

function Casa() {
  const [casa, setCasa] = useState(null);
  const [pend, setPend] = useState({});
  const cargar = useCallback(async () => {
    try { const r = await fetch(`${API}/casa`, { cache: 'no-store' }); setCasa(r.ok ? await r.json() : null); }
    catch { setCasa(null); }
  }, []);
  useEffect(() => { cargar(); const t = setInterval(cargar, 2000); return () => clearInterval(t); }, [cargar]);

  async function accion(clave, path, body, optimista) {
    if (optimista) setCasa(c => (c ? optimista(structuredClone(c)) : c));
    setPend(p => ({ ...p, [clave]: Date.now() }));
    try { await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); } catch { /* */ }
    setTimeout(() => setPend(p => { const n = { ...p }; delete n[clave]; return n; }), 8000);
  }
  if (!casa) return <div className="k-col-der"><div className="k-card k-vacio">La casa sólo se ve desde la pantalla de la cocina</div></div>;

  const ts = casa.ts || {};
  const hiveViejo = !ts.hive || Date.now() / 1000 - ts.hive > 180;
  const zonas = (casa.hive || []).filter(z => !OCULTAR.includes(z.nombre));
  const luces = (casa.luces || []).filter(l => l.online);
  const robo = casa.robotina;
  const caldera = !hiveViejo && (casa.hive || []).some(z => z.calentando);
  const conLuz = (n, on) => c => { c.luces.forEach(l => { if (l.nombre === n) l.on = on; }); return c; };
  const conZona = (id, modo) => c => { c.hive.forEach(z => { if (z.id === id) { z.modo = modo; z.boost = modo === 'BOOST' ? 30 : null; } }); return c; };
  const conRobo = t => c => { if (c.robotina) c.robotina.estado = t; return c; };

  return (
    <div className="k-col-der">
      <div className="k-seccion">
        <span>Calefacción</span>
        {hiveViejo ? <span className="k-aviso">sin conexión con Hive, datos de hace rato</span>
          : caldera ? <span className="k-caldera">{Ico.fuego} caldera encendida</span>
          : <span className="k-sub">tocar = 30 min a 21°</span>}
      </div>
      <div className={`k-grid4${hiveViejo ? ' k-gris' : ''}`}>
        {zonas.map(z => {
          const boost = z.modo === 'BOOST', off = z.modo === 'OFF', enviando = pend[z.id];
          return (
            <button key={z.id} className={`k-tile k-zona${boost ? ' k-on-naranja' : ''}${off ? ' k-off' : ''}`}
              onClick={() => boost ? accion(z.id, `/calefaccion/${z.id}/programa`, null, conZona(z.id, 'SCHEDULE'))
                : accion(z.id, `/calefaccion/${z.id}/boost`, { minutos: 30, temp: 21 }, conZona(z.id, 'BOOST'))}>
              <span className="k-ico">{Ico.termo}</span>
              <span className="k-temp">{z.actual != null ? Number(z.actual).toFixed(1) : '–'}<small>°</small></span>
              <span className="k-nombre">{NOMBRE[z.nombre] || z.nombre}</span>
              <span className="k-estado">{enviando ? 'enviando…' : boost ? `boost ${z.boost ?? ''} min` : off ? 'apagada' : `programa · ${z.consigna}°`}</span>
            </button>
          );
        })}
      </div>

      <div className="k-seccion"><span>Luces</span></div>
      <div className="k-grid3">
        {luces.map(l => (
          <button key={l.nombre} className={`k-tile k-luz${l.on ? ' k-on-amarillo' : ''}`}
            onClick={() => accion(l.nombre, `/luz/${encodeURIComponent(l.nombre)}`, { on: !l.on }, conLuz(l.nombre, !l.on))}>
            <span className="k-ico">{Ico.luz}</span>
            <span className="k-nombre">{LUZ[l.nombre] || l.nombre}</span>
            <span className="k-estado">{l.on ? 'encendida' : 'apagada'}</span>
          </button>
        ))}
      </div>

      {robo && (<>
        <div className="k-seccion"><span>Robotina</span></div>
        <div className="k-robo">
          <div className="k-tile k-robo-info">
            <span className="k-ico">{Ico.robot}</span>
            <div><div className="k-nombre">{robo.estado}</div>
              <div className="k-bat"><div style={{ width: `${robo.bateria || 0}%` }} /></div>
              <div className="k-estado">{robo.bateria}% de batería</div></div>
          </div>
          <button className="k-tile k-btn" onClick={() => accion('robo', '/robotina/limpiar', null, conRobo('Saliendo a limpiar…'))}>Limpiar</button>
          <button className="k-tile k-btn" onClick={() => accion('robo', '/robotina/base', null, conRobo('Volviendo a la base…'))}>A la base</button>
          <button className="k-tile k-btn" onClick={() => accion('robo', '/robotina/buscar', null, conRobo('Pitando…'))}>¿Dónde estás?</button>
        </div>
      </>)}
    </div>
  );
}

export default function Cocina({ events }) {
  return <div className="k-pantalla"><Agenda events={events} /><Casa /></div>;
}
