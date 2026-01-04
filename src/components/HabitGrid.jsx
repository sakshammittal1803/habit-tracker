import HabitRow from './HabitRow'

function HabitGrid({ habits, currentMonthStart, onDeleteHabit, onToggleCompletion }) {
  if (habits.length === 0) {
    return (
      <div className="habits-container">
        <div className="empty-state">
          <h3>No habits yet</h3>
          <p>Add your first habit above to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="habits-container">
      {habits.map(habit => (
        <HabitRow
          key={habit.id}
          habit={habit}
          currentMonthStart={currentMonthStart}
          onDelete={() => onDeleteHabit(habit.id)}
          onToggleCompletion={onToggleCompletion}
        />
      ))}
    </div>
  )
}

export default HabitGrid