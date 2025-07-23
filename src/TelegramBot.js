// Telegram Bot para notas del dashboard
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

// Almacenamiento temporal de mensajes (en producción usarías una base de datos)
let dailyMessages = {};

// Función para obtener la fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Función para resetear mensajes a las 12am
function resetDailyMessages() {
  const today = getCurrentDate();
  if (!dailyMessages[today]) {
    dailyMessages[today] = {};
  }
}

// Función para obtener mensajes del día actual
export function getDailyMessages() {
  const today = getCurrentDate();
  resetDailyMessages();
  return dailyMessages[today] || {};
}

// Función para procesar mensaje entrante
export async function processIncomingMessage(message) {
  const today = getCurrentDate();
  const userId = message.from.id;
  const userName = message.from.first_name || message.from.username || 'Usuario';
  const text = message.text;

  if (!text) return;

  resetDailyMessages();

  // Almacenar mensaje (solo 1 por persona por día)
  dailyMessages[today][userId] = {
    name: userName,
    message: text,
    timestamp: new Date().toISOString()
  };

  console.log(`[TelegramBot] Mensaje recibido de ${userName}: ${text}`);
}

// Función para configurar webhook
export async function setupWebhook(webhookUrl) {
  if (!BOT_TOKEN) {
    console.error('[TelegramBot] No se encontró BOT_TOKEN');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
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
    console.log('[TelegramBot] Webhook configurado:', result);
    return result;
  } catch (error) {
    console.error('[TelegramBot] Error configurando webhook:', error);
    throw error;
  }
}

// Función para obtener información del bot
export async function getBotInfo() {
  if (!BOT_TOKEN) return null;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const result = await response.json();
    return result.ok ? result.result : null;
  } catch (error) {
    console.error('[TelegramBot] Error obteniendo info del bot:', error);
    return null;
  }
}

// Función para enviar mensaje de confirmación
export async function sendConfirmation(chatId, message) {
  if (!BOT_TOKEN) return;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ Nota guardada: "${message}"\n\nSe mostrará en el dashboard hasta las 12am.`
      })
    });
  } catch (error) {
    console.error('[TelegramBot] Error enviando confirmación:', error);
  }
}

// Inicializar reset diario
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    dailyMessages = {};
    console.log('[TelegramBot] Mensajes diarios reseteados');
  }
}, 60000); // Verificar cada minuto 