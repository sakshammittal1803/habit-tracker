import { useState } from 'react'
import HabitForm from '../components/HabitForm'
import MonthNavigation from '../components/MonthNavigation'
import HabitGrid from '../components/HabitGrid'
import DashboardGraph from '../components/DashboardGraph'
import { getMonthStart, getMonthDates, getWeekStart, getWeekDates } from '../utils/dateUtils'

function MonthlyView({ habits, onAddHabit, onDeleteHabit, onToggleCompletion, hasPaid }) {
  console.log('MonthlyView rendering')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('monthly') // 'monthly' or 'weekly'

  // Calculate dates based on view mode
  let datesToRender = []
  let displayDateStart = null

  if (viewMode === 'monthly') {
    displayDateStart = getMonthStart(currentDate)
    datesToRender = getMonthDates(displayDateStart)
  } else {
    displayDateStart = getWeekStart(currentDate)
    datesToRender = getWeekDates(displayDateStart)
  }

  const navigate = (direction) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7))
    }
    setCurrentDate(newDate)
  }

  // Helper for navigation component (it usually expects a month start, but we can adapt)
  // For now, let's keep MonthNavigation as is, but maybe we should rename it or make it smarter.
  // Actually, MonthNavigation displays the month name. For weekly view, we might want to show the month of the week start.

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
          pointerEvents: 'none',
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
            pointerEvents: 'auto'
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* View Toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--card-background)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                onClick={() => setViewMode('monthly')}
                style={{
                  background: viewMode === 'monthly' ? 'var(--primary-color)' : 'transparent',
                  color: viewMode === 'monthly' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                style={{
                  background: viewMode === 'weekly' ? 'var(--primary-color)' : 'transparent',
                  color: viewMode === 'weekly' ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Weekly
              </button>
            </div>

            <MonthNavigation
              currentMonthStart={displayDateStart}
              onNavigate={navigate}
            />
          </div>
        </div>
        <HabitForm onAddHabit={onAddHabit} />
      </header>

      <div style={{ opacity: hasPaid ? 1 : 0.5, pointerEvents: hasPaid ? 'auto' : 'none', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <HabitGrid
          habits={habits}
          dates={datesToRender}
          onDeleteHabit={onDeleteHabit}
          onToggleCompletion={onToggleCompletion}
        />

        <DashboardGraph
          habits={habits}
          currentMonthStart={displayDateStart} // Keep graph monthly for now? Or should it adapt? The component implies it needs a start date.
        />
      </div>
    </div>
  )
}

export default MonthlyView