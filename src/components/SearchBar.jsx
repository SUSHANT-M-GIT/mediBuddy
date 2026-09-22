import { useState } from 'react'

function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      onSearch(trimmed)
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search medicines by brand name (e.g. advil)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
        aria-label="Search medicines"
      />
      <button type="submit" disabled={loading || !query.trim()}>
        {loading ? 'Searching…' : 'Search'}
      </button>
    </form>
  )
}

export default SearchBar
