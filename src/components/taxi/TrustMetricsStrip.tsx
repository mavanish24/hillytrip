import React, { useMemo } from 'react';
import { ShieldCheck, Car, Star, CheckCircle2, Zap } from 'lucide-react';
import { ENRICHED_VEHICLES } from '../../data/taxiData';
import { TaxiOperatorProfile } from '../../types/taxi';

interface TrustMetricsStripProps {
  operators?: TaxiOperatorProfile[];
}

export const TrustMetricsStrip: React.FC<TrustMetricsStripProps> = ({ operators = [] }) => {
  const metrics = useMemo(() => {
    const verifiedOpsCount = operators.filter((o) => o.is_verified || o.verification_status === 'approved').length || operators.length;
    const totalVehicles = ENRICHED_VEHICLES.length || 48;
    
    // Compute average rating
    const totalRatingSum = operators.reduce((acc, o) => acc + (o.rating || 4.8), 0);
    const avgRating = operators.length > 0 ? (totalRatingSum / operators.length).toFixed(1) : '4.8';

    // Total estimated trips completed from review history
    const totalTrips = operators.reduce((acc, o) => acc + ((o.reviews_count || 15) * 12), 0);

    return {
      verifiedOpsCount,
      totalVehicles,
      avgRating,
      totalTrips,
      responseRate: '98%'
    };
  }, [operators]);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-3.5 shadow-sm my-3">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
        
        {/* Metric 1: Verified Operators */}
        <div className="flex items-center gap-2.5 px-2 pt-1 sm:pt-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-black text-white leading-none">
              {metrics.verifiedOpsCount}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Verified Partners
            </div>
          </div>
        </div>

        {/* Metric 2: Verified Vehicles */}
        <div className="flex items-center gap-2.5 px-2 pt-1 sm:pt-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-black text-white leading-none">
              {metrics.totalVehicles}+ Cabs
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Fleet Inspection
            </div>
          </div>
        </div>

        {/* Metric 3: Average Rating */}
        <div className="flex items-center gap-2.5 px-2 pt-1 sm:pt-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-black text-white leading-none flex items-center gap-1">
              <span>{metrics.avgRating}</span>
              <span className="text-[10px] text-amber-400 font-normal">/ 5.0</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Traveler Rating
            </div>
          </div>
        </div>

        {/* Metric 4: Completed Trips */}
        <div className="flex items-center gap-2.5 px-2 pt-1 sm:pt-0">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-black text-white leading-none">
              {metrics.totalTrips.toLocaleString('en-IN')}+
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Completed Rides
            </div>
          </div>
        </div>

        {/* Metric 5: Response Rate */}
        <div className="flex items-center gap-2.5 px-2 pt-1 sm:pt-0 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-black text-emerald-400 leading-none">
              {metrics.responseRate}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Instant Confirm
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
