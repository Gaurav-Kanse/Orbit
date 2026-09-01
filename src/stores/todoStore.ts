import { create } from 'zustand';
import { Todo, Priority } from '../types';

interface TodoState {
  todos: Todo[];
  activeTodoId: string | null;
  addTodo: (title: string, priority?: Priority, description?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  setActiveTodo: (id: string | null) => void;
  reorderTodos: (todos: Todo[]) => void;
}

const initialTodos: Todo[] = [
  {
    id: '1',
    title: 'Finish client work',
    description: 'Complete logo design and submit vector export',
    completed: false,
    priority: 'high',
    created_at: new Date().toISOString(),
    position: 0,
  },
  {
    id: '2',
    title: 'Study ML',
    description: 'Read Neural Networks Chapter 4',
    completed: true,
    priority: 'medium',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    position: 1,
  },
  {
    id: '3',
    title: 'College assignment',
    description: 'OS kernel scheduling essay',
    completed: false,
    priority: 'medium',
    created_at: new Date().toISOString(),
    position: 2,
  },
  {
    id: '4',
    title: 'Personal project',
    description: 'Setup FocusIsland desktop app',
    completed: true,
    priority: 'low',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    position: 3,
  },
];

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: initialTodos,
  activeTodoId: '1',

  addTodo: (title, priority = 'medium', description) => {
    if (!title.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: title.trim(),
      description,
      completed: false,
      priority,
      created_at: new Date().toISOString(),
      position: get().todos.length,
    };
    set((state) => {
      const updated = [newTodo, ...state.todos];
      return {
        todos: updated,
        activeTodoId: state.activeTodoId || newTodo.id,
      };
    });
  },

  toggleTodo: (id) => {
    set((state) => {
      const todos = state.todos.map((todo) => {
        if (todo.id === id) {
          const completed = !todo.completed;
          return {
            ...todo,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          };
        }
        return todo;
      });
      return { todos };
    });
  },

  deleteTodo: (id) => {
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
      activeTodoId: state.activeTodoId === id ? null : state.activeTodoId,
    }));
  },

  updateTodo: (id, updates) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  setActiveTodo: (id) => {
    set({ activeTodoId: id });
  },

  reorderTodos: (todos) => {
    set({ todos });
  },
}));
