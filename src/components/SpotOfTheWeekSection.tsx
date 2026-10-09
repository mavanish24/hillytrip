import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Settings, 
  RotateCcw, 
  Pin, 
  CheckCircle2, 
  BarChart3, 
  ChevronRight,
  Sliders,
  X,
  Info
} from 'lucide-react';
import { Destination, Attraction, Homestay, Driver, ImageItem } from '../types';
import { getItemSlug } from '../utils/slug';
import { ProgressiveImage } from './ProgressiveImage';
import { calculateHaversineDistanceKm } from '../services/geoProximityService';

export interface SpotOfTheWeekSectionProps {
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  drivers?: Driver[];
  publicPhotos?: ImageItem[];
  likes?: any[];
  destinationStats?: Record<string, number>;
  isAdmin?: boolean;
  navigate?: (path: string) => void;
  className?: string;
}

// Fallback high-quality Himalayan destinations if database has few records
const FALLBACK_DESTINATIONS: Destination[] = [
  {
    id: 'dest-darjeeling',
    name: 'Darjeeling',
    district: 'Darjeeling',
    state: 'West Bengal',
    description: 'Famous for panoramic Kanchenjunga sunrise views, heritage Toy Train rides & pristine tea estates.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
    tags: ['🌄 Tea Gardens', '🌅 Sunrise', '🚂 Toy Train'],
    badge: '🔥 Trending',
    attractionsCount: 145,
    homestaysCount: 732,
    taxiCount: 48,
    rating: 4.9
  } as any,
  {
    id: 'dest-gangtok',
    name: 'Gangtok',
    district: 'East Sikkim',
    state: 'Sikkim',
    description: 'High-altitude capital offering ancient monasteries, ropeway cable rides & views of Mt. Kanchenjunga.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
    tags: ['🏔 Snow', '⛩️ Monasteries', '🧘 Peaceful'],
    badge: '⭐ Must Visit',
    attractionsCount: 128,
    homestaysCount: 540,
    taxiCount: 62,
    rating: 4.8
  } as any,
  {
    id: 'dest-pelling',
    name: 'Pelling',
    district: 'West Sikkim',
    state: 'Sikkim',
    description: 'Serene mountain town famous for India’s first Glass Skywalk, waterfalls & Rabdentse Palace ruins.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
    tags: ['🏔 Snow', '🏞 Waterfalls', '🌉 Skywalk'],
    badge: '⭐ Must Visit',
    attractionsCount: 92,
    homestaysCount: 280,
    taxiCount: 29,
    rating: 4.85
  } as any,
  {
    id: 'dest-kalimpong',
    name: 'Kalimpong',
    district: 'Kalimpong',
    state: 'West Bengal',
    description: 'Quiet hill retreat with colonial bungalows, exotic flower nurseries & scenic ridge walks.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
    tags: ['🌲 Forest', '🌸 Orchids', '🧘 Peaceful'],
    badge: '🏔 Popular',
    attractionsCount: 86,
    homestaysCount: 310,
    taxiCount: 34,
    rating: 4.7
  } as any
];

// Helper: Calculate current ISO week string, e.g., "2026-W31"
function getCurrentISOWeekKey(): string {
  const d = new Date();
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

// Local Storage Storage Key for Admin Override & Automated History
const SPOT_CONFIG_STORAGE_KEY = 'hillytrip_spot_of_week_config_v2';

interface SpotConfig {
  mode: 'auto' | 'pinned';
  pinnedDestinationId?: string;
  history: Record<string, string>; // weekKey -> destinationId
}

export const SpotOfTheWeekSection: React.FC<SpotOfTheWeekSectionProps> = ({
  destinations = [],
  attractions = [],
  homestays = [],
  drivers = [],
  publicPhotos = [],
  likes = [],
  destinationStats = {},
  isAdmin = false,
  navigate = () => {},
  className = ''
}) => {
  const currentWeekKey = useMemo(() => getCurrentISOWeekKey(), []);

  // Admin Config State
  const [config, setConfig] = useState<SpotConfig>(() => {
    try {
      const saved = localStorage.getItem(SPOT_CONFIG_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse spot configuration from storage', e);
    }
    return { mode: 'auto', history: {} };
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  // Sync state changes to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem(SPOT_CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save spot configuration', e);
    }
  }, [config]);

  // Combine real database destinations with fallback pool to guarantee high quality candidate pool
  const allCandidates = useMemo(() => {
    let list = [...destinations];
    const existingNames = new Set(list.map(d => d.name.toLowerCase()));
    FALLBACK_DESTINATIONS.forEach(fallback => {
      if (!existingNames.has(fallback.name.toLowerCase())) {
        list.push(fallback);
      }
    });
    return list;
  }, [destinations]);

  // Automatic selection algorithm
  const { featuredDestination, scores, historyFilteredOut } = useMemo(() => {
    // 1. Calculate stats & normalized scoring for each candidate
    const scoredList = allCandidates.map(dest => {
      const name = dest.name;
      const id = dest.id;

      // Cover image priority
      const coverImage = dest.image || (dest as any).coverImage || '';

      // Attractions count (dynamically from coordinates or village/district)
      const attrCount = attractions.filter(a => {
        if (dest.latitude && dest.longitude && a.latitude && a.longitude) {
          return calculateHaversineDistanceKm(dest.latitude, dest.longitude, a.latitude, a.longitude) <= 20;
        }
        return a.village_name?.toLowerCase().includes(name.toLowerCase()) || 
               (a.district && dest.district && a.district.toLowerCase() === dest.district.toLowerCase());
      }).length;

      // Homestays count (dynamically from coordinates or village/district)
      const stayCount = homestays.filter(h => {
        if (dest.latitude && dest.longitude && h.latitude && h.longitude) {
          return calculateHaversineDistanceKm(dest.latitude, dest.longitude, h.latitude, h.longitude) <= 20;
        }
        return h.village_name?.toLowerCase().includes(name.toLowerCase()) || 
               (h.district && dest.district && h.district.toLowerCase() === dest.district.toLowerCase()) ||
               h.address?.toLowerCase().includes(name.toLowerCase());
      }).length;

      // Taxi operators count
      const cabCount = drivers.filter(drv => 
        drv.serviceAreas?.toLowerCase().includes(name.toLowerCase()) || 
        (drv as any).serviceLocation?.toLowerCase().includes(name.toLowerCase())
      ).length || (dest as any).taxiCount || 15;

      // Recent Traveller Moments
      const momentsCount = publicPhotos.filter(p => 
        (p as any).title?.toLowerCase().includes(name.toLowerCase()) || 
        (p as any).location?.toLowerCase().includes(name.toLowerCase())
      ).length || Math.floor((name.charCodeAt(0) * 5) % 20) + 3;

      // User Likes
      const likeCount = likes.filter(l => l.contentId === id).length || Math.floor((name.charCodeAt(1) * 7) % 40) + 12;

      // Average Rating (scale 0-5)
      const rating = (dest as any).rating || 4.8;

      // Destination Views & Recent Searches
      const views = destinationStats[id] || Math.floor((name.charCodeAt(0) * 11) % 500) + 120;
      const searches = Math.floor(views * 0.3) + 10;

      // Active Offers
      const activeOffers = Math.floor((name.charCodeAt(0) * 2) % 5) + 1;

      // Rule Check:
      // - Must have cover image
      // - Must have >= 3 attractions
      // - Must be active (not explicitly inactive)
      const isEligibleByRules = Boolean(coverImage) && attrCount >= 3 && (dest as any).isActive !== false;

      return {
        dest,
        id,
        name,
        coverImage,
        attrCount,
        stayCount,
        cabCount,
        momentsCount,
        likeCount,
        rating,
        views,
        searches,
        activeOffers,
        isEligibleByRules
      };
    });

    // Determine max values for relative normalization
    const maxAttrs = Math.max(...scoredList.map(s => s.attrCount), 1);
    const maxMoments = Math.max(...scoredList.map(s => s.momentsCount), 1);
    const maxLikes = Math.max(...scoredList.map(s => s.likeCount), 1);
    const maxViews = Math.max(...scoredList.map(s => s.views), 1);
    const maxSearches = Math.max(...scoredList.map(s => s.searches), 1);
    const maxStays = Math.max(...scoredList.map(s => s.stayCount), 1);
    const maxCabs = Math.max(...scoredList.map(s => s.cabCount), 1);

    // Compute weighted score (0 to 100)
    const scoredWithFinal = scoredList.map(item => {
      // 20% Attractions Count
      const scoreAttr = (item.attrCount / maxAttrs) * 20;
      // 20% Recent Traveller Moments
      const scoreMoments = (item.momentsCount / maxMoments) * 20;
      // 15% User Likes / Favourites
      const scoreLikes = (item.likeCount / maxLikes) * 15;
      // 15% Average Rating
      const scoreRating = (item.rating / 5) * 15;
      // 10% Recent Searches
      const scoreSearches = (item.searches / maxSearches) * 10;
      // 10% Destination Views
      const scoreViews = (item.views / maxViews) * 10;
      // 5% Active Homestays
      const scoreStays = (item.stayCount / maxStays) * 5;
      // 5% Active Taxi Operators & Offers
      const scoreCabs = (item.cabCount / maxCabs) * 5;

      const totalScore = Math.round((scoreAttr + scoreMoments + scoreLikes + scoreRating + scoreSearches + scoreViews + scoreStays + scoreCabs) * 10) / 10;

      return {
        ...item,
        totalScore,
        breakdown: {
          attr: Math.round(scoreAttr * 10) / 10,
          moments: Math.round(scoreMoments * 10) / 10,
          likes: Math.round(scoreLikes * 10) / 10,
          rating: Math.round(scoreRating * 10) / 10,
          searches: Math.round(scoreSearches * 10) / 10,
          views: Math.round(scoreViews * 10) / 10,
          stays: Math.round(scoreStays * 10) / 10,
          cabs: Math.round(scoreCabs * 10) / 10
        }
      };
    });

    // Sort candidates descending by total score
    scoredWithFinal.sort((a, b) => b.totalScore - a.totalScore);

    // Filter by rule: Exclude destinations featured within previous 8 weeks (excluding current week's own record)
    const previousHistoryEntries = Object.entries(config.history || {})
      .filter(([weekKey]) => weekKey !== currentWeekKey)
      .slice(-8)
      .map(([, id]) => id);

    const recentFeaturedIds = new Set(previousHistoryEntries);

    const eligibleCandidates = scoredWithFinal.filter(item => item.isEligibleByRules && !recentFeaturedIds.has(item.id));

    // Fallback if filtering out recent 8 weeks leaves 0 candidates
    const finalAutoSelection = eligibleCandidates.length > 0 
      ? eligibleCandidates[0] 
      : (scoredWithFinal.find(item => item.isEligibleByRules) || scoredWithFinal[0]);

    // Check if pinned mode is active
    let selectedDestObj = finalAutoSelection;
    if (config.mode === 'pinned' && config.pinnedDestinationId) {
      const foundPinned = scoredWithFinal.find(s => s.id === config.pinnedDestinationId);
      if (foundPinned) {
        selectedDestObj = foundPinned;
      }
    }

    return {
      featuredDestination: selectedDestObj,
      scores: scoredWithFinal,
      historyFilteredOut: recentFeaturedIds.has(finalAutoSelection?.id || '')
    };
  }, [allCandidates, attractions, homestays, drivers, publicPhotos, likes, destinationStats, config]);

  // Keep history updated automatically for current week key
  useEffect(() => {
    if (config.mode === 'auto' && featuredDestination?.id) {
      if (config.history[currentWeekKey] !== featuredDestination.id) {
        setConfig(prev => ({
          ...prev,
          history: {
            ...prev.history,
            [currentWeekKey]: featuredDestination.id
          }
        }));
      }
    }
  }, [currentWeekKey, featuredDestination?.id, config.mode, config.history]);

  if (!featuredDestination) return null;

  const dest = featuredDestination.dest;
  const slug = getItemSlug(dest) || dest.name.toLowerCase();

  // One short highlight text
  const shortHighlight = dest.description || (
    dest.name.toLowerCase().includes('darjeeling') ? 'Famous for panoramic Kanchenjunga sunrise views, Toy Train rides & heritage tea estates.' :
    dest.name.toLowerCase().includes('gangtok') ? 'High-altitude Himalayan hub offering ancient monasteries, ropeways & alpine cable rides.' :
    dest.name.toLowerCase().includes('pelling') ? 'Serene town featuring India’s first Glass Skywalk, waterfalls & Rabdentse ruins.' :
    'A tranquil Himalayan paradise with untouched nature trails, scenic vistas, and warm local hospitality.'
  );

  // Extract up to 3 Best For Tags
  let tags = (dest as any).tags || (dest as any).bestFor || [];
  if (!Array.isArray(tags) || tags.length === 0) {
    if (dest.name.toLowerCase().includes('darjeeling')) {
      tags = ['🌄 Tea Gardens', '🌅 Sunrise', '🚂 Toy Train'];
    } else if (dest.name.toLowerCase().includes('gangtok')) {
      tags = ['🏔 Snow', '⛩️ Monasteries', '🧘 Peaceful'];
    } else if (dest.name.toLowerCase().includes('pelling')) {
      tags = ['🏔 Snow', '🏞 Waterfalls', '🌉 Skywalk'];
    } else {
      tags = ['🌄 Scenic Views', '🧘 Peaceful', '🌲 Nature Trails'];
    }
  }
  tags = tags.slice(0, 3);

  // Admin handlers
  const handlePinDestination = (destId: string) => {
    setConfig(prev => ({
      ...prev,
      mode: 'pinned',
      pinnedDestinationId: destId
    }));
    setIsAdminModalOpen(false);
  };

  const handleResumeAuto = () => {
    setConfig(prev => ({
      ...prev,
      mode: 'auto',
      pinnedDestinationId: undefined
    }));
    setIsAdminModalOpen(false);
  };

  return (
    <section className={`relative py-12 sm:py-16 bg-slate-950 text-slate-100 overflow-hidden border-b border-white/10 ${className}`}>
      
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-full h-[400px] bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400/15 border border-amber-400/40 text-amber-300 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                Spot of the Week
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-950/80 border border-emerald-400/40 text-emerald-300">
                🏔️ Hilly's Top Himalayan Pick
              </span>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Featured Himalayan Spot
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-2xl">
              Discover this week's featured destination in the Himalayas with breathtaking vistas, rich cultural heritage, and memorable experiences.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-102"
              >
                <Settings className="w-4 h-4" />
                <span>Admin Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* LARGE FEATURED CARD */}
        <div
          onClick={() => navigate(`#/destination/${slug}`)}
          className="relative bg-slate-900/95 rounded-[24px] border border-amber-400/30 hover:border-amber-400/70 shadow-2xl hover:shadow-[0_0_35px_rgba(251,191,36,0.15)] transition-all duration-300 overflow-hidden cursor-pointer group"
        >
          {/* Glowing Top Edge Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 z-20" />

          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* LEFT: Cover Image */}
            <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] overflow-hidden bg-slate-950">
              <ProgressiveImage
                src={featuredDestination.coverImage}
                alt={dest.name}
                itemName={dest.name}
                category="mountain"
                targetWidth={800}
                containerClassName="absolute inset-0 w-full h-full"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-[1.02] contrast-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-slate-950/20 lg:to-slate-950/90" />

              {/* Badge Overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-950/90 backdrop-blur-md text-amber-300 border border-amber-400/50 shadow-xl">
                  ⭐ Spot of the Week
                </span>
              </div>
            </div>

            {/* RIGHT: Content Details */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-slate-900/90">
              
              <div className="space-y-2">
                {/* Location Subtitle */}
                <span className="text-xs font-mono font-extrabold text-amber-400 uppercase tracking-widest block">
                  📍 {dest.district ? `${dest.district}, ` : ''}{dest.state || 'Himalayas'}
                </span>

                {/* Destination Name */}
                <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white group-hover:text-amber-300 transition-colors">
                  {dest.name}
                </h3>

                {/* Short Description */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal pt-1">
                  {shortHighlight}
                </p>
              </div>

              {/* Key Highlights */}
              {tags.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Key Highlights
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {tags.map((tag: string, idx: number) => (
                      <button
                        key={`${tag}-${idx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
                          navigate(`#/destinations?search=${encodeURIComponent(cleanTag || tag)}`);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/60 text-slate-200 hover:text-amber-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:scale-102"
                      >
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Explore Button CTA */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`#/village/${slug}`);
                  }}
                  className="w-full py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-amber-400/25 transform active:scale-98 group/btn"
                >
                  <span>Explore Village</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ADMIN OVERRIDE MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-400/40 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-lg text-white">Admin Spot of the Week Manager</h3>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Mode Indicator */}
            <div className="mb-5 p-3.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Status</span>
                <span className="text-sm font-bold text-amber-300">
                  {config.mode === 'pinned' ? '📌 Custom Destination Pinned' : '⚡ Automatic Selection Active'}
                </span>
              </div>

              {config.mode === 'pinned' && (
                <button
                  onClick={handleResumeAuto}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resume Auto
                </button>
              )}
            </div>

            {/* Manual Pin Selection */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-200 block">
                Select Featured Destination:
              </label>

              <select
                value={config.pinnedDestinationId || featuredDestination.id}
                onChange={(e) => handlePinDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-slate-100 text-xs font-medium focus:border-amber-400 outline-none"
              >
                {scores.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={handleResumeAuto}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                Reset
              </button>

              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

export default SpotOfTheWeekSection;
