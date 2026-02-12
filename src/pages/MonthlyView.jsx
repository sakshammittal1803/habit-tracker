import { useState } from 'react'
import HabitForm from '../components/HabitForm'
import MonthNavigation from '../components/MonthNavigation'
import HabitGrid from '../components/HabitGrid'
import DashboardGraph from '../components/DashboardGraph'
import { getMonthStart } from '../utils/dateUtils'

function MonthlyView({ habits, onAddHabit, onDeleteHabit, onToggleCompletion, hasPaid }) {
  console.log('MonthlyView rendering')
  const [currentMonthStart, setCurrentMonthStart] = useState(getMonthStart(new Date()))

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonthStart)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentMonthStart(getMonthStart(newDate))
  }

  return (
    <div className="page" style={{ padding: '1rem', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {!hasPaid && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          zIndex: 10,
          pointerEvents: 'none', // Allow clicks to go through to trigger alerts, or block them?
          // User asked for "freezed". Alerts in App.jsx handle the click logic.
          // But visual indication is good.
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
            pointerEvents: 'auto' // Re-enable clicks for this banner
          }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Premium Features Locked</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Upgrade to track habits!</p>
            <a href="/payment" style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>Get Premium</a>
          </div>
        </div>
      )}

      <header style={{ opacity: hasPaid ? 1 : 0.5, pointerEvents: hasPaid ? 'auto' : 'none' }}>
        <div className="header-controls">
          <h1 style={{ margin: 0 }}>My Habits</h1>
          <MonthNavigation
            currentMonthStart={currentMonthStart}
            onNavigate={navigateMonth}
          />
        </div>
        <HabitForm onAddHabit={onAddHabit} />
      </header>

      <div style={{ opacity: hasPaid ? 1 : 0.5, pointerEvents: hasPaid ? 'auto' : 'none', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <HabitGrid
          habits={habits}
          currentMonthStart={currentMonthStart}
          onDeleteHabit={onDeleteHabit}
          onToggleCompletion={onToggleCompletion}
        />

        <DashboardGraph
          habits={habits}
          currentMonthStart={currentMonthStart}
        />
      </div>
    </div>
  )
}

export default MonthlyView