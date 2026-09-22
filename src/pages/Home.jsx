import { useState, useRef } from 'react'
import SearchBar from '../components/SearchBar'
import MedicineCard from '../components/MedicineCard'

const cache = {}

function Home() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const abortControllerRef = useRef(null)
  const debounceTimerRef = useRef(null)

  async function fetchMedicines(query) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

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
      const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(query)}"&limit=20`
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

  return (
    <div>
      <div className="header">
        <h1>MediBuddy</h1>
        <p>Search medicines using the FDA Drug Label database</p>
      </div>

      <div className="container">
        <SearchBar onSearch={handleSearch} loading={loading} />

        {loading && (
          <div className="status-msg">Searching…</div>
        )}

        {!loading && error && (
          <div className="status-msg error">{error}</div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="status-msg">No results found. Try a different brand name.</div>
        )}

        {!loading && !error && results.length > 0 && (
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
          <div className="status-msg">
            Enter a medicine brand name above to get started.
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
