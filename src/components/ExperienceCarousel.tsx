import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { UniversalCarousel } from './UniversalCarousel';
import { Destination } from '../types';

interface ExperienceCarouselProps {
  setDestTypeFilter: (val: string) => void;
  setDestSearchQuery: (val: string) => void;
  setAttractionFilter: (val: string) => void;
  setAttractionSearchQuery: (val: string) => void;
  navigate: (path: string) => void;
  destinations?: Destination[];
}

export const ExperienceCarousel: React.FC<ExperienceCarouselProps> = ({
  setDestTypeFilter,
  setDestSearchQuery,
  navigate,
  destinations = [],
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Re-implemented precise category checking logic matching DestinationsCatalogView
  const checkCategoryMatch = (dest: Destination, catId: string): boolean => {
    switch (catId) {
      case 'Waterfalls':
        return ['waterfall', 'fall', 'cascade', 'stream', 'river', 'suntaleykhola'].some(k => 
          (dest.description || '').toLowerCase().includes(k) || 
          (dest.tourismType || '').toLowerCase().includes(k) || 
          (dest.name || '').toLowerCase().includes(k)
        );
      case 'Hidden Gems':
        return !!dest.isHiddenGem;
      case 'Weekend Escapes':
        return (dest.tourismType || '').toLowerCase().includes('weekend') || 
               (dest.description || '').toLowerCase().includes('weekend') || 
               (dest.description || '').toLowerCase().includes('escape') || 
               dest.name === 'Lava' || dest.name === 'Pedong';
      case 'Photography Spots':
        return ['scenic', 'lake', 'waterfall', 'viewpoint', 'glen', 'panorama', 'river', 'sunset', 'sunrise'].some(k => 
          (dest.description || '').toLowerCase().includes(k) || (dest.tourismType || '').toLowerCase().includes(k)
        );
      case 'Tea Garden Destinations':
        return ['tea', 'estate', 'garden', 'plantation'].some(k => 
          (dest.description || '').toLowerCase().includes(k) || (dest.tourismType || '').toLowerCase().includes(k)
        );
      case 'Trekking Destinations':
        return ['trek', 'trekking', 'hike', 'climb', 'trail', 'mountain'].some(k => 
          (dest.description || '').toLowerCase().includes(k) || (dest.tourismType || '').toLowerCase().includes(k)
        );
      case 'Family Friendly':
        return !dest.isHiddenGem || ['family', 'picnic', 'resort', 'town', 'lake'].some(k => 
          (dest.description || '').toLowerCase().includes(k)
        );
      case 'Nature Escapes':
        return ['nature', 'forest', 'sanctuary', 'pine', 'national park', 'wildlife', 'viewpoint'].some(k => 
          (dest.description || '').toLowerCase().includes(k) || (dest.tourismType || '').toLowerCase().includes(k)
        );
      case 'Monastery Circuits':
        return ['monastery', 'gumpa', 'buddhist', 'temple', 'shrine'].some(k => 
          (dest.description || '').toLowerCase().includes(k) || (dest.tourismType || '').toLowerCase().includes(k)
        );
      default:
        return true;
    }
  };

  const categories = [
    {
      id: 'Trekking Destinations',
      name: 'Trekking',
      icon: '🏔',
      tagline: 'High altitude mountain adventures await',
    },
    {
      id: 'Waterfalls',
      name: 'Waterfalls',
      icon: '💧',
      tagline: 'Chase roaring and hidden cascades',
    },
    {
      id: 'Tea Garden Destinations',
      name: 'Tea Gardens',
      icon: '☕',
      tagline: 'Find peace among tea estates',
    },
    {
      id: 'Monastery Circuits',
      name: 'Monasteries',
      icon: '🛕',
      tagline: 'Explore ancient peaceful Buddhist heritage',
    },
    {
      id: 'Photography Spots',
      name: 'Photography',
      icon: '📸',
      tagline: 'Capture unforgettable panoramic scenic moments',
    },
    {
      id: 'Nature Escapes',
      name: 'Forest Escapes',
      icon: '🌲',
      tagline: 'Walk into green mountain wild',
    },
    {
      id: 'Hidden Gems',
      name: 'Hidden Gems',
      icon: '💎',
      tagline: 'Discover secret untouched base sanctuaries',
    },
    {
      id: 'Weekend Escapes',
      name: 'Weekend Escapes',
      icon: '🎒',
      tagline: 'Perfect quick refreshing mountain getaways',
    },
  ];

  const handleCategoryClick = (id: string) => {
    setSelectedId(id);
    setDestTypeFilter("All");
    setDestSearchQuery("");
    // Smooth transition/navigation to Catalog Directory with filter pre-selected
    setTimeout(() => {
      navigate(`#/destinations?category=${encodeURIComponent(id)}`);
    }, 150);
  };

  return (
    <div id="homepage-experience-explorer" className="relative w-full py-8 max-w-7xl mx-auto px-4">
      <UniversalCarousel
        items={categories}
        visibleCards={{ mobile: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
        autoPlayInterval={8000}
        showDots={false}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" /> Travel Interests
          </span>
        }
        title="Explore by Experience"
        subtitle="Discover destinations based on the experiences you want to enjoy."
        renderItem={(item) => {
          const countVal = destinations.filter(d => checkCategoryMatch(d, item.id)).length;
          const isActive = selectedId === item.id;

          return (
            <div
              id={`exp-card-${item.id.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => handleCategoryClick(item.id)}
              className={`group shrink-0 w-full min-w-[155px] h-[115px] rounded-2xl border transition-all duration-350 ease-out cursor-pointer flex flex-col justify-between p-3.5 select-none relative overflow-hidden ${
                isActive 
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-500/30 shadow-md' 
                  : 'bg-white dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800 shadow-2xs hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/45 dark:hover:border-emerald-500/45'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-2xl leading-none transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 shrink-0">
                  {countVal} {countVal === 1 ? 'Dest' : 'Dests'}
                </span>
              </div>

              <div className="space-y-0.5 text-left">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {item.name}
                </h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 font-medium leading-relaxed">
                  {item.tagline}
                </p>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
