import { useNavigate } from 'react-router-dom'
import { clearStoredUser } from '../../utils/session'
import { NAV_ITEMS } from '../../constants/sidebar'
import './Sidebar.css'

const Sidebar = ({ currentPage, user, isAuthPage }) => {
  const navigate = useNavigate()
  if (isAuthPage) return null

  const userInitials = user?.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'GU'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><i className="bi bi-bar-chart-fill"></i></div>
        <span className="logo-text">WealthTrack</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => navigate(item.path)}
            className={`nav-item sidebar-nav-button ${currentPage === item.page ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={() => navigate('/profile')}
          className={`sidebar-profile-btn ${currentPage === 'profile' ? 'active' : ''}`}
          title="View Profile"
        >
          <div className="user-avatar sidebar-profile-avatar">{userInitials}</div>
          <div className="sidebar-profile-text-wrap">
            <p className="user-name sidebar-profile-name">
              {user?.name || 'Guest'}
            </p>
            <p className="user-role sidebar-profile-role">
              {user ? 'Active Session' : 'Guest Access'}
            </p>
          </div>
        </button>
        {user && (
          <button
            onClick={() => { clearStoredUser(); navigate('/login') }}
            className="sidebar-logout sidebar-logout-button"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  )
}

export default Sidebar