import React from 'react';
import { Timer, Settings, ChevronUp, Play, Pause, RotateCcw } from 'lucide-react';
import { useTimerStore } from '../../stores/timerStore';
import { useTodoStore } from '../../stores/todoStore';
import { useAppStore } from '../../stores/appStore';

export const IslandHeader: React.FC = () => {
  const { timeLeft, isRunning, mode, startTimer, pauseTimer, resetTimer } = useTimerStore();
  const { todos, activeTodoId } = useTodoStore();
  const { collapseIsland, activeTab, setActiveTab } = useAppStore();

  const activeTodo = todos.find((t) => t.id === activeTodoId) || todos[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 select-none bg-black/40">
      {/* Timer & active task summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 font-mono text-base font-bold text-white tracking-tight">
          <Timer className="w-4.5 h-4.5 text-blue-400" />
          <span>{formatTime(timeLeft)}</span>
          {mode !== 'focus' && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {mode}
            </span>
          )}
        </div>

        {activeTodo && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-white/70 max-w-[280px] truncate border-l border-white/15 pl-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
            <span className="truncate">{activeTodo.title}</span>
          </div>
        )}
      </div>

      {/* Quick Timer & Panel Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => (isRunning ? pauseTimer() : startTimer())}
          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={resetTimer}
          className="p-1.5 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/10 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/15 mx-1" />

        {/* Settings button */}
        <button
          onClick={() => setActiveTab(activeTab === 'settings' ? 'main' : 'settings')}
          className={`p-1.5 rounded-lg transition-colors ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Collapse button */}
        <button
          onClick={collapseIsland}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Collapse (ESC)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
