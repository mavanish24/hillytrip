import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Users, 
  Briefcase, 
  Wind, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Share2, 
  Heart, 
  Star, 
  MapPin, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Gauge,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TaxiOperatorProfile, Vehicle } from '../../types/taxi';
import { formatTaxiStand } from '../../services/taxi/taxiDataService';

interface OperatorFleetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  operator: TaxiOperatorProfile | null;
  vehicles: Vehicle[];
  fromLocation: string;
  toLocation: string;
  onRequestBooking: (vehicle: Vehicle) => void;
}

interface EnrichedFleetVehicle extends Vehicle {
  recommendationBadge: {
    emoji: string;
    label: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
  };
  availabilityStatus: 'available' | 'limited' | 'busy';
  transmission: string;
  driverIncluded: boolean;
  permitIncluded: boolean;
  features: string[];
}

export const OperatorFleetDrawer: React.FC<OperatorFleetDrawerProps> = ({
  isOpen,
  onClose,
  operator,
  vehicles,
  fromLocation,
  toLocation,
  onRequestBooking
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !operator) return null;

  // Raw base fleet fallback
  const baseFleet: Vehicle[] = vehicles && vehicles.length > 0 ? vehicles : [
    {
      id: 'v-1',
      owner_type: operator.owner_type,
      owner_id: operator.id,
      operator_name: operator.business_name,
      model_name: 'Bolero',
      seats: 7,
      luggage_bags: 5,
      is_ac: false,
      category: 'Standard SUV',
      route_starting_price: 2800,
      image_url: '/images/hillytrip/taxi-transit.svg',
      description: 'Rugged Mahindra Bolero 4WD engineered for steep mountain gradients and unpaved hill roads.',
      is_available: true
    },
    {
      id: 'v-2',
      owner_type: operator.owner_type,
      owner_id: operator.id,
      operator_name: operator.business_name,
      model_name: 'Ertiga',
      seats: 6,
      luggage_bags: 3,
      is_ac: true,
      category: 'MUV / Comfort',
      route_starting_price: 3200,
      image_url: '/images/hillytrip/taxi-transit.svg',
      description: 'Maruti Suzuki Ertiga with quiet cabin AC and smooth suspension, ideal for family travel.',
      is_available: true
    },
    {
      id: 'v-3',
      owner_type: operator.owner_type,
      owner_id: operator.id,
      operator_name: operator.business_name,
      model_name: 'Innova',
      seats: 7,
      luggage_bags: 4,
      is_ac: true,
      category: 'Premium SUV',
      route_starting_price: 3800,
      image_url: '/images/hillytrip/taxi-transit.svg',
      description: 'Toyota Innova Crysta with plush captain seats, superior climate control, and supreme legroom.',
      is_available: true
    },
    {
      id: 'v-4',
      owner_type: operator.owner_type,
      owner_id: operator.id,
      operator_name: operator.business_name,
      model_name: 'Traveller',
      seats: 12,
      luggage_bags: 10,
      is_ac: true,
      category: 'Minibus / Van',
      route_starting_price: 5500,
      image_url: '/images/hillytrip/taxi-transit.svg',
      description: 'Force Traveller 12-seater with overhead luggage rack, perfect for large group tours.',
      is_available: true
    }
  ];

  // Enrich vehicles with badges, status, transmission, driver, permits
  const enrichedFleet: EnrichedFleetVehicle[] = baseFleet.map((v, index) => {
    let recBadge = {
      emoji: '⭐',
      label: 'Best for Hills',
      bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
      textClass: 'text-amber-700 dark:text-amber-300',
      borderClass: 'border-amber-500/30'
    };
    let availStatus: 'available' | 'limited' | 'busy' = 'available';
    let transmission = 'Manual 5-Speed';
    let features = ['Clean Interior', 'GPS Tracked', 'Hill-Trained Driver'];

    if (v.model_name === 'Bolero' || v.category === 'Standard SUV') {
      recBadge = {
        emoji: '🏔️',
        label: 'Best for Mountain Roads',
        bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        textClass: 'text-emerald-700 dark:text-emerald-300',
        borderClass: 'border-emerald-500/30'
      };
      availStatus = 'available';
      transmission = 'Manual 4WD';
      features = ['High Clearance 4WD', 'Roof Luggage Rack', 'Sikkim Pass Approved'];
    } else if (v.model_name === 'Ertiga' || v.category === 'MUV / Comfort') {
      recBadge = {
        emoji: '👨‍👩‍👧',
        label: 'Best for Families',
        bgClass: 'bg-sky-500/10 dark:bg-sky-500/20',
        textClass: 'text-sky-700 dark:text-sky-300',
        borderClass: 'border-sky-500/30'
      };
      availStatus = 'available';
      transmission = 'Smooth Manual';
      features = ['Dual Zone AC', 'Child Seat Friendly', 'Spacious Boot Space'];
    } else if (v.model_name === 'Innova' || v.category === 'Premium SUV') {
      recBadge = {
        emoji: '💎',
        label: 'Premium Comfort',
        bgClass: 'bg-violet-500/10 dark:bg-violet-500/20',
        textClass: 'text-violet-700 dark:text-violet-300',
        borderClass: 'border-violet-500/30'
      };
      availStatus = index === 2 ? 'limited' : 'available';
      transmission = 'Automatic / 6-Speed';
      features = ['Captain Recliner Seats', 'Rear AC Vents', 'Noise Insulated Cabin'];
    } else if (v.model_name === 'Traveller' || v.category === 'Minibus / Van') {
      recBadge = {
        emoji: '👥',
        label: 'Best for Groups',
        bgClass: 'bg-amber-500/10 dark:bg-amber-500/20',
        textClass: 'text-amber-700 dark:text-amber-300',
        borderClass: 'border-amber-500/30'
      };
      availStatus = 'available';
      transmission = 'Heavy Duty Manual';
      features = ['High-Roof Walkthrough', 'Extra Overhead Storage', 'Dual AC System'];
    } else if (v.model_name === 'Alto / Hatchback' || v.category === 'Hatchback') {
      recBadge = {
        emoji: '🎒',
        label: 'Budget Choice',
        bgClass: 'bg-teal-500/10 dark:bg-teal-500/20',
        textClass: 'text-teal-700 dark:text-teal-300',
        borderClass: 'border-teal-500/30'
      };
      availStatus = 'available';
      transmission = 'Compact Manual';
      features = ['Economical Solo Ride', 'Agile Mountain Maneuver'];
    }

    return {
      ...v,
      recommendationBadge: recBadge,
      availabilityStatus: availStatus,
      transmission,
      driverIncluded: true,
      permitIncluded: true,
      features
    };
  });

  const handleToggleCompare = (vehicleId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      }
      if (prev.length >= 2) {
        // Swap out the first one if already 2
        return [prev[1], vehicleId];
      }
      return [...prev, vehicleId];
    });
  };

  const toggleFavorite = (vehicleId: string) => {
    setFavorites((prev) => ({ ...prev, [vehicleId]: !prev[vehicleId] }));
  };

  const handleShare = async (vehicle: Vehicle) => {
    const shareData = {
      title: `${vehicle.model_name} by ${operator.business_name}`,
      text: `Book ${vehicle.model_name} for ${fromLocation} to ${toLocation} starting at ₹${vehicle.route_starting_price} with ${operator.business_name}.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // ignore share cancel
      }
    } else {
      navigator.clipboard.writeText(shareData.text);
      setCopiedId(vehicle.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const comparedVehicles = enrichedFleet.filter((v) => selectedForCompare.includes(v.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* ========================================================= */}
        {/* HEADER: Apple-quality Operator Summary (No repetitive info inside cards) */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white border-b border-slate-800 shrink-0 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              {/* Operator Logo / Avatar */}
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 border border-amber-300/40">
                {operator.logo_url ? (
                  <img src={operator.logo_url} alt={operator.business_name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  operator.business_name.charAt(0)
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {operator.business_name}
                  </h3>

                  {/* Verified Badge */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Operator
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                  {/* Rating */}
                  <div className="flex items-center gap-1 font-bold text-amber-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{operator.rating ? operator.rating.toFixed(1) : '4.9'}</span>
                    <span className="text-slate-400 text-[10px]">({operator.reviews_count || 48})</span>
                  </div>

                  {/* Base Location */}
                  {(() => {
                    const stand = formatTaxiStand(operator.base_taxi_stand);
                    if (!stand) return null;
                    return (
                      <div className="flex items-center gap-1 text-slate-300 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{stand}</span>
                      </div>
                    );
                  })()}

                  {/* Vehicles Count badge - "X Vehicles Available" */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-md">
                    <Car className="w-3.5 h-3.5" />
                    {enrichedFleet.length} Vehicles Available
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 border border-slate-700 shadow-sm"
              aria-label="Close vehicle selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Route context strip */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-slate-400">Route Fare Estimate for:</span>
              <span className="text-amber-300 font-extrabold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {fromLocation} → {toLocation}
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tolls & Hill Permits Included
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VEHICLES SCROLL AREA */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 pb-28">

          {/* Quick Guidance Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Select Vehicle for Your Trip
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pick the best ride for your passengers and luggage. Compare up to 2 models.
              </p>
            </div>

            {selectedForCompare.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition hover:bg-amber-500/20 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare ({selectedForCompare.length})</span>
              </button>
            )}
          </div>

          {/* VEHICLE CARDS LIST */}
          <div className="space-y-5">
            {enrichedFleet.map((vehicle) => {
              const isComparing = selectedForCompare.includes(vehicle.id);
              const isFav = !!favorites[vehicle.id];

              return (
                <div
                  key={vehicle.id}
                  className={`bg-white dark:bg-slate-800/90 rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                    isComparing
                      ? 'border-amber-500 ring-2 ring-amber-500/20 dark:ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Top Section: Image & Main Info */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      
                      {/* 1. Large Vehicle Image */}
                      <div className="w-full sm:w-44 h-32 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative shrink-0 group">
                        <img
                          src={vehicle.image_url}
                          alt={vehicle.model_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Category Badge */}
                        <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700/50">
                          {vehicle.category}
                        </span>

                        {/* Favorite Button (Secondary Action Icon) */}
                        <button
                          onClick={() => toggleFavorite(vehicle.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center transition hover:scale-110 cursor-pointer"
                          title="Save Favorite"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-200'}`} />
                        </button>
                      </div>

                      {/* 2. Vehicle Details & Price */}
                      <div className="flex-1 space-y-2 w-full">
                        
                        {/* Title & Fare Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                              {vehicle.model_name}
                            </h4>

                            {/* Recommendation Badge */}
                            <div className="mt-1">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${vehicle.recommendationBadge.bgClass} ${vehicle.recommendationBadge.textClass} ${vehicle.recommendationBadge.borderClass}`}>
                                <span>{vehicle.recommendationBadge.emoji}</span>
                                <span>{vehicle.recommendationBadge.label}</span>
                              </span>
                            </div>
                          </div>

                          {/* Estimated Route Fare */}
                          <div className="text-right shrink-0 bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Estimated Fare</span>
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                              ₹{vehicle.route_starting_price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Vehicle Description (Max 2 lines) */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {vehicle.description}
                        </p>

                        {/* Specifications Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-xs">
                          {/* Seats */}
                          <div className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                            <span>{vehicle.seats} Seats</span>
                          </div>

                          {/* Luggage */}
                          <div className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                            <span>{vehicle.luggage_bags} Bags</span>
                          </div>

                          {/* AC / Non AC */}
                          <div className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${
                            vehicle.is_ac 
                              ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/40' 
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40'
                          }`}>
                            <Wind className="w-3.5 h-3.5" />
                            <span>{vehicle.is_ac ? 'Dual AC' : 'Non-AC Hill'}</span>
                          </div>

                          {/* Transmission */}
                          <div className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5 text-slate-400" />
                            <span>{vehicle.transmission}</span>
                          </div>

                          {/* Driver Included */}
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 border border-emerald-200/40 dark:border-emerald-800/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Driver Included</span>
                          </div>

                          {/* Permit Included */}
                          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 border border-emerald-200/40 dark:border-emerald-800/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Permits Included</span>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bottom Row: Availability Status, Compare Checkbox & CTAs */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      
                      {/* Availability & Compare check */}
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        {/* Availability status */}
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          {vehicle.availabilityStatus === 'available' && (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Available Today
                            </span>
                          )}
                          {vehicle.availabilityStatus === 'limited' && (
                            <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Limited Slots Left
                            </span>
                          )}
                          {vehicle.availabilityStatus === 'busy' && (
                            <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Currently Busy
                            </span>
                          )}
                        </div>

                        {/* Compare Checkbox */}
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none hover:text-amber-600 dark:hover:text-amber-400 transition">
                          <input
                            type="checkbox"
                            checked={isComparing}
                            onChange={() => handleToggleCompare(vehicle.id)}
                            className="w-4 h-4 text-amber-500 rounded border-slate-300 dark:border-slate-700 focus:ring-amber-500 dark:bg-slate-900 cursor-pointer"
                          />
                          <span>Compare</span>
                        </label>
                      </div>

                      {/* Primary CTA + Secondary Action Icons */}
                      <div className="flex items-center gap-2">
                        {/* Share Icon */}
                        <button
                          onClick={() => handleShare(vehicle)}
                          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0 relative"
                          title="Share Vehicle"
                        >
                          <Share2 className="w-4 h-4" />
                          {copiedId === vehicle.id && (
                            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                              Link Copied!
                            </span>
                          )}
                        </button>

                        {/* Main CTA: Request Taxi / Book Now */}
                        <button
                          onClick={() => onRequestBooking(vehicle)}
                          className="flex-1 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Book Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* STICKY FOOTER BAR (Always visible when scrolling) */}
        {/* ========================================================= */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white flex items-center justify-between gap-3 shadow-2xl z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 hidden sm:inline">
              Selected: <strong className="text-amber-400 font-extrabold">{vehicles.length} Vehicles Available</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedForCompare.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-black rounded-xl border border-amber-500/40 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare Vehicles ({selectedForCompare.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                if (enrichedFleet.length > 0) {
                  onRequestBooking(enrichedFleet[0]);
                }
              }}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Contact Operator</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SIDE-BY-SIDE VEHICLE COMPARISON MODAL */}
        {/* ========================================================= */}
        <AnimatePresence>
          {isCompareModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Comparison Header */}
                <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-black text-white tracking-tight">Vehicle Comparison</h3>
                    <span className="text-xs text-slate-400">({comparedVehicles.length} Vehicles)</span>
                  </div>

                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Comparison Matrix Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  {comparedVehicles.length === 0 ? (
                    <div className="text-center py-12 space-y-3">
                      <Scale className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Select checkboxes on up to 2 vehicles to compare them side-by-side.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {comparedVehicles.map((veh) => (
                        <div key={veh.id} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                          <div className="flex items-center gap-3">
                            <img src={veh.image_url} alt={veh.model_name} className="w-20 h-16 object-cover rounded-xl" />
                            <div>
                              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">{veh.model_name}</h4>
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">{veh.recommendationBadge.emoji} {veh.recommendationBadge.label}</span>
                            </div>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400">Est. Route Fare:</span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{veh.route_starting_price.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400">Seating Capacity:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{veh.seats} Passengers</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400">Luggage Capacity:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{veh.luggage_bags} Suitcases</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400">Climate Control:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{veh.is_ac ? 'Dual AC' : 'Non-AC Mountain'}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400">Transmission & Power:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{veh.transmission}</span>
                            </div>

                            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                              <span className="text-slate-500 dark:text-slate-400">Permits & Tolls:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ All Included</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setIsCompareModalOpen(false);
                              onRequestBooking(veh);
                            }}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                          >
                            <span>Request Booking for {veh.model_name}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Comparison
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Simple Chevron Right Icon helper
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
  </svg>
);
