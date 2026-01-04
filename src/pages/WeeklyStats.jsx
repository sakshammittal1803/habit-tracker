import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getWeekStart, getWeekDates, formatDate } from '../utils/dateUtils'

function WeeklyStats({ habits }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()))

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeekStart(newDate)
  }

  const getWeeklyData = () => {
    const weekDates = getWeekDates(currentWeekStart)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    return weekDates.map((date, index) => {
      const dateStr = formatDate(date)
      const completedHabits = habits.filter(habit => habit.completions[dateStr]).length
      
      return {
        day: dayNames[index],
        completed: completedHabits,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0
      }
    })
  }

  const getHabitStats = () => {
    const weekDates = getWeekDates(currentWeekStart)
    
    return habits.map(habit => {
      const completedDays = weekDates.filter(date => {
        const dateStr = formatDate(date)
        return habit.completions[dateStr]
      }).length
      
      return {
        name: habit.name,
        completed: completedDays,
        percentage: Math.round((completedDays / 7) * 100)
      }
    })
  }

  const weeklyData = getWeeklyData()
  const habitStats = getHabitStats()

  if (habits.length === 0) {
    return (
      <div className="page">
        <div className="stats-header-compact">
          <h1>Weekly Statistics</h1>
          <div className="empty-state">
            <h3>No habits to analyze</h3>
            <p>Add some habits in the Monthly View to see your weekly statistics!</p>
          </div>
        </div>
      </div>
    )
  }

  const totalCompletions = weeklyData.reduce((sum, day) => sum + day.completed, 0)
  const avgDailyRate = Math.round(weeklyData.reduce((sum, day) => sum + day.percentage, 0) / 7)
  const perfectHabits = habitStats.filter(habit => habit.percentage === 100).length

  return (
    <div className="page">
      <div className="stats-header-compact">
        <h1>Weekly Statistics</h1>
        <div className="week-navigation">
          <button 
            className="nav-button"
            onClick={() => navigateWeek(-1)}
            aria-label="Previous week"
          >
            &lt;
          </button>
          <span className="current-week-compact">
            {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button 
            className="nav-button"
            onClick={() => navigateWeek(1)}
            aria-label="Next week"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="stats-compact">
        <div className="summary-cards-compact">
          <div className="summary-card-compact">
            <div className="summary-value-compact">{totalCompletions}</div>
            <div className="summary-label-compact">Total Completions</div>
          </div>
          <div className="summary-card-compact">
            <div className="summary-value-compact">{avgDailyRate}%</div>
            <div className="summary-label-compact">Average Rate</div>
          </div>
          <div className="summary-card-compact">
            <div className="summary-value-compact">{perfectHabits}</div>
            <div className="summary-label-compact">Perfect Habits</div>
          </div>
        </div>

        <div className="charts-compact">
          <div className="chart-container-compact">
            <h3>Daily Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} habits`, 'Completed']}
                />
                <Bar dataKey="completed" fill="#7ed321" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container-compact">
            <h3>Completion Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="percentage" 
                  stroke="#4a90e2" 
                  strokeWidth={2}
                  dot={{ fill: '#4a90e2', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {habitStats.length > 0 && (
          <div className="habit-list-compact">
            <h3>Habit Performance</h3>
            <div className="habit-items-compact">
              {habitStats.map((habit, index) => (
                <div key={index} className="habit-item-compact">
                  <div className="habit-name-compact">{habit.name}</div>
                  <div className="habit-progress-compact">
                    <div className="progress-bar-compact">
                      <div 
                        className="progress-fill-compact" 
                        style={{ width: `${habit.percentage}%` }}
                      />
                    </div>
                    <span className="habit-percentage-compact">{habit.completed}/7</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WeeklyStats