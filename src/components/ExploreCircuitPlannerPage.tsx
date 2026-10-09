import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, ArrowLeft, ArrowRight, Calendar, Clock, Navigation, 
  MapPin, Mountain, Car, Users, Share2, Check, ExternalLink, 
  Sparkles, Layers, ShieldCheck, ChevronRight, Bookmark, AlertCircle, Info
} from 'lucide-react';
import { Destination, Attraction, Homestay } from '../types';
import { FEATURED_CIRCUITS, CuratedJourney } from '../data/journeysData';
import { toSlug } from '../utils/slug';

interface ExploreCircuitPlannerPageProps {
  circuitSlug: string;
  navigate: (path: string) => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
}

type TravelStyleOption = 'Private Car' | 'Shared / Local Transport' | 'Trek' | 'Combination';

export default function ExploreCircuitPlannerPage({
  circuitSlug,
  navigate,
  destinations = [],
  attractions = [],
  homestays = []
}: ExploreCircuitPlannerPageProps) {
  // 1. Resolve Circuit Synchronously from FEATURED_CIRCUITS using slug or id
  const cleanSlug = useMemo(() => {
    return decodeURIComponent(circuitSlug || '').toLowerCase().trim();
  }, [circuitSlug]);

  const circuit: CuratedJourney | null = useMemo(() => {
    if (!cleanSlug) return null;
    return FEATURED_CIRCUITS.find(c => 
      (c.slug && c.slug.toLowerCase() === cleanSlug) || 
      (c.id && c.id.toLowerCase() === cleanSlug)
    ) || null;
  }, [cleanSlug]);

  // 2. Document Title Sync
  useEffect(() => {
    if (circuit) {
      document.title = `Plan Your Journey: ${circuit.name} | HillyTrip`;
    } else {
      document.title = 'Curated Circuit Not Found | HillyTrip';
    }
  }, [circuit]);

  // 3. Planning Mode: 'diy' (Plan It Yourself) vs 'packages' (Tour Packages)
  const [activeMode, setActiveMode] = useState<'diy' | 'packages'>('diy');

  // 4. Safe Days parsing from circuit.duration (minimum 1)
  const defaultDays = useMemo(() => {
    if (!circuit || !circuit.duration || typeof circuit.duration !== 'string') return 1;
    const match = circuit.duration.match(/\b(\d+)\b/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }
    return 1;
  }, [circuit]);

  // 5. Form State
  const [startDate, setStartDate] = useState<string>('');
  const [days, setDays] = useState<number>(defaultDays);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  // 6. Travel Style Preselection
  const defaultTravelStyle = useMemo<TravelStyleOption>(() => {
    if (!circuit || !circuit.travelStyle) return 'Combination';
    const style = circuit.travelStyle.toLowerCase();
    if (style.includes('road')) return 'Private Car';
    if (style.includes('trek')) return 'Trek';
    if (style.includes('shared')) return 'Shared / Local Transport';
    return 'Combination';
  }, [circuit]);

  const [travelStyle, setTravelStyle] = useState<TravelStyleOption>(defaultTravelStyle);

  // Sync default days if circuit changes
  useEffect(() => {
    setDays(defaultDays);
    setTravelStyle(defaultTravelStyle);
  }, [defaultDays, defaultTravelStyle]);

  // 7. Canonical Place Resolution for Stops
  const [resolvedStopsMap, setResolvedStopsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!circuit || !circuit.journeyStops || circuit.journeyStops.length === 0) return;

    let isMounted = true;
    const stops = circuit.journeyStops;
    const initialMap: Record<string, any> = {};
    const unresolvedNames: string[] = [];

    // Tier 1: Instant match against loaded destinations and attractions props
    for (const stopName of stops) {
      const cleanName = stopName.toLowerCase().trim();
      const targetSlug = toSlug(stopName);

      // Check destinations
      const matchedVillage = destinations.find(d => {
        if (!d || !d.name) return false;
        const dName = d.name.toLowerCase().trim();
        const dSlug = (d.slug || d.village_code || '').toLowerCase().trim();
        return dName === cleanName || toSlug(d.name) === targetSlug || dSlug === targetSlug;
      });

      if (matchedVillage) {
        initialMap[stopName] = {
          resolved: true,
          entityType: 'village',
          id: matchedVillage.village_code || matchedVillage.id,
          name: matchedVillage.name,
          slug: matchedVillage.slug || matchedVillage.village_code || matchedVillage.id,
          targetUrl: `#/village/${matchedVillage.slug || matchedVillage.village_code || matchedVillage.id}`,
          district: matchedVillage.district || matchedVillage.state
        };
        continue;
      }

      // Check attractions
      const matchedAttr = attractions.find(a => {
        if (!a || !a.name) return false;
        const aName = a.name.toLowerCase().trim();
        const aSlug = (a.slug || a.id || '').toLowerCase().trim();
        return aName === cleanName || toSlug(a.name) === targetSlug || aSlug === targetSlug;
      });

      if (matchedAttr) {
        initialMap[stopName] = {
          resolved: true,
          entityType: 'attraction',
          id: matchedAttr.id,
          name: matchedAttr.name,
          slug: matchedAttr.slug || matchedAttr.id,
          targetUrl: `#/attraction/${matchedAttr.slug || matchedAttr.id}`,
          category: matchedAttr.category
        };
        continue;
      }

      unresolvedNames.push(stopName);
    }

    if (isMounted) {
      setResolvedStopsMap(initialMap);
    }

    // Tier 2: Single batch resolver request for any unresolved stops
    if (unresolvedNames.length > 0) {
      fetch('/api/places/resolve-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: unresolvedNames })
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!isMounted || !data) return;
          const resultsMap = data.results || data;
          setResolvedStopsMap(prev => ({
            ...prev,
            ...resultsMap
          }));
        })
        .catch(err => {
          console.warn('[ExploreCircuitPlanner] Batch resolve notice:', err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [circuit, destinations, attractions]);

  // 8. Sharing & Feedback
  const [copySuccess, setCopySuccess] = useState(false);
  const [continueModalOpen, setContinueModalOpen] = useState(false);

  const handleShare = async () => {
    if (!circuit) return;
    const shareUrl = window.location.href;
    const shareData = {
      title: `Plan ${circuit.name} - HillyTrip`,
      text: `Check out this ${days}-day trip plan for ${circuit.name} on HillyTrip.`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // Ignored
    }
  };

  // 9. Error State: Circuit Not Found
  if (!circuit) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Curated Circuit Not Found
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The requested circuit could not be resolved from HillyTrip&apos;s verified directory.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => navigate('#/explore')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Taxi Route Link parameters
  const taxiFrom = circuit.fromHubId || (circuit.journeyStops?.[0]) || '';
  const taxiTo = circuit.toHubId || (circuit.journeyStops?.[circuit.journeyStops.length - 1]) || '';
  const taxiUrl = `#/taxi?from=${encodeURIComponent(taxiFrom)}&to=${encodeURIComponent(taxiTo)}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-28 sm:pb-20">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`#/explore/circuit/${circuit.slug || circuit.id}`)}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Circuit</span>
          </button>

          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
            {circuit.name}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 sm:space-y-8">

        {/* ========================================================================= */}
        {/* HEADER SECTION                                                            */}
        {/* ========================================================================= */}
        <header className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white shadow-xl">
          {circuit.image && (
            <div className="absolute inset-0 z-0">
              <img
                src={circuit.image}
                alt={circuit.name}
                className="w-full h-full object-cover object-center opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
            </div>
          )}

          <div className="relative z-10 p-5 sm:p-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PLAN YOUR JOURNEY</span>
            </div>

            <div className="space-y-2 max-w-3xl">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {circuit.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Build your own trip around this curated HillyTrip circuit.
              </p>
            </div>

            {/* Verified Existing Circuit Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              {circuit.duration && (
                <div className="bg-slate-900/80 backdrop-blur-xs border border-slate-800 rounded-2xl p-2.5 sm:p-3 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Duration</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white">{circuit.duration}</div>
                </div>
              )}

              {circuit.distance && (
                <div className="bg-slate-900/80 backdrop-blur-xs border border-slate-800 rounded-2xl p-2.5 sm:p-3 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                    <Navigation className="w-3 h-3 text-sky-400" />
                    <span>Distance</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white">{circuit.distance}</div>
                </div>
              )}

              {circuit.bestSeason && (
                <div className="bg-slate-900/80 backdrop-blur-xs border border-slate-800 rounded-2xl p-2.5 sm:p-3 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>Best Season</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white">{circuit.bestSeason}</div>
                </div>
              )}

              {circuit.travelStyle && (
                <div className="bg-slate-900/80 backdrop-blur-xs border border-slate-800 rounded-2xl p-2.5 sm:p-3 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                    <Mountain className="w-3 h-3 text-purple-400" />
                    <span>Travel Style</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white">{circuit.travelStyle}</div>
                </div>
              )}

              {circuit.journeyStops && circuit.journeyStops.length > 0 && (
                <div className="bg-slate-900/80 backdrop-blur-xs border border-slate-800 rounded-2xl p-2.5 sm:p-3 space-y-0.5 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-semibold uppercase">
                    <Layers className="w-3 h-3 text-teal-400" />
                    <span>Stops</span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white">{circuit.journeyStops.length} Milestones</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* CHOOSE HOW TO TRAVEL: 2 PRIMARY CARDS                                      */}
        {/* ========================================================================= */}
        <section className="space-y-3">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Choose How to Travel
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD 1: PLAN IT YOURSELF */}
            <div
              className={`rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer ${
                activeMode === 'diy'
                  ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-emerald-400 shadow-xs'
              }`}
              onClick={() => setActiveMode('diy')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
                    🧭
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    activeMode === 'diy' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {activeMode === 'diy' ? 'Selected' : 'Available'}
                  </span>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    PLAN IT YOURSELF
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Build your trip using HillyTrip&apos;s places, stays and transport options.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMode('diy');
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeMode === 'diy'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>Plan My Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: TOUR PACKAGES */}
            <div
              className={`rounded-3xl p-5 sm:p-6 border transition-all cursor-pointer ${
                activeMode === 'packages'
                  ? 'bg-white dark:bg-slate-900 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                  : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-sky-400 shadow-xs'
              }`}
              onClick={() => setActiveMode('packages')}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-lg">
                    🏔️
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    Coming Soon
                  </span>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    TOUR PACKAGES
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Prefer a ready-made trip? Explore packages offered by tour operators.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMode('packages');
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeMode === 'packages'
                        ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>View Tour Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* TOUR PACKAGES VIEW (When Tour Packages is selected)                       */}
        {/* ========================================================================= */}
        {activeMode === 'packages' && (
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Tour packages for this circuit are not available yet.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                We&apos;re working with local travel partners to bring verified packages to HillyTrip.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveMode('diy')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase font-mono tracking-wider transition cursor-pointer"
              >
                <span>Switch to Plan It Yourself</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* DIY PLANNER EXPERIENCE (When activeMode === 'diy')                         */}
        {/* ========================================================================= */}
        {activeMode === 'diy' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            
            {/* LEFT / MAIN COLUMN: Planning Controls */}
            <div className="lg:col-span-2 space-y-6">

              {/* SECTION A: YOUR JOURNEY (Timeline with Canonical Resolver) */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your Journey Stops</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {circuit.journeyStops?.length || 0} Ordered Stops
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-7 space-y-3 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-sky-500 before:to-indigo-500">
                  {circuit.journeyStops && circuit.journeyStops.map((stopName, idx) => {
                    const resolved = resolvedStopsMap[stopName];
                    const isMatched = resolved && resolved.resolved;
                    const entityType = resolved?.entityType; // 'village' | 'attraction'
                    const detailUrl = resolved?.targetUrl;

                    return (
                      <div key={idx} className="relative group">
                        {/* Timeline Node */}
                        <div className="absolute -left-6 sm:-left-7 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow-xs">
                          {idx + 1}
                        </div>

                        {/* Stop Card */}
                        <div
                          role={isMatched && detailUrl ? 'button' : undefined}
                          tabIndex={isMatched && detailUrl ? 0 : undefined}
                          onClick={() => {
                            if (isMatched && detailUrl) {
                              navigate(detailUrl);
                            }
                          }}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && isMatched && detailUrl) {
                              e.preventDefault();
                              navigate(detailUrl);
                            }
                          }}
                          className={`p-3 rounded-2xl border transition-all ${
                            isMatched && detailUrl
                              ? 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md cursor-pointer group/card'
                              : isMatched
                                ? 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                                : 'bg-slate-50/60 dark:bg-slate-850/60 border-dashed border-slate-300 dark:border-slate-700/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white ${isMatched && detailUrl ? 'group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors' : ''}`}>
                                  {resolved?.name || stopName}
                                </span>

                                {isMatched && (
                                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                    entityType === 'village'
                                      ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                                      : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                                  }`}>
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    <span>{entityType === 'village' ? 'Village Guide' : 'Attraction Details'}</span>
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                {isMatched ? (resolved?.district || resolved?.category || 'Verified Canonical Place') : 'Circuit Milestone'}
                              </div>
                            </div>

                            {/* Detail Link if resolved */}
                            {isMatched && detailUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(detailUrl);
                                }}
                                className="shrink-0 inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition cursor-pointer"
                                title={`View details for ${resolved?.name || stopName}`}
                              >
                                <span>Guide</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SECTION B: WHEN ARE YOU TRAVELLING? */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>When Are You Travelling?</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label htmlFor="trip-start-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Start Date
                    </label>
                    <input
                      id="trip-start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>

                  {/* Number of Days */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Number of Days
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Decrease days"
                        onClick={() => setDays(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-base font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
                      >
                        −
                      </button>

                      <div className="flex-1 text-center font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {days} {days === 1 ? 'Day' : 'Days'}
                      </div>

                      <button
                        type="button"
                        aria-label="Increase days"
                        onClick={() => setDays(prev => prev + 1)}
                        className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-base font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION C: TRAVELLERS */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Who&apos;s Travelling?</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Adults */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Adults</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Age 12+</div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <button
                        type="button"
                        aria-label="Decrease adults"
                        onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center text-sm sm:text-base font-bold transition cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-6 sm:w-8 text-center font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {adults}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase adults"
                        onClick={() => setAdults(prev => prev + 1)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center text-sm sm:text-base font-bold transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Children</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Age 0-11</div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <button
                        type="button"
                        aria-label="Decrease children"
                        onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center text-sm sm:text-base font-bold transition cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-6 sm:w-8 text-center font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {children}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase children"
                        onClick={() => setChildren(prev => prev + 1)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-center text-sm sm:text-base font-bold transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION D: TRAVEL STYLE */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-emerald-500" />
                  <span>How Do You Want to Travel?</span>
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: 'Private Car', label: 'Private Car', icon: '🚕' },
                      { id: 'Shared / Local Transport', label: 'Shared / Local Transport', icon: '🚐' },
                      { id: 'Trek', label: 'Trek', icon: '🥾' },
                      { id: 'Combination', label: 'Combination', icon: '🧭' }
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTravelStyle(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        travelStyle === opt.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* SECTION E: STAY */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Where Would You Like to Stay?</span>
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Find homestays along your journey.
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Explore authentic local Himalayan homestays across regional stops.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('#/homestays')}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Explore Homestays</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>

              {/* SECTION F: TRANSPORT */}
              <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Need Transport?</span>
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Find taxi options for the relevant starting point of this circuit.
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Connecting route: <span className="uppercase text-emerald-600 dark:text-emerald-400 font-bold">{taxiFrom}</span> → <span className="uppercase text-sky-600 dark:text-sky-400 font-bold">{taxiTo}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(taxiUrl)}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Find Taxi</span>
                  </button>
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: Trip Summary (Desktop sticky sidebar) */}
            <div className="space-y-6 lg:sticky lg:top-20">
              
              {/* SECTION G: TRIP SUMMARY */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>YOUR TRIP</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Draft
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {circuit.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {circuit.region || 'Eastern Himalayas'}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs font-mono pt-1">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Start Date:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {startDate ? new Date(startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not selected yet'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Travellers:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {adults} {adults === 1 ? 'Adult' : 'Adults'} · {children} {children === 1 ? 'Child' : 'Children'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Milestones:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {circuit.journeyStops?.length || 0} Stops
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Travel Style:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">
                      {travelStyle}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Save & Share */}
                <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed"
                    title="Trip saving is coming soon"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Trip (Coming Soon)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Trip Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Trip</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Primary CTA in desktop sidebar */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setContinueModalOpen(true)}
                    className="w-full py-3 px-4 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-98"
                  >
                    <span>Continue Planning</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM ACTION AREA                                          */}
      {/* ========================================================================= */}
      {activeMode === 'diy' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between shadow-2xl">
          <div className="space-y-0.5 pr-2">
            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              {days} {days === 1 ? 'Day' : 'Days'} · {adults + children} {adults + children === 1 ? 'Traveller' : 'Travellers'}
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[190px]">
              {circuit.name}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setContinueModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer active:scale-95"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONTINUE PLANNING MODAL / DRAWER                                           */}
      {/* ========================================================================= */}
      {continueModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
          onClick={() => setContinueModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Steps</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Your trip is ready to continue.
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connect your itinerary with verified regional homestays and mountain taxi operators.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setContinueModalOpen(false);
                  navigate('#/homestays');
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-between transition cursor-pointer text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Explore Homestays
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Find stays along this circuit
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setContinueModalOpen(false);
                  navigate(taxiUrl);
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-slate-200 dark:border-slate-700 hover:border-sky-500 flex items-center justify-between transition cursor-pointer text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                    Find Taxi
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {taxiFrom} → {taxiTo}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setContinueModalOpen(false)}
                className="w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
