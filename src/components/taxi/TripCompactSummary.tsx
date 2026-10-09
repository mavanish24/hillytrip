import React from 'react';
import { Navigation, Clock, ShieldCheck, Car, Users } from 'lucide-react';
import { RouteEstimate } from '../../utils/taxiRoutingEngine';

interface TripCompactSummaryProps {
  routeEstimate: RouteEstimate;
  sharedCount: number;
  reservedCount: number;
}

export const TripCompactSummary: React.FC<TripCompactSummaryProps> = ({
  routeEstimate,
  sharedCount,
  reservedCount
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Route Verified Corridor
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>{routeEstimate.from}</span>
            <span className="text-amber-500">→</span>
            <span>{routeEstimate.to}</span>
          </h2>
        </div>

        {/* Quick Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl font-extrabold text-slate-800 dark:text-slate-200">
            <Navigation className="w-3.5 h-3.5 text-amber-500" />
            <span>{routeEstimate.distanceKm} km</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl font-extrabold text-slate-800 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{routeEstimate.estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Corridor Road Info & Options Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Road Status: <strong className="text-slate-700 dark:text-slate-300">{routeEstimate.roadType}</strong></span>
        </span>

        <div className="flex items-center gap-3 font-semibold text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Shared Taxis ({sharedCount} Stands/Operators)
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
            <Car className="w-3.5 h-3.5" /> Reserved Operators ({reservedCount} Verified)
          </span>
        </div>
      </div>
    </div>
  );
};
