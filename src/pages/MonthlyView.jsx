import { useState } from 'react'
import HabitForm from '../components/HabitForm'
import MonthNavigation from '../components/MonthNavigation'
import HabitGrid from '../components/HabitGrid'
import DashboardGraph from '../components/DashboardGraph'
import { getMonthStart } from '../utils/dateUtils'

function MonthlyView({ habits, onAddHabit, onDeleteHabit, onToggleCompletion }) {
  console.log('MonthlyView rendering')
  const [currentMonthStart, setCurrentMonthStart] = useState(getMonthStart(new Date()))

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonthStart)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentMonthStart(getMonthStart(newDate))
  }

  return (
    <div className="page" style={{ padding: '1rem', height: '100%', overflow: 'hidden' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>My Habits</h1>
          <MonthNavigation
            currentMonthStart={currentMonthStart}
            onNavigate={navigateMonth}
          />
        </div>
        <HabitForm onAddHabit={onAddHabit} />
      </header>

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
  )
}

export default MonthlyView