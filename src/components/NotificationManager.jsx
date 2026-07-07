import { useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import { calculateDynamicGoal } from '../utils/habitUtils';

export const playAlarmSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play 4 distinct alarm beeps
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime + (i * 0.4));
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime + (i * 0.4));
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + (i * 0.4) + 0.2);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime + (i * 0.4));
      osc.stop(ctx.currentTime + (i * 0.4) + 0.2);
    }
  } catch (err) {
    console.error("Audio play failed:", err);
  }
};

function NotificationManager({ habits }) {
  useEffect(() => {
    const checkAndNotify = async () => {
      const now = new Date();
      
      const remindersEnabled = localStorage.getItem('reminders-enabled') === 'true';
      if (!remindersEnabled) return;

      const reminderTime = localStorage.getItem('reminder-time') || '20:00';
      const [targetHour, targetMinute] = reminderTime.split(':').map(Number);
      
      const todayStr = formatDate(now);
      const lastNotified = localStorage.getItem('last-notified-date');

      // Only notify once per day for that specific time
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
            const title = 'Habit Reminder ⏰';
            const options = {
              body: "You have uncompleted habits for today! Don't break your streak!",
              icon: '/pwa-192x192.png'
            };

            try {
              let shown = false;
              if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && registration.active) {
                  await registration.showNotification(title, options);
                  shown = true;
                }
              }
              
              if (!shown) {
                new Notification(title, options);
              }
              
              // Play audible alarm
              playAlarmSound();
            } catch (err) {
              new Notification(title, options);
              playAlarmSound();
            }
            
            localStorage.setItem('last-notified-date', todayStr);
          }
        }
      }
    };

    // Check immediately on mount/update
    checkAndNotify();

    // Check every 10 seconds to be extremely precise with system time
    const interval = setInterval(checkAndNotify, 10000);

    return () => clearInterval(interval);
  }, [habits]);

  return null; // This is a logic-only component, renders nothing
}

export default NotificationManager;
