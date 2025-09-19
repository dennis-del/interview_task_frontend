// App.tsx - Simplified version
import { Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import './App.css'
import Auth from './pages/Auth'
import AdminDashboard from './pages/admin/AdminDashboard'
import ParticipantDashboard from './pages/participant/ParticipantDashboard'

function App() {
  const { isAuthenticated, user } = useAuth()

  // For debugging
  console.log('Auth state:', { isAuthenticated, user });

  return (
    <>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/participant-dashboard" element={<ParticipantDashboard />} />
      </Routes>
    </>
  )
}

export default App