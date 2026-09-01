import React from 'react';
import { Check, Trash2, Play, Circle } from 'lucide-react';
import { Todo } from '../../types';
import { useTodoStore } from '../../stores/todoStore';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { toggleTodo, deleteTodo, activeTodoId, setActiveTodo } = useTodoStore();
  const isActive = activeTodoId === todo.id;

  return (
    <div
      onClick={() => setActiveTodo(todo.id)}
      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-blue-600/15 border-blue-500/40 shadow-sm'
          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {/* Toggle checkbox button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTodo(todo.id);
          }}
          className={`flex items-center justify-center w-5 h-5 rounded-full border transition-all ${
            todo.completed
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-white/30 hover:border-blue-400 text-transparent'
          }`}
        >
          {todo.completed ? <Check className="w-3 h-3 stroke-[3]" /> : <Circle className="w-2.5 h-2.5 fill-current opacity-0 hover:opacity-50" />}
        </button>

        {/* Title and active badge */}
        <div className="flex flex-col min-w-0">
          <span
            className={`text-xs font-medium truncate transition-colors ${
              todo.completed ? 'line-through text-white/40' : 'text-white/90'
            }`}
          >
            {todo.title}
          </span>
          {todo.description && (
            <span className="text-[10px] text-white/40 truncate">{todo.description}</span>
          )}
        </div>
      </div>

      {/* Right controls: Active status / Delete */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isActive ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Active
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTodo(todo.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-blue-400 transition-opacity"
            title="Set as active focus task"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTodo(todo.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-rose-400 transition-opacity"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
