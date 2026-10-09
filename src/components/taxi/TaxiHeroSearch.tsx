import React from 'react';
import { MapPin, Calendar, Users, ArrowRightLeft, Search, Car, Sparkles, ShieldCheck } from 'lucide-react';
import { TripType } from '../../types/taxi';

interface TaxiHeroSearchProps {
  fromLocation: string;
  setFromLocation: (val: string) => void;
  toLocation: string;
  setToLocation: (val: string) => void;
  travelDate: string;
  setTravelDate: (val: string) => void;
  passengers: number;
  setPassengers: (val: number) => void;
  tripType: TripType;
  setTripType: (val: TripType) => void;
  onSearch: () => void;
}

export const TaxiHeroSearch: React.FC<TaxiHeroSearchProps> = ({
  fromLocation,
  setFromLocation,
  toLocation,
  setToLocation,
  travelDate,
  setTravelDate,
  passengers,
  setPassengers,
  tripType,
  setTripType,
  onSearch
}) => {
  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  return (
    <div className="relative bg-slate-900 text-slate-100 rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-800 overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tagline & Trip Type Pill Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 rounded-full flex items-center gap-1">
              <Car className="w-3 h-3 text-amber-400" />
              Mountain Taxi Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">HillyTrip Transport Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Search &amp; Book Mountain Taxis
          </h1>
        </div>

        {/* Trip Type Selector Segment */}
        <div className="flex items-center gap-1 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl w-full sm:w-auto">
          {[
            { id: 'both', label: 'All Cabs' },
            { id: 'shared', label: 'Shared Taxi' },
            { id: 'reserved', label: 'Reserved Taxi' }
          ].map((tab) => {
            const isActive = tripType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTripType(tab.id as TripType)}
                className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-xl text-xs font-bold transition text-center cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Search Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative z-10">
        {/* From Input */}
        <div className="md:col-span-3 bg-slate-950/90 border border-slate-800 focus-within:border-amber-500 rounded-2xl p-3.5 flex items-center gap-3 transition">
          <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              From (Pickup)
            </label>
            <input
              type="text"
              placeholder="e.g. NJP Railway Station"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-extrabold text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex items-center justify-center">
          <button
            onClick={handleSwapLocations}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center justify-center transition cursor-pointer shadow-md hover:rotate-180 duration-300"
            title="Swap Pickup & Drop"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To Input */}
        <div className="md:col-span-3 bg-slate-950/90 border border-slate-800 focus-within:border-amber-500 rounded-2xl p-3.5 flex items-center gap-3 transition">
          <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              To (Destination)
            </label>
            <input
              type="text"
              placeholder="e.g. Kalimpong"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-extrabold text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Travel Date (Optional) */}
        <div className="md:col-span-2 bg-slate-950/90 border border-slate-800 focus-within:border-amber-500 rounded-2xl p-3.5 flex items-center gap-2.5 transition">
          <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Travel Date (Optional)
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-transparent text-xs font-extrabold text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Passengers */}
        <div className="md:col-span-3 bg-slate-950/90 border border-slate-800 focus-within:border-amber-500 rounded-2xl p-3.5 flex items-center gap-2.5 transition">
          <Users className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Passengers
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full bg-transparent text-xs font-extrabold text-white focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                <option key={num} value={num} className="bg-slate-900 text-white">
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary CTA - Prominent Orange Gradient Button */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-end relative z-10">
        <button
          onClick={onSearch}
          className="w-full py-4 px-8 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 hover:scale-[1.015] active:scale-[0.985] cursor-pointer flex items-center justify-center gap-3 border border-amber-400/40"
        >
          <Search className="w-5 h-5 text-slate-950" />
          <span>Search Taxis</span>
        </button>
      </div>
    </div>
  );
};
