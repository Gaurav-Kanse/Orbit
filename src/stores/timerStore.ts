import { create } from 'zustand';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
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
  completedSessions: 0,

  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),

  resetTimer: () => {
    const mode = get().mode;
    set({
      timeLeft: DURATIONS[mode],
      totalDuration: DURATIONS[mode],
      isRunning: false,
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
      completedSessions: nextSessions,
    });
  },

  tick: () => {
    const { timeLeft, isRunning, mode, completedSessions } = get();
    if (!isRunning) return;

    if (timeLeft > 1) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      // Session finished
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
        completedSessions: nextSessions,
      });

      // Desktop notification trigger when available
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(mode === 'focus' ? 'Focus Session Completed!' : 'Break Time Finished!', {
          body: mode === 'focus' ? 'Great work! Take a short break.' : 'Ready to focus again?',
        });
      }
    }
  },

  setMode: (mode) => {
    set({
      mode,
      timeLeft: DURATIONS[mode],
      totalDuration: DURATIONS[mode],
      isRunning: false,
    });
  },

  setCustomDuration: (focusMin, shortBreakMin, longBreakMin) => {
    DURATIONS.focus = focusMin * 60;
    DURATIONS.shortBreak = shortBreakMin * 60;
    DURATIONS.longBreak = longBreakMin * 60;
    const mode = get().mode;
    set({
      timeLeft: DURATIONS[mode],
      totalDuration: DURATIONS[mode],
    });
  },
}));
