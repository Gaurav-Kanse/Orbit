import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useTodoStore } from '../../stores/todoStore';
import { useTimerStore } from '../../stores/timerStore';

interface DayActivity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = empty, 1-4 = intensity
}

export const JourneyHeatmap: React.FC = () => {
  const todos = useTodoStore((state) => state.todos);
  const completedSessions = useTimerStore((state) => state.completedSessions);

  // Calculate REAL activity matrix exclusively from user's completed tasks & focus minutes
  const { activityMatrix, currentStreak, totalCompletedTasks } = useMemo(() => {
    const today = new Date();
    const daysMap: Record<string, number> = {};

    // 1. Accumulate completed tasks by date
    let completedCount = 0;
    todos.forEach((t) => {
      if (t.completed) {
        completedCount++;
        if (t.completed_at) {
          const dateKey = t.completed_at.split('T')[0];
          daysMap[dateKey] = (daysMap[dateKey] || 0) + 1;
        }
      }
    });

    // 2. Accumulate today's completed Pomodoro focus sessions
    const todayKey = today.toISOString().split('T')[0];
    if (completedSessions > 0) {
      daysMap[todayKey] = (daysMap[todayKey] || 0) + completedSessions;
    }

    // 3. Build 12 columns x 5 rows grid (60 days of REAL history)
    const grid: DayActivity[][] = [];
    let activeStreak = 0;
    let countingStreak = true;

    for (let c = 0; c < 12; c++) {
      const col: DayActivity[] = [];
      for (let r = 0; r < 5; r++) {
        const index = c * 5 + r;
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() - (59 - index));
        const dateStr = targetDate.toISOString().split('T')[0];

        const count = daysMap[dateStr] || 0;
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count >= 5) level = 4;
        else if (count >= 3) level = 3;
        else if (count >= 2) level = 2;
        else if (count === 1) level = 1;

        col.push({
          date: dateStr,
          count,
          level,
        });
      }
      grid.push(col);
    }

    // Calculate current consecutive active streak working backwards from today
    for (let d = 0; d < 60; d++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - d);
      const dateStr = targetDate.toISOString().split('T')[0];
      if (daysMap[dateStr] && daysMap[dateStr] > 0) {
        if (countingStreak) activeStreak++;
      } else {
        if (d > 0) countingStreak = false; // allow today to be incomplete
      }
    }

    return {
      activityMatrix: grid,
      currentStreak: activeStreak,
      totalCompletedTasks: completedCount,
    };
  }, [todos, completedSessions]);

  return (
    <div className="flex flex-col h-full bg-[#0E0E12] rounded-2xl border border-white/10 p-3 space-y-2.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90">
          <Flame className="w-4 h-4 text-blue-400 fill-blue-400/20" />
          <span>Journey Streak</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold text-[11px]">
          <span>🔥</span>
          <span>{currentStreak}d streak</span>
        </div>
      </div>

      <div className="text-[10px] text-white/40 px-1">
        {totalCompletedTasks} completed tasks in Orbit
      </div>

      {/* Grid Heatmap with REAL user data */}
      <div className="flex-1 flex items-center justify-center py-1">
        <div className="grid grid-flow-col grid-rows-5 gap-[5px]">
          {activityMatrix.flatMap((col, cIdx) =>
            col.map((day, rIdx) => {
              let bgClass = 'bg-[#14141C] border-white/5';
              if (day.level === 4) bgClass = 'bg-[#2563EB] border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]';
              else if (day.level === 3) bgClass = 'bg-[#3B82F6] border-blue-400/80';
              else if (day.level === 2) bgClass = 'bg-[#1D4ED8] border-blue-500/60';
              else if (day.level === 1) bgClass = 'bg-[#1E3A8A] border-blue-600/40';

              return (
                <div
                  key={`j-cell-${cIdx}-${rIdx}`}
                  className={`w-[16px] h-[16px] rounded-[5px] border transition-all ${bgClass}`}
                  title={`${day.date}: ${day.count} activity points`}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
