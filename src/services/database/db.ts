import Database from '@tauri-apps/plugin-sql';
import { Todo } from '../../types';

export class DBService {
  private static db: Database | null = null;

  static async getDB(): Promise<Database | null> {
    if (this.db) return this.db;
    try {
      this.db = await Database.load('sqlite:orbit.db');
      await this.initSchema();
      return this.db;
    } catch (err) {
      console.warn('SQLite native database not active in web mode; operating in local memory state:', err);
      return null;
    }
  }

  private static async initSchema() {
    if (!this.db) return;

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

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        todo_id TEXT,
        started_at TEXT NOT NULL,
        ended_at TEXT NOT NULL,
        duration INTEGER NOT NULL,
        completed INTEGER NOT NULL DEFAULT 1
      );
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS daily_activity (
        date TEXT PRIMARY KEY,
        tasks_completed INTEGER DEFAULT 0,
        focus_minutes INTEGER DEFAULT 0,
        focus_sessions INTEGER DEFAULT 0
      );
    `);
  }

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
}
