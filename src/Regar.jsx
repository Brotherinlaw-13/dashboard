// Aviso de los miércoles: "Hay que regar". Sale cada miércoles (hora de Londres) hasta que
// alguien pulsa OK; el OK se guarda en la Pi (GET/POST /regar → ~/casa/regar.json) para que
// sobreviva a recargas y valga en cualquier pantalla. Sin la Pi (p. ej. en Vercel), localStorage.
// Si el miércoles nadie pulsa OK, el jueves ya no sale: no se arrastra.
import { useCallback, useEffect, useState } from 'react';

const API = 'http://127.0.0.1:8787';
const LS = 'regar-ultimo-ok';

// Fecha y día de la semana en Europe/London, sea cual sea la zona del navegador.
export function hoyLondres(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
    .formatToParts(d).map(x => [x.type, x.value]));
  return { iso: `${p.year}-${p.month}-${p.day}`, miercoles: p.weekday === 'Wed' };
}
export const debeRegar = (hoy, ultimoOk) => hoy.miercoles && ultimoOk !== hoy.iso;

const leerLocal = () => { try { return localStorage.getItem(LS) || ''; } catch { return ''; } };

export default function Regar() {
  const [mostrar, setMostrar] = useState(false);

  const comprobar = useCallback(async () => {
    const hoy = hoyLondres();
    if (!hoy.miercoles) { setMostrar(false); return; }
    let servidor = '';
    try {
      const r = await fetch(`${API}/regar`, { cache: 'no-store' });
      if (r.ok) servidor = (await r.json()).ultimo_ok || '';
    } catch { /* sin Pi: sólo localStorage */ }
    const local = leerLocal();
    const ultimo = servidor > local ? servidor : local;   // fechas ISO: se comparan como texto
    setMostrar(debeRegar(hoy, ultimo));
  }, []);

  useEffect(() => { comprobar(); const t = setInterval(comprobar, 60000); return () => clearInterval(t); }, [comprobar]);

  async function ok() {
    const { iso } = hoyLondres();
    setMostrar(false);
    try { localStorage.setItem(LS, iso); } catch { /* */ }
    try { await fetch(`${API}/regar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fecha: iso }) }); } catch { /* */ }
  }

  if (!mostrar) return null;
  return (
    <div className="r-fondo" role="dialog" aria-modal="true" aria-labelledby="r-titulo">
      <div className="r-caja">
        {/* La Pi no tiene fuente de emojis: la maceta 🪴 va dibujada en SVG */}
        <svg className="r-maceta" viewBox="0 0 120 130" aria-label="🪴" role="img">
          <path d="M60 78 C60 55 58 40 60 22" stroke="#2E7D32" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M60 50 C42 46 30 34 28 18 C46 20 58 32 60 50 Z" fill="#43A047" />
          <path d="M60 40 C76 36 88 24 92 8 C72 10 62 22 60 40 Z" fill="#66BB6A" />
          <path d="M60 66 C78 64 94 54 100 40 C80 40 64 50 60 66 Z" fill="#4CAF50" />
          <path d="M60 70 C44 70 26 62 18 48 C38 46 54 56 60 70 Z" fill="#388E3C" />
          <rect x="26" y="76" width="68" height="12" rx="3" fill="#B5653A" />
          <path d="M31 88 H89 L82 124 H38 Z" fill="#D4774A" />
        </svg>
        <h1 id="r-titulo" className="r-titulo">Hay que regar <span aria-hidden="true">🪴</span></h1>
        <button type="button" className="r-ok" onClick={ok}>OK</button>
      </div>
    </div>
  );
}
