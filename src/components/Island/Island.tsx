import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../stores/appStore';
import { IslandExpanded } from './IslandExpanded';
import { useTimerStore } from '../../stores/timerStore';
import { useTodoStore } from '../../stores/todoStore';

export const Island: React.FC = () => {
  const { isExpanded, expandIsland, collapseIsland } = useAppStore();
  const { timeLeft, isRunning, tick } = useTimerStore();
  const { todos, activeTodoId } = useTodoStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync live timer & active task title to Rust GNOME panel state endpoint
  useEffect(() => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const activeTodo = todos.find((t) => t.id === activeTodoId) || todos.find((t) => !t.completed);
    const taskTitle = activeTodo ? activeTodo.title : 'Orbit';

    // ONLY display countdown timer on top panel when timer is actively running
    const timerStr = isRunning ? formatTime(timeLeft) : '';

    invoke('update_panel_state', { timer: timerStr, task: taskTitle }).catch(() => {});
  }, [timeLeft, activeTodoId, todos, isRunning]);

  // Listen for state changes emitted directly from Rust IPC handler
  useEffect(() => {
    const unlistenPromise = listen<boolean>('orbit-state-changed', (event) => {
      if (event.payload) {
        expandIsland();
      } else {
        collapseIsland();
      }
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten()).catch(() => {});
    };
  }, [expandIsland, collapseIsland]);

  // When React collapses (ESC / click outside), inform Rust to hide window
  useEffect(() => {
    if (!isExpanded) {
      invoke('set_window_state', { expanded: false }).catch(() => {});
    }
  }, [isExpanded]);

  // Pomodoro timer tick
  useEffect(() => {
    const timer = setInterval(() => tick(), 1000);
    return () => clearInterval(timer);
  }, [tick]);

  // ESC to collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        collapseIsland();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, collapseIsland]);

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        isExpanded
      ) {
        collapseIsland();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, collapseIsland]);

  return (
    <div className="w-full h-full flex flex-col items-start justify-start select-none p-0">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={containerRef}
            key="expanded"
            initial={{ opacity: 0, scaleY: 0.7, scaleX: 0.95, y: -16 }}
            animate={{ opacity: 1, scaleY: 1, scaleX: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.7, scaleX: 0.95, y: -16 }}
            style={{ originX: '50%', originY: '0%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
            className="w-full h-full overflow-hidden"
          >
            <IslandExpanded />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
