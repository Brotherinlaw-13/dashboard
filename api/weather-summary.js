// Resumen del tiempo con OpenAI desde el servidor: la clave nunca llega al navegador.
// Sólo acepta datos horarios; el prompt se construye aquí para que no sea un proxy abierto.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: 'OPENAI_API_KEY no configurada' });
  const input = Array.isArray(req.body?.weatherData) ? req.body.weatherData.slice(0, 48) : [];
  const weatherData = input.map(h => ({
    time: String(h.time ?? '').slice(0, 8),
    temperature: Number(h.temperature),
    condition: String(h.condition ?? '').slice(0, 40),
  }));
  if (!weatherData.length) return res.status(400).json({ error: 'weatherData vacío' });
      const prompt = `Eres un amigo optimista que explica el tiempo de HOY con humor ligero y positivismo. SIEMPRE empieza con "Hoy" y ve directo al grano. Añade algo de humor que arranque una sonrisa sin ser cursi. NO te despidas al final.

Aquí tienes el tiempo hora por hora para HOY:
${weatherData.map(hour => `${hour.time}: ${hour.temperature}°C, ${hour.condition}`).join('\n')}

Sé MUY específico con las horas. Si va a llover, di exactamente a qué hora y con qué probabilidad. Por ejemplo: "Hoy nublado pero a las 12 de la mañana y a las 3 de la tarde lloverá con bastante posibilidad". 

Analiza los datos y da un resumen práctico pero con humor positivo y optimista. Máximo 2 emojis. Máximo 3-4 frases. SIEMPRE empieza con "Hoy". Menciona horas específicas cuando sea relevante.

Formato de respuesta:
TÍTULO: [un título corto y atractivo sobre el tiempo de HOY]
RESUMEN: [resumen específico del día con humor positivo]`;
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 150, temperature: 0.7 }),
  });
  const data = await r.json();
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  return res.status(r.status).json(data);
}
