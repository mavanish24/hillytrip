import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Compass,
  Mountain,
  MapPin,
  Route,
  Home,
  Car,
  Sparkles,
  Tag,
  Heart,
  Bell,
  Building2,
  Palette,
  HelpCircle,
  Info,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  ChevronRight,
  X,
  Sun,
  Moon,
  Shield,
  ShieldCheck,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Settings,
  Briefcase
} from 'lucide-react';
import { roleService } from '../../services/navigation/RoleService';

interface ProfileNavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin?: boolean;
  navigate: (hash: string) => void;
  currentPath: string;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAiPlanner?: () => void;
  wishlistCount?: number;
  unreadNotificationsCount?: number;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  activeTheme?: any;
  setThemePreset?: (themeId: string) => void;
  themes?: any[];
  mode?: 'all' | 'profile' | 'navigation';
}

export const ProfileNavigationMenu: React.FC<ProfileNavigationMenuProps> = ({
  isOpen,
  onClose,
  user,
  isAdmin,
  navigate,
  currentPath,
  onLogin,
  onLogout,
  onOpenAiPlanner,
  wishlistCount = 0,
  unreadNotificationsCount = 0,
  themeMode,
  setThemeMode,
  activeTheme,
  setThemePreset,
  themes = [],
  mode = 'all'
}) => {
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click for desktop popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('#desktop-header-menu-btn, #desktop-header-profile-btn, #desktop-header-signin-btn')) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleNav = (path: string, action?: () => void) => {
    onClose();
    if (action) {
      action();
    } else {
      navigate(path);
    }
  };

  const checkIsActive = (path: string) => {
    if (!currentPath) return false;
    const cleanCurrent = currentPath.split('?')[0];
    const cleanPath = path.startsWith('#') ? path.substring(1) : path;
    return cleanCurrent === cleanPath;
  };

  // Eligibility check for existing business owner
  const isBusinessOwner =
    !!user &&
    (user.role === 'partner' ||
      user.role === 'operator' ||
      user.role === 'driver' ||
      user.role === 'admin' ||
      user.role === 'moderator' ||
      user.role === 'business_owner' ||
      user.role === 'homestay_owner' ||
      user.isOperator ||
      user.isPartner ||
      user.isDriver ||
      user.isVendor ||
      user.taxiOperatorStatus === 'verified' ||
      user.is_verified_operator ||
      user.isBusinessOwner);

  const isUserAdmin =
    typeof isAdmin === 'boolean'
      ? (!!user && isAdmin)
      : (!!user &&
          (user.role === 'admin' ||
            user.role === 'super_admin' ||
            user.role === 'ADMIN' ||
            user.role === 'SUPER_ADMIN' ||
            user.isAdmin === true ||
            user.isSuperAdmin === true ||
            (Array.isArray(user.roles) &&
              (user.roles.map((r: string) => String(r).toLowerCase()).includes('admin') ||
                user.roles.map((r: string) => String(r).toLowerCase()).includes('super_admin')))));

  const handleAdminNav = () => {
    if (!isUserAdmin) return;
    handleNav('#/admin');
  };

  const handleBusinessHubClick = () => {
    onClose();
    if (isBusinessOwner) {
      if (user?.role === 'homestay_owner' || user?.isPartner || user?.role === 'partner') {
        navigate('#/partner/dashboard');
      } else {
        navigate('#/taxi/dashboard');
      }
    } else {
      navigate('#/become-partner');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[990] bg-slate-950/60 backdrop-blur-md md:bg-transparent md:backdrop-blur-none cursor-pointer"
          />

          {/* Container wrapper for positioning */}
          <div className="fixed md:absolute inset-0 md:inset-auto md:right-0 md:left-auto md:top-full md:mt-3 z-[995] pointer-events-none flex flex-col justify-end md:justify-start items-center md:items-end p-0 md:p-0">
            {/* Main Animated Sheet/Dropdown */}
            <motion.div
              ref={menuRef}
              initial={{
                opacity: 0,
                y: window.innerWidth < 768 ? 100 : -10,
                scale: window.innerWidth < 768 ? 1 : 0.96
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: window.innerWidth < 768 ? 100 : -10,
                scale: window.innerWidth < 768 ? 1 : 0.96
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="pointer-events-auto w-full md:w-88 max-h-[85vh] md:max-h-[80vh] overflow-y-auto no-scrollbar rounded-t-[32px] md:rounded-[28px] bg-slate-950/95 dark:bg-slate-950/95 text-white border border-white/15 shadow-2xl shadow-black/80 backdrop-blur-2xl p-5 flex flex-col gap-4 ring-1 ring-white/10"
            >
              {/* Mobile Drag Indicator & Header Bar */}
              <div className="flex md:hidden items-center justify-between border-b border-white/10 pb-3">
                <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
                <div className="flex items-center gap-2 pt-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    {mode === 'profile' ? 'Account & Profile' : 'Navigation'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 cursor-pointer transition-all"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Desktop Header Bar for Profile Mode */}
              {mode === 'profile' && (
                <div className="hidden md:flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs tracking-wide uppercase text-white">Account & Profile</span>
                      <p className="text-[10px] text-slate-400">Manage bookings & preferences</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Desktop Header Bar for Navigation Mode */}
              {mode === 'navigation' && (
                <div className="hidden md:flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs tracking-wide uppercase text-white">Explore & Navigate</span>
                      <p className="text-[10px] text-slate-400">Discover villages, stays & routes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* USER HEADER (AFTER LOGIN) */}
              {mode !== 'navigation' && user && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950 border border-emerald-500/20 shadow-inner flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {user?.photoURL && user.photoURL.trim() !== '' ? (
                      <img
                        src={user.photoURL}
                        alt="Profile Avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400/40 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center font-mono shrink-0 shadow-md">
                        {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{user.name || user.displayName || 'Traveler'}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {user.email || 'Account active'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNav('#/profile')}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    View Profile
                  </button>
                </div>
              )}

              {/* GUEST BANNER (PROFILE MODE) */}
              {mode === 'profile' && !user && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-white">Welcome to HillyTrip</h4>
                  <p className="text-xs text-slate-400">
                    Sign in to manage your bookings, wishlist, trips, and direct chats with hosts.
                  </p>
                </div>
              )}

              {/* PROFILE ACTIONS LIST (PROFILE MODE) */}
              {mode === 'profile' && user && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleNav('#/profile')}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                      checkIsActive('/profile')
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                        : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">My Profile & Account</span>
                        <span className="text-[10px] text-slate-400 font-normal">Personal details & security</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('#/profile?tab=bookings')}
                    className="w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">My Bookings & Trips</span>
                        <span className="text-[10px] text-slate-400 font-normal">Homestays, journeys & cabs</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('#/likes')}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                      checkIsActive('/likes')
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                        : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Saved Wishlist</span>
                        <span className="text-[10px] text-slate-400 font-normal">Saved stays & destinations</span>
                      </div>
                    </div>
                    {wishlistCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono">
                        {wishlistCount}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('#/messages')}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                      checkIsActive('/messages')
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                        : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Messages & Chat</span>
                        <span className="text-[10px] text-slate-400 font-normal">Direct host & support chats</span>
                      </div>
                    </div>
                    {unreadNotificationsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black font-mono">
                        {unreadNotificationsCount}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  {isBusinessOwner && (
                    <button
                      type="button"
                      onClick={handleBusinessHubClick}
                      className="w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border bg-amber-500/10 border-amber-400/30 text-slate-200 hover:bg-amber-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-amber-300">Operator Dashboard</span>
                          <span className="text-[10px] text-slate-400 font-normal">Manage fleet & homestays</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase">
                        Owner
                      </span>
                    </button>
                  )}

                  {isUserAdmin && (
                    <button
                      type="button"
                      onClick={handleAdminNav}
                      className="w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border bg-purple-950/40 border-purple-500/30 text-purple-200 hover:border-purple-400/60 hover:bg-purple-900/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/25 text-purple-300 border border-purple-400/40">
                          <ShieldCheck className="w-4 h-4 text-purple-300 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-purple-200">🛡️ Admin Operations</span>
                          <span className="text-[10px] text-slate-400 font-normal">Platform governance & controls</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-purple-400" />
                    </button>
                  )}
                </div>
              )}

              {/* MENU NAVIGATION LIST (FOR NAVIGATION & ALL MODES) */}
              {mode !== 'profile' && (
              <div className="space-y-1.5">
                {/* 🏔 DESTINATIONS */}
                <button
                  type="button"
                  onClick={() => handleNav('#/destinations')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/destinations') || checkIsActive('/')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Mountain className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">🏔 Destinations</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 📍 ATTRACTIONS */}
                <button
                  type="button"
                  onClick={() => handleNav('#/attractions')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/attractions')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">📍 Attractions</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 🗺 EXPLORE */}
                <button
                  type="button"
                  onClick={() => handleNav('#/explore')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/explore')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Route className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">🗺 Explore</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 🏡 STAYS */}
                <button
                  type="button"
                  onClick={() => handleNav('#/homestays')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/homestays') || checkIsActive('/stays')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      <Home className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">🏡 Stays</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 🚖 TAXI */}
                <button
                  type="button"
                  onClick={() => handleNav('#/taxi')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/taxi')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Car className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">🚖 Taxi</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* 🤖 AI PLANNER */}
                <button
                  type="button"
                  onClick={() => handleNav('#/ai-planner', onOpenAiPlanner)}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/ai-planner')
                      ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border-amber-400/50 text-amber-300 font-extrabold shadow-md'
                      : 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-400/20 text-amber-200 hover:bg-amber-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shadow-xs">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold">🤖 AI Planner</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                        Smart
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>

                {/* 🎁 OFFERS */}
                <button
                  type="button"
                  onClick={() => handleNav('#/offers')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/offers')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">🎁 Offers</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-mono font-bold">
                    Hot Deals
                  </span>
                </button>

                {/* ❤️ WISHLIST */}
                <button
                  type="button"
                  onClick={() => handleNav('#/likes')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/likes') || checkIsActive('/saved')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">❤️ Wishlist</span>
                  </div>
                  {wishlistCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono shadow-xs">
                      {wishlistCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {/* ──────────────────────── DIVIDER ──────────────────────── */}
                <div className="my-2 border-t border-white/10" />

                {/* 🏢 BUSINESS HUB */}
                <button
                  type="button"
                  onClick={handleBusinessHubClick}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/become-partner') || checkIsActive('/partner/dashboard') || checkIsActive('/taxi/dashboard') || checkIsActive('/register')
                      ? 'bg-amber-500/20 border-amber-400/50 text-white font-extrabold shadow-md'
                      : 'bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-emerald-500/10 border-amber-500/30 text-amber-200 hover:border-amber-400/50 hover:bg-amber-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-amber-300">🏢 Business Hub</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {isBusinessOwner ? 'Operator Dashboard & Fleet' : 'Partner & Onboarding Hub'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase">
                    {isBusinessOwner ? 'Dashboard' : 'Partner'}
                  </span>
                </button>

                {/* 🛡️ ADMIN OPERATIONS SHORTCUT */}
                {isUserAdmin && (
                  <>
                    <div className="my-2 border-t border-white/10" />
                    <button
                      type="button"
                      onClick={handleAdminNav}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                        checkIsActive('/admin')
                          ? 'bg-purple-500/25 border-purple-400/60 text-white font-extrabold shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400/40'
                          : 'bg-purple-950/40 border-purple-500/30 text-purple-200 hover:border-purple-400/60 hover:bg-purple-900/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/25 text-purple-300 border border-purple-400/40 shadow-xs">
                          <ShieldCheck className="w-4 h-4 text-purple-300 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-purple-200">🛡️ Admin Operations</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[9px] font-mono font-bold uppercase">
                              Console
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">Platform Control & Governance</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-purple-400" />
                    </button>
                  </>
                )}

                {/* ──────────────────────── DIVIDER ──────────────────────── */}
                <div className="my-2 border-t border-white/10" />

                {/* 🎨 THEME (ACCORDION WITH LIGHT/DARK TOGGLE + PRESETS) */}
                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsThemeOpen(!isThemeOpen)}
                    className="w-full p-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-200 hover:text-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>🎨 Theme</span>
                        {activeTheme && (
                          <span className="text-[10px] font-normal text-slate-400">
                            ({activeTheme.name})
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isThemeOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isThemeOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 space-y-3 border-t border-white/5 bg-slate-950/60"
                      >
                        {/* Light / Dark Mode Toggle */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-xs font-medium text-slate-300">Mode</span>
                          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10">
                            <button
                              type="button"
                              onClick={() => setThemeMode('light')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                themeMode === 'light'
                                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Sun className="w-3.5 h-3.5" />
                              <span>Light</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setThemeMode('dark')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                themeMode === 'dark'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Moon className="w-3.5 h-3.5" />
                              <span>Dark</span>
                            </button>
                          </div>
                        </div>

                        {/* Theme Presets */}
                        {themes && themes.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-[10px] uppercase font-mono font-bold text-slate-400 px-1">
                              Design Palettes
                            </div>
                            <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto no-scrollbar pr-1">
                              {themes.map((t) => {
                                const isActive = activeTheme?.id === t.id;
                                return (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setThemePreset && setThemePreset(t.id)}
                                    className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between border cursor-pointer transition-all ${
                                      isActive
                                        ? 'bg-emerald-500/20 border-emerald-400/50 text-white font-bold'
                                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{t.emoji || '🏔️'}</span>
                                      <span className="truncate">{t.name}</span>
                                    </div>
                                    {isActive && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ❓ HELP CENTER */}
                <button
                  type="button"
                  onClick={() => handleNav('#/support')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/support') || checkIsActive('/help')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">❓ Help Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* ℹ️ ABOUT HILLYTRIP */}
                <button
                  type="button"
                  onClick={() => handleNav('#/about')}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/about')
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                      <Info className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">ℹ️ About HillyTrip</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                  {/* LOGGED IN EXTRA: NOTIFICATIONS (FOR ALL MODE) */}
                  {mode === 'all' && user && unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleNav('#/messages')}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                        checkIsActive('/messages')
                          ? 'bg-emerald-500/15 border-emerald-400/40 text-white font-extrabold'
                          : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                          <Bell className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold">Notifications</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-black font-mono">
                        {unreadNotificationsCount}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* ──────────────────────── DIVIDER & AUTH BUTTONS (FOR 'ALL' MOBILE MODE) ──────────────────────── */}
              {mode === 'all' && (
                <div className="pt-2 border-t border-white/10 space-y-2">
                {!user ? (
                  <>
                    {/* GUEST: SIGN IN & CREATE ACCOUNT */}
                    <button
                      type="button"
                      onClick={() => handleNav('/login', onLogin)}
                      className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-98"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNav('/signup', onLogin)}
                      className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all cursor-pointer active:scale-98"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <span>Create Account</span>
                    </button>
                  </>
                ) : (
                  /* LOGGED-IN: LOGOUT */
                  <button
                    type="button"
                    onClick={() => handleNav('#/logout', onLogout)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-rose-500/30 transition-all cursor-pointer active:scale-98"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

