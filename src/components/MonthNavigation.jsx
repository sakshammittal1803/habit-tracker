import { formatMonth } from '../utils/dateUtils'

function MonthNavigation({ currentMonthStart, onNavigate }) {
  return (
    <div className="date-navigation">
      <button
        className="nav-btn"
        onClick={() => onNavigate(-1)}
        aria-label="Previous month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div className="current-month">
        {formatMonth(currentMonthStart)}
      </div>

      <button
        className="nav-btn"
        onClick={() => onNavigate(1)}
        aria-label="Next month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  )
}

export default MonthNavigation