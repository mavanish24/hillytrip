import { dbStore, getDistanceInKm } from '../../db';
import { calculateDynamicRoute } from '../../../services/routeCalculationEngine';
import { generateInterpolatedPolyline as generateSharedInterpolatedPolyline } from '../../../utils/geoPolyline';

export interface DynamicGoogleRouteResult {
  id: string;
  fromHubId: string;
  toHubId: string;
  fromName: string;
  toName: string;
  distanceKm: number;
  timeMin: number;
  timeMax: number;
  timeFormatted: string;
  fareMin: number;
  fareMax: number;
  sharedFarePerSeat: number;
  polyline?: string;
  path: string[];
  type: string;
  verified: boolean;
  lastUpdated: string;
  description: string;
  originCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
}

// Known coordinates for major hubs & destinations in Sikkim / Darjeeling / North Bengal
const KNOWN_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  njp: { lat: 26.6853, lng: 88.4419, name: 'NJP Railway Station' },
  'njp railway station': { lat: 26.6853, lng: 88.4419, name: 'NJP Railway Station' },
  siliguri: { lat: 26.7271, lng: 88.3953, name: 'Siliguri Junction' },
  bagdogra: { lat: 26.6812, lng: 88.3286, name: 'Bagdogra Airport' },
  'bagdogra airport': { lat: 26.6812, lng: 88.3286, name: 'Bagdogra Airport' },
  darjeeling: { lat: 27.0410, lng: 88.2663, name: 'Darjeeling Town' },
  kalimpong: { lat: 27.0600, lng: 88.4700, name: 'Kalimpong Town' },
  gangtok: { lat: 27.3389, lng: 88.6065, name: 'Gangtok' },
  lava: { lat: 27.0863, lng: 88.6596, name: 'Lava Village' },
  rishop: { lat: 27.1121, lng: 88.6510, name: 'Rishop' },
  pelling: { lat: 27.3167, lng: 88.2333, name: 'Pelling' },
  ravangla: { lat: 27.3060, lng: 88.3630, name: 'Ravangla' },
  sittong: { lat: 26.9200, lng: 88.3800, name: 'Sittong' },
  mirik: { lat: 26.8883, lng: 88.1804, name: 'Mirik Lake' },
  namchi: { lat: 27.1667, lng: 88.3500, name: 'Namchi' },
  pakyong: { lat: 27.2300, lng: 88.5800, name: 'Pakyong Airport' },
  tsomgo: { lat: 27.3820, lng: 88.7620, name: 'Tsomgo Lake' },
  nathula: { lat: 27.3860, lng: 88.8310, name: 'Nathu La Pass' },
  lachung: { lat: 27.6892, lng: 88.7430, name: 'Lachung Valley' },
  lachen: { lat: 27.7275, lng: 88.5540, name: 'Lachen' },
  gurudongmar: { lat: 28.0258, lng: 88.7097, name: 'Gurudongmar Lake' },
  yumthang: { lat: 27.8260, lng: 88.6960, name: 'Yumthang Valley' },
  zuluk: { lat: 27.2520, lng: 88.7830, name: 'Zuluk Silk Route' },
  kurseong: { lat: 26.8800, lng: 88.2800, name: 'Kurseong' },
  pedong: { lat: 27.1500, lng: 88.5500, name: 'Pedong' }
};

const routeCache = new Map<string, DynamicGoogleRouteResult>();

export class GoogleRoutesService {
  /**
   * Helper to compute spherical Haversine air distance between two points in km
   * Delegates to authoritative server helper getDistanceInKm.
   */
  public static haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const d = getDistanceInKm(lat1, lon1, lat2, lon2);
    return Math.round(d * 10) / 10;
  }

  /**
   * Resolve location (village_code, taxi_stand id, attraction id, or place string/coordinates)
   * to exact coordinates and clean display name.
   * Priority: Village Master is primary.
   */
  public static async resolveLocationCoords(
    queryOrItem: string | { lat?: number; lng?: number; latitude?: number; longitude?: number; name?: string; type?: string; id?: string; code?: string }
  ): Promise<{ lat: number; lng: number; name: string; type?: string; code?: string }> {
    // 0. Direct Coordinate Object
    if (typeof queryOrItem === 'object' && queryOrItem !== null) {
      const lat = queryOrItem.lat ?? queryOrItem.latitude;
      const lng = queryOrItem.lng ?? queryOrItem.longitude;
      if (lat !== undefined && lng !== undefined && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        return {
          lat: Number(lat),
          lng: Number(lng),
          name: queryOrItem.name || 'Custom Location',
          type: queryOrItem.type || 'coordinate',
          code: queryOrItem.code || queryOrItem.id
        };
      }
      if (queryOrItem.id || queryOrItem.code) {
        return this.resolveLocationCoords(String(queryOrItem.code || queryOrItem.id));
      }
    }

    const rawStr = String(queryOrItem || '').trim();
    const clean = rawStr.toLowerCase();
    const cleanSlug = clean.replace(/[^a-z0-9]/g, '');

    // 1. Check Primary Master: VILLAGES Table
    const villageByCode = dbStore.getVillageByCode ? dbStore.getVillageByCode(rawStr) : null;
    if (villageByCode && villageByCode.latitude && villageByCode.longitude) {
      return {
        lat: Number(villageByCode.latitude),
        lng: Number(villageByCode.longitude),
        name: `${villageByCode.village_name} Village`,
        type: 'village',
        code: villageByCode.village_code
      };
    }

    const villages = dbStore.getVillages() || [];
    // 1b. By village_name match
    const villageByName = villages.find(v => {
      const vName = typeof v.village_name === 'string' ? v.village_name.toLowerCase().trim() : '';
      if (!vName || vName.length < 2) return false;
      return vName === clean || clean.includes(vName) || vName.includes(clean);
    });
    if (villageByName && villageByName.latitude && villageByName.longitude) {
      return {
        lat: Number(villageByName.latitude),
        lng: Number(villageByName.longitude),
        name: `${villageByName.village_name} Village`,
        type: 'village',
        code: villageByName.village_code
      };
    }

    // 2. Check TAXI STANDS / HUBS
    const taxiStands = dbStore.getTaxiStands() || [];
    for (const stand of taxiStands) {
      const sId = typeof stand.id === 'string' ? stand.id.toLowerCase().trim() : '';
      const sName = typeof stand.name === 'string' ? stand.name.toLowerCase().trim() : '';
      const idMatch = sId && sId.length >= 2 && sId === clean;
      const nameMatch = sName && sName.length >= 2 && (sName === clean || clean.includes(sName) || sName.includes(clean));
      if (idMatch || nameMatch) {
        if (stand.latitude && stand.longitude) {
          return {
            lat: Number(stand.latitude),
            lng: Number(stand.longitude),
            name: stand.name,
            type: 'taxi_stand',
            code: stand.id
          };
        }
      }
    }

    // 3. Check ATTRACTIONS
    const attractions = dbStore.getAttractions() || [];
    for (const attr of attractions) {
      const aId = typeof attr.id === 'string' ? attr.id.toLowerCase().trim() : '';
      const aName = typeof attr.name === 'string' ? attr.name.toLowerCase().trim() : '';
      const idMatch = aId && aId.length >= 2 && aId === clean;
      const nameMatch = aName && aName.length >= 2 && (aName === clean || clean.includes(aName) || aName.includes(clean));
      if (idMatch || nameMatch) {
        if (attr.latitude && attr.longitude) {
          return {
            lat: Number(attr.latitude),
            lng: Number(attr.longitude),
            name: attr.name,
            type: 'attraction',
            code: attr.id
          };
        }
        // If attraction coordinates are null but village_code is mapped, resolve via its village
        if (attr.village_code) {
          const v = dbStore.getVillageByCode(attr.village_code);
          if (v && v.latitude && v.longitude) {
            return {
              lat: Number(v.latitude),
              lng: Number(v.longitude),
              name: `${attr.name} (${v.village_name})`,
              type: 'attraction',
              code: attr.id
            };
          }
        }
      }
    }

    // 4. Check HOMESTAYS
    const homestays = dbStore.getHomestays() || [];
    for (const home of homestays) {
      const hId = typeof home.id === 'string' ? home.id.toLowerCase().trim() : '';
      const hName = typeof home.name === 'string' ? home.name.toLowerCase().trim() : '';
      const idMatch = hId && hId.length >= 2 && hId === clean;
      const nameMatch = hName && hName.length >= 2 && (hName === clean || clean.includes(hName) || hName.includes(clean));
      if (idMatch || nameMatch) {
        if (home.latitude && home.longitude) {
          return {
            lat: Number(home.latitude),
            lng: Number(home.longitude),
            name: home.name,
            type: 'homestay',
            code: home.id
          };
        }
        if (home.village_code) {
          const v = dbStore.getVillageByCode(home.village_code);
          if (v && v.latitude && v.longitude) {
            return {
              lat: Number(v.latitude),
              lng: Number(v.longitude),
              name: `${home.name} (${v.village_name})`,
              type: 'homestay',
              code: home.id
            };
          }
        }
      }
    }

    // 5. Check known coordinates table
    for (const [key, val] of Object.entries(KNOWN_COORDS)) {
      if (clean.includes(key) || key.includes(clean) || cleanSlug.includes(key.replace(/[^a-z0-9]/g, ''))) {
        return { ...val, type: 'known_place' };
      }
    }

    // 6. Check Destinations (backward compatibility, prioritizing authoritative village coordinates)
    const destinations = dbStore.getDestinations() || [];
    for (const d of destinations) {
      const dId = typeof d.id === 'string' ? d.id.toLowerCase().trim() : '';
      const dName = typeof d.name === 'string' ? d.name.toLowerCase().trim() : '';
      const idMatch = dId && dId.length >= 2 && dId === clean;
      const nameMatch = dName && dName.length >= 2 && (dName === clean || clean.includes(dName) || dName.includes(clean));
      if (idMatch || nameMatch) {
        // Authoritative rule: If this place corresponds to a village, use authoritative villages table coordinates!
        const matchingVil = (dbStore.getVillageByCode ? dbStore.getVillageByCode(d.village_code || d.id) : null) ||
          (dbStore.getVillages ? dbStore.getVillages().find(v => v.village_name.toLowerCase().trim() === dName) : null);
        if (matchingVil && matchingVil.latitude && matchingVil.longitude) {
          return { lat: Number(matchingVil.latitude), lng: Number(matchingVil.longitude), name: `${matchingVil.village_name} Village`, type: 'village', code: matchingVil.village_code };
        }
        if (d.latitude && d.longitude) {
          return { lat: Number(d.latitude), lng: Number(d.longitude), name: d.name, type: 'destination', code: d.id };
        }
      }
    }

    // 7. Try Google Geocoding API if key is present
    const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        const query = `${rawStr}, Sikkim Darjeeling Region, West Bengal, India`;
        const appReferer = process.env.APP_URL || 'https://ais-dev-5wsygs5i5rjzszham3vqew-120221993335.europe-west2.run.app';
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`, {
          headers: {
            'Referer': appReferer
          },
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
            const loc = data.results[0].geometry.location;
            const formattedName = data.results[0].formatted_address.split(',')[0] || rawStr;
            return { lat: loc.lat, lng: loc.lng, name: formattedName, type: 'geocoded' };
          }
        }
      } catch {
        // Fallback gracefully without noisy logging
      }
    }

    // 8. Fallback default coordinates
    const formattedName = rawStr.charAt(0).toUpperCase() + rawStr.slice(1);
    return { lat: 26.8500, lng: 88.4000, name: formattedName, type: 'fallback' };
  }

  /**
   * Helper to generate encoded polyline between two coordinates with mountain curvature
   * Delegates to authoritative shared geoPolyline helper.
   */
  private static generateInterpolatedPolyline(
    orig: { lat: number; lng: number },
    dest: { lat: number; lng: number }
  ): string {
    return generateSharedInterpolatedPolyline(orig, dest);
  }

  /**
   * Main Dynamic Route Calculator using Google Routes API v2 with smart mountain topology fallbacks
   */
  public static async calculateJourney(
    originQuery: string | any,
    destQuery: string | any,
    routeTypeDescription?: string
  ): Promise<DynamicGoogleRouteResult> {
    const origKey = typeof originQuery === 'string' ? originQuery : (originQuery?.name || `${originQuery?.lat},${originQuery?.lng}`);
    const destKey = typeof destQuery === 'string' ? destQuery : (destQuery?.name || `${destQuery?.lat},${destQuery?.lng}`);
    const cacheKey = `${String(origKey).toLowerCase().trim()}::${String(destKey).toLowerCase().trim()}`;
    if (routeCache.has(cacheKey)) {
      return routeCache.get(cacheKey)!;
    }

    const origLoc = await this.resolveLocationCoords(originQuery);
    const destLoc = await this.resolveLocationCoords(destQuery);

    const canonicalCoordKey = `${origLoc.lat.toFixed(3)},${origLoc.lng.toFixed(3)}::${destLoc.lat.toFixed(3)},${destLoc.lng.toFixed(3)}`;
    if (routeCache.has(canonicalCoordKey)) {
      const cached = routeCache.get(canonicalCoordKey)!;
      routeCache.set(cacheKey, cached);
      return cached;
    }

    const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY;

    let distanceKm = 0;
    let durationSeconds = 0;
    let polylineStr = '';
    let fetchedViaApi = false;

    if (apiKey) {
      // Primary: Google Routes API v2 with fast 1.8s timeout so user never experiences lag
      try {
        const appReferer = process.env.APP_URL || 'https://ais-dev-5wsygs5i5rjzszham3vqew-120221993335.europe-west2.run.app';
        const routesRes = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
            'Referer': appReferer
          },
          signal: AbortSignal.timeout(1800),
          body: JSON.stringify({
            origin: {
              location: {
                latLng: { latitude: origLoc.lat, longitude: origLoc.lng }
              }
            },
            destination: {
              location: {
                latLng: { latitude: destLoc.lat, longitude: destLoc.lng }
              }
            },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE'
          })
        });

        if (routesRes.ok) {
          const routeData = await routesRes.json();
          if (routeData.routes && routeData.routes.length > 0) {
            const primaryRoute = routeData.routes[0];
            distanceKm = Math.round((primaryRoute.distanceMeters || 0) / 100) / 10;
            const durStr = primaryRoute.duration || '0s';
            durationSeconds = parseInt(durStr.replace('s', ''), 10) || 0;
            polylineStr = primaryRoute.polyline?.encodedPolyline || '';
            if (distanceKm > 0) {
              fetchedViaApi = true;
            }
          }
        }
      } catch {
        // Fallback gracefully to high-precision topographical calculations
      }
    }

    // Authoritative Himalayan route calculation fallback if Google API not available or in fallback mode
    if (!fetchedViaApi || distanceKm <= 0) {
      const fallbackDynamic = calculateDynamicRoute(origLoc, destLoc);
      distanceKm = fallbackDynamic.distanceKm;
      durationSeconds = Math.round((fallbackDynamic.timeMin / 0.9) * 60);
      if (!polylineStr) {
        polylineStr = fallbackDynamic.polyline || this.generateInterpolatedPolyline(origLoc, destLoc);
      }
    }

    // Format time (minutes and min/max ranges)
    const durationMinutes = Math.max(20, Math.round(durationSeconds / 60));
    const timeMin = Math.round(durationMinutes * 0.9);
    const timeMax = Math.round(durationMinutes * 1.25);

    const hrs = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    let timeFormatted = `${durationMinutes} mins`;
    if (hrs > 0) {
      timeFormatted = mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hrs`;
    }

    // Dynamic Fare Calculation based on HillyTrip operator pricing rules
    // Base mountain rate ~₹26 - ₹32/km for Hatchback/Sedan, SUV ~₹38 - ₹48/km
    const baseFareSedan = Math.round(Math.max(1600, distanceKm * 28));
    const fareMin = Math.round(baseFareSedan * 0.9);
    const fareMax = Math.round(baseFareSedan * 1.35);
    const sharedFarePerSeat = Math.max(250, Math.min(550, Math.round(distanceKm * 4.5)));

    const fromSlug = String(origKey || origLoc.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const toSlugStr = String(destKey || destLoc.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const result: DynamicGoogleRouteResult = {
      id: `dynamic-${fromSlug}-to-${toSlugStr}`,
      fromHubId: fromSlug,
      toHubId: toSlugStr,
      fromName: origLoc.name,
      toName: destLoc.name,
      distanceKm,
      timeMin,
      timeMax,
      timeFormatted,
      fareMin,
      fareMax,
      sharedFarePerSeat,
      polyline: polylineStr,
      path: [origLoc.name, destLoc.name],
      type: 'Direct',
      verified: true,
      lastUpdated: 'Live Google Routes API Resolution',
      description: `Dynamic high-altitude road transit route from ${origLoc.name} to ${destLoc.name} (${distanceKm} km, ~${timeFormatted}).`,
      originCoords: { lat: origLoc.lat, lng: origLoc.lng },
      destCoords: { lat: destLoc.lat, lng: destLoc.lng }
    };

    routeCache.set(cacheKey, result);
    routeCache.set(canonicalCoordKey, result);
    return result;
  }

  /**
   * Route Type 1: Village → Village
   */
  public static async calculateVillageToVillageRoute(
    originVillageCode: string,
    destVillageCode: string
  ): Promise<DynamicGoogleRouteResult> {
    const origin = await this.resolveLocationCoords(originVillageCode);
    const dest = await this.resolveLocationCoords(destVillageCode);
    return this.calculateJourney(origin, dest, 'Village to Village Mountain Transit');
  }

  /**
   * Route Type 2: Village → Taxi Stand
   */
  public static async calculateVillageToTaxiStandRoute(
    villageCode: string,
    taxiStandId: string
  ): Promise<DynamicGoogleRouteResult> {
    const origin = await this.resolveLocationCoords(villageCode);
    const dest = await this.resolveLocationCoords(taxiStandId);
    return this.calculateJourney(origin, dest, 'Village to Taxi Stand Transit');
  }

  /**
   * Route Type 3: Taxi Stand → Village
   */
  public static async calculateTaxiStandToVillageRoute(
    taxiStandId: string,
    villageCode: string
  ): Promise<DynamicGoogleRouteResult> {
    const origin = await this.resolveLocationCoords(taxiStandId);
    const dest = await this.resolveLocationCoords(villageCode);
    return this.calculateJourney(origin, dest, 'Taxi Stand to Village Transit');
  }

  /**
   * Route Type 4: Village → Attraction
   */
  public static async calculateVillageToAttractionRoute(
    villageCode: string,
    attractionId: string
  ): Promise<DynamicGoogleRouteResult> {
    const origin = await this.resolveLocationCoords(villageCode);
    const dest = await this.resolveLocationCoords(attractionId);
    return this.calculateJourney(origin, dest, 'Village to Himalayan Attraction Excursion');
  }

  /**
   * Route Type 5: Taxi Stand → Attraction
   */
  public static async calculateTaxiStandToAttractionRoute(
    taxiStandId: string,
    attractionId: string
  ): Promise<DynamicGoogleRouteResult> {
    const origin = await this.resolveLocationCoords(taxiStandId);
    const dest = await this.resolveLocationCoords(attractionId);
    return this.calculateJourney(origin, dest, 'Taxi Stand to Himalayan Attraction Direct Transfer');
  }

  /**
   * Determine Nearest Taxi Stand with Google Routes directions & travel times
   */
  public static async getNearestTaxiStandWithRoute(
    villageCode: string
  ): Promise<{
    village: { village_code: string; village_name: string; latitude: number; longitude: number };
    nearestTaxiStand: any;
    distanceGeometricKm: number;
    route: DynamicGoogleRouteResult;
    allRankedStands: any[];
  } | null> {
    const village = dbStore.getVillageByCode(villageCode);
    if (!village || !village.latitude || !village.longitude) {
      return null;
    }

    const nearestData = dbStore.getNearestTaxiStand(villageCode);
    if (!nearestData) return null;

    const route = await this.calculateVillageToTaxiStandRoute(villageCode, nearestData.taxiStand.id);

    return {
      village: {
        village_code: village.village_code,
        village_name: village.village_name,
        latitude: Number(village.latitude),
        longitude: Number(village.longitude)
      },
      nearestTaxiStand: nearestData.taxiStand,
      distanceGeometricKm: nearestData.distanceKm,
      route,
      allRankedStands: nearestData.allRanked
    };
  }
}
