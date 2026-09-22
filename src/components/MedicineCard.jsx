import { useNavigate } from 'react-router-dom'

function getField(openfda, key) {
  const val = openfda?.[key]
  if (!val || val.length === 0) return null
  return val.join(', ')
}

function MedicineCard({ result }) {
  const navigate = useNavigate()
  const openfda = result?.openfda || {}

  const brandName = getField(openfda, 'brand_name') || 'Unknown Brand'
  const genericName = getField(openfda, 'generic_name')
  const manufacturer = getField(openfda, 'manufacturer_name')
  const productType = getField(openfda, 'product_type')
  const route = getField(openfda, 'route')

  function handleClick() {
    navigate(`/medicine/${result.id}`, { state: { result } })
  }

  return (
    <div className="medicine-card">
      <div className="brand-name">{brandName}</div>

      {genericName && (
        <div className="field">
          <span>Generic: </span>{genericName}
        </div>
      )}
      {manufacturer && (
        <div className="field">
          <span>Manufacturer: </span>{manufacturer}
        </div>
      )}
      {productType && (
        <div className="field">
          <span>Type: </span>{productType}
        </div>
      )}
      {route && (
        <div className="field">
          <span>Route: </span>{route}
        </div>
      )}

      <button className="view-btn" onClick={handleClick}>
        View Details
      </button>
    </div>
  )
}

export default MedicineCard
