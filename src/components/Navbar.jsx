import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

function Navbar() {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          Habit Tracker
        </Link>
        <div className="navbar__content">
          <div className="navbar__links">
            <Link 
              to="/" 
              className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
            >
              Monthly View
            </Link>
            <Link 
              to="/weekly-stats" 
              className={`navbar__link ${location.pathname === '/weekly-stats' ? 'navbar__link--active' : ''}`}
            >
              Weekly Stats
            </Link>
          </div>
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar