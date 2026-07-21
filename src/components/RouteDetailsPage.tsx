// src/components/RouteDetailsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { WiDaySunny, WiRain, WiSnow } from 'weather-icons-react';
import { 
  ArrowLeft, MapPin, Car, Clock, Heart, Share2, Calendar,
  ExternalLink, ChevronRight, CheckCircle, Info, Sparkles, Home,
  AlertCircle, Phone, Award, Eye, Navigation, MessageSquare, AlertTriangle,
  Compass, ShieldCheck, PhoneCall, AlertOctagon, HeartHandshake, CloudRain,
  Activity, Thermometer, Wind, EyeOff,
  Sun, Cloud, CloudSun, CloudLightning, CloudFog, Snowflake, Sunset, Moon,
  ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { Route, Hub, Destination, Attraction, Homestay, User } from '../types';
import { motion } from 'motion/react';
import { 
  WeatherAnimationsStyle, SunraysAnimation, RainAnimation, SnowAnimation, 
  FogAnimation, ThunderstormAnimation, CloudsAnimation, 
  getHubCoords, mapWMOCodeToTheme, weatherConfigs, seasonConfigs 
} from './WeatherEngine';

import { getAltInfo, generateTimelineStops } from '../utils/routeHelpers';
import InteractiveRouteMap from './InteractiveRouteMap';
import GoogleRouteMap from './GoogleRouteMap';
import RouteGallery from './RouteGallery';
import QuoteRequestModal from './QuoteRequestModal';
import RouteReviews from './RouteReviews';

interface RouteDetailsPageProps {
  fromHubId: string;
  toHubId: string;
  routes: Route[];
  hubs: Hub[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  navigate: (path: string) => void;
  themeMode: 'light' | 'dark';
  setNotification?: (notif: { type: 'success' | 'error' | 'info', message: string } | null) => void;
  user?: User | null;
  executeProtectedAction?: (actionName: string, callback: () => void, requiresVerification?: boolean, serializableAction?: any) => void;
}

export default function RouteDetailsPage({
  fromHubId,
  toHubId,
  routes,
  hubs,
  destinations,
  attractions,
  homestays,
  navigate,
  themeMode,
  setNotification,
  user,
  executeProtectedAction
}: RouteDetailsPageProps) {
  
  // 1. Find matching routes
  const matchedRoutes = useMemo(() => {
    return routes.filter(r => 
      r.fromHubId.toLowerCase() === fromHubId.toLowerCase() && 
      r.toHubId.toLowerCase() === toHubId.toLowerCase()
    );
  }, [routes, fromHubId, toHubId]);

  // 2. Active Selected Option Index for alternate routes
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);

  const activeRoute = useMemo(() => {
    if (matchedRoutes.length > 0 && selectedOptionIdx < matchedRoutes.length) {
      return matchedRoutes[selectedOptionIdx];
    }
    return matchedRoutes[0] || null;
  }, [matchedRoutes, selectedOptionIdx]);

  // 3. Resolve starting and ending hub details
  const fromHub = hubs.find(h => h.id.toLowerCase() === fromHubId.toLowerCase());
  const toHub = hubs.find(h => h.id.toLowerCase() === toHubId.toLowerCase());
  const fromName = fromHub ? fromHub.name : fromHubId;
  const toName = toHub ? toHub.name : toHubId;

  // --- Live Weather & Season State ---
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    feelsLike: number;
    humidity: string;
    windSpeed: string;
    visibility: string;
    roadStatus: string;
    lastUpdated: string;
    weatherCode: number;
  } | null>(null);

  const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter'>('monsoon');
  const [weatherTheme, setWeatherTheme] = useState<string>('sunny');
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Auto detect season based on current date
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    let detectedSeason: 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter' = 'monsoon';
    if (currentMonth >= 2 && currentMonth <= 3) detectedSeason = 'spring';
    else if (currentMonth >= 4 && currentMonth <= 5) detectedSeason = 'summer';
    else if (currentMonth >= 6 && currentMonth <= 7) detectedSeason = 'monsoon';
    else if (currentMonth >= 8 && currentMonth <= 10) detectedSeason = 'autumn';
    else detectedSeason = 'winter';
    setSelectedSeason(detectedSeason);
  }, []);

  const toCoords = useMemo(() => {
    return getHubCoords(toHubId, toHub);
  }, [toHubId, toHub]);

  const permitRequired = useMemo(() => {
    const permitZones = ['gangtok', 'lachung', 'nathan', 'nathu la', 'zuluk', 'sikkim', 'tsomgo', 'lachen', 'gurudongmar'];
    return permitZones.some(zone => 
      fromName.toLowerCase().includes(zone) || 
      toName.toLowerCase().includes(zone) ||
      (activeRoute?.path && activeRoute.path.some(p => p.toLowerCase().includes(zone)))
    );
  }, [fromName, toName, activeRoute]);

  // Derive the weather code to use as the single source of truth
  const activeWeatherCode = useMemo(() => {
    if (isSimulated && weatherTheme) {
      if (weatherTheme === 'sunny') return 0;
      if (weatherTheme === 'partly_cloudy') return 1;
      if (weatherTheme === 'cloudy') return 3;
      if (weatherTheme === 'fog') return 45;
      if (weatherTheme === 'rain') return 51;
      if (weatherTheme === 'snow') return 71;
      if (weatherTheme === 'thunderstorm') return 95;
      if (weatherTheme === 'windy') return 3;
    }
    if (weatherData && typeof weatherData.weatherCode === 'number') {
      return weatherData.weatherCode;
    }
    return 0;
  }, [isSimulated, weatherTheme, weatherData]);

  const liveWeatherDetails = useMemo(() => {
    const code = activeWeatherCode;
    
    let condition = "Clear Sky";
    let alert = "Excellent travel conditions.";
    let indicator: "🟢" | "🟡" | "🔴" = "🟢";
    let insightText = "Excellent driving conditions.";
    let theme = "sunny";
    let iconName = "Sun";
    let colorClass = "text-amber-400";
    let badgeColorClass = "bg-amber-400/10 border-amber-400/20 text-amber-400";

    if (code === 0) {
      condition = "Clear Sky";
      alert = "Excellent travel conditions.";
      indicator = "🟢";
      insightText = "Excellent driving conditions.";
      theme = "sunny";
      iconName = "Sun";
      colorClass = "text-amber-400";
      badgeColorClass = "bg-amber-400/10 border-amber-400/20 text-amber-400";
    } else if (code === 1 || code === 2) {
      condition = "Partly Cloudy";
      alert = "Comfortable weather.";
      indicator = "🟢";
      insightText = "Comfortable weather.";
      theme = "partly_cloudy";
      iconName = "CloudSun";
      colorClass = "text-sky-400";
      badgeColorClass = "bg-sky-400/10 border-sky-400/20 text-sky-400";
    } else if (code === 3) {
      condition = "Cloudy";
      alert = "Comfortable weather.";
      indicator = "🟢";
      insightText = "Comfortable weather.";
      theme = "cloudy";
      iconName = "Cloud";
      colorClass = "text-slate-300";
      badgeColorClass = "bg-slate-300/10 border-slate-300/20 text-slate-300";
    } else if (code === 45 || code === 48) {
      condition = "Low Visibility";
      alert = "Drive carefully.";
      indicator = "🟡";
      insightText = "Drive carefully. Leave before 9 AM.";
      theme = "fog";
      iconName = "CloudFog";
      colorClass = "text-zinc-300";
      badgeColorClass = "bg-zinc-400/10 border-zinc-400/20 text-zinc-300";
    } else if (code >= 51 && code <= 57) {
      condition = "Light Rain";
      alert = "Roads may be slippery.";
      indicator = "🟡";
      insightText = "Leave before 9 AM.";
      theme = "rain";
      iconName = "CloudRain";
      colorClass = "text-teal-400";
      badgeColorClass = "bg-teal-400/10 border-teal-400/20 text-teal-400";
    } else if (code === 61 || code === 63 || (code >= 80 && code <= 81)) {
      condition = "Rain";
      alert = "Roads may be slippery.";
      indicator = "🟡";
      insightText = "Leave before 9 AM.";
      theme = "rain";
      iconName = "CloudRain";
      colorClass = "text-teal-400";
      badgeColorClass = "bg-teal-400/10 border-teal-400/20 text-teal-400";
    } else if (code === 65 || code === 82) {
      condition = "Heavy Rain";
      alert = "Landslide risk. Delay travel if possible.";
      indicator = "🔴";
      insightText = "Landslide risk. Delay travel if possible.";
      theme = "rain";
      iconName = "CloudRain";
      colorClass = "text-red-400";
      badgeColorClass = "bg-red-500/10 border-red-500/20 text-red-400";
    } else if (code >= 66 && code <= 67) {
      condition = "Freezing Rain";
      alert = "Roads may be slippery.";
      indicator = "🔴";
      insightText = "High slippage danger. Delay travel if possible.";
      theme = "rain";
      iconName = "CloudRain";
      colorClass = "text-red-400";
      badgeColorClass = "bg-red-500/10 border-red-500/20 text-red-400";
    } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      const isHeavy = code === 75 || code === 86;
      condition = "Snowfall";
      alert = "Chains may be required.";
      indicator = isHeavy ? "🔴" : "🟡";
      insightText = isHeavy ? "Pass blocked. Delay travel." : "Chains may be required. Leave before 9 AM.";
      theme = "snow";
      iconName = "Snowflake";
      colorClass = isHeavy ? "text-red-400" : "text-sky-200";
      badgeColorClass = isHeavy ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-sky-200/10 border-sky-200/20 text-sky-200";
    } else if (code === 95 || code === 96 || code === 99) {
      condition = "Thunderstorm";
      alert = "Landslide risk. Delay travel if possible.";
      indicator = "🔴";
      insightText = "Landslide risk. Delay travel if possible.";
      theme = "thunderstorm";
      iconName = "CloudLightning";
      colorClass = "text-orange-400";
      badgeColorClass = "bg-orange-500/10 border-orange-500/20 text-orange-400";
    }

    return {
      condition,
      alert,
      indicator,
      insightText,
      theme,
      iconName,
      colorClass,
      badgeColorClass
    };
  }, [activeWeatherCode]);

  const finalAiTravelInsight = useMemo(() => {
    const { indicator, condition, insightText } = liveWeatherDetails;
    return `${indicator} ${condition} • ${insightText}`;
  }, [liveWeatherDetails]);

  useEffect(() => {
    let active = true;
    const cacheKey = `hillytrip_weather_cache_${toHubId.toLowerCase()}`;

    const loadWeather = async () => {
      setIsLoadingWeather(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${toCoords.lat}&longitude=${toCoords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        
        if (data && data.current) {
          const current = data.current;
          const temp = Math.round(current.temperature_2m);
          const feelsLike = Math.round(current.apparent_temperature);
          const humidity = `${current.relative_humidity_2m}%`;
          const windSpeed = `${Math.round(current.wind_speed_10m)} km/h`;
          const rawVis = current.visibility;
          const visibility = rawVis ? (rawVis >= 1000 ? `${Math.round(rawVis / 1000)} km` : `${rawVis} m`) : "10 km";
          const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const code = current.weather_code;

          const updatedData = {
            temp,
            feelsLike,
            humidity,
            windSpeed,
            visibility,
            roadStatus: "Open",
            lastUpdated,
            weatherCode: code
          };

          if (active) {
            setWeatherData(updatedData);
            localStorage.setItem(cacheKey, JSON.stringify({ data: updatedData, timestamp: Date.now() }));
            
            if (!isSimulated) {
              const currentHour = new Date().getHours();
              const theme = mapWMOCodeToTheme(code, current.wind_speed_10m, currentHour);
              setWeatherTheme(theme);
            }
          }
        }
      } catch (err) {
        console.error("Live weather fetch failed, attempting cache...", err);
        try {
          const cachedString = localStorage.getItem(cacheKey);
          if (cachedString) {
            const { data: cachedData } = JSON.parse(cachedString);
            if (active && cachedData) {
              setWeatherData(cachedData);
              if (!isSimulated) {
                const currentHour = new Date().getHours();
                const theme = mapWMOCodeToTheme(cachedData.weatherCode || 0, parseFloat(cachedData.windSpeed) || 10, currentHour);
                setWeatherTheme(theme);
              }
              return;
            }
          }
        } catch (e) {}

        const lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const fallbackData = {
          temp: 16,
          feelsLike: 15,
          humidity: "50%",
          windSpeed: "10 km/h",
          visibility: "10 km",
          roadStatus: "Open",
          lastUpdated,
          weatherCode: 0
        };
        if (active) {
          setWeatherData(fallbackData);
          if (!isSimulated) {
            setWeatherTheme('sunny');
          }
        }
      } finally {
        if (active) setIsLoadingWeather(false);
      }
    };

    loadWeather();
    const interval = setInterval(loadWeather, 30 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [toCoords, toHubId, isSimulated]);

  // 4. Saved Pin Route State
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    try {
      const savedList = JSON.parse(localStorage.getItem('hillytrip_saved_routes') || '[]');
      if (activeRoute) {
        setIsSaved(savedList.includes(activeRoute.id));
      }
    } catch (e) {}
  }, [activeRoute]);

  const toggleSaveRoute = () => {
    if (!activeRoute) return;
    const executeAction = () => {
      try {
        const savedList = JSON.parse(localStorage.getItem('hillytrip_saved_routes') || '[]');
        let updatedList = [];
        if (savedList.includes(activeRoute.id)) {
          updatedList = savedList.filter((id: string) => id !== activeRoute.id);
          setIsSaved(false);
          if (setNotification) setNotification({ type: 'success', message: 'Removed route from Saved Journeys.' });
        } else {
          updatedList = [...savedList, activeRoute.id];
          setIsSaved(true);
          if (setNotification) setNotification({ type: 'success', message: 'Route pinned to Saved Journeys!' });
        }
        localStorage.setItem('hillytrip_saved_routes', JSON.stringify(updatedList));
      } catch (e) {}
    };

    if (executeProtectedAction) {
      executeProtectedAction('Save Route', executeAction, false, {
        type: 'SAVE_ROUTE',
        payload: { id: activeRoute.id }
      });
    } else {
      executeAction();
    }
  };

  // 5. Copy and share route link
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/#/routes/${fromHubId}-to-${toHubId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      if (setNotification) setNotification({ type: 'success', message: 'Shareable route path copied to clipboard!' });
    }).catch(() => {
      if (setNotification) setNotification({ type: 'success', message: `Share link: ${shareUrl}` });
    });
  };

  // 6. Dynamic Google Maps External URL
  const googleMapsUrl = useMemo(() => {
    if (!activeRoute || !activeRoute.path || activeRoute.path.length === 0) return '#';
    const path = activeRoute.path;
    const origin = path[0];
    const destination = path[path.length - 1];
    const waypoints = path.slice(1, -1).join('|');
    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const params = [
      `origin=${encodeURIComponent(origin + ', India')}`,
      `destination=${encodeURIComponent(destination + ', India')}`,
      `travelmode=driving`
    ];
    if (waypoints) {
      params.push(`waypoints=${encodeURIComponent(waypoints.split('|').map(w => w + ', India').join('|'))}`);
    }
    return `${baseUrl}&${params.join('&')}`;
  }, [activeRoute]);

  // 7. Find destinations/attractions/homestays near hubs
  const nearbyDestinations = useMemo(() => {
    return destinations.filter(d => 
      d.nearestHubId?.toLowerCase() === fromHubId.toLowerCase() || 
      d.nearestHubId?.toLowerCase() === toHubId.toLowerCase()
    ).slice(0, 4);
  }, [destinations, fromHubId, toHubId]);

  const nearbyAttractions = useMemo(() => {
    const parentDestIds = nearbyDestinations.map(d => d.id.toLowerCase());
    return attractions.filter(a => 
      a.nearestHubId?.toLowerCase() === fromHubId.toLowerCase() || 
      a.nearestHubId?.toLowerCase() === toHubId.toLowerCase() ||
      (a.destinationId && parentDestIds.includes(a.destinationId.toLowerCase()))
    ).slice(0, 8);
  }, [attractions, nearbyDestinations, fromHubId, toHubId]);

  const relatedRoutes = useMemo(() => {
    if (!activeRoute) return [];
    return routes.filter(r => 
      r.id !== activeRoute.id && 
      (r.fromHubId.toLowerCase() === fromHubId.toLowerCase() || r.toHubId.toLowerCase() === toHubId.toLowerCase())
    ).slice(0, 4);
  }, [routes, activeRoute, fromHubId, toHubId]);

  // 8. Generate Timeline Node Details
  const timelineStops = useMemo(() => {
    if (!activeRoute) return [];
    const rawStops = generateTimelineStops(activeRoute, fromName, toName);

    // Helper to remove DB IDs and resolve clean titles
    const cleanName = (nameOrId: string): string => {
      if (!nameOrId) return '';
      const clean = nameOrId.toLowerCase().trim();
      
      // Try exact ID match
      const hub = hubs.find(h => h.id.toLowerCase() === clean);
      if (hub) return hub.name;
      const dest = destinations.find(d => d.id.toLowerCase() === clean);
      if (dest) return dest.name;
      const attr = attractions.find(a => a.id.toLowerCase() === clean);
      if (attr) return attr.name;
      const home = homestays.find(h => h.id.toLowerCase() === clean);
      if (home) return home.name;

      // Try fallback prefixes or contains
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

    return rawStops.map(stop => {
      const cleanedName = cleanName(stop.name);
      return {
        ...stop,
        name: cleanedName,
        desc: stop.desc
          .replace(/[a-zA-Z0-9]+-[a-zA-Z0-9]+/g, (m) => cleanName(m))
          .replace(/(vil|hub|route|taxi)[0-9]+/gi, (m) => cleanName(m))
      };
    });
  }, [activeRoute, fromName, toName, hubs, destinations, attractions, homestays]);

  // Active highlighted stop details for interactive timeline accordion (collapsed by default)
  const [expandedStopIdx, setExpandedStopIdx] = useState<number | null>(null);
  
  // Toggle between live Google Maps and interactive corridor vector visualization
  const [mapViewMode, setMapViewMode] = useState<'google' | 'corridor'>('google');

  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);

  const distanceKm = activeRoute?.distance || 72;
  const timeMin = activeRoute?.timeMin || 180;
  const timeMax = activeRoute?.timeMax || 240;
  const fareMin = activeRoute?.fareMin || 2200;
  const fareMax = activeRoute?.fareMax || 3500;

  // Curated filters for the 12-section mobile-first layout
  const routeDestinations = useMemo(() => {
    const pathHubs = (activeRoute?.path || []).map(h => h.toLowerCase());
    const matched = destinations.filter(d => 
      pathHubs.some(ph => d.name?.toLowerCase().includes(ph) || d.nearestHubId?.toLowerCase() === ph) ||
      d.nearestHubId?.toLowerCase() === fromHubId.toLowerCase() || 
      d.nearestHubId?.toLowerCase() === toHubId.toLowerCase()
    );
    return matched.length > 0 ? matched.slice(0, 6) : destinations.slice(0, 4);
  }, [destinations, activeRoute, fromHubId, toHubId]);

  const routeHomestays = useMemo(() => {
    const pathDestIds = routeDestinations.map(d => d.id.toLowerCase());
    const matched = homestays.filter(h => 
      pathDestIds.includes(h.destinationId.toLowerCase()) ||
      h.destinationId.toLowerCase() === toHubId.toLowerCase() ||
      h.destinationId.toLowerCase() === fromHubId.toLowerCase()
    );
    const list = matched.length > 0 ? matched : homestays.slice(0, 6);
    return [...list].sort((a, b) => {
      const aIsTo = a.destinationId.toLowerCase() === toHubId.toLowerCase() ? 1 : 0;
      const bIsTo = b.destinationId.toLowerCase() === toHubId.toLowerCase() ? 1 : 0;
      return bIsTo - aIsTo;
    }).slice(0, 6);
  }, [homestays, routeDestinations, fromHubId, toHubId]);

  const routeAttractions = useMemo(() => {
    const pathDestIds = routeDestinations.map(d => d.id.toLowerCase());
    const matched = attractions.filter(a => 
      pathDestIds.includes(a.destinationId.toLowerCase()) ||
      a.nearestHubId?.toLowerCase() === fromHubId.toLowerCase() ||
      a.nearestHubId?.toLowerCase() === toHubId.toLowerCase()
    );
    return matched.length > 0 ? matched.slice(0, 6) : attractions.slice(0, 6);
  }, [attractions, routeDestinations, fromHubId, toHubId]);

  const foodStops = useMemo(() => {
    return [
      {
        name: "Lal Tea Stall & Cardamom Chai",
        desc: "Famous for local organic ginger tea, hot steamed butter cookies, and freshly ground cardamom chai.",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop",
        distance: "18 km elapsed",
        rating: "4.8",
        price: "₹30 - ₹80"
      },
      {
        name: "Sherpa Momo Cabin",
        desc: "Authentic Himalayan hand-folded hot momos served with piping-hot home-made clear broth.",
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&auto=format&fit=crop",
        distance: "34 km elapsed",
        rating: "4.9",
        price: "₹100 - ₹200"
      },
      {
        name: "Highway Orchid Restaurant",
        desc: "Spacious riverside diner serving organic local Sikkimese rice meals, saag, and fresh mountain trout.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop",
        distance: "52 km elapsed",
        rating: "4.7",
        price: "₹150 - ₹350"
      }
    ];
  }, []);

  const utilityStops = useMemo(() => {
    return [
      {
        icon: "⛽",
        title: "Fuel Station",
        desc: "Indian Oil Pump",
        status: "Fully Active",
        dist: "Near Hub Base"
      },
      {
        icon: "🏧",
        title: "ATM Services",
        desc: "SBI & HDFC ATM",
        status: "Cash Available",
        dist: "Hub Center"
      },
      {
        icon: "🏥",
        title: "Medical Help",
        desc: "Govt Sub Hospital",
        status: "24/7 Emergency",
        dist: "Checkpost Wing"
      },
      {
        icon: "👮",
        title: "Police Outpost",
        desc: "Sikkim State Police",
        status: "Checkpost Duty",
        dist: "Border Zone"
      }
    ];
  }, []);

  // Determine route visual cover
  const detailCover = "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=1200&auto=format&fit=crop";

  // Fallback layout when no route matches
  if (!activeRoute) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center select-none text-left bg-[#030d07] min-h-screen text-white flex flex-col justify-center items-center">
        <AlertTriangle className="w-16 h-16 text-emerald-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black uppercase tracking-wider text-emerald-400">No Verified Route Found</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-sm leading-relaxed">
          The tactical highway parameters from <strong>{fromName}</strong> to <strong>{toName}</strong> are currently offline or being calculated by regional mountain driver syndicates.
        </p>
        <button 
          onClick={() => navigate('#/routes')}
          className="mt-6 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-widest uppercase rounded-xl transition duration-150 cursor-pointer"
        >
          Explore Verified Routes
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#030d07] min-h-screen text-slate-100 font-sans selection:bg-emerald-500/10 pb-28">
      
      {/* 1. Header Navigation Row (Hidden on Mobile/Tablet, visible on Desktop) */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 border-b border-emerald-500/5 justify-between items-center gap-4 text-left">
        <nav className="flex text-[10px] font-mono font-black tracking-wider uppercase text-slate-400 gap-2 items-center">
          <button onClick={() => navigate('#/')} className="hover:text-emerald-400 cursor-pointer">HOME</button>
          <span>/</span>
          <button onClick={() => navigate('#/routes')} className="hover:text-emerald-400 cursor-pointer">ROUTES</button>
          <span>/</span>
          <span className="text-emerald-400 truncate max-w-[150px] sm:max-w-none">{fromName} TO {toName}</span>
        </nav>

        <button 
          onClick={() => navigate('#/routes')}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest font-mono text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" /> Back to Routes Catalog
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-3 md:pt-8 pb-8 sm:px-6 lg:px-8 space-y-8 md:space-y-12">
        
        {/* Alternate Routes Dropdown Selector (if multiple matching routes are available) */}
        {matchedRoutes.length > 1 && (
          <div className="bg-emerald-950/20 border border-emerald-500/15 p-4 rounded-2xl text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block font-mono">ALTERNATE HIGHWAY CORRIDORS</span>
              <p className="text-xs text-slate-300 font-medium mt-0.5">We found {matchedRoutes.length} alternate transit corridors. Select one to refresh diagnostics.</p>
            </div>
            <select
              value={selectedOptionIdx}
              onChange={(e) => setSelectedOptionIdx(Number(e.target.value))}
              className="bg-[#020a06] border border-emerald-500/20 text-xs font-mono font-bold text-emerald-400 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer shrink-0"
            >
              {matchedRoutes.map((r, i) => (
                <option key={r.id} value={i}>
                  Option {i + 1}: {r.type || 'Standard'} • Dist: {r.distance || 72}km
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ==================== 1. HERO SECTION ==================== */}
        <div className={`relative rounded-3xl overflow-hidden bg-slate-950 p-4 sm:p-6 md:p-8 border ${weatherConfigs[liveWeatherDetails.theme]?.borderAccent || 'border-white/10'} shadow-2xl min-h-[290px] sm:min-h-[340px] flex flex-col justify-between transition-all duration-500`}>
          <WeatherAnimationsStyle />
          
          {/* Top-Left Back Button (Mobile/Tablet Only) */}
          <div className="absolute top-4 left-4 z-20 md:hidden">
            <button
              onClick={() => navigate('#/routes')}
              className="p-2.5 bg-slate-950/70 hover:bg-slate-950 border border-white/10 text-white rounded-full transition-all duration-150 backdrop-blur-md cursor-pointer flex items-center justify-center shadow-md active:scale-95"
              title="Back to Routes"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
          
          {/* Top-Right Icon-Only Actions (Save & Share) */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              onClick={toggleSaveRoute}
              className="p-2.5 bg-slate-950/70 hover:bg-slate-950 border border-white/10 text-white rounded-full transition-all duration-150 backdrop-blur-md cursor-pointer flex items-center justify-center shadow-md active:scale-95"
              title={isSaved ? "Saved" : "Save Route"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : 'text-slate-300 hover:text-white'}`} />
            </button>
            <button
              onClick={copyShareLink}
              className="p-2.5 bg-slate-950/70 hover:bg-slate-950 border border-white/10 text-white rounded-full transition-all duration-150 backdrop-blur-md cursor-pointer flex items-center justify-center shadow-md active:scale-95"
              title="Share Route"
            >
              <Share2 className="w-4 h-4 text-slate-300 hover:text-white" />
            </button>
          </div>
          
          {/* Immersive zoom background image with dark gradient overlay (75%) */}
          <div 
            className="absolute inset-0 z-0 overflow-hidden"
            style={{
              '--weather-hero-filter': weatherConfigs[liveWeatherDetails.theme]?.imageFilter || 'none',
              '--weather-hero-blend-color': weatherConfigs[liveWeatherDetails.theme]?.overlayColor || 'transparent',
              '--weather-hero-blend-mode': weatherConfigs[liveWeatherDetails.theme]?.overlayBlendMode || 'normal',
            } as React.CSSProperties}
          >
            <img 
              src={weatherConfigs[liveWeatherDetails.theme]?.bgUrl || detailCover} 
              alt={`${fromName} to ${toName}`} 
              className="w-full h-full object-cover object-center opacity-85 scale-105 animate-zoom-slow transition-all duration-700"
              style={{
                filter: 'var(--weather-hero-filter, none)',
              }}
            />
            {/* Added 75% dark background overlay for maximal readability */}
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] transition-all duration-700 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/45 transition-all duration-700 pointer-events-none" />
          </div>

          {/* Ambient Animation Layer */}
          {liveWeatherDetails.theme === 'sunny' && <SunraysAnimation />}
          {liveWeatherDetails.theme === 'rain' && <RainAnimation />}
          {liveWeatherDetails.theme === 'snow' && <SnowAnimation />}
          {liveWeatherDetails.theme === 'fog' && <FogAnimation />}
          {liveWeatherDetails.theme === 'thunderstorm' && <ThunderstormAnimation />}
          {(liveWeatherDetails.theme === 'windy' || liveWeatherDetails.theme === 'cloudy' || liveWeatherDetails.theme === 'partly_cloudy') && (
            <CloudsAnimation fast={liveWeatherDetails.theme === 'windy'} />
          )}

          {/* Hero Content Grid with Compact spacing */}
          <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pt-8 md:pt-0">
            <div className="space-y-2.5 text-left flex-1 min-w-0">
              
              {/* ROUTE TITLE */}
              <div className="flex flex-col text-left space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 text-xs sm:text-sm font-semibold">
                  <span className="text-emerald-400">📍</span>
                  <span>{fromName}</span>
                </div>
                <div className="text-emerald-400/80 font-black text-xs pl-1 leading-none">↓</div>
                <div className="flex items-center gap-1.5 text-white text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-none">
                  <span className="text-emerald-400">🏔️</span>
                  <span>{toName}</span>
                </div>
              </div>

              {/* AI JOURNEY SUMMARY (Single concise line) */}
              <div className="inline-flex items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl max-w-max backdrop-blur-md shadow-sm">
                <p className="text-slate-200 text-[10px] sm:text-xs font-semibold leading-none tracking-wide">
                  {finalAiTravelInsight}
                </p>
              </div>
            </div>

            {/* LIVE WEATHER HUD PANEL */}
            <div className="bg-slate-950/60 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md flex items-center gap-4 shadow-lg shrink-0 w-full md:w-auto max-w-sm">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center shadow-inner">
                {liveWeatherDetails.iconName === 'Sun' && <Sun className="w-8 h-8 text-amber-400 animate-pulse" />}
                {liveWeatherDetails.iconName === 'CloudSun' && <CloudSun className="w-8 h-8 text-sky-400 animate-pulse" />}
                {liveWeatherDetails.iconName === 'Cloud' && <Cloud className="w-8 h-8 text-slate-300" />}
                {liveWeatherDetails.iconName === 'CloudFog' && <CloudFog className="w-8 h-8 text-zinc-300 animate-pulse" />}
                {liveWeatherDetails.iconName === 'CloudRain' && <CloudRain className="w-8 h-8 text-teal-400 animate-bounce" />}
                {liveWeatherDetails.iconName === 'Snowflake' && <Snowflake className="w-8 h-8 text-sky-200 animate-pulse" />}
                {liveWeatherDetails.iconName === 'CloudLightning' && <CloudLightning className="w-8 h-8 text-orange-400 animate-pulse" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                    {weatherData ? `${Math.round(weatherData.temp)}°C` : '16°C'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                    Feels {weatherData ? `${Math.round(weatherData.feelsLike)}°C` : '15°C'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className={`text-xs font-extrabold ${liveWeatherDetails.colorClass}`}>
                    {liveWeatherDetails.condition}
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-[10px] text-slate-300 font-medium leading-none">
                    {liveWeatherDetails.alert}
                  </span>
                </div>
                <div className="text-[8.5px] text-slate-500 font-mono mt-1.5 flex items-center gap-1 uppercase font-bold">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Live Station Weather</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK INFO (Two compact rows) */}
          <div className="relative z-10 space-y-1.5 pt-3 border-t border-white/5 mt-2">
            {/* Row 1 */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/95 font-bold">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${liveWeatherDetails.indicator === '🔴' ? 'bg-red-500 animate-ping' : liveWeatherDetails.indicator === '🟡' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                <span>{liveWeatherDetails.indicator === '🔴' ? 'Delayed Travel' : liveWeatherDetails.indicator === '🟡' ? 'Caution Advised' : 'Road Open'}</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1">
                <span>⏱</span>
                <span>{Math.round(timeMin / 60)}h {timeMin % 60 > 0 ? `${timeMin % 60}m` : '00m'}</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1">
                <span>📏</span>
                <span>{distanceKm} km</span>
              </span>
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/95 font-bold">
              <span className="flex items-center gap-1">
                <span>🚖</span>
                <span>₹{fareMin}–₹{fareMax}</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1">
                <span>⭐</span>
                <span>4.8</span>
              </span>
              {permitRequired && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[11px]">
                    <span>🛂 Permit Required</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* PRIMARY ACTIONS */}
          <div className="relative z-10 flex flex-row gap-3 pt-3 border-t border-white/10 text-left items-center mt-3">
            <button
              onClick={() => {
                if (executeProtectedAction) {
                  executeProtectedAction('Get Live Quotes', () => setShowQuoteModal(true), false, {
                    type: 'OPEN_QUOTE_MODAL',
                    payload: {}
                  });
                } else {
                  setShowQuoteModal(true);
                }
              }}
              className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-350 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 active:scale-98 cursor-pointer"
            >
              <span>🚖</span>
              <span>Get Live Quotes</span>
            </button>
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-2 backdrop-blur-sm cursor-pointer"
            >
              <span>🧭</span>
              <span>Navigate</span>
              <ExternalLink className="w-3 h-3 text-white/50" />
            </a>
          </div>
        </div>

        {/* ==================== 2️⃣ LIVE GOOGLE ROUTE MAP ==================== */}
        <div className="space-y-4 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-emerald-500/10 pb-3">
            <div>
              <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">02 • DYNAMIC TRANSIT RADAR</span>
              <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Live Google Route Map</h3>
            </div>
            
            {/* Map Mode Selector Toggle */}
            <div className="flex bg-slate-950 border border-emerald-500/15 p-1 rounded-xl self-stretch sm:self-auto">
              <button
                onClick={() => setMapViewMode('google')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                  mapViewMode === 'google'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Map
              </button>
              <button
                onClick={() => setMapViewMode('corridor')}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                  mapViewMode === 'corridor'
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Corridor View
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-emerald-500/15 shadow-xl bg-slate-950">
            {mapViewMode === 'google' ? (
              <GoogleRouteMap 
                fromHubId={fromHubId}
                toHubId={toHubId}
                fromName={fromName}
                toName={toName}
                activeRoute={activeRoute}
                timelineStops={timelineStops}
                hubs={hubs}
                destinations={destinations}
                attractions={attractions}
                homestays={homestays}
              />
            ) : (
              <InteractiveRouteMap 
                fromName={fromName}
                toName={toName}
                timelineStops={timelineStops}
                distanceKm={distanceKm}
              />
            )}
          </div>
        </div>

        {/* ==================== 3️⃣ JOURNEY TIMELINE ==================== */}
        <div className="bg-[#05120c] border border-emerald-500/10 p-5 sm:p-6 rounded-3xl shadow-xl text-left">
          <div className="border-b border-emerald-500/10 pb-3 mb-5">
            <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">03 • STATION TIMELINE</span>
            <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Journey Timeline</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Click on any station node to expand detailed safety advisories, elevation points, and scenic highlights.</p>
          </div>

          <div className="relative pl-6 space-y-3">
            {/* Connecting line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-[1px] bg-emerald-500/15" />

            {timelineStops.map((stop, idx) => {
              const isExpanded = expandedStopIdx === idx;
              return (
                <div key={idx} className="group relative">
                  {/* Timeline Marker */}
                  <button
                    onClick={() => setExpandedStopIdx(isExpanded ? null : idx)}
                    className="w-full text-left focus:outline-none flex items-start gap-4"
                  >
                    <div className={`absolute -left-[21px] w-4.5 h-4.5 rounded-full border-2 transition-all flex items-center justify-center z-10 cursor-pointer ${
                      isExpanded 
                        ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-950 border-emerald-500/20 group-hover:border-emerald-500/50'
                    }`}>
                      {isExpanded && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                    </div>

                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors duration-200">
                            {stop.name}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 font-mono bg-slate-950/80 px-1.5 py-0.5 rounded uppercase">
                            {stop.category}
                          </span>
                        </div>
                        <div className="text-slate-500 hover:text-slate-300 text-xs transition-colors shrink-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {stop.desc}
                      </p>
                    </div>
                  </button>

                  {/* Expandable panel */}
                  {isExpanded && (
                    <div className="mt-3 pl-4 border-l border-emerald-500/20 overflow-hidden space-y-3 pb-2 transition-all duration-300">
                      {stop.details?.photo && (
                        <div className="h-40 w-full relative rounded-xl overflow-hidden shadow-md">
                          <img src={stop.details.photo} alt={stop.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#05120c] to-transparent opacity-80" />
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300 pt-1">
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/40">
                          <span className="text-[8.5px] text-emerald-400 font-mono uppercase block font-black">🏔 Elevation</span>
                          <span className="text-white font-bold block mt-0.5">{stop.elevation} Meters</span>
                        </div>
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900/40">
                          <span className="text-[8.5px] text-emerald-400 font-mono uppercase block font-black">⚡ Safety Advisory</span>
                          <span className="text-slate-300 block mt-0.5">{stop.details?.tips || 'Proceed with standard mountain clearance.'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono font-bold uppercase pt-1 px-1">
                        <span>Distance: {stop.distanceElapsed} km elapsed</span>
                        <span>Travel Time: ~{stop.timeElapsed} mins</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== 4️⃣ DESTINATION HIGHLIGHTS ==================== */}
        <div className="space-y-4 text-left">
          <div className="border-b border-emerald-500/10 pb-3">
            <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">04 • HUB RECOMMENDATIONS</span>
            <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Destination Highlights</h3>
            <p className="text-xs text-slate-400 mt-1">Stunning, highly curated mountain destinations lying directly on or close to your transit route.</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-2 sm:mx-0 scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {routeDestinations.map((dest) => {
              const rating = (dest.id.charCodeAt(0) % 5 === 0) ? "4.9" : (dest.id.charCodeAt(0) % 3 === 0) ? "4.7" : "4.8";
              const distance = dest.distanceFromHub ? `${dest.distanceFromHub} km` : `${(dest.id.charCodeAt(0) % 12) + 2} km`;
              return (
                <div 
                  key={dest.id}
                  className="bg-slate-950 border border-emerald-500/10 hover:border-emerald-500/25 rounded-2xl min-w-[260px] max-w-[280px] shrink-0 snap-start overflow-hidden group flex flex-col justify-between transition-all duration-300"
                >
                  <div>
                    <div className="h-40 w-full relative overflow-hidden bg-slate-900">
                      <img 
                        src={dest.image || "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=600"} 
                        alt={dest.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-[10px] text-white font-bold flex items-center gap-1">
                        <span>📍</span>
                        <span>{distance} from route</span>
                      </div>
                      <div className="absolute top-2 right-2 bg-emerald-500/90 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-sm">
                        <span>⭐</span>
                        <span>{rating}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5 text-left">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">{dest.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{dest.description}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => navigate(`#/destinations/${dest.id}`)}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-1.5 border border-emerald-500/15 cursor-pointer"
                    >
                      <span>Explore Destination</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== 5️⃣ RECOMMENDED HOMESTAYS ==================== */}
        <div className="space-y-4 text-left">
          <div className="border-b border-emerald-500/10 pb-3">
            <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">05 • PREMIUM MOUNTAIN STAYS</span>
            <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Recommended Homestays</h3>
            <p className="text-xs text-slate-400 mt-1">Cozy, highly-rated family homestays offering organic meals and breathtaking views near your destination.</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-2 sm:mx-0 scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {routeHomestays.map((home) => {
              const rating = (home.id.charCodeAt(0) % 4 === 0) ? "4.9" : (home.id.charCodeAt(0) % 3 === 0) ? "4.7" : "4.8";
              const startPrice = home.priceMin || 1800;
              const distance = `${(home.id.charCodeAt(0) % 8) + 1} km from hub`;
              const isFeatured = home.status === 'Approved' || home.id.charCodeAt(0) % 2 === 0;
              return (
                <div 
                  key={home.id}
                  className="bg-slate-950 border border-emerald-500/10 hover:border-emerald-500/25 rounded-2xl min-w-[260px] max-w-[280px] shrink-0 snap-start overflow-hidden group flex flex-col justify-between transition-all duration-300"
                >
                  <div>
                    <div className="h-40 w-full relative overflow-hidden bg-slate-900">
                      <img 
                        src={home.images?.[0] || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600"} 
                        alt={home.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      {isFeatured && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase shadow-md flex items-center gap-1 z-10">
                          <span>🔥</span>
                          <span>Featured</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-[10px] text-white font-bold flex items-center gap-0.5 z-10 shadow-sm">
                        <span>⭐</span>
                        <span>{rating}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-md border border-white/5 px-2 py-0.5 rounded-lg text-[9px] text-slate-300 font-mono font-bold flex items-center gap-1 z-10">
                        <span>📍</span>
                        <span>{distance}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5 text-left">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider line-clamp-1">{home.name}</h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          🍳 Breakfast Included
                        </span>
                        <span className="text-[9px] bg-white/5 border border-white/10 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                          🏔️ View
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex items-center justify-between gap-4 border-t border-white/5 mt-2">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold">STARTING FROM</span>
                      <span className="text-sm font-black text-emerald-400">₹{startPrice}</span>
                      <span className="text-[9px] text-slate-500 font-mono">/night</span>
                    </div>
                    <button
                      onClick={() => navigate(`#/homestays/${home.id}`)}
                      className="px-4 py-2 bg-emerald-400 hover:bg-emerald-350 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition duration-150 flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <span>Book</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== 6️⃣ TAXI BOOKING ==================== */}
        <div className="bg-gradient-to-br from-[#061e12] to-[#030d07] border border-emerald-500/20 p-5 sm:p-6 rounded-3xl shadow-2xl text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm inline-block">
                  06 • INSTANT RESERVATION
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>12 Operators Online</span>
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                🚖 Reserved Private Taxi Booking
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Secure a dedicated vehicle with an experienced local driver. Guaranteed flat-rate quotes, automatic permit assistance, and complete roadside flex-stops.
              </p>
              
              {/* Dynamic details for the reservation block */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>💰 Fare Range:</span>
                  <span className="text-white font-black">₹{fareMin}–₹{fareMax}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>⚡ Avg Response:</span>
                  <span className="text-emerald-400 font-black">&lt; 5 mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>⭐ Rating:</span>
                  <span className="text-amber-400 font-black">4.9/5 Operator Avg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🟢 Status:</span>
                  <span className="text-white font-bold">Live Booking Open</span>
                </div>
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col justify-center items-stretch md:items-end gap-2.5 w-full md:w-auto">
              <button
                onClick={() => {
                  if (executeProtectedAction) {
                    executeProtectedAction('Get Live Quotes', () => setShowQuoteModal(true), false, {
                      type: 'OPEN_QUOTE_MODAL',
                      payload: {}
                    });
                  } else {
                    setShowQuoteModal(true);
                  }
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                🚖 Get Live Quotes
              </button>
              <span className="text-[9px] text-slate-500 text-center md:text-right block font-mono">
                Free cancellation • Pay directly to operator
              </span>
            </div>
          </div>
        </div>

        {/* ==================== 7️⃣ ATTRACTIONS ALONG ROUTE ==================== */}
        <div className="space-y-4 text-left">
          <div className="border-b border-emerald-500/10 pb-3">
            <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">07 • SCENIC SIGHTSEEING</span>
            <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Attractions Along Route</h3>
            <p className="text-xs text-slate-400 mt-1">Breath-taking monasteries, serene lakes, and dynamic waterfalls directly along the highways.</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-2 sm:mx-0 scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {routeAttractions.map((att) => {
              const distance = `${(att.id.charCodeAt(0) % 6) + 1} km off route`;
              return (
                <div 
                  key={att.id}
                  className="bg-slate-950 border border-emerald-500/10 hover:border-emerald-500/25 rounded-2xl min-w-[240px] max-w-[260px] shrink-0 snap-start overflow-hidden group flex flex-col justify-between transition-all duration-300"
                >
                  <div>
                    <div className="h-36 w-full relative overflow-hidden bg-slate-900">
                      <img 
                        src={att.image || "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=600"} 
                        alt={att.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-500/90 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase">
                        {att.category || 'Sightseeing'}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[9px] text-white font-bold flex items-center gap-1">
                        <span>📍</span>
                        <span>{distance}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1 text-left">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider line-clamp-1">{att.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{att.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== 8️⃣ FOOD & TEA STOPS ==================== */}
        <div className="space-y-4 text-left">
          <div className="border-b border-emerald-500/10 pb-3">
            <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">08 • MOUNTAIN TASTES</span>
            <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Food & Tea Stops</h3>
            <p className="text-xs text-slate-400 mt-1">Savour organic mountain ginger tea, hand-rolled hot momos, and local cardamom drinks along the highway shoulders.</p>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-2 sm:mx-0 scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {foodStops.map((food, idx) => (
              <div 
                key={idx}
                className="bg-slate-950 border border-emerald-500/10 hover:border-emerald-500/25 rounded-2xl min-w-[250px] max-w-[270px] shrink-0 snap-start overflow-hidden group flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  <div className="h-36 w-full relative overflow-hidden bg-slate-900">
                    <img 
                      src={food.image} 
                      alt={food.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-slate-950/85 border border-white/10 px-2.5 py-0.5 rounded-full text-[9px] text-emerald-400 font-bold font-mono">
                      {food.distance}
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-500/95 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-sm">
                      <span>⭐</span>
                      <span>{food.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-1 text-left">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider line-clamp-1">{food.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{food.desc}</p>
                    <div className="pt-2 text-[10px] text-emerald-400/90 font-bold">
                      Price Guide: {food.price}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== 9️⃣ FUEL / ATM / HOSPITAL / POLICE ==================== */}
        <div className="space-y-4 text-left">
          <div className="border-b border-emerald-500/10 pb-3">
            <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">09 • ROAD UTILITIES</span>
            <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Emergency & Road Utilities</h3>
            <p className="text-xs text-slate-400 mt-1">Tactical coordinates of fuel, cash points, hospitals, and checkposts along the route corridors.</p>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 -mx-2 sm:mx-0 scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {utilityStops.map((util, idx) => (
              <div 
                key={idx}
                className="bg-slate-950 border border-emerald-500/10 p-3.5 rounded-xl min-w-[170px] max-w-[190px] shrink-0 snap-start text-left flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{util.icon}</span>
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">{util.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{util.desc}</p>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded inline-block font-bold mt-1">
                    {util.status}
                  </span>
                </div>
                <span className="text-[8.5px] text-slate-500 font-mono block mt-3 border-t border-slate-900 pt-2 uppercase font-bold">
                  📍 {util.dist}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== 🔟 TRAVELLER GALLERY ==================== */}
        <div className="space-y-4 text-left">
          <div className="border-b border-emerald-500/10 pb-3">
            <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">10 • COMMUNITY GALLERY</span>
            <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Traveller Gallery</h3>
            <p className="text-xs text-slate-400 mt-1">Stunning captures of mountains, bridges, and winding passes uploaded by previous corridor travellers.</p>
          </div>
          <RouteGallery 
            routeId={activeRoute.id}
            fromName={fromName}
            toName={toName}
          />
        </div>

        {/* ==================== 1️⃣1️⃣ TRAVELLER REVIEWS ==================== */}
        <div className="space-y-4 text-left">
          <div className="border-b border-emerald-500/10 pb-3">
            <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">11 • LIVE TRAVELLER VOICE</span>
            <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Traveller Reviews</h3>
            <p className="text-xs text-slate-400 mt-1">Real-time reviews and transit feedback shared by active travellers on this highway corridor.</p>
          </div>
          <RouteReviews 
            routeId={activeRoute.id}
            fromName={fromName}
            toName={toName}
            setNotification={setNotification}
          />
        </div>

        {/* ==================== 1️⃣2️⃣ RELATED ROUTES ==================== */}
        {relatedRoutes.length > 0 && (
          <div className="space-y-4 text-left">
            <div className="border-b border-emerald-500/10 pb-3">
              <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono">12 • ALTERNATIVE TRANSIT CORRIDORS</span>
              <h3 className="text-xl font-black text-white mt-0.5 uppercase tracking-wide">Related Routes</h3>
              <p className="text-xs text-slate-400 mt-1">Browse alternate transit options starting from or ending near these hub stations.</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 -mx-2 sm:mx-0 scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {relatedRoutes.map(rel => {
                const relFrom = hubs.find(h => h.id.toLowerCase() === rel.fromHubId.toLowerCase())?.name || rel.fromHubId;
                const relTo = hubs.find(h => h.id.toLowerCase() === rel.toHubId.toLowerCase())?.name || rel.toHubId;
                return (
                  <div 
                    key={rel.id}
                    onClick={() => {
                      navigate(`#/routes/${rel.fromHubId}-to-${rel.toHubId}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-slate-950 border border-emerald-500/10 p-4 rounded-xl min-w-[240px] max-w-[260px] shrink-0 snap-start hover:border-emerald-500/25 transition cursor-pointer flex justify-between items-center group"
                  >
                    <div>
                      <span className="text-[8.5px] font-mono font-bold text-emerald-400 uppercase bg-[#020a06] border border-emerald-500/15 px-1.5 py-0.5 rounded-sm">
                        {rel.type || 'Direct'}
                      </span>
                      <h4 className="text-xs font-black text-white mt-2 uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
                        {relFrom} → {relTo}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                        Distance: {rel.distance || 72}km • Time: ~{Math.round((rel.timeMin || 180) / 60 * 10) / 10}h
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform duration-200 shrink-0 ml-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ==================== STICKY ACTION BAR ==================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/85 backdrop-blur-md border-t border-emerald-500/10 py-3.5 px-4 z-40 shadow-2xl flex justify-center">
        <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3.5">
          
          <div className="flex items-center gap-2.5 text-left select-none">
            <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg border border-emerald-500/25 shrink-0 hidden sm:block">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            </div>
            <div>
              <h5 className="text-[10.5px] font-black text-white uppercase tracking-wider leading-tight">
                {fromName} <span className="text-emerald-500">→</span> {toName}
              </h5>
              <span className="text-[9px] text-slate-400 font-mono font-bold uppercase mt-0.5 block">
                {distanceKm} km • ~{Math.round(timeMin / 60 * 10) / 10}h • Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (executeProtectedAction) {
                  executeProtectedAction('Get Live Quotes', () => setShowQuoteModal(true), false, {
                    type: 'OPEN_QUOTE_MODAL',
                    payload: {}
                  });
                } else {
                  setShowQuoteModal(true);
                }
              }}
              className="flex-grow sm:flex-grow-0 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-lg transition duration-150 cursor-pointer shadow-md text-center"
            >
              🚖 Get Live Quotes
            </button>
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4.5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-emerald-500/20 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition duration-150 flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" /> Navigate <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <button
              onClick={toggleSaveRoute}
              className="p-2.5 bg-slate-950/40 border border-slate-900 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              title="Save Corridor"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Quote Request modal popup */}
      {showQuoteModal && (
        <QuoteRequestModal
          fromName={fromName}
          toName={toName}
          routeId={activeRoute?.id}
          user={user}
          onClose={() => setShowQuoteModal(false)}
          onSubmitSuccess={(requestId) => {
            setShowQuoteModal(false);
            if (setNotification) {
              setNotification({ type: 'success', message: 'Broadcast successful! Operators are notified.' });
            }
            navigate(`#/quote-request-status/${requestId}`);
          }}
        />
      )}

    </div>
  );
}
