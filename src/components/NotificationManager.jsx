import { useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import { calculateDynamicGoal } from '../utils/habitUtils';

function NotificationManager({ habits }) {
  useEffect(() => {
    // Check every minute
    const interval = setInterval(() => {
      const now = new Date();
      
      const remindersEnabled = localStorage.getItem('reminders-enabled') === 'true';
      if (!remindersEnabled) return;

      const reminderTime = localStorage.getItem('reminder-time') || '20:00';
      const [targetHour, targetMinute] = reminderTime.split(':').map(Number);
      
      const todayStr = formatDate(now);
      const lastNotified = localStorage.getItem('last-notified-date');

      // Only notify once per day
      if (lastNotified === todayStr) return;

      // Check if it's time (or past time) to notify
      if (now.getHours() > targetHour || (now.getHours() === targetHour && now.getMinutes() >= targetMinute)) {
        
        // Are there uncompleted habits for today?
        let hasUncompleted = false;
        
        for (const habit of habits) {
          const dayOfWeek = now.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          
          let isDisabled = false;
          if (habit.frequency === 'weekdays' && isWeekend) isDisabled = true;
          if (habit.frequency === 'weekends' && !isWeekend) isDisabled = true;
          if (habit.frequency === 'custom' && habit.customDays && !habit.customDays.includes(dayOfWeek)) isDisabled = true;

          if (!isDisabled) {
            if (!habit.completions || !habit.completions[todayStr]) {
              hasUncompleted = true;
              break;
            }
          }
        }

        if (hasUncompleted) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Habit Reminder ⏰', {
              body: "You have uncompleted habits for today! Don't break your streak!",
              icon: '/pwa-192x192.png'
            });
            localStorage.setItem('last-notified-date', todayStr);
          } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Habit Reminder ⏰', {
                  body: "You have uncompleted habits for today! Don't break your streak!",
                  icon: '/pwa-192x192.png'
                });
                localStorage.setItem('last-notified-date', todayStr);
              }
            });
          }
        }
      }
    }, 60000); // every 1 minute

    return () => clearInterval(interval);
  }, [habits]);

  return null; // This is a logic-only component, renders nothing
}

export default NotificationManager;
