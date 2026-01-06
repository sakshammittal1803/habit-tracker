import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { getMonthDates, formatDate } from '../utils/dateUtils'

function DashboardGraph({ habits, currentMonthStart }) {
    const data = getMonthDates(currentMonthStart).map(date => {
        const dateStr = formatDate(date)
        const completedCount = habits.reduce((acc, habit) => {
            return acc + (habit.completions && habit.completions[dateStr] ? 1 : 0)
        }, 0)

        return {
            date: date.getDate(), // Just show day number
            completed: completedCount
        }
    })

    return (
        <div className="dashboard-graph">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Overview</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} width={30} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ background: 'var(--card-background)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default DashboardGraph
