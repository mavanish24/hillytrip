import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { TaxiHeroSearch } from './TaxiHeroSearch';
import { TaxiDiscoveryBar } from './TaxiDiscoveryBar';
import { TrustMetricsStrip } from './TrustMetricsStrip';
import { TaxiOffersSection } from './TaxiOffersSection';
import { TripCompactSummary } from './TripCompactSummary';
import { TravelOptionsSection } from './TravelOptionsSection';
import { MarketReferenceFareCard } from './MarketReferenceFareCard';
import { OperatorList } from './OperatorList';
import safeLazy from '../../utils/safeLazy';
const PickupLocationModal = safeLazy(() => import('./PickupLocationModal').then((m: any) => ({ default: m.PickupLocationModal || m.default })));
const BookingLeadModal = safeLazy(() => import('./BookingLeadModal').then((m: any) => ({ default: m.BookingLeadModal || m.default })));
const OperatorFleetDrawer = safeLazy(() => import('./OperatorFleetDrawer').then((m: any) => ({ default: m.OperatorFleetDrawer || m.default })));
const TaxiArchitectureModal = safeLazy(() => import('./TaxiArchitectureModal').then((m: any) => ({ default: m.TaxiArchitectureModal || m.default })));
const TaxiBookingChatModal = safeLazy(() => import('./TaxiBookingChatModal').then((m: any) => ({ default: m.TaxiBookingChatModal || m.default })));
import { ENRICHED_VEHICLES } from '../../data/taxiData';
import { useTaxiOperators } from '../../services/taxi/taxiDataService';
import { getRouteEstimate, fetchDynamicRouteEstimate, isOperatorRouteMatch, RouteEstimate } from '../../utils/taxiRoutingEngine';
import { TaxiOperatorProfile, Vehicle, TripType } from '../../types/taxi';
import { TaxiBookingRequest, getLocalTaxiBookings } from '../../types/taxiBooking';
import { Car, Mountain, CheckCircle2, Loader2, AlertTriangle, RefreshCw, SearchX } from 'lucide-react';

interface TaxiMarketplaceViewProps {
  user?: any;
  navigate?: (path: string) => void;
  onOpenLoginModal?: () => void;
  hubs?: any[];
}

export const TaxiMarketplaceView: React.FC<TaxiMarketplaceViewProps> = ({
  user,
  navigate,
  onOpenLoginModal,
  hubs = []
}) => {
  const [fromLocation, setFromLocation] = useState('NJP Railway Station');
  const [toLocation, setToLocation] = useState('Kalimpong');
  const [travelDate, setTravelDate] = useState('');
  const [passengers, setPassengers] = useState(2);
  const [tripType, setTripType] = useState<TripType>('both');

  // Track if search has been executed to show Offers section
  const [isSearchExecuted, setIsSearchExecuted] = useState(false);

  // Modals & Drawers state
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedOperatorForFleet, setSelectedOperatorForFleet] = useState<TaxiOperatorProfile | null>(null);
  const [selectedOperatorForLead, setSelectedOperatorForLead] = useState<TaxiOperatorProfile | null>(null);
  const [selectedVehicleForLead, setSelectedVehicleForLead] = useState<Vehicle | null>(null);

  // Unified Partner Onboarding Redirection
  const handleBecomePartner = () => {
    // 1. Preselect Business Category = Taxi Operator
    localStorage.setItem('hillytrip_selected_business_type', 'taxi_operator');

    // Get active user
    let activeUser = user;
    if (!activeUser && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('hillytrip_user') || localStorage.getItem('user');
        if (stored) activeUser = JSON.parse(stored);
      } catch {}
    }

    if (!activeUser) {
      // Unauthenticated: save post-auth redirect intent and trigger auth flow
      localStorage.setItem('hillytrip_post_auth_redirect', '#/become-taxi-operator');
      if (onOpenLoginModal) {
        onOpenLoginModal();
      } else if (navigate) {
        navigate('#/become-taxi-operator');
      } else {
        window.location.hash = '#/become-taxi-operator';
      }
      return;
    }

    // Authenticated user: Check if already a verified business owner
    const isVerifiedOwner = 
      activeUser.taxiOperatorStatus === 'verified' ||
      activeUser.role === 'operator' ||
      activeUser.is_verified_operator ||
      activeUser.isBusinessOwner;

    if (isVerifiedOwner) {
      // Redirect to Business Dashboard
      if (navigate) {
        navigate('#/taxi/dashboard');
      } else {
        window.location.hash = '#/taxi/dashboard';
      }
    } else {
      // Continue onboarding from last saved step with Taxi Operator category preselected
      if (navigate) {
        navigate('#/become-taxi-operator');
      } else {
        window.location.hash = '#/become-taxi-operator';
      }
    }
  };

  // Active Chat Modal State
  const [activeBookingChat, setActiveBookingChat] = useState<TaxiBookingRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local bookings
  const [myBookings, setMyBookings] = useState<TaxiBookingRequest[]>([]);

  const refreshBookings = () => {
    setMyBookings(getLocalTaxiBookings());
  };

  useEffect(() => {
    refreshBookings();
  }, [activeBookingChat, selectedOperatorForLead]);

  // Fetch live taxi operators from Supabase
  const { operators, loading, error, refetch } = useTaxiOperators();

  // Dynamic Route Estimate Calculation fetched on-the-fly via Google Maps Routes API
  const [routeEstimate, setRouteEstimate] = useState<RouteEstimate>(() => getRouteEstimate(fromLocation, toLocation));

  useEffect(() => {
    let isMounted = true;
    fetchDynamicRouteEstimate(fromLocation, toLocation).then((est) => {
      if (isMounted) {
        setRouteEstimate(est);
      }
    });
    return () => { isMounted = false; };
  }, [fromLocation, toLocation]);

  // Dynamic Operator Filtering
  const matchingOperators = useMemo(() => {
    return operators.filter((op) => isOperatorRouteMatch(op, fromLocation, toLocation));
  }, [operators, fromLocation, toLocation]);

  // Vehicles for selected fleet operator
  const fleetVehicles = useMemo(() => {
    if (!selectedOperatorForFleet) return [];
    return ENRICHED_VEHICLES.filter((v) => v.owner_id === selectedOperatorForFleet.id);
  }, [selectedOperatorForFleet]);

  const handleSearch = () => {
    setIsSearchExecuted(true);
    const el = document.getElementById('trip-summary-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectRouteFromDiscovery = (from: string, to: string) => {
    setFromLocation(from);
    setToLocation(to);
    setIsSearchExecuted(true);
    setTimeout(() => {
      const el = document.getElementById('trip-summary-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleScrollToOperators = () => {
    const el = document.getElementById('operators-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestBookingFromFleet = (vehicle: Vehicle) => {
    setSelectedVehicleForLead(vehicle);
    if (selectedOperatorForFleet) {
      setSelectedOperatorForLead(selectedOperatorForFleet);
    }
    setSelectedOperatorForFleet(null);
  };

  const handleBookingSubmitted = (newBooking: TaxiBookingRequest) => {
    refreshBookings();
    setToastMessage(`Booking Request sent to ${newBooking.operatorName}! Opening conversation thread...`);
    setTimeout(() => {
      setToastMessage(null);
      setActiveBookingChat(newBooking);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 pt-1">
        {/* Left Side: Primary Action Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                🚖 Search &amp; Book Taxi
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] uppercase">
                Verified Fleet
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Mountain routes, verified local drivers, zero-commission direct bookings
            </p>
          </div>
        </div>

        {/* Right Side: Become a Taxi Partner CTA Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBecomePartner}
            className="px-4 py-2.5 rounded-2xl border-2 border-amber-500/80 hover:border-amber-400 bg-slate-900/90 dark:bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
            title="Supported Partners: Taxi Operators, Homestay Owners, Travel Agencies"
          >
            <Mountain className="w-4 h-4 text-amber-400" />
            <span>🚕 Become a Taxi Partner</span>
          </button>
        </div>
      </div>

      {/* HERO SEARCH */}
      <TaxiHeroSearch
        fromLocation={fromLocation}
        setFromLocation={setFromLocation}
        toLocation={toLocation}
        setToLocation={setToLocation}
        travelDate={travelDate}
        setTravelDate={setTravelDate}
        passengers={passengers}
        setPassengers={setPassengers}
        tripType={tripType}
        setTripType={setTripType}
        onSearch={handleSearch}
      />

      {/* COMPACT TRUST METRICS STRIP */}
      <TrustMetricsStrip operators={operators} />

      {/* COMPACT DISCOVERY TAB NAVIGATION BAR */}
      <TaxiDiscoveryBar
        onSelectRoute={handleSelectRouteFromDiscovery}
        currentFrom={fromLocation}
        currentTo={toLocation}
        operators={operators}
      />

      {/* OFFERS SECTION - Shows ONLY after search is executed */}
      {isSearchExecuted && (
        <div className="animate-fade-in">
          <TaxiOffersSection
            fromLocation={fromLocation}
            toLocation={toLocation}
          />
        </div>
      )}

      {/* SEARCH RESULTS & ROUTE SUMMARY */}
      <div id="trip-summary-section">
        <TripCompactSummary
          routeEstimate={routeEstimate}
          sharedCount={routeEstimate.sharedAvailable ? 1 : 0}
          reservedCount={matchingOperators.length}
        />
      </div>

      {/* TRAVEL OPTIONS SECTION */}
      <TravelOptionsSection
        routeEstimate={routeEstimate}
        onOpenPickupModal={() => setIsPickupModalOpen(true)}
        onScrollToOperators={handleScrollToOperators}
        selectedOption={tripType}
      />

      {/* MARKET REFERENCE FARE ENGINE GUIDANCE */}
      <MarketReferenceFareCard
        fromLocation={fromLocation}
        toLocation={toLocation}
        initialJourneyType={tripType === 'shared' ? 'shared' : 'reserved_one_way'}
        initialVehicleCategory="Bolero"
        operators={operators}
      />

      {/* VERIFIED OPERATORS LIST WITH LIVE FILTERS */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 my-6 shadow-sm">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Loading Verified Taxi Operators...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fetching direct operator fares and live fleet availability from Supabase database.
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6 text-center space-y-3 my-6">
          <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
            Unable to Load Taxi Operators
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : operators.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 my-6">
          <SearchX className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            No Taxi Operators Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            No verified taxi operators are currently listed in the database.
          </p>
        </div>
      ) : (
        <OperatorList
          operators={matchingOperators.length > 0 ? matchingOperators : operators}
          fromLocation={fromLocation}
          toLocation={toLocation}
          journeyType={tripType === 'shared' ? 'shared' : 'reserved_one_way'}
          vehicleCategory="Bolero"
          hubs={hubs}
          onOpenFleet={(op) => setSelectedOperatorForFleet(op)}
          onOpenLeadModal={(op) => {
            setSelectedVehicleForLead(null);
            setSelectedOperatorForLead(op);
          }}
          onSelectOperator={(op) => {
            if (navigate) {
              navigate(`#/taxi/operator/${op.id}`);
            } else {
              window.location.hash = `#/taxi/operator/${op.id}`;
            }
          }}
        />
      )}

      {/* MODALS & DRAWERS */}
      <Suspense fallback={null}>
        {/* Pickup Location Modal */}
        {isPickupModalOpen && (
          <PickupLocationModal
            isOpen={isPickupModalOpen}
            onClose={() => setIsPickupModalOpen(false)}
            standName={routeEstimate.sharedPickupStand}
            fromLocation={routeEstimate.from}
            toLocation={routeEstimate.to}
          />
        )}

        {/* Operator Fleet Drawer */}
        {!!selectedOperatorForFleet && (
          <OperatorFleetDrawer
            isOpen={!!selectedOperatorForFleet}
            onClose={() => setSelectedOperatorForFleet(null)}
            operator={selectedOperatorForFleet}
            vehicles={fleetVehicles}
            fromLocation={routeEstimate.from}
            toLocation={routeEstimate.to}
            onRequestBooking={handleRequestBookingFromFleet}
          />
        )}

        {/* Booking Review Sheet Modal */}
        {!!selectedOperatorForLead && (
          <BookingLeadModal
            isOpen={!!selectedOperatorForLead}
            onClose={() => {
              setSelectedOperatorForLead(null);
              setSelectedVehicleForLead(null);
            }}
            operator={selectedOperatorForLead}
            selectedVehicle={selectedVehicleForLead}
            fromLocation={routeEstimate.from}
            toLocation={routeEstimate.to}
            travelDate={travelDate}
            passengers={passengers}
            tripType={tripType}
            onBookingSubmitted={handleBookingSubmitted}
          />
        )}

        {/* Dedicated HillyTrip Messaging Chat Modal */}
        {!!activeBookingChat && (
          <TaxiBookingChatModal
            isOpen={!!activeBookingChat}
            onClose={() => setActiveBookingChat(null)}
            booking={activeBookingChat}
            onBookingUpdated={() => refreshBookings()}
          />
        )}

        {/* Architecture Spec & ERD Modal */}
        {isArchitectureModalOpen && (
          <TaxiArchitectureModal
            isOpen={isArchitectureModalOpen}
            onClose={() => setIsArchitectureModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
};
