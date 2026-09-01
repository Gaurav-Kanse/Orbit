import React, { useState } from 'react';
import { Sliders, Clock, Palette, Power, ChevronLeft, GitBranch, UserCheck } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTimerStore } from '../../stores/timerStore';
import { useAppStore } from '../../stores/appStore';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { setCustomDuration } = useTimerStore();
  const { setActiveTab } = useAppStore();

  const [githubInput, setGithubInput] = useState(settings.githubUsername || '');

  const accentColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

  const handleSaveGithub = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ githubUsername: githubInput.trim() });
  };

  const handleTimerDurationChange = (key: 'focusDuration' | 'shortBreakDuration' | 'longBreakDuration', value: number) => {
    const newSettings = { [key]: value };
    updateSettings(newSettings);

    const f = key === 'focusDuration' ? value : settings.focusDuration;
    const s = key === 'shortBreakDuration' ? value : settings.shortBreakDuration;
    const l = key === 'longBreakDuration' ? value : settings.longBreakDuration;

    setCustomDuration(f, s, l);
  };

  return (
    <div className="flex flex-col h-full bg-[#0E0E12] rounded-2xl border border-white/10 p-4 space-y-3.5 text-xs text-white overflow-y-auto max-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <button
          onClick={() => setActiveTab('main')}
          className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/90">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Orbit Settings</span>
        </div>
        <button
          onClick={resetSettings}
          className="text-[10px] text-white/40 hover:text-white/80 transition-colors"
        >
          Reset Defaults
        </button>
      </div>

      {/* GitHub Account Setup */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-white/80">
          <GitBranch className="w-3.5 h-3.5 text-blue-400" />
          <span>GitHub Account Setup</span>
        </div>

        <form onSubmit={handleSaveGithub} className="flex items-center gap-2 p-2.5 bg-white/[0.03] rounded-xl border border-white/5">
          <input
            type="text"
            placeholder="GitHub username (e.g. torvalds)"
            value={githubInput}
            onChange={(e) => setGithubInput(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>
        </form>
      </div>

      {/* Appearance & Accent */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-white/80">
          <Palette className="w-3.5 h-3.5 text-blue-400" />
          <span>Appearance & Accent</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-white/[0.03] rounded-xl border border-white/5">
          <span>Accent Color</span>
          <div className="flex items-center gap-2">
            {accentColors.map((color) => (
              <button
                key={color}
                onClick={() => updateSettings({ accentColor: color })}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  settings.accentColor === color ? 'scale-125 border-white' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Pomodoro Durations */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-white/80">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Timer Defaults (Minutes)</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1 p-2 bg-white/[0.03] rounded-xl border border-white/5">
            <span className="text-[10px] text-white/50">Focus Work</span>
            <input
              type="number"
              min="1"
              max="120"
              value={settings.focusDuration}
              onChange={(e) => handleTimerDurationChange('focusDuration', parseInt(e.target.value) || 25)}
              className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex flex-col gap-1 p-2 bg-white/[0.03] rounded-xl border border-white/5">
            <span className="text-[10px] text-white/50">Short Break</span>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.shortBreakDuration}
              onChange={(e) => handleTimerDurationChange('shortBreakDuration', parseInt(e.target.value) || 5)}
              className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex flex-col gap-1 p-2 bg-white/[0.03] rounded-xl border border-white/5">
            <span className="text-[10px] text-white/50">Long Break</span>
            <input
              type="number"
              min="1"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) => handleTimerDurationChange('longBreakDuration', parseInt(e.target.value) || 15)}
              className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* System & Startup */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-white/80">
          <Power className="w-3.5 h-3.5 text-blue-400" />
          <span>System & Startup</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-xl border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
            <input
              type="checkbox"
              checked={settings.alwaysOnTop}
              onChange={(e) => updateSettings({ alwaysOnTop: e.target.checked })}
              className="accent-blue-500 rounded"
            />
            <span>Always On Top</span>
          </label>

          <label className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-xl border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors">
            <input
              type="checkbox"
              checked={settings.launchOnStartup}
              onChange={(e) => updateSettings({ launchOnStartup: e.target.checked })}
              className="accent-blue-500 rounded"
            />
            <span>Launch on Linux Startup</span>
          </label>
        </div>
      </div>
    </div>
  );
};
