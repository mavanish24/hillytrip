import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Calendar, CheckCircle2, ArrowRight, Gift } from 'lucide-react';
import { Offer } from '../../types/offer';
import { OfferBadge } from './OfferBadge';
import { ProgressiveImage } from '../ProgressiveImage';

interface HomepageOfferCardProps {
  offer: Offer;
  onSelectOffer: (offer: Offer) => void;
  className?: string;
}

export const HomepageOfferCard: React.FC<HomepageOfferCardProps> = ({
  offer,
  onSelectOffer,
  className = ''
}) => {
  const categoryIconMap: Record<string, string> = {
    'Homestay': '🏡',
    'Hotel': '🏨',
    'Taxi Operator': '🚖',
    'Tour Operator': '🎒',
    'Restaurant': '🍽',
    'Activity': '🎟',
    'Local Experience': '🛍'
  };

  const hasImage = Boolean(
    offer.coverImage && 
    typeof offer.coverImage === 'string' && 
    offer.coverImage.trim().length > 0
  );

  const formattedValidTill = React.useMemo(() => {
    if (!offer.validTill) return 'Limited Time';
    try {
      const d = new Date(offer.validTill);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return offer.validTill;
    }
  }, [offer.validTill]);

  // Highlight value calculation for Text-Only cards
  const discountDisplay = React.useMemo(() => {
    if (offer.discountPercentage) return `${offer.discountPercentage}% OFF`;
    if (offer.flatDiscountAmount) return `Flat ₹${offer.flatDiscountAmount} OFF`;
    if (offer.badge) return offer.badge;
    return 'SPECIAL OFFER';
  }, [offer.discountPercentage, offer.flatDiscountAmount, offer.badge]);

  const ctaLabel = offer.ctaText || 'View Offer';

  return (
    <motion.div
      onClick={() => onSelectOffer(offer)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        transition: { duration: 0.25, ease: 'easeOut' }
      }}
      className={`group relative flex flex-col rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/40 hover:border-slate-700 transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* HERO SECTION: IMAGE vs TEXT-ONLY BRANDED CARD */}
      {hasImage ? (
        /* CASE 2: IMAGE PROVIDED */
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-950">
          <ProgressiveImage
            src={offer.coverImage!}
            alt={offer.title}
            itemName={offer.title}
            targetWidth={400}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover transform transition-all duration-300 group-hover:scale-[1.04] group-hover:brightness-105"
          />

          {/* Dark Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
            <OfferBadge badge={offer.badge} badgeColor={offer.badgeColor} size="md" />

            {/* Category Chip */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-md">
              <span>{categoryIconMap[offer.category] || '✨'}</span>
              <span>{offer.category}</span>
            </span>
          </div>

          {/* Hover "View Offer →" Fade-in Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px] z-20">
            <span className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      ) : (
        /* CASE 1: TEXT ONLY — BRANDED VISUAL HERO CARD */
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-4 flex flex-col justify-between border-b border-slate-800/80">
          {/* Decorative Backdrop Mesh & SVG Mountain Silhouette Pattern */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
            <svg className="absolute -bottom-1 left-0 right-0 w-full h-20 text-emerald-300" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 L150,90 L300,30 L450,110 L600,20 L750,100 L900,40 L1050,95 L1200,10 L1200,120 L0,120 Z" fill="currentColor" />
            </svg>
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-amber-500/20 blur-2xl" />
          </div>

          {/* Top Row Badges */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm backdrop-blur-md">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>SPECIAL OFFER</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-md">
              <span>{categoryIconMap[offer.category] || '✨'}</span>
              <span>{offer.category}</span>
            </span>
          </div>

          {/* Hero Discount & Value Banner */}
          <div className="relative z-10 my-auto text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200 drop-shadow-md">
              {discountDisplay}
            </div>
            {offer.couponCode && (
              <span className="inline-block px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 uppercase tracking-widest">
                CODE: {offer.couponCode}
              </span>
            )}
          </div>

          {/* Hover Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-[2px] z-20">
            <span className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      )}

      {/* CARD BODY CONTENT */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
          {offer.title}
        </h3>

        {/* Short Description snippet if text-only */}
        {!hasImage && (offer.shortDescription || offer.fullDescription) && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {offer.shortDescription || offer.fullDescription}
          </p>
        )}

        {/* Business & Location Row */}
        <div className="flex flex-col space-y-1.5 border-t border-slate-800/80 pt-3 text-xs text-slate-300">
          {/* Business Name with Verified Badge */}
          <div className="flex items-center justify-between text-slate-200 font-bold">
            <div className="flex items-center gap-1.5 truncate">
              <span>{categoryIconMap[offer.category] || '🏡'}</span>
              <span className="truncate max-w-[180px]">{offer.businessName}</span>
              {offer.businessVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </div>

            <span className="text-emerald-400 group-hover:translate-x-1 transition-transform font-bold text-xs flex items-center gap-1 shrink-0">
              <span>{ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Destination & Validity info */}
          <div className="flex items-center justify-between text-slate-400 pt-1">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{offer.destinationName}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Valid till {formattedValidTill}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

