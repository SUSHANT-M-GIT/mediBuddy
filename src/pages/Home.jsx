import { useState, useRef } from 'react'
import SearchBar from '../components/SearchBar'
import MedicineCard from '../components/MedicineCard'
import Header from '../components/Header'

const cache = {}
const EXAMPLES = ['advil', 'tylenol', 'benadryl', 'motrin', 'claritin']

function Home() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [lastQuery, setLastQuery] = useState('')

  const abortControllerRef = useRef(null)
  const debounceTimerRef = useRef(null)

  async function fetchMedicines(query) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setLastQuery(query)

    if (cache[query]) {
      setResults(cache[query])
      setError(null)
      setSearched(true)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const url = `/api/label?search=${encodeURIComponent(query)}&limit=20`
      const res = await fetch(url, { signal: controller.signal })

      if (res.status === 404) {
        setResults([])
        setLoading(false)
        return
      }

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      const items = data?.results || []

      cache[query] = items
      setResults(items)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError('Something went wrong. Please check your connection and try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(query) {
    clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      fetchMedicines(query)
    }, 300)
  }

  // Immediate search used by the example chips and the retry button.
  function runSearch(query) {
    if (!query) return
    clearTimeout(debounceTimerRef.current)
    fetchMedicines(query)
  }

  return (
    <div>
      <Header />

      <div className="hero">
        <h2>Find any <span>medicine</span> instantly</h2>
        <p>Search using brand names from the FDA Drug Label database</p>
        <SearchBar onSearch={handleSearch} loading={loading} />
        <div className="trust">
          <span className="dot" />
          Powered by official FDA drug label data
        </div>
      </div>

      <div className="container">
        {loading && (
          <div className="cards-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="skeleton-card" key={i} aria-hidden="true">
                <div className="skeleton title" />
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton btn" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="error-card">
            <div className="error-emoji">⚠️</div>
            <p>{error}</p>
            {lastQuery && (
              <button className="retry-btn" onClick={() => runSearch(lastQuery)}>Try again</button>
            )}
          </div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="empty-state">
            <h3>No results found</h3>
            <p>We couldn't find that brand. Try another name.</p>
            <div className="example-chips">
              {EXAMPLES.map((t) => (
                <button key={t} className="chip" onClick={() => runSearch(t)}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && searched && results.length > 0 && (
          <>
            <p className="result-count">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
            <div className="cards-grid">
              {results.map((result) => (
                <MedicineCard key={result.id} result={result} />
              ))}
            </div>
          </>
        )}

        {!loading && !searched && (
          <div className="empty-state">
            <h3>Search for a medicine</h3>
            <p>Try one of these popular brand names to get started</p>
            <div className="example-chips">
              {EXAMPLES.map((t) => (
                <button key={t} className="chip" onClick={() => runSearch(t)}>{t}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
