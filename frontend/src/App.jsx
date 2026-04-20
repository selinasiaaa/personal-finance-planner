import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { getStoredUser } from './utils/session'
import Sidebar from './components/Sidebar/Sidebar'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'
import ProfilePage from './pages/profile/ProfilePage'
import GoalsPage from './pages/goals/GoalsPage'
import InvestmentsPage from './pages/investments/InvestmentsPage'
import RoiPage from './pages/roi/RoiPage'
import DashboardPage from './pages/dashboard/DashboardPage'

const ProtectedRoute = ({ children }) => {
  const stored = getStoredUser()
  return stored?.email ? children : <Navigate to="/login" />
}

export default function App() {
  const [user, setUser] = useState(() => getStoredUser())
  const location = useLocation()
  const resolvedUser = user ?? getStoredUser()

  const isAuthPage = ['/login', '/register', '/forgot-password', '/change-password'].includes(location.pathname)
  const currentPageMap = { '/': 'goals', '/dashboard': 'dashboard', '/investments': 'investments', '/roi': 'roi', '/profile': 'profile' }
  const currentPage = currentPageMap[location.pathname] || 'goals'

  useEffect(() => {
    setUser(getStoredUser())
  }, [location.pathname])

  return (
    <div className="app-shell">
      {!isAuthPage && <Sidebar currentPage={currentPage} user={resolvedUser} isAuthPage={isAuthPage} />}
      <div className="app-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage user={resolvedUser} />} />
          <Route path="/" element={<ProtectedRoute><GoalsPage user={resolvedUser} /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage user={resolvedUser} /></ProtectedRoute>} />
          <Route path="/investments" element={<ProtectedRoute><InvestmentsPage user={resolvedUser} /></ProtectedRoute>} />
          <Route path="/roi" element={<ProtectedRoute><RoiPage user={resolvedUser} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage user={resolvedUser} setUser={setUser} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  )
}