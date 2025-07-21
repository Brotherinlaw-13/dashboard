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
```

- You can add more calendar objects to the array as needed.
- Each calendar must have a `name`, `url`, and `color` (hex code). 