import { useSyncExternalStore } from 'react'

// Small external store for saved medicines, backed by localStorage and shared
// across every component that reads it (cards, detail page, Saved page) so a
// toggle anywhere updates everywhere.

const KEY = 'medibuddy:favorites'
const listeners = new Set()
let cache = load()

function load() {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(next) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore quota / privacy-mode errors
  }
  listeners.forEach((l) => l())
}

// Keep only the fields a card needs, so localStorage stays small even though
// a full FDA label record is large.
function snapshot(result) {
  const o = result?.openfda || {}
  const pick = (k) => (o[k] && o[k].length ? { [k]: o[k].slice() } : {})
  return {
    id: result?.id,
    openfda: {
      ...pick('brand_name'),
      ...pick('generic_name'),
      ...pick('manufacturer_name'),
      ...pick('product_type'),
      ...pick('route'),
    },
  }
}

export function getFavorites() {
  return cache
}

export function isFavorite(id) {
  return cache.some((f) => f.id === id)
}

export function toggleFavorite(result) {
  if (!result?.id) return
  if (isFavorite(result.id)) {
    persist(cache.filter((f) => f.id !== result.id))
  } else {
    persist([snapshot(result), ...cache])
  }
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// React hook: re-renders subscribers whenever favorites change.
export function useFavorites() {
  return useSyncExternalStore(subscribe, getFavorites, getFavorites)
}
