import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
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
  Loader2,
  ChevronRight,
  Sparkles,
  Award,
  Clock,
  Calendar,
  Boxes
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import UserNotificationBell from './UserNotificationBell';
import { useThemeEngine } from './ThemeContext';
import { useBranding } from './BrandingContext';

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
  setNotification
}: NavbarProps) {
  const currentPath = currentHash.startsWith('#') ? currentHash.substring(1) : (currentHash || '/');
  const { settings } = useBranding();
  const { activeTheme } = useThemeEngine();
  
  // Navigation & UI state
  const [isOpen, setIsOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Universal Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [destSearchResults, setDestSearchResults] = useState<any[]>([]);
  const [attrSearchResults, setAttrSearchResults] = useState<any[]>([]);

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

  // Keybinding ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('#/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Execute fuzzy Universal Search queries in real-time
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDestSearchResults([]);
      setAttrSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [destRes, attrRes] = await Promise.all([
          fetch(`/api/destinations?search=${encodeURIComponent(searchQuery)}`),
          fetch(`/api/attractions?search=${encodeURIComponent(searchQuery)}`)
        ]);

        if (destRes.ok) {
          const dests = await destRes.json();
          setDestSearchResults(dests.slice(0, 5));
        }
        if (attrRes.ok) {
          const attrs = await attrRes.json();
          setAttrSearchResults(attrs.slice(0, 5));
        }
      } catch (err) {
        console.error('Universal Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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

  return (
    <>
      {/* Sticky Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100/80 dark:border-slate-800/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 md:h-28">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('#/')}
                className="flex items-center justify-center cursor-pointer focus:outline-none group bg-transparent"
                id="nav-logo-btn"
              >
                <img
                  src={
                    themeMode === 'dark' 
                      ? (settings?.white_logo_url || settings?.desktop_logo_url || '/hillytrip_logo.jpg?v=2')
                      : (settings?.dark_logo_url || settings?.desktop_logo_url || '/hillytrip_logo.jpg?v=2')
                  }
                  alt="HillyTrip"
                  className="h-[76px] md:h-[96px] w-auto block object-contain max-w-full transition-transform duration-200 hover:scale-[1.02] bg-transparent select-none animate-fade-in"
                  referrerPolicy="no-referrer"
                />
              </button>
              
              {isOffline && (
                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/40 flex items-center gap-1.5 shrink-0 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <WifiOff className="w-3 h-3" />
                  Offline
                </span>
              )}
            </div>

            {/* Navbar Controls: ONLY Universal Search, Messages, Notifications, Profile Avatar */}
            <div className="flex items-center gap-2.5 sm:gap-4 pr-1">
              
              {/* 🔍 Universal Search Bar (Desktop) */}
              <button
                onClick={() => navigate('#/search')}
                className="hidden md:flex items-center gap-2.5 px-4 h-11 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955 text-slate-400 dark:text-slate-500 rounded-full text-xs font-bold font-sans transition-all duration-150 hover:border-emerald-500/50 dark:hover:border-emerald-450/40 cursor-pointer w-60 shadow-inner"
              >
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="flex-grow text-left">Search destinations, treks...</span>
                <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-black text-slate-500 dark:text-slate-400">⌘K</span>
              </button>

              {/* 🔍 Universal Search Icon Button (Mobile) */}
              <button
                onClick={() => navigate('#/search')}
                className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-955 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                title="Universal Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* ☀️ / 🌙 Light / Dark Toggle button in top navbar */}
              <button
                onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-955 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer flex items-center justify-center shrink-0"
                title={themeMode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {themeMode === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-400" />
                )}
              </button>

              {/* 💬 Messages Entry Point */}
              {user && (
                <button
                  onClick={() => navigate('#/messages')}
                  id="navbar-live-chat-btn"
                  className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-955 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  title="Open Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadChatCount > 0 && (
                    <span 
                      id="chat-badge-count"
                      className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-emerald-600 rounded-full border border-white transform translate-x-1 -translate-y-1 scale-95"
                    >
                      {unreadChatCount}
                    </span>
                  )}
                </button>
              )}

              {/* 🔔 Notifications Entry Point */}
              <div className="flex items-center justify-center shrink-0">
                <UserNotificationBell />
              </div>

              {/* 👤 Profile Avatar (Single Complete Navigation Entry Trigger) */}
              <button
                id="profile-avatar-trigger"
                onClick={() => setIsOpen(true)}
                className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border-2 hover:scale-[1.04] shadow-md flex items-center justify-center text-slate-600 dark:text-slate-300 overflow-hidden shrink-0 transition-all duration-150 cursor-pointer"
                style={{ borderColor: activeThemeObj.color || '#10b981' }}
                title="Open HillyTrip Navigation Drawer"
              >
                {user?.photoURL && user.photoURL.trim() !== '' ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : user ? (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-black text-xs flex items-center justify-center font-mono select-none rounded-full">
                    {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 rounded-full">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
              </button>

            </div>
          </div>
        </div>
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

      {/* 🔍 Universal Spotlight Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative bg-slate-950 border border-slate-850 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[75vh]"
            >
              {/* Search Header */}
              <div className="flex items-center px-4 border-b border-slate-900">
                <Search className="w-5 h-5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type to search destinations, treks, attractions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 text-white placeholder-slate-500 font-sans focus:ring-0 focus:outline-none py-5 px-3 text-sm font-semibold"
                />
                {isSearching ? (
                  <Loader2 className="w-5 h-5 text-emerald-450 animate-spin shrink-0" />
                ) : searchQuery ? (
                  <button onClick={() => setSearchQuery('')} className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-white cursor-pointer transition">
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-1 rounded-md font-mono">ESC</span>
                )}
              </div>

              {/* Search Body */}
              <div className="flex-grow overflow-y-auto p-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {!searchQuery.trim() ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider block font-mono mb-2">🔥 Popular Destinations</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Sissu', 'Chatakpur', 'Ravangla', 'Lava', 'Gangtok'].map(term => (
                          <button
                            key={term}
                            onClick={() => setSearchQuery(term)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-bold rounded-full transition cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-900/50 pt-3">
                      <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider block font-mono mb-2">🛣️ Fast Pathways</h4>
                      <div className="space-y-1.5">
                        {['Darjeeling to Gangtok', 'Siliguri to Sissu'].map(path => (
                          <button
                            key={path}
                            onClick={() => setSearchQuery(path)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 hover:text-white text-left text-xs font-bold text-slate-400 transition cursor-pointer"
                          >
                            <span>{path}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : destSearchResults.length === 0 && attrSearchResults.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <p className="text-sm font-semibold">No pristine locations matched "{searchQuery}"</p>
                    <p className="text-[11px]">Try typing "Lahaul", "Watchtower", or another valley.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Destinations Results */}
                    {destSearchResults.length > 0 && (
                      <div>
                        <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider block font-mono mb-2">🏔️ Villages & Destinations</h4>
                        <div className="space-y-2">
                          {destSearchResults.map(d => (
                            <button
                              key={d.id}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                                navigate(`#/destinations/${d.id}`);
                              }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 transition text-left cursor-pointer group border border-transparent hover:border-slate-850"
                            >
                              {d.image ? (
                                <img src={d.image} className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold shrink-0">⛰️</div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-black text-white group-hover:text-emerald-400 transition truncate">{d.name}</h5>
                                <p className="text-[10px] text-slate-500 truncate">{d.district}, {d.state} • {d.tourismType}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attractions Results */}
                    {attrSearchResults.length > 0 && (
                      <div className="border-t border-slate-900/50 pt-3">
                        <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider block font-mono mb-2">⛺ Sightseeing & Attractions</h4>
                        <div className="space-y-2">
                          {attrSearchResults.map(a => (
                            <button
                              key={a.id}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                                navigate(`#/attractions/${a.id}`);
                              }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900 transition text-left cursor-pointer group border border-transparent hover:border-slate-850"
                            >
                              {a.image ? (
                                <img src={a.image} className="w-10 h-10 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-sky-950 flex items-center justify-center text-sky-400 font-bold shrink-0">⛺</div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-black text-white group-hover:text-sky-400 transition truncate">{a.name}</h5>
                                <p className="text-[10px] text-slate-500 truncate">{a.category} • Attraction</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Sliding Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Soft Dark Backdrop with Slight Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[1000] bg-black/65 backdrop-blur-[4px]"
            />

            {/* Sliding Panel */}
            <motion.div
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              drag="x"
              dragConstraints={{ left: 0 }}
              dragElastic={{ left: 0.1, right: 0.8 }}
              onDragEnd={(event, info) => {
                if (info.offset.x > 80) { // Swipe right to close
                  setIsOpen(false);
                }
              }}
              className="fixed top-0 right-0 h-full w-[310px] sm:w-[340px] bg-slate-950 text-slate-100 border-l border-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.85)] z-[2000] flex flex-col justify-between pb-6 select-none cursor-default"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-slate-900/60">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-450 shrink-0" />
                  <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">HillyTrip Nav</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white cursor-pointer transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable links menu list */}
              <div className="flex-grow overflow-y-auto px-4 py-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                
                {/* 👤 PROFILE HEADER (Inside Drawer) */}
                <motion.div variants={drawerItemVariants} className="p-4 bg-slate-900/40 border border-slate-900/80 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3.5">
                    
                    {/* Scale Animated Circular Profile Photo */}
                    <motion.div 
                      variants={avatarVariants}
                      className="relative w-14 h-14 rounded-full bg-slate-850 border-2 shadow-md flex items-center justify-center overflow-hidden shrink-0 group"
                      style={{ borderColor: activeThemeObj.color || '#10b981' }}
                    >
                      {user?.photoURL && user.photoURL.trim() !== '' ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                      ) : user ? (
                        <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-black text-lg flex items-center justify-center font-mono select-none rounded-full">
                          {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 rounded-full">
                          <UserIcon className="w-6 h-6" />
                        </div>
                      )}
                    </motion.div>

                    <div className="space-y-0.5 min-w-0 flex-grow">
                      <h4 className="text-xs font-black text-white truncate">{user ? (user.name || user.displayName || 'Explorer') : 'Guest Traveler'}</h4>
                      <span className="text-[9px] text-emerald-450 font-black uppercase tracking-wider block font-mono">{user ? 'Gold Explorer' : 'Unauthenticated'}</span>
                      {user && (
                        <span className="text-[8px] text-slate-500 font-semibold block font-mono">Member since {getMemberSince()}</span>
                      )}
                    </div>
                  </div>

                  {user && (
                    <button
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 text-[11px] font-black rounded-xl border border-slate-850 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-450" />
                      <span>Edit Profile Photo</span>
                    </button>
                  )}
                </motion.div>

                {/* 👤 MENU OPTIONS */}
                <div className="space-y-1">
                  {user && (
                    <motion.div variants={drawerItemVariants}>
                      <button
                        onClick={() => handleDrawerNavigate('#/profile')}
                        className={`w-full h-12 px-4 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-900/50 transition-all cursor-pointer text-left flex items-center gap-3.5 ${currentPath === '/profile' ? 'bg-slate-900/50 text-emerald-400' : ''}`}
                      >
                        <UserIcon className="w-4.5 h-4.5 text-emerald-450 shrink-0" />
                        <span>My Profile</span>
                      </button>
                    </motion.div>
                  )}

                  <motion.div variants={drawerItemVariants}>
                    <button
                      onClick={() => handleDrawerNavigate('#/explore')}
                      className={`w-full h-12 px-4 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-900/50 transition-all cursor-pointer text-left flex items-center gap-3.5 ${currentPath === '/explore' ? 'bg-slate-900/50 text-sky-400' : ''}`}
                    >
                      <Globe className="w-4.5 h-4.5 text-sky-400 shrink-0" />
                      <span>Explore</span>
                    </button>
                  </motion.div>

                  <motion.div variants={drawerItemVariants}>
                    <button
                      onClick={() => handleDrawerNavigate('#/inventory')}
                      className={`w-full h-12 px-4 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-900/50 transition-all cursor-pointer text-left flex items-center gap-3.5 ${currentPath === '/inventory' ? 'bg-slate-900/50 text-emerald-450' : ''}`}
                    >
                      <Calendar className="w-4.5 h-4.5 text-emerald-450 shrink-0" />
                      <span>Availability & Inventory</span>
                    </button>
                  </motion.div>

                  {user && (
                    <motion.div variants={drawerItemVariants}>
                      <button
                        onClick={() => handleDrawerNavigate('#/business')}
                        className={`w-full h-12 px-4 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-900/50 transition-all cursor-pointer text-left flex items-center gap-3.5 ${currentPath.startsWith('/business') ? 'bg-slate-900/50 text-amber-500' : ''}`}
                      >
                        <Briefcase className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                        <span>Business</span>
                      </button>
                    </motion.div>
                  )}

                  {user && (
                    <motion.div variants={drawerItemVariants}>
                      <button
                        onClick={() => handleDrawerNavigate('#/settings')}
                        className={`w-full h-12 px-4 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-900/50 transition-all cursor-pointer text-left flex items-center gap-3.5 ${currentPath === '/settings' ? 'bg-slate-900/50 text-purple-400' : ''}`}
                      >
                        <Settings className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                        <span>Settings</span>
                      </button>
                    </motion.div>
                  )}

                  {user ? (
                    <motion.div variants={drawerItemVariants}>
                      <button
                        onClick={() => {
                          onLogout();
                          setIsOpen(false);
                        }}
                        className="w-full h-12 px-4 rounded-xl text-xs font-black text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer text-left flex items-center gap-3.5"
                      >
                        <LogOut className="w-4.5 h-4.5 shrink-0 text-rose-500" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div variants={drawerItemVariants}>
                      <button
                        onClick={() => {
                          onLogin();
                          setIsOpen(false);
                        }}
                        className="w-full h-12 px-4 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 transition-all cursor-pointer text-left flex items-center justify-center gap-2 font-mono"
                      >
                        <LogIn className="w-4 h-4 shrink-0" />
                        <span>Login / Sign Up</span>
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* 🎨 THEME & PERSONALIZATION */}
                <motion.div variants={drawerItemVariants} className="mt-2 border-t border-slate-900 pt-3">
                  <button
                    onClick={() => {
                      localStorage.setItem('hillytrip_settings_tab', 'appearance');
                      handleDrawerNavigate('#/settings');
                    }}
                    className="w-full h-12 px-4 rounded-xl text-xs font-black text-slate-300 hover:text-white hover:bg-slate-900/50 transition-all cursor-pointer text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm shrink-0">🎨</span>
                      <span>Theme & Personalization</span>
                    </div>
                    <span className="text-emerald-400 font-bold">→</span>
                  </button>
                </motion.div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
