export function getMonthStart(date) {
  const d = new Date(date)
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function getMonthDates(startDate) {
  const year = startDate.getFullYear()
  const month = startDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const dates = []
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(year, month, i))
  }
  return dates
}

export function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

export function getWeekDates(startDate) {
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    dates.push(date)
  }
  return dates
}

export function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export function formatMonth(date) {
  const options = { month: 'long', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}