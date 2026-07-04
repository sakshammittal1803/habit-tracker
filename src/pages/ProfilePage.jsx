import React, { useRef, useState } from 'react';
import Badges from '../components/Badges';
import { getWeekDates, formatDate, getWeekStart } from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';
import { exportHabitsToCSV, importHabitsFromCSV } from '../utils/habitUtils';

function ProfilePage({ user, habits, onImportHabits }) {
  const { accent, setAccent } = useTheme();
  const fileInputRef = useRef(null);
  
  if (!user) return null;

  const [remindersEnabled, setRemindersEnabled] = useState(() => localStorage.getItem('reminders-enabled') === 'true');
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem('reminder-time') || '20:00');

  const handleReminderToggle = (e) => {
    const enabled = e.target.checked;
    setRemindersEnabled(enabled);
    localStorage.setItem('reminders-enabled', enabled);
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setReminderTime(time);
    localStorage.setItem('reminder-time', time);
  };

  // Calculate perfectHabits for the current week to pass to Badges
  const currentWeekStart = getWeekStart(new Date());
  const weekDates = getWeekDates(currentWeekStart);
  
  const habitStats = habits.map(habit => {
    const completedDays = weekDates.filter(date => {
      const dateStr = formatDate(date);
      return habit.completions && habit.completions[dateStr];
    }).length;
    return {
      percentage: Math.round((completedDays / 7) * 100)
    };
  });
  
  const perfectHabits = habitStats.filter(habit => habit.percentage === 100).length;

  const handleExport = () => {
    const csvStr = exportHabitsToCSV(habits);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit_tracker_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvStr = event.target.result;
      const importedHabits = importHabitsFromCSV(csvStr);
      if (importedHabits && importedHabits.length > 0) {
        if (window.confirm(`Found ${importedHabits.length} habits in CSV. This will overwrite your current data. Proceed?`)) {
          if (onImportHabits) onImportHabits(importedHabits);
        }
      } else {
        alert('No valid habits found in CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Your Profile</h1>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Profile Info Card */}
        <div style={{ 
          background: 'var(--card-background)', 
          borderRadius: 'var(--radius)', 
          border: '1px solid var(--border-color)', 
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          {/* Avatar */}
          <div style={{ flexShrink: 0 }}>
            {user.picture ? (
              <img 
                src={user.picture} 
                alt="Profile" 
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-color)' }} 
              />
            ) : (
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', 
                background: 'var(--primary-color)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: '3rem', fontWeight: 'bold' 
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          {/* User Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', margin: 0 }}>{user.name}</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>{user.email}</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {user.age && (
                <div style={{ background: 'var(--background-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>Age</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{user.age}</strong>
                </div>
              )}
              {user.gender && (
                <div style={{ background: 'var(--background-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>Gender</span>
                  <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user.gender}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div style={{ 
          background: 'var(--card-background)', 
          borderRadius: 'var(--radius)', 
          border: '1px solid var(--border-color)', 
          padding: '2rem'
        }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.4rem' }}>Settings</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Theme Settings */}
            <div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>Accent Theme</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setAccent('forest-green')}
                  style={{ 
                    background: accent === 'forest-green' ? 'var(--primary-color)' : 'var(--background-color)',
                    color: accent === 'forest-green' ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#10b981' }}></span>
                  Forest Green
                </button>
                <button 
                  onClick={() => setAccent('ocean-blue')}
                  style={{ 
                    background: accent === 'ocean-blue' ? 'var(--primary-color)' : 'var(--background-color)',
                    color: accent === 'ocean-blue' ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#0ea5e9' }}></span>
                  Ocean Blue
                </button>
                <button 
                  onClick={() => setAccent('sunset-orange')}
                  style={{ 
                    background: accent === 'sunset-orange' ? 'var(--primary-color)' : 'var(--background-color)',
                    color: accent === 'sunset-orange' ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)', padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#f97316' }}></span>
                  Sunset Orange
                </button>
              </div>
            </div>

            {/* Notifications Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>Notifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={remindersEnabled} 
                    onChange={handleReminderToggle} 
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                  />
                  Enable Daily Habit Reminders
                </label>
                
                {remindersEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Remind me at:</span>
                    <input 
                      type="time" 
                      value={reminderTime} 
                      onChange={handleTimeChange}
                      style={{ 
                        background: 'var(--background-color)', color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Data Management */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>Data Management</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Download your habits as a CSV file to keep a personal backup, or import an existing CSV file.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={handleExport}
                  style={{ 
                    background: 'var(--primary-color)', color: 'white', border: 'none', 
                    padding: '0.8rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' 
                  }}
                >
                  📥 Export CSV
                </button>
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleImport} 
                />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    background: 'var(--background-color)', color: 'var(--text-primary)', 
                    border: '1px solid var(--border-color)', padding: '0.8rem 1.2rem', 
                    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' 
                  }}
                >
                  📤 Import CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <Badges habits={habits} perfectHabits={perfectHabits} />
      </div>
    </div>
  );
}

export default ProfilePage;
