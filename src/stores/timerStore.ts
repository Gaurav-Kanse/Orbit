import { create } from 'zustand';
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
import { DBService } from '../services/database/db';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
  startedAt: number | null; // Timestamp when session started
  pausedAt: number | null; // Timestamp when session was paused
  completedSessions: number;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  setCustomDuration: (focusMin: number, shortBreakMin: number, longBreakMin: number) => void;
}

const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'focus',
  timeLeft: DURATIONS.focus,
  totalDuration: DURATIONS.focus,
  isRunning: false,
  startedAt: null,
  pausedAt: null,
  completedSessions: 0,

  startTimer: () => {
    const { isRunning } = get();
    if (isRunning) return;

    const now = Date.now();
    set({
      isRunning: true,
      startedAt: now,
      pausedAt: null,
    });
  },

  pauseTimer: () => {
    const { isRunning, startedAt, timeLeft } = get();
    if (!isRunning) return;

    const now = Date.now();
    let currentRemaining = timeLeft;
    if (startedAt) {
      const elapsedSeconds = Math.floor((now - startedAt) / 1000);
      currentRemaining = Math.max(0, timeLeft - elapsedSeconds);
    }

    set({
      isRunning: false,
      startedAt: null,
      pausedAt: now,
      timeLeft: currentRemaining,
    });
  },

  resetTimer: () => {
    const mode = get().mode;
    set({
      timeLeft: DURATIONS[mode],
      totalDuration: DURATIONS[mode],
      isRunning: false,
      startedAt: null,
      pausedAt: null,
    });
  },

  skipTimer: () => {
    const { mode, completedSessions } = get();
    let nextMode: TimerMode = 'focus';
    let nextSessions = completedSessions;

    if (mode === 'focus') {
      nextSessions += 1;
      nextMode = nextSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
    } else {
      nextMode = 'focus';
    }

    set({
      mode: nextMode,
      timeLeft: DURATIONS[nextMode],
      totalDuration: DURATIONS[nextMode],
      isRunning: false,
      startedAt: null,
      pausedAt: null,
      completedSessions: nextSessions,
    });
  },

  tick: () => {
    const { isRunning, startedAt, timeLeft, mode, completedSessions, totalDuration } = get();
    if (!isRunning || !startedAt) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startedAt) / 1000);
    const calculatedRemaining = Math.max(0, timeLeft - elapsedSeconds);

    if (calculatedRemaining > 0) {
      // Smooth timestamp-based update
      set({
        timeLeft: calculatedRemaining,
        startedAt: now, // Reset anchor point per tick for smooth countdown
      });
    } else {
      // --- TIMER COMPLETED ---
      const sessionEndedAt = new Date().toISOString();
      const sessionStartedAt = new Date(now - totalDuration * 1000).toISOString();

      let nextMode: TimerMode = 'focus';
      let nextSessions = completedSessions;

      if (mode === 'focus') {
        nextSessions += 1;
        nextMode = nextSessions % 4 === 0 ? 'longBreak' : 'shortBreak';

        // Auto-save completed focus session to SQLite
        DBService.saveFocusSession({
          id: Date.now().toString(),
          mode: 'focus',
          started_at: sessionStartedAt,
          ended_at: sessionEndedAt,
          duration: totalDuration,
          completed: true,
        }).catch((err) => console.warn('Error saving focus session:', err));
      } else {
        nextMode = 'focus';
      }

      set({
        mode: nextMode,
        timeLeft: DURATIONS[nextMode],
        totalDuration: DURATIONS[nextMode],
        isRunning: false,
        startedAt: null,
        pausedAt: null,
        completedSessions: nextSessions,
      });

      // Fire Native Linux Desktop Notification
      const title = mode === 'focus' ? 'Focus Session Complete!' : 'Break Time Complete!';
      const body = mode === 'focus' ? 'Great focus work! Take a break.' : 'Ready for your next focus session?';

      (async () => {
        try {
          let granted = await isPermissionGranted();
          if (!granted) {
            const permission = await requestPermission();
            granted = permission === 'granted';
          }
          if (granted) {
            sendNotification({ title, body });
          }
        } catch (_) {
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
          }
        }
      })();
    }
  },

  setMode: (mode) => {
    set({
      mode,
      timeLeft: DURATIONS[mode],
      totalDuration: DURATIONS[mode],
      isRunning: false,
      startedAt: null,
      pausedAt: null,
    });
  },

  setCustomDuration: (focusMin, shortBreakMin, longBreakMin) => {
    DURATIONS.focus = Math.max(1, focusMin) * 60;
    DURATIONS.shortBreak = Math.max(1, shortBreakMin) * 60;
    DURATIONS.longBreak = Math.max(1, longBreakMin) * 60;
    const mode = get().mode;
    set({
      timeLeft: DURATIONS[mode],
      totalDuration: DURATIONS[mode],
      startedAt: null,
      pausedAt: null,
    });
  },
}));
