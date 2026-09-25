import React, { useState, useEffect } from 'react';
import SEOBreadcrumbs from './SEOBreadcrumbs';
import { WiDaySunny, WiRain, WiSnow } from 'weather-icons-react';
import { motion } from 'motion/react';
import { formatHillytripFare } from '../utils/fareFormatter';
import { stripMarkdownToPlainText } from '../utils/stringUtils';
import { 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Compass, 
  Sparkles, 
  Home, 
  ChevronUp, 
  ChevronDown,
  Loader2,
  X,
  Camera,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Globe,
  Calendar,
  Clock,
  ZoomIn,
  Mountain,
  Maximize2
} from 'lucide-react';
import { DEFAULT_HOMESTAY_IMAGE } from '../constants';
import { TravelerReviewsSection } from './TravelerReviewsSection';
import CommentsSection from './CommentsSection';
import { compressAndConvertToWebP } from '../utils/imageOptimizer';
import { getItemSlug } from '../utils/slug';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { ProgressiveImage } from './ProgressiveImage';
import { UniversalNearbySection } from './location/UniversalNearbySection';
import { resolveVillageImage } from '../utils/imagePool';
import { useNearbyEntities } from '../hooks/useNearbyEntities';
import { formatDistanceKm, findNearbyEntities, isValidGeoCoordinate, resolveCanonicalCoordinates } from '../services/geoProximityService';
import { CANONICAL_TAXI_STANDS } from '../data/canonicalTaxiStands';
import { InteractiveImageZoomViewer } from './InteractiveImageZoomViewer';
import { uploadImageToFirebase } from '../utils/firebase';
import { hillyTripFetch } from '../utils/apiInterceptor';
import { UniversalCarousel } from './UniversalCarousel';
import { FiveDayForecast } from './FiveDayForecast';
import { UnclaimedBadge } from './UnclaimedBadgeAndStrip';
import ClaimModal from './ClaimModal';
import DirectBookingModal from './DirectBookingModal';
import { isListingVerified, subscribeClaimSystem } from '../lib/claimSystem';
import { 
  WeatherAnimationsStyle, SunraysAnimation, RainAnimation, SnowAnimation, 
  FogAnimation, NightAnimation, ThunderstormAnimation, CloudsAnimation, 
  getHubCoords, mapWMOCodeToTheme, weatherConfigs 
} from './WeatherEngine';

// Types
interface BreadcrumbItem {
  name: string;
  path: string;
}

interface DestinationDetailFlowProps {
  activeDestDetail: {
    destination: any;
    attractions: any[];
    homestays: any[];
    routes: any[];
  };
  hubs: any[];
  allDestinations?: any[];
  allAttractions?: any[];
  allHomestays?: any[];
  user: any;
  isAdmin: boolean;
  likes: any[];
  comments: any[];
  reviews: any[];
  activePhotos: any[];
  setActivePhotos: React.Dispatch<React.SetStateAction<any[]>>;
  setNotification: (notif: { type: 'success' | 'error'; message: string }) => void;
  toggleLike: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  addCommentAction: (contentId: string, contentType: 'destination' | 'attraction' | 'photo', text: string) => Promise<void>;
  deleteCommentAction: (commentId: string) => Promise<void>;
  addReviewAction: (destinationId: string, rating: number, title: string, content: string, visitDate: string, recommends: boolean) => Promise<void>;
  deleteReviewAction: (reviewId: string) => Promise<void>;
  handleToggleSave: (id: string, type: string) => void;
  isItemSaved: (id: string) => boolean;
  handleUserLogin: () => void;
  executeProtectedAction?: (actionName: string, actionCallback: () => void, requiresVerification?: boolean) => void;
  currentPath: string;
  navigate: (path: string) => void;
}

const toSlug = (text: any): string => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const safeSrc = (urlOrDest?: any, fallback?: string) => {
  if (urlOrDest && typeof urlOrDest === 'object') {
    return resolveVillageImage(urlOrDest);
  }
  const url = typeof urlOrDest === 'string' ? urlOrDest : '';
  if (!url || url.trim() === '' || url.includes('placeholder') || url === 'null' || url === 'undefined') {
    return resolveVillageImage(fallback || 'Scenic Himalayan Village');
  }
  return resolveVillageImage(url);
};

export const DestinationDetailFlow: React.FC<DestinationDetailFlowProps> = ({
  activeDestDetail,
  hubs,
  allDestinations,
  allAttractions,
  allHomestays,
  user,
  isAdmin,
  likes,
  comments,
  reviews,
  activePhotos,
  setActivePhotos,
  setNotification,
  toggleLike,
  addCommentAction,
  deleteCommentAction,
  addReviewAction,
  deleteReviewAction,
  handleToggleSave,
  isItemSaved,
  handleUserLogin,
  executeProtectedAction,
  currentPath,
  navigate,
}) => {
  const destination = activeDestDetail?.destination;

  const safeLikes = Array.isArray(likes) ? likes : [];
  const safeComments = Array.isArray(comments) ? comments : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeActivePhotos = Array.isArray(activePhotos) ? activePhotos : [];
  const safeHubs = Array.isArray(hubs) ? hubs : [];
  const attractions = Array.isArray(activeDestDetail?.attractions) ? activeDestDetail.attractions : [];
  const homestays = Array.isArray(activeDestDetail?.homestays) ? activeDestDetail.homestays : [];
  const routes = Array.isArray(activeDestDetail?.routes) ? activeDestDetail.routes : [];
  const effectiveHubs = safeHubs.length > 0 ? safeHubs : CANONICAL_TAXI_STANDS;

  const destCoords = React.useMemo(() => {
    if (destination?.latitude != null && destination?.longitude != null && isValidGeoCoordinate(destination.latitude, destination.longitude)) {
      return { lat: Number(destination.latitude), lng: Number(destination.longitude) };
    }
    return resolveCanonicalCoordinates(destination?.id || destination?.name, destination?.name, destination?.district);
  }, [destination]);

  const effectiveDestLat = destCoords?.lat ?? (destination?.latitude != null ? Number(destination.latitude) : undefined);
  const effectiveDestLng = destCoords?.lng ?? (destination?.longitude != null ? Number(destination.longitude) : undefined);

  // Live Universal Geo-Based Proximity from Village Coordinates (Live Supabase + Haversine)
  const {
    attractions: geoAttractionsResults,
    homestays: geoHomestaysResults,
    taxiStands: geoTaxiStandsResults,
    isLoading: isGeoNearbyLoading
  } = useNearbyEntities({
    latitude: effectiveDestLat,
    longitude: effectiveDestLng,
    entityType: 'village',
    entityId: destination?.id,
    initialRadiusKm: 25,
    limit: 48,
    fallbackItems: {
      villages: allDestinations,
      attractions: allAttractions,
      homestays: allHomestays,
      taxiStands: effectiveHubs
    }
  });

  const [attractionsBatchLimit, setAttractionsBatchLimit] = useState(12);
  const [homestaysBatchLimit, setHomestaysBatchLimit] = useState(12);
  const [transitBatchLimit, setTransitBatchLimit] = useState(12);

  const fallbackAttractions = React.useMemo(() => {
    if (attractions.length > 0) return attractions;
    if (destination?.latitude != null && destination?.longitude != null && allAttractions && allAttractions.length > 0) {
      return findNearbyEntities(Number(destination.latitude), Number(destination.longitude), allAttractions, { maxRadiusKm: 25, limit: 36 })
        .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
    }
    return [];
  }, [attractions, destination?.latitude, destination?.longitude, allAttractions]);

  const fallbackHomestays = React.useMemo(() => {
    if (homestays.length > 0) return homestays;
    if (destination?.latitude != null && destination?.longitude != null && allHomestays && allHomestays.length > 0) {
      return findNearbyEntities(Number(destination.latitude), Number(destination.longitude), allHomestays, { maxRadiusKm: 25, limit: 36 })
        .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
    }
    return [];
  }, [homestays, destination?.latitude, destination?.longitude, allHomestays]);

  const fallbackTaxiStands = React.useMemo(() => {
    const rawStands = Array.isArray((activeDestDetail as any)?.taxi_stands) ? (activeDestDetail as any).taxi_stands : [];
    if (rawStands.length > 0) return rawStands;
    if (destination?.latitude != null && destination?.longitude != null && safeHubs && safeHubs.length > 0) {
      return findNearbyEntities(Number(destination.latitude), Number(destination.longitude), safeHubs, { maxRadiusKm: 35, limit: 36 })
        .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
    }
    return [];
  }, [activeDestDetail, destination?.latitude, destination?.longitude, safeHubs]);

  const displayedAttractions = geoAttractionsResults.length > 0
    ? geoAttractionsResults.map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }))
    : fallbackAttractions;

  const displayedHomestays = geoHomestaysResults.length > 0
    ? geoHomestaysResults.map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }))
    : fallbackHomestays;

  const displayedTaxiStands = geoTaxiStandsResults.length > 0
    ? geoTaxiStandsResults.map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }))
    : fallbackTaxiStands;

  // Claim Modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimModalListing, setClaimModalListing] = useState<any | null>(null);
  const [claimSourceTarget, setClaimSourceTarget] = useState<any>('Destination Detail');
  const [, setClaimTick] = useState(0);

  // Direct Booking Modal state
  const [directBookingHomestay, setDirectBookingHomestay] = useState<any | null>(null);
  const [directBookingModalOpen, setDirectBookingModalOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeClaimSystem(() => setClaimTick(prev => prev + 1));
    return () => unsub();
  }, []);

  const handleOpenClaim = (item: any, source: any = 'Destination Detail') => {
    setClaimModalListing(item);
    setClaimSourceTarget(source);
    setClaimModalOpen(true);
  };

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

  const [destAttractionsExpanded, setDestAttractionsExpanded] = useState(false);
  const [selectedPhotoForViewer, setSelectedPhotoForViewer] = useState<any | null>(null);
  const [localPhotoCommentText, setLocalPhotoCommentText] = useState('');
  const [activeMomentsTab, setActiveMomentsTab] = useState<'liked' | 'latest' | 'popular'>('liked');
  const [destLodgingExpanded, setDestLodgingExpanded] = useState(false);
  const [destTransitExpanded, setDestTransitExpanded] = useState(false);
  const [destCommentsExpanded, setDestCommentsExpanded] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [relatedGuides, setRelatedGuides] = useState<any[]>([]);

  // Deferred secondary content loading for instant initial paint
  const [isSecondaryLoaded, setIsSecondaryLoaded] = useState(false);

  useEffect(() => {
    setIsSecondaryLoaded(false);
    
    // Preload Hero Image
    if (destination?.image) {
      const img = new Image();
      img.src = safeSrc(destination.image);
    }

    // Schedule secondary component mounting immediately after initial frame render
    const timer = setTimeout(() => {
      setIsSecondaryLoaded(true);
    }, 10);

    return () => clearTimeout(timer);
  }, [destination?.id, destination?.image]);

  // Live Weather & Climate State
  const [weatherTheme, setWeatherTheme] = useState<string>('sunny');
  const [weatherData, setWeatherData] = useState<{ temp: number; humidity: string; visibility: string } | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    const destId = activeDestDetail?.destination?.id || '';
    if (!destId) return;

    const cacheKey = `hillytrip_dest_weather_cache_${destId.toLowerCase()}`;

    const loadWeather = async () => {
      setIsLoadingWeather(true);
      try {
        let lat = activeDestDetail.destination.latitude;
        let lon = activeDestDetail.destination.longitude;
        
        if (!lat || !lon) {
          const coords = getHubCoords(activeDestDetail.destination.nearestHubId || activeDestDetail.destination.id);
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
            try {
              localStorage.setItem(cacheKey, JSON.stringify({ data: updatedData, theme, timestamp: Date.now() }));
            } catch (e) {
              console.warn("Unable to cache weather data due to storage limit:", e);
            }
          }
        }
      } catch (err) {
        console.error("Destination live weather fetch failed, attempting cache...", err);
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
          setWeatherData({ temp: 17, humidity: "55%", visibility: "10 km" });
          setWeatherTheme('sunny');
        }
      } finally {
        if (active) setIsLoadingWeather(false);
      }
    };

    loadWeather();
  }, [activeDestDetail?.destination]);

  useEffect(() => {
    if (activeDestDetail?.destination?.id) {
      fetch(`/api/blogs?status=Published&destinationId=${activeDestDetail.destination.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setRelatedGuides(data))
        .catch(err => console.error("Error loading related destination blogs", err));
    }
  }, [activeDestDetail?.destination?.id]);

  // Upload Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [webpBlob, setWebpBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [selectedAttractionId, setSelectedAttractionId] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

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
      setErrorMessage("Unsupported file type. Please upload a high-resolution JPEG, JPG, WebP, or PNG file.");
      setUploadStatus('error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds the 10MB size restriction. Please upload an image under 10MB.");
      setUploadStatus('error');
      return;
    }
    setSelectedFile(file);
    setUploadStatus('compressing');
    setErrorMessage('');
    try {
      const compressed = await compressAndConvertToWebP(file);
      setWebpBlob(compressed);
      const blobUrl = URL.createObjectURL(compressed);
      setPreviewUrl(blobUrl);
      setUploadStatus('idle');
      const cleanName = file.name.split('.')[0].replace(/[-_]+/g, ' ');
      setUploadCaption(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to process, scale or convert image.");
      setUploadStatus('error');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webpBlob || !selectedFile) return;
    setUploadStatus('uploading');
    try {
      const targetName = `destination_${destination.id}_${selectedFile.name.replace(/\.[^/.]+$/, "")}.webp`;
      const secureDownloadUrl = await uploadImageToFirebase(webpBlob, targetName);

      if (isAdmin) {
        const metaPayload = {
          destinationId: destination.id,
          attractionId: selectedAttractionId || null,
          url: secureDownloadUrl,
          uploadedBy: user?.displayName || user?.email || 'Registered Traveler',
          status: 'Approved',
          caption: uploadCaption.trim() || 'HillyTrip scenic view',
          altText: `Scenic traveler photo of ${destination.name} region - ${uploadCaption.trim() || 'HillyTrip scenic view'}`,
          userId: user?.uid || user?.email || 'anonymous'
        };

        const response = await hillyTripFetch('/api/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metaPayload)
        });

        if (!response.ok) {
          const errJson = await response.json();
          throw new Error(errJson.error || 'Server rejected metadata persistence.');
        }

        const resBody = await response.json();
        setUploadStatus('success');
        setNotification({
          type: 'success',
          message: 'Successfully uploaded direct-to-gallery as administrator.'
        });

        if (resBody.image) {
          setActivePhotos((prev) => [resBody.image, ...prev]);
        }
      } else {
        const metaPayload = {
          userId: user?.uid || user?.email || 'anonymous',
          travellerName: user?.displayName || user?.email || 'Registered Traveler',
          travellerEmail: user?.email || 'traveler@hillytrip.com',
          destinationId: destination.id,
          imageUrl: secureDownloadUrl,
          attractionId: selectedAttractionId || null,
          caption: uploadCaption.trim() || 'HillyTrip scenic view'
        };

        const response = await hillyTripFetch('/api/photo-contributions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metaPayload)
        });

        if (!response.ok) {
          const errJson = await response.json();
          throw new Error(errJson.error || 'Server rejected photo contribution.');
        }

        setUploadStatus('success');
        setNotification({
          type: 'success',
          message: 'Thank you! Your photo has been submitted successfully and is awaiting admin approval. It will appear after verification.'
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while saving image metadata.');
      setUploadStatus('error');
    }
  };

  const handlePhotoCommentSubmit = async (photoId: string) => {
    if (!localPhotoCommentText.trim()) return;
    try {
      await addCommentAction(photoId, 'photo', localPhotoCommentText.trim());
      setLocalPhotoCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!destination) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Destination details catalog is loading or unavailable.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-left">
      {/* SEO Breadcrumbs */}
      <SEOBreadcrumbs
        navigate={navigate}
        items={[
          { name: 'Destinations', path: '/destinations' },
          { name: destination.name, path: `/destination/${toSlug(destination.id || destination.name)}` }
        ]}
      />

      {/* 1. HERO SECTION */}
      <div id="hero-section" className="bg-white dark:bg-slate-900 pb-6 border-b border-slate-150 dark:border-slate-800">
        {/* Destination Cover Photo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div 
            onClick={() => {
              setSelectedPhotoForViewer({
                id: 'cover-photo',
                url: destination.image,
                caption: `${destination.name} - Panoramic Mountain Vista`,
                likesCount: safeLikes.filter(l => l.contentId === 'cover-photo' || l.contentId === destination.id).length,
                timestamp: 0,
                isStatic: true,
                uploadedBy: 'Official Destination Showcase',
                uploadDate: ''
              });
            }}
            className="relative w-full h-[260px] sm:h-[360px] md:h-[480px] overflow-hidden bg-slate-900 rounded-3xl shadow-lg group cursor-pointer"
            style={{
              '--weather-hero-filter': weatherConfigs[weatherTheme]?.imageFilter || 'none',
              '--weather-hero-blend-color': weatherConfigs[weatherTheme]?.overlayColor || 'transparent',
              '--weather-hero-blend-mode': weatherConfigs[weatherTheme]?.overlayBlendMode || 'normal',
            } as React.CSSProperties}
            title="Click to inspect mountain ridges and landscape details in high-res zoom"
          >
            <ProgressiveImage 
              src={safeSrc(destination.image)} 
              alt={destination.name}
              targetWidth={1200}
              isPriority={true}
              loading="eager"
              fetchPriority="high"
              containerClassName="w-full h-full"
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.02]" 
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
            {/* Dynamic Weather Overlay Gradient & Vignette */}
            <div className={`absolute inset-0 bg-gradient-to-b ${weatherConfigs[weatherTheme]?.overlayGradient || 'from-transparent via-transparent to-[#030d07]/65'} transition-all duration-700 pointer-events-none`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

            {/* Weather Overlay Animations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
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
            
            {/* Floating Back Button Overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('#/destinations');
                }}
                className="text-white bg-slate-900/70 backdrop-blur-md hover:bg-slate-900 px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition border border-white/10 shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Floating Live Weather Badge */}
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
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
                <div className="text-[8px] text-white/75 bg-slate-950/40 backdrop-blur-xs px-2.5 py-1 rounded-md font-mono flex items-center gap-2 border border-white/5 shadow-xs">
                  <span>💧 {weatherData.humidity}</span>
                  <span>👁️ {weatherData.visibility}</span>
                </div>
              )}
            </div>

            {/* Floating Inspect Mountain Details Badge / Button */}
            <div className="absolute bottom-4 right-4 z-10">
              <div className="bg-slate-900/80 hover:bg-slate-950 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-bold inline-flex items-center gap-2 border border-white/20 shadow-xl transition-all group-hover:scale-105 active:scale-95 cursor-pointer">
                <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inspect Mountain Details</span>
                <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-500/30">Zoom</span>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Header Title & Tags */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="text-2xl sm:text-3xl md:text-4xl">📍</span>
                {destination.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1.5 pl-1.5">
                <span>{destination.district || 'Hill Sub-District'}</span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400">{destination.state || 'North Bengal / Sikkim'}</span>
              </p>
              
              {/* Destination Tags */}
              <div className="flex flex-wrap gap-2 mt-2 pl-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-200/30">
                  ✨ {destination.tourismType}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 rounded-full border border-indigo-200/30">
                  📅 Peak: {destination.bestSeason}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200/30">
                  ⭐ Rating: 4.8 / 5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Engagement Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 sm:p-3 flex items-center justify-around shadow-2xs relative">
            
            {/* 1. Like Action */}
            <button
              onClick={() => toggleLike(destination.id, 'destination')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer select-none ${
                user && safeLikes.some(l => l.id === `${user.uid}_${destination.id}`)
                  ? 'text-rose-600 bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <motion.span
                animate={{ scale: (user && safeLikes.some(l => l.id === `${user.uid}_${destination.id}`)) ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <Heart className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${(user && safeLikes.some(l => l.id === `${user.uid}_${destination.id}`)) ? 'fill-rose-600 text-rose-600' : ''}`} />
              </motion.span>
              <span>
                Like <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-full ml-0.5">{safeLikes.filter(l => l.contentId === destination.id).length}</span>
              </span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 self-center" />

            {/* 2. Comment Action */}
            <button
              onClick={() => {
                setDestCommentsExpanded(true);
                setTimeout(() => {
                  document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 105);
              }}
              className="flex-1 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer select-none"
            >
              <MessageSquare className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              <span>
                Comment <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-full ml-0.5">{safeComments.filter(c => c.contentId === destination.id && c.contentType === 'destination').length}</span>
              </span>
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 self-center" />

            {/* 3. Share Action */}
            <div className="flex-1 relative flex justify-center">
              <button
                onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                className={`w-full py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer select-none ${
                  shareDropdownOpen 
                    ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Share2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                <span>Share</span>
              </button>

              {/* Dropdown Popover */}
              {shareDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShareDropdownOpen(false)} />
                  <div className="absolute top-11 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-xl w-48 text-left space-y-1.5 animate-slide-up">
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block px-2.5 pb-1 border-b border-slate-100 dark:border-slate-800">Direct Share</span>
                    
                    <button
                      onClick={() => {
                        setShareDropdownOpen(false);
                        const shareUrl = `${window.location.origin}/destination/${destination.id}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this mountain getaway ' + destination.name + ' on HillyTrip: ' + shareUrl)}`, '_blank');
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="text-sm">💬</span> WhatsApp Share
                    </button>

                    <button
                      onClick={() => {
                        setShareDropdownOpen(false);
                        const shareUrl = `${window.location.origin}/destination/${destination.id}`;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span className="text-sm">🔵</span> Facebook Share
                    </button>

                    <button
                      onClick={() => {
                        setShareDropdownOpen(false);
                        const shareUrl = `${window.location.origin}/#${currentPath}`;
                        navigator.clipboard.writeText(shareUrl);
                        setNotification({ type: 'success', message: '📋 Direct URL Copied to Clipboard!' });
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-sm">🔗</span> Copy Direct Link
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 self-center" />

            {/* 4. Save Action */}
            <button
              onClick={() => handleToggleSave(destination.id, 'destination')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer select-none ${
                isItemSaved(destination.id)
                  ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30'
                  : 'text-slate-600 dark:text-slate-305 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <motion.span
                animate={{ scale: isItemSaved(destination.id) ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <Bookmark className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${isItemSaved(destination.id) ? 'fill-emerald-700 text-emerald-700' : ''}`} />
              </motion.span>
              <span>{isItemSaved(destination.id) ? 'Saved' : 'Save'}</span>
            </button>

          </div>
        </div>
      </div>

      {/* 2. DESTINATION OVERVIEW */}
      <div id="overview-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2.5 flex items-center gap-2">
            <span className="text-lg">📖</span> Destination Overview
          </h2>
          <p className="text-slate-600 dark:text-slate-305 text-xs sm:text-sm leading-relaxed line-clamp-4">
            {(() => {
              const desc = destination.description;
              const isDescEmptyOrPlaceholder = !desc || desc.trim() === '' || desc.toLowerCase().includes('placeholder') || desc.toLowerCase().includes('null') || desc.toLowerCase().includes('undefined');
              return isDescEmptyOrPlaceholder ? 'Description coming soon.' : desc;
            })()}
          </p>
        </div>
      </div>

      {/* 3. DESTINATION QUICK STATS */}
      <div id="quick-stats-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ⭐ Reviews Card */}
          <button
            onClick={() => document.getElementById('traveler-reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs transition duration-300 cursor-pointer text-left w-full group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">⭐</span>
            <div className="min-w-0">
              <span className="block text-sm font-black text-slate-900 dark:text-white">
                4.8 Rating
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {safeReviews.filter(r => r.destinationId === destination.id).length} Traveler Reviews
              </span>
            </div>
          </button>

          {/* 🏡 Homestays Card */}
          <button
            onClick={() => document.getElementById('lodging-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs transition duration-300 cursor-pointer text-left w-full group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🏡</span>
            <div className="min-w-0">
              <span className="block text-sm font-black text-slate-900 dark:text-white">
                {homestays.length} Homestays
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Verified Hosts Section
              </span>
            </div>
          </button>

          {/* 🚖 Local Transport Card */}
          <button
            onClick={() => document.getElementById('transit-routes-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs transition duration-300 cursor-pointer text-left w-full group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🚖</span>
            <div className="min-w-0">
              <span className="block text-sm font-black text-slate-900 dark:text-white truncate">
                Taxi & Shared Jeep Access
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Local Transport
              </span>
            </div>
          </button>

          {/* 📸 Traveler Photos Card */}
          <button
            onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs transition duration-300 cursor-pointer text-left w-full group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">📸</span>
            <div className="min-w-0">
              <span className="block text-sm font-black text-slate-900 dark:text-white">
                {(Array.isArray(destination?.gallery) ? destination.gallery.length : 0) + safeActivePhotos.length} Shared Photos
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold">
                Traveler Gallery
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2b. WEATHER FORECAST */}
      <div id="forecast-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <FiveDayForecast 
          latitude={destination.latitude}
          longitude={destination.longitude}
          destinationName={destination.name}
          nearestHubId={destination.nearestHubId}
          destinationId={destination.id}
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        
        {/* 4. MUST-VISIT ATTRACTIONS */}
        <div id="attractions-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-600" /> 
                Must-Visit Attractions
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nearest mountain viewpoints and attractions dynamically calculated around {destination.name}.
              </p>
            </div>
            
            <button 
              onClick={() => setDestAttractionsExpanded(!destAttractionsExpanded)}
              className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-emerald-100 dark:border-emerald-900"
            >
              {destAttractionsExpanded ? 'Show Horizontal Swipe' : `View All Attractions (${displayedAttractions.length})`}
              {destAttractionsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {displayedAttractions.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 text-center text-slate-500 font-sans text-xs border border-slate-100 dark:border-slate-800">
              No local nature sights identified under this destination yet. 
            </div>
          ) : (
            <div className="space-y-6">
              {/* Horizontal Swipe Carousel Layout */}
              {!destAttractionsExpanded && (
                <UniversalCarousel
                  items={displayedAttractions.slice(0, attractionsBatchLimit)}
                  visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
                  autoPlayInterval={6800}
                  renderItem={(att: any) => (
                    <div 
                      key={att.id || att.attraction_id}
                      className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-emerald-500/40 transition flex flex-col h-[330px] sm:h-[360px]"
                    >
                      <div className="h-36 bg-slate-200 dark:bg-slate-900 relative shrink-0">
                        <img src={safeSrc(att.image || att.image_url)} alt={att.name || att.attraction_name} className="w-full h-full object-cover" />
                        
                        {/* Distance Badge */}
                        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-emerald-950/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/10">
                          📍 {att.distanceFormatted || (att.distanceKm ? formatDistanceKm(att.distanceKm) : 'Nearby')}
                        </span>

                        {/* Action Buttons Overlay */}
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(att.id || att.attraction_id, 'attraction');
                            }}
                            className="bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 p-1.5 rounded-full shadow-md transition hover:scale-105 cursor-pointer flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800"
                          >
                            <Heart 
                              className={`w-3 h-3 transition-colors ${
                                user && safeLikes.some(l => l.id === `${user.uid}_${att.id || att.attraction_id}`)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-slate-500'
                              }`}
                            />
                            <span className="text-[9px] font-bold">
                              {safeLikes.filter(l => l.contentId === (att.id || att.attraction_id)).length}
                            </span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/attraction/${getItemSlug(att)}`);
                            }}
                            className="bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 text-slate-705 dark:text-slate-200 p-1.5 rounded-full shadow-md transition hover:scale-105 cursor-pointer flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-500" />
                            <span className="text-[9px] font-bold text-slate-800 dark:text-slate-300">
                              {safeComments.filter(c => c.contentId === (att.id || att.attraction_id) && c.contentType === 'attraction').length}
                            </span>
                          </button>
                        </div>

                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">
                          {att.category || 'Sightseeing'}
                        </span>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div className="space-y-1">
                          <h5 className="font-bold text-base text-slate-900 dark:text-white truncate">{att.name || att.attraction_name}</h5>
                          <p className="text-slate-505 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">{att.description}</p>
                        </div>
                        <button 
                          onClick={() => navigate(`/attraction/${getItemSlug(att)}`)}
                          className="w-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold py-2 mt-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer text-center transition"
                        >
                          Explore Attraction Details
                        </button>
                      </div>
                    </div>
                  )}
                />
              )}

              {/* Grid View */}
              {destAttractionsExpanded && (
                <div className="space-y-6 animate-slide-up">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedAttractions.slice(0, attractionsBatchLimit).map((att) => (
                      <div key={att.id || att.attraction_id} className="bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-250 dark:border-slate-800 hover:shadow-md transition flex flex-col h-full">
                        <div className="h-44 bg-slate-200 dark:bg-slate-900 relative">
                          <img src={safeSrc(att.image || att.image_url)} alt={att.name || att.attraction_name} className="w-full h-full object-cover" />
                          
                          {/* Distance Badge */}
                          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 bg-emerald-950/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/10">
                            📍 {att.distanceFormatted || (att.distanceKm ? formatDistanceKm(att.distanceKm) : 'Nearby')}
                          </span>

                          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(att.id || att.attraction_id, 'attraction');
                              }}
                              className="bg-white/95 dark:bg-slate-900 text-slate-705 dark:text-white p-2 rounded-full shadow-md transition hover:scale-105 border border-slate-200 dark:border-slate-800 flex items-center"
                            >
                              <Heart className={`w-3.5 h-3.5 ${user && safeLikes.some(l => l.id === `${user.uid}_${att.id || att.attraction_id}`) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                              <span className="text-[10px] font-bold ml-1">{safeLikes.filter(l => l.contentId === (att.id || att.attraction_id)).length}</span>
                            </button>
                          </div>

                          <span className="absolute bottom-2.5 left-2.5 bg-slate-900/85 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-sm">
                            {att.category || 'Sightseeing'}
                          </span>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div className="space-y-2">
                            <h5 className="font-bold text-base text-slate-900 dark:text-white">{att.name || att.attraction_name}</h5>
                            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">{att.description}</p>
                          </div>
                          <button 
                            onClick={() => navigate(`/attraction/${getItemSlug(att)}`)}
                            className="w-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold py-2.5 mt-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer text-center transition"
                          >
                            Explore Attraction Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {displayedAttractions.length > attractionsBatchLimit && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setAttractionsBatchLimit(prev => prev + 12)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition shadow-xs"
                      >
                        Load More Nearby Attractions (Showing {attractionsBatchLimit} of {displayedAttractions.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-center pt-2">
                <button 
                  onClick={() => navigate('#/attractions')}
                  className="text-xs text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 font-bold underline cursor-pointer"
                >
                  Browse All Regional Sights Offline Directory &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. TRAVELER MOMENTS */}
        {(() => {
          const destinationGallery = Array.isArray(destination?.gallery) ? destination.gallery : [];
          const destinationActivePhotos = safeActivePhotos.filter(photo => photo.destinationId === destination.id && photo.status === 'Approved');
          const allPhotosForMoments = [
            ...(destination.image ? [{
              id: 'cover-photo',
              url: destination.image,
              caption: `${destination.name} - Panoramic Mountain Vista`,
              likesCount: safeLikes.filter(l => l.contentId === 'cover-photo' || l.contentId === destination.id).length,
              timestamp: 0,
              isStatic: true,
              uploadedBy: 'Official Destination Showcase',
              uploadDate: ''
            }] : []),
            ...destinationGallery.filter((imgUrl: string) => imgUrl !== destination.image).map((imgUrl: string, idx: number) => ({
              id: `static-${idx}`,
              url: imgUrl,
              caption: 'Official Showcase View',
              likesCount: safeLikes.filter(l => l.contentId === `static-${idx}`).length,
              timestamp: 0,
              isStatic: true,
              uploadedBy: 'HillyTrip Guides',
              uploadDate: ''
            })),
            ...destinationActivePhotos.map(photo => ({
              id: photo.id,
              url: photo.url,
              caption: photo.caption || 'Traveler Share',
              likesCount: safeLikes.filter(l => l.contentId === photo.id).length,
              timestamp: new Date(photo.uploadDate).getTime(),
              isStatic: false,
              uploadedBy: photo.uploadedBy || 'Registered Traveler',
              uploadDate: photo.uploadDate
            }))
          ];

          const getTabPhotos = () => {
            if (activeMomentsTab === 'liked') {
              return [...allPhotosForMoments].sort((a, b) => b.likesCount - a.likesCount);
            } else if (activeMomentsTab === 'latest') {
              return [...allPhotosForMoments].sort((a, b) => b.timestamp - a.timestamp);
            } else {
              // Popular: sorted by combinations of likes and comments count
              return [...allPhotosForMoments].sort((a, b) => {
                const aComments = safeComments.filter(c => c.contentId === a.id && c.contentType === 'photo').length;
                const bComments = safeComments.filter(c => c.contentId === b.id && c.contentType === 'photo').length;
                return (b.likesCount + bComments) - (a.likesCount + aComments);
              });
            }
          };

          return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800" id="traveler-moments-section">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono">
                      📸 SHARE THE ADVENTURE
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Traveler Moments
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real photos shared by travelers who visited this destination.
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-3">
                  {/* Filter Tabs */}
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/55 dark:border-slate-800 text-[11px]">
                    <button
                      onClick={() => setActiveMomentsTab('liked')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        activeMomentsTab === 'liked'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Most Liked
                    </button>
                    <button
                      onClick={() => setActiveMomentsTab('latest')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        activeMomentsTab === 'latest'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => setActiveMomentsTab('popular')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                        activeMomentsTab === 'popular'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Popular
                    </button>
                  </div>

                  {/* Upload button top right */}
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              </div>

              {getTabPhotos().length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                  <Camera className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No traveler photos yet.
                  </p>
                  <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 mb-4">
                    Be the first traveler to share your experience.
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              ) : (
                <UniversalCarousel
                  items={getTabPhotos()}
                  visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4 }}
                  autoPlayInterval={7500}
                  renderItem={(photo, index) => {
                    const cardLikesCount = safeLikes.filter(l => l.contentId === photo.id).length;
                    const cardCommentsCount = safeComments.filter(c => c.contentId === photo.id && c.contentType === 'photo').length;
                    const isCardLikedByMe = user && safeLikes.some(l => l.id === `${user.uid}_${photo.id}`);

                    return (
                      <div
                        key={photo.id || index}
                        onClick={() => setSelectedPhotoForViewer(photo)}
                        className="w-full shrink-0 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-md transition duration-300 cursor-pointer group flex flex-col h-[280px]"
                      >
                        <div className="h-40 bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                          <img
                            src={safeSrc(photo.url)}
                            alt={photo.caption}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <div className="p-3 flex-grow flex flex-col justify-between space-y-2">
                          <p className="text-xs font-bold text-slate-850 dark:text-slate-200 line-clamp-1">
                            {photo.caption}
                          </p>

                          {/* Engagement indicators */}
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800/40 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(photo.id, 'photo');
                              }}
                              className={`flex items-center gap-1 transition ${
                                isCardLikedByMe ? 'text-rose-600' : 'hover:text-rose-600'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isCardLikedByMe ? 'fill-rose-600 text-rose-600' : ''}`} />
                              <span>{cardLikesCount}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                              <span>{cardCommentsCount}</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const shareUrl = `${window.location.origin}/#${currentPath}`;
                                navigator.clipboard.writeText(shareUrl);
                                setNotification({ type: 'success', message: '📋 Image link copied! Share with friends!' });
                              }}
                              className="hover:text-indigo-600 transition p-1"
                              title="Copy Link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              )}

              {/* Upload Traveler Photo Modal */}
              {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className="absolute inset-0" onClick={() => { if (uploadStatus !== 'compressing' && uploadStatus !== 'uploading') setIsUploadModalOpen(false); }} />
                  <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-850 z-10 animate-scale-in">
                    <button 
                      onClick={() => setIsUploadModalOpen(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                      📷 Upload Traveler Moment
                    </h3>

                    {!user ? (
                      <div className="text-center py-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          You need to be signed in to share traveler photos.
                        </p>
                        <button 
                          onClick={() => {
                            setIsUploadModalOpen(false);
                            handleUserLogin();
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Sign In with Google
                        </button>
                      </div>
                    ) : uploadStatus === 'success' ? (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                          ✓
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">Submission Received</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                          {isAdmin 
                            ? "Successfully uploaded direct-to-gallery as administrator." 
                            : "Thank you! Your photo has been submitted successfully and is awaiting admin approval. It will appear after verification."}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setWebpBlob(null);
                            setUploadCaption('');
                            setSelectedAttractionId('');
                            setPreviewUrl('');
                            setIsUploadModalOpen(false);
                            setUploadStatus('idle');
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Close Window
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleUploadSubmit} className="space-y-4">
                        {/* Drag & Drop Zone */}
                        <div 
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('modal-file-input')?.click()}
                          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                            dragActive 
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                              : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-850/50'
                          }`}
                        >
                          <input 
                            type="file"
                            id="modal-file-input"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png,.webp"
                          />
                          
                          {previewUrl ? (
                            <div className="flex flex-col items-center gap-3">
                              <img src={previewUrl} alt="WebP preview" className="w-36 h-24 rounded-xl object-cover border-2 border-emerald-400 shadow-sm" />
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">✓ Photo Processed Successfully</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate max-w-xs mx-auto">File: {selectedFile?.name}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Drag & drop your scenic photo here, or <span className="text-emerald-650 dark:text-emerald-400 underline">browse folders</span>
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-550">
                                Supports JPEG, PNG, or WebP up to 10MB limit.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Caption Input */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Caption (Optional)</label>
                          <input 
                            type="text"
                            value={uploadCaption}
                            onChange={(e) => setUploadCaption(e.target.value)}
                            placeholder="e.g. Majestic peak views of Sandakphu sunrise"
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        {/* Attraction Association Dropdown (Optional) */}
                        {activeDestDetail?.attractions?.length > 0 && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Associate with Attraction (Optional)</label>
                            <select
                              value={selectedAttractionId}
                              onChange={(e) => setSelectedAttractionId(e.target.value)}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-bold cursor-pointer"
                            >
                              <option value="">Destination Only</option>
                              {activeDestDetail.attractions.map((attr: any) => (
                                <option key={attr.id} value={attr.id}>
                                  ⭐ {attr.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Loading States */}
                        {uploadStatus === 'compressing' && (
                          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/20">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            <span>Optimizing image format for faster loading...</span>
                          </div>
                        )}

                        {uploadStatus === 'uploading' && (
                          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/20">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            <span>Uploading to Firebase Cloud Storage...</span>
                          </div>
                        )}

                        {errorMessage && (
                          <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-200/20">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span>{errorMessage}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2.5 pt-2">
                          <button 
                            type="button"
                            disabled={uploadStatus === 'compressing' || uploadStatus === 'uploading'}
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl('');
                              setUploadCaption('');
                              setSelectedAttractionId('');
                              setUploadStatus('idle');
                              setErrorMessage('');
                              setIsUploadModalOpen(false);
                            }}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            disabled={!previewUrl || uploadStatus === 'compressing' || uploadStatus === 'uploading'}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            {(uploadStatus === 'compressing' || uploadStatus === 'uploading') && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Submit Photo
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Lightbox / Photo Viewer Modal */}
              {selectedPhotoForViewer && (() => {
                const viewerIndex = allPhotosForMoments.findIndex(item => item.url === selectedPhotoForViewer.url);
                const hasNext = viewerIndex !== -1 && viewerIndex < allPhotosForMoments.length - 1;
                const hasPrev = viewerIndex !== -1 && viewerIndex > 0;

                const navigateNext = () => {
                  if (hasNext) setSelectedPhotoForViewer(allPhotosForMoments[viewerIndex + 1]);
                };

                const navigatePrev = () => {
                  if (hasPrev) setSelectedPhotoForViewer(allPhotosForMoments[viewerIndex - 1]);
                };

                const photoLikesCount = safeLikes.filter(l => l.contentId === selectedPhotoForViewer.id).length;
                const isPhotoLikedByMe = user && safeLikes.some(l => l.id === `${user.uid}_${selectedPhotoForViewer.id}`);

                const photoComments = safeComments.filter(c => c.contentId === selectedPhotoForViewer.id && c.contentType === 'photo');

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in text-left">
                    <div className="absolute inset-0" onClick={() => setSelectedPhotoForViewer(null)} />
                    
                    <div className="relative w-full max-w-5xl xl:max-w-6xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] z-10 border border-slate-200 dark:border-slate-800">
                      <button 
                        onClick={() => setSelectedPhotoForViewer(null)}
                        className="absolute top-4 right-4 z-40 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full transition shadow-md flex items-center justify-center cursor-pointer"
                        title="Close Inspector (Esc)"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {/* Left Side: Interactive Mountain Detail Zoom & Pan Viewer */}
                      <InteractiveImageZoomViewer
                        url={selectedPhotoForViewer.url}
                        caption={selectedPhotoForViewer.caption}
                        onNext={navigateNext}
                        onPrev={navigatePrev}
                        hasNext={hasNext}
                        hasPrev={hasPrev}
                        index={viewerIndex}
                        total={allPhotosForMoments.length}
                        maxZoom={4.5}
                        minZoom={1.0}
                        showMinimap={true}
                        showControls={true}
                      />

                      {/* Right Side: Photo Details, Meta, Comments */}
                      <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 max-h-[45vh] md:max-h-none">
                        <div className="space-y-4 text-left">
                          <div>
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1 font-mono">
                              📸 TRAVELER MOMENT
                            </span>
                            <h4 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                              {selectedPhotoForViewer.caption}
                            </h4>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                              <span className="text-sm">📍</span>
                              <span>Destination:</span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-black">{destination.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                              <span>👤</span>
                              <span>Uploaded By:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">{selectedPhotoForViewer.uploadedBy}</span>
                            </div>
                            {selectedPhotoForViewer.uploadDate && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <span>📅</span>
                                <span>Date:</span>
                                <span>{new Date(selectedPhotoForViewer.uploadDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Engagement: Like & Share */}
                          <div className="flex items-center justify-between border-y border-slate-100 dark:border-slate-800/80 py-3.5">
                            <button
                              onClick={() => toggleLike(selectedPhotoForViewer.id, 'photo')}
                              className={`flex items-center gap-1.5 font-bold text-xs cursor-pointer select-none ${
                                isPhotoLikedByMe ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isPhotoLikedByMe ? 'fill-rose-600 text-rose-600' : ''}`} />
                              <span>Like ({photoLikesCount})</span>
                            </button>

                            <button
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/#${currentPath}`;
                                navigator.clipboard.writeText(shareUrl);
                                setNotification({ type: 'success', message: '📋 Image link copied! Share with friends!' });
                              }}
                              className="flex items-center gap-1.5 text-slate-550 dark:text-slate-400 hover:text-indigo-600 text-xs font-bold cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                          </div>

                          {/* Comments list */}
                          <div className="space-y-3 pt-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-mono">
                              Comments ({photoComments.length})
                            </span>

                            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                              {photoComments.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No comments on this photo yet.</p>
                              ) : (
                                photoComments.map(c => (
                                  <div key={c.id} className="text-xs border-b border-slate-100 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{c.userName}</span>
                                      {((user && user.uid === c.userId) || isAdmin) && (
                                        <button
                                          onClick={() => deleteCommentAction(c.id)}
                                          className="text-[9px] text-red-500 hover:text-red-650 cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                    <p className="text-slate-650 dark:text-slate-400 font-sans mt-0.5">{c.text}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Comment Input */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40">
                              {user ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={localPhotoCommentText}
                                    onChange={(e) => setLocalPhotoCommentText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handlePhotoCommentSubmit(selectedPhotoForViewer.id);
                                      }
                                    }}
                                    className="flex-grow text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 dark:text-white focus:outline-none focus:border-emerald-500"
                                  />
                                  <button
                                    onClick={() => handlePhotoCommentSubmit(selectedPhotoForViewer.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 rounded-xl transition cursor-pointer"
                                  >
                                    Post
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 text-center">
                                  🔐 <button onClick={() => { setSelectedPhotoForViewer(null); handleUserLogin(); }} className="text-emerald-650 dark:text-emerald-400 font-bold hover:underline cursor-pointer">Sign in to comment</button>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* 6. POPULAR LOCAL TRANSIT */}
        <div id="transit-routes-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                🗺️ Popular Transit Connections
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nearest mountain taxi stands and major transit hubs connecting {destination.name}.
              </p>
            </div>

            <button 
              onClick={() => setDestTransitExpanded(!destTransitExpanded)}
              className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-emerald-100 dark:border-emerald-900"
            >
              {destTransitExpanded ? 'Show Nearest Only' : `View All Transit Stands (${displayedTaxiStands.length > 0 ? displayedTaxiStands.length : routes.length})`}
              {destTransitExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {displayedTaxiStands.length === 0 && routes.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6 bg-slate-50 dark:bg-slate-950 rounded-2xl">
              No direct transit points cataloged under this immediate village.
            </p>
          ) : (
            <div className="space-y-3">
              {displayedTaxiStands.length > 0 ? (
                // Display Live Geo Proximity Taxi Stands: Nearest first, followed by Major Hubs
                <div className="space-y-3">
                  {(destTransitExpanded ? displayedTaxiStands.slice(0, transitBatchLimit) : displayedTaxiStands.slice(0, 4)).map((stand: any, idx: number) => {
                    const isMajor = stand.is_major || stand.taxi_type === 'major' || stand.category === 'hub';
                    const standName = stand.taxi_stand_name || stand.name || 'Himalayan Taxi Stand';
                    const standLocation = stand.location || stand.village_name || stand.district || 'Hill Station';
                    const standPhone = stand.contact_number || stand.contact || stand.phone;

                    return (
                      <div
                        key={stand.id || stand.taxi_id || idx}
                        className="w-full bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50/50 dark:hover:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-3xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              🚕 {standName}
                            </span>
                            {/* Proximity / Major Hub Badge */}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              idx === 0 
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' 
                                : isMajor 
                                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {idx === 0 ? '📍 Nearest Stand' : isMajor ? '⭐ Major Hub' : '🚖 Local Stand'}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              📍 {stand.distanceFormatted || (stand.distanceKm ? formatDistanceKm(stand.distanceKm) : 'Connecting Hub')}
                            </span>
                          </div>

                          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap text-[11px]">
                            <span>📍 Location: {standLocation}</span>
                            <span>•</span>
                            <span>🚙 Bolero 4x4 • Tata Sumo • Hill Cabs</span>
                            <span>•</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">🛡️ HillyTrip Verified</span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => {
                              navigate(`#/?fromHub=${stand.id || stand.taxi_id || ''}`);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <span>Check Shared Cabs</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {!destTransitExpanded && displayedTaxiStands.length > 4 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setDestTransitExpanded(true)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        + View {displayedTaxiStands.length - 4} more nearby transit connections
                      </button>
                    </div>
                  )}

                  {destTransitExpanded && displayedTaxiStands.length > transitBatchLimit && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setTransitBatchLimit(prev => prev + 12)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition"
                      >
                        Load More Stands (Showing {transitBatchLimit} of {displayedTaxiStands.length})
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Fallback to routes
                (destTransitExpanded ? routes : routes.slice(0, 2)).map((rt) => {
                  const fromH = safeHubs.find(h => h && h.id === rt.fromHubId);
                  const toH = safeHubs.find(h => h && h.id === rt.toHubId);
                  const pathArr = Array.isArray(rt.path) ? rt.path : (typeof rt.path === 'string' && rt.path ? [rt.path] : []);
                  const fareData = formatHillytripFare(rt);
                  return (
                    <button
                      key={rt.id}
                      onClick={() => {
                        const fromName = fromH?.name || rt.fromHubId;
                        const toName = toH?.name || rt.toHubId;
                        navigate(`#/taxi?from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}`);
                      }}
                      className="w-full text-left bg-slate-50 dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer shadow-3xs"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-white block">
                          {fromH?.name?.split(' (')[0] || 'Hub'} &mdash;&mdash;&gt; {toH?.name?.split(' (')[0] || 'Destination'}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                          🚗 {rt.type || 'Cab/Taxi'} transport • {pathArr.length} station stops {pathArr.length > 0 ? `• Route Via ${pathArr.slice(0, 3).join(', ')}` : ''}
                        </span>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold block text-sm sm:text-base">
                          {fareData.hasPrice ? fareData.avgFareText : 'Get Fare →'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                          {fareData.hasPrice ? 'Avg fare' : 'Live Check'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 7. HOMESTAY BOOKING & ACCOMMODATION */}
        <div id="lodging-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-600" />
                Regional Lodging & Homestays
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified homestays and mountain rooms nearest to {destination.name}.
              </p>
            </div>

            <button 
              onClick={() => setDestLodgingExpanded(!destLodgingExpanded)}
              className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-emerald-100 dark:border-emerald-900"
            >
              {destLodgingExpanded ? 'Show Horizontal Swipe' : `View All Homestays (${displayedHomestays.length})`}
              {destLodgingExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {displayedHomestays.length === 0 ? (
            <div className="text-slate-405 text-xs text-center py-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
              No homestays currently cataloged in this immediate area.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Swipeable Horizontal View */}
              {!destLodgingExpanded && (
                <UniversalCarousel
                  items={displayedHomestays.slice(0, homestaysBatchLimit)}
                  visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 3 }}
                  autoPlayInterval={7800}
                  renderItem={(home: any) => (
                    <div 
                      key={home.id || home.homestay_id}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-200 transition-all shadow-2xs space-y-3.5 h-[430px] sm:h-[450px]"
                    >
                      {/* Homestay Image */}
                      <div className="h-36 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative shrink-0">
                        <img 
                          src={home.images && home.images.length > 0 ? safeSrc(home.images[0]) : DEFAULT_HOMESTAY_IMAGE} 
                          alt={home.name || home.homestay_name} 
                          className="w-full h-full object-cover" 
                        />
                        {/* Distance Badge */}
                        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 bg-emerald-950/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/10">
                          📍 {home.distanceFormatted || (home.distanceKm ? formatDistanceKm(home.distanceKm) : 'Nearby')}
                        </span>
                        <div className="absolute bottom-2 left-2 z-10">
                          <UnclaimedBadge 
                            listing={home} 
                            onClaimClick={(e) => {
                              e?.stopPropagation();
                              handleOpenClaim(home, 'Destination Detail Homestays');
                            }} 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-heavy text-base text-slate-900 dark:text-white truncate">{home.name || home.homestay_name}</h5>
                        
                        <p className="text-emerald-800 dark:text-emerald-400 text-sm font-black font-mono">
                          ₹{home.priceMin || home.price_min || '1,200'} - ₹{home.priceMax || home.price_max || '2,500'} <span className="text-[10px] text-slate-500 font-medium font-sans">/ day</span>
                        </p>

                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-0.5">
                          <span className="font-medium">Direct Booking:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-[10px] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                            Instant Confirmation
                          </span>
                        </div>
                      </div>

                      {/* Availability Calendar Component */}
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-150 dark:border-slate-800">
                        <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400 dark:text-slate-500 block mb-1">
                          Host Availability Status
                        </span>
                        <div className="flex gap-1 justify-between">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                            const isBooked = idx === 1 || idx === 4;
                            return (
                              <div key={idx} className="text-center flex-1">
                                <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-mono">{day}</span>
                                <span className={`block text-[9px] py-0.5 rounded mt-0.5 font-bold ${isBooked ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'}`}>
                                  {isBooked ? '●' : '✓'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Direct Booking Actions */}
                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDirectBookingHomestay(home);
                            setDirectBookingModalOpen(true);
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Check Availability / Book Now</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => navigate(`#/enquire?listingType=homestay&listingId=${getItemSlug(home)}`)}
                          className="w-full py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Message on HillyTrip</span>
                        </button>
                      </div>
                    </div>
                  )}
                />
              )}

              {/* Expanded Grid View */}
              {destLodgingExpanded && (
                <div className="space-y-6 animate-slide-up">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedHomestays.slice(0, homestaysBatchLimit).map((home) => (
                      <div 
                        key={home.id || home.homestay_id}
                        className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs space-y-4"
                      >
                        {/* Homestay Image */}
                        <div className="h-44 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden relative">
                          <img 
                            src={home.images && home.images.length > 0 ? safeSrc(home.images[0]) : DEFAULT_HOMESTAY_IMAGE} 
                            alt={home.name || home.homestay_name} 
                            className="w-full h-full object-cover" 
                          />
                          {/* Distance Badge */}
                          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 bg-emerald-950/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/10">
                            📍 {home.distanceFormatted || (home.distanceKm ? formatDistanceKm(home.distanceKm) : 'Nearby')}
                          </span>
                          <span className="absolute bottom-3 left-3 bg-emerald-650 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                            ✓ VERIFIED CLEAN STAY
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-bold text-lg text-slate-900 dark:text-white">{home.name || home.homestay_name}</h5>
                          <p className="text-emerald-700 dark:text-emerald-400 font-extrabold text-base font-mono">
                            ₹{home.priceMin || home.price_min || '1,200'} - ₹{home.priceMax || home.price_max || '2,500'} <span className="text-xs text-slate-505 font-normal font-sans">/ day range</span>
                          </p>

                          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-855">
                            <p>🏡 **Amenities:** {home.amenities && home.amenities.length > 0 ? home.amenities.join(', ') : 'Organic Food, Hot Water baths, Scenic Mountain Balconies'}</p>
                            <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <span>✓ Direct Booking Model • HillyTrip Protected</span>
                            </p>
                          </div>
                        </div>

                        {/* Availability Calendar Component */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-150 dark:border-slate-800">
                          <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-slate-400 dark:text-slate-500 block mb-1">
                            Weekly Reservation Availability Calendar
                          </span>
                          <div className="flex gap-1.5 justify-between">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                              const isBooked = idx === 1 || idx === 4;
                              return (
                                <div key={idx} className="text-center flex-1">
                                  <span className="block text-[8px] text-slate-405 dark:text-slate-500 font-mono font-bold uppercase">{day}</span>
                                  <span className={`block text-xs py-1 rounded-md mt-1 font-bold ${isBooked ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'bg-emerald-50 text-emerald-705 dark:bg-emerald-950/20'}`}>
                                    {isBooked ? 'Booked' : 'Free'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Direct Booking Actions */}
                        <div className="space-y-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDirectBookingHomestay(home);
                              setDirectBookingModalOpen(true);
                            }}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Check Availability / Book Now</span>
                          </button>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`#/enquire?listingType=homestay&listingId=${getItemSlug(home)}`)}
                              className="py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Message on HillyTrip</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => navigate(`#/homestay/${getItemSlug(home)}`)}
                              className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition text-center cursor-pointer"
                            >
                              Property Details &rarr;
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {displayedHomestays.length > homestaysBatchLimit && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setHomestaysBatchLimit(prev => prev + 12)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition"
                      >
                        Load More Homestays (Showing {homestaysBatchLimit} of {displayedHomestays.length})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7.5 UNIVERSAL PROXIMITY NETWORK (Geo-Based Nearest Villages, Stays, Attractions, Taxis) */}
        <UniversalNearbySection
          latitude={effectiveDestLat}
          longitude={effectiveDestLng}
          entityType="village"
          entityId={destination.id}
          entityName={destination.name}
          fallbackItems={{
            villages: allDestinations,
            attractions: allAttractions,
            homestays: allHomestays,
            taxiStands: effectiveHubs
          }}
          onSelectAttraction={(attr) => {
            navigate(`/attraction/${getItemSlug(attr)}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectHomestay={(stay) => {
            navigate(`#/homestay/${getItemSlug(stay)}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectVillage={(v) => {
            navigate(`#/village/${v.slug || getItemSlug(v)}`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectTaxiStand={(ts) => {
            navigate(`#/taxi?from=${encodeURIComponent(ts.taxi_stand_name || ts.name)}`);
          }}
          onBookTaxi={(fromHub, toDest) => {
            navigate(`#/taxi?from=${encodeURIComponent(fromHub)}&to=${encodeURIComponent(toDest || '')}`);
          }}
        />

        {/* 8. TRAVELER REVIEWS */}
        <TravelerReviewsSection
          destinationId={destination.id}
          destinationName={destination.name}
          reviews={reviews}
          user={user}
          isAdmin={isAdmin}
          onAddReview={addReviewAction}
          onDeleteReview={deleteReviewAction}
          onLogin={handleUserLogin}
        />

        {/* 9. TRAVELER DISCUSSIONS / COMMENTS BOARD */}
        <div id="comments-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-emerald-600" /> 
                Traveler Discussion board
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Read community discussions, recent road conditions, questions, and regional tips.</p>
            </div>

            <span className="text-xs bg-slate-100 dark:bg-slate-950 text-slate-705 dark:text-slate-300 font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
              {safeComments.filter(c => c.contentId === destination.id && c.contentType === 'destination').length} Comments Added
            </span>
          </div>

          {!destCommentsExpanded ? (
            <div className="text-center py-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 p-4">
              <p className="text-xs text-slate-505 dark:text-slate-450 mb-4">
                Road closures, weather warnings, and direct driver rates shared directly by the community.
              </p>
              <button
                onClick={() => setDestCommentsExpanded(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                💬 Load & View Traveler Discussions ({safeComments.filter(c => c.contentId === destination.id && c.contentType === 'destination').length})
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              <div className="flex justify-end">
                <button
                  onClick={() => setDestCommentsExpanded(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:text-slate-205 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-750 transition font-medium cursor-pointer"
                >
                  Collapse Discussion Board
                </button>
              </div>
              
              <CommentsSection
                contentId={destination.id}
                contentType="destination"
                comments={comments}
                user={user}
                onAddComment={addCommentAction}
                onDeleteComment={deleteCommentAction}
                onLogin={handleUserLogin}
              />
            </div>
          )}
        </div>

        {/* 10. RELATED TRAVEL GUIDES SECTION */}
        {relatedGuides.length > 0 && (
          <div id="related-guides-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800 space-y-6 mt-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-sky-500" />
                  <span>Verified Travel Guides</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Read curated travel itineraries, route advice, and offbeat blogs detailing {destination.name} and vicinity.
                </p>
              </div>
              <button 
                onClick={() => navigate('#/travel-guides')}
                className="text-xs font-bold text-sky-500 hover:text-sky-600 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All Guides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedGuides.map((guide) => {
                const hasImg = guide.featuredImage && guide.featuredImage !== "Featured Image Required";
                return (
                  <div
                    key={guide.id}
                    onClick={() => navigate(`#/travel-guides/${guide.slug}`)}
                    className="group flex flex-col h-full bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 hover:border-slate-250 dark:hover:border-slate-800 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    {/* Featured Image */}
                    <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden shrink-0">
                      {hasImg ? (
                        <img 
                          src={guide.featuredImage} 
                          alt={guide.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850">
                          <Compass className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-1" />
                          <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Featured Image Required</span>
                        </div>
                      )}
                      
                      <div className="absolute top-2.5 right-2.5 bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[9px] font-bold text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{guide.readingTime} min read</span>
                      </div>
                    </div>

                    {/* Content body */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors line-clamp-2 mb-1.5 leading-snug">
                        {guide.title}
                      </h5>
                      <p className="text-[11px] text-slate-550 dark:text-slate-450 line-clamp-3 mb-3 flex-grow leading-relaxed">
                        {stripMarkdownToPlainText(guide.content).substring(0, 100).trim()}...
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-850/50 text-[10px] font-mono text-slate-400 shrink-0">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(guide.publishedAt || guide.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
                        </div>
                        <span className="text-sky-500 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* INSTANT CLAIM BUSINESS MODAL */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        listing={claimModalListing}
        claimSource={claimSourceTarget}
        onSuccessNavigate={() => navigate('#/partner')}
      />

      {/* DIRECT BOOKING MODAL */}
      <DirectBookingModal
        isOpen={directBookingModalOpen}
        onClose={() => setDirectBookingModalOpen(false)}
        homestay={directBookingHomestay}
        currentUser={null}
        navigate={navigate}
      />
    </div>
  );
};

export default DestinationDetailFlow;
