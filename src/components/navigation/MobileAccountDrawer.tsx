import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Calendar,
  Heart,
  Sparkles,
  MessageSquare,
  Building2,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  X,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';

interface MobileAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  navigate: (path: string) => void;
  currentPath: string;
  wishlistCount?: number;
  unreadMessagesCount?: number;
  themeMode?: 'light' | 'dark';
  setThemeMode?: (mode: 'light' | 'dark') => void;
}

export const MobileAccountDrawer: React.FC<MobileAccountDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onLogout,
  navigate,
  currentPath,
  wishlistCount = 0,
  unreadMessagesCount = 0,
  themeMode,
  setThemeMode
}) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNav = (path: string, callback?: () => void) => {
    onClose();
    if (callback) {
      callback();
    } else {
      navigate(path);
    }
  };

  const handleLogoutAction = () => {
    onClose();
    onLogout();
    navigate('#/');
  };

  const checkIsActive = (path: string) => {
    if (!currentPath) return false;
    const cleanCurrent = currentPath.split('?')[0].replace(/^#/, '');
    const cleanPath = path.replace(/^#/, '');
    return cleanCurrent === cleanPath;
  };

  // Check if partner dashboard should be visible
  const isPartner = Boolean(
    !!user &&
    (user.role === 'partner' ||
      user.role === 'operator' ||
      user.role === 'driver' ||
      user.role === 'host' ||
      user.role === 'business_owner' ||
      user.role === 'homestay_owner' ||
      user.isOperator ||
      user.isPartner ||
      user.isDriver ||
      user.isVendor ||
      user.is_business_owner ||
      user.is_partner ||
      user.is_operator ||
      user.taxiOperatorStatus === 'verified' ||
      user.is_verified_operator ||
      user.businessProfile?.isVerified ||
      user.businessProfile?.status === 'active' ||
      user.partnerProfile?.status === 'active')
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
        {/* BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
        />

        {/* BOTTOM SHEET */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-h-[85vh] bg-[#090d16] text-white border-t border-white/15 rounded-t-[28px] shadow-2xl shadow-black/80 backdrop-blur-2xl flex flex-col z-10 overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom,16px))]"
        >
          {/* DRAG HANDLE & HEADER */}
          <div className="pt-3 pb-2 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/25 mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
            <span className="font-extrabold text-sm tracking-tight text-white">
              {user ? 'My Account' : 'Welcome'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] w-11 h-11 -mr-2 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SCROLLABLE MENU BODY */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 custom-scrollbar">
            {/* 1. USER PROFILE HEADER (LOGGED IN) */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-950 border border-amber-400/25 flex items-center gap-3">
                {user?.photoURL && user.photoURL.trim() !== '' ? (
                  <img
                    src={user.photoURL}
                    alt="Profile Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-base flex items-center justify-center font-mono shrink-0 shadow-md">
                    {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-white truncate flex items-center gap-1.5">
                    <span className="truncate">{user.name || user.displayName || 'Traveler'}</span>
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {user.email || 'Account active'}
                  </div>
                </div>
              </div>
            ) : (
              /* GUEST HEADER */
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 mx-auto flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Welcome to HillyTrip</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Sign in to access your bookings, saved wishlist, personal trips & perks.
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleNav('/login', onLogin)}
                    className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNav('/signup', onLogin)}
                    className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/15 active:scale-98 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Create Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. MENU ITEMS (LOGGED-IN USER) */}
            {user && (
              <div className="space-y-1.5">
                {/* 1. My Profile */}
                <button
                  type="button"
                  onClick={() => handleNav('#/profile')}
                  className={`w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/profile')
                      ? 'bg-amber-500/15 border-amber-400/40 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">My Profile</div>
                      <div className="text-[10px] text-slate-400 truncate">Personal details & traveler profile</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>

                {/* 2. My Bookings */}
                <button
                  type="button"
                  onClick={() => handleNav('#/profile?tab=bookings')}
                  className={`w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    currentPath.includes('tab=bookings')
                      ? 'bg-amber-500/15 border-amber-400/40 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">My Bookings</div>
                      <div className="text-[10px] text-slate-400 truncate">Homestays, journeys & taxi bookings</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>

                {/* 3. My Wishlist */}
                <button
                  type="button"
                  onClick={() => handleNav('#/likes')}
                  className={`w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/likes')
                      ? 'bg-amber-500/15 border-amber-400/40 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">My Wishlist</div>
                      <div className="text-[10px] text-slate-400 truncate">Saved stays & destinations</div>
                    </div>
                  </div>
                  {wishlistCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black font-mono shrink-0">
                      {wishlistCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* 4. My Contributions */}
                <button
                  type="button"
                  onClick={() => handleNav('#/contribute')}
                  className={`w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/contribute')
                      ? 'bg-amber-500/15 border-amber-400/40 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">My Contributions</div>
                      <div className="text-[10px] text-slate-400 truncate">Add villages, reviews & photos</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>

                {/* 5. Messages / Chats (only if feature exists) */}
                <button
                  type="button"
                  onClick={() => handleNav('#/messages')}
                  className={`w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/messages')
                      ? 'bg-amber-500/15 border-amber-400/40 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">Messages & Chats</div>
                      <div className="text-[10px] text-slate-400 truncate">Direct host & taxi operator chats</div>
                    </div>
                  </div>
                  {unreadMessagesCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black font-mono shrink-0">
                      {unreadMessagesCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* 6. Partner Dashboard (only when applicable) */}
                {isPartner && (
                  <button
                    type="button"
                    onClick={() => handleNav('#/partner/dashboard')}
                    className="w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border bg-amber-500/10 border-amber-400/30 text-slate-200 hover:bg-amber-500/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-amber-300">Partner Dashboard</div>
                        <div className="text-[10px] text-slate-400 truncate">Manage fleet, homestays & bookings</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase shrink-0">
                      Partner
                    </span>
                  </button>
                )}

                {/* 7. Account Settings */}
                <button
                  type="button"
                  onClick={() => handleNav('#/settings')}
                  className={`w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    checkIsActive('/settings')
                      ? 'bg-amber-500/15 border-amber-400/40 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-700/30 text-slate-300 shrink-0">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white">Account Settings</div>
                      <div className="text-[10px] text-slate-400 truncate">Preferences, privacy & security</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
              </div>
            )}

            {/* Quick Guest Links when logged out */}
            {!user && (
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleNav('#/likes')}
                  className="w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border bg-white/5 border-white/5 text-slate-200 hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Saved Wishlist</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('#/about')}
                  className="w-full min-h-[48px] p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border bg-white/5 border-white/5 text-slate-200 hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">About & Support</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}

            {/* Optional Theme Toggle row */}
            {setThemeMode && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between px-1">
                <span className="text-xs text-slate-400 font-medium">Appearance</span>
                <button
                  type="button"
                  onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                  className="min-h-[44px] px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {themeMode === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-slate-300" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* 8. LOGOUT BUTTON (CLEARLY VISIBLE WHEN LOGGED IN) */}
            {user && (
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLogoutAction}
                  className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:bg-rose-500/35 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MobileAccountDrawer;
