import React, { useEffect, useState, useRef } from 'react';
import { GitBranch, RefreshCw, UserCheck, Edit2, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { GithubService } from '../../services/github/githubService';
import { GithubUserData } from '../../types';

export const GithubHeatmap: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [data, setData] = useState<GithubUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!settings.githubUsername);
  const [inputVal, setInputVal] = useState(settings.githubUsername || '');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings.githubUsername) {
      loadContributions(settings.githubUsername);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [settings.githubUsername]);

  useEffect(() => {
    // Scroll heatmap matrix to the end (most recent activity) automatically on load
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data]);

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
      const cleanName = inputVal.trim();
      updateSettings({ githubUsername: cleanName });
      setIsEditing(false);
      loadContributions(cleanName);
    }
  };

  // Extract all 365 days of contribution data for the year
  const flatDays = data?.weeks.flatMap((w) => w.days) || [];

  return (
    <div className="flex flex-col h-full bg-[#0E0E12] rounded-2xl border border-white/10 p-3 space-y-2 select-none">
      {/* Header with GitHub User Info */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90">
          <GitBranch className="w-4 h-4 text-blue-400" />
          <span>GitHub Contributions</span>
          {settings.githubUsername && !isEditing && (
            <span className="text-[10px] font-normal text-blue-300/80 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              @{settings.githubUsername}
            </span>
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
            onClick={() => {
              setInputVal(settings.githubUsername || '');
              setIsEditing(!isEditing);
            }}
            className="p-1 text-white/40 hover:text-blue-400 transition-colors"
            title={isEditing ? 'Cancel' : 'Edit GitHub ID'}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSaveUsername} className="flex-1 flex flex-col items-center justify-center p-3 space-y-2 bg-white/[0.02] rounded-xl border border-white/5">
          <span className="text-xs font-medium text-white/90">Connect Your GitHub Account</span>
          <span className="text-[10px] text-white/40 text-center max-w-[280px]">
            Enter your public GitHub username to fetch your real contribution calendar and commit streak.
          </span>
          <div className="flex items-center gap-2 w-full max-w-[300px]">
            <input
              type="text"
              placeholder="e.g. torvalds"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 font-semibold text-white hover:bg-blue-500 transition-colors shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-1 flex flex-col justify-between space-y-1.5 p-1 overflow-hidden">
          {/* Subheader: Total contributions */}
          <div className="flex items-center justify-between text-[10px] text-white/60 px-1">
            <span className="font-semibold text-white/80">
              {loading ? 'Loading GitHub calendar...' : `${data?.totalContributions || 0} contributions in the last year`}
            </span>
            <div className="flex items-center gap-1 text-[9px] text-white/40">
              <span>Scroll for full year</span>
              <ChevronRight className="w-2.5 h-2.5 text-blue-400" />
            </div>
          </div>

          {/* Full 52-Week Contribution Matrix (365 Days) */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden py-1 px-1 custom-scrollbar border border-white/5 rounded-xl bg-black/30 flex items-center"
          >
            {flatDays.length === 0 && !loading ? (
              <div className="w-full text-center text-xs text-white/30 py-4">No contribution data found</div>
            ) : (
              <div className="inline-grid grid-flow-col grid-rows-7 gap-[3px] p-1.5">
                {flatDays.map((day, idx) => {
                  const level = day.level;
                  let bgClass = 'bg-[#14141C] border-white/5';
                  if (level === 4) bgClass = 'bg-[#2563EB] border-blue-400 shadow-[0_0_6px_rgba(37,99,235,0.7)]';
                  else if (level === 3) bgClass = 'bg-[#3B82F6] border-blue-400/80';
                  else if (level === 2) bgClass = 'bg-[#1D4ED8] border-blue-500/60';
                  else if (level === 1) bgClass = 'bg-[#1E3A8A] border-blue-600/40';

                  return (
                    <div
                      key={`gh-day-${day.date}-${idx}`}
                      className={`w-[11px] h-[11px] rounded-[3px] border transition-transform hover:scale-125 ${bgClass}`}
                      title={`${day.date}: ${day.count} contributions`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Color legend footer */}
          <div className="flex items-center justify-between text-[9px] text-white/40 px-1 pt-0.5">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#14141C] border border-white/5" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1E3A8A] border border-blue-600/40" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1D4ED8] border border-blue-500/60" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#3B82F6] border border-blue-400/80" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#2563EB] border border-blue-400" />
            </div>
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
};
