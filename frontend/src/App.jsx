import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import BlockchainTracker from './pages/BlockchainTracker'
import PrecisionAnalytics from './pages/PrecisionAnalytics'

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blockchain" element={<BlockchainTracker />} />
          <Route path="/analytics" element={<PrecisionAnalytics />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
