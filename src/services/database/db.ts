import Database from '@tauri-apps/plugin-sql';
import { Todo, AppSettings } from '../../types';

export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  completed: boolean;
  created_at: string;
}

export interface FocusSessionRecord {
  id: string;
  todo_id?: string | null;
  mode: string;
  started_at: string;
  ended_at: string;
  duration: number;
  completed: boolean;
}

export class DBService {
  private static db: Database | null = null;

  static async getDB(): Promise<Database | null> {
    if (this.db) return this.db;
    try {
      this.db = await Database.load('sqlite:orbit.db');
      await this.initSchema();
      return this.db;
    } catch (err) {
      console.warn('[Orbit DBService] SQLite plugin not initialized; using localStorage persistent fallback:', err);
      return null;
    }
  }

  private static async initSchema() {
    if (!this.db) return;

    // 1. Todos Table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TEXT NOT NULL,
        completed_at TEXT,
        due_date TEXT,
        position INTEGER NOT NULL DEFAULT 0
      );
    `);

    // 2. Focus Sessions Table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        todo_id TEXT,
        mode TEXT NOT NULL DEFAULT 'focus',
        started_at TEXT NOT NULL,
        ended_at TEXT NOT NULL,
        duration INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 1
      );
    `);

    // 3. Reminders Table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        scheduled_at TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // 4. App Settings Table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 5. Daily Activity Table
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS daily_activity (
        date TEXT PRIMARY KEY,
        tasks_completed INTEGER DEFAULT 0,
        focus_minutes INTEGER DEFAULT 0,
        focus_sessions INTEGER DEFAULT 0
      );
    `);
  }

  // --- TODOS ---
  static async saveTodo(todo: Todo) {
    // 1. Dual persistence: LocalStorage backup
    try {
      const current = await this.loadTodos();
      const idx = current.findIndex((t) => t.id === todo.id);
      if (idx >= 0) {
        current[idx] = todo;
      } else {
        current.unshift(todo);
      }
      localStorage.setItem('orbit_todos', JSON.stringify(current));
    } catch (_) {}

    // 2. Primary: SQLite
    const db = await this.getDB();
    if (!db) return;
    try {
      await db.execute(
        `INSERT OR REPLACE INTO todos (id, title, description, completed, priority, created_at, completed_at, due_date, position)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          todo.id,
          todo.title,
          todo.description || null,
          todo.completed ? 1 : 0,
          todo.priority,
          todo.created_at,
          todo.completed_at || null,
          todo.due_date || null,
          todo.position,
        ]
      );
    } catch (_) {}
  }

  static async loadTodos(): Promise<Todo[]> {
    let todos: Todo[] = [];

    // 1. Try SQLite
    try {
      const db = await this.getDB();
      if (db) {
        const rows: any[] = await db.select('SELECT * FROM todos ORDER BY position ASC, created_at DESC');
        todos = rows.map((r) => ({
          ...r,
          completed: Boolean(r.completed),
        }));
      }
    } catch (_) {}

    // 2. Fallback to LocalStorage if SQLite returned empty
    if (todos.length === 0 && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('orbit_todos');
        if (stored) {
          todos = JSON.parse(stored);
        }
      } catch (_) {}
    }

    return todos;
  }

  static async deleteTodo(id: string) {
    // 1. LocalStorage backup
    try {
      const current = await this.loadTodos();
      const updated = current.filter((t) => t.id !== id);
      localStorage.setItem('orbit_todos', JSON.stringify(updated));
    } catch (_) {}

    // 2. SQLite
    const db = await this.getDB();
    if (!db) return;
    try {
      await db.execute('DELETE FROM todos WHERE id = $1', [id]);
    } catch (_) {}
  }

  // --- FOCUS SESSIONS ---
  static async saveFocusSession(session: FocusSessionRecord) {
    try {
      const stored = localStorage.getItem('orbit_focus_sessions') || '[]';
      const parsed = JSON.parse(stored);
      parsed.push(session);
      localStorage.setItem('orbit_focus_sessions', JSON.stringify(parsed));
    } catch (_) {}

    const db = await this.getDB();
    if (!db) return;
    try {
      await db.execute(
        `INSERT INTO focus_sessions (id, todo_id, mode, started_at, ended_at, duration, completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          session.id,
          session.todo_id || null,
          session.mode,
          session.started_at,
          session.ended_at,
          session.duration,
          session.completed ? 1 : 0,
        ]
      );
    } catch (_) {}
  }

  // --- REMINDERS ---
  static async saveReminder(reminder: ReminderItem) {
    try {
      const current = await this.loadReminders();
      const idx = current.findIndex((r) => r.id === reminder.id);
      if (idx >= 0) {
        current[idx] = reminder;
      } else {
        current.push(reminder);
      }
      localStorage.setItem('orbit_reminders', JSON.stringify(current));
    } catch (_) {}

    const db = await this.getDB();
    if (!db) return;
    try {
      await db.execute(
        `INSERT OR REPLACE INTO reminders (id, title, description, scheduled_at, completed, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          reminder.id,
          reminder.title,
          reminder.description || null,
          reminder.scheduled_at,
          reminder.completed ? 1 : 0,
          reminder.created_at,
        ]
      );
    } catch (_) {}
  }

  static async loadReminders(): Promise<ReminderItem[]> {
    let reminders: ReminderItem[] = [];

    try {
      const db = await this.getDB();
      if (db) {
        const rows: any[] = await db.select('SELECT * FROM reminders ORDER BY scheduled_at ASC');
        reminders = rows.map((r) => ({
          ...r,
          completed: Boolean(r.completed),
        }));
      }
    } catch (_) {}

    if (reminders.length === 0 && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('orbit_reminders');
        if (stored) {
          reminders = JSON.parse(stored);
        }
      } catch (_) {}
    }

    return reminders;
  }

  static async deleteReminder(id: string) {
    try {
      const current = await this.loadReminders();
      const updated = current.filter((r) => r.id !== id);
      localStorage.setItem('orbit_reminders', JSON.stringify(updated));
    } catch (_) {}

    const db = await this.getDB();
    if (!db) return;
    try {
      await db.execute('DELETE FROM reminders WHERE id = $1', [id]);
    } catch (_) {}
  }

  // --- SETTINGS PERSISTENCE ---
  static async saveSetting(key: string, value: any) {
    // 1. LocalStorage backup
    try {
      const current = await this.loadSettings();
      (current as any)[key] = value;
      localStorage.setItem('orbit_settings', JSON.stringify(current));
    } catch (_) {}

    // 2. SQLite
    const db = await this.getDB();
    if (!db) return;
    try {
      await db.execute(
        `INSERT OR REPLACE INTO app_settings (key, value) VALUES ($1, $2)`,
        [key, JSON.stringify(value)]
      );
    } catch (_) {}
  }

  static async loadSettings(): Promise<Partial<AppSettings>> {
    let settings: Record<string, any> = {};

    // 1. Try SQLite
    try {
      const db = await this.getDB();
      if (db) {
        const rows: any[] = await db.select('SELECT * FROM app_settings');
        rows.forEach((r) => {
          try {
            settings[r.key] = JSON.parse(r.value);
          } catch (_) {}
        });
      }
    } catch (_) {}

    // 2. Fallback to LocalStorage if SQLite returned empty
    if (Object.keys(settings).length === 0 && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('orbit_settings');
        if (stored) {
          settings = JSON.parse(stored);
        }
      } catch (_) {}
    }

    return settings as Partial<AppSettings>;
  }
}
