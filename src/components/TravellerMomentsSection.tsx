import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  X, 
  ArrowRight,
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ImageItem, Destination, Attraction, Homestay } from '../types';
import { getItemSlug } from '../utils/slug';
import TravellerMomentViewer, { MomentItem } from './traveller/TravellerMomentViewer';
import { ProgressiveImage } from './ProgressiveImage';
import { compressAndConvertToWebP } from '../utils/imageOptimizer';
import { uploadImageToFirebase } from '../utils/firebase';

export interface TravellerMomentsSectionProps {
  publicPhotos?: ImageItem[];
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  likes?: any[];
  navigate?: (path: string) => void;
  className?: string;
  initialMomentId?: string;
  onMomentUploaded?: (newMoment: any) => void;
  user?: any;
}

// Fallback high quality Himalayan Traveller Moments focusing on single locations (attraction or destination)
const FALLBACK_MOMENTS: MomentItem[] = [
  {
    id: 'moment-1',
    url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    caption: 'Golden morning light breaking over Tiger Hill as Mt. Kanchenjunga wakes up in pure splendour.',
    travellerName: 'Aarav Sharma',
    travellerId: 'usr-101',
    travellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya',
    locationName: 'Tiger Hill',
    locationSlug: 'tiger-hill',
    locationType: 'attraction',
    likesCount: 384,
    commentsCount: 42,
    viewsCount: 2890,
    dateStr: '2 days ago'
  },
  {
    id: 'moment-2',
    url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    caption: 'Fluttering prayer flags against the snow-capped Himalayan peaks along MG Marg, Gangtok.',
    travellerName: 'Priya Mukherjee',
    travellerId: 'usr-102',
    travellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rohan',
    locationName: 'Gangtok',
    locationSlug: 'gangtok',
    locationType: 'destination',
    likesCount: 512,
    commentsCount: 68,
    viewsCount: 4120,
    dateStr: '3 days ago'
  },
  {
    id: 'moment-3',
    url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    caption: 'Crystal-clear reflections of snow peaks on sacred waters at Gurudongmar Lake.',
    travellerName: 'Tenzing Norbu',
    travellerId: 'usr-103',
    travellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikram',
    locationName: 'Gurudongmar Lake',
    locationSlug: 'gurudongmar-lake',
    locationType: 'attraction',
    likesCount: 296,
    commentsCount: 31,
    viewsCount: 1980,
    dateStr: '4 days ago'
  },
  {
    id: 'moment-4',
    url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    caption: 'Sipping warm cardamom tea amidst colonial tea gardens and orchid nurseries in Darjeeling.',
    travellerName: 'Rohan Gupta',
    travellerId: 'usr-104',
    travellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sunil',
    locationName: 'Darjeeling',
    locationSlug: 'darjeeling',
    locationType: 'destination',
    likesCount: 215,
    commentsCount: 19,
    viewsCount: 1650,
    dateStr: '5 days ago'
  },
  {
    id: 'moment-5',
    url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    caption: 'Vibrant rhododendron blooms filling Yumthang Valley in full spring glory.',
    travellerName: 'Sneha Roy',
    travellerId: 'usr-105',
    travellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ananya',
    locationName: 'Yumthang Valley',
    locationSlug: 'yumthang-valley',
    locationType: 'attraction',
    likesCount: 430,
    commentsCount: 54,
    viewsCount: 3200,
    dateStr: '6 days ago'
  },
  {
    id: 'moment-6',
    url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    caption: 'Spiritual tranquility at Buddha Park Ravangla surrounded by floating cloud valleys.',
    travellerName: 'Vikramjit Das',
    travellerId: 'usr-106',
    travellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Deepak',
    locationName: 'Buddha Park',
    locationSlug: 'buddha-park-ravangla',
    locationType: 'attraction',
    likesCount: 367,
    commentsCount: 28,
    viewsCount: 2450,
    dateStr: '1 week ago'
  },
  {
    id: 'moment-7',
    url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    caption: 'Trekking along the Singalila ridge towards Sandakphu under crystal clear mountain skies.',
    travellerName: 'Deepak Tamang',
    travellerId: 'usr-107',
    travellerAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Vikram',
    locationName: 'Sandakphu',
    locationSlug: 'sandakphu',
    locationType: 'attraction',
    likesCount: 489,
    commentsCount: 52,
    viewsCount: 3810,
    dateStr: '1 week ago'
  }
];

export const TravellerMomentsSection: React.FC<TravellerMomentsSectionProps> = ({
  publicPhotos = [],
  destinations = [],
  attractions = [],
  navigate = () => {},
  className = '',
  initialMomentId,
  onMomentUploaded,
  user
}) => {
  // Local state for user-uploaded moments in this session
  const [userUploadedMoments, setUserUploadedMoments] = useState<MomentItem[]>([]);

  // Modal and upload form state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploaderName, setUploaderName] = useState(user?.displayName || '');
  const [uploaderEmail, setUploaderEmail] = useState(user?.email || '');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('');
  const [selectedAttractionId, setSelectedAttractionId] = useState<string>('');
  const [captionInput, setCaptionInput] = useState<string>('');

  // Filter attractions dynamically based on selected destination
  const filteredAttractions = useMemo(() => {
    if (!selectedDestinationId) return [];
    return attractions.filter(a => 
      a.destinationId === selectedDestinationId ||
      (a as any).destinationSlug === selectedDestinationId ||
      (a as any).destination === selectedDestinationId
    );
  }, [attractions, selectedDestinationId]);

  // Handle destination selection change
  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDestId = e.target.value;
    setSelectedDestinationId(newDestId);
    setSelectedAttractionId(''); // reset optional attraction selection
  };
  
  const [stagedPhotoUrl, setStagedPhotoUrl] = useState<string | null>(null);
  const [uploadedRemoteUrl, setUploadedRemoteUrl] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill user name if logged in and empty
  useEffect(() => {
    if (user?.displayName && !uploaderName) {
      setUploaderName(user.displayName);
    }
    if (user?.email && !uploaderEmail) {
      setUploaderEmail(user.email);
    }
  }, [user]);

  // Combine dataset with clean single-location resolution
  const momentsList = useMemo<MomentItem[]>(() => {
    let list: MomentItem[] = [...userUploadedMoments];

    if (publicPhotos && publicPhotos.length > 0) {
      const approved = publicPhotos.filter(p => p.status === 'Approved' || !p.status);
      approved.forEach((photo, idx) => {
        // Skip if photo ID is already present in userUploadedMoments
        if (list.some(m => m.id === photo.id)) return;

        // Check if photo is attached to an attraction
        const matchedAttr = photo.attractionId 
          ? attractions.find(a => a.id === photo.attractionId)
          : attractions.find(a => a.name.toLowerCase() === (photo.caption || '').toLowerCase());

        let locationName = '';
        let locationSlug = '';
        let locationType: 'attraction' | 'destination' = 'destination';

        if (matchedAttr) {
          locationName = matchedAttr.name;
          locationSlug = getItemSlug(matchedAttr) || matchedAttr.id;
          locationType = 'attraction';
        } else {
          const matchedDest = photo.destinationId 
            ? destinations.find(d => d.id === photo.destinationId)
            : destinations[idx % (destinations.length || 1)];

          locationName = matchedDest?.name || 'Darjeeling';
          locationSlug = matchedDest ? getItemSlug(matchedDest) : 'darjeeling';
          locationType = 'destination';
        }

        list.push({
          id: photo.id || `photo-${idx}`,
          url: photo.url,
          caption: photo.caption || photo.altText || 'Scenic mountain capture from the Eastern Himalayas.',
          travellerName: photo.uploadedBy || 'Himalayan Explorer',
          travellerId: photo.userId || 'usr-anon',
          travellerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(photo.uploadedBy || 'traveler')}`,
          locationName,
          locationSlug,
          locationType,
          likesCount: Math.floor(((photo.id || '').charCodeAt(0) * 13) % 400) + 85,
          commentsCount: Math.floor(((photo.id || '').charCodeAt(0) * 3) % 45) + 8,
          viewsCount: Math.floor(((photo.id || '').charCodeAt(0) * 91) % 3000) + 650,
          dateStr: photo.uploadDate ? new Date(photo.uploadDate).toLocaleDateString() : 'Recently'
        });
      });
    }

    // Merge fallback items if list is smaller than 7
    if (list.length < 7) {
      const existingIds = new Set(list.map(m => m.id));
      FALLBACK_MOMENTS.forEach(fallback => {
        if (!existingIds.has(fallback.id)) {
          list.push(fallback);
        }
      });
    }

    return list;
  }, [userUploadedMoments, publicPhotos, destinations, attractions]);

  // Active Center Index State
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Initialize like counts
  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    momentsList.forEach(m => {
      initialCounts[m.id] = m.likesCount;
    });
    setLikeCountMap(initialCounts);
  }, [momentsList]);

  // Auto-open lightbox viewer if initialMomentId is provided in route
  useEffect(() => {
    if (initialMomentId && momentsList.length > 0) {
      const foundIdx = momentsList.findIndex(m => m.id === initialMomentId || m.locationSlug === initialMomentId);
      if (foundIdx !== -1) {
        setViewerInitialIndex(foundIdx);
      }
      setIsViewerOpen(true);
    }
  }, [initialMomentId, momentsList]);

  // Move carousel left or right
  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + momentsList.length) % momentsList.length);
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % momentsList.length);
    setProgress(0);
  };

  // Smooth Progress Bar & Auto-scroll Timer (Every 5 seconds)
  useEffect(() => {
    if (isHovered || isViewerOpen || momentsList.length === 0) return;

    const intervalMs = 50; // Update progress bar every 50ms
    const step = (intervalMs / 5000) * 100; // Reach 100% in 5000ms

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isHovered, isViewerOpen, momentsList.length, activeIndex]);

  // Toggle Like Handler
  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLikedMap(prev => {
      const current = !!prev[id];
      const next = !current;

      setLikeCountMap(counts => ({
        ...counts,
        [id]: (counts[id] || 0) + (next ? 1 : -1)
      }));

      return { ...prev, [id]: next };
    });
  };

  // Click card handler:
  // If side card -> smoothly move it into center
  // If active center card -> open Full-screen Traveller Moment Viewer
  const handleCardClick = (targetIndex: number, moment: MomentItem) => {
    console.log('[DEBUG TravellerMomentsSection] handleCardClick triggered:', { targetIndex, moment, isViewerOpen: true });
    setViewerInitialIndex(targetIndex);
    setIsViewerOpen(true);
    if (targetIndex !== activeIndex) {
      setActiveIndex(targetIndex);
      setProgress(0);
    }
  };

  // Location click handler based on location type
  const handleLocationClick = (moment: MomentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (moment.locationType === 'attraction') {
      navigate(`/attraction/${moment.locationSlug}`);
    } else {
      navigate(`#/destination/${moment.locationSlug}`);
    }
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) handleNext();
    else if (distance < -40) handlePrev();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Handle processing and converting selected image file
  const handlePhotoSelect = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, or HEIC).');
      return;
    }
    setUploadError(null);
    setIsProcessingPhoto(true);

    try {
      // Compress and convert file to WebP
      const webpBlob = await compressAndConvertToWebP(file, 1600, 1200, 0.82);
      const stagedUrl = URL.createObjectURL(webpBlob);
      setStagedPhotoUrl(stagedUrl);

      // Attempt remote upload to Firebase/storage
      try {
        const remoteUrl = await uploadImageToFirebase(webpBlob, `moment_${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.webp`);
        setUploadedRemoteUrl(remoteUrl);
      } catch (fbErr) {
        console.warn('Firebase upload fallback to Object URL:', fbErr);
        setUploadedRemoteUrl(stagedUrl);
      }
    } catch (err: any) {
      console.error('Photo optimization error:', err);
      setUploadError(err.message || 'Failed to process image file.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  // Handle publishing user moment
  const handlePublishMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalPhotoUrl = uploadedRemoteUrl || stagedPhotoUrl;
    if (!finalPhotoUrl) {
      setUploadError('Please upload or select a scenic photo.');
      return;
    }
    if (!uploaderName.trim()) {
      setUploadError('Please enter your traveler name.');
      return;
    }
    if (!selectedDestinationId) {
      setUploadError('Please select a destination for your photo (Required).');
      return;
    }
    if (!captionInput.trim()) {
      setUploadError('Please write a brief caption describing your moment.');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    // Resolve selected destination and optional attraction
    const selectedDest = destinations.find(d => d.id === selectedDestinationId);
    const selectedAttr = selectedAttractionId ? attractions.find(a => a.id === selectedAttractionId) : null;

    if (!selectedDest) {
      setUploadError('Please select a valid destination.');
      setIsSubmitting(false);
      return;
    }

    const targetDestId = selectedDest.id;
    const targetAttrId = selectedAttr ? selectedAttr.id : null;

    let locName = selectedDest.name;
    let locType: 'attraction' | 'destination' = 'destination';
    let locSlug = getItemSlug(selectedDest) || selectedDest.id;

    if (selectedAttr) {
      locName = `${selectedAttr.name}, ${selectedDest.name}`;
      locType = 'attraction';
      locSlug = getItemSlug(selectedAttr) || selectedAttr.id;
    }

    const newMomentId = `moment-${Date.now()}`;
    const newMomentItem: MomentItem = {
      id: newMomentId,
      url: finalPhotoUrl,
      caption: captionInput.trim(),
      travellerName: uploaderName.trim(),
      travellerId: user?.uid || `usr-${Date.now()}`,
      travellerAvatar: user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(uploaderName.trim())}`,
      locationName: locName,
      locationSlug: locSlug,
      locationType: locType,
      likesCount: 1,
      commentsCount: 0,
      viewsCount: 12,
      dateStr: 'Just now'
    };

    const newImageItem: ImageItem = {
      id: newMomentId,
      url: finalPhotoUrl,
      destinationId: targetDestId,
      attractionId: targetAttrId,
      uploadedBy: uploaderName.trim(),
      uploaderEmail: uploaderEmail.trim(),
      status: 'Approved',
      caption: captionInput.trim(),
      altText: `${locName} traveller moment`,
      uploadDate: new Date().toISOString(),
      userId: user?.uid || 'anonymous'
    };

    // Save to server database API if present
    try {
      const metaPayload = {
        id: newMomentId,
        destinationId: targetDestId,
        attractionId: targetAttrId,
        url: finalPhotoUrl,
        uploadedBy: uploaderName.trim(),
        uploaderEmail: uploaderEmail.trim(),
        status: 'Approved',
        caption: captionInput.trim(),
        altText: `${locName} traveller moment`,
        userId: user?.uid || 'anonymous'
      };

      await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload)
      }).catch(err => console.warn('Database save warning:', err));
    } catch (err) {
      console.warn('Backend image save bypassed:', err);
    }

    // Add to local state & notify parent
    setUserUploadedMoments(prev => [newMomentItem, ...prev]);
    if (onMomentUploaded) {
      onMomentUploaded(newImageItem);
    }

    // Reset carousel to newly uploaded item
    setActiveIndex(0);
    setProgress(0);

    setUploadSuccess(`🎉 Moment published successfully! Your photo of "${locName}" is live in Traveller Moments.`);
    setIsSubmitting(false);

    // Auto close modal after 1.2s
    setTimeout(() => {
      setIsUploadModalOpen(false);
      setStagedPhotoUrl(null);
      setUploadedRemoteUrl(null);
      setSelectedDestinationId('');
      setSelectedAttractionId('');
      setCaptionInput('');
      setUploadSuccess(null);
    }, 1200);
  };

  // Preload next two carousel images
  useEffect(() => {
    if (momentsList.length === 0) return;
    const next1 = momentsList[(activeIndex + 1) % momentsList.length];
    const next2 = momentsList[(activeIndex + 2) % momentsList.length];

    [next1, next2].forEach(item => {
      if (item?.url) {
        const img = new Image();
        img.src = item.url;
      }
    });
  }, [activeIndex, momentsList]);

  if (momentsList.length === 0) return null;

  // Offsets for 5-card Cover Flow layout: [-2, -1, 0, 1, 2]
  const offsets = [-2, -1, 0, 1, 2];

  return (
    <section className={`relative py-8 sm:py-12 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900 text-slate-100 overflow-hidden border-b border-white/10 ${className}`}>
      
      {/* Subtle ambient glow behind carousel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* SECTION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-400/10 border border-amber-400/30 text-amber-300 shadow-xs mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Community Gallery
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
            📸 Traveller Moments
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm md:text-base mt-1 max-w-2xl">
            Real journeys. Real memories. Captured across North Bengal & Sikkim.
          </p>
        </div>

        {/* Header Action Controls (Upload Button + Carousel Arrows) */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-end shrink-0">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer hover:scale-103 active:scale-97 border border-amber-300/60"
          >
            <Camera className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Upload Your Moment</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2.5 rounded-2xl bg-slate-800/80 border border-white/15 hover:border-amber-400/70 text-slate-300 hover:text-amber-300 transition-all cursor-pointer hover:bg-slate-800 shadow-lg"
              aria-label="Previous moment"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2.5 rounded-2xl bg-slate-800/80 border border-white/15 hover:border-amber-400/70 text-slate-300 hover:text-amber-300 transition-all cursor-pointer hover:bg-slate-800 shadow-lg"
              aria-label="Next moment"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* APPLE COVER FLOW CAROUSEL CONTAINER */}
      <div 
        className="relative max-w-7xl mx-auto px-2 sm:px-6 py-2 z-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Flex container with bottom baseline alignment (items-end) */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 h-[400px] sm:h-[430px] md:h-[450px] overflow-visible">
          {offsets.map((offset) => {
            const itemIndex = (activeIndex + offset + momentsList.length) % momentsList.length;
            const moment = momentsList[itemIndex];
            const isCenter = offset === 0;
            const isLiked = !!likedMap[moment.id];
            const currentLikes = likeCountMap[moment.id] || moment.likesCount;

            // Cover Flow Specs based on offset
            let scaleClass = 'scale-[0.88] opacity-60 rotate-[-4deg] hidden lg:block z-10'; // Outer preview (-2)
            if (offset === -1) {
              scaleClass = 'scale-[0.92] sm:scale-[0.95] opacity-80 sm:opacity-90 rotate-[-2deg] block z-20'; // Left (-1)
            } else if (offset === 0) {
              scaleClass = 'scale-[1.04] sm:scale-[1.08] opacity-100 rotate-0 z-30 shadow-2xl shadow-amber-500/20 border-amber-400/80 ring-2 ring-amber-400/30'; // Center (0)
            } else if (offset === 1) {
              scaleClass = 'scale-[0.92] sm:scale-[0.95] opacity-80 sm:opacity-90 rotate-[2deg] block z-20'; // Right (+1)
            } else if (offset === 2) {
              scaleClass = 'scale-[0.88] opacity-60 rotate-[4deg] hidden lg:block z-10'; // Outer preview (+2)
            }

            return (
              <div
                key={`${moment.id}-${offset}`}
                onClick={() => handleCardClick(itemIndex, moment)}
                style={{
                  transitionProperty: 'all',
                  transitionDuration: '600ms',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  transformOrigin: 'bottom center'
                }}
                className={`relative shrink-0 w-[240px] sm:w-[280px] md:w-[320px] h-[360px] sm:h-[390px] md:h-[410px] rounded-[22px] overflow-hidden cursor-pointer select-none bg-slate-900 border ${
                  isCenter ? 'border-amber-400/80' : 'border-white/15 hover:border-amber-400/40'
                } ${scaleClass}`}
              >
                {/* PHOTO CONTAINER (Occupies ~85% height of card) */}
                <div className="relative h-[85%] w-full bg-slate-850 overflow-hidden">
                  <ProgressiveImage
                    src={moment.url}
                    alt={moment.caption}
                    itemName={moment.locationName || moment.caption}
                    targetWidth={400}
                    isPriority={isCenter}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105 filter brightness-[1.02] contrast-[1.02]"
                  />

                  {/* Soft bottom gradient overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80 pointer-events-none" />

                  {/* TOP LEFT: Traveller Name */}
                  <div className="absolute top-2.5 left-2.5 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`#/traveler/${moment.travellerId}`);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 hover:border-amber-400/60 text-slate-100 hover:text-amber-300 text-[11px] font-semibold transition-all hover:scale-105 cursor-pointer shadow-md"
                    >
                      <img
                        src={moment.travellerAvatar}
                        alt={moment.travellerName}
                        className="w-4 h-4 rounded-full object-cover border border-amber-400/60 shrink-0"
                      />
                      <span className="truncate max-w-[100px]">{moment.travellerName}</span>
                    </button>
                  </div>

                  {/* TOP RIGHT: Favourite Button */}
                  <div className="absolute top-2.5 right-2.5 z-20">
                    <button
                      type="button"
                      onClick={(e) => toggleLike(moment.id, e)}
                      className={`p-1.5 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-md hover:scale-110 ${
                        isLiked 
                          ? 'bg-rose-500/30 border-rose-400 text-rose-400' 
                          : 'bg-slate-900/80 border-white/15 text-slate-300 hover:text-rose-400 hover:border-rose-400/50'
                      }`}
                      title={isLiked ? 'Unlike photo' : 'Favorite photo'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* BOTTOM OVERLAY: 📍 SINGLE LOCATION NAME ONLY (Destination or Attraction) */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20">
                    <button
                      type="button"
                      onClick={(e) => handleLocationClick(moment, e)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/85 hover:bg-slate-900 border border-white/20 hover:border-amber-400 text-white hover:text-amber-300 font-display font-extrabold text-xs shadow-md transition-all cursor-pointer backdrop-blur-md hover:scale-102"
                      title={`Open ${moment.locationType} details for ${moment.locationName}`}
                    >
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate max-w-[180px] sm:max-w-[220px]">{moment.locationName}</span>
                    </button>
                  </div>

                </div>

                {/* BOTTOM ENGAGEMENT ROW (~15% height: Likes, Comments, Views) */}
                <div className="h-[15%] w-full bg-slate-900 border-t border-white/10 px-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-rose-300 font-medium">
                      <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-400 text-rose-400' : 'text-rose-400'}`} />
                      <span>{currentLikes}</span>
                    </span>
                    <span className="flex items-center gap-1 text-sky-300">
                      <MessageSquare className="w-3 h-3 text-sky-400" />
                      <span>{moment.commentsCount}</span>
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>{moment.viewsCount}</span>
                  </span>
                </div>

              </div>
            );
          })}
        </div>

        {/* THIN ANIMATED PROGRESS BAR INDICATOR */}
        <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-2">
          <div className="w-48 sm:w-64 h-1 bg-slate-800/80 rounded-full overflow-hidden relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-75 ease-linear shadow-xs shadow-amber-400/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-wider">
            {activeIndex + 1} / {momentsList.length}
          </span>
        </div>
      </div>

      {/* IMMERSIVE FULL-SCREEN TRAVELLER MOMENT VIEWER */}
      <TravellerMomentViewer
        moments={momentsList}
        initialIndex={viewerInitialIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        navigate={navigate}
        onLikeToggle={(id) => toggleLike(id)}
      />

      {/* UPLOAD TRAVELLER MOMENT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-black text-white">
                    Share Your Traveller Moment
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload scenic moments captured across North Bengal & Sikkim.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handlePublishMoment} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              {/* Alert / Error / Success Messages */}
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* 1. PHOTO UPLOADER & PREVIEW AREA */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Scenic Mountain Photo *
                </label>

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoSelect(file);
                  }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoSelect(file);
                  }}
                />

                {stagedPhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-amber-400/50 bg-slate-950 p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img
                        src={stagedPhotoUrl}
                        alt="Staged Preview"
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-white/20 shadow-md shrink-0"
                      />
                      <div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30 mb-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>WebP Optimized</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate max-w-[180px]">
                          Photo Ready for Publish
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          High-resolution Himalayan capture
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setStagedPhotoUrl(null);
                        setUploadedRemoteUrl(null);
                      }}
                      className="w-full sm:w-auto px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/15 hover:border-amber-400/60 rounded-2xl p-6 bg-slate-950/60 transition text-center space-y-3">
                    {isProcessingPhoto ? (
                      <div className="py-4 space-y-2 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                        <p className="text-xs font-extrabold text-amber-300">
                          Compressing & Optimizing WebP Photo...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Select scenic photo from device or capture with camera
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Supports JPG, PNG, WEBP (Auto-optimized for smooth viewing)
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-bold text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>Browse Gallery</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-xs font-bold text-amber-300 transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span>Take Photo</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 2. TRAVELER COORDINATES (NAME & EMAIL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pasang Tamang"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. pasang@gmail.com"
                    value={uploaderEmail}
                    onChange={(e) => setUploaderEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* 3. COMPULSORY DESTINATION & OPTIONAL ATTRACTION SELECTORS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* COMPULSORY DESTINATION SELECTOR */}
                <div>
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 block mb-1 flex items-center justify-between">
                    <span>Destination *</span>
                    <span className="text-[10px] text-amber-400 font-bold font-sans">Compulsory</span>
                  </label>
                  <select
                    required
                    value={selectedDestinationId}
                    onChange={handleDestinationChange}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition cursor-pointer"
                  >
                    <option value="">-- Select Destination (Required) --</option>
                    {destinations.map(d => (
                      <option key={`dest-opt-${d.id}`} value={d.id}>
                        📍 {d.name} {d.state ? `(${d.state})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* OPTIONAL ATTRACTION SELECTOR */}
                <div>
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center justify-between">
                    <span>Attraction / Sight</span>
                    <span className="text-[10px] text-slate-400 font-sans">Optional</span>
                  </label>
                  <select
                    value={selectedAttractionId}
                    onChange={(e) => setSelectedAttractionId(e.target.value)}
                    disabled={!selectedDestinationId}
                    className={`w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition cursor-pointer ${
                      !selectedDestinationId ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">
                      {!selectedDestinationId
                        ? '-- Select Destination First --'
                        : filteredAttractions.length === 0
                        ? '-- No specific sights listed --'
                        : '-- Select Attraction (Optional) --'}
                    </option>
                    {filteredAttractions.map(a => (
                      <option key={`attr-opt-${a.id}`} value={a.id}>
                        🏔️ {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. CAPTION & STORY */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Caption / Moment Story *
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {captionInput.length}/180
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  maxLength={180}
                  placeholder="e.g. Golden morning light breaking over Tiger Hill as Mt. Kanchenjunga wakes up in pure splendour..."
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition resize-none"
                />
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isProcessingPhoto || !stagedPhotoUrl}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-lg ${
                    isSubmitting || isProcessingPhoto || !stagedPhotoUrl
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                      : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:scale-102 active:scale-98'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Traveller Moment</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </section>
  );
};

export default TravellerMomentsSection;
