import { setupWebhook } from '../src/TelegramBot.js';

export default async function handler(req, res) {
  // Solo permitir POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Obtener la URL base de Vercel
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const webhookUrl = `${baseUrl}/api/webhook`;
    
    console.log('[Setup] Configurando webhook en:', webhookUrl);

    // Configurar el webhook
    await setupWebhook(webhookUrl);

    res.status(200).json({ 
      message: 'Webhook configurado correctamente',
      webhookUrl 
    });

  } catch (error) {
    console.error('[Setup] Error configurando webhook:', error);
    res.status(500).json({ 
      message: 'Error configurando webhook',
      error: error.message 
    });
  }
} 