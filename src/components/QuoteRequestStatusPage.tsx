import React, { useState, useEffect } from 'react';
import { 
  Clock, ArrowLeft, Calendar, Users, Briefcase, Car, MapPin, 
  FileText, AlertCircle, RefreshCw, X, Sparkles, CheckCircle, 
  Shield, Star, Award, Zap, DollarSign, Info, SlidersHorizontal,
  ThumbsUp, Timer, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import { User } from '../types';
import PublicOperatorProfile from './PublicOperatorProfile';

interface QuoteRequestStatusPageProps {
  requestId: string;
  navigate: (path: string) => void;
  user?: User | null;
}

const calculateQuotesWithRecommendations = (quotes: any[], settings: any) => {
  if (!quotes || quotes.length === 0) return [];
  
  const weights = settings?.weights || {
    fare: 0.30,
    operatorRating: 0.20,
    responseTime: 0.15,
    acceptanceRate: 0.10,
    completedTrips: 0.10,
    operatorVerification: 0.05,
    vehicleMatch: 0.05,
    estimatedPickupTime: 0.05
  };

  // 1. Find min and max for fare, responseTime, etaMinutes
  const fares = quotes.map(q => Number(q.fare) || 1000);
  const minFare = Math.min(...fares);
  const maxFare = Math.max(...fares);

  const responseTimes = quotes.map(q => Number(q.responseTime) || 10);
  const minResponse = Math.min(...responseTimes);
  const maxResponse = Math.max(...responseTimes);

  const etas = quotes.map(q => Number(q.etaMinutes) || 30);
  const minEta = Math.min(...etas);
  const maxEta = Math.max(...etas);

  // 2. Score each quote
  const scoredQuotes = quotes.map(quote => {
    // Fare score (lower is better, if min = max -> 100)
    const fareScore = maxFare === minFare ? 100 : 100 * (1 - (quote.fare - minFare) / (maxFare - minFare));
    
    // Rating score (4.0 to 5.0 -> 0 to 100)
    const rating = quote.operatorRating || 4.5;
    const ratingScore = Math.max(0, Math.min(100, ((rating - 3.5) / 1.5) * 100));

    // Response time score (lower is better)
    const responseTime = quote.responseTime || 10;
    const responseTimeScore = maxResponse === minResponse ? 100 : 100 * (1 - (responseTime - minResponse) / (maxResponse - minResponse));

    // Acceptance rate score (already 0-100)
    const acceptanceRateScore = quote.acceptanceRate || 80;

    // Completed trips score (max out at 250 trips)
    const completedTrips = quote.completedTrips || 50;
    const completedTripsScore = Math.min(100, (completedTrips / 250) * 100);

    // Operator verification
    const verificationScore = quote.isVerified ? 100 : 50;

    // Vehicle match
    const vehicleMatchScore = quote.isVehicleMatch ? 100 : 40;

    // ETA score (lower is better)
    const eta = quote.etaMinutes || 30;
    const etaScore = maxEta === minEta ? 100 : 100 * (1 - (eta - minEta) / (maxEta - minEta));

    // Calculate overall weighted recommendation score
    const totalScore = (
      (fareScore * weights.fare) +
      (ratingScore * weights.operatorRating) +
      (responseTimeScore * weights.responseTime) +
      (acceptanceRateScore * weights.acceptanceRate) +
      (completedTripsScore * weights.completedTrips) +
      (verificationScore * weights.operatorVerification) +
      (vehicleMatchScore * weights.vehicleMatch) +
      (etaScore * weights.estimatedPickupTime)
    );

    return {
      ...quote,
      _totalScore: totalScore,
      _metrics: {
        fareScore,
        ratingScore,
        responseTimeScore,
        acceptanceRateScore,
        completedTripsScore,
        verificationScore,
        vehicleMatchScore,
        etaScore
      }
    };
  });

  // 3. Find specific badge winners
  // Find max score
  let maxScore = -1;
  let recommendedId = '';
  scoredQuotes.forEach(q => {
    if (q._totalScore > maxScore) {
      maxScore = q._totalScore;
      recommendedId = q.id;
    }
  });

  // Find lowest fare
  let lowestFare = Infinity;
  let bestValueId = '';
  scoredQuotes.forEach(q => {
    if (q.fare < lowestFare) {
      lowestFare = q.fare;
      bestValueId = q.id;
    }
  });

  // Find fastest response
  let fastestTime = Infinity;
  let fastestResponseId = '';
  scoredQuotes.forEach(q => {
    if ((q.responseTime || 10) < fastestTime) {
      fastestTime = q.responseTime || 10;
      fastestResponseId = q.id;
    }
  });

  // Attach badges & explanation texts
  return scoredQuotes.map(q => {
    const badges: { type: string; label: string; icon: string; desc: string }[] = [];

    if (q.id === recommendedId) {
      badges.push({
        type: 'recommended',
        label: '⭐ Recommended',
        icon: 'Star',
        desc: `This quotation offers the absolute best balanced match for your trip on this corridor. It features a superior operator rating of ${q.operatorRating}★, a quick response time of ${q.responseTime}m, and a highly competitive fare of ₹${q.fare}.`
      });
    } else if (q.id === bestValueId) {
      badges.push({
        type: 'value',
        label: '💰 Best Value',
        icon: 'DollarSign',
        desc: `This flat rate of ₹${q.fare} is the most economical bid received, helping you stick to your budget without compromising travel details.`
      });
    }

    if (q.id === fastestResponseId && q.responseTime <= 8) {
      badges.push({
        type: 'fastest',
        label: '⚡ Fastest Response',
        icon: 'Zap',
        desc: `This operator calculated your quote in a mere ${q.responseTime} minutes, demonstrating unparalleled promptness.`
      });
    }

    if (q.operatorRating >= 4.8) {
      badges.push({
        type: 'top_rated',
        label: '🏆 Top Rated',
        icon: 'Award',
        desc: `This operator has established a near-perfect rating of ${q.operatorRating}★ based on real customer feedback.`
      });
    }

    if (q.completedTrips >= 150 && q.isVerified) {
      badges.push({
        type: 'trusted',
        label: '🛡️ Trusted Operator',
        icon: 'Shield',
        desc: `A premier local fleet with over ${q.completedTrips} successfully completed rides and an Approved verification badge.`
      });
    }

    return {
      ...q,
      badges,
      recommendedExplanation: q.id === recommendedId 
        ? `Best overall balance of price, speed, and safety factors. Highly recommended for this specific route.` 
        : `Meets high standard matching parameters with clear price of ₹${q.fare}.`
    };
  });
};

export default function QuoteRequestStatusPage({
  requestId,
  navigate,
  user
}: QuoteRequestStatusPageProps) {
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('20:00');
  const [isCancelled, setIsCancelled] = useState(false);
  const [viewProfileOperatorId, setViewProfileOperatorId] = useState<string | null>(null);
  
  // Smart recommendation states
  const [settings, setSettings] = useState<any>(null);
  const [sortOption, setSortOption] = useState<string>('recommended');
  const [selectedExplanationQuoteId, setSelectedExplanationQuoteId] = useState<string | null>(null);
  const [showConfigPreview, setShowConfigPreview] = useState<boolean>(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/recommendation/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSettings(data.data);
        }
      }
    } catch (e) {
      console.error('Error fetching recommendation settings:', e);
    }
  };

  const fetchRequestDetails = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch(`/api/quote-requests/${requestId}`);
      if (!response.ok) {
        throw new Error('Failed to load request details.');
      }
      const data = await response.json();
      if (data.success && data.data) {
        setRequest(data.data);
        if (data.data.request_status === 'cancelled') {
          setIsCancelled(true);
        }
      } else {
        throw new Error('Quote request not found.');
      }
    } catch (err: any) {
      console.error('[QuoteRequestStatus] Fetch failed:', err);
      setError(err.message || 'Could not load details.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Poll for live quotes in real-time
  useEffect(() => {
    fetchRequestDetails(true);

    const pollInterval = setInterval(() => {
      fetchRequestDetails(false);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [requestId]);

  // Handle countdown timer
  useEffect(() => {
    if (!request?.expires_at || request?.request_status === 'cancelled') return;

    const timer = setInterval(() => {
      const expiry = new Date(request.expires_at).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [request]);

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this quote request? Matching operators will be notified.')) {
      return;
    }

    try {
      const response = await fetch(`/api/quote-requests/${requestId}/cancel`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Cancellation failed.');
      
      setIsCancelled(true);
      await fetchRequestDetails(false);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel request.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-white bg-[#030d07] min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">Establishing secure pathfinding link...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-white bg-[#030d07] min-h-screen flex flex-col justify-center items-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold uppercase tracking-wider text-rose-400">Request Not Found</h2>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          The requested quote request has either expired or does not exist on the tactical grid.
        </p>
        <button
          onClick={() => navigate('#/routes')}
          className="mt-6 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-widest uppercase rounded-xl transition duration-150 cursor-pointer"
        >
          Back to Routes Discovery
        </button>
      </div>
    );
  }

  const isExpired = timeLeft === 'Expired';
  const hasQuotes = request.quotes && request.quotes.length > 0;

  return (
    <div className="min-h-screen bg-[#030d07] text-white py-12 px-4 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button
            onClick={() => navigate('#/my-quote-requests')}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 font-mono uppercase tracking-widest transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Quote History</span>
          </button>
          
          <div className="bg-[#05120c] border border-emerald-500/15 rounded-2xl px-4 py-1.5 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCancelled || isExpired ? 'bg-rose-500' : 'bg-emerald-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isCancelled || isExpired ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-300">
              {isCancelled ? 'CANCELLED' : isExpired ? 'EXPIRED' : 'ACTIVE LIVE BROADCAST'}
            </span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          
          {/* Column 1: Request Specifications Card */}
          <div className="bg-[#05120c] border border-emerald-500/10 rounded-3xl p-6 shadow-xl space-y-6 h-fit">
            <div>
              <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono uppercase">BROADCAST SPECIFICATIONS</span>
              <h2 className="text-lg font-black text-white mt-1 uppercase tracking-wide">Trip Details</h2>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-white">Pickup Location</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{request.pickup_location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-white">Drop Location</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{request.drop_location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-900 pt-3">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex justify-between w-full">
                  <span className="font-medium text-slate-400">Journey Date:</span>
                  <span className="font-bold text-white">{request.travel_date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-900 pt-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex justify-between w-full">
                  <span className="font-medium text-slate-400">Pickup Time:</span>
                  <span className="font-bold text-white">{request.pickup_time}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-900 pt-3">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex justify-between w-full">
                  <span className="font-medium text-slate-400">Passengers:</span>
                  <span className="font-bold text-white">{request.passenger_count} Pax</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-900 pt-3">
                <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex justify-between w-full">
                  <span className="font-medium text-slate-400">Luggage Limit:</span>
                  <span className="font-bold text-white">{request.luggage} Bags</span>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-900 pt-3">
                <Car className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex justify-between w-full">
                  <span className="font-medium text-slate-400">Car Class Pref:</span>
                  <span className="font-bold text-white">{request.vehicle_preference}</span>
                </div>
              </div>

              {request.notes && (
                <div className="border-t border-slate-900 pt-3 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    Special Notes:
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed italic">"{request.notes}"</p>
                </div>
              )}
            </div>

            {request.request_status === 'pending' && !isCancelled && !isExpired && (
              <button
                onClick={handleCancelRequest}
                className="w-full py-2.5 bg-slate-950 hover:bg-rose-950/20 border border-slate-900 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel Broadcaster
              </button>
            )}
          </div>

          {/* Column 2 & 3: Live Quotes Status Console */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Radar Banner */}
            <div className="bg-[#05120c] border border-emerald-500/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-emerald-400 tracking-widest block font-mono uppercase">LIVE STATUS TELEMETRY</span>
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  {isCancelled ? 'Broadcast Stopped' : isExpired ? 'Broadcast Terminated' : 'Broadcasting Live'}
                </h3>
                <p className="text-slate-400 text-xs">
                  {isCancelled 
                    ? 'This request has been cancelled and operators were notified.' 
                    : isExpired 
                      ? 'The 20-minute matching window has expired. You can retry anytime.' 
                      : `Scanning and routing path to all verified taxi operators covering ${request.pickup_location}.`}
                </p>
              </div>

              {/* Countdown Timer Display */}
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl w-full md:w-auto flex flex-col items-center justify-center shrink-0 min-w-[120px]">
                <span className="text-[9px] font-bold text-slate-500 tracking-widest font-mono uppercase">TIME REMAINING</span>
                <span className={`text-2xl font-black font-mono mt-1 ${isCancelled || isExpired ? 'text-slate-500' : 'text-emerald-400'}`}>
                  {isCancelled ? '--:--' : timeLeft}
                </span>
              </div>
            </div>

            {/* Live Quotes List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                  <span>LIVE OFFERS RECIEVED</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
                    {request.quoteCount || 0}
                  </span>
                </h3>

                {!isCancelled && !isExpired && (
                  <button
                    onClick={() => fetchRequestDetails(true)}
                    className="p-1 text-slate-500 hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                )}
              </div>

              {/* No quotes yet */}
              {!hasQuotes && !isCancelled && !isExpired && (
                <div className="bg-[#05120c] border border-emerald-500/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                  {/* Dynamic Radar Sweeper Widget */}
                  <div className="relative w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center border border-emerald-500/10 animate-pulse">
                    <span className="absolute inset-2 border border-emerald-500/10 rounded-full animate-ping"></span>
                    <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="font-bold text-white uppercase text-xs tracking-wider">Awaiting Operator Bids...</p>
                    <p className="text-slate-400 text-xs leading-normal">
                      Intelligent dispatching complete. Active operators are calculating tactical fares based on road status and elevations. Offers will appear here dynamically.
                    </p>
                  </div>
                </div>
              )}

              {/* Cancelled/Expired empty state */}
              {!hasQuotes && (isCancelled || isExpired) && (
                <div className="bg-[#05120c] border border-slate-900 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-600" />
                  <p className="font-bold text-slate-400 uppercase text-xs tracking-wider">No Quotes Available</p>
                  <p className="text-slate-500 text-xs max-w-xs leading-normal">
                    This request is inactive. Create a new broadcast to get live competitive bids from operators.
                  </p>
                  <button
                    onClick={() => navigate('#/routes')}
                    className="mt-2 px-4 py-2 bg-slate-950 border border-slate-900 hover:border-emerald-500/20 hover:text-white rounded-xl text-xs text-slate-400 font-bold uppercase transition tracking-wider cursor-pointer"
                  >
                    Explore Routes
                  </button>
                </div>
              )}

              {/* Intelligent Weights Tuning Panel */}
              {settings && hasQuotes && (
                <div className="bg-[#05120c] border border-emerald-500/10 rounded-3xl p-5 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Smart Matching Algorithm (Settings Active)</span>
                    </div>
                    <button 
                      onClick={() => setShowConfigPreview(!showConfigPreview)}
                      className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1 uppercase cursor-pointer"
                    >
                      <span>{showConfigPreview ? "Hide Model Details" : "Inspect Multi-Factor Weights"}</span>
                      {showConfigPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  
                  {showConfigPreview && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-900/50 text-xs">
                      <div>
                        <p className="text-slate-500 font-mono text-[9px] uppercase">Fare Weight</p>
                        <p className="font-bold text-white font-mono mt-0.5">{((settings.weights?.fare || 0.30) * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-mono text-[9px] uppercase">Operator Rating</p>
                        <p className="font-bold text-white font-mono mt-0.5">{((settings.weights?.operatorRating || 0.20) * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-mono text-[9px] uppercase">Response Speed</p>
                        <p className="font-bold text-white font-mono mt-0.5">{((settings.weights?.responseTime || 0.15) * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-mono text-[9px] uppercase">Acceptance Rate</p>
                        <p className="font-bold text-white font-mono mt-0.5">{((settings.weights?.acceptanceRate || 0.10) * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-mono text-[9px] uppercase">Completed Rides</p>
                        <p className="font-bold text-white font-mono mt-0.5">{((settings.weights?.completedTrips || 0.10) * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-mono text-[9px] uppercase">Operator Verification</p>
                        <p className="font-bold text-white font-mono mt-0.5">{((settings.weights?.operatorVerification || 0.05) * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-mono text-[9px] uppercase">Vehicle Compatibility</p>
                        <p className="font-bold text-white font-mono mt-0.5">{((settings.weights?.vehicleMatch || 0.05) * 100).toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-mono text-[9px] uppercase">Pickup ETA Speed</p>
                        <p className="font-bold text-white font-mono mt-0.5">{((settings.weights?.estimatedPickupTime || 0.05) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Render Quotes List */}
              {hasQuotes && (() => {
                const processedQuotes = (() => {
                  const scored = calculateQuotesWithRecommendations(request.quotes, settings);
                  if (sortOption === 'price_asc') {
                    return [...scored].sort((a, b) => a.fare - b.fare);
                  } else if (sortOption === 'rating_desc') {
                    return [...scored].sort((a, b) => b.operatorRating - a.operatorRating);
                  } else if (sortOption === 'responseTime_asc') {
                    return [...scored].sort((a, b) => a.responseTime - b.responseTime);
                  } else if (sortOption === 'eta_asc') {
                    return [...scored].sort((a, b) => a.etaMinutes - b.etaMinutes);
                  } else {
                    // Priority sorting: 1. Recommended, 2. Best Value, 3. Remaining (by overall hidden score)
                    return [...scored].sort((a, b) => {
                      const aIsRec = a.badges.some((bg: any) => bg.type === 'recommended');
                      const bIsRec = b.badges.some((bg: any) => bg.type === 'recommended');
                      if (aIsRec && !bIsRec) return -1;
                      if (!aIsRec && bIsRec) return 1;

                      const aIsVal = a.badges.some((bg: any) => bg.type === 'value');
                      const bIsVal = b.badges.some((bg: any) => bg.type === 'value');
                      if (aIsVal && !bIsVal) return -1;
                      if (!aIsVal && bIsVal) return 1;

                      return b._totalScore - a._totalScore;
                    });
                  }
                })();

                return (
                  <div className="space-y-4">
                    {/* Sort Options Bar */}
                    <div className="bg-[#05120c] border border-emerald-500/5 rounded-2xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5 px-2">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>QUOTATION MATRIX SORTING</span>
                      </span>

                      <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                        {[
                          { id: 'recommended', label: '⭐ Recommended First' },
                          { id: 'price_asc', label: '💰 Lowest Price' },
                          { id: 'rating_desc', label: '★ Rating: High to Low' },
                          { id: 'responseTime_asc', label: '⚡ Quick Response' },
                          { id: 'eta_asc', label: '🚗 Fast Pickup ETA' }
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => setSortOption(opt.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition font-mono cursor-pointer flex-1 sm:flex-initial text-center ${
                              sortOption === opt.id
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                                : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-900 hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {processedQuotes.map((quote: any) => {
                      const isRecommended = quote.badges.some((b: any) => b.type === 'recommended');
                      const isBestValue = quote.badges.some((b: any) => b.type === 'value');
                      const isExplanationOpen = selectedExplanationQuoteId === quote.id;

                      let cardAccentClass = "border-slate-900";
                      let cardAccentLeft = "bg-slate-800";
                      if (isRecommended) {
                        cardAccentClass = "border-amber-500/30 bg-[#0c160e]";
                        cardAccentLeft = "bg-amber-500";
                      } else if (isBestValue) {
                        cardAccentClass = "border-emerald-500/30 bg-[#06140d]";
                        cardAccentLeft = "bg-emerald-500";
                      }

                      return (
                        <div 
                          key={quote.id} 
                          className={`border rounded-3xl p-6 shadow-lg flex flex-col justify-between gap-6 transition relative overflow-hidden ${cardAccentClass}`}
                        >
                          <div className={`absolute top-0 left-0 w-2 h-full ${cardAccentLeft}`} />
                          
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-3 flex-1 text-left">
                              {/* Recommendation Badges Bar */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-xl text-[9px] font-mono uppercase tracking-widest font-black flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  <span>VERIFIED PARTNER</span>
                                </span>

                                {quote.badges.map((badge: any, idx: number) => {
                                  let badgeTheme = "bg-slate-900 text-slate-300 border-slate-800";
                                  if (badge.type === 'recommended') badgeTheme = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                                  else if (badge.type === 'value') badgeTheme = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                                  else if (badge.type === 'fastest') badgeTheme = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
                                  else if (badge.type === 'top_rated') badgeTheme = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                                  else if (badge.type === 'trusted') badgeTheme = "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";

                                  return (
                                    <span 
                                      key={idx}
                                      className={`border px-2.5 py-0.5 rounded-xl text-[9px] font-mono tracking-widest font-black uppercase flex items-center gap-1 ${badgeTheme}`}
                                    >
                                      <span>{badge.label}</span>
                                    </span>
                                  );
                                })}

                                <button
                                  onClick={() => setSelectedExplanationQuoteId(isExplanationOpen ? null : quote.id)}
                                  className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 ml-auto md:ml-0 cursor-pointer"
                                >
                                  <Info className="w-3 h-3" />
                                  <span>Why Recommended?</span>
                                </button>
                              </div>
                              
                              <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
                                  <button
                                    onClick={() => setViewProfileOperatorId(quote.operator_id)}
                                    className="text-left hover:text-amber-400 hover:underline decoration-dashed decoration-amber-500 cursor-pointer transition-all"
                                    title="Click to view full operator business profile"
                                  >
                                    {quote.operatorBusinessName}
                                  </button>
                                  {isRecommended && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                                </h4>
                                <p className="text-slate-400 text-xs mt-0.5 font-medium">Representative: {quote.operatorOwnerName}</p>
                              </div>

                              {/* Multi-Factor Quality Factors Horizontal Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-900/50 p-3 rounded-2xl text-[11px] font-mono">
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase">Rating</span>
                                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                                    <span>{quote.operatorRating} ★</span>
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase">Response Speed</span>
                                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span>{quote.responseTime} mins</span>
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase">Acceptance Rate</span>
                                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                                    <ThumbsUp className="w-3 h-3 text-cyan-400 shrink-0" />
                                    <span>{quote.acceptanceRate}%</span>
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase">Pickup ETA</span>
                                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                                    <Timer className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span>~{quote.etaMinutes} mins</span>
                                  </span>
                                </div>
                              </div>

                              {quote.operator_message && (
                                <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 max-w-md">
                                  <p className="text-slate-300 text-xs leading-normal italic font-medium">
                                    "{quote.operator_message}"
                                  </p>
                                </div>
                              )}
                              
                              {quote.operatorPhone && (
                                <p className="text-emerald-400 font-mono text-[11px] font-bold">
                                  📞 PHONE CONTACT: {quote.operatorPhone}
                                </p>
                              )}
                            </div>

                            {/* Right Panel: Bid Pricing details */}
                            <div className="w-full md:w-auto flex md:flex-col items-start md:items-end justify-between border-t border-slate-950 md:border-t-0 pt-4 md:pt-0 shrink-0">
                              <div className="text-left md:text-right space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">LIVE QUOTED FARE</span>
                                <p className="text-3xl font-black text-emerald-400 font-mono">₹{quote.fare}</p>
                                <span className="text-[9px] text-slate-500 font-mono uppercase">Flat Rate Inclusive</span>
                              </div>

                              {!isCancelled && !isExpired && (
                                <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider font-mono rounded-xl px-3.5 py-2 mt-4 flex items-center gap-2">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Ready for Contact</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interactive "Why Recommended?" Explainability Accordion */}
                          {isExplanationOpen && (
                            <div className="mt-4 pt-4 border-t border-slate-900/60 text-xs space-y-4 text-left animate-fadeIn">
                              <div className="bg-[#05120c] border border-emerald-500/10 rounded-2xl p-4 space-y-3">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                                  <div>
                                    <p className="font-bold text-white uppercase tracking-wider font-mono text-[10px]">Algorithm Explanation</p>
                                    <p className="text-slate-300 mt-1 leading-relaxed">
                                      {quote.badges.map((b: any) => b.desc).join(" ") || `Selected as a premium quotation based on balanced scores across pricing, route expertise, vehicle availability, and quick dispatch capabilities.`}
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500 space-y-2">
                                  <p className="uppercase tracking-widest">Model Performance Scorecards (Clamped 0-100)</p>
                                  <div className="space-y-1.5">
                                    <div>
                                      <div className="flex justify-between text-slate-400">
                                        <span>Economic Pricing Rank</span>
                                        <span className="font-bold text-emerald-400">{(quote._metrics?.fareScore || 85).toFixed(0)} / 100</span>
                                      </div>
                                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-1">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${quote._metrics?.fareScore || 85}%` }} />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-slate-400">
                                        <span>Operator Trustworthiness & Rating</span>
                                        <span className="font-bold text-amber-400">{(quote._metrics?.ratingScore || 90).toFixed(0)} / 100</span>
                                      </div>
                                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-1">
                                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${quote._metrics?.ratingScore || 90}%` }} />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="flex justify-between text-slate-400">
                                        <span>Live Dispatch Speed (ETA)</span>
                                        <span className="font-bold text-cyan-400">{(quote._metrics?.etaScore || 80).toFixed(0)} / 100</span>
                                      </div>
                                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-1">
                                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${quote._metrics?.etaScore || 80}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            </div>

          </div>

        </div>

      </div>
      {/* PUBLIC PROFILE MODAL OVERLAY */}
      {viewProfileOperatorId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm p-4 md:p-8 flex justify-center items-start">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-2xl mt-8">
            <PublicOperatorProfile 
              operatorId={viewProfileOperatorId} 
              onClose={() => setViewProfileOperatorId(null)} 
            />
          </div>
        </div>
      )}

      {/* ==================================================================== */}
    </div>
  );
}
