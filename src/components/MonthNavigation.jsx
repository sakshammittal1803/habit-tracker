import { formatMonth } from '../utils/dateUtils'

function MonthNavigation({ currentMonthStart, onNavigate }) {
  return (
    <div className="date-navigation">
      <button 
        className="nav-button"
        onClick={() => onNavigate(-1)}
        aria-label="Previous month"
      >
        &lt;
      </button>
      <span className="current-month">
        {formatMonth(currentMonthStart)}
      </span>
      <button 
        className="nav-button"
        onClick={() => onNavigate(1)}
        aria-label="Next month"
      >
        &gt;
      </button>
    </div>
  )
}

export default MonthNavigation