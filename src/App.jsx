import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MedicineDetail from './pages/MedicineDetail'
import Saved from './pages/Saved'
import InstallPrompt from './components/InstallPrompt'

function App() {
  return (
    <>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/medicine/:id" element={<MedicineDetail />} />
      </Routes>
    </>
  )
}

export default App
