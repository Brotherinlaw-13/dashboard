// Widgets de cocina: basura (del calendario), nevera y comedor (de /cocina en la Pi).
import { useEffect, useState } from 'react';
const API = 'http://127.0.0.1:8787';
const DOW = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const dia0 = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diff = d => Math.round((dia0(d) - dia0(new Date())) / 86400000);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const cuando = n => (n < 0 ? 'Caducado' : n === 0 ? 'Caduca hoy' : n === 1 ? 'Caduca mañana' : `En ${n} días`);

export function Basura({ events }) {
  const ev = events.filter(e => /basura/i.test(e.title) && diff(e.start) >= 0).sort((a, b) => a.start - b.start)[0];
  if (!ev) return null;
  const tipo = ev.title.replace(/^.*basura\s*[-–:]\s*/i, '').trim() || ev.title;
  const n = diff(ev.start), h = new Date().getHours();
  const urgente = n === 0 || (n === 1 && h >= 15);
  const color = /jard/i.test(tipo) ? '#34C759' : /org/i.test(tipo) ? '#A2845E' : '#8E8E93';
  return (
    <section className={`c-card c-basura${urgente ? ' urgente' : ''}`}>
      <span className="c-cubo" style={{ background: color }} />
      <div className="c-txt">
        <span className="c-gris">{n === 0 ? 'Hoy recogen' : n === 1 ? 'Mañana recogen · sácala esta noche' : `El ${DOW[ev.start.getDay()]} ${ev.start.getDate()} recogen`}</span>
        <span className="c-basura-tipo">{tipo}</span>
      </div>
    </section>
  );
}

export function FilaCocina() {
  const [d, setD] = useState(null);
  useEffect(() => {
    const cargar = async () => { try { const r = await fetch(`${API}/cocina`, { cache: 'no-store' }); if (r.ok) setD(await r.json()); } catch { /* */ } };
    cargar(); const t = setInterval(cargar, 60000); return () => clearInterval(t);
  }, []);
  if (!d) return null;
  const nev = d.nevera || [];
  const idea = nev.find(i => i.receta && i.dias <= 1) || nev.find(i => i.receta);
  // Comedor: hasta las 20:00 lo que han comido hoy; después, el próximo día de cole.
  const ahora = new Date(); const cole = d.cole || {};
  const fechas = Object.keys(cole).sort();
  const hoyIso = iso(ahora);
  let f = cole[hoyIso] && ahora.getHours() < 20 ? hoyIso : fechas.find(x => x > hoyIso);
  let etiqueta = '';
  if (f) { const fd = new Date(f + 'T12:00'); const n = diff(fd); etiqueta = n === 0 ? 'Hoy han comido' : n === 1 ? 'Mañana comen' : `El ${DOW[fd.getDay()]} comen`; }
  return (
    <div className="c-fila">
      <section className="c-card c-nevera">
        <div className="c-cab"><h2>Nevera</h2><span className="c-gris">{nev.length ? 'Lo que caduca pronto' : ''}</span></div>
        {nev.length === 0 && <span className="c-gris">Nada a punto de caducar</span>}
        <div className="c-nev-lista">
          {nev.slice(0, 4).map((i, k) => (
            <div key={k} className="c-nev-fila">
              <span className="c-tit">{i.nombre}</span>
              <span className={`c-nev-cuando${i.dias <= 0 ? ' rojo' : i.dias === 1 ? ' naranja' : ''}`}>{cuando(i.dias)}</span>
            </div>
          ))}
        </div>
        {idea && <div className="c-idea"><b>Cena:</b> {idea.nombre.toLowerCase()} {idea.receta}</div>}
      </section>
      <section className="c-card c-comedor">
        <div className="c-cab"><h2>Comedor</h2><span className="c-gris">{etiqueta}</span></div>
        {!f && <span className="c-gris">Sin menú cargado</span>}
        {f && [['dante', 'Dante'], ['tristan', 'Tristán']].map(([k, n]) => (
          <div key={k} className="c-com-fila"><span className="c-com-nombre">{n}</span><span className="c-com-plato">{cole[f][k] || '–'}</span></div>
        ))}
      </section>
    </div>
  );
}
