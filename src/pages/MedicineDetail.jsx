import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useFavorites, toggleFavorite } from '../lib/favorites'

function getField(openfda, key) {
  const val = openfda?.[key]
  if (!val || val.length === 0) return null
  return val.join(', ')
}

function getTopField(result, key) {
  const val = result?.[key]
  if (!val || val.length === 0) return null
  return val[0]
}

// Short badge from the FDA product_type string (e.g. "HUMAN OTC DRUG" -> OTC).
function typeBadge(productType) {
  if (!productType) return null
  const t = productType.toLowerCase()
  if (t.includes('otc')) return { label: 'OTC', cls: 'otc' }
  if (t.includes('prescription')) return { label: 'Rx', cls: 'rx' }
  return { label: productType.split(' ')[0], cls: 'other' }
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="detail-section">
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
  )
}

function MedicineDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const favorites = useFavorites()

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result)
      return
    }

    async function fetchById() {
      setLoading(true)
      setError(null)
      try {
        const url = `/api/label?id=${encodeURIComponent(id)}&limit=1`
        const res = await fetch(url)

        if (res.status === 404) {
          setError('Medicine not found.')
          setLoading(false)
          return
        }

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }

        const data = await res.json()
        const item = data?.results?.[0]
        if (item) {
          setResult(item)
        } else {
          setError('Medicine not found.')
        }
      } catch (err) {
        setError('Could not load medicine details. Please go back and try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchById()
  }, [id])

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <span aria-hidden="true">←</span> Back
          </button>
          <div className="summary-card" aria-hidden="true">
            <div className="skeleton title" />
            <div className="skeleton" style={{ width: '42%', height: 12, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: '34%', height: 22 }} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Header />
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <span aria-hidden="true">←</span> Back to Results
          </button>
          <div className="error-card">
            <div className="error-emoji">⚠️</div>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  const openfda = result.openfda || {}

  const brandName = getField(openfda, 'brand_name') || 'Unknown Medicine'
  const genericName = getField(openfda, 'generic_name')
  const manufacturer = getField(openfda, 'manufacturer_name')
  const productType = getField(openfda, 'product_type')
  const route = getField(openfda, 'route')
  const substanceName = getField(openfda, 'substance_name')
  const applicationNumber = getField(openfda, 'application_number')

  const activeIngredient = getTopField(result, 'active_ingredient')
  const purpose = getTopField(result, 'purpose')
  const indications = getTopField(result, 'indications_and_usage')
  const warnings = getTopField(result, 'warnings')
  const dosage = getTopField(result, 'dosage_and_administration')
  const doNotUse = getTopField(result, 'do_not_use')
  const stopUse = getTopField(result, 'stop_use')
  const pregnancy = getTopField(result, 'pregnancy_or_breast_feeding')
  const keepOut = getTopField(result, 'keep_out_of_reach_of_children')

  const badge = typeBadge(productType)
  const isFav = favorites.some((f) => f.id === result.id)

  function handleFav() {
    toggleFavorite(result)
  }

  function handlePrint() {
    window.print()
  }

  async function handleShare() {
    const data = {
      title: `MediBuddy — ${brandName}`,
      text: genericName ? `${brandName} (${genericName})` : brandName,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(data)
      } catch {
        // user dismissed the share sheet
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {
        // clipboard unavailable
      }
    }
  }

  return (
    <div>
      <Header />
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span aria-hidden="true">←</span> Back to Results
        </button>

        <div className="summary-card">
          <h2>{brandName}</h2>
          {genericName && <p className="subtitle">{genericName}</p>}
          <div className="summary-meta">
            {badge && <span className={`type-badge ${badge.cls}`}>{badge.label}</span>}
            {route && <span className="meta-pill">{route}</span>}
            {manufacturer && <span className="meta-pill">{manufacturer}</span>}
          </div>

          <div className="detail-actions">
            <button
              className={`action-btn fav-action ${isFav ? 'saved' : ''}`}
              onClick={handleFav}
              aria-pressed={isFav}
              aria-label={isFav ? 'Remove from saved medicines' : 'Save medicine'}
            >
              {isFav ? '♥ Saved' : '♡ Save'}
            </button>
            <button className="action-btn share-btn" onClick={handleShare}>
              {copied ? 'Link copied!' : 'Share'}
            </button>
            <button className="action-btn" onClick={handlePrint}>
              <span aria-hidden="true">🖨️</span> Print
            </button>
          </div>
        </div>

        <div className="detail-card">
          <DetailRow label="Active Substance" value={substanceName} />
          <DetailRow label="Application Number" value={applicationNumber} />
          <DetailRow label="Active Ingredient" value={activeIngredient} />
          <DetailRow label="Purpose" value={purpose} />
          <DetailRow label="Uses / Indications" value={indications} />
          <DetailRow label="Warnings" value={warnings} />
          <DetailRow label="Dosage & Administration" value={dosage} />
          <DetailRow label="Do Not Use" value={doNotUse} />
          <DetailRow label="Stop Use" value={stopUse} />
          <DetailRow label="Pregnancy / Breast-Feeding" value={pregnancy} />
          <DetailRow label="Keep Out of Reach of Children" value={keepOut} />
        </div>
      </div>
    </div>
  )
}

export default MedicineDetail
