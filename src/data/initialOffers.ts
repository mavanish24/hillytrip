import { Offer } from '../types/offer';

/**
 * Production & Baseline Offers Dataset.
 * Features both Text-Only branded promotional vouchers and Image-based offers.
 */
export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'offer-kalimpong-20',
    title: '20% OFF Your Next Stay in Kalimpong',
    badge: '20% OFF',
    badgeColor: 'emerald',
    category: 'Homestay',
    businessId: 'biz-pine-grove-klp',
    businessName: 'Pine Grove Heritage Homestay',
    businessVerified: true,
    businessRating: 4.9,
    businessPhone: '+91 98320 12345',
    businessWhatsApp: '+91 98320 12345',
    destinationId: 'dest-kalimpong',
    destinationName: 'Kalimpong',
    coverImage: null, // TEXT ONLY
    ctaText: 'Claim 20% OFF',
    shortDescription: 'Enjoy 20% off direct bookings at verified homestays in Kalimpong.',
    fullDescription: 'Stay at a verified heritage homestay in Kalimpong and enjoy 20% off your booking. Includes complimentary farm-fresh organic breakfast, home-brewed tea, and guided trails through centuries-old tea gardens.',
    couponCode: 'KALIMPONG20',
    validFrom: '2026-01-01',
    validTill: '2026-10-31',
    status: 'approved',
    isActive: true,
    isFeatured: true,
    discountPercentage: 20,
    termsAndConditions: [
      'Valid for direct bookings via HillyTrip.',
      'Includes complimentary organic breakfast.',
      'Cannot be combined with other promotional offers.'
    ],
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    analytics: { views: 420, clicks: 88, shares: 24, saves: 35, claims: 19, conversions: 12 }
  },
  {
    id: 'offer-lava-stay-3-get-1',
    title: 'Stay 3 Nights, Get 1 Night FREE in Lava',
    badge: 'Weekend Special',
    badgeColor: 'amber',
    category: 'Homestay',
    businessId: 'biz-lava-cloud-mist',
    businessName: 'Lava Cloud Mist Retreat',
    businessVerified: true,
    businessRating: 4.8,
    businessPhone: '+91 98321 67890',
    businessWhatsApp: '+91 98321 67890',
    destinationId: 'dest-lava',
    destinationName: 'Lava',
    coverImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png', // IMAGE PROVIDED
    ctaText: 'View Offer',
    shortDescription: 'Experience serene pine forest views in Lava with 1 night complimentary stay.',
    fullDescription: 'Escape to the tranquil pine forests of Lava. Book 3 nights stay at Lava Cloud Mist Retreat and get 1 night absolutely FREE. Wake up to misty mountain views, birdsong, and traditional home-cooked delicacies.',
    couponCode: 'LAVAFREE',
    validFrom: '2026-01-01',
    validTill: '2026-11-15',
    status: 'approved',
    isActive: true,
    isFeatured: true,
    discountPercentage: 25,
    termsAndConditions: [
      'Valid on consecutive 3-night bookings.',
      'Free night applies to room tariff only.',
      'Advance reservation required.'
    ],
    createdAt: '2026-06-05T12:00:00.000Z',
    updatedAt: '2026-06-05T12:00:00.000Z',
    analytics: { views: 512, clicks: 110, shares: 31, saves: 48, claims: 22, conversions: 15 }
  },
  {
    id: 'offer-sikkim-taxi-500',
    title: 'Flat ₹500 OFF NJP / Bagdogra Mountain Taxi Booking',
    badge: 'Flat ₹500 OFF',
    badgeColor: 'sky',
    category: 'Taxi Operator',
    businessId: 'biz-sikkim-taxi-assoc',
    businessName: 'Sikkim Himalayan Taxi Operators Association',
    businessVerified: true,
    businessRating: 4.9,
    businessPhone: '+91 98322 11223',
    businessWhatsApp: '+91 98322 11223',
    destinationId: 'dest-gangtok',
    destinationName: 'Gangtok',
    coverImage: null, // TEXT ONLY
    ctaText: 'Book Taxi Deal',
    shortDescription: 'Flat ₹500 instant discount on mountain SUV taxi bookings from NJP/Bagdogra to Gangtok or Pelling.',
    fullDescription: 'Book a certified mountain SUV taxi (Innova, Xylo, Bolero) for NJP Railway Station or Bagdogra Airport pickup to Gangtok, Pelling, or Ravangla. Get flat ₹500 off on all round-trip sightseeing packages with experienced hill drivers.',
    couponCode: 'TAXI500',
    validFrom: '2026-01-01',
    validTill: '2026-12-31',
    status: 'approved',
    isActive: true,
    isFeatured: true,
    flatDiscountAmount: 500,
    termsAndConditions: [
      'Valid for round-trip hill taxi bookings.',
      'Applies to Innova, Xylo, and Bolero vehicles.',
      'Show coupon code during driver confirmation.'
    ],
    createdAt: '2026-06-10T09:00:00.000Z',
    updatedAt: '2026-06-10T09:00:00.000Z',
    analytics: { views: 380, clicks: 95, shares: 18, saves: 29, claims: 24, conversions: 18 }
  },
  {
    id: 'offer-darjeeling-tea-tour',
    title: 'Early Bird 15% OFF Darjeeling Tea Estate Tour & Heritage Stay',
    badge: 'Early Bird',
    badgeColor: 'purple',
    category: 'Local Experience',
    businessId: 'biz-glenburn-tea',
    businessName: 'Glenburn & Valley Tea Experiences',
    businessVerified: true,
    businessRating: 5.0,
    businessPhone: '+91 98323 33445',
    businessWhatsApp: '+91 98323 33445',
    destinationId: 'dest-darjeeling',
    destinationName: 'Darjeeling',
    coverImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png', // IMAGE PROVIDED
    ctaText: 'Explore Deal',
    shortDescription: 'Guided tea plucking, factory walkthrough, and bungalow stay with 15% discount.',
    fullDescription: 'Immerse yourself in Darjeeling tea heritage. Enjoy guided tea plucking sessions, factory walkthroughs, tea tasting masterclasses, and luxurious colonial bungalow stays with a 15% early bird discount.',
    couponCode: 'TEAGARDEN15',
    validFrom: '2026-01-01',
    validTill: '2026-12-31',
    status: 'approved',
    isActive: true,
    isFeatured: false,
    discountPercentage: 15,
    termsAndConditions: [
      'Must book at least 14 days in advance.',
      'Includes complimentary tea tasting session.',
      'Subject to tea garden operating schedule.'
    ],
    createdAt: '2026-06-12T14:30:00.000Z',
    updatedAt: '2026-06-12T14:30:00.000Z',
    analytics: { views: 290, clicks: 64, shares: 15, saves: 22, claims: 14, conversions: 9 }
  },
  {
    id: 'offer-pelling-free-breakfast',
    title: 'Free Breakfast & Nightly Campfire in Pelling',
    badge: 'Free Breakfast',
    badgeColor: 'rose',
    category: 'Hotel',
    businessId: 'biz-kanchenjunga-pelling',
    businessName: 'Kanchenjunga View Lodge & Homestay',
    businessVerified: true,
    businessRating: 4.8,
    businessPhone: '+91 98324 55667',
    businessWhatsApp: '+91 98324 55667',
    destinationId: 'dest-pelling',
    destinationName: 'Pelling',
    coverImage: null, // TEXT ONLY
    ctaText: 'Get Free Perks',
    shortDescription: 'Wake up to unobstructed views of Mount Kanchenjunga with free hot breakfast and bonfire.',
    fullDescription: 'Located in Upper Pelling with direct views of Mt. Kanchenjunga. Enjoy complimentary hot Sikkimese breakfast and nightly campfire sessions with traditional butter tea for all guests.',
    couponCode: 'PELLINGBONFIRE',
    validFrom: '2026-01-01',
    validTill: '2026-10-15',
    status: 'approved',
    isActive: true,
    isFeatured: false,
    termsAndConditions: [
      'Valid for stay of 2 or more nights.',
      'Bonfire subject to weather conditions.',
      'Direct WhatsApp booking required.'
    ],
    createdAt: '2026-06-15T16:00:00.000Z',
    updatedAt: '2026-06-15T16:00:00.000Z',
    analytics: { views: 340, clicks: 76, shares: 20, saves: 31, claims: 17, conversions: 11 }
  }
];

