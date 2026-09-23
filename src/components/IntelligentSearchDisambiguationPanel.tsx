import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, Compass, Trees, Home, Sparkles, Car, Navigation, ArrowRight, X, ChevronRight, CheckCircle2, Layers
} from 'lucide-react';
import { DisambiguationOption, DisambiguationResolution } from '../utils/searchDisambiguationEngine';
import { ProgressiveImage } from './ProgressiveImage';

interface IntelligentSearchDisambiguationPanelProps {
  resolution: DisambiguationResolution;
  onSelectOption: (option: DisambiguationOption) => void;
  onDismiss?: () => void;
  className?: string;
}

export const IntelligentSearchDisambiguationPanel: React.FC<IntelligentSearchDisambiguationPanelProps> = ({
  resolution,
  onSelectOption,
  onDismiss,
  className = ''
}) => {
  if (!resolution || !resolution.isAmbiguous || resolution.options.length <= 1) {
    return null;
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'district':
        return <MapPin className="w-4 h-4 text-emerald-400" />;
      case 'destination':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'village':
        return <Trees className="w-4 h-4 text-teal-300" />;
      case 'homestay':
        return <Home className="w-4 h-4 text-indigo-400" />;
      case 'attraction':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'taxi_stand':
        return <Car className="w-4 h-4 text-orange-400" />;
      case 'route':
        return <Navigation className="w-4 h-4 text-rose-400" />;
      default:
        return <Compass className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`w-full bg-slate-950 text-white rounded-3xl p-6 md:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden my-6 select-none ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex items-start justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Disambiguation Required
            </span>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <X className="w-3 h-3" /> Dismiss
              </button>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white pt-1">
            We found multiple matches for <span className="text-emerald-400">"{resolution.query}"</span>.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Choose what you meant to navigate directly to your intended entity.
          </p>
        </div>
      </div>

      {/* Entity Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resolution.options.map((option) => {
          return (
            <div
              key={option.id}
              onClick={() => onSelectOption(option)}
              className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                {/* Badge Header & Entity Type */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${option.badgeBgClass}`}>
                    {getEntityIcon(option.entityType)}
                    <span>{option.badgeLabel}</span>
                  </span>

                  {option.image && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-700/80 shrink-0">
                      <ProgressiveImage
                        src={option.image}
                        alt={option.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {option.title}
                  </h3>
                  
                  {/* Hierarchy & Subtitle */}
                  {option.hierarchy && (option.hierarchy.destination || option.hierarchy.district) ? (
                    <div className="text-xs text-slate-400 space-y-0.5 font-medium">
                      {option.hierarchy.destination && (
                        <div>
                          Destination: <strong className="text-slate-200">{option.hierarchy.destination}</strong>
                        </div>
                      )}
                      {option.hierarchy.district && (
                        <div>
                          District: <strong className="text-slate-200">{option.hierarchy.district}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">
                      {option.subtitle}
                    </p>
                  )}
                </div>

                {/* Counts breakdown */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
                  {option.counts.villagesCount !== undefined && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-[11px]">
                      <Trees className="w-3 h-3 text-teal-300" /> {option.counts.villagesCount} Villages
                    </span>
                  )}
                  {option.counts.homestaysCount !== undefined && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-[11px]">
                      <Home className="w-3 h-3 text-indigo-300" /> {option.counts.homestaysCount} Homestays
                    </span>
                  )}
                  {option.counts.attractionsCount !== undefined && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3 h-3 text-amber-300" /> {option.counts.attractionsCount} Attractions
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 group-hover:text-emerald-300 transition-colors uppercase tracking-wider flex items-center gap-1.5">
                  [{option.actionText}]
                </span>
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950 flex items-center justify-center transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
