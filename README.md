# MediBuddy — Medicine Search App

MediBuddy is a simple web app where you can search for medicines by brand name and get detailed information about them. It uses the FDA Drug Label API to fetch real medicine data.

---

# LIVE URL
https://assesment-medi-buddy.vercel.app/

## Features

- Search medicines by brand name
- View results as clean cards showing brand name, generic name, manufacturer, type and route
- Click any medicine to see full details like ingredients, warnings, dosage and more
- Back button to return to search results
- Works on both desktop and mobile
- Installable as an app (PWA): add it to your home screen / desktop and use seen searches offline
- Recent searches and clickable example suggestions
- Live autocomplete suggestions as you type (powered by the FDA API)
- Save medicines to a Saved list (stored on your device, works offline)
- Share a medicine's details (Web Share with clipboard fallback) and print the detail page
- Light / dark mode toggle, remembers your choice
- Built for scale: results are cached on Vercel's edge and in the browser

---

## Tech Stack

- React
- Vite
- React Router
- Plain CSS
- Vite PWA (service worker + web manifest)
- Vercel Serverless Function (caching proxy)
- FDA Drug Label API (upstream data source)

---

## How to Run

```bash
npm install
npm run dev
```

After running `npm run dev`, Vite will show the local URL in the terminal. Open that in your browser.

---

## API & Scaling

The app does **not** call the FDA API directly from the browser. Instead it goes through a
caching serverless function at `/api/label`, which fronts the FDA Drug Label API:

```
/api/label?search=<brand>&limit=20      -> search by brand name
/api/label?id=<id>&limit=1              -> fetch a single medicine by id
/api/label?suggest=<prefix>&limit=8     -> autocomplete via a trailing wildcard
```

Why a proxy? The FDA API is rate-limited (about 240 requests/minute without a key), so a
spike in users hitting it directly causes errors. The proxy fixes this with two cache layers:

1. **Edge cache** — successful and "no results" responses are cached on Vercel's edge for 24h
   (`s-maxage=86400`), so the same search across all users resolves at the edge and the FDA
   API is called at most once per query per day.
2. **Service worker cache** — the browser also caches seen `/api/label` responses
   (StaleWhileRevalidate), so repeated searches load instantly and work offline.

The upstream query is `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"QUERY"&limit=20`.

### Optional: higher rate limits

The FDA API allows ~120,000 requests/minute with an API key. Set one to raise the ceiling
without exposing the key in the browser:

1. Request a key at https://open.fda.gov/api/api-key/
2. Add `FDA_API_KEY` to your Vercel project environment variables
3. Redeploy — `api/label.js` picks it up automatically

## Installable app (PWA)

MediBuddy is a Progressive Web App. After deploying over HTTPS (Vercel does this), browsers
show an "Install" option, and the app runs standalone with its own icon. Icons are generated
from `public/icon.svg`:

```bash
node scripts/generate-pwa-icons.mjs
```

---

## Note

The FDA database contains US medicines. So search using US brand names like `advil`, `tylenol`, `benadryl` etc.
