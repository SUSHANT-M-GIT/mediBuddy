# MediBuddy — Medicine Search App

MediBuddy is a simple web app where you can search for medicines by brand name and get detailed information about them. It uses the FDA Drug Label API to fetch real medicine data.

---

## Features

- Search medicines by brand name
- View results as clean cards showing brand name, generic name, manufacturer, type and route
- Click any medicine to see full details like ingredients, warnings, dosage and more
- Back button to return to search results
- Works on both desktop and mobile

---

## Tech Stack

- React
- Vite
- React Router
- Plain CSS
- FDA Drug Label API

---

## How to Run

```bash
npm install
npm run dev
```

After running `npm run dev`, Vite will show the local URL in the terminal. Open that in your browser.

---

## API

This app uses the FDA Drug Label API:

```
https://api.fda.gov/drug/label.json?search=openfda.brand_name:"QUERY"&limit=20
```

No API key needed. It's a free public API.

---

## Note

The FDA database contains US medicines. So search using US brand names like `advil`, `tylenol`, `benadryl` etc.
