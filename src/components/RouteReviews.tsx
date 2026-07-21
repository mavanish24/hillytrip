// src/components/RouteReviews.tsx
import React, { useState, useEffect } from 'react';
import { 
  Star, MessageSquare, ThumbsUp, Search, SlidersHorizontal, CheckCircle, Award
} from 'lucide-react';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  visitDate: string;
  helpfulVotes: number;
  isVerified: boolean;
  cleanliness: number;
  location: number;
  service: number;
  food: number;
}

interface RouteReviewsProps {
  routeId: string;
  fromName: string;
  toName: string;
  setNotification?: (notif: { type: 'success' | 'error' | 'info', message: string } | null) => void;
}

export default function RouteReviews({
  routeId,
  fromName,
  toName,
  setNotification
}: RouteReviewsProps) {
  // Key for local storage persistence per route
  const storageKey = `hillytrip_reviews_${routeId}`;

  // Initial seed reviews
  const initialReviews: Review[] = [
    {
      id: 'rev-1',
      userName: "Abhijit Sen",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      rating: 5,
      title: "Phenomenal Scenic Traverse!",
      content: `The drive from ${fromName} is absolutely stunning. We traveled in early October and the clear views of the mountain walls were jaw-dropping. The road is slightly narrow with winding hairpin bends, but our local driver was very expert. We stopped near the waterfalls for ginger chai—highly recommended!`,
      visitDate: "October 2025",
      helpfulVotes: 14,
      isVerified: true,
      cleanliness: 5,
      location: 5,
      service: 5,
      food: 4
    },
    {
      id: 'rev-2',
      userName: "Meera Nair",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      rating: 4,
      title: "Excellent service but stay alert for fog",
      content: `Extremely comfortable reserved cab experience. We booked a Bolero from the taxi stand syndicate. Keep in mind that heavy fog rolls in near the waterfalls after 3:30 PM, which slows down the driving significantly. Try to start as early as 7:30 AM if possible!`,
      visitDate: "September 2025",
      helpfulVotes: 8,
      isVerified: true,
      cleanliness: 4,
      location: 5,
      service: 4,
      food: 4
    }
  ];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'highest'>('helpful');

  // Form states
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formRating, setFormRating] = useState<number>(5);
  
  // Criteria scores
  const [cleanScore, setCleanScore] = useState<number>(5);
  const [locScore, setLocScore] = useState<number>(5);
  const [serviceScore, setServiceScore] = useState<number>(5);
  const [foodScore, setFoodScore] = useState<number>(5);

  // Loaded reviews from localStorage or seed
  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setReviews(JSON.parse(cached));
      } catch (e) {
        setReviews(initialReviews);
      }
    } else {
      setReviews(initialReviews);
      localStorage.setItem(storageKey, JSON.stringify(initialReviews));
    }
  }, [routeId]);

  // Handle helpful vote clicks
  const handleVoteHelpful = (id: string) => {
    const updated = reviews.map(rev => {
      if (rev.id === id) {
        return { ...rev, helpfulVotes: rev.helpfulVotes + 1 };
      }
      return rev;
    });
    setReviews(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    if (setNotification) {
      setNotification({ type: 'success', message: 'Thank you for your feedback!' });
    }
  };

  // Submit new review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTitle.trim() || !formContent.trim()) {
      if (setNotification) {
        setNotification({ type: 'error', message: 'Please fill out all fields.' });
      }
      return;
    }

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: formName,
      userAvatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop`,
      rating: formRating,
      title: formTitle,
      content: formContent,
      visitDate: "Just now",
      helpfulVotes: 0,
      isVerified: true,
      cleanliness: cleanScore,
      location: locScore,
      service: serviceScore,
      food: foodScore
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Clear form
    setFormName('');
    setFormTitle('');
    setFormContent('');
    setFormRating(5);
    setShowForm(false);

    if (setNotification) {
      setNotification({ type: 'success', message: 'Review successfully posted! Verified traveler tag applied.' });
    }
  };

  // Calculate dynamic metrics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
    : 4.8;

  const avgClean = totalReviews > 0 ? Math.round((reviews.reduce((acc, r) => acc + r.cleanliness, 0) / totalReviews) * 10) / 10 : 4.5;
  const avgLoc = totalReviews > 0 ? Math.round((reviews.reduce((acc, r) => acc + r.location, 0) / totalReviews) * 10) / 10 : 4.8;
  const avgSvc = totalReviews > 0 ? Math.round((reviews.reduce((acc, r) => acc + r.service, 0) / totalReviews) * 10) / 10 : 4.6;
  const avgFood = totalReviews > 0 ? Math.round((reviews.reduce((acc, r) => acc + r.food, 0) / totalReviews) * 10) / 10 : 4.2;

  // Filter & Sort
  const processedReviews = reviews
    .filter(rev => {
      const q = searchQuery.toLowerCase().trim();
      return rev.userName.toLowerCase().includes(q) || 
             rev.title.toLowerCase().includes(q) || 
             rev.content.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'helpful') return b.helpfulVotes - a.helpfulVotes;
      if (sortBy === 'recent') return b.id.localeCompare(a.id); // since newer IDs are timestamped higher
      return b.rating - a.rating;
    });

  return (
    <div className="bg-[#05120c] border border-emerald-500/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(3,10,6,0.5)] text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-emerald-500/10">
        <div>
          <h3 className="font-extrabold text-lg text-emerald-400 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" /> Traveler Feedback Board
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real accounts and experience ratings from verified explorers who traveled this high-altitude trail.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase rounded-lg hover:bg-emerald-400 transition duration-150 shadow-md cursor-pointer"
        >
          {showForm ? "Cancel Review" : "Write a Review"}
        </button>
      </div>

      {/* Review Submission Form drawer */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-slate-950/70 border border-emerald-500/20 p-5 rounded-2xl mb-8 flex flex-col gap-4 animate-slide-up">
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Leave Your Verified Route Review</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Your Full Name</label>
              <input 
                type="text" 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Priyanjali Roy"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Overall Trail Rating</label>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    className="p-0.5 focus:outline-none cursor-pointer"
                  >
                    <Star className={`w-5 h-5 ${star <= formRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Cleanliness</label>
              <select value={cleanScore} onChange={(e) => setCleanScore(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-white">
                {[1,2,3,4,5].map(x => <option key={x} value={x}>{x}★</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Location</label>
              <select value={locScore} onChange={(e) => setLocScore(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-white">
                {[1,2,3,4,5].map(x => <option key={x} value={x}>{x}★</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Service</label>
              <select value={serviceScore} onChange={(e) => setServiceScore(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-white">
                {[1,2,3,4,5].map(x => <option key={x} value={x}>{x}★</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Food Stops</label>
              <select value={foodScore} onChange={(e) => setFoodScore(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-white">
                {[1,2,3,4,5].map(x => <option key={x} value={x}>{x}★</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Review Headline</label>
            <input 
              type="text" 
              value={formTitle} 
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Smooth blacktop and gorgeous water cascades!"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Detailed Experience</label>
            <textarea 
              rows={3}
              value={formContent} 
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Describe the road quality, pitstops, scenery details, and drivers syndicates pricing details..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition duration-150 cursor-pointer"
          >
            Submit Review to Blockchain Ledger
          </button>
        </form>
      )}

      {/* Numerical Rating Overview & Category Sliders (Awwwards design) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 bg-slate-950/45 p-6 rounded-2xl border border-slate-900">
        
        {/* Left: Score Box */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-emerald-500/10 pb-6 md:pb-0 md:pr-6">
          <span className="text-5xl font-black text-white tracking-tighter">{averageRating}</span>
          <div className="flex items-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-2 uppercase font-bold">{totalReviews} Verified Traveler Submissions</span>
        </div>

        {/* Right: Dimension Sliders */}
        <div className="md:col-span-8 flex flex-col gap-3.5 justify-center">
          {[
            { label: '📍 Route Scenery & Location', score: avgLoc },
            { label: '🚖 Driver Punctuality & Cabin Safety', score: avgSvc },
            { label: '🧹 Halt Hygiene & Washrooms', score: avgClean },
            { label: '🍜 Local Mountain Cuisine Stops', score: avgFood }
          ].map((dim, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                <span>{dim.label}</span>
                <span className="text-emerald-400">{dim.score} / 5</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(dim.score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review list Search & Sorting Filters Row */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
        
        {/* Search input */}
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matching comments..."
            className="w-full bg-slate-950/60 border border-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/30 font-medium"
          />
        </div>

        {/* Sort Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-900 px-1.5 py-1 rounded-xl">
          {[
            { id: 'helpful', label: 'Helpful' },
            { id: 'recent', label: 'Recent' },
            { id: 'highest', label: 'Top-Rated' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id as any)}
              className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-wider rounded-lg transition duration-150 cursor-pointer ${
                sortBy === opt.id 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews feed */}
      <div className="flex flex-col gap-4">
        {processedReviews.length > 0 ? (
          processedReviews.map(rev => (
            <div 
              key={rev.id}
              className="bg-slate-950/35 border border-slate-900/60 p-5 rounded-2xl flex flex-col gap-3 relative"
            >
              {/* Reviewer Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={rev.userAvatar} 
                    alt={rev.userName} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-800" 
                  />
                  <div>
                    <h5 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
                      {rev.userName}
                      {rev.isVerified && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          <CheckCircle className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                    </h5>
                    <span className="text-[9.5px] text-slate-500 font-mono uppercase block mt-0.5">TRAVELED: {rev.visitDate}</span>
                  </div>
                </div>

                {/* Rating score badge */}
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg border border-amber-500/10 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {rev.rating}.0
                </div>
              </div>

              {/* Review Content */}
              <div className="text-left mt-1">
                <h6 className="text-xs font-black text-slate-200 uppercase tracking-wide">{rev.title}</h6>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-1">{rev.content}</p>
              </div>

              {/* Bottom stats & voting */}
              <div className="flex items-center justify-between border-t border-slate-900/80 pt-3 mt-1 text-[10px]">
                {/* Specific category details hover trigger */}
                <span className="text-slate-500 font-mono uppercase font-bold">
                  CLEAN: {rev.cleanliness}★ • LOC: {rev.location}★ • FOOD: {rev.food}★
                </span>

                {/* Helpful voting */}
                <button
                  onClick={() => handleVoteHelpful(rev.id)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer font-black uppercase tracking-wider bg-slate-900/60 hover:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-900"
                >
                  <ThumbsUp className="w-3 h-3" /> Helpful ({rev.helpfulVotes})
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
            <SlidersHorizontal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-bold uppercase">No matching reviews found.</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Try widening your search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}
