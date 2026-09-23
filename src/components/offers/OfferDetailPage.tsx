import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, MapPin, Calendar, CheckCircle2, XCircle, Copy, Check, 
  Phone, MessageCircle, Share2, Heart, Bookmark, ShieldCheck, Star, 
  Sparkles, Clock, Gift, ExternalLink, Navigation, Building2, Tag, 
  Info, ChevronRight, Car, Home, Compass, Eye, User, ArrowUpRight, CheckCircle,
  MessageSquare
} from 'lucide-react';
import { Offer } from '../../types/offer';
import { Destination, Attraction, Homestay } from '../../types';
import { getOfferById, getOffers, isOfferSaved, toggleSaveOffer, trackOfferAnalytics } from '../../services/offers/OfferEngine';
import { OfferBadge } from './OfferBadge';
import { getItemSlug } from '../../utils/slug';

export interface OfferDetailPageProps {
  offerId: string;
  navigate: (path: string) => void;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
}

export const OfferDetailPage: React.FC<OfferDetailPageProps> = ({
  offerId,
  navigate,
  destinations = [],
  attractions = [],
  homestays = []
}) => {
  const [offer, setOffer] = useState<Offer | undefined>(() => getOfferById(offerId));
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'terms' | 'location'>('overview');

  useEffect(() => {
    const loaded = getOfferById(offerId);
    setOffer(loaded);
    if (loaded) {
      setSelectedImage(loaded.coverImage || '');
      setIsSaved(isOfferSaved(loaded.id));
      trackOfferAnalytics(loaded.id, 'views');
    }
  }, [offerId]);

  if (!offer) {
    return (
      <div className="min-h-[70vh] bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl mb-4 shadow-xl">
          🎁
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Offer Not Found or Expired</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          The promotional voucher you are looking for is no longer active or may have been removed.
        </p>
        <button
          onClick={() => navigate('/offers')}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Special Offers</span>
        </button>
      </div>
    );
  }

  // Related Content Calculations
  const allOffers = getOffers({ onlyActiveValid: true });
  const moreOffersFromBiz = allOffers.filter(
    (o) => o.businessId === offer.businessId && o.id !== offer.id
  );
  
  const nearbyAttractions = attractions.filter(
    (a) => a.destinationId === offer.destinationId || 
      (a.district && offer.destinationName && a.district.toLowerCase().includes(offer.destinationName.toLowerCase())) ||
      (a.state && offer.destinationName && a.state.toLowerCase().includes(offer.destinationName.toLowerCase()))
  ).slice(0, 4);

  const nearbyHomestays = homestays.filter(
    (h) => h.destinationId === offer.destinationId ||
      (h.district && offer.destinationName && h.district.toLowerCase().includes(offer.destinationName.toLowerCase()))
  ).slice(0, 4);

  const formattedValidFrom = offer.validFrom ? new Date(offer.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Immediate';
  const formattedValidTill = offer.validTill ? new Date(offer.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Limited Time';

  // Calculate Days Left
  const daysLeft = offer.validTill ? Math.max(0, Math.ceil((new Date(offer.validTill).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 30;

  const handleToggleSave = () => {
    const nextSaved = toggleSaveOffer(offer.id);
    setIsSaved(nextSaved);
  };

  const handleCopyCoupon = () => {
    if (offer.couponCode) {
      navigator.clipboard.writeText(offer.couponCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer.title,
        text: `Check out this offer on HillyTrip: ${offer.title} from ${offer.businessName}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
    trackOfferAnalytics(offer.id, 'shares');
  };

  const handleClaimOffer = () => {
    trackOfferAnalytics(offer.id, 'claims');
    setShowClaimModal(true);
  };

  const handleMessageBusiness = () => {
    trackOfferAnalytics(offer.id, 'clicks');
    navigate(`#/enquire?listingType=offer&listingId=${offer.id}`);
  };

  // Default included & excluded lists if not present on dataset
  const includedItems = offer.included || [
    'Direct discount applied on booking',
    'Complimentary estate tea / welcome drink',
    'Free high-speed Wi-Fi access',
    'Free parking on premises',
    '24/7 Hot water & power backup',
    'Verified local host assistance'
  ];

  const excludedItems = offer.excluded || [
    'Personal laundry & extra beverage orders',
    'Private local taxi sightseeing transfers',
    'Driver tipping & personal expenditures',
    'Government entry fees for sanctuaries/parks'
  ];

  const redemptionSteps = offer.redemptionProcess || [
    { title: 'Copy Coupon Code', desc: `Click 'Claim Offer' or copy coupon code ${offer.couponCode || 'HILLYTRIP20'}.` },
    { title: 'Connect Directly', desc: `Message ${offer.businessName} directly on HillyTrip.` },
    { title: 'Unlock Instant Savings', desc: 'Mention HillyTrip voucher code during booking confirmation or check-in.' }
  ];

  const galleryImages = [offer.coverImage, ...(offer.gallery || [])]
    .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    .filter((img, idx, self) => self.indexOf(img) === idx);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* SHARE TOAST NOTIFICATION */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400/40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Link copied to clipboard! Share with friends.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/offers')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Back to Special Offers</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              isSaved 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isSaved ? 'Saved to Wishlist' : 'Save Offer'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="hidden md:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Share Offer"
          >
            <Share2 className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Share</span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">

        {/* ================================================== */}
        {/* HERO BANNER SECTION */}
        {/* ================================================== */}
        <section className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          {galleryImages.length > 0 ? (
            /* Main Hero Image Frame */
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[520px] overflow-hidden bg-slate-950">
              <img
                src={selectedImage || galleryImages[0]}
                alt={offer.title}
                className="w-full h-full object-cover transform transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />

              {/* Top Badges Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                <OfferBadge badge={offer.badge} badgeColor={offer.badgeColor} size="lg" />

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-lg">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{offer.category}</span>
                </span>
              </div>

              {/* Gallery Thumbnails Overlay (if multiple images) */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-12 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedImage === img ? 'border-emerald-400 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Text-Only Grand Branded Banner */
            <div className="relative w-full p-8 sm:p-12 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 overflow-hidden border-b border-slate-800 flex flex-col justify-between">
              {/* Decorative Watermark */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                <svg className="absolute -bottom-2 left-0 right-0 w-full h-32 text-emerald-300" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M0,0 L150,90 L300,30 L450,110 L600,20 L750,100 L900,40 L1050,95 L1200,10 L1200,120 L0,120 Z" fill="currentColor" />
                </svg>
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/30 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl" />
              </div>

              {/* Top Badges */}
              <div className="relative z-10 flex items-center justify-between gap-2 mb-6">
                <OfferBadge badge={offer.badge} badgeColor={offer.badgeColor} size="lg" />

                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-lg">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{offer.category}</span>
                </span>
              </div>

              {/* Discount Display */}
              <div className="relative z-10 text-center my-4 space-y-2">
                <div className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 drop-shadow-lg">
                  {offer.discountPercentage ? `${offer.discountPercentage}% OFF` : offer.flatDiscountAmount ? `Flat ₹${offer.flatDiscountAmount} OFF` : offer.badge || 'SPECIAL OFFER'}
                </div>
                {offer.couponCode && (
                  <span className="inline-block px-4 py-1 rounded-xl font-mono text-xs sm:text-sm font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 uppercase tracking-widest shadow-md">
                    PROMO CODE: {offer.couponCode}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Hero Content Box */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-6 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800/80">
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-300">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <MapPin className="w-4 h-4" />
                  <span>{offer.destinationName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-mono">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Valid till {formattedValidTill} ({daysLeft} days left)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {offer.title}
              </h1>

              {/* Business Name Subtitle */}
              <div className="flex items-center gap-2 text-slate-300 text-sm sm:text-base font-bold">
                <span>By</span>
                <span className="text-white hover:text-emerald-300 transition-colors cursor-pointer" onClick={() => navigate(`#/business/${offer.businessId}`)}>
                  {offer.businessName}
                </span>
                {offer.businessVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Host</span>
                  </span>
                )}
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 border-t border-slate-800/80">
              <button
                onClick={handleClaimOffer}
                className="flex-1 sm:flex-initial px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
                <span>Claim Offer Now</span>
              </button>

              <button
                onClick={handleMessageBusiness}
                className="flex-1 sm:flex-initial px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm border border-slate-700 flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md"
              >
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Message on HillyTrip</span>
              </button>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* OFFER SUMMARY / HIGHLIGHT BAR */}
        {/* ================================================== */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Discount Value</span>
            <div className="text-lg sm:text-xl font-black text-emerald-400 flex items-center gap-1">
              <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{offer.badge}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Host Rating</span>
            <div className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
              <span>{offer.businessRating || 4.9} / 5</span>
              <span className="text-xs text-slate-400 font-normal">({offer.reviewCount || 38})</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Validity Window</span>
            <div className="text-xs sm:text-sm font-bold text-slate-200 truncate flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{formattedValidTill}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Voucher Code</span>
            <div className="text-xs sm:text-sm font-mono font-black text-amber-300 truncate flex items-center justify-between">
              <span>{offer.couponCode || 'HILLYTRIP20'}</span>
              <button
                onClick={handleCopyCoupon}
                className="text-slate-400 hover:text-emerald-300 transition-colors p-1"
                title="Copy Coupon Code"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* BUSINESS SECTION */}
        {/* ================================================== */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              {/* Business Logo / Avatar */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/40 shrink-0 shadow-lg flex items-center justify-center text-2xl font-black text-emerald-300">
                {offer.businessLogo ? (
                  <img src={offer.businessLogo} alt={offer.businessName} className="w-full h-full object-cover" />
                ) : (
                  <span>{offer.businessName.charAt(0)}</span>
                )}
                {offer.businessVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 border border-slate-900">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-slate-950" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white">{offer.businessName}</h3>
                  {offer.businessVerified && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Verified Business
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{offer.businessAddress || `${offer.destinationName}, North Bengal & Sikkim`}</span>
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-amber-300 font-bold">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{offer.businessRating || 4.9}</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-normal">{offer.reviewCount || 38} Verified Guest Reviews</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`#/business/${offer.businessId}`)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md self-stretch sm:self-auto justify-center"
            >
              <span>View Business Profile</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Communication Channel</span>
              <p className="text-white font-bold text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>HillyTrip In-App Messaging</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Direct Host Inquiries</span>
              <p className="text-emerald-400 font-bold text-sm">Instant Verified Support</p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* OFFER DETAILS SECTION */}
        {/* ================================================== */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-400" />
              <span>Offer Details & Highlights</span>
            </h2>
          </div>

          {/* Short Description Callout */}
          {offer.shortDescription && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm leading-relaxed font-medium">
              💡 {offer.shortDescription}
            </div>
          )}

          {/* Full Description */}
          <div className="space-y-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p className="whitespace-pre-line">{offer.fullDescription}</p>
          </div>

          {/* Coupon Code Callout Box */}
          {offer.couponCode && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border-2 border-dashed border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">Promotional Voucher Code</span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-widest">
                  {offer.couponCode}
                </div>
                <p className="text-xs text-slate-400">Mention code when calling or checking in to redeem discount.</p>
              </div>

              <button
                onClick={handleCopyCoupon}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg self-stretch sm:self-auto justify-center"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Redemption Process Steps */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>How to Redeem this Offer</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {redemptionSteps.map((step, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 relative">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                    {idx + 1}
                  </div>
                  <h4 className="text-sm font-bold text-white">{step.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* INCLUDED / EXCLUDED SECTION */}
        {/* ================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Included Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-lg border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>What's Included</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              {includedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Excluded Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-rose-400 font-black text-lg border-b border-slate-800 pb-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>What's Excluded</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              {excludedItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================================================== */}
        {/* TERMS & CONDITIONS SECTION */}
        {/* ================================================== */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-slate-200 font-black text-lg border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Terms & Conditions</span>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 list-disc list-inside leading-relaxed">
            {(offer.termsAndConditions || [
              'Valid on direct bookings confirmed via HillyTrip.',
              'Voucher code must be presented at the time of booking or check-in.',
              'Cannot be exchanged for cash or combined with other promotional schemes.',
              'Subject to availability during festival surge dates.'
            ]).map((term, idx) => (
              <li key={idx}>{term}</li>
            ))}
          </ul>
        </section>

        {/* ================================================== */}
        {/* LOCATION MAP SECTION */}
        {/* ================================================== */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>Location & Coordinates</span>
              </h2>
              <p className="text-xs text-slate-400">{offer.businessAddress || offer.destinationName}</p>
            </div>

            <a
              href={offer.locationMapUrl || `https://www.google.com/maps/search/?api=1&query=${offer.latitude || 27.0360},${offer.longitude || 88.2627}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-auto"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Interactive Map Visual */}
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-2xl shadow-xl">
              📍
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{offer.businessName}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {offer.businessAddress || `Located in pristine ${offer.destinationName}, North Bengal & Sikkim.`}
              </p>
              {offer.latitude && offer.longitude && (
                <span className="inline-block mt-2 font-mono text-[11px] text-emerald-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  GPS: {offer.latitude}, {offer.longitude}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* RELATED CONTENT SECTIONS */}
        {/* ================================================== */}
        
        {/* More Offers from this Business */}
        {moreOffersFromBiz.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <span>More Offers from {offer.businessName}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreOffersFromBiz.map((otherOffer) => (
                <div
                  key={otherOffer.id}
                  onClick={() => {
                    setOffer(otherOffer);
                    setSelectedImage(otherOffer.coverImage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 relative">
                    <img src={otherOffer.coverImage} alt={otherOffer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-2 left-2">
                      <OfferBadge badge={otherOffer.badge} badgeColor={otherOffer.badgeColor} size="sm" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">{otherOffer.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Attractions */}
        {nearbyAttractions.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <span>Nearby Attractions in {offer.destinationName}</span>
              </h2>
              <button
                onClick={() => navigate('/attractions')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {nearbyAttractions.map((attr) => (
                <div
                  key={attr.id}
                  onClick={() => navigate(`/attraction/${getItemSlug(attr)}`)}
                  className="group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-950">
                    <img src={attr.image} alt={attr.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">{attr.name}</h3>
                    <p className="text-[10px] text-slate-400 truncate">{attr.category || 'Sightseeing'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Homestays */}
        {nearbyHomestays.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-400" />
                <span>Nearby Homestays in {offer.destinationName}</span>
              </h2>
              <button
                onClick={() => navigate('/homestays')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {nearbyHomestays.map((home) => (
                <div
                  key={home.id}
                  onClick={() => navigate(`#/homestay/${getItemSlug(home)}`)}
                  className="group rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-950">
                    <img src={home.images?.[0] || 'undefined'} alt={home.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">{home.name}</h3>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span className="text-emerald-400 font-bold">₹{home.priceMin} / night</span>
                      <span className="flex items-center gap-0.5 text-amber-300"><Star className="w-3 h-3 fill-amber-400" /> 4.9</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nearby Taxi Operators */}
        <section className="space-y-4 pt-4 border-t border-slate-800">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 text-2xl shrink-0">
                🚖
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Need a Taxi in {offer.destinationName}?</h3>
                <p className="text-xs text-slate-400">Book certified mountain drivers for pickup from NJP / Bagdogra or local sightseeing.</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/routes')}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
            >
              <Car className="w-4 h-4" />
              <span>Book Mountain Taxi</span>
            </button>
          </div>
        </section>

      </main>

      {/* ================================================== */}
      {/* CLAIM OFFER MODAL */}
      {/* ================================================== */}
      <AnimatePresence>
        {showClaimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 text-xl font-bold">
                    🎉
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Offer Voucher Claimed!</h3>
                    <p className="text-xs text-slate-400">Presented by {offer.businessName}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowClaimModal(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Voucher Code Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border-2 border-dashed border-emerald-500/50 text-center space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Your Official Promo Code</span>
                <div className="text-3xl font-mono font-black text-emerald-400 tracking-wider">
                  {offer.couponCode || 'HILLYTRIP20'}
                </div>

                <button
                  onClick={handleCopyCoupon}
                  className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Code Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-xs text-slate-300">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Next Steps to Redeem:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Show or quote this voucher code when booking with {offer.businessName}.</li>
                  <li>Click below to message the host directly on HillyTrip to claim your discount.</li>
                </ol>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleMessageBusiness}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Host on HillyTrip</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default OfferDetailPage;
