import React from 'react';
import { Check, Trash2, Play, Pause, Circle } from 'lucide-react';
import { Todo } from '../../types';
import { useTodoStore } from '../../stores/todoStore';
import { useTimerStore } from '../../stores/timerStore';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { toggleTodo, deleteTodo, activeTodoId, setActiveTodo } = useTodoStore();
  const { isRunning, startTimer, pauseTimer } = useTimerStore();
  const isActive = activeTodoId === todo.id;

  return (
    <div
      onClick={() => setActiveTodo(todo.id)}
      className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-[#15151F] border-blue-500/40 shadow-sm'
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {/* Toggle checkbox button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTodo(todo.id);
          }}
          className={`flex items-center justify-center w-4.5 h-4.5 rounded-full border transition-all ${
            todo.completed
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-white/30 hover:border-blue-400 text-transparent'
          }`}
        >
          {todo.completed ? (
            <Check className="w-3 h-3 stroke-[3]" />
          ) : (
            <Circle className="w-2.5 h-2.5 fill-current opacity-0 hover:opacity-50" />
          )}
        </button>

        {/* Title and subtitle description */}
        <div className="flex flex-col min-w-0">
          <span
            className={`text-xs font-semibold truncate transition-colors ${
              todo.completed ? 'line-through text-white/40' : 'text-white/90'
            }`}
          >
            {todo.title}
          </span>
          <span className="text-[10px] text-white/40 truncate">
            {todo.description || 'Create 10 Logos for Marc\'s company'}
          </span>
        </div>
      </div>

      {/* Right controls: Play/Pause button for active task or action button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isActive ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isRunning) pauseTimer();
              else startTimer();
            }}
            className={`flex items-center justify-center w-7 h-7 rounded-full text-white shadow-md transition-transform active:scale-95 ${
              isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500'
            }`}
            title={isRunning ? 'Pause Focus' : 'Start Focus'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" />}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTodo(todo.id);
            }}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600/80 hover:bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Set Active & Play"
          >
            <Play className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" />
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
