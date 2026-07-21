import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { doc, onSnapshot, db } from '../utils/firebase';
import { UniversalCarousel } from './UniversalCarousel';

interface FeatureCarouselProps {
  destinationsCount: number;
  attractionsCount: number;
  driversCount: number;
  homestaysCount: number;
  navigate: (path: string) => void;
}

export const FeatureCarousel: React.FC<FeatureCarouselProps> = ({
  destinationsCount,
  attractionsCount,
  driversCount,
  homestaysCount,
  navigate,
}) => {
  const [featuresData, setFeaturesData] = useState<{[key: string]: { imageUrl?: string, videoUrl?: string }}>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'homepage_content', 'features'), (docSnap) => {
      if (docSnap.exists()) {
        setFeaturesData((docSnap.data()?.cards || {}) as any);
      }
    });
    return () => unsub();
  }, []);

  const items = [
    {
      id: 'villages',
      title: 'Explore Secret Villages',
      category: 'Villages',
      badge: '🏔️ Discovery',
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
      stats: `${destinationsCount || 42} Uncharted Hubs`,
      description: 'Discover pristine, lesser-known mountain hamlets tucked away from conventional tourist trails.',
      cta: 'Discover Villages',
      image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800&auto=format&fit=crop',
      action: () => navigate('#/destinations'),
    },
    {
      id: 'attractions',
      title: 'Mountain Sights & Trails',
      category: 'Sights',
      badge: '📸 Exploration',
      badgeColor: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/20',
      stats: `${attractionsCount || 85} Points of Interest`,
      description: 'Traverse cascading waterfalls, sacred high-altitude lakes, and soaring sunrise viewpoints.',
      cta: 'View Sights',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop',
      action: () => navigate('#/attractions'),
    },
    {
      id: 'taxi',
      title: 'Verified Taxi Routes',
      category: 'Transit',
      badge: '🚖 Safe Transit',
      badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/20',
      stats: `${driversCount || 50} Local Drivers`,
      description: 'Travel securely with experienced local drivers specialized in navigating winding mountain passes.',
      cta: 'Book Transit',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
      action: () => navigate('#/book-car'),
    },
    {
      id: 'homestays',
      title: 'Cozy Rural Homestays',
      category: 'Lodging',
      badge: '🏡 Local Stays',
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/20',
      stats: `${homestaysCount || 120} Cozy Hosts`,
      description: 'Experience warm Himalayan hospitality with authentic traditional family host cottages.',
      cta: 'Explore Lodging',
      image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=800&auto=format&fit=crop',
      action: () => {
        const element = document.getElementById('featured-homestays-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('#/destinations');
        }
      },
    },
  ];

  return (
    <div className="relative w-full py-6">
      <UniversalCarousel
        items={items}
        visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4 }}
        autoPlayInterval={7000}
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
            🗺️ Curated Travel Verticals
          </span>
        }
        title="Uncharted Services"
        subtitle="Uncover deep Himalayan hospitality, offbeat homestays, secret villages, and reliable high-altitude drivers."
        renderItem={(item) => (
          <div 
            onClick={item.action}
            className="group relative h-[420px] sm:h-[450px] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:-translate-y-2 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between"
          >
            {/* Immersive Photo Header with higher contrast */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden shrink-0 bg-slate-950">
              {featuresData[item.id]?.videoUrl ? (
                <video
                  key={featuresData[item.id]?.videoUrl}
                  src={featuresData[item.id]?.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <img 
                  src={featuresData[item.id]?.imageUrl || item.image} 
                  alt={item.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 filter brightness-[1.03] contrast-[1.05] saturate-[1.05] opacity-95 group-hover:opacity-100"
                />
              )}
              {/* Very soft gradient overlay so image remains highly vivid and clear */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              
              {/* Premium Top Badge Row */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-mono font-black border uppercase tracking-wider shadow-sm backdrop-blur-md ${item.badgeColor}`}>
                  {item.badge}
                </span>
                <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-white shadow-xs">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Premium Content Body */}
            <div className="p-6 flex-grow flex flex-col justify-between text-left">
              <div>
                {/* Static statistics line */}
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black font-mono uppercase tracking-widest">
                  📈 {item.stats}
                </div>
                
                <h3 className="font-display font-black text-lg sm:text-xl text-slate-950 dark:text-white mt-1.5 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                  {item.title}
                </h3>
                
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              {/* CTA Button Anchor at the bottom */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  {item.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 text-emerald-500" />
                </span>
                
                {/* Premium Soft glow indicator */}
                <div className="w-2 h-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 group-hover:animate-ping transition-all duration-300" />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};
