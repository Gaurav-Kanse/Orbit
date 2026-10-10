import { useEffect } from 'react';
import { Island } from './components/Island/Island';
import { useTodoStore } from './stores/todoStore';
import { useReminderStore } from './stores/reminderStore';
import { useSettingsStore } from './stores/settingsStore';
import { register, unregister } from '@tauri-apps/plugin-global-shortcut';
import { invoke } from '@tauri-apps/api/core';

export function App() {
  const loadTodos = useTodoStore((state) => state.loadFromDB);
  const loadReminders = useReminderStore((state) => state.loadFromDB);
  const loadSettings = useSettingsStore((state) => state.loadFromDB);
  const checkReminders = useReminderStore((state) => state.checkReminders);

  useEffect(() => {
    // 1. Initialize SQLite data on startup
    loadTodos();
    loadReminders();
    loadSettings();

    // 2. Start 30-second interval to check for scheduled desktop reminders
    const reminderInterval = setInterval(() => {
      checkReminders();
    }, 30000);

    // 3. Register global keyboard shortcuts for cross-platform access (Windows & Linux)
    const shortcuts = ['CommandOrControl+Alt+O', 'Alt+Shift+O'];
    const setupShortcuts = async () => {
      try {
        await register(shortcuts, (event) => {
          if (event.state === 'Pressed') {
            invoke('toggle_orbit').catch((err) => {
              console.warn('[Orbit] Failed to toggle via shortcut:', err);
            });
          }
        });
      } catch (err) {
        console.warn('[Orbit] Global shortcut setup notice:', err);
      }
    };
    setupShortcuts();

    return () => {
      clearInterval(reminderInterval);
      unregister(shortcuts).catch(() => {});
    };
  }, [loadTodos, loadReminders, loadSettings, checkReminders]);

  return (
    <main className="w-screen h-screen bg-transparent overflow-hidden flex items-start justify-center">
      <Island />
    </main>
  );
}

export default App;
