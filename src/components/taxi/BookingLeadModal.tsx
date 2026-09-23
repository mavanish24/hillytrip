import React, { useState, useEffect } from 'react';
import { 
  X, Send, Calendar, Clock, Users, MapPin, Car, ShieldCheck, 
  Sparkles, Info, CheckCircle2, DollarSign, MessageSquare, AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { TaxiOperatorProfile, Vehicle } from '../../types/taxi';
import { TaxiBookingRequest, saveLocalTaxiBooking } from '../../types/taxiBooking';

interface BookingLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  operator: TaxiOperatorProfile | null;
  selectedVehicle?: Vehicle | null;
  fromLocation: string;
  toLocation: string;
  travelDate: string;
  passengers: number;
  tripType: string;
  onBookingSubmitted?: (booking: TaxiBookingRequest) => void;
}

export const BookingLeadModal: React.FC<BookingLeadModalProps> = ({
  isOpen,
  onClose,
  operator,
  selectedVehicle,
  fromLocation,
  toLocation,
  travelDate: initialTravelDate,
  passengers: initialPassengers,
  tripType,
  onBookingSubmitted
}) => {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [travelDate, setTravelDate] = useState(initialTravelDate || new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('08:30 AM');
  const [passengers, setPassengers] = useState(initialPassengers || 2);
  const [pickupLocationDetail, setPickupLocationDetail] = useState('');
  const [dropLocationDetail, setDropLocationDetail] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTravelDate) setTravelDate(initialTravelDate);
    if (initialPassengers) setPassengers(initialPassengers);
  }, [initialTravelDate, initialPassengers]);

  if (!isOpen || !operator) return null;

  // Calculate Fare estimate based on vehicle or default route fare
  const vehicleFare = selectedVehicle?.route_starting_price || (tripType === 'shared' ? 350 * passengers : 2800);

  const handleSubmitBookingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone) {
      alert('Please fill in your name and contact phone number.');
      return;
    }

    setIsSubmitting(true);

    const bookingId = `HT-TAXI-${Math.floor(100000 + Math.random() * 900000)}`;
    const conversationId = `conv_taxi_${Date.now()}`;

    const newBooking: TaxiBookingRequest = {
      id: bookingId,
      conversationId,
      operatorId: operator.id,
      operatorName: operator.business_name,
      operatorLogo: operator.logo_url,
      operatorPhone: operator.phone,
      vehicleId: selectedVehicle?.id,
      vehicleName: selectedVehicle ? selectedVehicle.model_name : 'Standard Comfort SUV',
      vehicleCategory: selectedVehicle?.category || 'SUV',
      vehicleImage: selectedVehicle?.image_url,
      fromLocation,
      toLocation,
      travelDate: travelDate || 'Flexible',
      pickupTime,
      passengers,
      pickupLocationDetail: pickupLocationDetail || `${fromLocation} Main Stand`,
      dropLocationDetail: dropLocationDetail || `${toLocation} Center`,
      specialInstructions,
      estimatedFare: vehicleFare,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: userName,
      customerPhone: userPhone
    };

    // Save to local storage
    saveLocalTaxiBooking(newBooking);

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      if (onBookingSubmitted) {
        onBookingSubmitted(newBooking);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="p-5 bg-slate-900 text-white flex items-start justify-between relative shrink-0 border-b border-slate-800">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Booking Review Sheet
              </span>
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                In-App Request
              </span>
            </div>
            <h3 className="text-xl font-black text-white">{operator.business_name}</h3>
            <p className="text-xs text-slate-300">
              {(() => {
                const owner = (operator.owner_name || '').trim();
                if (!owner || owner.toLowerCase() === 'null' || owner.toLowerCase() === 'undefined') return null;
                return (
                  <>
                    Owner: <span className="text-slate-100 font-bold">{owner}</span> •{' '}
                  </>
                );
              })()}
              Rating: <span className="text-amber-400 font-bold">★ {operator.rating}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer relative z-10 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT FORM */}
        <form onSubmit={handleSubmitBookingRequest} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Selected Route & Fare Card */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block">Selected Corridor</span>
                <span className="font-black text-slate-900 dark:text-slate-100 text-base">
                  {fromLocation} → {toLocation}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block">Estimated Fare</span>
                <span className="font-black text-amber-600 dark:text-amber-400 text-lg">
                  ₹{vehicleFare.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedVehicle && (
              <div className="flex items-center gap-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-xs">
                <img
                  src={selectedVehicle.image_url || '/images/hillytrip/taxi-transit.svg'}
                  alt={selectedVehicle.model_name}
                  className="w-12 h-10 rounded-xl object-cover border border-amber-200 dark:border-amber-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block truncate">
                    {selectedVehicle.model_name} ({selectedVehicle.category})
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {selectedVehicle.seats} Seats • {selectedVehicle.is_ac ? 'AC Equipped' : 'Non-AC'} • {selectedVehicle.luggage_bags} Luggage Bags
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-3">
            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Travel Date *</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Pickup Time *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 08:30 AM"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Passengers & Contact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Contact Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9800000000"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Pickup & Drop Landmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Pickup Landmark / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Platform 1 Exit / Hotel Deolo"
                  value={pickupLocationDetail}
                  onChange={(e) => setPickupLocationDetail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Drop Landmark / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Kalimpong Motor Stand / Resort"
                  value={dropLocationDetail}
                  onChange={(e) => setDropLocationDetail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Special Instructions / Luggage Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Carrying 3 large luggage bags. Traveling with elderly parents. Need quiet driver."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Guarantee Note */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-[11px] font-medium leading-tight">
              HillyTrip In-App Booking: Your booking request opens a dedicated conversation thread with {operator.business_name}. No external phone calls required.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Sending Booking Request...' : `Send Booking Request to ${operator.business_name}`}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
