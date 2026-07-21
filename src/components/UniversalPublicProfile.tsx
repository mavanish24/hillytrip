import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Award, MapPin, Clock, Calendar, Phone, Globe, 
  Facebook, Instagram, Star, Info, Image as ImageIcon, Check, 
  User, MessageSquare, Heart, AlertTriangle, ChevronRight, X, 
  Send, Sparkles, Navigation, ShieldAlert, BadgePercent, CalendarCheck, 
  ThumbsUp, Share2, Bookmark, CheckCircle2, ChevronLeft, Search, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { businessConfigurations } from './businessConfigurations';

interface UniversalPublicProfileProps {
  businessSlug: string;
  onNavigate?: (hash: string) => void;
  destinations?: any[];
  attractions?: any[];
  homestays?: any[];
  routes?: any[];
  hubs?: any[];
  user?: any;
}

// Preseeded Approved Registry of Businesses representing all major categories
const PRESEEDED_BUSINESSES: Record<string, any> = {
  'himalayan-homestay': {
    id: 'himalayan-homestay',
    slug: 'himalayan-homestay',
    name: 'Himalayan Mist Homestay & Organic Farm',
    category: 'homestay',
    rating: 4.9,
    reviewCount: 38,
    ownerName: 'Karma Tashi Gurung',
    description: 'Nestled in the misty hills of Takdah, Darjeeling, Himalayan Mist Homestay offers breathtaking views of the Kanchenjunga range. Run lovingly by the Gurung family, we provide cozy wooden-paneled rooms, fresh farm-to-table organic traditional cuisines, and guided nature trails through centuries-old tea gardens.',
    location: 'Takdah Cantonment, Darjeeling, West Bengal',
    state: 'West Bengal',
    district: 'Darjeeling',
    coordinates: { lat: 27.0375, lon: 88.3582 },
    startingPrice: 2500,
    priceRange: '₹2,500 - ₹4,500 per night',
    seasonalPricing: {
      peak: '₹3,500 / night (Oct - May)',
      offPeak: '₹2,500 / night (Jun - Sep)'
    },
    languagesSpoken: ['English', 'Hindi', 'Nepali'],
    yearsInBusiness: 6,
    certifications: [
      'Gorkhaland Territorial Administration (GTA) Tourism Registration',
      'West Bengal Tourism Dept Approved Homestay Permit',
      'HillyTrip Certified Host License'
    ],
    highlights: [
      'Stellar mountain-facing wooden balconies',
      '100% organic home-grown vegetables & cardamoms',
      'Direct walking trail to heritage colonial bungalow viewpoints',
      'Cozy evening bonfire setup with local folk instruments'
    ],
    contact: {
      phone: '+91 98320 12455',
      whatsapp: '+919832012455',
      email: 'karma.mist@hillytrip-partner.com',
      website: 'www.himalayanmisthomestay.com',
      facebook: 'https://facebook.com/himalayanmisthomestay',
      instagram: 'https://instagram.com/himalayan_mist_takdah'
    },
    businessHours: 'Open daily: 6:00 AM - 10:30 PM',
    services: [
      { name: 'Heritage Wooden Attic Suite', rate: '₹3,800/night', detail: 'Spacious loft bed, cozy seating area, direct mountain vistas' },
      { name: 'Standard Double Bed Room', rate: '₹2,500/night', detail: 'King size bed, en-suite bathroom, wooden floors' },
      { name: 'Organic Farming & Planting Tour', rate: '₹600/person', detail: 'Hands-on organic harvesting, tea plucking and processing session' },
      { name: 'Traditional Charcoal Barbecue Dinner', rate: '₹450/person', detail: 'Marinated slow-roasted hillside meats or paneer, hot local soup' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600', category: 'rooms', caption: 'Scenic Sunrise from Wood Balcony' },
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600', category: 'surroundings', caption: 'Mt. Kanchenjunga Range view' },
      { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600', category: 'surroundings', caption: 'Evening outdoor fireplace setup' },
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600', category: 'rooms', caption: 'Rustic Colonial Bedroom style' }
    ],
    trust: {
      healthScore: 98,
      safetyInfo: 'Equipped with oxygen cylinders, double fire extinguishers, certified clean drinking water, and round-the-clock emergency transport connection.',
      cancellationPolicy: 'Fully refundable up to 72 hours before check-in. 50% charge applicable post that.'
    }
  },
  'green-valley-taxi': {
    id: 'green-valley-taxi',
    slug: 'green-valley-taxi',
    name: 'Green Valley Mountain Cabs & Expeditions',
    category: 'taxi_operator',
    rating: 4.8,
    reviewCount: 52,
    ownerName: 'Rajesh Kumar Sharma',
    description: 'The leading high-altitude transport operator in Shimla. Specialized in reliable tourist transport across the Kalka-Shimla-Manali loop, hazardous mountain corridors (Spiti, Ladakh, Kinnaur), and scenic sightseeing. Our drivers are native hill professionals certified in extreme snow and landslide maneuvering.',
    location: 'Mall Road Near Main Stand, Shimla, Himachal Pradesh',
    state: 'Himachal Pradesh',
    district: 'Shimla',
    coordinates: { lat: 31.1048, lon: 77.1734 },
    startingPrice: 3200,
    priceRange: '₹3,200 - ₹7,500 per day',
    seasonalPricing: {
      peak: '₹4,500 / day (May - July, Dec - Jan)',
      offPeak: '₹3,200 / day (Aug - Nov)'
    },
    languagesSpoken: ['Hindi', 'English', 'Punjabi', 'Himachali'],
    yearsInBusiness: 8,
    certifications: [
      'Himachal Pradesh State Transport Operator Badge',
      'All India Tourist Permit (AITP) Licensed Fleet',
      'HillyTrip Certified Safe Driver Accreditation'
    ],
    highlights: [
      'Groomed 4x4 vehicles with winter snow-chains',
      'Drivers hold minimum 5 years high-elevation expertise',
      'Complimentary oxygen cannisters and medical first-aid on board',
      'Punctual flight and train connect pick-ups with real-time delays tracking'
    ],
    contact: {
      phone: '+91 98160 88211',
      whatsapp: '+919816088211',
      email: 'rajesh.greenvalley@hillytrip-partner.com',
      website: 'www.greenvalleymountaincabs.com',
      facebook: 'https://facebook.com/greenvalleymountaincabs',
      instagram: 'https://instagram.com/green_valley_cabs'
    },
    businessHours: 'Open daily: 24/7 Booking Dispatch',
    services: [
      { name: 'Innova Crysta Sightseeing (Full Day)', rate: '₹4,500/day', detail: 'Covers Kufri, Jakhoo, Mall road, local heritage buildings. Fits up to 7.' },
      { name: '4x4 Snowy Pass Gypsy Adventure', rate: '₹6,500/day', detail: 'Specialized deep snow pass transit. Highly experienced pilot.' },
      { name: 'Kalka Station to Shimla direct transfer', rate: '₹3,200/trip', detail: 'Point-to-point drop-off. Includes baggage loading.' },
      { name: 'Force Traveller Group Charter', rate: '₹9,500/day', detail: 'High-roof deluxe multi-passenger vehicle. Ideal for 12-16 guests.' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600', category: 'fleet', caption: 'Our Clean Innova Fleet at Rohtang Pass' },
      { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600', category: 'fleet', caption: 'Cozy leather seating interior detail' },
      { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600', category: 'surroundings', caption: 'Spectacular hairpin curves on mountain roads' }
    ],
    trust: {
      healthScore: 99,
      safetyInfo: 'Every cab undergoes a rigorous 42-point brake and steering suspension inspection every 3,000 km. Integrated speed limits enforced at 45km/h for ghat roads.',
      cancellationPolicy: 'Free cancellation up to 24 hours prior to scheduled pickup time.'
    }
  },
  'summit-trekking': {
    id: 'summit-trekking',
    slug: 'summit-trekking',
    name: 'Summit Horizons Trekking & Wilderness Expeditions',
    category: 'tour_operator',
    rating: 4.95,
    reviewCount: 41,
    ownerName: 'Pemba Sherpa',
    description: 'We are specialized mountaineers and wilderness guides based in Gangtok, organizing premium, low-impact trekking trails, base camp setups, and high altitude flora/fauna photography tours. Our mission is to combine professional high-altitude rescue preparedness with rich local Buddhist lore.',
    location: 'MG Marg Office Block C, Gangtok, Sikkim',
    state: 'Sikkim',
    district: 'East Sikkim',
    coordinates: { lat: 27.3314, lon: 88.6138 },
    startingPrice: 8500,
    priceRange: '₹8,500 - ₹24,000 per person',
    seasonalPricing: {
      peak: '₹9,800 (Autumn Trek - Oct/Nov)',
      offPeak: '₹8,500 (Spring Flowers - Mar/Apr)'
    },
    languagesSpoken: ['English', 'Hindi', 'Nepali', 'Tibetan'],
    yearsInBusiness: 10,
    certifications: [
      'IMF (Indian Mountaineering Foundation) Approved Operator License',
      'Sikkim State Tourism Registration Certificate',
      'LNT (Leave No Trace) Outdoor Ethics Charter Member'
    ],
    highlights: [
      'Led by IMF-certified guides and Sherpa mountaineers',
      'All high-altitude permits, state clearances & forest entries handled by us',
      'Premium dome camping gear and hot nutritious mountain-tailored food',
      'Advanced emergency responder kits and satellite-synced satellite radios'
    ],
    contact: {
      phone: '+91 99330 45112',
      whatsapp: '+919933045112',
      email: 'pemba@hillytrip-partner.com',
      website: 'www.summithorizonstreks.com',
      facebook: 'https://facebook.com/summithorizonstreks',
      instagram: 'https://instagram.com/summit_horizons_sikkim'
    },
    businessHours: 'Daily: 8:00 AM - 8:30 PM',
    services: [
      { name: 'Sandakphu Scenic Ridge Trek (3 Nights)', rate: '₹8,500/person', detail: 'View the Sleeping Buddha peak cluster. Standard food, guide & Alpine tents included.' },
      { name: 'Goechala Pass High Expedition (7 Nights)', rate: '₹16,500/person', detail: 'High-elevation challenging corridor trek passing sacred lakes.' },
      { name: 'Flora, Orchids & Birding Walk (Single Day)', rate: '₹2,500/person', detail: 'Guided day excursion around Fambonglho Wildlife Sanctuary.' }
    ],
    gallery: [
      { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600', category: 'trek', caption: 'High Ridge Trek overlooking glaciers' },
      { url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600', category: 'trek', caption: 'Base camp star-gazing dome setups' },
      { url: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600', category: 'trek', caption: 'Climbing team crossing high altitude passes' }
    ],
    trust: {
      healthScore: 97,
      safetyInfo: 'Strict daily check of blood oxygen (Pulse Oximetry) at base camps. Immediate downhill emergency evacuation protocols mapped out with regional defense heli-services.',
      cancellationPolicy: 'Refundable at 90% up to 10 days before trek start date. Non-refundable inside 3 days due to park permit reservations.'
    }
  }
};

// Seeded Reviews list for beautiful interactive rating distribution
const MOCK_REVIEWS_LIST: Record<string, any[]> = {
  'himalayan-homestay': [
    { id: 'r1', user: 'Ananya Roy', rating: 5, date: '2026-07-15', avatar: 'AR', text: 'This was an absolutely heavenly stay! Karma and his family treated us like personal guests. The home-cooked squash curry and chicken broth were outstanding. The wooden rooms smelled so sweet of fresh cedar pine. Highly recommend the tea walks.', reply: 'Thank you Ananya! We are so glad you loved our wooden cottage and organic garden food. Welcome back anytime!' },
    { id: 'r2', user: 'Devashish Sen', rating: 5, date: '2026-07-02', avatar: 'DS', text: 'Stunning vistas! Waking up to Kanchenjunga clear right in front of the balcony was unforgettable. If you are looking for peaceful village isolation away from Darjeeling commercial crowd, this is the gold standard.', reply: null },
    { id: 'r3', user: 'Sarah Thompson', rating: 4, date: '2026-06-21', avatar: 'ST', text: 'Beautiful location and family. The wooden attic was so atmospheric. It can get slightly chilly in the nights, but they gave us thick wool blankets and hot water bottles.', reply: 'Thanks Sarah! We are installing silent in-room heating elements next month to make attic nights even cozier.' }
  ],
  'green-valley-taxi': [
    { id: 'v1', user: 'Amitabh Gupta', rating: 5, date: '2026-07-18', avatar: 'AG', text: 'Professional driver Vikram was a real gem. Safe speed, very careful on mountain hairpin curves, and shared beautiful stories about local temples. The vehicle was perfectly vacuumed and clean.', reply: 'Thank you Amitabh ji! Vikram is a prized driver of ours who has driven these slopes for over a decade.' },
    { id: 'v2', user: 'Priyanjali Nair', rating: 4, date: '2026-07-05', avatar: 'PN', text: 'Excellent, punctual response. They picked us up right from Kalka Railway station on time despite our train being late by 40 minutes. Safe drive and reasonable pricing.', reply: 'We track train schedules in real-time, Priyanjali! Safe travels!' }
  ],
  'summit-trekking': [
    { id: 't1', user: 'Tenzing Norgay Jr', rating: 5, date: '2026-07-10', avatar: 'TN', text: 'Exceptional safety standards. Guides are true mountain brothers. Food served at 11,000 feet was outstanding and fresh. Do not book elsewhere if safety is your primary concern.', reply: 'Thujeychhe Tenzing! Safety is our religion on these cold ridges.' },
    { id: 't2', user: 'Vikramaditya Rao', rating: 5, date: '2026-06-25', avatar: 'VR', text: 'The Leave No Trace standards are highly followed, which made me so proud. Clear, authentic Sherpa stories around the bonfire night. Will book again for Goechala trek.', reply: null }
  ]
};

export default function UniversalPublicProfile({
  businessSlug,
  onNavigate,
  destinations = [],
  attractions = [],
  homestays = [],
  routes = [],
  hubs = [],
  user
}: UniversalPublicProfileProps) {
  
  // Try to find the business in our preseeded list or parse from active routes/homestays dynamic database
  const activeBusiness = useMemo(() => {
    // 1. Direct slug match in preseeded
    if (PRESEEDED_BUSINESSES[businessSlug]) {
      return PRESEEDED_BUSINESSES[businessSlug];
    }

    // 2. Search dynamic database homestays from prop if they match
    const foundHomestay = homestays.find(
      (h) => h.id === businessSlug || h.name.toLowerCase().replace(/\s+/g, '-').includes(businessSlug)
    );
    if (foundHomestay) {
      return {
        id: foundHomestay.id,
        slug: businessSlug,
        name: foundHomestay.name,
        category: 'homestay',
        rating: foundHomestay.rating || 4.8,
        reviewCount: foundHomestay.reviewCount || 12,
        ownerName: foundHomestay.ownerName || 'Verified Partner',
        description: foundHomestay.description || `Welcome to ${foundHomestay.name}. Enjoy authentic hospitality, pristine clean mountain environments, and home-style comfort in the heart of the Himalayas.`,
        location: foundHomestay.address || 'Himalayan Foothills, India',
        state: foundHomestay.state || 'West Bengal',
        district: foundHomestay.district || 'Darjeeling',
        startingPrice: foundHomestay.priceMin || 2200,
        priceRange: `₹${foundHomestay.priceMin || 2000} - ₹${foundHomestay.priceMax || 4000} per night`,
        languagesSpoken: foundHomestay.languages || ['Hindi', 'English', 'Nepali'],
        yearsInBusiness: 3,
        certifications: ['Verified Homestay License', 'HillyTrip Approved host'],
        highlights: foundHomestay.amenities || ['Scenic windows', 'Hot home water', 'Local dining options'],
        contact: {
          phone: foundHomestay.contact || '+91 99999 88888',
          whatsapp: foundHomestay.whatsappNumber || foundHomestay.contact || '9999988888',
          email: foundHomestay.email || 'support@hillytrip-partner.com',
          website: 'www.hillytrip.com'
        },
        businessHours: 'Open daily: 7:00 AM - 10:00 PM',
        services: (foundHomestay.roomTypes || ['Standard Mountain Room']).map((room: string) => ({
          name: room,
          rate: `₹${foundHomestay.priceMin || 2200}/night`,
          detail: 'Comfortable bed, fresh linen, clean attached washroom.'
        })),
        gallery: (foundHomestay.images && foundHomestay.images.length > 0) 
          ? foundHomestay.images.map((img: string, index: number) => ({ url: img, category: 'rooms', caption: `Cozy Space Room #${index + 1}` }))
          : [{ url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600', category: 'rooms', caption: 'Scenic Window View' }],
        trust: {
          healthScore: 96,
          safetyInfo: 'Cleaned and sanitized regularly, local emergency medical kits ready.',
          cancellationPolicy: 'Refundable up to 48 hours prior to check-in.'
        }
      };
    }

    // 3. Fallback generic profile derived from slug
    const cleanName = businessSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Attempt to guess business category from slug keywords
    let guessedCategory = 'homestay';
    if (businessSlug.includes('taxi') || businessSlug.includes('cab') || businessSlug.includes('rental')) {
      guessedCategory = 'taxi_operator';
    } else if (businessSlug.includes('trek') || businessSlug.includes('tour') || businessSlug.includes('expeditions')) {
      guessedCategory = 'tour_operator';
    } else if (businessSlug.includes('camp') || businessSlug.includes('glamp')) {
      guessedCategory = 'camping';
    } else if (businessSlug.includes('guide') || businessSlug.includes('sherpa')) {
      guessedCategory = 'local_guide';
    } else if (businessSlug.includes('kitchen') || businessSlug.includes('restaurant') || businessSlug.includes('cafe')) {
      guessedCategory = 'restaurant';
    }

    return {
      id: businessSlug,
      slug: businessSlug,
      name: cleanName,
      category: guessedCategory,
      rating: 4.8,
      reviewCount: 15,
      ownerName: 'Licensed Operator',
      description: `Providing certified high-fidelity ${guessedCategory.replace('_', ' ')} services inside the hilly corridors of the Himalayas. We guarantee reliable pricing, verified credentials, and local expertise.`,
      location: 'Main Bazar Corridor, Himachal & Sikkim Regions',
      state: 'Himachal Pradesh',
      district: 'Shimla',
      startingPrice: 3000,
      priceRange: '₹2,500 - ₹6,000 range',
      languagesSpoken: ['Hindi', 'English'],
      yearsInBusiness: 4,
      certifications: ['State Tourism Dept Licensed Partner', 'HillyTrip Premium Badged Vendor'],
      highlights: ['Fully certified & vetted staff', '100% upfront transparent pricing structure', '24/7 dedicated telephone support desk'],
      contact: {
        phone: '+91 94111 00011',
        whatsapp: '+919411100011',
        email: 'info@hillytrip-partner.com',
        website: 'www.hillytrip.com'
      },
      businessHours: 'Open Daily: 8:00 AM - 10:00 PM',
      services: [
        { name: 'Standard Mountain Package', rate: '₹3,000', detail: 'Fully curated local experience with certified mountain safety guides.' },
        { name: 'Premium Tailored Experience', rate: '₹5,500', detail: 'Custom scheduling, complimentary refreshments and private pick-ups.' }
      ],
      gallery: [
        { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600', category: 'rooms', caption: 'Scenic Mountains background' },
        { url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600', category: 'rooms', caption: 'Homestead Exterior view' }
      ],
      trust: {
        healthScore: 95,
        safetyInfo: 'Strict adherence to state transport regulations, certified safety bags and high-altitude emergency navigation devices.',
        cancellationPolicy: 'Refundable up to 48 hours prior to scheduled launch.'
      }
    };
  }, [businessSlug, homestays]);

  // Read config definitions for the selected category to dynamically adapt fields
  const config = useMemo(() => {
    return businessConfigurations[activeBusiness.category] || businessConfigurations.homestay;
  }, [activeBusiness]);

  // Gallery Active state
  const [activeGalleryCategory, setActiveGalleryCategory] = useState<'all' | string>('all');
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  // Virtual Tour State (Simulating 360 viewer cursor drag angle)
  const [virtualTourActive, setVirtualTourActive] = useState(false);
  const [dragAngle, setDragAngle] = useState(120); // starts at a scenic angle
  const [isDraggingTour, setIsDraggingTour] = useState(false);
  const [startX, setStartX] = useState(0);

  // Directions state
  const [startingPointInput, setStartingPointInput] = useState('');
  const [directionsPath, setDirectionsPath] = useState<any | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);

  // Booking CTA Modal open
  const [ctaModalOpen, setCtaModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // User review posting simulator state
  const [userRating, setUserRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState('');
  const [userReviewName, setUserReviewName] = useState('');
  const [postedReviews, setPostedReviews] = useState<any[]>([]);
  const [reviewsSortBy, setReviewsSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [reviewsFilterBy, setReviewsFilterBy] = useState<'all' | 'verified'>('all');
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState('');

  // SEO Tab for developer verification
  const [showSeoMetaView, setShowSeoMetaView] = useState(false);

  // Compute category color profiles
  const categoryColor = useMemo(() => {
    switch (activeBusiness.category) {
      case 'homestay':
      case 'hotel':
      case 'resort':
        return {
          primary: 'emerald',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        };
      case 'taxi_operator':
      case 'car_rental':
      case 'bike_rental':
        return {
          primary: 'amber',
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800/50',
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
        };
      case 'tour_operator':
      case 'trek_organizer':
      case 'adventure_provider':
        return {
          primary: 'sky',
          bg: 'bg-sky-50 dark:bg-sky-950/40',
          border: 'border-sky-200 dark:border-sky-800/50',
          text: 'text-sky-600 dark:text-sky-400',
          badge: 'bg-sky-500/10 text-sky-500 border-sky-500/20'
        };
      case 'local_guide':
        return {
          primary: 'purple',
          bg: 'bg-purple-50 dark:bg-purple-950/40',
          border: 'border-purple-200 dark:border-purple-800/50',
          text: 'text-purple-600 dark:text-purple-400',
          badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
        };
      case 'restaurant':
      case 'cafe':
        return {
          primary: 'rose',
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800/50',
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
        };
      default:
        return {
          primary: 'teal',
          bg: 'bg-teal-50 dark:bg-teal-950/40',
          border: 'border-teal-200 dark:border-teal-800/50',
          text: 'text-teal-600 dark:text-teal-400',
          badge: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
        };
    }
  }, [activeBusiness]);

  // Compute active dynamic reviews (preseeded + posted reviews)
  const activeReviews = useMemo(() => {
    const list = [...(MOCK_REVIEWS_LIST[activeBusiness.id] || []), ...postedReviews];
    if (reviewsSortBy === 'highest') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (reviewsSortBy === 'lowest') {
      return list.sort((a, b) => a.rating - b.rating);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeBusiness.id, postedReviews, reviewsSortBy]);

  // Compute rating percentage breakdown
  const ratingPercentages = useMemo(() => {
    const list = activeReviews;
    const count = list.length || 1;
    const map = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    list.forEach(r => {
      const rate = Math.round(r.rating) as 5|4|3|2|1;
      if (map[rate] !== undefined) map[rate]++;
    });
    return {
      5: Math.round((map[5] / count) * 100),
      4: Math.round((map[4] / count) * 100),
      3: Math.round((map[3] / count) * 100),
      2: Math.round((map[2] / count) * 100),
      1: Math.round((map[1] / count) * 100)
    };
  }, [activeReviews]);

  // Dynamic booking CTA labels
  const bookingCtaLabel = useMemo(() => {
    switch (activeBusiness.category) {
      case 'homestay':
      case 'hotel':
      case 'resort':
        return 'Book Mountain Room';
      case 'taxi_operator':
      case 'car_rental':
        return 'Reserve Taxi Operator';
      case 'bike_rental':
        return 'Reserve Rent Bike';
      case 'tour_operator':
      case 'trek_organizer':
        return 'Book Tour Package';
      case 'local_guide':
        return 'Hire Private Guide';
      case 'restaurant':
      case 'cafe':
        return 'Reserve Dining Table';
      default:
        return 'Book Experience Now';
    }
  }, [activeBusiness.category]);

  // Structured Data (JSON-LD) creation
  const jsonLdData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": activeBusiness.category === 'restaurant' ? "Restaurant" : "LocalBusiness",
      "name": activeBusiness.name,
      "image": activeBusiness.gallery?.[0]?.url || "",
      "priceRange": activeBusiness.priceRange,
      "telephone": activeBusiness.contact.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": activeBusiness.location,
        "addressLocality": activeBusiness.district,
        "addressRegion": activeBusiness.state,
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": activeBusiness.coordinates.lat,
        "longitude": activeBusiness.coordinates.lon
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": activeBusiness.rating,
        "reviewCount": activeReviews.length
      },
      "url": `${window.location.origin}/#/business/${activeBusiness.slug}`
    };
  }, [activeBusiness, activeReviews]);

  // Inject Structured Data script into DOM `<head>` for indexing realism
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const scriptId = `seo-jsonld-${activeBusiness.id}`;
      let scriptElement = document.getElementById(scriptId);
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLdData, null, 2);
      return () => {
        scriptElement?.remove();
      };
    }
  }, [jsonLdData, activeBusiness.id]);

  // Dynamic directions lookup using "Geospatial database" (mocked calculation)
  const handleCalculateDirections = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startingPointInput.trim()) return;

    setDirectionsLoading(true);
    setTimeout(() => {
      const routesSeeded = [
        { routeName: 'Scenic National Highway ghat road via Teesta Valley', distance: '42 km', duration: '1 hr 45 min', condition: 'Smooth curves, landslide safe' },
        { routeName: 'Alternative ridge route passing Peshok Pine Forests', distance: '48 km', duration: '2 hr 10 min', condition: 'Steep winding elevation, highly picturesque' }
      ];
      setDirectionsPath(routesSeeded);
      setDirectionsLoading(false);
    }, 900);
  };

  // Drag handles for 360° Virtual Tour simulator
  const handleTourMouseDown = (e: React.MouseEvent) => {
    setIsDraggingTour(true);
    setStartX(e.clientX);
  };

  const handleTourMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTour) return;
    const deltaX = e.clientX - startX;
    setStartX(e.clientX);
    setDragAngle(prev => (prev - deltaX * 0.4 + 360) % 360);
  };

  const handleTourMouseUpOrLeave = () => {
    setIsDraggingTour(false);
  };

  const triggerShare = () => {
    const fullUrl = `${window.location.origin}/#/business/${activeBusiness.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // AI Sentiment analysis simulator
  const triggerAiReviewSummary = () => {
    setAiAnalyzing(true);
    setAiSummaryOpen(true);
    setTimeout(() => {
      setAiAnalyzing(false);
      if (activeBusiness.category === 'homestay') {
        setAiSummaryText('💡 AI consensus: Travelers consistently praise the family’s warm hospitalities, pristine wooden architectural smell, and organic cardamoms. 98% positive sentiment with slight mention of cold attic nights (well mitigated by warm blankets).');
      } else if (activeBusiness.category === 'taxi_operator') {
        setAiSummaryText('💡 AI consensus: 100% positive ratings regarding driver Vikram’s safety and expertise on hazardous hairpin ghat bends. Praise centered on extreme clean interior vacuums and proactive oxygen kits.');
      } else {
        setAiSummaryText('💡 AI consensus: Excellent reviews highlighting strict ecological standards (Leave No Trace policy) and delicious mountain-tailored organic nutritional menus served at high altitude.');
      }
    }, 1200);
  };

  // Post dynamic review simulator
  const handlePostReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReviewText.trim()) return;
    const nameToPost = userReviewName.trim() || 'HillyTraveler';
    const newRev = {
      id: `r-user-${Date.now()}`,
      user: nameToPost,
      rating: userRating,
      date: new Date().toISOString().split('T')[0],
      avatar: nameToPost.substring(0, 2).toUpperCase(),
      text: userReviewText,
      reply: null,
      isUserGenerated: true
    };
    setPostedReviews(prev => [newRev, ...prev]);
    setUserReviewText('');
    setUserReviewName('');
  };

  // Find nearby businesses using "geospatial locations" inside existing props
  const nearbyBusinesses = useMemo(() => {
    const list: any[] = [];
    
    // Add other preseeded
    Object.values(PRESEEDED_BUSINESSES).forEach(b => {
      if (b.id !== activeBusiness.id) {
        // Calculate dynamic relative distance estimation
        list.push({
          id: b.id,
          name: b.name,
          category: b.category,
          location: b.location,
          image: b.gallery?.[0]?.url,
          rating: b.rating,
          startingPrice: b.startingPrice,
          distance: activeBusiness.id === 'himalayan-homestay' ? 4.2 : 12.8,
          slug: b.slug
        });
      }
    });

    // Match homestays prop if present
    homestays.forEach(h => {
      if (h.id !== activeBusiness.id && h.name !== activeBusiness.name) {
        list.push({
          id: h.id,
          name: h.name,
          category: 'homestay',
          location: h.address || 'Nearby Corridor',
          image: h.images?.[0] || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300',
          rating: h.rating || 4.7,
          startingPrice: h.priceMin || 2400,
          distance: 2.1,
          slug: h.id
        });
      }
    });

    return list.slice(0, 3);
  }, [activeBusiness, homestays]);

  // Gallery tabs list derived from business photos
  const galleryTabs = useMemo(() => {
    const categories = new Set<string>();
    activeBusiness.gallery.forEach((g: any) => {
      if (g.category) categories.add(g.category);
    });
    return ['all', ...Array.from(categories)];
  }, [activeBusiness]);

  const filteredGallery = useMemo(() => {
    if (activeGalleryCategory === 'all') return activeBusiness.gallery;
    return activeBusiness.gallery.filter((g: any) => g.category === activeGalleryCategory);
  }, [activeGalleryCategory, activeBusiness]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24" id="universal-profile-engine-root">
      
      {/* Dynamic SEO Indicators & Developer Check-in panel */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Universal Public Business Profile Engine</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Adaptive framework running on metadata. SSR compatible & structured schema ready.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowSeoMetaView(!showSeoMetaView)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-500/20 hover:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold rounded-xl transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showSeoMetaView ? 'Hide SEO Schema' : 'Inspect Schema Data'}</span>
          </button>
          <button
            onClick={() => { if (onNavigate) onNavigate('#/'); }}
            className="flex items-center gap-1 bg-slate-900 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Main Directory</span>
          </button>
        </div>
      </div>

      {/* Structured SEO Inspection Block */}
      <AnimatePresence>
        {showSeoMetaView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-950 text-slate-200 rounded-2xl p-6 border border-slate-800 font-mono text-xs space-y-4 shadow-inner"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest">Injected SEO Structured Data (JSON-LD)</span>
              <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-400">Head Script Synced</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-emerald-400 font-bold text-[10px] uppercase">Pre-Calculated Meta Header Tags</p>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 space-y-1 text-slate-300 text-[11px]">
                  <p><span className="text-slate-500">&lt;title&gt;</span> {activeBusiness.name} | Verified {config.name} at HillyTrip</p>
                  <p><span className="text-slate-500">&lt;meta name="description" content="</span>{activeBusiness.description.substring(0, 100)}..." /&gt;</p>
                  <p><span className="text-slate-500">&lt;meta property="og:type" content="</span>website" /&gt;</p>
                  <p><span className="text-slate-500">&lt;meta property="og:title" content="</span>{activeBusiness.name} - Verified Service" /&gt;</p>
                  <p><span className="text-slate-500">&lt;meta name="twitter:card" content="</span>summary_large_image" /&gt;</p>
                  <p><span className="text-slate-500">&lt;link rel="canonical" href="</span>{jsonLdData.url}" /&gt;</p>
                </div>
              </div>
              <div>
                <p className="text-amber-400 font-bold text-[10px] uppercase">Active JSON-LD Schema Payload</p>
                <pre className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 text-[10px] text-slate-400 overflow-x-auto max-h-48">
                  {JSON.stringify(jsonLdData, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION (Cover image + logo overlay + crucial labels) */}
      <div className="relative bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-850 shadow-sm">
        {/* Cover Picture */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img 
            src={activeBusiness.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200'} 
            alt={activeBusiness.name}
            className="w-full h-full object-cover select-none pointer-events-none transform hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
        </div>

        {/* Floating Quick Action Overlays on Cover Banner */}
        <div className="absolute top-4 right-4 z-10 flex gap-2.5">
          <button 
            onClick={() => setSaveStatus(!saveStatus)}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-950 text-white rounded-xl backdrop-blur-sm transition cursor-pointer border border-white/10"
            title="Save Business"
          >
            <Bookmark className={`w-4 h-4 ${saveStatus ? 'fill-amber-400 text-amber-400' : 'text-white'}`} />
          </button>
          <button 
            onClick={triggerShare}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-950 text-white rounded-xl backdrop-blur-sm transition cursor-pointer border border-white/10 relative"
            title="Copy Public URL"
          >
            <Share2 className="w-4 h-4" />
            <AnimatePresence>
              {shareCopied && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 top-12 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap"
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Profile Logo & Credentials Overlay layout */}
        <div className="p-6 md:p-8 relative -mt-16 md:-mt-20 z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
              {/* circular Business Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-950 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <img 
                  src={activeBusiness.gallery?.[1]?.url || activeBusiness.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=150'} 
                  alt={activeBusiness.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Title & Basic Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryColor.badge}`}>
                    {config.name || activeBusiness.category}
                  </span>
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>HillyTrip Verified</span>
                  </div>
                </div>

                <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {activeBusiness.name}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeBusiness.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px]">{activeBusiness.businessHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Ratings & Status Overview block */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end gap-3 pt-4 md:pt-0 border-t border-slate-150 dark:border-slate-850 md:border-t-0 w-full md:w-auto">
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-mono font-black text-sm">{activeBusiness.rating}</span>
                <span className="text-slate-400 text-[10px] font-bold">({activeReviews.length} reviews)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Open for Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout of Body Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ABOUT, SERVICES, PRICING, MAP LOCATION, REVIEWS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* A. ABOUT SECTION */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-850 space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>About Host & Business</span>
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeBusiness.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Languages Spoken</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeBusiness.languagesSpoken.map((lang: string) => (
                    <span key={lang} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Experience & Registry</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Active for over {activeBusiness.yearsInBusiness} continuous years
                </p>
              </div>
            </div>

            {/* highlights bento blocks */}
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Business Highlights</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeBusiness.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* B. IMAGE EXPERIENCE (Lightbox gallery + 360 viewer simulator) */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-850 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>Media & Visual Experience</span>
              </h3>

              {/* Gallery category filters */}
              <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {galleryTabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveGalleryCategory(tab)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      activeGalleryCategory === tab 
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab view selection: Standard vs 360° Simulator */}
            <div className="flex items-center gap-3 border-b border-slate-150 dark:border-slate-850 pb-3">
              <button
                onClick={() => setVirtualTourActive(false)}
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${!virtualTourActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400'}`}
              >
                Photo Gallery ({filteredGallery.length})
              </button>
              <button
                onClick={() => setVirtualTourActive(true)}
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${virtualTourActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400'}`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                <span>360° Virtual Tour (Interactive)</span>
              </button>
            </div>

            {!virtualTourActive ? (
              /* Photo Grid gallery with lightbox link */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredGallery.map((img: any, idx: number) => (
                  <div 
                    key={idx}
                    onClick={() => setLightboxImageIndex(idx)}
                    className="group relative h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer border border-slate-150 dark:border-slate-850"
                  >
                    <img 
                      src={img.url} 
                      alt={img.caption || 'Business Image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <p className="text-[9px] text-white font-bold leading-tight line-clamp-1">{img.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 360 Degree Virtual Tour drag-based simulator */
              <div className="space-y-3">
                <div 
                  onMouseDown={handleTourMouseDown}
                  onMouseMove={handleTourMouseMove}
                  onMouseUp={handleTourMouseUpOrLeave}
                  onMouseLeave={handleTourMouseUpOrLeave}
                  className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center cursor-grab select-none active:cursor-grabbing"
                >
                  {/* Sliding panorama effect based on dragAngle */}
                  <div 
                    className="absolute inset-0 w-[400%] h-full bg-cover bg-center transition-all duration-75 opacity-75 pointer-events-none"
                    style={{ 
                      backgroundImage: `url(${activeBusiness.gallery?.[0]?.url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200'})`,
                      transform: `translateX(-${(dragAngle / 360) * 50}%)`
                    }}
                  />
                  {/* Grid Lines Overlay representing VR depth */}
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 pointer-events-none" />
                  
                  {/* Floating compass overlay */}
                  <div className="absolute bottom-4 left-4 bg-slate-950/80 text-white font-mono text-[9px] px-2 py-1 rounded border border-slate-800">
                    Bearing: {Math.round(dragAngle)}° {dragAngle > 315 || dragAngle < 45 ? 'North' : dragAngle < 135 ? 'East' : dragAngle < 225 ? 'South' : 'West'}
                  </div>

                  {/* Drag prompts */}
                  <div className="absolute bg-slate-950/90 text-white px-4 py-2.5 rounded-xl border border-slate-800 text-center pointer-events-none space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-400">Drag to look around 360°</p>
                    <p className="text-[10px] text-slate-400">Simulating virtual room panorama</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-normal">
                  💡 Drag left or right inside the viewport above to slide bearing orientations. Fully future-ready for WebVR & gyroscope orientation sensors.
                </p>
              </div>
            )}
          </div>

          {/* C. SERVICES SECTION (Dynamically generated, never hardcoded) */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-850 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-500" />
                <span>Dynamic Roster of Services</span>
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Config Driven
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBusiness.services.map((srv: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{srv.name}</h4>
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{srv.rate}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{srv.detail}</p>
                  </div>
                  <button 
                    onClick={() => setCtaModalOpen(true)}
                    className="w-full mt-2 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-[10px] font-bold uppercase tracking-wider rounded-lg transition text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-950 cursor-pointer text-center"
                  >
                    Inquire Details
                  </button>
                </div>
              ))}
            </div>

            {/* Detailed Pricing & Seasonals */}
            <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Seasonal Tariff & Rates Overview</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-400">Starting Price Index</span>
                  <p className="font-mono font-black text-slate-800 dark:text-white text-sm">
                    ₹{activeBusiness.startingPrice} <span className="text-[10px] text-slate-500 font-normal">base rate</span>
                  </p>
                </div>
                {activeBusiness.seasonalPricing && (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-slate-400">Peak Seasons Rate (Oct - May)</span>
                      <p className="font-bold text-slate-800 dark:text-white">{activeBusiness.seasonalPricing.peak}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-[9px] text-slate-400 leading-normal">
                  <span className="font-bold text-slate-500">AI Dynamic Pricing:</span> Pre-configured parameters ready to auto-calculate high peak demand multipliers during regional snowfall bulletins.
                </p>
              </div>
            </div>
          </div>

          {/* D. LOCATION & GEOSPATIAL INTELLIGENCE */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-850 space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4 text-sky-500" />
              <span>Location & Mountain Geospatial Index</span>
            </h3>

            {/* Beautiful Custom Interactive SVG Map Placeholder */}
            <div className="relative h-64 bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800 shadow-inner flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10" viewBox="0 0 400 200" fill="none">
                <path d="M0 160 C100 120, 200 180, 300 130 C350 110, 380 140, 400 110" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M0 190 Q120 130, 240 180 T400 150" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="150" cy="140" r="15" stroke="currentColor" strokeWidth="1" />
                <circle cx="280" cy="110" r="25" stroke="currentColor" strokeWidth="1" />
              </svg>

              {/* Peak elevations labels */}
              <div className="absolute top-4 left-4 bg-slate-950/80 text-[8px] text-slate-400 font-mono p-1 rounded">
                ELEV: {(activeBusiness.coordinates.lat * 100).toFixed(0)}m ABOVE MSL
              </div>

              {/* Interactive pins */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping absolute" />
                <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white z-10 border-2 border-white shadow-md">
                  <MapPin className="w-2.5 h-2.5" />
                </div>
                <div className="bg-slate-900 text-white font-bold text-[9px] px-2 py-1 rounded shadow-md mt-1 border border-slate-800 whitespace-nowrap">
                  {activeBusiness.name}
                </div>
              </div>

              {/* Other nearby icons mapped inside the visual map */}
              <div className="absolute top-1/3 left-1/4 flex flex-col items-center opacity-70">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[8px] text-slate-500 font-bold font-mono">Teesta River Valley</span>
              </div>

              <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center opacity-70">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[8px] text-slate-500 font-bold font-mono">Ghat Transit Hub</span>
              </div>
            </div>

            {/* Dynamic Directions lookup */}
            <form onSubmit={handleCalculateDirections} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Calculate Winding Distance & Mountain Fares</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={startingPointInput}
                    onChange={(e) => setStartingPointInput(e.target.value)}
                    placeholder="Enter your current village or hub (e.g. Siliguri, Shimla Stand, Gangtok)..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>Analyze Route</span>
                  </button>
                </div>
              </div>

              {directionsLoading && (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-indigo-500 font-bold uppercase font-mono">Analyzing elevations databases...</span>
                </div>
              )}

              {directionsPath && (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-3">
                  <p className="text-[10px] text-slate-500 font-mono uppercase font-bold">Top Verified Elevation Corridors</p>
                  <div className="space-y-2">
                    {directionsPath.map((dp: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-xs border-b border-slate-100 dark:border-slate-800/80 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{dp.routeName}</p>
                          <p className="text-[10px] text-slate-400">Condition: {dp.condition}</p>
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <p className="font-mono font-bold text-slate-900 dark:text-white">{dp.distance}</p>
                          <p className="text-[10px] text-slate-400 font-mono">~{dp.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Geospatial Nearby list using master location intelligence */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nearby Landmarks & Services</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Villages Nearby</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Pedong (1.8 km)</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Taxi Stand</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Takdah Stand (350m)</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Transit Hub</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Darjeeling (18 km)</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Medical Support</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300">Teesta Clinic (4.2 km)</p>
                </div>
              </div>
            </div>
          </div>

          {/* E. REVIEWS SECTION */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-850 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-amber-500" />
                <span>Traveler Reviews & Feedback</span>
              </h3>

              {/* AI review consensus button */}
              <button
                onClick={triggerAiReviewSummary}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                <span>AI Review consensus</span>
              </button>
            </div>

            {/* AI Review Summary panel */}
            <AnimatePresence>
              {aiSummaryOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-2xl text-xs text-indigo-950 dark:text-indigo-250 leading-relaxed relative"
                >
                  <button 
                    onClick={() => setAiSummaryOpen(false)}
                    className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {aiAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-bold uppercase tracking-wider text-[10px]">Analyzing past visitor comments...</span>
                    </div>
                  ) : (
                    <p>{aiSummaryText}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rating percentage distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-850">
              <div className="text-center space-y-1">
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{activeBusiness.rating}</p>
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(activeBusiness.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">{activeReviews.length} Verified Bookings</p>
              </div>

              {/* Bars */}
              <div className="md:col-span-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const pct = (ratingPercentages as any)[stars] || 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-3 font-bold font-mono text-right">{stars}</span>
                      <Star className="w-3 h-3 fill-slate-400 text-slate-400" />
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 font-mono text-[10px] text-slate-400 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sorting controls */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Feedback Feed</span>
              <div className="flex items-center gap-3">
                <select
                  value={reviewsSortBy}
                  onChange={(e: any) => setReviewsSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Star</option>
                  <option value="lowest">Lowest Star</option>
                </select>
              </div>
            </div>

            {/* Feed list */}
            <div className="space-y-5">
              {activeReviews.map((r: any) => (
                <div key={r.id} className="space-y-3 text-xs border-b border-slate-100 dark:border-slate-850 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold font-mono">
                        {r.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{r.user}</p>
                        <p className="text-[10px] text-slate-400">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[9px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified Booking</span>
                    </div>
                  </div>

                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {r.text}
                  </p>

                  {/* Owner replies block */}
                  {r.reply && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-850 space-y-1 ml-4 border-l-4 border-l-indigo-500">
                      <p className="font-bold text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                        <span>Reply from Owner</span>
                        <Check className="w-3 h-3" />
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                        {r.reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Post your review simulator */}
            <form onSubmit={handlePostReviewSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulate Leaving a Review</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={userReviewName}
                    onChange={(e) => setUserReviewName(e.target.value)}
                    placeholder="e.g. Priyanjali Sen"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Star Rating</label>
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Review Message</label>
                <textarea
                  rows={3}
                  required
                  value={userReviewText}
                  onChange={(e) => setUserReviewText(e.target.value)}
                  placeholder="Share details of your experience with other mountain travelers..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Verified Feedback</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING SIDEBAR CARD, TRUST & SECURITY, CONTACTS */}
        <div className="space-y-8">
          
          {/* 1. BOOKING CTA INTERACTIVE WIDGET */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6 shadow-xl sticky top-4">
            <div className="space-y-2">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">Dynamic Price Index</span>
              <p className="text-2xl font-black tracking-tight text-white font-mono">
                {activeBusiness.priceRange}
              </p>
              <p className="text-[10px] text-slate-400 leading-normal">
                Includes verified driver/host insurance coverage, standard tourist tax, and Leave-No-Trace environment contributions.
              </p>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Operator Health Score</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{activeBusiness.trust.healthScore}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Years Registered</span>
                <span className="font-bold text-indigo-400">{activeBusiness.yearsInBusiness} Years</span>
              </div>
            </div>

            {/* Dynamic CTA determined purely by config */}
            <button
              onClick={() => setCtaModalOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl transition cursor-pointer text-center shadow-lg hover:shadow-emerald-500/10"
            >
              {bookingCtaLabel}
            </button>

            {/* Offers/Coupons future-ready */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[9px] tracking-wider">
                <BadgePercent className="w-4 h-4" />
                <span>Offers & Coupons Available</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Claim <span className="font-bold text-emerald-400">10% early-bird discount</span> for off-season autumn journeys starting next October.
              </p>
              <button
                onClick={() => alert('Coupon Code: HILLY10 Claimed successfully!')}
                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 underline uppercase tracking-widest cursor-pointer"
              >
                Claim Coupon
              </button>
            </div>
          </div>

          {/* 2. CONTACT DETAILS & HOURS OF OPERATION */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-850 space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Contact Directory</span>
            </h3>

            <div className="space-y-4 text-xs">
              <a 
                href={`tel:${activeBusiness.contact.phone}`}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 hover:border-indigo-500/40 transition cursor-pointer"
              >
                <Phone className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Call</p>
                  <p className="font-bold text-slate-800 dark:text-white font-mono">{activeBusiness.contact.phone}</p>
                </div>
              </a>

              <a 
                href={`https://wa.me/${activeBusiness.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 hover:border-emerald-500/40 transition cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">WhatsApp Message</p>
                  <p className="font-bold text-emerald-500 font-mono">Chat Online 24/7</p>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Business Hours</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 font-mono">{activeBusiness.businessHours}</p>
                </div>
              </div>
            </div>

            {/* Social handles */}
            <div className="flex items-center gap-3 justify-center pt-2 border-t border-slate-100 dark:border-slate-850">
              {activeBusiness.contact.facebook && (
                <a href={activeBusiness.contact.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {activeBusiness.contact.instagram && (
                <a href={activeBusiness.contact.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {activeBusiness.contact.website && (
                <a href={`https://${activeBusiness.contact.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* 3. TRUST & VERIFICATION TIMELINE */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-850 space-y-6">
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Trust & Safety Audit</span>
            </h3>

            {/* Audit list */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Verified Legal Credentials</p>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  {activeBusiness.certifications.map((cert: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Ground Safety Protocols</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                  {activeBusiness.trust.safetyInfo}
                </p>
              </div>

              {/* Verification Timeline audit trail */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verification timeline</p>
                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                    <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Stage 1: Operator Onboarding Complete</p>
                    <p className="text-[9px] text-slate-400">Passed automated digital fraud filters.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                    <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Stage 2: Regulatory Document Audit Passed</p>
                    <p className="text-[9px] text-slate-400">All local permissions, tax PAN cards, and licenses cross-checked manually.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                    <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">Stage 3: Ground Safety Inspection Verified</p>
                    <p className="text-[9px] text-slate-400">HillyTrip regional representatives certified mountain equipment safety guidelines.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. RELATED BUSINESSES (location + category similar search nearby) */}
      <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-850 space-y-6">
        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Similar Mountain Operators Nearby</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nearbyBusinesses.map((b: any) => (
            <div 
              key={b.id}
              onClick={() => { if (onNavigate) onNavigate(`#/business/${b.slug}`); }}
              className="group bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 hover:border-indigo-500/40 p-4 rounded-2xl cursor-pointer transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={b.image} 
                    alt={b.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[8px] text-slate-200 font-bold uppercase tracking-wider border border-slate-800">
                    📍 {b.distance} km away
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[9px] text-indigo-500 font-bold uppercase font-mono tracking-wider">
                    {b.category.replace('_', ' ')}
                  </span>
                  <h4 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors uppercase tracking-tight text-[11px] leading-tight">
                    {b.name}
                  </h4>
                  <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{b.rating}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                <span>Starts</span>
                <span className="font-bold text-slate-800 dark:text-white">₹{b.startingPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. FUTURE READY: RESERVATION CTA DIALOG MODAL (Satisfying Book Now action) */}
      <AnimatePresence>
        {ctaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative text-slate-800 dark:text-slate-100"
            >
              <button 
                onClick={() => setCtaModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Verified Connect Gateway
                </span>
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Contact host: {activeBusiness.ownerName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  You are opening a direct, zero-commission verified link with {activeBusiness.name}.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 text-xs space-y-2">
                <p className="font-bold uppercase text-[10px] text-slate-400">Direct Inquiries Directory</p>
                <div className="space-y-1.5">
                  <p className="flex justify-between">
                    <span className="text-slate-400">WhatsApp Dispatch:</span>
                    <a href={`https://wa.me/${activeBusiness.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-mono text-emerald-500 hover:underline font-bold">
                      {activeBusiness.contact.phone}
                    </a>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Direct Desk Phone:</span>
                    <a href={`tel:${activeBusiness.contact.phone}`} className="font-mono text-indigo-500 hover:underline font-bold">
                      {activeBusiness.contact.phone}
                    </a>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Official Web Desk:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">{activeBusiness.contact.website}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Or launch direct telephone route</p>
                <a
                  href={`tel:${activeBusiness.contact.phone}`}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl block text-center transition shadow-lg shadow-emerald-500/15"
                >
                  Call {activeBusiness.ownerName} Now
                </a>
              </div>

              <p className="text-[9px] text-slate-400 text-center leading-normal">
                🛡️ HillyTrip Guarantee: We enforce zero commercial commissions on phone transactions to foster sustainable community host growth.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. LIGHTBOX FULLSCREEN VIEW */}
      <AnimatePresence>
        {lightboxImageIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-6">
            <div className="flex items-center justify-between text-white text-xs">
              <span className="font-mono text-slate-400">Photo {lightboxImageIndex + 1} of {filteredGallery.length}</span>
              <button 
                onClick={() => setLightboxImageIndex(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center">
              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImageIndex(prev => prev !== null ? (prev - 1 + filteredGallery.length) % filteredGallery.length : null);
                }}
                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <img 
                src={filteredGallery[lightboxImageIndex]?.url} 
                alt="Fullscreen"
                className="max-w-full max-h-[80vh] object-contain rounded-xl select-none"
                referrerPolicy="no-referrer"
              />

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImageIndex(prev => prev !== null ? (prev + 1) % filteredGallery.length : null);
                }}
                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center text-white space-y-1 pb-4">
              <p className="text-sm font-bold">{filteredGallery[lightboxImageIndex]?.caption}</p>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">{filteredGallery[lightboxImageIndex]?.category}</p>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
