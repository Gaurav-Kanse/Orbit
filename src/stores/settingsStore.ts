import { create } from 'zustand';
import { AppSettings } from '../types';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#3B82F6',
  widgetOpacity: 1.0,
  cornerRadius: 24,
  animationEnabled: true,

  githubUsername: 'Gaurav-Kanse',
  
  collapsedShowTimer: true,
  collapsedShowTask: true,
  collapsedShowStreak: false,
  collapsedShowGithub: false,

  expandedShowTodo: true,
  expandedShowGithub: true,
  expandedShowJourney: true,
  expandedShowStats: true,

  position: 'top-center',
  customOffset: 0,
  alwaysOnTop: true,
  launchOnStartup: false,

  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  resetSettings: () => set({ settings: defaultSettings }),
}));
