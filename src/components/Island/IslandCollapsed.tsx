import React from 'react';
import { Timer, Flame, CheckCircle2, Play, Pause } from 'lucide-react';
import { useTimerStore } from '../../stores/timerStore';
import { useTodoStore } from '../../stores/todoStore';
import { useSettingsStore } from '../../stores/settingsStore';

interface IslandCollapsedProps {
  onExpand: () => void;
}

export const IslandCollapsed: React.FC<IslandCollapsedProps> = ({ onExpand }) => {
  const { timeLeft, isRunning, mode, startTimer, pauseTimer } = useTimerStore();
  const { todos, activeTodoId } = useTodoStore();
  const { settings } = useSettingsStore();

  const activeTodo = todos.find((t) => t.id === activeTodoId) || todos[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div
      onClick={onExpand}
      className="group relative flex items-center justify-between w-full h-[48px] px-4 bg-[#0D0D10]/95 backdrop-blur-xl border border-white/10 rounded-full cursor-pointer island-shadow hover:border-white/20 hover:bg-[#121216] transition-all duration-200 select-none overflow-hidden"
      style={{
        opacity: settings.widgetOpacity,
      }}
    >
      {/* Left side: Timer & Play/Pause */}
      {settings.collapsedShowTimer && (
        <div className="flex items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isRunning) pauseTimer();
              else startTimer();
            }}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/15 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20"
            title={isRunning ? 'Pause Timer' : 'Start Timer'}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 translate-x-[0.5px]" />}
          </button>
          
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-tight text-white/90">
            <Timer className="w-3.5 h-3.5 text-blue-400" />
            <span>{formatTime(timeLeft)}</span>
            {mode !== 'focus' && (
              <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {mode === 'shortBreak' ? 'Break' : 'Long Break'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Center: Active Task Title */}
      {settings.collapsedShowTask && activeTodo && (
        <div className="flex items-center gap-1.5 max-w-[200px] text-xs font-medium text-white/80 group-hover:text-white transition-colors truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 animate-pulse" />
          <span className="truncate">{activeTodo.title}</span>
        </div>
      )}

      {/* Right side stats badges */}
      <div className="flex items-center gap-2.5">
        {settings.collapsedShowStreak && (
          <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
            <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
            <span>12d</span>
          </div>
        )}
        {settings.collapsedShowGithub && (
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{completedCount}</span>
          </div>
        )}
      </div>

      {/* Sleek bottom blue accent glow line from reference screenshot */}
      <div className="absolute bottom-0 left-6 right-6 pill-accent-line" />
    </div>
  );
};
