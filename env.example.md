# Environment Variables Example

## Google Calendar API
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_CALENDAR_IDS=["calendar_id_1", "calendar_id_2"]

## OpenAI API (for weather summaries)
VITE_OPENAI_API_KEY=your_openai_api_key_here

## Telegram Bot (for notes widget)
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

## Instructions:
1. Copy this file to `.env.local`
2. Replace the placeholder values with your actual API keys
3. For Telegram Bot:
   - Create a bot with @BotFather on Telegram
   - Get the bot token and add it to VITE_TELEGRAM_BOT_TOKEN
   - Deploy to Vercel and the webhook will be automatically configured
   - The webhook URL will be: https://your-app.vercel.app/api/webhook 