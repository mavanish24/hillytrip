import React, { useState, useRef, useEffect } from 'react';
import { WiDaySunny, WiRain, WiSnow } from 'weather-icons-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Compass, 
  Camera, 
  Home, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Calendar, 
  Users, 
  Clock, 
  Wallet, 
  CheckSquare, 
  Plus, 
  Phone, 
  MessageCircle, 
  Map, 
  Navigation, 
  ChevronUp, 
  ChevronDown, 
  Star, 
  User, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  ExternalLink,
  Sparkles,
  Award,
  Shield,
  Zap,
  Check,
  Car,
  Send,
  CornerDownRight,
  X,
  UploadCloud
} from 'lucide-react';
import { Attraction, Destination, Homestay, Driver, ImageItem, Route } from '../types';
import { getItemSlug } from '../utils/slug';
import { db, doc, setDoc } from '../utils/firebase';
import ImageGallerySystem from './ImageGallerySystem';
import { compressAndConvertToWebP } from '../utils/imageOptimizer';
import { uploadImageToFirebase } from '../utils/firebase';
import { hillyTripFetch } from '../utils/apiInterceptor';
import { UniversalCarousel } from './UniversalCarousel';
import { 
  WeatherAnimationsStyle, SunraysAnimation, RainAnimation, SnowAnimation, 
  FogAnimation, NightAnimation, ThunderstormAnimation, CloudsAnimation, 
  getHubCoords, mapWMOCodeToTheme, weatherConfigs 
} from './WeatherEngine';

interface AttractionDetailPageProps {
  activeAttrDetail: {
    attraction: Attraction;
    destination: Destination | null;
    routes: Route[];
  };
  user: any;
  isAdmin: boolean;
  likes: any[];
  toggleLike: (id: string, type: string) => void;
  savedPlaces: string[];
  handleToggleSave: (id: string, type: string) => void;
  isItemSaved: (id: string) => boolean;
  navigate: (path: string) => void;
  toSlug: (str: string) => string;
  safeSrc: (src: string) => string;
  calculateDistanceInKm: (lat1?: number, lon1?: number, lat2?: number, lon2?: number) => number | null;
  activePhotos: ImageItem[];
  setActivePhotos: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  comments: any[];
  addCommentAction: (content: string, rating: number, tips?: string) => Promise<void>;
  deleteCommentAction: (id: string) => Promise<void>;
  onAddPhotoComment?: (contentId: string, contentType: 'destination' | 'attraction' | 'photo', text: string) => Promise<void>;
  onDeletePhotoComment?: (commentId: string) => Promise<void>;
  handleUserLogin: () => void;
  submittingAttrLead: boolean;
  setSubmittingAttrLead: (val: boolean) => void;
  attrLeadSuccess: boolean;
  setAttrLeadSuccess: (val: boolean) => void;
  handleAttractionLeadSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  drivers: Driver[];
  setNotification: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  executeProtectedAction?: (actionName: string, actionCallback: () => void, requiresVerification?: boolean) => void;
}

export default function AttractionDetailPage(props: AttractionDetailPageProps) {
  const activeAttrDetail = props.activeAttrDetail;
  const attraction = activeAttrDetail?.attraction || ((activeAttrDetail as any)?.id ? activeAttrDetail : null) as any;

  if (!attraction) {
    return (
      <div className="text-center py-24 min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-500 font-semibold text-sm">Error: Attraction coordinates are missing or corrupted.</p>
        <button onClick={() => props.navigate('#/attractions')} className="mt-4 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans cursor-pointer">
          Back to Attractions board
        </button>
      </div>
    );
  }

  return <AttractionDetailPageInner {...props} />;
}

function AttractionDetailPageInner({
  activeAttrDetail,
  user,
  isAdmin,
  likes = [],
  toggleLike,
  savedPlaces = [],
  handleToggleSave,
  isItemSaved,
  navigate,
  toSlug,
  safeSrc,
  calculateDistanceInKm,
  activePhotos = [],
  setActivePhotos,
  comments = [],
  addCommentAction,
  deleteCommentAction,
  onAddPhotoComment,
  onDeletePhotoComment,
  handleUserLogin,
  submittingAttrLead,
  setSubmittingAttrLead,
  attrLeadSuccess,
  setAttrLeadSuccess,
  handleAttractionLeadSubmit,
  destinations = [],
  attractions = [],
  homestays = [],
  drivers = [],
  setNotification,
  executeProtectedAction
}: AttractionDetailPageProps) {
  const handleContactAction = (e: React.MouseEvent, type: 'WhatsApp' | 'Call', targetUrl: string) => {
    e.preventDefault();
    if (executeProtectedAction) {
      executeProtectedAction(`contact operator via ${type}`, () => {
        window.open(targetUrl, '_blank');
      }, false);
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  // Support both nested structure { attraction, destination, routes } and raw legacy Attraction structure
  const attraction = activeAttrDetail?.attraction || ((activeAttrDetail as any)?.id ? activeAttrDetail : null) as any;
  const destination = activeAttrDetail?.destination || null;
  const routes = activeAttrDetail?.routes || [];
  
  // Local States
  const [weatherTheme, setWeatherTheme] = useState<string>('sunny');
  const [weatherData, setWeatherData] = useState<{ temp: number; humidity: string; visibility: string } | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const attrId = attraction?.id || '';
    if (!attrId) return;

    const cacheKey = `hillytrip_attr_weather_cache_${attrId.toLowerCase()}`;

    const loadWeather = async () => {
      setIsLoadingWeather(true);
      try {
        let lat = attraction.latitude;
        let lon = attraction.longitude;
        
        if (!lat || !lon) {
          lat = destination?.latitude;
          lon = destination?.longitude;
        }

        if (!lat || !lon) {
          const coords = getHubCoords(attraction.nearestHubId || destination?.nearestHubId || 'NJP');
          lat = coords.lat;
          lon = coords.lon;
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        
        if (data && data.current) {
          const current = data.current;
          const temp = Math.round(current.temperature_2m);
          const humidity = `${current.relative_humidity_2m}%`;
          const rawVis = current.visibility;
          const visibility = rawVis ? (rawVis >= 1000 ? `${Math.round(rawVis / 1000)} km` : `${rawVis} m`) : "10 km";
          const code = current.weather_code;
          const windSpeed = current.wind_speed_10m || 10;
          const currentHour = new Date().getHours();
          const theme = mapWMOCodeToTheme(code, windSpeed, currentHour);

          const updatedData = { temp, humidity, visibility };

          if (active) {
            setWeatherData(updatedData);
            setWeatherTheme(theme);
            localStorage.setItem(cacheKey, JSON.stringify({ data: updatedData, theme, timestamp: Date.now() }));
          }
        }
      } catch (err) {
        console.error("Attraction live weather fetch failed, attempting cache...", err);
        try {
          const cachedString = localStorage.getItem(cacheKey);
          if (cachedString) {
            const { data: cachedData, theme } = JSON.parse(cachedString);
            if (active && cachedData) {
              setWeatherData(cachedData);
              setWeatherTheme(theme || 'sunny');
              return;
            }
          }
        } catch (e) {}

        // Fallback standard weather
        if (active) {
          setWeatherData({ temp: 15, humidity: "60%", visibility: "10 km" });
          setWeatherTheme('sunny');
        }
      } finally {
        if (active) setIsLoadingWeather(false);
      }
    };

    loadWeather();
  }, [attraction?.id, destination?.id]);

  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(true);

  // Expanded/interactive custom states
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'liked' | 'latest' | 'popular'>('liked');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadSuccessMessage, setPhotoUploadSuccessMessage] = useState('');
  const [photoUploadError, setPhotoUploadError] = useState('');
  const [selectedPhotoForViewer, setSelectedPhotoForViewer] = useState<any | null>(null);
  const [localPhotoCommentText, setLocalPhotoCommentText] = useState('');
  const [showAllDriversModal, setShowAllDriversModal] = useState(false);
  const [showAllStaysModal, setShowAllStaysModal] = useState(false);

  // Comments System Local States
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [commentId: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState<{ [commentId: string]: boolean }>({});

  // Reviews System Local States
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewVisitDate, setReviewVisitDate] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Separation of comments and reviews
  const attractionItems = (comments || []).filter(c => c && c.contentId === attraction.id && c.contentType === 'attraction');
  const attractionComments = attractionItems.filter(c => c && (c.type === 'comment' || (!c.type && !c.rating)));
  const attractionReviews = attractionItems.filter(c => c && (c.type === 'review' || (!c.type && c.rating)));

  // Review statistics
  const reviewCount = attractionReviews.length;
  const avgRating = reviewCount > 0 
    ? (attractionReviews.reduce((sum, r) => sum + (r?.rating || 5), 0) / reviewCount).toFixed(1)
    : '0.0';

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleUserLogin();
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newComment = {
        id: commentId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Registered Traveler',
        contentId: attraction.id,
        contentType: 'attraction' as const,
        text: commentText.trim(),
        type: 'comment',
        replies: [],
        timestamp: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'comments', commentId), newComment);
      setCommentText('');
      setNotification({
        type: 'success',
        message: '💬 Your comment has been posted to the discussion forum successfully!'
      });
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Could not post comment. Please try again.'
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    if (!user) {
      handleUserLogin();
      return;
    }
    const txt = replyText[commentId] || '';
    if (!txt.trim()) return;

    setSubmittingReply(prev => ({ ...prev, [commentId]: true }));
    try {
      const commentToUpdate = comments.find(c => c.id === commentId);
      if (!commentToUpdate) throw new Error('Comment not found');

      const replyObj = {
        id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        userName: user.displayName || user.email || 'Registered Traveler',
        content: txt.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedReplies = [...(commentToUpdate.replies || []), replyObj];
      await setDoc(doc(db, 'comments', commentId), {
        ...commentToUpdate,
        replies: updatedReplies
      });

      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      setActiveReplyBox(null);
      setNotification({
        type: 'success',
        message: '💬 Your reply has been posted successfully!'
      });
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Could not post reply. Please try again.'
      });
    } finally {
      setSubmittingReply(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    try {
      const commentToUpdate = comments.find(c => c.id === commentId);
      if (!commentToUpdate) return;

      const updatedReplies = (commentToUpdate.replies || []).filter((r: any) => r.id !== replyId);
      await setDoc(doc(db, 'comments', commentId), {
        ...commentToUpdate,
        replies: updatedReplies
      });

      setNotification({
        type: 'success',
        message: 'Reply deleted successfully.'
      });
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Could not delete reply.'
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleUserLogin();
      return;
    }
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newReview = {
        id: commentId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Registered Traveler',
        contentId: attraction.id,
        contentType: 'attraction' as const,
        text: reviewText.trim(),
        title: reviewTitle.trim() || 'Traveler Review',
        rating: reviewRating,
        visitDate: reviewVisitDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        type: 'review',
        timestamp: new Date().toISOString()
      };

      await setDoc(doc(db, 'comments', commentId), newReview);
      setReviewText('');
      setReviewTitle('');
      setReviewVisitDate('');
      setReviewRating(5);
      setNotification({
        type: 'success',
        message: '⭐ Your traveler review and rating have been posted successfully!'
      });
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Could not submit review. Please try again.'
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Swipe Carousel Refs
  const photosCarouselRef = useRef<HTMLDivElement>(null);
  const nearbyCarouselRef = useRef<HTMLDivElement>(null);
  const staysCarouselRef = useRef<HTMLDivElement>(null);
  const similarCarouselRef = useRef<HTMLDivElement>(null);

  // Dynamic Highlight generation helper
  const highlightsData = (() => {
    const cat = attraction.category?.toLowerCase() || '';
    if (cat.includes('monastery') || cat.includes('temple')) {
      return {
        whyVisit: `A center of deep spiritual devotion, rich cultural heritage, and breathtaking Himalayan architecture. Perfect for experiencing ancient Buddhist chanting ceremonies and peaceful self-contemplation.`,
        highlights: [
          "Traditional design adorned with rare handcrafted frescoes",
          "Calm chanting chambers perfect for quiet meditation",
          "Sweeping panoramic views overlooking pristine mountain valleys"
        ]
      };
    } else if (cat.includes('waterfall') || cat.includes('lake') || cat.includes('river')) {
      return {
        whyVisit: `Immerse yourself in nature's pure liquid marvels. Ideal for sound therapy, family picnics, and witnessing pristine mountain rainbows forming in the rising mist.`,
        highlights: [
          "Crystal-clear glacial streams feeding the local aquatic ecosystem",
          "Lush alpine green canopy providing shade and excellent birdwatching",
          "Refreshing crisp microclimate perfect for cooling off after transit"
        ]
      };
    } else if (cat.includes('viewpoint') || cat.includes('peak') || cat.includes('hill')) {
      return {
        whyVisit: `The absolute zenith of hills sightseeing. Offers an unobstructed 360-degree viewing vista of colossal snowpeaks, lush tea gardens, and rolling mountain clouds.`,
        highlights: [
          "Perfect vantage point for golden Himalayan sunrises & sunsets",
          "Direct line of sight to giant snow peaks like Mount Kanchenjunga",
          "Quiet photo points with rustic wooden benches under giant pines"
        ]
      };
    } else if (cat.includes('trek') || cat.includes('hike') || cat.includes('valley')) {
      return {
        whyVisit: `Crafted for adventure enthusiasts and soul-seekers alike. Journey along fragrant pine forests, old wooden suspension bridges, and rolling high meadows.`,
        highlights: [
          "Scenic wild pathways rich in regional mountain flora & fauna",
          "Stunning viewpoints showing lesser-known wilderness corners",
          "Clear directional trail markers with resting spots along the way"
        ]
      };
    } else {
      return {
        whyVisit: `A quintessential Himalayan gem showcasing the authentic, peaceful rhythm of life in the mountains. Ideal for exploring local traditions and peaceful nature walks.`,
        highlights: [
          "Pristine environment off the typical commercial tourist trail",
          "Friendly local interactions and beautiful photo backdrops",
          "Scent of clean pinewood and visual charm of classic hillside slopes"
        ]
      };
    }
  })();

  // Access Point resolver for How to Reach
  const getAccessPointData = (hubId: string) => {
    const matchedRoute = routes.find(r => r.fromHubId === hubId || r.fromHubId.toLowerCase() === hubId.toLowerCase());
    
    if (matchedRoute) {
      const dist = matchedRoute.distance || Math.round((matchedRoute.timeMin || 180) / 2);
      const timeHr = Math.round((matchedRoute.timeMin || 180) / 60 * 10) / 10;
      const timeString = matchedRoute.timeMin ? `${Math.floor(matchedRoute.timeMin / 60)} hrs ${matchedRoute.timeMin % 60} mins` : `${timeHr} hrs`;
      return {
        name: hubId === 'NJP' ? 'NJP Railway Station' : hubId === 'Bagdogra' ? 'Bagdogra Airport (IXB)' : hubId === 'Siliguri' ? 'Siliguri Junction' : hubId === 'Gangtok' ? 'Gangtok (Sikkim Hub)' : hubId,
        distance: `${dist} km`,
        time: timeString
      };
    }

    const baseDist = destination?.distanceFromHub || 75;
    let dist = baseDist;

    if (hubId === 'NJP') {
      dist = baseDist;
    } else if (hubId === 'Bagdogra') {
      dist = baseDist + 5;
    } else if (hubId === 'Siliguri') {
      dist = Math.max(15, baseDist - 8);
    } else if (hubId === 'Gangtok') {
      dist = baseDist + 40;
    }

    const timeMin = Math.round(dist * 2.5);
    const hrs = Math.floor(timeMin / 60);
    const mins = timeMin % 60;
    const timeString = `${hrs} hrs ${mins} mins`;

    const hubNames: Record<string, string> = {
      'NJP': 'NJP Railway Station',
      'Bagdogra': 'Bagdogra Airport (IXB)',
      'Siliguri': 'Siliguri Junction',
      'Gangtok': 'Gangtok (Sikkim Hub)'
    };

    return {
      name: hubNames[hubId] || hubId,
      distance: `${dist} km`,
      time: timeString
    };
  };

  // Filter dynamic elements
  const isLiked = user && likes.some(l => l.id === `${user.uid}_${attraction.id}`);
  const isSaved = isItemSaved(attraction.id);
  const likesCount = likes.filter(l => l.contentId === attraction.id).length;
  
  const attrComments = comments.filter(c => c.contentId === attraction.id && c.contentType === 'attraction');

  // Auto-generate statistics for Explore Destination Card
  const destinationAttractionsCount = attractions.filter(a => a.destinationId === attraction.destinationId).length;
  const destinationHomestaysCount = homestays.filter(h => h.destinationId === attraction.destinationId).length;
  const taxiStandName = destination?.nearestTaxiStand || `${destination?.name || 'Local'} Taxi Stand`;

  // Filter Nearby Stays
  const nearbyStays = homestays
    .filter(h => h.destinationId === attraction.destinationId)
    .slice(0, 6);

  // Filter Regional Transport/Drivers
  const regionalDrivers = drivers
    .filter(d => d.status === 'Approved')
    .slice(0, 3);

  // Explore More: Similar Category Attractions
  const similarAttractions = attractions
    .filter(a => a.category === attraction.category && a.id !== attraction.id)
    .slice(0, 6);

  // Explore More: Trending Attractions (mocked sorted by visual engagement)
  const trendingAttractions = attractions
    .filter(a => a.id !== attraction.id)
    .slice(0, 6);

  // Carousel Refs
  const accessCarouselRef = useRef<HTMLDivElement>(null);
  const taxiCarouselRef = useRef<HTMLDivElement>(null);
  const driversCarouselRef = useRef<HTMLDivElement>(null);
  const trendingCarouselRef = useRef<HTMLDivElement>(null);

  // Merged traveler photos with static gallery items for Traveler Moments
  const basePhotos = [
    ...(attraction.gallery || []).map((imgUrl, idx) => ({
      id: `static-${idx}`,
      url: imgUrl,
      isStatic: true,
      caption: 'Official Highlight',
      uploadedBy: 'HillyTrip Guides',
      uploadDate: new Date(2026, 0, 1).toISOString(),
      likesCount: 24 + idx * 5,
      commentsCount: 3 + idx,
      timestamp: new Date(2026, 0, 1).getTime()
    })),
    ...activePhotos.map((photo) => {
      const photoLikes = likes.filter((l) => l.contentId === photo.id).length;
      const photoCommentsCount = comments.filter((c) => c.contentId === photo.id && c.contentType === 'photo').length;
      return {
        id: photo.id,
        url: photo.url,
        isStatic: false,
        caption: photo.caption || 'Scenic view',
        uploadedBy: photo.uploadedBy,
        uploadDate: photo.uploadDate,
        likesCount: photoLikes,
        commentsCount: photoCommentsCount,
        timestamp: photo.uploadDate ? new Date(photo.uploadDate).getTime() : Date.now()
      };
    })
  ];

  // Apply filters: liked, latest, popular
  const filteredPhotos = [...basePhotos].sort((a, b) => {
    if (galleryFilter === 'liked') {
      return b.likesCount - a.likesCount;
    } else if (galleryFilter === 'latest') {
      return b.timestamp - a.timestamp;
    } else { // popular
      return (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount);
    }
  });

  const checkDuplicatePhoto = (file: File) => {
    const cleanName = file.name.split('.')[0].toLowerCase();
    const hasStaticDuplicate = (attraction.gallery || []).some(url => url.toLowerCase().includes(cleanName));
    const hasActiveDuplicate = activePhotos.some(photo => photo.caption.toLowerCase().includes(cleanName) || photo.url.toLowerCase().includes(cleanName));
    return hasStaticDuplicate || hasActiveDuplicate;
  };

  const handlePhotoUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setPhotoUploadError('Please select a photo first.');
      return;
    }

    if (checkDuplicatePhoto(uploadFile)) {
      setPhotoUploadError('This photo appears to have been uploaded already. Please select another photo.');
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoUploadError('');
    setPhotoUploadSuccessMessage('');

    try {
      const compressedBlob = await compressAndConvertToWebP(uploadFile);
      const targetName = `attraction_${attraction.id}_${Date.now()}_${uploadFile.name.replace(/\.[^/.]+$/, "")}.webp`;
      const secureDownloadUrl = await uploadImageToFirebase(compressedBlob, targetName);

      if (isAdmin) {
        const metaPayload = {
          destinationId: destination?.id || attraction.destinationId || null,
          attractionId: attraction.id,
          url: secureDownloadUrl,
          uploadedBy: user?.displayName || user?.email || 'Admin',
          status: 'Approved',
          caption: uploadCaption.trim() || 'HillyTrip scenic view',
          altText: uploadCaption.trim() || 'HillyTrip premium scenic highlight view',
          userId: user?.uid || 'admin'
        };

        const response = await hillyTripFetch('/api/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metaPayload)
        });

        if (!response.ok) throw new Error('Failed to save image metadata.');
        const resBody = await response.json();
        
        if (resBody.image) {
          setActivePhotos(prev => [resBody.image, ...prev]);
        }
        
        setPhotoUploadSuccessMessage('Your photo has been uploaded and published directly as administrator.');
        setNotification({
          type: 'success',
          message: '📸 Admin Direct Sync: Photo published successfully!'
        });
      } else {
        const contribPayload = {
          userId: user?.uid || 'anonymous',
          travellerName: user?.displayName || user?.email || 'Registered Traveler',
          travellerEmail: user?.email || 'traveler@hillytrip.com',
          destinationId: destination?.id || attraction.destinationId || null,
          imageUrl: secureDownloadUrl,
          attractionId: attraction.id,
          caption: uploadCaption.trim() || 'Traveler View'
        };

        const response = await hillyTripFetch('/api/photo-contributions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contribPayload)
        });

        if (!response.ok) throw new Error('Failed to submit photo contribution.');

        setPhotoUploadSuccessMessage('Your photo has been submitted successfully and is awaiting admin approval.');
        setNotification({
          type: 'success',
          message: '📸 Photo submitted successfully and is awaiting admin approval!'
        });
      }

      setUploadFile(null);
      setUploadCaption('');
      setUploadPreviewUrl('');
    } catch (err: any) {
      console.error(err);
      setPhotoUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoUploadError("Unsupported file type. Please upload a high-resolution JPEG, JPG, WebP, or PNG file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoUploadError("File exceeds the 10MB size restriction. Please upload an image under 10MB.");
      return;
    }

    setUploadFile(file);
    setPhotoUploadError('');
    setPhotoUploadSuccessMessage('');

    try {
      const blobUrl = URL.createObjectURL(file);
      setUploadPreviewUrl(blobUrl);

      const cleanName = file.name.split('.')[0].replace(/[-_]+/g, ' ');
      setUploadCaption(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    } catch (err: any) {
      console.error(err);
      setPhotoUploadError(err.message || "Failed to process image.");
    }
  };

  const handlePhotoCommentSubmitLocal = async () => {
    if (!localPhotoCommentText.trim() || !onAddPhotoComment || !selectedPhotoForViewer) return;
    try {
      await onAddPhotoComment(selectedPhotoForViewer.id, 'photo', localPhotoCommentText.trim());
      setLocalPhotoCommentText('');
      setNotification({
        type: 'success',
        message: '💬 Comment added to photo!'
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/#/attraction/${getItemSlug(attraction)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setNotification({
      type: 'success',
      message: `🔗 Direct link to ${attraction.name} copied!`
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Scroll function for carousels
  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 320;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20 animate-fade-in font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[480px] md:h-[580px] lg:h-[650px] w-full overflow-hidden text-white flex flex-col justify-end">
        {/* Background Image with overlay gradient */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            '--weather-hero-filter': weatherConfigs[weatherTheme]?.imageFilter || 'none',
            '--weather-hero-blend-color': weatherConfigs[weatherTheme]?.overlayColor || 'transparent',
            '--weather-hero-blend-mode': weatherConfigs[weatherTheme]?.overlayBlendMode || 'normal',
          } as React.CSSProperties}
        >
          <img 
            src={safeSrc(attraction.image)} 
            alt={attraction.name} 
            className="w-full h-full object-cover scale-100 transform hover:scale-105 transition-all duration-1000 ease-out" 
            style={{
              filter: 'var(--weather-hero-filter, none)',
            }}
          />
          {/* Dynamic Weather Overlay Color & Grading Layer */}
          <div 
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{
              backgroundColor: 'var(--weather-hero-blend-color, transparent)',
              mixBlendMode: 'var(--weather-hero-blend-mode, normal)' as any,
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-b ${weatherConfigs[weatherTheme]?.overlayGradient || 'from-slate-950/5 via-transparent to-slate-950/45'} transition-all duration-700 pointer-events-none`} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20 pointer-events-none" />
        </div>

        {/* Live Weather Overlay Animations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
          <WeatherAnimationsStyle />
          {weatherTheme === 'sunny' && <SunraysAnimation />}
          {weatherTheme === 'rain' && <RainAnimation />}
          {weatherTheme === 'snow' && <SnowAnimation />}
          {weatherTheme === 'fog' && <FogAnimation />}
          {weatherTheme === 'thunderstorm' && <ThunderstormAnimation />}
          {(weatherTheme === 'windy' || weatherTheme === 'cloudy' || weatherTheme === 'partly_cloudy') && (
            <CloudsAnimation fast={weatherTheme === 'windy'} />
          )}
        </div>

        {/* Floating Top Header Buttons */}
        <div className="absolute top-6 left-4 right-4 z-20 flex justify-between items-start max-w-7xl mx-auto w-full px-4 sm:px-6">
          <button 
            onClick={() => navigate('#/attractions')}
            className="flex items-center gap-2 bg-slate-950/65 hover:bg-slate-900 border border-white/20 text-xs px-4 py-2.5 rounded-full font-black text-white cursor-pointer transition-all backdrop-blur-md active:scale-95 shadow-lg shadow-black/10 mt-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Spots
          </button>

          <div className="flex flex-col items-end gap-2">
            <span className="bg-emerald-600/90 text-white border border-emerald-500/30 text-[10px] md:text-xs font-black tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-md shadow-emerald-900/10 font-mono">
              <Compass className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '8s' }} /> {attraction.category} Spot
            </span>

            {/* Live Weather Badge */}
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest font-mono shadow-lg border backdrop-blur-md flex items-center gap-2 transition-all duration-300 ${
              weatherConfigs[weatherTheme]?.bgAccentColor || 'bg-slate-900/70 border-white/10 text-white'
            }`}>
              <span className="text-[12px] flex items-center justify-center">
                {weatherTheme === 'sunny' ? (
                  <WiDaySunny className="text-amber-500 animate-spin-slow" size={16} />
                ) : weatherTheme === 'rain' ? (
                  <WiRain className="text-sky-400 animate-bounce" size={16} />
                ) : weatherTheme === 'snow' ? (
                  <WiSnow className="text-sky-200 animate-pulse" size={16} />
                ) : (
                  weatherConfigs[weatherTheme]?.badge.split(' ')[0]
                )}
              </span>
              <span>
                {weatherConfigs[weatherTheme]?.badge.split(' ').slice(1).join(' ')}
                {weatherData && ` • ${weatherData.temp}°C`}
              </span>
            </div>
            
            {/* Climate sub-metrics */}
            {weatherData && (
              <div className="text-[8px] text-white/75 bg-slate-950/45 backdrop-blur-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-2 border border-white/5 shadow-xs">
                <span>💧 {weatherData.humidity}</span>
                <span>👁️ {weatherData.visibility}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Info Text Panel */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 text-left flex flex-col items-start gap-4">
          <div className="space-y-3.5 max-w-4xl">
            {/* Clickable Destination & Category Tag */}
            <div className="flex flex-wrap items-center gap-2">
              {destination && (
                <button 
                  onClick={() => navigate(`#/destination/${getItemSlug(destination)}`)}
                  className="group flex items-center gap-1 bg-white/10 hover:bg-emerald-600/35 border border-white/20 px-3 py-1.5 rounded-full text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer backdrop-blur-md shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-bounce" />
                  <span>{destination.name}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              )}
              <span className="bg-emerald-600/90 text-white border border-emerald-500/30 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-md shadow-emerald-900/10 font-mono">
                {attraction.category}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-none font-sans text-shadow-md">
              {attraction.name}
            </h1>

            {/*⭐⭐⭐⭐⭐ Rating & Review Count immediately below title */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className={`w-4 h-4 ${idx < Math.round(parseFloat(avgRating)) ? 'fill-current text-amber-400' : 'text-white/20'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-black text-white bg-slate-950/40 px-2 py-0.5 rounded-md font-mono">{avgRating} Rating</span>
              <span className="text-xs text-slate-300">({reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'})</span>
            </div>

            {/* Description clamped 3-4 lines with Read More */}
            <div className="mt-3 max-w-3xl border-l-2 border-emerald-500/50 pl-4 py-0.5">
              <p className={`text-sm sm:text-base text-slate-250 leading-relaxed font-medium ${descriptionExpanded ? '' : 'line-clamp-3'}`}>
                {attraction.description}
              </p>
              {attraction.description.length > 155 && (
                <button
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="text-xs font-black text-emerald-400 hover:text-emerald-300 mt-2 cursor-pointer underline flex items-center gap-1"
                >
                  {descriptionExpanded ? 'Read Less' : 'Read More ➔'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ENGAGEMENT BAR (FLOATING IN THE MIDDLE) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 sm:-mt-9 relative z-30">
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-3 flex items-center justify-between max-w-4xl mx-auto gap-1">
          
          {/* Like */}
          <button
            onClick={() => toggleLike(attraction.id, 'attraction')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
              isLiked 
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600' 
                : 'text-slate-650 hover:text-rose-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Heart className={`w-4.5 h-4.5 transition-transform ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'}`} />
            <span className="hidden xs:inline">{isLiked ? 'Liked' : 'Like'}</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm font-bold text-[10px] text-slate-500 dark:text-slate-400 ml-1">
              {likesCount}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => {
              setCommentsExpanded(true);
              document.getElementById('traveler-discussions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-slate-650 hover:text-emerald-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-black transition cursor-pointer"
          >
            <MessageSquare className="w-4.5 h-4.5 text-slate-400" />
            <span className="hidden xs:inline">Comment</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm font-bold text-[10px] text-slate-500 dark:text-slate-400 ml-1">
              {attractionComments.length}
            </span>
          </button>

          {/* Share */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowShareDropdown(!showShareDropdown)}
              className="w-full flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-slate-650 hover:text-emerald-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-black transition cursor-pointer"
            >
              <Share2 className="w-4.5 h-4.5 text-slate-400" />
              <span>Share</span>
            </button>
            
            <AnimatePresence>
              {showShareDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowShareDropdown(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white dark:bg-slate-850 border border-slate-205 dark:border-slate-850 rounded-2xl p-2.5 shadow-2xl w-48 text-left z-20 space-y-1.5"
                  >
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block px-2.5 pb-1 border-b border-slate-100 dark:border-slate-800">Choose platform</span>
                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${attraction.name} in ${destination?.name || 'the Himalayas'} on HillyTrip: ${window.location.origin}/#/attraction/${getItemSlug(attraction)}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 cursor-pointer transition-colors"
                      onClick={() => setShowShareDropdown(false)}
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>WhatsApp Share</span>
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/#/attraction/${getItemSlug(attraction)}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 cursor-pointer transition-colors"
                      onClick={() => setShowShareDropdown(false)}
                    >
                      <Share2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Facebook Share</span>
                    </a>
                    <button 
                      onClick={() => {
                        handleCopyLink();
                        setShowShareDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Direct Link'}</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Save (Bookmark) */}
          <button
            onClick={() => handleToggleSave(attraction.id, 'attraction')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
              isSaved 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' 
                : 'text-slate-650 hover:text-emerald-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <Bookmark className={`w-4.5 h-4.5 transition-transform ${isSaved ? 'fill-emerald-500 text-emerald-500 scale-110' : 'text-slate-400'}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA IN PREMIUM SINGLE-COLUMN PATH */}
      <main className="w-full mt-8">
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

            {/* 3. QUICK INFORMATION BENTO BOX */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                <h3 className="font-extrabold text-lg text-slate-905 dark:text-white flex items-center gap-2">
                  <span>⚡</span> Quick Sightseeing Parameters
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono mt-0.5">Essential details for visitors</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                
                {/* Season */}
                <div className="bg-slate-50 dark:bg-slate-800/35 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850 flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2.5">
                    <Calendar className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block font-mono">Best Season</span>
                    <span className="text-[11.5px] font-bold text-slate-850 dark:text-slate-200 block mt-0.5">
                      {destination?.bestSeason || 'Sept - June'}
                    </span>
                  </div>
                </div>

                {/* Entry Fee */}
                <div className="bg-slate-50 dark:bg-slate-800/35 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850 flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2.5">
                    <Wallet className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block font-mono">Entry Access</span>
                    <span className="text-[11.5px] font-bold text-slate-850 dark:text-slate-200 block mt-0.5">
                      {attraction.category === 'Trek' ? '₹50 (Conserv.)' : 'Free Entry'}
                    </span>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-slate-50 dark:bg-slate-800/35 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850 flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-2.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block font-mono">Visiting Hours</span>
                    <span className="text-[11.5px] font-bold text-slate-850 dark:text-slate-200 block mt-0.5">
                      6:00 AM - 5:30 PM
                    </span>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="bg-slate-50 dark:bg-slate-800/35 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850 flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center mb-2.5">
                    <Users className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block font-mono">Difficulty</span>
                    <span className="text-[11.5px] font-bold text-slate-850 dark:text-slate-200 block mt-0.5">
                      {attraction.category === 'Trek' ? 'Challenging' : 'Easy / Family'}
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-slate-50 dark:bg-slate-800/35 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-850 flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-2.5">
                    <Compass className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block font-mono">Ideal Visit</span>
                    <span className="text-[11.5px] font-bold text-slate-850 dark:text-slate-200 block mt-0.5">
                      {attraction.category === 'Trek' ? '4 - 6 Hours' : '1 - 2 Hours'}
                    </span>
                  </div>
                </div>

                {/* ⭐ Reviews Card */}
                <button
                  onClick={() => {
                    document.getElementById('traveler-reviews-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-950/15 dark:hover:bg-amber-950/25 p-3 rounded-2xl border border-amber-500/25 dark:border-amber-500/10 flex flex-col justify-between text-left transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block font-mono">⭐ Reviews</span>
                    <span className="text-[11.5px] font-bold text-slate-850 dark:text-slate-200 block mt-0.5">
                      {reviewCount > 0 ? `${avgRating} Rating` : 'No Ratings'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                    </span>
                  </div>
                </button>

              </div>
            </section>



            {/* 3. TRAVELER MOMENTS */}
            <section id="gallery-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-905 dark:text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-600" /> Traveler Moments
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5">Captivating local scenery & travel memories contributed by the community</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!user) {
                        handleUserLogin();
                      } else {
                        setShowUploadModal(true);
                      }
                    }}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-full cursor-pointer transition active:scale-95 shadow-md shadow-emerald-500/15"
                  >
                    <Plus className="w-4 h-4" /> Upload Photo
                  </button>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => scrollCarousel(photosCarouselRef, 'left')}
                      className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel(photosCarouselRef, 'right')}
                      className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Moments Sorting Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {['liked', 'latest', 'popular'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setGalleryFilter(f as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black capitalize transition-all cursor-pointer whitespace-nowrap ${
                      galleryFilter === f 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-100 hover:bg-slate-250 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300'
                    }`}
                  >
                    {f === 'liked' ? '❤️ Most Liked' : f === 'latest' ? '⏰ Latest Uploads' : '🔥 Popular Feed'}
                  </button>
                ))}
              </div>

              {/* Photo Swipe Carousel */}
              {filteredPhotos.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/10 p-10 rounded-2xl text-center border border-slate-200/50 dark:border-slate-850">
                  <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-450 italic">Be the first to share an offbeat mountain moment of {attraction.name}!</p>
                </div>
              ) : (
                <UniversalCarousel
                  items={filteredPhotos}
                  visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
                  autoPlayInterval={7300}
                  renderItem={(photo, idx) => {
                    const likedByUser = likes.some((l) => l.contentId === photo.id && l.userId === user?.uid);
                    return (
                      <motion.div 
                        key={`${photo.id}-${idx}-${galleryFilter}`}
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.55, 
                          ease: [0.16, 1, 0.3, 1],
                          delay: (idx % 3) * 0.08
                        }}
                        whileHover={{ y: -6, transition: { duration: 0.2, ease: "easeOut" } }}
                        className="w-full h-full"
                      >
                        <div 
                          className="w-full bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-805 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-3xs h-[280px]"
                        >
                          {/* Image body */}
                          <div 
                            onClick={() => setSelectedPhotoForViewer(photo)}
                            className="relative h-48 w-full overflow-hidden shrink-0 cursor-zoom-in"
                          >
                            <img 
                              src={safeSrc(photo.url)} 
                              alt={photo.caption} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 text-left">
                              <p className="text-xs font-black text-white truncate">{photo.caption}</p>
                              <p className="text-[10px] text-slate-300 mt-0.5 truncate font-medium">By {photo.uploadedBy}</p>
                            </div>
                          </div>

                          {/* Interactive triggers under each photo */}
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-850">
                            {/* Like button */}
                            <button
                              onClick={() => toggleLike(photo.id, 'photo')}
                              className={`flex items-center gap-1 text-xs font-black px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                likedByUser 
                                  ? 'bg-rose-500/10 text-rose-500' 
                                  : 'text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${likedByUser ? 'fill-current' : ''}`} />
                              <span>{photo.likesCount}</span>
                            </button>

                            {/* Comment count trigger */}
                            <button
                              onClick={() => setSelectedPhotoForViewer(photo)}
                              className="flex items-center gap-1 text-xs font-black text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 rounded-lg cursor-pointer transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{photo.commentsCount}</span>
                            </button>

                            {/* Share button */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(photo.url);
                                setNotification({
                                  type: 'success',
                                  message: '📸 Direct image link copied!'
                                });
                              }}
                              className="flex items-center gap-1 text-xs font-black text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1.5 rounded-lg cursor-pointer transition"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="hidden xs:inline">Share</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }}
                />
              )}
            </section>

            {/* 4. HOW TO REACH */}
            <section id="how-to-reach-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-905 dark:text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-emerald-600" /> How to Reach
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5">Practical, dynamic travel routes and access options directly from database listings</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => scrollCarousel(accessCarouselRef, 'left')}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel(accessCarouselRef, 'right')}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stacked top cards always visible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nearest Destination Card */}
                <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-805 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-55/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block font-mono">Nearest Destination</span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                      {destination?.name || 'Not available'}
                    </h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                      Distance: <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{attraction.distanceFromDestination ? `${attraction.distanceFromDestination} km` : 'Not available'}</span>
                    </p>
                  </div>
                </div>

                {/* Nearest Taxi Stand Card */}
                <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-805 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-55/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block font-mono">Nearest Taxi Stand</span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                      {taxiStandName}
                    </h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                      Distance: <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{attraction.distanceFromDestination ? `${(attraction.distanceFromDestination + 0.5).toFixed(1)} km` : 'Not available'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Major Access Points (Horizontal Swipeable List) */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-450 uppercase tracking-widest font-mono mb-3">Major Access Points</h4>
                <UniversalCarousel
                  items={['NJP', 'Bagdogra', 'Siliguri', 'Gangtok']}
                  visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4 }}
                  autoPlayInterval={8000}
                  renderItem={(hubId) => {
                    const hubInfo = getAccessPointData(hubId);
                    return (
                      <div 
                        key={hubId} 
                        className="w-full bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-left h-[140px] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {hubId === 'NJP' ? '🚆' : hubId === 'Bagdogra' ? '✈️' : hubId === 'Siliguri' ? '🏙️' : '🏔️'}
                            </span>
                            <span className="font-extrabold text-xs text-slate-850 dark:text-slate-200 uppercase font-mono">
                              {hubId === 'NJP' ? 'From NJP' : hubId === 'Bagdogra' ? 'From Bagdogra' : `From ${hubId}`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                            {hubInfo.name}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 shrink-0">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Distance</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{hubInfo.distance}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Est. Time</span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{hubInfo.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              {/* Persistent Call-to-actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/85 flex flex-col sm:flex-row items-center gap-3">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${attraction.name}, ${destination?.name || ''}, India`)}&travelmode=driving`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-md shadow-emerald-55/15 active:scale-95 leading-none uppercase tracking-wider font-mono"
                >
                  <MapPin className="w-4 h-4 text-white shrink-0" /> Open Google Maps
                </a>

                <button 
                  onClick={() => {
                    navigate('#/book-car');
                    setNotification({
                      type: 'info',
                      message: `🚖 Select your starting point to book a certified local mountain driver for ${attraction.name}!`
                    });
                  }}
                  className="w-full sm:flex-1 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-extrabold text-xs px-4 py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-sm active:scale-95 leading-none uppercase tracking-wider font-mono border border-slate-850 dark:border-slate-700"
                >
                  <Car className="w-4 h-4 text-amber-400 shrink-0" /> Find Taxi
                </button>

                <button 
                  onClick={() => {
                    if (destination) {
                      navigate(`#/destination/${getItemSlug(destination)}`);
                      setNotification({
                        type: 'info',
                        message: `🏡 Showing verified homestays located in and around ${destination.name}!`
                      });
                    } else {
                      navigate('#/destinations');
                    }
                  }}
                  className="w-full sm:flex-1 bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200 font-extrabold text-xs px-4 py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-2xs active:scale-95 leading-none uppercase tracking-wider font-mono border border-slate-250 dark:border-slate-800"
                >
                  <Home className="w-4 h-4 text-indigo-500 shrink-0" /> Find Stay
                </button>
              </div>
            </section>

            {/* 7. NEARBY ATTRACTIONS SWIPE CAROUSEL */}
            <section id="nearby-attractions-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-905 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Other Nearby Scenic Spots
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5 font-mono">More tourist sightseeing attractions around {destination?.name || 'this valley'}</p>
                </div>

                {/* Scroll buttons */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => scrollCarousel(nearbyCarouselRef, 'left')}
                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel(nearbyCarouselRef, 'right')}
                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(() => {
                const list = attractions.filter(a => a.destinationId === attraction.destinationId && a.id !== attraction.id);
                if (list.length === 0) {
                  return (
                    <div className="bg-slate-50 dark:bg-slate-800/15 p-6 rounded-2xl text-slate-400 dark:text-slate-500 text-center text-xs border border-slate-100 dark:border-slate-800 italic">
                      No other sightseeing locations logged in the immediate vicinity.
                    </div>
                  );
                }

                return (
                  <UniversalCarousel
                    items={list}
                    visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
                    autoPlayInterval={7500}
                    renderItem={(item) => (
                      <div 
                        key={item.id} 
                        className="w-full snap-start shrink-0 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/50 dark:border-slate-850 overflow-hidden flex flex-col justify-between group h-[320px]"
                      >
                        <div className="relative h-40 w-full overflow-hidden shrink-0">
                          <img 
                            src={safeSrc(item.image)} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white font-extrabold text-[8px] py-1 px-2.5 rounded-full uppercase tracking-widest font-mono">
                            {item.category}
                          </span>
                        </div>
                        <div className="p-4 flex flex-col justify-between flex-grow text-left">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-4 leading-normal font-sans">
                              {item.description}
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              navigate(`#/attraction/${getItemSlug(item)}`);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-black text-[10px] py-2.5 rounded-xl cursor-pointer transition uppercase tracking-wider leading-none"
                          >
                            Explore Spot ➔
                          </button>
                        </div>
                      </div>
                    )}
                  />
                );
              })()}
            </section>

            {/* 6. FEATURED STAY */}
            <section id="featured-stay-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-905 dark:text-white flex items-center gap-2">
                    <Home className="w-5 h-5 text-emerald-600 animate-pulse" /> Featured Stay Nearby
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5">Highly-rated community eco-homestays in {destination?.name || 'this valley'}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => scrollCarousel(staysCarouselRef, 'left')}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel(staysCarouselRef, 'right')}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {nearbyStays.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/10 p-10 rounded-2xl text-center border border-slate-200/50 dark:border-slate-855">
                  <Home className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-450 italic">No direct homestays listed in this base. Register a planning lead below to get personalized quotes!</p>
                </div>
              ) : (
                <UniversalCarousel
                  items={nearbyStays}
                  visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
                  autoPlayInterval={7800}
                  renderItem={(hs) => (
                    <div 
                      key={hs.id} 
                      className="w-full bg-slate-50 dark:bg-slate-800/25 rounded-2xl border border-slate-150 dark:border-slate-850 p-4 flex flex-col justify-between space-y-4 transition hover:border-emerald-500/20 h-[210px]"
                    >
                      <div className="flex gap-3 items-start">
                        <img 
                          src={(hs.images && hs.images.find(img => img && img.trim() !== '')) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'} 
                          alt={hs.name} 
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200/60 shadow-3xs" 
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate hover:text-emerald-600 transition cursor-pointer" onClick={() => navigate(`#/homestay/${getItemSlug(hs)}`)}>
                            {hs.name}
                          </h5>
                          <p className="text-xs text-emerald-705 dark:text-emerald-400 font-black font-mono mt-0.5">
                            ₹{hs.priceMin} - ₹{hs.priceMax} <span className="text-slate-400 dark:text-slate-500 font-medium text-[9px]">/ night</span>
                          </p>
                          <span className="inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md mt-1 font-mono">
                            🍳 Meals Available
                          </span>
                        </div>
                      </div>

                      {/* Closed Marketplace In-Platform CTAs */}
                      <div className="grid grid-cols-2 gap-2 border-t border-slate-200/50 dark:border-slate-800/60 pt-3 shrink-0">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const slug = getItemSlug(hs);
                            if (navigate) navigate(`#/enquire?listingType=homestay&listingId=${slug}`);
                            else window.location.hash = `#/enquire?listingType=homestay&listingId=${slug}`;
                          }}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-[10px] py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition leading-none uppercase tracking-wider font-mono cursor-pointer shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> Enquire
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (navigate) navigate(`#/homestay/${getItemSlug(hs)}`);
                            else window.location.hash = `#/homestay/${getItemSlug(hs)}`;
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition leading-none uppercase tracking-wider font-mono cursor-pointer shadow-xs"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  )}
                />
              )}
            </section>

            {/* 7. LOCAL TAXIS & TRANSPORT */}
            <section id="local-taxi-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-905 dark:text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-indigo-500 shrink-0" /> Local Taxis & Transport
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5">Verified mountain drivers & regional taxi stands near {destination?.name || 'this base'}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => scrollCarousel(taxiCarouselRef, 'left')}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => scrollCarousel(taxiCarouselRef, 'right')}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-full cursor-pointer transition active:scale-90"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Taxi stand fact box */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-805 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="text-left text-xs text-slate-600 dark:text-slate-450">
                  <strong className="block text-slate-900 dark:text-white">Nearest Taxi Stand Location</strong>
                  <span className="block mt-0.5 leading-relaxed">{taxiStandName} (~{attraction.distanceFromDestination ? (attraction.distanceFromDestination + 0.5).toFixed(1) : '4.7'} km from spot)</span>
                </div>
              </div>

              {/* Verified Drivers */}
              {regionalDrivers.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/10 p-10 rounded-2xl text-center border border-slate-200/50 dark:border-slate-855">
                  <Camera className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-450 italic">No direct driver contacts assigned to this specific sightseeing sector. Contact our planning desk below!</p>
                </div>
              ) : (
                <UniversalCarousel
                  items={regionalDrivers}
                  visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
                  autoPlayInterval={7700}
                  renderItem={(drv) => (
                    <div 
                      key={drv.id} 
                      className="w-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-150 dark:border-slate-850 p-4 flex flex-col justify-between space-y-4 transition hover:border-indigo-500/20 h-[190px]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/30 dark:border-slate-800 pb-2">
                          <div className="text-left min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block font-mono">Verified Driver</span>
                            <span className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-1.5 mt-0.5 truncate">
                              👨🏽‍✈️ {drv.name} <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            </span>
                          </div>
                          <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-black px-2 py-1 rounded-md font-mono shrink-0">
                            🚙 {drv.vehicleName || 'Bolero / Sumo'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                          <p>Vehicle No: <strong className="text-slate-800 dark:text-slate-200 font-mono">{drv.vehicleNumber || 'SK-01-XXXX'}</strong></p>
                          <p>Est. Tariff: <strong className="text-slate-850 dark:text-slate-200 font-mono text-emerald-600 dark:text-emerald-400">₹{drv.pricingPerDay || '2200'} / trip circuit</strong></p>
                        </div>
                      </div>

                      {/* Closed Marketplace In-Platform CTAs */}
                      <div className="grid grid-cols-2 gap-2 border-t border-slate-200/50 dark:border-slate-800/60 pt-3 shrink-0">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (navigate) navigate(`#/enquire?listingType=taxi_operator&listingId=${drv.id}`);
                            else window.location.hash = `#/enquire?listingType=taxi_operator&listingId=${drv.id}`;
                          }}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-[10px] py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition leading-none uppercase tracking-wider font-mono cursor-pointer shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> Enquire
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (navigate) navigate(`#/business/${drv.id}`);
                            else window.location.hash = `#/business/${drv.id}`;
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition leading-none uppercase tracking-wider font-mono cursor-pointer shadow-xs"
                        >
                          Book Taxi
                        </button>
                      </div>
                    </div>
                  )}
                />
              )}
            </section>

            {/* 8. NEED HELP PLANNING */}
            <section className="bg-gradient-to-br from-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/60 shadow-xl text-left relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl mt-12 pointer-events-none" />
              
              <div className="relative z-10 max-w-xl">
                <Compass className="w-8 h-8 text-emerald-400 mb-2 animate-spin-slow" />
                <h4 className="font-extrabold text-lg text-white">Need local travel assistance?</h4>
                <p className="text-slate-350 text-xs mt-1 leading-relaxed">Submit a bespoke mountain planning lead. Our regional coordinators will instantly message you on WhatsApp to customize organic homestays, private cabs, and complete high-altitude itineraries.</p>
                
                {attrLeadSuccess ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/25 p-5 rounded-2xl mt-5 text-center animate-fade-in">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-extrabold text-emerald-300">Travel Lead Registered!</p>
                    <p className="text-xs text-slate-300 mt-1 leading-normal">Our verified mountain coordinator will connect with you on WhatsApp shortly.</p>
                    <button 
                      onClick={() => setAttrLeadSuccess(false)}
                      className="text-[10px] text-emerald-400 underline font-black mt-3 hover:text-emerald-300 transition cursor-pointer uppercase tracking-wider"
                    >
                      Submit New Enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAttractionLeadSubmit} className="space-y-4 mt-5 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">Your Full Name *</label>
                        <input 
                          name="name" 
                          type="text" 
                          required 
                          placeholder="e.g. Priyanjali Sen" 
                          className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">WhatsApp Mobile *</label>
                        <input 
                          name="mobile" 
                          type="tel" 
                          required 
                          placeholder="e.g. 9876543210" 
                          className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">Travel Date</label>
                        <input 
                          name="travelDate" 
                          type="date" 
                          required
                          defaultValue={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">Est. Budget (₹)</label>
                        <input 
                          name="budget" 
                          type="number" 
                          required
                          placeholder="e.g. 12000"
                          className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-650 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submittingAttrLead}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-55/15 disabled:opacity-50 mt-4 leading-none uppercase tracking-wider font-mono"
                    >
                      {submittingAttrLead ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Registering Lead...
                        </>
                      ) : (
                        <>
                          Register Mountain Travel Lead ➔
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </section>

          </div>

        {/* 11. TRAVELER DISCUSSIONS / COMMUNITY DISCUSSION SECTION */}
        <section id="traveler-discussions-section" className="mt-12 text-left max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-emerald-600" /> Traveler Discussions & Community Q&A
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ask questions, share travel updates, road status warnings, and interact with the mountain community.
              </p>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {attractionComments.length === 0 ? (
                <div className="text-slate-450 py-10 text-center text-sm italic border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No community discussions started yet. Ask a question or share a travel update below!
                </div>
              ) : (
                <div className="space-y-6">
                  {attractionComments.map((c) => (
                    <div 
                      key={c.id} 
                      className="bg-slate-50 dark:bg-slate-800/10 rounded-2xl p-5 border border-slate-100 dark:border-slate-850 space-y-4 text-left"
                    >
                      {/* Comment Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
                            <User className="w-4.5 h-4.5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-850 dark:text-slate-200 block">
                              {c.userName || 'Anonymous Traveler'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {c.timestamp ? new Date(c.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                            💬 Community Comment
                          </span>
                        </div>
                      </div>

                      {/* Comment Content */}
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-1 whitespace-pre-wrap">
                        {c.text}
                      </p>

                      {/* Action buttons (Reply & Delete) */}
                      <div className="flex items-center gap-4 pl-1 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                        <button
                          onClick={() => setActiveReplyBox(activeReplyBox === c.id ? null : c.id)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer hover:underline transition-all"
                        >
                          <CornerDownRight className="w-4 h-4" /> Reply
                        </button>

                        {((user && user.uid === c.userId) || isAdmin) && (
                          <button 
                            onClick={() => deleteCommentAction(c.id)}
                            className="text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline transition-all ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Comment
                          </button>
                        )}
                      </div>

                      {/* Replies List */}
                      {c.replies && c.replies.length > 0 && (
                        <div className="border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-5 mt-4 space-y-4">
                          {c.replies.map((reply: any) => (
                            <div key={reply.id} className="bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-600/5 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                    <User className="w-3.5 h-3.5 text-emerald-600" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                                      {reply.userName || 'Anonymous Traveler'}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono block">
                                      {reply.timestamp ? new Date(reply.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                    </span>
                                  </div>
                                </div>

                                {((user && user.uid === reply.userId) || isAdmin) && (
                                  <button 
                                    onClick={() => handleDeleteReply(c.id, reply.id)}
                                    className="text-red-500 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap pl-1">
                                {reply.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input Box */}
                      {activeReplyBox === c.id && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-4 mt-3 ml-4 space-y-3">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest font-mono block">
                            Write your reply
                          </span>
                          {!user ? (
                            <p className="text-xs text-slate-400 italic">Please sign in to reply to this thread.</p>
                          ) : (
                            <div className="flex items-end gap-2">
                              <textarea
                                rows={2}
                                placeholder="Write a helpful response..."
                                value={replyText[c.id] || ''}
                                onChange={(e) => setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
                              />
                              <button
                                onClick={() => handleReplySubmit(c.id)}
                                disabled={submittingReply[c.id]}
                                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-emerald-500/15 uppercase tracking-wider h-10 shrink-0 leading-none"
                              >
                                {submittingReply[c.id] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="w-3.5 h-3.5" /> Post
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 text-left mt-8">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest font-mono block mb-1">
                Ask the Mountain Community
              </span>
              <h4 className="font-extrabold text-base text-slate-850 dark:text-white">Post a Comment, Update or Q&A</h4>
              
              {!user ? (
                <div className="py-6 text-center text-xs space-y-3">
                  <p className="text-slate-450 font-medium">Please sign in to your traveler account to post a comment.</p>
                  <button 
                    onClick={handleUserLogin}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs uppercase tracking-wider leading-none"
                  >
                    Login Traveler Account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCommentSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 font-mono">Your Message *</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Ask questions about weather, parking availability, entry gates, permit updates or describe recent sightseeing guidelines..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submittingComment}
                    className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 uppercase tracking-wider leading-none"
                  >
                    {submittingComment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        Post Comment ➔
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 11b. TRAVELER REVIEWS SECTION */}
        <section id="traveler-reviews-section" className="mt-12 text-left max-w-7xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Traveler Reviews & Ratings
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Structured feedback, visitor experiences, star evaluations, and trust ratings.
              </p>
            </div>

            {/* Statistics Summary Box */}
            {attractionReviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 items-center mb-8">
                <div className="text-center md:border-r border-slate-200 dark:border-slate-800 py-2">
                  <span className="block text-4xl font-black text-slate-900 dark:text-white">
                    {avgRating}
                  </span>
                  <div className="flex items-center justify-center gap-0.5 my-1.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`w-3.5 h-3.5 ${idx < Math.round(parseFloat(avgRating)) ? 'fill-current' : 'text-slate-300 dark:text-slate-750'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-450 uppercase font-mono font-bold block">Average Traveler Score</span>
                </div>
                
                <div className="md:col-span-3 text-xs text-slate-505 dark:text-slate-400 space-y-2 text-left md:pl-6 leading-relaxed">
                  <p className="font-bold text-slate-800 dark:text-slate-200">⭐ Highly Rated Spot Summary</p>
                  <p>Mountain visitors emphasize beautiful viewpoint clarity, accessibility, and high nature appreciation ratings. Real experiences with trusted, structured community feedback.</p>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {attractionReviews.length === 0 ? (
                <div className="text-slate-450 py-10 text-center text-sm italic border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No structured reviews posted yet. Be the first to rate your experience and support future travelers!
                </div>
              ) : (
                <div className="space-y-5">
                  {attractionReviews.map((r) => (
                    <div 
                      key={r.id} 
                      className="bg-slate-50 dark:bg-slate-800/10 rounded-2xl p-5 border border-slate-100 dark:border-slate-850 space-y-3.5 text-left"
                    >
                      {/* Review Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <User className="w-4.5 h-4.5 text-amber-500" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-850 dark:text-slate-200 block">
                              {r.userName || 'Anonymous Traveler'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {r.timestamp ? new Date(r.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium font-mono">
                            📅 Visited: <span className="font-bold text-slate-600 dark:text-slate-300">{r.visitDate || 'Recent Month'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Stars and Title */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-4 h-4 ${idx < (r.rating || 5) ? 'fill-current' : 'text-slate-200 dark:text-slate-800'}`} />
                          ))}
                        </div>
                        <h4 className="font-black text-sm sm:text-base text-slate-855 dark:text-white">
                          {r.title || 'Sightseeing Review'}
                        </h4>
                      </div>

                      {/* Content */}
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-1">
                        {r.text}
                      </p>

                      {/* Optional Tip Callout */}
                      {r.tips && (
                        <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-350 mt-1">
                          <strong className="text-amber-600 dark:text-amber-400 block font-mono text-[9px] uppercase tracking-wider mb-1">💡 Essential Traveler Tip:</strong>
                          <p className="italic">"{r.tips}"</p>
                        </div>
                      )}

                      {/* Delete Action */}
                      {((user && user.uid === r.userId) || isAdmin) && (
                        <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-slate-800/40">
                          <button 
                            onClick={() => deleteCommentAction(r.id)}
                            className="text-red-500 hover:text-red-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Review
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Review Form */}
            <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 text-left mt-8">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest font-mono block mb-1">
                Contribute Mountain Experience
              </span>
              <h4 className="font-extrabold text-base text-slate-850 dark:text-white">Write a Structured Review & Rate the Spot</h4>
              
              {!user ? (
                <div className="py-6 text-center text-xs space-y-3">
                  <p className="text-slate-450 font-medium">Please sign in to write an evaluation review.</p>
                  <button 
                    onClick={handleUserLogin}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs uppercase tracking-wider leading-none"
                  >
                    Login Traveler Account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Rating selector */}
                    <div className="md:col-span-4">
                      <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 font-mono">Traveler Rating *</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 cursor-pointer transition active:scale-90"
                          >
                            <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-750'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Visit Date input */}
                    <div className="md:col-span-4">
                      <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 font-mono">Visit Date *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. October 2025"
                        value={reviewVisitDate}
                        onChange={(e) => setReviewVisitDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Review Title */}
                    <div className="md:col-span-4">
                      <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 font-mono">Review Title *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Breathtaking and peaceful spot"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                  </div>

                  {/* Comment text */}
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 font-mono">Describe your Experience *</label>
                    <textarea 
                      rows={3}
                      required
                      placeholder="Share detailed sightseeing roads conditions, parking costs, viewpoint clarity, family picnic convenience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-850 dark:text-white placeholder-slate-450 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 uppercase tracking-wider leading-none"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting Review...
                      </>
                    ) : (
                      <>
                        Post Traveler Review ➔
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 12. EXPLORE MORE: SIMILAR & TRENDING ATTRACTIONS SECTIONS */}
        <section className="mt-16 text-left max-w-7xl mx-auto space-y-12">
          
          {/* Similar Attractions Row */}
          {similarAttractions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    ⛺ Similar {attraction.category} Attractions
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5">Other gorgeous {attraction.category?.toLowerCase() || 'places'} across HillyTrip coordinates</p>
                </div>
              </div>

              <UniversalCarousel
                items={similarAttractions.slice(0, 10)}
                visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4 }}
                autoPlayInterval={7600}
                renderItem={(item) => (
                  <div 
                    key={item.id} 
                    className="w-full shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-805 overflow-hidden flex flex-col justify-between group shadow-3xs h-[320px]"
                  >
                    <div className="relative h-44 w-full overflow-hidden shrink-0">
                      <img 
                        src={safeSrc(item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                    <div className="p-4 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-slate-450 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>
                      <button 
                        onClick={() => {
                          navigate(`#/attraction/${getItemSlug(item)}`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-250 font-extrabold text-[10px] py-2.5 rounded-xl cursor-pointer transition uppercase tracking-wider leading-none mt-4"
                      >
                        Explore Spot ➔
                      </button>
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {/* Trending Attractions Row */}
          {trendingAttractions.length > 0 && (
            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/80 pt-10">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    🏆 Trending Sightseeing Locations
                  </h3>
                  <p className="text-xs text-slate-450 mt-0.5">Top-visited spots witnessing major traveler engagement reviews this week</p>
                </div>
              </div>

              <UniversalCarousel
                items={trendingAttractions.slice(0, 10)}
                visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4 }}
                autoPlayInterval={7400}
                renderItem={(item) => (
                  <div 
                    key={item.id} 
                    className="w-full shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-805 overflow-hidden flex flex-col justify-between group shadow-3xs h-[340px]"
                  >
                    <div className="relative h-44 w-full overflow-hidden shrink-0">
                      <img 
                        src={safeSrc(item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md font-mono">
                        Trending
                      </span>
                    </div>
                    <div className="p-4 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-slate-450 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>
                      <button 
                        onClick={() => {
                          navigate(`#/attraction/${getItemSlug(item)}`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-250 font-extrabold text-[10px] py-2.5 rounded-xl cursor-pointer transition uppercase tracking-wider leading-none mt-4"
                      >
                        Explore Spot ➔
                      </button>
                    </div>
                  </div>
                )}
              />
            </div>
          )}

        </section>

      </main>

      {/* 13. PHOTO UPLOAD MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
          >
            {/* Backdrop Closer */}
            <div 
              className="absolute inset-0 cursor-default" 
              onClick={() => {
                setShowUploadModal(false);
                setUploadFile(null);
                setUploadPreviewUrl('');
                setUploadCaption('');
                setPhotoUploadError('');
                setPhotoUploadSuccessMessage('');
              }} 
            />

            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-left space-y-6 shadow-2xl z-10 overflow-hidden animate-fade-in"
            >
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadPreviewUrl('');
                  setUploadCaption('');
                  setPhotoUploadError('');
                  setPhotoUploadSuccessMessage('');
                }}
                className="absolute top-4 right-4 z-20 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 p-2 rounded-full transition cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600 animate-pulse" /> Upload Traveler Photo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Share your local sightseeing shots from {attraction.name} with the community.</p>
              </div>

              {photoUploadSuccessMessage ? (
                /* Success View */
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-6 rounded-2xl text-center space-y-4 animate-fade-in">
                  <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300">Upload Complete!</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{photoUploadSuccessMessage}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setPhotoUploadSuccessMessage('');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl cursor-pointer transition uppercase tracking-wider"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Upload Form */
                <form onSubmit={handlePhotoUploadSubmit} className="space-y-5">
                  
                  {/* File Dropzone */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => uploadFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      dragActive 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={uploadFileInputRef}
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                    />

                    {uploadPreviewUrl ? (
                      <div className="flex flex-col items-center gap-3">
                        <img 
                          src={uploadPreviewUrl} 
                          alt="Pre-upload preview" 
                          className="w-40 h-28 rounded-xl object-cover border border-emerald-400 shadow-sm" 
                        />
                        <div>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">✓ Photo Selected Successfully</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate max-w-xs mx-auto mt-0.5 font-mono">File: {uploadFile?.name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-650 mx-auto" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Drag & drop your scenic photo here, or <span className="text-emerald-600 dark:text-emerald-400 underline">browse computer</span>
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          Supports JPEG, PNG, JPG, or WebP up to 10MB limit.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Caption Input */}
                  {uploadPreviewUrl && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Image Caption / Title *</label>
                      <input 
                        type="text"
                        required
                        value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        placeholder="e.g. Magnificent sunset from the view-point"
                        className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-slate-850 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Error Message */}
                  {photoUploadError && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3 rounded-xl">
                      ⚠️ {photoUploadError}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadFile(null);
                        setUploadPreviewUrl('');
                        setUploadCaption('');
                        setPhotoUploadError('');
                      }}
                      className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-extrabold transition cursor-pointer text-center uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    
                    <button 
                      type="submit"
                      disabled={isUploadingPhoto || !uploadFile}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 disabled:opacity-50 uppercase tracking-wider font-mono"
                    >
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          {isAdmin ? 'Publish Direct ➔' : 'Submit Photo ➔'}
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
