import React, { useState, useEffect } from 'react';
import { Clock, Navigation, X, Trash2, ArrowRight } from 'lucide-react';
import { 
  getRecentRouteSearches, 
  removeRecentRouteSearch, 
  clearRecentRouteSearches, 
  RecentRouteSearch 
} from '../utils/recentSearches';

interface RecentRouteSearchesBarProps {
  clickQuickSearchRoute: (fromId: string, toId: string) => void;
  className?: string;
  variant?: 'compact' | 'hero' | 'card';
}

export const RecentRouteSearchesBar: React.FC<RecentRouteSearchesBarProps> = ({
  clickQuickSearchRoute,
  className = '',
  variant = 'compact'
}) => {
  const [recentSearches, setRecentSearches] = useState<RecentRouteSearch[]>([]);

  useEffect(() => {
    // Initial load
    setRecentSearches(getRecentRouteSearches());

    // Listen for real-time updates when route searches occur
    const handleUpdate = () => {
      setRecentSearches(getRecentRouteSearches());
    };

    window.addEventListener('hillytrip_recent_searches_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('hillytrip_recent_searches_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  if (!recentSearches || recentSearches.length === 0) {
    return null;
  }

  const handleRemoveOne = (e: React.MouseEvent, fromId: string, toId: string) => {
    e.stopPropagation();
    const updated = removeRecentRouteSearch(fromId, toId);
    setRecentSearches(updated);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentRouteSearches();
    setRecentSearches([]);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900/85 dark:bg-slate-900/90 backdrop-blur-md border border-amber-500/25 rounded-2xl p-3.5 sm:p-4 shadow-xl transition-all duration-300">
          <div className="flex flex-row items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 dark:text-amber-300 font-mono">
                Recent Route Searches
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border border-slate-700">
                {recentSearches.length} / 5
              </span>
            </div>

            <button
              onClick={handleClearAll}
              type="button"
              className="text-[11px] font-bold text-slate-400 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer group"
              title="Clear all recent route searches"
            >
              <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent select-none">
            {recentSearches.map((item, idx) => (
              <div
                key={`recent-${item.fromId}-${item.toId}-${idx}`}
                onClick={() => clickQuickSearchRoute(item.fromId, item.toId)}
                className="group relative inline-flex items-center gap-2 bg-slate-800/90 hover:bg-slate-750 active:scale-95 text-slate-150 py-2 px-3.5 rounded-xl text-xs font-extrabold border border-slate-700 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300 shrink-0" />
                <span className="text-slate-100 font-sans tracking-tight">
                  {item.fromName}
                </span>
                <ArrowRight className="w-3 h-3 text-amber-400/70 group-hover:text-amber-400 shrink-0" />
                <span className="text-slate-100 font-sans tracking-tight">
                  {item.toName}
                </span>

                <button
                  onClick={(e) => handleRemoveOne(e, item.fromId, item.toId)}
                  type="button"
                  className="ml-1 p-0.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition opacity-70 group-hover:opacity-100 cursor-pointer"
                  title="Remove from recent searches"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
