import { useState } from 'react'

function HabitForm({ onAddHabit }) {
  const [isOpen, setIsOpen] = useState(false)
  const [habitName, setHabitName] = useState('')
  const [category, setCategory] = useState('Other')
  const [frequency, setFrequency] = useState('daily')
  const [customDays, setCustomDays] = useState([])

  const handleToggleDay = (dayIndex) => {
    setCustomDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (habitName.trim()) {
      if (frequency === 'custom' && customDays.length === 0) {
        alert('Please select at least one day.')
        return
      }

      onAddHabit({
        name: habitName.trim(),
        category,
        frequency,
        customDays: frequency === 'custom' ? customDays : undefined
      })
      setHabitName('')
      setCategory('Other')
      setFrequency('daily')
      setCustomDays([])
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          background: 'var(--primary-color)', 
          color: 'white', 
          border: 'none', 
          padding: '0.6rem 1.2rem', 
          borderRadius: '4px', 
          fontWeight: 'bold', 
          cursor: 'pointer', 
          fontSize: '0.9rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem' 
        }}
      >
        <span>➕</span> Add Habit
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'var(--card-background)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Create New Habit</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Habit Name</label>
                <input
                  type="text"
                  required
                  style={{
                    padding: '0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: 'var(--background-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="e.g. Read 10 pages"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    padding: '0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    background: 'var(--background-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Health">💪 Health</option>
                  <option value="Work">💼 Work</option>
                  <option value="Mindfulness">🧘 Mindfulness</option>
                  <option value="Learning">📚 Learning</option>
                  <option value="Other">📌 Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  style={{
                    padding: '0.8rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    background: 'var(--background-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="daily">Every Day</option>
                  <option value="weekdays">Weekdays (Mon-Fri)</option>
                  <option value="weekends">Weekends (Sat-Sun)</option>
                  <option value="custom">Specific Days</option>
                </select>
              </div>

              {frequency === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Select Days</label>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                      const isSelected = customDays.includes(index)
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleToggleDay(index)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: isSelected ? 'var(--primary-color)' : 'var(--background-color)',
                            color: isSelected ? 'white' : 'var(--text-secondary)',
                            fontWeight: 'bold', cursor: 'pointer',
                            border: isSelected ? 'none' : '1px solid var(--border-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default HabitForm