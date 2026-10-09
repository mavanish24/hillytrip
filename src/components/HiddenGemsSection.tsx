import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Destination } from '../types';
import { getItemSlug } from '../utils/slug';
import { ProgressiveImage } from './ProgressiveImage';

export interface HiddenGemsSectionProps {
  destinations: Destination[];
  likes?: any[];
  comments?: any[];
  toggleLike?: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  navigate: (path: string) => void;
  setDestTypeFilter?: (val: string) => void;
  setDestSearchQuery?: (val: string) => void;
}

export const HiddenGemsSection: React.FC<HiddenGemsSectionProps> = ({
  destinations,
  likes = [],
  comments = [],
  toggleLike,
  navigate,
  setDestTypeFilter,
  setDestSearchQuery
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse Drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const dragDistance = useRef(0);

  // Filter hidden gems
  const gems = React.useMemo(() => {
    const filtered = destinations.filter(d => 
      d.isHiddenGem === true ||
      (d.tourismType || '').toLowerCase().includes('offbeat') ||
      (d.tourismType || '').toLowerCase().includes('village') ||
      (d.tourismType || '').toLowerCase().includes('hidden') ||
      d.isHiddenGem !== false
    );
    return filtered.length >= 4 ? filtered.slice(0, 10) : destinations.slice(0, 10);
  }, [destinations]);

  // Check scroll bounds
  const updateScrollBounds = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollBounds();
    el.addEventListener('scroll', updateScrollBounds, { passive: true });
    window.addEventListener('resize', updateScrollBounds);

    return () => {
      el.removeEventListener('scroll', updateScrollBounds);
      window.removeEventListener('resize', updateScrollBounds);
    };
  }, [gems]);

  // Auto-scroll every 5 seconds (5000ms) with pause on hover
  useEffect(() => {
    if (isPaused || gems.length === 0) return;

    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const cardWidth = 280; // card width + gap
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 20) {
        // Infinite wrap back to start
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, gems]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const cardWidth = containerRef.current.clientWidth * 0.75;
    const targetScroll = containerRef.current.scrollLeft + (direction === 'left' ? -cardWidth : cardWidth);
    
    // Infinite looping check when clicking arrows at ends
    const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
    if (direction === 'right' && containerRef.current.scrollLeft >= maxScroll - 20) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === 'left' && containerRef.current.scrollLeft <= 10) {
      containerRef.current.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      containerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    dragDistance.current = 0;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftStart.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    dragDistance.current = Math.abs(walk);
    containerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleCardClick = (e: React.MouseEvent, gem: Destination) => {
    // Ignore click if user was dragging
    if (dragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`#/destination/${getItemSlug(gem)}`);
  };

  return (
    <div 
      className="relative z-10 max-w-7xl mx-auto px-4 py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        isDragging.current = false;
      }}
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <span className="text-xs font-extrabold text-rose-500 dark:text-rose-400 uppercase tracking-widest block">
            Secret Escapes & Uncharted Sights
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Hidden Gems
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Browse our curated gallery of pristine, lesser-known Himalayan oases.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <button 
            onClick={() => {
              if (setDestTypeFilter) setDestTypeFilter('All');
              if (setDestSearchQuery) setDestSearchQuery('');
              navigate('#/destinations');
            }}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 group cursor-pointer mr-2"
          >
            View All Hidden Gems <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full bg-slate-200/80 dark:bg-slate-900/90 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              aria-label="Previous hidden gem"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full bg-slate-200/80 dark:bg-slate-900/90 hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
              aria-label="Next hidden gem"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL CONTAINER */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex items-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-6 pt-2 px-1 select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {gems.map((gem) => {
          // Count likes & comments for this gem
          const realLikes = likes.filter(l => l.contentId === gem.id).length;
          const fallbackLikes = ((gem.id.charCodeAt(0) * 7) % 35) + 12;
          const totalLikes = realLikes > 0 ? realLikes : fallbackLikes;

          const realComments = comments.filter(c => c.contentId === gem.id).length;
          const fallbackComments = ((gem.id.charCodeAt(0) * 3) % 15) + 2;
          const totalComments = realComments > 0 ? realComments : fallbackComments;

          return (
            <div
              key={gem.id}
              onClick={(e) => handleCardClick(e, gem)}
              style={{ scrollSnapAlign: 'start' }}
              className="group relative flex-none w-[240px] sm:w-[270px] md:w-[290px] aspect-[4/5] rounded-[20px] overflow-hidden bg-slate-950 border border-slate-800/80 hover:border-rose-500/40 hover:ring-1 hover:ring-rose-500/30 shadow-md hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-2 transition-all duration-300 ease-in-out cursor-pointer"
            >
              {/* Cover Image */}
              <ProgressiveImage
                src={gem.image}
                alt={gem.name}
                itemName={gem.name}
                category="mountain"
                targetWidth={400}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:brightness-105 filter brightness-[0.95]"
              />

              {/* Glass Sweep Light Reflection Effect on Hover */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px] z-20">
                <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[350%] transition-transform duration-1000 ease-in-out" />
              </div>

              {/* Bottom Soft Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none z-10 flex flex-col justify-end p-5">
                {/* Hidden Gem Name */}
                <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight leading-snug line-clamp-1 group-hover:text-rose-300 transition-colors duration-300">
                  {gem.name}
                </h3>

                {/* Likes & Comments + Explore Fade-in */}
                <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-200">
                  <div className="flex items-center gap-3.5">
                    {/* ❤️ Likes */}
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>{totalLikes}</span>
                    </span>

                    {/* 💬 Comments */}
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-300" />
                      <span>{totalComments}</span>
                    </span>
                  </div>

                  {/* "Explore →" fades in on hover */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold text-rose-300 flex items-center gap-1 shrink-0">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HiddenGemsSection;
