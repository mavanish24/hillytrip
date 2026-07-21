import React, { useState, useEffect } from 'react';
import { 
  Star, ThumbsUp, CheckCircle2, ShieldAlert, Clock, MapPin, 
  MessageSquare, Calendar, Trash2, EyeOff, Eye, Flag, Sparkles, 
  Check, X, Award, AlertTriangle, Filter, Search, ChevronDown, 
  ChevronUp, Camera, HelpCircle, ShieldCheck
} from 'lucide-react';
import { BookingReview, BookingLead } from '../types';
import PublicOperatorProfile from './PublicOperatorProfile';

interface ReputationDirectoryProps {
  currentUser: any;
  bookings: BookingLead[];
  onReviewSubmitted?: () => void;
}

interface OperatorProfile {
  id: string;
  name: string;
  tripsCompleted: number;
  acceptanceRate: number;
  responseTimeMinutes: number;
  languages: string[];
  coverage: string[];
  memberSince: string;
}

// Preseeded Operators
const SEEDED_OPERATORS: OperatorProfile[] = [
  {
    id: 'partner_hillytrip',
    name: 'HillyTrip Taxi Fleet (Shimla-Manali Direct)',
    tripsCompleted: 14,
    acceptanceRate: 98,
    responseTimeMinutes: 11,
    languages: ['Hindi', 'English', 'Punjabi'],
    coverage: ['Shimla - Manali Corridor', 'Kalka - Shimla Railway Connect', 'NJP - Gangtok Expressway'],
    memberSince: 'March 2026'
  },
  {
    id: 'partner_amit',
    name: 'Amit Mountain Cabs & Tours',
    tripsCompleted: 8,
    acceptanceRate: 96,
    responseTimeMinutes: 14,
    languages: ['Hindi', 'English', 'Himachali'],
    coverage: ['Dharamshala - McLeodganj local', 'Pathankot - Dharamshala express', 'Manali - Rohtang Pass tour'],
    memberSince: 'April 2026'
  },
  {
    id: 'partner_anjali',
    name: 'Anjali Himalayan Royal Safaris',
    tripsCompleted: 5,
    acceptanceRate: 94,
    responseTimeMinutes: 25,
    languages: ['English', 'Hindi', 'Tibetan'],
    coverage: ['Bagdogra - Gangtok corridor', 'NJP - Darjeeling heritage route', 'Gangtok - Nathu La Pass'],
    memberSince: 'May 2026'
  }
];

// Preseeded Reviews
const SEEDED_REVIEWS: BookingReview[] = [
  {
    id: 'rev-seed-1',
    bookingId: 'B-1002',
    travellerId: 'traveller_amit@hillytrip.com',
    travellerName: 'Amit Sharma',
    operatorId: 'partner_hillytrip',
    operatorName: 'HillyTrip Taxi Fleet (Shimla-Manali Direct)',
    driverName: 'Rajesh Negi',
    route: 'Kalka Railway Station to Shimla Mall Road',
    rating: 5,
    title: 'Fantastic high mountain driver and super clean SUV!',
    comment: 'The driver Rajesh was exceptionally professional. He navigated the Himalayan curves smoothly without any rushing. The Innova Crysta was sparkling clean and had mineral water and blankets. Very highly recommended for anyone travelling with family.',
    wouldRecommend: true,
    tripExperience: 5,
    vehicleCleanliness: 5,
    driverBehaviour: 5,
    punctuality: 5,
    valueForMoney: 5,
    photos: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600'
    ],
    status: 'active',
    reported: false,
    operatorReply: 'Thank you Amit for your wonderful feedback! Rajesh is indeed one of our most experienced drivers for the Shimla hills. We are thrilled you had a comfortable ride with your family. Safe travels!',
    operatorReplyCreatedAt: '2026-07-10T12:00:00.000Z',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-seed-2',
    bookingId: 'B-1004',
    travellerId: 'traveller_rohan@hillytrip.com',
    travellerName: 'Rohan Deshmukh',
    operatorId: 'partner_hillytrip',
    operatorName: 'HillyTrip Taxi Fleet (Shimla-Manali Direct)',
    driverName: 'Vikram Singh',
    route: 'Shimla to Manali',
    rating: 4,
    title: 'Punctual and safe, slightly slow on the highway',
    comment: 'Vikram reached 15 minutes before time at the pickup spot. Ride was comfortable but he drove extremely cautiously, which made the trip take 1 hour longer than estimated. Overall very safe and polite, vehicle was decent.',
    wouldRecommend: true,
    tripExperience: 4,
    vehicleCleanliness: 4,
    driverBehaviour: 5,
    punctuality: 5,
    valueForMoney: 4,
    photos: [],
    status: 'active',
    reported: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-seed-3',
    bookingId: 'B-1008',
    travellerId: 'traveller_priya@hillytrip.com',
    travellerName: 'Priya Sen',
    operatorId: 'partner_amit',
    operatorName: 'Amit Mountain Cabs & Tours',
    driverName: 'Sunil Kumar',
    route: 'Pathankot to Dharamshala',
    rating: 5,
    title: 'Flawless execution! Sunil is an expert guide too.',
    comment: 'Superb service by Sunil. Not only did he drive safely, but he also recommended beautiful scenic stopovers for photography that normal tourists miss. Highly recommend Amit Mountain Cabs!',
    wouldRecommend: true,
    tripExperience: 5,
    vehicleCleanliness: 5,
    driverBehaviour: 5,
    punctuality: 5,
    valueForMoney: 5,
    photos: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600'
    ],
    status: 'active',
    reported: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'rev-seed-4',
    bookingId: 'B-1012',
    travellerId: 'spammer_dan@example.com',
    travellerName: 'Daniel Craig',
    operatorId: 'partner_anjali',
    operatorName: 'Anjali Himalayan Royal Safaris',
    driverName: 'Sanjay Thapa',
    route: 'Bagdogra to Gangtok',
    rating: 1,
    title: 'Terrible! Sanjay was rude and drove dangerously!',
    comment: 'Driver was 1 hour late, threw our bags rudely on the rack, and blasted terrible loud music despite repeated requests to turn it down. Worst mountain cab experience ever!',
    wouldRecommend: false,
    tripExperience: 1,
    vehicleCleanliness: 2,
    driverBehaviour: 1,
    punctuality: 1,
    valueForMoney: 1,
    photos: [],
    status: 'active',
    reported: true,
    reportReason: 'False Information',
    reportComment: 'Traveler arrived 45 mins late at airport himself, and driver Sanjay played gentle local music only. Sanjay has 5-star ratings everywhere else.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago - locked!
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function ReputationDirectory({ currentUser, bookings, onReviewSubmitted }: ReputationDirectoryProps) {
  const [reviews, setReviews] = useState<BookingReview[]>([]);
  const [operators, setOperators] = useState<OperatorProfile[]>(SEEDED_OPERATORS);
  const [selectedOpId, setSelectedOpId] = useState<string>('partner_hillytrip');
  const [loading, setLoading] = useState(false);
  const [moderatorMode, setModeratorMode] = useState(false);
  const [utreReputation, setUtreReputation] = useState<any>(null);
  const [utreLoading, setUtreLoading] = useState(false);

  // Filters & Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [hasPhotosFilter, setHasPhotosFilter] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Submitting replies, reporting, zoom photo
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [viewProfileOperatorId, setViewProfileOperatorId] = useState<string | null>(null);
  
  // Operator reply modal state
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Reporting modal state
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<'Spam' | 'Abusive Language' | 'False Information' | 'Other'>('Spam');
  const [reportComment, setReportComment] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Moderation state
  const [moderationLoading, setModerationLoading] = useState<string | null>(null);

  // Fetch reviews on mount and when changes occur
  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Fetch reviews. Admins / moderator mode can view hidden reviews
      const res = await fetch(`/api/booking-reviews?showHidden=${moderatorMode || currentUser?.role === 'admin'}`);
      if (res.ok) {
        const data = await res.json();
        // Merge with seeded if server list is empty (first boot)
        if (data.length === 0) {
          // Post seeded to database to store permanently
          for (const s of SEEDED_REVIEWS) {
            await fetch('/api/booking-reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(s)
            });
          }
          const freshRes = await fetch(`/api/booking-reviews?showHidden=${moderatorMode || currentUser?.role === 'admin'}`);
          if (freshRes.ok) {
            setReviews(await freshRes.json());
          }
        } else {
          setReviews(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      // Fallback local state if server fails or offline
      setReviews(SEEDED_REVIEWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [moderatorMode]);

  const fetchUtreReputation = async (opId: string) => {
    setUtreLoading(true);
    try {
      const res = await fetch(`/api/utre/reputation/taxi/${opId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUtreReputation(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch UTRE reputation:', e);
    } finally {
      setUtreLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOpId) {
      fetchUtreReputation(selectedOpId);
    }
  }, [selectedOpId, reviews]);

  // Dynamically compile active operators in the system from bookings + seeded
  const getDynamicOperators = (): (OperatorProfile & { avgRating: number; reviewCount: number })[] => {
    const dynamicMap = new Map<string, OperatorProfile>();
    
    // Add pre-seeded first
    operators.forEach(op => dynamicMap.set(op.id, { ...op }));

    // Extract any new operators from bookings
    bookings.forEach(b => {
      if (b.leadType === 'taxi' && b.assignedPartnerId) {
        if (!dynamicMap.has(b.assignedPartnerId)) {
          dynamicMap.set(b.assignedPartnerId, {
            id: b.assignedPartnerId,
            name: b.assignedPartnerName || 'HillyTrip Taxi Operator',
            tripsCompleted: bookings.filter(x => x.assignedPartnerId === b.assignedPartnerId && x.status === 'completed').length,
            acceptanceRate: 97,
            responseTimeMinutes: 15,
            languages: ['English', 'Hindi'],
            coverage: b.pickupLocation && b.dropLocation ? [`${b.pickupLocation} to ${b.dropLocation}`] : ['Local Mountain Routes'],
            memberSince: 'June 2026'
          });
        }
      }
    });

    const list = Array.from(dynamicMap.values());

    // Enrich operators with real overall rating and review counts
    return list.map(op => {
      const opReviews = reviews.filter(r => r.operatorId === op.id && r.status === 'active');
      const reviewCount = opReviews.length;
      const avgRating = reviewCount > 0 
        ? parseFloat((opReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)) 
        : 5.0; // Default brand standard rating
      
      return {
        ...op,
        avgRating,
        reviewCount
      };
    });
  };

  const enrichedOperators = getDynamicOperators();
  const selectedOperator = enrichedOperators.find(o => o.id === selectedOpId) || enrichedOperators[0];

  // Calculate operator badges based strictly on platform data
  const getOperatorBadges = (op: any) => {
    const badges = [];
    
    // 🛡️ Verified: active by default for system-registered operators
    badges.push({
      id: 'badge-verified',
      label: 'Verified Operator',
      emoji: '🛡️',
      colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description: 'Business details and operating permits fully vetted.'
    });

    // ⭐ Top Rated: rating >= 4.5 and tripsCompleted or review count >= 3
    const actualReviews = reviews.filter(r => r.operatorId === op.id && r.status === 'active');
    if (op.avgRating >= 4.5 && (op.tripsCompleted >= 3 || actualReviews.length >= 2)) {
      badges.push({
        id: 'badge-toprated',
        label: 'Top Rated',
        emoji: '⭐',
        colorClass: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        description: 'Consistently receives high 5-star ratings.'
      });
    }

    // ⚡ Fast Responder: average response time < 15 minutes
    if (op.responseTimeMinutes < 15) {
      badges.push({
        id: 'badge-fast',
        label: 'Fast Responder',
        emoji: '⚡',
        colorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
        description: 'Responds to quotes and inquiries in under 15 minutes.'
      });
    }

    // 🏆 Trusted Operator: acceptance rate >= 95% and at least 3 completed trips
    if (op.acceptanceRate >= 95 && op.tripsCompleted >= 3) {
      badges.push({
        id: 'badge-trusted',
        label: 'Trusted Operator',
        emoji: '🏆',
        colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        description: 'Outstanding fulfillment record with near-zero cancellations.'
      });
    }

    return badges;
  };

  // Filter & Sort reviews for the SELECTED operator
  const filteredReviews = reviews
    .filter(r => {
      // Must belong to selected operator
      if (r.operatorId !== selectedOpId) return false;

      // Search term matching
      const matchesSearch = searchTerm.trim() === '' || 
        `${r.travellerName} ${r.title || ''} ${r.comment} ${r.bookingId} ${r.driverName || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Rating filter
      const matchesRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter);

      // Photos filter
      const matchesPhotos = !hasPhotosFilter || (r.photos && r.photos.length > 0);

      return matchesSearch && matchesRating && matchesPhotos;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'highest') {
        return b.rating - a.rating;
      } else if (sortBy === 'lowest') {
        return a.rating - b.rating;
      }
      return 0;
    });

  // Calculate detailed rating distribution for selected operator
  const getRatingDistribution = (opId: string) => {
    const opReviews = reviews.filter(r => r.operatorId === opId && r.status === 'active');
    const total = opReviews.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let wouldRecommendSum = 0;

    opReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating as 1|2|3|4|5] += 1;
      }
      if (r.wouldRecommend) wouldRecommendSum += 1;
    });

    const recommendPercent = total > 0 ? Math.round((wouldRecommendSum / total) * 100) : 100;

    return {
      distribution,
      total,
      recommendPercent,
      avgSubRatings: {
        tripExperience: total > 0 ? parseFloat((opReviews.reduce((s, r) => s + (r.tripExperience || r.rating), 0) / total).toFixed(1)) : 5.0,
        vehicleCleanliness: total > 0 ? parseFloat((opReviews.reduce((s, r) => s + (r.vehicleCleanliness || r.rating), 0) / total).toFixed(1)) : 5.0,
        driverBehaviour: total > 0 ? parseFloat((opReviews.reduce((s, r) => s + (r.driverBehaviour || r.rating), 0) / total).toFixed(1)) : 5.0,
        punctuality: total > 0 ? parseFloat((opReviews.reduce((s, r) => s + (r.punctuality || r.rating), 0) / total).toFixed(1)) : 5.0,
        valueForMoney: total > 0 ? parseFloat((opReviews.reduce((s, r) => s + (r.valueForMoney || r.rating), 0) / total).toFixed(1)) : 5.0,
      }
    };
  };

  const ratingSummary = getRatingDistribution(selectedOpId);

  // Check edit lock window: returns true if review was submitted within last 7 days
  const canEditReview = (createdAtStr: string) => {
    const createdTime = new Date(createdAtStr).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - createdTime) < sevenDaysMs;
  };

  // Submit operator reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReviewId || !replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await fetch(`/api/booking-reviews/${replyReviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText })
      });
      if (res.ok) {
        // Refresh
        await fetchReviews();
        setReplyReviewId(null);
        setReplyText('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit reply.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting operator reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Report a review for moderation
  const handleReportReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReviewId) return;

    setSubmittingReport(true);
    try {
      const res = await fetch(`/api/booking-reviews/${reportReviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, comment: reportComment })
      });
      if (res.ok) {
        await fetchReviews();
        setReportReviewId(null);
        setReportComment('');
        alert('Review reported successfully. Our moderation team will audit this content shortly.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to report review.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting report.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Admin moderation action
  const handleModerateAction = async (id: string, action: 'hide' | 'restore' | 'delete') => {
    if (action === 'delete' && !confirm('Are you sure you want to permanently delete this review? This action cannot be undone.')) {
      return;
    }

    setModerationLoading(id);
    try {
      const res = await fetch(`/api/booking-reviews/${id}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        await fetchReviews();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to perform moderation.');
      }
    } catch (err) {
      console.error(err);
      alert('Error during moderation action.');
    } finally {
      setModerationLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in text-left">
      
      {/* LEFT SIDE: Operator Selector and Stats */}
      <div className="lg:col-span-4 space-y-4">
        
        {/* Moderator Mode Controls */}
        <div className="bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Moderator Control Panel</p>
              <p className="text-[10px] text-slate-400">Toggle moderation tools to manage directory reviews & hide controls.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={moderatorMode}
              onChange={() => setModeratorMode(!moderatorMode)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Directory header */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-500" /> Taxi Operators Directory
          </h3>
          
          <div className="space-y-2.5">
            {enrichedOperators.map((op) => {
              const isSelected = op.id === selectedOpId;
              const opBadges = getOperatorBadges(op);
              
              return (
                <button
                  key={op.id}
                  onClick={() => setSelectedOpId(op.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected 
                      ? 'bg-slate-950 dark:bg-white border-slate-950 dark:border-white text-white dark:text-slate-950 shadow-md ring-2 ring-emerald-500/30' 
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-850 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-xs leading-snug">{op.name}</h4>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300 dark:text-slate-500' : 'text-slate-450'}`}>
                        Joined: {op.memberSince} • {op.tripsCompleted} Completed Trips
                      </p>
                    </div>
                    
                    {/* Compact Rating Display */}
                    <div className="flex items-center gap-1 shrink-0 bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-lg text-[10px] font-black">
                      <Star className="w-3 h-3 fill-current" />
                      {op.avgRating}
                    </div>
                  </div>

                  {/* Badges strip */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {opBadges.map(b => (
                      <span 
                        key={b.id} 
                        className="text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold uppercase tracking-wider"
                        style={{ contentVisibility: 'auto' }}
                        title={b.description}
                      >
                        {b.emoji} {b.label}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic UTRE Universal Trust & Reputation Index Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-950 dark:to-black text-white p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-300">UTRE Trust Index</h4>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              Live telemetry
            </span>
          </div>

          {utreLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono animate-pulse">
              Recalculating real-time trust factors...
            </div>
          ) : utreReputation ? (
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                {/* Dynamic trust gauge */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#1e293b"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke={
                        utreReputation.score >= 90
                          ? '#10b981'
                          : utreReputation.score >= 75
                          ? '#14b8a6'
                          : utreReputation.score >= 50
                          ? '#eab308'
                          : '#ef4444'
                      }
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={
                        2 * Math.PI * 34 * (1 - utreReputation.score / 100)
                      }
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black font-mono tracking-tight leading-none text-white">
                      {utreReputation.score}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold block">
                      / 100
                    </span>
                  </div>
                </div>

                {/* Trust descriptor and explanation */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black tracking-tight text-white">
                      {utreReputation.score >= 90
                        ? 'Elite Trust Level'
                        : utreReputation.score >= 75
                        ? 'High Trust Level'
                        : utreReputation.score >= 50
                        ? 'Moderate Trust Level'
                        : 'Flagged / Probation'}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-medium">
                    Dynamic reputational index based on booking fulfillment, guest verification, dispute ratios, and driver reviews.
                  </p>
                </div>
              </div>

              {/* Trust Badges list */}
              {utreReputation.badges && utreReputation.badges.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    Earned Trust Badges
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {utreReputation.badges.map((b: any) => {
                      let color = 'bg-blue-500/10 text-blue-300 border-blue-500/20';
                      if (b.key === 'top_rated') color = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
                      if (b.key === 'traveler_favorite') color = 'bg-purple-500/10 text-purple-300 border-purple-500/20';
                      if (b.key === 'fast_response') color = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                      if (b.key === 'highly_recommended') color = 'bg-orange-500/10 text-orange-300 border-orange-500/20';
                      if (b.key === 'verified') color = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';

                      return (
                        <span
                          key={b.key}
                          className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-black uppercase tracking-wider ${color}`}
                          title={b.description}
                        >
                          {b.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Operational factors list */}
              {utreReputation.factors && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    Operational Trust Factors
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] font-mono">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400 font-bold">Fulfillment:</span>
                      <span className="text-emerald-400 font-black">
                        {Math.round(utreReputation.factors.bookingCompletionRate * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400 font-bold">Response:</span>
                      <span className="text-cyan-400 font-black">
                        ~{Math.round(utreReputation.factors.averageResponseTimeMs / 60000)}m
                    </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400 font-bold">Cancellation:</span>
                      <span className="text-red-400 font-black">
                        {Math.round(utreReputation.factors.cancellationRate * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="text-slate-400 font-bold">Complaints:</span>
                      <span className="text-yellow-400 font-black">
                        {Math.round(utreReputation.factors.complaintRatio * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500">
              No trust factors computed yet for this operator.
            </div>
          )}
        </div>

        {/* Rating summary distribution of Selected Operator */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 space-y-4 shadow-sm">
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Rating Distribution</h4>
          
          <div className="flex items-center gap-4">
            <div className="text-center shrink-0">
              <span className="text-4xl font-black font-mono leading-none tracking-tight block text-slate-900 dark:text-white">
                {selectedOperator.avgRating}
              </span>
              <div className="flex items-center justify-center gap-0.5 text-yellow-400 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-3.5 h-3.5 ${s <= Math.round(selectedOperator.avgRating) ? 'fill-current' : 'text-slate-200 dark:text-slate-800'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                {ratingSummary.total} Verified Review{ratingSummary.total === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex-1 space-y-1 text-[10px] font-mono text-slate-500 font-bold">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingSummary.distribution[star as 1|2|3|4|5] || 0;
                const percent = ratingSummary.total > 0 ? (count / ratingSummary.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-2.5">{star}★</span>
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold">Recommendation Rate</span>
            <span className="text-emerald-500 font-black flex items-center gap-1 font-mono">
              <ThumbsUp className="w-3.5 h-3.5 fill-current" /> {ratingSummary.recommendPercent}%
            </span>
          </div>
        </div>

        {/* Detailed Quality Sub-Ratings Metric Cards */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 space-y-3.5 shadow-sm">
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Service Category Breakdown</h4>
          <div className="space-y-2.5">
            {[
              { label: 'Trip Experience', key: 'tripExperience', color: 'bg-emerald-500 text-emerald-500' },
              { label: 'Vehicle Cleanliness', key: 'vehicleCleanliness', color: 'bg-cyan-500 text-cyan-500' },
              { label: 'Driver Behaviour', key: 'driverBehaviour', color: 'bg-yellow-500 text-yellow-500' },
              { label: 'Punctuality', key: 'punctuality', color: 'bg-pink-500 text-pink-500' },
              { label: 'Value for Money', key: 'valueForMoney', color: 'bg-indigo-500 text-indigo-500' },
            ].map((metric) => {
              const val = (ratingSummary.avgSubRatings as any)[metric.key] || 5.0;
              const pct = (val / 5) * 100;
              return (
                <div key={metric.key} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-600 dark:text-slate-350">{metric.label}</span>
                    <span className="font-mono text-slate-800 dark:text-white">{val} / 5.0</span>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${metric.color.split(' ')[0]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Public Profile Button */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl text-center shadow-sm space-y-3">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">operator dossier profile</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">Inspect business registry license status, active high-altitude corridors, driver reviews, and verified fleet photos.</p>
          </div>
          <button
            type="button"
            onClick={() => setViewProfileOperatorId(selectedOperator.id)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>View Complete Public Profile</span>
          </button>
        </div>

      </div>

      {/* RIGHT SIDE: Search, Filter, Sort, Review List */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Search, Filter & Sort Controls */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-slate-150 dark:border-slate-800 flex flex-col md:flex-row gap-3 shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search reviews for ${selectedOperator.name}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 font-bold outline-none cursor-pointer focus:ring-0"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 font-bold outline-none cursor-pointer focus:ring-0"
              >
                <option value="newest">Newest first</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>

            <button
              onClick={() => setHasPhotosFilter(!hasPhotosFilter)}
              className={`px-3 py-2 border rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                hasPhotosFilter 
                  ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-500' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> With Photos
            </button>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-24 text-center space-y-3 bg-white dark:bg-slate-950 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm">
            <span className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin inline-block" />
            <p className="text-xs text-slate-450 italic">Syncing passenger reputation journal...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/10 p-6">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Reviews Match Filters</h4>
            <p className="text-xs text-slate-450 max-w-md mx-auto mt-1 leading-relaxed">
              There are no reviews matching your search criteria. Be the first to leave a verified review of {selectedOperator.name} after your next mountain journey!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev) => {
              const isOwner = currentUser?.email === rev.travellerId;
              const isOperator = currentUser?.email === rev.operatorId || currentUser?.roles?.includes('partner');
              const editAllowed = canEditReview(rev.createdAt);
              
              // Renders reported details
              const reportWarning = (rev.reported && (moderatorMode || currentUser?.role === 'admin'));

              return (
                <div 
                  key={rev.id}
                  className={`p-5 bg-white dark:bg-slate-950 rounded-3xl border shadow-sm transition-all text-xs space-y-4 relative ${
                    rev.status === 'hidden'
                      ? 'border-dashed border-red-300 bg-red-50/5 dark:bg-red-950/5 opacity-70'
                      : reportWarning 
                        ? 'border-rose-400 dark:border-rose-800 bg-rose-500/[0.02] ring-2 ring-rose-500/15'
                        : 'border-slate-150 dark:border-slate-800'
                  }`}
                >
                  
                  {/* Reported Banner */}
                  {reportWarning && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-2xl flex items-start gap-2 text-[11px]">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Flagged Review Report:</strong> {rev.reportReason}
                        <p className="text-slate-500 italic mt-0.5">"{rev.reportComment || 'No comment provided by reporter'}"</p>
                      </div>
                    </div>
                  )}

                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                    
                    {/* Traveller info */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-black text-[11px] text-slate-500 border border-slate-200 dark:border-slate-800">
                        {rev.travellerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-800 dark:text-white font-bold">{rev.travellerName}</strong>
                          <span className="bg-emerald-600/10 text-emerald-500 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Verified Traveller
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {rev.route}
                        </p>
                      </div>
                    </div>

                    {/* Metadata & rating */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-[10px] text-slate-400 font-bold font-mono">
                      <div className="flex items-center gap-0.5 text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-2 py-0.5 rounded-lg text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {rev.rating}
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                  </div>

                  {/* Body Text */}
                  <div className="space-y-2 text-left">
                    {rev.title && (
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{rev.title}</h4>
                    )}
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">{rev.comment}</p>
                  </div>

                  {/* Rating Category Breakdown (Pills) */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-150/70 dark:border-slate-850/75 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-slate-500 font-bold">
                    <div>
                      <span className="block text-slate-400 text-[9px]">Experience</span>
                      <span className="text-yellow-500">{'★'.repeat(rev.tripExperience || rev.rating)}{'☆'.repeat(5 - (rev.tripExperience || rev.rating))}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px]">Cleanliness</span>
                      <span className="text-yellow-500">{'★'.repeat(rev.vehicleCleanliness || rev.rating)}{'☆'.repeat(5 - (rev.vehicleCleanliness || rev.rating))}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px]">Behaviour</span>
                      <span className="text-yellow-500">{'★'.repeat(rev.driverBehaviour || rev.rating)}{'☆'.repeat(5 - (rev.driverBehaviour || rev.rating))}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px]">Punctuality</span>
                      <span className="text-yellow-500">{'★'.repeat(rev.punctuality || rev.rating)}{'☆'.repeat(5 - (rev.punctuality || rev.rating))}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[9px]">Value</span>
                      <span className="text-yellow-500">{'★'.repeat(rev.valueForMoney || rev.rating)}{'☆'.repeat(5 - (rev.valueForMoney || rev.rating))}</span>
                    </div>
                  </div>

                  {/* Photos Grid */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {rev.photos.map((ph, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setZoomPhoto(ph)}
                          className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 transition cursor-pointer shrink-0"
                        >
                          <img 
                            src={ph} 
                            alt={`Review ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Operator Reply block */}
                  {rev.operatorReply ? (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border-l-4 border-emerald-500 dark:border-emerald-400 space-y-1.5 text-left text-xs font-sans">
                      <div className="flex justify-between items-center">
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px] font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Response from Operator
                        </strong>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(rev.operatorReplyCreatedAt || rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 italic">"{rev.operatorReply}"</p>
                      
                      {/* Operator Edit Reply Button */}
                      {isOperator && (
                        <button 
                          onClick={() => {
                            setReplyReviewId(rev.id);
                            setReplyText(rev.operatorReply || '');
                          }}
                          className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer pt-1"
                        >
                          Edit Operator Reply
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Operator Leave Reply Trigger */
                    isOperator && (
                      <button
                        onClick={() => {
                          setReplyReviewId(rev.id);
                          setReplyText('');
                        }}
                        className="bg-emerald-600/10 hover:bg-emerald-600/15 text-emerald-500 font-bold px-3 py-1.5 rounded-xl transition text-[10px] uppercase tracking-wider cursor-pointer"
                      >
                        ✍️ Public Operator Reply
                      </button>
                    )
                  )}

                  {/* Actions Row */}
                  <div className="flex justify-between items-center pt-2 text-[10px] font-mono text-slate-400 font-bold">
                    <span>Booking reference: <strong className="text-slate-500">#{rev.bookingId}</strong></span>
                    
                    <div className="flex items-center gap-3">
                      
                      {/* Traveler edit restriction display */}
                      {isOwner && editAllowed && (
                        <span className="text-amber-500">7-Day Edit Window Open</span>
                      )}
                      
                      {/* Flag Review Button */}
                      {!rev.reported && (
                        <button 
                          onClick={() => setReportReviewId(rev.id)}
                          className="hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                        >
                          <Flag className="w-3 h-3" /> Report Review
                        </button>
                      )}

                      {/* Admin/Moderator Controls */}
                      {(moderatorMode || currentUser?.role === 'admin') && (
                        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-2.5">
                          {rev.status === 'hidden' ? (
                            <button
                              onClick={() => handleModerateAction(rev.id, 'restore')}
                              disabled={moderationLoading === rev.id}
                              className="text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleModerateAction(rev.id, 'hide')}
                              disabled={moderationLoading === rev.id}
                              className="text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <EyeOff className="w-3 h-3" /> Hide
                            </button>
                          )}
                          <button
                            onClick={() => handleModerateAction(rev.id, 'delete')}
                            disabled={moderationLoading === rev.id}
                            className="text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: Operator Reply Modal */}
      {replyReviewId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full animate-scale-up text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-500" /> Operator Response
              </h3>
              <button 
                onClick={() => setReplyReviewId(null)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Public Reply Text</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for your business! We strive to deliver comfort and hospitality. We are delighted/sorry to hear..."
                  rows={4}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white outline-none"
                />
                <p className="text-[9px] text-slate-400 leading-relaxed italic">
                  Note: Only one response is permitted per review. Submitting will publish this reply instantly below the traveler feedback.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReplyReviewId(null)}
                  className="flex-1 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="flex-1 bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {submittingReply ? 'Saving...' : 'Publish Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Report Review Modal */}
      {reportReviewId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full animate-scale-up text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <Flag className="w-4 h-4 fill-current" /> Report Inappropriate Review
              </h3>
              <button 
                onClick={() => setReportReviewId(null)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportReview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Spam">Spam (Advertising, repetitive gibberish)</option>
                  <option value="Abusive Language">Abusive Language (Profanity, harassment)</option>
                  <option value="False Information">False Information (Verifiable factual lies)</option>
                  <option value="Other">Other Category (Explain below)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Auditor Comments & Evidence</label>
                <textarea
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder="Explain why this review violates platform community guidelines..."
                  rows={3}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReportReviewId(null)}
                  className="flex-1 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
                >
                  {submittingReport ? 'Filing Report...' : 'File Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Zoom Photo Viewer */}
      {zoomPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <img 
              src={zoomPhoto} 
              alt="Enlarged" 
              className="max-w-full max-h-full object-contain rounded-2xl border border-white/10 shadow-2xl" 
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setZoomPhoto(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white font-bold p-3 rounded-full transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

    </div>
  );
}
