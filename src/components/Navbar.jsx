import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useState } from 'react'
import './Navbar.css'

function Navbar({ user, onLogout }) {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <nav className="main-nav">
        {/* Brand */}
        <Link to="/" className="main-nav-brand" onClick={closeMenu}>
          HabitTracker
        </Link>

        {/* Hamburger Icon (Mobile Only) */}
        <button 
          className="hamburger-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>

        {/* Navigation Links and Profile */}
        <div className={`navbar-content ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" onClick={closeMenu} className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Overview</Link>
            <Link to="/weekly-stats" onClick={closeMenu} className={`nav-link ${location.pathname === '/weekly-stats' ? 'active' : ''}`}>Stats</Link>
            <Link to="/pomodoro" onClick={closeMenu} className={`nav-link ${location.pathname === '/pomodoro' ? 'active' : ''}`}>Pomodoro</Link>
            <Link to="/buddies" onClick={closeMenu} className={`nav-link ${location.pathname === '/buddies' ? 'active' : ''}`}>Buddies</Link>
            <Link to="/payment" onClick={closeMenu} className={`nav-link ${location.pathname === '/payment' ? 'active' : ''}`}>Premium</Link>
          </div>

          <div className="navbar-actions">
            <button onClick={toggleTheme} className="theme-toggle">
              {isDark ? '☀️' : '🌙'}
            </button>

            <div className="profile-section">
              <Link to="/profile" onClick={closeMenu} className="profile-link">
                {user && user.picture ? (
                  <img src={user.picture} alt="Profile" className="profile-img" />
                ) : (
                  <div className="profile-fallback">
                    {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="profile-name">{user ? user.name : 'User'}</span>
              </Link>
              <button onClick={() => { closeMenu(); onLogout(); }} className="logout-btn">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar