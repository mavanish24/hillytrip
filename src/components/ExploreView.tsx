import React, { useState, useMemo, Suspense, useRef, useEffect } from 'react';
import { 
  Compass, MapPin, Search, Sparkles, Navigation, ArrowRight, ArrowUp, 
  Mountain, Trees, Waves, Coffee, Landmark, Eye, Car, Clock, ShieldCheck, 
  Check, X, Calendar, ChevronRight, Layers, ExternalLink, Binoculars, Footprints, Droplets
} from 'lucide-react';
import { Destination, Attraction, Homestay, Hub } from '../types';
import { LocationItem } from '../types/location';
import { FEATURED_CIRCUITS, CuratedJourney } from '../data/journeysData';
import { ATTRACTION_CATEGORIES_METADATA } from '../constants/attractionCategories';
import { executeUniversalHeroSearch, UniversalHeroResultItem, SearchDataSources } from '../lib/universalHeroSearchEngine';
import { DESTINATION_STORAGE_ASSETS, ATTRACTION_STORAGE_ASSETS, getOptimizedImageUrl } from '../utils/imagePool';
import safeLazy from '../utils/safeLazy';

// Lazy-load Leaflet map component with safe boundary (zero Google Maps calls)
const InteractiveLeafletMap = safeLazy(
  () => import('./location/InteractiveLeafletMap').then((m: any) => ({ default: m.InteractiveLeafletMap || m.default })),
  () => (
    <div className="h-80 w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-xs">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
        <span>Loading Regional Map...</span>
      </div>
    </div>
  )
);

interface ExploreViewProps {
  navigate: (path: string) => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  hubs?: Hub[];
  setAttractionFilter?: (val: string) => void;
}

export default function ExploreView({
  navigate,
  destinations = [],
  attractions = [],
  homestays = [],
  hubs = [],
  setAttractionFilter
}: ExploreViewProps) {
  // 1. Hero Search State & Dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 2. Journey Planner State (navigates to Taxi)
  const [fromLocation, setFromLocation] = useState('Siliguri / NJP');
  const [toLocation, setToLocation] = useState('Darjeeling');

  // 3. Modals for Detailed Preview (without recreating deleted Route pages)
  const [activeCircuitModal, setActiveCircuitModal] = useState<CuratedJourney | null>(null);
  const [activeGemModal, setActiveGemModal] = useState<Attraction | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<LocationItem | null>(null);

  // 4. Experience Active Selection
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Universal Search Sources (Real In-Memory Entities)
  const searchSources: SearchDataSources = useMemo(() => ({
    destinations,
    attractions,
    homestays,
    hubs
  }), [destinations, attractions, homestays, hubs]);

  // Live Search Groups via universalHeroSearchEngine
  const searchGroups = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return executeUniversalHeroSearch(searchQuery, searchSources);
  }, [searchQuery, searchSources]);

  // Handle Search Submission
  const handleHeroSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQ = searchQuery.trim();
    if (!cleanQ) return;
    setIsSearchDropdownOpen(false);

    // If top search group has an exact/first item, navigate directly to it
    if (searchGroups.length > 0 && searchGroups[0].previewItems.length > 0) {
      const topItem = searchGroups[0].previewItems[0];
      navigate(topItem.url);
      return;
    }

    // Default to search results page
    navigate(`#/search?q=${encodeURIComponent(cleanQ)}`);
  };

  // Suggestion chips under hero
  const suggestionChips = [
    { label: 'Hidden Gems', action: () => {
      const el = document.getElementById('hidden-gems');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }},
    { label: 'Waterfalls', action: () => {
      setAttractionFilter?.('Waterfalls');
      navigate('#/attractions?category=Waterfalls');
    }},
    { label: 'Tea Gardens', action: () => {
      setAttractionFilter?.('Tea Gardens');
      navigate(`#/attractions?category=${encodeURIComponent('Tea Gardens')}`);
    }},
    { label: 'Monasteries', action: () => {
      setAttractionFilter?.('Monasteries');
      navigate('#/attractions?category=Monasteries');
    }},
    { label: 'Viewpoints', action: () => {
      setAttractionFilter?.('Viewpoints & Scenic Points');
      navigate(`#/attractions?category=${encodeURIComponent('Viewpoints & Scenic Points')}`);
    }}
  ];

  // 1. POPULAR JOURNEYS: Real Curated Circuits from journeysData.ts
  const popularCircuits: CuratedJourney[] = useMemo(() => {
    return FEATURED_CIRCUITS;
  }, []);

  // 2. WEEKEND ESCAPES: Real Village records from destinations master
  const weekendEscapes: Destination[] = useMemo(() => {
    if (!destinations || destinations.length === 0) return [];

    const priorityNames = [
      'Darjeeling', 'Kalimpong', 'Kurseong', 'Mirik', 'Sittong', 
      'Tinchuley', 'Lava', 'Rishyap', 'Pedong', 'Takdah', 'Chatakpur', 'Lepchajagat', 'Pelling', 'Ravangla'
    ];

    const matched: Destination[] = [];
    const others: Destination[] = [];

    destinations.forEach(dest => {
      if (!dest || !dest.name) return;
      const isPriority = priorityNames.some(p => dest.name.toLowerCase().includes(p.toLowerCase()));
      if (isPriority) {
        matched.push(dest);
      } else if (dest.isPopularDestination || dest.isFeaturedThisWeek) {
        others.push(dest);
      }
    });

    const combined = [...matched, ...others];
    // Return unique villages by id or name
    const seen = new Set<string>();
    const unique: Destination[] = [];
    for (const v of combined) {
      const key = v.id || v.name;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(v);
      }
    }
    return unique.slice(0, 6);
  }, [destinations]);

  // 3. HIDDEN GEMS: Real Attraction records filtered by offbeat / hidden attributes
  const hiddenGems: Attraction[] = useMemo(() => {
    if (!attractions || attractions.length === 0) return [];

    const primaryGems = attractions.filter(a => {
      if (!a || !a.name) return false;
      if (a.isHiddenGem || (a as any).isOffbeat) return true;
      const tags = (a as any).tags || [];
      if (Array.isArray(tags) && tags.some((t: string) => typeof t === 'string' && (t.toLowerCase().includes('offbeat') || t.toLowerCase().includes('hidden')))) {
        return true;
      }
      const desc = (a.description || '').toLowerCase();
      if (desc.includes('offbeat') || desc.includes('hidden gem') || desc.includes('secluded') || desc.includes('pristine')) {
        return true;
      }
      return false;
    });

    // Fallback supplement if explicit hidden count is small
    const result = [...primaryGems];
    if (result.length < 6) {
      for (const a of attractions) {
        if (!result.includes(a) && (a.category === 'Forests & Nature' || a.category === 'Caves & Rock Formations' || a.category === 'Waterfalls')) {
          result.push(a);
          if (result.length >= 6) break;
        }
      }
    }

    return result.slice(0, 6);
  }, [attractions]);

  // 4. EXPLORE BY EXPERIENCE: Dynamic category counts from real attraction records
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (attractions || []).forEach(a => {
      if (a && a.category) {
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    });
    return counts;
  }, [attractions]);

  // Curated master categories for the experience grid
  const experienceCategories = useMemo(() => {
    const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; emoji: string; color: string; border: string }> = {
      'Viewpoints & Scenic Points': { icon: Eye, emoji: '🌅', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', border: 'hover:border-amber-400' },
      'Waterfalls': { icon: Droplets, emoji: '💧', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', border: 'hover:border-sky-400' },
      'Tea Gardens': { icon: Coffee, emoji: '🍃', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', border: 'hover:border-emerald-400' },
      'Monasteries': { icon: Landmark, emoji: '🛕', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', border: 'hover:border-purple-400' },
      'Forests & Nature': { icon: Trees, emoji: '🌲', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', border: 'hover:border-teal-400' },
      'Trekking & Hiking': { icon: Footprints, emoji: '🥾', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', border: 'hover:border-orange-400' },
      'Mountain & Peaks': { icon: Mountain, emoji: '🏔️', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', border: 'hover:border-indigo-400' },
      'Rivers & Lakes': { icon: Waves, emoji: '🌊', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', border: 'hover:border-cyan-400' },
    };

    return ATTRACTION_CATEGORIES_METADATA.slice(0, 8).map(catMeta => {
      const style = iconMap[catMeta.name] || {
        icon: Compass,
        emoji: '✨',
        color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        border: 'hover:border-slate-400'
      };
      const count = categoryCounts[catMeta.name] || 0;
      return {
        id: catMeta.slug,
        name: catMeta.name,
        label: catMeta.name,
        desc: catMeta.description,
        count: `${count} Places`,
        icon: style.icon,
        emoji: style.emoji,
        color: style.color,
        border: style.border,
        targetUrl: `#/attractions?category=${encodeURIComponent(catMeta.name)}`
      };
    });
  }, [categoryCounts]);

  // 5. EXPLORE ON MAP: Real LocationItems with verified coordinates
  const mapLocations: LocationItem[] = useMemo(() => {
    const locs: LocationItem[] = [];

    // Map top villages
    (destinations || []).forEach(d => {
      if (d && typeof d.latitude === 'number' && typeof d.longitude === 'number' && !isNaN(d.latitude) && !isNaN(d.longitude)) {
        locs.push({
          id: `dest-${d.id || d.village_code}`,
          entityId: d.id,
          entityType: 'destination',
          name: d.name,
          slug: d.slug || d.village_code || d.id,
          description: d.description || '',
          lat: d.latitude,
          lng: d.longitude,
          elevation: typeof d.elevation === 'number' ? d.elevation : undefined,
          country: 'India',
          state: d.state || 'West Bengal',
          district: d.district || '',
          accuracy: 'verified_gps',
          imageUrl: d.image || d.coverImage || DESTINATION_STORAGE_ASSETS.darjeelingHillsVillage,
          isHidden: false,
          createdAt: '',
          updatedAt: ''
        });
      }
    });

    // Map top attractions
    (attractions || []).forEach(a => {
      if (a && typeof a.latitude === 'number' && typeof a.longitude === 'number' && !isNaN(a.latitude) && !isNaN(a.longitude)) {
        locs.push({
          id: `attr-${a.id}`,
          entityId: a.id,
          entityType: 'attraction',
          name: a.name,
          slug: a.slug || a.id,
          description: a.description || '',
          lat: a.latitude,
          lng: a.longitude,
          country: 'India',
          state: a.state || 'Sikkim',
          district: a.district || '',
          accuracy: 'verified_gps',
          imageUrl: a.image || ATTRACTION_STORAGE_ASSETS.viewPoint || ATTRACTION_STORAGE_ASSETS.waterfall,
          isHidden: false,
          createdAt: '',
          updatedAt: ''
        });
      }
    });

    return locs.slice(0, 35);
  }, [destinations, attractions]);

  // Handle Plan Journey Form Navigation (Navigates cleanly to Taxi)
  const handlePlanJourneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocation.trim() || !toLocation.trim()) return;
    navigate(`#/taxi?from=${encodeURIComponent(fromLocation.trim())}&to=${encodeURIComponent(toLocation.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. HERO — "Explore HillyTrip"                                              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-b border-slate-800 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>HillyTrip Discovery Hub</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Explore HillyTrip
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover mountain villages, hidden gems, scenic escapes and unforgettable experiences.
          </p>

          {/* Live Hero Search Input Connected to universalHeroSearchEngine */}
          <div ref={searchContainerRef} className="max-w-xl mx-auto relative pt-2">
            <form onSubmit={handleHeroSearchSubmit} className="relative z-20">
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchDropdownOpen(true);
                  }}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  placeholder="Where do you want to explore?"
                  className="w-full bg-transparent px-3 py-3.5 sm:py-4 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchDropdownOpen(false);
                    }}
                    className="p-1.5 mr-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3.5 sm:py-4 transition shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Live Universal Search Dropdown */}
            {isSearchDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-left max-h-96 overflow-y-auto">
                {searchGroups.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching places found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchGroups.map((group) => (
                    <div key={group.entityTypeKey} className="border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                      <div className="bg-slate-50 dark:bg-slate-850 px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span>{group.icon}</span>
                          <span>{group.groupName}</span>
                        </span>
                        <span>{group.totalCount} found</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {group.previewItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setIsSearchDropdownOpen(false);
                              navigate(item.url);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 flex items-center justify-between transition cursor-pointer group"
                          >
                            <div className="pr-2">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                {item.name}
                              </div>
                              {item.subtitle && (
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Suggested:
              </span>
              {suggestionChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.action}
                  className="bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-700/80 transition cursor-pointer active:scale-95 shadow-xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

          </div>

        </div>

      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">

        {/* ========================================================================= */}
        {/* 2. PLAN YOUR JOURNEY (Integrated with Taxi View Navigation)               */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="max-w-3xl space-y-4">
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Car className="w-3.5 h-3.5" />
                <span>Mountain Transit Dispatch</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Plan Your Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Choose where you are starting from and where you want to go. Direct taxi routes with verified rates.
              </p>
            </div>

            <form onSubmit={handlePlanJourneySubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              
              {/* FROM Input */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  FROM
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500 transition">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="e.g. Siliguri / NJP, Bagdogra, Gangtok"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none"
                    required
                  />
                </div>
              </div>

              {/* TO Input */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  TO
                </label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-emerald-500 transition">
                  <Navigation className="w-4 h-4 text-sky-500 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    placeholder="e.g. Darjeeling, Kalimpong, Pelling, Lachen"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 dark:text-slate-100 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                >
                  <span>Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Transfers you directly to the HillyTrip Taxi module with instant fare estimates.</span>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. POPULAR JOURNEYS (Curated Circuits from journeysData.ts)                */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Expeditions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Popular Journeys
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Iconic multi-stop Himalayan circuits and scenic mountain traverses.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing {popularCircuits.length} editorial circuits
            </span>
          </div>

          {/* Responsive Horizontal Scroll Row on Mobile, Grid on Desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {popularCircuits.map((circuit) => (
              <div
                key={circuit.id}
                onClick={() => navigate(`#/explore/circuit/${circuit.slug || circuit.id}`)}
                className="w-72 sm:w-80 md:w-auto shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <img
                      src={getOptimizedImageUrl(circuit.image || DESTINATION_STORAGE_ASSETS.snowMountains, 600)}
                      alt={circuit.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-white/10">
                        {circuit.duration}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                        {circuit.region}
                      </span>
                      <h3 className="text-base font-black text-white leading-tight">
                        {circuit.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {circuit.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      {circuit.distance && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                          <Mountain className="w-3 h-3 text-emerald-500" />
                          <span>{circuit.distance}</span>
                        </span>
                      )}
                      {circuit.travelStyle && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                          <Calendar className="w-3 h-3 text-sky-500" />
                          <span>{circuit.travelStyle}</span>
                        </span>
                      )}
                    </div>

                    {/* Stops breakdown */}
                    {circuit.journeyStops && circuit.journeyStops.length > 0 && (
                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Key Stops
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {circuit.journeyStops.slice(0, 3).map((stop, i) => (
                            <span key={i} className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                              • {stop}
                            </span>
                          ))}
                          {circuit.journeyStops.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-mono self-center">
                              +{circuit.journeyStops.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`#/explore/circuit/${circuit.slug || circuit.id}`);
                    }}
                    className="w-full bg-slate-100 hover:bg-emerald-500 dark:bg-slate-800 dark:hover:bg-emerald-500 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Explore Circuit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. WEEKEND ESCAPES (Real Village Records from Master)                     */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Short Mountain Breaks</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Weekend Escapes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Quick 2–3 day hill retreats easily reachable from the plains and airports.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('#/villages')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View All Villages</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal scroll row on mobile, responsive 3-col on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {weekendEscapes.map((village) => (
              <div
                key={village.id || village.village_code}
                className="w-68 sm:w-72 md:w-auto shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden bg-slate-800">
                    <img
                      src={getOptimizedImageUrl(village.image || village.coverImage || DESTINATION_STORAGE_ASSETS.darjeelingHillsVillage, 600)}
                      alt={village.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-sky-500/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-xs">
                        {village.district || 'Himalayan Ridge'}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold block">
                        {village.state || 'Eastern Himalayas'}
                      </span>
                      <h3 className="text-base font-black text-white leading-tight">
                        {village.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2.5">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {village.description || 'Scenic mountain village in the Eastern Himalayas celebrated for organic nature and serene ridges.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-0 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFromLocation('Siliguri / NJP');
                      setToLocation(village.name);
                      navigate(`#/taxi?from=${encodeURIComponent('Siliguri / NJP')}&to=${encodeURIComponent(village.name)}`);
                    }}
                    className="w-full bg-slate-100 hover:bg-sky-500 dark:bg-slate-800 dark:hover:bg-sky-500 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Plan Trip ({village.name})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`#/village/${village.slug || village.village_code || village.id}`)}
                    className="w-full text-center text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    View Village Guide →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. HIDDEN GEMS (Real Attractions from Loaded Data)                         */}
        {/* ========================================================================= */}
        <section id="hidden-gems" className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Offbeat Discovery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Hidden Gems
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Places beyond the usual tourist trail.
            </p>
          </div>

          {/* Horizontal scroll discovery row on mobile, 3-col on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {hiddenGems.map((gem) => (
              <div
                key={gem.id}
                className="w-68 sm:w-72 md:w-auto shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                    <img
                      src={getOptimizedImageUrl(gem.image || ATTRACTION_STORAGE_ASSETS.waterfall, 600)}
                      alt={gem.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-2.5 left-2.5">
                      <span className="bg-purple-600/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        {gem.category || 'Sightseeing'}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                        {gem.village_name || gem.district || 'Himalayan Foothills'}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                        {gem.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {gem.description || 'Pristine mountain landmark offering untouched serenity and natural beauty.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    type="button"
                    onClick={() => setActiveGemModal(gem)}
                    className="w-full bg-slate-100 hover:bg-purple-600 dark:bg-slate-800 dark:hover:bg-purple-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Discover Gem</span>
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. EXPLORE BY EXPERIENCE (Dynamic Counts from Real Attraction Records)     */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Thematic Travel</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Explore by Experience
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Filter by the landscapes, trails, and cultural landmarks that inspire you.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {experienceCategories.map((cat) => {
              const isSelected = selectedExperience === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedExperience(null);
                    } else {
                      setSelectedExperience(cat.id);
                    }
                  }}
                  className={`p-4 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between h-36 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${cat.border} hover:shadow-sm`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl select-none">{cat.emoji}</span>
                    <div className={`p-1.5 rounded-lg ${cat.color}`}>
                      <cat.icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white font-mono uppercase tracking-wider line-clamp-1">
                      {cat.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {cat.desc}
                    </p>
                    <div className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {cat.count}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Experience Detail Banner if Selected */}
          {selectedExperience && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {experienceCategories.find(c => c.id === selectedExperience)?.emoji}
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono">
                    Selected Experience: {experienceCategories.find(c => c.id === selectedExperience)?.label}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {experienceCategories.find(c => c.id === selectedExperience)?.desc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const found = experienceCategories.find(c => c.id === selectedExperience);
                    if (found) {
                      setAttractionFilter?.(found.name);
                      navigate(found.targetUrl);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Browse Directory</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExperience(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 7. EXPLORE ON MAP (Interactive Leaflet Map with Real Pins)                 */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Regional Topography</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Explore on Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Explore mountain villages and iconic attractions across the Himalayas.
            </p>
          </div>

          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-lg space-y-4">
            
            {/* Top Bar Metadata */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1">
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5" /> Eastern Himalayas Active Pins ({mapLocations.length})
              </span>
              <span className="text-[10px] bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                Interactive Map
              </span>
            </div>

            {/* Map Container */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 h-80 sm:h-96 relative">
              <Suspense fallback={
                <div className="h-full w-full bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
                  Loading Interactive Map...
                </div>
              }>
                <InteractiveLeafletMap
                  locations={mapLocations}
                  selectedLocation={selectedMapLocation}
                  onSelectLocation={(loc) => setSelectedMapLocation(loc)}
                  height="100%"
                  className="w-full h-full"
                  center={{ lat: 27.2, lng: 88.4 }}
                  zoom={9}
                />
              </Suspense>
            </div>

            {/* Selected Location Bottom Inspection Card */}
            {selectedMapLocation ? (
              <div className="bg-slate-850/90 rounded-2xl border border-slate-700/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      {selectedMapLocation.entityType === 'destination' ? 'Mountain Village' : 'Attraction'} • {selectedMapLocation.district}
                    </span>
                    <h4 className="text-base font-black text-white">
                      {selectedMapLocation.name}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMapLocation.entityType === 'destination') {
                        navigate(`#/village/${selectedMapLocation.slug}`);
                      } else {
                        navigate(`#/attraction/${selectedMapLocation.slug}`);
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMapLocation(null)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
                <span>Click any pin on the map to inspect villages and sightseeing spots.</span>
                <span className="text-emerald-400 font-bold">Zero external API billing</span>
              </div>
            )}

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FINAL CTA                                                              */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 border border-slate-800 text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 to-transparent pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Begin Your Journey</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Your next mountain escape is waiting.
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Find cozy verified homestays, reserve hill cabs with upfront transparent fares, or discover high-altitude walking trails.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
              >
                <span>Start Exploring</span>
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('#/homestays')}
                className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Homestays</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: Circuit Preview Lightbox (Without Recreating Old Route Pages)       */}
      {/* ========================================================================= */}
      {activeCircuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="relative h-48 w-full bg-slate-800">
              <img
                src={getOptimizedImageUrl(activeCircuitModal.image || DESTINATION_STORAGE_ASSETS.snowMountains, 600)}
                alt={activeCircuitModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button
                type="button"
                onClick={() => setActiveCircuitModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  {activeCircuitModal.duration} • {activeCircuitModal.region}
                </span>
                <h3 className="text-xl font-black">
                  {activeCircuitModal.name}
                </h3>
              </div>
            </div>

            <div className="p-5 pt-0 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeCircuitModal.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">DISTANCE</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{activeCircuitModal.distance || 'Multi-day circuit'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DRIVE TIME</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{activeCircuitModal.estimatedTime || 'Scenic mountain drive'}</span>
                </div>
              </div>

              {activeCircuitModal.journeyStops && activeCircuitModal.journeyStops.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    CIRCUIT ROUTE & STOPS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCircuitModal.journeyStops.map((stop, i) => (
                      <span key={i} className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg font-medium">
                        {i + 1}. {stop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const start = activeCircuitModal.journeyStops?.[0] || 'Siliguri / NJP';
                    const end = activeCircuitModal.name;
                    setActiveCircuitModal(null);
                    setFromLocation(start);
                    setToLocation(end);
                    navigate(`#/taxi?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Car className="w-4 h-4" />
                  <span>Book Cab for Circuit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCircuitModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Hidden Gem Preview Lightbox                                        */}
      {/* ========================================================================= */}
      {activeGemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="relative h-44 w-full bg-slate-800">
              <img
                src={getOptimizedImageUrl(activeGemModal.image || ATTRACTION_STORAGE_ASSETS.waterfall, 600)}
                alt={activeGemModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button
                type="button"
                onClick={() => setActiveGemModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                  {activeGemModal.category || 'Sightseeing'} • {activeGemModal.village_name || activeGemModal.district}
                </span>
                <h3 className="text-xl font-black">
                  {activeGemModal.name}
                </h3>
              </div>
            </div>

            <div className="p-5 pt-0 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeGemModal.description}
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const gem = activeGemModal;
                    setActiveGemModal(null);
                    navigate(`#/attraction/${gem.slug || gem.id}`);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Attraction Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGemModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
