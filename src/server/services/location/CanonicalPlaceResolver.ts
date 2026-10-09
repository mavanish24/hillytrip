/**
 * Canonical Place Resolver Service
 * Authoritative entity resolution against Supabase villages and attractions masters.
 * 
 * Rules:
 * 1. Villages master first
 *    - exact village_name
 *    - normalized name
 *    - village_code
 *    - slug generated using existing slug utility (toSlug)
 *    - explicit name parts from existing values (e.g. "Maneybhanjan / Manebhanjan", "Tonglu (Tumling)", "Gairibas / Gairibans")
 *    - core name matching (e.g. stripped of suffix)
 * 2. Attractions master second
 *    - exact attraction_name
 *    - normalized name
 *    - existing slug / toSlug
 *    - safe/explicit name matching (parts split by / or parentheses)
 *    - NO arbitrary substring matching that can create false matches
 * 3. Fallback to Search & Explore route without inventing coordinates or detail URLs.
 */

import { supabase, supabaseAdmin, dbStore } from '../../db';
import { getLiveSupabaseVillages } from './GeoProximityService';
import { toSlug } from '../../../utils/slug';

export interface CanonicalPlaceResolution {
  query: string;
  resolved: boolean;
  entityType?: 'village' | 'attraction';
  id?: string;
  name?: string;
  slug?: string;
  targetUrl?: string;
  searchUrl?: string;
  coordinates?: { latitude: number | null; longitude: number | null } | null;
  district?: string;
  state?: string;
  category?: string;
  image?: string;
}

// In-memory cache for resolved canonical places with a 10-minute TTL
interface CachedEntry {
  data: CanonicalPlaceResolution;
  timestamp: number;
}
const placeResolutionCache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

// Authoritative Regional Transport Gateways & Hubs
const REGIONAL_TRANSPORT_GATEWAYS: Record<string, { id: string; name: string; slug: string; district: string; state: string; lat: number; lng: number }> = {
  'njp': { id: 'hub-njp', name: 'NJP Railway Station', slug: 'njp-railway-station', district: 'Jalpaiguri', state: 'West Bengal', lat: 26.6853, lng: 88.4419 },
  'newjalpaiguri': { id: 'hub-njp', name: 'NJP Railway Station', slug: 'njp-railway-station', district: 'Jalpaiguri', state: 'West Bengal', lat: 26.6853, lng: 88.4419 },
  'bagdogra': { id: 'hub-bagdogra', name: 'Bagdogra Airport', slug: 'bagdogra-airport', district: 'Darjeeling', state: 'West Bengal', lat: 26.6812, lng: 88.3286 },
  'bagdograairport': { id: 'hub-bagdogra', name: 'Bagdogra Airport', slug: 'bagdogra-airport', district: 'Darjeeling', state: 'West Bengal', lat: 26.6812, lng: 88.3286 },
  'ixb': { id: 'hub-bagdogra', name: 'Bagdogra Airport', slug: 'bagdogra-airport', district: 'Darjeeling', state: 'West Bengal', lat: 26.6812, lng: 88.3286 },
  'siliguri': { id: 'hub-siliguri', name: 'Siliguri', slug: 'siliguri', district: 'Darjeeling', state: 'West Bengal', lat: 26.7271, lng: 88.3953 }
};

// Authoritative Scenic Mountain Attractions & Summits
const KNOWN_SCENIC_ATTRACTIONS: Record<string, { id: string; name: string; slug: string; district: string; state: string; lat: number; lng: number; category: string }> = {
  'yumthang': { id: 'attr-yumthang', name: 'Yumthang Valley', slug: 'yumthang-valley', district: 'Mangan', state: 'Sikkim', lat: 27.8260, lng: 88.6960, category: 'Valley of Flowers' },
  'yumthangvalley': { id: 'attr-yumthang', name: 'Yumthang Valley', slug: 'yumthang-valley', district: 'Mangan', state: 'Sikkim', lat: 27.8260, lng: 88.6960, category: 'Valley of Flowers' },
  'sandakphu': { id: 'attr-sandakphu', name: 'Sandakphu', slug: 'sandakphu', district: 'Darjeeling', state: 'West Bengal', lat: 27.1061, lng: 88.0019, category: 'High Altitude Summit & Viewpoint' },
  'phalut': { id: 'attr-phalut', name: 'Phalut', slug: 'phalut', district: 'Darjeeling', state: 'West Bengal', lat: 27.2833, lng: 88.0333, category: 'Himalayan Ridge & Trekking Peak' }
};

export function normalizePlaceName(str: string): string {
  if (!str) return '';
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export function extractExplicitNameParts(str: string): string[] {
  if (!str) return [];
  return String(str).split(/[\/\|\(\),]/).map(s => s.trim()).filter(Boolean);
}

export function getCoreStopName(name: string): string {
  if (!name) return '';
  return String(name).replace(/\b(Ridge|Summit|Slopes|Hairpins|Pines|Mist|Falls|Station|Town|Junction|High Altitude Station)\b/gi, '').trim();
}

/**
 * Resolves a batch of place names against authoritative Supabase masters.
 */
export async function resolvePlacesBatch(names: string[]): Promise<Record<string, CanonicalPlaceResolution>> {
  if (!Array.isArray(names) || names.length === 0) {
    return {};
  }

  const results: Record<string, CanonicalPlaceResolution> = {};
  const unresolvedNames: string[] = [];
  const now = Date.now();

  // 1. Check in-memory resolution cache
  for (const rawName of names) {
    const cleanName = String(rawName || '').trim();
    if (!cleanName) continue;

    const cacheKey = cleanName.toLowerCase();
    const cached = placeResolutionCache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL_MS) && cached.data.resolved) {
      results[cleanName] = cached.data;
    } else {
      unresolvedNames.push(cleanName);
    }
  }

  if (unresolvedNames.length === 0) {
    return results;
  }

  // 2. Fetch authoritative live villages (complete Supabase master, cached via GeoProximityService)
  const allVillages = await getLiveSupabaseVillages().catch(() => []);

  const pendingAttractionNames: string[] = [];

  // Step A: Villages master first
  for (const cleanName of unresolvedNames) {
    const cleanLower = cleanName.toLowerCase();
    const norm = normalizePlaceName(cleanName);
    const slug = toSlug(cleanName);
    const core = getCoreStopName(cleanName);
    const coreLower = core.toLowerCase();
    const coreNorm = normalizePlaceName(core);
    const coreSlug = toSlug(core);

    // Step A0: Check known transport gateways (NJP, Bagdogra, Siliguri)
    const gateway = REGIONAL_TRANSPORT_GATEWAYS[norm] || REGIONAL_TRANSPORT_GATEWAYS[cleanLower];
    if (gateway) {
      const resolution: CanonicalPlaceResolution = {
        query: cleanName,
        resolved: true,
        entityType: 'village',
        id: gateway.id,
        name: gateway.name,
        slug: gateway.slug,
        targetUrl: `#/taxi?from=${encodeURIComponent(gateway.name)}`,
        coordinates: { latitude: gateway.lat, longitude: gateway.lng },
        district: gateway.district,
        state: gateway.state,
        category: 'Transport Hub'
      };
      results[cleanName] = resolution;
      placeResolutionCache.set(cleanName.toLowerCase(), { data: resolution, timestamp: now });
      continue;
    }

    let matchedVillage = allVillages.find(v => (v.village_name || v.name || '').toLowerCase().trim() === cleanLower);

    if (!matchedVillage) {
      matchedVillage = allVillages.find(v => normalizePlaceName(v.village_name || v.name) === norm);
    }
    if (!matchedVillage) {
      matchedVillage = allVillages.find(v => (v.village_code || v.id || '').toLowerCase().trim() === cleanLower);
    }
    if (!matchedVillage) {
      matchedVillage = allVillages.find(v => toSlug(v.village_name || v.name) === slug);
    }
    if (!matchedVillage) {
      matchedVillage = allVillages.find(v => {
        const parts = extractExplicitNameParts(v.village_name || v.name);
        return parts.some(p => {
          const pLower = p.toLowerCase();
          const pNorm = normalizePlaceName(p);
          const pSlug = toSlug(p);
          return pLower === cleanLower || pNorm === norm || pSlug === slug ||
                 (coreLower && (pLower === coreLower || pNorm === coreNorm || pSlug === coreSlug));
        });
      });
    }
    if (!matchedVillage && coreLower && coreLower !== cleanLower) {
      matchedVillage = allVillages.find(v => {
        const vName = (v.village_name || v.name || '').toLowerCase().trim();
        return vName === coreLower || toSlug(v.village_name || v.name) === coreSlug;
      });
    }

    if (matchedVillage) {
      const vCode = matchedVillage.village_code || matchedVillage.id || '';
      const vName = matchedVillage.village_name || matchedVillage.name || cleanName;
      const vSlug = matchedVillage.slug || toSlug(vName);
      const lat = matchedVillage.latitude !== undefined && matchedVillage.latitude !== null ? Number(matchedVillage.latitude) : null;
      const lng = matchedVillage.longitude !== undefined && matchedVillage.longitude !== null ? Number(matchedVillage.longitude) : null;

      const resolution: CanonicalPlaceResolution = {
        query: cleanName,
        resolved: true,
        entityType: 'village',
        id: vCode,
        name: vName,
        slug: vSlug,
        targetUrl: `#/village/${vSlug || vCode}`,
        coordinates: lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) ? { latitude: lat, longitude: lng } : null,
        district: matchedVillage.district || matchedVillage.district_name || '',
        state: matchedVillage.state || matchedVillage.state_name || 'West Bengal',
        image: matchedVillage.image_url || matchedVillage.image || matchedVillage.coverImage || ''
      };

      results[cleanName] = resolution;
      placeResolutionCache.set(cleanName.toLowerCase(), { data: resolution, timestamp: now });
    } else {
      pendingAttractionNames.push(cleanName);
    }
  }

  // Step B: Attractions master second
  if (pendingAttractionNames.length > 0) {
    const searchTerms: string[] = [];
    for (const name of pendingAttractionNames) {
      searchTerms.push(name);
      const core = getCoreStopName(name);
      if (core && core.toLowerCase() !== name.toLowerCase()) {
        searchTerms.push(core);
      }
    }

    const client = supabaseAdmin || supabase;
    let attractionCandidates: any[] = [];

    if (client) {
      try {
        const orClauses = searchTerms.flatMap(term => [
          `attraction_name.ilike.${term}`,
          `attraction_name.ilike.${term} %`,
          `slug.ilike.${toSlug(term)}%`
        ]).join(',');

        const { data, error } = await client
          .from('attractions')
          .select('attraction_id, attraction_name, slug, category, latitude, longitude, destination_id, image_url, description')
          .or(orClauses);

        if (!error && Array.isArray(data) && data.length > 0) {
          attractionCandidates = data;
        }
      } catch (err) {
        console.warn('[CanonicalPlaceResolver] Supabase query notice:', err);
      }
    }

    // Fallback candidates from dbStore if offline or empty
    if (attractionCandidates.length === 0 && dbStore.getAttractions) {
      const storeAttrs = dbStore.getAttractions() || [];
      attractionCandidates = storeAttrs;
    }

    for (const cleanName of pendingAttractionNames) {
      const cleanLower = cleanName.toLowerCase();
      const norm = normalizePlaceName(cleanName);
      const slug = toSlug(cleanName);
      const core = getCoreStopName(cleanName);
      const coreLower = core.toLowerCase();
      const coreNorm = normalizePlaceName(core);
      const coreSlug = toSlug(core);

      let matchedAttraction: any = null;

      if (attractionCandidates.length > 0) {
        // B1: Exact attraction_name
        matchedAttraction = attractionCandidates.find(a => (a.attraction_name || a.name || '').toLowerCase().trim() === cleanLower);

        // B2: Core exact match (e.g. "Sandakphu Ridge" -> "Sandakphu")
        if (!matchedAttraction && coreLower) {
          matchedAttraction = attractionCandidates.find(a => (a.attraction_name || a.name || '').toLowerCase().trim() === coreLower);
        }

        // B3: Normalized name match
        if (!matchedAttraction) {
          matchedAttraction = attractionCandidates.find(a => {
            const an = normalizePlaceName(a.attraction_name || a.name);
            return an === norm || (coreNorm && an === coreNorm);
          });
        }

        // B4: Existing slug match
        if (!matchedAttraction) {
          matchedAttraction = attractionCandidates.find(a => {
            const as = (a.slug || toSlug(a.attraction_name || a.name || '')).toLowerCase().trim();
            return as === slug || (coreSlug && as === coreSlug);
          });
        }

        // B5: Safe/explicit name parts
        if (!matchedAttraction) {
          matchedAttraction = attractionCandidates.find(a => {
            const parts = extractExplicitNameParts(a.attraction_name || a.name);
            return parts.some(p => {
              const pLower = p.toLowerCase();
              return pLower === cleanLower || (coreLower && pLower === coreLower);
            });
          });
        }

        // B6: Starts with or prefix match (e.g. "Yumthang" -> "Yumthang Valley")
        if (!matchedAttraction) {
          matchedAttraction = attractionCandidates.find(a => {
            const an = (a.attraction_name || a.name || '').toLowerCase().trim();
            const aNorm = normalizePlaceName(an);
            return an.startsWith(cleanLower) || cleanLower.startsWith(an) ||
                   aNorm.startsWith(norm) || norm.startsWith(aNorm);
          });
        }
      }

      // Check authoritative known scenic attractions fallback if not matched in DB
      if (!matchedAttraction) {
        const knownScenic = KNOWN_SCENIC_ATTRACTIONS[norm] || KNOWN_SCENIC_ATTRACTIONS[cleanLower];
        if (knownScenic) {
          matchedAttraction = {
            attraction_id: knownScenic.id,
            attraction_name: knownScenic.name,
            slug: knownScenic.slug,
            latitude: knownScenic.lat,
            longitude: knownScenic.lng,
            category: knownScenic.category
          };
        }
      }

      if (matchedAttraction) {
        const aId = matchedAttraction.attraction_id || matchedAttraction.id || '';
        const aName = matchedAttraction.attraction_name || matchedAttraction.name || cleanName;
        const aSlug = matchedAttraction.slug || toSlug(aName);
        const lat = matchedAttraction.latitude !== undefined && matchedAttraction.latitude !== null ? Number(matchedAttraction.latitude) : null;
        const lng = matchedAttraction.longitude !== undefined && matchedAttraction.longitude !== null ? Number(matchedAttraction.longitude) : null;

        const resolution: CanonicalPlaceResolution = {
          query: cleanName,
          resolved: true,
          entityType: 'attraction',
          id: aId,
          name: aName,
          slug: aSlug,
          targetUrl: `#/attraction/${aSlug || aId}`,
          coordinates: lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) ? { latitude: lat, longitude: lng } : null,
          category: matchedAttraction.category || 'Sightseeing Attraction',
          image: matchedAttraction.image_url || matchedAttraction.image || ''
        };

        results[cleanName] = resolution;
        placeResolutionCache.set(cleanName.toLowerCase(), { data: resolution, timestamp: now });
      } else {
        // Unknown place fallback: do not invent coordinates or detail URLs
        const unresolvedFallback: CanonicalPlaceResolution = {
          query: cleanName,
          resolved: false,
          searchUrl: `#/search?q=${encodeURIComponent(cleanName)}`
        };

        results[cleanName] = unresolvedFallback;
        placeResolutionCache.set(cleanName.toLowerCase(), { data: unresolvedFallback, timestamp: now });
      }
    }
  }

  return results;
}

/**
 * Resolves a single place name against authoritative Supabase masters.
 */
export async function resolvePlace(name: string): Promise<CanonicalPlaceResolution> {
  const cleanName = String(name || '').trim();
  if (!cleanName) {
    return {
      query: '',
      resolved: false,
      searchUrl: '#/search?q='
    };
  }

  const batchResult = await resolvePlacesBatch([cleanName]);
  return batchResult[cleanName] || {
    query: cleanName,
    resolved: false,
    searchUrl: `#/search?q=${encodeURIComponent(cleanName)}`
  };
}
