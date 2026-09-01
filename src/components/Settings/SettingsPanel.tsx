import { Sliders, Eye, Clock, Palette, Power, ChevronLeft } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAppStore } from '../../stores/appStore';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { setActiveTab } = useAppStore();

  const accentColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

  return (
    <div className="flex flex-col h-full bg-[#121216]/95 rounded-2xl border border-white/10 p-5 space-y-4 text-xs text-white overflow-y-auto max-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
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

      {/* Section 1: Appearance & Accent */}
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

        <div className="flex items-center justify-between p-2.5 bg-white/[0.03] rounded-xl border border-white/5">
          <span>Widget Opacity</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.7"
              max="1.0"
              step="0.05"
              value={settings.widgetOpacity}
              onChange={(e) => updateSettings({ widgetOpacity: parseFloat(e.target.value) })}
              className="accent-blue-500 w-24"
            />
            <span className="font-mono text-[11px] text-white/60">{Math.round(settings.widgetOpacity * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Section 2: Collapsed Pill Content */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-white/80">
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          <span>Collapsed Pill Displays</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'collapsedShowTimer', label: 'Pomodoro Timer' },
            { key: 'collapsedShowTask', label: 'Current Active Task' },
            { key: 'collapsedShowStreak', label: 'Streak Counter' },
            { key: 'collapsedShowGithub', label: 'Task Count' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-xl border border-white/5 cursor-pointer hover:bg-white/[0.06] transition-colors"
            >
              <input
                type="checkbox"
                checked={Boolean((settings as any)[key])}
                onChange={(e) => updateSettings({ [key]: e.target.checked })}
                className="accent-blue-500 rounded"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 3: Pomodoro Durations */}
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
              onChange={(e) => updateSettings({ focusDuration: parseInt(e.target.value) || 25 })}
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
              onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
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
              onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
              className="bg-black/50 border border-white/10 rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Native Linux Options */}
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
