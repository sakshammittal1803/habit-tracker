import { getMonthDates, formatDate } from '../utils/dateUtils'
import { calculateStreaks, calculateDynamicGoal } from '../utils/habitUtils'

function HabitRow({ habit, dates, onDelete, onDayClick }) {
  const today = new Date()
  const todayStr = formatDate(today)

  // Calculate stats based on the rendered dates and habit frequency
  const dynamicGoal = calculateDynamicGoal(habit.frequency, dates, habit.customDays)
  let completedCount = 0
  
  dates.forEach(date => {
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    let isDisabled = false
    if (habit.frequency === 'weekdays' && isWeekend) isDisabled = true
    if (habit.frequency === 'weekends' && !isWeekend) isDisabled = true
    if (habit.frequency === 'custom' && habit.customDays && !habit.customDays.includes(dayOfWeek)) isDisabled = true
    
    if (habit.completions && habit.completions[formatDate(date)] && !isDisabled) {
      completedCount++
    }
  })

  const progressPercentage = dynamicGoal > 0 ? Math.round((completedCount / dynamicGoal) * 100) : 0

  const { currentStreak } = calculateStreaks(Object.keys(habit.completions || {}));

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--card-background)', transition: 'background-color 0.2s' }}
         onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
         onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card-background)'}>
      {/* Habit Name Cell */}
      <div style={{ width: '180px', minWidth: '180px', padding: '0.75rem 1rem', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflow: 'hidden', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {habit.name}
            </span>
            {currentStreak >= 2 && (
              <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }} title={`${currentStreak} day streak!`}>
                🔥 {currentStreak}
              </span>
            )}
          </div>
          {/* Tags */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', background: 'var(--background-color)', padding: '0.1rem 0.3rem', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              {habit.category || 'Other'}
            </span>
            {habit.frequency && habit.frequency !== 'daily' && (
              <span style={{ fontSize: '0.65rem', background: 'var(--background-color)', padding: '0.1rem 0.3rem', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {habit.frequency === 'weekdays' ? 'Weekdays' 
                  : habit.frequency === 'weekends' ? 'Weekends' 
                  : habit.frequency === 'custom' && habit.customDays ? habit.customDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')
                  : '3x/week'}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={onDelete} 
          style={{ 
            background: 'var(--error-bg)', 
            border: 'none', 
            color: 'var(--error-text)', 
            cursor: 'pointer', 
            fontSize: '1.2rem', 
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.8,
            transition: 'opacity 0.2s',
            marginLeft: '8px',
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.8}
          title="Delete habit"
        >
          ×
        </button>
      </div>

      {/* Day Cells */}
      <div style={{ display: 'flex', flex: 1 }}>
        {dates.map((date) => {
          const dateStr = formatDate(date)
          const isCompleted = habit.completions && habit.completions[dateStr]
          const hasNote = habit.notes && habit.notes[dateStr]
          
          const dayOfWeek = date.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
          let isDisabled = false
          if (habit.frequency === 'weekdays' && isWeekend) isDisabled = true
          if (habit.frequency === 'weekends' && !isWeekend) isDisabled = true
          if (habit.frequency === 'custom' && habit.customDays && !habit.customDays.includes(dayOfWeek)) isDisabled = true
          
          return (
            <div 
              key={dateStr}
              style={{ 
                width: '32px', minWidth: '32px', borderRight: '1px solid var(--border-color)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem',
                background: isDisabled ? 'var(--background-color)' : 'transparent'
              }}
            >
              {isDisabled ? (
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0.5
                }}>
                  <div style={{ width: '8px', height: '2px', background: 'var(--text-secondary)', borderRadius: '2px' }} />
                </div>
              ) : (
                <button
                  onClick={() => onDayClick(habit.id, dateStr, isCompleted, hasNote ? habit.notes[dateStr] : '')}
                  style={{
                    width: '100%', height: '100%', border: 'none', background: 'transparent', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '4px',
                      background: isCompleted ? 'var(--primary-color)' : 'transparent',
                      border: isCompleted ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', position: 'relative'
                    }}>
                    {isCompleted && (
                      <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', fill: 'white' }}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                    {hasNote && (
                      <div style={{
                        position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px',
                        background: 'var(--primary-color)', borderRadius: '50%', border: '1px solid var(--card-background)'
                      }} title={habit.notes[dateStr]} />
                    )}
                  </div>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Stats Cells */}
      <div style={{ width: '200px', minWidth: '200px', display: 'flex', borderLeft: '1px solid var(--border-color)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {dynamicGoal}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          {completedCount}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: progressPercentage >= 100 ? 'var(--primary-color)' : 'var(--text-primary)' }}>
          {progressPercentage}%
        </div>
      </div>
    </div>
  )
}

export default HabitRow