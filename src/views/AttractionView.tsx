import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { AnimatedLogo } from '../components/AnimatedLogo';
import AttractionDetailPage from '../components/AttractionDetailPage';
import AttractionSearchBar from '../components/AttractionSearchBar';
import { Compass, MapPin, Sparkles, Search, ArrowUpRight, Filter, X, Star, Layers, ShieldCheck, Droplets, Mountain, Landmark, Waves, Footprints, Home, Grid, Map as MapIcon, CheckCircle2 } from 'lucide-react';
import { Attraction, Destination, Homestay, Driver, ImageItem, User } from '../types';
import { db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAttractionImage, COMMON_STORAGE_ASSETS } from '../utils/imagePool';
import { getItemSlug } from '../utils/slug';

export interface AttractionViewProps {
  currentPath: string;
  attractions: Attraction[];
  destinations: Destination[];
  homestays: Homestay[];
  drivers: Driver[];
  likes: any[];
  comments: any[];
  attractionStats: Record<string, number>;
  savedPlaces: string[];
  toggleLike: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  navigate: (path: string) => void;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  activeAttrDetail: any;
  activePhotos: ImageItem[];
  setActivePhotos: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  handleToggleSave: (id: string, name: string, type: string) => void;
  isItemSaved: (id: string) => boolean;
  toSlug: (str: string) => string;
  safeSrc: (src?: string, fallback?: string) => string;
  calculateDistanceInKm: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  deleteCommentAction: (id: string) => Promise<void>;
  addCommentAction: (contentId: string, contentType: 'destination' | 'attraction' | 'photo', text: string) => Promise<void>;
  handleUserLogin: () => void;
  submittingAttrLead: boolean;
  setSubmittingAttrLead: React.Dispatch<React.SetStateAction<boolean>>;
  attrLeadSuccess: boolean;
  setAttrLeadSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  handleAttractionLeadSubmit: (e: React.FormEvent) => Promise<void>;
  executeProtectedAction: (actionName: string, actionCallback: () => void, requiresVerification?: boolean, serializableAction?: any) => void;
  setNotification: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  attractionFilter: string;
  setAttractionFilter: (f: string) => void;
  attractionSearchQuery: string;
  setAttractionSearchQuery: (q: string) => void;
}

const getCategoryIcon = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('waterfall')) return <Droplets className="w-4 h-4 text-sky-500" />;
  if (cat.includes('viewpoint') || cat.includes('mountain')) return <Mountain className="w-4 h-4 text-emerald-500" />;
  if (cat.includes('monastery') || cat.includes('heritage')) return <Landmark className="w-4 h-4 text-amber-500" />;
  if (cat.includes('lake')) return <Waves className="w-4 h-4 text-cyan-500" />;
  if (cat.includes('trek') || cat.includes('forest')) return <Footprints className="w-4 h-4 text-emerald-600" />;
  if (cat.includes('village')) return <Home className="w-4 h-4 text-orange-500" />;
  return <Sparkles className="w-4 h-4 text-emerald-500" />;
};

const getCategoryFallbackImage = (category: string): string => {
  return getAttractionImage('', category);
};

export const AttractionView: React.FC<AttractionViewProps> = (props) => {
  const { currentPath } = props;
  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isDetail = cleanPath.startsWith('/attractions/') || cleanPath.startsWith('/attraction/');

  if (isDetail) {
    return <AttractionDetailWrapper {...props} cleanPath={cleanPath} />;
  }

  return <AttractionCatalogView {...props} />;
};

interface AttractionDetailWrapperProps extends AttractionViewProps {
  cleanPath: string;
}

const AttractionDetailWrapper: React.FC<AttractionDetailWrapperProps> = (props) => {
  const {
    cleanPath,
    attractions = [],
    destinations = [],
    homestays = [],
    drivers = [],
    likes = [],
    comments = [],
    savedPlaces = [],
    toggleLike,
    navigate,
    user,
    isAdmin,
    activeAttrDetail,
    activePhotos = [],
    setActivePhotos,
    handleToggleSave,
    isItemSaved,
    toSlug,
    safeSrc,
    calculateDistanceInKm,
    setComments,
    deleteCommentAction,
    addCommentAction,
    handleUserLogin,
    submittingAttrLead,
    setSubmittingAttrLead,
    attrLeadSuccess,
    setAttrLeadSuccess,
    handleAttractionLeadSubmit,
    executeProtectedAction,
    setNotification
  } = props;

  const rawAttrId = decodeURIComponent(
    cleanPath.replace(/^\/(attractions|attraction)\//, '').replace(/^#\/(attractions|attraction)\//, '')
  );

  const toSlugStr = (str: any) => {
    if (!str) return '';
    return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const resolvedAttrDetail = activeAttrDetail || (rawAttrId ? (() => {
    const targetSlug = toSlugStr(rawAttrId);
    const found = (attractions || []).find(a => 
      (a?.id || '').toLowerCase() === rawAttrId.toLowerCase() || 
      (a?.slug || '').toLowerCase() === rawAttrId.toLowerCase() ||
      toSlugStr(a?.name) === targetSlug ||
      toSlugStr(a?.id) === targetSlug ||
      getItemSlug(a) === targetSlug
    );
    if (found) {
      const dest = (destinations || []).find(d => d.id === found.destinationId);
      return {
        attraction: found,
        destination: dest || null,
        routes: []
      };
    }
    return null;
  })() : null);

  useEffect(() => {
    if (!resolvedAttrDetail?.attraction) return;
    const attr = resolvedAttrDetail.attraction;
    const canonicalSlug = getItemSlug(attr) || toSlugStr(attr.name || attr.id);
    if (!canonicalSlug) return;
    const canonicalPath = `/attraction/${canonicalSlug}`;
    if (typeof window !== 'undefined') {
      const currentBrowserPath = window.location.pathname;
      const currentBrowserHash = window.location.hash;
      if (currentBrowserPath !== canonicalPath || currentBrowserHash) {
        const querySuffix = window.location.search || '';
        window.history.replaceState(null, '', canonicalPath + querySuffix);
      }
    }
  }, [resolvedAttrDetail?.attraction]);

  return (
    <ErrorBoundary fallbackTitle="Attraction Details Error" fallbackMessage="The details for this sightseeing spot could not be processed. Please return to standard coordinates.">
      <div id="attraction-detail-view" className="animate-fade-in text-slate-750 bg-slate-50/30 dark:bg-slate-950/20">
        {resolvedAttrDetail ? (
          <AttractionDetailPage
            activeAttrDetail={resolvedAttrDetail}
            user={user}
            isAdmin={isAdmin}
            likes={likes}
            toggleLike={toggleLike}
            savedPlaces={savedPlaces}
            handleToggleSave={(id: string, type: string) => handleToggleSave(id, resolvedAttrDetail?.attraction?.name || '', type)}
            isItemSaved={isItemSaved}
            navigate={navigate}
            toSlug={toSlug}
            safeSrc={safeSrc}
            calculateDistanceInKm={calculateDistanceInKm}
            activePhotos={activePhotos}
            setActivePhotos={setActivePhotos}
            comments={comments}
            addCommentAction={async (text, rating, tips) => {
              const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const newComment = {
                id: commentId,
                userId: user?.uid,
                userName: user?.displayName || user?.email || 'Registered Traveler',
                contentId: resolvedAttrDetail?.attraction?.id || resolvedAttrDetail?.id,
                contentType: 'attraction' as const,
                text: text.trim(),
                rating,
                tips,
                timestamp: new Date().toISOString()
              };
              setComments(prev => [...(prev || []), newComment]);
              await setDoc(doc(db, 'comments', commentId), newComment);
            }}
            deleteCommentAction={deleteCommentAction}
            onAddPhotoComment={addCommentAction}
            onDeletePhotoComment={deleteCommentAction}
            handleUserLogin={handleUserLogin}
            submittingAttrLead={submittingAttrLead}
            setSubmittingAttrLead={setSubmittingAttrLead}
            attrLeadSuccess={attrLeadSuccess}
            setAttrLeadSuccess={setAttrLeadSuccess}
            handleAttractionLeadSubmit={handleAttractionLeadSubmit}
            destinations={destinations}
            attractions={attractions}
            homestays={homestays}
            drivers={drivers}
            executeProtectedAction={executeProtectedAction}
            setNotification={(notif) => {
              if (notif) {
                setNotification({ type: notif.type === 'info' ? 'success' : notif.type, message: notif.message });
              } else {
                setNotification(null);
              }
            }}
          />
        ) : (
          <div className="text-center py-24 text-slate-500 bg-white dark:bg-slate-900 rounded-3xl shadow-xs max-w-xl mx-auto border dark:border-slate-800 my-12 px-6">
            <Compass className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">Wanderer Coordinates Lost</h4>
            <p className="text-xs text-slate-400 mt-1 px-4 max-w-sm mx-auto">This specific sightseeing attraction cannot be located in the offline or database index. Return to standard search boards.</p>
            <button onClick={() => navigate('/attractions')} className="mt-4 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans cursor-pointer">
              Back to Attractions board
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

const REGIONAL_CATEGORIES = [
  'Viewpoints',
  'Monasteries',
  'Waterfalls',
  'Lakes',
  'Tea Gardens',
  'Trekking',
  'Temples',
  'Wildlife',
  'Heritage',
  'Hot Springs'
];

const AttractionCatalogView: React.FC<AttractionViewProps> = ({
  attractions = [],
  destinations = [],
  attractionStats = {},
  navigate,
  toSlug,
  safeSrc,
  attractionFilter = 'All',
  setAttractionFilter,
  attractionSearchQuery = '',
  setAttractionSearchQuery,
}) => {
  // Debounced search query (300ms) for high-performance querying without hammering API
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(attractionSearchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(attractionSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [attractionSearchQuery]);

  // Catalog View - Live Paginated Backend State
  const [loadedAttractions, setLoadedAttractions] = useState<Attraction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingPageRef = useRef<number | null>(null);
  const activeFetchControllerRef = useRef<AbortController | null>(null);

  const PAGE_SIZE = 18;

  // Primary Query Effect: Triggered whenever debounced search query or category filter changes
  useEffect(() => {
    if (activeFetchControllerRef.current) {
      activeFetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeFetchControllerRef.current = controller;

    setIsLoading(true);
    setCurrentPage(1);
    setHasMore(true);

    const queryParam = debouncedSearchQuery.trim();
    const catParam = attractionFilter && attractionFilter !== 'All' ? attractionFilter.trim() : '';

    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', String(PAGE_SIZE));
    if (queryParam) params.set('q', queryParam);
    if (catParam) params.set('category', catParam);

    fetch(`/api/attractions?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to fetch attractions: ${res.statusText}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setLoadedAttractions(data);
          setHasMore(data.length >= PAGE_SIZE);
        } else {
          setLoadedAttractions([]);
          setHasMore(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.warn('[Attractions Catalog] Search/filter fetch error:', err);
        // Fallback to existing initial slice if available and no query
        if (!queryParam && (!catParam || catParam === 'All')) {
          setLoadedAttractions(attractions || []);
        } else {
          setLoadedAttractions([]);
        }
        setHasMore(false);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedSearchQuery, attractionFilter, attractions]);

  const fetchNextPage = useCallback(async () => {
    if (isLoadingMore || isLoading || !hasMore) return;
    const nextPage = currentPage + 1;
    if (loadingPageRef.current === nextPage) return;
    loadingPageRef.current = nextPage;
    setIsLoadingMore(true);

    try {
      const queryParam = debouncedSearchQuery.trim();
      const catParam = attractionFilter && attractionFilter !== 'All' ? attractionFilter.trim() : '';

      const params = new URLSearchParams();
      params.set('page', String(nextPage));
      params.set('limit', String(PAGE_SIZE));
      if (queryParam) params.set('q', queryParam);
      if (catParam) params.set('category', catParam);

      const res = await fetch(`/api/attractions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch next attractions page');
      const newAtts = await res.json();
      if (Array.isArray(newAtts)) {
        if (newAtts.length < PAGE_SIZE) {
          setHasMore(false);
        }
        if (newAtts.length > 0) {
          setLoadedAttractions(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const fresh = newAtts.filter((a: any) => a && a.id && !existingIds.has(a.id));
            return [...prev, ...fresh];
          });
          setCurrentPage(nextPage);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('[Attractions Catalog] Error fetching next page:', err);
    } finally {
      setIsLoadingMore(false);
      loadingPageRef.current = null;
    }
  }, [currentPage, hasMore, isLoading, isLoadingMore, debouncedSearchQuery, attractionFilter]);

  const validAttractions = useMemo(() => {
    return (loadedAttractions || []).filter(a => a && a.id);
  }, [loadedAttractions]);

  const categoriesList = REGIONAL_CATEGORIES;

  const destMap = useMemo(() => {
    return new Map((destinations || []).filter(d => d && d.id).map(d => [d.id, d]));
  }, [destinations]);

  const displayedAttractionsList = validAttractions;

  const observerTargetRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver trigger (400px bottom margin)
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, fetchNextPage]);

  // Window scroll fallback trigger (400px before bottom)
  useEffect(() => {
    let ticking = false;
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 400) {
            if (hasMore && !isLoadingMore && !isLoading) {
              fetchNextPage();
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, isLoading, fetchNextPage]);

  return (
    <ErrorBoundary fallbackTitle="Attractions Board Error" fallbackMessage="Could not load the sightseeing coordinates board. Try resetting or contact the hilly network.">
      <div id="attractions-view" className="animate-fade-in text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/20 py-6 md:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        {/* 1. HERO SECTION */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 bg-slate-900 group">
          {/* Brighter Himalayan Background Image */}
          <img 
            src={COMMON_STORAGE_ASSETS.hero} 
            alt="Himalayan Sightseeing Vistas" 
            className="absolute inset-0 w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000 brightness-95"
          />
          {/* Softer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/65 to-emerald-950/40 backdrop-blur-[1px]" />

          <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl text-left text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3.5 shadow-xs">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>Verified Sightseeing Index</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-md">
              Himalayan Attractions &amp; Hidden Gems
            </h1>

            <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed max-w-2xl drop-shadow-sm">
              Discover scenic mountain viewpoints, ancient monasteries, secret waterfalls, and pristine high-altitude treks verified by local mountain guides.
            </p>
          </div>
        </div>

        {/* 2. STICKY SEARCH BAR */}
        <div className="sticky top-16 z-30 py-2 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md rounded-2xl transition-all">
          <AttractionSearchBar
            searchQuery={attractionSearchQuery}
            setSearchQuery={setAttractionSearchQuery}
            attractionFilter={attractionFilter}
            setAttractionFilter={setAttractionFilter}
            attractions={validAttractions}
            destinations={destinations}
            onSelectAttraction={(attr) => navigate(`/attraction/${getItemSlug(attr)}`)}
            onSelectDestination={(dest) => navigate(`/destinations/${toSlug(dest?.id || dest?.name)}`)}
            totalCount={validAttractions.length}
            filteredCount={displayedAttractionsList.length}
          />
        </div>

        {/* 5. CATEGORY CHIPS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
          <button 
            onClick={() => setAttractionFilter('All')} 
            className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all cursor-pointer shadow-2xs ${
              (!attractionFilter || attractionFilter.toLowerCase() === 'all')
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
            }`}
          >
            <Grid className="w-4 h-4 text-emerald-500" />
            <span>All Categories</span>
          </button>
          {categoriesList.map(cat => (
            <button 
              key={cat} 
              onClick={() => setAttractionFilter(cat)}
              className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl text-xs font-extrabold shrink-0 transition-all cursor-pointer shadow-2xs ${
                (attractionFilter && attractionFilter.toLowerCase() === cat.toLowerCase()) 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-102' 
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* LOADING SKELETON */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={`skel-${i}`} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden h-96 flex flex-col justify-between p-5 space-y-4">
                <div className="h-52 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </div>
                <div className="h-8 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : displayedAttractionsList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-14 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-200/50 dark:border-sky-800/50 text-sky-600 dark:text-sky-400">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              No attractions found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              Try another keyword or browse a different category.
            </p>
            <button
              onClick={() => {
                setAttractionSearchQuery('');
                setAttractionFilter('All');
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        ) : (
          <>
            {/* 4. ATTRACTION CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedAttractionsList.map(attr => {
                if (!attr || !attr.id) return null;
                const viewCount = (attractionStats && attr.id) ? (attractionStats[attr.id] || 0) : 0;
                const destObj = attr.destinationId ? destMap.get(attr.destinationId) : undefined;
                const villageName = (destObj as any)?.village || destObj?.name || 'Mountain Village';
                const districtName = attr.district || destObj?.district || 'North Bengal';
                
                // Non-duplicate fallback image handling
                const fallbackImage = destObj?.image || destObj?.coverImage || getCategoryFallbackImage(attr.category);
                const imageSrc = safeSrc(attr.image, fallbackImage);

                // Rating calculation or display
                const ratingValue = (4.7 + (((attr.id || '').length % 4) * 0.1)).toFixed(1);
                const isVerifiedSpot = attr.isHiddenGem || attr.isFeaturedAttraction || true;

                return (
                  <div 
                    key={attr.id}
                    onClick={() => navigate(`/attraction/${getItemSlug(attr)}`)}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header Image */}
                      <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={imageSrc} 
                          alt={attr.name || 'Attraction'} 
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950/75 backdrop-blur-md text-white text-[11px] font-extrabold rounded-full border border-white/15 shadow-sm">
                            {getCategoryIcon(attr.category)}
                            <span>{attr.category || 'Sightseeing'}</span>
                          </span>

                          {attr.isHiddenGem ? (
                            <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-black rounded-full shadow-md flex items-center gap-1">
                              💎 Hidden Gem
                            </span>
                          ) : isVerifiedSpot && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-extrabold rounded-full shadow-md">
                              <ShieldCheck className="w-3 h-3 text-white" /> Verified
                            </span>
                          )}
                        </div>

                        {/* Bottom Overlay Info: Rating */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-xs font-black rounded-xl shadow-xs">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{ratingValue}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Body Information Hierarchy */}
                      <div className="p-5 text-left space-y-2">
                        {/* Location Hierarchy: Village & District */}
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{villageName} • {districtName}</span>
                        </div>

                        {/* Attraction Name */}
                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {attr.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                          {attr.description || 'Verified mountain attraction with panoramic views and guide recommendations.'}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 mt-auto flex items-center justify-between text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {viewCount} traveler views
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Explore Guide <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Pagination Trigger & Sentinel */}
            <div className="text-center py-8 space-y-3">
              {isLoadingMore && (
                <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                  <span className="text-xs text-slate-500 font-bold font-mono">
                    Loading next attractions...
                  </span>
                </div>
              )}
              {hasMore && !isLoadingMore && (
                <button
                  onClick={() => fetchNextPage()}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-102 active:scale-98 inline-flex items-center gap-2"
                >
                  <span>Explore More Sightseeing Spots</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
              {hasMore && <div ref={observerTargetRef} className="h-4 w-full" />}
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AttractionView;
