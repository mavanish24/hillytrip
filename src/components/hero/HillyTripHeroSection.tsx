import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import UniversalHeroSearchModal from '../search/UniversalHeroSearchModal';

import { Destination, Attraction, Homestay, Driver, Route, Hub } from '../../types';
import { SearchDataSources } from '../../lib/universalHeroSearchEngine';
import { rankSearchEntities } from '../../utils/searchRankingEngine';
import { HIMALAYAN_PLACES } from '../../utils/placeSuggestions';
import { getItemSlug } from '../../utils/slug';

const ROTATING_PHRASES = [
  'Where do you want to GO?',
  'Where do you want to STAY?',
  'What do you want to SEE?',
  'What do you want to EXPERIENCE?',
];

export interface HillyTripHeroSectionProps {
  navigate?: (path: string) => void;
  onOpenAiPlanner?: () => void;
  searchFrom?: string;
  setSearchFrom?: (val: string) => void;
  searchTo?: string;
  setSearchTo?: (val: string) => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  drivers?: Driver[];
  hubs?: Hub[];
  routes?: Route[];
  destinationsCount?: number;
  attractionsCount?: number;
  homestaysCount?: number;
  operatorsCount?: number;
  routesCount?: number;
  themeMode?: 'light' | 'dark';
}

export const HillyTripHeroSection: React.FC<HillyTripHeroSectionProps> = ({
  navigate = () => {},
  destinations = [],
  attractions = [],
  homestays = [],
  drivers = [],
  hubs = [],
  routes = [],
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Continuous rotating placeholder interval (every 2.5 seconds)
  useEffect(() => {
    if (prefersReducedMotion || searchQuery) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, searchQuery]);

  const searchSources: SearchDataSources = useMemo(() => ({
    destinations,
    attractions,
    homestays,
    drivers,
    hubs,
    routes
  }), [destinations, attractions, homestays, drivers, hubs, routes]);

  // Click Outside Listener for Search Suggestions Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsInputFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Inline Suggestions for the search input
  const liveSuggestions = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return [];

    const existingDestNames = new Set(destinations.map(d => (d.name || '').toLowerCase()));

    const allEntities = [
      ...HIMALAYAN_PLACES.map(p => ({
        id: p.id,
        icon: '📍',
        title: p.name,
        category: p.type === 'village' ? 'Village' : p.type === 'town' ? 'Hill Town' : p.type === 'district' ? 'District' : 'Destination',
        subtitle: `${p.district} District, ${p.state}`,
        url: `#/destinations?q=${encodeURIComponent(p.name)}`,
        searchable: `${p.name} ${p.district} ${p.state} ${(p.aliases || []).join(' ')} ${p.type} place village town destination`
      })),
      ...destinations.filter(d => !existingDestNames.has((d.name || '').toLowerCase())).map(d => ({
        id: d.id,
        icon: '📍',
        title: d.name,
        category: 'Destination',
        subtitle: d.district ? `${d.district}, ${d.state || 'India'}` : (d.state || 'India'),
        url: `#/destinations/${d.id}`,
        searchable: `${d.name} ${d.district} ${d.state} destination`
      })),
      ...attractions.map(a => ({
        id: a.id,
        icon: '🏔',
        title: a.name,
        category: 'Attraction',
        subtitle: a.district ? `📍 ${a.district}` : 'Sightseeing Spot',
        url: `/attraction/${getItemSlug(a)}`,
        searchable: `${a.name} ${a.district} attraction`
      })),
      ...homestays.map(h => ({
        id: h.id,
        icon: '🏡',
        title: h.name,
        category: 'Homestay',
        subtitle: h.address ? `📍 ${h.address}` : 'Local Stay',
        url: `#/homestay/${h.id}`,
        searchable: `${h.name} ${h.address} homestay stay`
      })),
      ...routes.map(r => ({
        id: r.id,
        icon: '🛣',
        title: (r.path || []).join(' → ') || 'Scenic Route',
        category: 'Route',
        subtitle: 'Unforgettable Journey',
        url: `#/journeys/${r.slug || r.id}`,
        searchable: `${(r.path || []).join(' ')} route journey`
      }))
    ];

    const ranked = rankSearchEntities(
      query,
      allEntities,
      (item) => ({
        name: item.title,
        type: item.category,
        description: item.subtitle,
        tags: [item.searchable]
      })
    );

    // Give place names higher score when typing
    const boosted = ranked.map(r => {
      let finalScore = r.score;
      if (r.item.category === 'Destination' || r.item.category === 'Village' || r.item.category === 'Hill Town' || r.item.category === 'District') {
        finalScore += 35;
      }
      return { ...r.item, score: finalScore };
    });

    boosted.sort((a, b) => b.score - a.score);
    return boosted.slice(0, 6);
  }, [searchQuery, destinations, attractions, homestays, routes]);

  const handleSelectSuggestion = (item: any) => {
    setIsInputFocused(false);
    if (item.url) {
      if (item.url.startsWith('#')) {
        window.location.hash = item.url.replace('#', '');
      } else {
        navigate(item.url);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsInputFocused(false);
    setIsSearching(true);

    navigate(`/search?q=${encodeURIComponent(trimmed)}`);

    setTimeout(() => {
      setIsSearching(false);
    }, 400);
  };

  const HERO_POSTER_640 = 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png';
  const HERO_POSTER_1280 = 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png';

  const getPosterImg = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return HERO_POSTER_640;
    }
    return HERO_POSTER_1280;
  };

  const [posterImg, setPosterImg] = useState(getPosterImg);

  useEffect(() => {
    const handleResize = () => setPosterImg(getPosterImg());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleScrollToExplore = () => {
    const popularSection = document.getElementById('popular-destinations') || document.getElementById('destinations');
    if (popularSection) {
      popularSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    }
  };

  return (
    <header
      className="relative w-full h-[600px] sm:h-[640px] lg:h-[680px] flex flex-col justify-center items-center text-white select-none overflow-hidden px-4 sm:px-6"
      role="banner"
      aria-label="HillyTrip Travel Platform Hero"
    >
      {/* Universal Search Modal */}
      <UniversalHeroSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        navigate={navigate}
        sources={searchSources}
      />

      {/* 1. CINEMATIC FULL-SCREEN BACKGROUND VIDEO WITH SUBTLE 20-25% OVERLAY */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={posterImg}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover filter brightness-[0.98] contrast-[1.02] scale-105"
          >
            <source src="https://cdn.coverr.co/videos/coverr-flying-over-mountains-5231/1080p.mp4" type="video/mp4" />
            <source src="https://videos.pexels.com/video-files/3205634/3205634-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center filter brightness-[0.98]"
            style={{ backgroundImage: `url('${posterImg}')` }}
          />
        )}

        {/* ~20–25% Light Overlay so Himalayan Snow & Mountain Details Stand Out Brightly */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/15 to-slate-950/35 pointer-events-none" />
      </div>

      {/* 2. HERO CONTENT CONTAINER (UNCLUTTERED, SPACIOUS & CENTERED) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center pt-12 sm:pt-16">
        
        {/* MAIN HEADLINE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-['Plus_Jakarta_Sans'] font-black text-4xl sm:text-5xl md:text-6xl lg:text-[70px] tracking-tight text-white mb-3 sm:mb-4 lg:whitespace-nowrap leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
        >
          Go Beyond the <span className="text-amber-400 font-black">Map.</span>
        </motion.h1>

        {/* SUPPORTING TEXT */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-['Manrope'] font-normal text-slate-100 text-sm sm:text-base md:text-lg max-w-[650px] mb-6 sm:mb-8 leading-relaxed tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] px-2"
        >
          Discover hidden places, local stays and unforgettable journeys across the mountains.
        </motion.p>

        {/* PRIMARY SEARCH BAR */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[640px] relative mb-3 sm:mb-4"
          ref={searchBarRef}
        >
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <div className="relative flex items-center w-full h-14 sm:h-16 p-1.5 sm:p-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_16px_48px_rgba(0,0,0,0.5)] border border-white/50 transition-all duration-300 focus-within:ring-2 focus-within:ring-amber-400">
              <div className="pl-3 sm:pl-4 text-amber-500 shrink-0 flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-500/20" />
              </div>
              <div className="relative flex-1 flex items-center h-full min-w-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsInputFocused(true);
                  }}
                  onFocus={() => setIsInputFocused(true)}
                  aria-label="Search destinations, homestays, or attractions"
                  className="w-full h-full bg-transparent border-none py-2 px-1.5 sm:px-3 text-xs sm:text-base md:text-lg font-semibold text-slate-900 focus:outline-none font-sans relative z-10"
                />
                {!searchQuery && (
                  <div className="absolute inset-0 pointer-events-none flex items-center px-1.5 sm:px-3 overflow-hidden text-xs sm:text-base md:text-lg font-semibold text-slate-400 font-sans z-20 select-none">
                    {prefersReducedMotion ? (
                      <span className="truncate">{ROTATING_PHRASES[0]}</span>
                    ) : (
                      <div className="relative w-full h-full flex items-center overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={placeholderIndex}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="absolute inset-y-0 left-0 flex items-center truncate text-slate-400 font-semibold"
                          >
                            {ROTATING_PHRASES[placeholderIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                aria-label="Search"
                className="h-full px-3.5 sm:px-8 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm sm:text-base tracking-wide transition-all duration-200 cursor-pointer shrink-0 shadow-md shadow-amber-500/35 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 animate-spin" />
                    <span className="hidden sm:inline">Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.5]" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </button>
            </div>

            {/* LIVE SUGGESTIONS DROPDOWN */}
            {isInputFocused && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 right-0 mt-3 z-50 rounded-2xl bg-slate-950/95 border border-white/20 backdrop-blur-xl p-3 sm:p-4 text-left shadow-2xl flex flex-col gap-2"
                >
                  {liveSuggestions.length > 0 ? (
                    liveSuggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSuggestion(item)}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-xs text-slate-300">{item.subtitle}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                          Explore <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    ))
                  ) : (
                    <div 
                      onClick={() => {
                        setIsInputFocused(false);
                        setIsSearchModalOpen(true);
                      }}
                      className="p-3 text-center text-sm text-slate-300 hover:text-white cursor-pointer font-medium"
                    >
                      Search for destinations, hidden gems, stays and routes →
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </form>
        </motion.div>

        {/* SECONDARY LOCATION / CONTEXT TEXT */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-xs sm:text-sm font-medium text-slate-200/90 tracking-wide mb-3.5 sm:mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
        >
          Starting in <span className="text-amber-300 font-semibold">North Bengal &amp; Sikkim</span>
        </motion.p>

        {/* SECONDARY CTA - SUBTLE TEXT LINK */}
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          type="button"
          onClick={handleScrollToExplore}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-200 hover:text-amber-300 transition-colors group cursor-pointer drop-shadow-md py-0.5 px-2 rounded-full hover:bg-white/10"
        >
          <span>Explore HillyTrip</span>
          <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
        </motion.button>

      </div>
    </header>
  );
};

export default HillyTripHeroSection;
