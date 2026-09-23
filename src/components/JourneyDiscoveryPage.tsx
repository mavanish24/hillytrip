// src/components/JourneyDiscoveryPage.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, Compass, MapPin, ArrowRight, Sparkles, Star, 
  Clock, Flame, Calendar, Leaf, Droplets, Snowflake, 
  Heart, Users, Camera, Shield, Mountain, Navigation, X, Check,
  ChevronLeft, ChevronRight, SlidersHorizontal, Map as MapIcon,
  Coffee, Trees, Award
} from 'lucide-react';
import { Route, Hub, Destination, Attraction } from '../types';
import { saveRecentRouteSearch } from '../utils/recentSearches';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CuratedJourney, 
  FEATURED_CIRCUITS, 
  POPULAR_JOURNEYS, 
  ALL_CURATED_JOURNEYS,
  CATEGORY_ITEMS, 
  SEASONAL_ITEMS, 
  JOURNEY_COLLECTIONS, 
  POPULAR_DESTINATIONS 
} from '../data/journeysData';

interface JourneyDiscoveryPageProps {
  routes?: Route[];
  hubs?: Hub[];
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: any[];
  setNotification?: any;
  navigate: (path: string) => void;
  themeMode?: 'light' | 'dark';
}

export default function JourneyDiscoveryPage({
  destinations = [],
  attractions = [],
  homestays = [],
  navigate
}: JourneyDiscoveryPageProps) {

  // Search & Filter state
  const [searchQueryText, setSearchQueryText] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [durationFilter, setDurationFilter] = useState<string>('All');
  const [styleFilter, setStyleFilter] = useState<string>('All');
  const [seasonFilter, setSeasonFilter] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSeason, setActiveSeason] = useState<string>('autumn');

  // AI Planner Modal State
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiDays, setAiDays] = useState<string>('2 Days');
  const [aiStyle, setAiStyle] = useState<string>('Scenic');
  const [recommendedJourney, setRecommendedJourney] = useState<CuratedJourney | null>(null);

  // Match journeys based on filters
  const matchesFilter = useCallback((j: CuratedJourney) => {
    // Text search query
    if (searchQueryText.trim()) {
      const q = searchQueryText.toLowerCase().trim();
      const matchName = j.name.toLowerCase().includes(q);
      const matchDesc = j.description.toLowerCase().includes(q);
      const matchTags = j.tags.some(t => t.toLowerCase().includes(q));
      const matchRegion = j.region.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchTags && !matchRegion) return false;
    }

    // Region
    if (regionFilter !== 'All') {
      if (regionFilter !== 'Both' && j.region !== regionFilter) {
        return false;
      }
    }

    // Duration
    if (durationFilter !== 'All') {
      if (j.durationCategory !== durationFilter && !j.duration.includes(durationFilter)) {
        return false;
      }
    }

    // Travel Style
    if (styleFilter !== 'All') {
      if (j.travelStyle !== styleFilter && !j.categories.includes(styleFilter.toLowerCase())) {
        return false;
      }
    }

    // Season
    if (seasonFilter !== 'All') {
      if (j.bestSeason !== seasonFilter) {
        return false;
      }
    }

    // Category
    if (activeCategory !== 'all') {
      const matchCat = j.categories.includes(activeCategory);
      const matchTag = j.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase()));
      if (!matchCat && !matchTag) return false;
    }

    return true;
  }, [searchQueryText, regionFilter, durationFilter, styleFilter, seasonFilter, activeCategory]);

  const filteredFeaturedCircuits = useMemo(() => {
    return FEATURED_CIRCUITS.filter(matchesFilter);
  }, [matchesFilter]);

  const filteredPopularJourneys = useMemo(() => {
    return POPULAR_JOURNEYS.filter(matchesFilter);
  }, [matchesFilter]);

  const allFilteredJourneys = useMemo(() => {
    return ALL_CURATED_JOURNEYS.filter(matchesFilter);
  }, [matchesFilter]);

  const handleOpenJourney = (j: CuratedJourney) => {
    saveRecentRouteSearch(
      j.fromHubId,
      j.toHubId,
      j.name.split('→')[0]?.trim() || j.name,
      j.name.split('→')[1]?.trim() || j.name
    );
    navigate(`#/journeys/${j.slug}`);
  };

  const resetFilters = () => {
    setSearchQueryText('');
    setRegionFilter('All');
    setDurationFilter('All');
    setStyleFilter('All');
    setSeasonFilter('All');
    setActiveCategory('all');
  };

  const handleRunAiPlanner = () => {
    const matched = ALL_CURATED_JOURNEYS.find(j => 
      j.durationCategory === aiDays || j.travelStyle === aiStyle
    ) || ALL_CURATED_JOURNEYS[0];
    setRecommendedJourney(matched);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-24">
      
      {/* ========================================================
          1. HERO SECTION (DISCOVERY BANNERS)
          ======================================================== */}
      <section className="relative bg-slate-950 text-white overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 border-b border-slate-800">
        
        {/* Full-width Himalayan Hero Banner */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png" 
            alt="Explore Himalayan Journeys" 
            className="w-full h-full object-cover object-center opacity-40 filter contrast-105 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/85 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Himalayan Travel Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Explore Himalayan Journeys
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
            Discover handpicked road trips, scenic drives, weekend escapes, and unforgettable Himalayan experiences across North Bengal & Sikkim.
          </p>

          {/* LARGE SEARCH BAR IN HERO */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input 
                type="text"
                value={searchQueryText}
                onChange={(e) => setSearchQueryText(e.target.value)}
                placeholder="Search destinations, journeys or experiences..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm font-semibold focus:outline-none"
              />
              {searchQueryText && (
                <button 
                  onClick={() => setSearchQueryText('')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button 
                type="button"
                onClick={() => {
                  const el = document.getElementById('discovery-catalog-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shrink-0 shadow-md"
              >
                Discover
              </button>
            </div>
          </div>

          {/* AI ASSISTANT BANNER STRIP */}
          <div className="pt-2">
            <button
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 hover:bg-amber-500/25 transition cursor-pointer text-xs font-extrabold"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Not sure where to go? Let AI recommend a Himalayan journey</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. STICKY QUICK FILTERS BAR
          ======================================================== */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE5D9] shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
            
            {/* Filter Groups */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Region Filter */}
              <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase px-1.5">Region:</span>
                {['All', 'North Bengal', 'Sikkim', 'Both'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegionFilter(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                      regionFilter === r ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Duration Filter */}
              <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-slate-200 overflow-x-auto">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase px-1.5">Duration:</span>
                {['All', 'Half Day', '1 Day', '2 Days', '3 Days', '4+ Days'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDurationFilter(d)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer shrink-0 ${
                      durationFilter === d ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Travel Style Filter */}
              <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-slate-200 overflow-x-auto">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase px-1.5">Style:</span>
                {['All', 'Scenic', 'Adventure', 'Family', 'Photography', 'Road Trip', 'Romantic'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStyleFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer shrink-0 ${
                      styleFilter === st ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Season Filter */}
              <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono font-black text-slate-500 uppercase px-1.5">Season:</span>
                {['All', 'Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter'].map((sn) => (
                  <button
                    key={sn}
                    onClick={() => setSeasonFilter(sn)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                      seasonFilter === sn ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sn}
                  </button>
                ))}
              </div>

            </div>

            {/* Clear Filters Button */}
            {(regionFilter !== 'All' || durationFilter !== 'All' || styleFilter !== 'All' || seasonFilter !== 'All' || searchQueryText !== '' || activeCategory !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 font-extrabold underline cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">

        {/* ========================================================
            3. EXPLORE BY JOURNEY TYPE (CATEGORY TABS)
            ======================================================== */}
        <section className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest block mb-1">
                Explore by Theme
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Explore by Journey Type
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {CATEGORY_ITEMS.length} Themes
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer shrink-0 border ${
                activeCategory === 'all'
                  ? 'bg-slate-950 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Journeys
            </button>
            {CATEGORY_ITEMS.map((cat) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer shrink-0 flex items-center gap-2 border ${
                    activeCategory === cat.id
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            4. FEATURED HIMALAYAN CIRCUITS & ROAD TRIPS
            ======================================================== */}
        <section className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                Multi-Day Circuits
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Featured Himalayan Circuits
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {filteredFeaturedCircuits.length} Handpicked Circuits
            </span>
          </div>

          {filteredFeaturedCircuits.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-200">
              No featured circuits match your current filter selection. Try adjusting filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeaturedCircuits.map((journey) => (
                <div
                  key={journey.id}
                  onClick={() => handleOpenJourney(journey)}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer hover:-translate-y-1 relative"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative h-52 bg-slate-950 overflow-hidden">
                      <img 
                        src={journey.image} 
                        alt={journey.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-slate-950" /> {journey.scenicRating} Rating
                        </span>
                        <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20">
                          {journey.duration}
                        </span>
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                          📍 {journey.region}
                        </span>
                        <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md truncate">
                          {journey.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-4">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {journey.description}
                      </p>

                      {/* Journey Stops */}
                      {journey.journeyStops && journey.journeyStops.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Key Circuit Stops:</span>
                          <div className="flex flex-wrap gap-1">
                            {journey.journeyStops.slice(0, 4).map((stop, idx) => (
                              <span key={idx} className="bg-[#FAF7F2] text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
                                {stop}
                              </span>
                            ))}
                            {journey.journeyStops.length > 4 && (
                              <span className="text-[10px] font-bold text-slate-400 px-1">
                                +{journey.journeyStops.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Stat Metrics */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Distance</span>
                          <span className="text-xs font-black text-slate-900">{journey.distance}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Drive Time</span>
                          <span className="text-xs font-black text-slate-900">{journey.estimatedTime}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Homestays</span>
                          <span className="text-xs font-black text-emerald-700">{journey.homestayCount} Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="px-5 pb-5 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenJourney(journey);
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Explore Journey</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================
            5. TRENDING POPULAR JOURNEYS
            ======================================================== */}
        <section className="space-y-6 text-left" id="discovery-catalog-grid">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-orange-700 uppercase tracking-widest block mb-1">
                Popular Drives
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Trending Himalayan Journeys
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">
              {filteredPopularJourneys.length} Journeys
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPopularJourneys.map((j) => (
              <div
                key={j.id}
                onClick={() => handleOpenJourney(j)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img 
                      src={j.image} 
                      alt={j.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {j.region}
                    </span>

                    <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {j.duration}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition">
                      {j.name}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {j.description}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {j.tags.map((tag, idx) => (
                        <span key={idx} className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] font-mono font-bold text-slate-500">
                    <span>{j.distance}</span> • <span>{j.estimatedTime}</span>
                  </div>
                  
                  <span className="text-xs font-black text-emerald-700 group-hover:translate-x-1 transition flex items-center gap-1">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            6. CURATED COLLECTIONS & POPULAR DESTINATIONS
            ======================================================== */}
        <section className="space-y-8 text-left">
          
          <div>
            <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-widest block mb-1">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Himalayan Travel Collections
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {JOURNEY_COLLECTIONS.map((col) => (
              <div
                key={col.id}
                onClick={() => {
                  const filterCat = (col as any).filterCategory || col.id;
                  setStyleFilter(filterCat === 'weekend' ? 'Scenic' : filterCat === 'family' ? 'Family' : filterCat === 'photography' ? 'Photography' : 'Scenic');
                  const el = document.getElementById('discovery-catalog-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4 group"
              >
                <img 
                  src={col.image} 
                  alt={col.title} 
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition" 
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider block">
                    {col.badge}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition">
                    {col.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {col.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* POPULAR DESTINATION CARDS */}
          <div className="pt-6 space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Popular Himalayan Destinations
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {POPULAR_DESTINATIONS.map((dest, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`#/destination/${dest.slug}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-2.5 text-center shadow-2xs hover:shadow-md transition cursor-pointer group space-y-2"
                >
                  <div className="h-16 w-full rounded-xl overflow-hidden bg-slate-100">
                    <img 
                      src={dest.image} 
                      alt={dest.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300" 
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                      {dest.name}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400 block truncate">
                      {dest.region}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* ========================================================
            7. SEASONAL JOURNEYS SECTION
            ======================================================== */}
        <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-2xl">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
              Best Time to Travel
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Seasonal Himalayan Journeys
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Every season reveals a completely different side of North Bengal and Sikkim.
            </p>
          </div>

          {/* Season Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 relative z-10">
            {SEASONAL_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSeason(item.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${
                  activeSeason === item.id 
                    ? 'bg-amber-500 text-slate-950 shadow-lg' 
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.seasonName}</span>
              </button>
            ))}
          </div>

          {/* Active Season Card Display */}
          {(() => {
            const activeData = SEASONAL_ITEMS.find(s => s.id === activeSeason) || SEASONAL_ITEMS[0];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-extrabold text-white">
                    {activeData.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeData.desc}
                  </p>
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                      Top Seasonal Highlights:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                      {((activeData as any).highlights || activeData.journeys.map((j: any) => j.badge)).map((h: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="h-56 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                  <img 
                    src={activeData.image} 
                    alt={activeData.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            );
          })()}

        </section>

      </div>

      {/* ========================================================
          AI TRAVEL PLANNER MODAL
          ======================================================== */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/15 text-amber-800 rounded-xl">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">AI Himalayan Journey Finder</h3>
                    <p className="text-xs text-slate-500">Get a personalized route recommendation in seconds</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    How many days do you have?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Half Day', '1 Day', '2 Days', '3 Days', '4+ Days'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setAiDays(d)}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold transition ${
                          aiDays === d 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    What is your travel style?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Scenic', 'Adventure', 'Family', 'Photography', 'Road Trip', 'Romantic'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setAiStyle(st)}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold transition ${
                          aiStyle === st 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunAiPlanner}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Match</span>
                </button>

                {recommendedJourney && (
                  <div className="bg-[#FAF7F2] border border-emerald-200 rounded-2xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Recommended Match
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{recommendedJourney.duration}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm">{recommendedJourney.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{recommendedJourney.description}</p>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAiModal(false);
                        handleOpenJourney(recommendedJourney);
                      }}
                      className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <span>Open Journey Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
