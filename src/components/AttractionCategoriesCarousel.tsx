import React from 'react';
import { 
  Compass, 
  Eye, 
  Sparkles, 
  Flame, 
  Home as HomeIcon, 
  Waves,
  CheckCircle2
} from 'lucide-react';
import { UniversalCarousel } from './UniversalCarousel';

interface AttractionCategoriesCarouselProps {
  categoriesList: string[];
  attractions: any[];
  attractionFilter: string;
  setAttractionFilter: (val: string) => void;
  setAttractionVisibleCount: (val: number) => void;
}

export const AttractionCategoriesCarousel: React.FC<AttractionCategoriesCarouselProps> = ({
  categoriesList,
  attractions,
  attractionFilter,
  setAttractionFilter,
  setAttractionVisibleCount,
}) => {
  // Helper to return Lucide icon based on category name
  const getCategoryIconElement = (categoryName: string, className = "w-4 h-4") => {
    const cat = (categoryName || '').toLowerCase();
    if (cat.includes('waterfall')) return <Sparkles className={`${className} text-emerald-400`} />;
    if (cat.includes('viewpoint') || cat.includes('peak') || cat.includes('sunrise')) return <Eye className={`${className} text-indigo-400`} />;
    if (cat.includes('monastery') || cat.includes('temple') || cat.includes('shrine')) return <Compass className={`${className} text-amber-400`} />;
    if (cat.includes('lake') || cat.includes('river') || cat.includes('water')) return <Waves className={`${className} text-sky-400`} />;
    if (cat.includes('trek') || cat.includes('hiking') || cat.includes('mountain')) return <Flame className={`${className} text-rose-400`} />;
    if (cat.includes('village') || cat.includes('town') || cat.includes('hamlet')) return <HomeIcon className={`${className} text-teal-400`} />;
    return <Compass className={`${className} text-emerald-400`} />;
  };

  // Helper to dynamically and grammatically pluralize category names
  const pluralizeCategory = (name: string): string => {
    if (!name) return '';
    const lower = name.toLowerCase();
    if (lower.endsWith('y')) {
      return name.slice(0, -1) + 'ies';
    }
    if (lower.endsWith('sh') || lower.endsWith('ch') || lower.endsWith('s')) {
      return name + 'es';
    }
    return name + 's';
  };

  // Curated list of cards, including 'All Sights'
  const carouselItems = [
    {
      id: 'All',
      name: 'All Sights',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
      desc: 'Explore all breathtaking sights, trails, and viewpoints',
      badge: '🗺️ Complete Guide',
      count: (attractions || []).length,
      isActive: attractionFilter === 'All',
      icon: <Compass className="w-4 h-4 text-emerald-400" />,
      action: () => {
        setAttractionFilter('All');
        setAttractionVisibleCount(8);
      }
    },
    ...(categoriesList || []).map(cat => {
      const count = (attractions || []).filter(a => a && a.category === cat).length;
      const isActive = attractionFilter === cat;
      
      // Map category name to curated high-quality background and description
      let img = 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop';
      let desc = 'Explore gorgeous sights across HillyTrip coordinates';
      let badge = '📍 Mountain Spot';
      
      const catLower = (cat || '').toLowerCase();
      if (catLower.includes('waterfall')) {
        img = 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=800&auto=format&fit=crop';
        desc = 'Majestic cascades and roaring mountain streams';
        badge = '💦 Roaring Cascades';
      } else if (catLower.includes('viewpoint') || catLower.includes('peak') || catLower.includes('sunrise')) {
        img = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop';
        desc = 'Panoramic lookouts and spectacular valley vistas';
        badge = '🌅 Sunrise Views';
      } else if (catLower.includes('monastery') || catLower.includes('temple')) {
        img = 'https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=800&auto=format&fit=crop';
        desc = 'Serene spiritual sanctuaries and historic heritage';
        badge = '☸️ Spiritual Peace';
      } else if (catLower.includes('lake')) {
        img = 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop';
        desc = 'Tranquil high-altitude alpine waters and reflection spots';
        badge = '💎 Pure Glacial';
      } else if (catLower.includes('trek') || catLower.includes('hiking') || catLower.includes('mountain')) {
        img = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop';
        desc = 'Challenging summits and scenic wilderness trails';
        badge = '🥾 Adventurous Trails';
      } else if (catLower.includes('village') || catLower.includes('town') || catLower.includes('hamlet')) {
        img = 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800&auto=format&fit=crop';
        desc = 'Quaint rustic hamlets and local culture';
        badge = '🏡 Rural Serenity';
      } else if (catLower.includes('forest') || catLower.includes('park') || catLower.includes('garden')) {
        img = 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop';
        desc = 'Deep alpine forests and refreshing green canopies';
        badge = '🌲 Dense Canopy';
      }

      return {
        id: cat,
        name: pluralizeCategory(cat),
        img,
        desc,
        badge,
        count,
        isActive,
        icon: getCategoryIconElement(cat, "w-4 h-4"),
        action: () => {
          setAttractionFilter(isActive ? 'All' : cat);
          setAttractionVisibleCount(8);
        }
      };
    })
  ];

  return (
    <div className="relative w-full py-6">
      <UniversalCarousel
        items={carouselItems}
        visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
        autoPlayInterval={7200}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            ⛰️ Curated Exploration Nodes
          </span>
        }
        title="Attraction Categories"
        subtitle="Swipe or select a style card to filter peak hotspots, waterfalls, or local shrines."
        renderItem={(item) => (
          <button
            onClick={item.action}
            className={`group relative w-full h-[220px] sm:h-[240px] rounded-3xl overflow-hidden border transition-all duration-300 ease-out cursor-pointer text-left flex flex-col justify-end bg-slate-950 ${
              item.isActive 
                ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[0.98] shadow-emerald-500/10' 
                : 'border-slate-200/85 dark:border-slate-850/85 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1'
            }`}
          >
            {/* Photo Background */}
            <img 
              src={item.img} 
              alt={item.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-all duration-700 ease-out filter brightness-[0.95] group-hover:scale-110"
            />
            
            {/* Visual overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-10 pointer-events-none" />

            {/* Top-Left Premium Badge & Icon */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider shadow-sm bg-slate-950/80 backdrop-blur-md text-white border border-white/10">
                {item.badge}
              </span>
              {item.isActive && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                  <CheckCircle2 className="w-3 h-3 mr-0.5 text-white" /> Active
                </span>
              )}
            </div>

            {/* Top-Right Count bubble */}
            <div className="absolute top-4 right-4 z-20">
              <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-[9px] font-mono font-bold bg-white/10 backdrop-blur-md text-white border border-white/15">
                {item.count} Sights
              </span>
            </div>

            {/* Bottom info panel */}
            <div className="p-4 sm:p-5 z-20 text-white relative">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                  {item.icon}
                </div>
                <h4 className="font-display font-black text-base sm:text-lg tracking-tight leading-tight group-hover:text-emerald-400 transition-colors duration-200">
                  {item.name}
                </h4>
              </div>
              
              <p className="text-[10px] sm:text-xs text-slate-300 font-medium mt-1.5 leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
                {item.desc}
              </p>
            </div>
          </button>
        )}
      />
    </div>
  );
};
