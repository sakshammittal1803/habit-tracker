import HabitRow from './HabitRow'
import { getMonthDates } from '../utils/dateUtils'

function HabitGrid({ habits, currentMonthStart, onDeleteHabit, onToggleCompletion }) {
  const monthDates = getMonthDates(currentMonthStart)
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
      {/* Header Row */}
      <div className="grid-header">
        <div className="col-name">HABIT</div>
        <div className="col-days">
          {monthDates.map((date) => (
            <div key={date.toISOString()} className="header-day-cell">
              {date.getDate()}
            </div>
          ))}
        </div>
        <div className="col-stats">ANALYSIS</div>
      </div>

      {/* Rows Container (Scrollable) */}
      <div className="rows-container">
        {habits.map(habit => (
          <HabitRow
            key={habit.id}
            habit={habit}
            currentMonthStart={currentMonthStart}
            onDelete={() => onDeleteHabit(habit.id)}
            onToggleCompletion={onToggleCompletion}
          />
        ))}
      </div>
    </div>
  )
}

export default HabitGrid