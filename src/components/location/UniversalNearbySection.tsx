import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Home, 
  Compass, 
  Car, 
  ChevronRight, 
  ChevronLeft,
  SlidersHorizontal,
  Sparkles,
  Mountain,
  AlertCircle
} from 'lucide-react';
import { useNearbyEntities } from '../../hooks/useNearbyEntities';
import { getSmartDirectUnsplashUrl } from '../../utils/imagePool';
import { isValidGeoCoordinate, resolveCanonicalCoordinates } from '../../services/geoProximityService';

export interface UniversalNearbySectionProps {
  latitude?: number | null;
  longitude?: number | null;
  entityType: 'village' | 'attraction' | 'homestay' | 'taxi_stand' | 'hub' | 'destination';
  entityId: string;
  entityName?: string;
  fallbackItems?: {
    villages?: any[];
    attractions?: any[];
    homestays?: any[];
    taxiStands?: any[];
  };
  onSelectAttraction?: (attraction: any) => void;
  onSelectHomestay?: (homestay: any) => void;
  onSelectVillage?: (village: any) => void;
  onSelectTaxiStand?: (taxiStand: any) => void;
  onBookTaxi?: (fromHub: string, toDestination?: string) => void;
  className?: string;
}

const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

interface CarouselContainerProps {
  id: string;
  title: string;
  count: number;
  radiusKm: number;
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
  children: React.ReactNode;
  onExpandRadius: () => void;
  emptyMessage: string;
}

const CarouselContainer: React.FC<CarouselContainerProps> = ({
  id,
  title,
  count,
  radiusKm,
  icon,
  badgeBg,
  badgeText,
  children,
  onExpandRadius,
  emptyMessage,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      updateScrollButtons();
      el.addEventListener('scroll', updateScrollButtons, { passive: true });
      window.addEventListener('resize', updateScrollButtons);
      return () => {
        el.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [updateScrollButtons, count]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      const scrollOffset = el.clientWidth * 0.75;
      el.scrollBy({
        left: direction === 'left' ? -scrollOffset : scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group/carousel">
      {/* Category Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {icon}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badgeBg} ${badgeText}`}>
            {count} within {radiusKm} km
          </span>
        </div>

        {/* Carousel Arrow Controls */}
        {count > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id={`carousel-prev-${id}`}
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
              className={`p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all ${
                canScrollLeft
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm cursor-pointer'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800/60 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id={`carousel-next-${id}`}
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
              className={`p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all ${
                canScrollRight
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm cursor-pointer'
                  : 'bg-slate-50 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800/60 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Empty State or Horizontal Carousel Scroll Viewport */}
      {count === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {emptyMessage}
          </p>
          <button
            onClick={onExpandRadius}
            className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline inline-flex items-center gap-1"
          >
            Expand radius to {radiusKm < 25 ? '25 km' : '50 km'} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Subtle horizontal track */}
          <div
            id={`carousel-track-${id}`}
            ref={scrollRef}
            className="flex items-stretch gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-0.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent [scrollbar-width:thin]"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const UniversalNearbySection: React.FC<UniversalNearbySectionProps> = ({
  latitude,
  longitude,
  entityType,
  entityId,
  entityName = 'this location',
  fallbackItems,
  onSelectAttraction,
  onSelectHomestay,
  onSelectVillage,
  onSelectTaxiStand,
  onBookTaxi,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'villages' | 'attractions' | 'homestays' | 'taxi_stands'>('all');
  
  const resolvedCoords = React.useMemo(() => {
    if (isValidGeoCoordinate(latitude, longitude) && latitude != null && longitude != null) {
      return { lat: Number(latitude), lng: Number(longitude) };
    }
    return resolveCanonicalCoordinates(entityId, entityName);
  }, [latitude, longitude, entityId, entityName]);

  const effectiveLat = isValidGeoCoordinate(latitude, longitude) && latitude != null ? Number(latitude) : (resolvedCoords?.lat ?? null);
  const effectiveLng = isValidGeoCoordinate(latitude, longitude) && longitude != null ? Number(longitude) : (resolvedCoords?.lng ?? null);

  const {
    villages,
    attractions,
    homestays,
    taxiStands,
    counts,
    isLoading,
    radiusKm,
    setRadiusKm,
    hasValidCoordinates
  } = useNearbyEntities({
    latitude: effectiveLat,
    longitude: effectiveLng,
    entityType,
    entityId,
    initialRadiusKm: 15,
    limit: 20,
    fallbackItems
  });

  const coordLabel = (hasValidCoordinates || resolvedCoords) && effectiveLat != null && effectiveLng != null
    ? `${Number(effectiveLat).toFixed(4)}°N, ${Number(effectiveLng).toFixed(4)}°E`
    : null;

  return (
    <section id="universal-nearby-section" className={`mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-all ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Nearby Mountain Network
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dynamically calculated geographic proximity around {entityName}
            {coordLabel && (
              <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
                <MapPin className="w-3 h-3 mr-1 text-emerald-500" />
                {coordLabel}
              </span>
            )}
          </p>
        </div>

        {/* Radius Selector */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start md:self-auto">
          <div className="flex items-center gap-1 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Radius:</span>
          </div>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              id={`radius-pill-${r}km`}
              onClick={() => setRadiusKm(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                radiusKm === r
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none border-b border-slate-100 dark:border-slate-800">
        <button
          id="nearby-tab-all"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>All Nearby</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {counts.total}
          </span>
        </button>

        <button
          id="nearby-tab-villages"
          onClick={() => setActiveTab('villages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'villages'
              ? 'bg-emerald-700 dark:bg-emerald-700 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          <Mountain className="w-4 h-4" />
          <span>Villages & Settlements</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'villages' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {counts.villages}
          </span>
        </button>

        <button
          id="nearby-tab-attractions"
          onClick={() => setActiveTab('attractions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'attractions'
              ? 'bg-amber-600 dark:bg-amber-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Attractions & Viewpoints</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'attractions' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {counts.attractions}
          </span>
        </button>

        <button
          id="nearby-tab-homestays"
          onClick={() => setActiveTab('homestays')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'homestays'
              ? 'bg-teal-600 dark:bg-teal-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Homestays & Stays</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'homestays' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {counts.homestays}
          </span>
        </button>

        <button
          id="nearby-tab-taxi-stands"
          onClick={() => setActiveTab('taxi_stands')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'taxi_stands'
              ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Taxi Stands & Hubs</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'taxi_stands' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {counts.taxiStands}
          </span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-8 flex gap-4 overflow-hidden animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="w-[280px] sm:w-[310px] shrink-0 h-64 bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 flex flex-col justify-between">
              <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mt-3"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-1"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl mt-4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      {!isLoading && (
        <div className="pt-6 space-y-9">
          {/* Section 1: Nearest Villages Carousel */}
          {(activeTab === 'all' || activeTab === 'villages') && (
            <CarouselContainer
              id="villages"
              title="Nearest Villages & Base Settlements"
              count={villages.length}
              radiusKm={radiusKm}
              icon={<Mountain className="w-4 h-4 text-emerald-600" />}
              badgeBg="bg-emerald-50 dark:bg-emerald-950/40"
              badgeText="text-emerald-700 dark:text-emerald-300"
              emptyMessage={`No registered villages found within ${radiusKm} km.`}
              onExpandRadius={() => setRadiusKm(radiusKm < 25 ? 25 : 50)}
            >
              {villages.map(({ entity: v, distanceFormatted }) => {
                const vName = v.village_name || v.name || 'Unnamed Village';
                const vCode = v.village_code || v.id;
                const district = v.district_name || v.district || '';
                const elevation = v.elevation ? `${v.elevation}m` : null;
                const vImg = v.image_url || v.image || getSmartDirectUnsplashUrl(vName, 'Himalayan mountain village landscape', 'village');

                return (
                  <div
                    key={`v-${vCode}`}
                    id={`nearby-village-card-${vCode}`}
                    onClick={() => onSelectVillage && onSelectVillage(v)}
                    className="group flex flex-col w-[280px] sm:w-[310px] md:w-[320px] shrink-0 snap-start bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-emerald-500/40 hover:-translate-y-1 cursor-pointer select-none"
                  >
                    {/* Visual Cover Banner */}
                    <div className="relative h-32 w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <img
                        src={vImg}
                        alt={vName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600/90 backdrop-blur-md text-white shadow-sm">
                          📍 {distanceFormatted}
                        </span>
                      </div>
                      {elevation && (
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-200">
                            ⛰️ {elevation}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-base line-clamp-1">
                          {vName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {district ? `${district}, Himalayas` : 'Mountain Valley Base'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span>Explore Village</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CarouselContainer>
          )}

          {/* Section 2: Nearest Attractions Carousel */}
          {(activeTab === 'all' || activeTab === 'attractions') && (
            <CarouselContainer
              id="attractions"
              title="Nearest Attractions & Viewpoints"
              count={attractions.length}
              radiusKm={radiusKm}
              icon={<Compass className="w-4 h-4 text-amber-600" />}
              badgeBg="bg-amber-50 dark:bg-amber-950/40"
              badgeText="text-amber-700 dark:text-amber-300"
              emptyMessage={`No other attractions found within ${radiusKm} km.`}
              onExpandRadius={() => setRadiusKm(radiusKm < 25 ? 25 : 50)}
            >
              {attractions.map(({ entity: a, distanceFormatted }) => {
                const aName = a.attraction_name || a.name || 'Attraction';
                const aId = a.attraction_id || a.id;
                const aCategory = a.category || 'Sightseeing';
                const aImg = a.image_url || a.image || getSmartDirectUnsplashUrl(aName, 'Scenic Himalayan viewpoint', aCategory);

                return (
                  <div
                    key={`a-${aId}`}
                    id={`nearby-attraction-card-${aId}`}
                    onClick={() => onSelectAttraction && onSelectAttraction(a)}
                    className="group flex flex-col w-[280px] sm:w-[310px] md:w-[320px] shrink-0 snap-start bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-amber-500/40 hover:-translate-y-1 cursor-pointer select-none"
                  >
                    <div className="relative h-32 w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <img
                        src={aImg}
                        alt={aName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600/90 backdrop-blur-md text-white shadow-sm">
                          📍 {distanceFormatted}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white">
                          {aCategory}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-base line-clamp-1">
                          {aName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {a.district || a.state || 'Scenic POI'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400">
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CarouselContainer>
          )}

          {/* Section 3: Nearest Homestays Carousel */}
          {(activeTab === 'all' || activeTab === 'homestays') && (
            <CarouselContainer
              id="homestays"
              title="Nearest Eco-Homestays & Stays"
              count={homestays.length}
              radiusKm={radiusKm}
              icon={<Home className="w-4 h-4 text-teal-600" />}
              badgeBg="bg-teal-50 dark:bg-teal-950/40"
              badgeText="text-teal-700 dark:text-teal-300"
              emptyMessage={`No verified homestays found within ${radiusKm} km.`}
              onExpandRadius={() => setRadiusKm(radiusKm < 25 ? 25 : 50)}
            >
              {homestays.map(({ entity: h, distanceFormatted }) => {
                const hName = h.homestay_name || h.name || 'Mountain Homestay';
                const hId = h.homestay_id || h.id;
                const hPrice = h.priceMin || 1500;
                const hImg = (Array.isArray(h.images) && h.images[0]) || h.image_url || h.image || getSmartDirectUnsplashUrl(hName, 'Mountain view homestay cottage', 'cottage');

                return (
                  <div
                    key={`h-${hId}`}
                    id={`nearby-homestay-card-${hId}`}
                    onClick={() => onSelectHomestay && onSelectHomestay(h)}
                    className="group flex flex-col w-[280px] sm:w-[310px] md:w-[320px] shrink-0 snap-start bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-teal-500/40 hover:-translate-y-1 cursor-pointer select-none"
                  >
                    <div className="relative h-32 w-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <img
                        src={hImg}
                        alt={hName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-600/90 backdrop-blur-md text-white shadow-sm">
                          📍 {distanceFormatted}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-teal-700 text-white shadow-sm">
                          ₹{hPrice}/night
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors text-base line-clamp-1">
                          {hName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {h.village_name || h.district || 'Cozy Mountain Stay'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs font-medium text-teal-600 dark:text-teal-400">
                        <span>Check Availability</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CarouselContainer>
          )}

          {/* Section 4: Nearest Taxi Stands Carousel */}
          {(activeTab === 'all' || activeTab === 'taxi_stands') && (
            <CarouselContainer
              id="taxi_stands"
              title="Nearest Taxi Stands & Transit Hubs"
              count={taxiStands.length}
              radiusKm={radiusKm}
              icon={<Car className="w-4 h-4 text-blue-600" />}
              badgeBg="bg-blue-50 dark:bg-blue-950/40"
              badgeText="text-blue-700 dark:text-blue-300"
              emptyMessage={`No taxi stands found within ${radiusKm} km.`}
              onExpandRadius={() => setRadiusKm(radiusKm < 25 ? 25 : 50)}
            >
              {taxiStands.map(({ entity: t, distanceFormatted }) => {
                const tName = t.taxi_stand_name || t.name || 'Taxi Stand';
                const tId = t.taxi_id || t.id;
                const district = t.district || '';

                return (
                  <div
                    key={`t-${tId}`}
                    id={`nearby-taxi-card-${tId}`}
                    onClick={() => {
                      if (onSelectTaxiStand) {
                        onSelectTaxiStand(t);
                      } else if (onBookTaxi) {
                        onBookTaxi(tName, entityName);
                      }
                    }}
                    className="group flex flex-col justify-between w-[280px] sm:w-[310px] md:w-[320px] shrink-0 snap-start bg-slate-50/80 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:border-blue-500/40 hover:-translate-y-1 cursor-pointer select-none"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                          🚖 {distanceFormatted}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                          Transit Hub
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base line-clamp-1">
                        {tName}
                      </h4>
                      {district && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {district} Route Stand
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                      <span>Book Taxi / Find Routes</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </CarouselContainer>
          )}
        </div>
      )}
    </section>
  );
};

