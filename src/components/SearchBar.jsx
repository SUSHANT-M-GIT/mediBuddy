import { useState, useEffect, useRef } from 'react'

const MAX_RECENT = 5
const SUGGEST_DELAY = 200
const MIN_SUGGEST = 2

function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)

  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) setRecentSearches(JSON.parse(stored))
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function saveToRecent(term) {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, MAX_RECENT)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  function removeFromRecent(e, term) {
    e.stopPropagation()
    const updated = recentSearches.filter((s) => s !== term)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  function clearSuggestions() {
    setSuggestions([])
    setActiveIdx(-1)
    if (abortRef.current) abortRef.current.abort()
  }

  async function fetchSuggestions(raw) {
    const term = raw.trim()
    if (term.length < MIN_SUGGEST) {
      clearSuggestions()
      return
    }
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch(`/api/label?suggest=${encodeURIComponent(term)}&limit=8`, {
        signal: controller.signal,
      })
      if (res.status !== 200) {
        clearSuggestions()
        return
      }
      const data = await res.json()
      const items = data?.results || []
      // Collect distinct brand names, keep those containing the prefix, and put
      // names that start with the prefix first.
      const seen = new Set()
      const names = []
      for (const r of items) {
        const arr = r?.openfda?.brand_name || []
        for (const n of arr) {
          const lower = n.toLowerCase()
          if (!lower.includes(term.toLowerCase())) continue
          if (seen.has(lower)) continue
          seen.add(lower)
          names.push(n)
        }
      }
      names.sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(term.toLowerCase()) ? 0 : 1
        const bStarts = b.toLowerCase().startsWith(term.toLowerCase()) ? 0 : 1
        return aStarts - bStarts
      })
      setSuggestions(names.slice(0, 6))
      setActiveIdx(-1)
    } catch (err) {
      if (err.name !== 'AbortError') clearSuggestions()
    }
  }

  function handleChange(e) {
    const v = e.target.value
    setQuery(v)
    setShowDropdown(true)
    clearTimeout(debounceRef.current)
    if (v.trim().length >= MIN_SUGGEST) {
      debounceRef.current = setTimeout(() => fetchSuggestions(v), SUGGEST_DELAY)
    } else {
      clearSuggestions()
    }
  }

  function selectTerm(term) {
    setQuery(term)
    setShowDropdown(false)
    clearSuggestions()
    clearTimeout(debounceRef.current)
    saveToRecent(term)
    onSearch(term)
  }

  function handleKeyDown(e) {
    const open = showDropdown && suggestions.length > 0
    if (open) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => (i + 1) % suggestions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length)
      } else if (e.key === 'Escape') {
        clearSuggestions()
        setShowDropdown(false)
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault()
        selectTerm(suggestions[activeIdx])
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    selectTerm(trimmed)
  }

  const showRecent = showDropdown && query.trim().length < MIN_SUGGEST && recentSearches.length > 0
  const showSuggest = showDropdown && query.trim().length >= MIN_SUGGEST && suggestions.length > 0
  const dropdownOpen = showRecent || showSuggest

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search medicines by brand name (e.g. advil)"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          disabled={loading}
          aria-label="Search medicines"
          role="combobox"
          aria-expanded={dropdownOpen}
          aria-controls="search-listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeIdx >= 0 ? `opt-${activeIdx}` : undefined}
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {dropdownOpen && (
        <div className="search-dropdown" id="search-listbox" role="listbox" aria-label="Medicine suggestions">
          {showSuggest
            ? suggestions.map((term, i) => (
                <button
                  key={term}
                  id={`opt-${i}`}
                  role="option"
                  aria-selected={i === activeIdx}
                  type="button"
                  className={`dropdown-item ${i === activeIdx ? 'highlighted' : ''}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => selectTerm(term)}
                >
                  <span className="item-icon" aria-hidden="true">🔍</span>
                  <span className="item-text">{term}</span>
                </button>
              ))
            : (
              <>
                <div className="dropdown-section-label">Recent searches</div>
                {recentSearches.map((term) => (
                  <div key={term} className="dropdown-item" onClick={() => selectTerm(term)}>
                    <span className="item-icon" aria-hidden="true">🕐</span>
                    <span className="item-text">{term}</span>
                    <button
                      className="remove-btn"
                      onClick={(e) => removeFromRecent(e, term)}
                      type="button"
                      aria-label={`Remove ${term} from recent searches`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </>
            )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
