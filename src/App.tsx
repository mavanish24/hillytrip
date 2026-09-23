import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Search, ArrowRight, MapPin, Compass, Sparkles, Home, Shield, Calendar, BookOpen,
  Users, Wallet, Car, MessageCircle, AlertCircle, Camera, CheckCircle, 
  Trash2, Filter, Loader2, RefreshCw, ChevronRight, ChevronDown, ChevronUp, Info, PlusCircle, ArrowLeft,
  UploadCloud, CheckCircle2, Save, FileSpreadsheet, Plus, X, Edit2, Undo2, Zap, Bell, Heart, Share2, MessageSquare, Bookmark,
  Facebook, Instagram, Youtube, CheckSquare, Clock, Eye, Flame, Shuffle, Award, ChevronLeft, List, WifiOff,
  User as UserIcon, Activity, TrendingUp, BarChart3, Sliders, Navigation, Terminal
} from 'lucide-react';
import Navbar from './components/Navbar';
import PublicRoutes from './routes/PublicRoutes';
import ProfileRoutes from './routes/ProfileRoutes';
import TaxiRoutes from './routes/TaxiRoutes';
import BusinessRoutes from './routes/BusinessRoutes';
import CommunityRoutes from './routes/CommunityRoutes';
import AdminRoutes from './routes/AdminRoutes';
import safeLazy from './utils/safeLazy';

const UserProfileSystem = safeLazy(() => import('./components/UserProfileSystem'));
const SettingsModule = safeLazy(() => import('./components/SettingsModule'));
const BusinessModule = safeLazy(() => import('./components/BusinessModule'));
const UniversalInventoryEngineView = safeLazy(() => import('./components/UniversalInventoryEngineView'));
const BusinessOS = safeLazy(() => import('./components/BusinessOS'));
const UniversalPublicProfile = safeLazy(() => import('./components/UniversalPublicProfile'));
const PublicTravelerProfile = safeLazy(() => import('./components/PublicTravelerProfile'));
import ErrorBoundary from './components/ErrorBoundary';
import { UniversalSearch } from './components/UniversalSearch';
import { ThemeEngineProvider, PRESETS } from './components/ThemeContext';
const AdminTravelGuidesTab = safeLazy(() => import('./components/AdminTravelGuidesTab'));
const AdminHomestayManagementTab = safeLazy(() => import('./components/AdminHomestayManagementTab'));
const AdminOperationsPlatform = safeLazy(() => import('./components/admin/AdminOperationsPlatform').then(m => ({ default: m.AdminOperationsPlatform })));
const AiTravelPlannerModal = safeLazy(() => import('./components/AiTravelPlannerModal'));
const MascotAssetStudioModal = safeLazy(() => import('./components/MascotAssetStudioModal').then((m: any) => ({ default: m.MascotAssetStudioModal || m.default })));
const AIPlatformConsole = safeLazy(() => import('./components/ai/AIPlatformConsole').then(m => ({ default: m.AIPlatformConsole })));
import { ImpersonationBanner } from './components/navigation/ImpersonationBanner';
import { roleService } from './services/navigation/RoleService';
const TravellerMomentsSection = safeLazy(() => import('./components/TravellerMomentsSection').then((m: any) => ({ default: m.TravellerMomentsSection || m.default })));
import { SEED_TAXI_OPERATORS } from './data/taxiData';
import { Hub, Route, Destination, Attraction, Homestay, RouteSearchResult, TripLead, CarLead, Contribution, ImageItem, User, isHomestayPublic } from './types';
import { DEFAULT_HOMESTAY_IMAGE } from './constants';
import { getOptimizedImageUrl } from './utils/imagePool';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthStateChanged, sendPasswordResetEmail,
  collection, doc, setDoc, deleteDoc, onSnapshot,
  auth, googleSignIn, logout, uploadImageToFirebase, db, signInWithGoogleCredentials, setCachedAccessToken,
  signInWithEmailAndPassword, signUpWithEmailAndPassword, updateUserPassword
} from './utils/firebase';
import { compressAndConvertToWebP } from './utils/imageOptimizer';
import { hillyTripFetch } from './utils/apiInterceptor';
import { calculateHaversineDistanceKm } from './services/geoProximityService';
import { getPendingClaim, clearPendingClaim, claimBusinessLocally } from './lib/claimSystem';
import PWAInstallPrompt from './components/PWAInstallPrompt';
const TravelSimulationWizard = safeLazy(() => import('./components/TravelSimulationWizard'));
const PreBookingEnquiryModal = safeLazy(() => import('./components/PreBookingEnquiryModal'));
import { AnimatedLogo } from './components/AnimatedLogo';
import { SplashScreen } from './components/SplashScreen';
const HillyTripLoginPage = safeLazy(() => import('./components/HillyTripLoginPage'));
import { 
  initGA, 
  trackPageView, 
  trackRouteSearch, 
  trackDestinationView, 
  trackAttractionView, 
  trackRouteResultView, 
  trackNavigateGoogleMaps, 
  trackSaveDestination, 
  trackLikeDestination 
} from './utils/analytics';
import { saveRecentRouteSearch } from './utils/recentSearches';

// Lazily load complex/heavy components to dramatically reduce initial mobile JS payload sizes
const ImageGallerySystem = safeLazy(() => import('./components/ImageGallerySystem'));
const CommentsSection = safeLazy(() => import('./components/CommentsSection'));
const AdminNotificationsTab = safeLazy(() => import('./components/AdminNotificationsTab'));
const UniversalSearchResultsView = safeLazy(() => import('./components/search/UniversalSearchResultsView'));
const AiLocalAdvisor = safeLazy(() => import('./components/AiLocalAdvisor'));
const PartnerDashboard = safeLazy(() => import('./components/PartnerDashboard'));
const UnifiedDashboardSystem = safeLazy(() => import('./components/UnifiedDashboardSystem'));
import SEOBreadcrumbs from './components/SEOBreadcrumbs';
const OfflineTravelHub = safeLazy(() => import('./components/OfflineTravelHub'));
const ReviewCenter = safeLazy(() => import('./components/ReviewCenter'));
import { getItemSlug } from './utils/slug';
import { findNearbyEntities, isValidGeoCoordinate } from './services/geoProximityService';
const ContributorProfile = safeLazy(() => import('./components/ContributorProfile'));
const UnifiedInbox = safeLazy(() => import('./components/UnifiedInbox'));
import FloatingWhatsAppSupport from './components/FloatingWhatsAppSupport';
import { RoleGuard } from './components/navigation/RoleGuard';

const DIYItineraryPlanner = safeLazy(() => import('./components/DIYItineraryPlanner'));
const IntelligentRoutePlanner = safeLazy(() => import('./components/IntelligentRoutePlanner'));
const LiveTransitBulletin = safeLazy(() => import('./components/LiveTransitBulletin'));
const SurvivalIndex = safeLazy(() => import('./components/SurvivalIndex'));
const ExplorerBadges = safeLazy(() => import('./components/ExplorerBadges'));

const AttractionCategoriesCarousel = safeLazy(() => 
  import('./components/AttractionCategoriesCarousel').then(module => ({ default: module.default || module.AttractionCategoriesCarousel }))
);
const GlobalMapExplorer = safeLazy(() => import('./components/location/GlobalMapExplorer').then(m => ({ default: m.GlobalMapExplorer })));
const LocationAdminDashboard = safeLazy(() => import('./components/location/LocationAdminDashboard').then(m => ({ default: m.LocationAdminDashboard })));
const ContentIntelligenceHub = safeLazy(() => import('./components/content/ContentIntelligenceHub').then(m => ({ default: m.ContentIntelligenceHub })));

const fetch = hillyTripFetch;

const toSlug = (text: any): string => {
  if (text === undefined || text === null) return '';
  const str = String(text);
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s_'-]/g, '')
    .trim()
    .replace(/[\s_']+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const safeSrc = (url?: string, fallback: string = DEFAULT_HOMESTAY_IMAGE) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return fallback;
  return getOptimizedImageUrl(url.trim(), 500);
};

const formatWhatsAppNumber = (contactStr: string | null | undefined): string => {
  if (!contactStr) return '';
  const str = String(contactStr);
  let phone = '';
  const waMatch = str.match(/WA:\s*(\+?[\d\s-]{10,})/i);
  const mobileMatch = str.match(/Mobile:\s*(\+?[\d\s-]{10,})/i);
  if (waMatch && waMatch[1]) {
    phone = waMatch[1].replace(/\D/g, '');
  } else if (mobileMatch && mobileMatch[1]) {
    phone = mobileMatch[1].replace(/\D/g, '');
  } else {
    phone = str.replace(/\D/g, '');
  }
  if (phone.length === 10) {
    phone = '91' + phone;
  }
  return phone;
};

const calculateDistanceInKm = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): number | null => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const l1 = Number(lat1);
  const n1 = Number(lon1);
  const l2 = Number(lat2);
  const n2 = Number(lon2);
  if (isNaN(l1) || isNaN(n1) || isNaN(l2) || isNaN(n2)) return null;
  if (l1 === 0 && n1 === 0) return null;
  if (l2 === 0 && n2 === 0) return null;
  
  const d = calculateHaversineDistanceKm(l1, n1, l2, n2);
  if (d === Infinity || isNaN(d)) return null;
  return Number(d.toFixed(2));
};

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// GEOGRAPHIC VECTOR GRAPH COORDINATES & GRAPH TOPOLOGY
// Relative coordinates on a scale corresponding to Darjeeling-Kalimpong hills mapping
// ========================================================
const NODE_COORDINATES: Record<string, { x: number; y: number; isMajor: boolean; label: string }> = {
  njp: { x: 180, y: 340, isMajor: true, label: "NJP (New Jalpaiguri)" },
  "njp (new jalpaiguri)": { x: 180, y: 340, isMajor: true, label: "NJP (New Jalpaiguri)" },
  bagdogra: { x: 80, y: 340, isMajor: true, label: "Bagdogra Airport" },
  "bagdogra airport": { x: 80, y: 340, isMajor: true, label: "Bagdogra Airport" },
  kurseong: { x: 140, y: 230, isMajor: true, label: "Kurseong" },
  mirik: { x: 50, y: 240, isMajor: true, label: "Mirik" },
  darjeeling: { x: 90, y: 90, isMajor: true, label: "Darjeeling" },
  sittong: { x: 230, y: 220, isMajor: true, label: "Sittong" },
  kalimpong: { x: 320, y: 180, isMajor: true, label: "Kalimpong" },
  pedong: { x: 340, y: 100, isMajor: true, label: "Pedong" },
  loleygaon: { x: 410, y: 250, isMajor: true, label: "Loleygaon" },
  lava: { x: 430, y: 160, isMajor: true, label: "Lava" },
  rishop: { x: 440, y: 90, isMajor: true, label: "Rishop" },

  ghoom: { x: 110, y: 130, isMajor: false, label: "Ghoom" },
  "teesta bazar": { x: 260, y: 170, isMajor: false, label: "Teesta Bazar" },
  siliguri: { x: 140, y: 300, isMajor: false, label: "Siliguri" },
  sevoke: { x: 200, y: 280, isMajor: false, label: "Sevoke" },
  kalijhora: { x: 210, y: 250, isMajor: false, label: "Kalijhora" },
  "sukhia pokhari": { x: 60, y: 180, isMajor: false, label: "Sukhia Pokhari" },
  "peshok tea garden": { x: 210, y: 140, isMajor: false, label: "Peshok Tea Garden" },
  sonada: { x: 125, y: 180, isMajor: false, label: "Sonada" },
  algara: { x: 380, y: 140, isMajor: false, label: "Algara" },
  "4-wheel track route": { x: 435, y: 125, isMajor: false, label: "4-Wheel Track Route" },
  "rhenock link": { x: 390, y: 95, isMajor: false, label: "Rhenock Link" }
};

const REGIONAL_CONNECTIONS = [
  ["njp", "siliguri"],
  ["siliguri", "mirik"],
  ["njp", "kurseong"],
  ["bagdogra", "kurseong"],
  ["kurseong", "sonada"],
  ["sonada", "ghoom"],
  ["ghoom", "darjeeling"],
  ["njp", "sevoke"],
  ["sevoke", "kalijhora"],
  ["kalijhora", "sittong"],
  ["ghoom", "sukhia pokhari"],
  ["sukhia pokhari", "mirik"],
  ["ghoom", "peshok tea garden"],
  ["peshok tea garden", "teesta bazar"],
  ["njp", "teesta bazar"],
  ["bagdogra", "teesta bazar"],
  ["teesta bazar", "kalimpong"],
  ["kalimpong", "algara"],
  ["algara", "lava"],
  ["algara", "pedong"],
  ["lava", "loleygaon"],
  ["lava", "4-wheel track route"],
  ["4-wheel track route", "rishop"],
  ["pedong", "rhenock link"],
  ["rhenock link", "rishop"],
];

const UNIQUE_REGIONAL_NODES = [
  { id: 'bagdogra', x: 80, y: 340, isMajor: true, label: "Bagdogra Airport" },
  { id: 'njp', x: 180, y: 340, isMajor: true, label: "NJP (New Jalpaiguri)" },
  { id: 'siliguri', x: 140, y: 300, isMajor: false, label: "Siliguri" },
  { id: 'sevoke', x: 200, y: 280, isMajor: false, label: "Sevoke" },
  { id: 'mirik', x: 50, y: 240, isMajor: true, label: "Mirik" },
  { id: 'sukhia pokhari', x: 60, y: 180, isMajor: false, label: "Sukhia Pokhari" },
  { id: 'kurseong', x: 140, y: 230, isMajor: true, label: "Kurseong" },
  { id: 'sonada', x: 125, y: 180, isMajor: false, label: "Sonada" },
  { id: 'ghoom', x: 110, y: 130, isMajor: false, label: "Ghoom" },
  { id: 'darjeeling', x: 90, y: 90, isMajor: true, label: "Darjeeling" },
  { id: 'peshok tea garden', x: 210, y: 140, isMajor: false, label: "Peshok" },
  { id: 'kalijhora', x: 210, y: 250, isMajor: false, label: "Kalijhora" },
  { id: 'sittong', x: 230, y: 220, isMajor: true, label: "Sittong" },
  { id: 'teesta bazar', x: 260, y: 170, isMajor: false, label: "Teesta Bazar" },
  { id: 'kalimpong', x: 320, y: 180, isMajor: true, label: "Kalimpong" },
  { id: 'algara', x: 380, y: 140, isMajor: false, label: "Algara" },
  { id: 'pedong', x: 340, y: 100, isMajor: true, label: "Pedong" },
  { id: 'loleygaon', x: 410, y: 250, isMajor: true, label: "Loleygaon" },
  { id: 'lava', x: 430, y: 160, isMajor: true, label: "Lava" },
  { id: '4-wheel track route', x: 435, y: 125, isMajor: false, label: "4-Wheel Track" },
  { id: 'rhenock link', x: 390, y: 95, isMajor: false, label: "Rhenock Link" },
  { id: 'rishop', x: 440, y: 90, isMajor: true, label: "Rishop" },
];

const getStopCoords = (stopName: string | null | undefined) => {
  if (!stopName) return null;
  const norm = String(stopName).toLowerCase().trim();
  if (NODE_COORDINATES[norm]) return NODE_COORDINATES[norm];
  for (const key of Object.keys(NODE_COORDINATES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return NODE_COORDINATES[key];
    }
  }
  return null;
};

const getPaginationRange = (current: number, total: number) => {
  const siblings = 1; // Number of pages to show on each side of active page
  const range: (number | string)[] = [];

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 || 
      i === total || 
      (i >= current - siblings && i <= current + siblings)
    ) {
      if (range.length > 0 && typeof range[range.length - 1] === 'number' && i - (range[range.length - 1] as number) > 1) {
        range.push('...');
      }
      range.push(i);
    }
  }
  return range;
};

export const AVAILABLE_THEMES = PRESETS.map(t => ({
  id: t.id,
  name: t.name,
  class: t.id === 'signature' ? 'theme-slate-dark' : t.id,
  color: t.light.primaryColor,
  emoji: t.emoji
}));

interface ScrollAnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

const ScrollAnimatedSection: React.FC<ScrollAnimatedSectionProps> = ({ children, className = '', delay = 0, id }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const getCategoryHighlights = (category: string, name: string) => {
  const cat = category?.toLowerCase() || '';
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
};

export default function App() {
  const [currentHash, setCurrentHash] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash || window.location.pathname || '/';
    }
    return '/';
  });

  // On website load: Set scroll restoration and initialize path from window location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      const initialPath = window.location.hash || window.location.pathname || '/';
      setCurrentHash(initialPath);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);
  const rawPath = currentHash.startsWith('#') ? currentHash.substring(1) : (currentHash || '/');
  // Separate path from query string if present so query parameters aren't mangled by route mapping
  const [basePath, queryString] = rawPath.split('?');
  const querySuffix = queryString ? `?${queryString}` : '';

  let tempPath = basePath || '/';
  // Normalize legacy singular routes to canonical plural routes for SEO/canonical structure
  if (tempPath === '/village' || tempPath === '#/village' || tempPath === '/villages' || tempPath === '#/villages') {
    tempPath = '/destinations';
  }
  if (tempPath.startsWith('/village/') && tempPath !== '/village') {
    tempPath = tempPath.replace('/village/', '/destinations/');
  }
  if (tempPath.startsWith('/villages/') && tempPath !== '/villages') {
    tempPath = tempPath.replace('/villages/', '/destinations/');
  }
  if (tempPath.startsWith('/destination/') && tempPath !== '/destination') {
    tempPath = tempPath.replace('/destination/', '/destinations/');
  }
  // Attractions:
  // /attraction alone (or #/attraction) is the catalog, normalize to /attractions
  if (tempPath === '/attraction' || tempPath === '#/attraction') {
    tempPath = '/attractions';
  }
  // For attraction detail, the canonical route is /attraction/{slug} (singular)
  // Legacy detail routes like /attractions/{id} or /attractions/{slug} normalize to /attraction/...
  if (tempPath.startsWith('/attractions/') && tempPath !== '/attractions') {
    tempPath = tempPath.replace('/attractions/', '/attraction/');
  }
  if (tempPath.startsWith('/homestay/') && tempPath !== '/homestay') {
    tempPath = tempPath.replace('/homestay/', '/homestays/');
  }
  if (tempPath === '/stays' || tempPath === '/stay' || tempPath === '#/stays' || tempPath === '#/stay') {
    tempPath = '/homestays';
  }
  if (tempPath.startsWith('/stays/')) {
    tempPath = tempPath.replace('/stays/', '/homestays/');
  }
  if (tempPath.startsWith('/stay/')) {
    tempPath = tempPath.replace('/stay/', '/homestays/');
  }
  if (tempPath === '/taxis' || tempPath === '#/taxis') {
    tempPath = '/taxi';
  }
  if (tempPath === '/routes' || tempPath === '/route' || tempPath === '#/routes' || tempPath === '#/route') {
    tempPath = '/journeys';
  }
  if (tempPath.startsWith('/routes/')) {
    tempPath = tempPath.replace('/routes/', '/journeys/');
  }
  if (tempPath.startsWith('/route/')) {
    tempPath = tempPath.replace('/route/', '/journeys/');
  }
  if (tempPath.startsWith('/journey/') && tempPath !== '/journey') {
    tempPath = tempPath.replace('/journey/', '/journeys/');
  }
  if (tempPath.startsWith('/offer/') && tempPath !== '/offer') {
    tempPath = tempPath.replace('/offer/', '/offers/');
  }
  if (tempPath.startsWith('/moment/') && tempPath !== '/moment') {
    tempPath = tempPath.replace('/moment/', '/moments/');
  }
  const currentPath = tempPath + querySuffix;
   const [footerModalType, setFooterModalType] = useState<string | null>(null);
  const [isIframeLoginModalOpen, setIsIframeLoginModalOpen] = useState(false);
  // Email Auth Modal states
  const [authFormType, setAuthFormType] = useState<'signin' | 'signup' | 'assistant'>('assistant');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Google Sign-In Simulator states
  const [showGoogleSimulator, setShowGoogleSimulator] = useState(false);
  const [simulatedEmail, setSimulatedEmail] = useState('');
  const [simulatedName, setSimulatedName] = useState('');
  const [simulatedLoading, setSimulatedLoading] = useState(false);

  // Return path tracking for dedicated /login navigation
  const previousPathRef = useRef<string>('/');

  useEffect(() => {
    if (currentPath !== '/login' && currentPath !== '/signup' && currentHash !== '#/login' && currentHash !== '#/signup') {
      previousPathRef.current = currentPath;
    }
  }, [currentPath, currentHash]);

  // Pre-Booking Enquiry Modal states
  const [enquireBusiness, setEnquireBusiness] = useState<any | null>(null);
  const [enquireModalOpen, setEnquireModalOpen] = useState(false);
  const [enquireBookingDetails, setEnquireBookingDetails] = useState<any>({});
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isMascotStudioOpen, setIsMascotStudioOpen] = useState(false);

  useEffect(() => {
    if (currentPath === '/ai-planner' || currentHash === '#/ai-planner') {
      setIsAiPlannerOpen(true);
    }
    if (currentPath === '/mascot' || currentHash === '#/mascot' || currentHash === '#/mascots') {
      setIsMascotStudioOpen(true);
    }
  }, [currentPath, currentHash]);

  const registerActiveTab = currentPath === '/register/driver' ? 'driver' : 'homestay';
  
  // High-fidelity once-per-session Welcome/Splash intro overlay
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        try {
          sessionStorage.setItem('hillytrip_splash_shown', 'true');
        } catch (e) {}
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Theme management (Standard Basic Themes + Gesture Double-click Premium Palettes)
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hillytrip_premium_theme') || localStorage.getItem('hillytrip-theme');
      if (saved && AVAILABLE_THEMES.some(t => t.id === saved)) return saved;
    }
    return 'signature';
  });

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hillytrip-theme-mode');
      if (saved === 'light' || saved === 'dark') return saved;
      
      const systemPrefersDark = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
      return systemPrefersDark ? 'dark' : 'light';
    }
    return 'dark'; // Slate Dark (Default) is dark-first
  });

  useEffect(() => {
    localStorage.setItem('hillytrip-theme', theme);
    localStorage.setItem('hillytrip-theme-mode', themeMode);
  }, [theme, themeMode]);

  const [showFloatingWidgets, setShowFloatingWidgets] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      // Hide on home page when scrollY <= 300 to not overlap Hero section
      if (currentPath === '/') {
        setShowFloatingWidgets(window.scrollY > 300);
      } else {
        setShowFloatingWidgets(true);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath]);

  const [hubs, setHubs] = useState<Hub[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_hubs');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [destinations, setDestinations] = useState<Destination[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_destinations');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [attractions, setAttractions] = useState<Attraction[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_attractions');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [attractionStats, setAttractionStats] = useState<Record<string, number>>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_attraction_stats');
      if (c) {
        const parsed = JSON.parse(c);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
      return {};
    } catch {
      return {};
    }
  });
  const [homestays, setHomestays] = useState<Homestay[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_homestays');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Detect #/messages or #/enquire with query parameters to launch Pre-Booking Enquiry modal automatically
  useEffect(() => {
    if (currentPath.startsWith('/messages') || currentPath.startsWith('/enquire')) {
      const hashPart = window.location.hash || '';
      const queryStr = hashPart.includes('?') ? hashPart.split('?')[1] : window.location.search.replace('?', '');
      const searchParams = new URLSearchParams(queryStr);

      const lType = searchParams.get('listingType');
      const lId = searchParams.get('listingId');

      if (lType && lId) {
        const checkIn = searchParams.get('checkIn') || '';
        const checkOut = searchParams.get('checkOut') || '';
        const guests = searchParams.get('guests') || '';
        const roomName = searchParams.get('roomName') || '';

        let bName = 'HillyTrip Business';
        let bImg = '/images/hillytrip/homestay.svg';
        let destName = 'Himalayan Region';

        if (lType === 'homestay') {
          const found = (homestays || []).find((h: any) => h.id === lId || h.slug === lId || getItemSlug(h) === lId);
          if (found) {
            bName = found.name;
            if (found.images && found.images.length > 0) bImg = found.images[0];
            destName = found.address || destName;
          } else {
            bName = 'HillyTrip Verified Homestay';
          }
        } else if (lType === 'taxi_operator' || lType === 'taxi') {
          bName = 'HillyTrip Taxi Stand Operator';
          bImg = '/images/hillytrip/taxi-transit.svg';
          destName = 'Darjeeling & Sikkim Corridor';
        } else if (lType === 'tour_operator' || lType === 'tour' || lType === 'package') {
          bName = 'HillyTrip Mountain Tour Operator';
          bImg = '/images/hillytrip/himalayan-landscape.svg';
          destName = 'High Himalayan Trails';
        } else if (lType === 'restaurant') {
          bName = 'HillyTrip Alpine Dining & Cafe';
          bImg = '/images/hillytrip/himalayan-food.svg';
          destName = 'Mall Road';
        }

        setEnquireBusiness({
          id: lId,
          name: bName,
          type: lType,
          destination: destName,
          rating: 4.9,
          image: bImg
        });

        setEnquireBookingDetails({
          checkIn,
          checkOut,
          guests,
          roomName
        });

        setEnquireModalOpen(true);
      }
    }
  }, [currentPath, homestays]);
  const [drivers, setDrivers] = useState<any[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_drivers');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return SEED_TAXI_OPERATORS || [];
    } catch {
      return SEED_TAXI_OPERATORS || [];
    }
  });
  const [routes, setRoutes] = useState<Route[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_routes');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  
  // Loading & Global alerts
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // Home search state
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [showHomeSuggestions, setShowHomeSuggestions] = useState(false);
  const [searchTab, setSearchTab] = useState<'all' | 'destinations' | 'attractions' | 'routes' | 'homestays'>('all');

  // Hidden Gems search & filter state
  const [gemSearch, setGemSearch] = useState('');
  const [gemFilterType, setGemFilterType] = useState<'all' | 'destination' | 'attraction'>('all');

  // User Registration / Login status
  const [user, setUser] = useState<User | null>(() => {
    try {
      const persistedUser = localStorage.getItem('hillytrip_user_session');
      if (persistedUser) {
        const parsed = JSON.parse(persistedUser);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('hillytrip_user_session', JSON.stringify(u));
      if (u.themeMode === 'light' || u.themeMode === 'dark') {
        setThemeMode(u.themeMode);
      }
    } else {
      localStorage.removeItem('hillytrip_user_session');
    }
  };

  // Sync themeMode with database profile
  useEffect(() => {
    if (user && user.email) {
      const savedMode = localStorage.getItem('hillytrip-theme-mode');
      if (savedMode === themeMode) {
        // Only fetch if they match to prevent redundant network calls during initial load
        fetch('/api/auth/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, themeMode })
        }).catch(err => console.error('Failed to sync themeMode with database:', err));
      }
    }
  }, [themeMode, user?.email]);

  // Unified Profile state hooks
  const [travelerLeads, setTravelerLeads] = useState<{ trips: any[], cars: any[] } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileMobile, setEditProfileMobile] = useState('');
  const [editProfilePassword, setEditProfilePassword] = useState('');

  // Premium DIY Itinerary planner & Community Bulletin States
  const [activePlanTab, setActivePlanTab] = useState<'diy' | 'intelligence' | 'inquiry'>('diy');
  const [diyItineraries, setDiyItineraries] = useState<any[]>(() => {
    try {
      const persisted = localStorage.getItem('hillytrip_diy_itineraries');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [bulletinReports, setBulletinReports] = useState<any[]>(() => {
    try {
      const persisted = localStorage.getItem('hillytrip_bulletin_reports');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed)) return parsed;
      }
      return [
        {
          id: 'report-1',
          hubName: 'lava',
          location: 'Lava to Rishop ridge segment',
          status: 'caution',
          condition: 'Partial mudslides after continuous heavy night shower. Light hatchbacks should travel cautiously.',
          reportedBy: 'Driver Sangye Sherpa',
          votes: 14,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
        },
        {
          id: 'report-2',
          hubName: 'darjeeling',
          location: 'Ghoom - Jorebunglow road junction',
          status: 'clear',
          condition: 'Road works completed successfully. Traffic flowing normally at normal speeds.',
          reportedBy: 'Kushal Gurung',
          votes: 8,
          createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
        },
        {
          id: 'report-3',
          hubName: 'sittong',
          location: 'Mungpa/Sittong III sector',
          status: 'blocked',
          condition: 'Heavy landslide near the river bridge. Road completely barricaded till authorities clear debris. Take the Sittong II bypass route.',
          reportedBy: 'Driver Pemba Tamang',
          votes: 29,
          createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [visitedHubIds, setVisitedHubIds] = useState<string[]>(() => {
    try {
      const persisted = localStorage.getItem('hillytrip_visited_hubs');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  
  const handleSaveItinerary = (itinerary: any) => {
    setDiyItineraries((prev) => {
      const updated = [itinerary, ...prev];
      localStorage.setItem('hillytrip_diy_itineraries', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteItinerary = (id: string) => {
    setDiyItineraries((prev) => {
      const updated = prev.filter(it => it.id !== id);
      localStorage.setItem('hillytrip_diy_itineraries', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddLiveReport = (report: any) => {
    setBulletinReports((prev) => {
      const updated = [report, ...prev];
      localStorage.setItem('hillytrip_bulletin_reports', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpvoteLiveReport = (id: string) => {
    setBulletinReports((prev) => {
      const updated = prev.map(rep => {
        if (rep.id === id) {
          return { ...rep, votes: rep.votes + 1 };
        }
        return rep;
      });
      localStorage.setItem('hillytrip_bulletin_reports', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleVisitedHub = (hubId: string) => {
    setVisitedHubIds((prev) => {
      let updated;
      if (prev.includes(hubId)) {
        updated = prev.filter(id => id !== hubId);
      } else {
        updated = [...prev, hubId];
      }
      localStorage.setItem('hillytrip_visited_hubs', JSON.stringify(updated));
      return updated;
    });
  };

  const [partnerListings, setPartnerListings] = useState<{ homestays: any[], drivers: any[] } | null>(null);
  const [loadingPartnerListings, setLoadingPartnerListings] = useState(false);
  const [partnerInquiries, setPartnerInquiries] = useState<any[]>([]);
  const [loadingPartnerInquiries, setLoadingPartnerInquiries] = useState(false);

  // Admin and Super Admin Dashboard states
  const [adminPendingPartners, setAdminPendingPartners] = useState<any[]>([]);
  const [adminPendingContributors, setAdminPendingContributors] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [adminReports, setAdminReports] = useState<any[]>([]);
  const [loadingAdminData, setLoadingAdminData] = useState(false);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  // Offline status tracking for remote mountain regions
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setNotification({
        type: 'success',
        message: '🏔️ Back Online: Connected back to HillyTrip server guides and routes!'
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      setNotification({
        type: 'error',
        message: '⚡ Signal Interrupted: Viewing offline cached data list. Guide index and mapped routes remain fully readable!'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Admin Section state
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const persistedUser = localStorage.getItem('hillytrip_user_session');
      if (persistedUser) {
        const u = JSON.parse(persistedUser);
        if (!u) return false;
        const r = (u.role || '').toLowerCase();
        const roles = Array.isArray(u.roles) ? u.roles.map((x: string) => String(x).toLowerCase()) : [r];
        return r === 'admin' || r === 'super_admin' || u.isAdmin === true || u.isSuperAdmin === true || roles.includes('admin') || roles.includes('super_admin');
      }
    } catch (e) {}
    return false;
  });

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const u = user as any;
    const r = (u.role || '').toLowerCase();
    const roles = Array.isArray(u.roles) ? u.roles.map((x: any) => String(x).toLowerCase()) : [];
    const userIsAdmin = (
      r === 'admin' ||
      r === 'super_admin' ||
      u.isAdmin === true ||
      u.isSuperAdmin === true ||
      roles.includes('admin') ||
      roles.includes('super_admin')
    );
    setIsAdmin(userIsAdmin);
  }, [user]);
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('hillytrip_admin_email') || '');
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const persisted = localStorage.getItem('hillytrip_admin_user');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });
  const [adminPermissions, setAdminPermissions] = useState<string[]>(() => {
    try {
      const persisted = localStorage.getItem('hillytrip_admin_permissions');
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [adminRegisterName, setAdminRegisterName] = useState('');
  const [adminRegisterPassword, setAdminRegisterPassword] = useState('');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // RBAC lists state
  const [allAdminUsers, setAllAdminUsers] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [allAuditLogs, setAllAuditLogs] = useState<any[]>([]);
  const [adminManagementLoading, setAdminManagementLoading] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState<string>('all');
  const [adminAuditActionFilter, setAdminAuditActionFilter] = useState<string>('all');

  // Modal forms state for editing/adding admins
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormRole, setUserFormRole] = useState('moderator');
  const [userFormStatus, setUserFormStatus] = useState('active');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormCustomPermissions, setUserFormCustomPermissions] = useState<string[]>([]);

  const [adminPassword, setAdminPassword] = useState('');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminTripLeads, setAdminTripLeads] = useState<TripLead[]>([]);
  const [adminCarLeads, setAdminCarLeads] = useState<CarLead[]>([]);
  const [adminContributions, setAdminContributions] = useState<Contribution[]>([]);
  const [adminImages, setAdminImages] = useState<ImageItem[]>([]);
  const [adminDrivers, setAdminDrivers] = useState<any[]>([]);
  const [adminHomestays, setAdminHomestays] = useState<any[]>([]);
  const [regSuccess, setRegSuccess] = useState<any>(null);
  const [registerHomestayImage, setRegisterHomestayImage] = useState<string>('');
  const [adminActiveTab, setAdminActiveTab] = useState<'stats' | 'leads' | 'car-leads' | 'contributions' | 'add-data' | 'bulk-import' | 'images' | 'analytics' | 'registrations' | 'admin_management' | 'audit_logs' | 'photo_approvals' | 'location-intelligence' | 'partner-management' | 'homepage_content' | 'business_control' | 'app_notifications' | 'system_reports' | 'cover_management' | 'brand_management' | 'travel_guides' | 'homestay_management' | 'media_library' | 'taxi-marketplace' | 'storage_manager' | 'search_engine' | 'dev_tools' | 'dev-tools'>('stats');
  const [expandedGroup, setExpandedGroup] = useState<string | null>('monitoring');
  const [adminUserAnalytics, setAdminUserAnalytics] = useState<any>(null);
  const [adminUserAnalyticsLoading, setAdminUserAnalyticsLoading] = useState(false);
  const [adminDashboardConfigurations, setAdminDashboardConfigurations] = useState<any[]>([]);
  const [adminFeatureFlags, setAdminFeatureFlags] = useState<any[]>([]);

  // Traveller Photo Contribution & Approval System state
  const [photoSubTab, setPhotoSubTab] = useState<'upload' | 'history' | 'notifications'>('upload');
  const [photoUploaderName, setPhotoUploaderName] = useState<string>('');
  const [photoUploaderEmail, setPhotoUploaderEmail] = useState<string>('');
  const [photoSelectedDestId, setPhotoSelectedDestId] = useState<string>('');
  const [photoUploadedUrl, setPhotoUploadedUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoContributions, setPhotoContributions] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [adminPhotoConts, setAdminPhotoConts] = useState<any[]>([]);
  const [adminFullSizePhotoUrl, setAdminFullSizePhotoUrl] = useState<string | null>(null);
  const [adminRejectionModalId, setAdminRejectionModalId] = useState<string | null>(null);
  const [adminRejectionRes, setAdminRejectionRes] = useState<string>('');
  const [adminImageRejectionModalId, setAdminImageRejectionModalId] = useState<string | null>(null);
  const [adminImageRejectionRes, setAdminImageRejectionRes] = useState<string>('');

  // Filtering / Sorting for Admin Dashboard
  const [adminSearchTerm, setAdminSearchTerm] = useState<string>('');
  const [attractionVideoError, setAttractionVideoError] = useState(false);
  const [isAttractionsMounted, setIsAttractionsMounted] = useState(false);

  useEffect(() => {
    setIsAttractionsMounted(true);
  }, []);
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('All');
  const [adminSortField, setAdminSortField] = useState<'uploadedAt' | 'travellerName'>('uploadedAt');
  const [adminSortOrder, setAdminSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk operation selection state
  const [selectedPhotoContIds, setSelectedPhotoContIds] = useState<string[]>([]);

  // Bulk spreadsheets state
  const [bulkCollection, setBulkCollection] = useState<'hubs' | 'routes' | 'destinations' | 'attractions' | 'homestays'>('hubs');
  const [bulkMode, setBulkMode] = useState<'merge' | 'replace'>('merge');
  const [bulkText, setBulkText] = useState('');
  const [bulkStatus, setBulkStatus] = useState<any>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Unified Profile & Auth State
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileMobile, setProfileMobile] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [userNotificationPreferences, setUserNotificationPreferences] = useState<any>({
    likes: true,
    comments: true,
    replies: true,
    photo_approval: true,
    review_replies: true,
    travel_alerts: true
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<'traveler' | 'partner' | 'contributor'>('traveler');

  // Applications form states
  const [applyBusinessName, setApplyBusinessName] = useState('');
  const [applyBusinessType, setApplyBusinessType] = useState<'homestay' | 'cab' | 'guide'>('homestay');
  const [applyPartnerLocation, setApplyPartnerLocation] = useState('');
  const [applyPartnerMobile, setApplyPartnerMobile] = useState('');
  const [applyPartnerDocs, setApplyPartnerDocs] = useState('');
  const [applyPartnerLoading, setApplyPartnerLoading] = useState(false);

  const [applyContribRegion, setApplyContribRegion] = useState('');
  const [applyContribReason, setApplyContribReason] = useState('');
  const [applyContribExperience, setApplyContribExperience] = useState('');
  const [applyContribLoading, setApplyContribLoading] = useState(false);

  // Traveler Inquiry modal form states
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inqName, setInqName] = useState('');
  const [inqEmail, setInqEmail] = useState('');
  const [inqMobile, setInqMobile] = useState('');
  const [inqDate, setInqDate] = useState('');
  const [inqGuests, setInqGuests] = useState(1);
  const [inqMessage, setInqMessage] = useState('');

  // Dynamic Backoffice Database Editor state
  const [dbEditorCollection, setDbEditorCollection] = useState<string>('hubs');
  const [dbEditorItems, setDbEditorItems] = useState<any[]>([]);
  const [dbEditorSelectedId, setDbEditorSelectedId] = useState<string | null>(null);
  const [dbEditorJSON, setDbEditorJSON] = useState<string>('');
  const [dbEditorSearchQuery, setDbEditorSearchQuery] = useState<string>('');
  const [spreadsheetRows, setSpreadsheetRows] = useState<any[]>([]);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  // Quick Photo Uploader state variables
  const [quickUploadTargetType, setQuickUploadTargetType] = useState<'dest-main' | 'dest-gallery' | 'attr-main' | 'attr-gallery'>('dest-main');
  const [quickUploadSelectedId, setQuickUploadSelectedId] = useState<string>('');
  const [isUploadingQuickPhoto, setIsUploadingQuickPhoto] = useState(false);
  const [quickUploadUrlInput, setQuickUploadUrlInput] = useState<string>('');
  // Dynamic Content detail pages state
  const [activeRouteResults, setActiveRouteResults] = useState<RouteSearchResult[]>([]);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeDestDetail, setActiveDestDetail] = useState<any>(null);
  const [activeAttrDetail, setActiveAttrDetail] = useState<any>(null);
  const [activeHomeDetail, setActiveHomeDetail] = useState<any>(null);
  const [activePhotos, setActivePhotos] = useState<ImageItem[]>([]);
  const [publicPhotos, setPublicPhotos] = useState<ImageItem[]>([]);
  const [mostSearchedToday, setMostSearchedToday] = useState<any[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_most_searched_today');
      if (c) {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [destinationStats, setDestinationStats] = useState<Record<string, number>>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_destination_stats');
      if (c) {
        const parsed = JSON.parse(c);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
      return {};
    } catch {
      return {};
    }
  });

  // Collapse and view-all toggles for Destination Detail layout
  const [destAttractionsExpanded, setDestAttractionsExpanded] = useState(false);
  const [selectedPhotoFromMomentsUrl, setSelectedPhotoFromMomentsUrl] = useState<string | null>(null);
  const [activeMomentsTab, setActiveMomentsTab] = useState<'liked' | 'latest' | 'popular'>('liked');
  const [destLodgingExpanded, setDestLodgingExpanded] = useState(false);
  const [destTransitExpanded, setDestTransitExpanded] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formRecommends, setFormRecommends] = useState(true);
  const [destCommentsExpanded, setDestCommentsExpanded] = useState(false);
  const [attrCommentsExpanded, setAttrCommentsExpanded] = useState(false);
  const [submittingAttrLead, setSubmittingAttrLead] = useState(false);
  const [attrLeadSuccess, setAttrLeadSuccess] = useState(false);

  // Navigation logic helper
  const navigate = (path: string) => {
    let cleanPath = path;
    if (path.startsWith('#')) {
      cleanPath = path.substring(1);
    }
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', cleanPath);
      window.dispatchEvent(new Event('popstate'));
    }
    setCurrentHash(cleanPath);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Taxi operator dashboard route guard
  useEffect(() => {
    if (currentPath.startsWith('/taxi/dashboard')) {
      const storedUser = localStorage.getItem('hillytrip_user_session') || localStorage.getItem('hillytrip_user');
      let activeUser = user;
      if (!activeUser && storedUser) {
        try {
          activeUser = JSON.parse(storedUser);
        } catch {}
      }
      if (!activeUser) {
        navigate('/become-taxi-operator');
        handleUserLogin();
      }
    }
  }, [currentPath, user]);

  // Admin route tab synchronization
  useEffect(() => {
    if (currentPath === '/admin/dev-tools') {
      setAdminActiveTab('dev_tools');
      setExpandedGroup('settings');
    } else if (currentPath === '/admin/audit') {
      setAdminActiveTab('audit_logs');
      setExpandedGroup('monitoring');
    }
  }, [currentPath]);

  // Smooth scroll carousel helper
  const scrollCarousel = (id: string, direction: 'left' | 'right') => {
    const el = document.getElementById(id);
    if (el) {
      const scrollAmt = direction === 'left' ? -340 : 340;
      el.scrollBy({ left: scrollAmt, behavior: 'smooth' });
    }
  };

  // Auto-dismiss standard notifications
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const deduplicate = <T extends { id: string }>(arr: T[]): T[] => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    if (arr.length === 1) return arr;
    
    const stageMap = new Map<string, T>();
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (!item || item.id === undefined || item.id === null) continue;
      const key = String(item.id).toLowerCase();
      const existing = stageMap.get(key);
      if (existing) {
        stageMap.set(key, { ...existing, ...item });
      } else {
        stageMap.set(key, item);
      }
    }
    
    return Array.from(stageMap.values());
  };

  // Load baseline app data from API
  const fetchBaselineData = async () => {
    try {
      // 1. Try fast single-request bootstrap endpoint first
      try {
        const bRes = await fetch('/api/bootstrap');
        if (bRes.ok) {
          const bData = await bRes.json();
          if (bData && typeof bData === 'object') {
            const cleanHubs = deduplicate<Hub>(bData.hubs || []);
            const cleanDests = deduplicate<Destination>(bData.destinations || []);
            const cleanAtts = deduplicate<Attraction>(bData.attractions || []);
            const cleanHomes = deduplicate<Homestay>(bData.homestays || []);
            const cleanRoutes = deduplicate<Route>(bData.routes || []);

            if (cleanHubs.length > 0) setHubs(cleanHubs);
            if (cleanDests.length > 0) setDestinations(cleanDests);
            if (cleanAtts.length > 0) setAttractions(cleanAtts);
            if (cleanHomes.length > 0) setHomestays(cleanHomes);
            if (cleanRoutes.length > 0) setRoutes(cleanRoutes);

            // Async background caching
            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
              (window as any).requestIdleCallback(() => {
                try {
                  if (cleanHubs.length > 0) localStorage.setItem('hillytrip_cached_hubs', JSON.stringify(cleanHubs));
                  if (cleanDests.length > 0) localStorage.setItem('hillytrip_cached_destinations', JSON.stringify(cleanDests));
                  if (cleanAtts.length > 0) localStorage.setItem('hillytrip_cached_attractions', JSON.stringify(cleanAtts));
                  if (cleanHomes.length > 0) localStorage.setItem('hillytrip_cached_homestays', JSON.stringify(cleanHomes));
                  if (cleanRoutes.length > 0) localStorage.setItem('hillytrip_cached_routes', JSON.stringify(cleanRoutes));
                } catch {}
              });
            }
            return;
          }
        }
      } catch (err) {
        console.warn('[API Baseline] Bootstrap fetch failed, falling back to multi-fetch:', err);
      }

      const safeFetchJson = async (url: string, fallback: any[] = []) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`[API Baseline] fetch failed for ${url} with status ${res.status}, using static fallback.`);
            return fallback;
          }
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            console.warn(`[API Baseline] non-json response for ${url}, returning empty.`);
            return [];
          }
          const text = await res.text();
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.warn(`[API Baseline] HTML returned instead of JSON for ${url}, returning empty.`);
            return [];
          }
          const data = JSON.parse(text);
          return Array.isArray(data) ? data : [];
        } catch (err) {
          console.warn(`[API Baseline] error fetching ${url}, returning empty:`, err);
          return [];
        }
      };

      const [rHubs, rDests, rAtts, rHomes, rRoutes] = await Promise.all([
        safeFetchJson('/api/hubs?limit=500'),
        safeFetchJson('/api/destinations?limit=500'),
        safeFetchJson('/api/attractions?limit=1000'),
        safeFetchJson('/api/homestays?limit=1000'),
        safeFetchJson('/api/routes?limit=1000'),
      ]);

      const cleanHubs = deduplicate(rHubs);
      const cleanDests = deduplicate(rDests);
      const cleanAtts = deduplicate(rAtts);
      const cleanHomes = deduplicate(rHomes);
      const cleanRoutes = deduplicate(rRoutes || []);

      if (cleanHubs.length > 0) setHubs(cleanHubs);
      if (cleanDests.length > 0) setDestinations(cleanDests);
      if (cleanAtts.length > 0) setAttractions(cleanAtts);
      if (cleanHomes.length > 0) setHomestays(cleanHomes);
      if (cleanRoutes.length > 0) setRoutes(cleanRoutes);

      // Save to cache asynchronously in background idle time to prevent UI thread blocking
      const safeSetLocalStorage = (key: string, data: any) => {
        const performWrite = () => {
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch (err) {
            console.warn(`[LocalStorage] Failed to write complete data for ${key}:`, err);
            if (key === 'hillytrip_cached_attractions' && Array.isArray(data)) {
              try {
                // Create a lightweight backup: first 600 items with only indexable fields
                const compactAtts = data.slice(0, 600).map((att: any) => ({
                  id: att.id,
                  name: att.name,
                  category: att.category,
                  destinationId: att.destinationId,
                  latitude: att.latitude,
                  longitude: att.longitude,
                  isHiddenGem: att.isHiddenGem,
                  isFeaturedThisWeek: att.isFeaturedThisWeek,
                  isFeaturedAttraction: att.isFeaturedAttraction,
                  district: att.district,
                  coverImage: att.coverImage
                }));
                localStorage.setItem(key, JSON.stringify(compactAtts));
              } catch (fallbackErr) {
                try {
                  localStorage.removeItem(key);
                } catch {}
              }
            } else {
              try {
                localStorage.removeItem(key);
              } catch {}
            }
          }
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(performWrite, { timeout: 2000 });
        } else {
          setTimeout(performWrite, 150);
        }
      };

      if (cleanHubs.length > 0) safeSetLocalStorage('hillytrip_cached_hubs', cleanHubs);
      if (cleanDests.length > 0) safeSetLocalStorage('hillytrip_cached_destinations', cleanDests);
      if (cleanAtts.length > 0) safeSetLocalStorage('hillytrip_cached_attractions', cleanAtts);
      if (cleanHomes.length > 0) safeSetLocalStorage('hillytrip_cached_homestays', cleanHomes);
      if (cleanRoutes.length > 0) safeSetLocalStorage('hillytrip_cached_routes', cleanRoutes);
    } catch (e) {
      console.error('Error loading baseline application data:', e);
      // Suppress noisy alert if we already have cache loaded
      const hasCached = localStorage.getItem('hillytrip_cached_hubs');
      if (!hasCached) {
        setNotification({ type: 'error', message: 'Failed to synchronize with HillyTrip server. Please reload.' });
      }
    }
  };

  // Load non-critical data later (deferred/background)
  const fetchDeferredData = async () => {
    // 1. Fetch Drivers (non-critical)
    fetch('/api/drivers')
      .then(res => {
        if (!res.ok) return [];
        return res.json().catch(() => []);
      })
      .then(rDrivers => {
        if (Array.isArray(rDrivers) && rDrivers.length > 0) {
          const cleanDrivers = deduplicate(rDrivers);
          setDrivers(cleanDrivers);
          try {
            localStorage.setItem('hillytrip_cached_drivers', JSON.stringify(cleanDrivers));
          } catch {}
        }
      })
      .catch(e => console.warn('[Deferred Data] Drivers fetch non-critical warning:', e?.message || e));

    // 1b. Fetch public approved images (non-critical)
    fetch('/api/images?status=Approved')
      .then(res => {
        if (!res.ok) return [];
        return res.json().catch(() => []);
      })
      .then(rImgs => {
        if (Array.isArray(rImgs) && rImgs.length > 0) {
          setPublicPhotos(rImgs);
        }
      })
      .catch(e => console.warn('[Deferred Data] Public images fetch non-critical warning:', e?.message || e));

    // 2. Fetch public search statistics
    fetch('/api/analytics/most-searched')
      .then(res => {
        if (!res.ok) return [];
        return res.json().catch(() => []);
      })
      .then(rAnalytics => {
        if (Array.isArray(rAnalytics)) {
          setMostSearchedToday(rAnalytics);
          try {
            localStorage.setItem('hillytrip_cached_most_searched_today', JSON.stringify(rAnalytics));
          } catch {}
        }
      })
      .catch(e => console.warn('[Deferred Data] Analytics fetch non-critical warning:', e?.message || e));

    // 3. Fetch public destination analytics
    fetch('/api/analytics/destinations')
      .then(res => {
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
      .then(rDestAnalytics => {
        if (rDestAnalytics && Array.isArray(rDestAnalytics.mostVisited)) {
          const statsMap: Record<string, number> = {};
          rDestAnalytics.mostVisited.forEach((item: any) => {
            if (item.slug) {
              statsMap[item.slug] = item.count || 0;
            }
          });
          setDestinationStats(statsMap);
          try {
            localStorage.setItem('hillytrip_cached_destination_stats', JSON.stringify(statsMap));
          } catch {}
        }
      })
      .catch(e => console.warn('[Deferred Data] Destination analytics fetch non-critical warning:', e?.message || e));

    // 4. Fetch public attraction analytics
    fetch('/api/analytics/attractions')
      .then(res => {
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
      .then(rAttrAnalytics => {
        if (rAttrAnalytics && Array.isArray(rAttrAnalytics.mostVisited)) {
          const statsMap: Record<string, number> = {};
          rAttrAnalytics.mostVisited.forEach((item: any) => {
            if (item.slug) {
              statsMap[item.slug] = item.count || 0;
            }
          });
          setAttractionStats(statsMap);
          try {
            localStorage.setItem('hillytrip_cached_attraction_stats', JSON.stringify(statsMap));
          } catch {}
        }
      })
      .catch(e => console.warn('[Deferred Data] Attraction analytics fetch non-critical warning:', e?.message || e));
  };

  useEffect(() => {
    fetchBaselineData();

    // Register custom listener for real-time Location Intelligence CSV updates
    const handleDbUpdate = () => {
      console.log("[Db Event] Database update signal received. Re-fetching baseline datasets dynamically...");
      fetchBaselineData();
    };
    window.addEventListener("hillytrip:db-updated", handleDbUpdate);

    // Defer non-critical load by 800ms to allow rendering critical components instantly
    const timer = setTimeout(() => {
      fetchDeferredData();
    }, 800);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hillytrip:db-updated", handleDbUpdate);
    };
  }, []);

  // Photo Contribution & Notification synchronization
  const fetchUserPhotoData = async (userObj: any) => {
    if (!userObj) return;
    try {
      const uId = userObj.uid || userObj.email || 'anonymous';
      // 1. Fetch notifications for uploader
      const notifRes = await fetch(`/api/notifications?userId=${encodeURIComponent(uId)}`);
      if (notifRes.ok) {
        const data = await notifRes.json();
        setUserNotifications(data);
      }

      // 2. Fetch traveler's photo submissions
      const contRes = await fetch(`/api/photo-contributions?userId=${encodeURIComponent(uId)}`);
      if (contRes.ok) {
        const data = await contRes.json();
        setPhotoContributions(data);
      }
    } catch (e) {
      console.warn('[fetchUserPhotoData expected transient networking info]', e);
    }
  };

  useEffect(() => {
    if (user) {
      setPhotoUploaderName(user.name || user.displayName || '');
      setPhotoUploaderEmail(user.email || '');
      fetchUserPhotoData(user);
      
      const rolesList = user.roles || [user.role || 'traveler'];
      const adminActive = rolesList.includes('admin') || rolesList.includes('super_admin') || user.role === 'admin' || user.role === 'super_admin';
      setIsAdmin(adminActive);
      if (adminActive) {
        setAdminEmail(user.email);
        setAdminUser(user);
        const perms = ['moderate_photos', 'broadcast_alerts', 'view_analytics', 'manage_users'];
        setAdminPermissions(perms);
        localStorage.setItem('hillytrip_admin_email', user.email);
        localStorage.setItem('hillytrip_admin_user', JSON.stringify(user));
        localStorage.setItem('hillytrip_admin_permissions', JSON.stringify(perms));
        loadAdminDashboard();
      }

      setEditProfileName(user.name || '');
      setEditProfileMobile(user.mobile || '');
      
      const timer = setInterval(() => {
        fetchUserPhotoData(user);
      }, 10000); // Poll every 10 seconds for real-time notification alerts
      return () => clearInterval(timer);
    } else {
      setPhotoUploaderName('');
      setPhotoUploaderEmail('');
      setUserNotifications([]);
      setPhotoContributions([]);
      setIsAdmin(false);
      setAdminEmail('');
      setAdminUser(null);
      setAdminPermissions([]);
      localStorage.removeItem('hillytrip_admin_email');
      localStorage.removeItem('hillytrip_admin_user');
      localStorage.removeItem('hillytrip_admin_permissions');
    }
  }, [user]);

  const fetchTravelerLeads = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/user/leads?mobile=${encodeURIComponent(user.mobile || '')}&name=${encodeURIComponent(user.name || '')}`);
      if (res.ok) {
        const data = await res.json();
        setTravelerLeads(data);
      }
    } catch (e) {
      console.error('[fetchTravelerLeads error]', e);
    }
  };

  const fetchPartnerState = async () => {
    if (!user) return;
    setLoadingPartnerListings(true);
    setLoadingPartnerInquiries(true);
    try {
      const listRes = await fetch(`/api/partner/listings?name=${encodeURIComponent(user.name || '')}&mobile=${encodeURIComponent(user.mobile || '')}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        setPartnerListings(listData);
      }
      const inqRes = await fetch(`/api/partner/inquiries?partnerUserId=${encodeURIComponent(user.id || user.email || '')}`);
      if (inqRes.ok) {
        const inqData = await inqRes.json();
        setPartnerInquiries(inqData.inquiries || []);
      }
    } catch (e) {
      console.error('[fetchPartnerState error]', e);
    } finally {
      setLoadingPartnerListings(false);
      setLoadingPartnerInquiries(false);
    }
  };

  const fetchAdminPanelState = async () => {
    if (!user) return;
    setLoadingAdminData(true);
    try {
      // 1. Pending Apps
      const appRes = await fetch('/api/admin/pending-applications', {
        headers: {
          'x-admin-email': user.email,
          'x-admin-password': 'admin123'
        }
      });
      if (appRes.ok) {
        const appData = await appRes.json();
        setAdminPendingPartners(appData.pendingPartners || []);
        setAdminPendingContributors(appData.pendingContributors || []);
      }

      // 2. Users List
      const usersRes = await fetch('/api/admin/users', {
        headers: {
          'x-admin-email': user.email,
          'x-admin-password': 'admin123'
        }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAdminUsers(usersData || []);
      }

      // 3. Audit Logs
      const logsRes = await fetch('/api/admin/audit-logs', {
        headers: {
          'x-admin-email': user.email,
          'x-admin-password': 'admin123'
        }
      });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAdminAuditLogs(logsData || []);
      }
    } catch (e) {
      console.error('[fetchAdminPanelState error]', e);
    } finally {
      setLoadingAdminData(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeRoleTab === 'traveler') {
        fetchTravelerLeads();
      } else if (activeRoleTab === 'partner') {
        fetchPartnerState();
      } else if ((activeRoleTab as string) === 'admin' || (activeRoleTab as string) === 'super_admin') {
        fetchAdminPanelState();
      }
    }
  }, [user, activeRoleTab]);

  const submitPhotoContributionInner = async () => {
    if (!photoUploadedUrl) {
      setNotification({ type: 'error', message: 'Please select and upload a scenic photo from your device!' });
      return;
    }
    if (!photoUploaderName.trim()) {
      setNotification({ type: 'error', message: 'Traveler name is required.' });
      return;
    }
    if (!photoUploaderEmail.trim()) {
      setNotification({ type: 'error', message: 'Contact email is required.' });
      return;
    }
    if (!photoSelectedDestId) {
      setNotification({ type: 'error', message: 'Please map this scenic view to a specific destination.' });
      return;
    }

    try {
      const payload = {
        userId: user ? (user.uid || user.email) : 'anonymous',
        travellerName: photoUploaderName,
        travellerEmail: photoUploaderEmail,
        destinationId: photoSelectedDestId,
        imageUrl: photoUploadedUrl
      };

      const res = await fetch('/api/photo-contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: 'Your photo has been submitted and is awaiting review.' });
        setPhotoUploadedUrl('');
        if (user) {
          fetchUserPhotoData(user);
        }
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to submit photo contribution.' });
      }
    } catch (err: any) {
      console.error('[Submit Photo Err]', err);
      setNotification({ type: 'error', message: 'Fail to communicate with HillyTrip contributions server.' });
    }
  };

  const handlePhotoContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    executeProtectedAction('upload community photos', () => {
      submitPhotoContributionInner();
    });
  };

  const [currentUserRole, setCurrentUserRole] = useState<'super_admin' | 'admin' | 'moderator' | null>(null);

  const checkAdminRights = async (email: string, retryCount = 0) => {
    if (!email) {
      setIsAdmin(false);
      setCurrentUserRole(null);
      return;
    }

    // Direct check from current user session/state
    const currentUser = (user as any) || (auth?.currentUser as any);
    if (currentUser) {
      const r = (currentUser.role || '').toLowerCase();
      const roles = Array.isArray(currentUser.roles) ? currentUser.roles.map((x: any) => String(x).toLowerCase()) : [];
      if (r === 'super_admin' || currentUser.isSuperAdmin || roles.includes('super_admin')) {
        setIsAdmin(true);
        setCurrentUserRole('super_admin');
        return;
      }
      if (r === 'admin' || currentUser.isAdmin || roles.includes('admin')) {
        setIsAdmin(true);
        setCurrentUserRole('admin');
        return;
      }
    }

    try {
      const response = await fetch(`/api/check-admin-role?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const data = await response.json();
      if (data.isAdmin) {
        setIsAdmin(true);
        setCurrentUserRole(data.role);
      } else {
        // Only reset if user state does not have admin role
        if (!currentUser?.isAdmin && !currentUser?.isSuperAdmin) {
          setIsAdmin(false);
          setCurrentUserRole(null);
        }
      }
    } catch (e) {
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`Error checking admin status (attempt ${retryCount + 1} failed). Retrying in ${delay}ms...`, e);
        setTimeout(() => {
          checkAdminRights(email, retryCount + 1);
        }, delay);
      } else {
        console.error('Error checking admin status:', e);
      }
    }
  };

  // Set up Firebase Authentication active state listener and iframe/tab message listener
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        const { user, idToken, accessToken } = event.data;
        if (user) {
          try {
            if (idToken || accessToken) {
              await signInWithGoogleCredentials(idToken, accessToken);
            } else {
              setUser(user as User);
              if (user.email) {
                await checkAdminRights(user.email);
              }
            }
            setIsIframeLoginModalOpen(false);
            setNotification({
              type: 'success',
              message: `Successfully authenticated via secure standalone tab!`
            });
          } catch (error: any) {
            console.error('Error handling sync login from tab:', error);
            setNotification({
              type: 'error',
              message: `Authentication sync failed: ${error?.message || 'Unknown error'}`
            });
          }
        }
      }
    };

    const handleIframeLoginRequired = () => {
      handleUserLogin();
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('hillytrip_iframe_login_required', handleIframeLoginRequired);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser as any);
      if (firebaseUser?.email) {
        checkAdminRights(firebaseUser.email);
        
        // If we are a standalone tab opened by the iframe, send auth credentials back to the opener!
        if (typeof window !== 'undefined' && window.opener) {
          try {
            window.opener.postMessage({
              type: 'GOOGLE_OAUTH_SUCCESS',
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
              }
            }, window.location.origin);
          } catch (e) {
            console.error('Failed to notify opener window:', e);
          }
        }
      } else {
        setIsAdmin(false);
        setCurrentUserRole(null);
      }
    });

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('hillytrip_iframe_login_required', handleIframeLoginRequired);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Standalone window login companion helper
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('trigger_iframe_auth') === 'true') {
      const timer = setTimeout(() => {
        setShowGoogleSimulator(true);
        setNotification({
          type: 'success',
          message: 'Secure Sandboxed Google Sign-In activated.'
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Subscriptions for likes and comments
  useEffect(() => {
    if (user && pendingAction) {
      const actionToExecute = pendingAction;
      setPendingAction(null);
      
      const runAction = async () => {
        if (actionToExecute.requiresVerification && !user.emailVerified) {
          setNotification({
            type: 'error',
            message: '✉️ Please verify your email to unlock community features.'
          });
          return;
        }
        
        try {
          await actionToExecute.callback();
          
          let niceMsg = '✓ Action Completed';
          const lowerName = (actionToExecute.name || '').toLowerCase();
          if (lowerName.includes('like')) {
            niceMsg = '✓ Added to Favorites';
          } else if (lowerName.includes('save') || lowerName.includes('wishlist')) {
            niceMsg = '✓ Saved to Wishlist';
          } else if (lowerName.includes('comment')) {
            niceMsg = '✓ Comment Added';
          } else if (lowerName.includes('review')) {
            niceMsg = '✓ Review Submitted';
          } else if (lowerName.includes('booking') || lowerName.includes('quote') || lowerName.includes('inquiry')) {
            niceMsg = '✓ Booking Started';
          } else if (lowerName.includes('claim')) {
            niceMsg = '✓ Business Claimed';
          } else if (lowerName.includes('create')) {
            niceMsg = '✓ Business Created';
          } else if (lowerName.includes('dashboard')) {
            niceMsg = '✓ Dashboard Unlocked';
          } else if (lowerName.includes('upload') || lowerName.includes('moment') || lowerName.includes('photo')) {
            niceMsg = '✓ Photo Uploaded';
          } else {
            niceMsg = `✓ ${actionToExecute.name} Completed`;
          }

          setNotification({
            type: 'success',
            message: niceMsg
          });
        } catch (error) {
          console.error('Error auto-resuming pending action:', error);
        }
      };
      
      const timer = setTimeout(runAction, 300);
      return () => clearTimeout(timer);
    }
  }, [user, pendingAction]);

  // Auto-link pending business claim upon login
  useEffect(() => {
    if (!user) return;
    const pendingClaim = getPendingClaim();
    if (pendingClaim && pendingClaim.listingId) {
      clearPendingClaim();
      const userId = user.id || (user as any).uid || '';
      const userEmail = user.email || pendingClaim.email || '';
      const userName = user.name || (user as any).displayName || pendingClaim.ownerName || '';
      
      claimBusinessLocally({
        listingId: pendingClaim.listingId,
        listingName: pendingClaim.listingName || 'Homestay',
        listingType: pendingClaim.listingType || 'Homestay',
        ownerUserId: userId,
        ownerName: userName,
        mobile: pendingClaim.mobile || (user as any).mobile || '',
        email: userEmail,
        claimedFrom: 'Web',
        claimSource: pendingClaim.claimSource || 'Listing Page'
      }).then(() => {
        setNotification({
          type: 'success',
          message: `Business ${pendingClaim.listingName || ''} successfully linked to your account!`
        });
        navigate('/partner');
      }).catch((err: any) => {
        console.warn('[Pending Claim Auto-link Error]', err);
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    const unsubscribeLikes = onSnapshot(collection(db, 'likes'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setLikes(items);
    }, (error) => {
      console.warn("Error loading real-time likes:", error);
    });

    const unsubscribeComments = onSnapshot(collection(db, 'comments'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      // Sort comments by timestamp
      items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setComments(items);
    }, (error) => {
      console.warn("Error loading real-time comments:", error);
    });

    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      // Sort reviews by timestamp descending (newest first)
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setReviews(items);
    }, (error) => {
      console.warn("Error loading real-time reviews:", error);
    });

    return () => {
      if (unsubscribeLikes) unsubscribeLikes();
      if (unsubscribeComments) unsubscribeComments();
      if (unsubscribeReviews) unsubscribeReviews();
    };
  }, []);

  // Social engagement action triggers
  const [savedPlaces, setSavedPlaces] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hillytrip_saved_places') || localStorage.getItem('hillytrip_likes') || localStorage.getItem('hillytrip_saved');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(x => typeof x === 'string');
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const list = Array.isArray(savedPlaces) ? savedPlaces : [];
    localStorage.setItem('hillytrip_saved_places', JSON.stringify(list));

    try {
      const hwRaw = localStorage.getItem('hillytrip_homestay_wishlist');
      const hwList: string[] = hwRaw ? JSON.parse(hwRaw) : [];
      const combined = Array.from(new Set([
        ...list,
        ...(Array.isArray(hwList) ? hwList : [])
      ]));
      localStorage.setItem('hillytrip_likes', JSON.stringify(combined));
      localStorage.setItem('hillytrip_saved', JSON.stringify(combined));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  }, [savedPlaces]);

  const isItemSaved = (id: string) => {
    if (!id) return false;
    const list = Array.isArray(savedPlaces) ? savedPlaces : [];
    return list.includes(id);
  };

  const saveUserContext = (
    actionName: string,
    requiresVerification: boolean,
    serializableAction?: any
  ) => {
    try {
      const context = {
        currentHash,
        currentPath,
        scrollPosition: window.scrollY,
        activeDestDetail: activeDestDetail ? { id: activeDestDetail.destination?.id } : null,
        activeAttrDetail: activeAttrDetail ? { id: activeAttrDetail.attraction?.id } : null,
        activeHomeDetail: activeHomeDetail ? { id: activeHomeDetail.homestay?.id } : null,
        activeRoleTab,
        searchTab,
        searchFrom,
        searchTo,
        gemFilterType,
        attractionFilter,
        destTypeFilter,
        pendingAction: {
          name: actionName,
          requiresVerification,
          serializable: serializableAction || { type: 'GENERIC_CALLBACK', payload: {} }
        }
      };
      sessionStorage.setItem('hillytrip_auth_context', JSON.stringify(context));
      localStorage.setItem('hillytrip_auth_context', JSON.stringify(context));
    } catch (err) {
      console.error('Error saving user context:', err);
    }
  };

  const restoreUserContext = useCallback(() => {
    try {
      const rawContext = sessionStorage.getItem('hillytrip_auth_context') || localStorage.getItem('hillytrip_auth_context');
      if (!rawContext) return;
      const context = JSON.parse(rawContext);
      
      // Restore view/route/tab/filters
      if (context.currentHash && context.currentHash !== currentHash) {
        navigate(context.currentHash);
      }
      if (context.activeRoleTab) {
        setActiveRoleTab(context.activeRoleTab);
      }
      if (context.searchTab) setSearchTab(context.searchTab);
      if (context.searchFrom) setSearchFrom(context.searchFrom);
      if (context.searchTo) setSearchTo(context.searchTo);
      if (context.gemFilterType) setGemFilterType(context.gemFilterType);
      if (context.attractionFilter) setAttractionFilter(context.attractionFilter);
      if (context.destTypeFilter) setDestTypeFilter(context.destTypeFilter);

      // Restore active entities
      if (context.activeDestDetail?.id) {
        const d = destinations.find(x => x.id === context.activeDestDetail.id);
        if (d) setActiveDestDetail({ destination: d });
      }
      if (context.activeAttrDetail?.id) {
        const a = attractions.find(x => x.id === context.activeAttrDetail.id);
        if (a) setActiveAttrDetail({ attraction: a });
      }
      if (context.activeHomeDetail?.id) {
        const h = homestays.find(x => x.id === context.activeHomeDetail.id);
        if (h) setActiveHomeDetail({ homestay: h });
      }

      // Restore Scroll position
      if (typeof context.scrollPosition === 'number') {
        setTimeout(() => {
          window.scrollTo({ top: context.scrollPosition, behavior: 'instant' });
        }, 150);
      }

      // Restore pending Action if user is now authenticated!
      if (context.pendingAction) {
        const pAct = context.pendingAction;
        const reconstructedCallback = () => {
          const sAct = pAct.serializable;
          if (!sAct) return;
          
          switch (sAct.type) {
            case 'LIKE_ATTRACTION':
            case 'LIKE_DESTINATION':
            case 'LIKE_PHOTO':
              toggleLike(sAct.payload.contentId, sAct.payload.contentType);
              break;
            case 'SAVE_HOMESTAY':
            case 'SAVE_DESTINATION':
            case 'SAVE_ATTRACTION':
              handleToggleSave(sAct.payload.id, sAct.payload.type);
              break;
            case 'SUBMIT_COMMENT':
              addCommentAction(sAct.payload.contentId, sAct.payload.contentType, sAct.payload.text);
              break;
            case 'SUBMIT_REVIEW':
              addReviewAction(
                sAct.payload.destinationId,
                sAct.payload.rating,
                sAct.payload.title,
                sAct.payload.content,
                sAct.payload.visitDate,
                sAct.payload.recommends
              );
              break;
            case 'BOOK_HOMESTAY':
              if (sAct.payload) {
                hillyTripFetch('/api/booking-leads/create', {
                  method: 'POST',
                  body: JSON.stringify(sAct.payload)
                }).then(res => res.json()).then(data => {
                  if (data.success) {
                    setNotification({ type: 'success', message: '🏡 Booking Started! Our operator will contact you.' });
                  }
                });
              }
              break;
            case 'BOOK_TAXI':
              if (sAct.payload) {
                hillyTripFetch('/api/quote-requests', {
                  method: 'POST',
                  body: JSON.stringify(sAct.payload)
                }).then(res => res.json()).then(data => {
                  if (data.success) {
                    setNotification({ type: 'success', message: '🚖 Taxi Quote Requested! Broadcast is live.' });
                  }
                });
              }
              break;
            case 'SAVE_ROUTE':
              try {
                const savedList = JSON.parse(localStorage.getItem('hillytrip_saved_routes') || '[]');
                if (sAct.payload.id && !savedList.includes(sAct.payload.id)) {
                  localStorage.setItem('hillytrip_saved_routes', JSON.stringify([...savedList, sAct.payload.id]));
                }
                setNotification({ type: 'success', message: '✓ Route pinned to Saved Journeys!' });
              } catch (e) {}
              break;
            case 'CLAIM_BUSINESS':
              if (sAct.payload && sAct.payload.listingId) {
                const userId = user?.id || (user as any)?.uid || '';
                const userEmail = user?.email || sAct.payload.email || '';
                const userName = user?.name || (user as any)?.displayName || sAct.payload.ownerName || '';
                claimBusinessLocally({
                  listingId: sAct.payload.listingId,
                  listingName: sAct.payload.listingName || 'Homestay',
                  listingType: sAct.payload.listingType || 'Homestay',
                  ownerUserId: userId,
                  ownerName: userName,
                  mobile: sAct.payload.mobile || (user as any)?.mobile || '',
                  email: userEmail,
                  claimedFrom: 'Web',
                  claimSource: sAct.payload.claimSource || 'Listing Page'
                }).then(() => {
                  setNotification({
                    type: 'success',
                    message: `Business ${sAct.payload.listingName || ''} successfully linked to your account!`
                  });
                  navigate('/partner');
                }).catch((err: any) => {
                  console.warn('[Pending Claim Reconstructed Callback Error]', err);
                });
              }
              break;
            default:
              console.log('Restored generic callback execution.');
          }
        };

        setPendingAction({
          name: pAct.name,
          callback: reconstructedCallback,
          requiresVerification: pAct.requiresVerification
        });
      }

      // Clear restored context
      sessionStorage.removeItem('hillytrip_auth_context');
      localStorage.removeItem('hillytrip_auth_context');
    } catch (err) {
      console.error('Error restoring user context:', err);
    }
  }, [currentHash, destinations, attractions, homestays]);

  // Restore saved context once baseline catalog data has finished loading on boot
  useEffect(() => {
    if (destinations.length > 0 && attractions.length > 0 && homestays.length > 0) {
      restoreUserContext();
    }
  }, [destinations, attractions, homestays, restoreUserContext]);

  const executeProtectedAction = (
    actionName: string, 
    actionCallback: () => void, 
    requiresVerification = false,
    serializableAction?: any
  ) => {
    if (!user) {
      setPendingAction({ name: actionName, callback: actionCallback, requiresVerification });
      saveUserContext(actionName, requiresVerification, serializableAction);
      handleUserLogin();
      setNotification({
        type: 'error',
        message: `🔐 Authentication required to ${actionName}.`
      });
      return;
    }

    if (requiresVerification && !user.emailVerified) {
      setNotification({
        type: 'error',
        message: '✉️ Please verify your email to unlock community features.'
      });
      return;
    }

    actionCallback();
  };

  const withAuthentication = <Args extends any[]>(
    actionName: string,
    callback: (...args: Args) => Promise<void> | void,
    requiresVerification = false,
    serializableType?: string
  ) => {
    return async (...args: Args): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        let serializableAction: any = undefined;
        if (serializableType) {
          if (serializableType === 'LIKE') {
            serializableAction = {
              type: 'LIKE_ATTRACTION',
              payload: { contentId: args[0], contentType: args[1] }
            };
          } else if (serializableType === 'SAVE') {
            serializableAction = {
              type: 'SAVE_HOMESTAY',
              payload: { id: args[0], type: args[1] }
            };
          } else if (serializableType === 'COMMENT') {
            serializableAction = {
              type: 'SUBMIT_COMMENT',
              payload: { contentId: args[0], contentType: args[1], text: args[2] }
            };
          } else if (serializableType === 'REVIEW') {
            serializableAction = {
              type: 'SUBMIT_REVIEW',
              payload: {
                destinationId: args[0],
                rating: args[1],
                title: args[2],
                content: args[3],
                visitDate: args[4],
                recommends: args[5]
              }
            };
          }
        }

        executeProtectedAction(
          actionName,
          async () => {
            try {
              await callback(...args);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          requiresVerification,
          serializableAction
        );
      });
    };
  };

  const handleToggleSave = withAuthentication('save places', async (id: string, type: 'destination' | 'attraction' | 'homestay') => {
    if (!id) return;
    const isSaved = isItemSaved(id);
    
    setSavedPlaces(prev => {
      if (isSaved) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });

    if (!isSaved) {
      if (type === 'destination') {
        const d = destinations.find(x => (x?.id || '') === id || toSlug(x?.id) === toSlug(id));
        if (d) trackSaveDestination(id, d.name || '', 'destination');
      } else if (type === 'attraction') {
        const a = attractions.find(x => (x?.id || '') === id || toSlug(x?.id) === toSlug(id));
        if (a) trackSaveDestination(id, a.name || '', 'attraction');
      } else if (type === 'homestay') {
        const h = homestays.find(x => (x?.id || '') === id || toSlug(x?.id) === toSlug(id));
        if (h) trackSaveDestination(id, h.name || '', 'homestay');
      }
    }

    setNotification({
      type: 'success',
      message: isSaved ? 'Removed from Saved Places!' : '🔖 Saved to your local collection!'
    });
  }, false, 'SAVE');

  const toggleLike = withAuthentication('like', async (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => {
    const likeId = `${user!.uid}_${contentId}`;
    const docRef = doc(db, 'likes', likeId);
    const alreadyLiked = likes.some((l) => l.id === likeId);
    
    const previousLikes = [...likes];
    
    // Optimistic Update
    if (alreadyLiked) {
      setLikes(prev => prev.filter((l) => l.id !== likeId));
    } else {
      setLikes(prev => [...prev, {
        id: likeId,
        userId: user!.uid,
        contentId,
        contentType,
        timestamp: new Date().toISOString()
      }]);
    }

    // Track GA4 like custom events
    if (contentType === 'destination') {
      const d = destinations.find(x => (x?.id || '') === contentId || toSlug(x?.id) === toSlug(contentId));
      if (d) trackLikeDestination(contentId, d.name || '', !alreadyLiked, 'destination');
    } else if (contentType === 'attraction') {
      const a = attractions.find(x => (x?.id || '') === contentId || toSlug(x?.id) === toSlug(contentId));
      if (a) trackLikeDestination(contentId, a.name || '', !alreadyLiked, 'attraction');
    }

    try {
      if (alreadyLiked) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          id: likeId,
          userId: user!.uid,
          contentId,
          contentType,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      setLikes(previousLikes);
      console.error("Error toggling like:", error);
      setNotification({ type: 'error', message: 'Failed to update like status.' });
      handleFirestoreError(error, alreadyLiked ? OperationType.DELETE : OperationType.WRITE, `likes/${likeId}`);
    }
  }, false, 'LIKE');

  const addCommentAction = withAuthentication('comment', async (contentId: string, contentType: 'destination' | 'attraction' | 'photo', text: string) => {
    if (!text.trim()) return;
    
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newComment = {
      id: commentId,
      userId: user!.uid,
      userName: user!.displayName || user!.email || 'Registered Traveler',
      contentId,
      contentType,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    const previousComments = [...comments];
    
    // Optimistic Update
    setComments(prev => [...prev, newComment]);

    try {
      await setDoc(doc(db, 'comments', commentId), newComment);
    } catch (error) {
      setComments(previousComments);
      console.error("Error adding comment:", error);
      setNotification({ type: 'error', message: 'Failed to submit comment.' });
      handleFirestoreError(error, OperationType.WRITE, `comments/${commentId}`);
    }
  }, false, 'COMMENT');

  const deleteCommentAction = async (commentId: string) => {
    const previousComments = [...comments];

    // Optimistic Update
    setComments(prev => prev.filter(c => c.id !== commentId));

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      setNotification({ type: 'success', message: 'Comment has been removed successfully.' });
    } catch (error) {
      setComments(previousComments);
      console.error("Error deleting comment:", error);
      setNotification({ type: 'error', message: 'Failed to delete comment.' });
      handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
    }
  };

  const addReviewAction = withAuthentication('submit review', async (destinationId: string, rating: number, title: string, content: string, visitDate: string, recommends: boolean) => {
    if (!title.trim() || !content.trim() || !visitDate) {
      setNotification({ type: 'error', message: 'Please fill in all review fields.' });
      return;
    }

    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newReview = {
      id: reviewId,
      destinationId,
      userId: user!.uid,
      userName: user!.displayName || user!.email || 'Registered Traveler',
      userEmail: user!.email || '',
      rating,
      title: title.trim(),
      content: content.trim(),
      visitDate,
      recommends,
      timestamp: new Date().toISOString()
    };

    const previousReviews = [...reviews];
    setReviews(prev => [newReview, ...prev]);

    try {
      await setDoc(doc(db, 'reviews', reviewId), newReview);
      setNotification({ type: 'success', message: '⭐ Your review has been published!' });
    } catch (error) {
      setReviews(previousReviews);
      console.error("Error adding review:", error);
      setNotification({ type: 'error', message: 'Failed to submit review.' });
      handleFirestoreError(error, OperationType.WRITE, `reviews/${reviewId}`);
    }
  }, false, 'REVIEW');

  const deleteReviewAction = async (reviewId: string) => {
    const previousReviews = [...reviews];
    setReviews(prev => prev.filter(r => r.id !== reviewId));

    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setNotification({ type: 'success', message: 'Review has been removed.' });
    } catch (error) {
      setReviews(previousReviews);
      console.error("Error deleting review:", error);
      setNotification({ type: 'error', message: 'Failed to delete review.' });
      handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  const handleProfileRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail || !profilePassword || !profileName || !profileUsername) {
      setNotification({ type: 'error', message: 'Please fill in all required (*) registration details!' });
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileEmail)) {
      setNotification({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    // Password strength check (min 8 characters)
    if (profilePassword.length < 8) {
      setNotification({ type: 'error', message: 'Password must be at least 8 characters long.' });
      return;
    }
    if (profilePassword !== profileConfirmPassword) {
      setNotification({ type: 'error', message: 'Password confirmation mismatch!' });
      return;
    }
    setAuthLoading(true);
    try {
      const res = await signUpWithEmailAndPassword(profileEmail, profileUsername, profileName, profilePassword);
      if (res?.user) {
        setNotification({ 
          type: 'success', 
          message: 'Success! A verification email has been sent. Please verify your email to unlock community features!' 
        });
        setIsSignUp(false);
      } else {
        setNotification({ type: 'error', message: 'Failed to complete registration.' });
      }
    } catch (err: any) {
      console.error('[Register Err]', err);
      setNotification({ type: 'error', message: err?.message || 'Failed to complete registration.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail || !profilePassword) {
      setNotification({ type: 'error', message: 'Email and password are required!' });
      return;
    }
    setAuthLoading(true);
    try {
      const res = await signInWithEmailAndPassword(profileEmail, profilePassword);
      if (res?.user) {
        setNotification({ 
          type: 'success', 
          message: `Logged in successfully! Welcome back, ${res.user.user_metadata?.full_name || res.user.email}` 
        });

        // Trigger active workspace roles synchronization
        const customRoles = res.user.user_metadata?.roles || ['traveler'];
        if (customRoles.includes('admin') || customRoles.includes('super_admin') || res.user.email === 'amrkmurarka@gmail.com') {
          setIsAdmin(true);
        }

        // Execute pending action if any
        if (pendingAction) {
          if (pendingAction.requiresVerification && !res.user.email_confirmed_at) {
            setNotification({ 
              type: 'error', 
              message: '✉️ Please verify your email to unlock community features.' 
            });
          } else {
            pendingAction.callback();
            setNotification({ type: 'success', message: 'Your original action has been automatically completed!' });
          }
          setPendingAction(null);
        }
      }
    } catch (err: any) {
      console.error('[Login Err]', err);
      setNotification({ type: 'error', message: err?.message || 'Invalid email or password.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleIframeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError('Email and Password are required!');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await signInWithEmailAndPassword(authEmail, authPassword);
      if (res?.user) {
        setNotification({ 
          type: 'success', 
          message: `Welcome back, ${res.user.user_metadata?.full_name || res.user.email}!` 
        });
        setIsIframeLoginModalOpen(false);
        // Clear auth fields
        setAuthEmail('');
        setAuthPassword('');
        setAuthError('');
        
        // Execute pending action if any
        if (pendingAction) {
          if (pendingAction.requiresVerification && !res.user.email_confirmed_at) {
            setNotification({ 
              type: 'error', 
              message: '✉️ Please verify your email to unlock community features.' 
            });
          } else {
            pendingAction.callback();
            setNotification({ type: 'success', message: 'Your original action has been automatically completed!' });
          }
          setPendingAction(null);
        }
      }
    } catch (err: any) {
      console.error('[Iframe Login Error]', err);
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleIframeRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authFullName || !authUsername) {
      setAuthError('All fields are required!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authEmail)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (authPassword.length < 8) {
      setAuthError('Password must be at least 8 characters.');
      return;
    }
    
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await signUpWithEmailAndPassword(authEmail, authUsername.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ''), authFullName, authPassword);
      if (res?.user) {
        setNotification({ 
          type: 'success', 
          message: 'Success! A verification email has been sent. Please confirm your email.' 
        });
        setAuthFormType('signin');
        setAuthPassword('');
        setAuthError('');
      }
    } catch (err: any) {
      console.error('[Iframe Register Error]', err);
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setNotification({ type: 'error', message: 'Email address is required.' });
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setNotification({ 
        type: 'success', 
        message: 'Password reset link sent! Please check your inbox.' 
      });
      setShowForgotPassword(false);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to send reset link.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setNotification({ type: 'error', message: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setNotification({ type: 'error', message: 'Password confirmation mismatch!' });
      return;
    }
    setAuthLoading(true);
    try {
      await updateUserPassword(newPassword);
      setNotification({ 
        type: 'success', 
        message: 'Password updated successfully!' 
      });
      setIsResetPasswordMode(false);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to update password.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: editProfileName,
          mobile: editProfileMobile,
          password: editProfilePassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        handleSetUser(data.user);
        setEditProfilePassword('');
        setNotification({ type: 'success', message: 'Profile details updated and synchronized secure.' });
      } else {
        setNotification({ type: 'error', message: data.error || 'Server rejected changes.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Network transport error while updating profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePartnerApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyBusinessName || !applyPartnerLocation) {
      setNotification({ type: 'error', message: 'Business Name and Location are required!' });
      return;
    }
    setApplyPartnerLoading(true);
    try {
      const res = await fetch('/api/user/apply-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || user?.email,
          businessName: applyBusinessName,
          businessType: applyBusinessType,
          partnerLocation: applyPartnerLocation,
          partnerMobile: applyPartnerMobile || user?.mobile || '',
          partnerDocuments: applyPartnerDocs
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Partner nomination registered. Verification queue is now active.' });
        // update memory user
        const updatedUser = {
          ...user!,
          partnerStatus: 'pending' as const,
          businessName: applyBusinessName,
          businessType: applyBusinessType,
          partnerLocation: applyPartnerLocation,
          partnerMobile: applyPartnerMobile || user?.mobile,
          partnerDocuments: applyPartnerDocs
        };
        handleSetUser(updatedUser);
      } else {
        setNotification({ type: 'error', message: data.error || 'Request submission failed.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Onboarding transfer interruption.' });
    } finally {
      setApplyPartnerLoading(false);
    }
  };

  const handleContributorApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyContribRegion || !applyContribReason) {
      setNotification({ type: 'error', message: 'Contribution region and personal explanation are required!' });
      return;
    }
    setApplyContribLoading(true);
    try {
      const res = await fetch('/api/user/apply-contributor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || user?.email,
          contributorRegion: applyContribRegion,
          contributorReason: applyContribReason,
          contributorExperience: applyContribExperience
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Contributor enrollment submitted. Verification pending.' });
        // update memory user
        const updatedUser = {
          ...user!,
          contributorStatus: 'pending' as const,
          contributorRegion: applyContribRegion,
          contributorReason: applyContribReason,
          contributorExperience: applyContribExperience
        };
        handleSetUser(updatedUser);
      } else {
        setNotification({ type: 'error', message: data.error || 'Contributor application failed.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Contributor pipeline failure.' });
    } finally {
      setApplyContribLoading(false);
    }
  };

  const handleIframeDemoLogin = async (demoRole: 'traveler' | 'partner' | 'admin') => {
    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: demoRole })
      });
      if (!response.ok) {
        throw new Error(`Demo login endpoint error: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.user) {
        handleSetUser(data.user);
        if (demoRole === 'admin') {
          setIsAdmin(true);
          setCurrentUserRole('super_admin');
        } else if (demoRole === 'partner') {
          setIsAdmin(false);
          setCurrentUserRole(null);
          setActiveRoleTab('partner');
        } else {
          setIsAdmin(false);
          setCurrentUserRole(null);
          setActiveRoleTab('traveler');
        }
        setIsIframeLoginModalOpen(false);
        setNotification({
          type: 'success',
          message: `Logged in safely as ${data.user.name} (Demo Mode)`
        });
      } else {
        throw new Error(data.error || 'Server rejected demo login request');
      }
    } catch (e: any) {
      console.error('Demo auto login failure:', e);
      setNotification({
        type: 'error',
        message: e.message || 'Demo pipeline failure.'
      });
    }
  };

  const handleSimulatedGoogleLogin = async (email: string, name: string) => {
    try {
      setSimulatedLoading(true);
      const response = await fetch('/api/auth/google-simulated-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`
        })
      });

      if (!response.ok) {
        throw new Error('Simulation authentication failed');
      }

      const data = await response.json();
      if (data.success && data.user) {
        handleSetUser(data.user);
        if (data.user.role === 'super_admin' || data.user.roles.includes('admin')) {
          setIsAdmin(true);
          setCurrentUserRole('super_admin');
        } else {
          setIsAdmin(false);
          setCurrentUserRole(null);
        }
        
        setShowGoogleSimulator(false);
        setIsIframeLoginModalOpen(false);

        setNotification({
          type: 'success',
          message: `Successfully signed in via Google: ${data.user.name} (${data.user.email})`
        });

        // If we are on the standalone page, post a message back to the parent window!
        if (typeof window !== 'undefined' && window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_OAUTH_SUCCESS',
            user: data.user
          }, window.location.origin);
          
          setTimeout(() => {
            window.close();
          }, 1200);
        }
      }
    } catch (err: any) {
      console.error('Google Simulation error:', err);
      setNotification({
        type: 'error',
        message: err?.message || 'Google Sign-In Simulation failed.'
      });
    } finally {
      setSimulatedLoading(false);
    }
  };

  const handleUserLogin = async () => {
    if (currentPath !== '/login' && currentPath !== '/signup' && currentHash !== '#/login' && currentHash !== '#/signup') {
      previousPathRef.current = currentPath;
    }
    setAuthFormType('assistant');
    setAuthError('');
    setIsIframeLoginModalOpen(false);
    navigate('/login');
  };

  const handleUserLogout = async () => {
    try {
      await logout();
      handleSetUser(null);
      setIsAdmin(false);
      setCurrentUserRole(null);
      setNotification({
        type: 'success',
        message: 'Signed out of secure session successfully.'
      });
    } catch (error: any) {
      console.error('Logout process failure:', error);
      handleSetUser(null);
      setIsAdmin(false);
      setCurrentUserRole(null);
      setNotification({
        type: 'success',
        message: 'Signed out of session successfully.'
      });
    }
  };

  // Session Security: 30-minute Inactivity Auto-Logout (Requirement 5)
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    let lastActivityTime = Date.now();

    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    const interval = setInterval(() => {
      if (Date.now() - lastActivityTime >= INACTIVITY_TIMEOUT_MS) {
        console.warn('Session expired due to 30 minutes of inactivity.');
        handleUserLogout();
        setNotification({
          type: 'error',
          message: 'Session expired due to 30 minutes of inactivity. Please sign in again.'
        });
        navigate('/login');
      }
    }, 15000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(interval);
    };
  }, [user]);

  // Always scroll to top when any page or detail view is opened
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // SEO Protection (Requirement 7): Inject noindex, nofollow on admin routes
    const isAdminRoute = currentPath.startsWith('/admin') ||
                         currentPath.includes('/admin/') ||
                         currentPath === '/system-health' ||
                         currentPath === '/platform-console' ||
                         currentPath === '/operations' ||
                         currentPath === '/ops';

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    if (isAdminRoute) {
      robotsMeta.content = 'noindex, nofollow';
    } else {
      robotsMeta.content = 'index, follow';
    }
  }, [currentHash, currentPath, activeDestDetail, activeAttrDetail, activeHomeDetail]);

  // Listen for router history and parameter updates
  useEffect(() => {
    // Globally load GA4 on startup
    initGA();

    const handlePopState = () => {
      const path = window.location.hash ? window.location.hash.substring(1) : (window.location.pathname || '/');
      setCurrentHash(path);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    const handleHashChange = () => {
      const path = window.location.hash ? window.location.hash.substring(1) : (window.location.pathname || '/');
      setCurrentHash(path);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Trigger loading based on current route path details
  useEffect(() => {
    const loadRouteData = async () => {
      // Do not unconditionally trigger setLoading(true) on every route change.
      // We resolve local state instantly and only set loading for uncached asynchronous fetches.
      
      const localSearchRoutes = (fromHubId: string, toHubId: string): RouteSearchResult[] => {
        const currentHubs = hubs || [];
        const currentRoutes = routes || [];

        const hubsMap = new Map<string, Hub>();
        currentHubs.forEach(h => hubsMap.set(h.id.toLowerCase().trim(), h));

        const adj = new Map<string, Route[]>();
        currentRoutes.forEach(r => {
          const rf = r.fromHubId.toLowerCase().trim();
          const rt = r.toHubId.toLowerCase().trim();

          if (!adj.has(rf)) adj.set(rf, []);
          if (!adj.has(rt)) adj.set(rt, []);

          adj.get(rf)!.push(r);
          
          // Reversed connection
          const revRoute: Route = {
            ...r,
            fromHubId: r.toHubId,
            toHubId: r.fromHubId,
            path: r.path ? [...r.path].reverse() : []
          };
          adj.get(rt)!.push(revRoute);
        });

        const results: RouteSearchResult[] = [];

        const fromHub = hubsMap.get(fromHubId.toLowerCase().trim());
        const toHub = hubsMap.get(toHubId.toLowerCase().trim());

        console.log('[Route Detail Diagnostic - Engine Audit]');
        console.log(`- Source Node Query ID: "${fromHubId}" (Normalized mapping found: ${fromHub ? `Hub "${fromHub.name}" [ID: ${fromHub.id}]` : 'None'})`);
        console.log(`- Destination Node Query ID: "${toHubId}" (Normalized mapping found: ${toHub ? `Hub "${toHub.name}" [ID: ${toHub.id}]` : 'None'})`);
        console.log(`- Graph Node Count: ${currentHubs.length}`);
        console.log(`- Graph Edge Count: ${currentRoutes.length}`);

        if (!fromHub || !toHub) {
          console.log('- BFS Terminated: Source or destination node not mapped in graph keys.');
          return [];
        }

        const fIdNormalized = fromHub.id.toLowerCase().trim();
        const tIdNormalized = toHub.id.toLowerCase().trim();

        // Find direct routes
        const directRoutes = currentRoutes.filter(r => {
          const rf = r.fromHubId.toLowerCase().trim();
          const rt = r.toHubId.toLowerCase().trim();
          return (rf === fIdNormalized && rt === tIdNormalized) ||
                 (rf === tIdNormalized && rt === fIdNormalized);
        });

        directRoutes.forEach(r => {
          const rf = r.fromHubId.toLowerCase().trim();
          const rt = r.toHubId.toLowerCase().trim();
          if (rf === tIdNormalized && rt === fIdNormalized) {
            results.push({
              route: {
                ...r,
                fromHubId: fromHub.id,
                toHubId: toHub.id,
                path: r.path ? [...r.path].reverse() : []
              },
              fromHub,
              toHub
            });
          } else {
            results.push({
              route: {
                ...r,
                fromHubId: fromHub.id,
                toHubId: toHub.id
              },
              fromHub,
              toHub
            });
          }
        });

        // Queue for BFS: [current, routing_path]
        const queue: [string, Route[]][] = [];
        const startRoutes = adj.get(fIdNormalized) || [];
        startRoutes.forEach(r => {
          const rt = r.toHubId.toLowerCase().trim();
          queue.push([rt, [r]]);
        });

        const indirectPathsFound: Route[][] = [];
        const MAX_HOPS = 18;
        const MAX_VISITS_PER_NODE = 1;
        const MAX_PATHS = 8;
        const expansionCount = new Map<string, number>();

        while (queue.length > 0 && indirectPathsFound.length < MAX_PATHS) {
          const [curr, pathRoutes] = queue.shift()!;
          if (pathRoutes.length > MAX_HOPS) continue;

          if (curr === tIdNormalized) {
            if (pathRoutes.length > 1) {
              indirectPathsFound.push(pathRoutes);
            }
            continue;
          }

          const expansions = expansionCount.get(curr) || 0;
          if (expansions >= MAX_VISITS_PER_NODE) continue;
          expansionCount.set(curr, expansions + 1);

          const neighbors = adj.get(curr) || [];
          for (const r of neighbors) {
            const nextHub = (r.toHubId || '').toLowerCase().trim();
            const visitedInCurrentPath = pathRoutes.some(pr => (pr.fromHubId || '').toLowerCase().trim() === nextHub) || (curr === nextHub);
            if (visitedInCurrentPath) continue;
            queue.push([nextHub, [...pathRoutes, r]]);
          }
        }

        indirectPathsFound.forEach(p => {
          const combinedPath: string[] = [fromHub.name];
          let totalFareMin = 0;
          let totalFareMax = 0;
          let totalTimeMin = 0;
          let totalTimeMax = 0;
          let allVerified = true;

          const hops = p.map(route => {
            const fh: Hub = hubsMap.get((route.fromHubId || '').toLowerCase().trim()) || { id: route.fromHubId || '', name: route.fromHubId || '', type: 'sub_hub' };
            const th: Hub = hubsMap.get((route.toHubId || '').toLowerCase().trim()) || { id: route.toHubId || '', name: route.toHubId || '', type: 'sub_hub' };
            totalFareMin += route.fareMin;
            totalFareMax += route.fareMax;
            totalTimeMin += route.timeMin;
            totalTimeMax += route.timeMax;
            if (!route.verified) allVerified = false;

            const cleanStopsInRoute = route.path ? route.path.slice(1) : [];
            combinedPath.push(...cleanStopsInRoute);

            return {
              fromHub: fh,
              toHub: th,
              route
            };
          });

          const virtualMultiHopRoute: Route = {
            id: `dynamic-hop-${p.map(r => r.id).join('-')}`,
            fromHubId: fromHub.id,
            toHubId: toHub.id,
            path: combinedPath,
            type: 'Indirect',
            fareMin: totalFareMin,
            fareMax: totalFareMax,
            timeMin: totalTimeMin,
            timeMax: totalTimeMax,
            verified: allVerified,
            lastUpdated: new Date().toISOString().split('T')[0]
          };

          results.push({
            route: virtualMultiHopRoute,
            fromHub,
            toHub,
            hops
          });
        });

        console.log(`- BFS Paths Computed Result count: ${results.length}`);
        if (results.length > 0) {
          console.log('- Paths detail:', results.map(r => `${r.route.fromHubId} -> ${r.route.toHubId} (Hops: ${r.hops ? r.hops.length : 1}, Time: ${r.route.timeMin}-${r.route.timeMax}m)`).join(' | '));
        } else {
          console.log('- BFS Pathfinding failed to connect these specific nodes.');
        }

        return results;
      };

      try {
        if (currentPath === '' || currentPath === '/' || currentPath === '#/') {
          // Home
        } else if (currentPath.startsWith('/journeys/') || currentPath.startsWith('/routes/')) {
          // 7. Diagnostic logging: received slug
          console.log('[Journey Diagnostic] received slug:', currentPath);
          const rawRouteSlug = currentPath
            .replace('/journeys/', '')
            .replace('#/journeys/', '')
            .replace('/journey/', '')
            .replace('#/journey/', '')
            .replace('/routes/', '')
            .replace('#/routes/', '')
            .replace('/route/', '')
            .replace('#/route/', '');
          const decodedRouteSlug = decodeURIComponent(rawRouteSlug);

          // Canonicalize route ID to slug if hubs are loaded
          if (hubs && hubs.length > 0 && destinations && destinations.length > 0) {
            const params = decodedRouteSlug.split('-to-');
            if (params.length === 2) {
              const [fromId, toId] = params;
              const resolveToHubSlugName = (slugOrId: string): string => {
                const clean = slugOrId.trim().toLowerCase();
                const foundHub = hubs.find(h => 
                  (h?.id || '').toLowerCase() === clean || 
                  toSlug(h?.id) === toSlug(clean) || 
                  (h?.name || '').toLowerCase() === clean || 
                  toSlug(h?.name) === toSlug(clean)
                );
                if (foundHub) return toSlug(foundHub.name);
                const foundDest = destinations.find(d => 
                  (d?.id || '').toLowerCase() === clean || 
                  toSlug(d?.id) === toSlug(clean) || 
                  (d?.name || '').toLowerCase() === clean || 
                  toSlug(d?.name) === toSlug(clean)
                );
                if (foundDest) {
                  const nearHub = hubs.find(h => (h?.id || '').toLowerCase() === (foundDest.nearestHubId || '').toLowerCase().trim());
                  if (nearHub) return toSlug(nearHub.name);
                }
                return slugOrId;
              };
              const fromSlug = resolveToHubSlugName(fromId);
              const toSlugVal = resolveToHubSlugName(toId);
              const canonicalRouteSlug = `${fromSlug}-to-${toSlugVal}`;

              if (decodedRouteSlug !== canonicalRouteSlug && fromSlug && toSlugVal) {
                const cleanPath = `/journeys/${canonicalRouteSlug}`;
                if (currentPath !== cleanPath && tempPath !== cleanPath) {
                  console.log(`[SEO Client Redirect] Replacing journey slug '${decodedRouteSlug}' with canonical '${canonicalRouteSlug}'`);
                  if (typeof window !== 'undefined') {
                    const targetHash = '#' + cleanPath;
                    if (window.location.hash !== targetHash) {
                      window.history.replaceState(null, '', targetHash);
                    }
                  }
                  setCurrentHash('#' + cleanPath);
                }
                return;
              }
            }
          }

          // 5. Log required diagnostics
          console.log('[Route Detail Diagnostic] raw URL parameter:', rawRouteSlug);
          console.log('[Route Detail Diagnostic] decoded parameter:', decodedRouteSlug);
          console.log('[Route Detail Diagnostic] database lookup key:', decodedRouteSlug);

          const params = decodedRouteSlug.split('-to-');
          if (params.length === 2) {
            const [fromId, toId] = params;
            // 7. Diagnostic logging: parsed source and destination
            console.log('[Route Diagnostic] parsed source:', fromId);
            console.log('[Route Diagnostic] parsed destination:', toId);

            // Use loaded hubs list immediately without network wait
            let allHubsList: Hub[] = hubs && hubs.length > 0 ? hubs : [];
            if (allHubsList.length === 0) {
              try {
                const hubsRes = await fetch('/api/hubs');
                if (hubsRes.ok) {
                  const contentType = hubsRes.headers.get('content-type') || '';
                  if (contentType.includes('application/json')) {
                    const text = await hubsRes.text();
                    if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                      allHubsList = JSON.parse(text);
                    }
                  }
                }
              } catch (err) {
                console.error('[Route Parser] Error loading hubs:', err);
              }
            }
            if (!Array.isArray(allHubsList) || allHubsList.length === 0) {
              allHubsList = hubs || [];
            }

            // Slug-to-Hub ID Resolution function
            const resolveSlugToHubId = (slugName: string): string => {
              const clean = slugName.trim().toLowerCase();
              if (!clean) return '';

              const currentHubs = hubs || [];
              const currentDests = destinations || [];
              const currentAttrs = attractions || [];

              // Strict custom slugify helper for comparisons
              const getSlug = (text: string): string => {
                if (!text) return '';
                return text
                  .toLowerCase()
                  .replace(/[^a-z0-9\s_'-]/g, '')
                  .trim()
                  .replace(/[\s_']+/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-+|-+$/g, '');
              };

              const cleanSlug = getSlug(slugName);

              // 4. Map requirements:
              if (clean === 'njp' || cleanSlug === 'njp') return 'NJP';
              if (clean === 'darjeeling' || cleanSlug === 'darjeeling') return 'Darjeeling';
              if (clean === 'kalimpong' || cleanSlug === 'kalimpong') return 'Kalimpong';
              if (clean === 'lava' || cleanSlug === 'lava') return 'Lava';

              // 3. Support case-insensitive matching on ID first
              const byId = allHubsList.find(h => (h?.id || '').toLowerCase() === clean || getSlug(h?.id || '') === cleanSlug);
              if (byId) return byId.id;

              // 6. If a slug matches a hub name, automatically resolve it
              const byName = allHubsList.find(h => (h?.name || '').toLowerCase() === clean || getSlug(h?.name || '') === cleanSlug);
              if (byName) return byName.id;

              // Check if matches a destination's name, ID or slug, and resolve to nearestHubId
              const byDest = currentDests.find(d => 
                (d?.id || '').toLowerCase() === clean || 
                getSlug(d?.id || '') === cleanSlug || 
                (d?.name || '').toLowerCase() === clean || 
                getSlug(d?.name || '') === cleanSlug
              );
              if (byDest && byDest.nearestHubId) {
                const nearHub = allHubsList.find(h => (h?.id || '').toLowerCase() === (byDest.nearestHubId || '').toLowerCase().trim());
                if (nearHub) return nearHub.id;
              }

              // Check if matches an attraction's name, ID or slug
              const byAttr = currentAttrs.find(a => 
                (a?.id || '').toLowerCase() === clean || 
                getSlug(a?.id || '') === cleanSlug || 
                (a?.name || '').toLowerCase() === clean || 
                getSlug(a?.name || '') === cleanSlug
              );
              if (byAttr) {
                if (byAttr.nearestHubId) {
                  const nearHub = allHubsList.find(h => (h?.id || '').toLowerCase() === (byAttr.nearestHubId || '').toLowerCase().trim());
                  if (nearHub) return nearHub.id;
                }
                // Fallback to parent destination's nearestHubId
                if (byAttr.destinationId) {
                  const parentDest = currentDests.find(d => d.id === byAttr.destinationId);
                  if (parentDest && parentDest.nearestHubId) {
                    const nearHub = allHubsList.find(h => (h?.id || '').toLowerCase() === (parentDest.nearestHubId || '').toLowerCase().trim());
                    if (nearHub) return nearHub.id;
                  }
                }
              }

              // Check substring fuzzy matching on hubs as last resort
              const fuzzyHub = allHubsList.find(h => 
                (h?.name || '').toLowerCase().includes(clean) || 
                clean.includes((h?.name || '').toLowerCase()) ||
                getSlug(h?.name || '').includes(cleanSlug) ||
                cleanSlug.includes(getSlug(h?.name || ''))
              );
              if (fuzzyHub) return fuzzyHub.id;

              return slugName; // Return original if no match
            };

            const resolvedFromId = resolveSlugToHubId(fromId);
            const resolvedToId = resolveSlugToHubId(toId);

            // Track GA4 Route Search
            trackRouteSearch(resolvedFromId, resolvedToId);

            // 7. Diagnostic logging: resolved hub IDs
            console.log('[Route Diagnostic] resolved hub IDs:', {
              from: resolvedFromId,
              to: resolvedToId
            });

            // 5. Update search input state to match resolved endpoints
            setSearchFrom(resolvedFromId);
            setSearchTo(resolvedToId);
          }
        } else if (currentPath.startsWith('/destinations/')) {
          const rawDestId = currentPath.replace('/destinations/', '').replace('#/destinations/', '').replace('/destination/', '').replace('#/destination/', '').replace('/villages/', '').replace('#/villages/', '').replace('/village/', '').replace('#/village/', '');
          const decodedDestId = decodeURIComponent(rawDestId);

          if (destinations && destinations.length > 0) {
            const foundDest = destinations.find(x => 
              (x?.id || '').toLowerCase() === decodedDestId.toLowerCase() || 
              toSlug(x?.id) === toSlug(decodedDestId) || 
              toSlug(x?.name) === toSlug(decodedDestId)
            );
            if (foundDest) {
              const canonicalSlug = toSlug(foundDest.name || foundDest.id);
              const cleanPath = `/destinations/${canonicalSlug}`;
              if (decodedDestId !== canonicalSlug && currentPath !== cleanPath && tempPath !== cleanPath) {
                console.log(`[SEO Client Redirect] Replacing ID/slug '${decodedDestId}' with canonical slug '${canonicalSlug}'`);
                if (typeof window !== 'undefined') {
                  const targetHash = '#' + cleanPath;
                  if (window.location.hash !== targetHash) {
                    window.history.replaceState(null, '', targetHash);
                  }
                }
                setCurrentHash('#' + cleanPath);
                return;
              }
            }
          }

          // Reset expanded toggles for clean page load
          setDestAttractionsExpanded(false);
          setDestLodgingExpanded(false);
          setDestTransitExpanded(false);
          setDestCommentsExpanded(false);

          // 5. Log required diagnostics
          console.log('[Destination Detail Diagnostic] raw URL parameter:', rawDestId);
          console.log('[Destination Detail Diagnostic] decoded parameter:', decodedDestId);
          console.log('[Destination Detail Diagnostic] database lookup key:', decodedDestId);

          // Try to load local memory or cached destination details immediately for 0ms transitions
          const localDest = (destinations || []).find(d => 
            (d?.id || '').toLowerCase() === (decodedDestId || '').toLowerCase() || 
            (d?.slug || '').toLowerCase() === (decodedDestId || '').toLowerCase() ||
            toSlug(d?.slug) === toSlug(decodedDestId) ||
            (d?.name || '').toLowerCase() === (decodedDestId || '').toLowerCase() ||
            toSlug(d?.id) === toSlug(decodedDestId) ||
            toSlug(d?.name) === toSlug(decodedDestId)
          );

          let loadedInstantly = false;
          if (localDest) {
            let localAttractions = (attractions || []).filter(a => a.destinationId === localDest.id || (a as any).destination_id === localDest.id);
            let localHomestays = (homestays || []).filter(h => ((h.destinationId || '').toLowerCase() === (localDest.id || '').toLowerCase() || (h.village_id || '').toLowerCase() === (localDest.id || '').toLowerCase() || (h.address || '').toLowerCase().includes((localDest.name || '').toLowerCase())) && isHomestayPublic(h));
            const matchingHubs = (hubs || []).filter(h => 
              (h?.name || '').toLowerCase().includes((localDest.name || '').toLowerCase()) || 
              (localDest.name || '').toLowerCase().includes((h?.name || '').toLowerCase())
            );
            const hubIds = matchingHubs.map(h => h.id);
            const localRoutes = (routes || []).filter(r => 
              hubIds.includes(r.fromHubId) || hubIds.includes(r.toHubId)
            );

            let localTaxiStands: any[] = [];
            const numLat = localDest.latitude != null ? Number(localDest.latitude) : null;
            const numLng = localDest.longitude != null ? Number(localDest.longitude) : null;

            if (isValidGeoCoordinate(numLat, numLng) && numLat != null && numLng != null) {
              if (localAttractions.length === 0 && attractions && attractions.length > 0) {
                localAttractions = findNearbyEntities(numLat, numLng, attractions, { maxRadiusKm: 25, limit: 36 })
                  .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
              }
              if (localHomestays.length === 0 && homestays && homestays.length > 0) {
                localHomestays = findNearbyEntities(numLat, numLng, homestays.filter(isHomestayPublic), { maxRadiusKm: 25, limit: 36 })
                  .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
              }
              if (hubs && hubs.length > 0) {
                localTaxiStands = findNearbyEntities(numLat, numLng, hubs, { maxRadiusKm: 35, limit: 36 })
                  .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
              }
            }

            setActiveDestDetail({
              destination: localDest,
              attractions: localAttractions,
              homestays: localHomestays,
              taxi_stands: localTaxiStands,
              routes: localRoutes
            });
            loadedInstantly = true;
          } else {
            const cacheKey = `hillytrip_cache_dest_${decodedDestId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                setActiveDestDetail(parsed);
                loadedInstantly = true;
              } catch (e) {}
            }
          }

          if (!loadedInstantly) {
            setLoading(true);
          }

          let fetchedDetail = null;
          try {
            const cacheKey = `hillytrip_cache_dest_${decodedDestId}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const [destRes, photosRes] = await Promise.all([
              fetch(`/api/destinations/${encodeURIComponent(decodedDestId)}`, { signal: controller.signal }),
              fetch(`/api/images?status=Approved&destinationId=${encodeURIComponent(decodedDestId)}`, { signal: controller.signal })
            ]);
            clearTimeout(timeoutId);
            if (destRes.ok) {
              const contentType = destRes.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const text = await destRes.text();
                if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                  const data = JSON.parse(text);
                  if (data && !data.offline) {
                    const destObj = data.destination || data;
                    const dLat = destObj.latitude != null ? Number(destObj.latitude) : null;
                    const dLng = destObj.longitude != null ? Number(destObj.longitude) : null;
                    let mergedAttrs = Array.isArray(data.attractions) ? [...data.attractions] : [];
                    let mergedStays = Array.isArray(data.homestays) ? [...data.homestays] : [];
                    let mergedTaxis = Array.isArray(data.taxi_stands || data.taxiStands) ? [...(data.taxi_stands || data.taxiStands)] : [];

                    if (isValidGeoCoordinate(dLat, dLng) && dLat != null && dLng != null) {
                      if (mergedAttrs.length === 0 && attractions && attractions.length > 0) {
                        mergedAttrs = findNearbyEntities(dLat, dLng, attractions, { maxRadiusKm: 25, limit: 36 })
                          .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
                      }
                      if (mergedStays.length === 0 && homestays && homestays.length > 0) {
                        mergedStays = findNearbyEntities(dLat, dLng, homestays.filter(isHomestayPublic), { maxRadiusKm: 25, limit: 36 })
                          .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
                      }
                      if (mergedTaxis.length === 0 && hubs && hubs.length > 0) {
                        mergedTaxis = findNearbyEntities(dLat, dLng, hubs, { maxRadiusKm: 35, limit: 36 })
                          .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
                      }
                    }

                    const normalizedData = {
                      ...data,
                      destination: destObj,
                      attractions: mergedAttrs,
                      homestays: mergedStays,
                      taxi_stands: mergedTaxis
                    };
                    fetchedDetail = normalizedData;
                    setActiveDestDetail(normalizedData);
                    try {
                      localStorage.setItem(cacheKey, JSON.stringify(normalizedData));
                    } catch (e) {
                      console.warn(e);
                    }
                  }
                }
              }
            }
            if (photosRes.ok) {
              const contentType = photosRes.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const text = await photosRes.text();
                if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                  const photos = JSON.parse(text);
                  if (photos && !photos.offline) {
                    setActivePhotos(photos);
                  }
                }
              }
            }
          } catch (err: any) {
            if (err?.name !== 'AbortError' && !err?.message?.includes('aborted')) {
              console.warn('[Route Parser] Destination details API fallback triggered:', err?.message || err);
            }
          }
        } else if (currentPath.startsWith('/attractions/') || currentPath.startsWith('/attraction/')) {
          const rawAttrId = currentPath.replace('/attractions/', '').replace('#/attractions/', '').replace('/attraction/', '').replace('#/attraction/', '');
          const decodedAttrId = decodeURIComponent(rawAttrId);

          if (attractions && attractions.length > 0) {
            const foundAttr = attractions.find(x => 
              (x?.id || '').toLowerCase() === decodedAttrId.toLowerCase() || 
              (x?.slug || '').toLowerCase() === decodedAttrId.toLowerCase() ||
              toSlug(x?.slug) === toSlug(decodedAttrId) || 
              toSlug(x?.id) === toSlug(decodedAttrId) || 
              toSlug(x?.name) === toSlug(decodedAttrId) ||
              getItemSlug(x) === toSlug(decodedAttrId)
            );
            if (foundAttr) {
              const canonicalSlug = getItemSlug(foundAttr) || toSlug(foundAttr.name || foundAttr.id);
              const cleanPath = `/attraction/${canonicalSlug}`;
              if (typeof window !== 'undefined') {
                const currentBrowserPath = window.location.pathname;
                const currentBrowserHash = window.location.hash;
                if (currentBrowserPath !== cleanPath || currentBrowserHash) {
                  console.log(`[SEO Client Redirect] Replacing '${window.location.href}' with canonical '${cleanPath}'`);
                  const querySuffix = window.location.search || '';
                  window.history.replaceState(null, '', cleanPath + querySuffix);
                  setCurrentHash(cleanPath);
                  return;
                }
              }
            }
          }

          // Reset attraction details interactive states
          setAttrCommentsExpanded(false);
          setAttrLeadSuccess(false);

          // 5. Log required diagnostics
          console.log('[Attraction Detail Diagnostic] attraction URL parameter:', rawAttrId);
          console.log('[Attraction Detail Diagnostic] attraction lookup field:', decodedAttrId);

          // Try to load local memory or cached attraction details immediately for 0ms transitions
          const localAttr = (attractions || []).find(a => 
            (a?.id || '').toLowerCase() === (decodedAttrId || '').toLowerCase() || 
            (a?.slug || '').toLowerCase() === (decodedAttrId || '').toLowerCase() ||
            toSlug(a?.slug) === toSlug(decodedAttrId) ||
            (a?.name || '').toLowerCase() === (decodedAttrId || '').toLowerCase() ||
            toSlug(a?.id) === toSlug(decodedAttrId) ||
            toSlug(a?.name) === toSlug(decodedAttrId)
          );

          let loadedAttrInstantly = false;
          if (localAttr) {
            const destination = (destinations || []).find(d => d.id === localAttr.destinationId);
            const hIds = [];
            if (localAttr.nearestHubId) hIds.push(localAttr.nearestHubId);
            if (destination && destination.nearestHubId) hIds.push(destination.nearestHubId);
            const localRoutes = (routes || []).filter(r => hIds.includes(r.fromHubId) || hIds.includes(r.toHubId));

            setActiveAttrDetail({
              attraction: localAttr,
              destination: destination || null,
              routes: localRoutes
            });
            loadedAttrInstantly = true;
          } else {
            const cacheKey = `hillytrip_cache_attr_${decodedAttrId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                setActiveAttrDetail(parsed);
                loadedAttrInstantly = true;
              } catch (e) {}
            }
          }

          if (!loadedAttrInstantly) {
            setLoading(true);
          }

          let fetchedAttr = null;
          try {
            const cacheKey = `hillytrip_cache_attr_${decodedAttrId}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const [attrRes, photosRes] = await Promise.all([
              fetch(`/api/attractions/${encodeURIComponent(decodedAttrId)}`, { signal: controller.signal }),
              fetch(`/api/images?status=Approved&attractionId=${encodeURIComponent(decodedAttrId)}`, { signal: controller.signal })
            ]);
            clearTimeout(timeoutId);
            if (attrRes.ok) {
              const contentType = attrRes.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const text = await attrRes.text();
                if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                  const data = JSON.parse(text);
                  if (data && !data.offline) {
                    fetchedAttr = data;
                    setActiveAttrDetail(data);
                    const fetchedSingleAttr = data?.attraction || data;
                    if (fetchedSingleAttr) {
                      const canonicalSlug = getItemSlug(fetchedSingleAttr) || toSlug(fetchedSingleAttr.name || fetchedSingleAttr.id);
                      if (canonicalSlug) {
                        const cleanPath = `/attraction/${canonicalSlug}`;
                        if (typeof window !== 'undefined') {
                          const currentBrowserPath = window.location.pathname;
                          const currentBrowserHash = window.location.hash;
                          if (currentBrowserPath !== cleanPath || currentBrowserHash) {
                            console.log(`[SEO Client Redirect (Async)] Cleanly replacing '${window.location.href}' with canonical '${cleanPath}'`);
                            const querySuffix = window.location.search || '';
                            window.history.replaceState(null, '', cleanPath + querySuffix);
                            setCurrentHash(cleanPath);
                          }
                        }
                      }
                    }
                    try {
                      localStorage.setItem(cacheKey, JSON.stringify(data));
                    } catch (e) {
                      console.warn(e);
                    }
                  }
                }
              }
            }
            if (photosRes.ok) {
              const contentType = photosRes.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const text = await photosRes.text();
                if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                  const photos = JSON.parse(text);
                  if (photos && !photos.offline) {
                    setActivePhotos(photos);
                  }
                }
              }
            }
          } catch (err: any) {
            if (err?.name !== 'AbortError' && !err?.message?.includes('aborted')) {
              console.warn('[Route Parser] Attraction API fallback triggered:', err?.message || err);
            }
          }
        } else if (currentPath.startsWith('/homestays/') || currentPath.startsWith('/homestay/') || currentPath.startsWith('/stays/') || currentPath.startsWith('/stay/')) {
          const rawHomeId = currentPath.replace(/^\/(homestays|homestay|stays|stay)\//, '').replace(/^#\/(homestays|homestay|stays|stay)\//, '');
          const decodedHomeId = decodeURIComponent(rawHomeId);

          // 5. Log required diagnostics
          console.log('[Homestay Detail Diagnostic] raw URL parameter:', rawHomeId);
          console.log('[Homestay Detail Diagnostic] decoded parameter:', decodedHomeId);

          const targetSlug = toSlug(decodedHomeId);
          const localHome = (homestays || []).find(h => {
            if (!h) return false;
            if ((h.id || '').toLowerCase() === decodedHomeId.toLowerCase()) return true;
            if ((h.slug || '').toLowerCase() === decodedHomeId.toLowerCase()) return true;
            if (toSlug(h.slug) === targetSlug) return true;
            if ((h.name || '').toLowerCase() === decodedHomeId.toLowerCase()) return true;
            if (toSlug(h.id) === targetSlug) return true;
            if (toSlug(h.name) === targetSlug) return true;
            if (getItemSlug(h) === targetSlug) return true;
            return false;
          });

          let loadedHomeInstantly = false;
          if (localHome) {
            const destination = (destinations || []).find(d => d.id === localHome.destinationId || (d as any).destination_id === localHome.destinationId);
            setActiveHomeDetail({
              homestay: localHome,
              destination: destination || null,
              comments: [],
              roomCategories: [],
              roomImages: [],
              homestayGallery: (localHome.images || []).map((url: string, index: number) => ({
                id: `HG-${localHome.id}-${index}`,
                homestayId: localHome.id,
                image_url: url,
                display_order: index + 1
              })),
              homestayReviews: []
            });
            loadedHomeInstantly = true;
          } else {
            const cacheKey = `hillytrip_cache_homestay_${decodedHomeId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                setActiveHomeDetail(parsed);
                loadedHomeInstantly = true;
              } catch (e) {}
            }
          }

          if (loadedHomeInstantly) {
            // Background async sync for reviews/gallery without blocking 0ms render
            const cacheKey = `hillytrip_cache_homestay_${decodedHomeId}`;
            fetch(`/api/homestays/${encodeURIComponent(decodedHomeId)}`)
              .then(res => res.ok ? res.json() : null)
              .then(data => {
                if (data && !data.offline) {
                  setActiveHomeDetail(data);
                  try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
                }
              })
              .catch(err => console.warn('[Background Homestay Sync]', err));
          } else {
            setLoading(true);
            try {
              const cacheKey = `hillytrip_cache_homestay_${decodedHomeId}`;
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000);
              const res = await fetch(`/api/homestays/${encodeURIComponent(decodedHomeId)}`, {
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              if (res.ok) {
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                  const text = await res.text();
                  if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                    const data = JSON.parse(text);
                    if (data && !data.offline) {
                      setActiveHomeDetail(data);
                      try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
                    }
                  }
                }
              }
            } catch (err: any) {
              if (err?.name !== 'AbortError' && !err?.message?.includes('aborted')) {
                console.warn('[Route Parser] Homestay API fallback triggered:', err?.message || err);
              }
            }
          }
        } else if (currentPath.startsWith('/admin') && isAdmin) {
          if (currentPath === '/admin/analytics') {
            setAdminActiveTab('analytics');
          }
          await loadAdminDashboard();
        }
      } catch (err) {
        console.error('Data route loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 1200);

    loadRouteData().finally(() => {
      clearTimeout(safetyTimeout);
      setLoading(false);
    });
  }, [currentPath, isAdmin, hubs, routes, destinations, attractions, homestays]);

  // Client-Side SEO Management hook
  useEffect(() => {
    let title = "HillyTrip - India's Intelligent Mountain Travel Network";
    let desc = "India's Intelligent Mountain Travel Network - Your comprehensive travel intelligence platform for Himalayan routes, attractions, and eco-homestays.";
    let imageUrl = "/images/hillytrip/himalayan-landscape.svg";
    let schemaObj: any = null;

    if (currentPath.startsWith('/destinations/')) {
      const p = currentPath.replace('/destinations/', '').replace('#/destinations/', '').replace('/destination/', '').replace('#/destination/', '');
      const d = destinations.find(x => (x?.id || '') === p || toSlug(x?.id) === toSlug(p) || toSlug(x?.name) === toSlug(p));
      if (d) {
        title = `${d.name || ''} - Travel Guide | HilliTrip`;
        desc = `${d.name || ''} Travel Guide: Explore this pristine ${d.tourismType || 'village'} in ${d.district || ''}, ${d.state || ''}. Best season to visit is ${d.bestSeason || 'any season'}. ${d.description || ''}`.substring(0, 155);
        imageUrl = d.image || imageUrl;

        // Structured data Place Schema
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "Place",
          "name": d.name || '',
          "description": d.description || '',
          "image": d.image || '',
          "address": {
            "@type": "PostalAddress",
            "addressLocality": d.district || '',
            "addressRegion": d.state || '',
            "addressCountry": "India"
          }
        };
      }
    } else if (currentPath.startsWith('/attractions/') || currentPath.startsWith('/attraction/')) {
      const p = currentPath.replace('/attractions/', '').replace('#/attractions/', '').replace('/attraction/', '').replace('#/attraction/', '');
      const a = attractions.find(x => (x?.id || '') === p || toSlug(x?.id) === toSlug(p) || toSlug(x?.name) === toSlug(p));
      if (a) {
        title = `${a.name || ''} - Travel Guide | HilliTrip`;
        desc = `Discover ${a.name || ''}, a cozy ${a.category || 'Sightseeing Spot'} attraction in ${a.district || ''}, ${a.state || ''}. Key highlights: ${a.description || ''}`.substring(0, 155);
        imageUrl = a.image || imageUrl;

        // Structured TouristAttraction Schema
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          "name": a.name || '',
          "description": a.description || '',
          "image": a.image || '',
          "address": {
            "@type": "PostalAddress",
            "addressLocality": a.district || '',
            "addressRegion": a.state || '',
            "addressCountry": "India"
          }
        };
      }
    } else if (currentPath.startsWith('/homestays/')) {
      const p = currentPath.replace('/homestays/', '').replace('#/homestays/', '').replace('/homestay/', '').replace('#/homestay/', '');
      const h = homestays.find(x => (x?.id || '') === p || toSlug(x?.id) === toSlug(p) || toSlug(x?.name) === toSlug(p));
      if (h) {
        title = `${h.name} - Photos, Contact & Details | HilliTrip`;
        const bStatus = h.breakfastIncluded === 'Not Included' ? 'Breakfast exl' : 'Breakfast included';
        desc = `${h.name} Homestay: Premium organic stay in ${h.district || ''}, ${h.state || ''}. Features: ${bStatus}, clean amenities. Rates start at ₹${h.priceMin}. ${h.description || ''}`.substring(0, 155);
        imageUrl = (h.images && h.images[0]) || imageUrl;

        // Structured LodgingBusiness Schema
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          "name": h.name,
          "description": h.description || '',
          "image": imageUrl,
          "priceRange": `INR ${h.priceMin} - ${h.priceMax}`,
          "telephone": h.contact,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": h.district || '',
            "addressRegion": h.state || '',
            "addressCountry": "India"
          }
        };
      }
    } else if (currentPath === '/plan-my-trip') {
      title = "Himalayan Journey Planner & Map Intelligence - Plan My Trip | HilliTrip";
      desc = "Plan your high-altitude journeys with hilly intelligence coordinates, travel vectors, shareable journey lines, and certified expert driver details.";
    } else if (currentPath === '/book-car') {
      title = "Expert Mountain Car Hire & Driver Escorts | HilliTrip";
      desc = "Secure reliable mountains car hires and certified expert local drivers. Highly trained pilots for navigating steep gradients, snow, and rain safely.";
    } else if (currentPath === '/contribute') {
      title = "Help Document Himalayan Eco-Villages - Contribute Photos | HilliTrip";
      desc = "Add pristine photos, unexplored scenic base coordinates, travel guides, and mountain lodge locations to help sustainable travel communities.";
    } else if (currentPath.split('?')[0] === '/destinations') {
      title = "Himalayan Base Villages & Tea Garden Hubs | HilliTrip";
      desc = "Explore HillyTrip's directory of beautiful off-the-grid base villages, offbeat locations, secret hill sanctuaries, and eco-retreat hubs.";
    } else if (currentPath === '/attractions') {
      title = "Scenic Sightseeing Views, Treks & High-Altitude Passes | HilliTrip";
      desc = "Discover pristine waterfalls, monasteries, sunrise viewpoints, forests, rhododendron nature parks, and hidden trekking routes in the Himalayas.";
    } else if (currentPath === '/journeys' || currentPath.split('?')[0] === '/journeys') {
      title = "Explore Himalayan Journeys & Scenic Road Trips | HilliTrip";
      desc = "Discover handpicked road trips, scenic drives, weekend escapes, and unforgettable Himalayan experiences across North Bengal & Sikkim.";
    } else if (currentPath.startsWith('/journeys/') || currentPath.startsWith('/routes/')) {
      const p = currentPath
        .replace('/journeys/', '')
        .replace('#/journeys/', '')
        .replace('/journey/', '')
        .replace('#/journey/', '')
        .replace('/routes/', '')
        .replace('#/routes/', '')
        .replace('/route/', '')
        .replace('#/route/', '');
      let rt = routes.find(x => (x?.id || '').toLowerCase() === p.toLowerCase() || toSlug(x?.id) === toSlug(p));
      if (!rt && p.includes('-to-')) {
        const partsSlug = p.split('-to-');
        const fromPart = partsSlug[0] || '';
        const toPart = partsSlug[1] || '';
        rt = routes.find(r => 
          (toSlug(r.fromHubId).toLowerCase() === fromPart && toSlug(r.toHubId).toLowerCase() === toPart) ||
          (toSlug(r.toHubId).toLowerCase() === fromPart && toSlug(r.fromHubId).toLowerCase() === toPart)
        );
      }
      if (rt) {
        const fromHub = hubs.find(h => h.id === rt.fromHubId) || { id: rt.fromHubId, name: rt.fromHubId };
        const toHub = hubs.find(h => h.id === rt.toHubId) || { id: rt.toHubId, name: rt.toHubId };
        title = `${fromHub.name} to ${toHub.name} Journey Details, Map & Travel Experience | HilliTrip`;
        desc = `Experience the journey from ${fromHub.name} to ${toHub.name}. Distance is ${rt.distance || 'N/A'} km, travel time is around ${rt.timeMin}-${rt.timeMax} mins. Live conditions, attractions, homestays & taxi fare guidance.`;
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "TravelAction",
          "name": `Himalayan Journey from ${fromHub.name} to ${toHub.name}`,
          "description": desc,
          "origin": {
            "@id": fromHub.id,
            "name": fromHub.name
          },
          "destination": {
            "@id": toHub.id,
            "name": toHub.name
          },
          "distance": `${rt.distance || ''} km`
        };
      }
    }

    if (desc.length > 165) {
      desc = desc.substring(0, 160) + '...';
    }

    document.title = title;

    let mDesc = document.querySelector('meta[name="description"]');
    if (!mDesc) {
      mDesc = document.createElement('meta');
      mDesc.setAttribute('name', 'description');
      document.head.appendChild(mDesc);
    }
    mDesc.setAttribute('content', desc);

    let cTag = document.querySelector('link[rel="canonical"]');
    if (!cTag) {
      cTag = document.createElement('link');
      cTag.setAttribute('rel', 'canonical');
      document.head.appendChild(cTag);
    }
    const cleanUrlPath = currentPath.startsWith('#') ? currentPath.substring(1) : currentPath;
    cTag.setAttribute('href', `https://hillytrip.com${cleanUrlPath}`);

    let ogT = document.querySelector('meta[property="og:title"]');
    if (!ogT) { ogT = document.createElement('meta'); ogT.setAttribute('property', 'og:title'); document.head.appendChild(ogT); }
    ogT.setAttribute('content', title);

    let ogD = document.querySelector('meta[property="og:description"]');
    if (!ogD) { ogD = document.createElement('meta'); ogD.setAttribute('property', 'og:description'); document.head.appendChild(ogD); }
    ogD.setAttribute('content', desc);

    let ogI = document.querySelector('meta[property="og:image"]');
    if (!ogI) { ogI = document.createElement('meta'); ogI.setAttribute('property', 'og:image'); document.head.appendChild(ogI); }
    ogI.setAttribute('content', imageUrl);

    let ogU = document.querySelector('meta[property="og:url"]');
    if (!ogU) { ogU = document.createElement('meta'); ogU.setAttribute('property', 'og:url'); document.head.appendChild(ogU); }
    ogU.setAttribute('content', `https://hillytrip.com${cleanUrlPath}`);

    let twT = document.querySelector('meta[name="twitter:title"]');
    if (!twT) { twT = document.createElement('meta'); twT.setAttribute('name', 'twitter:title'); document.head.appendChild(twT); }
    twT.setAttribute('content', title);

    let twD = document.querySelector('meta[name="twitter:description"]');
    if (!twD) { twD = document.createElement('meta'); twD.setAttribute('name', 'twitter:description'); document.head.appendChild(twD); }
    twD.setAttribute('content', desc);

    let twI = document.querySelector('meta[name="twitter:image"]');
    if (!twI) { twI = document.createElement('meta'); twI.setAttribute('name', 'twitter:image'); document.head.appendChild(twI); }
    twI.setAttribute('content', imageUrl);

    let scriptTag = document.getElementById('seo-json-ld');
    if (scriptTag) {
      scriptTag.remove();
    }
    if (schemaObj) {
      const script = document.createElement('script');
      script.id = 'seo-json-ld';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    }

    // Capture manual pageview on route shifts
    trackPageView(currentPath);
  }, [currentPath, destinations, attractions, homestays, routes, hubs]);

  // Track Destination detailed view custom events
  useEffect(() => {
    if (activeDestDetail?.destination?.id) {
      trackDestinationView(activeDestDetail.destination.id, activeDestDetail.destination.name);
    }
  }, [activeDestDetail?.destination?.id]);

  // Track Attraction detailed view custom events
  useEffect(() => {
    if (activeAttrDetail?.attraction?.id) {
      trackAttractionView(
        activeAttrDetail.attraction.id,
        activeAttrDetail.attraction.name,
        activeAttrDetail.attraction.category
      );
    }
  }, [activeAttrDetail?.attraction?.id]);

  // Load User Analytics directly from Firebase
  const loadUserAnalytics = async () => {
    setAdminUserAnalyticsLoading(true);
    try {
      const headers = { 'x-admin-password': 'admin123' };
      const res = await fetch('/api/admin/user-analytics', { headers });
      if (res.ok) {
        const data = await res.json();
        setAdminUserAnalytics(data);
      } else {
        console.error('Failed to load user analytics', res.statusText);
      }
    } catch (e) {
      console.error('Failed to fetch user analytics:', e);
    } finally {
      setAdminUserAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && adminActiveTab === 'analytics') {
      loadUserAnalytics();
    }
  }, [adminActiveTab, isAdmin]);

  useEffect(() => {
    if (['stats', 'analytics', 'audit_logs'].includes(adminActiveTab)) {
      setExpandedGroup('monitoring');
    } else if (['leads', 'car-leads', 'contributions'].includes(adminActiveTab)) {
      setExpandedGroup('operations');
    } else if (['add-data', 'bulk-import', 'location-intelligence', 'cover_management', 'homepage_content', 'brand_management'].includes(adminActiveTab)) {
      setExpandedGroup('data');
    } else if (['registrations', 'partner-management', 'photo_approvals', 'images', 'app_notifications', 'system_reports'].includes(adminActiveTab)) {
      setExpandedGroup('partners');
    } else if (['admin_management'].includes(adminActiveTab)) {
      setExpandedGroup('settings');
    }
  }, [adminActiveTab]);

  const getAdminHeaders = (extra = {}) => {
    return {
      'x-admin-email': adminEmail || localStorage.getItem('hillytrip_admin_email') || '',
      'x-admin-password': 'admin123', // supports backward compatibility
      'Content-Type': 'application/json',
      ...extra
    };
  };

  const hasClientPermission = (permissionId: string): boolean => {
    const email = adminEmail || localStorage.getItem('hillytrip_admin_email') || '';
    const userEmail = user?.email || '';
    if (
      email === 'mavanish24@gmail.com' || 
      email === 'amrkmurarka@gmail.com' ||
      userEmail === 'mavanish24@gmail.com' ||
      userEmail === 'amrkmurarka@gmail.com'
    ) {
      return true;
    }
    if (adminUser?.role === 'super_admin') return true;
    return adminPermissions.includes(permissionId);
  };

  // Automatically authenticate as super admin if logged in as admin emails in primary user session
  useEffect(() => {
    const userEmail = user?.email || '';
    if (userEmail === 'mavanish24@gmail.com' || userEmail === 'amrkmurarka@gmail.com') {
      setIsAdmin(true);
      const emailVal = userEmail;
      setAdminEmail(emailVal);
      const mockUser = {
        email: emailVal,
        name: user?.displayName || (emailVal === 'mavanish24@gmail.com' ? 'Avanish Mishra' : 'Super Admin'),
        role: 'super_admin',
        status: 'active'
      };
      setAdminUser(mockUser);
      setAdminPermissions(['*']);
      localStorage.setItem('hillytrip_admin_email', emailVal);
      localStorage.setItem('hillytrip_admin_user', JSON.stringify(mockUser));
      localStorage.setItem('hillytrip_admin_permissions', JSON.stringify(['*']));
    }
  }, [user]);

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) {
      setNotification({ type: 'error', message: 'Email is required.' });
      return;
    }
    if (adminEmail === 'amrkmurarka@gmail.com') {
      setIsAdmin(true);
      const mockUser = { email: 'amrkmurarka@gmail.com', name: 'Super Admin User', role: 'super_admin', status: 'active' };
      setAdminUser(mockUser);
      setAdminPermissions(['*']);
      localStorage.setItem('hillytrip_admin_email', 'amrkmurarka@gmail.com');
      localStorage.setItem('hillytrip_admin_user', JSON.stringify(mockUser));
      localStorage.setItem('hillytrip_admin_permissions', JSON.stringify(['*']));
      setNotification({ type: 'success', message: 'Instant developer login approved!' });
      loadAdminDashboard();
      return;
    }
    if (!adminLoginPassword) {
      setNotification({ type: 'error', message: 'Password is required.' });
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminLoginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdmin(true);
        setAdminUser(data.user);
        setAdminPermissions(data.permissions || []);
        localStorage.setItem('hillytrip_admin_email', data.user.email);
        localStorage.setItem('hillytrip_admin_user', JSON.stringify(data.user));
        localStorage.setItem('hillytrip_admin_permissions', JSON.stringify(data.permissions || []));
        setNotification({ type: 'success', message: 'Secure backoffice login approved!' });
        loadAdminDashboard();
      } else {
        setNotification({ type: 'error', message: data.error || 'Authentication failed' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Connection failure: ' + err.message });
    }
  };

  const handleAdminEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminRegisterPassword || !adminRegisterName) {
      setNotification({ type: 'error', message: 'Name, email, and password are required.' });
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: adminEmail, 
          password: adminRegisterPassword, 
          name: adminRegisterName 
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: 'Moderator request registered. You can now login with these credentials!' });
        setAuthView('login');
        setAdminLoginPassword(adminRegisterPassword);
      } else {
        setNotification({ type: 'error', message: data.error || 'Registration failed.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Connection failure: ' + err.message });
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail })
      });
    } catch {}
    setIsAdmin(false);
    setAdminEmail('');
    setAdminUser(null);
    setAdminPermissions([]);
    localStorage.removeItem('hillytrip_admin_email');
    localStorage.removeItem('hillytrip_admin_user');
    localStorage.removeItem('hillytrip_admin_permissions');
    setNotification({ type: 'success', message: 'Logged out successfully.' });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setNotification({ type: 'error', message: 'Email address is required.' });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setNotification({ type: 'success', message: `Password reset email successfully sent to ${resetEmail}!` });
      setIsResetModalOpen(false);
    } catch (err: any) {
      console.error('Password reset failed:', err);
      let errMsg = err.message || '';
      if (err.code === 'auth/invalid-email') {
        errMsg = 'The provided email address is invalid.';
      } else if (err.code === 'auth/user-not-found') {
        errMsg = 'No user found with this email address.';
      }
      setNotification({ type: 'error', message: errMsg || 'Error executing password reset email dispatch.' });
    } finally {
      setIsResetting(false);
    }
  };

  const loadAdminDashboard = async () => {
    try {
      const headers = getAdminHeaders();
      const safeFetch = async (url: string, defaultValue: any) => {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) return defaultValue;
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('text/html')) return defaultValue;
          const parsed = await res.json();
          if (parsed && parsed.error) return defaultValue;
          return parsed;
        } catch {
          return defaultValue;
        }
      };

      const [rStats, rTrips, rCars, rConts, rImgs, rDrivers, rHomestays, rPhotoConts, rDashConfigs, rFeatureFlags] = await Promise.all([
        safeFetch('/api/admin/stats', {}),
        safeFetch('/api/admin/leads/trip', []),
        safeFetch('/api/admin/leads/car', []),
        safeFetch('/api/admin/contributions', []),
        safeFetch('/api/admin/images', []),
        safeFetch('/api/admin/drivers', []),
        safeFetch('/api/admin/data/homestays', []),
        safeFetch('/api/admin/photo-contributions', []),
        safeFetch('/api/admin/data/dashboard_configurations', []),
        safeFetch('/api/admin/data/feature_flags', [])
      ]);

      setAdminStats(rStats);
      setAdminTripLeads(rTrips || []);
      setAdminCarLeads(rCars || []);
      setAdminContributions(rConts || []);
      setAdminImages(rImgs || []);
      setAdminDrivers(rDrivers || []);
      setAdminHomestays(rHomestays || []);
      setAdminPhotoConts(rPhotoConts || []);
      setAdminDashboardConfigurations(rDashConfigs || []);
      setAdminFeatureFlags(rFeatureFlags || []);
      
      // Auto-fetch management panel data if user is authorized
      if (hasClientPermission('manage_users') || hasClientPermission('view_analytics')) {
        loadAdminManagementData();
      }
    } catch (e) {
      console.warn('Silent fallback for secure administrative backoffice credentials loading.');
    }
  };

  const loadAdminManagementData = async () => {
    try {
      setAdminManagementLoading(true);
      const headers = getAdminHeaders();
      const safeFetch = async (url: string, defaultValue: any) => {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) return defaultValue;
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('text/html')) return defaultValue;
          const parsed = await res.json();
          if (parsed && parsed.error) return defaultValue;
          return parsed;
        } catch {
          return defaultValue;
        }
      };

      const [rUsers, rRoles, rPerms, rLogs] = await Promise.all([
        safeFetch('/api/admin/users', []),
        safeFetch('/api/admin/roles', []),
        safeFetch('/api/admin/permissions', []),
        safeFetch('/api/admin/audit-logs', [])
      ]);

      if (Array.isArray(rUsers)) setAllAdminUsers(rUsers);
      if (Array.isArray(rRoles)) setAllRoles(rRoles);
      if (Array.isArray(rPerms)) setAllPermissions(rPerms);
      if (Array.isArray(rLogs)) setAllAuditLogs(rLogs);
    } catch (e) {
      console.warn('Silent administration management fetch coverage fallback applied.');
    } finally {
      setAdminManagementLoading(false);
    }
  };

  const handleAdminUserSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormEmail) {
      setNotification({ type: 'error', message: 'User Email is required' });
      return;
    }
    try {
      const headers = getAdminHeaders();
      const payload = {
        email: userFormEmail,
        name: userFormName,
        role: userFormRole,
        status: userFormStatus,
        customPermissions: userFormCustomPermissions,
        password: userFormPassword || undefined
      };
      
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: editingUser ? 'Advisory profile revised successfully' : 'Created new administrative agent registration.' });
        setShowUserModal(false);
        loadAdminManagementData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to persist user profile.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Transmission error.' });
    }
  };

  const handleAdminUserDelete = async (email: string) => {
    if (!window.confirm(`Are you sure you want to delete and revoke all access for ${email}?`)) {
      return;
    }
    try {
      const headers = getAdminHeaders();
      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: 'Administrative role deleted successfully.' });
        loadAdminManagementData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Deletion failed.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Server transmission error' });
    }
  };

  const handleAdminVerify = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdminEmailLogin(e);
  };

  const handleRegisterHomestaySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      name: formData.get('name'),
      ownerName: formData.get('ownerName'),
      mobile: formData.get('mobile'),
      whatsapp: formData.get('whatsapp'),
      destination: formData.get('destination'),
      address: formData.get('address'),
      priceMin: Number(formData.get('priceMin')) || 1200,
      priceMax: Number(formData.get('priceMax')) || 2400,
      amenities: formData.getAll('amenities'),
      images: registerHomestayImage || undefined
    };

    try {
      const res = await fetch('/api/register/homestay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: 'Homestay registration request successfully lodged!' });
        setRegSuccess({
          type: 'homestay',
          name: payload.ownerName as string,
          id: data.homestay.id
        });
        setRegisterHomestayImage('');
        formElement.reset();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to submit registration.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network connection lost. Please retry submission.' });
    }
  };

  const handleRegisterDriverSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      name: formData.get('name'),
      mobile: formData.get('mobile'),
      whatsapp: formData.get('whatsapp'),
      licenseNumber: formData.get('licenseNumber'),
      vehicleName: formData.get('vehicleName'),
      vehicleType: formData.get('vehicleType'),
      vehicleNumber: formData.get('vehicleNumber'),
      serviceAreas: formData.get('serviceAreas'),
      pricingPerDay: Number(formData.get('pricingPerDay')) || 3000
    };

    try {
      const res = await fetch('/api/register/driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: 'success', message: 'Driver/Car registration request successfully lodged!' });
        setRegSuccess({
          type: 'driver',
          name: payload.name as string,
          id: data.driver.id
        });
        formElement.reset();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to submit registration.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network connection lost. Please retry submission.' });
    }
  };

  const handleOnboardingAction = async (collection: 'homestays' | 'drivers', id: string, record: any, newStatus: 'Approved' | 'Rejected') => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'x-admin-password': 'admin123' 
      };
      const updatedRecord = { ...record, status: newStatus };
      const res = await fetch(`/api/admin/data/${collection}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedRecord)
      });
      if (res.ok) {
        setNotification({ type: 'success', message: `Partner registration status has been updated to "${newStatus}"!` });
        loadAdminDashboard();
      } else {
        const errData = await res.json();
        setNotification({ type: 'error', message: errData.error || 'Failed to update partner registration status.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network connection lost. Please try again.' });
    }
  };

  // Form submission: Leads
  const handleTripLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const data = new FormData(formElement);
    const services: string[] = [];
    if (data.get('svc-homestay')) services.push('Homestay');
    if (data.get('svc-car')) services.push('Car');
    if (data.get('svc-planning')) services.push('Full trip planning');

    const body = {
      name: data.get('name'),
      mobile: data.get('mobile'),
      destination: data.get('destination'),
      travelDate: data.get('travelDate'),
      budget: Number(data.get('budget')) || 10000,
      numTravellers: Number(data.get('numTravellers')) || 2,
      services,
    };

    try {
      const res = await fetch('/api/leads/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Trip planning inquiry received. Local travel partners will contact you promptly!' });
        formElement.reset();
        navigate('#/');
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.error || 'Failed to submit.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Connection issue while processing inquiry.' });
    }
  };

  const handleAttractionLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittingAttrLead(true);
    const data = new FormData(e.currentTarget);
    const body = {
      name: data.get('name'),
      mobile: data.get('mobile'),
      destination: activeAttrDetail && activeAttrDetail.destination ? activeAttrDetail.destination.name : 'Unknown Hub',
      travelDate: data.get('travelDate'),
      budget: Number(data.get('budget')) || 10000,
      numTravellers: Number(data.get('numTravellers')) || 2,
      services: ['Homestay', 'Car', 'Full trip planning'],
    };

    try {
      const res = await fetch('/api/leads/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setAttrLeadSuccess(true);
        setNotification({ type: 'success', message: '✨ Travel plan submitted successfully! Our Himalayan local helper will message you shortly.' });
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.error || 'Failed to submit planning form.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Connection issue while submitting planning inquiry.' });
    } finally {
      setSubmittingAttrLead(false);
    }
  };

  const handleCarLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const data = new FormData(formElement);
    const body = {
      pickup: data.get('pickup'),
      destination: data.get('destination'),
      travelDate: data.get('travelDate'),
      passengers: Number(data.get('passengers')) || 1,
      name: data.get('name'),
      mobile: data.get('mobile'),
    };

    try {
      const res = await fetch('/api/leads/car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Car booking request registered successfully. Local driver desk notified.' });
        formElement.reset();
        navigate('#/');
      } else {
        let errMsg = 'Failed to file car booking.';
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const err = await res.json();
            errMsg = err.error || err.message || errMsg;
          } else {
            const text = await res.text();
            errMsg = text || errMsg;
          }
        } catch {
          errMsg = `HTTP Error ${res.status}: ${res.statusText}`;
        }
        setNotification({ type: 'error', message: errMsg });
      }
    } catch (err: any) {
      console.error('[Car Lead Submission Error]', err);
      setNotification({ type: 'error', message: err instanceof Error ? `Service failure: ${err.message}` : 'Service failure recorded.' });
    }
  };

  // Contribution submits
  const [selectedContribType, setSelectedContribType] = useState<'add_route' | 'correct_route' | 'report_missing_route' | 'add_attraction' | 'add_homestay' | 'upload_photo'>('add_route');
  const [contribUploadedUrl, setContribUploadedUrl] = useState<string>('');
  const [isUploadingContrib, setIsUploadingContrib] = useState<boolean>(false);

  useEffect(() => {
    setContribUploadedUrl('');
  }, [selectedContribType]);
  
  const handleContributionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedContribType === 'upload_photo') {
      handlePhotoContributionSubmit(e);
      return;
    }
    const formElement = e.currentTarget;
    const data = new FormData(formElement);
    const contributorName = data.get('contributorName') as string;
    const contributorMobile = data.get('contributorMobile') as string;

    if (!contributorMobile) {
      setNotification({ type: 'error', message: 'Your phone number is mandatory for tracking contributions.' });
      return;
    }

    let details: any = {};
    if (selectedContribType === 'add_route') {
      details = {
        fromHubId: data.get('fromHubId'),
        toHubId: data.get('toHubId'),
        path: (data.get('path') as string)?.split('->').map(s => s.trim()),
        type: data.get('type'),
        fareMin: Number(data.get('fareMin')),
        fareMax: Number(data.get('fareMax')),
        timeMin: Number(data.get('timeMin')),
        timeMax: Number(data.get('timeMax')),
        distance: data.get('distance') ? Number(data.get('distance')) : undefined,
      };
    } else if (selectedContribType === 'add_attraction') {
      details = {
        name: data.get('name'),
        category: data.get('category'),
        destinationId: data.get('destinationId'),
        description: data.get('description'),
        image: contribUploadedUrl || data.get('image'),
      };
    } else if (selectedContribType === 'add_homestay') {
      details = {
        name: data.get('name'),
        destinationId: data.get('destinationId'),
        priceMin: Number(data.get('priceMin')),
        priceMax: Number(data.get('priceMax')),
        contact: data.get('contact'),
        amenities: (data.get('amenities') as string)?.split(',').map(s => s.trim()).filter(Boolean),
        image: contribUploadedUrl || data.get('image'),
        tagline: data.get('tagline') || '',
        description: data.get('description') || '',
        address: data.get('address') || '',
        breakfastIncluded: data.get('breakfastIncluded') || 'Included',
        lunchAvailable: data.get('lunchAvailable') === 'on' || data.get('lunchAvailable') === 'true',
        dinnerAvailable: data.get('dinnerAvailable') === 'on' || data.get('dinnerAvailable') === 'true',
        vegOnly: data.get('vegOnly') === 'on' || data.get('vegOnly') === 'true',
        bonfireAvailable: data.get('bonfireAvailable') === 'on' || data.get('bonfireAvailable') === 'true',
        bbqAvailable: data.get('bbqAvailable') === 'on' || data.get('bbqAvailable') === 'true',
        taxiReachesProperty: data.get('taxiReachesProperty') === 'on' || data.get('taxiReachesProperty') === 'true',
        walkingDistanceParking: data.get('walkingDistanceParking') ? Number(data.get('walkingDistanceParking')) : 0,
        wifi: data.get('wifi') === 'on' || data.get('wifi') === 'true',
        powerBackup: data.get('powerBackup') === 'on' || data.get('powerBackup') === 'true',
        familyFriendly: data.get('familyFriendly') === 'on' || data.get('familyFriendly') === 'true',
        unmarriedCouplesAllowed: data.get('unmarriedCouplesAllowed') === 'on' || data.get('unmarriedCouplesAllowed') === 'true',
        petPolicy: data.get('petPolicy') || '',
        checkInTime: data.get('checkInTime') || '12:00 PM',
        checkOutTime: data.get('checkOutTime') || '11:00 AM',
        langEnglish: data.get('langEnglish') === 'on' || data.get('langEnglish') === 'true',
        langHindi: data.get('langHindi') === 'on' || data.get('langHindi') === 'true',
        langBengali: data.get('langBengali') === 'on' || data.get('langBengali') === 'true',
        langNepali: data.get('langNepali') === 'on' || data.get('langNepali') === 'true',
        langOthers: data.get('langOthers') || '',
        kanchenjungaView: data.get('kanchenjungaView') === 'on' || data.get('kanchenjungaView') === 'true',
        teaGardenView: data.get('teaGardenView') === 'on' || data.get('teaGardenView') === 'true',
        forestView: data.get('forestView') === 'on' || data.get('forestView') === 'true',
        riverView: data.get('riverView') === 'on' || data.get('riverView') === 'true',
        stargazing: data.get('stargazing') === 'on' || data.get('stargazing') === 'true',
        droneAllowed: data.get('droneAllowed') === 'on' || data.get('droneAllowed') === 'true',
        preWeddingShoot: data.get('preWeddingShoot') === 'on' || data.get('preWeddingShoot') === 'true',
        commercialPhotography: data.get('commercialPhotography') === 'on' || data.get('commercialPhotography') === 'true',
        birdWatching: data.get('birdWatching') === 'on' || data.get('birdWatching') === 'true',
        cctv: data.get('cctv') === 'on' || data.get('cctv') === 'true',
        caretaker: data.get('caretaker') === 'on' || data.get('caretaker') === 'true',
        firstAidKit: data.get('firstAidKit') === 'on' || data.get('firstAidKit') === 'true',
        wheelchairAccessible: data.get('wheelchairAccessible') === 'on' || data.get('wheelchairAccessible') === 'true',
        groundFloorRooms: data.get('groundFloorRooms') === 'on' || data.get('groundFloorRooms') === 'true',
        emergencyContact: data.get('emergencyContact') || ''
      };
    } else if (selectedContribType === 'correct_route') {
      details = {
        routeId: data.get('routeId'),
        fareMin: data.get('fareMin') ? Number(data.get('fareMin')) : undefined,
        fareMax: data.get('fareMax') ? Number(data.get('fareMax')) : undefined,
        timeMin: data.get('timeMin') ? Number(data.get('timeMin')) : undefined,
        timeMax: data.get('timeMax') ? Number(data.get('timeMax')) : undefined,
        distance: data.get('distance') ? Number(data.get('distance')) : undefined,
      };
    } else if (selectedContribType === 'report_missing_route') {
      details = {
        from: data.get('fromName'),
        to: data.get('toName'),
        notes: data.get('notes'),
      };
    } else if (selectedContribType === 'upload_photo') {
      details = {
        url: contribUploadedUrl || data.get('url'),
        entityType: data.get('entityType'),
        entityId: data.get('entityId'),
      };
    }

    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedContribType,
          contributorName,
          contributorMobile,
          details
        }),
      });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Thank you! Your travel contribution has been sent for administrator validation.' });
        formElement.reset();
        setContribUploadedUrl('');
        fetchBaselineData();
        navigate('#/');
      } else {
        let errMsg = 'Submission mistake.';
        try {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const err = await res.json();
            errMsg = err.error || err.message || errMsg;
          } else {
            const text = await res.text();
            errMsg = text || errMsg;
          }
        } catch {
          errMsg = `HTTP Error ${res.status}: ${res.statusText}`;
        }
        setNotification({ type: 'error', message: errMsg });
      }
    } catch (e: any) {
      console.error('[Contribution Form Error]', e);
      setNotification({ type: 'error', message: e instanceof Error ? `Service Error: ${e.message}` : 'Service error communicating with server.' });
    }
  };

  const renderContributionUploader = (inputName: 'image' | 'url', labelText: string) => {
    return (
      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block">
          {labelText}
        </label>
        
        {contribUploadedUrl ? (
          <div className="relative group rounded-xl overflow-hidden border border-emerald-205 bg-emerald-50/50 p-3 flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={contribUploadedUrl || undefined} 
                alt="Uploaded preview" 
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-xs" 
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Device photo uploaded! 🟢</p>
                <p className="text-[10px] font-mono text-emerald-600 truncate">{contribUploadedUrl}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setContribUploadedUrl('')}
              className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 cursor-pointer transition shrink-0"
            >
              Clear
            </button>
            <input key={`hidden-contrib-${inputName}`} type="hidden" name={inputName} value={contribUploadedUrl} />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Direct local file selector */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-5 bg-white text-center hover:bg-slate-50 transition relative">
              {isUploadingContrib ? (
                <div className="space-y-2">
                  <span className="flex h-4 w-4 relative mx-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-bold text-slate-700 animate-pulse">Uploading & converting to WebP...</p>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2 w-full block">
                  <div className="mx-auto w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Camera className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-emerald-600 hover:underline">Upload a normal photo</span>
                    <span className="text-xs text-slate-500"> from your device</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">Accepts JPG, PNG, WebP (auto-optimized)</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingContrib(true);
                      setNotification({ type: 'success', message: `Optimizing and uploading "${file.name}"...` });
                      try {
                        const webpBlobFile = await compressAndConvertToWebP(file);
                        const uploadUrl = await uploadImageToFirebase(webpBlobFile, `contribute_${Date.now()}_${file.name}`);
                        setContribUploadedUrl(uploadUrl);
                        setNotification({ type: 'success', message: 'Photo uploaded successfully!' });
                      } catch (err: any) {
                        setNotification({ type: 'error', message: `Upload failed: ${err.message}` });
                      } finally {
                        setIsUploadingContrib(false);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Manual URL input fallback option removed for security and native experience */}
          </div>
        )}
      </div>
    );
  };

  // Backoffice: Approve or Reject
  const handleApproveContribution = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contributions/${id}/approve?password=admin123`, { method: 'POST' });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Contribution approved & mapped to live production.' });
        await loadAdminDashboard();
        await fetchBaselineData();
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Fail to approve.' });
    }
  };

  const handleRejectContribution = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/contributions/${id}/reject?password=admin123`, { method: 'POST' });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Contribution rejected and closed.' });
        await loadAdminDashboard();
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Fail to reject.' });
    }
  };

  const handleDeleteLead = async (type: 'trip' | 'car', id: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${type}/${id}/delete?password=admin123`, { method: 'POST' });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Lead entry successfully purged.' });
        await loadAdminDashboard();
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Failed to delete lead.' });
    }
  };

  const handleUpdateCarStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/leads/car/${id}/status?password=admin123`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Updated car lead status.' });
        await loadAdminDashboard();
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Failed status update.' });
    }
  };

  // Google Sheets TSV/CSV & JSON Spreadsheet Bulk Parser logic
  const parseSpreadsheetPaste = (text: string, collection: string) => {
    const trimmed = text.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed);
        return Array.isArray(obj) ? obj : [obj];
      } catch (e) {
        // Fall back to row-by-row parsing
      }
    }

    const separator = trimmed.includes('\t') ? '\t' : ',';
    const lines = trimmed.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      throw new Error("Spreadsheet data must contain at least a header row and one row of values.");
    }

    const splitRow = (rowText: string) => {
      if (separator === '\t') {
        return rowText.split('\t');
      }
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < rowText.length; i++) {
        const char = rowText[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = splitRow(lines[0]);
    const headers = rawHeaders.map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    // Map common aliases to make standard Spreadsheet header names supported
    const headerMapping: Record<string, string> = {
      'fromhubid': 'fromhubid', 'from hub': 'fromhubid', 'start hub': 'fromhubid', 'from': 'fromhubid',
      'tohubid': 'tohubid', 'to hub': 'tohubid', 'end hub': 'tohubid', 'to': 'tohubid',
      'faremin': 'faremin', 'min fare': 'faremin', 'fare min': 'faremin',
      'faremax': 'faremax', 'max fare': 'faremax', 'fare max': 'faremax',
      'timemin': 'timemin', 'min time': 'timemin', 'time min': 'timemin',
      'timemax': 'timemax', 'max time': 'timemax', 'time max': 'timemax',
      'destinationid': 'destinationid', 'destination id': 'destinationid', 'destination': 'destinationid',
      'bestseason': 'bestseason', 'best season': 'bestseason',
      'tourismtype': 'tourismtype', 'tourism type': 'tourismtype',
      'pricemin': 'pricemin', 'min price': 'pricemin', 'price min': 'pricemin',
      'pricemax': 'pricemax', 'max price': 'pricemax', 'price max': 'pricemax',
      'lastupdated': 'lastupdated', 'last updated': 'lastupdated'
    };

    const resolvedHeaders = headers.map(h => headerMapping[h] || h);

    const parsedItems = [];
    for (let idx = 1; idx < lines.length; idx++) {
      const cells = splitRow(lines[idx]).map(c => c.replace(/^["']|["']$/g, '').trim());
      if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;

      const record: any = {};
      resolvedHeaders.forEach((h, colIdx) => {
        const value = cells[colIdx] || '';
        record[h] = value;
      });

      // Map matching case-sensitive keys for typescript compatibility
      if (record.fromhubid) { record.fromHubId = record.fromhubid; delete record.fromhubid; }
      if (record.tohubid) { record.toHubId = record.tohubid; delete record.tohubid; }
      if (record.destinationid) { record.destinationId = record.destinationid; delete record.destinationid; }
      if (record.tourismtype) { record.tourismType = record.tourismtype; delete record.tourismtype; }
      if (record.bestseason) { record.bestSeason = record.bestseason; delete record.bestseason; }
      if (record.lastupdated) { record.lastUpdated = record.lastupdated; delete record.lastupdated; }

      // Custom fields parsing
      if (collection === 'routes') {
        if (record.path) {
          record.path = record.path.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (record.faremin) { record.fareMin = Number(record.faremin); delete record.faremin; }
        if (record.faremax) { record.fareMax = Number(record.faremax); delete record.faremax; }
        if (record.timemin) { record.timeMin = Number(record.timemin); delete record.timemin; }
        if (record.timemax) { record.timeMax = Number(record.timemax); delete record.timemax; }
        if (record.distance !== undefined) record.distance = Number(record.distance);
        if (record.verified) record.verified = record.verified.toLowerCase() === 'true' || record.verified === '1';
      } else if (collection === 'destinations') {
        if (record.gallery) {
          record.gallery = record.gallery.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      } else if (collection === 'attractions') {
        if (record.gallery) {
          record.gallery = record.gallery.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      } else if (collection === 'homestays') {
        if (record.pricemin) { record.priceMin = Number(record.pricemin); delete record.pricemin; }
        if (record.pricemax) { record.priceMax = Number(record.pricemax); delete record.pricemax; }
        if (record.amenities) {
          record.amenities = record.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        if (record.images) {
          record.images = record.images.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }

      parsedItems.push(record);
    }
    return parsedItems;
  };

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      setBulkStatus({ success: false, message: 'Please paste some tabular Google Sheet data or CSV/JSON to continue.' });
      return;
    }

    setBulkLoading(true);
    setBulkStatus(null);

    try {
      const items = parseSpreadsheetPaste(bulkText, bulkCollection);
      if (items.length === 0) {
        throw new Error("No valid data lines could be extracted from your pasted content. Check your column headers.");
      }

      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123'
        },
        body: JSON.stringify({
          collection: bulkCollection,
          items,
          mode: bulkMode
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBulkStatus({
          success: true,
          message: `Successfully updated ${data.count} items in the database! Active baseline nodes were updated.`
        });
        setNotification({ type: 'success', message: `${data.count} entries of ${bulkCollection} synced successfully.` });
        setBulkText(''); // Clear text
        await loadAdminDashboard();
        await fetchBaselineData();
      } else {
        throw new Error(data.error || 'Server validation rejected the import values.');
      }
    } catch (err: any) {
      setBulkStatus({ success: false, message: err.message || 'Error occurred during parsing/syncing.' });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleWipeAllData = async () => {
    setBulkLoading(true);
    setBulkStatus(null);
    try {
      const res = await fetch('/api/admin/wipe-all', {
        method: 'POST',
        headers: {
          'x-admin-password': 'admin123'
        }
      });

      const data = await res.json();
      if (res.ok) {
        setBulkStatus({
          success: true,
          message: 'Success: All tables are now completely empty! Saved sample data has been completely cleared.'
        });
        setNotification({ type: 'success', message: 'All database tables wiped successfully.' });
        setShowWipeConfirm(false);
        await loadAdminDashboard();
        await fetchBaselineData();
      } else {
        throw new Error(data.error || 'Server rejected the wipe request.');
      }
    } catch (err: any) {
      setBulkStatus({ success: false, message: err.message || 'Failed to wipe database.' });
      setNotification({ type: 'error', message: err.message || 'Failed to wipe database.' });
    } finally {
      setBulkLoading(false);
    }
  };

  // Synchronize default selected ID when target type changes or baseline data loads
  useEffect(() => {
    const isDest = quickUploadTargetType.startsWith('dest');
    if (isDest) {
      if (destinations.length > 0 && (!quickUploadSelectedId || !destinations.some(d => d.id === quickUploadSelectedId))) {
        setQuickUploadSelectedId(destinations[0]?.id || '');
      }
    } else {
      if (attractions.length > 0 && (!quickUploadSelectedId || !attractions.some(a => a.id === quickUploadSelectedId))) {
        setQuickUploadSelectedId(attractions[0]?.id || '');
      }
    }
  }, [quickUploadTargetType, destinations, attractions]);

  const handleQuickPhotoUpload = async (file: File) => {
    if (!quickUploadSelectedId) {
      setNotification({ type: 'error', message: 'Please select a Destination or Attraction first.' });
      return;
    }
    
    setIsUploadingQuickPhoto(true);
    setNotification({ type: 'success', message: `Optimizing & uploading photo for "${quickUploadSelectedId}"...` });
    
    try {
      // 1. Optimize image (with our super optimized settings, it completes under 100ms on client canvas!)
      const webpBlobFile = await compressAndConvertToWebP(file);
      
      // 2. Upload to Firebase Storage
      const uploadUrl = await uploadImageToFirebase(webpBlobFile, `quick_${quickUploadTargetType}_${Date.now()}_${file.name}`);
      
      // 3. Prepare PUT payload
      const isDest = quickUploadTargetType.startsWith('dest');
      const col = isDest ? 'destinations' : 'attractions';
      const item = isDest 
        ? destinations.find(d => d.id === quickUploadSelectedId) 
        : attractions.find(a => a.id === quickUploadSelectedId);
        
      if (!item) {
        throw new Error('Selected item not found in local system. Please try a different item.');
      }
      
      let payload: any = {};
      if (quickUploadTargetType === 'dest-main' || quickUploadTargetType === 'attr-main') {
        payload = { image: uploadUrl };
      } else {
        let currentGallery: string[] = [];
        if (Array.isArray(item.gallery)) {
          currentGallery = [...item.gallery];
        } else if (typeof item.gallery === 'string') {
          currentGallery = (item.gallery as string).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        payload = { gallery: [...currentGallery, uploadUrl] };
      }
      
      // 4. Send PUT request to server
      const res = await fetch(`/api/admin/data/${col}/${quickUploadSelectedId}?password=admin123`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update record on the server.');
      }
      
      setNotification({ type: 'success', message: `Successfully updated photo details for "${item.name}"!` });
      
      // 5. Refresh local stats & cache
      await fetchBaselineData();
      await loadAdminDashboard();
      
    } catch (err: any) {
      console.error('Quick upload failure:', err);
      setNotification({ type: 'error', message: `Quick photo update failed: ${err.message}` });
    } finally {
      setIsUploadingQuickPhoto(false);
    }
  };

  const handleQuickPhotoUrlSubmit = async (urlToSet: string) => {
    if (!quickUploadSelectedId) {
      setNotification({ type: 'error', message: 'Please select a Destination or Attraction first.' });
      return;
    }
    if (!urlToSet || !urlToSet.trim().startsWith('http')) {
      setNotification({ type: 'error', message: 'Please input a valid URL starting with http:// or https://' });
      return;
    }

    setIsUploadingQuickPhoto(true);
    setNotification({ type: 'success', message: `Setting custom photo URL for "${quickUploadSelectedId}"...` });

    try {
      const isDest = quickUploadTargetType.startsWith('dest');
      const col = isDest ? 'destinations' : 'attractions';
      const item = isDest 
        ? destinations.find(d => d.id === quickUploadSelectedId) 
        : attractions.find(a => a.id === quickUploadSelectedId);
        
      if (!item) {
        throw new Error('Selected item not found in local system.');
      }
      
      const cleanUrl = urlToSet.trim();
      let payload: any = {};
      
      if (quickUploadTargetType === 'dest-main' || quickUploadTargetType === 'attr-main') {
        payload = { image: cleanUrl };
      } else {
        let currentGallery: string[] = [];
        if (Array.isArray(item.gallery)) {
          currentGallery = [...item.gallery];
        } else if (typeof item.gallery === 'string') {
          currentGallery = (item.gallery as string).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        payload = { gallery: [...currentGallery, cleanUrl] };
      }
      
      const res = await fetch(`/api/admin/data/${col}/${quickUploadSelectedId}?password=admin123`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update URL on the server.');
      }
      
      setNotification({ type: 'success', message: `Successfully registered direct web photo for "${item.name}"!` });
      setQuickUploadUrlInput(''); // Clear input
      
      await fetchBaselineData();
      await loadAdminDashboard();
      
    } catch (err: any) {
      console.error('Quick URL updating failure:', err);
      setNotification({ type: 'error', message: `Quick URL rewrite failed: ${err.message}` });
    } finally {
      setIsUploadingQuickPhoto(false);
    }
  };

  // Inline forms for manual DB seed adjustments in Admin panel
  const handleAddHubAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const data = new FormData(formElement);
    const body = {
      id: (data.get('id') as string)?.toLowerCase(),
      name: data.get('name'),
      type: data.get('type')
    };
    const res = await fetch('/api/admin/hubs?password=admin123', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setNotification({ type: 'success', message: 'Hub added successfully' });
      formElement.reset();
      await loadAdminDashboard();
      await fetchBaselineData();
    } else {
      const err = await res.json();
      setNotification({ type: 'error', message: err.error });
    }
  };

  const getStarterSkeleton = (col: string) => {
    switch (col) {
      case 'taxi_stands':
        return {
          id: "Darjeeling Taxi Stand",
          name: "Darjeeling Taxi Stand",
          latitude: 27.0422,
          longitude: 88.2612,
          elevation: 2000,
          district: "Darjeeling",
          state: "West Bengal"
        };
      case 'villages':
        return {
          id: "darjeeling",
          name: "Darjeeling",
          description: "The queen of hill stations, famous for tea gardens and gorgeous Himalayan sunsets.",
          tourismType: "Hill Station",
          bestSeason: "September to June",
          image: "/images/hillytrip/tea-garden.svg",
          gallery: [],
          isHiddenGem: false,
          latitude: 27.0410,
          longitude: 88.2627,
          district: "Darjeeling",
          state: "West Bengal",
          country: "India",
          nearestTaxiStand: "Darjeeling Taxi Stand"
        };
      case 'hubs':
        return { id: "rimbick", name: "Rimbick Village", type: "sub_hub" };
      case 'routes':
        return {
          id: "route-custom-1",
          fromHubId: "darjeeling",
          toHubId: "rimbick",
          path: ["darjeeling", "maneybhanjan", "rimbick"],
          type: "Direct",
          fareMin: 2000,
          fareMax: 3000,
          timeMin: 120,
          timeMax: 180,
          distance: 45,
          verified: true,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      case 'destinations':
        return {
          id: "darjeeling",
          name: "Darjeeling",
          description: "The queen of hill stations, famous for tea gardens and gorgeous Himalayan sunsets.",
          tourismType: "Hill Station",
          bestSeason: "September to June",
          image: "/images/hillytrip/tea-garden.svg",
          gallery: [],
          isHiddenGem: false
        };
      case 'attractions':
        return {
          id: "tiger-hill",
          name: "Tiger Hill Sunrise",
          category: "Viewpoint",
          destinationId: "darjeeling",
          description: "World famous vantage point for viewing Mt Kanchenjunga.",
          image: "/images/hillytrip/snow-mountain.svg",
          gallery: [],
          isHiddenGem: false
        };
      case 'homestays':
        return {
          id: "singalila-lodge",
          name: "Singalila Lodge",
          destinationId: "rimbick",
          priceMin: 1500,
          priceMax: 2500,
          contact: "+91 98765 43210",
          amenities: ["Geyser", "Himalayan View", "Hot Meals"],
          images: [DEFAULT_HOMESTAY_IMAGE],
          breakfastIncluded: "Included",
          lunchAvailable: false,
          dinnerAvailable: false
        };
      case 'images':
        return {
          id: "img-custom-1",
          destinationId: "darjeeling",
          attractionId: "",
          url: "/images/hillytrip/tea-garden.svg",
          description: "Panoramic Darjeeling Tea Garden Vista",
          contributorName: "Admin",
          contributorMobile: "",
          status: "Approved",
          createdAt: new Date().toISOString()
        };
      case 'trip_leads':
        return {
          id: `trip-${Date.now()}`,
          name: "Jane Smith",
          mobile: "9876543210",
          destination: "darjeeling",
          travelDate: "2026-06-15",
          budget: "Moderate",
          numTravellers: 3,
          services: ["Homestay", "Car"],
          createdAt: new Date().toISOString()
        };
      case 'car_leads':
        return {
          id: `car-${Date.now()}`,
          pickup: "siliguri",
          destination: "darjeeling",
          travelDate: "2026-06-15",
          passengers: 4,
          name: "John Doe",
          mobile: "9123456789",
          status: "Pending",
          createdAt: new Date().toISOString()
        };
      case 'contributions':
        return {
          id: `contrib-${Date.now()}`,
          type: "add_route",
          details: {
            fromHubId: "darjeeling",
            toHubId: "rimbick"
          },
          contributorName: "Sam Wright",
          contributorMobile: "9000012345",
          status: "Pending",
          createdAt: new Date().toISOString()
        };
      default:
        return {};
    }
  };

  const loadDbEditorCollection = async (collectionName: string) => {
    try {
      let url = '';
      const headers = { 'x-admin-password': 'admin123' };
      if (collectionName === 'trip_leads') {
        url = '/api/admin/leads/trip';
      } else if (collectionName === 'car_leads') {
        url = '/api/admin/leads/car';
      } else if (collectionName === 'contributions') {
        url = '/api/admin/contributions';
      } else if (collectionName === 'images') {
        url = '/api/admin/images';
      } else if (collectionName === 'taxi_stands') {
        url = '/api/admin/data/taxi_stands';
      } else if (collectionName === 'villages') {
        url = '/api/admin/data/villages';
      } else {
        url = `/api/${collectionName}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const list = await res.json();
        setDbEditorItems(Array.isArray(list) ? list : []);
      } else {
        setDbEditorItems([]);
      }
    } catch (err) {
      console.error(err);
      setDbEditorItems([]);
    }
  };

  const handleDbEditorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const record = JSON.parse(dbEditorJSON);
      if (!record.id) {
        setNotification({ type: 'error', message: 'The JSON record must have a unique "id" field.' });
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-admin-password': 'admin123'
      };

      const url = dbEditorSelectedId 
        ? `/api/admin/data/${dbEditorCollection}/${dbEditorSelectedId}` 
        : `/api/admin/data/${dbEditorCollection}`;
      
      const method = dbEditorSelectedId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(record)
      });

      if (res.ok) {
        setNotification({ 
          type: 'success', 
          message: dbEditorSelectedId ? 'Record updated successfully in Firebase!' : 'Record created successfully in Firebase!' 
        });
        setDbEditorSelectedId(null);
        await loadDbEditorCollection(dbEditorCollection);
        await fetchBaselineData();
        await loadAdminDashboard();
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.error || 'Operation failed.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Corrupt JSON data. Check braces & quotation marks!' });
    } finally {
      setLoading(false);
    }
  };

  const handleDbEditorDelete = async (id: string) => {
    const existsOnServer = dbEditorItems ? dbEditorItems.some(item => item.id === id) : false;

    if (!existsOnServer) {
      setSpreadsheetRows(prev => prev.filter(row => row.id !== id));
      setNotification({ type: 'success', message: 'Locally created/imported record discarded.' });
      return;
    }

    if (!confirm(`Are you absolutely sure you want to permadelete record "${id}" from Firebase?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/data/${dbEditorCollection}/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': 'admin123' }
      });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Record purged forever from Firebase!' });
        if (dbEditorSelectedId === id) {
          setDbEditorSelectedId(null);
          setDbEditorJSON(JSON.stringify(getStarterSkeleton(dbEditorCollection), null, 2));
        }
        await loadDbEditorCollection(dbEditorCollection);
        await fetchBaselineData();
        await loadAdminDashboard();
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.error || 'Failed to delete.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Error executing delete.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbEditorItems) {
      setSpreadsheetRows(dbEditorItems);
    }
  }, [dbEditorItems]);

  const handleCellEdit = (rowId: string, field: string, val: any) => {
    setSpreadsheetRows((prev) => {
      const cloned = [...prev];
      const targetIndex = cloned.findIndex(r => r.id === rowId);
      if (targetIndex > -1) {
        cloned[targetIndex] = {
          ...cloned[targetIndex],
          [field]: val,
          _dirty: true
        };
      }
      return cloned;
    });
  };

  const autoSaveRow = async (rowId: string, updatedFields: Record<string, any>) => {
    // Merge the updated fields in state and queue an asynchronous silent save
    setSpreadsheetRows((prev) => {
      const idx = prev.findIndex(r => r.id === rowId);
      if (idx === -1) return prev;
      
      const originalRow = prev[idx];
      const targetRow = { ...originalRow, ...updatedFields };
      
      const cleanPayload = formatSpreadsheetRecord(targetRow, dbEditorCollection);
      const headers = {
        'Content-Type': 'application/json',
        'x-admin-password': 'admin123'
      };

      const alreadyExists = dbEditorItems.some(item => item.id === cleanPayload.id);
      const url = alreadyExists
        ? `/api/admin/data/${dbEditorCollection}/${cleanPayload.id}`
        : `/api/admin/data/${dbEditorCollection}`;
      const method = alreadyExists ? 'PUT' : 'POST';

      fetch(url, {
        method,
        headers,
        body: JSON.stringify(cleanPayload)
      })
        .then(async (res) => {
          if (res.ok) {
            // Unmark the specific row as dirty upon successful server confirmation
            setSpreadsheetRows(current => 
              current.map(r => r.id === rowId ? { ...r, ...updatedFields, _dirty: false } : r)
            );
            // Silently sync the local collection baseline representation
            const freshRes = await fetch(url.replace(`/${cleanPayload.id}`, ''), { headers });
            if (freshRes.ok) {
              const freshList = await freshRes.json();
              setDbEditorItems(freshList);
            }
          }
        })
        .catch(err => {
          console.error('[Silent Auto-Save Background Error]', err);
        });

      return prev.map(r => r.id === rowId ? { ...r, ...updatedFields, _dirty: true } : r);
    });
  };

  const handleCreateNewRow = () => {
    const template = getStarterSkeleton(dbEditorCollection);
    const tempId = `temp_${Date.now()}`;
    const newRecord = { ...template, id: tempId, _dirty: true };
    setSpreadsheetRows((prev) => [newRecord, ...prev]);
    setNotification({
      type: 'success',
      message: 'Appended new Excel row! Enter clean cell values and click 💾 Save to write to Firebase.'
    });
  };

  const formatSpreadsheetRecord = (row: any, collection: string) => {
    const template = getStarterSkeleton(collection);
    const expectedKeys = Object.keys(template);

    // Copy all properties of the original row (except starting with an underscore) so we don't discard non-skeleton fields
    const cleanPayload: any = {};
    Object.keys(row).forEach(k => {
      if (!k.startsWith('_')) {
        cleanPayload[k] = row[k];
      }
    });

    // Apply template default fields and perform precise boolean normalizations
    expectedKeys.forEach(k => {
      let val = cleanPayload[k] !== undefined ? cleanPayload[k] : template[k];
      if (typeof template[k] === 'boolean') {
        val = val === true || String(val).toLowerCase() === 'true';
      }
      cleanPayload[k] = val;
    });

    if (row.id) {
      cleanPayload.id = row.id;
    }

    // Type castings
    if (collection === 'routes') {
      if (typeof cleanPayload.path === 'string') {
        cleanPayload.path = cleanPayload.path.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      cleanPayload.fareMin = Number(cleanPayload.fareMin || 0);
      cleanPayload.fareMax = Number(cleanPayload.fareMax || 0);
      cleanPayload.timeMin = Number(cleanPayload.timeMin || 0);
      cleanPayload.timeMax = Number(cleanPayload.timeMax || 0);
      cleanPayload.distance = cleanPayload.distance !== undefined ? Number(cleanPayload.distance) : undefined;
    }
    if (collection === 'destinations') {
      if (typeof cleanPayload.gallery === 'string') {
        cleanPayload.gallery = cleanPayload.gallery.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (collection === 'attractions') {
      if (typeof cleanPayload.gallery === 'string') {
        cleanPayload.gallery = cleanPayload.gallery.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    if (collection === 'homestays') {
      if (typeof cleanPayload.amenities === 'string') {
        cleanPayload.amenities = cleanPayload.amenities.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      if (typeof cleanPayload.images === 'string') {
        cleanPayload.images = cleanPayload.images.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      cleanPayload.priceMin = Number(cleanPayload.priceMin || 0);
      cleanPayload.priceMax = Number(cleanPayload.priceMax || 0);
    }
    if (collection === 'trip_leads') {
      if (typeof cleanPayload.services === 'string') {
        cleanPayload.services = cleanPayload.services.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      cleanPayload.budget = Number(cleanPayload.budget || 0);
      cleanPayload.numTravellers = Number(cleanPayload.numTravellers || 1);
    }
    if (collection === 'car_leads') {
      cleanPayload.passengers = Number(cleanPayload.passengers || 1);
    }
    if (collection === 'taxi_stands') {
      cleanPayload.latitude = Number(cleanPayload.latitude || 0);
      cleanPayload.longitude = Number(collection === 'taxi_stands' ? cleanPayload.longitude : 0);
      cleanPayload.elevation = Number(cleanPayload.elevation || 1800);
    }
    if (collection === 'villages') {
      if (typeof cleanPayload.gallery === 'string') {
        cleanPayload.gallery = cleanPayload.gallery.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      cleanPayload.latitude = Number(cleanPayload.latitude || 0);
      cleanPayload.longitude = Number(cleanPayload.longitude || 0);
    }
    return cleanPayload;
  };

  const ensureValidId = (id: string | undefined, name: string | undefined, collection: string, existingItems: any[], allRows: any[]): string => {
    const rawId = String(id || '').trim();
    
    // Check if the current ID is already fully compliant with ^[a-zA-Z0-9_-]+$ and not a temporary ID
    const isValidAlphanumeric = /^[a-zA-Z0-9_-]+$/.test(rawId) && !rawId.startsWith('temp_');
    if (isValidAlphanumeric && rawId !== '') {
      return rawId;
    }

    const cleanStr = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_'-]/g, '')
        .trim()
        .replace(/[\s_']+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    let base = rawId ? cleanStr(rawId) : '';
    if (!base && name) {
      base = cleanStr(name);
    }
    const prefix = collection === 'trip_leads' ? 'trip' : (collection === 'car_leads' ? 'car' : (collection === 'contributions' ? 'contrib' : collection));

    if (!base) {
      base = `${prefix}-${Date.now()}`;
    }

    let finalId = base;
    let counter = 1;
    const checkConflict = (checkId: string) => {
      const existsInDb = existingItems.some(item => String(item.id).toLowerCase() === checkId.toLowerCase());
      const existsInRows = allRows.some(row => String(row.id).toLowerCase() === checkId.toLowerCase() && row.id !== id);
      return existsInDb || existsInRows;
    };

    while (checkConflict(finalId)) {
      finalId = `${base}-${counter}`;
      counter++;
    }

    return finalId;
  };

  const handleSaveSpreadsheetRow = async (rowId: string) => {
    let row = spreadsheetRows.find(r => r.id === rowId);
    if (!row) return;

    const resolvedId = ensureValidId(row.id, row.name, dbEditorCollection, dbEditorItems, spreadsheetRows);
    if (resolvedId !== row.id) {
      row = { ...row, id: resolvedId, _dirty: true };
      setSpreadsheetRows(prev => prev.map(r => r.id === rowId ? { ...r, id: resolvedId } : r));
    }

    setLoading(true);
    try {
      const cleanPayload = formatSpreadsheetRecord(row, dbEditorCollection);

      const headers = {
        'Content-Type': 'application/json',
        'x-admin-password': 'admin123'
      };

      const alreadyExists = dbEditorItems.some(item => item.id === cleanPayload.id);
      const url = alreadyExists
        ? `/api/admin/data/${dbEditorCollection}/${cleanPayload.id}`
        : `/api/admin/data/${dbEditorCollection}`;
      const method = alreadyExists ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(cleanPayload)
      });

      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Successfully synchronized Excel row "${cleanPayload.id}" directly to Firebase!`
        });
        await loadDbEditorCollection(dbEditorCollection);
        await fetchBaselineData();
        await loadAdminDashboard();
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.error || 'Server validation rejected the changes.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Row save failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllSpreadsheetRows = async () => {
    const dirtyRows = spreadsheetRows.filter(row => row._dirty);
    if (dirtyRows.length === 0) {
      setNotification({
        type: 'error',
        message: 'No modified or newly imported rows found to save.'
      });
      return;
    }

    setLoading(true);
    try {
      const updatedRowsMap: Record<string, string> = {};
      const resolvedDirtyRows = dirtyRows.map(row => {
        const resolvedId = ensureValidId(row.id, row.name, dbEditorCollection, dbEditorItems, spreadsheetRows);
        if (resolvedId !== row.id) {
          updatedRowsMap[row.id] = resolvedId;
          return { ...row, id: resolvedId };
        }
        return row;
      });

      if (Object.keys(updatedRowsMap).length > 0) {
        setSpreadsheetRows(prev => prev.map(r => {
          if (updatedRowsMap[r.id]) {
            return { ...r, id: updatedRowsMap[r.id] };
          }
          return r;
        }));
      }

      const formattedRecords = resolvedDirtyRows.map(row => formatSpreadsheetRecord(row, dbEditorCollection));

      const headers = {
        'Content-Type': 'application/json',
        'x-admin-password': 'admin123'
      };

      const res = await fetch(`/api/admin/data/${dbEditorCollection}/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ records: formattedRecords })
      });

      if (res.ok) {
        setNotification({
          type: 'success',
          message: `Successfully saved all ${formattedRecords.length} rows directly to Firebase at once!`
        });
        await loadDbEditorCollection(dbEditorCollection);
        await fetchBaselineData();
        await loadAdminDashboard();
      } else {
        const err = await res.json();
        setNotification({ type: 'error', message: err.error || 'Server validation rejected the bulk changes.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Bulk save failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (spreadsheetRows.length === 0) {
      setNotification({ type: 'error', message: 'No records database to export CSV.' });
      return;
    }
    const sample = getStarterSkeleton(dbEditorCollection);
    const keys = Object.keys(sample);
    const csvHeaders = keys.join(',');
    const csvBody = spreadsheetRows.map(row => 
      keys.map(k => {
        let val = row[k];
        if (Array.isArray(val)) {
          val = val.join(';');
        }
        const strCell = String(val ?? '').replace(/"/g, '""');
        return `"${strCell}"`;
      }).join(',')
    ).join('\n');

    const blob = new Blob([[csvHeaders, csvBody].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hillytrip_${dbEditorCollection}_excel_export.csv`;
    link.click();
    setNotification({ type: 'success', message: `Exported ${spreadsheetRows.length} rows to Excel.` });
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        if (lines.length < 2) {
          setNotification({ type: 'error', message: 'CSV file must contain a header row and at least one data row.' });
          return;
        }

        const parseLine = (lineStr: string): string[] => {
          const cells: string[] = [];
          let insideQuote = false;
          let temp = '';
          for (let i = 0; i < lineStr.length; i++) {
            const char = lineStr[i];
            if (char === '"') {
              insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
              cells.push(temp.trim());
              temp = '';
            } else {
              temp += char;
            }
          }
          cells.push(temp.trim());
          return cells.map(c => {
            if (c.startsWith('"') && c.endsWith('"')) {
              return c.substring(1, c.length - 1).replace(/""/g, '"');
            }
            return c;
          });
        };

        const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
        const template = getStarterSkeleton(dbEditorCollection);
        const expectedKeys = Object.keys(template);
        const hasIdHeader = headers.some(h => h === 'id');

        const loadedRows: any[] = [];

        for (let idx = 1; idx < lines.length; idx++) {
          const cells = parseLine(lines[idx]);
          const rowObj: any = { ...template };
          if (!hasIdHeader) {
            rowObj.id = '';
          }

          headers.forEach((headerName, colIdx) => {
            const matchedKey = expectedKeys.find(k => k.toLowerCase() === headerName);
            if (matchedKey) {
              const valueStr = cells[colIdx] ?? '';
              const sampleVal = template[matchedKey];
              
              if (typeof sampleVal === 'boolean') {
                rowObj[matchedKey] = valueStr.toLowerCase() === 'true' || valueStr === '1' || valueStr === 'yes';
              } else if (typeof sampleVal === 'number') {
                rowObj[matchedKey] = Number(valueStr) || 0;
              } else if (Array.isArray(sampleVal)) {
                let parsedArr: string[] = [];
                if (valueStr) {
                  const separator = valueStr.includes(';') ? ';' : ',';
                  parsedArr = valueStr.split(separator).map(s => s.trim()).filter(Boolean);
                }
                rowObj[matchedKey] = parsedArr;
              } else {
                rowObj[matchedKey] = valueStr;
              }
            }
          });

          if (!rowObj.id || String(rowObj.id).trim() === '') {
            rowObj.id = `${dbEditorCollection === 'trip_leads' ? 'trip' : (dbEditorCollection === 'car_leads' ? 'car' : (dbEditorCollection === 'contributions' ? 'contrib' : dbEditorCollection))}_imported_${Date.now()}_${idx}`;
          }
          
          rowObj._dirty = true;
          loadedRows.push(rowObj);
        }

        if (loadedRows.length > 0) {
          setSpreadsheetRows(prev => [...loadedRows, ...prev]);
          setNotification({
            type: 'success',
            message: `Successfully loaded ${loadedRows.length} rows! Modified or newly imported rows are highlighted in orange. Click "Save" on the right of any row to push directly to Firebase.`
          });
        } else {
          setNotification({ type: 'error', message: 'No valid data rows could be parsed from the CSV.' });
        }
      } catch (err: any) {
        setNotification({ type: 'error', message: `CSV Parsing error: ${err.message}` });
      } finally {
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    if (isAdmin && adminActiveTab === 'add-data') {
      loadDbEditorCollection(dbEditorCollection);
      setDbEditorSelectedId(null);
      setDbEditorJSON(JSON.stringify(getStarterSkeleton(dbEditorCollection), null, 2));
    }
  }, [dbEditorCollection, adminActiveTab, isAdmin]);

  // Helper lists of categories
  const attractionCategories = ['Viewpoint', 'Monastery', 'Waterfall', 'Lake', 'Trek', 'Village'];
  const [attractionFilter, setAttractionFilter] = useState<string>('All');
  const [attractionSelectedState, setAttractionSelectedState] = useState<string>('All');
  const [attractionSelectedDistrict, setAttractionSelectedDistrict] = useState<string>('All');
  const [attractionSelectedDestination, setAttractionSelectedDestination] = useState<string>('All');
  const [attractionVisibleCount, setAttractionVisibleCount] = useState<number>(8);
  const attractionObserverRef = useRef<IntersectionObserver | null>(null);
  const attractionSentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (attractionObserverRef.current) {
      attractionObserverRef.current.disconnect();
    }
    if (node) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setAttractionVisibleCount(prev => prev + 8);
        }
      }, { threshold: 0.1 });
      observer.observe(node);
      attractionObserverRef.current = observer;
    }
  }, []);

  // Dynamic Destination Discovery States
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [surpriseDest, setSurpriseDest] = useState<any | null>(null);
  const [destBrowsePage, setDestBrowsePage] = useState(1);
  const [destBrowseSort, setDestBrowseSort] = useState<'name' | 'newest' | 'views' | 'trending' | 'likes'>('name');
  const [destTypeFilter, setDestTypeFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [destSelectedState, setDestSelectedState] = useState('All');
  const [destSelectedDistrict, setDestSelectedDistrict] = useState('All');
  const [destSelectedExperience, setDestSelectedExperience] = useState('All');
  const [destSelectedCategory, setDestSelectedCategory] = useState('All');

  useEffect(() => {
    if (destinations.length > 0 && !surpriseDest) {
      const randomIndex = Math.floor(Math.random() * destinations.length);
      setSurpriseDest(destinations[randomIndex]);
    }
  }, [destinations, surpriseDest]);

  // Dynamic Attraction Discovery States
  const [attractionSearchQuery, setAttractionSearchQuery] = useState(() => {
    try {
      const hash = window.location.hash || window.location.search || '';
      const qIndex = hash.indexOf('?');
      if (qIndex !== -1) {
        const params = new URLSearchParams(hash.substring(qIndex));
        return params.get('search') || params.get('q') || '';
      }
    } catch (e) {}
    return '';
  });
  const [debouncedAttractionSearchQuery, setDebouncedAttractionSearchQuery] = useState('');
  const [liveAttractions, setLiveAttractions] = useState<any[]>([]);
  const [isLoadingLiveAttractions, setIsLoadingLiveAttractions] = useState(false);

  useEffect(() => {
    const syncAttractionsQueryFromUrl = () => {
      try {
        const hash = window.location.hash || window.location.search || '';
        const qIndex = hash.indexOf('?');
        if (qIndex !== -1) {
          const params = new URLSearchParams(hash.substring(qIndex));
          const q = params.get('search') || params.get('q') || '';
          if (q) setAttractionSearchQuery(q);
        }
      } catch (e) {}
    };
    syncAttractionsQueryFromUrl();
    window.addEventListener('hashchange', syncAttractionsQueryFromUrl);
    return () => window.removeEventListener('hashchange', syncAttractionsQueryFromUrl);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedAttractionSearchQuery(attractionSearchQuery.trim());
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [attractionSearchQuery]);

  useEffect(() => {
    if (!debouncedAttractionSearchQuery) {
      setLiveAttractions([]);
      return;
    }

    let isCurrent = true;
    setIsLoadingLiveAttractions(true);

    fetch(`/api/attractions?search=${encodeURIComponent(debouncedAttractionSearchQuery)}`)
      .then(res => {
        if (!res.ok) throw new Error('Search failed');
        return res.json();
      })
      .then(data => {
        if (isCurrent && Array.isArray(data)) {
          setLiveAttractions(data);
        }
      })
      .catch(err => {
        console.error('Error fetching live search attractions:', err);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingLiveAttractions(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedAttractionSearchQuery]);

  const [surpriseAttraction, setSurpriseAttraction] = useState<any | null>(null);
  const [browsePage, setBrowsePage] = useState(1);
  const [browseSort, setBrowseSort] = useState<'name' | 'newest' | 'views' | 'explored'>('name');

  useEffect(() => {
    if (attractions.length > 0 && !surpriseAttraction) {
      const randomIndex = Math.floor(Math.random() * attractions.length);
      setSurpriseAttraction(attractions[randomIndex]);
    }
  }, [attractions, surpriseAttraction]);



  // Search logic for routes
  const handleRouteSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFrom || !searchTo) {
      setNotification({ type: 'error', message: 'Please specify both originating and goal hubs.' });
      return;
    }
    if (searchFrom === searchTo) {
      setNotification({ type: 'error', message: 'Origin and target hubs must be distinct locations.' });
      return;
    }
    saveRecentRouteSearch(searchFrom, searchTo, undefined, undefined, hubs, destinations);
    const fromH = hubs.find(h => h.id === searchFrom);
    const toH = hubs.find(h => h.id === searchTo);
    const fromSlug = fromH ? getItemSlug(fromH) : getItemSlug(searchFrom);
    const toSlugStr = toH ? getItemSlug(toH) : getItemSlug(searchTo);
    navigate(`#/route/${fromSlug}-to-${toSlugStr}`);
  };

  const clickQuickSearchRoute = (fromId: string, toId: string) => {
    setSearchFrom(fromId);
    setSearchTo(toId);
    saveRecentRouteSearch(fromId, toId, undefined, undefined, hubs, destinations);
    const fromH = hubs.find(h => h.id === fromId);
    const toH = hubs.find(h => h.id === toId);
    const fromSlug = fromH ? getItemSlug(fromH) : getItemSlug(fromId);
    const toSlugStr = toH ? getItemSlug(toH) : getItemSlug(toId);
    navigate(`#/route/${fromSlug}-to-${toSlugStr}`);
  };

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  if (params && params.get('trigger_iframe_auth') === 'true') {
    const handleStandaloneGoogleSignIn = async () => {
      try {
        await googleSignIn();
      } catch (error: any) {
        const isCancel = error?.code === 'auth/popup-closed-by-user' || 
          error?.isCancellation ||
          error?.message?.includes('closed by the user') ||
          error?.message?.includes('cancelled');
        if (isCancel) {
          console.info('[Google Auth] Sign-in window was closed by the user.');
          setNotification({
            type: 'info',
            message: 'Sign-in was cancelled. Click the button to try again.'
          });
        } else {
          console.error('Google authorization error on standalone page:', error);
          setNotification({
            type: 'error',
            message: error?.message || 'Google Sign-In is currently unavailable. Please try again later.'
          });
        }
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans selection:bg-indigo-500/30">
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Compass className="w-6 h-6 text-emerald-400" />
          <span className="font-display font-extrabold text-base tracking-tight text-white uppercase">HillyTrip Portal</span>
        </div>
        
        {notification && (
          <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-xl shadow-lg border text-xs max-w-sm flex items-center gap-3 animate-slide-in ${
            notification.type === 'success' 
              ? 'bg-emerald-950 border-emerald-800 text-emerald-200' 
              : 'bg-rose-950 border-rose-900 text-rose-200'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-auto text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>

          <div className="mx-auto w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-2xl tracking-tight text-white">Iframe Secure Bridge</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Authenticate via this standalone tab. Once signed in, this window will automatically transmit the session back to the HillyTrip iframe and self-close safely.
            </p>
          </div>

          <div className="pt-2">
            {user ? (
              <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-2xl p-4 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-mono tracking-widest font-bold">Successfully Connected</p>
                  <p className="text-sm font-bold text-white mt-1">{user.displayName || user.email}</p>
                </div>
                <p className="text-xs text-slate-400">Communicating auth tokens to parent window...</p>
              </div>
            ) : (
              <button
                onClick={handleStandaloneGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-bold py-3.5 px-4 rounded-xl transition duration-150 shadow-md cursor-pointer text-sm"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.95 1 12 1 7.37 1 3.4 3.65 1.51 7.5l3.85 3C6.31 7.51 8.94 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.84c2.25-2.07 3.57-5.12 3.57-8.66z" />
                  <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.51 6.9C.55 8.84 0 11.01 0 13.3c0 2.29.55 4.46 1.51 6.4l3.85-3.2z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.84-2.98c-1.07.72-2.44 1.15-4.12 1.15-3.06 0-5.69-2.47-6.64-5.46L1.51 16.3C3.4 20.15 7.37 23 12 23z" />
                </svg>
                Sign in with Google
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>256-Bit TLS Standalone Protection</span>
          </div>
        </div>

        {/* Google Sign-In Portal Modal */}
        {showGoogleSimulator && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <div className="bg-white text-slate-800 rounded-2xl max-w-sm w-full p-8 shadow-2xl border border-slate-100 text-left space-y-6 relative overflow-hidden animate-fade-in font-sans">
              
              {/* Top Google header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <svg className="w-10 h-10" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-.67-1.39-1.43-1.67-2.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sign in with Google</h2>
                  <p className="text-xs text-slate-500 mt-1">to continue to HillyTrip</p>
                </div>
              </div>

              {/* Custom Email section */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Google Email Address</label>
                    <input
                      type="email"
                      value={simulatedEmail}
                      onChange={(e) => setSimulatedEmail(e.target.value)}
                      placeholder="e.g. traveler@gmail.com"
                      className="w-full px-3.5 py-2.5 text-slate-800 placeholder-slate-400 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Name (Optional)</label>
                    <input
                      type="text"
                      value={simulatedName}
                      onChange={(e) => setSimulatedName(e.target.value)}
                      placeholder="e.g. Amit Sharma"
                      className="w-full px-3.5 py-2.5 text-slate-800 placeholder-slate-400 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleSimulator(false)}
                    disabled={simulatedLoading}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-transparent transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (!simulatedEmail) {
                        setNotification({ type: 'error', message: 'Please enter an email address to continue.' });
                        return;
                      }
                      handleSimulatedGoogleLogin(simulatedEmail, simulatedName);
                    }}
                    disabled={simulatedLoading}
                    className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                  >
                    {simulatedLoading ? (
                      <>
                        <span className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block border-2 border-white border-t-transparent rounded-full" />
                        Authorizing...
                      </>
                    ) : (
                      'Authorize & Continue'
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <ThemeEngineProvider 
      user={user} 
      onUpdateUser={handleSetUser} 
      themeMode={themeMode}
      onThemeChange={(newTheme) => setTheme(newTheme)}
    >
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen
            key="hillytrip-splash"
            onComplete={() => {
              setShowSplash(false);
              try {
                sessionStorage.setItem('hillytrip_splash_shown', 'true');
              } catch (e) {}
            }}
          />
        )}
      </AnimatePresence>

      <div className={`min-h-screen flex flex-col transition-colors duration-200 max-w-full overflow-x-clip ${
        themeMode === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-800'
      }`} id="hillytrip-root">
      {/* Impersonation Mode Banner for Super Admin */}
      <ImpersonationBanner onNavigate={navigate} />

      {/* Dynamic Toast Alerts */}
      {notification && (
        <div 
          id="global-toast-notification"
          className={`fixed top-24 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[9999] flex items-center gap-3 p-4 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 backdrop-blur-md animate-bounce ${
            notification.type === 'success' 
              ? 'bg-emerald-50/95 border-emerald-400 text-emerald-900' 
              : notification.type === 'info'
              ? 'bg-blue-50/95 border-blue-400 text-blue-900'
              : 'bg-rose-50/95 border-rose-400 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : notification.type === 'info' ? (
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium flex-1 min-w-0 break-words">{notification.message}</span>
        </div>
      )}

      {/* PWA Install Prompt Banner overlay */}
      <PWAInstallPrompt themeMode={themeMode} />

      {/* Main Premium Navbar */}
      {currentPath !== '/login' && currentPath !== '/signup' && currentHash !== '#/login' && currentHash !== '#/signup' && (
        <Navbar 
          currentHash={currentHash} 
          navigate={navigate} 
          user={user} 
          onLogin={handleUserLogin} 
          onLogout={handleUserLogout} 
          isOffline={isOffline}
          theme={theme}
          setTheme={setTheme}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          isAdmin={isAdmin}
          activeRoleTab={activeRoleTab}
          setActiveRoleTab={setActiveRoleTab}
          setNotification={setNotification}
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          drivers={drivers}
          hubs={hubs}
          routes={routes}
          onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
        />
      )}

      {/* Primary View Router Grid */}
      <main className={(currentPath === '/login' || currentPath === '/signup' || currentHash === '#/login' || currentHash === '#/signup') ? "flex-grow min-h-screen" : "flex-grow pb-20 md:pb-0"}>
        <React.Suspense fallback={
          <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
            <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl w-full" />
          </div>
        }>
        
        {/* Modular Route Registration Engine handles Public, Profile, Taxi, Business, Community and Admin routes */}

        {/* Modular Route Registration Engine handles Public, Profile, Taxi, Business, Community and Admin routes */}




        {/* ========================================================
            HIDDEN GEMS VIEW
            ======================================================== */}
        {currentPath === '/hidden-gems' && (
          <div id="hidden-gems-view" className="animate-fade-in text-slate-700 bg-slate-50/50 dark:bg-slate-950/20 py-12 md:py-16 px-4">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
              
              {/* Header block with elegant typography and deep emerald accents */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-8 rounded-3xl shadow-xs text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <button
                  onClick={() => navigate('#/')}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200 font-extrabold mb-4 transition-colors cursor-pointer"
                >
                  ← Back to Home
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight flex items-center gap-2">
                      ⭐ Mount Hidden Gems
                    </h1>
                    <p className="text-sm text-slate-505 dark:text-slate-400 mt-1 max-w-2xl font-medium">
                      Explore our handpicked collection of quiet mountain villages, secluded waterfalls, and secret vantage points far away from standard traveler crowds.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 self-start md:self-center font-bold px-4 py-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-450 rounded-2xl text-xs shadow-2xs border border-emerald-250/20">
                    🌟 Verified Secret Destinations
                  </div>
                </div>
              </div>

              {/* Advanced Search & Filtering Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-5 rounded-3xl shadow-2xs flex flex-col md:flex-row items-center gap-4 justify-between">
                {/* Search Input */}
                <div className="relative w-full md:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search secret spots..."
                    value={gemSearch}
                    onChange={(e) => setGemSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden dark:text-slate-100 placeholder-slate-400"
                  />
                </div>

                {/* Filter Tabs / Quick Select */}
                {(() => {
                  const hiddenDestinations = destinations.filter(d => !!d.isHiddenGem).map(d => ({
                    ...d,
                    itemType: 'destination' as const,
                  }));
                  const hiddenAttractions = attractions.filter(a => !!a.isHiddenGem).map(a => ({
                    ...a,
                    itemType: 'attraction' as const,
                  }));
                  const allHiddenGems = [...hiddenDestinations, ...hiddenAttractions];

                  return (
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2 font-mono">Filter Type:</span>
                      <button
                        onClick={() => setGemFilterType('all')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 shadow-2xs cursor-pointer ${
                          gemFilterType === 'all'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200/70 border border-slate-250/20'
                        }`}
                      >
                        All Gems ({allHiddenGems.length})
                      </button>
                      <button
                        onClick={() => setGemFilterType('destination')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 shadow-2xs cursor-pointer ${
                          gemFilterType === 'destination'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200/70 border border-slate-250/20'
                        }`}
                      >
                        Destinations ({hiddenDestinations.length})
                      </button>
                      <button
                        onClick={() => setGemFilterType('attraction')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 shadow-2xs cursor-pointer ${
                          gemFilterType === 'attraction'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200/70 border border-slate-250/20'
                        }`}
                      >
                        Attractions ({hiddenAttractions.length})
                      </button>
                    </div>
                  );
                })()}
              </div>

              {/* Grid Layout of Hidden Gems */}
              {(() => {
                const hiddenDestinations = destinations.filter(d => !!d.isHiddenGem).map(d => ({
                  ...d,
                  itemType: 'destination' as const,
                }));
                const hiddenAttractions = attractions.filter(a => !!a.isHiddenGem).map(a => ({
                  ...a,
                  itemType: 'attraction' as const,
                }));
                const allHiddenGems = [...hiddenDestinations, ...hiddenAttractions];

                const filteredGems = allHiddenGems.filter(item => {
                  const matchesSearch = (item.name || '').toLowerCase().includes(gemSearch.toLowerCase()) || 
                                        (item.description || '').toLowerCase().includes(gemSearch.toLowerCase());
                  const matchesType = gemFilterType === 'all' || item.itemType === gemFilterType;
                  return matchesSearch && matchesType;
                });

                if (filteredGems.length === 0) {
                  return (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-250/65 dark:border-slate-800 shadow-xs">
                      <Search className="w-12 h-12 text-slate-400 mx-auto opacity-50 mb-3 animate-pulse" />
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-300">No secrets matched your criteria</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting filters or running a different search query.</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredGems.map((item) => {
                      const detailUrl = item.itemType === 'destination' ? `#/destination/${getItemSlug(item)}` : `/attraction/${getItemSlug(item)}`;
                      return (
                        <div
                          key={`${item.itemType}-${item.id}`}
                          id={`gem-grid-card-${item.id}`}
                          onClick={() => navigate(detailUrl)}
                          className="bg-white dark:bg-slate-900/85 rounded-2xl overflow-hidden shadow-2xs border border-slate-200/50 dark:border-slate-800/60 hover:shadow-md hover:border-emerald-250 dark:hover:border-emerald-500/30 transition-all duration-300 group flex flex-col h-full cursor-pointer"
                        >
                          <div className="relative h-52 overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                            <img
                              src={safeSrc(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black rounded-full px-2.5 py-1 shadow-md uppercase tracking-wider">
                              {item.itemType === 'destination' ? '📍 Destination' : '⭐ Attraction'}
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-6 flex flex-col flex-grow">
                            <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-120 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-450 transition-colors line-clamp-1 truncate">
                              {item.name}
                            </h3>
                            <p className="text-slate-550 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-grow font-sans font-medium">
                              {item.description}
                            </p>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">
                                {item.itemType === 'destination' ? 'Hill Station Secret' : 'Sightseeing Trail'}
                              </span>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5">
                                Discover spot <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================
            7. HOMESTAY DETAIL VIEW
            ======================================================== */}


        {/* ========================================================
            8. PLAN MY TRIP VIEW
            ======================================================== */}
        {currentPath === '/plan-my-trip' && (
          <div id="plan-my-trip-view" className="max-w-5xl mx-auto px-4 py-8 animate-fade-in text-center">
            {/* Planner Sub navigation tabs */}
            <div className="inline-flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl mb-8 border border-slate-200/50 dark:border-slate-800 shadow-2xs">
              <button
                onClick={() => setActivePlanTab('diy')}
                className={`px-6 py-2.5 text-xs font-black tracking-wide uppercase rounded-xl transition duration-150 cursor-pointer flex items-center gap-2 ${
                  activePlanTab === 'diy'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-505 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                DIY Custom Itinerary Builder
              </button>
              <button
                onClick={() => setActivePlanTab('intelligence')}
                className={`px-6 py-2.5 text-xs font-black tracking-wide uppercase rounded-xl transition duration-150 cursor-pointer flex items-center gap-2 ${
                  activePlanTab === 'intelligence'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-505 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Navigation className="w-4 h-4 text-sky-500 animate-pulse" />
                Spatial Route Planner
              </button>
              <button
                onClick={() => setActivePlanTab('inquiry')}
                className={`px-6 py-2.5 text-xs font-black tracking-wide uppercase rounded-xl transition duration-150 cursor-pointer flex items-center gap-2 ${
                  activePlanTab === 'inquiry'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-505 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Assisted Expert Agent Inquiry
              </button>
            </div>

            {activePlanTab === 'diy' && (
              <DIYItineraryPlanner
                destinations={destinations}
                attractions={attractions}
                homestays={homestays}
                routes={routes}
                savedItineraries={diyItineraries}
                onSaveItinerary={handleSaveItinerary}
                onDeleteItinerary={handleDeleteItinerary}
                setNotification={setNotification}
              />
            )}

            {activePlanTab === 'intelligence' && (
              <IntelligentRoutePlanner
                destinations={destinations}
                attractions={attractions}
                homestays={homestays}
                routes={routes}
                setNotification={setNotification}
              />
            )}

            {activePlanTab === 'inquiry' && (
              <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-md border-b-4 border-emerald-600 text-left">
                <div className="text-center mb-8">
                  <Compass className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hillary Trip Planner Inquiry</h2>
                  <p className="text-slate-500 text-sm mt-1">Fill this form to coordinate custom family arrangements, drivers & homestays.</p>
                </div>

                <form id="trip-lead-form" onSubmit={handleTripLeadSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Your Full Name (Primary Traveller) *</label>
                    <input 
                      name="name" 
                      type="text" 
                      required 
                      placeholder="e.g. Priyanjali Sen" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Mobile / WhatsApp Number *</label>
                      <input 
                        name="mobile" 
                        type="tel" 
                        required 
                        placeholder="e.g. 9800000000" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Target Base Destination Hub *</label>
                      <select name="destination" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-850">
                        {destinations.map((d, dIdx) => (
                          <option key={`${d.id}-${dIdx}`} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Ideal Date of Travel</label>
                      <input 
                        name="travelDate" 
                        type="date" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.2 text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Estimated Budget (INR)</label>
                      <input 
                        name="budget" 
                        type="number" 
                        placeholder="e.g. 15000" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans font-semibold text-slate-850"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Total Passengers</label>
                      <input 
                        name="numTravellers" 
                        type="number" 
                        min="1" 
                        placeholder="2" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs font-extrabold text-slate-400 uppercase block tracking-wider mb-2">Services Demanded</span>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" name="svc-homestay" className="accent-emerald-600 rounded-sm" /> 
                        Scenic Local Homestay Arrangements Included
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" name="svc-car" className="accent-emerald-600 rounded-sm" /> 
                        Private Pool / Dedicated Tour Guide & Car
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-slate-705 cursor-pointer">
                        <input type="checkbox" name="svc-planning" className="accent-emerald-600 rounded-sm" /> 
                        Full Customized Daily Itinerary Planning support
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white py-3.5 rounded-lg shadow-sm font-semibold cursor-pointer text-center"
                  >
                    Submit Travel Lead
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TRAVELLER MOMENTS & PHOTOS PAGE
            ======================================================== */}
        {(currentPath === '/moments' || currentPath.startsWith('/moments/') || currentPath === '/moment' || currentPath === '#/moments') && (
          <div className="animate-fade-in min-h-screen bg-slate-950 pt-20 pb-16">
            <React.Suspense fallback={null}>
              <TravellerMomentsSection
                publicPhotos={publicPhotos}
                destinations={destinations}
                attractions={attractions}
                homestays={homestays}
                likes={likes}
                navigate={navigate}
                user={user}
                onMomentUploaded={(newMoment) => {
                  setPublicPhotos(prev => [newMoment, ...prev]);
                }}
                initialMomentId={currentPath.startsWith('/moments/') ? currentPath.replace('/moments/', '').replace('#/moments/', '') : undefined}
              />
            </React.Suspense>
          </div>
        )}

        {/* ========================================================
            10. CONTRIBUTE DATA VIEW
            ======================================================== */}
        {currentPath === '/contribute' && (
          <div id="contribute-view" className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-b-4 border-emerald-600">
              <div className="text-center mb-8">
                <PlusCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Regional Contributor Desk</h2>
                <p className="text-slate-500 text-sm mt-1">Correct fares, report missing paths, or log new homestays for travelers.</p>
              </div>

              {/* Contributor choice */}
              <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200/50 mb-6 flex flex-wrap gap-1">
                {(['add_route', 'correct_route', 'report_missing_route', 'add_attraction', 'add_homestay', 'upload_photo'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedContribType(t)}
                    className={`flex-grow px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                      selectedContribType === t ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <form id="contrib-submission-form" onSubmit={handleContributionSubmit} className="space-y-4">
                {/* Meta details of contributor */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Your Name</label>
                    <input name="contributorName" type="text" placeholder="Thapa Lepcha" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Mandatory Mobile Contact *</label>
                    <input name="contributorMobile" type="tel" required placeholder="9800000000" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-sans" />
                  </div>
                </div>

                {/* Submisions specifics */}
                {selectedContribType === 'add_route' && (
                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-emerald-800">Route Node Configurator</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">From Hub *</label>
                        <select name="fromHubId" className="w-full text-xs font-semibold p-2 bg-slate-50 border rounded-lg">
                          {hubs.map((h, idx) => <option key={`db-from-${h.id}-${idx}`} value={h.id}>{h.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">To Hub *</label>
                        <select name="toHubId" className="w-full text-xs font-semibold p-2 bg-slate-50 border rounded-lg">
                          {hubs.map((h, idx) => <option key={`db-to-${h.id}-${idx}`} value={h.id}>{h.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Route Hop path stop sequences (Split via '-&gt;') *</label>
                      <input name="path" type="text" required placeholder="Siliguri -&gt; Sevoke -&gt; Kalijhora -&gt; Sittong" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Connection Category</label>
                        <select name="type" className="w-full text-xs p-2 bg-slate-50 border rounded-lg font-semibold">
                          <option value="Direct">Direct Node</option>
                          <option value="Indirect">Indirect / Multi stop</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Min Fare</label>
                        <input name="fareMin" type="number" required placeholder="1200" className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-sans" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Max Fare</label>
                        <input name="fareMax" type="number" required placeholder="1800" className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-sans" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Min Duration (mins)</label>
                        <input name="timeMin" type="number" placeholder="90" className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-sans" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Max Duration (mins)</label>
                        <input name="timeMax" type="number" placeholder="130" className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-sans" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Distance (km)</label>
                        <input name="distance" type="number" placeholder="45" className="w-full p-2 text-xs bg-slate-50 border rounded-lg font-sans" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedContribType === 'correct_route' && (
                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-emerald-800">Correct Existing Route Details</span>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Identify Target Route *</label>
                      <select name="routeId" className="w-full text-xs p-2 bg-slate-50 border rounded-lg font-semibold">
                        {routes.map((r, idx) => {
                          const fromHubName = hubs.find(h => h.id === r.fromHubId)?.name || r.fromHubId;
                          const toHubName = hubs.find(h => h.id === r.toHubId)?.name || r.toHubId;
                          return (
                            <option key={`correct-route-opt-${r.id}-${idx}`} value={r.id}>
                              {fromHubName} ➔ {toHubName} ({r.type}, ₹{r.fareMin}-₹{r.fareMax})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Correct Fare Min (Optional)</label>
                        <input name="fareMin" type="number" placeholder="1500" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Correct Fare Max (Optional)</label>
                        <input name="fareMax" type="number" placeholder="2200" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Correct Distance (Optional)</label>
                        <input name="distance" type="number" placeholder="50" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedContribType === 'add_attraction' && (
                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-emerald-800">Map New Nature Sight</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Attraction Name *</label>
                        <input name="name" type="text" required placeholder="Jogighat Waterfall" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Associated Base Destination *</label>
                        <select name="destinationId" className="w-full text-xs p-2 bg-slate-50 border rounded-lg font-semibold">
                          {destinations.map((d, dIdx) => <option key={`add-attr-dest-${d.id}-${dIdx}`} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sight Category *</label>
                      <select name="category" className="w-full text-xs p-2 bg-slate-50 border rounded-lg">
                        {attractionCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {renderContributionUploader('image', 'Cover Photo')}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Brief Descriptive Notes</label>
                      <textarea name="description" placeholder="Perched on cascades..." className="w-full p-2 text-xs bg-slate-50 border rounded-lg h-24" />
                    </div>
                  </div>
                )}

                {selectedContribType === 'add_homestay' && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-2">
                      <span className="text-sm font-extrabold text-emerald-800 uppercase tracking-wide">Register Local Organic Homestay</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Please provide as many details as possible. Vetted local listings gain up to 3x higher booking request rates.</p>
                    </div>

                    {/* Section: Basic Information */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">1. Basic Information & Contact</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Homestay Brand Name *</label>
                          <input name="name" type="text" required placeholder="Misty Orchid Lepcha Stay" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Parent Village Destination *</label>
                          <select name="destinationId" className="w-full p-2 text-xs font-semibold bg-white border border-slate-250 rounded-lg">
                            {destinations.map((d, dIdx) => <option key={`add-home-dest-${d.id}-${dIdx}`} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Min Cost / Night *</label>
                          <input name="priceMin" type="number" required placeholder="1200" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Max Cost / Night *</label>
                          <input name="priceMax" type="number" required placeholder="2200" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Host Phone/WhatsApp *</label>
                          <input name="contact" type="tel" required placeholder="+91 98000 00000" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Section: Narrative & Address */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">2. Narrative & Location Details</span>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Catchy Tagline / One-liner</label>
                        <input name="tagline" type="text" placeholder="A peaceful traditional wooden cottage with panoramic Himalayan vistas" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Detailed Local Address / Landmarking</label>
                        <input name="address" type="text" placeholder="Near Chibo School, Lower Chibo, Kalimpong, West Bengal" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">About the Host, Rooms, and Experience</label>
                        <textarea name="description" placeholder="Describe the warm hosts, view, organic agricultural practices, number of clean rooms, and scenic surroundings..." className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg h-24" />
                      </div>
                    </div>

                    {/* Section: Food & Hospitality */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">3. Food & Hospitality Options</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Breakfast Plan</label>
                          <select name="breakfastIncluded" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg">
                            <option value="Included">Breakfast Included in Tariff</option>
                            <option value="Not Included">Breakfast Charged Extra</option>
                            <option value="Additional Charges">Available on Order</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Amenities list (comma separated)</label>
                          <input name="amenities" type="text" placeholder="Organic Meals, Fireplace, Geyser, Parking" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="lunchAvailable" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Lunch Opt</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="dinnerAvailable" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Dinner Opt</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="vegOnly" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Veg-Only Stay</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="bonfireAvailable" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Bonfire</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="bbqAvailable" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">BBQ Grill</span>
                        </label>
                      </div>
                    </div>

                    {/* Section: Access, Power & Connectivity */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">4. Terrain Access & Utilities</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Walking distance from parking slot (Minutes)</label>
                          <input name="walkingDistanceParking" type="number" defaultValue="0" min="0" placeholder="0 if vehicle reaches doorstep" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Emergency / Host Back-up Contact</label>
                          <input name="emergencyContact" type="tel" placeholder="Alternative host phone number" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="taxiReachesProperty" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Cab to Doorstep</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="wifi" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">WiFi Available</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="powerBackup" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Power Backup</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="groundFloorRooms" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Ground Floor Rms</span>
                        </label>
                      </div>
                    </div>

                    {/* Section: Guest Guidelines & House Policies */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">5. House Rules & Safety Policies</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Pet Policy</label>
                          <input name="petPolicy" type="text" placeholder="Pets allowed / Not allowed" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Check-in hours</label>
                          <input name="checkInTime" type="text" defaultValue="12:00 PM" placeholder="e.g. 12:00 PM" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Check-out hours</label>
                          <input name="checkOutTime" type="text" defaultValue="11:00 AM" placeholder="e.g. 11:00 AM" className="w-full p-2 text-xs bg-white border border-slate-250 rounded-lg" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="familyFriendly" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Family Welcomed</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="unmarriedCouplesAllowed" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Couples Allowed</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="cctv" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">CCTV Cameras</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="caretaker" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Resident Caretaker</span>
                        </label>
                      </div>
                    </div>

                    {/* Section: Scenic Mountain Views & Media */}
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">6. Scenic Himalayan Views & Languages Spoken</span>
                      
                      <div className="text-[10px] uppercase font-bold text-slate-400 block -mb-1">Views & Activities Available</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="kanchenjungaView" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">🏔️ Kanchenjunga</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="teaGardenView" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">🍃 Tea Garden</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="forestView" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">🌲 Forest Wood</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="riverView" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">🌊 River Vista</span>
                        </label>
                      </div>

                      <div className="text-[10px] uppercase font-bold text-slate-400 block -mb-1 pt-1">Languages Spoken by Host Family</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="langEnglish" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">English</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="langHindi" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Hindi</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="langBengali" className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Bengali</span>
                        </label>
                        <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
                          <input type="checkbox" name="langNepali" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-[11px] text-slate-700 font-bold">Nepali</span>
                        </label>
                      </div>

                      <div className="pt-2">
                        {renderContributionUploader('image', 'Panoramic Scenic Photo')}
                      </div>
                    </div>
                  </div>
                )}

                {selectedContribType === 'upload_photo' && (
                  <div className="space-y-6">
                    {/* Photo Hub Navigation: Form / History / Notifications */}
                    <div className="flex border-b border-secondary/20 font-sans">
                      <button
                        type="button"
                        onClick={() => setPhotoSubTab('upload')}
                        className={`flex-1 py-3 text-center text-xs font-extrabold border-b-2 transition cursor-pointer ${
                          photoSubTab === 'upload' ? 'border-emerald-605 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        📷 Submit Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoSubTab('history')}
                        className={`flex-1 py-3 text-center text-xs font-extrabold border-b-2 transition relative cursor-pointer ${
                          photoSubTab === 'history' ? 'border-emerald-605 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        📁 My Uploads
                        {photoContributions.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-slate-200 text-slate-700 rounded-full font-bold">
                            {photoContributions.length}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoSubTab('notifications')}
                        className={`flex-1 py-3 text-center text-xs font-extrabold border-b-2 transition relative cursor-pointer ${
                          photoSubTab === 'notifications' ? 'border-emerald-605 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🔔 Alerts
                        {userNotifications.filter(n => !n.isRead).length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-rose-600 text-white rounded-full font-extrabold animate-pulse">
                            {userNotifications.filter(n => !n.isRead).length}
                          </span>
                        )}
                      </button>
                    </div>

                    {photoSubTab === 'upload' && (
                      <div className="space-y-4">
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-emerald-900">Traveller Photo Contribution</p>
                            <p className="text-[11px] text-emerald-700 leading-relaxed">
                              Upload high-resolution scenic photos directly. Please do not submit low-quality image files. Your travel uploards are optimized to WebP automatically.
                            </p>
                          </div>
                        </div>

                        {/* Uploader Coordinates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div>
                            <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Traveler Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Pasang Tamang"
                              value={photoUploaderName}
                              onChange={(e) => setPhotoUploaderName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-505 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Your Email Address *</label>
                            <input
                              type="email"
                              required
                              placeholder="e.g. pasang@gmail.com"
                              value={photoUploaderEmail}
                              onChange={(e) => setPhotoUploaderEmail(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-sans focus:ring-1 focus:ring-emerald-505 font-medium"
                            />
                          </div>
                        </div>

                        {/* Selected Destination Map */}
                        <div>
                          <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Mapping Location / Hub Destination *</label>
                          <select
                            required
                            value={photoSelectedDestId}
                            onChange={(e) => setPhotoSelectedDestId(e.target.value)}
                            className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 cursor-pointer text-slate-800"
                          >
                            <option value="">-- Choose mapped location --</option>
                            {destinations.map((d, index) => (
                              <option key={`dest-picker-it-${d.id}-${index}`} value={d.id}>
                                {d.name} ({d.state})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Image Device Picker */}
                        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <label className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider block">
                            Direct Image Upload (Strictly no external URLs) *
                          </label>
                          
                          {photoUploadedUrl ? (
                            <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-emerald-50/40 p-3 flex items-center justify-between gap-3 animate-fade-in">
                              <div className="flex items-center gap-3 min-w-0">
                                <img 
                                  src={photoUploadedUrl || undefined} 
                                  alt="Uploader preview" 
                                  className="w-16 h-16 object-cover rounded-xl border border-emerald-200 shadow-xs shrink-0" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-extrabold text-emerald-800 flex items-center gap-1">Staged & Optimized! 🟢</p>
                                  <p className="text-[10px] font-mono text-emerald-600 truncate max-w-[200px]">{photoUploadedUrl}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setPhotoUploadedUrl('')}
                                className="p-1 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-lg border border-rose-200 cursor-pointer transition shrink-0"
                              >
                                Clear
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white text-center hover:bg-slate-50 transition relative">
                                {isUploadingPhoto ? (
                                  <div className="space-y-1.5 py-2">
                                    <span className="flex h-4 w-4 relative mx-auto">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                                    </span>
                                    <p className="text-[11px] font-bold text-slate-700 animate-pulse">Running smart conversion...</p>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer space-y-1 w-full block py-2 text-center">
                                    <div className="mx-auto w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                                      <Camera className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <span className="text-xs font-extrabold text-emerald-600 hover:underline">Pick camera/scenic photo</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono">JPG, PNG, WebP optimized locally</p>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setIsUploadingPhoto(true);
                                        setNotification({ type: 'success', message: `Compressing and staging "${file.name}"...` });
                                        try {
                                          const webpBlobFile = await compressAndConvertToWebP(file);
                                          const uploadUrl = await uploadImageToFirebase(webpBlobFile, `contributions_${Date.now()}_${file.name}`);
                                          setPhotoUploadedUrl(uploadUrl);
                                          setNotification({ type: 'success', message: 'Scenic photo optimized successfully!' });
                                        } catch (err: any) {
                                          setNotification({ type: 'error', message: `Conversion error: ${err.message}` });
                                        } finally {
                                          setIsUploadingPhoto(false);
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-850 leading-relaxed font-semibold">
                          ℹ️ Confirming uploader details prevents malicious attempts and alerts you instantly upon admin validation.
                        </div>

                        {/* Submit Button inside tab */}
                        <button
                          type="submit"
                          disabled={isUploadingPhoto || !photoUploadedUrl}
                          className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isUploadingPhoto || !photoUploadedUrl 
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-transparent' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          <UploadCloud className="w-4 h-4" />
                          File Photo Contribution
                        </button>
                      </div>
                    )}

                    {photoSubTab === 'history' && (
                      <div className="space-y-4 animate-fade-in">
                        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block">My Photo Contributions</span>
                        {photoContributions.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-150 p-6">
                            <Compass className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-slate-600">No photos contributed yet.</p>
                            <p className="text-[11px] text-slate-400 mt-1">Submit your first travel photo to start building the Himalayas maps database!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {photoContributions.map((cont) => {
                              const destObj = destinations.find(d => d.id === cont.destinationId);
                              return (
                                <div key={cont.id} className="flex gap-4 p-4.5 bg-slate-50 rounded-2xl border border-slate-150 shadow-2xs items-start text-left">
                                  <img
                                    src={safeSrc(cont.imageUrl)}
                                    alt="Contributed thumbnail"
                                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <span className="text-xs font-bold text-slate-805">
                                        {destObj ? destObj.name : cont.destinationId}
                                      </span>
                                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase leading-none ${
                                        cont.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                        cont.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {cont.status}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                                      Submitted {new Date(cont.uploadedAt).toLocaleDateString()}
                                    </p>
                                    {cont.rejectionReason && (
                                      <div className="mt-2 bg-rose-50/80 p-2.5 rounded-lg border border-rose-100 text-[11px] text-rose-800 leading-relaxed font-sans">
                                        <span className="font-bold">Reason for Rejection:</span> {cont.rejectionReason}
                                      </div>
                                    )}
                                    {cont.approvedBy && (
                                      <p className="text-[9px] font-semibold text-slate-500 mt-1.5 flex items-center gap-1">
                                        <span>✅ Reviewed by:</span> <span className="font-bold text-emerald-700">{cont.approvedBy}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {photoSubTab === 'notifications' && (
                      <div className="space-y-4 animate-fade-in text-left">
                        <div className="flex justify-between items-center bg-slate-100/50 p-2.5 px-4 rounded-xl border border-slate-200">
                          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block font-semibold font-mono">Uploader Inbox Log</span>
                          <div className="flex items-center gap-3">
                            {userNotifications.filter(n => !n.isRead).length > 0 && (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const uId = user ? (user.uid || user.email) : 'anonymous';
                                    const res = await fetch('/api/notifications/read-all', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: uId })
                                    });
                                    if (res.ok) {
                                      if (user) {
                                        fetchUserPhotoData(user);
                                      }
                                    }
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                              >
                                Mark all as read
                              </button>
                            )}
                            {userNotifications.length > 0 && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm('Are you absolutely sure you want to permanently clear all notifications?')) {
                                    try {
                                      const uId = user ? (user.uid || user.email) : 'anonymous';
                                      const res = await fetch('/api/notifications/clear-all', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: uId })
                                      });
                                      if (res.ok) {
                                        if (user) {
                                          fetchUserPhotoData(user);
                                        }
                                      }
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }
                                }}
                                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                        </div>

                        {userNotifications.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-150 p-6">
                            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-bounce" />
                            <p className="text-xs font-semibold text-slate-600">No notifications found.</p>
                            <p className="text-[11px] text-slate-400 mt-1">Status changes on photo approvals and rejections will trigger real-time notifications here!</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {userNotifications.map((notif, idx) => (
                              <div
                                key={notif.id ? `user-notif-${notif.id}-${idx}` : `user-notif-idx-${idx}`}
                                onClick={async () => {
                                  if (!notif.isRead) {
                                    try {
                                      const res = await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
                                      if (res.ok && user) {
                                        fetchUserPhotoData(user);
                                      }
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }
                                }}
                                className={`p-4 rounded-xl border text-left transition cursor-pointer relative pr-12 ${
                                  notif.isRead 
                                    ? 'bg-slate-50 border-slate-150 text-slate-600' 
                                    : 'bg-emerald-50/50 border-emerald-250 text-slate-900 font-medium hover:bg-emerald-50'
                                }`}
                              >
                                <button
                                  type="button"
                                  title="Dismiss Notification"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const res = await fetch(`/api/notifications/${notif.id}/delete`, { method: 'POST' });
                                      if (res.ok && user) {
                                        fetchUserPhotoData(user);
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <div className="flex items-start gap-3">
                                  <div className="relative">
                                    <span className="text-lg shrink-0 mt-0.5 bg-white p-1 rounded-lg border shadow-xs block">
                                      {notif.type === 'photo_approved' ? '🎉' : '❌'}
                                    </span>
                                    {!notif.isRead && (
                                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border-2 border-white" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-extrabold">{notif.title}</p>
                                    <p className="text-[11px] mt-0.5 leading-relaxed text-slate-650">{notif.message}</p>
                                    <p className="text-[9px] text-slate-400 mt-1.5 font-mono">
                                      {new Date(notif.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedContribType === 'report_missing_route' && (
                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-emerald-800">Report Missing Route Connection</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">From (Airport, Station, or Town) *</label>
                        <input name="fromName" type="text" required placeholder="e.g. Bagdogra Airport" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">To Destination (Village, Homestay) *</label>
                        <input name="toName" type="text" required placeholder="e.g. Sittong Village" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Detailed Notes & transit directions *</label>
                      <textarea name="notes" required placeholder="e.g. Shared jeep leaves at 9 AM from airport, fare is usually ₹200..." className="w-full p-2 text-xs bg-slate-50 border rounded-lg h-24" />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 border border-slate-700 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl cursor-pointer"
                >
                  File Contribution Submission
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modular Route Registration Engine */}
        <PublicRoutes
          currentPath={currentPath}
          currentHash={currentHash}
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          routes={routes}
          drivers={drivers}
          hubs={hubs}
          likes={likes}
          comments={comments}
          publicPhotos={publicPhotos}
          destinationStats={destinationStats}
          attractionStats={attractionStats}
          toggleLike={toggleLike}
          navigate={navigate}
          user={user}
          searchFrom={searchFrom}
          setSearchFrom={setSearchFrom}
          searchTo={searchTo}
          setSearchTo={setSearchTo}
          handleRouteSearchSubmit={handleRouteSearchSubmit}
          clickQuickSearchRoute={clickQuickSearchRoute}
          setDestTypeFilter={setDestTypeFilter}
          setDestSearchQuery={setDestSearchQuery}
          setAttractionFilter={setAttractionFilter}
          setAttractionSearchQuery={setAttractionSearchQuery}
          executeProtectedAction={executeProtectedAction}
          activeDestDetail={activeDestDetail}
          activeAttrDetail={activeAttrDetail}
          activeHomeDetail={activeHomeDetail}
          setNotification={setNotification}
          isAdmin={isAdmin}
          themeMode={themeMode}
          onMomentUploaded={(newMoment) => {
            setPublicPhotos(prev => [newMoment, ...prev]);
            setActivePhotos(prev => [newMoment, ...prev]);
          }}
        />

        <ProfileRoutes
          currentPath={currentPath}
          user={user}
          hubs={hubs}
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          likes={likes}
          toggleLike={toggleLike}
          navigate={navigate}
          setNotification={setNotification}
          handleSetUser={handleSetUser}
          handleUserLogout={handleUserLogout}
          executeProtectedAction={executeProtectedAction}
        />

        <TaxiRoutes
          currentPath={currentPath}
          routes={routes}
          hubs={hubs}
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          drivers={drivers}
          user={user}
          navigate={navigate}
          setNotification={setNotification}
          handleSetUser={handleSetUser}
          handleUserLogin={handleUserLogin}
        />

        <BusinessRoutes
          currentPath={currentPath}
          user={user}
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          routes={routes}
          hubs={hubs}
          navigate={navigate}
          setNotification={setNotification}
          handleSetUser={handleSetUser}
          handleUserLogin={handleUserLogin}
          isAdmin={isAdmin}
        />

        <CommunityRoutes
          currentPath={currentPath}
          user={user}
          hubs={hubs}
          routes={routes}
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          publicPhotos={publicPhotos}
          likes={likes}
          bulletinReports={bulletinReports}
          handleAddLiveReport={handleAddLiveReport}
          handleUpvoteLiveReport={handleUpvoteLiveReport}
          setNotification={setNotification}
          isOffline={isOffline}
          setIsOffline={setIsOffline}
          handleUserLogin={handleUserLogin}
          isAdmin={isAdmin}
          navigate={navigate}
          onMomentUploaded={(newMoment) => {
            setPublicPhotos(prev => [newMoment, ...prev]);
            setActivePhotos(prev => [newMoment, ...prev]);
          }}
        />

        <AdminRoutes
          currentPath={currentPath}
          navigate={navigate}
        />

        {(currentPath === '/login' || currentPath === '/signup' || currentHash === '#/login' || currentHash === '#/signup') && (
          <div id="login-standalone-route-view" className="animate-fade-in min-h-screen">
            <HillyTripLoginPage
              initialMode={(currentPath === '/signup' || currentHash === '#/signup') ? 'signup' : 'login'}
              onBackToHome={() => {
                const target = (previousPathRef.current && previousPathRef.current !== '/login' && previousPathRef.current !== '/signup' && previousPathRef.current !== '#/login' && previousPathRef.current !== '#/signup') ? previousPathRef.current : '/';
                navigate(target);
              }}
              onSuccess={(loggedUser) => {
                handleSetUser(loggedUser);
                if (pendingAction) {
                  try {
                    pendingAction.callback();
                  } catch (pErr) {
                    console.error('Error executing pending action:', pErr);
                  }
                  setPendingAction(null);
                }
                const target = (previousPathRef.current && previousPathRef.current !== '/login' && previousPathRef.current !== '/signup' && previousPathRef.current !== '#/login' && previousPathRef.current !== '#/signup') ? previousPathRef.current : '/';
                navigate(target);
              }}
            />
          </div>
        )}

        </React.Suspense>
      </main>

      {/* platform footer */}
      {currentPath !== '/login' && currentPath !== '/signup' && currentHash !== '#/login' && currentHash !== '#/signup' && (
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 relative z-10 font-sans pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          
          {/* Guide Shortcut: Himalayan Travel Simulation Banner */}
          <div className="mb-12 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-emerald-500/10 to-transparent rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 mb-3 select-none">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                Interactive Onboarding Planner
              </span>
              <h4 className="text-lg md:text-xl font-black text-white">Wondering how the HillyTrip directory connects together?</h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
                Try our 30-second Travel Simulation Wizard! Answer 3 simple questions about your starting gate, travel style (trekking vs luxury) and private driver needs to instantly map a curated loop of scenic paths, private homestays, and altitude advices.
              </p>
            </div>
            <button
              onClick={() => navigate('#/routes')}
              className="relative z-10 w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 shrink-0 transition active:scale-95 cursor-pointer font-mono"
            >
              Start Travel Simulator 🗺️
            </button>
          </div>

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 xl:gap-12 text-center md:text-left">
            
            {/* Column 1: Explore */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-emerald-500/30 pb-2 w-28 md:w-full">
                Explore
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button 
                    onClick={() => navigate('#/')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Route Planner
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/destinations')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Destinations
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/attractions')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Attractions
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/hidden-gems')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Hidden Gems
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Services */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-emerald-500/30 pb-2 w-28 md:w-full">
                Services
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button 
                    onClick={() => navigate('#/book-car')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-300 hover:text-white"
                  >
                    Book Car
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/register/homestay')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-300 hover:text-white"
                  >
                    Homestays
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/plan-my-trip')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-300 hover:text-white"
                  >
                    Plan My Trip
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Community */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-emerald-500/30 pb-2 w-28 md:w-full">
                Community
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button 
                    onClick={() => navigate('#/contribute')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Contributor Desk
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/contribute')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Contribute Route
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/contribute')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Contribute Attraction
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-emerald-500/30 pb-2 w-28 md:w-full">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button 
                    onClick={() => setFooterModalType('about')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    About HillyTrip
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setFooterModalType('contact')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setFooterModalType('privacy')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setFooterModalType('terms')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/feedback')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white"
                  >
                    Reviews & Feedback
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: Contact */}
            <div className="flex flex-col items-center md:items-start space-y-4 col-span-1">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest border-b border-emerald-500/30 pb-2 w-28 md:w-full">
                Contact
              </h4>
              <ul className="space-y-2.5 text-sm w-full">
                <li className="overflow-hidden">
                  <a 
                    href="mailto:support@hillytrip.com" 
                    className="hover:text-emerald-400 transition-colors duration-200 text-slate-400 hover:text-white block truncate max-w-full"
                  >
                    support@hillytrip.com
                  </a>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('#/contribute')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white text-center md:text-left"
                  >
                    Route Corrections
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setFooterModalType('partnership')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white text-center md:text-left"
                  >
                    Partnership Enquiries
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setFooterModalType('technical')} 
                    className="hover:text-emerald-400 transition-colors duration-200 cursor-pointer text-slate-400 hover:text-white text-center md:text-left"
                  >
                    Technical Support
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Social icons row */}
          <div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center text-center gap-2">
              <AnimatedLogo variant="full" size="md" theme="dark" animated={true} />
              <span className="text-[10px] text-slate-500 block tracking-wider uppercase font-medium">India's Intelligent Mountain Travel Network</span>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href="https://wa.me/918820656166" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#25D366] hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Bottom Bar info */}
          <div className="mt-8 pt-8 border-t border-slate-800/40 text-center space-y-4">
            <p className="text-slate-400 text-sm font-semibold tracking-wide">
              India's Intelligent Mountain Travel Network
            </p>
            <p className="max-w-xl mx-auto text-xs text-slate-500 leading-relaxed">
              Built for discovering destinations, attractions, routes, homestays and authentic mountain experiences across India.
            </p>
            <p className="text-[11px] text-slate-600 font-medium">
              © 2026 HillyTrip. All rights reserved.
            </p>
          </div>

          {/* Admin Area (Only visible to verified admins) */}
          {isAdmin && (
            <div className="mt-8 pt-4 border-t border-slate-900 flex justify-center">
              <button 
                onClick={() => navigate('#/admin')} 
                className="text-[10px] text-slate-700 hover:text-slate-500 hover:bg-slate-900/40 px-3 py-1.5 rounded font-mono transition-all duration-200 tracking-wider flex items-center gap-1.5 cursor-pointer border border-transparent"
              >
                <Shield className="w-3 h-3 text-slate-850" />
                Backoffice Admin Control Link
              </button>
            </div>
          )}

        </div>
      </footer>
      )}

      {/* Info Modals for Footer links */}
      {footerModalType && footerModalType !== 'simulation_wizard' && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setFooterModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800/80 p-1.5 rounded-full transition duration-150"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-left space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <Compass className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-bold tracking-tight capitalize">
                  {footerModalType === 'about' && 'About HillyTrip'}
                  {footerModalType === 'privacy' && 'Privacy Policy'}
                  {footerModalType === 'terms' && 'Terms of Service'}
                  {footerModalType === 'contact' && 'Contact Enquiries'}
                  {footerModalType === 'partnership' && 'Partnership Desk'}
                  {footerModalType === 'technical' && 'Technical Support Info'}
                </h3>
              </div>

              <div className="text-sm text-slate-300 leading-relaxed font-sans space-y-3">
                {footerModalType === 'about' && (
                  <>
                    <p>
                      <strong>HillyTrip</strong> is India's premier intelligent mountain travel routing system. We map clean physical pathways, verify passenger fares, highlight offbeat destinations and index cozy community-driven eco-homestays.
                    </p>
                    <p>
                      Through open collaborative updates from regional drivers and travellers, HillyTrip continuously corrects route timetables, weather alerts, and localized fare data to facilitate a safe mountain touring blueprint.
                    </p>
                  </>
                )}

                {footerModalType === 'privacy' && (
                  <>
                    <p>
                      Your privacy is essential to our map services. HillyTrip stores traveler choices, favorites, and cached route nodes locally inside your browser, allowing perfect, offline navigation among network nodes.
                    </p>
                    <p>
                      We do not harvest absolute geolocation paths in real-time or monetize lists. Submitted lead coordinates are kept secure and shared exclusively with your selected local taxi union handlers or certified homestay hosts during request dispatching.
                    </p>
                  </>
                )}

                {footerModalType === 'terms' && (
                  <>
                    <p>
                      Transit schedules, altitudes, and terrain difficulties published across HillyTrip are crowd-sourced and verified daily. However, Himalayan weather conditions and landslide risks are variable. Always check local regional traffic control desks before departing from hubs.
                    </p>
                    <p>
                      All contributors logging corrections must commit strictly authentic data. Falsification of fare ranges or registration of ghost homestays will result in severe IP bans and revocation of portal administrative credentials.
                    </p>
                  </>
                )}

                {footerModalType === 'contact' && (
                  <div className="space-y-3">
                    <p>We are delighted to assist your offbeat mountain endeavors. Reach out directly to our coordinates below:</p>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 mt-2">
                      <p>📍 <strong>Kalimpong Main Office:</strong> Deolo Ridge Road, Kalimpong, West Bengal, India</p>
                      <p>✉️ <strong>Corporate Queries:</strong> support@hillytrip.com</p>
                      <p>📞 <strong>Sikkim/Darjeeling Area Helpline:</strong> +91 88206 56166</p>
                    </div>
                  </div>
                )}

                {footerModalType === 'partnership' && (
                  <>
                    <p>
                      HillyTrip bridges metropolitan travelers with deep, rural mountain micro-economies. If you operate an independent homestay property, a localized taxi union cluster, or luxury tourist travel coaches across North-East India or the Western Ghats, partner with us!
                    </p>
                    <p>
                      By registering through our onboarding hub, you gain visibility within verified local transit streams. Send partnership agreements or group proposal documents to <a href="mailto:support@hillytrip.com" className="text-emerald-400 hover:underline">support@hillytrip.com</a>.
                    </p>
                  </>
                )}

                {footerModalType === 'technical' && (
                  <div className="space-y-3">
                    <p>
                      Need developer integration keys or experiencing platform access anomalies?
                    </p>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                      <p>💻 <strong>API Ingress Resolution:</strong> 24-hr status active</p>
                      <p>🛠️ <strong>Submit Issue:</strong> support@hillytrip.com</p>
                      <p>📁 <strong>Blueprint ID:</strong> AI-STUDIO-30FCA5DC</p>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Service status: Fully Operational. Local database localDb engine fully connected.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={() => setFooterModalType(null)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition duration-155 cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traveler Interactive Simulation Wizard Wide Modal Overlay */}
      {footerModalType === 'simulation_wizard' && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-4 md:p-6 max-w-5xl w-full shadow-2xl relative my-auto max-h-[95vh] overflow-y-auto scrollbar-thin">
            <button 
              onClick={() => setFooterModalType(null)}
              className="absolute top-4 right-4 text-slate-450 hover:text-white bg-slate-800/80 p-1.5 rounded-full transition duration-150 z-30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-4">
              <TravelSimulationWizard
                hubs={hubs}
                destinations={destinations}
                attractions={attractions}
                homestays={homestays}
                routes={routes}
                themeMode={themeMode}
                onNavigate={(path) => {
                  setFooterModalType(null); // Close modal when navigating
                  navigate(path);
                }}
                setSearchFrom={setSearchFrom}
                setSearchTo={setSearchTo}
                onExecuteSearch={(fromId, toId) => {
                  setFooterModalType(null); // Close modal
                  clickQuickSearchRoute(fromId, toId);
                }}
              />
            </div>
          </div>
        </div>
      )}


      {/* Traveler Direct Inquiry Modal */}
      {inquiryModalOpen && activeHomeDetail?.homestay && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative text-left font-sans">
            <button 
              onClick={() => setInquiryModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition duration-150 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="bg-emerald-50 text-emerald-850 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-emerald-100 uppercase">
                Secure Reservation Inquiry
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                Inquire with {activeHomeDetail.homestay.name}
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Sent directly to the verified partner or host.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = {
                    homestayId: activeHomeDetail.homestay.id,
                    userName: inqName,
                    userEmail: inqEmail,
                    userMobile: inqMobile,
                    travelDate: inqDate,
                    numberOfGuests: Number(inqGuests),
                    message: inqMessage
                  };

                  const res = await fetch('/api/inquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });

                  const data = await res.json();
                  if (data.success) {
                    setNotification({
                      type: 'success',
                      message: '🎉 Inquiry sent directly! Host has been routed your booking message.'
                    });
                    setInquiryModalOpen(false);
                  } else {
                    setNotification({ type: 'error', message: data.error || 'Failed to file inquiry' });
                  }
                } catch (err: any) {
                  setNotification({ type: 'error', message: err.message || 'Server error occurred' });
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inqName}
                    onChange={(e) => setInqName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    value={inqEmail}
                    onChange={(e) => setInqEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Mobile Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91..."
                    value={inqMobile}
                    onChange={(e) => setInqMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Approx Travel Date</label>
                  <input
                    type="date"
                    value={inqDate}
                    onChange={(e) => setInqDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Number of Guests</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={inqGuests}
                  onChange={(e) => setInqGuests(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Message to Host *</label>
                <textarea
                  required
                  placeholder="Tell the host about your food preferences, vehicle pick-up requirements or bedding preferences..."
                  value={inqMessage}
                  onChange={(e) => setInqMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 h-20 text-xs outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition cursor-pointer"
              >
                Send Secure Inquiry (Direct Route) 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Support Button */}
      {showFloatingWidgets && (
        <FloatingWhatsAppSupport
          currentPath={currentPath}
          activeDestDetail={activeDestDetail}
          activeHomeDetail={activeHomeDetail}
          activeAttrDetail={activeAttrDetail}
        />
      )}

      {/* Google Sign-In Portal Modal */}
      {showGoogleSimulator && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-2xl max-w-sm w-full p-8 shadow-2xl border border-slate-100 text-left space-y-6 relative overflow-hidden animate-fade-in font-sans">
            
            {/* Top Google header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <svg className="w-10 h-10" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-.67-1.39-1.43-1.67-2.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sign in with Google</h2>
                <p className="text-xs text-slate-500 mt-1">to continue to HillyTrip</p>
              </div>
            </div>

            {/* Custom Email section */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Google Email Address</label>
                  <input
                    type="email"
                    value={simulatedEmail}
                    onChange={(e) => setSimulatedEmail(e.target.value)}
                    placeholder="e.g. traveler@gmail.com"
                    className="w-full px-3.5 py-2.5 text-slate-800 placeholder-slate-400 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={simulatedName}
                    onChange={(e) => setSimulatedName(e.target.value)}
                    placeholder="e.g. Amit Sharma"
                    className="w-full px-3.5 py-2.5 text-slate-800 placeholder-slate-400 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleSimulator(false)}
                  disabled={simulatedLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-transparent transition cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    if (!simulatedEmail) {
                      setNotification({ type: 'error', message: 'Please enter an email address to continue.' });
                      return;
                    }
                    handleSimulatedGoogleLogin(simulatedEmail, simulatedName);
                  }}
                  disabled={simulatedLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  {simulatedLoading ? (
                    <>
                      <span className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block border-2 border-white border-t-transparent rounded-full" />
                      Authorizing...
                    </>
                  ) : (
                    'Authorize & Continue'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Universal AI Travel Planner Modal Window */}
      <React.Suspense fallback={null}>
        <AiTravelPlannerModal
          isOpen={isAiPlannerOpen}
          onClose={() => {
            setIsAiPlannerOpen(false);
            if (currentPath === '/ai-planner' || currentHash === '#/ai-planner') {
              window.location.hash = '#/';
            }
          }}
        />
      </React.Suspense>
      {/* Mascot Asset Studio Modal */}
      <React.Suspense fallback={null}>
        <MascotAssetStudioModal
          isOpen={isMascotStudioOpen}
          onClose={() => {
            setIsMascotStudioOpen(false);
            if (currentPath === '/mascot' || currentHash === '#/mascot' || currentHash === '#/mascots') {
              window.location.hash = '#/';
            }
          }}
        />
      </React.Suspense>
      {/* Pre-Booking Enquiry Modal */}
      {enquireModalOpen && (
        <React.Suspense fallback={null}>
          <PreBookingEnquiryModal
            isOpen={enquireModalOpen}
            onClose={() => {
              setEnquireModalOpen(false);
              if (window.location.hash.includes('?')) {
                window.location.hash = window.location.hash.split('?')[0];
              }
            }}
            currentUser={user || ({
              id: 'traveller_guest_777',
              name: 'Traveler Guest',
              email: 'traveler@hillytrip.com',
              role: 'traveler',
              photoURL: '/images/hillytrip/hillytrip-default.svg'
            } as any)}
            business={enquireBusiness}
            initialBookingDetails={enquireBookingDetails}
            navigate={navigate}
          />
        </React.Suspense>
      )}
    </div>
  </ThemeEngineProvider>
);
}
