// src/components/RoutesCatalogPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Compass, MapPin, Navigation, ArrowRight, Sparkles, Car, CheckCircle2,
  ArrowUpDown, ChevronDown, ChevronRight, Mountain, Calendar, Users, Heart, Camera, Droplets,
  Leaf, Snowflake, Train, Star, Shield, DollarSign, Sunrise, Eye, Building2,
  Sparkle, Map as MapIcon, HelpCircle, Check, X, RotateCw, GitFork, Network,
  Layers, Clock, Sliders, Zap, ArrowRightLeft, Radio, Route as RouteIcon
} from 'lucide-react';
import { Route, Hub, Destination, Attraction } from '../types';
import { toSlug } from '../utils/slug';
import { saveRecentRouteSearch } from '../utils/recentSearches';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LocationOption, 
  DEFAULT_LOCATIONS, 
  FEATURED_CIRCUITS, 
  CuratedJourney,
  LOOP_JOURNEYS,
  LoopJourney,
  JOURNEY_WEB_DATA,
  JourneyWebHub,
  GLOBAL_JOURNEY_TREE,
  TreeNode,
  WHERE_CAN_I_GO_DATA,
  ReachableDestination
} from '../data/journeysData';

interface RoutesCatalogPageProps {
  routes?: Route[];
  hubs?: Hub[];
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: any[];
  setNotification?: any;
  navigate: (path: string) => void;
  themeMode?: 'light' | 'dark';
}

// ----------------------------------------------------
// Searchable Location Dropdown Component
// ----------------------------------------------------
function SearchableLocationDropdown({
  label,
  placeholder,
  value,
  onChange,
  isOpen,
  setIsOpen,
  searchQuery,
  setSearchQuery,
  options,
  icon: Icon
}: {
  label: string;
  placeholder: string;
  value: LocationOption | null;
  onChange: (loc: LocationOption) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  options: LocationOption[];
  icon: React.ComponentType<{ className?: string }>;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      opt => opt.name.toLowerCase().includes(q) || (opt.sub && opt.sub.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  return (
    <div className={`relative text-left w-full ${isOpen ? 'z-40' : 'z-10'}`}>
      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-slate-200/90 hover:border-emerald-500 rounded-2xl px-3.5 py-3 text-slate-900 flex items-center justify-between cursor-pointer shadow-2xs transition focus:outline-none"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="truncate">
            {value ? (
              <>
                <span className="text-xs font-bold text-slate-900 block truncate">{value.name}</span>
                {value.sub && <span className="text-[10px] font-medium text-slate-500 block truncate">{value.sub}</span>}
              </>
            ) : (
              <span className="text-xs font-medium text-slate-400">{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 space-y-1.5 max-h-64 overflow-hidden flex flex-col"
            >
              <div className="relative p-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search locations..."
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="overflow-y-auto max-h-48 space-y-0.5 pr-1 text-left">
                {filtered.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 font-medium">No locations match</div>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                        value?.id === opt.id ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{opt.name}</span>
                        {opt.sub && <span className="text-[10px] text-slate-500 block">{opt.sub}</span>}
                      </div>
                      {opt.type && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 uppercase shrink-0 ml-2">
                          {opt.type}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// Recursive Tree Item Renderer for Journey Tree
// ----------------------------------------------------
function TreeNodeView({ 
  node, 
  expandedNodes, 
  toggleNode, 
  navigate,
  level = 0 
}: { 
  node: TreeNode; 
  expandedNodes: Set<string>; 
  toggleNode: (id: string) => void; 
  navigate: (path: string) => void;
  level?: number;
}) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = Boolean(node.children && node.children.length > 0);

  return (
    <div className="space-y-1">
      <div 
        onClick={() => {
          if (hasChildren) {
            toggleNode(node.id);
          } else if (node.slug) {
            navigate(`#/journeys/${node.slug}`);
          }
        }}
        className={`group flex items-center justify-between p-3 rounded-2xl border transition duration-200 cursor-pointer ${
          node.type === 'hub'
            ? 'bg-slate-900 border-slate-800 text-white hover:border-emerald-500/50 shadow-md'
            : node.type === 'subhub'
            ? 'bg-slate-900/80 border-slate-800/80 text-emerald-300 hover:border-emerald-400/60 ml-3 sm:ml-5'
            : 'bg-slate-900/50 border-slate-800/60 text-slate-200 hover:bg-emerald-950/40 hover:border-emerald-500/40 ml-6 sm:ml-10'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {hasChildren ? (
            <button 
              type="button"
              className={`p-1 rounded-lg transition ${
                isExpanded ? 'bg-emerald-500/20 text-emerald-300 rotate-90' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          )}

          <div className="truncate">
            <span className="text-xs sm:text-sm font-extrabold tracking-tight block truncate group-hover:text-amber-300 transition">
              {node.name}
            </span>
            {(node.distanceFromParent || node.timeFromParent) && (
              <span className="text-[10px] font-mono text-slate-400 block">
                {node.distanceFromParent} • {node.timeFromParent}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {node.type === 'hub' && (
            <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Main Hub
            </span>
          )}
          {node.type === 'subhub' && (
            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/20">
              Regional Transit
            </span>
          )}
          {node.slug && (
            <span className="text-[10px] font-bold text-emerald-400 group-hover:translate-x-1 transition flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-2 sm:pl-4 border-l-2 border-emerald-500/30 space-y-1.5 my-1.5 transition-all">
          {node.children!.map((child) => (
            <TreeNodeView 
              key={child.id} 
              node={child} 
              expandedNodes={expandedNodes} 
              toggleNode={toggleNode} 
              navigate={navigate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ====================================================
// MAIN ROUTES CATALOG PAGE COMPONENT
// ====================================================
export default function RoutesCatalogPage({
  routes = [],
  hubs = [],
  destinations = [],
  navigate
}: RoutesCatalogPageProps) {

  // Combine default & database locations
  const allLocations = useMemo(() => {
    const map = new globalThis.Map<string, LocationOption>();
    DEFAULT_LOCATIONS.forEach(loc => map.set(loc.id, loc));

    (hubs || []).forEach(h => {
      if (h.id && h.name) {
        map.set(h.id.toLowerCase(), {
          id: h.id.toLowerCase(),
          name: h.name,
          sub: h.district || 'Transit Hub',
          type: 'Hub'
        });
      }
    });

    (destinations || []).forEach(d => {
      if (d.id && d.name) {
        const key = d.id.toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            name: d.name,
            sub: (d as any).subtitle || d.district || 'Destination',
            type: 'Destination'
          });
        }
      }
    });

    return Array.from(map.values());
  }, [hubs, destinations]);

  // Search State
  const [fromLocation, setFromLocation] = useState<LocationOption>(DEFAULT_LOCATIONS[0]); // Siliguri
  const [toLocation, setToLocation] = useState<LocationOption>(DEFAULT_LOCATIONS[3]);   // Gangtok
  const [isFromOpen, setIsFromOpen] = useState<boolean>(false);
  const [isToOpen, setIsToOpen] = useState<boolean>(false);
  const [fromSearchQuery, setFromSearchQuery] = useState<string>('');
  const [toSearchQuery, setToSearchQuery] = useState<string>('');

  // Parse and respect URL query parameters (?from=...&to=... or ?fromHubId=...&toHubId=...)
  useEffect(() => {
    const checkParams = () => {
      if (typeof window === 'undefined') return;

      const getQueryParam = (name: string): string | null => {
        // 1. Search in window.location.search
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has(name)) {
          const val = searchParams.get(name);
          if (val && val.trim()) return val.trim();
        }

        // 2. Search in window.location.hash (e.g. #/journeys?from=Siliguri&to=Gangtok)
        const hash = window.location.hash || '';
        const hashQIndex = hash.indexOf('?');
        if (hashQIndex !== -1) {
          const hashParams = new URLSearchParams(hash.substring(hashQIndex));
          if (hashParams.has(name)) {
            const val = hashParams.get(name);
            if (val && val.trim()) return val.trim();
          }
        }
        return null;
      };

      const qFrom = getQueryParam('from') || getQueryParam('fromHubId');
      const qTo = getQueryParam('to') || getQueryParam('toHubId');

      if (qFrom) {
        const qFromClean = qFrom.toLowerCase().trim();
        const matched = allLocations.find(loc =>
          loc.id.toLowerCase() === qFromClean ||
          toSlug(loc.name) === toSlug(qFromClean) ||
          loc.name.toLowerCase() === qFromClean ||
          loc.name.toLowerCase().includes(qFromClean) ||
          qFromClean.includes(loc.name.toLowerCase())
        );
        if (matched) {
          setFromLocation(matched);
        } else {
          setFromLocation({
            id: toSlug(qFrom),
            name: qFrom,
            type: 'Location'
          });
        }
      }

      if (qTo) {
        const qToClean = qTo.toLowerCase().trim();
        const matched = allLocations.find(loc =>
          loc.id.toLowerCase() === qToClean ||
          toSlug(loc.name) === toSlug(qToClean) ||
          loc.name.toLowerCase() === qToClean ||
          loc.name.toLowerCase().includes(qToClean) ||
          qToClean.includes(loc.name.toLowerCase())
        );
        if (matched) {
          setToLocation(matched);
        } else {
          setToLocation({
            id: toSlug(qTo),
            name: qTo,
            type: 'Location'
          });
        }
      }
    };

    checkParams();
    window.addEventListener('hashchange', checkParams);
    return () => window.removeEventListener('hashchange', checkParams);
  }, [allLocations]);

  // Compute matched route from existing verified routes
  const matchedRoute = useMemo(() => {
    if (!fromLocation || !toLocation || !routes || routes.length === 0) return null;
    const fId = (fromLocation.id || '').toLowerCase();
    const tId = (toLocation.id || '').toLowerCase();
    const fSlug = toSlug(fromLocation.name);
    const tSlug = toSlug(toLocation.name);

    return routes.find(r => {
      const rf = String(r.fromHubId || (r as any).from_taxi_stand || '').toLowerCase();
      const rt = String(r.toHubId || (r as any).to_destination || '').toLowerCase();
      return (
        ((rf === fId || toSlug(rf) === fSlug) && (rt === tId || toSlug(rt) === tSlug)) ||
        ((rf === tId || toSlug(rf) === tSlug) && (rt === fId || toSlug(rt) === fSlug))
      );
    });
  }, [fromLocation, toLocation, routes]);

  // 5. Journey Web Selected Hub
  const [selectedWebHubId, setSelectedWebHubId] = useState<string>('gangtok');

  // 6. Journey Tree Expand State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['root-siliguri', 'tree-gangtok', 'tree-darjeeling'])
  );
  const [treeSearchQuery, setTreeSearchQuery] = useState<string>('');

  // 7. Where Can I Go Selected Origin & Time Bracket
  const [selectedOriginId, setSelectedOriginId] = useState<string>('gangtok');
  const [selectedTimeBracket, setSelectedTimeBracket] = useState<string>('all');

  // 8. AI Journey Planner Modal
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [aiPlannerState, setAiPlannerState] = useState({
    startHub: 'siliguri',
    destination: '',
    duration: '1 Day',
    budget: 'Comfort',
    style: 'Scenic'
  });
  const [aiRecommendation, setAiRecommendation] = useState<CuratedJourney | null>(null);

  // Handlers
  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleFindRoute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fromSlug = toSlug(fromLocation?.name || 'siliguri');
    const toSlugVal = toSlug(toLocation?.name || 'gangtok');

    saveRecentRouteSearch(
      fromLocation?.id || 'siliguri',
      toLocation?.id || 'gangtok',
      fromLocation?.name || 'Siliguri',
      toLocation?.name || 'Gangtok'
    );

    navigate(`#/journeys/${fromSlug}-to-${toSlugVal}`);
  };

  const handleExploreJourneys = () => {
    navigate('#/journeys/explore');
  };

  const toggleTreeNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAllTreeNodes = () => {
    setExpandedNodes(new Set([
      'root-siliguri', 'tree-gangtok', 'tree-mangan', 'tree-darjeeling', 
      'tree-manebhanjan', 'tree-kalimpong', 'tree-dooars'
    ]));
  };

  const collapseAllTreeNodes = () => {
    setExpandedNodes(new Set(['root-siliguri']));
  };

  // Generate AI Recommendation
  const handleGenerateAiRecommendation = () => {
    const matched = FEATURED_CIRCUITS.find(c => 
      c.fromHubId === aiPlannerState.startHub || c.travelStyle === aiPlannerState.style
    ) || FEATURED_CIRCUITS[0];
    setAiRecommendation(matched);
  };

  // START FROM ARRIVAL HUBS (7 Hubs)
  const arrivalHubsData = [
    {
      id: 'njp',
      name: 'NJP Railway Station',
      code: 'NJP',
      journeyCount: '210 Journeys',
      image: '/images/hillytrip/taxi-transit.svg',
      slug: 'siliguri'
    },
    {
      id: 'bagdogra',
      name: 'Bagdogra Airport',
      code: 'IXB',
      journeyCount: '185 Journeys',
      image: '/images/hillytrip/taxi-transit.svg',
      slug: 'bagdogra'
    },
    {
      id: 'siliguri',
      name: 'Siliguri',
      code: 'SGL',
      journeyCount: '290 Journeys',
      image: '/images/hillytrip/north-bengal-hills.svg',
      slug: 'siliguri'
    },
    {
      id: 'gangtok',
      name: 'Gangtok',
      code: 'GTK',
      journeyCount: '284 Journeys',
      image: '/images/hillytrip/snow-mountain.svg',
      slug: 'gangtok'
    },
    {
      id: 'darjeeling',
      name: 'Darjeeling',
      code: 'DJ',
      journeyCount: '196 Journeys',
      image: '/images/hillytrip/tea-garden.svg',
      slug: 'darjeeling'
    },
    {
      id: 'kalimpong',
      name: 'Kalimpong',
      code: 'KPG',
      journeyCount: '142 Journeys',
      image: '/images/hillytrip/himalayan-landscape.svg',
      slug: 'kalimpong'
    },
    {
      id: 'mirik',
      name: 'Mirik',
      code: 'MRK',
      journeyCount: '88 Journeys',
      image: '/images/hillytrip/north-bengal-hills.svg',
      slug: 'mirik'
    }
  ];

  // Journey Web Active Hub Data
  const activeWebHub = useMemo(() => {
    return JOURNEY_WEB_DATA.find(w => w.hubId === selectedWebHubId) || JOURNEY_WEB_DATA[0];
  }, [selectedWebHubId]);

  // Reachability Active Origin Data
  const activeReachability = useMemo(() => {
    return WHERE_CAN_I_GO_DATA.find(r => r.originId === selectedOriginId) || WHERE_CAN_I_GO_DATA[0];
  }, [selectedOriginId]);

  const filteredReachabilityDestinations = useMemo(() => {
    if (selectedTimeBracket === 'all') return activeReachability.destinations;
    return activeReachability.destinations.filter(d => d.timeBracket === selectedTimeBracket);
  }, [activeReachability, selectedTimeBracket]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-24">
      
      {/* ========================================================
          1. HERO SECTION (PLAN A JOURNEY / EXPLORE JOURNEYS)
          ======================================================== */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-14 sm:py-20 border-b border-slate-800">
        
        {/* Full Panoramic Himalayan Hero Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/images/hillytrip/himalayan-landscape.svg" 
            alt="Himalayan Mountain Landscape" 
            className="w-full h-full object-cover object-center opacity-35 filter contrast-105 scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/85 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          
          {/* Main Title & Subtitle */}
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Himalayan Journey Intelligence Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Himalayan Journey Discovery
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
              Plan direct Point A → Point B routes, explore local journey networks, circular loops, and high-altitude travel intelligence across North Bengal & Sikkim.
            </p>
          </div>

          {/* TWO PRIMARY HERO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left items-stretch max-w-5xl mx-auto">
            
            {/* LEFT CARD: 🚗 Plan a Journey */}
            <div className="bg-[#FAF7F2] border border-[#EAE3D2] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6 text-slate-900 relative overflow-visible z-20">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-900 border border-amber-300/40 inline-flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-700" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-800">Route Intelligence</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">Point A → Point B</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  🚗 Plan a Journey
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Find the exact route between any arrival hub or destination with real distance, duration, road insights & taxi rates.
                </p>
              </div>

              {/* Form Controls */}
              <form onSubmit={handleFindRoute} className="space-y-3">
                <SearchableLocationDropdown
                  label="From"
                  placeholder="Select Pickup Location (e.g. Siliguri, NJP, Bagdogra)"
                  value={fromLocation}
                  onChange={(loc) => setFromLocation(loc)}
                  isOpen={isFromOpen}
                  setIsOpen={setIsFromOpen}
                  searchQuery={fromSearchQuery}
                  setSearchQuery={setFromSearchQuery}
                  options={allLocations}
                  icon={MapPin}
                />

                <div className="flex justify-center -my-1 py-1 relative z-20">
                  <button
                    type="button"
                    onClick={handleSwap}
                    title="Swap Locations"
                    className="p-2.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-full text-slate-600 hover:text-emerald-700 shadow-2xs transition hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </div>

                <SearchableLocationDropdown
                  label="To"
                  placeholder="Select Destination (e.g. Gangtok, Darjeeling, Kalimpong)"
                  value={toLocation}
                  onChange={(loc) => setToLocation(loc)}
                  isOpen={isToOpen}
                  setIsOpen={setIsToOpen}
                  searchQuery={toSearchQuery}
                  setSearchQuery={setToSearchQuery}
                  options={allLocations}
                  icon={Navigation}
                />

                {matchedRoute && (
                  <div className="p-3 bg-emerald-50/90 border border-emerald-300/80 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="text-left">
                        <span className="font-extrabold text-emerald-950 block">
                          Verified Route Available
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          {matchedRoute.distance || 72} km • {matchedRoute.timeMin ? `${Math.round(matchedRoute.timeMin / 60)}h ${matchedRoute.timeMin % 60}m` : '3-4 hrs'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleFindRoute}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="submit"
                    className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition shadow-xl hover:shadow-emerald-900/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Find Route</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAiModal(true)}
                    className="py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>AI Planner</span>
                  </button>
                </div>
              </form>

              {/* Benefits List */}
              <div className="pt-3 border-t border-slate-200/80">
                <p className="text-[10px] font-mono font-black text-slate-400 uppercase mb-2">Every Journey Includes:</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Highway Route Map</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Exact Driving Time</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Road Quality & Curves</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Fair Taxi Fare Rates</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT CARD: 🌄 Explore Journeys */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6 text-slate-900 relative overflow-hidden">
              
              <div className="space-y-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-900 border border-emerald-300/40 inline-flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-700" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">Multi-Day Circuits</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  🌄 Explore Journeys
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  Discover curated multi-day Himalayan expedition circuits, Silk Route hairpin passes, and scenic road trips.
                </p>

                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-21/9 my-2">
                  <img 
                    src="/images/hillytrip/snow-mountain.svg" 
                    alt="Scenic Himalayan Road" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Handpicked Multi-Day Expedition Circuits</span>
                  </div>
                </div>
              </div>

              {/* Explore Journeys Button -> Navigates to /journeys/explore */}
              <button
                type="button"
                onClick={handleExploreJourneys}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition shadow-xl hover:shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Journeys Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Highlight Chips */}
              <div className="pt-3 border-t border-slate-200">
                <p className="text-[10px] font-mono font-black text-slate-400 uppercase mb-2">Expedition Categories:</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full">
                    ⭐ Silk Route
                  </span>
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold px-3 py-1 rounded-full">
                    🏔️ North Sikkim High Glaciers
                  </span>
                  <span className="bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-bold px-3 py-1 rounded-full">
                    🍵 Tea Garden Corridors
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* MAIN PAGE BODY CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">

        {/* ========================================================
            2. CURATED HIMALAYAN CIRCUITS (PREVIEW SECTION ONLY - 6 CARDS)
            ======================================================== */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8 text-left relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <Navigation className="w-3 h-3 text-blue-600" />
                <span>Multi-Day Circuit Preview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Curated Himalayan Circuits
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Preview handpicked multi-day road circuits across Sikkim & North Bengal.
              </p>
            </div>

            {/* PROMINENT "VIEW ALL" BUTTON NAVIGATING TO /journeys/explore */}
            <button
              onClick={handleExploreJourneys}
              className="px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>View All Circuits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* EXACTLY 6 CIRCUITS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CIRCUITS.slice(0, 6).map((circuit) => (
              <div
                key={circuit.id}
                onClick={handleExploreJourneys}
                className="bg-[#FAF7F2] rounded-3xl border border-[#EAE3D2] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-48 bg-slate-950 overflow-hidden">
                    <img 
                      src={circuit.image} 
                      alt={circuit.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      ★ {circuit.scenicRating} Rating
                    </span>

                    <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {circuit.duration}
                    </span>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                        📍 {circuit.region}
                      </span>
                      <h3 className="text-lg font-black text-white tracking-tight drop-shadow-md truncate">
                        {circuit.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                      {circuit.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold text-slate-600 pt-2 border-t border-slate-200/80">
                      <div>Distance: <span className="text-slate-900">{circuit.distance}</span></div>
                      <div>Drive: <span className="text-slate-900">{circuit.estimatedTime}</span></div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExploreJourneys();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>View Circuit Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM VIEW ALL CTA */}
          <div className="pt-2 text-center">
            <button
              onClick={handleExploreJourneys}
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              <span>Explore all multi-day circuits in the Journey Discovery Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </section>

        {/* ========================================================
            3. START FROM (ARRIVAL HUBS)
            ======================================================== */}
        <section className="space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-widest block mb-1">
                Arrival Transit Hubs
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Start From Your Arrival Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Begin planning directly from your arrival train station, airport, or hill station hub.
              </p>
            </div>

            <button
              onClick={handleExploreJourneys}
              className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View All Arrival Hubs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Premium Horizontal Carousel / Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {arrivalHubsData.map((hub) => (
              <div
                key={hub.id}
                onClick={() => {
                  const loc = allLocations.find(l => l.id === hub.id) || DEFAULT_LOCATIONS[0];
                  setFromLocation(loc);
                  const el = document.getElementById('search-form-top');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-4 group hover:-translate-y-1"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0 relative">
                  <img 
                    src={hub.image} 
                    alt={hub.name} 
                    className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                  />
                  <span className="absolute bottom-1 right-1 bg-slate-950/80 text-white text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded">
                    {hub.code}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                    {hub.journeyCount}
                  </span>

                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate group-hover:text-emerald-700 transition">
                    {hub.name}
                  </h3>

                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-0.5">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            4. LOOP JOURNEYS (NEW SIGNATURE FEATURE - CIRCULAR TRIPS)
            ======================================================== */}
        <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                <RotateCw className="w-3.5 h-3.5 text-amber-300" />
                <span>Flagship HillyTrip Feature</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Loop Journeys (Circular Trips)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Circular itineraries that start and end at the exact same location with zero backtracking. Experience complete panoramic mountain circuits in a single trip.
              </p>
            </div>

            <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/15 border border-amber-400/30 px-3.5 py-2 rounded-2xl shrink-0">
              Zero Backtracking Guaranteed
            </span>
          </div>

          {/* Loop Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {LOOP_JOURNEYS.map((loop) => (
              <div 
                key={loop.id}
                onClick={() => navigate(`#/journeys/${loop.slug}`)}
                className="bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 rounded-3xl p-6 space-y-5 cursor-pointer group transition duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-400/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <RotateCw className="w-3 h-3" />
                      <span>Circular Loop</span>
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-300">
                      {loop.totalDistance} • {loop.totalDuration}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition leading-snug">
                    {loop.title}
                  </h3>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {loop.description}
                  </p>

                  {/* VISUAL LOOP STOPS CORRIDOR */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Circular Path Sequence:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-extrabold">
                      {loop.stops.map((stop, sIdx) => (
                        <React.Fragment key={sIdx}>
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] ${
                            sIdx === 0 || sIdx === loop.stops.length - 1 
                              ? 'bg-amber-500 text-slate-950 font-black' 
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}>
                            {stop}
                          </span>
                          {sIdx < loop.stops.length - 1 && (
                            <span className="text-amber-400 font-bold">↓</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Highlight Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {loop.highlights.map((hl, idx) => (
                      <span key={idx} className="bg-slate-800/80 text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-md border border-slate-700">
                        ✓ {hl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Start & Finish: {loop.startHub}
                  </span>
                  
                  <button
                    type="button"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Plan This Loop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            5. JOURNEY WEB (INTERACTIVE LOCAL JOURNEY NETWORK)
            ======================================================== */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8 text-left relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <Network className="w-3.5 h-3.5 text-indigo-600" />
                <span>Local Spoke Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Journey Web Network
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Explore local point-to-point spokes originating from a selected base destination.
              </p>
            </div>

            {/* Hub Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {JOURNEY_WEB_DATA.map((web) => (
                <button
                  key={web.hubId}
                  onClick={() => setSelectedWebHubId(web.hubId)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedWebHubId === web.hubId
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{web.hubName} Hub</span>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE HUB NETWORK DISPLAY */}
          <div className="bg-[#FAF7F2] border border-[#EAE3D2] rounded-3xl p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
                  <GitFork className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {activeWebHub.hubName} Spoke Network
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {activeWebHub.tagline}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full self-start sm:self-center">
                {activeWebHub.totalRoutes}+ Connected Routes
              </span>
            </div>

            {/* SPOKES GRID / TREE NETWORK REPRESENTATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWebHub.spokes.map((spoke, sIdx) => (
                <div
                  key={sIdx}
                  onClick={() => navigate(`#/journeys/${spoke.toSlug}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 hover:border-indigo-500 shadow-2xs hover:shadow-md transition cursor-pointer group hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {activeWebHub.hubName}
                      </span>
                      <span className="text-indigo-600 font-bold">├──</span>
                    </div>

                    <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                      spoke.roadQuality === 'Excellent' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      spoke.roadQuality === 'Good' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                      'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {spoke.roadQuality}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition">
                    {spoke.name}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>Distance: <span className="text-slate-900">{spoke.distance}</span></div>
                    <div>Drive: <span className="text-slate-900">{spoke.duration}</span></div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {spoke.highlights.map((hl, hIdx) => (
                      <span key={hIdx} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {hl}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                    <span className="text-[11px] text-slate-500 font-mono">Fare: {spoke.taxiFareEstimate}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                      Launch Route <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </section>

        {/* ========================================================
            6. JOURNEY TREE (FLAGSHIP GLOBAL JOURNEY HIERARCHY)
            ======================================================== */}
        <section className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-8 text-left relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 pb-4 border-b border-slate-800">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>Himalayan Transport Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Global Journey Tree
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Complete expandable journey hierarchy covering all transit hubs, sub-hubs, and destinations across North Bengal & Sikkim.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={expandAllTreeNodes}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-extrabold text-slate-200 rounded-xl transition border border-slate-700 cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAllTreeNodes}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-extrabold text-slate-200 rounded-xl transition border border-slate-700 cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Expandable Tree Root Display */}
          <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4">
            <TreeNodeView
              node={GLOBAL_JOURNEY_TREE}
              expandedNodes={expandedNodes}
              toggleNode={toggleTreeNode}
              navigate={navigate}
            />
          </div>

        </section>

        {/* ========================================================
            7. WHERE CAN I GO? (TIME-RADIUS REACHABILITY)
            ======================================================== */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8 text-left relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Time-Radius Discovery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Where Can I Go?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Discover all reachable mountain destinations based on your available travel time from a starting location.
              </p>
            </div>

            {/* Origin Hub Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {WHERE_CAN_I_GO_DATA.map((r) => (
                <button
                  key={r.originId}
                  onClick={() => setSelectedOriginId(r.originId)}
                  className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedOriginId === r.originId
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>From {r.originName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Bracket Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Destinations' },
              { id: 'within30Min', label: 'Within 30 Minutes' },
              { id: 'within1Hour', label: 'Within 1 Hour' },
              { id: 'withinHalfDay', label: 'Within Half Day' },
              { id: 'within1Day', label: 'Within 1 Day' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTimeBracket(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedTimeBracket === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reachable Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReachabilityDestinations.map((dest, dIdx) => (
              <div
                key={dIdx}
                onClick={() => navigate(`#/journeys/${dest.slug}`)}
                className="bg-[#FAF7F2] rounded-3xl border border-[#EAE3D2] p-5 space-y-4 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-900">
                    <img 
                      src={dest.image} 
                      alt={dest.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                      ⏱️ {dest.timeLabel}
                    </span>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-extrabold text-base text-white tracking-tight leading-snug">
                        {dest.name}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono font-bold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80">
                    <div>Distance: <span className="text-slate-900">{dest.distance}</span></div>
                    <div>Drive Time: <span className="text-slate-900">{dest.driveTime}</span></div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Key Highlights:</span>
                    <div className="flex flex-wrap gap-1">
                      {dest.highlights.map((hl, hIdx) => (
                        <span key={hIdx} className="text-[10px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ✓ {hl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-extrabold text-emerald-700">
                  <span>View Route Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ========================================================
            8. AI JOURNEY PLANNER SECTION
            ======================================================== */}
        <section className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden text-left border border-emerald-800">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>HillyTrip AI Route Intelligence</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              AI Himalayan Journey Planner
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Generate a custom Point A → Point B route recommendation matched to your pickup location, available days, budget, and travel preferences.
            </p>

            <button
              onClick={() => setShowAiModal(true)}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-xl hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Launch AI Journey Planner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </div>

      {/* AI PLANNER MODAL */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/15 text-amber-800 rounded-xl">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">AI Journey Planner</h3>
                    <p className="text-xs text-slate-500">Custom Point A → Point B route recommendations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Starting Point</label>
                  <select
                    value={aiPlannerState.startHub}
                    onChange={(e) => setAiPlannerState({ ...aiPlannerState, startHub: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900"
                  >
                    <option value="siliguri">Siliguri / NJP Railway Station</option>
                    <option value="bagdogra">Bagdogra Airport (IXB)</option>
                    <option value="gangtok">Gangtok Capital</option>
                    <option value="darjeeling">Darjeeling Town</option>
                    <option value="kalimpong">Kalimpong Ridge</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Available Time</label>
                    <select
                      value={aiPlannerState.duration}
                      onChange={(e) => setAiPlannerState({ ...aiPlannerState, duration: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900"
                    >
                      <option value="Half Day">Half Day (3-4 hrs)</option>
                      <option value="1 Day">1 Full Day</option>
                      <option value="2 Days">2 Days</option>
                      <option value="3+ Days">3+ Days Expedition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Travel Style</label>
                    <select
                      value={aiPlannerState.style}
                      onChange={(e) => setAiPlannerState({ ...aiPlannerState, style: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900"
                    >
                      <option value="Scenic">Scenic Road Trip</option>
                      <option value="Adventure">High Altitude Adventure</option>
                      <option value="Family">Family Friendly</option>
                      <option value="Photography">Photography & Views</option>
                      <option value="Romantic">Quiet Escape</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiRecommendation}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Generate Recommended Journey</span>
                </button>

                {/* Recommendation Result */}
                {aiRecommendation && (
                  <div className="bg-[#FAF7F2] border border-[#EAE3D2] rounded-2xl p-4 space-y-3 mt-4">
                    <span className="text-[10px] font-mono font-black text-emerald-800 uppercase bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      ✓ AI Recommended Route
                    </span>

                    <h4 className="font-black text-slate-900 text-base">{aiRecommendation.name}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{aiRecommendation.description}</p>

                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 pt-2 border-t border-slate-200">
                      <span>{aiRecommendation.distance}</span>
                      <span>{aiRecommendation.estimatedTime}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAiModal(false);
                        navigate(`#/journeys/${aiRecommendation.slug}`);
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Route Details</span>
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
