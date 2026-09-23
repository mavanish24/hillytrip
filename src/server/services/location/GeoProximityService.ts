import { querySupabaseTable, supabase, supabaseAdmin, dbStore } from '../../db';
import { 
  calculateHaversineDistanceKm, 
  formatDistanceKm, 
  isValidGeoCoordinate, 
  extractEntityCoordinates,
  resolveAdminLocation,
  resolveCanonicalCoordinates,
  DISTRICT_CODE_MAP,
  NearbyEntityResult 
} from '../../../services/geoProximityService';
import { CANONICAL_TAXI_STANDS } from '../../../data/canonicalTaxiStands';
import { resolveVillageImage, getSmartDirectUnsplashUrl } from '../../../utils/imagePool';

export interface NearbyQueryOptions {
  radiusKm?: number;
  limit?: number;
  targetTypes?: Array<'villages' | 'attractions' | 'homestays' | 'taxi_stands'>;
  excludeId?: string;
  excludeType?: string;
}

export interface UniversalNearbyResponse {
  success: boolean;
  origin: {
    id?: string;
    type?: string;
    name?: string;
    latitude: number;
    longitude: number;
  };
  radiusKm: number;
  limit: number;
  nearby: {
    villages: NearbyEntityResult[];
    attractions: NearbyEntityResult[];
    homestays: NearbyEntityResult[];
    taxi_stands: NearbyEntityResult[];
  };
  counts: {
    villages: number;
    attractions: number;
    homestays: number;
    taxi_stands: number;
    total: number;
  };
}

// In-memory cache for live Supabase entities with 45s TTL
interface TableCache<T> {
  data: T[];
  lastFetched: number;
}

function toSlug(text: any): string {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_'-]/g, '')
    .replace(/[\s_']+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  'darjeeling': { lat: 27.0410, lng: 88.2663 },
  'kalimpong': { lat: 27.0667, lng: 88.4667 },
  'kurseong': { lat: 26.8800, lng: 88.2800 },
  'mirik': { lat: 26.8900, lng: 88.1800 },
  'gangtok': { lat: 27.3389, lng: 88.6065 },
  'east sikkim': { lat: 27.3389, lng: 88.6065 },
  'west sikkim': { lat: 27.2885, lng: 88.2355 },
  'south sikkim': { lat: 27.1667, lng: 88.3667 },
  'north sikkim': { lat: 27.6000, lng: 88.5833 },
  'namchi': { lat: 27.1667, lng: 88.3667 },
  'pelling': { lat: 27.3000, lng: 88.2333 },
  'siliguri': { lat: 26.7271, lng: 88.3953 },
  'jalpaiguri': { lat: 26.5400, lng: 88.7200 },
  'alipurduar': { lat: 26.4900, lng: 89.5300 },
  'cooch behar': { lat: 26.3200, lng: 89.4500 }
};

function getDistrictFallbackCoords(districtName?: string, stateName?: string): { lat: number; lng: number } {
  const d = String(districtName || '').toLowerCase().trim();
  for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
    if (d.includes(key)) return coords;
  }
  if (String(stateName || '').toLowerCase().includes('sikkim')) {
    return { lat: 27.3389, lng: 88.6065 };
  }
  return { lat: 27.0410, lng: 88.2663 }; // Darjeeling / North Bengal default
}

const entityCache: {
  villages?: TableCache<any>;
  attractions?: TableCache<any>;
  homestays?: TableCache<any>;
  taxi_stands?: TableCache<any>;
} = {};

const CACHE_TTL_MS = 45000;

function getFallbackVillages(): any[] {
  try {
    const raw = (dbStore.getVillages && dbStore.getVillages().length > 0)
      ? dbStore.getVillages()
      : (dbStore.getDestinations ? dbStore.getDestinations() : []);
    return raw.map((v: any) => {
      let lat = v.latitude !== undefined && v.latitude !== null ? Number(v.latitude) : null;
      let lng = v.longitude !== undefined && v.longitude !== null ? Number(v.longitude) : null;
      if (!isValidGeoCoordinate(lat, lng)) {
        const fb = getDistrictFallbackCoords(v.district || v.district_name, v.state || v.state_name);
        lat = fb.lat;
        lng = fb.lng;
      }
      return { ...v, latitude: lat, longitude: lng };
    });
  } catch {
    return [];
  }
}

export async function getLiveSupabaseVillages(): Promise<any[]> {
  const now = Date.now();
  if (entityCache.villages && (now - entityCache.villages.lastFetched < CACHE_TTL_MS)) {
    return entityCache.villages.data;
  }
  try {
    let rows: any[] = [];
    const client = supabaseAdmin || supabase;
    if (client) {
      // Authoritative source: Query villages table with pagination to retrieve all records
      let offset = 0;
      const batchSize = 1000;
      while (true) {
        const { data: vData, error: vError } = await client
          .from('villages')
          .select('*')
          .range(offset, offset + batchSize - 1);
        if (vError || !vData || vData.length === 0) break;
        rows.push(...vData);
        offset += batchSize;
        if (vData.length < batchSize) break;
      }
    }
    if (rows.length === 0) {
      const res = await querySupabaseTable('geo:villages', 'villages', q => q.select('*').limit(2500)).catch(() => null);
      if (Array.isArray(res?.data) && res.data.length > 0) {
        rows = res.data;
      }
    }

    if (rows.length === 0) {
      rows = (dbStore.getVillages && dbStore.getVillages().length > 0)
        ? dbStore.getVillages()
        : getFallbackVillages();
    }

    const data = rows.map(v => {
      const vCode = v.village_code || v.id;
      const vName = v.village_name || v.name;
      const distCode = v.district_code ? String(v.district_code) : '';
      const distInfo = (distCode && (DISTRICT_CODE_MAP as any)[distCode]) || null;
      const vDist = distInfo?.district || v.district || v.district_name || 'Darjeeling';
      const vState = distInfo?.state || v.state || v.state_name || 'West Bengal';
      let lat = v.latitude !== undefined && v.latitude !== null ? Number(v.latitude) : null;
      let lng = v.longitude !== undefined && v.longitude !== null ? Number(v.longitude) : null;
      if (!isValidGeoCoordinate(lat, lng)) {
        const canonical = resolveCanonicalCoordinates(v, vName, vDist);
        if (canonical) {
          lat = canonical.lat;
          lng = canonical.lng;
        } else {
          const fb = getDistrictFallbackCoords(vDist, vState);
          lat = fb.lat;
          lng = fb.lng;
        }
      }
      return {
        ...v,
        id: vCode,
        village_code: vCode,
        name: vName,
        village_name: vName,
        district_code: distCode,
        district: vDist,
        district_name: vDist,
        state: vState,
        state_name: vState,
        slug: v.slug || toSlug(vName),
        latitude: lat,
        longitude: lng,
        image_url: v.image_url || v.image || '',
        image: v.image_url || v.image || '',
        coverImage: v.coverImage || v.image_url || v.image || ''
      };
    });
    entityCache.villages = { data, lastFetched: now };
    return data;
  } catch (err: any) {
    if (!err?.message?.includes('circuit breaker')) {
      console.warn('[GeoProximityService] Notice fetching live villages from Supabase:', err.message || err);
    }
    const fallback = entityCache.villages?.data && entityCache.villages.data.length > 0 
      ? entityCache.villages.data 
      : getFallbackVillages();
    return fallback;
  }
}

export async function getLiveSupabaseAttractions(): Promise<any[]> {
  const now = Date.now();
  if (entityCache.attractions && (now - entityCache.attractions.lastFetched < CACHE_TTL_MS)) {
    return entityCache.attractions.data;
  }
  try {
    let rows: any[] = [];
    const client = supabaseAdmin || supabase;
    if (client) {
      const { data, error } = await client.from('attractions').select('*').limit(2000);
      if (!error && Array.isArray(data) && data.length > 0) {
        rows = data;
      }
    }
    if (rows.length === 0) {
      const res = await querySupabaseTable('geo:attractions', 'attractions', q => q.select('*').limit(2000));
      if (Array.isArray(res?.data) && res.data.length > 0) {
        rows = res.data;
      }
    }
    if (rows.length === 0) {
      rows = dbStore.getAttractions ? dbStore.getAttractions() : [];
    }
    entityCache.attractions = { data: rows, lastFetched: now };
    return rows;
  } catch (err: any) {
    if (!err?.message?.includes('circuit breaker')) {
      console.warn('[GeoProximityService] Notice fetching live attractions from Supabase:', err.message || err);
    }
    const fallback = entityCache.attractions?.data && entityCache.attractions.data.length > 0
      ? entityCache.attractions.data
      : (dbStore.getAttractions ? dbStore.getAttractions() : []);
    return fallback;
  }
}

export async function getLiveSupabaseHomestays(): Promise<any[]> {
  const now = Date.now();
  if (entityCache.homestays && (now - entityCache.homestays.lastFetched < CACHE_TTL_MS)) {
    return entityCache.homestays.data;
  }
  try {
    // Get villages coordinate map to inherit coordinates for homestays without explicit lat/lng
    const villages = await getLiveSupabaseVillages();
    const villageCoordMap = new Map<string, { lat: number; lng: number }>();
    const villageNameMap = new Map<string, { lat: number; lng: number }>();
    for (const v of villages) {
      if (isValidGeoCoordinate(v.latitude, v.longitude)) {
        const coords = { lat: Number(v.latitude), lng: Number(v.longitude) };
        if (v.village_code) villageCoordMap.set(String(v.village_code).toLowerCase().trim(), coords);
        if (v.id) villageCoordMap.set(String(v.id).toLowerCase().trim(), coords);
        if (v.village_name) villageNameMap.set(String(v.village_name).toLowerCase().trim(), coords);
        if (v.name) villageNameMap.set(String(v.name).toLowerCase().trim(), coords);
      }
    }

    const allHomestayRows: any[] = [];
    const client = supabaseAdmin || supabase;
    if (client) {
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await client
          .from('homestays')
          .select('*')
          .or('status.is.null,status.neq.Rejected')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        if (error) {
          break;
        }
        if (!data || data.length === 0) break;
        allHomestayRows.push(...data);
        if (data.length < pageSize) break;
        page++;
      }
    }

    if (allHomestayRows.length === 0 && dbStore.getHomestays) {
      allHomestayRows.push(...dbStore.getHomestays());
    }

    const rawData = allHomestayRows
      .filter((h: any) => h.status !== 'Rejected' && h.is_public !== false);

    const data = rawData.map((h: any) => {
      const rawLat = h.latitude !== undefined && h.latitude !== null ? Number(h.latitude) : null;
      const rawLng = h.longitude !== undefined && h.longitude !== null ? Number(h.longitude) : null;
      const hasOwnCoords = isValidGeoCoordinate(rawLat, rawLng);
      
      let coordSource: 'OWN' | 'VILLAGE' | 'MISSING' = 'MISSING';
      let villageLat: number | null = null;
      let villageLng: number | null = null;

      const vCode = String(h.village_code || h.village_id || h.destination_id || h.destinationId || '').toLowerCase().trim();
      const vName = String(h.village_name || h.village || '').toLowerCase().trim();
      
      if (vCode && villageCoordMap.has(vCode)) {
        const c = villageCoordMap.get(vCode)!;
        villageLat = c.lat;
        villageLng = c.lng;
      } else if (vName && villageNameMap.has(vName)) {
        const c = villageNameMap.get(vName)!;
        villageLat = c.lat;
        villageLng = c.lng;
      }

      let lat: number | null = null;
      let lng: number | null = null;

      if (hasOwnCoords) {
        coordSource = 'OWN';
        lat = rawLat;
        lng = rawLng;
      } else if (villageLat !== null && villageLng !== null) {
        coordSource = 'VILLAGE';
        // DO NOT pretend village coordinates are the homestay's individual coordinates for individual distance ranking
        lat = null;
        lng = null;
      } else {
        coordSource = 'MISSING';
        lat = null;
        lng = null;
      }

      return { 
        ...h, 
        latitude: lat, 
        longitude: lng,
        village_latitude: villageLat,
        village_longitude: villageLng,
        coordinateSource: coordSource
      };
    });

    entityCache.homestays = { data, lastFetched: now };
    return data;
  } catch (err: any) {
    if (!err?.message?.includes('circuit breaker')) {
      console.warn('[GeoProximityService] Notice fetching live homestays from Supabase:', err.message || err);
    }
    const fallback = entityCache.homestays?.data && entityCache.homestays.data.length > 0
      ? entityCache.homestays.data
      : (dbStore.getHomestays ? dbStore.getHomestays() : []);
    return fallback;
  }
}

export async function getLiveSupabaseTaxiStands(): Promise<any[]> {
  const now = Date.now();
  if (entityCache.taxi_stands && (now - entityCache.taxi_stands.lastFetched < CACHE_TTL_MS)) {
    return entityCache.taxi_stands.data;
  }
  try {
    let rows: any[] = [];
    const client = supabaseAdmin || supabase;
    if (client) {
      const { data, error } = await client.from('taxi_stands').select('*').limit(1000);
      if (!error && Array.isArray(data) && data.length > 0) {
        rows = data;
      }
    }
    if (rows.length === 0) {
      const res = await querySupabaseTable('geo:taxi_stands', 'taxi_stands', q => q.select('*').limit(1000));
      if (Array.isArray(res?.data) && res.data.length > 0) {
        rows = res.data;
      }
    }
    if (rows.length === 0) {
      const fromStore = dbStore.getTaxiStands ? dbStore.getTaxiStands() : (dbStore.getHubs ? dbStore.getHubs() : []);
      rows = (Array.isArray(fromStore) && fromStore.length > 0) ? fromStore : CANONICAL_TAXI_STANDS;
    }
    entityCache.taxi_stands = { data: rows, lastFetched: now };
    return rows;
  } catch (err: any) {
    if (!err?.message?.includes('circuit breaker')) {
      console.warn('[GeoProximityService] Notice fetching live taxi stands from Supabase:', err.message || err);
    }
    const fallback = entityCache.taxi_stands?.data && entityCache.taxi_stands.data.length > 0
      ? entityCache.taxi_stands.data
      : ((dbStore.getTaxiStands ? dbStore.getTaxiStands() : (dbStore.getHubs ? dbStore.getHubs() : [])) || CANONICAL_TAXI_STANDS);
    return fallback && fallback.length > 0 ? fallback : CANONICAL_TAXI_STANDS;
  }
}

function projectVillage(row: any) {
  const id = row.village_code || row.destination_id || row.id || '';
  const name = row.village_name || row.name || '';
  const admin = resolveAdminLocation(row);
  const district = admin.district || 'Darjeeling';
  const state = admin.state || (String(id).startsWith('SK') ? 'Sikkim' : 'West Bengal');
  const img = resolveVillageImage(row, district, state);

  let lat = row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : null;
  let lng = row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : null;
  if (!isValidGeoCoordinate(lat, lng)) {
    const canonical = resolveCanonicalCoordinates(row, name, district);
    if (canonical) {
      lat = canonical.lat;
      lng = canonical.lng;
    }
  }

  return {
    id,
    village_code: row.village_code || id,
    name,
    village_name: name,
    tourismType: row.known_for || row.tourismType || 'Scenic Himalayan Village',
    district,
    district_name: district,
    state,
    state_name: state,
    latitude: lat,
    longitude: lng,
    elevation: row.elevation || row.altitude || null,
    altitude: row.altitude || row.elevation || null,
    image: img,
    image_url: img,
    coverImage: row.coverImage || row.cover_image || img,
    slug: row.slug || String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    overview: row.overview || row.description || '',
    bestTimeToVisit: row.bestTimeToVisit || row.best_time_to_visit || 'September to June'
  };
}

function projectAttraction(row: any) {
  const id = row.attraction_id || row.id || '';
  const name = row.attraction_name || row.name || '';
  const category = row.category || 'Sightseeing';
  const img = row.image_url || row.image || getSmartDirectUnsplashUrl(name, '', category);
  const admin = resolveAdminLocation(row);

  return {
    id,
    attraction_id: id,
    name,
    attraction_name: name,
    category,
    image: img,
    image_url: img,
    latitude: row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : null,
    longitude: row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : null,
    description: row.description || '',
    district: admin.district,
    state: admin.state,
    slug: row.slug || String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    isHiddenGem: row.isHiddenGem ?? row.is_hidden_gem ?? false,
    isFeaturedAttraction: row.isFeaturedAttraction ?? row.is_featured_attraction ?? false
  };
}

function projectHomestay(row: any) {
  let imgList: string[] = [];
  if (Array.isArray(row.images) && row.images.length > 0) {
    imgList = row.images;
  } else if (typeof row.images === 'string') {
    try { imgList = JSON.parse(row.images); } catch (e) { imgList = [row.images]; }
  } else if (row.image_url) {
    imgList = [row.image_url];
  } else if (row.image) {
    imgList = [row.image];
  }
  if (!Array.isArray(imgList) || imgList.length === 0 || !imgList[0]) {
    imgList = [getSmartDirectUnsplashUrl(row.homestay_name || row.name || 'Homestay', 'Mountain view homestay', 'village')];
  }

  const id = row.homestay_id || row.id || '';
  const name = row.homestay_name || row.name || 'Himalayan Homestay';
  const vCode = row.village_code || row.villageCode || row.destinationId || row.destination_id || '';
  const contact = row.contact_number || row.contactNumber || row.contact || '';
  const rawPriceMin = row.priceMin !== undefined && row.priceMin !== null ? Number(row.priceMin) : (row.price_per_night ? Number(row.price_per_night) : 1200);
  const rawPriceMax = row.priceMax !== undefined && row.priceMax !== null ? Number(row.priceMax) : (row.price_per_night ? Number(row.price_per_night) * 2 : 2800);
  const admin = resolveAdminLocation(row);

  const rawLat = row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : null;
  const rawLng = row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : null;
  const hasOwnCoords = isValidGeoCoordinate(rawLat, rawLng);

  const coordSource = row.coordinateSource || (hasOwnCoords ? 'OWN' : (row.village_latitude ? 'VILLAGE' : 'MISSING'));

  return {
    id,
    homestay_id: id,
    name,
    homestay_name: name,
    village_code: vCode,
    ownerName: row.owner_name || row.ownerName || 'Verified Himalayan Host',
    contact,
    contactNumber: contact,
    whatsappNumber: contact,
    email: row.email || '',
    address: row.address || '',
    latitude: hasOwnCoords ? rawLat : null,
    longitude: hasOwnCoords ? rawLng : null,
    village_latitude: row.village_latitude ?? null,
    village_longitude: row.village_longitude ?? null,
    coordinateSource: coordSource,
    priceMin: rawPriceMin,
    priceMax: rawPriceMax,
    price_per_night: rawPriceMin,
    amenities: Array.isArray(row.amenities) && row.amenities.length > 0 ? row.amenities : (typeof row.amenities === 'string' && row.amenities.trim() !== '' ? row.amenities.split(',').map((s: string) => s.trim()) : ['Wifi', 'Mountain View', 'Home Cooked Meals', 'Hot Water']),
    images: imgList,
    image: imgList[0],
    status: row.status || 'Active',
    district: admin.district,
    state: admin.state,
    slug: row.slug || String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    is_public: row.is_public ?? true,
    verified: row.verified ?? true,
    claim_status: row.claim_status || 'UNCLAIMED'
  };
}

function projectTaxiStand(row: any) {
  const id = row.taxi_id || row.id || '';
  const name = row.taxi_stand_name || row.name || '';
  const isMajor = row.is_major ?? row.is_main ?? isKnownMajorHub(name);
  const admin = resolveAdminLocation(row);

  return {
    id,
    taxi_id: id,
    name,
    taxi_stand_name: name,
    latitude: row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : null,
    longitude: row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : null,
    district: admin.district,
    state: admin.state,
    is_major: isMajor,
    is_main: isMajor,
    contact_number: row.contact_number || row.contact || '',
    vehicle_types: row.vehicle_types || ['Bolero 4x4', 'Tata Sumo', 'Shared Maxx Cab']
  };
}

function isKnownMajorHub(name: string): boolean {
  const n = String(name || '').toLowerCase();
  return (
    n.includes('siliguri') ||
    n.includes('njp') ||
    n.includes('darjeeling motor') ||
    n.includes('darjeeling main') ||
    n.includes('gangtok') ||
    n.includes('kalimpong') ||
    n.includes('pelling') ||
    n.includes('namchi') ||
    n.includes('bagdogra') ||
    n.includes('junction')
  );
}

/**
 * Filter & Sort items with strict radius calculation and strict deduplication.
 */
function findNearbyEntitiesWithProgressiveRadius<T = any>(
  originLat: number,
  originLng: number,
  items: T[],
  options: {
    initialRadiusKm: number;
    limit: number;
    excludeId?: string;
    getId?: (item: T) => string;
    getCoords?: (item: T) => { lat: number; lng: number } | null;
  }
): NearbyEntityResult<T>[] {
  if (!isValidGeoCoordinate(originLat, originLng) || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  const excludeId = options.excludeId ? String(options.excludeId).toLowerCase().trim() : null;
  const seenIds = new Set<string>();
  const seenLocationKeys = new Set<string>();
  const allCalculated: NearbyEntityResult<T>[] = [];

  for (const item of items) {
    if (!item) continue;

    const itemId = options.getId 
      ? options.getId(item) 
      : String((item as any).id || (item as any).village_code || (item as any).taxi_id || (item as any).homestay_id || (item as any).attraction_id || '');
    
    const cleanId = String(itemId).toLowerCase().trim();

    if (excludeId && (cleanId === excludeId || cleanId === '')) {
      continue;
    }

    if (cleanId && seenIds.has(cleanId)) {
      continue;
    }

    const coords = options.getCoords ? options.getCoords(item) : extractEntityCoordinates(item);
    if (!coords || !isValidGeoCoordinate(coords.lat, coords.lng)) {
      continue;
    }

    // Filter out unlocated dummy seed coordinates (27.0410, 88.2663) if the entity has no explicit village
    const isDummyDistrictSeed = Math.abs(coords.lat - 27.0410) < 0.0005 && Math.abs(coords.lng - 88.2663) < 0.0005;
    const hasLinkedVillage = Boolean((item as any).village_code || (item as any).villageCode || (item as any).destinationId);
    if (isDummyDistrictSeed && (!hasLinkedVillage || (item as any).is_public === false)) {
      continue;
    }

    const distKm = calculateHaversineDistanceKm(originLat, originLng, coords.lat, coords.lng);
    if (distKm === Infinity || isNaN(distKm) || (excludeId && distKm < 0.05)) {
      continue;
    }

    // Name + Coord Deduplication
    const rawName = String((item as any).name || (item as any).village_name || (item as any).attraction_name || (item as any).homestay_name || (item as any).taxi_stand_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const locationKey = `${rawName}_${coords.lat.toFixed(3)}_${coords.lng.toFixed(3)}`;
    if (rawName && seenLocationKeys.has(locationKey)) {
      continue;
    }

    if (cleanId) seenIds.add(cleanId);
    if (rawName) seenLocationKeys.add(locationKey);

    allCalculated.push({
      entity: item,
      distanceKm: distKm,
      distanceFormatted: formatDistanceKm(distKm)
    });
  }

  // Sort ascending (nearest first)
  allCalculated.sort((a, b) => a.distanceKm - b.distanceKm);

  if (allCalculated.length === 0) {
    return [];
  }

  // Strict radius filtering: only return entities strictly within requested initialRadiusKm (raw distance <= options.initialRadiusKm)
  const withinRadius = allCalculated.filter(item => item.distanceKm <= options.initialRadiusKm);
  return withinRadius.slice(0, options.limit);
}

/**
 * Resolves an entity's coordinates dynamically by its type and ID/slug from live Supabase tables.
 */
export async function resolveEntityLocation(
  entityType: string,
  entityId: string
): Promise<{ id: string; name: string; type: string; latitude: number; longitude: number } | null> {
  const cleanId = String(entityId || '').trim();
  const cleanIdLower = cleanId.toLowerCase();
  const targetSlug = toSlug(cleanId);
  const cleanSearch = cleanIdLower.replace(/-/g, ' ');
  const cleanType = String(entityType || '').toLowerCase().trim();

  const isMatch = (idVal?: string, nameVal?: string, slugVal?: string) => {
    const i = String(idVal || '').toLowerCase().trim();
    const n = String(nameVal || '').toLowerCase().trim();
    const s = String(slugVal || '').toLowerCase().trim();
    if (i && (i === cleanIdLower || toSlug(i) === targetSlug)) return true;
    if (n && (n === cleanIdLower || toSlug(n) === targetSlug || n === cleanSearch)) return true;
    if (s && (s === cleanIdLower || toSlug(s) === targetSlug || s === cleanSearch)) return true;
    
    // Strict slug or compound slug check: e.g. "srikhola-darjeeling" matching village "srikhola"
    if (targetSlug && n && (targetSlug.startsWith(toSlug(n) + '-') || targetSlug === toSlug(n))) return true;
    if (targetSlug && s && (targetSlug.startsWith(toSlug(s) + '-') || targetSlug === toSlug(s))) return true;

    // Word boundary or substring checks (avoid matching partial words like "jeel" in "darjeeling")
    if (cleanSearch.length >= 4 && n.length >= 4) {
      if (n.includes(cleanSearch)) return true;
      const words = cleanSearch.split(' ');
      if (words.includes(n)) return true;
    }
    return false;
  };

  // 1. Village / Destination
  if (cleanType === 'village' || cleanType === 'villages' || cleanType === 'destination' || cleanType === 'destinations') {
    const villages = await getLiveSupabaseVillages();
    const match: any = 
      villages.find((v: any) => {
        const i = String(v.village_code || v.destination_id || v.id || '').toLowerCase().trim();
        const n = String(v.village_name || v.name || '').toLowerCase().trim();
        const s = String(v.slug || '').toLowerCase().trim();
        return (i && (i === cleanIdLower || toSlug(i) === targetSlug)) ||
               (n && (n === cleanIdLower || toSlug(n) === targetSlug || n === cleanSearch)) ||
               (s && (s === cleanIdLower || toSlug(s) === targetSlug || s === cleanSearch));
      }) ||
      villages.find((v: any) => {
        const n = String(v.village_name || v.name || '').toLowerCase().trim();
        const s = String(v.slug || '').toLowerCase().trim();
        return (s && targetSlug.startsWith(toSlug(s) + '-')) ||
               (n && targetSlug.startsWith(toSlug(n) + '-'));
      }) ||
      villages.find((v: any) => 
        isMatch(v.village_code || v.id || v.destination_id, v.village_name || v.name, v.slug)
      );

    if (match) {
      let lat = match.latitude !== undefined && match.latitude !== null ? Number(match.latitude) : null;
      let lng = match.longitude !== undefined && match.longitude !== null ? Number(match.longitude) : null;
      if (!isValidGeoCoordinate(lat, lng)) {
        const canonical = resolveCanonicalCoordinates(match, match.village_name || match.name, match.district || match.district_name);
        if (canonical) {
          lat = canonical.lat;
          lng = canonical.lng;
        } else {
          const fb = getDistrictFallbackCoords(match.district || match.district_name, match.state || match.state_name);
          lat = fb.lat;
          lng = fb.lng;
        }
      }
      return {
        id: match.village_code || match.destination_id || match.id,
        name: match.village_name || match.name,
        type: 'village',
        latitude: lat!,
        longitude: lng!
      };
    }

    const canonicalFallback = resolveCanonicalCoordinates(cleanId, cleanId, cleanSearch.includes('darjeeling') ? 'Darjeeling' : undefined);
    if (canonicalFallback) {
      return {
        id: cleanId,
        name: cleanId.replace(/[-_]/g, ' '),
        type: 'village',
        latitude: canonicalFallback.lat,
        longitude: canonicalFallback.lng
      };
    }
  }

  // 2. Attraction
  if (cleanType === 'attraction' || cleanType === 'attractions') {
    const attractions = await getLiveSupabaseAttractions();
    const match: any = attractions.find((a: any) => 
      isMatch(a.id || a.attraction_id, a.name || a.attraction_name, a.slug)
    );
    if (match) {
      let lat = match.latitude !== undefined && match.latitude !== null ? Number(match.latitude) : null;
      let lng = match.longitude !== undefined && match.longitude !== null ? Number(match.longitude) : null;
      if (!isValidGeoCoordinate(lat, lng)) {
        const fb = getDistrictFallbackCoords(match.district, match.state);
        lat = fb.lat;
        lng = fb.lng;
      }
      return {
        id: match.id || match.attraction_id,
        name: match.name || match.attraction_name,
        type: 'attraction',
        latitude: lat!,
        longitude: lng!
      };
    }
  }

  // 3. Homestay
  if (cleanType === 'homestay' || cleanType === 'homestays') {
    const homestays = await getLiveSupabaseHomestays();
    const match: any = homestays.find((h: any) => 
      isMatch(h.id || h.homestay_id, h.name || h.homestay_name, h.slug)
    );
    if (match) {
      let lat = match.latitude !== undefined && match.latitude !== null ? Number(match.latitude) : null;
      let lng = match.longitude !== undefined && match.longitude !== null ? Number(match.longitude) : null;
      if (!isValidGeoCoordinate(lat, lng)) {
        const fb = getDistrictFallbackCoords(match.district, match.state);
        lat = fb.lat;
        lng = fb.lng;
      }
      return {
        id: match.id || match.homestay_id,
        name: match.name || match.homestay_name,
        type: 'homestay',
        latitude: lat!,
        longitude: lng!
      };
    }
  }

  // 4. Taxi Stand / Hub
  if (cleanType === 'taxi_stand' || cleanType === 'taxi_stands' || cleanType === 'hub' || cleanType === 'hubs') {
    const taxiStands = await getLiveSupabaseTaxiStands();
    const match: any = taxiStands.find((t: any) => 
      isMatch(t.id || t.taxi_id, t.name || t.taxi_stand_name, t.slug)
    );
    if (match) {
      let lat = match.latitude !== undefined && match.latitude !== null ? Number(match.latitude) : null;
      let lng = match.longitude !== undefined && match.longitude !== null ? Number(match.longitude) : null;
      if (!isValidGeoCoordinate(lat, lng)) {
        const fb = getDistrictFallbackCoords(match.district, match.state);
        lat = fb.lat;
        lng = fb.lng;
      }
      return {
        id: match.id || match.taxi_id,
        name: match.name || match.taxi_stand_name,
        type: 'taxi_stand',
        latitude: lat!,
        longitude: lng!
      };
    }
  }

  return null;
}

/**
 * Universal Geo Proximity Calculation for explicit coordinates.
 * Reads live Supabase tables, calculates Haversine distance, progressively expands radius so sections never appear empty,
 * and sorts nearest first.
 */
export async function calculateUniversalNearby(
  originLat: number,
  originLng: number,
  options: NearbyQueryOptions = {}
): Promise<UniversalNearbyResponse> {
  const radiusKm = options.radiusKm ?? 15;
  const limit = options.limit ?? 24;
  const targetTypes = options.targetTypes ?? ['villages', 'attractions', 'homestays', 'taxi_stands'];
  const excludeId = options.excludeId;
  const excludeType = options.excludeType;

  // Retrieve live Supabase tables in parallel
  const [rawVillages, rawAttractions, rawHomestays, rawTaxiStands] = await Promise.all([
    targetTypes.includes('villages') ? getLiveSupabaseVillages() : Promise.resolve([]),
    targetTypes.includes('attractions') ? getLiveSupabaseAttractions() : Promise.resolve([]),
    targetTypes.includes('homestays') ? getLiveSupabaseHomestays() : Promise.resolve([]),
    targetTypes.includes('taxi_stands') ? getLiveSupabaseTaxiStands() : Promise.resolve([])
  ]);

  let nearbyVillages: NearbyEntityResult[] = [];
  let nearbyAttractions: NearbyEntityResult[] = [];
  let nearbyHomestays: NearbyEntityResult[] = [];
  let nearbyTaxiStands: NearbyEntityResult[] = [];

  if (targetTypes.includes('villages') && rawVillages.length > 0) {
    const projected = rawVillages.map(projectVillage);
    nearbyVillages = findNearbyEntitiesWithProgressiveRadius(originLat, originLng, projected, {
      initialRadiusKm: radiusKm,
      limit,
      excludeId: excludeType === 'village' ? excludeId : undefined,
      getId: (v: any) => v.village_code || v.id || ''
    });
  }

  if (targetTypes.includes('attractions') && rawAttractions.length > 0) {
    const projected = rawAttractions.map(projectAttraction);
    nearbyAttractions = findNearbyEntitiesWithProgressiveRadius(originLat, originLng, projected, {
      initialRadiusKm: radiusKm,
      limit,
      excludeId: excludeType === 'attraction' ? excludeId : undefined,
      getId: (a: any) => a.id || a.attraction_id || ''
    });
  }

  if (targetTypes.includes('homestays') && rawHomestays.length > 0) {
    const projected = rawHomestays.map(projectHomestay);
    nearbyHomestays = findNearbyEntitiesWithProgressiveRadius(originLat, originLng, projected, {
      initialRadiusKm: radiusKm,
      limit,
      excludeId: excludeType === 'homestay' ? excludeId : undefined,
      getId: (h: any) => h.id || h.homestay_id || ''
    });
  }

  if (targetTypes.includes('taxi_stands') && rawTaxiStands.length > 0) {
    const projected = rawTaxiStands.map(projectTaxiStand);
    nearbyTaxiStands = findNearbyEntitiesWithProgressiveRadius(originLat, originLng, projected, {
      initialRadiusKm: radiusKm,
      limit,
      excludeId: (excludeType === 'taxi_stand' || excludeType === 'hub') ? excludeId : undefined,
      getId: (t: any) => t.id || t.taxi_id || ''
    });
  }

  return {
    success: true,
    origin: {
      latitude: originLat,
      longitude: originLng
    },
    radiusKm,
    limit,
    nearby: {
      villages: nearbyVillages,
      attractions: nearbyAttractions,
      homestays: nearbyHomestays,
      taxi_stands: nearbyTaxiStands
    },
    counts: {
      villages: nearbyVillages.length,
      attractions: nearbyAttractions.length,
      homestays: nearbyHomestays.length,
      taxi_stands: nearbyTaxiStands.length,
      total: nearbyVillages.length + nearbyAttractions.length + nearbyHomestays.length + nearbyTaxiStands.length
    }
  };
}

/**
 * Universal Geo Proximity Calculation by Entity ID and Type
 */
export async function calculateNearbyForEntity(
  entityType: string,
  entityId: string,
  options: NearbyQueryOptions = {}
): Promise<UniversalNearbyResponse | null> {
  const origin = await resolveEntityLocation(entityType, entityId);
  if (!origin) {
    return null;
  }

  const result = await calculateUniversalNearby(origin.latitude, origin.longitude, {
    ...options,
    excludeId: origin.id,
    excludeType: origin.type
  });

  result.origin = {
    ...result.origin,
    id: origin.id,
    type: origin.type,
    name: origin.name
  };

  return result;
}
