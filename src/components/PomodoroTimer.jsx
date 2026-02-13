import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work', 'shortBreak', 'longBreak'
  const [totalDuration, setTotalDuration] = useState(25 * 60) // Track initial duration for progress
  const intervalRef = useRef(null)
  const { isDark } = useTheme()

  const modes = {
    work: { duration: 25 * 60, label: 'Focus Time', color: 'var(--primary-color)' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'var(--success-color)' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: '#ff6b7a' }
  }

  // Sound Effect (Web Audio API)
  const playNotificationSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return

      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.setValueAtTime(500, ctx.currentTime) // Start low
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1) // Go high (Ding!)

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1) // Fade out

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1)
    } catch (e) {
      console.error("Audio play failed", e)
    }
  }

  // Growth Logic
  const getGrowthStage = () => {
    if (mode !== 'work') return '☕' // Coffee for break

    const progress = 1 - (timeLeft / totalDuration)

    if (timeLeft === 0) return '🐓' // Fully Grown!
    if (progress < 0.25) return '🥚' // Egg
    if (progress < 0.50) return '🐣' // Hatching
    if (progress < 0.75) return '🐥' // Chick
    return '🐓' // Hen (almost there)
  }

  const getEncouragement = () => {
    if (mode !== 'work') return "Relax and recharge..."

    const stage = getGrowthStage()
    if (stage === '🥚') return "Planting the seed..."
    if (stage === '🐣') return "It's hatching! Keep focusing."
    if (stage === '🐥') return "Look at it go!"
    if (stage === '🐓') return "You raised a Super Chicken!"
    return "Focus..."
  }

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      playNotificationSound()

      // Browser Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("Time's up!", { body: getEncouragement() })
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(modes[mode].duration)
    setTotalDuration(modes[mode].duration)
  }

  const switchMode = (newMode) => {
    setIsActive(false)
    setMode(newMode)
    setTimeLeft(modes[newMode].duration)
    setTotalDuration(modes[newMode].duration)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="pomodoro-minimal" style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>

        {/* Mode Switcher (Pill) */}
        <div style={{
          display: 'flex',
          background: 'var(--border-color)',
          padding: '4px',
          borderRadius: '50px',
          marginBottom: '1rem'
        }}>
          {Object.entries(modes).map(([key, m]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              style={{
                background: mode === key ? 'var(--card-background)' : 'transparent',
                color: mode === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '50px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: mode === key ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Character Display */}
        <div className="hen-character" style={{
          fontSize: '8rem',
          lineHeight: 1,
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
          animation: isActive ? 'breathe 3s infinite ease-in-out' : 'none',
          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          {getGrowthStage()}
        </div>

        {/* Timer Display */}
        <div className="timer-display-minimal">
          <div style={{ fontSize: '5rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {formatTime(timeLeft)}
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            {getEncouragement()}
          </p>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button
            onClick={toggleTimer}
            className="play-btn"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--text-primary)',
              color: 'var(--card-background)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'transform 0.1s'
            }}
          >
            {isActive ? '⏸' : '▶'}
          </button>
        </div>

      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .play-btn:active { transform: scale(0.95); }
      `}</style>
    </div>
  )
}

export default PomodoroTimer