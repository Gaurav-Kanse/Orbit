import React, { useState } from 'react';
import { IslandHeader } from './IslandHeader';
import { TodoList } from '../Todo/TodoList';
import { GithubHeatmap } from '../Github/GithubHeatmap';
import { JourneyHeatmap } from '../Journey/JourneyHeatmap';
import { SettingsPanel } from '../Settings/SettingsPanel';
import { useAppStore } from '../../stores/appStore';
import { useSettingsStore } from '../../stores/settingsStore';

export const IslandExpanded: React.FC = () => {
  const { activeTab } = useAppStore();
  const { settings } = useSettingsStore();
  const [heatmapTab, setHeatmapTab] = useState<'journey' | 'github'>('journey');

  if (activeTab === 'settings') {
    return (
      <div className="w-full h-full flex flex-col bg-[#0A0A0C]/95 backdrop-blur-2xl border border-white/10 rounded-3xl island-shadow overflow-hidden">
        <IslandHeader />
        <div className="p-4 flex-1 overflow-hidden">
          <SettingsPanel />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col bg-[#0A0A0C]/95 backdrop-blur-2xl border border-white/10 rounded-3xl island-shadow overflow-hidden"
      style={{ opacity: settings.widgetOpacity }}
    >
      <IslandHeader />

      {/* Main expanded content layout */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-hidden">
        {/* Left Column: TODO List */}
        <div className="h-full overflow-hidden">
          <TodoList />
        </div>

        {/* Right Column: Heatmaps (Journey Streak & GitHub) */}
        <div className="h-full flex flex-col space-y-2 overflow-hidden">
          {/* Tab Switcher for Heatmaps */}
          <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/5 self-start">
            <button
              onClick={() => setHeatmapTab('journey')}
              className={`text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors ${
                heatmapTab === 'journey'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Journey Streak
            </button>
            <button
              onClick={() => setHeatmapTab('github')}
              className={`text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors ${
                heatmapTab === 'github'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              GitHub Calendar
            </button>
          </div>

          {/* Active Heatmap View */}
          <div className="flex-1 overflow-hidden">
            {heatmapTab === 'journey' ? <JourneyHeatmap /> : <GithubHeatmap />}
          </div>
        </div>
      </div>

      {/* Dynamic bottom blue accent line from screenshot */}
      <div className="w-full pill-accent-line opacity-60" />
    </div>
  );
};
