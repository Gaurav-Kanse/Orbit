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
      console.warn('SQLite plugin not initialized (web/dev mode); using in-memory state fallback:', err);
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
    const db = await this.getDB();
    if (!db) return;
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
  }

  static async loadTodos(): Promise<Todo[]> {
    const db = await this.getDB();
    if (!db) return [];
    const rows: any[] = await db.select('SELECT * FROM todos ORDER BY position ASC, created_at DESC');
    return rows.map((r) => ({
      ...r,
      completed: Boolean(r.completed),
    }));
  }

  static async deleteTodo(id: string) {
    const db = await this.getDB();
    if (!db) return;
    await db.execute('DELETE FROM todos WHERE id = $1', [id]);
  }

  // --- FOCUS SESSIONS ---
  static async saveFocusSession(session: FocusSessionRecord) {
    const db = await this.getDB();
    if (!db) return;
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

    // Update daily_activity record
    const dateKey = session.ended_at.split('T')[0];
    const minutes = Math.round(session.duration / 60);
    await db.execute(
      `INSERT INTO daily_activity (date, focus_minutes, focus_sessions)
       VALUES ($1, $2, 1)
       ON CONFLICT(date) DO UPDATE SET
       focus_minutes = focus_minutes + $2,
       focus_sessions = focus_sessions + 1`,
      [dateKey, minutes]
    );
  }

  static async loadFocusSessions(): Promise<FocusSessionRecord[]> {
    const db = await this.getDB();
    if (!db) return [];
    return await db.select('SELECT * FROM focus_sessions ORDER BY ended_at DESC');
  }

  // --- REMINDERS ---
  static async saveReminder(reminder: ReminderItem) {
    const db = await this.getDB();
    if (!db) return;
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
  }

  static async loadReminders(): Promise<ReminderItem[]> {
    const db = await this.getDB();
    if (!db) return [];
    const rows: any[] = await db.select('SELECT * FROM reminders ORDER BY scheduled_at ASC');
    return rows.map((r) => ({
      ...r,
      completed: Boolean(r.completed),
    }));
  }

  static async deleteReminder(id: string) {
    const db = await this.getDB();
    if (!db) return;
    await db.execute('DELETE FROM reminders WHERE id = $1', [id]);
  }

  // --- SETTINGS PERSISTENCE ---
  static async saveSetting(key: string, value: any) {
    const db = await this.getDB();
    if (!db) return;
    await db.execute(
      `INSERT OR REPLACE INTO app_settings (key, value) VALUES ($1, $2)`,
      [key, JSON.stringify(value)]
    );
  }

  static async loadSettings(): Promise<Partial<AppSettings>> {
    const db = await this.getDB();
    if (!db) return {};
    const rows: any[] = await db.select('SELECT * FROM app_settings');
    const settings: Record<string, any> = {};
    rows.forEach((r) => {
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch (_) {}
    });
    return settings as Partial<AppSettings>;
  }
}
