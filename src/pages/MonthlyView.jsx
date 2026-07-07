import { useState } from 'react'
import HabitForm from '../components/HabitForm'
import MonthNavigation from '../components/MonthNavigation'
import HabitGrid from '../components/HabitGrid'
import DashboardGraph from '../components/DashboardGraph'
import { getMonthStart, getMonthDates, getWeekStart, getWeekDates, formatDate } from '../utils/dateUtils'

function MonthlyView({ habits, onAddHabit, onDeleteHabit, onToggleCompletion, onUpdateNote, hasPaid }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('monthly')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [journalModal, setJournalModal] = useState({ isOpen: false, habitId: null, dateStr: '', note: '' })

  let datesToRender = []
  let displayDateStart = null

  if (viewMode === 'monthly') {
    displayDateStart = getMonthStart(currentDate)
    datesToRender = getMonthDates(displayDateStart)
  } else {
    displayDateStart = getWeekStart(currentDate)
    datesToRender = getWeekDates(displayDateStart)
  }

  const navigate = (direction) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7))
    }
    setCurrentDate(newDate)
  }

  const handleDayClick = (habitId, dateStr, isCompleted, currentNote) => {
    if (isCompleted) {
      setJournalModal({ isOpen: true, habitId, dateStr, note: currentNote || '' })
    } else {
      onToggleCompletion(habitId, dateStr)
    }
  }

  const handleSaveNote = () => {
    onUpdateNote(journalModal.habitId, journalModal.dateStr, journalModal.note)
    setJournalModal({ isOpen: false, habitId: null, dateStr: '', note: '' })
  }

  const handleRemoveCompletion = () => {
    onToggleCompletion(journalModal.habitId, journalModal.dateStr)
    setJournalModal({ isOpen: false, habitId: null, dateStr: '', note: '' })
  }

  const filteredHabits = selectedCategory === 'All' 
    ? habits 
    : habits.filter(h => h.category === selectedCategory);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', background: 'var(--background-color)', color: 'var(--text-primary)', position: 'relative' }}>
      {!hasPaid && (
        <div style={{ padding: '1rem', background: 'var(--error-bg)', color: 'var(--error-text)', textAlign: 'center', marginBottom: '1rem', borderRadius: '4px' }}>
          Free trial has expired. <a href="/payment" style={{ fontWeight: 'bold', color: 'var(--error-text)', textDecoration: 'underline' }}>Upgrade to Premium</a> to continue adding habits.
        </div>
      )}
      
      {/* Top Header Row */}
      <div className="flex-wrap-mobile" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        
        <div className="flex-wrap-mobile" style={{ alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>My Habits</h1>
          
          <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: '20px', padding: '0.2rem' }}>
            <button
              onClick={() => setViewMode('monthly')}
              style={{
                border: 'none', background: viewMode === 'monthly' ? 'var(--primary-color)' : 'transparent', 
                color: viewMode === 'monthly' ? 'white' : 'var(--text-secondary)', padding: '0.4rem 1.2rem', 
                borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              style={{
                border: 'none', background: viewMode === 'weekly' ? 'var(--primary-color)' : 'transparent', 
                color: viewMode === 'weekly' ? 'white' : 'var(--text-secondary)', padding: '0.4rem 1.2rem', 
                borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
              }}
            >
              Weekly
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => navigate(-1)} style={{ border: '1px solid var(--border-color)', background: 'var(--card-background)', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', flexShrink: 0 }}>&lt;</button>
            <span style={{ fontWeight: 'bold', minWidth: '100px', textAlign: 'center', color: 'var(--text-primary)' }}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => navigate(1)} style={{ border: '1px solid var(--border-color)', background: 'var(--card-background)', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', flexShrink: 0 }}>&gt;</button>
          </div>
        </div>

        <div className="flex-wrap-mobile" style={{ alignItems: 'center' }}>
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--card-background)', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="All">All Categories</option>
            <option value="Health">💪 Health</option>
            <option value="Work">💼 Work</option>
            <option value="Mindfulness">🧘 Mindfulness</option>
            <option value="Learning">📚 Learning</option>
            <option value="Other">📌 Other</option>
          </select>
          <HabitForm onAddHabit={onAddHabit} />
        </div>
      </div>

      {/* Grid Container */}
      <div style={{ background: 'var(--card-background)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '2rem' }}>
        <HabitGrid
          habits={filteredHabits}
          dates={datesToRender}
          onDeleteHabit={onDeleteHabit}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Overview Chart */}
      <div style={{ background: 'var(--card-background)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', padding: '1.5rem' }}>
        <DashboardGraph habits={filteredHabits} dates={datesToRender} />
      </div>

      {/* Journal Modal */}
      {journalModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'var(--card-background)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Journal Entry
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontWeight: 'normal' }}>
                {journalModal.dateStr}
              </span>
            </h3>
            
            <textarea
              value={journalModal.note}
              onChange={e => setJournalModal({...journalModal, note: e.target.value})}
              placeholder="How did it go? (Optional)"
              style={{
                width: '100%', height: '100px', padding: '0.8rem', borderRadius: '8px',
                border: '1px solid var(--border-color)', background: 'var(--background-color)',
                color: 'var(--text-primary)', marginBottom: '1rem', resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={handleRemoveCompletion}
                style={{ background: 'transparent', border: '1px solid var(--error-bg)', color: 'var(--error-text)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                Undo Completion
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setJournalModal({ isOpen: false, habitId: null, dateStr: '', note: '' })}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveNote}
                  style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default MonthlyView