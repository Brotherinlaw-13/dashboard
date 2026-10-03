// Pantalla de cocina. Réplica del diseño "Panel de casa" de Diego (estilo Apple Home, cristal claro),
// con datos reales: calendarios (Vercel) y casa (API local de la Pi, 127.0.0.1:8787).
import { useEffect, useRef, useState, useCallback } from 'react';
import './cocina.css';

const API = 'http://127.0.0.1:8787';
const OCULTAR = ['Salon1', 'Salon2'];
const NOMBRE = { 'Habitacion Dante': 'Dante', 'Habitacion Tristan': 'Tristán', 'Habitacion Paichons': 'Papás', 'Salon': 'Salón' };
const ORDEN = ['Salon', 'Habitacion Dante', 'Habitacion Tristan', 'Habitacion Paichons'];
const LUZ = { Lampara: 'Lámpara', Led: 'Led', Luz: 'Luz' };
const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const pad = n => String(n).padStart(2, '0');
const hhmm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmt = n => (n == null ? '–' : Number(n).toFixed(1).replace('.', ','));
const limpio = t => (t || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '').trim();
const mismoDia = (a, b) => a.toDateString() === b.toDateString();
const colorCal = e => (/luke/i.test(e.calendarId || '') ? '#FF9F0A' : '#34C759');
const quien = e => (/luke/i.test(e.calendarId || '') ? "St Luke's" : 'Familia');

const ICO = {
  fuego: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.5 1 2.5 2 3 0-3 .5-6 1-8.5z" /></svg>,
  luz: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>,
  play: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>,
  casa: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>,
  pin: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>,
};

function useAhora(ms) {
  const [n, setN] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setN(new Date()), ms); return () => clearInterval(t); }, [ms]);
  return n;
}

function Hoy({ events }) {
  const ahora = useAhora(1000);
  let fecha = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(ahora);
  fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const deHoy = events.filter(e => mismoDia(e.start, ahora) || e.isOngoing).slice(0, 5);
  let siguiente = false;
  return (
    <section className="c-card c-hoy">
      <div>
        <div className="c-fecha">{fecha}</div>
        <div className="c-reloj"><span className="c-hora">{hhmm(ahora)}</span><span className="c-seg">{pad(ahora.getSeconds())}</span></div>
      </div>
      <div className="c-cab"><h2>Hoy</h2><span className="c-leyenda"><i style={{ background: '#34C759' }} />Familia<i style={{ background: '#FF9F0A' }} />St Luke's</span></div>
      <div className="c-hoy-lista">
        {deHoy.length === 0 && <div className="c-gris">Nada en el calendario</div>}
        {deHoy.map((e, i) => {
          const pasado = !e.allDay && (e.end || e.start) < ahora;
          const esSig = !pasado && !siguiente && !e.allDay && (siguiente = true);
          return (
            <div key={i} className="c-hoy-fila" style={{ background: esSig ? 'rgba(10,132,255,0.10)' : 'transparent', opacity: pasado ? 0.45 : 1 }}>
              <span className="c-barra" style={{ background: colorCal(e) }} />
              <div className="c-txt"><span className="c-tit">{limpio(e.title)}</span><span className="c-meta">{quien(e)}{e.location ? ` · ${e.location}` : ''}</span></div>
              <span className="c-horaev">{e.allDay ? 'Todo el día' : hhmm(e.start)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Proximos({ events }) {
  const hoy = new Date();
  const lista = events.filter(e => !e.isOngoing && !mismoDia(e.start, hoy) && e.start > hoy && !/^club/i.test(e.title)).slice(0, 6);
  return (
    <section className="c-card c-prox">
      <h2>Próximos eventos</h2>
      {lista.map((e, i) => (
        <div key={i} className="c-prox-fila">
          <div className="c-dia"><span>{DOW[e.start.getDay()]}</span><b>{e.start.getDate()}</b></div>
          <div className="c-txt"><span className="c-tit">{limpio(e.title)}</span><span className="c-meta">{e.allDay ? 'Todo el día' : hhmm(e.start)} · {quien(e)}</span></div>
          <span className="c-punto" style={{ background: colorCal(e) }} />
        </div>
      ))}
    </section>
  );
}

function useCasa() {
  const [casa, setCasa] = useState(null);
  const ultimo = useRef(null);          // último estado bueno: nunca se "pierden" luces
  const cargar = useCallback(async () => {
    try {
      const r = await fetch(`${API}/casa`, { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      const prev = ultimo.current;
      if (prev) {                         // si una luz falla una lectura, conserva su último estado
        j.luces = (j.luces || []).map(l => (l.online ? l : { ...(prev.luces || []).find(p => p.nombre === l.nombre && p.online) || l, flojo: true }));
        if (!j.hive && prev.hive) j.hive = prev.hive;
        if (!j.robotina && prev.robotina) j.robotina = prev.robotina;
      }
      ultimo.current = j; setCasa(j);
    } catch { /* sin API: se queda lo último */ }
  }, []);
  useEffect(() => { cargar(); const t = setInterval(cargar, 2000); return () => clearInterval(t); }, [cargar]);
  return [casa, setCasa];
}

export default function Cocina({ events }) {
  const [casa, setCasa] = useCasa();
  const [pend, setPend] = useState({});
  const ahora = useAhora(1000);

  async function accion(clave, path, body, optimista) {
    if (optimista) setCasa(c => (c ? optimista(structuredClone(c)) : c));
    setPend(p => ({ ...p, [clave]: true }));
    try { await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); } catch { /* */ }
    setTimeout(() => setPend(p => { const n = { ...p }; delete n[clave]; return n; }), 6000);
  }

  const ts = casa?.ts || {};
  const hiveViejo = casa && (!ts.hive || Date.now() / 1000 - ts.hive > 300);
  const zonas = (casa?.hive || []).filter(z => !OCULTAR.includes(z.nombre)).sort((a, b) => ORDEN.indexOf(a.nombre) - ORDEN.indexOf(b.nombre));
  const luces = (casa?.luces || []).filter(l => LUZ[l.nombre]);
  const encendidas = luces.filter(l => l.on).length;
  const robo = casa?.robotina;
  const caldera = (casa?.hive || []).some(z => z.calentando);
  const limpiando = robo && /limpi|sweep|saliendo/i.test(robo.estado);

  return (
    <div className="c-fondo">
      <div className="c-grid">
        <div className="c-izq"><Hoy events={events} /><Proximos events={events} /></div>

        <div className="c-der">
          {!casa && <section className="c-card"><span className="c-gris">La casa sólo se controla desde la pantalla de la cocina.</span></section>}
          {casa && (<>
            <section className="c-card">
              <div className="c-cab">
                <h2>Calefacción{caldera && <span className="c-pastilla-naranja">Caldera encendida</span>}</h2>
                <span className="c-gris">{hiveViejo ? `Hive no responde desde las ${ts.hive ? hhmm(new Date(ts.hive * 1000)) : '–'}` : 'Toca una habitación para boost de 30 min'}</span>
              </div>
              <div className="c-heaters">
                {zonas.map(z => {
                  const boost = z.modo === 'BOOST', off = z.modo === 'OFF';
                  return (
                    <button key={z.id} type="button" aria-pressed={boost} className={`c-heater${boost ? ' on' : ''}`}
                      onClick={() => boost
                        ? accion(z.id, `/calefaccion/${z.id}/programa`, null, c => { c.hive.forEach(x => { if (x.id === z.id) { x.modo = 'SCHEDULE'; x.boost = null; } }); return c; })
                        : accion(z.id, `/calefaccion/${z.id}/boost`, { minutos: 30, temp: 21 }, c => { c.hive.forEach(x => { if (x.id === z.id) { x.modo = 'BOOST'; x.boost = 30; } }); return c; })}>
                      <div className="c-heater-cab"><span>{NOMBRE[z.nombre] || z.nombre}</span><span className="c-ico">{ICO.fuego}</span></div>
                      <div className="c-temp">{fmt(z.actual)}<small>°</small></div>
                      {pend[z.id] ? <span className="c-gris">Enviando…</span>
                        : boost ? <span className="c-boost">Boost · quedan {z.boost ?? 30} min</span>
                        : <span className="c-gris">{off ? 'Apagada' : `Objetivo ${fmt(z.consigna)}°`}</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="c-fila">
              <section className="c-card c-luces">
                <div className="c-cab"><h2>Luces</h2><span className="c-gris">{encendidas ? `${encendidas} encendida${encendidas > 1 ? 's' : ''}` : 'Todas apagadas'}</span></div>
                <div className="c-luces-lista">
                  {luces.map(l => (
                    <button key={l.nombre} type="button" aria-pressed={!!l.on} className={`c-luz${l.on ? ' on' : ''}`}
                      onClick={() => accion(l.nombre, `/luz/${encodeURIComponent(l.nombre)}`, { on: !l.on }, c => { c.luces.forEach(x => { if (x.nombre === l.nombre) { x.on = !l.on; x.online = true; } }); return c; })}>
                      <span className="c-ico">{ICO.luz}</span>
                      <span className="c-luz-txt"><b>{LUZ[l.nombre]}</b><small>{l.on ? 'Encendida' : 'Apagada'}</small></span>
                      <span className="c-track"><span className="c-knob" /></span>
                    </button>
                  ))}
                </div>
              </section>

              {robo && (
                <section className="c-card c-robo">
                  <div className="c-cab"><h2>Robotina</h2><span className={`c-pastilla${limpiando ? ' azul' : ''}`}>{robo.estado}</span></div>
                  <div className="c-bat">
                    <span className="c-gris">Batería</span>
                    <span className="c-bat-num">{robo.bateria}%</span>
                    <div className="c-bat-barra"><div style={{ width: `${robo.bateria || 0}%`, background: robo.bateria < 20 ? '#FF3B30' : '#34C759' }} /></div>
                  </div>
                  <div className="c-robo-botones">
                    <button type="button" className="c-btn-azul" onClick={() => accion('robo', '/robotina/limpiar', null, c => { c.robotina.estado = 'Saliendo a limpiar…'; return c; })}>{ICO.play}Limpiar</button>
                    <button type="button" className="c-btn" onClick={() => accion('robo', '/robotina/base', null, c => { c.robotina.estado = 'Volviendo a la base…'; return c; })}>{ICO.casa}A la base</button>
                    <button type="button" className="c-btn" onClick={() => accion('robo', '/robotina/buscar', null, c => { c.robotina.estado = 'Pitando…'; return c; })}>{ICO.pin}¿Dónde está?</button>
                  </div>
                </section>
              )}
            </div>
          </>)}
        </div>
      </div>
      <span hidden>{ahora.getTime()}</span>
    </div>
  );
}
