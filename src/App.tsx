import { useEffect } from 'react';
import { Island } from './components/Island/Island';
import { useTodoStore } from './stores/todoStore';
import { useReminderStore } from './stores/reminderStore';
import { useSettingsStore } from './stores/settingsStore';

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

    return () => clearInterval(reminderInterval);
  }, [loadTodos, loadReminders, loadSettings, checkReminders]);

  return (
    <main className="w-screen h-screen bg-transparent overflow-hidden flex items-start justify-center">
      <Island />
    </main>
  );
}

export default App;
