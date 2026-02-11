import { useState, useEffect, useRef } from 'react'

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const modes = {
    work: { duration: 25 * 60, label: 'Focus Time', color: 'var(--primary-color)' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'var(--success-color)' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: '#ff6b7a' } // Keep generic red or use danger?
  }

  // Use danger color for long break if in theme
  const getModeColor = (m) => {
    if (m === 'longBreak') return 'var(--danger-color)'
    return modes[m].color
  }

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isActive, timeLeft])

  const handleTimerComplete = () => {
    setIsActive(false)

    if (mode === 'work') {
      const newSessions = sessions + 1
      setSessions(newSessions)

      // After 4 work sessions, take a long break
      if (newSessions % 4 === 0) {
        setMode('longBreak')
        setTimeLeft(modes.longBreak.duration)
      } else {
        setMode('shortBreak')
        setTimeLeft(modes.shortBreak.duration)
      }
    } else {
      setMode('work')
      setTimeLeft(modes.work.duration)
    }

    // Play notification sound (browser notification)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${modes[mode].label} Complete!`, {
        body: mode === 'work' ? 'Time for a break!' : 'Time to focus!',
        icon: '/favicon.ico'
      })
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(modes[mode].duration)
  }

  const switchMode = (newMode) => {
    setIsActive(false)
    setMode(newMode)
    setTimeLeft(modes[newMode].duration)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100
  const currentColor = getModeColor(mode)

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="pomodoro-container" style={{
        maxWidth: '500px',
        width: '100%',
        background: 'var(--card-background)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>

        <div className="pomodoro-header" style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Pomodoro Timer</h1>
          <div className="session-counter" style={{
            background: 'var(--background-color)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}>
            Sessions Completed: <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{sessions}</span>
          </div>
        </div>

        <div className="pomodoro-modes" style={{ display: 'flex', gap: '0.5rem' }}>
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              className={`mode-btn`}
              onClick={() => switchMode(key)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                background: mode === key ? getModeColor(key) : 'transparent',
                color: mode === key ? 'white' : 'var(--text-secondary)',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {modeData.label}
            </button>
          ))}
        </div>

        <div className="timer-display" style={{ position: 'relative', width: '280px', height: '280px' }}>
          <svg className="progress-ring" width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              className="progress-ring-bg"
              cx="140"
              cy="140"
              r="130"
              stroke="var(--background-color)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              className="progress-ring-fill"
              cx="140"
              cy="140"
              r="130"
              stroke={currentColor}
              strokeWidth="8"
              fill="transparent"
              style={{
                strokeDasharray: `${2 * Math.PI * 130}`,
                strokeDashoffset: `${2 * Math.PI * 130 * (1 - progress / 100)}`,
                transition: 'stroke-dashoffset 1s linear, stroke 0.3s'
              }}
            />
          </svg>
          <div className="timer-text" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div className="time" style={{ fontSize: '4rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</div>
            <div className="mode-label" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{modes[mode].label}</div>
          </div>
        </div>

        <div className="timer-controls" style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={toggleTimer}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: 'var(--radius)',
              background: currentColor,
              color: 'white',
              cursor: 'pointer',
              minWidth: '120px',
              transition: 'transform 0.1s'
            }}
          >
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              border: `1px solid ${currentColor}`,
              borderRadius: 'var(--radius)',
              background: 'transparent',
              color: currentColor,
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default PomodoroTimer