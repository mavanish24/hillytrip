import React, { useState, useEffect, useRef, TouchEvent, MouseEvent } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imagePool';

// 1. Persistent module-level memory cache for loaded and decoded images.
// This cache persists across tab switches, route changes, and different carousel sections
// on the entire HillyTrip website, ensuring immediate, local render speeds.
const loadedImageCache = new Set<string>();

/**
 * Highly polished, lightweight skeletal loading cards.
 * Prevents initial layout shifts and follows HillyTrip's premium slate style.
 */
function CarouselSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl space-y-4"
        >
          <div className="w-full h-44 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-3/4" />
            <div className="h-3 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface UniversalCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  visibleCards?: {
    mobile?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  autoPlayInterval?: number; // In milliseconds, default 7000
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  headerRight?: React.ReactNode;
  gapClass?: string; // Tailwind class e.g., "gap-4"
  className?: string;
  showDots?: boolean;
}

export function UniversalCarousel<T>({
  items,
  renderItem,
  visibleCards = { mobile: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  autoPlayInterval = 7000,
  title,
  subtitle,
  badge,
  headerRight,
  gapClass = "gap-4",
  className = "",
  showDots = true,
}: UniversalCarouselProps<T>) {
  const { mobile, sm, md, lg, xl } = visibleCards;
  // Resolve responsive counts
  const [resolvedVisibleCards, setResolvedVisibleCards] = useState(4);

  useEffect(() => {
    const updateCount = () => {
      const w = window.innerWidth;
      if (w >= 1280) {
        setResolvedVisibleCards(xl ?? 4);
      } else if (w >= 1024) {
        setResolvedVisibleCards(lg ?? 4);
      } else if (w >= 768) {
        setResolvedVisibleCards(md ?? 3);
      } else if (w >= 640) {
        setResolvedVisibleCards(sm ?? 2);
      } else {
        setResolvedVisibleCards(mobile ?? 1);
      }
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, [mobile, sm, md, lg, xl]);

  const isCarouselEnabled = (items || []).length > resolvedVisibleCards;

  // Construct items list for infinite looping with minimal required buffer (3 sets: prev, current, next)
  const extendedItems = items 
    ? (isCarouselEnabled ? [...items, ...items, ...items] : items) 
    : [];

  // Generate a stable identity key for items to avoid reference-based re-trigger loops
  const itemsIdentity = items ? items.map((item: any) => item?.id || item?.name || '').join(',') : '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartTime = useRef<number>(0);
  const isHorizontalLock = useRef<boolean | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const interactionTimerRef = useRef<any>(null);
  const mouseMoveHandlerRef = useRef<((e: any) => void) | null>(null);
  const mouseUpHandlerRef = useRef<((e: any) => void) | null>(null);

  // Detect pointer-hover support to avoid mobile touch entering stuck hovered state
  const [supportsHover, setSupportsHover] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      setSupportsHover(window.matchMedia('(hover: hover)').matches);
    }
  }, []);

  // Update initial starting index when items or carousel state changes
  useEffect(() => {
    if (isCarouselEnabled && items) {
      setCurrentIndex(items.length);
    } else {
      setCurrentIndex(0);
    }
  }, [itemsIdentity, isCarouselEnabled]);

  // Clean up timers and handlers on unmount
  useEffect(() => {
    return () => {
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      if (mouseMoveHandlerRef.current) window.removeEventListener('mousemove', mouseMoveHandlerRef.current);
      if (mouseUpHandlerRef.current) window.removeEventListener('mouseup', mouseUpHandlerRef.current);
    };
  }, []);

  // Transition coordinator to safeguard slide movements immediately
  const requestSlideTo = (targetIndex: number) => {
    if (!isCarouselEnabled || !isTransitioning) return;
    setCurrentIndex(targetIndex);
  };

  // Interaction pausing helper
  const startInteractionResumeTimer = () => {
    setIsInteracting(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 4000); // Resume auto-play after 4s of inactivity
  };

  const stopInteractionTimerAndPause = () => {
    setIsInteracting(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
  };

  // Auto-play control logic (pauses on hover or interaction)
  useEffect(() => {
    if (isHovered || isInteracting || autoPlayInterval <= 0 || !isCarouselEnabled) return;

    const timer = setInterval(() => {
      requestSlideTo(currentIndex + 1);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, isHovered, isInteracting, autoPlayInterval, isCarouselEnabled]);

  const handleNext = () => {
    requestSlideTo(currentIndex + 1);
  };

  const handlePrev = () => {
    requestSlideTo(currentIndex - 1);
  };

  const handleNavigationClick = (action: () => void) => {
    stopInteractionTimerAndPause();
    action();
    startInteractionResumeTimer();
  };

  const handleTransitionEnd = () => {
    if (!isCarouselEnabled) return;
    // Smooth infinite loop wrap around for 3x buffer
    const len = (items || []).length;
    if (len === 0) return;
    if (currentIndex >= len * 2) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex - len);
      if (trackRef.current) {
        const _ = trackRef.current.offsetHeight; // Force reflow
      }
    } else if (currentIndex < len) {
      setIsTransitioning(false);
      setCurrentIndex(currentIndex + len);
      if (trackRef.current) {
        const _ = trackRef.current.offsetHeight; // Force reflow
      }
    }
  };

  // Re-enable transitions after temporary disable (for wrap-around reset)
  useEffect(() => {
    if (!isTransitioning) {
      if (trackRef.current) {
        const _ = trackRef.current.offsetHeight; // Force reflow
      }
      const t = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isTransitioning]);

  // Touch Swipe Handlers with Smooth Direction Locking and Velocity Gesture Detection
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isCarouselEnabled || e.touches.length !== 1) return;
    stopInteractionTimerAndPause();
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    dragStartTime.current = Date.now();
    isHorizontalLock.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartX.current === null || dragStartY.current === null) return;
    const diffX = e.touches[0].clientX - dragStartX.current;
    const diffY = e.touches[0].clientY - dragStartY.current;

    if (isHorizontalLock.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 6) {
        isHorizontalLock.current = true;
      } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 6) {
        isHorizontalLock.current = false;
      }
    }

    if (isHorizontalLock.current === true) {
      setDragOffset(diffX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const changedTouch = e.changedTouches[0];
    const finalDiffX = changedTouch ? changedTouch.clientX - dragStartX.current : dragOffset;
    const duration = Date.now() - dragStartTime.current;
    const velocity = Math.abs(finalDiffX) / Math.max(duration, 1);

    if (isHorizontalLock.current !== false) {
      const minThreshold = 40;
      const isFastFlick = velocity > 0.25 && Math.abs(finalDiffX) > 15;
      if (finalDiffX < -minThreshold || (isFastFlick && finalDiffX < 0)) {
        requestSlideTo(currentIndex + 1);
      } else if (finalDiffX > minThreshold || (isFastFlick && finalDiffX > 0)) {
        requestSlideTo(currentIndex - 1);
      }
    }

    dragStartX.current = null;
    dragStartY.current = null;
    isHorizontalLock.current = null;
    setDragOffset(0);
    startInteractionResumeTimer();
  };

  // Mouse Swipe Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCarouselEnabled || e.button !== 0) return;
    stopInteractionTimerAndPause();
    dragStartX.current = e.clientX;
    e.preventDefault();

    const onMouseMoveGlobal = (moveEvent: any) => {
      if (dragStartX.current === null) return;
      const diff = moveEvent.clientX - dragStartX.current;
      setDragOffset(diff);
    };

    const onMouseUpGlobal = (upEvent: any) => {
      if (dragStartX.current === null) return;
      const finalDiff = upEvent.clientX - dragStartX.current;
      const threshold = 50;
      if (finalDiff < -threshold) {
        requestSlideTo(currentIndex + 1);
      } else if (finalDiff > threshold) {
        requestSlideTo(currentIndex - 1);
      }
      dragStartX.current = null;
      setDragOffset(0);
      startInteractionResumeTimer();

      window.removeEventListener('mousemove', onMouseMoveGlobal);
      window.removeEventListener('mouseup', onMouseUpGlobal);
      mouseMoveHandlerRef.current = null;
      mouseUpHandlerRef.current = null;
    };

    mouseMoveHandlerRef.current = onMouseMoveGlobal;
    mouseUpHandlerRef.current = onMouseUpGlobal;

    window.addEventListener('mousemove', onMouseMoveGlobal);
    window.addEventListener('mouseup', onMouseUpGlobal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isCarouselEnabled) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleNavigationClick(handlePrev);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNavigationClick(handleNext);
    }
  };

  if (!items || items.length === 0) return null;

  const activeDotIndex = isCarouselEnabled ? currentIndex % items.length : 0;

  return (
    <div 
      className={`relative w-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-3xl ${className}`}
      tabIndex={isCarouselEnabled ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => { if (supportsHover) setIsHovered(true); }}
      onMouseLeave={() => {
        if (supportsHover) setIsHovered(false);
        // Clean up any incomplete drag on mouse leave
        if (dragStartX.current !== null) {
          dragStartX.current = null;
          setDragOffset(0);
          startInteractionResumeTimer();
          if (mouseMoveHandlerRef.current) window.removeEventListener('mousemove', mouseMoveHandlerRef.current);
          if (mouseUpHandlerRef.current) window.removeEventListener('mouseup', mouseUpHandlerRef.current);
          mouseMoveHandlerRef.current = null;
          mouseUpHandlerRef.current = null;
        }
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={typeof title === 'string' ? title : "Travel Carousel"}
    >
      {/* Header and Controls */}
      {(title || subtitle || badge || headerRight) && (
        <div className="flex justify-between items-end mb-6">
          <div className="text-left">
            {badge && (
              <div className="mb-2">
                {badge}
              </div>
            )}
            {title && (
              <h3 className="font-display font-black text-2xl text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 font-semibold">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {headerRight}

            {/* Desktop Navigation Arrows */}
            {isCarouselEnabled && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleNavigationClick(handlePrev)}
                  className="p-3 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-emerald-600 dark:hover:border-emerald-600 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleNavigationClick(handleNext)}
                  className="p-3 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-emerald-600 dark:hover:border-emerald-600 shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sliding Track Outer Container */}
      <div 
        className="relative w-full overflow-hidden rounded-3xl touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
          <div 
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out"
            style={{
              width: `${(extendedItems.length * 100) / resolvedVisibleCards}%`,
              transform: `translateX(calc(-${(currentIndex * 100) / extendedItems.length}% + ${dragOffset}px))`,
              transition: (isTransitioning && dragStartX.current === null) 
                ? 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)' 
                : 'none',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedItems.map((item, idx) => {
              const cardWidthPercent = 100 / extendedItems.length;
              return (
                <div
                  key={`${idx}`}
                  className="shrink-0 px-2 sm:px-3"
                  style={{ width: `${cardWidthPercent}%` }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${(idx % items.length) + 1} of ${items.length}`}
                >
                  {renderItem(item, idx % items.length)}
                </div>
              );
            })}
          </div>
        </div>

      {/* Pagination Dot Indicators */}
      {showDots !== false && items.length > 1 && isCarouselEnabled && (
        <div className="flex justify-center items-center gap-2 mt-5">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                handleNavigationClick(() => requestSlideTo(items.length + index));
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeDotIndex === index 
                  ? 'w-5 bg-emerald-500 dark:bg-emerald-400' 
                  : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
