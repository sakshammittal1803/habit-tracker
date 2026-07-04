export function calculateStreaks(completedDatesArray) {
  if (!completedDatesArray || completedDatesArray.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Sort dates descending
  const sortedDates = [...completedDatesArray].sort((a, b) => new Date(b) - new Date(a));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 1;

  // Check if today or yesterday is completed to see if streak is alive
  const mostRecentDateStr = sortedDates[0];
  const mostRecentDate = new Date(mostRecentDateStr);
  mostRecentDate.setHours(0, 0, 0, 0);

  let isStreakAlive = 
    mostRecentDate.getTime() === today.getTime() || 
    mostRecentDate.getTime() === yesterday.getTime();

  // Calculate Best Streak
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const d1 = new Date(sortedDates[i]);
    const d2 = new Date(sortedDates[i+1]);
    d1.setHours(0,0,0,0);
    d2.setHours(0,0,0,0);

    const diffTime = Math.abs(d1 - d2);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 1) {
      tempStreak++;
    } else {
      if (tempStreak > bestStreak) bestStreak = tempStreak;
      tempStreak = 1;
    }
  }
  if (tempStreak > bestStreak) bestStreak = tempStreak;
  // If only 1 day is there, best is 1
  if (sortedDates.length === 1) bestStreak = 1;

  // Calculate Current Streak
  if (isStreakAlive) {
    currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const d1 = new Date(sortedDates[i]);
      const d2 = new Date(sortedDates[i+1]);
      d1.setHours(0,0,0,0);
      d2.setHours(0,0,0,0);

      const diffTime = Math.abs(d1 - d2);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }
  }

  return { currentStreak, bestStreak };
}

export function calculateDynamicGoal(frequency, datesArray, customDays = []) {
  if (frequency === 'daily') return datesArray.length;
  
  if (frequency === 'weekdays') {
    return datesArray.filter(d => {
      const day = d.getDay();
      return day !== 0 && day !== 6;
    }).length;
  }
  
  if (frequency === 'weekends') {
    return datesArray.filter(d => {
      const day = d.getDay();
      return day === 0 || day === 6;
    }).length;
  }
  
  if (frequency === 'custom' && customDays.length > 0) {
    return datesArray.filter(d => customDays.includes(d.getDay())).length;
  }
  
  if (frequency === '3_times_week') {
    // Roughly 3 times a week is (total days / 7) * 3
    return Math.ceil((datesArray.length / 7) * 3);
  }
  
  return datesArray.length;
}

export function exportHabitsToCSV(habits) {
  const headers = ['id', 'name', 'category', 'frequency', 'customDays', 'createdAt', 'completions', 'notes']
  const rows = habits.map(habit => {
    return [
      habit.id,
      `"${(habit.name || '').replace(/"/g, '""')}"`,
      `"${(habit.category || '').replace(/"/g, '""')}"`,
      habit.frequency || 'daily',
      `"${JSON.stringify(habit.customDays || []).replace(/"/g, '""')}"`,
      habit.createdAt || '',
      `"${JSON.stringify(habit.completions || {}).replace(/"/g, '""')}"`,
      `"${JSON.stringify(habit.notes || {}).replace(/"/g, '""')}"`
    ].join(',')
  })
  
  return [headers.join(','), ...rows].join('\n')
}

export function importHabitsFromCSV(csvString) {
  const lines = csvString.trim().split('\n')
  if (lines.length < 2) return []
  
  const habits = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    
    if (cols.length >= 8) {
      try {
        const cleanCol = (col) => {
          let val = (col || '').trim()
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1).replace(/""/g, '"')
          }
          return val
        }
        
        habits.push({
          id: cleanCol(cols[0]),
          name: cleanCol(cols[1]),
          category: cleanCol(cols[2]),
          frequency: cleanCol(cols[3]),
          customDays: JSON.parse(cleanCol(cols[4]) || '[]'),
          createdAt: cleanCol(cols[5]),
          completions: JSON.parse(cleanCol(cols[6]) || '{}'),
          notes: JSON.parse(cleanCol(cols[7]) || '{}')
        })
      } catch (e) {
        console.error("Failed to parse CSV row", i, e)
      }
    }
  }
  return habits
}
