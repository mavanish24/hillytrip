import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldCheck, MapPin, Phone, MessageSquare, Star, 
  Car, Award, Building, CheckCircle2, ChevronRight, X, AlertTriangle, 
  Clock, Share2, Heart, Sparkles, Check, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TaxiOperatorProfile, Vehicle, OperatorReview } from '../../types/taxi';
import { formatTaxiStand, fetchTaxiOperators } from '../../services/taxi/taxiDataService';
import { ENRICHED_VEHICLES, SEED_REVIEWS, SEED_TAXI_OPERATORS } from '../../data/taxiData';
import { getClaimStatus, isListingVerified, subscribeClaimSystem } from '../../lib/claimSystem';
import ClaimModal from '../ClaimModal';
import { BookingLeadModal } from './BookingLeadModal';
import { OperatorFleetDrawer } from './OperatorFleetDrawer';

interface TaxiOperatorProfilePageProps {
  operatorId?: string;
  operatorProp?: TaxiOperatorProfile | null;
  onBack?: () => void;
  navigate?: (path: string) => void;
  user?: any;
  hubs?: any[];
}

export const TaxiOperatorProfilePage: React.FC<TaxiOperatorProfilePageProps> = ({
  operatorId,
  operatorProp,
  onBack,
  navigate,
  user,
  hubs = []
}) => {
  const [operator, setOperator] = useState<TaxiOperatorProfile | null>(operatorProp || null);
  const [loading, setLoading] = useState<boolean>(!operatorProp);
  const [error, setError] = useState<string | null>(null);

  // Claim System state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState<boolean>(false);
  const [claimStatus, setClaimStatus] = useState<'UNCLAIMED' | 'CLAIMED' | 'SUSPENDED'>('UNCLAIMED');

  // Booking & Fleet Drawer state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [isFleetDrawerOpen, setIsFleetDrawerOpen] = useState<boolean>(false);
  const [selectedVehicleForLead, setSelectedVehicleForLead] = useState<Vehicle | null>(null);

  // Lightbox
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load operator details if given an operatorId
  useEffect(() => {
    let isMounted = true;
    if (operatorProp) {
      setOperator(operatorProp);
      setLoading(false);
      return;
    }

    if (!operatorId) {
      setError('No operator ID specified');
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const allOps = await fetchTaxiOperators();
        const found = allOps.find((op) => op.id === operatorId || op.user_id === operatorId);
        
        if (found) {
          if (isMounted) {
            setOperator(found);
            setLoading(false);
          }
          return;
        }

        // Fallback search in seed data
        const seedFound = SEED_TAXI_OPERATORS.find((op) => op.id === operatorId || op.user_id === operatorId);
        if (seedFound && isMounted) {
          setOperator(seedFound);
          setLoading(false);
          return;
        }

        if (isMounted) {
          setError('Taxi Operator profile not found');
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load operator details');
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [operatorId, operatorProp]);

  // Update claim status whenever operator or claim registry changes
  useEffect(() => {
    if (!operator) return;

    const updateStatus = () => {
      const status = getClaimStatus({
        id: operator.id,
        owner_user_id: operator.user_id || (operator as any).owner_user_id,
        claim_status: (operator as any).claim_status
      });
      setClaimStatus(status);
    };

    updateStatus();
    const unsubscribe = subscribeClaimSystem(updateStatus);
    return () => unsubscribe();
  }, [operator]);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else if (navigate) {
      navigate('#/taxi');
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#/taxi';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
          Loading Taxi Operator Profile...
        </p>
      </div>
    );
  }

  if (error || !operator) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Operator Profile Not Found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          {error || 'The requested taxi operator profile could not be located.'}
        </p>
        <button
          onClick={handleGoBack}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
        >
          Return to Taxi Marketplace
        </button>
      </div>
    );
  }

  // Resolve Base Taxi Stand:
  // RULE: If resolved name is null/empty or internal ID, hide stand row completely!
  const resolvedBaseStand = formatTaxiStand(operator.base_taxi_stand, hubs);

  // Vehicles matching this operator ID
  const fleetVehicles = ENRICHED_VEHICLES.filter(
    (v) => v.owner_id === operator.id || v.operator_name.toLowerCase() === operator.business_name.toLowerCase()
  );

  // Reviews matching this operator
  const reviews: OperatorReview[] = SEED_REVIEWS[operator.id] || [
    {
      id: 'rev-default-1',
      operator_id: operator.id,
      user_name: 'Pema Bhutia',
      rating: 5,
      date: 'Recent Trip',
      comment: `Extremely comfortable journey with ${operator.business_name}. Professional driver, clean vehicle, and highly punctual pickup.`,
      trip_route: `${operator.pickup_areas?.[0] || 'NJP'} → ${operator.drop_areas?.[0] || 'Hills'}`
    }
  ];

  const isVerified = isListingVerified({
    id: operator.id,
    owner_user_id: operator.user_id || (operator as any).owner_user_id,
    claim_status: (operator as any).claim_status,
    verified: operator.is_verified
  });

  const totalFleetCount = (operator.fleet || []).reduce((acc, f) => acc + (f.vehicle_count || 1), 0) || fleetVehicles.length || 5;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <div className="flex items-center gap-2">
          {claimStatus === 'UNCLAIMED' && (
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Claim Business</span>
            </button>
          )}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: operator.business_name,
                  text: `Check out ${operator.business_name} on HillyTrip`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                setToastMessage('Link copied to clipboard!');
                setTimeout(() => setToastMessage(null), 2000);
              }
            }}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          PROMINENT CLAIM BUSINESS SECTION (ONLY IF UNCLAIMED)
          ======================================================== */}
      {claimStatus === 'UNCLAIMED' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 text-slate-950 shadow-xl border border-amber-300/50 relative overflow-hidden space-y-4"
        >
          <div className="absolute top-0 right-0 translate-x-6 -translate-y-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-400 font-black text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Verified Business Listing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                Own this Taxi Business?
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-900/90 leading-relaxed">
                This business is already listed on HillyTrip. Claim your business to manage your fleet, routes, pricing and receive direct booking enquiries.
              </p>
            </div>

            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 border border-amber-500/30"
            >
              <span>Claim Your Business</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </motion.div>
      )}

      {/* OPERATOR HEADER PROFILE CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-6">
        
        {/* Cover / Main Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={operator.logo_url || '/images/hillytrip/taxi-transit.svg'}
              alt={operator.business_name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-500/80 shadow-md shrink-0 bg-slate-100"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {operator.business_name}
                </h1>
                {isVerified ? (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Verified Operator
                  </span>
                ) : (
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Unclaimed Listing
                  </span>
                )}
              </div>

              {/* Owner display */}
              {operator.owner_name && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Owner / Representative: <strong className="text-slate-800 dark:text-slate-200">{operator.owner_name}</strong>
                </p>
              )}

              {/* Base Taxi Stand: ONLY shown if resolved to clean human name */}
              {resolvedBaseStand && (
                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Base Stand: <strong className="text-slate-900 dark:text-white">{resolvedBaseStand}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Rating Badge */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl text-center shrink-0 self-stretch sm:self-auto flex flex-col justify-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-black text-xl">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>{operator.rating || 5.0}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mt-0.5">
              ({operator.reviews_count || reviews.length} Traveler Reviews)
            </span>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Size</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
              {totalFleetCount} Vehicles
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Type</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5 block capitalize">
              {(operator.owner_type || 'operator').replace('_', ' ')}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking Type</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5 block capitalize">
              {operator.booking_preference === 'both' ? 'Instant & Direct' : operator.booking_preference}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispatch Status</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live &amp; Online</span>
            </span>
          </div>
        </div>

        {/* Primary Booking Call To Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setIsLeadModalOpen(true)}
            className="w-full sm:flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-sm rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Car className="w-4 h-4" />
            <span>Send Direct Booking Enquiry</span>
          </button>

          <button
            onClick={() => setIsFleetDrawerOpen(true)}
            className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Explore Vehicle Fleet</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CORE DETAILS GRID: LEFT (Fleet & Routes) vs RIGHT (Contact & Service Areas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Fleet Summary, Vehicle Categories & Available Routes */}
        <div className="lg:col-span-2 space-y-6">

          {/* FLEET SUMMARY & VEHICLE CATEGORIES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-500" />
                <span>Fleet Summary &amp; Vehicle Categories</span>
              </h3>
              <span className="text-xs font-extrabold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                {totalFleetCount} Vehicles Total
              </span>
            </div>

            {/* Vehicle Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(operator.fleet || []).map((category, idx) => {
                const specVehicle = fleetVehicles.find(v => v.model_name.toLowerCase() === category.category_name.toLowerCase());
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-2 hover:border-amber-500/50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        {category.category_name}
                      </h4>
                      <span className="text-xs font-black bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300">
                        {category.vehicle_count} Units
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {specVehicle?.description || `Pristine ${category.category_name} vehicle equipped for high-altitude mountain travel.`}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300 pt-1">
                      <span>💺 {specVehicle?.seats || 7} Seats</span>
                      <span>🧳 {specVehicle?.luggage_bags || 4} Luggage</span>
                      <span>❄️ {specVehicle?.is_ac ? 'Dual AC' : 'Non-AC / Hill Mode'}</span>
                    </div>
                  </div>
                );
              })}

              {(operator.fleet || []).length === 0 && (
                <div className="col-span-full text-center py-6 text-slate-400 text-xs">
                  Standard mountain fleet options including Mahindra Bolero, Maruti Ertiga, Toyota Innova, and Force Traveller.
                </div>
              )}
            </div>
          </div>

          {/* AVAILABLE ROUTES & FARES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <span>Available Fixed Routes &amp; Fares</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {(operator.fixedRoutes || []).length} Direct Routes
              </span>
            </div>

            <div className="space-y-3">
              {(operator.fixedRoutes || []).map((route, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      <span>{route.from_location}</span>
                      <span className="text-amber-500">→</span>
                      <span>{route.to_location}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Private &amp; Shared cab dispatch available daily
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {route.shared_taxi_available && route.shared_fare > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Shared Seat</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          ₹{route.shared_fare.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="text-right bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Reserved Fare</span>
                      <span className="text-base font-black text-slate-900 dark:text-slate-100">
                        ₹{route.private_starting_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {(operator.fixedRoutes || []).length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Servicing custom route requests across NJP, Siliguri, Bagdogra, Kalimpong, Darjeeling, and Gangtok.
                </div>
              )}
            </div>
          </div>

          {/* GALLERY SECTION (IF AVAILABLE) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Fleet &amp; Office Gallery
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {fleetVehicles.map((veh, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhoto(veh.image_url)}
                  className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  <img
                    src={veh.image_url}
                    alt={veh.model_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex items-end">
                    <span className="text-white font-bold text-[10px]">{veh.model_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact Info, Working Areas & Booking Guidelines */}
        <div className="space-y-6">

          {/* HILLYTRIP SECURE MESSAGING */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span>Host &amp; Operator Messaging</span>
            </h3>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans text-xs">
                To protect your trip payments and prevent fraudulent quotes, all communication, custom route quotes, and luggage coordination with <strong>{operator.business_name}</strong> are conducted exclusively through HillyTrip&apos;s verified in-app messaging.
              </p>

              <button
                type="button"
                onClick={() => {
                  const targetUrl = `#/enquire?listingType=taxi_operator&listingId=${operator.id}`;
                  if (navigate) navigate(targetUrl);
                  else window.location.hash = targetUrl;
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message on HillyTrip</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLeadModalOpen(true)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Car className="w-3.5 h-3.5 text-amber-500" />
                <span>Send Direct Booking Enquiry</span>
              </button>

              {resolvedBaseStand && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-500 block">Base Taxi Stand</span>
                  <span className="font-black text-slate-900 dark:text-slate-100 block">
                    {resolvedBaseStand}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* WORKING DISTRICTS & SERVICE AREAS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Operating Districts &amp; Coverage
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Districts Covered
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(operator.working_areas || []).map((dist, i) => (
                    <span
                      key={i}
                      className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-lg font-bold text-[11px]"
                    >
                      {dist}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Popular Pickup Points
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(operator.pickup_areas || []).map((p, i) => (
                    <span
                      key={i}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium text-[10px]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HILLYTRIP BOOKING PROTECTION NOTICE */}
          <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>HillyTrip Booking Guarantee</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bookings submitted through HillyTrip open a direct, transparent messaging thread with verified union operators. Enjoy verified market pricing, mountain driver tracking, and zero hidden platform commissions.
            </p>
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Book via HillyTrip</span>
            </button>
          </div>

        </div>
      </div>

      {/* RATINGS & REVIEWS SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>Traveler Ratings &amp; Reviews</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified feedback from travelers who booked transits with {operator.business_name}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-2xl text-center">
            <span className="font-black text-amber-800 dark:text-amber-400 text-lg block">
              {operator.rating || 5.0} ★
            </span>
          </div>
        </div>

        {/* Review list */}
        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          {reviews.map((rev, idx) => (
            <div key={rev.id || idx} className={`${idx > 0 ? 'pt-4' : ''} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-black text-xs flex items-center justify-center">
                    {rev.user_name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                      {rev.user_name}
                    </h5>
                    {rev.trip_route && (
                      <span className="text-[10px] font-mono text-slate-400">Route: {rev.trip_route}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{rev.rating}.0</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium pl-10">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX PHOTO MODAL */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900 text-white rounded-full cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhoto}
              alt="Enlarged"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLAIM BUSINESS MODAL */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        listing={{
          id: operator.id,
          name: operator.business_name,
          type: 'Taxi Operator',
          location: resolvedBaseStand || 'Eastern Himalayas',
          image: operator.logo_url
        }}
        currentUser={user}
        claimSource="Listing Page"
        onSuccessNavigate={() => {
          setToastMessage('Business successfully claimed! Your HillyTrip Verified profile is now active.');
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* BOOKING LEAD MODAL */}
      <BookingLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        operator={operator}
        selectedVehicle={selectedVehicleForLead}
        fromLocation={operator.pickup_areas?.[0] || 'NJP Railway Station'}
        toLocation={operator.drop_areas?.[0] || 'Kalimpong'}
        travelDate={new Date().toISOString().split('T')[0]}
        passengers={2}
        tripType="reserved_one_way"
        onBookingSubmitted={(req) => {
          setToastMessage(`Booking inquiry sent to ${operator.business_name}!`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* FLEET DRAWER */}
      <OperatorFleetDrawer
        isOpen={isFleetDrawerOpen}
        onClose={() => setIsFleetDrawerOpen(false)}
        operator={operator}
        vehicles={fleetVehicles}
        fromLocation={operator.pickup_areas?.[0] || 'NJP'}
        toLocation={operator.drop_areas?.[0] || 'Hills'}
        onRequestBooking={(v) => {
          setSelectedVehicleForLead(v);
          setIsFleetDrawerOpen(false);
          setIsLeadModalOpen(true);
        }}
      />
    </div>
  );
};

export default TaxiOperatorProfilePage;
