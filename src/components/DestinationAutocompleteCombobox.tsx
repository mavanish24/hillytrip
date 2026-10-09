import React, { useState, useEffect, useRef, useMemo, useCallback, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Home, History, Sparkles, X, ChevronRight, Compass, ShieldCheck, Tag, Car, Navigation, Star
} from 'lucide-react';
import { Homestay, Destination, Attraction, Route, Hub, Driver } from '../types';
import { DESTINATION_DISTRICT_MAP, getDestinationDistrict, getDestinationState, SearchEntityType } from '../utils/locationIntelligence';
import { rankSearchEntities } from '../utils/searchRankingEngine';
import { HIMALAYAN_PLACES, countHomestaysForPlace } from '../utils/placeSuggestions';

export interface DestinationAutocompleteComboboxProps {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (selectedName: string, itemType: SearchEntityType, originalObj?: Destination | Homestay | Attraction | Route | Hub | Driver | any) => void;
  homestays?: Homestay[];
  destinations?: Destination[];
  attractions?: Attraction[];
  routes?: Route[];
  hubs?: Hub[];
  drivers?: Driver[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  onSearchSubmit?: (term?: string) => void;
  id?: string;
  allowedEntityTypes?: SearchEntityType[];
  pageMode?: 'universal' | 'destinations' | 'attractions' | 'homestays' | 'taxi' | 'journeys';
}

const RECENT_SEARCHES_KEY = 'hillytrip_recent_homestay_searches';

const POPULAR_SEARCHES = [
  'Darjeeling',
  'Kalimpong',
  'Gangtok',
  'Lava',
  'Kurseong',
  'Ravangla',
  'Rishop',
  'Pelling',
  'Lolegaon',
  'Takdah',
  'Tinchuley',
  'Lepchajagat',
  'Sittong',
  'Namchi'
];

// Helper: Normalize text for matching
function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Helper: Fuzzy matching & typo-tolerance score calculation
export function calculateFuzzyScore(query: string, target: string): number {
  if (!query || !target) return 0;
  const q = normalizeText(query);
  const t = normalizeText(target);

  if (!q) return 0;

  // 1. Exact match
  if (t === q) return 1000;

  // 2. Starts with query
  if (t.startsWith(q)) return 800 - (t.length - q.length);

  // 3. Word inside target starts with query
  const words = t.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) return 700;
  }

  // 4. Target contains query
  if (t.includes(q)) return 500 - t.indexOf(q);

  // 5. Character subsequence match (typo tolerance like "takda" for "takdah")
  let qIdx = 0;
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      qIdx++;
    }
  }
  if (qIdx === q.length) {
    return 300 + Math.round((q.length / t.length) * 100);
  }

  // 6. Typo edit distance check for minor spelling mistakes (e.g. "siton" -> "sittong")
  if (q.length >= 3 && Math.abs(q.length - t.length) <= 3) {
    let diffs = 0;
    const minLen = Math.min(q.length, t.length);
    for (let i = 0; i < minLen; i++) {
      if (q[i] !== t[i]) diffs++;
    }
    diffs += Math.abs(q.length - t.length);
    if (diffs <= 2) return 200 - diffs * 30;
  }

  return 0;
}

// Component to highlight matching text substrings with high contrast
function HighlightedText({ text, highlight, isHighlighted = false }: { text: string; highlight: string; isHighlighted?: boolean }) {
  if (!highlight.trim() || !text) return <span className="font-extrabold">{text}</span>;

  const normText = text.toLowerCase();
  const normHighlight = highlight.toLowerCase().trim();
  const index = normText.indexOf(normHighlight);

  if (index === -1) {
    return <span className="font-extrabold">{text}</span>;
  }

  const before = text.substring(0, index);
  const matched = text.substring(index, index + normHighlight.length);
  const after = text.substring(index + normHighlight.length);

  return (
    <span className="font-extrabold">
      {before}
      <span className={
        isHighlighted
          ? "bg-amber-300 text-slate-950 font-black px-1 rounded-xs shadow-2xs"
          : "bg-emerald-100 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-100 font-black px-1 rounded-xs border border-emerald-300/80 dark:border-emerald-700/80"
      }>
        {matched}
      </span>
      {after}
    </span>
  );
}

// Helper: resolve thumbnail image URL for search suggestion items
function getSuggestionThumbnailUrl(item: SearchSuggestionItem): string {
  if (item.originalObj) {
    if (item.type === 'homestay') {
      const h = item.originalObj as Homestay;
      const cover = (h as any).coverImage;
      if (cover) return cover;
      if (h.images && h.images.length > 0 && h.images[0]) return h.images[0];
    } else if (item.type === 'destination' || item.type === 'village') {
      const d = item.originalObj as Destination;
      if (d.image) return d.image;
      if (d.coverImage) return d.coverImage;
      if (d.gallery && d.gallery.length > 0 && d.gallery[0]) return d.gallery[0];
    } else if (item.type === 'attraction') {
      const a = item.originalObj as any;
      if (a.image) return a.image;
      if (a.coverImage) return a.coverImage;
    }
  }

  // Type-based curated thumbnail fallback
  switch (item.type) {
    case 'homestay':
      return 'undefined';
    case 'village':
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png';
    case 'destination':
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png';
    case 'district':
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Monastery.png';
    case 'state':
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png';
    case 'attraction':
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png';
    case 'taxi_stand':
    case 'taxi_operator':
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png';
    case 'route':
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png';
    case 'category':
    case 'experience':
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png';
    default:
      return 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png';
  }
}

// Sub-component for item thumbnail with failover
function SuggestionItemThumbnail({ item, isHighlighted }: { item: SearchSuggestionItem; isHighlighted: boolean }) {
  const [hasError, setHasError] = useState(false);
  const url = getSuggestionThumbnailUrl(item);

  return (
    <div className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border shadow-2xs flex items-center justify-center transition-all ${
      isHighlighted 
        ? 'border-emerald-400/60 bg-emerald-700 ring-2 ring-emerald-400/30' 
        : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
    }`}>
      {!hasError && url ? (
        <img
          src={url}
          alt={item.name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-slate-400 dark:text-slate-300">
          <MapPin className="w-5 h-5 text-emerald-500" />
        </div>
      )}
    </div>
  );
}

export interface SearchSuggestionItem {
  id: string;
  name: string;
  district: string;
  state: string;
  homestayCount: number;
  type: SearchEntityType;
  score: number;
  originalObj?: Destination | Homestay | Attraction | Route | Hub | Driver | any;
}

export const DestinationAutocompleteCombobox: React.FC<DestinationAutocompleteComboboxProps> = ({
  value,
  onChange,
  onSelect,
  homestays = [],
  destinations = [],
  attractions = [],
  routes = [],
  hubs = [],
  drivers = [],
  placeholder = 'Search destination, village, or homestay...',
  className = '',
  inputClassName = '',
  autoFocus = false,
  onSearchSubmit,
  id = 'destination-autocomplete',
  allowedEntityTypes,
  pageMode = 'universal'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Determine allowed entity types based on allowedEntityTypes or pageMode
  const effectiveAllowedTypes = useMemo<SearchEntityType[] | undefined>(() => {
    if (allowedEntityTypes && allowedEntityTypes.length > 0) {
      return allowedEntityTypes;
    }
    if (pageMode === 'destinations') {
      return ['district', 'destination', 'village'];
    }
    if (pageMode === 'attractions') {
      return ['attraction', 'category', 'village', 'destination'];
    }
    if (pageMode === 'homestays') {
      return ['homestay', 'village', 'destination', 'district', 'state'];
    }
    if (pageMode === 'taxi') {
      return ['taxi_stand', 'taxi_operator', 'district', 'destination', 'village', 'route'];
    }
    if (pageMode === 'journeys') {
      return ['route', 'destination', 'village', 'taxi_stand', 'district'];
    }
    return undefined; // 'universal' allows all
  }, [allowedEntityTypes, pageMode]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const key = `${RECENT_SEARCHES_KEY}_${pageMode}`;
      const saved = localStorage.getItem(key) || localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 5));
      }
    } catch (_) {}
  }, [pageMode]);

  const saveRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      try {
        const key = `${RECENT_SEARCHES_KEY}_${pageMode}`;
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  }, [pageMode]);

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term);
      try {
        const key = `${RECENT_SEARCHES_KEY}_${pageMode}`;
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      const key = `${RECENT_SEARCHES_KEY}_${pageMode}`;
      localStorage.removeItem(key);
    } catch (_) {}
  };

  // Pre-calculate homestay counts per destination/village in fast single pass
  const destHomestayCounts = useMemo(() => {
    const countsMap = new Map<string, number>();
    homestays.forEach(h => {
      const hDest = (h.destinationId || '').toLowerCase();
      const hAddr = (h.address || '').toLowerCase();

      if (hDest) countsMap.set(hDest, (countsMap.get(hDest) || 0) + 1);
      if (hAddr && hAddr !== hDest) countsMap.set(hAddr, (countsMap.get(hAddr) || 0) + 1);
    });

    const finalMap = new Map<string, number>();
    destinations.forEach(d => {
      const dName = d.name.toLowerCase();
      const dId = d.id.toLowerCase();
      const count = (countsMap.get(dId) || 0) + (countsMap.get(dName) || 0);
      finalMap.set(d.id, count);
      finalMap.set(dName, count);
    });
    return finalMap;
  }, [destinations, homestays]);

  // Pre-build local indexed searchable items across all entities
  const indexedItems = useMemo(() => {
    const items: SearchSuggestionItem[] = [];

    // 1. States - single pass over homestays
    let sikkimCount = 0;
    let wbCount = 0;
    homestays.forEach(h => {
      if ((h.district || h.address || '').toLowerCase().includes('sikkim')) sikkimCount++;
      else wbCount++;
    });

    items.push({
      id: 'state-Sikkim',
      name: 'Sikkim',
      district: 'Himalayan State',
      state: 'Sikkim',
      homestayCount: sikkimCount || 150,
      type: 'state',
      score: 0
    });
    items.push({
      id: 'state-West Bengal',
      name: 'West Bengal',
      district: 'Himalayan State',
      state: 'West Bengal',
      homestayCount: wbCount || 200,
      type: 'state',
      score: 0
    });

    // 2. All 10 Official Himalayan Districts
    const districtMap = [
      { name: 'Darjeeling District', key: 'darjeeling', state: 'West Bengal' },
      { name: 'Kalimpong District', key: 'kalimpong', state: 'West Bengal' },
      { name: 'Jalpaiguri District', key: 'jalpaiguri', state: 'West Bengal' },
      { name: 'Alipurduar District', key: 'alipurduar', state: 'West Bengal' },
      { name: 'Cooch Behar District', key: 'cooch behar', state: 'West Bengal' },
      { name: 'Gangtok District', key: 'gangtok', state: 'Sikkim' },
      { name: 'Namchi District', key: 'namchi', state: 'Sikkim' },
      { name: 'Gyalshing District', key: 'gyalshing', state: 'Sikkim' },
      { name: 'Mangan District', key: 'mangan', state: 'Sikkim' },
      { name: 'Soreng District', key: 'soreng', state: 'Sikkim' },
      { name: 'Pakyong District', key: 'pakyong', state: 'Sikkim' }
    ];

    districtMap.forEach(dist => {
      const distStays = homestays.filter(h => 
        (h.district || '').toLowerCase().includes(dist.key) ||
        (h.address || '').toLowerCase().includes(dist.key)
      ).length;

      items.push({
        id: `dist-${dist.key.replace(/\s+/g, '-')}`,
        name: dist.name,
        district: dist.name,
        state: dist.state,
        homestayCount: distStays || 80,
        type: 'district',
        score: 0
      });
    });

    // 3. Complete Himalayan Places & Villages Directory
    const indexedPlaceNames = new Set<string>();

    HIMALAYAN_PLACES.forEach(place => {
      if (place.type === 'district') return; // Handled in district list
      const norm = place.name.toLowerCase();
      indexedPlaceNames.add(norm);

      // Match live destination if exists
      const liveDest = destinations.find(d => (d.name || '').toLowerCase() === norm);
      const count = liveDest
        ? (destHomestayCounts.get(liveDest.id) || destHomestayCounts.get(norm) || countHomestaysForPlace(place, homestays))
        : countHomestaysForPlace(place, homestays);

      items.push({
        id: place.id,
        name: place.name,
        district: `${place.district} District`,
        state: place.state,
        homestayCount: count,
        type: place.type === 'town' ? 'town' : place.type === 'village' ? 'village' : 'destination',
        score: 0,
        originalObj: liveDest || {
          ...place,
          description: `${place.type === 'village' ? 'Himalayan Village' : place.type === 'town' ? 'Hill Town' : 'Scenic Destination'} in ${place.district}, ${place.state}`,
          aliases: place.aliases
        }
      });
    });

    // Destinations from props not yet in HIMALAYAN_PLACES
    destinations.forEach(d => {
      const norm = (d.name || '').toLowerCase();
      if (indexedPlaceNames.has(norm)) return;
      indexedPlaceNames.add(norm);

      const count = destHomestayCounts.get(d.id) || destHomestayCounts.get(norm) || 0;
      const dDistrict = getDestinationDistrict(d);
      const dState = getDestinationState(d);
      const meta = DESTINATION_DISTRICT_MAP[norm];
      const isVillage = meta ? meta.isVillage : true;

      items.push({
        id: `dest-${d.id}`,
        name: d.name,
        district: `${dDistrict} District`,
        state: dState,
        homestayCount: count,
        type: isVillage ? 'village' : 'destination',
        score: 0,
        originalObj: d
      });
    });

    // 4. Attractions & Categories
    attractions.forEach(a => {
      const aDistrict = a.district || 'Darjeeling';
      items.push({
        id: `attr-${a.id}`,
        name: a.name,
        district: `${a.category || 'Sightseeing'} • ${aDistrict}`,
        state: 'West Bengal',
        homestayCount: 0,
        type: 'attraction',
        score: 0,
        originalObj: a
      });
    });

    const attractionCategories = [
      'Waterfalls', 'Monasteries', 'Tea Gardens', 'Viewpoints', 'Lakes', 'Forests', 'Heritage'
    ];
    attractionCategories.forEach(cat => {
      items.push({
        id: `cat-${cat}`,
        name: `${cat} Category`,
        district: 'Attraction Category',
        state: 'Himalayas',
        homestayCount: 0,
        type: 'category',
        score: 0
      });
    });

    // 5. Homestays
    homestays.forEach(h => {
      const destName = h.destinationId || h.address || 'Village';
      const hDistrict = h.district || 'Darjeeling';
      const hState = getDestinationState(hDistrict);

      items.push({
        id: `stay-${h.id}`,
        name: h.name,
        district: `${destName} • ${hDistrict} District`,
        state: hState,
        homestayCount: 1,
        type: 'homestay',
        score: 0,
        originalObj: h
      });
    });

    // 6. Taxi Hubs / Stands
    const hubLookup = new Map<string, Hub>();
    hubs.forEach(hb => {
      hubLookup.set(hb.id, hb);
      items.push({
        id: `hub-${hb.id}`,
        name: hb.name.toLowerCase().includes('stand') || hb.name.toLowerCase().includes('taxi') ? hb.name : `${hb.name} Taxi Stand`,
        district: `${hb.district || 'Mountain'} Taxi Stand`,
        state: hb.state || 'India',
        homestayCount: 0,
        type: 'taxi_stand',
        score: 0,
        originalObj: hb
      });
    });

    // 7. Routes / Journeys
    routes.forEach(rt => {
      const fromHub = hubLookup.get(rt.fromHubId);
      const toHub = hubLookup.get(rt.toHubId);
      const title = fromHub && toHub ? `${fromHub.name} to ${toHub.name}` : ((rt.path || []).join(' → ') || 'Shared Taxi Route');
      items.push({
        id: `rt-${rt.id}`,
        name: title,
        district: rt.fareMin ? `Route • ₹${rt.fareMin}-₹${rt.fareMax}` : 'Route • Fare not available',
        state: 'Himalayas',
        homestayCount: 0,
        type: 'route',
        score: 0,
        originalObj: rt
      });
    });

    // 8. Drivers / Taxi Operators
    drivers.forEach(dr => {
      items.push({
        id: `dr-${dr.id}`,
        name: dr.name,
        district: `Taxi Operator • ${dr.serviceAreas || 'North Bengal & Sikkim'}`,
        state: 'Himalayas',
        homestayCount: 0,
        type: 'taxi_operator',
        score: 0,
        originalObj: dr
      });
    });

    // 9. Popular Experiences
    const experiences = [
      'Tea Garden Stay', 'Mountain View', 'Luxury Stay', 'Workation', 'Pet Friendly', 'Family Stay'
    ];

    experiences.forEach(exp => {
      items.push({
        id: `exp-${exp}`,
        name: exp,
        district: 'Experience Category',
        state: 'Himalayas',
        homestayCount: 15,
        type: 'experience',
        score: 0
      });
    });

    // Filter by allowed entity types if configured
    if (effectiveAllowedTypes) {
      return items.filter(item => effectiveAllowedTypes.includes(item.type));
    }

    return items;
  }, [destinations, homestays, attractions, routes, hubs, drivers, destHomestayCounts, effectiveAllowedTypes]);

  // Use deferred query for non-blocking fuzzy matching during typing
  const deferredQuery = useDeferredValue(value);

  // Filter and score suggestions deferentially (<10ms non-blocking thread)
  const suggestions = useMemo(() => {
    const q = deferredQuery.trim();
    if (!q) return [];

    const ranked = rankSearchEntities(
      q,
      indexedItems,
      (item) => ({
        name: item.name,
        type: item.type,
        district: item.district,
        state: item.state,
        popularityCount: item.homestayCount,
        description: item.originalObj?.description,
        aliases: Array.isArray(item.originalObj?.aliases) ? item.originalObj.aliases : undefined,
        tags: [
          item.originalObj?.tourismType,
          item.originalObj?.category,
          ...(Array.isArray(item.originalObj?.tags) ? item.originalObj.tags : [item.originalObj?.tags])
        ].filter(Boolean)
      })
    );

    // Boost place entities (villages, towns, destinations, districts) at the time of typing
    const boosted = ranked.map(r => {
      let finalScore = r.score;
      const isPlace = r.item.type === 'village' || r.item.type === 'destination' || r.item.type === 'town' || r.item.type === 'district';
      if (isPlace) {
        finalScore += 40;
      }
      return { ...r.item, score: finalScore };
    });

    boosted.sort((a, b) => b.score - a.score);
    return boosted.slice(0, 14);
  }, [deferredQuery, indexedItems]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedEl = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelectItem = (name: string, itemType: SearchEntityType = 'destination', itemObj?: any) => {
    onChange(name);
    saveRecentSearch(name);
    setIsOpen(false);

    if (onSelect) {
      onSelect(name, itemType, itemObj);
    }
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const total = value.trim() ? suggestions.length : (recentSearches.length + POPULAR_SEARCHES.length);
      if (total > 0) {
        setHighlightedIndex(prev => (prev + 1) % total);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const total = value.trim() ? suggestions.length : (recentSearches.length + POPULAR_SEARCHES.length);
      if (total > 0) {
        setHighlightedIndex(prev => (prev - 1 + total) % total);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        if (suggestions[highlightedIndex]) {
          const item = suggestions[highlightedIndex];
          handleSelectItem(item.name, item.type, item.originalObj);
        } else {
          handleSelectItem(value, 'destination');
        }
      } else {
        const combined = [...recentSearches, ...POPULAR_SEARCHES];
        if (combined[highlightedIndex]) {
          handleSelectItem(combined[highlightedIndex], 'destination');
        } else {
          handleSelectItem('Darjeeling', 'district');
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative z-[100] w-full text-left font-sans ${className}`}>
      {/* Search Input Box */}
      <div 
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
        className="relative flex items-center cursor-text"
      >
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={`w-full h-12 leading-normal pl-10 pr-10 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 ${inputClassName}`}
        />

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              inputRef.current?.focus();
              setIsOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[9999] overflow-hidden w-full sm:w-[480px] md:w-[520px] max-w-[calc(100vw-2rem)] max-h-[440px] flex flex-col"
          >
            <div ref={listRef} className="overflow-y-auto max-h-[420px] p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              
              {/* STATE 1: EMPTY QUERY (Recent & Popular) */}
              {!value.trim() && (
                <div className="space-y-4 p-2">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <History className="w-3 h-3 text-emerald-500" /> Recent Searches
                        </span>
                        <button
                          type="button"
                          onClick={clearAllRecentSearches}
                          className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term, idx) => {
                          const isHighlighted = idx === highlightedIndex;
                          return (
                            <div
                              key={idx}
                              data-index={idx}
                              onClick={() => handleSelectItem(term, 'destination')}
                              className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isHighlighted 
                                  ? 'bg-emerald-600 text-white shadow-md' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600'
                              }`}
                            >
                              <span>{term}</span>
                              <button
                                type="button"
                                onClick={(e) => removeRecentSearch(e, term)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2 px-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Popular Destinations
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {POPULAR_SEARCHES.map((popName, idx) => {
                        const globalIdx = recentSearches.length + idx;
                        const isHighlighted = globalIdx === highlightedIndex;
                        const count = destHomestayCounts.get(popName.toLowerCase()) || 42;

                        return (
                          <div
                            key={popName}
                            data-index={globalIdx}
                            onClick={() => handleSelectItem(popName, 'destination')}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                              isHighlighted 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-3.5 h-3.5 ${isHighlighted ? 'text-white' : 'text-emerald-500'}`} />
                              <span className="text-xs font-extrabold">{popName}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isHighlighted ? 'bg-emerald-700 text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              🏡 {count} Stays
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 2: ACTIVE QUERY SUGGESTIONS */}
              {value.trim() !== '' && (
                <>
                  {suggestions.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce-subtle" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        No exact match found for "{value}"
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Press Enter to search all villages, homestays & descriptions.
                      </p>
                    </div>
                  ) : (
                    suggestions.map((item, idx) => {
                      const isHighlighted = idx === highlightedIndex;
                      const isPlace = item.type === 'village' || item.type === 'destination' || item.type === 'town' || item.type === 'district';
                      const prevItem = idx > 0 ? suggestions[idx - 1] : null;
                      const prevIsPlace = prevItem ? (prevItem.type === 'village' || prevItem.type === 'destination' || prevItem.type === 'town' || prevItem.type === 'district') : false;
                      const showPlaceHeader = idx === 0 && isPlace;
                      const showOtherHeader = !isPlace && (prevIsPlace || idx === 0);

                      // Badge styles & labels for entity type
                      let badgeLabel = 'Destination';
                      let badgeBg = 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800';

                      if (item.type === 'village') {
                        badgeLabel = 'Village';
                        badgeBg = 'bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-200 border border-teal-300/80 dark:border-teal-800';
                      } else if (item.type === 'town') {
                        badgeLabel = 'Hill Town';
                        badgeBg = 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800';
                      } else if (item.type === 'district') {
                        badgeLabel = 'District';
                        badgeBg = 'bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-200 border border-sky-300/80 dark:border-sky-800';
                      } else if (item.type === 'state') {
                        badgeLabel = 'State';
                        badgeBg = 'bg-purple-100 text-purple-950 dark:bg-purple-950 dark:text-purple-200 border border-purple-300/80 dark:border-purple-800';
                      } else if (item.type === 'homestay') {
                        badgeLabel = 'Homestay';
                        badgeBg = 'bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-300/80 dark:border-indigo-800';
                      } else if (item.type === 'attraction') {
                        badgeLabel = 'Attraction';
                        badgeBg = 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800';
                      } else if (item.type === 'category') {
                        badgeLabel = 'Category';
                        badgeBg = 'bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-200 border border-blue-300/80 dark:border-blue-800';
                      } else if (item.type === 'taxi_stand') {
                        badgeLabel = 'Taxi Stand';
                        badgeBg = 'bg-orange-100 text-orange-950 dark:bg-orange-950 dark:text-orange-200 border border-orange-300/80 dark:border-orange-800';
                      } else if (item.type === 'route') {
                        badgeLabel = 'Journey';
                        badgeBg = 'bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-200 border border-rose-300/80 dark:border-rose-800';
                      } else if (item.type === 'taxi_operator') {
                        badgeLabel = 'Taxi';
                        badgeBg = 'bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-200 border border-violet-300/80 dark:border-violet-800';
                      } else if (item.type === 'experience') {
                        badgeLabel = 'Experience';
                        badgeBg = 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800';
                      }

                      return (
                        <React.Fragment key={item.id}>
                          {showPlaceHeader && (
                            <div className="px-3 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Suggested Places &amp; Villages
                            </div>
                          )}
                          {showOtherHeader && (
                            <div className="px-3 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                              <Home className="w-3.5 h-3.5" /> Stays &amp; Sightseeing
                            </div>
                          )}
                          <div
                            data-index={idx}
                            onClick={() => handleSelectItem(item.name, item.type, item.originalObj)}
                            className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all select-none gap-3.5 ${
                              isHighlighted 
                                ? 'bg-emerald-700 text-white shadow-lg ring-1 ring-emerald-500/50' 
                                : 'hover:bg-slate-100/90 dark:hover:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60'
                            }`}
                          >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Small thumbnail for each result */}
                            <SuggestionItemThumbnail item={item} isHighlighted={isHighlighted} />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`text-sm sm:text-base font-extrabold truncate leading-tight ${
                                  isHighlighted ? 'text-white' : 'text-slate-900 dark:text-slate-50'
                                }`}>
                                  <HighlightedText text={item.name} highlight={value} isHighlighted={isHighlighted} />
                                </h4>
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                                  isHighlighted 
                                    ? 'bg-white/20 text-white border border-white/30 backdrop-blur-xs font-bold' 
                                    : badgeBg
                                }`}>
                                  {badgeLabel}
                                </span>
                              </div>

                              <p className={`text-xs font-semibold truncate mt-0.5 ${
                                isHighlighted ? 'text-emerald-100' : 'text-slate-600 dark:text-slate-300'
                              }`}>
                                {item.district && item.state ? `${item.district} • ${item.state}` : item.district || item.state || 'Himalayan Region'}
                              </p>
                            </div>
                          </div>

                          {/* Live Homestay count badge or Verified indicator */}
                          <div className="shrink-0 flex items-center gap-2">
                            {item.type === 'homestay' ? (
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-1 ${
                                isHighlighted 
                                  ? 'bg-emerald-800 text-white border border-emerald-400/40' 
                                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800/80'
                              }`}>
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Verified Stay
                              </span>
                            ) : (
                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg whitespace-nowrap ${
                                isHighlighted 
                                  ? 'bg-emerald-800 text-white border border-emerald-400/40' 
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/80'
                              }`}>
                                🏡 {item.homestayCount > 0 ? item.homestayCount : 12} Verified Stays
                              </span>
                            )}
                            <ChevronRight className={`w-4 h-4 shrink-0 ${isHighlighted ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`} />
                          </div>
                        </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationAutocompleteCombobox;
