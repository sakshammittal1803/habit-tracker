import HabitRow from './HabitRow'
import { getMonthDates } from '../utils/dateUtils'

function HabitGrid({ habits, dates, onDeleteHabit, onDayClick }) {
  if (habits.length === 0) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>No habits found.</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Start tracking by adding a habit above.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', background: 'var(--background-color)' }}>
      <div style={{ display: 'inline-flex', flexDirection: 'column', minWidth: '100%' }}>
        
        {/* Main Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--background-color)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ width: '180px', minWidth: '180px', padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.05em', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
            HABIT
          </div>
          
          <div style={{ display: 'flex', flex: 1 }}>
            {dates.map(date => (
              <div key={date.toISOString()} style={{ width: '32px', minWidth: '32px', textAlign: 'center', padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {date.getDate()}
              </div>
            ))}
          </div>

          <div style={{ width: '200px', minWidth: '200px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)' }}>
            <div style={{ padding: '0.2rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.65rem', borderBottom: '1px solid var(--border-color)', letterSpacing: '0.05em' }}>
              ANALYSIS
            </div>
            <div style={{ display: 'flex', flex: 1 }}>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.65rem', padding: '0.4rem 0', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>GOAL</div>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.65rem', padding: '0.4rem 0', borderRight: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>ACTUAL</div>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.65rem', padding: '0.4rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>PROGRESS%</div>
            </div>
          </div>
        </div>

        {/* Habit Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {habits.map((habit, index) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              dates={dates}
              onDelete={() => onDeleteHabit(habit.id)}
              onDayClick={onDayClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HabitGrid