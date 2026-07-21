import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Check, X, Shield, Star, 
  Sparkles, Award, Eye, EyeOff, Save, Image, Phone, MapPin,
  Bed, Wifi, Coffee, Compass, FileText, Heart, ShieldAlert
} from 'lucide-react';
import { Homestay, Destination, RoomCategory } from '../types';

// Deterministic dynamic tags generator helper for pre-filling empty edit forms beautifully
const getDeterministicTags = (h: Homestay) => {
  const codeSum = h.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const rating = h.rating || parseFloat((4.2 + (codeSum % 8) * 0.1).toFixed(1));
  const reviewCount = h.reviewCount || (8 + (codeSum % 47));
  const isVerified = h.isVerified !== undefined ? h.isVerified : (codeSum % 7 !== 0);
  const isFeatured = h.isFeatured !== undefined ? h.isFeatured : (codeSum % 8 === 0);
  const isActive = h.isActive !== undefined ? h.isActive : true;

  const experiences = h.experiences && h.experiences.length > 0 ? h.experiences : (() => {
    const list: string[] = [];
    const nameLower = h.name.toLowerCase();
    if (nameLower.includes('view') || nameLower.includes('ridge') || codeSum % 3 === 0) list.push('Mountain View');
    if (nameLower.includes('tea') || nameLower.includes('garden') || codeSum % 4 === 0) list.push('Tea Garden Stay');
    if (nameLower.includes('river') || codeSum % 5 === 0) list.push('Riverside Stay');
    if (nameLower.includes('forest') || codeSum % 6 === 0) list.push('Forest Stay');
    if (codeSum % 7 === 0) list.push('Village Stay');
    if (codeSum % 5 === 1) list.push('Couple Stay');
    if (codeSum % 5 === 2) list.push('Family Stay');
    if (codeSum % 5 === 3) list.push('Workation');
    if (list.length === 0) list.push('Village Stay');
    return list;
  })();

  const collections = h.collections && h.collections.length > 0 ? h.collections : (() => {
    const list: string[] = [];
    if (isFeatured) list.push("Editor's Choice");
    if (codeSum % 9 === 1) list.push("Trending This Week");
    if (h.priceMin >= 3500) list.push("Premium Collection");
    if (h.priceMin <= 1500) list.push("Budget Collection");
    if (list.length === 0) list.push("Editor's Choice");
    return list;
  })();

  const seasons = h.seasons && h.seasons.length > 0 ? h.seasons : (() => {
    const list: string[] = [];
    if (codeSum % 4 === 0) list.push('Spring Escapes');
    if (codeSum % 4 === 1) list.push('Summer Retreats');
    if (codeSum % 4 === 2) list.push('Monsoon Magic');
    if (codeSum % 4 === 3) list.push('Autumn Colours');
    if (list.length === 0) list.push('Summer Retreats');
    return list;
  })();

  const specials = h.specials && h.specials.length > 0 ? h.specials : (() => {
    const list: string[] = [];
    if (codeSum % 6 === 0) list.push('Recently Verified');
    if (codeSum % 6 === 1) list.push('Newly Opened');
    if (rating >= 4.7) list.push('Highly Rated');
    if (list.length === 0) list.push('Family Managed');
    return list;
  })();

  const roomTypes = h.roomTypes && h.roomTypes.length > 0 ? h.roomTypes : ['Private Room'];
  const meals = h.meals && h.meals.length > 0 ? h.meals : ['Breakfast Included'];

  const tagline = h.tagline || 'Experience high-altitude hospitality & fresh organic farm meals.';

  return {
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

export default function AdminHomestayManagementTab() {
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // CRUD form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'policies' | 'food' | 'location' | 'facilities' | 'rooms'>('basic');
  
  // Local room categories state
  const [localRoomCategories, setLocalRoomCategories] = useState<RoomCategory[]>([]);
  const [editingRoomCategory, setEditingRoomCategory] = useState<Partial<RoomCategory> | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Homestay> & {
    experiences: string[];
    collections: string[];
    seasons: string[];
    specials: string[];
    roomTypes: string[];
    meals: string[];
    isVerified: boolean;
    isFeatured: boolean;
    isActive: boolean;
    rating: number;
    reviewCount: number;
    tagline: string;
  }>({
    id: '',
    name: '',
    destinationId: '',
    priceMin: 1500,
    priceMax: 2500,
    contact: '',
    amenities: [],
    images: [],
    tagline: '',
    experiences: [],
    collections: [],
    seasons: [],
    specials: [],
    roomTypes: [],
    meals: [],
    isVerified: true,
    isFeatured: false,
    isActive: true,
    rating: 4.5,
    reviewCount: 15,
    district: '',
    state: '',

    // Guest Policies
    unmarriedCouplesAllowed: true,
    localIdsAccepted: true,
    foreignGuestsAllowed: true,
    minCheckInAge: 18,
    bachelorGroupsAllowed: true,
    familyFriendly: true,
    childrenAllowed: true,
    seniorCitizenFriendly: true,
    soloFemaleFriendly: true,
    petPolicy: 'Allowed',

    // Property Rules
    checkInTime: '12:00 PM',
    checkOutTime: '11:00 AM',
    earlyCheckIn: 'On Request',
    lateCheckOut: 'On Request',
    cancellationPolicy: '100% refund for cancellations filed at least 7 days before check-in.',
    advancePayment: '50% advance payment required to confirm booking',
    paymentMethods: ['UPI', 'Cash'],
    gstInvoice: false,
    extraBedPolicy: 'Extra mattresses are provided on request for ₹350 per night.',
    driverAccommodation: 'Available on request',
    driverMeals: 'Available at additional ₹150 per meal',
    visitorPolicy: 'Visitors are allowed in common areas until 8 PM',
    quietHours: '10:00 PM to 7:00 AM',

    // Food & Dining
    vegOnly: false,
    nonVegAvailable: true,
    jainFoodAvailable: false,
    veganFoodAvailable: false,
    outsideFoodAllowed: false,
    selfCooking: false,
    kitchenAccess: false,

    // Smoking & Alcohol
    smokingPolicy: 'Designated Areas Only',
    alcoholPolicy: 'Allowed in rooms',
    partiesAllowed: false,
    loudMusic: false,
    bbqAvailable: false,
    bonfireAvailable: false,

    // Parking & Transport
    carParking: true,
    bikeParking: true,
    evCharging: false,
    taxiReachesProperty: true,
    driverParking: true,

    // Connectivity
    wifi: true,
    wifiSpeed: '50 Mbps',
    mobileNetworks: ['Jio', 'Airtel'],
    networkStrength: 'Good',

    // Electricity & Water
    electricity24x7: true,
    powerBackup: true,
    generator: false,
    solar: false,
    hotWater: true,
    waterSupply: 'Spring Water',

    // Safety
    cctv: true,
    fireExtinguisher: true,
    firstAidKit: true,
    caretaker: true,
    emergencyContact: '',

    // Accessibility
    wheelchairAccessible: false,
    groundFloorRooms: true,
    lift: false,
    suitableForSeniors: true,
    suitableForChildren: true,

    // Photography
    droneAllowed: true,
    commercialPhotography: false,
    preWeddingShoot: true,

    // Mountain Information
    roadCondition: 'Good',
    roadType: 'Tar',
    walkingDistanceParking: 0,
    steepWalkRequired: false,
    bikeFriendly: true,
    suitableForSedan: true,
    snowAccessible: true,
    monsoonAccessible: true,

    // Scenic Information
    kanchenjungaView: false,
    sunriseView: false,
    sunsetView: false,
    riverView: false,
    forestView: false,
    teaGardenView: false,
    birdWatching: false,
    stargazing: false,

    // Languages Spoken
    langEnglish: true,
    langHindi: true,
    langBengali: false,
    langNepali: true,
    langOthers: '',

    // Special Information
    thingsGuestsShouldKnow: ''
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load homestays and destinations on mount
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const hRes = await fetch('/api/homestays');
      const hData = await hRes.json();
      
      const dRes = await fetch('/api/destinations');
      const dData = await dRes.json();
      
      if (Array.isArray(hData)) {
        setHomestays(hData);
      }
      if (Array.isArray(dData)) {
        setDestinations(dData);
      }
    } catch (err) {
      console.error('[Admin Homestay Tab Error]:', err);
      triggerNotification('error', 'Failed to retrieve database collections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredList = useMemo(() => {
    return homestays.filter(h => {
      const q = searchQuery.toLowerCase();
      return h.name.toLowerCase().includes(q) || h.destinationId.toLowerCase().includes(q) || (h.district && h.district.toLowerCase().includes(q));
    });
  }, [homestays, searchQuery]);

  // Form selections definitions
  const experiencesList = [
    "Mountain View", "Tea Garden Stay", "Riverside Stay", "Forest Stay", 
    "Village Stay", "Couple Stay", "Family Stay", "Workation", 
    "Backpacker Friendly", "Pet Friendly", "Luxury Stay", "Budget Stay", 
    "Eco Stay", "Heritage Stay"
  ];

  const collectionsList = [
    "Editor's Choice", "Trending This Week", "Newly Added", "Most Loved", 
    "Premium Collection", "Hidden Gems", "Budget Collection", "Best Sunrise Views", 
    "Best Sunset Views", "Best Homemade Food", "Best Hospitality", "Best Balcony Views"
  ];

  const seasonsList = [
    "Spring Escapes", "Summer Retreats", "Monsoon Magic", "Autumn Colours", "Winter Snow Stays"
  ];

  const specialsList = [
    "Recently Verified", "Newly Opened", "Eco Friendly", "Heritage Homestays", 
    "Family Managed", "Local Favourite", "Highly Rated", "Staff Pick"
  ];

  const roomTypesList = [
    "Private Room", "Entire Cottage", "Family Room", "Dormitory"
  ];

  const mealsList = [
    "Breakfast Included", "Lunch", "Dinner", "All Meals"
  ];

  const handleEditClick = (h: Homestay) => {
    const enriched = getDeterministicTags(h);
    
    // Merge actual values if present in h
    setFormData({
      id: h.id,
      name: h.name,
      destinationId: h.destinationId,
      priceMin: h.priceMin || 1500,
      priceMax: h.priceMax || 2500,
      contact: h.contact || '',
      amenities: h.amenities || [],
      images: h.images || [],
      tagline: h.tagline || enriched.tagline,
      experiences: h.experiences || enriched.experiences,
      collections: h.collections || enriched.collections,
      seasons: h.seasons || enriched.seasons,
      specials: h.specials || enriched.specials,
      roomTypes: h.roomTypes || enriched.roomTypes,
      meals: h.meals || enriched.meals,
      isVerified: h.isVerified !== undefined ? h.isVerified : enriched.isVerified,
      isFeatured: h.isFeatured !== undefined ? h.isFeatured : enriched.isFeatured,
      isActive: h.isActive !== undefined ? h.isActive : enriched.isActive,
      rating: h.rating || enriched.rating,
      reviewCount: h.reviewCount || enriched.reviewCount,
      district: h.district || '',
      state: h.state || '',

      // Guest Policies
      unmarriedCouplesAllowed: h.unmarriedCouplesAllowed !== undefined ? h.unmarriedCouplesAllowed : true,
      localIdsAccepted: h.localIdsAccepted !== undefined ? h.localIdsAccepted : true,
      foreignGuestsAllowed: h.foreignGuestsAllowed !== undefined ? h.foreignGuestsAllowed : true,
      minCheckInAge: h.minCheckInAge || 18,
      bachelorGroupsAllowed: h.bachelorGroupsAllowed !== undefined ? h.bachelorGroupsAllowed : true,
      familyFriendly: h.familyFriendly !== undefined ? h.familyFriendly : true,
      childrenAllowed: h.childrenAllowed !== undefined ? h.childrenAllowed : true,
      seniorCitizenFriendly: h.seniorCitizenFriendly !== undefined ? h.seniorCitizenFriendly : true,
      soloFemaleFriendly: h.soloFemaleFriendly !== undefined ? h.soloFemaleFriendly : true,
      petPolicy: h.petPolicy || 'Allowed',

      // Property Rules
      checkInTime: h.checkInTime || '12:00 PM',
      checkOutTime: h.checkOutTime || '11:00 AM',
      earlyCheckIn: h.earlyCheckIn || 'On Request',
      lateCheckOut: h.lateCheckOut || 'On Request',
      cancellationPolicy: h.cancellationPolicy || '100% refund for cancellations filed at least 7 days before check-in.',
      advancePayment: h.advancePayment || '50% advance payment required to confirm booking',
      paymentMethods: h.paymentMethods || ['UPI', 'Cash'],
      gstInvoice: h.gstInvoice !== undefined ? h.gstInvoice : false,
      extraBedPolicy: h.extraBedPolicy || 'Extra mattresses are provided on request for ₹350 per night.',
      driverAccommodation: h.driverAccommodation || 'Available on request',
      driverMeals: h.driverMeals || 'Available at additional ₹150 per meal',
      visitorPolicy: h.visitorPolicy || 'Visitors are allowed in common areas until 8 PM',
      quietHours: h.quietHours || '10:00 PM to 7:00 AM',

      // Food & Dining
      vegOnly: h.vegOnly !== undefined ? h.vegOnly : false,
      nonVegAvailable: h.nonVegAvailable !== undefined ? h.nonVegAvailable : true,
      jainFoodAvailable: h.jainFoodAvailable !== undefined ? h.jainFoodAvailable : false,
      veganFoodAvailable: h.veganFoodAvailable !== undefined ? h.veganFoodAvailable : false,
      outsideFoodAllowed: h.outsideFoodAllowed !== undefined ? h.outsideFoodAllowed : false,
      selfCooking: h.selfCooking !== undefined ? h.selfCooking : false,
      kitchenAccess: h.kitchenAccess !== undefined ? h.kitchenAccess : false,

      // Smoking & Alcohol
      smokingPolicy: h.smokingPolicy || 'Designated Areas Only',
      alcoholPolicy: h.alcoholPolicy || 'Allowed in rooms',
      partiesAllowed: h.partiesAllowed !== undefined ? h.partiesAllowed : false,
      loudMusic: h.loudMusic !== undefined ? h.loudMusic : false,
      bbqAvailable: h.bbqAvailable !== undefined ? h.bbqAvailable : false,
      bonfireAvailable: h.bonfireAvailable !== undefined ? h.bonfireAvailable : false,

      // Parking & Transport
      carParking: h.carParking !== undefined ? h.carParking : true,
      bikeParking: h.bikeParking !== undefined ? h.bikeParking : true,
      evCharging: h.evCharging !== undefined ? h.evCharging : false,
      taxiReachesProperty: h.taxiReachesProperty !== undefined ? h.taxiReachesProperty : true,
      driverParking: h.driverParking !== undefined ? h.driverParking : true,

      // Connectivity
      wifi: h.wifi !== undefined ? h.wifi : true,
      wifiSpeed: h.wifiSpeed || '50 Mbps',
      mobileNetworks: h.mobileNetworks || ['Jio', 'Airtel'],
      networkStrength: h.networkStrength || 'Good',

      // Electricity & Water
      electricity24x7: h.electricity24x7 !== undefined ? h.electricity24x7 : true,
      powerBackup: h.powerBackup !== undefined ? h.powerBackup : true,
      generator: h.generator !== undefined ? h.generator : false,
      solar: h.solar !== undefined ? h.solar : false,
      hotWater: h.hotWater !== undefined ? h.hotWater : true,
      waterSupply: h.waterSupply || 'Spring Water',

      // Safety
      cctv: h.cctv !== undefined ? h.cctv : true,
      fireExtinguisher: h.fireExtinguisher !== undefined ? h.fireExtinguisher : true,
      firstAidKit: h.firstAidKit !== undefined ? h.firstAidKit : true,
      caretaker: h.caretaker !== undefined ? h.caretaker : true,
      emergencyContact: h.emergencyContact || '',

      // Accessibility
      wheelchairAccessible: h.wheelchairAccessible !== undefined ? h.wheelchairAccessible : false,
      groundFloorRooms: h.groundFloorRooms !== undefined ? h.groundFloorRooms : true,
      lift: h.lift !== undefined ? h.lift : false,
      suitableForSeniors: h.suitableForSeniors !== undefined ? h.suitableForSeniors : true,
      suitableForChildren: h.suitableForChildren !== undefined ? h.suitableForChildren : true,

      // Photography
      droneAllowed: h.droneAllowed !== undefined ? h.droneAllowed : true,
      commercialPhotography: h.commercialPhotography !== undefined ? h.commercialPhotography : false,
      preWeddingShoot: h.preWeddingShoot !== undefined ? h.preWeddingShoot : true,

      // Mountain Information
      roadCondition: h.roadCondition || 'Good',
      roadType: h.roadType || 'Tar',
      walkingDistanceParking: h.walkingDistanceParking !== undefined ? h.walkingDistanceParking : 0,
      steepWalkRequired: h.steepWalkRequired !== undefined ? h.steepWalkRequired : false,
      bikeFriendly: h.bikeFriendly !== undefined ? h.bikeFriendly : true,
      suitableForSedan: h.suitableForSedan !== undefined ? h.suitableForSedan : true,
      snowAccessible: h.snowAccessible !== undefined ? h.snowAccessible : true,
      monsoonAccessible: h.monsoonAccessible !== undefined ? h.monsoonAccessible : true,

      // Scenic Information
      kanchenjungaView: h.kanchenjungaView !== undefined ? h.kanchenjungaView : false,
      sunriseView: h.sunriseView !== undefined ? h.sunriseView : false,
      sunsetView: h.sunsetView !== undefined ? h.sunsetView : false,
      riverView: h.riverView !== undefined ? h.riverView : false,
      forestView: h.forestView !== undefined ? h.forestView : false,
      teaGardenView: h.teaGardenView !== undefined ? h.teaGardenView : false,
      birdWatching: h.birdWatching !== undefined ? h.birdWatching : false,
      stargazing: h.stargazing !== undefined ? h.stargazing : false,

      // Languages Spoken
      langEnglish: h.langEnglish !== undefined ? h.langEnglish : true,
      langHindi: h.langHindi !== undefined ? h.langHindi : true,
      langBengali: h.langBengali !== undefined ? h.langBengali : false,
      langNepali: h.langNepali !== undefined ? h.langNepali : true,
      langOthers: h.langOthers || '',

      // Special Information
      thingsGuestsShouldKnow: h.thingsGuestsShouldKnow || ''
    });
    
    // Load Room Categories
    setLocalRoomCategories([]);
    fetch(`/api/homestays/${encodeURIComponent(h.id)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.roomCategories) {
          setLocalRoomCategories(data.roomCategories);
        }
      })
      .catch(err => console.error("Failed to fetch room categories for edit:", err));

    setCurrentEditId(h.id);
    setActiveFormTab('basic');
    setIsEditing(true);
  };

  const handleAddNewClick = () => {
    const newId = `HT-GEN-${Date.now().toString().slice(-6)}`;
    setFormData({
      id: newId,
      name: '',
      destinationId: destinations[0]?.id || '',
      priceMin: 1500,
      priceMax: 2500,
      contact: '',
      amenities: ['Geyser', 'Himalayan View', 'Hot Meals'],
      images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop'],
      tagline: 'Experience genuine local organic mountain farm hospitality.',
      experiences: ['Village Stay', 'Family Stay'],
      collections: ["Editor's Choice"],
      seasons: ['Summer Retreats', 'Autumn Colours'],
      specials: ['Family Managed'],
      roomTypes: ['Private Room'],
      meals: ['Breakfast Included'],
      isVerified: true,
      isFeatured: false,
      isActive: true,
      rating: 4.5,
      reviewCount: 1,
      district: 'Darjeeling',
      state: 'West Bengal',

      // Guest Policies
      unmarriedCouplesAllowed: true,
      localIdsAccepted: true,
      foreignGuestsAllowed: true,
      minCheckInAge: 18,
      bachelorGroupsAllowed: true,
      familyFriendly: true,
      childrenAllowed: true,
      seniorCitizenFriendly: true,
      soloFemaleFriendly: true,
      petPolicy: 'Allowed',

      // Property Rules
      checkInTime: '12:00 PM',
      checkOutTime: '11:00 AM',
      earlyCheckIn: 'On Request',
      lateCheckOut: 'On Request',
      cancellationPolicy: '100% refund for cancellations filed at least 7 days before check-in.',
      advancePayment: '50% advance payment required to confirm booking',
      paymentMethods: ['UPI', 'Cash'],
      gstInvoice: false,
      extraBedPolicy: 'Extra mattresses are provided on request for ₹350 per night.',
      driverAccommodation: 'Available on request',
      driverMeals: 'Available at additional ₹150 per meal',
      visitorPolicy: 'Visitors are allowed in common areas until 8 PM',
      quietHours: '10:00 PM to 7:00 AM',

      // Food & Dining
      vegOnly: false,
      nonVegAvailable: true,
      jainFoodAvailable: false,
      veganFoodAvailable: false,
      outsideFoodAllowed: false,
      selfCooking: false,
      kitchenAccess: false,

      // Smoking & Alcohol
      smokingPolicy: 'Designated Areas Only',
      alcoholPolicy: 'Allowed in rooms',
      partiesAllowed: false,
      loudMusic: false,
      bbqAvailable: false,
      bonfireAvailable: false,

      // Parking & Transport
      carParking: true,
      bikeParking: true,
      evCharging: false,
      taxiReachesProperty: true,
      driverParking: true,

      // Connectivity
      wifi: true,
      wifiSpeed: '50 Mbps',
      mobileNetworks: ['Jio', 'Airtel'],
      networkStrength: 'Good',

      // Electricity & Water
      electricity24x7: true,
      powerBackup: true,
      generator: false,
      solar: false,
      hotWater: true,
      waterSupply: 'Spring Water',

      // Safety
      cctv: true,
      fireExtinguisher: true,
      firstAidKit: true,
      caretaker: true,
      emergencyContact: '',

      // Accessibility
      wheelchairAccessible: false,
      groundFloorRooms: true,
      lift: false,
      suitableForSeniors: true,
      suitableForChildren: true,

      // Photography
      droneAllowed: true,
      commercialPhotography: false,
      preWeddingShoot: true,

      // Mountain Information
      roadCondition: 'Good',
      roadType: 'Tar',
      walkingDistanceParking: 0,
      steepWalkRequired: false,
      bikeFriendly: true,
      suitableForSedan: true,
      snowAccessible: true,
      monsoonAccessible: true,

      // Scenic Information
      kanchenjungaView: false,
      sunriseView: false,
      sunsetView: false,
      riverView: false,
      forestView: false,
      teaGardenView: false,
      birdWatching: false,
      stargazing: false,

      // Languages Spoken
      langEnglish: true,
      langHindi: true,
      langBengali: false,
      langNepali: true,
      langOthers: '',

      // Special Information
      thingsGuestsShouldKnow: ''
    });

    // Populate default Room Categories for a brand new stays template
    setLocalRoomCategories([
      {
        id: `RC-NEW-${newId}-1`,
        homestayId: newId,
        room_name: 'Himalayan View Premium Suite',
        description: 'A spacious premium suite boasting large glass windows with panoramic snow-capped mountain views, wood-paneled walls, and premium high-altitude wool bedding.',
        price: 2000,
        room_size: '280 sq ft',
        bed_type: 'King Size Double Bed',
        maximum_guests: 3,
        bathroom: 'Attached',
        balcony: 'Private',
        view_type: 'Snow Peaks & Forest Valley',
        breakfast_included: true,
        extra_bed_price: 500,
        number_of_rooms_available: 2,
        room_amenities: ['Room Heater', 'Electric Kettle', 'Geyser', 'Premium Linen', 'Private Balcony', 'Himalayan View'],
        status: 'Active'
      },
      {
        id: `RC-NEW-${newId}-2`,
        homestayId: newId,
        room_name: 'Cozy Alpine Double Room',
        description: 'A warm, beautifully insulated wooden room offering intimate comforts, traditional local rugs, and fresh morning sunlight.',
        price: 1500,
        room_size: '180 sq ft',
        bed_type: 'Queen Size Bed',
        maximum_guests: 2,
        bathroom: 'Attached',
        balcony: 'Shared',
        view_type: 'Village Orchard & Pine Hills',
        breakfast_included: true,
        extra_bed_price: 350,
        number_of_rooms_available: 3,
        room_amenities: ['Warm Blankets', 'Electric Kettle', 'Geyser', 'Hills View'],
        status: 'Active'
      }
    ]);

    setCurrentEditId(null);
    setActiveFormTab('basic');
    setIsEditing(true);
  };

  const toggleArrayItem = (field: 'experiences' | 'collections' | 'seasons' | 'specials' | 'roomTypes' | 'meals', item: string) => {
    setFormData(prev => {
      const arr = prev[field] || [];
      const updated = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.destinationId) {
      triggerNotification('error', 'Name and Destination ID are required.');
      return;
    }

    try {
      const url = currentEditId 
        ? `/api/admin/data/homestays/${currentEditId}` 
        : `/api/admin/data/homestays`;
      const method = currentEditId ? 'PUT' : 'POST';

      const recordBody = {
        ...formData,
        priceMin: Number(formData.priceMin),
        priceMax: Number(formData.priceMax),
        rating: Number(formData.rating),
        reviewCount: Number(formData.reviewCount)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordBody)
      });
      const data = await res.json();

      if (data.success || res.ok) {
        // Save Room Categories
        const homestayId = formData.id || '';
        for (const rc of localRoomCategories) {
          const roomToSave = {
            ...rc,
            homestayId,
            price: Number(rc.price),
            maximum_guests: Number(rc.maximum_guests),
            extra_bed_price: Number(rc.extra_bed_price || 0),
            number_of_rooms_available: Number(rc.number_of_rooms_available || 1)
          };

          try {
            // First try to update
            const putRes = await fetch(`/api/admin/data/room_categories/${rc.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(roomToSave)
            });
            if (!putRes.ok) {
              // If PUT fails, try to create with POST
              await fetch(`/api/admin/data/room_categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomToSave)
              });
            }
          } catch (rcErr) {
            console.error(`Failed to sync room category ${rc.room_name}:`, rcErr);
          }
        }

        triggerNotification('success', currentEditId ? 'Homestay and Room Categories updated successfully!' : 'New Homestay and Room Categories added!');
        setIsEditing(false);
        fetchAllData();
      } else {
        triggerNotification('error', data.error || 'Failed to save record.');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Network error during save action.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete homestay listing "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/data/homestays/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success || res.ok) {
        triggerNotification('success', 'Homestay deleted successfully!');
        fetchAllData();
      } else {
        triggerNotification('error', data.error || 'Failed to delete record.');
      }
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Network error during delete action.');
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Stay Discovery Platform Control Panel</h2>
          </div>
          <p className="text-xs text-slate-400">
            Authorise listing verifications, set experiential indexing, and curate seasonal collections.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleAddNewClick}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Homestay
          </button>
        )}
      </div>

      {/* Notifications banner */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold text-left flex items-center gap-2 border animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {isEditing ? (
        /* EDITING / ADDING COMPONENT VIEW */
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 animate-scale-up text-left">
          
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-bold">
              {currentEditId ? `📐 Edit listing: ${formData.name}` : '➕ Add brand new homestay node'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Core Fields */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">1. Basic Details</h4>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Listing ID *</label>
                <input 
                  type="text"
                  required
                  disabled={!!currentEditId}
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Homestay Name *</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Cozy Pines Homestay"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Destination ID / Village *</label>
                <select
                  value={formData.destinationId}
                  onChange={(e) => setFormData(prev => ({ ...prev, destinationId: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Min Price (₹) *</label>
                  <input 
                    type="number"
                    required
                    value={formData.priceMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceMin: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Max Price (₹) *</label>
                  <input 
                    type="number"
                    required
                    value={formData.priceMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceMax: Number(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Contact WhatsApp/Mobile *</label>
                <input 
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Mobile: 9832012345, WA: 9832012345"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Short Tagline *</label>
                <input 
                  type="text"
                  required
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Magnificent Mt. Kanchenjunga views from bed balcony."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">District</label>
                  <input 
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. Darjeeling"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">State</label>
                  <input 
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. West Bengal"
                  />
                </div>
              </div>
            </div>

            {/* Column 2: Experiences & Collections checklist */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">2. Categorisation Mapping</h4>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Experience Tags (Multiple)</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto border border-slate-150 rounded-xl p-2 scrollbar-thin">
                  {experiencesList.map(exp => {
                    const isChecked = formData.experiences.includes(exp);
                    return (
                      <button
                        type="button"
                        key={exp}
                        onClick={() => toggleArrayItem('experiences', exp)}
                        className={`p-1.5 rounded-lg text-[9px] font-bold border text-left flex items-center justify-between cursor-pointer ${
                          isChecked ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-slate-50 dark:bg-slate-950 border-slate-200'
                        }`}
                      >
                        <span className="truncate">{exp}</span>
                        {isChecked && <Check className="w-3 h-3 text-teal-650 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Featured Collections (Multiple)</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto border border-slate-150 rounded-xl p-2 scrollbar-thin">
                  {collectionsList.map(col => {
                    const isChecked = formData.collections.includes(col);
                    return (
                      <button
                        type="button"
                        key={col}
                        onClick={() => toggleArrayItem('collections', col)}
                        className={`p-1.5 rounded-lg text-[9px] font-bold border text-left flex items-center justify-between cursor-pointer ${
                          isChecked ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 dark:bg-slate-950 border-slate-200'
                        }`}
                      >
                        <span className="truncate">{col}</span>
                        {isChecked && <Check className="w-3 h-3 text-amber-650 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Seasons Checklist</label>
                <div className="grid grid-cols-2 gap-1.5 border border-slate-150 rounded-xl p-2">
                  {seasonsList.map(season => {
                    const isChecked = formData.seasons.includes(season);
                    return (
                      <button
                        type="button"
                        key={season}
                        onClick={() => toggleArrayItem('seasons', season)}
                        className={`p-1.5 rounded-lg text-[9px] font-bold border text-left flex items-center justify-between cursor-pointer ${
                          isChecked ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-slate-50 dark:bg-slate-955 border-slate-200'
                        }`}
                      >
                        <span className="truncate">{season}</span>
                        {isChecked && <Check className="w-3 h-3 text-indigo-650 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 3: Badges, Specials & Settings */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">3. Badges & Rules</h4>
              
              <div className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Verified Listing</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, isVerified: !p.isVerified }))}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition ${formData.isVerified ? 'bg-emerald-600' : 'bg-slate-350 bg-slate-300'}`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition ${formData.isVerified ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Featured Hero Stay</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, isFeatured: !p.isFeatured }))}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition ${formData.isFeatured ? 'bg-emerald-600' : 'bg-slate-350 bg-slate-300'}`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition ${formData.isFeatured ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {formData.isActive ? <Eye className="w-4 h-4 text-blue-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    <span>Active Public Listing</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition ${formData.isActive ? 'bg-emerald-600' : 'bg-slate-350 bg-slate-300'}`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition ${formData.isActive ? 'translate-x-4.5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Special Collection Badges</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto border border-slate-150 rounded-xl p-2 scrollbar-thin">
                  {specialsList.map(sp => {
                    const isChecked = formData.specials.includes(sp);
                    return (
                      <button
                        type="button"
                        key={sp}
                        onClick={() => toggleArrayItem('specials', sp)}
                        className={`p-1.5 rounded-lg text-[9px] font-bold border text-left flex items-center justify-between cursor-pointer ${
                          isChecked ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-50 dark:bg-slate-950 border-slate-200'
                        }`}
                      >
                        <span className="truncate">{sp}</span>
                        {isChecked && <Check className="w-3 h-3 text-purple-650 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Rating Value</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) || 4.5 }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Reviews Count</label>
                  <input 
                    type="number"
                    value={formData.reviewCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewCount: Number(e.target.value) || 12 }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Tabbed Sub-forms */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono mb-4">4. High-Altitude & Guest Experience Details (Premium Configuration)</h4>
            
            {/* Tabs Selector */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
              {[
                { id: 'basic', label: 'Guest Policies', icon: Shield },
                { id: 'policies', label: 'Property Rules', icon: FileText },
                { id: 'food', label: 'Dining & Vibes', icon: Coffee },
                { id: 'facilities', label: 'Utilities & Access', icon: Wifi },
                { id: 'location', label: 'Mountain & Scenic', icon: Compass },
                { id: 'rooms', label: 'Rooms Manager', icon: Bed }
              ].map(t => {
                const Icon = t.icon;
                const isSelected = activeFormTab === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setActiveFormTab(t.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT AREAS */}
            <div className="bg-slate-50/50 dark:bg-slate-950/30 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fade-in text-xs">
              
              {/* Tab 1: Guest Policies */}
              {activeFormTab === 'basic' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <h5 className="font-extrabold text-sm text-slate-800 dark:text-white">Guest Demographic Policies</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Unmarried Couples Allowed</span>
                        <span className="text-[10px] text-slate-400">Accept consensual adult couples</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, unmarriedCouplesAllowed: !p.unmarriedCouplesAllowed }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.unmarriedCouplesAllowed ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.unmarriedCouplesAllowed ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Local ID Proofs Accepted</span>
                        <span className="text-[10px] text-slate-400">Accept same-district visitor IDs</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, localIdsAccepted: !p.localIdsAccepted }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.localIdsAccepted ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.localIdsAccepted ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Foreign Guests Allowed</span>
                        <span className="text-[10px] text-slate-400">Has necessary registration permits</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, foreignGuestsAllowed: !p.foreignGuestsAllowed }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.foreignGuestsAllowed ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.foreignGuestsAllowed ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Bachelor Groups Allowed</span>
                        <span className="text-[10px] text-slate-400">Accept single-gender group check-ins</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, bachelorGroupsAllowed: !p.bachelorGroupsAllowed }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.bachelorGroupsAllowed ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.bachelorGroupsAllowed ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Family Friendly Accent</span>
                        <span className="text-[10px] text-slate-400">Suitable environments for children/elders</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, familyFriendly: !p.familyFriendly }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.familyFriendly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.familyFriendly ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Solo Female Safe Verified</span>
                        <span className="text-[10px] text-slate-400">High-safety environment verified</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, soloFemaleFriendly: !p.soloFemaleFriendly }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.soloFemaleFriendly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.soloFemaleFriendly ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Children Accommodated</span>
                        <span className="text-[10px] text-slate-400">Safe play areas and custom kids meals</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, childrenAllowed: !p.childrenAllowed }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.childrenAllowed ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.childrenAllowed ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Senior Citizen Welcomed</span>
                        <span className="text-[10px] text-slate-400">Easy accessibility and non-spicy meals</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, seniorCitizenFriendly: !p.seniorCitizenFriendly }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.seniorCitizenFriendly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.seniorCitizenFriendly ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Min Age Required</label>
                      <input 
                        type="number"
                        value={formData.minCheckInAge}
                        onChange={(e) => setFormData(p => ({ ...p, minCheckInAge: Number(e.target.value) }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Pet Policy Rules</label>
                      <input 
                        type="text"
                        value={formData.petPolicy}
                        onChange={(e) => setFormData(p => ({ ...p, petPolicy: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        placeholder="e.g. Allowed for free. Must be leash-trained."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Property Rules */}
              {activeFormTab === 'policies' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-sky-500" />
                    <h5 className="font-extrabold text-sm text-slate-800 dark:text-white">Property Rules & Standard Timings</h5>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Check-in Time</label>
                      <input 
                        type="text"
                        value={formData.checkInTime}
                        onChange={(e) => setFormData(p => ({ ...p, checkInTime: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Check-out Time</label>
                      <input 
                        type="text"
                        value={formData.checkOutTime}
                        onChange={(e) => setFormData(p => ({ ...p, checkOutTime: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Early Check-in Option</label>
                      <input 
                        type="text"
                        value={formData.earlyCheckIn}
                        onChange={(e) => setFormData(p => ({ ...p, earlyCheckIn: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Late Check-out Option</label>
                      <input 
                        type="text"
                        value={formData.lateCheckOut}
                        onChange={(e) => setFormData(p => ({ ...p, lateCheckOut: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Advance Booking Deposit</label>
                      <input 
                        type="text"
                        value={formData.advancePayment}
                        onChange={(e) => setFormData(p => ({ ...p, advancePayment: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        placeholder="e.g. 50% advance to confirm booking"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Quiet Hours Policy</label>
                      <input 
                        type="text"
                        value={formData.quietHours}
                        onChange={(e) => setFormData(p => ({ ...p, quietHours: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        placeholder="e.g. 10:00 PM to 7:00 AM"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">GST Tax Invoice</span>
                        <span className="text-[10px] text-slate-400">Can issue valid corporate tax invoice</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, gstInvoice: !p.gstInvoice }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.gstInvoice ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.gstInvoice ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Cancellation Policy Description</label>
                      <textarea 
                        rows={2}
                        value={formData.cancellationPolicy}
                        onChange={(e) => setFormData(p => ({ ...p, cancellationPolicy: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Extra Mattresses & Beds Policy</label>
                      <textarea 
                        rows={2}
                        value={formData.extraBedPolicy}
                        onChange={(e) => setFormData(p => ({ ...p, extraBedPolicy: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Driver Accommodation Details</label>
                      <input 
                        type="text"
                        value={formData.driverAccommodation}
                        onChange={(e) => setFormData(p => ({ ...p, driverAccommodation: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        placeholder="e.g. Free driver dormitory"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Driver Food Rate & Policy</label>
                      <input 
                        type="text"
                        value={formData.driverMeals}
                        onChange={(e) => setFormData(p => ({ ...p, driverMeals: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        placeholder="e.g. ₹150 per meal extra"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Day Visitor Policy</label>
                      <input 
                        type="text"
                        value={formData.visitorPolicy}
                        onChange={(e) => setFormData(p => ({ ...p, visitorPolicy: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        placeholder="e.g. Visitors welcome in dining lounge"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Food & Vibes */}
              {activeFormTab === 'food' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <h5 className="font-extrabold text-sm text-slate-800 dark:text-white">Dining Formats, Smoking & Alcohol Rules</h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Strictly Vegetarian Only</span>
                        <span className="text-[10px] text-slate-400">No non-veg allowed on-premises</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, vegOnly: !p.vegOnly, nonVegAvailable: p.vegOnly ? p.nonVegAvailable : false }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.vegOnly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.vegOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Non-Vegetarian Available</span>
                        <span className="text-[10px] text-slate-400">Can cook/serve fresh chicken/fish</span>
                      </div>
                      <button
                        type="button"
                        disabled={formData.vegOnly}
                        onClick={() => setFormData(p => ({ ...p, nonVegAvailable: !p.nonVegAvailable }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.vegOnly ? 'opacity-40 cursor-not-allowed bg-slate-200' : formData.nonVegAvailable ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.nonVegAvailable && !formData.vegOnly ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Jain Food Available</span>
                        <span className="text-[10px] text-slate-400">No onion/garlic/roots choice</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, jainFoodAvailable: !p.jainFoodAvailable }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.jainFoodAvailable ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.jainFoodAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Vegan Options Offered</span>
                        <span className="text-[10px] text-slate-400">Dairy-free plant milks/meals</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, veganFoodAvailable: !p.veganFoodAvailable }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.veganFoodAvailable ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.veganFoodAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Outside Food Permitted</span>
                        <span className="text-[10px] text-slate-400">Can bring food from nearby cafes</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, outsideFoodAllowed: !p.outsideFoodAllowed }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.outsideFoodAllowed ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.outsideFoodAllowed ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Guest Self Cooking Allowed</span>
                        <span className="text-[10px] text-slate-400">Has separate stove for guests</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, selfCooking: !p.selfCooking }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.selfCooking ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.selfCooking ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Shared Kitchen Access</span>
                        <span className="text-[10px] text-slate-400">Can use family kitchen utensils</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, kitchenAccess: !p.kitchenAccess }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.kitchenAccess ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.kitchenAccess ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Smoking Policy</label>
                      <input 
                        type="text"
                        value={formData.smokingPolicy}
                        onChange={(e) => setFormData(p => ({ ...p, smokingPolicy: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        placeholder="e.g. Allowed in designated garden zones only"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Alcohol Consumption Policy</label>
                      <input 
                        type="text"
                        value={formData.alcoholPolicy}
                        onChange={(e) => setFormData(p => ({ ...p, alcoholPolicy: e.target.value }))}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        placeholder="e.g. Allowed in rooms. No rowdy behavior."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Parties / Events Allowed</span>
                        <span className="text-[10px] text-slate-400">Can book entire stay for events</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, partiesAllowed: !p.partiesAllowed }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.partiesAllowed ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.partiesAllowed ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Loud Speaker Music Permitted</span>
                        <span className="text-[10px] text-slate-400">Allow speaker systems in lawn</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, loudMusic: !p.loudMusic }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.loudMusic ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.loudMusic ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Barbecue Grill Grid</span>
                        <span className="text-[10px] text-slate-400">Grill set & charcoal on request</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, bbqAvailable: !p.bbqAvailable }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.bbqAvailable ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.bbqAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-bold block">Alpine Bonfire Night</span>
                        <span className="text-[10px] text-slate-400">Organise campfire nights for guests</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, bonfireAvailable: !p.bonfireAvailable }))}
                        className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.bonfireAvailable ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.bonfireAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Facilities, Safety & Languages */}
              {activeFormTab === 'facilities' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Transport & Parking */}
                  <div>
                    <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3">Transport & Parking Rules</h6>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">4-Wheel Parking</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, carParking: !p.carParking }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.carParking ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.carParking ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Two-Wheeler Space</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, bikeParking: !p.bikeParking }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.bikeParking ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.bikeParking ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">EV Charging Slot</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, evCharging: !p.evCharging }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.evCharging ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.evCharging ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Taxi Direct Reach</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, taxiReachesProperty: !p.taxiReachesProperty }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.taxiReachesProperty ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.taxiReachesProperty ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Driver Overnight Park</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, driverParking: !p.driverParking }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.driverParking ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.driverParking ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* High-Speed Wifi & Networks */}
                  <div>
                    <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3">Mountain Connectivity</h6>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="font-bold block text-slate-800 dark:text-white">Broadband Wifi Available</span>
                          <span className="text-[10px] text-slate-400">High speed fiber connection</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, wifi: !p.wifi }))}
                          className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.wifi ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.wifi ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Wifi Bandwidth Speed</label>
                        <input 
                          type="text"
                          value={formData.wifiSpeed}
                          onChange={(e) => setFormData(p => ({ ...p, wifiSpeed: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                          placeholder="e.g. 100 Mbps"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Network Strength</label>
                        <input 
                          type="text"
                          value={formData.networkStrength}
                          onChange={(e) => setFormData(p => ({ ...p, networkStrength: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                          placeholder="e.g. Good Jio, Airtel 4G"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Mobile Network Carriers (comma-separated)</label>
                        <input 
                          type="text"
                          value={formData.mobileNetworks ? (Array.isArray(formData.mobileNetworks) ? formData.mobileNetworks.join(', ') : formData.mobileNetworks) : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData(p => ({ ...p, mobileNetworks: val.split(',').map(s => s.trim()).filter(Boolean) }));
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono font-bold"
                          placeholder="Jio, Airtel"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Utilities */}
                  <div>
                    <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3">Electricity & Water Security</h6>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">24x7 Power</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, electricity24x7: !p.electricity24x7 }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.electricity24x7 ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.electricity24x7 ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Power Backup</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, powerBackup: !p.powerBackup }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.powerBackup ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.powerBackup ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Generator Set</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, generator: !p.generator }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.generator ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.generator ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Solar Power</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, solar: !p.solar }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.solar ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.solar ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">24hr Hot Water</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, hotWater: !p.hotWater }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.hotWater ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.hotWater ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div>
                        <input 
                          type="text"
                          value={formData.waterSupply}
                          onChange={(e) => setFormData(p => ({ ...p, waterSupply: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-bold"
                          placeholder="Water source (e.g. Spring Water)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Safety & Caretaker */}
                  <div>
                    <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3">Safety & On-site Care</h6>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-rose-500">CCTV Common Areas</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, cctv: !p.cctv }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.cctv ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.cctv ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Fire Extinguisher</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, fireExtinguisher: !p.fireExtinguisher }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.fireExtinguisher ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.fireExtinguisher ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">First Aid Kit</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, firstAidKit: !p.firstAidKit }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.firstAidKit ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.firstAidKit ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">24hr Caretaker</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, caretaker: !p.caretaker }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.caretaker ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.caretaker ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div>
                        <input 
                          type="text"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData(p => ({ ...p, emergencyContact: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-bold"
                          placeholder="Emergency contact phone"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Languages Spoken */}
                  <div>
                    <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3">Host Languages Spoken</h6>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">English</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, langEnglish: !p.langEnglish }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.langEnglish ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.langEnglish ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Hindi</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, langHindi: !p.langHindi }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.langHindi ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.langHindi ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Bengali</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, langBengali: !p.langBengali }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.langBengali ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.langBengali ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Nepali</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, langNepali: !p.langNepali }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.langNepali ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.langNepali ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div>
                        <input 
                          type="text"
                          value={formData.langOthers}
                          onChange={(e) => setFormData(p => ({ ...p, langOthers: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 font-bold"
                          placeholder="Other languages..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Mountain & Scenic Information */}
              {activeFormTab === 'location' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Road & Vehicle conditions */}
                  <div>
                    <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3">Terrain & Road Accessibility</h6>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Road Condition</label>
                        <select
                          value={formData.roadCondition}
                          onChange={(e) => setFormData(p => ({ ...p, roadCondition: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        >
                          <option value="Good">Good (Fully paved, easy drive)</option>
                          <option value="Average">Average (Slightly bumpy/patchy)</option>
                          <option value="Rough">Rough (Steep off-road, high clearance needed)</option>
                          <option value="Adventure">Adventure (Narrow, strict mountain curves)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Road Type</label>
                        <select
                          value={formData.roadType}
                          onChange={(e) => setFormData(p => ({ ...p, roadType: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        >
                          <option value="Tar">Tar / Asphalt road</option>
                          <option value="Concrete">Concrete block road</option>
                          <option value="Gravel">Gravel / Stone path</option>
                          <option value="Muddy">Dirt / Muddy trail</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Walking distance from Parking (meters)</label>
                        <input 
                          type="number"
                          value={formData.walkingDistanceParking}
                          onChange={(e) => setFormData(p => ({ ...p, walkingDistanceParking: Number(e.target.value) }))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="font-bold block">Steep Walk Required</span>
                          <span className="text-[10px] text-slate-400">Requires physical climbing effort</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, steepWalkRequired: !p.steepWalkRequired }))}
                          className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${formData.steepWalkRequired ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${formData.steepWalkRequired ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Bike Friendly</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, bikeFriendly: !p.bikeFriendly }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.bikeFriendly ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.bikeFriendly ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Sedan Car Reachable</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, suitableForSedan: !p.suitableForSedan }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.suitableForSedan ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.suitableForSedan ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Snow Accessible</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, snowAccessible: !p.snowAccessible }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.snowAccessible ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.snowAccessible ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-bold">Monsoon Safe Reach</span>
                        <button
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, monsoonAccessible: !p.monsoonAccessible }))}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition ${formData.monsoonAccessible ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData.monsoonAccessible ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scenic views */}
                  <div>
                    <h6 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3">Scenic Views & Activities Available</h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { field: 'kanchenjungaView', label: 'Mt. Kanchenjunga View', desc: 'Direct snow peak view from rooms' },
                        { field: 'sunriseView', label: 'Sunrise View Point', desc: 'Catch morning sun over ridge' },
                        { field: 'sunsetView', label: 'Sunset Vista Point', desc: 'Beautiful dusk skyline' },
                        { field: 'riverView', label: 'Riverside View', desc: 'Overlooks mountain river stream' },
                        { field: 'forestView', label: 'Pine Forest View', desc: 'Facing green alpine woodlands' },
                        { field: 'teaGardenView', label: 'Tea Garden Scenic', desc: 'Bordered by terraced tea estates' },
                        { field: 'birdWatching', label: 'Bird Watching Haven', desc: 'Frequent endemic bird visitors' },
                        { field: 'stargazing', label: 'Clear Stargazing Dark Sky', desc: 'Zero light pollution skies' }
                      ].map(view => (
                        <div key={view.field} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-bold block">{view.label}</span>
                            <span className="text-[9px] text-slate-400">{view.desc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, [view.field]: !p[view.field as any] } as any))}
                            className={`w-8 h-4.5 rounded-full p-0.5 transition shrink-0 ${formData[view.field as keyof Homestay] ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition ${formData[view.field as keyof Homestay] ? 'translate-x-3.5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Rooms Manager (Room Categories) */}
              {activeFormTab === 'rooms' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-emerald-500" />
                      <h5 className="font-extrabold text-sm text-slate-800 dark:text-white">Room Category Inventory ({localRoomCategories.length})</h5>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoomCategory({
                          id: `RC-TEMP-${Date.now()}`,
                          homestayId: formData.id || '',
                          room_name: '',
                          description: '',
                          price: 1500,
                          room_size: '200 sq ft',
                          bed_type: 'King Size Bed',
                          maximum_guests: 2,
                          bathroom: 'Attached',
                          balcony: 'Private',
                          view_type: 'Mountain View',
                          breakfast_included: true,
                          extra_bed_price: 350,
                          number_of_rooms_available: 2,
                          room_amenities: ['Geyser', 'Warm Blankets', 'Electric Kettle'],
                          status: 'Active'
                        });
                        setIsRoomModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg text-[10px] font-bold hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Custom Room Category
                    </button>
                  </div>

                  {/* Room Categories Table List */}
                  {localRoomCategories.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed text-slate-400 font-bold">
                      No custom rooms configured. Please add at least one Room Category to make this stay bookable.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {localRoomCategories.map((rc, idx) => (
                        <div key={rc.id || idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between text-left relative overflow-hidden group">
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs block text-slate-900 dark:text-white">{rc.room_name}</span>
                              <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400">₹{rc.price}/night</span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-2">{rc.description}</p>
                            
                            <div className="flex flex-wrap gap-1 pt-2">
                              <span className="bg-slate-100 dark:bg-slate-800 text-[9px] px-2 py-0.5 rounded-md font-medium text-slate-500">{rc.bed_type}</span>
                              <span className="bg-slate-100 dark:bg-slate-800 text-[9px] px-2 py-0.5 rounded-md font-medium text-slate-500">{rc.room_size}</span>
                              <span className="bg-slate-100 dark:bg-slate-800 text-[9px] px-2 py-0.5 rounded-md font-medium text-slate-500">Max Guests: {rc.maximum_guests}</span>
                              <span className="bg-slate-100 dark:bg-slate-800 text-[9px] px-2 py-0.5 rounded-md font-medium text-slate-500">Bath: {rc.bathroom}</span>
                              <span className="bg-slate-100 dark:bg-slate-800 text-[9px] px-2 py-0.5 rounded-md font-medium text-slate-500">Balcony: {rc.balcony}</span>
                              {rc.breakfast_included && (
                                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded-md font-bold">Free Breakfast</span>
                              )}
                            </div>
                          </div>

                          <div className="border-t mt-4 pt-3 flex items-center justify-between">
                            <span className="text-[9px] font-mono text-slate-400">Rooms: {rc.number_of_rooms_available} • Status: {rc.status || 'Active'}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRoomCategory({ ...rc });
                                  setIsRoomModalOpen(true);
                                }}
                                className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 transition cursor-pointer"
                                title="Edit Room Type"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete room category "${rc.room_name}"?`)) {
                                    setLocalRoomCategories(prev => prev.filter(item => item.id !== rc.id));
                                  }
                                }}
                                className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition cursor-pointer"
                                title="Delete Room Type"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special Information Text */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 text-left">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Things Guests Should Know (Strict Warnings/Disclaimers for High Altitudes)</label>
                    <textarea 
                      rows={3}
                      value={formData.thingsGuestsShouldKnow}
                      onChange={(e) => setFormData(p => ({ ...p, thingsGuestsShouldKnow: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      placeholder="e.g. 1) Direct road stops 50m before stay; stairs involved. 2) Power cuts are frequent in monsoon; backup runs 4 hours max. 3) Bring essential personal medicines as pharmacies are 5km away."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ROOM CATEGORY EDIT/ADD DIALOG OVERLAY */}
          {isRoomModalOpen && editingRoomCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in text-slate-850">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
                
                <div className="flex items-center justify-between border-b pb-3">
                  <h6 className="text-sm font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
                    <Bed className="w-4 h-4 text-emerald-500" />
                    <span>Configure Room Inventory Profile</span>
                  </h6>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRoomModalOpen(false);
                      setEditingRoomCategory(null);
                    }}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Room Name *</label>
                    <input 
                      type="text"
                      required
                      value={editingRoomCategory.room_name || ''}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, room_name: e.target.value }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-emerald-500"
                      placeholder="e.g. Deluxe Himalayan View Room"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Nightly Cost (₹) *</label>
                    <input 
                      type="number"
                      required
                      value={editingRoomCategory.price || 1500}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, price: Number(e.target.value) }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Room/Suite Description *</label>
                    <textarea 
                      required
                      rows={2}
                      value={editingRoomCategory.description || ''}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, description: e.target.value }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold focus:ring-1 focus:ring-emerald-500"
                      placeholder="e.g. Spacious wood-paneled room on the 1st floor featuring traditional Tibetan rugs and local spruce furniture."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Room Dimensions Size</label>
                    <input 
                      type="text"
                      value={editingRoomCategory.room_size || ''}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, room_size: e.target.value }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      placeholder="e.g. 240 sq ft"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Bed Configuration Layout</label>
                    <input 
                      type="text"
                      value={editingRoomCategory.bed_type || ''}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, bed_type: e.target.value }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      placeholder="e.g. King Size Double Bed"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Maximum Guest Capacity</label>
                    <input 
                      type="number"
                      value={editingRoomCategory.maximum_guests || 2}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, maximum_guests: Number(e.target.value) }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Bathroom Type</label>
                    <select
                      value={editingRoomCategory.bathroom || 'Attached'}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, bathroom: e.target.value as any }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                    >
                      <option value="Attached">Attached Private Bathroom</option>
                      <option value="Shared">Shared / Common Bathroom</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Balcony Option</label>
                    <select
                      value={editingRoomCategory.balcony || 'Private'}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, balcony: e.target.value as any }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                    >
                      <option value="Private">Private Balcony</option>
                      <option value="Shared">Shared Balcony Deck</option>
                      <option value="No">No Balcony</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">View Type</label>
                    <input 
                      type="text"
                      value={editingRoomCategory.view_type || ''}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, view_type: e.target.value }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                      placeholder="e.g. Valley view"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-white">Breakfast Included</span>
                      <span className="text-[10px] text-slate-400">Nightly rate includes daily breakfast</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingRoomCategory(p => p ? ({ ...p, breakfast_included: !p.breakfast_included }) : null)}
                      className={`w-9 h-5 rounded-full p-0.5 transition shrink-0 ${editingRoomCategory.breakfast_included ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${editingRoomCategory.breakfast_included ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Extra Bed Price (₹)</label>
                    <input 
                      type="number"
                      value={editingRoomCategory.extra_bed_price || 350}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, extra_bed_price: Number(e.target.value) }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Rooms Available of this Type</label>
                    <input 
                      type="number"
                      value={editingRoomCategory.number_of_rooms_available || 1}
                      onChange={(e) => setEditingRoomCategory(p => p ? ({ ...p, number_of_rooms_available: Number(e.target.value) }) : null)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Amenities Checklist (comma-separated)</label>
                    <input 
                      type="text"
                      value={editingRoomCategory.room_amenities ? (Array.isArray(editingRoomCategory.room_amenities) ? editingRoomCategory.room_amenities.join(', ') : editingRoomCategory.room_amenities) : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditingRoomCategory(p => p ? ({ ...p, room_amenities: val.split(',').map(s => s.trim()).filter(Boolean) }) : null);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono font-bold"
                      placeholder="e.g. Room Heater, Geyser, Kettle"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRoomModalOpen(false);
                      setEditingRoomCategory(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingRoomCategory.room_name) {
                        alert('Room Name is required');
                        return;
                      }
                      
                      const rcObj = editingRoomCategory as RoomCategory;
                      setLocalRoomCategories(prev => {
                        const existsIdx = prev.findIndex(item => item.id === rcObj.id);
                        if (existsIdx > -1) {
                          const updated = [...prev];
                          updated[existsIdx] = rcObj;
                          return updated;
                        } else {
                          return [...prev, rcObj];
                        }
                      });

                      setIsRoomModalOpen(false);
                      setEditingRoomCategory(null);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Confirm Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl border hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Listing
            </button>
          </div>
        </form>
      ) : (
        /* DATATABLE LISTING OF HOMESTAYS */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 text-left shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <h3 className="text-sm font-extrabold font-mono text-slate-550 uppercase tracking-wider">Public Stay Catalogs ({filteredList.length})</h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Search by stay name or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              Connecting database store... Please wait...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              No matching listings found in database cache.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-55 bg-slate-50 border-b font-bold text-slate-450 uppercase tracking-widest font-mono text-[9px]">
                    <th className="p-3">Property Name</th>
                    <th className="p-3">Village / District</th>
                    <th className="p-3 font-mono">Rates / Contact</th>
                    <th className="p-3">Metadata Info</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-semibold text-slate-700 dark:text-slate-200">
                  {filteredList.map(h => {
                    const tags = getDeterministicTags(h);
                    const isVerified = h.isVerified !== undefined ? h.isVerified : tags.isVerified;
                    const isFeatured = h.isFeatured !== undefined ? h.isFeatured : tags.isFeatured;
                    const isActive = h.isActive !== undefined ? h.isActive : tags.isActive;
                    
                    return (
                      <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={(h.images && h.images[0]) || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop"} 
                              alt="" 
                              className="w-9 h-9 rounded-lg object-cover border shrink-0" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop";
                              }}
                            />
                            <div>
                              <span className="font-extrabold text-xs block text-slate-900 dark:text-white">{h.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{h.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <div>
                              <span className="block">{h.destinationId}</span>
                              <span className="text-[10px] text-slate-400 font-normal block">{h.district || 'Darjeeling'} • {h.state || 'West Bengal'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <span className="block font-bold font-mono">₹{h.priceMin} - ₹{h.priceMax}</span>
                            <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{h.contact || 'No Contact listed'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 items-center">
                            {isVerified && (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Award className="w-2.5 h-2.5" /> Ver.
                              </span>
                            )}
                            {isFeatured && (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Feat.
                              </span>
                            )}
                            {!isActive && (
                              <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                Inactive
                              </span>
                            )}
                            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-mono">
                              ★ {h.rating || tags.rating}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(h)}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition cursor-pointer"
                              title="Edit listing details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(h.id, h.name)}
                              className="p-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition cursor-pointer"
                              title="Delete listing permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
