import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Car, 
  Route, 
  FileText, 
  Power, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Save, 
  Edit, 
  ShieldCheck, 
  Send,
  AlertCircle,
  RefreshCw,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TaxiOperatorProfile, 
  OperatorFixedRoute, 
  OperatorVehicleCategory, 
  District, 
  VehicleCategoryName,
  TaxiQuoteRequest,
  TaxiQuoteResponse
} from '../../types/taxi';
import { 
  SIKKIM_DISTRICTS, 
  TAXI_STANDS 
} from '../../data/taxiData';
import { useTaxiOperators, formatTaxiStand } from '../../services/taxi/taxiDataService';
import { OperatorFareGuidanceBanner } from './OperatorFareGuidanceBanner';
import { OperatorFareSubmitPanel } from './OperatorFareSubmitPanel';
import { 
  recordFareUpdate, 
  invalidateMarketFareCache 
} from '../../services/taxi/MarketReferenceFareEngine';

interface OperatorDashboardProps {
  user?: any;
  onUpdateUser?: (updated: any) => void;
  navigate: (path: string) => void;
}

export default function OperatorDashboard({ user, onUpdateUser, navigate }: OperatorDashboardProps) {
  const { operators: liveOperators } = useTaxiOperators();
  const [activeTab, setActiveTab] = useState<'profile' | 'fleet' | 'routes' | 'quotes' | 'fare_quotes'>('fare_quotes');

  // Operator Profile State
  const [profile, setProfile] = useState<TaxiOperatorProfile>({
    id: 'op-default',
    user_id: user?.id || '',
    owner_type: 'taxi_operator',
    business_name: user?.business_name || 'HillyTrip Taxi Partner',
    owner_name: user?.name || 'Local Operator',
    phone: user?.phone || '+91 98000 00000',
    whatsapp: user?.whatsapp || '+91 98000 00000',
    base_taxi_stand: 'NJP Railway Station',
    pickup_areas: ['NJP Railway Station', 'Siliguri Junction'],
    drop_areas: ['Kalimpong', 'Darjeeling', 'Gangtok'],
    working_areas: ['Darjeeling', 'Kalimpong', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.9,
    reviews_count: 24,
    fleet: [],
    fixedRoutes: []
  });

  // Fleet Categories Count State
  const [fleetCounts, setFleetCounts] = useState<Record<VehicleCategoryName, number>>({
    Bolero: 8,
    Ertiga: 4,
    Innova: 5,
    Traveller: 2,
    Scorpio: 0,
    'Alto / Hatchback': 0
  });

  // Fixed Routes State (Max 20)
  const [fixedRoutes, setFixedRoutes] = useState<OperatorFixedRoute[]>([]);

  useEffect(() => {
    if (liveOperators && liveOperators.length > 0) {
      const currentOp = liveOperators.find(o => o.user_id === user?.id || o.id === user?.id || o.phone === user?.phone) || liveOperators[0];
      if (currentOp) {
        setProfile(currentOp);
        if (currentOp.fixedRoutes) {
          setFixedRoutes(currentOp.fixedRoutes);
        }
      }
    }
  }, [liveOperators, user]);

  // New Route Form State
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newPrivateAvail, setNewPrivateAvail] = useState(true);
  const [newPrivatePrice, setNewPrivatePrice] = useState<number>(3000);
  const [newSharedAvail, setNewSharedAvail] = useState(true);
  const [newSharedFare, setNewSharedFare] = useState<number>(400);

  // Quote Requests Inbox State
  const [quoteRequests, setQuoteRequests] = useState<TaxiQuoteRequest[]>([
    {
      id: 'qr-101',
      traveller_id: 'tr-1',
      traveller_name: 'Rahul Sharma',
      traveller_phone: '+91 98112 33445',
      service_type: 'transfer',
      pickup_location: 'NJP Railway Station',
      drop_location: 'Gangtok',
      trip_type: 'one_way',
      journey_date: '2026-07-28',
      journey_time: '10:00',
      travellers_count: 4,
      vehicle_preference: 'Innova',
      notes: 'Need luggage space for 4 bags',
      working_area: 'East Sikkim',
      request_status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: 'qr-102',
      traveller_id: 'tr-2',
      traveller_name: 'Ananya Roy',
      traveller_phone: '+91 97441 22110',
      service_type: 'tour',
      tour_package: 'North Sikkim Expedition (Lachen, Lachung)',
      number_of_days: 3,
      journey_date: '2026-07-30',
      travellers_count: 6,
      vehicle_preference: 'Bolero',
      notes: 'Please include permits for Gurudongmar Lake',
      working_area: 'North Sikkim',
      request_status: 'pending',
      created_at: new Date().toISOString()
    }
  ]);

  // Quote Response Modal State
  const [respondingToQuote, setRespondingToQuote] = useState<TaxiQuoteRequest | null>(null);
  const [responseFare, setResponseFare] = useState<number>(3500);
  const [responseMsg, setResponseMsg] = useState('We will provide a clean Innova with experienced mountain driver and permit assistance.');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle District Selection
  const toggleDistrict = (district: District) => {
    setProfile(prev => {
      const exists = prev.working_areas.includes(district);
      const updatedAreas = exists
        ? prev.working_areas.filter(d => d !== district)
        : [...prev.working_areas, district];
      return { ...prev, working_areas: updatedAreas };
    });
  };

  // Route Fare Editing & History Modal State
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editPrivatePrice, setEditPrivatePrice] = useState<number>(0);
  const [editSharedFare, setEditSharedFare] = useState<number>(0);
  const [historyModalRoute, setHistoryModalRoute] = useState<OperatorFixedRoute | null>(null);

  // Add Fixed Route (Max 20)
  const handleAddFixedRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (fixedRoutes.length >= 20) {
      alert('Maximum limit of 20 fixed routes reached! Please delete or edit an existing route.');
      return;
    }
    if (!newFrom || !newTo) {
      alert('Please specify both From and To locations.');
      return;
    }

    const route: OperatorFixedRoute = {
      id: 'fr-' + Date.now(),
      operator_id: profile.id,
      from_location: newFrom,
      to_location: newTo,
      private_taxi_available: newPrivateAvail,
      private_starting_price: newPrivatePrice,
      shared_taxi_available: newSharedAvail,
      shared_fare: newSharedFare,
      is_active: true,
      fare_history: [
        {
          id: `fh_init_${Date.now()}`,
          route_id: 'fr-' + Date.now(),
          operator_id: profile.id,
          previous_fare: 0,
          new_fare: newPrivatePrice,
          journey_type: 'reserved_one_way',
          vehicle_category: 'Bolero',
          updated_at: new Date().toISOString(),
          updated_by: profile.owner_name || 'Operator',
          reason: 'Initial Fixed Route Listing'
        }
      ],
      created_at: new Date().toISOString()
    };

    setFixedRoutes(prev => [route, ...prev]);
    setNewFrom('');
    setNewTo('');
    invalidateMarketFareCache();
    showToast('Fixed Route added successfully!');
  };

  // Update Route Fare with Fare History Audit Trail
  const handleSaveRouteFare = (route: OperatorFixedRoute) => {
    let updated = route;
    if (editPrivatePrice > 0 && editPrivatePrice !== route.private_starting_price) {
      updated = recordFareUpdate(
        updated,
        editPrivatePrice,
        'reserved_one_way',
        profile.owner_name || 'Operator',
        'Standard SUV',
        'Operator Dashboard Fare Update'
      );
    }
    if (editSharedFare > 0 && editSharedFare !== route.shared_fare) {
      updated = recordFareUpdate(
        updated,
        editSharedFare,
        'shared',
        profile.owner_name || 'Operator',
        'Standard SUV',
        'Operator Dashboard Shared Fare Update'
      );
    }

    setFixedRoutes(prev => prev.map(r => r.id === route.id ? updated : r));
    setEditingRouteId(null);
    showToast('Route fare updated! Fare history logged for audit.');
  };

  // Toggle Route Active Status
  const handleToggleRouteActive = (id: string) => {
    setFixedRoutes(prev => prev.map(r => {
      if (r.id === id) {
        const nextActive = !(r.is_active ?? true);
        invalidateMarketFareCache();
        showToast(nextActive ? 'Route activated.' : 'Route deactivated (excluded from Market Reference Fare).');
        return { ...r, is_active: nextActive };
      }
      return r;
    }));
  };

  // Remove Fixed Route
  const handleRemoveFixedRoute = (id: string) => {
    setFixedRoutes(prev => prev.filter(r => r.id !== id));
    invalidateMarketFareCache();
    showToast('Fixed route removed.');
  };

  // Update Fleet Category Count
  const handleFleetCountChange = (cat: VehicleCategoryName, val: number) => {
    setFleetCounts(prev => ({
      ...prev,
      [cat]: Math.max(0, val)
    }));
  };

  // Submit Response to Quote Request
  const handleSendQuoteResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingToQuote) return;

    setIsSubmittingResponse(true);

    const payload = {
      request_id: respondingToQuote.id,
      operator_id: profile.id,
      operator_name: profile.business_name,
      operator_phone: profile.phone,
      operator_whatsapp: profile.whatsapp,
      fare: responseFare,
      operator_message: responseMsg
    };

    try {
      await fetch('/api/taxi/quote-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Network quote response fallback:', err);
    }

    // Update local state
    setQuoteRequests(prev => prev.map(q => q.id === respondingToQuote.id ? { ...q, request_status: 'responded' } : q));
    setIsSubmittingResponse(false);
    setRespondingToQuote(null);
    showToast('Quote response sent to traveller!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER BAR WITH ONLINE TOGGLES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {profile.business_name}
                </h1>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified
                </span>
              </div>
              {(() => {
                const owner = (profile.owner_name || '').trim();
                const hasOwner = Boolean(owner && owner.toLowerCase() !== 'null' && owner.toLowerCase() !== 'undefined');
                const stand = formatTaxiStand(profile.base_taxi_stand);
                if (!hasOwner && !stand) return null;
                return (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {hasOwner && <span>Owner: {owner}</span>}
                    {hasOwner && stand && <span> • </span>}
                    {stand && (
                      <span>Base Stand: <strong className="text-slate-700 dark:text-slate-300">{stand}</strong></span>
                    )}
                  </p>
                );
              })()}
            </div>
          </div>

          {/* ONLINE & BOOKING TOGGLES */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {/* ONLINE TOGGLE */}
            <button
              type="button"
              onClick={() => {
                setProfile(prev => ({ ...prev, is_online: !prev.is_online }));
                showToast(profile.is_online ? 'Operator status: OFFLINE' : 'Operator status: ONLINE');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                profile.is_online 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{profile.is_online ? 'ONLINE' : 'OFFLINE'}</span>
            </button>

            {/* BOOKING ENABLED TOGGLE */}
            <button
              type="button"
              onClick={() => {
                setProfile(prev => ({ ...prev, booking_enabled: !prev.booking_enabled }));
                showToast(profile.booking_enabled ? 'Bookings PAUSED' : 'Bookings ENABLED');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                profile.booking_enabled 
                  ? 'bg-sky-500 text-white shadow-md' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{profile.booking_enabled ? 'BOOKINGS ON' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Operator Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Fleet Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'routes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Route className="w-4 h-4" />
            <span>Fixed Routes ({fixedRoutes.length}/20)</span>
          </button>

          <button
            onClick={() => setActiveTab('fare_quotes')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fare_quotes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Submit Fare Quotes</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === 'quotes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Quote Requests Inbox</span>
            {quoteRequests.filter(q => q.request_status === 'pending').length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute top-2 right-2" />
            )}
          </button>
        </div>

        {/* TAB: SUBMIT FARE QUOTES */}
        {activeTab === 'fare_quotes' && (
          <OperatorFareSubmitPanel
            operatorId={profile.id}
            operatorName={profile.owner_name}
            businessName={profile.business_name}
          />
        )}

        {/* TAB 1: OPERATOR PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
              Business Profile & Working Areas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Business Name
                </label>
                <input 
                  type="text"
                  value={profile.business_name}
                  onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Owner / Manager Name
                </label>
                <input 
                  type="text"
                  value={profile.owner_name}
                  onChange={(e) => setProfile({ ...profile, owner_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input 
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  WhatsApp Number
                </label>
                <input 
                  type="text"
                  value={profile.whatsapp}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Base Taxi Stand
                </label>
                <select
                  value={profile.base_taxi_stand}
                  onChange={(e) => setProfile({ ...profile, base_taxi_stand: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold"
                >
                  {TAXI_STANDS.map(tsObj => {
                    const tsName = typeof tsObj === 'string' ? tsObj : tsObj.name;
                    return <option key={tsName} value={tsName}>{tsName}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Booking Preference
                </label>
                <select
                  value={profile.booking_preference}
                  onChange={(e) => setProfile({ ...profile, booking_preference: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-sm font-semibold"
                >
                  <option value="both">Both (Instant Booking & Custom Quotes)</option>
                  <option value="instant">Instant Fixed Routes Only</option>
                  <option value="quote_only">Custom Quotes Only</option>
                </select>
              </div>
            </div>

            {/* WORKING AREAS SELECTION */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Working Areas (Districts Served)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Select all districts where your taxi fleet operates. Quote requests are matched based on these areas.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {SIKKIM_DISTRICTS.map(dist => {
                  const isSelected = profile.working_areas.includes(dist);
                  return (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => toggleDistrict(dist)}
                      className={`p-3.5 rounded-2xl text-xs font-extrabold border transition cursor-pointer text-center ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      {dist}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => showToast('Operator profile saved successfully!')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        )}

        {/* TAB 2: FLEET CATEGORIES */}
        {activeTab === 'fleet' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Vehicle Fleet Categories
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Enter total vehicle counts for each category. Individual registration plates or paper uploads are not required for base management.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(['Bolero', 'Ertiga', 'Innova', 'Traveller'] as VehicleCategoryName[]).map(cat => (
                <div 
                  key={cat}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{cat}</span>
                    <Car className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Available Count
                    </label>
                    <input 
                      type="number"
                      min={0}
                      max={100}
                      value={fleetCounts[cat]}
                      onChange={(e) => handleFleetCountChange(cat, parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl text-lg font-extrabold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('Fleet count updated!')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Fleet Counts</span>
            </button>
          </div>
        )}

        {/* TAB 3: FIXED ROUTES (MAX 20) */}
        {activeTab === 'routes' && (
          <div className="space-y-6">

            {/* ADD FIXED ROUTE FORM */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Add Fixed Route ({fixedRoutes.length}/20)
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-500">
                  {20 - fixedRoutes.length} Slots Available
                </span>
              </div>

              {/* MARKET FARE GUIDANCE BANNER */}
              <OperatorFareGuidanceBanner
                fromTaxiStand={newFrom || 'NJP Railway Station'}
                destination={newTo || 'Kalimpong'}
                journeyType="reserved_one_way"
                vehicleCategory="Bolero"
                currentOperatorFare={newPrivatePrice}
              />

              <form onSubmit={handleAddFixedRoute} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    From
                  </label>
                  <input 
                    type="text"
                    required
                    value={newFrom}
                    onChange={(e) => setNewFrom(e.target.value)}
                    placeholder="e.g. NJP Railway Station"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    To
                  </label>
                  <input 
                    type="text"
                    required
                    value={newTo}
                    onChange={(e) => setNewTo(e.target.value)}
                    placeholder="e.g. Gangtok"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Private Starting Price (₹)
                  </label>
                  <input 
                    type="number"
                    min={0}
                    value={newPrivatePrice}
                    onChange={(e) => setNewPrivatePrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Shared Taxi Available
                  </label>
                  <select
                    value={newSharedAvail ? 'yes' : 'no'}
                    onChange={(e) => setNewSharedAvail(e.target.value === 'yes')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {newSharedAvail && (
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Shared Fare per Seat (₹)
                    </label>
                    <input 
                      type="number"
                      min={0}
                      value={newSharedFare}
                      onChange={(e) => setNewSharedFare(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-bold"
                    />
                  </div>
                )}

                <div className="sm:col-span-2 lg:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Fixed Route</span>
                  </button>
                </div>
              </form>
            </div>

            {/* FIXED ROUTES LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixedRoutes.map(route => {
                const isEditing = editingRouteId === route.id;
                const isActive = route.is_active ?? true;

                return (
                  <div 
                    key={route.id}
                    className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm transition-all space-y-3 ${
                      isActive 
                        ? 'border-slate-200/80 dark:border-slate-800' 
                        : 'border-amber-300 dark:border-amber-800/60 bg-amber-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {route.from_location} → {route.to_location}
                        </span>
                        <button
                          onClick={() => handleToggleRouteActive(route.id)}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {isActive ? 'Active Route' : 'Inactive (Excluded)'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setHistoryModalRoute(route)}
                          className="p-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition cursor-pointer flex items-center gap-1"
                          title="View Fare History Audit Trail"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-600" />
                          <span className="hidden sm:inline">History ({route.fare_history?.length || 0})</span>
                        </button>

                        <button
                          onClick={() => handleRemoveFixedRoute(route.id)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Remove Route"
                        >
                          <Trash2 className="w-3 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3 pt-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Private Fare (₹)
                            </label>
                            <input
                              type="number"
                              value={editPrivatePrice}
                              onChange={(e) => setEditPrivatePrice(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              Shared Fare (₹)
                            </label>
                            <input
                              type="number"
                              value={editSharedFare}
                              onChange={(e) => setEditSharedFare(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingRouteId(null)}
                            className="px-3 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveRouteFare(route)}
                            className="px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save &amp; Log History</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-3">
                          <span>Private: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">₹{route.private_starting_price}</strong></span>
                          {route.shared_taxi_available && (
                            <span>Shared: <strong className="text-sky-600 dark:text-sky-400 font-mono">₹{route.shared_fare}/seat</strong></span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setEditingRouteId(route.id);
                            setEditPrivatePrice(route.private_starting_price);
                            setEditSharedFare(route.shared_fare || 0);
                          }}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Update Fare</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 4: QUOTE REQUESTS INBOX */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Quote Requests Inbox
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Requests matched for your working areas ({profile.working_areas.join(', ') || 'East Sikkim'})
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
                {quoteRequests.filter(q => q.request_status === 'pending').length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {quoteRequests.map(req => (
                <div 
                  key={req.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {req.service_type.toUpperCase()} • Area: {req.working_area}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                        {req.service_type === 'transfer' ? `${req.pickup_location} → ${req.drop_location}` : (req.service_type === 'sightseeing' ? `${req.sightseeing_package}` : req.tour_package)}
                      </h4>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono uppercase self-start ${
                      req.request_status === 'responded' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {req.request_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-mono block">Traveller</span>
                      <strong className="text-slate-800 dark:text-slate-200">{req.traveller_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-mono block">Date & Time</span>
                      <strong className="text-slate-800 dark:text-slate-200">{req.journey_date} ({req.journey_time || 'Morning'})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-mono block">Group Size</span>
                      <strong className="text-slate-800 dark:text-slate-200">{req.travellers_count} PAX ({req.vehicle_preference})</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-mono block">Notes</span>
                      <span className="text-slate-600 dark:text-slate-400 truncate block">{req.notes || 'None'}</span>
                    </div>
                  </div>

                  {req.request_status === 'pending' ? (
                    <button
                      onClick={() => setRespondingToQuote(req)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Quote / Fare Response</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Quote Sent to Traveller
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* QUOTE RESPONSE MODAL */}
      <AnimatePresence>
        {respondingToQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRespondingToQuote(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Send Quote to {respondingToQuote.traveller_name}
                </h3>
                <button
                  onClick={() => setRespondingToQuote(null)}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendQuoteResponse} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Offered Fare Price (₹)
                  </label>
                  <input 
                    type="number"
                    required
                    min={100}
                    value={responseFare}
                    onChange={(e) => setResponseFare(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-lg font-extrabold text-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Message / Vehicle Details
                  </label>
                  <textarea 
                    rows={3}
                    value={responseMsg}
                    onChange={(e) => setResponseMsg(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingResponse}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Quote to Traveller</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FARE HISTORY AUDIT TRAIL MODAL */}
      <AnimatePresence>
        {historyModalRoute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryModalRoute(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Fare History Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500">
                    {historyModalRoute.from_location} → {historyModalRoute.to_location}
                  </p>
                </div>
                <button
                  onClick={() => setHistoryModalRoute(null)}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {(!historyModalRoute.fare_history || historyModalRoute.fare_history.length === 0) ? (
                <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                  No previous fare changes recorded.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {historyModalRoute.fare_history.map((entry, idx) => (
                    <div 
                      key={entry.id || idx}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{entry.previous_fare} → <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">₹{entry.new_fare}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(entry.updated_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Type: <strong className="text-slate-700 dark:text-slate-300 capitalize">{entry.journey_type.replace(/_/g, ' ')}</strong></span>
                        <span>Updated By: <strong className="text-slate-700 dark:text-slate-300">{entry.updated_by || 'Operator'}</strong></span>
                      </div>
                      {entry.reason && (
                        <p className="text-[10px] text-slate-400 italic pt-0.5">
                          Note: "{entry.reason}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setHistoryModalRoute(null)}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Close Audit Trail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 text-xs font-black font-mono animate-fade-in">
          {toastMessage}
        </div>
      )}

    </div>
  );
}
