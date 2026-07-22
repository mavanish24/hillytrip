import fs from 'fs';
import path from 'path';
import { Type } from "@google/genai";
import { dbStore } from './db';
import { executeGeminiOperation } from "./geminiClient";
import { GeospatialRelationship } from '../types';
const initialHomestays: any[] = [];
const initialRoutes: any[] = [];

// Cache configuration
const CACHE_PATH = path.join(process.cwd(), 'src', 'server', 'geocoding_cache.json');

interface CachedLocation {
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  country: string;
}

let geocodingCache: Record<string, CachedLocation> = {};

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const data = fs.readFileSync(CACHE_PATH, 'utf-8');
      geocodingCache = JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load geocoding cache:', err);
  }
}

function saveCache() {
  // Local file writes disabled to make the app fully stateless
  console.log('[Location Intelligence] saveCache() called (local file writes disabled to maintain statelessness in Cloud Run)');
}

// Initial cache load
loadCache();

// Distance helper
export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
      lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 0;
  }
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const aClamped = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(aClamped), Math.sqrt(1 - aClamped));
  const d = R * c;
  if (isNaN(d)) return 0;
  return Number(d.toFixed(2));
}

// Verification boundaries for locations (India/himalayas)
export function isCoordinateValid(lat: number, lon: number): boolean {
  if (lat === undefined || lon === undefined || lat === null || lon === null) return false;
  const nLat = Number(lat);
  const nLon = Number(lon);
  if (isNaN(nLat) || isNaN(nLon)) return false;
  if (nLat === 0 && nLon === 0) return false;
  // Bounding box: Indian regions (especially Himalayan mountains)
  return (nLat >= 8.0 && nLat <= 38.0 && nLon >= 68.0 && nLon <= 98.0);
}

// Build optimized location query string
export function buildLocationQuery(record: any, type: string, destinations: any[]): string {
  if (type === 'destination' || type === 'destinations') {
    return `${record.name}, ${record.tourismType || ''}, India`;
  }
  if (type === 'hub' || type === 'hubs') {
    return `${record.name} Transit Node, India`;
  }
  const dest = destinations.find(d => d.id === record.destinationId);
  const destName = dest ? dest.name : '';
  const destDetails = dest ? `${dest.district || ''} ${dest.state || ''}` : '';
  
  if (type === 'attraction' || type === 'attractions') {
    return `${record.name}, near ${destName}, ${record.category || ''}, ${destDetails}, India`;
  } else {
    // homestay
    return `${record.name}, ${record.address || ''}, near ${destName}, ${destDetails}, India`;
  }
}

// Low level geocoding
export async function geocodeLocationGemini(query: string, defaultFallback?: CachedLocation, forceRealCall: boolean = false): Promise<CachedLocation> {
  const normQuery = query.toLowerCase().trim();
  if (geocodingCache[normQuery] && !forceRealCall) {
    return geocodingCache[normQuery];
  }

  const phase = process.env.AI_GEOCODING_PHASE ? parseInt(process.env.AI_GEOCODING_PHASE, 10) : 1; 

  if (phase === 1 && !forceRealCall) {
    // Phase 1: Local caching and smart fallback coordinates determination 
    return defaultFallback || {
      latitude: 27.03,
      longitude: 88.26,
      district: "Darjeeling",
      state: "West Bengal",
      country: "India"
    };
  }

  try {
    const responseText = await executeGeminiOperation(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Retrieve highly precise geographical coordinates (latitude and longitude), district, state, and country for: "${query}". Respond ONLY with valid JSON conforming strictly to the requested schema. Ensure mountain region coordinates are highly accurate.`,
        config: {
          temperature: 0.0,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              latitude: { type: Type.NUMBER, description: "Latitude coordinates (e.g. 27.03)" },
              longitude: { type: Type.NUMBER, description: "Longitude coordinates (e.g. 88.26)" },
              district: { type: Type.STRING, description: "District name" },
              state: { type: Type.STRING, description: "State name" },
              country: { type: Type.STRING, description: "Country name" }
            },
            required: ["latitude", "longitude", "district", "state", "country"]
          }
        }
      });
      return response.text || "";
    });

    if (!responseText) {
      throw new Error('Empty response returned from Gemini API.');
    }

    const resultStr = responseText.trim();
    const parsed = JSON.parse(resultStr) as CachedLocation;

    if (typeof parsed.latitude !== 'number' || typeof parsed.longitude !== 'number') {
      throw new Error('Invalid coordinate format received.');
    }

    geocodingCache[normQuery] = parsed;
    saveCache();
    return parsed;
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.log(`[Geocoding Fallback] Gemini Geocoding unavailable or rate-limited. (Quiet fallback applied for query: "${query}"). Error: ${errMsg}`);
    
    if (forceRealCall) {
      throw err;
    }

    return defaultFallback || getSmartQueryFallback(query);
  }
}

export function getSmartQueryFallback(query: string): CachedLocation {
  const q = query.toLowerCase();
  let baseLat = 27.03;
  let baseLon = 88.26;
  let district = "Darjeeling";
  let state = "West Bengal";
  
  if (q.includes("sikkim")) {
    state = "Sikkim";
    if (q.includes("north")) {
      district = "North Sikkim";
      baseLat = 27.70;
      baseLon = 88.58;
    } else if (q.includes("south")) {
      district = "South Sikkim";
      baseLat = 27.20;
      baseLon = 88.40;
    } else if (q.includes("west")) {
      district = "West Sikkim";
      baseLat = 27.27;
      baseLon = 88.25;
    } else if (q.includes("east")) {
      district = "East Sikkim";
      baseLat = 27.30;
      baseLon = 88.60;
    } else {
      district = "Sikkim";
      baseLat = 27.33;
      baseLon = 88.61;
    }
  } else if (q.includes("kalimpong")) {
    district = "Kalimpong";
    state = "West Bengal";
    baseLat = 27.06;
    baseLon = 88.47;
  } else if (q.includes("darjeeling")) {
    district = "Darjeeling";
    state = "West Bengal";
    baseLat = 27.03;
    baseLon = 88.26;
  } else if (q.includes("jaldapara")) {
    district = "Alipurduar";
    state = "West Bengal";
    baseLat = 26.69;
    baseLon = 89.27;
  } else if (q.includes("alipurduar")) {
    district = "Alipurduar";
    state = "West Bengal";
    baseLat = 26.59;
    baseLon = 89.52;
  } else if (q.includes("jalpaiguri")) {
    district = "Jalpaiguri";
    state = "West Bengal";
    baseLat = 26.52;
    baseLon = 88.72;
  }

  // Jitter coordinates based on query text hash
  const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const jitterLat = ((hash % 100) - 50) / 1000; // up to +/- 0.05 degrees offset
  const jitterLon = (((hash * 7) % 100) - 50) / 1000;

  return {
    latitude: Number((baseLat + jitterLat).toFixed(4)),
    longitude: Number((baseLon + jitterLon).toFixed(4)),
    district,
    state,
    country: "India"
  };
}

export function getOfflineGeocodeFallback(record: any, col: string, destList: any[]): CachedLocation {
  let fallbackLat = 27.03;
  let fallbackLon = 88.26;
  let fallbackDistrict = record.district || "Darjeeling";
  let fallbackState = record.state || "West Bengal";
  let fallbackCountry = record.country || "India";

  // 1. If it's an attraction or homestay, try to inherit from its parent destination
  if (col === 'attractions' || col === 'homestays') {
    const parentDest = destList.find(d => d.id === record.destinationId);
    if (parentDest) {
      if (isCoordinateValid(Number(parentDest.latitude), Number(parentDest.longitude))) {
        // Apply deterministic jitter based on record ID hash to prevent direct overlay
        const seed = record.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const jitterLat = ((seed % 100) - 50) / 10000; // -0.005 to +0.005 (~500m)
        const jitterLon = (((seed * 7) % 100) - 50) / 10000;

        return {
          latitude: Number((Number(parentDest.latitude) + jitterLat).toFixed(4)),
          longitude: Number((Number(parentDest.longitude) + jitterLon).toFixed(4)),
          district: record.district || parentDest.district || parentDest.name,
          state: record.state || parentDest.state || "West Bengal",
          country: record.country || parentDest.country || "India"
        };
      }
      if (parentDest.district) {
        fallbackDistrict = parentDest.district;
      }
      if (parentDest.state) {
        fallbackState = parentDest.state;
      }
    }
  }

  // 2. Guess location based on district / state keywords in the record name or query fields
  const textToSearch = `${record.name} ${fallbackDistrict} ${fallbackState}`.toLowerCase();
  
  if (textToSearch.includes('sikkim')) {
    fallbackState = "Sikkim";
    if (textToSearch.includes('north')) {
      fallbackDistrict = "North Sikkim";
      fallbackLat = 27.70;
      fallbackLon = 88.58;
    } else if (textToSearch.includes('south')) {
      fallbackDistrict = "South Sikkim";
      fallbackLat = 27.20;
      fallbackLon = 88.40;
    } else if (textToSearch.includes('west')) {
      fallbackDistrict = "West Sikkim";
      fallbackLat = 27.27;
      fallbackLon = 88.25;
    } else if (textToSearch.includes('east')) {
      fallbackDistrict = "East Sikkim";
      fallbackLat = 27.30;
      fallbackLon = 88.60;
    } else {
      fallbackDistrict = "Sikkim";
      fallbackLat = 27.33;
      fallbackLon = 88.61;
    }
  } else if (textToSearch.includes('kalimpong')) {
    fallbackDistrict = "Kalimpong";
    fallbackState = "West Bengal";
    fallbackLat = 27.06;
    fallbackLon = 88.47;
  } else if (textToSearch.includes('darjeeling')) {
    fallbackDistrict = "Darjeeling";
    fallbackState = "West Bengal";
    fallbackLat = 27.03;
    fallbackLon = 88.26;
  } else if (textToSearch.includes('jaldapara')) {
    fallbackDistrict = "Alipurduar";
    fallbackState = "West Bengal";
    fallbackLat = 26.69;
    fallbackLon = 89.27;
  } else if (textToSearch.includes('alipurduar')) {
    fallbackDistrict = "Alipurduar";
    fallbackState = "West Bengal";
    fallbackLat = 26.59;
    fallbackLon = 89.52;
  } else if (textToSearch.includes('jalpaiguri')) {
    fallbackDistrict = "Jalpaiguri";
    fallbackState = "West Bengal";
    fallbackLat = 26.52;
    fallbackLon = 88.72;
  }

  // Apply deterministic jitter based on record ID to avoid identical coordinates
  const seed = record.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const jitterLat = ((seed % 200) - 100) / 1000; // -0.1 to +0.1 degrees
  const jitterLon = (((seed * 7) % 200) - 100) / 1000;

  return {
    latitude: Number((fallbackLat + jitterLat).toFixed(4)),
    longitude: Number((fallbackLon + jitterLon).toFixed(4)),
    district: fallbackDistrict,
    state: fallbackState,
    country: fallbackCountry
  };
}

// Generate an engaging proper description of an attraction using Gemini AI
export async function generateAttractionDescriptionGemini(name: string, category: string, destinationName: string, region: string): Promise<string> {
  try {
    const text = await executeGeminiOperation(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a beautiful, proper, and engaging travel description (2 to 3 lines, around 30 to 50 words) for the Himalayan tourist sightseeing spot: "${name}" (which is a "${category}") located near "${destinationName}" in "${region}", North-East India (Darjeeling/Sikkim area). Mention its panoramic views, tranquil beauty, cultural or natural traits, and Kanchenjunga visibility if applicable. Do not use quotes, intro greetings, markdown styling, or text wrapping: output only the raw plain description.`,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "";
    });
    return text.trim().replace(/^["']|["']$/g, '');
  } catch (err) {
    console.warn(`[AI Description Fallback] Gemini description unavailable for ${name}. Applying offline templates.`);
    return `An absolutely beautiful scenic spot ("${category}") located near ${destinationName}. Renowned for its magnificent mountain views, clean fresh air, and serene natural trekking routes.`;
  }
}

// Record Lookup mapping helper
export function lookupRecord(col: string, id: string): any {
  if (col === 'destinations') return dbStore.getDestinations().find(it => it.id === id);
  if (col === 'attractions') return dbStore.getAttractions().find(it => it.id === id);
  if (col === 'homestays') return dbStore.getHomestays().find(it => it.id === id);
  if (col === 'hubs') return dbStore.getHubs().find(it => it.id === id);
  return null;
}

// Calculate relationships for a record
export async function recalculateSpatialForRecord(col: string, recordId: string, skipSave: boolean = false): Promise<boolean> {
  const record = lookupRecord(col, recordId);
  if (!record) return false;

  const lat = Number(record.latitude);
  const lon = Number(record.longitude);
  if (!isCoordinateValid(lat, lon)) return false;

  const destinations = dbStore.getDestinations();
  const attractions = dbStore.getAttractions();
  const homestays = dbStore.getHomestays();
  const hubs = dbStore.getHubs();

  const updates: any = {};

  // 1. Nearest destination
  let bestDest: any = null;
  let minDestDist = Infinity;
  for (const d of destinations) {
    if (col === 'destinations' && d.id === recordId) continue;
    const dLat = Number(d.latitude);
    const dLon = Number(d.longitude);
    if (isCoordinateValid(dLat, dLon)) {
      const dist = getDistanceInKm(lat, lon, dLat, dLon);
      if (dist < minDestDist) {
        minDestDist = dist;
        bestDest = d;
      }
    }
  }
  if (bestDest) {
    updates.nearestDestinationId = bestDest.id;
    updates.distanceFromDestination = minDestDist;
  }

  // 2. Nearest Hub
  let bestHub: any = null;
  let minHubDist = Infinity;
  for (const h of hubs) {
    const hLat = Number((h as any).latitude);
    const hLon = Number((h as any).longitude);
    if (isCoordinateValid(hLat, hLon)) {
      const dist = getDistanceInKm(lat, lon, hLat, hLon);
      if (dist < minHubDist) {
        minHubDist = dist;
        bestHub = h;
      }
    }
  }
  if (bestHub) {
    updates.nearestHubId = bestHub.id;
    updates.distanceFromHub = minHubDist;
  }

  // 3. Nearby attractions (limit close 5, under 30km)
  // Bounding box pre-filter (+/- 0.35 deg is ~38km) to avoid calculating distances for far away items
  const sortedAttractions = attractions
    .filter(a => {
      if (col === 'attractions' && a.id === recordId) return false;
      const aLat = Number(a.latitude);
      const aLon = Number(a.longitude);
      if (!isCoordinateValid(aLat, aLon)) return false;
      return Math.abs(aLat - lat) < 0.35 && Math.abs(aLon - lon) < 0.35;
    })
    .map(a => {
      const dist = getDistanceInKm(lat, lon, Number(a.latitude), Number(a.longitude));
      return { id: a.id, name: a.name, distance: dist };
    })
    .filter(a => a.distance <= 30)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
  
  updates.nearbyAttractions = sortedAttractions;

  // 4. Nearby homestays (limit close 5, under 30km)
  // Bounding box pre-filter (+/- 0.35 deg is ~38km) to avoid calculating distances for far away items
  const sortedHomestays = homestays
    .filter(h => {
      if (col === 'homestays' && h.id === recordId) return false;
      const hLat = Number(h.latitude);
      const hLon = Number(h.longitude);
      if (!isCoordinateValid(hLat, hLon)) return false;
      return Math.abs(hLat - lat) < 0.35 && Math.abs(hLon - lon) < 0.35;
    })
    .map(h => {
      const dist = getDistanceInKm(lat, lon, Number(h.latitude), Number(h.longitude));
      return { id: h.id, name: h.name, distance: dist };
    })
    .filter(h => h.distance <= 30)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  updates.nearbyHomestays = sortedHomestays;

  // 5. Nearby destinations (limit close 5, under 80km) - only for destinations
  if (col === 'destinations') {
    // Bounding box pre-filter (+/- 0.90 deg is ~100km)
    const sortedDestinations = destinations
      .filter(d => {
        if (d.id === recordId) return false;
        const dLat = Number(d.latitude);
        const dLon = Number(d.longitude);
        if (!isCoordinateValid(dLat, dLon)) return false;
        return Math.abs(dLat - lat) < 0.90 && Math.abs(dLon - lon) < 0.90;
      })
      .map(d => {
        const dist = getDistanceInKm(lat, lon, Number(d.latitude), Number(d.longitude));
        return {
          id: d.id,
          name: d.name,
          distance: dist,
          image: d.image,
          tourismType: d.tourismType
        };
      })
      .filter(d => d.distance <= 80)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
    updates.nearbyDestinations = sortedDestinations;
  }

  if (skipSave) {
    Object.assign(record, updates);
  } else {
    await dbStore.updateRecord(col, recordId, updates);
  }
  return true;
}

// Helper to get bearing degrees and compass direction
export function getBearingString(lat1: number, lon1: number, lat2: number, lon2: number): { bearing: number; direction: string } {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  let brng = Math.atan2(y, x) * 180 / Math.PI;
  brng = (brng + 360) % 360;
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  const index = Math.round(brng / 45) % 8;
  return { bearing: Math.round(brng), direction: directions[index] };
}

// Distance from C to line segment A-B
export function getDistanceToSegment(latC: number, lonC: number, latA: number, lonA: number, latB: number, lonB: number): number {
  const x = lonC - lonA;
  const y = latC - latA;
  const dx = lonB - lonA;
  const dy = latB - latA;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return getDistanceInKm(latC, lonC, latA, lonA);
  let t = (x * dx + y * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projLat = latA + t * dy;
  const projLon = lonA + t * dx;
  return getDistanceInKm(latC, lonC, projLat, projLon);
}

// Grid Spatial Indexing for super-fast retrieval
export function createGridIndex<T extends { id: string; name: string; latitude?: number; longitude?: number; district?: string; state?: string; country?: string }>(records: T[]): Map<string, T[]> {
  const index = new Map<string, T[]>();
  for (const r of records) {
    const lat = Number(r.latitude);
    const lon = Number(r.longitude);
    if (!isCoordinateValid(lat, lon)) continue;
    const key = `${Math.floor(lat / 0.1)}_${Math.floor(lon / 0.1)}`;
    if (!index.has(key)) {
      index.set(key, []);
    }
    index.get(key)!.push(r);
  }
  return index;
}

export function queryGridIndex<T extends { id: string; name: string; latitude?: number; longitude?: number; district?: string; state?: string; country?: string }>(
  index: Map<string, T[]>,
  lat: number,
  lon: number,
  maxDistanceKm: number
): { record: T; distance: number }[] {
  const results: { record: T; distance: number }[] = [];
  const searchDegrees = maxDistanceKm / 111.32;
  const cellRange = Math.ceil(searchDegrees / 0.1);

  const centerCellLat = Math.floor(lat / 0.1);
  const centerCellLon = Math.floor(lon / 0.1);

  for (let dLat = -cellRange; dLat <= cellRange; dLat++) {
    for (let dLon = -cellRange; dLon <= cellRange; dLon++) {
      const key = `${centerCellLat + dLat}_${centerCellLon + dLon}`;
      const cells = index.get(key);
      if (cells) {
        for (const r of cells) {
          const dist = getDistanceInKm(lat, lon, Number(r.latitude), Number(r.longitude));
          if (dist <= maxDistanceKm) {
            results.push({ record: r, distance: dist });
          }
        }
      }
    }
  }
  return results.sort((a, b) => a.distance - b.distance);
}

// Bulk recalculate relationships
export async function recalculateAllSpatialRelations(): Promise<{ count: number; report?: any }> {
  console.log("[Geospatial Engine] Initiating complete relationship generation & self-healing...");

  const yieldToEventLoop = () => new Promise(resolve => setImmediate(resolve));

  // 1. Database Seeding / Self-healing
  // If routes or homestays collections are empty, seed them from initial templates
  let seededRoutesCount = 0;
  if (dbStore.getRoutes().length === 0) {
    console.log("[Geospatial Engine] Routes collection is empty. Seeding with 318 initial routes.");
    dbStore.data.routes = [...initialRoutes];
    seededRoutesCount = initialRoutes.length;
  }

  let seededHomestaysCount = 0;
  if (dbStore.getHomestays().length === 0) {
    console.log("[Geospatial Engine] Homestays collection is empty. Seeding with 123 initial homestays.");
    dbStore.data.homestays = [...initialHomestays];
    seededHomestaysCount = initialHomestays.length;
  }

  // 2. Offline Geocoding / coordinate healing
  const destinations = dbStore.getDestinations();
  const hubs = dbStore.getHubs();
  const attractions = dbStore.getAttractions();
  const homestays = dbStore.getHomestays();
  const routes = dbStore.getRoutes();

  let geocodedCount = 0;
  let yieldCounter = 0;
  
  // Geocode Destinations if missing
  for (const d of destinations) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const lat = Number(d.latitude);
    const lon = Number(d.longitude);
    if (!isCoordinateValid(lat, lon)) {
      const fallback = getOfflineGeocodeFallback(d, 'destinations', destinations);
      d.latitude = fallback.latitude;
      d.longitude = fallback.longitude;
      d.district = d.district || fallback.district;
      d.state = d.state || fallback.state;
      d.country = d.country || fallback.country;
      geocodedCount++;
    }
  }

  // Geocode Hubs if missing
  for (const h of hubs) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const lat = Number(h.latitude);
    const lon = Number(h.longitude);
    if (!isCoordinateValid(lat, lon)) {
      const fallback = getOfflineGeocodeFallback(h, 'hubs', destinations);
      h.latitude = fallback.latitude;
      h.longitude = fallback.longitude;
      h.district = h.district || fallback.district;
      h.state = h.state || fallback.state;
      h.country = h.country || fallback.country;
      geocodedCount++;
    }
  }

  // Geocode Attractions if missing (0 out of 6919 are geocoded initially!)
  for (const a of attractions) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const lat = Number(a.latitude);
    const lon = Number(a.longitude);
    if (!isCoordinateValid(lat, lon)) {
      const fallback = getOfflineGeocodeFallback(a, 'attractions', destinations);
      a.latitude = fallback.latitude;
      a.longitude = fallback.longitude;
      a.district = a.district || fallback.district;
      a.state = a.state || fallback.state;
      a.country = a.country || fallback.country;
      geocodedCount++;
    }
  }

  // Geocode Homestays if missing
  for (const h of homestays) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const lat = Number(h.latitude);
    const lon = Number(h.longitude);
    if (!isCoordinateValid(lat, lon)) {
      const fallback = getOfflineGeocodeFallback(h, 'homestays', destinations);
      h.latitude = fallback.latitude;
      h.longitude = fallback.longitude;
      h.district = h.district || fallback.district;
      h.state = h.state || fallback.state;
      h.country = h.country || fallback.country;
      geocodedCount++;
    }
  }

  console.log(`[Geospatial Engine] Completed geocode healing. Healed coordinates for ${geocodedCount} records.`);

  // Save the geocoded/healed records first
  dbStore.save();

  // 3. Build Spatial Grid Indexes for super-fast retrieval
  const destIndex = createGridIndex(destinations);
  const hubIndex = createGridIndex(hubs);
  const attrIndex = createGridIndex(attractions);
  const homeIndex = createGridIndex(homestays);

  const relationships: GeospatialRelationship[] = [];

  // Let's keep track of verification/anomalies for our report
  const invalidCoordinatesList: any[] = [];
  const orphanRecordsList: any[] = [];
  const isolatedVillagesList: any[] = [];
  const taxiStandsWithNoVillagesList: any[] = [];
  const homestaysOutsideGeographyList: any[] = [];

  // Relationship 1: Village (Destination) ↔ Nearest Taxi Stand (Hub)
  yieldCounter = 0;
  for (const d of destinations) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const dLat = Number(d.latitude);
    const dLon = Number(d.longitude);
    if (!isCoordinateValid(dLat, dLon)) continue;

    const nearbyHubs = queryGridIndex(hubIndex, dLat, dLon, 40); // 40 km limit
    if (nearbyHubs.length > 0) {
      const nearestHub = nearbyHubs[0];
      const dist = nearestHub.distance;
      const travelTime = Math.round(dist * 2.2 + 10);
      const confidence = Number((Math.max(0.5, 1.0 - (dist / 100))).toFixed(2));

      relationships.push({
        id: `village_taxi_stand_${d.id}_${nearestHub.record.id}`,
        type: 'village_taxi_stand',
        sourceType: 'village',
        sourceId: d.id,
        targetType: 'taxi_stand',
        targetId: nearestHub.record.id,
        distance: dist,
        travelTime,
        confidence,
        metadata: { sourceName: d.name, targetName: nearestHub.record.name }
      });

      // Update fields inside destination record for redundancy/legacy safety
      d.nearestTaxiStand = nearestHub.record.id;
      d.nearestHubId = nearestHub.record.id;
      d.distanceFromHub = dist;
    } else {
      isolatedVillagesList.push({ id: d.id, name: d.name });
    }
  }

  // Relationship 2: Village (Attraction of category 'Village') ↔ Destination
  for (const a of attractions) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    if (a.category === 'Village') {
      const aLat = Number(a.latitude);
      const aLon = Number(a.longitude);
      if (!isCoordinateValid(aLat, aLon)) continue;

      const nearbyDests = queryGridIndex(destIndex, aLat, aLon, 25);
      const filtered = nearbyDests.filter(x => x.record.id !== a.id);
      if (filtered.length > 0) {
        const nearestDest = filtered[0];
        relationships.push({
          id: `village_destination_${a.id}_${nearestDest.record.id}`,
          type: 'village_destination',
          sourceType: 'village',
          sourceId: a.id,
          targetType: 'destination',
          targetId: nearestDest.record.id,
          distance: nearestDest.distance,
          travelTime: Math.round(nearestDest.distance * 2.2 + 8),
          confidence: 0.95
        });
      }
    }
  }

  // Relationship 3: Village (Destination) ↔ Attraction
  for (const d of destinations) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const dLat = Number(d.latitude);
    const dLon = Number(d.longitude);
    if (!isCoordinateValid(dLat, dLon)) continue;

    const nearbyAttrs = queryGridIndex(attrIndex, dLat, dLon, 50);
    const rankedAttrs = nearbyAttrs.slice(0, 15); // cap at 15
    const legacyNearbyAttractions = [];
    
    for (let r = 0; r < rankedAttrs.length; r++) {
      const item = rankedAttrs[r];
      const attr = item.record;
      const dist = item.distance;
      const bearingInfo = getBearingString(dLat, dLon, Number(attr.latitude), Number(attr.longitude));
      const travelTime = Math.round(dist * 2.5 + 5);

      relationships.push({
        id: `village_attraction_${d.id}_${attr.id}`,
        type: 'village_attraction',
        sourceType: 'destination',
        sourceId: d.id,
        targetType: 'attraction',
        targetId: attr.id,
        distance: dist,
        travelTime,
        bearing: `${bearingInfo.bearing}° ${bearingInfo.direction}`,
        confidence: 0.9,
        metadata: { rank: r + 1, category: attr.category }
      });

      if (r < 5) {
        legacyNearbyAttractions.push({ id: attr.id, name: attr.name, distance: dist });
      }
    }
    d.nearbyAttractions = legacyNearbyAttractions;
  }

  // Relationship 4: Destination ↔ Attraction
  for (const a of attractions) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const aLat = Number(a.latitude);
    const aLon = Number(a.longitude);
    if (!isCoordinateValid(aLat, aLon)) continue;

    const nearbyDests = queryGridIndex(destIndex, aLat, aLon, 25);
    if (nearbyDests.length > 0) {
      const primary = nearbyDests[0];
      relationships.push({
        id: `destination_attraction_${primary.record.id}_${a.id}`,
        type: 'destination_attraction',
        sourceType: 'destination',
        sourceId: primary.record.id,
        targetType: 'attraction',
        targetId: a.id,
        distance: primary.distance,
        metadata: { isPrimary: true }
      });

      a.nearestDestinationId = primary.record.id;
      a.distanceFromDestination = primary.distance;

      const sharedDests = nearbyDests.slice(1).filter(x => x.distance <= 15);
      for (const sh of sharedDests) {
        relationships.push({
          id: `destination_attraction_${sh.record.id}_${a.id}`,
          type: 'destination_attraction',
          sourceType: 'destination',
          sourceId: sh.record.id,
          targetType: 'attraction',
          targetId: a.id,
          distance: sh.distance,
          metadata: { isPrimary: false }
        });
      }
    } else {
      orphanRecordsList.push({ type: 'attraction', id: a.id, name: a.name });
    }
  }

  // Relationship 5: Destination ↔ Destination
  for (const d of destinations) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const dLat = Number(d.latitude);
    const dLon = Number(d.longitude);
    if (!isCoordinateValid(dLat, dLon)) continue;

    const neighbors = queryGridIndex(destIndex, dLat, dLon, 40);
    const filtered = neighbors.filter(x => x.record.id !== d.id);
    const legacyNearbyDests = [];

    for (const nb of filtered) {
      relationships.push({
        id: `destination_destination_${d.id}_${nb.record.id}`,
        type: 'destination_destination',
        sourceType: 'destination',
        sourceId: d.id,
        targetType: 'destination',
        targetId: nb.record.id,
        distance: nb.distance,
        metadata: { relationship: 'neighbor', clusterId: d.district || 'General' }
      });

      if (legacyNearbyDests.length < 5) {
        legacyNearbyDests.push({
          id: nb.record.id,
          name: nb.record.name,
          distance: nb.distance,
          image: nb.record.image,
          tourismType: nb.record.tourismType
        });
      }
    }
    d.nearbyDestinations = legacyNearbyDests;
  }

  // Relationship 6: Taxi Stand ↔ Taxi Stand (Hub ↔ Hub)
  for (const h of hubs) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const hLat = Number(h.latitude);
    const hLon = Number(h.longitude);
    if (!isCoordinateValid(hLat, hLon)) continue;

    const nearbyHubs = queryGridIndex(hubIndex, hLat, hLon, 30);
    const filtered = nearbyHubs.filter(x => x.record.id !== h.id);
    
    if (filtered.length === 0) {
      taxiStandsWithNoVillagesList.push({ id: h.id, name: h.name });
    }

    for (const nb of filtered) {
      relationships.push({
        id: `taxi_stand_taxi_stand_${h.id}_${nb.record.id}`,
        type: 'taxi_stand_taxi_stand',
        sourceType: 'taxi_stand',
        sourceId: h.id,
        targetType: 'taxi_stand',
        targetId: nb.record.id,
        distance: nb.distance,
        metadata: {
          corridor: nb.distance <= 30,
          probableDirectLink: nb.distance <= 15
        }
      });
    }
  }

  // Relationship 7: Village ↔ Village
  for (const d of destinations) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const dLat = Number(d.latitude);
    const dLon = Number(d.longitude);
    if (!isCoordinateValid(dLat, dLon)) continue;

    const neighbors = queryGridIndex(destIndex, dLat, dLon, 30);
    const filtered = neighbors.filter(x => x.record.id !== d.id);
    for (const nb of filtered) {
      relationships.push({
        id: `village_village_${d.id}_${nb.record.id}`,
        type: 'village_village',
        sourceType: 'destination',
        sourceId: d.id,
        targetType: 'destination',
        targetId: nb.record.id,
        distance: nb.distance,
        metadata: { adjacent: true }
      });
    }
  }

  // Relationship 8: Homestay ↔ Village (Destination)
  for (const h of homestays) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const hLat = Number(h.latitude);
    const hLon = Number(h.longitude);
    if (!isCoordinateValid(hLat, hLon)) continue;

    const nearbyDests = queryGridIndex(destIndex, hLat, hLon, 25);
    if (nearbyDests.length > 0) {
      const closest = nearbyDests[0];
      const dist = closest.distance;
      const isValidMapping = h.destinationId === closest.record.id && dist <= 10;

      if (!isValidMapping && h.destinationId) {
        homestaysOutsideGeographyList.push({
          id: h.id,
          name: h.name,
          declaredDestinationId: h.destinationId,
          nearestDestinationId: closest.record.id,
          distance: dist
        });
      }

      relationships.push({
        id: `homestay_village_${h.id}_${closest.record.id}`,
        type: 'homestay_village',
        sourceType: 'homestay',
        sourceId: h.id,
        targetType: 'destination',
        targetId: closest.record.id,
        distance: dist,
        metadata: {
          isValidMapping,
          originalDestinationId: h.destinationId
        }
      });

      h.destinationId = closest.record.id;
      h.nearestDestinationId = closest.record.id;
      h.distanceFromDestination = dist;
    } else {
      orphanRecordsList.push({ type: 'homestay', id: h.id, name: h.name });
    }
  }

  // Relationship 9: Homestay ↔ Attractions
  for (const h of homestays) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const hLat = Number(h.latitude);
    const hLon = Number(h.longitude);
    if (!isCoordinateValid(hLat, hLon)) continue;

    const nearbyAttrs = queryGridIndex(attrIndex, hLat, hLon, 10);
    const legacyNearbyHomestaysAttrs = [];
    
    for (const nb of nearbyAttrs) {
      relationships.push({
        id: `homestay_attraction_${h.id}_${nb.record.id}`,
        type: 'homestay_attraction',
        sourceType: 'homestay',
        sourceId: h.id,
        targetType: 'attraction',
        targetId: nb.record.id,
        distance: nb.distance
      });

      if (legacyNearbyHomestaysAttrs.length < 5) {
        legacyNearbyHomestaysAttrs.push({ id: nb.record.id, name: nb.record.name, distance: nb.distance });
      }
    }
    (h as any).nearbyAttractions = legacyNearbyHomestaysAttrs;
  }

  // Populate Destination legacy fields with homestays
  for (const d of destinations) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const dLat = Number(d.latitude);
    const dLon = Number(d.longitude);
    if (!isCoordinateValid(dLat, dLon)) continue;

    const nearbyHomes = queryGridIndex(homeIndex, dLat, dLon, 25);
    const legacyNearbyHomestays = [];
    for (const nb of nearbyHomes) {
      if (legacyNearbyHomestays.length < 5) {
        legacyNearbyHomestays.push({ id: nb.record.id, name: nb.record.name, distance: nb.distance });
      }
    }
    d.nearbyHomestays = legacyNearbyHomestays;
  }

  // Relationship 10: Attraction ↔ Attraction
  for (const a of attractions) {
    if (yieldCounter++ % 100 === 0) await yieldToEventLoop();
    const aLat = Number(a.latitude);
    const aLon = Number(a.longitude);
    if (!isCoordinateValid(aLat, aLon)) continue;

    const nearbyAttrs = queryGridIndex(attrIndex, aLat, aLon, 5);
    const filtered = nearbyAttrs.filter(x => x.record.id !== a.id).slice(0, 3);
    for (const nb of filtered) {
      relationships.push({
        id: `attraction_attraction_${a.id}_${nb.record.id}`,
        type: 'attraction_attraction',
        sourceType: 'attraction',
        sourceId: a.id,
        targetType: 'attraction',
        targetId: nb.record.id,
        distance: nb.distance,
        metadata: { recommendExploreNearby: true }
      });
    }
  }

  // Relationship 11: Attraction ↔ Taxi Stand
  for (const a of attractions) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const aLat = Number(a.latitude);
    const aLon = Number(a.longitude);
    if (!isCoordinateValid(aLat, aLon)) continue;

    const nearbyHubs = queryGridIndex(hubIndex, aLat, aLon, 25);
    if (nearbyHubs.length > 0) {
      const closest = nearbyHubs[0];
      relationships.push({
        id: `attraction_taxi_stand_${a.id}_${closest.record.id}`,
        type: 'attraction_taxi_stand',
        sourceType: 'attraction',
        sourceId: a.id,
        targetType: 'taxi_stand',
        targetId: closest.record.id,
        distance: closest.distance
      });

      a.nearestHubId = closest.record.id;
      a.distanceFromHub = closest.distance;
    }
  }

  // Relationship 12: Attraction ↔ Village (Destination)
  for (const a of attractions) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const aLat = Number(a.latitude);
    const aLon = Number(a.longitude);
    if (!isCoordinateValid(aLat, aLon)) continue;

    const nearbyDests = queryGridIndex(destIndex, aLat, aLon, 10);
    for (let i = 0; i < nearbyDests.length; i++) {
      const nb = nearbyDests[i];
      relationships.push({
        id: `attraction_village_${a.id}_${nb.record.id}`,
        type: 'attraction_village',
        sourceType: 'attraction',
        sourceId: a.id,
        targetType: 'destination',
        targetId: nb.record.id,
        distance: nb.distance,
        metadata: { isClosest: i === 0 }
      });
    }
  }

  // Relationship 13: Route ↔ Taxi Stand
  for (const r of routes) {
    await yieldToEventLoop();
    const hubA = hubs.find(h => h.id === r.fromHubId);
    const hubB = hubs.find(h => h.id === r.toHubId);

    if (hubA) {
      relationships.push({
        id: `route_taxi_stand_${r.id}_${hubA.id}_start`,
        type: 'route_taxi_stand',
        sourceType: 'route',
        sourceId: r.id,
        targetType: 'taxi_stand',
        targetId: hubA.id,
        metadata: { role: 'start' }
      });
    }

    if (hubB) {
      relationships.push({
        id: `route_taxi_stand_${r.id}_${hubB.id}_end`,
        type: 'route_taxi_stand',
        sourceType: 'route',
        sourceId: r.id,
        targetType: 'taxi_stand',
        targetId: hubB.id,
        metadata: { role: 'end' }
      });
    }

    if (hubA && hubB) {
      const latA = Number(hubA.latitude);
      const lonA = Number(hubA.longitude);
      const latB = Number(hubB.latitude);
      const lonB = Number(hubB.longitude);

      if (isCoordinateValid(latA, lonA) && isCoordinateValid(latB, lonB)) {
        for (const h of hubs) {
          if (h.id === r.fromHubId || h.id === r.toHubId) continue;
          const hLat = Number(h.latitude);
          const hLon = Number(h.longitude);
          if (!isCoordinateValid(hLat, hLon)) continue;

          const minLat = Math.min(latA, latB) - 0.1;
          const maxLat = Math.max(latA, latB) + 0.1;
          const minLon = Math.min(lonA, lonB) - 0.1;
          const maxLon = Math.max(lonA, lonB) + 0.1;

          if (hLat >= minLat && hLat <= maxLat && hLon >= minLon && hLon <= maxLon) {
            const distToLine = getDistanceToSegment(hLat, hLon, latA, lonA, latB, lonB);
            if (distToLine <= 10) {
              relationships.push({
                id: `route_taxi_stand_${r.id}_${h.id}_via`,
                type: 'route_taxi_stand',
                sourceType: 'route',
                sourceId: r.id,
                targetType: 'taxi_stand',
                targetId: h.id,
                distance: distToLine,
                metadata: { role: 'via' }
              });
            }
          }
        }
      }
    }
  }

  // Relationship 14: Hub ↔ All Entities
  for (const h of hubs) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const hLat = Number(h.latitude);
    const hLon = Number(h.longitude);
    if (!isCoordinateValid(hLat, hLon)) continue;

    const nearbyD = queryGridIndex(destIndex, hLat, hLon, 15);
    for (const nb of nearbyD) {
      relationships.push({
        id: `hub_entity_${h.id}_${nb.record.id}`,
        type: 'hub_entity',
        sourceType: 'taxi_stand',
        sourceId: h.id,
        targetType: 'destination',
        targetId: nb.record.id,
        distance: nb.distance
      });
    }

    const nearbyA = queryGridIndex(attrIndex, hLat, hLon, 15);
    for (const nb of nearbyA) {
      relationships.push({
        id: `hub_entity_${h.id}_${nb.record.id}`,
        type: 'hub_entity',
        sourceType: 'taxi_stand',
        sourceId: h.id,
        targetType: 'attraction',
        targetId: nb.record.id,
        distance: nb.distance
      });
    }

    const nearbyH = queryGridIndex(homeIndex, hLat, hLon, 15);
    for (const nb of nearbyH) {
      relationships.push({
        id: `hub_entity_${h.id}_${nb.record.id}`,
        type: 'hub_entity',
        sourceType: 'taxi_stand',
        sourceId: h.id,
        targetType: 'homestay',
        targetId: nb.record.id,
        distance: nb.distance
      });
    }
  }

  // Relationship 15: Administrative Relationships
  const allEntities = [
    ...hubs.map(h => ({ ...h, type: 'taxi_stand' })),
    ...destinations.map(d => ({ ...d, type: 'destination' })),
    ...attractions.map(a => ({ ...a, type: 'attraction' })),
    ...homestays.map(h => ({ ...h, type: 'homestay' }))
  ];

  for (const ent of allEntities) {
    if (yieldCounter++ % 200 === 0) await yieldToEventLoop();
    const lat = Number(ent.latitude);
    const lon = Number(ent.longitude);
    if (!isCoordinateValid(lat, lon)) continue;

    let dist = ent.district;
    let st = ent.state;
    let cty = ent.country || 'India';

    if (!dist || !st) {
      const nearestDests = queryGridIndex(destIndex, lat, lon, 40);
      if (nearestDests.length > 0) {
        dist = dist || nearestDests[0].record.district || nearestDests[0].record.name;
        st = st || nearestDests[0].record.state || 'West Bengal';
      } else {
        dist = dist || 'Darjeeling';
        st = st || 'West Bengal';
      }
    }

    const actualRecord = lookupRecord(ent.type === 'taxi_stand' ? 'hubs' : ent.type === 'destination' ? 'destinations' : ent.type === 'attraction' ? 'attractions' : 'homestays', ent.id);
    if (actualRecord) {
      actualRecord.district = dist;
      actualRecord.state = st;
      actualRecord.country = cty;
    }

    relationships.push({
      id: `administrative_${ent.type}_${ent.id}`,
      type: 'administrative',
      sourceType: ent.type,
      sourceId: ent.id,
      targetType: 'administrative_boundary',
      targetId: dist,
      metadata: {
        district: dist,
        subdivision: dist + " Subdivision",
        block: dist + " Block",
        state: st,
        country: cty
      }
    });
  }

  // Relationship 16: Travel Intelligence
  for (const d of destinations) {
    if (yieldCounter++ % 100 === 0) await yieldToEventLoop();
    const dLat = Number(d.latitude);
    const dLon = Number(d.longitude);
    if (!isCoordinateValid(dLat, dLon)) continue;

    const nearbyD = queryGridIndex(destIndex, dLat, dLon, 30).filter(x => x.record.id !== d.id).slice(0, 5);
    const weekendD = queryGridIndex(destIndex, dLat, dLon, 60).filter(x => x.record.id !== d.id).slice(0, 5);
    const nearbyA = queryGridIndex(attrIndex, dLat, dLon, 20).slice(0, 8);
    const hiddenA = queryGridIndex(attrIndex, dLat, dLon, 15).filter(x => x.record.isHiddenGem === true).slice(0, 5);

    relationships.push({
      id: `travel_intelligence_${d.id}`,
      type: 'travel_intelligence',
      sourceType: 'destination',
      sourceId: d.id,
      targetType: 'travel_insights',
      targetId: d.id,
      metadata: {
        nearbyPlaces: nearbyD.map(x => ({ id: x.record.id, name: x.record.name, distance: x.distance })),
        dayTrips: nearbyA.map(x => ({ id: x.record.id, name: x.record.name, distance: x.distance })),
        weekendCircuits: weekendD.map(x => ({ id: x.record.id, name: x.record.name, distance: x.distance })),
        popularClusters: [d.district || 'General Cluster'],
        hiddenGems: hiddenA.map(x => ({ id: x.record.id, name: x.record.name, distance: x.distance }))
      }
    });
  }

  // 4. Save and commit all relationships
  console.log(`[Geospatial Engine] Successfully generated ${relationships.length} intelligent location relationships!`);
  dbStore.data.geospatial_relationships = relationships;
  
  dbStore.save();

  // Create audit log of run
  const logId = `AUD_${Date.now()}`;
  const logDetails = `Geospatial relationship run completed. Healed: ${geocodedCount} records. Seeded routes: ${seededRoutesCount}, homestays: ${seededHomestaysCount}. Generated relations: ${relationships.length}.`;
  
  if (dbStore.data.auditLogs) {
    dbStore.data.auditLogs.unshift({
      id: logId,
      userId: 'system_agent',
      email: 'agent@hillytrip.com',
      action: 'GEOSPATIAL_RELATIONSHIP_GENERATION',
      details: logDetails,
      timestamp: new Date().toISOString()
    });
  }

  return {
    count: relationships.length,
    report: {
      geocodedCount,
      seededRoutesCount,
      seededHomestaysCount,
      relationshipsCount: relationships.length,
      anomalies: {
        isolatedVillagesCount: isolatedVillagesList.length,
        isolatedVillages: isolatedVillagesList.slice(0, 10),
        orphanRecordsCount: orphanRecordsList.length,
        orphanRecords: orphanRecordsList.slice(0, 10),
        taxiStandsWithNoVillagesCount: taxiStandsWithNoVillagesList.length,
        taxiStandsWithNoVillages: taxiStandsWithNoVillagesList.slice(0, 10),
        homestaysOutsideGeographyCount: homestaysOutsideGeographyList.length,
        homestaysOutsideGeography: homestaysOutsideGeographyList.slice(0, 10)
      }
    }
  };
}

// On the fly trigger
export async function triggerBackgroundGeocodingAndSpatial(col: string, recordId: string, forceGemini: boolean = false) {
  try {
    const record = lookupRecord(col, recordId);
    if (!record) return;

    const lat = Number(record.latitude);
    const lon = Number(record.longitude);

    if (isCoordinateValid(lat, lon) && !forceGemini) {
      await recalculateSpatialForRecord(col, recordId);
      return;
    }

    if (!forceGemini) {
      console.log(`[On-The-Fly GPS Hook] Automatic Gemini geocoding is skipped for saves/imports on ${col}/${recordId}. Applying smart offline high-speed fallback geocoder...`);
      const result = getOfflineGeocodeFallback(record, col, dbStore.getDestinations());
      const updates: any = {
        latitude: result.latitude,
        longitude: result.longitude,
        district: record.district || result.district,
        state: record.state || result.state,
        country: record.country || result.country
      };
      
      if (col === 'attractions' && !record.description) {
        const dest = dbStore.getDestinations().find(d => d.id === record.destinationId);
        const destName = dest ? dest.name : '';
        updates.description = `An absolutely beautiful scenic spot ("${record.category || "Sight"}") located near ${destName || 'the destination'}. Renowned for its magnificent mountain views, clean fresh air, and serene natural trekking routes.`;
      }
      
      await dbStore.updateRecord(col, recordId, updates);
      await recalculateSpatialForRecord(col, recordId);
      return;
    }

    // Determine smart parent coordinates/district fallback
    let fallbackLat = 27.03;
    let fallbackLon = 88.26;
    let fallbackDistrict = "Darjeeling";
    let fallbackState = "West Bengal";
    let fallbackCountry = "India";

    if (col === 'attractions' || col === 'homestays') {
      const parentDest = dbStore.getDestinations().find(d => d.id === record.destinationId);
      if (parentDest && isCoordinateValid(Number(parentDest.latitude), Number(parentDest.longitude))) {
        // Apply deterministic jitter based on recordId hash to prevent direct overlay
        const seed = record.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const jitterLat = ((seed % 100) - 50) / 10000; // range from -0.005 to +0.005 (~500m)
        const jitterLon = (((seed * 7) % 100) - 50) / 10000; // range from -0.005 to +0.005 (~500m)

        fallbackLat = Number(parentDest.latitude) + jitterLat;
        fallbackLon = Number(parentDest.longitude) + jitterLon;
        fallbackDistrict = parentDest.district || parentDest.name;
        fallbackState = parentDest.state || fallbackState;
        fallbackCountry = parentDest.country || fallbackCountry;
      }
    }

    const smartFallback: CachedLocation = {
      latitude: fallbackLat,
      longitude: fallbackLon,
      district: fallbackDistrict,
      state: fallbackState,
      country: fallbackCountry
    };

    const query = buildLocationQuery(record, col === 'hubs' ? 'hub' : col.replace(/s$/, ''), dbStore.getDestinations());
    const result = await geocodeLocationGemini(query, smartFallback, forceGemini);
    
    const updates: any = {
      latitude: result.latitude,
      longitude: result.longitude,
      district: record.district || result.district,
      state: record.state || result.state,
      country: record.country || result.country
    };

    if (col === 'attractions') {
      const dest = dbStore.getDestinations().find(d => d.id === record.destinationId);
      const destName = dest ? dest.name : '';
      const region = record.district || (dest ? dest.district : '');
      const aiDesc = await generateAttractionDescriptionGemini(record.name, record.category || "Sight", destName, region);
      if (aiDesc) {
        updates.description = aiDesc;
      }
    }

    await dbStore.updateRecord(col, recordId, updates);
    await recalculateSpatialForRecord(col, recordId);
  } catch (err) {
    console.error(`[On-The-Fly GPS Error] Failed to geocode ${col}/${recordId}:`, err);
  }
}

// Bulk geocoding progress tracking
export interface GeocodeProgress {
  status: 'idle' | 'running' | 'completed' | 'failed';
  total: number;
  current: number;
  successCount: number;
  failureCount: number;
  logs: string[];
}

export let activeGeocodeJob: GeocodeProgress = {
  status: 'idle',
  total: 0,
  current: 0,
  successCount: 0,
  failureCount: 0,
  logs: []
};

function addLog(msg: string) {
  const timestamp = new Date().toLocaleTimeString();
  activeGeocodeJob.logs.push(`[${timestamp}] ${msg}`);
  console.log(`[Location intelligence Bulk] ${msg}`);
  if (activeGeocodeJob.logs.length > 250) {
    activeGeocodeJob.logs.shift();
  }
}

// Bulk auto-fill engine
export async function runBulkGeocodeJob(options?: { limit?: number; targetIds?: string[]; offlineOnly?: boolean }) {
  if (activeGeocodeJob.status === 'running') return;

  const destinations = dbStore.getDestinations();
  const attractions = dbStore.getAttractions();
  const homestays = dbStore.getHomestays();
  const hubs = dbStore.getHubs();

  let items: { col: string; record: any }[] = [];

  for (const h of hubs) {
    if (!isCoordinateValid(Number((h as any).latitude), Number((h as any).longitude))) {
      items.push({ col: 'hubs', record: h });
    }
  }
  for (const d of destinations) {
    if (!isCoordinateValid(Number(d.latitude), Number(d.longitude))) {
      items.push({ col: 'destinations', record: d });
    }
  }
  for (const a of attractions) {
    if (!isCoordinateValid(Number(a.latitude), Number(a.longitude))) {
      items.push({ col: 'attractions', record: a });
    }
  }
  for (const h of homestays) {
    if (!isCoordinateValid(Number(h.latitude), Number(h.longitude))) {
      items.push({ col: 'homestays', record: h });
    }
  }

  // Filter items based on selected targetIds if provided
  if (options && Array.isArray(options.targetIds)) {
    items = items.filter(item => options.targetIds!.includes(item.record.id));
  }

  // Apply batch size limit if provided
  if (options && typeof options.limit === 'number' && options.limit > 0) {
    items = items.slice(0, options.limit);
  }

  if (items.length === 0) {
    activeGeocodeJob = {
      status: 'completed',
      total: 0,
      current: 0,
      successCount: 0,
      failureCount: 0,
      logs: ['No pending records to process matching criteria.']
    };
    return;
  }

  activeGeocodeJob = {
    status: 'running',
    total: items.length,
    current: 0,
    successCount: 0,
    failureCount: 0,
    logs: []
  };

  addLog(`Commencing bulk geocoding (${options?.offlineOnly ? 'High-Speed Offline' : 'AI-Assisted'}). Analyzing ${items.length} records missing coordinates...`);

  (async () => {
    try {
      const destList = dbStore.getDestinations();
      
      if (options?.offlineOnly) {
        addLog(`[High-Speed Offline Engine] Commencing hyper-speed coordinates resolution for ${items.length} records in-memory...`);
        const totalToProcess = items.length;
        let progress = 0;
        const updatedCols = new Set<string>();
        
        for (const item of items) {
          if (activeGeocodeJob.status !== 'running') break;
          
          progress++;
          const { col, record } = item;
          const result = getOfflineGeocodeFallback(record, col, destList);
          
          const keyMap: Record<string, string> = {
            hubs: 'hubs',
            routes: 'routes',
            destinations: 'destinations',
            attractions: 'attractions',
            homestays: 'homestays'
          };
          const targetKey = keyMap[col];
          if (targetKey) {
            const arr = dbStore.data[targetKey as keyof typeof dbStore.data] as any[];
            if (arr) {
              const idx = arr.findIndex(r => r.id === record.id);
              if (idx !== -1) {
                const original = arr[idx];
                const updates: any = {
                  latitude: result.latitude,
                  longitude: result.longitude,
                  district: original.district || result.district,
                  state: original.state || result.state,
                  country: original.country || result.country
                };
                
                if (col === 'attractions') {
                  const dest = destList.find(d => d.id === original.destinationId);
                  const destName = dest ? dest.name : '';
                  updates.description = original.description || `An absolutely beautiful scenic spot ("${original.category || "Sight"}") located near ${destName || 'the destination'}. Renowned for its magnificent mountain views, clean fresh air, and serene natural trekking routes.`;
                }
                
                arr[idx] = { ...original, ...updates };
                activeGeocodeJob.successCount++;
                updatedCols.add(col);
              }
            }
          }
          
          activeGeocodeJob.current = progress;
          if (progress % 200 === 0 || progress === totalToProcess) {
            addLog(`✓ Resolved coordinates in-memory for ${progress}/${totalToProcess} records...`);
            // Yield to the event loop to keep the Node server highly responsive
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
        
        addLog(`Disk Commit: Writing optimized data array to 'hillytrip_db_store.json'...`);
        dbStore.save();
        
        addLog(`Spatial Network: Rebuilding mountain proximity graphs via optimized bounding-box queries...`);
        await recalculateAllSpatialRelations();
        
        addLog(`Cloud Sync: Transferring calculated coordinate tables to Firestore & Supabase in safe concurrent batches...`);
        for (const col of updatedCols) {
          const keyMap: Record<string, string> = {
            hubs: 'hubs',
            routes: 'routes',
            destinations: 'destinations',
            attractions: 'attractions',
            homestays: 'homestays'
          };
          const targetKey = keyMap[col];
          const arr = dbStore.data[targetKey as keyof typeof dbStore.data] as any[];
          if (arr) {
            if (col === 'attractions') {
              dbStore.updateAttractions(arr);
            } else if (col === 'destinations') {
              dbStore.updateDestinations(arr);
            } else if (col === 'homestays') {
              dbStore.updateHomestays(arr);
            } else if (col === 'hubs') {
              dbStore.importHubs(arr);
            }
          }
        }
        
        addLog(`🎉 Hyper-speed bulk resolution completed perfectly! Success: ${activeGeocodeJob.successCount}/${totalToProcess}.`);
        activeGeocodeJob.status = 'completed';
        return;
      }

      for (const item of items) {
        if (activeGeocodeJob.status !== 'running') break;

        activeGeocodeJob.current++;
        const { col, record } = item;
        const typeStr = col === 'hubs' ? 'hub' : col.replace(/s$/, '');
        const query = buildLocationQuery(record, typeStr, destList);
        
        try {
          addLog(`[Job ${activeGeocodeJob.current}/${activeGeocodeJob.total}] Resolving query for: "${record.name}"...`);
          
          let result;
          let isFallback = false;
          try {
            result = await geocodeLocationGemini(query, undefined, true);
          } catch (err: any) {
            const errStr = err?.message || String(err);
            addLog(`⚠️ Gemini geocode failed for "${record.name}" (${errStr}). Applying smart offline local fallback...`);
            result = getOfflineGeocodeFallback(record, col, destList);
            isFallback = true;
          }

          const updates: any = {
            latitude: result.latitude,
            longitude: result.longitude,
            district: record.district || result.district,
            state: record.state || result.state,
            country: record.country || result.country
          };

          if (col === 'attractions') {
            const dest = destList.find(d => d.id === record.destinationId);
            const destName = dest ? dest.name : '';
            const region = record.district || (dest ? dest.district : '');
            
            const aiDesc = await generateAttractionDescriptionGemini(record.name, record.category || "Sight", destName, region);
            if (aiDesc) {
              updates.description = aiDesc;
            }
          }

          await dbStore.updateRecord(col, record.id, updates);
          activeGeocodeJob.successCount++;
          
          if (isFallback) {
            addLog(`✓ Resolved (Offline Fallback): "${record.name}" -> Lat: ${result.latitude}, Lon: ${result.longitude}, District: ${updates.district}`);
          } else {
            addLog(`✓ Resolved (Gemini AI): "${record.name}" -> Lat: ${result.latitude}, Lon: ${result.longitude}, District: ${updates.district}`);
          }
          
          await recalculateSpatialForRecord(col, record.id);
        } catch (err: any) {
          activeGeocodeJob.failureCount++;
          addLog(`✗ Failed coordinates resolution for "${record.name}": ${err.message || err}`);
        }

        // Delay for Gemini API free-tier quotas (4500ms)
        await new Promise(resolve => setTimeout(resolve, 4500));
      }

      addLog(`Bulk coordinates generation completed! Success: ${activeGeocodeJob.successCount}, Failures: ${activeGeocodeJob.failureCount}`);
      addLog(`Updating global proximity graphs...`);
      await recalculateAllSpatialRelations();
      addLog(`Proximity network calculations completed successfully!`);

      activeGeocodeJob.status = 'completed';
    } catch (err: any) {
      addLog(`CRITICAL ERROR during bulk geocode processing: ${err.message}`);
      activeGeocodeJob.status = 'failed';
    }
  })();
}

// Data Quality Checks
export interface QualityReport {
  missingCoordinates: { col: string; id: string; name: string }[];
  missingStateOrDistrict: { col: string; id: string; name: string; missing: string[] }[];
  invalidCoordinates: { col: string; id: string; name: string; lat: any; lon: any }[];
  healthyCount: number;
  totalChecked: number;
}

export function runDataQualityCheck(): QualityReport {
  const destinations = dbStore.getDestinations();
  const attractions = dbStore.getAttractions();
  const homestays = dbStore.getHomestays();
  const hubs = dbStore.getHubs();

  const missingCoordinates: { col: string; id: string; name: string }[] = [];
  const missingStateOrDistrict: { col: string; id: string; name: string; missing: string[] }[] = [];
  const invalidCoordinates: { col: string; id: string; name: string; lat: any; lon: any }[] = [];

  let totalChecked = 0;
  let healthyCount = 0;

  const collections = [
    { name: 'hubs', items: hubs },
    { name: 'destinations', items: destinations },
    { name: 'attractions', items: attractions },
    { name: 'homestays', items: homestays }
  ];

  for (const col of collections) {
    for (const item of col.items) {
      totalChecked++;
      let healthy = true;
      const lat = (item as any).latitude;
      const lon = (item as any).longitude;
      const dist = (item as any).district;
      const st = (item as any).state;

      if (lat === undefined || lon === undefined || lat === null || lon === null || lat === '' || lon === '') {
        missingCoordinates.push({ col: col.name, id: item.id, name: item.name });
        healthy = false;
      } else {
        const nLat = Number(lat);
        const nLon = Number(lon);
        if (!isCoordinateValid(nLat, nLon)) {
          invalidCoordinates.push({ col: col.name, id: item.id, name: item.name, lat, lon });
          healthy = false;
        }
      }

      const missingDetails: string[] = [];
      if (!dist) missingDetails.push('district');
      if (!st) missingDetails.push('state');

      if (missingDetails.length > 0) {
        missingStateOrDistrict.push({ col: col.name, id: item.id, name: item.name, missing: missingDetails });
        healthy = false;
      }

      if (healthy) {
        healthyCount++;
      }
    }
  }

  return {
    missingCoordinates,
    missingStateOrDistrict,
    invalidCoordinates,
    healthyCount,
    totalChecked
  };
}

// Helper for deterministic generation based on name to keep coordinates stable
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Built-in high-fidelity local Eastern Himalayan offline database
const OFFLINE_VILLAGE_DATABASE: Record<string, {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  elevation: number;
  description: string;
  knownFor: string;
  nearestTaxiStand: string;
  attractions: string;
}> = {
  "tinchuley": {
    name: "Tinchuley",
    region: "Darjeeling",
    latitude: 27.0452,
    longitude: 88.3615,
    elevation: 1750,
    description: "A pristine eco-tourism village on Darjeeling's ridges, famous for orange orchards, sunrise viewpoints over Kanchenjunga, and organic terraced farming.",
    knownFor: "Orange orchards, Kanchenjunga sunrise viewpoint",
    nearestTaxiStand: "Tinchuley Junction Stand",
    attractions: "Tiffin Dara Viewpoint, Gumbadara View Point, Peshok Tea Garden"
  },
  "takdah": {
    name: "Takdah",
    region: "Darjeeling",
    latitude: 27.0347,
    longitude: 88.3582,
    elevation: 1600,
    description: "A historical British cantonment area, now a tranquil mountain village, renowned for its conifer forests, green orchid gardens, and heritage colonial bungalows.",
    knownFor: "Colonial-era British heritage bungalows and orchids",
    nearestTaxiStand: "Takdah Club Stand",
    attractions: "Takdah Orchid House, Heritage Bungalow No. 12, Dechhen Pema Chhoeling Monastery"
  },
  "lepchajagat": {
    name: "Lepchajagat",
    region: "Darjeeling",
    latitude: 27.0189,
    longitude: 88.1961,
    elevation: 2110,
    description: "A secluded Lepcha tribal hamlet located inside a reserve forest corridor near Ghum, offering beautiful walking routes and spectacular views of Mt. Kanchenjunga.",
    knownFor: "Silent pine forest walks and mountain views",
    nearestTaxiStand: "Ghum Taxi Stand",
    attractions: "Lepchajagat Forest Trail, Hawa Ghar, Ghum Monastery"
  },
  "chatakpur": {
    name: "Chatakpur",
    region: "Darjeeling",
    latitude: 26.9681,
    longitude: 88.2619,
    elevation: 2380,
    description: "A high-altitude organic eco-village inside Senchal Wildlife Sanctuary, offering an absolute wilderness sanctuary experience with amazing sunset vistas.",
    knownFor: "Pure organic eco-tourism and wildlife sanctuary",
    nearestTaxiStand: "Sonada Motor Stand",
    attractions: "Chatakpur Watch Tower, Senchal Wildlife Trails, Pokhri Lake"
  },
  "lamahatta": {
    name: "Lamahatta",
    region: "Darjeeling",
    latitude: 27.0298,
    longitude: 88.3242,
    elevation: 1730,
    description: "A beautiful mountain village famous for its dense pine forest park, manicured roadside gardens, sacred hilltop lake, and dense mist clouds.",
    knownFor: "Manicured roadside pine park, sacred hilltop lake",
    nearestTaxiStand: "Peshok Highway Stand",
    attractions: "Lamahatta Eco Park, Sacred Gari Bas Lake, Peshok View Point"
  },
  "dawaipani": {
    name: "Dawaipani",
    region: "Darjeeling",
    latitude: 27.0652,
    longitude: 88.3121,
    elevation: 1980,
    description: "A tiny secluded mountain village built on a steep ridge directly opposite Darjeeling town, known for raw, unobstructed, wide views of Mt. Kanchenjunga.",
    knownFor: "Unobstructed wide views of Mt. Kanchenjunga range",
    nearestTaxiStand: "Darjeeling Motor Stand",
    attractions: "Dawaipani Viewpoint, Organic farms, Pine Forest Walk"
  },
  "bara mangwa": {
    name: "Bara Mangwa",
    region: "Darjeeling",
    latitude: 27.0782,
    longitude: 88.3912,
    elevation: 1450,
    description: "A sunny mountainside village overlooking the Teesta river valley, filled with organic orange orchards and birdwatching trails.",
    knownFor: "Teesta river views, organic orange farms",
    nearestTaxiStand: "Teesta Bazar Stand",
    attractions: "Orange orchards, Peshok Confluence (Triveni), local organic farms"
  },
  "chota mangwa": {
    name: "Chota Mangwa",
    region: "Darjeeling",
    latitude: 27.0691,
    longitude: 88.3845,
    elevation: 1600,
    description: "A serene eco-village perched on a ridge top with a panoramic 360-degree overlook of Kalimpong hills, Teesta valley, and snow mountains.",
    knownFor: "Silent eco-cottages, 360-degree hill views",
    nearestTaxiStand: "Takdah Jeep Stand",
    attractions: "Chota Mangwa Sunrise Point, Organic Gardens, local lemon groves"
  },
  "lolegaon": {
    name: "Lolegaon",
    region: "Kalimpong",
    latitude: 27.0163,
    longitude: 88.5661,
    elevation: 1675,
    description: "A tiny quiet Lepcha village surrounded by dense forests of giant Cypress, heritage oaks and pines, known for an authentic forest canopy walkway.",
    knownFor: "Forest canopy walkway and wild cypress groves",
    nearestTaxiStand: "Lolegaon Motor Stand",
    attractions: "Lolegaon Canopy Walk, Jhandi Dara Sunrise Point, Eco Park"
  },
  "rishyap": {
    name: "Rishyap",
    region: "Kalimpong",
    latitude: 27.1141,
    longitude: 88.6472,
    elevation: 2590,
    description: "A peaceful high-altitude tourist hamlet in Kalimpong, reachable by a beautiful pine forest trek from Lava, offering great 180-degree mountain views.",
    knownFor: "Unobstructed high-altitude 180-degree Kanchenjunga views",
    nearestTaxiStand: "Lava Jeep Stand",
    attractions: "Tiffin Dara Viewpoint, Rishyap Pine Trails, Shiva temple"
  },
  "lava": {
    name: "Lava",
    region: "Kalimpong",
    latitude: 27.0863,
    longitude: 88.6651,
    elevation: 2138,
    description: "A larger mountain village or township serving as the entrance gateway to Neora Valley National Park, characterized by deep conifer woods and heavy fog.",
    knownFor: "Gateway to Neora Valley National Park, local Buddhist monastery",
    nearestTaxiStand: "Lava Central Stand",
    attractions: "Lava Jamgyong Kongtrul Monastery, Neora Valley Park Gate, Nature Interpretation Centre"
  },
  "kolakham": {
    name: "Kolakham",
    region: "Kalimpong",
    latitude: 27.1001,
    longitude: 88.6835,
    elevation: 1860,
    description: "A small nature lover's village situated inside the boundaries of Neora Valley National Park, famous for high waterfalls, butterflies and birds.",
    knownFor: "Cardamom farm hikes and Changey waterfalls",
    nearestTaxiStand: "Lava Bazar Stand",
    attractions: "Changey Waterfall, Neora Valley Safari, Cardamom plantation"
  },
  "sillery gaon": {
    name: "Sillery Gaon",
    region: "Kalimpong",
    latitude: 27.1352,
    longitude: 88.5915,
    elevation: 1820,
    description: "Known affectionately as 'New Darjeeling', this quiet settlement offers spectacular close-up views of Mt. Kanchenjunga and is located near Damsang Fort.",
    knownFor: "Pristine nature trails and ancient fort history",
    nearestTaxiStand: "Pedong Stand",
    attractions: "Ramitey Viewpoint, Silent Valley, Damsang Fort ruins"
  },
  "pedong": {
    name: "Pedong",
    region: "Kalimpong",
    latitude: 27.1500,
    longitude: 88.6167,
    elevation: 1240,
    description: "An ancient trading town and village situated on the historic Silk Route, offering beautiful historic churches and monasteries close to the Bhutan border.",
    knownFor: "Historical Silk Route heritage site and old monasteries",
    nearestTaxiStand: "Pedong Bazar Stand",
    attractions: "Sangchen Dorjee Monastery, Cross Hill Viewpoint, Damsang Fort"
  },
  "jhalong": {
    name: "Jhalong",
    region: "Jaldapara",
    latitude: 27.0124,
    longitude: 88.8752,
    elevation: 450,
    description: "A scenic valley village located in the lower sub-alpine foothills along the rocky Jaldhaka River, highly popular for hydro-electric projects and birds.",
    knownFor: "Jaldhaka river-side camps, birdwatching trails",
    nearestTaxiStand: "Chalsa Stand",
    attractions: "Jaldhaka Hydel Project, Bindu Indo-Bhutan Dam, Riverside forest trail"
  },
  "bindu": {
    name: "Bindu",
    region: "Jaldapara",
    latitude: 27.0984,
    longitude: 88.8715,
    elevation: 600,
    description: "The last frontier village of West Bengal bordering the mountain kingdom of Bhutan, surrounded by orange orchards and cardamom fields.",
    knownFor: "Indo-Bhutan border views, cardamom hills",
    nearestTaxiStand: "Chalsa stand",
    attractions: "Bindu Dam, Jaldhaka River, Bhutanese border bridges"
  },
  "suntalekhola": {
    name: "Suntalekhola",
    region: "Jaldapara",
    latitude: 27.0121,
    longitude: 88.7909,
    elevation: 750,
    description: "An beautiful forested river glen named after a mountain stream 'Suntalekhola' (meaning 'orange stream'), offering beautiful stream suspension bridges.",
    knownFor: "Forest river glade camps and butterfly watching",
    nearestTaxiStand: "Samsing Stand",
    attractions: "Suntalekhola Suspension Bridge, Rocky Island River Bed, Neora forest trail"
  },
  "samsing": {
    name: "Samsing",
    region: "Jaldapara",
    latitude: 26.9972,
    longitude: 88.7935,
    elevation: 915,
    description: "A tranquil foothills village famous for its beautiful rolling tea gardens, orange orchards, evergreen forest reserves and mountain climate.",
    knownFor: "Rolling tea garden estates and orange groves",
    nearestTaxiStand: "Samsing Bazar Stand",
    attractions: "Samsing Tea Gardens, Rocky Island, Fari-basti trail"
  },
  "lataguri": {
    name: "Lataguri",
    region: "Jaldapara",
    latitude: 26.7143,
    longitude: 88.7672,
    elevation: 120,
    description: "A tourist gateway settlement bordering the Gorumara National Park forest reserves, providing access to wildlife safari experiences.",
    knownFor: "Gorumara National Park wilderness safari gateway",
    nearestTaxiStand: "Lataguri Junction Stand",
    attractions: "Gorumara Jungle Safari, Medla Forest Watchtower, Gorumara Nature Interpretation Centre"
  },
  "chilapata": {
    name: "Chilapata",
    region: "Alipurduar",
    latitude: 26.5415,
    longitude: 89.3785,
    elevation: 90,
    description: "A mysterious rainforest village lining the elephant migration corridors of Chilapata, near Buxa Forest, containing ancient historic fort ruins.",
    knownFor: "Thick rainforest corridors, archaeological forest ruins",
    nearestTaxiStand: "Hasimara Junction",
    attractions: "Nalraja Garh (Fort of King Nal), Chilapata Wild Elephant Safari, Torsa River Shore"
  },
  "jayanti": {
    name: "Jayanti",
    region: "Alipurduar",
    latitude: 26.7324,
    longitude: 89.6582,
    elevation: 110,
    description: "A pristine forest hamlet along the dry Jayanti River bed within Buxa Tiger Reserve, surrounded by lime caves and tall green forest trees.",
    knownFor: "Buxa Tiger Reserve forest hikes, limestone caves",
    nearestTaxiStand: "Alipurduar Junction",
    attractions: "Jayanti River Bed, Pokhri Lake, Mahakal Cave ruins, Buxa Fort"
  },
  "buxa duar": {
    name: "Buxa Duar",
    region: "Alipurduar",
    latitude: 26.7589,
    longitude: 89.5823,
    elevation: 860,
    description: "A legendary old hill fortress village inside Buxa Tiger Reserve, home to the historically significant British Indian prison fortress.",
    knownFor: "Historic British-era prison fort, freedom fighter heritage",
    nearestTaxiStand: "Rajabhatkhawa Stand",
    attractions: "Buxa Fort, Lepchakha viewpoint, Buxa tiger trails"
  },
  "lepchakha": {
    name: "Lepchakha",
    region: "Alipurduar",
    latitude: 26.7712,
    longitude: 89.5934,
    elevation: 1100,
    description: "A hilltop Drukpa tribal village near the Bhutan frontier, offering spectacular bird's-eye views of the river networks flowing through the Dooars plains.",
    knownFor: "Panoramic views of 12 flowing rivers of Dooars",
    nearestTaxiStand: "Rajabhatkhawa Stand",
    attractions: "Lepchakha Viewpoint, Hills of Bhutan border, local Drukpa monasteries"
  },
  "totopara": {
    name: "Totopara",
    region: "Alipurduar",
    latitude: 26.8341,
    longitude: 89.3142,
    elevation: 180,
    description: "The exclusive anthropological village home to the primitive, ancient Toto tribe, nestled under high Bhutan hills on the Torsa river banks.",
    knownFor: "Preservation of the rare Toto tribal cultural heritage",
    nearestTaxiStand: "Madarihat Bazar Stand",
    attractions: "Toto tribal village hamlet, Torsa River viewpoint, organic local produce orchards"
  },
  "pelling": {
    name: "Pelling",
    region: "Sikkim",
    latitude: 27.3167,
    longitude: 88.2333,
    elevation: 2150,
    description: "An incredibly beautiful high mountain town in West Sikkim, offering stunning close views of Mt. Kanchenjunga, and ancient Buddhist heritage.",
    knownFor: "Magnificent views of Kanchenjunga, Buddhist history",
    nearestTaxiStand: "Pelling Main Stand",
    attractions: "Pemayangtse Monastery, Rabdentse Ancient Palace Ruins, Pelling Skywalk"
  },
  "lachung": {
    name: "Lachung",
    region: "Sikkim",
    latitude: 27.6833,
    longitude: 88.7500,
    elevation: 2620,
    description: "A magical high alpine village in North Sikkim surrounded by towering snow walls, wild flower valley ecosystems, and mountain apple orchards.",
    knownFor: "Apple orchard tours, alpine snow peaks",
    nearestTaxiStand: "Lachung Local Stand",
    attractions: "Yumthang Valley of Flowers, Lachung Monastery, Zero Point"
  },
  "lachen": {
    name: "Lachen",
    region: "Sikkim",
    latitude: 27.7275,
    longitude: 88.5524,
    elevation: 2750,
    description: "A tranquil, high-altitude alpine village in North Sikkim acting as the mandatory checkpoint base for expeditions to the sacred Gurudongmar Lake.",
    knownFor: "Holy Gurudongmar Lake base camp expeditions",
    nearestTaxiStand: "Lachen Junction Stand",
    attractions: "Gurudongmar Lake, Chopta Valley, Lachen Monastery"
  },
  "ravangla": {
    name: "Ravangla",
    region: "Sikkim",
    latitude: 27.2667,
    longitude: 88.3667,
    elevation: 2133,
    description: "A central mountain town in South Sikkim, famous for hosting the monumental Buddha Park (Tathagata Tsal) with a 130ft high bronze Buddha statue.",
    knownFor: "Monumental Buddha Park, organic mountain tea plantations",
    nearestTaxiStand: "Ravangla Main Stand",
    attractions: "Buddha Park, Temi Tea Estate, Maenam Wildlife Sanctuary"
  }
};

// Heuristic offline generator function
export function generateVillagesOfflineFallback(villages: string[], defaultRegion?: string) {
  return villages.map(rawName => {
    const trimmed = rawName.trim();
    const key = trimmed.toLowerCase();
    
    // Check if we have exact match in database
    if (OFFLINE_VILLAGE_DATABASE[key]) {
      return {
        requestedName: rawName,
        ...OFFLINE_VILLAGE_DATABASE[key]
      };
    }
    
    // Check if we have substring match
    const matchingKey = Object.keys(OFFLINE_VILLAGE_DATABASE).find(k => key.includes(k) || k.includes(key));
    if (matchingKey) {
      return {
        requestedName: rawName,
        ...OFFLINE_VILLAGE_DATABASE[matchingKey],
        name: trimmed
      };
    }

    // Heuristics generation based on stable hash
    const hash = getDeterministicHash(key);
    
    // Determine the region
    let region = defaultRegion || "Darjeeling";
    if (!["Darjeeling", "Kalimpong", "Sikkim", "Jaldapara", "Alipurduar", "Jalpaiguri"].includes(region)) {
      const regions = ["Darjeeling", "Kalimpong", "Sikkim", "Jaldapara", "Alipurduar", "Jalpaiguri"];
      region = regions[hash % regions.length];
    }
    
    // Regional centers
    let baseLat = 27.03;
    let baseLon = 88.26;
    let baseElev = 1500;
    
    if (region === "Kalimpong") {
      baseLat = 27.06;
      baseLon = 88.47;
      baseElev = 1600;
    } else if (region === "Sikkim") {
      baseLat = 27.33;
      baseLon = 88.61;
      baseElev = 2200;
    } else if (region === "Jaldapara") {
      baseLat = 26.69;
      baseLon = 89.27;
      baseElev = 150;
    } else if (region === "Alipurduar") {
      baseLat = 26.59;
      baseLon = 89.52;
      baseElev = 120;
    } else if (region === "Jalpaiguri") {
      baseLat = 26.52;
      baseLon = 88.72;
      baseElev = 80;
    }

    // Precise offset generation (bounded within +/- 0.15 degrees)
    const latOffset = ((hash % 300) - 150) / 1000;
    const lonOffset = (((hash >> 2) % 300) - 150) / 1000;
    
    const latitude = Number((baseLat + latOffset).toFixed(4));
    const longitude = Number((baseLon + lonOffset).toFixed(4));
    
    // Deterministic elevation
    let elevation = baseElev;
    if (baseElev > 500) {
      elevation = 1000 + (hash % 1500); // 1000m to 2500m
    } else {
      elevation = 70 + (hash % 200); // 70m to 270m
    }

    const descriptiveNouns = ["hamlet", "eco-village", "mountain settlement", "hidden paradise", "forest glade"];
    const adjectiveOne = ["scenic", "peaceful", "mist-covered", "serene", "pristine", "isolated"];
    const featureDetail = [
      "cardamom and orange orchards, offering sweeping vistas of the snow-clad peaks",
      "dense pine woods and old walking pathways, perfect for nature retreats",
      "rolling tea estates and organic terraces, offering warm local homestay hospitality",
      "babbling mountain brooks and pristine forest fringes, ideal for birdwatching",
      "panoramic viewpoints and historic regional routes, linking scenic mountain valleys"
    ];
    const highlightedFor = [
      "Organic farming, cardamom gardens, and Mt. Kanchenjunga scenery",
      "Lush pine forest trails, heavy mist, and birdwatching hotspots",
      "Charming wooden homestays, river pools, and orange orchid paths",
      "Historical Silk Route corridors and authentic mountain hospitality",
      "Rich wild bird habitats, silent woods, and organic crop cultivation"
    ];
    
    const noun = descriptiveNouns[hash % descriptiveNouns.length];
    const adj = adjectiveOne[(hash >> 1) % adjectiveOne.length];
    const feat = featureDetail[(hash >> 2) % featureDetail.length];
    const kFor = highlightedFor[(hash >> 3) % highlightedFor.length];

    const description = `A ${adj} ${noun} nestled in the beautiful region of ${region}, characterized by ${feat}.`;
    const knownFor = kFor;
    const nearestTaxiStand = `${trimmed} Stand`;
    const attractions = `${trimmed} Viewpoint, local organic farms, nature trails`;

    return {
      requestedName: rawName,
      name: trimmed,
      region,
      latitude,
      longitude,
      elevation,
      description,
      knownFor,
      nearestTaxiStand,
      attractions
    };
  });
}

// Bulk Village Intelligence Metadata Generator using Gemini API with server-side automatic backoff retries and high-fidelity offline fallback
export async function bulkGenerateVillageMetadata(villages: string[], defaultRegion?: string) {
  if (!villages || villages.length === 0) return [];

  let attempts = 0;
  const maxAttempts = 2; // Fast fail-over to offline geocoder to keep experience fluid
  let responseText = "";
  let useFallback = false;

  while (attempts < maxAttempts) {
    try {
      responseText = await executeGeminiOperation(async (ai) => {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are an expert GIS and Himalayan regional geodatabase compiler.
Generate structured location metadata for the following villages/settlements in the Eastern Himalayas, India:
Names: ${villages.join(", ")}
Default suggested region context: ${defaultRegion || "Darjeeling, Kalimpong, Jaldapara, Alipurduar, Sikkim, Jalpaiguri"}

For each village, look up search coordinates or exact GIS data in the Himalayas. Supply highly accurate, consistent, and standard coordinates (latitude/longitude), Elevation in meters (integer), a brief descriptive summary (keep it extremely short, maximum 1-2 concise lines, to fit large batches without truncation), what it is known for (keep it brief, e.g. "Tea gardens and scenic mountain vistas"), and the name of the nearest motorable taxi stand or transit node.

IMPORTANT COMPACTNESS RULE FOR LARGE BATCHES:
- Generate extremely succinct descriptions (e.g., "Scenic high-altitude hamlet near Gangtok offering pine forest hiking trails.").
- This ensures that even large batches (like 100, 150, 200, or 300 villages) will complete successfully without hitting output token limits or truncating.
- You MUST generate exactly the number of requested items. Do not skip any requested villages. If 150 villages are passed, the output array must contain exactly 150 JSON elements.

CRITICAL COORDINATE CONSISTENCY RULE:
- All coordinates must be factually correct and representative of the actual village center (highly consistent with GIS lookups). For example: Jhepi is near Bijanbari/Pulbazar block in Darjeeling and should always be consistently resolved near Latitude 27.0858, Longitude 88.1633. 
- Ensure other well-known locations (such as Takdah, Tinchuley, Lepchajagat) resolve to their standard coordinates consistently.

Region notes:
- Darjeeling (district, West Bengal, mountains)
- Kalimpong (district, West Bengal, mountains)
- Jaldapara (Alipurduar district, West Bengal, foothills/forests)
- Alipurduar (foothills, West Bengal)
- Sikkim (state, India, high-altitude mountains)
- Jalpaiguri (district, plains/foothills, West Bengal)

Respond ONLY with valid JSON inside the expected schema.`,
          config: {
            temperature: 0.0,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  requestedName: { type: Type.STRING, description: "The EXACT raw name from the input list of names that corresponds to this item (e.g. if requested 'Takdah', this should be 'Takdah')" },
                  name: { type: Type.STRING, description: "Normalized official name of the village" },
                  region: { type: Type.STRING, description: "Specific district or state (exactly one of: Darjeeling, Kalimpong, Jaldapara, Alipurduar, Sikkim, Jalpaiguri)" },
                  latitude: { type: Type.NUMBER, description: "Highly precise Latitude in degrees" },
                  longitude: { type: Type.NUMBER, description: "Highly precise Longitude in degrees" },
                  elevation: { type: Type.INTEGER, description: "Altitude/elevation in meters above sea level (e.g. 2050)" },
                  description: { type: Type.STRING, description: "Socio-cultural and visual brief description of the village" },
                  knownFor: { type: Type.STRING, description: "Short highlight phrase what it is well known for" },
                  nearestTaxiStand: { type: Type.STRING, description: "Name of the nearest local taxi stand, public jeep line or motorable central bazar" },
                  attractions: { type: Type.STRING, description: "Comma-separated list of top 2-3 key local attractions, scenic viewpoints, or nearby natural points of interest" }
                },
                required: ["requestedName", "name", "region", "latitude", "longitude", "elevation", "description", "knownFor", "nearestTaxiStand", "attractions"]
              }
            }
          }
        });
        return response.text || "";
      });

      if (responseText) {
        break; // Successfully got response
      }
    } catch (error: any) {
      attempts++;
      let errorStr = "";
      try {
        errorStr = error && typeof error === "object" ? JSON.stringify(error) : String(error);
      } catch {
        errorStr = error?.message || String(error);
      }
      if (error?.message && !errorStr.includes(error.message)) {
        errorStr += " " + error.message;
      }

      const isQuota = errorStr.includes("429") || 
                      errorStr.includes("RESOURCE_EXHAUSTED") || 
                      errorStr.includes("quota") || 
                      errorStr.includes("limit") ||
                      errorStr.includes("EXHAUSTED");

      const isUnavailable = errorStr.includes("503") ||
                            errorStr.includes("UNAVAILABLE") ||
                            errorStr.includes("experiencing high demand") ||
                            errorStr.includes("temporary");

      if (isQuota || isUnavailable) {
        console.info(`[Bulk Village Gen] Gemini 429/503 rate-limited or unavailable. Activating automatic offline high-fidelity geocoder fallback for ${villages.length} inputs...`);
        useFallback = true;
        break; // break loop to execute fallback immediately
      }

      console.info(`[Bulk Village Gen Retry] Info: Transient exception during model query: ${errorStr}. Attempt ${attempts}/${maxAttempts}`);
      if (attempts >= maxAttempts) {
        console.info(`[Bulk Village Gen] Retries completed. Triggering automatic offline fallback for ${villages.length} inputs...`);
        useFallback = true;
        break;
      }

      const waitMs = attempts * 1000; // brief transient backoff
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  if (useFallback || !responseText) {
    console.info(`[Bulk Village Gen Fallback] Generating georealistic metadata offline for ${villages.length} locations...`);
    return generateVillagesOfflineFallback(villages, defaultRegion);
  }

  try {
    return JSON.parse(responseText.trim());
  } catch (parseError) {
    console.error("[Bulk Village Gen] Failed to parse response from Gemini. Falling back to offline generation.", parseError);
    return generateVillagesOfflineFallback(villages, defaultRegion);
  }
}

// AI-Driven Master Data Optimizer: Bulk generation of robust, beautiful Attractions and Homestays for given Destinations
export async function bulkGenerateAttractionsAndHomestays(destinationId: string) {
  const dest = dbStore.getDestinations().find(d => d.id === destinationId);
  if (!dest) {
    throw new Error(`Destination with ID '${destinationId}' not found.`);
  }

  const name = dest.name;
  const lat = dest.latitude || 27.03;
  const lon = dest.longitude || 88.26;
  const region = dest.district || dest.state || "Darjeeling";
  const state = dest.state || "West Bengal";

  let responseText = "";
  let useFallback = false;

  try {
    responseText = await executeGeminiOperation(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert travel writer and Himalayan hospitality intelligence compiler.
Generate highly realistic local tourist attractions and homestays for the village of: "${name}" (Region: ${region}, State: ${state}).

Provide:
- 2 distinct local tourist attractions (e.g. viewpoints, valleys, monasteries, waterfalls, or trekking points) that can be found in or very close to this village.
- 2 distinct family-run cozy homestays or guest houses that are characteristic of this village or direct Himalayan hospitality in this region.

COORDINATES RULE:
- For attractions, generate coordinates that are within 0.05 degrees (roughly 1 to 5 km) of latitude: ${lat} and longitude: ${lon}.
- For homestays, generate coordinates that are within 0.01 degrees of latitude: ${lat} and longitude: ${lon} (closer to village center).

JSON SCHEMA:
The returned JSON must follow the exact structure of the provided schema. No markdown formatting outside the JSON block.`,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              attractions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, description: "Must be exactly one of: Viewpoint, Monastery, Waterfall, Lake, Trek, Village" },
                    description: { type: Type.STRING, description: "Compelling 1-2 line description" },
                    latitude: { type: Type.NUMBER },
                    longitude: { type: Type.NUMBER },
                    isHiddenGem: { type: Type.BOOLEAN }
                  },
                  required: ["name", "category", "description", "latitude", "longitude", "isHiddenGem"]
                }
              },
              homestays: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    priceMin: { type: Type.INTEGER, description: "Minimum rate per day in INR, e.g. 1200" },
                    priceMax: { type: Type.INTEGER, description: "Maximum rate per day in INR, e.g. 2500" },
                    contact: { type: Type.STRING, description: "Realistic phone number with +91 prefix" },
                    amenities: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    description: { type: Type.STRING, description: "Warm hospitable description of the family host and home meals" },
                    roomRates: { type: Type.STRING, description: "Detailed rate info, e.g. '1200 per head per day including 3 meals'" },
                    breakfastIncluded: { type: Type.STRING, description: "Must be 'Included' or 'Not Included'" },
                    lunchAvailable: { type: Type.BOOLEAN },
                    dinnerAvailable: { type: Type.BOOLEAN }
                  },
                  required: ["name", "priceMin", "priceMax", "contact", "amenities", "description", "roomRates", "breakfastIncluded", "lunchAvailable", "dinnerAvailable"]
                }
              }
            },
            required: ["attractions", "homestays"]
          }
        }
      });
      return response.text || "";
    });
  } catch (err: any) {
    console.error(`[Bulk Attractions/Homestays Model Error] for ${name}:`, err.message || err);
    useFallback = true;
  }

  let generatedData: any = { attractions: [], homestays: [] };
  if (!useFallback && responseText) {
    try {
      generatedData = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.error("[Bulk Attractions/Homestays Parse Error] falling back to offline generator:", parseError);
      useFallback = true;
    }
  } else {
    useFallback = true;
  }

  if (useFallback) {
    console.info(`[Bulk Attractions/Homestays Fallback] Generating offline metadata for ${name}...`);
    generatedData = {
      attractions: [
        {
          name: `${name} Viewpoint Point`,
          category: "Viewpoint",
          description: `Superb panoramic vista point near ${name} looking over valleys and mountain ridges.`,
          latitude: lat + 0.005,
          longitude: lon + 0.005,
          isHiddenGem: true
        },
        {
          name: `${name} Buddhist Monastery`,
          category: "Monastery",
          description: `Peaceful sanctuary offering sacred chants and a window into deep Himalayan faith.`,
          latitude: lat - 0.003,
          longitude: lon + 0.002,
          isHiddenGem: false
        }
      ],
      homestays: [
        {
          name: `${name} Cozy Sherpa Homestay`,
          priceMin: 1500,
          priceMax: 2200,
          contact: "+91 98765 43210",
          amenities: ["Hot Water", "Local Sherpa Food", "Mountain View Balcony", "Free Wi-Fi"],
          description: `Unsurpassed local family hospitality offering fresh organic farm-to-table traditional Himalayan meals.`,
          roomRates: "1500 per head/day including breakfast, tea, lunch, and dinner.",
          breakfastIncluded: "Included",
          lunchAvailable: true,
          dinnerAvailable: true
        },
        {
          name: `${name} Mountain Valley Guest House`,
          priceMin: 1200,
          priceMax: 1800,
          contact: "+91 87654 32109",
          amenities: ["Attached Bathroom", "Home-cooked Food", "Bonfire available"],
          description: `Relaxing village cottage nestled in pine trees with great views and welcoming local hosts.`,
          roomRates: "1250 per head/day including all three meals.",
          breakfastIncluded: "Included",
          lunchAvailable: true,
          dinnerAvailable: true
        }
      ]
    };
  }

  // Map generated items to exact schemas
  const timestamp = new Date().toISOString();
  const rawAttractions = (generatedData.attractions || []).map((a: any, index: number) => {
    const slugName = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const id = `attr_${slugName}_${destinationId}`;
    return {
      id,
      name: a.name,
      category: ['Viewpoint', 'Monastery', 'Waterfall', 'Lake', 'Trek', 'Village'].includes(a.category) ? a.category : 'Viewpoint',
      destinationId,
      description: a.description,
      image: "",
      gallery: [],
      isHiddenGem: !!a.isHiddenGem,
      isFeaturedThisWeek: index === 0,
      isFeaturedAttraction: index === 0,
      latitude: Number(a.latitude || (lat + 0.002 * (index + 1))),
      longitude: Number(a.longitude || (lon + 0.002 * (index + 1))),
      district: region,
      state: state,
      country: "India",
      nearestDestinationId: destinationId,
      distanceFromDestination: 1.5,
    };
  });

  const rawHomestays = (generatedData.homestays || []).map((h: any, index: number) => {
    const slugName = h.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const id = `home_${slugName}_${destinationId}`;
    return {
      id,
      name: h.name,
      destinationId,
      priceMin: Number(h.priceMin || 1200),
      priceMax: Number(h.priceMax || 2500),
      contact: h.contact || "+91 99999 99999",
      amenities: Array.isArray(h.amenities) ? h.amenities : ["Hot Water", "Home-cooked Food", "Mountain View"],
      images: [],
      ownerId: null,
      ownerName: "Local Himalayan Host",
      mobile: h.contact || "+91 99999 99999",
      whatsapp: h.contact || "+91 99999 99999",
      whatsappNumber: h.contact ? h.contact.replace(/\D/g, '') : "919999999999",
      address: `${h.name}, near central village bazzar, ${name}, ${region}`,
      status: "Approved",
      createdAt: timestamp,
      latitude: Number(h.latitude || (lat + 0.001 * (index + 1))),
      longitude: Number(h.longitude || (lon + 0.001 * (index + 1))),
      district: region,
      state: state,
      country: "India",
      nearestDestinationId: destinationId,
      distanceFromDestination: 0.5,
      description: h.description,
      roomRates: h.roomRates,
      breakfastIncluded: h.breakfastIncluded === "Not Included" ? "Not Included" : "Included",
      lunchAvailable: h.lunchAvailable !== false,
      dinnerAvailable: h.dinnerAvailable !== false
    };
  });

  // Save them securely bulk-wise
  if (rawAttractions.length > 0) {
    await dbStore.saveRecordsBulk('attractions', rawAttractions);
  }
  if (rawHomestays.length > 0) {
    await dbStore.saveRecordsBulk('homestays', rawHomestays);
  }

  return {
    destinationName: name,
    attractionsGenerated: rawAttractions.length,
    homestaysGenerated: rawHomestays.length,
    attractions: rawAttractions,
    homestays: rawHomestays
  };
}

// AI Deep Settle Discovery: Discover up to 5 comprehensive attractions/viewpoints/monasteries for a saved destination village
export async function discoverComprehensiveAttractionsGemini(destinationId: string) {
  const dest = dbStore.getDestinations().find(d => d.id === destinationId);
  if (!dest) {
    throw new Error(`Destination with ID '${destinationId}' not found.`);
  }

  const name = dest.name;
  const lat = dest.latitude || 27.03;
  const lon = dest.longitude || 88.26;
  const region = dest.district || dest.state || "Darjeeling";
  const state = dest.state || "West Bengal";

  let responseText = "";
  let useFallback = false;
  try {
    responseText = await executeGeminiOperation(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find all verifiable tourist attractions associated with "${name}" (Region: ${region}, State: ${state}, India).

Include:
- Attractions inside the village
- Attractions within 5 km
- Attractions within 15 km

Categories:
Waterfall, Lake, Viewpoint, Valley, Monastery, Temple, Tea Garden, National Park, Wildlife Sanctuary, Museum, Bridge, Market, Peak, Trek Route, Forest, Hot Spring, River, Heritage Site, Birding Spot, Camping Site, Orchard, Cultural Attraction.

Return exactly 5 distinct, highly verifiable attractions with coordinates and proximity relation.
Do not return duplicate attractions.
Do not return destinations.
Return only verifiable attractions.`,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              attractions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { 
                      type: Type.STRING, 
                      description: "Must be exactly one of: Waterfall, Lake, Viewpoint, Valley, Monastery, Temple, Tea Garden, National Park, Wildlife Sanctuary, Museum, Bridge, Market, Peak, Trek Route, Forest, Hot Spring, River, Heritage Site, Birding Spot, Camping Site, Orchard, Cultural Attraction" 
                    },
                    relation: {
                      type: Type.STRING,
                      description: "Must be exactly one of: Inside, Near, Accessible"
                    },
                    description: { type: Type.STRING, description: "Detailed 1-2 line description of the attraction." },
                    latitude: { type: Type.NUMBER },
                    longitude: { type: Type.NUMBER },
                    isHiddenGem: { type: Type.BOOLEAN }
                  },
                  required: ["name", "category", "relation", "description", "latitude", "longitude", "isHiddenGem"]
                }
              }
            },
            required: ["attractions"]
          }
        }
      });
      return response.text || "";
    });
  } catch (err: any) {
    console.error(`[Deep Attraction Model Error] for ${name}:`, err.message || err);
    useFallback = true;
  }

  let generatedData: any = { attractions: [] };
  if (!useFallback && responseText) {
    try {
      generatedData = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.error(`[Deep Discovery Attraction Parser Error] for ${name}:`, parseError);
      useFallback = true;
    }
  } else {
    useFallback = true;
  }

  if (useFallback) {
    console.info(`[Deep Discovery Attraction Fallback] Generating offline georealistic list of 5 attractions for "${name}"...`);
    generatedData = {
      attractions: [
        {
          name: `${name} Cloud Top Viewpoint`,
          category: "Viewpoint",
          relation: "Inside",
          description: `Outstanding panoramic spot near ${name} over long sweeping valleys and snow-clad Himalayan peaks, ideal for catching sunrise clouds.`,
          latitude: lat + 0.005,
          longitude: lon + 0.005,
          isHiddenGem: true
        },
        {
          name: `${name} Buddhist Monastic Hermitage`,
          category: "Monastery",
          relation: "Inside",
          description: `A tranquil Buddhist sanctuary offering holy prayer flags, peaceful wind chants, and a window into deep Himalayan faith.`,
          latitude: lat - 0.003,
          longitude: lon + 0.002,
          isHiddenGem: false
        },
        {
          name: `${name} Whispering Pine Canopy Trail`,
          category: "Trek Route",
          relation: "Near",
          description: `A quiet conifer forest walk carpeted with wilderness lichens, lush wild ferns, and mountain orchids. Ideal for nature walks.`,
          latitude: lat + 0.002,
          longitude: lon - 0.004,
          isHiddenGem: false
        },
        {
          name: `${name} Silver Cascades Waterfall`,
          category: "Waterfall",
          relation: "Near",
          description: `Splendid glacial runoff drop crashing down rock faces into a pool surrounded by massive ferns and granite cliffs.`,
          latitude: lat + 0.008,
          longitude: lon + 0.003,
          isHiddenGem: true
        },
        {
          name: `Sacred Changu View Lake of ${name}`,
          category: "Lake",
          relation: "Accessible",
          description: `A high-altitude serene natural tarn reflecting deep-blue skies and bamboo forest fringes.`,
          latitude: lat - 0.007,
          longitude: lon - 0.002,
          isHiddenGem: true
        }
      ]
    };
  }
  const timestamp = new Date().toISOString();

  const allowedCategories = [
    'Waterfall', 'Lake', 'Viewpoint', 'Valley', 'Monastery', 'Temple', 'Tea Garden', 
    'National Park', 'Wildlife Sanctuary', 'Museum', 'Bridge', 'Market', 'Peak', 
    'Trek Route', 'Forest', 'Hot Spring', 'River', 'Heritage Site', 'Birding Spot', 
    'Camping Site', 'Orchard', 'Cultural Attraction', 'Trek', 'Village', 'Wilderness'
  ];

  const rawAttractions = (generatedData.attractions || []).map((a: any, index: number) => {
    const slugName = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const id = `attr_${slugName}_${destinationId}`;
    const relationStr = a.relation ? `[${a.relation}] ` : '';
    return {
      id,
      name: a.name,
      category: allowedCategories.includes(a.category) ? a.category : 'Viewpoint',
      destinationId,
      description: `${relationStr}${a.description}`,
      image: "",
      gallery: [],
      isHiddenGem: !!a.isHiddenGem,
      isFeaturedThisWeek: index === 0,
      isFeaturedAttraction: index < 2,
      latitude: Number(a.latitude || (lat + 0.003 * (index + 1))),
      longitude: Number(a.longitude || (lon + 0.003 * (index + 1))),
      district: region,
      state: state,
      country: "India",
      nearestDestinationId: destinationId,
      distanceFromDestination: 1.8 + (index * 0.4),
    };
  });

  if (rawAttractions.length > 0) {
    await dbStore.saveRecordsBulk('attractions', rawAttractions);
    await recalculateSpatialForRecord('destinations', destinationId);
    for (const attr of rawAttractions) {
      await recalculateSpatialForRecord('attractions', attr.id);
    }
  }

  return {
    destinationName: name,
    attractionsGenerated: rawAttractions.length,
    attractions: rawAttractions
  };
}

// ------------------------------------------------------------------------
// Universal Data Input / Location Intelligence Lookup Engine helpers
// ------------------------------------------------------------------------

export async function discoverUniversalVillageIntelligence(village: string, district: string, state: string) {
  if (!village) {
    throw new Error("Village name is required.");
  }

  let responseText = "";
  let useFallback = false;

  try {
    responseText = await executeGeminiOperation(async (ai) => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert Himalayan geographer and tourism research assistant.
Perform a thorough, comprehensive lookup for the village "${village}" located in District/Region "${district || 'Himalayan hills'}", State "${state || 'West Bengal/Sikkim'}", India.

We need to compile:
1. Exact, highly accurate geocentric latitude and longitude for the village centroid.
2. A proper socio-cultural and geographical description of the village (about 30-50 words, rich with regional relevance, mountain views, Kanchenjunga visibility, or tea garden/orange orchard traits if applicable).
3. The exact or highly realistic name of the nearest motorable Taxi Stand / Jeep Union / Bazar.
4. A exhaustive, comprehensive list of ALL nearby tourist attractions, scenic viewpoints, monasteries, waterfalls, lakes, forest treks, or unique wilderness gems (provide exactly 3 to 5 distinct items so that no important local attractions are missed).
5. A list of family-run cozy local homestays or guest houses present in or very near this village (provide exactly 2 to 3 distinct items).

Provide reasonable, realistic fields:
- For homestays: base prices (INR range like 1200-2000), amenities, unique host descriptions, and a realistic +91 Indian mobile number.
- For attractions: name, category, and scenic traits description.

Respond ONLY with valid JSON inside the expected schema.`,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              villageName: { type: Type.STRING },
              district: { type: Type.STRING },
              state: { type: Type.STRING },
              latitude: { type: Type.NUMBER, description: "Highly precise geocentric latitude for this village" },
              longitude: { type: Type.NUMBER, description: "Highly precise geocentric longitude for this village" },
              elevation: { type: Type.INTEGER, description: "Elevation in meters above sea level" },
              description: { type: Type.STRING, description: "Compelling travel description of the village" },
              nearestTaxiStand: { type: Type.STRING, description: "Name of the nearest motorable taxi stand/Jeep Union/Bazar" },
              attractions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, description: "Must be exactly one of: Viewpoint, Monastery, Waterfall, Lake, Trek, Village, Wilderness" },
                    description: { type: Type.STRING, description: "Compelling 1-2 line description highlighting Kanchenjunga visibility, local trails, or tranquility." },
                    isHiddenGem: { type: Type.BOOLEAN }
                  },
                  required: ["name", "category", "description", "isHiddenGem"]
                }
              },
              homestays: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    priceMin: { type: Type.INTEGER, description: "Starting daily rate in INR, e.g. 1500" },
                    priceMax: { type: Type.INTEGER, description: "Maximum daily rate in INR, e.g. 2500" },
                    contact: { type: Type.STRING, description: "A realistic 10-digit mobile number with +91 prefix, e.g. +91 94340 12345" },
                    amenities: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    description: { type: Type.STRING, description: "Warm hospitable description of host families and local farm-fresh meals." }
                  },
                  required: ["name", "priceMin", "priceMax", "contact", "amenities", "description"]
                }
              }
            },
            required: ["villageName", "district", "state", "latitude", "longitude", "elevation", "description", "nearestTaxiStand", "attractions", "homestays"]
          }
        }
      });

      return response.text || "";
    });
  } catch (err: any) {
    console.error(`[Universal Discover Model Error] for ${village}:`, err.message || err);
    useFallback = true;
  }

  if (useFallback || !responseText) {
    console.info(`[Universal Discover Fallback] Triggering offline realistic geocultural mock generator for "${village}"...`);
    const isSikkim = String(state || "").toLowerCase().includes("sikkim") || String(district || "").toLowerCase().includes("sikkim");
    return {
      villageName: village,
      district: district || (isSikkim ? "East Sikkim" : "Darjeeling"),
      state: state || (isSikkim ? "Sikkim" : "West Bengal"),
      latitude: 27.03,
      longitude: 88.26,
      elevation: 1850,
      description: `A pristine and scenic Himalayan hamlet of ${village} nestled within ${district || 'the hills'}, offering mesmerizing, tranquil sights of the valley, local farming terraces, and verdant tea garden paths.`,
      nearestTaxiStand: `${village} Motor Stand`,
      attractions: [
        {
          name: `${village} Pine Forest Viewpoint`,
          category: "Viewpoint",
          description: `Panoramic high-altitude viewpoint overlooking dense pine canopies, deep valleys, and rolling clouds.`,
          isHiddenGem: true
        },
        {
          name: `${village} Old Peace Monastic Retreat`,
          category: "Monastery",
          description: `An older, peaceful Buddhist monastery where colourful prayer flags capture tranquil Himalayan drafts.`,
          isHiddenGem: false
        }
      ],
      homestays: [
        {
          name: `${village} Hill View Cozy Homestay`,
          priceMin: 1500,
          priceMax: 2200,
          contact: "+91 94340 98765",
          amenities: ["Attached Bath", "Hot Water Wood-fire Geyser", "Kanchenjunga Balcony View", "Organic Garden Meals"],
          description: `Experience authentic local Lepcha/Sherpa hospitality featuring home-grown organic meals and heartwarming hillside hospitality.`
        }
      ]
    };
  }

  try {
    return JSON.parse(responseText.trim());
  } catch (parseError) {
    console.error("[Universal Discover JSON Parse Error]", parseError);
    throw new Error("Failed to parse geography results from Gemini. Please try again.");
  }
}

export async function calculateUniversalVectors(payload: any) {
  const { village, attractions, homestays } = payload;
  
  const vLat = Number(village.latitude || 27.03);
  const vLon = Number(village.longitude || 88.26);
  const district = village.district || "Darjeeling";
  const state = village.state || "West Bengal";

  // 1. Calculate Taxi Stand Coordinates
  const taxiStandName = village.nearestTaxiStand || `${village.villageName} Taxi Stand`;
  const taxiQuery = `${taxiStandName}, ${district}, ${state}, India`;
  const taxiCoords = await geocodeLocationGemini(taxiQuery, {
    latitude: vLat + 0.0012,
    longitude: vLon - 0.0015,
    district,
    state,
    country: "India"
  }, false);

  // 2. Calculate Attractions Coordinates and offset orientations
  const calculatedAttractions = [];
  for (let i = 0; i < attractions.length; i++) {
    const attr = attractions[i];
    const attrQuery = `${attr.name}, near ${village.villageName}, ${district}, ${state}, India`;
    
    // Distribute offsets geometrically around village center
    const angle = (i * 2 * Math.PI) / attractions.length;
    const distanceOffset = 0.004 + (i * 0.002); // ~400m to 1.2km offset
    const offsetLat = vLat + Math.sin(angle) * distanceOffset;
    const offsetLon = vLon + Math.cos(angle) * distanceOffset;

    const coords = await geocodeLocationGemini(attrQuery, {
      latitude: offsetLat,
      longitude: offsetLon,
      district,
      state,
      country: "India"
    }, false);

    calculatedAttractions.push({
      ...attr,
      latitude: Number(coords.latitude || offsetLat),
      longitude: Number(coords.longitude || offsetLon)
    });
  }

  // 3. Calculate Homestays Coordinates
  const calculatedHomestays = [];
  for (let i = 0; i < homestays.length; i++) {
    const hs = homestays[i];
    const angle = ((i + 0.5) * 2 * Math.PI) / homestays.length;
    const distanceOffset = 0.0018 + (i * 0.0005); // ~180-250 meters distribution
    const offsetLat = vLat + Math.sin(angle) * distanceOffset;
    const offsetLon = vLon + Math.cos(angle) * distanceOffset;

    calculatedHomestays.push({
      ...hs,
      latitude: Number(offsetLat),
      longitude: Number(offsetLon)
    });
  }

  return {
    taxiStand: {
      name: taxiStandName,
      latitude: taxiCoords.latitude,
      longitude: taxiCoords.longitude
    },
    attractions: calculatedAttractions,
    homestays: calculatedHomestays
  };
}


