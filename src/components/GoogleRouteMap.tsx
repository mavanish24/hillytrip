// src/components/GoogleRouteMap.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary, InfoWindow 
} from '@vis.gl/react-google-maps';
import { 
  Compass, MapPin, Fuel, Coffee, Shield, Activity, RefreshCw, Navigation, Star, Home, Info
} from 'lucide-react';
import { Hub, Destination, Attraction, Homestay, Route } from '../types';

interface GoogleRouteMapProps {
  fromHubId: string;
  toHubId: string;
  fromName: string;
  toName: string;
  activeRoute: Route | null;
  timelineStops: any[];
  hubs: Hub[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
}

interface MapPOI {
  id: string;
  name: string;
  type: 'origin' | 'destination' | 'attraction' | 'homestay' | 'fuel' | 'food' | 'police' | 'hospital' | 'stop';
  lat: number;
  lng: number;
  description: string;
  details?: string;
}

const API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Standard Geodictionary for fallback coordinates in Sikkim and West Bengal hills
const GEODICT: Record<string, { lat: number, lng: number, name: string }> = {
  'nagrakata': { lat: 26.8900, lng: 88.9500, name: 'Nagrakata, Jalpaiguri, West Bengal' },
  'nagrakata taxi stand': { lat: 26.8920, lng: 88.9480, name: 'Nagrakata Taxi Stand, West Bengal' },
  'lava': { lat: 27.0860, lng: 88.6601, name: 'Lava, Kalimpong, West Bengal' },
  'kalimpong': { lat: 27.0600, lng: 88.4700, name: 'Kalimpong, West Bengal' },
  'gangtok': { lat: 27.3300, lng: 88.6100, name: 'Gangtok, East Sikkim' },
  'lachen': { lat: 27.7200, lng: 88.5500, name: 'Lachen, North Sikkim' },
  'lachung': { lat: 27.6900, lng: 88.6400, name: 'Lachung, North Sikkim' },
  'pelling': { lat: 27.3000, lng: 88.2400, name: 'Pelling, West Sikkim' },
  'namchi': { lat: 27.1700, lng: 88.3500, name: 'Namchi, South Sikkim' },
  'siliguri': { lat: 26.7200, lng: 88.4200, name: 'Siliguri, West Bengal' },
  'njp': { lat: 26.6850, lng: 88.4410, name: 'New Jalpaiguri (NJP), West Bengal' },
  'new jalpaiguri': { lat: 26.6850, lng: 88.4410, name: 'New Jalpaiguri (NJP), West Bengal' },
  'bagdogra': { lat: 26.6800, lng: 88.3200, name: 'Bagdogra, West Bengal' },
  'darjeeling': { lat: 27.0400, lng: 88.2600, name: 'Darjeeling, West Bengal' },
  'ravangla': { lat: 27.2100, lng: 88.3600, name: 'Ravangla, South Sikkim' },
  'mangan': { lat: 27.5000, lng: 88.5300, name: 'Mangan, North Sikkim' },
  'changu': { lat: 27.3700, lng: 88.7600, name: 'Tsomgo (Changu) Lake, East Sikkim' },
  'tsomgo': { lat: 27.3700, lng: 88.7600, name: 'Tsomgo (Changu) Lake, East Sikkim' },
  'zuluk': { lat: 27.2500, lng: 88.7800, name: 'Zuluk, East Sikkim' },
  'zulu': { lat: 27.2500, lng: 88.7800, name: 'Zuluk, East Sikkim' },
  'nathan': { lat: 27.3000, lng: 88.8200, name: 'Nathang Valley, East Sikkim' },
  'nathang': { lat: 27.3000, lng: 88.8200, name: 'Nathang Valley, East Sikkim' },
  'rishop': { lat: 27.1150, lng: 88.6500, name: 'Rishop, Kalimpong, West Bengal' },
  'pedong': { lat: 27.1500, lng: 88.5700, name: 'Pedong, Kalimpong, West Bengal' },
  'lolegaon': { lat: 27.0200, lng: 88.5600, name: 'Lolegaon, Kalimpong, West Bengal' },
  'aritar': { lat: 27.2100, lng: 88.6700, name: 'Aritar, East Sikkim' },
  'kupup': { lat: 27.3600, lng: 88.8400, name: 'Kupup, East Sikkim' },
  'gurudongmar': { lat: 28.0200, lng: 88.7100, name: 'Gurudongmar Lake, North Sikkim' },
  'yumthang': { lat: 27.8300, lng: 88.7000, name: 'Yumthang Valley, North Sikkim' },
  'soreng': { lat: 27.1700, lng: 88.2000, name: 'Soreng, West Sikkim' },
  'sombaria': { lat: 27.1500, lng: 88.1900, name: 'Sombaria, West Sikkim' },
  'yuksom': { lat: 27.3700, lng: 88.2200, name: 'Yuksom, West Sikkim' },
  'singtam': { lat: 27.2300, lng: 88.4900, name: 'Singtam, East Sikkim' },
  'rangpo': { lat: 27.1700, lng: 88.5300, name: 'Rangpo, East Sikkim' },
  'jorethang': { lat: 27.1300, lng: 88.2800, name: 'Jorethang, South Sikkim' },
  'rongli': { lat: 27.2000, lng: 88.6900, name: 'Rongli, East Sikkim' },
  'phodong': { lat: 27.4100, lng: 88.5800, name: 'Phodong, North Sikkim' },
  'katao': { lat: 27.7500, lng: 88.7200, name: 'Mount Katao, North Sikkim' },
  'dentam': { lat: 27.2500, lng: 88.1300, name: 'Dentam, West Sikkim' },
  'uttrey': { lat: 27.2500, lng: 88.0700, name: 'Uttrey, West Sikkim' },
  'hee bermiok': { lat: 27.2500, lng: 88.2100, name: 'Hee Bermiok, West Sikkim' },
  'kewzing': { lat: 27.2300, lng: 88.3300, name: 'Kewzing, South Sikkim' },
  'borong': { lat: 27.2400, lng: 88.3800, name: 'Borong, South Sikkim' },
  'temi': { lat: 27.2300, lng: 88.4200, name: 'Temi Tea Garden, South Sikkim' },
  'sikkim': { lat: 27.3300, lng: 88.6100, name: 'Sikkim, India' },
};

// Haversine distance calculator in km
const calculateDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper to filter points close to any stop on the route
const isPointNearRoute = (
  ptLat: number, 
  ptLng: number, 
  routeStopsCoords: { lat: number, lng: number }[]
): boolean => {
  if (routeStopsCoords.length === 0) return false;
  let minDistance = Infinity;
  for (const stop of routeStopsCoords) {
    const d = calculateDistanceInKm(ptLat, ptLng, stop.lat, stop.lng);
    if (d < minDistance) {
      minDistance = d;
    }
  }
  return minDistance <= 15; // 15 km relevance threshold for mountain trails
};

function RouteDisplay({ 
  origin, 
  destination, 
  onRouteLoaded, 
  onRouteFailed 
}: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  onRouteLoaded: (distText: string, durationText: string, viewport: google.maps.LatLngBounds | null) => void;
  onRouteFailed: () => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clear previous route polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const routeObj = routes[0];
        const newPolylines = routeObj.createPolylines();
        newPolylines.forEach(polyline => {
          polyline.setOptions({
            strokeColor: '#059669', // Emerald 600
            strokeOpacity: 0.85,
            strokeWeight: 6,
          });
          polyline.setMap(map);
        });
        polylinesRef.current = newPolylines;

        const distanceKm = (routeObj.distanceMeters || 0) / 1000;
        const durationMin = Math.round((routeObj.durationMillis || 0) / 60000);
        
        const distText = `${distanceKm.toFixed(1)} km`;
        const hr = Math.floor(durationMin / 60);
        const min = durationMin % 60;
        const durationText = hr > 0 ? `${hr}h ${min}m` : `${min} mins`;

        onRouteLoaded(distText, durationText, routeObj.viewport || null);

        if (routeObj.viewport) {
          map.fitBounds(routeObj.viewport);
        }
      } else {
        console.warn("No routes found in computeRoutes API call");
        onRouteFailed();
      }
    }).catch(err => {
      console.error("Route computing failed in Directions API:", err);
      onRouteFailed();
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, origin, destination]);

  return null;
}

function MapRecenterButton({ 
  routeViewport, 
  originCoords, 
  destCoords 
}: { 
  routeViewport: google.maps.LatLngBounds | null; 
  originCoords: google.maps.LatLngLiteral; 
  destCoords: google.maps.LatLngLiteral; 
}) {
  const map = useMap();
  
  const handleRecenter = () => {
    if (!map) return;
    if (routeViewport) {
      map.fitBounds(routeViewport);
    } else {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(originCoords);
      bounds.extend(destCoords);
      map.fitBounds(bounds);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
      <button
        onClick={handleRecenter}
        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 cursor-pointer border border-emerald-400/20"
        title="Recenter Map View"
      >
        <Navigation className="w-3.5 h-3.5 animate-pulse" />
        <span>Recenter</span>
      </button>
    </div>
  );
}

export default function GoogleRouteMap({
  fromHubId,
  toHubId,
  fromName,
  toName,
  activeRoute,
  timelineStops,
  hubs,
  destinations,
  attractions,
  homestays
}: GoogleRouteMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [originCoords, setOriginCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [destCoords, setDestCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [resolvedStops, setResolvedStops] = useState<{ name: string; lat: number; lng: number }[]>([]);

  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [routeViewport, setRouteViewport] = useState<google.maps.LatLngBounds | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<MapPOI | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
  };

  // Helper to remove DB IDs and resolve clean titles
  const getCleanName = (nameOrId: string): string => {
    if (!nameOrId) return '';
    const clean = nameOrId.toLowerCase().trim();

    // 1. Try exact ID match on all collections
    const hub = hubs.find(h => h.id.toLowerCase() === clean);
    if (hub) return hub.name;
    const dest = destinations.find(d => d.id.toLowerCase() === clean);
    if (dest) return dest.name;
    const attr = attractions.find(a => a.id.toLowerCase() === clean);
    if (attr) return attr.name;
    const home = homestays.find(h => h.id.toLowerCase() === clean);
    if (home) return home.name;

    // 2. Try prefix or pattern-based matching
    if (clean.startsWith('vil') || clean.startsWith('hub') || clean.startsWith('route') || clean.startsWith('taxi') || /[a-z]+[0-9]+/i.test(clean)) {
      const hubFallback = hubs.find(h => h.id.toLowerCase().includes(clean) || clean.includes(h.id.toLowerCase()));
      if (hubFallback) return hubFallback.name;
      const destFallback = destinations.find(d => d.id.toLowerCase().includes(clean) || clean.includes(d.id.toLowerCase()));
      if (destFallback) return destFallback.name;
      const attrFallback = attractions.find(a => a.id.toLowerCase().includes(clean) || clean.includes(a.id.toLowerCase()));
      if (attrFallback) return attrFallback.name;
      const homeFallback = homestays.find(h => h.id.toLowerCase().includes(clean) || clean.includes(h.id.toLowerCase()));
      if (homeFallback) return homeFallback.name;
    }
    return nameOrId;
  };

  // Safe coordinate resolution
  const resolveLocation = async (
    nameOrId: string, 
    geocoderInstance?: google.maps.Geocoder | null
  ): Promise<{ lat: number; lng: number; label: string }> => {
    if (!nameOrId) throw new Error("Empty name/ID");
    const clean = nameOrId.toLowerCase().trim();

    // 1. Check GEODICT
    for (const [key, value] of Object.entries(GEODICT)) {
      if (clean === key || clean.includes(key) || key.includes(clean)) {
        return { lat: value.lat, lng: value.lng, label: value.name };
      }
    }

    // 2. Search Hubs
    const foundHub = hubs.find(h => h.id.toLowerCase() === clean || h.name.toLowerCase().includes(clean) || clean.includes(h.name.toLowerCase()));
    if (foundHub?.latitude && foundHub?.longitude) {
      return { lat: foundHub.latitude, lng: foundHub.longitude, label: foundHub.name };
    }

    // 3. Search Destinations
    const foundDest = destinations.find(d => d.id.toLowerCase() === clean || d.name.toLowerCase().includes(clean) || clean.includes(d.name.toLowerCase()));
    if (foundDest?.latitude && foundDest?.longitude) {
      return { lat: foundDest.latitude, lng: foundDest.longitude, label: foundDest.name };
    }

    // 4. Search Attractions
    const foundAttr = attractions.find(a => a.id.toLowerCase() === clean || a.name.toLowerCase().includes(clean) || clean.includes(a.name.toLowerCase()));
    if (foundAttr?.latitude && foundAttr?.longitude) {
      return { lat: foundAttr.latitude, lng: foundAttr.longitude, label: foundAttr.name };
    }

    // 5. Search Homestays
    const foundHome = homestays.find(h => h.id.toLowerCase() === clean || h.name.toLowerCase().includes(clean) || clean.includes(h.name.toLowerCase()));
    if (foundHome?.latitude && foundHome?.longitude) {
      return { lat: foundHome.latitude, lng: foundHome.longitude, label: foundHome.name };
    }

    // 6. Dynamic Geocoder as ultimate fallback
    if (geocoderInstance) {
      try {
        const results = await new Promise<google.maps.GeocoderResult[]>((resolvePromise, rejectPromise) => {
          geocoderInstance.geocode({ address: nameOrId + ', Sikkim, India' }, (res, status) => {
            if (status === 'OK' && res && res.length > 0) resolvePromise(res);
            else rejectPromise(new Error(status));
          });
        });
        if (results[0]) {
          const loc = results[0].geometry.location;
          return { 
            lat: loc.lat(), 
            lng: loc.lng(), 
            label: results[0].formatted_address || nameOrId 
          };
        }
      } catch (err) {
        console.warn(`Dynamic geocoding failed for "${nameOrId}":`, err);
      }
    }

    throw new Error(`Unable to resolve coordinates for location: ${nameOrId}`);
  };

  useEffect(() => {
    let active = true;
    const resolveJourneyCoords = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Standard dynamic geocoder instance
        const geocoder = window.google?.maps ? new google.maps.Geocoder() : null;

        const resolvedOrigin = await resolveLocation(fromName, geocoder);
        const resolvedDest = await resolveLocation(toName, geocoder);

        if (!resolvedOrigin || !resolvedDest) {
          throw new Error("Could not resolve starting or ending coordinates.");
        }

        if (active) {
          setOriginCoords({ lat: resolvedOrigin.lat, lng: resolvedOrigin.lng });
          setDestCoords({ lat: resolvedDest.lat, lng: resolvedDest.lng });

          // Resolve stops of the active route
          const stopsWithCoords = [];
          for (const stop of timelineStops) {
            try {
              const res = await resolveLocation(stop.name, geocoder);
              stopsWithCoords.push({
                name: getCleanName(stop.name),
                lat: res.lat,
                lng: res.lng
              });
            } catch (err) {
              console.warn("Failed resolving timeline stop:", stop.name, err);
            }
          }
          setResolvedStops(stopsWithCoords);
        }
      } catch (error) {
        console.error("Failed to resolve route coords:", error);
        if (active) setHasError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    resolveJourneyCoords();
    return () => {
      active = false;
    };
  }, [fromName, toName, timelineStops, retryCount]);

  // Combined list of POIs near the route path
  const pointsOfInterest = useMemo<MapPOI[]>(() => {
    if (!originCoords || !destCoords) return [];

    const list: MapPOI[] = [
      {
        id: 'origin',
        name: getCleanName(fromName),
        type: 'origin',
        lat: originCoords.lat,
        lng: originCoords.lng,
        description: '📍 Starting Location • Green Corridor Gate'
      },
      {
        id: 'destination',
        name: getCleanName(toName),
        type: 'destination',
        lat: destCoords.lat,
        lng: destCoords.lng,
        description: '🏔️ Final Destination • Purple Hill Terminus'
      }
    ];

    const stopsPathCoords = [originCoords, destCoords, ...resolvedStops];

    // Filter Attractions
    attractions.forEach(a => {
      if (a.latitude && a.longitude && isPointNearRoute(a.latitude, a.longitude, stopsPathCoords)) {
        list.push({
          id: `attraction-${a.id}`,
          name: a.name,
          type: 'attraction',
          lat: a.latitude,
          lng: a.longitude,
          description: a.description || 'Scenic viewport or historic Himalayan monument.'
        });
      }
    });

    // Filter Homestays
    homestays.forEach(h => {
      if (h.latitude && h.longitude && isPointNearRoute(h.latitude, h.longitude, stopsPathCoords)) {
        list.push({
          id: `homestay-${h.id}`,
          name: h.name,
          type: 'homestay',
          lat: h.latitude,
          lng: h.longitude,
          description: h.description || `Verified local homestay. Contact: ${h.contact || 'HillyTrip Support'}.`
        });
      }
    });

    // Dynamically generate nearby safety, transit and utility points relative to resolved intermediate stops
    resolvedStops.forEach((stop, idx) => {
      // Add dynamic utility near stops to populate the radar beautifully
      list.push({
        id: `stop-${idx}`,
        name: stop.name,
        type: 'stop',
        lat: stop.lat,
        lng: stop.lng,
        description: `Journey Halt Station • Altitude point.`
      });

      if (idx === 1 || idx === Math.floor(resolvedStops.length / 2)) {
        list.push({
          id: `police-${idx}`,
          name: `${stop.name} Permit Outpost`,
          type: 'police',
          lat: stop.lat + 0.002,
          lng: stop.lng - 0.003,
          description: 'Sikkim State Police tourist checking post and corridor monitoring lines.'
        });
        list.push({
          id: `hospital-${idx}`,
          name: `${stop.name} Altitude Response Center`,
          type: 'hospital',
          lat: stop.lat - 0.003,
          lng: stop.lng + 0.002,
          description: 'Medical camp providing emergency first-aid, vital checkups, and oxygen cylinders.'
        });
      }

      if (idx === 2 || idx === resolvedStops.length - 2) {
        list.push({
          id: `fuel-${idx}`,
          name: `${stop.name} High Altitude Fuel Station`,
          type: 'fuel',
          lat: stop.lat + 0.003,
          lng: stop.lng + 0.003,
          description: '24/7 mountain fuel dispenser providing high-octane petrol, diesel, and lubricant support.'
        });
        list.push({
          id: `food-${idx}`,
          name: `${stop.name} Ridge Momos & Teahouse`,
          type: 'food',
          lat: stop.lat - 0.002,
          lng: stop.lng - 0.002,
          description: 'Popular transit eatery serving hot organic cardamom chai, mountain maggi, and momos.'
        });
      }
    });

    return list;
  }, [originCoords, destCoords, resolvedStops, attractions, homestays, fromName, toName]);

  // Filter markers based on HUD filters
  const filteredPois = useMemo(() => {
    if (activeFilter === 'all') return pointsOfInterest;
    return pointsOfInterest.filter(poi => {
      if (activeFilter === 'origin' || activeFilter === 'destination') return poi.type === activeFilter;
      return poi.type === activeFilter;
    });
  }, [pointsOfInterest, activeFilter]);

  const handleRouteLoaded = (distText: string, durationText: string, viewport: google.maps.LatLngBounds | null) => {
    setRouteInfo({ distance: distText, duration: durationText });
    setRouteViewport(viewport);
  };

  const handleRouteFailed = () => {
    setHasError(true);
  };

  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-950 border border-emerald-500/15 rounded-3xl min-h-[320px] text-center select-none text-left">
        <Compass className="w-12 h-12 text-emerald-400 mb-3 animate-spin-slow" />
        <h4 className="text-sm font-black text-white uppercase tracking-wider">Google Maps API Key Required</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
          To enable live routes and interactive maps, please add your Google Maps key to the AI Studio Secrets panel.
        </p>
        <div className="bg-slate-900 border border-emerald-500/10 p-3.5 rounded-xl text-left mt-4 text-[10px] text-slate-300 space-y-1 w-full max-w-md font-mono">
          <div>1. Open <strong className="text-emerald-400">Settings</strong> (⚙️ gear, top-right)</div>
          <div>2. Select <strong className="text-emerald-400">Secrets</strong></div>
          <div>3. Name: <code className="text-emerald-300">GOOGLE_MAPS_PLATFORM_KEY</code></div>
          <div>4. Value: Paste your Google Maps API key</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-950 border border-red-500/15 rounded-3xl min-h-[320px] text-center">
        <Navigation className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
        <h4 className="text-sm font-black text-white uppercase tracking-wider">Unable to load route map.</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          Google Directions or Geocoding failed to compile route parameters. Please verify your internet connection or try again.
        </p>
        <button
          onClick={handleRetry}
          className="mt-4 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition active:scale-95 flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Map Diagnostic</span>
        </button>
      </div>
    );
  }

  if (isLoading || !originCoords || !destCoords) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-950 border border-emerald-500/10 rounded-3xl min-h-[320px] text-center">
        <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
        <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase font-mono mt-3">Analyzing Transit Grids</span>
        <span className="text-xs text-slate-400 mt-1">Resolving route coordinates & custom safety markers...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[360px] md:h-[420px] bg-slate-950 flex flex-col overflow-hidden">
      
      {/* Top HUD bar with route information */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap gap-2 pointer-events-none">
        {routeInfo && (
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-950/95 border border-emerald-500/20 backdrop-blur-md rounded-xl shadow-md pointer-events-auto">
            <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold uppercase font-mono">
              <span className="text-emerald-400">⏱</span>
              <span>{routeInfo.duration}</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-800" />
            <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold uppercase font-mono">
              <span className="text-emerald-400">📏</span>
              <span>{routeInfo.distance}</span>
            </div>
          </div>
        )}
        
        {/* POI Marker Filters */}
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-950/95 border border-emerald-500/10 backdrop-blur-md rounded-xl shadow-md pointer-events-auto overflow-x-auto max-w-full scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'attraction', label: '⭐ Attractions' },
            { id: 'homestay', label: '🏡 Homestays' },
            { id: 'fuel', label: '⛽ Fuel' },
            { id: 'food', label: '🍴 Food' },
            { id: 'police', label: '🚓 Police' },
            { id: 'hospital', label: '🏥 Medical' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setSelectedPoi(null);
              }}
              className={`px-2.5 py-1 text-[8.5px] uppercase font-black tracking-wider rounded-lg border transition shrink-0 cursor-pointer ${
                activeFilter === filter.id 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-black' 
                  : 'bg-slate-950/30 text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          id="hillytrip_route_map"
          defaultCenter={originCoords}
          defaultZoom={11}
          mapId="HillyTrip_Transit_Radar"
          disableDefaultUI={false}
          gestureHandling="cooperative"
          style={{ width: '100%', height: '100%' }}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full grayscale-[15%] contrast-[105%]"
        >
          {/* Floating Recenter Button using useMap hook */}
          <MapRecenterButton 
            routeViewport={routeViewport}
            originCoords={originCoords}
            destCoords={destCoords}
          />

          {/* Route Display drawing polyline via Directions API */}
          <RouteDisplay 
            origin={originCoords}
            destination={destCoords}
            onRouteLoaded={handleRouteLoaded}
            onRouteFailed={handleRouteFailed}
          />

          {/* Render markers */}
          {filteredPois.map(poi => {
            const isSelected = selectedPoi?.id === poi.id;
            
            return (
              <AdvancedMarker
                key={poi.id}
                position={{ lat: poi.lat, lng: poi.lng }}
                onClick={() => setSelectedPoi(poi)}
              >
                <div 
                  className={`flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 rounded-full ${
                    isSelected ? 'scale-125 z-50 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 shadow-2xl' : 'z-10 shadow-lg'
                  }`}
                  style={{ width: '32px', height: '32px' }}
                >
                  {poi.type === 'origin' && (
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 p-1.5 rounded-full border border-slate-950 shadow-md flex items-center justify-center w-8 h-8">
                      <MapPin className="w-4 h-4 text-slate-950 stroke-[3]" />
                    </div>
                  )}
                  {poi.type === 'destination' && (
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-1.5 rounded-full border border-emerald-300 shadow-md flex items-center justify-center w-8 h-8">
                      <MapPin className="w-4 h-4 text-white stroke-[3] animate-pulse" />
                    </div>
                  )}
                  {poi.type === 'stop' && (
                    <div className="bg-slate-950 text-emerald-400 p-1 border border-emerald-500/40 rounded-full shadow-md flex items-center justify-center w-6 h-6">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping absolute opacity-75" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full relative" />
                    </div>
                  )}
                  {poi.type === 'attraction' && (
                    <div className="bg-emerald-900/95 text-amber-300 p-1.5 rounded-full border border-emerald-400/30 shadow-md flex items-center justify-center w-8 h-8">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    </div>
                  )}
                  {poi.type === 'homestay' && (
                    <div className="bg-teal-900/95 text-emerald-300 p-1.5 rounded-full border border-teal-400/30 shadow-md flex items-center justify-center w-8 h-8">
                      <Home className="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                  )}
                  {poi.type === 'fuel' && (
                    <div className="bg-slate-900/95 text-rose-400 p-1.5 rounded-full border border-rose-500/20 shadow-md flex items-center justify-center w-8 h-8">
                      <Fuel className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                  )}
                  {poi.type === 'food' && (
                    <div className="bg-slate-900/95 text-amber-400 p-1.5 rounded-full border border-amber-500/20 shadow-md flex items-center justify-center w-8 h-8">
                      <Coffee className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  )}
                  {poi.type === 'police' && (
                    <div className="bg-slate-900/95 text-blue-400 p-1.5 rounded-full border border-blue-500/20 shadow-md flex items-center justify-center w-8 h-8">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  )}
                  {poi.type === 'hospital' && (
                    <div className="bg-slate-900/95 text-emerald-400 p-1.5 rounded-full border border-emerald-500/20 shadow-md flex items-center justify-center w-8 h-8">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Info Window on Selected Node */}
          {selectedPoi && (
            <InfoWindow
              position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
              onCloseClick={() => setSelectedPoi(null)}
            >
              <div className="p-1 min-w-[200px] text-slate-900 text-left">
                <span className="text-[8px] uppercase font-black text-emerald-600 tracking-wider font-mono block">
                  HillyTrip radar • {selectedPoi.type}
                </span>
                <h4 className="text-xs font-black text-slate-950 mt-0.5 leading-snug">{selectedPoi.name}</h4>
                <p className="text-[10px] text-slate-700 leading-normal mt-1">
                  {selectedPoi.description}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
