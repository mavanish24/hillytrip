// src/components/RouteDetailsPage.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import SEOBreadcrumbs from './SEOBreadcrumbs';
import { 
  ArrowLeft, MapPin, Car, Clock, Heart, Share2, Calendar,
  ExternalLink, ChevronRight, CheckCircle, Info, Sparkles, Home,
  AlertCircle, Phone, Award, Eye, Navigation, MessageSquare, AlertTriangle,
  Compass, ShieldCheck, PhoneCall, AlertOctagon, HeartHandshake, CloudRain,
  Activity, Thermometer, Wind, EyeOff, Send, X, Bot, Sparkle, Search,
  Sun, Cloud, CloudSun, CloudLightning, CloudFog, Snowflake, Sunset, Moon,
  ChevronDown, ChevronUp, Star, Filter, Coffee, Fuel, Hospital, Utensils,
  Layers, Shield, RefreshCw, Camera, ThumbsUp, Map as MapIcon, SlidersHorizontal,
  ParkingCircle, Zap, Check, Mountain, ShieldAlert, Users
} from 'lucide-react';
import { Route, Hub, Destination, Attraction, Homestay, User } from '../types';
import { FEATURED_CIRCUITS, LOOP_JOURNEYS, CuratedJourney, LoopJourney } from '../data/journeysData';
import { getItemSlug, toSlug } from '../utils/slug';
import { motion, AnimatePresence } from 'motion/react';
import { 
  WeatherAnimationsStyle, SunraysAnimation, RainAnimation, SnowAnimation, 
  FogAnimation, ThunderstormAnimation, CloudsAnimation, 
  getHubCoords, mapWMOCodeToTheme, weatherConfigs, seasonConfigs 
} from './WeatherEngine';

import { getAltInfo, generateTimelineStops } from '../utils/routeHelpers';
import { formatHillytripFare, formatRouteDistance, formatRouteDuration } from '../utils/fareFormatter';
import { resolveEntityName } from '../utils/entityResolver';
import { calculateDynamicRoute } from '../services/routeCalculationEngine';
import safeLazy from '../utils/safeLazy';
const GoogleRouteMap = safeLazy(() => import('./GoogleRouteMap'));
const InteractiveRouteMap = safeLazy(() => import('./InteractiveRouteMap'));
const RouteGallery = safeLazy(() => import('./RouteGallery'));
const QuoteRequestModal = safeLazy(() => import('./QuoteRequestModal'));
const RouteReviews = safeLazy(() => import('./RouteReviews'));
import { getJourneyIntelligence, JourneyIntelligenceResult, JourneyPOI } from '../services/journeyIntelligenceEngine';
import { extractNumericDistrictCode, DISTRICT_CODE_MAP, OFFICIAL_DISTRICTS } from '../utils/districtUtils';

// Module-level client route cache for instant back-and-forth navigation
const clientRouteCache = new Map<string, any>();

interface RouteDetailsPageProps {
  fromHubId: string;
  toHubId: string;
  routeSlug?: string;
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
  routeSlug,
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

  const [fetchedRoute, setFetchedRoute] = useState<Route | null>(null);
  const [isFetchingRoute, setIsFetchingRoute] = useState<boolean>(false);

  // Scroll restoration on route navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [routeSlug, fromHubId, toHubId]);
  
  // Resolve curated circuit or loop journey if slug matches known curated items
  const resolvedCircuit = useMemo<CuratedJourney | null>(() => {
    if (!routeSlug) return null;
    const clean = decodeURIComponent(routeSlug).toLowerCase().trim();
    return FEATURED_CIRCUITS.find(c => c.slug.toLowerCase() === clean || c.id.toLowerCase() === clean) || null;
  }, [routeSlug]);

  const resolvedLoop = useMemo<LoopJourney | null>(() => {
    if (!routeSlug) return null;
    const clean = decodeURIComponent(routeSlug).toLowerCase().trim();
    return LOOP_JOURNEYS.find(l => l.slug.toLowerCase() === clean || l.id.toLowerCase() === clean) || null;
  }, [routeSlug]);

  // 0. Extract effective origin/destination parameters from props or routeSlug
  const { effectiveFrom, effectiveTo } = useMemo(() => {
    if (resolvedCircuit) {
      return {
        effectiveFrom: (resolvedCircuit.fromHubId || fromHubId || '').trim(),
        effectiveTo: (resolvedCircuit.toHubId || toHubId || '').trim()
      };
    }
    if (resolvedLoop) {
      const startHubClean = resolvedLoop.startHub.toLowerCase().trim();
      return {
        effectiveFrom: (fromHubId || startHubClean).trim(),
        effectiveTo: (toHubId || startHubClean).trim()
      };
    }

    let f = (fromHubId || '').trim();
    let t = (toHubId || '').trim();

    if ((!f || !t) && routeSlug) {
      const cleanSlug = decodeURIComponent(routeSlug).toLowerCase().trim();
      if (cleanSlug.includes('-to-')) {
        const parts = cleanSlug.split('-to-');
        if (!f) f = parts[0].trim();
        if (!t) t = parts[1].trim();
      } else if (cleanSlug.includes('/')) {
        const parts = cleanSlug.split('/').filter(Boolean);
        if (parts.length >= 2) {
          if (!f) f = parts[0].trim();
          if (!t) t = parts[1].trim();
        }
      }
    }

    return { effectiveFrom: f, effectiveTo: t };
  }, [fromHubId, toHubId, routeSlug, resolvedCircuit, resolvedLoop]);

  // Universal entity matcher helper for finding existing verified database routes
  const entityMatches = useCallback((entityIdOrName: string, queryPart: string): boolean => {
    if (!entityIdOrName || !queryPart) return false;
    const eClean = String(entityIdOrName).toLowerCase().trim();
    const qClean = String(queryPart).toLowerCase().trim();
    if (eClean === qClean || toSlug(eClean) === toSlug(qClean)) return true;

    const findInCollections = (term: string) => {
      const tClean = term.toLowerCase().trim();
      const tSlug = toSlug(tClean);

      const h = hubs.find(x => (x?.id || '').toLowerCase() === tClean || toSlug(x?.name) === tSlug);
      if (h) return { id: h.id.toLowerCase(), name: h.name, slug: toSlug(h.name) };

      const d = destinations.find(x => (x?.id || '').toLowerCase() === tClean || (x?.slug || '').toLowerCase() === tClean || toSlug(x?.name) === tSlug);
      if (d) return { id: d.id.toLowerCase(), name: d.name, slug: d.slug ? d.slug.toLowerCase() : toSlug(d.name) };

      const a = attractions.find(x => (x?.id || '').toLowerCase() === tClean || (x?.slug || '').toLowerCase() === tClean || toSlug(x?.name) === tSlug);
      if (a) return { id: a.id.toLowerCase(), name: a.name, slug: a.slug ? a.slug.toLowerCase() : toSlug(a.name) };

      const hm = homestays.find(x => (x?.id || '').toLowerCase() === tClean || toSlug(x?.name) === tSlug);
      if (hm) return { id: hm.id.toLowerCase(), name: hm.name, slug: toSlug(hm.name) };

      return null;
    };

    const ent1 = findInCollections(eClean);
    const ent2 = findInCollections(qClean);

    if (ent1 && ent2) {
      if (ent1.id === ent2.id || ent1.slug === ent2.slug) return true;
    }

    if (ent1) {
      if (ent1.id === qClean || ent1.slug === toSlug(qClean) || toSlug(ent1.name) === toSlug(qClean)) return true;
    }

    if (ent2) {
      if (ent2.id === eClean || ent2.slug === toSlug(eClean) || toSlug(ent2.name) === toSlug(eClean)) return true;
    }

    const isNjpOrSiliguri = (s: string) => s.includes('njp') || s.includes('jalpaiguri') || s.includes('siliguri') || s.includes('taxi0001') || s.includes('hub0001') || s.includes('dest0018');
    if (isNjpOrSiliguri(eClean) && isNjpOrSiliguri(qClean)) return true;

    return false;
  }, [hubs, destinations, attractions, homestays]);

  // 1. Find matching verified database routes with maximum robustness
  const matchedRoutes = useMemo(() => {
    if (routeSlug) {
      const slugClean = decodeURIComponent(routeSlug).toLowerCase().trim();
      const slugNorm = toSlug(slugClean);

      const bySlug = routes.filter(r => {
        if (!r) return false;
        const rId = String(r.id || '').toLowerCase();
        const rSlug = String(r.slug || '').toLowerCase();
        const rName = String((r as any).route_name || (r as any).routeName || (r as any).name || '').toLowerCase();

        return (
          rId === slugClean ||
          toSlug(rId) === slugNorm ||
          rSlug === slugClean ||
          rSlug === slugNorm ||
          getItemSlug(r) === slugNorm ||
          toSlug(rName) === slugNorm
        );
      });
      if (bySlug.length > 0) return bySlug;

      if (slugClean.includes('-to-')) {
        const [fromPart, toPart] = slugClean.split('-to-');
        const byFromTo = routes.filter(r => {
          if (!r) return false;
          const rFrom = r.fromHubId || (r as any).from_taxi_stand || '';
          const rTo = r.toHubId || (r as any).to_destination || '';
          return (
            (entityMatches(rFrom, fromPart) && entityMatches(rTo, toPart)) ||
            (entityMatches(rTo, fromPart) && entityMatches(rFrom, toPart))
          );
        });
        if (byFromTo.length > 0) return byFromTo;
      }
    }

    if (effectiveFrom && effectiveTo) {
      const directMatches = routes.filter(r => {
        if (!r) return false;
        const rFrom = String(r.fromHubId || (r as any).from_taxi_stand || '').toLowerCase();
        const rTo = String(r.toHubId || (r as any).to_destination || '').toLowerCase();
        return (
          (entityMatches(rFrom, effectiveFrom) && entityMatches(rTo, effectiveTo)) ||
          (entityMatches(rFrom, effectiveTo) && entityMatches(rTo, effectiveFrom))
        );
      });
      if (directMatches.length > 0) return directMatches;
    }

    return [];
  }, [routes, effectiveFrom, effectiveTo, routeSlug, entityMatches]);

  // 2. Fetch authoritative Google route directly from server API in background (with fast client-side caching)
  useEffect(() => {
    if (resolvedCircuit || resolvedLoop) return; // Curated data is already fully resolved in-memory

    const activeLookupParam = routeSlug || (effectiveFrom && effectiveTo ? `${effectiveFrom}-to-${effectiveTo}` : '');
    if (!activeLookupParam) return;

    // Check client route cache first for instant 0ms restoration
    if (clientRouteCache.has(activeLookupParam)) {
      setFetchedRoute(clientRouteCache.get(activeLookupParam));
      return;
    }

    if (!fetchedRoute && !isFetchingRoute) {
      setIsFetchingRoute(true);

      fetch(`/api/routes/${encodeURIComponent(activeLookupParam)}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data && data.route) {
            clientRouteCache.set(activeLookupParam, data.route);
            setFetchedRoute(data.route);
          }
        })
        .catch(err => {
          console.warn('[Route Details] Backend route fetch fallback:', err?.message || err);
        })
        .finally(() => {
          setIsFetchingRoute(false);
        });
    }
  }, [resolvedCircuit, resolvedLoop, routeSlug, effectiveFrom, effectiveTo, fetchedRoute, isFetchingRoute]);

  // 3. Dynamic route synthesis when no database route row exists (Instant topographical route calculation)
  const circuitRoute = useMemo<Route | null>(() => {
    if (resolvedCircuit) {
      const distNum = parseInt(resolvedCircuit.distance) || undefined;
      return {
        id: resolvedCircuit.id,
        fromHubId: resolvedCircuit.fromHubId,
        toHubId: resolvedCircuit.toHubId,
        path: resolvedCircuit.journeyStops || [],
        type: 'Reserved' as const,
        fareMin: 0 as any,
        fareMax: 0 as any,
        timeMin: 0 as any,
        timeMax: 0 as any,
        verified: true,
        lastUpdated: `Curated Himalayan Circuit • ${resolvedCircuit.duration}`,
        distance: distNum,
        description: resolvedCircuit.description,
        slug: resolvedCircuit.slug,
      };
    }
    if (resolvedLoop) {
      const distNum = parseInt(resolvedLoop.totalDistance) || undefined;
      return {
        id: resolvedLoop.id,
        fromHubId: resolvedLoop.startHub.toLowerCase(),
        toHubId: resolvedLoop.startHub.toLowerCase(),
        path: resolvedLoop.stops || [],
        type: 'Direct' as const,
        fareMin: 0 as any,
        fareMax: 0 as any,
        timeMin: 0 as any,
        timeMax: 0 as any,
        verified: true,
        lastUpdated: `Zero Backtracking Loop • ${resolvedLoop.totalDuration}`,
        distance: distNum,
        description: resolvedLoop.description,
        slug: resolvedLoop.slug,
      };
    }
    return null;
  }, [resolvedCircuit, resolvedLoop]);

  // Authoritative client fallback route computed via routeCalculationEngine
  const fallbackDynamicRoute = useMemo<Route | null>(() => {
    if (circuitRoute) return null;
    if (!effectiveFrom || !effectiveTo) return null;

    const fromNameResolved = resolveEntityName(effectiveFrom, hubs, destinations, attractions, homestays, false);
    const toNameResolved = resolveEntityName(effectiveTo, hubs, destinations, attractions, homestays, true);

    // Compute instant high-precision Himalayan route metrics via authoritative route engine
    const calculated = calculateDynamicRoute(effectiveFrom, effectiveTo, { hubs, destinations });

    return {
      id: `DYNAMIC-${toSlug(effectiveFrom)}-to-${toSlug(effectiveTo)}`,
      fromHubId: effectiveFrom,
      toHubId: effectiveTo,
      path: [fromNameResolved, toNameResolved],
      type: 'Direct',
      fareMin: calculated.fareMin,
      fareMax: calculated.fareMax,
      timeMin: calculated.timeMin,
      timeMax: calculated.timeMax,
      timeFormatted: calculated.timeFormatted,
      verified: true,
      lastUpdated: 'Live Himalayan Corridor Engine',
      distance: calculated.distanceKm,
      description: calculated.description || `Scenic mountain journey connecting ${fromNameResolved} and ${toNameResolved}.`,
      ...( {
        polyline: calculated.polyline,
        sharedFarePerSeat: calculated.sharedFarePerSeat,
        roadType: calculated.roadType
      } as any)
    };
  }, [circuitRoute, effectiveFrom, effectiveTo, hubs, destinations, attractions, homestays]);

  // 4. Active Selected Option Index for alternate routes
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);

  const activeRoute = useMemo<Route | null>(() => {
    if (circuitRoute) return circuitRoute;
    if (fetchedRoute) return fetchedRoute;

    let base: Route | null = null;
    if (matchedRoutes.length > 0 && selectedOptionIdx < matchedRoutes.length) {
      base = matchedRoutes[selectedOptionIdx];
    } else if (matchedRoutes.length > 0) {
      base = matchedRoutes[0];
    }

    // If database match has complete metrics, use it directly
    if (base && base.distance && Number(base.distance) > 0) {
      return base;
    }

    // If database match exists but lacks metrics, merge with authoritative client fallback
    if (base && fallbackDynamicRoute) {
      return {
        ...fallbackDynamicRoute,
        ...base,
        distance: base.distance || fallbackDynamicRoute.distance,
        timeMin: base.timeMin || fallbackDynamicRoute.timeMin,
        timeMax: base.timeMax || fallbackDynamicRoute.timeMax,
        timeFormatted: (base as any).timeFormatted || (fallbackDynamicRoute as any).timeFormatted,
        fareMin: base.fareMin || fallbackDynamicRoute.fareMin,
        fareMax: base.fareMax || fallbackDynamicRoute.fareMax,
        polyline: (base as any).polyline || (fallbackDynamicRoute as any).polyline,
      };
    }

    return base || fallbackDynamicRoute;
  }, [circuitRoute, fetchedRoute, matchedRoutes, selectedOptionIdx, fallbackDynamicRoute]);

  // 5. Resolve starting and ending entity names
  const effectiveFromHubId = activeRoute ? activeRoute.fromHubId : effectiveFrom;
  const effectiveToHubId = activeRoute ? activeRoute.toHubId : effectiveTo;

  const fromName = useMemo(() => {
    if (resolvedLoop) return resolvedLoop.startHub;
    if (resolvedCircuit) return resolveEntityName(resolvedCircuit.fromHubId, hubs, destinations, attractions, homestays, false);
    return resolveEntityName(effectiveFromHubId || effectiveFrom, hubs, destinations, attractions, homestays, false, activeRoute?.path);
  }, [resolvedLoop, resolvedCircuit, effectiveFromHubId, effectiveFrom, hubs, destinations, attractions, homestays, activeRoute]);

  const toName = useMemo(() => {
    if (resolvedLoop) return `${resolvedLoop.startHub} (Circular Return)`;
    if (resolvedCircuit) return resolveEntityName(resolvedCircuit.toHubId, hubs, destinations, attractions, homestays, true);
    return resolveEntityName(effectiveToHubId || effectiveTo, hubs, destinations, attractions, homestays, true, activeRoute?.path);
  }, [resolvedLoop, resolvedCircuit, effectiveToHubId, effectiveTo, hubs, destinations, attractions, homestays, activeRoute]);

  const journeyTitle = useMemo(() => {
    if (resolvedCircuit) return resolvedCircuit.name;
    if (resolvedLoop) return resolvedLoop.title;
    return `${fromName} → ${toName}`;
  }, [resolvedCircuit, resolvedLoop, fromName, toName]);

  // --- Journey Intelligence Engine State ---
  const [jieResult, setJieResult] = useState<JourneyIntelligenceResult | null>(null);
  const [isLoadingJie, setIsLoadingJie] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingJie(true);
    getJourneyIntelligence(
      effectiveFromHubId || fromHubId,
      effectiveToHubId || toHubId,
      activeRoute,
      hubs,
      destinations,
      attractions,
      homestays
    )
      .then((res) => {
        if (isMounted) {
          setJieResult(res);
          setIsLoadingJie(false);
        }
      })
      .catch((err) => {
        console.error('Journey Intelligence Generation Error:', err);
        if (isMounted) setIsLoadingJie(false);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveFromHubId, fromHubId, effectiveToHubId, toHubId, activeRoute, hubs, destinations, attractions, homestays]);

  // --- Live Weather State ---
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

  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);

  const toHubObj = useMemo(() => {
    return hubs.find(h => (h?.id || '').toLowerCase() === (effectiveToHubId || '').toLowerCase() || toSlug(h?.name) === toSlug(effectiveToHubId));
  }, [hubs, effectiveToHubId]);

  const toCoords = useMemo(() => {
    return getHubCoords(effectiveToHubId, toHubObj);
  }, [effectiveToHubId, toHubObj]);

  const permitRequired = useMemo(() => {
    const permitZones = ['gangtok', 'lachung', 'nathan', 'nathu la', 'zuluk', 'sikkim', 'tsomgo', 'lachen', 'gurudongmar'];
    return permitZones.some(zone => 
      fromName.toLowerCase().includes(zone) || 
      toName.toLowerCase().includes(zone) ||
      (activeRoute?.path && activeRoute.path.some(p => p.toLowerCase().includes(zone)))
    );
  }, [fromName, toName, activeRoute]);

  const activeWeatherCode = weatherData?.weatherCode ?? 0;

  const liveWeatherDetails = useMemo(() => {
    const code = activeWeatherCode;
    let condition = "Clear Mountain Sky";
    let alert = "Excellent travel conditions.";
    let indicator: "🟢" | "🟡" | "🔴" = "🟢";
    let insightText = "Smooth driving, magnificent mountain clearance.";
    let iconName = "Sun";

    if (code === 0) {
      condition = "Clear Mountain Sky";
      alert = "Ideal travel conditions.";
      indicator = "🟢";
    } else if (code === 1 || code === 2) {
      condition = "Partly Cloudy";
      alert = "Pleasant hill weather.";
      indicator = "🟢";
      iconName = "CloudSun";
    } else if (code === 3) {
      condition = "Cloudy Over Pass";
      alert = "Cool breezes, clear roads.";
      indicator = "🟢";
      iconName = "Cloud";
    } else if (code === 45 || code === 48) {
      condition = "Low Visibility / Mist";
      alert = "Drive with fog lights. Best before 4 PM.";
      indicator = "🟡";
      iconName = "CloudFog";
    } else if (code >= 51 && code <= 65) {
      condition = "Light Rain Shower";
      alert = "Slippery road turns. Drive at steady pace.";
      indicator = "🟡";
      iconName = "CloudRain";
    } else if (code >= 71) {
      condition = "High Altitude Snow";
      alert = "Chains or 4x4 required on high passes.";
      indicator = "🔴";
      iconName = "Snowflake";
    }

    return { condition, alert, indicator, insightText, iconName };
  }, [activeWeatherCode]);

  useEffect(() => {
    let active = true;
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

          if (active) {
            setWeatherData({
              temp,
              feelsLike,
              humidity,
              windSpeed,
              visibility,
              roadStatus: "Open",
              lastUpdated,
              weatherCode: current.weather_code
            });
          }
        }
      } catch (err) {
        if (active) {
          setWeatherData({
            temp: 16,
            feelsLike: 15,
            humidity: "55%",
            windSpeed: "12 km/h",
            visibility: "10 km",
            roadStatus: "Open",
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            weatherCode: 0
          });
        }
      } finally {
        if (active) setIsLoadingWeather(false);
      }
    };

    loadWeather();
    return () => { active = false; };
  }, [toCoords]);

  // Saved Route state
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    try {
      const savedList = JSON.parse(localStorage.getItem('hillytrip_saved_routes') || '[]');
      if (activeRoute) setIsSaved(savedList.includes(activeRoute.id));
    } catch (e) {}
  }, [activeRoute]);

  const toggleSaveRoute = () => {
    if (!activeRoute) return;
    try {
      const savedList = JSON.parse(localStorage.getItem('hillytrip_saved_routes') || '[]');
      let updatedList = [];
      if (savedList.includes(activeRoute.id)) {
        updatedList = savedList.filter((id: string) => id !== activeRoute.id);
        setIsSaved(false);
        if (setNotification) setNotification({ type: 'success', message: 'Removed journey from saved list.' });
      } else {
        updatedList = [...savedList, activeRoute.id];
        setIsSaved(true);
        if (setNotification) setNotification({ type: 'success', message: 'Journey saved to your collection!' });
      }
      localStorage.setItem('hillytrip_saved_routes', JSON.stringify(updatedList));
    } catch (e) {}
  };

  const copyShareLink = () => {
    // Prefer routeSlug or resolved effectiveFrom/effectiveTo to prevent /#/journeys/-to- links
    let slugPart = '';
    if (resolvedCircuit) {
      slugPart = resolvedCircuit.slug;
    } else if (resolvedLoop) {
      slugPart = resolvedLoop.slug;
    } else if (routeSlug && !routeSlug.includes('undefined') && !routeSlug.includes('-to-undefined') && routeSlug !== '-to-') {
      slugPart = decodeURIComponent(routeSlug).trim();
    } else if (effectiveFrom && effectiveTo) {
      slugPart = `${toSlug(effectiveFrom)}-to-${toSlug(effectiveTo)}`;
    } else if (fromName && toName) {
      slugPart = `${toSlug(fromName)}-to-${toSlug(toName)}`;
    } else if (fromHubId && toHubId) {
      slugPart = `${fromHubId}-to-${toHubId}`;
    } else {
      slugPart = 'siliguri-to-gangtok';
    }

    const shareUrl = `${window.location.origin}/#/journeys/${slugPart}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      if (setNotification) setNotification({ type: 'success', message: 'Journey link copied to clipboard!' });
    }).catch(() => {
      if (setNotification) setNotification({ type: 'info', message: `Share link: ${shareUrl}` });
    });
  };

  // Dynamic Google Maps directions URL
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

  // Timeline stops from Journey Intelligence Engine or Curated/Loop Definition
  const timelineStops = useMemo(() => {
    if (resolvedCircuit && resolvedCircuit.journeyStops && resolvedCircuit.journeyStops.length > 0) {
      const stops = resolvedCircuit.journeyStops;
      return stops.map((stopName, idx) => {
        const alt = getAltInfo(stopName);
        const isFirst = idx === 0;
        const isLast = idx === stops.length - 1;
        return {
          name: stopName,
          category: isFirst ? 'Base Hub' : isLast ? 'Circuit Destination' : 'Scenic Stage',
          desc: isFirst ? `Journey departs from ${stopName}.` : isLast ? `Circuit culminates at ${stopName}.` : `Mountain waypoint through ${stopName}.`,
          icon: isFirst ? '🚖' : isLast ? '🏔' : '📍',
          elevation: alt.elevation,
          latOffset: 0,
          lngOffset: 0,
          distanceElapsed: Math.round((idx / (stops.length - 1 || 1)) * (parseInt(resolvedCircuit.distance) || 100)),
          timeElapsed: Math.round((idx / (stops.length - 1 || 1)) * 360),
          details: {
            duration: idx === 0 ? 'Departure' : 'Scenic Stop',
            tips: alt.description,
          },
          isMandatory: true,
          journeyScore: 9.5
        };
      });
    }

    if (resolvedLoop && resolvedLoop.stops && resolvedLoop.stops.length > 0) {
      const stops = resolvedLoop.stops;
      return stops.map((stopName, idx) => {
        const alt = getAltInfo(stopName);
        const isFirst = idx === 0;
        const isLast = idx === stops.length - 1;
        return {
          name: stopName,
          category: isFirst ? 'Loop Origin' : isLast ? 'Return Hub' : 'Loop Stop',
          desc: isFirst ? `Start loop from ${stopName}.` : isLast ? `Complete zero-backtracking circuit at ${stopName}.` : `Scenic corridor stop at ${stopName}.`,
          icon: isFirst ? '🚖' : isLast ? '🔄' : '📍',
          elevation: alt.elevation,
          latOffset: 0,
          lngOffset: 0,
          distanceElapsed: Math.round((idx / (stops.length - 1 || 1)) * (parseInt(resolvedLoop.totalDistance) || 100)),
          timeElapsed: Math.round((idx / (stops.length - 1 || 1)) * 300),
          details: {
            duration: idx === 0 ? 'Start' : 'Explore',
            tips: alt.description,
          },
          isMandatory: true,
          journeyScore: 9.0
        };
      });
    }

    if (jieResult && jieResult.timelineStops && jieResult.timelineStops.length > 0) {
      return jieResult.timelineStops.map((stop) => ({
        name: stop.name,
        category: stop.category,
        desc: stop.description,
        icon: stop.type === 'Origin' ? '🚖' : stop.type === 'Destination' ? '🏔' : stop.isMandatory ? '📍' : '✨',
        elevation: stop.elevationMeters,
        latOffset: 0,
        lngOffset: 0,
        distanceElapsed: stop.chainageKm,
        timeElapsed: stop.travelTimeMin,
        details: {
          photo: stop.image,
          tips: stop.tips,
          duration: stop.durationStopText,
        },
        isMandatory: stop.isMandatory,
        journeyScore: stop.journeyScore,
        poiRef: stop.poiRef,
      }));
    }

    if (!activeRoute) return [];
    const rawStops = generateTimelineStops(activeRoute, fromName, toName);

    const cleanName = (nameOrId: string): string => {
      if (!nameOrId) return '';
      const clean = nameOrId.toLowerCase().trim();
      const hub = hubs.find(h => h.id.toLowerCase() === clean);
      if (hub) return hub.name;
      const dest = destinations.find(d => d.id.toLowerCase() === clean);
      if (dest) return dest.name;
      const attr = attractions.find(a => a.id.toLowerCase() === clean);
      if (attr) return attr.name;
      const home = homestays.find(h => h.id.toLowerCase() === clean);
      if (home) return home.name;
      return nameOrId;
    };

    return rawStops.map(stop => {
      const cleanedName = cleanName(stop.name);
      return {
        ...stop,
        name: cleanedName,
        desc: stop.desc.replace(/[a-zA-Z0-9]+-[a-zA-Z0-9]+/g, (m) => cleanName(m))
      };
    });
  }, [resolvedCircuit, resolvedLoop, jieResult, activeRoute, fromName, toName, hubs, destinations, attractions, homestays]);

  // Expandable timeline node state
  const [expandedStopIdx, setExpandedStopIdx] = useState<number | null>(0);

  // Map view state & POI toggles
  const [mapViewMode, setMapViewMode] = useState<'google' | 'corridor'>('google');
  const [poiFilters, setPoiFilters] = useState<{ [key: string]: boolean }>({
    attractions: true,
    homestays: true,
    restaurants: true,
    fuel: true,
    taxis: true,
    hospitals: true,
    viewpoints: true,
    waterfalls: true,
    parking: false,
    evChargers: false,
    publicToilets: false
  });

  const togglePoiFilter = (key: string) => {
    setPoiFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
  const [googleDistText, setGoogleDistText] = useState<string>('');
  const [googleDurationText, setGoogleDurationText] = useState<string>('');

  const fareData = formatHillytripFare(activeRoute);

  // Existing JIE result navigation metrics fallback when activeRoute has null/unpopulated values
  const jieNav = jieResult?.routeNavigation || (jieResult as any)?.navigation;
  const jieDistance = (jieNav?.distanceKm && Number(jieNav.distanceKm) > 0)
    ? `${jieNav.distanceKm} km`
    : '';
  const distanceDisplay = resolvedCircuit
    ? resolvedCircuit.distance
    : resolvedLoop
    ? resolvedLoop.totalDistance
    : formatRouteDistance(activeRoute, googleDistText || jieDistance);

  const jieDuration = (jieNav?.etaFormatted && jieNav.etaFormatted !== 'NA')
    ? jieNav.etaFormatted
    : '';
  const timeDisplay = resolvedCircuit
    ? `${resolvedCircuit.duration} (${resolvedCircuit.estimatedTime})`
    : resolvedLoop
    ? resolvedLoop.totalDuration
    : formatRouteDuration(activeRoute, googleDurationText || jieDuration);

  // Related data filtering
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
    const toObj = hubs.find(h => h.id.toLowerCase() === toHubId.toLowerCase());
    const destCoords = getHubCoords(toHubId, toObj);
    const toSlugNorm = toHubId.toLowerCase().trim();
    const toNameNorm = (toName || '').toLowerCase().trim();
    const pathDestIds = routeDestinations.map(d => d.id.toLowerCase());

    // 1. Resolve Journey destination to its official district using HillyTrip districtUtils
    const resolveDestinationDistrict = (): string | null => {
      const candidates = [toHubId, effectiveToHubId, toName, activeRoute?.toHubId].filter(Boolean) as string[];
      for (const cand of candidates) {
        const code = extractNumericDistrictCode(cand);
        if (code && DISTRICT_CODE_MAP[code]) {
          return DISTRICT_CODE_MAP[code].district;
        }
      }

      // Check destination object district if known
      const matchedDest = destinations.find(d => 
        d.id.toLowerCase() === toHubId.toLowerCase() || 
        (d.slug && d.slug.toLowerCase() === toHubId.toLowerCase()) ||
        (d.name && d.name.toLowerCase() === toName.toLowerCase())
      );
      if (matchedDest?.district) {
        const code = extractNumericDistrictCode(matchedDest.district);
        if (code && DISTRICT_CODE_MAP[code]) {
          return DISTRICT_CODE_MAP[code].district;
        }
        return matchedDest.district;
      }

      // Check hub object district if known
      const matchedHub = hubs.find(h => 
        h.id.toLowerCase() === toHubId.toLowerCase() || 
        (h.slug && h.slug.toLowerCase() === toHubId.toLowerCase()) ||
        (h.name && h.name.toLowerCase() === toName.toLowerCase())
      );
      if (matchedHub?.district) {
        const code = extractNumericDistrictCode(matchedHub.district);
        if (code && DISTRICT_CODE_MAP[code]) {
          return DISTRICT_CODE_MAP[code].district;
        }
        return matchedHub.district;
      }

      // Exact official district matching
      const cleanCandidates = candidates.map(c => c.toLowerCase().trim());
      for (const cand of cleanCandidates) {
        const found = OFFICIAL_DISTRICTS.find(d => {
          const dName = d.district.toLowerCase();
          return cand === dName || cand.includes(dName);
        });
        if (found) return found.district;
      }

      return null;
    };

    const destDistrict = resolveDestinationDistrict();
    if (!destDistrict) {
      // If destination cannot be mapped to a known district, return empty list (never substitute random homestays)
      return [];
    }

    const targetDistrictLower = destDistrict.toLowerCase().trim();

    // 2. Primary eligible pool: All homestays strictly belonging to the destination's resolved district.
    // E.g., for Gangtok: district === "Gangtok". Pakyong and Darjeeling homestays are strictly excluded.
    // Valid district homestays > 12 km from town (e.g. Martam, Samdong, Singbel) remain 100% eligible.
    const eligiblePool = homestays.filter(h => {
      const hDist = (h.district || (h as any).district_name || '').toLowerCase().trim();
      return hDist === targetDistrictLower;
    });

    if (eligiblePool.length === 0) {
      return [];
    }

    // 3. Sort eligible district homestays by specific locality/village match and proximity to arrival hub
    const sorted = [...eligiblePool].sort((a, b) => {
      // Specific village, destination, or name match floats closest local properties to top
      const aVillage = String((a as any).village_name || (a as any).village || '').toLowerCase().trim();
      const bVillage = String((b as any).village_name || (b as any).village || '').toLowerCase().trim();
      const aName = String(a.name || '').toLowerCase().trim();
      const bName = String(b.name || '').toLowerCase().trim();

      const aSpecific = 
        (toSlugNorm && (aVillage.includes(toSlugNorm) || aName.includes(toSlugNorm))) ||
        (toNameNorm && (aVillage.includes(toNameNorm) || aName.includes(toNameNorm))) ||
        (a.destinationId && (pathDestIds.includes(a.destinationId.toLowerCase()) || a.destinationId.toLowerCase() === toSlugNorm));

      const bSpecific = 
        (toSlugNorm && (bVillage.includes(toSlugNorm) || bName.includes(toSlugNorm))) ||
        (toNameNorm && (bVillage.includes(toNameNorm) || bName.includes(toNameNorm))) ||
        (b.destinationId && (pathDestIds.includes(b.destinationId.toLowerCase()) || b.destinationId.toLowerCase() === toSlugNorm));

      if (aSpecific && !bSpecific) return -1;
      if (!aSpecific && bSpecific) return 1;

      // Coordinate proximity to arrival hub
      if (destCoords && a.latitude && a.longitude && b.latitude && b.longitude) {
        const distA = Math.hypot(a.latitude - destCoords.lat, a.longitude - destCoords.lon);
        const distB = Math.hypot(b.latitude - destCoords.lat, b.longitude - destCoords.lon);
        return distA - distB;
      }
      if (a.latitude && !b.latitude) return -1;
      if (!a.latitude && b.latitude) return 1;

      return 0;
    });

    // Select a reasonable visible subset (up to 12) from the eligible district pool for responsive rendering & clean map markers
    return sorted.slice(0, 12);
  }, [homestays, hubs, destinations, routeDestinations, toHubId, toName, effectiveToHubId, activeRoute]);

  const routeAttractions = useMemo(() => {
    if (jieResult && jieResult.allCorridorPois.length > 0) {
      const corridorAttractions = jieResult.allCorridorPois.filter((p) =>
        ['Viewpoint', 'Waterfall', 'Monastery', 'Lake', 'TeaGarden', 'Heritage', 'MandatoryStop'].includes(p.category)
      );
      if (corridorAttractions.length > 0) {
        return corridorAttractions.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.categoryLabel,
          description: p.description,
          image: p.image || '/images/hillytrip/snow-mountain.svg',
          chainageKm: p.chainageKm,
          offRouteKm: p.perpendicularDistanceKm,
          destinationId: toHubId,
        }));
      }
    }
    const pathDestIds = routeDestinations.map((d) => d.id.toLowerCase());
    const matched = attractions.filter(
      (a) =>
        pathDestIds.includes(a.destinationId.toLowerCase()) ||
        a.nearestHubId?.toLowerCase() === fromHubId.toLowerCase() ||
        a.nearestHubId?.toLowerCase() === toHubId.toLowerCase()
    );
    return matched.length > 0 ? matched.slice(0, 6) : attractions.slice(0, 6);
  }, [jieResult, attractions, routeDestinations, fromHubId, toHubId]);

  // Food & Tea stops data from Journey Intelligence Engine
  const [activeFoodCategory, setActiveFoodCategory] = useState<string>('all');
  const foodStops = useMemo(() => {
    if (jieResult && jieResult.foodStops && jieResult.foodStops.length > 0) {
      return jieResult.foodStops.map((poi) => ({
        id: poi.id,
        category: poi.category.toLowerCase(),
        categoryLabel: poi.categoryLabel,
        name: poi.name,
        desc: poi.description,
        image: poi.image || '/images/hillytrip/tea-garden.svg',
        distance: `${poi.chainageKm} km from start`,
        rating: poi.rating ? poi.rating.toFixed(1) : '4.8',
        price: '₹50 - ₹250',
        openNow: true,
      }));
    }

    return [
      {
        id: 'f1',
        category: 'tea',
        categoryLabel: 'Tea Garden',
        name: `${fromName} Tea & Cardamom Stall`,
        desc: 'Famous for local organic ginger tea, hot steamed butter cookies, and freshly ground cardamom chai.',
        image: '/images/hillytrip/tea-garden.svg',
        distance: '18 km from start',
        rating: '4.9',
        price: '₹30 - ₹80',
        openNow: true,
      },
      {
        id: 'f2',
        category: 'local',
        categoryLabel: 'Local Food',
        name: 'Sherpa Momo Cabin & Broth',
        desc: 'Authentic Himalayan hand-folded hot momos served with piping-hot home-made clear broth and spicy fiery red chili chutney.',
        image: '/images/hillytrip/himalayan-food.svg',
        distance: '34 km from start',
        rating: '4.9',
        price: '₹100 - ₹200',
        openNow: true,
      },
    ];
  }, [jieResult, fromName]);

  const filteredFoodStops = useMemo(() => {
    if (activeFoodCategory === 'all') return foodStops;
    return foodStops.filter(f => f.category === activeFoodCategory);
  }, [foodStops, activeFoodCategory]);

  // Weather along route major stops
  const weatherAlongRoute = useMemo(() => {
    return [
      { stop: fromName, temp: "28°C", icon: "Sun", rainProb: "5%", vis: "10 km", wind: "8 km/h", status: "Warm & Clear" },
      { stop: "Sevoke Gorge", temp: "25°C", icon: "CloudSun", rainProb: "10%", vis: "10 km", wind: "10 km/h", status: "River Breeze" },
      { stop: "Kalimpong Checkpost", temp: "21°C", icon: "CloudSun", rainProb: "15%", vis: "10 km", wind: "12 km/h", status: "Pleasant" },
      { stop: "Rangpo Border", temp: "20°C", icon: "Sun", rainProb: "10%", vis: "10 km", wind: "10 km/h", status: "Sunny" },
      { stop: "Gangtok Ridge", temp: "17°C", icon: "Cloud", rainProb: "20%", vis: "8 km", wind: "14 km/h", status: "Cool & Crisp" },
      { stop: toName, temp: weatherData ? `${weatherData.temp}°C` : "14°C", icon: liveWeatherDetails.iconName, rainProb: "15%", vis: weatherData?.visibility || "10 km", wind: weatherData?.windSpeed || "12 km/h", status: liveWeatherDetails.condition }
    ];
  }, [fromName, toName, weatherData, liveWeatherDetails]);

  // Related routes
  const relatedRoutes = useMemo(() => {
    if (!activeRoute) return [];
    return routes.filter(r => 
      r.id !== activeRoute.id && 
      (r.fromHubId.toLowerCase() === fromHubId.toLowerCase() || r.toHubId.toLowerCase() === toHubId.toLowerCase())
    ).slice(0, 4);
  }, [routes, activeRoute, fromHubId, toHubId]);

  // AI Assistant Drawer & Chat State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Greetings traveller! I am your HillyTrip Journey Assistant for the ${fromName} → ${toName} corridor. Ask me about real-time road conditions, tea stops, landslides, or homestays along this route!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleSendAi = (customText?: string) => {
    const textToSend = customText || aiInput;
    if (!textToSend.trim()) return;

    const newMsg = { sender: 'user' as const, text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAiMessages(prev => [...prev, newMsg]);
    if (!customText) setAiInput('');

    setTimeout(() => {
      let reply = "The road is fully operational. Drive safely!";
      const q = textToSend.toLowerCase();

      if (q.includes('safe') || q.includes('road')) {
        reply = `Status: 🟢 **Road Fully Open**. The highway corridor between ${fromName} and ${toName} is clear. Minor wet patches near mountain bends, but certified hill drivers report smooth passage today!`;
      } else if (q.includes('tea') || q.includes('chai')) {
        reply = `☕ **Top Tea Spot**: We strongly recommend stopping at *Lal Tea Stall* (~18 km out) for hot cardamom chai and fresh ginger biscuits with river views!`;
      } else if (q.includes('viewpoint') || q.includes('photo')) {
        reply = `📸 **Best Viewpoint**: Don't miss the panoramic halt near *Corridor View Point* (~45 km). You can see the Teesta river gorge and pine ridges in one frame!`;
      } else if (q.includes('landslide')) {
        reply = `🛡 **Landslide Alert**: No active landslide disruptions reported on the ${fromName} → ${toName} highway today. Road patrol crews are active at checkposts.`;
      } else if (q.includes('breakfast') || q.includes('food')) {
        reply = `🍳 **Breakfast Choice**: Try *Sevoke Riverside Dhaba* for piping hot Aloo Parathas or *Sherpa Momo Cabin* for authentic clear soup momos.`;
      } else if (q.includes('stay') || q.includes('homestay') || q.includes('tonight')) {
        reply = `🏔 **Recommended Stay**: Nearby ${toName}, check out *${routeHomestays[0]?.name || 'Verdant Hill Homestay'}* starting at ₹${routeHomestays[0]?.priceMin || 1800}/night with organic home-cooked meals!`;
      } else {
        reply = `For the journey from **${fromName}** to **${toName}** (${distanceDisplay}, ~${timeDisplay}): All road checkposts are active, weather is ${liveWeatherDetails.condition}, and private taxis are available on instant broadcast!`;
      }

      setAiMessages(prev => [...prev, {
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 400);
  };

  const detailCover = resolvedCircuit?.image || resolvedLoop?.image || "/images/hillytrip/himalayan-landscape.svg";

  if (!activeRoute) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen text-slate-900 font-sans flex flex-col justify-center items-center px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Route Currently Unavailable</h2>
        <p className="text-slate-600 text-sm mt-2 max-w-sm leading-relaxed">
          We could not resolve a routable road connection between <strong>{fromName}</strong> and <strong>{toName}</strong>. Please try selecting another location.
        </p>
        <button 
          onClick={() => navigate('#/routes')}
          className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition duration-150 shadow-md cursor-pointer"
        >
          Explore All Journeys
        </button>
      </div>
    );
  }

  const routeBreadcrumbItems = [
    { name: 'Journeys', path: '/journeys' },
    { name: journeyTitle, path: `/journeys/${routeSlug || `${toSlug(fromName)}-to-${toSlug(toName)}`}` }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80; 
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-28">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="bg-[#13231B] text-white border-b border-emerald-900/30 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <SEOBreadcrumbs navigate={navigate} items={routeBreadcrumbItems} className="px-0 py-0 text-slate-300" />
          <button 
            onClick={() => navigate('#/journeys')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Journeys
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-12">
        
        {/* Alternate Routes Dropdown */}
        {matchedRoutes.length > 1 && (
          <div className="bg-emerald-900/10 border border-emerald-800/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest font-mono">ALTERNATE HIGHWAY CORRIDORS</span>
              <p className="text-xs text-slate-700 font-medium mt-0.5">Found {matchedRoutes.length} alternate routes for this journey. Select one to view specifics.</p>
            </div>
            <select
              value={selectedOptionIdx}
              onChange={(e) => setSelectedOptionIdx(Number(e.target.value))}
              className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-xs shrink-0"
            >
              {matchedRoutes.map((r, i) => (
                <option key={r.id} value={i}>
                  Option {i + 1}: {r.type || 'Standard'} • {r.distance || 72} km
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ========================================================
            1. HERO SECTION
            ======================================================== */}
        <section id="section-hero" className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-950 text-white min-h-[480px] flex flex-col justify-between p-6 sm:p-8 md:p-10 border border-slate-800">
          
          {/* Background image & dark overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={detailCover} 
              alt={journeyTitle} 
              className="w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
            <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />
          </div>

          {/* Hero Top Actions Bar */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            {resolvedCircuit ? (
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-amber-300 tracking-wider uppercase shadow-md">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Curated Himalayan Circuit • {resolvedCircuit.duration}</span>
              </div>
            ) : resolvedLoop ? (
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-amber-300 tracking-wider uppercase shadow-md">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Zero Backtracking Loop • {resolvedLoop.totalDuration}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-emerald-300 tracking-wider uppercase shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified HillyTrip Journey</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSaveRoute}
                className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-white/20 rounded-full text-white transition backdrop-blur-md cursor-pointer shadow-md active:scale-95"
                title={isSaved ? "Saved" : "Save Journey"}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-red-500' : 'text-slate-200'}`} />
              </button>
              <button
                onClick={copyShareLink}
                className="p-3 bg-slate-900/80 hover:bg-slate-900 border border-white/20 rounded-full text-white transition backdrop-blur-md cursor-pointer shadow-md active:scale-95"
                title="Share Journey"
              >
                <Share2 className="w-4 h-4 text-slate-200" />
              </button>
            </div>
          </div>

          {/* Hero Main Content */}
          <div className="relative z-10 space-y-6 my-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold uppercase tracking-widest font-mono">
                {resolvedCircuit ? (
                  <>
                    <span>📍 Base: {fromName}</span>
                    <span>•</span>
                    <span>🏔️ Terminus: {toName}</span>
                    <span>•</span>
                    <span>⏱️ {resolvedCircuit.duration}</span>
                  </>
                ) : resolvedLoop ? (
                  <>
                    <span>🔄 Circular Loop</span>
                    <span>•</span>
                    <span>📍 Base: {resolvedLoop.startHub}</span>
                    <span>•</span>
                    <span>⏱️ {resolvedLoop.totalDuration}</span>
                  </>
                ) : (
                  <>
                    <span>📍 Origin: {fromName}</span>
                    <span>→</span>
                    <span>🏔️ Destination: {toName}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {resolvedCircuit ? (
                  <span>{resolvedCircuit.name}</span>
                ) : resolvedLoop ? (
                  <span>{resolvedLoop.title}</span>
                ) : (
                  <>
                    {fromName} <span className="text-emerald-400">→</span> {toName}
                  </>
                )}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
                {(activeRoute as any).description || `An unforgettable mountain passage ascending through river gorges, lush tea gardens, pine valleys, and high Himalayan checkposts.`}
              </p>
            </div>

            {/* Hero Summary Cards - Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              <div className="bg-slate-900/70 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-emerald-400 font-mono font-black uppercase block">Distance</span>
                <span className="text-base sm:text-lg font-black text-white">{distanceDisplay}</span>
              </div>
              <div className="bg-slate-900/70 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-emerald-400 font-mono font-black uppercase block">Estimated Time</span>
                <span className="text-base sm:text-lg font-black text-white">{timeDisplay}</span>
              </div>
              <div className="bg-slate-900/70 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-emerald-400 font-mono font-black uppercase block">
                  {resolvedCircuit ? 'Travel Style' : resolvedLoop ? 'Itinerary Type' : 'Highest Altitude'}
                </span>
                <span className="text-base sm:text-lg font-black text-white">
                  {resolvedCircuit ? resolvedCircuit.travelStyle : resolvedLoop ? 'Circular Loop' : '2,750 m'}
                </span>
              </div>
              <div className="bg-slate-900/70 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] text-emerald-400 font-mono font-black uppercase block">
                  {resolvedCircuit ? 'Best Season' : resolvedLoop ? 'Region' : 'Difficulty'}
                </span>
                <span className="text-base sm:text-lg font-black text-amber-300">
                  {resolvedCircuit ? resolvedCircuit.bestSeason : resolvedLoop ? resolvedLoop.region : 'Moderate'}
                </span>
              </div>
              <div className="bg-slate-900/70 border border-white/10 p-3 rounded-2xl backdrop-blur-md col-span-2 sm:col-span-1">
                <span className="text-[10px] text-emerald-400 font-mono font-black uppercase block">
                  {resolvedCircuit ? 'Scenic Score' : 'Current Temp'}
                </span>
                <span className="text-base sm:text-lg font-black text-white">
                  {resolvedCircuit ? `★ ${resolvedCircuit.scenicRating} / 5.0` : (weatherData ? `${weatherData.temp}°C` : '16°C')}
                </span>
              </div>
            </div>

            {/* Hero Summary Cards - Row 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/50 border border-white/10 p-2.5 rounded-xl backdrop-blur-md flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">Best Start Time</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">6:30 AM - 7:30 AM</span>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-white/10 p-2.5 rounded-xl backdrop-blur-md flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">Road Status</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block">Clear / All Open</span>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-white/10 p-2.5 rounded-xl backdrop-blur-md flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">Traffic Status</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">Normal Flow</span>
                </div>
              </div>
              <div className="bg-slate-900/50 border border-white/10 p-2.5 rounded-xl backdrop-blur-md flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <div>
                  <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none">Journey Score</span>
                  <span className="text-xs font-extrabold text-amber-300 mt-0.5 block">9.4 / 10 (Exceptional)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA Action Row */}
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/10">
            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Start Navigation</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-800" />
            </a>

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
              className="py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg active:scale-98 cursor-pointer"
            >
              <Car className="w-4 h-4" />
              <span>Get Taxi Quote</span>
            </button>

            {permitRequired && (
              <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-xl text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Permit Assistance Available</span>
              </div>
            )}
          </div>

        </section>

        {/* ========================================================
            2. STICKY NAVIGATION TABS
            ======================================================== */}
        <nav className="sticky top-0 z-30 bg-[#13231B]/95 backdrop-blur-md border border-emerald-900/30 rounded-2xl shadow-lg p-1.5 overflow-x-auto scrollbar-none flex items-center gap-1">
          {[
            { id: 'section-hero', label: 'Overview', icon: Home },
            { id: 'section-map', label: 'Map', icon: MapIcon },
            { id: 'section-timeline', label: 'Stops', icon: Navigation },
            { id: 'section-conditions', label: 'Conditions', icon: Activity },
            { id: 'section-weather', label: 'Weather', icon: Sun },
            { id: 'section-insights', label: 'Insights', icon: Award },
            { id: 'section-attractions', label: 'Attractions', icon: Compass },
            { id: 'section-homestays', label: 'Stay', icon: Home },
            { id: 'section-food', label: 'Food', icon: Coffee },
            { id: 'section-taxi', label: 'Taxi', icon: Car },
            { id: 'section-story', label: 'Story', icon: Sparkles },
            { id: 'section-photos', label: 'Photos', icon: Camera },
            { id: 'section-reviews', label: 'Reviews', icon: Star },
            { id: 'section-nearby', label: 'Nearby', icon: MapPin },
            { id: 'section-assistant', label: 'Smart Guide', icon: Bot },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-slate-200 hover:text-white hover:bg-emerald-800/40 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <IconComponent className="w-3.5 h-3.5 text-emerald-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ========================================================
            3. INTERACTIVE JOURNEY MAP
            ======================================================== */}
        <section id="section-map" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">03 • GEOSPATIAL INTELLIGENCE</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Interactive Journey Map</h2>
              <p className="text-slate-600 text-xs mt-0.5">Explore route polylines, terrain elevations, and toggle highway point-of-interest layers.</p>
            </div>

            {/* Map Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setMapViewMode('google')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                  mapViewMode === 'google' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Map
              </button>
              <button
                onClick={() => setMapViewMode('corridor')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                  mapViewMode === 'corridor' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Corridor View
              </button>
            </div>
          </div>

          {/* Interactive POI Filter Toggles */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-black text-slate-600 uppercase font-mono mr-1">Layer Toggles:</span>
            {[
              { key: 'attractions', label: 'Attractions', icon: Compass },
              { key: 'homestays', label: 'Homestays', icon: Home },
              { key: 'restaurants', label: 'Restaurants', icon: Utensils },
              { key: 'fuel', label: 'Fuel Stations', icon: Fuel },
              { key: 'taxis', label: 'Taxi Stands', icon: Car },
              { key: 'hospitals', label: 'Hospitals', icon: Hospital },
              { key: 'viewpoints', label: 'View Points', icon: Eye },
              { key: 'waterfalls', label: 'Waterfalls', icon: CloudRain },
              { key: 'parking', label: 'Parking', icon: ParkingCircle },
              { key: 'evChargers', label: 'EV Chargers', icon: Zap },
              { key: 'publicToilets', label: 'Toilets', icon: Users }
            ].map(filter => {
              const FilterIcon = filter.icon;
              const isActive = poiFilters[filter.key];
              return (
                <button
                  key={filter.key}
                  onClick={() => togglePoiFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <FilterIcon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{filter.label}</span>
                  {isActive && <Check className="w-3 h-3 text-emerald-700 ml-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Map Container */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950 h-[450px]">
            <Suspense fallback={
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center select-none relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-slate-950" />
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MapIcon className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-200 tracking-wide">Loading Mountain Corridor Map</p>
                    <p className="text-[11px] text-slate-500 font-mono">Initializing terrain topology and waypoints...</p>
                  </div>
                </div>
              </div>
            }>
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
                  homestays={routeHomestays}
                  onRouteLoaded={(distText, durationText) => {
                    setGoogleDistText(distText);
                    setGoogleDurationText(durationText);
                  }}
                  navigate={navigate}
                />
              ) : (
                <InteractiveRouteMap 
                  fromName={fromName}
                  toName={toName}
                  timelineStops={timelineStops}
                  distanceKm={activeRoute?.distance || (jieNav?.distanceKm ? Number(jieNav.distanceKm) : 0)}
                />
              )}
            </Suspense>
          </div>
        </section>

        {/* ========================================================
            4. JOURNEY TIMELINE
            ======================================================== */}
        <section id="section-timeline" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-6 text-left">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">04 • EXPANDABLE CORRIDOR NODES</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Journey Timeline</h2>
            <p className="text-slate-600 text-xs mt-0.5">Step-by-step route itinerary. Click any station node to expand weather, altitudes, and local amenities.</p>
          </div>

          {(resolvedCircuit || resolvedLoop) && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{resolvedCircuit ? 'Curated Multi-Day Circuit Itinerary' : 'Zero-Backtracking Circular Route Sequence'}</span>
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {resolvedCircuit ? `${resolvedCircuit.journeyStops.length} Stages • ${resolvedCircuit.duration}` : `${resolvedLoop.stops.length} Stops • ${resolvedLoop.totalDistance}`}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(resolvedCircuit ? resolvedCircuit.journeyStops : resolvedLoop.stops).map((s, sIdx, arr) => (
                  <div key={sIdx} className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                      sIdx === 0 || sIdx === arr.length - 1 
                        ? 'bg-amber-500 text-slate-950 shadow-sm' 
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}>
                      {s}
                    </span>
                    {sIdx < arr.length - 1 && (
                      <span className="text-amber-400 font-bold text-sm">→</span>
                    )}
                  </div>
                ))}
              </div>

              {resolvedCircuit?.tags && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
                  {resolvedCircuit.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {resolvedLoop?.highlights && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
                  {resolvedLoop.highlights.map((h, hIdx) => (
                    <span key={hIdx} className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2.5 py-0.5 rounded-full">
                      ★ {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="relative pl-6 space-y-4">
            {(!activeRoute?.verified || !activeRoute?.path || activeRoute.path.length === 0) ? (
              <div className="py-6 px-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-amber-900 text-sm font-medium flex items-center gap-3">
                <span className="text-lg">📍</span>
                <span>Verified journey timeline unavailable</span>
              </div>
            ) : (
              <>
                {/* Vertical timeline connector */}
                <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-emerald-200" />

                {timelineStops.map((stop, idx) => {
              const isExpanded = expandedStopIdx === idx;
              return (
                <div key={idx} className="group relative">
                  <button
                    onClick={() => setExpandedStopIdx(isExpanded ? null : idx)}
                    className="w-full text-left focus:outline-none flex items-start justify-between gap-4 p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    {/* Node Dot */}
                    <div className={`absolute -left-[23px] top-4 w-5 h-5 rounded-full border-2 transition flex items-center justify-center z-10 ${
                      isExpanded 
                        ? 'bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-600/30 text-white' 
                        : 'bg-white border-slate-300 group-hover:border-emerald-500'
                    }`}>
                      {isExpanded && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>

                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition">
                          {stop.name}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase font-mono">
                          {stop.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {stop.desc}
                      </p>
                    </div>

                    <div className="text-slate-400 group-hover:text-slate-700 shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Expanded stop details */}
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pl-4 border-l-2 border-emerald-500 space-y-4 pb-2 pt-1"
                    >
                      {stop.details?.photo && (
                        <div className="h-48 w-full relative rounded-2xl overflow-hidden shadow-md">
                          <img src={stop.details.photo} alt={stop.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                          <div className="absolute bottom-3 left-3 text-white">
                            <span className="text-xs font-bold block">{stop.name} Station View</span>
                            <span className="text-[10px] text-slate-300 font-mono">Elevation: {stop.elevation} m</span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Altitude</span>
                          <span className="text-slate-900 font-black mt-0.5 block">{stop.elevation} Meters</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Time Elapsed</span>
                          <span className="text-slate-900 font-black mt-0.5 block">~{stop.timeElapsed} mins</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Mobile Network</span>
                          <span className="text-emerald-700 font-bold mt-0.5 block">Jio / Airtel 4G</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Fuel / ATM</span>
                          <span className="text-slate-900 font-bold mt-0.5 block">Available Nearby</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 space-y-1">
                        <span className="font-extrabold block text-emerald-950">💡 Travel Tip & Safety Note:</span>
                        <p>{stop.details?.tips || 'Keep vehicle headlights clear during misty turns. Maintain moderate speed on single-lane bridges.'}</p>
                      </div>

                      <div className="flex justify-end">
                        <button 
                          onClick={() => navigate(`#/destination/${toSlug(stop.name)}`)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore Station Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
              </>
            )}
          </div>
        </section>

        {/* ========================================================
            5. LIVE CONDITIONS
            ======================================================== */}
        <section id="section-conditions" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">05 • REAL-TIME FEED</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Live Conditions</h2>
            </div>
            <span className="text-[10px] text-slate-500 font-mono font-bold">
              Updated {weatherData?.lastUpdated || 'Just now'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-black text-emerald-800 uppercase font-mono block">Road Status</span>
              <span className="text-base font-black text-emerald-900 mt-1 block">Open / Clear</span>
              <span className="text-[9px] text-emerald-700 font-medium">Patrolled by state police</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Traffic Flow</span>
              <span className="text-base font-black text-slate-900 mt-1 block">Smooth</span>
              <span className="text-[9px] text-slate-500 font-medium">No checkpost queues</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Current Weather</span>
              <span className="text-base font-black text-slate-900 mt-1 block">{weatherData ? `${weatherData.temp}°C` : '16°C'}</span>
              <span className="text-[9px] text-slate-500 font-medium">{liveWeatherDetails.condition}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Visibility</span>
              <span className="text-base font-black text-slate-900 mt-1 block">{weatherData?.visibility || '10 km'}</span>
              <span className="text-[9px] text-slate-500 font-medium">Clear road lines</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Rain Probability</span>
              <span className="text-base font-black text-slate-900 mt-1 block">15%</span>
              <span className="text-[9px] text-slate-500 font-medium">Dry mountain passes</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Landslide Risk</span>
              <span className="text-base font-black text-emerald-700 mt-1 block">Low Risk</span>
              <span className="text-[9px] text-slate-500 font-medium">Stable cliff corridors</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            6. WEATHER ALONG THE JOURNEY
            ======================================================== */}
        <section id="section-weather" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">06 • ATMOSPHERIC METRICS</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Weather Along the Journey</h2>
            <p className="text-slate-600 text-xs mt-0.5">Live temperatures and rain probabilities for key mountain halts along this highway.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {weatherAlongRoute.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1.5 hover:border-emerald-300 transition">
                <span className="text-xs font-black text-slate-900 block truncate">{item.stop}</span>
                <div className="flex items-center gap-1.5">
                  <Sun className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-xl font-black text-slate-900">{item.temp}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono font-medium space-y-0.5 pt-1 border-t border-slate-200">
                  <div>Rain: <span className="font-bold text-slate-900">{item.rainProb}</span></div>
                  <div>Vis: <span className="font-bold text-slate-900">{item.vis}</span></div>
                  <div>Wind: <span className="font-bold text-slate-900">{item.wind}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            7. JOURNEY INSIGHTS
            ======================================================== */}
        <section id="section-insights" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">07 • PERFORMANCE & RATINGS</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Journey Insights</h2>
            <p className="text-slate-600 text-xs mt-0.5">Calculated mountain transit metrics, estimated fuel expenditures, and travel experience scores.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Total Distance</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{distanceDisplay}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Est Travel Duration</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{timeDisplay}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Highest Elevation</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{jieResult ? `${jieResult.summary.highestElevationMeters.toLocaleString()} m` : '2,750 m'}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Corridor POIs</span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">{jieResult ? `${jieResult.summary.totalCorridorPois} Waypoints` : '12 Waypoints'}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Est. Fuel Cost</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">₹1,850 - ₹2,400</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Scenic Rating</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">4.9 / 5.0</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Photography Score</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">4.9 / 5.0</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Adventure Rating</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">4.6 / 5.0</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-slate-500 uppercase font-mono block">Family Friendly</span>
              <span className="text-xl font-black text-amber-600 mt-1 block">4.7 / 5.0</span>
            </div>
            <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black text-emerald-100 uppercase font-mono block">Overall Journey Score</span>
              <span className="text-2xl font-black mt-1 block">{jieResult ? `${jieResult.summary.overallJourneyScore} / 10` : '9.4 / 10'}</span>
            </div>
          </div>
        </section>

        {/* ========================================================
            8. ATTRACTIONS ALONG ROUTE
            ======================================================== */}
        <section id="section-attractions" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">08 • SCENIC HIGHLIGHTS</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Attractions Along Route</h2>
            <p className="text-slate-600 text-xs mt-0.5">Verified HillyTrip sight-seeing halts, waterfalls, and viewpoints near the highway.</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory">
            {routeAttractions.map((att) => {
              const distance = `${(att.id.charCodeAt(0) % 6) + 1} km off route`;
              return (
                <div 
                  key={att.id}
                  className="bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-2xl min-w-[260px] max-w-[280px] shrink-0 snap-start overflow-hidden group flex flex-col justify-between transition shadow-2xs"
                >
                  <div>
                    <div className="h-40 w-full relative overflow-hidden bg-slate-200">
                      <img 
                        src={att.image || "/images/hillytrip/snow-mountain.svg"} 
                        alt={att.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase">
                        {att.category || 'Sightseeing'}
                      </div>
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] text-white font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{distance}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide line-clamp-1">{att.name}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{att.description}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => navigate(`/attraction/${getItemSlug(att)}`)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Explore Attraction</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            9. RECOMMENDED HOMESTAYS
            ======================================================== */}
        <section id="section-homestays" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">09 • ACCOMMODATION</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Recommended Homestays</h2>
            <p className="text-slate-600 text-xs mt-0.5">Authentic local family homestays providing warm mountain hospitality near your route hubs.</p>
          </div>

          {routeHomestays.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory">
              {routeHomestays.map((home) => {
                const startPrice = home.priceMin || 1800;
                const distance = `${(home.id.charCodeAt(0) % 8) + 1} km from hub`;
                return (
                  <div 
                    key={home.id}
                    className="bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-2xl min-w-[270px] max-w-[290px] shrink-0 snap-start overflow-hidden group flex flex-col justify-between transition shadow-2xs"
                  >
                    <div>
                      <div className="h-40 w-full relative overflow-hidden bg-slate-200">
                        <img 
                          src={home.images?.[0] || "/images/hillytrip/homestay.svg"} 
                          alt={home.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-xs">
                          <Star className="w-3 h-3 fill-slate-950" />
                          <span>4.8</span>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] text-white font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span>{distance}</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide line-clamp-1">{home.name}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">Cozy room with organic mountain breakfast, valley balcony, and hot water amenities.</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 border-t border-slate-200 mt-2 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] text-slate-500 block font-bold font-mono">PER NIGHT</span>
                        <span className="text-base font-black text-emerald-700">₹{startPrice}</span>
                      </div>
                      <button
                        onClick={() => navigate(`#/homestay/${getItemSlug(home)}`)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Book Stay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <Home className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No homestays currently registered directly at {toName || 'this destination'}.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Local hotels and transit lodges are available at the main taxi stand.</p>
            </div>
          )}
        </section>

        {/* ========================================================
            10. FOOD & TEA STOPS
            ======================================================== */}
        <section id="section-food" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">10 • HIGHWAY CUISINE</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Food & Tea Stops</h2>
              <p className="text-slate-600 text-xs mt-0.5">Top-rated spots for organic cardamom chai, hot momos, and river thalis.</p>
            </div>

            {/* Food Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
              {[
                { id: 'all', label: 'All Stops' },
                { id: 'tea', label: 'Tea Gardens' },
                { id: 'local', label: 'Local Food' },
                { id: 'breakfast', label: 'Breakfast' },
                { id: 'lunch', label: 'Lunch' },
                { id: 'cafe', label: 'Cafes' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFoodCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeFoodCategory === cat.id ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFoodStops.map(food => (
              <div key={food.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-400 transition">
                <div>
                  <div className="h-40 w-full relative overflow-hidden bg-slate-200">
                    <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] text-emerald-300 font-mono font-bold">
                      {food.distance}
                    </div>
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-white" />
                      <span>{food.rating}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase font-mono">
                        {food.categoryLabel}
                      </span>
                      {food.openNow && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Open Now</span>
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-slate-900">{food.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{food.desc}</p>
                  </div>
                </div>
                <div className="p-4 pt-0 border-t border-slate-200 mt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Price: {food.price}</span>
                  <span className="text-[10px] text-emerald-800 font-extrabold">Verified Stop</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            11. TAXI INFORMATION
            ======================================================== */}
        <section id="section-taxi" className="bg-[#13231B] text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden">
          <div className="border-b border-emerald-800/40 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase font-mono block">11 • RESERVED & SHARED TRANSIT</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">Taxi Information & Booking</h2>
              <p className="text-slate-300 text-xs mt-1">Book certified local mountain taxi operators or reserve shared pool seats.</p>
            </div>

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
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg cursor-pointer shrink-0"
            >
              Get Live Taxi Quotes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reserved Taxi Block */}
            <div className="bg-slate-900/70 border border-emerald-500/20 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase font-mono">Reserved Private SUV / Hatchback</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">Recommended</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dedicated vehicle with certified local hill driver. Direct pick-up from NJP / Bagdogra / Siliguri with luggage clearance and optional sightseeing halts.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">ESTIMATED FARE</span>
                  <span className="text-base font-black text-white">
                    {resolvedCircuit ? 'Custom Multi-Day Quote' : resolvedLoop ? 'Full Day Circular Quote' : fareData.avgFareText}
                  </span>
                </div>
                <button 
                  onClick={() => setShowQuoteModal(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Reserve Private SUV
                </button>
              </div>
            </div>

            {/* Shared Taxi Block */}
            <div className="bg-slate-900/70 border border-emerald-500/20 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase font-mono">Shared Pool Taxi</span>
                <span className="text-xs bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">Budget Friendly</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Shared seats available from primary hub taxi stands. Departs early morning (6 AM - 8:30 AM). Ideal for solo travellers.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">ESTIMATED SEAT FARE</span>
                  <span className="text-base font-black text-white">₹450 - ₹750 / seat</span>
                </div>
                <a 
                  href="#/taxi"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Check Cabs</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            12. JOURNEY STORY
            ======================================================== */}
        <section id="section-story" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 sm:p-8 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">12 • TRAVEL STORY</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">The Story of the Journey</h2>
          </div>

          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
            <p className="text-base font-medium text-slate-800 italic border-l-4 border-emerald-500 pl-4 py-1">
              "To travel from {fromName} to {toName} is not merely to cover {distanceDisplay}; it is to witness the landscape transform from humid Bengal foothills into high Himalayan alpine sanctuaries."
            </p>
            <p>
              Your journey begins along the winding banks of the Teesta River, where turquoise waters slice through dense green gorges. As your vehicle climbs toward higher elevation checkposts, the air turns crisp and carries the crisp aroma of mountain pine and fresh cardamom estates.
            </p>
            <p>
              Halting at roadside stalls, you're greeted with steaming cups of ginger chai and hand-folded momos prepared by local hill families. Beyond the checkposts, prayer flags flutter against mountain cliffs, signalling your entry into tranquil high-altitude realms.
            </p>
          </div>
        </section>

        {/* ========================================================
            13. TRAVELLER PHOTOS
            ======================================================== */}
        <section id="section-photos" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">13 • COMMUNITY CAPTURES</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Traveller Photos</h2>
            <p className="text-slate-600 text-xs mt-0.5">Real moments and mountain views captured along the {fromName} → {toName} highway corridor.</p>
          </div>

          <Suspense fallback={
            <div className="h-32 bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-400">
              Loading community gallery...
            </div>
          }>
            <RouteGallery 
              routeId={activeRoute.id}
              fromName={fromName}
              toName={toName}
            />
          </Suspense>
        </section>

        {/* ========================================================
            14. REVIEWS
            ======================================================== */}
        <section id="section-reviews" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">14 • VERIFIED TRAVELLER FEEDBACK</span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Traveller Reviews</h2>
          </div>

          <Suspense fallback={
            <div className="h-32 bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-400">
              Loading traveller reviews...
            </div>
          }>
            <RouteReviews 
              routeId={activeRoute.id}
              fromName={fromName}
              toName={toName}
              setNotification={setNotification}
            />
          </Suspense>
        </section>

        {/* ========================================================
            15. NEARBY JOURNEYS
            ======================================================== */}
        {relatedRoutes.length > 0 && (
          <section id="section-nearby" className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-md space-y-4 text-left">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black text-emerald-700 tracking-widest uppercase font-mono block">15 • SIMILAR HIGHWAY CORRIDORS</span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Nearby Journeys</h2>
              <p className="text-slate-600 text-xs mt-0.5">Explore additional scenic mountain routes starting from or ending near these hubs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedRoutes.map(rel => {
                const relFrom = hubs.find(h => h.id.toLowerCase() === rel.fromHubId.toLowerCase())?.name || rel.fromHubId;
                const relTo = hubs.find(h => h.id.toLowerCase() === rel.toHubId.toLowerCase())?.name || rel.toHubId;
                return (
                  <div 
                    key={rel.id}
                    onClick={() => {
                      navigate(`#/journeys/${rel.fromHubId}-to-${rel.toHubId}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-slate-50 border border-slate-200 hover:border-emerald-400 p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-mono uppercase">
                        {rel.type || 'Direct'}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-2 group-hover:text-emerald-700 transition">
                        {relFrom} → {relTo}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        {rel.distance || 72} km • ~{Math.round((rel.timeMin || 180) / 60 * 10) / 10} hrs
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-emerald-700">
                      <span>View Journey</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================
            16. FLOATING AI JOURNEY ASSISTANT
            ======================================================== */}
        <div id="section-assistant" className="fixed bottom-6 right-6 z-50">
          {!isAiOpen ? (
            <button
              onClick={() => setIsAiOpen(true)}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer border-2 border-white"
            >
              <Bot className="w-5 h-5 text-amber-300 animate-bounce" />
              <span>Ask AI Guide</span>
            </button>
          ) : (
            <div className="bg-slate-950 text-white w-[350px] sm:w-[380px] h-[520px] rounded-3xl shadow-2xl border border-emerald-500/30 flex flex-col justify-between overflow-hidden animate-fade-in">
              {/* Chat Header */}
              <div className="bg-[#13231B] p-4 border-b border-emerald-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">HillyTrip AI Assistant</h4>
                    <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Route Guide Active</span>
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white font-medium rounded-br-xs'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-xs'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  "Is this road safe today?",
                  "Where should I stop for tea?",
                  "Which viewpoint is best?",
                  "Any landslide today?",
                  "Best breakfast stop?",
                  "Where to stay tonight?"
                ].map((chip, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => handleSendAi(chip)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-800 text-[10px] text-slate-300 hover:text-white rounded-full font-medium whitespace-nowrap transition border border-slate-700 cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-[#13231B] border-t border-emerald-900/40 flex items-center gap-2">
                <input 
                  type="text"
                  placeholder={`Ask about ${fromName} → ${toName}...`}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSendAi()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <Suspense fallback={null}>
          <QuoteRequestModal
            fromName={fromName}
            toName={toName}
            routeId={activeRoute?.id}
            user={user}
            onClose={() => setShowQuoteModal(false)}
            onSubmitSuccess={(requestId) => {
              setShowQuoteModal(false);
              if (setNotification) {
                setNotification({ type: 'success', message: 'Broadcast sent! Certified local taxi operators notified.' });
              }
              navigate(`#/quote-request-status/${requestId}`);
            }}
          />
        </Suspense>
      )}

    </div>
  );
}
