import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, Briefcase, Car, FileText, Sparkles, Activity, ShieldCheck, Zap, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface QuoteRequestModalProps {
  fromName: string;
  toName: string;
  routeId?: string;
  user?: User | null;
  onClose: () => void;
  onSubmitSuccess: (requestId: string) => void;
}

export default function QuoteRequestModal({
  fromName,
  toName,
  routeId,
  user,
  onClose,
  onSubmitSuccess
}: QuoteRequestModalProps) {
  // Pre-fill tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [journeyDate, setJourneyDate] = useState(defaultDateStr);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [pickupLocation, setPickupLocation] = useState(fromName);
  const [dropLocation, setDropLocation] = useState(toName);
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [vehiclePreference, setVehiclePreference] = useState('Any');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [notes, setNotes] = useState('');
  
  // Unified essential contact fields
  const [travellerName, setTravellerName] = useState(user?.name || '');
  const [travellerPhone, setTravellerPhone] = useState((user as any)?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'broadcasting'>('form');

  // Progress states for broadcasting
  const [quoteProgress, setQuoteProgress] = useState(0);
  const [operatorCount, setOperatorCount] = useState(0);
  const [quotesList, setQuotesList] = useState<any[]>([]);

  useEffect(() => {
    if (step !== 'broadcasting') return;

    // Smoothly animate progress bar
    const progressInterval = setInterval(() => {
      setQuoteProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 120);

    // Increment operators who received it
    const operatorInterval = setInterval(() => {
      setOperatorCount((prev) => {
        if (prev >= 12) {
          clearInterval(operatorInterval);
          return 12;
        }
        return prev + 1;
      });
    }, 600);

    // Simulate 3 premium live quotes to land
    const timer1 = setTimeout(() => {
      setQuotesList((prev) => [
        ...prev,
        {
          name: 'ABC Mountain Taxi',
          rating: '4.9',
          vehicle: 'SUV (Bolero/Scorpio)',
          price: '₹4,500',
          time: 'Responded in 1 min',
          badge: '🎉 First Quote Received'
        }
      ]);
    }, 2000);

    const timer2 = setTimeout(() => {
      setQuotesList((prev) => [
        ...prev,
        {
          name: 'Kanchenjunga Travels',
          rating: '4.8',
          vehicle: 'Sedan (Dzire/Etios)',
          price: '₹4,300',
          time: 'Responded in 2 mins',
          badge: '⚡ Low Fare Match'
        }
      ]);
    }, 5000);

    const timer3 = setTimeout(() => {
      setQuotesList((prev) => [
        ...prev,
        {
          name: 'Teesta Alpine Cabs',
          rating: '4.7',
          vehicle: 'Innova / Luxury',
          price: '₹4,600',
          time: 'Responded in 2 mins',
          badge: '⭐ Premium Choice'
        }
      ]);
    }, 8000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(operatorInterval);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travellerName || !travellerPhone) {
      setError('Name and Mobile Number are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Determine travelerId
    let travellerId = user?.id;
    if (!travellerId) {
      travellerId = `guest_${travellerPhone.replace(/\s+/g, '')}`;
    }

    try {
      const payload = {
        travellerId,
        routeId: routeId || null,
        pickupLocation,
        dropLocation,
        travelDate: journeyDate,
        pickupTime,
        passengerCount,
        luggage,
        vehiclePreference,
        tripType,
        notes: `[Guest/Traveller: ${travellerName}, Phone: ${travellerPhone}] ${notes}`
      };

      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit quote request.');
      }

      const data = await response.json();
      if (data.success && data.requestId) {
        setSubmittedRequestId(data.requestId);
        setStep('broadcasting');
      } else {
        throw new Error('Invalid response received from server.');
      }
    } catch (err: any) {
      console.error('[QuoteRequestModal] Submission failed:', err);
      setError(err.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewQuote = () => {
    if (submittedRequestId) {
      onSubmitSuccess(submittedRequestId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div className="bg-slate-950/95 dark:bg-slate-950 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl text-left relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="border-b border-white/10 p-5 flex justify-between items-center bg-white/5 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>SMART MATCHING BROADCAST</span>
            </div>
            <h3 className="text-xl font-black text-white mt-1 uppercase tracking-wide">🚖 Request Live Quotes</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.form 
                key="form-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit} 
                className="space-y-5"
              >
                {error && (
                  <div className="bg-rose-950/40 border border-rose-500/20 px-4 py-3 rounded-xl text-rose-300 text-xs">
                    {error}
                  </div>
                )}

                {/* LIVE OPERATOR STATUS CARD */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4.5 rounded-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-mono font-black tracking-widest text-emerald-400 uppercase">🟢 LIVE NOW</span>
                    </div>
                    <div className="text-lg font-black text-white">12 Verified Operators Online</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span>⚡ Average Response Time:</span>
                      <span className="text-emerald-300 font-bold">2–5 minutes</span>
                    </div>
                  </div>
                  <div className="text-left text-[10px] text-slate-400 font-medium space-y-1 sm:border-l border-white/5 sm:pl-4 shrink-0 max-w-xs">
                    <p>📡 3 quote requests accepted in last 10m</p>
                    <p>🚖 2 operators currently available</p>
                    <p>🛡️ All payments settled 100% direct</p>
                  </div>
                </div>

                {/* HOW IT WORKS STEPS */}
                <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-white/5">
                  <div className="space-y-1">
                    <div className="text-[11px] font-black text-white flex items-center justify-center gap-1">
                      <span className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] flex items-center justify-center text-emerald-300 font-mono">①</span>
                      <span>Submit Request</span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-normal">Enter details securely</p>
                  </div>
                  <div className="space-y-1 border-x border-white/5 px-1">
                    <div className="text-[11px] font-black text-white flex items-center justify-center gap-1">
                      <span className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] flex items-center justify-center text-emerald-300 font-mono">②</span>
                      <span>Broadcast Live</span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-normal">Reach nearby local drivers</p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-black text-white flex items-center justify-center gap-1">
                      <span className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] flex items-center justify-center text-emerald-300 font-mono">③</span>
                      <span>Receive Quotes</span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-normal">Compare and book instantly</p>
                  </div>
                </div>

                {/* Essential contact details */}
                <div className="bg-white/5 border border-white/10 p-4.5 rounded-2xl space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest block">Primary Contact Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">Your Name</label>
                      <input
                        type="text"
                        required
                        value={travellerName}
                        onChange={(e) => setTravellerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={travellerPhone}
                        onChange={(e) => setTravellerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Pickup and Destination editable inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Pickup Location
                    </label>
                    <input
                      type="text"
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. NJP Railway Station"
                      className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      Drop Location
                    </label>
                    <input
                      type="text"
                      required
                      value={dropLocation}
                      onChange={(e) => setDropLocation(e.target.value)}
                      placeholder="e.g. Homestay / Town Center"
                      className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                    />
                  </div>
                </div>

                {/* Journey Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      Travel Date
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={journeyDate}
                      onChange={(e) => setJourneyDate(e.target.value)}
                      className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition scheme-dark"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition scheme-dark"
                    />
                  </div>
                </div>

                {/* Co-traveler details & Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      Passengers
                    </label>
                    <select
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(Number(e.target.value))}
                      className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i+1} value={i+1} className="bg-slate-950">{i+1} Pax</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      Luggage Bags
                    </label>
                    <select
                      value={luggage}
                      onChange={(e) => setLuggage(Number(e.target.value))}
                      className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                    >
                      {[...Array(6)].map((_, i) => (
                        <option key={i} value={i} className="bg-slate-950">{i} Bags</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                      <Car className="w-3.5 h-3.5 text-emerald-400" />
                      Car Class
                    </label>
                    <select
                      value={vehiclePreference}
                      onChange={(e) => setVehiclePreference(e.target.value)}
                      className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                    >
                      <option value="Any" className="bg-slate-950">Any Class</option>
                      <option value="Hatchback" className="bg-slate-950">Hatchback (WagonR)</option>
                      <option value="Sedan" className="bg-slate-950">Sedan (Dzire/Etios)</option>
                      <option value="SUV" className="bg-slate-950">SUV (Bolero/Scorpio)</option>
                      <option value="Luxury" className="bg-slate-950">Innova / Luxury</option>
                    </select>
                  </div>
                </div>

                {/* Trip Type selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">Trip Type</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="tripType"
                        checked={tripType === 'one-way'}
                        onChange={() => setTripType('one-way')}
                        className="accent-emerald-400 w-4 h-4 cursor-pointer"
                      />
                      One Way Ride
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="tripType"
                        checked={tripType === 'round-trip'}
                        onChange={() => setTripType('round-trip')}
                        className="accent-emerald-400 w-4 h-4 cursor-pointer"
                      />
                      Round Trip Service
                    </label>
                  </div>
                </div>

                {/* Special notes */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    Special Notes / Requests (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Need vehicle with luggage carrier, traveling with elderly parents, specific drop point details..."
                    rows={3}
                    className="w-full bg-[#020a05] border border-white/10 focus:border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3.5 bg-emerald-400 hover:bg-emerald-350 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-400/20 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Initiating Secure Broadcast...</span>
                      </>
                    ) : (
                      <>
                        <span>🚖 Broadcast My Request</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center font-mono mt-2">
                  Your request will instantly reach all verified operators serving this route.
                </p>
              </motion.form>
            ) : (
              <motion.div 
                key="broadcasting-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-6"
              >
                {/* Ping/Radar Animation */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></span>
                    <span className="relative flex h-14 w-14 items-center justify-center bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-2xl">
                      📡
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Broadcasting your request...</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">
                    Sending to 12 verified operators serving the <span className="text-emerald-300 font-bold">{pickupLocation}</span> → <span className="text-emerald-300 font-bold">{dropLocation}</span> corridor.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2 max-w-md mx-auto bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full" 
                      style={{ width: `${quoteProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
                    <span>{operatorCount} of 12 operators received</span>
                    <span className="text-emerald-400">Estimated first quote ~2 mins</span>
                  </div>
                </div>

                {/* Real-time incoming quotes list */}
                <div className="space-y-3 text-left max-h-[220px] overflow-y-auto scrollbar-none">
                  {quotesList.map((q, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 100 }}
                      className="bg-white/5 border border-emerald-500/10 hover:border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md shadow-lg"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase">
                          {q.badge}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <h4 className="text-xs font-black text-white">{q.name}</h4>
                          <div className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{q.rating}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400">{q.vehicle} • {q.time}</p>
                      </div>
                      <div className="text-right space-y-1.5">
                        <div className="text-base font-black text-emerald-400 font-mono">{q.price}</div>
                        <button
                          onClick={handleViewQuote}
                          className="text-[10px] bg-emerald-400 hover:bg-emerald-350 text-slate-950 font-black tracking-wider uppercase px-2.5 py-1 rounded-lg transition active:scale-98 cursor-pointer"
                        >
                          View Quote
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Compare / View all active quotes actions */}
                <div className="pt-4 border-t border-white/10 flex flex-col items-center space-y-2">
                  <button
                    onClick={handleViewQuote}
                    className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-350 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition duration-150 shadow-lg shadow-emerald-400/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{quotesList.length > 0 ? `${quotesList.length} Quotes Received • Compare Quotes →` : 'Connecting Drivers...'}</span>
                  </button>
                  <p className="text-[9px] text-slate-500 font-mono">
                    Drivers actively bid on your transit corridor. 100% transparent rates.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
