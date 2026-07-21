import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowLeft, Mic, X, Clock, Sparkles, MapPin, Home, 
  Compass, Map, BookOpen, Users, Briefcase, MessageSquare, 
  Star, Car, FileText, ChevronRight, Trash2, HelpCircle,
  Filter, MapIcon, Grid, Sliders, Calendar, CheckCircle2, 
  Utensils, Tent, Phone, ArrowUpRight, ShieldCheck, Heart, 
  ThumbsUp, Layers, Info, Maximize2, Minimize2, Check, ExternalLink
} from 'lucide-react';
import { Destination, Attraction, Homestay, Route, Hub, Driver } from '../types';
import { businessConfigurations } from './businessConfigurations';
import { UniversalInventoryEngine } from '../lib/inventoryEngine';

// Extended search item structure for high quality unified search source mapping
interface UnifiedSearchItem {
  id: string;
  name: string;
  category: 
    | 'Destination' 
    | 'Village' 
    | 'Attraction' 
    | 'Homestay' 
    | 'Taxi Operator' 
    | 'Tour Operator' 
    | 'Restaurant' 
    | 'Guide' 
    | 'Camping' 
    | 'Experience' 
    | 'Route' 
    | 'Event' 
    | 'Blog';
  location: string;
  image: string;
  rating: number;
  reviewsCount: number;
  price?: number;
  priceType?: string; // e.g., "per night", "per day", "approx fare"
  distance: number; // Simulated distance in km from search hub (e.g., Kalimpong or Darjeeling)
  verified: boolean;
  tags: string[];
  amenities: string[];
  features: {
    familyFriendly: boolean;
    petFriendly: boolean;
    parking: boolean;
    mountainView: boolean;
    freeWifi: boolean;
    openNow: boolean;
  };
  latitude: number;
  longitude: number;
  detailsUrl: string;
  description: string;
}

interface UniversalSearchProps {
  navigate: (path: string) => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  routes?: Route[];
  hubs?: Hub[];
  drivers?: Driver[];
}

export function UniversalSearch({
  navigate,
  destinations = [],
  attractions = [],
  homestays = [],
  routes = [],
  hubs = [],
  drivers = []
}: UniversalSearchProps) {
  // Query & state parameters
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Advanced Filter state variables
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [featuresFilter, setFeaturesFilter] = useState({
    familyFriendly: false,
    petFriendly: false,
    parking: false,
    mountainView: false,
    freeWifi: false,
    openNow: false,
  });

  // Universal Availability & Inventory Engine checking fields
  const [searchStartDate, setSearchStartDate] = useState<string>('2026-07-22');
  const [searchEndDate, setSearchEndDate] = useState<string>('2026-07-25');
  const [filterByAvailability, setFilterByAvailability] = useState<boolean>(false);

  // UI state variables
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('split');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>('relevance');
  const [aiInputText, setAiInputText] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Pagination / Infinite scrolling state variables
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Map viewport panning/zooming simulation states
  const [mapScale, setMapScale] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const isDraggingMap = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation indexes for autocomplete list and results
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hillytrip_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, 8));
        }
      }
    } catch (e) {
      console.error('Failed to load recent searches:', e);
    }
  }, []);

  // Save query to recent searches
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const cleaned = searchQuery.trim();
    const updated = [cleaned, ...recentSearches.filter(s => s.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem('hillytrip_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  };

  const deleteRecentSearch = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== text);
    setRecentSearches(updated);
    try {
      localStorage.setItem('hillytrip_recent_searches', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update recent searches:', err);
    }
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('hillytrip_recent_searches');
    } catch (err) {
      console.error('Failed to clear recent searches:', err);
    }
  };

  // Synchronize URL search parameters for SEO shareability
  // Reads query on mount/refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parseParams = () => {
        const params = new URLSearchParams(window.location.search);
        
        // Also parse hash parameters if exists (e.g. #/search?q=lava)
        const hash = window.location.hash;
        const qIndex = hash.indexOf('?');
        const hashParams = qIndex !== -1 ? new URLSearchParams(hash.substring(qIndex + 1)) : null;

        const q = hashParams?.get('q') || params.get('q') || '';
        const cat = hashParams?.get('category') || params.get('category') || 'All';
        const rating = hashParams?.get('rating') || params.get('rating') || '';
        const verified = hashParams?.get('verified') || params.get('verified') || '';
        const dest = hashParams?.get('destination') || params.get('destination') || '';

        if (q) setQuery(q);
        if (cat && cat !== 'All') {
          // Normalize names
          const capitalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
          setActiveCategory(capitalized);
        }
        if (rating) setMinRating(parseFloat(rating));
        if (verified === 'true') setVerifiedOnly(true);
        if (dest) {
          setQuery(prev => prev ? `${prev} ${dest}` : dest);
        }
      };

      parseParams();
      // Listen for hash changes
      window.addEventListener('hashchange', parseParams);
      return () => window.removeEventListener('hashchange', parseParams);
    }
  }, []);

  // Update URL hash parameter to remain bookmarkable and shareable
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (activeCategory !== 'All') params.set('category', activeCategory.toLowerCase());
        if (minRating > 0) params.set('rating', minRating.toString());
        if (verifiedOnly) params.set('verified', 'true');

        const queryString = params.toString();
        const baseHash = '#/search';
        const newHash = queryString ? `${baseHash}?${queryString}` : baseHash;
        
        // Use replaceState to avoid cluttering navigation history
        window.history.replaceState(null, '', newHash);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query, activeCategory, minRating, verifiedOnly]);

  // Automatically focus on search field
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Simulated GPS or Current Location Reference
  const currentHubLocation = {
    name: 'Kalimpong Town Hub',
    latitude: 27.05,
    longitude: 88.47
  };

  // Complete, Scalable Meta-driven Dataset
  // We index passed props AND inject structured Master Data configs for missing segments
  const masterUnifiedSearchIndex = useMemo(() => {
    const index: UnifiedSearchItem[] = [];

    // Helper coordinates mapper for locations
    const getCoords = (name: string, fallbackLat = 27.0, fallbackLng = 88.4) => {
      const normalized = name.toLowerCase().trim();
      const coords: Record<string, { lat: number; lng: number }> = {
        'darjeeling': { lat: 27.05, lng: 88.26 },
        'kalimpong': { lat: 27.06, lng: 88.47 },
        'lava': { lat: 27.08, lng: 88.66 },
        'rishop': { lat: 27.10, lng: 88.64 },
        'pedong': { lat: 27.14, lng: 88.57 },
        'loleygaon': { lat: 27.01, lng: 88.56 },
        'mirik': { lat: 26.90, lng: 88.17 },
        'kurseong': { lat: 26.88, lng: 88.28 },
        'sittong': { lat: 26.94, lng: 88.35 },
        'kolakham': { lat: 27.10, lng: 88.68 },
        'rimbik': { lat: 27.11, lng: 88.10 },
        'chatakpur': { lat: 26.97, lng: 88.28 },
        'lepchajagat': { lat: 27.02, lng: 88.20 }
      };
      return coords[normalized] || { lat: fallbackLat, lng: fallbackLng };
    };

    // 1. INDEX DESTINATIONS (including Villages if marked or rural tourism)
    destinations.forEach(d => {
      const isVillageType = d.tourismType?.toLowerCase().includes('village') || 
                            d.tourismType?.toLowerCase().includes('offbeat') ||
                            ['Lava', 'Rishop', 'Kolakham', 'Sittong', 'Lepchajagat', 'Chatakpur'].includes(d.name);
      
      const c = getCoords(d.name, d.latitude, d.longitude);
      index.push({
        id: d.id,
        name: d.name,
        category: isVillageType ? 'Village' : 'Destination',
        location: `${d.district || 'Pristine District'}, ${d.state || 'West Bengal'}`,
        image: d.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
        rating: 4.8,
        reviewsCount: Math.floor(Math.random() * 40) + 15,
        distance: Number((Math.sqrt(Math.pow(c.lat - currentHubLocation.latitude, 2) + Math.pow(c.lng - currentHubLocation.longitude, 2)) * 100).toFixed(1)),
        verified: d.isFeaturedThisWeek || d.isPopularDestination || true,
        tags: [
          'destination', 'village', d.tourismType, d.bestSeason, 'mountain', 'snow', 'view', 'ridge'
        ].map(t => (t || '').toLowerCase()),
        amenities: ['Viewpoint', 'Hike Trails', 'Local Food'],
        features: {
          familyFriendly: true,
          petFriendly: true,
          parking: true,
          mountainView: true,
          freeWifi: false,
          openNow: true
        },
        latitude: c.lat,
        longitude: c.lng,
        detailsUrl: `#/destination/${d.id}`,
        description: d.description || 'Stunning Himalayan ridge destination offering panoramic views.'
      });
    });

    // 2. INDEX ATTRACTIONS
    attractions.forEach(a => {
      const dest = destinations.find(d => d.id === a.destinationId);
      const destName = dest ? dest.name : 'Remote Ridge';
      const c = getCoords(destName, a.latitude, a.longitude);
      index.push({
        id: a.id,
        name: a.name,
        category: 'Attraction',
        location: `${destName}, ${a.district || 'Himalayas'}`,
        image: a.image || 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=600&auto=format&fit=crop',
        rating: 4.6,
        reviewsCount: Math.floor(Math.random() * 80) + 20,
        distance: Number((Math.sqrt(Math.pow(c.lat - currentHubLocation.latitude, 2) + Math.pow(c.lng - currentHubLocation.longitude, 2)) * 100 + 3).toFixed(1)),
        verified: a.isFeaturedAttraction || false,
        tags: [
          'attraction', a.category, 'scenic', 'trek', 'monastery', 'waterfall', 'viewpoint', destName
        ].map(t => (t || '').toLowerCase()),
        amenities: ['Parking', 'Guide Support', 'Food Stall'],
        features: {
          familyFriendly: true,
          petFriendly: false,
          parking: true,
          mountainView: true,
          freeWifi: false,
          openNow: true
        },
        latitude: c.lat + 0.01,
        longitude: c.lng - 0.01,
        detailsUrl: `#/attraction/${a.id}`,
        description: a.description || 'Iconic sightseeing venue with breathtaking mountain landscapes.'
      });
    });

    // 3. INDEX HOMESTAYS
    homestays.forEach(h => {
      const dest = destinations.find(d => d.id === h.destinationId);
      const destName = dest ? dest.name : 'Himalayan Foothills';
      const c = getCoords(destName, h.latitude, h.longitude);
      index.push({
        id: h.id,
        name: h.name,
        category: 'Homestay',
        location: `${destName}, ${h.district || h.address || 'Hills'}`,
        image: (h.images && h.images[0]) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
        rating: 4.5 + (Math.random() * 0.4),
        reviewsCount: Math.floor(Math.random() * 30) + 5,
        price: h.priceMin || 1800,
        priceType: 'per night',
        distance: Number((Math.sqrt(Math.pow(c.lat - currentHubLocation.latitude, 2) + Math.pow(c.lng - currentHubLocation.longitude, 2)) * 100 - 2).toFixed(1)),
        verified: h.status === 'Approved' || true,
        tags: [
          'homestay', 'stay', 'room', 'hostel', 'lodge', destName, ...(h.amenities || [])
        ].map(t => (t || '').toLowerCase()),
        amenities: h.amenities || ['Hot Water', 'Home Cooked Meals', 'Campfire'],
        features: {
          familyFriendly: true,
          petFriendly: (h.amenities || []).some(a => a.toLowerCase().includes('pet')),
          parking: (h.amenities || []).some(a => a.toLowerCase().includes('park')),
          mountainView: (h.amenities || []).some(a => a.toLowerCase().includes('view') || a.toLowerCase().includes('mountain')),
          freeWifi: (h.amenities || []).some(a => a.toLowerCase().includes('wifi') || a.toLowerCase().includes('internet')),
          openNow: h.status !== 'temporarilyClosed'
        },
        latitude: c.lat + 0.005,
        longitude: c.lng + 0.005,
        detailsUrl: `#/homestay/${h.id}`,
        description: `Experience authentic local hospitality with warm rooms and custom farm-to-table meals run by local families.`
      });
    });

    // 4. INDEX TAXI OPERATORS (from drivers prop)
    drivers.forEach(d => {
      index.push({
        id: d.id,
        name: d.name,
        category: 'Taxi Operator',
        location: `Base: ${d.serviceAreas || 'Sikkim-Bengal region'}`,
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=600&auto=format&fit=crop',
        rating: 4.7,
        reviewsCount: Math.floor(Math.random() * 50) + 12,
        price: d.pricingPerDay || 3200,
        priceType: 'per day',
        distance: Math.floor(Math.random() * 15) + 2,
        verified: d.status === 'Approved' || true,
        tags: ['taxi', 'cab', 'driver', 'operator', d.vehicleType, d.vehicleName, d.serviceAreas].map(t => (t || '').toLowerCase()),
        amenities: ['English Speaking', 'Music System', 'Carrier', 'AC'],
        features: {
          familyFriendly: true,
          petFriendly: true,
          parking: false,
          mountainView: false,
          freeWifi: false,
          openNow: true
        },
        latitude: currentHubLocation.latitude + (Math.random() * 0.1 - 0.05),
        longitude: currentHubLocation.longitude + (Math.random() * 0.1 - 0.05),
        detailsUrl: `#/business`,
        description: `Safe, licensed driver operating comfortable vehicle ${d.vehicleName} (${d.vehicleType}) with complete permit clearances.`
      });
    });

    // 5. INDEX ROUTES
    routes.forEach(r => {
      const fromHubName = hubs.find(h => h.id === r.fromHubId)?.name || r.fromHubId.toUpperCase();
      const toHubName = hubs.find(h => h.id === r.toHubId)?.name || r.toHubId.toUpperCase();
      index.push({
        id: r.id,
        name: `${fromHubName} ⇆ ${toHubName}`,
        category: 'Route',
        location: `Transit Option | Type: ${r.type}`,
        image: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?q=80&w=600&auto=format&fit=crop',
        rating: 4.5,
        reviewsCount: Math.floor(Math.random() * 15) + 3,
        price: r.fareMin,
        priceType: 'starting fare',
        distance: r.distance || 45,
        verified: r.verified || true,
        tags: ['route', 'path', 'highway', 'shared jeep', 'taxi', fromHubName, toHubName, r.type].map(t => t.toLowerCase()),
        amenities: ['Shared Options', 'Reserved Cab', 'Stops on request'],
        features: {
          familyFriendly: true,
          petFriendly: false,
          parking: false,
          mountainView: true,
          freeWifi: false,
          openNow: true
        },
        latitude: (getCoords(fromHubName).lat + getCoords(toHubName).lat) / 2,
        longitude: (getCoords(fromHubName).lng + getCoords(toHubName).lng) / 2,
        detailsUrl: `#/plan-my-trip`,
        description: `Established travel segment spanning ${r.distance || '40'} KM. Estimated duration: ${Math.round(r.timeMin)}-${Math.round(r.timeMax)} minutes.`
      });
    });

    // 6. MASTER DATA RESTAURANTS & CAFES (Highly Config-driven)
    const masterRestaurants = [
      {
        id: 'glinarys-darjeeling',
        name: "Glenary's Bakery, Restaurant & Pub",
        location: "Nehru Road, Darjeeling",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop",
        rating: 4.8,
        reviewsCount: 342,
        price: 450,
        distance: 12.4,
        tags: ['restaurant', 'cafe', 'food', 'bakery', 'pub', 'glinarys', 'darjeeling', 'pizza', 'beer', 'breakfast'],
        amenities: ['Free WiFi', 'Outdoor Seating', 'Live Music', 'Bar'],
        latitude: 27.047,
        longitude: 88.263,
        description: "Historic colonial bakery and pub offering high-quality pastries, sizzling Continental main courses, and sweeping view of Mount Kanchenjunga."
      },
      {
        id: 'orchid-lava',
        name: "The Orchid Multi-Cuisine Diner",
        location: "Near Monastery Gate, Lava",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop",
        rating: 4.4,
        reviewsCount: 58,
        price: 250,
        distance: 18.2,
        tags: ['restaurant', 'food', 'orchid', 'momo', 'lava', 'thali', 'chinese'],
        amenities: ['Parking', 'Family Friendly', 'Vegetarian Options'],
        latitude: 27.085,
        longitude: 88.662,
        description: "Savor steaming local Tibetan momos, spiced noodle bowls, and hot traditional Indian thalis right after hiking Neora Valley forests."
      },
      {
        id: 'kalimpong-bistro',
        name: "Lhasa Cafe & Art Bistro",
        location: "Rishi Road, Kalimpong",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop",
        rating: 4.6,
        reviewsCount: 89,
        price: 180,
        distance: 1.5,
        tags: ['restaurant', 'cafe', 'lhasa', 'coffee', 'kalimpong', 'tibetan', 'thenthuk', 'shakes'],
        amenities: ['Free WiFi', 'Mountain View', 'Vegan Options'],
        latitude: 27.058,
        longitude: 88.468,
        description: "Charming art café serving premium single-origin tea, handmade organic breads, traditional Lhasa Thukpa, and locally sourced artisan coffees."
      }
    ];

    masterRestaurants.forEach(r => {
      index.push({
        ...r,
        category: 'Restaurant',
        priceType: 'average cost',
        verified: true,
        features: {
          familyFriendly: true,
          petFriendly: true,
          parking: r.amenities.includes('Parking'),
          mountainView: r.amenities.includes('Mountain View'),
          freeWifi: r.amenities.includes('Free WiFi'),
          openNow: true
        },
        detailsUrl: `#/explore`
      });
    });

    // 7. MASTER DATA TREK GUIDES
    const masterGuides = [
      {
        id: 'tsering-guide',
        name: "Tsering Sherpa (Alpine Specialist)",
        location: "Base: Sandakphu & Singalila Range",
        image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?q=80&w=600&auto=format&fit=crop",
        rating: 4.9,
        reviewsCount: 94,
        price: 1500,
        distance: 4.5,
        tags: ['guide', 'local', 'trekking', 'sandakphu', 'phalut', 'singalila', 'hike', 'climbing', 'mountain', 'sherpa'],
        amenities: ['First Aid Certified', 'Language: English', 'Camping Gears Included', 'Snow Trek Permit Support'],
        latitude: 27.112,
        longitude: 88.102,
        description: "Certified IMF High Altitude Guide with over 15 years climbing active peaks, specialized in winter survival and botanical trails."
      },
      {
        id: 'anup-guide',
        name: "Anup Tamang (Neora Birding Expert)",
        location: "Base: Lava & Kolakham Forest",
        image: "https://images.unsplash.com/photo-1542103749-8ef59b94f4d3?q=80&w=600&auto=format&fit=crop",
        rating: 4.7,
        reviewsCount: 38,
        price: 1200,
        distance: 18.0,
        tags: ['guide', 'birds', 'wildlife', 'lava', 'forest', 'neora', 'safari', 'nature', 'photos'],
        amenities: ['Binoculars Provided', 'Language: Hindi', 'Photography Guide', 'Wilderness Permit Support'],
        latitude: 27.086,
        longitude: 88.665,
        description: "Dedicated wildlife naturalist focused on spotting endangered Red Pandas and Himalayan Hornbills in the moist high-altitude subtropical forests."
      }
    ];

    masterGuides.forEach(g => {
      index.push({
        ...g,
        category: 'Guide',
        priceType: 'per day',
        verified: true,
        features: {
          familyFriendly: true,
          petFriendly: false,
          parking: false,
          mountainView: true,
          freeWifi: false,
          openNow: true
        },
        detailsUrl: `#/explore`
      });
    });

    // 8. MASTER DATA CAMPING & GLAMPING
    const masterCamping = [
      {
        id: 'river-camp-teesta',
        name: "Teesta Riverside Glamping Grounds",
        location: "Melli, River Teesta Valley",
        image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
        rating: 4.6,
        reviewsCount: 71,
        price: 2500,
        distance: 14.8,
        tags: ['camping', 'stay', 'tent', 'river', 'melli', 'teesta', 'rafting', 'bonfire', 'glamping'],
        amenities: ['Attached Washrooms', 'Rafting Gear', 'BBQ Grills', 'Free Parking'],
        latitude: 27.090,
        longitude: 88.420,
        description: "Premium safari tents pitched on the white sand banks of the glacier-fed Teesta, combining starry wild camps with clean bathrooms and hot grills."
      },
      {
        id: 'pine-camp-lava',
        name: "Pine Forest Canopy Camps",
        location: "Rishyap-Lava Ridge",
        image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=600&auto=format&fit=crop",
        rating: 4.8,
        reviewsCount: 46,
        price: 1400,
        distance: 19.1,
        tags: ['camping', 'lava', 'rishyap', 'pine', 'forest', 'stargazing', 'tent', 'bonfire'],
        amenities: ['Sleeping Bags Provided', 'Campfire Circle', 'Outdoor Kitchen'],
        latitude: 27.098,
        longitude: 88.641,
        description: "Sleep under a colossal cathedral of whispering conifers at 8,200 feet. Crystal clear stargazing and panoramic Kanchenjunga sunrises."
      }
    ];

    masterCamping.forEach(c => {
      index.push({
        ...c,
        category: 'Camping',
        priceType: 'per night',
        verified: true,
        features: {
          familyFriendly: true,
          petFriendly: true,
          parking: c.amenities.includes('Free Parking'),
          mountainView: true,
          freeWifi: false,
          openNow: true
        },
        detailsUrl: `#/explore`
      });
    });

    // 9. MASTER DATA TOUR OPERATORS
    const masterTourOps = [
      {
        id: 'kanchenjunga-exp',
        name: "Kanchenjunga Base Camp Tour Operator",
        location: "Vibrant Hills Complex, Darjeeling",
        image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop",
        rating: 4.9,
        reviewsCount: 114,
        price: 18500,
        distance: 12.0,
        tags: ['tour', 'operator', 'package', 'kanchenjunga', 'basecamp', 'darjeeling', 'trek', 'sherpa'],
        amenities: ['Permit Insurance', 'Porter Services', 'All Meals Included', 'Oxygen cylinders'],
        latitude: 27.045,
        longitude: 88.261,
        description: "Experienced outfit organizing multi-day trek packages to remote Dzongri and Goecha La viewpoints, supported by certified high-altitude medics."
      },
      {
        id: 'mirik-organic-stay-tour',
        name: "Mirik Organic Homestay Trail Tour",
        location: "Starting point: Mirik Lake Terminal",
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop",
        rating: 4.7,
        reviewsCount: 29,
        price: 3400,
        distance: 28.5,
        tags: ['tour', 'operator', 'package', 'mirik', 'organic', 'stay', 'farm', 'tea', 'orange'],
        amenities: ['Private Cab Transport', 'Tea Gardens Entry Fee', 'Farm Stay Included'],
        latitude: 26.902,
        longitude: 88.172,
        description: "An immersive weekend agriculture trail across orange orchard hamlets and tea estates, with fresh organic dairy breakfasts."
      }
    ];

    masterTourOps.forEach(op => {
      index.push({
        ...op,
        category: 'Tour Operator',
        priceType: 'per pack',
        verified: true,
        features: {
          familyFriendly: true,
          petFriendly: false,
          parking: true,
          mountainView: true,
          freeWifi: false,
          openNow: true
        },
        detailsUrl: `#/explore`
      });
    });

    // 10. MASTER DATA EXPERIENCES
    const masterExperiences = [
      {
        id: 'rafting-teesta',
        name: "Class II / III Teesta River White-Water Rafting",
        location: "Triveni Confluence Point",
        image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=600&auto=format&fit=crop",
        rating: 4.9,
        reviewsCount: 184,
        price: 1200,
        distance: 14.2,
        tags: ['experience', 'rafting', 'water', 'river', 'teesta', 'triveni', 'adrenaline', 'adventure'],
        amenities: ['Life Jacket Provided', 'Certified Helmsman', 'Photo & Video Support'],
        latitude: 27.085,
        longitude: 88.423,
        description: "Fierce white water adventure navigating massive rapids at the legendary confluence of River Teesta and Rangeet."
      },
      {
        id: 'paragliding-kalimpong',
        name: "Tandem Paragliding Flight",
        location: "Deolo Hill Launchpad, Kalimpong",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=600&auto=format&fit=crop",
        rating: 4.8,
        reviewsCount: 124,
        price: 3200,
        distance: 4.2,
        tags: ['experience', 'paragliding', 'fly', 'deolo', 'kalimpong', 'sky', 'adventure'],
        amenities: ['Experienced Pilot', 'GoPro Footage', 'Flight Insurance'],
        latitude: 27.088,
        longitude: 88.475,
        description: "Sore high like a Himalayan eagle at 5,500 feet overlooking the winding silver ribbon of Teesta with unobstructed views of Kanchenjunga."
      }
    ];

    masterExperiences.forEach(exp => {
      index.push({
        ...exp,
        category: 'Experience',
        priceType: 'per flight/session',
        verified: true,
        features: {
          familyFriendly: true,
          petFriendly: false,
          parking: true,
          mountainView: true,
          freeWifi: false,
          openNow: true
        },
        detailsUrl: `#/explore`
      });
    });

    // 11. FUTURE-PROOF EVENTS
    const masterEvents = [
      {
        id: 'lava-winter-fest',
        name: "Lava Himalayan Winter Culture Festival",
        location: "Main Bazaar Plaza, Lava",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
        rating: 4.7,
        reviewsCount: 45,
        price: 0,
        distance: 18.0,
        tags: ['event', 'festival', 'culture', 'winter', 'lava', 'music', 'dance'],
        amenities: ['Free Entry', 'Local Handicrafts', 'Hot Butter Tea Stalls'],
        latitude: 27.085,
        longitude: 88.660,
        description: "Annual December carnival celebrating Lepcha and Sherpa folk tunes, indigenous masking dances, and rich hill cuisine."
      }
    ];

    masterEvents.forEach(evt => {
      index.push({
        ...evt,
        category: 'Event',
        priceType: 'free entry',
        verified: true,
        features: {
          familyFriendly: true,
          petFriendly: true,
          parking: true,
          mountainView: false,
          freeWifi: false,
          openNow: true
        },
        detailsUrl: `#/explore`
      });
    });

    // 12. FUTURE-PROOF BLOGS
    const masterBlogs = [
      {
        id: 'budget-travel-darjeeling',
        name: "The Complete Backpacking Darjeeling Budget Blueprint",
        location: "HillyTrip Editorial Blog",
        image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
        rating: 4.6,
        reviewsCount: 19,
        distance: 0,
        tags: ['blog', 'guide', 'backpack', 'cheap', 'budget', 'darjeeling', 'hotels', 'shared jeep'],
        amenities: ['Verified Info', 'Interactive Map', 'Cost Calculator Included'],
        latitude: currentHubLocation.latitude,
        longitude: currentHubLocation.longitude,
        description: "Unraveling how to navigate major hubs, stay in safe certified homestays, and dine out under ₹1000 per day total."
      }
    ];

    masterBlogs.forEach(blg => {
      index.push({
        ...blg,
        category: 'Blog',
        verified: true,
        features: {
          familyFriendly: true,
          petFriendly: false,
          parking: false,
          mountainView: false,
          freeWifi: false,
          openNow: true
        },
        detailsUrl: `#/travel-guides`
      });
    });

    return index;
  }, [destinations, attractions, homestays, routes, hubs, drivers]);

  // Dynamic Synonym Mapping for Fuzzy Smart Search Match
  const synonymDictionary = useMemo(() => {
    return {
      'stay': ['homestay', 'accommodation', 'lodge', 'cabin', 'stay', 'room', 'hotel', 'resort'],
      'bed': ['homestay', 'room', 'stay', 'hostel'],
      'hotel': ['homestay', 'resort', 'stay', 'accommodation'],
      'trek': ['hiking', 'walk', 'trail', 'mountain', 'climb', 'survival', 'guide'],
      'hike': ['trek', 'trail', 'climb', 'walk', 'nature'],
      'food': ['restaurant', 'cafe', 'momo', 'dining', 'bistro', 'eat'],
      'tea': ['darjeeling', 'estate', 'organic', 'garden'],
      'car': ['taxi', 'driver', 'cab', 'route', 'fare', 'jeep', 'ride'],
      'taxi': ['car', 'cab', 'driver', 'shuttle', 'fare'],
      'fly': ['paragliding', 'deolo', 'sky', 'adventure', 'experience'],
      'tent': ['camping', 'glamping', 'riverside', 'canopy', 'bonfire']
    } as Record<string, string[]>;
  }, []);

  // Compute suggestions list for instant inline autocomplete
  const autocompleteSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const qNormalized = query.toLowerCase().trim();
    
    // Exact or prefix matching
    const matches = masterUnifiedSearchIndex.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(qNormalized);
      const tagMatch = item.tags.some(t => t.toLowerCase().startsWith(qNormalized));
      const locMatch = item.location.toLowerCase().includes(qNormalized);
      return nameMatch || tagMatch || locMatch;
    });

    return matches.slice(0, 5);
  }, [query, masterUnifiedSearchIndex]);

  // SMART FUZZY TEXT SEARCH ENGINE
  const filteredAndSortedResults = useMemo(() => {
    const qNormalized = debouncedQuery.toLowerCase().trim();
    let baseList = masterUnifiedSearchIndex;

    // Filter by Category Chip
    if (activeCategory !== 'All') {
      baseList = baseList.filter(item => {
        if (activeCategory === 'Destinations') return item.category === 'Destination' || item.category === 'Village';
        if (activeCategory === 'Villages') return item.category === 'Village';
        if (activeCategory === 'Attractions') return item.category === 'Attraction' || item.category === 'Experience';
        if (activeCategory === 'Homestays') return item.category === 'Homestay' || item.category === 'Camping';
        if (activeCategory === 'Taxi') return item.category === 'Taxi Operator' || item.category === 'Route';
        if (activeCategory === 'Restaurants') return item.category === 'Restaurant';
        if (activeCategory === 'Guides') return item.category === 'Guide';
        if (activeCategory === 'Tour Operators') return item.category === 'Tour Operator';
        if (activeCategory === 'Experiences') return item.category === 'Experience';
        if (activeCategory === 'Camping') return item.category === 'Camping';
        return item.category === activeCategory;
      });
    }

    // Apply Price Filter (only for items with priced rates)
    baseList = baseList.filter(item => {
      if (item.price === undefined) return true; // Keep free/unpriced info items
      return item.price >= priceRange[0] && item.price <= priceRange[1];
    });

    // Apply Rating Filter
    if (minRating > 0) {
      baseList = baseList.filter(item => item.rating >= minRating);
    }

    // Apply Distance Filter
    if (maxDistance < 100) {
      baseList = baseList.filter(item => item.distance <= maxDistance);
    }

    // Apply Verified Badge Filter
    if (verifiedOnly) {
      baseList = baseList.filter(item => item.verified);
    }

    // Apply Multi-select Feature toggles
    baseList = baseList.filter(item => {
      if (featuresFilter.familyFriendly && !item.features.familyFriendly) return false;
      if (featuresFilter.petFriendly && !item.features.petFriendly) return false;
      if (featuresFilter.parking && !item.features.parking) return false;
      if (featuresFilter.mountainView && !item.features.mountainView) return false;
      if (featuresFilter.freeWifi && !item.features.freeWifi) return false;
      if (featuresFilter.openNow && !item.features.openNow) return false;
      return true;
    });

    // Apply Availability Filter & Scopes before scoring if requested
    // We compute availability for all items to inject the rates and statuses
    let availabilityCheckedList = baseList.map(item => {
      const uai = UniversalInventoryEngine.getInstance();
      const allInventory = uai.getInventory();
      
      // Try to find any inventory item that matches this search item
      const matchedInventories = allInventory.filter(inv => {
        const itemBusinessName = (inv.businessName || '').toLowerCase();
        const itemName = (inv.name || '').toLowerCase();
        const searchItemName = (item.name || '').toLowerCase();
        const searchItemId = (item.id || '').toLowerCase();
        const invBusinessId = (inv.businessId || '').toLowerCase();

        return (
          invBusinessId === searchItemId ||
          searchItemId.includes(invBusinessId) ||
          invBusinessId.includes(searchItemId) ||
          itemBusinessName.includes(searchItemName) ||
          searchItemName.includes(itemBusinessName) ||
          itemName.includes(searchItemName) ||
          searchItemName.includes(itemName)
        );
      });

      if (matchedInventories.length === 0) {
        return {
          item,
          availabilityInfo: {
            isAvailable: true,
            originalRate: item.price,
            applicableRate: item.price,
            details: 'Clearance approved (No managed inventory overlap)'
          }
        };
      }

      let isAvailable = false;
      let minApplicableRate = Infinity;
      let matchedOrigRate = item.price || 0;
      let logs: string[] = [];

      for (const inv of matchedInventories) {
        const check = uai.checkAvailability(inv.id, searchStartDate, searchEndDate, 1);
        if (check.isAvailable) {
          isAvailable = true;
          if (check.applicableRate < minApplicableRate) {
            minApplicableRate = check.applicableRate;
            matchedOrigRate = check.originalRate;
          }
        }
        logs.push(`${inv.name}: ${check.isAvailable ? 'Available' : 'Unavailable'}`);
      }

      return {
        item,
        availabilityInfo: {
          isAvailable,
          originalRate: matchedOrigRate,
          applicableRate: isAvailable ? minApplicableRate : (item.price || 0),
          details: logs.join(' | ')
        }
      };
    });

    // If filterByAvailability is enabled, filter out unavailable matches
    if (filterByAvailability) {
      availabilityCheckedList = availabilityCheckedList.filter(row => row.availabilityInfo.isAvailable);
    }

    // Apply Text Matching and Fuzzy score injection
    let scoredList = availabilityCheckedList.map(row => {
      const { item, availabilityInfo } = row;
      let score = 0;
      
      if (!qNormalized) {
        score = 100; // Neutral baseline score
      } else {
        const nameLower = item.name.toLowerCase();
        const locationLower = item.location.toLowerCase();
        const tagsLower = item.tags.map(t => t.toLowerCase());
        const queryWords = qNormalized.split(/\s+/);

        // Rule 1: Exact Name Match
        if (nameLower === qNormalized) {
          score += 2000;
        }
        // Rule 2: Prefix Match
        else if (nameLower.startsWith(qNormalized)) {
          score += 1000;
        }
        // Rule 3: Substring Name Match
        else if (nameLower.includes(qNormalized)) {
          score += 500;
        }

        // Rule 4: Match individual search keywords & synonyms
        queryWords.forEach(word => {
          if (nameLower.includes(word)) {
            score += 150;
          }
          if (locationLower.includes(word)) {
            score += 80;
          }
          
          // Tag matching
          tagsLower.forEach(tag => {
            if (tag === word) {
              score += 50;
            } else if (tag.includes(word)) {
              score += 25;
            }
          });

          // Synonym expanding
          Object.entries(synonymDictionary).forEach(([term, synList]) => {
            if (word === term || synList.includes(word)) {
              if (tagsLower.includes(term) || item.category.toLowerCase().includes(term)) {
                score += 40;
              }
            }
          });
        });

        // Typo tolerance helper (Levenshtein approximation/partial character overlap ratio)
        const queryChars = qNormalized.split('');
        const matchedCharCount = queryChars.filter(c => nameLower.includes(c)).length;
        const charRatio = matchedCharCount / Math.max(qNormalized.length, 1);
        if (charRatio > 0.8 && nameLower.length > 3) {
          score += Math.floor(charRatio * 30);
        }
      }

      // Boost by popularity rating & reviews count
      score += (item.rating * 10) + (item.reviewsCount * 0.1);

      // Boost by verification badge
      if (item.verified) {
        score += 15;
      }

      // If item is completely unavailable, apply a massive 60% penalty to drop down rankings
      if (!availabilityInfo.isAvailable) {
        score = score * 0.4;
      }

      return { item: { ...item, availability: availabilityInfo }, score };
    });

    // Filter out items with very poor query matches if a query actually exists
    if (qNormalized) {
      scoredList = scoredList.filter(row => row.score > 25);
    }

    // Apply Sorting Options
    const sorted = [...scoredList].sort((a, b) => {
      switch (sortOption) {
        case 'distance':
          return a.item.distance - b.item.distance;
        case 'rating':
          return b.item.rating - a.item.rating;
        case 'reviews':
          return b.item.reviewsCount - a.item.reviewsCount;
        case 'price-low':
          return (a.item.price || 0) - (b.item.price || 0);
        case 'price-high':
          return (b.item.price || 0) - (a.item.price || 0);
        case 'popularity':
          return (b.item.rating * b.item.reviewsCount) - (a.item.rating * a.item.reviewsCount);
        case 'newest':
          // Simulated stable order for "newest"
          return b.item.id.localeCompare(a.item.id);
        case 'relevance':
        default:
          return b.score - a.score;
      }
    });

    return sorted.map(row => row.item);
  }, [debouncedQuery, activeCategory, priceRange, minRating, maxDistance, verifiedOnly, featuresFilter, sortOption, masterUnifiedSearchIndex, synonymDictionary, searchStartDate, searchEndDate, filterByAvailability]);

  // Handle scroll / Infinite Loading Simulator
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      if (visibleCount < filteredAndSortedResults.length && !isLoadingMore) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + 4, filteredAndSortedResults.length));
          setIsLoadingMore(false);
        }, 800);
      }
    }
  };

  // Keyboard navigation inside text field autocomplete or result cards
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (autocompleteSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => Math.min(prev + 1, autocompleteSuggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedSuggestionIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < autocompleteSuggestions.length) {
          const item = autocompleteSuggestions[focusedSuggestionIndex];
          setQuery(item.name);
          saveRecentSearch(item.name);
          setSelectedItemId(item.id);
          setFocusedSuggestionIndex(-1);
        } else {
          saveRecentSearch(query);
        }
      }
    } else {
      if (e.key === 'Enter') {
        saveRecentSearch(query);
      }
    }
  };

  // Client-Side AI NLP Natural Language Search Parser
  // Actually parses queries like "quiet homestays near Kalimpong under 3000" and updates React filters dynamically!
  const runAiNlpParser = (inputQuery: string) => {
    if (!inputQuery.trim()) return;
    setAiError(null);
    setAiSuccessMessage(null);

    const txt = inputQuery.toLowerCase().trim();
    
    // Category extraction
    let detectedCategory = 'All';
    if (txt.includes('homestay') || txt.includes('stay') || txt.includes('room')) {
      detectedCategory = 'Homestays';
    } else if (txt.includes('camp') || txt.includes('glamp')) {
      detectedCategory = 'Camping';
    } else if (txt.includes('taxi') || txt.includes('cab') || txt.includes('car')) {
      detectedCategory = 'Taxi';
    } else if (txt.includes('guide')) {
      detectedCategory = 'Guides';
    } else if (txt.includes('food') || txt.includes('restaurant') || txt.includes('cafe')) {
      detectedCategory = 'Restaurants';
    } else if (txt.includes('experience') || txt.includes('rafting') || txt.includes('paragliding')) {
      detectedCategory = 'Experiences';
    } else if (txt.includes('attraction') || txt.includes('sightseeing') || txt.includes('monastery')) {
      detectedCategory = 'Attractions';
    } else if (txt.includes('village')) {
      detectedCategory = 'Villages';
    }

    // Destination keyword extraction
    let extractedQuery = '';
    const hillStations = ['darjeeling', 'kalimpong', 'lava', 'rishop', 'pedong', 'loleygaon', 'mirik', 'kurseong', 'sittong', 'kolakham', 'rimbik', 'chatakpur', 'lepchajagat'];
    const matchedStation = hillStations.find(st => txt.includes(st));
    if (matchedStation) {
      extractedQuery = matchedStation.charAt(0).toUpperCase() + matchedStation.slice(1);
    }

    // Price extraction ("under 3000", "below 2000", "under ₹1500")
    let extractedMaxPrice = 10000;
    const priceRegex = /(?:under|below|less than|max|₹?\s*)\s*₹?\s*(\d{3,5})/i;
    const priceMatch = txt.match(priceRegex);
    if (priceMatch && priceMatch[1]) {
      extractedMaxPrice = parseInt(priceMatch[1], 10);
    }

    // Features extraction
    const features = {
      familyFriendly: txt.includes('family') || txt.includes('kid'),
      petFriendly: txt.includes('pet') || txt.includes('dog'),
      parking: txt.includes('parking') || txt.includes('car park'),
      mountainView: txt.includes('view') || txt.includes('kanchenjunga') || txt.includes('mountain') || txt.includes('quiet'),
      freeWifi: txt.includes('wifi') || txt.includes('internet'),
      openNow: true
    };

    // Apply Parsed State Elements
    setActiveCategory(detectedCategory);
    setPriceRange([0, extractedMaxPrice]);
    setFeaturesFilter(features);
    if (extractedQuery) {
      setQuery(extractedQuery);
    } else {
      // Keep keywords that represent description like "quiet", "cheap", "adventure"
      const words = inputQuery.split(' ').filter(w => !['show', 'me', 'quiet', 'homestay', 'homestays', 'near', 'under', 'underneath', 'below', 'in', 'at'].includes(w.toLowerCase()));
      setQuery(words.join(' '));
    }

    setAiSuccessMessage(`AI Analysis Success: Activated dynamic filters! (Category: "${detectedCategory}", Max Price: ₹${extractedMaxPrice}, Destination Query: "${extractedQuery || 'All'}")`);
    saveRecentSearch(inputQuery);
  };

  // Voice Recognition Mock
  const triggerVoiceSearch = () => {
    if (voiceSearchActive) return;
    setVoiceSearchActive(true);
    setVoiceMessage('Listening for mountain coordinates...');
    setTimeout(() => {
      setVoiceMessage('Processing audio stream...');
      setTimeout(() => {
        setVoiceSearchActive(false);
        setQuery('Lava Homestays');
        setActiveCategory('Homestays');
        saveRecentSearch('Lava Homestays');
      }, 1500);
    }, 1500);
  };

  // Highlight matched substring
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-emerald-500/25 text-emerald-300 font-extrabold rounded-xs px-0.5">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  // Dynamic Icon selector based on category type
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Destination': return <MapPin className="w-4 h-4 text-emerald-400" />;
      case 'Village': return <MapPin className="w-4 h-4 text-teal-400" />;
      case 'Homestay': return <Home className="w-4 h-4 text-amber-400" />;
      case 'Camping': return <Tent className="w-4 h-4 text-yellow-500" />;
      case 'Attraction': return <Compass className="w-4 h-4 text-sky-400" />;
      case 'Experience': return <Sparkles className="w-4 h-4 text-rose-400" />;
      case 'Restaurant': return <Utensils className="w-4 h-4 text-orange-400" />;
      case 'Guide': return <Users className="w-4 h-4 text-indigo-400" />;
      case 'Taxi Operator': return <Car className="w-4 h-4 text-blue-400" />;
      case 'Tour Operator': return <Briefcase className="w-4 h-4 text-purple-400" />;
      case 'Route': return <Map className="w-4 h-4 text-indigo-300" />;
      case 'Event': return <Calendar className="w-4 h-4 text-rose-500" />;
      case 'Blog': return <BookOpen className="w-4 h-4 text-pink-400" />;
      default: return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  // Map panning & zooming event handlers
  const handleMapMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    isDraggingMap.current = true;
    dragStart.current = { x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y };
  };

  const handleMapMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingMap.current) return;
    setMapOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMapMouseUpOrLeave = () => {
    isDraggingMap.current = false;
  };

  const handleZoomIn = () => setMapScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setMapScale(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => {
    setMapScale(1);
    setMapOffset({ x: 0, y: 0 });
  };

  // Locate current active items in the map bounds
  const mapItems = useMemo(() => {
    // Map supports plotting up to 25 items coordinates
    return filteredAndSortedResults.slice(0, 25);
  }, [filteredAndSortedResults]);

  // Current selected item for detail card overlay
  const selectedItem = useMemo(() => {
    return masterUnifiedSearchIndex.find(item => item.id === selectedItemId) || null;
  }, [selectedItemId, masterUnifiedSearchIndex]);

  // Quick Action Handler
  const handleQuickAction = (e: React.MouseEvent, item: UnifiedSearchItem) => {
    e.stopPropagation();
    saveRecentSearch(item.name);
    navigate(item.detailsUrl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative" id="universal-discovery-engine">
      
      {/* Immersive Background Lighting Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* CORE DISCOVERY BRAND BAR */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('#/')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white transition duration-150 cursor-pointer border border-slate-800 shadow-sm flex items-center justify-center shrink-0"
              title="Return Home"
              id="search-back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>HillyTrip Discovery</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">Configuration-Driven Search Infrastructure</p>
            </div>
          </div>

          {/* DYNAMIC VIEW MODE TOGGLES */}
          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-900 w-full md:w-auto justify-center">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${viewMode === 'list' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              title="Classic Grid List"
            >
              <Grid className="w-4 h-4" />
              <span>List Mode</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${viewMode === 'split' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              title="Side-by-side split map and list"
            >
              <Layers className="w-4 h-4" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition ${viewMode === 'map' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'}`}
              title="Immersive Topographic Map Map"
            >
              <MapIcon className="w-4 h-4" />
              <span>Map Only</span>
            </button>
          </div>

        </div>
      </header>

      {/* CORE SEARCH CONTROLS DRAWER */}
      <section className="bg-slate-900/40 border-b border-slate-900 py-4 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          
          <div className="flex flex-col lg:flex-row gap-3">
            
            {/* Primary Fuzzy Search Input box */}
            <div className="relative flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 shadow-inner focus-within:border-emerald-500/50 transition">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input 
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setFocusedSuggestionIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search across villages, guides, taxi operators, camping, restaurants..."
                className="w-full bg-transparent text-white placeholder-slate-500 font-medium text-sm sm:text-base outline-none pr-8"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                aria-label="Search inputs"
                role="combobox"
                aria-expanded={autocompleteSuggestions.length > 0}
              />
              
              {/* Input action overlays */}
              <div className="absolute right-3 flex items-center gap-2">
                {query && (
                  <button 
                    onClick={() => { setQuery(''); setFocusedSuggestionIndex(-1); }}
                    className="p-1 rounded-md text-slate-400 hover:text-white transition"
                    aria-label="Clear query text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={triggerVoiceSearch}
                  className={`p-1.5 rounded-lg transition duration-150 ${voiceSearchActive ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-400 hover:text-emerald-400'}`}
                  title="Voice Command"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Instant Autocomplete Suggestions overlay */}
              <AnimatePresence>
                {autocompleteSuggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-850"
                    role="listbox"
                  >
                    {autocompleteSuggestions.map((item, idx) => (
                      <div
                        key={`auto-${item.id}`}
                        onClick={() => {
                          setQuery(item.name);
                          saveRecentSearch(item.name);
                          setSelectedItemId(item.id);
                        }}
                        className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition ${focusedSuggestionIndex === idx ? 'bg-slate-800' : 'hover:bg-slate-850'}`}
                        role="option"
                        aria-selected={focusedSuggestionIndex === idx}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-slate-950 shrink-0">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-white block truncate">{item.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate font-mono uppercase">{item.category} • {item.location}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-500" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI NATURAL LANGUAGE PARSER INPUT */}
            <div className="relative flex-1 flex items-center bg-slate-900/30 border border-slate-900 rounded-2xl px-4 py-2.5">
              <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-mono shrink-0 mr-3">AI</span>
              <input 
                type="text"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                placeholder="Try: 'homestays under ₹3000 near Kalimpong'"
                className="w-full bg-transparent text-slate-300 placeholder-slate-600 text-xs outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runAiNlpParser(aiInputText);
                }}
              />
              <button 
                onClick={() => runAiNlpParser(aiInputText)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 font-black rounded-lg text-[10px] transition shrink-0 ml-2"
              >
                COMPILE
              </button>
            </div>

            {/* ADVANCED FILTER TRIGGER */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`px-4 py-3 rounded-2xl border flex items-center gap-2 text-xs font-black transition cursor-pointer ${isFilterPanelOpen ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'}`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {isFilterPanelOpen ? <X className="w-3 h-3 ml-1" /> : <Sliders className="w-3.5 h-3.5 text-slate-400 ml-1" />}
              </button>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-black focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="distance">Sort: Distance</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="reviews">Sort: Most Reviewed</option>
                <option value="popularity">Sort: Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Sort: Newest</option>
              </select>
            </div>

          </div>

          {/* AI NLP SUCCESS / ERROR NOTICES */}
          {aiSuccessMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-fade-in font-mono">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </span>
              <button onClick={() => setAiSuccessMessage(null)} className="p-1 text-emerald-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* COLLAPSIBLE DETAILED ADVANCED FILTER PANEL */}
          <AnimatePresence>
            {isFilterPanelOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-slate-900 border border-slate-850 rounded-3xl p-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  
                  {/* Price Range Slider */}
                  <div className="space-y-3.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Price Limit (₹)</label>
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                      <span>₹{priceRange[0]}</span>
                      <span>Max: ₹{priceRange[1]}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="10000" 
                      step="250"
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setPriceRange([0, 1500])} className="px-2.5 py-1 bg-slate-950 text-[10px] rounded hover:bg-slate-800 font-mono font-bold">Under ₹1500</button>
                      <button onClick={() => setPriceRange([0, 3000])} className="px-2.5 py-1 bg-slate-950 text-[10px] rounded hover:bg-slate-800 font-mono font-bold">Under ₹3000</button>
                      <button onClick={() => setPriceRange([0, 5000])} className="px-2.5 py-1 bg-slate-950 text-[10px] rounded hover:bg-slate-800 font-mono font-bold">Under ₹5000</button>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-3.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Minimum Rating</label>
                    <div className="flex gap-1.5">
                      {([0, 3, 4, 4.5] as const).map(rate => (
                        <button
                          key={`rate-${rate}`}
                          onClick={() => setMinRating(rate)}
                          className={`px-3 py-1.5 text-xs rounded-xl font-bold transition flex items-center gap-1 border ${minRating === rate ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-white'}`}
                        >
                          {rate === 0 ? 'Any' : `${rate}★`}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-slate-500">Filters average traveler score verified on HillyTrip.</p>
                  </div>

                  {/* Distance Filter */}
                  <div className="space-y-3.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Distance (from Hub)</label>
                    <div className="flex justify-between text-xs font-mono text-slate-300">
                      <span>Closest</span>
                      <span>Under {maxDistance} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      value={maxDistance} 
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Live Availability Filters */}
                  <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-3xl border border-slate-850/60">
                    <label className="text-[10px] font-black uppercase text-emerald-400 tracking-wider font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Live Availability</span>
                    </label>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-450 block font-mono">START DATE</span>
                        <input
                          type="date"
                          value={searchStartDate}
                          onChange={(e) => setSearchStartDate(e.target.value)}
                          className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg px-2 text-slate-300 focus:outline-none text-[11px] font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-450 block font-mono">END DATE</span>
                        <input
                          type="date"
                          value={searchEndDate}
                          onChange={(e) => setSearchEndDate(e.target.value)}
                          className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg px-2 text-slate-300 focus:outline-none text-[11px] font-mono"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer select-none pt-1">
                        <input
                          type="checkbox"
                          checked={filterByAvailability}
                          onChange={(e) => setFilterByAvailability(e.target.checked)}
                          className="accent-emerald-500 rounded h-3.5 w-3.5"
                        />
                        <span className="font-bold text-[10px] text-emerald-400">Available Only</span>
                      </label>
                    </div>
                  </div>

                  {/* Quick Feature Toggles */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Core Amenities & Verification</label>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={verifiedOnly} 
                          onChange={(e) => setVerifiedOnly(e.target.checked)}
                          className="accent-emerald-500 rounded"
                        />
                        <span className="font-extrabold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verified Only</span>
                        </span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={featuresFilter.mountainView} 
                          onChange={(e) => setFeaturesFilter(prev => ({ ...prev, mountainView: e.target.checked }))}
                          className="accent-emerald-500 rounded"
                        />
                        <span>Mountain View</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={featuresFilter.freeWifi} 
                          onChange={(e) => setFeaturesFilter(prev => ({ ...prev, freeWifi: e.target.checked }))}
                          className="accent-emerald-500 rounded"
                        />
                        <span>Free WiFi</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={featuresFilter.petFriendly} 
                          onChange={(e) => setFeaturesFilter(prev => ({ ...prev, petFriendly: e.target.checked }))}
                          className="accent-emerald-500 rounded"
                        />
                        <span>Pet Friendly</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={featuresFilter.familyFriendly} 
                          onChange={(e) => setFeaturesFilter(prev => ({ ...prev, familyFriendly: e.target.checked }))}
                          className="accent-emerald-500 rounded"
                        />
                        <span>Family Friendly</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={featuresFilter.parking} 
                          onChange={(e) => setFeaturesFilter(prev => ({ ...prev, parking: e.target.checked }))}
                          className="accent-emerald-500 rounded"
                        />
                        <span>Has Parking</span>
                      </label>
                    </div>

                  </div>

                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Interactive search uses combined filters to build optimized local indexed indexes.</span>
                  <button
                    onClick={() => {
                      setPriceRange([0, 10000]);
                      setMinRating(0);
                      setMaxDistance(100);
                      setVerifiedOnly(false);
                      setFeaturesFilter({
                        familyFriendly: false,
                        petFriendly: false,
                        parking: false,
                        mountainView: false,
                        freeWifi: false,
                        openNow: false,
                      });
                      setActiveCategory('All');
                    }}
                    className="text-emerald-400 hover:underline font-bold font-mono"
                  >
                    RESET ALL FILTERS
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC CATEGORY FILTER CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(['All', 'Destinations', 'Villages', 'Homestays', 'Camping', 'Attractions', 'Experiences', 'Restaurants', 'Guides', 'Taxi', 'Tour Operators'] as const).map(cat => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setVisibleCount(6); // Reset pagination index
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 cursor-pointer border transition duration-150 ${
                    active 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black' 
                      : 'bg-slate-900 text-slate-400 border-slate-850 hover:border-slate-750 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* DYNAMIC VOICE MODAL DIALOG OVERLAY */}
      <AnimatePresence>
        {voiceSearchActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Mic className="w-8 h-8 animate-bounce" />
              </div>
            </div>
            <h4 className="text-lg font-black text-white">{voiceMessage}</h4>
            <p className="text-xs text-slate-400 mt-2">Try saying "Quiet Homestays near Lava" or "Sandakphu Trek Guide"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER LAYOUT */}
      <main className="flex-grow flex flex-col lg:flex-row relative overflow-hidden min-h-[70vh]">

        {/* LEFT COLUMN: LIST RESULTS */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div 
            className={`flex-1 flex flex-col h-full overflow-y-auto px-4 py-6 space-y-6 ${viewMode === 'split' ? 'lg:max-w-[50%]' : 'max-w-4xl mx-auto w-full'}`}
            onScroll={handleScroll}
            ref={resultsContainerRef}
          >
            
            {/* INITIAL LANDING / RECENT & TRENDING (When search box is empty) */}
            {!query.trim() && (
              <div className="space-y-6">
                
                {/* RECENT SEARCHES PANEL */}
                {recentSearches.length > 0 && (
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h6 className="text-[10px] font-black uppercase text-slate-450 tracking-widest font-mono flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Recent Discoveries</span>
                      </h6>
                      <button 
                        onClick={clearAllRecentSearches}
                        className="text-[10px] font-extrabold text-rose-450 hover:underline flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map(term => (
                        <div 
                          key={term}
                          onClick={() => { setQuery(term); saveRecentSearch(term); }}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer transition"
                        >
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{term}</span>
                          <button 
                            onClick={(e) => deleteRecentSearch(e, term)}
                            className="p-0.5 rounded-md hover:bg-slate-850 text-slate-400 hover:text-white transition"
                            aria-label="Remove recent item"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DISCOVERY SLOTS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* TRENDING PLACES */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-5 space-y-4">
                    <h6 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-900 pb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Trending Now</span>
                    </h6>
                    <div className="space-y-3">
                      {masterUnifiedSearchIndex.filter(item => item.verified && item.rating >= 4.8).slice(0, 3).map(dest => (
                        <div 
                          key={`trend-${dest.id}`}
                          onClick={() => { setSelectedItemId(dest.id); setQuery(dest.name); }}
                          className="p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-slate-900/60 hover:border-slate-750 transition flex items-center gap-3 cursor-pointer"
                        >
                          <img src={dest.image} alt={dest.name} className="w-11 h-11 object-cover rounded-xl shrink-0 border border-slate-800" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white block truncate">{dest.name}</span>
                            <span className="text-[10px] text-slate-500 block font-mono capitalize">{dest.category} • {dest.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HIDDEN GEMS */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-5 space-y-4">
                    <h6 className="text-[10px] font-black uppercase text-sky-400 tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-900 pb-2">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Hidden Gems</span>
                    </h6>
                    <div className="space-y-3">
                      {masterUnifiedSearchIndex.filter(item => item.category === 'Village' || item.id.includes('kolakham') || item.id.includes('sittong') || item.id.includes('rishop')).slice(0, 3).map(gem => (
                        <div 
                          key={`gem-${gem.id}`}
                          onClick={() => { setSelectedItemId(gem.id); setQuery(gem.name); }}
                          className="p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-slate-900/60 hover:border-slate-750 transition flex items-center gap-3 cursor-pointer"
                        >
                          <img src={gem.image} alt={gem.name} className="w-11 h-11 object-cover rounded-xl shrink-0 border border-slate-800" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white block truncate">{gem.name}</span>
                            <span className="text-[10px] text-slate-500 block font-mono capitalize">{gem.category} • {gem.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* NEARBY YOU (Simulated based on close proximity distance under 10km) */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-5 space-y-4">
                    <h6 className="text-[10px] font-black uppercase text-amber-500 tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-900 pb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Nearby You</span>
                    </h6>
                    <div className="space-y-3">
                      {masterUnifiedSearchIndex.filter(item => item.distance < 15).slice(0, 3).map(near => (
                        <div 
                          key={`near-${near.id}`}
                          onClick={() => { setSelectedItemId(near.id); setQuery(near.name); }}
                          className="p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-slate-900/60 hover:border-slate-750 transition flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={near.image} alt={near.name} className="w-11 h-11 object-cover rounded-xl shrink-0 border border-slate-800" />
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-white block truncate">{near.name}</span>
                              <span className="text-[10px] text-slate-500 block font-mono truncate">{near.category} • {near.location}</span>
                            </div>
                          </div>
                          <span className="text-[9px] bg-slate-950 border border-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{near.distance} KM</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEASONAL RECOMMENDATIONS (Tea tastings, snowy views, spring treks) */}
                  <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-5 space-y-4">
                    <h6 className="text-[10px] font-black uppercase text-purple-400 tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-900 pb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Seasonal Picks</span>
                    </h6>
                    <div className="space-y-3">
                      {masterUnifiedSearchIndex.filter(item => item.tags.includes('winter') || item.tags.includes('trek') || item.tags.includes('paragliding')).slice(0, 3).map(season => (
                        <div 
                          key={`season-${season.id}`}
                          onClick={() => { setSelectedItemId(season.id); setQuery(season.name); }}
                          className="p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800 border border-slate-900/60 hover:border-slate-750 transition flex items-center gap-3 cursor-pointer"
                        >
                          <img src={season.image} alt={season.name} className="w-11 h-11 object-cover rounded-xl shrink-0 border border-slate-800" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white block truncate">{season.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono capitalize">{season.category} • Spring/Winter</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* INTENSITY MATCH COUNT BAR */}
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-500 border-b border-slate-900 pb-2">
              <span>ACTIVE DISCOVERY PANEL</span>
              <span>{filteredAndSortedResults.length} RESULTS MATCHED</span>
            </div>

            {/* CORE LIST OF CARDS */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredAndSortedResults.length > 0 ? (
                  filteredAndSortedResults.slice(0, visibleCount).map((item, idx) => {
                    const isSelected = selectedItemId === item.id;
                    return (
                      <motion.div
                        key={`result-${item.category}-${item.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.18, delay: Math.min(idx * 0.04, 0.4) }}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`border rounded-3xl p-4 flex flex-col sm:flex-row gap-4 cursor-pointer transition shadow-lg group relative ${
                          isSelected 
                            ? 'bg-slate-900 border-emerald-500/60 shadow-emerald-950/20' 
                            : 'bg-slate-900/70 border-slate-900 hover:border-slate-800 hover:bg-slate-900 shadow-black/10'
                        }`}
                        id={`search-card-${item.id}`}
                      >
                        {/* Selected Indicator Light */}
                        {isSelected && (
                          <span className="absolute top-4 left-0 w-1 h-12 bg-emerald-500 rounded-r-full" />
                        )}

                        {/* Card Image Wrapper */}
                        <div className="w-full sm:w-36 h-28 rounded-2xl bg-slate-950 overflow-hidden shrink-0 border border-slate-850 relative">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                            referrerPolicy="no-referrer"
                          />
                          {item.price !== undefined && (
                            <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-emerald-400 font-mono border border-slate-800">
                              {(item as any).availability?.isAvailable && (item as any).availability?.applicableRate !== (item as any).availability?.originalRate ? (
                                <span className="flex items-center gap-1">
                                  <span className="line-through text-slate-500 text-[8px]">₹{(item as any).availability?.originalRate}</span>
                                  <span>₹{(item as any).availability?.applicableRate}</span>
                                </span>
                              ) : (
                                <span>₹{(item as any).availability?.applicableRate || item.price}</span>
                              )}
                            </span>
                          )}

                          {/* Availability status overlay */}
                          {(item as any).availability && !(item as any).availability.isAvailable && (
                            <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xs flex items-center justify-center p-2 text-center">
                              <span className="text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                                SOLD OUT
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info details */}
                        <div className="flex-grow flex flex-col justify-between min-w-0 space-y-2">
                          <div>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              
                              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-450 font-mono">
                                {getCategoryIcon(item.category)}
                                <span>{item.category}</span>
                              </span>

                              <div className="flex items-center gap-2">
                                {/* Distance from User Hub */}
                                <span className="text-[9px] font-mono font-bold bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-900">
                                  {item.distance} KM away
                                </span>
                                
                                {/* Verification Badge */}
                                {item.verified && (
                                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black font-mono flex items-center gap-0.5">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>VERIFIED</span>
                                  </span>
                                )}

                                {/* Availability clearance badge */}
                                {(item as any).availability?.isAvailable && (
                                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-black font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>INSTANT CLEAR</span>
                                  </span>
                                )}
                              </div>

                            </div>

                            <h3 className="text-sm font-black text-white mt-1 group-hover:text-emerald-400 transition leading-snug truncate">
                              {highlightText(item.name, debouncedQuery)}
                            </h3>

                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              <span>{item.location}</span>
                            </p>

                            <p className="text-xs text-slate-450 mt-1.5 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          {/* Footer details */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-900 flex-wrap gap-2">
                            
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                              <span className="text-xs font-black text-white">{item.rating.toFixed(1)}</span>
                              <span className="text-[10px] text-slate-500">({item.reviewsCount} reviews)</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5">
                              {item.priceType && (
                                <span className="text-[9px] text-slate-500 font-mono lowercase mr-1">
                                  {item.priceType}
                                </span>
                              )}
                              <button
                                onClick={(e) => handleQuickAction(e, item)}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 font-black rounded-xl text-[10px] uppercase transition flex items-center gap-1 cursor-pointer"
                              >
                                <span>Discover</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>

                          </div>

                        </div>

                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                    id="no-search-results"
                  >
                    <HelpCircle className="w-14 h-14 text-slate-700 animate-bounce mb-3" />
                    <h4 className="font-extrabold text-sm text-slate-300">No results found on HillyTrip index</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">Try searching broader terms like "Darjeeling", "Homestay", "Lava", or clear some active advanced filters above.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* INFINITE SCROLL / PAGINATION LOADING INDICATOR */}
            {filteredAndSortedResults.length > visibleCount && (
              <div className="py-4 text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 4)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition font-mono font-bold"
                >
                  {isLoadingMore ? 'Loading More Local Indexes...' : 'LOAD MORE RESULTS'}
                </button>
              </div>
            )}

          </div>
        )}

        {/* RIGHT COLUMN: INTERACTIVE GEOSPATIAL MAP (SVG & COORD DRAWING) */}
        {(viewMode === 'map' || viewMode === 'split') && (
          <div className="flex-1 bg-slate-950 border-l border-slate-900 relative h-[70vh] lg:h-auto overflow-hidden flex flex-col select-none">
            
            {/* Topography Map Control Utilities overlay */}
            <div className="absolute top-4 left-4 z-40 bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-2xl flex flex-col gap-2 shadow-xl">
              <button onClick={handleZoomIn} className="p-2 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white rounded-lg transition" title="Zoom In"><Maximize2 className="w-4 h-4" /></button>
              <button onClick={handleZoomOut} className="p-2 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-white rounded-lg transition" title="Zoom Out"><Minimize2 className="w-4 h-4" /></button>
              <button onClick={handleZoomReset} className="p-1.5 bg-slate-950 hover:bg-slate-850 text-[9px] text-slate-400 font-bold rounded-lg transition font-mono" title="Reset Map View">RESET</button>
            </div>

            {/* Map Legends info bar */}
            <div className="absolute bottom-4 left-4 z-40 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-2 rounded-2xl shadow-xl flex items-center gap-3.5 max-w-[85%] text-[10px] font-mono">
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Stay</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /><span>Sight</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span>Food</span></div>
              <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /><span>Trek</span></div>
            </div>

            {/* Simulated Geographic Vector Drawing Canvas */}
            <svg
              className="w-full h-full cursor-grab active:cursor-grabbing bg-radial from-slate-900 to-slate-950"
              onMouseDown={handleMapMouseDown}
              onMouseMove={handleMapMouseMove}
              onMouseUp={handleMapMouseUpOrLeave}
              onMouseLeave={handleMapMouseUpOrLeave}
              viewBox="0 0 800 600"
            >
              {/* Infinite Topo Map grid lines */}
              <g 
                transform={`translate(${mapOffset.x}, ${mapOffset.y}) scale(${mapScale})`}
                className="transition-transform duration-100 origin-center"
              >
                {/* Lat/Lng grid lines */}
                {Array.from({ length: 16 }).map((_, i) => (
                  <line 
                    key={`v-grid-${i}`}
                    x1={i * 50} y1="0" x2={i * 50} y2="600" 
                    stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3"
                  />
                ))}
                {Array.from({ length: 12 }).map((_, i) => (
                  <line 
                    key={`h-grid-${i}`}
                    x1="0" y1={i * 50} x2="800" y2={i * 50} 
                    stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3,3"
                  />
                ))}

                {/* Simulated Mountain Contours (SVG Paths) */}
                <path d="M 100 300 Q 200 150 300 300 T 500 300 T 700 300" fill="none" stroke="#064e3b" strokeWidth="1" opacity="0.3" />
                <path d="M 50 250 Q 150 80 250 250 T 450 250 T 650 250" fill="none" stroke="#064e3b" strokeWidth="1" opacity="0.15" />
                <path d="M 200 450 Q 350 250 500 450 T 800 450" fill="none" stroke="#0f172a" strokeWidth="1.5" opacity="0.4" />

                {/* Simulated River Teesta blue trail */}
                <path 
                  d="M 180 0 Q 220 150 260 300 T 200 480 T 140 600" 
                  fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="1,2" opacity="0.4" 
                />

                {/* Major Route lines linking hubs */}
                {routes.slice(0, 8).map((route, idx) => {
                  // Connect simulated coordinate points
                  const startPt = route.fromHubId === 'lava' ? {x: 430, y: 160} : {x: 320, y: 180};
                  const endPt = route.toHubId === 'rishop' ? {x: 440, y: 90} : {x: 90, y: 90};
                  return (
                    <line
                      key={`map-rt-${idx}`}
                      x1={startPt.x} y1={startPt.y}
                      x2={endPt.x} y2={endPt.y}
                      stroke="#4338ca"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      opacity="0.3"
                    />
                  );
                })}

                {/* Center / Search Hub Marker Pin (Kalimpong) */}
                <g transform="translate(320, 180)">
                  <circle r="12" fill="#10b981" opacity="0.15" className="animate-pulse" />
                  <circle r="5" fill="#10b981" />
                  <text y="-12" textAnchor="middle" fill="#10b981" className="text-[8px] font-mono font-black uppercase tracking-wider">Search Origin</text>
                </g>

                {/* ACTIVE RESULT PINS */}
                {mapItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  
                  // Compute safe visual coordinate positions in our SVG box [0-800, 0-600]
                  // Map latitude [26.8 - 27.2] to Y [500 - 50]
                  // Map longitude [88.1 - 88.7] to X [100 - 700]
                  const xCoord = 100 + ((item.longitude - 88.1) / 0.6) * 600;
                  const yCoord = 500 - ((item.latitude - 26.8) / 0.4) * 450;

                  return (
                    <g 
                      key={`pin-${item.id}`} 
                      transform={`translate(${xCoord}, ${yCoord})`}
                      onClick={() => setSelectedItemId(item.id)}
                      className="cursor-pointer group"
                    >
                      {/* Active highlight background */}
                      {isSelected ? (
                        <>
                          <circle r="22" fill="#10b981" opacity="0.12" className="animate-pulse" />
                          <circle r="12" fill="#10b981" opacity="0.3" />
                        </>
                      ) : (
                        <circle r="10" fill="#0f172a" opacity="0.8" className="group-hover:scale-125 transition" />
                      )}

                      {/* Micro pin color code */}
                      <circle 
                        r={isSelected ? "5" : "4.5"} 
                        fill={
                          item.category === 'Homestay' || item.category === 'Camping' ? '#f59e0b' :
                          item.category === 'Attraction' || item.category === 'Experience' ? '#0ea5e9' :
                          item.category === 'Restaurant' ? '#f97316' : '#10b981'
                        } 
                      />

                      {/* Map Tooltip Label on hover or selected */}
                      {(isSelected || mapScale > 1.2) && (
                        <g transform="translate(0, -14)">
                          <rect 
                            x="-60" y="-12" width="120" height="18" 
                            fill="#0f172a" stroke={isSelected ? '#10b981' : '#334155'} 
                            strokeWidth="1" rx="4" 
                          />
                          <text 
                            textAnchor="middle" y="0" fill="#ffffff" 
                            className="text-[8px] font-extrabold font-sans select-none"
                          >
                            {item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

              </g>
            </svg>

            {/* BOTTOM FLOATING SUMMARY CARD OVERLAY */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="absolute bottom-4 left-4 right-4 z-40 bg-slate-900/95 backdrop-blur border border-emerald-500/30 p-4 rounded-3xl shadow-2xl flex gap-3.5"
                >
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-20 h-20 object-cover rounded-xl shrink-0 border border-slate-800" />
                  <div className="flex-grow min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[8px] font-mono font-black uppercase text-emerald-400 tracking-wider">
                          {selectedItem.category}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">
                          {selectedItem.distance} KM FROM ORIGIN
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-white truncate mt-0.5">{selectedItem.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{selectedItem.description}</p>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-amber-400 font-extrabold font-mono flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{selectedItem.rating.toFixed(1)}</span>
                      </span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setSelectedItemId(null)}
                          className="px-2.5 py-1 text-[9px] bg-slate-950 text-slate-400 hover:text-white rounded-lg transition"
                        >
                          Dismiss
                        </button>
                        <button 
                          onClick={() => navigate(selectedItem.detailsUrl)}
                          className="px-3 py-1 text-[9px] bg-emerald-600 text-slate-950 font-black rounded-lg hover:bg-emerald-500 transition"
                        >
                          Open Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

      </main>

    </div>
  );
}
