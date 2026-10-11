import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import LoadingPage from './components/LoadingPage'
import NotificationManager from './components/NotificationManager'
import ErrorBoundary from './components/ErrorBoundary'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore'

// Lazy-loaded routes for code splitting and instant initial bundle loading
const MonthlyView = lazy(() => import('./pages/MonthlyView'))
const WeeklyStats = lazy(() => import('./pages/WeeklyStats'))
const PomodoroPage = lazy(() => import('./pages/PomodoroPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const BuddiesPage = lazy(() => import('./pages/BuddiesPage'))

function App() {
  const [habits, setHabits] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPaid, setHasPaid] = useState(false)
  const [trialStartDate, setTrialStartDate] = useState(null)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Auth & Firestore Data Listener
  useEffect(() => {
    let habitsUnsubscribe = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (item) => {
      try {
        if (item) {
          setIsAuthenticated(true)

          const userRef = doc(db, "users", item.uid)
          let firestoreData = {}

          try {
            const userSnap = await getDoc(userRef)
            if (userSnap.exists()) {
              firestoreData = userSnap.data()
            }
          } catch (e) {
            console.warn("Could not retrieve Firestore user document:", e)
          }

          const isGoogleUser = item.providerData?.some(profile => profile.providerId === 'google.com')
          let currentTrialStartDate = item.metadata?.creationTime || new Date().toISOString()

          if (firestoreData.trialStartDate) {
            currentTrialStartDate = firestoreData.trialStartDate
          } else {
            // New user or missing trialStartDate
            currentTrialStartDate = new Date().toISOString()
            try {
              await setDoc(userRef, {
                hasPaid: false,
                email: (item.email || '').toLowerCase(),
                trialStartDate: currentTrialStartDate,
                profileCompleted: isGoogleUser && Boolean(item.displayName),
                name: item.displayName || null
              }, { merge: true })
            } catch (e) {
              console.warn("Error creating initial user record:", e)
            }
          }

          setUser({
            name: firestoreData.name || item.displayName || 'User',
            email: (item.email || '').toLowerCase(),
            picture: item.photoURL,
            uid: item.uid,
            age: firestoreData.age,
            gender: firestoreData.gender
          })

          setHasPaid(Boolean(firestoreData.hasPaid))
          setProfileCompleted(Boolean(firestoreData.profileCompleted || (isGoogleUser && item.displayName)))
          setTrialStartDate(currentTrialStartDate)

          // Clean up any existing habits listener
          if (habitsUnsubscribe) {
            habitsUnsubscribe()
            habitsUnsubscribe = null
          }

          // Attach real-time habits listener
          const habitsRef = doc(db, "user_habits", item.uid)
          habitsUnsubscribe = onSnapshot(habitsRef, (docSnap) => {
            if (docSnap.exists()) {
              setHabits(docSnap.data().habits || [])
            } else {
              setHabits([])
            }
          }, (err) => {
            console.warn("Firestore habits snapshot error:", err)
          })

        } else {
          // Logged out
          if (habitsUnsubscribe) {
            habitsUnsubscribe()
            habitsUnsubscribe = null
          }
          setIsAuthenticated(false)
          setUser(null)
          setHasPaid(false)
          setProfileCompleted(false)
          setTrialStartDate(null)
          setHabits([])
        }
      } catch (err) {
        console.error("Auth state handling error:", err)
      } finally {
        setIsLoading(false)
      }
    })

    return () => {
      if (habitsUnsubscribe) habitsUnsubscribe()
      unsubscribeAuth()
    }
  }, [])

  // Route Protection & Redirection Logic
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (location.pathname !== '/login') {
          navigate('/login')
        }
      } else {
        if (!profileCompleted && location.pathname !== '/signup') {
          navigate('/signup')
        } else if (profileCompleted && (location.pathname === '/login' || location.pathname === '/signup')) {
          navigate('/')
        }
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname, profileCompleted])

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login')
    }).catch(err => {
      console.error("Sign-out error:", err)
      navigate('/login')
    })
  }

  const handlePaymentSuccess = async () => {
    setHasPaid(true)
    if (auth.currentUser) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid)
        await updateDoc(userRef, { hasPaid: true })
      } catch (e) {
        console.error("Payment status persistence failed:", e)
      }
    }
  }

  // Notification Permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  // Calculate Trial Access
  const trialPeriodMs = 7 * 24 * 60 * 60 * 1000
  const trialStartMs = trialStartDate ? new Date(trialStartDate).getTime() : Date.now()
  const timeElapsed = Math.max(0, Date.now() - trialStartMs)
  const isTrialActive = timeElapsed < trialPeriodMs
  const trialDaysLeft = isTrialActive ? Math.ceil((trialPeriodMs - timeElapsed) / (24 * 60 * 60 * 1000)) : 0
  const hasAccess = hasPaid || isTrialActive

  const addHabit = async (habitData) => {
    if (!hasAccess) {
      alert("Your free trial has ended. Please upgrade to Premium to add habits!")
      return
    }

    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const newHabit = {
      id: Date.now(),
      name: typeof habitData === 'string' ? habitData.trim() : (habitData.name || '').trim(),
      category: habitData.category || 'Other',
      frequency: habitData.frequency || 'daily',
      customDays: Array.isArray(habitData.customDays) ? habitData.customDays : [],
      goal: daysInMonth,
      createdAt: new Date().toISOString(),
      completions: {},
      notes: {}
    }

    const newHabits = [...habits, newHabit]
    setHabits(newHabits)

    if (auth.currentUser) {
      try {
        const habitsRef = doc(db, "user_habits", auth.currentUser.uid)
        await setDoc(habitsRef, { habits: newHabits }, { merge: true })
      } catch (e) {
        console.error("Failed to sync new habit:", e)
      }
    }
  }

  const deleteHabit = async (habitId) => {
    if (!hasAccess) {
      alert("Your free trial has ended. Please upgrade to Premium to manage habits!")
      return
    }

    const newHabits = habits.filter(habit => habit.id !== habitId)
    setHabits(newHabits)

    if (auth.currentUser) {
      try {
        const habitsRef = doc(db, "user_habits", auth.currentUser.uid)
        await setDoc(habitsRef, { habits: newHabits }, { merge: true })
      } catch (e) {
        console.error("Failed to delete habit:", e)
      }
    }
  }

  const overwriteHabits = async (newHabits) => {
    setHabits(newHabits)
    if (auth.currentUser) {
      try {
        const habitsRef = doc(db, "user_habits", auth.currentUser.uid)
        await setDoc(habitsRef, { habits: newHabits })
      } catch (e) {
        console.error("Failed to overwrite habits:", e)
      }
    }
  }

  const toggleCompletion = async (habitId, dateStr) => {
    if (!hasAccess) {
      alert("Your free trial has ended. Please upgrade to Premium to track habits!")
      return
    }

    const newHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...(habit.completions || {}) }
        if (newCompletions[dateStr]) {
          delete newCompletions[dateStr]
        } else {
          newCompletions[dateStr] = true
        }
        return { ...habit, completions: newCompletions }
      }
      return habit
    })

    setHabits(newHabits)

    if (auth.currentUser) {
      try {
        const habitsRef = doc(db, "user_habits", auth.currentUser.uid)
        await setDoc(habitsRef, { habits: newHabits }, { merge: true })
      } catch (e) {
        console.error("Failed to update habit completion:", e)
      }
    }
  }

  const updateHabitNote = async (habitId, dateStr, note) => {
    if (!hasAccess) return

    const newHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const newNotes = { ...(habit.notes || {}) }
        if (!note || note.trim() === '') {
          delete newNotes[dateStr]
        } else {
          newNotes[dateStr] = note.trim()
        }
        return { ...habit, notes: newNotes }
      }
      return habit
    })

    setHabits(newHabits)

    if (auth.currentUser) {
      try {
        const habitsRef = doc(db, "user_habits", auth.currentUser.uid)
        await setDoc(habitsRef, { habits: newHabits }, { merge: true })
      } catch (e) {
        console.error("Failed to update note:", e)
      }
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
    <ErrorBoundary>
      <ThemeProvider>
        <div className="app">
          <NotificationManager habits={habits} />
          {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
          <div className="container">
            <Suspense fallback={<LoadingPage />}>
              <Routes>
                <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
                <Route path="/signup" element={<SignupPage user={user} onComplete={() => setProfileCompleted(true)} />} />
                {/* Protected Routes */}
                {isAuthenticated ? (
                  <>
                    <Route path="/payment" element={<PaymentPage onPaymentSuccess={handlePaymentSuccess} user={user} trialDaysLeft={trialDaysLeft} hasPaid={hasPaid} />} />
                    <Route
                      path="/"
                      element={
                        <MonthlyView
                          habits={habits}
                          onAddHabit={addHabit}
                          onDeleteHabit={deleteHabit}
                          onToggleCompletion={toggleCompletion}
                          onUpdateNote={updateHabitNote}
                          hasPaid={hasAccess}
                        />
                      }
                    />
                    <Route
                      path="/weekly-stats"
                      element={<WeeklyStats habits={habits} hasPaid={hasAccess} />}
                    />
                    <Route
                      path="/pomodoro"
                      element={<PomodoroPage />}
                    />
                    <Route
                      path="/profile"
                      element={<ProfilePage user={user} habits={habits} onImportHabits={overwriteHabits} />}
                    />
                    <Route
                      path="/buddies"
                      element={<BuddiesPage user={user} />}
                    />
                  </>
                ) : (
                  <Route path="*" element={<Navigate to="/login" replace />} />
                )}
              </Routes>
            </Suspense>
          </div>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
