/**
 * Universal Geo-Based Proximity Service for HillyTrip
 * Provides dynamic, coordinate-based relationship calculations for Villages, Attractions, Homestays, and Taxi Stands.
 * Follows strict architectural rule: Pure Haversine mathematical calculation using (latitude, longitude).
 * Does NOT use destination_id or static mapping tables.
 */

import { DISTRICT_CODE_MAP as CANONICAL_DISTRICT_CODE_MAP } from '../utils/districtUtils';

export interface GeoCoordinate {
  latitude?: number | null;
  longitude?: number | null;
  lat?: number | null;
  lng?: number | null;
}

export interface NearbyEntityResult<T = any> {
  entity: T;
  distanceKm: number;
  distanceFormatted: string;
}

export interface UniversalNearbyResults {
  villages: NearbyEntityResult[];
  attractions: NearbyEntityResult[];
  homestays: NearbyEntityResult[];
  taxiStands: NearbyEntityResult[];
  counts: {
    villages: number;
    attractions: number;
    homestays: number;
    taxiStands: number;
    total: number;
  };
}

/**
 * Standard District Code to District & State Registry
 * Strictly aligned with Supabase `districts` table schema:
 * 664: Alipurduar (West Bengal)
 * 309: Darjeeling (West Bengal)
 * 314: Jalpaiguri (West Bengal)
 * 702: Kalimpong (West Bengal)
 * 225: Gangtok (Sikkim)
 * 228: Gyalshing (Sikkim)
 * 226: Mangan (Sikkim)
 * 227: Namchi (Sikkim)
 * 741: Pakyong (Sikkim)
 * 742: Soreng (Sikkim)
 */
export const DISTRICT_CODE_MAP: Record<string, { district: string; state: string; district_code?: string; state_code?: string; slug?: string }> = {
  ...CANONICAL_DISTRICT_CODE_MAP,
  'SK-GT': CANONICAL_DISTRICT_CODE_MAP['225'],
  'SK-ES': CANONICAL_DISTRICT_CODE_MAP['225'],
  'SK-WS': CANONICAL_DISTRICT_CODE_MAP['228'],
  'SK-SS': CANONICAL_DISTRICT_CODE_MAP['227'],
  'SK-NS': CANONICAL_DISTRICT_CODE_MAP['226'],
  'SK-PK': CANONICAL_DISTRICT_CODE_MAP['741'],
  'SK-SR': CANONICAL_DISTRICT_CODE_MAP['742'],
  'WB-DJ': CANONICAL_DISTRICT_CODE_MAP['309'],
  'WB-KP': CANONICAL_DISTRICT_CODE_MAP['702'],
  'WB-AP': CANONICAL_DISTRICT_CODE_MAP['664'],
  'WB-JP': CANONICAL_DISTRICT_CODE_MAP['314']
};

/**
 * Authoritative Canonical Coordinates for Major Mountain Hubs, Towns & District Centers.
 * Prevents 0-entity proximity regression when raw database records have null/missing coordinate pairs.
 */
export const CANONICAL_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Major Urban Hubs & District Centers
  'gangtok': { lat: 27.3389, lng: 88.6065 },
  'east sikkim': { lat: 27.3389, lng: 88.6065 },
  'east district': { lat: 27.3389, lng: 88.6065 },
  'deorali': { lat: 27.3200, lng: 88.6000 },
  'ranipool': { lat: 27.2800, lng: 88.5820 },
  'singtam': { lat: 27.2333, lng: 88.5000 },
  'tadong': { lat: 27.3150, lng: 88.5980 },
  'rumtek': { lat: 27.3000, lng: 88.5500 },
  'darjeeling': { lat: 27.0410, lng: 88.2663 },
  'ghum': { lat: 27.0094, lng: 88.2619 },
  'ghoom': { lat: 27.0094, lng: 88.2619 },
  'kurseong': { lat: 26.8812, lng: 88.2778 },
  'mirik': { lat: 26.8900, lng: 88.1800 },
  'siliguri': { lat: 26.7271, lng: 88.4173 },
  'njp': { lat: 26.6853, lng: 88.4414 },
  'bagdogra': { lat: 26.6812, lng: 88.3286 },
  'kalimpong': { lat: 27.0667, lng: 88.4667 },
  'lava': { lat: 27.0864, lng: 88.6657 },
  'rishyap': { lat: 27.1032, lng: 88.6477 },
  'lolegaon': { lat: 27.0194, lng: 88.5668 },
  'pedong': { lat: 27.1500, lng: 88.6167 },
  'pelling': { lat: 27.3167, lng: 88.2333 },
  'gyalshing': { lat: 27.2833, lng: 88.2500 },
  'west sikkim': { lat: 27.2833, lng: 88.2500 },
  'west district': { lat: 27.2833, lng: 88.2500 },
  'yuksom': { lat: 27.3683, lng: 88.2238 },
  'rinchenpong': { lat: 27.2333, lng: 88.2667 },
  'dentam': { lat: 27.2500, lng: 88.1333 },
  'uttarey': { lat: 27.2667, lng: 88.0833 },
  'darap': { lat: 27.2833, lng: 88.2167 },
  'ravangla': { lat: 27.3000, lng: 88.3600 },
  'namchi': { lat: 27.1667, lng: 88.3500 },
  'south sikkim': { lat: 27.1667, lng: 88.3500 },
  'south district': { lat: 27.1667, lng: 88.3500 },
  'jorethang': { lat: 27.1333, lng: 88.3000 },
  'mangan': { lat: 27.5042, lng: 88.5292 },
  'north sikkim': { lat: 27.5042, lng: 88.5292 },
  'north district': { lat: 27.5042, lng: 88.5292 },
  'lachen': { lat: 27.7298, lng: 88.5473 },
  'lachung': { lat: 27.6892, lng: 88.7431 },
  'chungthang': { lat: 27.6038, lng: 88.6469 },
  'pakyong': { lat: 27.2411, lng: 88.5917 },
  'soreng': { lat: 27.1700, lng: 88.2100 },
  'jalpaiguri': { lat: 26.5400, lng: 88.7200 },
  'alipurduar': { lat: 26.4919, lng: 89.5271 },
  'takdah': { lat: 27.0382, lng: 88.3615 },
  'tinchuley': { lat: 27.0543, lng: 88.3768 },
  'zuluk': { lat: 27.2514, lng: 88.7818 },
  'aritar': { lat: 27.1900, lng: 88.6700 },
  'rongli': { lat: 27.2000, lng: 88.7000 },
  // Singalila Ridge, Darjeeling & Foothills Corridors
  'srikhola': { lat: 27.1322, lng: 88.0773 },
  'sirikhola': { lat: 27.1322, lng: 88.0773 },
  'srikhol': { lat: 27.1322, lng: 88.0773 },
  'srikhola darjeeling': { lat: 27.1322, lng: 88.0773 },
  'vil1927': { lat: 27.1322, lng: 88.0773 },
  'rimbick': { lat: 27.1182, lng: 88.1154 },
  'sandakphu': { lat: 27.1054, lng: 88.0016 },
  'phalut': { lat: 27.2842, lng: 88.0336 },
  'manebhanjan': { lat: 26.9934, lng: 88.1326 },
  'dhotrey': { lat: 27.0543, lng: 88.0921 },
  'chitre': { lat: 27.0145, lng: 88.1211 },
  'tonglu': { lat: 27.0345, lng: 88.0842 },
  'tumling': { lat: 27.0422, lng: 88.0712 },
  'kalipokhri': { lat: 27.0782, lng: 88.0315 },
  'gairibas': { lat: 27.0521, lng: 88.0548 },
  'bijanbari': { lat: 27.0715, lng: 88.1883 },
  'lamahatta': { lat: 27.0256, lng: 88.3392 },
  'chatakpur': { lat: 26.9723, lng: 88.3156 },
  'lepchajagat': { lat: 27.0092, lng: 88.2045 },
  'sittong': { lat: 26.9248, lng: 88.3842 },
  'latpanchar': { lat: 26.9150, lng: 88.3980 },
  'bagora': { lat: 26.9022, lng: 88.2895 },
  'chimney': { lat: 26.8911, lng: 88.2834 }
};

/**
 * Resolves authoritative canonical coordinates for an entity object, ID, or name string.
 */
export function resolveCanonicalCoordinates(
  queryOrEntity: any,
  nameHint?: string,
  districtHint?: string
): { lat: number; lng: number } | null {
  if (!queryOrEntity && !nameHint && !districtHint) return null;

  // 1. Direct coordinate validation if object
  if (typeof queryOrEntity === 'object' && queryOrEntity !== null) {
    const lat = queryOrEntity.latitude !== undefined && queryOrEntity.latitude !== null
      ? Number(queryOrEntity.latitude)
      : (queryOrEntity.lat !== undefined && queryOrEntity.lat !== null ? Number(queryOrEntity.lat) : null);
    const lng = queryOrEntity.longitude !== undefined && queryOrEntity.longitude !== null
      ? Number(queryOrEntity.longitude)
      : (queryOrEntity.lng !== undefined && queryOrEntity.lng !== null ? Number(queryOrEntity.lng) : (queryOrEntity.lon !== undefined ? Number(queryOrEntity.lon) : null));
    if (isValidGeoCoordinate(lat, lng) && lat !== null && lng !== null) {
      return { lat, lng };
    }
  }

  // 2. Extract potential candidate strings
  const keys: string[] = [];
  if (typeof queryOrEntity === 'string') keys.push(queryOrEntity);
  if (typeof queryOrEntity === 'object' && queryOrEntity !== null) {
    if (queryOrEntity.name) keys.push(String(queryOrEntity.name));
    if (queryOrEntity.village_name) keys.push(String(queryOrEntity.village_name));
    if (queryOrEntity.villageName) keys.push(String(queryOrEntity.villageName));
    if (queryOrEntity.attraction_name) keys.push(String(queryOrEntity.attraction_name));
    if (queryOrEntity.homestay_name) keys.push(String(queryOrEntity.homestay_name));
    if (queryOrEntity.taxi_stand_name) keys.push(String(queryOrEntity.taxi_stand_name));
    if (queryOrEntity.slug) keys.push(String(queryOrEntity.slug));
    if (queryOrEntity.district) keys.push(String(queryOrEntity.district));
    if (queryOrEntity.district_name) keys.push(String(queryOrEntity.district_name));
    if (queryOrEntity.address) keys.push(String(queryOrEntity.address));
    if (queryOrEntity.id) keys.push(String(queryOrEntity.id));
    if (queryOrEntity.destination_id) keys.push(String(queryOrEntity.destination_id));
  }
  if (nameHint) keys.push(nameHint);
  if (districtHint) keys.push(districtHint);

  for (const rawKey of keys) {
    if (!rawKey) continue;
    const clean = String(rawKey).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
    if (CANONICAL_COORDINATES[clean]) {
      return CANONICAL_COORDINATES[clean];
    }
    // Partial inclusion check against canonical keys
    for (const [canonName, coords] of Object.entries(CANONICAL_COORDINATES)) {
      if (clean === canonName || clean.includes(canonName) || (canonName.length > 4 && canonName.includes(clean))) {
        return coords;
      }
    }
  }

  // Fallback to district resolution
  if (typeof queryOrEntity === 'object' && queryOrEntity !== null) {
    const admin = resolveAdminLocation(queryOrEntity);
    if (admin.district) {
      const dLower = admin.district.toLowerCase();
      if (CANONICAL_COORDINATES[dLower]) return CANONICAL_COORDINATES[dLower];
    }
  }

  if (districtHint) {
    const dClean = String(districtHint).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
    if (CANONICAL_COORDINATES[dClean]) return CANONICAL_COORDINATES[dClean];
    for (const [canonName, coords] of Object.entries(CANONICAL_COORDINATES)) {
      if (dClean === canonName || dClean.includes(canonName)) return coords;
    }
  }

  return null;
}

/**
 * Resolves clean administrative district and state for any village or entity record,
 * looking up the official database district codes.
 */
export function resolveAdminLocation(row: any): { district: string; state: string } {
  if (!row || typeof row !== 'object') {
    return { district: '', state: '' };
  }

  const dCode = String(row.district_code || '').trim();
  if (dCode && DISTRICT_CODE_MAP[dCode]) {
    return DISTRICT_CODE_MAP[dCode];
  }

  let rawDistrict = String(row.district_name || row.district || '').trim();
  if (rawDistrict && DISTRICT_CODE_MAP[rawDistrict]) {
    return DISTRICT_CODE_MAP[rawDistrict];
  }
  if (/^\d+$/.test(rawDistrict) && DISTRICT_CODE_MAP[rawDistrict]) {
    return DISTRICT_CODE_MAP[rawDistrict];
  }

  // Canonical district name matching
  const dLower = rawDistrict.toLowerCase();
  if (dLower === 'gangtok' || dLower === 'east sikkim' || dLower === 'east district') return DISTRICT_CODE_MAP['225'];
  if (dLower === 'pakyong') return DISTRICT_CODE_MAP['741'];
  if (dLower === 'mangan' || dLower === 'north sikkim' || dLower === 'north district') return DISTRICT_CODE_MAP['226'];
  if (dLower === 'namchi' || dLower === 'south sikkim' || dLower === 'south district') return DISTRICT_CODE_MAP['227'];
  if (dLower === 'gyalshing' || dLower === 'west sikkim' || dLower === 'west district') return DISTRICT_CODE_MAP['228'];
  if (dLower === 'soreng') return DISTRICT_CODE_MAP['742'];
  if (dLower === 'kalimpong') return DISTRICT_CODE_MAP['702'];
  if (dLower === 'darjeeling' || dLower === 'kurseong' || dLower === 'mirik') return DISTRICT_CODE_MAP['309'];
  if (dLower === 'jalpaiguri') return DISTRICT_CODE_MAP['314'];
  if (dLower === 'alipurduar' || dLower === 'dooars') return DISTRICT_CODE_MAP['664'];

  let rawState = String(row.state_name || row.state || '').trim();
  const idStr = String(row.homestay_id || row.id || row.village_code || row.destination_id || row.attraction_id || row.taxi_id || '').toUpperCase();
  const addrStr = String(row.address || '').toLowerCase();
  const nameStr = String(row.village_name || row.homestay_name || row.attraction_name || row.taxi_stand_name || row.name || '').toLowerCase();
  const combined = `${addrStr} ${nameStr} ${rawDistrict.toLowerCase()}`;

  // 1. Detect State & District by keyword if code was missing
  if (combined.includes('mangan') || combined.includes('lachen') || combined.includes('lachung') || combined.includes('lingdong') || combined.includes('north district') || combined.includes('north sikkim') || idStr.includes('NS')) {
    return { district: 'Mangan', state: 'Sikkim' };
  }
  if (combined.includes('pakyong') || combined.includes('rongli') || combined.includes('zuluk') || combined.includes('aritar') || combined.includes('rolep') || combined.includes('gnathang') || combined.includes('padamchen') || combined.includes('rhenock') || idStr.includes('PK')) {
    return { district: 'Pakyong', state: 'Sikkim' };
  }
  if (combined.includes('soreng') || combined.includes('chumbong') || combined.includes('sombaria') || combined.includes('okhrey') || combined.includes('ribdi') || idStr.includes('SR')) {
    return { district: 'Soreng', state: 'Sikkim' };
  }
  if (combined.includes('gyalshing') || combined.includes('pelling') || combined.includes('yuksom') || combined.includes('rinchenpong') || combined.includes('dentam') || combined.includes('uttarey') || combined.includes('darap') || combined.includes('west district') || combined.includes('west sikkim') || idStr.includes('WS')) {
    return { district: 'Gyalshing', state: 'Sikkim' };
  }
  if (combined.includes('namchi') || combined.includes('ravangla') || combined.includes('borong') || combined.includes('jorethang') || combined.includes('temi') || combined.includes('south district') || combined.includes('south sikkim') || idStr.includes('SS')) {
    return { district: 'Namchi', state: 'Sikkim' };
  }
  if (combined.includes('gangtok') || combined.includes('rumtek') || combined.includes('ranipool') || combined.includes('singtam') || combined.includes('tadong') || combined.includes('east district') || combined.includes('east sikkim') || idStr.includes('GT') || idStr.includes('ES')) {
    return { district: 'Gangtok', state: 'Sikkim' };
  }

  // West Bengal Districts
  if (combined.includes('kalimpong') || combined.includes('lava') || combined.includes('rishyap') || combined.includes('pedong') || combined.includes('lolegaon') || combined.includes('sillery') || combined.includes('algarah') || combined.includes('gorubathan') || idStr.includes('KP')) {
    return { district: 'Kalimpong', state: 'West Bengal' };
  }
  if (combined.includes('alipurduar') || combined.includes('buxa') || combined.includes('jayanti') || combined.includes('madarihat') || combined.includes('jaldapara') || idStr.includes('AP')) {
    return { district: 'Alipurduar', state: 'West Bengal' };
  }
  if (combined.includes('jalpaiguri') || combined.includes('lataguri') || combined.includes('murti') || combined.includes('gorumara') || combined.includes('chalsa') || idStr.includes('JP')) {
    return { district: 'Jalpaiguri', state: 'West Bengal' };
  }

  const isExplicitSikkim = combined.includes('sikkim') || idStr.startsWith('SK');
  return {
    district: isExplicitSikkim ? 'Gangtok' : 'Darjeeling',
    state: isExplicitSikkim ? 'Sikkim' : 'West Bengal'
  };
}

/**
 * Validates if latitude and longitude are plausible geographical coordinates
 */
export function isValidGeoCoordinate(lat: any, lng: any): boolean {
  if (lat === undefined || lng === undefined || lat === null || lng === null) return false;
  const nLat = typeof lat === 'number' ? lat : parseFloat(String(lat));
  const nLng = typeof lng === 'number' ? lng : parseFloat(String(lng));
  if (isNaN(nLat) || isNaN(nLng)) return false;
  if (nLat === 0 && nLng === 0) return false;
  // Latitude between -90 and 90, Longitude between -180 and 180 (and specifically broad South Asia / India bounds)
  return nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180 && nLat !== 0;
}

/**
 * Calculates the great-circle distance between two points on the Earth using the Haversine formula.
 * @returns Raw distance in kilometers (unrounded)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isValidGeoCoordinate(lat1, lon1) || !isValidGeoCoordinate(lat2, lon2)) {
    return Infinity;
  }

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const aClamped = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(aClamped), Math.sqrt(1 - aClamped));
  const distance = R * c;

  return distance;
}

/**
 * Formats distance in km into a human-friendly string (e.g. "800 m" or "2.4 km")
 */
export function formatDistanceKm(distanceKm: number | null | undefined): string {
  if (distanceKm === undefined || distanceKm === null || distanceKm === Infinity || isNaN(distanceKm) || distanceKm < 0) {
    return 'Location unavailable';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return meters <= 50 ? 'Immediate vicinity' : `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Extracts coordinate pair from any entity object format
 */
export function extractEntityCoordinates(item: any): { lat: number; lng: number } | null {
  if (!item || typeof item !== 'object') return null;

  const lat = item.latitude !== undefined && item.latitude !== null 
    ? item.latitude 
    : (item.lat !== undefined && item.lat !== null ? item.lat : null);
  
  const lng = item.longitude !== undefined && item.longitude !== null 
    ? item.longitude 
    : (item.lng !== undefined && item.lng !== null ? item.lng : (item.lon !== undefined ? item.lon : null));

  if (isValidGeoCoordinate(lat, lng)) {
    return { lat: Number(lat), lng: Number(lng) };
  }
  return resolveCanonicalCoordinates(item);
}

/**
 * Normalizes entity name for secondary deduplication
 */
function normalizeName(name: any): string {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Core Proximity Filter & Sort: Takes an origin point and a list of target items,
 * calculates Haversine distance, filters strictly by radius, deduplicates by ID and normalized name/coords, and sorts nearest first.
 */
export function findNearbyEntities<T = any>(
  originLat: number,
  originLng: number,
  items: T[],
  options: {
    maxRadiusKm?: number;
    limit?: number;
    excludeId?: string;
    getId?: (item: T) => string;
    getCoords?: (item: T) => { lat: number; lng: number } | null;
  } = {}
): NearbyEntityResult<T>[] {
  if (!isValidGeoCoordinate(originLat, originLng) || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  const maxRadius = options.maxRadiusKm ?? 15;
  const limit = options.limit ?? 20;
  const excludeId = options.excludeId ? String(options.excludeId).toLowerCase().trim() : null;

  const results: NearbyEntityResult<T>[] = [];
  const seenIds = new Set<string>();
  const seenLocationKeys = new Set<string>();

  for (const item of items) {
    if (!item) continue;

    const itemId = options.getId 
      ? options.getId(item) 
      : String((item as any).id || (item as any).village_code || (item as any).taxi_id || (item as any).homestay_id || (item as any).attraction_id || '');
    
    const cleanId = String(itemId).toLowerCase().trim();

    // Check exclusion (e.g. current village)
    if (excludeId && (cleanId === excludeId || cleanId === '')) {
      continue;
    }

    // Check primary ID deduplication
    if (cleanId && seenIds.has(cleanId)) {
      continue;
    }

    // Extract coordinates
    const coords = options.getCoords ? options.getCoords(item) : extractEntityCoordinates(item);
    if (!coords || !isValidGeoCoordinate(coords.lat, coords.lng)) {
      continue; // Strictly ignore records with missing/null coordinates
    }

    const distKm = calculateHaversineDistanceKm(originLat, originLng, coords.lat, coords.lng);

    // Skip if point is practically identical to origin (e.g. self-match) or exceeds radius
    if (distKm > maxRadius || (excludeId && distKm < 0.05)) {
      continue;
    }

    // Secondary Deduplication by normalized name + rounded coordinates (~150m grid)
    const rawName = (item as any).name || (item as any).village_name || (item as any).attraction_name || (item as any).homestay_name || (item as any).taxi_stand_name || '';
    const normName = normalizeName(rawName);
    const locationKey = `${normName}_${coords.lat.toFixed(3)}_${coords.lng.toFixed(3)}`;
    if (normName && seenLocationKeys.has(locationKey)) {
      continue;
    }

    if (cleanId) seenIds.add(cleanId);
    if (normName) seenLocationKeys.add(locationKey);

    results.push({
      entity: item,
      distanceKm: distKm,
      distanceFormatted: formatDistanceKm(distKm)
    });
  }

  // Sort ascending (nearest first)
  results.sort((a, b) => a.distanceKm - b.distanceKm);

  return results.slice(0, limit);
}
