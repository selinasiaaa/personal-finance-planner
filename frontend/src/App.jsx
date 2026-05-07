import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { getStoredUser } from './utils/session'
import { ROUTES, AUTH_ROUTES, ROUTE_PAGE_MAP } from './constants/routes'
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

  const isAuthPage = AUTH_ROUTES.includes(location.pathname)
  const currentPage = ROUTE_PAGE_MAP[location.pathname] || 'goals'

  useEffect(() => {
    setUser(getStoredUser())
  }, [location.pathname])

  return (
    <div className="app-shell">
      {!isAuthPage && <Sidebar currentPage={currentPage} user={resolvedUser} isAuthPage={isAuthPage} />}
      <div className="app-content">
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage user={resolvedUser} />} />
          <Route path={ROUTES.GOALS} element={<ProtectedRoute><GoalsPage user={resolvedUser} /></ProtectedRoute>} />
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage user={resolvedUser} /></ProtectedRoute>} />
          <Route path={ROUTES.INVESTMENTS} element={<ProtectedRoute><InvestmentsPage user={resolvedUser} /></ProtectedRoute>} />
          <Route path={ROUTES.ROI} element={<ProtectedRoute><RoiPage user={resolvedUser} /></ProtectedRoute>} />
          <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage user={resolvedUser} setUser={setUser} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={ROUTES.GOALS} />} />
        </Routes>
      </div>
    </div>
  )
}