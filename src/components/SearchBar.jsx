import { useState, useEffect, useRef } from 'react'

const MAX_RECENT = 5

function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState([])
  const [showRecent, setShowRecent] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowRecent(false)
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

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    saveToRecent(trimmed)
    setShowRecent(false)
    onSearch(trimmed)
  }

  function handleRecentClick(term) {
    setQuery(term)
    setShowRecent(false)
    saveToRecent(term)
    onSearch(term)
  }

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search medicines by brand name (e.g. advil)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowRecent(true)}
          disabled={loading}
          aria-label="Search medicines"
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {showRecent && recentSearches.length > 0 && (
        <div className="recent-dropdown">
          {recentSearches.map((term) => (
            <div key={term} className="recent-item" onClick={() => handleRecentClick(term)}>
              <span className="recent-icon">🕐</span>
              <span className="recent-term">{term}</span>
              <button
                className="recent-remove"
                onClick={(e) => removeFromRecent(e, term)}
                type="button"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
