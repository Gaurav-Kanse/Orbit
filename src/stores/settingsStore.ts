import { create } from 'zustand';
import { AppSettings } from '../types';
import { DBService } from '../services/database/db';

interface SettingsState {
  settings: AppSettings;
  loadFromDB: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#3B82F6',
  widgetOpacity: 1.0,
  cornerRadius: 24,
  animationEnabled: true,

  githubUsername: '',

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

  loadFromDB: async () => {
    try {
      const loaded = await DBService.loadSettings();
      if (Object.keys(loaded).length > 0) {
        set((state) => ({
          settings: { ...state.settings, ...loaded },
        }));
      }
    } catch (err) {
      console.warn('Error loading settings from SQLite:', err);
    }
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));

    // Persist every setting change to SQLite
    Object.entries(newSettings).forEach(([key, val]) => {
      DBService.saveSetting(key, val).catch((err) =>
        console.warn(`Error saving setting ${key}:`, err)
      );
    });
  },

  resetSettings: () => set({ settings: defaultSettings }),
}));
