import React from 'react';
import { X, MapPin, Clock, Calendar, Ticket, Compass, Navigation, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { TAXI_STANDS } from '../../data/taxiData';

interface PickupLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  standName: string;
  fromLocation: string;
  toLocation: string;
}

export const PickupLocationModal: React.FC<PickupLocationModalProps> = ({
  isOpen,
  onClose,
  standName,
  fromLocation,
  toLocation
}) => {
  if (!isOpen) return null;

  const standInfo = TAXI_STANDS.find(s => s.name.toLowerCase().includes(standName.toLowerCase()) || standName.toLowerCase().includes(s.name.toLowerCase())) || {
    name: standName || 'NJP Main Shared Taxi Terminal',
    district: 'Main Hub',
    info: 'Official Himalayan shared motor stand. Direct counters for shared jeeps and private cabs.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
              Shared Taxi Motor Stand
            </span>
            <h3 className="text-xl font-black text-white">{standInfo.name}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Route Terminal for <span className="font-bold text-amber-300">{fromLocation} → {toLocation}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-sm">
          {/* Info Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">Location &amp; Access</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{standInfo.info}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">First Departure</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">06:00 AM</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Departure</span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">04:30 PM</span>
              </div>
            </div>
          </div>

          {/* Boarding Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Shared Taxi Boarding Steps</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/40 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">1</div>
                <span>Head directly to Counter #2 marked <strong className="text-slate-900 dark:text-slate-100">{toLocation} Shared Line</strong>.</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/40 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">2</div>
                <span>Collect your official printed ticket receipt before boarding the jeep.</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/40 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">3</div>
                <span>Vehicles depart every 20-30 minutes as soon as 10 passenger seats fill up.</span>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Government and Union Fare Standard Verified by HillyTrip Transport Cell.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Need private custom pickup instead?</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Got It
          </button>
        </div>
      </motion.div>
    </div>
  );
};
