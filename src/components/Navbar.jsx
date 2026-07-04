import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

function Navbar({ user, onLogout }) {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: 'var(--background-color)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Brand */}
      <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)', textDecoration: 'none' }}>
        HabitTracker
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: location.pathname === '/' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: location.pathname === '/' ? '600' : '400' }}>Overview</Link>
        <Link to="/weekly-stats" style={{ textDecoration: 'none', color: location.pathname === '/weekly-stats' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: location.pathname === '/weekly-stats' ? '600' : '400' }}>Stats</Link>
        <Link to="/pomodoro" style={{ textDecoration: 'none', color: location.pathname === '/pomodoro' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: location.pathname === '/pomodoro' ? '600' : '400' }}>Pomodoro</Link>
        <Link to="/buddies" style={{ textDecoration: 'none', color: location.pathname === '/buddies' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: location.pathname === '/buddies' ? '600' : '400' }}>Buddies</Link>
        <Link to="/payment" style={{ textDecoration: 'none', color: location.pathname === '/payment' ? 'var(--primary-color)' : 'var(--text-secondary)', fontWeight: location.pathname === '/payment' ? '600' : '400' }}>Premium</Link>
      </div>

      {/* Profile & Theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
          {isDark ? '☀️' : '🌙'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            {user && user.picture ? (
              <img src={user.picture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user ? user.name : 'User'}</span>
          </Link>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>Sign Out</button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar