// ====================================================================
// HILLYTRIP TAXI ROUTING & OPERATOR SERVICE AREA MATCHING ENGINE
// ====================================================================

import { calculateDynamicRoute } from '../services/routeCalculationEngine';

export interface RouteEstimate {
  from: string;
  to: string;
  distanceKm: number;
  estimatedTime: string;
  roadType: string;
  sharedAvailable: boolean;
  sharedFarePerson: number;
  sharedPickupStand: string;
  sharedFrequency: string;
  sharedFirstTrip: string;
  sharedLastTrip: string;
  reservedAvailable: boolean;
  reservedStartingPrice: number;
  polyline?: string;
  isDynamicGoogleRoute?: boolean;
}

const dynamicEstimateCache = new Map<string, RouteEstimate>();
const inFlightEstimateCache = new Map<string, Promise<RouteEstimate>>();

/**
 * Checks if a route between pickup and drop has authoritative, verified mountain corridor metrics.
 */
export function hasVerifiedMountainRoute(pickup: string, drop: string): boolean {
  const p = normalizeLocationKey(pickup);
  const d = normalizeLocationKey(drop);
  const key = `${p}-${d}`;
  const revKey = `${d}-${p}`;
  return Boolean(MOUNTAIN_ROUTE_METRICS[key] || MOUNTAIN_ROUTE_METRICS[revKey]);
}

/**
 * Dynamically fetches distance, duration, and geometry from Google Maps Routes API endpoint on-the-fly.
 * Utilizes in-flight Promise deduplication to share pending requests across concurrent callers.
 */
export async function fetchDynamicRouteEstimate(pickup: string, drop: string): Promise<RouteEstimate> {
  const p = pickup || 'Pickup Point';
  const d = drop || 'Destination';
  const cacheKey = `${p.toLowerCase().trim()}::${d.toLowerCase().trim()}`;

  // 1. Check resolved-value cache
  if (dynamicEstimateCache.has(cacheKey)) {
    return dynamicEstimateCache.get(cacheKey)!;
  }

  // 2. Check in-flight Promise cache (deduplicates concurrent requests for the same route)
  if (inFlightEstimateCache.has(cacheKey)) {
    return inFlightEstimateCache.get(cacheKey)!;
  }

  // 3. If route already has verified mountain metrics, resolve immediately with zero remote latency
  if (hasVerifiedMountainRoute(p, d)) {
    const verified = getRouteEstimate(p, d);
    dynamicEstimateCache.set(cacheKey, verified);
    return verified;
  }

  // 4. Create in-flight Promise for unlisted dynamic routes
  const fetchPromise = (async (): Promise<RouteEstimate> => {
    const slugParam = `${p.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-to-${d.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    try {
      const res = await fetch(`/api/routes/${encodeURIComponent(slugParam)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.route) {
          const r = data.route;

          // Detect if response is a stale generic mock fallback (55 km / 90 mins / null or 1600 min fare)
          const pNorm = normalizeLocationKey(p);
          const dNorm = normalizeLocationKey(d);
          const isLegitNjpSittong = (pNorm === 'njp' && dNorm === 'sittong') || (pNorm === 'sittong' && dNorm === 'njp');
          const isGenericMockFallback = r.distance === 55 && (r.timeMin === 90 || !r.timeMin) && !isLegitNjpSittong;

          if (!isGenericMockFallback && r.distance && r.distance > 0) {
            const distKm = r.distance;
            const durMins = r.timeMin || Math.round(distKm * 1.8 + 15);
            const hrs = Math.floor(durMins / 60);
            const mins = durMins % 60;
            const timeFormatted = r.timeFormatted || (hrs > 0 ? (mins > 0 ? `${hrs} hrs ${mins} mins` : `${hrs} hrs`) : `${durMins} mins`);

            const result: RouteEstimate = {
              from: r.fromName || p,
              to: r.toName || d,
              distanceKm: distKm,
              estimatedTime: timeFormatted,
              roadType: r.Description || r.description || r.roadType || 'National Mountain Highway Corridor',
              sharedAvailable: true,
              sharedFarePerson: r.sharedFarePerSeat || Math.max(250, Math.min(600, Math.round(distKm * 4.5))),
              sharedPickupStand: `${p} Taxi Stand`,
              sharedFrequency: 'Every 20-30 mins',
              sharedFirstTrip: '06:00 AM',
              sharedLastTrip: '05:00 PM',
              reservedAvailable: true,
              reservedStartingPrice: r.fareMin || Math.round(Math.max(1600, distKm * 28)),
              polyline: r.polyline || '',
              isDynamicGoogleRoute: true
            };
            dynamicEstimateCache.set(cacheKey, result);
            return result;
          }
        }
      }
    } catch (err) {
      console.warn('[taxiRoutingEngine] Dynamic Google route fetch failed, using fallback calculation:', err);
    }

    // Authoritative dynamic calculation fallback if network/API is unavailable
    const fallback = getRouteEstimate(p, d);
    dynamicEstimateCache.set(cacheKey, fallback);
    return fallback;
  })().finally(() => {
    // Clean up in-flight cache on resolve or reject
    inFlightEstimateCache.delete(cacheKey);
  });

  inFlightEstimateCache.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// Popular Mountain Corridors with accurate transport metrics
export const MOUNTAIN_ROUTE_METRICS: Record<string, RouteEstimate> = {
  'njp-kalimpong': {
    from: 'NJP Railway Station',
    to: 'Kalimpong',
    distanceKm: 61.9,
    estimatedTime: '2 hrs 13 mins',
    roadType: 'National Highway NH10 via Sevoke & Teesta Bridge',
    sharedAvailable: true,
    sharedFarePerson: 350,
    sharedPickupStand: 'NJP Taxi Stand (Gate #2, Hill Line)',
    sharedFrequency: 'Every 20-30 mins',
    sharedFirstTrip: '06:00 AM',
    sharedLastTrip: '04:30 PM',
    reservedAvailable: true,
    reservedStartingPrice: 1560,
  },
  'bagdogra-darjeeling': {
    from: 'Bagdogra Airport',
    to: 'Darjeeling',
    distanceKm: 60.2,
    estimatedTime: '2 hrs 10 mins',
    roadType: 'Rohini Road & Pankhabari Ghats',
    sharedAvailable: true,
    sharedFarePerson: 400,
    sharedPickupStand: 'Siliguri Junction Motor Stand',
    sharedFrequency: 'Every 30 mins',
    sharedFirstTrip: '06:30 AM',
    sharedLastTrip: '04:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: 1517,
  },
  'njp-darjeeling': {
    from: 'NJP Railway Station',
    to: 'Darjeeling',
    distanceKm: 65.6,
    estimatedTime: '2 hrs 20 mins',
    roadType: 'Hill Cart Road / Rohini Highway',
    sharedAvailable: true,
    sharedFarePerson: 380,
    sharedPickupStand: 'NJP Shared Taxi Stand (Main Exit)',
    sharedFrequency: 'Every 20 mins',
    sharedFirstTrip: '05:30 AM',
    sharedLastTrip: '05:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: 1653,
  },
  'kalimpong-lava': {
    from: 'Kalimpong',
    to: 'Lava',
    distanceKm: 32,
    estimatedTime: '1 hr 15 mins',
    roadType: 'Algarah - Lava Forest Road',
    sharedAvailable: true,
    sharedFarePerson: 150,
    sharedPickupStand: 'Kalimpong Motor Stand',
    sharedFrequency: 'Every 30 mins',
    sharedFirstTrip: '07:00 AM',
    sharedLastTrip: '04:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: 1600,
  },
  'darjeeling-kalimpong': {
    from: 'Darjeeling',
    to: 'Kalimpong',
    distanceKm: 52,
    estimatedTime: '2 hrs 00 mins',
    roadType: 'Peshok Tea Garden & Teesta Bazaar Corridor',
    sharedAvailable: true,
    sharedFarePerson: 250,
    sharedPickupStand: 'Chowk Bazaar Stand, Darjeeling',
    sharedFrequency: 'Every 30 mins',
    sharedFirstTrip: '06:30 AM',
    sharedLastTrip: '04:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: 1600,
  },
  'siliguri-lava': {
    from: 'Siliguri',
    to: 'Lava',
    distanceKm: 98,
    estimatedTime: '3 hrs 45 mins',
    roadType: 'Gajoldoba & Gorubathan Highway',
    sharedAvailable: true,
    sharedFarePerson: 450,
    sharedPickupStand: 'Pani Tanki Motor Stand, Siliguri',
    sharedFrequency: 'Every 45 mins',
    sharedFirstTrip: '07:00 AM',
    sharedLastTrip: '03:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: 3600,
  },
  'njp-gangtok': {
    from: 'NJP Railway Station',
    to: 'Gangtok',
    distanceKm: 115,
    estimatedTime: '4 hrs 15 mins',
    roadType: 'Teesta Valley NH10 & Rangpo Border',
    sharedAvailable: true,
    sharedFarePerson: 450,
    sharedPickupStand: 'NJP Shared Sikkim Taxi Bay',
    sharedFrequency: 'Every 15 mins',
    sharedFirstTrip: '06:00 AM',
    sharedLastTrip: '05:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: 2898,
  },
  'bagdogra-gangtok': {
    from: 'Bagdogra Airport',
    to: 'Gangtok',
    distanceKm: 115.6,
    estimatedTime: '3 hrs 57 mins',
    roadType: 'NH10 & Coronation Bridge Corridor',
    sharedAvailable: true,
    sharedFarePerson: 500,
    sharedPickupStand: 'Bagdogra Prepaid Counter & Deorali Bay',
    sharedFrequency: 'Every 30 mins',
    sharedFirstTrip: '07:00 AM',
    sharedLastTrip: '04:30 PM',
    reservedAvailable: true,
    reservedStartingPrice: 2913,
  },
  'darjeeling-takdah': {
    from: 'Darjeeling',
    to: 'Takdah',
    distanceKm: 28,
    estimatedTime: '1 hr 15 mins',
    roadType: 'Ghoom - Lamahatta Ridge Line',
    sharedAvailable: true,
    sharedFarePerson: 180,
    sharedPickupStand: 'Chowk Bazaar Motor Stand, Darjeeling',
    sharedFrequency: 'Every 45 mins',
    sharedFirstTrip: '08:00 AM',
    sharedLastTrip: '03:30 PM',
    reservedAvailable: true,
    reservedStartingPrice: 1800,
  },
  'gangtok-pelling': {
    from: 'Gangtok',
    to: 'Pelling',
    distanceKm: 121.7,
    estimatedTime: '3 hrs 45 mins',
    roadType: 'Ravangla & Legship Highway',
    sharedAvailable: true,
    sharedFarePerson: 548,
    sharedPickupStand: 'Deorali Stand, Gangtok',
    sharedFrequency: 'Fixed 07:00 AM & 01:00 PM',
    sharedFirstTrip: '07:00 AM',
    sharedLastTrip: '01:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: 3067,
  },
  'njp-sittong': {
    from: 'NJP Railway Station',
    to: 'Sittong',
    distanceKm: 55,
    estimatedTime: '2 hrs 15 mins',
    roadType: 'Kalijhora & Latpanchar Pine Trail',
    sharedAvailable: true,
    sharedFarePerson: 280,
    sharedPickupStand: 'Siliguri Junction Sittong Stand',
    sharedFrequency: 'Fixed 11:00 AM & 02:00 PM',
    sharedFirstTrip: '11:00 AM',
    sharedLastTrip: '02:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: 2500,
  }
};

/**
 * Gets distance/time metrics for a given route query.
 */
export function getRouteEstimate(pickup: string, drop: string): RouteEstimate {
  const p = normalizeLocationKey(pickup);
  const d = normalizeLocationKey(drop);
  const key = `${p}-${d}`;

  if (MOUNTAIN_ROUTE_METRICS[key]) {
    return MOUNTAIN_ROUTE_METRICS[key];
  }

  // Reverse lookup
  const revKey = `${d}-${p}`;
  if (MOUNTAIN_ROUTE_METRICS[revKey]) {
    const rev = MOUNTAIN_ROUTE_METRICS[revKey];
    return {
      ...rev,
      from: pickup,
      to: drop
    };
  }

  // Authoritative dynamic calculation for any arbitrary mountain route
  const dynamic = calculateDynamicRoute(pickup, drop);
  return {
    from: dynamic.fromName || pickup || 'Pickup Point',
    to: dynamic.toName || drop || 'Destination',
    distanceKm: dynamic.distanceKm,
    estimatedTime: dynamic.timeFormatted,
    roadType: dynamic.roadType || dynamic.description,
    sharedAvailable: true,
    sharedFarePerson: dynamic.sharedFarePerSeat,
    sharedPickupStand: `${pickup} Shared Taxi Counter`,
    sharedFrequency: 'Every 30-45 mins',
    sharedFirstTrip: '06:30 AM',
    sharedLastTrip: '04:00 PM',
    reservedAvailable: true,
    reservedStartingPrice: dynamic.fareMin,
    polyline: dynamic.polyline || '',
    isDynamicGoogleRoute: true
  };
}

function normalizeLocationKey(loc: string): string {
  const s = (loc || '').toLowerCase();
  if (s.includes('njp') || s.includes('new jalpaiguri')) return 'njp';
  if (s.includes('bagdogra') || s.includes('ixb')) return 'bagdogra';
  if (s.includes('siliguri')) return 'siliguri';
  if (s.includes('kalimpong')) return 'kalimpong';
  if (s.includes('darjeeling')) return 'darjeeling';
  if (s.includes('lava')) return 'lava';
  if (s.includes('gangtok')) return 'gangtok';
  if (s.includes('takdah')) return 'takdah';
  if (s.includes('pelling')) return 'pelling';
  if (s.includes('sittong')) return 'sittong';
  return s.replace(/[^a-z0-9]/g, '');
}

/**
 * Check if an operator serves BOTH pickup location AND drop location.
 */
export function isOperatorRouteMatch(
  operator: {
    pickup_areas?: string[];
    drop_areas?: string[];
    working_areas?: string[];
    fixedRoutes?: Array<{ from_location: string; to_location: string }>;
    base_taxi_stand?: string;
  },
  pickupQuery: string,
  dropQuery: string
): boolean {
  if (!pickupQuery || !dropQuery) return true;

  const pNorm = pickupQuery.trim().toLowerCase();
  const dNorm = dropQuery.trim().toLowerCase();

  // 1. Check direct fixed routes matching
  if (operator.fixedRoutes && operator.fixedRoutes.length > 0) {
    const hasFixedMatch = operator.fixedRoutes.some((r) => {
      const rf = r.from_location.toLowerCase();
      const rt = r.to_location.toLowerCase();
      const fromMatch = rf.includes(pNorm) || pNorm.includes(rf) || locationBelongsToArea(pNorm, rf);
      const toMatch = rt.includes(dNorm) || dNorm.includes(rt) || locationBelongsToArea(dNorm, rt);
      return fromMatch && toMatch;
    });
    if (hasFixedMatch) return true;
  }

  // 2. Check explicit pickup_areas AND drop_areas arrays
  const pickupAreas = operator.pickup_areas || [];
  const dropAreas = operator.drop_areas || [];

  if (pickupAreas.length > 0 && dropAreas.length > 0) {
    const servesPickup = pickupAreas.some((pa) => pa.toLowerCase().includes(pNorm) || pNorm.includes(pa.toLowerCase()) || locationBelongsToArea(pNorm, pa.toLowerCase()));
    const servesDrop = dropAreas.some((da) => da.toLowerCase().includes(dNorm) || dNorm.includes(da.toLowerCase()) || locationBelongsToArea(dNorm, da.toLowerCase()));

    return servesPickup && servesDrop;
  }

  // 3. Check general working_areas / base_taxi_stand
  const workingAreas = (operator.working_areas || []).map((w) => w.toLowerCase());
  const baseStand = (operator.base_taxi_stand || '').toLowerCase();

  if (workingAreas.length > 0) {
    const pickupInWorking = workingAreas.some((w) => locationBelongsToArea(pNorm, w)) || baseStand.includes(pNorm) || pNorm.includes(baseStand);
    const dropInWorking = workingAreas.some((w) => locationBelongsToArea(dNorm, w));
    return pickupInWorking && dropInWorking;
  }

  // 4. Default: If no restrictive routes/working areas are configured, operator is available for regional routes
  return true;
}

/**
 * Helper to match specific towns/hubs to broader districts or transport hubs.
 */
function locationBelongsToArea(location: string, area: string): boolean {
  const l = location.toLowerCase();
  const a = area.toLowerCase();

  if (l === a) return true;

  // Plain Hubs (NJP, Bagdogra, Siliguri)
  const isPlainHubL = l.includes('njp') || l.includes('bagdogra') || l.includes('siliguri') || l.includes('jalpaiguri');
  const isPlainHubA = a.includes('njp') || a.includes('bagdogra') || a.includes('siliguri') || a.includes('plain');
  if (isPlainHubL && isPlainHubA) return true;

  // Kalimpong District
  if ((l.includes('kalimpong') || l.includes('lava') || l.includes('pedong') || l.includes('rishyap') || l.includes('loleygaon')) &&
      (a.includes('kalimpong') || a.includes('lava') || a.includes('east sikkim gateway'))) return true;

  // Darjeeling District
  if ((l.includes('darjeeling') || l.includes('takdah') || l.includes('tinchuley') || l.includes('kurseong') || l.includes('mirik') || l.includes('ghoom')) &&
      (a.includes('darjeeling') || a.includes('kurseong'))) return true;

  // East Sikkim
  if ((l.includes('gangtok') || l.includes('rangpo') || l.includes('singtam') || l.includes('pakyong') || l.includes('zuluk')) &&
      (a.includes('east sikkim') || a.includes('gangtok'))) return true;

  // West Sikkim
  if ((l.includes('pelling') || l.includes('yuksom') || l.includes('gyalshing') || l.includes('dentam')) &&
      (a.includes('west sikkim') || a.includes('pelling'))) return true;

  // South Sikkim
  if ((l.includes('namchi') || l.includes('ravangla') || l.includes('tarey bhir')) &&
      (a.includes('south sikkim') || a.includes('namchi'))) return true;

  return false;
}
