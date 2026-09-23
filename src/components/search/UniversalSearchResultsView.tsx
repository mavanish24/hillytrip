import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MapPin, Compass, Home, Car, Tag, Store, Camera, BookOpen,
  Sparkles, Star, ShieldCheck, Map, List, ChevronDown, Check, SlidersHorizontal,
  ArrowUpDown, ExternalLink, AlertCircle, RefreshCw, Layers, Calendar, Users, Wifi,
  Phone, Share2
} from 'lucide-react';
import {
  SearchEntityType,
  ScoredSearchResult,
  SearchFilterState,
  GroupedSearchResults
} from '../../types/search';
import UniversalSearchBar from './UniversalSearchBar';

export default function UniversalSearchResultsView() {
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    return params.get('q') || '';
  });

  const [activeTab, setActiveTab] = useState<SearchEntityType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GroupedSearchResults | null>(null);

  // Filters State
  const [filters, setFilters] = useState<SearchFilterState>({
    sortBy: 'relevance',
    isVerifiedOnly: false,
    isAvailableTodayOnly: false,
    maxDistanceKm: 25,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    district: '',
    category: ''
  });

  // Village filter state for intelligent village breakdown
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string | null>(null);

  // Listen to hash parameter & URL changes and normalize type parameter
  useEffect(() => {
    setSelectedVillageFilter(null);
    const handleHashChange = () => {
      const hashQueryStr = window.location.hash.split('?')[1] || '';
      const searchQueryStr = window.location.search.startsWith('?') ? window.location.search.substring(1) : window.location.search;
      const params = new URLSearchParams(hashQueryStr || searchQueryStr);
      const q = params.get('q') || '';
      const rawType = params.get('type') || params.get('types') || '';

      const typeMap: Record<string, SearchEntityType> = {
        'destinations': 'destination',
        'destination': 'destination',
        'attractions': 'attraction',
        'attraction': 'attraction',
        'homestays': 'homestay',
        'homestay': 'homestay',
        'taxi-operators': 'taxi_operator',
        'taxi_operator': 'taxi_operator',
        'taxi-stands': 'taxi_stand',
        'taxi_stand': 'taxi_stand',
        'routes': 'route',
        'route': 'route',
        'offers': 'offer',
        'offer': 'offer',
        'blogs': 'blog',
        'blog': 'blog'
      };

      setQuery(q);
      if (rawType && typeMap[rawType]) {
        setActiveTab(typeMap[rawType]);
      } else if (rawType === 'all') {
        setActiveTab('all');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Fetch search results whenever query, filters, or tab changes
  useEffect(() => {
    fetchSearchResults();
  }, [query, filters, activeTab]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (query) queryParams.set('q', query);

      if (activeTab !== 'all') {
        queryParams.set('types', activeTab);
      }

      if (filters.district) queryParams.set('district', filters.district);
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.minRating) queryParams.set('minRating', filters.minRating.toString());
      if (filters.maxDistanceKm) queryParams.set('maxDistanceKm', filters.maxDistanceKm.toString());
      if (filters.isVerifiedOnly) queryParams.set('verified', 'true');
      if (filters.isAvailableTodayOnly) queryParams.set('availableToday', 'true');
      if (filters.isSharedTaxi) queryParams.set('sharedTaxi', 'true');
      if (filters.isPrivateTaxi) queryParams.set('privateTaxi', 'true');
      if (filters.isFamilyFriendly) queryParams.set('familyFriendly', 'true');
      if (filters.isPetFriendly) queryParams.set('petFriendly', 'true');
      if (filters.hasParking) queryParams.set('parking', 'true');
      if (filters.hasBreakfast) queryParams.set('breakfast', 'true');
      if (filters.hasWifi) queryParams.set('wifi', 'true');
      if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);

      const res = await fetch(`/api/search?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setResults(data);
        setError(null);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (e: any) {
      console.error('Universal Search error:', e);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: SearchEntityType | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Results', icon: Layers },
    { id: 'destination', label: 'Destinations', icon: MapPin },
    { id: 'attraction', label: 'Attractions', icon: Compass },
    { id: 'homestay', label: 'Homestays', icon: Home },
    { id: 'taxi_stand', label: 'Taxis & Stands', icon: Car },
    { id: 'offer', label: 'Offers', icon: Tag },
    { id: 'business', label: 'Businesses', icon: Store },
    { id: 'blog', label: 'Blogs & Guides', icon: BookOpen },
    { id: 'moment', label: 'Moments', icon: Camera }
  ];

  const renderEntityIcon = (entityType: SearchEntityType) => {
    switch (entityType) {
      case 'destination': return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'attraction': return <Compass className="w-4 h-4 text-sky-600" />;
      case 'homestay': return <Home className="w-4 h-4 text-amber-600" />;
      case 'taxi_operator':
      case 'taxi_stand':
      case 'route': return <Car className="w-4 h-4 text-indigo-600" />;
      case 'offer': return <Tag className="w-4 h-4 text-rose-600" />;
      case 'business': return <Store className="w-4 h-4 text-purple-600" />;
      case 'moment': return <Camera className="w-4 h-4 text-pink-600" />;
      case 'blog': return <BookOpen className="w-4 h-4 text-blue-600" />;
      default: return <Search className="w-4 h-4 text-slate-500" />;
    }
  };

  const getEntityBadge = (entityType: SearchEntityType) => {
    const map: Record<SearchEntityType, { name: string; bg: string }> = {
      destination: { name: 'Destination', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
      attraction: { name: 'Attraction', bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
      homestay: { name: 'Homestay', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
      taxi_operator: { name: 'Taxi Operator', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
      taxi_stand: { name: 'Taxi Stand', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
      route: { name: 'Highway Route', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
      offer: { name: 'Special Offer', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
      business: { name: 'Local Business', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
      moment: { name: 'Traveler Moment', bg: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300' },
      blog: { name: 'Travel Guide', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' }
    };
    return map[entityType] || { name: 'Listing', bg: 'bg-slate-100 text-slate-800' };
  };

  const rawDisplayList: ScoredSearchResult[] = activeTab === 'all'
    ? (results?.all || [])
    : (results?.byEntity[activeTab] || []);

  const currentDisplayList = selectedVillageFilter
    ? rawDisplayList.filter(r => (
        (r.item.subtitle || '').toLowerCase().includes(selectedVillageFilter.toLowerCase()) ||
        (r.item.location?.address || '').toLowerCase().includes(selectedVillageFilter.toLowerCase()) ||
        (r.item.location?.district || '').toLowerCase().includes(selectedVillageFilter.toLowerCase()) ||
        r.item.title.toLowerCase().includes(selectedVillageFilter.toLowerCase())
      ))
    : rawDisplayList;

  return (
    <div id="universal-search-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      
      {/* HEADER BAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          
          {/* Search Box & Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-2/3">
              <UniversalSearchBar
                onSearchSubmit={q => {
                  setQuery(q);
                  window.location.hash = `#/search?q=${encodeURIComponent(q)}`;
                }}
                placeholder="Search across Gangtok, Homestays, Taxis, Permits, Attractions..."
              />
            </div>

            {/* View Mode & Filter Toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  filterDrawerOpen
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>

              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
                <button
                  onClick={() => setViewMode('list')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'map'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" /> Map
                </button>
              </div>
            </div>
          </div>

          {/* Module Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800 pt-3">
            {tabs.map(t => {
              const Icon = t.icon;
              const count = t.id === 'all'
                ? (results?.totalCount || 0)
                : (results?.entityCounts[t.id] || 0);

              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    activeTab === t.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === t.id ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 pt-6 flex flex-col md:flex-row gap-6">
        
        {/* FILTER DRAWER / SIDEBAR */}
        {filterDrawerOpen && (
          <div className="w-full md:w-72 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Filter className="w-4 h-4 text-emerald-600" /> Refine Search
              </h3>
              <button
                onClick={() => setFilters({
                  sortBy: 'relevance',
                  isVerifiedOnly: false,
                  isAvailableTodayOnly: false,
                  maxDistanceKm: 25
                })}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Sort Results By</label>
              <select
                value={filters.sortBy}
                onChange={e => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="relevance">Smart Relevance Score</option>
                <option value="rating">Highest Guest Rating</option>
                <option value="popularity">Most Popular First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="distance">Nearest Distance</option>
              </select>
            </div>

            {/* Verified & Available */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Trust & Status</label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isVerifiedOnly}
                  onChange={e => setFilters({ ...filters, isVerifiedOnly: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Listings Only
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isAvailableTodayOnly}
                  onChange={e => setFilters({ ...filters, isAvailableTodayOnly: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Calendar className="w-4 h-4 text-amber-600" /> Available Today
              </label>
            </div>

            {/* District Filter */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">District / Location</label>
              <select
                value={filters.district || ''}
                onChange={e => setFilters({ ...filters, district: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="">All Regions</option>
                <option value="East Sikkim">East Sikkim (Gangtok)</option>
                <option value="West Sikkim">West Sikkim (Pelling)</option>
                <option value="North Sikkim">North Sikkim (Lachung/Lachen)</option>
                <option value="South Sikkim">South Sikkim (Namchi)</option>
                <option value="Darjeeling">Darjeeling Hills</option>
                <option value="Kalimpong">Kalimpong</option>
              </select>
            </div>

            {/* Amenities for Homestay & Taxis */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Amenities & Taxi Specs</label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasWifi}
                  onChange={e => setFilters({ ...filters, hasWifi: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <Wifi className="w-3.5 h-3.5 text-blue-500" /> Free Wi-Fi
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isFamilyFriendly}
                  onChange={e => setFilters({ ...filters, isFamilyFriendly: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <Users className="w-3.5 h-3.5 text-amber-500" /> Family Friendly
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isSharedTaxi}
                  onChange={e => setFilters({ ...filters, isSharedTaxi: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <Car className="w-3.5 h-3.5 text-indigo-500" /> Shared Taxi Available
              </label>
            </div>
          </div>
        )}

        {/* RESULTS LIST / MAP VIEW */}
        <div className="flex-1 space-y-4">
          
          {/* Error Alert Banner */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300">
              <div className="flex items-center gap-3 text-xs font-bold">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchSearchResults}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* AI Travel Assistant Conversational Fact Banner */}
          {!loading && results?.factResponse && query.trim().length > 0 && (
            <div className="p-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl border border-emerald-500/30 shadow-lg space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                    HillyTrip AI Travel Assistant
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Factual DB Verification
                </span>
              </div>

              {/* Natural Language Response */}
              <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-100">
                "{results.factResponse.aiResponse}"
              </p>

              {/* Village Breakdown Interactive Chips */}
              {results.factResponse.facts.villages && results.factResponse.facts.villages.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                    <span>Explore Village-wise Breakdown:</span>
                    {selectedVillageFilter && (
                      <button
                        onClick={() => setSelectedVillageFilter(null)}
                        className="text-[11px] text-amber-300 hover:underline font-bold cursor-pointer"
                      >
                        Clear Village Filter (Show All {results.factResponse.facts.totalCount})
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
                    <button
                      onClick={() => setSelectedVillageFilter(null)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        !selectedVillageFilter
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      All Villages ({results.factResponse.facts.totalCount})
                    </button>
                    {results.factResponse.facts.villages.slice(0, 12).map(v => (
                      <button
                        key={v.villageName}
                        onClick={() => setSelectedVillageFilter(v.villageName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          selectedVillageFilter === v.villageName
                            ? 'bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>🏡 {v.villageName}</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-950/50 text-[10px]">
                          {v.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>
              Showing <strong className="text-slate-900 dark:text-slate-100">{currentDisplayList.length}</strong> results for{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">"{query || 'All Entities'}"</strong>
            </span>
            <span className="hidden sm:inline">Engine Speed: &lt;30ms</span>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse flex gap-4">
                  <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map View Mode Placeholder */}
          {!loading && viewMode === 'map' && (
            <div className="bg-slate-900 text-white rounded-2xl p-8 text-center space-y-4 border border-slate-800 shadow-xl">
              <Map className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold">Geospatial Interactive Map Engine</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All {currentDisplayList.length} matching destinations, homestays, and taxi stands mapped with live GPS coordinates across Sikkim and Darjeeling.
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {currentDisplayList.map(r => (
                  <span key={r.item.id} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-300">
                    📍 {r.item.title} ({r.distanceKm ? `${r.distanceKm} km` : 'Region'})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* List View Cards */}
          {!loading && viewMode === 'list' && currentDisplayList.length > 0 && (
            <div className="space-y-4">
              {currentDisplayList.map(r => {
                const badge = getEntityBadge(r.item.entityType);
                return (
                  <div
                    key={r.item.id}
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition flex flex-col sm:flex-row gap-5"
                  >
                    {/* Item Image */}
                    {r.item.imageUrl ? (
                      <img
                        src={r.item.imageUrl}
                        alt={r.item.title}
                        className="w-full sm:w-36 h-36 object-cover rounded-xl shrink-0 bg-slate-100"
                      />
                    ) : (
                      <div className="w-full sm:w-36 h-36 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 flex items-center justify-center">
                        {renderEntityIcon(r.item.entityType)}
                      </div>
                    )}

                    {/* Content Details */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${badge.bg}`}>
                            {badge.name}
                          </span>
                          {r.item.isVerified && (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          )}
                          {r.distanceKm !== undefined && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                              📍 {r.distanceKm} km away
                            </span>
                          )}
                        </div>

                        {/* Relevance Score Badge */}
                        <div className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          Match Score: {r.score} pts
                        </div>
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition">
                        <a href={r.item.canonicalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                          {r.item.title}
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                        </a>
                      </h3>

                      {r.item.subtitle && (
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {r.item.subtitle}
                        </p>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {r.item.description}
                      </p>

                      {/* Attribute Pills */}
                      <div className="flex items-center gap-3 pt-1 text-xs flex-wrap">
                        {r.item.rating && (
                          <div className="flex items-center gap-1 font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                            <Star className="w-3.5 h-3.5 fill-amber-500" /> {r.item.rating} ({r.item.reviewCount || 0})
                          </div>
                        )}
                        {r.item.price !== undefined && (
                          <div className="font-extrabold text-slate-900 dark:text-slate-100">
                            ₹{r.item.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{r.item.priceUnit || ''}</span>
                          </div>
                        )}
                        {r.item.location?.district && (
                          <div className="text-slate-500 text-[11px] font-semibold">
                            📍 {r.item.location.district}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Zero Results & Fallback Experience */}
          {!loading && currentDisplayList.length === 0 && (
            <div className="space-y-6">
              <div className="p-8 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  No Direct Matches Found for "{query}"
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  We couldn't find an exact match for your phrase with current filters. Here are popular Himalayan destinations, verified stays, and top routes you might like:
                </p>
                <button
                  onClick={() => {
                    setQuery('');
                    setFilters({ sortBy: 'relevance' });
                    setActiveTab('all');
                  }}
                  className="py-2.5 px-5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition shadow-md"
                >
                  Clear All Filters &amp; Show Everything
                </button>
              </div>

              {results?.fallbackSuggestions && results.fallbackSuggestions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Recommended Himalayan Alternatives</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {results.fallbackSuggestions.map((item: any) => (
                      <a
                        key={item.id}
                        href={item.canonicalUrl}
                        className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shadow-sm space-y-2 group block"
                      >
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-28 object-cover rounded-xl" />
                        )}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{item.subtitle || item.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
