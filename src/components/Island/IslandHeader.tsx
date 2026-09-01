import React from 'react';
import { Timer, Settings, ChevronUp, Play, Pause, RotateCcw } from 'lucide-react';
import { useTimerStore } from '../../stores/timerStore';
import { useTodoStore } from '../../stores/todoStore';
import { useAppStore } from '../../stores/appStore';

export const IslandHeader: React.FC = () => {
  const { timeLeft, isRunning, mode, startTimer, pauseTimer, resetTimer } = useTimerStore();
  const { todos, activeTodoId } = useTodoStore();
  const { collapseIsland, activeTab, setActiveTab } = useAppStore();

  const activeTodo = todos.find((t) => t.id === activeTodoId) || todos.find((t) => !t.completed);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 select-none bg-black/40">
      {/* Left: Timer readout & active task */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-white tracking-tight">
          <Timer className="w-4 h-4 text-blue-400" />
          <span>{formatTime(timeLeft)}</span>
          {mode !== 'focus' && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {mode === 'shortBreak' ? 'Break' : 'Long Break'}
            </span>
          )}
        </div>

        <div className="w-[1px] h-3.5 bg-white/15" />

        <div className="flex items-center gap-1.5 text-xs font-medium text-white/80 max-w-[240px] truncate">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeTodo ? 'bg-blue-400' : 'bg-white/30'}`} />
          <span className="truncate">{activeTodo ? activeTodo.title : 'No active task'}</span>
        </div>
      </div>

      {/* Right: Quick action controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => (isRunning ? pauseTimer() : startTimer())}
          className="p-1 rounded-md bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" />}
        </button>

        <button
          onClick={resetTimer}
          className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'settings' ? 'main' : 'settings')}
          className={`p-1 rounded-md transition-colors ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={collapseIsland}
          className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Collapse (ESC)"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
