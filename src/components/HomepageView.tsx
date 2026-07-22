import React, { useState, useEffect, useRef } from 'react';
import { AutocompleteSelect } from './AutocompleteSelect';
import { 
  Search, ArrowRight, MapPin, Compass, Sparkles, Home, Car, 
  Heart, Camera, MessageCircle, UploadCloud, Clock, Eye, Flame, Info, ChevronRight, Star, X, ChevronLeft,
  Check, Share2, Send, Bookmark, Flag, Calendar
} from 'lucide-react';
import { Destination, Attraction, Homestay, Route, Driver, Hub, ImageItem } from '../types';
import { getItemSlug } from '../utils/slug';
import { FeatureCarousel } from './FeatureCarousel';
import { ExperienceCarousel } from './ExperienceCarousel';
import { UniversalCarousel } from './UniversalCarousel';
import { doc, onSnapshot, db, uploadImageToFirebase, googleSignIn } from '../utils/firebase';
import { compressAndConvertToWebP } from '../utils/imageOptimizer';
import { motion, AnimatePresence } from 'motion/react';
import AiTravelPlannerModal from './AiTravelPlannerModal';

interface HomepageViewProps {
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  routes: Route[];
  drivers: Driver[];
  hubs: Hub[];
  likes: any[];
  publicPhotos: ImageItem[];
  destinationStats: Record<string, number>;
  attractionStats: Record<string, number>;
  toggleLike: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  navigate: (path: string) => void;
  user: any;
  searchFrom: string;
  setSearchFrom: (val: string) => void;
  searchTo: string;
  setSearchTo: (val: string) => void;
  handleRouteSearchSubmit: (e: React.FormEvent) => void;
  clickQuickSearchRoute: (fromId: string, toId: string) => void;
  setDestTypeFilter: (val: string) => void;
  setDestSearchQuery: (val: string) => void;
  setAttractionFilter: (val: string) => void;
  setAttractionSearchQuery: (val: string) => void;
  executeProtectedAction?: (actionName: string, actionCallback: () => void, requiresVerification?: boolean, serializableAction?: any) => void;
}

const formatWhatsAppNumber = (num: string) => {
  if (!num) return '';
  const cleaned = num.replace(/\D/g, '');
  if (cleaned.length === 10) return '91' + cleaned;
  return cleaned;
};

const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [count, setCount] = useState(0);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!element) return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  useEffect(() => {
    if (!isIntersecting) return;
    let startTimestamp: number | null = null;
    const duration = 1200;
    const startValue = 0;
    const endValue = value;

    let animId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * (endValue - startValue) + startValue));
      if (progress < 1) {
        animId = window.requestAnimationFrame(step);
      }
    };
    animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [isIntersecting, value]);

  return <span ref={setElement}>{count}</span>;
};

export const HomepageView: React.FC<HomepageViewProps> = ({
  destinations,
  attractions,
  homestays,
  routes,
  drivers,
  hubs,
  likes,
  publicPhotos,
  destinationStats,
  attractionStats,
  toggleLike,
  navigate,
  user,
  searchFrom,
  setSearchFrom,
  searchTo,
  setSearchTo,
  handleRouteSearchSubmit,
  clickQuickSearchRoute,
  setDestTypeFilter,
  setDestSearchQuery,
  setAttractionFilter,
  setAttractionSearchQuery,
  executeProtectedAction
}) => {
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Upload modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleContactAction = (e: React.MouseEvent, type: 'WhatsApp' | 'Call', targetUrl: string) => {
    e.preventDefault();
    if (executeProtectedAction) {
      executeProtectedAction(`contact homestay via ${type}`, () => {
        window.open(targetUrl, '_blank');
      }, false);
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const rawContext = sessionStorage.getItem('hillytrip_auth_context') || localStorage.getItem('hillytrip_auth_context');
        if (rawContext) {
          const context = JSON.parse(rawContext);
          if (context?.pendingAction?.serializable?.type === 'SHARE_MOMENT') {
            setIsUploadModalOpen(true);
          }
        }
      } catch (err) {}

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleMotionChange);

      const handleScroll = () => {
        setScrollY(window.scrollY);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            });
          },
          (err) => console.log('Location access declined or unavailable.')
        );
      }

      return () => {
        mediaQuery.removeEventListener('change', handleMotionChange);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [lightboxPhotosList, setLightboxPhotosList] = useState<any[]>([]);
  const [heroData, setHeroData] = useState<{ imageUrl?: string; videoUrl?: string }>({});
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/blogs?status=Published')
      .then(res => {
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          return res.json();
        }
        return [];
      })
      .then(data => setLatestBlogs(data.slice(0, 3)))
      .catch(err => console.log("Info - home blogs load handled:", err));
  }, []);

  // Premium Traveler Moments states
  const [localComments, setLocalComments] = useState<Record<string, { id: string; name: string; text: string; time: string; avatar?: string; replies?: any[]; }[]>>({});
  const [localReplies, setLocalReplies] = useState<Record<string, { id: string; name: string; text: string; time: string; }[]>>({});
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToName, setReplyToName] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Stable refs for smooth gestures across render cycles
  const dragStartXRef = useRef<number | null>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);
  const [savedPhotoIds, setSavedPhotoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hillytrip_saved_moments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [reportedPhotoIds, setReportedPhotoIds] = useState<string[]>(() => {
    try {
      const reported = localStorage.getItem('hillytrip_reported_moments');
      return reported ? JSON.parse(reported) : [];
    } catch {
      return [];
    }
  });
  const [reportModalPhotoId, setReportModalPhotoId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showPremiumToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  const handleSavePhoto = (photoId: string) => {
    let nextSaved: string[];
    if (savedPhotoIds.includes(photoId)) {
      nextSaved = savedPhotoIds.filter(id => id !== photoId);
      showPremiumToast('Removed moment from saved album', 'info');
    } else {
      nextSaved = [...savedPhotoIds, photoId];
      showPremiumToast('Saved moment to your personal album!', 'success');
    }
    setSavedPhotoIds(nextSaved);
    localStorage.setItem('hillytrip_saved_moments', JSON.stringify(nextSaved));
  };

  const handleReportPhoto = (photoId: string, reason: string) => {
    const nextReported = [...reportedPhotoIds, photoId];
    setReportedPhotoIds(nextReported);
    localStorage.setItem('hillytrip_reported_moments', JSON.stringify(nextReported));
    setReportModalPhotoId(null);
    showPremiumToast('Thank you. This moment has been flagged and sent for safety review.', 'success');
  };

  // Upload modal states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadDestId, setUploadDestId] = useState('');
  const [uploadAttrId, setUploadAttrId] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const unsubHero = onSnapshot(doc(db, 'homepage_content', 'hero'), (docSnap) => {
      if (docSnap.exists()) {
        setHeroData(docSnap.data() as any);
      }
    });
    return () => unsubHero();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setZoomScale(1);
    setZoomOrigin({ x: 50, y: 50 });
    setIsCommentsOpen(false);
    setAspectRatio(null);
    setReplyToCommentId(null);
    setReplyToName(null);
  }, [activeLightboxIndex]);

  useEffect(() => {
    if (activeLightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex(prev => (prev !== null && prev < lightboxPhotosList.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : lightboxPhotosList.length - 1));
      } else if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, lightboxPhotosList]);
  const [showHomeSuggestions, setShowHomeSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [liveStats, setLiveStats] = useState<{
    destinations: number;
    attractions: number;
    taxi_stands: number;
    homestays: number;
    travel_images: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/public-stats')
      .then(res => {
        const ct = res.headers.get('content-type');
        if (res.ok && ct && ct.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data) {
          setLiveStats({
            destinations: Number(data.destinations ?? 0),
            attractions: Number(data.attractions ?? 0),
            taxi_stands: Number(data.taxi_stands ?? 0),
            homestays: Number(data.homestays ?? 0),
            travel_images: Number(data.travel_images ?? 0)
          });
        }
      })
      .catch(err => {
        console.log('Info - live public stats fetch handled:', err);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowHomeSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCountVal = (primary: number | undefined | null, fallbackArray: any[] | undefined | null): string | number => {
    if (primary !== undefined && primary !== null && !isNaN(primary)) {
      return primary;
    }
    if (fallbackArray !== undefined && fallbackArray !== null) {
      return fallbackArray.length;
    }
    return 'Not available';
  };

  const getCountNumber = (primary: number | undefined | null, fallbackArray: any[] | undefined | null): number => {
    if (primary !== undefined && primary !== null && !isNaN(primary)) {
      return Number(primary);
    }
    if (fallbackArray !== undefined && fallbackArray !== null) {
      return fallbackArray.length;
    }
    return 0;
  };

  const getSpotOfTheDay = () => {
    if (destinations.length === 0) return null;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % destinations.length;
    return destinations[index];
  };

  const handleSurpriseMe = () => {
    const pool: { type: 'destination' | 'attraction'; id: string; isHidden?: boolean }[] = [];
    destinations.forEach(d => {
      pool.push({ type: 'destination', id: d.id, isHidden: d.isHiddenGem });
    });
    attractions.forEach(a => {
      pool.push({ type: 'attraction', id: a.id, isHidden: a.isHiddenGem });
    });

    if (pool.length === 0) return;

    const hiddenGems = pool.filter(p => p.isHidden);
    let selected;

    if (hiddenGems.length > 0 && Math.random() < 0.7) {
      const randomIndex = Math.floor(Math.random() * hiddenGems.length);
      selected = hiddenGems[randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * pool.length);
      selected = pool[randomIndex];
    }

    if (selected.type === 'destination') {
      navigate(`#/destination/${getItemSlug(selected)}`);
    } else {
      navigate(`#/attraction/${getItemSlug(selected)}`);
    }
  };

  const scoredPhotos = [
    ...publicPhotos.map(img => {
      const parentDest = destinations.find(d => d.id === img.destinationId || d.id === img.entityId);
      const parentAttr = img.attractionId ? attractions.find(a => a.id === img.attractionId) : null;
      const likeCount = likes.filter(l => l.contentId === img.id).length;
      return {
        id: img.id,
        url: img.url,
        caption: img.caption || img.altText || "Panoramic Mountain Escape",
        photographer: img.uploadedBy || "Local Traveler",
        destinationId: img.destinationId || img.entityId || "darjeeling",
        destinationName: parentDest ? parentDest.name : "Mountain Range",
        attractionId: img.attractionId || null,
        attractionName: parentAttr ? parentAttr.name : null,
        likes: likeCount,
        uploadDate: img.uploadDate || new Date().toISOString()
      };
    }),
    ...destinations.slice(0, 10).map((d, index) => {
      const likeCount = likes.filter(l => l.contentId === d.id).length;
      const photographers = ["Amit Sharma", "Sandro Lepcha", "Siddharth Sen", "Priyanjali Das", "Mingma Sherpa", "Anjali Bhutia", "Sanjay Lama", "Pooja Gurung", "Vikram Roy", "Nayan Pradhan"];
      const captions = [
        "Serene mist draping the quiet forest slope and pine branches",
        "Spellbinding golden sunrise rays bathing the snow peaks",
        "Verdant layered tea hills floating under cotton candy clouds",
        "Tranquil mountain retreat with colorful flags and wind chimes",
        "Hidden glacial waterfall bouncing off giant wet mossy rocks",
        "Charming forest homestay nestled among rhododendron blooms",
        "Stunning high ridge viewpoint overlooking deep mist-filled valleys",
        "A peaceful winding road carving inside alpine conifer tree canopies",
        "Epic mountain path leading to an ancient monastic sanctuary",
        "Mystical high altitude freshwater lake reflecting deep blue sky lines"
      ];
      return {
        id: `prebuilt-photo-${d.id}`,
        url: d.image,
        caption: captions[index % captions.length] || "Exquisite Himalayan Ridge View",
        photographer: photographers[index % photographers.length] || "Regional Guide",
        destinationId: d.id,
        destinationName: d.name,
        likes: likeCount + 8 + (index * 2),
        uploadDate: new Date(Date.now() - index * 8 * 3600 * 1000).toISOString()
      };
    })
  ]
  .filter((img, idx, self) => self.findIndex(t => t.url === img.url) === idx)
  .filter(img => !reportedPhotoIds.includes(img.id))
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 10);

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <div className="relative h-screen min-h-[600px] flex flex-col justify-center items-center text-center px-4 md:px-8 bg-slate-950 text-white overflow-hidden">
        {/* background video with overlay */}
        <div 
          className="absolute inset-0 z-0 select-none pointer-events-none transition-transform duration-100 ease-out"
          style={{
            transform: prefersReducedMotion ? 'none' : `translateY(${scrollY * 0.3}px)`,
          }}
        >
          {/* Fallback Static Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
            style={{ backgroundImage: `url('${heroData.imageUrl || "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop"}')` }}
          />
          {isMounted && !videoError && (heroData.videoUrl || (!heroData.imageUrl && !heroData.videoUrl)) && (
            <video 
              key={heroData.videoUrl || "/videos/home-hero.mp4"}
              autoPlay 
              loop 
              muted 
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[1.05]"
            >
              {heroData.videoUrl ? (
                <source src={heroData.videoUrl} />
              ) : (
                <>
                  <source src="/videos/home-hero.webm" type="video/webm" />
                  <source src="/videos/home-hero.mp4" type="video/mp4" />
                </>
              )}
            </video>
          )}
          {/* No heavy gradient overlay; keeps mountain colors ultra-vibrant, clear, and visible */}
          <div className="absolute inset-0 z-10 bg-black/15" />
        </div>
 
        {/* Content layout - Centered both vertically and horizontally with luxury whitespace */}
        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center justify-center px-4">
          {/* Heading */}
          <motion.h1 
            className="font-serif-luxury font-bold text-[50px] xs:text-[54px] sm:text-[60px] md:text-[84px] lg:text-[90px] text-white select-none leading-[0.95] tracking-[-0.03em] mb-8 max-w-[320px] sm:max-w-4xl text-center"
            style={{ 
              textShadow: '0 4px 20px rgba(0,0,0,0.18)'
            }}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block">Some <span className="hidden sm:inline">Journeys</span></span>
            <span className="block sm:hidden">Journeys</span>
            <span className="block">Can't Be Planned</span>
            
            {/* Elegant, subtle luxury editorial ornament */}
            <span className="flex items-center justify-center gap-4 mt-6 opacity-65">
              <span className="h-[1px] w-16 bg-gradient-to-r from-transparent to-white/40" />
              <span className="w-2.5 h-2.5 border border-white/50 rotate-45 flex items-center justify-center">
                <span className="w-1 h-1 bg-white/70 rounded-full" />
              </span>
              <span className="h-[1px] w-16 bg-gradient-to-l from-transparent to-white/40" />
            </span>
          </motion.h1>
 
          {/* Subheading */}
          <motion.p 
            className="text-[18px] md:text-[24px] font-medium text-white/95 mt-6 mb-9 select-none font-sans tracking-wide text-center"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          >
            Let HillyTrip Plan Yours
          </motion.p>
 
          {/* Primary CTA with premium styling and animations */}
          <motion.button
            onClick={() => setIsAiPlannerOpen(true)}
            className="w-[88%] sm:w-auto px-[36px] h-[58px] bg-gradient-to-r from-[#14D8A7] to-[#1ECF8B] hover:from-[#11c496] hover:to-[#1bba7d] text-slate-950 font-extrabold text-sm uppercase tracking-[0.15em] rounded-full shadow-[0_8px_24px_rgba(20,216,167,0.25)] hover:shadow-[0_12px_30px_rgba(20,216,167,0.4)] hover:-translate-y-[3px] cursor-pointer outline-hidden transition-all duration-300 relative group/btn border border-white/20 active:scale-95 flex items-center justify-center gap-2"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
          >
            {/* Soft inner glass highlight */}
            <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <span className="relative flex items-center justify-center gap-2">
              <span className="text-base">✨</span>
              <span>Plan My Trip with AI</span>
            </span>
          </motion.button>
        </div>
 
        {/* AI Travel Planner modal component */}
        <AiTravelPlannerModal 
          isOpen={isAiPlannerOpen}
          onClose={() => setIsAiPlannerOpen(false)}
          userLocation={userCoords}
        />
      </div>

      {/* 2. EXPLORE HILLYTRIP (CAROUSEL OF GATEWAY EXPERIENCES) */}
      <div className="bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        <FeatureCarousel 
          destinationsCount={destinations.length}
          attractionsCount={attractions.length}
          driversCount={drivers.length}
          homestaysCount={homestays.length}
          navigate={navigate}
        />
      </div>

      {/* 3. WEEKEND ESCAPES (TOP POPULAR DESTINATIONS) */}
      <div className="py-16 bg-white dark:bg-slate-900 transition-colors duration-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">Recommended Weekend Outings</span>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100 tracking-tight mt-1">Weekend Escapes</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Popular high-engagement spots with rapid transit routes from major hubs.</p>
            </div>
            <button 
              onClick={() => navigate('#/destinations')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 group shrink-0 cursor-pointer"
            >
              View All Destinations <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Horizontal Netflix Carousel */}
          <UniversalCarousel
            items={(() => {
              const sorted = [...destinations]
                .map(d => {
                  const likeCount = likes.filter(l => l.contentId === d.id).length;
                  const score = (likeCount * 15) + (destinationStats[d.id] || 0) * 2;
                  return { ...d, score, likeCount };
                })
                .sort((a, b) => b.score - a.score)
                .slice(0, 8);
              return sorted;
            })()}
            visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
            autoPlayInterval={7200}
            renderItem={(d) => {
              const viewCount = destinationStats[d.id] || 0;
              // Generate stable traveler ratings and review counts deterministic of name properties
              const ratingValue = (4.5 + ((d.name.charCodeAt(0) + (d.name.charCodeAt(d.name.length - 1) || 0)) % 5) * 0.1).toFixed(1);
              const ratingNum = parseFloat(ratingValue);
              const reviewsCount = ((d.name.charCodeAt(1) + (d.name.charCodeAt(2) || 0)) % 35) + 12;

              return (
                <div 
                  key={d.id}
                  onClick={() => navigate(`#/destination/${getItemSlug(d)}`)}
                  className="w-full h-[410px] sm:h-[430px] group rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850/80 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-850 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Image Area with enhanced clarity */}
                  <div className="relative h-44 shrink-0 overflow-hidden bg-slate-900">
                    <img 
                      src={d.image} 
                      alt={d.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 filter brightness-[1.03] contrast-[1.03] saturate-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-amber-400 dark:text-amber-300 uppercase tracking-wider shadow-xs flex items-center gap-1 border border-amber-500/10">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" /> Popular Choice
                    </div>
                  </div>
                  
                  {/* Content Area with matching heights */}
                  <div className="p-4 flex-grow flex flex-col justify-between bg-white dark:bg-slate-950">
                    <div className="flex-grow flex flex-col">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-mono uppercase tracking-widest block">{d.district}, {d.state}</span>
                      <h3 className="font-display font-extrabold text-base md:text-lg text-slate-900 dark:text-slate-100 mt-1 line-clamp-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-200 leading-snug">{d.name}</h3>
                      
                      {/* Rating block */}
                      <div className="flex items-center gap-1.5 mt-1.5 mb-2 text-xs">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 ${star <= Math.round(ratingNum) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'}`} 
                            />
                          ))}
                        </div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{ratingValue}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-medium text-[11px]">({reviewsCount} reviews)</span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed flex-grow">{d.description}</p>
                    </div>

                    {/* CTA & stats block */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900/80 flex items-center justify-between shrink-0">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1 uppercase tracking-wider font-mono">
                        Explore Guide <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                      </span>
                      <div className="flex items-center gap-2.5 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1 hover:text-rose-500 transition-colors"><Heart className="w-3.5 h-3.5 text-rose-500/80" /> {d.likeCount}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* 4. SPOT OF THE DAY */}
      {(() => {
        const spotDest = getSpotOfTheDay();
        if (!spotDest) return null;

        const spotAttractionsCount = attractions.filter(a => a.destinationId === spotDest.id || a.nearestDestinationId === spotDest.id).length;
        const spotHomestaysCount = homestays.filter(h => h.destinationId === spotDest.id || h.nearestDestinationId === spotDest.id).length;

        return (
          <div className="py-16 bg-slate-50 dark:bg-slate-950/40 border-t border-b border-slate-100 dark:border-slate-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4">
              <div className="mb-8">
                <span className="text-xs font-extrabold text-teal-500 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="inline-block animate-pulse w-2 h-2 rounded-full bg-teal-500"></span>
                  Daily Featured Inspiration
                </span>
                <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                  🌟 Spot of the Day
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Handpicked destinations updated automatically every 24 hours to inspire your next Himalayan escape.
                </p>
              </div>

              {/* Large Featured Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/25 dark:border-emerald-500/30 ring-4 ring-emerald-500/5 dark:ring-emerald-500/5 shadow-md hover:shadow-2xl hover:border-emerald-500/40 dark:hover:border-emerald-500/50 hover:ring-emerald-500/10 dark:hover:ring-emerald-500/10 transition-all duration-300 ease-out overflow-hidden relative group/card">
                {/* Subtle top ambient glowing line for the daily highlight */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-sky-500 opacity-80 animate-pulse" />
                
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left: Image */}
                  <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] overflow-hidden group">
                    <img
                      src={spotDest.image}
                      alt={spotDest.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 filter brightness-[1.07] contrast-[1.02] saturate-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-slate-950/10 lg:to-slate-950/35" />
                    
                    {/* Floating pill: Today's Selection */}
                    <div className="absolute top-6 left-6 bg-slate-950/90 dark:bg-slate-900/95 text-emerald-400 dark:text-emerald-300 border border-emerald-500/40 px-4 py-2 rounded-full text-xs font-mono font-extrabold tracking-widest shadow-xl shadow-emerald-500/10 flex items-center gap-2 z-10 select-none transition-all duration-300 hover:scale-[1.03] hover:border-emerald-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      TODAY'S SELECTION
                    </div>
                  </div>

                  {/* Right: Info */}
                  <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white dark:bg-slate-900">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        {spotDest.district}, {spotDest.state}
                      </div>
                      <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-none mb-4 group-hover/card:text-emerald-500 dark:group-hover/card:text-emerald-400 transition-colors duration-200">
                        {spotDest.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                        {spotDest.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-slate-100 dark:border-slate-800/80 mb-8">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">Attractions</div>
                          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
                            {spotAttractionsCount}
                          </div>
                          <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-sans font-medium">Points of interest</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">Homestays</div>
                          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
                            {spotHomestaysCount}
                          </div>
                          <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-sans font-medium">Host families</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">Taxi Service</div>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2.5 flex items-center gap-1 font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                            {spotDest.nearestTaxiStand ? 'Stand Active' : 'Available'}
                          </div>
                          <div className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 truncate max-w-full font-sans font-medium">
                            {spotDest.nearestTaxiStand ? spotDest.nearestTaxiStand : 'Nearby stand'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => navigate(`#/destination/${getItemSlug(spotDest)}`)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-emerald-600 dark:bg-slate-100 dark:hover:bg-emerald-500 text-white dark:text-slate-900 dark:hover:text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer text-xs tracking-wider uppercase font-mono"
                      >
                        Explore Destination <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. HIDDEN GEMS (OFFBEAT MICRO-LOCATIONS) */}
      <div className="py-16 bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-150/40 dark:border-slate-900/60 transition-colors duration-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold text-rose-500 dark:text-rose-400 uppercase tracking-widest">Secret Escapes & Uncharted Sights</span>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100 tracking-tight mt-1">Hidden Gems</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Quiet pristine sanctuaries untouched by regular mainstream tourists.</p>
            </div>
            <button 
              onClick={() => {
                setDestTypeFilter('All');
                setDestSearchQuery('');
                navigate('#/destinations');
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 group shrink-0 cursor-pointer"
            >
              View All Hidden Gems <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Horizontal Netflix Carousel */}
          <UniversalCarousel
            items={(() => {
              const gems = destinations
                .filter(d => 
                  d.isHiddenGem !== false || 
                  (d.tourismType || '').toLowerCase().includes('offbeat') ||
                  (d.tourismType || '').toLowerCase().includes('village')
                )
                .slice(0, 8);
              return gems;
            })()}
            visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
            autoPlayInterval={7500}
            renderItem={(g: any) => {
              const lCount = likes.filter(l => l.contentId === g.id).length;
              return (
                <div 
                  key={g.id}
                  onClick={() => navigate(`#/destination/${getItemSlug(g)}`)}
                  className="w-full h-[390px] sm:h-[410px] group rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850/80 shadow-xs hover:shadow-xl hover:shadow-rose-500/5 hover:border-rose-500/30 dark:hover:border-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div className="relative h-44 shrink-0 overflow-hidden bg-slate-900">
                    <img 
                      src={g.image} 
                      alt={g.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 filter brightness-[1.04] contrast-[1.02] saturate-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                    <div className="absolute top-3 left-3 bg-rose-600/95 dark:bg-rose-700/90 backdrop-blur-md border border-rose-400/20 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm flex items-center gap-1 animate-pulse">
                      ✨ 100% Offbeat
                    </div>
                  </div>
                  
                  <div className="p-4 flex-grow flex flex-col justify-between bg-white dark:bg-slate-950">
                    <div className="flex-grow flex flex-col">
                      <div className="text-[10px] text-rose-500 dark:text-rose-400 font-bold font-mono uppercase tracking-widest block">Remote Oasis</div>
                      <h3 className="font-display font-extrabold text-base md:text-lg text-slate-900 dark:text-slate-100 mt-1 line-clamp-1 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors duration-200 leading-snug">{g.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed flex-grow">{g.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900/80 flex items-center justify-between shrink-0 text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500">
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">🏝️ Quiet & Pristine</span>
                      <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 hover:scale-105 transition-transform"><Heart className="w-3.5 h-3.5 fill-rose-500/10 text-rose-500" /> {lCount + 3} Saves</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* 6. TRAVELER MOMENTS (TOP 10 MOST LOVED TRAVELER PHOTOS) */}
      <div id="traveler-moments" className="py-16 bg-white dark:bg-slate-950 transition-colors duration-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                <Camera className="w-4 h-4 text-rose-500" /> Live Traveler Gallery
              </span>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100 tracking-tight mt-1">Traveler Moments</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Stunning real visitor snapshots. Swipe to explore the raw beauty of Indian hills.</p>
            </div>
            
            <button 
              onClick={() => {
                if (executeProtectedAction) {
                  executeProtectedAction('Share Your Moment', () => {
                    setIsUploadModalOpen(true);
                  }, false, {
                    type: 'SHARE_MOMENT',
                    payload: {}
                  });
                } else {
                  setIsUploadModalOpen(true);
                }
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer scale-100 hover:scale-[1.03] active:scale-[0.97]"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400 dark:text-white" /> Share Your Moment
            </button>
          </div>

          {/* Horizontal Instagram-like Carousel */}
          <UniversalCarousel
            items={scoredPhotos}
            visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4 }}
            autoPlayInterval={7500}
            renderItem={(photo, idx) => {
              const isLiked = user && likes.some(l => l.id === `${user.uid}_${photo.id}`);
              const viewsCount = (photo.likes * 14) + ((photo.id.charCodeAt(photo.id.length - 1) || 9) * 3) + 75;
              const commentsCount = (localComments[photo.id]?.length || 0) + (((photo.id.charCodeAt(2) || 4) % 6) + 3);

              return (
                <motion.div 
                  key={photo.id}
                  whileHover={{ scale: 1.025, y: -4 }}
                  whileTap={{ scale: 0.975 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="w-full aspect-[4/5] group rounded-3xl bg-slate-950 border border-slate-200/80 dark:border-slate-850/80 shadow-md hover:shadow-2xl transition-all duration-350 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Image section taking 93% height */}
                  <div 
                    onClick={() => {
                      setLightboxPhotosList(scoredPhotos);
                      setActiveLightboxIndex(idx);
                    }}
                    className="relative h-[93%] w-full overflow-hidden select-none bg-slate-950 group-hover:opacity-95"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[1.04] contrast-[1.01] saturate-[1.04]"
                    />
                    
                    {/* Bottom gradient overlay for text legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none z-10" />
                    
                    {/* Top Left: Photographer Info badge */}
                    <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white font-bold shadow-sm">
                      <span>📷</span>
                      <span className="max-w-[90px] truncate">{photo.photographer}</span>
                    </div>

                    {/* Top Right: Floating Like button inside glass circle */}
                    <div className="absolute top-3.5 right-3.5 z-20">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await toggleLike(photo.id, 'photo');
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 hover:scale-110 active:scale-90 shadow-lg cursor-pointer ${
                          isLiked 
                            ? 'bg-rose-500 border-rose-400 text-white shadow-rose-500/20' 
                            : 'bg-black/45 hover:bg-rose-500/20 border-white/20 backdrop-blur-md text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white text-white' : 'text-rose-500'}`} />
                      </button>
                    </div>

                    {/* Bottom Left: Location overlay with location icon */}
                    <div className="absolute bottom-3.5 left-3.5 z-20 text-left pointer-events-auto">
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          const destObj = destinations.find(d => d.id === photo.destinationId);
                          const destSlug = destObj ? getItemSlug(destObj) : getItemSlug(photo.destinationName);
                          navigate(`#/destination/${destSlug}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/45 hover:bg-black/60 border border-white/15 backdrop-blur-md text-[9px] font-black text-emerald-300 hover:text-emerald-200 uppercase tracking-widest cursor-pointer transition-colors shadow-sm"
                      >
                        <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                        {photo.destinationName}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Bar: consistent 7% height displaying social metrics */}
                  <div className="h-[7%] w-full bg-slate-950/95 dark:bg-slate-950 border-t border-white/5 grid grid-cols-3 items-center justify-items-center text-[10px] font-mono font-bold text-slate-400 select-none shrink-0">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" /> {photo.likes}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <MessageCircle className="w-3.5 h-3.5 text-sky-400" /> {commentsCount}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> {viewsCount}
                    </span>
                  </div>
                </motion.div>
              );
            }}
          />
        </div>
      </div>

      {/* 7. SURPRISE ME */}
      <div className="py-16 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white/95 dark:bg-slate-950/90 border border-slate-200/80 dark:border-white/15 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15),0_0_40px_rgba(255,255,255,0.9)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_30px_rgba(255,255,255,0.04)] ring-1 ring-white/20 dark:ring-white/5 rounded-3xl p-8 sm:p-14 relative overflow-hidden group/surprise">
            {/* Background ambient glowing light blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl opacity-70" />
              <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl opacity-70" />
            </div>

            {/* Premium Interactive Landscape Illustration with Moving Clouds & Fog */}
            <div className="absolute inset-0 z-0 opacity-45 dark:opacity-65 pointer-events-none select-none overflow-hidden">
              <svg className="absolute w-0 h-0" aria-hidden="true">
                <defs>
                  <linearGradient id="mountain-grad-light" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="mountain-grad-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="mountain-mid-light" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#475569" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="mountain-mid-dark" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#020617" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Back Mountain Ridge (Soft Blurred Silhouette) */}
              <svg className="absolute bottom-0 left-0 w-full h-36 dark:hidden blur-[1.5px]" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="url(#mountain-grad-light)" d="M0,192L120,170.7C240,149,480,107,720,128C960,149,1200,235,1320,277.3L1440,320L1440,320L0,320Z"></path>
              </svg>
              <svg className="absolute bottom-0 left-0 w-full h-36 hidden dark:block blur-[1.5px]" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="url(#mountain-grad-dark)" d="M0,192L120,170.7C240,149,480,107,720,128C960,149,1200,235,1320,277.3L1440,320L1440,320L0,320Z"></path>
              </svg>

              {/* Slow Moving Cloud Layer 1 */}
              <div className="absolute top-12 left-1/4 w-96 h-20 text-slate-200 dark:text-slate-800/60 animate-cloud-slow">
                <svg viewBox="0 0 100 30" fill="currentColor" className="w-full h-full opacity-60">
                  <path d="M10 20 a 10 10 0 0 1 15 -8 a 15 15 0 0 1 28 0 a 10 10 0 0 1 15 8 a 8 8 0 0 1 16 0 a 5 5 0 0 1 10 0 a 2 2 0 0 1 4 0 v 5 h -88 z" />
                </svg>
              </div>

              {/* Mid Mountain Ridge (Contrasty, Clear Silhouette) */}
              <svg className="absolute bottom-0 left-0 w-full h-24 dark:hidden" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="url(#mountain-mid-light)" d="M0,224L180,192C360,160,720,96,1080,144C1260,168,1380,245,1440,288L1440,320L0,320Z"></path>
              </svg>
              <svg className="absolute bottom-0 left-0 w-full h-24 hidden dark:block" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="url(#mountain-mid-dark)" d="M0,224L180,192C360,160,720,96,1080,144C1260,168,1380,245,1440,288L1440,320L0,320Z"></path>
              </svg>

              {/* Fast Moving Cloud Layer 2 */}
              <div className="absolute top-24 right-1/4 w-80 h-16 text-slate-300 dark:text-slate-800/40 animate-cloud-fast">
                <svg viewBox="0 0 100 30" fill="currentColor" className="w-full h-full opacity-50">
                  <path d="M10 20 a 10 10 0 0 1 15 -8 a 15 15 0 0 1 28 0 a 10 10 0 0 1 15 8 h -58 z" />
                </svg>
              </div>

              {/* Pine tree outlines on bottom ridges (More visible & richer colors) */}
              <div className="absolute bottom-0 left-10 flex gap-4 text-slate-400 dark:text-slate-700/80">
                {[1, 2, 3].map((_, i) => (
                  <svg key={i} className="w-8 h-12" viewBox="0 0 20 40" fill="currentColor">
                    <polygon points="10,0 20,25 0,25" />
                    <polygon points="10,8 18,28 2,28" />
                    <rect x="9" y="28" width="2" height="12" />
                  </svg>
                ))}
              </div>
              <div className="absolute bottom-0 right-16 flex gap-3 text-slate-400/90 dark:text-slate-700/90">
                {[1, 2].map((_, i) => (
                  <svg key={i} className="w-10 h-16" viewBox="0 0 20 40" fill="currentColor">
                    <polygon points="10,0 20,25 0,25" />
                    <polygon points="10,8 18,28 2,28" />
                    <rect x="9" y="28" width="2" height="12" />
                  </svg>
                ))}
              </div>

              {/* Pulsing Fog / Mist Layer at the valley floor */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-slate-950 via-white/80 dark:via-slate-950/85 to-transparent animate-pulse-fog mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
              {/* Refined Badge Styling */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/40 dark:border-emerald-500/35 px-4 py-1.5 rounded-full text-[10.5px] font-mono font-black text-emerald-700 dark:text-emerald-300 tracking-wider uppercase mb-6 shadow-xs select-none hover:border-emerald-400/50 transition-colors duration-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Instant Discovery Engine</span>
              </div>

              <h3 className="font-display font-black text-2xl sm:text-4xl text-slate-950 dark:text-white tracking-tight leading-tight drop-shadow-sm">
                Can't decide where to go?
              </h3>
              <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium mt-4 leading-relaxed mb-8 max-w-md">
                Unshackle your itinerary. Let our regional recommendation engine select an offbeat Himalayan peak, secluded monastery, or hidden riverside sanctuary for you instantly.
              </p>
              
              {/* Premium Highly Prominent CTA Button with subtle hover/tap animation */}
              <button
                onClick={handleSurpriseMe}
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-extrabold px-10 py-4 rounded-2xl shadow-lg shadow-emerald-500/15 hover:shadow-2xl hover:shadow-emerald-500/25 ring-1 ring-emerald-400/20 hover:ring-emerald-400/40 hover:-translate-y-[1px] hover:scale-[1.04] active:scale-[0.96] active:translate-y-[1px] transition-all duration-200 cursor-pointer text-xs tracking-wider uppercase font-mono"
              >
                <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-200" />
                <span className="relative flex items-center gap-2">
                  <span className="group-hover:rotate-12 transition-transform duration-300 inline-block text-base">🎲</span>
                  <span>Surprise Me</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. EXPLORE BY EXPERIENCE */}
      <div className="bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-150/40 dark:border-slate-900/60 transition-colors duration-200 overflow-hidden">
        <ExperienceCarousel 
          setDestTypeFilter={setDestTypeFilter}
          setDestSearchQuery={setDestSearchQuery}
          setAttractionFilter={setAttractionFilter}
          setAttractionSearchQuery={setAttractionSearchQuery}
          navigate={navigate}
          destinations={destinations}
        />
      </div>

      {/* 7. FEATURED HOMESTAYS (DATABASE-DRIVEN BOOKING CAROUSEL) */}
      <div id="featured-homestays-section" className="py-16 bg-white dark:bg-slate-900 transition-colors duration-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold text-amber-500 dark:text-amber-400 uppercase tracking-widest">Verified Rural Eco-Lodges</span>
              <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100 tracking-tight mt-1">Featured Homestays</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Direct verification badges. No hidden portals — connect straight with the host families!</p>
            </div>
            
            <button 
              onClick={() => navigate('#/register/homestay')}
              className="px-4 py-2 border border-amber-500/30 text-amber-500 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/5 transition-all cursor-pointer"
            >
              🏡 Register Your Homestay
            </button>
          </div>

          {/* Horizontal Netflix Carousel */}
          {(() => {
            const activeHomes = homestays.slice(0, 8);
            if (activeHomes.length === 0) {
              return (
                <div className="w-full text-center py-12 text-slate-450 font-bold bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200">
                  🏡 Homestays portal loading. Standard verification registers running active...
                </div>
              );
            }

            return (
              <UniversalCarousel
                items={activeHomes}
                visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
                autoPlayInterval={7800}
                renderItem={(home: any) => {
                  const parentDest = destinations.find(d => d.id === home.destinationId);
                  const ratingVal = (5.0 - (((home.id.charCodeAt(0) || 5) % 5) * 0.1)).toFixed(1);
                  const reviewCount = ((home.id.charCodeAt(1) || 4) % 15) + 8;

                  return (
                    <div 
                      key={home.id}
                      className="w-full h-[410px] sm:h-[430px] group rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850/80 shadow-xs hover:shadow-xl hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out flex flex-col overflow-hidden cursor-pointer"
                    >
                      <div className="relative h-44 shrink-0 overflow-hidden bg-slate-900">
                        <img 
                          src={home.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop"} 
                          alt={home.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 filter brightness-[1.08] contrast-[1.01] saturate-[1.05]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                        
                        <span className="absolute top-3 left-3 bg-emerald-500 dark:bg-emerald-600 text-slate-950 dark:text-white px-2.5 py-1 rounded-md text-[9px] font-mono font-black uppercase tracking-wider shadow-sm z-10">
                          ✓ Verified Host
                        </span>

                        {/* Traveler Rating Badge on Image */}
                        <span className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm z-10 select-none">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {ratingVal} <span className="text-slate-400">({reviewCount})</span>
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between h-[calc(100%-11rem)]">
                        <div className="flex-grow text-left">
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono tracking-widest font-black uppercase flex items-center gap-1.5">
                            <span>📍</span> {parentDest ? parentDest.name : "High Ridges"} rural stay
                          </div>
                          <h3 
                            onClick={() => navigate(`#/homestay/${getItemSlug(home)}`)}
                            className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white mt-1.5 line-clamp-1 hover:text-amber-500 dark:hover:text-amber-400 cursor-pointer transition-colors"
                          >
                            {home.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                            {home.description || "Stay with a local family in peace and experience authentic mountain meals, organic gardens, and custom hiking guide loops."}
                          </p>
                        </div>

                        {/* Closed Marketplace In-Platform CTAs */}
                        <div className="mt-4 pt-4 border-t border-slate-150 dark:border-slate-850 flex gap-2 shrink-0">
                          {/* Enquire CTA */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const slug = getItemSlug(home);
                              if (navigate) navigate(`#/enquire?listingType=homestay&listingId=${slug}`);
                              else window.location.hash = `#/enquire?listingType=homestay&listingId=${slug}`;
                            }}
                            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-xl text-center font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Enquire</span>
                          </button>

                          {/* Book Now CTA */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (navigate) navigate(`#/homestay/${getItemSlug(home)}`);
                              else window.location.hash = `#/homestay/${getItemSlug(home)}`;
                            }}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-center font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                          >
                            <span>Book Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            );
          })()}
        </div>
      </div>

      {/* 8. POPULAR ROUTES (AUTOMATED PATH TRANSITS) */}
      <div className="py-16 bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-150/40 dark:border-slate-900/60 transition-colors duration-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <span className="text-xs font-extrabold text-[#38bdf8] uppercase tracking-widest">Regional Transits & Direct Car Guides</span>
            <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100 tracking-tight mt-1">Popular Taxi Routes</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Direct distance checks, pricing estimations, and taxi stand bookings.</p>
          </div>
          {(() => {
            const popular = routes.slice(0, 8);
            if (popular.length === 0) {
              return (
                <div className="w-full text-center py-12 text-slate-450 font-bold bg-white dark:bg-slate-900 rounded-2xl border border-slate-200">
                  🚖 Taxi transit routes loading...
                </div>
              );
            }

            return (
              <UniversalCarousel
                items={popular}
                visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
                autoPlayInterval={8000}
                renderItem={(rt: any) => {
                  const fHub = hubs.find(h => h.id === rt.fromId || h.id === rt.fromHubId);
                  const tHub = hubs.find(h => h.id === rt.toId || h.id === rt.toHubId);
                  
                  const isReserved = rt.type?.toLowerCase().includes('reserved');
                  const fareMinVal = rt.fareMin || (isReserved ? 2500 : 120);
                  const fareMaxVal = rt.fareMax || (isReserved ? 3800 : 240);
                  const fareRange = fareMinVal > 0 ? `₹${fareMinVal} - ₹${fareMaxVal}` : `₹${isReserved ? '2,500' : '150'} avg`;

                  const fromName = fHub ? fHub.name : (rt.fromId || rt.fromHubId || "Origin");
                  const toName = tHub ? tHub.name : (rt.toId || rt.toHubId || "Destination");

                  const distance = rt.distanceKm || rt.distance || '72';
                  
                  let duration = rt.durationString;
                  if (!duration && rt.timeMin) {
                    if (rt.timeMin >= 60) {
                      const hrMin = (rt.timeMin / 60).toFixed(1);
                      const hrMax = rt.timeMax ? (rt.timeMax / 60).toFixed(1) : null;
                      duration = hrMax ? `${hrMin}-${hrMax} hrs` : `${hrMin} hrs`;
                    } else {
                      duration = rt.timeMax ? `${rt.timeMin}-${rt.timeMax} mins` : `${rt.timeMin} mins`;
                    }
                  }
                  if (!duration) {
                    duration = '2.5 hrs';
                  }

                  return (
                    <div 
                      key={rt.id}
                      onClick={() => {
                        clickQuickSearchRoute(rt.fromId || rt.fromHubId, rt.toId || rt.toHubId);
                      }}
                      className="w-full h-[240px] sm:h-[255px] group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850/80 p-5 sm:p-6 overflow-hidden hover:scale-[1.02] hover:border-teal-500/40 dark:hover:border-teal-500/40 shadow-xs hover:shadow-xl transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* Top status bar with type and fare range */}
                        <div className="flex items-center justify-between gap-1 mb-4 shrink-0 text-left">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-mono font-black tracking-wider uppercase">
                            <Car className="w-3.5 h-3.5" />
                            {rt.type || 'Shared Car'}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/15">
                            {fareRange}
                          </span>
                        </div>
                        
                        {/* Origin to Destination */}
                        <div className="flex items-center gap-2.5 font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-200 text-left">
                          <span className="truncate max-w-[42%]" title={fromName}>{fromName}</span>
                          <span className="text-teal-400 shrink-0">⟶</span>
                          <span className="truncate max-w-[42%]" title={toName}>{toName}</span>
                        </div>
                        
                        <p className="text-[11px] text-slate-450 dark:text-slate-400 font-mono mt-2.5 flex items-center gap-1.5 text-left">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550" />
                          <span>Winding terrain mountain transit</span>
                        </p>
                      </div>

                      {/* Specifications footer */}
                      <div className="mt-5 pt-4 border-t border-slate-150 dark:border-slate-805 flex items-center justify-between shrink-0">
                        <div className="text-left">
                          <div className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">EST. DISTANCE</div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono mt-0.5 flex items-center gap-1">
                            <span>📍</span> {distance} km
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">DRIVING TIME</div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono mt-0.5 flex items-center gap-1 justify-end">
                            <span>⏱</span> {duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            );
          })()}
        </div>
      </div>

      {/* 8. LATEST TRAVEL GUIDES & BLOG MODULE */}
      {latestBlogs.length > 0 && (
        <div id="latest-travel-guides-section" className="py-16 bg-slate-50 dark:bg-slate-900/40 transition-colors duration-200 overflow-hidden border-t border-b border-slate-150/40 dark:border-slate-900/60">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <span className="text-xs font-extrabold text-sky-500 uppercase tracking-widest">Insider Knowledge & Trail Logs</span>
                <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-slate-100 tracking-tight mt-1">Latest Travel Guides</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Insanely detailed road status bulletins, weather charts, and route maps generated autonomously from real database entries.</p>
              </div>
              
              <button 
                onClick={() => navigate('#/travel-guides')}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-550 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-500/10 hover:shadow-sky-550/20 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>View All Guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestBlogs.map((blog, idx) => {
                const hasImg = blog.featuredImage && blog.featuredImage !== "Featured Image Required";
                const publishedDateStr = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                });

                return (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    onClick={() => navigate(`#/travel-guides/${blog.slug}`)}
                    className="group bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Cover Photo */}
                    <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden shrink-0">
                      {hasImg ? (
                        <img 
                          src={blog.featuredImage} 
                          alt={blog.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850">
                          <Compass className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
                          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Featured Image Required</span>
                        </div>
                      )}
                      
                      {/* Floating badging */}
                      <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[9px] font-black text-sky-400 px-2 py-0.5 rounded uppercase tracking-wider">
                        ARTICLE
                      </div>
                      <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[9px] font-bold text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{blog.readingTime} min read</span>
                      </div>
                    </div>

                    {/* Meta info & content */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug mb-2">
                        {blog.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-3 mb-4 flex-grow">
                        {blog.content.replace(/[#*`_\[\]()\-]/g, "").substring(0, 110).trim()}...
                      </p>

                      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-850 text-[10px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>{publishedDateStr}</span>
                        </div>
                        <span className="text-sky-500 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                          <span>Read Guide</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 9. TRUST SECTION (LIVE DATABASE STATISTICS) */}
      <div className="py-16 bg-slate-950 text-white border-t border-slate-900 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-wide bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Live Platform Analytics
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-100 tracking-tight mt-4">HillyTrip in Live Numbers</h2>
            <p className="text-sm text-slate-400 font-medium mt-2 leading-relaxed">
              Completely scale-ready platform driven autonomously by central database triggers. New entries register instantly across India.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {/* Card 1: Destinations */}
            <div className="relative group/stat bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-emerald-500/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between text-left h-[135px] sm:h-[150px]">
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-3xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono tracking-tight">
                  <AnimatedCounter value={getCountNumber(liveStats?.destinations, destinations)} />
                </div>
                <div className="text-xs font-black text-slate-200 mt-2 uppercase tracking-wider font-display">Destinations</div>
              </div>
              <div className="text-[10px] text-slate-400/80 mt-1">Offbeat villages mapped</div>
            </div>

            {/* Card 2: Attractions */}
            <div className="relative group/stat bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-sky-500/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 flex flex-col justify-between text-left h-[135px] sm:h-[150px]">
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <div>
                <div className="text-3xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400 font-mono tracking-tight">
                  <AnimatedCounter value={getCountNumber(liveStats?.attractions, attractions)} />
                </div>
                <div className="text-xs font-black text-slate-200 mt-2 uppercase tracking-wider font-display">Attractions</div>
              </div>
              <div className="text-[10px] text-slate-400/80 mt-1">Waterfalls, viewpoints</div>
            </div>

            {/* Card 3: Taxi Stands */}
            <div className="relative group/stat bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-rose-500/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 flex flex-col justify-between text-left h-[135px] sm:h-[150px]">
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <div>
                <div className="text-3xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300 font-mono tracking-tight">
                  <AnimatedCounter value={getCountNumber(liveStats?.taxi_stands, drivers)} />
                </div>
                <div className="text-xs font-black text-slate-200 mt-2 uppercase tracking-wider font-display">Taxi Stands</div>
              </div>
              <div className="text-[10px] text-slate-400/80 mt-1">Verified local drivers</div>
            </div>

            {/* Card 4: Homestays */}
            <div className="relative group/stat bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-amber-500/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between text-left h-[135px] sm:h-[150px]">
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <div>
                <div className="text-3xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 font-mono tracking-tight">
                  <AnimatedCounter value={getCountNumber(liveStats?.homestays, homestays)} />
                </div>
                <div className="text-xs font-black text-slate-200 mt-2 uppercase tracking-wider font-display">Homestays</div>
              </div>
              <div className="text-[10px] text-slate-400/80 mt-1">Active family hosts</div>
            </div>

            {/* Card 5: Travel Images */}
            <div className="relative group/stat bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/80 hover:border-fuchsia-500/40 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-xl hover:shadow-fuchsia-500/5 transition-all duration-300 flex flex-col justify-between text-left h-[135px] sm:h-[150px] col-span-2 lg:col-span-1">
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <div>
                <div className="text-3xl sm:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400 font-mono tracking-tight">
                  <AnimatedCounter value={getCountNumber(liveStats?.travel_images, publicPhotos)} />
                </div>
                <div className="text-xs font-black text-slate-200 mt-2 uppercase tracking-wider font-display">Travel Images</div>
              </div>
              <div className="text-[10px] text-slate-400/80 mt-1">User uploaded captures</div>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM LIGHTBOX MODAL FOR TRAVELER MOMENTS */}
      <AnimatePresence>
        {activeLightboxIndex !== null && lightboxPhotosList.length > 0 && (() => {
          const photo = lightboxPhotosList[activeLightboxIndex];
          const isLandscape = aspectRatio ? aspectRatio > 1.0 : false;
          const isLandscapeMobile = isMobile && isLandscape;
          const isLiked = user && likes.some(l => l.id === `${user.uid}_${photo.id}`);
          
          // Realistic stats
          const viewsCount = (photo.likes * 14) + ((photo.id.charCodeAt(photo.id.length - 1) || 9) * 3) + 75;
          const commentsCount = (localComments[photo.id]?.length || 0) + (((photo.id.charCodeAt(2) || 4) % 6) + 3);

          const simulatedComments = [
            { id: "sim_1", name: "Suresh Thapa", avatar: "👤", text: "Stunning frame! The light play on the slopes is mesmerizing.", time: "2h ago", replies: [{ id: "sim_1_r1", name: "Kiran Gurung", text: "Agreed, the contrast between snow and valleys is brilliant!", time: "1h ago" }] },
            { id: "sim_2", name: "Aditi Sharma", avatar: "👤", text: "Added this to my bucket list immediately! Incredible shot.", time: "1d ago", replies: [] },
            { id: "sim_3", name: "Tshering Lepcha", avatar: "👤", text: "As a local, this captures the true quiet essence of our village.", time: "3d ago", replies: [] },
            { id: "sim_4", name: "Marcus Miller", avatar: "👤", text: "Spectacular dynamic range. What camera gear did you use?", time: "5d ago", replies: [{ id: "sim_4_r1", name: "Suresh Thapa", text: "Looks like a Sony A7R V with a 24-70mm lens. Just speculation though!", time: "4d ago" }] }
          ].slice(0, Math.max(1, commentsCount - (localComments[photo.id]?.length || 0)));

          const allComments = [...(localComments[photo.id] || []), ...simulatedComments];

          const handlePrev = (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setActiveLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : lightboxPhotosList.length - 1));
            setIsDetailsExpanded(false);
          };

          const handleNext = (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setActiveLightboxIndex(prev => (prev !== null && prev < lightboxPhotosList.length - 1 ? prev + 1 : 0));
            setIsDetailsExpanded(false);
          };

          const handlePostComment = (e: React.FormEvent) => {
            e.preventDefault();
            if (!commentText.trim()) return;

            const timestamp = 'Just now';
            const authorName = user?.displayName || user?.email?.split('@')[0] || 'Guest Traveler';

            if (replyToCommentId) {
              const newReply = {
                id: `reply_${Date.now()}`,
                name: authorName,
                text: commentText.trim(),
                time: timestamp
              };
              setLocalReplies(prev => ({
                ...prev,
                [replyToCommentId]: [newReply, ...(prev[replyToCommentId] || [])]
              }));
              setReplyToCommentId(null);
              setReplyToName(null);
            } else {
              const newComment = {
                id: `comment_${Date.now()}`,
                name: authorName,
                avatar: '👤',
                text: commentText.trim(),
                time: timestamp
              };
              setLocalComments(prev => ({
                ...prev,
                [photo.id]: [newComment, ...(prev[photo.id] || [])]
              }));
            }
            setCommentText('');
          };

          const handleShare = (e?: React.MouseEvent) => {
            if (e) e.stopPropagation();
            const destObj = destinations.find(d => d.id === photo.destinationId);
            const slug = destObj ? getItemSlug(destObj) : getItemSlug({ id: photo.destinationId, name: photo.destinationName });
            const shareUrl = `${window.location.origin}/#/destination/${slug}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
              setCopiedId(photo.id);
              showPremiumToast('Moments link copied to clipboard!', 'success');
              setTimeout(() => setCopiedId(null), 2000);
            });
          };

          const handleTouchStart = (e: React.TouchEvent) => {
            if (e.touches.length === 2) {
              const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              touchStartDistRef.current = dist;
              touchStartScaleRef.current = zoomScale;
            } else {
              dragStartXRef.current = e.touches[0].clientX;
            }
          };

          const handleTouchMove = (e: React.TouchEvent) => {
            if (e.touches.length === 2 && touchStartDistRef.current !== null) {
              const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              const factor = dist / touchStartDistRef.current;
              const newScale = Math.min(Math.max(touchStartScaleRef.current * factor, 1), 3);
              setZoomScale(newScale);
            }
          };

          const handleTouchEnd = (e: React.TouchEvent) => {
            touchStartDistRef.current = null;
            if (e.touches.length === 0 && dragStartXRef.current !== null) {
              if (zoomScale === 1) {
                const diff = e.changedTouches[0].clientX - dragStartXRef.current;
                if (diff < -50) {
                  handleNext();
                } else if (diff > 50) {
                  handlePrev();
                }
              }
              dragStartXRef.current = null;
            }
          };

          const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            const now = Date.now();
            if (now - lastTapRef.current < 300) {
              if (zoomScale > 1) {
                setZoomScale(1);
              } else {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomOrigin({ x, y });
                setZoomScale(2.5);
              }
            }
            lastTapRef.current = now;
          };

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[9999] bg-slate-950/98 flex flex-col justify-start p-0 text-white select-none overflow-hidden h-screen w-screen"
              onClick={() => setActiveLightboxIndex(null)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Preloading adjacent images to ensure seamless, flicker-free transitions */}
              <div className="hidden">
                {activeLightboxIndex !== null && lightboxPhotosList[activeLightboxIndex - 1] && (
                  <img src={lightboxPhotosList[activeLightboxIndex - 1].url} referrerPolicy="no-referrer" alt="" />
                )}
                {activeLightboxIndex !== null && lightboxPhotosList[activeLightboxIndex + 1] && (
                  <img src={lightboxPhotosList[activeLightboxIndex + 1].url} referrerPolicy="no-referrer" alt="" />
                )}
              </div>

              {/* Viewport Ambient Backdrop Layer: softly blurred, darkened version of the current image to eliminate solid black spaces */}
              <div className="absolute inset-0 select-none overflow-hidden pointer-events-none z-0">
                <img 
                  src={photo.url} 
                  alt="" 
                  className="w-full h-full object-cover blur-3xl opacity-35 scale-105 brightness-[0.22] saturate-[1.15]"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Compact Minimal Top Bar (0px top margin to remove unnecessary space) */}
              <div className="flex justify-between items-center w-full max-w-5xl mx-auto h-12 px-4 shrink-0 z-50 mt-0" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-display tracking-tight">HillyTrip</span>
                  <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-mono font-bold uppercase tracking-wider">Moments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Save button */}
                  {(() => {
                    const isSaved = savedPhotoIds.includes(photo.id);
                    return (
                      <button
                        onClick={() => handleSavePhoto(photo.id)}
                        className={`w-8 h-8 rounded-full border backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          isSaved 
                            ? 'bg-amber-500 border-amber-400 text-white' 
                            : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                        }`}
                        title={isSaved ? "Remove from saved" : "Save moment"}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                      </button>
                    );
                  })()}
                  
                  {/* Report button */}
                  <button 
                    onClick={() => setReportModalPhotoId(photo.id)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/20 border border-white/10 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer text-slate-300 hover:text-rose-400 hover:scale-105 active:scale-95"
                    title="Report content"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={handleShare}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer text-white hover:scale-105 active:scale-95"
                    title={copiedId === photo.id ? 'Copied Link!' : 'Share moment'}
                  >
                    {copiedId === photo.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={() => setActiveLightboxIndex(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer text-white hover:scale-105 active:scale-95"
                    title="Close gallery"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Central View Area with Arrow Navigation & Photograph */}
              <div className="flex-grow flex items-center justify-center relative w-full max-w-5xl mx-auto px-2 sm:px-4 pb-2 sm:pb-4 overflow-hidden z-10" onClick={e => e.stopPropagation()}>
                {/* Photograph Container (Orientation-aware layout: bounds to exact image aspect ratio) */}
                <div 
                  className="relative max-h-[86vh] sm:max-h-[90vh] md:max-h-[92vh] max-w-full bg-slate-950 sm:rounded-2xl overflow-hidden shadow-2xl border sm:border border-white/10 flex items-center justify-center group/viewer select-none pointer-events-auto transition-all duration-300"
                  style={{
                    aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
                    width: aspectRatio ? undefined : '100%',
                    height: aspectRatio ? undefined : '100%',
                  }}
                  onClick={handleDoubleTap}
                  onContextMenu={e => e.preventDefault()}
                >
                  {/* Clean fallback background blur inside container to prevent any flicker */}
                  <div className="absolute inset-0 select-none overflow-hidden pointer-events-none z-0">
                    <img 
                      src={photo.url} 
                      alt="" 
                      className="w-full h-full object-cover blur-2xl opacity-20 scale-105 brightness-[0.3]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* The crisp photograph layer */}
                  <div className="w-full h-full overflow-hidden flex items-center justify-center bg-black/10 z-10 relative">
                    <img 
                      src={photo.url} 
                      alt={photo.caption}
                      referrerPolicy="no-referrer"
                      onLoad={(e) => {
                        const { naturalWidth, naturalHeight } = e.currentTarget;
                        if (naturalWidth && naturalHeight) {
                          setAspectRatio(naturalWidth / naturalHeight);
                        }
                      }}
                      onDragStart={e => e.preventDefault()}
                      style={{
                        transform: `scale(${zoomScale})`,
                        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                        transition: zoomScale === 1 ? 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                      }}
                      className="max-h-full max-w-full object-contain filter brightness-[1.04] contrast-[1.01] saturate-[1.04] z-20 relative"
                    />
                  </div>

                  {/* Prev Button inside image boundaries */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-3 z-45 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/65 border border-white/10 flex items-center justify-center transition-all cursor-pointer text-white shadow-xl hover:scale-105 active:scale-95"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/95" />
                  </button>

                  {/* Next Button inside image boundaries */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-3 z-45 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 hover:bg-black/65 border border-white/10 flex items-center justify-center transition-all cursor-pointer text-white shadow-xl hover:scale-105 active:scale-95"
                    title="Next Image"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/95" />
                  </button>

                  {/* Premium Glass Photo Counter Badge Pill inside the image */}
                  <div className="absolute top-4 left-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold text-white/90 border border-white/10 shadow-md z-40 select-none">
                    {activeLightboxIndex + 1} <span className="text-white/45">/</span> {lightboxPhotosList.length}
                  </div>

                  {/* Bottom Premium Immersive Overlay resting directly on top of the image (minimal, elegant, transparent gradient) */}
                  <div 
                    className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/55 to-transparent z-30 flex flex-col md:flex-row md:items-end md:justify-between gap-3 select-text overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Left side: Premium minimal typographic hierarchy */}
                    <div className="flex flex-col gap-1.5 text-left flex-grow max-w-2xl">
                      {/* 1. Location details */}
                      <div className="flex flex-wrap gap-1.5 items-center text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider select-none">
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLightboxIndex(null);
                            const destObj = destinations.find(d => d.id === photo.destinationId);
                            const slug = destObj ? getItemSlug(destObj) : getItemSlug({ id: photo.destinationId, name: photo.destinationName });
                            navigate(`#/destination/${slug}`);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 bg-black/25 hover:bg-black/40 px-2 py-0.5 rounded-md border border-white/5 shadow-sm"
                        >
                          <MapPin className="w-2.5 h-2.5 text-emerald-450" /> {photo.destinationName}
                        </span>
                        {photo.attractionName && (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (photo.attractionId) {
                                setActiveLightboxIndex(null);
                                const attrObj = attractions.find(a => a.id === photo.attractionId);
                                const slug = attrObj ? getItemSlug(attrObj) : getItemSlug({ id: photo.attractionId, name: photo.attractionName });
                                navigate(`#/attraction/${slug}`);
                              }
                            }}
                            className="text-sky-400 hover:text-sky-300 transition-colors cursor-pointer flex items-center gap-1 bg-black/25 hover:bg-black/40 px-2 py-0.5 rounded-md border border-white/5 shadow-sm"
                          >
                            <span>🏞</span> {photo.attractionName}
                          </span>
                        )}
                      </div>

                      {/* 2. Title & Caption (Smooth toggle on mobile landscape) */}
                      <AnimatePresence initial={false}>
                        {(!isLandscapeMobile || isDetailsExpanded) && (
                          <motion.div
                            initial={isLandscapeMobile ? { height: 0, opacity: 0 } : undefined}
                            animate={isLandscapeMobile ? { height: 'auto', opacity: 1 } : undefined}
                            exit={isLandscapeMobile ? { height: 0, opacity: 0 } : undefined}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <h4 className="text-xs sm:text-sm md:text-base font-black font-display text-white leading-tight tracking-tight drop-shadow-md mt-1">
                              {photo.attractionName ? `Discovery at ${photo.attractionName}` : `Moments in ${photo.destinationName}`}
                            </h4>
                            <p className="text-[10px] sm:text-xs text-slate-200 mt-0.5 leading-relaxed font-sans font-medium line-clamp-1 sm:line-clamp-2 drop-shadow-sm">
                              {photo.caption}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 3. Prominent, Larger Photographer Credit directly integrated underneath */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 shrink-0 select-none">
                        <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight drop-shadow-md">
                          📷 Photo by <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLightboxIndex(null);
                              const slug = photo.photographer.toLowerCase().replace(/\s+/g, '-');
                              navigate(`#/contributor/${slug}`);
                            }}
                            className="text-emerald-300 hover:text-emerald-400 font-black cursor-pointer underline decoration-dotted transition-colors"
                          >
                            @{photo.photographer}
                          </span>
                        </span>
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 text-[9px] text-white font-black shadow-sm" title="Verified Photographer">✓</span>
                        
                        <AnimatePresence initial={false}>
                          {(!isLandscapeMobile || isDetailsExpanded) && (
                            <motion.span 
                              initial={isLandscapeMobile ? { width: 0, opacity: 0 } : undefined}
                              animate={isLandscapeMobile ? { width: 'auto', opacity: 1 } : undefined}
                              exit={isLandscapeMobile ? { width: 0, opacity: 0 } : undefined}
                              className="text-[9px] sm:text-[10px] text-slate-400 font-mono inline-block overflow-hidden whitespace-nowrap"
                            >
                              • {new Date(photo.uploadDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* "Show Details" button toggle (ONLY on landscape mobile) */}
                        {isLandscapeMobile && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDetailsExpanded(!isDetailsExpanded);
                            }}
                            className="ml-2 px-2 py-0.5 text-[9px] font-bold text-emerald-400 hover:text-emerald-300 bg-white/10 hover:bg-white/15 rounded border border-white/10 transition-colors uppercase tracking-wider cursor-pointer select-none active:scale-95"
                          >
                            {isDetailsExpanded ? 'Hide Details' : 'Show Details'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right side: Elegant borderless engagement pills */}
                    <div className="flex items-center gap-2 md:self-end shrink-0 select-none">
                      {/* Likes button */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await toggleLike(photo.id, 'photo');
                        }}
                        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/5 shadow-md ${
                          isLiked 
                            ? 'bg-rose-500/90 border-rose-400/30 text-white' 
                            : 'bg-black/45 hover:bg-black/65 border-white/5 text-slate-200'
                        }`}
                        title="Like photo"
                      >
                        <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-white text-white' : 'text-rose-500'}`} />
                        <span>{photo.likes}</span>
                      </button>

                      {/* Comments count */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCommentsOpen(true);
                        }}
                        className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/5 bg-black/45 hover:bg-black/65 text-slate-200 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                        title="View comments"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-450" />
                        <span>{commentsCount}</span>
                      </button>

                      {/* Views display */}
                      <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/5 bg-black/35 text-slate-300 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono font-bold shadow-md">
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                        <span>{viewsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SMOOTH BOTTOM SHEET FOR COMMENTS WITH NESTED THREADED REPLIES */}
              <AnimatePresence>
                {isCommentsOpen && (
                  <div className="absolute inset-0 z-50 flex flex-col justify-end" onClick={e => e.stopPropagation()}>
                    {/* Sheet Backdrop */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsCommentsOpen(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                    />

                    {/* Sheet Sliding Container */}
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                      className="relative w-full max-w-2xl mx-auto bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 rounded-t-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[50vh] md:max-h-[60vh] text-left"
                    >
                      {/* Pull Indicator Drag handle */}
                      <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4 shrink-0" />

                      {/* Header */}
                      <div className="flex justify-between items-center mb-4 shrink-0">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-sky-400" />
                          <h3 className="font-display font-extrabold text-base text-white">Moments Discussion ({commentsCount})</h3>
                        </div>
                        <button 
                          onClick={() => setIsCommentsOpen(false)}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                        >
                          <X className="w-4 h-4 text-slate-300" />
                        </button>
                      </div>

                      {/* Comments stream scroll container */}
                      <div className="flex-grow overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin">
                        {allComments.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No comments yet. Write a comment to join the discussion!
                          </div>
                        ) : (
                          allComments.map((c, cIdx) => {
                            const commentReplies = [
                              ...(c.replies || []),
                              ...(localReplies[c.id] || [])
                            ];

                            return (
                              <div key={c.id || `comment_${cIdx}`} className="text-[11px] sm:text-xs bg-slate-950/45 p-3 rounded-2xl border border-white/5 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-mono">👤</span>
                                    {c.name}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono font-bold">{c.time}</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed font-sans pl-6">{c.text}</p>
                                
                                {/* Thread Reply Trigger Action */}
                                <div className="pl-6 flex items-center gap-3">
                                  <button 
                                    onClick={() => {
                                      setReplyToCommentId(c.id || `comment_${cIdx}`);
                                      setReplyToName(c.name);
                                    }}
                                    className="text-[9px] font-bold text-sky-400 hover:text-sky-300 uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    Reply
                                  </button>
                                </div>

                                {/* Nested Threaded Replies Indented Panel */}
                                {commentReplies.length > 0 && (
                                  <div className="pl-5 pt-2 mt-2 border-l border-white/10 space-y-2">
                                    {commentReplies.map((r, rIdx) => (
                                      <div key={r.id || `reply_${rIdx}`} className="bg-white/5 p-2 rounded-xl border border-white/5 text-[10px] sm:text-[11px] space-y-1">
                                        <div className="flex justify-between items-center">
                                          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded-full bg-slate-850 flex items-center justify-center text-[8px] text-slate-400 font-mono">👤</span>
                                            {r.name}
                                          </span>
                                          <span className="text-[8px] text-slate-500 font-mono">{r.time}</span>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed pl-5.5">{r.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Replying indicator banner */}
                      {replyToCommentId && (
                        <div className="flex justify-between items-center bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl mb-2 shrink-0 text-[10px]">
                          <span className="text-sky-300 font-medium">
                            Replying to <span className="font-extrabold font-mono">@{replyToName}</span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              setReplyToCommentId(null);
                              setReplyToName(null);
                            }}
                            className="text-slate-400 hover:text-white font-black text-[9px] uppercase tracking-wider cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Form to submit comments */}
                      <form onSubmit={handlePostComment} className="flex gap-2 border-t border-slate-800/80 pt-3 shrink-0">
                        <input 
                          type="text" 
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder={replyToCommentId ? `Write a reply to @${replyToName}...` : "Share your thoughts about this photo..."}
                          className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                          maxLength={150}
                        />
                        <button 
                          type="submit"
                          disabled={!commentText.trim()}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl flex items-center justify-center transition-colors cursor-pointer shrink-0 font-semibold text-xs"
                          title="Post comment"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* PREMIUM SHARE YOUR MOMENT UPLOAD MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isUploading) {
                  setIsUploadModalOpen(false);
                  setUploadSuccessMessage(false);
                }
              }}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-900 dark:text-white z-10 text-left flex flex-col justify-between max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5 shrink-0">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-slate-100">Share Your Moment</h3>
                </div>
                <button 
                  onClick={() => {
                    if (!isUploading) {
                      setIsUploadModalOpen(false);
                      setUploadSuccessMessage(false);
                    }
                  }}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadSuccessMessage ? (
                /* Success Confirmation Message Screen */
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                    <Check className="w-7 h-7" />
                  </div>
                  <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white mb-2">Moments Shared!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                    Your photo has been submitted for admin approval. It will appear publicly after verification.
                  </p>
                  <button 
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setUploadSuccessMessage(false);
                    }}
                    className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-md transition-colors w-full cursor-pointer"
                  >
                    Awesome
                  </button>
                </div>
              ) : (
                /* Upload and Input Form */
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!uploadFile) {
                      setUploadError('Please select a photo to upload!');
                      return;
                    }
                    if (!uploadDestId) {
                      setUploadError('Please select a destination!');
                      return;
                    }
                    if (!uploadCaption.trim()) {
                      setUploadError('Please write a caption!');
                      return;
                    }

                    setIsUploading(true);
                    setUploadError('');

                    try {
                      // 1. Upload file binary
                      const fileName = `moment_${Date.now()}_${uploadFile.name.replace(/\.[^/.]+$/, "")}.webp`;
                      const uploadUrl = await uploadImageToFirebase(uploadFile, fileName);

                      // 2. Post to /api/images
                      const metaPayload = {
                        destinationId: uploadDestId,
                        attractionId: uploadAttrId || null,
                        url: uploadUrl,
                        uploadedBy: user?.displayName || user?.email?.split('@')[0] || 'Registered Traveler',
                        status: 'Pending',
                        caption: uploadCaption.trim(),
                        altText: `Scenic traveler photo of ${destinations.find(d => d.id === uploadDestId)?.name || 'Hills'} showing ${uploadCaption.trim()}`,
                        userId: user?.uid || user?.email || 'anonymous'
                      };

                      const response = await fetch('/api/images', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(metaPayload)
                      });

                      if (!response.ok) {
                        const errText = await response.text();
                        throw new Error(errText || 'Failed to submit photo record.');
                      }

                      setUploadSuccessMessage(true);
                      setUploadFile(null);
                      setUploadPreview(null);
                      setUploadDestId('');
                      setUploadAttrId('');
                      setUploadCaption('');
                    } catch (err: any) {
                      console.error(err);
                      setUploadError(err.message || 'An error occurred during upload. Please try again.');
                    } finally {
                      setIsUploading(false);
                    }
                  }} 
                  className="space-y-4"
                >
                  {uploadError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-[11px] font-medium leading-normal flex items-start gap-1.5">
                      <span className="font-bold shrink-0">⚠️</span>
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination *</label>
                      <AutocompleteSelect
                        id="photo-upload-destination"
                        name="photo-upload-destination"
                        value={uploadDestId}
                        onChange={async (e) => {
                          const val = e.target.value;
                          setUploadDestId(val);
                          setUploadAttrId('');
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                        required
                        disabled={isUploading}
                      >
                        <option value="">Select Destination</option>
                        {destinations.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </AutocompleteSelect>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attraction (Optional)</label>
                      <AutocompleteSelect
                        id="photo-upload-attraction"
                        name="photo-upload-attraction"
                        value={uploadAttrId}
                        onChange={(e) => setUploadAttrId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!uploadDestId || isUploading}
                      >
                        <option value="">Select Attraction</option>
                        {attractions
                          .filter(a => a.destinationId === uploadDestId)
                          .map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                      </AutocompleteSelect>
                    </div>
                  </div>

                  {/* File Upload drag-drop area */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Photo *</label>
                    <div 
                      className="border-2 border-dashed border-slate-250 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/50 relative flex flex-col items-center justify-center min-h-[130px] overflow-hidden"
                      onClick={() => {
                        if (!isUploading) {
                          document.getElementById('photo-upload-input')?.click();
                        }
                      }}
                    >
                      <input 
                        id="photo-upload-input"
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setUploadError('');
                          setIsUploading(true);
                          try {
                            const webpBlob = await compressAndConvertToWebP(file);
                            const url = URL.createObjectURL(webpBlob);
                            setUploadPreview(url);
                            setUploadFile(new File([webpBlob], `${file.name.split('.')[0]}.webp`, { type: 'image/webp' }));
                          } catch (err: any) {
                            console.error(err);
                            setUploadError('Failed to convert image to WebP. Please try another file.');
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                        className="hidden" 
                      />
                      {uploadPreview ? (
                        <div className="relative w-full h-28 rounded-xl overflow-hidden">
                          <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadPreview(null);
                              setUploadFile(null);
                            }}
                            className="absolute top-1.5 right-1.5 bg-slate-950/80 hover:bg-rose-600 text-white rounded-full p-1.5 transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-7 h-7 text-slate-450 dark:text-slate-550 mb-1.5 animate-bounce" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose photo or drag here</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Accepts standard images • Auto-converted to WebP</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Caption Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Caption *</label>
                    <textarea
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="e.g. A gorgeous misty evening strolling near the organic tea slopes..."
                      maxLength={140}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans h-20 resize-none leading-normal"
                      required
                      disabled={isUploading}
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isUploading || !uploadFile || !uploadDestId || !uploadCaption.trim()}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-850 text-white disabled:text-slate-400 rounded-full text-xs font-extrabold tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        Uploading and Optimizing...
                      </span>
                    ) : (
                      'Submit Traveler Moment'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREMIUM REPORT MODAL */}
      <AnimatePresence>
        {reportModalPhotoId && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportModalPhotoId(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4 text-rose-500">
                <Flag className="w-5 h-5" />
                <h3 className="font-display font-extrabold text-lg text-white">Report Moment</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Thank you for helping us maintain HillyTrip's high-quality travel community guidelines. Why are you flagging this photo?
              </p>
              <div className="space-y-2 mb-6">
                {[
                  { value: 'inappropriate', label: 'Inappropriate or offensive content' },
                  { value: 'copyright', label: 'Copyright violation or stolen image' },
                  { value: 'spam', label: 'Spam, advertisement, or commercial' },
                  { value: 'wrong_info', label: 'Incorrect location or misleading details' }
                ].map(opt => (
                  <label 
                    key={opt.value} 
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 cursor-pointer select-none transition-all text-xs text-slate-300 hover:text-white"
                  >
                    <input 
                      type="radio" 
                      name="report_reason" 
                      value={opt.value} 
                      checked={reportReason === opt.value}
                      onChange={() => setReportReason(opt.value)}
                      className="accent-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setReportModalPhotoId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:text-white transition-colors cursor-pointer text-xs font-bold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReportPhoto(reportModalPhotoId, reportReason)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer text-xs font-bold shadow-md shadow-rose-650/10"
                >
                  Submit Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREMIUM IN-APP TOAST NOTIFICATION SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-sm z-[10005] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500 animate-ping' :
              toast.type === 'info' ? 'bg-sky-500' : 'bg-rose-500'
            }`} />
            <span className="text-xs font-extrabold font-sans leading-tight flex-1 min-w-0 break-words">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-200 text-xs font-bold pl-2 cursor-pointer shrink-0"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Quick keyword matching for villages
function devDestinationsMatch(dests: Destination[], q: string) {
  if (!q) return dests;
  const lower = q.toLowerCase();
  return dests.filter(d => 
    (d.name || '').toLowerCase().includes(lower) ||
    (d.district || '').toLowerCase().includes(lower) ||
    (d.tourismType || '').toLowerCase().includes(lower) ||
    (d.state || '').toLowerCase().includes(lower)
  );
}
