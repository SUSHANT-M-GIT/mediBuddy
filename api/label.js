// Vercel Serverless Function: a caching proxy in front of the FDA Drug Label API.
//
// Why this exists: the FDA API is rate-limited (~240 req/min without a key).
// If every user's browser hits it directly, traffic spikes cause 429s and the
// app feels broken. This proxy:
//   - Caches responses on Vercel's edge for 24h via Cache-Control headers, so
//     identical searches across ALL users resolve at the edge (one FDA call
//     per query globally per day).
//   - Keeps a small per-instance in-memory cache as a secondary layer.
//   - Optionally uses an FDA API key (set FDA_API_KEY in Vercel env) for higher
//     rate limits, without ever exposing it to the browser.
//
// Frontend calls:
//   /api/label?search=<brand>&limit=20   search by brand name
//   /api/label?id=<id>&limit=1           fetch a single medicine by id
//   /api/label?suggest=<prefix>&limit=8  autocomplete via a trailing wildcard
// In dev (npm run dev) the same handler runs as Vite middleware (see vite.config.js).

const FDA_BASE = 'https://api.fda.gov/drug/label.json'
const API_KEY = process.env.FDA_API_KEY
const MEM_TTL = 24 * 60 * 60 * 1000 // 24h
const memCache = new Map()

function parseQuery(req) {
  try {
    // req.url is the full path+query (portable across Vercel + Vite middleware).
    return new URL(req.url, 'http://localhost').searchParams
  } catch {
    return new URLSearchParams('')
  }
}

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(body)
}

function cacheable(status, res) {
  if (status === 200 || status === 404) {
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400')
  } else {
    res.setHeader('Cache-Control', 'no-store')
  }
}

export default async function handler(req, res) {
  const params = parseQuery(req)
  const search = params.get('search')
  const id = params.get('id')
  const suggest = params.get('suggest')
  const limit = Math.min(parseInt(params.get('limit'), 10) || 20, 100)

  let url
  if (id) {
    url = `${FDA_BASE}?search=id:"${encodeURIComponent(id)}"&limit=1`
  } else if (search) {
    url = `${FDA_BASE}?search=openfda.brand_name:"${encodeURIComponent(search)}"&limit=${limit}`
  } else if (suggest) {
    const term = suggest.trim()
    if (term.length < 2) {
      res.setHeader('Cache-Control', 'no-store')
      send(res, 400, JSON.stringify({ error: 'suggest needs at least 2 characters.' }))
      return
    }
    // Trailing wildcard gives prefix/token autocomplete (e.g. adv* -> Advil, Advanced...).
    url = `${FDA_BASE}?search=openfda.brand_name:${encodeURIComponent(term)}*&limit=${limit}`
  } else {
    res.setHeader('Cache-Control', 'no-store')
    send(res, 400, JSON.stringify({ error: 'Missing "search", "id" or "suggest" parameter.' }))
    return
  }
  if (API_KEY) url += `&api_key=${API_KEY}`

  const cached = memCache.get(url)
  if (cached && Date.now() - cached.t < MEM_TTL) {
    cacheable(cached.status, res)
    return send(res, cached.status, cached.body)
  }

  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'MediBuddy/1.0' } })
    const status = upstream.status
    const body = await upstream.text()

    if (status === 200 || status === 404) {
      memCache.set(url, { status, body, t: Date.now() })
    }
    cacheable(status, res)
    send(res, status, body)
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store')
    send(res, 502, JSON.stringify({ error: 'Failed to reach the FDA API.' }))
  }
}
