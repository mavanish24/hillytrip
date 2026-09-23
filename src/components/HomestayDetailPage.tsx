import React, { useState, useEffect, useRef, useMemo } from 'react';
import SEOBreadcrumbs from './SEOBreadcrumbs';
import { 
  MapPin, Phone, Star, Shield, Sparkles, Award, Heart, Share2, Eye, 
  Calendar, Users, Coffee, Check, ChevronDown, ChevronUp, Map, 
  ExternalLink, RefreshCw, Send, CheckCircle, Flame, Compass, 
  Utensils, Info, Clock, AlertTriangle, MessageSquare, Camera, Smile,
  Wifi, Zap, Car, Languages, Accessibility, ShieldAlert, HeartHandshake, EyeOff, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Homestay, Destination, Attraction, RoomCategory, RoomImage, HomestayGallery, HomestayReview } from '../types';
import { getItemSlug } from '../utils/slug';
import { isListingVerified, subscribeClaimSystem } from '../lib/claimSystem';
import UnclaimedListingBanner from './UnclaimedListingBanner';
import { UnclaimedBadge } from './UnclaimedBadgeAndStrip';
import ClaimModal from './ClaimModal';
import DirectBookingModal from './DirectBookingModal';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { REPRESENTATIVE_HIMALAYAN_GALLERY, getRepresentativeGalleryForDestination } from '../constants';
import { ProgressiveImage } from './ProgressiveImage';
import { UniversalNearbySection } from './location/UniversalNearbySection';

export interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  caption: string;
  category: string;
  isRepresentative?: boolean;
}

function HomestayPhotoLightbox({
  isOpen,
  onClose,
  gallery,
  activeIndex,
  setActiveIndex,
  homestayName,
  isRepresentative = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  gallery: GalleryItem[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  homestayName: string;
  isRepresentative?: boolean;
}) {
  const { dragOffset, isSwiping, touchHandlers } = useSwipeGesture({
    onSwipeLeft: () => {
      if (gallery.length > 0) setActiveIndex((activeIndex + 1) % gallery.length);
    },
    onSwipeRight: () => {
      if (gallery.length > 0) setActiveIndex((activeIndex - 1 + gallery.length) % gallery.length);
    },
  });

  if (!isOpen || gallery.length === 0) return null;

  const currentItem = gallery[activeIndex] || gallery[0];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col justify-between p-4 backdrop-blur-md"
      >
        <div className="flex justify-between items-center text-white border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-md">
              {activeIndex + 1} / {gallery.length}
            </span>
            {isRepresentative && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 font-mono">
                <Camera className="w-3 h-3 text-amber-400" />
                Representative Image
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white hover:text-red-400 transition cursor-pointer text-xs font-bold uppercase tracking-wider font-mono bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5"
          >
            ✕ Close
          </button>
        </div>

        <div 
          className="flex-1 flex flex-col items-center justify-center relative touch-pan-y overflow-hidden select-none my-2"
          {...touchHandlers}
        >
          {/* Left arrow */}
          <button 
            onClick={() => setActiveIndex((activeIndex - 1 + gallery.length) % gallery.length)}
            className="absolute left-2 p-3 text-white bg-slate-900/80 hover:bg-emerald-600 rounded-full transition cursor-pointer z-20 border border-white/10 shadow-lg"
          >
            ◀
          </button>

          <div className="relative aspect-[16/10] max-h-[70vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black flex items-center justify-center">
            <img 
              src={currentItem?.image_url} 
              alt={currentItem?.title || 'Homestay Photo'} 
              style={{
                transform: `translateX(${dragOffset}px)`,
                transition: isSwiping ? 'none' : 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Right arrow */}
          <button 
            onClick={() => setActiveIndex((activeIndex + 1) % gallery.length)}
            className="absolute right-2 p-3 text-white bg-slate-900/80 hover:bg-emerald-600 rounded-full transition cursor-pointer z-20 border border-white/10 shadow-lg"
          >
            ▶
          </button>
        </div>

        <div className="text-center text-slate-300 text-xs font-sans border-t border-white/10 pt-3 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">{currentItem?.title || homestayName}</span>
            {currentItem?.category && (
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                {currentItem.category}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-[11px] max-w-xl italic">
            {currentItem?.caption || 'Verified Himalayan Homestay Experience'}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface HomestayDetailPageProps {
  activeHomeDetail: {
    homestay: Homestay;
    destination: Destination | null;
    roomCategories?: RoomCategory[];
    roomImages?: RoomImage[];
    homestayGallery?: HomestayGallery[];
    homestayReviews?: HomestayReview[];
  } | null;
  loading: boolean;
  user: any;
  isAdmin: boolean;
  navigate: (path: string) => void;
  isItemSaved: (id: string) => boolean;
  handleToggleSave: (id: string, type: 'homestay' | 'destination' | 'attraction') => void;
  onLogin: () => void;
  allHomestays?: Homestay[];
  allAttractions?: Attraction[];
  allDestinations?: Destination[];
  executeProtectedAction?: (actionName: string, actionCallback: () => void, requiresVerification?: boolean, serializableAction?: any) => void;
}

export const HomestayDetailPage: React.FC<HomestayDetailPageProps> = ({
  activeHomeDetail,
  loading,
  user,
  isAdmin,
  navigate,
  isItemSaved,
  handleToggleSave,
  onLogin,
  allHomestays = [],
  allAttractions = [],
  allDestinations = [],
  executeProtectedAction
}) => {
  // Local active detail state for reviews and interactive elements
  const [localReviews, setLocalReviews] = useState<HomestayReview[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Accordion state for Policies & House Rules
  const [openPolicySection, setOpenPolicySection] = useState<string | null>('rules');
  const [activeFactsheetTab, setActiveFactsheetTab] = useState<'stay' | 'food' | 'mountain' | 'views' | 'safety'>('stay');

  // Booking Widget state
  const [bookingDate, setBookingDate] = useState('');
  const [bookingGuests, setBookingGuests] = useState(1);
  const [bookingInquirySent, setBookingInquirySent] = useState(false);
  const [bookingInquiryLoading, setBookingInquiryLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingInquirerName, setBookingInquirerName] = useState(user?.name || '');
  const [bookingInquirerMobile, setBookingInquirerMobile] = useState(user?.mobile || '');
  const [bookingInquirerEmail, setBookingInquirerEmail] = useState(user?.email || '');

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewVisitDate, setReviewVisitDate] = useState('');
  const [reviewRecommends, setReviewRecommends] = useState(true);
  const [reviewCleanliness, setReviewCleanliness] = useState(5);
  const [reviewLocation, setReviewLocation] = useState(5);
  const [reviewService, setReviewService] = useState(5);
  const [reviewFood, setReviewFood] = useState(5);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewSort, setReviewSort] = useState<'latest' | 'highest'>('latest');

  // Claim Modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [directBookingModalOpen, setDirectBookingModalOpen] = useState(false);
  const [, setClaimTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeClaimSystem(() => setClaimTick(prev => prev + 1));
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      const hash = window.location.hash || '';
      if (hash.includes('claim=true')) {
        setClaimModalOpen(true);
      }
    } catch (e) {}
  }, []);

  // Carousel ref for hero gallery swipe
  const galleryRef = useRef<HTMLDivElement>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Initialize reviews from props
  useEffect(() => {
    if (activeHomeDetail?.homestayReviews) {
      setLocalReviews(activeHomeDetail.homestayReviews);
    }
  }, [activeHomeDetail]);

  // Compute fallback / owner representative gallery unconditionally before early returns to preserve hook order
  const effectiveGallery: GalleryItem[] = useMemo(() => {
    if (!activeHomeDetail) {
      return REPRESENTATIVE_HIMALAYAN_GALLERY.map(item => ({ ...item, isRepresentative: true }));
    }

    const { homestay: h, homestayGallery: hG = [], destination: rawDest } = activeHomeDetail;
    const destName = rawDest?.name || h.destinationId || h.address || h.district || h.name;
    const repSet = getRepresentativeGalleryForDestination(destName);

    const isCustomOwnerImage = (url?: string): boolean => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim();
      if (!trimmed) return false;
      if (
        trimmed.includes('photo-1618773928121') ||
        trimmed.includes('photo-1542601906990') ||
        trimmed.includes('photo-1464822759023') ||
        trimmed.includes('photo-1504280390367') ||
        trimmed.includes('photo-1470071459604')
      ) {
        return false;
      }
      return true;
    };

    const validOwnerGallery = (hG || []).filter(item => isCustomOwnerImage(item.image_url));
    const validOwnerImages = (h?.images || []).filter(url => isCustomOwnerImage(url));

    let ownerItems: GalleryItem[] = [];

    if (validOwnerGallery.length > 0) {
      ownerItems = validOwnerGallery.map(item => ({
        id: item.id || `owner-${item.image_url}`,
        image_url: item.image_url,
        title: item.caption || item.title || h.name,
        caption: item.caption || 'Property photo uploaded by homestay owner',
        category: item.category || 'Owner Photo',
        isRepresentative: false,
      }));
    } else if (validOwnerImages.length > 0) {
      ownerItems = validOwnerImages.map((url, idx) => ({
        id: `owner-img-${idx}`,
        image_url: url,
        title: `${h.name} - Photo ${idx + 1}`,
        caption: 'Property photo uploaded by homestay owner',
        category: 'Owner Photo',
        isRepresentative: false,
      }));
    }

    // Rule 1: Owner uploaded 5 or more images -> display ONLY owner images
    if (ownerItems.length >= 5) {
      return ownerItems;
    }

    // Rule 2 & 3: Owner uploaded 1–4 images or 0 images
    // Keep owner images (0 to 4), and automatically fill remaining slots up to at least 5 using destination-specific representative set.
    const result = [...ownerItems];

    for (let i = 0; i < repSet.length && result.length < 5; i++) {
      const repItem = repSet[i];
      if (!result.some(r => r.image_url === repItem.image_url)) {
        result.push({
          ...repItem,
          id: `rep-fill-${result.length}-${repItem.id}`,
          isRepresentative: true,
        });
      }
    }

    for (let i = 0; i < REPRESENTATIVE_HIMALAYAN_GALLERY.length && result.length < 5; i++) {
      const fbItem = REPRESENTATIVE_HIMALAYAN_GALLERY[i];
      if (!result.some(r => r.image_url === fbItem.image_url)) {
        result.push({
          ...fbItem,
          id: `rep-fb-fill-${result.length}-${fbItem.id}`,
          isRepresentative: true,
        });
      }
    }

    return result;
  }, [activeHomeDetail]);

  // Deferred secondary loading state
  const [isSecondaryLoaded, setIsSecondaryLoaded] = useState(false);

  useEffect(() => {
    setIsSecondaryLoaded(false);

    // Preload first hero image
    const firstImg = effectiveGallery[0]?.image_url;
    if (firstImg) {
      const img = new Image();
      img.src = firstImg;
    }

    const timer = setTimeout(() => {
      setIsSecondaryLoaded(true);
    }, 10);

    return () => clearTimeout(timer);
  }, [activeHomeDetail?.homestay?.id]);

  if (loading) {
    return (
      <div className="text-center py-24 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-semibold font-sans animate-pulse">
          Unlocking local homestay credentials & high-altitude rooms...
        </p>
      </div>
    );
  }

  if (!activeHomeDetail) {
    return (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col items-center justify-center">
        <Info className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">Listing Not Found</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-md">
          This homestay spec sheet cannot be loaded right now. It might be pending validation.
        </p>
        <button 
          onClick={() => navigate('#/homestays')}
          className="mt-6 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const { homestay, destination: rawDestination, roomCategories = [], roomImages = [], homestayGallery = [] } = activeHomeDetail;

  const isRepresentativeGallery = effectiveGallery.some(item => item.isRepresentative);

  const resolvedDestination = rawDestination || allDestinations.find(d => 
    d.id === homestay.destinationId || 
    d.id?.toLowerCase() === homestay.destinationId?.toLowerCase() ||
    (d as any).village_code === homestay.destinationId ||
    (d as any).village_code === (homestay as any).village_code ||
    (d as any).destination_id === homestay.destinationId
  ) || null;

  const getVillageDisplayName = () => {
    if ((homestay as any).village_name && !/^(vil|dest|hub)\d+/i.test((homestay as any).village_name)) {
      return (homestay as any).village_name;
    }
    if ((homestay as any).village && !/^(vil|dest|hub)\d+/i.test((homestay as any).village)) {
      return (homestay as any).village;
    }
    if (resolvedDestination && resolvedDestination.name && !resolvedDestination.name.toLowerCase().startsWith('hub-') && !resolvedDestination.name.toLowerCase().startsWith('v-') && !/^(vil|dest|hub)\d+/i.test(resolvedDestination.name)) {
      return resolvedDestination.name;
    }
    if (homestay.destinationId) {
      const match = allDestinations.find(d => 
        d.id === homestay.destinationId || 
        d.id?.toLowerCase() === homestay.destinationId?.toLowerCase() ||
        (d as any).village_code === homestay.destinationId ||
        (d as any).village_code === (homestay as any).village_code ||
        (d as any).destination_id === homestay.destinationId
      );
      if (match && match.name && !match.name.toLowerCase().startsWith('hub-') && !match.name.toLowerCase().startsWith('v-') && !/^(vil|dest|hub)\d+/i.test(match.name)) {
        return match.name;
      }
      if (/^vil\d+/i.test(homestay.destinationId)) {
        return homestay.district ? `${homestay.district} Village` : 'Himalayan Village';
      }
      return homestay.destinationId
        .replace(/^(hub|v|dest)-/i, '')
        .split(/[-_]/)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(' ');
    }
    return homestay.district || 'Himalayan Village';
  };

  const villageDisplayName = getVillageDisplayName();
  const destination = resolvedDestination;

  // Filter nearby attractions belonging to this destination
  const nearbyAttractions = allAttractions.filter(attr => attr.destinationId === homestay.destinationId);
  
  // Filter other homestays in this destination (excluding current)
  const nearbyHomestays = allHomestays.filter(home => home.destinationId === homestay.destinationId && home.id !== homestay.id);

  // Filter similar homestays (matched by price range or key attributes)
  const similarHomestays = allHomestays
    .filter(h => h.id !== homestay.id)
    .slice(0, 4);

  // Combined score calculations
  const totalReviews = localReviews.length;
  const averageReviewRating = totalReviews > 0
    ? (localReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : (homestay.rating || 4.8).toFixed(1);

  // Sub ratings average
  const cleanlinessAvg = totalReviews > 0 
    ? (localReviews.reduce((sum, r) => sum + (r.ratingCleanliness || 5), 0) / totalReviews).toFixed(1) 
    : '4.9';
  const locationAvg = totalReviews > 0 
    ? (localReviews.reduce((sum, r) => sum + (r.ratingLocation || 5), 0) / totalReviews).toFixed(1) 
    : '4.8';
  const serviceAvg = totalReviews > 0 
    ? (localReviews.reduce((sum, r) => sum + (r.ratingService || 5), 0) / totalReviews).toFixed(1) 
    : '5.0';
  const foodAvg = totalReviews > 0 
    ? (localReviews.reduce((sum, r) => sum + (r.ratingFood || 5), 0) / totalReviews).toFixed(1) 
    : '4.9';

  // Booking calculations
  const basePrice = selectedRoomId 
    ? roomCategories.find(rc => rc.id === selectedRoomId)?.price || homestay.priceMin
    : homestay.priceMin;
  const extraBedCost = selectedRoomId
    ? roomCategories.find(rc => rc.id === selectedRoomId)?.extra_bed_price || 350
    : 350;
  
  const selectedRoomCategory = selectedRoomId 
    ? roomCategories.find(rc => rc.id === selectedRoomId)
    : roomCategories[0];

  const maxGuestsBase = selectedRoomCategory?.maximum_guests || 2;
  const extraGuests = Math.max(0, bookingGuests - maxGuestsBase);
  const pricePerNight = basePrice + (extraGuests * extraBedCost);

  // Handle Share copy link
  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/homestay/${getItemSlug(homestay)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

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

  // Handle Booking inquiry submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      alert('Please select a preferred travel date.');
      return;
    }

    const runBookingSubmit = async () => {
      setBookingInquiryLoading(true);
      try {
        const payload = {
          homestayId: homestay.id,
          userName: bookingInquirerName || 'Inquirer',
          userEmail: bookingInquirerEmail || 'inquirer@hillytrip.com',
          userMobile: bookingInquirerMobile || homestay.contact || '9999999999',
          travelDate: bookingDate,
          numberOfGuests: bookingGuests,
          message: bookingMessage || `Hi! I'm interested in booking the ${selectedRoomCategory?.room_name || 'Stay'} for ${bookingGuests} guests on ${bookingDate}.`
        };

        const res = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success || res.ok) {
          setBookingInquirySent(true);

          // Automatically initiate chat conversation in HillyTrip Internal Messaging System
          try {
            const firstMsgText = bookingMessage || `Hi! I'm interested in booking the ${selectedRoomCategory?.room_name || 'Stay'} for ${bookingGuests} guests on ${bookingDate}.`;
            await fetch('/api/messaging/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                listingType: 'homestay',
                listingId: homestay.id,
                travelerId: user?.id || user?.email || bookingInquirerEmail || 'guest-traveler',
                firstMessage: firstMsgText
              })
            });
          } catch (chatErr) {
            console.error("Internal Messaging System synchronization handled:", chatErr);
          }
        } else {
          alert(data.error || 'Failed to submit booking inquiry.');
        }
      } catch (err) {
        console.error(err);
        alert('Network error submitting inquiry.');
      } finally {
        setBookingInquiryLoading(false);
      }
    };

    if (executeProtectedAction) {
      executeProtectedAction('Submit Booking Inquiry', runBookingSubmit, false, {
        type: 'BOOK_HOMESTAY',
        payload: {
          homestayId: homestay.id,
          userName: bookingInquirerName || 'Inquirer',
          userEmail: bookingInquirerEmail || 'inquirer@hillytrip.com',
          userMobile: bookingInquirerMobile || homestay.contact || '9999999999',
          travelDate: bookingDate,
          numberOfGuests: bookingGuests,
          message: bookingMessage || `Hi! I'm interested in booking the ${selectedRoomCategory?.room_name || 'Stay'} for ${bookingGuests} guests on ${bookingDate}.`
        }
      });
    } else {
      await runBookingSubmit();
    }
  };

  // Handle submitting a review locally
  const handleAddReviewLocally = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle || !reviewContent || !reviewVisitDate) {
      alert('Please fill out all required fields for the review.');
      return;
    }

    const newReview: HomestayReview = {
      id: `HR-USER-${Date.now()}`,
      homestayId: homestay.id,
      userName: user?.name || 'Local Explorer',
      userAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GuestUser',
      rating: reviewRating,
      ratingCleanliness: reviewCleanliness,
      ratingLocation: reviewLocation,
      ratingService: reviewService,
      ratingFood: reviewFood,
      title: reviewTitle,
      content: reviewContent,
      visitDate: reviewVisitDate,
      recommends: reviewRecommends,
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    setLocalReviews([newReview, ...localReviews]);
    setReviewSuccess(true);
    
    // Clear form
    setReviewTitle('');
    setReviewContent('');
    setReviewVisitDate('');
  };

  const sortedReviews = [...localReviews].sort((a, b) => {
    if (reviewSort === 'highest') {
      return b.rating - a.rating;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const breadcrumbItems = [
    { name: 'Homestays', path: '/homestays' },
    ...(villageDisplayName ? [{ name: villageDisplayName, path: `/destination/${getItemSlug(destination || { id: homestay.destinationId, name: villageDisplayName })}` }] : []),
    { name: homestay.name, path: `/homestay/${getItemSlug(homestay)}` }
  ];

  return (
    <div id="homestay-detail-page-container" className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans pb-16 text-left selection:bg-emerald-200">
      
      {/* ----------------- BREADCRUMBS & NAVIGATION ----------------- */}
      <div className="max-w-7xl mx-auto px-4 pt-2 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex-1 w-full">
          <SEOBreadcrumbs navigate={navigate} items={breadcrumbItems} className="px-0 py-2" />
        </div>
        <button 
          onClick={() => navigate('#/homestays')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer shrink-0"
        >
          ← Back to Catalog
        </button>
      </div>

      {/* ----------------- 1. HERO GALLERY ----------------- */}
      <section id="hero-gallery-section" className="max-w-7xl mx-auto px-4 mt-6 sm:px-6 lg:px-8">
        <div className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs border border-slate-200/60 dark:border-slate-850">
          
          {/* Quick Action Overlays */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
            <UnclaimedBadge listing={homestay} onClaimClick={() => setClaimModalOpen(true)} />
            {homestay.isFeatured && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Stay
              </span>
            )}
            {isRepresentativeGallery && (
              <span className="bg-slate-900/90 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Camera className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Representative Images</span>
                <span className="hidden sm:inline text-[10px] text-amber-200/70 border-l border-amber-500/30 pl-2 ml-0.5 font-normal">
                  Cozy Himalayan Stay Ambiance
                </span>
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:bg-emerald-600 transition cursor-pointer"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleToggleSave(homestay.id, 'homestay')}
              className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white hover:bg-red-500 transition cursor-pointer flex items-center justify-center"
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isItemSaved(homestay.id) ? 'fill-red-500 text-red-500 animate-pulse' : 'text-white'}`} />
            </button>
          </div>

          {/* Desktop Visual Grid (5 Photos Layout with 16:10 aspect ratio) */}
          <div className="hidden md:grid grid-cols-4 gap-2.5 p-2 bg-slate-950/40">
            {/* Main Feature Cell (Exterior) */}
            <div 
              className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl aspect-[16/10] bg-slate-900"
              onClick={() => { setActiveLightboxIndex(0); setIsPhotoLightboxOpen(true); }}
            >
              <ProgressiveImage 
                src={effectiveGallery[0]?.image_url} 
                alt={effectiveGallery[0]?.title || 'Main Homestay Exterior'}
                targetWidth={1200}
                isPriority={true}
                loading="eager"
                fetchPriority="high"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-90 group-hover:opacity-100 transition duration-300" />
              
              {effectiveGallery[0]?.isRepresentative && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 font-mono shadow-sm">
                    <Camera className="w-3 h-3 text-amber-400" />
                    Representative Image
                  </span>
                </div>
              )}

              <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-col text-white pointer-events-none">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                  {effectiveGallery[0]?.category}
                </span>
                <span className="text-sm font-extrabold truncate drop-shadow-md">
                  {effectiveGallery[0]?.title}
                </span>
              </div>
            </div>

            {/* 4 Supporting Grid Cells with 16:10 aspect ratio */}
            {effectiveGallery.slice(1, 5).map((item, idx) => {
              const actualIdx = idx + 1;
              const isLastCell = idx === 3;

              return (
                <div 
                  key={item.id}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-[16/10] bg-slate-900"
                  onClick={() => { setActiveLightboxIndex(actualIdx); setIsPhotoLightboxOpen(true); }}
                >
                  <ProgressiveImage 
                    src={item.image_url} 
                    alt={item.title}
                    loading="lazy"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition duration-300" />
                  
                  {item.isRepresentative && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 font-mono shadow-xs">
                        <Camera className="w-2.5 h-2.5 text-amber-400" />
                        Representative
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex flex-col text-white pointer-events-none">
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 font-mono">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold truncate drop-shadow-xs">
                      {item.title}
                    </span>
                  </div>

                  {/* If last cell & extra photos available, show View All overlay */}
                  {isLastCell && effectiveGallery.length > 5 && (
                    <div 
                      className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white cursor-pointer hover:bg-slate-950/85 transition p-3 text-center border border-amber-500/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLightboxIndex(4);
                        setIsPhotoLightboxOpen(true);
                      }}
                    >
                      <Camera className="w-6 h-6 mb-1 text-amber-400 animate-bounce" />
                      <span className="text-xs font-black uppercase tracking-widest font-mono text-amber-300">View All Photos</span>
                      <span className="text-[10px] text-slate-300 font-mono mt-0.5">({effectiveGallery.length} Shots Available)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Swipe Gallery with 16:10 aspect ratio */}
          <div className="block md:hidden relative overflow-hidden bg-slate-950">
            <div 
              ref={galleryRef}
              className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
              onScroll={() => {
                if (galleryRef.current) {
                  const idx = Math.round(galleryRef.current.scrollLeft / galleryRef.current.clientWidth);
                  setCurrentGalleryIndex(idx);
                }
              }}
            >
              {effectiveGallery.map((item, index) => (
                <div 
                  key={item.id} 
                  className="w-full shrink-0 snap-center relative aspect-[16/10] overflow-hidden cursor-pointer"
                  onClick={() => { setActiveLightboxIndex(index); setIsPhotoLightboxOpen(true); }}
                >
                  <img 
                    src={item.image_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-12 text-white pointer-events-none">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="inline-block text-[9px] font-black uppercase tracking-wider text-amber-300 font-mono px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs">
                        {item.category}
                      </span>
                      {item.isRepresentative && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded font-mono">
                          <Camera className="w-2.5 h-2.5 text-amber-400" />
                          Representative Image
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-extrabold truncate drop-shadow-xs">{item.title}</h4>
                    <p className="text-[10px] text-slate-300 line-clamp-1 italic">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Bullet Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-full z-10 border border-white/10">
              {effectiveGallery.slice(0, 6).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentGalleryIndex ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/60'}`} 
                />
              ))}
            </div>

            {/* Floating Counter Badge */}
            <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-mono tracking-wider font-bold border border-white/10">
              {currentGalleryIndex + 1} / {effectiveGallery.length}
            </div>
          </div>

        </div>
        
        {/* Share Feedback Alerts */}
        <AnimatePresence>
          {copiedLink && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black tracking-wide text-center"
            >
              🚀 Copied link to clipboard! Share the local adventure with friends.
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ----------------- SPLIT PAGE CORE GRID ----------------- */}
      <div className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO-THIRDS: MAIN DOCUMENTATION CONTENT */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* 2. BASIC INFORMATION */}
          <div id="basic-information-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-850 shadow-xs space-y-5">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 text-[10px] font-black uppercase px-3 py-1 rounded-full font-mono tracking-wider">
                🏞️ Himalayan Homestay
              </span>
              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 text-[10px] font-black uppercase px-3 py-1 rounded-full font-mono tracking-wider">
                🏔️ Altitude: {(destination as any)?.elevation || '2,100'}m
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {homestay.name}
              </h1>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 font-serif italic">
                "{homestay.tagline || 'Experience real mountain life with wood stoves and home-cooked organic meals.'}"
              </p>
            </div>

            {/* Unclaimed Listing Banner Card */}
            <UnclaimedListingBanner
              listing={homestay}
              onClaimClick={() => setClaimModalOpen(true)}
            />

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-slate-100 dark:border-slate-800 py-4 mt-2">
              <div className="space-y-0.5">
                <span className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider font-black">Average Score</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                  <span className="text-base font-extrabold text-slate-850 dark:text-slate-100">{averageReviewRating}</span>
                  <span className="text-xs text-slate-400 font-mono">/5.0</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider font-black">Location Region</span>
                <div className="flex items-center gap-1 text-slate-850 dark:text-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-bold truncate">{villageDisplayName}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider font-black">Starting At</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">₹{homestay.priceMin}</span>
                  <span className="text-[10px] text-slate-400 font-mono">/night</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider font-black">Host Language</span>
                <div className="flex items-center gap-1 text-slate-850 dark:text-slate-100">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-sm font-bold">Nepali, Hindi, English</span>
                </div>
              </div>
            </div>

            {/* Host Credentials Card */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-emerald-500 shrink-0 flex items-center justify-center font-black text-emerald-700 font-mono text-base shadow-2xs">
                {homestay.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-850 dark:text-slate-200">Hosted by local farming family</span>
                  <Award className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Your hosts are native Himalayan farmers who cultivate organic pears, plums, tea leaves, and spices locally.
                </p>
              </div>
            </div>

          </div>

          {/* 4. ABOUT SECTION */}
          <section id="about-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-850 shadow-xs space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
              ⛰️ STORY & HERITAGE
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              About the Homestay Experience
            </h2>
            <div className="text-sm text-slate-650 dark:text-slate-300 space-y-4 leading-relaxed font-sans">
              <p>
                {homestay.description || `Welcome to ${homestay.name}, nestled in the misty valleys of the Himalayas. This wooden homestay provides an authentic window into traditional hill hospitality, far away from commercial hotel setups.`}
              </p>
              <p>
                Built primarily of locally sourced pine-wood and traditional slate stones, the structure remains beautifully insulated against mountain winds. The hosts keep a roaring clay stove in the central hearth, where travelers gather every evening for community storytelling over warm salt-tea and homemade local breads.
              </p>
              <p>
                You can join the host family in their morning farm routines, harvest seasonal apples directly from the orchard, explore secluded pine-forest walking trails, or simply read a book on the private balcony overlooking snowy mountain ridges.
              </p>
            </div>
          </section>

          {/* 5. QUICK HIGHLIGHTS (Bento grid style) */}
          <section id="quick-highlights-section" className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850 shadow-2xs space-y-2 text-center md:text-left">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto md:mx-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Altitude</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{(destination as any)?.elevation || '2,100'} Meters</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850 shadow-2xs space-y-2 text-center md:text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto md:mx-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Primary View</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Kanchenjunga Snow Range</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-850 shadow-2xs space-y-2 text-center md:text-left col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto md:mx-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold">Check-In / Out</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">12:00 PM / 11:00 AM</span>
              </div>
            </div>

          </section>

          {/* 6. ROOM CATEGORIES (Premium expandable listings) */}
          <section id="room-categories-section" className="space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                🛏️ ACCREDITED LODGING OPTIONS
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Room Categories & Specifications
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every room is verified by our mountain experts for cleanliness, insulation, and views.
              </p>
            </div>

            <div className="space-y-4">
              {roomCategories.map((room) => {
                const isExpanded = selectedRoomId === room.id;
                const roomImg = roomImages.find(ri => ri.roomCategoryId === room.id)?.image_url || 'undefined';
                
                return (
                  <div 
                    key={room.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 shadow-2xs ${
                      isExpanded 
                        ? 'border-emerald-500 ring-1 ring-emerald-500/20' 
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Room Thumbnail */}
                      <div className="sm:w-56 h-40 relative shrink-0">
                        <img 
                          src={roomImg} 
                          alt={room.room_name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Main Room Summary */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                              {room.room_name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                Max {room.maximum_guests} Guests
                              </span>
                              <span className="text-slate-300">|</span>
                              <span>{room.room_size}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="block text-lg font-black text-emerald-800 dark:text-emerald-400 font-mono">
                              ₹{room.price}
                            </span>
                            <span className="block text-[9px] text-slate-400 font-mono tracking-wide uppercase">per night</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {room.description}
                        </p>

                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-50 dark:border-slate-850">
                          <button 
                            type="button"
                            onClick={() => setSelectedRoomId(isExpanded ? null : room.id)}
                            className="text-xs font-black text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? 'Hide Details' : 'View Room Specifications'}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              // Scroll smoothly to widget
                              document.getElementById('sticky-booking-widget')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                              isExpanded 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            Select Category
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Room Details Accordion Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850"
                        >
                          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-350">
                            
                            <div className="space-y-3.5">
                              <h5 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 font-mono">
                                ROOM CONFIGURATION
                              </h5>
                              <ul className="space-y-2">
                                <li className="flex items-center justify-between">
                                  <span>Bed configuration:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{room.bed_type}</span>
                                </li>
                                <li className="flex items-center justify-between">
                                  <span>Bathroom setup:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{room.bathroom} Bathroom</span>
                                </li>
                                <li className="flex items-center justify-between">
                                  <span>Balcony type:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{room.balcony} Balcony</span>
                                </li>
                                <li className="flex items-center justify-between">
                                  <span>Room view type:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{room.view_type}</span>
                                </li>
                              </ul>
                            </div>

                            <div className="space-y-3.5">
                              <h5 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 font-mono">
                                COMFORT AMENITIES
                              </h5>
                              <div className="flex flex-wrap gap-1.5">
                                {room.room_amenities.map((am) => (
                                  <span 
                                    key={am}
                                    className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                                  >
                                    ✓ {am}
                                  </span>
                                ))}
                              </div>
                              
                              <div className="mt-4 p-3 bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-100/40 dark:border-emerald-900/40 rounded-xl flex items-center justify-between text-[11px] text-slate-500">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Breakfast:</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">✓ Fresh Organic Breakfast Included</span>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>
          </section>

          {/* 7. COMMON AMENITIES */}
          <section id="common-amenities-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-850 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                ⛺ INDOOR & OUTDOOR FACILITIES
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Common Property Amenities
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {homestay.amenities.map((am) => (
                <div 
                  key={am}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span>{am}</span>
                </div>
              ))}
              
              {/* Fallback extra common visual amenities */}
              {['24/7 Hot Water (Geyser)', 'Wood-fired clay stove', 'Terrace sitting', 'Organic orchard access', 'Campfire setup available', 'Mountain guide referral'].map((am) => (
                <div 
                  key={am}
                  className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850/60 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span>{am}</span>
                </div>
              ))}
               </div>
          </section>

          {/* 9. POLICIES & HOUSE RULES */}
          <section id="policies-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-850 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                  📝 ECO-TERRAIN TRAVEL PROTOCOLS
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  House Rules & Living Policies
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-mono font-black uppercase">
                  Verified Factsheet
                </span>
                {homestay.gstInvoice && (
                  <span className="text-[10px] bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-450 px-2.5 py-1 rounded-full font-mono font-black uppercase">
                    GST Invoice Available
                  </span>
                )}
              </div>
            </div>

            {/* Part A: Main Policy Accordions */}
            <div className="space-y-2">
              {[
                {
                  id: 'rules',
                  title: '🏡 Traditional House Rules',
                  content: homestay.houseRules || 'No outdoor shoes inside wooden living quarters (slippers are provided). Silent hours starting at 10:00 PM to respect the surrounding village peacefulness. Avoid wasting hot water as boiling it on mountains uses valuable electrical/wood fuel resources.'
                },
                {
                  id: 'cancellation',
                  title: '📅 Cancellation & Booking Protection',
                  content: homestay.cancellationPolicy || 'Get 100% refund for cancellations filed at least 7 days before check-in. Within 7 days, 50% refund is issued. Re-bookings or dates transfer can be processed free of charge subject to availability.'
                },
                {
                  id: 'precautions',
                  title: '🏔️ High Altitude Safety Precautions & Ground Info',
                  content: homestay.thingsGuestsShouldKnow || 'Winters (Nov-Feb) get extremely cold; pack triple-layer heavy woolens. Keep personal medication handy since the nearest high-road medical center is located 8 km away. Drinking spring water is highly recommended, but filtered water is also available.'
                }
              ].map((policy) => {
                const isOpen = openPolicySection === policy.id;
                return (
                  <div 
                    key={policy.id}
                    className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenPolicySection(isOpen ? null : policy.id)}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-left text-xs font-black text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                    >
                      <span>{policy.title}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans bg-white dark:bg-slate-900">
                            {policy.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Part B: Premium Mountain Facts & Specifics Sheet */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                  🔍 HIMALAYAN LIVING & GROUND REALITIES
                </span>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                  Granular Property Factsheet & Specifications
                </h4>
                <p className="text-[11px] text-slate-400">
                  Click the categories below to review specific amenities, limits, and terrain realities recorded directly by hosts.
                </p>
              </div>

              {/* Factsheet Tabs Horizontal Strip */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 dark:border-slate-850 font-mono text-[10px] font-black uppercase">
                {[
                  { id: 'stay', label: '🏡 Stay & Guests', icon: Users },
                  { id: 'food', label: '☕ Food & Vibe', icon: Coffee },
                  { id: 'mountain', label: '🏔️ Access & Power', icon: Compass },
                  { id: 'views', label: '📸 Views & Photo', icon: Camera },
                  { id: 'safety', label: '🛡️ Safety & Care', icon: Shield }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeFactsheetTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveFactsheetTab(tab.id as any)}
                      className={`px-3.5 py-2.5 shrink-0 rounded-t-xl transition flex items-center gap-1.5 cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 font-extrabold' 
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Panel Rendering */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 min-h-[220px]">
                {activeFactsheetTab === 'stay' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
                    
                    {/* Guest policies */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">GUEST PERMISSIONS & ELIGIBILITY</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-450 font-sans">Family Friendly Stay</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.familyFriendly !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.familyFriendly !== false ? '✓ Recommended' : '🚫 Standard'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-450 font-sans">Unmarried Couples Allowed</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.unmarriedCouplesAllowed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                            {homestay.unmarriedCouplesAllowed ? '✓ Allowed' : '🚫 Families Only'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-455 font-sans">Bachelor & Boy Groups</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.bachelorGroupsAllowed !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                            {homestay.bachelorGroupsAllowed !== false ? '✓ Allowed' : '🚫 Restricted'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-455 font-sans">Solo Female Friendly</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.soloFemaleFriendly !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.soloFemaleFriendly !== false ? '✓ Verified Safe' : 'Standard'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-455 font-sans">Foreign Travelers Welcome</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.foreignGuestsAllowed !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                            {homestay.foreignGuestsAllowed !== false ? '✓ Yes (FRO Check)' : '🚫 Indian IDs Only'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Checkin / Checkout and rules */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">TIMINGS, ADVANCE & PROTECTION</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-455 font-sans">Check-in Timing</span>
                          <span className="font-mono text-[11px] font-black text-slate-800 dark:text-slate-200">{homestay.checkInTime || '12:00 PM'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-455 font-sans">Check-out Timing</span>
                          <span className="font-mono text-[11px] font-black text-slate-800 dark:text-slate-200">{homestay.checkOutTime || '11:00 AM'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-455 font-sans">Minimum Age Required</span>
                          <span className="font-mono text-[11px] font-black text-slate-800 dark:text-slate-200">{homestay.minCheckInAge || '18'} years</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-455 font-sans">Advance Booking Deposit</span>
                          <span className="font-mono text-[11px] text-slate-605 dark:text-slate-400 truncate max-w-[150px]">{homestay.advancePayment || '50% deposit'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-550 dark:text-slate-455 font-sans">Pet Policy Rules</span>
                          <span className="font-mono text-[10px] text-slate-605 dark:text-slate-400 italic max-w-[180px] truncate" title={homestay.petPolicy}>{homestay.petPolicy || 'Discuss with host'}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {activeFactsheetTab === 'food' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
                    
                    {/* Food preferences */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">MEAL MODALITY & DIET PREFERENCES</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Strictly Pure Vegetarian Premise</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.vegOnly ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.vegOnly ? '✓ Yes (Strictly Veg)' : 'Standard Mixed Kitchen'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Non-Vegetarian Meals Available</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.nonVegAvailable && !homestay.vegOnly ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.nonVegAvailable && !homestay.vegOnly ? '✓ Yes (Chicken/Egg)' : '🚫 Not Available'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Jain Food Choice (On Request)</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.jainFoodAvailable ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-550'}`}>
                            {homestay.jainFoodAvailable ? '✓ Yes' : '🚫 Not Available'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Outside Food Allowed</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.outsideFoodAllowed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-550'}`}>
                            {homestay.outsideFoodAllowed ? '✓ Permitted' : '🚫 Restricted'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Host Kitchen & Utensil Access</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.kitchenAccess ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-550'}`}>
                            {homestay.kitchenAccess ? '✓ Allowed' : '🚫 Family Only'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Vibe and policies */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">SMOKING, ALCOHOL & SOCIAL REVELS</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Smoking Policy Rules</span>
                          <span className="font-mono text-[11px] font-black text-slate-800 dark:text-slate-200 max-w-[180px] truncate" title={homestay.smokingPolicy}>{homestay.smokingPolicy || 'Designated zones only'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Alcohol Consumption Rules</span>
                          <span className="font-mono text-[11px] font-black text-slate-800 dark:text-slate-200 max-w-[180px] truncate" title={homestay.alcoholPolicy}>{homestay.alcoholPolicy || 'Permitted inside rooms'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Parties & Events Hosting</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.partiesAllowed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                            {homestay.partiesAllowed ? '✓ Allowed' : '🚫 No Parties'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Alpine Campfire Setup</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.bonfireAvailable !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-550'}`}>
                            {homestay.bonfireAvailable !== false ? '✓ Available (₹)' : '🚫 Not Offered'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-555 dark:text-slate-455 font-sans">Outdoor Barbecue Grill</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.bbqAvailable ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-550'}`}>
                            {homestay.bbqAvailable ? '✓ Available' : '🚫 Not Offered'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {activeFactsheetTab === 'mountain' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
                    
                    {/* Parking & reaches */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">VEHICULAR REACH & ROADWAYS</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Taxi Direct Driving Access</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.taxiReachesProperty ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                            {homestay.taxiReachesProperty ? '✓ Yes (Front door)' : '⚠ Walk last stretch'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Walk Required from Parking</span>
                          <span className="font-mono text-[11px] font-black text-slate-800 dark:text-white">
                            {homestay.walkingDistanceParking !== undefined ? `${homestay.walkingDistanceParking} meters` : '200 meters'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Steep Mountain Climb Walk</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.steepWalkRequired ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'}`}>
                            {homestay.steepWalkRequired ? '⚠ Steep Gradient' : '✓ Mostly Flat'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Road Surface Condition</span>
                          <span className="font-mono text-[11px] font-black text-emerald-800 dark:text-emerald-400 truncate max-w-[150px]">{homestay.roadCondition || 'Scenic village lane'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Private 4-Wheel Parking</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.carParking ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.carParking ? '✓ Free On-site' : 'No Private Slot'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Power, wifi & networks */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">CONNECTIVITY & POWER UTILITIES</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Broadband Fiber Wifi</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.wifi ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-550'}`}>
                            {homestay.wifi ? `✓ Yes (${homestay.wifiSpeed || '100 Mbps'})` : '🚫 Not Available'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Cellular Networks Strength</span>
                          <span className="font-mono text-[11px] font-black text-slate-800 dark:text-slate-200 max-w-[180px] truncate" title={homestay.networkStrength}>{homestay.networkStrength || 'Good Jio/Airtel 4G'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Power Backup & Security</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.powerBackup ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-550'}`}>
                            {homestay.powerBackup ? '✓ Inverter/Generator' : 'Standard Grid Power'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Himalayan Solar Setup</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.solar ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.solar ? '✓ Eco Solar Cells' : '🚫 No Solar Panels'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-560 dark:text-slate-455 font-sans">Running Hot Water (Geyser)</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.hotWater !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.hotWater !== false ? '✓ Geyser / Boiler' : '🚫 Cold Water Only'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {activeFactsheetTab === 'views' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
                    
                    {/* Views */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">SCENIC VISTAS & TERRAIN VIEWS</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Mt. Kanchenjunga View</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.kanchenjungaView ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.kanchenjungaView ? '🌅 Majestic Peak View' : 'Not Directly Visible'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Tea Terraces / Garden View</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.teaGardenView ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.teaGardenView ? '🌿 Lush Tea Garden' : 'Not Visible'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Pine Forest & Valleys</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.forestView ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.forestView ? '🌲 Pine Forest Edge' : 'Standard Village View'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Mountain River/Stream View</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.riverView ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.riverView ? '🌊 River Stream' : 'Not Visible'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Stargazing & Clean Sky</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.stargazing !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.stargazing !== false ? '✨ Pristine Night Sky' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Drone and pre-wedding */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">PHOTOGRAPHY & MEDIA REGULATION</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Drone Flights Allowed</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.droneAllowed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                            {homestay.droneAllowed ? '✓ Allowed' : '🚫 Restricted'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Pre-Wedding Shoots</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.preWeddingShoot ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.preWeddingShoot ? '✓ Permitted (₹)' : '🚫 Restricted'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Commercial Shoots</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.commercialPhotography ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                            {homestay.commercialPhotography ? '✓ Permitted (₹)' : '🚫 Restricted'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-565 dark:text-slate-455 font-sans">Bird Watching Hotspot</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.birdWatching ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                            {homestay.birdWatching ? '✓ Excellent' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {activeFactsheetTab === 'safety' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
                    
                    {/* Safety caretakers */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">SAFETY, SECURITY & ACCESSIBILITY</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-570 dark:text-slate-455 font-sans">CCTV Surveillance On-site</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.cctv ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.cctv ? '✓ Active Cameras' : '🚫 No CCTV'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-570 dark:text-slate-455 font-sans">24x7 Caretaker Presence</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.caretaker !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.caretaker !== false ? '✓ Hosts Live On-site' : 'Self Check-in'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-570 dark:text-slate-455 font-sans">First Aid Kit Prepared</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.firstAidKit !== false ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.firstAidKit !== false ? '✓ Fully Equipped' : '🚫 Standard'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-570 dark:text-slate-455 font-sans">Wheelchair Accessible Ground</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.wheelchairAccessible ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.wheelchairAccessible ? '✓ Ramp / Flat Entry' : '🚫 Steps required'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-570 dark:text-slate-455 font-sans">Ground Floor Rooms Available</span>
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold ${homestay.groundFloorRooms ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-555'}`}>
                            {homestay.groundFloorRooms ? '✓ Yes' : '🚫 Upstairs only'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Languages Spoken */}
                    <div className="space-y-3">
                      <h5 className="font-mono text-[9px] font-black uppercase tracking-wider text-slate-400">LANGUAGES SPOKEN BY HOST</h5>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {homestay.langNepali !== false && (
                            <span className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg">🇳🇵 Nepali</span>
                          )}
                          {homestay.langHindi !== false && (
                            <span className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg">🇮🇳 Hindi</span>
                          )}
                          {homestay.langEnglish && (
                            <span className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg">🇬🇧 English</span>
                          )}
                          {homestay.langBengali && (
                            <span className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg">🇮🇳 Bengali</span>
                          )}
                          {homestay.langOthers && (
                            <span className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-lg">🗣️ {homestay.langOthers}</span>
                          )}
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1">
                          <span className="block text-[9px] font-black uppercase text-slate-400 font-mono">EMERGENCY DIRECT CONTACT</span>
                          <span className="block text-xs font-mono font-bold text-slate-800 dark:text-white">
                            {homestay.emergencyContact || homestay.contact || 'Registered with Village Council'}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 10. LOCATION MAP INDICATOR */}
          <section id="location-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-850 shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                📍 GEO-SPATIAL MAP COORDINATES
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Property Location & Accessibility
              </h3>
            </div>

            <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              {/* Map background mockup decoration */}
              <div className="absolute inset-0 opacity-15 dark:opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-slate-950/40" />
              
              <div className="relative text-center p-6 space-y-3 z-10 max-w-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Coordinate Registration</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Lat: {homestay.latitude || '27.0333'}° N | Long: {homestay.longitude || '88.2667'}° E
                  </p>
                  <p className="text-xs text-slate-605 dark:text-slate-400 leading-relaxed font-sans">
                    Located {(homestay as any).distanceFromDestination || '1.2'} km from {villageDisplayName} central hub. Last 300 meters is an incredibly scenic walking trail through apple orchards.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl">
                <h5 className="font-bold text-slate-800 dark:text-slate-200">🚗 Driving Directions</h5>
                <p>Hire a registered taxi stand carrier from nearest hub to village head. Ask for the apple farm trail.</p>
              </div>
              <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl">
                <h5 className="font-bold text-slate-800 dark:text-slate-200">🅿️ Parking details</h5>
                <p>Private vehicle parking is available safely at the main village concrete gate head (3 mins walk away).</p>
              </div>
            </div>
          </section>

          {/* 13. REVIEWS */}
          <section id="reviews-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-850 shadow-xs space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                  ⭐ VISITOR RATINGS & ADVICE
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Traveler Reviews
                </h3>
              </div>

              {/* Score summary */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">
                    {averageReviewRating}
                  </span>
                  <span className="block text-[9px] text-slate-400 uppercase font-mono tracking-wider font-black">
                    Average Score
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="block text-2xl font-black text-slate-900 dark:text-white font-mono leading-none">
                    {totalReviews}
                  </span>
                  <span className="block text-[9px] text-slate-400 uppercase font-mono tracking-wider font-black">
                    Reviews Count
                  </span>
                </div>
              </div>
            </div>

            {/* Ratings breakdown sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850">
              <div className="space-y-3 text-xs">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-[10px] font-mono">
                  FACILITIES RATING BREAKDOWN
                </h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Cleanliness & Comfort', score: cleanlinessAvg },
                    { label: 'Scenic Location', score: locationAvg },
                    { label: 'Service & Hospitality', score: serviceAvg },
                    { label: 'Clay-Stove Food Taste', score: foodAvg }
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-650 dark:text-slate-300">
                        <span>{item.label}</span>
                        <span className="font-mono">{item.score} / 5.0</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 rounded-full" 
                          style={{ width: `${(parseFloat(item.score) / 5) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick review high rating callout */}
              <div className="flex flex-col justify-center items-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <Smile className="w-10 h-10 text-amber-500" />
                <h5 className="font-extrabold text-xs text-slate-800 dark:text-white uppercase tracking-wider font-mono">HIGHLY RECOMMENDED</h5>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
                  98% of visitors in the last 6 months recommend staying here, highlighting the hospitality of the local farming hosts.
                </p>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span>Verified Traveler Reviews ({totalReviews})</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setReviewSort('latest')}
                  className={`cursor-pointer ${reviewSort === 'latest' ? 'text-emerald-600 font-extrabold' : 'hover:text-emerald-500'}`}
                >
                  Latest
                </button>
                <span>|</span>
                <button 
                  onClick={() => setReviewSort('highest')}
                  className={`cursor-pointer ${reviewSort === 'highest' ? 'text-emerald-600 font-extrabold' : 'hover:text-emerald-500'}`}
                >
                  Highest Rated
                </button>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-6">
              {sortedReviews.map((rev) => (
                <div 
                  key={rev.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-3xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={rev.userAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=GuestUser'} 
                        alt={rev.userName} 
                        className="w-10 h-10 rounded-full border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-xs text-slate-850 dark:text-slate-150">{rev.userName}</h4>
                          {rev.isVerified && (
                            <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-mono font-black uppercase">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono">{rev.visitDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-500 font-mono text-xs">
                        {Array.from({ length: Math.floor(rev.rating) }).map((_, i) => '⭐')}
                      </div>
                      <span className="text-xs font-black text-slate-800 dark:text-white font-mono">{rev.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-650 dark:text-slate-300">
                    <h5 className="font-extrabold text-slate-900 dark:text-white">{rev.title}</h5>
                    <p className="leading-relaxed font-sans">{rev.content}</p>
                  </div>

                  {rev.travelerPhotos && rev.travelerPhotos.length > 0 && (
                    <div className="flex gap-2">
                      {rev.travelerPhotos.map((photo, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-150 cursor-pointer hover:opacity-90">
                          <img src={photo} alt="Traveler uploads" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {rev.recommends ? (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      👍 Highly Recommends visiting this Homestay
                    </div>
                  ) : (
                    <div className="text-[10px] text-rose-500 font-bold flex items-center gap-1.5">
                      👎 Expressed reservations during high winters
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Review submission form */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                ✍️ CURATE FEEDBACK
              </span>
              <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">
                Write your Traveler Review
              </h4>

              {reviewSuccess ? (
                <div className="p-4 bg-emerald-600 text-white rounded-xl text-xs font-black text-center space-y-1">
                  <div>🎉 Thank you for sharing your high-altitude memories!</div>
                  <div className="text-[10px] font-normal font-sans opacity-90">Your verified traveler review has been saved and compiled into our travel intelligence system.</div>
                  <button 
                    type="button" 
                    onClick={() => setReviewSuccess(false)}
                    className="mt-2 text-[10px] font-bold underline cursor-pointer block mx-auto"
                  >
                    Write another review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddReviewLocally} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 font-mono">Your Rating *</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="text-2xl transition hover:scale-115 cursor-pointer"
                          >
                            {star <= reviewRating ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 font-mono">Recommend? *</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setReviewRecommends(true)}
                          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${reviewRecommends ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 border border-slate-200'}`}
                        >
                          👍 Yes
                        </button>
                        <button 
                          type="button"
                          onClick={() => setReviewRecommends(false)}
                          className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition ${!reviewRecommends ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 border border-slate-200'}`}
                        >
                          👎 No
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Cleanliness', val: reviewCleanliness, setter: setReviewCleanliness },
                      { label: 'Location', val: reviewLocation, setter: setReviewLocation },
                      { label: 'Service', val: reviewService, setter: setReviewService },
                      { label: 'Food Taste', val: reviewFood, setter: setReviewFood }
                    ].map((sub) => (
                      <div key={sub.label} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-850 space-y-1">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{sub.label}</span>
                        <select 
                          value={sub.val} 
                          onChange={(e) => sub.setter(Number(e.target.value))}
                          className="w-full bg-transparent font-bold text-xs focus:outline-none dark:text-white"
                        >
                          <option value="5" className="dark:bg-slate-900">5 - Pristine</option>
                          <option value="4" className="dark:bg-slate-900">4 - Good</option>
                          <option value="3" className="dark:bg-slate-900">3 - Average</option>
                          <option value="2" className="dark:bg-slate-900">2 - Poor</option>
                          <option value="1" className="dark:bg-slate-900">1 - Terrible</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 font-mono">Review Title *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Heading of your experience..."
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 font-mono">When did you stay? *</label>
                      <input 
                        type="date" 
                        required
                        value={reviewVisitDate}
                        onChange={(e) => setReviewVisitDate(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 font-mono">Detailed review experience *</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Share your memories about cozy room insulation, wood stove fires, tea leaves garden exploration, or host family hospitality..."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 dark:text-white"
                    />
                  </div>

                  {user ? (
                    <button 
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-5 rounded-xl transition duration-150 cursor-pointer"
                    >
                      Publish Traveler Review
                    </button>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl text-[11px] text-slate-500 flex items-center justify-between">
                      <span>🔐 Please sign in to submit a verified explorer review.</span>
                      <button 
                        type="button" 
                        onClick={onLogin}
                        className="text-emerald-600 dark:text-emerald-400 font-black hover:underline cursor-pointer"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>

          </section>

          {/* 14. HOST CONTACT & SECURITY SECTION */}
          <section id="contact-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-850 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
                🔒 HOST COMMUNICATION & SECURITY
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Property Access & Direct Messaging
              </h3>
            </div>

            {/* CLOSED MARKETPLACE DIRECT MESSAGING */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>HillyTrip Verified Direct Booking &amp; Internal Messaging</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                To guarantee traveler protection, transparent pricing, and instant assistance across Himalayan routes, all communication between guests and property hosts is managed strictly through HillyTrip&apos;s internal messaging system.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Host Property</p>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{homestay.name}</p>
                  <p className="text-[11px] text-slate-500">Host: <span className="font-bold text-slate-700 dark:text-slate-300">{homestay.ownerName || 'Verified Himalayan Host'}</span></p>
                  <button
                    type="button"
                    onClick={() => {
                      const targetUrl = `#/enquire?listingType=homestay&listingId=${getItemSlug(homestay)}`;
                      if (navigate) navigate(targetUrl);
                      else window.location.hash = targetUrl;
                    }}
                    className="mt-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message on HillyTrip</span>
                  </button>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Property Location &amp; Directions</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 leading-snug">{homestay.address || 'Himalayan Ridge, West Bengal'}</p>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(homestay.address || homestay.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs hover:underline pt-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Open in Map Navigation</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT ONE-THIRD: STICKY RESERVATION WIDGET PANEL */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 3. STICKY BOOKING ACTION BAR */}
          <div 
            id="sticky-booking-widget" 
            className="sticky top-6 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-250 dark:border-slate-800 shadow-md space-y-5"
          >
            
            <div className="flex items-baseline justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">DIRECT RATE / NIGHT</span>
                <span className="text-2xl font-black text-emerald-800 dark:text-emerald-400 font-mono">₹{basePrice}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-extrabold text-slate-800 dark:text-white">{averageReviewRating}</span>
                <span className="text-slate-400 font-mono">({totalReviews})</span>
              </div>
            </div>

            {/* Direct Booking Flow Trigger Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setDirectBookingModalOpen(true)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider rounded-xl cursor-pointer transition shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Check Availability / Book Now</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const targetUrl = `#/enquire?listingType=homestay&listingId=${getItemSlug(homestay)}`;
                  if (navigate) navigate(targetUrl);
                  else window.location.hash = targetUrl;
                }}
                className="w-full py-2.5 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-250 dark:border-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Message on HillyTrip</span>
              </button>
            </div>

            <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

            {/* Direct Booking Flow Stages Summary */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider font-mono text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Direct Booking Flow</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                <p>1. Select Travel Dates</p>
                <p>2. Configure Guests &amp; Bedding</p>
                <p>3. Live Instant Availability Check</p>
                <p>4. 100% Upfront Transparent Price</p>
                <p>5. Confirm Direct Mountain Stay</p>
              </div>
            </div>

            <div className="text-center pt-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-mono">⚡ 100% INTERNAL ENCRYPTION &amp; INSTANT HOST CHAT</span>
            </div>

          </div>

        </div>

      </div>

      {/* ----------------- 11. UNIVERSAL PROXIMITY NETWORK (Geo-Based Nearest Villages, Stays, Attractions, Taxis) ----------------- */}
      <div className="max-w-7xl mx-auto px-4 mt-16 sm:px-6 lg:px-8">
        <UniversalNearbySection
          latitude={homestay.latitude}
          longitude={homestay.longitude}
          entityType="homestay"
          entityId={homestay.id}
          entityName={homestay.name}
          onSelectAttraction={(attr) => {
            navigate(`/attraction/${getItemSlug(attr)}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectHomestay={(stay) => {
            navigate(`#/homestay/${getItemSlug(stay)}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectVillage={(v) => {
            navigate(`#/village/${v.village_code || v.id}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectTaxiStand={(ts) => {
            navigate(`#/routes?from=${encodeURIComponent(ts.taxi_stand_name || ts.name)}`);
          }}
          onBookTaxi={(fromHub, toDest) => {
            navigate(`#/routes?from=${encodeURIComponent(fromHub)}&to=${encodeURIComponent(toDest || '')}`);
          }}
        />
      </div>

      {/* ----------------- 15. SIMILAR HOMESTAYS ----------------- */}
      <section id="similar-homestays-section" className="max-w-7xl mx-auto px-4 mt-16 sm:px-6 lg:px-8 space-y-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono block">
            🌟 RECOMMENDATIONS RADIAL
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Similar High-Altitude Homestays
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {similarHomestays.map((home) => (
            <div 
              key={home.id}
              onClick={() => {
                navigate(`#/homestays/${getItemSlug(home)}`);
              }}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-850 hover:border-emerald-500 transition shadow-2xs cursor-pointer group"
            >
              <div className="h-36 relative overflow-hidden">
                <ProgressiveImage 
                  src={home.images?.[0] || 'undefined'} 
                  alt={home.name} 
                  loading="lazy"
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3.5 space-y-1 text-left">
                <h4 className="font-extrabold text-xs text-slate-850 dark:text-white group-hover:text-emerald-600 transition truncate">
                  {home.name}
                </h4>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-[9px] text-slate-400 uppercase font-mono">Nightly</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-mono">₹{home.priceMin}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- 16. MOBILE STICKY BOTTOM ACTION CTA ----------------- */}
      <div className="block lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="text-left">
            <span className="block text-[9px] text-slate-400 font-mono uppercase">Nightly Starting At</span>
            <span className="text-xl font-black text-emerald-800 dark:text-emerald-400 font-mono">₹{homestay.priceMin}</span>
          </div>
          
          <button 
            onClick={() => {
              // Smooth scroll to the booking card widget
              document.getElementById('sticky-booking-widget')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md cursor-pointer transition active:scale-95"
          >
            Check Availability
          </button>
        </div>
      </div>

      {/* PHOTO LIGHTBOX MODAL */}
      <HomestayPhotoLightbox
        isOpen={isPhotoLightboxOpen}
        onClose={() => setIsPhotoLightboxOpen(false)}
        gallery={effectiveGallery}
        activeIndex={activeLightboxIndex}
        setActiveIndex={setActiveLightboxIndex}
        homestayName={homestay.name}
        isRepresentative={isRepresentativeGallery}
      />

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        listing={homestay}
        currentUser={user}
        claimSource="Listing Page"
        onSuccessNavigate={() => navigate('#/partner')}
      />

      {/* Direct Booking Modal (5-Step Flow) */}
      <DirectBookingModal
        isOpen={directBookingModalOpen}
        onClose={() => setDirectBookingModalOpen(false)}
        homestay={homestay}
        roomCategories={roomCategories}
        initialDate={bookingDate}
        initialGuests={bookingGuests}
        currentUser={user}
        onDirectMessage={() => {
          const targetUrl = `#/enquire?listingType=homestay&listingId=${getItemSlug(homestay)}`;
          if (navigate) navigate(targetUrl);
          else window.location.hash = targetUrl;
        }}
      />

    </div>
  );
};

export default HomestayDetailPage;
