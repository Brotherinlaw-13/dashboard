# Raspberry Pi Google Calendar Dashboard

This dashboard displays upcoming events from multiple public Google Calendars using their iCal URLs. Each calendar is color-coded for clarity.

## Setup

1. **Configure Calendars**
   - Edit `src/calendarConfig.js` to add your public Google Calendar iCal URLs and assign a color to each.
   - Example:
     ```js
     export default [
       {
         name: "Family",
         url: "https://calendar.google.com/calendar/ical/your-family-calendar-url.ics",
         color: "#FF5733"
       },
       // Add more calendars as needed
     ];
     ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the dashboard**
   ```bash
   npm run dev
   ```
   - Open the provided local URL in your browser (e.g., on your Raspberry Pi display).

## Features
- Fetches and displays up to 20 upcoming events from all configured calendars
- Color-codes events by calendar
- Ongoing events are labeled "Now" and pinned to the top
- Updates every 10 minutes
- Shows a placeholder if there are no upcoming events

## Notes
- Only public Google Calendar iCal URLs are supported (no authentication required)
- For best results, use on a Raspberry Pi with a browser in kiosk mode
