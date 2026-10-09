import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, CheckCircle2, Circle, ShieldCheck, Award, Sparkles, 
  MapPin, Compass, Info, Stamp, Share2, ChevronRight, Lock
} from 'lucide-react';
import { DEFAULT_PASSPORT_REGIONS, CountryPassportRegion, RegionStateItem } from '../lib/explorerSystem';

interface TravelPassportProps {
  passportRegions?: CountryPassportRegion[];
  userName?: string;
  explorerLevelTitle?: string;
  className?: string;
}

export const TravelPassport: React.FC<TravelPassportProps> = ({
  passportRegions = DEFAULT_PASSPORT_REGIONS,
  userName = 'Traveler',
  explorerLevelTitle = 'Mountain Explorer',
  className = ''
}) => {
  const [activeCountryIndex, setActiveCountryIndex] = useState(0);

  const totalStates = passportRegions.flatMap(c => c.states).length;
  const visitedStates = passportRegions.flatMap(c => c.states).filter(s => s.isVisited).length;
  const completionPercentage = Math.round((visitedStates / totalStates) * 100) || 0;

  const activeRegion = passportRegions[activeCountryIndex] || passportRegions[0];

  return (
    <div className={`relative rounded-3xl overflow-hidden bg-slate-900 border border-amber-500/30 shadow-2xl text-slate-100 ${className}`}>
      {/* Authentic Gold Foil Passport Header Pattern */}
      <div className="relative p-6 sm:p-8 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-6 -translate-x-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Globe className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  OFFICIAL HIMALAYAN PASSPORT
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED ID
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                {userName}'s Travel Passport
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-white/10 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Passport Level</div>
              <div className="text-xs font-black text-amber-300">{explorerLevelTitle}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-black text-sm">
              {visitedStates}
            </div>
          </div>
        </div>

        {/* Global Exploration Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Regional Exploration Coverage
            </span>
            <span className="font-mono text-amber-300">{visitedStates} of {totalStates} Regions ({completionPercentage}%)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Country Selector Tabs */}
      <div className="p-4 bg-slate-950/80 border-b border-white/10 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {passportRegions.map((region, idx) => (
          <button
            key={region.country}
            onClick={() => setActiveCountryIndex(idx)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
              activeCountryIndex === idx
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-xs'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <span className="text-base">{region.flagEmoji}</span>
            <span>{region.country}</span>
            {region.isFuture && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 ml-1">
                Upcoming
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Region Grid List */}
      <div className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
          <span>Region / Territory</span>
          <span>Verification Status</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {activeRegion.states.map((state: RegionStateItem) => (
            <div
              key={state.id}
              className={`relative p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                state.isVisited
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5 hover:border-emerald-400/60'
                  : 'bg-slate-950/40 border-white/5 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  state.isVisited 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  {state.isVisited ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div>
                  <h4 className={`text-sm font-black tracking-tight ${state.isVisited ? 'text-white' : 'text-slate-400'}`}>
                    {state.isVisited ? `✔ ${state.name}` : `⬜ ${state.name}`}
                  </h4>

                  {state.isVisited ? (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified via {state.verifiedReason || 'Traveller Moment'}</span>
                    </div>
                  ) : (
                    <div className="mt-1 text-[10px] font-medium text-slate-500">
                      Requires 1 verified booking, moment, review or journey.
                    </div>
                  )}
                </div>
              </div>

              {state.isVisited && (
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-300 font-mono text-[10px] font-black" title="Verified Passport Stamp">
                  STAMP
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Informational Footer */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">How Passport Stamps Work:</strong> Visited regions automatically increment when you complete a booking, publish a Traveller Moment, submit an authentic review, or complete a mountain journey circuit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravelPassport;
