import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, ArrowLeft, X, Sparkles, MapPin, Compass, ArrowRight, Star, ChevronRight, Mic, Clock
} from 'lucide-react';
import { Destination, Attraction, Homestay, Route, Hub, Driver, Blog } from '../types';
import { 
  SearchScope, 
  UnifiedSearchItem, 
  SearchGroup, 
  buildUnifiedDataset, 
  searchHillyTrip 
} from '../lib/searchEngine';
import { resolveQueryDisambiguation } from '../utils/searchDisambiguationEngine';
import { IntelligentSearchDisambiguationPanel } from './IntelligentSearchDisambiguationPanel';

interface UniversalSearchProps {
  navigate: (path: string) => void;
  currentPath?: string;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  routes?: Route[];
  hubs?: Hub[];
  drivers?: Driver[];
  blogs?: Blog[];
}

export function UniversalSearch({
  navigate,
  currentPath = '/search',
  destinations = [],
  attractions = [],
  homestays = [],
  routes = [],
  hubs = [],
  drivers = [],
  blogs = []
}: UniversalSearchProps) {
  // Read scope parameter or search query from URL hash if available
  const { initialQuery, initialScope } = useMemo(() => {
    let q = '';
    let scope: SearchScope = 'all';
    try {
      const hash = window.location.hash || '';
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const params = new URLSearchParams(hash.substring(qIndex));
        q = params.get('search') || params.get('q') || '';
        const scopeParam = params.get('scope') as SearchScope;
        if (scopeParam) scope = scopeParam;
      }
    } catch (e) {}
    return { initialQuery: q, initialScope: scope };
  }, []);

  const [query, setQuery] = useState(initialQuery);
  const [activeScope, setActiveScope] = useState<SearchScope>(initialScope);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Load Recent Searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hillytrip_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 6));
      } else {
        setRecentSearches(['Darjeeling', 'Barfok', 'Tiger Hill', 'Lava', 'Gangtok']);
      }
    } catch (e) {
      setRecentSearches(['Darjeeling', 'Barfok', 'Tiger Hill', 'Lava']);
    }
  }, []);

  const saveRecent = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('hillytrip_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  // Build Unified Dataset
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

  // Execute intelligent search
  const searchGroups: SearchGroup[] = useMemo(() => {
    if (!query.trim()) return [];
    return searchHillyTrip(query, activeScope, masterDataset);
  }, [query, activeScope, masterDataset]);

  // Disambiguation resolution across live database entities
  const disambiguationResolution = useMemo(() => {
    if (!query.trim()) return null;
    return resolveQueryDisambiguation(query, {
      destinations,
      attractions,
      homestays,
      routes,
      hubs,
      drivers
    });
  }, [query, destinations, attractions, homestays, routes, hubs, drivers]);

  const totalResultsCount = useMemo(() => {
    return searchGroups.reduce((acc, g) => acc + g.totalCount, 0);
  }, [searchGroups]);

  const handleItemClick = (item: UnifiedSearchItem) => {
    saveRecent(item.name);
    navigate(item.detailsUrl);
  };

  const handleViewAllClick = (group: SearchGroup) => {
    saveRecent(query);
    navigate(group.viewAllUrl);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsVoiceActive(true);
      recognition.onend = () => setIsVoiceActive(false);
      recognition.onerror = () => setIsVoiceActive(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) setQuery(transcript);
      };

      recognition.start();
    } catch (e) {
      setIsVoiceActive(false);
    }
  };

  const scopeTabs: { id: SearchScope; label: string; icon: string }[] = [
    { id: 'all', label: 'Universal', icon: '🌐' },
    { id: 'destinations', label: 'Destinations', icon: '🏔' },
    { id: 'attractions', label: 'Attractions', icon: '📍' },
    { id: 'homestays', label: 'Homestays', icon: '🏡' },
    { id: 'restaurants', label: 'Restaurants', icon: '🍴' },
    { id: 'taxi', label: 'Taxi & Routes', icon: '🚕' },
    { id: 'guides', label: 'Guides', icon: '👤' },
    { id: 'offers', label: 'Offers', icon: '🏷' },
    { id: 'blogs', label: 'Blogs', icon: '📰' },
    { id: 'treks', label: 'Treks', icon: '🧗' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('#/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          Spotlight Intelligent Search
        </span>
      </div>

      {/* Main Search Bar Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Module Scope Tabs Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {scopeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveScope(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                activeScope === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-750'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeScope === 'all'
                ? 'Search anything across HillyTrip (e.g. "Waterfalls near Takdah", "Pet Friendly Homestays")...'
                : `Search only inside ${activeScope}...`
            }
            className="w-full bg-transparent border-0 text-white placeholder-slate-500 font-sans focus:outline-none text-sm sm:text-base font-semibold"
            autoFocus
          />
          {query ? (
            <button 
              onClick={() => setQuery('')}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isVoiceActive ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestions & Natural Language Prompts when Query is Empty */}
        {!query.trim() && (
          <div className="space-y-4 pt-2">
            {recentSearches.length > 0 && (
              <div>
                <h4 className="text-[10px] font-mono font-black uppercase text-slate-400 mb-2">Recent Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[10px] font-mono font-black uppercase text-slate-400 mb-2">Popular Natural Queries</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Attractions near Darjeeling',
                  'Waterfalls near Takdah',
                  'Pet Friendly Homestays near Lava',
                  'Taxi from NJP to Gangtok',
                  'Quiet Offbeat Villages',
                  'Heritage Cafes in Kalimpong'
                ].map((idea) => (
                  <button
                    key={idea}
                    onClick={() => setQuery(idea)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800/80 text-left text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-between"
                  >
                    <span>{idea}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Container */}
      {query.trim() && (
        <div className="mt-8 space-y-8">
          {/* Intelligent Disambiguation Panel (shown when multiple entity matches exist) */}
          {disambiguationResolution && disambiguationResolution.isAmbiguous && (
            <IntelligentSearchDisambiguationPanel
              resolution={disambiguationResolution}
              onSelectOption={(option) => {
                saveRecent(option.title);
                navigate(option.targetUrl);
              }}
            />
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-black uppercase tracking-wider text-slate-400">
              Live Search Results {totalResultsCount > 0 && `(${totalResultsCount})`}
            </h2>
            {totalResultsCount > 0 && (
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Max 3 preview cards per group
              </span>
            )}
          </div>

          {searchGroups.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <Compass className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <p className="text-sm font-bold text-slate-200">No results found for "{query}"</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for locations like "Darjeeling", "Kalimpong", or terms like "Waterfall", "Pet Friendly", or "Taxi".
              </p>
            </div>
          ) : (
            searchGroups.map((group) => (
              <div key={group.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                {/* Group Title Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-mono font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <span>{group.icon}</span>
                    <span>{group.title} ({group.totalCount})</span>
                  </h3>

                  {/* View All Button */}
                  <button
                    onClick={() => handleViewAllClick(group)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                  >
                    <span>View All ({group.totalCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Group Preview Grid (3 cards max) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {group.previewItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between transition duration-200 cursor-pointer group hover:shadow-xl"
                    >
                      <div className="space-y-2.5">
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-900">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png';
                            }}
                          />
                          {item.featured && (
                            <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[9px] font-mono font-black px-2 py-0.5 rounded-full">
                              FEATURED
                            </span>
                          )}
                          {item.rating && (
                            <span className="absolute bottom-2 right-2 bg-slate-950/80 text-amber-300 text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-xs">
                              <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {item.rating}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase block line-clamp-1">
                            {item.location}
                          </span>
                          <h4 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-850 flex items-center justify-between text-xs">
                        {item.price ? (
                          <span className="font-bold text-emerald-400 font-mono">
                            ₹{item.price} <span className="text-[9px] text-slate-400">/{item.priceType || 'unit'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Explore Details</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom View All Button if count > 3 */}
                {group.totalCount > 3 && (
                  <button
                    onClick={() => handleViewAllClick(group)}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Explore all {group.totalCount} {group.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
