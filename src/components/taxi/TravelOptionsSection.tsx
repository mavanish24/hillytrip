import React from 'react';
import { Users, Car, MapPin, Clock, ArrowRight, ShieldCheck, Check, Sparkles, Navigation } from 'lucide-react';
import { RouteEstimate } from '../../utils/taxiRoutingEngine';

interface TravelOptionsSectionProps {
  routeEstimate: RouteEstimate;
  onOpenPickupModal: () => void;
  onScrollToOperators: () => void;
  selectedOption: 'shared' | 'reserved' | 'both';
}

export const TravelOptionsSection: React.FC<TravelOptionsSectionProps> = ({
  routeEstimate,
  onOpenPickupModal,
  onScrollToOperators,
  selectedOption
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <span>Available Transport Options</span>
          <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 rounded-full">
            Compare Modes
          </span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">Step 1: Choose Travel Mode</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Shared Taxi Card */}
        {(selectedOption === 'both' || selectedOption === 'shared') && (
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Shared Jeep / Taxi
                </span>
                <span className="text-xs font-bold text-slate-400">Fixed Union Rates</span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">₹{routeEstimate.sharedFarePerson}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ passenger seat</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pay per seat. Departs continuously as seats fill up at motor stands.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">Boarding Stand:</span>
                    <span className="text-slate-600 dark:text-slate-400">{routeEstimate.sharedPickupStand}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Frequency: <strong className="text-slate-900 dark:text-slate-100">{routeEstimate.sharedFrequency}</strong> ({routeEstimate.sharedFirstTrip} - {routeEstimate.sharedLastTrip})</span>
                </div>
              </div>
            </div>

            <div className="pt-2 relative z-10 flex items-center gap-2">
              <button
                onClick={onOpenPickupModal}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                View Pickup Location &amp; Directions
              </button>
            </div>
          </div>
        )}

        {/* 2. Reserved Private Taxi Card */}
        {(selectedOption === 'both' || selectedOption === 'reserved') && (
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-500/30 dark:border-amber-500/20 hover:border-amber-500 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Car className="w-3 h-3" /> Reserved Private Cab
                </span>
                <span className="text-xs font-bold text-slate-400">Direct Hotel Pickup</span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-extrabold text-slate-400 mr-1">Starting from</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">₹{routeEstimate.reservedStartingPrice}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ full vehicle</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Entire vehicle reserved exclusively for your family/group with customized departure times.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Car className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Available Models: <strong className="text-slate-900 dark:text-slate-100">Bolero, Ertiga, Innova, Traveller</strong></span>
                </div>

                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Includes Driver Allowance, Tolls &amp; Mountain Permits</span>
                </div>
              </div>
            </div>

            <div className="pt-2 relative z-10 flex items-center gap-2">
              <button
                onClick={onScrollToOperators}
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Browse Verified Reserved Operators</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
