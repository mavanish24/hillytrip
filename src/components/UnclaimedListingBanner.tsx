import React from 'react';
import { motion } from 'motion/react';
import { Building2, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { isListingVerified } from '../lib/claimSystem';

export interface UnclaimedListingBannerProps {
  listing: {
    id: string;
    name: string;
    type?: string;
    ownerId?: string | null;
    owner_user_id?: string | null;
    claim_status?: any;
    verified?: boolean;
    isVerified?: boolean;
  };
  onClaimClick: () => void;
}

export default function UnclaimedListingBanner({ listing, onClaimClick }: UnclaimedListingBannerProps) {
  const verified = isListingVerified(listing);

  if (verified) return null;

  const benefits = [
    'Verified Badge',
    'Receive Direct Enquiries',
    'Manage Bookings',
    'Upload Photos',
    'Update Pricing',
    'Edit Property Details',
    'Reply to Reviews',
    'Business Analytics',
    'Availability Calendar',
    'Lifetime Free Listing'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden my-6 text-left"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-amber-500 text-slate-950 text-xs font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
          🟠 Unclaimed Listing
        </span>
        <span className="text-xs font-bold text-amber-400/90 font-mono">
          Free Owner Claim Available
        </span>
      </div>

      {/* Title & Description */}
      <div className="space-y-2 mb-6">
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
          Are you the owner of {listing.name}?
        </h2>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
          This business has not yet been claimed by its owner. If you own this property, claim it now and unlock all official owner tools in under 1 minute.
        </p>
      </div>

      {/* Benefits Check List */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 mb-6">
        <h4 className="text-xs font-black uppercase font-mono tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Owner Verification Benefits
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2.5">
          {benefits.map((b, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Large CTA Button (#F97316) */}
      <button
        onClick={onClaimClick}
        style={{ backgroundColor: '#F97316' }}
        className="w-full sm:w-auto px-8 py-4 text-white text-base font-black rounded-2xl shadow-[0_0_25px_rgba(249,115,22,0.4)] hover:shadow-[0_0_35px_rgba(249,115,22,0.6)] hover:brightness-110 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <span>Claim this Business</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
