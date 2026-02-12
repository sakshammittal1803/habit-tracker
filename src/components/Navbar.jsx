import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

function Navbar({ user, onLogout }) {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          HabitTracker
        </Link>
        <div className="navbar__content">
          <div className="navbar__links">
            <Link
              to="/"
              className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
            >
              Overview
            </Link>
            <Link
              to="/weekly-stats"
              className={`navbar__link ${location.pathname === '/weekly-stats' ? 'navbar__link--active' : ''}`}
            >
              Stats
            </Link>
            <Link
              to="/pomodoro"
              className={`navbar__link ${location.pathname === '/pomodoro' ? 'navbar__link--active' : ''}`}
            >
              Pomodoro
            </Link>
            <Link
              to="/payment"
              className={`navbar__link ${location.pathname === '/payment' ? 'navbar__link--active' : ''}`}
            >
              Premium
            </Link>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <div className="navbar__profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)' }}>
            {user && user.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user ? user.name : 'User'}</span>
              <button
                onClick={onLogout}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar