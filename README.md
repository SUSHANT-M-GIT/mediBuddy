# MediBuddy

A medicine search app built with React. Type a brand name, get real drug label data back — ingredients, warnings, dosage, the works.

Live → https://assesment-medi-buddy.vercel.app/

---

## What it does

- Search medicines by brand name
- Results show as cards — brand, generic name, manufacturer, type, route
- Click any card for the full label detail (warnings, dosage, indications, etc.)
- Save medicines to a personal list, share a link, or print the detail page
- Installable as an app — works like a native app on Android, iOS, and desktop
- Dark mode
- Recent searches + live autocomplete as you type

---

## Stack

- React + Vite
- React Router
- Plain CSS (no UI library)
- Vercel (hosting + serverless function)
- FDA Drug Label API (data source)

---

## Running locally

```bash
npm install
npm run dev
```

---

## How the API works

All requests go through a serverless function at `/api/label` instead of hitting the FDA directly. This keeps the rate limits from being an issue when multiple people use the app at the same time.

The function supports three modes:

```
/api/label?search=advil&limit=20      search by brand name
/api/label?id=<id>&limit=1            fetch a single medicine
/api/label?suggest=adv&limit=8        autocomplete suggestions
```

Results get cached at Vercel's edge for 24 hours, so the same search from different users only hits the FDA API once per day. The service worker caches previously seen searches in the browser too, so repeat searches are instant and work offline.

If you have an FDA API key, add it as `FDA_API_KEY` in your Vercel environment variables. The function picks it up automatically and the rate limit goes way up.

---

## Notes

FDA data is US medicines only. Search using US brand names — advil, tylenol, benadryl, etc.
