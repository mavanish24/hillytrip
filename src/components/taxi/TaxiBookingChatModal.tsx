import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Clock, 
  MapPin, Calendar, Users, Car, DollarSign, MessageSquare, ChevronDown, 
  ChevronUp, User, Info, AlertTriangle, ArrowRight, Star, RefreshCw, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TaxiBookingRequest, TaxiBookingStatus, saveLocalTaxiBooking, updateTaxiBookingStatus } from '../../types/taxiBooking';

interface TaxiBookingChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: TaxiBookingRequest | null;
  onBookingUpdated?: (updated: TaxiBookingRequest) => void;
}

interface ChatMsg {
  id: string;
  sender: 'user' | 'operator' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isStatusCard?: boolean;
  newStatus?: TaxiBookingStatus;
  fareUpdate?: number;
}

export const TaxiBookingChatModal: React.FC<TaxiBookingChatModalProps> = ({
  isOpen,
  onClose,
  booking: initialBooking,
  onBookingUpdated
}) => {
  const [booking, setBooking] = useState<TaxiBookingRequest | null>(initialBooking);
  const [activeRole, setActiveRole] = useState<'user' | 'operator'>('user');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [isEditingFare, setIsEditingFare] = useState(false);
  const [customFareInput, setCustomFareInput] = useState<number>(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState<number>(5);
  const [userReview, setUserReview] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync initial booking
  useEffect(() => {
    setBooking(initialBooking);
    if (initialBooking) {
      setCustomFareInput(initialBooking.agreedFare || initialBooking.estimatedFare);
      
      // Seed default messages
      const seedMsgs: ChatMsg[] = [
        {
          id: 'msg-1',
          sender: 'system',
          senderName: 'HillyTrip System',
          text: `Booking Request #${initialBooking.id} created for ${initialBooking.fromLocation} → ${initialBooking.toLocation}. Request sent directly to ${initialBooking.operatorName}.`,
          timestamp: new Date(initialBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isStatusCard: true
        },
        {
          id: 'msg-2',
          sender: 'user',
          senderName: initialBooking.customerName,
          text: `Hi ${initialBooking.operatorName}! I have submitted a booking request for ${initialBooking.vehicleName} on ${initialBooking.travelDate} at ${initialBooking.pickupTime}. Pickup: ${initialBooking.pickupLocationDetail}. Please confirm availability.`,
          timestamp: new Date(initialBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'msg-3',
          sender: 'operator',
          senderName: initialBooking.operatorName,
          text: `Greetings ${initialBooking.customerName}! Thank you for reaching out via HillyTrip. We have received your request for the ${initialBooking.fromLocation} → ${initialBooking.toLocation} trip. We are reviewing driver schedule.`,
          timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(seedMsgs);
    }
  }, [initialBooking]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !booking) return null;

  const currentFare = booking.agreedFare || booking.estimatedFare;

  // Status Badge Helper
  const getStatusBadge = (status: TaxiBookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-spin-slow text-amber-500" />
            <span>Pending Operator Response</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Accepted - Ready to Confirm</span>
          </span>
        );
      case 'negotiating':
        return (
          <span className="bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-400 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 text-purple-500 animate-spin-slow" />
            <span>Fare Negotiating</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Booking Confirmed</span>
          </span>
        );
      case 'completed':
        return (
          <span className="bg-slate-500/10 border border-slate-500/30 text-slate-700 dark:text-slate-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Trip Completed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <X className="w-3.5 h-3.5 text-rose-500" />
            <span>Cancelled</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span>Declined by Operator</span>
          </span>
        );
    }
  };

  // Send message
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const newMsg: ChatMsg = {
      id: `msg-${Date.now()}`,
      sender: activeRole,
      senderName: activeRole === 'user' ? booking.customerName : booking.operatorName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');
  };

  // Status Change handler
  const handleUpdateStatus = (newStatus: TaxiBookingStatus, textReason?: string, updatedFare?: number) => {
    const updated = updateTaxiBookingStatus(booking.id, newStatus, updatedFare);
    if (updated) {
      setBooking({ ...updated });
      if (onBookingUpdated) onBookingUpdated(updated);
    } else {
      setBooking((prev) => prev ? { ...prev, status: newStatus, agreedFare: updatedFare || prev.agreedFare } : null);
    }

    // Add status card message
    const statusMsg: ChatMsg = {
      id: `status-${Date.now()}`,
      sender: 'system',
      senderName: 'HillyTrip System',
      text: textReason || `Booking status updated to: ${newStatus.toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStatusCard: true,
      newStatus,
      fareUpdate: updatedFare
    };

    setMessages((prev) => [...prev, statusMsg]);
  };

  // Quick Replies list
  const quickReplies = activeRole === 'user' ? [
    'Can you confirm pickup at Platform exit?',
    'Are all highway tolls included in this fare?',
    'Is there a roof luggage carrier on the cab?',
    'Can we make a 15-min tea stop on the way?',
    'Fare looks good! Please confirm my booking.'
  ] : [
    'Vehicle is available! Ready to confirm your trip.',
    'All highway tolls and terminal parkings are included.',
    'Roof luggage carrier is installed and free to use.',
    'Driver phone & cab registration details will be dispatched 2 hours prior.',
    'Special flat rate discount of ₹200 applied for you.'
  ];

  const handleSaveReview = () => {
    if (!booking) return;
    const updated = { ...booking, rating: userRating, reviewComment: userReview };
    saveLocalTaxiBooking(updated);
    setBooking(updated);
    setShowRatingModal(false);
    if (onBookingUpdated) onBookingUpdated(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[92vh] max-h-[800px] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col gap-3 relative shrink-0 border-b border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={booking.operatorLogo || '/images/hillytrip/taxi-transit.svg'}
                alt={booking.operatorName}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-base text-white truncate">{booking.operatorName}</h3>
                  <span className="text-emerald-400 flex items-center text-xs font-bold" title="Verified Operator">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>
                <p className="text-xs text-slate-300 truncate">
                  Vehicle: <strong className="text-amber-400">{booking.vehicleName}</strong> • {booking.passengers} Passengers
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Header - Route & Status */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-amber-400 font-extrabold">
                {booking.fromLocation} → {booking.toLocation}
              </span>
              <span className="text-slate-400">{booking.travelDate || 'Today'}, {booking.pickupTime}</span>
            </div>

            {getStatusBadge(booking.status)}
          </div>
        </div>

        {/* ROLE SIMULATION TOGGLE BAR */}
        <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="hidden sm:inline">HillyTrip Ecosystem In-App Messaging</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl font-bold">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 px-1">View As:</span>
            <button
              onClick={() => setActiveRole('user')}
              className={`px-2.5 py-0.5 rounded-lg transition cursor-pointer text-xs ${
                activeRole === 'user'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Traveler ({booking.customerName.split(' ')[0]})
            </button>
            <button
              onClick={() => setActiveRole('operator')}
              className={`px-2.5 py-0.5 rounded-lg transition cursor-pointer text-xs ${
                activeRole === 'operator'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Operator ({booking.operatorName.split(' ')[0]})
            </button>
          </div>
        </div>

        {/* TRIP DETAILS ACCORDION BAR */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30 px-4 py-2.5 text-xs">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                Trip Request Summary • Total Fare: <strong className="text-amber-600 dark:text-amber-400">₹{currentFare.toLocaleString('en-IN')}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold text-[11px]">
              <span>{showDetails ? 'Hide Details' : 'View Full Details'}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 space-y-2 border-t border-amber-200/40 dark:border-amber-900/20 mt-2 text-slate-700 dark:text-slate-300"
              >
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium block">Pickup Landmark:</span>
                    <span className="font-bold">{booking.pickupLocationDetail || 'Standard Stand / Station Exit'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Drop Landmark:</span>
                    <span className="font-bold">{booking.dropLocationDetail || 'Destination Center / Hotel'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Traveler Contact:</span>
                    <span className="font-bold">{booking.customerName} ({booking.customerPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Vehicle Requested:</span>
                    <span className="font-bold">{booking.vehicleName}</span>
                  </div>
                </div>

                {booking.specialInstructions && (
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-amber-200/50 dark:border-amber-900/30 text-[11px]">
                    <span className="text-amber-700 dark:text-amber-400 font-bold block mb-0.5">Special Instructions:</span>
                    <span>"{booking.specialInstructions}"</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MESSAGES THREAD AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/40">
          {messages.map((msg) => {
            if (msg.isStatusCard) {
              return (
                <div key={msg.id} className="my-2 flex justify-center">
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-slate-200 text-xs px-4 py-2.5 rounded-2xl max-w-md text-center space-y-1 shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 font-black text-amber-700 dark:text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>HillyTrip Booking System Update</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed">{msg.text}</p>
                    <span className="text-[9px] text-slate-400 block font-mono">{msg.timestamp}</span>
                  </div>
                </div>
              );
            }

            const isMe = (activeRole === 'user' && msg.sender === 'user') || (activeRole === 'operator' && msg.sender === 'operator');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 font-bold mb-1 px-1">
                  {msg.senderName} • {msg.timestamp}
                </span>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* ACTION CONTROL PANEL (Interactive Accept / Reject / Confirm / Edit Fare) */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
          {/* Quick replies bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase shrink-0">Quick Replies:</span>
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qr)}
                className="whitespace-nowrap px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded-full transition cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Action Buttons depending on role & status */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap text-xs">
            {activeRole === 'operator' ? (
              <div className="flex items-center gap-2 w-full justify-between flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Operator Actions:</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus('accepted', `${booking.operatorName} accepted the booking request for ₹${currentFare}.`)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Booking</span>
                      </button>

                      <button
                        onClick={() => setIsEditingFare(true)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Suggest Fare</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('rejected', `${booking.operatorName} declined this booking due to vehicle unavailability.`)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline Request</span>
                      </button>
                    </>
                  )}

                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus('confirmed', `${booking.operatorName} locked and confirmed the ride!`)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Lock & Confirm Booking</span>
                    </button>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus('completed', 'Trip completed successfully! Thank you for traveling with HillyTrip.')}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Trip Completed</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full justify-between flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-700 dark:text-slate-300">Traveler Actions:</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {(booking.status === 'accepted' || booking.status === 'negotiating') && (
                    <button
                      onClick={() => handleUpdateStatus('confirmed', `${booking.customerName} confirmed the booking at ₹${currentFare}. Ride is locked!`)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Confirm & Lock Ride (₹{currentFare})</span>
                    </button>
                  )}

                  {booking.status === 'completed' && !booking.rating && (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Rate & Review Operator</span>
                    </button>
                  )}

                  {(booking.status === 'pending' || booking.status === 'accepted' || booking.status === 'negotiating') && (
                    <button
                      onClick={() => handleUpdateStatus('cancelled', `${booking.customerName} cancelled this booking request.`)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* EDIT FARE MODAL / ROW */}
          {isEditingFare && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <span className="font-extrabold text-purple-900 dark:text-purple-300">Set Negotiated Fare:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={customFareInput}
                  onChange={(e) => setCustomFareInput(Number(e.target.value))}
                  className="w-24 bg-white dark:bg-slate-800 border border-purple-300 rounded-xl px-2.5 py-1 text-xs font-black"
                />
                <button
                  onClick={() => {
                    setIsEditingFare(false);
                    handleUpdateStatus('negotiating', `${booking.operatorName} proposed a revised fare of ₹${customFareInput.toLocaleString('en-IN')}.`, customFareInput);
                  }}
                  className="px-3 py-1 bg-purple-600 text-white font-extrabold rounded-xl"
                >
                  Submit Fare Proposal
                </button>
                <button
                  onClick={() => setIsEditingFare(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              placeholder={`Message ${activeRole === 'user' ? booking.operatorName : booking.customerName}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* RATING MODAL OVERLAY */}
        <AnimatePresence>
          {showRatingModal && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl"
              >
                <div className="text-center space-y-1">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Rate Your Ride</h4>
                  <p className="text-xs text-slate-500">How was your trip with {booking.operatorName}?</p>
                </div>

                <div className="flex justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setUserRating(s)}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star className={`w-7 h-7 ${s <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  placeholder="Share feedback on vehicle cleanliness, driver behavior, safety..."
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveReview}
                    className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl"
                  >
                    Submit Review
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
