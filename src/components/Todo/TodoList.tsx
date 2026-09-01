import React from 'react';
import { ListTodo } from 'lucide-react';
import { useTodoStore } from '../../stores/todoStore';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';

export const TodoList: React.FC = () => {
  const todos = useTodoStore((state) => state.todos);

  return (
    <div className="flex flex-col h-full bg-[#121216]/60 rounded-2xl border border-white/10 p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90 tracking-wide uppercase">
          <ListTodo className="w-4 h-4 text-blue-400" />
          <span>To Do</span>
        </div>
        <span className="text-[10px] font-mono font-semibold text-white/40 px-2 py-0.5 bg-white/5 rounded-full">
          {todos.filter((t) => !t.completed).length} remaining
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[220px]">
        {todos.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/40 italic">
            No tasks yet. Add one below!
          </div>
        ) : (
          todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </div>

      {/* Input */}
      <TodoInput />
    </div>
  );
};
