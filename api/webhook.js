import { processIncomingMessage, sendConfirmation } from '../src/TelegramBot.js';

export default async function handler(req, res) {
  // Solo permitir POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    // Verificar que hay un mensaje
    if (!message || !message.text) {
      return res.status(200).json({ message: 'No message to process' });
    }

    console.log('[Webhook] Mensaje recibido:', message);

    // Procesar el mensaje
    await processIncomingMessage(message);

    // Enviar confirmación al usuario
    if (message.chat && message.chat.id) {
      await sendConfirmation(message.chat.id, message.text);
    }

    // Responder a Telegram que todo está bien
    res.status(200).json({ message: 'OK' });

  } catch (error) {
    console.error('[Webhook] Error procesando mensaje:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 