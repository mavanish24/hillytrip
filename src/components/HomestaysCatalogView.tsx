import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  MapPin, Star, Heart, Sparkles, ChevronDown, AlertCircle,
  Search, X, SlidersHorizontal, Filter, Check, RotateCcw,
  Building2, ArrowUpDown, MessageSquare
} from 'lucide-react';
import { Homestay, Destination } from '../types';
import { getItemSlug } from '../utils/slug';
import { 
  OFFICIAL_DISTRICTS, 
  DISTRICT_CODE_MAP, 
  getHomestayDistrict, 
  getHomestayState, 
  DistrictInfo,
  matchHomestaySearch
} from '../utils/districtUtils';
import { suggestPlaces, SuggestedPlace } from '../utils/placeSuggestions';
import { motion, AnimatePresence } from 'motion/react';
import { isListingVerified, subscribeClaimSystem } from '../lib/claimSystem';
import { UnclaimedBadge, ClaimStrip } from './UnclaimedBadgeAndStrip';
import ClaimModal from './ClaimModal';
import { ProgressiveImage } from './ProgressiveImage';

interface HomestaysCatalogViewProps {
  homestays: Homestay[];
  destinations?: Destination[];
  navigate?: (path: string) => void;
  user?: any;
  setNotification?: (notif: { type: 'success' | 'info' | 'error' | 'warning'; message: string } | null) => void;
  executeProtectedAction?: any;
}

// Consistent seed-based rating and badge decoration for homestay cards
const getDecoratedHomestay = (h: Homestay, index: number) => {
  const codeSum = (h.id || h.name || 'stay').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
  
  const rating = h.rating && h.rating > 0 
    ? Number(h.rating.toFixed(1)) 
    : Number((4.3 + ((codeSum % 7) * 0.1)).toFixed(1));
    
  const reviewCount = h.reviewCount && h.reviewCount > 0 
    ? h.reviewCount 
    : 12 + (codeSum % 48);

  const isVerified = h.isVerified !== undefined ? h.isVerified : true;
  const isFeatured = h.isFeatured !== undefined ? h.isFeatured : (codeSum % 5 === 0);

  const tagline = h.tagline || (() => {
    const parts = [];
    if (h.amenities && h.amenities.some(a => a.toLowerCase().includes('mountain'))) {
      parts.push('Mountain View');
    } else if (h.amenities && h.amenities.some(a => a.toLowerCase().includes('tea'))) {
      parts.push('Tea Garden Stay');
    } else {
      parts.push('Scenic Village Stay');
    }
    parts.push('Breakfast Included');
    parts.push('Family Friendly');
    return parts.join(' • ');
  })();

  return {
    ...h,
    rating,
    reviewCount,
    isVerified,
    isFeatured,
    tagline
  };
};

// URL query parameter parser helper
const parseUrlFilterParams = (): { district: string; state: string; search: string } => {
  let district = 'All';
  let state = 'All';
  let search = '';
  try {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      let searchParams: URLSearchParams | null = null;
      if (hash.includes('?')) {
        searchParams = new URLSearchParams(hash.split('?')[1]);
      } else if (window.location.search) {
        searchParams = new URLSearchParams(window.location.search);
      }

      if (searchParams) {
        const d = searchParams.get('district');
        if (d && d.trim() !== '') {
          district = d.trim();
        }
        const st = searchParams.get('state');
        if (st && st.trim() !== '') {
          state = st.trim();
        }
        const q = searchParams.get('q') || searchParams.get('search');
        if (q && q.trim() !== '') {
          search = q.trim();
        }
      }
    }
  } catch {}
  return { district, state, search };
};

export const HomestaysCatalogView: React.FC<HomestaysCatalogViewProps> = ({
  homestays,
  destinations = [],
  navigate = (path: string) => { window.location.hash = path; },
  user,
  setNotification,
  executeProtectedAction
}) => {
  // Direct Data State (All Homestays)
  const [loadedHomestays, setLoadedHomestays] = useState<Homestay[]>(() => {
    if (Array.isArray(homestays) && homestays.length > 0) return homestays;
    try {
      const cached = typeof localStorage !== 'undefined' ? localStorage.getItem('hillytrip_cached_homestays') : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [totalCount, setTotalCount] = useState<number | null>(() => {
    try {
      const cached = typeof localStorage !== 'undefined' ? localStorage.getItem('hillytrip_cached_homestays') : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.length;
      }
    } catch {}
    return null;
  });
  const [isFetchingStays, setIsFetchingStays] = useState<boolean>(() => !(Array.isArray(homestays) && homestays.length > 0));
  const [isInitialLoadDone, setIsInitialLoadDone] = useState<boolean>(() => (Array.isArray(homestays) && homestays.length > 0));

  // Sync when prop updates
  useEffect(() => {
    if (Array.isArray(homestays) && homestays.length > 0) {
      setIsInitialLoadDone(true);
      setIsFetchingStays(false);
      setLoadedHomestays(prev => {
        if (prev.length === 0) return homestays;
        const existingIds = new Set(prev.map(h => h.id));
        const fresh = homestays.filter(h => h && h.id && !existingIds.has(h.id));
        return fresh.length > 0 ? [...prev, ...fresh] : (homestays.length > prev.length ? homestays : prev);
      });
      try {
        localStorage.setItem('hillytrip_cached_homestays', JSON.stringify(homestays));
      } catch {}
    }
  }, [homestays]);

  // Load complete homestays dataset directly
  const fetchAllStays = useCallback(async () => {
    setIsFetchingStays(true);

    const directFetch = (typeof window !== 'undefined' && ((window as any).__hillyTrip_realNativeFetch || (window as any).originalFetch)) || fetch;

    try {
      const [countRes, listRes] = await Promise.all([
        directFetch('/api/homestays/count').catch(() => null),
        directFetch('/api/homestays?limit=4000').catch(() => null)
      ]);

      let verifiedTotal = 0;
      if (countRes && countRes.ok) {
        const countData = await countRes.json();
        if (typeof countData?.count === 'number' && countData.count > 0) {
          verifiedTotal = countData.count;
          setTotalCount(countData.count);
        }
      }

      let gotStays = false;
      if (listRes && listRes.ok) {
        const freshHomes = await listRes.json();
        if (Array.isArray(freshHomes) && freshHomes.length > 0) {
          gotStays = true;
          setLoadedHomestays(freshHomes);
          setTotalCount(verifiedTotal || freshHomes.length);
          if (verifiedTotal > freshHomes.length) {
            setHasMore(true);
          }
          try {
            localStorage.setItem('hillytrip_cached_homestays', JSON.stringify(freshHomes));
          } catch {}
        }
      }

      // Fallback to /api/bootstrap if listRes didn't return items
      if (!gotStays) {
        const bRes = await directFetch('/api/bootstrap').catch(() => null);
        if (bRes && bRes.ok) {
          const bData = await bRes.json();
          if (bData && Array.isArray(bData.homestays) && bData.homestays.length > 0) {
            setLoadedHomestays(bData.homestays);
            setTotalCount(verifiedTotal || bData.homestays.length);
            try {
              localStorage.setItem('hillytrip_cached_homestays', JSON.stringify(bData.homestays));
            } catch {}
          }
        }
      }
    } catch (err) {
      console.warn('[Homestays Catalog] Error loading homestays data:', err);
    } finally {
      setIsInitialLoadDone(true);
      setIsFetchingStays(false);
    }
  }, []);

  useEffect(() => {
    fetchAllStays();
  }, [fetchAllStays]);

  // Pagination / Load More state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingPageRef = useRef<number | null>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const fetchNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    if (loadingPageRef.current === nextPage) return;
    loadingPageRef.current = nextPage;
    setIsLoadingMore(true);

    const directFetch = (typeof window !== 'undefined' && ((window as any).__hillyTrip_realNativeFetch || (window as any).originalFetch)) || fetch;

    try {
      const res = await directFetch(`/api/homestays?page=${nextPage}&limit=100`);
      if (!res.ok) throw new Error('Failed to fetch next homestays page');
      const newHomes = await res.json();
      if (Array.isArray(newHomes)) {
        if (newHomes.length < 100) {
          setHasMore(false);
        }
        if (newHomes.length > 0) {
          setLoadedHomestays(prev => {
            const existingIds = new Set(prev.map(h => h.id));
            const fresh = newHomes.filter((h: any) => h && h.id && !existingIds.has(h.id));
            return [...prev, ...fresh];
          });
          setCurrentPage(nextPage);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('[Homestays Catalog] Error fetching next page:', err);
    } finally {
      setIsLoadingMore(false);
      loadingPageRef.current = null;
    }
  }, [currentPage, hasMore, isLoadingMore]);

  // Observer for automatic infinite scrolling
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, fetchNextPage]);

  // Wishlist local state persistence
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hillytrip_homestay_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (id: string, name: string) => {
    const isSaved = wishlist.includes(id);
    const next = isSaved ? wishlist.filter(item => item !== id) : [...wishlist, id];
    setWishlist(next);
    try {
      localStorage.setItem('hillytrip_homestay_wishlist', JSON.stringify(next));

      const spRaw = localStorage.getItem('hillytrip_saved_places');
      const spList: string[] = spRaw ? JSON.parse(spRaw) : [];
      const combined = Array.from(new Set([
        ...next,
        ...(Array.isArray(spList) ? spList : [])
      ]));
      localStorage.setItem('hillytrip_likes', JSON.stringify(combined));
      localStorage.setItem('hillytrip_saved', JSON.stringify(combined));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn("Failed to save wishlist to localStorage:", e);
    }
    if (setNotification) {
      if (isSaved) {
        setNotification({ type: 'info', message: `Removed "${name}" from your wishlist.` });
      } else {
        setNotification({ type: 'success', message: `Saved "${name}" to your wishlist!` });
      }
    }
  };

  // Village name resolution
  const formatVillageName = (hOrId?: any) => {
    if (!hOrId) return 'Himalayan Village';

    if (typeof hOrId === 'object') {
      if (hOrId.village_name && !/^(vil|hub|dest)\d+/i.test(hOrId.village_name)) {
        return hOrId.village_name;
      }
      if (hOrId.village && !/^(vil|hub|dest)\d+/i.test(hOrId.village)) {
        return hOrId.village;
      }
      if (hOrId.address) {
        const parts = hOrId.address.split(',');
        if (parts.length > 0 && parts[0].trim() && !/^(road|near|opp|hotel)/i.test(parts[0].trim())) {
          const candidate = parts[0].trim();
          if (candidate.length < 35 && !/^\d+/.test(candidate)) {
            return candidate;
          }
        }
      }
    }

    const code = typeof hOrId === 'string' ? hOrId : (hOrId.village_code || hOrId.villageCode || hOrId.destinationId || hOrId.id);
    if (!code) return 'Himalayan Village';

    const cleanCode = String(code).trim().toLowerCase();

    const found = destinations.find(d => {
      const dId = String(d.id || '').toLowerCase();
      const dVilCode = String(d.village_code || (d as any).villageCode || '').toLowerCase();
      const dDestId = String((d as any).destination_id || '').toLowerCase();
      const dSlug = String(d.slug || '').toLowerCase();
      const dName = String(d.name || (d as any).village_name || '').toLowerCase();

      return dId === cleanCode || 
             dVilCode === cleanCode || 
             dDestId === cleanCode || 
             dSlug === cleanCode || 
             dName === cleanCode;
    });

    if (found && found.name && !found.name.toLowerCase().startsWith('hub-') && !found.name.toLowerCase().startsWith('v-') && !/^(vil|dest|hub)\d+/i.test(found.name)) {
      return found.name;
    }

    if (/^vil\d+/i.test(cleanCode)) {
      if (typeof hOrId === 'object' && hOrId.district) {
        return `${hOrId.district} Village`;
      }
      return 'Mountain Village';
    }

    return String(code)
      .replace(/^(hub|v|dest)-/i, '')
      .split(/[-_]/)
      .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(' ');
  };

  // Claim Listing Modal State
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimModalListing, setClaimModalListing] = useState<any | null>(null);
  const [, setClaimTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeClaimSystem(() => {
      setClaimTick(prev => prev + 1);
    });
    return () => unsub();
  }, []);

  const handleOpenClaim = (item: any) => {
    setClaimModalListing(item);
    setClaimModalOpen(true);
  };

  // Combined source of truth: loadedHomestays or homestays prop
  const allHomestays = useMemo(() => {
    if (Array.isArray(loadedHomestays) && loadedHomestays.length > 0) return loadedHomestays;
    if (Array.isArray(homestays) && homestays.length > 0) return homestays;
    return [];
  }, [loadedHomestays, homestays]);

  // Enriched Homestays dataset - NO STATUS FILTERING, ALL DATA SHOWN DIRECTLY
  const enrichedHomestays = useMemo(() => {
    return allHomestays.map((h, idx) => getDecoratedHomestay(h, idx));
  }, [allHomestays]);

  // ================= DISTRICT & SEARCH FILTER STATE =================
  const initialParams = useMemo(() => parseUrlFilterParams(), []);
  const [selectedState, setSelectedState] = useState<string>(initialParams.state);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialParams.district);
  const [searchQuery, setSearchQuery] = useState<string>(initialParams.search);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHighlightedIndex, setSearchHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [visibleCount, setVisibleCount] = useState<number>(36);
  const listTopRef = useRef<HTMLDivElement>(null);

  // Suggested Himalayan places computed as user types
  const placeSuggestions = useMemo(() => {
    return suggestPlaces(searchQuery, allHomestays, destinations, 8);
  }, [searchQuery, allHomestays, destinations]);

  // Click outside listener for search suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectSuggestedPlace = (place: SuggestedPlace) => {
    setSearchQuery(place.name);
    setIsSearchFocused(false);
    setSearchHighlightedIndex(-1);
    setVisibleCount(36);
    if (place.type === 'district') {
      setSelectedDistrict(place.district);
    }
  };

  // Sync with URL changes
  useEffect(() => {
    const handleHashOrPopState = () => {
      const p = parseUrlFilterParams();
      if (p.district && p.district !== 'All') setSelectedDistrict(p.district);
      if (p.state && p.state !== 'All') setSelectedState(p.state);
      if (p.search) setSearchQuery(p.search);
    };
    window.addEventListener('hashchange', handleHashOrPopState);
    return () => window.removeEventListener('hashchange', handleHashOrPopState);
  }, []);

  // Compute dynamic live counts per district and state
  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All': enrichedHomestays.length,
      'West Bengal': 0,
      'Sikkim': 0
    };
    OFFICIAL_DISTRICTS.forEach(d => {
      counts[d.district] = 0;
    });

    enrichedHomestays.forEach(h => {
      const dist = h.district || getHomestayDistrict(h);
      const st = h.state || getHomestayState(h);
      if (dist && counts[dist] !== undefined) {
        counts[dist]++;
      }
      if (st === 'Sikkim') {
        counts['Sikkim'] = (counts['Sikkim'] || 0) + 1;
      } else {
        counts['West Bengal'] = (counts['West Bengal'] || 0) + 1;
      }
    });

    return counts;
  }, [enrichedHomestays]);

  // Districts list filtered by selected state
  const displayedDistrictPills = useMemo(() => {
    if (selectedState === 'All') {
      return OFFICIAL_DISTRICTS;
    }
    return OFFICIAL_DISTRICTS.filter(d => d.state.toLowerCase() === selectedState.toLowerCase());
  }, [selectedState]);

  // Active district metadata (for banner / spotlight)
  const activeDistrictInfo = useMemo(() => {
    if (!selectedDistrict || selectedDistrict === 'All') return null;
    return OFFICIAL_DISTRICTS.find(
      d => d.district.toLowerCase() === selectedDistrict.toLowerCase() || d.slug === selectedDistrict.toLowerCase()
    ) || null;
  }, [selectedDistrict]);

  // Handle District selection
  const handleSelectDistrict = (districtName: string) => {
    setSelectedDistrict(districtName);
    setVisibleCount(36);

    // If a district is chosen, ensure the state selector is in sync
    if (districtName !== 'All') {
      const dInfo = OFFICIAL_DISTRICTS.find(d => d.district.toLowerCase() === districtName.toLowerCase());
      if (dInfo && selectedState !== 'All' && selectedState !== dInfo.state) {
        setSelectedState(dInfo.state);
      }
    }
  };

  // Handle State selection
  const handleSelectState = (stateName: string) => {
    setSelectedState(stateName);
    setVisibleCount(36);

    // If current selected district does not belong to the newly selected state, reset district to 'All'
    if (stateName !== 'All' && selectedDistrict !== 'All') {
      const dInfo = OFFICIAL_DISTRICTS.find(d => d.district.toLowerCase() === selectedDistrict.toLowerCase());
      if (dInfo && dInfo.state !== stateName) {
        setSelectedDistrict('All');
      }
    }
  };

  // Reset all filters
  const handleClearAllFilters = () => {
    setSelectedDistrict('All');
    setSelectedState('All');
    setSearchQuery('');
    setSortBy('featured');
    setVisibleCount(36);
  };

  // Filter enriched homestays by state, district, and search query
  const filteredHomestays = useMemo(() => {
    return enrichedHomestays.filter(h => {
      const dist = h.district || getHomestayDistrict(h);
      const st = h.state || getHomestayState(h);

      // 1. If search query is present, use intelligent multi-entity match
      if (searchQuery.trim()) {
        const searchRes = matchHomestaySearch(h, searchQuery);
        if (!searchRes.matches) {
          return false;
        }
        (h as any)._searchScore = searchRes.score;

        // If the query specifically matched a place or town (e.g. Lava, Kurseong, Ravangla),
        // prioritize showing it regardless of stale district selection
        if (searchRes.matchedPlace) {
          return true;
        }
      }

      // 2. State filter
      if (selectedState !== 'All') {
        if (st.toLowerCase() !== selectedState.toLowerCase()) {
          return false;
        }
      }

      // 3. District filter
      if (selectedDistrict !== 'All') {
        const matchByName = dist.toLowerCase() === selectedDistrict.toLowerCase();
        const codeInfo = DISTRICT_CODE_MAP[selectedDistrict.toLowerCase()];
        const matchByCode = codeInfo && (String(h.district_code || (h as any).districtCode) === codeInfo.district_code);
        if (!matchByName && !matchByCode) {
          return false;
        }
      }

      return true;
    });
  }, [enrichedHomestays, selectedDistrict, selectedState, searchQuery]);

  // Sort filtered homestays
  const sortedHomestays = useMemo(() => {
    const list = [...filteredHomestays];
    // If active search query, rank highest matching score first!
    if (searchQuery.trim()) {
      return list.sort((a, b) => {
        const scoreA = (a as any)._searchScore || 0;
        const scoreB = (b as any)._searchScore || 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return (b.rating || 0) - (a.rating || 0);
      });
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => (a.priceMin || 0) - (b.priceMin || 0));
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => (b.priceMin || 0) - (a.priceMin || 0));
    }
    if (sortBy === 'name') {
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    // Default / Featured: featured first, then higher rating
    return list.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [filteredHomestays, sortBy, searchQuery]);

  // Reset pagination on filter or sort change
  useEffect(() => {
    setVisibleCount(36);
  }, [selectedDistrict, selectedState, searchQuery, sortBy]);

  // Progressive slice for 60fps rendering
  const displayedHomestays = useMemo(() => {
    return sortedHomestays.slice(0, visibleCount);
  }, [sortedHomestays, visibleCount]);

  const hasMoreLocal = visibleCount < sortedHomestays.length;

  const handleLoadMoreLocal = () => {
    setVisibleCount(prev => Math.min(prev + 36, sortedHomestays.length));
  };

  // Local infinite scroll observer
  const localObserverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = localObserverRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreLocal) {
          handleLoadMoreLocal();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMoreLocal]);

  const isFilterActive = selectedDistrict !== 'All' || selectedState !== 'All' || searchQuery.trim() !== '';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans pb-24 selection:bg-emerald-500/10">
      
      {/* ================= HERO BANNER SECTION ================= */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 w-full flex items-center justify-center bg-slate-900 overflow-hidden px-4">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png" 
            alt="Himalayan Mountain Range background" 
            className="w-full h-full object-cover opacity-55 scale-105 filter brightness-90 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-slate-50 dark:to-slate-950"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10 flex flex-col items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Verified Mountain Stays Directory
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md text-center"
          >
            Mountain Homestays
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-slate-200 mt-3 font-medium drop-shadow-xs text-center max-w-xl"
          >
            Authentic, verified local village homestays across 10 Himalayan districts in North Bengal & Sikkim.
          </motion.p>

          {/* Region Tabs in Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15"
          >
            <button
              id="tab-region-all"
              onClick={() => handleSelectState('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                selectedState === 'All'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>All Regions</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${selectedState === 'All' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/15 text-white/90'}`}>
                {(districtCounts['All'] || totalCount || 3131).toLocaleString()}
              </span>
            </button>

            <button
              id="tab-region-wb"
              onClick={() => handleSelectState('West Bengal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                selectedState === 'West Bengal'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>West Bengal</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${selectedState === 'West Bengal' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/15 text-white/90'}`}>
                {(districtCounts['West Bengal'] || 1993).toLocaleString()}
              </span>
            </button>

            <button
              id="tab-region-sk"
              onClick={() => handleSelectState('Sikkim')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer flex items-center gap-1.5 ${
                selectedState === 'Sikkim'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Sikkim</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${selectedState === 'Sikkim' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/15 text-white/90'}`}>
                {(districtCounts['Sikkim'] || 1138).toLocaleString()}
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* ================= STICKY DISTRICT FILTER & SEARCH BAR ================= */}
      <div ref={listTopRef} className="sticky top-[56px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2.5">
          
          {/* Main Controls Row: Search Input, District Dropdown, Sort By, Clear */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            
            {/* Search Input with Live Place Suggestions */}
            <div ref={searchContainerRef} className="relative flex-1">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  id="homestays-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                    setSearchHighlightedIndex(0);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setSearchHighlightedIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setSearchHighlightedIndex(prev => Math.min(prev + 1, placeSuggestions.length - 1));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setSearchHighlightedIndex(prev => Math.max(prev - 1, 0));
                    } else if (e.key === 'Enter') {
                      if (searchHighlightedIndex >= 0 && placeSuggestions[searchHighlightedIndex]) {
                        e.preventDefault();
                        handleSelectSuggestedPlace(placeSuggestions[searchHighlightedIndex]);
                      }
                    } else if (e.key === 'Escape') {
                      setIsSearchFocused(false);
                    }
                  }}
                  placeholder="Search by place name, village or homestay..."
                  className="w-full pl-9 pr-9 py-2 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-2xs"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    id="btn-clear-search"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Floating Place Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && placeSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto"
                  >
                    <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {searchQuery.trim() ? 'Suggested Places & Villages' : 'Popular Himalayan Destinations'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Use ↑↓ keys, Enter to select</span>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {placeSuggestions.map((place, idx) => {
                        const isHighlighted = idx === searchHighlightedIndex;
                        const typeLabel = place.type === 'village' ? 'Village' : place.type === 'town' ? 'Hill Town' : place.type === 'district' ? 'District' : 'Destination';
                        const typeBg = place.type === 'village'
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                          : place.type === 'district'
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                          : place.type === 'town'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

                        return (
                          <div
                            key={place.id}
                            onMouseEnter={() => setSearchHighlightedIndex(idx)}
                            onClick={() => handleSelectSuggestedPlace(place)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition select-none ${
                              isHighlighted
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500/30'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-base shrink-0">{place.icon || '📍'}</span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold truncate">{place.name}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${typeBg}`}>
                                    {typeLabel}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                                  {place.district} District, {place.state}
                                </span>
                              </div>
                            </div>

                            {place.homestayCount > 0 && (
                              <span className="shrink-0 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                                🏡 {place.homestayCount} {place.homestayCount === 1 ? 'Stay' : 'Stays'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick District Selector Dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <select
                  id="select-district-filter"
                  value={selectedDistrict}
                  onChange={(e) => handleSelectDistrict(e.target.value)}
                  className="appearance-none text-xs font-bold bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer shadow-2xs"
                >
                  <option value="All">
                    📍 All Districts ({districtCounts['All'] || totalCount || 3131})
                  </option>
                  
                  <optgroup label="West Bengal Districts">
                    {OFFICIAL_DISTRICTS.filter(d => d.state === 'West Bengal').map(d => (
                      <option key={d.district} value={d.district}>
                        {d.icon} {d.district} ({districtCounts[d.district] || 0})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Sikkim Districts">
                    {OFFICIAL_DISTRICTS.filter(d => d.state === 'Sikkim').map(d => (
                      <option key={d.district} value={d.district}>
                        {d.icon} {d.district} ({districtCounts[d.district] || 0})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Selector Dropdown */}
              <div className="relative shrink-0">
                <select
                  id="select-sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none text-xs font-bold bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer shadow-2xs"
                >
                  <option value="featured">✨ Featured Stays</option>
                  <option value="rating">⭐ Top Rated</option>
                  <option value="price-asc">💵 Price: Low to High</option>
                  <option value="price-desc">💎 Price: High to Low</option>
                  <option value="name">🔤 Name: A to Z</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Reset Filters button */}
              {isFilterActive && (
                <button
                  id="btn-reset-all-filters"
                  onClick={handleClearAllFilters}
                  className="px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 transition cursor-pointer flex items-center gap-1 shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Place Suggestion Chips when typing */}
          {searchQuery.trim().length > 0 && placeSuggestions.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none text-xs">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Suggested places:
              </span>
              {placeSuggestions.slice(0, 5).map((place) => (
                <button
                  key={`chip-${place.id}`}
                  onClick={() => handleSelectSuggestedPlace(place)}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 border border-emerald-200/80 dark:border-emerald-800/80 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-2xs"
                >
                  <span>{place.icon || '📍'}</span>
                  <span>{place.name}</span>
                  {place.homestayCount > 0 && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                      ({place.homestayCount})
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Horizontal District Pills Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            
            {/* All Districts Pill */}
            <button
              id="pill-district-all"
              onClick={() => handleSelectDistrict('All')}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 border ${
                selectedDistrict === 'All'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-black'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>All Districts</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${selectedDistrict === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {selectedState === 'All'
                  ? (districtCounts['All'] || totalCount || 3131).toLocaleString()
                  : (districtCounts[selectedState] || 0).toLocaleString()}
              </span>
            </button>

            {/* Individual District Pills */}
            {displayedDistrictPills.map((d) => {
              const isSelected = selectedDistrict.toLowerCase() === d.district.toLowerCase();
              const count = districtCounts[d.district] || 0;

              return (
                <button
                  key={d.district}
                  id={`pill-district-${d.slug}`}
                  onClick={() => handleSelectDistrict(isSelected ? 'All' : d.district)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-black'
                      : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-500/40'
                  }`}
                  title={`${d.district} District (${d.state}) - ${d.tagline}`}
                >
                  <span className="text-sm shrink-0">{d.icon || '🏔️'}</span>
                  <span>{d.district}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= HOMESTAY DATA LISTING ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* District Spotlight Card (When a specific district is active) */}
        {activeDistrictInfo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-2xl shadow-xs shrink-0">
                {activeDistrictInfo.icon || '🏔️'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    {activeDistrictInfo.district} District Homestays
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-mono">
                    {activeDistrictInfo.state}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeDistrictInfo.tagline} • <strong className="text-slate-900 dark:text-slate-200 font-mono">{filteredHomestays.length.toLocaleString()}</strong> verified local homestays
                </p>
              </div>
            </div>
            
            <button
              id="btn-clear-district-spotlight"
              onClick={() => handleSelectDistrict('All')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs hover:shadow-xs transition shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All Districts</span>
            </button>
          </motion.div>
        )}

        {/* Results Counter & Active Filter Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white font-mono">
              Showing {displayedHomestays.length.toLocaleString()} of {filteredHomestays.length.toLocaleString()}
            </span>
            <span>
              homestays {selectedDistrict !== 'All' ? `in ${selectedDistrict}` : (selectedState !== 'All' ? `in ${selectedState}` : 'across all 10 Himalayan districts')}
            </span>
          </div>

          {/* Active filter badges */}
          {isFilterActive && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedState !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold">
                  Region: {selectedState}
                  <button onClick={() => handleSelectState('All')} className="hover:text-rose-500 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedDistrict !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/50">
                  District: {selectedDistrict}
                  <button onClick={() => handleSelectDistrict('All')} className="hover:text-rose-500 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                id="btn-clear-tags"
                onClick={handleClearAllFilters}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeletons */}
        {(isFetchingStays || !isInitialLoadDone) && enrichedHomestays.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 space-y-4 animate-pulse">
                <div className="h-52 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
                <div className="h-9 bg-slate-100 dark:bg-slate-850 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filteredHomestays.length === 0 ? (
          /* Empty State when no stays match filter */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-full flex items-center justify-center mx-auto text-xl">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              No Homestays Match Your Filters
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              No homestay records found in {selectedDistrict !== 'All' ? `${selectedDistrict} District` : (selectedState !== 'All' ? selectedState : 'the directory')} matching your criteria.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                id="btn-empty-clear-district"
                onClick={handleClearAllFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition duration-200 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Homestays</span>
              </button>
            </div>
          </div>
        ) : (
          /* Pure Homestays Data Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedHomestays.map((h, index) => {
              const isSaved = wishlist.includes(h.id);
              const districtName = h.district || getHomestayDistrict(h);
              const villageName = formatVillageName(h);

              return (
                <motion.div
                  key={h.id || `hs-${index}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min((index % 12) * 0.02, 0.2) }}
                  onClick={() => navigate(`#/homestay/${getItemSlug(h)}`)}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-300 flex flex-col h-full group cursor-pointer relative"
                >
                  {/* Cover Image & Badges */}
                  <div className="h-52 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                    <ProgressiveImage 
                      src={(h.images && h.images.find(img => img && img.trim() !== '')) || undefined} 
                      alt={h.name} 
                      itemName={h.name}
                      category="village"
                      targetWidth={400}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                      <UnclaimedBadge listing={h} onClaimClick={() => handleOpenClaim(h)} />
                      {h.isFeatured && (
                        <span className="bg-amber-500/95 backdrop-blur-xs text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Save Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(h.id, h.name);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-xs shadow-md transition duration-200 cursor-pointer"
                      title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                    >
                      <Heart className={`w-4.5 h-4.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    </button>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg border border-white/10 shadow-lg font-mono text-xs font-bold">
                      Starting ₹{h.priceMin} <span className="text-[10px] text-slate-300 font-sans">/ night</span>
                    </div>
                  </div>

                  {/* Claim Strip below property image */}
                  {!isListingVerified(h) && (
                    <div className="px-4 pt-3">
                      <ClaimStrip listing={h} onClaimClick={() => handleOpenClaim(h)} />
                    </div>
                  )}

                  {/* Card Info Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      
                      {/* Destination / Location breadcrumb */}
                      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{villageName}</span>
                        {districtName && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="truncate">{districtName}</span>
                          </>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition text-left">
                        {h.name}
                      </h3>

                      {/* Tagline */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-1 italic text-left">
                        {h.tagline}
                      </p>
                    </div>

                    {/* Key amenities */}
                    {h.amenities && h.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {h.amenities.slice(0, 3).map((a, idx) => (
                          <span 
                            key={idx}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[130px]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer details: Rating + Contact Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-auto">
                      
                      {/* Star Rating */}
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-lg border border-amber-100/60 dark:border-amber-900/30">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black text-slate-900 dark:text-amber-400 font-mono">{h.rating}</span>
                        <span className="text-[9px] text-slate-400">({h.reviewCount})</span>
                      </div>

                      {/* In-Platform Booking & Inquiry Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const slug = getItemSlug(h);
                            navigate(`#/enquire?listingType=homestay&listingId=${slug}`);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                          title="Enquire via HillyTrip Messaging"
                        >
                          <MessageSquareIcon className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Enquire</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const slug = getItemSlug(h);
                            navigate(`#/homestay/${slug}`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg transition cursor-pointer shadow-xs hover:shadow"
                          title="Book Now"
                        >
                          <span>Book Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Progressive Pagination / Load More */}
        <div className="text-center py-12 space-y-3">
          {hasMoreLocal && (
            <button
              id="btn-load-more-homestays"
              onClick={handleLoadMoreLocal}
              className="px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-black transition cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              Load More Stays ({sortedHomestays.length - visibleCount} remaining) <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Local Scroll Trigger */}
          {hasMoreLocal && <div ref={localObserverRef} className="h-4 w-full" />}

          {/* Remote API Pagination if background server has more */}
          {isLoadingMore && (
            <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin shrink-0" />
              <span className="text-xs text-slate-500 font-bold font-mono">
                Syncing additional homestays from server...
              </span>
            </div>
          )}
          {hasMore && !isLoadingMore && (
            <button
              onClick={() => fetchNextPage()}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Fetch Remote Stays <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
          {hasMore && <div ref={observerTargetRef} className="h-4 w-full" />}
        </div>
      </main>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        listing={claimModalListing}
        currentUser={user}
        claimSource="Listing Page"
        setNotification={setNotification}
        onSuccessNavigate={() => navigate(`#/partner`)}
      />
    </div>
  );
};

export default HomestaysCatalogView;

function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
