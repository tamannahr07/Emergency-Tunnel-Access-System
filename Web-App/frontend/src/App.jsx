import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DetailsPage from './pages/DetailsPage'
import AuthorizationPage from './pages/AuthorizationPage'
import BiometricPage from './pages/BiometricPage'
import ActivationPage from './pages/ActivationPage'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'

// Simple auth guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('sgs_token')
  return token ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <Routes>
        <Route path="/"          element={<LoginPage />} />
        <Route path="/details"   element={<ProtectedRoute><DetailsPage /></ProtectedRoute>} />
        <Route path="/authorize" element={<ProtectedRoute><AuthorizationPage /></ProtectedRoute>} />
        <Route path="/biometric" element={<ProtectedRoute><BiometricPage /></ProtectedRoute>} />
        <Route path="/activation" element={<ProtectedRoute><ActivationPage /></ProtectedRoute>} />
        <Route path="/admin"     element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
