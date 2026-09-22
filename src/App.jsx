import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MedicineDetail from './pages/MedicineDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/medicine/:id" element={<MedicineDetail />} />
    </Routes>
  )
}

export default App
