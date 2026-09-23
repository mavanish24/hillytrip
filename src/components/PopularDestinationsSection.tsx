import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Destination, Attraction, Homestay, Driver, isHomestayPublic } from '../types';
import { getItemSlug } from '../utils/slug';
import { ProgressiveImage } from './ProgressiveImage';
import { resolveVillageImage } from '../utils/imagePool';

export interface PopularDestinationsSectionProps {
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  drivers?: Driver[];
  navigate?: (path: string) => void;
  className?: string;
}

// Helper functions for counting relationships
function countVerifiedHomestays(dest: Destination, homestays: Homestay[]): number {
  if (!homestays || !Array.isArray(homestays)) return 0;

  const destNameLower = (dest.name || '').toLowerCase().trim();
  const destIdLower = (dest.id || '').toLowerCase().trim();
  const destSlugLower = (dest.slug || getItemSlug(dest) || '').toLowerCase().trim();

  return homestays.filter(isHomestayPublic).filter((h) => {
    const isRejected = h.status === 'Rejected' || h.status === 'inactive' || h.status === 'temporarilyClosed';
    if (isRejected) return false;

    const hDestId = (h.destinationId || '').toLowerCase().trim();
    const hAddr = (h.address || '').toLowerCase().trim();
    const hLoc = ((h as any).location || '').toLowerCase().trim();
    const hName = (h.name || '').toLowerCase().trim();
    const hDestName = ((h as any).destinationName || '').toLowerCase().trim();

    if (
      (hDestId && (hDestId === destIdLower || hDestId === destSlugLower || hDestId === destNameLower || hDestId === `dest-${destNameLower}`)) ||
      (hDestName && hDestName === destNameLower)
    ) {
      return true;
    }

    if (hAddr || hLoc || hName) {
      if (destNameLower === 'kalimpong') {
        if (hAddr.includes('lava') || hAddr.includes('pedong') || hAddr.includes('rishop') || hAddr.includes('lolegaon') || hAddr.includes('sillery')) {
          return false;
        }
      } else if (destNameLower === 'darjeeling') {
        if (hAddr.includes('sittong') || hAddr.includes('mirik') || hAddr.includes('kurseong') || hAddr.includes('takdah') || hAddr.includes('tinchuley')) {
          return false;
        }
      }

      if (hAddr.includes(destNameLower) || hLoc.includes(destNameLower) || hName.includes(destNameLower)) {
        return true;
      }
    }

    return false;
  }).length;
}

function countPublishedAttractions(dest: Destination, attractions: Attraction[]): number {
  if (!attractions || !Array.isArray(attractions)) return 0;

  const destNameLower = (dest.name || '').toLowerCase().trim();
  const destIdLower = (dest.id || '').toLowerCase().trim();
  const destSlugLower = (dest.slug || getItemSlug(dest) || '').toLowerCase().trim();

  return attractions.filter((a) => {
    const isRejected = (a as any).status === 'Rejected' || (a as any).status === 'Draft' || (a as any).status === 'inactive';
    if (isRejected) return false;

    const aDestId = (a.destinationId || '').toLowerCase().trim();
    const aLoc = ((a as any).location || '').toLowerCase().trim();
    const aName = (a.name || '').toLowerCase().trim();
    const aDestName = ((a as any).destinationName || '').toLowerCase().trim();

    if (
      (aDestId && (aDestId === destIdLower || aDestId === destSlugLower || aDestId === destNameLower || aDestId === `dest-${destNameLower}`)) ||
      (aDestName && aDestName === destNameLower)
    ) {
      return true;
    }

    if (aLoc || aName) {
      if (destNameLower === 'kalimpong') {
        if (aLoc.includes('lava') || aLoc.includes('pedong') || aLoc.includes('rishop') || aLoc.includes('lolegaon')) {
          return false;
        }
      } else if (destNameLower === 'darjeeling') {
        if (aLoc.includes('sittong') || aLoc.includes('mirik') || aLoc.includes('kurseong') || aLoc.includes('takdah') || aLoc.includes('tinchuley')) {
          return false;
        }
      }

      if (aLoc.includes(destNameLower) || aName.includes(destNameLower)) {
        return true;
      }
    }

    return false;
  }).length;
}

export const PopularDestinationsSection: React.FC<PopularDestinationsSectionProps> = ({
  destinations = [],
  attractions = [],
  homestays = [],
  navigate = () => {},
  className = ''
}) => {
  const displayItems = useMemo(() => {
    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return [];
    }

    return destinations.slice(0, 8).map((dest) => {
      const name = dest.name;
      const slug = getItemSlug(dest) || name.toLowerCase();

      const attrCount = countPublishedAttractions(dest, attractions);
      const stayCount = countVerifiedHomestays(dest, homestays);

      const stayLabel = stayCount === 0
        ? 'No Homestays'
        : stayCount === 1
        ? '1 Homestay'
        : `${stayCount} Homestays`;

      const attrLabel = attrCount === 0
        ? 'No Attractions'
        : attrCount === 1
        ? '1 Attraction'
        : `${attrCount} Attractions`;

      const coverImage = resolveVillageImage(dest);

      let district = dest.district || '';
      if (!district) {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('darjeeling') || nameLower.includes('sittong') || nameLower.includes('mirik') || nameLower.includes('kurseong') || nameLower.includes('takdah') || nameLower.includes('tinchuley')) {
          district = 'Darjeeling';
        } else if (nameLower.includes('kalimpong') || nameLower.includes('lava') || nameLower.includes('pedong') || nameLower.includes('lolegaon') || nameLower.includes('rishop')) {
          district = 'Kalimpong';
        } else if (nameLower.includes('gangtok') || nameLower.includes('zuluk')) {
          district = 'East Sikkim';
        } else if (nameLower.includes('pelling')) {
          district = 'West Sikkim';
        } else if (nameLower.includes('ravangla') || nameLower.includes('namchi')) {
          district = 'South Sikkim';
        } else if (dest.state) {
          district = dest.state;
        } else {
          district = 'Himalayan';
        }
      }
      if (!district.toLowerCase().includes('district')) {
        district = `${district.trim()} District`;
      }

      return {
        ...dest,
        districtFormatted: district,
        slug,
        coverImage,
        attrCount,
        stayCount,
        stayLabel,
        attrLabel
      };
    });
  }, [destinations, attractions, homestays]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const mouseStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
  }, [displayItems.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  }, [displayItems.length]);

  // Auto-rotate every 6s
  useEffect(() => {
    if (isPaused || displayItems.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, displayItems.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 40) {
      nextSlide();
    } else if (diffX < -40) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const diffX = mouseStartX.current - e.clientX;
    if (diffX > 50) {
      nextSlide();
    } else if (diffX < -50) {
      prevSlide();
    }
    mouseStartX.current = null;
  };

  const handleExplore = (slug: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`#/destination/${slug}`);
  };

  if (displayItems.length === 0) return null;

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 my-8 sm:my-14 select-none outline-none ${className}`}
      aria-label="Popular Destinations Section"
    >
      {/* SECTION BACKGROUND DECORATION: Soft light pink/white aesthetic */}
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-rose-50/60 via-pink-50/25 to-transparent dark:from-slate-900/40 dark:via-slate-900/20 dark:to-transparent border border-rose-100/60 dark:border-slate-800/40 pointer-events-none" />

      {/* TOP HEADER BAR */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10 pt-2 px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white">
            Popular Destinations
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            Explore the most breathtaking Himalayan villages & mountain gems.
          </p>
        </div>

        {/* RIGHT CONTROLS: Arrow Left, Arrow Right & View All */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-center active:scale-95"
            aria-label="Previous destination"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-center active:scale-95"
            aria-label="Next destination"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => navigate('#/destinations')}
            className="ml-1 px-4 py-2.5 rounded-full bg-rose-50 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 border border-rose-200 dark:border-slate-700 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-md active:scale-95"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </button>
        </div>
      </div>

      {/* ========================================================== */}
      {/* DESKTOP DEPTH CAROUSEL (Center dominant card + side cards) */}
      {/* ========================================================== */}
      <div className="hidden md:flex relative items-center justify-center h-[480px] lg:h-[510px] w-full overflow-hidden perspective-[1200px] z-10 py-2">
        {[-2, -1, 0, 1, 2].map((offset) => {
          const index = (currentIndex + offset + displayItems.length) % displayItems.length;
          const item = displayItems[index];
          const isCenter = offset === 0;

          // Depth Carousel Layout Calculations
          let xOffset = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = 10;

          if (offset === 0) {
            xOffset = 0;
            scale = 1.0;
            opacity = 1.0;
            zIndex = 30;
          } else if (Math.abs(offset) === 1) {
            xOffset = offset * 310;
            scale = 0.88;
            opacity = 0.88;
            zIndex = 20;
          } else if (Math.abs(offset) === 2) {
            xOffset = offset * 240;
            scale = 0.76;
            opacity = 0.72;
            zIndex = 10;
          }

          return (
            <motion.div
              key={item.id + '-' + offset}
              initial={false}
              animate={{
                x: xOffset,
                scale: scale,
                opacity: opacity,
                zIndex: zIndex
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 1, 0.35, 1]
              }}
              onClick={() => {
                if (isCenter) {
                  handleExplore(item.slug);
                } else {
                  setCurrentIndex(index);
                }
              }}
              style={{ position: 'absolute' }}
              className={`w-[440px] lg:w-[480px] h-[460px] lg:h-[490px] rounded-[28px] overflow-hidden cursor-pointer group transition-shadow duration-300 ${
                isCenter
                  ? 'shadow-[0_20px_50px_rgba(225,29,72,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-2 ring-rose-400/40'
                  : 'shadow-xl hover:opacity-100 ring-1 ring-slate-200/60 dark:ring-slate-800'
              }`}
            >
              {/* CARD IMAGE & OVERLAY */}
              <div className="w-full h-full relative rounded-[28px] overflow-hidden bg-slate-900">
                <ProgressiveImage
                  src={item.coverImage}
                  alt={item.name}
                  itemName={item.name}
                  category="mountain"
                  targetWidth={600}
                  isPriority={isCenter}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* GRADIENT OVERLAY FOR TEXT CONTRAST */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-10" />

                {/* BOTTOM CONTENT AREA */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 z-20 flex flex-col justify-end gap-3 text-white">
                  
                  {/* TITLE + DISTRICT + EXPLORE BUTTON */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl lg:text-3xl font-display font-black tracking-tight text-white leading-tight drop-shadow-md truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm font-semibold text-rose-200/90 mt-0.5 truncate tracking-wide">
                        {item.districtFormatted}
                      </p>
                    </div>

                    {/* EXPLORE BUTTON */}
                    <button
                      type="button"
                      onClick={(e) => handleExplore(item.slug, e)}
                      className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-rose-900/40 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
                    </button>
                  </div>

                  {/* HOMESTAY & ATTRACTION COUNTS */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
                      <span className="text-sm">🏠</span>
                      <span>{item.stayLabel}</span>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm">
                      <span className="text-sm">📍</span>
                      <span>{item.attrLabel}</span>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* MOBILE CAROUSEL (Focused primary card with side peek)      */}
      {/* ========================================================== */}
      <div className="md:hidden relative w-full flex flex-col items-center justify-center min-h-[440px] py-2 z-10 overflow-hidden">
        <div className="relative w-full flex items-center justify-center h-[420px]">
          {[-1, 0, 1].map((offset) => {
            const index = (currentIndex + offset + displayItems.length) % displayItems.length;
            const item = displayItems[index];
            const isCenter = offset === 0;

            let xOffset = offset * 280;
            let scale = isCenter ? 1.0 : 0.85;
            let opacity = isCenter ? 1.0 : 0.6;
            let zIndex = isCenter ? 20 : 10;

            return (
              <motion.div
                key={item.id + '-mobile-' + offset}
                animate={{
                  x: xOffset,
                  scale: scale,
                  opacity: opacity,
                  zIndex: zIndex
                }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                onClick={() => {
                  if (isCenter) {
                    handleExplore(item.slug);
                  } else {
                    setCurrentIndex(index);
                  }
                }}
                style={{ position: 'absolute' }}
                className={`w-[84vw] max-w-[340px] h-[400px] rounded-[24px] overflow-hidden cursor-pointer shadow-2xl ${
                  isCenter ? 'ring-2 ring-rose-400/50' : 'ring-1 ring-slate-200 dark:ring-slate-800'
                }`}
              >
                <div className="w-full h-full relative rounded-[24px] overflow-hidden bg-slate-900">
                  <ProgressiveImage
                    src={item.coverImage}
                    alt={item.name}
                    itemName={item.name}
                    category="mountain"
                    targetWidth={400}
                    isPriority={isCenter}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-10" />

                  {/* BOTTOM OVERLAY */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end gap-2.5 text-white">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-display font-black tracking-tight text-white leading-tight truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs font-semibold text-rose-200 mt-0.5 truncate">
                          {item.districtFormatted}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleExplore(item.slug, e)}
                        className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 shrink-0">
                        <span>🏠</span>
                        <span>{item.stayLabel}</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1 shrink-0">
                        <span>📍</span>
                        <span>{item.attrLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* PAGINATION DOTS */}
      <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6">
        {displayItems.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 transition-all cursor-pointer rounded-full ${
              idx === currentIndex
                ? 'w-7 bg-rose-600 dark:bg-rose-500'
                : 'w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
            }`}
            aria-label={`Go to destination ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularDestinationsSection;
