import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Attraction, Destination, ImageItem } from '../types';
import { getItemSlug } from '../utils/slug';
import { ProgressiveImage } from './ProgressiveImage';

export interface PopularAttractionsSectionProps {
  attractions?: Attraction[];
  destinations?: Destination[];
  publicPhotos?: ImageItem[];
  likes?: any[];
  comments?: any[];
  navigate?: (path: string) => void;
  className?: string;
}

// Internal Interface for Calculated Popular Attraction Card Item
interface PopularAttractionItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  destinationName: string;
  destinationSlug: string;
  destinationId: string;
  popularityScore: number;
}

export const PopularAttractionsSection: React.FC<PopularAttractionsSectionProps> = ({
  attractions = [],
  destinations = [],
  publicPhotos = [],
  likes = [],
  comments = [],
  navigate = () => {},
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [liveAttractions, setLiveAttractions] = useState<Attraction[]>(attractions || []);

  useEffect(() => {
    if (attractions && attractions.length >= 8) {
      setLiveAttractions(attractions);
      return;
    }
    // Fetch live attractions from real API
    const controller = new AbortController();
    fetch('/api/attractions?limit=12', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLiveAttractions(data);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
      });
    return () => controller.abort();
  }, [attractions]);

  // Mouse drag handling state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const dragDistance = useRef(0);

  const rankedAttractions = useMemo<PopularAttractionItem[]>(() => {
    let candidates: PopularAttractionItem[] = [];
    const sourceAttractions = liveAttractions.length > 0 ? liveAttractions : attractions;

    if (sourceAttractions && sourceAttractions.length > 0) {
      candidates = sourceAttractions.map((attr, idx) => {
        const parentDest = destinations.find(
          d => d.id === attr.destinationId
        );
        const destinationName = attr.village_name || parentDest?.name || attr.district || 'Himalayas';
        const destinationSlug = parentDest ? getItemSlug(parentDest) : (attr.district ? getItemSlug(attr.district) : 'darjeeling');

        const attrLikes = likes.filter(l => l.contentId === attr.id).length;
        const totalScore = (attrLikes * 8) + ((attr.id.charCodeAt(0) % 25) + 12);

        return {
          id: attr.id || `attr-${idx}`,
          name: attr.name,
          slug: getItemSlug(attr) || attr.id,
          image: attr.coverImage || attr.image || (attr.gallery && attr.gallery[0]) || '/images/hillytrip/snow-mountain.svg',
          destinationName,
          destinationSlug,
          destinationId: parentDest?.id || attr.destinationId || 'dest-generic',
          popularityScore: totalScore
        };
      });
    }

    candidates.sort((a, b) => b.popularityScore - a.popularityScore);

    const filteredPool: PopularAttractionItem[] = [];
    const destCounts: Record<string, number> = {};

    for (const item of candidates) {
      const destKey = item.destinationName.toLowerCase();
      const currentCount = destCounts[destKey] || 0;
      if (currentCount < 2) {
        filteredPool.push(item);
        destCounts[destKey] = currentCount + 1;
      }
    }

    return filteredPool.length >= 8 ? filteredPool.slice(0, 10) : candidates.slice(0, 10);
  }, [liveAttractions, attractions, destinations, publicPhotos, likes]);

  // Auto-scroll every 5 seconds (5000ms) with pause on hover
  useEffect(() => {
    if (isPaused || rankedAttractions.length === 0) return;

    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const cardWidth = 320; // Card width + gap
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft >= maxScroll - 20) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, rankedAttractions]);

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

  const handleCardClick = (e: React.MouseEvent, item: PopularAttractionItem) => {
    if (dragDistance.current > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`/attraction/${item.slug}`);
  };

  if (rankedAttractions.length === 0) return null;

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
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest block">
              Top Sightseeing & Natural Wonders
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-1">
              Popular Attractions
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Discover the most loved, iconic viewpoints, lakes, and heritage sites in the Himalayas.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => navigate('#/attractions')}
              className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 group cursor-pointer mr-2"
            >
              View All Attractions <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Nav Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                aria-label="Previous attraction"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                aria-label="Next attraction"
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
          {rankedAttractions.map((item) => {
            const realLikes = likes.filter(l => l.contentId === item.id).length;
            const fallbackLikes = ((item.id.charCodeAt(0) * 5) % 35) + 12;
            const totalLikes = realLikes > 0 ? realLikes : fallbackLikes;

            const realComments = comments.filter(c => c.contentId === item.id).length;
            const fallbackComments = ((item.id.charCodeAt(0) * 3) % 15) + 3;
            const totalComments = realComments > 0 ? realComments : fallbackComments;

            return (
              <div
                key={item.id}
                onClick={(e) => handleCardClick(e, item)}
                style={{ scrollSnapAlign: 'start' }}
                className="group relative flex-none w-[280px] sm:w-[320px] md:w-[350px] aspect-[16/9] rounded-[18px] overflow-hidden bg-slate-950 border border-slate-800/80 hover:border-amber-500/40 hover:ring-1 hover:ring-amber-500/30 shadow-md hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-[6px] transition-all duration-300 ease-in-out cursor-pointer"
              >
                {/* Large Cover Image (16:9 Landscape) */}
                <ProgressiveImage
                  src={item.image}
                  alt={item.name}
                  itemName={item.name}
                  category="monastery"
                  targetWidth={400}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-[1.04] group-hover:brightness-105 filter brightness-[0.95]"
                />

                {/* Bottom Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent pointer-events-none z-10 flex flex-col justify-end p-4 sm:p-5">
                  {/* Attraction Name */}
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors duration-300">
                    {item.name}
                  </h3>

                  {/* Destination Name */}
                  <p className="text-xs font-mono font-bold text-amber-400/90 tracking-wide mt-0.5 truncate">
                    📍 {item.destinationName}
                  </p>

                  {/* At the bottom: ❤️ Likes   💬 Comments, Explore → */}
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

                    {/* Explore → Fades in on hover */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold text-amber-300 flex items-center gap-1 shrink-0">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
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

export default PopularAttractionsSection;

