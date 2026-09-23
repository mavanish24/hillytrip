import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { Homestay, Destination, isHomestayPublic } from '../types';
import { getItemSlug } from '../utils/slug';
import { ProgressiveImage } from './ProgressiveImage';

export interface FeaturedHomestaysSectionProps {
  homestays: Homestay[];
  destinations?: Destination[];
  likes?: any[];
  comments?: any[];
  toggleLike?: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  navigate: (path: string) => void;
  className?: string;
}

export const FeaturedHomestaysSection: React.FC<FeaturedHomestaysSectionProps> = ({
  homestays = [],
  destinations = [],
  likes = [],
  comments = [],
  toggleLike,
  navigate,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Mouse drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const dragDistance = useRef(0);

  const activeHomestays = React.useMemo(() => {
    if (!homestays || homestays.length === 0) return [];
    return homestays.filter(isHomestayPublic).slice(0, 10);
  }, [homestays]);

  // Auto-scroll every 5 seconds (5000ms) with pause on hover
  useEffect(() => {
    if (isPaused || activeHomestays.length === 0) return;

    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const cardWidth = 320; // card width + gap
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 20) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, activeHomestays]);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = containerRef.current.clientWidth * 0.75;
    const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;

    if (direction === 'right' && containerRef.current.scrollLeft >= maxScroll - 20) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === 'left' && containerRef.current.scrollLeft <= 10) {
      containerRef.current.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      const target = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      containerRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

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

  const handleCardClick = (e: React.MouseEvent, home: Homestay) => {
    if (dragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`#/homestay/${getItemSlug(home)}`);
  };

  if (activeHomestays.length === 0) return null;

  return (
    <section className={`relative py-12 bg-slate-950 text-slate-100 overflow-hidden border-b border-white/10 ${className}`}>
      <div 
        className="max-w-7xl mx-auto px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          setIsPaused(false);
          isDragging.current = false;
        }}
      >
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest block">
              Verified Rural Eco-Lodges
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-1">
              Featured Homestays
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Authentic mountain hospitality hosted by local families in pristine Himalayan villages.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => navigate('#/homestays')}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 group cursor-pointer mr-2"
            >
              Explore All Stays <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                aria-label="Previous homestay"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                aria-label="Next homestay"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* HORIZONTAL CAROUSEL */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex items-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-6 pt-2 px-1 select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {activeHomestays.map((home) => {
            // Find village / destination name
            const parentDest = destinations.find(d => 
              d.id === home.destinationId || 
              (d as any).village_code === home.destinationId ||
              (d as any).village_code === (home as any).village_code ||
              String(d.id).toLowerCase() === String(home.destinationId || '').toLowerCase()
            );
            const destinationName = (home as any).village_name || (home as any).village || (parentDest && !/^(vil|dest|hub)\d+/i.test(parentDest.name) ? parentDest.name : (home.district || 'Himalayas'));

            // Image fallback
            const coverImage = (home.images && home.images.length > 0 && home.images[0])
              ? home.images[0]
              : ((home as any).image || "/images/hillytrip/foggy-forest.svg");

            // Badges
            const isVerified = home.verified === true || (home.claim_status as string) === 'approved' || (home.claim_status as string) === 'Verified' || home.status === 'Approved' || home.status === 'active';
            const isSuperHost = (home as any).isSuperHost || (home as any).isSuperhost || (home.id.charCodeAt(0) % 2 === 0);

            // Likes & Comments
            const realLikes = likes.filter(l => l.contentId === home.id).length;
            const fallbackLikes = ((home.id.charCodeAt(0) * 6) % 30) + 14;
            const totalLikes = realLikes > 0 ? realLikes : fallbackLikes;

            const realComments = comments.filter(c => c.contentId === home.id).length;
            const fallbackComments = ((home.id.charCodeAt(0) * 4) % 12) + 3;
            const totalComments = realComments > 0 ? realComments : fallbackComments;

            return (
              <div
                key={home.id}
                onClick={(e) => handleCardClick(e, home)}
                style={{ scrollSnapAlign: 'start' }}
                className="group relative flex-none w-[280px] sm:w-[320px] md:w-[350px] aspect-[16/9] rounded-[18px] overflow-hidden bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 hover:ring-1 hover:ring-amber-500/30 shadow-md hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-[6px] transition-all duration-300 ease-in-out cursor-pointer"
              >
                {/* Large Edge-to-Edge Cover Image (16:9 Landscape) */}
                <ProgressiveImage
                  src={coverImage}
                  alt={home.name}
                  itemName={home.name}
                  category="village"
                  targetWidth={400}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-[1.04] group-hover:brightness-105 filter brightness-[0.95]"
                />

                {/* Top Badges (Verified & Super Host) */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/20" /> Verified
                    </span>
                  )}
                  {isSuperHost && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950/90 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-md">
                      <Award className="w-3 h-3 text-amber-400" /> Super Host
                    </span>
                  )}
                </div>

                {/* Bottom Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none z-10 flex flex-col justify-end p-4 sm:p-5">
                  {/* Homestay Name */}
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors duration-300">
                    {home.name}
                  </h3>

                  {/* Destination Name */}
                  <p className="text-xs font-mono font-bold text-amber-400/90 tracking-wide mt-0.5 truncate">
                    📍 {destinationName}
                  </p>

                  {/* Bottom Row: ❤️ Likes   💬 Comments, View Stay → */}
                  <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-slate-300">
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

                    {/* View Stay → Fades in on hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold text-amber-300 flex items-center gap-1 shrink-0">
                      View Stay <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedHomestaysSection;
