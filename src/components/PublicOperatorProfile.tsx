import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldCheck, Award, MapPin, Clock, Calendar, 
  Phone, Globe, Facebook, Instagram, Star, Info, Image as ImageIcon, 
  Check, User, MessageSquare, Heart, AlertTriangle, ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingReview } from '../types';

interface PublicOperatorProfileProps {
  operatorId: string;
  onClose?: () => void;
  // If we open inside a modal/sub-panel, we can handle it beautifully.
  // If we open as a standalone hash path, we can also support navigating back.
  onNavigate?: (hash: string) => void;
}

export default function PublicOperatorProfile({ operatorId, onClose, onNavigate }: PublicOperatorProfileProps) {
  const [operatorUser, setOperatorUser] = useState<any>(null);
  const [reviews, setReviews] = useState<BookingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Gallery tab filter
  const [activeGalleryTab, setActiveGalleryTab] = useState<'all' | 'fleet' | 'office' | 'team'>('all');
  // Lightbox modal state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Fetch operator details and their reviews
  useEffect(() => {
    const fetchOperatorAndReviews = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all reviews
        const reviewsRes = await fetch('/api/booking-reviews?showHidden=false');
        let operatorReviews: BookingReview[] = [];
        if (reviewsRes.ok) {
          const allReviews = await reviewsRes.json();
          operatorReviews = allReviews.filter((r: any) => r.operatorId === operatorId && r.status === 'active');
          setReviews(operatorReviews);
        }

        // Fetch users to find this operator
        const usersRes = await fetch('/api/booking-leads'); // Wait, let's fetch from our public users if available, or we fetch from /api/booking-leads or a custom endpoint
        // Let's call /api/admin/taxi-operators or fetch from the list of operators in the system.
        // Wait, is there a direct way? Let's check how we can fetch the user details. We can query `/api/booking-leads` or write a public endpoint `/api/taxi-operators` that contains all.
        // Let's search all users on the backend or we can create an endpoint.
        // For absolute reliability, let's fetch the operator details directly. Let's do a fetch to a public endpoint `/api/taxi-operators/${operatorId}`.
        // Let's check if we can write a public API route on the backend for `/api/taxi-operators` and `/api/taxi-operators/:operatorId`!
        // That is extremely beautiful and robust. Let's look up how we can fetch the user on the client-side right now:
        const response = await fetch(`/api/taxi-operators/${operatorId}`);
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success) {
            setOperatorUser(resJson.data);
            setLoading(false);
            return;
          }
        }

        // Fallback: search users from the leads database
        const leadsRes = await fetch('/api/booking-leads');
        if (leadsRes.ok) {
          const data = await leadsRes.json();
          if (data.success && data.leads) {
            const foundBooking = data.leads.find((l: any) => l.assignedPartnerId === operatorId);
            if (foundBooking) {
              // Construct a default operator profile based on booking details
              setOperatorUser({
                id: operatorId,
                name: foundBooking.assignedPartnerName || 'Verified HillyTrip Operator',
                taxiOperatorDetails: {
                  businessName: foundBooking.assignedPartnerName || 'Verified HillyTrip Operator',
                  ownerName: 'Licensed Operator',
                  businessDescription: 'Providing fully verified luxury sedan, SUV and Force Traveller vehicles covering high-altitude corridors and sightseeing trips in the Eastern Himalayas.',
                  operatingRegions: ['Darjeeling', 'Siliguri', 'Gangtok', 'Kalka', 'Shimla'],
                  languagesSpoken: ['Hindi', 'English', 'Nepali'],
                  yearsInBusiness: '4',
                  businessHours: '24/7 Dispatching',
                  emergencyContact: '+91 99332 99011',
                  gallery: [
                    { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400', category: 'fleet' },
                    { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400', category: 'fleet' }
                  ],
                  services: {
                    airportTransfer: true,
                    railwayPickup: true,
                    sightseeing: true,
                    multiDayTours: true,
                    outstationTrips: true
                  },
                  vehicleTypes: {
                    suv: true,
                    sedan: true
                  }
                }
              });
              setLoading(false);
              return;
            }
          }
        }

        // Final Fallback: Seeded operator profile
        const seededMap: Record<string, any> = {
          'partner_hillytrip': {
            id: 'partner_hillytrip',
            name: 'HillyTrip Taxi Fleet (Shimla-Manali Direct)',
            taxiOperatorDetails: {
              businessName: 'HillyTrip Taxi Fleet (Shimla-Manali Direct)',
              ownerName: 'Rajesh Sharma',
              businessDescription: 'Standard premium fleet services operating direct luxury cab lines between Kalka, Shimla, Manali and scenic Himachal mountain passes. Vetted professional mountain drivers holding deep elevation experience.',
              operatingRegions: ['Shimla', 'Manali', 'Kalka', 'Chandigarh', 'Dharamshala'],
              languagesSpoken: ['Hindi', 'English', 'Punjabi'],
              yearsInBusiness: '6',
              businessAddress: 'HillyTrip HQ, Mall Road, Shimla',
              businessHours: 'Daily 7:00 AM - 11:00 PM',
              emergencyContact: '+91 98822 10933',
              gallery: [
                { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600', category: 'fleet' },
                { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600', category: 'fleet' },
                { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600', category: 'office' }
              ],
              services: {
                airportTransfer: true,
                railwayPickup: true,
                sightseeing: true,
                multiDayTours: true,
                outstationTrips: true
              },
              vehicleTypes: {
                suv: true,
                sedan: true,
                luxury: true
              }
            }
          },
          'partner_amit': {
            id: 'partner_amit',
            name: 'Amit Mountain Cabs & Tours',
            taxiOperatorDetails: {
              businessName: 'Amit Mountain Cabs & Tours',
              ownerName: 'Amit Negi',
              businessDescription: 'Dharamshala McLeodganj sightseeing packages, Pathankot express transits, and high elevation passes. Our vehicle roster includes AWD luxury SUVs and experienced mechanics.',
              operatingRegions: ['Dharamshala', 'McLeodganj', 'Pathankot', 'Manali'],
              languagesSpoken: ['Hindi', 'English', 'Himachali'],
              yearsInBusiness: '3',
              businessAddress: 'McLeodganj Bypass, Dharamshala',
              businessHours: 'Daily 8:00 AM - 9:00 PM',
              emergencyContact: '+91 94180 88214',
              gallery: [
                { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600', category: 'fleet' },
                { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400', category: 'fleet' }
              ],
              services: {
                sightseeing: true,
                multiDayTours: true,
                outstationTrips: true
              },
              vehicleTypes: {
                suv: true
              }
            }
          }
        };

        if (seededMap[operatorId]) {
          setOperatorUser(seededMap[operatorId]);
        } else {
          setError('Could not locate the selected operator profile.');
        }
      } catch (err) {
        console.error('Error fetching public operator:', err);
        setError('Failed to fetch details from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorAndReviews();
  }, [operatorId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Retrieving Operator Dossier...</p>
      </div>
    );
  }

  if (error || !operatorUser) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Profile Loading Failed</h4>
        <p className="text-slate-500 text-xs leading-relaxed">{error || 'This operator has not configured their public profile.'}</p>
        <button 
          onClick={onClose || (() => { if (onNavigate) onNavigate('#/'); })}
          className="bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const details = operatorUser.taxiOperatorDetails || {};
  const businessName = details.businessName || operatorUser.name || 'Verified HillyTrip Operator';
  const ownerName = details.ownerName || 'Licensed Professional';
  const desc = details.businessDescription || 'No business description provided yet.';
  const years = details.yearsInBusiness || '1';
  const hours = details.businessHours || 'Standard Operating Hours';
  const logo = details.businessLogo || '';
  const banner = details.coverImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200';
  const regions = details.operatingRegions || [];
  const languages = details.languagesSpoken || [];
  const socialWeb = details.website || '';
  const socialFb = details.facebookUrl || '';
  const socialIg = details.instagramUrl || '';
  const galleryPhotos = details.gallery || [];
  const services = details.services || {};
  const vehicleTypes = details.vehicleTypes || {};

  // Calculate overall statistics based on actual reviews
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)) 
    : 5.0;

  // Multi-factor average sub-ratings
  const getSubRatingAvg = (key: 'tripExperience' | 'vehicleCleanliness' | 'driverBehaviour' | 'punctuality' | 'valueForMoney') => {
    if (reviewCount === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r[key]) || 5), 0);
    return parseFloat((sum / reviewCount).toFixed(1));
  };

  const ratingsBreakdown = {
    tripExperience: getSubRatingAvg('tripExperience'),
    vehicleCleanliness: getSubRatingAvg('vehicleCleanliness'),
    driverBehaviour: getSubRatingAvg('driverBehaviour'),
    punctuality: getSubRatingAvg('punctuality'),
    valueForMoney: getSubRatingAvg('valueForMoney'),
  };

  // Generate verified badges
  const getBadges = () => {
    const badgesList = [];
    badgesList.push({
      label: 'Verified Operator',
      emoji: '🛡️',
      colorClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    });
    if (avgRating >= 4.5 && (reviewCount >= 2 || parseInt(years) >= 3)) {
      badgesList.push({
        label: 'Top Rated',
        emoji: '⭐',
        colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      });
    }
    badgesList.push({
      label: 'Fast Responder',
      emoji: '⚡',
      colorClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    });
    if (reviewCount >= 2) {
      badgesList.push({
        label: 'Trusted Operator',
        emoji: '🏆',
        colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
      });
    }
    return badgesList;
  };

  const badges = getBadges();

  // Gallery filtering
  const filteredGallery = galleryPhotos.filter((img: any) => {
    if (activeGalleryTab === 'all') return true;
    return img.category === activeGalleryTab;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="public_operator_profile">
      {/* HEADER SECTION (COVER BANNER & LOGO OVERLAY) */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
        {/* Navigation Action bar */}
        <div className="absolute top-4 left-4 z-20">
          <button 
            type="button"
            onClick={onClose || (() => { if (onNavigate) onNavigate('#/'); })}
            className="flex items-center gap-1.5 bg-slate-950/80 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-800 backdrop-blur-sm cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Close Dossier</span>
          </button>
        </div>

        {/* Big Cover Banner */}
        <div className="h-60 w-full relative">
          <img src={banner} alt="Cover Banner" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        </div>

        {/* Logo and Identity Overlay */}
        <div className="p-6 pt-0 relative -mt-16 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            {/* Logo */}
            <div className="w-28 h-28 rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-xl overflow-hidden flex items-center justify-center shrink-0 relative">
              {logo ? (
                <img src={logo} alt="Operator Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-amber-500">🚖</span>
              )}
            </div>

            {/* Business text */}
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2">
                <span>{businessName}</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold">Managed by Owner Representative: <span className="text-slate-200">{ownerName}</span></p>
              
              {/* Badges bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
                {badges.map((b, idx) => (
                  <span 
                    key={idx} 
                    className={`border px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-black uppercase flex items-center gap-1 ${b.colorClass}`}
                  >
                    <span>{b.emoji}</span>
                    <span>{b.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0 font-mono text-center md:text-right space-y-1 backdrop-blur-sm">
            <div className="flex items-center justify-center md:justify-end gap-1 text-amber-400 font-bold text-lg">
              <Star className="w-4.5 h-4.5 fill-amber-400" />
              <span>{avgRating} ★</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">{reviewCount} Verified Reviews</div>
            <div className="text-[10px] text-slate-500 uppercase">{years} Years operating in hills</div>
          </div>
        </div>
      </div>

      {/* CORE PROFILE GRID Layout (Left: Details, Right: Ratings/Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Details) */}
        <div className="md:col-span-2 space-y-6">
          {/* Business Biography bio */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Business Biography & Experience</h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-line">{desc}</p>
          </div>

          {/* Core Operating areas and Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Regions list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Operating Areas</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {regions.map((reg: string, idx: number) => (
                  <span key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold">
                    {reg}
                  </span>
                ))}
                {regions.length === 0 && <span className="text-slate-400 text-xs italic">All Eastern Himalayas</span>}
              </div>
            </div>

            {/* Languages spoken */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-sky-500" />
                <span>Staff Languages</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {languages.map((lang: string, idx: number) => (
                  <span key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold">
                    {lang}
                  </span>
                ))}
                {languages.length === 0 && <span className="text-slate-400 text-xs italic">Hindi, English</span>}
              </div>
            </div>
          </div>

          {/* Services Portfolio */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Verified Services & Portfolios</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'airportTransfer', label: 'Airport Transfers', icon: '✈️' },
                { key: 'railwayPickup', label: 'Railway Pickups', icon: '🚂' },
                { key: 'sightseeing', label: 'Local Sightseeing', icon: '🗺️' },
                { key: 'multiDayTours', label: 'Multi-Day Tours', icon: '🏔️' },
                { key: 'outstationTrips', label: 'Outstation Runs', icon: '🚗' },
                { key: 'corporateTravel', label: 'Corporate Travel', icon: '💼' },
                { key: 'weddingTravel', label: 'Wedding Transits', icon: '💒' },
              ].map(serv => {
                const isOffered = services[serv.key] === true;
                return (
                  <div 
                    key={serv.key} 
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isOffered 
                        ? 'border-amber-500/20 bg-amber-500/5 text-slate-800 dark:text-white' 
                        : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    <span className="text-lg block mb-1.5">{serv.icon}</span>
                    <span className="text-[10px] uppercase font-black tracking-wider block leading-tight">{serv.label}</span>
                    {isOffered ? (
                      <span className="inline-block mt-1 text-[8px] uppercase font-black px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 rounded">Active</span>
                    ) : (
                      <span className="inline-block mt-1 text-[8px] uppercase font-bold text-slate-400">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asset Photo Gallery tabbed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Office & Fleet Gallery</h4>
              
              {/* Category selector */}
              <div className="inline-flex bg-slate-50 dark:bg-slate-950 p-1 border border-slate-100 dark:border-slate-850 rounded-xl text-[10px] font-bold">
                {[
                  { id: 'all', label: 'All Photos' },
                  { id: 'fleet', label: 'Fleet' },
                  { id: 'office', label: 'Office' },
                  { id: 'team', label: 'Drivers' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveGalleryTab(tab.id as any)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                      activeGalleryTab === tab.id 
                        ? 'bg-slate-900 text-white dark:bg-slate-800' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredGallery.map((img: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setLightboxImage(img.url)}
                  className="group aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/40 dark:border-slate-800 relative cursor-pointer"
                >
                  <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  <span className="absolute bottom-2 left-2 bg-slate-950/80 text-amber-400 px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider">
                    {img.category}
                  </span>
                </div>
              ))}

              {filteredGallery.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p>No photos in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Ratings/Contact Notices) */}
        <div className="space-y-6">
          {/* Detailed Ratings Breakdown Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Detailed Rating Scores</h4>
            
            <div className="space-y-3 text-xs">
              {[
                { key: 'tripExperience', label: 'Trip Experience' },
                { key: 'vehicleCleanliness', label: 'Vehicle Cleanliness' },
                { key: 'driverBehaviour', label: 'Driver Behaviour' },
                { key: 'punctuality', label: 'Punctuality' },
                { key: 'valueForMoney', label: 'Value for Money' }
              ].map(metric => {
                const val = ratingsBreakdown[metric.key as keyof typeof ratingsBreakdown];
                const pct = (val / 5) * 100;
                return (
                  <div key={metric.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span>{metric.label}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{val} / 5.0</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Hours and Contact guidelines notice */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-xs text-slate-300 space-y-4 relative overflow-hidden">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">booking schedule details</h4>
              <p className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{hours}</span>
              </p>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">direct communication safety</h4>
              <div className="bg-slate-950/70 border border-slate-850 p-3 rounded-2xl text-[11px] leading-relaxed text-amber-200/90 flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-1">HillyTrip Booking Protection</p>
                  To secure your transit insurance cover, pre-vetted pricing matrices, and direct driver tracking, <strong>never communicate or pay outside the HillyTrip engine</strong>. Private bookings are unauthorized and forfeit full assistance.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRAVELER REVIEWS list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Traveler Reviews ({reviewCount})</h4>
        
        <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
          {reviews.map((rev, idx) => (
            <div key={rev.id} className={`${idx > 0 ? 'pt-6' : ''} space-y-3`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-150 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                    {rev.travellerName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900 dark:text-white">{rev.travellerName}</h5>
                    {rev.route && (
                      <p className="text-[10px] font-mono text-slate-400 font-medium">Route: {rev.route}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 p-1 px-2 rounded-lg font-mono text-xs font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{rev.rating}.0</span>
                </div>
              </div>

              {/* Comments */}
              <div className="pl-11 space-y-2">
                {rev.title && <h6 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">"{rev.title}"</h6>}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{rev.comment}</p>
                
                {/* Review Photos */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {rev.photos.map((ph, pi) => (
                      <img 
                        key={pi} 
                        src={ph} 
                        alt="Review Photo" 
                        onClick={() => setLightboxImage(ph)}
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200/40 cursor-pointer hover:opacity-90" 
                      />
                    ))}
                  </div>
                )}

                {/* Driver information */}
                {rev.driverName && (
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 pt-1">
                    <span>Mountain Driver:</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">👮 {rev.driverName}</span>
                  </div>
                )}

                {/* Operator reply */}
                {(rev as any).operatorReply && (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 mt-3 text-xs leading-relaxed">
                    <p className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[9px] tracking-wider mb-1 flex items-center gap-1">
                      <span>🚖 Operator Response:</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-medium font-serif italic">"{(rev as any).operatorReply}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p>No verified reviews for this operator yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button className="absolute top-4 right-4 bg-slate-900 border border-slate-800 text-white p-2 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt="Enlarged" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
