import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Star, ChevronRight, Clock, ArrowRight, MapPin, Sparkles, 
  Tag, Check, ArrowUpRight, Flame, Compass, Filter, CornerDownLeft
} from 'lucide-react';
import { 
  SearchScope, 
  UnifiedSearchItem, 
  buildUnifiedDataset, 
  searchHillyTrip,
  parseNaturalLanguageQuery,
  getSmartHomestayPriceGroups
} from '../lib/searchEngine';
import { Destination, Attraction, Homestay, Route, Hub, Driver, Blog } from '../types';

interface ModuleSearchInputProps {
  scope: SearchScope;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  navigate: (path: string) => void;
  className?: string;
  // Datasets
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  routes?: Route[];
  hubs?: Hub[];
  drivers?: Driver[];
  blogs?: Blog[];
  popularSearches?: string[];
}

export function ModuleSearchInput({
  scope,
  placeholder,
  value,
  onChange,
  navigate,
  className = '',
  destinations = [],
  attractions = [],
  homestays = [],
  routes = [],
  hubs = [],
  drivers = [],
  blogs = [],
  popularSearches
}: ModuleSearchInputProps) {
  const [internalQuery, setInternalQuery] = useState(value || '');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeChipFilter, setActiveChipFilter] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const focusInputRef = useRef<HTMLInputElement>(null);

  const query = value !== undefined ? value : internalQuery;

  const handleQueryChange = (newVal: string) => {
    setActiveChipFilter(null);
    if (onChange) {
      onChange(newVal);
    } else {
      setInternalQuery(newVal);
    }
  };

  // Sync external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalQuery(value);
    }
  }, [value]);

  // Scope configurations
  const scopeConfig: Record<SearchScope, { 
    name: string; 
    title: string; 
    icon: string; 
    defaultPopular: string[];
    trending: string[];
  }> = {
    all: { 
      name: 'All Modules', 
      title: '🌐 Searching HillyTrip', 
      icon: '🌐', 
      defaultPopular: ['Darjeeling', 'Lava', 'Gangtok'],
      trending: ['Takdah Offbeat', 'Mirik Lake']
    },
    destinations: { 
      name: 'Destinations', 
      title: '🏔 Searching Destinations', 
      icon: '🏔', 
      defaultPopular: ['Darjeeling', 'Kalimpong', 'Barfok', 'Takdah', 'Lava', 'Rishyap'],
      trending: ['Chatakpur Village', 'Sillery Gaon', 'Zuluk Valley']
    },
    attractions: { 
      name: 'Attractions', 
      title: '📍 Searching Attractions', 
      icon: '📍', 
      defaultPopular: ['Tiger Hill Sunrise', 'Durpin Monastery', 'Changey Waterfall', 'Mirik Lake', 'Batasia Loop'],
      trending: ['Lamahatta Eco Park', 'Neora Valley', 'Pine Forest Takdah']
    },
    homestays: { 
      name: 'Homestays', 
      title: '🏡 Searching Homestays', 
      icon: '🏡', 
      defaultPopular: ['Darjeeling Homestays', 'Takdah View Stays', 'Budget Stays under ₹1000', 'Pet Friendly Stays', 'Mountain View Stays'],
      trending: ['Heritage Wooden Cottages', 'Tea Estate Stays', 'Luxury Resorts']
    },
    restaurants: { 
      name: 'Restaurants', 
      title: '🍴 Searching Restaurants', 
      icon: '🍴', 
      defaultPopular: ['Art Cafe Kalimpong', 'Glenarys Darjeeling', 'Kunga Restaurant', 'Refuel Cafe'],
      trending: ['Local Momos & Thukpa', 'Mountain View Bakeries']
    },
    taxi: { 
      name: 'Taxi', 
      title: '🚕 Searching Taxi Routes & Stands', 
      icon: '🚕', 
      defaultPopular: ['NJP to Gangtok', 'Darjeeling Shared Taxi Stand', 'Kalimpong Local Taxi', 'Bagdogra Airport Cab'],
      trending: ['Sikkim Permit Cabs', 'Siliguri Hub']
    },
    guides: { 
      name: 'Guides', 
      title: '👤 Searching Local Guides', 
      icon: '👤', 
      defaultPopular: ['Sikkim Trekking Sherpa', 'Darjeeling Heritage Walk Guide', 'Bird Watching Guide'],
      trending: ['Kanchenjunga Local Experts', 'Botany Guides']
    },
    experiences: { 
      name: 'Experiences', 
      title: '🎒 Searching Local Experiences', 
      icon: '🎒', 
      defaultPopular: ['Tea Tasting Session', 'Teesta River Rafting', 'Kalimpong Paragliding', 'Organic Farming Walk'],
      trending: ['Traditional Monastery Chanting', 'Pottery Workshop']
    },
    blogs: { 
      name: 'Blogs', 
      title: '📰 Searching Travel Guides & Blogs', 
      icon: '📰', 
      defaultPopular: ['3-Day Darjeeling Itinerary', 'Offbeat Sikkim Villages', 'Best Time to Visit North Bengal', 'Packing Essentials'],
      trending: ['Monsoon Travel Safety', 'Hidden Waterfalls Map']
    },
    offers: { 
      name: 'Offers', 
      title: '🏷 Searching Special Offers & Deals', 
      icon: '🏷', 
      defaultPopular: ['Monsoon Discount', 'Early Bird Stay', 'Family Package Offer'],
      trending: ['Homestay Cashbacks', 'Free Breakfast Deals']
    },
    treks: { 
      name: 'Treks', 
      title: '🧗 Searching Treks & Trails', 
      icon: '🧗', 
      defaultPopular: ['Sandakphu Phalut Trek', 'Varsey Rhododendron Trail', 'Chatakpur Nature Hike', 'Goechala Pass'],
      trending: ['Neora Valley Jungle Trek', 'Rachela Peak Trail']
    }
  };

  const currentConfig = scopeConfig[scope] || scopeConfig.destinations;
  const inputPlaceholder = placeholder || `Search ${currentConfig.name}...`;

  // Load Recent Searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`hillytrip_recent_searches_${scope}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 4));
      }
    } catch (e) {}
  }, [scope]);

  const saveRecent = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 4);
    setRecentSearches(updated);
    try {
      localStorage.setItem(`hillytrip_recent_searches_${scope}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Lock body scroll and set up Escape listener when Focus Mode is active
  useEffect(() => {
    if (isFocusMode) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsFocusMode(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        focusInputRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isFocusMode]);

  // Master Unified Dataset
  const masterDataset = useMemo(() => {
    return buildUnifiedDataset({
      destinations,
      attractions,
      homestays,
      routes,
      hubs,
      drivers,
      blogs
    });
  }, [destinations, attractions, homestays, routes, hubs, drivers, blogs]);

  const deferredQuery = useDeferredValue(query);

  // Natural language intent
  const parsedIntent = useMemo(() => {
    return parseNaturalLanguageQuery(deferredQuery);
  }, [deferredQuery]);

  // Search Results
  const searchGroups = useMemo(() => {
    if (!deferredQuery.trim() && !activeChipFilter) return [];
    let effectiveQuery = deferredQuery;
    if (activeChipFilter) {
      effectiveQuery = `${deferredQuery} ${activeChipFilter}`.trim();
    }
    return searchHillyTrip(effectiveQuery, scope, masterDataset);
  }, [deferredQuery, activeChipFilter, scope, masterDataset]);

  const activeGroup = searchGroups.find(g => g.id === scope) || searchGroups[0];
  const items = activeGroup ? activeGroup.allItems : [];
  const previewItems = activeGroup ? activeGroup.previewItems : [];

  const totalCount = useMemo(() => {
    if (scope === 'all') {
      return searchGroups.reduce((acc, g) => acc + g.totalCount, 0);
    }
    return activeGroup ? activeGroup.totalCount : 0;
  }, [scope, searchGroups, activeGroup]);

  // Price Grouping for Homestays
  const homestayPriceGroups = useMemo(() => {
    if (scope === 'homestays' && items.length > 0 && parsedIntent.maxPrice === undefined && parsedIntent.minPrice === undefined) {
      return getSmartHomestayPriceGroups(items, query, parsedIntent);
    }
    return [];
  }, [scope, items, query, parsedIntent]);

  // Dynamic Smart Filter Chips
  const smartFilterChips = useMemo(() => {
    if (!query.trim()) return [];
    const chips: { label: string; action: string; active: boolean }[] = [];

    if (parsedIntent.locationHint) {
      chips.push({
        label: `📍 ${parsedIntent.locationHint.charAt(0).toUpperCase() + parsedIntent.locationHint.slice(1)}`,
        action: parsedIntent.locationHint,
        active: true
      });
    }

    if (scope === 'homestays') {
      if (parsedIntent.maxPrice) {
        chips.push({ label: `≤ ₹${parsedIntent.maxPrice}`, action: `under ₹${parsedIntent.maxPrice}`, active: true });
      } else {
        chips.push({ label: '₹0–₹1000', action: 'under ₹1000', active: activeChipFilter === 'under ₹1000' });
        chips.push({ label: '₹1000–₹1500', action: 'between ₹1000 and ₹1500', active: activeChipFilter === 'between ₹1000 and ₹1500' });
        chips.push({ label: '₹1500–₹3000', action: 'between ₹1500 and ₹3000', active: activeChipFilter === 'between ₹1500 and ₹3000' });
      }

      chips.push({ label: '🐾 Pet Friendly', action: 'pet friendly', active: !!parsedIntent.features.petFriendly || activeChipFilter === 'pet friendly' });
      chips.push({ label: '☕ Breakfast Included', action: 'breakfast included', active: !!parsedIntent.features.breakfastIncluded || activeChipFilter === 'breakfast included' });
      chips.push({ label: '🏔 Mountain View', action: 'mountain view', active: !!parsedIntent.features.mountainView || activeChipFilter === 'mountain view' });
      chips.push({ label: '👨‍👩‍👧 Family', action: 'family', active: !!parsedIntent.features.familyFriendly || activeChipFilter === 'family' });
    } else if (scope === 'attractions') {
      chips.push({ label: '🌊 Waterfalls', action: 'waterfall', active: activeChipFilter === 'waterfall' });
      chips.push({ label: '🏔 Viewpoints', action: 'viewpoint', active: activeChipFilter === 'viewpoint' });
      chips.push({ label: '⛩ Monasteries', action: 'monastery', active: activeChipFilter === 'monastery' });
      chips.push({ label: '🌲 Hidden Gems', action: 'hidden', active: !!parsedIntent.features.hiddenGem || activeChipFilter === 'hidden' });
    } else if (scope === 'taxi') {
      chips.push({ label: '🚖 Shared Taxi', action: 'shared', active: activeChipFilter === 'shared' });
      chips.push({ label: '🚕 Reserved Cab', action: 'reserved', active: activeChipFilter === 'reserved' });
    }

    return chips;
  }, [query, parsedIntent, scope, activeChipFilter]);

  const handleSelectSuggestion = (item: UnifiedSearchItem) => {
    saveRecent(item.name);
    setIsFocusMode(false);
    navigate(item.detailsUrl);
  };

  const handleViewAll = (overrideUrl?: string) => {
    saveRecent(query);
    setIsFocusMode(false);

    if (overrideUrl) {
      navigate(overrideUrl);
      return;
    }

    if (activeGroup && activeGroup.viewAllUrl) {
      navigate(activeGroup.viewAllUrl);
      return;
    }

    const baseRouteMap: Record<SearchScope, string> = {
      all: '#/destinations',
      destinations: '#/destinations',
      attractions: '#/attractions',
      homestays: '#/homestays',
      restaurants: '#/homestays',
      taxi: '#/routes',
      guides: '#/travel-guides',
      experiences: '#/attractions',
      blogs: '#/travel-guides',
      offers: '#/offers',
      treks: '#/attractions'
    };

    const base = baseRouteMap[scope] || '#/destinations';
    const params = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : '';
    navigate(`${base}${params}`);
  };

  const popSearches = popularSearches || currentConfig.defaultPopular;

  return (
    <>
      {/* 1. INLINE LAUNCHER BAR (Embedded in Module Page) */}
      <div className={`relative w-full ${className}`}>
        <div
          onClick={() => setIsFocusMode(true)}
          className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-full p-2.5 sm:p-3 shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-3 hover:border-emerald-500/50"
        >
          <div className="w-9 h-9 rounded-xl md:rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Search className="w-4.5 h-4.5" />
          </div>

          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={query}
              placeholder={inputPlaceholder}
              className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 pointer-events-none truncate"
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleQueryChange('');
              }}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg md:rounded-full text-slate-500 dark:text-slate-400 text-xs font-bold border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 2. FULL IMMERSIVE SEARCH FOCUS MODE OVERLAY */}
      <AnimatePresence>
        {isFocusMode && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center pt-4 sm:pt-14 px-3 sm:px-6 pb-6 overflow-y-auto bg-slate-950/80 backdrop-blur-xl transition-all">
            {/* Backdrop click dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFocusMode(false)}
              className="fixed inset-0 z-[-1]"
            />

            {/* Spotlight Container Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left my-auto sm:my-0"
            >
              {/* Header: Module Title Indicator & ESC Dismiss */}
              <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                    {currentConfig.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold rounded-md uppercase">
                    ESC
                  </span>
                  <button
                    onClick={() => setIsFocusMode(false)}
                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 relative flex items-center gap-3 bg-white dark:bg-slate-900">
                <Search className="w-6 h-6 text-emerald-500 shrink-0" />
                <input
                  ref={focusInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleViewAll();
                    }
                  }}
                  placeholder={inputPlaceholder}
                  className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-base sm:text-lg font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                />
                {query && (
                  <button
                    onClick={() => {
                      handleQueryChange('');
                      focusInputRef.current?.focus();
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (query.trim()) handleViewAll();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Search</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Filter Chips */}
              {smartFilterChips.length > 0 && (
                <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                    Detected:
                  </span>
                  {smartFilterChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (chip.active) setActiveChipFilter(null);
                        else setActiveChipFilter(chip.action);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition cursor-pointer flex items-center gap-1 border ${
                        chip.active
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span>{chip.label}</span>
                      {chip.active && <Check className="w-3 h-3 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Content Panel Area */}
              <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-4 sm:p-5">
                {/* BEFORE TYPING STATE: Recent & Popular & Trending */}
                {!query.trim() && (
                  <div className="space-y-5">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Recent Searches
                          </span>
                          <button
                            onClick={() => {
                              setRecentSearches([]);
                              localStorage.removeItem(`hillytrip_recent_searches_${scope}`);
                            }}
                            className="text-[10px] text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                handleQueryChange(term);
                                focusInputRef.current?.focus();
                              }}
                              className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 border border-slate-200/50 dark:border-slate-700/50"
                            >
                              <span>{term}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular in {currentConfig.name}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleQueryChange(term);
                              focusInputRef.current?.focus();
                            }}
                            className="px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {currentConfig.trending && currentConfig.trending.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-rose-500" /> Trending Searches
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentConfig.trending.map((term, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                handleQueryChange(term);
                                focusInputRef.current?.focus();
                              }}
                              className="px-3.5 py-2 bg-rose-500/5 dark:bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                            >
                              <span>🔥 {term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* LIVE SEARCH RESULTS STATE */}
                {query.trim() && totalCount > 0 && (
                  <div className="space-y-4">
                    {/* Homestay Price Grouping View */}
                    {homestayPriceGroups.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {homestayPriceGroups.map((group, groupIdx) => (
                          <div key={groupIdx} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex items-center justify-between px-1 mb-2.5">
                              <span className="text-xs font-black uppercase tracking-wider font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" />
                                {group.label} ({group.totalCount})
                              </span>
                              <button
                                onClick={() => handleViewAll(group.viewAllUrl)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5 cursor-pointer"
                              >
                                View All ({group.totalCount}) <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              {group.previewItems.map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => handleSelectSuggestion(item)}
                                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/60 cursor-pointer transition"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                                        {item.name}
                                      </span>
                                      {item.featured && (
                                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase rounded-md tracking-wider shrink-0">
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      <span className="flex items-center gap-1 truncate">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                        {item.location}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                                        <Star className="w-3 h-3 fill-amber-500" />
                                        {item.rating}
                                      </span>
                                    </div>
                                  </div>

                                  {item.price !== undefined && (
                                    <div className="text-right shrink-0">
                                      <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                        ₹{item.price}
                                      </span>
                                      <span className="block text-[10px] text-slate-400">/{item.priceType || 'night'}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : scope === 'all' ? (
                      /* Multi-Group View for 'All' scope */
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 space-y-4">
                        {searchGroups.map((grp) => (
                          <div key={grp.id} className="pt-3 first:pt-0">
                            <div className="flex items-center justify-between px-1 mb-2.5">
                              <span className="text-xs font-black uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <span>{grp.icon}</span>
                                {grp.title} ({grp.totalCount})
                              </span>
                              <button
                                onClick={() => handleViewAll(grp.viewAllUrl)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5 cursor-pointer"
                              >
                                View All ({grp.totalCount}) <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              {grp.previewItems.map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => handleSelectSuggestion(item)}
                                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/60 cursor-pointer transition"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                                        {item.name}
                                      </span>
                                      {item.featured && (
                                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase rounded-md tracking-wider shrink-0">
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      <span className="flex items-center gap-1 truncate">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                        {item.location}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                                        <Star className="w-3 h-3 fill-amber-500" />
                                        {item.rating}
                                      </span>
                                    </div>
                                  </div>

                                  {item.price !== undefined && (
                                    <div className="text-right shrink-0">
                                      <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                        ₹{item.price}
                                      </span>
                                      <span className="block text-[10px] text-slate-400">/{item.priceType || 'night'}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Flat Preview Suggestions View (Max 3) */
                      <div>
                        <div className="flex items-center justify-between px-1 mb-3">
                          <span className="text-xs font-black uppercase tracking-wider font-mono text-slate-400 flex items-center gap-1.5">
                            {currentConfig.icon} Live Matches in {currentConfig.name} ({totalCount})
                          </span>
                          {totalCount > 3 && (
                            <button
                              onClick={() => handleViewAll()}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 flex items-center gap-0.5 cursor-pointer"
                            >
                              View All ({totalCount}) <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {previewItems.map(item => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectSuggestion(item)}
                              className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-100 dark:border-slate-800/60 cursor-pointer transition"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                                    {item.name}
                                  </span>
                                  {item.featured && (
                                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase rounded-md tracking-wider shrink-0">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  <span className="flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    {item.location}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                                    <Star className="w-3 h-3 fill-amber-500" />
                                    {item.rating}
                                  </span>
                                </div>
                              </div>

                              {item.price !== undefined && (
                                <div className="text-right shrink-0">
                                  <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                    ₹{item.price}
                                  </span>
                                  <span className="block text-[10px] text-slate-400">/{item.priceType || 'night'}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* View All button at bottom */}
                        <button
                          onClick={() => handleViewAll()}
                          className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>View All ({totalCount}) {currentConfig.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* EMPTY STATE */}
                {query.trim() && totalCount === 0 && (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
                      No matching results found for "{query}"
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      Try searching by village name, nearby district, budget range, or broader keywords.
                    </p>

                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3 font-mono">
                        Popular Searches in {currentConfig.name}
                      </span>
                      <div className="flex flex-wrap justify-center gap-2">
                        {popSearches.map((term, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleQueryChange(term);
                              focusInputRef.current?.focus();
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
