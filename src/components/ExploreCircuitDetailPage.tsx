import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { 
  Compass, MapPin, ArrowLeft, ArrowRight, Share2, Heart, Calendar, 
  Clock, Navigation, Car, Mountain, Star, Check, Copy, ExternalLink, 
  Sparkles, Layers, ShieldCheck, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Destination, Attraction, Homestay } from '../types';
import { LocationItem } from '../types/location';
import { FEATURED_CIRCUITS, CuratedJourney } from '../data/journeysData';
import { DESTINATION_STORAGE_ASSETS, getOptimizedImageUrl } from '../utils/imagePool';
import safeLazy from '../utils/safeLazy';

// Lazy-load Leaflet map component (Zero Google Maps API calls)
const InteractiveLeafletMap = safeLazy(
  () => import('./location/InteractiveLeafletMap').then((m: any) => ({ default: m.InteractiveLeafletMap || m.default })),
  () => (
    <div className="h-80 w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-xs">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
        <span>Loading Circuit Map...</span>
      </div>
    </div>
  )
);

interface ExploreCircuitDetailPageProps {
  circuitSlug: string;
  navigate: (path: string) => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
}

export default function ExploreCircuitDetailPage({
  circuitSlug,
  navigate,
  destinations = [],
  attractions = [],
  homestays = []
}: ExploreCircuitDetailPageProps) {
  // 1. Resolve Circuit Synchronously from FEATURED_CIRCUITS
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

  // 2. SEO Document Title Sync
  useEffect(() => {
    if (circuit) {
      document.title = `${circuit.name} | Explore HillyTrip`;
    } else {
      document.title = 'Circuit Not Found | Explore HillyTrip';
    }
  }, [circuit]);

  // 3. Save / Wishlist State
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !circuit) return false;
    try {
      const raw = localStorage.getItem('hillytrip_saved');
      if (raw) {
        const list = JSON.parse(raw);
        return Array.isArray(list) && list.includes(circuit.id);
      }
    } catch {}
    return false;
  });

  const toggleSave = () => {
    if (!circuit) return;
    try {
      const raw = localStorage.getItem('hillytrip_saved');
      let list: string[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      }
      if (list.includes(circuit.id)) {
        list = list.filter(id => id !== circuit.id);
        setIsSaved(false);
      } else {
        list.push(circuit.id);
        setIsSaved(true);
      }
      localStorage.setItem('hillytrip_saved', JSON.stringify(list));
    } catch {}
  };

  // 4. Share State
  const [copySuccess, setCopySuccess] = useState(false);
  const handleShare = async () => {
    if (!circuit) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${circuit.name} - HillyTrip Curated Circuit`,
          text: circuit.description,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {}
  };

  // 5. Helper function to slugify text
  const toSlugStr = (str: any) => {
    if (!str) return '';
    return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  // Helper to verify if estimatedTime contains a genuine travel duration value
  const isGenuineDuration = (val: string | undefined): boolean => {
    if (!val || typeof val !== 'string') return false;
    const clean = val.trim().toLowerCase();
    return /\b(\d+(\.\d+)?|\d+\s*-\s*\d+)\s*(hr|hrs|hour|hours|min|mins|minute|minutes|day|days)\b/i.test(clean);
  };

  // 6. Safe Journey Stops Matching against loaded destinations and attractions
  const resolvedStops = useMemo(() => {
    if (!circuit || !circuit.journeyStops) return [];

    return circuit.journeyStops.map((stopName, idx) => {
      const targetSlug = toSlugStr(stopName);
      const cleanName = stopName.toLowerCase().trim();

      // Attempt 1: Safe match against authoritative destinations (villages)
      const matchedVillage = destinations.find(d => {
        if (!d || !d.name) return false;
        const dName = d.name.toLowerCase().trim();
        const dSlug = (d.slug || d.village_code || '').toLowerCase().trim();
        return dName === cleanName || toSlugStr(d.name) === targetSlug || dSlug === targetSlug;
      });

      if (matchedVillage) {
        const numLat = matchedVillage.latitude != null ? Number(matchedVillage.latitude) : null;
        const numLng = matchedVillage.longitude != null ? Number(matchedVillage.longitude) : null;
        const hasCoords = numLat !== null && numLng !== null && !isNaN(numLat) && !isNaN(numLng);

        return {
          originalName: stopName,
          index: idx + 1,
          isMatched: true,
          matchType: 'village' as const,
          entity: matchedVillage,
          displayName: matchedVillage.name,
          subtitle: `${matchedVillage.district || ''}${matchedVillage.district && matchedVillage.state ? ', ' : ''}${matchedVillage.state || ''}`,
          url: `#/village/${matchedVillage.slug || matchedVillage.village_code || matchedVillage.id}`,
          coords: hasCoords ? { lat: numLat as number, lng: numLng as number } : null,
          image: matchedVillage.image || matchedVillage.coverImage || null
        };
      }

      // Attempt 2: Safe match against attractions
      const matchedAttraction = attractions.find(a => {
        if (!a || !a.name) return false;
        const aName = a.name.toLowerCase().trim();
        const aSlug = (a.slug || a.id || '').toLowerCase().trim();
        return aName === cleanName || toSlugStr(a.name) === targetSlug || aSlug === targetSlug || cleanName.includes(aName);
      });

      if (matchedAttraction) {
        const numLat = matchedAttraction.latitude != null ? Number(matchedAttraction.latitude) : null;
        const numLng = matchedAttraction.longitude != null ? Number(matchedAttraction.longitude) : null;
        const hasCoords = numLat !== null && numLng !== null && !isNaN(numLat) && !isNaN(numLng);

        return {
          originalName: stopName,
          index: idx + 1,
          isMatched: true,
          matchType: 'attraction' as const,
          entity: matchedAttraction,
          displayName: matchedAttraction.name,
          subtitle: matchedAttraction.category || 'Sightseeing Attraction',
          url: `#/attraction/${matchedAttraction.slug || matchedAttraction.id}`,
          coords: hasCoords ? { lat: numLat as number, lng: numLng as number } : null,
          image: matchedAttraction.image || null
        };
      }

      // Fallback: Plain text stop (NO fake link, NO invented ID)
      return {
        originalName: stopName,
        index: idx + 1,
        isMatched: false,
        matchType: 'unmatched' as const,
        entity: null,
        displayName: stopName,
        subtitle: null,
        url: null,
        coords: null,
        image: null
      };
    });
  }, [circuit, destinations, attractions]);

  // 7. Verified Map Locations for stops with valid GPS coordinates
  const mapLocations: LocationItem[] = useMemo(() => {
    const locs: LocationItem[] = [];
    resolvedStops.forEach((stop) => {
      if (stop.coords && stop.isMatched) {
        locs.push({
          id: `stop-${stop.index}-${toSlugStr(stop.displayName)}`,
          entityId: stop.entity?.id || `stop-${stop.index}`,
          entityType: stop.matchType === 'village' ? 'destination' : 'attraction',
          name: `${stop.index}. ${stop.displayName}`,
          slug: stop.entity?.slug || stop.entity?.id || toSlugStr(stop.displayName),
          description: stop.subtitle || '',
          lat: stop.coords.lat,
          lng: stop.coords.lng,
          country: 'India',
          state: stop.entity?.state || 'Himalayas',
          district: stop.entity?.district || '',
          accuracy: 'verified_gps',
          imageUrl: stop.image || DESTINATION_STORAGE_ASSETS.darjeelingHillsVillage,
          isHidden: false,
          createdAt: '',
          updatedAt: ''
        });
      }
    });
    return locs;
  }, [resolvedStops]);

  // Map center calculation
  const mapCenter = useMemo(() => {
    if (mapLocations.length === 0) return { lat: 27.2, lng: 88.4 };
    const avgLat = mapLocations.reduce((acc, l) => acc + l.lat, 0) / mapLocations.length;
    const avgLng = mapLocations.reduce((acc, l) => acc + l.lng, 0) / mapLocations.length;
    return { lat: avgLat, lng: avgLng };
  }, [mapLocations]);

  // 8. Related Real Entities (Villages & Homestays matching the circuit's stops)
  const relatedVillages = useMemo(() => {
    const matched = resolvedStops
      .filter(s => s.matchType === 'village' && s.entity)
      .map(s => s.entity as Destination);
    const seen = new Set<string>();
    return matched.filter(v => {
      const id = v.id || v.name;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [resolvedStops]);

  const relatedHomestays = useMemo(() => {
    if (relatedVillages.length === 0 || homestays.length === 0) return [];
    const villageNames = new Set(relatedVillages.map(v => v.name.toLowerCase()));
    const villageIds = new Set(relatedVillages.map(v => v.id));

    return homestays.filter(h => {
      if (!h) return false;
      if (h.destinationId && villageIds.has(h.destinationId)) return true;
      if (h.village_name && villageNames.has(h.village_name.toLowerCase())) return true;
      if (h.address && Array.from(villageNames).some(vName => h.address.toLowerCase().includes(vName))) return true;
      return false;
    }).slice(0, 3);
  }, [relatedVillages, homestays]);

  // 9. Plan This Circuit Action (Handoff cleanly to Taxi with fromHubId and toHubId)
  const handlePlanCircuitTaxi = () => {
    if (!circuit) return;
    const fromParam = circuit.fromHubId || (resolvedStops[0]?.displayName) || 'Siliguri';
    const toParam = circuit.toHubId || (resolvedStops[resolvedStops.length - 1]?.displayName) || 'Darjeeling';
    navigate(`#/taxi?from=${encodeURIComponent(fromParam)}&to=${encodeURIComponent(toParam)}`);
  };

  // ---------------------------------------------------------------------------
  // ERROR STATE: Circuit Not Found
  // ---------------------------------------------------------------------------
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We couldn&apos;t find an active curated circuit matching &ldquo;{cleanSlug || 'unknown'}&rdquo;.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('#/explore')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore Hub</span>
            </button>
          </div>

          {/* Quick links to existing circuits */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-3 text-left">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Browse Available Curated Circuits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEATURED_CIRCUITS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => navigate(`#/explore/circuit/${c.slug || c.id}`)}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500">
                    {c.name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors pb-24 sm:pb-16">
      
      {/* ========================================================================= */}
      {/* SECTION 1 — BREADCRUMBS & TOP NAV BAR                                     */}
      {/* ========================================================================= */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => navigate('#/explore')}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate font-mono text-[11px]">
              <span className="hidden sm:inline">Explore</span>
              <span className="hidden sm:inline">→</span>
              <span className="hidden sm:inline">Curated Circuits</span>
              <span className="hidden sm:inline">→</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{circuit.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs"
              title="Share Circuit"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copySuccess ? 'Copied' : 'Share'}</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={toggleSave}
              className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs ${
                isSaved 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500'
              }`}
              title="Save Circuit"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-7 sm:space-y-10">

        {/* ========================================================================= */}
        {/* SECTION 2 — HERO (Wide Cinematic Desktop, Compact Mobile)                 */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
          <div className="relative h-72 sm:h-96 lg:h-[420px] w-full overflow-hidden">
            <img
              src={getOptimizedImageUrl(circuit.image || DESTINATION_STORAGE_ASSETS.snowMountains, 1200)}
              alt={circuit.name}
              className="w-full h-full object-cover object-center"
            />
            {/* Enhanced contrast gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20"></div>
            
            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex flex-wrap gap-2">
              {circuit.region && (
                <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm">
                  {circuit.region}
                </span>
              )}
              {circuit.travelStyle && (
                <span className="bg-sky-600/90 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm">
                  {circuit.travelStyle}
                </span>
              )}
              {circuit.bestSeason && (
                <span className="bg-amber-600/90 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Best in {circuit.bestSeason}</span>
                </span>
              )}
            </div>

            {/* Bottom Content Area with high contrast description */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 max-w-2xl text-white">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Curated Himalayan Expedition</span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  {circuit.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-100 font-medium line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-sm">
                  {circuit.description}
                </p>
              </div>

              {/* Desktop Primary CTA */}
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handlePlanCircuitTaxi}
                  className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
                >
                  <Car className="w-4 h-4" />
                  <span>Plan This Circuit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3 — QUICK FACTS (Verified Fields Only)                             */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs">
          <div className="space-y-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Circuit Verified Metrics</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
              
              {/* Duration */}
              {circuit.duration && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-mono text-[10px] uppercase font-semibold">Duration</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {circuit.duration}
                  </div>
                </div>
              )}

              {/* Distance */}
              {circuit.distance && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                    <Navigation className="w-3.5 h-3.5 text-sky-500" />
                    <span className="font-mono text-[10px] uppercase font-semibold">Distance</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {circuit.distance}
                  </div>
                </div>
              )}

              {/* Drive Time - ONLY shown when value is a genuine duration (e.g. '12-14 hrs total drive') */}
              {isGenuineDuration(circuit.estimatedTime) && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                    <Car className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-mono text-[10px] uppercase font-semibold">Drive Time</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                    {circuit.estimatedTime}
                  </div>
                </div>
              )}

              {/* Scenic Rating */}
              {typeof circuit.scenicRating === 'number' && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-mono text-[10px] uppercase font-semibold">Scenic Score</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {circuit.scenicRating.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                  </div>
                </div>
              )}

              {/* Optional: Attraction Count */}
              {typeof circuit.attractionCount === 'number' && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-mono text-[10px] uppercase font-semibold">Attractions</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {circuit.attractionCount} Spots
                  </div>
                </div>
              )}

              {/* Optional: Homestay Count */}
              {typeof circuit.homestayCount === 'number' && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                    <Mountain className="w-3.5 h-3.5 text-teal-500" />
                    <span className="font-mono text-[10px] uppercase font-semibold">Homestays</span>
                  </div>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {circuit.homestayCount} Stays
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 — ABOUT THIS CIRCUIT & HIGHLIGHT TAGS                           */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7">
          <div className="lg:col-span-2 space-y-3.5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
                <span>Overview & Experience</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                About This Circuit
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
              {circuit.description}
            </p>

            {/* Circuit Tags with strong contrast */}
            {circuit.tags && circuit.tags.length > 0 && (
              <div className="pt-2">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 mb-2">
                  Circuit Key Highlights
                </h4>
                <div className="flex flex-wrap gap-2">
                  {circuit.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/70 px-3 py-1.5 rounded-full font-semibold shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3.5 h-fit">
            <h3 className="text-sm font-black text-slate-900 dark:text-white font-mono uppercase tracking-wider">
              Transit Logistics
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Departure Hub:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase font-mono">{circuit.fromHubId}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Circuit Peak Stop:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 uppercase font-mono">{circuit.toHubId}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Total Milestones:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{circuit.journeyStops.length} Stops</span>
              </div>
            </div>

            <div className="pt-1.5">
              <button
                type="button"
                onClick={handlePlanCircuitTaxi}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                <Car className="w-4 h-4" />
                <span>Book Cab for Circuit</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — JOURNEY STOPS (Vertical Timeline with Confident Matching)       */}
        {/* ========================================================================= */}
        <section className="space-y-3.5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Itinerary Route Progression</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Journey Stops
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Ordered milestones along this circuit. Confidently matched villages and attractions are interactive.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs">
            <div className="relative pl-6 sm:pl-8 space-y-3.5 sm:space-y-4.5 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-sky-500 before:to-indigo-500">
              {resolvedStops.map((stop, idx) => (
                <div key={idx} className="relative group">
                  
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-[10px] sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow-xs group-hover:scale-110 transition-transform">
                    {String(stop.index).padStart(2, '0')}
                  </div>

                  {/* Stop Card */}
                  <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 transition hover:border-emerald-500">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {stop.displayName}
                          </h4>

                          {/* Match Badge */}
                          {stop.isMatched && (
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                              stop.matchType === 'village'
                                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30'
                                : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                            }`}>
                              {stop.matchType === 'village' ? 'Place Guide' : 'Attraction'}
                            </span>
                          )}
                        </div>

                        {stop.subtitle && (
                          <div className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                            {stop.subtitle}
                          </div>
                        )}
                      </div>

                      {/* Navigation Link for Confidently Matched Stops */}
                      {stop.isMatched && stop.url && (
                        <button
                          type="button"
                          onClick={() => navigate(stop.url!)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-mono py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition cursor-pointer self-start sm:self-auto hover:border-emerald-500"
                        >
                          <span>{stop.matchType === 'village' ? 'Place Guide' : 'Attraction Details'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — CIRCUIT MAP (Lazy-Loaded Leaflet with Verified Coordinates)    */}
        {/* ========================================================================= */}
        <section className="space-y-3.5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Spatial Overview</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Circuit Regional Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Verified GPS stop locations plotted on the regional topological map.
            </p>
          </div>

          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-lg space-y-3">
            
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1">
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5" /> Verified Stop Pins ({mapLocations.length})
              </span>
              <span className="text-[10px] bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                Leaflet Topo
              </span>
            </div>

            {mapLocations.length >= 2 ? (
              <div className="rounded-2xl overflow-hidden border border-slate-800 h-72 sm:h-88 relative">
                <Suspense fallback={
                  <div className="h-full w-full bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
                    Loading Circuit Map...
                  </div>
                }>
                  <InteractiveLeafletMap
                    locations={mapLocations}
                    onSelectLocation={(loc) => {
                      if (loc?.slug) {
                        const targetUrl = loc.entityType === 'destination' ? `#/village/${loc.slug}` : `#/attraction/${loc.slug}`;
                        navigate(targetUrl);
                      }
                    }}
                    height="100%"
                    className="w-full h-full"
                    center={mapCenter}
                    zoom={9}
                  />
                </Suspense>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Topological Map Preview Notice
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                      {mapLocations.length} of {circuit.journeyStops.length} stops verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    Only verified GPS coordinates from authoritative village and attraction records are plotted. Complete milestone sequence is detailed in the itinerary timeline above.
                  </p>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero external Google Maps API requests. All coordinates validated against local master.</span>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8 — PLAN THIS CIRCUIT (Integrated with Taxi Dispatch)              */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 text-white space-y-4 shadow-xl">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <Car className="w-3.5 h-3.5" />
              <span>Mountain Transit Dispatch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Plan This Circuit with Taxi
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Connect with experienced Himalayan drivers familiar with this route. Fare estimates and vehicle options are handled cleanly via the Taxi transit module.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-4 py-3 rounded-xl text-xs font-mono">
              <span className="text-slate-400 font-medium">Route:</span>
              <span className="font-bold text-emerald-400 uppercase">{circuit.fromHubId}</span>
              <span className="text-slate-500">→</span>
              <span className="font-bold text-sky-400 uppercase">{circuit.toHubId}</span>
            </div>

            <button
              type="button"
              onClick={handlePlanCircuitTaxi}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Car className="w-4 h-4" />
              <span>Proceed to Taxi Module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9 — RELATED EXPLORATION (Safely Matched Villages & Homestays)      */}
        {/* ========================================================================= */}
        {(relatedVillages.length > 0 || relatedHomestays.length > 0) && (
          <section className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <Mountain className="w-3.5 h-3.5" />
                <span>Related Exploration</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Places Along This Circuit
              </h2>
            </div>

            {/* Matched Villages */}
            {relatedVillages.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Featured Places ({relatedVillages.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {relatedVillages.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => navigate(`#/village/${v.slug || v.village_code || v.id}`)}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 transition cursor-pointer flex items-center gap-3.5 group shadow-xs"
                    >
                      <img
                        src={getOptimizedImageUrl(v.image || v.coverImage || DESTINATION_STORAGE_ASSETS.darjeelingHillsVillage, 200)}
                        alt={v.name}
                        className="w-13 h-13 rounded-xl object-cover shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold block">
                          {v.district || 'Himalayas'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 truncate">
                          {v.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-300 block truncate">
                          View place guide →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Homestays */}
            {relatedHomestays.length > 0 && (
              <div className="space-y-2.5 pt-1.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Recommended Village Stays ({relatedHomestays.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {relatedHomestays.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => navigate(`#/homestay/${h.slug || h.id}`)}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-500 transition cursor-pointer flex items-center gap-3.5 group shadow-xs"
                    >
                      <div className="w-13 h-13 rounded-xl bg-slate-850 flex items-center justify-center shrink-0 text-emerald-400">
                        <Mountain className="w-6 h-6" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-sky-500 font-bold block">
                          {h.address || 'Homestay'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 truncate">
                          {h.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-300 block truncate">
                          View stay details →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM ACTION BAR                                           */}
      {/* ========================================================================= */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between shadow-2xl">
        <div className="space-y-0.5 pr-2">
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase">
            {circuit.duration} • {circuit.distance}
          </div>
          <div className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[190px]">
            {circuit.name}
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlanCircuitTaxi}
          className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer active:scale-95"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Plan Circuit</span>
        </button>
      </div>

    </div>
  );
}
