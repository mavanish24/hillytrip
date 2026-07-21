import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  MapPin, Compass, Navigation, Search, Sparkles, Car, Sliders, 
  Locate, Activity, CheckCircle2, ArrowRight, Eye, Info, HelpCircle,
  X, Clock, Star, Home, ArrowLeftRight, Mic, Calendar, BookOpen, Volume2,
  Bookmark, Check, ChevronDown, ChevronRight, Loader2, RefreshCw,
  Send, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Destination, Attraction, Homestay, Route, Hub } from '../types';

interface IntelligentRoutePlannerProps {
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  routes: Route[];
  setNotification?: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  hideHeader?: boolean;
}

interface TaxiStand {
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  district?: string;
  state?: string;
}

// Default beautiful stock Himalayan cover
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80';

// Haversine formula to calculate coordinate distance in Kms
export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
      lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 0;
  }
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const aClamped = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(aClamped), Math.sqrt(1 - aClamped));
  const res = R * c;
  return isNaN(res) ? 0 : res;
}

// Cardinal direction bearing string calculation
export function getBearingString(lat1: number, lon1: number, lat2: number, lon2: number): string {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
      lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return "N";
  }
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  
  let brng = Math.atan2(y, x);
  brng = (brng * 180) / Math.PI;
  brng = (brng + 360) % 360;
  
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(brng / 22.5) % 16;
  if (isNaN(index)) return "N";
  return directions[index] || "N";
}

// Hardcoded coordinate dictionary for aliases/future searchable items
const COORD_PRESETS: Record<string, { latitude: number; longitude: number; district?: string; state?: string }> = {
  "New Jalpaiguri Railway Station (NJP)": { latitude: 26.6811, longitude: 88.4418, district: "Jalpaiguri", state: "West Bengal" },
  "IXB Airport (Bagdogra)": { latitude: 26.6812, longitude: 88.3285, district: "Darjeeling", state: "West Bengal" },
  "Pakyong Airport": { latitude: 27.2272, longitude: 88.5878, district: "Pakyong", state: "Sikkim" },
  "Siliguri SNT Bus Stand": { latitude: 26.7161, longitude: 88.4312, district: "Darjeeling", state: "West Bengal" },
  "Darjeeling SNT Bus Terminus": { latitude: 27.0398, longitude: 88.2638, district: "Darjeeling", state: "West Bengal" },
  "Gangtok Deorali SNT Bus Stand": { latitude: 27.3201, longitude: 88.6085, district: "East Sikkim", state: "Sikkim" },
  "Sikkim Silk Route Expedition (5D/4N)": { latitude: 27.2045, longitude: 88.3639, district: "East Sikkim", state: "Sikkim" },
  "Majestic North Sikkim Adventure (3D/2N)": { latitude: 27.6892, longitude: 88.7431, district: "North Sikkim", state: "Sikkim" },
  "Darjeeling-Kalimpong Tea Retreat (4D/3N)": { latitude: 27.0398, longitude: 88.2638, district: "Darjeeling", state: "West Bengal" },
  "Local Food Guide: What to Eat in Darjeeling & Gangtok": { latitude: 27.0398, longitude: 88.2638, district: "Darjeeling", state: "West Bengal" },
  "Complete Trekking Guide to Sandakphu": { latitude: 27.0601, longitude: 88.0205, district: "Darjeeling", state: "West Bengal" },
  "Monastery Trails of West Sikkim": { latitude: 27.3015, longitude: 88.2365, district: "West Sikkim", state: "Sikkim" },
  "Chowrasta": { latitude: 27.0432, longitude: 88.2647, district: "Darjeeling", state: "West Bengal" },
  "Gangtok MG Marg": { latitude: 27.3289, longitude: 88.6118, district: "East Sikkim", state: "Sikkim" },
  "Baba Harbhajan Singh Temple": { latitude: 27.3698, longitude: 88.8252, district: "East Sikkim", state: "Sikkim" }
};

const FALLBACK_TAXI_STANDS: Record<string, TaxiStand> = {
  "Darjeeling Motor Stand": { name: "Darjeeling Motor Stand", latitude: 27.0398, longitude: 88.2638, elevation: 2050, district: "Darjeeling", state: "West Bengal" },
  "Ghum Taxi Stand": { name: "Ghum Taxi Stand", latitude: 27.0094, longitude: 88.2619, elevation: 2250, district: "Darjeeling", state: "West Bengal" },
  "Teesta Bazar Stand": { name: "Teesta Bazar Stand", latitude: 27.0628, longitude: 88.4285, elevation: 150, district: "Darjeeling", state: "West Bengal" },
  "Takdah Club Stand": { name: "Takdah Club Stand", latitude: 27.0382, longitude: 88.3615, elevation: 1550, district: "Darjeeling", state: "West Bengal" },
  "Takdah Jeep Stand": { name: "Takdah Jeep Stand", latitude: 27.0421, longitude: 88.3644, elevation: 1600, district: "Darjeeling", state: "West Bengal" },
  "Tinchuley Junction Stand": { name: "Tinchuley Junction Stand", latitude: 27.0543, longitude: 88.3768, elevation: 1800, district: "Darjeeling", state: "West Bengal" },
  "Pelling Main Stand": { name: "Pelling Main Stand", latitude: 27.3015, longitude: 88.2365, elevation: 2150, district: "Sikkim", state: "Sikkim" },
  "Lachung Local Stand": { name: "Lachung Local Stand", latitude: 27.6892, longitude: 88.7431, elevation: 2900, district: "Sikkim", state: "Sikkim" },
  "Lachen Junction Stand": { name: "Lachen Junction Stand", latitude: 27.7163, longitude: 88.5518, elevation: 2750, district: "Sikkim", state: "Sikkim" },
  "Ravangla Main Stand": { name: "Ravangla Main Stand", latitude: 27.2045, longitude: 88.3639, elevation: 2200, district: "Sikkim", state: "Sikkim" },
  "Gangtok Taxi Stand": { name: "Gangtok Taxi Stand", latitude: 27.3294, longitude: 88.6122, elevation: 1650, district: "Sikkim", state: "Sikkim" },
  "Lava Jeep Stand": { name: "Lava Jeep Stand", latitude: 27.0864, longitude: 88.6657, elevation: 2100, district: "Kalimpong", state: "West Bengal" },
  "Lolegaon Motor Stand": { name: "Lolegaon Motor Stand", latitude: 27.0194, longitude: 88.5668, elevation: 1670, district: "Kalimpong", state: "West Bengal" },
  "Lataguri Junction Stand": { name: "Lataguri Junction Stand", latitude: 26.7118, longitude: 88.7758, elevation: 80, district: "Jalpaiguri", state: "West Bengal" },
  "Hasimara Junction": { name: "Hasimara Junction", latitude: 26.7845, longitude: 89.3498, elevation: 110, district: "Alipurduar", state: "West Bengal" }
};

interface SearchIndexItem {
  id: string;
  name: string;
  category: 'Destination' | 'Village' | 'Attraction' | 'Homestay' | 'Taxi Stand' | 'Railway Station' | 'Airport' | 'Bus Stand' | 'Tour Package' | 'Travel Guide' | 'Hotel' | 'Traveller Profile' | 'Travel Moment' | 'Route';
  location?: string;
  image?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  metadata?: any;
  linkedIds?: string[]; // Used for smart taxi stands
}

export default function IntelligentRoutePlanner({
  destinations,
  attractions,
  homestays,
  routes,
  setNotification,
  hideHeader
}: IntelligentRoutePlannerProps) {
  // Real-time states
  const [taxiStands, setTaxiStands] = useState<TaxiStand[]>([]);
  const [userLat, setUserLat] = useState<number>(27.0398); // Fallback: Darjeeling coords
  const [userLng, setUserLng] = useState<number>(88.2638);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Voice Search states
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceText, setVoiceText] = useState<string>('');

  // Main input fields values
  const [originQuery, setOriginQuery] = useState<string>('');
  const [destinationQuery, setDestinationQuery] = useState<string>('');

  // Selection objects
  const [selectedOrigin, setSelectedOrigin] = useState<SearchIndexItem | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<SearchIndexItem | null>(null);

  // Active Dropdowns / Focus state
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  // Routing preferences
  const [routingMetric, setRoutingMetric] = useState<'time' | 'fare'>('time');

  // Input elements refs
  const originInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load Taxi Stands dynamically from backend API with fallback
  useEffect(() => {
    fetch('/api/taxi-stands')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const loadedList = Object.entries(data).map(([key, value]: [string, any]) => ({
            name: key,
            latitude: Number(value.latitude),
            longitude: Number(value.longitude),
            elevation: value.elevation,
            district: value.district,
            state: value.state
          }));
          setTaxiStands(loadedList);
        } else {
          setTaxiStands(Object.values(FALLBACK_TAXI_STANDS));
        }
      })
      .catch(() => {
        setTaxiStands(Object.values(FALLBACK_TAXI_STANDS));
      });
  }, []);

  // Load recent searches from localstorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hillytrip_route_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 5));
        }
      } else {
        setRecentSearches(['Darjeeling to Gangtok', 'NJP to Kalimpong', 'Bagdogra to Mirik']);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save new search to recent list
  const addRecentSearch = (fromName: string, toName: string) => {
    const entry = `${fromName} ➔ ${toName}`;
    const updated = [entry, ...recentSearches.filter(s => s !== entry)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('hillytrip_route_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Close suggestions overlay if clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveInput(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync GPS Coordinates
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      if (setNotification) {
        setNotification({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      }
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setUserLat(lat);
        setUserLng(lng);
        setIsLocating(false);

        // Smart Proximity Lookup to set origin: scan over all searchIndex items with coordinates
        let nearestEntity: SearchIndexItem | null = null;
        let minDistance = Infinity;

        searchIndex.forEach(item => {
          if (item.latitude !== undefined && item.longitude !== undefined) {
            const dist = getDistanceInKm(lat, lng, item.latitude, item.longitude);
            if (dist < minDistance) {
              minDistance = dist;
              nearestEntity = item;
            }
          }
        });

        if (nearestEntity) {
          const resolvedName = `My Location (${(nearestEntity as SearchIndexItem).name})`;
          const finalItem: SearchIndexItem = {
            ...nearestEntity,
            name: resolvedName
          };
          setSelectedOrigin(finalItem);
          setOriginQuery(resolvedName);
          if (setNotification) {
            setNotification({ 
              type: 'success', 
              message: `Detected nearest point: ${(nearestEntity as SearchIndexItem).name} (~${minDistance.toFixed(1)} km away)` 
            });
          }
        } else {
          // Fallback to coordinates
          const gpsItem: SearchIndexItem = {
            id: 'current-gps',
            name: `My GPS Coords (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            category: 'Destination',
            location: 'Automatically Detected Location',
            latitude: lat,
            longitude: lng,
            district: 'Local Coordinate',
            state: 'Live GPS'
          };
          setSelectedOrigin(gpsItem);
          setOriginQuery(gpsItem.name);
        }
      },
      (error) => {
        setIsLocating(false);
        console.error(error);
        if (setNotification) {
          setNotification({ type: 'error', message: 'Unable to access your GPS position. Please type naturally.' });
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Smart Resolution Layer for Taxi Stands: display every stand ONLY ONCE
  // internally cluster and store linked Stand Names (which serve as duplicate IDs in database)
  const groupedTaxiStands = useMemo(() => {
    const groups: Record<string, SearchIndexItem> = {};
    
    taxiStands.forEach(ts => {
      let groupName = ts.name;
      const lowerName = ts.name.toLowerCase();
      
      // Grouping dictionary roots
      const roots = [
        "Darjeeling", "Gangtok", "Takdah", "Lachen", "Lachung", "Pelling", 
        "Teesta", "Ghum", "Tinchuley", "Ravangla", "Lava", "Lolegaon", 
        "Lataguri", "Hasimara", "Mangan", "Siliguri", "Kalimpong", "Chungthang"
      ];
      
      const matchedRoot = roots.find(r => lowerName.includes(r.toLowerCase()));
      if (matchedRoot) {
        groupName = `${matchedRoot} Taxi Stand`;
      }
      
      if (!groups[groupName]) {
        groups[groupName] = {
          id: groupName,
          name: groupName,
          category: 'Taxi Stand',
          location: `${ts.district || 'Hub Terminal'}, ${ts.state || 'Sikkim Bengal Corridor'}`,
          latitude: ts.latitude,
          longitude: ts.longitude,
          district: ts.district,
          state: ts.state,
          linkedIds: [ts.name]
        };
      } else {
        // Append duplicate / additional linked stand name
        if (groups[groupName].linkedIds && !groups[groupName].linkedIds.includes(ts.name)) {
          groups[groupName].linkedIds.push(ts.name);
        }
      }
    });
    
    return Object.values(groups);
  }, [taxiStands]);

  // Unified Search Index Builder
  const searchIndex = useMemo(() => {
    const index: SearchIndexItem[] = [];

    // Helper to identify if a location name corresponds to a small mountain village
    const isVillage = (name: string) => {
      const lower = name.toLowerCase();
      return lower.includes('gaon') || lower.includes('rishop') || lower.includes('zuluk') || 
             lower.includes('lachen') || lower.includes('lachung') || lower.includes('chatakpur') ||
             lower.includes('sukhia') || lower.includes('tinchuley') || lower.includes('takdah') ||
             lower.includes('pedong') || lower.includes('rongo') || lower.includes('parent') ||
             lower.includes('bindu') || lower.includes('jhalong') || lower.includes('rishop');
    };

    // 1. Add Destinations (Villages, Towns)
    destinations.forEach(d => {
      const categoryType = isVillage(d.name) ? 'Village' : 'Destination';
      index.push({
        id: d.id,
        name: d.name,
        category: categoryType,
        location: `${d.district || 'Village'}, ${d.state || 'Himalayas'}`,
        image: d.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=300&auto=format&fit=crop',
        tags: [d.name, d.district, d.state, d.tourismType, 'village', 'town', 'hills', 'valley', 'stay'].filter(Boolean) as string[],
        latitude: d.latitude,
        longitude: d.longitude,
        district: d.district,
        state: d.state,
        metadata: d
      });
    });

    // Explicitly add offbeat villages to guarantee they exist in search results
    const extraVillages: SearchIndexItem[] = [
      {
        id: 'vl-sukhia',
        name: "Sukhia Pokhari",
        category: 'Village',
        location: "Darjeeling District, West Bengal (Pine forest hub)",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80",
        tags: ["sukhia", "sukhia pokhari", "village", "pine forest", "darjeeling border"],
        latitude: 27.0005,
        longitude: 88.1633,
        district: "Darjeeling",
        state: "West Bengal"
      },
      {
        id: 'vl-rishop',
        name: "Rishop Village",
        category: 'Village',
        location: "Kalimpong District, West Bengal (Snow-capped views)",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=300&auto=format&fit=crop",
        tags: ["rishop", "rishyap", "village", "kalimpong", "snow view", "canopy"],
        latitude: 27.1124,
        longitude: 88.6492,
        district: "Kalimpong",
        state: "West Bengal"
      },
      {
        id: 'vl-sillery',
        name: "Sillery Gaon",
        category: 'Village',
        location: "Kalimpong District, West Bengal (Eco-tourism hamlet)",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&auto=format&fit=crop",
        tags: ["sillery", "sillery gaon", "hamlet", "village", "eco tourism", "silent valley"],
        latitude: 27.1356,
        longitude: 88.5802,
        district: "Kalimpong",
        state: "West Bengal"
      }
    ];
    extraVillages.forEach(v => index.push(v));

    // 2. Add Attractions
    attractions.forEach(a => {
      const destName = destinations.find(d => d.id === a.destinationId)?.name || 'Hills';
      index.push({
        id: a.id,
        name: a.name,
        category: 'Attraction',
        location: `${destName}, ${a.district || ''}`,
        image: a.image || 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=300&auto=format&fit=crop',
        tags: [a.name, a.category, destName, 'scenic', 'spot', 'sightseeing', 'viewpoint', 'lake', 'monastery'].filter(Boolean) as string[],
        latitude: a.latitude,
        longitude: a.longitude,
        district: a.district,
        state: a.state,
        metadata: a
      });
    });

    // Add required high-priority traveler aliases and nicknames
    const extraAttractions: SearchIndexItem[] = [
      {
        id: 'at-chowrasta',
        name: "Chowrasta (Darjeeling Mall)",
        category: 'Attraction',
        location: "Darjeeling Town Centre, Mall Road",
        image: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=300&auto=format&fit=crop",
        tags: ["darjeeling mall", "chowrasta", "mall road", "town square", "shopping", "walkway"],
        ...COORD_PRESETS["Chowrasta"]
      },
      {
        id: 'at-mgmarg',
        name: "Gangtok MG Marg",
        category: 'Attraction',
        location: "Gangtok Town Centre, Mall Road",
        image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=300&q=80",
        tags: ["mg marg", "gangtok mall", "mg road", "town square", "shopping", "center"],
        ...COORD_PRESETS["Gangtok MG Marg"]
      },
      {
        id: 'at-babamandir',
        name: "Baba Harbhajan Singh Temple (Baba Mandir)",
        category: 'Attraction',
        location: "Kupup Border Road, East Sikkim",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=300&auto=format&fit=crop",
        tags: ["baba mandir", "baba harbhajan singh", "shrine", "temple", "nathula border", "sacred"],
        ...COORD_PRESETS["Baba Harbhajan Singh Temple"]
      }
    ];
    extraAttractions.forEach(ea => index.push(ea));

    // 3. Add Homestays
    homestays.forEach(h => {
      const destName = destinations.find(d => d.id === h.destinationId)?.name || 'Remote Village';
      index.push({
        id: h.id,
        name: h.name,
        category: 'Homestay',
        location: `${destName} (Starting from ₹${h.priceMin})`,
        image: (h.images && h.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&auto=format&fit=crop',
        tags: [h.name, h.ownerName || '', destName, 'homestay', 'cabin', 'lodge', 'stay', 'room'].filter(Boolean) as string[],
        latitude: h.latitude,
        longitude: h.longitude,
        district: h.district,
        state: h.state,
        metadata: h
      });
    });

    // 4. Add Grouped Taxi Stands (display duplicate stands only once)
    groupedTaxiStands.forEach(gts => {
      index.push({
        ...gts,
        tags: [gts.name, ...(gts.linkedIds || []), 'taxi', 'stand', 'jeep', 'shared', 'syndicate']
      });
    });

    // 5. Airports, Railway Stations, Bus Stands (Preloaded)
    const transitHubs: SearchIndexItem[] = [
      {
        id: 'njp-rail',
        name: "New Jalpaiguri Railway Station (NJP)",
        category: 'Railway Station',
        location: "Siliguri, West Bengal (Main Hub Gateway)",
        image: "https://images.unsplash.com/photo-1541417904950-b855846fe074?q=80&w=300&auto=format&fit=crop",
        tags: ["njp", "new jalpaiguri", "railway station", "train station", "siliguri njp", "transit", "gateway"],
        ...COORD_PRESETS["New Jalpaiguri Railway Station (NJP)"]
      },
      {
        id: 'darjeeling-toy-train',
        name: "Darjeeling Himalayan Toy Train Station",
        category: 'Railway Station',
        location: "Darjeeling Mall Road area",
        image: "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?q=80&w=300&auto=format&fit=crop",
        tags: ["darjeeling toy train", "toy train", "dhr", "steam engine", "heritage train"],
        ...COORD_PRESETS["Darjeeling SNT Bus Terminus"]
      },
      {
        id: 'ixb-airport',
        name: "IXB Airport (Bagdogra)",
        category: 'Airport',
        location: "Siliguri, West Bengal (Primary Flight Hub)",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=300&auto=format&fit=crop",
        tags: ["bagdogra", "ixb", "airport", "bagdogra airport", "siliguri airport", "flight"],
        ...COORD_PRESETS["IXB Airport (Bagdogra)"]
      },
      {
        id: 'pakyong-airport',
        name: "Pakyong Airport",
        category: 'Airport',
        location: "East Sikkim Flight Gateway",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=300&auto=format&fit=crop",
        tags: ["pakyong", "sikkim airport", "pakyong airport", "flight"],
        ...COORD_PRESETS["Pakyong Airport"]
      },
      {
        id: 'siliguri-snt',
        name: "Siliguri SNT Bus Stand",
        category: 'Bus Stand',
        location: "Hill Cart Road, Siliguri",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=300&auto=format&fit=crop",
        tags: ["snt", "sikkim nationalised transport", "bus stand", "siliguri bus", "snt bus stand"],
        ...COORD_PRESETS["Siliguri SNT Bus Stand"]
      }
    ];
    transitHubs.forEach(t => index.push(t));

    // 6. Tour Packages (Future-ready)
    const tourPackages: SearchIndexItem[] = [
      {
        id: 'pkg-silk',
        name: "Sikkim Silk Route Expedition (5D/4N)",
        category: 'Tour Package',
        location: "Zuluk, Gnathang, Kupup, Rongli circuit",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=300&auto=format&fit=crop",
        tags: ["silk route", "package", "zuluk", "gnathang", "east sikkim tour"],
        ...COORD_PRESETS["Sikkim Silk Route Expedition (5D/4N)"]
      },
      {
        id: 'pkg-north',
        name: "Majestic North Sikkim Adventure (3D/2N)",
        category: 'Tour Package',
        location: "Lachen, Lachung, Yumthang, Gurudongmar Lake",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&auto=format&fit=crop",
        tags: ["north sikkim", "lachen", "lachung", "gurudongmar", "yumthang tour"],
        ...COORD_PRESETS["Majestic North Sikkim Adventure (3D/2N)"]
      }
    ];
    tourPackages.forEach(p => index.push(p));

    // 7. Travel Guides (Future-ready)
    const travelGuides: SearchIndexItem[] = [
      {
        id: 'gd-food',
        name: "Local Food Guide: What to Eat in Darjeeling & Gangtok",
        category: 'Travel Guide',
        location: "Momo, Thukpa, Churpee & Temi Tea Spots",
        image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=300&auto=format&fit=crop",
        tags: ["food", "guide", "momo", "thukpa", "eat", "local dishes", "restaurant"],
        ...COORD_PRESETS["Local Food Guide: What to Eat in Darjeeling & Gangtok"]
      },
      {
        id: 'gd-trek',
        name: "Complete Trekking Guide to Sandakphu",
        category: 'Travel Guide',
        location: "Singalila Ridge & Kanchenjunga sleeping buddha peaks",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=300&auto=format&fit=crop",
        tags: ["trekking", "sandakphu", "hike", "singalila", "mountain peak"],
        ...COORD_PRESETS["Complete Trekking Guide to Sandakphu"]
      }
    ];
    travelGuides.forEach(g => index.push(g));

    // 8. Hotels (Future-ready searchable module)
    const hotels: SearchIndexItem[] = [
      {
        id: 'ht-windamere',
        name: "Windamere Hotel (Historic Tea Resort)",
        category: 'Hotel',
        location: "Darjeeling Heritage Mall area",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&auto=format&fit=crop",
        tags: ["windamere", "hotel", "historic", "tea resort", "stay", "darjeeling luxury"],
        latitude: 27.0438,
        longitude: 88.2652,
        district: "Darjeeling",
        state: "West Bengal"
      },
      {
        id: 'ht-mayfair',
        name: "Mayfair Spa Resort & Casino",
        category: 'Hotel',
        location: "Ranipool, Gangtok Forest reserve",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=300&auto=format&fit=crop",
        tags: ["mayfair", "resort", "hotel", "casino", "spa", "stay", "gangtok stay"],
        latitude: 27.3012,
        longitude: 88.5915,
        district: "East Sikkim",
        state: "Sikkim"
      }
    ];
    hotels.forEach(h => index.push(h));

    // 9. Traveller Profiles (Future-ready searchable module)
    const travelerProfiles: SearchIndexItem[] = [
      {
        id: 'pf-rohits',
        name: "Rohit Sharma (Frequent Trekker Profile)",
        category: 'Traveller Profile',
        location: "Active Explorer Level 5 • 14 Journeys Done",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&h=150&fit=crop",
        tags: ["rohit sharma", "traveller", "profile", "trekker", "expert", "user"],
        latitude: 27.0398,
        longitude: 88.2638
      },
      {
        id: 'pf-anjalisen',
        name: "Anjali Sen (Sikkim Homestay Guide Expert)",
        category: 'Traveller Profile',
        location: "Contributor Level 4 • 25 Local reviews",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&h=150&fit=crop",
        tags: ["anjali sen", "traveller", "profile", "homestay reviewer", "guide", "user"],
        latitude: 27.3294,
        longitude: 88.6122
      }
    ];
    travelerProfiles.forEach(tp => index.push(tp));

    // 10. Travel Moments (Future-ready searchable module)
    const travelMoments: SearchIndexItem[] = [
      {
        id: 'mm-sunrise',
        name: "Golden Sunrise at Tiger Hill Viewpoint",
        category: 'Travel Moment',
        location: "Shared by @rohits • 1.2k Likes",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80",
        tags: ["sunrise", "tiger hill", "moment", "view", "darjeeling sunrise", "photo"],
        latitude: 27.0145,
        longitude: 88.2711,
        district: "Darjeeling",
        state: "West Bengal"
      },
      {
        id: 'mm-snow',
        name: "Heavy Snowfall at Kupup Lake Border",
        category: 'Travel Moment',
        location: "Shared by @hillytrip • 890 Likes",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=300&auto=format&fit=crop",
        tags: ["snowfall", "kupup", "lake", "moment", "photo", "east sikkim winter"],
        latitude: 27.3712,
        longitude: 88.8211,
        district: "East Sikkim",
        state: "Sikkim"
      }
    ];
    travelMoments.forEach(m => index.push(m));

    // 11. Custom Direct Route index shortcuts
    routes.forEach(r => {
      index.push({
        id: `route-direct-${r.fromHubId}-${r.toHubId}`,
        name: `${r.fromHubId} to ${r.toHubId} Route`,
        category: 'Route',
        location: `Direct Highway Corridor (${r.distance || 45} Kms)`,
        tags: [r.fromHubId, r.toHubId, 'route', 'corridor', 'direct', 'taxi', 'link'],
        latitude: 27.0398, // fallback Darjeeling
        longitude: 88.2638,
        metadata: r
      });
    });

    return index;
  }, [destinations, attractions, homestays, groupedTaxiStands, routes]);

  // Intelligent Natural Language Resolver Dictionary
  const ALIAS_MAP = useMemo(() => {
    return {
      "njp": "New Jalpaiguri Railway Station (NJP)",
      "new jalpaiguri": "New Jalpaiguri Railway Station (NJP)",
      "bagdogra": "IXB Airport (Bagdogra)",
      "bagdogra airport": "IXB Airport (Bagdogra)",
      "ixb": "IXB Airport (Bagdogra)",
      "darjeeling mall": "Chowrasta (Darjeeling Mall)",
      "mall road": "Chowrasta (Darjeeling Mall)",
      "chowrasta": "Chowrasta (Darjeeling Mall)",
      "mg marg": "Gangtok MG Marg",
      "gangtok mall": "Gangtok MG Marg",
      "baba mandir": "Baba Harbhajan Singh Temple (Baba Mandir)",
      "harbhajan singh": "Baba Harbhajan Singh Temple (Baba Mandir)"
    };
  }, []);

  // Multi-tier Autocomplete Search Filtering with Synonyms, Partial and Fuzzy Matching
  const findBestMatchInIndex = useCallback((queryText: string): SearchIndexItem | null => {
    if (!queryText.trim()) return null;
    const cleanQuery = queryText.toLowerCase().trim();
    
    // 1. Check alias first
    let targetNameQuery = cleanQuery;
    for (const [alias, resolved] of Object.entries(ALIAS_MAP)) {
      if (cleanQuery === alias || cleanQuery.includes(alias)) {
        targetNameQuery = resolved.toLowerCase();
        break;
      }
    }

    // 2. Exact match in name
    let bestItem = searchIndex.find(s => s.name.toLowerCase() === targetNameQuery);
    if (bestItem) return bestItem;

    // 3. Name starts with target query
    bestItem = searchIndex.find(s => s.name.toLowerCase().startsWith(targetNameQuery));
    if (bestItem) return bestItem;

    // 4. Name includes target query or tags include target query
    bestItem = searchIndex.find(s => 
      s.name.toLowerCase().includes(targetNameQuery) || 
      s.tags?.some(t => t.toLowerCase() === targetNameQuery)
    );
    if (bestItem) return bestItem;

    // 5. Fuzzy match check
    let highestScore = 0;
    let highestItem: SearchIndexItem | null = null;
    searchIndex.forEach(item => {
      const lowerName = item.name.toLowerCase();
      let score = 0;
      if (lowerName.includes(targetNameQuery)) {
        score += 50;
      }
      const matchedTagCount = item.tags?.filter(t => t.toLowerCase().includes(targetNameQuery) || targetNameQuery.includes(t.toLowerCase())).length || 0;
      score += matchedTagCount * 15;

      // Character intersection (simple Jaccard)
      let intersection = 0;
      const qChars = new Set(targetNameQuery.split(''));
      const nameChars = new Set(lowerName.split(''));
      qChars.forEach(c => {
        if (nameChars.has(c)) intersection++;
      });
      const union = new Set([...qChars, ...nameChars]).size;
      const similarity = intersection / (union || 1);
      if (similarity > 0.45) {
        score += Math.round(similarity * 40);
      }

      if (score > highestScore) {
        highestScore = score;
        highestItem = item;
      }
    });

    if (highestScore > 15) {
      return highestItem;
    }
    return null;
  }, [searchIndex, ALIAS_MAP]);

  const parseSingleFieldRoute = useCallback((queryText: string): boolean => {
    if (!queryText || !queryText.trim()) return false;
    const clean = queryText.toLowerCase().trim();
    if (clean.includes(' to ')) {
      const parts = queryText.split(/\s+to\s+/i);
      if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
        const fromPart = parts[0].trim();
        const toPart = parts[1].trim();

        const fromItem = findBestMatchInIndex(fromPart);
        const toItem = findBestMatchInIndex(toPart);

        if (fromItem) {
          setSelectedOrigin(fromItem);
          setOriginQuery(fromItem.name);
        } else {
          setOriginQuery(fromPart);
        }

        if (toItem) {
          setSelectedTarget(toItem);
          setDestinationQuery(toItem.name);
        } else {
          setDestinationQuery(toPart);
        }

        setActiveInput(null);
        if (setNotification) {
          setNotification({ 
            type: 'success', 
            message: `Route parsed successfully: ${fromItem ? fromItem.name : fromPart} ➔ ${toItem ? toItem.name : toPart}` 
          });
        }
        return true;
      }
    }
    return false;
  }, [findBestMatchInIndex, setNotification]);

  // Multi-tier Autocomplete Search Filtering with Synonyms, Partial and Fuzzy Matching
  const getSuggestions = (queryText: string): SearchIndexItem[] => {
    if (!queryText.trim()) return [];
    
    const cleanQuery = queryText.toLowerCase().trim();
    
    // Resolve alias matches first
    let targetNameQuery = cleanQuery;
    for (const [alias, resolved] of Object.entries(ALIAS_MAP)) {
      if (cleanQuery === alias || cleanQuery.includes(alias)) {
        targetNameQuery = resolved.toLowerCase();
        break;
      }
    }

    // Scoring map
    const scoredList = searchIndex.map(item => {
      const lowerName = item.name.toLowerCase();
      const lowerLoc = (item.location || '').toLowerCase();
      let score = 0;

      // Exact match bonus
      if (lowerName === targetNameQuery) {
        score += 100;
      }
      // Starts with bonus
      else if (lowerName.startsWith(targetNameQuery)) {
        score += 75;
      }
      // Contains bonus
      else if (lowerName.includes(targetNameQuery)) {
        score += 50;
      }
      // Sub-location match bonus
      else if (lowerLoc.includes(targetNameQuery)) {
        score += 30;
      }

      // Tag/Keyword match
      const matchedTagCount = item.tags?.filter(t => t.toLowerCase().includes(targetNameQuery) || targetNameQuery.includes(t.toLowerCase())).length || 0;
      score += matchedTagCount * 15;

      // Simple Char Jaccard check for typos / fuzzy misspellings
      if (score === 0) {
        let intersection = 0;
        const qChars = new Set(targetNameQuery.split(''));
        const nameChars = new Set(lowerName.split(''));
        qChars.forEach(c => {
          if (nameChars.has(c)) intersection++;
        });
        const union = new Set([...qChars, ...nameChars]).size;
        const similarity = intersection / (union || 1);
        if (similarity > 0.45) {
          score += Math.round(similarity * 40);
        }
      }

      return { item, score };
    });

    return scoredList
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.item)
      .slice(0, 10); // Strictly maximum 10 suggestions
  };

  const originSuggestions = useMemo(() => getSuggestions(originQuery), [originQuery, searchIndex]);
  const destinationSuggestions = useMemo(() => getSuggestions(destinationQuery), [destinationQuery, searchIndex]);

  // Perform swap journey
  const handleSwap = () => {
    const tempQuery = originQuery;
    const tempSelected = selectedOrigin;

    setOriginQuery(destinationQuery);
    setSelectedOrigin(selectedTarget);

    setDestinationQuery(tempQuery);
    setSelectedTarget(tempSelected);

    if (setNotification) {
      setNotification({ type: 'success', message: 'Swapped Departure and Arrival stations.' });
    }
  };

  // Keyboard Navigation handlers
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>, 
    suggestions: SearchIndexItem[], 
    type: 'origin' | 'destination'
  ) => {
    if (!suggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex], type);
    } else if (e.key === 'Escape') {
      setActiveInput(null);
    }
  };

  const handleSelectSuggestion = (item: SearchIndexItem, type: 'origin' | 'destination') => {
    if (item.category === 'Route') {
      const routeData = item.metadata as Route;
      if (routeData) {
        // Find corresponding standalone search index items for the hubs
        const fromItem = searchIndex.find(s => s.name.toLowerCase() === routeData.fromHubId.toLowerCase() || s.id.toLowerCase() === routeData.fromHubId.toLowerCase() || s.name.toLowerCase().includes(routeData.fromHubId.toLowerCase()));
        const toItem = searchIndex.find(s => s.name.toLowerCase() === routeData.toHubId.toLowerCase() || s.id.toLowerCase() === routeData.toHubId.toLowerCase() || s.name.toLowerCase().includes(routeData.toHubId.toLowerCase()));

        if (fromItem) {
          setSelectedOrigin(fromItem);
          setOriginQuery(fromItem.name);
        } else {
          setOriginQuery(routeData.fromHubId);
        }

        if (toItem) {
          setSelectedTarget(toItem);
          setDestinationQuery(toItem.name);
        } else {
          setDestinationQuery(routeData.toHubId);
        }
        
        setActiveInput(null);
        setHighlightedIndex(0);
        if (setNotification) {
          setNotification({ type: 'success', message: `Loaded direct corridor route: ${routeData.fromHubId} ➔ ${routeData.toHubId}` });
        }
        return;
      }
    }

    if (type === 'origin') {
      setSelectedOrigin(item);
      setOriginQuery(item.name);
    } else {
      setSelectedTarget(item);
      setDestinationQuery(item.name);
    }
    setActiveInput(null);
    setHighlightedIndex(0);
  };

  // Voice Search simulation
  const triggerVoiceListening = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      return;
    }
    setIsVoiceActive(true);
    setVoiceText('Listening for your mountain destination...');
    
    // Simulate real speech extraction with a delay
    setTimeout(() => {
      setVoiceText('Analyzing mountain routes...');
      setTimeout(() => {
        setIsVoiceActive(false);
        setSelectedTarget(searchIndex.find(s => s.name.includes('Gangtok')) || null);
        setDestinationQuery('Gangtok');
        if (setNotification) {
          setNotification({ type: 'success', message: 'Voice search resolved destination to: Gangtok' });
        }
      }, 1500);
    }, 1500);
  };

  // Smart Route Engine: Real-time pathfinder between selected locations
  const calculatedJourneyResult = useMemo(() => {
    if (!selectedOrigin || !selectedTarget) return null;

    // 1. Resolve Origin coordinates & linked Taxi Stand IDs
    let originLat = selectedOrigin.latitude ?? userLat;
    let originLng = selectedOrigin.longitude ?? userLng;
    let originName = selectedOrigin.name;
    
    // Get starting taxi stands (Smart Resolution Layer)
    let originTaxiStandsList: SearchIndexItem[] = [];
    if (selectedOrigin.category === 'Taxi Stand') {
      originTaxiStandsList = [selectedOrigin];
    } else {
      // Find closest grouped taxi stand by coordinates
      const sorted = [...groupedTaxiStands].map(t => ({
        ...t,
        distance: getDistanceInKm(originLat, originLng, t.latitude!, t.longitude!)
      })).sort((a, b) => a.distance - b.distance);
      if (sorted.length > 0) {
        originTaxiStandsList = [sorted[0]];
      }
    }

    // 2. Resolve Target coordinates & linked Taxi Stand IDs
    let targetLat = selectedTarget.latitude ?? 27.3294; // fallback Gangtok
    let targetLng = selectedTarget.longitude ?? 88.6122;
    let targetName = selectedTarget.name;

    let targetTaxiStandsList: SearchIndexItem[] = [];
    if (selectedTarget.category === 'Taxi Stand') {
      targetTaxiStandsList = [selectedTarget];
    } else {
      // Find closest grouped taxi stand by coordinates
      const sorted = [...groupedTaxiStands].map(t => ({
        ...t,
        distance: getDistanceInKm(targetLat, targetLng, t.latitude!, t.longitude!)
      })).sort((a, b) => a.distance - b.distance);
      if (sorted.length > 0) {
        targetTaxiStandsList = [sorted[0]];
      }
    }

    // Check direct local distance shortcut (e.g. within 5 Kms - no high altitude highway transits needed)
    const directLocalDistance = getDistanceInKm(originLat, originLng, targetLat, targetLng);
    const isDirectLocalVicinity = directLocalDistance <= 5.5;

    // Expand linked stand names from original master list (Smart Resolution Layer)
    const sourceLinkedIds = originTaxiStandsList.flatMap(ots => ots.linkedIds || [ots.name]);
    const targetLinkedIds = targetTaxiStandsList.flatMap(tts => tts.linkedIds || [tts.name]);

    // Build Adjacency List for our Routing Graph
    const adj = new Map<string, Route[]>();
    routes.forEach(r => {
      const fromId = r.fromHubId.toLowerCase().trim();
      const toId = r.toHubId.toLowerCase().trim();
      
      if (!adj.has(fromId)) adj.set(fromId, []);
      if (!adj.has(toId)) adj.set(toId, []);
      
      adj.get(fromId)!.push(r);
      // Create bidirectional path edges for high-altitude connectivity
      const reverseRoute: Route = {
        ...r,
        fromHubId: r.toHubId,
        toHubId: r.fromHubId,
        path: r.path ? [...r.path].reverse() : []
      };
      adj.get(toId)!.push(reverseRoute);
    });

    // Helper to resolve coordinates of any intermediate hub node ID in network
    const resolveHubCoords = (hubId: string) => {
      const idLower = hubId.toLowerCase().trim();
      
      // Look up in our known destinations list
      const dest = destinations.find(d => d.id.toLowerCase() === idLower || d.name.toLowerCase() === idLower);
      if (dest && dest.latitude !== undefined && dest.longitude !== undefined) {
        return { lat: dest.latitude, lng: dest.longitude, name: dest.name };
      }
      
      // Look up in master taxi stands list
      const ts = taxiStands.find(t => t.name.toLowerCase() === idLower || t.name.toLowerCase().includes(idLower));
      if (ts) {
        return { lat: ts.latitude, lng: ts.longitude, name: ts.name };
      }
      
      return null;
    };

    // Calculate best multi-hop pathway using Dijkstra / BFS algorithm
    let bestJourneyPath: Route[] | null = null;
    let bestTotalMetricScore = Infinity;
    let bestStartHubResolved = '';
    let bestEndHubResolved = '';

    // Search routes across EVERY linked Taxi Stand ID from the Smart Resolution Layer!
    for (const startId of sourceLinkedIds) {
      for (const endId of targetLinkedIds) {
        const queue: { current: string; path: Route[]; totalMetricVal: number }[] = [];
        queue.push({ current: startId.toLowerCase().trim(), path: [], totalMetricVal: 0 });
        
        const visited = new Map<string, number>();
        visited.set(startId.toLowerCase().trim(), 0);

        while (queue.length > 0) {
          queue.sort((a, b) => a.totalMetricVal - b.totalMetricVal);
          const { current, path, totalMetricVal } = queue.shift()!;

          if (current === endId.toLowerCase().trim()) {
            if (totalMetricVal < bestTotalMetricScore) {
              bestTotalMetricScore = totalMetricVal;
              bestJourneyPath = path;
              bestStartHubResolved = startId;
              bestEndHubResolved = endId;
            }
            continue;
          }

          const neighbors = adj.get(current) || [];
          for (const edge of neighbors) {
            const nextNode = edge.toHubId.toLowerCase().trim();
            // Metric optimization logic
            const edgeCost = routingMetric === 'time' 
              ? (edge.timeMin || 60) 
              : (edge.fareMin || 200);
            
            const totalNextCost = totalMetricVal + edgeCost;
            const visitedPrevMin = visited.get(nextNode);

            if (visitedPrevMin === undefined || totalNextCost < visitedPrevMin) {
              visited.set(nextNode, totalNextCost);
              queue.push({
                current: nextNode,
                path: [...path, edge],
                totalMetricVal: totalNextCost
              });
            }
          }
        }
      }
    }

    // Determine spatial distances to resolved hubs
    const startHubCoords = resolveHubCoords(bestStartHubResolved || originTaxiStandsList[0]?.name || 'Darjeeling');
    const endHubCoords = resolveHubCoords(bestEndHubResolved || targetTaxiStandsList[0]?.name || 'Gangtok');

    const originToHubDist = startHubCoords 
      ? getDistanceInKm(originLat, originLng, startHubCoords.lat, startHubCoords.lng) 
      : 2;

    const hubToTargetDist = endHubCoords 
      ? getDistanceInKm(endHubCoords.lat, endHubCoords.lng, targetLat, targetLng) 
      : 2;

    // Consolidate journey calculations
    let totalTimeMin = 0;
    let totalFareMin = 0;
    let totalFareMax = 0;
    let totalDistanceKm = 0;

    if (bestJourneyPath && bestJourneyPath.length > 0) {
      bestJourneyPath.forEach(hop => {
        totalTimeMin += hop.timeMin || 60;
        totalFareMin += hop.fareMin || 150;
        totalFareMax += hop.fareMax || 300;
        totalDistanceKm += hop.distance || 35;
      });
    } else {
      // Direct local route estimation
      totalTimeMin = Math.round(directLocalDistance * 3.5);
      totalFareMin = Math.round(directLocalDistance * 12);
      totalFareMax = Math.round(directLocalDistance * 18);
      totalDistanceKm = directLocalDistance;
    }

    // Add local links overheads
    if (!isDirectLocalVicinity) {
      totalTimeMin += Math.round(originToHubDist * 3) + Math.round(hubToTargetDist * 3);
      totalFareMin += Math.round(originToHubDist * 10) + Math.round(hubToTargetDist * 10);
      totalFareMax += Math.round(originToHubDist * 15) + Math.round(hubToTargetDist * 15);
      totalDistanceKm += originToHubDist + hubToTargetDist;
    }

    // Shared Taxi availability estimation
    const sharedTaxiAvailable = totalDistanceKm < 180;
    const reservedTaxiFare = Math.round(totalDistanceKm * 32);

    return {
      isDirectLocalVicinity,
      originName,
      targetName,
      originToHubDist: originToHubDist.toFixed(1),
      hubToTargetDist: hubToTargetDist.toFixed(1),
      originBearing: getBearingString(originLat, originLng, startHubCoords?.lat || originLat, startHubCoords?.lng || originLng),
      targetBearing: getBearingString(endHubCoords?.lat || targetLat, endHubCoords?.lng || targetLng, targetLat, targetLng),
      bestStartHub: bestStartHubResolved || originTaxiStandsList[0]?.name,
      bestEndHub: bestEndHubResolved || targetTaxiStandsList[0]?.name,
      hubsPath: bestJourneyPath,
      totalTimeMin,
      totalFareMin,
      totalFareMax,
      totalDistanceKm: totalDistanceKm.toFixed(1),
      sharedTaxiAvailable,
      sharedTaxiFareRange: `₹ ${totalFareMin} - ₹ ${totalFareMax}`,
      reservedTaxiFare: `₹ ${Math.max(1200, reservedTaxiFare)}`,
      numberOfTransfers: bestJourneyPath ? Math.max(0, bestJourneyPath.length - 1) : 0
    };
  }, [selectedOrigin, selectedTarget, routingMetric, routes, groupedTaxiStands, taxiStands, destinations, userLat, userLng]);

  // Handle click on trending or popular items
  const handleTrendingClick = (name: string, category: 'Destination' | 'Attraction' | 'Homestay' | 'Taxi Stand') => {
    const item = searchIndex.find(s => s.name.toLowerCase().includes(name.toLowerCase()) && s.category === category);
    if (item) {
      if (activeInput === 'origin' || (!selectedOrigin && activeInput !== 'destination')) {
        setSelectedOrigin(item);
        setOriginQuery(item.name);
      } else {
        setSelectedTarget(item);
        setDestinationQuery(item.name);
      }
      setActiveInput(null);
    }
  };

  // Trigger calculating with cache and tracking
  useEffect(() => {
    if (selectedOrigin && selectedTarget) {
      addRecentSearch(selectedOrigin.name, selectedTarget.name);
    }
  }, [selectedOrigin, selectedTarget]);

  return (
    <div className="w-full text-left font-sans max-w-4xl mx-auto space-y-6" id="intelligent-route-search-root">
      
      {/* Brand Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 to-emerald-950 border border-emerald-900/40 p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[10px] text-emerald-300 uppercase tracking-widest font-black inline-block">
              🏔️ Live Autonomous Routing Engine
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">HillyTrip Route Planner</h2>
            <p className="text-slate-300 text-xs max-w-xl">
              Type naturally. No taxi stand IDs, route catalogs, or complex network parameters needed. We map the terrain and find the best routes instantly.
            </p>
          </div>
          
          {/* Animated GPS Proximity Radar Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-black/40 border border-white/10 p-3 rounded-2xl">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-black tracking-wide uppercase">Terrain Proximity Active</span>
          </div>
        </div>
      )}

      {/* Main Redesigned Search Panel (Google Maps/Airbnb Inspired) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Starting From Field */}
          <div className="relative md:col-span-5" id="starting-from-search-container">
            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              <span>📍 Starting From</span>
            </label>
            <div className="relative flex items-center">
              <input
                ref={originInputRef}
                type="text"
                placeholder="Where are you starting from?"
                value={originQuery}
                onFocus={() => {
                  setActiveInput('origin');
                  setHighlightedIndex(0);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setOriginQuery(val);
                  if (!parseSingleFieldRoute(val)) {
                    setSelectedOrigin(null);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, originSuggestions, 'origin')}
                className="w-full pl-3.5 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-inner"
              />
              {originQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setOriginQuery('');
                    setSelectedOrigin(null);
                  }}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGPSDetect}
                  disabled={isLocating}
                  title="Detect my current location"
                  className="absolute right-3 p-1.5 text-emerald-600 hover:text-emerald-700 disabled:opacity-50 cursor-pointer animate-pulse"
                >
                  <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:col-span-2 md:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              title="Reverse journey locations"
              className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-full cursor-pointer transition transform active:scale-90 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Going To Field */}
          <div className="relative md:col-span-5" id="going-to-search-container">
            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>🎯 Going To</span>
            </label>
            <div className="relative flex items-center">
              <input
                ref={targetInputRef}
                type="text"
                placeholder="Where do you want to go?"
                value={destinationQuery}
                onFocus={() => {
                  setActiveInput('destination');
                  setHighlightedIndex(0);
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  setDestinationQuery(val);
                  if (!parseSingleFieldRoute(val)) {
                    setSelectedTarget(null);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, destinationSuggestions, 'destination')}
                className="w-full pl-3.5 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition shadow-inner"
              />
              {destinationQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setDestinationQuery('');
                    setSelectedTarget(null);
                  }}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={triggerVoiceListening}
                  title="Voice Command Routing"
                  className={`absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer ${isVoiceActive ? 'text-red-500 animate-bounce' : ''}`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Autocomplete suggestions Dropdown Panel Overlay */}
        {activeInput && (
          <div
            ref={dropdownRef}
            className="absolute left-6 right-6 mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-2xl z-50 max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1 animate-fade-in"
          >
            {/* Suggestions Render */}
            {(activeInput === 'origin' ? originSuggestions : destinationSuggestions).length > 0 ? (
              (activeInput === 'origin' ? originSuggestions : destinationSuggestions).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item, activeInput)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    highlightedIndex === idx 
                      ? 'bg-slate-50 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-700 dark:text-slate-250'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail / Category Icon */}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt="Location Preview"
                        className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-200/50"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200/40 text-lg">
                        {item.category === 'Taxi Stand' ? '🚖' :
                         item.category === 'Destination' ? '🏔' :
                         item.category === 'Attraction' ? '🎯' :
                         item.category === 'Homestay' ? '🏡' :
                         item.category === 'Railway Station' ? '🚂' :
                         item.category === 'Airport' ? '✈️' :
                         item.category === 'Bus Stand' ? '🚌' :
                         item.category === 'Tour Package' ? '🎒' : '📖'}
                      </div>
                    )}
                    
                    <div>
                      {/* Name with simple query highlighting */}
                      <p className="text-xs font-black">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-450 font-medium">
                        {item.category} • {item.location}
                      </p>
                    </div>
                  </div>
                  
                  {/* Small direction bearing display if coordinate exists */}
                  {item.latitude && (
                    <span className="text-[9px] font-mono font-black text-slate-400 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-md">
                      {getBearingString(userLat, userLng, item.latitude, item.longitude)} DIRECTION
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                <p className="font-bold">No exact match discovered for "{activeInput === 'origin' ? originQuery : destinationQuery}"</p>
                <p className="text-[10px]">Try entering a village name, railway station, airport, hotel or attractions.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Active Modal State Banner */}
      {isVoiceActive && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-xs font-mono font-bold animate-pulse">
          <Volume2 className="w-4 h-4 animate-bounce" />
          <span>{voiceText}</span>
        </div>
      )}

      {/* Smart Route Output Display */}
      {calculatedJourneyResult ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6 text-slate-850 dark:text-slate-100 animate-fade-in">
          
          {/* Output Summary Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span>Optimized Mountain Itinerary</span>
              </h3>
              <p className="text-[10px] text-slate-450 uppercase font-mono tracking-widest mt-0.5">
                Calculated transit between: {calculatedJourneyResult.originName} ➔ {calculatedJourneyResult.targetName}
              </p>
            </div>
            
            {/* Preferred Optimize Criteria */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850 p-0.5 bg-slate-50 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setRoutingMetric('time')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
                  routingMetric === 'time' 
                    ? 'bg-sky-500 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                ⏱️ Fastest
              </button>
              <button
                type="button"
                onClick={() => setRoutingMetric('fare')}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
                  routingMetric === 'fare' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                ₹ Cheapest
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Total Distance</span>
              <p className="text-xl font-extrabold text-slate-800 dark:text-white font-mono">{calculatedJourneyResult.totalDistanceKm} Kms</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Est Travel Time</span>
              <p className="text-xl font-extrabold text-slate-800 dark:text-white font-mono">
                {Math.floor(calculatedJourneyResult.totalTimeMin / 60) > 0 ? `${Math.floor(calculatedJourneyResult.totalTimeMin / 60)} hrs ` : ''}
                {calculatedJourneyResult.totalTimeMin % 60} mins
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Shared Ticket</span>
              <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {calculatedJourneyResult.sharedTaxiAvailable ? calculatedJourneyResult.sharedTaxiFareRange : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Reserved Vehicle</span>
              <p className="text-xl font-extrabold text-sky-500 font-mono">{calculatedJourneyResult.reservedTaxiFare}</p>
            </div>
          </div>

          {/* Detailed Journey Tracks / Timeline */}
          {calculatedJourneyResult.isDirectLocalVicinity ? (
            /* Direct Local Vicinity Shortcut path card */
            <div className="p-5 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-teal-500/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">Local Vicinity Route Active</h4>
                  <p className="text-[10px] text-slate-550">Both points are in adjacent vicinity coordinates. High altitude transits or transfer hubs are bypassed.</p>
                </div>
              </div>
              
              <div className="border-l-2 border-teal-300 dark:border-teal-900 pl-4 space-y-4 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Departure</span>
                  <p className="font-bold text-slate-900 dark:text-white">{calculatedJourneyResult.originName}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-teal-600">Travel Instructions</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                    Ride a local shared taxi, pool vehicle, or hire a private tourist coach for <strong>{calculatedJourneyResult.totalDistanceKm} Kms</strong> heading <strong>{calculatedJourneyResult.originBearing}</strong> direction.
                  </p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Arrival</span>
                  <p className="font-bold text-slate-900 dark:text-white">{calculatedJourneyResult.targetName}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Standard high altitude transit pathway */
            <div className="relative border-l-2 border-dashed border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-8 text-left">
              
              {/* Leg 1: Departure feeder link */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 bg-blue-500 text-white p-1 rounded-full border-4 border-white dark:border-slate-900">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-blue-500 font-bold block">Leg 1: Departure & Feeder Corridor</span>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{calculatedJourneyResult.originName}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-350">
                    Board a local feeder transit heading <strong>{calculatedJourneyResult.originBearing}</strong> direction to arrive at the major transport junction: <strong>{calculatedJourneyResult.bestStartHub}</strong> (approx. <strong>{calculatedJourneyResult.originToHubDist} km</strong>).
                  </p>
                </div>
              </div>

              {/* Leg 2: High Altitude Mountain Highway Transit */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 bg-slate-900 dark:bg-slate-750 text-white p-1 rounded-full border-4 border-white dark:border-slate-900">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Leg 2: Mountain Highway Traversal</span>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {calculatedJourneyResult.bestStartHub} ➔ {calculatedJourneyResult.bestEndHub} Run
                    </h4>
                  </div>

                  {/* Multi-hop breakdown */}
                  {calculatedJourneyResult.hubsPath && calculatedJourneyResult.hubsPath.length > 0 ? (
                    <div className="space-y-3 max-w-2xl">
                      {calculatedJourneyResult.hubsPath.map((hop, idx) => (
                        <div key={hop.id || idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-850 flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-sky-500/15 text-sky-500 font-mono font-black text-[9px] px-1.5 py-0.5 rounded-md">HOP {idx + 1}</span>
                              <strong className="text-slate-800 dark:text-slate-200 uppercase">{hop.fromHubId} to {hop.toHubId}</strong>
                            </div>
                            <p className="text-[10px] text-slate-450">
                              Transit: <span className="font-black text-sky-500 uppercase">{hop.type}</span> • Distance: {hop.distance || 32} Kms
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-black text-slate-800 dark:text-slate-100">{hop.timeMin || 90} mins</p>
                            <p className="text-[10px] text-emerald-600 font-extrabold mt-0.5">Shared: ₹{hop.fareMin || 250} - ₹{hop.fareMax || 400}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl text-xs text-slate-500 max-w-lg">
                      No direct highway shuttle cached. Automatically mapping local pre-negotiated shared jeep connections.
                    </div>
                  )}
                  
                  {/* Transfers Info Alert */}
                  {calculatedJourneyResult.numberOfTransfers > 0 && (
                    <div className="bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-xl max-w-xl text-[10px] flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{calculatedJourneyResult.numberOfTransfers} Vehicle switches required. Pay fares separately at respective union syndicate desks.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Leg 3: Arrival destination connection */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0.5 bg-teal-500 text-white p-1 rounded-full border-4 border-white dark:border-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-teal-500 font-bold block">Leg 3: Arrival & Destination Connection</span>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{calculatedJourneyResult.targetName}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-350">
                    Exit at <strong>{calculatedJourneyResult.bestEndHub}</strong>, then board a local syndicate shuttle, shared cab or private taxi for <strong>{calculatedJourneyResult.hubToTargetDist} Kms</strong> heading <strong>{calculatedJourneyResult.targetBearing}</strong> direction to arrive at your final station.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Action Callouts */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3">
            <a
              href="#/taxi/dashboard"
              className="flex-1 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
            >
              <Car className="w-4 h-4" />
              <span>Book Local Driver via Marketplace</span>
            </a>
            <button
              type="button"
              onClick={() => {
                if (setNotification) {
                  setNotification({ type: 'success', message: 'Travel parameters successfully synchronised to offline mobile journal!' });
                }
              }}
              className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save & Export Offline Route Map</span>
            </button>
          </div>

        </div>
      ) : (
        /* Empty / Pre-Search state: Recent, Trending, and Popular dashboard */
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-150 dark:border-slate-850/80 space-y-8 animate-fade-in">
          
          {/* Welcome Title */}
          <div className="text-center space-y-1.5">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Plan Your Himalayan Odyssey</h3>
            <p className="text-xs text-slate-450">Search for any town, viewpoint, homestay, airport, or taxi stand. We will plot the journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Recent Searches & Trending */}
            <div className="space-y-6">
              
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recent Route Searches</span>
                  </h4>
                  <div className="space-y-2">
                    {recentSearches.map((term, idx) => {
                      const parts = term.split(' ➔ ');
                      const from = parts[0] || 'Origin';
                      const to = parts[1] || 'Destination';
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            const oItem = searchIndex.find(s => s.name.toLowerCase() === from.toLowerCase());
                            const dItem = searchIndex.find(s => s.name.toLowerCase() === to.toLowerCase());
                            if (oItem) {
                              setSelectedOrigin(oItem);
                              setOriginQuery(oItem.name);
                            } else {
                              setOriginQuery(from);
                            }
                            if (dItem) {
                              setSelectedTarget(dItem);
                              setDestinationQuery(dItem.name);
                            } else {
                              setDestinationQuery(to);
                            }
                          }}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl hover:bg-slate-50 hover:border-emerald-300 dark:hover:bg-slate-850 cursor-pointer transition text-xs font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600">📍</span>
                            <span className="text-slate-700 dark:text-slate-200">{from}</span>
                            <span className="text-slate-400">➔</span>
                            <span className="text-sky-600">🎯</span>
                            <span className="text-slate-700 dark:text-slate-200">{to}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trending Destinations */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span>Trending Himalayan Towns</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Gangtok', label: '🏔 Gangtok', category: 'Destination' as const },
                    { name: 'Darjeeling', label: '🚂 Darjeeling', category: 'Destination' as const },
                    { name: 'Kalimpong', label: '🍃 Kalimpong', category: 'Destination' as const },
                    { name: 'Pelling', label: '❄️ Pelling', category: 'Destination' as const }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTrendingClick(item.name, item.category)}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl hover:border-emerald-400 dark:hover:border-emerald-800 transition font-bold text-xs text-slate-700 dark:text-slate-200 cursor-pointer text-left flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-3 h-3 text-slate-350" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Popular Attractions & Homestays */}
            <div className="space-y-6">
              
              {/* Popular Attractions */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-sky-500" />
                  <span>Popular Tourist Attractions</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'Gurudongmar Lake', label: '🎯 Gurudongmar Lake', category: 'Attraction' as const },
                    { name: 'Mirik Lake', label: '🎯 Mirik Lake Run', category: 'Attraction' as const },
                    { name: 'Yumthang Valley', label: '🎯 Yumthang Valley', category: 'Attraction' as const }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleTrendingClick(item.name, item.category)}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl hover:bg-slate-50 hover:border-sky-300 dark:hover:bg-slate-850 cursor-pointer transition flex items-center justify-between text-xs font-bold"
                    >
                      <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Homestays */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Mountain Homestays</span>
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'Summit Alpine', label: '🏡 Summit Alpine Homestay', category: 'Homestay' as const },
                    { name: 'Himalayan', label: '🏡 Himalayan Retreat', category: 'Homestay' as const }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleTrendingClick(item.name, item.category)}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl hover:bg-slate-50 hover:border-emerald-300 dark:hover:bg-slate-850 cursor-pointer transition flex items-center justify-between text-xs font-bold"
                    >
                      <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
