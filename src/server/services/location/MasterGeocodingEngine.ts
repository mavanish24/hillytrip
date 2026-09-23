import { dbStore } from '../../db';
import { executeGeminiOperation } from '../../geminiClient';
import { Type } from '@google/genai';

export type GeocodeStatus = 'pending' | 'processing' | 'approved' | 'failed' | 'review';
export type GeocodeSource = 'osm_nominatim' | 'google_geocoding' | 'gemini_ai' | 'cached_dedup' | 'manual_override' | 'pre_existing';

export interface MasterGeocode {
  id: string;
  entity_type: string; // 'destination', 'attraction', 'taxi_stand', 'homestay', 'route', 'village', 'municipality', 'festival', 'parking', 'viewpoint', 'restaurant', 'hotel', 'trekking_route', etc.
  entity_id: string;
  entity_name: string;
  category?: string;
  village?: string;
  town?: string;
  municipality?: string;
  block?: string;
  subdivision?: string;
  district?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  full_address?: string;
  latitude: number | null;
  longitude: number | null;
  geocode_status: GeocodeStatus;
  geocode_source?: GeocodeSource;
  confidence_score: number; // 0 - 100
  verified: boolean;
  retry_count: number;
  error_reason?: string | null;
  created_at: string;
  updated_at: string;
  last_checked_at?: string | null;
  geocoded_at?: string | null;
  metadata?: Record<string, any>;
}

export interface MasterGeocodeAuditLog {
  id: string;
  geocode_id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  previous_latitude: number | null;
  previous_longitude: number | null;
  new_latitude: number | null;
  new_longitude: number | null;
  source: GeocodeSource;
  confidence: number;
  processing_duration_ms: number;
  retry_count: number;
  status: GeocodeStatus;
  failure_reason?: string | null;
  timestamp: string;
}

export interface GeocodingBatchStats {
  totalInQueue: number;
  processedInBatch: number;
  approvedCount: number;
  reviewCount: number;
  failedCount: number;
  dedupHits: number;
  avgConfidence: number;
  processingTimeMs: number;
  timestamp: string;
}

export interface GeocodingNotification {
  id: string;
  title: string;
  message: string;
  type: 'review_required' | 'batch_completed' | 'verification_alert' | 'error';
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

// In-Memory Storage maps
const masterGeocodes = new Map<string, MasterGeocode>(); // Keyed by master_geocode id
const entityIndexMap = new Map<string, string>(); // Keyed by `${entity_type}:${entity_id}` -> master_geocode id
const auditLogs: MasterGeocodeAuditLog[] = [];
const notifications: GeocodingNotification[] = [];

// Helper: Coordinate bounding box validation for Indian Subcontinent & Himalayan region
export function isValidCoordinate(lat: number | null | undefined, lng: number | null | undefined): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (isNaN(nLat) || isNaN(nLng)) return false;
  if (nLat === 0 && nLng === 0) return false;
  if (nLat < -90 || nLat > 90 || nLng < -180 || nLng > 180) return false;
  // Regional bounding check for India & Himalayan neighboring regions (Nepal, Bhutan, Tibet border)
  return nLat >= 8.0 && nLat <= 38.0 && nLng >= 68.0 && nLng <= 98.0;
}

// Helper: Normalize location name for deduplication matching
function normalizeLocationKey(name: string, district?: string, state?: string): string {
  const norm = (str?: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${norm(name)}_${norm(district)}_${norm(state)}`;
}

// Helper: Exponential retry delay calculation in milliseconds
function getRetryDelayMs(retryCount: number): number {
  if (retryCount <= 1) return 24 * 60 * 60 * 1000; // 1 day
  if (retryCount === 2) return 3 * 24 * 60 * 60 * 1000; // 3 days
  if (retryCount === 3) return 7 * 24 * 60 * 60 * 1000; // 7 days
  return Infinity; // Manual review required
}

// ==========================================
// CENTRAL REGISTRATION ENGINE
// ==========================================

export function registerOrUpdateEntityInMasterGeocodes(
  entityType: string,
  entityId: string,
  entityName: string,
  data: {
    category?: string;
    village?: string;
    town?: string;
    municipality?: string;
    block?: string;
    subdivision?: string;
    district?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    full_address?: string;
    latitude?: number | null;
    longitude?: number | null;
    verified?: boolean;
    metadata?: Record<string, any>;
  }
): MasterGeocode {
  const indexKey = `${entityType}:${entityId}`;
  const existingId = entityIndexMap.get(indexKey);

  const now = new Date().toISOString();
  const hasCoords = isValidCoordinate(data.latitude, data.longitude);

  if (existingId && masterGeocodes.has(existingId)) {
    const existing = masterGeocodes.get(existingId)!;

    // Safety Rule: Never overwrite verified coordinates
    if (existing.verified && existing.latitude !== null && existing.longitude !== null) {
      existing.entity_name = entityName || existing.entity_name;
      existing.district = data.district || existing.district;
      existing.state = data.state || existing.state;
      existing.updated_at = now;
      masterGeocodes.set(existing.id, existing);
      return existing;
    }

    // Update existing queue entry
    existing.entity_name = entityName || existing.entity_name;
    existing.category = data.category || existing.category;
    existing.village = data.village || existing.village;
    existing.town = data.town || existing.town;
    existing.municipality = data.municipality || existing.municipality;
    existing.district = data.district || existing.district;
    existing.state = data.state || existing.state;
    existing.country = data.country || existing.country || 'India';
    existing.postal_code = data.postal_code || existing.postal_code;
    existing.full_address = data.full_address || existing.full_address;
    existing.updated_at = now;

    if (hasCoords) {
      existing.latitude = Number(data.latitude);
      existing.longitude = Number(data.longitude);
      existing.geocode_status = 'approved';
      existing.geocode_source = existing.geocode_source || 'pre_existing';
      existing.confidence_score = Math.max(existing.confidence_score, 90);
      if (data.verified) existing.verified = true;
    } else if (existing.geocode_status === 'failed') {
      existing.geocode_status = 'pending'; // Re-queue if data was updated
    }

    masterGeocodes.set(existing.id, existing);
    return existing;
  }

  // Create new MasterGeocode record
  const newId = `mg_${entityType}_${entityId}_${Date.now().toString(36)}`;
  const record: MasterGeocode = {
    id: newId,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    category: data.category,
    village: data.village,
    town: data.town,
    municipality: data.municipality,
    block: data.block,
    subdivision: data.subdivision,
    district: data.district || 'Darjeeling',
    state: data.state || 'West Bengal',
    country: data.country || 'India',
    postal_code: data.postal_code,
    full_address: data.full_address,
    latitude: hasCoords ? Number(data.latitude) : null,
    longitude: hasCoords ? Number(data.longitude) : null,
    geocode_status: hasCoords ? 'approved' : 'pending',
    geocode_source: hasCoords ? 'pre_existing' : undefined,
    confidence_score: hasCoords ? (data.verified ? 100 : 90) : 0,
    verified: !!data.verified && hasCoords,
    retry_count: 0,
    created_at: now,
    updated_at: now,
    last_checked_at: null,
    geocoded_at: hasCoords ? now : null,
    metadata: data.metadata || {}
  };

  masterGeocodes.set(newId, record);
  entityIndexMap.set(indexKey, newId);
  return record;
}

// Sync all location tables across the entire app into master_geocodes queue
export function syncAllPlatformEntitiesToMasterGeocodes(): { registered: number; existing: number } {
  let registered = 0;
  let existing = 0;

  // 1. Destinations / Villages
  const destinations = dbStore.getDestinations() || [];
  for (const d of destinations) {
    const isNew = !entityIndexMap.has(`destination:${d.id}`);
    registerOrUpdateEntityInMasterGeocodes('destination', d.id, d.name, {
      category: d.tourismType || 'Destination',
      district: d.district,
      state: d.state,
      country: d.country,
      latitude: d.latitude ? Number(d.latitude) : null,
      longitude: d.longitude ? Number(d.longitude) : null,
      verified: isValidCoordinate(d.latitude, d.longitude)
    });
    if (isNew) registered++; else existing++;
  }

  // 2. Attractions
  const attractions = dbStore.getAttractions() || [];
  for (const a of attractions) {
    const isNew = !entityIndexMap.has(`attraction:${a.id}`);
    registerOrUpdateEntityInMasterGeocodes('attraction', a.id, a.name, {
      category: a.category || 'Sightseeing',
      district: a.district,
      state: a.state,
      country: a.country,
      latitude: a.latitude ? Number(a.latitude) : null,
      longitude: a.longitude ? Number(a.longitude) : null,
      verified: isValidCoordinate(a.latitude, a.longitude)
    });
    if (isNew) registered++; else existing++;
  }

  // 3. Homestays
  const homestays = dbStore.getHomestays() || [];
  for (const h of homestays) {
    const isNew = !entityIndexMap.has(`homestay:${h.id}`);
    registerOrUpdateEntityInMasterGeocodes('homestay', h.id, h.name, {
      category: 'Homestay',
      district: h.district,
      state: h.state,
      country: h.country,
      full_address: (h as any).address || (h as any).location,
      latitude: h.latitude ? Number(h.latitude) : null,
      longitude: h.longitude ? Number(h.longitude) : null,
      verified: isValidCoordinate(h.latitude, h.longitude)
    });
    if (isNew) registered++; else existing++;
  }

  // 4. Taxi Stands / Hubs
  const hubs = dbStore.getHubs() || [];
  for (const hb of hubs) {
    const isNew = !entityIndexMap.has(`taxi_stand:${hb.id}`);
    registerOrUpdateEntityInMasterGeocodes('taxi_stand', hb.id, hb.name, {
      category: hb.type || 'Taxi Stand',
      district: hb.district,
      state: hb.state,
      country: hb.country,
      latitude: hb.latitude ? Number(hb.latitude) : null,
      longitude: hb.longitude ? Number(hb.longitude) : null,
      verified: isValidCoordinate(hb.latitude, hb.longitude)
    });
    if (isNew) registered++; else existing++;
  }

  // 5. Routes
  const routes = dbStore.getRoutes() || [];
  for (const r of routes) {
    const isNew = !entityIndexMap.has(`route:${r.id}`);
    const fromHub = hubs.find(h => h.id === r.fromHubId);
    const toHub = hubs.find(h => h.id === r.toHubId);
    const routeName = `${fromHub ? fromHub.name : r.fromHubId} to ${toHub ? toHub.name : r.toHubId}`;

    registerOrUpdateEntityInMasterGeocodes('route', r.id, routeName, {
      category: r.type || 'Transit Route',
      district: fromHub?.district || toHub?.district || 'Himalayan Corridor',
      latitude: fromHub?.latitude ? Number(fromHub.latitude) : null,
      longitude: fromHub?.longitude ? Number(fromHub.longitude) : null,
      verified: isValidCoordinate(fromHub?.latitude, fromHub?.longitude)
    });
    if (isNew) registered++; else existing++;
  }

  console.log(`[MasterGeocodesEngine] Synchronization Complete. Newly Registered: ${registered}, Existing Updated: ${existing}, Total Queue Size: ${masterGeocodes.size}`);
  return { registered, existing };
}

// ==========================================
// MULTI-STRATEGY GEOCODING PIPELINE
// ==========================================

// Strategy 1: Cached / Deduplication Lookup
function tryDeduplicationLookup(record: MasterGeocode): { latitude: number; longitude: number; confidence: number; matchedRecord: MasterGeocode } | null {
  const normKey = normalizeLocationKey(record.entity_name, record.district, record.state);

  for (const existing of masterGeocodes.values()) {
    if (existing.id === record.id) continue;
    if (existing.geocode_status !== 'approved' || !isValidCoordinate(existing.latitude, existing.longitude)) continue;

    const existNormKey = normalizeLocationKey(existing.entity_name, existing.district, existing.state);
    if (existNormKey === normKey) {
      return {
        latitude: existing.latitude!,
        longitude: existing.longitude!,
        confidence: Math.min(98, existing.confidence_score),
        matchedRecord: existing
      };
    }
  }
  return null;
}

// Strategy 2: OpenStreetMap Nominatim Geocoding API
async function tryOSMNominatimGeocoding(query: string): Promise<{ latitude: number; longitude: number; confidence: number; displayName: string } | null> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'HillyTrip-AutonomousGeocodingEngine/1.0 (contact@hillytrip.com)'
      }
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const match = data[0];
    const lat = parseFloat(match.lat);
    const lon = parseFloat(match.lon);

    if (isValidCoordinate(lat, lon)) {
      const importance = match.importance ? Math.round(match.importance * 100) : 85;
      const confidence = Math.min(98, Math.max(82, importance + 20));
      return {
        latitude: lat,
        longitude: lon,
        confidence,
        displayName: match.display_name || ''
      };
    }
  } catch (err) {
    // Quiet failure - proceed to fallback strategies
  }
  return null;
}

// Strategy 3: Google Geocoding API (if Google Maps key configured)
async function tryGoogleGeocoding(query: string): Promise<{ latitude: number; longitude: number; confidence: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const encoded = encodeURIComponent(query);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      if (isValidCoordinate(loc.lat, loc.lng)) {
        return {
          latitude: loc.lat,
          longitude: loc.lng,
          confidence: 96
        };
      }
    }
  } catch (e) {
    // Quiet fallback
  }
  return null;
}

// Strategy 4: Gemini AI Contextual Geocoding Engine
async function tryGeminiAIGeocoding(record: MasterGeocode): Promise<{ latitude: number; longitude: number; confidence: number; district?: string; state?: string } | null> {
  try {
    const prompt = `You are the Master Geospatial Engine for HillyTrip in North-East India (Darjeeling, Sikkim, Kalimpong, Dooars, Himalayan region).
Determine accurate latitude and longitude for the following location entity:
- Name: "${record.entity_name}"
- Entity Type: "${record.entity_type}"
- Category: "${record.category || 'N/A'}"
- Village/Town: "${record.village || record.town || 'N/A'}"
- District: "${record.district || 'Darjeeling'}"
- State: "${record.state || 'West Bengal'}"
- Country: "${record.country || 'India'}"

Respond strictly with a JSON object. Ensure coordinates are inside the actual mountain/district boundaries in North-East India.`;

    const responseText = await executeGeminiOperation(async (ai) => {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER },
              district: { type: Type.STRING },
              state: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER, description: "Score from 0 to 100" }
            },
            required: ['latitude', 'longitude', 'confidenceScore']
          }
        }
      });
      return resp.text || '';
    });

    if (!responseText) return null;
    const parsed = JSON.parse(responseText.trim());

    if (isValidCoordinate(parsed.latitude, parsed.longitude)) {
      const conf = Math.min(95, Math.max(50, Number(parsed.confidenceScore) || 85));
      return {
        latitude: Number(parsed.latitude),
        longitude: Number(parsed.longitude),
        confidence: conf,
        district: parsed.district,
        state: parsed.state
      };
    }
  } catch (err) {
    // AI Fallback
  }
  return null;
}

// ==========================================
// PROCESS SINGLE RECORD
// ==========================================

export async function processSingleMasterGeocode(id: string): Promise<MasterGeocode> {
  const record = masterGeocodes.get(id);
  if (!record) throw new Error(`MasterGeocode record ${id} not found.`);

  const startTime = Date.now();
  const prevLat = record.latitude;
  const prevLng = record.longitude;

  // Rule: Do not overwrite verified coordinates
  if (record.verified && isValidCoordinate(record.latitude, record.longitude)) {
    return record;
  }

  record.geocode_status = 'processing';
  record.last_checked_at = new Date().toISOString();
  masterGeocodes.set(record.id, record);

  let newLat: number | null = null;
  let newLng: number | null = null;
  let source: GeocodeSource = 'osm_nominatim';
  let confidence = 0;
  let failureReason: string | null = null;

  // 1. Try Deduplication Cache
  const dedup = tryDeduplicationLookup(record);
  if (dedup) {
    newLat = dedup.latitude;
    newLng = dedup.longitude;
    source = 'cached_dedup';
    confidence = dedup.confidence;
  } else {
    // Search Query Builder
    const queryParts = [record.entity_name];
    if (record.village) queryParts.push(record.village);
    if (record.district) queryParts.push(record.district);
    if (record.state) queryParts.push(record.state);
    queryParts.push('India');
    const searchQuery = queryParts.join(', ');

    // 2. Try OSM / Nominatim
    const osm = await tryOSMNominatimGeocoding(searchQuery);
    if (osm) {
      newLat = osm.latitude;
      newLng = osm.longitude;
      source = 'osm_nominatim';
      confidence = osm.confidence;
    } else {
      // 3. Try Google Geocoding
      const google = await tryGoogleGeocoding(searchQuery);
      if (google) {
        newLat = google.latitude;
        newLng = google.longitude;
        source = 'google_geocoding';
        confidence = google.confidence;
      } else {
        // 4. Try Gemini AI
        const ai = await tryGeminiAIGeocoding(record);
        if (ai) {
          newLat = ai.latitude;
          newLng = ai.longitude;
          source = 'gemini_ai';
          confidence = ai.confidence;
          if (ai.district && !record.district) record.district = ai.district;
          if (ai.state && !record.state) record.state = ai.state;
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;
  const now = new Date().toISOString();

  // STRICT VALIDATION RULES
  if (newLat !== null && newLng !== null && isValidCoordinate(newLat, newLng)) {
    if (confidence >= 80) {
      record.latitude = Number(newLat.toFixed(6));
      record.longitude = Number(newLng.toFixed(6));
      record.geocode_status = 'approved';
      record.geocode_source = source;
      record.confidence_score = confidence;
      record.geocoded_at = now;
      record.updated_at = now;
      record.error_reason = null;
      if (confidence >= 95) record.verified = true;

      // SYNC BACK TO PLATFORM ENTITY STORE
      syncMasterGeocodeBackToEntity(record);
    } else {
      record.geocode_status = 'review';
      record.confidence_score = confidence;
      record.error_reason = `Confidence score (${confidence}) below threshold 80. Flagged for review.`;
      record.updated_at = now;
    }
  } else {
    record.retry_count++;
    if (record.retry_count >= 4) {
      record.geocode_status = 'review';
      record.error_reason = `Max retries (${record.retry_count}) exceeded. Human verification needed.`;
    } else {
      record.geocode_status = 'failed';
      record.error_reason = 'Unable to resolve valid geographical coordinates from active engines.';
    }
    record.updated_at = now;
  }

  masterGeocodes.set(record.id, record);

  // LOG AUDIT
  const auditLog: MasterGeocodeAuditLog = {
    id: `log_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`,
    geocode_id: record.id,
    entity_type: record.entity_type,
    entity_id: record.entity_id,
    entity_name: record.entity_name,
    previous_latitude: prevLat,
    previous_longitude: prevLng,
    new_latitude: record.latitude,
    new_longitude: record.longitude,
    source: source,
    confidence: record.confidence_score,
    processing_duration_ms: durationMs,
    retry_count: record.retry_count,
    status: record.geocode_status,
    failure_reason: record.error_reason,
    timestamp: now
  };
  auditLogs.unshift(auditLog);
  if (auditLogs.length > 500) auditLogs.pop();

  return record;
}

// Automatically sync approved master geocode coordinates back to dbStore collections
export function syncMasterGeocodeBackToEntity(record: MasterGeocode) {
  if (record.geocode_status !== 'approved' || record.latitude === null || record.longitude === null) return;

  const lat = record.latitude;
  const lng = record.longitude;

  if (record.entity_type === 'destination') {
    const list = dbStore.getDestinations() || [];
    const found = list.find(d => d.id === record.entity_id);
    if (found) {
      found.latitude = lat;
      found.longitude = lng;
      if (record.district) found.district = record.district;
      if (record.state) found.state = record.state;
    }
  } else if (record.entity_type === 'attraction') {
    const list = dbStore.getAttractions() || [];
    const found = list.find(a => a.id === record.entity_id);
    if (found) {
      found.latitude = lat;
      found.longitude = lng;
      if (record.district) found.district = record.district;
      if (record.state) found.state = record.state;
    }
  } else if (record.entity_type === 'homestay') {
    const list = dbStore.getHomestays() || [];
    const found = list.find(h => h.id === record.entity_id);
    if (found) {
      found.latitude = lat;
      found.longitude = lng;
      if (record.district) found.district = record.district;
      if (record.state) found.state = record.state;
    }
  } else if (record.entity_type === 'taxi_stand' || record.entity_type === 'hub') {
    const list = dbStore.getHubs() || [];
    const found = list.find(hb => hb.id === record.entity_id);
    if (found) {
      found.latitude = lat;
      found.longitude = lng;
      if (record.district) found.district = record.district;
      if (record.state) found.state = record.state;
    }
  }
}

// ==========================================
// BATCH PROCESSOR & RETRY SCHEDULER
// ==========================================

export async function processGeocodingBatch(batchSize: number = 30): Promise<GeocodingBatchStats> {
  const startTime = Date.now();
  syncAllPlatformEntitiesToMasterGeocodes();

  const nowMs = Date.now();
  const eligibleQueue: MasterGeocode[] = [];

  for (const record of masterGeocodes.values()) {
    if (record.verified && isValidCoordinate(record.latitude, record.longitude)) continue;

    if (record.geocode_status === 'pending') {
      eligibleQueue.push(record);
    } else if (record.geocode_status === 'failed') {
      const lastCheckMs = record.last_checked_at ? new Date(record.last_checked_at).getTime() : 0;
      const delayNeeded = getRetryDelayMs(record.retry_count);
      if (nowMs - lastCheckMs >= delayNeeded && record.retry_count < 4) {
        eligibleQueue.push(record);
      }
    }
  }

  const batch = eligibleQueue.slice(0, batchSize);
  let approvedCount = 0;
  let reviewCount = 0;
  let failedCount = 0;
  let dedupHits = 0;
  let totalConf = 0;

  for (const rec of batch) {
    try {
      const updated = await processSingleMasterGeocode(rec.id);
      totalConf += updated.confidence_score;

      if (updated.geocode_status === 'approved') approvedCount++;
      else if (updated.geocode_status === 'review') reviewCount++;
      else failedCount++;

      if (updated.geocode_source === 'cached_dedup') dedupHits++;
    } catch (e) {
      failedCount++;
    }
  }

  const durationMs = Date.now() - startTime;
  const stats: GeocodingBatchStats = {
    totalInQueue: masterGeocodes.size,
    processedInBatch: batch.length,
    approvedCount,
    reviewCount,
    failedCount,
    dedupHits,
    avgConfidence: batch.length > 0 ? Math.round(totalConf / batch.length) : 0,
    processingTimeMs: durationMs,
    timestamp: new Date().toISOString()
  };

  if (reviewCount > 0 || failedCount > 0) {
    notifications.unshift({
      id: `notif_${Date.now()}`,
      title: 'Geocoding Batch Review Needed',
      message: `Processed ${batch.length} locations. ${approvedCount} approved, ${reviewCount} marked for manual review, ${failedCount} failed.`,
      type: 'review_required',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  return stats;
}

// Nightly Automation Schedule Entry point
export async function runNightlyGeocodingJob(): Promise<GeocodingBatchStats> {
  console.log('[NightlyGeocodingJob] Starting autonomous batch run...');
  const stats = await processGeocodingBatch(100);
  console.log(`[NightlyGeocodingJob] Completed. Approved: ${stats.approvedCount}, Review: ${stats.reviewCount}, Failed: ${stats.failedCount}`);
  return stats;
}

// ==========================================
// MANUAL OVERRIDE & MANAGEMENT APIs
// ==========================================

export function manualOverrideMasterGeocode(
  id: string,
  latitude: number,
  longitude: number,
  verified: boolean = true,
  notes?: string
): MasterGeocode {
  const record = masterGeocodes.get(id);
  if (!record) throw new Error(`Record ${id} not found.`);

  if (!isValidCoordinate(latitude, longitude)) {
    throw new Error('Invalid coordinates supplied for override.');
  }

  const prevLat = record.latitude;
  const prevLng = record.longitude;
  const now = new Date().toISOString();

  record.latitude = Number(latitude.toFixed(6));
  record.longitude = Number(longitude.toFixed(6));
  record.geocode_status = 'approved';
  record.geocode_source = 'manual_override';
  record.confidence_score = 100;
  record.verified = verified;
  record.error_reason = notes || 'Manually verified by Administrator';
  record.updated_at = now;
  record.geocoded_at = now;

  masterGeocodes.set(record.id, record);

  // Sync back immediately
  syncMasterGeocodeBackToEntity(record);

  // Audit
  auditLogs.unshift({
    id: `log_override_${Date.now()}`,
    geocode_id: record.id,
    entity_type: record.entity_type,
    entity_id: record.entity_id,
    entity_name: record.entity_name,
    previous_latitude: prevLat,
    previous_longitude: prevLng,
    new_latitude: record.latitude,
    new_longitude: record.longitude,
    source: 'manual_override',
    confidence: 100,
    processing_duration_ms: 0,
    retry_count: record.retry_count,
    status: 'approved',
    failure_reason: notes || 'Manual Override',
    timestamp: now
  });

  return record;
}

export function getAllMasterGeocodes(filter?: {
  status?: string;
  entityType?: string;
  search?: string;
  verifiedOnly?: boolean;
}): MasterGeocode[] {
  // Ensure sync first
  if (masterGeocodes.size === 0) {
    syncAllPlatformEntitiesToMasterGeocodes();
  }

  let list = Array.from(masterGeocodes.values());

  if (filter?.status && filter.status !== 'all') {
    list = list.filter(r => r.geocode_status === filter.status);
  }
  if (filter?.entityType && filter.entityType !== 'all') {
    list = list.filter(r => r.entity_type === filter.entityType);
  }
  if (filter?.verifiedOnly) {
    list = list.filter(r => r.verified);
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(r =>
      r.entity_name.toLowerCase().includes(q) ||
      (r.district && r.district.toLowerCase().includes(q)) ||
      (r.entity_id && r.entity_id.toLowerCase().includes(q))
    );
  }

  return list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function getMasterGeocodesStats() {
  if (masterGeocodes.size === 0) {
    syncAllPlatformEntitiesToMasterGeocodes();
  }

  const list = Array.from(masterGeocodes.values());
  const total = list.length;
  const approved = list.filter(r => r.geocode_status === 'approved').length;
  const pending = list.filter(r => r.geocode_status === 'pending').length;
  const review = list.filter(r => r.geocode_status === 'review').length;
  const failed = list.filter(r => r.geocode_status === 'failed').length;
  const verified = list.filter(r => r.verified).length;

  const dedupHits = list.filter(r => r.geocode_source === 'cached_dedup').length;
  const totalConf = list.reduce((acc, r) => acc + (r.confidence_score || 0), 0);
  const avgConfidence = total > 0 ? Math.round(totalConf / total) : 0;

  return {
    total,
    approved,
    pending,
    review,
    failed,
    verified,
    dedupHits,
    avgConfidence,
    notificationsCount: notifications.filter(n => !n.isRead).length
  };
}

export function getMasterGeocodeAuditLogs(limit: number = 100): MasterGeocodeAuditLog[] {
  return auditLogs.slice(0, limit);
}

export function getGeocodingNotifications(): GeocodingNotification[] {
  return notifications;
}

export function markNotificationAsRead(id: string) {
  const n = notifications.find(it => it.id === id);
  if (n) n.isRead = true;
}
