import React, { useState, useEffect, useRef } from 'react';
import { Car, MapPin, ChevronLeft, ChevronRight, Home, Loader2, Navigation, Compass } from 'lucide-react';
import { UniversalCarousel } from './UniversalCarousel';
import { Destination, Attraction, Route, Hub } from '../types';
import { getItemSlug, toSlug } from '../utils/slug';

interface HowToReachSectionProps {
  destination?: Destination | null;
  attraction?: Attraction | null;
  routes?: Route[];
  hubs?: Hub[];
  onNavigate?: (path: string) => void;
  setNotification?: (notif: { type: string; message: string }) => void;
  className?: string;
}

interface AccessPointInfo {
  id: string;
  title: string;
  name: string;
  icon: string;
  distance: string;
  time: string;
  type?: string;
  isAvailable: boolean;
}

const MAJOR_HUBS_CONFIG = [
  { id: 'NJP', title: 'From NJP', name: 'NJP Railway Station', icon: '🚆', aliases: ['njp', 'new jalpaiguri', 'njp railway station', 'taxi0001'] },
  { id: 'Bagdogra', title: 'From Bagdogra', name: 'Bagdogra Airport (IXB)', icon: '✈️', aliases: ['bagdogra', 'ixb', 'bagdogra airport', 'taxi0002'] },
  { id: 'Siliguri', title: 'From Siliguri', name: 'Siliguri Junction / City Hub', icon: '🏙️', aliases: ['siliguri', 'siliguri junction', 'taxi0003', 'snt bus stand'] },
  { id: 'Gangtok', title: 'From Gangtok', name: 'Gangtok Central Hub', icon: '🏔️', aliases: ['gangtok', 'deorali', 'taxi0005', 'east sikkim'] }
];

export function HowToReachSection({
  destination,
  attraction,
  routes = [],
  hubs = [],
  onNavigate,
  setNotification,
  className = ''
}: HowToReachSectionProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nearestDestination, setNearestDestination] = useState<{ name: string; distance: string }>({
    name: 'Loading...',
    distance: 'Calculating...'
  });
  const [nearestTaxiStand, setNearestTaxiStand] = useState<{ name: string; distance: string }>({
    name: 'Loading...',
    distance: 'Calculating...'
  });
  const [accessPoints, setAccessPoints] = useState<AccessPointInfo[]>([]);

  // Navigation handler
  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path.startsWith('#') ? path : `#${path}`;
    }
  };

  // Safe notification trigger
  const notify = (type: string, message: string) => {
    if (setNotification) {
      setNotification({ type, message });
    }
  };

  // Extract location coordinates and identifiers
  const villageCode = destination?.village_code || destination?.id || (destination ? getItemSlug(destination) : '');
  const villageName = destination?.name || destination?.village_name || (attraction?.name ? attraction.name : 'Himalayan Village');
  const villageDistrict = destination?.district || attraction?.district || '';
  const lat = destination?.latitude != null ? Number(destination.latitude) : (attraction?.latitude != null ? Number(attraction.latitude) : null);
  const lng = destination?.longitude != null ? Number(destination.longitude) : (attraction?.longitude != null ? Number(attraction.longitude) : null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function fetchHowToReachData() {
      try {
        let loadedNearestDest = { name: 'Not available', distance: 'Not available' };
        let loadedTaxiStand = { name: 'Not available', distance: 'Not available' };
        let dynamicRoutes: Route[] = Array.isArray(routes) && routes.length > 0 ? routes : [];

        // 1. If routes were not passed as props, attempt to load live routes
        if (dynamicRoutes.length === 0) {
          try {
            const routesRes = await fetch('/api/routes?limit=100');
            if (routesRes.ok) {
              const rData = await routesRes.json();
              if (Array.isArray(rData)) {
                dynamicRoutes = rData;
              } else if (rData?.routes && Array.isArray(rData.routes)) {
                dynamicRoutes = rData.routes;
              }
            }
          } catch {
            // Silently ignore, fallback gracefully
          }
        }

        // 2. Fetch live nearest taxi stand via specific backend route
        if (villageCode) {
          try {
            const taxiRes = await fetch(`/api/villages/${encodeURIComponent(villageCode)}/nearest-taxi-stand`);
            if (taxiRes.ok) {
              const taxiData = await taxiRes.json();
              if (taxiData?.nearestTaxiStand) {
                const standName = taxiData.nearestTaxiStand.taxi_stand_name || 
                                  taxiData.nearestTaxiStand.name || 
                                  taxiData.nearestTaxiStand.location || 
                                  'Not available';
                const distNum = taxiData.distanceGeometricKm ?? taxiData.distanceKm ?? taxiData.route?.distanceKm;
                const distFormatted = distNum != null ? `${Number(distNum).toFixed(1)} km` : 'Not available';
                
                loadedTaxiStand = {
                  name: standName,
                  distance: distFormatted
                };
              }
            }
          } catch {
            // Handled below via proximity calculation fallback
          }
        }

        // 3. Query Geo Proximity API for nearest villages and taxi stands if coordinates exist
        if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
          try {
            const nearbyRes = await fetch(`/api/nearby?lat=${lat}&lng=${lng}&radius=50&limit=10&types=villages,taxi_stands&excludeId=${encodeURIComponent(villageCode)}&excludeType=village`);
            if (nearbyRes.ok) {
              const nearbyData = await nearbyRes.json();
              
              // Resolve Nearest Destination
              const nearbyVillages = nearbyData?.nearby?.villages || [];
              if (nearbyVillages.length > 0) {
                const nearestV = nearbyVillages[0];
                const vEntity = nearestV.entity || nearestV;
                const vName = vEntity.name || vEntity.village_name || vEntity.title || 'Not available';
                const vDist = nearestV.distanceFormatted || (nearestV.distanceKm != null ? `${Number(nearestV.distanceKm).toFixed(1)} km` : 'Not available');
                
                loadedNearestDest = {
                  name: vName,
                  distance: vDist
                };
              }

              // Fallback for Nearest Taxi Stand if specific API didn't return one
              if (loadedTaxiStand.name === 'Not available') {
                const nearbyStands = nearbyData?.nearby?.taxi_stands || [];
                if (nearbyStands.length > 0) {
                  const nearestS = nearbyStands[0];
                  const sEntity = nearestS.entity || nearestS;
                  const sName = sEntity.taxi_stand_name || sEntity.name || sEntity.location || 'Not available';
                  const sDist = nearestS.distanceFormatted || (nearestS.distanceKm != null ? `${Number(nearestS.distanceKm).toFixed(1)} km` : 'Not available');
                  
                  loadedTaxiStand = {
                    name: sName,
                    distance: sDist
                  };
                }
              }
            }
          } catch {
            // Proximity service offline, fallback to database records
          }
        }

        // 4. Resolve Major Access Points (NJP, Bagdogra, Siliguri, Gangtok) dynamically
        const targetIds = [
          villageCode.toLowerCase().trim(),
          toSlug(villageName).toLowerCase().trim(),
          villageName.toLowerCase().trim(),
          (destination?.id || '').toLowerCase().trim()
        ].filter(Boolean);

        const calculatedAccessPoints: AccessPointInfo[] = MAJOR_HUBS_CONFIG.map(hub => {
          // Look for an actual route connecting this hub to the destination
          const matchedRoute = dynamicRoutes.find(r => {
            if (!r) return false;
            const fromLower = String(r.fromHubId || '').toLowerCase().trim();
            const toLower = String(r.toHubId || '').toLowerCase().trim();
            const pathArr = Array.isArray(r.path) ? r.path.map(p => String(p).toLowerCase().trim()) : [];
            
            const isFromHub = hub.aliases.some(alias => fromLower === alias || fromLower.includes(alias));
            const isToHub = hub.aliases.some(alias => toLower === alias || toLower.includes(alias));
            
            const isToDest = targetIds.some(tId => toLower === tId || toLower.includes(tId));
            const isFromDest = targetIds.some(tId => fromLower === tId || fromLower.includes(tId));
            
            const isInPath = pathArr.some(p => targetIds.some(tId => p === tId || p.includes(tId))) &&
                             (hub.aliases.some(alias => pathArr.includes(alias)) || isFromHub || isToHub);

            return (isFromHub && isToDest) || (isToHub && isFromDest) || isInPath;
          });

          if (matchedRoute && (matchedRoute.distance || matchedRoute.timeMin || matchedRoute.timeMax)) {
            const dist = matchedRoute.distance ? `${matchedRoute.distance} km` : 'Data unavailable';
            let timeStr = 'Data unavailable';
            
            if (matchedRoute.timeMin) {
              const hrs = Math.floor(matchedRoute.timeMin / 60);
              const mins = matchedRoute.timeMin % 60;
              if (hrs > 0 && mins > 0) {
                timeStr = `${hrs} hrs ${mins} mins`;
              } else if (hrs > 0) {
                timeStr = `${hrs} hrs`;
              } else {
                timeStr = `${mins} mins`;
              }
            } else if (matchedRoute.timeMax) {
              const hrs = Math.floor(matchedRoute.timeMax / 60);
              timeStr = `${hrs} hrs`;
            }

            return {
              id: hub.id,
              title: hub.title,
              name: hub.name,
              icon: hub.icon,
              distance: dist,
              time: timeStr,
              type: matchedRoute.type || 'Shared Taxi / Cab',
              isAvailable: true
            };
          }

          // If no verified route exists in database/API, show strict Data unavailable state
          return {
            id: hub.id,
            title: hub.title,
            name: hub.name,
            icon: hub.icon,
            distance: 'Data unavailable',
            time: 'Data unavailable',
            isAvailable: false
          };
        });

        if (isMounted) {
          setNearestDestination(loadedNearestDest);
          setNearestTaxiStand(loadedTaxiStand);
          setAccessPoints(calculatedAccessPoints);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHowToReachData();

    return () => {
      isMounted = false;
    };
  }, [villageCode, villageName, lat, lng, routes.length]);

  // Google Maps URL with actual coordinates or fallback location name
  const googleMapsUrl = (lat != null && lng != null && !isNaN(lat) && !isNaN(lng))
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${villageName}, ${villageDistrict}, India`)}&travelmode=driving`;

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      id="how-to-reach-section" 
      className={`bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left space-y-6 ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-emerald-600" /> How to Reach
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Practical, dynamic travel routes and access options directly from database listings
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => scrollCarousel('left')}
            aria-label="Previous access points"
            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => scrollCarousel('right')}
            aria-label="Next access points"
            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stacked Top Cards (Nearest Destination & Nearest Taxi Stand) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nearest Destination Card */}
        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block font-mono">
              Nearest Destination
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm font-normal">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculating proximity...
                </span>
              ) : (
                nearestDestination.name
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distance: <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                {loading ? '...' : nearestDestination.distance}
              </span>
            </p>
          </div>
        </div>

        {/* Nearest Taxi Stand Card */}
        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block font-mono">
              Nearest Taxi Stand
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm font-normal">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching taxi stand...
                </span>
              ) : (
                nearestTaxiStand.name
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distance: <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                {loading ? '...' : nearestTaxiStand.distance}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Major Access Points (Horizontal Swipeable List / Carousel) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
            Major Access Points
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            Direct & Connecting Routes
          </span>
        </div>

        <div 
          ref={carouselRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {accessPoints.map((hub) => (
            <div 
              key={hub.id} 
              className="w-full bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left min-h-[140px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg" role="img" aria-label={hub.title}>
                    {hub.icon}
                  </span>
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase font-mono">
                    {hub.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate" title={hub.name}>
                  {hub.name}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 shrink-0">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Distance</span>
                  <span className={`text-xs font-bold font-mono ${hub.isAvailable ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                    {hub.distance}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Est. Time</span>
                  <span className={`text-xs font-bold font-mono ${hub.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {hub.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Action CTAs */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
        {/* Open Google Maps Button */}
        <a 
          href={googleMapsUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/15 active:scale-95 leading-none uppercase tracking-wider font-mono"
        >
          <MapPin className="w-4 h-4 text-white shrink-0" /> Open Google Maps
        </a>

        {/* Find Taxi Button */}
        <button 
          onClick={() => {
            handleNav('#/book-car');
            notify(
              'info',
              `🚖 Searching available cabs and verified mountain drivers connecting ${villageName}!`
            );
          }}
          className="w-full sm:flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs px-4 py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-sm active:scale-95 leading-none uppercase tracking-wider font-mono border border-slate-800 dark:border-slate-700"
        >
          <Car className="w-4 h-4 text-amber-400 shrink-0" /> Find Taxi
        </button>

        {/* Find Stay Button */}
        <button 
          onClick={() => {
            if (destination) {
              handleNav(`#/destination/${getItemSlug(destination)}`);
              notify(
                'info',
                `🏡 Showing verified local homestays located in and around ${villageName}!`
              );
            } else {
              handleNav('#/destinations');
            }
          }}
          className="w-full sm:flex-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-4 py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-2xs active:scale-95 leading-none uppercase tracking-wider font-mono border border-slate-200 dark:border-slate-700"
        >
          <Home className="w-4 h-4 text-indigo-500 shrink-0" /> Find Stay
        </button>
      </div>
    </section>
  );
}
