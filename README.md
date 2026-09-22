# MediBuddy — Medicine Search App

A simple medicine search app built with React. You can search for medicines by brand name and it shows results from the FDA Drug Label API. Clicking on a result opens a detail page with more information about that medicine.

---

## Features

- Search medicines by brand name
- Shows results as cards with brand name, generic name, manufacturer, product type, and route
- Click any card to see detailed medicine information
- Back button to return to search results
- Loading, error, and no-results states are all handled
- Works even if you refresh the detail page or open its URL directly

---

## Tech Stack

- React 18
- Vite
- React Router v6
- Plain CSS
- Fetch API (no extra HTTP libraries)

---

## How to Run

```bash
npm install
npm run dev
```

After running `npm run dev`, Vite will show the local URL in the terminal. Open that URL in your browser.

To build for production:

```bash
npm run build
```
---
## API Used

FDA Drug Label API — https://open.fda.gov/apis/drug/label/

Search endpoint used:
```
https://api.fda.gov/drug/label.json?search=openfda.brand_name:"QUERY"&limit=20
```

No other API or data source is used.

## Performance

**Debounce** — Search is triggered on button click or Enter, with a small 300ms debounce to avoid accidental double requests.

**Caching** — Results are stored in a simple JavaScript object during the session. If you search the same query again, it uses the cached result instead of making another API call.

**Request cancellation** — Each fetch uses an `AbortController`. If a new search starts before the previous one finishes, the old request gets cancelled so it can't overwrite the new results.

**Memoization** — Not used. The app is simple enough that `useMemo` or `useCallback` would not actually help here.

**Request cancellation** — Each fetch uses an `AbortController`. If a new search starts before the previous one finishes, the old request gets cancelled so it can't overwrite the new results.

- While fetching: shows "Searching…" and disables the input
- If the API returns no results or a 404: shows "No results found"
- If there is a network or API error: shows an error message in red
- Before any search: shows a prompt to enter a medicine name

---

## Trade-offs

- Cache is only in memory, so it clears on page reload. This was kept simple on purpose.
- The detail page re-fetches from the API only when opened directly or refreshed. Normal navigation passes the data through router state, so no extra request is needed.
- No pagination — the API is called with `limit=20` as required.
