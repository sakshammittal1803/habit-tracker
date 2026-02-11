import { getMonthDates, formatDate } from '../utils/dateUtils'

function HabitRow({ habit, currentMonthStart, onDelete, onToggleCompletion }) {
  const monthDates = getMonthDates(currentMonthStart)
  const today = new Date()
  const todayStr = formatDate(today)

  // Calculate stats
  const currentMonthCompletions = monthDates.filter(date => {
    return habit.completions[formatDate(date)]
  }).length

  const goal = habit.goal || monthDates.length
  const progress = Math.round((currentMonthCompletions / goal) * 100)

  return (
    <div className="habit-row">
      {/* Name Column */}
      <div className="col-name">
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={habit.name}>
          {habit.name}
        </span>
      </div>

      {/* Days Grid Column - Flex layout (No scroll) */}
      <div className="col-days">
        {monthDates.map((date) => {
          const dateStr = formatDate(date)
          const isCompleted = habit.completions[dateStr]
          const isToday = dateStr === todayStr

          return (
            <div
              key={dateStr}
              className="day-cell"
              style={isToday ? { backgroundColor: 'rgba(59, 130, 246, 0.05)' } : {}}
            >
              <button
                className="checkbox-btn"
                onClick={() => onToggleCompletion(habit.id, dateStr)}
                title={`${date.toDateString()}`}
              >
                <div className={`checkbox-visual ${isCompleted ? 'completed' : ''}`}>
                  {isCompleted && '✓'}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Analysis/Stats Column */}
      <div className="col-stats">
        <div className="stat-item">
          <span className="stat-label">Goal</span>
          <span className="stat-value">{goal}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Actual</span>
          <span className="stat-value">{currentMonthCompletions}</span>
        </div>
        <div className="stat-item" style={{ flex: 1, alignItems: 'stretch', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span className="stat-label">Progress</span>
            <span className="stat-label">{progress}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
        </div>
        <button
          className="delete-btn"
          onClick={onDelete}
          aria-label="Delete habit"
          title="Delete Habit"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}

export default HabitRow