import React, { useState, useEffect, useRef } from 'react';
import {
  Search, X, Sparkles, MapPin, Compass, Home, Car, Tag, Store, Camera, BookOpen,
  TrendingUp, Clock, ChevronRight, Filter, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { AutocompleteSuggestion, PopularSearch, SearchHistoryItem, SearchEntityType } from '../../types/search';

interface UniversalSearchBarProps {
  onSearchSubmit?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export default function UniversalSearchBar({
  onSearchSubmit,
  placeholder = "Search Destinations, Homestays, Taxis, Attractions...",
  autoFocus = false,
  className = ""
}: UniversalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch initial popular & recent searches
  useEffect(() => {
    fetchPopularAndRecent();
  }, []);

  // Fetch autocomplete on query change
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchAutocomplete(query);
    }, 80); // <100ms response

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPopularAndRecent = async () => {
    try {
      const [popRes, recRes] = await Promise.all([
        fetch('/api/search/popular'),
        fetch('/api/search/recent')
      ]);
      const popData = await popRes.json();
      const recData = await recRes.json();

      if (popData.success) setPopularSearches(popData.popular || []);
      if (recData.success) setRecentSearches(recData.recent || []);
    } catch (e) {
      console.warn('Failed to load popular/recent searches:', e);
    }
  };

  const fetchAutocomplete = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.warn('Autocomplete fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSubmitQuery(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSubmitQuery = (q: string) => {
    if (!q.trim()) return;
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(q);
    } else {
      window.location.hash = `#/search?q=${encodeURIComponent(q)}`;
    }
  };

  const handleSelectSuggestion = (s: AutocompleteSuggestion) => {
    setIsOpen(false);
    window.location.hash = `#/search?q=${encodeURIComponent(s.title)}&type=${s.entityType}`;
  };

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

  const renderEntityBadge = (entityType: SearchEntityType) => {
    const labels: Record<SearchEntityType, { name: string; bg: string; text: string; border: string }> = {
      destination: { name: 'Destination', bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-950 dark:text-emerald-200', border: 'border-emerald-300/80 dark:border-emerald-800' },
      attraction: { name: 'Attraction', bg: 'bg-sky-100 dark:bg-sky-950', text: 'text-sky-950 dark:text-sky-200', border: 'border-sky-300/80 dark:border-sky-800' },
      homestay: { name: 'Homestay', bg: 'bg-indigo-100 dark:bg-indigo-950', text: 'text-indigo-950 dark:text-indigo-200', border: 'border-indigo-300/80 dark:border-indigo-800' },
      taxi_operator: { name: 'Taxi Operator', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-950 dark:text-amber-200', border: 'border-amber-300/80 dark:border-amber-800' },
      taxi_stand: { name: 'Taxi Stand', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-950 dark:text-amber-200', border: 'border-amber-300/80 dark:border-amber-800' },
      route: { name: 'Transit Route', bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-950 dark:text-amber-200', border: 'border-amber-300/80 dark:border-amber-800' },
      offer: { name: 'Offer', bg: 'bg-rose-100 dark:bg-rose-950', text: 'text-rose-950 dark:text-rose-200', border: 'border-rose-300/80 dark:border-rose-800' },
      business: { name: 'Business', bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-950 dark:text-purple-200', border: 'border-purple-300/80 dark:border-purple-800' },
      moment: { name: 'Moment', bg: 'bg-pink-100 dark:bg-pink-950', text: 'text-pink-950 dark:text-pink-200', border: 'border-pink-300/80 dark:border-pink-800' },
      blog: { name: 'Guide', bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-950 dark:text-blue-200', border: 'border-blue-300/80 dark:border-blue-800' }
    };

    const b = labels[entityType] || { name: 'Entity', bg: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-300' };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${b.bg} ${b.text} ${b.border}`}>
        {b.name}
      </span>
    );
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
        <div className="pl-4 pr-2 text-slate-400">
          <Search className="w-5 h-5 text-emerald-600" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full py-3.5 pr-10 text-sm font-medium bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="pr-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg mr-2 hidden sm:flex">
            <Sparkles className="w-3 h-3 text-emerald-500" /> Universal
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Matching Suggestions ({suggestions.length})</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">⚡ Instant Match</span>
              </div>
              {suggestions.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSuggestion(s)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between gap-3 ${
                    selectedIndex === idx ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {renderEntityIcon(s.entityType)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                        {s.title}
                        {renderEntityBadge(s.entityType)}
                      </div>
                      {s.subtitle && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {s.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* If no query, show Recent and Popular Searches */}
          {!query.trim() && (
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Recent Searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleSubmitQuery(r.query)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                      >
                        {r.query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular & Trending Searches */}
              {popularSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-500" /> Popular in Sikkim & Darjeeling
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {popularSearches.slice(0, 6).map(p => (
                      <button
                        key={p.query}
                        onClick={() => handleSubmitQuery(p.query)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {p.query}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {p.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Call to Action */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded text-[10px] font-mono">Enter</kbd> to view all results</span>
            <button
              onClick={() => handleSubmitQuery(query || 'Sikkim')}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              Open Full Search <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
