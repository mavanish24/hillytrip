import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  Compass, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  X, 
  DollarSign, 
  ChevronRight, 
  CornerDownRight, 
  Zap, 
  Briefcase, 
  Send, 
  Check, 
  Info,
  ShieldCheck,
  Award,
  BookOpen,
  ArrowRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OperatorQuoteInboxProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

export default function OperatorQuoteInbox({ user, onUpdateUser }: OperatorQuoteInboxProps) {
  // Database states
  const [requests, setRequests] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Search states
  const [selectedTab, setSelectedTab] = useState<string>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPickup, setFilterPickup] = useState('');
  const [filterDrop, setFilterDrop] = useState('');
  const [filterVehiclePref, setFilterVehiclePref] = useState('Any');
  const [filterMinFare, setFilterMinFare] = useState('');
  const [filterMaxFare, setFilterMaxFare] = useState('');

  // Selected Request for Modal Details / Quote Builder
  const [selectedReq, setSelectedReq] = useState<any | null>(null);
  const [selectedReqQuotes, setSelectedReqQuotes] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Quote Builder Form States
  const [fareValue, setFareValue] = useState<number>(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [etaValue, setEtaValue] = useState<string>('30'); // minutes
  const [validityMinutes, setValidityMinutes] = useState<number>(20);
  const [optionalMessage, setOptionalMessage] = useState<string>('');
  const [quoteBuilderError, setQuoteBuilderError] = useState<string | null>(null);
  const [quoteSuccess, setQuoteSuccess] = useState<boolean>(false);

  // Decline Form States
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [declineReqId, setDeclineReqId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('Vehicle Busy');
  const [declineOtherDetails, setDeclineOtherDetails] = useState<string>('');

  // Live countdown triggers
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Performance insights metrics state
  const [insights, setInsights] = useState({
    todayRequests: 14,
    todayQuotesSent: 8,
    avgResponseTime: '4.2m',
    acceptanceRate: '75%',
    avgQuoteValue: 3450
  });

  // In-app Notifications Toast Feed
  const [notifications, setNotifications] = useState<any[]>([]);

  // Periodic polling & timer interval references
  const pollIntervalRef = useRef<any>(null);
  const timeIntervalRef = useRef<any>(null);

  // Quick templates for operator message
  const messageTemplates = [
    "Pickup from NJP Exit Gate",
    "Driver will contact before arrival.",
    "Parking Included",
    "Toll Included",
    "Waiting Charges Extra",
    "Night Charges Included"
  ];

  // Fetch initial data
  const fetchData = async (showSilently = false) => {
    if (!showSilently) setLoading(true);
    try {
      // Fetch quote requests matching operator user ID
      const reqRes = await fetch(`/api/quote-requests?operatorUserId=${user.id}`);
      const reqJson = await reqRes.json();
      if (reqJson.success) {
        setRequests(reqJson.data || []);
      } else {
        throw new Error(reqJson.error || 'Failed to fetch quote requests.');
      }

      // Fetch operator fleet vehicles
      const vehRes = await fetch(`/api/taxi-operator/vehicles?userId=${user.id}`);
      const vehJson = await vehRes.json();
      if (vehJson.success) {
        setVehicles(vehJson.data || []);
      }
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error occurred while loading inbox details.');
    } finally {
      if (!showSilently) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup periodic polling for live updates (Supabase Realtime emulation)
    pollIntervalRef.current = setInterval(() => {
      fetchData(true);
    }, 8000);

    // Setup timer clock ticker for remaining times
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, [user.id]);

  // Compute stats on requests list update
  useEffect(() => {
    if (requests.length > 0) {
      const quoted = requests.filter(r => r.operatorQuote);
      const totalQuoteValue = quoted.reduce((sum, r) => sum + (Number(r.operatorQuote?.fare) || 0), 0);
      const avgQuoteValue = quoted.length > 0 ? Math.round(totalQuoteValue / quoted.length) : 3450;
      
      setInsights({
        todayRequests: requests.filter(r => {
          const created = new Date(r.created_at);
          const today = new Date();
          return created.getDate() === today.getDate() && created.getMonth() === today.getMonth();
        }).length || 14,
        todayQuotesSent: quoted.length || 8,
        avgResponseTime: '3.8m',
        acceptanceRate: '78%',
        avgQuoteValue: avgQuoteValue || 3450
      });
    }
  }, [requests]);

  // Handle detailed review view
  const handleViewDetails = async (req: any) => {
    setLoadingDetails(true);
    setSelectedReq(req);
    setQuoteSuccess(false);
    setQuoteBuilderError(null);
    setOptionalMessage('');
    
    // Set default builder values
    const smart = calculateSmartFare(req);
    setFareValue(smart.suggestedFare);
    if (vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }

    // Call View Endpoint on backend (Pending -> Viewed)
    try {
      await fetch(`/api/quote-requests/${req.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorUserId: user.id })
      });
      // Update local item immediately
      setRequests(prev => prev.map(item => {
        if (item.id === req.id && item.recipientStatus === 'Pending') {
          return { ...item, recipientStatus: 'Viewed' };
        }
        return item;
      }));
    } catch (e) {
      console.error('Failed to notify view status:', e);
    }

    try {
      const res = await fetch(`/api/quote-requests/${req.id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedReqQuotes(json.data?.quotes || []);
      }
    } catch (e) {
      console.error('Failed to load detail quotes:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Helper: calculate Smart Pricing Assistant details
  const calculateSmartFare = (req: any) => {
    if (!req) return { suggestedFare: 3500, rangeMin: 3200, rangeMax: 4200, isWeekend: false, isPeak: false, isHoliday: false };
    
    // Base route price approximation based on text matching
    let base = 3200;
    const routeText = `${req.pickup_location} ${req.drop_location}`.toLowerCase();
    
    if (routeText.includes('njp') || routeText.includes('siliguri')) {
      if (routeText.includes('darjeeling')) base = 3000;
      else if (routeText.includes('gangtok')) base = 4200;
      else if (routeText.includes('kalimpong')) base = 3500;
      else if (routeText.includes('pelling')) base = 5200;
      else if (routeText.includes('mirik')) base = 2200;
    } else if (routeText.includes('bagdogra')) {
      if (routeText.includes('darjeeling')) base = 3500;
      else if (routeText.includes('gangtok')) base = 4500;
      else if (routeText.includes('kalimpong')) base = 3800;
      else if (routeText.includes('pelling')) base = 5600;
    }

    // Adjustments for passenger count
    const paxMultiplier = req.passenger_count > 4 ? 1.3 : 1.0;
    
    // Adjustments for vehicle preference
    let typeMultiplier = 1.0;
    if (req.vehicle_preference?.toLowerCase().includes('innova') || req.vehicle_preference?.toLowerCase().includes('luxury')) {
      typeMultiplier = 1.4;
    } else if (req.vehicle_preference?.toLowerCase().includes('suv')) {
      typeMultiplier = 1.25;
    }

    let calculatedBase = Math.round(base * paxMultiplier * typeMultiplier);

    // Dynamic indicators
    const travelDate = new Date(req.travel_date);
    const day = travelDate.getDay();
    const isWeekend = day === 0 || day === 5 || day === 6; // Fri, Sat, Sun
    
    const month = travelDate.getMonth(); // 0-indexed
    const isPeak = (month >= 3 && month <= 5) || (month >= 9 && month <= 11); // April-June, Oct-Dec
    
    // Simulated holidays (e.g. Durga Puja, New Year, Christmas, etc.)
    const dateNum = travelDate.getDate();
    const isHoliday = (month === 9 && dateNum >= 1 && dateNum <= 15) || // Oct Durga Puja
                      (month === 11 && dateNum >= 20) || // Dec Xmas
                      (month === 0 && dateNum <= 5); // Jan New Year

    let premium = 1.0;
    if (isWeekend) premium += 0.1;
    if (isPeak) premium += 0.15;
    if (isHoliday) premium += 0.2;

    const suggestedFare = Math.round(calculatedBase * premium);
    const rangeMin = Math.round(suggestedFare * 0.9);
    const rangeMax = Math.round(suggestedFare * 1.18);
    const historicalFare = Math.round(suggestedFare * 0.97);

    return {
      suggestedFare,
      rangeMin,
      rangeMax,
      historicalFare,
      isWeekend,
      isPeak,
      isHoliday
    };
  };

  // Submit quote to server
  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteBuilderError(null);

    // Valdiation
    if (!selectedReq) return;
    if (fareValue <= 0) {
      setQuoteBuilderError("Fare must be a positive number greater than zero.");
      return;
    }
    
    const remainingSeconds = Math.max(0, Math.floor((new Date(selectedReq.expires_at).getTime() - currentTime.getTime()) / 1000));
    if (remainingSeconds <= 0) {
      setQuoteBuilderError("Cannot quote. This travel query request has already expired.");
      return;
    }

    if (selectedReq.operatorQuote) {
      setQuoteBuilderError("You have already sent a quote for this query.");
      return;
    }

    const etaNum = Number(etaValue);
    if (isNaN(etaNum) || etaNum <= 0) {
      setQuoteBuilderError("Please enter a valid estimated pickup ETA in minutes.");
      return;
    }

    setLoadingDetails(true);
    try {
      // Calculate times
      const now = new Date();
      const etaTime = new Date(now.getTime() + etaNum * 60 * 1000).toISOString();
      const validityTime = new Date(now.getTime() + validityMinutes * 60 * 1000).toISOString();

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          operatorUserId: user.id,
          fare: Number(fareValue),
          operatorMessage: optionalMessage,
          vehicleId: selectedVehicleId,
          estimatedPickupTime: etaTime,
          expiryTime: validityTime
        })
      });

      const data = await response.json();
      if (data.success) {
        setQuoteSuccess(true);
        addToastNotification('Quotation Submitted Successfully', `Fare ₹${fareValue} has been sent for trip ID ${selectedReq.id.slice(0,8)}`, 'success');
        
        // Refresh local requests list
        fetchData(true);
        
        // Optimistic update
        setSelectedReq(prev => ({
          ...prev,
          recipientStatus: 'Quoted',
          operatorQuote: {
            id: data.quoteId,
            fare: Number(fareValue),
            operator_message: optionalMessage,
            estimated_pickup_time: etaTime,
            expiry_time: validityTime,
            quote_status: 'pending',
            created_at: new Date().toISOString()
          }
        }));

        // Simulate interactive traveler event 12 seconds later
        setTimeout(() => {
          addToastNotification(
            'Traveller Reviewed Quote', 
            `Your offer of ₹${fareValue} was viewed by traveler ${selectedReq.traveller_name || 'Anupam Roy'}`, 
            'info'
          );
        }, 12000);

      } else {
        throw new Error(data.error || 'Failed to send quotation.');
      }
    } catch (err: any) {
      setQuoteBuilderError(err.message || 'Error occurred while saving quotation.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open Decline dialogue
  const handleOpenDecline = (reqId: string) => {
    setDeclineReqId(reqId);
    setDeclineReason('Vehicle Busy');
    setDeclineOtherDetails('');
    setShowDeclineModal(true);
  };

  // Submit Decline to server
  const handleConfirmDecline = async () => {
    if (!declineReqId) return;

    try {
      const response = await fetch(`/api/quote-requests/${declineReqId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorUserId: user.id,
          reason: declineReason,
          otherReason: declineOtherDetails
        })
      });

      const data = await response.json();
      if (data.success) {
        addToastNotification('Request Declined', 'Trip inquiry declined. The traveler was notified.', 'info');
        setShowDeclineModal(false);
        setDeclineReqId(null);
        if (selectedReq?.id === declineReqId) {
          setSelectedReq(null);
        }
        fetchData(true);
      } else {
        alert(data.error || 'Failed to decline request.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Error occurred while declining request.');
    }
  };

  // Notification helper
  const addToastNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // Helper: calculate remaining seconds
  const getRemainingSeconds = (expiresAtStr: string) => {
    const exp = new Date(expiresAtStr).getTime();
    const curr = currentTime.getTime();
    return Math.max(0, Math.floor((exp - curr) / 1000));
  };

  // Helper: format time countdown
  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return "Expired";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Filter & Search Logic
  const filteredRequests = requests.filter(r => {
    // 1. Search Query mapping
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const matchesId = r.id.toLowerCase().includes(query);
      const matchesPickup = r.pickup_location.toLowerCase().includes(query);
      const matchesDrop = r.drop_location.toLowerCase().includes(query);
      const matchesTraveler = r.traveller_name?.toLowerCase().includes(query) || false;
      const matchesPref = r.vehicle_preference?.toLowerCase().includes(query) || false;
      
      if (!matchesId && !matchesPickup && !matchesDrop && !matchesTraveler && !matchesPref) {
        return false;
      }
    }

    // 2. Tab Filter mapping
    const isExpired = getRemainingSeconds(r.expires_at) <= 0;
    const recStatus = r.recipientStatus; // Pending, Viewed, Quoted, Declined, Expired, Not Selected

    if (selectedTab === 'new') {
      if ((recStatus !== 'Pending' && recStatus !== 'Viewed') || isExpired || r.operatorQuote) return false;
    } else if (selectedTab === 'viewed') {
      if (recStatus !== 'Viewed' || isExpired || r.operatorQuote) return false;
    } else if (selectedTab === 'quoted') {
      if (!r.operatorQuote) return false;
    } else if (selectedTab === 'declined') {
      if (recStatus !== 'Declined') return false;
    } else if (selectedTab === 'expired') {
      if (!isExpired && recStatus !== 'Expired') return false;
    } else if (selectedTab === 'accepted') {
      // If operatorQuote status is accepted
      if (r.operatorQuote?.quote_status !== 'accepted') return false;
    } else if (selectedTab === 'not_selected') {
      if (r.operatorQuote?.quote_status !== 'not_selected' && recStatus !== 'Not Selected') return false;
    }

    // 3. Collapsible Advanced Filters
    if (filterPickup && !r.pickup_location.toLowerCase().includes(filterPickup.toLowerCase().trim())) return false;
    if (filterDrop && !r.drop_location.toLowerCase().includes(filterDrop.toLowerCase().trim())) return false;
    
    if (filterVehiclePref !== 'Any' && r.vehicle_preference) {
      if (!r.vehicle_preference.toLowerCase().includes(filterVehiclePref.toLowerCase())) return false;
    }

    // Pricing filter
    const smart = calculateSmartFare(r);
    if (filterMinFare && smart.suggestedFare < Number(filterMinFare)) return false;
    if (filterMaxFare && smart.suggestedFare > Number(filterMaxFare)) return false;

    return true;
  });

  // Calculate unread badge count for Sidebar menu (New / Pending matches)
  const unreadCount = requests.filter(r => {
    const isExpired = getRemainingSeconds(r.expires_at) <= 0;
    return (r.recipientStatus === 'Pending' || r.recipientStatus === 'Viewed') && !isExpired && !r.operatorQuote;
  }).length;

  return (
    <div className="space-y-6">
      {/* Toast notifications rendering */}
      <div className="fixed top-5 right-5 z-50 space-y-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex items-start gap-3"
            >
              {notif.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : notif.type === 'info' ? (
                <Zap className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-slate-300">{notif.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="text-slate-500 hover:text-slate-300 transition-colors ml-auto shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/15 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20 uppercase tracking-widest font-mono">
              Live Matching Engine
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h2 className="text-xl font-black tracking-tight md:text-2xl">Operator Quote Inbox</h2>
          <p className="text-slate-400 text-xs max-w-xl">
            Bid on active traveler requests matching your services across Himalayan corridor transit lines. Receive instant notifications and build intelligent fare estimates.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button 
            onClick={() => fetchData()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 font-bold px-4 py-2.5 rounded-xl border border-slate-700/60 transition-all cursor-pointer"
          >
            Refresh Queries
          </button>
        </div>
      </div>

      {/* Performance Insights Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Today's Queries", value: insights.todayRequests, icon: FileText, color: "text-blue-500", bg: "bg-blue-50/50" },
          { label: "Quotes Sent", value: insights.todayQuotesSent, icon: Send, color: "text-emerald-500", bg: "bg-emerald-50/50" },
          { label: "Avg Response", value: insights.avgResponseTime, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50/50" },
          { label: "Win Rate", value: insights.acceptanceRate, icon: Award, color: "text-amber-500", bg: "bg-amber-50/50" },
          { label: "Avg Quote", value: `₹${insights.avgQuoteValue.toLocaleString()}`, icon: DollarSign, color: "text-purple-500", bg: "bg-purple-50/50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{stat.label}</p>
              <p className="text-base font-black text-slate-800 leading-none mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Search panel */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search route, traveller, request ID, vehicle preference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-300 focus:ring-0 text-xs font-medium pl-10 pr-4 py-2.5 rounded-2xl transition-all outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer w-full md:w-auto justify-center ${showFilters ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
          </button>
        </div>

        {/* Collapsible Filters block */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-50 pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-1">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Pickup Corridor</label>
                  <input 
                    type="text" 
                    placeholder="e.g. NJP Station"
                    value={filterPickup}
                    onChange={(e) => setFilterPickup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Destination</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Darjeeling"
                    value={filterDrop}
                    onChange={(e) => setFilterDrop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Vehicle Type</label>
                  <select
                    value={filterVehiclePref}
                    onChange={(e) => setFilterVehiclePref(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 text-xs font-semibold px-3 py-2 rounded-xl outline-none"
                  >
                    <option value="Any">Any Preference</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV / Sumo / Bolero</option>
                    <option value="Luxury">Luxury (Innova Crysta)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono">Suggested Price Range</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min ₹"
                      value={filterMinFare}
                      onChange={(e) => setFilterMinFare(e.target.value)}
                      className="w-1/2 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none"
                    />
                    <span className="text-slate-300 text-xs font-black">-</span>
                    <input 
                      type="number" 
                      placeholder="Max ₹"
                      value={filterMaxFare}
                      onChange={(e) => setFilterMaxFare(e.target.value)}
                      className="w-1/2 bg-slate-50 border border-slate-100 focus:bg-white focus:border-slate-200 text-xs font-semibold px-3 py-2 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-3">
                <button
                  onClick={() => {
                    setFilterPickup('');
                    setFilterDrop('');
                    setFilterVehiclePref('Any');
                    setFilterMinFare('');
                    setFilterMaxFare('');
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-bold"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs strip */}
      <div className="flex overflow-x-auto scrollbar-none gap-2 pb-1">
        {[
          { id: 'all', label: 'All Requests' },
          { id: 'new', label: 'New / Live', count: unreadCount },
          { id: 'viewed', label: 'Viewed' },
          { id: 'quoted', label: 'Quoted' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'declined', label: 'Declined' },
          { id: 'expired', label: 'Expired' },
          { id: 'not_selected', label: 'Not Selected' }
        ].map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-600'}`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-sky-500 text-white' : 'bg-red-500 text-white'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Inbox Body Grid */}
      {loading ? (
        // Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-150 rounded w-1/3"></div>
                <div className="h-4 bg-slate-150 rounded w-1/4"></div>
              </div>
              <div className="h-7 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-slate-150 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Error Loading Quote Requests</h4>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">No Requests Found</h4>
          <p className="text-xs text-slate-500 leading-relaxed mt-2">
            No Himalayan traveler inquiries match the selected tab category or filters currently.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((req) => {
            const remainingSecs = getRemainingSeconds(req.expires_at);
            const isExpired = remainingSecs <= 0;
            const smart = calculateSmartFare(req);

            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm relative ${req.recipientStatus === 'Pending' ? 'border-sky-400 shadow-md ring-1 ring-sky-100' : 'border-slate-100 hover:shadow-md'}`}
              >
                {/* Visual Accent for New Pending Queries */}
                {req.recipientStatus === 'Pending' && (
                  <span className="absolute top-0 left-0 right-0 h-1 bg-sky-400"></span>
                )}

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                        Query ID: {req.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        By traveler: <strong className="text-slate-700 font-bold">{req.traveller_name || 'Anupam Roy'}</strong>
                      </p>
                    </div>

                    {/* Status pill mapping */}
                    <div className="flex flex-col items-end gap-1.5">
                      {isExpired ? (
                        <span className="bg-red-50 text-red-600 text-[9px] font-black font-mono border border-red-200 px-2 py-0.5 rounded-lg uppercase">
                          Expired
                        </span>
                      ) : req.operatorQuote ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black font-mono border border-emerald-200 px-2 py-0.5 rounded-lg uppercase">
                          Quoted (₹{req.operatorQuote.fare})
                        </span>
                      ) : req.recipientStatus === 'Declined' ? (
                        <span className="bg-slate-100 text-slate-600 text-[9px] font-black font-mono border border-slate-200 px-2 py-0.5 rounded-lg uppercase">
                          Declined
                        </span>
                      ) : (
                        <span className="bg-sky-50 text-sky-700 text-[9px] font-black font-mono border border-sky-200 px-2 py-0.5 rounded-lg uppercase animate-pulse">
                          Live Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Journey details header */}
                  <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-xs text-slate-800 font-bold">
                        <p className="flex items-center gap-1 text-[11px] font-mono text-slate-400 uppercase leading-none">Pickup</p>
                        <p className="text-slate-800 leading-tight">{req.pickup_location}</p>
                      </div>
                    </div>
                    <div className="pl-6 border-l-2 border-dashed border-slate-200 ml-2 py-1">
                      <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-xs text-slate-800 font-bold">
                        <p className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 uppercase leading-none">Destination</p>
                        <p className="text-indigo-900 leading-tight">{req.drop_location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Journey parameters grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="flex items-center gap-2 text-slate-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.travel_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.pickup_time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-semibold">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.passenger_count} Pax {req.luggage > 0 ? `(${req.luggage} bags)` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-semibold">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Pref: {req.vehicle_preference || 'Any'}</span>
                    </div>
                  </div>

                  {/* Distance estimation & Travel Notes */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] uppercase font-bold text-slate-400 font-mono">
                    <div>
                      Est. Distance: <strong className="text-slate-700 font-mono">~72 km</strong>
                    </div>
                    <div>
                      Travel Time: <strong className="text-slate-700 font-mono">~3.5 hrs</strong>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-slate-500 italic bg-amber-50/40 p-2.5 rounded-xl border border-dashed border-amber-100">
                      &ldquo;{req.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card footer actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Countdown Timer */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                    <div className="space-y-0.5 leading-none">
                      <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Time Remaining</p>
                      <p className={`text-xs font-mono font-black ${isExpired ? 'text-slate-400' : 'text-rose-600'}`}>
                        {isExpired ? 'Expired' : formatCountdown(remainingSecs)}
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Decline */}
                    {!isExpired && !req.operatorQuote && req.recipientStatus !== 'Declined' && (
                      <button
                        onClick={() => handleOpenDecline(req.id)}
                        className="border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Decline
                      </button>
                    )}

                    {/* Submit bid quote */}
                    {!isExpired && !req.operatorQuote && req.recipientStatus !== 'Declined' ? (
                      <button
                        onClick={() => handleViewDetails(req)}
                        className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <span>Send Quote</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewDetails(req)}
                        className="border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Decline Dialog Modal */}
      <AnimatePresence>
        {showDeclineModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-base font-black text-slate-800">Decline Bidding Query</h4>
                <button 
                  onClick={() => setShowDeclineModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Declining this query removes it from your inbox. This action remains confidential. Admin monitors decline patterns, but travelers are only told that the request was declined.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Select Decline Reason</label>
                  <select
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Vehicle Busy">Vehicle Busy</option>
                    <option value="Driver Unavailable">Driver Unavailable</option>
                    <option value="Unable to Operate">Unable to Operate Corridor</option>
                    <option value="Peak Season">Peak Season Congestion</option>
                    <option value="Other">Other / Custom reason</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Additional Details (Optional - Admin Only)</label>
                  <textarea
                    rows={2}
                    value={declineOtherDetails}
                    onChange={(e) => setDeclineOtherDetails(e.target.value)}
                    placeholder="Provide context for our dispatch metrics report..."
                    className="w-full bg-slate-50 border border-slate-100 text-xs font-medium p-3 rounded-xl outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="border border-slate-100 hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDecline}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Decline Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over details & smart quote builder modal panel */}
      <AnimatePresence>
        {selectedReq && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex justify-end">
            {/* Backdrop close */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setSelectedReq(null)}
            ></div>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-4xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col justify-between z-10 border-l border-slate-100"
            >
              {/* Slide-over Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-10">
                <div>
                  <p className="text-[10px] font-bold text-sky-400 font-mono uppercase tracking-wider">
                    Smart Match Quotation Assistant
                  </p>
                  <h3 className="text-base font-black">
                    Query ID: {selectedReq.id.slice(0, 8)}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Panel Body */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
                {/* Left Column: Journey Information + Smart pricing panel */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Journey Specifications Card */}
                  <div className="bg-white rounded-3xl border border-slate-150 p-5 space-y-4 shadow-xs">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                      Journey Details
                    </h4>

                    {/* Pickup / drop route line */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-xs text-slate-800">
                          <p className="text-[9px] font-mono text-slate-400 uppercase font-bold leading-none">Pickup Corridor</p>
                          <p className="font-bold">{selectedReq.pickup_location}</p>
                        </div>
                      </div>
                      <div className="pl-6 border-l-2 border-dashed border-slate-200 ml-2 py-0.5"></div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-xs text-slate-800">
                          <p className="text-[9px] font-mono text-indigo-400 uppercase font-bold leading-none">Destination</p>
                          <p className="font-bold text-indigo-900">{selectedReq.drop_location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-50">
                        <span className="text-slate-400 font-medium">Travel Date</span>
                        <span className="font-bold text-slate-800">{selectedReq.travel_date}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50">
                        <span className="text-slate-400 font-medium">Pickup Time</span>
                        <span className="font-bold text-slate-800">{selectedReq.pickup_time}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50">
                        <span className="text-slate-400 font-medium">Passenger Count</span>
                        <span className="font-bold text-slate-800">{selectedReq.passenger_count} Pax</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50">
                        <span className="text-slate-400 font-medium">Luggage Count</span>
                        <span className="font-bold text-slate-800">{selectedReq.luggage || 0} Bags</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50">
                        <span className="text-slate-400 font-medium">Vehicle Preference</span>
                        <span className="font-bold text-indigo-600">{selectedReq.vehicle_preference || 'Any Vehicle'}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400 font-medium">Created Time</span>
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          {new Date(selectedReq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {selectedReq.notes && (
                      <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-dashed border-amber-100">
                        <p className="text-[9px] font-mono uppercase font-bold text-amber-600 leading-none mb-1">Traveller Instructions</p>
                        <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{selectedReq.notes}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  {/* Smart Fare Panel (Pricing Assistant) */}
                  <div className="bg-slate-50 rounded-3xl border border-slate-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-sky-500 shrink-0" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono leading-none">
                          Smart Pricing Assistant
                        </h4>
                      </div>
                      <span className="text-[9px] bg-sky-100 text-sky-800 font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded-full">
                        AI Guidance
                      </span>
                    </div>

                    {/* Calculated metrics */}
                    {(() => {
                      const pricing = calculateSmartFare(selectedReq);
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-2xl border border-slate-100">
                              <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Suggested Fare</p>
                              <p className="text-lg font-black text-slate-800">₹{pricing.suggestedFare.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-3 rounded-2xl border border-slate-100">
                              <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Avg Historical Fare</p>
                              <p className="text-lg font-black text-slate-500">₹{pricing.historicalFare.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="space-y-1 bg-white p-3.5 rounded-2xl border border-slate-100">
                            <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Typical Market Range</p>
                            <p className="text-xs text-slate-800 font-black">
                              ₹{pricing.rangeMin.toLocaleString()} &ndash; ₹{pricing.rangeMax.toLocaleString()}
                            </p>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2 relative">
                              <div className="absolute top-0 bottom-0 left-[25%] right-[25%] bg-sky-400 rounded-full"></div>
                              <span className="absolute top-0 left-[55%] w-1.5 h-1.5 bg-slate-900 rounded-full border border-white"></span>
                            </div>
                          </div>

                          {/* Indicators tags */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className={`text-[9px] font-black font-mono uppercase px-2 py-1 rounded-lg border ${pricing.isWeekend ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                              Weekend Rate {pricing.isWeekend ? '+10%' : 'Normal'}
                            </span>
                            <span className={`text-[9px] font-black font-mono uppercase px-2 py-1 rounded-lg border ${pricing.isPeak ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                              Peak Season {pricing.isPeak ? '+15%' : 'Normal'}
                            </span>
                            <span className={`text-[9px] font-black font-mono uppercase px-2 py-1 rounded-lg border ${pricing.isHoliday ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                              Holiday Rate {pricing.isHoliday ? '+20%' : 'Normal'}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed">
                            Disclaimer: Suggested price and indices are calculated dynamically based on historical corridor indices. Never display other operators' live quotations. Secure matching protocols protect marketplace privacy.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Right Column: Intelligent Quote Builder Form */}
                <div className="lg:col-span-7 space-y-6">
                  {quoteSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-150 rounded-3xl p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Check className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-black text-slate-800">Quotation Sent!</h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                        Your bid has been broadcasted. The traveler will receive an in-app notification instantly. Keep tracking the Quote Requests tab to monitor status updates in real-time.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => setSelectedReq(null)}
                          className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          Close Details Panel
                        </button>
                      </div>
                    </div>
                  ) : selectedReq.operatorQuote ? (
                    // Quoted details view
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-5">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        <h4 className="text-sm font-black text-slate-800">Quotation Already Submitted</h4>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Your Fare Offer</p>
                            <p className="text-2xl font-black text-slate-800">₹{selectedReq.operatorQuote.fare}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Status</p>
                            <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-black font-mono border border-amber-200 px-2.5 py-1 rounded-lg uppercase mt-1">
                              Pending Traveler Review
                            </span>
                          </div>
                        </div>

                        {selectedReq.operatorQuote.operator_message && (
                          <div className="border-t border-slate-50 pt-3">
                            <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Quotation Message</p>
                            <p className="text-xs text-slate-600 italic mt-1 leading-relaxed">
                              &ldquo;{selectedReq.operatorQuote.operator_message}&rdquo;
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3 text-xs text-slate-500">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Estimated Pick-up ETA</p>
                            <p className="font-bold text-slate-700">~30 Minutes</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-slate-400 font-mono">Quote Expiry</p>
                            <p className="font-bold text-slate-700">Valid for 20 Minutes</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedReq(null)}
                          className="border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                        >
                          Back to Inbox
                        </button>
                      </div>
                    </div>
                  ) : selectedReq.recipientStatus === 'Declined' ? (
                    <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <X className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-black text-red-800">You Declined This Query</h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                        This bidding query is set to declined. No proposals can be built for this request unless re-instated.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => setSelectedReq(null)}
                          className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all"
                        >
                          Back to Inbox
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Build quotation form
                    <form onSubmit={handleSendQuote} className="bg-white rounded-3xl border border-slate-150 p-6 space-y-5 shadow-xs">
                      <div className="border-b border-slate-50 pb-3">
                        <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                          <Compass className="w-5 h-5 text-sky-500" />
                          <span>Intelligent Quote Builder</span>
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">
                          Prepare and send a professional quotation matching requested parameters instantly.
                        </p>
                      </div>

                      {quoteBuilderError && (
                        <div className="bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-xl text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{quoteBuilderError}</span>
                        </div>
                      )}

                      {/* Inputs Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            <span>Your Fare offer</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">₹</span>
                            <input
                              type="number"
                              required
                              value={fareValue || ''}
                              onChange={(e) => setFareValue(Number(e.target.value))}
                              placeholder="Enter bid amount"
                              className="w-full bg-slate-50 border border-slate-150 focus:bg-white focus:border-slate-300 text-xs font-black pl-8 pr-4 py-2.5 rounded-xl outline-none"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 italic">Adjust recommended fare accordingly</p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            <span>Assign Fleet Vehicle</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedVehicleId}
                            onChange={(e) => setSelectedVehicleId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-150 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none"
                          >
                            {vehicles.length === 0 ? (
                              <option value="">No Active Vehicles Found</option>
                            ) : (
                              vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.vehicle_name} ({v.plate_number}) - {v.vehicle_type}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            <span>Estimated Pickup ETA (Minutes)</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            value={etaValue}
                            onChange={(e) => setEtaValue(e.target.value)}
                            placeholder="e.g. 30"
                            className="w-full bg-slate-50 border border-slate-150 focus:bg-white focus:border-slate-300 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Quote Validity duration</label>
                          <select
                            value={validityMinutes}
                            onChange={(e) => setValidityMinutes(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-150 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none"
                          >
                            <option value={10}>10 Minutes</option>
                            <option value={20}>20 Minutes (Default)</option>
                            <option value={30}>30 Minutes</option>
                            <option value={60}>1 Hour</option>
                            <option value={180}>3 Hours</option>
                          </select>
                        </div>
                      </div>

                      {/* Optional message and template keywords */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Optional message to traveler</label>
                        <textarea
                          rows={3}
                          value={optionalMessage}
                          onChange={(e) => setOptionalMessage(e.target.value)}
                          placeholder="Introduce your service details or clarify terms..."
                          className="w-full bg-slate-50 border border-slate-150 text-xs font-medium p-3.5 rounded-xl outline-none resize-none"
                        />

                        {/* Templates */}
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Quick Message Templates</p>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {messageTemplates.map((tmpl, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  if (optionalMessage) {
                                    setOptionalMessage(prev => prev + `, ${tmpl}`);
                                  } else {
                                    setOptionalMessage(tmpl);
                                  }
                                }}
                                className="text-[10px] font-bold font-sans bg-slate-50 hover:bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              >
                                {tmpl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Submit Actions */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-50">
                        <button
                          type="button"
                          onClick={() => setSelectedReq(null)}
                          className="border border-slate-100 hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loadingDetails}
                          className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {loadingDetails ? (
                            <span>Sending Quote...</span>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit Quotation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
