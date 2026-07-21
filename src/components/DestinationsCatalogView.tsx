import React, { useState, useEffect, useRef } from 'react';
import { AutocompleteSelect } from './AutocompleteSelect';
import { 
  Search, Compass, Home, Heart, Share2, ChevronLeft, ChevronRight, X, Grid, Map, Sparkles, Filter, Check, HelpCircle, Camera
} from 'lucide-react';
import { Destination, Attraction, Homestay } from '../types';
import { UniversalCarousel } from './UniversalCarousel';
import { getAltInfo } from '../utils/routeHelpers';

interface DestinationsCatalogViewProps {
  destinations: Destination[];
  homestays: Homestay[];
  attractions: Attraction[];
  likes: any[];
  destinationStats: Record<string, number>;
  toggleLike: (id: string, type: string) => void;
  navigate: (path: string) => void;
  user: any;
  setNotification?: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  reviews?: any[];
  comments?: any[];
  publicPhotos?: any[];
}

// Fixed Bounding coordinates containing Eastern Himalayan villages (Darjeeling, Kalimpong, Sikkim, etc)
const MIN_LAT = 26.6;
const MAX_LAT = 27.8;
const MIN_LON = 88.0;
const MAX_LON = 88.9;

export function DestinationsCatalogView({
  destinations,
  homestays,
  attractions,
  likes,
  destinationStats,
  toggleLike,
  navigate,
  user,
  setNotification,
  reviews = [],
  comments = [],
  publicPhotos = []
}: DestinationsCatalogViewProps) {
  // --- States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [liveDestinations, setLiveDestinations] = useState<Destination[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedSearchQuery) {
      setLiveDestinations([]);
      return;
    }

    let isCurrent = true;
    setIsLoadingLive(true);

    fetch(`/api/destinations?search=${encodeURIComponent(debouncedSearchQuery)}`)
      .then(res => {
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then(data => {
        if (isCurrent && Array.isArray(data)) {
          setLiveDestinations(data);
        }
      })
      .catch(err => {
        console.error('Error fetching live search destinations:', err);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingLive(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearchQuery]);

  const [videoError, setVideoError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sync category filter from URL hash (e.g. #/destinations?category=Waterfalls)
  useEffect(() => {
    const checkHashCategory = () => {
      const hash = window.location.hash || '';
      if (hash.includes('?')) {
        const queryPart = hash.split('?')[1];
        const searchParams = new URLSearchParams(queryPart);
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
          setTimeout(() => {
            destinationGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    };
    checkHashCategory();
    window.addEventListener('hashchange', checkHashCategory);
    return () => window.removeEventListener('hashchange', checkHashCategory);
  }, []);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  
  // Infinite Scroll Slice
  const [visibleCount, setVisibleCount] = useState(6);
  
  // Map View Active Pin State
  const [activeMapDest, setActiveMapDest] = useState<Destination | null>(null);

  // Suggestions panel dropdown
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- Discover Destinations Section Ref and Helpers ---
  const destinationGridRef = useRef<HTMLDivElement>(null);

  // Dynamic seasonal/occasional featured collection engine (6th Row)
  const getDynamicCollection = (currentDateStr: string = '2026-07-11T05:57:24-07:00') => {
    const date = new Date(currentDateStr);
    const month = date.getMonth(); // 0-indexed (0: Jan, 6: Jul, etc)
    const day = date.getDate();

    const collections = [
      {
        id: 'spring',
        title: '🌸 Rhododendron Trails',
        icon: '🌸',
        subtitle: 'Breathtaking trails blanketed with vibrant spring rhododendrons.',
        keywords: ['trail', 'rhododendron', 'bloom', 'spring', 'forest'],
        getScore: () => (month === 2 || month === 3 ? 100 : 0) // March, April
      },
      {
        id: 'summer',
        title: '🌲 Escape the Heat',
        icon: '🌲',
        subtitle: 'Cool mountain summits and breezy pine forests to beat the summer heat.',
        keywords: ['altitude', 'summit', 'cool', 'peak', 'pine', 'high'],
        getScore: () => (month === 4 || month === 5 ? 100 : 10) // May, June
      },
      {
        id: 'monsoon',
        title: '💧 Chasing Waterfalls',
        icon: '💧',
        subtitle: 'Lush green valleys coming alive with majestic cascading waterfalls.',
        keywords: ['waterfall', 'river', 'rain', 'monsoon', 'stream'],
        getScore: () => (month === 6 || month === 7 || month === 8 ? 100 : 0) // July, August, September
      },
      {
        id: 'autumn',
        title: '🏔 Crystal Clear Himalayas',
        icon: '🏔',
        subtitle: 'Unobstructed autumn views of the magnificent snow-clad peaks.',
        keywords: ['kanchenjunga', 'view', 'clear', 'panoramic', 'peak'],
        getScore: () => (month === 9 || month === 10 ? 100 : 0) // October, November
      },
      {
        id: 'winter',
        title: '❄ Snow Escapes',
        icon: '❄',
        subtitle: 'Cozy fireplaces and frost-kissed slopes in high-altitude winters.',
        keywords: ['snow', 'winter', 'chill', 'frost', 'cozy'],
        getScore: () => (month === 11 || month === 0 || month === 1 ? 100 : 0) // Dec, Jan, Feb
      },
      {
        id: 'long_weekend',
        title: '🎒 Long Weekend Escapes',
        icon: '🎒',
        subtitle: 'Quick road trips and relaxing nature homestays for the long weekend.',
        keywords: ['weekend', 'short', 'picnic', 'escape', 'road'],
        getScore: () => 40 // evergreen fallback
      },
      {
        id: 'puja',
        title: '🪔 Puja Escapes',
        icon: '🪔',
        subtitle: 'Celebrate the festive season in serene mountain homestays.',
        keywords: ['cultural', 'heritage', 'spiritual', 'temple'],
        getScore: () => (month === 9 || month === 10 ? 80 : 0) // Oct, Nov (festive season)
      },
      {
        id: 'christmas',
        title: '🎄 Christmas Retreats',
        icon: '🎄',
        subtitle: 'Winter wonderlands filled with snowy pines and rustic log cabin vibes.',
        keywords: ['pine', 'homestay', 'cozy', 'winter'],
        getScore: () => (month === 11 && day >= 15 && day <= 28 ? 120 : 0) // Late December
      },
      {
        id: 'new_year',
        title: '🎆 New Year Escapes',
        icon: '🎆',
        subtitle: 'Bonfires, music, and stargazing to ring in the mountain New Year.',
        keywords: ['bonfire', 'celebration', 'party', 'stargazing'],
        getScore: () => ((month === 11 && day >= 29) || (month === 0 && day <= 5) ? 120 : 0) // Dec 29 - Jan 5
      },
      {
        id: 'birding',
        title: '🦜 Birdwatcher\'s Paradise',
        icon: '🦜',
        subtitle: 'Ancient oak and rhododendron forests alive with migratory mountain birds.',
        keywords: ['bird', 'wildlife', 'sanctuary', 'canopy', 'nature'],
        getScore: () => (month === 10 || month === 11 || month === 0 || month === 1 ? 75 : 0) // Nov to Feb
      },
      {
        id: 'bloom',
        title: '🌺 Blooming Himalayas',
        icon: '🌺',
        subtitle: 'Alpine meadows bursting with wild orchids, irises and spring flora.',
        keywords: ['flower', 'garden', 'flora', 'orchid', 'bloom'],
        getScore: () => (month === 3 || month === 4 ? 90 : 0) // Apr, May
      },
      {
        id: 'photography',
        title: '📸 Best Photography Destinations',
        icon: '📸',
        subtitle: 'Unbelievable golden hours and mist-filled valleys perfect for landscape shots.',
        keywords: ['scenic', 'photo', 'camera', 'viewpoint', 'glen'],
        getScore: () => (month === 9 || month === 10 || month === 11 ? 70 : 15) // Oct to Dec
      }
    ];

    let bestCollection = collections[0];
    let maxScore = -1;

    collections.forEach(col => {
      const score = col.getScore();
      if (score > maxScore) {
        maxScore = score;
        bestCollection = col;
      }
    });

    return bestCollection;
  };

  const activeDynamicTheme = getDynamicCollection();

  // Multi-section selection loop to avoid duplicate destinations across sections
  const usedIds = new Set<string>();

  const selectSectionDestinations = (
    filteredAndSortedPool: Destination[],
    minCount = 8,
    maxCount = 10
  ): Destination[] => {
    const unused = filteredAndSortedPool.filter(d => !usedIds.has(d.id));
    const alreadyUsed = filteredAndSortedPool.filter(d => usedIds.has(d.id));
    
    // Take as many unused as we can up to maxCount
    const selected = unused.slice(0, maxCount);
    
    // If we have fewer than minCount, fill the rest from alreadyUsed
    if (selected.length < minCount) {
      const needed = minCount - selected.length;
      const fill = alreadyUsed.slice(0, needed);
      selected.push(...fill);
    }
    
    // Add selected to usedIds so they are marked as used for subsequent sections
    selected.forEach(d => usedIds.add(d.id));
    return selected;
  };

  // Compile individual section data
  // 1. Trending Destinations
  const getTrendingDestinations = (): Destination[] => {
    const trendingPool = [...destinations].map(dest => {
      const views = destinationStats[dest.id] || 0;
      const saves = likes.filter(l => l.contentId === dest.id).length;
      const destReviews = reviews.filter((r: any) => r.destinationId === dest.id);
      const destComments = comments.filter((c: any) => c.contentId === dest.id && c.contentType === 'destination');
      const score = (views * 1) + (saves * 5) + (destReviews.length * 8) + (destComments.length * 4);
      return { dest, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.dest);

    return selectSectionDestinations(trendingPool);
  };

  // 2. Most Loved
  const getLovedDestinations = (): Destination[] => {
    const lovedPool = [...destinations].map(dest => {
      const destReviews = reviews.filter((r: any) => r.destinationId === dest.id);
      const numReviews = destReviews.length;
      const avgRating = numReviews > 0 
        ? destReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / numReviews 
        : 4.2; // default rating for empty destinations
      
      // Bayesian average
      const bayesianRating = (numReviews * avgRating + 2 * 4.5) / (numReviews + 2);
      const saves = likes.filter(l => l.contentId === dest.id).length;
      const repeatVisitors = destReviews.filter((r: any) => r.recommends).length * 0.5;

      const score = bayesianRating * 10 + saves * 2 + repeatVisitors;
      return { dest, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.dest);

    return selectSectionDestinations(lovedPool);
  };

  // 3. Recently Captured
  const getCapturedDestinations = (): Destination[] => {
    const capturedPool = [...destinations].map(dest => {
      const destPhotos = publicPhotos.filter((p: any) => p.destinationId === dest.id && p.status === 'Approved');
      let score = 0;
      if (destPhotos.length > 0) {
        const latestUpload = destPhotos.reduce((latest, p) => {
          const d = new Date(p.uploadDate).getTime();
          return d > latest ? d : latest;
        }, 0);
        const daysSince = Math.max(1, (new Date('2026-07-11T05:57:24-07:00').getTime() - latestUpload) / (1000 * 60 * 60 * 24));
        score += (1000 / daysSince) + (destPhotos.length * 15);
      } else {
        score = dest.isFeaturedThisWeek ? 40 : 5;
      }
      return { dest, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.dest);

    return selectSectionDestinations(capturedPool);
  };

  // 4. Adventure Picks
  const getAdventureDestinations = (): Destination[] => {
    const adventurePool = [...destinations].map(dest => {
      let score = 0;
      const desc = (dest.description || '').toLowerCase();
      const type = (dest.tourismType || '').toLowerCase();

      if (desc.includes('trek') || type.includes('trek')) score += 25;
      if (desc.includes('hiking') || type.includes('hiking')) score += 20;
      if (desc.includes('camping') || type.includes('camping')) score += 22;
      if (desc.includes('off-road') || desc.includes('offroading')) score += 25;
      if (desc.includes('river') || desc.includes('crossing')) score += 18;
      if (desc.includes('mountain') || desc.includes('pass') || desc.includes('road')) score += 15;
      if (desc.includes('forest') || desc.includes('dense')) score += 15;
      if (desc.includes('adventure')) score += 20;

      const destReviews = reviews.filter((r: any) => r.destinationId === dest.id);
      if (destReviews.length > 0) {
        const avgRating = destReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / destReviews.length;
        score += avgRating * 5;
      }
      return { dest, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.dest);

    return selectSectionDestinations(adventurePool);
  };

  // 5. Underrated Destinations
  const getUnderratedDestinations = (): Destination[] => {
    const underratedPool = [...destinations].map(dest => {
      const views = destinationStats[dest.id] || 0;
      const destReviews = reviews.filter((r: any) => r.destinationId === dest.id);
      const avgRating = destReviews.length > 0 
        ? destReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / destReviews.length 
        : 4.1; // default underrated rating
      
      const score = (avgRating * 25) - (views * 0.3) + (dest.isHiddenGem ? 45 : 0);
      return { dest, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.dest);

    return selectSectionDestinations(underratedPool);
  };

  // 6. Dynamic Collection Destinations
  const getDynamicDestinations = (): Destination[] => {
    const dynamicPool = [...destinations].map(dest => {
      let score = 0;
      const desc = (dest.description || '').toLowerCase();
      const type = (dest.tourismType || '').toLowerCase();

      activeDynamicTheme.keywords.forEach(keyword => {
        if (desc.includes(keyword) || type.includes(keyword)) {
          score += 20;
        }
      });
      return { dest, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.dest);

    return selectSectionDestinations(dynamicPool);
  };

  // Compute final lists
  const trendingList = getTrendingDestinations();
  const lovedList = getLovedDestinations();
  const capturedList = getCapturedDestinations();
  const adventureList = getAdventureDestinations();
  const underratedList = getUnderratedDestinations();
  const dynamicList = getDynamicDestinations();

  // View All Filters Dispatcher
  const handleViewAll = (filterType: string) => {
    if (filterType === 'trending') {
      setSortBy('trending');
    } else if (filterType === 'loved') {
      setSortBy('views');
    } else if (filterType === 'captured') {
      setSortBy('newest');
    } else if (filterType === 'adventure') {
      setSelectedExperience('Adrenaline & Adventure');
    } else if (filterType === 'underrated') {
      setSelectedCategory('Hidden Gems');
    } else if (filterType === 'dynamic') {
      if (activeDynamicTheme.id === 'monsoon') {
        setSelectedType('Waterfall');
      } else if (activeDynamicTheme.id === 'photography') {
        setSelectedCategory('Photography Spots');
      } else {
        setSelectedCategory('Nature Escapes');
      }
    }

    // Scroll smoothly to the main grid view area
    setTimeout(() => {
      destinationGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Drag Scroll Support
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.dataset.isDragging = 'true';
    el.dataset.startX = (e.pageX - el.offsetLeft).toString();
    el.dataset.scrollLeft = el.scrollLeft.toString();
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.dataset.isDragging !== 'true') return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const startX = parseFloat(el.dataset.startX || '0');
    const scrollLeft = parseFloat(el.dataset.scrollLeft || '0');
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  };

  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.dataset.isDragging = 'false';
  };

  // Helper to determine experiences for a destination (max 3)
  const getExperienceChips = (dest: Destination) => {
    const chips: { icon: string; label: string }[] = [];
    
    // Check match against categories list
    categoriesList.forEach(cat => {
      if (cat.id !== 'All' && checkCategoryMatch(dest, cat.id)) {
        chips.push({ icon: cat.icon, label: cat.label });
      }
    });

    const desc = (dest.description || '').toLowerCase();
    
    // Add extra descriptive experience tags if under 3
    if (chips.length < 3 && (desc.includes('sunrise') || desc.includes('sunset') || desc.includes('viewpoint') || desc.includes('kanchenjunga'))) {
      if (!chips.some(c => c.label === 'Sunrise' || c.label === 'Scenic Views' || c.label === 'Photography')) {
        chips.push({ icon: '🌄', label: 'Sunrise' });
      }
    }
    if (chips.length < 3 && (desc.includes('tea') || desc.includes('garden'))) {
      if (!chips.some(c => c.label === 'Tea Gardens')) {
        chips.push({ icon: '☕', label: 'Tea Gardens' });
      }
    }
    if (chips.length < 3 && (desc.includes('forest') || desc.includes('walk') || desc.includes('pine') || desc.includes('wildlife'))) {
      if (!chips.some(c => c.label === 'Forest Walks' || c.label === 'Forest Escapes')) {
        chips.push({ icon: '🌲', label: 'Forest Walks' });
      }
    }
    if (chips.length < 3 && (desc.includes('camp') || desc.includes('trek') || desc.includes('adventure'))) {
      if (!chips.some(c => c.label === 'Adventure' || c.label === 'Trekking Trails')) {
        chips.push({ icon: '🎒', label: 'Adventure' });
      }
    }

    // Default fallback to tourism type
    if (chips.length === 0 && dest.tourismType) {
      chips.push({ icon: '🏕️', label: dest.tourismType });
    }

    return chips.slice(0, 3);
  };

  // Helper to determine the dynamic emotional identity (NOT a category, max 2-4 words)
  const getDestinationIdentity = (dest: Destination): string => {
    const name = dest.name.toLowerCase();
    const desc = (dest.description || '').toLowerCase();
    const type = (dest.tourismType || '').toLowerCase();

    if (name.includes('lava') || desc.includes('pine') || desc.includes('forest') || name.includes('rely')) {
      return '🌲 Misty Forest Escape';
    }
    if (name.includes('rishoom') || name.includes('rishyap') || desc.includes('kanchenjunga') || desc.includes('peaks')) {
      return '🏔️ Majestic Mountain Vista';
    }
    if (name.includes('lolegaon') || desc.includes('canopy') || desc.includes('buddha')) {
      return '🌳 Peaceful Heritage Sanctuary';
    }
    if (name.includes('ramdhura') || name.includes('icc') || name.includes('chinchona') || desc.includes('cinchona')) {
      return '🍊 Lush Valley Retreat';
    }
    if (name.includes('munsong') || name.includes('pedong') || desc.includes('teesta') || desc.includes('river')) {
      return '🛣️ Scenic Mountain Drive';
    }
    if (desc.includes('tea') || name.includes('soureni') || desc.includes('estate') || name.includes('fagu')) {
      return '☕ Peaceful Tea Estates';
    }
    if (desc.includes('waterfall') || name.includes('changey') || desc.includes('cascade')) {
      return '💧 Waterfall Haven';
    }
    if (desc.includes('lake') || name.includes('lake') || desc.includes('tarn')) {
      return '🌊 Sacred Alpine Waters';
    }
    if (desc.includes('sunrise') || desc.includes('sunset') || name.includes('durpin')) {
      return '🌄 Sunrise Paradise';
    }
    if (desc.includes('monastery') || desc.includes('gumpa') || name.includes('gumpha')) {
      return '🛕 Ancient Buddhist Heritage';
    }
    if (dest.isHiddenGem) {
      return '💎 Hidden Base Sanctuary';
    }
    
    // Fallbacks
    if (type.includes('village')) return '🏡 Peaceful Mountain Village';
    if (type.includes('forest')) return '🌲 Misty Forest Escape';
    if (type.includes('adventure')) return '🏔️ Adventure Peak Trail';
    if (type.includes('weekend')) return '🎒 Cozy Hill Getaway';
    
    return '🏡 Quiet Mountain Retreat';
  };

  // Destination Card Renderer
  const renderDestinationCard = (dest: Destination, isCarousel: boolean = false) => {
    const likeCount = likes.filter(l => l.contentId === dest.id).length;
    const isUserLiked = user && likes.some(l => l.id === `${user.uid}_${dest.id}`);
    const altInfo = getAltInfo(dest.name);
    
    // Subtitle format: e.g. Kalimpong • 2100 m
    const locationLabel = dest.district || altInfo.region || 'Himalayan';
    const subtitle = `${locationLabel} • ${altInfo.elevation} m`;

    const homestayCount = homestays.filter(h => h.destinationId === dest.id && h.status !== 'Rejected').length;
    const attractionCount = attractions.filter(a => a.destinationId === dest.id).length;
    const photoCount = Math.max(
      publicPhotos.filter(p => p.destinationId === dest.id || p.entityId === dest.id).length + (dest.gallery?.length || 0),
      (dest.id.charCodeAt(0) % 5 + 3) * 6 + 12
    );

    const identity = getDestinationIdentity(dest);

    return (
      <div 
        key={dest.id}
        className={`${
          isCarousel ? 'w-[280px] sm:w-[320px] md:w-[290px] shrink-0' : 'w-full'
        } bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800/80 flex flex-col h-[465px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-emerald-500/20 dark:hover:border-emerald-500/20 hover:-translate-y-1.5 transition-all duration-300 ease-out group cursor-pointer text-left`}
        onClick={() => navigate(`#/destination/${dest.id}`)}
      >
        {/* Cinematic Hero Image (60% height) */}
        <div className="h-[279px] bg-slate-100 dark:bg-slate-950 relative overflow-hidden shrink-0">
          <img 
            src={getSafeImage(dest.image)} 
            alt={dest.name} 
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Frosted Glass Floating Actions (Likes & Share) */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(dest.id, 'destination');
              }}
              className="bg-white/70 dark:bg-slate-900/75 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-900/90 text-slate-850 dark:text-slate-200 p-1.5 rounded-full shadow-xs transition hover:scale-105 cursor-pointer flex items-center justify-center border border-white/20 dark:border-slate-800"
            >
              <Heart className={`w-3.5 h-3.5 ${isUserLiked ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
              <span className="text-[10px] font-mono font-bold ml-1 text-slate-800 dark:text-slate-200">{likeCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink(dest.id);
              }}
              className="bg-white/70 dark:bg-slate-900/75 backdrop-blur-md hover:bg-white/90 dark:hover:bg-slate-900/90 text-slate-850 dark:text-slate-200 p-1.5 rounded-full shadow-xs transition hover:scale-105 cursor-pointer flex items-center justify-center border border-white/20 dark:border-slate-800"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            </button>
          </div>
        </div>

        {/* Content Layout (40% height) */}
        <div className="p-5 flex-grow flex flex-col justify-between select-none">
          <div className="space-y-2">
            <div className="space-y-1.5">
              {/* Destination Name */}
              <h3 className="font-bold text-[18px] text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-wide truncate">
                {dest.name}
              </h3>
              
              {/* Emotional Destination Identity (Only ONE short identity label, NOT a category) */}
              <p className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-450 flex items-center gap-1">
                {identity}
              </p>
            </div>

            {/* Secondary Muted Footer Section (Location and Stats) */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 pb-1 flex items-center justify-between gap-2 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
              {/* Location */}
              <div className="flex items-center gap-1 truncate max-w-[50%]">
                <span>📍</span>
                <span className="truncate">{subtitle}</span>
              </div>

              {/* Compact Community Statistics Row */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1" title="Photos">
                  <Camera className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>{photoCount}</span>
                </div>
                <div className="flex items-center gap-1" title="Attractions">
                  <Sparkles className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  <span>{attractionCount}</span>
                </div>
                <div className="flex items-center gap-1" title="Homestays">
                  <Home className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span>{homestayCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Glass-Emerald CTA Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`#/destination/${dest.id}`);
            }}
            className="w-full bg-transparent border border-emerald-500/25 dark:border-emerald-500/35 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-extrabold py-2.5 px-4 rounded-xl text-xs cursor-pointer tracking-wider text-center flex items-center justify-center gap-1.5 uppercase font-mono shadow-[0_0_12px_rgba(16,185,129,0.02)] hover:shadow-[0_0_15px_rgba(16,185,129,0.12)] hover:-translate-y-[2px] transition-all duration-350 ease-out group/btn select-none"
          >
            <span>Explore Destination</span>
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1.5 inline-block">→</span>
          </button>
        </div>
      </div>
    );
  };

  // Section Carousel Renderer
  const renderScrollableSection = (
    title: string,
    subtitle: string,
    items: Destination[],
    filterType: string,
    icon: string
  ) => {
    if (items.length === 0) return null;
    const sectionId = `section-${filterType}`;

    return (
      <div className="space-y-4 relative py-6 border-b border-slate-100 dark:border-slate-900 last:border-0 select-none">
        <div className="flex items-end justify-between px-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">{icon}</span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
              {subtitle}
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 font-sans">
            <button
              onClick={() => handleViewAll(filterType)}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full transition-all"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
            
            <div className="hidden md:flex items-center gap-1.5">
              <button 
                onClick={() => {
                  const el = document.getElementById(sectionId);
                  if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className="bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById(sectionId);
                  if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className="bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div 
          id={sectionId}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          className="flex gap-5 overflow-x-auto snap-x scroll-smooth pb-4 pt-1 scrollbar-none select-none cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map(dest => (
            <div key={dest.id} className="snap-start shrink-0">
              {renderDestinationCard(dest, true)}
            </div>
          ))}
          <div className="min-w-[1px] shrink-0" />
        </div>
      </div>
    );
  };

  const isFilterActive = searchQuery !== '' || selectedState !== 'All' || selectedDistrict !== 'All' || selectedType !== 'All' || selectedExperience !== 'All' || selectedCategory !== 'All';

  // Reset infinite scroll items whenever filters or query change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, selectedState, selectedDistrict, selectedType, selectedExperience, selectedCategory, sortBy]);

  // Infinite scroll trigger on window scroll
  useEffect(() => {
    function handleScroll() {
      if (viewMode !== 'grid') return;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 350) {
        setVisibleCount(prev => prev + 6);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  // Helper safe images generator
  const getSafeImage = (image?: string) => {
    return image && image.trim() !== '' 
      ? image 
      : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop";
  };

  // --- Category Definition with matching calculation helper ---
  const categoriesList = [
    { 
      id: 'All', 
      label: 'All Escapes', 
      icon: '🌍', 
      badge: 'All Escapes',
      desc: 'All beautiful mountain destinations in HillyTrip',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Waterfalls', 
      label: 'Waterfalls', 
      icon: '💧', 
      badge: 'Cascades',
      desc: 'Beautiful mountain waterfalls and cascading streams',
      img: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Nature Escapes', 
      label: 'Forest Escapes', 
      icon: '🌲', 
      badge: 'Wilderness',
      desc: 'Enchanting green woodlands and deep mountain preserves',
      img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Tea Garden Destinations', 
      label: 'Tea Gardens', 
      icon: '☕', 
      badge: 'Organic Green',
      desc: 'Endless rolling green tea terraces under foggy skies',
      img: 'https://images.unsplash.com/photo-1555899434-94d1368aa712?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Monastery Circuits', 
      label: 'Monasteries', 
      icon: '🛕', 
      badge: 'Sacred Peace',
      desc: 'Spiritual cliffside temples with colorful prayer flags',
      img: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Photography Spots', 
      label: 'Photography', 
      icon: '📸', 
      badge: 'Scenic Views',
      desc: 'Aesthetic angles capturing the true spirit of nature',
      img: 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Hidden Gems', 
      label: 'Hidden Gems', 
      icon: '💎', 
      badge: 'Offbeat Spot',
      desc: 'Remote untouched valleys and secluded sanctuaries',
      img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Weekend Escapes', 
      label: 'Weekend Escapes', 
      icon: '🎒', 
      badge: 'Short Trip',
      desc: 'Perfect quick road trips and refreshing getaways',
      img: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Trekking Destinations', 
      label: 'Trekking Trails', 
      icon: '🥾', 
      badge: 'Alpine Ridge',
      desc: 'Scenic mountain passes and high panoramic ridge lines',
      img: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=1200&auto=format&fit=crop'
    },
    { 
      id: 'Family Friendly', 
      label: 'Family Friendly', 
      icon: '👨‍👩‍👧‍👦', 
      badge: 'Pleasant Stay',
      desc: 'Safe, pleasant, and highly accommodating family retreats',
      img: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1200&auto=format&fit=crop'
    }
  ];

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

  // Calculate unique states & districts dynamically
  const uniqueStates = Array.from(new Set(destinations.map(d => d.state).filter(Boolean))) as string[];
  const uniqueDistricts = Array.from(new Set(destinations.map(d => d.district).filter(Boolean))) as string[];
  const uniqueTypes = Array.from(new Set(destinations.map(d => d.tourismType).filter(Boolean))) as string[];

  // Experiences list
  const experiencesList = [
    'Peaceful Valleys',
    'Scenic Peaks',
    'Spiritual Trails',
    'Forest Wilderness',
    'Adrenaline & Adventure'
  ];

  // Helper matching experience rules
  const checkExperienceMatch = (dest: Destination, exp: string): boolean => {
    switch (exp) {
      case 'Peaceful Valleys':
        return ['valley', 'peace', 'calm', 'serene', 'quiet', 'offbeat'].some(k => (dest.description || '').toLowerCase().includes(k));
      case 'Scenic Peaks':
        return ['peak', 'summit', 'view', 'kanchenjunga', 'panoramic', 'snow', 'himalayan'].some(k => (dest.description || '').toLowerCase().includes(k));
      case 'Spiritual Trails':
        return ['monastery', 'gumpa', 'buddhist', 'temple', 'spiritual', 'shrine'].some(k => (dest.description || '').toLowerCase().includes(k));
      case 'Forest Wilderness':
        return ['forest', 'wildlife', 'national park', 'pine', 'nature', 'flora', 'sanctuary'].some(k => (dest.description || '').toLowerCase().includes(k));
      case 'Adrenaline & Adventure':
        return ['trek', 'trekking', 'adventure', 'climb', 'trail', 'camping', 'altitude'].some(k => (dest.description || '').toLowerCase().includes(k));
      default:
        return true;
    }
  };

  // --- Filtering & Sorting Engine ---
  const applyFilters = () => {
    let result = [...destinations];

    if (searchQuery.trim()) {
      // If we have live results loaded (or if typing has caught up), use them!
      // Otherwise, fall back to in-memory filter of original destinations to feel instant and responsive.
      if (liveDestinations.length > 0 || (debouncedSearchQuery === searchQuery.trim() && !isLoadingLive)) {
        result = [...liveDestinations];
      } else {
        const q = searchQuery.toLowerCase().trim();
        result = result.filter(d => 
          (d.name || '').toLowerCase().includes(q) ||
          (d.description || '').toLowerCase().includes(q) ||
          (d.tourismType || '').toLowerCase().includes(q) ||
          (d.state || '').toLowerCase().includes(q) ||
          (d.district || '').toLowerCase().includes(q)
        );
      }
    }

    // Category Swipe selection helper
    if (selectedCategory !== 'All') {
      result = result.filter(d => checkCategoryMatch(d, selectedCategory));
    }

    // State select filter
    if (selectedState !== 'All') {
      result = result.filter(d => d.state === selectedState);
    }

    // District select filter
    if (selectedDistrict !== 'All') {
      result = result.filter(d => d.district === selectedDistrict);
    }

    // Type select filter
    if (selectedType !== 'All') {
      result = result.filter(d => d.tourismType === selectedType);
    }

    // Experience select filter
    if (selectedExperience !== 'All') {
      result = result.filter(d => checkExperienceMatch(d, selectedExperience));
    }

    // Sorting block
    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.sort((a: any, b: any) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return destinations.indexOf(b) - destinations.indexOf(a);
      });
    } else if (sortBy === 'views') {
      result.sort((a, b) => (destinationStats[b.id] || 0) - (destinationStats[a.id] || 0));
    } else if (sortBy === 'trending') {
      result.sort((a, b) => {
        const scoreA = (destinationStats[a.id] || 0) + (likes.filter(l => l.contentId === a.id).length * 4);
        const scoreB = (destinationStats[b.id] || 0) + (likes.filter(l => l.contentId === b.id).length * 4);
        return scoreB - scoreA;
      });
    }

    return result;
  };

  const processedDestinations = applyFilters();
  const visibleDestinations = processedDestinations.slice(0, visibleCount);

  // Suggestions generator (prefer live results when searching)
  const autocompleteSuggestions = searchQuery.trim() 
    ? (liveDestinations.length > 0 ? liveDestinations : destinations.filter(d => 
        (d.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (d.tourismType || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
      )).slice(0, 5)
    : [];

  // Reset active map location if no longer matches filters
  useEffect(() => {
    if (activeMapDest && !processedDestinations.some(d => d.id === activeMapDest.id)) {
      setActiveMapDest(processedDestinations[0] || null);
    }
  }, [processedDestinations]);

  // Set default active pin when launching Map View
  useEffect(() => {
    if (viewMode === 'map' && !activeMapDest && processedDestinations.length > 0) {
      setActiveMapDest(processedDestinations[0]);
    }
  }, [viewMode, processedDestinations, activeMapDest]);

  // Handle share link copy helper
  const handleCopyLink = (destId: string) => {
    const link = `${window.location.origin}/#/destination/${destId}`;
    navigator.clipboard.writeText(link);
    if (setNotification) {
      setNotification({
        type: 'success',
        message: '🔗 Copied exclusive coordinates link to clipboard!'
      });
    }
  };

  return (
    <div className="w-full bg-slate-50/60 dark:bg-slate-950/20 text-slate-900 dark:text-slate-100">
      
      {/* 1. DISCOVERY HERO */}
      <div className="relative bg-slate-950 text-white py-12 md:py-16 px-4 md:px-8 text-center overflow-hidden min-h-[260px] md:min-h-[320px] flex flex-col justify-center items-center border-b border-slate-900/60 select-none">
        
        {/* Cinematic background video with image fallback */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* Fallback Static Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop')` }}
          />
          {isMounted && !videoError && (
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover object-center"
            >
              <source src="/videos/destinations-hero.webm" type="video/webm" />
              <source src="/videos/destinations-hero.mp4" type="video/mp4" />
            </video>
          )}
          {/* Subtle dark overlay so text remains readable */}
          <div className="absolute inset-0 z-10" style={{ backgroundColor: 'var(--hero-overlay, rgba(2, 6, 23, 0.45))' }} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/70 border border-white/20 text-emerald-300 text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Catalog Discovery Platform
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none" style={{ color: 'var(--hero-text, #ffffff)' }}>
            Explore Destinations
          </h1>
          <p className="text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto" style={{ color: 'var(--hero-text, #ffffff)', opacity: 0.9 }}>
            Discover villages, towns and hidden gems.
          </p>

          {/* Premium Search Bar */}
          <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto pt-4">
            <div className="flex items-center border rounded-2xl px-4 py-3 shadow-lg transition-all" style={{ backgroundColor: 'var(--hero-bg, rgba(15, 23, 42, 0.85))', borderColor: 'var(--border-color)' }}>
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input 
                type="text"
                placeholder="Search village, destinations, attractions or routes..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 placeholder-slate-400 text-sm sm:text-base font-semibold"
                style={{ color: 'var(--hero-text, #ffffff)' }}
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  className="p-1 rounded-full transition-colors cursor-pointer"
                  style={{ color: 'var(--hero-text, #cbd5e1)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions Drops Panel Overlay */}
            {showSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-xl z-55 overflow-hidden text-left divide-y divide-slate-100 dark:divide-slate-800">
                {autocompleteSuggestions.length === 0 ? (
                  <div className="px-4 py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <span>No matched coordinates located. Try another query phrase.</span>
                  </div>
                ) : (
                  autocompleteSuggestions.map(d => (
                    <div 
                      key={d.id}
                      onClick={() => {
                        navigate(`#/destination/${d.id}`);
                        setShowSuggestions(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <img src={getSafeImage(d.image)} alt={d.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block truncate">{d.name}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase font-mono">{d.tourismType}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ========================================================
          DISCOVER DESTINATIONS (PREMIUM Curated Lobby)
          ======================================================== */}
      {!isFilterActive && viewMode === 'grid' && (
        <div className="bg-slate-950 text-white py-12 border-y border-slate-900 overflow-hidden relative">
          {/* Subtle natural forest background lighting accents */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-950/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-950/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 space-y-12">
            {/* Display header with elegant typography */}
            <div className="space-y-2 select-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> Curated Collections
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-100">
                Discover Destinations
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Handpicked slopes and local secrets organized by real popularity, seasonal micro-climates, and scenic splendor to inspire your next Himalayan journey.
              </p>
            </div>

            {/* Render Six Curated, Fully Scrollable rows */}
            <div className="space-y-6">
              {renderScrollableSection(
                'Trending Destinations',
                'The most visited, commented, and shared escapes in our network.',
                trendingList,
                'trending',
                '🔥'
              )}

              {renderScrollableSection(
                'Most Loved',
                'Top-tier ratings and heartwarming hospitality highly recommended by travelers.',
                lovedList,
                'loved',
                '❤️'
              )}

              {renderScrollableSection(
                'Recently Captured',
                'Freshly shared photographs and logs directly from our community explorers.',
                capturedList,
                'captured',
                '📷'
              )}

              {renderScrollableSection(
                'Adventure Picks',
                'Challenging high alpine passes, off-road coordinates, and wild ridges.',
                adventureList,
                'adventure',
                '🎒'
              )}

              {renderScrollableSection(
                'Underrated Escapes',
                'Secluded treasures and hidden gems that deserve a spot on your bucket list.',
                underratedList,
                'underrated',
                '🔍'
              )}

              {/* Dynamic Seasonal Collection (The 6th Section) */}
              {renderScrollableSection(
                activeDynamicTheme.title,
                activeDynamicTheme.subtitle,
                dynamicList,
                'dynamic',
                activeDynamicTheme.icon
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. STICKY FILTERS & VIEW TOGGLE PANEL */}
      <div className="sticky top-[57px] z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-xs border-b border-slate-200/60 dark:border-slate-900 py-2.5 md:py-3.5 transition-all duration-300 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4">
          
          <div 
            className="flex overflow-x-auto md:flex-wrap items-center gap-2 flex-1 pb-1 md:pb-0 select-none scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* State selector */}
            <div className="relative shrink-0 w-36">
              <AutocompleteSelect
                id="filter-state"
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict('All'); // Reset district as they are hierarchical
                }}
                className="appearance-none font-sans text-[11px] md:text-xs font-bold bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-1.5 md:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-ellipsis"
              >
                <option value="All">All States</option>
                {uniqueStates.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </AutocompleteSelect>
            </div>

            {/* District Selector */}
            <div className="relative shrink-0 w-36">
              <AutocompleteSelect
                id="filter-district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="appearance-none font-sans text-[11px] md:text-xs font-bold bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-1.5 md:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-ellipsis"
              >
                <option value="All">All Districts</option>
                {uniqueDistricts
                  .filter(dst => selectedState === 'All' || destinations.some(d => d.state === selectedState && d.district === dst))
                  .map(dst => (
                    <option key={dst} value={dst}>{dst}</option>
                  ))
                }
              </AutocompleteSelect>
            </div>

            {/* Travel Experience Selector */}
            <div className="relative shrink-0 w-36">
              <AutocompleteSelect
                id="filter-experience"
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="appearance-none font-sans text-[11px] md:text-xs font-bold bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-1.5 md:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-ellipsis"
              >
                <option value="All">All Experiences</option>
                {experiencesList.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </AutocompleteSelect>
            </div>

            {/* Destination Slope Type Selector */}
            <div className="relative shrink-0 w-40">
              <AutocompleteSelect
                id="filter-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none font-sans text-[11px] md:text-xs font-bold bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-1.5 md:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-ellipsis"
              >
                <option value="All">All Tourism Types</option>
                {uniqueTypes.map(typ => (
                  <option key={typ} value={typ}>{typ}</option>
                ))}
              </AutocompleteSelect>
            </div>

            {/* Sort Order Selector */}
            <div className="relative shrink-0 w-40">
              <AutocompleteSelect
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none font-sans text-[11px] md:text-xs font-bold bg-slate-55 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-3 pr-7 py-1.5 md:py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-ellipsis"
              >
                <option value="name">A-Z Alphabetical</option>
                <option value="newest">Newest Guides</option>
                <option value="views">Most Viewed Clickrate</option>
                <option value="trending">Highest Trending Signals</option>
              </AutocompleteSelect>
            </div>

            {/* Active filters clear badge list */}
            {(selectedState !== 'All' || selectedDistrict !== 'All' || selectedType !== 'All' || selectedExperience !== 'All' || selectedCategory !== 'All' || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setSelectedState('All');
                  setSelectedDistrict('All');
                  setSelectedType('All');
                  setSelectedExperience('All');
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="shrink-0 text-[10px] text-rose-500 font-bold border border-rose-500/25 px-2.5 py-1.5 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer uppercase tracking-wider font-mono"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* VIEW SWITCHER TOGGLE (GRID VS MAP) */}
          <div className="flex border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-2xl p-1 items-center select-none shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5 shrink-0" /> Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] md:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5 shrink-0" /> Map View
            </button>
          </div>

        </div>
      </div>

      {/* 4. DYNAMIC EXPLORER PANELS */}
      <div ref={destinationGridRef} className="max-w-7xl mx-auto px-4 py-8">
        
        {/* COUNTER METRIC DISPLAY */}
        <div className="flex items-center justify-between mb-8 select-none">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {selectedCategory !== 'All' ? selectedCategory : 'Catalog Directory'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active Coordinates Matrix loaded {processedDestinations.length} out of {destinations.length} logged slopes
            </p>
          </div>
        </div>

        {/* --- GRID VIEW CONTENT GRID --- */}
        {viewMode === 'grid' && (
          <div className="space-y-12">
            {processedDestinations.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <Compass className="w-12 h-12 text-slate-350 mx-auto mb-3 animate-pulse" />
                <h4 className="font-extrabold text-slate-800 dark:text-white text-base">No Matching Coordinates Located</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                  We didn't locate destinations that matched the selection filters. Try resetting the criteria or typing a different search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedState('All');
                    setSelectedDistrict('All');
                    setSelectedType('All');
                    setSelectedExperience('All');
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="mt-6 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition duration-350 cursor-pointer shadow-sm"
                >
                  Clear Active Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
                {visibleDestinations.map(dest => renderDestinationCard(dest))}
              </div>
            )}

            {/* Infinite Scroll loading indicator */}
            {processedDestinations.length > visibleCount && (
              <div className="pt-8 text-center select-none pb-12">
                <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 shadow-xs">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin shrink-0" />
                  <span className="text-xs text-slate-500 font-bold font-mono">
                    Scrolled to view {visibleDestinations.length} of {processedDestinations.length} escapes. Loading more coordinates...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- MAP VIEW PANELS --- */}
        {viewMode === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[580px]">
            
            {/* Visual stylised Map Stage Canvas (Left-middle layout 2 grid rows cols) */}
            <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-950 rounded-3xl border border-slate-205 dark:border-slate-900 relative overflow-hidden flex flex-col justify-between h-[520px] lg:h-auto min-h-[460px] select-none">
              
              {/* Abs grid styling backdrop */}
              <div className="absolute inset-0 bg-radial-grid opacity-20 pointer-events-none z-0" />

              {/* Geographic Coordinates Compass Grid System (Top Right) */}
              <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[10px] text-slate-400 font-mono tracking-wide font-semibold shadow-xs">
                🧭 REGIONAL RANGE: {MIN_LAT}°N to {MAX_LAT}°N | {MIN_LON}°E to {MAX_LON}°E
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[10px] text-slate-500 space-y-2 font-mono shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                  <span>Explore Escape</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block animate-pulse" />
                  <span>Hidden Gem</span>
                </div>
              </div>

              {/* Geographical Interactive Pin Canvas Wrapper */}
              <div className="absolute inset-0 z-5 flex items-center justify-center p-8">
                <div className="w-full h-full relative border border-slate-200/40 dark:border-slate-800/25 rounded-2xl bg-slate-150/40 dark:bg-slate-900/35 overflow-hidden">
                  
                  {/* Subtle vector terrain styling lines (simulated topography paths) */}
                  <svg className="absolute inset-0 w-full h-full stroke-slate-250 dark:stroke-slate-800/50 fill-none opacity-40 z-0 pointer-events-none">
                    <path d="M50 150 Q 150 100, 250 180 T 450 120" strokeWidth="1.5" />
                    <path d="M100 280 Q 200 220, 350 310 T 550 240" strokeWidth="1" />
                    <path d="M20 380 Q 180 340, 280 410 T 480 320" strokeWidth="1.5" />
                    <path d="M150 50 Q 260 120, 380 40 T 520 110" strokeWidth="1" />
                    <circle cx="200" cy="180" r="100" strokeWidth="0.5" strokeDasharray="4 4" />
                    <circle cx="350" cy="240" r="60" strokeWidth="0.5" strokeDasharray="4 4" />
                  </svg>

                  {/* Projected Pins Mapping */}
                  {processedDestinations.map(d => {
                    const latVal = d.latitude || 27.03;
                    const lonVal = d.longitude || 88.26;

                    // Bound percentage coordinates
                    let xPct = ((lonVal - MIN_LON) / (MAX_LON - MIN_LON)) * 100;
                    let yPct = (1.0 - ((latVal - MIN_LAT) / (MAX_LAT - MIN_LAT))) * 100;

                    // Bound clamp
                    xPct = Math.max(7, Math.min(xPct, 93));
                    yPct = Math.max(7, Math.min(yPct, 93));

                    const isActivePin = activeMapDest?.id === d.id;

                    return (
                      <div 
                        key={d.id}
                        onClick={() => setActiveMapDest(d)}
                        style={{ left: `${xPct}%`, top: `${yPct}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group flex flex-col items-center select-none"
                      >
                        {/* Interactive glower circle */}
                        <div className="relative flex items-center justify-center">
                          {isActivePin && (
                            <span className="absolute inline-flex h-7 w-7 rounded-full bg-emerald-400 opacity-35 animate-ping" />
                          )}
                          <div className={`w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center transition-all shadow-md group-hover:scale-125 ${
                            isActivePin 
                              ? 'bg-emerald-500' 
                              : d.isHiddenGem 
                                ? 'bg-red-500 hover:bg-red-400' 
                                : 'bg-slate-700 hover:bg-emerald-500'
                          }`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        </div>

                        {/* Title Floating Tag */}
                        <div className={`mt-1 bg-slate-900/90 text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow-sm whitespace-nowrap transition-all opacity-80 group-hover:opacity-100 ${
                          isActivePin ? 'ring-1 ring-emerald-400 bg-slate-900 text-emerald-300' : 'text-slate-200'
                        }`}>
                          {d.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mini Help Notice */}
              <div className="absolute top-14 left-4 z-10 bg-emerald-950/20 dark:bg-emerald-550/10 border border-emerald-500/10 rounded-lg py-1 px-2.5 text-[8px] sm:text-[9px] text-emerald-800 dark:text-emerald-300 max-w-[260px] leading-tight select-none">
                💡 Tap on any geographical coordinate dot to show detailed stats preview card.
              </div>
            </div>

            {/* Map Preview Details Card Section (Column side panel layout) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-205 dark:border-slate-800 flex flex-col justify-between select-none">
              
              {activeMapDest ? (
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-44 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden relative shadow-inner shrink-0">
                      <img 
                        src={getSafeImage(activeMapDest.image)} 
                        alt={activeMapDest.name}
                        className="w-full h-full object-cover"
                      />
                      {activeMapDest.isHiddenGem && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-500/10 block font-mono">
                          💎 Hidden Gem
                        </span>
                      )}
                      
                      <span className="absolute bottom-3 left-3 bg-white/95 text-slate-800 font-bold text-[9px] py-0.5 px-2.5 rounded-full tracking-widest uppercase border border-slate-100">
                        🏕️ {activeMapDest.tourismType || 'Offbeat'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{activeMapDest.name}</h3>
                      <span className="text-xs font-semibold text-slate-500 block">
                        📍 {activeMapDest.district}, {activeMapDest.state}
                      </span>
                    </div>

                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed line-clamp-3">
                      {activeMapDest.description}
                    </p>

                    <div className="border-t border-slate-100 dark:border-slate-800 py-3 flex flex-wrap gap-3 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3.5 py-2 font-semibold">
                        🧭 {attractions.filter(a => a.destinationId === activeMapDest.id).length} Sights
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3.5 py-2 font-semibold">
                        🏡 {homestays.filter(h => h.destinationId === activeMapDest.id && h.status !== 'Rejected').length} Lodges
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl px-3.5 py-2 font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Taxi Stand
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(activeMapDest.id, 'destination')}
                      className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-600 hover:text-red-500 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-colors"
                      title="Like destination"
                    >
                      <Heart className={`w-4 h-4 ${user && likes.some(l => l.id === `${user.uid}_${activeMapDest.id}`) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    
                    <button
                      onClick={() => navigate(`#/destination/${activeMapDest.id}`)}
                      className="flex-1 bg-slate-950 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase transition-all shadow-sm"
                    >
                      Open Destination Page <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                  <Compass className="w-12 h-12 text-slate-300 animate-pulse" />
                  <h4 className="font-extrabold text-slate-600 dark:text-slate-300 text-sm">No Location Selected</h4>
                  <p className="text-[11px] leading-relaxed">
                    Select any regional markers on the vector map to retrieve statistics, attractions and lodging information coordinates.
                  </p>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
