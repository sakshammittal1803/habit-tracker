import React from 'react';
import { calculateStreaks } from '../utils/habitUtils';

function Badges({ habits }) {
  // Check if there was ever a 7-day period where ALL habits were completed
  let hasPerfectWeek = false;
  if (habits && habits.length > 0) {
    // Get all completed dates from the first habit
    const firstHabitDates = Object.keys(habits[0].completions || {});
    // Filter to only dates where ALL habits have a completion
    const commonDates = firstHabitDates.filter(date => 
      habits.every(habit => habit.completions && habit.completions[date])
    );
    // If the combined streaks of these common dates is >= 7, they had a perfect week!
    if (calculateStreaks(commonDates).bestStreak >= 7) {
      hasPerfectWeek = true;
    }
  }

  const badges = [
    {
      id: 'starter',
      name: 'Habit Starter',
      description: 'Create your first habit',
      icon: '🌱',
      unlocked: habits && habits.length >= 1
    },
    {
      id: 'fire',
      name: 'On Fire',
      description: 'Reach a 7-day streak',
      icon: '🔥',
      unlocked: habits && habits.some(h => calculateStreaks(Object.keys(h.completions || {})).bestStreak >= 7)
    },
    {
      id: 'king',
      name: 'Consistency King',
      description: 'Reach a 30-day streak',
      icon: '👑',
      unlocked: habits && habits.some(h => calculateStreaks(Object.keys(h.completions || {})).bestStreak >= 30)
    },
    {
      id: 'perfect',
      name: 'Perfect Week',
      description: 'Completed all habits for 7 consecutive days',
      icon: '⭐',
      unlocked: hasPerfectWeek
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
