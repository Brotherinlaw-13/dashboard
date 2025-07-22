# Example .env.local for Google Calendar Dashboard

Copy the following into a file named `.env.local` in your `mi-dashboard/` directory and fill in your calendar details:

```env
VITE_CALENDARS=[
  {
    "name": "Family",
    "url": "https://calendar.google.com/calendar/ical/your-family-calendar-url.ics",
    "color": "#FF5733"
  },
  {
    "name": "Work",
    "url": "https://calendar.google.com/calendar/ical/your-work-calendar-url.ics",
    "color": "#3375FF"
  }
]

# Google API Key for Geocoding (required for weather widget)
VITE_GOOGLE_API_KEY=your_google_api_key_here

# OpenAI API Key for weather summaries (optional - will use fallback if not provided)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

- You can add more calendar objects to the array as needed.
- Each calendar must have a `name`, `url`, and `color` (hex code).
- The Google API key is required for the weather widget to work.
- The OpenAI API key is optional - if not provided, the weather widget will use a simple fallback summary. 