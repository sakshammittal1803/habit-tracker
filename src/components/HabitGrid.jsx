import HabitRow from './HabitRow'
import { getMonthDates } from '../utils/dateUtils'

function HabitGrid({ habits, dates, onDeleteHabit, onToggleCompletion }) {
  // Dates are now passed in
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  if (habits.length === 0) {
    return (
      <div className="habits-container" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="empty-state">
          <h3>No habits yet</h3>
          <p>Add your first habit above to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="habits-container">
      {/* Rows Container (Scrollable) includes Header now for sync scroll */}
      <div className="rows-container">
        {/* Header Row - Sticky */}
        <div className="grid-header">
          <div className="col-name">HABIT</div>
          <div className="col-days">
            {dates.map((date) => (
              <div key={date.toISOString()} className="header-day-cell">
                {date.getDate()}
              </div>
            ))}
          </div>
          <div className="col-stats">ANALYSIS</div>
        </div>

        {habits.map(habit => (
          <HabitRow
            key={habit.id}
            habit={habit}
            dates={dates}
            onDelete={() => onDeleteHabit(habit.id)}
            onToggleCompletion={onToggleCompletion}
          />
        ))}
      </div>
    </div>
  )
}

export default HabitGrid