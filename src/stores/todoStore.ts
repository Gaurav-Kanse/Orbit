import { create } from 'zustand';
import { Todo, Priority } from '../types';
import { DBService } from '../services/database/db';

interface TodoState {
  todos: Todo[];
  activeTodoId: string | null;
  isLoading: boolean;

  loadFromDB: () => Promise<void>;
  addTodo: (title: string, priority?: Priority, description?: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  setActiveTodo: (id: string | null) => void;
  reorderTodos: (todos: Todo[]) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  activeTodoId: null,
  isLoading: false,

  loadFromDB: async () => {
    set({ isLoading: true });
    try {
      const loaded = await DBService.loadTodos();
      set({
        todos: loaded,
        activeTodoId: loaded.length > 0 ? loaded.find((t) => !t.completed)?.id || loaded[0].id : null,
      });
    } catch (err) {
      console.warn('Error loading todos from SQLite:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addTodo: async (title, priority = 'medium', description) => {
    if (!title.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description?.trim() || undefined,
      completed: false,
      priority,
      created_at: new Date().toISOString(),
      position: get().todos.length,
    };

    set((state) => ({
      todos: [newTodo, ...state.todos],
      activeTodoId: state.activeTodoId || newTodo.id,
    }));

    await DBService.saveTodo(newTodo);
  },

  toggleTodo: async (id) => {
    const state = get();
    const target = state.todos.find((t) => t.id === id);
    if (!target) return;

    const completed = !target.completed;
    const updatedTodo: Todo = {
      ...target,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    };

    set((s) => ({
      todos: s.todos.map((t) => (t.id === id ? updatedTodo : t)),
    }));

    await DBService.saveTodo(updatedTodo);
  },

  deleteTodo: async (id) => {
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
      activeTodoId: state.activeTodoId === id ? null : state.activeTodoId,
    }));

    await DBService.deleteTodo(id);
  },

  updateTodo: async (id, updates) => {
    const target = get().todos.find((t) => t.id === id);
    if (!target) return;

    const updatedTodo: Todo = { ...target, ...updates };

    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? updatedTodo : t)),
    }));

    await DBService.saveTodo(updatedTodo);
  },

  setActiveTodo: (id) => {
    set({ activeTodoId: id });
  },

  reorderTodos: (todos) => {
    set({ todos });
    todos.forEach((t, idx) => {
      DBService.saveTodo({ ...t, position: idx }).catch(() => {});
    });
  },
}));
