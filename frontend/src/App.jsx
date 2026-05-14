import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import UploadReport from './pages/UploadReport'
import ProMembership from './pages/ProMembership'
import ConsultationRequest from './pages/ConsultationRequest'
import History from './pages/History'
import Profile from './pages/Profile'
import DietTracker from './pages/DietTracker'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadReport />} />
        <Route path="/pro" element={<ProMembership />} />
        <Route path="/consultation" element={<ConsultationRequest />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/diet" element={<DietTracker />} />
      </Routes>
    </Router>
  )
}

export default App

