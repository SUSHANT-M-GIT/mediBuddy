import { Link } from 'react-router-dom'
import Header from '../components/Header'
import MedicineCard from '../components/MedicineCard'
import { useFavorites } from '../lib/favorites'

// Lists medicines the user has saved via the heart button. Reads from the
// shared favorites store, so removing a favourite here (or anywhere) updates
// this view instantly.
function Saved() {
  const favorites = useFavorites()

  return (
    <div>
      <Header />
      <div className="container">
        {favorites.length === 0 ? (
          <div className="saved-empty">
            <div className="big-icon" aria-hidden="true">♡</div>
            <h3>No saved medicines yet</h3>
            <p>Tap the heart on any medicine to save it here for quick access.</p>
            <Link to="/" className="go-home-btn">Search medicines</Link>
          </div>
        ) : (
          <>
            <p className="result-count">
              {favorites.length} saved medicine{favorites.length !== 1 ? 's' : ''}
            </p>
            <div className="cards-grid">
              {favorites.map((r) => (
                <MedicineCard key={r.id} result={r} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Saved
