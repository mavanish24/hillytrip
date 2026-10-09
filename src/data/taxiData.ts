import { 
  TaxiOperatorProfile, 
  OperatorFixedRoute, 
  OperatorVehicleCategory, 
  District, 
  Vehicle, 
  OperatorReview 
} from '../types/taxi';

export const SIKKIM_DISTRICTS: District[] = [
  'Darjeeling',
  'Kalimpong',
  'East Sikkim',
  'North Sikkim',
  'South Sikkim',
  'West Sikkim'
];

export const TAXI_STANDS = [
  { id: 'TAXI0001', name: 'NJP Railway Station Stand', district: 'Siliguri / Plains', info: 'Located at Main Gate Exit 2. Shared cabs depart every 20 mins to Gangtok, Darjeeling & Kalimpong.' },
  { id: 'TAXI0002', name: 'Bagdogra Airport Prepaid Stand', district: 'Siliguri / Plains', info: 'Terminal Exit prepaid booth & verified private cabs.' },
  { id: 'TAXI0003', name: 'Siliguri Junction Motor Stand', district: 'Siliguri / Plains', info: 'Pani Tanki area. Hub for shared cabs & shared jeeps to Darjeeling, Lava & Sikkim.' },
  { id: 'TAXI0004', name: 'Kalimpong Motor Stand', district: 'Kalimpong', info: 'Upper Motor Stand near Rishi Road. Shared cabs to NJP, Gangtok, Lava & Pedong.' },
  { id: 'TAXI0005', name: 'Deorali Taxi Stand (Gangtok)', district: 'East Sikkim', info: 'Main interstate hub in Gangtok for Siliguri, NJP, Kalimpong & West Bengal.' },
  { id: 'TAXI0006', name: 'Darjeeling Motor Stand', district: 'Darjeeling', info: 'Chowk Bazaar & Gandhi Road Stand. Shared & private cabs across Darjeeling hills.' },
  { id: 'TAXI0007', name: 'Pelling Taxi Association Stand', district: 'West Sikkim', info: 'Upper Pelling bus & taxi terminal.' },
  { id: 'TAXI0008', name: 'Ravangla Taxi Stand', district: 'South Sikkim', info: 'Central town stand serving Namchi, Gangtok & Pelling.' },
  { id: 'TAXI0009', name: 'Lachen/Lachung Union Stand', district: 'North Sikkim', info: 'High-altitude 4x4 permit-verified jeep hub.' }
];

export const SIGHTSEEING_PACKAGES = [
  { id: 'gangtok-local-7', name: 'Gangtok Local 7 Point Tour', destination: 'Gangtok', district: 'East Sikkim' as District },
  { id: 'gangtok-local-10', name: 'Gangtok Full Day 10 Point Tour', destination: 'Gangtok', district: 'East Sikkim' as District },
  { id: 'tsomgo-baba-mandir', name: 'Tsomgo Lake & Baba Mandir (Nathula Permit optional)', destination: 'Gangtok', district: 'East Sikkim' as District },
  { id: 'darjeeling-local-7', name: 'Darjeeling 7 Points Sightseeing', destination: 'Darjeeling', district: 'Darjeeling' as District },
  { id: 'tiger-hill-sunrise', name: 'Tiger Hill Sunrise & Ghoom Monastery', destination: 'Darjeeling', district: 'Darjeeling' as District },
  { id: 'kalimpong-5-point', name: 'Kalimpong Deolo & Morgan House Tour', destination: 'Kalimpong', district: 'Kalimpong' as District },
  { id: 'pelling-skywalk', name: 'Pelling Skywalk & Chenrezig Statue Tour', destination: 'Pelling', district: 'West Sikkim' as District },
  { id: 'namchi-char-dham', name: 'Namchi Siddhesvar Dham (Char Dham) & Samdruptse', destination: 'Namchi', district: 'South Sikkim' as District }
];

export const TOUR_PACKAGES = [
  { id: 'north-sikkim-3d2n', name: 'North Sikkim Expedition (Lachen, Lachung, Gurudongmar & Yumthang)', days: 3, district: 'North Sikkim' as District },
  { id: 'silk-route-4d3n', name: 'Old Silk Route Heritage Tour (Zuluk, Nathang, Kupup)', days: 4, district: 'East Sikkim' as District },
  { id: 'dooars-wildlife-3d2n', name: 'Dooars Wildlife & Teesta Valley Safari', days: 3, district: 'Darjeeling' as District },
  { id: 'darjeeling-kalimpong-5d4n', name: 'Grand Hills: Darjeeling & Kalimpong Panorama', days: 5, district: 'Darjeeling' as District }
];

export const ENRICHED_VEHICLES: Vehicle[] = [
  {
    id: 'veh-bolero-1',
    owner_type: 'taxi_operator',
    owner_id: 'op-mountain-view',
    operator_name: 'Mountain View Travels',
    model_name: 'Bolero',
    seats: 7,
    luggage_bags: 5,
    is_ac: false,
    category: 'Standard SUV',
    route_starting_price: 2800,
    image_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    description: 'High-ground clearance 4x4 Mahindra Bolero, ideal for steep Himalayan roads.',
    is_available: true
  },
  {
    id: 'veh-ertiga-1',
    owner_type: 'taxi_operator',
    owner_id: 'op-mountain-view',
    operator_name: 'Mountain View Travels',
    model_name: 'Ertiga',
    seats: 6,
    luggage_bags: 3,
    is_ac: true,
    category: 'MUV / Comfort',
    route_starting_price: 3200,
    image_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    description: 'Smooth riding Maruti Suzuki Ertiga with dual AC, great for families.',
    is_available: true
  },
  {
    id: 'veh-innova-1',
    owner_type: 'taxi_operator',
    owner_id: 'op-mountain-view',
    operator_name: 'Mountain View Travels',
    model_name: 'Innova',
    seats: 7,
    luggage_bags: 4,
    is_ac: true,
    category: 'Premium SUV',
    route_starting_price: 3800,
    image_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    description: 'Toyota Innova Crysta luxury Captain seats, maximum comfort on mountain bends.',
    is_available: true
  },
  {
    id: 'veh-traveller-1',
    owner_type: 'taxi_operator',
    owner_id: 'op-mountain-view',
    operator_name: 'Mountain View Travels',
    model_name: 'Traveller',
    seats: 12,
    luggage_bags: 10,
    is_ac: true,
    category: 'Minibus / Van',
    route_starting_price: 5500,
    image_url: 'undefined',
    description: 'Force Traveller Tempo for group tours with overhead luggage carrier.',
    is_available: true
  },
  {
    id: 'veh-sittong-bolero',
    owner_type: 'homestay_owner',
    owner_id: 'op-sittong-homestay',
    operator_name: 'Sittong Eco Homestay & Cabs',
    model_name: 'Bolero',
    seats: 7,
    luggage_bags: 4,
    is_ac: false,
    category: 'Standard SUV',
    route_starting_price: 2500,
    image_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    description: 'Homestay owned 4WD vehicle for direct pick up from NJP straight to Sittong Orange Orchards.',
    is_available: true
  },
  {
    id: 'veh-kanchenjunga-innova',
    owner_type: 'travel_agency',
    owner_id: 'op-kanchenjunga-agency',
    operator_name: 'Kanchenjunga Expeditions & Cabs',
    model_name: 'Innova',
    seats: 7,
    luggage_bags: 5,
    is_ac: true,
    category: 'Premium SUV',
    route_starting_price: 4200,
    image_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    description: 'Agency verified luxury fleet for West Sikkim & Pelling circuits.',
    is_available: true
  }
];

export const SEED_REVIEWS: Record<string, OperatorReview[]> = {
  'op-mountain-view': [
    {
      id: 'rev-1',
      operator_id: 'op-mountain-view',
      user_name: 'Anirban Dasgupta',
      rating: 5,
      date: 'Aug 2026',
      comment: 'Excellent service from NJP to Kalimpong! Driver Pemba was very careful on NH10 and reached us comfortably in 2.5 hours.',
      trip_route: 'NJP → Kalimpong'
    },
    {
      id: 'rev-2',
      operator_id: 'op-mountain-view',
      user_name: 'Meera Sharma',
      rating: 5,
      date: 'Jul 2026',
      comment: 'Clean Innova, polite driver, and very clear communication over WhatsApp.',
      trip_route: 'Bagdogra → Lava'
    }
  ],
  'op-teesta-valley': [
    {
      id: 'rev-3',
      operator_id: 'op-teesta-valley',
      user_name: 'Rohan Sen',
      rating: 4.9,
      date: 'Jul 2026',
      comment: 'Booked Ertiga for family from Siliguri to Kalimpong. On time pickup and smooth drive.',
      trip_route: 'Siliguri → Kalimpong'
    }
  ],
  'op-sittong-homestay': [
    {
      id: 'rev-4',
      operator_id: 'op-sittong-homestay',
      user_name: 'Pooja Agarwal',
      rating: 5,
      date: 'Jun 2026',
      comment: 'Host Dawa picked us up directly from NJP. Homestay + cab combination made our trip hassle free!',
      trip_route: 'NJP → Sittong'
    }
  ]
};

export const SEED_TAXI_OPERATORS: (TaxiOperatorProfile & { 
  fleet: OperatorVehicleCategory[]; 
  fixedRoutes: OperatorFixedRoute[];
  fleetVehicles?: Vehicle[];
})[] = [
  {
    id: 'op-mountain-view',
    user_id: 'user-op-mv',
    owner_type: 'taxi_operator',
    business_name: 'Mountain View Travels',
    owner_name: 'Sonam Sherpa',
    phone: '+91 98325 44112',
    whatsapp: '919832544112',
    base_taxi_stand: 'Kalimpong Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Bagdogra Airport', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Lava', 'Pedong', 'Rishyap', 'Loleygaon'],
    working_areas: ['Kalimpong', 'Darjeeling', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 5.0,
    reviews_count: 42,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    fleet: [
      { id: 'fl-mv-1', operator_id: 'op-mountain-view', category_name: 'Bolero', vehicle_count: 8 },
      { id: 'fl-mv-2', operator_id: 'op-mountain-view', category_name: 'Ertiga', vehicle_count: 5 },
      { id: 'fl-mv-3', operator_id: 'op-mountain-view', category_name: 'Innova', vehicle_count: 4 },
      { id: 'fl-mv-4', operator_id: 'op-mountain-view', category_name: 'Traveller', vehicle_count: 2 }
    ],
    fixedRoutes: [
      {
        id: 'fr-mv-1',
        operator_id: 'op-mountain-view',
        from_location: 'NJP Railway Station',
        to_location: 'Kalimpong',
        private_taxi_available: true,
        private_starting_price: 2800,
        shared_taxi_available: true,
        shared_fare: 350
      },
      {
        id: 'fr-mv-2',
        operator_id: 'op-mountain-view',
        from_location: 'Bagdogra Airport',
        to_location: 'Kalimpong',
        private_taxi_available: true,
        private_starting_price: 3200,
        shared_taxi_available: true,
        shared_fare: 400
      },
      {
        id: 'fr-mv-3',
        operator_id: 'op-mountain-view',
        from_location: 'Siliguri',
        to_location: 'Lava',
        private_taxi_available: true,
        private_starting_price: 3600,
        shared_taxi_available: true,
        shared_fare: 450
      }
    ]
  },
  {
    id: 'op-teesta-valley',
    user_id: 'user-op-tv',
    owner_type: 'taxi_operator',
    business_name: 'Teesta Valley Cabs & Express',
    owner_name: 'Biren Pradhan',
    phone: '+91 97330 88221',
    whatsapp: '919733088221',
    base_taxi_stand: 'Siliguri Junction Taxi Stand',
    pickup_areas: ['Siliguri', 'NJP', 'NJP Railway Station', 'Bagdogra', 'Bagdogra Airport'],
    drop_areas: ['Kalimpong', 'Gangtok', 'Darjeeling', 'Kurseong'],
    working_areas: ['Darjeeling', 'Kalimpong', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.9,
    reviews_count: 38,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    fleet: [
      { id: 'fl-tv-1', operator_id: 'op-teesta-valley', category_name: 'Ertiga', vehicle_count: 7 },
      { id: 'fl-tv-2', operator_id: 'op-teesta-valley', category_name: 'Innova', vehicle_count: 5 },
      { id: 'fl-tv-3', operator_id: 'op-teesta-valley', category_name: 'Bolero', vehicle_count: 10 }
    ],
    fixedRoutes: [
      {
        id: 'fr-tv-1',
        operator_id: 'op-teesta-valley',
        from_location: 'NJP Railway Station',
        to_location: 'Kalimpong',
        private_taxi_available: true,
        private_starting_price: 2900,
        shared_taxi_available: true,
        shared_fare: 350
      },
      {
        id: 'fr-tv-2',
        operator_id: 'op-teesta-valley',
        from_location: 'Siliguri',
        to_location: 'Gangtok',
        private_taxi_available: true,
        private_starting_price: 3400,
        shared_taxi_available: true,
        shared_fare: 450
      }
    ]
  },
  {
    id: 'op-darjeeling-heights',
    user_id: 'user-op-dh',
    owner_type: 'taxi_operator',
    business_name: 'Darjeeling Heights Taxi Union',
    owner_name: 'Subhash Tamang',
    phone: '+91 97331 44556',
    whatsapp: '919733144556',
    base_taxi_stand: 'Darjeeling Motor Stand',
    pickup_areas: ['Darjeeling', 'Ghoom', 'Kurseong', 'Bagdogra', 'NJP'],
    drop_areas: ['Takdah', 'Tinchuley', 'Lamahatta', 'Kalimpong', 'Darjeeling', 'NJP'],
    working_areas: ['Darjeeling', 'Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.8,
    reviews_count: 56,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    fleet: [
      { id: 'fl-dh-1', operator_id: 'op-darjeeling-heights', category_name: 'Innova', vehicle_count: 6 },
      { id: 'fl-dh-2', operator_id: 'op-darjeeling-heights', category_name: 'Ertiga', vehicle_count: 8 },
      { id: 'fl-dh-3', operator_id: 'op-darjeeling-heights', category_name: 'Bolero', vehicle_count: 12 }
    ],
    fixedRoutes: [
      {
        id: 'fr-dh-1',
        operator_id: 'op-darjeeling-heights',
        from_location: 'Darjeeling',
        to_location: 'Takdah',
        private_taxi_available: true,
        private_starting_price: 1800,
        shared_taxi_available: true,
        shared_fare: 180
      },
      {
        id: 'fr-dh-2',
        operator_id: 'op-darjeeling-heights',
        from_location: 'Bagdogra Airport',
        to_location: 'Darjeeling',
        private_taxi_available: true,
        private_starting_price: 3200,
        shared_taxi_available: true,
        shared_fare: 400
      }
    ]
  },
  {
    id: 'op-sittong-homestay',
    user_id: 'user-op-sh',
    owner_type: 'homestay_owner',
    business_name: 'Sittong Eco Homestay & Cabs',
    owner_name: 'Dawa Lepcha',
    phone: '+91 98002 33119',
    whatsapp: '919800233119',
    base_taxi_stand: 'Siliguri Junction Sittong Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Sittong', 'Latpanchar', 'Ahaldara', 'Kurseong'],
    working_areas: ['Darjeeling', 'Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 5.0,
    reviews_count: 29,
    logo_url: 'undefined',
    fleet: [
      { id: 'fl-sh-1', operator_id: 'op-sittong-homestay', category_name: 'Bolero', vehicle_count: 3 }
    ],
    fixedRoutes: [
      {
        id: 'fr-sh-1',
        operator_id: 'op-sittong-homestay',
        from_location: 'NJP Railway Station',
        to_location: 'Sittong',
        private_taxi_available: true,
        private_starting_price: 2500,
        shared_taxi_available: true,
        shared_fare: 280
      }
    ]
  },
  {
    id: 'op-kanchenjunga-agency',
    user_id: 'user-op-ka',
    owner_type: 'travel_agency',
    business_name: 'Kanchenjunga Expeditions & Cabs',
    owner_name: 'Tshering Subba',
    phone: '+91 94341 66200',
    whatsapp: '919434166200',
    base_taxi_stand: 'Pelling Taxi Association Stand',
    pickup_areas: ['Bagdogra', 'Bagdogra Airport', 'NJP', 'NJP Railway Station', 'Siliguri', 'Gangtok'],
    drop_areas: ['Pelling', 'Yuksom', 'Ravangla', 'Dentam', 'Gyalshing'],
    working_areas: ['West Sikkim', 'South Sikkim', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.9,
    reviews_count: 31,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    fleet: [
      { id: 'fl-ka-1', operator_id: 'op-kanchenjunga-agency', category_name: 'Innova', vehicle_count: 4 },
      { id: 'fl-ka-2', operator_id: 'op-kanchenjunga-agency', category_name: 'Bolero', vehicle_count: 6 }
    ],
    fixedRoutes: [
      {
        id: 'fr-ka-1',
        operator_id: 'op-kanchenjunga-agency',
        from_location: 'Gangtok',
        to_location: 'Pelling',
        private_taxi_available: true,
        private_starting_price: 4200,
        shared_taxi_available: true,
        shared_fare: 550
      },
      {
        id: 'fr-ka-2',
        operator_id: 'op-kanchenjunga-agency',
        from_location: 'NJP Railway Station',
        to_location: 'Pelling',
        private_taxi_available: true,
        private_starting_price: 4500,
        shared_taxi_available: true,
        shared_fare: 600
      }
    ]
  },
  {
    id: 'op-kalimpong-express',
    user_id: 'user-op-ke',
    owner_type: 'taxi_operator',
    business_name: 'Kalimpong Ridge Express Cabs',
    owner_name: 'Pemba Bhutia',
    phone: '+91 98320 11223',
    whatsapp: '919832011223',
    base_taxi_stand: 'Kalimpong Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Pedong', 'Lava', 'Algarah'],
    working_areas: ['Kalimpong', 'Darjeeling'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.8,
    reviews_count: 24,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    fleet: [{ id: 'fl-ke-1', operator_id: 'op-kalimpong-express', category_name: 'Bolero', vehicle_count: 6 }],
    fixedRoutes: [
      { id: 'fr-ke-1', operator_id: 'op-kalimpong-express', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3400, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-himalayan-wheels',
    user_id: 'user-op-hw',
    owner_type: 'taxi_operator',
    business_name: 'Himalayan Wheels & Tours',
    owner_name: 'Mingma Sherpa',
    phone: '+91 97332 55667',
    whatsapp: '919733255667',
    base_taxi_stand: 'NJP Railway Station Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Darjeeling', 'Gangtok', 'Pelling'],
    working_areas: ['Kalimpong', 'Darjeeling', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.9,
    reviews_count: 36,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-hw-1', operator_id: 'op-himalayan-wheels', category_name: 'Bolero', vehicle_count: 10 }],
    fixedRoutes: [
      { id: 'fr-hw-1', operator_id: 'op-himalayan-wheels', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3500, shared_taxi_available: true, shared_fare: 360 }
    ]
  },
  {
    id: 'op-siliguri-transports',
    user_id: 'user-op-st',
    owner_type: 'taxi_operator',
    business_name: 'Siliguri Junction Motor Cabs',
    owner_name: 'Rajesh Sharma',
    phone: '+91 94340 77889',
    whatsapp: '919434077889',
    base_taxi_stand: 'Siliguri Junction Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Darjeeling', 'Gangtok'],
    working_areas: ['Kalimpong', 'Darjeeling', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.7,
    reviews_count: 19,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-st-1', operator_id: 'op-siliguri-transports', category_name: 'Bolero', vehicle_count: 5 }],
    fixedRoutes: [
      { id: 'fr-st-1', operator_id: 'op-siliguri-transports', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3500, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-teesta-express',
    user_id: 'user-op-tx',
    owner_type: 'taxi_operator',
    business_name: 'Teesta Gorge Taxi Syndicate',
    owner_name: 'Anup Chhetri',
    phone: '+91 98322 33445',
    whatsapp: '919832233445',
    base_taxi_stand: 'Kalimpong Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Lava', 'Rishyap'],
    working_areas: ['Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 5.0,
    reviews_count: 28,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    fleet: [{ id: 'fl-tx-1', operator_id: 'op-teesta-express', category_name: 'Bolero', vehicle_count: 7 }],
    fixedRoutes: [
      { id: 'fr-tx-1', operator_id: 'op-teesta-express', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3600, shared_taxi_available: true, shared_fare: 360 }
    ]
  },
  {
    id: 'op-kanchenjunga-cab-hub',
    user_id: 'user-op-kc',
    owner_type: 'taxi_operator',
    business_name: 'Kanchenjunga Vista Cabs',
    owner_name: 'Tashi Gurung',
    phone: '+91 97333 44556',
    whatsapp: '919733344556',
    base_taxi_stand: 'NJP Railway Station Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Darjeeling', 'Gangtok'],
    working_areas: ['Kalimpong', 'Darjeeling'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.8,
    reviews_count: 15,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-kc-1', operator_id: 'op-kanchenjunga-cab-hub', category_name: 'Bolero', vehicle_count: 8 }],
    fixedRoutes: [
      { id: 'fr-kc-1', operator_id: 'op-kanchenjunga-cab-hub', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3700, shared_taxi_available: true, shared_fare: 370 }
    ]
  },
  {
    id: 'op-green-valley-cabs',
    user_id: 'user-op-gv',
    owner_type: 'taxi_operator',
    business_name: 'Green Valley Eco Cabs',
    owner_name: 'Dipen Rai',
    phone: '+91 98321 66778',
    whatsapp: '919832166778',
    base_taxi_stand: 'Kalimpong Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Pedong', 'Icche Gaon'],
    working_areas: ['Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.9,
    reviews_count: 22,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-gv-1', operator_id: 'op-green-valley-cabs', category_name: 'Bolero', vehicle_count: 4 }],
    fixedRoutes: [
      { id: 'fr-gv-1', operator_id: 'op-green-valley-cabs', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3500, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-north-bengal-taxi',
    user_id: 'user-op-nb',
    owner_type: 'taxi_operator',
    business_name: 'North Bengal Transport Guild',
    owner_name: 'Biplab Saha',
    phone: '+91 94342 88990',
    whatsapp: '919434288990',
    base_taxi_stand: 'Bagdogra Airport Prepaid Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Darjeeling', 'Gangtok'],
    working_areas: ['Kalimpong', 'Darjeeling', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.7,
    reviews_count: 41,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    fleet: [{ id: 'fl-nb-1', operator_id: 'op-north-bengal-taxi', category_name: 'Bolero', vehicle_count: 12 }],
    fixedRoutes: [
      { id: 'fr-nb-1', operator_id: 'op-north-bengal-taxi', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3500, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-sikkim-doorstep',
    user_id: 'user-op-sd',
    owner_type: 'taxi_operator',
    business_name: 'Sikkim Gateway Express',
    owner_name: 'Norden Dorjee',
    phone: '+91 98323 99001',
    whatsapp: '919832399001',
    base_taxi_stand: 'NJP Railway Station Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Gangtok', 'Rangpo'],
    working_areas: ['Kalimpong', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 5.0,
    reviews_count: 31,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-sd-1', operator_id: 'op-sikkim-doorstep', category_name: 'Bolero', vehicle_count: 9 }],
    fixedRoutes: [
      { id: 'fr-sd-1', operator_id: 'op-sikkim-doorstep', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3600, shared_taxi_available: true, shared_fare: 360 }
    ]
  },
  {
    id: 'op-deolo-riders',
    user_id: 'user-op-dr',
    owner_type: 'taxi_operator',
    business_name: 'Deolo Hill Cabs & Tours',
    owner_name: 'Karmapa Tamang',
    phone: '+91 97334 11223',
    whatsapp: '919733411223',
    base_taxi_stand: 'Kalimpong Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Deolo', 'Lava'],
    working_areas: ['Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.8,
    reviews_count: 27,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-dr-1', operator_id: 'op-deolo-riders', category_name: 'Bolero', vehicle_count: 6 }],
    fixedRoutes: [
      { id: 'fr-dr-1', operator_id: 'op-deolo-riders', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3500, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-alpine-cross-cabs',
    user_id: 'user-op-ac',
    owner_type: 'taxi_operator',
    business_name: 'Alpine Cross Himalayan Cabs',
    owner_name: 'Lobsang Sangay',
    phone: '+91 98324 22334',
    whatsapp: '919832422334',
    base_taxi_stand: 'NJP Railway Station Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Darjeeling', 'Gangtok'],
    working_areas: ['Kalimpong', 'Darjeeling', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.9,
    reviews_count: 33,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    fleet: [{ id: 'fl-ac-1', operator_id: 'op-alpine-cross-cabs', category_name: 'Bolero', vehicle_count: 8 }],
    fixedRoutes: [
      { id: 'fr-ac-1', operator_id: 'op-alpine-cross-cabs', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3450, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-pine-valley-taxis',
    user_id: 'user-op-pv',
    owner_type: 'taxi_operator',
    business_name: 'Pine Valley Eco Motors',
    owner_name: 'Nima Wangdi',
    phone: '+91 97335 33445',
    whatsapp: '919733533445',
    base_taxi_stand: 'Kalimpong Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Lolegaon', 'Rishyap'],
    working_areas: ['Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.7,
    reviews_count: 14,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-pv-1', operator_id: 'op-pine-valley-taxis', category_name: 'Bolero', vehicle_count: 5 }],
    fixedRoutes: [
      { id: 'fr-pv-1', operator_id: 'op-pine-valley-taxis', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3550, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-coronation-express',
    user_id: 'user-op-ce',
    owner_type: 'taxi_operator',
    business_name: 'Coronation Bridge Cabs',
    owner_name: 'Sanjoy Moktan',
    phone: '+91 98325 44556',
    whatsapp: '919832544556',
    base_taxi_stand: 'NJP Railway Station Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Teesta', 'Melli'],
    working_areas: ['Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.8,
    reviews_count: 21,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-ce-1', operator_id: 'op-coronation-express', category_name: 'Bolero', vehicle_count: 7 }],
    fixedRoutes: [
      { id: 'fr-ce-1', operator_id: 'op-coronation-express', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3500, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-rishi-road-riders',
    user_id: 'user-op-rr',
    owner_type: 'taxi_operator',
    business_name: 'Rishi Road Taxi Drivers Association',
    owner_name: 'Bhutia Sherpa',
    phone: '+91 97336 55667',
    whatsapp: '919733655667',
    base_taxi_stand: 'Kalimpong Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Pedong', 'Reshi'],
    working_areas: ['Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.9,
    reviews_count: 38,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    fleet: [{ id: 'fl-rr-1', operator_id: 'op-rishi-road-riders', category_name: 'Bolero', vehicle_count: 11 }],
    fixedRoutes: [
      { id: 'fr-rr-1', operator_id: 'op-rishi-road-riders', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3600, shared_taxi_available: true, shared_fare: 360 }
    ]
  },
  {
    id: 'op-silk-route-cabs',
    user_id: 'user-op-sr',
    owner_type: 'taxi_operator',
    business_name: 'Silk Route Himalayan Cabs',
    owner_name: 'Passang Bhutia',
    phone: '+91 98326 66778',
    whatsapp: '919832666778',
    base_taxi_stand: 'NJP Railway Station Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Zuluk', 'Aritar'],
    working_areas: ['Kalimpong', 'East Sikkim'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 5.0,
    reviews_count: 45,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-sr-1', operator_id: 'op-silk-route-cabs', category_name: 'Bolero', vehicle_count: 10 }],
    fixedRoutes: [
      { id: 'fr-sr-1', operator_id: 'op-silk-route-cabs', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3500, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-bagdogra-shuttle',
    user_id: 'user-op-bs',
    owner_type: 'taxi_operator',
    business_name: 'Bagdogra Airport Express Line',
    owner_name: 'Suman Roy',
    phone: '+91 97337 77889',
    whatsapp: '919733777889',
    base_taxi_stand: 'Bagdogra Airport Prepaid Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Kalimpong', 'Darjeeling', 'Gangtok'],
    working_areas: ['Kalimpong', 'Darjeeling'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.8,
    reviews_count: 29,
    logo_url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    fleet: [{ id: 'fl-bs-1', operator_id: 'op-bagdogra-shuttle', category_name: 'Bolero', vehicle_count: 8 }],
    fixedRoutes: [
      { id: 'fr-bs-1', operator_id: 'op-bagdogra-shuttle', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3550, shared_taxi_available: true, shared_fare: 350 }
    ]
  },
  {
    id: 'op-chota-mangwa-homestay-cab',
    user_id: 'user-op-cm',
    owner_type: 'homestay_owner',
    business_name: 'Chota Mangwa Village Cabs',
    owner_name: 'Lhakpa Sherpa',
    phone: '+91 98327 88990',
    whatsapp: '919832788990',
    base_taxi_stand: 'Siliguri Junction Motor Stand',
    pickup_areas: ['NJP', 'NJP Railway Station', 'Bagdogra', 'Siliguri'],
    drop_areas: ['Chota Mangwa', 'Bara Mangwa', 'Kalimpong'],
    working_areas: ['Kalimpong', 'Darjeeling'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'approved',
    is_verified: true,
    rating: 4.9,
    reviews_count: 18,
    logo_url: 'undefined',
    fleet: [{ id: 'fl-cm-1', operator_id: 'op-chota-mangwa-homestay-cab', category_name: 'Bolero', vehicle_count: 3 }],
    fixedRoutes: [
      { id: 'fr-cm-1', operator_id: 'op-chota-mangwa-homestay-cab', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 3400, shared_taxi_available: true, shared_fare: 340 }
    ]
  },
  {
    id: 'op-pending-unverified-taxi',
    user_id: 'user-op-pu',
    owner_type: 'taxi_operator',
    business_name: 'Unverified Newbie Cabs',
    owner_name: 'Test Unverified',
    phone: '+91 99999 00000',
    whatsapp: '919999900000',
    base_taxi_stand: 'NJP Railway Station Stand',
    pickup_areas: ['NJP', 'NJP Railway Station'],
    drop_areas: ['Kalimpong'],
    working_areas: ['Kalimpong'],
    booking_preference: 'both',
    is_online: true,
    booking_enabled: true,
    verification_status: 'pending', // IGNORED BY MARKET REFERENCE ENGINE
    is_verified: false,
    rating: 3.0,
    reviews_count: 1,
    logo_url: '',
    fleet: [{ id: 'fl-pu-1', operator_id: 'op-pending-unverified-taxi', category_name: 'Bolero', vehicle_count: 1 }],
    fixedRoutes: [
      { id: 'fr-pu-1', operator_id: 'op-pending-unverified-taxi', from_location: 'NJP Railway Station', to_location: 'Kalimpong', private_taxi_available: true, private_starting_price: 1500, shared_taxi_available: true, shared_fare: 100 }
    ]
  }
];
