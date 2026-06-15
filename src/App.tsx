import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowRight, MapPin, Compass, Sparkles, Home, Shield, Calendar, 
  Users, Wallet, Car, MessageCircle, AlertCircle, Camera, CheckCircle, 
  Trash2, Filter, Loader2, RefreshCw, ChevronRight, ChevronDown, ChevronUp, Info, PlusCircle, ArrowLeft,
  UploadCloud, CheckCircle2, Save, FileSpreadsheet, Plus, X, Edit2, Undo2, Zap, Bell, Heart, Share2, MessageSquare, Bookmark,
  Facebook, Instagram, Youtube, CheckSquare, Clock, Eye, Flame, Shuffle, Award, ChevronLeft, List, WifiOff,
  User as UserIcon
} from 'lucide-react';
import Navbar from './components/Navbar';
import SearchableCombobox from './components/SearchableCombobox';
import { Hub, Route, Destination, Attraction, Homestay, RouteSearchResult, TripLead, CarLead, Contribution, ImageItem, User, DEFAULT_HOMESTAY_IMAGE } from './types';
import { motion } from 'motion/react';
import { initialHubs, initialDestinations, initialAttractions, initialHomestays, initialRoutes } from './data/initialData';
import { onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, googleSignIn, logout, uploadImageToFirebase, db } from './utils/firebase';
import { compressAndConvertToWebP } from './utils/imageOptimizer';
import { hillyTripFetch } from './utils/apiInterceptor';
import PWAInstallPrompt from './components/PWAInstallPrompt';
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

// Lazily load complex/heavy components to dramatically reduce initial mobile JS payload sizes
const ImageGallerySystem = React.lazy(() => import('./components/ImageGallerySystem'));
const CommentsSection = React.lazy(() => import('./components/CommentsSection'));
const AdminNotificationsTab = React.lazy(() => import('./components/AdminNotificationsTab'));
const AiLocalAdvisor = React.lazy(() => import('./components/AiLocalAdvisor'));
const PartnerDashboard = React.lazy(() => import('./components/PartnerDashboard'));
const AdminPartnerManagementTab = React.lazy(() => import('./components/AdminPartnerManagementTab'));
const OfflineTravelHub = React.lazy(() => import('./components/OfflineTravelHub'));
const ReviewCenter = React.lazy(() => import('./components/ReviewCenter'));

const AdminCoverManagementTab = React.lazy(() => 
  import('./components/AdminCoverManagementTab').then(module => ({ default: module.AdminCoverManagementTab }))
);
const AdminLocationIntelligenceTab = React.lazy(() => 
  import('./components/AdminLocationIntelligenceTab').then(module => ({ default: module.AdminLocationIntelligenceTab }))
);

const fetch = hillyTripFetch;

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

const getStopCoords = (stopName: string) => {
  const norm = stopName.toLowerCase().trim();
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

export const AVAILABLE_THEMES = [
  { id: 'slate', name: 'Slate Dark (Default)', class: 'theme-slate-dark', color: '#020617', emoji: '🌑' },
  { id: 'mountain-blue', name: 'Mountain Blue', class: 'theme-mountain-blue', color: '#070f2b', emoji: '⛰️' },
  { id: 'forest-green', name: 'Forest Green', class: 'theme-forest-green', color: '#022c22', emoji: '🌲' },
  { id: 'himalayan-night', name: 'Himalayan Night', class: 'theme-himalayan-night', color: '#05021a', emoji: '🌌' },
  { id: 'sunrise-gold', name: 'Sunrise Gold', class: 'theme-sunrise-gold', color: '#1c0d02', emoji: '🌅' },
  { id: 'alpine-purple', name: 'Alpine Purple', class: 'theme-alpine-purple', color: '#090514', emoji: '🪻' },
  { id: 'mist-grey', name: 'Mist Grey', class: 'theme-mist-grey', color: '#121824', emoji: '🌫️' },
  { id: 'river-teal', name: 'River Teal', class: 'theme-river-teal', color: '#011e22', emoji: '🧼' },
  { id: 'autumn-trail', name: 'Autumn Trail', class: 'theme-autumn-trail', color: '#1c0802', emoji: '🍂' },
  { id: 'snow-peak', name: 'Snow Peak', class: 'theme-snow-peak', color: '#091424', emoji: '🏔️' },
];

interface ScrollAnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const ScrollAnimatedSection: React.FC<ScrollAnimatedSectionProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
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
      if (window.location.hash) {
        const raw = window.location.hash.substring(1);
        window.history.replaceState(null, '', raw);
        return raw;
      }
      return window.location.pathname || '/';
    }
    return '/';
  });
  const currentPath = currentHash.startsWith('#') ? currentHash.substring(1) : (currentHash || '/');
  const [footerModalType, setFooterModalType] = useState<string | null>(null);
  const registerActiveTab = currentPath === '/register/driver' ? 'driver' : 'homestay';
  
  // Theme management (Standard Basic Themes + Gesture Double-click Premium Palettes)
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hillytrip-theme');
      if (saved && AVAILABLE_THEMES.some(t => t.id === saved)) return saved;
    }
    return 'slate';
  });

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hillytrip-theme-mode');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark'; // Slate Dark (Default) is dark-first
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove all previous theme classes
    const oldClasses = [
      'dark', 'theme-light', 'theme-dark', 'theme-forest', 'theme-sunset', 'theme-purple', 'theme-ocean',
      ...AVAILABLE_THEMES.map(t => t.class)
    ];
    root.classList.remove(...oldClasses);
    
    // Find absolute theme config
    const activeConfig = AVAILABLE_THEMES.find(t => t.id === theme) || AVAILABLE_THEMES[0];
    root.classList.add(activeConfig.class);
    
    if (themeMode === 'dark') {
      root.classList.add('dark');
    }
    
    localStorage.setItem('hillytrip-theme', theme);
    localStorage.setItem('hillytrip-theme-mode', themeMode);
  }, [theme, themeMode]);

  const [hubs, setHubs] = useState<Hub[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_hubs');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [destinations, setDestinations] = useState<Destination[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_destinations');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [attractions, setAttractions] = useState<Attraction[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_attractions');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [attractionStats, setAttractionStats] = useState<Record<string, number>>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_attraction_stats');
      return c ? JSON.parse(c) : {};
    } catch {
      return {};
    }
  });
  const [homestays, setHomestays] = useState<Homestay[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_homestays');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [drivers, setDrivers] = useState<any[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_drivers');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [routes, setRoutes] = useState<Route[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_routes');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  
  // Loading & Global alerts
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Home search state
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  // Hidden Gems search & filter state
  const [gemSearch, setGemSearch] = useState('');
  const [gemFilterType, setGemFilterType] = useState<'all' | 'destination' | 'attraction'>('all');

  // User Registration / Login status
  const [user, setUser] = useState<User | null>(() => {
    try {
      const persistedUser = localStorage.getItem('hillytrip_user_session');
      return persistedUser ? JSON.parse(persistedUser) : null;
    } catch {
      return null;
    }
  });

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('hillytrip_user_session', JSON.stringify(u));
    } else {
      localStorage.removeItem('hillytrip_user_session');
    }
  };

  // Unified Profile state hooks
  const [travelerLeads, setTravelerLeads] = useState<{ trips: any[], cars: any[] } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileMobile, setEditProfileMobile] = useState('');
  const [editProfilePassword, setEditProfilePassword] = useState('');
  
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
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('hillytrip_admin_email'));
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('hillytrip_admin_email') || '');
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('hillytrip_admin_user') || 'null');
    } catch {
      return null;
    }
  });
  const [adminPermissions, setAdminPermissions] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('hillytrip_admin_permissions') || '[]');
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
  const [adminActiveTab, setAdminActiveTab] = useState<'stats' | 'leads' | 'car-leads' | 'contributions' | 'add-data' | 'bulk-import' | 'images' | 'analytics' | 'registrations' | 'admin_management' | 'audit_logs' | 'photo_approvals' | 'location-intelligence' | 'partner-management'>('stats');
  const [adminUserAnalytics, setAdminUserAnalytics] = useState<any>(null);
  const [adminUserAnalyticsLoading, setAdminUserAnalyticsLoading] = useState(false);

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
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
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
  const [mostSearchedToday, setMostSearchedToday] = useState<any[]>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_most_searched_today');
      return c ? JSON.parse(c) : [];
    } catch {
      return [];
    }
  });
  const [destinationStats, setDestinationStats] = useState<Record<string, number>>(() => {
    try {
      const c = localStorage.getItem('hillytrip_cached_destination_stats');
      return c ? JSON.parse(c) : {};
    } catch {
      return {};
    }
  });

  // Collapse and view-all toggles for Destination Detail layout
  const [destAttractionsExpanded, setDestAttractionsExpanded] = useState(false);
  const [destLodgingExpanded, setDestLodgingExpanded] = useState(false);
  const [destTransitExpanded, setDestTransitExpanded] = useState(false);
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
    }
    setCurrentHash(cleanPath);
  };

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
    if (!Array.isArray(arr)) return [];
    const seen = new Set<string>();
    return arr.filter(item => {
      if (!item || !item.id) return false;
      const key = String(item.id).toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Load baseline app data from API
  const fetchBaselineData = async () => {
    try {
      const safeFetchJson = async (url: string, fallback: any[]) => {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.warn(`[API Baseline] fetch failed for ${url} with status ${res.status}, using static fallback.`);
            return fallback;
          }
          const contentType = res.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            console.warn(`[API Baseline] non-json response for ${url}, using static fallback.`);
            return fallback;
          }
          const text = await res.text();
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            console.warn(`[API Baseline] HTML returned instead of JSON for ${url}, using static fallback.`);
            return fallback;
          }
          const data = JSON.parse(text);
          return Array.isArray(data) ? data : fallback;
        } catch (err) {
          console.warn(`[API Baseline] error fetching ${url}, using static fallback:`, err);
          return fallback;
        }
      };

      const [rHubs, rDests, rAtts, rHomes, rRoutes] = await Promise.all([
        safeFetchJson('/api/hubs', initialHubs),
        safeFetchJson('/api/destinations', initialDestinations),
        safeFetchJson('/api/attractions', initialAttractions),
        safeFetchJson('/api/homestays', initialHomestays),
        safeFetchJson('/api/routes', initialRoutes),
      ]);

      const cleanHubs = deduplicate(rHubs);
      const cleanDests = deduplicate(rDests);
      const cleanAtts = deduplicate(rAtts);
      const cleanHomes = deduplicate(rHomes);
      const cleanRoutes = deduplicate(rRoutes || []);

      setHubs(cleanHubs);
      setDestinations(cleanDests);
      setAttractions(cleanAtts);
      setHomestays(cleanHomes);
      setRoutes(cleanRoutes);

      // Save to cache
      try {
        localStorage.setItem('hillytrip_cached_hubs', JSON.stringify(cleanHubs));
        localStorage.setItem('hillytrip_cached_destinations', JSON.stringify(cleanDests));
        localStorage.setItem('hillytrip_cached_attractions', JSON.stringify(cleanAtts));
        localStorage.setItem('hillytrip_cached_homestays', JSON.stringify(cleanHomes));
        localStorage.setItem('hillytrip_cached_routes', JSON.stringify(cleanRoutes));
      } catch (err) {
        console.error('LocalStorage write failed:', err);
      }
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
      .then(res => res.json())
      .then(rDrivers => {
        const cleanDrivers = deduplicate(rDrivers || []);
        setDrivers(cleanDrivers);
        try {
          localStorage.setItem('hillytrip_cached_drivers', JSON.stringify(cleanDrivers));
        } catch {}
      })
      .catch(e => console.error('Error loading drivers deferred:', e));

    // 2. Fetch public search statistics
    fetch('/api/analytics/most-searched')
      .then(res => res.json())
      .then(rAnalytics => {
        setMostSearchedToday(rAnalytics || []);
        try {
          localStorage.setItem('hillytrip_cached_most_searched_today', JSON.stringify(rAnalytics || []));
        } catch {}
      })
      .catch(e => console.error('Error fetching analytics on boot deferred:', e));

    // 3. Fetch public destination analytics
    fetch('/api/analytics/destinations')
      .then(res => res.json())
      .then(rDestAnalytics => {
        const statsMap: Record<string, number> = {};
        if (rDestAnalytics && Array.isArray(rDestAnalytics.mostVisited)) {
          rDestAnalytics.mostVisited.forEach((item: any) => {
            if (item.slug) {
              statsMap[item.slug] = item.count || 0;
            }
          });
        }
        setDestinationStats(statsMap);
        try {
          localStorage.setItem('hillytrip_cached_destination_stats', JSON.stringify(statsMap));
        } catch {}
      })
      .catch(e => console.error('Error fetching destination analytics deferred:', e));

    // 4. Fetch public attraction analytics
    fetch('/api/analytics/attractions')
      .then(res => res.json())
      .then(rAttrAnalytics => {
        const statsMap: Record<string, number> = {};
        if (rAttrAnalytics && Array.isArray(rAttrAnalytics.mostVisited)) {
          rAttrAnalytics.mostVisited.forEach((item: any) => {
            if (item.slug) {
              statsMap[item.slug] = item.count || 0;
            }
          });
        }
        setAttractionStats(statsMap);
        try {
          localStorage.setItem('hillytrip_cached_attraction_stats', JSON.stringify(statsMap));
        } catch {}
      })
      .catch(e => console.error('Error fetching attraction analytics deferred:', e));
  };

  useEffect(() => {
    fetchBaselineData();
    // Defer non-critical load by 800ms to allow rendering critical components instantly
    const timer = setTimeout(() => {
      fetchDeferredData();
    }, 800);
    return () => clearTimeout(timer);
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
      console.error('[fetchUserPhotoData error]', e);
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
      } else if (activeRoleTab === 'admin' || activeRoleTab === 'super_admin') {
        fetchAdminPanelState();
      }
    }
  }, [user, activeRoleTab]);

  const handlePhotoContributionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'moderator' | null>(null);

  const checkAdminRights = async (email: string) => {
    if (!email) {
      setIsAdmin(false);
      setCurrentUserRole(null);
      return;
    }
    try {
      const response = await fetch(`/api/check-admin-role?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.isAdmin) {
        setIsAdmin(true);
        setCurrentUserRole(data.role);
      } else {
        setIsAdmin(false);
        setCurrentUserRole(null);
      }
    } catch (e) {
      console.error('Error checking admin status:', e);
      setIsAdmin(false);
      setCurrentUserRole(null);
    }
  };

  // Set up Firebase Authentication active state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) {
        checkAdminRights(firebaseUser.email);
      } else {
        setIsAdmin(false);
        setCurrentUserRole(null);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Subscriptions for likes and comments
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

    return () => {
      if (unsubscribeLikes) unsubscribeLikes();
      if (unsubscribeComments) unsubscribeComments();
    };
  }, []);

  // Social engagement action triggers
  const [savedPlaces, setSavedPlaces] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hillytrip_saved_places');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('hillytrip_saved_places', JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  const isItemSaved = (id: string) => {
    if (!id) return false;
    return savedPlaces.includes(id);
  };

  const handleToggleSave = async (id: string, type: 'destination' | 'attraction' | 'homestay') => {
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
        const d = destinations.find(x => x.id === id);
        if (d) trackSaveDestination(id, d.name, 'destination');
      } else if (type === 'attraction') {
        const a = attractions.find(x => x.id === id);
        if (a) trackSaveDestination(id, a.name, 'attraction');
      } else if (type === 'homestay') {
        const h = homestays.find(x => x.id === id);
        if (h) trackSaveDestination(id, h.name, 'homestay');
      }
    }

    setNotification({
      type: 'success',
      message: isSaved ? 'Removed from Saved Places!' : '🔖 Saved to your local collection!'
    });
  };

  const toggleLike = async (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => {
    if (!user) {
      setNotification({ type: 'error', message: '🔐 Please sign in with Google to like!' });
      return;
    }
    const likeId = `${user.uid}_${contentId}`;
    const docRef = doc(db, 'likes', likeId);
    const alreadyLiked = likes.some((l) => l.id === likeId);
    
    const previousLikes = [...likes];
    
    // Optimistic Update
    if (alreadyLiked) {
      setLikes(prev => prev.filter((l) => l.id !== likeId));
    } else {
      setLikes(prev => [...prev, {
        id: likeId,
        userId: user.uid,
        contentId,
        contentType,
        timestamp: new Date().toISOString()
      }]);
    }

    // Track GA4 like custom events
    if (contentType === 'destination') {
      const d = destinations.find(x => x.id === contentId);
      if (d) trackLikeDestination(contentId, d.name, !alreadyLiked, 'destination');
    } else if (contentType === 'attraction') {
      const a = attractions.find(x => x.id === contentId);
      if (a) trackLikeDestination(contentId, a.name, !alreadyLiked, 'attraction');
    }

    try {
      if (alreadyLiked) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          id: likeId,
          userId: user.uid,
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
  };

  const addCommentAction = async (contentId: string, contentType: 'destination' | 'attraction', text: string) => {
    if (!user) {
      setNotification({ type: 'error', message: '🔐 Please sign in to comment!' });
      return;
    }
    if (!text.trim()) return;
    
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newComment = {
      id: commentId,
      userId: user.uid,
      userName: user.displayName || user.email || 'Registered Traveler',
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
  };

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

  const handleProfileRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileEmail || !profilePassword || !profileName) {
      setNotification({ type: 'error', message: 'Please pack in all required (*) registration details!' });
      return;
    }
    if (profilePassword !== profileConfirmPassword) {
      setNotification({ type: 'error', message: 'Password confirmation mismatch!' });
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profileEmail,
          password: profilePassword,
          confirmPassword: profileConfirmPassword,
          name: profileName,
          mobile: profileMobile
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setNotification({ type: 'success', message: 'Success! Your account is registered. Log in to start your secure session.' });
        setIsSignUp(false);
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to complete registration.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Backoffice registry transport error.' });
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profileEmail,
          password: profilePassword
        })
      });
      const data = await res.json();
      if (data.success && data.user) {
        handleSetUser(data.user);
        // Synchronize active workspace
        const rolesList = data.user.roles || [data.user.role || 'traveler'];
        if (rolesList.includes('admin') || rolesList.includes('super_admin')) {
          setIsAdmin(true);
        }
        if (rolesList.includes(activeRoleTab)) {
          // keep tab
        } else {
          setActiveRoleTab(rolesList[0] as any);
        }
        setNotification({ type: 'success', message: `Successfully authorized. Welcome back, ${data.user.name}!` });
      } else {
        setNotification({ type: 'error', message: data.error || 'Could not verify user email / password match.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Authentication server offline.' });
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

  const handleUserLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        if (res.user.email) {
          await checkAdminRights(res.user.email);
        }
        setNotification({
          type: 'success',
          message: `Logged in safely: ${res.user.displayName || res.user.email} (synced successfully)`
        });
      }
    } catch (error: any) {
      console.error('Google authorization flow failure:', error);
      setNotification({
        type: 'error',
        message: error?.message || 'Login cancelled or Google Auth failed.'
      });
    }
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

  // Listen for router history and parameter updates
  useEffect(() => {
    // Globally load GA4 on startup
    initGA();

    const handlePopState = () => {
      setCurrentHash(window.location.pathname || '/');
      window.scrollTo(0, 0);
    };
    const handleHashChange = () => {
      if (window.location.hash) {
        const raw = window.location.hash.substring(1);
        window.history.replaceState(null, '', raw);
        setCurrentHash(raw);
      } else {
        setCurrentHash(window.location.pathname || '/');
      }
      window.scrollTo(0, 0);
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
      setLoading(true);
      
      const localSearchRoutes = (fromHubId: string, toHubId: string): RouteSearchResult[] => {
        const hubsMap = new Map<string, Hub>();
        hubs.forEach(h => hubsMap.set(h.id.toLowerCase().trim(), h));

        const adj = new Map<string, Route[]>();
        routes.forEach(r => {
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
            path: [...r.path].reverse()
          };
          adj.get(rt)!.push(revRoute);
        });

        const results: RouteSearchResult[] = [];

        const fromHub = hubsMap.get(fromHubId.toLowerCase().trim());
        const toHub = hubsMap.get(toHubId.toLowerCase().trim());

        if (!fromHub || !toHub) return [];

        const fIdNormalized = fromHub.id.toLowerCase().trim();
        const tIdNormalized = toHub.id.toLowerCase().trim();

        // Find direct routes
        const directRoutes = routes.filter(r => {
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
                path: [...r.path].reverse()
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
            const nextHub = r.toHubId.toLowerCase().trim();
            const visitedInCurrentPath = pathRoutes.some(pr => pr.fromHubId.toLowerCase().trim() === nextHub) || (curr === nextHub);
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
            const fh = hubsMap.get(route.fromHubId.toLowerCase().trim())!;
            const th = hubsMap.get(route.toHubId.toLowerCase().trim())!;
            totalFareMin += route.fareMin;
            totalFareMax += route.fareMax;
            totalTimeMin += route.timeMin;
            totalTimeMax += route.timeMax;
            if (!route.verified) allVerified = false;

            const cleanStopsInRoute = route.path.slice(1);
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

        return results;
      };

      try {
        if (currentPath === '' || currentPath === '/' || currentPath === '#/') {
          // Home
        } else if (currentPath.startsWith('/route/')) {
          // 7. Diagnostic logging: received slug
          console.log('[Route Diagnostic] received slug:', currentPath);
          const rawRouteSlug = currentPath.replace('/route/', '').replace('#/route/', '');
          const decodedRouteSlug = decodeURIComponent(rawRouteSlug);

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

            // Fetch latest hubs to ensure up-to-date mapping, fallback to initialHubs
            let allHubsList: Hub[] = [];
            try {
              const hubsRes = await fetch('/api/hubs');
              if (hubsRes.ok) {
                allHubsList = await hubsRes.json();
              }
            } catch (err) {
              console.error('[Route Parser] Error loading hubs:', err);
            }
            if (!Array.isArray(allHubsList) || allHubsList.length === 0) {
              allHubsList = initialHubs;
            }

            // Slug-to-Hub ID Resolution function
            const resolveSlugToHubId = (slugName: string): string => {
              const clean = slugName.trim().toLowerCase();
              if (!clean) return '';

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
              const byId = allHubsList.find(h => h.id.toLowerCase() === clean || getSlug(h.id) === cleanSlug);
              if (byId) return byId.id;

              // 6. If a slug matches a hub name, automatically resolve it
              const byName = allHubsList.find(h => h.name.toLowerCase() === clean || getSlug(h.name) === cleanSlug);
              if (byName) return byName.id;

              // Check if matches a destination's name, ID or slug, and resolve to nearestHubId
              const byDest = destinations.find(d => 
                d.id.toLowerCase() === clean || 
                getSlug(d.id) === cleanSlug || 
                d.name.toLowerCase() === clean || 
                getSlug(d.name) === cleanSlug
              );
              if (byDest && byDest.nearestHubId) {
                const nearHub = allHubsList.find(h => h.id.toLowerCase() === byDest.nearestHubId.toLowerCase().trim());
                if (nearHub) return nearHub.id;
              }

              // Check if matches an attraction's name, ID or slug
              const byAttr = attractions.find(a => 
                a.id.toLowerCase() === clean || 
                getSlug(a.id) === cleanSlug || 
                a.name.toLowerCase() === clean || 
                getSlug(a.name) === cleanSlug
              );
              if (byAttr) {
                if (byAttr.nearestHubId) {
                  const nearHub = allHubsList.find(h => h.id.toLowerCase() === byAttr.nearestHubId.toLowerCase().trim());
                  if (nearHub) return nearHub.id;
                }
                // Fallback to parent destination's nearestHubId
                if (byAttr.destinationId) {
                  const parentDest = destinations.find(d => d.id === byAttr.destinationId);
                  if (parentDest && parentDest.nearestHubId) {
                    const nearHub = allHubsList.find(h => h.id.toLowerCase() === parentDest.nearestHubId.toLowerCase().trim());
                    if (nearHub) return nearHub.id;
                  }
                }
              }

              // Check substring fuzzy matching on hubs as last resort
              const fuzzyHub = allHubsList.find(h => 
                h.name.toLowerCase().includes(clean) || 
                clean.includes(h.name.toLowerCase()) ||
                getSlug(h.name).includes(cleanSlug) ||
                cleanSlug.includes(getSlug(h.name))
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

            // 5. Ensure shortcut routes use the same route search logic as manual selection
            setSearchFrom(resolvedFromId);
            setSearchTo(resolvedToId);

            // Try to load cached route search results immediately
            const cacheKey = `hillytrip_cache_route_search_${resolvedFromId}_to_${resolvedToId}`;
            const cached = localStorage.getItem(cacheKey);
            let loadedFromCache = false;
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                setActiveRouteResults(parsed.data);
                setSelectedRouteIdx(parsed.shortestIdx);
                setShowAllRoutes(false);
                setLoading(false);
                loadedFromCache = true;
              } catch (e) {
                console.error(e);
              }
            }

            if (!loadedFromCache) {
              setLoading(true);
            }

            let data: any = null;
            try {
              const res = await fetch(`/api/search?fromHubId=${resolvedFromId}&toHubId=${resolvedToId}`);
              if (res.ok) {
                const contentType = res.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                  const text = await res.text();
                  if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                    data = JSON.parse(text);
                  }
                }
              }
            } catch (err) {
              console.error('[Route Parser] Failed to fetch /api/search, falling back locally:', err);
            }

            if (!Array.isArray(data)) {
              console.log('[Route Parser] Calculating route search results locally using client-side graph algorithm.');
              data = localSearchRoutes(resolvedFromId, resolvedToId);
            }

            if (Array.isArray(data)) {
              let shortestIdx = 0;
              let minTime = Infinity;
              data.forEach((r: any, idx: number) => {
                const tMin = (r.route && r.route.timeMin !== undefined) ? r.route.timeMin : Infinity;
                if (tMin < minTime) {
                  minTime = tMin;
                  shortestIdx = idx;
                }
              });
              setActiveRouteResults(data);
              setSelectedRouteIdx(shortestIdx);
              setShowAllRoutes(false);

              // Track GA4 Route Result View
              trackRouteResultView(resolvedFromId, resolvedToId, data.length);

              try {
                localStorage.setItem(cacheKey, JSON.stringify({ data, shortestIdx }));
              } catch (e) {
                console.error(e);
              }

              // Re-fetch search statistics so homepage stats stay updated
              fetch('/api/analytics/most-searched')
                .then(r => r.ok ? r.json() : null)
                .then(analData => {
                  if (Array.isArray(analData)) {
                    setMostSearchedToday(analData);
                  }
                })
                .catch(err => console.error('Error auto-updating search analytics:', err));
            } else {
              if (!loadedFromCache) {
                setActiveRouteResults([]);
                setNotification({
                  type: 'error',
                  message: `🏔️ Offline Route: Route between ${resolvedFromId.toUpperCase()} and ${resolvedToId.toUpperCase()} has not been cached yet. Try searching dynamic pathways while connected to save them.`
                });
              }
            }
          }
        } else if (currentPath.startsWith('/destination/')) {
          const rawDestId = currentPath.replace('/destination/', '').replace('#/destination/', '');
          const decodedDestId = decodeURIComponent(rawDestId);

          // Reset expanded toggles for clean page load
          setDestAttractionsExpanded(false);
          setDestLodgingExpanded(false);
          setDestTransitExpanded(false);
          setDestCommentsExpanded(false);

          // 5. Log required diagnostics
          console.log('[Destination Detail Diagnostic] raw URL parameter:', rawDestId);
          console.log('[Destination Detail Diagnostic] decoded parameter:', decodedDestId);
          console.log('[Destination Detail Diagnostic] database lookup key:', decodedDestId);

          // Try to load cached destination details immediately
          const cacheKey = `hillytrip_cache_dest_${decodedDestId}`;
          const cached = localStorage.getItem(cacheKey);
          let loadedFromCache = false;
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setActiveDestDetail(parsed);
              setLoading(false);
              loadedFromCache = true;
            } catch (e) {
              console.error(e);
            }
          }

          if (!loadedFromCache) {
            setLoading(true);
          }

          let fetchedDetail = null;
          try {
            const [destRes, photosRes] = await Promise.all([
              fetch(`/api/destinations/${encodeURIComponent(decodedDestId)}`),
              fetch(`/api/images?status=Approved&destinationId=${encodeURIComponent(decodedDestId)}`)
            ]);
            if (destRes.ok) {
              const contentType = destRes.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const text = await destRes.text();
                if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                  const data = JSON.parse(text);
                  if (data && !data.offline) {
                    fetchedDetail = data;
                    setActiveDestDetail(data);
                    try {
                      localStorage.setItem(cacheKey, JSON.stringify(data));
                    } catch (e) {
                      console.error(e);
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
          } catch (err) {
            console.error('[Route Parser] Failed to fetch destination details API, falling back locally:', err);
          }

          if (!fetchedDetail) {
            console.log('[Route Parser] Constructing destination details from local database lists.');
            const localDest = destinations.find(d => 
              d.id.toLowerCase() === decodedDestId.toLowerCase() || 
              d.name.toLowerCase() === decodedDestId.toLowerCase()
            );
            if (localDest) {
              const localAttractions = attractions.filter(a => a.destinationId === localDest.id);
              const localHomestays = homestays.filter(h => h.destinationId === localDest.id && h.status !== 'Pending' && h.status !== 'Rejected');
              const matchingHubs = hubs.filter(h => 
                h.name.toLowerCase().includes(localDest.name.toLowerCase()) || 
                localDest.name.toLowerCase().includes(h.name.toLowerCase())
              );
              const hubIds = matchingHubs.map(h => h.id);
              const localRoutes = routes.filter(r => 
                hubIds.includes(r.fromHubId) || hubIds.includes(r.toHubId)
              );

              const localData = {
                destination: localDest,
                attractions: localAttractions,
                homestays: localHomestays,
                routes: localRoutes
              };
              setActiveDestDetail(localData);
              setLoading(false);
            }
          }
        } else if (currentPath.startsWith('/attraction/')) {
          const rawAttrId = currentPath.replace('/attraction/', '').replace('#/attraction/', '');
          const decodedAttrId = decodeURIComponent(rawAttrId);

          // Reset attraction details interactive states
          setAttrCommentsExpanded(false);
          setAttrLeadSuccess(false);

          // 5. Log required diagnostics
          console.log('[Attraction Detail Diagnostic] attraction URL parameter:', rawAttrId);
          console.log('[Attraction Detail Diagnostic] attraction lookup field:', decodedAttrId);

          // Try to load cached attraction details immediately
          const cacheKey = `hillytrip_cache_attr_${decodedAttrId}`;
          const cached = localStorage.getItem(cacheKey);
          let loadedFromCache = false;
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setActiveAttrDetail(parsed);
              setLoading(false);
              loadedFromCache = true;
            } catch (e) {
              console.error(e);
            }
          }

          if (!loadedFromCache) {
            setLoading(true);
          }

          let fetchedAttr = null;
          try {
            const [attrRes, photosRes] = await Promise.all([
              fetch(`/api/attractions/${encodeURIComponent(decodedAttrId)}`),
              fetch(`/api/images?status=Approved&attractionId=${encodeURIComponent(decodedAttrId)}`)
            ]);
            if (attrRes.ok) {
              const contentType = attrRes.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const text = await attrRes.text();
                if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                  const data = JSON.parse(text);
                  if (data && !data.offline) {
                    fetchedAttr = data;
                    setActiveAttrDetail(data);
                    try {
                      localStorage.setItem(cacheKey, JSON.stringify(data));
                    } catch (e) {
                      console.error(e);
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
          } catch (err) {
            console.error('[Route Parser] Failed to fetch attraction API, falling back locally:', err);
          }

          if (!fetchedAttr) {
            console.log('[Route Parser] Constructing attraction details from local database lists.');
            const localAttr = attractions.find(a => 
              a.id.toLowerCase() === decodedAttrId.toLowerCase() || 
              a.name.toLowerCase() === decodedAttrId.toLowerCase()
            );
            if (localAttr) {
              const destination = destinations.find(d => d.id === localAttr.destinationId);
              const hIds = [];
              if (localAttr.nearestHubId) hIds.push(localAttr.nearestHubId);
              if (destination && destination.nearestHubId) hIds.push(destination.nearestHubId);
              const localRoutes = routes.filter(r => hIds.includes(r.fromHubId) || hIds.includes(r.toHubId));

              const localData = {
                attraction: localAttr,
                destination: destination || null,
                routes: localRoutes
              };
              setActiveAttrDetail(localData);
              setLoading(false);
            }
          }
        } else if (currentPath.startsWith('/homestay/')) {
          const rawHomeId = currentPath.replace('/homestay/', '').replace('#/homestay/', '');
          const decodedHomeId = decodeURIComponent(rawHomeId);

          // 5. Log required diagnostics
          console.log('[Homestay Detail Diagnostic] raw URL parameter:', rawHomeId);
          console.log('[Homestay Detail Diagnostic] decoded parameter:', decodedHomeId);
          console.log('[Homestay Detail Diagnostic] database lookup key:', decodedHomeId);

          // Try to load cached homestay details immediately
          const cacheKey = `hillytrip_cache_homestay_${decodedHomeId}`;
          const cached = localStorage.getItem(cacheKey);
          let loadedFromCache = false;
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              setActiveHomeDetail(parsed);
              setLoading(false);
              loadedFromCache = true;
            } catch (e) {
              console.error(e);
            }
          }

          if (!loadedFromCache) {
            setLoading(true);
          }

          let fetchedHome = null;
          try {
            const res = await fetch(`/api/homestays/${encodeURIComponent(decodedHomeId)}`);
            if (res.ok) {
              const contentType = res.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const text = await res.text();
                if (!text.trim().startsWith('<!') && !text.trim().startsWith('<html')) {
                  const data = JSON.parse(text);
                  if (data && !data.offline) {
                    fetchedHome = data;
                    setActiveHomeDetail(data);
                    try {
                      localStorage.setItem(cacheKey, JSON.stringify(data));
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error('[Route Parser] Failed to fetch homestay API, falling back locally:', err);
          }

          if (!fetchedHome) {
            console.log('[Route Parser] Constructing homestay details from local database lists.');
            const localHome = homestays.find(h => 
              h.id.toLowerCase() === decodedHomeId.toLowerCase() || 
              h.name.toLowerCase() === decodedHomeId.toLowerCase()
            );
            if (localHome) {
              const destination = destinations.find(d => d.id === localHome.destinationId);
              const localData = {
                homestay: localHome,
                destination: destination || null,
                comments: []
              };
              setActiveHomeDetail(localData);
              setLoading(false);
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

    loadRouteData();
  }, [currentPath, isAdmin]);

  // Client-Side SEO Management hook
  useEffect(() => {
    const toSlug = (text: string): string => {
      if (!text) return '';
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_'-]/g, '')
        .trim()
        .replace(/[\s_']+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    let title = "HillyTrip - India's Intelligent Mountain Travel Network";
    let desc = "India's Intelligent Mountain Travel Network - Your comprehensive travel intelligence platform for Himalayan routes, attractions, and eco-homestays.";
    let imageUrl = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop";
    let schemaObj: any = null;

    if (currentPath.startsWith('/destination/')) {
      const p = currentPath.replace('/destination/', '').replace('#/destination/', '');
      const d = destinations.find(x => x.id === p || toSlug(x.id) === toSlug(p) || toSlug(x.name) === toSlug(p));
      if (d) {
        title = `${d.name} - Travel Guide | HilliTrip`;
        desc = `${d.name} Travel Guide: Explore this pristine ${d.tourismType || 'village'} in ${d.district || ''}, ${d.state || ''}. Best season to visit is ${d.bestSeason || 'any season'}. ${d.description || ''}`.substring(0, 155);
        imageUrl = d.image || imageUrl;

        // Structured data Place Schema
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "Place",
          "name": d.name,
          "description": d.description,
          "image": d.image,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": d.district || '',
            "addressRegion": d.state || '',
            "addressCountry": "India"
          }
        };
      }
    } else if (currentPath.startsWith('/attraction/')) {
      const p = currentPath.replace('/attraction/', '').replace('#/attraction/', '');
      const a = attractions.find(x => x.id === p || toSlug(x.id) === toSlug(p) || toSlug(x.name) === toSlug(p));
      if (a) {
        title = `${a.name} - Travel Guide | HilliTrip`;
        desc = `Discover ${a.name}, a cozy ${a.category || 'Sightseeing Spot'} attraction in ${a.district || ''}, ${a.state || ''}. Key highlights: ${a.description || ''}`.substring(0, 155);
        imageUrl = a.image || imageUrl;

        // Structured TouristAttraction Schema
        schemaObj = {
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          "name": a.name,
          "description": a.description,
          "image": a.image,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": a.district || '',
            "addressRegion": a.state || '',
            "addressCountry": "India"
          }
        };
      }
    } else if (currentPath.startsWith('/homestay/')) {
      const p = currentPath.replace('/homestay/', '').replace('#/homestay/', '');
      const h = homestays.find(x => x.id === p || toSlug(x.id) === toSlug(p) || toSlug(x.name) === toSlug(p));
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
      title = "Himalayan Route Planner & Map Intelligence - Plan My Trip | HilliTrip";
      desc = "Plan your high-altitude routes with hilly intelligence coordinates, travel vectors, shareable route lines, and certified expert driver details.";
    } else if (currentPath === '/book-car') {
      title = "Expert Mountain Car Hire & Driver Escorts | HilliTrip";
      desc = "Secure reliable mountains car hires and certified expert local drivers. Highly trained pilots for navigating steep gradients, snow, and rain safely.";
    } else if (currentPath === '/contribute') {
      title = "Help Document Himalayan Eco-Villages - Contribute Photos | HilliTrip";
      desc = "Add pristine photos, unexplored scenic base coordinates, travel guides, and mountain lodge locations to help sustainable travel communities.";
    } else if (currentPath === '/destinations') {
      title = "Himalayan Base Villages & Tea Garden Hubs | HilliTrip";
      desc = "Explore HillyTrip's directory of beautiful off-the-grid base villages, offbeat locations, secret hill sanctuaries, and eco-retreat hubs.";
    } else if (currentPath === '/attractions') {
      title = "Scenic Sightseeing Views, Treks & High-Altitude Passes | HilliTrip";
      desc = "Discover pristine waterfalls, monasteries, sunrise viewpoints, forests, rhododendron nature parks, and hidden trekking routes in the Himalayas.";
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
  }, [currentPath, destinations, attractions, homestays]);

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
    if (email === 'mavanish24@gmail.com') return true;
    if (adminUser?.role === 'super_admin') return true;
    return adminPermissions.includes(permissionId);
  };

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminLoginPassword) {
      setNotification({ type: 'error', message: 'Email and password are required.' });
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
      const [rStats, rTrips, rCars, rConts, rImgs, rDrivers, rHomestays, rPhotoConts] = await Promise.all([
        fetch('/api/admin/stats', { headers }).then(res => res.json()),
        fetch('/api/admin/leads/trip', { headers }).then(res => res.json()),
        fetch('/api/admin/leads/car', { headers }).then(res => res.json()),
        fetch('/api/admin/contributions', { headers }).then(res => res.json()),
        fetch('/api/admin/images', { headers }).then(res => res.json()),
        fetch('/api/admin/drivers', { headers }).then(res => res.json()),
        fetch('/api/admin/data/homestays', { headers }).then(res => res.json()),
        fetch('/api/admin/photo-contributions', { headers }).then(res => res.json()).catch(() => [])
      ]);
      setAdminStats(rStats);
      setAdminTripLeads(rTrips);
      setAdminCarLeads(rCars);
      setAdminContributions(rConts);
      setAdminImages(rImgs);
      setAdminDrivers(rDrivers || []);
      setAdminHomestays(rHomestays || []);
      setAdminPhotoConts(rPhotoConts || []);
      
      // Auto-fetch management panel data if user is authorized
      if (hasClientPermission('manage_users') || hasClientPermission('view_analytics')) {
        loadAdminManagementData();
      }
    } catch (e) {
      console.error('Unauthorized or corrupt backoffice session.', e);
    }
  };

  const loadAdminManagementData = async () => {
    try {
      setAdminManagementLoading(true);
      const headers = getAdminHeaders();
      const [rUsers, rRoles, rPerms, rLogs] = await Promise.all([
        fetch('/api/admin/users', { headers }).then(res => res.json()),
        fetch('/api/admin/roles', { headers }).then(res => res.json()),
        fetch('/api/admin/permissions', { headers }).then(res => res.json()),
        fetch('/api/admin/audit-logs', { headers }).then(res => res.json())
      ]);
      if (Array.isArray(rUsers)) setAllAdminUsers(rUsers);
      if (Array.isArray(rRoles)) setAllRoles(rRoles);
      if (Array.isArray(rPerms)) setAllPermissions(rPerms);
      if (Array.isArray(rLogs)) setAllAuditLogs(rLogs);
    } catch (e) {
      console.error('Error loading admin management data:', e);
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
      images: formData.get('images') ? formData.get('images') : undefined
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
        amenities: (data.get('amenities') as string)?.split(',').map(s => s.trim()),
        image: contribUploadedUrl || data.get('image'),
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
                src={contribUploadedUrl} 
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

            {/* Manual URL input fallback option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-205" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-50 px-2 text-slate-400 font-bold uppercase text-[9px] tracking-wider">Or paste direct photo URL</span>
              </div>
            </div>

            <input 
              key={`url-contrib-${inputName}`}
              name={inputName}
              type="url" 
              placeholder="https://images.unsplash.com/photo-..." 
              className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 font-mono"
            />
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
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
          gallery: [],
          isHiddenGem: false,
          isFeaturedThisWeek: false,
          isPopularDestination: false
        };
      case 'attractions':
        return {
          id: "tiger-hill",
          name: "Tiger Hill Sunrise",
          category: "Viewpoint",
          destinationId: "darjeeling",
          description: "World famous vantage point for viewing Mt Kanchenjunga.",
          image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
          gallery: [],
          isHiddenGem: false,
          isFeaturedThisWeek: false,
          isFeaturedAttraction: false
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
          url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
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
    // Prevent more than 4 items from being marked as Featured This Week at the same time
    if ((dbEditorCollection === 'destinations' || dbEditorCollection === 'attractions') && field === 'isFeaturedThisWeek' && val === true) {
      let count = 0;
      if (dbEditorCollection === 'destinations') {
        count += attractions.filter(a => a.isFeaturedThisWeek).length;
      } else if (dbEditorCollection === 'attractions') {
        count += destinations.filter(d => d.isFeaturedThisWeek).length;
      }
      spreadsheetRows.forEach(row => {
        if (row.id !== rowId && row.isFeaturedThisWeek) {
          count++;
        }
      });

      if (count >= 4) {
        setNotification({
          type: 'error',
          message: 'Warning: A maximum of 4 items across Destinations and Attractions can be marked "Featured This Week" at any one time.'
        });
        return; // Reject the state update
      }
    }

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

    const cleanPayload: any = {};
    expectedKeys.forEach(k => {
      if (row[k] !== undefined) {
        cleanPayload[k] = row[k];
      } else {
        cleanPayload[k] = template[k];
      }
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
      cleanPayload.verified = !!cleanPayload.verified;
    }
    if (collection === 'destinations') {
      if (typeof cleanPayload.gallery === 'string') {
        cleanPayload.gallery = cleanPayload.gallery.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      cleanPayload.isHiddenGem = !!cleanPayload.isHiddenGem;
      cleanPayload.isFeaturedThisWeek = !!cleanPayload.isFeaturedThisWeek;
      cleanPayload.isPopularDestination = !!cleanPayload.isPopularDestination;
    }
    if (collection === 'attractions') {
      if (typeof cleanPayload.gallery === 'string') {
        cleanPayload.gallery = cleanPayload.gallery.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      cleanPayload.isHiddenGem = !!cleanPayload.isHiddenGem;
      cleanPayload.isFeaturedThisWeek = !!cleanPayload.isFeaturedThisWeek;
      cleanPayload.isFeaturedAttraction = !!cleanPayload.isFeaturedAttraction;
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
    return cleanPayload;
  };

  const handleSaveSpreadsheetRow = async (rowId: string) => {
    const row = spreadsheetRows.find(r => r.id === rowId);
    if (!row) return;

    if (!row.id || typeof row.id !== 'string' || row.id.startsWith('temp_') || row.id.trim() === '') {
      setNotification({
        type: 'error',
        message: 'Please double-click and set a unique string ID instead of a temp indicator.'
      });
      return;
    }

    setLoading(true);
    try {
      const cleanPayload = formatSpreadsheetRecord(row, dbEditorCollection);

      // Validation limit check for 4 items Featured This Week across both destinations and attractions
      if ((dbEditorCollection === 'destinations' || dbEditorCollection === 'attractions') && cleanPayload.isFeaturedThisWeek) {
        let count = 0;
        if (dbEditorCollection === 'destinations') {
          count += attractions.filter(a => a.isFeaturedThisWeek).length;
        } else {
          count += destinations.filter(d => d.isFeaturedThisWeek).length;
        }
        
        // Count active items in the SAME collection, excluding this specific ID
        const currentList = dbEditorCollection === 'destinations' ? destinations : attractions;
        count += currentList.filter(item => item.id !== cleanPayload.id && item.isFeaturedThisWeek).length;

        if (count >= 4) {
          setNotification({
            type: 'error',
            message: 'Cannot save: A maximum of 4 items across Destinations and Attractions can be marked "Featured This Week" at the same time.'
          });
          setLoading(false);
          return;
        }
      }

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

    const hasInvalidId = dirtyRows.some(row => !row.id || typeof row.id !== 'string' || row.id.startsWith('temp_') || row.id.trim() === '');
    if (hasInvalidId) {
      setNotification({
        type: 'error',
        message: 'Please assign a unique string ID instead of a temp indicator before saving.'
      });
      return;
    }

    setLoading(true);
    try {
      const formattedRecords = dirtyRows.map(row => formatSpreadsheetRecord(row, dbEditorCollection));

      // Validation limit check for 4 items Featured This Week across both destinations and attractions during bulk save
      if (dbEditorCollection === 'destinations' || dbEditorCollection === 'attractions') {
        let count = 0;
        if (dbEditorCollection === 'destinations') {
          count += attractions.filter(a => a.isFeaturedThisWeek).length;
        } else {
          count += destinations.filter(d => d.isFeaturedThisWeek).length;
        }

        const updatedIds = new Set(formattedRecords.map(r => r.id));
        const currentList = dbEditorCollection === 'destinations' ? destinations : attractions;
        currentList.forEach(item => {
          if (!updatedIds.has(item.id) && item.isFeaturedThisWeek) {
            count++;
          }
        });

        formattedRecords.forEach(r => {
          if (r.isFeaturedThisWeek) {
            count++;
          }
        });

        if (count > 4) {
          setNotification({
            type: 'error',
            message: 'Cannot save bulk: This would result in more than 4 items being marked "Featured This Week" at the same time.'
          });
          setLoading(false);
          return;
        }
      }

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

  // Dynamic Destination Discovery States
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [surpriseDest, setSurpriseDest] = useState<any | null>(null);
  const [destBrowsePage, setDestBrowsePage] = useState(1);
  const [destBrowseSort, setDestBrowseSort] = useState<'name' | 'newest' | 'views' | 'trending'>('name');
  const [destTypeFilter, setDestTypeFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (destinations.length > 0 && !surpriseDest) {
      const randomIndex = Math.floor(Math.random() * destinations.length);
      setSurpriseDest(destinations[randomIndex]);
    }
  }, [destinations, surpriseDest]);

  // Dynamic Attraction Discovery States
  const [attractionSearchQuery, setAttractionSearchQuery] = useState('');
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
    navigate(`#/route/${searchFrom}-to-${searchTo}`);
  };

  const clickQuickSearchRoute = (fromId: string, toId: string) => {
    setSearchFrom(fromId);
    setSearchTo(toId);
    navigate(`#/route/${fromId}-to-${toId}`);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      themeMode === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-800'
    }`} id="hillytrip-root">
      {/* Dynamic Toast Alerts */}
      {notification && (
        <div 
          id="global-toast-notification"
          className={`fixed top-24 right-4 z-[9999] flex items-center gap-3 p-4 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] border-2 backdrop-blur-md animate-bounce ${
            notification.type === 'success' 
              ? 'bg-emerald-50/95 border-emerald-400 text-emerald-900' 
              : 'bg-rose-50/95 border-rose-400 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* PWA Install Prompt Banner overlay */}
      <PWAInstallPrompt themeMode={themeMode} />

      {/* Main Premium Navbar */}
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
      />

      {/* Primary View Router Grid */}
      <main className="flex-grow">
        <React.Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 p-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-[10px] text-slate-400 font-extrabold font-mono tracking-widest uppercase animate-pulse">Loading View...</p>
          </div>
        }>
        
        {/* ========================================================
            1. HOME VIEW
            ======================================================== */}
        {(currentPath === '' || currentPath === '/') && (
          <div id="home-view" className="animate-fade-in">
            {/* Redesigned Mobile-First Hero Section */}
            {(() => {
              const getMostSearchedWithFallbacks = () => {
                const realRoutes = (mostSearchedToday || [])
                  .filter(r => r.source && r.destination && r.source !== r.destination)
                  .map(r => ({
                    fromId: r.source,
                    toId: r.destination,
                    fromName: hubs.find(h => h.id === r.source)?.name || r.source.toUpperCase(),
                    toName: hubs.find(h => h.id === r.destination)?.name || r.destination.toUpperCase(),
                    count: r.count
                  }));

                if (realRoutes.length >= 3) {
                  return realRoutes.slice(0, 3);
                }

                const fallbacks = [
                  { fromId: "bagdogra", toId: "darjeeling", fromName: "Bagdogra", toName: "Darjeeling" },
                  { fromId: "njp", toId: "kalimpong", fromName: "NJP", toName: "Kalimpong" },
                  { fromId: "njp", toId: "lava", fromName: "NJP", toName: "Lava" }
                ];

                const merged = [...realRoutes];
                fallbacks.forEach(fb => {
                  if (merged.length < 3 && !merged.some(m => m.fromId === fb.fromId && m.toId === fb.toId)) {
                    merged.push({
                      fromId: fb.fromId,
                      toId: fb.toId,
                      fromName: fb.fromName,
                      toName: fb.toName,
                      count: 0
                    });
                  }
                });

                return merged.slice(0, 3);
              };

              const displayedMostSearched = getMostSearchedWithFallbacks();

              return (
                <div className="relative overflow-hidden bg-slate-950 py-10 px-4 md:py-16 md:px-12 text-center text-white border-b border-slate-100/10 shadow-[0_20px_50px_rgba(8,112,184,0.05)]">
                  <div className="absolute inset-0 z-0">
                    <img 
                      src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop" 
                      alt="Indian Mountain Hills Background" 
                      className="w-full h-full object-cover opacity-20 object-center scale-102 filter blur-3xs transition-transform duration-1000 saturate-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/80 to-slate-950" />
                  </div>
                  
                  <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                    {/* Offline companion fast drawer indicator */}
                    {isOffline && (
                      <div className="mb-5 bg-amber-500/10 border border-amber-500/25 md:border-amber-500/15 text-amber-300 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-center gap-3.5 w-full justify-between backdrop-blur-md select-none animate-bounce">
                        <span className="flex items-center gap-2.5 text-left">
                          <WifiOff className="w-5 h-5 shrink-0 text-amber-400 animate-pulse" />
                          <span className="font-bold leading-normal font-mono">
                            Himalayan Signal Suspended. Tap to load 100% Offline Route Maps, Survival Checklists & SOS Tools.
                          </span>
                        </span>
                        <button 
                          onClick={() => navigate('#/offline-center')}
                          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black px-4.5 py-1.5 rounded-lg text-[10px] uppercase shrink-0 transition"
                        >
                          Launch Hub
                        </button>
                      </div>
                    )}

                    {/* 1. Top Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider bg-sky-500/10 text-sky-400 border border-sky-400/20 mb-4 uppercase animate-pulse select-none">
                      🏔 India's Smartest Mountain Pathfinding
                    </span>
                    
                    {/* 2. Brand Name */}
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-2" id="home-title">
                      Hilly<span className="bg-gradient-to-r from-sky-400 via-sky-350 to-teal-400 bg-clip-text text-transparent">Trip</span>
                    </h1>
                    
                    {/* 3. Tagline */}
                    <p className="text-slate-300 font-medium text-sm md:text-base mb-6 tracking-wide drop-shadow-xs font-sans">
                      Your Guide to India's Mountain Destinations
                    </p>

                    {/* 4. Route Search */}
                    <form 
                      id="route-search-form" 
                      onSubmit={handleRouteSearchSubmit}
                      className="w-full bg-white dark:bg-slate-900 p-3.5 rounded-2xl md:rounded-full shadow-2xl border border-slate-100 dark:border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-3.5 items-center text-slate-800 dark:text-slate-100 transition-all duration-300 mb-6"
                    >
                      <div className="flex flex-col text-left px-2">
                        <SearchableCombobox
                          id="search-from-select"
                          required
                          value={searchFrom}
                          onChange={setSearchFrom}
                          options={hubs}
                          placeholder="FROM Destination..."
                          label="FROM Destination"
                        />
                      </div>

                      <div className="flex flex-col text-left px-2">
                        <SearchableCombobox
                          id="search-to-select"
                          required
                          value={searchTo}
                          onChange={setSearchTo}
                          options={hubs}
                          placeholder="TO Destination..."
                          label="TO Destination"
                        />
                      </div>

                      <div className="px-2 w-full">
                        <button 
                          id="find-route-btn"
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-extrabold px-6 rounded-xl md:rounded-full shadow-lg shadow-sky-500/15 hover:shadow-sky-500/20 active:scale-98 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer font-sans"
                        >
                          <Search className="w-4 h-4" />
                          FIND ROUTE
                        </button>
                      </div>
                    </form>

                    {/* 5. Automatic Stats Strip */}
                    <div className="mb-6 flex justify-center items-center select-none">
                      <div className="px-4 py-1.5 bg-slate-900/50 border border-slate-800/80 rounded-full text-[10px] md:text-sm font-semibold text-slate-300 tracking-wide font-mono flex items-center gap-2 backdrop-blur-3xs">
                        <span>{destinations.length}+ Hubs</span>
                        <span className="text-slate-700">•</span>
                        <span>{routes.length > 0 ? routes.length : 317}+ Routes</span>
                        <span className="text-slate-700">•</span>
                        <span>{attractions.length}+ Attractions</span>
                      </div>
                    </div>

                    {/* 6. Popular Routes */}
                    <div className="mb-5 w-full flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest mb-2 select-none flex items-center gap-1">
                        🔥 Popular Routes
                      </span>
                      <div className="flex gap-2 items-center overflow-x-auto max-w-full pb-1 scrollbar-hidden select-none px-2 justify-center flex-wrap">
                        {[
                          { fromName: "NJP", fromId: "njp", toName: "Darjeeling", toId: "darjeeling" },
                          { fromName: "Bagdogra", fromId: "bagdogra", toName: "Kalimpong", toId: "kalimpong" },
                          { fromName: "NJP", fromId: "njp", toName: "Lava", toId: "lava" }
                        ].map((route, rIdx) => (
                          <button
                            key={`pop-route-${rIdx}`}
                            type="button"
                            onClick={() => clickQuickSearchRoute(route.fromId, route.toId)}
                            className="bg-slate-900/80 hover:bg-slate-850 text-slate-205 py-1.5 px-3.5 rounded-full text-xs font-bold border border-slate-800 hover:border-sky-500/40 transition active:scale-95 cursor-pointer flex whitespace-nowrap"
                          >
                            {route.fromName} → {route.toName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 7. Most Searched Today */}
                    <div className="w-full flex flex-col items-center">
                      <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest mb-2 select-none flex items-center gap-1">
                        📈 Most Searched Today
                      </span>
                      <div className="flex gap-2 items-center overflow-x-auto max-w-full pb-1 scrollbar-hidden select-none px-2 justify-center flex-wrap">
                        {displayedMostSearched.map((route, rIdx) => (
                          <button
                            key={`searched-route-${rIdx}`}
                            type="button"
                            onClick={() => clickQuickSearchRoute(route.fromId, route.toId)}
                            className="bg-slate-900/80 hover:bg-slate-850 text-slate-205 py-1.5 px-3.5 rounded-full text-xs font-bold border border-slate-800 hover:border-emerald-505/40 transition active:scale-95 cursor-pointer flex whitespace-nowrap"
                          >
                            {route.fromName} → {route.toName}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Quick Helper Banner */}
            <div className="bg-sky-50/50 dark:bg-sky-500/5 border-b border-sky-100/30 py-4 px-4 text-center">
              <p className="text-sky-850 dark:text-sky-300 text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 flex-wrap">
                <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Try routing from <strong>NJP (New Jalpaiguri)</strong> to <strong>Rishop</strong> or <strong>Lava</strong> to explore mountain multi-hop intelligence!</span>
              </p>
            </div>

            {/* ⭐ Hidden Gems of the Week Section */}
            {(() => {
              const featuredDestinations = destinations.filter(d => !!d.isFeaturedThisWeek).map(d => ({
                ...d,
                itemType: 'destination' as const,
              }));
              const featuredAttractions = attractions.filter(a => !!a.isFeaturedThisWeek).map(a => ({
                ...a,
                itemType: 'attraction' as const,
              }));
              const featuredItems = [...featuredDestinations, ...featuredAttractions].slice(0, 4);

              return (
                <ScrollAnimatedSection className="py-16 px-4 bg-white dark:bg-slate-900 transition-colors duration-200">
                  <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">⭐ Hidden Gems of the Week</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Handpicked, untouched, and spectacular mountain secrets chosen by local experts.</p>
                      </div>
                      <button 
                        id="view-all-hidden-gems-btn"
                        onClick={() => navigate('#/hidden-gems')}
                        className="bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100/70 border border-emerald-100 dark:border-slate-800 text-emerald-800 dark:text-emerald-450 text-sm font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        Show More <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {featuredItems.length === 0 ? (
                      <div className="text-center py-12 px-6 bg-slate-50/50 dark:bg-slate-950/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800/80">
                        <Sparkles className="w-10 h-10 text-emerald-500 mx-auto stroke-1.2 mb-3 animate-pulse" />
                        <p className="text-sm font-extrabold text-slate-700 dark:text-slate-350">Handpicked Secrets Coming Soon!</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Admins can mark Destinations or Attractions as "Featured This Week" in the Admin Panel.</p>
                      </div>
                    ) : (
                      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-805 -mx-4 px-4 sm:mx-0 sm:px-0">
                        {featuredItems.map((item) => {
                          const detailUrl = item.itemType === 'destination' ? `#/destination/${item.id}` : `#/attraction/${item.id}`;
                          return (
                            <div 
                              key={`${item.itemType}-${item.id}`}
                              id={`featured-gem-card-${item.id}`}
                              onClick={() => navigate(detailUrl)}
                              className="snap-start shrink-0 w-[82vw] sm:w-[520px] flex flex-col sm:flex-row bg-white dark:bg-slate-900/80 rounded-2xl overflow-hidden shadow-xs border border-slate-200/50 dark:border-slate-800/60 hover:shadow-md hover:border-emerald-250 dark:hover:border-emerald-500/30 transition-all duration-350 group cursor-pointer"
                            >
                              <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black rounded-full px-2.5 py-1 shadow-md uppercase tracking-wider">
                                  {item.itemType === 'destination' ? '📍 Destination' : '⭐ Attraction'}
                                </div>
                              </div>
                              <div className="p-6 flex flex-col justify-between flex-grow">
                                <div className="space-y-2">
                                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-120 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 truncate">
                                    {item.name}
                                  </h3>
                                  <p className="text-slate-550 dark:text-slate-400 text-xs line-clamp-3 leading-relaxed font-sans font-medium">
                                    {item.description}
                                  </p>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                                    {item.itemType === 'destination' ? 'HILL RETREAT' : 'SIGHTS & TRAILS'}
                                  </span>
                                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5">
                                    Explore details <ChevronRight className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollAnimatedSection>
              );
            })()}

            {/* ========================================================
                SECTION 1: FEATURED ATTRACTIONS
                ======================================================== */}
            {(() => {
              // Automatically select the top featured attractions based on user likes, visits/clicks, gems and properties
              const featuredAttractions = [...attractions]
                .map(a => {
                  const likeCount = likes.filter(l => l.contentId === a.id).length;
                  const viewCount = attractionStats[a.id] || 0;
                  const isHidden = !!a.isHiddenGem;
                  
                  // Score is calculated from active user engagement and local experts' baseline boosts
                  let baselineBoost = 0;
                  if (a.id === 'tiger-hill') baselineBoost = 40;
                  if (a.id === 'mirik-lake') baselineBoost = 35;
                  if (a.id === 'delo-park') baselineBoost = 30;
                  if (a.id === 'lava-monastery') baselineBoost = 25;
                  
                  const score = (likeCount * 15) + (viewCount * 2) + (isHidden ? 15 : 0) + (a.isFeaturedAttraction ? 50 : 0) + baselineBoost;
                  return { ...a, autoFeaturedScore: score };
                })
                .sort((a, b) => b.autoFeaturedScore - a.autoFeaturedScore)
                .slice(0, 4);

              return (
                <ScrollAnimatedSection id="featured-attractions-section" className="py-16 px-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-100 dark:border-slate-900/60 transition-colors duration-200">
                  <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                          📍 Featured Attractions
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Most stunning sightseeing sites, scenic views, and trails automatically updated by visitor engagement.
                        </p>
                      </div>
                      <button 
                        id="view-all-attractions-btn"
                        onClick={() => navigate('#/attractions')}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-805 text-slate-800 dark:text-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        View All Attractions <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {featuredAttractions.length === 0 ? (
                      <div className="text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-205/80">
                        <Sparkles className="w-10 h-10 text-emerald-500 mx-auto stroke-1.2 mb-3 animate-pulse" />
                        <p className="text-sm font-extrabold text-slate-700 dark:text-slate-350">Beautiful Attractions Await!</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Attractions automatically update here dynamically based on likes, visitor clicks, and ratings.</p>
                      </div>
                    ) : (
                      <div className="flex sm:grid gap-6 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-805 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredAttractions.map((item) => {
                          const dest = destinations.find(d => d.id === item.destinationId);
                          const destName = dest ? dest.name : 'Mountain Range';
                          const likeCount = likes.filter(l => l.contentId === item.id).length;

                          return (
                            <div
                              key={item.id}
                              id={`featured-attraction-card-${item.id}`}
                              onClick={() => navigate(`#/attraction/${item.id}`)}
                              className="bg-white dark:bg-slate-900/85 rounded-2xl overflow-hidden shadow-xs border border-slate-200/50 dark:border-slate-800/60 hover:shadow-lg hover:border-emerald-250 dark:hover:border-emerald-500/20 transition-all duration-350 group flex flex-col h-full cursor-pointer snap-center shrink-0 sm:shrink min-w-[280px] w-[80vw] sm:w-auto"
                            >
                              <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shadow-xs rounded-full px-3 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-450 tracking-wide uppercase border border-slate-100 dark:border-slate-805/60">
                                  🌲 {item.category}
                                </div>
                                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-350 border border-slate-100/40 shadow-xs">
                                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                                  <span>{likeCount}</span>
                                </div>
                              </div>

                              <div className="p-5 flex flex-col justify-between flex-grow">
                                <div>
                                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 font-mono">{destName}</p>
                                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-450 transition-colors">
                                    {item.name}
                                  </h3>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollAnimatedSection>
              );
            })()}

            {/* ========================================================
                SECTION 2: MOST LOVED DESTINATIONS
                ======================================================== */}
            {(() => {
              const lovedDestinations = destinations
                .slice()
                .map(dest => {
                  const likeCount = likes.filter(l => l.contentId === dest.id).length;
                  return { ...dest, likeCount };
                })
                .sort((a, b) => b.likeCount - a.likeCount)
                .slice(0, 4);

              return (
                <ScrollAnimatedSection id="loved-destinations-section" className="py-16 px-4 bg-white dark:bg-slate-900 transition-colors duration-200">
                  <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                          ❤️ Most Loved Destinations
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Our highest rated mountain stations based on real traveller likes and reviews.
                        </p>
                      </div>
                      <button 
                        id="view-all-loved-btn"
                        onClick={() => navigate('#/destinations')}
                        className="bg-red-50 dark:bg-slate-800 hover:bg-red-100/70 border border-red-105 dark:border-slate-800 text-red-800 dark:text-red-400 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        Explore More <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {lovedDestinations.length === 0 ? (
                      <div className="text-center py-12 px-6 bg-slate-50/50 dark:bg-slate-950/40 rounded-3xl border border-dashed border-slate-205 dark:border-slate-800/80">
                        <Heart className="w-10 h-10 text-red-500 mx-auto stroke-1.2 mb-3 animate-pulse" />
                        <p className="text-sm font-extrabold text-slate-700 dark:text-slate-350">Like destinations to rank them!</p>
                      </div>
                    ) : (
                      <div className="flex sm:grid gap-6 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-805 sm:grid-cols-2 lg:grid-cols-4">
                        {lovedDestinations.map((item) => (
                          <div
                            key={item.id}
                            id={`loved-destination-card-${item.id}`}
                            onClick={() => navigate(`#/destination/${item.id}`)}
                            className="bg-white dark:bg-slate-900/85 rounded-2xl overflow-hidden shadow-xs border border-slate-200/50 dark:border-slate-800/60 hover:shadow-lg hover:border-red-200 dark:hover:border-red-500/25 transition-all duration-350 group flex flex-col h-full cursor-pointer snap-center shrink-0 sm:shrink min-w-[280px] w-[80vw] sm:w-auto"
                          >
                            <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-3 left-3 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 font-bold rounded-full px-3 py-1 text-[10px] tracking-wide uppercase border border-red-100/10">
                                ❤️ Most Loved
                              </div>
                              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-350 border border-slate-100 dark:border-slate-850/60 shadow-xs">
                                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                                <span>{item.likeCount} Likes</span>
                              </div>
                            </div>

                            <div className="p-5 flex flex-col justify-between flex-grow">
                              <div>
                                <p className="text-[10px] font-bold text-red-505 dark:text-red-400 uppercase tracking-widest mb-1 font-mono">{item.tourismType}</p>
                                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-red-500 transition-colors">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-sans font-medium">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollAnimatedSection>
              );
            })()}

            {/* ========================================================
                SECTION 3: POPULAR DESTINATIONS
                ======================================================== */}
            {(() => {
              // Automatically select the top popular destinations based on user likes, visits, and density of choices
              const popularDestinations = [...destinations]
                .map(d => {
                  const likeCount = likes.filter(l => l.contentId === d.id).length;
                  const viewCount = destinationStats[d.id] || 0;
                  const homestayCount = homestays.filter(h => h.destinationId === d.id).length;
                  const attractionCount = attractions.filter(a => a.destinationId === d.id).length;
                  
                  // Score is calculated from user engagement (views/likes) and listing density (sights/homestays)
                  const score = (likeCount * 12) + (viewCount * 1.5) + (homestayCount * 5) + (attractionCount * 3) + (d.isPopularDestination ? 50 : 0);
                  return { ...d, autoPopularScore: score };
                })
                .sort((a, b) => b.autoPopularScore - a.autoPopularScore)
                .slice(0, 4);

              return (
                <ScrollAnimatedSection id="popular-destinations-section" className="py-16 px-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-b border-slate-100 dark:border-slate-900/60 transition-colors duration-200">
                  <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                          🏔 Popular Destinations
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Highly recommended general destinations and major hubs, automatically updated by travel traffic, homestays, and likes.
                        </p>
                      </div>
                      <button 
                        id="view-all-popular-btn"
                        onClick={() => navigate('#/destinations')}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-805 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        Explore All Destinations <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {popularDestinations.length === 0 ? (
                      <div className="text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-805/85">
                        <Sparkles className="w-10 h-10 text-sky-500 mx-auto stroke-1.2 mb-3 animate-pulse" />
                        <p className="text-sm font-extrabold text-slate-705 dark:text-slate-350">Popular Stations Coming Soon!</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Destinations automatically update here dynamically based on likes, visitor clicks, and listing counts.</p>
                      </div>
                    ) : (
                      <div className="flex sm:grid gap-6 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-805 sm:grid-cols-2 lg:grid-cols-4">
                        {popularDestinations.map((item) => {
                          const likeCount = likes.filter(l => l.contentId === item.id).length;
                          return (
                            <div
                              key={item.id}
                              id={`popular-destination-card-${item.id}`}
                              onClick={() => navigate(`#/destination/${item.id}`)}
                              className="bg-white dark:bg-slate-900/85 rounded-2xl overflow-hidden shadow-xs border border-slate-200/50 dark:border-slate-800/60 hover:shadow-lg hover:border-sky-100 dark:hover:border-sky-500/20 transition-all duration-350 group flex flex-col h-full cursor-pointer snap-center shrink-0 sm:shrink min-w-[280px] w-[80vw] sm:w-auto"
                            >
                              <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs shadow-xs rounded-full px-3 py-1 text-[10px] font-bold text-slate-850 dark:text-slate-200 tracking-wide uppercase border border-slate-100 dark:border-slate-800/60">
                                  🏔 {item.tourismType}
                                </div>
                                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-350 border border-slate-100 dark:border-slate-800/60 shadow-xs">
                                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                                  <span>{likeCount}</span>
                                </div>
                              </div>

                              <div className="p-5 flex flex-col justify-between flex-grow">
                                <div>
                                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                    {item.name}
                                  </h3>
                                  <p className="text-xs text-slate-505 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed font-sans font-medium">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </ScrollAnimatedSection>
              );
            })()}

            {/* Primary Action Buttons CTAs */}
            <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                  id="cta-book-car"
                  onClick={() => navigate('#/book-car')}
                  className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-500/30 text-left hover:scale-[1.015] hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-200 group cursor-pointer"
                >
                  <div className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-600 dark:group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200">
                    <Car className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-450">Reserve a Car</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">Book a dedicated vehicle or secure reliable pool cars with local expert hill guides.</p>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">Go to Booking <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>

                <button 
                  id="cta-book-homestay"
                  onClick={() => navigate('#/destinations')}
                  className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-500/30 text-left hover:scale-[1.015] hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-200 group cursor-pointer"
                >
                  <div className="bg-sky-100 text-sky-750 dark:bg-sky-500/10 dark:text-sky-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sky-600 dark:group-hover:bg-sky-500 group-hover:text-white transition-colors duration-200">
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-450">Reserve Homestay</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">Explore and contact registered eco-homestays in rural offbeat mountain villages of India.</p>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">Discover Homestays <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>

                <button 
                  id="cta-plan-trip"
                  onClick={() => navigate('#/plan-my-trip')}
                  className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-500/30 text-left hover:scale-[1.015] hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none transition-all duration-200 group cursor-pointer"
                >
                  <div className="bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-600 dark:group-hover:bg-teal-500 group-hover:text-white transition-colors duration-200">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 mb-1 group-hover:text-sky-600 dark:group-hover:text-sky-450">Plan My Custom Trip</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">Let our regional partners assemble a fully organized itinerary tailored to your budget.</p>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">Plan Trip Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            2. ROUTE RESULT VIEW
            ======================================================== */}
        {currentPath.startsWith('/route/') && (
          <div id="route-result-view" className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
            {loading ? (
              <div className="text-center py-16 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Running recursive pathfinding over graph nodes...</p>
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => navigate('#/')}
                  className="mb-6 flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Search Router
                </button>

                <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md border-b-4 border-emerald-500 mb-8">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-5 mb-5">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25 uppercase">
                        Route Search Results
                      </span>
                      <h2 className="text-3xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
                        {hubs.find(h => h.id === searchFrom)?.name} 
                        <ArrowRight className="w-6 h-6 text-emerald-400" /> 
                        {hubs.find(h => h.id === searchTo)?.name}
                      </h2>
                    </div>
                    {activeRouteResults.length > 0 && (
                      <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-right">
                        <p className="text-xs text-slate-400">Database Search Result Status</p>
                        <p className="text-sm font-bold text-emerald-400">{activeRouteResults.length} Path(s) Found</p>
                      </div>
                    )}
                  </div>

                  {activeRouteResults.length === 0 ? (
                    <div className="bg-slate-800/50 p-8 rounded-2xl text-center">
                      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                      <h4 className="font-bold text-lg mb-1">No Direct Or Calculated Graph Path Found</h4>
                      <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
                        We did not discover an official route or active intermediate multi-hop path. Please suggest a route connection or map update.
                      </p>
                      <button 
                        onClick={() => navigate('#/contribute')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        File missing route contributor data
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto space-y-6">
                      {/* Left: Route cards */}
                      <div className="w-full space-y-6">
                        {(() => {
                          const shortestRouteIdx = activeRouteResults.length > 0
                            ? activeRouteResults.reduce((minIdx, current, idx, arr) => {
                                const cMin = (current.route && current.route.timeMin !== undefined) ? current.route.timeMin : Infinity;
                                const mMin = (arr[minIdx] && arr[minIdx].route && arr[minIdx].route.timeMin !== undefined) ? arr[minIdx].route.timeMin : Infinity;
                                return cMin < mMin ? idx : minIdx;
                              }, 0)
                            : 0;

                          const routesMapped = activeRouteResults.map((route, idx) => ({ route, idx }));
                          const routesToRender = showAllRoutes 
                            ? routesMapped 
                            : (routesMapped.length > 0 ? [routesMapped[shortestRouteIdx]] : []);

                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <p className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                                  {showAllRoutes ? "All Discovered routes" : "Ultimate Shortest route"}
                                </p>
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-extrabold py-1 px-2.5 rounded uppercase">
                                  {showAllRoutes ? `${activeRouteResults.length} Paths Discovered` : "Shortest Option"}
                                </span>
                              </div>

                              {routesToRender.map(({ route: resItem, idx: index }) => {
                                const isActive = selectedRouteIdx === index;
                                const isShortestGlobal = index === shortestRouteIdx;
                                return (
                                  <div 
                                    key={index}
                                    onClick={() => setSelectedRouteIdx(index)}
                                    className={`text-left p-6 rounded-2xl border-2 transition duration-200 cursor-pointer relative overflow-hidden ${
                                      isActive 
                                        ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                                        : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                                    }`}
                                  >
                                    {/* Shortest Badge inside card */}
                                    {isShortestGlobal && (
                                      <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-xl font-mono shadow-sm">
                                        ⚡ Shortest Route
                                      </div>
                                    )}

                                    <div className="flex justify-between items-center gap-2 mb-4">
                                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase ${
                                        resItem.route.type === 'Direct' 
                                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      }`}>
                                        {resItem.route.type} Connection
                                      </span>
                                      
                                      <div className="flex items-center gap-2 pr-12">
                                        {isActive && (
                                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                                            <CheckCircle className="w-3.5 h-3.5" /> Map Visualized
                                          </span>
                                        )}
                                        {resItem.route.verified ? (
                                          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-md text-[10px] font-bold">Verified Direct</span>
                                        ) : (
                                          <span className="bg-slate-500/10 text-slate-300 px-2 py-0.5 rounded-md text-[10px]">Unverified Draft</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Pathway visual stopovers */}
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-4 font-sans">
                                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2">Calculated Transit stops</div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        {resItem.route.path.map((stop, stopIdx) => (
                                          <React.Fragment key={stopIdx}>
                                            {stopIdx > 0 && <ChevronRight className="w-4 h-4 text-emerald-400" />}
                                            <span className={`border text-xs font-semibold px-2.5 py-1 rounded-sm ${
                                              stopIdx === 0 
                                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                                : stopIdx === resItem.route.path.length - 1
                                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                                                  : 'bg-slate-800 border-slate-700 text-slate-200'
                                            }`}>
                                              {stop}
                                            </span>
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2.5 text-center font-sans">
                                      <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                                        <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5 whitespace-nowrap">Est. Fare range</span>
                                        <span className="text-base font-extrabold text-amber-400 font-sans">₹{resItem.route.fareMin} - ₹{resItem.route.fareMax}</span>
                                      </div>
                                      <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                                        <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5 whitespace-nowrap">Duration time</span>
                                        <span className="text-base font-extrabold text-emerald-400 font-sans">{Math.round(resItem.route.timeMin / 60 * 10) / 10}h - {Math.round(resItem.route.timeMax / 60 * 10) / 10}h</span>
                                      </div>
                                      <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                                        <span className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5 whitespace-nowrap">Distance</span>
                                        <span className="text-base font-extrabold text-sky-400 font-sans">{resItem.route.distance ? `${resItem.route.distance} km` : 'N/A'}</span>
                                      </div>
                                    </div>

                                    {/* Google Maps Live GPS Navigation Link */}
                                    <div className="mt-4 pt-4 border-t border-slate-700/40 flex flex-col sm:flex-row justify-between items-center gap-3">
                                      <div className="text-left w-full sm:w-auto">
                                        <p className="text-[10px] uppercase text-emerald-400 font-extrabold tracking-widest font-mono">Live GPS Navigation</p>
                                        <p className="text-xs text-slate-300 font-medium">Auto-generate turn-by-turn route on Google Maps</p>
                                      </div>
                                      <a
                                        href={(() => {
                                          const path = resItem.route.path || [];
                                          if (path.length === 0) return '#';
                                          const origin = path[0];
                                          const destination = path[path.length - 1];
                                          const waypoints = path.slice(1, -1).join('|');
                                          const baseUrl = "https://www.google.com/maps/dir/?api=1";
                                          const params = [
                                            `origin=${encodeURIComponent(origin + ', India')}`,
                                            `destination=${encodeURIComponent(destination + ', India')}`,
                                            `travelmode=driving`
                                          ];
                                          if (waypoints) {
                                            params.push(`waypoints=${encodeURIComponent(waypoints.split('|').map(w => w + ', India').join('|'))}`);
                                          }
                                          return `${baseUrl}&${params.join('&')}`;
                                        })()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const fromName = hubs.find(h => h.id === resItem.route.fromHubId)?.name || resItem.route.fromHubId;
                                          const toName = hubs.find(h => h.id === resItem.route.toHubId)?.name || resItem.route.toHubId;
                                          trackNavigateGoogleMaps(`${fromName} to ${toName}`, resItem.route.latitude, resItem.route.longitude);
                                        }}
                                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs tracking-wider uppercase rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer select-none"
                                      >
                                        <Compass className="w-4 h-4" />
                                        <span>Navigate with Google Maps</span>
                                      </a>
                                    </div>

                                    {/* Real-time multi hop hop indicators structure */}
                                    {resItem.hops && resItem.hops.length > 0 && (
                                      <div className="mt-4 border-t border-slate-700/50 pt-4 text-left">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans">Hops Detail Trace (Multi-leg booking recommended)</div>
                                        <div className="space-y-2">
                                          {resItem.hops.map((hop, hopIdx) => (
                                            <div key={hopIdx} className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                                              <div>
                                                <span className="text-emerald-400 font-semibold">{hop.fromHub.name}</span> to <span className="text-emerald-400 font-semibold">{hop.toHub.name}</span>
                                              </div>
                                              <span className="text-slate-400 font-medium">₹{hop.route.fareMin} • {hop.route.timeMin} mins {hop.route.distance ? `• ${hop.route.distance} km` : ''}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="mt-4 text-[10px] text-slate-500 text-right font-sans">
                                      Last Updated Ref: {resItem.route.lastUpdated}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Toggle button to display all / rest of the route results */}
                              {!showAllRoutes && activeRouteResults.length > 1 && (
                                <div className="pt-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setShowAllRoutes(true)}
                                    className="w-full bg-slate-800/85 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700/80 p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                  >
                                    <span>Show alternative routes ({activeRouteResults.length - 1} more discovered)</span>
                                    <ChevronDown className="w-4 h-4 animate-bounce" />
                                  </button>
                                </div>
                              )}

                              {showAllRoutes && activeRouteResults.length > 1 && (
                                <div className="pt-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowAllRoutes(false);
                                      setSelectedRouteIdx(shortestRouteIdx);
                                    }}
                                    className="w-full bg-slate-800/40 hover:bg-slate-800/60 text-slate-300 border border-slate-700/60 p-3 rounded-xl font-bold text-xs tracking-wider uppercase transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                                  >
                                    <span>Show Ultimate Shortest Route Only</span>
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>


                    </div>
                  )}
                </div>

                {/* Destination, Attraction, and Homestays detail filtered of destination search from or search to */}
                {(() => {
                  // Attempt to map slug
                  const targetSlug = searchTo;
                  const dest = destinations.find(d => d.id === targetSlug) || destinations.find(d => d.id === searchFrom);
                  if (!dest) return null;

                  const filteredAtts = attractions.filter(a => a.destinationId === dest.id);
                  const filteredHomes = homestays.filter(h => h.destinationId === dest.id);

                  return (
                    <div className="space-y-12">
                      {/* Destination block */}
                      <div className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                          <div className="h-64 lg:h-full min-h-[300px] relative bg-slate-100">
                            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden" />
                            <div className="absolute bottom-4 left-4 lg:hidden text-white">
                              <h3 className="text-2xl font-extrabold">{dest.name}</h3>
                              <p className="text-xs text-amber-400">{dest.tourismType}</p>
                            </div>
                          </div>
                          
                          <div className="p-6 md:p-8 flex flex-col justify-center">
                            <span className="text-emerald-700 bg-emerald-50 self-start px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase">Primary Terminus Destination</span>
                            <h3 className="hidden lg:block text-3xl font-extrabold text-slate-900 mb-2">{dest.name}</h3>
                            <p className="text-emerald-600 text-xs font-bold mb-4">{dest.tourismType} • Best Period: {dest.bestSeason}</p>
                            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">{dest.description}</p>
                            
                            <div className="flex flex-wrap gap-3">
                              <button 
                                onClick={() => navigate(`#/destination/${dest.id}`)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                              >
                                View Destination Page
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Attractions Section list (Horizontal swipe carousel) */}
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-900 font-sans">Must-Visit Attractions in {dest.name}</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-sans">Explore gorgeous sightseeing spots around this region.</p>
                          </div>
                          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-1.5 md:mr-2">
                              <button 
                                onClick={() => scrollCarousel(`attractions-carousel-${dest.id}`, 'left')}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/85 text-slate-750 flex items-center justify-center transition cursor-pointer select-none"
                                title="Scroll left"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => scrollCarousel(`attractions-carousel-${dest.id}`, 'right')}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/85 text-slate-750 flex items-center justify-center transition cursor-pointer select-none"
                                title="Scroll right"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                            <button 
                              onClick={() => navigate('#/attractions')}
                              className="text-xs font-bold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition shrink-0"
                            >
                              View All Attractions
                            </button>
                          </div>
                        </div>

                        {filteredAtts.length === 0 ? (
                          <div className="bg-slate-100 p-6 rounded-2xl text-center text-slate-500 text-xs">
                            No local attractions currently registered under this hub. Contribute one!
                          </div>
                        ) : (
                          <div 
                            id={`attractions-carousel-${dest.id}`}
                            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
                          >
                            {filteredAtts.slice(0, 6).map(att => (
                              <div 
                                key={att.id} 
                                className="w-[calc(100vw-48px)] min-w-[calc(100vw-48px)] sm:w-[280px] sm:min-w-[280px] md:w-[320px] md:min-w-[320px] snap-center flex-shrink-0 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:scale-[1.01] transition duration-155 flex flex-col"
                              >
                                <div className="h-40 bg-slate-100 relative">
                                  <img src={att.image} alt={att.name} className="w-full h-full object-cover animate-fade-in" />
                                  <span className="absolute top-3 left-3 text-[9px] text-indigo-700 bg-indigo-50/95 font-extrabold uppercase px-2 py-0.5 rounded shadow-xs border border-indigo-150">
                                    {att.category}
                                  </span>
                                </div>
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                  <div className="mb-4">
                                    <h4 className="font-bold text-base text-slate-900 mt-1">{att.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{att.description}</p>
                                  </div>
                                  <button
                                    onClick={() => navigate(`#/attraction/${att.id}`)}
                                    className="w-full bg-slate-50 hover:bg-emerald-50 text-[11px] font-bold text-slate-700 py-2 rounded-xl border border-slate-200/80 cursor-pointer text-center font-sans transition"
                                  >
                                    Attraction Guide
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Homestays list (Horizontal swipe carousel) */}
                      <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-900 font-sans">Recommended Local Homestays</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-sans">Safe, organic, Lepcha & Nepali hospitality lodging choices closely verified.</p>
                          </div>
                          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-1.5 md:mr-2">
                              <button 
                                onClick={() => scrollCarousel(`homestays-carousel-${dest.id}`, 'left')}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/85 text-slate-750 flex items-center justify-center transition cursor-pointer select-none"
                                title="Scroll left"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => scrollCarousel(`homestays-carousel-${dest.id}`, 'right')}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/85 text-slate-750 flex items-center justify-center transition cursor-pointer select-none"
                                title="Scroll right"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                            <button 
                              onClick={() => navigate('#/destinations')}
                              className="text-xs font-bold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition shrink-0"
                            >
                              View All Homestays
                            </button>
                          </div>
                        </div>

                        {filteredHomes.length === 0 ? (
                          <div className="bg-slate-100 p-6 rounded-2xl text-center text-slate-500 text-xs">
                            No local homestays documented under this hub yet. 
                          </div>
                        ) : (
                          <div 
                            id={`homestays-carousel-${dest.id}`}
                            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
                          >
                            {filteredHomes.slice(0, 6).map(home => (
                              <div 
                                key={home.id} 
                                className="w-[calc(100vw-48px)] min-w-[calc(100vw-48px)] sm:w-[280px] sm:min-w-[280px] md:w-[320px] md:min-w-[320px] snap-center flex-shrink-0 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:scale-[1.01] transition duration-150 flex flex-col"
                              >
                                <div className="h-44 bg-slate-100 relative">
                                  <img 
                                    src={(home.images && home.images.find(img => img && img.trim() !== '')) || DEFAULT_HOMESTAY_IMAGE} 
                                    alt={home.name} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = DEFAULT_HOMESTAY_IMAGE;
                                    }}
                                  />
                                </div>
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                  <div>
                                    <h4 className="font-bold text-base text-slate-900 line-clamp-1 text-left">{home.name}</h4>
                                    <div className="flex flex-wrap items-center justify-between gap-1.5 mt-1">
                                      <p className="text-emerald-700 text-sm font-bold text-left">₹{home.priceMin} - ₹{home.priceMax}/day</p>
                                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-100">
                                        🍳 {home.breakfastIncluded === 'Not Included' ? 'Bfast Excluded' : 'Bfast Incl'}
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1 mt-2.5 mb-4 justify-start">
                                      {home.amenities.slice(0, 3).map((amen, idx) => (
                                        <span key={idx} className="bg-slate-100 text-slate-650 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-slate-200/50">
                                          {amen}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => navigate(`#/homestay/${home.id}`)}
                                      className="flex-grow bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl cursor-pointer text-center transition"
                                    >
                                      Room Details
                                    </button>
                                    <a 
                                      href={`https://wa.me/${formatWhatsAppNumber(home.whatsapp || home.contact)}?text=Hi,%20I'm%2520interested%2520in%2520booking%2520${encodeURIComponent(home.name)}%2520via%2520HillyTrip.`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl flex items-center justify-center transition shrink-0"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Related Destinations (Horizontal swipe carousel) */}
                      <div>
                        {(() => {
                          const relatedDests = destinations
                            .filter(d => d.id !== dest.id)
                            .slice(0, 6);

                          if (relatedDests.length === 0) return null;

                          return (
                            <>
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
                                <div>
                                  <h3 className="text-2xl font-bold text-slate-900 font-sans">Related Destinations</h3>
                                  <p className="text-sm text-slate-500 mt-0.5 font-sans">Discover vibrant nearby mountain towns and hidden valleys.</p>
                                </div>
                                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                                  <div className="flex items-center gap-1.5 md:mr-2">
                                    <button 
                                      onClick={() => scrollCarousel(`destinations-carousel-${dest.id}`, 'left')}
                                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/85 text-slate-750 flex items-center justify-center transition cursor-pointer select-none"
                                      title="Scroll left"
                                    >
                                      <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => scrollCarousel(`destinations-carousel-${dest.id}`, 'right')}
                                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/85 text-slate-750 flex items-center justify-center transition cursor-pointer select-none"
                                      title="Scroll right"
                                    >
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <button 
                                    onClick={() => navigate('#/destinations')}
                                    className="text-xs font-bold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition shrink-0"
                                  >
                                    View All Destinations
                                  </button>
                                </div>
                              </div>

                              <div 
                                id={`destinations-carousel-${dest.id}`}
                                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
                              >
                                {relatedDests.map(d => (
                                  <div 
                                    key={d.id} 
                                    className="w-[calc(100vw-48px)] min-w-[calc(100vw-48px)] sm:w-[280px] sm:min-w-[280px] md:w-[320px] md:min-w-[320px] snap-center flex-shrink-0 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden hover:scale-[1.01] transition duration-150 flex flex-col"
                                  >
                                    <div className="h-44 bg-slate-100 relative">
                                      <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                                      <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs font-extrabold text-[9px] text-slate-800 py-1 px-2.5 rounded-full border border-slate-200 uppercase">
                                        🏕️ {d.tourismType}
                                      </span>
                                    </div>
                                    <div className="p-4 flex-grow flex flex-col justify-between">
                                      <div className="mb-4">
                                        <h4 className="font-bold text-base text-slate-900 line-clamp-1">{d.name}</h4>
                                        <p className="text-emerald-750 text-xs font-extrabold mt-1">Best Season: {d.bestSeason}</p>
                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{d.description}</p>
                                      </div>
                                      <button 
                                        onClick={() => navigate(`#/destination/${d.id}`)}
                                        className="w-full bg-slate-900 hover:bg-emerald-650 text-white font-bold py-2.5 rounded-xl text-center text-xs cursor-pointer transition-all flex items-center justify-center gap-1"
                                      >
                                        Explore Destination Guide <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Action buttons CTAs */}
                      <div className="bg-emerald-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-emerald-100">
                        <div>
                          <h4 className="font-bold text-xl text-emerald-900">Need Custom Booking Support?</h4>
                          <p className="text-sm text-emerald-700 mt-1">We can assist you directly with reserving standard pool cars, drivers, or reserving full family trip planning packages.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0 justify-end">
                          <button 
                            onClick={() => navigate('#/book-car')} 
                            className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl cursor-pointer"
                          >
                            Book Car 🚗
                          </button>
                          <button 
                            onClick={() => navigate('#/plan-my-trip')} 
                            className="w-full md:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-3 rounded-xl cursor-pointer"
                          >
                            Plan My Trip 🧭
                          </button>
                        </div>
                      </div>

                      {/* Correction details submission */}
                      <div className="bg-slate-100 rounded-xl p-4 text-center text-xs text-slate-500">
                        <p>Route discrepancy discovered? <button onClick={() => navigate('#/contribute')} className="text-emerald-700 font-bold underline cursor-pointer">Suggest Route Correction Or missing fare updates</button> to preserve system accuracy.</p>
                      </div>

                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        )}

        {/* ========================================================
            3. REDESIGNED DESTINATIONS DISCOVERY EXPERIENCE (MOBILE-FIRST ENGINE)
            ======================================================== */}
        {currentPath === '/destinations' && (
          <div id="destinations-view" className="relative pb-24 overflow-x-hidden animate-fade-in bg-slate-50/50 dark:bg-slate-950/20">
            
            {/* STICKY SEARCH HEADER */}
            <div className="sticky top-14 z-45 bg-white/90 dark:bg-slate-955/90 backdrop-blur-md shadow-xs border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
              <div className="max-w-7xl mx-auto px-4 py-3.5 sm:px-6 lg:px-8">
                <div className="relative">
                  <div className="flex items-center gap-3 bg-slate-150/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 transition-all focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/15">
                    <Search className="w-5 h-5 text-slate-400 shrink-0" />
                    <input 
                      id="sticky-dest-search-input"
                      type="text" 
                      placeholder="Search slopes, valleys, monasteries, hidden treks..." 
                      className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium text-sm focus:ring-0 focus:outline-none"
                      value={destSearchQuery}
                      onChange={(e) => {
                        setDestSearchQuery(e.target.value);
                        setShowDestSuggestions(true);
                      }}
                      onFocus={() => setShowDestSuggestions(true)}
                    />
                    {destSearchQuery && (
                      <button 
                        onClick={() => {
                          setDestSearchQuery('');
                          setShowDestSuggestions(false);
                        }} 
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete suggestions dropdown overlay */}
                  {showDestSuggestions && destSearchQuery.trim() && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-slide-up">
                      {(() => {
                        const suggestions = destinations.filter(d => 
                          d.name.toLowerCase().includes(destSearchQuery.toLowerCase()) ||
                          d.tourismType.toLowerCase().includes(destSearchQuery.toLowerCase()) ||
                          d.description.toLowerCase().includes(destSearchQuery.toLowerCase())
                        ).slice(0, 5);

                        if (suggestions.length === 0) {
                          return (
                            <div className="px-4 py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                              <span>No matched coordinates located. Try another phrase.</span>
                            </div>
                          );
                        }

                        return suggestions.map(d => (
                          <div 
                            key={d.id} 
                            onClick={() => {
                              navigate(`#/destination/${d.id}`);
                              setShowDestSuggestions(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                          >
                            <img src={d.image} alt={d.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{d.name}</h4>
                              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{d.tourismType}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN DISCOVERY STAGE */}
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
              
              {/* HERO INSIGHT */}
              <div className="text-center sm:text-left">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl leading-none">Hilly Destination Guides</h1>
                <p className="text-slate-650 dark:text-slate-300 mt-2.5 max-w-2xl text-sm sm:text-base leading-relaxed">
                  Organic discovery algorithms mapped from actual traveler coordinates, homestay lodgings, active lane pathways, and visual photography trails.
                </p>
              </div>

              {/* SECTION 1: DISCOVER SOMEWHERE NEW (FEATURED RANDOMIZER) */}
              {surpriseDest && (
                <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-lg border border-slate-800/60 p-1 relative flex flex-col lg:flex-row min-h-[400px]">
                  {/* Absolute backdrop glow effect */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl -z-10 pointer-events-none" />
                  
                  {/* Large Card Cover Image */}
                  <div className="w-full lg:w-3/5 h-64 lg:h-auto min-h-[280px] bg-slate-950 relative shrink-0">
                    <img src={surpriseDest.image} alt={surpriseDest.name} className="w-full h-full object-cover rounded-2xl lg:rounded-r-none" />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                      <span className="bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Discover Somewhere New
                      </span>
                    </div>
                  </div>

                  {/* Randomizer Content Details */}
                  <div className="p-6 sm:p-8 lg:p-10 flex-grow flex flex-col justify-between items-start">
                    <div className="space-y-4 w-full">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block font-mono">🏕️ {surpriseDest.tourismType}</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">{surpriseDest.name}</h2>
                      </div>
                      
                      <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                        {surpriseDest.description}
                      </p>

                      {/* Quick attributes */}
                      <div className="flex flex-wrap gap-4 py-2 font-mono text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Best: {surpriseDest.bestSeason}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>Views: {destinationStats[surpriseDest.id] || 0} clicks</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                          <Home className="w-3.5 h-3.5 text-amber-400" />
                          <span>Homestays: {homestays.filter(h => h.destinationId === surpriseDest.id && h.status !== 'Rejected').length} lodges</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-6 shrink-0 pt-4 border-t border-slate-800/50">
                      <button
                        onClick={() => navigate(`#/destination/${surpriseDest.id}`)}
                        className="flex-1 bg-white hover:bg-emerald-50 text-slate-900 font-bold py-3.5 px-6 rounded-2xl text-xs cursor-pointer tracking-wider text-center uppercase transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                      >
                        Explore Complete Coordinates <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const otherDests = destinations.filter(d => d.id !== surpriseDest.id);
                          if (otherDests.length > 0) {
                            const randomIndex = Math.floor(Math.random() * otherDests.length);
                            setSurpriseDest(otherDests[randomIndex]);
                          }
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-2xl text-xs cursor-pointer transition-all flex items-center justify-center gap-2 border border-slate-700/45 text-center shrink-0"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-emerald-400" /> Try Another Coordinates
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* RENDER SIX SWIPEABLE HORIZONTAL CATEGORIES */}
              {(() => {
                const compileDestinationCard = (dest: any, badgeText?: string, metricText?: string) => {
                  const viewCount = destinationStats[dest.id] || 0;
                  const homestayCount = homestays.filter(h => h.destinationId === dest.id && h.status !== 'Rejected').length;
                  const attractionCount = attractions.filter(a => a.destinationId === dest.id).length;
                  const likeCount = likes.filter(l => l.contentId === dest.id).length;
                  const commentCount = comments.filter(c => c.contentId === dest.id && c.contentType === 'destination').length;

                  return (
                    <div 
                      key={dest.id}
                      className="min-w-[85vw] sm:min-w-[340px] md:min-w-[300px] xl:min-w-[260px] w-[85vw] sm:w-[340px] md:w-[300px] xl:w-[260px] snap-start flex-shrink-0 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-205 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow group relative"
                    >
                      {/* Anchor image block */}
                      <div className="h-44 bg-slate-100 dark:bg-slate-950 relative overflow-hidden shrink-0">
                        <img 
                          src={dest.image} 
                          alt={dest.name} 
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Dynamic top left indicator badge */}
                        {badgeText && (
                          <span className="absolute top-3 left-3 bg-slate-900/90 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700/50">
                            {badgeText}
                          </span>
                        )}

                        {/* Direct action overlay buttons */}
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(dest.id, 'destination');
                            }}
                            className="bg-white/95 hover:bg-white text-slate-700 p-2 rounded-full shadow-md transition hover:scale-105 active:scale-[0.95] cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                            title="Like destination"
                          >
                            <Heart 
                              className={`w-3 h-3 transition-colors ${
                                user && likes.some(l => l.id === `${user.uid}_${dest.id}`)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-slate-600 hover:text-red-500'
                              }`}
                            />
                            <span className="text-[10px] font-bold text-slate-800">{likeCount}</span>
                          </button>
                        </div>

                        {/* Slopes category pill */}
                        <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs font-bold text-[9px] text-slate-800 py-0.5 px-2.5 rounded-full border border-slate-100 uppercase tracking-widest">
                          🏕️ {dest.tourismType}
                        </span>
                      </div>

                      {/* Info blocks detail */}
                      <div className="p-5 flex-grow flex flex-col justify-between min-h-[170px]">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white truncate max-w-[80%]">{dest.name}</h3>
                            {metricText && (
                              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">{metricText}</span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mb-2">Best: {dest.bestSeason}</p>
                          <p className="text-slate-650 dark:text-slate-350 text-xs leading-relaxed line-clamp-3">{dest.description}</p>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/55 flex items-center justify-between font-mono text-[10px] text-slate-550 dark:text-slate-400">
                          <span className="flex items-center gap-1">🧭 {attractionCount} Sights</span>
                          <span className="flex items-center gap-1">🏡 {homestayCount} Lodgings</span>
                          
                          <button 
                            onClick={() => navigate(`#/destination/${dest.id}`)}
                            className="text-emerald-700 dark:text-emerald-400 font-extrabold uppercase tracking-wide hover:underline cursor-pointer flex items-center"
                          >
                            Go <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                };

                const renderSectionCarousel = (title: string, subtitle: string, items: any[], sectionId: string, itemBadgeMaker: (d: any) => string, itemMetricMaker: (d: any) => string) => {
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={sectionId} className="space-y-4 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-2xl">{title}</h3>
                          <p className="text-slate-500 dark:text-slate-405 text-xs sm:text-sm mt-0.5">{subtitle}</p>
                        </div>
                        {/* Scroll Arrows */}
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={() => {
                              const el = document.getElementById(`carousel-${sectionId}`);
                              if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                            }}
                            className="bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs active:scale-95 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              const el = document.getElementById(`carousel-${sectionId}`);
                              if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                            }}
                            className="bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs active:scale-95 transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Swiper wrapper with partial next card showing (encourages swiping horizontally) */}
                      <div 
                        id={`carousel-${sectionId}`}
                        className="flex gap-4 md:gap-5 overflow-x-auto snap-x scrollbar-none pb-2 pt-1"
                      >
                        {items.map(dest => compileDestinationCard(dest, itemBadgeMaker(dest), itemMetricMaker(dest)))}
                        {/* Final element spacer to maintain swipe balance */}
                        <div className="min-w-[10px] flex-shrink-0" />
                      </div>
                    </div>
                  );
                };

                // Assemble datasets
                const trending = (() => {
                  return [...destinations].map(dest => {
                    const viewCount = destinationStats[dest.id] || 0;
                    const likeCount = likes.filter(l => l.contentId === dest.id).length;
                    const commentCount = comments.filter(c => c.contentId === dest.id && c.contentType === 'destination').length;
                    const score = (viewCount * 1) + (likeCount * 4) + (commentCount * 6);
                    return { dest, score };
                  })
                  .sort((a, b) => b.score - a.score)
                  .map(item => item.dest)
                  .slice(0, 10);
                })();

                const offbeat = (() => {
                  return [...destinations].map(dest => {
                    const viewCount = destinationStats[dest.id] || 0;
                    const likeCount = likes.filter(l => l.contentId === dest.id).length;
                    let score = dest.isHiddenGem ? 100 : 0;
                    if (viewCount < 8) score += 40;
                    if (likeCount < 3) score += 20;
                    return { dest, score };
                  })
                  .sort((a, b) => b.score - a.score)
                  .map(item => item.dest)
                  .slice(0, 10);
                })();

                const photogenic = (() => {
                  return [...destinations].map(dest => {
                    const hasPhotoTag = ['scenic', 'trek', 'lake', 'monastery', 'viewpoint', 'waterfall', 'heritage', 'sanctuary', 'glacier'].some(t => 
                      dest.tourismType.toLowerCase().includes(t) || dest.description.toLowerCase().includes(t)
                    );
                    const galleryCount = Array.isArray(dest.gallery) ? dest.gallery.length : 0;
                    let score = galleryCount * 12;
                    if (hasPhotoTag) score += 60;
                    if (dest.image) score += 20;
                    return { dest, score };
                  })
                  .sort((a, b) => b.score - a.score)
                  .map(item => item.dest)
                  .slice(0, 10);
                })();

                const news = (() => {
                  return [...destinations].sort((a: any, b: any) => {
                    if (a.createdAt && b.createdAt) {
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return destinations.indexOf(b) - destinations.indexOf(a);
                  })
                  .slice(0, 10);
                })();

                const stays = (() => {
                  return [...destinations].map(dest => {
                    const homestayCount = homestays.filter(h => h.destinationId === dest.id && h.status !== 'Rejected').length;
                    const attractionCount = attractions.filter(a => a.destinationId === dest.id).length;
                    const depthScore = (homestayCount * 20) + (attractionCount * 10);
                    const likeCount = likes.filter(l => l.contentId === dest.id).length;
                    const score = depthScore + (likeCount * 5);
                    return { dest, score };
                  })
                  .sort((a, b) => b.score - a.score)
                  .map(item => item.dest)
                  .slice(0, 10);
                })();

                const getaways = (() => {
                  return [...destinations].map(dest => {
                    const connectedRoutes = routes.filter(r => 
                      r.fromHubId === dest.id || 
                      r.toHubId === dest.id || 
                      (Array.isArray(r.path) && r.path.includes(dest.name))
                    ).length;
                    const score = (connectedRoutes * 25) + (dest.tourismType.toLowerCase().includes('weekend') || dest.tourismType.toLowerCase().includes('hill') ? 35 : 10);
                    return { dest, score };
                  })
                  .sort((a, b) => b.score - a.score)
                  .map(item => item.dest)
                  .slice(0, 10);
                })();

                return (
                  <div className="space-y-12">
                    {renderSectionCarousel(
                      "Trending Slopes", 
                      "Popular coordinates receiving the highest views and travel signals", 
                      trending, 
                      "trending", 
                      (d) => "🔥 High Demand", 
                      (d) => `● ${destinationStats[d.id] || 0} visits`
                    )}

                    {renderSectionCarousel(
                      "Offbeat Escapes", 
                      "Lesser-known valleys and peaceful slopes away from massive tourists", 
                      offbeat, 
                      "offbeat", 
                      (d) => "🌲 Offbeat Valley", 
                      (d) => "Quiet gem"
                    )}

                    {renderSectionCarousel(
                      "Visually Stunning", 
                      "Scenic peak panoramas, waterfalls and monastery views ideal for photography", 
                      photogenic, 
                      "photogenic", 
                      (d) => "📸 Picturesque", 
                      (d) => `${Array.isArray(d.gallery) ? d.gallery.length : 0} Gallery files`
                    )}

                    {renderSectionCarousel(
                      "New Discoveries", 
                      "Newly logged destination guides recently incorporated on HillyTrip", 
                      news, 
                      "new", 
                      (d) => "🆕 Newly Logged", 
                      (d) => "Latest Guide"
                    )}

                    {renderSectionCarousel(
                      "Places For Immersive Stays", 
                      "Valleys packed with homestays and attractions worth staying longer", 
                      stays, 
                      "stays", 
                      (d) => "🏡 Stay longer", 
                      (d) => `${homestays.filter(h => h.destinationId === d.id && h.status !== 'Rejected').length} lodges available`
                    )}

                    {renderSectionCarousel(
                      "Perfect Short Getaways", 
                      "Accessible stations with great connectivity, ideal for weekends", 
                      getaways, 
                      "getaways", 
                      (d) => "🚗 Quick Getaway", 
                      (d) => {
                        const count = routes.filter(r => r.fromHubId === d.id || r.toHubId === d.id).length;
                        return `${count} active lanes`
                      }
                    )}
                  </div>
                );
              })()}

              {/* SECTION 9: BROWSE ALL DESTINATIONS (INTELLIGENT DIRECTORY MAP) */}
              <div className="pt-10 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-3xl">Browse All Destinations</h2>
                    <p className="text-slate-500 dark:text-slate-405 text-xs sm:text-sm mt-1">
                      Employ our comprehensive indexes to filter and sort all logged hill coordinates dynamically.
                    </p>
                  </div>

                  {/* Options panel filters & sorting toggles */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* View mode toggle (Grid vs List) */}
                    <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 cursor-pointer ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600'}`}
                        title="Grid Layout"
                      >
                        <CheckSquare className="w-4 h-4 rotate-45" />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 cursor-pointer ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600'}`}
                        title="List Layout"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Genre / Tourism Type Filter */}
                    <div className="relative inline-block shrink-0">
                      <select 
                        value={destTypeFilter}
                        onChange={(e) => setDestTypeFilter(e.target.value)}
                        className="appearance-none font-sans text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                      >
                        <option value="All">All Slopes</option>
                        {Array.from(new Set(destinations.map(d => d.tourismType).filter(Boolean))).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sorting selectors */}
                    <div className="relative inline-block shrink-0">
                      <select 
                        value={destBrowseSort}
                        onChange={(e) => setDestBrowseSort(e.target.value as any)}
                        className="appearance-none font-sans text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                      >
                        <option value="name">A-Z Alphabetical</option>
                        <option value="newest">Newest Discovery</option>
                        <option value="views">Most Viewed Clickrate</option>
                        <option value="trending">Highest Trending Signal</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Listing Stage (Grid vs List layout mapping) */}
                {(() => {
                  // Compile processed matching list
                  let list = [...destinations];

                  // filter search query
                  if (destSearchQuery.trim()) {
                    const qStr = destSearchQuery.toLowerCase();
                    list = list.filter(d => 
                      d.name.toLowerCase().includes(qStr) || 
                      d.description.toLowerCase().includes(qStr) ||
                      d.tourismType.toLowerCase().includes(qStr)
                    );
                  }

                  // filter theme type
                  if (destTypeFilter !== 'All') {
                    list = list.filter(d => d.tourismType === destTypeFilter);
                  }

                  // Sorting rules
                  if (destBrowseSort === 'name') {
                    list.sort((a, b) => a.name.localeCompare(b.name));
                  } else if (destBrowseSort === 'newest') {
                    list.sort((a: any, b: any) => {
                      if (a.createdAt && b.createdAt) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      }
                      return destinations.indexOf(b) - destinations.indexOf(a);
                    });
                  } else if (destBrowseSort === 'views') {
                    list.sort((a, b) => (destinationStats[b.id] || 0) - (destinationStats[a.id] || 0));
                  } else if (destBrowseSort === 'trending') {
                    list.sort((a, b) => {
                      const scoreA = (destinationStats[a.id] || 0) + (likes.filter(l => l.contentId === a.id).length * 4);
                      const scoreB = (destinationStats[b.id] || 0) + (likes.filter(l => l.contentId === b.id).length * 4);
                      return scoreB - scoreA;
                    });
                  }

                  // Pagination parameters
                  const SIZE = 6;
                  const total = Math.ceil(list.length / SIZE) || 1;
                  const activePage = Math.min(destBrowsePage, total);
                  const items = list.slice((activePage - 1) * SIZE, activePage * SIZE);

                  if (items.length === 0) {
                    return (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6">
                        <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                        <h4 className="font-bold text-slate-800 dark:text-white text-base">No Coordinated Logs Detected</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2.5">
                          We didn't locate destinations that matched the selection filters. Try resetting the criteria or typing a different search query.
                        </p>
                        <button 
                          onClick={() => {
                            setDestSearchQuery('');
                            setDestTypeFilter('All');
                            setDestBrowseSort('name');
                          }}
                          className="mt-5 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-350 cursor-pointer"
                        >
                          Clear Active Filters
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-8">
                      {/* Grid Mode Mapping */}
                      {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                          {items.map(dest => {
                            const lCount = likes.filter(l => l.contentId === dest.id).length;
                            const hCount = homestays.filter(h => h.destinationId === dest.id && h.status !== 'Rejected').length;
                            const aCount = attractions.filter(a => a.destinationId === dest.id).length;
                            
                            return (
                              <div 
                                key={dest.id} 
                                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xs border border-slate-205 dark:border-slate-800 flex flex-col h-full hover:scale-[1.01] transition-transform group"
                              >
                                <div className="h-52 bg-slate-100 dark:bg-slate-950 relative overflow-hidden shrink-0">
                                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent pointer-events-none" />
                                  
                                  {/* Overlay Buttons */}
                                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLike(dest.id, 'destination');
                                      }}
                                      className="bg-white/95 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition hover:scale-105 cursor-pointer flex items-center justify-center border border-slate-200"
                                    >
                                      <Heart className={`w-3 h-3 ${user && likes.some(l => l.id === `${user.uid}_${dest.id}`) ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                                      <span className="text-[9px] font-bold ml-0.5 text-slate-800">{lCount}</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const shareUrl = `${window.location.origin}/destination/${encodeURIComponent(dest.id)}`;
                                        navigator.clipboard.writeText(shareUrl);
                                        setNotification({
                                          type: 'success',
                                          message: `🔗 Copied direct lane coordinates! Share with friends.`
                                        });
                                      }}
                                      className="bg-white/95 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition hover:scale-105 cursor-pointer flex items-center justify-center border border-slate-200"
                                      title="Copy link"
                                    >
                                      <Share2 className="w-3 h-3 text-slate-650" />
                                    </button>
                                  </div>

                                  <span className="absolute bottom-3 left-3 bg-white/95 text-slate-800 font-bold text-[9px] py-0.5 px-2.5 rounded-full tracking-widest uppercase">
                                    🏕️ {dest.tourismType}
                                  </span>
                                </div>

                                <div className="p-5 flex-grow flex flex-col justify-between">
                                  <div>
                                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1.5">{dest.name}</h3>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-3">Best: {dest.bestSeason}</p>
                                    <p className="text-slate-650 dark:text-slate-350 text-xs leading-relaxed line-clamp-3">{dest.description}</p>
                                  </div>

                                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-mono text-[10px] text-slate-500">
                                    <span>🧭 {aCount} Attraction spots</span>
                                    <span>🏡 {hCount} Homestays</span>
                                  </div>

                                  <button 
                                    onClick={() => navigate(`#/destination/${dest.id}`)}
                                    className="mt-4 w-full bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-center text-xs cursor-pointer transition-all flex items-center justify-center gap-1"
                                  >
                                    Explore Destination Guide <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* List Mode Mapping */
                        <div className="space-y-4">
                          {items.map(dest => {
                            const lCount = likes.filter(l => l.contentId === dest.id).length;
                            const hCount = homestays.filter(h => h.destinationId === dest.id && h.status !== 'Rejected').length;
                            const aCount = attractions.filter(a => a.destinationId === dest.id).length;

                            return (
                              <div 
                                key={dest.id} 
                                className="bg-white dark:bg-slate-900 border border-slate-201 dark:border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row items-stretch gap-5 hover:border-slate-320 dark:hover:border-slate-700 transition-colors"
                              >
                                <div className="w-full sm:w-44 h-32 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden shrink-0">
                                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-grow flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">{dest.name}</h3>
                                        <span className="inline-block mt-1 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase px-2 py-0.5 rounded">
                                          🏕️ {dest.tourismType}
                                        </span>
                                      </div>
                                      <span className="text-xs font-mono font-bold text-slate-500">
                                        ● {destinationStats[dest.id] || 0} visits
                                      </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed mt-2.5 line-clamp-2">{dest.description}</p>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-505">
                                      <span>Best Season: <strong className="text-emerald-700 dark:text-emerald-400">{dest.bestSeason}</strong></span>
                                      <span>🧭 {aCount} spots</span>
                                      <span>🏡 {hCount} lodging options</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => toggleLike(dest.id, 'destination')}
                                        className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
                                      >
                                        <Heart className={`w-3.5 h-3.5 ${user && likes.some(l => l.id === `${user.uid}_${dest.id}`) ? 'fill-red-500 text-red-500' : ''}`} />
                                      </button>
                                      <button 
                                        onClick={() => navigate(`#/destination/${dest.id}`)}
                                        className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg cursor-pointer"
                                      >
                                        Explore Guide
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Pagination Controls */}
                      {total > 1 && (
                        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-full">
                          <p className="text-xs text-slate-405 font-medium font-mono text-center sm:text-left">
                            Showing {(activePage - 1) * SIZE + 1} - {Math.min(activePage * SIZE, list.length)} of {list.length} destinations
                          </p>
                          
                          <div className="flex items-center justify-center gap-1 max-w-full overflow-x-auto py-1 scrollbar-none px-1 flex-nowrap shrink-0">
                            <button 
                              disabled={activePage === 1}
                              onClick={() => setDestBrowsePage(p => Math.max(p - 1, 1))}
                              className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-205 border border-slate-201 dark:border-slate-800 disabled:opacity-40 disabled:pointer-events-none rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors shrink-0"
                            >
                              ← Prev
                            </button>
                            
                            {getPaginationRange(activePage, total).map((pg, idx) => {
                              if (pg === '...') {
                                return (
                                  <span
                                    key={`ellipsis-${idx}`}
                                    className="w-8 h-8 font-bold font-mono text-xs text-slate-400 dark:text-slate-600 flex items-center justify-center select-none"
                                  >
                                    ...
                                  </span>
                                );
                              }
                              return (
                                <button
                                  key={`page-${pg}`}
                                  onClick={() => setDestBrowsePage(pg as number)}
                                  className={`w-8 h-8 rounded-xl font-bold font-mono text-xs cursor-pointer flex items-center justify-center border transition-all shrink-0 ${activePage === pg ? 'bg-slate-900 border-slate-950 text-white' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 border-slate-201 dark:border-slate-805 text-slate-700 dark:text-slate-300'}`}
                                >
                                  {pg}
                                </button>
                              );
                            })}

                            <button 
                              disabled={activePage === total}
                              onClick={() => setDestBrowsePage(p => Math.min(p + 1, total))}
                              className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-205 border border-slate-201 dark:border-slate-800 disabled:opacity-40 disabled:pointer-events-none rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors shrink-0"
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>

            </div>
          </div>
        )}

        {currentPath.startsWith('/destination/') && (
          <div id="destination-detail-view" className="animate-fade-in bg-slate-50 min-h-screen">
            {loading ? (
              <div className="text-center py-24 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-semibold">Gathering local attraction data & homestay files...</p>
              </div>
            ) : activeDestDetail ? (
              <div>
                {/* 1. HERO SECTION */}
                <div className="relative overflow-hidden bg-slate-900 text-white min-h-[360px] md:min-h-[460px] flex items-center justify-center py-16 px-6 text-center">
                  <div className="absolute inset-0 z-0 select-none">
                    <img 
                      src={activeDestDetail.destination.image} 
                      alt={activeDestDetail.destination.name} 
                      className="w-full h-full object-cover opacity-35 object-center scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  </div>
                  
                  {/* Banner Like & Save Buttons Overlay */}
                  <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
                    {/* Public Like Button */}
                    <button
                      id="like-destination-banner-btn"
                      onClick={() => toggleLike(activeDestDetail.destination.id, 'destination')}
                      className={`px-4 py-2.5 rounded-full border shadow-lg font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        user && likes.some(l => l.id === `${user.uid}_${activeDestDetail.destination.id}`)
                          ? 'bg-rose-600 border-rose-700 text-white hover:bg-rose-700'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      <motion.span
                        animate={{ scale: (user && likes.some(l => l.id === `${user.uid}_${activeDestDetail.destination.id}`)) ? [1, 1.4, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart className={`w-4 h-4 ${(user && likes.some(l => l.id === `${user.uid}_${activeDestDetail.destination.id}`)) ? 'fill-white text-white' : 'text-white'}`} />
                      </motion.span>
                      <span>
                        {(user && likes.some(l => l.id === `${user.uid}_${activeDestDetail.destination.id}`)) ? 'Liked' : 'Like'} ({likes.filter(l => l.contentId === activeDestDetail.destination.id).length})
                      </span>
                    </button>

                    {/* Bookmark Save Button */}
                    <button
                      id="save-destination-banner-btn"
                      onClick={() => handleToggleSave(activeDestDetail.destination.id, 'destination')}
                      className={`px-4 py-2.5 rounded-full border shadow-lg font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isItemSaved(activeDestDetail.destination.id)
                          ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-750'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      <motion.span
                        animate={{ scale: isItemSaved(activeDestDetail.destination.id) ? [1, 1.4, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Bookmark className={`w-4 h-4 ${isItemSaved(activeDestDetail.destination.id) ? 'fill-white text-white' : 'text-white'}`} />
                      </motion.span>
                      <span>
                        {isItemSaved(activeDestDetail.destination.id) ? 'Saved' : 'Save'}
                      </span>
                    </button>
                  </div>
                  <div className="relative z-10 max-w-4xl mx-auto space-y-4">
                    <button 
                      onClick={() => navigate('#/destinations')}
                      className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 inline-flex items-center gap-1.5 cursor-pointer transition border border-white/15"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Destinations List
                    </button>
                    
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                      <span className="text-xs font-bold tracking-wider uppercase px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-md">
                        ✨ {activeDestDetail.destination.tourismType}
                      </span>
                      <span className="text-xs font-bold tracking-wider uppercase px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-md">
                        📅 Peak: {activeDestDetail.destination.bestSeason}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mt-2 drop-shadow-md">
                      {activeDestDetail.destination.name}
                    </h1>

                    <p className="text-slate-200 leading-relaxed text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium opacity-90">
                      {activeDestDetail.destination.description}
                    </p>
                  </div>
                </div>

                {/* 2. STICKY QUICK ACTION BAR */}
                <div className="sticky top-[58px] z-30 bg-white/90 backdrop-blur-md border-y border-slate-200 shadow-xs py-3 px-4">
                  <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 overflow-x-auto pb-1 sm:pb-0 [&::-webkit-scrollbar]:none">
                    <button 
                      onClick={() => document.getElementById('attractions-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-4 py-2 shrink-0 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-emerald-100"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Attractions
                    </button>

                    <button 
                      onClick={() => document.getElementById('transit-routes-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-4 py-2 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-150"
                    >
                      🗺️ Find Route
                    </button>

                    <button 
                      onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-4 py-2 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-150"
                    >
                      📸 Gallery
                    </button>

                    <button 
                      onClick={() => document.getElementById('lodging-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-4 py-2 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-150"
                    >
                      🏨 Lodging
                    </button>

                    <button 
                      onClick={() => document.getElementById('transit-routes-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-4 py-2 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-150"
                    >
                      🚗 Transit
                    </button>

                    <button 
                      onClick={() => {
                        setDestCommentsExpanded(true);
                        setTimeout(() => {
                          document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="px-4 py-2 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs border border-slate-150"
                    >
                      💬 Comments Inside
                    </button>
                  </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
                  
                  {/* ABOUT / METRICS HEADER */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-xl text-slate-900">Holidaying Overview</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Explore must visit scenic points, transit schedules, clean homestays, and genuine photos shared by hill adventurers.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {/* Share Button */}
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/destination/${encodeURIComponent(activeDestDetail.destination.id)}`;
                          navigator.clipboard.writeText(shareUrl);
                          setNotification({
                            type: 'success',
                            message: `🔗 Direct link to ${activeDestDetail.destination.name} copied to clipboard! Share it with friends!`
                          });
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        title="Copy details link"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </button>
                    </div>
                  </div>

                  {/* Himalayan AI Local Guide widget */}
                  <AiLocalAdvisor 
                    name={activeDestDetail.destination.name}
                    category={activeDestDetail.destination.tourismType}
                    description={activeDestDetail.destination.description}
                  />

                  {/* 3. MUST-VISIT ATTRACTIONS */}
                  <div id="attractions-section" className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-6 h-6 text-emerald-600" /> 
                          Must-Visit Attractions
                        </h4>
                        <p className="text-xs text-slate-500">Swipe through the high-rated scenic sights of {activeDestDetail.destination.name} region.</p>
                      </div>
                      
                      <button 
                        onClick={() => setDestAttractionsExpanded(!destAttractionsExpanded)}
                        className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-emerald-100"
                      >
                        {destAttractionsExpanded ? 'Show Horizontal Swipe' : 'View All Attractions Grid'}
                        {destAttractionsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {activeDestDetail.attractions.length === 0 ? (
                      <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-500 font-sans text-xs border border-slate-100">
                        No local nature sights identified under this destination yet. 
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Horizontal Swipe Carousel Layout (Default / Compact) */}
                        {!destAttractionsExpanded && (
                          <div className="relative">
                            {/* Horizontal scrollable track with next item peaking */}
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200/50 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                              {activeDestDetail.attractions.map((att: Attraction) => (
                                <div 
                                  key={att.id} 
                                  className="w-[85%] sm:w-[320px] shrink-0 snap-start bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:shadow-sm transition flex flex-col h-full"
                                >
                                  <div className="h-36 bg-slate-200 relative shrink-0">
                                    <img src={att.image} alt={att.name} className="w-full h-full object-cover" />
                                    
                                    {/* Action Buttons Overlay */}
                                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                                      {/* Like */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleLike(att.id, 'attraction');
                                        }}
                                        className="bg-white/95 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition hover:scale-105 active:scale-[0.95] cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                                      >
                                        <Heart 
                                          className={`w-3 h-3 transition-colors ${
                                            user && likes.some(l => l.id === `${user.uid}_${att.id}`)
                                              ? 'fill-red-500 text-red-500'
                                              : 'text-slate-500 hover:text-red-550'
                                          }`}
                                        />
                                        <span className="text-[9px] font-bold text-slate-800">
                                          {likes.filter(l => l.contentId === att.id).length}
                                        </span>
                                      </button>

                                      {/* Direct Review Link */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`#/attraction/${att.id}`);
                                          setTimeout(() => {
                                            document.getElementById(`comments-section-attraction-${att.id}`)?.scrollIntoView({ behavior: 'smooth' });
                                          }, 350);
                                        }}
                                        className="bg-white/95 hover:bg-white text-slate-705 p-1.5 rounded-full shadow-md transition hover:scale-105 active:scale-[0.95] cursor-pointer flex items-center justify-center gap-1 border border-slate-200"
                                      >
                                        <MessageSquare className="w-3 h-3 text-slate-500" />
                                        <span className="text-[9px] font-bold text-slate-800">
                                          {comments.filter(c => c.contentId === att.id && c.contentType === 'attraction').length}
                                        </span>
                                      </button>
                                    </div>

                                    <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">
                                      {att.category}
                                    </span>
                                  </div>

                                  <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div className="space-y-1">
                                      <h5 className="font-bold text-base text-slate-900 truncate">{att.name}</h5>
                                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{att.description}</p>
                                    </div>
                                    <button 
                                      onClick={() => navigate(`#/attraction/${att.id}`)}
                                      className="w-full bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-bold py-2 mt-3 rounded-lg border border-slate-200 cursor-pointer text-center transition"
                                    >
                                      View Attraction Details
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Complete Expanded Grid Layout */}
                        {destAttractionsExpanded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                            {activeDestDetail.attractions.map((att: Attraction) => (
                              <div key={att.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-250 hover:shadow-md transition flex flex-col h-full">
                                <div className="h-44 bg-slate-200 relative">
                                  <img src={att.image} alt={att.name} className="w-full h-full object-cover" />
                                  
                                  {/* Actions Overlay */}
                                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLike(att.id, 'attraction');
                                      }}
                                      className="bg-white/95 hover:bg-white text-slate-700 p-2 rounded-full shadow-md transition hover:scale-105 border border-slate-200 flex items-center"
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${user && likes.some(l => l.id === `${user.uid}_${att.id}`) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                                      <span className="text-[10px] font-bold ml-1">{likes.filter(l => l.contentId === att.id).length}</span>
                                    </button>
                                  </div>

                                  <span className="absolute bottom-2.5 left-2.5 bg-slate-900/85 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-sm">
                                    {att.category}
                                  </span>
                                </div>

                                <div className="p-5 flex-grow flex flex-col justify-between">
                                  <div className="space-y-2">
                                    <h5 className="font-bold text-base text-slate-900">{att.name}</h5>
                                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{att.description}</p>
                                  </div>
                                  <button 
                                    onClick={() => navigate(`#/attraction/${att.id}`)}
                                    className="w-full bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-2.5 mt-4 rounded-xl border border-slate-200 cursor-pointer text-center transition"
                                  >
                                    View Attraction Details
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-center pt-2">
                          <button 
                            onClick={() => navigate('#/attractions')}
                            className="text-xs text-indigo-700 hover:text-indigo-800 font-bold underline cursor-pointer"
                          >
                            Browse All Regional Sights Offline Directory &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. HOSPITALITY / LODGING SECTION */}
                  <div id="lodging-section" className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                          <Home className="w-5 h-5 text-emerald-600" />
                          Regional Lodging & Homestays
                        </h4>
                        <p className="text-xs text-slate-500">Secure clean homestays, rooms, and localized hill guides directly.</p>
                      </div>

                      <button 
                        onClick={() => setDestLodgingExpanded(!destLodgingExpanded)}
                        className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-emerald-100"
                      >
                        {destLodgingExpanded ? 'Show Horizontal Swipe' : 'View All Homestays Expanded'}
                        {destLodgingExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {activeDestDetail.homestays.length === 0 ? (
                      <div className="text-slate-400 text-xs text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                        No homestays currently cataloged in this immediate area.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Swipeable Horizontal View */}
                        {!destLodgingExpanded && (
                          <div className="relative">
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200/50 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                              {activeDestDetail.homestays.map((home: Homestay) => (
                                <div 
                                  key={home.id}
                                  className="w-[80%] sm:w-[300px] shrink-0 snap-start bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-emerald-200 transition-all shadow-2xs"
                                >
                                  <div className="space-y-1">
                                    <h5 className="font-heavy text-base text-slate-900 truncate">{home.name} // Homestay</h5>
                                    <p className="text-emerald-800 text-sm font-black flex items-center gap-1">
                                      <span>₹{home.priceMin} - ₹{home.priceMax}</span>
                                      <span className="text-[10px] text-slate-500 font-medium font-sans">/ day range</span>
                                    </p>
                                    <p className="text-slate-500 text-xs leading-normal mt-2 line-clamp-2">
                                      Fully equipped organic rooms, custom hot baths, and fresh local delicacies.
                                    </p>
                                  </div>

                                  <button 
                                    onClick={() => navigate(`#/homestay/${home.id}`)}
                                    className="w-full bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold py-2.5 mt-4 rounded-xl cursor-pointer text-center transitions shadow-xs"
                                  >
                                    Reserve & Booking Info
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expanded Grid View */}
                        {destLodgingExpanded && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                            {activeDestDetail.homestays.map((home: Homestay) => (
                              <div 
                                key={home.id}
                                className="bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs"
                              >
                                <div className="space-y-2">
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                                    VERIFIED CLEAN STAY
                                  </span>
                                  <h5 className="font-bold text-lg text-slate-900 mt-2">{home.name}</h5>
                                  <p className="text-emerald-700 font-extrabold text-base">
                                    ₹{home.priceMin} - ₹{home.priceMax} <span className="text-xs text-slate-500 font-normal">/ day</span>
                                  </p>
                                  <p className="text-slate-600 text-xs leading-relaxed">
                                    Enjoy home cooked Himalayan cuisine, pristine garden scenery views, and private mountain balconies.
                                  </p>
                                </div>

                                <button 
                                  onClick={() => navigate(`#/homestay/${home.id}`)}
                                  className="w-full bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold py-3 mt-5 rounded-xl cursor-pointer text-center transition shadow-xs"
                                >
                                  Reserve & Booking Info
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 5. TRANSIT & TRANSPORT CONNECTIONS SECTION */}
                  <div id="transit-routes-section" className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-2xl text-slate-900 flex items-center gap-2">
                          🗺️ Popular Transit Connections
                        </h4>
                        <p className="text-xs text-slate-500">Connected hubs, share jeeps, buses and hill-driver transport rates.</p>
                      </div>

                      <button 
                        onClick={() => setDestTransitExpanded(!destTransitExpanded)}
                        className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-emerald-100"
                      >
                        {destTransitExpanded ? 'Show Primary (Initial)' : 'View All Routes (' + activeDestDetail.routes.length + ' found)'}
                        {destTransitExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {activeDestDetail.routes.length === 0 ? (
                      <p className="text-slate-400 text-xs text-center py-6 bg-slate-50 rounded-2xl">No cataloged direct endpoints.</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Slice transit connections on compact mode */}
                        {(destTransitExpanded ? activeDestDetail.routes : activeDestDetail.routes.slice(0, 2)).map((rt: Route) => {
                          const fromH = hubs.find(h => h.id === rt.fromHubId);
                          const toH = hubs.find(h => h.id === rt.toHubId);
                          return (
                            <button
                              key={rt.id}
                              onClick={() => navigate(`#/route/${rt.fromHubId}-to-${rt.toHubId}`)}
                              className="w-full text-left bg-slate-50 hover:bg-emerald-50 p-4 rounded-xl border border-slate-200 text-xs transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer shadow-3xs"
                            >
                              <div className="space-y-1">
                                <span className="font-bold text-sm text-slate-900 block">
                                  {fromH?.name.split(' (')[0]} &mdash;&mdash;&gt; {toH?.name.split(' (')[0]}
                                </span>
                                <span className="text-slate-500 block text-[11px]">
                                  🚗 {rt.type} transport • {rt.path.length} station stops • Route Via {rt.path.slice(0, 3).join(', ')}
                                </span>
                              </div>
                              <div className="shrink-0 text-left sm:text-right">
                                <span className="text-emerald-700 font-extrabold block text-sm sm:text-base">₹{rt.fareMin}+</span>
                                <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Est starting fare</span>
                              </div>
                            </button>
                          );
                        })}
                        
                        {!destTransitExpanded && activeDestDetail.routes.length > 2 && (
                          <div className="text-center pt-2">
                            <button
                              onClick={() => setDestTransitExpanded(true)}
                              className="text-xs text-slate-550 border border-slate-200 hover:bg-slate-50 font-bold py-2 px-4 rounded-full transition inline-block cursor-pointer shadow-3xs"
                            >
                              Show are other {activeDestDetail.routes.length - 2} available paths &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 6. GALERY SECTION & UPLOAD PHOTO SYSTEM */}
                  <div id="gallery-section" className="space-y-4">
                    {/* Integrated dynamic image gallery. Image uploading and permissions are fully embedded inside it natively */}
                    <ImageGallerySystem
                      entityType="destination"
                      entityId={activeDestDetail.destination.id}
                      staticGallery={activeDestDetail.destination.gallery || []}
                      activePhotos={activePhotos}
                      user={user}
                      isAdmin={isAdmin}
                      onLogin={handleUserLogin}
                      onPhotoUploaded={(newPhoto) => {
                        setActivePhotos((prev) => [newPhoto, ...prev]);
                      }}
                      onPhotoUpdated={(updatedPhoto) => {
                        setActivePhotos((prev) => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
                      }}
                      setNotification={setNotification}
                      likes={likes}
                      onToggleLike={toggleLike}
                    />
                  </div>

                  {/* 7. SEND TRAVEL LEAD - HOLIDAY INQUIRY CTA CARD */}
                  <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-lg border border-emerald-900">
                    <div className="absolute top-0 right-0 p-4 opacity-10 select-none">
                      <Compass className="w-48 h-48 text-white rotate-12" />
                    </div>
                    
                    <div className="relative z-10 max-w-2xl space-y-4 text-left">
                      <span className="text-[10px] sm:text-xs bg-emerald-550/30 text-emerald-300 font-extrabold tracking-widest uppercase border border-emerald-500/20 px-3.5 py-1 rounded-full">
                        🌿 LOCAL HOLIDAY ASSISTANCE
                      </span>
                      <h4 className="font-extrabold text-2xl sm:text-4xl leading-tight">
                        Planning a Holiday in {activeDestDetail.destination.name}?
                      </h4>
                      <p className="text-emerald-105 opacity-90 text-xs sm:text-sm leading-relaxed">
                        Skip booking commissions! Connect directly with high-rated clean local organic homestays, verify rates for secure hill drivers, and get a handcrafted itinerary.
                      </p>
                      
                      {/* Interactive benefit dots */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-200 mt-2">
                        <span className="flex items-center gap-1.5">&#10003; 100% Verified Homestay Hosts</span>
                        <span className="flex items-center gap-1.5">&#10003; Screened Hill Jeep Drivers</span>
                        <span className="flex items-center gap-1.5">&#10003; Zero Agency Markups</span>
                        <span className="flex items-center gap-1.5">&#10003; Instant Direct Call Setup</span>
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={() => navigate('#/plan-my-trip')}
                          className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs sm:text-sm py-3 px-8 rounded-xl transition cursor-pointer shadow-md inline-flex items-center justify-center gap-2 hover:scale-[1.01]"
                        >
                          Send Free Itinerary Inquiry Block <ArrowRight className="w-4 h-4 text-emerald-950" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 8. TRAVELER DISCUSSION / COMMENTS PLATFORM */}
                  <div id="comments-section" className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-2xl text-slate-900 flex items-center gap-1.5">
                          <MessageSquare className="w-5 h-5 text-emerald-600" /> 
                          Traveler Discussion board
                        </h4>
                        <p className="text-xs text-slate-500">Read verified reviews, experiences, transport hacks, and questions.</p>
                      </div>

                      <span className="text-xs bg-slate-100 text-slate-705 font-bold px-3 py-1.5 rounded-full border border-slate-200">
                        {comments.filter(c => c.contentId === activeDestDetail.destination.id && c.contentType === 'destination').length} Comments Added
                      </span>
                    </div>

                    {!destCommentsExpanded ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-150 p-4">
                        <p className="text-xs text-slate-505 mb-4">
                          Reviews and traveler responses help keep the guide factual and transparent.
                        </p>
                        <button
                          onClick={() => setDestCommentsExpanded(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                        >
                          💬 Load & View comments Board ({comments.filter(c => c.contentId === activeDestDetail.destination.id && c.contentType === 'destination').length})
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-slide-up">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDestCommentsExpanded(false)}
                            className="text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-250 py-1.5 px-3 rounded-lg border border-slate-200 transition font-medium cursor-pointer"
                          >
                            Collapse Comments Board
                          </button>
                        </div>
                        
                        <CommentsSection
                          contentId={activeDestDetail.destination.id}
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

                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                Destination configuration not ready or not found. 
                <button onClick={() => navigate('#/')} className="font-bold underline text-emerald-600 ml-1">Back</button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            5. ATTRACTIONS LIST VIEW
            ======================================================== */}
        {currentPath === '/attractions' && (() => {
          // Compute Automated Collections on-the-fly from live statistics & metadata
          
          // 1. Attraction of the Day (computes identically for all users on the same day)
          const getDaySpotlight = () => {
            if (attractions.length === 0) return null;
            const today = new Date();
            const dateStr = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
            let hash = 0;
            for (let i = 0; i < dateStr.length; i++) {
              hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % attractions.length;
            return attractions[index];
          };
          const daySpotlight = getDaySpotlight();

          // 2. Hidden Discoveries
          // Priority: isHiddenGem flag, lowest views count, descending product additions
          const hiddenDiscoveriesList = [...attractions]
            .sort((a, b) => {
              const aGem = a.isHiddenGem ? 1 : 0;
              const bGem = b.isHiddenGem ? 1 : 0;
              if (aGem !== bGem) return bGem - aGem;

              const aViews = attractionStats[a.id] || 0;
              const bViews = attractionStats[b.id] || 0;
              if (aViews !== bViews) return aViews - bViews;

              return b.id.localeCompare(a.id);
            })
            .slice(0, 8);

          // 3. Worth the Detour
          // Priority: Engaged (likes/comments exist) but is NOT in the top 25% views (lower traffic overall)
          const topViewedBoundIds = [...attractions]
            .sort((a, b) => (attractionStats[b.id] || 0) - (attractionStats[a.id] || 0))
            .map(x => x.id);

          const worthTheDetourList = [...attractions]
            .filter(a => {
              const topQuarterLimit = Math.ceil(attractions.length * 0.25);
              const isTopTierViewed = topViewedBoundIds.slice(0, topQuarterLimit).includes(a.id);
              return !isTopTierViewed; // Less popular overall
            })
            .sort((a, b) => {
              const aLikes = likes.filter(l => l.contentId === a.id).length;
              const aComments = comments.filter(c => c.contentId === a.id && c.contentType === 'attraction').length;
              const aEngagement = (aLikes * 3) + (aComments * 5);

              const bLikes = likes.filter(l => l.contentId === b.id).length;
              const bComments = comments.filter(c => c.contentId === b.id && c.contentType === 'attraction').length;
              const bEngagement = (bLikes * 3) + (bComments * 5);

              if (bEngagement !== aEngagement) return bEngagement - aEngagement; // High engagement first
              return (attractionStats[a.id] || 0) - (attractionStats[b.id] || 0); // Scenically lower views first
            })
            .slice(0, 8);

          // 4. Recently Added
          const recentlyAddedList = [...attractions]
            .sort((a, b) => b.id.localeCompare(a.id))
            .slice(0, 8);

          // 5. Most Explored Attractions
          // Combination of highest view tally + interaction ratios
          const mostExploredList = [...attractions]
            .sort((a, b) => {
              const aLikes = likes.filter(l => l.contentId === a.id).length;
              const aComments = comments.filter(c => c.contentId === a.id && c.contentType === 'attraction').length;
              const aPowerScore = (attractionStats[a.id] || 0) + (aLikes * 4) + (aComments * 8);

              const bLikes = likes.filter(l => l.contentId === b.id).length;
              const bComments = comments.filter(c => c.contentId === b.id && c.contentType === 'attraction').length;
              const bPowerScore = (attractionStats[b.id] || 0) + (bLikes * 4) + (bComments * 8);

              return bPowerScore - aPowerScore;
            })
            .slice(0, 8);

          // 6. Filtering & Sorting for "Browse All Attractions"
          const filteredBrowseList = attractions
            .filter(a => {
              const matchesFilter = attractionFilter === 'All' || a.category === attractionFilter;
              const matchesSearch = !attractionSearchQuery || 
                a.name.toLowerCase().includes(attractionSearchQuery.toLowerCase()) ||
                a.description.toLowerCase().includes(attractionSearchQuery.toLowerCase()) ||
                a.category.toLowerCase().includes(attractionSearchQuery.toLowerCase());
              return matchesFilter && matchesSearch;
            })
            .sort((a, b) => {
              if (browseSort === 'name') {
                return a.name.localeCompare(b.name);
              }
              if (browseSort === 'newest') {
                return b.id.localeCompare(a.id);
              }
              if (browseSort === 'views') {
                const aViews = attractionStats[a.id] || 0;
                const bViews = attractionStats[b.id] || 0;
                return bViews - aViews;
              }
              if (browseSort === 'explored') {
                const aLikes = likes.filter(l => l.contentId === a.id).length;
                const aComments = comments.filter(c => c.contentId === a.id && c.contentType === 'attraction').length;
                const aScore = (attractionStats[a.id] || 0) + (aLikes * 4) + (aComments * 8);

                const bLikes = likes.filter(l => l.contentId === b.id).length;
                const bComments = comments.filter(c => c.contentId === b.id && c.contentType === 'attraction').length;
                const bScore = (attractionStats[b.id] || 0) + (bLikes * 4) + (bComments * 8);

                return bScore - aScore;
              }
              return 0;
            });

          // Pagination logic
          const pageSize = 8;
          const totalPages = Math.ceil(filteredBrowseList.length / pageSize) || 1;
          const paginatedItems = filteredBrowseList.slice((browsePage - 1) * pageSize, browsePage * pageSize);

          const renderUniversalCard = (item: any, collectionPrefixId: string) => {
            const dest = destinations.find(d => d.id === item.destinationId);
            const viewsCount = attractionStats[item.id] || 0;
            const likesCount = likes.filter(l => l.contentId === item.id).length;
            const commentsCount = comments.filter(c => c.contentId === item.id && c.contentType === 'attraction').length;
            const isLiked = user && likes.some(l => l.id === `${user.uid}_${item.id}`);

            return (
              <div 
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-810 shadow-xs flex flex-col h-[400px] hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition duration-300 snap-start snap-always"
              >
                {/* Card Thumbnail Area with linear overlay */}
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden group/thumb">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                  
                  {/* Action Overlays */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    {/* Share Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const shareUrl = `${window.location.origin}/attraction/${encodeURIComponent(item.id)}`;
                        navigator.clipboard.writeText(shareUrl);
                        setNotification({
                          type: 'success',
                          message: `🔗 Direct link to ${item.name} copied! Share with friends!`
                        });
                      }}
                      className="bg-white/95 hover:bg-white dark:bg-slate-805 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 rounded-full shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer"
                      title="Copy share link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Like Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id, 'attraction');
                      }}
                      className="bg-white/95 hover:bg-white dark:bg-slate-805 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 p-2 rounded-full shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-500 group-hover:text-red-550'}`} />
                      <span className="text-[10px] font-extrabold font-mono text-slate-700 dark:text-slate-300">{likesCount}</span>
                    </button>
                  </div>

                  {/* Badges on Bottom boundaries */}
                  {item.isHiddenGem && (
                    <span className="absolute bottom-3 left-3 bg-teal-500 text-white text-[9px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
                      💎 Hidden Gem
                    </span>
                  )}
                  {!item.isHiddenGem && (
                    <span className="absolute bottom-3 left-3 bg-indigo-500 text-white text-[10px] sm:text-[9px] uppercase font-mono font-extrabold px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Info and Navigation triggers */}
                <div className="p-5 flex-grow flex flex-col justify-between text-left">
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-extrabold uppercase font-mono tracking-widest block">
                      {dest?.name || 'Local Region'} area
                    </span>
                    <h4 className="font-extrabold text-base text-slate-902 dark:text-white line-clamp-1 leading-snug group-hover:text-emerald-600 transition">
                      {item.name}
                    </h4>
                    <p className="text-slate-503 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Mini-Metrics footer section */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold font-mono">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> {viewsCount} Views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> {commentsCount} Chats
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`#/attraction/${item.id}`)}
                    className="w-full mt-4 bg-slate-900 dark:bg-slate-800 text-white font-bold text-center py-2.5 rounded-xl text-xs hover:bg-emerald-600 dark:hover:bg-emerald-600 transition cursor-pointer"
                  >
                    Details & Trails
                  </button>
                </div>
              </div>
            );
          };

          return (
            <div id="attractions-discovery-view" className="space-y-12 pb-24">
              
              {/* STICKY SEARCH & NAVIGATION ROW */}
              <div className="sticky top-[73px] z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-4 border-b border-slate-200/50 dark:border-slate-800/80 transition-colors shadow-xs">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                      <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Discovery Hub</h2>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 font-semibold uppercase tracking-wider">Zero maintenance • Fully automatic curated trails</p>
                    </div>
                  </div>

                  {/* Sticky Search bar with instant floating suggestions */}
                  <div className="relative flex-grow max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={attractionSearchQuery}
                      onChange={(e) => {
                        setAttractionSearchQuery(e.target.value);
                        setBrowsePage(1);
                      }}
                      placeholder="Search cascading waterfalls, monasteries, lakes..."
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white transition duration-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {attractionSearchQuery ? (
                      <button 
                        onClick={() => setAttractionSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold select-none pointer-events-none hidden sm:inline-flex">CTRL+K</span>
                    )}

                    {/* Instant smart dropdown overlay */}
                    {attractionSearchQuery && (
                      <div className="absolute right-0 left-0 top-[52px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl z-55 max-h-[300px] overflow-y-auto p-2.5 space-y-1 animate-fade-in">
                        <div className="text-[9px] font-mono font-extrabold text-slate-400 dark:text-slate-500 px-3.5 py-1.5 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/60 mb-1 flex items-center justify-between">
                          <span>Live matches</span>
                          <span>{filteredBrowseList.length} spots</span>
                        </div>
                        {filteredBrowseList.slice(0, 5).map(item => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setAttractionSearchQuery('');
                              navigate(`#/attraction/${item.id}`);
                            }}
                            className="w-full flex items-center gap-3.5 p-2 hover:bg-emerald-500/5 dark:hover:bg-slate-800 rounded-2xl text-left transition duration-200 group cursor-pointer"
                          >
                            <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                            <div className="min-w-0 flex-grow">
                              <span className="text-xs font-extrabold text-slate-800 dark:text-white block group-hover:text-emerald-505 transition truncate leading-tight">{item.name}</span>
                              <span className="text-[10px] text-slate-450 font-mono block mt-0.5 uppercase tracking-wider">{item.category} • {destinations.find(d => d.id === item.destinationId)?.name || 'Himalayas'} area</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition shrink-0" />
                          </button>
                        ))}
                        {filteredBrowseList.length === 0 && (
                          <div className="py-6 text-center text-xs text-slate-400 font-semibold">No direct destination matches. Try tweaking query.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SPLIT HERO SECTION: ATTRACTION OF THE DAY + SURPRISE ME */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* LEFT: Attraction of the Day (Synchronized Calendar Rotate) */}
                  {daySpotlight && (() => {
                    const dest = destinations.find(d => d.id === daySpotlight.destinationId);
                    const viewsCount = attractionStats[daySpotlight.id] || 0;
                    return (
                      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[420px] shadow-sm border border-slate-800 hover:border-slate-700/80 transition duration-300">
                        {/* Immersive background photo layer */}
                        <div className="absolute inset-0 z-0">
                          <img src={daySpotlight.image} className="w-full h-full object-cover opacity-35 hover:scale-[1.02] transition duration-500" alt={daySpotlight.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        </div>

                        {/* Top Metadata Row */}
                        <div className="z-10 flex items-start justify-between flex-wrap gap-2.5">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/90 text-white font-mono font-extrabold text-[10px] tracking-wider uppercase shadow-xs">
                            <Calendar className="w-3.5 h-3.5 animate-pulse" /> Spot of the Day • Daily Rotation
                          </span>
                          <span className="text-[10px] font-mono bg-white/10 px-2.5 py-1 rounded-sm text-slate-200">
                            ID: {daySpotlight.id}
                          </span>
                        </div>

                        {/* Bottom Info Row */}
                        <div className="z-10 space-y-4 pt-16">
                          <div className="space-y-1.5 text-left">
                            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-emerald-400 block">{dest?.name || 'Local Region'} Area</span>
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">{daySpotlight.name}</h3>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl line-clamp-3">
                              {daySpotlight.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-white/15">
                            <div className="flex items-center gap-4 text-xs font-mono font-semibold text-slate-300">
                              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-emerald-400" /> {viewsCount} Views</span>
                              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-emerald-400" /> {likes.filter(l => l.contentId === daySpotlight.id).length} Likes</span>
                            </div>

                            <button
                              onClick={() => navigate(`#/attraction/${daySpotlight.id}`)}
                              className="px-5 py-2.5 bg-white text-slate-900 hover:bg-emerald-500 hover:text-white text-xs font-black rounded-xl transition duration-300 cursor-pointer flex items-center gap-2 shadow-xs group"
                            >
                              Explore Spot <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* RIGHT: Surprise Me Randomizer card */}
                  {surpriseAttraction && (() => {
                    const dest = destinations.find(d => d.id === surpriseAttraction.destinationId);
                    const viewsCount = attractionStats[surpriseAttraction.id] || 0;
                    return (
                      <div className="bg-white dark:bg-slate-905 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[420px] shadow-sm transition duration-300">
                        {/* Immersive background photo layer */}
                        <div className="absolute inset-0 z-0">
                          <img src={surpriseAttraction.image} className="w-full h-full object-cover opacity-15 dark:opacity-20 hover:scale-[1.02] transition duration-500" alt={surpriseAttraction.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-white/80 dark:via-slate-950/60 to-transparent" />
                        </div>

                        {/* Top Metadata Row */}
                        <div className="z-10 flex items-start justify-between flex-wrap gap-2.5">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono font-extrabold text-[10px] tracking-wider uppercase">
                            <Shuffle className="w-3.5 h-3.5 text-indigo-500" /> 🎲 Surprise Me generator
                          </span>
                          
                          {/* Spin button to flip to another */}
                          <button
                            onClick={() => {
                              const remaining = attractions.filter(a => a.id !== surpriseAttraction.id);
                              if (remaining.length > 0) {
                                const idx = Math.floor(Math.random() * remaining.length);
                                setSurpriseAttraction(remaining[idx]);
                              }
                            }}
                            className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-805 dark:text-white border border-slate-250 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" /> Spin Spot
                          </button>
                        </div>

                        {/* Bottom Info Row */}
                        <div className="z-10 space-y-4 pt-16 text-left">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400 block">{dest?.name || 'Local Region'} Area</span>
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">{surpriseAttraction.name}</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl line-clamp-3">
                              {surpriseAttraction.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-4 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-indigo-500" /> {viewsCount} Views</span>
                              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-indigo-500" /> {likes.filter(l => l.contentId === surpriseAttraction.id).length} Likes</span>
                            </div>

                            <button
                              onClick={() => navigate(`#/attraction/${surpriseAttraction.id}`)}
                              className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-black rounded-xl transition duration-300 cursor-pointer flex items-center gap-2 shadow-xs group"
                            >
                              Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>

              {/* 1. ✨ HIDDEN DISCOVERIES CAROUSEL */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100/10 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-500" /> ✨ Hidden Discoveries
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">Lesser-known peaks and spiritual loops with lower overall page view traffic</p>
                  </div>
                  
                  {/* Left-Right Carousel Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => scrollCarousel('carousel-hidden', 'left')}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel('carousel-hidden', 'right')}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Horizontal track featuring a trailing next card to prompt swipes */}
                <div 
                  id="carousel-hidden"
                  className="flex gap-4 overflow-x-auto pb-4 pt-4 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
                >
                  {hiddenDiscoveriesList.map(item => (
                    <div key={item.id} className="w-[85%] sm:w-[48%] md:w-[31%] lg:w-[23.5%] shrink-0 snap-start snap-always">
                      {renderUniversalCard(item, 'hidden-gem')}
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. 🔥 WORTH THE DETOUR CAROUSEL */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100/10 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500" /> 🔥 Worth the Detour
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">Locations receiving solid comment feedback despite overall lighter visitor numbers</p>
                  </div>
                  
                  {/* Left-Right Carousel Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => scrollCarousel('carousel-detour', 'left')}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel('carousel-detour', 'right')}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Horizontal peaking track */}
                <div 
                  id="carousel-detour"
                  className="flex gap-4 overflow-x-auto pb-4 pt-4 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
                >
                  {worthTheDetourList.map(item => (
                    <div key={item.id} className="w-[85%] sm:w-[48%] md:w-[31%] lg:w-[23.5%] shrink-0 snap-start snap-always">
                      {renderUniversalCard(item, 'detour-spot')}
                    </div>
                  ))}
                  {worthTheDetourList.length === 0 && (
                    <div className="w-full text-center py-10 text-xs text-slate-405 font-medium">Accumulating user analytics parameters. Check back shortly.</div>
                  )}
                </div>
              </div>

              {/* 3. 📍 RECENTLY ADDED */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100/10 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-505" /> 📍 Recently Added
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">Fresh mountain viewpoints and trails discovered and added by our local guides</p>
                  </div>
                  
                  {/* Left-Right Carousel Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => scrollCarousel('carousel-recent', 'left')}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel('carousel-recent', 'right')}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Horizontal peaking track */}
                <div 
                  id="carousel-recent"
                  className="flex gap-4 overflow-x-auto pb-4 pt-4 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
                >
                  {recentlyAddedList.map(item => (
                    <div key={item.id} className="w-[85%] sm:w-[48%] md:w-[31%] lg:w-[23.5%] shrink-0 snap-start snap-always">
                      {renderUniversalCard(item, 'recent-spot')}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. 🏆 MOST EXPLORED */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100/10 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" /> 🏆 Most Explored Attractions
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">Top-trending locations seeing major interactive clicks, views, and discussion records</p>
                  </div>
                  
                  {/* Left-Right Carousel Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => scrollCarousel('carousel-explored', 'left')}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel('carousel-explored', 'right')}
                      className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-300 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Horizontal peaking track */}
                <div 
                  id="carousel-explored"
                  className="flex gap-4 overflow-x-auto pb-4 pt-4 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
                >
                  {mostExploredList.map(item => (
                    <div key={item.id} className="w-[85%] sm:w-[48%] md:w-[31%] lg:w-[23.5%] shrink-0 snap-start snap-always">
                      {renderUniversalCard(item, 'explored-spot')}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. BROWSE ALL ATTRACTIONS SECTION */}
              <div id="browse-all-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-8">
                
                {/* Section Header + Sorting Controls row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                       All Attractions Directory
                    </h3>
                    <p className="text-xs text-slate-450 mt-1">Full indexable roster of viewpoints, water courses, and sanctuaries across the Himalayan chains</p>
                  </div>

                  {/* Filter elements & Sorting Dropdowns */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">Sort:</span>
                      <select
                        value={browseSort}
                        onChange={(e: any) => {
                          setBrowseSort(e.target.value);
                          setBrowsePage(1);
                        }}
                        className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                      >
                        <option value="name" className="bg-white dark:bg-slate-900">A - Z Alphabetical</option>
                        <option value="newest" className="bg-white dark:bg-slate-900">Newest Additions</option>
                        <option value="views" className="bg-white dark:bg-slate-900">Most Viewed</option>
                        <option value="explored" className="bg-white dark:bg-slate-900">Most Explored</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Categories Tab selectors */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={() => {
                      setAttractionFilter('All');
                      setBrowsePage(1);
                    }}
                    className={`px-4 py-2 shrink-0 rounded-full text-xs font-extrabold tracking-wide transition duration-200 cursor-pointer ${
                      attractionFilter === 'All' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/10 dark:text-slate-350 dark:hover:bg-slate-800'
                    }`}
                  >
                    All Types
                  </button>
                  {attractionCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setAttractionFilter(cat);
                        setBrowsePage(1);
                      }}
                      className={`px-4 py-2 shrink-0 rounded-full text-xs font-extrabold tracking-wide transition duration-200 cursor-pointer ${
                        attractionFilter === cat 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-805 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat}s
                    </button>
                  ))}
                  <div className="text-xs font-mono text-slate-400 font-extrabold uppercase tracking-widest pl-4 hidden md:inline ml-auto">
                    ({filteredBrowseList.length} spots matched)
                  </div>
                </div>

                {/* Directory Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                  {paginatedItems.map(item => renderUniversalCard(item, 'dir-spot'))}
                  
                  {paginatedItems.length === 0 && (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center py-20 bg-slate-50 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-250 dark:border-slate-800">
                      <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-spin duration-300" />
                      <p className="text-slate-505 dark:text-slate-400 font-bold text-sm">No sights match structural constraints.</p>
                      <button 
                        onClick={() => {
                          setAttractionFilter('All');
                          setAttractionSearchQuery('');
                          setBrowsePage(1);
                        }} 
                        className="mt-3 text-xs bg-slate-900 text-white dark:bg-slate-850 px-4 py-2 rounded-xl font-bold cursor-pointer transition hover:bg-emerald-600"
                      >
                        Reset Filtration Queries
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination Navigation Controller */}
                {totalPages > 1 && (
                  <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-full">
                    <p className="text-xs text-slate-405 font-medium font-mono text-center sm:text-left">
                      Showing {(browsePage - 1) * pageSize + 1} - {Math.min(browsePage * pageSize, filteredBrowseList.length)} of {filteredBrowseList.length} spots
                    </p>

                    <div className="flex items-center justify-center gap-1 max-w-full overflow-x-auto py-1 scrollbar-none px-1 flex-nowrap shrink-0">
                      <button
                        onClick={() => setBrowsePage(p => Math.max(1, p - 1))}
                        disabled={browsePage === 1}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold font-mono transition duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
                          browsePage === 1 
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed dark:border-slate-800' 
                            : 'text-slate-700 bg-white border-slate-205 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>

                      {getPaginationRange(browsePage, totalPages).map((pNum, idx) => {
                        if (pNum === '...') {
                          return (
                            <span 
                              key={`ellipsis-${idx}`}
                              className="w-9 h-9 text-xs font-bold font-mono text-slate-400 dark:text-slate-600 flex items-center justify-center select-none"
                            >
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={`page-${pNum}`}
                            onClick={() => setBrowsePage(pNum as number)}
                            className={`w-9 h-9 text-xs font-black font-mono rounded-xl transition duration-200 cursor-pointer shrink-0 ${
                              browsePage === pNum 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setBrowsePage(p => Math.min(totalPages, p + 1))}
                        disabled={browsePage === totalPages}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold font-mono transition duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
                          browsePage === totalPages 
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed dark:border-slate-800' 
                            : 'text-slate-700 bg-white border-slate-205 hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-900 dark:border-slate-800'
                        }`}
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          );
        })()}

        {currentPath.startsWith('/attraction/') && (
          <div id="attraction-detail-view" className="animate-fade-in text-slate-700 bg-slate-50/30 dark:bg-slate-950/20">
            {loading ? (
              <div className="text-center py-24 flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-semibold text-sm">Gathering travel guides & lodgings coordinates...</p>
              </div>
            ) : activeAttrDetail ? (
              <div>
                
                {/* 1. Hero Section */}
                <div id="hero-section" className="relative bg-slate-900 h-[380px] sm:h-[450px] md:h-[500px] text-white flex flex-col justify-end overflow-hidden">
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={activeAttrDetail.attraction.image} 
                      alt={activeAttrDetail.attraction.name} 
                      className="w-full h-full object-cover opacity-35 object-center scale-105 transition-transform duration-700 ease-out hover:scale-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
                  </div>
                  
                  {/* Banner Like & Save Buttons Overlay */}
                  <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
                    {/* Public Like Button */}
                    <button
                      id="like-attraction-banner-btn"
                      onClick={() => toggleLike(activeAttrDetail.attraction.id, 'attraction')}
                      className={`px-4 py-2.5 rounded-full border shadow-lg font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        user && likes.some(l => l.id === `${user.uid}_${activeAttrDetail.attraction.id}`)
                          ? 'bg-rose-600 border-rose-700 text-white hover:bg-rose-700'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      <motion.span
                        animate={{ scale: (user && likes.some(l => l.id === `${user.uid}_${activeAttrDetail.attraction.id}`)) ? [1, 1.4, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Heart className={`w-4 h-4 ${(user && likes.some(l => l.id === `${user.uid}_${activeAttrDetail.attraction.id}`)) ? 'fill-white text-white' : 'text-white'}`} />
                      </motion.span>
                      <span>
                        {(user && likes.some(l => l.id === `${user.uid}_${activeAttrDetail.attraction.id}`)) ? 'Liked' : 'Like'} ({likes.filter(l => l.contentId === activeAttrDetail.attraction.id).length})
                      </span>
                    </button>

                    {/* Bookmark Save Button */}
                    <button
                      id="save-attraction-banner-btn"
                      onClick={() => handleToggleSave(activeAttrDetail.attraction.id, 'attraction')}
                      className={`px-4 py-2.5 rounded-full border shadow-lg font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isItemSaved(activeAttrDetail.attraction.id)
                          ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-750'
                          : 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      <motion.span
                        animate={{ scale: isItemSaved(activeAttrDetail.attraction.id) ? [1, 1.4, 1] : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Bookmark className={`w-4 h-4 ${isItemSaved(activeAttrDetail.attraction.id) ? 'fill-white text-white' : 'text-white'}`} />
                      </motion.span>
                      <span>
                        {isItemSaved(activeAttrDetail.attraction.id) ? 'Saved' : 'Save'}
                      </span>
                    </button>
                  </div>
                  
                  <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 md:pb-14 flex flex-col items-start gap-4">
                    <button 
                      onClick={() => navigate('#/attractions')}
                      className="text-white bg-white/10 hover:bg-white/20 border border-white/15 text-xs px-4 py-2 rounded-full font-sans cursor-pointer transition flex items-center gap-1.5 backdrop-blur-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Attractions
                    </button>
                    
                    <div className="space-y-2 max-w-3xl text-left">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-emerald-300 font-extrabold bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        <Compass className="w-3 h-3 text-emerald-400" /> {activeAttrDetail.attraction.category} Spot
                      </span>
                      
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                        {activeAttrDetail.attraction.name}
                      </h1>
                      
                      <p className="text-sm sm:text-base text-slate-300 flex items-center gap-1.5 mt-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Located close to: </span>
                        <span 
                          className="font-bold underline cursor-pointer hover:text-white transition" 
                          onClick={() => navigate(`#/destination/${activeAttrDetail.destination?.id}`)}
                        >
                          {activeAttrDetail.destination ? activeAttrDetail.destination.name : 'Scenic Base'}
                        </span>
                      </p>
                      
                      <p className="text-xs sm:text-sm text-slate-400 font-medium italic mt-2 opacity-90 leading-relaxed">
                        "Experience the pristine beauty of {activeAttrDetail.attraction.name}, a cozy {activeAttrDetail.attraction.category.toLowerCase()} nesting quietly in the {activeAttrDetail.destination?.name || 'Himalayan'} landscape."
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Floating Quick Action Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-2 sm:p-3 flex flex-wrap sm:flex-nowrap items-center justify-around gap-1 md:gap-3 max-w-4xl mx-auto">
                    
                    <button 
                      onClick={() => document.getElementById('route-planner-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="flex-1 min-w-[70px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <Compass className="w-4 h-4 md:w-4.5 md:h-4.5 text-emerald-500" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-tight">Find Route</span>
                    </button>
                    
                    <button 
                      onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="flex-1 min-w-[70px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4 md:w-4.5 md:h-4.5 text-emerald-500" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-tight">Gallery</span>
                    </button>
                    
                    <button 
                      onClick={() => document.getElementById('lodgings-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="flex-1 min-w-[70px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <Home className="w-4 h-4 md:w-4.5 md:h-4.5 text-emerald-500" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-tight">Nearby Stay</span>
                    </button>
                    
                    <button 
                      onClick={() => document.getElementById('nearby-attractions-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="flex-1 min-w-[70px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 md:w-4.5 md:h-4.5 text-emerald-500" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-tight">Nearby Spots</span>
                    </button>
                    
                    <button 
                      onClick={() => document.getElementById('comments-section-accordion')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                      className="flex-1 min-w-[70px] sm:min-w-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-1 rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 md:w-4.5 md:h-4.5 text-emerald-500" />
                      <span className="text-[10px] sm:text-xs font-bold tracking-tight">Comments</span>
                    </button>
                    
                  </div>
                </div>

                {/* Main Content Grid Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left & Middle Column (Primary Information & Interactive Widgets) */}
                    <div className="lg:col-span-2 space-y-8">
                      
                      {/* 3. Attraction Overview Component */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left">
                        <div className="flex justify-between items-start flex-wrap gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div>
                            <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white">Attraction Synopsis</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5 font-bold font-mono">Territorially cached coordinates</p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Share button */}
                            <button
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/#/attraction/${encodeURIComponent(activeAttrDetail.attraction.id)}`;
                                navigator.clipboard.writeText(shareUrl);
                                setNotification({
                                  type: 'success',
                                  message: `🔗 Direct link to ${activeAttrDetail.attraction.name} copied to clipboard!`
                                });
                              }}
                              className="px-3.5 py-1.5 rounded-full border border-slate-205 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-slate-600 dark:text-slate-350 leading-relaxed text-sm md:text-base">
                          {activeAttrDetail.attraction.description}
                        </p>

                        {/* Why Visit & Special Highlights */}
                        {(() => {
                          const categoryData = getCategoryHighlights(activeAttrDetail.attraction.category, activeAttrDetail.attraction.name);
                          return (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-emerald-50/40 dark:bg-emerald-950/10 rounded-2xl p-4 sm:p-5 border border-emerald-500/10 shrink-0">
                                <h4 className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-extrabold text-sm uppercase tracking-wider mb-2 font-sans">
                                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" /> Why Visit?
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                                  {categoryData.whyVisit}
                                </p>
                              </div>
                              
                              <div className="bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl p-4 sm:p-5 border border-slate-200/40 dark:border-slate-850">
                                <h4 className="flex items-center gap-2 text-indigo-805 dark:text-indigo-400 font-extrabold text-sm uppercase tracking-wider mb-2.5 font-sans">
                                  <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" /> Special Highlights
                                </h4>
                                <ul className="space-y-2">
                                  {categoryData.highlights.map((hLine, hIdx) => (
                                    <li key={hIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350">
                                      <Zap className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                                      <span>{hLine}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Himalayan AI Local Guide widget */}
                      <AiLocalAdvisor 
                        name={activeAttrDetail.attraction.name}
                        category={activeAttrDetail.attraction.category}
                        description={activeAttrDetail.attraction.description}
                        destinationName={activeAttrDetail.destination?.name}
                      />

                      {/* 5. Route Information Block */}
                      <div id="route-planner-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                              <Compass className="w-5 h-5 text-emerald-600" /> Route Access Coordinates
                            </h3>
                            <p className="text-xs text-slate-450 mt-0.5 font-mono">Himalayan transit logs and pathfinding terminals</p>
                          </div>
                          
                          <button 
                            onClick={() => navigate('#/plan-my-trip')}
                            className="bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 shadow-sm shadow-emerald-700/10"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Ask Travel Desk
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none mb-1 font-mono">Destination Base Hub</span>
                            <span className="font-extrabold text-slate-900 dark:text-emerald-400 block text-sm sm:text-base">{activeAttrDetail.destination?.name || 'Base Station'}</span>
                            <span className="text-[11px] text-slate-450 block mt-1">Directly accessible via regional mountain routes and private carriers.</span>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none mb-1 font-mono">Principal Railway Hub</span>
                            <span className="font-extrabold text-slate-900 dark:text-emerald-400 block text-sm sm:text-base">
                              {(() => {
                                if (activeAttrDetail.routes && activeAttrDetail.routes.length > 0) {
                                  const r0 = activeAttrDetail.routes[0];
                                  const matchedHub = hubs.find(h => h.id === r0.fromHubId);
                                  return matchedHub?.name || 'New Jalpaiguri (NJP)';
                                }
                                return 'New Jalpaiguri / Siliguri (NJP)';
                              })()}
                            </span>
                            <span className="text-[11px] text-slate-450 block mt-1">Primary railhead access with shared and private taxi options.</span>
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-3 block">Authentic transit runs to base destination:</p>
                        
                        {activeAttrDetail.routes.length === 0 ? (
                          <div className="bg-slate-50 dark:bg-slate-800/20 p-6 rounded-2xl text-slate-400 dark:text-slate-500 text-center text-xs border border-dashed border-slate-205 dark:border-slate-800">
                            No explicit transit coordinates registered for this spot yet. Try looking up generalized routes to {activeAttrDetail.destination?.name} on our pathfinding terminal.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeAttrDetail.routes.map((rt: Route) => {
                              const fH = hubs.find(h => h.id === rt.fromHubId);
                              const tH = hubs.find(h => h.id === rt.toHubId);
                              return (
                                <div key={rt.id} className="bg-slate-50/80 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs transition hover:border-emerald-500/25 hover:bg-white dark:hover:bg-slate-850">
                                  <div className="text-left">
                                    <span className="font-extrabold text-slate-900 dark:text-slate-200 block text-sm sm:text-base flex items-center gap-1.5">
                                      {fH?.name} <ArrowRight className="w-3.5 h-3.5 text-emerald-600" /> {tH?.name}
                                    </span>
                                    <span className="text-slate-450 block mt-1 font-medium leading-normal">
                                      Stops terminal path: {rt.path.join(' ➔ ')}
                                    </span>
                                  </div>
                                  <div className="shrink-0 text-left sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                                    <p className="font-extrabold text-emerald-705 dark:text-emerald-450 text-sm md:text-base">Est. ₹{rt.fareMin} - ₹{rt.fareMax}</p>
                                    <button 
                                      onClick={() => navigate(`#/route/${rt.fromHubId}-to-${rt.toHubId}`)}
                                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-extrabold hover:underline mt-1 cursor-pointer block text-xs whitespace-nowrap"
                                    >
                                      Launch Pathfinding Tracker ➔
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 6. Nearby Attractions Horizontal Swipe Carousel */}
                      <div id="nearby-attractions-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-505" /> Nearby Scenic Spots
                            </h3>
                            <p className="text-xs text-slate-450 mt-0.5 font-mono">Discovered spots in the vicinity of {activeAttrDetail.destination?.name}</p>
                          </div>
                          
                          <button 
                            onClick={() => navigate('#/attractions')}
                            className="text-emerald-600 hover:text-emerald-750 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap hover:underline"
                          >
                            View All <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {(() => {
                          const nearbyList = attractions.filter(a => a.destinationId === activeAttrDetail.attraction.destinationId && a.id !== activeAttrDetail.attraction.id);
                          if (nearbyList.length === 0) {
                            return (
                              <div className="bg-slate-50 dark:bg-slate-800/20 p-6 rounded-2xl text-slate-400 dark:text-slate-500 text-center text-xs border border-slate-100 dark:border-slate-800">
                                No alternative spot guides log under {activeAttrDetail.destination?.name} yet. Explore other destinations for more guides!
                              </div>
                            );
                          }
                          return (
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-205 dark:scrollbar-thumb-slate-800">
                              {nearbyList.map((item) => (
                                <div 
                                  key={item.id} 
                                  className="min-w-[270px] sm:min-w-[310px] snap-start shrink-0 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between group h-full"
                                >
                                  <div className="relative h-40 w-full overflow-hidden shrink-0">
                                    <img 
                                      src={item.image} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white font-extrabold text-[9px] py-1 px-2.5 rounded-full uppercase tracking-wider scale-90 font-mono">
                                      {item.category}
                                    </span>
                                  </div>
                                  <div className="p-4 flex flex-col justify-between flex-grow text-left">
                                    <div>
                                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-4 leading-relaxed font-sans">{item.description}</p>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        navigate(`#/attraction/${encodeURIComponent(item.id)}`);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="w-full bg-slate-900 hover:bg-slate-955 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold text-[11px] py-2.5 rounded-xl cursor-pointer transition uppercase tracking-wider"
                                    >
                                      Explore Spot Details
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* 7. Nearby Homestays / Lodging Horizontal Swipe Carousel */}
                      <div id="lodgings-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                              <Home className="w-5 h-5 text-emerald-600" /> Nearby Recommended Lodgings
                            </h3>
                            <p className="text-xs text-slate-450 mt-0.5 font-mono">Cozy local homes with traditional hospitality & local meals</p>
                          </div>
                          
                          <button 
                            onClick={() => navigate('#/register/homestay')}
                            className="text-emerald-600 hover:text-emerald-750 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap hover:underline"
                          >
                            Add Homestay <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        {activeAttrDetail.homestays.length === 0 ? (
                          <div className="bg-slate-50 dark:bg-slate-800/15 p-6 rounded-2xl text-slate-400 dark:text-slate-500 text-center text-xs border border-slate-100 dark:border-slate-800">
                            No registered local homestays loaded next to this area yet. Submit a Travel Lead to secure comfortable lodgings!
                          </div>
                        ) : (
                          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-205 dark:scrollbar-thumb-slate-800">
                            {activeAttrDetail.homestays.map((hs: Homestay) => (
                              <div 
                                key={hs.id} 
                                className="min-w-[270px] sm:min-w-[310px] snap-start shrink-0 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col justify-between group h-full"
                              >
                                <div className="relative h-40 w-full overflow-hidden shrink-0">
                                  <img 
                                    src={(hs.images && hs.images.find(img => img && img.trim() !== '')) || DEFAULT_HOMESTAY_IMAGE} 
                                    alt={hs.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = DEFAULT_HOMESTAY_IMAGE;
                                    }}
                                  />
                                  <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white font-extrabold text-[9px] py-1 px-2.5 rounded-full uppercase tracking-wider scale-90 font-mono">
                                    🏡 Homestay{(!hs.images || !hs.images.find(i => i && i.trim() !== '')) && ' (Default)'}
                                  </span>
                                </div>
                                <div className="p-4 flex flex-col justify-between flex-grow text-left">
                                  <div>
                                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">{hs.name}</h4>
                                    <div className="flex flex-wrap items-center justify-between gap-1.5 mt-1">
                                      <p className="text-emerald-705 dark:text-emerald-400 text-xs sm:text-sm font-extrabold">₹{hs.priceMin} - ₹{hs.priceMax} <span className="text-slate-400 font-medium font-mono text-[11px]">/ night</span></p>
                                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/45">
                                        🍳 {hs.breakfastIncluded === 'Not Included' ? 'No Bfast' : 'Bfast Incl'}
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1 mt-2.5 mb-4">
                                      {hs.amenities.slice(0, 3).map((amenity, idx) => (
                                        <span key={idx} className="bg-slate-150 dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[10px] px-2 py-0.5 rounded-md font-medium capitalize">
                                          {amenity}
                                        </span>
                                      ))}
                                      {hs.amenities.length > 3 && (
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-bold">
                                          +{hs.amenities.length - 3} More
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => navigate(`#/homestay/${hs.id}`)}
                                    className="w-full bg-slate-900 hover:bg-slate-955 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold text-[11px] py-2.5 rounded-xl cursor-pointer transition uppercase tracking-wider"
                                  >
                                    Explore Stay Log
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 8. Responsive Image Gallery with Upload capability */}
                      <div id="gallery-section" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/60 dark:border-slate-800/80 text-left">
                        <div className="mb-4">
                          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                            <Camera className="w-5 h-5 text-emerald-600" /> Travelers Sightseeing Gallery
                          </h3>
                          <p className="text-xs text-slate-450 mt-0.5 font-mono">Captures published directly by Himalayan wanderers</p>
                        </div>
                        
                        <ImageGallerySystem
                          entityType="attraction"
                          entityId={activeAttrDetail.attraction.id}
                          staticGallery={[]} // Attractions fall back to dynamic uploader galleries
                          activePhotos={activePhotos}
                          user={user}
                          isAdmin={isAdmin}
                          onLogin={handleUserLogin}
                          onPhotoUploaded={(newPhoto) => {
                            setActivePhotos((prev) => [newPhoto, ...prev]);
                          }}
                          onPhotoUpdated={(updatedPhoto) => {
                            setActivePhotos((prev) => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
                          }}
                          setNotification={setNotification}
                          likes={likes}
                          onToggleLike={toggleLike}
                        />
                      </div>

                    </div>

                    {/* Right Column (Sidebar containing facts, travel tips, and plan inquiries form) */}
                    <div className="space-y-8 h-fit lg:sticky lg:top-24">
                      
                      {/* 4. Quick Facts Bento Box */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-200/60 dark:border-slate-800/80 space-y-4 text-left">
                        <div>
                          <h4 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <Info className="w-4.5 h-4.5 text-emerald-600" /> Quick Attraction Facts
                          </h4>
                          <p className="text-[10px] text-slate-450 uppercase mb-2 font-bold font-mono">Pristine geography values</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                          
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase leading-none font-mono">Location Hub</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mt-0.5">{activeAttrDetail.destination?.name || 'Highland Spot'}</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <Compass className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase leading-none font-mono">Special Elevation</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mt-0.5">
                                {activeAttrDetail.attraction.category === 'Trek' ? '7,150 ft (High Ridge)' : activeAttrDetail.attraction.category === 'Viewpoint' ? '6,200 ft (Summit)' : '4,850 ft (Valley Level)'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase leading-none font-mono">Best Season</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mt-0.5">{activeAttrDetail.destination?.bestSeason || 'September - June'}</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase leading-none font-mono">Difficulty Level</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mt-0.5">
                                {activeAttrDetail.attraction.category === 'Trek' ? 'Moderate to Challenging' : 'Easy / Family Friendly'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase leading-none font-mono">Recommended Duration</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mt-0.5">
                                {activeAttrDetail.attraction.category === 'Trek' ? '4 - 6 Hours (Half day)' : '1 - 2 Hours'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <Wallet className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase leading-none font-mono">Entry Access Fee</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mt-0.5">
                                {activeAttrDetail.attraction.category === 'Trek' ? '₹50 (Conservation fee)' : 'Free Entry'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase leading-none font-mono">Facilities Available</span>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block mt-0.5">Tea stalls, viewpoints, resting benches</span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* 9. Travel Tips Section */}
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xs border border-slate-150 dark:border-slate-800/70 space-y-4 text-left">
                        <div>
                          <h4 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4.5 h-4.5 text-amber-550" /> Essential Travel Tips
                          </h4>
                          <p className="text-[10px] text-slate-450 uppercase mb-2 font-bold font-mono">Local mountain knowledge</p>
                        </div>
                        
                        <div className="space-y-3.5 text-xs">
                          <div className="border-l-2 border-emerald-500 pl-3 py-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200">🌤 Recommended Best Hour</p>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 leading-normal">Mornings (7 AM - 11 AM) are optimal before fog rolls in around midday. Sunset hikes require flashlights.</p>
                          </div>
                          
                          <div className="border-l-2 border-slate-400 pl-3 py-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200">🚗 Mountain Road Condition</p>
                            <p className="text-slate-505 dark:text-slate-400 mt-1 leading-normal">Paved but with steep hilly hairpins. Having local professional drives is highly advised over self-driving.</p>
                          </div>
                          
                          <div className="border-l-2 border-slate-400 pl-3 py-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200">🅿 Parking Convenience</p>
                            <p className="text-slate-505 dark:text-slate-400 mt-1 leading-normal">Ample local parking is available at the trail base gate. Nominal fee of ₹20-50 collected by local committee.</p>
                          </div>
                          
                          <div className="border-l-2 border-slate-400 pl-3 py-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200">📶 Network & Cellular Carrier</p>
                            <p className="text-slate-505 dark:text-slate-400 mt-1 leading-normal">Jio and Airtel 4G signals are stable. Expect complete network blindspots inside deep valley gorges.</p>
                          </div>
                          
                          <div className="border-l-2 border-rose-500 pl-3 py-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200">🛡 Vital Safety Notes</p>
                            <p className="text-slate-505 dark:text-slate-400 mt-1 leading-normal">Always stay strictly on marked paths. Avoid steep wet cliff steps during high rain monsoons.</p>
                          </div>
                        </div>
                      </div>

                      {/* 10. Send Travel Lead planning CTA card */}
                      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-indigo-900/60 shadow-xl text-left">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/15 rounded-full blur-2xl mt-12 mr-2 pointer-events-none" />
                        
                        <div className="relative z-10">
                          <Compass className="w-8 h-8 text-emerald-400 mb-3" />
                          <h4 className="font-extrabold text-lg text-white">Need help planning your visit?</h4>
                          <p className="text-slate-350 text-xs mt-1 leading-relaxed">Submit a travel lead enquiry to coordinate bespoke valley homestays, private cabs & complete route itineraries instantly.</p>
                          
                          {attrLeadSuccess ? (
                            <div className="bg-emerald-950/40 border border-emerald-500/25 p-4 rounded-2xl mt-4 text-center animate-fade-in">
                              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                              <p className="text-sm font-extrabold text-emerald-300">Inquiry Registered!</p>
                              <p className="text-[11px] text-slate-300 mt-1 leading-normal">Our regional mountain partner will message you on WhatsApp shortly to fine-tune arrangements.</p>
                              <button 
                                onClick={() => setAttrLeadSuccess(false)}
                                className="text-[10px] text-emerald-400 underline font-extrabold mt-3 hover:text-emerald-300 transition cursor-pointer"
                              >
                                Submit Another Inquiry
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={handleAttractionLeadSubmit} className="space-y-3 mt-4 text-left">
                              <div>
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1 font-mono">Your Full Name *</label>
                                <input 
                                  name="name" 
                                  type="text" 
                                  required 
                                  placeholder="e.g. Priyanjali Sen" 
                                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                                />
                              </div>
                              
                              <div>
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1 font-mono">WhatsApp Mobile *</label>
                                <input 
                                  name="mobile" 
                                  type="tel" 
                                  required 
                                  placeholder="e.g. 9876543210" 
                                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1 font-mono">Travel Date</label>
                                  <input 
                                    name="travelDate" 
                                    type="date" 
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2 md:p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1 font-mono">Inquiry Budget (Est. ₹)</label>
                                  <input 
                                    name="budget" 
                                    type="number" 
                                    required
                                    placeholder="e.g. 12000"
                                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-2 md:p-2.5 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <button 
                                type="submit" 
                                disabled={submittingAttrLead}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 disabled:opacity-50 mt-4 leading-none"
                              >
                                {submittingAttrLead ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting Inquiry...
                                  </>
                                ) : (
                                  <>
                                    Register Planning Lead ➔
                                  </>
                                )}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>

                    </div>
                    
                  </div>
                </div>

                {/* 11. Comments Accordion Section */}
                <div id="comments-section-accordion" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-24 animate-fade-in text-left">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-205 dark:border-slate-800 overflow-hidden">
                    <button 
                      onClick={() => setAttrCommentsExpanded(!attrCommentsExpanded)}
                      className="w-full flex items-center justify-between text-left cursor-pointer group"
                    >
                      <div>
                        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2 group-hover:text-emerald-600 transition">
                          <MessageSquare className="w-5 h-5 text-emerald-600" /> Traveler Discussion Forum
                        </h3>
                        <p className="text-xs text-slate-450 mt-0.5">
                          Read opinions or seek updates from {comments.filter(c => c.contentId === activeAttrDetail.attraction.id && c.contentType === 'attraction').length} registered travelers
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 p-2.5 rounded-xl transition">
                        {attrCommentsExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </button>
                    
                    {attrCommentsExpanded && (
                      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                        <CommentsSection
                          contentId={activeAttrDetail.attraction.id}
                          contentType="attraction"
                          comments={comments}
                          user={user}
                          onAddComment={addCommentAction}
                          onDeleteComment={deleteCommentAction}
                          onLogin={handleUserLogin}
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-24 text-slate-500 bg-white rounded-3xl shadow-xs max-w-xl mx-auto border my-12">
                <Compass className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                <h4 className="font-extrabold text-slate-800 text-lg">Wanderer Coordinates Lost</h4>
                <p className="text-xs text-slate-400 mt-1 px-4 max-w-sm mx-auto">This specific sightseeing attraction cannot be located in the offline or database index. Return to standard search boards.</p>
                <button onClick={() => navigate('#/attractions')} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold font-sans cursor-pointer">
                  Back to Attractions board
                </button>
              </div>
            )}
          </div>
        )}

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
                  const matchesSearch = item.name.toLowerCase().includes(gemSearch.toLowerCase()) || 
                                        item.description.toLowerCase().includes(gemSearch.toLowerCase());
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
                      const detailUrl = item.itemType === 'destination' ? `#/destination/${item.id}` : `#/attraction/${item.id}`;
                      return (
                        <div
                          key={`${item.itemType}-${item.id}`}
                          id={`gem-grid-card-${item.id}`}
                          onClick={() => navigate(detailUrl)}
                          className="bg-white dark:bg-slate-900/85 rounded-2xl overflow-hidden shadow-2xs border border-slate-200/50 dark:border-slate-800/60 hover:shadow-md hover:border-emerald-250 dark:hover:border-emerald-500/30 transition-all duration-300 group flex flex-col h-full cursor-pointer"
                        >
                          <div className="relative h-52 overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
                            <img
                              src={item.image}
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
        {currentPath.startsWith('/homestay/') && (
          <div id="homestay-detail-view" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
            {loading ? (
              <div className="text-center py-24 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                <p className="text-slate-500 font-semibold font-sans animate-pulse">Retrieving price ranges & host credentials...</p>
              </div>
            ) : activeHomeDetail ? (
              <div>
                <button 
                  onClick={() => navigate('#/')}
                  className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 cursor-pointer"
                >
                  ← Home Search
                </button>

                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="h-72 lg:h-full bg-slate-100">
                      <img 
                        src={(activeHomeDetail.homestay.images && activeHomeDetail.homestay.images.find(img => img && img.trim() !== '')) || DEFAULT_HOMESTAY_IMAGE} 
                        alt={activeHomeDetail.homestay.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_HOMESTAY_IMAGE;
                        }}
                      />
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        {activeHomeDetail.homestay.ownerId ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100/60 text-[10px] font-black px-3 py-1 rounded-full uppercase self-start mb-3 inline-flex items-center gap-1">
                            ✨ Verified Partner Managed
                          </span>
                        ) : (
                          <span className="text-slate-600 bg-slate-100 border border-slate-200 text-[10px] font-black px-3 py-1 rounded-full uppercase self-start mb-3 inline-flex items-center gap-1">
                            🏠 HillyTrip Directory Listing
                          </span>
                        )}
                        <div className="flex justify-between items-start flex-wrap gap-4 mb-2">
                          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-left">{activeHomeDetail.homestay.name}</h2>
                          
                          {/* Homestay Save Button */}
                          <button
                            onClick={() => handleToggleSave(activeHomeDetail.homestay.id, 'homestay')}
                            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                              isItemSaved(activeHomeDetail.homestay.id)
                                ? 'bg-red-50 border-red-200 text-red-650 hover:bg-red-100 dark:bg-red-955/20 dark:border-red-900 dark:text-red-400'
                                : 'bg-slate-50 border-slate-205 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <motion.span
                              animate={{ scale: isItemSaved(activeHomeDetail.homestay.id) ? 2 : 1 }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              className="inline-block shrink-0 mx-2"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isItemSaved(activeHomeDetail.homestay.id) ? 'fill-red-500 text-red-500' : 'text-slate-400 shrink-0'}`} />
                            </motion.span>
                            <span>
                              {isItemSaved(activeHomeDetail.homestay.id) ? 'Saved' : 'Save'}
                            </span>
                          </button>
                        </div>
                        
                        {activeHomeDetail.destination && (
                          <button 
                            onClick={() => navigate(`#/destination/${activeHomeDetail.destination.id}`)}
                            className="text-emerald-600 hover:underline font-bold text-xs mt-1 text-left block"
                          >
                            📍 Location: {activeHomeDetail.destination.name} Hub
                          </button>
                        )}

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 my-4 text-center">
                          <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-widest">Base Rate Nightly Range</span>
                          <span className="text-3xl font-extrabold text-emerald-800 font-sans">₹{activeHomeDetail.homestay.priceMin} - ₹{activeHomeDetail.homestay.priceMax}</span>
                          <span className="text-slate-400 text-xs block mt-1">(Exclusive of local organic and mountains dining context)</span>
                        </div>

                        <div className="flex flex-wrap gap-2 my-1 mb-4 justify-start text-left">
                          {activeHomeDetail.homestay.breakfastIncluded === 'Not Included' ? (
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-650 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:bg-slate-800 dark:text-slate-350">
                              🍳 Breakfast Not Included
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-100 dark:bg-amber-950/20 dark:text-amber-305 dark:border-amber-900/40">
                              🍳 Breakfast Included
                            </span>
                          )}

                          {activeHomeDetail.homestay.lunchAvailable && (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-305 dark:border-emerald-900/40">
                              🥗 Lunch Available
                            </span>
                          )}

                          {activeHomeDetail.homestay.dinnerAvailable && (
                            <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 text-xs font-bold px-3 py-1.5 rounded-full border border-sky-100 dark:bg-sky-950/20 dark:text-sky-305 dark:border-sky-900/40">
                              🍗 Dinner Available
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-sm uppercase text-slate-400 tracking-wider mb-2 text-left">Amenities Provided</h4>
                          <div className="flex flex-wrap gap-2">
                            {activeHomeDetail.homestay.amenities.map((am: string, index: number) => (
                              <span key={index} className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-md border border-slate-100">
                                ✓ {am}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-8">
                        <div className="flex gap-4">
                          <a 
                            href={`https://wa.me/${formatWhatsAppNumber(activeHomeDetail.homestay.whatsapp || activeHomeDetail.homestay.contact)}?text=Hello%20HillyTrip%20Host!%20I'm%20inquiring%20about%20booking%20and%20availabilities%2520for%2520${encodeURIComponent(activeHomeDetail.homestay.name)}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-center py-3.5 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs"
                          >
                            <MessageCircle className="w-5 h-5" />
                            WhatsApp Host Securely
                          </a>
                          
                          <button 
                            onClick={() => {
                              setInqName(user?.name || '');
                              setInqEmail(user?.email || '');
                              setInqMobile(user?.mobile || '');
                              setInqMessage(`Hi! I'm interested in booking ${activeHomeDetail.homestay.name}. Can you confirm availability?`);
                              setInquiryModalOpen(true);
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-4 py-3.5 rounded-xl cursor-pointer shadow-xs"
                          >
                            📩 Send Live Inquiry
                          </button>
                        </div>

                        {!activeHomeDetail.homestay.ownerId && (
                          <button
                            onClick={() => {
                              navigate('#/partner-dashboard');
                              setNotification({
                                type: 'success',
                                message: '🔍 Quick claim helper launched! Search for this homestay in the portal.'
                              });
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-extrabold py-3 rounded-xl cursor-pointer border border-slate-700 hover:border-slate-650 shadow-2xs flex items-center justify-center gap-1.5"
                          >
                            🔑 Are you the owner? Claim this Business Listing
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500">Homestay specifications not accessible.</div>
            )}
          </div>
        )}

        {/* ========================================================
            8. PLAN MY TRIP VIEW
            ======================================================== */}
        {currentPath === '/plan-my-trip' && (
          <div id="plan-my-trip-view" className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-b-4 border-emerald-600">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Mobile / WhatsApp Number *</label>
                    <input 
                      name="mobile" 
                      type="tel" 
                      required 
                      placeholder="e.g. 9876543210" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Target Base Destination Hub *</label>
                    <select name="destination" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold">
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Estimated Budget (INR)</label>
                    <input 
                      name="budget" 
                      type="number" 
                      placeholder="e.g. 15000" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Total Passengers</label>
                    <input 
                      name="numTravellers" 
                      type="number" 
                      min="1" 
                      placeholder="2" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"
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
                    <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                      <input type="checkbox" name="svc-planning" className="accent-emerald-600 rounded-sm" /> 
                      Full Customized Daily Itinerary Planning support
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white py-3 rounded-lg shadow-sm font-semibold cursor-pointer text-center"
                >
                  Submit Travel Lead
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================
            9. BOOK A CAR VIEW
            ======================================================== */}
        {currentPath === '/book-car' && (
          <div id="book-car-view" className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border-b-4 border-emerald-600">
              <div className="text-center mb-8">
                <Car className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reserve a Private Pool Car</h2>
                <p className="text-slate-500 text-sm mt-1">Book a certified, safe SUV or hatchback with local hill drivers.</p>
              </div>

              <form id="car-lead-form" onSubmit={handleCarLeadSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Pick-up Hub *</label>
                    <select name="pickup" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold">
                      {hubs.map((h, hIdx) => (
                        <option key={`${h.id}-${hIdx}`} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Drop / Destination *</label>
                    <select name="destination" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold">
                      {hubs.map((h, hIdx) => (
                        <option key={`${h.id}-${hIdx}`} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Departure Date *</label>
                    <input name="travelDate" type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.2 text-sm font-sans" />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">No. of Passengers *</label>
                    <input name="passengers" type="number" min="1" required placeholder="4" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Contact Name *</label>
                    <input name="name" type="text" required placeholder="Suraj Thapa" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Phone / WhatsApp Number- *(No leading '+' / code)</label>
                    <input name="mobile" type="tel" required placeholder="9832049219" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white text-center py-3.5 rounded-xl cursor-pointer"
                >
                  Book Private Hill Vehicle
                </button>
              </form>

              {/* Approved Local Operators roster */}
              <div className="mt-10 border-t pt-8">
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-1.5">
                  <span>🚗 Certified Local Mountain Drivers ({drivers.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">Verify driver profiles, vehicle types, licensing plate codes, and mountain day rates.</p>

                {drivers.length === 0 ? (
                  <div className="bg-slate-50 border p-6 rounded-2xl text-center text-xs text-slate-400">
                    No active drivers are registered for online booking yet. Submissions made via "Register" dropdown will appear hot here once verified.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {drivers.map(drv => (
                      <div key={drv.id} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between transition hover:shadow-md hover:bg-white text-slate-700">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-extrabold text-sm text-slate-800">{drv.name}</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 border border-emerald-250 rounded-full uppercase leading-none">VERIFIED</span>
                          </div>
                          
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-600"><strong className="text-slate-800">Vehicle:</strong> {drv.vehicleName} ({drv.vehicleType})</p>
                            <p className="text-slate-600"><strong className="text-slate-800">License Plate:</strong> <span className="font-mono bg-slate-200/50 px-1 py-0.5 rounded text-[10px]">{drv.vehicleNumber}</span></p>
                            <p className="text-slate-600"><strong className="text-slate-800">Service Area:</strong> {drv.serviceAreas}</p>
                            <p className="text-slate-600"><strong className="text-slate-800">Day Cost:</strong> <span className="text-emerald-700 font-extrabold">₹{drv.pricingPerDay} / day</span></p>
                          </div>
                        </div>

                        <div className="border-t pt-3 mt-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">ID: {drv.id.slice(0, 15)}</span>
                          <a 
                            href={`https://wa.me/${formatWhatsAppNumber(drv.whatsapp || drv.mobile)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            WhatsApp Operator
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
                    <input name="contributorMobile" type="tel" required placeholder="9876543210" className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-sans" />
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
                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-emerald-800">Register Local Organic Homestay</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Homestay Brand Name *</label>
                        <input name="name" type="text" required placeholder="Misty Orchid Lepcha Stay" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Parent Village Destination *</label>
                        <select name="destinationId" className="w-full p-2 text-xs font-semibold bg-slate-50 border rounded-lg">
                          {destinations.map((d, dIdx) => <option key={`add-home-dest-${d.id}-${dIdx}`} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Min Cost / day *</label>
                        <input name="priceMin" type="number" required placeholder="1200" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Max Cost *</label>
                        <input name="priceMax" type="number" required placeholder="2200" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Host Phone *</label>
                        <input name="contact" type="tel" required placeholder="+91987..." className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400">Amenities list (comma separated values)</label>
                      <input name="amenities" type="text" placeholder="Organic Meals, Fireplace, Geyers" className="w-full p-2 text-xs bg-slate-50 border rounded-lg" />
                    </div>
                    {renderContributionUploader('image', 'Scenic Photo')}
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
                                  src={photoUploadedUrl} 
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
                                    src={cont.imageUrl}
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
                            {userNotifications.map((notif) => (
                              <div
                                key={notif.id}
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

        {/* ========================================================
            8.1 UNIFIED MY PROFILE & ROLE SYSTEM
            ======================================================== */}
        {currentPath === '/profile' && (
          <div id="profile-unified-view" className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in text-slate-800 dark:text-slate-100">
            {!user ? (
              /* UNAUTHENTICATED STATE - UNIFIED LOGIN / REGISTRATION */
              <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl mt-6">
                <div className="text-center mb-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">HillyTrip Unified Portal</h2>
                  <p className="text-xs text-slate-450 dark:text-slate-400 mt-1.5 font-medium leading-relaxed text-center">
                    {isSignUp 
                      ? 'Create a unified account to search, register as a business partner or contribute guide notes.' 
                      : 'Please authenticate with email and password to access your traveler profile, workspace, and roles.'
                    }
                  </p>
                </div>

                {/* Form Navigation Switch */}
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      !isSignUp ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs' : 'text-slate-450 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Authenticate Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isSignUp ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs' : 'text-slate-450 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Register New Account
                  </button>
                </div>

                <form onSubmit={isSignUp ? handleProfileRegister : handleProfileLogin} className="space-y-4 text-left">
                  {isSignUp && (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={profileMobile}
                          onChange={(e) => setProfileMobile(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Security Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter safe password"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Retype password to verify"
                        value={profileConfirmPassword}
                        onChange={(e) => setProfileConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 rounded-xl font-bold font-mono text-xs tracking-wider transition shadow cursor-pointer justify-center flex items-center gap-1.5"
                  >
                    {authLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {isSignUp ? 'REGISTER & CREATE ACCOUNT' : 'SECURE SESSION AUTHORIZATION'}
                  </button>
                </form>
              </div>
            ) : (
              /* AUTHENTICATED STATE - ACCOUNT DETAILS AND PROFILE CORES */
              <div className="space-y-6">
                {/* Profile Header Block */}
                <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-800 shadow-xl relative overflow-hidden text-left">
                  <div className="absolute inset-0 opacity-10">
                    <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600 border-2 border-white/20 flex items-center justify-center text-white text-3xl font-black font-mono shrink-0">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-black">{user.name}</h2>
                        <span className="bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                          {user.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs mt-1">Authorized security session email: <strong className="text-emerald-400 font-mono font-bold">{user.email}</strong></p>
                      {user.mobile && <p className="text-slate-450 text-[11px] font-mono mt-0.5">Mobile: {user.mobile}</p>}
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        <span className="text-[10px] text-slate-4/10 dark:text-slate-400 uppercase font-bold tracking-wider font-mono mr-1">Assigned roles:</span>
                        {(user.roles || [user.role || 'traveler']).map(r => (
                          <span key={r} className="bg-white/15 border border-white/10 px-2 py-0.5 rounded text-white font-mono uppercase text-[9px] font-black shrink-0 tracking-wider">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col gap-2 w-full md:w-auto shrink-0 md:items-end">
                    <button
                      onClick={async () => {
                        setAuthLoading(true);
                        try {
                          const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`);
                          const data = await res.json();
                          if (data.success && data.user) {
                            handleSetUser(data.user);
                            setNotification({ type: 'success', message: 'Profile state dynamically synchronized with server.' });
                          } else {
                            setNotification({ type: 'error', message: 'Could not sync details.' });
                          }
                        } catch (e) {
                          setNotification({ type: 'error', message: 'Error querying synchronization.' });
                        } finally {
                          setAuthLoading(false);
                        }
                      }}
                      className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition cursor-pointer font-mono"
                    >
                      🔄 SYNC PROFILE & ROLES
                    </button>
                    <button
                      onClick={handleUserLogout}
                      className="bg-red-950/80 hover:bg-red-900 border border-red-800/50 text-red-100 text-[11px] font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Sign Out Session
                    </button>
                  </div>
                </div>

                {/* Workspace Switcher */}
                {(user.roles && user.roles.length > 1) && (
                  <div className="text-left">
                    <label className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-400 tracking-wider block mb-2 font-mono">Workspace Role selection</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl max-w-lg mb-4 border border-slate-205 dark:border-slate-750">
                      {(user.roles || [user.role || 'traveler']).map(r => {
                        const active = activeRoleTab === r;
                        return (
                          <button
                            key={r}
                            onClick={() => {
                              setActiveRoleTab(r as any);
                              setNotification({ type: 'success', message: `Working dashboard context set to: ${r.toUpperCase()}` });
                            }}
                            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all capitalize cursor-pointer tracking-wider ${
                              active 
                                ? 'bg-white dark:bg-slate-750 text-emerald-800 dark:text-emerald-300 shadow-sm border border-slate-200 dark:border-slate-600' 
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            🎨 {r} Dashboard
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Role Working Area */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 text-left">
                  {/* TRAVELER DASHBOARD WORKSPACE */}
                  {activeRoleTab === 'traveler' && (
                    <div className="space-y-6">
                      {/* Personal Details Editing Card */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                          👤 Personal details card
                        </h4>
                        <form onSubmit={handleUpdateProfileSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-550 block mb-1">Full Name</label>
                            <input
                              type="text"
                              value={editProfileName}
                              onChange={(e) => setEditProfileName(e.target.value)}
                              required
                              className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-550 block mb-1">Contact Mobile Number</label>
                            <input
                              type="tel"
                              value={editProfileMobile}
                              onChange={(e) => setEditProfileMobile(e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-550 block mb-1">Update Password (Optional)</label>
                            <div className="flex gap-2">
                              <input
                                type="password"
                                placeholder="Enter secure new password"
                                value={editProfilePassword}
                                onChange={(e) => setEditProfilePassword(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs text-slate-800 dark:text-white focus:ring-1 focus:ring-emerald-500"
                              />
                              <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase font-bold font-mono px-4 py-2 rounded-xl transition shrink-0 cursor-pointer disabled:bg-slate-400 font-extrabold"
                              >
                                {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Manage Trip & Rental Leads from HillyTrip */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Manage Trip: View trip planning inquiries */}
                        <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                            🗺️ Manage Trip (Trip Planning Inquiries)
                          </h4>
                          {!travelerLeads || travelerLeads.trips.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 italic text-center">You have no active high-altitude trip inquiries submitted yet. Explore destinations to build one!</p>
                          ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                              {travelerLeads.trips.map((trip: any) => (
                                <div key={trip.id} className="p-3 bg-slate-50 dark:bg-slate-905 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-left">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">Hub: {trip.selectedHub || 'Himalayan Base'}</span>
                                    <span className="bg-amber-100/70 text-amber-800 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full capitalize">{trip.leadStatus || 'submitted'}</span>
                                  </div>
                                  <p className="text-slate-500">Destination: {trip.selectedDest || 'Not specified'}</p>
                                  <p className="text-slate-500">Dates: {trip.dates || 'TBD'} | Group: {trip.groupSize || '1'} traveler(s)</p>
                                  {trip.allocatedGuide && <p className="text-emerald-500 font-bold mt-1 text-[11px]">👤 Guide: {trip.allocatedGuide.name} ({trip.allocatedGuide.rating}⭐)</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Manage Rental: View private car or homestay requests */}
                        <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                            🚗 Manage Rental (Private Cab Inquiries)
                          </h4>
                          {!travelerLeads || travelerLeads.cars.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 italic text-center">No luxury driver cab rentals requested yet. Search vehicle fleets to hire!</p>
                          ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                              {travelerLeads.cars.map((car: any) => (
                                <div key={car.id} className="p-3 bg-slate-50 dark:bg-slate-905 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-left">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-800 dark:text-slate-200">Trip: {car.startRegion} ➔ {car.endRegion}</span>
                                    <span className="bg-emerald-100/60 text-emerald-850 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full capitalize">{car.leadStatus || 'submitted'}</span>
                                  </div>
                                  <p className="text-slate-500">Vehicle Category: <span className="capitalize">{car.carCategory || 'any'}</span></p>
                                  <p className="text-slate-500">Duration: {car.totalDays} Day(s) starting {car.startDate}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-150 dark:border-slate-800">
                        <strong className="text-xs text-slate-900 dark:text-white block mb-2 uppercase font-mono tracking-wider">Become a Member</strong>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                          {/* Partner apply cards */}
                        <div className="bg-white dark:bg-slate-855 p-5 rounded-2xl border border-slate-220 dark:border-slate-800 shadow-3xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                                <Home className="w-5 h-5" />
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${
                                user.partnerStatus === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-150' :
                                user.partnerStatus === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-150' :
                                user.partnerStatus === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-150' :
                                'bg-slate-50 text-slate-505 dark:text-slate-405 text-slate-500 dark:text-slate-400'
                              }`}>
                                Status: {user.partnerStatus || 'Not Applied'}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">Partner Program Circle</h4>
                            <p className="text-xs text-slate-505 mt-1 mb-4 leading-relaxed dark:text-slate-405">
                              Onboard your homestay lodging property or mountain driver agency to get verified bookings directly.
                            </p>
                          </div>

                          {(user.partnerStatus === 'none' || !user.partnerStatus || user.partnerStatus === 'rejected') ? (
                            <form onSubmit={handlePartnerApplication} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] uppercase font-black text-slate-405 tracking-wider font-mono">Submit Partner Onboarding registration</span>
                              {user.partnerStatus === 'rejected' && (
                                <p className="text-[10px] text-red-500 italic">Previous application rejected. Re-apply below.</p>
                              )}
                              <input
                                type="text"
                                required
                                placeholder="Business Legal Name (e.g., Kanchenjunga Lodge)"
                                value={applyBusinessName}
                                onChange={(e) => setApplyBusinessName(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs"
                              />
                              <select
                                value={applyBusinessType}
                                onChange={(e) => setApplyBusinessType(e.target.value as any)}
                                className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs text-slate-700 dark:text-slate-250 cursor-pointer"
                              >
                                <option value="homestay">🏡 Homestay Lodging Property</option>
                                <option value="cab">🚗 Luxury Driver/Mountain Fleet Cab</option>
                                <option value="guide">🗺️ Mountain Tour Guide / Sherpa</option>
                              </select>
                              <input
                                type="text"
                                required
                                placeholder="Core operating location (e.g. Darjeeling, Sikkim)"
                                value={applyPartnerLocation}
                                onChange={(e) => setApplyPartnerLocation(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs"
                              />
                              <input
                                type="tel"
                                placeholder="Contact Mobile (Leave blank for registry default)"
                                value={applyPartnerMobile}
                                onChange={(e) => setApplyPartnerMobile(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Identity Card Documents / Licence URL"
                                value={applyPartnerDocs}
                                onChange={(e) => setApplyPartnerDocs(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs"
                              />
                              <button
                                type="submit"
                                disabled={applyPartnerLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-350 text-white font-mono font-bold text-[10px] tracking-wider py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {applyPartnerLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                REGISTER BUSINESS PARTNER NOMINATION
                              </button>
                            </form>
                          ) : user.partnerStatus === 'pending' ? (
                            <div className="bg-amber-100/50 border border-amber-200 p-3.5 rounded-xl mt-3 text-xs text-amber-800">
                              <strong>⏳ Pending verification:</strong> Your application is being reviewed. Our backoffice agents are verifying property license documents. Check again later.
                            </div>
                          ) : (
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 p-3.5 rounded-xl mt-3 text-xs text-emerald-800 dark:text-emerald-400">
                              <strong>✓ Verified Homestay Partner:</strong> Congratulations! Your business profile is approved. Use the Partner Dashboard from your workspace bar to list homestay assets or car details.
                            </div>
                          )}
                        </div>

                        {/* Contributor apply cards */}
                        <div className="bg-white dark:bg-slate-855 p-5 rounded-2xl border border-slate-220 dark:border-slate-800 shadow-3xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                                <Award className="w-5 h-5" />
                              </span>
                              <span className={`text-[10px] font-black uppercase tracking-widest border px-2.5 py-0.5 rounded-full ${
                                user.contributorStatus === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-150' :
                                user.contributorStatus === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-150' :
                                user.contributorStatus === 'rejected' ? 'bg-rose-50 text-rose-850 border-rose-150' :
                                'bg-slate-50 text-slate-505 dark:text-slate-405 text-slate-500 dark:text-slate-400'
                              }`}>
                                Status: {user.contributorStatus || 'Not Applied'}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">Contributor Circle</h4>
                            <p className="text-xs text-slate-505 mt-1 mb-4 leading-relaxed dark:text-slate-405">
                              Share high-altitude mountain hike notes, offbeat routes, and scenic hidden gems with explorers.
                            </p>
                          </div>

                          {(user.contributorStatus === 'none' || !user.contributorStatus || user.contributorStatus === 'rejected') ? (
                            <form onSubmit={handleContributorApplication} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] uppercase font-black text-slate-405 tracking-wider font-mono">Join Contributor Team Request</span>
                              {user.contributorStatus === 'rejected' && (
                                <p className="text-[10px] text-red-500 italic font-mono">Previous enrollment rejected. Submit again below.</p>
                              )}
                              <input
                                type="text"
                                required
                                placeholder="India Mountain Region of Interest (e.g. Sittong, Kalimpong)"
                                value={applyContribRegion}
                                onChange={(e) => setApplyContribRegion(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Your Hiking/Guiding Experience (e.g. 5+ years trek lead)"
                                value={applyContribExperience}
                                onChange={(e) => setApplyContribExperience(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs"
                              />
                              <textarea
                                required
                                placeholder="Why do you want to contribute local guide maps for HillyTrip?"
                                value={applyContribReason}
                                onChange={(e) => setApplyContribReason(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-205 dark:border-slate-755 rounded-xl p-2 text-xs h-16"
                              />
                              <button
                                type="submit"
                                disabled={applyContribLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-350 text-white font-mono font-bold text-[10px] tracking-wider py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {applyContribLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                SUBMIT CONTRIBUTOR REQUEST LINK
                              </button>
                            </form>
                          ) : user.contributorStatus === 'pending' ? (
                            <div className="bg-amber-100/50 border border-amber-200 p-3.5 rounded-xl mt-3 text-xs text-amber-800">
                              <strong>⏳ Pending onboarding:</strong> HillyTrip moderation board is evaluating your mountain guide profile. Approval will be granted within 24 working hours.
                            </div>
                          ) : (
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 p-3.5 rounded-xl mt-3 text-xs text-emerald-800 dark:text-emerald-400">
                              <strong>✓ Onboarded Contributor:</strong> Welcome onboard! Your contribution status is verified. Click "Contribute" in the sidebar to add offbeat hills & trekking maps.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                  {/* PARTNER DASHBOARD WORKSPACE */}
                  {activeRoleTab === 'partner' && (
                    <div className="space-y-6">
                      {/* Manage Homestay Bookings & Traveler Inquiries */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
                            🏡 Manage Homestay Bookings & Traveler Inquiries
                          </h4>
                          <button onClick={fetchPartnerState} className="text-[10px] text-teal-600 font-bold uppercase tracking-wider hover:underline cursor-pointer">
                            🔄 Refresh Inbox
                          </button>
                        </div>
                        {loadingPartnerInquiries ? (
                          <p className="text-xs text-slate-400 italic text-center py-4">Refreshing traveler inbox leads...</p>
                        ) : partnerInquiries.length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 italic text-center text-slate-500">Your properties have no traveler bookings or contact inquiries recorded yet. Make sure your assets are listed!</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {partnerInquiries.map((inq: any) => (
                              <div key={inq.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-left space-y-2">
                                <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-800/30 p-2 rounded-lg">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-850 dark:text-white text-sm">{inq.userName || inq.clientName || 'Anonymous Traveler'}</span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">🏠 {inq.homestayName || 'Local Homestay'}</span>
                                  </div>
                                  <span className="font-mono bg-teal-100 text-teal-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">{inq.inquiryStatus || 'new'}</span>
                                </div>
                                <p className="text-slate-505 dark:text-slate-405">Email: <strong className="text-slate-700 dark:text-slate-200 font-mono">{inq.userEmail || inq.clientEmail || 'N/A'}</strong> | Mobile: <strong className="text-slate-700 dark:text-slate-200 font-mono">{inq.userMobile || inq.clientMobile || 'N/A'}</strong></p>
                                <p className="text-slate-505 dark:text-slate-405 font-mono text-[10px]">Travel headcount: <strong>{inq.numberOfGuests || inq.groupCount || 1} Guests</strong> | Booking date: <strong>{inq.travelDate || inq.stayDates || 'Not scheduled'}</strong></p>
                                {inq.message && (
                                  <div className="bg-slate-100/70 dark:bg-slate-800/60 p-2 rounded-lg text-slate-650 dark:text-slate-300 italic text-[11px] font-sans border border-slate-200/40 dark:border-slate-700/30">
                                    "{inq.message}"
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/50">
                                  <label className="text-[9px] font-black uppercase text-slate-450 mr-1">Update Status:</label>
                                  {['new', 'contacted', 'converted', 'closed'].map((st) => (
                                    <button
                                      key={st}
                                      onClick={async () => {
                                        try {
                                          const res = await fetch(`/api/partner/inquiries/${inq.id}/status`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: st })
                                          });
                                          if (res.ok) {
                                            setNotification({ type: 'success', message: `Lead updated to status: ${st.toUpperCase()}` });
                                            fetchPartnerState();
                                          }
                                        } catch (e) {
                                          setNotification({ type: 'error', message: 'Failed to update lead status.' });
                                        }
                                      }}
                                      className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold capitalize cursor-pointer border transition-colors ${
                                        (inq.inquiryStatus || 'new') === st 
                                          ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold' 
                                          : 'bg-white hover:bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Manage Rental Listings */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
                            🏡 manage rental listings (Active Properties & Driver Fleets)
                          </h4>
                          <button onClick={fetchPartnerState} className="text-[10px] text-teal-600 font-bold uppercase tracking-wider hover:underline cursor-pointer">
                            🔄 Sync Inventory
                          </button>
                        </div>
                        {loadingPartnerListings ? (
                          <p className="text-xs text-slate-400 italic text-center py-4">Refreshing active marketplace catalog...</p>
                        ) : (!partnerListings || (partnerListings.homestays.length === 0 && partnerListings.drivers.length === 0)) ? (
                          <p className="text-xs text-slate-400 py-4 italic text-center text-slate-500">Status: No active property listings or cabs listed on the HillyTrip search indexes. Onboard below!</p>
                        ) : (
                          <div className="space-y-4">
                            {/* Homestays list */}
                            {partnerListings.homestays.length > 0 && (
                              <div>
                                <span className="text-[10px] uppercase font-black tracking-wider text-teal-600 block mb-2 font-mono">Listed Homestay Properties</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {partnerListings.homestays.map((home: any) => (
                                    <div key={home.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                      <div>
                                        <p className="font-bold text-slate-850 dark:text-white">{home.name}</p>
                                        <p className="text-slate-505 mt-0.5">Location: {home.location} | Headcount Limit: {home.maxGuests} guests</p>
                                        <p className="text-emerald-600 font-bold mt-0.5">₹{home.pricePerNight || 1200} per night</p>
                                      </div>
                                      <button
                                        onClick={async () => {
                                          if (confirm(`Remove listing ${home.name}?`)) {
                                            try {
                                              const res = await fetch(`/api/partner/listings/homestay/${home.id}?name=${encodeURIComponent(user.name || '')}&mobile=${encodeURIComponent(user.mobile || '')}`, {
                                                method: 'DELETE'
                                              });
                                              if (res.ok) {
                                                setNotification({ type: 'success', message: 'Homestay listing deleted successfully.' });
                                                fetchPartnerState();
                                              }
                                            } catch (e) {
                                              setNotification({ type: 'error', message: 'Failed to delete listing.' });
                                            }
                                          }
                                        }}
                                        className="bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-rose-600 px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer"
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Drivers list */}
                            {partnerListings.drivers.length > 0 && (
                              <div>
                                <span className="text-[10px] uppercase font-black tracking-wider text-teal-600 block mb-2 font-mono">Listed Mountain Driver Cabs</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {partnerListings.drivers.map((drv: any) => (
                                    <div key={drv.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                      <div>
                                        <p className="font-bold text-slate-850 dark:text-white">{drv.name}</p>
                                        <p className="text-slate-505 mt-0.5">Category: <span className="capitalize">{drv.carCategory || 'any'}</span> | Mobile: {drv.mobile}</p>
                                        <p className="text-slate-505 mt-0.5">Region: {drv.operatingRegion}</p>
                                      </div>
                                      <button
                                        onClick={async () => {
                                          if (confirm(`Remove driver registration ${drv.name}?`)) {
                                            try {
                                              const res = await fetch(`/api/partner/listings/driver/${drv.id}?name=${encodeURIComponent(user.name || '')}&mobile=${encodeURIComponent(user.mobile || '')}`, {
                                                method: 'DELETE'
                                              });
                                              if (res.ok) {
                                                setNotification({ type: 'success', message: 'Driver registration removed successfully.' });
                                                fetchPartnerState();
                                              }
                                            } catch (e) {
                                              setNotification({ type: 'error', message: 'Failed to delete listing.' });
                                            }
                                          }
                                        }}
                                        className="bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-rose-600 px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition cursor-pointer"
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Onboard Assets Forms Block */}
                      <div className="bg-gradient-to-tr from-teal-900 to-emerald-950 text-white rounded-3xl p-6 border border-teal-800 shadow-lg">
                        <h4 className="font-extrabold text-sm flex items-center gap-1.5 mb-1.5 uppercase font-mono tracking-wider text-teal-300">
                          ➕ Onboard New lodging or Vehicle Asset
                        </h4>
                        <p className="text-xs text-emerald-250 mb-4 leading-relaxed">Instantly write your mountain asset to search catalogs so explorers can contact or hire you directly.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Add Homestay */}
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                            <span className="text-[10px] font-black uppercase text-teal-300 font-mono tracking-wider block border-b border-white/10 pb-1.5">Onboard Mountain Homestay</span>
                            <form 
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const fd = new FormData(form);
                                try {
                                  const res = await fetch('/api/register/homestay', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      name: fd.get('name'),
                                      location: fd.get('location'),
                                      ownerName: user.name,
                                      ownerMobile: user.mobile || fd.get('ownerMobile'),
                                      ownerEmail: user.email,
                                      maxGuests: Number(fd.get('maxGuests')),
                                      pricePerNight: Number(fd.get('pricePerNight')) || 1200,
                                      description: fd.get('description')
                                    })
                                  });
                                  if (res.ok) {
                                    setNotification({ type: 'success', message: '🏡 Homestay listed on HillyTrip index! Sync inventory to view.' });
                                    form.reset();
                                    fetchPartnerState();
                                  }
                                } catch (e) {
                                  setNotification({ type: 'error', message: 'Failed to onboard property.' });
                                }
                              }}
                              className="space-y-2.5 text-xs text-left"
                            >
                              <input type="text" name="name" required placeholder="Property Name (e.g., Pineview Retreat)" className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500" />
                              <input type="text" name="location" required placeholder="Exact Location (e.g., Kurseong)" className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500" />
                              <div className="grid grid-cols-2 gap-2">
                                <input type="number" name="pricePerNight" required placeholder="Price / night in ₹" className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500" />
                                <input type="number" name="maxGuests" required placeholder="Max guests" className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500" />
                              </div>
                              <textarea name="description" required placeholder="Homestay beauty, mountain vistas, food service details..." className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 h-16 focus:ring-1 focus:ring-emerald-500"></textarea>
                              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold text-[10px] tracking-wider py-2 rounded-xl transition cursor-pointer font-black">
                                SUBMIT LODGING INDEX
                              </button>
                            </form>
                          </div>

                          {/* Add Driver */}
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                            <span className="text-[10px] font-black uppercase text-teal-300 font-mono tracking-wider block border-b border-white/10 pb-1.5">Add Driver / Private Cab</span>
                            <form 
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const fd = new FormData(form);
                                try {
                                  const res = await fetch('/api/register/driver', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      name: fd.get('name'),
                                      mobile: fd.get('mobile') || user.mobile,
                                      carCategory: fd.get('carCategory'),
                                      operatingRegion: fd.get('operatingRegion')
                                    })
                                  });
                                  if (res.ok) {
                                    setNotification({ type: 'success', message: '🚗 Driver added directly to fleet search registry! Sync inventory to view.' });
                                    form.reset();
                                    fetchPartnerState();
                                  }
                                } catch (e) {
                                  setNotification({ type: 'error', message: 'Failed to onboard driver.' });
                                }
                              }}
                              className="space-y-2.5 text-xs text-left"
                            >
                              <input type="text" name="name" required placeholder="Driver Full Name" className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500" />
                              <input type="tel" name="mobile" required placeholder="Operating Mobile Number" className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500" />
                              <select name="carCategory" className="w-full bg-teal-955 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 cursor-pointer focus:ring-1 focus:ring-emerald-500">
                                <option value="SUV">🚙 SUV / Force Traveler (Heavy Terrain)</option>
                                <option value="Sedan">🚗 Sedan (Comfort Tour)</option>
                                <option value="Hatchback">🚕 Hatchback (Budget Short distance)</option>
                                <option value="Offroad">🚜 4X4 Gypsy Jeep (Extreme passes)</option>
                              </select>
                              <input type="text" name="operatingRegion" required placeholder="Service Range (e.g. Gangtok, Lachen)" className="w-full bg-white/10 border border-white/10 rounded-xl p-2 text-white placeholder-slate-400 focus:ring-1 focus:ring-emerald-500" />
                              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold text-[10px] tracking-wider py-2 rounded-xl transition cursor-pointer font-black">
                                ENROLL FLEET CAB MEMBER
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTRIBUTOR DASHBOARD WORKSPACE */}
                  {activeRoleTab === 'contributor' && (
                    <div className="space-y-6">
                      {/* Points Card */}
                      <div className="bg-gradient-to-tr from-purple-900 to-indigo-950 text-white p-6 rounded-3xl border border-purple-800 flex justify-between items-center shadow-lg">
                        <div>
                          <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] uppercase font-mono font-black tracking-widest px-2.5 py-0.5 rounded-full">
                            Contributor Elite Circles
                          </span>
                          <h3 className="text-xl font-bold flex items-center mt-2.5">
                            🌟 Verified Explorer Points: <strong className="text-yellow-400 ml-1.5 font-mono">{(photoContributions || []).length * 100} Points</strong>
                          </h3>
                          <p className="text-xs text-slate-350 mt-1">Earn 100 points for each high-altitude offbeat route gem or photo validated by the moderation board.</p>
                        </div>
                        <div className="text-center shrink-0">
                          <span className="text-2xl block">🏆</span>
                          <span className="text-[10px] uppercase tracking-wider font-mono font-black text-yellow-505 mt-1 shrink-0 block">Hill-Guide Badge</span>
                        </div>
                      </div>

                      {/* Shared contributions */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                        <strong className="font-extrabold text-sm text-slate-850 dark:text-white block mb-2.5 font-mono uppercase tracking-wider">📸 Your Shared Hill Treasures & Hidden Gems ({(photoContributions || []).length})</strong>
                        {(!photoContributions || photoContributions.length === 0) ? (
                          <div className="border border-spaced border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl p-6 italic text-xs text-slate-400 text-center">
                            No secret offbeat hills or hike routes uploaded to your account yet. Share an unexplored summit draft below!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {photoContributions.map((contrib: any) => (
                              <div key={contrib.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-200/50 dark:border-slate-800 flex items-center gap-3">
                                {contrib.imageUrl && <img src={contrib.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0" referrerPolicy="no-referrer" />}
                                <div className="text-xs text-left truncate">
                                  <p className="font-bold text-slate-800 dark:text-slate-205 truncate">{contrib.title || 'Mountain Peak view'}</p>
                                  <p className="text-slate-505 font-mono text-[10px] mt-0.5 shrink-0 truncate">Zone: {contrib.mappedDestName || 'Unmapped range'}</p>
                                  <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                                    contrib.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-850'
                                  }`}>{contrib.status || 'review'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fast Hidden Gem submit */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs text-left space-y-4">
                        <span className="text-[10px] uppercase font-black text-purple-600 block mb-1 font-mono tracking-wider">Submit New Hidden Gems Draft</span>
                        <p className="text-xs text-slate-500">Provide offbeat transit options, trek steps, home-stay tips, maps or secret locations.</p>
                        
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const fd = new FormData(form);
                            try {
                              const res = await fetch('/api/contribute', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  title: fd.get('title'),
                                  location: fd.get('location'),
                                  description: fd.get('description'),
                                  imageUrl: fd.get('imageUrl') || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600',
                                  uploaderName: user.name,
                                  uploaderEmail: user.email
                                })
                              });
                              if (res.ok) {
                                setNotification({ type: 'success', message: '🎉 Contribution draft published successfully! Moderator review in progress.' });
                                form.reset();
                                fetchUserPhotoData(user);
                              }
                            } catch (e) {
                              setNotification({ type: 'error', message: 'Failed to publish gem.' });
                            }
                          }}
                          className="space-y-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" name="title" required placeholder="Sumptuous Spot Title (e.g., Hidden Sandakphu Glade)" className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-705 text-xs rounded-xl p-2.5 text-slate-805 dark:text-white focus:ring-1 focus:ring-purple-500" />
                            <input type="text" name="location" required placeholder="Hills Region Location (e.g. Kurseong valley)" className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-200 dark:border-slate-705 text-xs rounded-xl p-2.5 text-slate-805 dark:text-white focus:ring-1 focus:ring-purple-500" />
                          </div>
                          <input type="url" name="imageUrl" placeholder="Scenic Landscape Photo URL (Optional)" className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-200 dark:border-slate-705 text-xs rounded-xl p-2.5 text-slate-805 dark:text-white focus:ring-1 focus:ring-purple-500" />
                          <textarea name="description" required placeholder="Describe transit tricks, offbeat hiking trails, local budget guidelines..." className="w-full bg-slate-100 dark:bg-slate-855 border border-slate-200 dark:border-slate-705 text-xs rounded-xl p-2.5 h-20 text-slate-805 dark:text-white focus:ring-1 focus:ring-purple-500" />
                          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-[10px] tracking-wider py-2.5 px-6 rounded-xl transition cursor-pointer font-black border-none">
                            PUBLISH SECRET EXPLORER GEM
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ADMIN DASHBOARD WORKSPACE */}
                  {activeRoleTab === 'admin' && (
                    <div className="space-y-6">
                      {/* Review Applications */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                          🛡️ Pending Onboarding Applications (Admins Review Desk)
                        </h4>
                        
                        <div className="space-y-4 pt-2">
                          {/* Partners application review */}
                          <div>
                            <span className="text-[10px] uppercase font-black text-slate-450 block mb-2 font-mono">Pending Business Partners ({adminPendingPartners.length})</span>
                            {adminPendingPartners.length === 0 ? (
                              <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">No pending business partner applications waiting.</p>
                            ) : (
                              <div className="space-y-2">
                                {adminPendingPartners.map((app: any) => (
                                  <div key={app.id} className="p-3 bg-amber-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-amber-200 dark:border-slate-800 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div>
                                      <p className="font-bold text-slate-900 dark:text-slate-100">{app.businessName} (Category: <span className="capitalize">{app.businessType}</span>)</p>
                                      <p className="text-slate-550 dark:text-slate-400 mt-1">Region: {app.partnerLocation} | Mobile: {app.mobile}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={async () => {
                                          try {
                                            const res = await fetch('/api/admin/resolve-application', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json', 'x-admin-email': user.email, 'x-admin-password': 'admin123' },
                                              body: JSON.stringify({ userId: app.id, type: 'partner', action: 'approve', remarks: 'Auto-approved.' })
                                            });
                                            if (res.ok) {
                                              setNotification({ type: 'success', message: 'Partner application approved!' });
                                              fetchAdminPanelState();
                                            }
                                          } catch (e) {
                                            setNotification({ type: 'error', message: 'Resolving failed.' });
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                                      >
                                        APPROVE
                                      </button>
                                      <button
                                        onClick={async () => {
                                          try {
                                            const res = await fetch('/api/admin/resolve-application', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json', 'x-admin-email': user.email, 'x-admin-password': 'admin123' },
                                              body: JSON.stringify({ userId: app.id, type: 'partner', action: 'reject', remarks: 'Verification documents incomplete.' })
                                            });
                                            if (res.ok) {
                                              setNotification({ type: 'success', message: 'Partner application rejected.' });
                                              fetchAdminPanelState();
                                            }
                                          } catch (e) {
                                            setNotification({ type: 'error', message: 'Resolving failed.' });
                                          }
                                        }}
                                        className="bg-red-650 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                                      >
                                        REJECT
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Contributors review */}
                          <div>
                            <span className="text-[10px] uppercase font-black text-slate-450 block mb-2 font-mono">Pending Contributor Nominations ({adminPendingContributors.length})</span>
                            {adminPendingContributors.length === 0 ? (
                              <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">No pending guide contributor applications.</p>
                            ) : (
                              <div className="space-y-2">
                                {adminPendingContributors.map((app: any) => (
                                  <div key={app.id} className="p-3 bg-purple-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-purple-200 dark:border-purple-950/20 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div>
                                      <p className="font-bold text-slate-900 dark:text-slate-100">{app.name} ({app.email})</p>
                                      <p className="text-slate-550 dark:text-slate-400 mt-0.5">Region interest: {app.contributorRegion} | Experience: {app.contributorExperience}</p>
                                      <p className="text-slate-500 italic mt-1 font-serif">" {app.contributorReason} "</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={async () => {
                                          try {
                                            const res = await fetch('/api/admin/resolve-application', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json', 'x-admin-email': user.email, 'x-admin-password': 'admin123' },
                                              body: JSON.stringify({ userId: app.id, type: 'contributor', action: 'approve', remarks: 'Auto-approved.' })
                                            });
                                            if (res.ok) {
                                              setNotification({ type: 'success', message: 'Contributor nomination verified & approved!' });
                                              fetchAdminPanelState();
                                            }
                                          } catch (e) {
                                            setNotification({ type: 'error', message: 'Resolving failed.' });
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                                      >
                                        APPROVE
                                      </button>
                                      <button
                                        onClick={async () => {
                                          try {
                                            const res = await fetch('/api/admin/resolve-application', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json', 'x-admin-email': user.email, 'x-admin-password': 'admin123' },
                                              body: JSON.stringify({ userId: app.id, type: 'contributor', action: 'reject', remarks: 'Experience requirements not met.' })
                                            });
                                            if (res.ok) {
                                              setNotification({ type: 'success', message: 'Contributor nomination rejected.' });
                                              fetchAdminPanelState();
                                            }
                                          } catch (e) {
                                            setNotification({ type: 'error', message: 'Resolving failed.' });
                                          }
                                        }}
                                        className="bg-red-650 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer"
                                      >
                                        REJECT
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* View & Manage Users table */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                        <strong className="font-extrabold text-sm text-slate-850 dark:text-white block mb-3 font-mono">👥 Unified User Registries Management ({adminUsers.length})</strong>
                        <div className="max-h-[300px] overflow-y-auto overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[9px] font-black tracking-wider">
                                <th className="pb-2">User details</th>
                                <th className="pb-2">Assigned Roles</th>
                                <th className="pb-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {adminUsers.map((u: any) => (
                                <tr key={u.id} className="text-slate-700 dark:text-slate-300">
                                  <td className="py-2.5 pr-2">
                                    <p className="font-bold">{u.name || 'Anonymous User'}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                                  </td>
                                  <td className="py-2.5 pr-2">
                                    <div className="flex flex-wrap gap-1">
                                      {(u.roles || [u.role || 'traveler']).map((r: string) => (
                                        <span key={r} className="bg-slate-100 dark:bg-slate-800 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border dark:border-slate-755">{r}</span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-2.5 pr-2 font-bold font-mono text-[10px]">
                                    <span className={u.status === 'active' ? 'text-emerald-500' : 'text-red-500'}>{u.status || 'active'}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* User Reported Issues section */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2">
                          ⚠️ review User Reported Issues & Flagged Gems
                        </h4>
                        <p className="text-xs text-slate-400 py-3 italic text-center text-slate-500">No reported comments, toxic queries, or navigation error logs currently active. Safe exploration!</p>
                      </div>
                    </div>
                  )}

                  {/* SUPER ADMIN WORKSPACE */}
                  {activeRoleTab === 'super_admin' && (
                    <div className="space-y-6">
                      {/* Create New Admin Accountant */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs text-left">
                        <span className="text-[10px] uppercase font-black text-amber-600 block mb-1 font-mono tracking-wider">Allocate Administrative Authority Profile</span>
                        <p className="text-xs text-slate-500 mb-3">Enforce backoffice privileges and allocate real-time roles. Admins cannot be created via public sign-up forums.</p>
                        
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const fd = new FormData(form);
                            try {
                              const res = await fetch('/api/admin/users', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'x-admin-email': user.email, 'x-admin-password': 'admin123' },
                                body: JSON.stringify({
                                  email: fd.get('email'),
                                  name: fd.get('name'),
                                  roles: ['traveler', fd.get('assignedRole')],
                                  status: 'active',
                                  password: fd.get('password') || 'adminPass123',
                                  emailVerified: true
                                })
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setNotification({ type: 'success', message: `Successfully allocated administrative role: ${fd.get('assignedRole')}` });
                                form.reset();
                                fetchAdminPanelState();
                              } else {
                                setNotification({ type: 'error', message: data.error || 'Failed to assign role.' });
                              }
                            } catch (e) {
                              setNotification({ type: 'error', message: 'Role allocation failed.' });
                            }
                          }}
                          className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end text-xs"
                        >
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block">Full Name</label>
                            <input type="text" name="name" required placeholder="Name (e.g. Anand Sen)" className="w-full bg-slate-150 border rounded-xl p-2 focus:ring-1 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white" />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block">Security Email</label>
                            <input type="email" name="email" required placeholder="Email (e.g. anand@hillytrip)" className="w-full bg-slate-150 border rounded-xl p-2 focus:ring-1 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-white" />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block">Authority Role</label>
                            <select name="assignedRole" className="w-full bg-slate-150 border rounded-xl p-2 focus:ring-1 focus:ring-amber-505 font-mono font-bold cursor-pointer text-slate-800 dark:text-white">
                              <option value="admin">🔧 Backoffice Admin</option>
                              <option value="super_admin">👑 Super Administrator</option>
                            </select>
                          </div>
                          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-mono font-black text-[10px] tracking-wider py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap">
                            ALLOCATE NOW
                          </button>
                        </form>
                      </div>

                      {/* Audit Trail list */}
                      <div className="bg-white dark:bg-slate-855 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-3xs">
                        <strong className="font-extrabold text-sm text-slate-855 dark:text-white block mb-3 font-mono">📜 Mountain Security Audit Trail Logs ({adminAuditLogs.length})</strong>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 text-left">
                          {adminAuditLogs.length === 0 ? (
                            <p className="text-xs text-slate-400 py-3 italic text-center">No high-altitude logging actions recorded yet.</p>
                          ) : (
                            adminAuditLogs.map((log: any) => (
                              <div key={log.id} className="p-3 bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono">
                                <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                                  <span>Operator: {log.userId || log.email || 'system'}</span>
                                  <span>{log.timestamp}</span>
                                </div>
                                <p className="text-yellow-650 dark:text-yellow-450 font-bold">{log.action}</p>
                                <p className="text-slate-600 dark:text-slate-350 mt-1">{log.details}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* ADMIN DIRECT RE-ROUTE SHORTCUT */}
                  {(user.roles?.includes('admin') || user.roles?.includes('super_admin') || user.role === 'admin' || user.role === 'super_admin') && (
                    <div className="mt-6 pt-4 border-t border-slate-150 dark:border-slate-800 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 text-left">
                      <h4 className="text-xs font-black text-amber-700 dark:text-amber-450 tracking-wider uppercase font-mono mb-1">🛡️ Administrative Backoffice Link</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Your unified login role lists verify that you possess active administrative privileges.</p>
                      <button
                        onClick={() => navigate('#/admin')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-mono font-black text-[10px] tracking-wider px-4 py-2 rounded-xl transition shadow cursor-pointer uppercase"
                      >
                        OPEN CONTROL PANEL DESK
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            9. PARTNER DASHBOARD PANEL
            ======================================================== */}
        {currentPath === '/partner-dashboard' && (
          <div id="partner-dashboard-view" className="animate-fade-in">
            <PartnerDashboard 
              user={user}
              navigate={navigate}
              setNotification={setNotification}
              dbHomestays={homestays}
              reloadDb={async () => {
                const res = await fetch('/api/admin/data/homestays');
                const data = await res.json();
                if (data.success && data.data) {
                  setHomestays(data.data);
                }
              }}
            />
          </div>
        )}

        {/* ========================================================
            10. PARTNER REGISTRATION / ONBOARDING VIEW
            ======================================================== */}
        {(currentPath === '/register' || currentPath === '/register/homestay' || currentPath === '/register/driver') && (
          <div id="partner-register-view" className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-8 relative overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-15">
                <img 
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop" 
                  className="w-full h-full object-cover" 
                  alt="Hills backdrop" 
                />
              </div>
              <div className="relative z-10 max-w-2xl">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5 mb-4">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Partner Hub
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">Onboard Your Hill Business</h1>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Join HillyTrip as a verified local partner to manage bookings, lists, and travel gigs. Tap into thousands of mountain explorers seeking certified homestays & mountain-qualified drivers.
                </p>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 max-w-md mx-auto border border-slate-200">
              <button
                id="register-tab-homestay"
                onClick={() => navigate('#/register/homestay')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  registerActiveTab === 'homestay'
                    ? 'bg-white text-emerald-800 shadow-md scale-100 font-extrabold'
                    : 'text-slate-500 hover:text-emerald-700 font-semibold'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-600" />
                Register Homestay
              </button>
              <button
                id="register-tab-driver"
                onClick={() => navigate('#/register/driver')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  registerActiveTab === 'driver'
                    ? 'bg-white text-emerald-800 shadow-md scale-100 font-extrabold'
                    : 'text-slate-500 hover:text-emerald-700 font-semibold'
                }`}
              >
                <Car className="w-4 h-4 text-emerald-600" />
                Register Driver / Car
              </button>
            </div>

            {regSuccess ? (
              <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-lg text-center max-w-2xl mx-auto py-12 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Onboarding Request Lodged!</h2>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 my-4 inline-block font-sans">
                  <span className="text-xs text-slate-400 block uppercase font-bold">Registered Identifier</span>
                  <span className="text-sm font-mono font-extrabold text-emerald-700">{regSuccess.id}</span>
                </div>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed mb-6">
                  Hi <strong>{regSuccess.name}</strong>, HillyTrip Administrator Desk has received your business application. Once our verification officers verify your mountain driving competence or homestay property parameters, your profile will be marked "Approved" and instantly list on the dynamic booking directory.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setRegSuccess(null)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer"
                  >
                    Register Another Business
                  </button>
                  <button
                    onClick={() => navigate('#/')}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm cursor-pointer"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-md border-b-4 border-emerald-600 animate-fade-in">
                {registerActiveTab === 'homestay' ? (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-extrabold text-slate-900">Homestay Partner Profile Details</h3>
                      <p className="text-slate-400 text-xs mt-1">Please answer all fields accurately to guarantee quick backend authorization.</p>
                    </div>

                    <form id="onboard-homestay-form" onSubmit={handleRegisterHomestaySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Homestay Name *</label>
                          <input 
                            name="name" 
                            type="text" 
                            required 
                            placeholder="e.g. Sittong Valley Heights Homestay" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Owner Full Name *</label>
                          <input 
                            name="ownerName" 
                            type="text" 
                            required 
                            placeholder="e.g. Pempa Tamang" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Phone / Mobile * (No leading '+')</label>
                          <input 
                            name="mobile" 
                            type="tel" 
                            required 
                            placeholder="e.g. 9832014892" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans font-semibold text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">WhatsApp Number (No leading '+')</label>
                          <input 
                            name="whatsapp" 
                            type="tel" 
                            placeholder="e.g. 9832014892" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans font-semibold text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Property Location / Destination *</label>
                          <select 
                            name="destination" 
                            required 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800"
                          >
                            <option value="">Choose nearest Hub...</option>
                            {destinations.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                            <option value="generic_hub">Other Indian Hill Hub</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Property Full Postal Address</label>
                        <input 
                          name="address" 
                          type="text" 
                          placeholder="e.g. Mall Road, Near Circuit House, Manali, Himachal Pradesh 175131" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800" 
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Standard Rate Min (INR Net Room/Night) *</label>
                          <input 
                            name="priceMin" 
                            type="number" 
                            defaultValue="1200" 
                            required 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans font-semibold text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Standard Rate Max (INR Net Room/Night) *</label>
                          <input 
                            name="priceMax" 
                            type="number" 
                            defaultValue="2200" 
                            required 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans font-semibold text-slate-800" 
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Amenities Provided at Homestay</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {['Attached Bath', 'Hot Water / Geyser', 'Mountain View', 'Homecooked Meals', 'Free Wi-Fi', 'Balconies', 'Campfires arrangeable', 'Local Guide / Trek assistance'].map((amen, amIndex) => (
                            <label key={amen} className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer border border-slate-200 select-none">
                              <input 
                                name="amenities" 
                                type="checkbox" 
                                value={amen} 
                                defaultChecked={amIndex < 4}
                                className="w-4 h-4 accent-emerald-600 rounded-lg" 
                              />
                              <span className="text-xs font-semibold text-slate-700">{amen}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Primary Property Photograph (JPEG/PNG Image URL)</label>
                        <input 
                          name="images" 
                          type="url" 
                          placeholder={DEFAULT_HOMESTAY_IMAGE} 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 font-mono" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">If hosted on unsplash or third party cloud stores, copy-paste the direct imagery url. If left blank, a high-quality default mountain guest cottage artwork is appended.</p>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white text-center py-4 rounded-xl cursor-pointer shadow-xs transition-colors"
                      >
                        Submit Homestay Registration Request
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-extrabold text-slate-900">Driver & Hired Vehicle Fleet Profile details</h3>
                      <p className="text-slate-400 text-xs mt-1">Apply to join with SUV standard or hatchback cars. Hill licenses and clean tourist protocols are enforced.</p>
                    </div>

                    <form id="onboard-driver-form" onSubmit={handleRegisterDriverSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Driver Full Name *</label>
                          <input 
                            name="name" 
                            type="text" 
                            required 
                            placeholder="e.g. Suraj Thapa" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hill Driving License Number</label>
                          <input 
                            name="licenseNumber" 
                            type="text" 
                            placeholder="e.g. DL-74S-XXXX-YYYY" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono text-slate-800" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mobile Contact Phone * (No leading '+')</label>
                          <input 
                            name="mobile" 
                            type="tel" 
                            required 
                            placeholder="e.g. 9832049219" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans font-semibold text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">WhatsApp Number (No leading '+')</label>
                          <input 
                            name="whatsapp" 
                            type="tel" 
                            placeholder="e.g. 9832049219" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans font-semibold text-slate-800" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Vehicle Maker & Model *</label>
                          <input 
                            name="vehicleName" 
                            type="text" 
                            required 
                            placeholder="e.g. Mahindra Bolero Power+" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Vehicle Classification *</label>
                          <select 
                            name="vehicleType" 
                            required 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800"
                          >
                            <option value="SUV / Luxury">SUV / Luxury (Innova, Xylo)</option>
                            <option value="SUV / Standard">SUV / Standard (Bolero, Sumo)</option>
                            <option value="Hatchback">Hatchback (Swift, Alto)</option>
                            <option value="Sedan">Sedan (Dzire, Etios)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Vehicle License Plate Number *</label>
                          <input 
                            name="vehicleNumber" 
                            type="text" 
                            required 
                            placeholder="e.g. WB-74S-4512" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-mono uppercase text-slate-800" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Preferred Hills Patrol Service Areas *</label>
                          <input 
                            name="serviceAreas" 
                            type="text" 
                            required 
                            placeholder="e.g. NJP, Bagdogra, Mirik, Darjeeling, Sittong, Kalimpong" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Daily Hired Rate (INR / Day Net inclusive) *</label>
                          <input 
                            name="pricingPerDay" 
                            type="number" 
                            defaultValue="3000" 
                            required 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-sans font-semibold text-slate-800" 
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white text-center py-4 rounded-xl cursor-pointer shadow-xs transition-colors"
                      >
                        Submit Driver Registration Request
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            11. ADMIN VIEW
            ======================================================== */}
        {currentPath === '/admin' && (
          <div id="admin-view" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
            {!isAdmin ? (
              <div className="max-w-md mx-auto bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xl mt-6">
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 text-slate-800 mx-auto" />
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-2">HillyTrip Admin Portal</h2>
                  <p className="text-xs text-slate-450 mt-1 pb-1 text-slate-400">
                    {authView === 'login' ? 'Authorized administrators only. Please sign in using your registered administrator account.' : 'Create a moderator request link'}
                  </p>
                </div>

                {authView === 'login' ? (
                  <form onSubmit={handleAdminEmailLogin} className="space-y-4">
                    <div className="text-left">
                      <label className="text-xs font-bold text-slate-500 block uppercase mb-1">Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="Enter administrator email" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div className="text-left">
                      <label className="text-xs font-bold text-slate-500 block uppercase mb-1">Account Password *</label>
                      <input 
                        type="password" 
                        required 
                        value={adminLoginPassword}
                        onChange={(e) => setAdminLoginPassword(e.target.value)}
                        placeholder="Enter password" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(adminEmail);
                          setIsResetModalOpen(true);
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-bold transition focus:outline-none"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold font-mono tracking-wider cursor-pointer hover:bg-slate-800 transition shadow">
                      VERIFY ADMINISTRATOR SIGN-IN
                    </button>

                    <div className="pt-2 text-center border-t border-slate-100 flex flex-col gap-2">
                      <div className="text-[11px] text-slate-400 gap-1 inline-block">
                        Need moderator access?{' '}
                        <button 
                          type="button" 
                          onClick={() => {
                            setAuthView('register');
                            setAdminEmail('');
                          }} 
                          className="text-emerald-600 hover:underline font-bold"
                        >
                          Request Sign Up
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAdminEmailRegister} className="space-y-4">
                    <div className="text-left">
                      <label className="text-xs font-bold text-slate-500 block uppercase mb-1">Your Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={adminRegisterName}
                        onChange={(e) => setAdminRegisterName(e.target.value)}
                        placeholder="e.g. John Doe" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="text-left">
                      <label className="text-xs font-bold text-slate-500 block uppercase mb-1 font-semibold animate-none">Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="Enter administrator email" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="text-left">
                      <label className="text-xs font-bold text-slate-500 block uppercase mb-1 font-semibold animate-none animate-duration-0">Security Password *</label>
                      <input 
                        type="password" 
                        required 
                        value={adminRegisterPassword}
                        onChange={(e) => setAdminRegisterPassword(e.target.value)}
                        placeholder="Choose a hard password" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold cursor-pointer hover:bg-emerald-700 transition shadow">
                      REGISTER MODERATOR NOMINATION
                    </button>
                    <div className="pt-2 text-center border-t border-slate-100 text-[11px] text-slate-400">
                      Already have backoffice rights?{' '}
                      <button 
                        type="button" 
                        onClick={() => {
                          setAuthView('login');
                          setAdminEmail('');
                        }} 
                        className="text-emerald-750 hover:underline font-bold"
                      >
                        Sign In Instead
                      </button>
                    </div>
                  </form>
                )}

                {/* Forgot Password Reset Modal */}
                {isResetModalOpen && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-slate-200 shadow-2xl animate-scale-up text-slate-800 text-left">
                      <div className="bg-slate-900 text-white p-6 flex justify-between items-center text-left">
                        <div>
                          <h3 className="text-lg font-bold leading-tight">
                            Reset Admin Password
                          </h3>
                          <span className="text-[11px] text-slate-400 mt-1 block">Trigger Firebase password reset email routing</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsResetModalOpen(false)}
                          className="text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
                        <div>
                          <label className="text-xs uppercase font-bold text-slate-400 block mb-1 font-semibold">Administrative Email Address *</label>
                          <input
                            type="email"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="Enter administrator email"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                          />
                        </div>
                        
                        <div className="pt-2 flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setIsResetModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isResetting}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
                          >
                            {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Send Reset Link
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Panel authenticated */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-left">
                    <span className="bg-emerald-600 text-xs font-bold px-3 py-1 rounded-full uppercase">Authenticated Mode</span>
                    <h2 className="text-3xl font-extrabold mt-1">HillyTrip Control Panel</h2>
                    {adminUser && (
                      <p className="text-xs text-slate-300 mt-1 pb-0">
                        Logged in as: <strong className="text-emerald-400 font-bold">{adminUser.name}</strong> ({adminUser.email}) — Role: <span className="bg-white/10 px-2 py-0.5 rounded text-white font-mono uppercase text-[10px] font-bold">{adminUser.role}</span>
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={handleAdminLogout}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer font-bold shadow"
                  >
                    Logout Workspace
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Tabs select */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setAdminActiveTab('stats')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'stats' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span>📊 Platform Metrics</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('leads')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'leads' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span>🧭 Trip Queries ({adminTripLeads.length})</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('car-leads')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'car-leads' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span>🚗 Private Car bookings ({adminCarLeads.length})</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('contributions')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'contributions' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span>📥 Contributor Inbox ({adminContributions.filter(c => c.status === 'Pending').length} pending)</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('images')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'images' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span>📸 Image Moderation Queue ({adminImages.filter(img => img.status === 'Pending').length} pending)</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('add-data')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'add-data' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span>⚙ Seed Custom Hubs</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('bulk-import')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'bulk-import' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span className="text-emerald-600">📥 Excel & Google Sheets Importer</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setAdminActiveTab('registrations')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'registrations' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span className="text-emerald-705 font-extrabold flex items-center gap-1.5">🛡 Partner Onboarding ({adminHomestays.filter(h => h.status === 'Pending').length + adminDrivers.filter(d => d.status === 'Pending').length} pending)</span>
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => {
                        setAdminActiveTab('analytics');
                        navigate('#/admin/analytics');
                      }}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'analytics' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1.5">📈 Real-time Analytics</span>
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </button>

                    {hasClientPermission('moderate_photos') && (
                      <button
                        onClick={() => setAdminActiveTab('photo_approvals')}
                        className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                          adminActiveTab === 'photo_approvals' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-sans text-emerald-700">📸 Photo Approvals</span>
                        <ChevronRight className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}

                    {/* RBAC ADMINISTRATION SECTIONS */}
                    {hasClientPermission('manage_users') && (
                      <button
                        onClick={() => setAdminActiveTab('admin_management')}
                        className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                          adminActiveTab === 'admin_management' ? 'bg-orange-50 text-orange-900 border-l-4 border-orange-500 font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-sans text-orange-700">👥 Admin Settings</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                    {hasClientPermission('view_analytics') && (
                      <button
                        onClick={() => setAdminActiveTab('audit_logs')}
                        className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                          adminActiveTab === 'audit_logs' ? 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-500 font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-sans text-indigo-700">📜 Access Audit Trails</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    )}

                    <button
                      onClick={() => setAdminActiveTab('app_notifications')}
                      id="admin-tab-btn-app-notifications"
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'app_notifications' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-sans text-emerald-800">🔔 Broadcast Alerts Panel</span>
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('cover_management')}
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'cover_management' ? 'bg-purple-50 text-purple-800 border-l-4 border-purple-600 font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-sans text-purple-800">✨ AI Cover Management</span>
                      <ChevronRight className="w-4 h-4 text-purple-600" />
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('location-intelligence')}
                      id="admin-tab-btn-location-intelligence"
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'location-intelligence' ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-600 font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-sans text-blue-800">🧭 Location Intelligence Center</span>
                      <ChevronRight className="w-4 h-4 text-blue-600" />
                    </button>

                    <button
                      onClick={() => setAdminActiveTab('partner-management')}
                      id="admin-tab-btn-partner-management"
                      className={`w-full text-left p-3 rounded-lg text-xs font-bold transition flex justify-between cursor-pointer ${
                        adminActiveTab === 'partner-management' ? 'bg-orange-50 text-orange-900 border-l-4 border-orange-500 font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-sans text-orange-700">🤝 Partner Verification Center</span>
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                    </button>
                  </div>

                  <div className="lg:col-span-3">
                    
                    {/* STATS CONTROLS */}
                    {adminActiveTab === 'stats' && adminStats && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="bg-white p-5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Hub nodes</span>
                            <span className="text-3xl font-extrabold text-slate-900">{adminStats.totalHubs}</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Calculated Routes</span>
                            <span className="text-3xl font-extrabold text-slate-900">{adminStats.totalRoutes}</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Scenic Spots</span>
                            <span className="text-3xl font-extrabold text-slate-900">{adminStats.totalAttractions}</span>
                          </div>
                          <div className="bg-white p-5 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Homestays Lodging</span>
                            <span className="text-3xl font-extrabold text-slate-900">{adminStats.totalHomestays}</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div>
                            <h4 className="font-bold text-lg text-slate-900">Platform Data Integrities</h4>
                            <p className="text-xs text-slate-400">Total processed contributions inbox: {adminContributions.length}</p>
                          </div>
                          <button 
                            onClick={loadAdminDashboard}
                            className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh Workspace Files
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TRIP LEADS */}
                    {adminActiveTab === 'leads' && (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <h4 className="font-extrabold text-slate-800 text-sm">Trip Planning Leads Inquiries ({adminTripLeads.length})</h4>
                        </div>
                        {adminTripLeads.length === 0 ? (
                          <div className="py-12 text-slate-400 text-center text-xs">No entries located.</div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {adminTripLeads.map((item) => (
                              <div key={item.id} className="p-4 flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-base">{item.name}</span>
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono font-bold select-all">{item.mobile}</span>
                                  </div>
                                  <p className="text-xs text-emerald-800 font-bold">Target Region: {item.destination} | Date: {item.travelDate || 'flexible'}</p>
                                  <p className="text-xs text-slate-500">Estimates Budget: ₹{item.budget} | Pax: {item.numTravellers}</p>
                                  <div className="flex gap-1.5 flex-wrap pt-1.5">
                                    {item.services.map((sc, scIdx) => (
                                      <span key={scIdx} className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                        ✓ {sc}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteLead('trip', item.id)}
                                  className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg cursor-pointer transition border border-transparent"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CAR LEADS */}
                    {adminActiveTab === 'car-leads' && (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <h4 className="font-extrabold text-slate-800 text-sm">Private Sightseeing Vehicle Bookings ({adminCarLeads.length})</h4>
                        </div>
                        {adminCarLeads.length === 0 ? (
                          <div className="py-12 text-slate-400 text-center text-xs">No booking entries documented.</div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {adminCarLeads.map((item) => (
                              <div key={item.id} className="p-4 flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                                    <span className="bg-slate-100 text-[10px] font-mono px-2 py-0.5 text-slate-600 rounded select-all">{item.mobile}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-emerald-800">Route Legs: {item.pickup} to {item.destination}</p>
                                  <p className="text-xs text-slate-500">Scheduled Date: {item.travelDate} | Pax: {item.passengers}</p>
                                  <div className="flex items-center gap-2 pt-1.5">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
                                    <select 
                                      value={item.status || 'Pending'} 
                                      onChange={(e) => handleUpdateCarStatus(item.id, e.target.value)}
                                      className="text-xs p-1 rounded border font-semibold bg-slate-50 text-slate-700"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Assigned">Driver Assigned</option>
                                      <option value="Completed">Trip Completed</option>
                                    </select>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteLead('car', item.id)}
                                  className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg cursor-pointer border border-transparent"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CONTRIBUTIONS */}
                    {adminActiveTab === 'contributions' && (
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">User Contributions Queue</h4>
                        </div>
                        {adminContributions.length === 0 ? (
                          <div className="py-12 text-slate-400 text-center text-xs">No pending contributions documented.</div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {adminContributions.map((item) => (
                              <div key={item.id} className="p-5">
                                <div className="flex justify-between items-start gap-4 flex-wrap mb-3.5">
                                  <div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      item.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                      item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-150 text-slate-500'
                                    }`}>
                                      {item.status} Contribution
                                    </span>
                                    <h5 className="font-bold text-base text-slate-900 mt-1.5 capitalize">{item.type.replace('_', ' ')}</h5>
                                  </div>
                                  <div className="text-right text-xs">
                                    <p className="text-slate-500">By: <span className="font-bold text-slate-800">{item.contributorName}</span></p>
                                    <p className="font-mono text-emerald-800 font-bold select-all mt-0.5">{item.contributorMobile}</p>
                                  </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs font-mono mb-4 text-slate-700 overflow-x-auto">
                                  <pre>{JSON.stringify(item.details, null, 2)}</pre>
                                </div>

                                {item.status === 'Pending' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleApproveContribution(item.id)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                                    >
                                      Approve & Seed Live
                                    </button>
                                    <button
                                      onClick={() => handleRejectContribution(item.id)}
                                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                                    >
                                      Reject Submission
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* MANUALLY SEED DATA */}
                    {adminActiveTab === 'add-data' && (
                      <div className="space-y-6 animate-fade-in text-slate-700">
                        {/* HEADER CONTROLS */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                              </span>
                              <h4 className="font-extrabold text-lg text-slate-800 tracking-tight">Active Spreadsheet Manager</h4>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Double-click or click directly inside cells to make fast changes. Click Save on the right to commit changes to Firestore.
                            </p>
                            <div className="mt-3 text-[11px] bg-emerald-50/40 p-2.5 text-slate-600 rounded-xl border border-emerald-100 flex items-center gap-1.5 leading-relaxed">
                              <span>💡</span>
                              <span>
                                Want to upload a photo to any Destination or Attraction instantly? Use the entry-free {' '}
                                <button
                                  type="button"
                                  onClick={() => setAdminActiveTab('images')}
                                  className="text-emerald-700 hover:underline font-extrabold cursor-pointer"
                                >
                                  📸 Easy Quick Photo Uploader
                                </button>{' '}
                                to swap covers or add gallery photos immediately!
                              </span>
                            </div>
                          </div>
                          
                          {/* CONTROL WIDGETS */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            <div className="w-full sm:w-auto min-w-[200px]">
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Select Active Matrix Sheet</label>
                              <select 
                                value={dbEditorCollection} 
                                onChange={(e) => setDbEditorCollection(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                              >
                                <option value="hubs">📍 Regional Hubs Sheet</option>
                                <option value="routes">🛣️ Pathfinding Routes Sheet</option>
                                <option value="destinations">🏞️ Destinations Portfolio Sheet</option>
                                <option value="attractions">⭐ Scenic Attractions Sheet</option>
                                <option value="homestays">🏡 Homestays & Lodges Sheet</option>
                                <option value="images">📸 Scenic/System Images Sheet</option>
                                <option value="trip_leads">🧭 Trip Planning Leads Sheet</option>
                                <option value="car_leads">🚗 Private Car Leads Sheet</option>
                                <option value="contributions">📥 Traveller Contributions Sheet</option>
                              </select>
                            </div>

                            <button
                              onClick={handleCreateNewRow}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm hover:shadow-md cursor-pointer self-end"
                            >
                              <Plus className="w-4 h-4" />
                              Insert Row
                            </button>

                            <button
                              onClick={handleExportCSV}
                              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-end"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                              Export CSV
                            </button>

                            <label className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-end">
                              <UploadCloud className="w-4 h-4 text-emerald-600" />
                              Import CSV
                              <input 
                                type="file" 
                                accept=".csv" 
                                onChange={handleImportCSV} 
                                className="hidden" 
                              />
                            </label>

                            <button
                              onClick={handleSaveAllSpreadsheetRows}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm hover:shadow-md cursor-pointer self-end"
                              title="Sync all newly imported or modified rows directly to Firebase"
                            >
                              <Save className="w-4 h-4 text-blue-100" />
                              Save All
                            </button>
                          </div>
                        </div>

                        {/* DESCRIPTIVE STATS PANEL & FAST ROW ACTION ALERT */}
                        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-teal-800">
                          <div className="flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Excel-Style Shortcuts:</span> Edit items instantly by modifying cell inputs. 
                              <span className="font-bold bg-amber-100 text-amber-800 px-1 border border-amber-200 rounded mx-1">Orange row numbering</span> 
                              indicates local edits that need to be pushed. Press <span className="font-bold">Save</span> on the right to finalize.
                            </div>
                          </div>
                          <span className="bg-teal-100 text-teal-800 border border-teal-300 rounded-full px-3 py-1 font-mono font-bold shrink-0">
                            Total Records: {spreadsheetRows.length}
                          </span>
                        </div>

                        {/* ACTIONS & REAL-TIME SEARCH */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input 
                              type="text"
                              value={dbEditorSearchQuery}
                              onChange={(e) => setDbEditorSearchQuery(e.target.value)}
                              placeholder={`🔍 Filter spreadsheet values in real-time...`}
                              className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                            />
                            {dbEditorSearchQuery && (
                              <button 
                                onClick={() => setDbEditorSearchQuery('')}
                                className="absolute right-3 top-2 text-xs font-extrabold text-slate-400 hover:text-slate-600"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        {/* SPREADSHEET CANVAS container */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                          <div className="overflow-x-auto max-h-[600px]">
                            <table className="w-full border-collapse text-left text-xs min-w-[1100px] divide-y divide-slate-200">
                              <thead className="bg-slate-50 sticky top-0 z-20 shadow-xs">
                                <tr>
                                  {/* Row index header prefix */}
                                  <th className="py-2.5 px-3 bg-slate-100 border-r border-b border-slate-200 text-slate-400 font-bold text-center w-12 text-[10px] select-none">
                                    Idx
                                  </th>
                                  {/* Auto-derived header columns */}
                                  {Object.keys(getStarterSkeleton(dbEditorCollection)).map((key) => (
                                    <th 
                                      key={key} 
                                      className="py-2.5 px-3 border-r border-b border-slate-200 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider bg-slate-50"
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-450 font-mono tracking-tight lowercase">
                                          ({dbEditorCollection === 'routes' && key === 'path' ? 'csv strings' : typeof getStarterSkeleton(dbEditorCollection)[key]})
                                        </span>
                                        <span>{key}</span>
                                      </div>
                                    </th>
                                  ))}
                                  {/* Right side static Excel actions column */}
                                  <th className="py-2.5 px-3 border-b border-slate-200 text-slate-600 font-bold text-center w-24 sticky right-0 bg-slate-50 z-10 border-l">
                                    Sheet Actions
                                  </th>
                                </tr>
                              </thead>
                              
                              <tbody className="divide-y divide-slate-105 bg-white">
                                {spreadsheetRows.filter((row) => {
                                  if (!dbEditorSearchQuery) return true;
                                  const search = dbEditorSearchQuery.toLowerCase();
                                  return Object.values(row).some(val => 
                                    String(val ?? '').toLowerCase().includes(search)
                                  );
                                }).map((row, rIdx) => {
                                  const isNewRow = String(row.id || '').startsWith('temp_');
                                  const keys = Object.keys(getStarterSkeleton(dbEditorCollection));
                                  
                                  return (
                                    <tr 
                                      key={`${row.id || 'row'}-${rIdx}`} 
                                      className={`group transition duration-150-ms hover:bg-slate-50/60 ${
                                        row._dirty ? 'bg-amber-50/25' : ''
                                      }`}
                                    >
                                      {/* Left cell index side flag indicator */}
                                      <td className={`py-1.5 font-bold font-mono text-[11px] text-center select-none border-r ${
                                        row._dirty 
                                          ? 'bg-amber-500 text-white border-amber-600' 
                                          : 'bg-slate-50 text-slate-400 border-slate-100'
                                      }`}>
                                        {rIdx + 1}
                                      </td>

                                      {/* Grid cells rendering inputs */}
                                      {keys.map((key) => {
                                        const originalVal = row[key];
                                        const displayVal = Array.isArray(originalVal) 
                                          ? originalVal.join(', ') 
                                          : (typeof originalVal === 'object' && originalVal !== null
                                             ? JSON.stringify(originalVal)
                                             : (originalVal !== null && originalVal !== undefined ? String(originalVal) : ''));

                                        const isReadOnly = key === 'id' && !isNewRow;
                                        
                                        return (
                                          <td 
                                            key={key} 
                                            className={`p-0 border-r border-slate-100 transition duration-150 relative ${
                                              isReadOnly ? 'bg-slate-100/50 text-slate-500' : 'hover:bg-slate-100/20'
                                            }`}
                                          >
                                            {/* Render specific inputs based on key/type */}
                                            {typeof getStarterSkeleton(dbEditorCollection)[key] === 'boolean' ? (
                                              <div className="flex items-center justify-center h-8 w-full">
                                                <input
                                                  type="checkbox"
                                                  checked={!!displayVal}
                                                  onChange={(e) => handleCellEdit(row.id, key, e.target.checked)}
                                                  className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                />
                                              </div>
                                            ) : (key === 'type' && dbEditorCollection === 'hubs') ? (
                                              <select
                                                value={displayVal}
                                                onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                                className="w-full h-8 px-2 bg-transparent text-xs font-semibold focus:bg-white focus:outline-hidden text-slate-800"
                                              >
                                                <option value="main_hub">Main Hub</option>
                                                <option value="sightseeing_hub">Sightseeing Hub</option>
                                                <option value="sub_hub">Sub-Hub</option>
                                              </select>
                                            ) : (key === 'type' && dbEditorCollection === 'routes') ? (
                                              <select
                                                value={displayVal}
                                                onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                                className="w-full h-8 px-2 bg-transparent text-xs font-semibold focus:bg-white focus:outline-hidden text-slate-800"
                                              >
                                                <option value="Direct">Direct</option>
                                                <option value="Indirect">Indirect</option>
                                              </select>
                                            ) : (key === 'category' && dbEditorCollection === 'attractions') ? (
                                              <select
                                                value={displayVal}
                                                onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                                className="w-full h-8 px-2 bg-transparent text-xs font-semibold focus:bg-white focus:outline-hidden text-slate-800"
                                              >
                                                {attractionCategories.map(cat => (
                                                  <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                              </select>
                                            ) : (key === 'status' && (dbEditorCollection === 'images' || dbEditorCollection === 'contributions')) ? (
                                              <select
                                                value={displayVal}
                                                onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                                className="w-full h-8 px-2 bg-transparent text-xs font-bold focus:bg-white focus:outline-hidden text-slate-800"
                                              >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                              </select>
                                            ) : (typeof getStarterSkeleton(dbEditorCollection)[key] === 'number') ? (
                                              <input
                                                type="number"
                                                value={displayVal}
                                                disabled={isReadOnly}
                                                onChange={(e) => handleCellEdit(row.id, key, e.target.value === '' ? '' : Number(e.target.value))}
                                                className="w-full h-8 px-3 font-mono text-right text-xs bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-hidden select-all"
                                              />
                                            ) : (
                                              <div className="relative flex items-center w-full h-8 group/sheetcell">
                                                <input
                                                  type="text"
                                                  value={displayVal}
                                                  disabled={isReadOnly}
                                                  placeholder={isNewRow && key === 'id' ? 'Set unique ID' : 'Empty cell'}
                                                  onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                                  className={`w-full h-full px-3 text-xs bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 focus:bg-white focus:outline-hidden select-all font-sans ${
                                                    isReadOnly ? 'text-slate-400 font-mono font-bold cursor-not-allowed' : 'text-slate-800'
                                                  } ${
                                                    (key === 'image' || key === 'images' || key === 'gallery' || key === 'url') && !isReadOnly ? 'pr-12' : ''
                                                  }`}
                                                  title={isReadOnly ? 'Unique identifier IDs cannot be modified once set to prevent path breakage.' : ''}
                                                />
                                                {/* Image cell helper: Direct photo upload & preview option */}
                                                {(key === 'image' || key === 'images' || key === 'gallery' || key === 'url') && !isReadOnly && (
                                                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                                    {displayVal && String(displayVal).startsWith('http') && (
                                                      <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
                                                      </span>
                                                    )}
                                                    {displayVal && String(displayVal).trim() && (
                                                      <a 
                                                        href={String(displayVal).split(',')[0].trim()} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="text-[10px] hover:scale-110 transition bg-slate-100 hover:bg-slate-200 p-1 rounded border border-slate-200"
                                                        title="Click to preview actual photo in new tab"
                                                      >
                                                        🖼️
                                                      </a>
                                                    )}
                                                    <label 
                                                      className="p-1 hover:scale-110 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer transition flex items-center justify-center animate-fade-in"
                                                      title="Click to upload normal photo from your device"
                                                    >
                                                      <Camera className="w-3.5 h-3.5" />
                                                      <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                          const file = e.target.files?.[0];
                                                          if (!file) return;
                                                          setLoading(true);
                                                          setNotification({ type: 'success', message: `Uploading & optimizing image "${file.name}"...` });
                                                          try {
                                                            const webpBlobFile = await compressAndConvertToWebP(file);
                                                            const uploadUrl = await uploadImageToFirebase(webpBlobFile, `excel_${Date.now()}_${file.name}`);
                                                            
                                                            let newVal: any = uploadUrl;
                                                            if (Array.isArray(originalVal)) {
                                                              newVal = [...originalVal, uploadUrl];
                                                            } else if (key === 'gallery' || key === 'images') {
                                                              const currentVal = String(displayVal).trim();
                                                              newVal = currentVal ? `${currentVal}, ${uploadUrl}` : uploadUrl;
                                                            }
                                                            
                                                            handleCellEdit(row.id, key, newVal);
                                                            setNotification({ type: 'success', message: `Successfully uploaded photo! Click "Save" on the right of this row to commit changes.` });
                                                          } catch (err: any) {
                                                            setNotification({ type: 'error', message: `Upload failed: ${err.message}` });
                                                          } finally {
                                                            setLoading(false);
                                                          }
                                                        }}
                                                      />
                                                    </label>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                        );
                                      })}

                                      {/* Side active sheet save and delete block */}
                                      <td className="py-1 px-3 border-b border-slate-100 sticky right-0 bg-white group-hover:bg-slate-50/95 z-10 border-l">
                                        <div className="flex items-center justify-center gap-1.5">
                                          <button
                                            onClick={() => handleSaveSpreadsheetRow(row.id)}
                                            disabled={loading}
                                            className={`p-1 px-2 text-[10px] font-extrabold uppercase rounded-lg flex items-center gap-1 hover:shadow-xs transition cursor-pointer disabled:opacity-40 shrink-0 ${
                                              row._dirty 
                                                ? 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-700 animate-pulse' 
                                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            }`}
                                            title="Commit Row Cells to Live Firestore Cluster"
                                          >
                                            <Save className="w-3.5 h-3.5" />
                                            {row._dirty ? 'Save' : 'Synced'}
                                          </button>
                                          <button
                                            onClick={() => handleDbEditorDelete(row.id)}
                                            disabled={loading}
                                            className="p-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-[10px] uppercase font-bold rounded-lg border border-rose-200 transition cursor-pointer disabled:opacity-40 shrink-0"
                                            title="Delete Record Permanently"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}

                                {spreadsheetRows.length === 0 && (
                                  <tr>
                                    <td 
                                      colSpan={Object.keys(getStarterSkeleton(dbEditorCollection)).length + 2} 
                                      className="py-16 text-center text-slate-400 font-mono text-xs bg-slate-50/30"
                                    >
                                      No records available in the sheet. Click "Insert Row" above to start seeding items!
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* EXCEL & CSV BULK IMPORTER */}
                    {adminActiveTab === 'bulk-import' && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-fade-in">
                        <div className="border-b pb-3">
                          <h4 className="text-lg font-extrabold text-slate-800">Excel & CSV Bulk Table Synchronization</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Use copy-paste tabular matrices or CSV values to batch synchronize your database parameters directly.
                          </p>
                        </div>

                        {/* Parameter Controls */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                          <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">⚙️ Target Parameters</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Target Data Collection</label>
                              <select 
                                value={bulkCollection} 
                                onChange={(e: any) => setBulkCollection(e.target.value)}
                                className="w-full bg-white border rounded-lg p-2.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="hubs">📍 Regional Hubs List</option>
                                <option value="routes">🛣️ Pathfinding Route Network</option>
                                <option value="destinations">🏞️ Destinations Portfolio</option>
                                <option value="attractions">⭐ Local Scenic Attractions</option>
                                <option value="homestays">🏡 Homestays & Lodges</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Synchronization Mode</label>
                              <select 
                                value={bulkMode} 
                                onChange={(e: any) => setBulkMode(e.target.value)}
                                className="w-full bg-white border rounded-lg p-2.5 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500"
                              >
                                <option value="merge">Smart Merge Update (Inserts new entries & updates matching rows)</option>
                                <option value="replace">Full database override (WIPE OUT current list & replace with new values)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <form onSubmit={handleBulkImportSubmit} className="space-y-4">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">
                                Paste Tabular Content Below (TSV / Tab-separated or CSV with headers)
                              </label>
                              <button 
                                type="button" 
                                onClick={() => setBulkText('')} 
                                className="text-[10px] text-red-500 hover:underline font-bold"
                              >
                                Clear Box
                              </button>
                            </div>
                            <textarea 
                              value={bulkText}
                              onChange={(e) => setBulkText(e.target.value)}
                              placeholder={`id\tname\ttype\nnjp\tNew Jalpaiguri\tmain_hub\nbagdogra\tBagdogra Airport\tmain_hub`}
                              className="w-full font-mono text-[11px] h-60 bg-slate-50 border rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 block leading-relaxed"
                            />
                          </div>

                          {bulkStatus && (
                            <div className={`p-4 rounded-xl text-xs font-medium border ${
                              bulkStatus.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-250'
                            }`}>
                              {bulkStatus.success ? '✔' : '❌'} {bulkStatus.message}
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={bulkLoading}
                            className={`w-full py-3 text-xs font-bold font-mono tracking-wider text-white rounded-xl uppercase transition ${
                              bulkLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-lg shadow-emerald-600/10'
                            }`}
                          >
                            {bulkLoading ? 'Syncing with live JSON store...' : 'Initiate Bulk Import Parse & Sync'}
                          </button>
                        </form>

                        {/* DATABASE FACTORY RESET / WIPE OUT TOOL */}
                        <div className="mt-8 pt-8 border-t border-slate-200">
                          <div className="bg-red-50/50 rounded-2xl border border-red-200 p-5 space-y-4 text-left">
                            <h4 className="text-sm font-extrabold text-red-800 flex items-center gap-2">
                              <span>⚠️ Danger Zone: Complete Database Wipe Out</span>
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              This tool will completely erase every single live record (Regional Hubs, Routes, Destinations, Scenic Attractions, and Homestays) across all database tables. It is designed to clean out the old system sample data so that you can populate your own fresh custom data.
                            </p>
                            
                            {!showWipeConfirm ? (
                              <button
                                type="button"
                                onClick={() => setShowWipeConfirm(true)}
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shadow-md shadow-red-600/15"
                              >
                                Wipe Out Live Sample Data
                              </button>
                            ) : (
                              <div className="bg-red-100/50 p-4 rounded-xl border border-red-200 space-y-3">
                                <p className="text-xs font-bold text-red-900">Are you absolutely sure? This cannot be undone and will delete all live, guest, and route parameters!</p>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={handleWipeAllData}
                                    disabled={bulkLoading}
                                    className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                                  >
                                    {bulkLoading ? 'Wiping...' : 'Yes, Wipe Everything Now'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowWipeConfirm(false)}
                                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ADMINISTRATIVE IMAGE MODERATION TAB */}
                    {adminActiveTab === 'images' && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-fade-in">
                        <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-extrabold text-slate-800">📸 Scenic Image Moderation Portfolio</h4>
                            <p className="text-xs text-slate-500 mt-1">Review traveler submissions, approve scenic gallery entries, and upload direct administrative assets.</p>
                          </div>
                          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border">
                            📁 System Total: {adminImages.length} images
                          </span>
                        </div>

                        {/* ⚡ INSTANT QUICK PHOTO UPLOADER FOR DESTINATIONS & ATTRACTIONS */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-150 pb-2.5">
                            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
                              <Zap className="w-4 h-4 animate-bounce text-emerald-500" />
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                                ⚡ Easy Quick Photo Uploader
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Lightning-Fast</span>
                              </h5>
                              <p className="text-[10px] text-slate-500 font-medium">Instantly change the cover photo or append to the gallery of any Destination or Attraction in 1-Click.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                            {/* Parameters selection - cols 5 */}
                            <div className="lg:col-span-5 space-y-3">
                              <div>
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Upload Option Type</label>
                                <select
                                  value={quickUploadTargetType || 'dest-main'}
                                  onChange={(e) => {
                                    const val = e.target.value as any;
                                    setQuickUploadTargetType(val);
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                                >
                                  <option value="dest-main">🏞️ Destination - Replace Main Cover Photo</option>
                                  <option value="dest-gallery">🖼️ Destination - Add to Image Gallery Array</option>
                                  <option value="attr-main">⭐ Attraction - Replace Main Cover Photo</option>
                                  <option value="attr-gallery">✨ Attraction - Add to Image Gallery Array</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                                  Select Target {quickUploadTargetType.startsWith('dest') ? 'Destination' : 'Scenic Attraction'}
                                </label>
                                <select
                                  value={quickUploadSelectedId || ''}
                                  onChange={(e) => setQuickUploadSelectedId(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                                >
                                  <option value="">-- Choose target record --</option>
                                  {quickUploadTargetType.startsWith('dest') ? (
                                    destinations.map(d => (
                                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                                    ))
                                  ) : (
                                    attractions.map(a => {
                                      const baseName = destinations.find(d => d.id === a.destinationId)?.name || 'Hills';
                                      return (
                                        <option key={a.id} value={a.id}>{a.name} [Located in: {baseName}]</option>
                                      );
                                    })
                                  )}
                                </select>
                              </div>
                            </div>

                            {/* Current Image Preview & Input Zone - cols 7 */}
                            <div className="lg:col-span-7 flex flex-col gap-3.5">
                              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                                {/* Current image thumbnail */}
                                <div className="w-24 h-24 shrink-0 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center text-center p-1 font-sans relative">
                                  {(() => {
                                    const isDest = quickUploadTargetType.startsWith('dest');
                                    const item = isDest 
                                      ? destinations.find(d => d.id === quickUploadSelectedId) 
                                      : attractions.find(a => a.id === quickUploadSelectedId);
                                    const currentUrl = item ? item.image : '';
                                    
                                    if (currentUrl && (currentUrl.startsWith('http') || currentUrl.startsWith('data:image'))) {
                                      return (
                                        <>
                                          <img src={currentUrl} alt="current" className="w-full h-full object-cover rounded-lg" />
                                          <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white font-extrabold text-[8px] py-0.5 px-1 rounded uppercase tracking-wider scale-90">Cover</span>
                                        </>
                                      );
                                    } else {
                                      return (
                                        <span className="text-[9px] text-slate-400 font-bold leading-tight">No active photo</span>
                                      );
                                    }
                                  })()}
                                </div>

                                {/* Drag & Click Zone */}
                                <div className="flex-grow">
                                  <label 
                                    className="group flex flex-col justify-center items-center p-5 border-2 border-dashed border-slate-250 hover:border-emerald-500 bg-white hover:bg-emerald-50/10 rounded-2xl cursor-pointer transition text-center h-full min-h-[96px] relative select-none"
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    onDrop={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (isUploadingQuickPhoto || !quickUploadSelectedId) return;
                                      const file = e.dataTransfer.files?.[0];
                                      if (file && file.type.startsWith('image/')) {
                                        await handleQuickPhotoUpload(file);
                                      }
                                    }}
                                  >
                                    {isUploadingQuickPhoto ? (
                                      <div className="flex flex-col items-center space-y-2">
                                        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                                        <span className="text-xs text-slate-700 font-bold animate-pulse">Processing...</span>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        <div className="mx-auto w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition duration-150">
                                          <Camera className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-xs font-extrabold text-slate-700">Drop or click to upload</p>
                                        <p className="text-[9px] text-slate-400 font-medium">Auto-resizes & uploads in ~1s</p>
                                      </div>
                                    )}
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={isUploadingQuickPhoto || !quickUploadSelectedId}
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          await handleQuickPhotoUpload(file);
                                          e.target.value = ''; // Reset input
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Direct Photo URL Paste Field */}
                              <div className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col sm:flex-row items-center gap-2">
                                <div className="relative flex-grow w-full">
                                  <input
                                    type="url"
                                    value={quickUploadUrlInput}
                                    onChange={(e) => setQuickUploadUrlInput(e.target.value)}
                                    placeholder="Or paste direct image URL (Unsplash, Imgur, etc.) for instant apply..."
                                    className="w-full text-xs font-mono bg-slate-50 border border-slate-180 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                                    disabled={isUploadingQuickPhoto || !quickUploadSelectedId}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleQuickPhotoUrlSubmit(quickUploadUrlInput)}
                                  disabled={isUploadingQuickPhoto || !quickUploadSelectedId || !quickUploadUrlInput.trim()}
                                  className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition disabled:bg-slate-100 disabled:text-slate-450 cursor-pointer whitespace-nowrap"
                                >
                                  Apply Web Link
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PART A: ADMIN DIRECT ASSET UPLOADER */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                          <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-emerald-600" />
                            Direct Admin Asset Upload (Instantly Approved)
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 font-sans">Associate Destination (Optional)</label>
                              <select 
                                id="admin-upload-dest"
                                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-700"
                                defaultValue=""
                                onChange={(e) => {
                                  const selectEl = document.getElementById('admin-upload-attr') as HTMLSelectElement;
                                  if (e.target.value && selectEl) selectEl.value = '';
                                }}
                              >
                                <option value="">-- No Destination Association --</option>
                                {destinations.map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 font-sans">Associate Attraction (Optional)</label>
                              <select 
                                id="admin-upload-attr"
                                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-700"
                                defaultValue=""
                                onChange={(e) => {
                                  const selectEl = document.getElementById('admin-upload-dest') as HTMLSelectElement;
                                  if (e.target.value && selectEl) selectEl.value = '';
                                }}
                              >
                                <option value="">-- No Attraction Association --</option>
                                {attractions.map(a => (
                                  <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-end">
                              <label className="w-full">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1 font-sans">Select High-Res Image (Max 10MB)</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="hidden" 
                                  id="admin-file-picker" 
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const destSelect = document.getElementById('admin-upload-dest') as HTMLSelectElement;
                                      const attrSelect = document.getElementById('admin-upload-attr') as HTMLSelectElement;
                                      const destId = destSelect?.value || null;
                                      const attrId = attrSelect?.value || null;

                                      setLoading(true);
                                      try {
                                        // Quality Optimization
                                        const webpBlobFile = await compressAndConvertToWebP(file);
                                        const uploadUrl = await uploadImageToFirebase(webpBlobFile, `admin_${Date.now()}_${file.name}`);
                                        
                                        const payload = {
                                          destinationId: destId,
                                          attractionId: attrId,
                                          url: uploadUrl,
                                          uploadedBy: 'Platform Admin',
                                          status: 'Approved',
                                          caption: `Admin visual for ${destId ? destinations.find(d => d.id === destId)?.name : attractions.find(a => a.id === attrId)?.name || 'highland spot'}`,
                                          altText: `Admin published official high resolution photograph of ${destId ? destinations.find(d => d.id === destId)?.name : attractions.find(a => a.id === attrId)?.name || 'hill sightseeing'}`
                                        };

                                        const resp = await fetch('/api/images', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify(payload)
                                        });

                                        if (resp.ok) {
                                          setNotification({ type: 'success', message: 'Official administrative photo published successfully!' });
                                          await loadAdminDashboard();
                                          if (destSelect) destSelect.value = '';
                                          if (attrSelect) attrSelect.value = '';
                                          e.target.value = '';
                                        } else {
                                          const err = await resp.json();
                                          throw new Error(err.error || 'Server rejected administrative asset creation.');
                                        }
                                      } catch (error: any) {
                                        setNotification({ type: 'error', message: error.message || 'Error occurred compiling administrative asset.' });
                                      } finally {
                                        setLoading(false);
                                      }
                                    }
                                  }}
                                />
                                <span className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-sm leading-none">
                                  <Camera className="w-4 h-4" /> Direct WebP Upload
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* PART B: QUEUE MODERATION */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="font-extrabold text-sm text-slate-800">Pending Review Queue</h5>
                            <button 
                              onClick={loadAdminDashboard}
                              className="text-xs text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                            >
                              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Force Sync Images
                            </button>
                          </div>

                          {adminImages.filter(img => img.status === 'Pending').length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                              <p className="text-xs text-slate-600 font-bold">Zero items in moderation queue</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-sans">All traveler snapshots are actively review-complete.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {adminImages.filter(img => img.status === 'Pending').map((img) => {
                                const associatedDestName = destinations.find(d => d.id === img.destinationId)?.name;
                                const associatedAttrName = attractions.find(a => a.id === img.attractionId)?.name;

                                return (
                                  <div key={img.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-4 animate-fade-in shadow-xs">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border bg-white">
                                      <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow flex flex-col justify-between text-left min-w-0">
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[9px] font-bold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full uppercase border border-yellow-250 font-mono">
                                            {img.status}
                                          </span>
                                          <span className="text-[9px] text-slate-400 font-mono">ID: {img.id.substring(0, 8)}...</span>
                                        </div>
                                        <h6 className="text-[11.5px] font-bold text-slate-800 leading-tight truncate mt-1">"{img.caption}"</h6>
                                        <p className="text-[9px] text-slate-500 line-clamp-1 italic">Alt description: "{img.altText}"</p>
                                        <p className="text-[9px] text-emerald-700 font-semibold leading-none">
                                          Target association: {associatedDestName ? `📍 Destination: ${associatedDestName}` : associatedAttrName ? `⭐ Attraction: ${associatedAttrName}` : '🌐 Sightseeing Node'}
                                        </p>
                                        <p className="text-[8px] text-slate-400">By {img.uploadedBy} on {new Date(img.uploadDate).toLocaleDateString()}</p>
                                      </div>
                                      
                                      <div className="flex gap-2 justify-end mt-2">
                                        <button 
                                          onClick={async () => {
                                            setLoading(true);
                                            try {
                                              const resp = await fetch(`/api/admin/images/${img.id}/approve`, {
                                                method: 'POST',
                                                headers: { 'x-admin-password': 'admin123' }
                                              });
                                              if (resp.ok) {
                                                setNotification({ type: 'success', message: 'Scenic image contribution approved successfully!' });
                                                await loadAdminDashboard();
                                              }
                                            } catch (error: any) {
                                              setNotification({ type: 'error', message: 'Error approving contribution.' });
                                            } finally {
                                              setLoading(false);
                                            }
                                          }}
                                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold cursor-pointer transition shadow-xs"
                                        >
                                          Approve
                                        </button>
                                        <button 
                                          onClick={async () => {
                                            setLoading(true);
                                            try {
                                              const resp = await fetch(`/api/admin/images/${img.id}/reject`, {
                                                method: 'POST',
                                                headers: { 'x-admin-password': 'admin123' }
                                              });
                                              if (resp.ok) {
                                                setNotification({ type: 'success', message: 'Scenic image contribution rejected.' });
                                                await loadAdminDashboard();
                                              }
                                            } catch (error: any) {
                                              setNotification({ type: 'error', message: 'Error rejecting contribution.' });
                                            } finally {
                                              setLoading(false);
                                            }
                                          }}
                                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[10px] font-bold cursor-pointer transition shadow-xs"
                                        >
                                          Reject
                                        </button>
                                        <button 
                                          onClick={async () => {
                                            if (confirm('Delete this file entry permanently from database?')) {
                                              setLoading(true);
                                              try {
                                                const resp = await fetch(`/api/admin/images/${img.id}/delete`, {
                                                  method: 'POST',
                                                  headers: { 'x-admin-password': 'admin123' }
                                                });
                                                if (resp.ok) {
                                                  setNotification({ type: 'success', message: 'Image deleted permanently.' });
                                                  await loadAdminDashboard();
                                                }
                                              } catch (error: any) {
                                                setNotification({ type: 'error', message: 'Error deleting database image entry.' });
                                              } finally {
                                                setLoading(false);
                                              }
                                            }
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md cursor-pointer transition"
                                          title="Decline & Delete"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* PART C: LIVE ARCHIVE CATALOGUE */}
                        <div className="space-y-3 pt-4 border-t">
                          <h5 className="font-extrabold text-sm text-slate-800">Published Asset Archival Catalog</h5>
                          {adminImages.filter(img => img.status !== 'Pending').length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No approved or rejected historical entries recorded yet.</p>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50 p-2">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b bg-white text-slate-500 font-bold font-mono">
                                    <th className="p-3">Asset Preview</th>
                                    <th className="p-3">Caption Title (descriptive alt)</th>
                                    <th className="p-3">Association</th>
                                    <th className="p-3">Credits</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-center">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {adminImages.filter(img => img.status !== 'Pending').map(img => (
                                    <tr key={img.id} className="hover:bg-slate-50 transition border-b bg-white">
                                      <td className="p-3">
                                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-md overflow-hidden shadow-xs shrink-0 bg-slate-100">
                                          <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />
                                        </div>
                                      </td>
                                      <td className="p-3 max-w-xs text-left">
                                        <p className="font-bold text-slate-800 truncate" title={img.caption}>"{img.caption}"</p>
                                        <p className="text-[10px] text-slate-450 truncate" title={img.altText}>Alt: "{img.altText}"</p>
                                      </td>
                                      <td className="p-3 text-[10px] font-bold text-emerald-800 text-left">
                                        {destinations.find(d => d.id === img.destinationId)?.name || attractions.find(a => a.id === img.attractionId)?.name || '🌐 Global Scenic'}
                                      </td>
                                      <td className="p-3 text-left">
                                        <p className="font-semibold text-slate-700">{img.uploadedBy}</p>
                                        <p className="text-[9px] text-slate-400">{new Date(img.uploadDate).toLocaleDateString()}</p>
                                      </td>
                                      <td className="p-3 text-left">
                                        <span className={`text-[9px] font-mono leading-none font-bold px-2 py-0.5 rounded-full border uppercase ${
                                          img.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-850 border-red-200'
                                        }`}>
                                          {img.status}
                                        </span>
                                      </td>
                                      <td className="p-3 text-center">
                                        <div className="flex gap-2 justify-center">
                                          {img.status === 'Approved' ? (
                                            <button 
                                              onClick={async () => {
                                                setLoading(true);
                                                try {
                                                  const resp = await fetch(`/api/admin/images/${img.id}/reject`, {
                                                    method: 'POST',
                                                    headers: { 'x-admin-password': 'admin123' }
                                                  });
                                                  if (resp.ok) {
                                                    await loadAdminDashboard();
                                                  }
                                                } catch (e) {} finally { setLoading(false); }
                                              }}
                                              className="p-1 px-1.5 hover:bg-slate-100 text-amber-600 rounded text-[10px] font-bold cursor-pointer"
                                              title="Suspend Approval"
                                            >
                                              Suspend
                                            </button>
                                          ) : (
                                            <button 
                                              onClick={async () => {
                                                setLoading(true);
                                                try {
                                                  const resp = await fetch(`/api/admin/images/${img.id}/approve`, {
                                                    method: 'POST',
                                                    headers: { 'x-admin-password': 'admin123' }
                                                  });
                                                  if (resp.ok) {
                                                    await loadAdminDashboard();
                                                  }
                                                } catch (e) {} finally { setLoading(false); }
                                              }}
                                              className="p-1 px-1.5 hover:bg-slate-100 text-emerald-600 rounded text-[10px] font-bold cursor-pointer"
                                              title="Re-Approve Visual"
                                            >
                                              Approve
                                            </button>
                                          )}
                                          <button 
                                            onClick={async () => {
                                              if (confirm('Delete this file record permanently?')) {
                                                setLoading(true);
                                                try {
                                                  const resp = await fetch(`/api/admin/images/${img.id}/delete`, {
                                                    method: 'POST',
                                                    headers: { 'x-admin-password': 'admin123' }
                                                  });
                                                  if (resp.ok) {
                                                    await loadAdminDashboard();
                                                  }
                                                } catch (e) {} finally { setLoading(false); }
                                              }
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ADMINISTRATIVE PARTNER REGISTRATIONS TAB */}
                    {adminActiveTab === 'registrations' && (
                      <div className="space-y-8 animate-fade-in text-slate-800">
                        {/* Summary Stats Header Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-2xl text-white shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">Pending Homestays</span>
                            <span className="text-3xl font-extrabold block mt-1">{adminHomestays.filter(h => h.status === 'Pending').length}</span>
                            <span className="text-xs block opacity-90 mt-1">Properties awaiting verify / inspection</span>
                          </div>
                          <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-5 rounded-2xl text-white shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">Pending Driver Fleets</span>
                            <span className="text-3xl font-extrabold block mt-1">{adminDrivers.filter(d => d.status === 'Pending').length}</span>
                            <span className="text-xs block opacity-90 mt-1">Vehicles and licenses awaiting hill checks</span>
                          </div>
                        </div>

                        {/* PART A: HOMESTAYS ONBOARDING PORTFOLIO */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 font-sans">
                          <div className="border-b pb-3.5">
                            <h4 className="text-lg font-bold text-slate-800">🏡 Homestay Onboarding Applications</h4>
                            <p className="text-xs text-slate-405 mt-0.5">Authorise local homestays to list in public traveler menus.</p>
                          </div>

                          {adminHomestays.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                              No homestay registration requests recorded in the database.
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                                    <th className="p-3">Property / Owner</th>
                                    <th className="p-3">Contacts</th>
                                    <th className="p-3">Location & Rates</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                  {adminHomestays.map((hm) => (
                                    <tr key={hm.id} className="hover:bg-slate-50/50">
                                      <td className="p-3">
                                        <div className="flex items-center gap-3">
                                          <img 
                                            src={(hm.images && hm.images.find(img => img && img.trim() !== '')) || DEFAULT_HOMESTAY_IMAGE} 
                                            onError={(e) => {
                                              e.currentTarget.src = DEFAULT_HOMESTAY_IMAGE;
                                            }} 
                                            alt="" 
                                            className="w-10 h-10 rounded-lg object-cover border" 
                                            referrerPolicy="no-referrer"
                                            loading="lazy"
                                          />
                                          <div>
                                            <span className="font-extrabold text-slate-800 text-xs block">{hm.name}</span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">Host: {hm.ownerName}</span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3 font-mono">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-bold text-slate-700">Mob: {hm.mobile}</span>
                                          {hm.whatsapp && <span className="text-emerald-600 font-bold">WA: {hm.whatsapp}</span>}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div>
                                          <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-sm capitalize">{hm.destinationId || hm.destination}</span>
                                          <span className="text-[10px] text-slate-405 block mt-1 font-sans">Rate: ₹{hm.priceMin} - ₹{hm.priceMax}</span>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase leading-none ${
                                          hm.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                                          hm.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 
                                          'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}>
                                          {hm.status}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right space-x-1.5">
                                        {hm.status !== 'Approved' && (
                                          <button
                                            onClick={() => handleOnboardingAction('homestays', hm.id, hm, 'Approved')}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                          >
                                            Verify & Approve
                                          </button>
                                        )}
                                        {hm.status !== 'Rejected' && (
                                          <button
                                            onClick={() => handleOnboardingAction('homestays', hm.id, hm, 'Rejected')}
                                            className="border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                          >
                                            Reject
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* PART B: DRIVER FLEET ONBOARDING PORTFOLIO */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 font-sans">
                          <div className="border-b pb-3.5">
                            <h4 className="text-lg font-bold text-slate-800">🚗 Local Driver & Vehicle Onboarding Queue</h4>
                            <p className="text-xs text-slate-405 mt-0.5">Review licensing info and target daily mountain rates of regional operators.</p>
                          </div>

                          {adminDrivers.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                              No vehicle registration requests recorded in the database.
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                                    <th className="p-3">Driver / Vehicle</th>
                                    <th className="p-3">Plates & License</th>
                                    <th className="p-3">Patrol Area & Rates</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                                  {adminDrivers.map((drv) => (
                                    <tr key={drv.id} className="hover:bg-slate-50/50">
                                      <td className="p-3">
                                        <div>
                                          <span className="font-extrabold text-slate-800 text-xs block">{drv.name}</span>
                                          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Mob: {drv.mobile}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 font-mono">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="font-extrabold text-slate-850 uppercase bg-slate-100 px-2 py-0.5 rounded-sm inline-block max-w-max">{drv.vehicleNumber}</span>
                                          <span className="text-[10px] text-slate-400 mt-0.5 font-sans">Model: {drv.vehicleName} ({drv.vehicleType})</span>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div>
                                          <span className="text-slate-700 block truncate max-w-[200px]">{drv.serviceAreas}</span>
                                          <span className="text-[10px] text-slate-405 block mt-1 font-sans">Daily Target: ₹{drv.pricingPerDay} / day</span>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase leading-none ${
                                          drv.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                                          drv.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 
                                          'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}>
                                          {drv.status}
                                        </span>
                                      </td>
                                      <td className="p-3 text-right space-x-1.5">
                                        {drv.status !== 'Approved' && (
                                          <button
                                            onClick={() => handleOnboardingAction('drivers', drv.id, drv, 'Approved')}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                          >
                                            Verify & Approve
                                          </button>
                                        )}
                                        {drv.status !== 'Rejected' && (
                                          <button
                                            onClick={() => handleOnboardingAction('drivers', drv.id, drv, 'Rejected')}
                                            className="border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                          >
                                            Reject
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* REAL-TIME VISITOR ANALYTICS PANEL */}
                    {adminActiveTab === 'analytics' && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-8 animate-fade-in text-slate-800">
                        <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border border-emerald-250 mb-1 inline-block">Firebase Active Streaming</span>
                            <h4 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">📈 HillyTrip Visitor Traffic & Telemetry Tracker</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              This session aggregates interactive user behavior data compiled directly from Firebase Firestore in real-time.
                            </p>
                          </div>
                          <button
                            onClick={loadUserAnalytics}
                            disabled={adminUserAnalyticsLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${adminUserAnalyticsLoading ? 'animate-spin' : ''}`} />
                            {adminUserAnalyticsLoading ? 'Refreshing Logs...' : 'Force Refetch Firestore'}
                          </button>
                        </div>

                        {adminUserAnalyticsLoading && !adminUserAnalytics ? (
                          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                            <p className="text-xs text-slate-500 font-bold font-mono">Quering user_analytics collection in Firebase Firestore...</p>
                          </div>
                        ) : !adminUserAnalytics ? (
                          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Compass className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-700">Empty Telemetry Collection</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">No analytics records located in Firestore. Try searching a route, opening a destination, or visiting an attraction to feed metrics logs.</p>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            {/* Stats Summary Panel */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left">
                                <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Route Searches</span>
                                <span className="text-3xl font-extrabold text-slate-900 block font-mono">{adminUserAnalytics.totalRouteSearches}</span>
                                <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Logged successfully</span>
                              </div>
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left">
                                <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Destination Visits</span>
                                <span className="text-3xl font-extrabold text-slate-900 block font-mono">{adminUserAnalytics.totalDestinationVisits}</span>
                                <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Open destination loads</span>
                              </div>
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left">
                                <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Attraction Visits</span>
                                <span className="text-3xl font-extrabold text-slate-900 block font-mono">{adminUserAnalytics.totalAttractionVisits}</span>
                                <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Scenic spot views</span>
                              </div>
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-emerald-950 bg-emerald-50/50 border-emerald-100 text-left">
                                <span className="text-[10px] text-emerald-800 font-extrabold block uppercase tracking-wider mb-1">Total Logs Count</span>
                                <span className="text-3xl font-extrabold text-emerald-950 block font-mono">{adminUserAnalytics.totalCount}</span>
                                <span className="text-[10px] text-emerald-700 font-medium block mt-1">Aggregated across channels</span>
                              </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium text-left">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Zero-Trust Database Rule active: All reads restricted to administrators. Writes are computed securely using the backoffice API on route execution or layout mount.</span>
                            </div>

                            {/* Charts grids */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Chart 1: Bar chart searches */}
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                                <div>
                                  <h5 className="font-extrabold text-sm text-slate-800">📊 Top 10 Searched Routes</h5>
                                  <p className="text-[10px] text-slate-400">Total searches grouped by path origin and destination</p>
                                </div>
                                <div className="h-48 w-full">
                                  {adminUserAnalytics.mostSearchedRoutes.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-xs text-slate-400 bg-white border rounded-xl border-dashed">No search events logged yet</div>
                                  ) : (
                                    <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                                      {adminUserAnalytics.mostSearchedRoutes.slice(0, 5).map((d: any, idx: number) => {
                                        const y = 15 + idx * 30;
                                        const maxVal = Math.max(...adminUserAnalytics.mostSearchedRoutes.map((r: any) => r.count), 1);
                                        const barWidth = (300 * d.count) / maxVal;
                                        return (
                                          <g key={idx}>
                                            <text x={110} y={y + 11} className="text-[10px] font-bold fill-slate-700" textAnchor="end">
                                              {d.name.length > 20 ? d.name.substring(0, 18) + '...' : d.name}
                                            </text>
                                            <rect x={120} y={y} width={300} height={16} fill="#f1f5f9" rx={3} />
                                            <rect x={120} y={y} width={barWidth} height={16} fill="#10b981" rx={3} />
                                            <text x={120 + barWidth + 8} y={y + 11} className="text-[9.5px] font-mono font-bold fill-emerald-800">
                                              {d.count} queries
                                            </text>
                                          </g>
                                        );
                                      })}
                                    </svg>
                                  )}
                                </div>
                              </div>

                              {/* Chart 2: Activity Over Time Area chart */}
                              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                                <div>
                                  <h5 className="font-extrabold text-sm text-slate-800">📈 Network Activity Trends</h5>
                                  <p className="text-[10px] text-slate-400">Visitor page loads and pathway search metrics over time</p>
                                </div>
                                <div className="h-48 w-full">
                                  {adminUserAnalytics.activityOverTime.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-xs text-slate-400 bg-white border rounded-xl border-dashed">Waiting for timestamp activity feeds</div>
                                  ) : (
                                    (() => {
                                      const data = adminUserAnalytics.activityOverTime;
                                      const width = 500;
                                      const height = 180;
                                      const padding = 35;
                                      
                                      const maxVal = Math.max(...data.map((d: any) => d.total), 10);
                                      const points = data.map((d: any, index: number) => {
                                        const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
                                        const y = height - padding - (d.total * (height - padding * 2)) / maxVal;
                                        return `${x},${y}`;
                                      }).join(' ');

                                      const areaPoints = data.length > 0 ? `${padding},${height - padding} ${points} ${width - padding},${height - padding}` : '';

                                      return (
                                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                                          <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                              <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                                              <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                                            </linearGradient>
                                          </defs>
                                          
                                          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                                            const y = padding + p * (height - padding * 2);
                                            const val = Math.round(maxVal * (1 - p));
                                            return (
                                              <g key={idx}>
                                                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />
                                                <text x={padding - 8} y={y + 3} className="text-[9px] fill-slate-400 font-bold font-mono" textAnchor="end">{val}</text>
                                              </g>
                                            );
                                          })}
                                          
                                          {areaPoints && <polygon points={areaPoints} fill="url(#areaGrad)" />}
                                          {points && <polyline fill="none" stroke="#059669" strokeWidth={2.5} points={points} strokeLinecap="round" strokeLinejoin="round" />}
                                          
                                          {data.map((d: any, index: number) => {
                                            const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
                                            const y = height - padding - (d.total * (height - padding * 2)) / maxVal;
                                            return (
                                              <g key={index} className="group cursor-pointer">
                                                <circle cx={x} cy={y} r={4} fill="#ffffff" stroke="#059669" strokeWidth={2.5} />
                                                <circle cx={x} cy={y} r={8} fill="#059669" fillOpacity={0} className="hover:fill-opacity-10 transition-all" />
                                                <title>{`${d.date}: ${d.total} active logs (${d.searches} search, ${d.destinations} dest, ${d.attractions} attr)`}</title>
                                              </g>
                                            );
                                          })}

                                          {data.map((d: any, index: number) => {
                                            if (data.length > 6 && index % 2 !== 0) return null;
                                            const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
                                            const dateFormatted = d.date.substring(5);
                                            return (
                                              <text key={index} x={x} y={height - padding + 15} className="text-[9px] fill-slate-400 font-semibold font-mono" textAnchor="middle">
                                                {dateFormatted}
                                              </text>
                                            );
                                          })}
                                        </svg>
                                      );
                                    })()
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Tables details */}
                            <div className="space-y-8 pt-4">
                              {/* Route Searches detail tab */}
                              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-left">
                                  <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">🛣️ Top Searched Pathways</h5>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="border-b bg-slate-50/55 text-slate-500 font-bold font-mono">
                                        <th className="p-3">Rank No.</th>
                                        <th className="p-3">Pathway Name (Source → Goal)</th>
                                        <th className="p-3">Specific Slug Code</th>
                                        <th className="p-3">Source Node</th>
                                        <th className="p-3">Destination Node</th>
                                        <th className="p-3 text-center">Total Query Hits</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {adminUserAnalytics.mostSearchedRoutes.length === 0 ? (
                                        <tr>
                                          <td colSpan={6} className="text-center py-8 text-slate-400">No route searches recorded.</td>
                                        </tr>
                                      ) : (
                                        adminUserAnalytics.mostSearchedRoutes.map((item: any, idx: number) => (
                                          <tr key={`searched-route-${item.slug || 'slug'}-${idx}`} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-3 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                                            <td className="p-3 font-bold text-slate-800">{item.name}</td>
                                            <td className="p-3 font-mono text-slate-500">{item.slug || 'direct-id'}</td>
                                            <td className="p-3 text-slate-600 font-semibold">{item.source || 'N/A'}</td>
                                            <td className="p-3 text-slate-600 font-semibold">{item.destination || 'N/A'}</td>
                                            <td className="p-3 text-center font-bold text-emerald-700 font-mono text-sm bg-emerald-50/20">{item.count} times</td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Destinations & attractions grid */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Destinations popular tab */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-left">
                                    <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 font-sans">⛰️ Most Visited Destinations</h5>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="border-b bg-slate-50/55 text-slate-500 font-bold font-mono">
                                          <th className="p-3">Rank No.</th>
                                          <th className="p-3">Destination Name</th>
                                          <th className="p-3">Reference Slug</th>
                                          <th className="p-3 text-center">Total Page Visits</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {adminUserAnalytics.mostVisitedDestinations.length === 0 ? (
                                          <tr>
                                            <td colSpan={4} className="text-center py-8 text-slate-400">No destination hits registered yet.</td>
                                          </tr>
                                        ) : (
                                          adminUserAnalytics.mostVisitedDestinations.map((item: any, idx: number) => (
                                            <tr key={`visited-dest-${item.slug || 'slug'}-${idx}`} className="hover:bg-slate-50 transition-colors">
                                              <td className="p-3 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                                              <td className="p-3 font-bold text-slate-800">{item.name}</td>
                                              <td className="p-3 font-mono text-slate-500">{item.slug}</td>
                                              <td className="p-3 text-center font-bold text-violet-750 font-mono text-sm bg-violet-50/10">{item.count} visits</td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Attractions popular tab */}
                                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                                  <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-left">
                                    <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 font-sans">⭐ Most Popular Local Attractions</h5>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="border-b bg-slate-50/55 text-slate-500 font-bold font-mono">
                                          <th className="p-3">Rank No.</th>
                                          <th className="p-3">Attraction Name</th>
                                          <th className="p-3">Reference ID</th>
                                          <th className="p-3 text-center">Views Log Count</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {adminUserAnalytics.mostVisitedAttractions.length === 0 ? (
                                          <tr>
                                            <td colSpan={4} className="text-center py-8 text-slate-400">No attraction page hits recorded.</td>
                                          </tr>
                                        ) : (
                                          adminUserAnalytics.mostVisitedAttractions.map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                              <td className="p-3 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                                              <td className="p-3 font-bold text-slate-800">{item.name}</td>
                                              <td className="p-3 font-mono text-slate-500">{item.slug}</td>
                                              <td className="p-3 text-center font-bold text-indigo-750 font-mono text-sm bg-indigo-50/10">{item.count} views</td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ADMINISTRATIVE SETTINGS & RBAC USER MANAGER */}
                    {adminActiveTab === 'admin_management' && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-fade-in text-slate-800 text-left">
                        <div className="border-b pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <span className="bg-orange-100 text-orange-850 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-orange-200 mb-1 inline-block">Role-based Access Engine</span>
                            <h4 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">👥 Administrative Officers & Credentials Manager</h4>
                            <p className="text-xs text-slate-500 mt-1 pb-0">
                              Configure backoffice user profiles, promote accounts, change active access status, and inject tailored custom override permission structures.
                            </p>
                          </div>
                          {hasClientPermission('manage_users') && (
                            <button
                              onClick={() => {
                                setEditingUser(null);
                                setUserFormEmail('');
                                setUserFormName('');
                                setUserFormRole('moderator');
                                setUserFormStatus('active');
                                setUserFormPassword('');
                                setUserFormCustomPermissions([]);
                                setShowUserModal(true);
                              }}
                              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow"
                            >
                              <Plus className="w-4 h-4" /> Add Backoffice Agent
                            </button>
                          )}
                        </div>

                        {/* Search & Filter bar */}
                        <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={adminSearchQuery}
                              onChange={(e) => setAdminSearchQuery(e.target.value)}
                              placeholder="Search administrative users by email or username..."
                              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                            />
                          </div>
                          <div className="w-full sm:w-48">
                            <select
                              value={adminRoleFilter}
                              onChange={(e) => setAdminRoleFilter(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-orange-500 font-semibold"
                            >
                              <option value="all">All Access Roles</option>
                              <option value="super_admin">Super Admins Only</option>
                              <option value="admin">Admins Only</option>
                              <option value="moderator">Moderators Only</option>
                            </select>
                          </div>
                        </div>

                        {/* Users Table */}
                        {adminManagementLoading ? (
                          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
                            <p className="text-xs text-slate-500 font-bold font-mono">Syncing system privilege matrices...</p>
                          </div>
                        ) : (
                          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b bg-slate-50/75 text-slate-500 font-bold font-mono">
                                    <th className="p-3">Avatar & Username Name</th>
                                    <th className="p-3">Email Node</th>
                                    <th className="p-3">Role Node</th>
                                    <th className="p-3">Safety Status</th>
                                    <th className="p-3">Custom Perm Overrides</th>
                                    <th className="p-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {(() => {
                                    const filtered = allAdminUsers.filter(u => {
                                      const matchSearch = u.email.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                                                          u.name.toLowerCase().includes(adminSearchQuery.toLowerCase());
                                      const matchRole = adminRoleFilter === 'all' || u.role === adminRoleFilter;
                                      return matchSearch && matchRole;
                                    });

                                    if (filtered.length === 0) {
                                      return (
                                        <tr>
                                          <td colSpan={6} className="text-center py-12 text-slate-400">
                                            No administrative agents matching details.
                                          </td>
                                        </tr>
                                      );
                                    }

                                    return filtered.map((u) => {
                                      const isSelf = u.email === adminUser?.email;
                                      const isSuperAdmin = u.email === 'mavanish24@gmail.com';
                                      
                                      return (
                                        <tr key={u.email} className="hover:bg-slate-50 transition-colors">
                                          <td className="p-3 font-bold text-slate-800">
                                            <div className="flex items-center gap-2">
                                              <div className="w-7 h-7 bg-slate-900 rounded-full text-white text-[10px] font-bold flex items-center justify-center uppercase">
                                                {u.name.substring(0, 2)}
                                              </div>
                                              <div>
                                                <span className="block leading-none">{u.name}</span>
                                                <span className="text-[10px] text-slate-400 font-normal">Created: {new Date(u.createdAt || Date.now()).toLocaleDateString()}</span>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="p-3 font-mono font-semibold text-slate-650">{u.email}</td>
                                          <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono ${
                                              u.role === 'super_admin' ? 'bg-red-100 text-red-805 border border-red-200 text-red-800' :
                                              u.role === 'admin' ? 'bg-orange-100 text-orange-850 border border-orange-200 text-orange-805 font-bold' :
                                              'bg-blue-100 text-blue-850 border border-blue-200 text-blue-805 font-bold'
                                            }`}>
                                              {u.role}
                                            </span>
                                            {isSuperAdmin && (
                                              <span className="text-[9px] bg-slate-100 border border-slate-200 px-1 py-0.5 rounded ml-1 text-slate-500 font-bold uppercase text-[9px]">Permanent</span>
                                            )}
                                          </td>
                                          <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                                              u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                              {u.status === 'active' ? '● Active' : '■ Suspended'}
                                            </span>
                                          </td>
                                          <td className="p-3 font-semibold text-slate-600">
                                            {u.customPermissions && u.customPermissions.length > 0 ? (
                                              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-150">
                                                {u.customPermissions.length} rules override
                                              </span>
                                            ) : (
                                              <span className="text-slate-400 text-[10px]">None (Role constraints apply)</span>
                                            )}
                                          </td>
                                          <td className="p-3 text-right space-x-1.5 shrink-0 whitespace-nowrap">
                                            <button
                                              onClick={() => {
                                                setEditingUser(u);
                                                setUserFormEmail(u.email);
                                                setUserFormName(u.name);
                                                setUserFormRole(u.role);
                                                setUserFormStatus(u.status);
                                                setUserFormPassword('');
                                                setUserFormCustomPermissions(u.customPermissions || []);
                                                setShowUserModal(true);
                                              }}
                                              disabled={isSuperAdmin && !isSelf}
                                              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition disabled:opacity-40 cursor-pointer"
                                            >
                                              Modify
                                            </button>
                                            <button
                                              onClick={() => handleAdminUserDelete(u.email)}
                                              disabled={isSuperAdmin}
                                              className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 text-[11px] font-bold rounded-lg transition disabled:opacity-40 cursor-pointer"
                                            >
                                              Revoke
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    });
                                  })()}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PHOTO APPROVALS BACKOFFICE PANEL */}
                    {adminActiveTab === 'photo_approvals' && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-fade-in text-slate-800 text-left">
                        <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-teal-200 mb-1 inline-block">HillyTrip Backoffice</span>
                            <h4 className="text-2xl font-extrabold text-slate-900">📸 Traveller Photo approvals</h4>
                            <p className="text-xs text-slate-500 mt-1 pb-0">
                              Approve or reject travelers' scenic device camera photographs for destinations.
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/admin/photo-contributions');
                                if (res.ok) {
                                  const data = await res.json();
                                  setAdminPhotoConts(data);
                                  setNotification({ type: 'success', message: 'HillyTrip contributions database synchronized!' });
                                }
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Pull Fresh photo queue
                          </button>
                        </div>

                        {/* STATS COUNT OVERVIEW */}
                        {(() => {
                          const total = adminPhotoConts.length;
                          const pending = adminPhotoConts.filter(c => c.status === 'Pending Approval').length;
                          const approved = adminPhotoConts.filter(c => c.status === 'Approved').length;
                          const rejected = adminPhotoConts.filter(c => c.status === 'Rejected').length;
                          return (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Total Uploads</p>
                                <p className="text-2xl font-extrabold text-slate-800 mt-1">{total}</p>
                              </div>
                              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                <p className="text-[10px] uppercase font-bold text-amber-600">Pending Review</p>
                                <p className="text-2xl font-extrabold text-amber-700 mt-1">{pending}</p>
                              </div>
                              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                <p className="text-[10px] uppercase font-bold text-emerald-600">Approved Live</p>
                                <p className="text-2xl font-extrabold text-emerald-700 mt-1">{approved}</p>
                              </div>
                              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                                <p className="text-[10px] uppercase font-bold text-rose-600">Rejected Archives</p>
                                <p className="text-2xl font-extrabold text-rose-700 mt-1">{rejected}</p>
                              </div>
                            </div>
                          );
                        })()}

                        {/* FILTER BAR CONTROLS */}
                        <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={adminSearchTerm}
                              onChange={(e) => setAdminSearchTerm(e.target.value)}
                              placeholder="Search uploader's name, email or destination id..."
                              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div className="w-full md:w-48">
                            <select
                              value={adminStatusFilter}
                              onChange={(e) => setAdminStatusFilter(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                            >
                              <option value="All">All statuses</option>
                              <option value="Pending Approval">Pending Approval</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                          <div className="w-full md:w-56 flex gap-2">
                            <select
                              value={adminSortField}
                              onChange={(e) => setAdminSortField(e.target.value as any)}
                              className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                            >
                              <option value="uploadedAt">Sort by Upload Date</option>
                              <option value="travellerName">Sort by Traveler Name</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => setAdminSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                              className="bg-white border border-slate-200 p-2 rounded-lg text-xs hover:bg-slate-50 font-bold"
                              title="Toggle direction"
                            >
                              {adminSortOrder === 'asc' ? '🔼' : '🔽'}
                            </button>
                          </div>
                        </div>

                        {/* BULK ACTIONS CONTROL BAR */}
                        {selectedPhotoContIds.length > 0 && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 animate-scale-up">
                            <span className="text-xs font-bold text-emerald-850">
                              Selected {selectedPhotoContIds.length} contributions for bulk action
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/admin/photo-contributions/bulk-approve', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ids: selectedPhotoContIds, reviewer: user ? (user.displayName || user.email) : 'Admin' })
                                    });
                                    if (res.ok) {
                                      setNotification({ type: 'success', message: `Bulk approved ${selectedPhotoContIds.length} submissions!` });
                                      setSelectedPhotoContIds([]);
                                      const syncRes = await fetch('/api/admin/photo-contributions');
                                      if (syncRes.ok) setAdminPhotoConts(await syncRes.json());
                                    }
                                  } catch (e: any) {
                                    setNotification({ type: 'error', message: 'Fail to execute bulk approval.' });
                                  }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-lg cursor-pointer transition shadow-xs"
                              >
                                Bulk Approve
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const reason = prompt('Please specify a common rejection reason for bulk action:');
                                  if (reason === null) return;
                                  try {
                                    const res = await fetch('/api/admin/photo-contributions/bulk-reject', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ids: selectedPhotoContIds, reviewer: user ? (user.displayName || user.email) : 'Admin', rejectionReason: reason || 'Not meeting photographic quality policies.' })
                                    });
                                    if (res.ok) {
                                      setNotification({ type: 'success', message: `Bulk rejected ${selectedPhotoContIds.length} submissions!` });
                                      setSelectedPhotoContIds([]);
                                      const syncRes = await fetch('/api/admin/photo-contributions');
                                      if (syncRes.ok) setAdminPhotoConts(await syncRes.json());
                                    }
                                  } catch (e: any) {
                                    setNotification({ type: 'error', message: 'Fail to execute bulk rejection.' });
                                  }
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold px-3.5 py-2 border border-rose-200 rounded-lg cursor-pointer transition"
                              >
                                Bulk Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedPhotoContIds([])}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-650 text-[11px] font-semibold px-3 py-2 rounded-lg cursor-pointer"
                              >
                                Cancel Select
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PHOTO QUEUE LISTING TABLE */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs bg-white">
                              <thead>
                                <tr className="border-b bg-slate-50 font-bold text-slate-500 font-mono">
                                  <th className="p-3 w-10">
                                    <input
                                      type="checkbox"
                                      checked={selectedPhotoContIds.length === adminPhotoConts.length && adminPhotoConts.length > 0}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedPhotoContIds(adminPhotoConts.map(c => c.id));
                                        } else {
                                          setSelectedPhotoContIds([]);
                                        }
                                      }}
                                    />
                                  </th>
                                  <th className="p-3">Photograph Preview</th>
                                  <th className="p-3">Traveller Profile</th>
                                  <th className="p-3">Dest Village</th>
                                  <th className="p-3">Submitted Date</th>
                                  <th className="p-3">Current Status</th>
                                  <th className="p-3 text-right">Moderations</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-sans">
                                {(() => {
                                  const filtered = adminPhotoConts.filter(cont => {
                                    const matchesStatus = adminStatusFilter === 'All' || cont.status === adminStatusFilter;
                                    const destName = destinations.find(d => d.id === cont.destinationId)?.name || '';
                                    const term = adminSearchTerm.toLowerCase();
                                    const matchesSearch = cont.travellerName.toLowerCase().includes(term) ||
                                                          cont.travellerEmail.toLowerCase().includes(term) ||
                                                          cont.destinationId.toLowerCase().includes(term) ||
                                                          destName.toLowerCase().includes(term);
                                    return matchesStatus && matchesSearch;
                                  });

                                  const sorted = filtered.sort((a, b) => {
                                    let cmpVal = 0;
                                    if (adminSortField === 'uploadedAt') {
                                      cmpVal = a.uploadedAt.localeCompare(b.uploadedAt);
                                    } else {
                                      cmpVal = a.travellerName.localeCompare(b.travellerName);
                                    }
                                    return adminSortOrder === 'asc' ? cmpVal : -cmpVal;
                                  });

                                  if (sorted.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400">
                                          No photo submissions matched current search triggers or sorting criteria.
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return sorted.map((cont) => {
                                    const destHub = destinations.find(d => d.id === cont.destinationId);
                                    const isRowSelected = selectedPhotoContIds.includes(cont.id);
                                    return (
                                      <tr key={cont.id} className={`hover:bg-slate-50 transition-colors ${isRowSelected ? 'bg-emerald-50/20' : ''}`}>
                                        <td className="p-3">
                                          <input
                                            type="checkbox"
                                            checked={isRowSelected}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedPhotoContIds(prev => [...prev, cont.id]);
                                              } else {
                                                setSelectedPhotoContIds(prev => prev.filter(x => x !== cont.id));
                                              }
                                            }}
                                          />
                                        </td>
                                        <td className="p-3">
                                          <div className="relative group flex items-center">
                                            <img
                                              src={cont.imageUrl}
                                              alt="Traveller scenic thumbnail"
                                              className="w-14 h-14 object-cover rounded-lg border shadow-xs cursor-zoom-in group-hover:scale-105 transition"
                                              referrerPolicy="no-referrer"
                                              onClick={() => setAdminFullSizePhotoUrl(cont.imageUrl)}
                                            />
                                          </div>
                                        </td>
                                        <td className="p-3 max-w-[170px]">
                                          <p className="font-extrabold text-slate-800 leading-none">{cont.travellerName}</p>
                                          <p className="text-[10px] text-slate-500 font-mono mt-1 break-all">{cont.travellerEmail}</p>
                                        </td>
                                        <td className="p-3 font-semibold text-slate-700">
                                          {destHub ? destHub.name : cont.destinationId}
                                        </td>
                                        <td className="p-3 text-slate-400 font-mono">
                                          {new Date(cont.uploadedAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase leading-none border ${
                                            cont.status === 'Approved' ? 'bg-emerald-100 text-emerald-805 border-emerald-200' :
                                            cont.status === 'Rejected' ? 'bg-rose-100 text-rose-805 border-rose-200' : 'bg-amber-100 text-amber-805 border-amber-200'
                                          }`}>
                                            {cont.status}
                                          </span>
                                        </td>
                                        <td className="p-3 text-right">
                                          <div className="flex justify-end gap-1.5 flex-wrap">
                                            {cont.status === 'Pending Approval' && (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={async () => {
                                                    try {
                                                      const res = await fetch(`/api/admin/photo-contributions/${cont.id}/approve`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ reviewer: user ? (user.displayName || user.email) : 'Admin' })
                                                      });
                                                      if (res.ok) {
                                                        setNotification({ type: 'success', message: 'Photo contribution successfully approved!' });
                                                        const syncRes = await fetch('/api/admin/photo-contributions');
                                                        if (syncRes.ok) setAdminPhotoConts(await syncRes.json());
                                                      }
                                                    } catch (e: any) {
                                                      setNotification({ type: 'error', message: 'Fail to approve!' });
                                                    }
                                                  }}
                                                  className="p-1 px-2.5 bg-emerald-650 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition shadow-xs cursor-pointer"
                                                >
                                                  Approve
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setAdminRejectionModalId(cont.id);
                                                    setAdminRejectionRes('');
                                                  }}
                                                  className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-200 cursor-pointer"
                                                >
                                                  Reject
                                                </button>
                                              </>
                                            )}
                                            {cont.status !== 'Pending Approval' && (
                                              <span className="text-[10px] text-slate-400 font-semibold p-1">Compleated</span>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AD-HOC FULL-SIZE LIGHTBOX DIALOG */}
                    {adminFullSizePhotoUrl && (
                      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="max-w-4xl w-full text-right relative animate-scale-up">
                          <button
                            type="button"
                            onClick={() => setAdminFullSizePhotoUrl(null)}
                            className="bg-white/10 text-white p-2.5 px-4 hover:bg-white/20 rounded-full transition mb-2 focus:outline-none cursor-pointer text-xs font-bold"
                          >
                            ✕ Close Full Size Preview
                          </button>
                          <img
                            src={adminFullSizePhotoUrl}
                            alt="Full traveller photo submission view"
                            className="w-full max-h-[80vh] object-contain rounded-2xl border-4 border-white/20 shadow-2xl mx-auto"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    )}

                    {/* AD-HOC REJECTION DIALOG REASON MODAL */}
                    {adminRejectionModalId && (
                      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-left text-slate-800 animate-scale-up">
                          <h4 className="text-base font-extrabold text-slate-900 text-left">❌ Specify Rejection Reason</h4>
                          <p className="text-xs text-slate-500">
                            Please describe why this scenic photograph does not conform to standards. This alerts the traveller instantly.
                          </p>
                          <textarea
                            value={adminRejectionRes}
                            onChange={(e) => setAdminRejectionRes(e.target.value)}
                            placeholder="e.g. Blurry artifacts or poor lighting..."
                            className="w-full p-3 text-xs bg-slate-50 border rounded-xl h-28 focus:ring-1 focus:ring-rose-500 outline-none"
                          />
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => setAdminRejectionModalId(null)}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition text-slate-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!adminRejectionRes.trim()}
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/admin/photo-contributions/${adminRejectionModalId}/reject`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      reviewer: user ? (user.displayName || user.email) : 'Admin',
                                      rejectionReason: adminRejectionRes
                                    })
                                  });
                                  if (res.ok) {
                                    setNotification({ type: 'success', message: 'Uploader has been notified of photo rejection.' });
                                    setAdminRejectionModalId(null);
                                    const syncRes = await fetch('/api/admin/photo-contributions');
                                    if (syncRes.ok) setAdminPhotoConts(await syncRes.json());
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AD-HOC IMAGE REJECTION DIALOG REASON MODAL */}
                    {adminImageRejectionModalId && (
                      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-left text-slate-800 animate-scale-up">
                          <h4 className="text-base font-extrabold text-slate-900 text-left">❌ Specify Image Rejection Reason</h4>
                          <p className="text-xs text-slate-500">
                            Please describe why this scenic photograph contribution does not conform to standards. This will notify the traveler instantly.
                          </p>
                          <textarea
                            value={adminImageRejectionRes}
                            onChange={(e) => setAdminImageRejectionRes(e.target.value)}
                            placeholder="e.g. Low resolution, blurry details, or incorrect destination mapping..."
                            className="w-full p-3 text-xs bg-slate-50 border rounded-xl h-28 focus:ring-1 focus:ring-rose-500 outline-none"
                          />
                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setAdminImageRejectionModalId(null);
                                setAdminImageRejectionRes('');
                              }}
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition text-slate-700 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!adminImageRejectionRes.trim()}
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  const res = await fetch(`/api/admin/images/${adminImageRejectionModalId}/reject`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'x-admin-password': 'admin123'
                                    },
                                    body: JSON.stringify({
                                      rejectionReason: adminImageRejectionRes
                                    })
                                  });
                                  if (res.ok) {
                                    setNotification({ type: 'success', message: 'Uploader has been notified of photo rejection.' });
                                    setAdminImageRejectionModalId(null);
                                    await loadAdminDashboard();
                                  } else {
                                    const errJson = await res.json();
                                    setNotification({ type: 'error', message: errJson.error || 'Failed to reject image.' });
                                  }
                                } catch (e) {
                                  console.error(e);
                                  setNotification({ type: 'error', message: 'Failed to communicate with authorization servers.' });
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                            >
                              Confirm Rejection
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {adminActiveTab === 'audit_logs' && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-fade-in text-slate-800 text-left">
                        <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <span className="bg-indigo-100 text-indigo-850 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border border-indigo-200 mb-1 inline-block">Security Compliance Desk</span>
                            <h4 className="text-2xl font-extrabold text-slate-900">📜 Unified Administrative Audit Trail & Registry</h4>
                            <p className="text-xs text-slate-500 mt-1 pb-0">
                              Chronological record of login trails, privilege escalations, additions of admins, deletions of moderators, and modified platform nodes.
                            </p>
                          </div>
                          <button
                            onClick={loadAdminManagementData}
                            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-none" /> Pull Fresh Trail
                          </button>
                        </div>

                        {/* Search & filters */}
                        <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              value={adminSearchQuery}
                              onChange={(e) => setAdminSearchQuery(e.target.value)}
                              placeholder="Filter trail by email address or action string details..."
                              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="w-full sm:w-48">
                            <select
                              value={adminAuditActionFilter}
                              onChange={(e) => setAdminAuditActionFilter(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 font-bold"
                            >
                              <option value="all">All Compliance Metrics</option>
                              <option value="Login Success">Successful Logins</option>
                              <option value="Login Failure">Unauthorized Breaches</option>
                              <option value="Modify User">Access Grants Revoked</option>
                              <option value="Add User">User Provision Registries</option>
                              <option value="Delete User">Node Purges</option>
                            </select>
                          </div>
                        </div>

                        {/* Logs container */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b bg-slate-50/75 text-slate-500 font-bold font-mono">
                                  <th className="p-3">Date Stamp Timestamp</th>
                                  <th className="p-3">Backoffice Operator / Email</th>
                                  <th className="p-3">Compliance Event Action</th>
                                  <th className="p-3">Action Description Summary</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-sans">
                                {(() => {
                                  const filteredLogs = allAuditLogs.filter(log => {
                                    const matchSearch = log.email.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                                                        log.action.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                                                        log.details.toLowerCase().includes(adminSearchQuery.toLowerCase());
                                    const matchAction = adminAuditActionFilter === 'all' || log.action === adminAuditActionFilter;
                                    return matchSearch && matchAction;
                                  });

                                  if (filteredLogs.length === 0) {
                                    return (
                                      <tr>
                                        <td colSpan={4} className="text-center py-10 text-slate-400">
                                          Zero auditable trails registered. Make changes or log in to generate logs.
                                        </td>
                                      </tr>
                                    );
                                  }

                                  // Stagger logs to have newest first
                                  const sortedLogs = [...filteredLogs].sort((a,b) => b.timestamp.localeCompare(a.timestamp));

                                  return sortedLogs.map((log) => {
                                    const hasRisk = log.action === 'Login Failure' || log.action === 'Delete User';
                                    return (
                                      <tr key={log.id} className={`hover:bg-slate-50 transition-colors ${hasRisk ? 'bg-red-50/25' : ''}`}>
                                        <td className="p-3 font-mono text-slate-450 whitespace-nowrap">
                                          {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-3 font-semibold text-slate-800">
                                          <div className="flex items-center gap-1.5 font-mono">
                                            <Shield className="w-3.5 h-3.5 text-slate-505 text-slate-400" />
                                            <span>{log.email}</span>
                                          </div>
                                        </td>
                                        <td className="p-3">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                                            log.action.includes('Success') ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                            log.action.includes('Failure') ? 'bg-red-100 text-red-800 border-red-205 animate-pulse' :
                                            log.action.includes('Modify') ? 'bg-purple-100 text-purple-800 border-purple-200 font-bold' :
                                            'bg-slate-100 text-slate-800 border-slate-200'
                                          }`}>
                                            {log.action}
                                          </span>
                                        </td>
                                        <td className="p-3 text-slate-600 font-medium md:max-w-md break-words">{log.details}</td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {adminActiveTab === 'app_notifications' && (
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-left animate-fade-in">
                        <AdminNotificationsTab adminEmail={user?.email || 'admin@hillytrip.com'} />
                      </div>
                    )}

                    {adminActiveTab === 'cover_management' && (
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-left animate-fade-in">
                        <AdminCoverManagementTab />
                      </div>
                    )}

                    {adminActiveTab === 'location-intelligence' && (
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-left animate-fade-in">
                        <AdminLocationIntelligenceTab />
                      </div>
                    )}

                    {adminActiveTab === 'partner-management' && (
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-left animate-fade-in">
                        <AdminPartnerManagementTab adminEmail={user?.email || 'admin@hillytrip.com'} />
                      </div>
                    )}

                    {/* MODAL WINDOW DIALOG FOR USER PROFILE WRITES OR EDITS */}
                    {showUserModal && (
                      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl animate-scale-up text-slate-800 text-left">
                          <div className="bg-slate-900 text-white p-6 flex justify-between items-center text-left">
                            <div>
                              <h3 className="text-lg font-bold leading-tight">
                                {editingUser ? '📐 Edit Backoffice Officer Profile' : '➕ Add Backoffice Officer Node'}
                              </h3>
                              <span className="text-[11px] text-slate-400 mt-1 block">Configure safety permissions and access rights</span>
                            </div>
                            <button
                              onClick={() => setShowUserModal(false)}
                              className="text-slate-400 hover:text-white transition cursor-pointer"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <form onSubmit={handleAdminUserSave} className="p-6 space-y-4">
                            <div>
                              <label className="text-xs uppercase font-bold text-slate-400 block mb-1">Registered Officer Email *</label>
                              <input
                                type="email"
                                required
                                disabled={!!editingUser}
                                value={userFormEmail}
                                onChange={(e) => setUserFormEmail(e.target.value)}
                                placeholder="e.g. sub-moderator@hillytrip.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs uppercase font-bold text-slate-400 block mb-1">Human Officer Username *</label>
                                <input
                                  type="text"
                                  required
                                  value={userFormName}
                                  onChange={(e) => setUserFormName(e.target.value)}
                                  placeholder="e.g. Tshering Lepcha"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs uppercase font-bold text-slate-400 block mb-1 font-semibold leading-none">Password {editingUser ? '(Optional Override)' : '*'}</label>
                                <input
                                  type="password"
                                  required={!editingUser}
                                  value={userFormPassword}
                                  onChange={(e) => setUserFormPassword(e.target.value)}
                                  placeholder={editingUser ? '••••••••' : 'Set password'}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 mt-1"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                              <div>
                                <label className="text-xs uppercase font-bold text-slate-400 block mb-1">Governance Access Role *</label>
                                <select
                                  value={userFormRole}
                                  onChange={(e) => {
                                    const nextRole = e.target.value;
                                    setUserFormRole(nextRole);
                                    // if changing to super admin, prefield custom overlaps
                                    if (nextRole === 'super_admin') {
                                      setUserFormCustomPermissions(allPermissions.map(p => p.id));
                                    }
                                  }}
                                  disabled={userFormEmail === 'mavanish24@gmail.com'}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                                >
                                  <option value="moderator">Backoffice Moderator (Limited)</option>
                                  <option value="admin">Platform Admin (Standard)</option>
                                  {adminUser?.role === 'super_admin' && (
                                    <option value="super_admin">System-Wide Super Admin (Full)</option>
                                  )}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs uppercase font-bold text-slate-400 block mb-1 text-left">Safety Active Status *</label>
                                <select
                                  value={userFormStatus}
                                  onChange={(e) => setUserFormStatus(e.target.value)}
                                  disabled={userFormEmail === 'mavanish24@gmail.com'}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                                >
                                  <option value="active">Active Session Allowed</option>
                                  <option value="suspended">Deactivated / Suspended Access</option>
                                </select>
                              </div>
                            </div>

                            {/* Custom Overrides selection checkboxes */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 max-h-48 overflow-y-auto">
                              <span className="text-[11px] block uppercase font-mono font-bold text-slate-500 border-b pb-1.5 leading-none text-left">
                                ⚙ Custom Overrides (Standard Permissions Mix-In)
                              </span>
                              
                              <div className="space-y-2">
                                {allPermissions.map(p => {
                                  const isChecked = userFormCustomPermissions.includes(p.id);
                                  return (
                                    <label key={p.id} className="flex items-start gap-2 text-xs font-medium text-slate-700 rounded hover:bg-slate-100 p-1 cursor-pointer transition select-none text-left">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={userFormRole === 'super_admin' || userFormEmail === 'mavanish24@gmail.com'}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setUserFormCustomPermissions([...userFormCustomPermissions, p.id]);
                                          } else {
                                            setUserFormCustomPermissions(userFormCustomPermissions.filter(id => id !== p.id));
                                          }
                                        }}
                                        className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                                      />
                                      <div>
                                        <span className="block font-bold text-[11px] leading-tight text-slate-800">{p.name} <code className="font-mono text-[9px] text-orange-700 bg-orange-50 px-1 rounded font-bold">({p.id})</code></span>
                                        <span className="text-[10px] text-slate-400 font-normal leading-tight block mt-0.5">{p.description}</span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="pt-3 border-t flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => setShowUserModal(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 rounded-lg cursor-pointer font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-xs text-white rounded-lg cursor-pointer font-extrabold shadow"
                              >
                                {editingUser ? 'Save Profile Matrix' : 'Provision Backoffice Agent'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPath === '/offline-center' && (
          <OfflineTravelHub
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            hubs={hubs}
            routes={routes}
            setNotification={setNotification}
          />
        )}

        {(currentPath === '/feedback' || currentPath === '/reviews') && (
          <ReviewCenter
            user={user}
            onLogin={handleUserLogin}
            isAdmin={isAdmin}
          />
        )}

        </React.Suspense>
      </main>

      {/* platform footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 relative z-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          
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
            <div className="flex items-center gap-2 text-left">
              <Compass className="w-8 h-8 text-emerald-400 animate-spin-slow" />
              <div>
                <span className="font-extrabold text-xl leading-none text-white tracking-tight">HillyTrip</span>
                <span className="text-[10px] text-slate-500 block mt-0.5 tracking-wider uppercase font-medium">India's Intelligent Mountain Travel Network</span>
              </div>
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

          {/* Admin Area (Significantly reduced prominence at the absolute footer base) */}
          <div className="mt-8 pt-4 border-t border-slate-900 flex justify-center">
            <button 
              onClick={() => navigate('#/admin')} 
              className="text-[10px] text-slate-700 hover:text-slate-500 hover:bg-slate-900/40 px-3 py-1.5 rounded font-mono transition-all duration-200 tracking-wider flex items-center gap-1.5 cursor-pointer border border-transparent"
            >
              <Shield className="w-3 h-3 text-slate-850" />
              Backoffice Admin Control Link
            </button>
          </div>

        </div>
      </footer>

      {/* Info Modals for Footer links */}
      {footerModalType && (
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
    </div>
  );
}
