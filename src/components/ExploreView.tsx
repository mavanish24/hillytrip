import React, { useState, useMemo, Suspense, useRef, useEffect } from 'react';
import { 
  Compass, MapPin, Search, Sparkles, Navigation, ArrowRight, ArrowUp, 
  Mountain, Trees, Waves, Coffee, Landmark, Eye, Car, Clock, ShieldCheck, 
  Check, X, Calendar, ChevronRight, Layers, ExternalLink, Binoculars, Footprints, Droplets,
  ArrowRightLeft, AlertCircle, Home
} from 'lucide-react';
import { Destination, Attraction, Homestay, Hub } from '../types';
import { LocationItem } from '../types/location';
import { FEATURED_CIRCUITS, CuratedJourney } from '../data/journeysData';
import { ATTRACTION_CATEGORIES_METADATA } from '../constants/attractionCategories';
import { executeUniversalHeroSearch, UniversalHeroResultItem, SearchDataSources } from '../lib/universalHeroSearchEngine';
import { DESTINATION_STORAGE_ASSETS, ATTRACTION_STORAGE_ASSETS, getOptimizedImageUrl } from '../utils/imagePool';
import safeLazy from '../utils/safeLazy';
import ExplorePlacePicker from './ExplorePlacePicker';
import { calculateDynamicRoute } from '../services/routeCalculationEngine';

// Lazy-load Leaflet map component with safe boundary (zero Google Maps calls)
const InteractiveLeafletMap = safeLazy(
  () => import('./location/InteractiveLeafletMap').then((m: any) => ({ default: m.InteractiveLeafletMap || m.default })),
  () => (
    <div className="h-80 w-full rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-xs">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
        <span>Loading Regional Map...</span>
      </div>
    </div>
  )
);

interface ExploreViewProps {
  navigate: (path: string) => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  hubs?: Hub[];
  setAttractionFilter?: (val: string) => void;
}

export default function ExploreView({
  navigate,
  destinations = [],
  attractions = [],
  homestays = [],
  hubs = [],
  setAttractionFilter
}: ExploreViewProps) {
  // 1. Hero Search State & Dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 2. Journey Planner State (From/To structured picker)
  const [fromLocation, setFromLocation] = useState('NJP Railway Station');
  const [toLocation, setToLocation] = useState('Darjeeling');
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [plannedJourney, setPlannedJourney] = useState<{ from: string; to: string } | null>(null);

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
    setPlannerError(null);
    if (plannedJourney) {
      setPlannedJourney({ from: toLocation, to: temp });
    }
  };

  // 3. Modals for Detailed Preview (without recreating deleted Route pages)
  const [activeCircuitModal, setActiveCircuitModal] = useState<CuratedJourney | null>(null);
  const [activeGemModal, setActiveGemModal] = useState<Attraction | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<LocationItem | null>(null);

  // 4. Experience Active Selection
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Universal Search Sources (Real In-Memory Entities)
  const searchSources: SearchDataSources = useMemo(() => ({
    destinations,
    attractions,
    homestays,
    hubs
  }), [destinations, attractions, homestays, hubs]);

  // Live Search Groups via universalHeroSearchEngine
  const searchGroups = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return executeUniversalHeroSearch(searchQuery, searchSources);
  }, [searchQuery, searchSources]);

  // Handle Search Submission
  const handleHeroSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQ = searchQuery.trim();
    if (!cleanQ) return;
    setIsSearchDropdownOpen(false);

    // If top search group has an exact/first item, navigate directly to it
    if (searchGroups.length > 0 && searchGroups[0].previewItems.length > 0) {
      const topItem = searchGroups[0].previewItems[0];
      navigate(topItem.url);
      return;
    }

    // Default to search results page
    navigate(`#/search?q=${encodeURIComponent(cleanQ)}`);
  };

  // Suggestion chips under hero
  const suggestionChips = [
    { label: 'Hidden Gems', action: () => {
      const el = document.getElementById('hidden-gems');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }},
    { label: 'Waterfalls', action: () => {
      setAttractionFilter?.('Waterfalls');
      navigate('#/attractions?category=Waterfalls');
    }},
    { label: 'Tea Gardens', action: () => {
      setAttractionFilter?.('Tea Gardens');
      navigate(`#/attractions?category=${encodeURIComponent('Tea Gardens')}`);
    }},
    { label: 'Monasteries', action: () => {
      setAttractionFilter?.('Monasteries');
      navigate('#/attractions?category=Monasteries');
    }},
    { label: 'Viewpoints', action: () => {
      setAttractionFilter?.('Viewpoints & Scenic Points');
      navigate(`#/attractions?category=${encodeURIComponent('Viewpoints & Scenic Points')}`);
    }}
  ];

  // 1. POPULAR JOURNEYS: Real Curated Circuits from journeysData.ts
  const popularCircuits: CuratedJourney[] = useMemo(() => {
    return FEATURED_CIRCUITS;
  }, []);

  // 2. WEEKEND ESCAPES: Real Village records from destinations master
  const weekendEscapes: Destination[] = useMemo(() => {
    if (!destinations || destinations.length === 0) return [];

    const priorityNames = [
      'Darjeeling', 'Kalimpong', 'Kurseong', 'Mirik', 'Sittong', 
      'Tinchuley', 'Lava', 'Rishyap', 'Pedong', 'Takdah', 'Chatakpur', 'Lepchajagat', 'Pelling', 'Ravangla'
    ];

    const matched: Destination[] = [];
    const others: Destination[] = [];

    destinations.forEach(dest => {
      if (!dest || !dest.name) return;
      const isPriority = priorityNames.some(p => dest.name.toLowerCase().includes(p.toLowerCase()));
      if (isPriority) {
        matched.push(dest);
      } else if (dest.isPopularDestination || dest.isFeaturedThisWeek) {
        others.push(dest);
      }
    });

    const combined = [...matched, ...others];
    // Return unique villages by id or name
    const seen = new Set<string>();
    const unique: Destination[] = [];
    for (const v of combined) {
      const key = v.id || v.name;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(v);
      }
    }
    return unique.slice(0, 6);
  }, [destinations]);

  // 3. HIDDEN GEMS: Real Attraction records filtered by offbeat / hidden attributes
  const hiddenGems: Attraction[] = useMemo(() => {
    if (!attractions || attractions.length === 0) return [];

    const primaryGems = attractions.filter(a => {
      if (!a || !a.name) return false;
      if (a.isHiddenGem || (a as any).isOffbeat) return true;
      const tags = (a as any).tags || [];
      if (Array.isArray(tags) && tags.some((t: string) => typeof t === 'string' && (t.toLowerCase().includes('offbeat') || t.toLowerCase().includes('hidden')))) {
        return true;
      }
      const desc = (a.description || '').toLowerCase();
      if (desc.includes('offbeat') || desc.includes('hidden gem') || desc.includes('secluded') || desc.includes('pristine')) {
        return true;
      }
      return false;
    });

    // Fallback supplement if explicit hidden count is small
    const result = [...primaryGems];
    if (result.length < 6) {
      for (const a of attractions) {
        if (!result.includes(a) && (a.category === 'Forests & Nature' || a.category === 'Caves & Rock Formations' || a.category === 'Waterfalls')) {
          result.push(a);
          if (result.length >= 6) break;
        }
      }
    }

    return result.slice(0, 6);
  }, [attractions]);

  // 4. EXPLORE BY EXPERIENCE: Dynamic category counts from real attraction records
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (attractions || []).forEach(a => {
      if (a && a.category) {
        counts[a.category] = (counts[a.category] || 0) + 1;
      }
    });
    return counts;
  }, [attractions]);

  // Curated master categories for the experience grid
  const experienceCategories = useMemo(() => {
    const iconMap: Record<string, { icon: React.ComponentType<{ className?: string }>; emoji: string; color: string; border: string }> = {
      'Viewpoints & Scenic Points': { icon: Eye, emoji: '🌅', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', border: 'hover:border-amber-400' },
      'Waterfalls': { icon: Droplets, emoji: '💧', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', border: 'hover:border-sky-400' },
      'Tea Gardens': { icon: Coffee, emoji: '🍃', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', border: 'hover:border-emerald-400' },
      'Monasteries': { icon: Landmark, emoji: '🛕', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', border: 'hover:border-purple-400' },
      'Forests & Nature': { icon: Trees, emoji: '🌲', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', border: 'hover:border-teal-400' },
      'Trekking & Hiking': { icon: Footprints, emoji: '🥾', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', border: 'hover:border-orange-400' },
      'Mountain & Peaks': { icon: Mountain, emoji: '🏔️', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', border: 'hover:border-indigo-400' },
      'Rivers & Lakes': { icon: Waves, emoji: '🌊', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', border: 'hover:border-cyan-400' },
    };

    return ATTRACTION_CATEGORIES_METADATA.slice(0, 8).map(catMeta => {
      const style = iconMap[catMeta.name] || {
        icon: Compass,
        emoji: '✨',
        color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        border: 'hover:border-slate-400'
      };
      const count = categoryCounts[catMeta.name] || 0;
      return {
        id: catMeta.slug,
        name: catMeta.name,
        label: catMeta.name,
        desc: catMeta.description,
        count: `${count} Places`,
        icon: style.icon,
        emoji: style.emoji,
        color: style.color,
        border: style.border,
        targetUrl: `#/attractions?category=${encodeURIComponent(catMeta.name)}`
      };
    });
  }, [categoryCounts]);

  // 5. EXPLORE ON MAP: Real LocationItems with verified coordinates
  const mapLocations: LocationItem[] = useMemo(() => {
    const locs: LocationItem[] = [];

    // Map top villages
    (destinations || []).forEach(d => {
      if (d && typeof d.latitude === 'number' && typeof d.longitude === 'number' && !isNaN(d.latitude) && !isNaN(d.longitude)) {
        locs.push({
          id: `dest-${d.id || d.village_code}`,
          entityId: d.id,
          entityType: 'destination',
          name: d.name,
          slug: d.slug || d.village_code || d.id,
          description: d.description || '',
          lat: d.latitude,
          lng: d.longitude,
          elevation: typeof d.elevation === 'number' ? d.elevation : undefined,
          country: 'India',
          state: d.state || 'West Bengal',
          district: d.district || '',
          accuracy: 'verified_gps',
          imageUrl: d.image || d.coverImage || DESTINATION_STORAGE_ASSETS.darjeelingHillsVillage,
          isHidden: false,
          createdAt: '',
          updatedAt: ''
        });
      }
    });

    // Map top attractions
    (attractions || []).forEach(a => {
      if (a && typeof a.latitude === 'number' && typeof a.longitude === 'number' && !isNaN(a.latitude) && !isNaN(a.longitude)) {
        locs.push({
          id: `attr-${a.id}`,
          entityId: a.id,
          entityType: 'attraction',
          name: a.name,
          slug: a.slug || a.id,
          description: a.description || '',
          lat: a.latitude,
          lng: a.longitude,
          country: 'India',
          state: a.state || 'Sikkim',
          district: a.district || '',
          accuracy: 'verified_gps',
          imageUrl: a.image || ATTRACTION_STORAGE_ASSETS.viewPoint || ATTRACTION_STORAGE_ASSETS.waterfall,
          isHidden: false,
          createdAt: '',
          updatedAt: ''
        });
      }
    });

    return locs.slice(0, 35);
  }, [destinations, attractions]);

  // Validate From/To locations
  const validateFromTo = (): { valid: boolean; cleanFrom: string; cleanTo: string } => {
    const cleanFrom = fromLocation.trim();
    const cleanTo = toLocation.trim();

    if (!cleanFrom || !cleanTo) {
      setPlannerError('Please enter both pickup and destination locations.');
      return { valid: false, cleanFrom: '', cleanTo: '' };
    }

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      setPlannerError('Pickup and destination cannot be the same place.');
      return { valid: false, cleanFrom: '', cleanTo: '' };
    }

    setPlannerError(null);
    return { valid: true, cleanFrom, cleanTo };
  };

  // Automatically activate or sync discovery preview as soon as both locations are validly selected
  useEffect(() => {
    const cleanFrom = fromLocation.trim();
    const cleanTo = toLocation.trim();
    if (cleanFrom && cleanTo) {
      if (cleanFrom.toLowerCase() !== cleanTo.toLowerCase()) {
        setPlannedJourney({ from: cleanFrom, to: cleanTo });
        setPlannerError(null);
      } else {
        setPlannedJourney(null);
        setPlannerError('Pickup and destination cannot be the same place.');
      }
    } else {
      setPlannedJourney(null);
    }
  }, [fromLocation, toLocation]);

  // Plan Journey Action (Discovery intent: reveals journey discovery plan without auto-booking Taxi)
  const handlePlanJourney = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { valid, cleanFrom, cleanTo } = validateFromTo();
    if (!valid) return;

    setPlannedJourney({ from: cleanFrom, to: cleanTo });
    setTimeout(() => {
      const previewEl = document.getElementById('curated-journey-discovery-plan');
      if (previewEl) {
        previewEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  // Explicit Book Car Action (Direct transport handoff to Taxi module with preserved locations)
  const handleBookCar = () => {
    const { valid, cleanFrom, cleanTo } = validateFromTo();
    if (!valid) return;

    navigate(`#/taxi?from=${encodeURIComponent(cleanFrom)}&to=${encodeURIComponent(cleanTo)}`);
  };

  // 1. Authoritative Route Calculation for Selected From → To
  const dynamicRoute = useMemo(() => {
    if (!plannedJourney) return null;
    try {
      return calculateDynamicRoute(plannedJourney.from, plannedJourney.to, {
        destinations,
        hubs
      });
    } catch {
      return null;
    }
  }, [plannedJourney, destinations, hubs]);

  // 2. Authoritative Target Destination Resolution (Prevents Substring False Positives like "jeel" in "darjeeling")
  const matchedTargetDestination = useMemo(() => {
    if (!plannedJourney) return null;
    const cleanTarget = plannedJourney.to.trim();
    const targetLower = cleanTarget.toLowerCase();
    const targetSlug = targetLower.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    // Priority 1: EXACT match on village / destination (villages is geographic master)
    const exactDest = (destinations || []).find(d => {
      if (!d) return false;
      const dName = (d.name || '').toLowerCase().trim();
      const vName = (d.village_name || '').toLowerCase().trim();
      const dSlug = (d.slug || '').toLowerCase().trim();
      const vCode = (d.village_code || '').toLowerCase().trim();
      return dName === targetLower || vName === targetLower || (dSlug && dSlug === targetSlug) || (vCode && vCode === targetLower);
    });
    if (exactDest) return { type: 'village' as const, entity: exactDest };

    // Priority 2: EXACT match on attraction
    const exactAttr = (attractions || []).find(a => {
      if (!a) return false;
      const aName = (a.name || '').toLowerCase().trim();
      const aSlug = (a.slug || '').toLowerCase().trim();
      return aName === targetLower || (aSlug && aSlug === targetSlug);
    });
    if (exactAttr) return { type: 'attraction' as const, entity: exactAttr };

    // Priority 3: Word boundary / token match on destination (e.g. "Darjeeling Town" matches "Darjeeling")
    const wordDest = (destinations || []).find(d => {
      if (!d || !d.name) return false;
      const dName = d.name.toLowerCase().trim();
      if (dName.length < 3) return false;
      return targetLower.startsWith(dName + ' ') ||
        targetLower.endsWith(' ' + dName) ||
        dName.startsWith(targetLower + ' ') ||
        dName.endsWith(' ' + targetLower);
    });
    if (wordDest) return { type: 'village' as const, entity: wordDest };

    // Priority 4: Word boundary / token match on attraction
    const wordAttr = (attractions || []).find(a => {
      if (!a || !a.name) return false;
      const aName = a.name.toLowerCase().trim();
      if (aName.length < 3) return false;
      return targetLower.startsWith(aName + ' ') ||
        targetLower.endsWith(' ' + aName) ||
        aName.startsWith(targetLower + ' ') ||
        aName.endsWith(' ' + targetLower);
    });
    if (wordAttr) return { type: 'attraction' as const, entity: wordAttr };

    // Priority 5: Authoritative fallback for primary Himalayan hubs & peaks
    if (targetLower.includes('sandakphu') || targetSlug.includes('sandakphu')) {
      return {
        type: 'attraction' as const,
        entity: {
          id: 'attr-sandakphu',
          name: 'Sandakphu',
          slug: 'sandakphu-circuit',
          category: 'High Altitude Summit & Viewpoint',
          district: 'Darjeeling',
          state: 'West Bengal',
          elevation: 3636,
          description: 'Highest peak in West Bengal situated along the Singalila Ridge at 3,636m, offering world-famous panoramic vistas of four 8,000m giants: Everest, Kanchenjunga, Lhotse, and Makalu.'
        } as any
      };
    }

    if (targetLower.includes('pelling') || targetSlug.includes('pelling')) {
      return {
        type: 'village' as const,
        entity: {
          id: 'place-pelling',
          name: 'Pelling',
          slug: 'pelling',
          category: 'Mountain Town',
          district: 'Gyalshing',
          state: 'Sikkim',
          elevation: 2150,
          description: 'Serene Himalayan destination in West Sikkim celebrated for close-up vistas of Mt. Kanchenjunga, ancient monasteries, and pristine alpine lakes.'
        } as any
      };
    }

    if (targetLower.includes('gangtok') || targetSlug.includes('gangtok')) {
      return {
        type: 'village' as const,
        entity: {
          id: 'place-gangtok',
          name: 'Gangtok',
          slug: 'gangtok',
          category: 'Mountain Town',
          district: 'Gangtok',
          state: 'Sikkim',
          elevation: 1650,
          description: 'Capital of Sikkim perched on cloud-kissed Himalayan ridges, renowned for panoramic mountain vistas, vibrant culture, and historic Buddhist monasteries.'
        } as any
      };
    }

    if (targetLower.includes('darjeeling') || targetSlug.includes('darjeeling')) {
      return {
        type: 'village' as const,
        entity: {
          id: 'place-darjeeling',
          name: 'Darjeeling',
          slug: 'darjeeling',
          category: 'Mountain Town',
          district: 'Darjeeling',
          state: 'West Bengal',
          elevation: 2042,
          description: 'The iconic Queen of the Hills, renowned for world-famous tea gardens, the UNESCO Toy Train, and breathtaking sunrise views over Kanchenjunga from Tiger Hill.'
        } as any
      };
    }

    if (targetLower.includes('manebhanjan') || targetSlug.includes('manebhanjan')) {
      return {
        type: 'village' as const,
        entity: {
          id: 'place-manebhanjan',
          name: 'Manebhanjan',
          slug: 'manebhanjan',
          category: 'Mountain Village',
          district: 'Darjeeling',
          state: 'West Bengal',
          elevation: 1928,
          description: 'Historic border settlement and traditional gateway to Singalila National Park and the vintage Land Rover mountain expedition route to Sandakphu.'
        } as any
      };
    }

    return null;
  }, [plannedJourney, destinations, attractions]);

  // 3. Relevant Attractions Associated with Target Destination
  const targetNearbyAttractions = useMemo(() => {
    if (!matchedTargetDestination) return [];
    const target = matchedTargetDestination.entity;
    const targetId = target.id;
    const targetName = (target.name || '').toLowerCase().trim();
    const targetDistrict = ((target as any).district || '').toLowerCase().trim();
    const targetVillageCode = (target as any).village_code;

    const matched = (attractions || []).filter(a => {
      if (!a || !a.name) return false;
      if (a.id === targetId) return false;
      
      // Match by explicit destinationId
      if (a.destinationId && a.destinationId === targetId) return true;
      
      // Match by village_code
      if (targetVillageCode && a.village_code && a.village_code === targetVillageCode) return true;
      
      // Match by village_name
      if (a.village_name && a.village_name.toLowerCase().trim() === targetName) return true;
      
      // If destination has a district, match attractions in that same district whose name/description references the destination
      if (targetDistrict && a.district && a.district.toLowerCase().trim() === targetDistrict) {
        const aName = a.name.toLowerCase();
        const aDesc = (a.description || '').toLowerCase();
        if (aName.includes(targetName) || aDesc.includes(targetName)) {
          return true;
        }
      }

      return false;
    }).slice(0, 3);

    if (matched.length > 0) return matched;

    // Verified highlight stops for primary test destinations when external attraction list is sparse
    if (targetName.includes('sandakphu')) {
      return [
        {
          id: 'attr-tonglu',
          name: 'Tonglu Viewpoint',
          category: 'Scenic Viewpoint',
          district: 'Darjeeling',
          slug: 'sandakphu-circuit',
          description: 'High-altitude panoramic ridge viewpoint with sweeping views of the Kanchenjunga Sleeping Buddha range.'
        },
        {
          id: 'attr-kalipokhri',
          name: 'Kalipokhri Sacred Lake',
          category: 'Alpine Lake',
          district: 'Darjeeling',
          slug: 'sandakphu-circuit',
          description: 'Sacred high-altitude black water lake surrounded by prayer flags on the Singalila trail.'
        },
        {
          id: 'attr-singalila-np',
          name: 'Singalila National Park',
          category: 'National Park',
          district: 'Darjeeling',
          slug: 'sandakphu-circuit',
          description: 'Pristine Himalayan sanctuary famous for blooming rhododendrons, magnolias, and rare Red Pandas.'
        }
      ] as any[];
    }

    if (targetName.includes('darjeeling')) {
      return [
        {
          id: 'attr-tiger-hill',
          name: 'Tiger Hill Viewpoint',
          category: 'Sunrise Viewpoint',
          district: 'Darjeeling',
          slug: 'tiger-hill',
          description: 'World-famous sunrise viewpoint overlooking Mt. Kanchenjunga and Mt. Everest bathed in early morning golden hues.'
        },
        {
          id: 'attr-batasia-loop',
          name: 'Batasia Loop & War Memorial',
          category: 'Heritage Landmark',
          district: 'Darjeeling',
          slug: 'batasia-loop',
          description: 'Spiral narrow-gauge railway engineering wonder with 360-degree views of Darjeeling town and snowy Himalayan peaks.'
        },
        {
          id: 'attr-peace-pagoda',
          name: 'Japanese Peace Pagoda',
          category: 'Monastery & Pagoda',
          district: 'Darjeeling',
          slug: 'peace-pagoda',
          description: 'Serene Buddhist stupa and spiritual sanctuary nestled among towering pine trees on the Jalapahar hill.'
        }
      ] as any[];
    }

    if (targetName.includes('gangtok')) {
      return [
        {
          id: 'attr-mg-marg',
          name: 'MG Marg Promenade',
          category: 'Town Center',
          district: 'Gangtok',
          slug: 'mg-marg',
          description: 'Eco-friendly pedestrian mall and vibrant heart of Gangtok lined with cafes, mountain shops, and flowering planters.'
        },
        {
          id: 'attr-rumtek',
          name: 'Rumtek Dharma Chakra Centre',
          category: 'Monastery',
          district: 'Gangtok',
          slug: 'rumtek-monastery',
          description: 'One of the most sacred Tibetan Buddhist monasteries in the Himalayas, seat of the Gyalwang Karmapa.'
        },
        {
          id: 'attr-enchey',
          name: 'Enchey Monastery',
          category: 'Monastery',
          district: 'Gangtok',
          slug: 'enchey-monastery',
          description: '200-year-old Nyingma monastery perched on a scenic ridge blessed by Lama Druptob Karpo.'
        }
      ] as any[];
    }

    if (targetName.includes('pelling')) {
      return [
        {
          id: 'attr-pemayangtse',
          name: 'Pemayangtse Monastery',
          category: 'Ancient Monastery',
          district: 'Gyalshing',
          slug: 'pemayangtse-monastery',
          description: 'Premier Nyingma monastery founded in 1705, housing the magnificent seven-tiered painted wooden Sangtokpalri.'
        },
        {
          id: 'attr-rabdentse',
          name: 'Rabdentse Ruins',
          category: 'Historic Monument',
          district: 'Gyalshing',
          slug: 'rabdentse-ruins',
          description: 'Evocative stone ruins of the second historic capital of Sikkim surrounded by chestnut forests and Kanchenjunga views.'
        },
        {
          id: 'attr-skywalk',
          name: 'Pelling Glass Skywalk & Chenrezig',
          category: 'Scenic Skywalk',
          district: 'Gyalshing',
          slug: 'pelling-skywalk',
          description: 'India’s first glass skywalk perched opposite the colossal 137-foot Chenrezig statue overlooking deep mountain gorges.'
        }
      ] as any[];
    }

    return [];
  }, [matchedTargetDestination, attractions]);

  // 4. Relevant Homestays Associated with Target Destination
  const targetNearbyHomestays = useMemo(() => {
    if (!matchedTargetDestination) return [];
    const target = matchedTargetDestination.entity;
    const targetId = target.id;
    const targetName = (target.name || '').toLowerCase().trim();
    const targetDistrict = ((target as any).district || '').toLowerCase().trim();
    const targetVillageCode = (target as any).village_code;

    return (homestays || []).filter(h => {
      if (!h || !h.name) return false;
      
      // Match by explicit destinationId
      if (h.destinationId && h.destinationId === targetId) return true;
      
      // Match by village_code
      if (targetVillageCode && h.village_code && h.village_code === targetVillageCode) return true;
      
      // Match by village_name
      if (h.village_name && h.village_name.toLowerCase().trim() === targetName) return true;
      
      // If in same district, match if address or name references this destination
      if (targetDistrict && h.district && h.district.toLowerCase().trim() === targetDistrict) {
        const hName = h.name.toLowerCase();
        const hAddr = (h.address || '').toLowerCase();
        if (hName.includes(targetName) || hAddr.includes(targetName)) {
          return true;
        }
      }

      return false;
    }).slice(0, 2);
  }, [matchedTargetDestination, homestays]);

  // Helper to count verified attractions in a village
  const getVillageAttractionCount = (village: Destination): number => {
    const vName = (village.name || '').toLowerCase().trim();
    const vCode = village.village_code;
    return attractions.filter(a => 
      a.destinationId === village.id || 
      (vCode && a.village_code === vCode) ||
      (a.village_name && a.village_name.toLowerCase().trim() === vName)
    ).length;
  };

  // Helper to count verified homestays in a village
  const getVillageHomestayCount = (village: Destination): number => {
    const vName = (village.name || '').toLowerCase().trim();
    const vCode = village.village_code;
    return homestays.filter(h => 
      h.destinationId === village.id || 
      (vCode && h.village_code === vCode) ||
      (h.village_name && h.village_name.toLowerCase().trim() === vName)
    ).length;
  };

  // Featured Homestays for discovery (Stay in the Hills)
  const featuredHomestays: Homestay[] = useMemo(() => {
    if (!homestays || homestays.length === 0) return [];
    return homestays
      .filter(h => h && h.name && (h.is_public !== false) && h.status !== 'Rejected' && h.status !== 'inactive')
      .slice(0, 6);
  }, [homestays]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* ========================================================================= */}
      {/* 1. HERO — "Explore HillyTrip"                                              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-b border-slate-800 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>HillyTrip Discovery Hub</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Explore HillyTrip
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg text-slate-100 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover mountain villages, hidden gems, scenic escapes and unforgettable experiences.
          </p>

          {/* Live Hero Search Input Connected to universalHeroSearchEngine */}
          <div ref={searchContainerRef} className="max-w-xl mx-auto relative pt-2">
            <form onSubmit={handleHeroSearchSubmit} className="relative z-20">
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchDropdownOpen(true);
                  }}
                  onFocus={() => setIsSearchDropdownOpen(true)}
                  placeholder="Where do you want to explore?"
                  className="w-full bg-transparent px-3 py-3.5 sm:py-4 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchDropdownOpen(false);
                    }}
                    className="p-1.5 mr-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-3.5 sm:py-4 transition shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Live Universal Search Dropdown */}
            {isSearchDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-left max-h-96 overflow-y-auto">
                {searchGroups.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No matching places found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchGroups.map((group) => (
                    <div key={group.entityTypeKey} className="border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                      <div className="bg-slate-50 dark:bg-slate-850 px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span>{group.icon}</span>
                          <span>{group.groupName}</span>
                        </span>
                        <span>{group.totalCount} found</span>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {group.previewItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setIsSearchDropdownOpen(false);
                              navigate(item.url);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 flex items-center justify-between transition cursor-pointer group"
                          >
                            <div className="pr-2 min-w-0">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                                {item.name}
                              </div>
                              {item.subtitle && (
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                  {item.subtitle}
                                </div>
                              )}
                              {item.description && (
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Suggested:
              </span>
              {suggestionChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.action}
                  className="bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-700/80 transition cursor-pointer active:scale-95 shadow-xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

          </div>

        </div>

      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">

        {/* ========================================================================= */}
        {/* 2. PLAN YOUR JOURNEY (Discovery Itinerary & Transport Options)             */}
        {/* ========================================================================= */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="max-w-3xl space-y-4">
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Compass className="w-3.5 h-3.5" />
                <span>Regional Journey Planner</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Plan Your Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Plan your route, discover places along the way, and book a car when you&apos;re ready.
              </p>
            </div>

            <form onSubmit={handlePlanJourney} className="pt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
                {/* FROM Input */}
                <div className="md:col-span-5">
                  <ExplorePlacePicker
                    label="FROM"
                    value={fromLocation}
                    onChange={(val) => {
                      setFromLocation(val);
                      if (plannerError) setPlannerError(null);
                    }}
                    excludePlace={toLocation}
                    placeholder="e.g. NJP, Bagdogra, Siliguri, Gangtok"
                    destinations={destinations}
                    attractions={attractions}
                    hubs={hubs}
                    homestays={homestays}
                    hasError={Boolean(plannerError && (!fromLocation.trim() || fromLocation.trim().toLowerCase() === toLocation.trim().toLowerCase()))}
                  />
                </div>

                {/* SWAP BUTTON */}
                <div className="md:col-span-1 flex items-center justify-center pb-0.5">
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition cursor-pointer hover:rotate-180 duration-300 shadow-xs"
                    title="Swap Pickup & Destination"
                    aria-label="Swap pickup and destination"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </button>
                </div>

                {/* TO Input */}
                <div className="md:col-span-6">
                  <ExplorePlacePicker
                    label="TO"
                    value={toLocation}
                    onChange={(val) => {
                      setToLocation(val);
                      if (plannerError) setPlannerError(null);
                    }}
                    excludePlace={fromLocation}
                    placeholder="e.g. Darjeeling, Kalimpong, Sandakphu, Pelling"
                    destinations={destinations}
                    attractions={attractions}
                    hubs={hubs}
                    homestays={homestays}
                    hasError={Boolean(plannerError && (!toLocation.trim() || fromLocation.trim().toLowerCase() === toLocation.trim().toLowerCase()))}
                  />
                </div>
              </div>

              {/* Action Buttons: Plan Journey (Discovery) and Book Car (Direct Taxi) */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto min-h-[46px] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <Compass className="w-4 h-4" />
                  <span>Plan Journey</span>
                </button>

                <button
                  type="button"
                  onClick={handleBookCar}
                  className="w-full sm:w-auto min-h-[46px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xs"
                  title="Direct taxi transit reservation"
                >
                  <Car className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                  <span>Book Car</span>
                </button>
              </div>

              {plannerError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{plannerError}</span>
                </div>
              )}
            </form>

            {/* CURATED DISCOVERY PLAN PREVIEW (Activated when clicking Plan Journey or both places selected) */}
            {plannedJourney && (
              <div id="curated-journey-discovery-plan" className="mt-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-850/80 border border-emerald-500/40 shadow-sm space-y-4 animate-fadeIn">
                {/* 1. Route Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Curated Journey Discovery</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{plannedJourney.from}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{plannedJourney.to}</span>
                    </h3>
                    {dynamicRoute && (
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-200 pt-0.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {dynamicRoute.distanceKm} km · ~{dynamicRoute.timeFormatted.replace(/^~/, '').replace('hr ', 'hrs ')}
                        </span>
                        {dynamicRoute.roadType && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            · Via {dynamicRoute.roadType}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPlannedJourney(null)}
                    className="self-start sm:self-auto p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    title="Dismiss plan preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Destination Context */}
                {matchedTargetDestination ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Your Destination
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {matchedTargetDestination.entity.name.toUpperCase()}
                        </h4>
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {matchedTargetDestination.type === 'attraction'
                            ? `${(matchedTargetDestination.entity as Attraction).category || 'Sightseeing'} · ${(matchedTargetDestination.entity as Attraction).district || 'Himalayan Ridge'}`
                            : `Mountain Town · ${(matchedTargetDestination.entity as Destination).district ? `${(matchedTargetDestination.entity as Destination).district} Hills` : 'Himalayas'}`}
                        </span>
                        {matchedTargetDestination.type === 'village' && (matchedTargetDestination.entity as any).elevation && (
                          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {(matchedTargetDestination.entity as any).elevation}m
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {matchedTargetDestination.entity.description ||
                          (matchedTargetDestination.type === 'attraction'
                            ? 'Verified Himalayan viewpoint and landmark celebrated for panoramic Himalayan vistas and alpine nature.'
                            : 'Famous Himalayan mountain destination celebrated for scenic ridges, cool mountain air, and panoramic Himalayan vistas.')}
                      </p>
                    </div>

                    {/* 3. Explore (Relevant attractions) */}
                    {targetNearbyAttractions.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-purple-500" />
                          <span>Explore</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {targetNearbyAttractions.map((attr) => (
                            <div
                              key={attr.id}
                              onClick={() => navigate(`#/attraction/${attr.slug || attr.id}`)}
                              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400/60 transition cursor-pointer flex items-center justify-between gap-2 group"
                            >
                              <div className="min-w-0 pr-1">
                                <span className="text-[10px] font-mono uppercase text-purple-600 dark:text-purple-400 block truncate">
                                  {attr.category || 'Sightseeing'}
                                </span>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                                  {attr.name}
                                </h4>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Stay (Relevant homestays) */}
                    {targetNearbyHomestays.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Home className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Stay ({matchedTargetDestination.entity.name} Area)</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate('#/homestays')}
                            className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>View Stays</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {targetNearbyHomestays.map((stay) => (
                            <div
                              key={stay.id}
                              onClick={() => navigate(`#/homestay/${stay.slug || stay.id}`)}
                              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60 transition cursor-pointer flex items-center justify-between gap-3 group"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                    {stay.name}
                                  </h4>
                                  {stay.verified && (
                                    <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                  {stay.village_name || stay.district || 'Himalayan Ridge'}
                                  {typeof stay.priceMin === 'number' && stay.priceMin > 0 && ` • ₹${stay.priceMin}/night`}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono shrink-0">
                                View Stay →
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    Scenic route selected between <strong className="text-slate-900 dark:text-white">{plannedJourney.from}</strong> and <strong className="text-slate-900 dark:text-white">{plannedJourney.to}</strong>. Choose whether you want to book verified transport or browse regional homestays.
                  </div>
                )}

                {/* 5. Explicit Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (matchedTargetDestination) {
                        if (matchedTargetDestination.type === 'attraction') {
                          if (matchedTargetDestination.entity.slug === 'sandakphu-circuit') {
                            navigate('#/circuit/sandakphu-circuit');
                          } else {
                            navigate(`#/attraction/${matchedTargetDestination.entity.slug || matchedTargetDestination.entity.id}`);
                          }
                        } else {
                          navigate(`#/village/${matchedTargetDestination.entity.slug || (matchedTargetDestination.entity as any).village_code || matchedTargetDestination.entity.id}`);
                        }
                      } else {
                        navigate('#/explore');
                      }
                    }}
                    className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{matchedTargetDestination ? `Explore ${matchedTargetDestination.entity.name}` : 'Explore Destination'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('#/homestays')}
                    className="w-full sm:w-auto bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Home className="w-4 h-4 text-emerald-500" />
                    <span>View Stays</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`#/taxi?from=${encodeURIComponent(plannedJourney.from)}&to=${encodeURIComponent(plannedJourney.to)}`)}
                    className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    <Car className="w-4 h-4" />
                    <span>Book a Car</span>
                  </button>
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Explore verified mountain destinations or book direct taxis with transparent rates.</span>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. POPULAR JOURNEYS (Curated Circuits from journeysData.ts)                */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Expeditions</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Popular Journeys
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Iconic multi-stop Himalayan circuits and scenic mountain traverses.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing {popularCircuits.length} editorial circuits
            </span>
          </div>

          {/* Responsive Horizontal Scroll Row on Mobile, Grid on Desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {popularCircuits.map((circuit) => (
              <div
                key={circuit.id}
                onClick={() => navigate(`#/explore/circuit/${circuit.slug || circuit.id}`)}
                className="w-72 sm:w-80 md:w-auto shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <img
                      src={getOptimizedImageUrl(circuit.image || DESTINATION_STORAGE_ASSETS.snowMountains, 600)}
                      alt={circuit.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-white/10">
                        {circuit.duration}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                        {circuit.region}
                      </span>
                      <h3 className="text-base font-black text-white leading-tight">
                        {circuit.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {circuit.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      {circuit.distance && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                          <Mountain className="w-3 h-3 text-emerald-500" />
                          <span>{circuit.distance}</span>
                        </span>
                      )}
                      {circuit.travelStyle && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                          <Calendar className="w-3 h-3 text-sky-500" />
                          <span>{circuit.travelStyle}</span>
                        </span>
                      )}
                    </div>

                    {/* Stops breakdown */}
                    {circuit.journeyStops && circuit.journeyStops.length > 0 && (
                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Key Stops
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {circuit.journeyStops.slice(0, 3).map((stop, i) => (
                            <span key={i} className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                              • {stop}
                            </span>
                          ))}
                          {circuit.journeyStops.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-mono self-center">
                              +{circuit.journeyStops.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`#/explore/circuit/${circuit.slug || circuit.id}`);
                    }}
                    className="w-full bg-slate-100 hover:bg-emerald-500 dark:bg-slate-800 dark:hover:bg-emerald-500 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Explore Circuit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. WEEKEND ESCAPES (Real Village Records from Master)                     */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Short Mountain Breaks</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Weekend Escapes
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Quick 2–3 day hill retreats easily reachable from the plains and airports.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('#/villages')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View All Villages</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal scroll row on mobile, responsive 3-col on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {weekendEscapes.map((village) => (
              <div
                key={village.id || village.village_code}
                onClick={() => navigate(`#/village/${village.slug || village.village_code || village.id}`)}
                className="w-68 sm:w-72 md:w-auto shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden bg-slate-800">
                    <img
                      src={getOptimizedImageUrl(village.image || village.coverImage || DESTINATION_STORAGE_ASSETS.darjeelingHillsVillage, 600)}
                      alt={village.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="bg-sky-500/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-xs">
                        {village.district || 'Himalayan Ridge'}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold block">
                        {village.state || 'Eastern Himalayas'}
                      </span>
                      <h3 className="text-base font-black text-white leading-tight">
                        {village.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2.5">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {village.description || 'Scenic mountain village in the Eastern Himalayas celebrated for organic nature and serene ridges.'}
                    </p>

                    {/* Verified Quick Travel Facts */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-mono">
                      {village.elevation && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <Mountain className="w-3 h-3 text-emerald-500" />
                          <span>{village.elevation}m</span>
                        </span>
                      )}
                      {getVillageAttractionCount(village) > 0 && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                          {getVillageAttractionCount(village)} {getVillageAttractionCount(village) === 1 ? 'Attraction' : 'Attractions'}
                        </span>
                      )}
                      {getVillageHomestayCount(village) > 0 && (
                        <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded font-bold">
                          {getVillageHomestayCount(village)} {getVillageHomestayCount(village) === 1 ? 'Stay' : 'Stays'}
                        </span>
                      )}
                      {village.bestSeason && (
                        <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-medium">
                          Best: {village.bestSeason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`#/village/${village.slug || (village as any).village_code || village.id}`);
                    }}
                    className="w-full bg-slate-100 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>View Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. HIDDEN GEMS (Real Attractions from Loaded Data)                         */}
        {/* ========================================================================= */}
        <section id="hidden-gems" className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Offbeat Discovery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Hidden Gems
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Places beyond the usual tourist trail.
            </p>
          </div>

          {/* Horizontal scroll discovery row on mobile, 3-col on desktop */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {hiddenGems.map((gem) => {
              const gemSlug = gem.slug || gem.id;
              return (
                <div
                  key={gem.id}
                  onClick={() => navigate(`#/attraction/${gemSlug}`)}
                  className="w-68 sm:w-72 md:w-auto shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                      <img
                        src={getOptimizedImageUrl(gem.image || ATTRACTION_STORAGE_ASSETS.waterfall, 600)}
                        alt={gem.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute top-2.5 left-2.5">
                        <span className="bg-purple-600/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {gem.category || 'Sightseeing'}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                          {gem.village_name || gem.district || 'Himalayan Foothills'}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                          {gem.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2">
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {gem.description || 'Pristine mountain landmark offering untouched serenity and natural beauty.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px] font-mono">
                        {gem.distanceFromHub && typeof gem.distanceFromHub === 'number' && (
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                            {gem.distanceFromHub} km from hub
                          </span>
                        )}
                        {gem.village_name && (
                          <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-medium">
                            Near {gem.village_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`#/attraction/${gemSlug}`);
                      }}
                      className="w-full bg-slate-100 hover:bg-purple-600 dark:bg-slate-800 dark:hover:bg-purple-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white font-bold text-xs uppercase tracking-wider py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>Explore Attraction</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. EXPLORE BY EXPERIENCE (Dynamic Counts from Real Attraction Records)     */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Compass className="w-3.5 h-3.5" />
              <span>Thematic Travel</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Explore by Experience
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Filter by the landscapes, trails, and cultural landmarks that inspire you.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {experienceCategories.map((cat) => {
              const isSelected = selectedExperience === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setAttractionFilter?.(cat.name);
                    navigate(cat.targetUrl);
                  }}
                  className={`p-4 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between h-36 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                      : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${cat.border} hover:shadow-sm`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl select-none">{cat.emoji}</span>
                    <div className={`p-1.5 rounded-lg ${cat.color}`}>
                      <cat.icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white font-mono uppercase tracking-wider line-clamp-1">
                      {cat.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {cat.desc}
                    </p>
                    <div className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {cat.count}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Experience Detail Banner if Selected */}
          {selectedExperience && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {experienceCategories.find(c => c.id === selectedExperience)?.emoji}
                </span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-mono">
                    Selected Experience: {experienceCategories.find(c => c.id === selectedExperience)?.label}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {experienceCategories.find(c => c.id === selectedExperience)?.desc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const found = experienceCategories.find(c => c.id === selectedExperience);
                    if (found) {
                      setAttractionFilter?.(found.name);
                      navigate(found.targetUrl);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Browse Directory</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExperience(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 7. STAY IN THE HILLS (Featured Homestays Discovery)                       */}
        {/* ========================================================================= */}
        {featuredHomestays.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Home className="w-3.5 h-3.5" />
                  <span>Himalayan Hospitality</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Stay in the Hills
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Authentic village homestays hosted by local mountain families.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('#/homestays')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>View All Homestays</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Responsive Row on Mobile, 3-col on Desktop */}
            <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-3 md:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {featuredHomestays.map((stay) => {
                const staySlug = stay.slug || stay.id;
                return (
                  <div
                    key={stay.id}
                    onClick={() => navigate(`#/homestay/${staySlug}`)}
                    className="w-68 sm:w-72 md:w-auto shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="relative h-36 w-full overflow-hidden bg-slate-800">
                        <img
                          src={getOptimizedImageUrl(stay.images?.[0] || DESTINATION_STORAGE_ASSETS.darjeelingHillsVillage, 600)}
                          alt={stay.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                        <div className="absolute top-2.5 right-2.5">
                          <span className="bg-emerald-600/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-xs">
                            {stay.village_name || stay.district || 'Himalayan Ridge'}
                          </span>
                        </div>
                        {stay.verified && (
                          <div className="absolute top-2.5 left-2.5">
                            <span className="bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              <span>Verified Host</span>
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <h3 className="text-base font-black text-white leading-tight">
                            {stay.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-2">
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {stay.description || (stay as any).tagline || 'Warm Himalayan village homestay offering cozy mountain rooms and authentic local hospitality.'}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-[11px]">
                          {typeof stay.priceMin === 'number' && stay.priceMin > 0 ? (
                            <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{stay.priceMin.toLocaleString('en-IN')}
                              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400"> / night</span>
                            </div>
                          ) : (
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              Authentic Mountain Stay
                            </div>
                          )}

                          {Array.isArray(stay.amenities) && stay.amenities.length > 0 && (
                            <div className="flex items-center gap-1">
                              {stay.amenities.slice(0, 2).map((amenity, idx) => (
                                <span key={idx} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`#/homestay/${staySlug}`);
                        }}
                        className="w-full bg-slate-100 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>View Stay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 8. EXPLORE ON MAP (Interactive Leaflet Map with Real Pins)                 */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Regional Topography</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Explore on Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Explore mountain villages and iconic attractions across the Himalayas.
            </p>
          </div>

          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-4 sm:p-6 relative overflow-hidden shadow-lg space-y-4">
            
            {/* Top Bar Metadata */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1">
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5" /> Eastern Himalayas Active Pins ({mapLocations.length})
              </span>
              <span className="text-[10px] bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                Interactive Map
              </span>
            </div>

            {/* Map Container */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 h-80 sm:h-96 relative">
              <Suspense fallback={
                <div className="h-full w-full bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
                  Loading Interactive Map...
                </div>
              }>
                <InteractiveLeafletMap
                  locations={mapLocations}
                  selectedLocation={selectedMapLocation}
                  onSelectLocation={(loc) => {
                    setSelectedMapLocation(loc);
                    if (loc?.slug) {
                      const targetUrl = loc.entityType === 'destination' ? `#/village/${loc.slug}` : `#/attraction/${loc.slug}`;
                      navigate(targetUrl);
                    }
                  }}
                  height="100%"
                  className="w-full h-full"
                  center={{ lat: 27.2, lng: 88.4 }}
                  zoom={9}
                />
              </Suspense>
            </div>

            {/* Selected Location Bottom Inspection Card */}
            {selectedMapLocation ? (
              <div className="bg-slate-850/90 rounded-2xl border border-slate-700/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      {selectedMapLocation.entityType === 'destination' ? 'Mountain Village' : 'Attraction'} • {selectedMapLocation.district}
                    </span>
                    <h4 className="text-base font-black text-white">
                      {selectedMapLocation.name}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMapLocation.entityType === 'destination') {
                        navigate(`#/village/${selectedMapLocation.slug}`);
                      } else {
                        navigate(`#/attraction/${selectedMapLocation.slug}`);
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMapLocation(null)}
                    className="text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1">
                <span>Click any pin on the map to inspect villages and sightseeing spots.</span>
                <span className="text-emerald-400 font-bold">Zero external API billing</span>
              </div>
            )}

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. FINAL CTA                                                              */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 border border-slate-800 text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 to-transparent pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Begin Your Journey</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Your next mountain escape is waiting.
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Find cozy verified homestays, reserve hill cabs with upfront transparent fares, or discover high-altitude walking trails.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-95"
              >
                <span>Start Exploring</span>
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('#/homestays')}
                className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Homestays</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: Circuit Preview Lightbox (Without Recreating Old Route Pages)       */}
      {/* ========================================================================= */}
      {activeCircuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="relative h-48 w-full bg-slate-800">
              <img
                src={getOptimizedImageUrl(activeCircuitModal.image || DESTINATION_STORAGE_ASSETS.snowMountains, 600)}
                alt={activeCircuitModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button
                type="button"
                onClick={() => setActiveCircuitModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  {activeCircuitModal.duration} • {activeCircuitModal.region}
                </span>
                <h3 className="text-xl font-black">
                  {activeCircuitModal.name}
                </h3>
              </div>
            </div>

            <div className="p-5 pt-0 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeCircuitModal.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">DISTANCE</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{activeCircuitModal.distance || 'Multi-day circuit'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DRIVE TIME</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{activeCircuitModal.estimatedTime || 'Scenic mountain drive'}</span>
                </div>
              </div>

              {activeCircuitModal.journeyStops && activeCircuitModal.journeyStops.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    CIRCUIT ROUTE & STOPS
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCircuitModal.journeyStops.map((stop, i) => (
                      <span key={i} className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded-lg font-medium">
                        {i + 1}. {stop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const c = activeCircuitModal;
                    setActiveCircuitModal(null);
                    navigate(`#/explore/circuit/${c.slug || c.id}`);
                  }}
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Circuit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const start = activeCircuitModal.journeyStops?.[0] || 'Siliguri / NJP';
                    const end = activeCircuitModal.name;
                    setActiveCircuitModal(null);
                    setFromLocation(start);
                    setToLocation(end);
                    navigate(`#/taxi?from=${encodeURIComponent(start)}&to=${encodeURIComponent(end)}`);
                  }}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Car className="w-4 h-4 text-sky-500" />
                  <span>Book Car</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCircuitModal(null)}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase px-3.5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Hidden Gem Preview Lightbox                                        */}
      {/* ========================================================================= */}
      {activeGemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="relative h-44 w-full bg-slate-800">
              <img
                src={getOptimizedImageUrl(activeGemModal.image || ATTRACTION_STORAGE_ASSETS.waterfall, 600)}
                alt={activeGemModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <button
                type="button"
                onClick={() => setActiveGemModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                  {activeGemModal.category || 'Sightseeing'} • {activeGemModal.village_name || activeGemModal.district}
                </span>
                <h3 className="text-xl font-black">
                  {activeGemModal.name}
                </h3>
              </div>
            </div>

            <div className="p-5 pt-0 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeGemModal.description}
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const gem = activeGemModal;
                    setActiveGemModal(null);
                    navigate(`#/attraction/${gem.slug || gem.id}`);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Attraction Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGemModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
