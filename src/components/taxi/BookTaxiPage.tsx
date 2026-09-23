import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Mountain, 
  Compass, 
  Route, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  ShieldCheck, 
  Star, 
  CheckCircle, 
  Send, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertCircle,
  Phone,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ServiceType, 
  TaxiOperatorProfile, 
  OperatorFixedRoute, 
  TaxiSearchResult,
  District
} from '../../types/taxi';
import { Hub, Destination } from '../../types';
import LocationAutocompleteInput from './LocationAutocompleteInput';
import { 
  SIGHTSEEING_PACKAGES, 
  TOUR_PACKAGES, 
  TAXI_STANDS,
  SIKKIM_DISTRICTS 
} from '../../data/taxiData';
import { useTaxiOperators, formatTaxiStand } from '../../services/taxi/taxiDataService';

interface BookTaxiPageProps {
  user?: any;
  navigate: (path: string) => void;
  hubs?: Hub[];
  destinations?: Destination[];
}

export default function BookTaxiPage({ user, navigate, hubs = [], destinations = [] }: BookTaxiPageProps) {
  const { operators } = useTaxiOperators();
  // Active Service Selection
  const [selectedService, setSelectedService] = useState<ServiceType>('transfer');

  // Common Form States
  const [journeyDate, setJourneyDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [journeyTime, setJourneyTime] = useState('09:00');
  const [travellersCount, setTravellersCount] = useState<number>(2);
  const [vehiclePreference, setVehiclePreference] = useState<string>('Any');
  const [notes, setNotes] = useState('');

  // Transfer Form States
  const [transferPickup, setTransferPickup] = useState('NJP Railway Station');
  const [transferDestination, setTransferDestination] = useState('Gangtok');
  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('one_way');

  // Sightseeing Form States
  const [sightseeingDestination, setSightseeingDestination] = useState('Gangtok');
  const [sightseeingPackage, setSightseeingPackage] = useState('Gangtok Local 7 Point Tour');

  // Tour Form States
  const [tourPackage, setTourPackage] = useState('North Sikkim Expedition (Lachen, Lachung, Gurudongmar & Yumthang)');
  const [tourDays, setTourDays] = useState<number>(3);

  // Custom Trip Form States
  const [customPickup, setCustomPickup] = useState('Bagdogra Airport');
  const [customDestination, setCustomDestination] = useState('Pelling');
  const [customStops, setCustomStops] = useState<string[]>(['Gangtok', 'Ravangla']);
  const [customDescription, setCustomDescription] = useState('Family trip with senior citizens. Need comfortable vehicle.');

  // Search Engine & Results State
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<TaxiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Quote Modal & Request States
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [travellerName, setTravellerName] = useState(user?.name || user?.displayName || '');
  const [travellerPhone, setTravellerPhone] = useState(user?.mobile || user?.phone || '');
  const [selectedOperatorForBooking, setSelectedOperatorForBooking] = useState<TaxiOperatorProfile | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Sync user info
  useEffect(() => {
    if (user) {
      if (!travellerName) setTravellerName(user.name || user.displayName || '');
      if (!travellerPhone) setTravellerPhone(user.mobile || user.phone || '');
    }
  }, [user]);

  // Handle Add / Remove Stop in Custom Trip
  const handleAddStop = () => {
    setCustomStops(prev => [...prev, '']);
  };

  const handleUpdateStop = (index: number, val: string) => {
    const updated = [...customStops];
    updated[index] = val;
    setCustomStops(updated);
  };

  const handleRemoveStop = (index: number) => {
    setCustomStops(prev => prev.filter((_, i) => i !== index));
  };

  // Detect working district for quote matching
  const deriveWorkingArea = (): District => {
    let loc = '';
    if (selectedService === 'transfer') loc = transferDestination || transferPickup;
    else if (selectedService === 'sightseeing') loc = sightseeingDestination;
    else if (selectedService === 'tour') loc = tourPackage;
    else loc = customDestination || customPickup;

    const lower = loc.toLowerCase();
    if (lower.includes('darjeeling')) return 'Darjeeling';
    if (lower.includes('kalimpong')) return 'Kalimpong';
    if (lower.includes('north') || lower.includes('lachen') || lower.includes('lachung') || lower.includes('yumthang') || lower.includes('gurudongmar')) return 'North Sikkim';
    if (lower.includes('west') || lower.includes('pelling') || lower.includes('yuksom') || lower.includes('gyalshing')) return 'West Sikkim';
    if (lower.includes('south') || lower.includes('namchi') || lower.includes('ravangla')) return 'South Sikkim';
    return 'East Sikkim'; // Default to East Sikkim (Gangtok)
  };

  // Execute Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    setSelectedOperatorForBooking(null);

    try {
      // API or Mock Search matching
      const queryParams = new URLSearchParams({
        service: selectedService,
        pickup: selectedService === 'transfer' ? transferPickup : customPickup,
        destination: selectedService === 'transfer' ? transferDestination : (selectedService === 'sightseeing' ? sightseeingDestination : customDestination)
      });

      const res = await fetch(`/api/taxi/search?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.results) {
          setSearchResults(data.results);
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API search fallback to seed database:', err);
    }

    // Fallback seed search logic
    setTimeout(() => {
      let results: TaxiSearchResult[] = [];

      if (selectedService === 'transfer') {
        operators.forEach(op => {
          if (!op.is_online || !op.booking_enabled) return;
          const routeMatch = (op.fixedRoutes || []).find(r => 
            (r.from_location.toLowerCase().includes(transferPickup.toLowerCase()) || transferPickup.toLowerCase().includes(r.from_location.toLowerCase())) &&
            (r.to_location.toLowerCase().includes(transferDestination.toLowerCase()) || transferDestination.toLowerCase().includes(r.to_location.toLowerCase()))
          );

          if (routeMatch) {
            results.push({
              operator: op,
              fixedRoute: routeMatch,
              isFixedRouteMatch: true
            });
          }
        });
      } else if (selectedService === 'sightseeing') {
        operators.forEach(op => {
          if (!op.is_online || !op.booking_enabled) return;
          const routeMatch = (op.fixedRoutes || []).find(r => 
            r.to_location.toLowerCase().includes(sightseeingDestination.toLowerCase()) ||
            r.to_location.toLowerCase().includes('local')
          );
          if (routeMatch) {
            results.push({
              operator: op,
              fixedRoute: routeMatch,
              isFixedRouteMatch: true
            });
          }
        });
      }

      setSearchResults(results);
      setIsSearching(false);
    }, 400);
  };

  // Submit Quote Request
  const handleSubmitQuoteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travellerPhone) {
      alert('Please provide a valid phone number so operators can reach you with exact quotes!');
      return;
    }

    setSubmittingQuote(true);

    const payload = {
      traveller_id: user?.id || 'guest-' + Date.now(),
      traveller_name: travellerName || 'Valued Traveller',
      traveller_phone: travellerPhone,
      service_type: selectedService,
      pickup_location: selectedService === 'transfer' ? transferPickup : customPickup,
      drop_location: selectedService === 'transfer' ? transferDestination : customDestination,
      trip_type: tripType,
      destination: selectedService === 'sightseeing' ? sightseeingDestination : customDestination,
      sightseeing_package: selectedService === 'sightseeing' ? sightseeingPackage : undefined,
      tour_package: selectedService === 'tour' ? tourPackage : undefined,
      number_of_days: selectedService === 'tour' ? tourDays : undefined,
      multiple_stops: selectedService === 'custom' ? customStops.filter(Boolean) : [],
      trip_description: selectedService === 'custom' ? customDescription : notes,
      journey_date: journeyDate,
      journey_time: journeyTime,
      travellers_count: travellersCount,
      vehicle_preference: vehiclePreference,
      notes: notes,
      working_area: deriveWorkingArea()
    };

    try {
      const res = await fetch('/api/taxi/quote-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setQuoteSubmitted(true);
      } else {
        alert(data.error || 'Failed to post quote request.');
      }
    } catch (err) {
      console.warn('Network quote post fallback:', err);
      // Simulate success for offline/preview
      setQuoteSubmitted(true);
    } finally {
      setSubmittingQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* TOP BANNER / HEADER */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono tracking-wider uppercase">
            <Car className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>HillyTrip Reserved Taxi Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Book a Ride
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-base font-medium">
            Reliable transfers, sightseeing & multi-day mountain tours across Sikkim & North Bengal with verified local operators.
          </p>
        </div>

        {/* ========================================================
            4 SERVICE CARDS SELECTION
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1: TRANSFER */}
          <div
            onClick={() => { setSelectedService('transfer'); setHasSearched(false); }}
            className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              selectedService === 'transfer'
                ? 'bg-gradient-to-b from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/10 border-emerald-500 dark:border-emerald-400 shadow-xl ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  selectedService === 'transfer' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-500/10 group-hover:text-emerald-500'
                }`}>
                  <Car className="w-6 h-6" />
                </div>
                {selectedService === 'transfer' && (
                  <span className="text-[10px] bg-emerald-500 text-white font-black px-2.5 py-0.5 rounded-full font-mono uppercase">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Transfer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                Travel from one place to another.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[10px] uppercase">Examples:</span>
              <p>• NJP → Gangtok</p>
              <p>• Gangtok → Daritar</p>
              <p>• Bagdogra → Darjeeling</p>
            </div>
          </div>

          {/* CARD 2: SIGHTSEEING */}
          <div
            onClick={() => { setSelectedService('sightseeing'); setHasSearched(false); }}
            className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              selectedService === 'sightseeing'
                ? 'bg-gradient-to-b from-sky-500/10 to-blue-500/5 dark:from-sky-500/20 dark:to-blue-500/10 border-sky-500 dark:border-sky-400 shadow-xl ring-2 ring-sky-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-500/50 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  selectedService === 'sightseeing' ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-sky-500/10 group-hover:text-sky-500'
                }`}>
                  <Mountain className="w-6 h-6" />
                </div>
                {selectedService === 'sightseeing' && (
                  <span className="text-[10px] bg-sky-500 text-white font-black px-2.5 py-0.5 rounded-full font-mono uppercase">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Sightseeing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                Visit attractions around one destination.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-1">
              <span className="font-bold text-sky-600 dark:text-sky-400 block text-[10px] uppercase">Examples:</span>
              <p>• Gangtok Local</p>
              <p>• Darjeeling Local</p>
              <p>• Kalimpong Local</p>
            </div>
          </div>

          {/* CARD 3: TOUR */}
          <div
            onClick={() => { setSelectedService('tour'); setHasSearched(false); }}
            className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              selectedService === 'tour'
                ? 'bg-gradient-to-b from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10 border-amber-500 dark:border-amber-400 shadow-xl ring-2 ring-amber-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  selectedService === 'tour' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-amber-500/10 group-hover:text-amber-500'
                }`}>
                  <Compass className="w-6 h-6" />
                </div>
                {selectedService === 'tour' && (
                  <span className="text-[10px] bg-amber-500 text-white font-black px-2.5 py-0.5 rounded-full font-mono uppercase">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Tour</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                Multi-day tours.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 block text-[10px] uppercase">Examples:</span>
              <p>• North Sikkim</p>
              <p>• Silk Route</p>
              <p>• Dooars / Darjeeling</p>
            </div>
          </div>

          {/* CARD 4: CUSTOM TRIP */}
          <div
            onClick={() => { setSelectedService('custom'); setHasSearched(false); }}
            className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
              selectedService === 'custom'
                ? 'bg-gradient-to-b from-purple-500/10 to-indigo-500/5 dark:from-purple-500/20 dark:to-indigo-500/10 border-purple-500 dark:border-purple-400 shadow-xl ring-2 ring-purple-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  selectedService === 'custom' ? 'bg-purple-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-purple-500/10 group-hover:text-purple-500'
                }`}>
                  <Route className="w-6 h-6" />
                </div>
                {selectedService === 'custom' && (
                  <span className="text-[10px] bg-purple-500 text-white font-black px-2.5 py-0.5 rounded-full font-mono uppercase">
                    Active
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Custom Trip</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                Build your own journey.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-1">
              <span className="font-bold text-purple-600 dark:text-purple-400 block text-[10px] uppercase">Examples:</span>
              <p>• NJP → Gangtok → Pelling</p>
              <p>• Wedding / Corporate</p>
              <p>• Pilgrimage Trip</p>
            </div>
          </div>

        </div>

        {/* ========================================================
            DYNAMIC SERVICE FORM CONTAINER
            ======================================================== */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-6">

            {/* FORM TITLE */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold">
                {selectedService === 'transfer' && <Car className="w-5 h-5" />}
                {selectedService === 'sightseeing' && <Mountain className="w-5 h-5" />}
                {selectedService === 'tour' && <Compass className="w-5 h-5" />}
                {selectedService === 'custom' && <Route className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                  {selectedService === 'transfer' && 'Point-to-Point Transfer Booking'}
                  {selectedService === 'sightseeing' && 'Local Sightseeing Package'}
                  {selectedService === 'tour' && 'Multi-day Mountain Tour'}
                  {selectedService === 'custom' && 'Build Custom Itinerary Trip'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Fill in your travel preferences to search available taxis or get custom operator quotes.
                </p>
              </div>
            </div>

            {/* SERVICE SPECIFIC FIELDS */}
            {selectedService === 'transfer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <LocationAutocompleteInput
                    label="Pickup Location"
                    required
                    value={transferPickup}
                    onChange={setTransferPickup}
                    placeholder="Search pickup hub, stand, or town (e.g. NJP, Bagdogra, Gangtok)..."
                    hubs={hubs}
                    destinations={destinations}
                    focusColorClass="focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <LocationAutocompleteInput
                    label="Destination Location"
                    required
                    value={transferDestination}
                    onChange={setTransferDestination}
                    placeholder="Search destination hub or town (e.g. Gangtok, Darjeeling, Kalimpong)..."
                    hubs={hubs}
                    destinations={destinations}
                    focusColorClass="focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Trip Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTripType('one_way')}
                      className={`py-3 px-4 rounded-2xl text-xs font-black border transition ${
                        tripType === 'one_way' 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                      }`}
                    >
                      One Way
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType('round_trip')}
                      className={`py-3 px-4 rounded-2xl text-xs font-black border transition ${
                        tripType === 'round_trip' 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                      }`}
                    >
                      Round Trip
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Journey Date
                    </label>
                    <input 
                      type="date"
                      required
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Journey Time
                    </label>
                    <input 
                      type="time"
                      value={journeyTime}
                      onChange={(e) => setJourneyTime(e.target.value)}
                      className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedService === 'sightseeing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Destination Town
                  </label>
                  <select
                    value={sightseeingDestination}
                    onChange={(e) => {
                      setSightseeingDestination(e.target.value);
                      const matching = SIGHTSEEING_PACKAGES.find(p => p.destination.toLowerCase() === e.target.value.toLowerCase());
                      if (matching) setSightseeingPackage(matching.name);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Gangtok">Gangtok (East Sikkim)</option>
                    <option value="Darjeeling">Darjeeling</option>
                    <option value="Kalimpong">Kalimpong</option>
                    <option value="Pelling">Pelling (West Sikkim)</option>
                    <option value="Namchi">Namchi (South Sikkim)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Sightseeing Package
                  </label>
                  <select
                    value={sightseeingPackage}
                    onChange={(e) => setSightseeingPackage(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    {SIGHTSEEING_PACKAGES.map(pkg => (
                      <option key={pkg.id} value={pkg.name}>
                        {pkg.name} ({pkg.destination})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Journey Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {selectedService === 'tour' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Tour Package
                  </label>
                  <select
                    value={tourPackage}
                    onChange={(e) => {
                      setTourPackage(e.target.value);
                      const matching = TOUR_PACKAGES.find(p => p.name === e.target.value);
                      if (matching) setTourDays(matching.days);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {TOUR_PACKAGES.map(tour => (
                      <option key={tour.id} value={tour.name}>
                        {tour.name} ({tour.days} Days)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Journey Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Number of Days
                  </label>
                  <input 
                    type="number"
                    min={1}
                    max={15}
                    value={tourDays}
                    onChange={(e) => setTourDays(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {selectedService === 'custom' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <LocationAutocompleteInput
                      label="Pickup Location"
                      required
                      value={customPickup}
                      onChange={setCustomPickup}
                      placeholder="Search pickup hub, airport, or station..."
                      hubs={hubs}
                      destinations={destinations}
                      focusColorClass="focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <LocationAutocompleteInput
                      label="Final Destination"
                      required
                      value={customDestination}
                      onChange={setCustomDestination}
                      placeholder="Search final destination hub or town..."
                      hubs={hubs}
                      destinations={destinations}
                      focusColorClass="focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* MULTIPLE STOPS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Multiple Intermediate Stops
                    </label>
                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stop
                    </button>
                  </div>
                  <div className="space-y-2">
                    {customStops.map((stop, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400 w-12 text-right">Stop {idx + 1}:</span>
                        <LocationAutocompleteInput
                          value={stop}
                          onChange={(val) => handleUpdateStop(idx, val)}
                          placeholder={`Search stop location ${idx + 1}...`}
                          hubs={hubs}
                          destinations={destinations}
                          focusColorClass="focus:ring-purple-500"
                          className="flex-grow"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Trip Description & Specific Needs
                  </label>
                  <textarea
                    rows={3}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Describe your itinerary, special requests, luggage count or group requirements..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* COMMON FIELDS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Travellers Count
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number"
                    min={1}
                    max={26}
                    value={travellersCount}
                    onChange={(e) => setTravellersCount(parseInt(e.target.value) || 1)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Vehicle Preference
                </label>
                <select
                  value={vehiclePreference}
                  onChange={(e) => setVehiclePreference(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Any">Any / Operator Recommendation</option>
                  <option value="Bolero">Mahindra Bolero (Hill SUV)</option>
                  <option value="Ertiga">Maruti Ertiga (Comfort 6-seater)</option>
                  <option value="Innova">Toyota Innova / Crysta (Luxury)</option>
                  <option value="Traveller">Tempo Traveller (12-26 Seater)</option>
                </select>
              </div>

              {selectedService !== 'custom' && (
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Notes / Remarks (Optional)
                  </label>
                  <input 
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Senior citizen, heavy luggage"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching Verified Operator Database...
                  </span>
                ) : (
                  <>
                    <span>Search Available Rides & Rates</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* ========================================================
            SEARCH RESULTS & QUOTE REQUEST PROMPT
            ======================================================== */}
        {hasSearched && (
          <div className="space-y-6 animate-fade-in pt-4">

            {/* HEADER OF RESULTS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {searchResults.length > 0 
                    ? `Found ${searchResults.length} Verified Operators with Fixed Routes`
                    : 'No Direct Fixed Route Found'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Working District Area: <span className="font-bold text-emerald-600 dark:text-emerald-400">{deriveWorkingArea()}</span>
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedOperatorForBooking(null);
                  setIsQuoteModalOpen(true);
                  setQuoteSubmitted(false);
                }}
                className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Request Custom Quote from Area Operators</span>
              </button>
            </div>

            {/* CASE 1: FIXED ROUTE RESULTS CARDS */}
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchResults.map(({ operator, fixedRoute }) => (
                  <div 
                    key={operator.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="space-y-3">

                      {/* OPERATOR LOGO & NAME & VERIFIED */}
                      <div className="flex items-start justify-between gap-3">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => {
                            if (navigate) {
                              navigate(`#/taxi/operator/${operator.id}`);
                            } else {
                              window.location.hash = `#/taxi/operator/${operator.id}`;
                            }
                          }}
                        >
                          <img 
                            src={operator.logo_url || '/images/hillytrip/taxi-transit.svg'}
                            alt={operator.business_name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm group-hover:scale-105 transition"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                                {operator.business_name}
                              </h4>
                              {operator.verification_status === 'approved' && (
                                <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-black font-mono border border-emerald-500/20">
                                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified
                                </span>
                              )}
                            </div>
                            {(() => {
                              const standDisplay = formatTaxiStand(operator.base_taxi_stand, hubs);
                              if (!standDisplay) return null;
                              return (
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                  Base Stand: <span className="font-semibold text-slate-700 dark:text-slate-300">{standDisplay}</span>
                                </p>
                              );
                            })()}
                          </div>
                        </div>

                        {/* RATING */}
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-xl text-xs font-black border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{operator.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* FIXED ROUTE PRICING BADGES */}
                      {fixedRoute && (
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
                            <span>Route: {fixedRoute.from_location} → {fixedRoute.to_location}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {/* Private Taxi */}
                            <div className={`p-3 rounded-xl border text-left ${
                              fixedRoute.private_taxi_available 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-white' 
                                : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-mono font-bold uppercase block text-emerald-600 dark:text-emerald-400">
                                Private Taxi
                              </span>
                              {fixedRoute.private_taxi_available ? (
                                <p className="text-lg font-black text-slate-900 dark:text-white">
                                  ₹{fixedRoute.private_starting_price.toLocaleString('en-IN')}
                                  <span className="text-[10px] font-medium text-slate-500 block">Starting Fare</span>
                                </p>
                              ) : (
                                <span className="text-xs font-bold text-slate-400">Not Available</span>
                              )}
                            </div>

                            {/* Shared Taxi */}
                            <div className={`p-3 rounded-xl border text-left ${
                              fixedRoute.shared_taxi_available 
                                ? 'bg-sky-500/10 border-sky-500/30 text-slate-900 dark:text-white' 
                                : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                            }`}>
                              <span className="text-[10px] font-mono font-bold uppercase block text-sky-600 dark:text-sky-400">
                                Shared Taxi
                              </span>
                              {fixedRoute.shared_taxi_available ? (
                                <p className="text-lg font-black text-slate-900 dark:text-white">
                                  ₹{fixedRoute.shared_fare.toLocaleString('en-IN')}
                                  <span className="text-[10px] font-medium text-slate-500 block">Per Seat</span>
                                </p>
                              ) : (
                                <span className="text-xs font-bold text-slate-400 font-mono">N/A</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* CTAS */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedOperatorForBooking(operator);
                          setIsQuoteModalOpen(true);
                          setQuoteSubmitted(false);
                        }}
                        className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Book Now</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOperatorForBooking(operator);
                          setIsQuoteModalOpen(true);
                          setQuoteSubmitted(false);
                        }}
                        className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Request Quote</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (

              /* CASE 2: NO FIXED ROUTE - GENERATE QUOTE BANNER */
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-8 rounded-3xl border border-emerald-500/30 shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
                  <Sparkles className="w-8 h-8 animate-bounce" />
                </div>
                <div className="max-w-xl mx-auto space-y-2">
                  <h3 className="text-2xl font-black">Generate Operator Quote Request</h3>
                  <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                    No fixed route prices available for this specific itinerary. Broadcast your trip request to verified local operators in <span className="font-bold text-emerald-400">{deriveWorkingArea()}</span> to receive direct custom quotes.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedOperatorForBooking(null);
                    setIsQuoteModalOpen(true);
                    setQuoteSubmitted(false);
                  }}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition active:scale-95 cursor-pointer inline-flex items-center gap-2 font-mono uppercase tracking-wider"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Quote Request Now</span>
                </button>
              </div>

            )}

          </div>
        )}

      </div>

      {/* ========================================================
          QUOTE REQUEST / BOOKING MODAL
          ======================================================== */}
      <AnimatePresence>
        {isQuoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuoteModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10"
            >
              {!quoteSubmitted ? (
                <form onSubmit={handleSubmitQuoteRequest} className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {selectedOperatorForBooking 
                          ? `Request Quote from ${selectedOperatorForBooking.business_name}` 
                          : 'Broadcast Quote Request'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Area Covered: <span className="font-bold text-emerald-500">{deriveWorkingArea()}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsQuoteModalOpen(false)}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ✕
                    </button>
                  </div>

                  {/* SUMMARY OF REQUEST */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5 font-medium text-slate-600 dark:text-slate-300">
                    <p>• <strong className="text-slate-900 dark:text-white uppercase font-mono">Service:</strong> {selectedService.toUpperCase()}</p>
                    <p>• <strong className="text-slate-900 dark:text-white uppercase font-mono">Itinerary:</strong> {selectedService === 'transfer' ? `${transferPickup} → ${transferDestination}` : (selectedService === 'sightseeing' ? `${sightseeingPackage} (${sightseeingDestination})` : tourPackage)}</p>
                    <p>• <strong className="text-slate-900 dark:text-white uppercase font-mono">Date:</strong> {journeyDate} ({journeyTime})</p>
                    <p>• <strong className="text-slate-900 dark:text-white uppercase font-mono">Travellers & Vehicle:</strong> {travellersCount} PAX • {vehiclePreference}</p>
                  </div>

                  {/* CONTACT INPUTS */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Your Full Name
                      </label>
                      <input 
                        type="text"
                        required
                        value={travellerName}
                        onChange={(e) => setTravellerName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        WhatsApp / Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="tel"
                          required
                          value={travellerPhone}
                          onChange={(e) => setTravellerPhone(e.target.value)}
                          placeholder="+91 98000 00000"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Operators will message or call you directly with fares & vehicle options.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submittingQuote ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Posting Request...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Quote Request</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* SUCCESS STATE */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Quote Request Broadcasted!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                    Your trip details have been sent to online verified taxi operators in <strong className="text-emerald-500">{deriveWorkingArea()}</strong>. You will receive quotes via HillyTrip Messaging shortly!
                  </p>
                  <button
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs rounded-2xl shadow-lg transition cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
