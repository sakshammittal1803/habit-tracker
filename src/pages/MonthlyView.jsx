import { useState } from 'react'
import HabitForm from '../components/HabitForm'
import MonthNavigation from '../components/MonthNavigation'
import HabitGrid from '../components/HabitGrid'
import { getMonthStart } from '../utils/dateUtils'

function MonthlyView({ habits, onAddHabit, onDeleteHabit, onToggleCompletion }) {
  const [currentMonthStart, setCurrentMonthStart] = useState(getMonthStart(new Date()))

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonthStart)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentMonthStart(getMonthStart(newDate))
  }

  return (
    <div className="page">
      <header>
        <h1>My Habit Tracker</h1>
        <HabitForm onAddHabit={onAddHabit} />
      </header>

      <main>
        <MonthNavigation 
          currentMonthStart={currentMonthStart}
          onNavigate={navigateMonth}
        />
        
        <HabitGrid 
          habits={habits}
          currentMonthStart={currentMonthStart}
          onDeleteHabit={onDeleteHabit}
          onToggleCompletion={onToggleCompletion}
        />
      </main>
    </div>
  )
}

export default MonthlyView