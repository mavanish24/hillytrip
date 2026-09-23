import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Compass, 
  User, 
  Eye, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Check, 
  Send, 
  Maximize2, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';

export interface MomentComment {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  date: string;
}

export interface MomentItem {
  id: string;
  url: string;
  caption: string;
  travellerName: string;
  travellerId: string;
  travellerAvatar?: string;
  locationName: string;
  locationSlug: string;
  locationType: 'attraction' | 'destination';
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  dateStr: string;
  isLiked?: boolean;
  isSaved?: boolean;
  comments?: MomentComment[];
}

export interface TravellerMomentViewerProps {
  moments: MomentItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  navigate?: (path: string) => void;
  onLikeToggle?: (momentId: string) => void;
  onSaveToggle?: (momentId: string) => void;
}

const DEFAULT_FALLBACK_IMAGE = 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png';

const safeSrc = (url?: string, fallback: string = DEFAULT_FALLBACK_IMAGE) => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }
  return `/${url}`;
};

export const TravellerMomentViewer: React.FC<TravellerMomentViewerProps> = ({
  moments,
  initialIndex = 0,
  isOpen,
  onClose,
  navigate = () => {},
  onLikeToggle,
  onSaveToggle
}) => {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isImmersive, setIsImmersive] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Local interaction states
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, MomentComment[]>>({});
  const [newCommentText, setNewCommentText] = useState('');

  // UI Panels
  const [showCommentsTray, setShowCommentsTray] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Synchronize index synchronously during render when modal opens or initialIndex changes
  if (isOpen !== prevIsOpen || (isOpen && initialIndex !== prevInitialIndex)) {
    setPrevIsOpen(isOpen);
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setIsImmersive(false);
    setShowCommentsTray(false);
    setShowMoreMenu(false);
    setImageLoading(true);
  }

  // Gesture refs
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDistStart = useRef<number | null>(null);
  const imgContainerRef = useRef<HTMLDivElement | null>(null);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Initialize liked, saved, comments maps
  useEffect(() => {
    if (!moments || moments.length === 0) return;
    const lMap: Record<string, boolean> = {};
    const sMap: Record<string, boolean> = {};
    const cCountMap: Record<string, number> = {};
    const comMap: Record<string, MomentComment[]> = {};

    moments.forEach(m => {
      lMap[m.id] = !!m.isLiked;
      sMap[m.id] = !!m.isSaved;
      cCountMap[m.id] = m.likesCount;
      comMap[m.id] = m.comments || [
        {
          id: `c-1-${m.id}`,
          user: 'Sonam Norbu',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Priya',
          text: 'Absolute heaven! The lighting here is otherworldly.',
          date: '1d ago'
        },
        {
          id: `c-2-${m.id}`,
          user: 'Ananya Sen',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rohan',
          text: 'What camera settings did you use for this shot?',
          date: '5h ago'
        }
      ];
    });

    setLikedMap(prev => ({ ...lMap, ...prev }));
    setSavedMap(prev => ({ ...sMap, ...prev }));
    setLikeCountMap(prev => ({ ...cCountMap, ...prev }));
    setCommentsMap(prev => ({ ...comMap, ...prev }));
  }, [moments]);

  const currentMoment = useMemo(() => {
    if (!moments || moments.length === 0) return null;
    return moments[(currentIndex + moments.length) % moments.length];
  }, [moments, currentIndex]);

  // Preload adjacent images
  useEffect(() => {
    if (!moments || moments.length === 0) return;
    const prevIdx = (currentIndex - 1 + moments.length) % moments.length;
    const nextIdx = (currentIndex + 1) % moments.length;

    [moments[prevIdx], moments[nextIdx]].forEach(m => {
      if (m?.url) {
        const img = new Image();
        img.src = safeSrc(m.url);
      }
    });
  }, [currentIndex, moments]);

  // Toast feedback helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (!moments || moments.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + moments.length) % moments.length);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setImageLoading(true);
  }, [moments]);

  const handleNext = useCallback(() => {
    if (!moments || moments.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % moments.length);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setImageLoading(true);
  }, [moments]);

  // Like Toggle
  const toggleLike = useCallback((momentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLikedMap(prev => {
      const isCurrentlyLiked = !!prev[momentId];
      const nextLikedState = !isCurrentlyLiked;
      
      setLikeCountMap(counts => ({
        ...counts,
        [momentId]: (counts[momentId] || 0) + (nextLikedState ? 1 : -1)
      }));

      if (onLikeToggle) onLikeToggle(momentId);
      showToast(nextLikedState ? 'Added to Liked Moments ❤️' : 'Removed from Liked Moments');
      return { ...prev, [momentId]: nextLikedState };
    });
  }, [onLikeToggle, showToast]);

  // Save / Bookmark Toggle
  const toggleSave = useCallback((momentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedMap(prev => {
      const isCurrentlySaved = !!prev[momentId];
      const nextSaveState = !isCurrentlySaved;

      if (onSaveToggle) onSaveToggle(momentId);
      showToast(nextSaveState ? 'Saved to your collection 🔖' : 'Removed from saved collection');
      return { ...prev, [momentId]: nextSaveState };
    });
  }, [onSaveToggle, showToast]);

  // Share action
  const handleShare = useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentMoment) return;
    
    const shareUrl = window.location.origin + window.location.pathname + `#/moment/${currentMoment.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Traveller Moment at ${currentMoment.locationName}`,
          text: currentMoment.caption,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Photo link copied to clipboard! 🔗');
    } catch (err) {
      showToast('Link copied!');
    }
  }, [currentMoment, showToast]);

  // Add Comment Handler
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentMoment) return;

    const newComment: MomentComment = {
      id: `c-${Date.now()}`,
      user: 'You (Explorer)',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Traveller',
      text: newCommentText.trim(),
      date: 'Just now'
    };

    setCommentsMap(prev => ({
      ...prev,
      [currentMoment.id]: [newComment, ...(prev[currentMoment.id] || [])]
    }));

    setNewCommentText('');
    showToast('Comment posted! 💬');
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept typing in input fields
      }

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'f':
        case 'F':
        case 'i':
        case 'I':
          setIsImmersive(prev => !prev);
          break;
        case ' ':
          e.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Zoom / Wheel Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomScale(prev => {
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      const nextScale = Math.min(Math.max(prev + delta, 1), 4);
      if (nextScale === 1) {
        setPanOffset({ x: 0, y: 0 });
      } else {
        setIsImmersive(true); // Hide UI automatically when zooming in
      }
      return nextScale;
    });
  };

  // Double Click / Tap Zoom
  const handleDoubleTapZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(prev => {
      if (prev > 1) {
        setPanOffset({ x: 0, y: 0 });
        return 1;
      } else {
        setIsImmersive(true); // Hide UI on zoom
        return 2.4;
      }
    });
  };

  // Single vs Double Click Handler on Image
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      handleDoubleTapZoom(e);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        setIsImmersive(prev => !prev);
      }, 250);
    }
  };

  // Mouse Drag Panning (when zoomed)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Swipe & Pinch Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchDistStart.current = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      if (zoomScale > 1) {
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistStart.current) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const factor = currentDist / touchDistStart.current;

      setZoomScale(prev => {
        const nextScale = Math.min(Math.max(prev * factor, 1), 4);
        if (nextScale > 1) setIsImmersive(true);
        return nextScale;
      });
      touchDistStart.current = currentDist;
    } else if (e.touches.length === 1 && isDragging && zoomScale > 1) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && zoomScale === 1 && e.changedTouches.length > 0) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = touchStartX.current - endX;
      const diffY = (touchStartY.current || 0) - endY;

      // Ensure horizontal swipe
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX > 0) handleNext();
        else handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchDistStart.current = null;
    setIsDragging(false);
  };

  // Related photos computations
  const relatedDestinationPhotos = useMemo(() => {
    if (!currentMoment || !moments) return [];
    return moments.filter(m => m.locationSlug === currentMoment.locationSlug && m.id !== currentMoment.id);
  }, [currentMoment, moments]);

  const relatedTravellerPhotos = useMemo(() => {
    if (!currentMoment || !moments) return [];
    return moments.filter(m => m.travellerId === currentMoment.travellerId && m.id !== currentMoment.id);
  }, [currentMoment, moments]);

  const otherPopularMoments = useMemo(() => {
    if (!currentMoment || !moments) return [];
    return moments.filter(m => m.id !== currentMoment.id).slice(0, 6);
  }, [currentMoment, moments]);

  if (!isOpen || !currentMoment || typeof document === 'undefined') {
    if (isOpen) {
      console.warn('[DEBUG TravellerMomentViewer] isOpen is true BUT currentMoment is null!', { momentsCount: moments?.length, currentIndex });
    }
    return null;
  }

  console.log('[DEBUG TravellerMomentViewer] Render lifecycle:', {
    modalOpen: isOpen,
    initialIndex,
    currentIndex,
    selectedPhoto: currentMoment,
    imageUrl: currentMoment?.url ? safeSrc(currentMoment.url) : null,
    imageLoaded: !imageLoading
  });

  const isLiked = !!likedMap[currentMoment.id];
  const isSaved = !!savedMap[currentMoment.id];
  const currentLikes = likeCountMap[currentMoment.id] || currentMoment.likesCount;
  const currentComments = commentsMap[currentMoment.id] || [];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[999999] bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between overflow-hidden text-white select-none font-sans"
      >
        {/* TOAST NOTIFICATION OVERLAY */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-[100000] px-4 py-2.5 rounded-full bg-slate-900/90 border border-amber-400/40 text-amber-300 font-medium text-xs sm:text-sm shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------------- */}
        {/* TOP BAR OVERLAY */}
        {/* ------------------------------------------------------------- */}
        <div 
          className={`absolute top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between transition-all duration-300 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent ${
            isImmersive ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Top Left: Close Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/70 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white transition-all cursor-pointer backdrop-blur-md text-xs sm:text-sm font-medium shadow-lg hover:scale-105 active:scale-95"
              title="Close full-screen viewer (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span className="hidden sm:inline font-semibold">Close</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-slate-400 ml-1">Esc</kbd>
            </button>

            {/* Immersive Mode Hint Toggle */}
            <button
              type="button"
              onClick={() => setIsImmersive(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 transition-all cursor-pointer backdrop-blur-md text-xs font-medium"
              title="Hide controls for distraction-free viewing (Click photo)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Immersive View</span>
            </button>
          </div>

          {/* Top Center: Counter Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 text-xs font-mono text-slate-300 backdrop-blur-md">
            <span className="text-amber-400 font-bold">{currentIndex + 1}</span>
            <span>/</span>
            <span>{moments.length}</span>
          </div>

          {/* Top Right: Actions (Like, Comment, Share, Save, Options) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Like */}
            <button
              type="button"
              onClick={(e) => toggleLike(currentMoment.id, e)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 ${
                isLiked 
                  ? 'bg-rose-500/25 border-rose-400 text-rose-400' 
                  : 'bg-slate-900/70 border-white/15 text-slate-300 hover:text-rose-400 hover:border-rose-400/50'
              }`}
              title={isLiked ? 'Unlike photo' : 'Like photo'}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Comment */}
            <button
              type="button"
              onClick={() => setShowCommentsTray(prev => !prev)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 ${
                showCommentsTray
                  ? 'bg-sky-500/25 border-sky-400 text-sky-400'
                  : 'bg-slate-900/70 border-white/15 text-slate-300 hover:text-sky-400 hover:border-sky-400/50'
              }`}
              title="View comments"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Bookmark / Save */}
            <button
              type="button"
              onClick={(e) => toggleSave(currentMoment.id, e)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 ${
                isSaved 
                  ? 'bg-amber-400/25 border-amber-400 text-amber-300' 
                  : 'bg-slate-900/70 border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400/50'
              }`}
              title={isSaved ? 'Remove bookmark' : 'Save photo'}
            >
              <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={(e) => handleShare(e)}
              className="p-2.5 rounded-full bg-slate-900/70 border border-white/15 text-slate-300 hover:text-emerald-300 hover:border-emerald-400/50 transition-all cursor-pointer backdrop-blur-md shadow-lg hover:scale-110 active:scale-95"
              title="Share photo"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* More Menu Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(prev => !prev)}
                className="p-2.5 rounded-full bg-slate-900/70 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-lg hover:scale-105"
                title="More options"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-52 py-2 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl backdrop-blur-xl z-50 text-xs text-slate-200">
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      const a = document.createElement('a');
                      a.href = currentMoment.url;
                      a.download = `moment-${currentMoment.id}.jpg`;
                      a.target = '_blank';
                      a.click();
                      showToast('Downloading high-res image...');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download Original Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      setZoomScale(prev => (prev > 1 ? 1 : 2.5));
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>{zoomScale > 1 ? 'Reset Zoom (1x)' : 'Zoom In (2.5x)'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      handleShare();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>Copy Link to Moment</span>
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      showToast('Photo flagged for moderation team check.');
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-rose-400 flex items-center gap-2.5 cursor-pointer"
                  >
                    <span>Report Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DESKTOP NAVIGATION ARROWS */}
        {/* ------------------------------------------------------------- */}
        <div 
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 hidden sm:block ${
            isImmersive ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'
          }`}
        >
          <button
            type="button"
            onClick={handlePrev}
            className="p-3 sm:p-4 rounded-full bg-slate-900/70 hover:bg-slate-900 border border-white/15 text-slate-200 hover:text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
            title="Previous moment (← Arrow Left)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        <div 
          className={`absolute right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 hidden sm:block ${
            isImmersive ? 'opacity-0 pointer-events-none translate-x-4' : 'opacity-100 translate-x-0'
          }`}
        >
          <button
            type="button"
            onClick={handleNext}
            className="p-3 sm:p-4 rounded-full bg-slate-900/70 hover:bg-slate-900 border border-white/15 text-slate-200 hover:text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
            title="Next moment (→ Arrow Right)"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CENTER STAGE IMAGE VIEWER */}
        {/* ------------------------------------------------------------- */}
        <div 
          ref={imgContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative flex-1 min-h-0 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          {/* Subtle loading spinner while high-res loads */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            </div>
          )}

          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentMoment.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              style={{
                transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
                transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <img
                src={safeSrc(currentMoment.url)}
                alt={currentMoment.caption || 'Traveller Moment'}
                onLoad={() => {
                  console.log('[DEBUG TravellerMomentViewer] Image loaded successfully:', currentMoment.url);
                  setImageLoading(false);
                }}
                onError={(err) => {
                  console.error('[DEBUG TravellerMomentViewer] Image failed to load:', currentMoment.url, err);
                  setImageLoading(false);
                }}
                ref={(imgEl) => {
                  if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
                    setImageLoading(false);
                  }
                }}
                referrerPolicy="no-referrer"
                className="max-h-[82vh] sm:max-h-[85vh] w-auto max-w-[92vw] sm:max-w-[88vw] object-contain rounded-xl sm:rounded-2xl shadow-2xl shadow-black/80 ring-1 ring-white/10 filter brightness-[1.02]"
              />
            </motion.div>
          </AnimatePresence>

          {/* IMMERSIVE MODE HUD INDICATOR (Restores UI on tap) */}
          {isImmersive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-950/80 border border-white/20 text-slate-300 text-xs font-mono backdrop-blur-md pointer-events-none shadow-xl flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Immersive Mode — Single click to restore UI</span>
            </motion.div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM INFORMATION PANEL & RELATED CONTENT */}
        {/* ------------------------------------------------------------- */}
        <div 
          className={`relative z-40 transition-all duration-300 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent border-t border-white/10 ${
            isImmersive ? 'opacity-0 pointer-events-none translate-y-8' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Main Info Card Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
            
            {/* TOP METADATA ROW */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
              
              {/* Left: Photographer Avatar, Name & Date */}
              <div className="flex items-center gap-3">
                <img
                  src={currentMoment.travellerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentMoment.travellerName)}`}
                  alt={currentMoment.travellerName}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400/80 shrink-0 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`#/traveler/${currentMoment.travellerId}`);
                      }}
                      className="font-display font-extrabold text-white hover:text-amber-300 text-sm sm:text-base transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{currentMoment.travellerName}</span>
                      <User className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold uppercase">
                      Pro Explorer
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                    <span>Captured {currentMoment.dateStr}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Eye className="w-3 h-3 text-slate-400" /> {(currentMoment.viewsCount || 0).toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Primary Location CTA Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {/* Location Badge CTA */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (currentMoment.locationType === 'attraction') {
                      navigate(`/attraction/${currentMoment.locationSlug}`);
                    } else {
                      navigate(`#/destination/${currentMoment.locationSlug}`);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-400/40 text-amber-300 font-display font-extrabold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-md hover:scale-102 transition-all shrink-0"
                >
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate max-w-[180px]">{currentMoment.locationName}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`#/attractions`);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-md shrink-0"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Open Attraction</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`#/traveler/${currentMoment.travellerId}`);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer backdrop-blur-md shrink-0"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Photographer Profile</span>
                </button>
              </div>

            </div>

            {/* CAPTION ROW */}
            <div className="py-2.5 flex items-start justify-between gap-4">
              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-4xl italic">
                "{currentMoment.caption}"
              </p>

              {/* Collapsible Mobile Sheet Toggle */}
              <button
                type="button"
                onClick={() => setIsBottomSheetExpanded(prev => !prev)}
                className="md:hidden p-1.5 rounded-lg bg-slate-900 border border-white/15 text-slate-300 shrink-0"
              >
                {isBottomSheetExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RELATED CONTENT HORIZONTAL THUMBNAIL CAROUSELS */}
            {/* ------------------------------------------------------------- */}
            <div className={`pt-2 transition-all duration-300 ${isBottomSheetExpanded ? 'block' : 'hidden md:block'}`}>
              <div className="space-y-3">
                
                {/* 1. More Photos from this Destination */}
                {relatedDestinationPhotos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        More photos from {currentMoment.locationName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
                      {relatedDestinationPhotos.map((item) => (
                        <button
                          key={`rel-dest-${item.id}`}
                          onClick={() => {
                            const idx = moments.findIndex(m => m.id === item.id);
                            if (idx !== -1) {
                              setCurrentIndex(idx);
                              setZoomScale(1);
                              setPanOffset({ x: 0, y: 0 });
                            }
                          }}
                          className="relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border border-white/15 hover:border-amber-400 transition-all cursor-pointer group shadow-md"
                        >
                          <img
                            src={safeSrc(item.url)}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. More Photos by this Traveller */}
                {relatedTravellerPhotos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                        <User className="w-3 h-3 text-sky-400" />
                        More photos by {currentMoment.travellerName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
                      {relatedTravellerPhotos.map((item) => (
                        <button
                          key={`rel-user-${item.id}`}
                          onClick={() => {
                            const idx = moments.findIndex(m => m.id === item.id);
                            if (idx !== -1) {
                              setCurrentIndex(idx);
                              setZoomScale(1);
                              setPanOffset({ x: 0, y: 0 });
                            }
                          }}
                          className="relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border border-white/15 hover:border-sky-400 transition-all cursor-pointer group shadow-md"
                        >
                          <img
                            src={safeSrc(item.url)}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Discover Popular Moments */}
                {relatedDestinationPhotos.length === 0 && relatedTravellerPhotos.length === 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3 h-3 text-amber-400" />
                        Explore More Traveller Moments
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
                      {otherPopularMoments.map((item) => (
                        <button
                          key={`rel-pop-${item.id}`}
                          onClick={() => {
                            const idx = moments.findIndex(m => m.id === item.id);
                            if (idx !== -1) {
                              setCurrentIndex(idx);
                              setZoomScale(1);
                              setPanOffset({ x: 0, y: 0 });
                            }
                          }}
                          className="relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border border-white/15 hover:border-amber-400 transition-all cursor-pointer group shadow-md"
                        >
                          <img
                            src={safeSrc(item.url)}
                            alt={item.caption}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* COMMENTS TRAY OVERLAY */}
        {/* ------------------------------------------------------------- */}
        <AnimatePresence>
          {showCommentsTray && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-slate-900 border-l border-white/15 z-[100000] shadow-2xl flex flex-col justify-between backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-sky-400" />
                  <h3 className="font-display font-bold text-base text-white">
                    Comments ({currentComments.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCommentsTray(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comment List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentComments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  currentComments.map(c => (
                    <div key={c.id} className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-3">
                      <img
                        src={c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.user)}`}
                        alt={c.user}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/20"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white truncate">{c.user}</span>
                          <span className="text-[10px] font-mono text-slate-500">{c.date}</span>
                        </div>
                        <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="p-4 border-t border-white/10 bg-slate-950/80">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="p-2.5 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 cursor-pointer font-bold transition-all shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default TravellerMomentViewer;
