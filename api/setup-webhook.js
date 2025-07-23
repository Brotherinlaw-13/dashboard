export default async function handler(req, res) {
  // Solo permitir POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Obtener la URL base de Vercel
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://dashboard-sigma-three-72.vercel.app';

    const webhookUrl = `${baseUrl}/api/webhook`;
    const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN;
    
    console.log('[Setup] Configurando webhook en:', webhookUrl);
    console.log('[Setup] Bot token disponible:', !!botToken);

    if (!botToken) {
      throw new Error('Bot token no encontrado');
    }

    // Configurar el webhook directamente
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message']
      })
    });

    const result = await response.json();
    console.log('[Setup] Respuesta de Telegram:', result);

    res.status(200).json({ 
      message: 'Webhook configurado correctamente',
      webhookUrl,
      telegramResponse: result
    });

  } catch (error) {
    console.error('[Setup] Error configurando webhook:', error);
    res.status(500).json({ 
      message: 'Error configurando webhook',
      error: error.message,
      stack: error.stack
    });
  }
} 