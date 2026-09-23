import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Mountain,
  Car,
  Building2,
  Shield,
  Server,
  X, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  WifiOff, 
  Sun, 
  Moon, 
  Palette,
  Radio,
  Globe,
  MessageSquare,
  Settings,
  Briefcase,
  Search,
  Camera,
  Upload,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Award,
  Clock,
  Calendar,
  Boxes,
  Heart,
  MapPin,
  Home,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedLogo } from './AnimatedLogo';
import UserNotificationBell from './UserNotificationBell';
import { useThemeEngine } from './ThemeContext';
import { useBranding } from './BrandingContext';
import { ProfileNavigationMenu } from './navigation/ProfileNavigationMenu';
import { MAIN_NAVIGATION } from '../constants/navigation';
import { roleService } from '../services/navigation/RoleService';

import UniversalHeroSearchModal from './search/UniversalHeroSearchModal';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [logoImgError, setLogoImgError] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [currentHash]);

  // Outside click listener for Theme Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Swipe closing right drawer with PopState integration for Back button
  useEffect(() => {
    if (isOpen) {
      const handlePopState = () => {
        setIsOpen(false);
      };
      window.addEventListener('popstate', handlePopState);
      window.history.pushState({ drawerOpen: true }, '');

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen]);

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

  const handleDrawerNavigate = (targetHash: string) => {
    setIsOpen(false);
    setTimeout(() => {
      navigate(targetHash);
    }, 280); // Wait until closing slide completes
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

  const NAV_ITEMS = MAIN_NAVIGATION;

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
        className={`sticky top-0 left-0 right-0 z-50 select-none transition-all duration-500 ease-out h-[62px] md:h-[70px] lg:h-[76px] flex items-center ${
          isScrolled
            ? 'bg-[#090d16]/90 backdrop-blur-[36px] border-b border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.6)] px-3 sm:px-4 md:px-6 lg:px-8'
            : 'bg-slate-950/40 backdrop-blur-xl border-b border-white/[0.08] px-3 sm:px-4 md:px-6 lg:px-8'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3 lg:gap-5 min-w-0">
          
          {/* LEFT: HillyTrip Logo & Subtitle */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <button
              onClick={() => navigate('#/')}
              className="flex items-center gap-2.5 text-white hover:text-amber-300 transition-all cursor-pointer group text-left focus:outline-none"
              aria-label="HillyTrip Home"
            >
              <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 backdrop-blur-md text-amber-400 group-hover:scale-105 group-hover:border-amber-400/60 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Compass className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Plus_Jakarta_Sans'] font-black text-xl lg:text-2xl tracking-tight text-white group-hover:text-amber-300 transition-colors drop-shadow-sm leading-none">
                  HillyTrip
                </span>
                <span className="hidden sm:block text-[9px] lg:text-[10px] font-['Inter'] font-semibold tracking-[0.2em] text-slate-300 uppercase mt-1 opacity-90">
                  Himalayan Escapes
                </span>
              </div>
            </button>

            {isOffline && (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1 backdrop-blur-md shrink-0">
                <WifiOff className="w-3 h-3" />
                <span className="hidden xs:inline">Offline</span>
              </span>
            )}
          </div>

          {/* CENTER: Primary Navigation Pill (Desktop & Laptop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1.5 rounded-full bg-slate-950/50 border border-white/15 backdrop-blur-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.35)] text-xs font-semibold text-slate-100 relative font-['Inter'] shrink min-w-0">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = checkIsActive(item.path);
              const isAi = item.isAi || item.id === 'ai-planner';
              const isSecondary = item.id === 'offers' || item.id === 'journeys';

              if (isAi) {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (onOpenAiPlanner) {
                        onOpenAiPlanner();
                      } else {
                        navigate('#/ai-planner');
                      }
                    }}
                    className="navbar-font font-['Inter'] relative flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-1.5 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap text-xs font-bold bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-purple-500/25 border border-amber-300/50 text-amber-200 hover:text-white shadow-[0_0_16px_rgba(168,85,247,0.3),0_0_10px_rgba(245,158,11,0.3)] hover:shadow-[0_0_22px_rgba(168,85,247,0.5),0_0_16px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 shrink-0"
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                    <span className="tracking-wide bg-gradient-to-r from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`navbar-font font-['Inter'] relative items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-1.5 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap text-xs font-semibold ${
                    isSecondary ? 'hidden 2xl:flex' : 'flex'
                  } ${
                    active
                      ? 'bg-white/15 text-white font-bold border border-white/25 shadow-[0_0_16px_rgba(245,158,11,0.2)]'
                      : 'text-slate-200/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 transition-all ${active ? 'text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'text-slate-300'}`} />
                  <span className="tracking-wide">{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-[2px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
                  )}
                  {item.badge && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[8px] font-black tracking-wider uppercase bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xs border border-orange-300/30 leading-none shrink-0 ml-0.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT (DESKTOP & LAPTOP): Streamlined Utility Icons Group + Corner Sign In / Profile */}
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={() => setIsHeroSearchOpen(true)}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-100 hover:text-white transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_16px_rgba(255,255,255,0.2)] hover:border-white/30 active:scale-95 shrink-0"
              title="Search villages, stays, routes..."
              aria-label="Search"
            >
              <Search className="w-4 h-4 text-slate-100 hover:text-white" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => navigate('#/likes')}
              className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-100 hover:text-rose-400 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_16px_rgba(244,63,94,0.3)] hover:border-rose-400/40 active:scale-95 group shrink-0"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4 text-slate-100 group-hover:text-rose-400 group-hover:scale-110 transition-all" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black text-white bg-rose-500 rounded-full border border-slate-950 shadow-sm animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Messages / Chat Trigger */}
            <button
              id="desktop-header-messages-btn"
              onClick={() => navigate('#/messages')}
              className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-100 hover:text-amber-300 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:border-amber-400/40 active:scale-95 group shrink-0"
              title="Messages & Chat"
              aria-label="Messages"
            >
              <MessageSquare className="w-4 h-4 text-slate-100 group-hover:text-amber-300 transition-all" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black text-white bg-amber-500 rounded-full border border-slate-950 shadow-sm animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Notifications Trigger (Desktop) */}
            <div className="relative shrink-0 flex items-center justify-center">
              <UserNotificationBell />
            </div>

            {/* Theme Toggle (Desktop) */}
            <button
              id="desktop-header-theme-btn"
              onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/15 backdrop-blur-xl flex items-center justify-center text-slate-100 hover:text-amber-300 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_16px_rgba(255,255,255,0.2)] hover:border-white/30 active:scale-95 shrink-0"
              title={themeMode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-slate-100" />
              )}
            </button>

            {/* 🛡️ Admin Console Direct Shortcut (Visible only to authorized admins) */}
            {isAdmin && (
              <button
                onClick={() => navigate('#/admin')}
                className={`h-9 lg:h-10 px-2.5 lg:px-3 rounded-full border backdrop-blur-xl flex items-center gap-1.5 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-105 active:scale-95 shrink-0 ${
                  checkIsActive('/admin')
                    ? 'bg-purple-600/35 border-purple-400 text-white font-black shadow-[0_0_20px_rgba(168,85,247,0.45)] ring-1 ring-purple-400/50'
                    : 'bg-purple-950/45 border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-900/60 hover:border-purple-400/60 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                }`}
                title="Admin Panel & Operations Console"
                aria-label="Admin Panel"
              >
                <ShieldCheck className="w-4 h-4 text-purple-300" />
                <span className="text-[11px] lg:text-xs font-black tracking-wider uppercase text-purple-100 hidden 2xl:inline">Admin</span>
              </button>
            )}

            {/* Explore Menu Trigger Button */}
            <div className="relative">
              <button
                id="desktop-header-menu-btn"
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  setIsProfileOpen(false);
                }}
                className={`relative w-9 h-9 lg:w-10 lg:h-10 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-105 active:scale-95 shrink-0 ${
                  isMenuOpen
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.3)]'
                    : 'bg-white/[0.07] hover:bg-white/[0.12] border-white/15 text-slate-100 hover:text-amber-300 hover:shadow-[0_0_16px_rgba(255,255,255,0.2)] hover:border-white/30'
                }`}
                title="Explore & Navigation Menu"
                aria-label="Explore & Navigation Menu"
              >
                <Menu className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              </button>

              {/* Navigation / Explore Dropdown */}
              <div className="hidden md:block">
                <ProfileNavigationMenu
                  isOpen={isMenuOpen}
                  onClose={() => setIsMenuOpen(false)}
                  mode="navigation"
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

            {/* FAR RIGHT CORNER: Sign In Button or User Avatar Profile Pill */}
            <div className="relative shrink-0 flex items-center ml-1">
              {user ? (
                <button
                  id="desktop-header-profile-btn"
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsMenuOpen(false);
                  }}
                  className={`h-9 lg:h-10 pl-1.5 pr-3 rounded-full border backdrop-blur-xl flex items-center gap-2 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-105 active:scale-95 ring-1 ${
                    isProfileOpen
                      ? 'bg-emerald-500/20 border-emerald-400/60 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-emerald-400/50'
                      : 'bg-white/[0.07] hover:bg-white/[0.12] border-white/15 text-slate-100 hover:text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:border-amber-400/40 ring-amber-400/30'
                  }`}
                  title="User Account & Profile Menu"
                  aria-label="User Account & Profile Menu"
                >
                  {user?.photoURL && user.photoURL.trim() !== '' ? (
                    <img src={user.photoURL} alt="Profile" className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border border-white/30 shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono shrink-0 shadow-sm">
                      {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden xl:block text-xs font-bold text-slate-100 max-w-[90px] truncate">
                    {user.name || user.displayName || user.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  id="desktop-header-signin-btn"
                  onClick={onLogin}
                  className="h-9 px-3.5 lg:h-10 lg:px-5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 lg:gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_28px_rgba(245,158,11,0.65)] border border-amber-300/80 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-0.5 hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
                  title="Sign In to HillyTrip"
                  aria-label="Sign In"
                >
                  <LogIn className="w-4 h-4 text-slate-950 shrink-0 stroke-[2.5]" />
                  <span className="tracking-wide">Sign In</span>
                </button>
              )}

              {/* Desktop Profile Dropdown */}
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
          </div>

          {/* RIGHT (MOBILE) - Customized Per Guest / Logged-in Specs */}
          <div className="flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0">
            {!user ? (
              /* GUEST USER MOBILE RIGHT NAVBAR: Search, Theme Toggle, Profile Icon */
              <>
                <button
                  onClick={() => setIsHeroSearchOpen(true)}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] xs:w-10 xs:h-10 xs:min-w-[40px] xs:min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800/90 border border-white/15 backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0"
                  aria-label="Search"
                  title="Search"
                >
                  <Search className="w-4 h-4 text-slate-200" />
                </button>

                <button
                  onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] xs:w-10 xs:h-10 xs:min-w-[40px] xs:min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full text-slate-200 hover:text-amber-300 bg-slate-900/60 hover:bg-slate-800/90 border border-white/15 backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0"
                  title={themeMode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-label="Toggle Theme"
                >
                  {themeMode === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-300 animate-pulse" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-200" />
                  )}
                </button>

                {/* Compact circular avatar / profile icon for logged-out / guest user */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] xs:w-10 xs:h-10 xs:min-w-[40px] xs:min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] p-0.5 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-800/90 border border-white/20 backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0 text-slate-200 hover:text-amber-300"
                  aria-label="Account & Navigation Menu"
                  title="Account & Navigation Menu"
                >
                  <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-white/10 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-white/15 flex items-center justify-center transition-all shrink-0">
                    <UserIcon className="w-4 h-4 text-slate-200" />
                  </div>
                </button>
              </>
            ) : (
              /* LOGGED-IN USER MOBILE RIGHT NAVBAR: Search, Messages, Theme Toggle, Notifications, Admin (if admin), User Avatar */
              <>
                <button
                  onClick={() => setIsHeroSearchOpen(true)}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] xs:w-10 xs:h-10 xs:min-w-[40px] xs:min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800/90 border border-white/15 backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0"
                  aria-label="Search"
                  title="Search"
                >
                  <Search className="w-4 h-4 text-slate-200" />
                </button>

                <button
                  onClick={() => navigate('#/messages')}
                  className="relative w-9 h-9 min-w-[36px] min-h-[36px] xs:w-10 xs:h-10 xs:min-w-[40px] xs:min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full text-slate-200 hover:text-amber-300 bg-slate-900/60 hover:bg-slate-800/90 border border-white/15 backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Messages"
                  aria-label="Messages"
                >
                  <MessageSquare className="w-4 h-4 text-slate-200" />
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black text-white bg-amber-500 rounded-full border border-slate-950 shadow-sm">
                      {unreadChatCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] xs:w-10 xs:h-10 xs:min-w-[40px] xs:min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full text-slate-200 hover:text-amber-300 bg-slate-900/60 hover:bg-slate-800/90 border border-white/15 backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0"
                  title={themeMode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-label="Toggle Theme"
                >
                  {themeMode === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-300 animate-pulse" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-200" />
                  )}
                </button>

                <div className="relative shrink-0 flex items-center justify-center">
                  <UserNotificationBell />
                </div>

                {isAdmin && (
                  <button
                    onClick={() => navigate('#/admin')}
                    className={`w-9 h-9 min-w-[36px] min-h-[36px] xs:w-10 xs:h-10 xs:min-w-[40px] xs:min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-full border backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0 ${
                      checkIsActive('/admin')
                        ? 'bg-purple-600/40 border-purple-400 text-white shadow-md shadow-purple-500/30'
                        : 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/60 hover:text-white'
                    }`}
                    title="Admin Panel"
                    aria-label="Admin Panel"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-300" />
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] xs:w-10 xs:h-10 xs:min-w-[40px] xs:min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] p-0.5 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-800/90 border border-white/20 backdrop-blur-md transition-all cursor-pointer active:scale-95 shrink-0"
                  title="User Account & Navigation Menu"
                  aria-label="User Account"
                >
                  {user?.photoURL && user.photoURL.trim() !== '' ? (
                    <img src={user.photoURL} alt="Profile" className="w-7 h-7 xs:w-8 xs:h-8 rounded-full object-cover border border-white/30 shrink-0" referrerPolicy="no-referrer" />
                  ) : (user?.name || user?.displayName || user?.email) ? (
                    <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-mono shrink-0">
                      {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* 📱 FIXED BOTTOM MOBILE NAVIGATION (Visible on mobile < md only) - Icons ONLY */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] px-2 h-[60px] pb-[max(0.5rem,env(safe-area-inset-bottom,12px))] flex items-center justify-around w-full max-w-full">
        {/* 1. 🏔 Villages */}
        <button
          onClick={() => navigate('#/villages')}
          className={`min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            checkIsActive('/villages') || checkIsActive('/village') || checkIsActive('/destinations') || checkIsActive('/destination')
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 scale-105 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Villages"
          title="Villages"
        >
          <Mountain className="w-5 h-5" />
        </button>

        {/* 2. 📍 Attractions */}
        <button
          onClick={() => navigate('#/attractions')}
          className={`min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            checkIsActive('/attractions') || checkIsActive('/attraction')
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 scale-105 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Attractions"
          title="Attractions"
        >
          <MapPin className="w-5 h-5" />
        </button>

        {/* 3. 😊 Hilly (AI Planner) — Highlighted Center Button */}
        <button
          onClick={() => {
            if (onOpenAiPlanner) {
              onOpenAiPlanner();
            } else {
              navigate('#/ai-planner');
            }
          }}
          className={`relative min-w-[48px] min-h-[48px] w-12 h-12 flex items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-amber-500/30 border border-amber-300/50 -translate-y-2 ${
            checkIsActive('/ai-planner')
              ? 'bg-gradient-to-tr from-amber-400 via-amber-500 to-rose-500 text-slate-950 ring-2 ring-amber-300/60 scale-110'
              : 'bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 hover:brightness-110'
          }`}
          aria-label="Hilly AI Planner"
          title="Hilly AI Planner"
        >
          <Sparkles className="w-5.5 h-5.5 text-slate-950 animate-pulse" />
        </button>

        {/* 4. 🏡 Stay */}
        <button
          onClick={() => navigate('#/homestays')}
          className={`min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            checkIsActive('/homestays') || checkIsActive('/stays') || checkIsActive('/stay')
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 scale-105 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Stay"
          title="Stay"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* 5. 🚕 Taxi */}
        <button
          onClick={() => navigate('#/taxi')}
          className={`min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-2xl transition-all cursor-pointer active:scale-95 ${
            checkIsActive('/taxi')
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30 scale-105 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Taxi"
          title="Taxi"
        >
          <Car className="w-5 h-5" />
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

      {/* 🔍 Universal Spotlight Search Modal (Shared with Hero Search) */}
      <UniversalHeroSearchModal
        isOpen={isHeroSearchOpen}
        onClose={() => setIsHeroSearchOpen(false)}
        navigate={navigate}
        initialQuery=""
        sources={searchSources}
      />

      {/* Mobile Profile Navigation Sheet / Drawer */}
      <div className="md:hidden">
        <ProfileNavigationMenu
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
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
