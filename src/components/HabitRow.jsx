import { getMonthDates, formatDate } from '../utils/dateUtils'

function HabitRow({ habit, currentMonthStart, onDelete, onToggleCompletion }) {
  const monthDates = getMonthDates(currentMonthStart)
  const today = new Date()
  const todayStr = formatDate(today)

  return (
    <div className="habit">
      <div className="habit__name">
        {habit.name}
        <button 
          className="habit__delete" 
          onClick={onDelete}
          aria-label={`Delete ${habit.name} habit`}
        >
          Delete
        </button>
      </div>
      <div className="habit__days">
        {monthDates.map((date) => {
          const dateStr = formatDate(date)
          const isCompleted = habit.completions[dateStr]
          const isToday = dateStr === todayStr
          
          return (
            <div 
              key={dateStr}
              className={`habit__checkbox ${isCompleted ? 'habit__checkbox--completed' : ''} ${isToday ? 'habit__checkbox--today' : ''}`}
              onClick={() => onToggleCompletion(habit.id, dateStr)}
              title={`Day ${date.getDate()}${isToday ? ' (Today)' : ''}`}
              role="checkbox"
              aria-checked={isCompleted}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggleCompletion(habit.id, dateStr)
                }
              }}
            >
              <span className="habit__day-number">{date.getDate()}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HabitRow