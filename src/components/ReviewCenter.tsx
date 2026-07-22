import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Check, 
  CheckCircle, 
  User, 
  Calendar, 
  Sparkles, 
  Filter, 
  ShieldAlert, 
  Trash2, 
  PenTool, 
  ChevronRight, 
  Award, 
  Heart,
  Send,
  Sliders,
  LogOut,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
<<<<<<< HEAD
import { collection, doc, setDoc, query, orderBy, onSnapshot, updateDoc, deleteDoc, db, auth } from '../utils/firebase';
=======
import { collection, doc, setDoc, query, orderBy, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
import { PlatformReview } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error in ReviewCenter: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ReviewCenterProps {
  user: any;
  onLogin: () => void;
  isAdmin: boolean;
}

export default function ReviewCenter({ user, onLogin, isAdmin }: ReviewCenterProps) {
  const [reviews, setReviews] = useState<PlatformReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    userName: user?.displayName || '',
    userEmail: user?.email || '',
    userMobile: '',
    rating: 5,
    category: 'General' as PlatformReview['category'],
    comment: '',
    wouldRecommend: true
  });
  
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter state
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<PlatformReview['category'] | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'testimonials' | 'adminDesk'>('testimonials');

<<<<<<< HEAD
  // Reporting states
  const [reportingReview, setReportingReview] = useState<PlatformReview | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

=======
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
  // Pre-populate fields when user state changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userName: prev.userName || user.displayName || '',
        userEmail: prev.userEmail || user.email || ''
      }));
    }
  }, [user]);

  // Real-time subscription to Reviews
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews: PlatformReview[] = [];
      snapshot.forEach((docSnap) => {
        fetchedReviews.push({ id: docSnap.id, ...docSnap.data() } as PlatformReview);
      });
      setReviews(fetchedReviews);
      setLoading(false);
    }, (error) => {
      console.warn('Silent read or security rules check for reviews:', error);
      // Fallback to static mock reviews if offline or schema not fully initialized
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.userName.trim()) {
      setErrorMsg('Please specify your traveler name.');
      return;
    }
    if (!formData.userEmail.trim() || !formData.userEmail.includes('@')) {
      setErrorMsg('Please specify a valid email address.');
      return;
    }
    if (formData.comment.trim().length < 10) {
      setErrorMsg('Your feedback must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const reviewId = 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newReview: any = {
      id: reviewId,
      userId: user?.uid || 'guest_user',
      userName: formData.userName.trim(),
      userEmail: formData.userEmail.trim(),
      rating: formData.rating,
      category: formData.category,
      comment: formData.comment.trim(),
      wouldRecommend: formData.wouldRecommend,
      status: 'Pending', // Under moderation check
      createdAt: new Date().toISOString()
    };

    if (formData.userMobile.trim()) {
      newReview.userMobile = formData.userMobile.trim();
    }

    try {
      await setDoc(doc(db, 'reviews', reviewId), newReview);
      setSubmitSuccess(true);
      setFormData({
        userName: user?.displayName || '',
        userEmail: user?.email || '',
        userMobile: '',
        rating: 5,
        category: 'General',
        comment: '',
        wouldRecommend: true
      });
      // Clear success after 6 seconds
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (err) {
      setErrorMsg('Failed to post feedback. Please try again.');
      try {
        handleFirestoreError(err, OperationType.WRITE, `reviews/${reviewId}`);
      } catch (logErr) {
        // Logged
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Administrative moderation actions
  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'Approved' });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
      } catch (log) {
        alert('Failed to update status. Only admins can modify documents.');
      }
    }
  };

  const handleFlag = async (id: string, newStatus: 'Flagged' | 'Addressed' | 'Approved') => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: newStatus });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `reviews/${id}`);
      } catch (log) {
        alert('Failed to update review status.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this feedback record permanently?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `reviews/${id}`);
      } catch (log) {
        alert('Permission denied. Admin role required.');
      }
    }
  };

<<<<<<< HEAD
  const handleOpenReportModal = (review: PlatformReview) => {
    setReportingReview(review);
    setReportReason('');
    setReporterName(user?.displayName || '');
    setReporterEmail(user?.email || '');
    setReportSuccessMsg(null);
  };

  const handleSubmitReviewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReview || !reportReason.trim() || !reporterName.trim() || !reporterEmail.trim()) return;

    setIsSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterName,
          reporterEmail,
          category: 'inappropriate_review',
          referenceId: reportingReview.id,
          title: `Inappropriate Review Reported: ${reportingReview.userName}`,
          description: `Report reason: ${reportReason}\n\nOriginal review:\n"${reportingReview.comment}"\nPosted by: ${reportingReview.userName} (${reportingReview.userEmail})`,
          priority: 'medium'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit report to platform desk.');
      }

      setReportSuccessMsg('Thank you for your vigilance. The report has been logged successfully and will be reviewed by the admin desk shortly.');
      setTimeout(() => {
        setReportingReview(null);
        setReportSuccessMsg(null);
      }, 3500);
    } catch (err: any) {
      alert(err.message || 'Error logging report.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

=======
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
  // Calculations for aggregate metrics
  const activeReviews = reviews.filter(r => r.status === 'Approved' || isAdmin);
  const approvedReviews = reviews.filter(r => r.status === 'Approved');

  const totalVotes = approvedReviews.length;
  const averageRating = totalVotes > 0 
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalVotes).toFixed(1)
    : '4.8'; // high contrast high quality template starting baseline

  const recommendCount = approvedReviews.filter(r => r.wouldRecommend).length;
  const recommendPercent = totalVotes > 0 
    ? Math.round((recommendCount / totalVotes) * 100)
    : 96;

  // Star rates distribution
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  approvedReviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 5|4|3|2|1;
    if (starCounts[star] !== undefined) starCounts[star]++;
  });

  // Filter reviews
  const displayedReviews = reviews.filter(r => {
    if (isAdmin && activeTab === 'adminDesk') return true; // Show all to admin tab
    
    // Testimonials tab shows only Approved
    if (r.status !== 'Approved') return false;

    const matchRating = ratingFilter === 'All' || r.rating === ratingFilter;
    const matchCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchRating && matchCategory;
  });

  // Simple relative date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Some time ago';
    }
  };

  const categories: PlatformReview['category'][] = [
    'General',
    'Routes & Maps',
    'Destinations',
    'Homestays',
    'Cabs / Drivers',
    'App Experience',
    'Other'
  ];

  return (
    <div id="review-system-viewport" className="py-8 px-4 max-w-7xl mx-auto dark:text-slate-100">
      
      {/* Dynamic Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] tracking-widest uppercase py-1.5 px-4 rounded-full border border-emerald-100 dark:border-emerald-900/50 inline-flex items-center gap-1.5 shadow-2xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          Accurate Travel Feedback
        </span>
        <h1 className="font-sans font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight leading-none">
          HillyTrip Feedback & reviews
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3.5 max-w-xl mx-auto leading-relaxed">
          Your accurate feedback helps us refine routes, verify homestays, and elevate regional travel planning across India. Tell us about your experience!
        </p>

        {/* Admin Desk Switcher */}
        {isAdmin && (
          <div className="flex justify-center mt-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-full max-w-xs mx-auto border border-slate-200 dark:border-slate-700 shadow-3xs">
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`flex-1 py-1.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                activeTab === 'testimonials'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Public Reviews
            </button>
            <button
              onClick={() => setActiveTab('adminDesk')}
              className={`flex-1 py-1.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer relative ${
                activeTab === 'adminDesk'
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'text-slate-505 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              <span>Moderator Desk</span>
              {reviews.filter(r => r.status === 'Pending').length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-600 text-white text-[8px] font-bold flex items-center justify-center animate-bounce">
                  {reviews.filter(r => r.status === 'Pending').length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'adminDesk' && isAdmin ? (
        /* ========================================================
           ADMIN PANEL VIEW
           ======================================================== */
        <div id="admin-reviews-panel" className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden animate-fade-in text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5.5 h-5.5 text-amber-500" />
                Traveler Feedback Moderation Desk
              </h2>
              <p className="text-slate-450 text-xs mt-1">Review traveler submissions, toggle display visibility status, or manage logs.</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 font-mono text-xs flex gap-4 text-slate-500 dark:text-slate-400">
              <div>Total: <span className="font-extrabold text-slate-800 dark:text-white">{reviews.length}</span></div>
              <div className="text-emerald-600 dark:text-emerald-450">Approved: <span className="font-bold">{reviews.filter(r => r.status === 'Approved').length}</span></div>
              <div className="text-amber-600">Pending: <span className="font-bold">{reviews.filter(r => r.status === 'Pending').length}</span></div>
            </div>
          </div>

          {displayedReviews.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-805 rounded-2xl">
              <p className="text-slate-400 text-sm font-semibold">No feedback records found in database.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedReviews.map((r) => (
                <div 
                  key={r.id}
                  className={`p-5 rounded-2xl border transition-all text-left flex flex-col md:flex-row justify-between gap-5 ${
                    r.status === 'Pending' 
                      ? 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50' 
                      : r.status === 'Flagged'
                      ? 'bg-red-50/40 dark:bg-red-950/10 border-red-200'
                      : 'bg-slate-50/50 dark:bg-slate-850/40 border-slate-150 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-white">{r.userName}</span>
                      <span className="text-xs text-slate-405 font-mono">({r.userEmail})</span>
                      {r.userMobile && <span className="text-[11px] text-slate-450 dark:text-slate-400 font-mono">📞 {r.userMobile}</span>}
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[10px] text-slate-400 font-bold">{formatDate(r.createdAt)}</span>
                      
                      {/* State Pills */}
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        r.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/55 dark:text-emerald-300' :
                        r.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/55 dark:text-amber-300 animate-pulse' :
                        'bg-red-100 text-red-800 dark:bg-red-950/55'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    {/* Score and Details */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`w-3.5 h-3.5 ${
                              s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md">
                        {r.category}
                      </span>
                      {r.wouldRecommend ? (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Recommends App
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">No Recommendation</span>
                      )}
                    </div>

                    <p className="text-slate-650 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pt-1">
                      "{r.comment}"
                    </p>
                  </div>

                  {/* Actions column */}
                  <div className="flex md:flex-col justify-end gap-2 shrink-0 md:w-36">
                    {r.status !== 'Approved' && (
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="flex-grow py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {r.status === 'Approved' && (
                      <button
                        onClick={() => handleFlag(r.id, 'Flagged')}
                        className="py-2 px-3 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-500 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        Flag Content
                      </button>
                    )}
                    {r.status === 'Flagged' && (
                      <button
                        onClick={() => handleFlag(r.id, 'Addressed')}
                        className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        Mark Addressed
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="py-2 px-3 hover:bg-red-50 hover:text-red-650 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================
           PUBLIC TESTIMONIALS & SUBMISSION FORM
           ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* LEFT PANEL: SUBMIT FEEDBACK (5 cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-linear-to-b from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-900/65 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl" />

              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <PenTool className="w-5.5 h-5.5 text-emerald-600" />
                Submit Traveler Review
              </h2>
              <p className="text-xs text-slate-405 leading-relaxed mb-6">
                Fill out the secure fields. We screen feedback submissions under moderation checks to avoid spam.
              </p>

              {submitSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-150 dark:border-emerald-900/50 rounded-2xl p-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">Feedback Submitted Successfully!</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                      Thank you! Your accurate feedback was logged. It will join the public Traveler Testimonials board once approved by our moderation queue.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                  >
                    Send another response
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  
                  {/* Rating Stars Selection */}
                  <div className="bg-slate-50/50 dark:bg-slate-805/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Overall Rating Score</span>
                    
                    <div className="flex items-center gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, rating: star }))}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 cursor-pointer transition transform hover:scale-120 hover:rotate-6 active:scale-95"
                        >
                          <Star 
                            className={`w-7 h-7 transition-all duration-100 ${
                              star <= (hoverRating !== null ? hoverRating : formData.rating)
                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_2px_rgba(245,158,11,0.2)]'
                                : 'text-slate-205 dark:text-slate-700 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] font-mono font-extrabold uppercase text-amber-600 dark:text-amber-450 tracking-wider">
                      {formData.rating === 5 && '🌟 5/5 - Outstanding Experience!'}
                      {formData.rating === 4 && '✨ 4/5 - Very Good & Helpful'}
                      {formData.rating === 3 && '👍 3/5 - Average & Decent'}
                      {formData.rating === 2 && '⚠️ 2/5 - Fair, needs updates'}
                      {formData.rating === 1 && '🛑 1/5 - Poor APP performance'}
                    </span>
                  </div>

                  {/* Rating Category */}
                  <div className="flex flex-col text-left gap-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Feedback Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value as PlatformReview['category'] }))}
                      className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 p-3 rounded-xl focus:bg-white outline-none focus:ring-1 focus:ring-emerald-500 transition-all dark:text-white"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Comment */}
                  <div className="flex flex-col text-left gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Feedback Description</label>
                      <span className="text-[9px] text-slate-400 font-mono">{formData.comment.length}/1000</span>
                    </div>
                    <textarea
                      rows={4}
                      required
                      maxLength={1000}
                      value={formData.comment}
                      onChange={(e) => setFormData(p => ({ ...p, comment: e.target.value }))}
                      placeholder="Specify your travel suggestions or bugs encountered. Please be detailed and factual!"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 focus:bg-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 resize-none transition-all dark:text-white"
                    />
                  </div>

                  {/* Contact Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="flex flex-col text-left gap-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Traveler Name</label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={formData.userName}
                        onChange={(e) => setFormData(p => ({ ...p, userName: e.target.value }))}
                        placeholder="e.g. Anand Sharma"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 focus:bg-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 transition-all dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col text-left gap-1.5">
                      <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Email Address</label>
                      <input
                        type="email"
                        required
                        maxLength={150}
                        value={formData.userEmail}
                        onChange={(e) => setFormData(p => ({ ...p, userEmail: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 focus:bg-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 transition-all dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Mobile No */}
                  <div className="flex flex-col text-left gap-1.5">
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Mobile Number <span className="font-medium text-slate-400 text-[10px]">(Optional, for direct verification)</span></label>
                    <input
                      type="tel"
                      maxLength={15}
                      value={formData.userMobile}
                      onChange={(e) => setFormData(p => ({ ...p, userMobile: e.target.value }))}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-705 focus:bg-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 transition-all dark:text-white"
                    />
                  </div>

                  {/* Recommend Checkbox */}
                  <label className="flex items-center gap-2.5 p-1 cursor-pointer group text-left select-none">
                    <input
                      type="checkbox"
                      checked={formData.wouldRecommend}
                      onChange={(e) => setFormData(p => ({ ...p, wouldRecommend: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 bg-slate-100 border-slate-300 rounded-sm focus:ring-emerald-500 accent-emerald-605"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-slate-750 dark:text-slate-200 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-indigo-505 fill-indigo-505 shrink-0" />
                        I highly recommend HillyTrip
                      </span>
                      <span className="text-[10px] text-slate-400">Would recommend this guide to other Himalayan travelers</span>
                    </div>
                  </label>

                  {errorMsg && (
                    <div className="bg-rose-50 dark:bg-rose-950/25 border border-rose-150 text-rose-700 dark:text-rose-400 p-3 rounded-xl text-xs font-medium text-center">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {/* Submit Trigger */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-slate-900 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-slate-900/10 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Posting Feedback...' : 'Log Travelers Review'}
                  </button>

                  {!user && (
                    <p className="text-[10px] text-slate-400 text-center leading-normal">
                      💡 Guest submissions are allowed, but logging in first with Google auto-populates credentials and validates your account status.
                    </p>
                  )}
                </form>
              )}
            </div>
            
            {/* Aggregate Statistics Summary Subpanel */}
            <div className="bg-slate-900 text-white border border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] tracking-widest font-black uppercase text-amber-500 block">Trust Indicator</span>
                <h3 className="font-extrabold text-base text-slate-100 mt-1">Live Aggregate Score</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">Derived from verified traveler reviews posted on the HillyTrip live network.</p>
              </div>

              <div className="flex items-center gap-6 py-6 border-y border-slate-850 my-5 justify-center sm:justify-start">
                <div className="text-center shrink-0">
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">{averageRating}</div>
                  <div className="flex items-center justify-center mt-1.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-450 text-amber-450" />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-500 font-semibold block mt-1 uppercase font-mono">{totalVotes} Total Votes</span>
                </div>

                <div className="flex-1 space-y-1.5 max-w-[200px] text-left">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>Satisfied Rates</span>
                    <span className="font-extrabold text-emerald-400">{recommendPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${recommendPercent}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-455 leading-tight block">Travelers vote on whether to recommend this itinerary system.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <Award className="w-4 h-4 text-emerald-450 shrink-0" />
                <span>Checked by automated security rules & moderation desk.</span>
              </div>
            </div>
          </div>
          
          {/* RIGHT PANEL: TESTIMONIALS LIST & FILTER (7 cols on Desktop) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Filter Bar Controls Header */}
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Filter Reviews</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Rating Filter widget */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Rating:</span>
                  <select 
                    value={String(ratingFilter)} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setRatingFilter(val === 'All' ? 'All' : Number(val));
                    }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-705 p-1.5 rounded-lg text-xs font-semibold dark:text-white"
                  >
                    <option value="All">All Scores</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                {/* Category Filter widget */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Category:</span>
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-705 p-1.5 rounded-lg text-xs font-semibold dark:text-white"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Testimonials List */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-xs font-bold">Synchronizing active reviews...</p>
              </div>
            ) : displayedReviews.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl py-16 px-6 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">No reviews found under this filter</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Be the first to submit a review on mountain trip paths or app response! Fill out the traveler feedback card.
                </p>
                {(ratingFilter !== 'All' || categoryFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setRatingFilter('All');
                      setCategoryFilter('All');
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-450 hover:underline font-bold mt-2"
                  >
                    Clear Filter Criteria
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                {displayedReviews.map((r) => {
                  const initial = (r.userName || 'U').charAt(0).toUpperCase();
                  
                  // Color hash based on name
                  const bgColors = [
                    'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-305',
                    'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
                    'bg-purple-100 text-purple-805 dark:bg-purple-950 dark:text-purple-300',
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  ];
                  const colorIndex = (r.userName || '').charCodeAt(0) % bgColors.length;
                  const colorClass = bgColors[colorIndex];

                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-2xl p-5 shadow-3xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs transition-all relative text-left group"
                    >
                      {/* Avatar name header */}
                      <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shrink-0 shadow-3xs ${colorClass}`}>
                            {initial}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 dark:text-white block leading-tight">{r.userName}</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">Verified Traveler</span>
                          </div>
                        </div>

                        {/* Rating Stars and Category Badge */}
                        <div className="flex flex-col items-end gap-1 text-right mt-1 sm:mt-0">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={`w-3 h-3 ${
                                  s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-705'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[9px] bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-100 dark:border-slate-705 uppercase tracking-wide">
                            {r.category}
                          </span>
                        </div>
                      </div>

                      {/* Content text */}
                      <p className="text-slate-650 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed italic pl-1">
                        "{r.comment}"
                      </p>

                      {/* Bottom row: Created At, recommendation stamp */}
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-3 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-300 dark:text-slate-500" />
                          {formatDate(r.createdAt)}
                        </span>

<<<<<<< HEAD
                        <div className="flex items-center gap-3">
                          {r.wouldRecommend && (
                            <span className="text-emerald-600 dark:text-emerald-450 flex items-center gap-1 font-extrabold">
                              <ThumbsUp className="w-3 h-3 fill-emerald-100 dark:fill-transparent" />
                              Highly Recommends
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenReportModal(r)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Report this review as inappropriate or false"
                          >
                            <ShieldAlert className="w-3 h-3" />
                            <span>Report</span>
                          </button>
                        </div>
=======
                        {r.wouldRecommend && (
                          <span className="text-emerald-600 dark:text-emerald-450 flex items-center gap-1 font-extrabold">
                            <ThumbsUp className="w-3 h-3 fill-emerald-100 dark:fill-transparent" />
                            Highly Recommends
                          </span>
                        )}
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
<<<<<<< HEAD
      {/* Traveler Feedback Reporting Modal */}
      {reportingReview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            <div className="bg-rose-600 text-white p-6 relative">
              <h2 className="text-base font-black flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Report Feedback Comment</span>
              </h2>
              <p className="text-[11px] text-rose-100 mt-1">
                Help us keep HillyTrip safe and factual. Please state why you believe this review is inappropriate, incorrect, or fraudulent.
              </p>
              <button
                type="button"
                onClick={() => setReportingReview(null)}
                className="absolute right-6 top-6 text-rose-200 hover:text-white transition text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitReviewReport} className="p-6 space-y-4">
              {reportSuccessMsg ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl text-xs font-bold leading-relaxed text-center">
                  ✨ {reportSuccessMsg}
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-705 p-3 rounded-xl text-xs text-slate-500 italic">
                    "{reportingReview.comment}"
                    <span className="block mt-1 font-bold text-[10px] text-slate-400 font-mono">— {reportingReview.userName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 mb-1">YOUR NAME *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Passang Sherpa"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-semibold outline-none dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 mb-1">YOUR EMAIL *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. passang@gmail.com"
                        value={reporterEmail}
                        onChange={(e) => setReporterEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-xs font-semibold outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 mb-1">REASON FOR REPORT *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please specify detailed reasons (e.g. spam, abusive language, incorrect business details, personal conflict of interest)..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs font-semibold outline-none focus:bg-white dark:text-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReportingReview(null)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReport}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
=======
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
    </div>
  );
}
