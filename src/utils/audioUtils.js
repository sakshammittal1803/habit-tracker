// Singleton AudioContext and Browser Autoplay Policy Unlocker
let sharedAudioContext = null;
let isUnlocked = false;

export function getAudioContext() {
  if (typeof window === 'undefined') return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  // If the browser suspended the context due to autoplay policy, attempt to resume
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }

  return sharedAudioContext;
}

// Proactively unlock AudioContext on the user's first interaction anywhere on the page
export function initAudioUnlocker() {
  if (typeof window === 'undefined' || isUnlocked) return;

  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          isUnlocked = true;
        }).catch(() => {});
      } else if (ctx && ctx.state === 'running') {
        isUnlocked = true;
      }
    } catch (e) {
      // Ignore initial user gesture rejection
    } finally {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    }
  };

  window.addEventListener('click', unlock, { passive: true, once: true });
  window.addEventListener('keydown', unlock, { passive: true, once: true });
  window.addEventListener('touchstart', unlock, { passive: true, once: true });
}

// Initialize immediately upon module load
if (typeof window !== 'undefined') {
  initAudioUnlocker();
}

/**
 * Plays 4 distinct rhythmic reminder beeps for daily habit reminders
 */
export async function playAlarmSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

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
    console.warn("Alarm sound failed to play:", err);
  }
}

/**
 * Plays a pleasant ascending ding chime for Pomodoro timer completion
 */
export async function playPomodoroDing() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  } catch (err) {
    console.warn("Pomodoro chime failed to play:", err);
  }
}
