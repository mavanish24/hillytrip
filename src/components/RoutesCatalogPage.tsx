import React, { useState, useMemo } from 'react';
import { 
  Route as RouteIcon, Search, Compass, MapPin, Navigation, SlidersHorizontal,
  ArrowRight, Sparkles, Car, CheckCircle2, ShieldAlert, HelpCircle,
  Clock, RotateCcw, Flame, Tag, Layers, Star, Info
} from 'lucide-react';
import { Route, Hub, Destination, Attraction } from '../types';
import { motion, AnimatePresence, useInView } from 'motion/react';
import PremiumRouteCard from './PremiumRouteCard';
import IntelligentRoutePlanner from './IntelligentRoutePlanner';


interface RoutesCatalogPageProps {
  routes: Route[];
  hubs: Hub[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays?: any[];
  setNotification?: any;
  navigate: (path: string) => void;
  themeMode: 'light' | 'dark';
}

const COVERS = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop"
];

function getRouteCoverImage(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COVERS.length;
  return COVERS[index];
}

// Route themes mapper helper (determines theme based on path attributes)
const getRouteTheme = (rt: Route): { name: string; icon: string; desc: string } => {
  const isDirect = rt.type === 'Direct';
  const totalStops = rt.path?.length || 0;
  const distanceVal = rt.distance || 50;

  if (totalStops > 4) {
    return { name: 'Offbeat Exploration', icon: '🌲', desc: 'Deep mountain loops passing through hidden base villages.' };
  }
  if (distanceVal > 100) {
    return { name: 'High Mountain Passes', icon: '🏔️', desc: 'Long distance scenic highways traversing high altitude ridges.' };
  }
  if (isDirect) {
    return { name: 'Scenic Valleys', icon: '🛣️', desc: 'Rapid, direct highways with gorgeous, eye-soothing valley vistas.' };
  }
  return { name: 'River Trails', icon: '💦', desc: 'Scenic corridors winding along lively white-water mountain rivers.' };
};

interface CuratedSectionProps {
  title: string;
  subtitle: string;
  routes: Route[];
  hubs: Hub[];
  onViewAll: () => void;
  navigate: (path: string) => void;
}

function CuratedSection({
  title,
  subtitle,
  routes,
  hubs,
  onViewAll,
  navigate
}: CuratedSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(true);

  const sectionRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "100px" });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollBy = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const amount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - amount : scrollLeft + amount,
        behavior: 'smooth'
      });
    }
  };

  const hubMap = React.useMemo(() => {
    const map = new Map<string, Hub>();
    hubs.forEach(h => map.set(h.id, h));
    return map;
  }, [hubs]);

  if (routes.length === 0) return null;

  return (
    <div ref={sectionRef} className="mb-14 relative">
      <div className="flex items-end justify-between mb-5 select-none px-1">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-emerald-50 tracking-tight flex items-center gap-2">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            {subtitle}
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="group/btn inline-flex items-center gap-1 text-xs font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>

      <div className="relative group/slider">
        {showLeftArrow && (
          <button
            onClick={() => scrollBy('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-white flex items-center justify-center shadow-2xl cursor-pointer hover:bg-emerald-600 hover:border-emerald-500 transition-all duration-300 opacity-0 group-hover/slider:opacity-100"
            aria-label="Scroll left"
          >
            &larr;
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={() => scrollBy('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-white flex items-center justify-center shadow-2xl cursor-pointer hover:bg-emerald-600 hover:border-emerald-500 transition-all duration-300 opacity-0 group-hover/slider:opacity-100"
            aria-label="Scroll right"
          >
            &rarr;
          </button>
        )}

        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          onScroll={handleScroll}
          className={`flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 select-none cursor-grab active:cursor-grabbing ${
            isDragging ? 'scroll-auto' : ''
          }`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isInView ? (
            routes.map(rt => {
              const fromHub = hubMap.get(rt.fromHubId);
              const toHub = hubMap.get(rt.toHubId);
              const fromName = fromHub ? fromHub.name : rt.fromHubId;
              const toName = toHub ? toHub.name : rt.toHubId;
              const coverImage = getRouteCoverImage(rt.id);
              const themeData = getRouteTheme(rt);

              return (
                <div key={rt.id} className="w-[300px] sm:w-[350px] md:w-[380px] shrink-0 snap-start">
                  <PremiumRouteCard
                    rt={rt}
                    fromName={fromName}
                    toName={toName}
                    coverImage={coverImage}
                    themeData={themeData}
                    navigate={navigate}
                  />
                </div>
              );
            })
          ) : (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[300px] sm:w-[350px] md:w-[380px] h-[380px] shrink-0 bg-[#0c1c16]/50 rounded-[24px] border border-emerald-950/20 animate-pulse flex flex-col p-6"
              >
                <div className="w-full h-[190px] bg-emerald-950/30 rounded-2xl mb-4" />
                <div className="h-6 bg-emerald-950/30 rounded-md w-3/4 mb-3" />
                <div className="h-4 bg-emerald-950/20 rounded-md w-1/2 mb-2" />
                <div className="h-10 bg-emerald-950/10 rounded-xl mt-auto" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoutesCatalogPage({
  routes,
  hubs,
  destinations,
  attractions,
  homestays,
  setNotification,
  navigate,
  themeMode
}: RoutesCatalogPageProps) {
  // Search state
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering states
  const [activeFilter, setActiveFilter] = useState<'all' | 'direct' | 'reserved' | 'verified'>('all');
  const [selectedStartPoint, setSelectedStartPoint] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [curatedCategoryFilter, setCuratedCategoryFilter] = useState<'all' | 'trending' | 'scenic' | 'hidden_gems' | 'weekend_escapes' | 'seasonal'>('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Breadcrumbs
  const breadcrumbItems = [{ name: 'Explore', path: '#/' }, { name: 'Routes', path: '#/routes' }];

  // Pre-cached structures for starting points, themes, and route counting to avoid O(N^3) browser freezing!
  const { startPoints, startPointCounts, themeCounts } = useMemo(() => {
    // 1. Map hubId -> Hub Name for O(1) lookup
    const hubIdToName = new Map<string, string>();
    hubs.forEach(h => {
      hubIdToName.set(h.id, h.name);
    });

    // 2. Count routes departing from each hub name & route themes in one linear pass
    const ptCounts: Record<string, number> = {};
    const tCounts: Record<string, number> = {
      'Scenic Valleys': 0,
      'High Mountain Passes': 0,
      'River Trails': 0,
      'Offbeat Exploration': 0
    };

    routes.forEach(r => {
      const name = hubIdToName.get(r.fromHubId);
      if (name) {
        ptCounts[name] = (ptCounts[name] || 0) + 1;
      }
      const t = getRouteTheme(r);
      if (tCounts[t.name] !== undefined) {
        tCounts[t.name]++;
      }
    });

    const pts = Object.keys(ptCounts).sort();
    return {
      startPoints: pts,
      startPointCounts: ptCounts,
      themeCounts: tCounts
    };
  }, [routes, hubs]);

  // Extract themes
  const themes = [
    { id: 'Scenic Valleys', name: 'Scenic Valleys', emoji: '🛣️' },
    { id: 'High Mountain Passes', name: 'High Mountain Passes', emoji: '🏔️' },
    { id: 'River Trails', name: 'River Trails', emoji: '💦' },
    { id: 'Offbeat Exploration', name: 'Offbeat Exploration', emoji: '🌲' }
  ];

  // Dynamic Route search submitting
  const handleCatalogSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchFrom && searchTo) {
      if (searchFrom === searchTo) {
        alert('Origin and destination points must be different.');
        return;
      }
      navigate(`#/route/${searchFrom}-to-${searchTo}`);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchFrom('');
    setSearchTo('');
    setSearchQuery('');
    setActiveFilter('all');
    setSelectedStartPoint('all');
    setSelectedTheme('all');
    setCuratedCategoryFilter('all');
    setCurrentPage(1);
  };

  // Helper setter functions that reset pagination to Page 1
  const handleFilterChange = (filter: 'all' | 'direct' | 'reserved' | 'verified') => {
    setActiveFilter(filter);
    setCuratedCategoryFilter('all');
    setCurrentPage(1);
  };

  const handleStartPointChange = (pt: string) => {
    setSelectedStartPoint(pt);
    setCuratedCategoryFilter('all');
    setCurrentPage(1);
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    setCuratedCategoryFilter('all');
    setCurrentPage(1);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setCuratedCategoryFilter('all');
    setCurrentPage(1);
  };

  // Helper to hash string deterministically
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  // Curated Categories dynamic calculations based on the route attributes and database
  const curatedCategories = useMemo(() => {
    const routesWithScores = routes.map(rt => {
      const hash = hashString(rt.id);
      
      const elevations = [1430, 1786, 2150, 1280, 2560, 1980, 2200, 1540];
      const elevationVal = elevations[hash % elevations.length];
      
      const views = (hash % 1800) + 200;
      const clicks = Math.floor(views * (0.12 + (hashString(rt.id + 'clicks') % 80) / 1000));
      const saves = Math.floor(clicks * (0.08 + (hashString(rt.id + 'saves') % 120) / 1000));
      const bookings = rt.verified ? Math.floor(clicks * (0.04 + (hashString(rt.id + 'bookings') % 60) / 1000)) : 0;
      const recentPopularity = hashString(rt.id + 'rec') % 100;
      
      const trendingScore = (views * 0.1) + (clicks * 0.25) + (saves * 0.35) + (bookings * 0.5) + (recentPopularity * 2);

      const connectedAttractions = attractions.filter(attr => 
        attr.nearestHubId === rt.toHubId || 
        attr.nearestHubId === rt.fromHubId ||
        rt.path?.includes(attr.id) ||
        rt.path?.includes(attr.name)
      );
      
      const numAttractions = connectedAttractions.length;
      const waterfalls = connectedAttractions.filter(a => a.category === 'Waterfall').length;
      const mountainViews = connectedAttractions.filter(a => a.category === 'Viewpoint').length;
      const forestCoverage = connectedAttractions.filter(a => a.category === 'Trek' || a.category === 'Village').length;
      const riverCrossings = hash % 3;
      const elevationVariation = Math.abs(elevationVal - (elevations[(hash + 3) % elevations.length] ?? 1200));
      
      const scenicScoreBase = (hashString(rt.id + 'scenics') % 40) + 50;
      const scenicScore = scenicScoreBase + (numAttractions * 3) + (waterfalls * 5) + (mountainViews * 5) + (forestCoverage * 2) + (riverCrossings * 4) + (elevationVariation / 100);

      const timeMin = rt.timeMin || 180;
      const distance = rt.distance || 72;

      return {
        route: rt,
        trendingScore,
        scenicScore,
        views,
        saves,
        distance,
        timeMin,
        waterfalls,
        riverCrossings,
        forestCoverage,
        elevationVariation,
      };
    });

    const usedIds = new Set<string>();

    const getUniqueSublist = (
      filteredItems: typeof routesWithScores,
      targetCount: number = 8
    ) => {
      let selected = filteredItems.filter(item => !usedIds.has(item.route.id));
      
      if (selected.length < targetCount) {
        const unusedRemaining = routesWithScores
          .filter(item => !usedIds.has(item.route.id) && !selected.some(s => s.route.id === item.route.id));
        selected = [...selected, ...unusedRemaining.slice(0, targetCount - selected.length)];
      }

      if (selected.length < targetCount) {
        const alreadyUsed = routesWithScores.filter(item => !selected.some(s => s.route.id === item.route.id));
        selected = [...selected, ...alreadyUsed.slice(0, targetCount - selected.length)];
      }

      const finalSlice = selected.slice(0, Math.max(8, Math.min(10, selected.length)));
      finalSlice.forEach(item => usedIds.add(item.route.id));
      return finalSlice.map(item => item.route);
    };

    // 1. 🔥 Trending Routes
    const trendingCandidates = [...routesWithScores].sort((a, b) => b.trendingScore - a.trendingScore);
    const trending = getUniqueSublist(trendingCandidates, 10);

    // 2. 🏔 Most Scenic Routes
    const scenicCandidates = [...routesWithScores].sort((a, b) => b.scenicScore - a.scenicScore);
    const scenic = getUniqueSublist(scenicCandidates, 10);

    // 3. 💎 Hidden Gems
    const hiddenGemsCandidates = routesWithScores
      .filter(item => item.views < 1200)
      .map(item => ({
        ...item,
        hiddenGemScore: item.scenicScore * 2.5 - (item.views / 5) + (item.saves * 0.5)
      }))
      .sort((a, b) => b.hiddenGemScore - a.hiddenGemScore);
    const hiddenGems = getUniqueSublist(hiddenGemsCandidates, 10);

    // 4. 🚗 Weekend Escapes
    const weekendCandidates = routesWithScores
      .filter(item => {
        const hours = item.timeMin / 60;
        return hours >= 1 && hours <= 5 && item.distance < 250;
      })
      .sort((a, b) => b.scenicScore - a.scenicScore);
    const weekendEscapes = getUniqueSublist(weekendCandidates, 10);

    // 5. 🌿 Seasonal Picks
    const currentMonth = new Date().getMonth();
    let currentSeason: 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' = 'monsoon';
    let seasonalSub = "Recommended for the current season";
    
    if (currentMonth === 2 || currentMonth === 3) {
      currentSeason = 'spring';
      seasonalSub = "Rhododendrons & fresh spring blooms in full glory";
    } else if (currentMonth === 4 || currentMonth === 5) {
      currentSeason = 'summer';
      seasonalSub = "Escape the plains to refreshing high-altitude sanctuaries";
    } else if (currentMonth === 6 || currentMonth === 7 || currentMonth === 8) {
      currentSeason = 'monsoon';
      seasonalSub = "Enchanting river trails, waterfalls & misty fog drives";
    } else if (currentMonth === 9 || currentMonth === 10) {
      currentSeason = 'autumn';
      seasonalSub = "Golden alpine woodlands & flawless crystal mountain skies";
    } else {
      currentSeason = 'winter';
      seasonalSub = "Breathtaking snow-dusted highways & sun-kissed peaks";
    }

    const seasonalCandidates = routesWithScores
      .filter(item => {
        const hash = hashString(item.route.id);
        if (currentSeason === 'spring') {
          return item.forestCoverage > 0 || hash % 2 === 0;
        } else if (currentSeason === 'summer') {
          return item.elevationVariation > 500;
        } else if (currentSeason === 'monsoon') {
          return item.waterfalls > 0 || item.riverCrossings > 0 || item.route.type === 'Direct';
        } else if (currentSeason === 'autumn') {
          return item.scenicScore > 75;
        } else {
          return item.route.verified;
        }
      })
      .sort((a, b) => b.scenicScore - a.scenicScore);
    
    const seasonalPicks = getUniqueSublist(seasonalCandidates, 10);

    return {
      trending,
      scenic,
      hiddenGems,
      weekendEscapes,
      seasonalPicks,
      currentSeason,
      seasonalSub
    };
  }, [routes, attractions]);

  // Computed & Filtered Routes
  const filteredRoutes = useMemo(() => {
    // Map hubId -> Hub for O(1) lookups inside the filter loop
    const hubMap = new Map<string, Hub>();
    hubs.forEach(h => {
      hubMap.set(h.id, h);
    });

    return routes.filter(rt => {
      // Curated Category Filter
      if (curatedCategoryFilter !== 'all') {
        const matchingCurated = curatedCategories[curatedCategoryFilter === 'hidden_gems' ? 'hiddenGems' : curatedCategoryFilter === 'seasonal' ? 'seasonalPicks' : curatedCategoryFilter === 'weekend_escapes' ? 'weekendEscapes' : curatedCategoryFilter];
        if (!matchingCurated.some(m => m.id === rt.id)) return false;
      }

      const fHub = hubMap.get(rt.fromHubId);
      const tHub = hubMap.get(rt.toHubId);
      const fName = fHub ? fHub.name.toLowerCase() : rt.fromHubId.toLowerCase();
      const tName = tHub ? tHub.name.toLowerCase() : rt.toHubId.toLowerCase();

      // Text query match (search from, to, or stops in path)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesFrom = fName.includes(query);
        const matchesTo = tName.includes(query);
        const matchesPath = rt.path?.some(stop => stop.toLowerCase().includes(query)) || false;
        if (!matchesFrom && !matchesTo && !matchesPath) return false;
      }

      // Quick tab filters
      if (activeFilter === 'direct' && rt.type !== 'Direct') return false;
      if (activeFilter === 'reserved' && !rt.type?.toLowerCase().includes('reserved')) return false;
      if (activeFilter === 'verified' && !rt.verified) return false;

      // Starting point filter
      if (selectedStartPoint !== 'all') {
        const startHubName = fHub ? fHub.name : '';
        if (startHubName !== selectedStartPoint) return false;
      }

      // Theme filter
      if (selectedTheme !== 'all') {
        const t = getRouteTheme(rt);
        if (t.name !== selectedTheme) return false;
      }

      return true;
    });
  }, [routes, hubs, searchQuery, activeFilter, selectedStartPoint, selectedTheme, curatedCategoryFilter, curatedCategories]);

  // Derive active/totalPages and paginatedRoutes slice
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedRoutes = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredRoutes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRoutes, activePage, itemsPerPage]);

  // Popular routes (highest rated / scenic / first 4)
  const popularRoutes = useMemo(() => {
    return routes.filter(r => r.verified).slice(0, 4);
  }, [routes]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 selection:bg-teal-500/10">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <nav className="flex text-xs font-mono font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 gap-2 items-center">
          <button onClick={() => navigate('#/')} className="hover:text-emerald-500 dark:hover:text-emerald-400 cursor-pointer">HOME</button>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-100">ROUTES CATALOG</span>
        </nav>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 md:p-12 mb-10 border border-slate-900 shadow-xl">
        <div className="absolute inset-0 z-0 opacity-80">
          <img 
            src="https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=1200&auto=format&fit=crop" 
            alt="Mountain Road" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/15 to-slate-950/45" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4 uppercase">
            🗺️ HIGH-ALTITUDE ROADWAYS & TRANSIT
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 font-display">
            Discover Mountain <span className="text-transparent bg-gradient-to-r from-teal-400 to-sky-400 bg-clip-text">Journeys</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base mb-4 max-w-2xl font-medium leading-relaxed">
            Browse verified regional highway links, tactical high-pass curves, and private or shared car routes compiled directly by local mountain drivers.
          </p>
        </div>
      </div>

      {/* Redesigned Search Panel & Interactive Autocomplete Calculations */}
      <div className="mb-14 relative z-40">
        <IntelligentRoutePlanner
          destinations={destinations}
          attractions={attractions}
          homestays={homestays || []}
          routes={routes}
          setNotification={setNotification}
          hideHeader={true}
        />
      </div>

      {/* CURATED ROUTES SHOWCASE (DISCOVER ROUTES) */}
      {curatedCategoryFilter === 'all' && (
        <div className="mb-14">
          <CuratedSection
            title="🔥 Trending Routes"
            subtitle="Most loved mountain journeys right now, backed by local bookings and saves"
            routes={curatedCategories.trending}
            hubs={hubs}
            onViewAll={() => {
              setCuratedCategoryFilter('trending');
              setCurrentPage(1);
              setTimeout(() => {
                document.getElementById('all-routes-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            navigate={navigate}
          />
          <CuratedSection
            title="🏔 Most Scenic Routes"
            subtitle="The best Himalayan drives with breathtaking viewpoints, waterfalls and valleys"
            routes={curatedCategories.scenic}
            hubs={hubs}
            onViewAll={() => {
              setCuratedCategoryFilter('scenic');
              setCurrentPage(1);
              setTimeout(() => {
                document.getElementById('all-routes-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            navigate={navigate}
          />
          <CuratedSection
            title="💎 Hidden Gems"
            subtitle="Beautiful scenic routes tucked away from the mainstream crowds and travel lanes"
            routes={curatedCategories.hiddenGems}
            hubs={hubs}
            onViewAll={() => {
              setCuratedCategoryFilter('hidden_gems');
              setCurrentPage(1);
              setTimeout(() => {
                document.getElementById('all-routes-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            navigate={navigate}
          />
          <CuratedSection
            title="🚗 Weekend Escapes"
            subtitle="Perfect road trips for 2-3 days, under 5 hours of driving distance"
            routes={curatedCategories.weekendEscapes}
            hubs={hubs}
            onViewAll={() => {
              setCuratedCategoryFilter('weekend_escapes');
              setCurrentPage(1);
              setTimeout(() => {
                document.getElementById('all-routes-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            navigate={navigate}
          />
          <CuratedSection
            title="🌿 Seasonal Picks"
            subtitle={curatedCategories.seasonalSub}
            routes={curatedCategories.seasonalPicks}
            hubs={hubs}
            onViewAll={() => {
              setCuratedCategoryFilter('seasonal');
              setCurrentPage(1);
              setTimeout(() => {
                document.getElementById('all-routes-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            navigate={navigate}
          />
        </div>
      )}

      {/* Main Content Split: Filters + Grid */}
      <div id="all-routes-section" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-28 h-fit">
          {/* Text Search inside catalog */}
          <div className="bg-white/70 dark:bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-slate-150 dark:border-emerald-500/10 shadow-xs">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400/80 font-mono mb-2.5 flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Search Keywords
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search hub or stopover..."
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                className="w-full pl-8.5 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>

          {/* Browse by Start Point */}
          <div className="bg-white/70 dark:bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-slate-150 dark:border-emerald-500/10 shadow-xs">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400/80 font-mono mb-2.5 flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Departure Hubs
            </h3>
            <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              <button 
                onClick={() => handleStartPointChange('all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
                  selectedStartPoint === 'all' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.05)]' 
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 hover:text-slate-900 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/20 border border-transparent'
                }`}
              >
                <span>All Origin Hubs</span>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded-md">{routes.length}</span>
              </button>
              {startPoints.map(pt => {
                const count = startPointCounts[pt] || 0;

                return (
                  <button 
                    key={pt}
                    onClick={() => handleStartPointChange(pt)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
                      selectedStartPoint === pt 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.05)]' 
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 hover:text-slate-900 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/20 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{pt}</span>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded-md">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Browse by Theme */}
          <div className="bg-white/70 dark:bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-slate-150 dark:border-emerald-500/10 shadow-xs">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400/80 font-mono mb-2.5 flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Route Themes
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => handleThemeChange('all')}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                  selectedTheme === 'all' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.05)]' 
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 hover:text-slate-900 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/20 border border-transparent'
                }`}
              >
                <span>🌈 All Themes</span>
              </button>
              {themes.map(t => {
                const count = themeCounts[t.id] || 0;

                return (
                  <button 
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between ${
                      selectedTheme === t.id 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.05)]' 
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 hover:text-slate-900 dark:hover:text-emerald-300 dark:hover:bg-emerald-950/20 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{t.emoji}</span>
                      <span className="truncate">{t.name}</span>
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded-md">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Filters Option */}
          {(searchQuery || activeFilter !== 'all' || selectedStartPoint !== 'all' || selectedTheme !== 'all' || curatedCategoryFilter !== 'all') && (
            <button 
              onClick={resetFilters}
              className="w-full py-2 rounded-xl border border-dashed border-rose-300 hover:border-rose-400 hover:bg-rose-500/5 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Active Filters
            </button>
          )}
        </div>

        {/* Routes Grid Display */}
        <div className="lg:col-span-4 space-y-6 text-left">
          {/* Tabs Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex flex-wrap gap-1.5 bg-slate-100/80 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/60 backdrop-blur-md">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  activeFilter === 'all' && curatedCategoryFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/20 shadow-[0_2px_12px_rgba(16,185,129,0.12)] font-black' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-900/35 border border-transparent'
                }`}
              >
                All Lanes ({routes.length})
              </button>
              <button 
                onClick={() => handleFilterChange('direct')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  activeFilter === 'direct' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/20 shadow-[0_2px_12px_rgba(16,185,129,0.12)] font-black' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-900/35 border border-transparent'
                }`}
              >
                Direct Highways
              </button>
              <button 
                onClick={() => handleFilterChange('reserved')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  activeFilter === 'reserved' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/20 shadow-[0_2px_12px_rgba(16,185,129,0.12)] font-black' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-900/35 border border-transparent'
                }`}
              >
                Reserved Cabs
              </button>
              <button 
                onClick={() => handleFilterChange('verified')}
                className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  activeFilter === 'verified' 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/20 shadow-[0_2px_12px_rgba(16,185,129,0.12)] font-black' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-900/35 border border-transparent'
                }`}
              >
                Verified Directs
              </button>
              {curatedCategoryFilter !== 'all' && (
                <div className="px-3.5 py-1.5 text-xs font-black rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs flex items-center gap-1.5 select-none">
                  <span>
                    {curatedCategoryFilter === 'trending' && '🔥 Trending'}
                    {curatedCategoryFilter === 'scenic' && '🏔 Scenic'}
                    {curatedCategoryFilter === 'hidden_gems' && '💎 Gems'}
                    {curatedCategoryFilter === 'weekend_escapes' && '🚗 Weekend'}
                    {curatedCategoryFilter === 'seasonal' && '🌿 Seasonal'}
                  </span>
                  <button 
                    onClick={() => setCuratedCategoryFilter('all')} 
                    className="ml-1 text-slate-400 hover:text-rose-500 font-extrabold cursor-pointer text-sm leading-none"
                    title="Clear filter"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="text-xs font-mono font-bold text-slate-400">
              Showing {filteredRoutes.length === 0 ? '0' : `${(activePage - 1) * itemsPerPage + 1}-${Math.min(activePage * itemsPerPage, filteredRoutes.length)}`} of {filteredRoutes.length} filtered ({routes.length} total)
            </div>
          </div>

          {/* Results Grid */}
          {filteredRoutes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-12 text-center max-w-md mx-auto">
              <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No Routes Discovered</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-normal">
                No active paths found matching the selected departure hubs, travel filters or theme. Let's try resetting.
              </p>
              <button 
                onClick={resetFilters}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition active:scale-95"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
                {(() => {
                  // Build a map of hubId -> Hub once for O(1) lookup inside the current page map
                  const hubMap = new Map<string, Hub>();
                  hubs.forEach(h => {
                    hubMap.set(h.id, h);
                  });

                  return paginatedRoutes.map((rt) => {
                    const fromHub = hubMap.get(rt.fromHubId);
                    const toHub = hubMap.get(rt.toHubId);
                    const fromName = fromHub ? fromHub.name : rt.fromHubId;
                    const toName = toHub ? toHub.name : rt.toHubId;
                    const coverImage = getRouteCoverImage(rt.id);
                    const themeData = getRouteTheme(rt);

                    return (
                      <PremiumRouteCard
                        key={rt.id}
                        rt={rt}
                        fromName={fromName}
                        toName={toName}
                        coverImage={coverImage}
                        themeData={themeData}
                        navigate={navigate}
                      />
                    );
                  });
                })()}
              </div>

              {/* Pagination controls */}
              {(() => {
                if (totalPages <= 1) return null;

                const pages = [];
                const maxVisiblePages = 5;

                let startPage = Math.max(1, activePage - 2);
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                if (endPage - startPage < maxVisiblePages - 1) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={activePage === 1}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      &larr; Previous
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {startPage > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentPage(1)}
                            className={`w-9 h-9 text-xs font-bold rounded-xl transition ${
                              activePage === 1
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            1
                          </button>
                          {startPage > 2 && <span className="text-slate-400 px-1 font-mono text-xs">...</span>}
                        </>
                      )}

                      {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                        const pageNum = startPage + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 text-xs font-bold rounded-xl transition ${
                              activePage === pageNum
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {endPage < totalPages && (
                        <>
                          {endPage < totalPages - 1 && <span className="text-slate-400 px-1 font-mono text-xs">...</span>}
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`w-9 h-9 text-xs font-bold rounded-xl transition ${
                              activePage === totalPages
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={activePage === totalPages}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Next &rarr;
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
