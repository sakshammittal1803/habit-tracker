import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import LoadingPage from './components/LoadingPage'
import MonthlyView from './pages/MonthlyView'
import WeeklyStats from './pages/WeeklyStats'
import PomodoroPage from './pages/PomodoroPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PaymentPage from './pages/PaymentPage'
import ProfilePage from './pages/ProfilePage'
import BuddiesPage from './pages/BuddiesPage'
import NotificationManager from './components/NotificationManager'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

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

  console.log('App component rendering, isLoading:', isLoading)

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (item) => {
      if (item) {
        setIsAuthenticated(true)
        // Check Payment Status and Trial Start Date from Firestore
        const userRef = doc(db, "users", item.uid);
        const userSnap = await getDoc(userRef);
        let firestoreData = {};

        if (userSnap.exists()) {
          firestoreData = userSnap.data();
        }

        setUser({
          name: firestoreData.name || item.displayName,
          email: item.email,
          picture: item.photoURL,
          uid: item.uid,
          age: firestoreData.age,
          gender: firestoreData.gender
        })

        const isGoogleUser = item.providerData.some(profile => profile.providerId === 'google.com');

        let currentTrialStartDate = item.metadata.creationTime; // Default to auth creation time

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setHasPaid(userData.hasPaid || false);
          if (userData.trialStartDate) {
            currentTrialStartDate = userData.trialStartDate;
          } else {
            // If user exists but no trialStartDate, set it to creationTime
            await updateDoc(userRef, { trialStartDate: currentTrialStartDate });
          }

          // Use the flag from Firestore strictly
          setProfileCompleted(userData.profileCompleted || false);
        } else {
          // New User
          // If Google user, we might want to auto-complete or let them fill age/gender
          // USER wants to be asked ONCE. So we set it to false initially and let them complete it.
          await setDoc(userRef, {
            hasPaid: false,
            email: item.email,
            trialStartDate: currentTrialStartDate,
            profileCompleted: false, // Force profile completion at least once
            name: isGoogleUser ? item.displayName : null
          });
          setProfileCompleted(false);
        }
        setTrialStartDate(currentTrialStartDate);

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
        if (!profileCompleted && location.pathname !== '/signup') {
          navigate('/signup')
        } else if (profileCompleted && (location.pathname === '/login' || location.pathname === '/signup')) {
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

  // Calculate Access
  const trialPeriodMs = 7 * 24 * 60 * 60 * 1000;
  // Use trialStartDate from state, or fallback to now if not yet set (though it should be set in auth listener)
  // We need to parse the date strings. creationTime is usually a string.
  const timeElapsed = trialStartDate ? new Date() - new Date(trialStartDate) : 0;
  const isTrialActive = trialStartDate && (timeElapsed < trialPeriodMs);
  const trialDaysLeft = isTrialActive ? Math.ceil((trialPeriodMs - timeElapsed) / (24 * 60 * 60 * 1000)) : 0;

  const hasAccess = hasPaid || isTrialActive;

  const addHabit = async (habitData) => {
    if (!hasAccess) {
      alert("Your free trial has ended. Please upgrade to Premium to add habits!")
      return
    }
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const newHabit = {
      id: Date.now(),
      name: habitData.name || habitData, // Fallback if string is passed
      category: habitData.category || 'Other',
      frequency: habitData.frequency || 'daily',
      goal: daysInMonth,
      completions: {},
      notes: {}
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
    if (!hasAccess) {
      alert("Your free trial has ended. Please upgrade to Premium to delete habits!")
      return
    }
    const newHabits = habits.filter(habit => habit.id !== habitId);
    setHabits(newHabits);

    if (auth.currentUser) {
      const habitsRef = doc(db, "user_habits", auth.currentUser.uid);
      await setDoc(habitsRef, { habits: newHabits }, { merge: true });
    }
  }

  const overwriteHabits = async (newHabits) => {
    setHabits(newHabits);
    if (auth.currentUser) {
      const habitsRef = doc(db, "user_habits", auth.currentUser.uid);
      await setDoc(habitsRef, { habits: newHabits });
    }
  }

  const toggleCompletion = async (habitId, dateStr) => {
    if (!hasAccess) {
      alert("Your free trial has ended. Please upgrade to Premium to track habits!")
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

  const updateHabitNote = async (habitId, dateStr, note) => {
    if (!hasAccess) return;

    const newHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const newNotes = { ...(habit.notes || {}) };
        if (note.trim() === '') {
          delete newNotes[dateStr];
        } else {
          newNotes[dateStr] = note;
        }
        return { ...habit, notes: newNotes };
      }
      return habit;
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
        <NotificationManager habits={habits} />
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        <div className="container">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/signup" element={<SignupPage onComplete={() => setProfileCompleted(true)} />} />
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
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
