// HillyTrip Universal Hero Search Engine
// High-performance indexed search engine with strict group ordering & ranking priority

import { Destination, Attraction, Homestay, Driver, Hub, Route, Blog } from '../types';
import { HIMALAYAN_PLACES } from '../utils/placeSuggestions';
import { getItemSlug } from '../utils/slug';

export type SearchEntityTypeKey = 
  | 'villages'
  | 'destinations'
  | 'attractions'
  | 'homestays'
  | 'taxi_operators'
  | 'taxi_stands'
  | 'routes'
  | 'experiences'
  | 'blogs'
  | 'events';

export interface UniversalHeroResultItem {
  id: string;
  name: string;
  subtitle?: string; // Secondary location info (e.g., "📍 Darjeeling")
  entityTypeKey: SearchEntityTypeKey;
  typeParam: string; // URL query param e.g. "destinations", "attractions", "homestays", "taxi-operators", "taxi-stands", "routes"
  url: string;
  popularityScore: number;
  rawItem?: any;
}

export interface UniversalHeroGroup {
  entityTypeKey: SearchEntityTypeKey;
  groupName: string;
  icon: string; // Emoji e.g. "📍", "🏞", "🏡", "🚖", "🗺"
  typeParam: string;
  totalCount: number;
  previewItems: UniversalHeroResultItem[]; // Max 3 items
  allItems: UniversalHeroResultItem[];
  viewAllUrl: string;
}

export interface SearchDataSources {
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  drivers?: Driver[];
  hubs?: Hub[];
  routes?: Route[];
  experiences?: any[];
  blogs?: Blog[];
  events?: any[];
}

/**
 * Rank items within a group using strict priority:
 * 1. Exact Match (title === q)
 * 2. Starts With (title.startsWith(q))
 * 3. Contains Keyword (title.includes(q))
 * 4. Popularity Score (descending)
 * 5. Alphabetical (a-z)
 */
function rankItems(items: UniversalHeroResultItem[], query: string): UniversalHeroResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return [...items].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    // 1. Exact match tier
    const aExact = aName === q;
    const bExact = bName === q;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // 2. Starts with tier
    const aStarts = aName.startsWith(q);
    const bStarts = bName.startsWith(q);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // 3. Contains keyword tier
    const aContains = aName.includes(q);
    const bContains = bName.includes(q);
    if (aContains && !bContains) return -1;
    if (!aContains && bContains) return 1;

    // 4. Popularity Score tier (higher is better)
    if (b.popularityScore !== a.popularityScore) {
      return b.popularityScore - a.popularityScore;
    }

    // 5. Alphabetical tier
    return a.name.localeCompare(b.name);
  });
}

/**
 * Perform Universal Hero Search across all supported entities simultaneously
 */
export function executeUniversalHeroSearch(
  query: string,
  sources: SearchDataSources
): UniversalHeroGroup[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  // Helper function to resolve destination name for an ID
  const resolveDestinationName = (destId?: string): string => {
    if (!destId || !sources.destinations) return '';
    const found = sources.destinations.find(d => d.id === destId);
    return found ? found.name : '';
  };

  // Helper function to resolve hub name
  const resolveHubName = (hubId?: string): string => {
    if (!hubId || !sources.hubs) return '';
    const found = sources.hubs.find(h => h.id === hubId);
    return found ? found.name : '';
  };

  // Helper function to check if item matches query
  const itemMatches = (name: string, subtitle: string = '', tags: string[] = []): boolean => {
    const n = name.toLowerCase();
    const s = subtitle.toLowerCase();
    const t = tags.map(x => x.toLowerCase()).join(' ');
    return n.includes(cleanQuery) || s.includes(cleanQuery) || t.includes(cleanQuery);
  };

  // 1. VILLAGES & PLACES (Primary Location Entity)
  const existingDestNames = new Set((sources.destinations || []).map(d => (d.name || '').toLowerCase()));
  const combinedDestinations: { name: string; district?: string; state?: string; slug?: string; id?: string; isPopular?: boolean; aliases?: string[] }[] = [
    ...(sources.destinations || []).map(d => ({
      name: d.name,
      district: d.district,
      state: d.state,
      slug: d.slug || (d as any).village_code || d.id,
      id: d.id,
      isPopular: !!(d.isPopularDestination || d.isFeaturedThisWeek)
    })),
    ...HIMALAYAN_PLACES.filter(p => !existingDestNames.has(p.name.toLowerCase())).map(p => ({
      name: p.name,
      district: p.district,
      state: p.state,
      slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      id: p.id,
      isPopular: true,
      aliases: p.aliases
    }))
  ];

  const rawDestinations: UniversalHeroResultItem[] = combinedDestinations
    .filter(d => d && d.name && itemMatches(d.name, `${d.district || ''} ${d.state || ''}`, d.aliases))
    .map((d, idx) => ({
      id: `vil-${d.id || idx}`,
      name: d.name,
      subtitle: d.district ? `${d.district}, ${d.state || 'Himalayas'}` : (d.state || 'Himalayan Village'),
      entityTypeKey: 'villages',
      typeParam: 'villages',
      url: `#/village/${d.slug || d.id}`,
      popularityScore: d.isPopular ? 95 - idx : 80 - idx,
      rawItem: d
    }));

  // 2. ATTRACTIONS
  const rawAttractions: UniversalHeroResultItem[] = (sources.attractions || [])
    .filter(a => a && a.name && itemMatches(a.name, `${a.category || ''} ${a.district || ''}`))
    .map((a, idx) => {
      const locName = a.village_name || a.district || 'Himalayas';
      return {
        id: `attr-${a.id || idx}`,
        name: a.name,
        subtitle: locName ? `📍 ${locName}` : undefined,
        entityTypeKey: 'attractions',
        typeParam: 'attractions',
        url: `/attraction/${getItemSlug(a)}`,
        popularityScore: (a.isFeaturedAttraction || a.isFeaturedThisWeek) ? 90 - idx : 75 - idx,
        rawItem: a
      };
    });

  // 3. HOMESTAYS
  const rawHomestays: UniversalHeroResultItem[] = (sources.homestays || [])
    .filter(h => h && h.name && itemMatches(h.name, `${h.address || ''} ${(h.amenities || []).join(' ')}`))
    .map((h, idx) => {
      const locName = h.village_name || h.district || h.address || 'Himalayas';
      return {
        id: `stay-${h.id || idx}`,
        name: h.name,
        subtitle: locName ? `📍 ${locName}` : undefined,
        entityTypeKey: 'homestays',
        typeParam: 'homestays',
        url: `#/homestay/${h.slug || h.id}`,
        popularityScore: 85 - idx,
        rawItem: h
      };
    });

  // 4. TAXI OPERATORS (DRIVERS / OPERATORS)
  const rawOperators: UniversalHeroResultItem[] = (sources.drivers || [])
    .filter(d => d && d.name && itemMatches(d.name, `${d.serviceAreas || ''} ${d.vehicleName || ''}`))
    .map((d, idx) => {
      const loc = d.serviceAreas || 'Himalayas';
      return {
        id: `op-${d.id || idx}`,
        name: d.name,
        subtitle: loc ? `📍 ${loc}` : undefined,
        entityTypeKey: 'taxi_operators',
        typeParam: 'taxi-operators',
        url: `#/taxi?search=${encodeURIComponent(d.name)}`,
        popularityScore: d.status === 'Approved' ? 88 - idx : 70 - idx,
        rawItem: d
      };
    });

  // 5. TAXI STANDS (HUBS)
  const rawTaxiStands: UniversalHeroResultItem[] = (sources.hubs || [])
    .filter(h => h && h.name && itemMatches(h.name, `${h.district || ''} ${h.state || ''}`))
    .map((h, idx) => {
      const standName = h.name.toLowerCase().includes('stand') || h.name.toLowerCase().includes('taxi')
        ? h.name
        : `${h.name} Taxi Stand`;
      const loc = h.district || h.state || 'Himalayas';
      return {
        id: `hub-${h.id || idx}`,
        name: standName,
        subtitle: loc ? `📍 ${loc}` : undefined,
        entityTypeKey: 'taxi_stands',
        typeParam: 'taxi-stands',
        url: `#/taxi?from=${encodeURIComponent(standName)}`,
        popularityScore: 82 - idx,
        rawItem: h
      };
    });

  // 6. ROUTES
  const rawRoutes: UniversalHeroResultItem[] = (sources.routes || [])
    .filter(r => {
      if (!r) return false;
      const fromName = resolveHubName(r.fromHubId) || resolveDestinationName((r as any).fromId);
      const toName = resolveHubName(r.toHubId) || resolveDestinationName((r as any).toId);
      const pathStr = (r.path || []).join(' → ');
      const title = fromName && toName ? `${fromName} → ${toName}` : pathStr;
      return itemMatches(title, pathStr);
    })
    .map((r, idx) => {
      const fromName = resolveHubName(r.fromHubId) || resolveDestinationName((r as any).fromId);
      const toName = resolveHubName(r.toHubId) || resolveDestinationName((r as any).toId);
      const pathStr = (r.path || []).join(' → ');
      const title = fromName && toName ? `${fromName} → ${toName}` : (pathStr || 'Himalayan Journey');
      return {
        id: `route-${r.id || idx}`,
        name: title,
        subtitle: undefined, // Compact route row shows just the route title
        entityTypeKey: 'routes',
        typeParam: 'taxi',
        url: `#/taxi?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}`,
        popularityScore: 80 - idx,
        rawItem: r
      };
    });

  // 7. EXPERIENCES (Future Ready)
  const rawExperiences: UniversalHeroResultItem[] = (sources.experiences || [])
    .filter(e => e && e.title && itemMatches(e.title, e.location || ''))
    .map((e, idx) => ({
      id: `exp-${e.id || idx}`,
      name: e.title,
      subtitle: e.location ? `📍 ${e.location}` : undefined,
      entityTypeKey: 'experiences',
      typeParam: 'experiences',
      url: `#/experiences/${e.slug || e.id}`,
      popularityScore: 78 - idx,
      rawItem: e
    }));

  // 8. BLOGS (Future Ready)
  const rawBlogs: UniversalHeroResultItem[] = (sources.blogs || [])
    .filter(b => b && b.title && itemMatches(b.title, b.content || ''))
    .map((b, idx) => ({
      id: `blog-${b.id || idx}`,
      name: b.title,
      subtitle: '📍 HillyTrip Library',
      entityTypeKey: 'blogs',
      typeParam: 'blogs',
      url: `#/travel-guides/${b.slug || b.id}`,
      popularityScore: 75 - idx,
      rawItem: b
    }));

  // Apply strict ranking priority within each group
  const rankedDestinations = rankItems(rawDestinations, cleanQuery);
  const rankedAttractions = rankItems(rawAttractions, cleanQuery);
  const rankedHomestays = rankItems(rawHomestays, cleanQuery);
  const rankedOperators = rankItems(rawOperators, cleanQuery);
  const rankedTaxiStands = rankItems(rawTaxiStands, cleanQuery);
  const rankedRoutes = rankItems(rawRoutes, cleanQuery);
  const rankedExperiences = rankItems(rawExperiences, cleanQuery);
  const rankedBlogs = rankItems(rawBlogs, cleanQuery);

  // Define Groups in EXACT requested display order
  const groupConfigs: {
    key: SearchEntityTypeKey;
    groupName: string;
    icon: string;
    typeParam: string;
    items: UniversalHeroResultItem[];
  }[] = [
    { key: 'villages', groupName: 'Villages', icon: '🏔', typeParam: 'villages', items: rankedDestinations },
    { key: 'attractions', groupName: 'Attractions', icon: '🏞', typeParam: 'attractions', items: rankedAttractions },
    { key: 'homestays', groupName: 'Homestays', icon: '🏡', typeParam: 'homestays', items: rankedHomestays },
    { key: 'taxi_operators', groupName: 'Taxi Operators', icon: '🚖', typeParam: 'taxi-operators', items: rankedOperators },
    { key: 'taxi_stands', groupName: 'Taxi Stands', icon: '🚖', typeParam: 'taxi-stands', items: rankedTaxiStands },
    { key: 'routes', groupName: 'Journeys', icon: '🧭', typeParam: 'journeys', items: rankedRoutes },
    { key: 'experiences', groupName: 'Experiences', icon: '🎒', typeParam: 'experiences', items: rankedExperiences },
    { key: 'blogs', groupName: 'Blogs', icon: '📰', typeParam: 'blogs', items: rankedBlogs },
  ];

  const resultGroups: UniversalHeroGroup[] = [];

  for (const config of groupConfigs) {
    if (config.items.length > 0) {
      resultGroups.push({
        entityTypeKey: config.key,
        groupName: config.groupName,
        icon: config.icon,
        typeParam: config.typeParam,
        totalCount: config.items.length,
        previewItems: config.items.slice(0, 3), // Strictly first 3 matching results
        allItems: config.items,
        viewAllUrl: `#/search?q=${encodeURIComponent(query)}&type=${config.typeParam}`
      });
    }
  }

  return resultGroups;
}
