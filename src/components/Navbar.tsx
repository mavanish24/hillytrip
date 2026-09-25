import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Mountain,
  Car,
  X, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  WifiOff, 
  Search,
  Camera,
  Upload,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown,
  Sparkles,
  MapPin,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedLogo } from './AnimatedLogo';
import UserNotificationBell from './UserNotificationBell';
import { useThemeEngine } from './ThemeContext';
import { useBranding } from './BrandingContext';
import { ProfileNavigationMenu } from './navigation/ProfileNavigationMenu';
import { roleService } from '../services/navigation/RoleService';

import UniversalHeroSearchModal from './search/UniversalHeroSearchModal';
import MobileSearchModal from './search/MobileSearchModal';
import MobileAccountDrawer from './navigation/MobileAccountDrawer';
import { SearchDataSources } from '../lib/universalHeroSearchEngine';
import { Destination, Attraction, Homestay, Driver, Hub, Route } from '../types';

interface NavbarProps {
  currentHash: string;
  navigate: (hash: string) => void;
  user: any; // Firebase/Supabase user object
  onLogin: () => void;
  onLogout: () => void;
  isOffline: boolean;
  theme: string;
  setTheme: (theme: string) => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  isAdmin?: boolean;
  activeRoleTab?: string;
  setActiveRoleTab?: (role: any) => void;
  setNotification?: (notif: { type: 'success' | 'error', message: string } | null) => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  drivers?: Driver[];
  hubs?: Hub[];
  routes?: Route[];
  onOpenAiPlanner?: () => void;
}

export default function Navbar({ 
  currentHash, 
  navigate, 
  user, 
  onLogin, 
  onLogout, 
  isOffline, 
  theme, 
  setTheme, 
  themeMode, 
  setThemeMode,
  isAdmin,
  setNotification,
  destinations = [],
  attractions = [],
  homestays = [],
  drivers = [],
  hubs = [],
  routes = [],
  onOpenAiPlanner
}: NavbarProps) {
  const currentPath = currentHash.startsWith('#') ? currentHash.substring(1) : (currentHash || '/');
  const { settings } = useBranding();
  const { activeTheme, setTheme: setThemePreset, themes } = useThemeEngine();
  
  // Navigation & UI state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileAccountDrawerOpen, setIsMobileAccountDrawerOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logoImgError, setLogoImgError] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileSearchOpen(false);
    setIsMobileAccountDrawerOpen(false);
  }, [currentHash]);

  // Live Saved/Wishlist Count Listener
  useEffect(() => {
    const updateWishlist = () => {
      try {
        const saved = localStorage.getItem('hillytrip_likes') || localStorage.getItem('hillytrip_saved') || localStorage.getItem('hillytrip_wishlist');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setWishlistCount(parsed.length);
          else if (typeof parsed === 'object') setWishlistCount(Object.keys(parsed).length);
        } else {
          setWishlistCount(0);
        }
      } catch {
        setWishlistCount(0);
      }
    };

    updateWishlist();
    window.addEventListener('storage', updateWishlist);
    const interval = setInterval(updateWishlist, 2500);
    return () => {
      window.removeEventListener('storage', updateWishlist);
      clearInterval(interval);
    };
  }, []);

  // Reset logo image error when settings or theme change
  useEffect(() => {
    setLogoImgError(false);
  }, [settings?.desktop_logo_url, settings?.white_logo_url, settings?.dark_logo_url, themeMode]);

  // Apple Ambient Idle State Management (3 seconds threshold)
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 3000);
    };

    resetIdleTimer();

    const activityEvents = [
      'mousemove',
      'mousedown',
      'touchstart',
      'touchmove',
      'scroll',
      'keydown',
      'click'
    ];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetIdleTimer);
      });
    };
  }, [currentHash]);

  // Scroll state for Homepage Hero & Independent Shrinking
  const isHomePage = currentPath === '/' || currentPath === '' || currentPath === '#/' || currentHash === '#/' || currentHash === '';
  const [scrolledPastHero, setScrolledPastHero] = useState(!isHomePage);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
      if (isHomePage) {
        setScrolledPastHero(window.scrollY > window.innerHeight * 0.7);
      } else {
        setScrolledPastHero(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, currentHash]);

  // Profile Photo states
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // Drag states for crop panning
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Toast State for theme actions
  const [activeThemeToast, setActiveThemeToast] = useState<{ name: string, emoji: string } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations unread count
  useEffect(() => {
    if (!user) {
      setUnreadChatCount(0);
      return;
    }
    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/messaging/conversations?userId=${encodeURIComponent(user.id)}&role=${encodeURIComponent(user.role || 'traveler')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const count = data.conversations.reduce((acc: number, c: any) => acc + (c.unread_count || 0), 0);
            setUnreadChatCount(count);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Universal Hero Search states & sources
  const [isHeroSearchOpen, setIsHeroSearchOpen] = useState(false);
  const [loadedDestinations, setLoadedDestinations] = useState<Destination[]>(destinations);
  const [loadedAttractions, setLoadedAttractions] = useState<Attraction[]>(attractions);
  const [loadedHomestays, setLoadedHomestays] = useState<Homestay[]>(homestays);
  const [loadedDrivers, setLoadedDrivers] = useState<Driver[]>(drivers);
  const [loadedHubs, setLoadedHubs] = useState<Hub[]>(hubs);
  const [loadedRoutes, setLoadedRoutes] = useState<Route[]>(routes);

  useEffect(() => {
    if (destinations?.length) setLoadedDestinations(destinations);
    if (attractions?.length) setLoadedAttractions(attractions);
    if (homestays?.length) setLoadedHomestays(homestays);
    if (drivers?.length) setLoadedDrivers(drivers);
    if (hubs?.length) setLoadedHubs(hubs);
    if (routes?.length) setLoadedRoutes(routes);
  }, [destinations, attractions, homestays, drivers, hubs, routes]);

  // Fallback data fetch if empty
  useEffect(() => {
    if (!loadedDestinations.length) {
      fetch('/api/villages?limit=24').then(r => r.ok ? r.json() : []).then(d => Array.isArray(d) && setLoadedDestinations(d)).catch(() => {
        fetch('/api/destinations?limit=24').then(r => r.ok ? r.json() : []).then(d => Array.isArray(d) && setLoadedDestinations(d)).catch(() => {});
      });
    }
    if (!loadedAttractions.length) {
      fetch('/api/attractions?limit=24').then(r => r.ok ? r.json() : []).then(a => Array.isArray(a) && setLoadedAttractions(a)).catch(() => {});
    }
    if (!loadedHomestays.length) {
      fetch('/api/homestays?limit=24').then(r => r.ok ? r.json() : []).then(h => Array.isArray(h) && setLoadedHomestays(h)).catch(() => {});
    }
    if (!loadedDrivers.length) {
      fetch('/api/drivers?limit=24').then(r => r.ok ? r.json() : []).then(dr => Array.isArray(dr) && setLoadedDrivers(dr)).catch(() => {});
    }
    if (!loadedHubs.length) {
      fetch('/api/hubs?limit=24').then(r => r.ok ? r.json() : []).then(hb => Array.isArray(hb) && setLoadedHubs(hb)).catch(() => {});
    }
    if (!loadedRoutes.length) {
      fetch('/api/routes?limit=24').then(r => r.ok ? r.json() : []).then(rt => Array.isArray(rt) && setLoadedRoutes(rt)).catch(() => {});
    }
  }, []);

  const searchSources: SearchDataSources = React.useMemo(() => ({
    destinations: loadedDestinations,
    attractions: loadedAttractions,
    homestays: loadedHomestays,
    drivers: loadedDrivers,
    hubs: loadedHubs,
    routes: loadedRoutes
  }), [loadedDestinations, loadedAttractions, loadedHomestays, loadedDrivers, loadedHubs, loadedRoutes]);

  // Keybinding ⌘K / Ctrl+K for opening Universal Hero Search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsHeroSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showThemeChangeToast = (name: string, emoji: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setActiveThemeToast({ name, emoji });
    toastTimeout.current = setTimeout(() => {
      setActiveThemeToast(null);
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  const activeThemeObj = {
    id: activeTheme.id,
    name: activeTheme.name,
    emoji: activeTheme.emoji,
    color: activeTheme.primaryColor,
    mood: activeTheme.mood
  };

  // Profile Photo Crop/Zoom Drag Mouse/Touch Event Handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX - pan.x, y: clientY - pan.y };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPan({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setSelectedImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: 'user' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera connection failed:', err);
      if (setNotification) {
        setNotification({ type: 'error', message: 'Could not access device camera.' });
      }
      setIsCameraActive(false);
    }
  };

  // Capture Photo from webcam
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const size = Math.min(canvas.width, canvas.height);
      const sx = (canvas.width - size) / 2;
      const sy = (canvas.height - size) / 2;
      canvas.width = 480;
      canvas.height = 480;
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 480, 480);
      const capturedBase64 = canvas.toDataURL('image/webp', 0.9);
      setSelectedImage(capturedBase64);
      
      // Stop webcam stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setIsCameraActive(false);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  // Stop Camera Stream on Cleanup
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Local File Upload / Gallery selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save/Upload the cropped profile photo to Supabase
  const handleSavePhoto = async () => {
    if (!selectedImage || !user) return;
    setIsSavingPhoto(true);

    try {
      const img = new Image();
      img.src = selectedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, 300, 300);

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const ratio = Math.max(300 / imgWidth, 300 / imgHeight);
        const drawWidth = imgWidth * ratio * zoom;
        const drawHeight = imgHeight * ratio * zoom;

        const x = (300 - drawWidth) / 2 + pan.x;
        const y = (300 - drawHeight) / 2 + pan.y;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        const croppedBase64 = canvas.toDataURL('image/webp', 0.9);

        // Upload to server Supabase Storage API endpoint
        const res = await fetch('/api/profile/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            imageBase64: croppedBase64
          })
        });

        if (!res.ok) throw new Error('Upload server error');
        const data = await res.json();

        if (data.success && data.user) {
          // Trigger automatic updates everywhere across the platform
          const updatedUser = {
            ...user,
            photoURL: data.publicUrl
          };
          localStorage.setItem('hillytrip_user_session', JSON.stringify(updatedUser));
          window.location.reload(); // Hard reload guarantees all states and cached items update natively
        }
      }
    } catch (err) {
      console.error(err);
      if (setNotification) {
        setNotification({ type: 'error', message: 'Failed to upload photo.' });
      }
    } finally {
      setIsSavingPhoto(false);
      setIsPhotoModalOpen(false);
      setSelectedImage(null);
    }
  };

  // Remove photo and reset to premium default
  const handleRemovePhoto = async () => {
    if (!user) return;
    setIsSavingPhoto(true);
    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          photoURL: '' // empty string removes custom profile photo
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const updatedUser = {
            ...user,
            photoURL: ''
          };
          localStorage.setItem('hillytrip_user_session', JSON.stringify(updatedUser));
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Failed to remove profile image:', err);
    } finally {
      setIsSavingPhoto(false);
      setIsPhotoModalOpen(false);
    }
  };

  // Member Since date calculator
  const getMemberSince = () => {
    if (user?.createdAt) {
      try {
        const date = new Date(user.createdAt);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } catch (e) {
        return 'July 2024';
      }
    }
    return 'July 2024';
  };

  // Animation configurations for the Right Drawer
  const drawerVariants: any = {
    closed: {
      x: '100%',
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    open: {
      x: 0,
      transition: {
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.025,
        delayChildren: 0.05
      }
    }
  };

  const drawerItemVariants: any = {
    closed: {
      opacity: 0,
      x: 15,
      transition: { duration: 0.2 }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    }
  };

  const avatarVariants: any = {
    closed: { scale: 0.9 },
    open: {
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' }
    }
  };

  const DESKTOP_NAV_ITEMS = [
    {
      id: 'destinations',
      label: 'Destinations',
      path: '#/destinations',
      icon: Mountain,
      isActive: () => checkIsActive('/destinations') || checkIsActive('/villages') || checkIsActive('/destination') || checkIsActive('/village'),
    },
    {
      id: 'attractions',
      label: 'Attractions',
      path: '#/attractions',
      icon: MapPin,
      isActive: () => checkIsActive('/attractions') || checkIsActive('/attraction'),
    },
    {
      id: 'homestays',
      label: 'Homestays',
      path: '#/homestays',
      icon: Home,
      isActive: () => checkIsActive('/homestays') || checkIsActive('/homestay') || checkIsActive('/stays') || checkIsActive('/stay'),
    },
    {
      id: 'taxi',
      label: 'Taxi',
      path: '#/taxi',
      icon: Car,
      isActive: () => checkIsActive('/taxi') || checkIsActive('/book-car'),
    },
    {
      id: 'explore',
      label: 'Explore',
      path: '#/explore',
      icon: Compass,
      isActive: () => (currentPath === '/explore' || currentPath.startsWith('/explore/') || currentPath === '/' || currentPath === '' || currentPath === '/journeys') &&
        !checkIsActive('/destinations') && !checkIsActive('/villages') && !checkIsActive('/attractions') && !checkIsActive('/homestays') && !checkIsActive('/taxi') && !checkIsActive('/ai-planner'),
    },
    {
      id: 'ai-planner',
      label: 'AI Planner',
      path: '#/ai-planner',
      icon: Sparkles,
      isAi: true,
      isActive: () => checkIsActive('/ai-planner') || checkIsActive('/plan-my-trip'),
    },
  ];

  const checkIsActive = (path: string) => {
    const cleanTarget = path.startsWith('#') ? path.substring(1) : path;
    if (cleanTarget === '/' || cleanTarget === '') {
      return currentPath === '/' || currentPath === '';
    }
    return currentPath.startsWith(cleanTarget);
  };

  return (
    <>
      {/* Redesigned Premium Glass Sticky Navbar */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 select-none transition-all duration-300 ease-out h-[60px] sm:h-[64px] md:h-[70px] lg:h-[76px] flex items-center ${
          isScrolled
            ? 'bg-[#090d16]/95 backdrop-blur-2xl border-b border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.6)] px-2.5 sm:px-4 md:px-6 lg:px-8'
            : 'bg-slate-950/70 backdrop-blur-xl border-b border-white/[0.08] px-2.5 sm:px-4 md:px-6 lg:px-8'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 lg:gap-5 min-w-0">
          
          {/* LEFT: HillyTrip Logo & Himalayan Escapes subtitle */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
            <button
              onClick={() => navigate('#/')}
              className="flex items-center gap-2 sm:gap-2.5 text-white hover:text-orange-400 transition-all cursor-pointer group text-left focus:outline-none"
              aria-label="HillyTrip Home"
            >
              <div className="p-1.5 sm:p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-orange-500/15 border border-orange-400/30 backdrop-blur-md text-orange-400 group-hover:scale-105 group-hover:border-orange-400/60 transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)]">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Plus_Jakarta_Sans'] font-black text-lg sm:text-xl lg:text-2xl tracking-tight text-white group-hover:text-orange-300 transition-colors drop-shadow-sm leading-none">
                  HillyTrip
                </span>
                <span className="hidden sm:block text-[9px] lg:text-[10px] font-['Inter'] font-semibold tracking-[0.2em] text-slate-300 uppercase mt-1 opacity-90">
                  Himalayan Escapes
                </span>
              </div>
            </button>

            {isOffline && (
              <span className="bg-orange-500/20 text-orange-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-orange-400/30 flex items-center gap-1 backdrop-blur-md shrink-0">
                <WifiOff className="w-3 h-3" />
                <span className="hidden xs:inline">Offline</span>
              </span>
            )}
          </div>

          {/* CENTER: Desktop Navigation Pill: [Destinations] [Attractions] [Homestays] [Taxi] [Explore] [AI Planner] */}
          <nav 
            className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1 lg:p-1.5 rounded-full bg-slate-950/60 border border-white/15 backdrop-blur-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-xs font-semibold text-slate-100 relative font-['Inter'] shrink min-w-0"
            aria-label="Main Navigation"
          >
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            {DESKTOP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.isActive();
              const isAi = item.isAi;

              if (isAi) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (onOpenAiPlanner) {
                        onOpenAiPlanner();
                      } else {
                        navigate('#/ai-planner');
                      }
                    }}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 lg:px-3.5 lg:py-1.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap text-xs font-bold bg-gradient-to-r from-orange-500/25 via-amber-500/25 to-purple-500/30 border border-orange-400/50 text-amber-200 hover:text-white shadow-[0_0_16px_rgba(249,115,22,0.25)] hover:scale-[1.03] active:scale-95 shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                    <span className="tracking-wide text-amber-100">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap text-xs font-semibold ${
                    active
                      ? 'bg-white/15 text-white font-bold border border-white/25 shadow-[0_0_16px_rgba(249,115,22,0.2)]'
                      : 'text-slate-200/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 transition-all ${active ? 'text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]' : 'text-slate-300'}`} />
                  <span className="tracking-wide">{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.9)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT (DESKTOP): [Search] [Bell] [Profile / (Sign In + Sign Up)] */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setIsHeroSearchOpen(true)}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-100 hover:text-white transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              title="Search destinations, stays, routes"
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-slate-100 hover:text-white" />
            </button>

            {/* Notifications Trigger */}
            <div className="relative shrink-0 flex items-center justify-center">
              <UserNotificationBell />
            </div>

            {/* Authenticated State: Profile Avatar Button with dropdown menu */}
            {user ? (
              <div className="relative shrink-0 flex items-center">
                <button
                  id="desktop-header-profile-btn"
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`h-9 lg:h-10 pl-1.5 pr-3 rounded-full border backdrop-blur-xl flex items-center gap-2 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                    isProfileOpen
                      ? 'bg-orange-500/20 border-orange-400/60 text-white shadow-[0_0_16px_rgba(249,115,22,0.3)] ring-1 ring-orange-400/50'
                      : 'bg-white/[0.07] hover:bg-white/[0.14] border-white/15 text-slate-100 hover:text-white'
                  }`}
                  title="User Account & Profile Menu"
                  aria-label="User Account & Profile Menu"
                >
                  {user?.photoURL && user.photoURL.trim() !== '' ? (
                    <img src={user.photoURL} alt="Profile" className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border border-white/30 shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono shrink-0 shadow-xs">
                      {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden xl:block text-xs font-bold text-slate-100 max-w-[100px] truncate">
                    {user.name || user.displayName || user.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Existing Desktop Profile Navigation Dropdown */}
                <div className="hidden md:block">
                  <ProfileNavigationMenu
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    mode="profile"
                    user={user}
                    isAdmin={isAdmin}
                    navigate={navigate}
                    currentPath={currentPath}
                    onLogin={onLogin}
                    onLogout={onLogout}
                    onOpenAiPlanner={onOpenAiPlanner}
                    wishlistCount={wishlistCount}
                    unreadNotificationsCount={unreadChatCount}
                    themeMode={themeMode}
                    setThemeMode={setThemeMode}
                    activeTheme={activeTheme}
                    setThemePreset={setThemePreset}
                    themes={themes}
                  />
                </div>
              </div>
            ) : (
              /* Guest State: Sign In only */
              <div className="flex items-center shrink-0">
                <button
                  id="desktop-header-signin-btn"
                  type="button"
                  onClick={onLogin}
                  className="h-9 px-4 lg:h-10 lg:px-5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_16px_rgba(249,115,22,0.3)] transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
                  title="Sign In to HillyTrip"
                  aria-label="Sign In"
                >
                  <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT (MOBILE): Compact Top Actions: [Explore] [Search] [Notifications] [Profile/Account Avatar] */}
          <div className="flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0">
            {/* 1. Explore (Compact button) */}
            <button
              type="button"
              onClick={() => navigate('#/explore')}
              className="h-9 px-2 sm:h-10 sm:px-2.5 flex items-center gap-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/20 border border-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 text-xs font-semibold focus:outline-none"
              aria-label="Explore"
              title="Explore"
            >
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">Explore</span>
            </button>

            {/* 2. Search Lens Icon (ONLY lens icon) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/20 border border-white/10 text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0 focus:outline-none"
              aria-label="Search destinations, stays, routes"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-200" />
            </button>

            {/* 3. Notifications Bell */}
            <div className="relative shrink-0 flex items-center justify-center">
              <UserNotificationBell className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
            </div>

            {/* 4. Profile/Account Avatar (Icon/Avatar-only for both logged-in and logged-out) */}
            <button
              type="button"
              onClick={() => setIsMobileAccountDrawerOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 p-0.5 flex items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/20 border border-white/10 transition-colors cursor-pointer text-slate-200 shrink-0 focus:outline-none"
              aria-label={user ? (user.name || user.displayName || "My Profile") : "Account Menu"}
              title={user ? (user.name || user.displayName || "My Profile") : "Account Menu"}
            >
              {user ? (
                user.photoURL && user.photoURL.trim() !== '' ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-orange-400/50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (user?.name || user?.displayName || user?.email) ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 font-black text-[11px] sm:text-xs flex items-center justify-center font-mono shrink-0 shadow-xs">
                    {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 text-slate-300 flex items-center justify-center shrink-0">
                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                  </div>
                )
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 text-slate-200 flex items-center justify-center shrink-0">
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-200" />
                </div>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* 📱 FIXED BOTTOM MOBILE NAVIGATION (Visible on mobile < md only) - Exactly 5 items in visual order */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 dark:bg-[#090d16]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,8px))] flex items-center justify-around w-full select-none"
        aria-label="Mobile Bottom Navigation"
      >
        {/* 1. Attractions */}
        <button
          type="button"
          onClick={() => navigate('#/attractions')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 text-center ${
            checkIsActive('/attractions') || checkIsActive('/attraction')
              ? 'text-orange-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
          aria-label="Attractions"
          title="Attractions"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] tracking-tight leading-tight mt-1">Attractions</span>
        </button>

        {/* 2. Destinations */}
        <button
          type="button"
          onClick={() => navigate('#/destinations')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 text-center ${
            checkIsActive('/destinations') || checkIsActive('/villages') || checkIsActive('/destination') || checkIsActive('/village')
              ? 'text-orange-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
          aria-label="Destinations"
          title="Destinations"
        >
          <Mountain className="w-5 h-5" />
          <span className="text-[10px] tracking-tight leading-tight mt-1">Destinations</span>
        </button>

        {/* 3. ✨ AI Planner (Center Action, Slightly Elevated, No Excessive Glow) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenAiPlanner) {
              onOpenAiPlanner();
            } else {
              navigate('#/ai-planner');
            }
          }}
          className="flex flex-col items-center justify-center -translate-y-2 min-w-[56px] min-h-[48px] cursor-pointer group active:scale-95"
          aria-label="AI Planner"
          title="AI Planner"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border transition-all ${
            checkIsActive('/ai-planner') || checkIsActive('/plan-my-trip')
              ? 'bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 text-slate-950 ring-2 ring-orange-400/60 shadow-orange-500/25 border-amber-300/60 scale-105'
              : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 shadow-orange-500/20 border-amber-300/40 hover:brightness-110'
          }`}>
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <span className={`text-[10px] font-bold tracking-tight mt-1 ${
            checkIsActive('/ai-planner') || checkIsActive('/plan-my-trip') ? 'text-orange-400' : 'text-slate-300'
          }`}>
            AI Planner
          </span>
        </button>

        {/* 4. Homestays */}
        <button
          type="button"
          onClick={() => navigate('#/homestays')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 text-center ${
            checkIsActive('/homestays') || checkIsActive('/homestay') || checkIsActive('/stays') || checkIsActive('/stay')
              ? 'text-orange-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
          aria-label="Homestays"
          title="Homestays"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight leading-tight mt-1">Homestays</span>
        </button>

        {/* 5. Taxi */}
        <button
          type="button"
          onClick={() => navigate('#/taxi')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer active:scale-95 text-center ${
            checkIsActive('/taxi') || checkIsActive('/book-car')
              ? 'text-orange-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 font-medium'
          }`}
          aria-label="Taxi"
          title="Taxi"
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] tracking-tight leading-tight mt-1">Taxi</span>
        </button>
      </nav>

      {/* Theme Indicator Toast */}
      <AnimatePresence>
        {activeThemeToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-950/95 dark:bg-slate-900/95 text-white py-3 px-5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 font-bold text-xs whitespace-nowrap"
          >
            <span className="text-lg">{activeThemeToast.emoji}</span>
            <span>{activeThemeToast.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 Universal Spotlight Search Modal (Shared with Desktop Hero Search) */}
      <UniversalHeroSearchModal
        isOpen={isHeroSearchOpen}
        onClose={() => setIsHeroSearchOpen(false)}
        navigate={navigate}
        initialQuery=""
        sources={searchSources}
      />

      {/* 📱 Full-Screen Dedicated Mobile Search Experience */}
      <MobileSearchModal
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        navigate={navigate}
        sources={searchSources}
      />

      {/* 👤 Clean Mobile Account & Profile Drawer */}
      <MobileAccountDrawer
        isOpen={isMobileAccountDrawerOpen}
        onClose={() => setIsMobileAccountDrawerOpen(false)}
        user={user}
        onLogin={onLogin}
        onLogout={onLogout}
        navigate={navigate}
        currentPath={currentPath}
        wishlistCount={wishlistCount}
        unreadMessagesCount={unreadChatCount}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />

      {/* 👤 HIGH-FIDELITY PROFILE PHOTO EDITOR MODAL */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={() => {
                stopCamera();
                setIsPhotoModalOpen(false);
                setSelectedImage(null);
              }}
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-950 border border-slate-850 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 z-10 flex flex-col space-y-5"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-450" />
                    <span>Manage Profile Photo</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Position, zoom, crop or capture a real-time shot</p>
                </div>
                <button 
                  onClick={() => {
                    stopCamera();
                    setIsPhotoModalOpen(false);
                    setSelectedImage(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white cursor-pointer transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Photo Editor Body & Live Camera Viewport */}
              <div className="flex flex-col items-center justify-center py-2">
                
                {isCameraActive ? (
                  <div className="relative w-72 h-72 rounded-2xl bg-black border border-slate-850 overflow-hidden flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
                      <button
                        onClick={capturePhoto}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Capture Frame</span>
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-black rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="space-y-4 w-full flex flex-col items-center">
                    
                    {/* Circle Crop Container */}
                    <div 
                      className="relative w-72 h-72 rounded-2xl bg-slate-900 border border-slate-850 overflow-hidden flex items-center justify-center cursor-move"
                      onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                      onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchStart={(e) => {
                        const touch = e.touches[0];
                        handleDragStart(touch.clientX, touch.clientY);
                      }}
                      onTouchMove={(e) => {
                        const touch = e.touches[0];
                        handleDragMove(touch.clientX, touch.clientY);
                      }}
                      onTouchEnd={handleDragEnd}
                    >
                      <img 
                        ref={imageRef}
                        src={selectedImage}
                        alt="Crop source"
                        className="max-w-none select-none pointer-events-none"
                        style={{
                          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                      />
                      {/* Circular Crop Frame Guide */}
                      <div className="absolute w-56 h-56 rounded-full border-2 border-emerald-500 shadow-[0_0_0_9999px_rgba(2,6,23,0.7)] pointer-events-none flex items-center justify-center">
                        <div className="w-full h-full border border-dashed border-emerald-500/35 rounded-full" />
                      </div>
                    </div>

                    {/* Zoom Range Slider Control */}
                    <div className="w-full space-y-1.5 px-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                        <span>Zoom Crop:</span>
                        <span>{Math.round(zoom * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.01"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 bg-slate-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                  </div>
                ) : (
                  // Image Selector Landing Panel
                  <div className="w-full py-10 border-2 border-dashed border-slate-850 rounded-2xl bg-slate-900/20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                      <UserIcon className="w-8 h-8" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-200">Select or snap traveler profile photo</p>
                      <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP files up to 10MB</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Photo Editor Options Footer */}
              <div className="flex flex-col gap-2 pt-2">
                {!selectedImage && !isCameraActive && (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-sm border border-slate-850">
                      <Upload className="w-4 h-4 text-emerald-450" />
                      <span>Upload Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                    </label>

                    <button
                      onClick={startCamera}
                      className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 shadow-sm border border-slate-850"
                    >
                      <Camera className="w-4 h-4 text-sky-400" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                )}

                {selectedImage && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="py-3 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-black transition cursor-pointer"
                    >
                      Select Different
                    </button>
                    <button
                      onClick={handleSavePhoto}
                      disabled={isSavingPhoto}
                      className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      {isSavingPhoto ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save & Use</span>
                      )}
                    </button>
                  </div>
                )}

                {user?.photoURL && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={isSavingPhoto}
                    className="w-full py-3 bg-slate-950 hover:bg-rose-950/20 text-rose-450 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-900 hover:border-rose-950/30 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Profile Photo</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
