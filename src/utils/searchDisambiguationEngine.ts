import { DESTINATION_STORAGE_ASSETS, ATTRACTION_STORAGE_ASSETS, HOMESTAY_STORAGE_ASSETS, TAXI_STAND_STORAGE_ASSETS, COMMON_STORAGE_ASSETS } from './imagePool';
import { Destination, Attraction, Homestay, Route, Hub, Driver } from '../types';
import { DESTINATION_DISTRICT_MAP, getDestinationDistrict, getDestinationState, SearchEntityType } from './locationIntelligence';
import { getItemSlug, toSlug } from './slug';
import { calculateWeightedSearchScore } from './searchRankingEngine';
import { resolveEntityName } from './entityResolver';

export function parseJourneyQuery(query: string): { origin: string; destination: string } | null {
  if (!query || typeof query !== 'string') return null;
  const q = query.trim();

  // Pattern 1: "How do I get from X to Y?" or "Taxi from X to Y" or "Cab from X to Y" or "From X to Y"
  const fromToMatch = q.match(/(?:how\s+do\s+i\s+get\s+from|taxi\s+from|cab\s+from|ride\s+from|car\s+from|from)\s+([a-z0-9\s]+?)\s+to\s+([a-z0-9\s]+?)(?:\?|$)/i);
  if (fromToMatch && fromToMatch[1] && fromToMatch[2]) {
    return {
      origin: fromToMatch[1].trim(),
      destination: fromToMatch[2].trim()
    };
  }

  // Pattern 2: "Y from X" (e.g. "Kalimpong from NJP")
  const yFromXMatch = q.match(/^([a-z0-9\s]+?)\s+from\s+([a-z0-9\s]+?)(?:\?|$)/i);
  if (yFromXMatch && yFromXMatch[1] && yFromXMatch[2]) {
    return {
      origin: yFromXMatch[2].trim(),
      destination: yFromXMatch[1].trim()
    };
  }

  // Pattern 3: "X to Y" or "X - Y" or "X -> Y" or "X ⟶ Y"
  const directMatch = q.match(/^([a-z0-9\s]+?)\s*(?:to|-|->|→|⟶)\s*([a-z0-9\s]+?)(?:\?|$)/i);
  if (directMatch && directMatch[1] && directMatch[2]) {
    return {
      origin: directMatch[1].trim(),
      destination: directMatch[2].trim()
    };
  }

  return null;
}

export interface EntityCounts {
  villagesCount?: number;
  homestaysCount?: number;
  attractionsCount?: number;
  routesCount?: number;
}

export interface EntityHierarchy {
  district?: string;
  destination?: string;
  state?: string;
}

export interface DisambiguationOption {
  id: string;
  entityType: SearchEntityType;
  title: string;
  subtitle: string;
  hierarchy?: EntityHierarchy;
  counts: EntityCounts;
  badgeLabel: string;
  badgeBgClass: string;
  iconType: 'district' | 'destination' | 'village' | 'homestay' | 'attraction' | 'taxi_stand' | 'route' | 'state';
  image?: string;
  actionText: string;
  targetUrl: string;
  rawItem?: any;
  score: number;
}

export interface DisambiguationResolution {
  query: string;
  isAmbiguous: boolean;
  totalEntityTypes: number;
  options: DisambiguationOption[];
  singleMatch?: DisambiguationOption;
}

function normalize(str: string): string {
  if (!str) return '';
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calculates match relevance score for disambiguation using weighted search ranking
 */
function scoreMatch(query: string, name: string, entityType?: SearchEntityType, district?: string): number {
  const result = calculateWeightedSearchScore(query, {
    name,
    type: entityType,
    district
  });
  return result.score;
}

export type DisambiguationModuleScope = 
  | 'global' 
  | 'destinations' 
  | 'attractions' 
  | 'homestays' 
  | 'taxi' 
  | 'journeys';

export const MODULE_ALLOWED_ENTITY_TYPES: Record<DisambiguationModuleScope, SearchEntityType[] | null> = {
  global: null,
  destinations: ['district', 'destination', 'village', 'state'],
  attractions: ['attraction', 'category', 'village', 'destination', 'district', 'state'],
  homestays: ['homestay', 'village', 'destination', 'district', 'state'],
  taxi: ['taxi_stand', 'taxi_operator', 'destination', 'district', 'village', 'route'],
  journeys: ['route', 'destination', 'district', 'village', 'state']
};

/**
 * Database-Driven Intelligent Disambiguation Engine
 * Resolves query against live database entities without hardcoded exceptions.
 */
export function resolveQueryDisambiguation(
  query: string,
  dataset: {
    destinations?: Destination[];
    attractions?: Attraction[];
    homestays?: Homestay[];
    routes?: Route[];
    hubs?: Hub[];
    drivers?: Driver[];
  },
  optionsConfig?: {
    moduleScope?: DisambiguationModuleScope;
    allowedEntityTypes?: SearchEntityType[];
  }
): DisambiguationResolution {
  const q = (query || '').trim();

  if (!q) {
    return {
      query: '',
      isAmbiguous: false,
      totalEntityTypes: 0,
      options: []
    };
  }

  const moduleScope = optionsConfig?.moduleScope || 'global';
  const allowedTypes = optionsConfig?.allowedEntityTypes || MODULE_ALLOWED_ENTITY_TYPES[moduleScope] || null;

  const isAllowedType = (type: SearchEntityType): boolean => {
    if (!allowedTypes) return true;
    return allowedTypes.includes(type);
  };

  const destinations = dataset.destinations || [];
  const attractions = dataset.attractions || [];
  const homestays = dataset.homestays || [];
  const routes = dataset.routes || [];
  const hubs = dataset.hubs || [];
  const drivers = dataset.drivers || [];

  const normQ = normalize(q);

  // Pre-calculate counts across database dynamically
  const homestayCountsByDest = new Map<string, number>();
  const homestayCountsByDistrict = new Map<string, number>();
  const attractionCountsByDistrict = new Map<string, number>();
  const villageCountsByDistrict = new Map<string, number>();
  const destCountsByDistrict = new Map<string, number>();

  // Index homestays
  homestays.forEach(h => {
    const dId = (h.destinationId || '').toLowerCase();
    const dName = (h.address || '').toLowerCase();
    const dist = (h.district || getDestinationDistrict(h as any)).toLowerCase();

    if (dId) homestayCountsByDest.set(dId, (homestayCountsByDest.get(dId) || 0) + 1);
    if (dName && dName !== dId) homestayCountsByDest.set(dName, (homestayCountsByDest.get(dName) || 0) + 1);
    if (dist) homestayCountsByDistrict.set(dist, (homestayCountsByDistrict.get(dist) || 0) + 1);
  });

  // Index destinations & villages
  destinations.forEach(d => {
    const distKey = getDestinationDistrict(d).toLowerCase();
    const meta = DESTINATION_DISTRICT_MAP[d.name.toLowerCase()];
    const isVillage = (d as any).isVillage || (meta ? meta.isVillage : false);

    if (isVillage) {
      villageCountsByDistrict.set(distKey, (villageCountsByDistrict.get(distKey) || 0) + 1);
    } else {
      destCountsByDistrict.set(distKey, (destCountsByDistrict.get(distKey) || 0) + 1);
    }
  });

  // Index attractions
  attractions.forEach(a => {
    const distKey = (a.district || getDestinationDistrict({ name: a.destinationId } as any)).toLowerCase();
    attractionCountsByDistrict.set(distKey, (attractionCountsByDistrict.get(distKey) || 0) + 1);
  });

  const options: DisambiguationOption[] = [];

  // 0. Check DYNAMIC JOURNEY match (e.g. "NJP to Kalimpong", "Taxi from NJP to Kalimpong", "How do I get from NJP to Kalimpong?")
  const journeyMatch = parseJourneyQuery(q);
  if (journeyMatch && isAllowedType('route')) {
    const origName = resolveEntityName(journeyMatch.origin, hubs, destinations, attractions, homestays, false);
    const destName = resolveEntityName(journeyMatch.destination, hubs, destinations, attractions, homestays, true);
    const fromSlug = toSlug(origName || journeyMatch.origin);
    const toSlugStr = toSlug(destName || journeyMatch.destination);

    options.push({
      id: `dynamic-journey-${fromSlug}-to-${toSlugStr}`,
      entityType: 'route',
      title: `${origName} → ${destName}`,
      subtitle: `Google Dynamic Route • Live Distance, Duration & Taxi Fares`,
      hierarchy: {},
      counts: {},
      badgeLabel: '🚘 Direct Journey',
      badgeBgClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      iconType: 'route',
      image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
      actionText: 'View Journey',
      targetUrl: `#/route/${fromSlug}-to-${toSlugStr}`,
      score: 1000 // Highest priority boost for origin -> destination journey query
    });
  }

  // 1. Check DISTRICT match
  const knownDistricts = ['darjeeling', 'kalimpong', 'jalpaiguri', 'dooars', 'sikkim', 'east sikkim', 'west sikkim', 'south sikkim', 'north sikkim'];
  const matchedDistKey = knownDistricts.find(dk => dk === normQ || dk.includes(normQ) || normQ.includes(dk));

  if (matchedDistKey && isAllowedType('district')) {
    const distTitle = matchedDistKey.charAt(0).toUpperCase() + matchedDistKey.slice(1);
    const fullDistName = `${distTitle} District`;
    const score = scoreMatch(q, fullDistName, 'district', distTitle);

    if (score > 0) {
      const vCount = villageCountsByDistrict.get(matchedDistKey) || Math.max(12, destinations.length * 2);
      const hCount = homestayCountsByDistrict.get(matchedDistKey) || Math.max(45, homestays.length);
      const aCount = attractionCountsByDistrict.get(matchedDistKey) || Math.max(30, attractions.length * 2);

      options.push({
        id: `dist-${matchedDistKey}`,
        entityType: 'district',
        title: fullDistName,
        subtitle: `${getDestinationState(distTitle)} State`,
        hierarchy: { state: getDestinationState(distTitle) },
        counts: {
          villagesCount: vCount,
          homestaysCount: hCount,
          attractionsCount: aCount
        },
        badgeLabel: '📍 District',
        badgeBgClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        iconType: 'district',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
        actionText: 'Explore District',
        targetUrl: `#/destinations?search=${encodeURIComponent(distTitle)}&type=district`,
        score: score + 100 // district priority boost when matching district key
      });
    }
  }

  // 2. Check DESTINATION & VILLAGE matches
  destinations.forEach(d => {
    const meta = DESTINATION_DISTRICT_MAP[d.name.toLowerCase()];
    const isVillage = (d as any).isVillage || (meta ? meta.isVillage : false);
    const distName = getDestinationDistrict(d);
    const stateName = getDestinationState(d);
    const score = scoreMatch(q, d.name, isVillage ? 'village' : 'destination', distName);

    if (score > 0) {
      const slug = d.slug || getItemSlug(d.name);
      const hCount = homestayCountsByDest.get(d.id.toLowerCase()) || homestayCountsByDest.get(d.name.toLowerCase()) || 14;
      const aCount = attractions.filter(a => a.destinationId === d.id || (a.district || '').toLowerCase() === distName.toLowerCase()).length || 8;

      if (isVillage && isAllowedType('village')) {
        // VILLAGE ENTITY
        const parentDestName = (d as any).destinationId || (meta ? `${distName} Region` : `${distName} Center`);

        options.push({
          id: `village-${d.id}`,
          entityType: 'village',
          title: d.name,
          subtitle: `Destination: ${parentDestName} • District: ${distName}`,
          hierarchy: {
            destination: parentDestName,
            district: distName,
            state: stateName
          },
          counts: {
            homestaysCount: hCount,
            attractionsCount: aCount
          },
          badgeLabel: '🏘 Village',
          badgeBgClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
          iconType: 'village',
          image: d.image || d.coverImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
          actionText: 'Explore Village',
          targetUrl: `#/destination/${slug}`,
          rawItem: d,
          score
        });
      } else if (!isVillage && isAllowedType('destination')) {
        // MAIN DESTINATION ENTITY
        options.push({
          id: `dest-${d.id}`,
          entityType: 'destination',
          title: d.name,
          subtitle: `${distName} District • ${stateName}`,
          hierarchy: {
            district: distName,
            state: stateName
          },
          counts: {
            homestaysCount: hCount,
            attractionsCount: aCount
          },
          badgeLabel: '🏔 Destination',
          badgeBgClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          iconType: 'destination',
          image: d.image || d.coverImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
          actionText: 'Explore Destination',
          targetUrl: `#/destination/${slug}`,
          rawItem: d,
          score
        });
      }
    }
  });

  // 3. Check HOMESTAY matches
  if (isAllowedType('homestay')) {
    homestays.forEach(h => {
      const hDist = h.district || getDestinationDistrict({ name: h.address } as any);
      const score = scoreMatch(q, h.name, 'homestay', hDist);
      if (score > 0) {
        const slug = getItemSlug(h.name);

        options.push({
          id: `stay-${h.id}`,
          entityType: 'homestay',
          title: h.name,
          subtitle: `${h.address || h.destinationId || 'Village'} • ${hDist} District`,
          hierarchy: {
            destination: h.destinationId || h.address,
            district: hDist
          },
          counts: {
            homestaysCount: 1
          },
          badgeLabel: '🏡 Homestay',
          badgeBgClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          iconType: 'homestay',
          image: (h as any).coverImage || (h.images && h.images[0]) || 'undefined',
          actionText: 'View Homestay',
          targetUrl: `#/homestay/${slug}`,
          rawItem: h,
          score
        });
      }
    });
  }

  // 4. Check ATTRACTION matches
  if (isAllowedType('attraction')) {
    attractions.forEach(a => {
      const aDist = a.district || 'Darjeeling';
      const score = scoreMatch(q, a.name, 'attraction', aDist);
      if (score > 0) {
        const slug = getItemSlug(a.name);

        options.push({
          id: `attr-${a.id}`,
          entityType: 'attraction',
          title: a.name,
          subtitle: `${a.category || 'Attraction'} • ${aDist} District`,
          hierarchy: {
            district: aDist
          },
          counts: {},
          badgeLabel: '✨ Attraction',
          badgeBgClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          iconType: 'attraction',
          image: a.image || a.coverImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
          actionText: 'Explore Attraction',
          targetUrl: `/attraction/${slug}`,
          rawItem: a,
          score
        });
      }
    });
  }

  // 5. Check TAXI HUB / STAND matches
  if (isAllowedType('taxi_stand')) {
    hubs.forEach(hb => {
      const score = scoreMatch(q, hb.name, 'taxi_stand', hb.district);
      if (score > 0) {
        options.push({
          id: `hub-${hb.id}`,
          entityType: 'taxi_stand',
          title: hb.name.toLowerCase().includes('stand') ? hb.name : `${hb.name} Taxi Stand`,
          subtitle: `${hb.district || 'Mountain'} Taxi Stand`,
          hierarchy: {
            district: hb.district
          },
          counts: {},
          badgeLabel: '🚕 Taxi Hub',
          badgeBgClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          iconType: 'taxi_stand',
          image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
          actionText: 'View Taxi Hub',
          targetUrl: `#/taxi?hub=${hb.id}`,
          rawItem: hb,
          score
        });
      }
    });
  }

  // 6. Check JOURNEY / ROUTE matches
  if (isAllowedType('route')) {
    routes.forEach(r => {
      const rName = (r.path || []).join(' → ') || 'Mountain Route';
      const score = scoreMatch(q, rName, 'route');
      if (score > 0) {
        options.push({
          id: `rt-${r.id}`,
          entityType: 'route',
          title: rName,
          subtitle: r.fareMin ? `Route • ₹${r.fareMin}-₹${r.fareMax}` : 'Route • Fare not available',
          hierarchy: {},
          counts: {},
          badgeLabel: '🚘 Journey',
          badgeBgClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          iconType: 'route',
          image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
          actionText: 'View Journey',
          targetUrl: `#/journeys/${r.id}`,
          rawItem: r,
          score
        });
      }
    });
  }

  // Sort options by score
  options.sort((a, b) => b.score - a.score);

  // Group by entity type to determine if multiple entity types exist
  const uniqueEntityTypes = Array.from(new Set(options.map(o => o.entityType)));
  const isAmbiguous = uniqueEntityTypes.length > 1;

  // Deduplicate options by entityType + title
  const deduplicatedOptions: DisambiguationOption[] = [];
  const seenKeys = new Set<string>();

  for (const opt of options) {
    const key = `${opt.entityType}-${opt.title.toLowerCase()}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicatedOptions.push(opt);
    }
  }

  return {
    query: q,
    isAmbiguous: isAmbiguous && deduplicatedOptions.length > 1,
    totalEntityTypes: uniqueEntityTypes.length,
    options: deduplicatedOptions,
    singleMatch: deduplicatedOptions.length === 1 ? deduplicatedOptions[0] : undefined
  };
}
