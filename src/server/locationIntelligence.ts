import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from "@google/genai";
import { dbStore } from './db';

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
  try {
    const dir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_PATH, JSON.stringify(geocodingCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save geocoding cache:', err);
  }
}

// Initial cache load
loadCache();

// Gemini client lazy initialization
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in your Secrets panel.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Distance helper
export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
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
export async function geocodeLocationGemini(query: string): Promise<CachedLocation> {
  const normQuery = query.toLowerCase().trim();
  if (geocodingCache[normQuery]) {
    return geocodingCache[normQuery];
  }

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Retrieve highly precise geographical coordinates (latitude and longitude), district, state, and country for: "${query}". Respond ONLY with valid JSON conforming strictly to the requested schema. Ensure mountain region coordinates are highly accurate.`,
    config: {
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

  if (!response.text) {
    throw new Error('Emply response returned from Gemini API.');
  }

  const resultStr = response.text.trim();
  const parsed = JSON.parse(resultStr) as CachedLocation;

  if (typeof parsed.latitude !== 'number' || typeof parsed.longitude !== 'number') {
    throw new Error('Invalid coordinate format received.');
  }

  geocodingCache[normQuery] = parsed;
  saveCache();
  return parsed;
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
export async function recalculateSpatialForRecord(col: string, recordId: string): Promise<boolean> {
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
  const sortedAttractions = attractions
    .filter(a => {
      if (col === 'attractions' && a.id === recordId) return false;
      return isCoordinateValid(Number(a.latitude), Number(a.longitude));
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
  const sortedHomestays = homestays
    .filter(h => {
      if (col === 'homestays' && h.id === recordId) return false;
      return isCoordinateValid(Number(h.latitude), Number(h.longitude));
    })
    .map(h => {
      const dist = getDistanceInKm(lat, lon, Number(h.latitude), Number(h.longitude));
      return { id: h.id, name: h.name, distance: dist };
    })
    .filter(h => h.distance <= 30)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  updates.nearbyHomestays = sortedHomestays;

  await dbStore.updateRecord(col, recordId, updates);
  return true;
}

// Bulk recalculate relationships
export async function recalculateAllSpatialRelations(): Promise<{ count: number }> {
  const destinations = dbStore.getDestinations();
  const attractions = dbStore.getAttractions();
  const homestays = dbStore.getHomestays();
  
  let count = 0;

  for (const d of destinations) {
    if (isCoordinateValid(Number(d.latitude), Number(d.longitude))) {
      await recalculateSpatialForRecord('destinations', d.id);
      count++;
    }
  }

  for (const a of attractions) {
    if (isCoordinateValid(Number(a.latitude), Number(a.longitude))) {
      await recalculateSpatialForRecord('attractions', a.id);
      count++;
    }
  }

  for (const h of homestays) {
    if (isCoordinateValid(Number(h.latitude), Number(h.longitude))) {
      await recalculateSpatialForRecord('homestays', h.id);
      count++;
    }
  }

  return { count };
}

// On the fly trigger
export async function triggerBackgroundGeocodingAndSpatial(col: string, recordId: string) {
  try {
    const record = lookupRecord(col, recordId);
    if (!record) return;

    const lat = Number(record.latitude);
    const lon = Number(record.longitude);

    if (isCoordinateValid(lat, lon)) {
      await recalculateSpatialForRecord(col, recordId);
      return;
    }

    const query = buildLocationQuery(record, col === 'hubs' ? 'hub' : col.replace(/s$/, ''), dbStore.getDestinations());
    const result = await geocodeLocationGemini(query);
    
    const updates = {
      latitude: result.latitude,
      longitude: result.longitude,
      district: record.district || result.district,
      state: record.state || result.state,
      country: record.country || result.country
    };

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
export async function runBulkGeocodeJob() {
  if (activeGeocodeJob.status === 'running') return;

  const destinations = dbStore.getDestinations();
  const attractions = dbStore.getAttractions();
  const homestays = dbStore.getHomestays();
  const hubs = dbStore.getHubs();

  const items: { col: string; record: any }[] = [];

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

  if (items.length === 0) {
    activeGeocodeJob = {
      status: 'completed',
      total: 0,
      current: 0,
      successCount: 0,
      failureCount: 0,
      logs: ['All available records already possess optimal coordinates.']
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

  addLog(`Commencing bulk geocoding. Analyzing ${items.length} records missing coordinates...`);

  (async () => {
    try {
      const destList = dbStore.getDestinations();
      
      for (const item of items) {
        if (activeGeocodeJob.status !== 'running') break;

        activeGeocodeJob.current++;
        const { col, record } = item;
        const typeStr = col === 'hubs' ? 'hub' : col.replace(/s$/, '');
        const query = buildLocationQuery(record, typeStr, destList);
        
        try {
          addLog(`[Job ${activeGeocodeJob.current}/${activeGeocodeJob.total}] Resolving query for: "${record.name}"...`);
          const result = await geocodeLocationGemini(query);

          const updates: any = {
            latitude: result.latitude,
            longitude: result.longitude,
            district: record.district || result.district,
            state: record.state || result.state,
            country: record.country || result.country
          };

          await dbStore.updateRecord(col, record.id, updates);
          activeGeocodeJob.successCount++;
          addLog(`✓ Resolved coordinates for: "${record.name}" -> Lat: ${result.latitude}, Lon: ${result.longitude}`);
          
          await recalculateSpatialForRecord(col, record.id);
        } catch (err: any) {
          activeGeocodeJob.failureCount++;
          addLog(`✗ Failed coordinates resolution for "${record.name}": ${err.message || err}`);
        }

        // Adaptive spacing delay for free-tier quotas
        await new Promise(resolve => setTimeout(resolve, 800));
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
