import { useNavigate } from 'react-router-dom'
import { useFavorites, toggleFavorite } from '../lib/favorites'

function getField(openfda, key) {
  const val = openfda?.[key]
  if (!val || val.length === 0) return null
  return val.join(', ')
}

// Turns the FDA product_type string (e.g. "HUMAN OTC DRUG") into a short badge.
function typeBadge(productType) {
  if (!productType) return null
  const t = productType.toLowerCase()
  if (t.includes('otc')) return { label: 'OTC', cls: 'otc' }
  if (t.includes('prescription')) return { label: 'Rx', cls: 'rx' }
  const first = productType.split(' ')[0]
  return { label: first, cls: 'other' }
}

function MedicineCard({ result }) {
  const navigate = useNavigate()
  const favorites = useFavorites()
  const isFav = favorites.some((f) => f.id === result.id)

  const openfda = result?.openfda || {}
  const brandName = getField(openfda, 'brand_name') || 'Unknown Brand'
  const genericName = getField(openfda, 'generic_name')
  const manufacturer = getField(openfda, 'manufacturer_name')
  const productType = getField(openfda, 'product_type')
  const route = getField(openfda, 'route')
  const badge = typeBadge(productType)

  function handleClick() {
    navigate(`/medicine/${result.id}`, { state: { result } })
  }

  function handleKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  function handleFav(e) {
    e.stopPropagation()
    toggleFavorite(result)
  }

  return (
    <div
      className="medicine-card"
      onClick={handleClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${brandName}`}
    >
      <div className="card-top">
        <div className="brand-name">{brandName}</div>
        <div className="card-top-right">
          {badge && <span className={`type-badge ${badge.cls}`}>{badge.label}</span>}
          <button
            className={`fav-btn ${isFav ? 'saved' : ''}`}
            onClick={handleFav}
            aria-label={isFav ? `Remove ${brandName} from saved` : `Save ${brandName}`}
            aria-pressed={isFav}
          >
            {isFav ? '♥' : '♡'}
          </button>
        </div>
      </div>

      {genericName && (
        <div className="field"><span>Generic: </span>{genericName}</div>
      )}
      {manufacturer && (
        <div className="field"><span>Manufacturer: </span>{manufacturer}</div>
      )}
      {productType && (
        <div className="field"><span>Type: </span>{productType}</div>
      )}
      {route && (
        <div className="field"><span>Route: </span>{route}</div>
      )}

      <span className="view-btn">
        View Details <span className="arrow">→</span>
      </span>
    </div>
  )
}

export default MedicineCard
