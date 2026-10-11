import { useState, useEffect } from 'react'
import { playPomodoroDing } from '../utils/audioUtils'

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('work') // 'work', 'shortBreak', 'longBreak'
  const [totalDuration, setTotalDuration] = useState(25 * 60) // Track initial duration for progress

  const modes = {
    work: { duration: 25 * 60, label: 'Focus Time' },
    shortBreak: { duration: 5 * 60, label: 'Short Break' },
    longBreak: { duration: 15 * 60, label: 'Long Break' }
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
      playPomodoroDing()

      // Browser Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification("Time's up!", { body: getEncouragement() })
        } catch (e) {
          console.warn("Notification error:", e)
        }
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const toggleTimer = () => setIsActive(!isActive)

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 80px)', background: 'var(--background-color)', padding: '4rem 1rem' }}>
      
      {/* Mode Switcher */}
      <div style={{ display: 'flex', background: 'var(--border-color)', padding: '4px', borderRadius: '24px', gap: '4px', marginBottom: '4rem', width: 'fit-content' }}>
        {Object.entries(modes).map(([key, m]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            style={{
              padding: '0.6rem 1.5rem',
              border: 'none',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: mode === key ? 'var(--card-background)' : 'transparent',
              color: mode === key ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: mode === key ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Main Display Container */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '400px' }}>
        
        {/* Emoji Visual */}
        <div style={{ fontSize: '7rem', lineHeight: 1, marginBottom: '1rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
          {getGrowthStage()}
        </div>

        {/* Timer Time */}
        <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(timeLeft)}
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: '0 0 2rem 0', fontWeight: 500 }}>
          {getEncouragement()}
        </p>

        {/* Play/Pause Button */}
        <button
          onClick={toggleTimer}
          style={{
            width: '64px', height: '64px', borderRadius: '50%', background: 'var(--text-primary)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.1s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isActive ? (
            <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: 'var(--background-color)' }}><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', fill: 'var(--background-color)', marginLeft: '4px' }}><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
      </div>

    </div>
  )
}

export default PomodoroTimer