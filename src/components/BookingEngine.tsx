import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, MapPin, DollarSign, Clock, CheckCircle2, XCircle, 
  AlertTriangle, MessageSquare, Shield, HelpCircle, FileText, ArrowRight, 
  User, Users, Plus, Star, Tag, ChevronDown, RefreshCw, Send, Loader2, ThumbsUp, ThumbsDown, Camera, X
} from 'lucide-react';
import { BookingLead, BookingStatusHistory } from '../types';
import ReputationDirectory from './ReputationDirectory';
import BookingSupportDisputeCenter from './BookingSupportDisputeCenter';

interface BookingEngineProps {
  currentUser: any;
  onNavigate: (hash: string) => void;
  initialTab?: string;
}

export default function BookingEngine({ currentUser, onNavigate, initialTab }: BookingEngineProps) {
  // Navigation role tabs: 'traveler' | 'provider' | 'admin' | 'reputation' | 'support'
  const [roleTab, setRoleTab] = useState<'traveler' | 'provider' | 'admin' | 'reputation' | 'support'>(() => {
    if (initialTab === 'reputation') return 'reputation';
    if (initialTab === 'provider') return 'provider';
    if (initialTab === 'admin') return 'admin';
    if (initialTab === 'support') return 'support';
    
    const roles = currentUser?.roles || [currentUser?.role || 'traveler'];
    if (roles.includes('admin') || roles.includes('super_admin')) return 'admin';
    if (roles.includes('partner')) return 'provider';
    return 'traveler';
  });

  const [bookings, setBookings] = useState<BookingLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [travelerTab, setTravelerTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // Selected Booking for Details modal
  const [selectedBooking, setSelectedBooking] = useState<BookingLead | null>(null);
  const [preSelectedBookingIdForSupport, setPreSelectedBookingIdForSupport] = useState<string | null>(null);

  // Synchronization hook to capture external redirects (e.g. from chat Report an Issue)
  useEffect(() => {
    const preSelId = localStorage.getItem('hillytrip_support_preselected_booking_id');
    const activeSupportTab = localStorage.getItem('hillytrip_booking_engine_active_tab');
    if (activeSupportTab === 'support') {
      setRoleTab('support');
      if (preSelId) {
        setPreSelectedBookingIdForSupport(preSelId);
      }
      localStorage.removeItem('hillytrip_support_preselected_booking_id');
      localStorage.removeItem('hillytrip_booking_engine_active_tab');
    }
  }, [roleTab]);
  const [bookingHistory, setBookingHistory] = useState<BookingStatusHistory[]>([]);
  const [reservationCountdown, setReservationCountdown] = useState<string | null>(null);

  // Countdown Timer for provisional locks
  useEffect(() => {
    if (!selectedBooking || !selectedBooking.reservationExpiresAt) {
      setReservationCountdown(null);
      return;
    }

    const updateTimer = () => {
      const expiry = new Date(selectedBooking.reservationExpiresAt!).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setReservationCountdown('EXPIRED');
        fetchBookings();
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setReservationCountdown(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [selectedBooking]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Simulation Widget state
  const [showSimulator, setShowSimulator] = useState(false);
  const [simType, setSimType] = useState<'taxi' | 'homestay' | 'tour' | 'guide' | 'activity'>('taxi');
  const [simName, setSimName] = useState('John Doe');
  const [simEmail, setSimEmail] = useState('johndoe@example.com');
  const [simMobile, setSimMobile] = useState('+91 98765 43210');
  const [simDate, setSimDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [simAmount, setSimAmount] = useState('3200');
  const [simServiceName, setSimServiceName] = useState('Scenic Mountain Cab (Kalka to Shimla)');
  const [simGuests, setSimGuests] = useState('3');
  const [simSpecialRequests, setSimSpecialRequests] = useState('Need a luggage carrier and experienced driver for high mountain curves.');
  const [creatingSim, setCreatingSim] = useState(false);

  // Cancellation and Status modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'accept' | 'reject' | 'confirm' | 'cancel' | 'complete' | 'dispute' | 'pay' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Reviews & Reputation System State
  const [bookingReviews, setBookingReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<BookingLead | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revRecommend, setRevRecommend] = useState(true);
  const [revExperience, setRevExperience] = useState(5);
  const [revCleanliness, setRevCleanliness] = useState(5);
  const [revBehaviour, setRevBehaviour] = useState(5);
  const [revPunctuality, setRevPunctuality] = useState(5);
  const [revValue, setRevValue] = useState(5);
  const [revPhotos, setRevPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/booking-reviews?showHidden=true');
      if (res.ok) {
        setBookingReviews(await res.json());
      }
    } catch (err) {
      console.error('Failed to load reviews in BookingEngine:', err);
    }
  };

  // Trip Information Fulfillment state
  const [showTripInfoModal, setShowTripInfoModal] = useState(false);
  const [tripDriverName, setTripDriverName] = useState('');
  const [tripDriverMobile, setTripDriverMobile] = useState('');
  const [tripVehicleType, setTripVehicleType] = useState('SUV');
  const [tripVehicleModel, setTripVehicleModel] = useState('');
  const [tripVehicleReg, setTripVehicleReg] = useState('');
  const [tripPickupLocation, setTripPickupLocation] = useState('');
  const [tripMeetingPoint, setTripMeetingPoint] = useState('');
  const [tripPickupTime, setTripPickupTime] = useState('');
  const [tripNotes, setTripNotes] = useState('');
  const [submittingTripInfo, setSubmittingTripInfo] = useState(false);

  const applyTripTemplate = (templateName: string) => {
    if (templateName === 'njp') {
      setTripMeetingPoint('NJP Railway Station Main Exit (Under Clock Tower)');
      setTripNotes('Driver will be waiting with a name card placard. Local parking fee is fully covered. Do not engage with local unauthorized station agents.');
    } else if (templateName === 'bagdogra') {
      setTripMeetingPoint('Bagdogra Airport Gate 2 Arrival Lobby Exit');
      setTripNotes('Driver will monitor flight status. Please switch on your phone after landing. Prepaid airport entry toll is covered.');
    } else if (templateName === 'gangtok') {
      setTripMeetingPoint('Deorali Taxi Stand Main Booking Counter');
      setTripNotes('Kindly keep passenger permit copies ready if booking proceeds to restricted North Sikkim / Nathu La zones.');
    } else if (templateName === 'darjeeling') {
      setTripMeetingPoint('Darjeeling Tourist Club / Town Stand Parking Exit');
      setTripNotes('Standard scenic sightseeing stop points can be adjusted with driver directly on route.');
    } else if (templateName === 'kalimpong') {
      setTripMeetingPoint('Kalimpong Main Stand near Central Clock monument');
      setTripNotes('Driver has experience on high-altitude mountain curves and will guide on local sightseeing routes.');
    }
  };

  const handleSaveTripInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSubmittingTripInfo(true);
    try {
      const res = await fetch(`/api/booking-leads/${selectedBooking.id}/trip-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: tripDriverName,
          driverMobile: tripDriverMobile,
          vehicleType: tripVehicleType,
          vehicleModel: tripVehicleModel,
          vehicleReg: tripVehicleReg,
          pickupLocation: tripPickupLocation,
          meetingPoint: tripMeetingPoint,
          pickupTime: tripPickupTime,
          notes: tripNotes,
          operatorEmail: currentUser?.email || 'operator@hillytrip.com',
          operatorName: currentUser?.name || 'HillyTrip Taxi Operator'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.lead) {
          setSelectedBooking(data.lead);
          fetchBookings();
          setShowTripInfoModal(false);
          // Clear form fields
          setTripDriverName('');
          setTripDriverMobile('');
          setTripVehicleType('SUV');
          setTripVehicleModel('');
          setTripVehicleReg('');
          setTripMeetingPoint('');
          setTripNotes('');
        } else {
          alert(data.error || 'Failed to save trip information.');
        }
      } else {
        alert('Failed to save trip details.');
      }
    } catch (err) {
      console.error(err);
      alert('Error sharing trip details.');
    } finally {
      setSubmittingTripInfo(false);
    }
  };

  // Fetch all bookings based on current role selection
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/booking-leads';
      if (roleTab === 'traveler') {
        const identifier = currentUser?.email || currentUser?.mobile || '';
        url = `/api/booking-leads?role=customer&identifier=${encodeURIComponent(identifier)}`;
      } else if (roleTab === 'provider') {
        const identifier = currentUser?.id || currentUser?.email || 'partner_hillytrip';
        url = `/api/booking-leads?role=partner&identifier=${encodeURIComponent(identifier)}`;
      } else {
        // Admin
        url = `/api/booking-leads?role=admin`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Sort by newest first
          const sorted = (data.leads || []).sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setBookings(sorted);
        } else {
          setError(data.error || 'Failed to fetch bookings.');
        }
      } else {
        setError('Failed to fetch bookings from server.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading bookings.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Selected Booking Status History (Timeline)
  const fetchBookingHistory = async (bookingId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/booking-leads/${bookingId}/history`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBookingHistory(data.history || []);
        }
      }
    } catch (err) {
      console.error('Failed to load status history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchReviews();
  }, [roleTab, currentUser]);

  useEffect(() => {
    if (selectedBooking) {
      fetchBookingHistory(selectedBooking.id);
    }
  }, [selectedBooking]);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedBooking || !statusAction) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/booking-leads/${selectedBooking.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: statusAction === 'dispute' ? 'cancel' : statusAction,
          note: actionNote || `${statusAction.toUpperCase()} requested via booking engine dashboard`,
          userEmail: currentUser?.email || 'system_operator@hillytrip.com',
          userRole: roleTab === 'admin' ? 'admin' : roleTab === 'provider' ? 'partner' : 'customer'
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh details
        const updatedBookingRes = await fetch('/api/booking-leads');
        if (updatedBookingRes.ok) {
          const uData = await updatedBookingRes.json();
          const found = (uData.leads || []).find((l: any) => l.id === selectedBooking.id);
          if (found) {
            setSelectedBooking(found);
          }
        }
        fetchBookings();
        setShowStatusModal(false);
        setActionNote('');
        setStatusAction(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to update booking status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Initiate Chat via Universal Communication Engine
  const handleOpenChat = async (booking: BookingLead) => {
    try {
      // Create or retrieve chat conversation
      const partnerId = booking.assignedPartnerId || 'partner_hillytrip';
      const res = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingType: booking.leadType,
          listingId: booking.serviceId || booking.id,
          travelerId: currentUser?.email || currentUser?.id || 'anonymous_traveler',
          firstMessage: `Hi, I would like to chat regarding my HillyTrip Booking ID #${booking.id} (${booking.serviceName || booking.leadType}).`
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.conversation) {
          // Set active conversation in local storage so UnifiedInbox focuses it
          localStorage.setItem('hillytrip_active_chat_conv_id', data.conversation.id);
          // Redirect to messages page/tab
          onNavigate('#/messages');
        }
      } else {
        alert('Could not open chat workspace.');
      }
    } catch (err) {
      console.error('Error opening chat workspace:', err);
    }
  };

  // Open Review Form Dialog (Support creating and editing within 7-day lock window)
  const handleOpenReviewModal = (booking: BookingLead, existingReview?: any) => {
    setReviewBooking(booking);
    if (existingReview) {
      setEditingReviewId(existingReview.id);
      setRevRating(existingReview.rating);
      setRevTitle(existingReview.title || '');
      setRevComment(existingReview.comment || '');
      setRevRecommend(existingReview.wouldRecommend !== false);
      setRevExperience(existingReview.tripExperience || existingReview.rating);
      setRevCleanliness(existingReview.vehicleCleanliness || existingReview.rating);
      setRevBehaviour(existingReview.driverBehaviour || existingReview.rating);
      setRevPunctuality(existingReview.punctuality || existingReview.rating);
      setRevValue(existingReview.valueForMoney || existingReview.rating);
      setRevPhotos(existingReview.photos || []);
    } else {
      setEditingReviewId(null);
      setRevRating(5);
      setRevTitle('');
      setRevComment('');
      setRevRecommend(true);
      setRevExperience(5);
      setRevCleanliness(5);
      setRevBehaviour(5);
      setRevPunctuality(5);
      setRevValue(5);
      setRevPhotos([]);
    }
    setShowReviewModal(true);
  };

  const handleReviewPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 5 - revPhotos.length;
    if (remainingSlots <= 0) {
      alert('Maximum of 5 photos is allowed.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingPhotos(true);

    try {
      const uploadedUrls = [...revPhotos];
      for (const file of filesToUpload) {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;

        const res = await fetch('/api/booking-reviews/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            filename: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${file.name}`,
            mimeType: file.type
          })
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          console.error('Failed to upload image:', file.name);
        }
      }
      setRevPhotos(uploadedUrls);
    } catch (err) {
      console.error(err);
      alert('Error during image upload.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeleteReviewPhoto = (index: number) => {
    setRevPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setSubmittingReview(true);
    try {
      const payload = {
        bookingId: reviewBooking.id,
        travellerId: currentUser?.email || 'traveller@hillytrip.com',
        travellerName: currentUser?.name || 'HillyTrip Traveller',
        operatorId: reviewBooking.assignedPartnerId || 'partner_hillytrip',
        operatorName: reviewBooking.assignedPartnerName || 'HillyTrip Taxi Fleet (Shimla-Manali Direct)',
        driverName: reviewBooking.cabDriverName || 'HillyTrip Driver',
        route: reviewBooking.pickupLocation && reviewBooking.dropLocation 
          ? `${reviewBooking.pickupLocation} to ${reviewBooking.dropLocation}` 
          : 'Shimla - Kalka Route',
        rating: revRating,
        title: revTitle,
        comment: revComment,
        wouldRecommend: revRecommend,
        tripExperience: revExperience,
        vehicleCleanliness: revCleanliness,
        driverBehaviour: revBehaviour,
        punctuality: revPunctuality,
        valueForMoney: revValue,
        photos: revPhotos
      };

      let url = '/api/booking-reviews';
      let method = 'POST';

      if (editingReviewId) {
        url = `/api/booking-reviews/${editingReviewId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowReviewModal(false);
        fetchReviews();
        alert(editingReviewId ? 'Your review was updated successfully!' : 'Thank you! Your verified review has been published.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Simulation Booking submission
  const handleCreateSimulatorBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSim(true);
    try {
      const payload = {
        customerName: simName,
        customerMobile: simMobile,
        customerEmail: simEmail,
        leadType: simType,
        checkInDate: simDate,
        checkOutDate: simType === 'homestay' ? new Date(new Date(simDate).getTime() + 86400000).toISOString().split('T')[0] : undefined,
        numberOfGuests: Number(simGuests),
        specialRequest: simSpecialRequests,
        serviceId: `srv_${simType}_${Math.floor(1000 + Math.random() * 9000)}`,
        serviceName: simServiceName,
        assignedPartnerId: roleTab === 'provider' ? (currentUser?.id || currentUser?.email) : 'partner_hillytrip',
        assignedPartnerName: roleTab === 'provider' ? (currentUser?.name || 'My Business') : 'Himalayan Travel Operator',
        bookingAmount: Number(simAmount),
        currency: 'INR',
        notes: 'Simulated production-ready engine registration.'
      };

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setShowSimulator(false);
          fetchBookings();
          // Reset form slightly
          setSimSpecialRequests('');
        }
      }
    } catch (err) {
      console.error('Failed to simulate:', err);
    } finally {
      setCreatingSim(false);
    }
  };

  // Status Badge styling helper
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let bg = 'bg-slate-100 text-slate-700';
    let icon = <Clock className="w-3 h-3" />;

    if (s === 'pending' || s === 'new') {
      bg = 'bg-amber-100/70 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200/50';
      icon = <Clock className="w-3 h-3 animate-pulse" />;
    } else if (s === 'reserved') {
      bg = 'bg-indigo-100/80 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50';
      icon = <Clock className="w-3 h-3 animate-pulse" />;
    } else if (s === 'awaiting_payment') {
      bg = 'bg-violet-100/80 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200/50';
      icon = <Clock className="w-3 h-3 animate-pulse" />;
    } else if (s === 'in_progress') {
      bg = 'bg-blue-100/80 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50';
      icon = <Clock className="w-3 h-3" />;
    } else if (s === 'accepted' || s === 'confirmed' || s === 'payment_verified' || s === 'trip_info_shared') {
      bg = 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50';
      icon = <CheckCircle2 className="w-3 h-3" />;
    } else if (s === 'completed') {
      bg = 'bg-sky-100/80 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/50';
      icon = <CheckCircle2 className="w-3 h-3" />;
    } else if (s === 'cancelled' || s === 'rejected' || s === 'expired') {
      bg = 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50';
      icon = <XCircle className="w-3 h-3" />;
    } else if (s === 'need_more_info') {
      bg = 'bg-indigo-100/80 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/50';
      icon = <HelpCircle className="w-3 h-3" />;
    } else if (s === 'refund_pending') {
      bg = 'bg-orange-100/80 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200/50';
      icon = <HelpCircle className="w-3 h-3" />;
    } else if (s === 'refunded') {
      bg = 'bg-slate-100/80 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300 border border-slate-200/50';
      icon = <CheckCircle2 className="w-3 h-3" />;
    } else if (s === 'no_show') {
      bg = 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50';
      icon = <XCircle className="w-3 h-3" />;
    } else if (s === 'draft') {
      bg = 'bg-slate-100/80 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/50';
      icon = <HelpCircle className="w-3 h-3" />;
    }

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full ${bg}`}>
        {icon}
        {status === 'trip_info_shared' ? 'Trip Info Shared' : status === 'awaiting_payment' ? 'Awaiting Payment' : status === 'refund_pending' ? 'Refund Pending' : status}
      </span>
    );
  };

  // Booking Type badge
  const getTypeBadge = (type: string) => {
    let text = 'Service';
    let emoji = '🔮';
    let color = 'bg-slate-100 text-slate-700';

    if (type === 'taxi') {
      text = 'Reserved Taxi';
      emoji = '🚕';
      color = 'bg-amber-100 text-amber-900 border border-amber-200/40';
    } else if (type === 'homestay') {
      text = 'Eco Homestay';
      emoji = '🏡';
      color = 'bg-emerald-100 text-emerald-900 border border-emerald-200/40';
    } else if (type === 'tour' || type === 'planner') {
      text = 'Tour Package';
      emoji = '🗺️';
      color = 'bg-sky-100 text-sky-900 border border-sky-200/40';
    } else if (type === 'guide') {
      text = 'Tour Guide';
      emoji = '👤';
      color = 'bg-indigo-100 text-indigo-900 border border-indigo-200/40';
    } else if (type === 'activity') {
      text = 'Adventure Activity';
      emoji = '🪂';
      color = 'bg-violet-100 text-violet-900 border border-violet-200/40';
    }

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${color}`}>
        <span>{emoji}</span>
        <span>{text}</span>
      </span>
    );
  };

  // Filter Logic
  const filteredBookings = bookings.filter(b => {
    // Search filter
    const searchString = `${b.id} ${b.customerName} ${b.serviceName || ''} ${b.customerEmail || ''} ${b.assignedPartnerName || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType = typeFilter === 'all' || b.leadType === typeFilter;

    // Status / Tab filter
    let matchesTab = true;
    if (roleTab === 'traveler') {
      if (travelerTab === 'upcoming') {
        matchesTab = ['new', 'pending', 'accepted', 'confirmed', 'need_more_info'].includes(b.status.toLowerCase());
      } else if (travelerTab === 'completed') {
        matchesTab = b.status.toLowerCase() === 'completed';
      } else if (travelerTab === 'cancelled') {
        matchesTab = ['cancelled', 'rejected', 'expired'].includes(b.status.toLowerCase());
      }
    } else {
      matchesTab = statusFilter === 'all' || b.status.toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesType && matchesTab;
  });

  return (
    <div id="universal-booking-engine" className="space-y-6 text-slate-800 dark:text-slate-100 text-left">
      {/* Engine Hero Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200')] bg-cover bg-center" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
              Universal Booking Engine (UBE)
            </span>
            <h1 className="text-3xl font-black tracking-tight leading-none">HillyTrip Booking Management</h1>
            <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
              Fully centralized operational core powering <strong>Reserved Taxi</strong>, <strong>Eco Homestays</strong>, 
              <strong> Tour Packages</strong>, <strong>Professional Guides</strong>, and <strong>Local Activities</strong>.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowSimulator(true)}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Offline Booking
            </button>
            <button
              onClick={fetchBookings}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/10 p-3 rounded-2xl transition cursor-pointer"
              title="Refresh dataset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Role workspace selector */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl max-w-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setRoleTab('traveler')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
            roleTab === 'traveler'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          👤 My Bookings
        </button>
        <button
          onClick={() => setRoleTab('provider')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
            roleTab === 'provider'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          💼 Operator View
        </button>
        <button
          onClick={() => setRoleTab('reputation')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
            roleTab === 'reputation'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          ⭐ Reputation Desk
        </button>
        <button
          onClick={() => setRoleTab('support')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
            roleTab === 'support'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          🆘 Disputes Desk
        </button>
        <button
          onClick={() => setRoleTab('admin')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-wider cursor-pointer ${
            roleTab === 'admin'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          🛡️ Control Desk
        </button>
      </div>

      {/* Main dashboard content */}
      {roleTab === 'support' ? (
        <BookingSupportDisputeCenter 
          currentUser={currentUser} 
          bookings={bookings} 
          preSelectedBookingId={preSelectedBookingIdForSupport}
          onCloseForm={() => setPreSelectedBookingIdForSupport(null)}
          onOpenChat={handleOpenChat}
        />
      ) : roleTab === 'reputation' ? (
        <ReputationDirectory currentUser={currentUser} bookings={bookings} onReviewSubmitted={fetchReviews} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filters and List panel */}
        <div className="lg:col-span-12 space-y-4">
          <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 space-y-4">
            
            {/* Search & filters controls */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bookings by ID, customer name, destination, or operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white outline-none"
                />
              </div>

              {/* Service Type selector */}
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Type</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 font-bold outline-none cursor-pointer focus:ring-0"
                  >
                    <option value="all">All Services</option>
                    <option value="taxi">Taxi Services</option>
                    <option value="homestay">Eco Homestays</option>
                    <option value="tour">Tour Packages</option>
                    <option value="guide">Guides</option>
                    <option value="activity">Activities</option>
                  </select>
                </div>

                {/* Status selector (Admin & Provider only) */}
                {roleTab !== 'traveler' && (
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 font-bold outline-none cursor-pointer focus:ring-0"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rejected">Rejected</option>
                      <option value="need_more_info">Need Info</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Traveller specific Subtabs */}
            {roleTab === 'traveler' && (
              <div className="flex border-b border-slate-100 dark:border-slate-800 gap-6">
                {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTravelerTab(tab)}
                    className={`pb-3 text-xs font-bold capitalize transition-all relative cursor-pointer ${
                      travelerTab === tab 
                        ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                        : 'text-slate-450 hover:text-slate-800'
                    }`}
                  >
                    {tab} Bookings
                    {travelerTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Bookings List section */}
            {loading ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                <p className="text-xs text-slate-450 italic">Syncing live booking ledger from HillyTrip Core...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Bookings Located</h4>
                <p className="text-xs text-slate-450 max-w-md mx-auto mt-1 leading-relaxed">
                  There are no registrations matching your search or filters. Use the "Create Simulated Booking" button above to add sample datasets instantly!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/65 dark:border-slate-800/80 hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div className="space-y-3 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[11px] font-bold text-slate-400">#{booking.id}</span>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">
                          {booking.serviceName || booking.homestayName || booking.cabDriverName || 'HillyTrip Service'}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(booking.leadType)}
                          <span className="text-[10px] text-slate-400 font-bold font-mono">
                            ₹{booking.bookingAmount || 2500} {booking.currency || 'INR'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Journey Date: <strong>{booking.checkInDate}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Traveller: <strong>{booking.customerName}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Operator: <strong>{booking.assignedPartnerName || 'HillyTrip Operator'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-[11px] font-bold py-2 rounded-xl transition border border-slate-200 dark:border-slate-700 cursor-pointer text-center whitespace-nowrap"
                      >
                        Timeline
                      </button>
                      {booking.status.toLowerCase() === 'completed' && roleTab === 'traveler' && (
                        (() => {
                          const existingReview = bookingReviews.find(r => r.bookingId === booking.id);
                          if (existingReview) {
                            const createdTime = new Date(existingReview.createdAt).getTime();
                            const editWindowOpen = (Date.now() - createdTime) < 7 * 24 * 60 * 60 * 1005; // 7 days
                            if (editWindowOpen) {
                              return (
                                <button
                                  onClick={() => handleOpenReviewModal(booking, existingReview)}
                                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black py-2 rounded-xl transition cursor-pointer text-center whitespace-nowrap"
                                >
                                  ⭐ Edit Rev
                                </button>
                              );
                            } else {
                              return (
                                <span
                                  className="flex-1 bg-slate-100 dark:bg-slate-900 text-slate-400 text-[10px] font-bold py-2 rounded-xl border border-slate-1.50 dark:border-slate-800 text-center inline-flex items-center justify-center gap-0.5"
                                  title="Review is locked (7-day window passed)"
                                >
                                  ★ {existingReview.rating}/5
                                </span>
                              );
                            }
                          } else {
                            return (
                              <button
                                onClick={() => handleOpenReviewModal(booking)}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-[11px] font-black py-2 rounded-xl transition cursor-pointer text-center whitespace-nowrap"
                              >
                                ⭐ Review
                              </button>
                            );
                          }
                        })()
                      )}
                      <button
                        onClick={() => handleOpenChat(booking)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/30 dark:text-emerald-400 rounded-xl transition border border-transparent cursor-pointer"
                        title="Chat with other party"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

      {/* Details & Timeline Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-scale-up text-left">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Unified Booking Record</span>
                <h3 className="text-lg font-black mt-0.5">#{selectedBooking.id} Details & History</h3>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-black p-2 rounded-xl transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Service Category</span>
                    {getTypeBadge(selectedBooking.leadType)}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Service</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{selectedBooking.serviceName || selectedBooking.homestayName || selectedBooking.cabDriverName || 'HillyTrip Service'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Headcount</span>
                    <strong className="text-slate-800 dark:text-slate-200">{selectedBooking.numberOfGuests} Traveler(s)</strong>
                  </div>
                  {selectedBooking.specialRequest && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Special Requests</span>
                      <p className="text-slate-600 dark:text-slate-350 italic">"{selectedBooking.specialRequest}"</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Dates of Booking</span>
                    <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {selectedBooking.checkInDate} {selectedBooking.checkOutDate ? `➔ ${selectedBooking.checkOutDate}` : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Booking Amount</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-bold font-mono">
                      ₹{selectedBooking.bookingAmount || 2500} {selectedBooking.currency || 'INR'}
                    </strong>
                    {selectedBooking.pricingSnapshot ? (
                      <div className="mt-1.5 p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl space-y-1 text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex justify-between">
                          <span>Base Rate:</span>
                          <span>₹{selectedBooking.pricingSnapshot.baseRate}</span>
                        </div>
                        {selectedBooking.pricingSnapshot.holidayAdjustment > 0 && (
                          <div className="flex justify-between text-amber-600 dark:text-amber-400">
                            <span>Holiday Factor:</span>
                            <span>+₹{selectedBooking.pricingSnapshot.holidayAdjustment}</span>
                          </div>
                        )}
                        {selectedBooking.pricingSnapshot.seasonalAdjustment > 0 && (
                          <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                            <span>Seasonal Factor:</span>
                            <span>+₹{selectedBooking.pricingSnapshot.seasonalAdjustment}</span>
                          </div>
                        )}
                        {selectedBooking.pricingSnapshot.weekendAdjustment > 0 && (
                          <div className="flex justify-between text-blue-600 dark:text-blue-400">
                            <span>Weekend Factor:</span>
                            <span>+₹{selectedBooking.pricingSnapshot.weekendAdjustment}</span>
                          </div>
                        )}
                        {(selectedBooking.pricingSnapshot.taxes + selectedBooking.pricingSnapshot.fees) > 0 && (
                          <div className="flex justify-between">
                            <span>Taxes & Fees:</span>
                            <span>+₹{selectedBooking.pricingSnapshot.taxes + selectedBooking.pricingSnapshot.fees}</span>
                          </div>
                        )}
                        {selectedBooking.pricingSnapshot.discounts > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>Discounts Applied:</span>
                            <span>-₹{selectedBooking.pricingSnapshot.discounts}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-800 pt-1 text-slate-800 dark:text-slate-200">
                          <span>Final Total:</span>
                          <span>₹{selectedBooking.pricingSnapshot.grandTotal}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1.5 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-[9px] text-slate-500 font-mono">
                        Base standard tier locked pricing applied.
                      </div>
                    )}
                  </div>
                  {reservationCountdown && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center justify-between font-bold animate-pulse">
                      <span className="flex items-center gap-1.5 uppercase text-[9px] tracking-widest">
                        ⚠️ Provisional Hold
                      </span>
                      <span className="font-mono text-xs">{reservationCountdown === 'EXPIRED' ? 'EXPIRED (RELEASED)' : `Expires in ${reservationCountdown}`}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current State</span>
                    <div className="mt-0.5">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Traveller Profile</span>
                    <div className="text-slate-700 dark:text-slate-300">
                      <strong>{selectedBooking.customerName}</strong> ({selectedBooking.customerEmail || 'traveler@hillytrip.com'})
                      {selectedBooking.contactRevealed && (
                        <div className="font-mono mt-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          📞 {selectedBooking.customerMobile}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Information Section (Active & History) */}
              {selectedBooking.leadType === 'taxi' && selectedBooking.tripInformationHistory && selectedBooking.tripInformationHistory.length > 0 && (() => {
                const latestTrip = selectedBooking.tripInformationHistory.find((t: any) => t.status === 'active') || selectedBooking.tripInformationHistory[selectedBooking.tripInformationHistory.length - 1];
                return (
                  <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-md space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] uppercase font-black px-3.5 py-1 rounded-bl-xl tracking-wider">
                        ★ Latest Trip Details (Active)
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🚖</span>
                        <div>
                          <h4 className="font-extrabold text-xs tracking-tight text-white uppercase">Active Driver & Ride Information</h4>
                          <p className="text-[10px] text-slate-400">Assigned by operator for your journey</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block">👤 Driver Contact</span>
                          <div className="font-black text-xs text-white">{latestTrip.driverName}</div>
                          <a href={`tel:${latestTrip.driverMobile}`} className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-mono font-bold mt-1 text-[11px]">
                            📞 {latestTrip.driverMobile}
                          </a>
                        </div>

                        <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block">🚙 Assigned Vehicle</span>
                          <div className="font-black text-[11px] text-white">{latestTrip.vehicleType} {latestTrip.vehicleModel ? `• ${latestTrip.vehicleModel}` : ''}</div>
                          <div className="font-mono text-[10px] font-black tracking-wider text-slate-300 mt-1 uppercase bg-white/10 px-2 py-0.5 rounded inline-block">
                            {latestTrip.vehicleReg}
                          </div>
                        </div>

                        <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5 sm:col-span-2 text-left">
                          <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block">📍 Pickup & Rendezvous</span>
                          <div className="font-semibold text-slate-200">
                            <span className="text-slate-400 font-bold">Location:</span> {latestTrip.pickupLocation}
                          </div>
                          {latestTrip.meetingPoint && (
                            <div className="font-semibold text-slate-200 mt-1">
                              <span className="text-slate-400 font-bold">Meeting Point:</span> {latestTrip.meetingPoint}
                            </div>
                          )}
                          <div className="font-mono text-[10px] text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                            🕘 Scheduled Pickup: {latestTrip.pickupTime}
                          </div>
                        </div>
                      </div>

                      {latestTrip.notes && (
                        <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 text-[10px] text-slate-300 leading-relaxed italic">
                          <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block not-italic mb-1">📝 Trip Instructions</span>
                          "{latestTrip.notes}"
                        </div>
                      )}
                    </div>

                    {/* Historical Updates list */}
                    {selectedBooking.tripInformationHistory.length > 1 && (
                      <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850">
                        <h5 className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase text-[9px] tracking-wider text-slate-400">
                          ⏱️ Historical Trip Updates ({selectedBooking.tripInformationHistory.length - 1} Superseded)
                        </h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {selectedBooking.tripInformationHistory
                            .filter((t: any) => t.status === 'superseded')
                            .reverse()
                            .map((prev: any) => (
                              <div key={prev.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 transition space-y-1 text-[11px]">
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
                                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[8px] uppercase font-black px-1.5 py-0.2 rounded">
                                    Superseded (v{prev.version})
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono font-bold">
                                    {new Date(prev.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-700 dark:text-slate-300">
                                  <div><strong>Driver:</strong> {prev.driverName} ({prev.driverMobile})</div>
                                  <div><strong>Vehicle:</strong> {prev.vehicleType} • {prev.vehicleReg}</div>
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Booking state actions */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <h4 className="font-black text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  ⚙️ Booking Actions Core
                </h4>
                <div className="flex flex-wrap gap-2">
                  
                  {/* Provider Accept / Reject */}
                  {roleTab === 'provider' && selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => { setStatusAction('accept'); setShowStatusModal(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                      >
                        Accept Booking
                      </button>
                      <button
                        onClick={() => { setStatusAction('reject'); setShowStatusModal(true); }}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                      >
                        Decline Request
                      </button>
                    </>
                  )}

                  {/* Provider Confirm Booking */}
                  {roleTab === 'provider' && ['pending', 'accepted'].includes(selectedBooking.status) && (
                    <button
                      onClick={() => { setStatusAction('confirm'); setShowStatusModal(true); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                    >
                      Confirm Booking
                    </button>
                  )}

                  {/* Provider Share / Update Trip Information (Taxi only) */}
                  {roleTab === 'provider' && selectedBooking.leadType === 'taxi' && ['confirmed', 'trip_info_shared'].includes(selectedBooking.status) && (
                    <button
                      onClick={() => {
                        const activeTrip = selectedBooking.tripInformationHistory?.find((t: any) => t.status === 'active') || selectedBooking.tripInformationHistory?.[selectedBooking.tripInformationHistory?.length - 1];
                        setTripDriverName(activeTrip?.driverName || '');
                        setTripDriverMobile(activeTrip?.driverMobile || '');
                        setTripVehicleType(activeTrip?.vehicleType || 'SUV');
                        setTripVehicleModel(activeTrip?.vehicleModel || '');
                        setTripVehicleReg(activeTrip?.vehicleReg || '');
                        setTripPickupLocation(activeTrip?.pickupLocation || selectedBooking.pickupLocation || '');
                        setTripMeetingPoint(activeTrip?.meetingPoint || '');
                        setTripPickupTime(activeTrip?.pickupTime || selectedBooking.checkInDate || '');
                        setTripNotes(activeTrip?.notes || '');
                        setShowTripInfoModal(true);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🚕</span>
                      {selectedBooking.tripInformationHistory?.length > 0 ? 'Update Trip Information' : 'Share Trip Information'}
                    </button>
                  )}

                  {/* Traveler Simulate Payment & Confirm */}
                  {['reserved', 'awaiting_payment'].includes(selectedBooking.status) && (
                    <button
                      onClick={() => { setStatusAction('pay'); setShowStatusModal(true); }}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md animate-pulse"
                    >
                      💳 Simulate Payment & Confirm
                    </button>
                  )}

                  {/* Traveler / Admin Cancel */}
                  {['pending', 'confirmed', 'accepted', 'trip_info_shared', 'reserved', 'awaiting_payment'].includes(selectedBooking.status) && (
                    <button
                      onClick={() => { setStatusAction('cancel'); setShowStatusModal(true); }}
                      className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-850 dark:text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {/* Provider / Admin Complete */}
                  {['confirmed', 'trip_info_shared'].includes(selectedBooking.status) && (
                    <button
                      onClick={() => { setStatusAction('complete'); setShowStatusModal(true); }}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                    >
                      Mark Journey Completed
                    </button>
                  )}

                  {/* Admin Resolve Dispute */}
                  {roleTab === 'admin' && (
                    <button
                      onClick={() => { setStatusAction('dispute'); setShowStatusModal(true); }}
                      className="bg-amber-650 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                    >
                      Resolve Dispute & Cancel
                    </button>
                  )}

                  {/* Trigger chat anyway */}
                  <button
                    onClick={() => handleOpenChat(selectedBooking)}
                    className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-250 dark:border-slate-750 text-slate-800 dark:text-white font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    Open Chat Workspace
                  </button>

                  {/* NEED HELP SUPPORT ENTRY POINT */}
                  <button
                    onClick={() => {
                      setPreSelectedBookingIdForSupport(selectedBooking.id);
                      setRoleTab('support');
                      setSelectedBooking(null);
                    }}
                    className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    🆘 Need Help
                  </button>
                </div>
              </div>

              {/* Status Timeline History */}
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Booking Lifecycle Timeline
                  </h4>
                  <button
                    onClick={() => {
                      setPreSelectedBookingIdForSupport(selectedBooking.id);
                      setRoleTab('support');
                      setSelectedBooking(null);
                    }}
                    className="text-[10.5px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-950 transition cursor-pointer flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Get Support
                  </button>
                </div>
                
                {loadingHistory ? (
                  <p className="text-slate-400 italic">Syncing event streams...</p>
                ) : bookingHistory.length === 0 ? (
                  <p className="text-slate-400 italic">No lifecycle logs recorded for this record.</p>
                ) : (
                  <div className="relative pl-6 border-l-2 border-emerald-550 ml-3 space-y-5 py-2">
                    {bookingHistory.map((history, idx) => (
                      <div key={history.id} className="relative">
                        {/* Dot marker */}
                        <span className="absolute -left-[31px] top-1 bg-white dark:bg-slate-900 border-2 border-emerald-500 w-4 h-4 rounded-full flex items-center justify-center">
                          <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full" />
                        </span>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-black">
                              {history.newStatus}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {new Date(history.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-slate-200 font-semibold text-xs">
                            {history.note || `Booking status updated to ${history.newStatus}`}
                          </p>
                          <div className="text-[10px] text-slate-450 dark:text-slate-400">
                            Action by: <span className="capitalize font-mono font-bold">{history.changedBy}</span> 
                            {history.changedById && ` (${history.changedById})`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-850 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Close Records Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Status Update Modal */}
      {showStatusModal && statusAction && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 animate-scale-up text-left shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-sm text-slate-950 dark:text-white capitalize">
                  {statusAction === 'dispute' ? 'Resolve Dispute' : `${statusAction} Booking`}
                </h4>
                <p className="text-[11px] text-slate-400">Provide an optional cancellation or status note below.</p>
              </div>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">State Modification Notes / Reason</label>
              <textarea
                placeholder="Describe reason for cancel/accept/complete..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 outline-none h-24"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowStatusModal(false)}
                className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Status Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Creation Drawer / Modal */}
      {showSimulator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-up text-left shadow-2xl">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Operational Wizard</span>
                <h3 className="text-lg font-black mt-0.5">Administrative Booking Entry</h3>
              </div>
              <button 
                onClick={() => setShowSimulator(false)}
                className="text-slate-400 hover:text-white font-black p-1.5"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSimulatorBooking} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-indigo-800 dark:text-indigo-300">
                Create real database booking records for any of HillyTrip's 5 major core modules to update visual timeline states, chat deep links, and admin dispute handling immediately.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Booking Category *</label>
                  <select
                    value={simType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setSimType(val);
                      if (val === 'taxi') {
                        setSimServiceName('Scenic Mountain Cab (Kalka to Shimla)');
                        setSimAmount('3500');
                      } else if (val === 'homestay') {
                        setSimServiceName('Eco Cedar Cottage Retreat (Manali)');
                        setSimAmount('4200');
                      } else if (val === 'tour') {
                        setSimServiceName('Lahaul & Spiti Valley Jeep Expedition (7 Days)');
                        setSimAmount('18500');
                      } else if (val === 'guide') {
                        setSimServiceName('Certified High-Altitude Trekking Guide (Har Ki Dun)');
                        setSimAmount('1800');
                      } else if (val === 'activity') {
                        setSimServiceName('Tandem Paragliding Flight (Bir Billing)');
                        setSimAmount('2800');
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none"
                  >
                    <option value="taxi">🚕 Reserved Taxi</option>
                    <option value="homestay">🏡 Eco Homestay</option>
                    <option value="tour">🗺️ Tour Package</option>
                    <option value="guide">👤 Professional Guide</option>
                    <option value="activity">🪂 Adventure Activity</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Stay / Journey Date *</label>
                  <input
                    type="date"
                    required
                    value={simDate}
                    onChange={(e) => setSimDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Specific Service Name *</label>
                <input
                  type="text"
                  required
                  value={simServiceName}
                  onChange={(e) => setSimServiceName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Amount (INR) *</label>
                  <input
                    type="number"
                    required
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Guests / Pax Count *</label>
                  <input
                    type="number"
                    required
                    value={simGuests}
                    onChange={(e) => setSimGuests(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2">Traveller Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={simMobile}
                      onChange={(e) => setSimMobile(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Special Requests</label>
                <textarea
                  value={simSpecialRequests}
                  onChange={(e) => setSimSpecialRequests(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-xs outline-none h-16"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSimulator(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSim}
                  className="bg-slate-900 hover:bg-slate-850 text-white font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  {creatingSim && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Register & Create Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trip Information Fulfillment Modal */}
      {showTripInfoModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-up text-left shadow-2xl">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Operator Ride Dispatcher</span>
                <h3 className="text-base font-black mt-0.5">Dispatched Trip & Driver Information</h3>
              </div>
              <button 
                onClick={() => setShowTripInfoModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-black p-1.5 rounded-xl transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTripInfo} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Quick Template Picker */}
              <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl space-y-2">
                <span className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider block">⚡ Quick Dispatch Location Templates</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Select a template to auto-populate the rendezvous meeting spot and standard mountain route instructions instantly:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => applyTripTemplate('njp')}
                    className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer shadow-xs transition"
                  >
                    🚆 NJP Railway Stn
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTripTemplate('bagdogra')}
                    className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer shadow-xs transition"
                  >
                    ✈ Bagdogra Airport
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTripTemplate('gangtok')}
                    className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer shadow-xs transition"
                  >
                    🏙 Gangtok Stand
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTripTemplate('darjeeling')}
                    className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer shadow-xs transition"
                  >
                    🏙 Darjeeling Stand
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTripTemplate('kalimpong')}
                    className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer shadow-xs transition"
                  >
                    🏙 Kalimpong Stand
                  </button>
                </div>
              </div>

              {/* Driver and Vehicle Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Pemba Sherpa"
                    value={tripDriverName}
                    onChange={(e) => setTripDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Driver Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g., +91 9876543210"
                    value={tripDriverMobile}
                    onChange={(e) => setTripDriverMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Vehicle Type / Segment *</label>
                  <select
                    value={tripVehicleType}
                    onChange={(e) => setTripVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="SUV (Innova/Xylo)">🚙 SUV (Innova / Xylo / Bolero)</option>
                    <option value="Hatchback (WagonR)">🚗 Hatchback (WagonR / Alto)</option>
                    <option value="Sedan (Dzire)">🚗 Sedan (Dzire / Etios)</option>
                    <option value="Luxury Traveller">🚐 Luxury Force Traveller</option>
                    <option value="Shared Carrier">🚙 Shared Utility Carrier</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Vehicle Model (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Toyota Innova Crysta"
                    value={tripVehicleModel}
                    onChange={(e) => setTripVehicleModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Vehicle Registration Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., WB-74-AX-5542"
                    value={tripVehicleReg}
                    onChange={(e) => setTripVehicleReg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500 font-mono uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Pickup location rendezvous */}
              <div className="space-y-3.5 border-t border-slate-100 pt-3.5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Pickup Location Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Pickup location"
                    value={tripPickupLocation}
                    onChange={(e) => setTripPickupLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Rendezvous Meeting Point *</label>
                  <input
                    type="text"
                    required
                    placeholder="Exact spot to locate the driver"
                    value={tripMeetingPoint}
                    onChange={(e) => setTripMeetingPoint(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Scheduled Pickup Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 10:30 AM (on check-in date)"
                    value={tripPickupTime}
                    onChange={(e) => setTripPickupTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Standard / Special Instructions</label>
                <textarea
                  placeholder="Extra instructions regarding baggage carrier, permits, scenic route preferences, etc..."
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:ring-1 focus:ring-amber-500 h-20"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowTripInfoModal(false)}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTripInfo}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  {submittingTripInfo && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm & Dispatch Ride
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Ratings Form Modal */}
      {showReviewModal && reviewBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-up text-left">
            
            {/* Header */}
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Operator Review Desk</span>
                <h3 className="text-base font-black mt-0.5">
                  {editingReviewId ? 'Edit Your Verified Review' : 'Write Verified Review'}
                </h3>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-black p-1.5 rounded-xl transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              
              {/* Journey details mini banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-150 dark:border-slate-850 flex justify-between items-center text-[10px] font-mono text-slate-500 font-bold">
                <div>
                  <span className="block text-slate-400 text-[9px] uppercase font-black">Operator</span>
                  {reviewBooking.assignedPartnerName || 'HillyTrip Operator'}
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] uppercase font-black">Route / Journey</span>
                  {reviewBooking.pickupLocation && reviewBooking.dropLocation 
                    ? `${reviewBooking.pickupLocation} to ${reviewBooking.dropLocation}` 
                    : 'Shimla - Kalka Corridor'}
                </div>
                <div>
                  <span className="block text-slate-400 text-[9px] uppercase font-black">Booking ID</span>
                  #{reviewBooking.id}
                </div>
              </div>

              {/* Overall Star Selector */}
              <div className="space-y-1 text-center py-2 bg-yellow-500/[0.03] rounded-2xl border border-yellow-500/10">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Overall Star Rating *</label>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRevRating(star);
                        // Sync initial sub-ratings as default values
                        setRevExperience(star);
                        setRevCleanliness(star);
                        setRevBehaviour(star);
                        setRevPunctuality(star);
                        setRevValue(star);
                      }}
                      className="text-yellow-400 transition transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <Star className={`w-8 h-8 ${star <= revRating ? 'fill-current' : 'text-slate-200 dark:text-slate-800'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-yellow-600 block pt-1">
                  {revRating === 5 ? 'Excellent Mountain Journey!' :
                   revRating === 4 ? 'Good and comfortable' :
                   revRating === 3 ? 'Decent, room for improvements' :
                   revRating === 2 ? 'Fair, not quite satisfactory' :
                   'Very poor experience'}
                </span>
              </div>

              {/* Recommendation Choice */}
              <div className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850">
                <div>
                  <strong className="text-slate-700 dark:text-white text-xs font-bold block">Recommend this operator?</strong>
                  <span className="text-[10px] text-slate-450 leading-relaxed block mt-0.5">Would you recommend them to future travelers?</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRevRecommend(true)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                      revRecommend 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setRevRecommend(false)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer ${
                      !revRecommend 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> No
                  </button>
                </div>
              </div>

              {/* Sub-ratings Breakdown Panel */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Service Categories Sub-Ratings</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-bold">
                  {[
                    { label: 'Trip Experience', key: 'tripExperience', state: revExperience, setter: setRevExperience },
                    { label: 'Vehicle Cleanliness', key: 'vehicleCleanliness', state: revCleanliness, setter: setRevCleanliness },
                    { label: 'Driver Behaviour', key: 'driverBehaviour', state: revBehaviour, setter: setRevBehaviour },
                    { label: 'Punctuality', key: 'punctuality', state: revPunctuality, setter: setRevPunctuality },
                    { label: 'Value for Money', key: 'valueForMoney', state: revValue, setter: setRevValue },
                  ].map((cat) => (
                    <div key={cat.key} className="flex justify-between items-center bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-150/70 dark:border-slate-850/80">
                      <span className="text-slate-600 dark:text-slate-350 text-[11px] font-bold">{cat.label}</span>
                      <div className="flex gap-0.5 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => cat.setter(s)}
                            className="cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${s <= cat.state ? 'fill-current' : 'text-slate-200 dark:text-slate-800'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Review Headline (Summary)</label>
                <input
                  type="text"
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="e.g., Superb service, experienced driver Rajesh, highly recommend!"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-yellow-500 outline-none"
                />
              </div>

              {/* Comment Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Detailed Journey Feedback *</label>
                <textarea
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Detail your experience... Was the driving safe on hills? Was the vehicle clean? Did they arrive on time? (Required)"
                  rows={4}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-yellow-500 outline-none"
                />
              </div>

              {/* Photo Upload Panel */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Journey Photos (Max 5)</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {/* Photo Thumbnails */}
                  {revPhotos.map((ph, idx) => (
                    <div key={idx} className="relative w-full aspect-square rounded-xl overflow-hidden border border-slate-200">
                      <img src={ph} alt={`Selected ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => handleDeleteReviewPhoto(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 leading-none shadow hover:bg-red-700 cursor-pointer"
                        title="Delete photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Add Photo Button Slot */}
                  {revPhotos.length < 5 && (
                    <label className="w-full aspect-square border-2 border-dashed border-slate-200 hover:border-yellow-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition p-2 text-center text-slate-400">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReviewPhotoSelect}
                        disabled={uploadingPhotos}
                        className="hidden"
                      />
                      <Camera className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[9px] font-bold leading-tight">
                        {uploadingPhotos ? 'Loading...' : 'Add Photo'}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || uploadingPhotos}
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingReviewId ? 'Save Edits' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
