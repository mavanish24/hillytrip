import React, { useState, useMemo } from 'react';
import { 
  X, Calendar, Users, ShieldCheck, CheckCircle2, 
  Sparkles, ArrowRight, ArrowLeft, MessageSquare, 
  Home, MapPin, Star, AlertCircle, Clock, Info, Lock,
  CreditCard, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getItemSlug } from '../utils/slug';

// Helper to load Razorpay Checkout SDK dynamically
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export interface DirectBookingHomestay {
  id: string;
  name: string;
  priceMin?: number | string;
  priceMax?: number | string;
  price?: number | string;
  address?: string;
  district?: string;
  images?: string[];
  image?: string;
  rating?: number | string;
  reviewCount?: number | string;
  roomTypes?: string[];
  roomCategories?: Array<{ id: string; room_name: string; price: number }>;
  amenities?: string[];
  ownerName?: string;
  verified?: boolean;
  status?: string;
}

interface DirectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  homestay: DirectBookingHomestay | null;
  roomCategories?: any[];
  initialDate?: string;
  initialGuests?: number;
  currentUser?: any;
  onOpenMessaging?: (homestay: DirectBookingHomestay, initialDetails?: any) => void;
  onDirectMessage?: () => void;
  onBookingComplete?: (bookingData: any) => void;
  navigate?: (path: string) => void;
}

type BookingStep = 1 | 2 | 3 | 4 | 5;

export default function DirectBookingModal({
  isOpen,
  onClose,
  homestay,
  roomCategories = [],
  initialDate,
  initialGuests,
  currentUser,
  onOpenMessaging,
  onDirectMessage,
  onBookingComplete,
  navigate
}: DirectBookingModalProps) {
  // Step State: 1 = Dates, 2 = Guests, 3 = Availability, 4 = Price, 5 = Confirm Booking
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);

  // Form Fields
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [checkInDate, setCheckInDate] = useState<string>(initialDate || tomorrow.toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState<string>(dayAfter.toISOString().split('T')[0]);
  const [adults, setAdults] = useState<number>(initialGuests || 2);
  const [children, setChildren] = useState<number>(0);
  const [selectedRoomType, setSelectedRoomType] = useState<string>(roomCategories?.[0]?.room_name || 'Standard Mountain Room');
  
  // Guest contact details for internal confirmation
  const [guestName, setGuestName] = useState<string>(currentUser?.name || '');
  const [guestEmail, setGuestEmail] = useState<string>(currentUser?.email || '');
  const [guestPhone, setGuestPhone] = useState<string>(currentUser?.mobile || currentUser?.phone || '');
  const [specialRequest, setSpecialRequest] = useState<string>('');

  // Submission & Confirmation state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<'idle' | 'locking_dates' | 'creating_order' | 'loading_gateway' | 'verifying_payment'>('idle');
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');
  const [confirmedBookingReference, setConfirmedBookingReference] = useState<string>('');
  const [confirmedBookingData, setConfirmedBookingData] = useState<any>(null);
  const [confirmedPaymentId, setConfirmedPaymentId] = useState<string>('');
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  const [reservationError, setReservationError] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');

  // Live server-side availability checking
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);
  const [isDateAvailable, setIsDateAvailable] = useState<boolean | null>(null);
  const [availabilityConflict, setAvailabilityConflict] = useState<any>(null);

  // Nights calculation hook (must always be called unconditionally)
  const nightsCount = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  // Check live availability against server-side inventory protection
  const checkLiveAvailability = async () => {
    if (!homestay?.id || !checkInDate || !checkOutDate) return;
    setIsCheckingAvailability(true);
    try {
      const query = new URLSearchParams({
        homestayId: homestay.id,
        checkInDate,
        checkOutDate,
        roomType: selectedRoomType
      });
      const res = await fetch(`/api/booking/check-availability?${query.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setIsDateAvailable(data.available !== false);
        setAvailabilityConflict(data.conflict || null);
      } else {
        setIsDateAvailable(true);
      }
    } catch (e) {
      console.warn('Live availability check warning:', e);
      setIsDateAvailable(true);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && homestay?.id) {
      checkLiveAvailability();
    }
  }, [isOpen, checkInDate, checkOutDate, selectedRoomType]);

  if (!isOpen || !homestay) return null;

  // Numerical base price
  const rawMin = typeof homestay.priceMin === 'number' ? homestay.priceMin : parseInt(String(homestay.priceMin || homestay.price || '1500').replace(/\D/g, ''), 10) || 1500;
  const baseRatePerNight = rawMin;

  // Total Guests
  const totalGuests = adults + children;
  const extraGuests = Math.max(0, totalGuests - 2);
  const extraGuestFeePerNight = extraGuests * 400;

  // Price calculations
  const roomTotal = baseRatePerNight * nightsCount;
  const extraGuestTotal = extraGuestFeePerNight * nightsCount;
  const subtotal = roomTotal + extraGuestTotal;
  const hillyTripServiceFee = 0; // 100% free direct booking protection
  const estimatedTotal = subtotal + hillyTripServiceFee;

  const homestayImage = (homestay.images && homestay.images.length > 0 && homestay.images[0])
    ? homestay.images[0]
    : (homestay.image || '/images/hillytrip/foggy-forest.svg');

  const stepsList = [
    { num: 1, label: 'Select Dates' },
    { num: 2, label: 'Guests' },
    { num: 3, label: 'Availability' },
    { num: 4, label: 'Price' },
    { num: 5, label: 'Reserve & Pay' }
  ];

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!checkInDate || !checkOutDate) {
        alert('Please select valid check-in and check-out dates.');
        return;
      }
      if (new Date(checkOutDate) <= new Date(checkInDate)) {
        alert('Check-out date must be after check-in date.');
        return;
      }
    }
    if (currentStep === 3 && isDateAvailable === false) {
      alert('The selected room is unavailable for these dates. Please choose alternate travel dates.');
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as BookingStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as BookingStep);
    }
  };

  const handleConfirmDirectBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guestName.trim()) {
      alert('Please enter your full name for the reservation.');
      return;
    }
    if (!guestEmail.trim() && !guestPhone.trim()) {
      alert('Please provide an email or mobile phone so HillyTrip can deliver your reservation receipt.');
      return;
    }

    setIsSubmitting(true);
    setReservationError('');
    setPaymentError('');
    setLoadingStage('locking_dates');

    try {
      let activeBookingId = createdBookingId;
      let activeBooking = confirmedBookingData;

      // 1. Submit authoritative Phase 1 reservation to server if not already created
      if (!activeBookingId) {
        const reserveRes = await fetch('/api/booking/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            homestayId: homestay.id,
            checkInDate,
            checkOutDate,
            adults,
            children,
            roomType: selectedRoomType,
            guestName: guestName.trim(),
            guestEmail: guestEmail.trim(),
            guestPhone: guestPhone.trim(),
            specialRequest: specialRequest.trim()
          })
        });

        const reserveData = await reserveRes.json();

        if (!reserveRes.ok) {
          if (reserveRes.status === 409 || reserveData.code === 'ROOM_UNAVAILABLE') {
            setReservationError('The requested room is unavailable for the selected dates. Another traveler may have just reserved it. Please choose different dates.');
          } else {
            setReservationError(reserveData.error || 'Unable to complete reservation. Please try again.');
          }
          setIsSubmitting(false);
          setLoadingStage('idle');
          return;
        }

        activeBookingId = reserveData.bookingId || reserveData.booking?.id;
        activeBooking = reserveData.booking;
        setCreatedBookingId(activeBookingId);
        setConfirmedBookingData(activeBooking);
      }

      // 2. Create Razorpay order on server bound to this reservation
      setLoadingStage('creating_order');
      const orderRes = await fetch('/api/booking/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeBookingId,
          homestayId: homestay.id,
          customerName: guestName.trim(),
          customerEmail: guestEmail.trim(),
          customerMobile: guestPhone.trim(),
          leadType: 'homestay'
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setPaymentError(orderData.error || 'Failed to initialize payment gateway order. Please retry.');
        setIsSubmitting(false);
        setLoadingStage('idle');
        return;
      }

      // 3. Load Razorpay Checkout SDK
      setLoadingStage('loading_gateway');
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setPaymentError('Failed to load Razorpay checkout SDK. Please check your internet connection and retry.');
        setIsSubmitting(false);
        setLoadingStage('idle');
        return;
      }

      // 4. Open Razorpay Checkout Modal
      setConfirmedOrderId(orderData.orderId);
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'HillyTrip',
        description: `Homestay Reservation - ${homestay.name}`,
        order_id: orderData.orderId,
        prefill: {
          name: guestName.trim(),
          email: guestEmail.trim(),
          contact: guestPhone.trim()
        },
        notes: {
          bookingId: activeBookingId,
          homestayId: homestay.id,
          roomType: selectedRoomType
        },
        theme: {
          color: '#059669' // Emerald 600
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
            setLoadingStage('idle');
            setPaymentError('Payment window was closed. Your reservation dates remain held under status Awaiting Payment. Click "Retry Payment" to complete your booking.');
          }
        },
        handler: async (response: any) => {
          setIsVerifyingPayment(true);
          setLoadingStage('verifying_payment');
          try {
            const verifyRes = await fetch('/api/booking/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: activeBookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: orderData.amount
              })
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              setPaymentError(verifyData.error || 'Payment verification was not successful. Your booking is not yet confirmed. Please contact support.');
              setIsSubmitting(false);
              setIsVerifyingPayment(false);
              setLoadingStage('idle');
              return;
            }

            // Payment verified and confirmed!
            setConfirmedBookingReference(activeBookingId);
            setConfirmedBookingData(verifyData.booking || activeBooking);
            setConfirmedPaymentId(response.razorpay_payment_id);
            setConfirmedOrderId(response.razorpay_order_id);
            setBookingConfirmed(true);

            // Automatically spawn internal conversation in HillyTrip Messaging
            try {
              await fetch('/api/messaging/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  listingType: 'homestay',
                  listingId: homestay.id,
                  travelerId: currentUser?.id || currentUser?.email || guestEmail || 'guest-traveler',
                  firstMessage: `Hello! I have confirmed and paid for my reservation at ${homestay.name} (Ref: ${activeBookingId}, Payment ID: ${response.razorpay_payment_id}) for ${nightsCount} night(s) from ${checkInDate} to ${checkOutDate} for ${totalGuests} guest(s). Looking forward to our stay!`
                })
              });
            } catch (chatErr) {
              console.warn('Messaging sync warning:', chatErr);
            }

            if (onBookingComplete) {
              onBookingComplete(verifyData.booking || activeBooking);
            }
          } catch (verifyErr: any) {
            console.error('Payment verification error:', verifyErr);
            setPaymentError(`Network error verifying payment. Your Payment ID is ${response.razorpay_payment_id}. Please contact HillyTrip support.`);
          } finally {
            setIsSubmitting(false);
            setIsVerifyingPayment(false);
            setLoadingStage('idle');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setIsSubmitting(false);
        setLoadingStage('idle');
        setPaymentError(`Payment was not completed. Your reservation has not been confirmed. (${resp.error?.description || resp.error?.reason || 'Transaction declined'}). You can retry securely.`);
      });

      rzp.open();
    } catch (err: any) {
      console.error('Direct booking submission error:', err);
      setReservationError('Unable to connect to reservation service. Please check your internet connection.');
      setIsSubmitting(false);
      setLoadingStage('idle');
    }
  };

  const handleOpenInternalChat = () => {
    onClose();
    if (onDirectMessage) {
      onDirectMessage();
    } else if (onOpenMessaging) {
      onOpenMessaging(homestay, {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: totalGuests,
        roomName: selectedRoomType
      });
    } else {
      const slug = getItemSlug(homestay);
      const url = `#/enquire?listingType=homestay&listingId=${slug}&checkIn=${encodeURIComponent(checkInDate)}&checkOut=${encodeURIComponent(checkOutDate)}&guests=${totalGuests}&roomName=${encodeURIComponent(selectedRoomType)}`;
      if (navigate) navigate(url);
      else window.location.hash = url;
    }
  };

  return (
    <div 
      id="direct-booking-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase font-mono bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">
                  DIRECT BOOKING
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  HillyTrip Guaranteed
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-white truncate max-w-[280px] sm:max-w-md">
                {homestay.name}
              </h3>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        {!bookingConfirmed && (
          <div className="bg-slate-50 dark:bg-slate-950/80 px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              {stepsList.map((step, idx) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <React.Fragment key={step.num}>
                    <button
                      type="button"
                      onClick={() => {
                        if (step.num < currentStep) setCurrentStep(step.num as BookingStep);
                      }}
                      disabled={step.num > currentStep}
                      className={`flex flex-col items-center gap-1 transition ${
                        step.num < currentStep ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isActive 
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-sm' 
                          : isCompleted 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : step.num}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        isActive ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {step.label}
                      </span>
                    </button>
                    {idx < stepsList.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1.5 transition-colors ${
                        currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {bookingConfirmed ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="text-center py-6 space-y-6 animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  STATUS: CONFIRMED • PAID
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  Booking Confirmed
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Your reservation at <strong className="text-slate-900 dark:text-white">{homestay.name}</strong> has been confirmed and paid.
                </p>
              </div>

              {/* Authoritative Reference Card */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left max-w-md mx-auto space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-400">Booking Reference:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{confirmedBookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">PAID (Verified via Razorpay)</span>
                </div>
                {confirmedPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment ID:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{confirmedPaymentId}</span>
                  </div>
                )}
                {confirmedOrderId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order ID:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{confirmedOrderId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Homestay:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{homestay.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Locked Dates:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{checkInDate} → {checkOutDate} ({nightsCount} nights)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Party Size:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{totalGuests} Guests ({adults} Adults, {children} Children)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Room:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRoomType}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sm font-black">
                  <span className="text-slate-600 dark:text-slate-300">Amount Paid:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{(confirmedBookingData?.bookingAmount || estimatedTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Internal Messaging Notice */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 max-w-md mx-auto text-left flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    Host Communication via HillyTrip
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    A direct conversation has been opened in your HillyTrip inbox. You can message the host anytime for arrival time, dining preferences, or directions.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={handleOpenInternalChat}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Host on HillyTrip</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close & Continue Exploring
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: SELECT DATES */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <img 
                      src={homestayImage} 
                      alt={homestay.name} 
                      className="w-16 h-16 rounded-xl object-cover shrink-0" 
                    />
                    <div className="space-y-1 min-w-0">
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">{homestay.name}</h5>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        ₹{baseRatePerNight} <span className="text-[10px] text-slate-400 font-sans">/ night base rate</span>
                      </p>
                      {homestay.address && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {homestay.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      1. Choose Travel Dates
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Check-in Date *
                        </label>
                        <div className="relative">
                          <input 
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Check-out Date *
                        </label>
                        <div className="relative">
                          <input 
                            type="date"
                            required
                            min={checkInDate || new Date().toISOString().split('T')[0]}
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Selected Duration:</span>
                      <span className="font-extrabold text-emerald-800 dark:text-emerald-300 font-mono">
                        {nightsCount} Night{nightsCount > 1 ? 's' : ''} Stay
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: GUESTS */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      2. Guest Party & Room Configuration
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standard pricing covers up to 2 adult guests. Extra bedding is automatically factored.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">Adults</p>
                          <p className="text-[10px] text-slate-400">Age 13 and above</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white w-4 text-center">
                            {adults}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAdults(Math.min(8, adults + 1))}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">Children</p>
                          <p className="text-[10px] text-slate-400">Age 0 - 12</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white w-4 text-center">
                            {children}
                          </span>
                          <button
                            type="button"
                            onClick={() => setChildren(Math.min(6, children + 1))}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center cursor-pointer hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono uppercase">
                      Select Room Type
                    </label>
                    <select
                      value={selectedRoomType}
                      onChange={(e) => setSelectedRoomType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Standard Mountain Room">Standard Himalayan Wood Room (₹{baseRatePerNight}/night)</option>
                      <option value="Balcony Valley View Suite">Balcony Valley View Suite (₹{Math.round(baseRatePerNight * 1.25)}/night)</option>
                      <option value="Family Heritage Attic">Family Heritage Wooden Attic (₹{Math.round(baseRatePerNight * 1.45)}/night)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 3: AVAILABILITY */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      3. Live Availability Verification
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time inventory status queried directly from the mountain server.
                    </p>
                  </div>

                  {isCheckingAvailability ? (
                    <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                        Checking room availability for {checkInDate} → {checkOutDate}...
                      </span>
                    </div>
                  ) : isDateAvailable === false ? (
                    <div className="p-4 bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                          </span>
                          <span className="font-extrabold text-rose-800 dark:text-rose-300 text-xs uppercase tracking-wider font-mono">
                            DATES CURRENTLY UNAVAILABLE
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 shadow-2xs">
                          Reserved
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        Another traveler has already reserved <strong className="text-slate-900 dark:text-white">{selectedRoomType}</strong> for overlapping dates. Please go back to <strong>Select Dates</strong> or choose a different room category.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-rose-100 dark:border-rose-900/50">
                          <span className="text-slate-400 block text-[9px]">Requested In</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{checkInDate}</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-rose-100 dark:border-rose-900/50">
                          <span className="text-slate-400 block text-[9px]">Requested Out</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{checkOutDate}</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-rose-100 dark:border-rose-900/50 col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[9px]">Inventory Lock</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">Blocked</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Status Card */
                    <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs uppercase tracking-wider font-mono">
                            AVAILABLE FOR DIRECT BOOKING
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                          Instant Lock
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                        The homestay has verified openings for <strong className="text-slate-900 dark:text-white">{checkInDate}</strong> through <strong className="text-slate-900 dark:text-white">{checkOutDate}</strong> ({nightsCount} nights) for <strong className="text-slate-900 dark:text-white">{totalGuests} guests</strong>.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                          <span className="text-slate-400 block text-[9px]">Check-in</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{checkInDate}</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                          <span className="text-slate-400 block text-[9px]">Check-out</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{checkOutDate}</span>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block text-[9px]">Status</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Guaranteed</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities verification */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                      Included with direct reservation:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-650 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Organic breakfast included</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Hot mountain water bath</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>HillyTrip internal messaging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Zero cancellation penalty (48h)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PRICE BREAKDOWN */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      4. Transparent Price Calculation
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      100% direct pricing with zero hidden intermediary markups.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Room Tariff (₹{baseRatePerNight} × {nightsCount} nights):</span>
                      <span className="font-bold">₹{roomTotal.toLocaleString('en-IN')}</span>
                    </div>

                    {extraGuests > 0 && (
                      <div className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>Extra Guest Fee ({extraGuests} guest × ₹400 × {nightsCount} nights):</span>
                        <span className="font-bold">+₹{extraGuestTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>HillyTrip Direct Protection Fee:</span>
                      <span className="font-bold">FREE (₹0)</span>
                    </div>

                    <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2" />

                    <div className="flex justify-between items-baseline text-slate-900 dark:text-white font-black text-sm">
                      <span>Total Stay Price:</span>
                      <span className="text-xl text-emerald-700 dark:text-emerald-400 font-mono font-black">
                        ₹{estimatedTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans pt-1">
                      * All prices in Indian Rupees (INR). Payable upon check-in or via standard direct booking schedule.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Have questions about custom meals or group discounts? You can message the host directly on HillyTrip anytime.</span>
                  </div>
                </div>
              )}

              {/* STEP 5: RESERVE & PAY */}
              {currentStep === 5 && (
                <form onSubmit={handleConfirmDirectBooking} className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      5. Reserve & Pay
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lock your dates and pay securely via Razorpay (UPI, Cards, Net Banking) to confirm your stay.
                    </p>
                  </div>

                  {reservationError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{reservationError}</span>
                    </div>
                  )}

                  {paymentError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl space-y-2 text-xs text-rose-800 dark:text-rose-300 animate-shake">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{paymentError}</span>
                      </div>
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleConfirmDirectBooking()}
                          disabled={isSubmitting || isVerifyingPayment}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[11px]"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry Payment</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Full Name *
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                          Email Address *
                        </label>
                        <input 
                          type="email"
                          required
                          placeholder="priya@example.com"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                          Mobile Number *
                        </label>
                        <input 
                          type="tel"
                          required
                          placeholder="+91 98000 00000"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Special Requests / Food Preferences (Optional)
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. Vegetarian meals, arriving around 4:00 PM..."
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                  </div>

                  {/* Summary Strip */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Total payable for {nightsCount} nights:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{estimatedTotal.toLocaleString('en-IN')}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isVerifyingPayment}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white font-black uppercase tracking-wider rounded-xl cursor-pointer disabled:cursor-not-allowed transition shadow-md flex items-center justify-center gap-2"
                  >
                    {isVerifyingPayment ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Payment with Server...</span>
                      </div>
                    ) : isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>
                          {loadingStage === 'locking_dates' && 'Locking Dates & Creating Reservation...'}
                          {loadingStage === 'creating_order' && 'Initializing Razorpay Order...'}
                          {loadingStage === 'loading_gateway' && 'Loading Payment Gateway...'}
                          {loadingStage === 'idle' && 'Processing...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Reserve & Pay ₹{estimatedTotal.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation Bar */}
        {!bookingConfirmed && (
          <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            {/* Communication CTA: Message on HillyTrip */}
            <button
              type="button"
              onClick={handleOpenInternalChat}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>Message on HillyTrip</span>
            </button>

            {/* Stepper Next/Back */}
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={currentStep === 3 && isDateAvailable === false}
                  className={`px-5 py-2.5 text-white text-xs font-black rounded-xl transition shadow-sm flex items-center gap-1.5 ${
                    currentStep === 3 && isDateAvailable === false
                      ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
                  }`}
                >
                  <span>
                    {currentStep === 4 ? 'Proceed to Reserve & Pay' : currentStep === 3 && isDateAvailable === false ? 'Dates Unavailable' : 'Continue'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
