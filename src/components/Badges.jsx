import React from 'react';
import { calculateStreaks } from '../utils/habitUtils';
import { formatDate } from '../utils/dateUtils';

function Badges({ habits = [] }) {
  const safeHabits = Array.isArray(habits) ? habits : [];
  // Check if there was ever a 7-consecutive-day period where ALL scheduled habits were completed
  let hasPerfectWeek = false;
  if (safeHabits.length > 0) {
    // Gather all unique completed dates across all habits
    const allDates = new Set();
    safeHabits.forEach(h => {
      Object.keys(h.completions || {}).forEach(d => {
        if (h.completions[d]) allDates.add(d);
      });
    });

    // A date is a "perfect day" if every habit scheduled on that day has a completion
    const perfectDays = Array.from(allDates).filter(dateStr => {
      if (!dateStr || isNaN(new Date(dateStr).getTime())) return false;
      const dateObj = new Date(dateStr);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      return safeHabits.every(habit => {
        // Check if habit is scheduled on this day
        if (habit.frequency === 'weekdays' && isWeekend) return true;
        if (habit.frequency === 'weekends' && !isWeekend) return true;
        if (habit.frequency === 'custom' && habit.customDays && !habit.customDays.includes(dayOfWeek)) return true;

        return Boolean(habit.completions && habit.completions[dateStr]);
      });
    });

    if (calculateStreaks(perfectDays).bestStreak >= 7) {
      hasPerfectWeek = true;
    }
  }

  const hasFireStreak = safeHabits.some(h => {
    const validDates = Object.keys(h.completions || {}).filter(k => h.completions[k]);
    return calculateStreaks(validDates).bestStreak >= 7;
  });

  const hasKingStreak = safeHabits.some(h => {
    const validDates = Object.keys(h.completions || {}).filter(k => h.completions[k]);
    return calculateStreaks(validDates).bestStreak >= 30;
  });

  const badges = [
    {
      id: 'starter',
      name: 'Habit Starter',
      description: 'Create your first habit',
      icon: '🌱',
      unlocked: Boolean(safeHabits.length >= 1)
    },
    {
      id: 'fire',
      name: 'On Fire',
      description: 'Reach a 7-day streak',
      icon: '🔥',
      unlocked: Boolean(hasFireStreak)
    },
    {
      id: 'king',
      name: 'Consistency King',
      description: 'Reach a 30-day streak',
      icon: '👑',
      unlocked: Boolean(hasKingStreak)
    },
    {
      id: 'perfect',
      name: 'Perfect Week',
      description: 'Completed all scheduled habits for 7 consecutive days',
      icon: '⭐',
      unlocked: Boolean(hasPerfectWeek)
    }
  ];

  return (
    <div className="badges-section" style={{ padding: '1.5rem', background: 'var(--card-background)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>🏆</span> Achievements
      </h3>
      <div className="badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {badges.map(badge => (
          <div key={badge.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            padding: '1rem',
            borderRadius: '12px',
            border: badge.unlocked ? '2px solid var(--primary-color)' : '1px dashed var(--border-color)',
            background: badge.unlocked ? 'var(--surface-hover)' : 'transparent',
            opacity: badge.unlocked ? 1 : 0.5,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', filter: badge.unlocked ? 'none' : 'grayscale(100%)' }}>
              {badge.icon}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {badge.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {badge.description}
            </div>
            {!badge.unlocked && (
              <div style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                LOCKED
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Badges;
