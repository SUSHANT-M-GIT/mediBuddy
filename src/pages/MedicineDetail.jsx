import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

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

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result)
      return
    }

    async function fetchById() {
      setLoading(true)
      setError(null)
      try {
        const url = `https://api.fda.gov/drug/label.json?search=id:"${id}"&limit=1`
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
        <div className="header"><h1>MediBuddy</h1></div>
        <div className="container">
          <div className="status-msg">Loading medicine details…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="header"><h1>MediBuddy</h1></div>
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="status-msg error">{error}</div>
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

  return (
    <div>
      <div className="header"><h1>MediBuddy</h1></div>
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Results
        </button>

        <div className="detail-card">
          <h2>{brandName}</h2>

          <DetailRow label="Generic Name" value={genericName} />
          <DetailRow label="Manufacturer" value={manufacturer} />
          <DetailRow label="Product Type" value={productType} />
          <DetailRow label="Route" value={route} />
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
