import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, Home as HomeIcon, MapPin, Compass, ShieldCheck, ArrowRight, Clock, Sparkles, 
  Calendar, CheckCircle2, Info, ExternalLink, Star, Wifi, Coffee, Flame, 
  ChevronRight, Map as MapIcon, Users, AlertCircle
} from 'lucide-react';
import { Route, Hub, Destination, Attraction, Homestay } from '../../types';
import { resolveEntityName } from '../../utils/entityResolver';
import { MarketReferenceFareCard } from '../taxi/MarketReferenceFareCard';
import GoogleRouteMap from '../GoogleRouteMap';
import { getItemSlug } from '../../utils/slug';

// Cache for API responses to avoid duplicate fetches
const apiCache: Record<string, any> = {};

async function fetchCachedJson(url: string) {
  if (apiCache[url]) return apiCache[url];
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    apiCache[url] = data;
    return data;
  } catch {
    return null;
  }
}

interface WidgetProps {
  args: string;
  navigate: (path: string) => void;
}

// ==========================================
// 1. ROUTE WIDGET
// [[WIDGET:ROUTE:ROUTE_ID]]
// ==========================================
export const RouteWidget: React.FC<WidgetProps> = ({ args, navigate }) => {
  const [routeData, setRouteData] = useState<Route | null>(null);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleDistance, setGoogleDistance] = useState<string | null>(null);
  const [googleDuration, setGoogleDuration] = useState<string | null>(null);
  const [operators, setOperators] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const cleanArgs = args.trim();
        let fetchedR: Route | null = null;

        // Check if args is ROUTE_ID e.g. ROUTE0004 or ROUTE0002
        if (cleanArgs.toUpperCase().startsWith('ROUTE')) {
          const directRoute = await fetchCachedJson(`/api/routes/${encodeURIComponent(cleanArgs)}`);
          if (directRoute && directRoute.route) {
            fetchedR = directRoute.route;
          }
        }

        // Fetch all routes if not found directly
        if (!fetchedR) {
          const allRoutes: Route[] = await fetchCachedJson('/api/routes') || [];
          // Match by id, slug, or from-to
          const parts = cleanArgs.split(/[:\s]+/).filter(Boolean);
          fetchedR = allRoutes.find(r => 
            r.id.toLowerCase() === cleanArgs.toLowerCase() ||
            (r as any).slug === cleanArgs.toLowerCase() ||
            (parts.length === 2 && (
              (r.fromHubId.toLowerCase().includes(parts[0].toLowerCase()) && r.toHubId.toLowerCase().includes(parts[1].toLowerCase())) ||
              (r.fromHubId.toLowerCase().includes(parts[1].toLowerCase()) && r.toHubId.toLowerCase().includes(parts[0].toLowerCase()))
            ))
          ) || null;
        }

        // Fetch supporting hubs and destinations
        const [hubsRes, destsRes, opsRes] = await Promise.all([
          fetchCachedJson('/api/admin/data/hubs') || fetchCachedJson('/api/hubs') || [],
          fetchCachedJson('/api/destinations') || [],
          fetchCachedJson('/api/taxi-operators') || []
        ]);

        if (isMounted) {
          const safeHubs = Array.isArray(hubsRes) ? hubsRes : (hubsRes?.data && Array.isArray(hubsRes.data) ? hubsRes.data : []);
          const safeDests = Array.isArray(destsRes) ? destsRes : (destsRes?.data && Array.isArray(destsRes.data) ? destsRes.data : []);
          const safeOps = Array.isArray(opsRes) ? opsRes : (opsRes?.data && Array.isArray(opsRes.data) ? opsRes.data : []);

          setHubs(safeHubs);
          setDestinations(safeDests);
          setOperators(safeOps);

          if (fetchedR) {
            setRouteData(fetchedR);
          } else {
            // Check if parts match actual hubs in the database
            const parts = cleanArgs.split(/[:\s]+/).filter(Boolean);
            if (parts.length === 2) {
              const matchedFrom = safeHubs.find(h => h.id.toLowerCase() === parts[0].toLowerCase() || h.name.toLowerCase().includes(parts[0].toLowerCase()));
              const matchedTo = safeHubs.find(h => h.id.toLowerCase() === parts[1].toLowerCase() || h.name.toLowerCase().includes(parts[1].toLowerCase()));
              if (matchedFrom && matchedTo) {
                setRouteData({
                  id: `RTE-${matchedFrom.name}-to-${matchedTo.name}`,
                  fromHubId: matchedFrom.id,
                  toHubId: matchedTo.id,
                  path: [matchedFrom.name, matchedTo.name],
                  type: 'Reserved Car',
                  fareMin: null,
                  fareMax: null,
                  timeMin: null,
                  timeMax: null,
                  verified: true,
                  lastUpdated: 'HillyTrip Verified Route'
                });
              } else {
                setRouteData(null);
              }
            } else {
              setRouteData(null);
            }
          }
        }
      } catch (err) {
        console.warn('[RouteWidget] Error loading route:', err);
        if (isMounted) setRouteData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [args]);

  const fromName = useMemo(() => {
    if (!routeData) return 'Origin';
    return resolveEntityName(routeData.fromHubId, hubs);
  }, [routeData, hubs]);

  const toName = useMemo(() => {
    if (!routeData) return 'Destination';
    return resolveEntityName(routeData.toHubId, hubs);
  }, [routeData, hubs]);

  const displayDistance = useMemo(() => {
    if (routeData && routeData.distance && Number(routeData.distance) > 0) {
      return `${routeData.distance} km`;
    }
    if (googleDistance) return googleDistance;
    return 'Distance calculating...';
  }, [routeData, googleDistance]);

  const displayDuration = useMemo(() => {
    if (routeData && routeData.timeMin && Number(routeData.timeMin) > 0) {
      const mins = Number(routeData.timeMin);
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return hrs > 0 ? (rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`) : `${rem} mins`;
    }
    if (googleDuration) return googleDuration;
    return 'Duration calculating...';
  }, [routeData, googleDuration]);

  if (loading) {
    return (
      <div className="my-6 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 text-sky-400 animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Loading live HillyTrip route metrics...</span>
        </div>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="my-6 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Route metrics currently unavailable</span>
      </div>
    );
  }

  const hasPathNodes = routeData.path && Array.isArray(routeData.path) && routeData.path.length > 0;

  return (
    <div className="my-6 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>{fromName}</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                <span>{toName}</span>
              </h3>
              {routeData.verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  <span>VERIFIED ROUTE</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Route ID: {routeData.id}</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`#/routes?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}`)}
          className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
        >
          <span>View Full Route</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border-b border-slate-800/60 bg-slate-950/30 text-xs">
        <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">Distance</span>
          <span className="text-sm font-black text-emerald-400">{displayDistance}</span>
        </div>
        <div className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">Travel Time</span>
          <span className="text-sm font-black text-sky-400">{displayDuration}</span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase font-mono block mb-0.5">Terrain Type</span>
          <span className="text-xs font-bold text-slate-200">Himalayan Highway</span>
        </div>
      </div>

      {/* Path nodes if verified route path exists */}
      {hasPathNodes && (
        <div className="p-4 border-b border-slate-800/60 bg-slate-950/20">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">Verified Transit Waypoints ({routeData.path.length} nodes):</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {routeData.path.map((node, nIdx) => (
              <React.Fragment key={nIdx}>
                <span className="px-2 py-1 bg-slate-800/80 border border-slate-700/60 text-slate-200 text-[11px] font-medium rounded-lg">
                  {node}
                </span>
                {nIdx < routeData.path.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Embedded Google Route Map */}
      <div className="h-64 w-full relative">
        <GoogleRouteMap
          fromHubId={routeData.fromHubId}
          toHubId={routeData.toHubId}
          fromName={fromName}
          toName={toName}
          activeRoute={routeData}
          timelineStops={[]}
          hubs={hubs}
          destinations={destinations}
          attractions={[]}
          homestays={[]}
          onRouteLoaded={(dText, durText) => {
            if (dText) setGoogleDistance(dText);
            if (durText) setGoogleDuration(durText);
          }}
        />
      </div>

      {/* Verified Operator Fare summary embedded inside Route widget */}
      <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Verified Operator Fare Status</span>
          <span className="text-xs font-bold text-slate-200">
            {routeData.fareMin && routeData.fareMax ? `₹${routeData.fareMin} – ₹${routeData.fareMax}` : 'Fare not available'}
          </span>
        </div>
        <button
          onClick={() => navigate(`#/taxi?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}`)}
          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
        >
          <Car className="w-3.5 h-3.5" />
          <span>Check Cab Rates</span>
        </button>
      </div>
    </div>
  );
};


// ==========================================
// 2. FARES WIDGET
// [[WIDGET:FARES:FROM_ENTITY_ID:TO_ENTITY_ID]]
// ==========================================
export const FareWidget: React.FC<WidgetProps> = ({ args, navigate }) => {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const parts = args.split(/[:\s]+/).filter(Boolean);
  const fromLoc = parts[0] || 'NJP Railway Station Stand';
  const toLoc = parts[1] || 'Darjeeling Motor Stand';

  useEffect(() => {
    let isMounted = true;
    async function loadOperators() {
      try {
        const res = await fetchCachedJson('/api/taxi-operators');
        const ops = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
        if (isMounted) setOperators(ops);
      } catch (e) {
        console.warn('[FareWidget] Failed to fetch operators', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOperators();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="my-6 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse text-xs text-slate-400">
        Loading verified operator fares...
      </div>
    );
  }

  return (
    <div className="my-6">
      <MarketReferenceFareCard
        fromLocation={fromLoc}
        toLocation={toLoc}
        operators={operators}
        compact={true}
      />
    </div>
  );
};


// ==========================================
// 3. HOMESTAYS WIDGET
// [[WIDGET:HOMESTAYS:DESTINATION_ID]]
// ==========================================
export const HomestaysWidget: React.FC<WidgetProps> = ({ args, navigate }) => {
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [targetDestName, setTargetDestName] = useState<string>('');
  const [isNearbyDistrict, setIsNearbyDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadHomestays() {
      setLoading(true);
      try {
        const cleanArg = args.trim();
        
        // 1. Resolve destination first
        let targetDest: any = null;
        try {
          const destSingle = await fetchCachedJson(`/api/destinations/${encodeURIComponent(cleanArg)}`);
          targetDest = destSingle?.destination || (destSingle?.id ? destSingle : null);
        } catch {
          // ignore single fetch error
        }

        if (!targetDest) {
          const destSearchRes = await fetchCachedJson(`/api/destinations?search=${encodeURIComponent(cleanArg)}&limit=50`);
          const destSearchList = Array.isArray(destSearchRes) ? destSearchRes : (destSearchRes?.data || []);
          targetDest = destSearchList.find((d: any) =>
            d.id?.toLowerCase() === cleanArg.toLowerCase() ||
            d.slug?.toLowerCase() === cleanArg.toLowerCase() ||
            d.name?.toLowerCase() === cleanArg.toLowerCase()
          );
        }

        const destName = targetDest ? targetDest.name : cleanArg;
        if (isMounted) setTargetDestName(destName);

        // 2. Fetch targeted homestays by ID and Name
        const [byDestIdRes, byNameRes, generalRes] = await Promise.all([
          fetchCachedJson(`/api/homestays?destinationId=${encodeURIComponent(cleanArg)}&limit=100`).catch(() => []),
          fetchCachedJson(`/api/homestays?search=${encodeURIComponent(destName)}&limit=100`).catch(() => []),
          fetchCachedJson('/api/homestays?limit=200').catch(() => [])
        ]);

        const rawList = [
          ...(Array.isArray(byDestIdRes) ? byDestIdRes : (byDestIdRes?.data || [])),
          ...(Array.isArray(byNameRes) ? byNameRes : (byNameRes?.data || [])),
          ...(Array.isArray(generalRes) ? generalRes : (generalRes?.data || []))
        ];

        // Deduplicate
        const seenIds = new Set<string>();
        const allHomestays: Homestay[] = [];
        for (const h of rawList) {
          if (h && h.id && !seenIds.has(h.id)) {
            seenIds.add(h.id);
            allHomestays.push(h);
          }
        }

        // 1. Direct homestays strictly matching this destination/village
        const direct = allHomestays.filter(h => {
          if (!h) return false;
          const hDestId = String(h.destinationId || (h as any).destination_id || (h as any).village_code || (h as any).villageCode || '').toLowerCase();
          const targetIdLower = cleanArg.toLowerCase();
          const targetDestIdLower = targetDest ? String(targetDest.id || '').toLowerCase() : '';
          const destMatch = hDestId === targetIdLower || (targetDestIdLower && hDestId === targetDestIdLower);

          const hName = String(h.name || '').toLowerCase();
          const targetNameLower = destName.toLowerCase();
          const nameMatch = targetNameLower.length > 2 && hName.includes(targetNameLower);

          const hVillage = String((h as any).village || '').toLowerCase();
          const villageMatch = targetNameLower.length > 2 && hVillage === targetNameLower;

          const hAddress = String(h.address || '').toLowerCase();
          const addressMatch = targetNameLower.length > 2 && hAddress.includes(targetNameLower);

          return destMatch || nameMatch || villageMatch || addressMatch;
        });

        if (direct.length > 0) {
          if (isMounted) {
            setHomestays(direct);
            setIsNearbyDistrict(null);
          }
        } else if (targetDest && targetDest.district) {
          // 2. Only if direct count is 0, find homestays strictly in the same verified district
          const districtMatches = allHomestays.filter(h => 
            h && h.district && h.district.toLowerCase() === targetDest.district.toLowerCase()
          );
          if (isMounted) {
            if (districtMatches.length > 0) {
              setHomestays(districtMatches.slice(0, 3));
              setIsNearbyDistrict(targetDest.district);
            } else {
              setHomestays([]);
              setIsNearbyDistrict(null);
            }
          }
        } else {
          if (isMounted) {
            setHomestays([]);
            setIsNearbyDistrict(null);
          }
        }
      } catch (err) {
        console.warn('[HomestaysWidget] Failed to load homestays:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHomestays();
    return () => { isMounted = false; };
  }, [args]);

  if (loading) {
    return (
      <div className="my-6 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse text-xs text-slate-400">
        Loading verified homestays...
      </div>
    );
  }

  if (homestays.length === 0) {
    return (
      <div className="my-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <HomeIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Local Homestay Verification In Progress</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No direct verified homestays are currently listed in <span className="text-slate-200 font-semibold">{targetDestName || args}</span>. Local Himalayan community onboarding is actively underway.
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('#/homestays')}
            className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
          >
            Browse Verified Stays
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <HomeIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              {isNearbyDistrict ? `Verified Stays in ${isNearbyDistrict}` : 'Verified Local Homestays'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {isNearbyDistrict ? `Directly serving travelers visiting ${targetDestName}` : 'Authentic Himalayan village stays & home-cooked hospitality'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('#/homestays')}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {homestays.slice(0, 3).map((home) => {
          const coverImg = (home as any).coverImage || home.images?.[0] || 'undefined';
          const displayPrice = (home as any).pricePerNight ? `₹${(home as any).pricePerNight}/night` : (home.priceMin ? `₹${home.priceMin}–₹${home.priceMax || home.priceMin}/night` : 'Tariff on Request');

          return (
            <div 
              key={home.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img 
                    src={coverImg} 
                    alt={home.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-md text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isNearbyDistrict ? `NEARBY IN ${isNearbyDistrict.toUpperCase()}` : 'VERIFIED HOST'}</span>
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition mb-1 truncate">
                    {home.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{(home as any).village || home.address || home.district || 'Himalayas'}</span>
                  </p>

                  {/* Amenities */}
                  {home.amenities && home.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {home.amenities.slice(0, 3).map((a, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-[9px] font-medium text-slate-300 rounded">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-2">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Starting Tariff</span>
                  <span className="text-xs font-black text-amber-400">{displayPrice}</span>
                </div>
                <button
                  onClick={() => navigate(`#/homestays/${home.slug || home.id}`)}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ==========================================
// 4. ATTRACTIONS WIDGET
// [[WIDGET:ATTRACTIONS:DESTINATION_ID]]
// ==========================================
export const AttractionsWidget: React.FC<WidgetProps> = ({ args, navigate }) => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [targetDestName, setTargetDestName] = useState<string>('');
  const [isNearbyDistrict, setIsNearbyDistrict] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadAttractions() {
      setLoading(true);
      try {
        const cleanArg = args.trim();
        
        // 1. Resolve destination first
        let targetDest: any = null;
        try {
          const destSingle = await fetchCachedJson(`/api/destinations/${encodeURIComponent(cleanArg)}`);
          targetDest = destSingle?.destination || (destSingle?.id ? destSingle : null);
        } catch {
          // ignore single fetch error
        }

        if (!targetDest) {
          const destSearchRes = await fetchCachedJson(`/api/destinations?search=${encodeURIComponent(cleanArg)}&limit=50`);
          const destSearchList = Array.isArray(destSearchRes) ? destSearchRes : (destSearchRes?.data || []);
          targetDest = destSearchList.find((d: any) =>
            d.id?.toLowerCase() === cleanArg.toLowerCase() ||
            d.slug?.toLowerCase() === cleanArg.toLowerCase() ||
            d.name?.toLowerCase() === cleanArg.toLowerCase()
          );
        }

        const destName = targetDest ? targetDest.name : cleanArg;
        if (isMounted) setTargetDestName(destName);

        // 2. Fetch targeted attractions
        const [byDestIdRes, byNameRes, generalRes] = await Promise.all([
          fetchCachedJson(`/api/attractions?destinationId=${encodeURIComponent(cleanArg)}&limit=100`).catch(() => []),
          fetchCachedJson(`/api/attractions?search=${encodeURIComponent(destName)}&limit=100`).catch(() => []),
          fetchCachedJson('/api/attractions?limit=200').catch(() => [])
        ]);

        const rawList = [
          ...(Array.isArray(byDestIdRes) ? byDestIdRes : (byDestIdRes?.data || [])),
          ...(Array.isArray(byNameRes) ? byNameRes : (byNameRes?.data || [])),
          ...(Array.isArray(generalRes) ? generalRes : (generalRes?.data || []))
        ];

        // Deduplicate
        const seenIds = new Set<string>();
        const allAttractions: Attraction[] = [];
        for (const a of rawList) {
          if (a && a.id && !seenIds.has(a.id)) {
            seenIds.add(a.id);
            allAttractions.push(a);
          }
        }

        // 1. Direct attractions strictly matching this destination/village
        const direct = allAttractions.filter(a => {
          if (!a) return false;
          const aDestId = String(a.destinationId || (a as any).destination_id || '').toLowerCase();
          const targetIdLower = cleanArg.toLowerCase();
          const targetDestIdLower = targetDest ? String(targetDest.id || '').toLowerCase() : '';
          const destMatch = aDestId === targetIdLower || (targetDestIdLower && aDestId === targetDestIdLower);

          const aName = String(a.name || '').toLowerCase();
          const targetNameLower = destName.toLowerCase();
          const nameMatch = targetNameLower.length > 2 && aName.includes(targetNameLower);

          const aVillage = String((a as any).village || '').toLowerCase();
          const villageMatch = targetNameLower.length > 2 && aVillage === targetNameLower;

          return destMatch || nameMatch || villageMatch;
        });

        if (direct.length > 0) {
          if (isMounted) {
            setAttractions(direct);
            setIsNearbyDistrict(null);
          }
        } else if (targetDest && targetDest.district) {
          // 2. Only if direct count is 0, find attractions strictly in the same verified district
          const districtMatches = allAttractions.filter(a => 
            a && a.district && a.district.toLowerCase() === targetDest.district.toLowerCase()
          );
          if (isMounted) {
            if (districtMatches.length > 0) {
              setAttractions(districtMatches.slice(0, 3));
              setIsNearbyDistrict(targetDest.district);
            } else {
              setAttractions([]);
              setIsNearbyDistrict(null);
            }
          }
        } else {
          if (isMounted) {
            setAttractions([]);
            setIsNearbyDistrict(null);
          }
        }
      } catch (err) {
        console.warn('[AttractionsWidget] Failed to load attractions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAttractions();
    return () => { isMounted = false; };
  }, [args]);

  if (loading) {
    return (
      <div className="my-6 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse text-xs text-slate-400">
        Loading sightseeing attractions...
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="my-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Sightseeing & Trail Mapping In Progress</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No cataloged viewpoints or commercial attractions are currently listed for <span className="text-slate-200 font-semibold">{targetDestName || args}</span>. Local sightseeing and trail mapping is actively underway.
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('#/attractions')}
            className="px-3.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
          >
            Explore All Sights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">
              {isNearbyDistrict ? `Sightseeing in ${isNearbyDistrict}` : 'Top Sightseeing & Offbeat Sights'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {isNearbyDistrict ? `Sightseeing attractions within ${isNearbyDistrict} district` : 'Must-visit viewpoints, tea gardens & monasteries'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('#/attractions')}
          className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {attractions.slice(0, 3).map((attr) => {
          const img = attr.coverImage || attr.image || attr.gallery?.[0] || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png';

          return (
            <div 
              key={attr.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img 
                    src={img} 
                    alt={attr.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-md text-[10px] font-bold text-sky-400">
                    {attr.category || (isNearbyDistrict ? `Nearby in ${isNearbyDistrict}` : 'Sightseeing')}
                  </div>
                </div>

                <div className="p-3">
                  <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition mb-1 truncate">
                    {attr.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {attr.description || 'A majestic Himalayan landmark offering panoramic views and cultural heritage.'}
                  </p>
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-2">
                <span className="text-[10px] font-mono text-emerald-400">Free Entry</span>
                <button
                  onClick={() => navigate(`/attraction/${getItemSlug(attr)}`)}
                  className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  Explore Sight
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ==========================================
// 5. TAXI STAND WIDGET
// [[WIDGET:TAXI:ENTITY_ID]]
// ==========================================
export const TaxiWidget: React.FC<WidgetProps> = ({ args, navigate }) => {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cleanArg = args.trim();

  useEffect(() => {
    let isMounted = true;
    async function loadOperators() {
      try {
        const res = await fetchCachedJson('/api/taxi-operators');
        const ops = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
        if (isMounted) setOperators(ops);
      } catch (e) {
        console.warn('[TaxiWidget] Error loading operators', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOperators();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="my-6 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse text-xs text-slate-400">
        Loading local taxi stand & operator availability...
      </div>
    );
  }

  return (
    <div className="my-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Local Taxi Stand & Operators</h3>
            <p className="text-[10px] text-slate-400">Verified regional drivers & commercial fleet operators</p>
          </div>
        </div>
        <button
          onClick={() => navigate('#/taxi')}
          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          Check Taxi Options
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-slate-200 font-bold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Shared Taxi Service</span>
          </div>
          <p className="text-[11px] text-slate-400">Point-to-point per-seat ticket bookings operating on fixed schedule departure runs.</p>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 text-slate-200 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Reserved Car Booking</span>
          </div>
          <p className="text-[11px] text-slate-400">Private dedicated vehicles (Innova, Bolero, Sumo, Xylo) with verified drivers.</p>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 6. DESTINATION OVERVIEW WIDGET
// [[WIDGET:DESTINATION:DESTINATION_ID]]
// ==========================================
export const DestinationWidget: React.FC<WidgetProps> = ({ args, navigate }) => {
  const [dest, setDest] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDest() {
      setLoading(true);
      try {
        const cleanArg = args.trim();
        const res = await fetchCachedJson('/api/destinations');
        const allDests: Destination[] = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);

        const found = allDests.find(d => 
          d.id.toLowerCase() === cleanArg.toLowerCase() ||
          (d.slug && d.slug.toLowerCase() === cleanArg.toLowerCase()) ||
          d.name.toLowerCase().includes(cleanArg.toLowerCase())
        );

        if (isMounted) setDest(found || allDests[0] || null);
      } catch (err) {
        console.warn('[DestinationWidget] Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDest();
    return () => { isMounted = false; };
  }, [args]);

  if (loading) {
    return (
      <div className="my-6 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse text-xs text-slate-400">
        Loading destination summary...
      </div>
    );
  }

  if (!dest) return null;

  return (
    <div className="my-6 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-1 relative min-h-[160px] bg-slate-950">
          <img 
            src={dest.image || dest.coverImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png'} 
            alt={dest.name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="md:col-span-2 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-bold rounded uppercase">
                {dest.district || 'Himalayas'}
              </span>
              <span className="text-xs text-slate-400">{dest.state || 'West Bengal/Sikkim'}</span>
            </div>

            <h3 className="text-base font-extrabold text-white mb-2">{dest.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
              {dest.description || 'A majestic mountain destination featuring serene village trails and panoramic Himalayan viewpoints.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-mono">Best Season: {dest.bestSeason || 'October to May'}</span>
            <button
              onClick={() => navigate(`#/destinations/${dest.slug || dest.id}`)}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Explore {dest.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 7. BOOKING & DISCOVERY CTA WIDGET
// [[WIDGET:BOOKING:ENTITY_TYPE:ENTITY_ID]]
// ==========================================
export const BookingWidget: React.FC<WidgetProps> = ({ args, navigate }) => {
  const parts = args.split(':');
  const type = parts[0] || 'general';
  const entityName = parts[1] || 'HillyTrip';

  return (
    <div className="my-8 p-6 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[10px] font-black uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HillyTrip Travel Engine</span>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Ready to Plan Your Trip to {entityName}?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Access verified operator fares, compare offbeat village homestays, and build a custom door-to-door mountain itinerary without hidden middleman fees.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={() => navigate('#/taxi')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Car className="w-4 h-4 text-slate-950" />
            <span>Check Taxi Rates</span>
          </button>

          <button
            onClick={() => navigate('#/homestays')}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <HomeIcon className="w-4 h-4 text-slate-950" />
            <span>Find Homestays</span>
          </button>

          <button
            onClick={() => navigate('#/planner')}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>Smart Planner</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// MASTER SHORTCODE WIDGET DISPATCHER
// ==========================================
class BlogWidgetErrorBoundary extends React.Component<
  { children: React.ReactNode; fallbackText?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallbackText?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('[BlogWidgetErrorBoundary] Caught widget render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export const BlogWidgetRenderer: React.FC<{ token: string; navigate: (path: string) => void }> = ({ token, navigate }) => {
  const match = token.match(/\[\[WIDGET:([A-Z_]+)(?::([^\]]+))?\]\]/i);
  if (!match) return null;

  const type = match[1].toUpperCase();
  const args = match[2] || '';

  const renderContent = () => {
    switch (type) {
      case 'ROUTE':
        return <RouteWidget args={args} navigate={navigate} />;
      case 'FARES':
        return <FareWidget args={args} navigate={navigate} />;
      case 'HOMESTAYS':
        return <HomestaysWidget args={args} navigate={navigate} />;
      case 'ATTRACTIONS':
        return <AttractionsWidget args={args} navigate={navigate} />;
      case 'TAXI':
        return <TaxiWidget args={args} navigate={navigate} />;
      case 'DESTINATION':
        return <DestinationWidget args={args} navigate={navigate} />;
      case 'BOOKING':
        return <BookingWidget args={args} navigate={navigate} />;
      default:
        return null;
    }
  };

  return (
    <BlogWidgetErrorBoundary>
      {renderContent()}
    </BlogWidgetErrorBoundary>
  );
};
