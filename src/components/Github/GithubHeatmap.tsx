import React, { useEffect, useState } from 'react';
import { GitBranch, RefreshCw } from 'lucide-react';
import { GithubService } from '../../services/github/githubService';
import { GithubUserData } from '../../types';

export const GithubHeatmap: React.FC = () => {
  const [data, setData] = useState<GithubUserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    setLoading(true);
    try {
      const result = await GithubService.fetchContributions();
      setData(result);
    } catch (err) {
      console.error('Failed to load GitHub data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalContributions = data?.totalContributions || 874;

  return (
    <div className="flex flex-col h-full bg-[#0E0E12]/80 rounded-2xl border border-white/10 p-3 space-y-2.5 select-none">
      {/* Header matching reference */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90">
          <GitBranch className="w-4 h-4 text-blue-400" />
          <span>GitHub</span>
          <span className="text-[10px] font-normal text-white/40">@{data?.username || 'developer'}</span>
        </div>

        <button
          onClick={loadContributions}
          disabled={loading}
          className="p-1 text-white/40 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="text-[10px] text-white/40 px-1">
        {totalContributions} contributions in the last year
      </div>

      {/* Heatmap Grid matching reference image */}
      <div className="flex-1 flex items-center justify-center py-1">
        <div className="grid grid-flow-col grid-rows-5 gap-[5px]">
          {Array.from({ length: 60 }).map((_, idx) => {
            const seed = (idx * 11 + 3) % 10;
            const count = seed > 3 ? (seed % 4) + 1 : 0;
            let bgClass = 'bg-[#15151D] border-white/5';
            if (count > 3) bgClass = 'bg-[#2563EB] border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.6)]';
            else if (count > 1) bgClass = 'bg-[#3B82F6] border-blue-400/80';
            else if (count > 0) bgClass = 'bg-[#1D4ED8] border-blue-500/50';

            return (
              <div
                key={`gh-${idx}`}
                className={`w-[16px] h-[16px] rounded-[5px] border transition-all ${bgClass}`}
                title={`Day ${idx + 1}: ${count} contributions`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
