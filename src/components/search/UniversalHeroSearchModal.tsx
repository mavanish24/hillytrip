import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { 
  executeUniversalHeroSearch, 
  UniversalHeroGroup, 
  UniversalHeroResultItem,
  SearchDataSources 
} from '../../lib/universalHeroSearchEngine';

export interface UniversalHeroSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
  initialQuery?: string;
  sources: SearchDataSources;
}

// Helper to highlight matching query text in title
export function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }

  const q = query.trim().toLowerCase();
  const index = text.toLowerCase().indexOf(q);

  if (index === -1) {
    return <span>{text}</span>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return (
    <span>
      {before}
      <span className="font-black text-amber-300 bg-amber-400/20 px-0.5 rounded underline underline-offset-2 decoration-amber-400">
        {match}
      </span>
      {after}
    </span>
  );
}

const PLACEHOLDERS = [
  'Search destinations...',
  'Search attractions...',
  'Search homestays...',
  'Search taxi operators...',
  'Search routes...'
];

export const UniversalHeroSearchModal: React.FC<UniversalHeroSearchModalProps> = ({
  isOpen,
  onClose,
  navigate,
  initialQuery = '',
  sources
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focusedNavIndex, setFocusedNavIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial query
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setDebouncedQuery(initialQuery);
      setFocusedNavIndex(-1);
    }
  }, [isOpen, initialQuery]);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Rotating placeholder interval
  useEffect(() => {
    if (!isOpen || query.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isOpen, query]);

  // Debounce search query changes (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setFocusedNavIndex(-1);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute indexed search
  const groups: UniversalHeroGroup[] = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return executeUniversalHeroSearch(debouncedQuery, sources);
  }, [debouncedQuery, sources]);

  // Flat list of interactive targets (items + view-all buttons) for arrow key navigation
  const flatTargets = useMemo(() => {
    const list: { type: 'item' | 'viewAll'; item?: UniversalHeroResultItem; group?: UniversalHeroGroup; url: string }[] = [];
    groups.forEach(g => {
      g.previewItems.forEach(item => {
        list.push({ type: 'item', item, url: item.url });
      });
      if (g.totalCount > 3) {
        list.push({ type: 'viewAll', group: g, url: g.viewAllUrl });
      }
    });
    return list;
  }, [groups]);

  // Keyboard Navigation: ArrowUp, ArrowDown, Enter, Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedNavIndex(prev => (prev < flatTargets.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedNavIndex(prev => (prev > 0 ? prev - 1 : flatTargets.length - 1));
      } else if (e.key === 'Enter') {
        if (focusedNavIndex >= 0 && flatTargets[focusedNavIndex]) {
          e.preventDefault();
          const target = flatTargets[focusedNavIndex];
          onClose();
          navigate(target.url);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatTargets, focusedNavIndex, onClose, navigate]);

  if (!isOpen) return null;

  let overallFlatCounter = -1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 pb-6 overflow-y-auto">
        
        {/* BACKDROP WITH BLUR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        {/* SPOTLIGHT FLOATING SEARCH CONTAINER */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-slate-950/95 border border-white/20 rounded-[28px] sm:rounded-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 text-slate-100 flex flex-col max-h-[85vh]"
        >
          {/* SEARCH INPUT BAR */}
          <div className="relative p-4 sm:p-5 border-b border-white/10 flex items-center gap-3 bg-slate-900/60">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0 ml-1" />

            <div className="relative flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-base sm:text-lg font-medium text-white focus:outline-none placeholder-transparent pr-8"
              />

              {/* Dynamic Rotating Placeholder */}
              {!query && (
                <div className="absolute left-0 pointer-events-none text-base sm:text-lg text-slate-400 font-normal select-none">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={PLACEHOLDERS[placeholderIndex]}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {PLACEHOLDERS[placeholderIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-300 hover:text-white font-mono transition-colors cursor-pointer shrink-0"
            >
              ESC
            </button>
          </div>

          {/* SEARCH RESULTS PANEL CONTENT */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            
            {/* INITIAL EMPTY STATE */}
            {!query.trim() && (
              <div className="py-8 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 mb-1">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-extrabold text-white">Universal Himalayan Discovery</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Type a destination, attraction, homestay, taxi operator, stand or route to search across all of HillyTrip instantly.
                </p>
              </div>
            )}

            {/* NO RESULTS FOUND STATE */}
            {query.trim() && groups.length === 0 && (
              <div className="py-10 px-4 text-center space-y-2">
                <p className="text-sm font-extrabold text-amber-300">No results found.</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Try searching for another destination, attraction, homestay, taxi operator or route.
                </p>
              </div>
            )}

            {/* SEARCH GROUPS DISPLAY */}
            {groups.map((group) => (
              <div key={group.entityTypeKey} className="space-y-2">
                
                {/* GROUP HEADER: Icon + Group Name + (Count) */}
                <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{group.icon}</span>
                    <span className="font-display font-black text-xs sm:text-sm text-amber-300 uppercase tracking-wider">
                      {group.groupName} ({group.totalCount})
                    </span>
                  </div>
                </div>

                {/* GROUP RESULTS LIST (Max 3 Compact Text Rows) */}
                <div className="space-y-1">
                  {group.previewItems.map((item) => {
                    overallFlatCounter++;
                    const isNavFocused = focusedNavIndex === overallFlatCounter;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(item.url);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                          isNavFocused 
                            ? 'bg-amber-400/20 border border-amber-400/50 text-white' 
                            : 'hover:bg-slate-900 border border-transparent hover:border-white/10 text-slate-200'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          {/* Row Line 1: Icon & Name */}
                          <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-2 truncate">
                            <span className="shrink-0">{group.icon}</span>
                            <span className="truncate">
                              <HighlightedText text={item.name} query={debouncedQuery} />
                            </span>
                          </div>

                          {/* Row Line 2: Subtitle (Destination / Location if applicable) */}
                          {item.subtitle && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate pl-6 font-medium">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        <CornerDownLeft className={`w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isNavFocused ? 'opacity-100 text-amber-300' : 'text-slate-500'
                        }`} />
                      </button>
                    );
                  })}
                </div>

                {/* FULL-WIDTH ACTION BELOW 3rd RESULT IF totalCount > 3 */}
                {group.totalCount > 3 && (() => {
                  overallFlatCounter++;
                  const isNavFocused = focusedNavIndex === overallFlatCounter;

                  return (
                    <div className="pt-1">
                      <div className="w-full border-t border-white/10 mb-2" />
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(group.viewAllUrl);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isNavFocused
                            ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.01]'
                            : 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 hover:text-amber-200 border border-amber-400/30'
                        }`}
                      >
                        <span>View All {group.totalCount} {group.groupName}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })()}

              </div>
            ))}

          </div>

          {/* FOOTER HELPER TIPS */}
          <div className="p-3 bg-slate-900/80 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between px-6 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300">↑</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300">↓</span>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300">↵</span>
              <span>Open</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10 text-slate-300">ESC</span>
              <span>Close</span>
            </span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UniversalHeroSearchModal;
