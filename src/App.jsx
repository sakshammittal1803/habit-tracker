import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import LoadingPage from './components/LoadingPage'
import MonthlyView from './pages/MonthlyView'
import WeeklyStats from './pages/WeeklyStats'
import PomodoroPage from './pages/PomodoroPage'
import LoginPage from './pages/LoginPage'
import PaymentPage from './pages/PaymentPage'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

function App() {
  const [habits, setHabits] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  console.log('App component rendering, isLoading:', isLoading)

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (item) => {
      if (item) {
        setIsAuthenticated(true)
        setUser({
          name: item.displayName,
          email: item.email,
          picture: item.photoURL,
          uid: item.uid
        })

        // Check Payment Status from Firestore
        const userRef = doc(db, "users", item.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setHasPaid(userSnap.data().hasPaid || false);
        } else {
          // Create user doc if not exists
          await setDoc(userRef, { hasPaid: false, email: item.email });
        }

        // Listen for Habits
        const habitsRef = doc(db, "user_habits", item.uid);
        onSnapshot(habitsRef, (doc) => {
          if (doc.exists()) {
            setHabits(doc.data().habits || []);
          } else {
            setHabits([]);
          }
        });

      } else {
        setIsAuthenticated(false)
        setUser(null)
        setHasPaid(false)
        setHabits([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Protection Logic
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (location.pathname !== '/login') {
          navigate('/login')
        }
      } else {
        if (location.pathname === '/login') {
          navigate('/')
        }
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname])


  const handleLogin = (userData) => {
    // Handled by onAuthStateChanged
  }

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login')
    })
  }

  const handlePaymentSuccess = async () => {
    setHasPaid(true); // Optimistic update
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { hasPaid: true });
    }
  }

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const addHabit = async (habitName) => {
    if (!hasPaid) {
      alert("Please upgrade to Premium to add habits!")
      return
    }
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const newHabit = {
      id: Date.now(),
      name: habitName,
      goal: daysInMonth,
      completions: {}
    }

    // Optimistic update
    const newHabits = [...habits, newHabit];
    setHabits(newHabits);

    if (auth.currentUser) {
      const habitsRef = doc(db, "user_habits", auth.currentUser.uid);
      await setDoc(habitsRef, { habits: newHabits }, { merge: true });
    }
  }

  const deleteHabit = async (habitId) => {
    if (!hasPaid) {
      alert("Please upgrade to Premium to delete habits!")
      return
    }
    const newHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(newHabits);

    if (auth.currentUser) {
      const habitsRef = doc(db, "user_habits", auth.currentUser.uid);
      await setDoc(habitsRef, { habits: newHabits }, { merge: true });
    }
  }

  const toggleCompletion = async (habitId, dateStr) => {
    if (!hasPaid) {
      alert("Please upgrade to Premium to track habits!")
      return
    }

    const newHabits = habits.map(habit => {
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
    });

    setHabits(newHabits);

    if (auth.currentUser) {
      const habitsRef = doc(db, "user_habits", auth.currentUser.uid);
      await setDoc(habitsRef, { habits: newHabits }, { merge: true });
    }
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
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        <div className="container">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/payment" element={<PaymentPage onPaymentSuccess={handlePaymentSuccess} user={user} />} />

            {/* Protected Routes */}
            {isAuthenticated ? (
              <>
                <Route
                  path="/"
                  element={
                    <MonthlyView
                      habits={habits}
                      onAddHabit={addHabit}
                      onDeleteHabit={deleteHabit}
                      onToggleCompletion={toggleCompletion}
                      hasPaid={hasPaid}
                    />
                  }
                />
                <Route
                  path="/weekly-stats"
                  element={<WeeklyStats habits={habits} hasPaid={hasPaid} />}
                />
                <Route
                  path="/pomodoro"
                  element={<PomodoroPage />}
                />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
