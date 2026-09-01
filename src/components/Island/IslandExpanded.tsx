import React, { useState } from 'react';
import { IslandHeader } from './IslandHeader';
import { TodoList } from '../Todo/TodoList';
import { GithubHeatmap } from '../Github/GithubHeatmap';
import { JourneyHeatmap } from '../Journey/JourneyHeatmap';
import { SettingsPanel } from '../Settings/SettingsPanel';
import { useAppStore } from '../../stores/appStore';

export const IslandExpanded: React.FC = () => {
  const { activeTab } = useAppStore();
  const [heatmapTab, setHeatmapTab] = useState<'journey' | 'github'>('journey');

  if (activeTab === 'settings') {
    return (
      <div className="w-full h-full flex flex-col bg-[#07070A] border border-white/10 rounded-b-2xl island-shadow overflow-hidden text-white">
        <IslandHeader />
        <div className="p-4 flex-1 overflow-hidden">
          <SettingsPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#07070A] border border-white/10 rounded-b-2xl island-shadow overflow-hidden text-white">
      {/* Top Header Bar */}
      <IslandHeader />

      {/* Main Grid: Left = TODO (48%), Right = JOURNEY / GITHUB (52%) */}
      <div className="flex-1 p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-hidden">
        {/* Left Column: TODO List */}
        <div className="h-full overflow-hidden">
          <TodoList />
        </div>

        {/* Right Column: Heatmaps (Journey Streak / GitHub Calendar) */}
        <div className="h-full flex flex-col space-y-2 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1 p-0.5 bg-white/[0.04] rounded-lg border border-white/5">
              <button
                onClick={() => setHeatmapTab('journey')}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  heatmapTab === 'journey'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Journey Streak
              </button>
              <button
                onClick={() => setHeatmapTab('github')}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                  heatmapTab === 'github'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                GitHub Calendar
              </button>
            </div>
          </div>

          {/* Active Heatmap View */}
          <div className="flex-1 overflow-hidden">
            {heatmapTab === 'journey' ? <JourneyHeatmap /> : <GithubHeatmap />}
          </div>
        </div>
      </div>

      {/* Sleek bottom glowing blue accent line matching reference screenshot */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-90" />
    </div>
  );
};
