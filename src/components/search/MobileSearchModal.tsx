import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ArrowLeft, 
  X, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Sparkles,
  Mountain,
  MapPin,
  Home,
  Car,
  Route as RouteIcon,
  Compass,
  Trash2
} from 'lucide-react';
import { 
  executeUniversalHeroSearch, 
  UniversalHeroGroup, 
  UniversalHeroResultItem,
  SearchDataSources 
} from '../../lib/universalHeroSearchEngine';
import { HighlightedText } from './UniversalHeroSearchModal';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  sources: SearchDataSources;
}

const POPULAR_SEARCHES = [
  'Darjeeling',
  'Gangtok',
  'Kalimpong',
  'Mirik',
  'Pelling',
  'Tiger Hill',
  'Lachung',
  'Ravangla'
];

const SEARCH_CATEGORIES = [
  { id: 'homestays', label: 'Homestays', icon: Home, path: '#/homestays', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  { id: 'waterfalls', label: 'Waterfalls', icon: MapPin, path: '#/attractions?category=waterfalls', color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  { id: 'trekking', label: 'Trekking', icon: RouteIcon, path: '#/explore', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { id: 'monasteries', label: 'Monasteries', icon: Compass, path: '#/attractions?category=culture', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { id: 'offbeat', label: 'Offbeat Places', icon: Mountain, path: '#/villages', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { id: 'taxi', label: 'Taxi Services', icon: Car, path: '#/taxi', color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' }
];

const STORAGE_KEY = 'hillytrip_recent_searches';

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
  isOpen,
  onClose,
  navigate,
  sources
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Normalize to strings
          const list = parsed
            .map(item => (typeof item === 'string' ? item : item?.query || item?.name || ''))
            .filter(Boolean);
          setRecentSearches(list.slice(0, 8));
        }
      }
    } catch {
      setRecentSearches([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      loadRecentSearches();
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Save to recent searches
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const existing = recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...existing].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage write errors
    }
  };

  const handleClearRecent = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentSearches([]);
    } catch {
      // Ignore
    }
  };

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute universal search
  const groups: UniversalHeroGroup[] = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return executeUniversalHeroSearch(debouncedQuery, sources);
  }, [debouncedQuery, sources]);

  const handleSelectItem = (url: string, name?: string) => {
    if (name) {
      saveRecentSearch(name);
    } else if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    onClose();
    navigate(url);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    saveRecentSearch(suggestion);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-[#090d16] text-white flex flex-col pt-[max(0.5rem,env(safe-area-inset-top,10px))] pb-[max(0.75rem,env(safe-area-inset-bottom,16px))] overflow-hidden"
      >
        {/* TOP SEARCH BAR */}
        <div className="px-3.5 py-2.5 border-b border-white/10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-xl shrink-0">
          {/* Back/Close Button (44px min touch target) */}
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Search Input Container */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, stays, taxis..."
              className="w-full h-11 bg-slate-900/90 border border-white/15 focus:border-amber-400 rounded-xl pl-10 pr-10 text-sm font-medium text-white placeholder-slate-400 outline-none transition-colors"
            />
            {/* Clear Button (44px touch target) */}
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  if (inputRef.current) inputRef.current.focus();
                }}
                className="absolute right-0 min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {/* 1. WHEN QUERY IS EMPTY: Recent, Popular, & Categories */}
          {!query.trim() && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors p-1"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={`${term}-${idx}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(term)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-xs font-medium text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectSuggestion(term)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Categories */}
              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Explore Categories
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {SEARCH_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(cat.path);
                        }}
                        className="min-h-[52px] p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex items-center gap-3 text-left transition-all cursor-pointer group"
                      >
                        <div className={`p-2 rounded-xl border ${cat.color} group-hover:scale-105 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* 2. WHEN QUERY IS NOT EMPTY: Search Results */}
          {query.trim() && (
            <>
              {groups.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No results found for &ldquo;{query}&rdquo;</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Try checking your spelling or search for popular destinations like Darjeeling, Gangtok, or Kalimpong.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('#/villages');
                    }}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-2 mt-2 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <span>Browse All Destinations</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {groups.map((group) => (
                    <div key={group.entityTypeKey} className="space-y-2">
                      {/* Group Header */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                          <span>{group.icon}</span>
                          <span>{group.groupName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({group.totalCount})</span>
                        </div>
                        {group.totalCount > group.previewItems.length && (
                          <button
                            type="button"
                            onClick={() => handleSelectItem(group.viewAllUrl, query)}
                            className="text-xs text-amber-400 hover:underline font-semibold"
                          >
                            View all
                          </button>
                        )}
                      </div>

                      {/* Group Result Items */}
                      <div className="space-y-1.5">
                        {group.previewItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectItem(item.url, item.name)}
                            className="w-full min-h-[50px] p-3 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 flex items-center justify-between text-left transition-all cursor-pointer group"
                          >
                            <div className="min-w-0 pr-3">
                              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                <HighlightedText text={item.name} query={query} />
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-300 shrink-0 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileSearchModal;
