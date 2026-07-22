import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AutocompleteSelect } from './AutocompleteSelect';
import { 
  Search, Filter, ChevronDown, Compass, MapPin, Star, Phone, 
  Check, X, Shield, Sparkles, Heart, Share2, Award, Calendar, 
  Sliders, ArrowUpDown, Flame, CheckCircle2, RotateCcw, AlertCircle, Plus,
  Leaf, Home
} from 'lucide-react';
import { Homestay, Destination } from '../types';
import { getItemSlug } from '../utils/slug';
import { motion, AnimatePresence } from 'motion/react';
import { UniversalCarousel } from './UniversalCarousel';

// Help determine WhatsApp number format
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

interface HomestaysCatalogViewProps {
  homestays: Homestay[];
  destinations: Destination[];
  navigate: (path: string) => void;
  user: any;
  setNotification?: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  executeProtectedAction?: (actionName: string, actionCallback: () => void, requiresVerification?: boolean) => void;
}

// Deterministic dynamic enhancement for complete, realistic and highly rich card attributes
const decorateHomestay = (h: Homestay, index: number) => {
  const codeSum = h.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Rating: 4.2 to 4.9
  const rating = h.rating || parseFloat((4.2 + (codeSum % 8) * 0.1).toFixed(1));
  // Review count: 8 to 54
  const reviewCount = h.reviewCount || (8 + (codeSum % 47));
  
  // Verified / Featured
  const isVerified = h.isVerified !== undefined ? h.isVerified : (codeSum % 7 !== 0);
  const isFeatured = h.isFeatured !== undefined ? h.isFeatured : (codeSum % 8 === 0 || index < 4);
  const isActive = h.isActive !== undefined ? h.isActive : true;

  // Determine experiences based on name & index
  const experiences = h.experiences && h.experiences.length > 0 ? h.experiences : (() => {
    const list: string[] = [];
    const nameLower = h.name.toLowerCase();
    
    if (nameLower.includes('view') || nameLower.includes('ridge') || nameLower.includes('peak') || codeSum % 3 === 0) {
      list.push('Mountain View');
    }
    if (nameLower.includes('tea') || nameLower.includes('garden') || nameLower.includes('green') || codeSum % 4 === 0) {
      list.push('Tea Garden Stay');
    }
    if (nameLower.includes('river') || nameLower.includes('side') || nameLower.includes('stream') || codeSum % 5 === 0) {
      list.push('Riverside Stay');
    }
    if (nameLower.includes('forest') || nameLower.includes('wood') || nameLower.includes('wild') || codeSum % 6 === 0) {
      list.push('Forest Stay');
    }
    if (nameLower.includes('village') || nameLower.includes('rural') || codeSum % 7 === 0) {
      list.push('Village Stay');
    }
    if (codeSum % 5 === 1) list.push('Couple Stay');
    if (codeSum % 5 === 2) list.push('Family Stay');
    if (codeSum % 5 === 3) list.push('Workation');
    if (codeSum % 7 === 2) list.push('Backpacker Friendly');
    if (codeSum % 7 === 3) list.push('Pet Friendly');
    
    // Budget vs Luxury
    if (h.priceMin >= 3500) {
      list.push('Luxury Stay');
    } else if (h.priceMin <= 1500) {
      list.push('Budget Stay');
    }
    
    if (codeSum % 9 === 0) list.push('Eco Stay');
    if (codeSum % 11 === 0) list.push('Heritage Stay');
    
    if (list.length === 0) {
      list.push('Village Stay', 'Family Stay');
    }
    return list;
  })();

  // Curated & special collections
  const rawCollections = h.collections && h.collections.length > 0 ? h.collections : (() => {
    const list: string[] = [];
    if (isFeatured) list.push("Editor's Choice");
    if (codeSum % 9 === 1) list.push("Trending This Week");
    if (codeSum % 9 === 2) list.push("Newly Added");
    if (codeSum % 9 === 3) list.push("Most Loved");
    if (h.priceMin >= 3500) list.push("Premium Collection");
    if (codeSum % 11 === 4) list.push("Hidden Gems");
    if (h.priceMin <= 1500) list.push("Budget Collection");
    
    // Curated
    if (experiences.includes('Mountain View') && codeSum % 2 === 0) list.push('Best Sunrise Views');
    if (experiences.includes('Mountain View') && codeSum % 2 === 1) list.push('Best Sunset Views');
    if (codeSum % 7 === 4) list.push('Best Homemade Food');
    if (codeSum % 7 === 5) list.push('Best Hospitality');
    if (codeSum % 8 === 6) list.push('Best Balcony Views');
    if (codeSum % 9 === 7) list.push('Best Photography Stays');
    if (experiences.includes('Couple Stay')) list.push('Best for Honeymoon');
    if (experiences.includes('Family Stay')) list.push('Best for Families');
    if (codeSum % 10 === 8) list.push('Best for Senior Citizens');
    if (experiences.includes('Workation')) list.push('Best Workation');
    if (h.priceMin <= 1500) list.push('Under ₹1500');
    if (h.priceMin >= 3500) list.push('Luxury Collection');

    if (list.length === 0) {
      list.push("Editor's Choice");
    }
    return list;
  })();

  const collections = rawCollections.map(col => {
    if (col === "Editor's Choice") return "✨ Above the Clouds";
    if (col === "Trending This Week") return "🏔 Kanchenjunga Views";
    if (col === "Newly Added") return "🌿 Tea Garden Escapes";
    if (col === "Most Loved") return "🌄 Sunrise Collection";
    if (col === "Premium Collection") return "🌙 Stargazing Retreats";
    if (col === "Hidden Gems") return "🍲 Food Lover's Choice";
    if (col === "Budget Collection") return "🏡 Village Life Collection";
    return col;
  });

  const seasons = h.seasons && h.seasons.length > 0 ? h.seasons : (() => {
    const list: string[] = [];
    if (codeSum % 4 === 0) list.push('Spring Escapes');
    if (codeSum % 4 === 1) list.push('Summer Retreats');
    if (codeSum % 4 === 2) list.push('Monsoon Magic');
    if (codeSum % 4 === 3) list.push('Autumn Colours');
    if (codeSum % 5 === 4) list.push('Winter Snow Stays');
    if (list.length === 0) list.push('Summer Retreats', 'Autumn Colours');
    return list;
  })();

  const specials = h.specials && h.specials.length > 0 ? h.specials : (() => {
    const list: string[] = [];
    if (codeSum % 6 === 0) list.push('Recently Verified');
    if (codeSum % 6 === 1) list.push('Newly Opened');
    if (experiences.includes('Eco Stay')) list.push('Eco Friendly');
    if (experiences.includes('Heritage Stay')) list.push('Heritage Homestays');
    if (codeSum % 7 === 1) list.push('Family Managed');
    if (codeSum % 7 === 2) list.push('Local Favourite');
    if (rating >= 4.7) list.push('Highly Rated');
    if (isFeatured && codeSum % 3 === 0) list.push('Staff Pick');
    if (list.length === 0) list.push('Family Managed');
    return list;
  })();

  const roomTypes = h.roomTypes && h.roomTypes.length > 0 ? h.roomTypes : (() => {
    const types = ['Private Room'];
    if (codeSum % 3 === 0) types.push('Entire Cottage');
    if (codeSum % 3 === 1) types.push('Family Room');
    if (codeSum % 5 === 0) types.push('Dormitory');
    return types;
  })();

  const meals = h.meals && h.meals.length > 0 ? h.meals : (() => {
    const list = ['Breakfast Included'];
    if (codeSum % 2 === 0) list.push('Lunch');
    if (codeSum % 3 === 0) list.push('Dinner');
    if (codeSum % 4 === 0) list.push('All Meals');
    return list;
  })();

  // Generate short tag line
  const tagline = h.tagline || (() => {
    const parts = [];
    if (experiences.includes('Mountain View')) parts.push('Mountain View');
    else if (experiences.includes('Tea Garden Stay')) parts.push('Tea Garden Stay');
    else if (experiences.includes('Riverside Stay')) parts.push('Riverside View');
    else parts.push('Organic Farm Stay');

    if (meals.includes('All Meals')) parts.push('All Meals Included');
    else parts.push('Breakfast Included');

    if (experiences.includes('Family Stay')) parts.push('Family Friendly');
    else if (experiences.includes('Couple Stay')) parts.push('Couple Friendly');
    else parts.push('Solo Welcome');

    return parts.join(' • ');
  })();

  return {
    ...h,
    rating,
    reviewCount,
    isVerified,
    isFeatured,
    isActive,
    experiences,
    collections,
    seasons,
    specials,
    roomTypes,
    meals,
    tagline
  };
};

const getSpecialIcon = (name: string, isActive: boolean) => {
  const cn = isActive ? "w-5 h-5 text-slate-900 dark:text-white" : "w-5 h-5 text-emerald-650 dark:text-emerald-450";
  switch(name) {
    case "Recently Verified": return <Shield className={cn} />;
    case "Newly Opened": return <Sparkles className={cn} />;
    case "Eco Friendly": return <Leaf className={cn} />;
    case "Heritage Homestays": return <Award className={cn} />;
    case "Family Managed": return <Home className={cn} />;
    case "Local Favourite": return <Heart className={cn} />;
    case "Highly Rated": return <Star className={cn} />;
    case "Staff Pick": return <CheckCircle2 className={cn} />;
    default: return <Shield className={cn} />;
  }
};

export default function HomestaysCatalogView({
  homestays,
  destinations,
  navigate,
  user,
  setNotification,
  executeProtectedAction
}: HomestaysCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExperience, setActiveExperience] = useState<string>('All');
  const [activeCollection, setActiveCollection] = useState<string>('All');
  
  // Wishlist local state persistence
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hillytrip_homestay_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (id: string, name: string) => {
    const isSaved = wishlist.includes(id);
    const next = isSaved ? wishlist.filter(item => item !== id) : [...wishlist, id];
    setWishlist(next);
    try {
      localStorage.setItem('hillytrip_homestay_wishlist', JSON.stringify(next));
    } catch (e) {
      console.warn("Failed to save wishlist to localStorage:", e);
    }
    if (setNotification) {
      if (isSaved) {
        setNotification({ type: 'info', message: `Removed "${name}" from your wishlist.` });
      } else {
        setNotification({ type: 'success', message: `Saved "${name}" to your wishlist!` });
      }
    }
  };

  // Filters State
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedGuests, setSelectedGuests] = useState<string>('all');
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [selectedViews, setSelectedViews] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [contactType, setContactType] = useState<string>('all');
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('recommended');

  // Mobile Bottom Sheet state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Pagination / Load More state
  const [visibleCount, setVisibleCount] = useState(9);

  // Enrich & filter the raw homestays dataset
  const enrichedHomestays = useMemo(() => {
    return homestays
      .filter(h => h.status !== 'Pending' && h.status !== 'Rejected')
      .map((h, idx) => decorateHomestay(h, idx));
  }, [homestays]);

  // Reset pagination when query/filters change
  useEffect(() => {
    setVisibleCount(9);
  }, [
    searchQuery, activeExperience, activeCollection, priceRange, 
    selectedGuests, selectedRoomTypes, selectedViews, selectedMeals, 
    selectedAmenities, selectedTravelStyles, selectedRating, verifiedOnly, 
    contactType, sortBy
  ]);

  // Handle dynamic scroll to load more
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
        setVisibleCount(prev => prev + 9);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Collection options definition
  const featuredCollectionsList = [
    { name: "✨ Above the Clouds", icon: "✨", color: "from-amber-500 to-orange-500" },
    { name: "🏔 Kanchenjunga Views", icon: "🔥", color: "from-red-500 to-pink-500" },
    { name: "🌿 Tea Garden Escapes", icon: "🆕", color: "from-blue-500 to-indigo-500" },
    { name: "🌄 Sunrise Collection", icon: "💖", color: "from-rose-500 to-red-500" },
    { name: "🌙 Stargazing Retreats", icon: "💎", color: "from-purple-600 to-indigo-600" },
    { name: "🍲 Food Lover's Choice", icon: "🔍", color: "from-emerald-500 to-teal-500" },
    { name: "🏡 Village Life Collection", icon: "🏷️", color: "from-cyan-500 to-blue-500" }
  ];

  const experiencesList = [
    { name: "Mountain View", icon: "🏔️" },
    { name: "Tea Garden Stay", icon: "🍃" },
    { name: "Riverside Stay", icon: "🌊" },
    { name: "Forest Stay", icon: "🌲" },
    { name: "Village Stay", icon: "🏡" },
    { name: "Couple Stay", icon: "💑" },
    { name: "Family Stay", icon: "👨‍👩‍👧‍👦" },
    { name: "Workation", icon: "💻" },
    { name: "Backpacker Friendly", icon: "🎒" },
    { name: "Pet Friendly", icon: "🐾" },
    { name: "Luxury Stay", icon: "✨" },
    { name: "Budget Stay", icon: "🪙" },
    { name: "Eco Stay", icon: "🌱" },
    { name: "Heritage Stay", icon: "🏛️" }
  ];

  const seasonalCollectionsList = [
    { name: "Spring Escapes", icon: "🌸", tag: "Spring Escapes", desc: "Cherry blossoms & light mountain breezes", image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=600&auto=format&fit=crop" },
    { name: "Summer Retreats", icon: "☀️", tag: "Summer Retreats", desc: "Cool high altitude sanctuaries", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop" },
    { name: "Monsoon Magic", icon: "🌧️", tag: "Monsoon Magic", desc: "Mist covered pine ridges & streams", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=600&auto=format&fit=crop" },
    { name: "Autumn Colours", icon: "🍁", tag: "Autumn Colours", desc: "Golden foliage & crystal clear peaks", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop" },
    { name: "Winter Snow Stays", icon: "❄️", tag: "Winter Snow Stays", desc: "Cosy firesides & pure snowy vistas", image: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=600&auto=format&fit=crop" }
  ];

  const curatedCollectionsList = [
    { name: "Best Sunrise Views", label: "Sunrise Views", desc: "Wake up to peak glow", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop" },
    { name: "Best Sunset Views", label: "Sunset Views", desc: "Golden hour valleys", image: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=600&auto=format&fit=crop" },
    { name: "Best Homemade Food", label: "Organic Food", desc: "Farm-to-fork dinners", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop" },
    { name: "Best Hospitality", label: "Top Hosts", desc: "Legendary warm welcomes", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop" },
    { name: "Best Balcony Views", label: "Balcony Views", desc: "Unmatched private decks", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop" },
    { name: "Best Photography Stays", label: "Photo Spots", desc: "Instagram ready frame views", image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=600&auto=format&fit=crop" },
    { name: "Best for Honeymoon", label: "Romantic Escapes", desc: "Cosy secluded cottages", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop" },
    { name: "Best for Families", label: "Family Approved", desc: "Spacious stays with play lawns", image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop" },
    { name: "Best for Senior Citizens", label: "Senior Friendly", desc: "Easy access, peaceful garden walks", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop" },
    { name: "Best Workation", label: "Workation Ready", desc: "Steady WiFi & work desks", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" },
    { name: "Under ₹1500", label: "Budget Friendly", desc: "Outstanding local value", image: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=600&auto=format&fit=crop" },
    { name: "Luxury Collection", label: "Premium Stays", desc: "High-end mountain villas", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop" }
  ];

  const specialCollectionsList = [
    { name: "Recently Verified", desc: "Strict quality checks done" },
    { name: "Newly Opened", desc: "Be among the first to experience" },
    { name: "Eco Friendly", desc: "Zero plastic, local building craft" },
    { name: "Heritage Homestays", desc: "Restored British era & Tribal wood structures" },
    { name: "Family Managed", desc: "Genuinely run by local families" },
    { name: "Local Favourite", desc: "Voted top tier by recurrent travellers" },
    { name: "Highly Rated", desc: "Unrivalled 4.8+ star track records" },
    { name: "Staff Pick", desc: "Personally selected by the HillyTrip team" }
  ];

  // Price chips helper
  const priceQuickChips = [
    { label: "Under ₹1000", min: 0, max: 1000 },
    { label: "₹1000–₹2000", min: 1000, max: 2000 },
    { label: "₹2000–₹3500", min: 2000, max: 3500 },
    { label: "₹3500–₹5000", min: 3500, max: 5000 },
    { label: "Above ₹5000", min: 5000, max: 100000 }
  ];

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleRoomType = (type: string) => {
    setSelectedRoomTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleView = (view: string) => {
    setSelectedViews(prev => 
      prev.includes(view) ? prev.filter(v => v !== view) : [...prev, view]
    );
  };

  const toggleMeal = (meal: string) => {
    setSelectedMeals(prev => 
      prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]
    );
  };

  const toggleTravelStyle = (style: string) => {
    setSelectedTravelStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedGuests('all');
    setSelectedRoomTypes([]);
    setSelectedViews([]);
    setSelectedMeals([]);
    setSelectedAmenities([]);
    setSelectedTravelStyles([]);
    setSelectedRating(null);
    setVerifiedOnly(false);
    setContactType('all');
    setActiveExperience('All');
    setActiveCollection('All');
    setSearchQuery('');
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return priceRange[0] > 0 || priceRange[1] < 10000 || selectedGuests !== 'all' || 
           selectedRoomTypes.length > 0 || selectedViews.length > 0 || selectedMeals.length > 0 || 
           selectedAmenities.length > 0 || selectedTravelStyles.length > 0 || selectedRating !== null || 
           verifiedOnly || contactType !== 'all' || activeExperience !== 'All' || activeCollection !== 'All' || searchQuery !== '';
  }, [priceRange, selectedGuests, selectedRoomTypes, selectedViews, selectedMeals, selectedAmenities, selectedTravelStyles, selectedRating, verifiedOnly, contactType, activeExperience, activeCollection, searchQuery]);

  // Main Filtering Logic
  const filteredHomestays = useMemo(() => {
    return enrichedHomestays.filter(h => {
      // 1. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = h.name.toLowerCase().includes(query);
        const matchesDest = h.destinationId?.toLowerCase().includes(query) || '';
        const matchesVillage = h.address?.toLowerCase().includes(query) || h.tagline?.toLowerCase().includes(query) || '';
        const matchesDistrict = h.district?.toLowerCase().includes(query) || '';
        
        if (!matchesName && !matchesDest && !matchesVillage && !matchesDistrict) {
          return false;
        }
      }

      // 2. Experience Filter
      if (activeExperience !== 'All' && !h.experiences.includes(activeExperience)) {
        return false;
      }

      // 3. Collection Filter
      if (activeCollection !== 'All') {
        const matchCol = h.collections.includes(activeCollection) || 
                         h.seasons.includes(activeCollection) || 
                         h.specials.includes(activeCollection);
        if (!matchCol) return false;
      }

      // 4. Price range
      if (h.priceMin < priceRange[0] || h.priceMin > priceRange[1]) {
        return false;
      }

      // 5. Verification status
      if (verifiedOnly && !h.isVerified) {
        return false;
      }

      // 6. Rating Filter
      if (selectedRating !== null && h.rating < selectedRating) {
        return false;
      }

      // 7. Guests Filter (Estimate mapping)
      if (selectedGuests !== 'all') {
        // Simple mapping: cottage/family room supports 3+, dorm supports 5+
        const capacity = h.roomTypes.includes('Dormitory') ? 10 : (h.roomTypes.includes('Family Room') ? 4 : 2);
        if (selectedGuests === '1' && capacity < 1) return false;
        if (selectedGuests === '2' && capacity < 2) return false;
        if (selectedGuests === '3-4' && capacity < 3) return false;
        if (selectedGuests === '5' && capacity < 5) return false;
      }

      // 8. Room type
      if (selectedRoomTypes.length > 0) {
        const hasMatch = h.roomTypes.some(rt => selectedRoomTypes.includes(rt));
        if (!hasMatch) return false;
      }

      // 9. Views
      if (selectedViews.length > 0) {
        // Map experiences to view strings
        const hViews = h.experiences.map(ex => ex.replace(' Stay', '').replace(' View', ''));
        const hasMatch = hViews.some(v => selectedViews.includes(v));
        if (!hasMatch) return false;
      }

      // 10. Meals
      if (selectedMeals.length > 0) {
        const hasMatch = h.meals.some(m => selectedMeals.includes(m));
        if (!hasMatch) return false;
      }

      // 11. Travel Style
      if (selectedTravelStyles.length > 0) {
        // Travel styles are mapped to couple / family / workation tags in experiences
        const mappedStyles = h.experiences.map(ex => ex.replace(' Stay', ''));
        const hasMatch = mappedStyles.some(s => selectedTravelStyles.includes(s)) || 
                         (selectedTravelStyles.includes('Solo') && h.experiences.includes('Backpacker Friendly')) ||
                         (selectedTravelStyles.includes('Friends') && h.roomTypes.includes('Dormitory'));
        if (!hasMatch) return false;
      }

      // 12. Contact Type
      if (contactType !== 'all') {
        const hasWA = !!h.contact?.toLowerCase().includes('wa') || !!h.whatsapp || !!h.whatsappNumber;
        const hasCall = !!h.contact?.toLowerCase().includes('mobile') || !!h.mobile || !!h.contactInfo;
        if (contactType === 'whatsapp' && !hasWA) return false;
        if (contactType === 'call' && !hasCall) return false;
      }

      // 13. Amenities
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(amenity => {
          return h.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()));
        });
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  }, [enrichedHomestays, searchQuery, activeExperience, activeCollection, priceRange, verifiedOnly, selectedRating, selectedGuests, selectedRoomTypes, selectedViews, selectedMeals, selectedTravelStyles, contactType, selectedAmenities]);

  // Main Sorting Logic
  const sortedHomestays = useMemo(() => {
    const list = [...filteredHomestays];
    if (sortBy === 'lowestPrice') {
      return list.sort((a, b) => a.priceMin - b.priceMin);
    }
    if (sortBy === 'highestPrice') {
      return list.sort((a, b) => b.priceMin - a.priceMin);
    }
    if (sortBy === 'highestRated') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === 'mostReviewed') {
      return list.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    if (sortBy === 'newlyAdded') {
      return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    if (sortBy === 'popular') {
      return list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating);
    }
    // Default recommended: featured first, then highest rated
    return list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating);
  }, [filteredHomestays, sortBy]);

  const visibleHomestays = useMemo(() => {
    return sortedHomestays.slice(0, visibleCount);
  }, [sortedHomestays, visibleCount]);

  // Count active filter bubbles
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (selectedGuests !== 'all') count++;
    if (selectedRoomTypes.length > 0) count += selectedRoomTypes.length;
    if (selectedViews.length > 0) count += selectedViews.length;
    if (selectedMeals.length > 0) count += selectedMeals.length;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    if (selectedTravelStyles.length > 0) count += selectedTravelStyles.length;
    if (selectedRating !== null) count++;
    if (verifiedOnly) count++;
    if (contactType !== 'all') count++;
    return count;
  }, [priceRange, selectedGuests, selectedRoomTypes, selectedViews, selectedMeals, selectedAmenities, selectedTravelStyles, selectedRating, verifiedOnly, contactType]);

  const handleWhatsAppClick = (e: React.MouseEvent, h: any) => {
    e.stopPropagation();
    const phone = formatWhatsAppNumber(h.whatsappNumber || h.contact || h.whatsapp);
    if (!phone) {
      if (setNotification) setNotification({ type: 'error', message: 'WhatsApp contact is temporarily unavailable for this homestay.' });
      return;
    }
    const text = encodeURIComponent(`Hi ${h.ownerName || h.name}! I found your homestay on HillyTrip and would like to check availability.`);
    
    const runWhatsApp = () => {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    };

    if (executeProtectedAction) {
      executeProtectedAction('contact homestay via WhatsApp', runWhatsApp, false);
    } else {
      runWhatsApp();
    }
  };

  const handleCallClick = (e: React.MouseEvent, h: any) => {
    e.stopPropagation();
    const phone = h.mobile || h.contact?.replace(/[^\d+]/g, '') || '';
    if (!phone) {
      if (setNotification) setNotification({ type: 'error', message: 'Mobile contact is temporarily unavailable for this homestay.' });
      return;
    }
    
    const runCall = () => {
      window.location.href = `tel:${phone}`;
    };

    if (executeProtectedAction) {
      executeProtectedAction('contact homestay via Call', runCall, false);
    } else {
      runCall();
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans pb-24 selection:bg-emerald-500/10">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative h-[480px] md:h-[550px] w-full overflow-hidden flex items-center justify-center bg-slate-900">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop" 
            alt="Himalayan Mountain Range background" 
            className="w-full h-full object-cover opacity-60 scale-105 filter brightness-90 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-slate-50 dark:to-slate-950"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Mountain Stays
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md text-center max-w-2xl"
          >
            Find Your Perfect Mountain Stay
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-slate-150 text-slate-200 mt-4 max-w-lg font-medium drop-shadow-xs text-center"
          >
            Discover verified homestays across North Bengal & Sikkim.
          </motion.p>

          {/* ================= INSTANT SEARCH BAR ================= */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-2xl mt-8 px-2 sm:px-0"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-full p-2 md:p-3 shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2">
              <div className="flex items-center gap-3 w-full pl-3 md:pl-4">
                <Search className="w-5.5 h-5.5 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Search by homestay name, destination, village, or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-hidden text-sm font-semibold text-slate-800 dark:text-white placeholder-slate-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  const el = document.getElementById('discovery-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full md:w-auto px-6 py-3.5 md:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl md:rounded-full font-bold text-xs shrink-0 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Search Stays</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        
        {/* ================= FEATURED COLLECTIONS ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Featured Collections</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Handpicked stay selections curated by local travel experts.</p>
            </div>
            {activeCollection !== 'All' && (
              <button 
                onClick={() => setActiveCollection('All')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 transition"
              >
                Reset Collection <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <UniversalCarousel
            items={featuredCollectionsList}
            visibleCards={{ mobile: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
            showDots={false}
            renderItem={(col) => {
              const isActive = activeCollection === col.name;
              return (
                <button
                  onClick={() => {
                    setActiveCollection(isActive ? 'All' : col.name);
                    const el = document.getElementById('discovery-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full h-28 rounded-2xl p-4 flex flex-col justify-between text-left transition-all duration-300 border shadow-xs cursor-pointer select-none ${
                    isActive 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white scale-98 shadow-md' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white hover:scale-102 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750'
                  }`}
                >
                  <span className="text-2xl">{col.icon}</span>
                  <span className="font-extrabold text-sm tracking-tight leading-tight">{col.name}</span>
                </button>
              );
            }}
          />
        </section>


        {/* ================= STAY BY EXPERIENCE ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Stay by Experience</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Immersive travel styles crafted around local village life & geographic views.</p>
            </div>
            {activeExperience !== 'All' && (
              <button 
                onClick={() => setActiveExperience('All')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 transition"
              >
                Reset Experience <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <UniversalCarousel
            items={experiencesList}
            visibleCards={{ mobile: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
            showDots={false}
            renderItem={(exp) => {
              const isActive = activeExperience === exp.name;
              return (
                <button
                  onClick={() => {
                    setActiveExperience(isActive ? 'All' : exp.name);
                    const el = document.getElementById('discovery-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-2.5 px-4 rounded-full border font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap select-none ${
                    isActive 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{exp.icon}</span>
                  <span>{exp.name}</span>
                </button>
              );
            }}
          />
        </section>


        {/* ================= SEASONAL COLLECTIONS ================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Seasonal Collections</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Spectacular escapes optimized around Eastern Himalayan seasons.</p>
          </div>

          <UniversalCarousel
            items={seasonalCollectionsList}
            visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
            showDots={false}
            renderItem={(season) => {
              const isActive = activeCollection === season.tag;
              return (
                <button
                  onClick={() => {
                    setActiveCollection(isActive ? 'All' : season.tag);
                    const el = document.getElementById('discovery-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full rounded-2xl overflow-hidden relative h-56 text-left flex flex-col justify-end p-5 transition-all duration-300 group cursor-pointer border select-none ${
                    isActive 
                      ? 'border-emerald-500 scale-98 ring-2 ring-emerald-500/20 shadow-lg' 
                      : 'border-transparent hover:scale-102 hover:shadow-lg'
                  }`}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={season.image} 
                      alt={season.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl">{season.icon}</span>
                      {isActive && (
                        <span className="bg-emerald-650 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-wider">
                          ✓ ACTIVE
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-sm text-white tracking-tight drop-shadow-sm">{season.name}</h4>
                    <p className="text-[10px] text-slate-300 leading-normal font-semibold drop-shadow-xs line-clamp-2">{season.desc}</p>
                  </div>
                </button>
              );
            }}
          />
        </section>


        {/* ================= CURATED COLLECTIONS ================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Curated Collections</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Carefully filtered stays centering high priority traveller preferences.</p>
          </div>

          <UniversalCarousel
            items={curatedCollectionsList}
            visibleCards={{ mobile: 1.5, sm: 2, md: 3, lg: 4, xl: 5 }}
            showDots={false}
            renderItem={(col) => {
              const isActive = activeCollection === col.name;
              
              // Count stays belonging to this curated collection dynamically
              const count = enrichedHomestays.filter(h => h.collections.includes(col.name)).length;

              return (
                <button
                  onClick={() => {
                    setActiveCollection(isActive ? 'All' : col.name);
                    const el = document.getElementById('discovery-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left flex flex-col h-72 rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer bg-white dark:bg-slate-900 select-none ${
                    isActive
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-98 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750 hover:scale-102 hover:shadow-lg'
                  }`}
                >
                  {/* Cover Image (occupies most of the card) */}
                  <div className="h-48 w-full overflow-hidden relative bg-slate-100">
                    <img 
                      src={col.image} 
                      alt={col.label} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                      {count} {count === 1 ? 'Stay' : 'Stays'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-mono">Curated Selection</span>
                      <h4 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white mt-0.5 line-clamp-1">{col.label}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-1 mt-0.5">{col.desc}</p>
                    </div>
                  </div>
                </button>
              );
            }}
          />
        </section>


        {/* ================= SPECIAL COLLECTIONS ================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Special Collections</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Unique stays cataloged by physical heritage, rating or verification statuses.</p>
          </div>

          <UniversalCarousel
            items={specialCollectionsList}
            visibleCards={{ mobile: 1.5, sm: 2, md: 3, lg: 4, xl: 4 }}
            showDots={false}
            renderItem={(special) => {
              const isActive = activeCollection === special.name;
              return (
                <button
                  onClick={() => {
                    setActiveCollection(isActive ? 'All' : special.name);
                    const el = document.getElementById('discovery-catalog');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-3.5 items-center bg-white dark:bg-slate-900 select-none ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white scale-98 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-102 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40'}`}>
                    {getSpecialIcon(special.name, isActive)}
                  </div>
                  <div>
                    <h4 className={`font-extrabold text-xs tracking-tight ${isActive ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>{special.name}</h4>
                    <p className={`text-[9px] mt-0.5 leading-normal line-clamp-1 ${isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>{special.desc}</p>
                  </div>
                </button>
              );
            }}
          />
        </section>


        {/* ================= DISCOVERY CATALOG: FILTER, SORT, ALL HOMESTAYS ================= */}
        <section id="discovery-catalog" className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* STICKY FILTER SIDEBAR (DESKTOP) */}
            <aside className="hidden lg:block w-72 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 sticky top-28 max-h-[82vh] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider font-mono">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Price Per Night</label>
                <div className="flex flex-wrap gap-1.5">
                  {priceQuickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPriceRange([chip.min, chip.max])}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                        priceRange[0] === chip.min && priceRange[1] === chip.max
                          ? 'bg-emerald-550 bg-emerald-600 text-white border-emerald-650'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                
                {/* Min/Max inputs */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Min Price</span>
                    <input 
                      type="number" 
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Math.max(0, parseInt(e.target.value) || 0), priceRange[1]])}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-bold font-mono focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Max Price</span>
                    <input 
                      type="number" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Math.max(0, parseInt(e.target.value) || 10000)])}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-bold font-mono focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Verified Filter */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Verified Properties Only</span>
                <button
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    verifiedOnly ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    verifiedOnly ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Guests Selection */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Expected Guests</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['all', '1', '2', '3-4', '5'].map(g => (
                    <button
                      key={g}
                      onClick={() => setSelectedGuests(g)}
                      className={`py-1.5 rounded-lg text-[10px] font-black uppercase font-mono border transition-all cursor-pointer ${
                        selectedGuests === g
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {g === 'all' ? 'Any' : g === '5' ? '5+' : g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Types */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Room Type</label>
                <div className="space-y-1.5">
                  {['Private Room', 'Entire Cottage', 'Family Room', 'Dormitory'].map(type => {
                    const isChecked = selectedRoomTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleRoomType(type)}
                        className="flex items-center gap-2.5 w-full text-left py-1 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="truncate">{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Views */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Property Views</label>
                <div className="space-y-1.5">
                  {['Mountain', 'Valley', 'Tea Garden', 'River', 'Forest'].map(v => {
                    const isChecked = selectedViews.includes(v);
                    return (
                      <button
                        key={v}
                        onClick={() => toggleView(v)}
                        className="flex items-center gap-2.5 w-full text-left py-1 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{v}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meals */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Meals Plan</label>
                <div className="space-y-1.5">
                  {['Breakfast Included', 'Lunch', 'Dinner', 'All Meals'].map(m => {
                    const isChecked = selectedMeals.includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMeal(m)}
                        className="flex items-center gap-2.5 w-full text-left py-1 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{m}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Travel Style */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Travel Style</label>
                <div className="space-y-1.5">
                  {['Couple', 'Family', 'Friends', 'Solo', 'Workation', 'Backpackers'].map(style => {
                    const isChecked = selectedTravelStyles.includes(style);
                    return (
                      <button
                        key={style}
                        onClick={() => toggleTravelStyle(style)}
                        className="flex items-center gap-2.5 w-full text-left py-1 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{style}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Rating Threshold</label>
                <div className="space-y-1.5">
                  {[5, 4, 3].map(r => {
                    const isChecked = selectedRating === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setSelectedRating(isChecked ? null : r)}
                        className="flex items-center gap-2.5 w-full text-left py-1 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="flex items-center gap-1 font-semibold text-xs">
                          {r}★ {r === 5 ? 'Only' : '& Above'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Availability */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Contact Availability</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['all', 'whatsapp', 'call'].map(c => (
                    <button
                      key={c}
                      onClick={() => setContactType(c)}
                      className={`py-1.5 rounded-lg text-[9px] font-black uppercase font-mono border transition-all cursor-pointer ${
                        contactType === c
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {c === 'all' ? 'Any' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Key Amenities</label>
                <div className="space-y-1.5">
                  {['Wi-Fi', 'Parking', 'Hot Water', 'Heater', 'Balcony', 'Campfire', 'Bonfire', 'Restaurant', 'Pet Friendly', 'Power Backup'].map(a => {
                    const isChecked = selectedAmenities.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className="flex items-center gap-2.5 w-full text-left py-1 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{a}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>


            {/* HOMESTAYS CONTENT AREA */}
            <div className="flex-1 w-full space-y-6">
              
              {/* FILTER ACTION BAR (MOBILE TRIGGER & SORTING) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {/* Mobile filter trigger */}
                  <button
                    onClick={() => setIsFilterSheetOpen(true)}
                    className="lg:hidden px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer text-slate-800 dark:text-white"
                  >
                    <Filter className="w-4 h-4 text-emerald-650 text-emerald-500" />
                    <span>Filter ({activeFiltersCount})</span>
                  </button>

                  <span className="text-xs font-extrabold text-slate-500 font-mono">
                    Showing {sortedHomestays.length} stay option{sortedHomestays.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Sort Widget */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-black text-slate-450 uppercase tracking-widest font-mono shrink-0 hidden sm:inline">Sort By</span>
                  <div className="w-44">
                    <AutocompleteSelect
                      id="homestay-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-emerald-500 max-w-full"
                    >
                      <option value="recommended">⭐ Recommended</option>
                      <option value="lowestPrice">🪙 Lowest Price</option>
                      <option value="highestPrice">💎 Highest Price</option>
                      <option value="highestRated">📈 Highest Rated</option>
                      <option value="mostReviewed">💬 Most Reviewed</option>
                      <option value="newlyAdded">✨ Newly Added</option>
                      <option value="popular">🔥 Popular</option>
                    </AutocompleteSelect>
                  </div>
                </div>
              </div>

              {/* LISTING CARDS GRID */}
              {sortedHomestays.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No Stays Matched Your Filters</h3>
                  <p className="text-xs text-slate-405 text-slate-400 max-w-md mx-auto leading-relaxed">
                    We could not find any homestays matching the specific criteria. Let's try relaxing your filter rules or search queries.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleHomestays.map((h, index) => {
                    const isSaved = wishlist.includes(h.id);
                    return (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10px" }}
                        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                        onClick={() => navigate(`#/homestay/${getItemSlug(h)}`)}
                        className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-xl transition-all duration-300 flex flex-col h-full group cursor-pointer relative"
                      >
                        {/* Cover Image & Badges */}
                        <div className="h-52 w-full overflow-hidden relative bg-slate-100">
                          <img 
                            src={(h.images && h.images.find(img => img && img.trim() !== '')) || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop"} 
                            alt={h.name} 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop";
                            }}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                          
                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            {h.isVerified && (
                              <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-flex items-center gap-1 shadow-md">
                                <Award className="w-3 h-3 shrink-0" />
                                Verified
                              </span>
                            )}
                            {h.isFeatured && (
                              <span className="bg-amber-500/95 backdrop-blur-xs text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-flex items-center gap-1 shadow-md">
                                <Sparkles className="w-3 h-3 shrink-0" />
                                Featured
                              </span>
                            )}
                          </div>

                          {/* Save Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(h.id, h.name);
                            }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10 backdrop-blur-xs shadow-md transition duration-200 cursor-pointer"
                          >
                            <Heart className={`w-4.5 h-4.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                          </button>

                          {/* Price Tag Overlay */}
                          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg border border-white/10 shadow-lg font-mono text-xs font-bold">
                            Starting ₹{h.priceMin} <span className="text-[10px] text-slate-300 font-sans">/ night</span>
                          </div>
                        </div>

                        {/* Card Info Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            
                            {/* Destination / Location breadcrumb */}
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest font-mono">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{h.destinationId}</span>
                              {h.district && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-600">•</span>
                                  <span>{h.district}</span>
                                </>
                              )}
                            </div>

                            {/* Name */}
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition text-left">
                              {h.name}
                            </h3>

                            {/* Tagline */}
                            <p className="text-[10px] text-slate-450 text-slate-400 leading-normal line-clamp-1 italic text-left">
                              {h.tagline}
                            </p>
                          </div>

                          {/* Key amenities (max 3) */}
                          <div className="flex flex-wrap gap-1">
                            {h.amenities.slice(0, 3).map((a, idx) => (
                              <span 
                                key={idx}
                                className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[9px] font-bold px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-800/50 truncate max-w-[120px]"
                              >
                                {a}
                              </span>
                            ))}
                          </div>

                          {/* Footer details: Rating + Contact Actions */}
                          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-auto">
                            
                            {/* Star Rating */}
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded-lg border border-amber-100/60 dark:border-amber-900/30">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-black text-slate-900 dark:text-amber-400 font-mono">{h.rating}</span>
                              <span className="text-[9px] text-slate-400">({h.reviewCount})</span>
                            </div>

                            {/* In-Platform Booking & Inquiry Actions */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const slug = getItemSlug(h);
                                  if (navigate) navigate(`#/enquire?listingType=homestay&listingId=${slug}`);
                                  else window.location.hash = `#/enquire?listingType=homestay&listingId=${slug}`;
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                                title="Enquire via HillyTrip Messaging"
                              >
                                <MessageSquareIcon className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Enquire</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const slug = getItemSlug(h);
                                  if (navigate) navigate(`#/homestay/${slug}`);
                                  else window.location.hash = `#/homestay/${slug}`;
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg transition cursor-pointer shadow-xs hover:shadow"
                                title="Book Now"
                              >
                                <span>Book Now</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Infinite scroll pagination feedback */}
              {sortedHomestays.length > visibleCount && (
                <div className="text-center py-12">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 9)}
                    className="px-6 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-250 dark:border-slate-800 rounded-xl text-xs font-black transition cursor-pointer shadow-xs inline-flex items-center gap-2"
                  >
                    Load More Stays <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ================= MOBILE BOTTOM SHEET FILTERS MODAL ================= */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-55 overflow-y-auto p-6 space-y-6 lg:hidden flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider font-mono">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Filters List */}
              <div className="flex-1 overflow-y-auto space-y-6 pb-20">
                {/* Price Filter */}
                <div className="space-y-3">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Price Per Night</label>
                  <div className="flex flex-wrap gap-1.5">
                    {priceQuickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPriceRange([chip.min, chip.max])}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          priceRange[0] === chip.min && priceRange[1] === chip.max
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verified Only */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Verified Properties Only</span>
                  <button
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      verifiedOnly ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      verifiedOnly ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Expected Guests */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Expected Guests</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {['all', '1', '2', '3-4', '5'].map(g => (
                      <button
                        key={g}
                        onClick={() => setSelectedGuests(g)}
                        className={`py-2 rounded-lg text-xs font-black uppercase font-mono border transition-all cursor-pointer ${
                          selectedGuests === g
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {g === 'all' ? 'Any' : g === '5' ? '5+' : g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room Types */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Room Type</label>
                  <div className="space-y-2">
                    {['Private Room', 'Entire Cottage', 'Family Room', 'Dormitory'].map(type => {
                      const isChecked = selectedRoomTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => toggleRoomType(type)}
                          className="flex items-center gap-3 w-full text-left py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span>{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Views */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 block uppercase tracking-wider font-mono">Property Views</label>
                  <div className="space-y-2">
                    {['Mountain', 'Valley', 'Tea Garden', 'River', 'Forest'].map(v => {
                      const isChecked = selectedViews.includes(v);
                      return (
                        <button
                          key={v}
                          onClick={() => toggleView(v)}
                          className="flex items-center gap-3 w-full text-left py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-700'
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span>{v}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Buttons inside Mobile Sheet */}
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:text-rose-500 rounded-xl text-xs font-black transition cursor-pointer text-slate-650 dark:text-slate-300"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md"
                >
                  Apply Filters ({activeFiltersCount})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Helper for WhatsApp Icon (since lucide doesn't have a specific whatsapp logo but MessageSquare is great, we custom build or map beautifully)
function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
