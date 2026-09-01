import React, { useEffect, useState } from 'react';
import { GitBranch, RefreshCw, UserCheck, Edit2 } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { GithubService } from '../../services/github/githubService';
import { GithubUserData } from '../../types';

export const GithubHeatmap: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [data, setData] = useState<GithubUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!settings.githubUsername);
  const [inputVal, setInputVal] = useState(settings.githubUsername || '');

  useEffect(() => {
    if (settings.githubUsername) {
      loadContributions(settings.githubUsername);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [settings.githubUsername]);

  const loadContributions = async (username: string) => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const result = await GithubService.fetchContributions(username);
      setData(result);
    } catch (err) {
      console.error('Failed to load GitHub data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      updateSettings({ githubUsername: inputVal.trim() });
      setIsEditing(false);
      loadContributions(inputVal.trim());
    }
  };

  const flatDays = data?.weeks.flatMap((w) => w.days) || [];
  // Slice to last 60 days to fit matrix perfectly
  const recentDays = flatDays.slice(-60);

  return (
    <div className="flex flex-col h-full bg-[#0E0E12] rounded-2xl border border-white/10 p-3 space-y-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90">
          <GitBranch className="w-4 h-4 text-blue-400" />
          <span>GitHub</span>
          {settings.githubUsername && !isEditing && (
            <span className="text-[10px] font-normal text-white/40">@{settings.githubUsername}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {settings.githubUsername && !isEditing && (
            <button
              onClick={() => loadContributions(settings.githubUsername)}
              disabled={loading}
              className="p-1 text-white/40 hover:text-white transition-colors"
              title="Refresh GitHub Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-white/40 hover:text-blue-400 transition-colors"
            title={isEditing ? 'Cancel' : 'Edit GitHub ID'}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSaveUsername} className="flex-1 flex flex-col items-center justify-center p-3 space-y-2 bg-white/[0.02] rounded-xl border border-white/5">
          <span className="text-xs font-medium text-white/80">Connect GitHub Account</span>
          <span className="text-[10px] text-white/40 text-center">Enter your GitHub ID to display your live activity calendar</span>
          <input
            type="text"
            placeholder="GitHub username"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full text-xs px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Connect Account</span>
          </button>
        </form>
      ) : (
        <div className="flex-1 flex flex-col justify-between p-1">
          <div className="flex items-center justify-between text-[10px] text-white/50 px-1">
            <span>{loading ? 'Fetching contributions...' : `${data?.totalContributions || 0} contributions this year`}</span>
            {data?.lastFetched && <span>Updated live</span>}
          </div>

          {/* Grid Heatmap */}
          <div className="flex-1 flex items-center justify-center my-1">
            <div className="grid grid-flow-col grid-rows-5 gap-[5px]">
              {Array.from({ length: 60 }).map((_, idx) => {
                const day = recentDays[idx];
                const level = day ? day.level : 0;
                let bgClass = 'bg-[#14141C] border-white/5';
                if (level === 4) bgClass = 'bg-[#2563EB] border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.7)]';
                else if (level === 3) bgClass = 'bg-[#3B82F6] border-blue-400/80';
                else if (level === 2) bgClass = 'bg-[#1D4ED8] border-blue-500/60';
                else if (level === 1) bgClass = 'bg-[#1E3A8A] border-blue-600/40';

                return (
                  <div
                    key={`gh-cell-${idx}`}
                    className={`w-[15px] h-[15px] rounded-[4px] border transition-all ${bgClass}`}
                    title={day ? `${day.date}: ${day.count} contributions` : 'No activity'}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
