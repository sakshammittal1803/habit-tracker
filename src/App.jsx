import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import LoadingPage from './components/LoadingPage'
import MonthlyView from './pages/MonthlyView'
import WeeklyStats from './pages/WeeklyStats'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [habits, setHabits] = useLocalStorage('habitTracker', [])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000) // 5 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  const addHabit = (habitName) => {
    const newHabit = {
      id: Date.now(),
      name: habitName,
      completions: {}
    }
    setHabits([...habits, newHabit])
  }

  const deleteHabit = (habitId) => {
    setHabits(habits.filter(habit => habit.id !== habitId))
  }

  const toggleCompletion = (habitId, dateStr) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions }
        if (newCompletions[dateStr]) {
          delete newCompletions[dateStr]
        } else {
          newCompletions[dateStr] = true
        }
        return { ...habit, completions: newCompletions }
      }
      return habit
    }))
  }

  if (isLoading) {
    return (
      <ThemeProvider>
        <LoadingPage />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={
                <MonthlyView 
                  habits={habits}
                  onAddHabit={addHabit}
                  onDeleteHabit={deleteHabit}
                  onToggleCompletion={toggleCompletion}
                />
              } 
            />
            <Route 
              path="/weekly-stats" 
              element={<WeeklyStats habits={habits} />} 
            />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App