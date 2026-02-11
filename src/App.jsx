import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import LoadingPage from './components/LoadingPage'
import LoginPage from './pages/LoginPage'
import MonthlyView from './pages/MonthlyView'
import WeeklyStats from './pages/WeeklyStats'
import PomodoroPage from './pages/PomodoroPage'
import { useLocalStorage } from './hooks/useLocalStorage'

function App() {
  const [habits, setHabits] = useLocalStorage('habitTracker', [])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  console.log('App component rendering, isLoading:', isLoading)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // 1 second loading time for testing

    return () => clearTimeout(timer)
  }, [])

  const navigate = useNavigate()



  // Request notification permission on app start
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const addHabit = (habitName) => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const newHabit = {
      id: Date.now(),
      name: habitName,
      goal: daysInMonth, // Default (every day)
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

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
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
            <Route
              path="/pomodoro"
              element={<PomodoroPage />}
            />
            <Route path="*" element={<div style={{ color: 'red', padding: 50, fontSize: 24 }}>404 - Not Found</div>} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App