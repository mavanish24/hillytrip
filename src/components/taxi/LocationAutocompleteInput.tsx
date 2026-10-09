import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Compass, Car, Check, X, Building, Search } from 'lucide-react';
import { Hub, Destination } from '../../types';
import { TAXI_STANDS } from '../../data/taxiData';

export interface LocationSuggestion {
  id: string;
  name: string;
  type: 'hub' | 'destination' | 'stand' | 'popular';
  subText?: string;
  badgeText?: string;
}

const POPULAR_HUBS_AND_TOWNS: LocationSuggestion[] = [
  { id: 'njp-railway', name: 'NJP Railway Station', type: 'popular', badgeText: 'Rail Hub', subText: 'Siliguri, Jalpaiguri' },
  { id: 'bagdogra-airport', name: 'Bagdogra Airport (IXB)', type: 'popular', badgeText: 'Airport', subText: 'Siliguri, West Bengal' },
  { id: 'gangtok-main', name: 'Gangtok', type: 'popular', badgeText: 'Capital Hub', subText: 'East Sikkim' },
  { id: 'darjeeling-town', name: 'Darjeeling', type: 'popular', badgeText: 'Hill Station', subText: 'West Bengal' },
  { id: 'kalimpong-town', name: 'Kalimpong', type: 'popular', badgeText: 'District Hub', subText: 'West Bengal' },
  { id: 'siliguri-junction', name: 'Siliguri Junction', type: 'popular', badgeText: 'Transit Hub', subText: 'West Bengal' },
  { id: 'pelling-town', name: 'Pelling', type: 'popular', badgeText: 'Tourist Destination', subText: 'West Sikkim' },
  { id: 'namchi-town', name: 'Namchi', type: 'popular', badgeText: 'District Hub', subText: 'South Sikkim' },
  { id: 'ravangla-town', name: 'Ravangla', type: 'popular', badgeText: 'Tourist Destination', subText: 'South Sikkim' },
  { id: 'lachen-village', name: 'Lachen', type: 'popular', badgeText: 'North Sikkim Base', subText: 'North Sikkim' },
  { id: 'lachung-village', name: 'Lachung', type: 'popular', badgeText: 'North Sikkim Base', subText: 'North Sikkim' },
  { id: 'zuluk-silkroute', name: 'Zuluk', type: 'popular', badgeText: 'Silk Route', subText: 'East Sikkim' },
  { id: 'yuksom-heritage', name: 'Yuksom', type: 'popular', badgeText: 'Historic Hub', subText: 'West Sikkim' },
  { id: 'mirik-lake', name: 'Mirik', type: 'popular', badgeText: 'Lake Destination', subText: 'Darjeeling District' },
  { id: 'jorethang-stand', name: 'Jorethang', type: 'popular', badgeText: 'Border Transit', subText: 'South Sikkim' }
];

interface LocationAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  hubs?: Hub[];
  destinations?: Destination[];
  focusColorClass?: string;
  className?: string;
}

export default function LocationAutocompleteInput({
  value,
  onChange,
  placeholder = 'Type location, hub, or taxi stand...',
  label,
  required = false,
  hubs = [],
  destinations = [],
  focusColorClass = 'focus:ring-emerald-500',
  className = ''
}: LocationAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine all sources into a normalized master suggestion list
  const masterList: LocationSuggestion[] = React.useMemo(() => {
    const list: LocationSuggestion[] = [...POPULAR_HUBS_AND_TOWNS];
    const seenNames = new Set(list.map(i => i.name.toLowerCase()));

    // 1. Add dynamic hubs
    hubs.forEach((h) => {
      if (!seenNames.has(h.name.toLowerCase())) {
        seenNames.add(h.name.toLowerCase());
        list.push({
          id: `hub-${h.id}`,
          name: h.name,
          type: 'hub',
          badgeText: h.type === 'main_hub' ? 'Main Hub' : (h.type === 'sightseeing_hub' ? 'Sightseeing Hub' : 'Sub-Hub'),
          subText: [h.district, h.state].filter(Boolean).join(', ')
        });
      }
    });

    // 2. Add destinations
    destinations.forEach((d) => {
      if (!seenNames.has(d.name.toLowerCase())) {
        seenNames.add(d.name.toLowerCase());
        list.push({
          id: `dest-${d.id}`,
          name: d.name,
          type: 'destination',
          badgeText: d.tourismType || 'Destination',
          subText: 'Key Scenic Destination'
        });
      }
    });

    // 3. Add Taxi Stands
    TAXI_STANDS.forEach((standObj, idx) => {
      const standName = typeof standObj === 'string' ? standObj : standObj.name;
      if (!seenNames.has(standName.toLowerCase())) {
        seenNames.add(standName.toLowerCase());
        list.push({
          id: `stand-${idx}`,
          name: standName,
          type: 'stand',
          badgeText: 'Taxi Stand',
          subText: 'Verified Regional Taxi Union Stand'
        });
      }
    });

    return list;
  }, [hubs, destinations]);

  // Filter list based on current user query
  const filteredSuggestions = React.useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) {
      // Return top 8 popular recommendations when field is blank
      return masterList.slice(0, 8);
    }
    return masterList
      .filter(item => 
        item.name.toLowerCase().includes(q) ||
        (item.subText && item.subText.toLowerCase().includes(q)) ||
        (item.badgeText && item.badgeText.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [value, masterList]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        selectSuggestion(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const selectSuggestion = (item: LocationSuggestion) => {
    onChange(item.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const renderIcon = (type: LocationSuggestion['type']) => {
    switch (type) {
      case 'hub':
        return <Navigation className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'stand':
        return <Car className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'destination':
        return <Compass className="w-4 h-4 text-sky-500 shrink-0" />;
      default:
        return <MapPin className="w-4 h-4 text-teal-500 shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white ${focusColorClass} focus:outline-none transition-all shadow-xs`}
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* AUTOCOMPLETE DROPDOWN */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3">
            <span>{value ? 'Matching Hubs & Places' : 'Popular Transit Hubs & Stands'}</span>
            <span>{filteredSuggestions.length} found</span>
          </div>

          <div className="py-1">
            {filteredSuggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              const isExactMatch = value.trim().toLowerCase() === item.name.toLowerCase();

              return (
                <div
                  key={item.id}
                  onClick={() => selectSuggestion(item)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isHighlighted 
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 shrink-0">
                      {renderIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {isExactMatch && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </div>
                      {item.subText && (
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {item.subText}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.badgeText && (
                    <span className="shrink-0 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 uppercase">
                      {item.badgeText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
