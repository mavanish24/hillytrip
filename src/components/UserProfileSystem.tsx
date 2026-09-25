import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User as UserIcon, LayoutDashboard, Calendar, Heart, Sparkles, 
  MessageSquare, Building2, Settings, LogOut, HelpCircle, Camera, 
  MapPin, Mail, Phone, Compass, Mountain, Home, Car, ChevronRight, 
  ExternalLink, Edit3, Check, X, Clock, ShieldCheck, Tag, ArrowRight, 
  Loader2, Trash2, AlertCircle, Sun, Moon, CheckCircle2, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Destination, Attraction, Homestay } from '../types';
import { getOffers } from '../services/offers/OfferEngine';
import { useThemeEngine } from './ThemeContext';

export interface UserProfileSystemProps {
  user: User;
  profileUser?: User;
  onUpdateUser: (updatedUser: User) => void;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  onLogout: () => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  likes?: any[];
  toggleLike?: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  currentPath?: string;
}

type TabKey = 'dashboard' | 'profile' | 'bookings' | 'wishlist' | 'contributions' | 'messages' | 'settings' | 'offers';

interface RealBooking {
  id: string;
  serviceName?: string;
  homestayName?: string;
  destinationName?: string;
  leadTitle?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  checkInDate?: string;
  checkOutDate?: string;
  date?: string;
  createdAt?: string;
  status?: string;
  amount?: number | string;
  totalAmount?: number | string;
  price?: number | string;
  leadType?: string;
  notes?: string;
}

interface RealConversation {
  id: string;
  peerName?: string;
  peerRole?: string;
  peerAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  updatedAt?: string;
  unreadCount?: number;
  subject?: string;
}

interface RealContribution {
  id: string;
  type: string;
  details: string;
  contributorName?: string;
  contributorMobile?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export default function UserProfileSystem({
  user,
  profileUser,
  onUpdateUser,
  navigate,
  setNotification,
  onLogout,
  destinations = [],
  attractions = [],
  homestays = [],
  likes = [],
  toggleLike,
  currentPath = ''
}: UserProfileSystemProps) {
  const activeUser = profileUser || user;
  const { themeMode, setThemeMode } = useThemeEngine() as any;

  // 1. Navigation Tab State (synced with URL tab parameter)
  const getInitialTab = (): TabKey => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const fullUrl = `${currentPath} ${hash}`;
    if (fullUrl.includes('tab=bookings') || fullUrl.includes('/bookings')) return 'bookings';
    if (fullUrl.includes('tab=wishlist') || fullUrl.includes('/wishlist')) return 'wishlist';
    if (fullUrl.includes('tab=contributions') || fullUrl.includes('/contribute')) return 'contributions';
    if (fullUrl.includes('tab=messages') || fullUrl.includes('/messages')) return 'messages';
    if (fullUrl.includes('tab=settings') || fullUrl.includes('/settings')) return 'settings';
    if (fullUrl.includes('tab=profile')) return 'profile';
    if (fullUrl.includes('tab=offers') || fullUrl.includes('/offers')) return 'offers';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);

  // Sync tab with external hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '';
      if (hash.includes('tab=bookings')) setActiveTab('bookings');
      else if (hash.includes('tab=wishlist')) setActiveTab('wishlist');
      else if (hash.includes('tab=contributions')) setActiveTab('contributions');
      else if (hash.includes('tab=messages')) setActiveTab('messages');
      else if (hash.includes('tab=settings')) setActiveTab('settings');
      else if (hash.includes('tab=profile')) setActiveTab('profile');
      else if (hash.includes('tab=offers')) setActiveTab('offers');
      else if (hash === '#/dashboard' || hash === '#/profile') setActiveTab('dashboard');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // 2. Partner Eligibility Check
  const isPartnerEligible = Boolean(
    activeUser &&
    ((activeUser.role as string) === 'partner' ||
      (activeUser.role as string) === 'operator' ||
      (activeUser.role as string) === 'driver' ||
      (activeUser.role as string) === 'host' ||
      (activeUser.role as string) === 'admin' ||
      (activeUser.role as string) === 'moderator' ||
      (activeUser.role as string) === 'business_owner' ||
      (activeUser.role as string) === 'homestay_owner' ||
      (activeUser as any).isOperator ||
      (activeUser as any).isPartner ||
      (activeUser as any).isDriver ||
      (activeUser as any).isVendor ||
      (activeUser as any).is_business_owner ||
      (activeUser as any).is_partner ||
      (activeUser as any).is_operator ||
      (activeUser as any).taxiOperatorStatus === 'verified' ||
      (activeUser as any).is_verified_operator ||
      (activeUser as any).businessProfile?.isVerified ||
      (activeUser as any).businessProfile?.status === 'active' ||
      (activeUser as any).partnerProfile?.status === 'active')
  );

  // 3. Real Offers Check
  const availableOffers = useMemo(() => {
    try {
      const stored = getOffers();
      return Array.isArray(stored) ? stored.filter(o => o && o.id) : [];
    } catch {
      return [];
    }
  }, []);
  const hasRealOffers = availableOffers.length > 0;

  // 4. Real Bookings Data
  const [bookings, setBookings] = useState<RealBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  const fetchUserBookings = useCallback(async () => {
    if (!activeUser) return;
    setLoadingBookings(true);
    try {
      const identifier = activeUser.email || (activeUser as any).mobile || (activeUser as any).phone || activeUser.id || '';
      const res = await fetch(`/api/booking-leads?role=customer&identifier=${encodeURIComponent(identifier)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.leads)) {
          setBookings(data.leads);
        }
      }
    } catch {
      // Fallback: check local storage if offline
      try {
        const local = localStorage.getItem('hillytrip_user_bookings');
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) setBookings(parsed);
        }
      } catch {}
    } finally {
      setLoadingBookings(false);
    }
  }, [activeUser]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  // 5. Real Wishlist Items Resolution
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const readSavedIds = useCallback(() => {
    try {
      const idSet = new Set<string>();
      const storageKeys = [
        'hillytrip_likes',
        'hillytrip_saved',
        'hillytrip_wishlist',
        'hillytrip_homestay_wishlist',
        'hillytrip_saved_places'
      ];

      storageKeys.forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                if (typeof item === 'string' && item.trim()) {
                  idSet.add(item.trim());
                } else if (item && typeof item === 'object') {
                  if (item.id) idSet.add(String(item.id));
                  else if (item.contentId) idSet.add(String(item.contentId));
                }
              });
            } else if (parsed && typeof parsed === 'object') {
              Object.keys(parsed).forEach((k) => idSet.add(k));
            }
          } catch {}
        }
      });

      if (Array.isArray(likes)) {
        likes.forEach((l) => {
          if (l && l.contentId) idSet.add(String(l.contentId));
        });
      }

      setSavedIds(Array.from(idSet));
    } catch {
      setSavedIds([]);
    }
  }, [likes]);

  useEffect(() => {
    readSavedIds();
    window.addEventListener('storage', readSavedIds);
    return () => window.removeEventListener('storage', readSavedIds);
  }, [readSavedIds]);

  // Resolve saved items to actual entities
  const wishlistItems = useMemo(() => {
    const items: Array<{
      id: string;
      name: string;
      category: 'village' | 'attraction' | 'homestay';
      location?: string;
      image?: string;
      slug?: string;
    }> = [];

    const idSet = new Set(savedIds);

    // 1. Homestays
    homestays.forEach(h => {
      if (idSet.has(h.id) || idSet.has(String(h.id))) {
        items.push({
          id: h.id,
          name: h.name,
          category: 'homestay',
          location: (h as any).village || (h as any).location || h.address || 'Himalayas',
          image: h.images?.[0] || (h as any).photos?.[0] || (h as any).image,
          slug: h.id
        });
      }
    });

    // 2. Destinations / Villages
    destinations.forEach(d => {
      if (idSet.has(d.id) || idSet.has(String(d.id)) || (d.slug && idSet.has(d.slug))) {
        items.push({
          id: d.id,
          name: d.name,
          category: 'village',
          location: d.state || (d as any).region || 'Himalayas',
          image: (d as any).imageUrl || (d as any).image || (d as any).heroImage,
          slug: d.slug || d.id
        });
      }
    });

    // 3. Attractions
    attractions.forEach(a => {
      if (idSet.has(a.id) || idSet.has(String(a.id))) {
        items.push({
          id: a.id,
          name: a.name,
          category: 'attraction',
          location: (a as any).location || a.district || 'Scenic Point',
          image: (a as any).imageUrl || (a as any).image || (a as any).images?.[0],
          slug: a.id
        });
      }
    });

    return items;
  }, [savedIds, destinations, attractions, homestays]);

  // Remove item from wishlist
  const handleRemoveWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const nextIds = savedIds.filter(itemId => itemId !== id);
      setSavedIds(nextIds);
      ['hillytrip_likes', 'hillytrip_saved', 'hillytrip_wishlist', 'hillytrip_homestay_wishlist', 'hillytrip_saved_places'].forEach(key => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const updated = parsed.filter((item: any) => {
                const checkId = typeof item === 'string' ? item : item?.id || item?.contentId;
                return checkId !== id;
              });
              localStorage.setItem(key, JSON.stringify(updated));
            }
          } catch {}
        }
      });
      setNotification({ type: 'info', message: 'Item removed from your wishlist.' });
    } catch {
      setNotification({ type: 'error', message: 'Failed to update wishlist.' });
    }
  };

  // 6. Real Contributions
  const [contributions, setContributions] = useState<RealContribution[]>([]);
  useEffect(() => {
    try {
      const local = localStorage.getItem('hillytrip_community_contributions');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          setContributions(parsed);
        }
      }
    } catch {
      setContributions([]);
    }
  }, []);

  // 7. Real Messages / Conversations
  const [conversations, setConversations] = useState<RealConversation[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  const fetchConversations = useCallback(async () => {
    if (!activeUser?.id) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messaging/conversations?userId=${encodeURIComponent(activeUser.id)}&role=${encodeURIComponent(activeUser.role || 'traveler')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      }
    } catch {
      setConversations([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeUser]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 8. Profile Editing Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(activeUser.name || (activeUser as any).displayName || '');
  const [editPhone, setEditPhone] = useState((activeUser as any).phone || (activeUser as any).phoneNumber || (activeUser as any).mobile || '');
  const [editBio, setEditBio] = useState(activeUser.bio || '');
  const [editLocation, setEditLocation] = useState((activeUser as any).homeLocation || (activeUser as any).location || '');
  const [editPhotoURL, setEditPhotoURL] = useState(activeUser.photoURL || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleOpenEditModal = () => {
    setEditName(activeUser.name || (activeUser as any).displayName || '');
    setEditPhone((activeUser as any).phone || (activeUser as any).phoneNumber || (activeUser as any).mobile || '');
    setEditBio(activeUser.bio || '');
    setEditLocation((activeUser as any).homeLocation || (activeUser as any).location || '');
    setEditPhotoURL(activeUser.photoURL || '');
    setIsEditModalOpen(true);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setNotification({ type: 'error', message: 'Image size should be less than 5MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditPhotoURL(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updatedUser: User = {
        ...activeUser,
        name: editName.trim() || activeUser.name,
        displayName: editName.trim() || (activeUser as any).displayName,
        phone: editPhone.trim(),
        bio: editBio.trim(),
        homeLocation: editLocation.trim(),
        photoURL: editPhotoURL.trim() || activeUser.photoURL
      } as any;

      onUpdateUser(updatedUser);
      setIsEditModalOpen(false);
      setNotification({ type: 'success', message: 'Your profile has been updated successfully.' });
    } catch {
      setNotification({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 9. Real Activity Generation (Strictly from real data)
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      title: string;
      time?: string;
      icon: any;
      type: 'booking' | 'wishlist' | 'message';
    }> = [];

    // Real bookings
    bookings.slice(0, 2).forEach(b => {
      activities.push({
        id: `act-b-${b.id}`,
        title: `Booked ${b.homestayName || b.serviceName || b.destinationName || 'Himalayan Stay'} (${b.status || 'Pending'})`,
        time: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : undefined,
        icon: Calendar,
        type: 'booking'
      });
    });

    // Real wishlist
    wishlistItems.slice(0, 2).forEach(w => {
      activities.push({
        id: `act-w-${w.id}`,
        title: `Saved ${w.name} to your wishlist`,
        icon: Heart,
        type: 'wishlist'
      });
    });

    // Real messages
    conversations.slice(0, 2).forEach(c => {
      activities.push({
        id: `act-m-${c.id}`,
        title: `Message from ${c.peerName || 'Local Host'}`,
        time: c.lastMessageTime || c.updatedAt ? new Date(c.lastMessageTime || c.updatedAt || '').toLocaleDateString() : undefined,
        icon: MessageSquare,
        type: 'message'
      });
    });

    return activities;
  }, [bookings, wishlistItems, conversations]);

  // Actual display name
  const actualUserName = activeUser.name || (activeUser as any).displayName || activeUser.email?.split('@')[0] || 'Traveler';
  const actualUserEmail = activeUser.email || '';

  // Helpers
  const getStatusBadge = (status?: string) => {
    const s = (status || 'pending').toLowerCase();
    if (s.includes('confirm') || s === 'completed' || s === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Check className="w-3 h-3" /> {status || 'Confirmed'}
        </span>
      );
    }
    if (s.includes('cancel') || s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <X className="w-3 h-3" /> {status || 'Cancelled'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <Clock className="w-3 h-3" /> {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="w-full text-slate-850 dark:text-slate-100 selection:bg-orange-500/20">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ========================================================
            DESKTOP LEFT ACCOUNT NAVIGATION SIDEBAR
            ======================================================== */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs sticky top-24">
          
          {/* User Profile Card Top */}
          <div className="flex flex-col items-center text-center pb-5 border-b border-slate-150 dark:border-slate-800/80">
            <div className="relative group mb-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-400 to-amber-500 p-0.5 shadow-sm">
                {activeUser.photoURL ? (
                  <img 
                    src={activeUser.photoURL} 
                    alt={actualUserName}
                    className="w-full h-full object-cover rounded-[14px] bg-slate-100 dark:bg-slate-800"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-2xl">
                    {actualUserName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button 
                onClick={handleOpenEditModal}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 transition shadow-xs cursor-pointer"
                title="Update avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white truncate max-w-[200px]">
              {actualUserName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] mb-3">
              {actualUserEmail}
            </p>

            <button
              onClick={handleOpenEditModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 rounded-lg transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Primary Navigation List */}
          <nav className="py-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                activeTab === 'dashboard'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                activeTab === 'profile'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                activeTab === 'bookings'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>My Bookings</span>
              </div>
              {bookings.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'bookings' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {bookings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                activeTab === 'wishlist'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                <span>My Wishlist</span>
              </div>
              {wishlistItems.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {wishlistItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('contributions')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                activeTab === 'contributions'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" />
                <span>My Contributions</span>
              </div>
              {contributions.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'contributions' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {contributions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                activeTab === 'messages'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Messages</span>
              </div>
              {conversations.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'messages' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {conversations.length}
                </span>
              )}
            </button>
          </nav>

          {/* Business & Partner Section */}
          <div className="py-3 border-t border-slate-150 dark:border-slate-800/80 space-y-1">
            <button
              onClick={() => navigate('#/become-partner')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-orange-500" />
                <span>Business Onboarding</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </button>

            {/* Partner Dashboard (Strictly for verified/eligible partners) */}
            {isPartnerEligible && (
              <button
                onClick={() => navigate('#/partner/dashboard')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Partner Dashboard</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Offers (Strictly if real offers exist in system) */}
            {hasRealOffers && (
              <button
                onClick={() => setActiveTab('offers')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  activeTab === 'offers'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>Offers</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
                  {availableOffers.length}
                </span>
              </button>
            )}
          </div>

          {/* Settings, Support & Logout */}
          <div className="pt-3 border-t border-slate-150 dark:border-slate-800/80 space-y-1">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                activeTab === 'settings'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={() => navigate('#/support')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer text-left"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </button>

            {/* Logout button (Prominent Red) */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer text-left mt-2"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ========================================================
            MAIN DASHBOARD CONTENT AREA
            ======================================================== */}
        <main className="flex-1 w-full min-w-0">

          {/* MOBILE PROFILE HEADER & TABS (Visible only on < lg screens) */}
          <div className="lg:hidden mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
            {/* Mobile Header Row */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-150 dark:border-slate-800">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-tr from-orange-400 to-amber-500 p-0.5 shrink-0">
                {activeUser.photoURL ? (
                  <img 
                    src={activeUser.photoURL} 
                    alt={actualUserName}
                    className="w-full h-full object-cover rounded-[10px]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-[10px] bg-white dark:bg-slate-900 flex items-center justify-center text-orange-600 font-bold text-lg">
                    {actualUserName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-base text-slate-900 dark:text-white truncate">
                  {actualUserName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {actualUserEmail}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={handleOpenEditModal}
                    className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Profile
                  </button>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer shrink-0"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Tabs (Min 44px touch targets, wrapped/scrollable) */}
            <div className="pt-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'profile', label: 'Profile', icon: UserIcon },
                { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
                { id: 'wishlist', label: `Wishlist (${wishlistItems.length})`, icon: Heart },
                { id: 'contributions', label: 'Contributions', icon: Sparkles },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabKey)}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Partner quick link if eligible */}
            {isPartnerEligible && (
              <div className="mt-3 pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Partner Verified
                </span>
                <button
                  onClick={() => navigate('#/partner/dashboard')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 underline cursor-pointer"
                >
                  Partner Dashboard →
                </button>
              </div>
            )}
          </div>

          {/* ========================================================
              TAB 1: DASHBOARD OVERVIEW
              ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header Greeting Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold mb-3">
                    <Compass className="w-3.5 h-3.5" />
                    <span>HillyTrip Traveler Account</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                    Welcome back, {actualUserName}
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    Manage your verified stays, taxi bookings, saved mountain places, and account details in one place.
                  </p>
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-10 text-white pointer-events-none">
                  <Mountain className="w-64 h-64" />
                </div>
              </div>

              {/* QUICK SUMMARY CARDS (Strictly calculated from real data) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                
                {/* 1. Total Bookings */}
                <div 
                  onClick={() => setActiveTab('bookings')}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-300 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Bookings</span>
                    <div className="p-2 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {loadingBookings ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : bookings.length}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block group-hover:text-orange-600 transition">
                    View stays & rides →
                  </span>
                </div>

                {/* 2. Wishlist Items */}
                <div 
                  onClick={() => setActiveTab('wishlist')}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-300 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Wishlist Items</span>
                    <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                      <Heart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {wishlistItems.length}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block group-hover:text-rose-600 transition">
                    Saved destinations →
                  </span>
                </div>

                {/* 3. Contributions */}
                <div 
                  onClick={() => setActiveTab('contributions')}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-300 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Contributions</span>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {contributions.length}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block group-hover:text-amber-600 transition">
                    Community spots →
                  </span>
                </div>

                {/* 4. Messages */}
                <div 
                  onClick={() => setActiveTab('messages')}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-300 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Conversations</span>
                    <div className="p-2 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {loadingMessages ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : conversations.length}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block group-hover:text-sky-600 transition">
                    Host discussions →
                  </span>
                </div>

              </div>

              {/* QUICK ACTIONS BAR */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  Quick Travel Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => navigate('#/homestays')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-left transition cursor-pointer flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Find Stays</div>
                      <div className="text-[10px] text-slate-500">Local homestays</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('#/villages')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-left transition cursor-pointer flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 shrink-0">
                      <Mountain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Villages</div>
                      <div className="text-[10px] text-slate-500">Curated hamlets</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('#/taxi')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-left transition cursor-pointer flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Book Taxi</div>
                      <div className="text-[10px] text-slate-500">Mountain routes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('#/ai-planner')}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 text-left transition cursor-pointer flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">AI Planner</div>
                      <div className="text-[10px] text-slate-500">Smart itineraries</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* RECENT BOOKINGS PREVIEW */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Bookings</h3>
                    <p className="text-xs text-slate-500">Your latest stay and taxi reservations</p>
                  </div>
                  {bookings.length > 0 && (
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      View All ({bookings.length}) →
                    </button>
                  )}
                </div>

                {loadingBookings ? (
                  <div className="py-8 flex justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                    <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No bookings yet</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                      Start planning your next mountain escape with local homestays or point-to-point cabs.
                    </p>
                    <button
                      onClick={() => navigate('#/homestays')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Explore Homestays</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 2).map(booking => (
                      <div 
                        key={booking.id}
                        className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 shrink-0 mt-0.5">
                            {booking.leadType === 'taxi' ? <Car className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {booking.homestayName || booking.serviceName || booking.destinationName || booking.leadTitle || 'Himalayan Booking'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                              {booking.checkInDate && (
                                <span>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</span>
                              )}
                              {booking.date && (
                                <span>Date: {new Date(booking.date).toLocaleDateString()}</span>
                              )}
                              {booking.createdAt && !booking.checkInDate && !booking.date && (
                                <span>Created: {new Date(booking.createdAt).toLocaleDateString()}</span>
                              )}
                              <span className="font-mono text-slate-400">Ref: #{booking.id.slice(-6)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <div>{getStatusBadge(booking.status)}</div>
                          <button
                            onClick={() => setActiveTab('bookings')}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SAVED PLACES PREVIEW */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Wishlist Highlights</h3>
                    <p className="text-xs text-slate-500">Places you saved for future journeys</p>
                  </div>
                  {wishlistItems.length > 0 && (
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      View All ({wishlistItems.length}) →
                    </button>
                  )}
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6">
                    <Heart className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Your wishlist is empty</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                      Explore authentic villages, attractions, and mountain homestays to save your favorites.
                    </p>
                    <button
                      onClick={() => navigate('#/villages')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Explore Destinations</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {wishlistItems.slice(0, 3).map(item => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          if (item.category === 'homestay') navigate(`#/homestay/${item.slug || item.id}`);
                          else if (item.category === 'village') navigate(`#/village/${item.slug || item.id}`);
                          else navigate(`#/attraction/${item.slug || item.id}`);
                        }}
                        className="group rounded-xl overflow-hidden border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 hover:shadow-md transition cursor-pointer flex flex-col"
                      >
                        <div className="h-28 w-full overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Mountain className="w-8 h-8" />
                            </div>
                          )}
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                            {item.category}
                          </span>
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {item.name}
                            </h4>
                            {item.location && (
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-orange-500" />
                                {item.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECENT ACTIVITY SECTION (Rendered only if real activities exist) */}
              {recentActivities.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">
                    Recent Activity
                  </h3>
                  <div className="space-y-2.5">
                    {recentActivities.map(act => {
                      const Icon = act.icon;
                      return (
                        <div key={act.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-orange-600">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{act.title}</span>
                          </div>
                          {act.time && (
                            <span className="text-slate-400 text-[11px]">{act.time}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================
              TAB 2: MY PROFILE
              ======================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-150 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-orange-400 to-amber-500 p-0.5 shrink-0 shadow-sm">
                      {activeUser.photoURL ? (
                        <img 
                          src={activeUser.photoURL} 
                          alt={actualUserName}
                          className="w-full h-full object-cover rounded-[14px]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center text-orange-600 font-bold text-xl">
                          {actualUserName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {actualUserName}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {actualUserEmail}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Verified Authenticated Account
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenEditModal}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile Details</span>
                  </button>
                </div>

                {/* Profile Information List */}
                <div className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium block mb-1">Full Name</span>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{actualUserName}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium block mb-1">Email Address</span>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{actualUserEmail}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium block mb-1">Contact Phone</span>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {(activeUser as any).phone || (activeUser as any).phoneNumber || (activeUser as any).mobile || (
                          <span className="text-slate-400 font-normal italic">Not provided (click edit to add)</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-medium block mb-1">Home Region / City</span>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {(activeUser as any).homeLocation || (activeUser as any).location || (
                          <span className="text-slate-400 font-normal italic">Not provided</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 font-medium block mb-1">About / Traveler Bio</span>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeUser.bio || (
                        <span className="text-slate-400 italic">No personal bio added yet. Tell other mountain travelers about your journeys.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: MY BOOKINGS
              ======================================================== */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-150 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Bookings</h2>
                    <p className="text-xs text-slate-500">Direct bookings, taxi transfers, and homestay inquiries</p>
                  </div>
                  <button
                    onClick={() => navigate('#/homestays')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Explore Homestays</span>
                  </button>
                </div>

                {loadingBookings ? (
                  <div className="py-12 flex justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                    <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No bookings yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                      Start planning your next mountain escape. Once you reserve a verified homestay or taxi, your booking confirmations and receipt timeline will appear here.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => navigate('#/homestays')}
                        className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Explore Homestays</span>
                      </button>
                      <button
                        onClick={() => navigate('#/taxi')}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Book a Taxi</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map(booking => (
                      <div 
                        key={booking.id}
                        className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 transition bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="p-3 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 shrink-0 mt-1">
                            {booking.leadType === 'taxi' ? <Car className="w-6 h-6" /> : <Home className="w-6 h-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {booking.leadType || 'Booking'}
                              </span>
                              <span className="text-xs font-mono text-slate-400">Ref: #{booking.id.slice(-8)}</span>
                            </div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-white">
                              {booking.homestayName || booking.serviceName || booking.destinationName || booking.leadTitle || 'Himalayan Stay'}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                              {booking.checkInDate && (
                                <span>Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</span>
                              )}
                              {booking.checkOutDate && (
                                <span>Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                              )}
                              {booking.date && (
                                <span>Date: {new Date(booking.date).toLocaleDateString()}</span>
                              )}
                              {(booking.amount || booking.totalAmount || booking.price) && (
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Amount: ₹{booking.amount || booking.totalAmount || booking.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                          <div>{getStatusBadge(booking.status)}</div>
                          <button
                            onClick={() => {
                              // Direct deep link to booking engine inquiry
                              if (booking.homestayName) {
                                navigate(`#/homestays`);
                              } else {
                                navigate(`#/taxi`);
                              }
                            }}
                            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: MY WISHLIST
              ======================================================== */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-150 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Wishlist</h2>
                    <p className="text-xs text-slate-500">Mountain villages, attractions, and stays saved to your account</p>
                  </div>
                  <button
                    onClick={() => navigate('#/villages')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore Destinations</span>
                  </button>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                    <Heart className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Your wishlist is empty</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                      Save places you want to visit across Himachal, Uttarakhand, Ladakh, and Sikkim. Tap the heart icon anywhere on HillyTrip to save.
                    </p>
                    <button
                      onClick={() => navigate('#/villages')}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Explore Destinations</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {wishlistItems.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          if (item.category === 'homestay') navigate(`#/homestay/${item.slug || item.id}`);
                          else if (item.category === 'village') navigate(`#/village/${item.slug || item.id}`);
                          else navigate(`#/attraction/${item.slug || item.id}`);
                        }}
                        className="group rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-orange-300 transition cursor-pointer flex flex-col"
                      >
                        <div className="h-40 w-full overflow-hidden bg-slate-200 dark:bg-slate-800 relative">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Mountain className="w-10 h-10" />
                            </div>
                          )}
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                            {item.category}
                          </span>
                          <button
                            onClick={(e) => handleRemoveWishlist(item.id, e)}
                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white flex items-center justify-center transition"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-orange-600 transition">
                              {item.name}
                            </h4>
                            {item.location && (
                              <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                {item.location}
                              </p>
                            )}
                          </div>
                          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-orange-600">
                            <span>Open details</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: MY CONTRIBUTIONS
              ======================================================== */}
          {activeTab === 'contributions' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-150 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Contributions</h2>
                    <p className="text-xs text-slate-500">Uncharted trails, road condition reports, and homestay recommendations</p>
                  </div>
                  <button
                    onClick={() => navigate('#/contribute')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Contribute to HillyTrip</span>
                  </button>
                </div>

                {contributions.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                    <Sparkles className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No contributions yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                      Help other travelers discover the mountains. Share hidden waterfalls, scenic viewpoints, or report live road status.
                    </p>
                    <button
                      onClick={() => navigate('#/contribute')}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Contribute to HillyTrip</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contributions.map(contrib => (
                      <div 
                        key={contrib.id}
                        className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              {contrib.type}
                            </span>
                            <span className="text-xs text-slate-400">
                              Submitted {new Date(contrib.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                            {contrib.details}
                          </p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            contrib.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}>
                            {contrib.status === 'Approved' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {contrib.status || 'Pending Validation'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 6: MESSAGES
              ======================================================== */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-150 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages & Inquiries</h2>
                    <p className="text-xs text-slate-500">Live conversations with local homestay hosts and verified taxi drivers</p>
                  </div>
                  <button
                    onClick={() => navigate('#/messages')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Full Inbox</span>
                  </button>
                </div>

                {loadingMessages ? (
                  <div className="py-12 flex justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No messages yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                      Reach out to local hosts or drivers to plan your journey. When you inquire about a stay or custom cab route, conversations will appear here.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => navigate('#/homestays')}
                        className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Explore Homestays</span>
                      </button>
                      <button
                        onClick={() => navigate('#/taxi')}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Find a Taxi</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-150 dark:divide-slate-800">
                    {conversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => navigate('#/messages')}
                        className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 px-3 rounded-xl transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 flex items-center justify-center font-bold text-base shrink-0">
                            {conv.peerName?.charAt(0).toUpperCase() || 'H'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{conv.peerName || 'Local Host'}</h4>
                              {conv.peerRole && (
                                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-150 dark:bg-slate-800 text-slate-500">
                                  {conv.peerRole}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md mt-0.5">
                              {conv.lastMessage || 'Click to open conversation'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {conv.lastMessageTime && (
                            <span className="text-[11px] text-slate-400 block mb-1">
                              {new Date(conv.lastMessageTime).toLocaleDateString()}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 7: OFFERS (Strictly if real offers exist in system)
              ======================================================== */}
          {activeTab === 'offers' && hasRealOffers && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="mb-6 pb-4 border-b border-slate-150 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Offers & Promotions</h2>
                  <p className="text-xs text-slate-500">Verified season promotions available across HillyTrip</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableOffers.map(offer => (
                    <div 
                      key={offer.id}
                      className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white mb-2">
                          <Tag className="w-3 h-3" /> Special Offer
                        </div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                          {offer.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {(offer as any).description || (offer as any).tagline || ''}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                        {(offer as any).code && (
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                            CODE: {(offer as any).code}
                          </span>
                        )}
                        <button
                          onClick={() => navigate('#/homestays')}
                          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          Book with offer →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 8: ACCOUNT SETTINGS
              ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
                <div className="mb-6 pb-4 border-b border-slate-150 dark:border-slate-800">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Settings</h2>
                  <p className="text-xs text-slate-500">Manage interface preferences and account security</p>
                </div>

                <div className="space-y-6">
                  {/* Theme Mode Preference */}
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {themeMode === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                        Interface Theme
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Switch between light and dark modes for optimal viewing across mountain trails.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setThemeMode('light')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          themeMode === 'light'
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" /> Light
                      </button>
                      <button
                        onClick={() => setThemeMode('dark')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          themeMode === 'dark'
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" /> Dark
                      </button>
                    </div>
                  </div>

                  {/* Security & Authentication status */}
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Account Security & Session
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      Your session is authenticated via secure tokens.
                    </p>
                    <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Logged in email</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{actualUserEmail}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Account status</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active & Verified
                      </span>
                    </div>
                  </div>

                  {/* Logout prominent callout */}
                  <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-red-700 dark:text-red-400">Sign Out of HillyTrip</h4>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
                        Securely end your current session on this device.
                      </p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================
          PROFILE EDIT MODAL (Clean, Real Fields Only)
          ======================================================== */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 dark:border-slate-800 mb-5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-orange-500" />
                  Edit Profile Details
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Avatar Preview & Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Profile Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                      {editPhotoURL ? (
                        <img 
                          src={editPhotoURL} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                          {editName.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Image File</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleAvatarFileUpload}
                        />
                      </label>
                      <input
                        type="url"
                        value={editPhotoURL}
                        onChange={(e) => setEditPhotoURL(e.target.value)}
                        placeholder="Or paste image URL"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number (for booking confirmations)
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                {/* Home Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Home City / State
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Chandigarh, India"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Traveler Bio
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about your love for the Himalayan mountains..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-150 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
