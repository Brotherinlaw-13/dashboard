export default async function handler(req, res) {
  console.log('[Webhook] Request recibido:', req.method, req.url);
  console.log('[Webhook] Body:', JSON.stringify(req.body, null, 2));

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

    // Por ahora, solo responder OK sin procesar
    console.log('[Webhook] Respuesta exitosa');
    res.status(200).json({ 
      message: 'OK',
      received: message.text,
      from: message.from?.first_name || 'Unknown'
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