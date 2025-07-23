export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  console.log('[Webhook] Request recibido:', req.method, req.url);
  console.log('[Webhook] Token disponible:', !!BOT_TOKEN);
  console.log('[Webhook] Token:', BOT_TOKEN ? BOT_TOKEN.substring(0, 10) + '...' : 'NO TOKEN');

  // Solo permitir POST requests
  if (req.method !== 'POST') {
    console.log('[Webhook] Método no permitido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    // Verificar que hay un mensaje
    if (!message || !message.text) {
      console.log('[Webhook] No hay mensaje válido:', req.body);
      return res.status(200).json({ message: 'No message to process' });
    }

    console.log('[Webhook] Mensaje recibido:', message);

    // Enviar confirmación al usuario si tenemos token
    if (BOT_TOKEN && message.chat && message.chat.id) {
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: `✅ Nota recibida: "${message.text}"`
          })
        });
      } catch (error) {
        console.error('[Webhook] Error enviando confirmación:', error);
      }
    }

    // Responder OK
    console.log('[Webhook] Respuesta exitosa');
    res.status(200).json({ 
      message: 'OK',
      received: message.text,
      from: message.from?.first_name || 'Unknown',
      tokenAvailable: !!BOT_TOKEN
    });

  } catch (error) {
    console.error('[Webhook] Error procesando mensaje:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: error.stack 
    });
  }
} 