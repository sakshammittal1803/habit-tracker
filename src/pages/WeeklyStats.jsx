import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getWeekStart, getWeekDates, formatDate } from '../utils/dateUtils'

function WeeklyStats({ habits, hasPaid }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()))

  // Theme colors matching CSS variables
  const colors = {
    primary: '#3b82f6',
    success: '#10b981',
    border: '#e5e7eb',
    text: '#6b7280',
    tooltipBg: '#ffffff'
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentWeekStart(newDate)
  }

  // Lock Screen for Free Users
  if (!hasPaid) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '1.5rem' }}>
        <div style={{ fontSize: '4rem', color: '#e5e7eb' }}>🔒</div>
        <h1>Weekly Statistics Locked</h1>
        <p style={{ color: '#666', maxWidth: '400px' }}>
          Unlock detailed insights into your habits and verify your progress with Premium.
        </p>
        <a href="/payment" style={{
          display: 'inline-block',
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>Get Premium</a>
      </div>
    )
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
        <header>
          <h1>Weekly Statistics</h1>
        </header>
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: colors.text }}>
          <h3>No habits to analyze</h3>
          <p>Add some habits in the Monthly View to see your weekly statistics!</p>
        </div>
      </div>
    )
  }

  const totalCompletions = weeklyData.reduce((sum, day) => sum + day.completed, 0)
  const avgDailyRate = Math.round(weeklyData.reduce((sum, day) => sum + day.percentage, 0) / 7)
  const perfectHabits = habitStats.filter(habit => habit.percentage === 100).length

  return (
    <div className="page">
      <header className="stats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Weekly Statistics</h1>
        <div className="week-navigation" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="nav-button"
            onClick={() => navigateWeek(-1)}
            aria-label="Previous week"
            style={{ padding: '0.5rem', background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            &lt;
          </button>
          <span className="current-month" style={{ fontWeight: 600 }}>
            {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button
            className="nav-button"
            onClick={() => navigateWeek(1)}
            aria-label="Next week"
            style={{ padding: '0.5rem', background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            &gt;
          </button>
        </div>
      </header>

      <div className="stats-grid" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingBottom: '2rem' }}>
        {/* Summary Cards */}
        <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="summary-card" style={{ padding: '1.5rem', background: 'var(--card-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div className="summary-value" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>{totalCompletions}</div>
            <div className="summary-label" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Completions</div>
          </div>
          <div className="summary-card" style={{ padding: '1.5rem', background: 'var(--card-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div className="summary-value" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success-color)' }}>{avgDailyRate}%</div>
            <div className="summary-label" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Rate</div>
          </div>
          <div className="summary-card" style={{ padding: '1.5rem', background: 'var(--card-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div className="summary-value" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>{perfectHabits}</div>
            <div className="summary-label" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Perfect Habits</div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
          <div className="chart-container" style={{ padding: '1.5rem', background: 'var(--card-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Daily Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: colors.text }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.text }} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="completed" fill={colors.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container" style={{ padding: '1.5rem', background: 'var(--card-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Consistency Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: colors.text }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.text }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habit List */}
        {habitStats.length > 0 && (
          <div className="habit-list-container" style={{ padding: '1.5rem', background: 'var(--card-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Detailed Performance</h3>
            <div className="habit-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {habitStats.map((habit, index) => (
                <div key={index} className="habit-stat-item" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', borderBottom: index < habitStats.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div className="habit-name" style={{ width: '200px', fontWeight: 600 }}>{habit.name}</div>
                  <div className="habit-progress-track" style={{ flex: 1, height: '8px', background: 'var(--background-color)', borderRadius: '4px', overflow: 'hidden', margin: '0 1rem' }}>
                    <div
                      className="habit-progress-fill"
                      style={{
                        width: `${habit.percentage}%`,
                        background: habit.percentage === 100 ? colors.success : colors.primary,
                        height: '100%',
                        transition: 'width 0.5s ease-out'
                      }}
                    />
                  </div>
                  <div className="habit-stat-value" style={{ width: '60px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>{habit.completed}/7</div>
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