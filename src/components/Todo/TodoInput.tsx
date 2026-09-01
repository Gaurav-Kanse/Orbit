import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTodoStore } from '../../stores/todoStore';
import { Priority } from '../../types';

export const TodoInput: React.FC = () => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [isAdding, setIsAdding] = useState(false);
  const addTodo = useTodoStore((state) => state.addTodo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTodo(title, priority);
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 w-full py-2 px-3 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg border border-dashed border-blue-500/30 transition-all group"
      >
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Add a task</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        autoFocus
        className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
      />
      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          {(['low', 'medium', 'high'] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                priority === p
                  ? p === 'high'
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                    : p === 'medium'
                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                    : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="text-xs text-white/50 hover:text-white px-2 py-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-md transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
};
