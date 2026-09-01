import { create } from 'zustand';
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
import { DBService, ReminderItem } from '../services/database/db';

interface ReminderState {
  reminders: ReminderItem[];
  isLoading: boolean;

  loadFromDB: () => Promise<void>;
  addReminder: (title: string, scheduledAt: string, description?: string) => Promise<void>;
  toggleReminderCompleted: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  checkReminders: () => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  isLoading: false,

  loadFromDB: async () => {
    set({ isLoading: true });
    try {
      const loaded = await DBService.loadReminders();
      set({ reminders: loaded });
    } catch (err) {
      console.warn('Error loading reminders from SQLite:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addReminder: async (title, scheduledAt, description) => {
    if (!title.trim()) return;

    const newReminder: ReminderItem = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description?.trim() || undefined,
      scheduled_at: scheduledAt,
      completed: false,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reminders: [...state.reminders, newReminder].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      ),
    }));

    await DBService.saveReminder(newReminder);
  },

  toggleReminderCompleted: async (id) => {
    const target = get().reminders.find((r) => r.id === id);
    if (!target) return;

    const updated: ReminderItem = {
      ...target,
      completed: !target.completed,
    };

    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? updated : r)),
    }));

    await DBService.saveReminder(updated);
  },

  deleteReminder: async (id) => {
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    }));

    await DBService.deleteReminder(id);
  },

  checkReminders: async () => {
    const { reminders } = get();
    const now = new Date().getTime();

    for (const reminder of reminders) {
      if (!reminder.completed) {
        const scheduledTime = new Date(reminder.scheduled_at).getTime();
        // Trigger notification if scheduled time is reached (within 60s window)
        if (scheduledTime <= now && now - scheduledTime < 60000) {
          // Mark as triggered/completed
          get().toggleReminderCompleted(reminder.id);

          // Fire native Linux desktop notification
          try {
            let granted = await isPermissionGranted();
            if (!granted) {
              const permission = await requestPermission();
              granted = permission === 'granted';
            }
            if (granted) {
              sendNotification({
                title: `Reminder: ${reminder.title}`,
                body: reminder.description || 'Your scheduled reminder is due now.',
              });
            }
          } catch (_) {
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`Reminder: ${reminder.title}`, {
                body: reminder.description || 'Your scheduled reminder is due now.',
              });
            }
          }
        }
      }
    }
  },
}));
