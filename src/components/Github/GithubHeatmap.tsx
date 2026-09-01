import { useState, useEffect } from 'react';
import { GitBranch, RefreshCw, Key } from 'lucide-react';
import { GithubUserData, ContributionWeek, ContributionDay } from '../../types';
import { GithubService, generateMockGithubData } from '../../services/github/githubService';

export const GithubHeatmap: React.FC = () => {
  const [data, setData] = useState<GithubUserData>(generateMockGithubData('octocat'));
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const result = await GithubService.fetchContributions();
    setData(result);
    setIsLoading(false);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    GithubService.setToken(tokenInput.trim());
    setIsConnecting(false);
    setTokenInput('');
    await loadData();
  };

  const handleDisconnect = () => {
    GithubService.clearToken();
    setData(generateMockGithubData('octocat'));
  };

  const getCellColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-white/[0.04] border-white/5';
      case 1:
        return 'bg-blue-950/80 border-blue-800/40 text-blue-300';
      case 2:
        return 'bg-blue-700/80 border-blue-600/50 text-blue-100';
      case 3:
        return 'bg-blue-500 border-blue-400 text-white';
      case 4:
        return 'bg-blue-400 border-blue-300 shadow-sm shadow-blue-500/50';
      default:
        return 'bg-white/[0.04]';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-[#121216]/60 rounded-2xl border border-white/10 p-3.5 space-y-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-white/90" />
          <span className="text-xs font-bold text-white/90 tracking-wide uppercase">GitHub</span>
          <span className="text-[10px] text-white/50">@{data.username}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className={`p-1 text-white/40 hover:text-white transition-colors ${isLoading ? 'animate-spin' : ''}`}
            title="Refresh GitHub data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {GithubService.getToken() ? (
            <button
              onClick={handleDisconnect}
              className="text-[10px] text-rose-400/80 hover:text-rose-300 font-medium px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={() => setIsConnecting(true)}
              className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20"
            >
              <Key className="w-3 h-3" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>

      {/* Connect Token Modal / Form inline */}
      {isConnecting && (
        <form onSubmit={handleConnect} className="p-2.5 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-2">
          <div className="text-xs font-medium text-blue-200">Enter GitHub Personal Access Token</div>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full bg-black/50 border border-white/20 rounded px-2.5 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConnecting(false)}
              className="text-xs text-white/50 hover:text-white px-2 py-0.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-0.5 rounded"
            >
              Save Token
            </button>
          </div>
        </form>
      )}

      {/* Stats summary */}
      <div className="flex items-center justify-between text-xs text-white/60 px-1">
        <span>{data.totalContributions} contributions in the last year</span>
        {hoveredDay && (
          <span className="text-[11px] font-mono text-blue-300">
            {formatDate(hoveredDay.date)}: {hoveredDay.count} contribs
          </span>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto py-1">
        <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
          {data.weeks.flatMap((w: ContributionWeek, wIdx: number) =>
            w.days.map((day: ContributionDay, dIdx: number) => (
              <div
                key={`${wIdx}-${dIdx}`}
                onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-[10px] h-[10px] rounded-[2.5px] border transition-transform hover:scale-125 hover:z-10 ${getCellColor(
                  day.level
                )}`}
                title={`${formatDate(day.date)}: ${day.count} contributions`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
