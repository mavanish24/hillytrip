import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, Building2, ArrowRight } from 'lucide-react';
import { ClaimStatus } from '../types';
import { isListingVerified, getClaimStatus } from '../lib/claimSystem';

export interface UnclaimedBadgeProps {
  listing: {
    id: string;
    name: string;
    type?: string;
    location?: string;
    ownerId?: string | null;
    owner_user_id?: string | null;
    claim_status?: ClaimStatus;
    verified?: boolean;
    isVerified?: boolean;
    isFeatured?: boolean;
  };
  onClaimClick: (e?: React.MouseEvent) => void;
  badgePriority?: boolean; // Priority: 1 VERIFIED, 2 FEATURED, 3 HILLYTRIP CHOICE
}

export function UnclaimedBadge({ listing, onClaimClick, badgePriority = true }: UnclaimedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const verified = isListingVerified(listing);
  const claimStatus = getClaimStatus(listing);

  if (verified) {
    return (
      <span className="bg-emerald-600/95 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-flex items-center gap-1 shadow-md border border-emerald-400/30">
        <Award className="w-3 h-3 shrink-0 text-emerald-200" />
        🟢 VERIFIED
      </span>
    );
  }

  if (claimStatus === 'UNCLAIMED' || !verified) {
    return (
      <div className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClaimClick(e);
          }}
          className="bg-amber-500/95 hover:bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-flex items-center gap-1 shadow-md border border-amber-300/40 hover:scale-105 transition duration-200 cursor-pointer"
        >
          <span>🟠 UNCLAIMED</span>
        </button>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1.5 z-30 w-56 p-3 bg-slate-900/95 border border-amber-500/40 rounded-xl shadow-2xl text-left backdrop-blur-md"
            >
              <p className="text-[11px] font-bold text-white leading-tight">
                This business has not been claimed yet.
              </p>
              <p className="text-[10px] text-slate-300 mt-1">
                Are you the owner?
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimClick(e);
                }}
                className="mt-2 w-full py-1 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg transition text-center cursor-pointer block"
              >
                Claim this Business FREE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}

export interface ClaimStripProps {
  listing: {
    id: string;
    name: string;
    type?: string;
    ownerId?: string | null;
    owner_user_id?: string | null;
    claim_status?: ClaimStatus;
    verified?: boolean;
    isVerified?: boolean;
  };
  onClaimClick: (e: React.MouseEvent) => void;
  className?: string;
}

export function ClaimStrip({ listing, onClaimClick, className = '' }: ClaimStripProps) {
  const verified = isListingVerified(listing);

  if (verified) return null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={(e) => {
        e.stopPropagation();
        onClaimClick(e);
      }}
      className={`relative w-full py-2 px-3 bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-amber-500/15 border border-amber-500/40 hover:border-amber-500/80 rounded-xl backdrop-blur-md shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 group ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 group-hover:text-amber-200">
        <span className="text-sm">🏡</span>
        <span className="tracking-wide">Own this property?</span>
      </div>
      <div className="flex items-center gap-1 text-xs font-black text-amber-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition font-mono">
        <span>Claim it FREE</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
}
