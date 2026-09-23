import { ATTRACTION_STORAGE_ASSETS, DESTINATION_STORAGE_ASSETS } from '../utils/imagePool';
import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from 'react';
import { Search, X, History, TrendingUp, Compass, MapPin, Tag, Command, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { Attraction, Destination } from '../types';
import { rankSearchEntities } from '../utils/searchRankingEngine';

export interface AttractionSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  attractionFilter: string;
  setAttractionFilter: (cat: string) => void;
  attractions: Attraction[];
  destinations: Destination[];
  onSelectAttraction?: (attraction: Attraction) => void;
  onSelectDestination?: (destination: Destination) => void;
  totalCount: number;
  filteredCount: number;
}

const POPULAR_SEARCH_CHIPS = [
  'Waterfalls',
  'Monasteries',
  'Tea Gardens',
  'Birding',
  'Lakes',
  'Forests',
  'Viewpoints',
  'Hidden Gems'
];

const LOCAL_STORAGE_KEY = 'hillytrip_recent_attraction_searches';

// Helper to normalize strings for accent and case insensitivity
function normalizeString(str: string = ''): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Helper to select high quality fallback thumbnails for category cards
function getCategoryThumbnail(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes('waterfall')) return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Waterfall%20(1).png';
  if (cat.includes('viewpoint') || cat.includes('mountain')) return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png';
  if (cat.includes('monastery') || cat.includes('heritage')) return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Monastery.png';
  if (cat.includes('lake')) return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png';
  if (cat.includes('trek') || cat.includes('forest')) return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Trek%20%20Hiking.png';
  if (cat.includes('tea')) return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png';
  return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/view%20point%20(2).png';
}

// Function to highlight matched search terms
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <span>{text}</span>;
  
  const normText = text.toLowerCase();
  const normQuery = query.toLowerCase().trim();
  const index = normText.indexOf(normQuery);

  if (index === -1) return <span>{text}</span>;

  const start = text.slice(0, index);
  const match = text.slice(index, index + normQuery.length);
  const end = text.slice(index + normQuery.length);

  return (
    <span>
      {start}
      <span className="bg-emerald-500/20 dark:bg-emerald-400/30 text-emerald-950 dark:text-emerald-200 font-extrabold px-1 py-0.5 rounded">
        {match}
      </span>
      {end}
    </span>
  );
}

export const AttractionSearchBar: React.FC<AttractionSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  attractionFilter,
  setAttractionFilter,
  attractions,
  destinations,
  onSelectAttraction,
  onSelectDestination,
  totalCount,
  filteredCount
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to read recent searches from localStorage:', e);
    }
  }, []);

  // Save query to recent searches
  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent search to localStorage:', e);
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {}
  };

  // Global Ctrl + K / Cmd + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Map destination IDs to Destination objects
  const destMap = useMemo(() => {
    return new Map((destinations || []).filter(d => d && d.id).map(d => [d.id, d]));
  }, [destinations]);

  // Pre-calculate category counts to avoid O(N*M) filtering inside render
  const categoryCountsMap = useMemo(() => {
    const map: Record<string, number> = {};
    (attractions || []).forEach(a => {
      if (a && a.category) {
        const catKey = a.category.toLowerCase();
        map[catKey] = (map[catKey] || 0) + 1;
      }
    });
    return map;
  }, [attractions]);

  const deferredQuery = useDeferredValue(searchQuery);
  const [remoteAttractions, setRemoteAttractions] = useState<Attraction[]>([]);

  // Live remote search suggestions from Supabase backend
  useEffect(() => {
    const q = deferredQuery.trim();
    if (q.length < 2) {
      setRemoteAttractions([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/attractions?q=${encodeURIComponent(q)}&limit=8`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          setRemoteAttractions(data);
        }
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
      });
    return () => controller.abort();
  }, [deferredQuery]);

  // Generate live search suggestions based on current search query
  const suggestions = useMemo(() => {
    const query = normalizeString(deferredQuery);
    if (!query) return { attractions: [], destinations: [], categories: [] };

    const terms = query.split(/\s+/).filter(Boolean);

    // Merge remote and locally provided candidates
    const pool = remoteAttractions.length > 0 
      ? remoteAttractions 
      : (attractions || []);

    // Rank attractions using weighted search ranking
    const rankedAttractions = rankSearchEntities(
      query,
      pool,
      attr => {
        const dest = attr.destinationId ? destMap.get(attr.destinationId) : undefined;
        return {
          name: attr.name,
          type: 'attraction',
          district: attr.district || dest?.district,
          description: attr.description,
          tags: [attr.category, attr.district].filter(Boolean) as string[]
        };
      }
    ).map(r => r.item).slice(0, 6);

    // Rank destinations / villages
    const rankedDestinations = rankSearchEntities(
      query,
      destinations || [],
      d => ({
        name: d.name,
        type: (d as any)?.isVillage ? 'village' : 'destination',
        district: d.district,
        description: d.description
      })
    ).map(r => r.item).slice(0, 4);

    // Filter categories
    const allCategories = ['Waterfall', 'Viewpoint', 'Monastery', 'Lake', 'Trek', 'Village'];
    const matchedCategories = allCategories.filter(cat => 
      terms.some(t => normalizeString(cat).includes(t))
    );

    return {
      attractions: rankedAttractions,
      destinations: rankedDestinations,
      categories: matchedCategories
    };
  }, [deferredQuery, attractions, destinations, destMap]);

  const totalSuggestionsCount = 
    suggestions.attractions.length + 
    suggestions.destinations.length + 
    suggestions.categories.length;

  // Keyboard navigation inside suggestions dropdown
  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery);
      }
      setIsFocused(false);
      return;
    }

    if (!isFocused || totalSuggestionsCount === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, totalSuggestionsCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalSuggestionsCount) % Math.max(1, totalSuggestionsCount));
    }
  };

  const handleChipClick = (term: string) => {
    setSearchQuery(term);
    saveRecentSearch(term);
    setIsFocused(false);
  };

  const handleSelectAttractionItem = (attr: Attraction) => {
    saveRecentSearch(attr.name);
    setSearchQuery(attr.name);
    setIsFocused(false);
    if (onSelectAttraction) {
      onSelectAttraction(attr);
    }
  };

  const handleSelectDestinationItem = (dest: Destination) => {
    saveRecentSearch(dest.name);
    setSearchQuery(dest.name);
    setIsFocused(false);
    if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto z-30">
      {/* Luxury Full-Width Search Input Container */}
      <div 
        className={`relative flex items-center bg-white dark:bg-slate-900 border transition-all duration-300 rounded-full shadow-lg p-1.5 sm:p-2 gap-2.5 ${
          isFocused 
            ? 'border-emerald-500 ring-4 ring-emerald-500/15 shadow-xl scale-[1.002]' 
            : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-slate-200/60 dark:shadow-slate-950/50'
        }`}
      >
        <div className="pl-3.5 sm:pl-4 pr-1 py-2 flex items-center shrink-0 text-emerald-600 dark:text-emerald-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isFocused}
          aria-autocomplete="list"
          aria-label="Search attractions by name, location, or category"
          placeholder="Search attractions, villages, waterfalls, monasteries, viewpoints..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(-1);
            if (!isFocused) setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDownInput}
          className="w-full py-2.5 sm:py-3 pr-2 sm:pr-4 text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />

        <div className="flex items-center gap-2 pr-1 shrink-0 self-stretch">
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg select-none">
            <Command className="w-3 h-3" /> K
          </kbd>

          <button
            type="button"
            onClick={() => {
              if (searchQuery.trim()) {
                saveRecentSearch(searchQuery);
              }
              setIsFocused(false);
            }}
            className="flex items-center justify-center gap-2 px-6 sm:px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98 shrink-0 h-full min-h-[44px]"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown & Recent/Popular Panel */}
      {isFocused && (
        <div className="absolute left-0 right-0 mt-3 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-amber-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 transition-all max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* STATE A: EMPTY QUERY (Recent Searches & Popular Discoveries) */}
          {!searchQuery.trim() && (
            <div className="p-4 sm:p-5 space-y-5 text-left">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-emerald-500" /> Recent Searches
                    </span>
                    <button
                      onClick={clearAllRecent}
                      className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleChipClick(term)}
                        className="group inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-300 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      >
                        <span>{term}</span>
                        <button
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 hover:scale-110 transition-transform"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Discoveries */}
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Popular Discoveries
                </span>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(chip)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-2xs hover:scale-102"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATE B: ACTIVE QUERY (Grouped Rich Cards) */}
          {searchQuery.trim() !== '' && (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-left">
              {totalSuggestionsCount === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Compass className="w-10 h-10 text-slate-350 dark:text-slate-600 mx-auto mb-2 animate-spin-slow" />
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No landmark matches for "{searchQuery}"</p>
                  <p className="text-xs text-slate-400 mt-1">Press Enter to view all mountain attractions and nearby districts.</p>
                </div>
              ) : (
                <>
                  {/* 📍 DESTINATIONS SECTION */}
                  {suggestions.destinations.length > 0 && (
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                        <span className="text-emerald-600 dark:text-emerald-400">📍</span> DESTINATIONS
                      </div>
                      <div className="space-y-1.5">
                        {suggestions.destinations.map((dest) => {
                          const destImg = dest.image || dest.coverImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png';
                          const villageText = (dest as any)?.village ? ` • ${(dest as any).village}` : '';
                          const secondary = `${dest.district || 'Mountain Region'}${villageText}`;
                          return (
                            <div
                              key={dest.id}
                              onClick={() => handleSelectDestinationItem(dest)}
                              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 border border-transparent hover:border-emerald-200/60 dark:hover:border-emerald-800/50 cursor-pointer transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 relative shadow-xs">
                                  <img
                                    src={destImg}
                                    alt={dest.name}
                                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png';
                                    }}
                                  />
                                  <div className="absolute top-1 left-1 bg-emerald-600/90 text-white rounded-md p-0.5 shadow-2xs">
                                    <MapPin className="w-2.5 h-2.5" />
                                  </div>
                                </div>
                                <div className="min-w-0 text-left">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                      <HighlightedText text={dest.name} query={searchQuery} />
                                    </h4>
                                    {dest.tourismType && (
                                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                                        {dest.tourismType}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                                    {secondary}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                                  Explore Destination
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 🌄 ATTRACTIONS SECTION */}
                  {suggestions.attractions.length > 0 && (
                    <div className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                        <span className="text-sky-600 dark:text-sky-400">🌄</span> ATTRACTIONS
                      </div>
                      <div className="space-y-1.5">
                        {suggestions.attractions.map((attr) => {
                          const dest = destMap.get(attr.destinationId);
                          const destName = dest ? dest.name : 'Himalayas';
                          const village = (dest as any)?.village ? ` • ${(dest as any).village}` : '';
                          const district = attr.district || dest?.district || 'North Bengal';
                          const secondary = `${destName}${village} • ${district}`;
                          const attrImg = attr.image || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png';
                          const isVerified = attr.isHiddenGem || attr.isFeaturedAttraction || true;

                          return (
                            <div
                              key={attr.id}
                              onClick={() => handleSelectAttractionItem(attr)}
                              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-sky-50/80 dark:hover:bg-sky-950/30 border border-transparent hover:border-sky-200/60 dark:hover:border-sky-800/50 cursor-pointer transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 relative shadow-xs">
                                  <img
                                    src={attrImg}
                                    alt={attr.name}
                                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png';
                                    }}
                                  />
                                  <div className="absolute top-1 left-1 bg-sky-600/90 text-white rounded-md p-0.5 shadow-2xs">
                                    <Compass className="w-2.5 h-2.5" />
                                  </div>
                                </div>
                                <div className="min-w-0 text-left">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                                      <HighlightedText text={attr.name} query={searchQuery} />
                                    </h4>
                                    {attr.category && (
                                      <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-[10px] font-bold border border-sky-300/80 dark:border-sky-800">
                                        {attr.category}
                                      </span>
                                    )}
                                    {isVerified && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300/80 dark:border-emerald-800">
                                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> Verified Spot
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                                    {secondary}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-sky-600 transition-all shrink-0 ml-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 🏞 CATEGORIES SECTION */}
                  {suggestions.categories.length > 0 && (
                    <div className="p-3 sm:p-4 bg-slate-50/40 dark:bg-slate-900/40">
                      <div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                        <span className="text-amber-600 dark:text-amber-400">🏞</span> CATEGORIES
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestions.categories.map((cat) => {
                          const catThumb = getCategoryThumbnail(cat);
                          const countInCat = categoryCountsMap[cat.toLowerCase()] || 0;
                          return (
                            <div
                              key={cat}
                              onClick={() => {
                                setAttractionFilter(cat);
                                setSearchQuery('');
                                setIsFocused(false);
                              }}
                              className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800/60 cursor-pointer transition-all duration-200 group shadow-2xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 relative">
                                  <img
                                    src={catThumb}
                                    alt={cat}
                                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                                  />
                                </div>
                                <div className="min-w-0 text-left">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                                    Filter by <HighlightedText text={cat} query={searchQuery} />
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {countInCat > 0 ? `${countInCat} Verified Attractions` : 'Explore Category'}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all shrink-0 ml-1" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttractionSearchBar;

