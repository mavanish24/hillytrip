import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Route, 
  MapPin, 
  Sparkles, 
  Home, 
  UserCheck, 
  Menu, 
  X, 
  Car, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  WifiOff, 
  Sun, 
  Moon, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  Sliders,
  Palette 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import UserNotificationBell from './UserNotificationBell';
import { AVAILABLE_THEMES } from '../App';

interface NavbarProps {
  currentHash: string;
  navigate: (hash: string) => void;
  user: any; // Firebase user object
  onLogin: () => void;
  onLogout: () => void;
  isOffline: boolean;
  theme: string;
  setTheme: (theme: string) => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  isAdmin?: boolean;
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
  isAdmin = false 
}: NavbarProps) {
  const currentPath = currentHash.startsWith('#') ? currentHash.substring(1) : (currentHash || '/');
  // Drawer state
  const [isOpen, setIsOpen] = useState(false);
  
  // Accordion states
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isPartnersOpen, setIsPartnersOpen] = useState(false);

  // Theme Picker State
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  // Toast State for theme actions
  const [activeThemeToast, setActiveThemeToast] = useState<{ name: string, emoji: string } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const showThemeChangeToast = (name: string, emoji: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setActiveThemeToast({ name, emoji });
    toastTimeout.current = setTimeout(() => {
      setActiveThemeToast(null);
    }, 2200);
  };

  // Safe clear timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  const isActive = (hash: string) => {
    const cleanHash = hash.replace(/^#/, '');
    const pathToCheck = cleanHash === '' ? '/' : cleanHash;
    if (pathToCheck === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(pathToCheck);
  };

  const activeThemeObj = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100/80 dark:border-slate-800/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] selection:bg-sky-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigate('#/');
                }}
                className="flex items-center gap-3 cursor-pointer focus:outline-hidden group"
                id="nav-logo-btn"
              >
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-sky-500/10 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300 border border-slate-200/50 dark:border-slate-800 flex items-center justify-center bg-slate-100">
                  <img
                    src="/hillytrip_logo.jpg"
                    alt="HillyTrip Mountain Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback just in case, though the file is local
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-sans font-black text-2xl leading-none bg-gradient-to-r from-blue-700 via-sky-600 to-teal-600 dark:from-sky-400 dark:to-teal-400 bg-clip-text text-transparent tracking-tight">
                    HillyTrip
                  </span>
                  <span className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5 font-mono">
                    Premium India Travel
                  </span>
                </div>
              </button>
              
              {isOffline && (
                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-900/40 flex items-center gap-1.5 shrink-0 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <WifiOff className="w-3 h-3" />
                  Offline Mode
                </span>
              )}
            </div>

            {/* Header Controls: Notification Bell, Theme Mode Toggle, Side Menu Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Notification Bell */}
              <div className="flex items-center justify-center shrink-0">
                <UserNotificationBell />
              </div>

              {/* Theme Toggle Button */}
              <button
                id="theme-toggle-btn"
                onClick={(e) => {
                  e.preventDefault();
                  if (themeMode === 'light') {
                    setThemeMode('dark');
                    showThemeChangeToast('Dark Mode Activated', '🌙');
                  } else {
                    setThemeMode('light');
                    showThemeChangeToast('Light Mode Activated', '💡');
                  }
                }}
                className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-pointer select-none transition-all outline-hidden flex items-center justify-center relative"
                title="Toggle Light/Dark Mode"
              >
                {themeMode === 'light' ? (
                  <Moon className="w-5 h-5 text-slate-600 hover:text-indigo-600" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500 hover:text-amber-400" />
                )}
              </button>

              {/* Sidebar Menu Trigger (Hamburger) */}
              <button
                id="mobile-drawer-toggle"
                onClick={() => setIsOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 flex items-center justify-center cursor-pointer transition-all"
                aria-label="Open Menu"
              >
                <Menu className="w-6 h-6 sm:w-6.5 sm:h-6.5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Local Theme Change Indicator Toast */}
      <AnimatePresence>
        {activeThemeToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-950/95 dark:bg-slate-900/95 text-white py-3 px-5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 font-bold text-xs bg-slate-950/90 whitespace-nowrap"
          >
            <span className="text-lg">{activeThemeToast.emoji}</span>
            <span>{activeThemeToast.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Drawer Container */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[1000] bg-black/65 backdrop-blur-xs"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-[295px] sm:w-[330px] bg-slate-950 text-slate-100 border-l border-slate-850/70 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[2000] flex flex-col justify-between pb-6 select-none"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-450 shrink-0" />
                  <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent">HillyTrip Menu</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable links menu list */}
              <div className="flex-grow overflow-y-auto px-4 py-4 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                
                {/* 1. Profile Block inside drawer (High-Priority First Item) */}
                <div className="p-4 bg-slate-900/90 border border-slate-850 rounded-2xl flex flex-col gap-3.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 text-lg overflow-hidden shrink-0">
                      {user?.photoURL && user.photoURL.trim() !== '' ? (
                        <img src={user.photoURL || undefined} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-sky-400" />
                      )}
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-[11px] text-slate-400 font-extrabold tracking-wider uppercase leading-none font-mono">Profile</span>
                      <span className="text-xs font-black text-slate-100 truncate mt-1 leading-tight">
                        {user ? (user.displayName || user.email?.split('@')[0]) : 'Guest Traveler'}
                      </span>
                    </div>
                  </div>

                  {user ? (
                    <button
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-850/50 text-red-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out Account
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onLogin();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/10 cursor-pointer transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In with Google
                    </button>
                  )}
                </div>

                {/* Main Links */}
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      navigate('#/');
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
                      isActive('#/')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs'
                        : 'text-slate-350 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <Route className="w-4 h-4 text-sky-400 shrink-0" />
                    Search Routes
                  </button>

                  <button
                    onClick={() => {
                      navigate('#/destinations');
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
                      isActive('#/destinations')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs'
                        : 'text-slate-350 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    Destinations
                  </button>

                  <button
                    onClick={() => {
                      navigate('#/attractions');
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
                      isActive('#/attractions')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs'
                        : 'text-slate-350 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    Attractions
                  </button>

                  <button
                    onClick={() => {
                      navigate('#/contribute');
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
                      isActive('#/contribute')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs'
                        : 'text-slate-350 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    Contribute
                  </button>

                  <button
                    onClick={() => {
                      navigate('#/profile');
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
                      isActive('#/profile')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs'
                        : 'text-slate-350 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate('#/feedback');
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
                      isActive('#/feedback') || isActive('#/reviews')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs'
                        : 'text-slate-350 hover:text-white hover:bg-slate-900/80'
                    }`}
                  >
                    <span className="text-amber-400">⭐</span>
                    <span>Feedback & Reviews</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('#/offline-center');
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer border ${
                      isActive('#/offline-center')
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'text-slate-350 hover:text-white hover:bg-slate-900/80 border-transparent bg-amber-500/5'
                    }`}
                  >
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span>🏔️ Offline Hub</span>
                  </button>
                </div>

                {/* Integrated Appearance Panel inside the Drawer Menu */}
                <div id="appearance-panel-menu" className="mx-1 p-3.5 bg-slate-900/40 border border-slate-900/80 rounded-2xl space-y-3 shadow-3xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase leading-none font-mono flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-400" /> Appearance
                    </span>
                    <span className="text-[9px] bg-slate-900 text-slate-300 font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-mono">
                      {activeThemeObj.name.split(' ')[0]}
                    </span>
                  </div>

                  {/* Dark Mode toggle switch inside menu */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-900/30">
                    <span className="text-[11px] font-bold text-slate-350">Dark Mode</span>
                    <button
                      onClick={() => {
                        if (themeMode === 'light') {
                          setThemeMode('dark');
                          showThemeChangeToast('Dark Mode Activated', '🌙');
                        } else {
                          setThemeMode('light');
                          showThemeChangeToast('Light Mode Activated', '💡');
                        }
                      }}
                      className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none bg-slate-850"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-100 shadow-xs ring-0 transition duration-150 ease-in-out ${
                          themeMode === 'dark' ? 'translate-x-5 bg-emerald-450' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Themes circular swatches row */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-350">Mountain Preset Moods</span>
                      <button
                        onClick={() => setThemePickerOpen(true)}
                        className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      >
                        All Themes
                      </button>
                    </div>
                    {/* Horizontal preview swatches */}
                    <div className="flex flex-wrap gap-[7px] pt-1">
                      {AVAILABLE_THEMES.slice(0, 10).map(t => {
                        const active = theme === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTheme(t.id);
                              setThemeMode('dark'); // Automatically active dark variant for full aesthetic beauty
                              showThemeChangeToast(`${t.name}`, t.emoji);
                            }}
                            className={`w-7.5 h-7.5 rounded-full flex items-center justify-center border transition relative cursor-pointer ${
                              active 
                                ? 'border-indigo-500 scale-110 shadow-xs ring-2 ring-indigo-500/30' 
                                : 'border-slate-850 hover:border-slate-700 hover:scale-105'
                            }`}
                            style={{ backgroundColor: t.color }}
                            title={t.name}
                          >
                            <span className="text-xs shrink-0 select-none">{t.emoji}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Acrylic Divider */}
                <div className="h-px bg-slate-900/80" />

                {/* Services Section Accordion */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 text-xs font-black tracking-wide uppercase text-slate-350 hover:text-white hover:bg-slate-900/40 rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>🧳 Services</span>
                    </div>
                    {isServicesOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 transition-transform" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 transition-transform" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isServicesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden bg-slate-900/30 rounded-xl px-2 ml-1"
                      >
                        <div className="py-1.5 space-y-1">
                          <button
                            onClick={() => {
                              navigate('#/book-car');
                              setIsOpen(false);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              isActive('#/book-car') ? 'text-amber-400 bg-slate-900' : 'text-slate-405 hover:text-white'
                            }`}
                          >
                            <span>🚗 Book Car</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigate('#/destinations');
                              setIsOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-bold text-slate-405 hover:text-white cursor-pointer transition-colors"
                          >
                            <span>🏡 Book Homestay</span>
                          </button>

                          <button
                            onClick={() => {
                              navigate('#/plan-my-trip');
                              setIsOpen(false);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              isActive('#/plan-my-trip') ? 'text-amber-400 bg-slate-900' : 'text-slate-405 hover:text-white'
                            }`}
                          >
                            <span>🗺️ Plan My Trip</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Version details inside Drawer */}
              <div className="px-5 pt-3 border-t border-slate-900 flex flex-col gap-1 text-slate-500 text-[10px] font-bold font-mono">
                <span>Version 3.4.1 (Stable Build)</span>
                <span className="text-slate-650 flex items-center gap-1">
                  Active color theme: <span className="text-slate-450 uppercase">{activeThemeObj.name}</span>
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Theme Selection Picker overlay modal (Triggered on long press) */}
      <AnimatePresence>
        {themePickerOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-pointer" 
              onClick={() => setThemePickerOpen(false)}
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-slate-950 border border-slate-850 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] p-6 z-10 max-h-[85vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex justify-between items-center mb-5 border-b border-slate-900 pb-4">
                <div className="flex flex-col">
                  <h4 className="font-extrabold text-base text-white">Choose Mountain Mood</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5">Elevate your view or double-click header toggle anytime</span>
                </div>
                <button 
                  onClick={() => setThemePickerOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white cursor-pointer transition"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              
              {/* 10 Themes Grid */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {AVAILABLE_THEMES.map(t => {
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setThemeMode('dark'); // Elevate to beautiful dark color variant
                        showThemeChangeToast(`${t.name}`, t.emoji);
                        setThemePickerOpen(false);
                      }}
                      className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2.5 text-left transition duration-155 relative cursor-pointer outline-hidden ${
                        active 
                          ? 'border-emerald-500 bg-emerald-500/10' 
                          : 'border-slate-900 bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xl sm:text-2xl">{t.emoji}</span>
                        {/* Dominant swatch */}
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-2xs" 
                          style={{ backgroundColor: t.color }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] text-white leading-snug">{t.name}</span>
                        <span className="text-[8px] text-slate-450 mt-0.5 uppercase tracking-wider">
                          {active ? '✓ Active' : 'Select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
