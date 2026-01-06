import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

function Navbar() {
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