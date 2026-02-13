import { useState } from 'react'

function HabitForm({ onAddHabit }) {
  const [habitName, setHabitName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (habitName.trim()) {
      onAddHabit(habitName.trim())
      setHabitName('')
    }
  }

  return (
    <form className="add-habit-section" onSubmit={handleSubmit}>
      <input
        type="text"
        className="habit-input"
        placeholder="Enter new habit..."
        value={habitName}
        onChange={(e) => setHabitName(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">
        Add Habit
      </button>
    </form>
  )
}

export default HabitForm