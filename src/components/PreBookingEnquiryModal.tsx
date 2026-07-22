import React, { useState, useEffect, useRef } from 'react';
import { 
  X, MessageSquare, Calendar, Users, Home, Car, Compass, Utensils, 
  Send, Paperclip, CheckCircle2, Shield, Sparkles, Image as ImageIcon, 
  FileText, Info, ChevronRight, Star, MapPin, Tag, Clock, AlertCircle
} from 'lucide-react';
import { User } from '../types';

export interface PreBookingEnquiryBusiness {
  id: string;
  name: string;
  type: 'homestay' | 'taxi_operator' | 'tour_operator' | 'restaurant' | string;
  destination?: string;
  rating?: number | string;
  image?: string;
  ownerId?: string;
  bookingSupported?: boolean;
  bookingUrl?: string;
}

export interface PreBookingBookingDetails {
  checkIn?: string;
  checkOut?: string;
  guests?: number | string;
  roomName?: string;
}

interface PreBookingEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  business: PreBookingEnquiryBusiness | null;
  initialBookingDetails?: PreBookingBookingDetails;
  onSuccess?: (conversationId: string) => void;
  navigate?: (path: string) => void;
}

// Category lists per business type
const ENQUIRY_CATEGORIES: Record<string, { id: string; label: string; icon: string; starter: string }[]> = {
  homestay: [
    { id: 'room_avail', label: 'Room Availability', icon: '🔑', starter: "Hi, I'd like to know whether rooms are available for my selected dates." },
    { id: 'price_offers', label: 'Price & Offers', icon: '🏷️', starter: "Hi, could you please let me know if there are any special offers or discounts available?" },
    { id: 'food_meals', label: 'Food & Meals', icon: '🍲', starter: "Hi, could you please let us know what home-cooked meals are served and if traditional food is available?" },
    { id: 'pickup_taxi', label: 'Pickup / Taxi', icon: '🚖', starter: "Hi, can you arrange pickup from NJP Railway Station or Bagdogra Airport?" },
    { id: 'early_checkin', label: 'Early Check-in', icon: '🌅', starter: "Hi, we are arriving early in town. Would early check-in be possible for our stay?" },
    { id: 'late_checkout', label: 'Late Check-out', icon: '🌙', starter: "Hi, is late check-out available for our departure day?" },
    { id: 'group_booking', label: 'Group Booking', icon: '👨‍👩‍👧‍👦', starter: "Hi, we are planning a group stay and would like to check availability and special group rates." },
    { id: 'sightseeing', label: 'Local Sightseeing', icon: '⛰️', starter: "Hi, do you help organize local village walking tours and sightseeing trips?" },
    { id: 'custom_req', label: 'Custom Request', icon: '📝', starter: "Hi, I have a custom request regarding my upcoming stay." },
    { id: 'other', label: 'Other', icon: '💬', starter: "Hi, I'd like to know more about your property and services." }
  ],
  taxi_operator: [
    { id: 'veh_avail', label: 'Vehicle Availability', icon: '🚘', starter: "Hi, I'd like to check if a vehicle is available for my planned travel dates." },
    { id: 'fare_est', label: 'Fare Estimate', icon: '💰', starter: "Hi, could you please share a competitive fare estimate for my planned route?" },
    { id: 'airport_pickup', label: 'Airport Pickup', icon: '✈️', starter: "Hi, I'd like to arrange an airport pickup from Bagdogra Airport." },
    { id: 'njp_pickup', label: 'NJP Pickup', icon: '🚂', starter: "Hi, I'd like to arrange a pickup from NJP Railway Station." },
    { id: 'route_info', label: 'Route Information', icon: '🗺️', starter: "Hi, could you please share route details, road conditions, and estimated duration?" },
    { id: 'multiday', label: 'Multi-day Trip', icon: '📅', starter: "Hi, I am planning a multi-day trip in the hills and would like a dedicated cab quote." },
    { id: 'custom_trip', label: 'Custom Trip', icon: '🎯', starter: "Hi, I have a customized itinerary and need vehicle assistance." },
    { id: 'other', label: 'Other', icon: '💬', starter: "Hi, I have a query regarding vehicle rental and driver details." }
  ],
  tour_operator: [
    { id: 'tour_avail', label: 'Tour Availability', icon: '🎟️', starter: "Hi, is this tour package available for my selected travel dates?" },
    { id: 'pkg_details', label: 'Package Details', icon: '📜', starter: "Hi, could you please share the detailed day-wise itinerary and inclusions for this package?" },
    { id: 'customize_tour', label: 'Customize Tour', icon: '🎨', starter: "Hi, we would like to customize a few sightseeing spots on this tour itinerary. Is that possible?" },
    { id: 'group_disc', label: 'Group Discount', icon: '📉', starter: "Hi, do you offer any special group discounts for our travel group?" },
    { id: 'hotel_inc', label: 'Hotel Included', icon: '🏨', starter: "Hi, could you please clarify what category of hotels/homestays are included in this tour?" },
    { id: 'pickup_inc', label: 'Pickup Included', icon: '🚗', starter: "Hi, is hotel/station pickup and drop included in this package rate?" },
    { id: 'other', label: 'Other', icon: '💬', starter: "Hi, I'd like to ask a few questions before booking this tour package." }
  ],
  restaurant: [
    { id: 'table_res', label: 'Table Reservation', icon: '🍽️', starter: "Hi, I'd like to reserve a dining table for my group for our visit." },
    { id: 'group_booking', label: 'Group Booking', icon: '🎉', starter: "Hi, we have a group gathering and would like to check table arrangements and set menus." },
    { id: 'menu', label: 'Menu', icon: '📖', starter: "Hi, could you please share your active menu, daily specials, and dietary options?" },
    { id: 'event', label: 'Birthday/Event', icon: '🎂', starter: "Hi, we are celebrating a special occasion/birthday and would like to coordinate arrangements." },
    { id: 'special_req', label: 'Special Request', icon: '🥗', starter: "Hi, I have a special dietary request for our upcoming dining visit." },
    { id: 'other', label: 'Other', icon: '💬', starter: "Hi, I'd like to inquire about operating hours and location directions." }
  ]
};

export default function PreBookingEnquiryModal({
  isOpen,
  onClose,
  currentUser,
  business,
  initialBookingDetails,
  onSuccess,
  navigate
}: PreBookingEnquiryModalProps) {
  if (!isOpen || !business) return null;

  // Determine business type key for category lookup
  const bType = (business.type || 'homestay').toLowerCase();
  const categoryKey = bType.includes('taxi') || bType.includes('driver') ? 'taxi_operator'
    : bType.includes('tour') || bType.includes('package') ? 'tour_operator'
    : bType.includes('restaurant') || bType.includes('food') ? 'restaurant'
    : 'homestay';

  const categories = ENQUIRY_CATEGORIES[categoryKey] || ENQUIRY_CATEGORIES.homestay;

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].label);
  const [message, setMessage] = useState<string>(categories[0].starter);
  const [checkIn, setCheckIn] = useState<string>(initialBookingDetails?.checkIn || '');
  const [checkOut, setCheckOut] = useState<string>(initialBookingDetails?.checkOut || '');
  const [guests, setGuests] = useState<string>(String(initialBookingDetails?.guests || '2'));
  const [selectedRoom, setSelectedRoom] = useState<string>(initialBookingDetails?.roomName || '');
  
  // File upload state
  const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when category changes
  const handleSelectCategory = (cat: { id: string; label: string; starter: string }) => {
    setSelectedCategory(cat.label);
    // Auto-fill starter message
    setMessage(cat.starter);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        url: reader.result as string,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Submit Enquiry
  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write your message before sending your enquiry.');
      return;
    }

    const userId = currentUser?.id || currentUser?.uid || `guest_${Date.now()}`;

    setLoading(true);
    setError(null);

    try {
      // Build structured enquiry card JSON object
      const enquiryPayload = {
        isEnquiryCard: true,
        businessName: business.name,
        businessType: business.type,
        destination: business.destination || 'Mountain Region',
        category: selectedCategory,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        guests: guests || undefined,
        selectedRoom: selectedRoom || undefined,
        message: message.trim(),
        sentAt: new Date().toISOString()
      };

      const formattedMessage = JSON.stringify(enquiryPayload);

      // Call API to create / find conversation
      const res = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingType: categoryKey === 'taxi_operator' ? 'taxi' : categoryKey,
          listingId: business.id,
          travelerId: userId,
          firstMessage: formattedMessage
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create enquiry thread. Please try again.');
      }

      const data = await res.json();

      if (data.success && data.conversation) {
        // If it was an existing conversation, post the message explicitly
        if (!data.isNew) {
          await fetch('/api/messaging/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: data.conversation.id,
              senderId: userId,
              message: formattedMessage,
              attachmentUrl: attachment?.url,
              attachmentType: attachment?.type
            })
          });
        }

        // Save active conv id in localStorage so UnifiedInbox highlights it immediately
        localStorage.setItem('hillytrip_active_chat_conv_id', data.conversation.id);

        if (onSuccess) {
          onSuccess(data.conversation.id);
        }

        onClose();

        // Navigate directly to messaging interface
        if (navigate) {
          navigate(`#/messages?convId=${data.conversation.id}`);
        } else {
          window.location.hash = `#/messages?convId=${data.conversation.id}`;
        }
      } else {
        throw new Error(data.error || 'Failed to initialize enquiry chat.');
      }
    } catch (err: any) {
      console.error('Enquiry Submission Error:', err);
      setError(err.message || 'Something went wrong while sending your enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
              <MessageSquare className="w-5 h-5 stroke-2" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Pre-Booking Enquiry
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Direct closed-marketplace enquiry with instant host response
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitEnquiry} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Business Summary Card */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 bg-slate-200 dark:bg-slate-800">
              <img 
                src={business.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80'} 
                alt={business.name} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {categoryKey === 'taxi_operator' ? '🚖 Taxi Operator' : categoryKey === 'tour_operator' ? '⛰️ Tour Operator' : categoryKey === 'restaurant' ? '🍽️ Restaurant' : '🏡 Homestay'}
                </span>
                {business.destination && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {business.destination}
                  </span>
                )}
                {business.rating && (
                  <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5 ml-auto">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {business.rating}
                  </span>
                )}
              </div>

              <h4 className="font-black text-slate-900 dark:text-white text-base truncate">
                {business.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Verified HillyTrip Host • Escrow Protected
              </p>
            </div>
          </div>

          {/* Booking Context Section */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Selected Booking Details (Auto-attached)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Check-in</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Check-out</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Guests</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="2"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">Selected Option</span>
                <input
                  type="text"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  placeholder="e.g. Deluxe Room"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Category Chips Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                <span>Select Enquiry Topic / Category</span>
              </label>
              <span className="text-[10px] font-mono font-semibold text-slate-400">Clicking chip auto-fills message</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/40 dark:bg-slate-950/20">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.label;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>Your Message</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Editable message</span>
            </div>

            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'd like to know more about availability for my selected dates."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-slate-100 font-medium leading-relaxed focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Attachment row */}
          <div className="flex items-center justify-between pt-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*,.pdf,.doc,.docx"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Paperclip className="w-3.5 h-3.5 text-emerald-500" />
              <span>{attachment ? attachment.name : 'Attach Image or Document'}</span>
            </button>

            {attachment && (
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-[10px] text-rose-500 hover:underline font-bold"
              >
                Remove File
              </button>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer CTA */}
          <div className="pt-2 border-t border-slate-150 dark:border-slate-800 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Enquiry to Host...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Enquiry &amp; Open Chat</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" />
                Zero commercial commission guaranteed
              </span>
              <span>HillyTrip Closed Marketplace Protection</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
