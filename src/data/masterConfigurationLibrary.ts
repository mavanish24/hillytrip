export interface ConfigOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  assignedBusinessTypes?: string[]; // e.g. ['homestay', 'hotel', 'resort', 'camping']
}

export interface ConfigCategory {
  id: string;
  title: string;
  description: string;
  options: ConfigOption[];
}

// Master Configuration Library Initial State
export const INITIAL_MASTER_CONFIG_LIBRARY: Record<string, ConfigCategory> = {
  amenities: {
    id: 'amenities',
    title: 'Standard Property Amenities',
    description: 'Hardware, appliances, and infrastructure available to guests',
    options: [
      { id: 'wifi', label: 'Wi-Fi Access', value: 'wifi', icon: '📶', description: 'Wireless internet connectivity', sortOrder: 1, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'camping'] },
      { id: 'hot_water', label: '24/7 Hot Water', value: 'hot_water', icon: '🔥', description: 'Running hot water via geyser or solar boiler', sortOrder: 2, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'camping'] },
      { id: 'room_heater', label: 'Room Heating', value: 'room_heater', icon: '❄️', description: 'Electric heater, blower or fireplace', sortOrder: 3, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'camping'] },
      { id: 'mountain_balcony', label: 'Mountain View Balcony', value: 'mountain_balcony', icon: '🏔️', description: 'Private balcony facing valleys or snow peaks', sortOrder: 4, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'camping'] },
      { id: 'work_desk', label: 'Dedicated Work Desk', value: 'work_desk', icon: '💻', description: 'Ergonomic table and chair for remote work', sortOrder: 5, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort'] },
      { id: 'private_lawn', label: 'Private Lawn / Garden', value: 'private_lawn', icon: '🪴', description: 'Private outdoor green yard or courtyard', sortOrder: 6, isActive: true, assignedBusinessTypes: ['homestay', 'resort', 'camping'] },
      { id: 'electric_kettle', label: 'Electric Kettle & Tea Kit', value: 'electric_kettle', icon: '☕', description: 'In-room kettle with green tea & coffee sachets', sortOrder: 7, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort'] },
      { id: 'smart_tv', label: 'Smart TV with OTT', value: 'smart_tv', icon: '📺', description: 'Flat screen TV with streaming apps', sortOrder: 8, isActive: true, assignedBusinessTypes: ['hotel', 'resort', 'homestay'] },
      { id: 'air_conditioner', label: 'Air Conditioning', value: 'air_conditioner', icon: '🌀', description: 'Climate control cooling unit', sortOrder: 9, isActive: true, assignedBusinessTypes: ['hotel', 'resort'] },
      { id: 'electric_blanket', label: 'Electric Heating Blanket', value: 'electric_blanket', icon: '🛏️', description: 'Warm heated bed mattress topper', sortOrder: 10, isActive: true, assignedBusinessTypes: ['homestay', 'camping'] }
    ]
  },
  meal_options: {
    id: 'meal_options',
    title: 'Dining & Meal Plans',
    description: 'Food concepts, dietary choices and board plans',
    options: [
      { id: 'pure_veg', label: 'Pure Vegetarian Kitchen', value: 'pure_veg', icon: '🥬', description: '100% vegetarian kitchen with no meat', sortOrder: 1, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'restaurant'] },
      { id: 'non_veg', label: 'Non-Vegetarian Available', value: 'non_veg', icon: '🍗', description: 'Fresh local chicken, fish, or mutton dishes', sortOrder: 2, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'restaurant'] },
      { id: 'jain_food', label: 'Jain Food on Request', value: 'jain_food', icon: '🥗', description: 'No onion, no garlic meal preparations', sortOrder: 3, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'restaurant'] },
      { id: 'organic_homecooked', label: 'Organic Farm-to-Table', value: 'organic_homecooked', icon: '🌽', description: 'Homecooked meals with garden-grown vegetables', sortOrder: 4, isActive: true, assignedBusinessTypes: ['homestay', 'resort'] },
      { id: 'buffet_breakfast', label: 'Buffet Breakfast', value: 'buffet_breakfast', icon: '🥐', description: 'Complimentary morning breakfast spread', sortOrder: 5, isActive: true, assignedBusinessTypes: ['hotel', 'resort'] },
      { id: 'evening_bonfire_snacks', label: 'Bonfire Snacks & Tea', value: 'evening_bonfire_snacks', icon: '🍢', description: 'Hot pakoras & tea around evening campfire', sortOrder: 6, isActive: true, assignedBusinessTypes: ['homestay', 'camping', 'resort'] }
    ]
  },
  stay_rules: {
    id: 'stay_rules',
    title: 'Property Rules & Guest Eligibility',
    description: 'House rules regarding couples, families, bachelors and foreign nationals',
    options: [
      { id: 'family_friendly', label: 'Family Friendly', value: 'family_friendly', icon: '👨‍👩‍👧‍👦', description: 'Welcomes families with children and elders', sortOrder: 1, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'camping'] },
      { id: 'unmarried_couples', label: 'Unmarried Couples Allowed', value: 'unmarried_couples', icon: '💑', description: 'Valid government ID proof required upon check-in', sortOrder: 2, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort'] },
      { id: 'bachelor_allowed', label: 'Bachelor Groups Allowed', value: 'bachelor_allowed', icon: '🎒', description: 'Group stays permitted subject to noise curfew', sortOrder: 3, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'camping'] },
      { id: 'solo_female', label: 'Solo Female Recommended', value: 'solo_female', icon: '🙋‍♀️', description: 'Verified safe environment for women solo travelers', sortOrder: 4, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort'] },
      { id: 'foreign_nationals', label: 'Foreign Nationals Permitted', value: 'foreign_nationals', icon: '🌐', description: 'Form C registration supported with passport', sortOrder: 5, isActive: true, assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'camping'] }
    ]
  },
  cancellation_rules: {
    id: 'cancellation_rules',
    title: 'Cancellation Policies',
    description: 'Predefined refund tiers for booking cancellations',
    options: [
      { id: 'flexible', label: 'Flexible (100% refund up to 24h before)', value: 'flexible', icon: '🟢', description: 'Full refund if cancelled at least 24 hours prior to check-in', sortOrder: 1, isActive: true },
      { id: 'moderate', label: 'Moderate (100% refund up to 5 days before)', value: 'moderate', icon: '🟡', description: 'Full refund up to 5 days before check-in', sortOrder: 2, isActive: true },
      { id: 'strict', label: 'Strict (50% refund up to 7 days before)', value: 'strict', icon: '🟠', description: '50% refund up to 7 days prior to arrival date', sortOrder: 3, isActive: true },
      { id: 'super_strict', label: 'Super Strict (Non-Refundable)', value: 'super_strict', icon: '🔴', description: 'No refunds on cancellations', sortOrder: 4, isActive: true },
      { id: 'custom', label: 'Custom Tiered Refund Rules', value: 'custom', icon: '⚙️', description: 'Configurable refund percentages by lead time', sortOrder: 5, isActive: true }
    ]
  },
  parking_options: {
    id: 'parking_options',
    title: 'Parking Infrastructure',
    description: 'Vehicle parking facilities on or near premises',
    options: [
      { id: 'private', label: 'On-site Private Free Parking', value: 'private', icon: '🚗', description: 'Dedicated secure parking inside property gates', sortOrder: 1, isActive: true },
      { id: 'shared', label: 'Shared Compound Parking', value: 'shared', icon: '🅿️', description: 'Shared vehicle area with neighboring homes', sortOrder: 2, isActive: true },
      { id: 'roadside', label: 'Safe Roadside Parking', value: 'roadside', icon: '🛣️', description: 'Designated parking along quiet mountain road', sortOrder: 3, isActive: true },
      { id: 'valet', label: 'Valet Parking Offered', value: 'valet', icon: '🔑', description: 'Professional valet attendant available', sortOrder: 4, isActive: true },
      { id: 'not_available', label: 'No On-site Parking', value: 'not_available', icon: '🚫', description: 'Public parking ground located nearby', sortOrder: 5, isActive: true }
    ]
  },
  wifi_options: {
    id: 'wifi_options',
    title: 'Wi-Fi Speed & Connection',
    description: 'Internet technology and band width',
    options: [
      { id: 'fiber', label: 'High-Speed Fiber Wi-Fi (100+ Mbps)', value: 'fiber', icon: '⚡', description: 'Ultra fast fiber optic network suitable for Zoom & streaming', sortOrder: 1, isActive: true },
      { id: 'broadband', label: 'Broadband Wi-Fi (25-50 Mbps)', value: 'broadband', icon: '🌐', description: 'Reliable broadband for daily browsing', sortOrder: 2, isActive: true },
      { id: 'mobile_internet', label: 'Mobile Hotspot / Dongle', value: 'mobile_internet', icon: '📱', description: '4G mobile router internet', sortOrder: 3, isActive: true },
      { id: 'not_available', label: 'Digital Detox (No Wi-Fi)', value: 'not_available', icon: '🌿', description: 'Unplug and connect with nature', sortOrder: 4, isActive: true }
    ]
  },
  power_backup: {
    id: 'power_backup',
    title: 'Power Backup Infrastructure',
    description: 'Electricity reliability during mountain outages',
    options: [
      { id: 'generator', label: 'Full Generator Power Backup', value: 'generator', icon: '⚡', description: 'Automatic diesel generator running all lights, hot water & geysers', sortOrder: 1, isActive: true },
      { id: 'solar', label: 'Solar Power Inverter System', value: 'solar', icon: '☀️', description: 'Eco-friendly solar battery bank supporting lights & Wi-Fi', sortOrder: 2, isActive: true },
      { id: 'ups', label: 'UPS / Battery Inverter', value: 'ups', icon: '🔋', description: 'Inverter backup for lights, charging points & Wi-Fi', sortOrder: 3, isActive: true },
      { id: 'none', label: 'No Power Backup', value: 'none', icon: '🕯️', description: 'Candles and lanterns provided during power outages', sortOrder: 4, isActive: true }
    ]
  },
  photography_rules: {
    id: 'photography_rules',
    title: 'Photography & Media Rules',
    description: 'Permissions for drones, commercial shoots and pre-wedding photography',
    options: [
      { id: 'drone_allowed', label: 'Drone Flying Allowed', value: 'drone_allowed', icon: '🚁', description: 'Drones permitted subject to local forest & border guidelines', sortOrder: 1, isActive: true },
      { id: 'drone_restricted', label: 'Drone Flying Restricted', value: 'drone_restricted', icon: '⚠️', description: 'Prior permission from host required before launch', sortOrder: 2, isActive: true },
      { id: 'commercial_allowed', label: 'Commercial Shoot Allowed', value: 'commercial_allowed', icon: '🎥', description: 'Filming, YouTube vlogs & brand shoots welcomed', sortOrder: 3, isActive: true },
      { id: 'pre_wedding_allowed', label: 'Pre-Wedding Shoot Allowed', value: 'pre_wedding_allowed', icon: '📸', description: 'Picturesque backdrops for couple photoshoots', sortOrder: 4, isActive: true }
    ]
  },
  mobile_networks: {
    id: 'mobile_networks',
    title: 'Mobile Network Coverage',
    description: '4G / 5G cellular connectivity in the mountain area',
    options: [
      { id: 'airtel', label: 'Airtel 4G/5G Strong Signal', value: 'airtel', icon: '🔴', description: 'Excellent voice & data connectivity', sortOrder: 1, isActive: true },
      { id: 'jio', label: 'Jio 4G/5G Strong Signal', value: 'jio', icon: '🔵', description: 'Excellent high-speed coverage', sortOrder: 2, isActive: true },
      { id: 'bsnl', label: 'BSNL Coverage Active', value: 'bsnl', icon: '🟡', description: 'Reliable government network signal', sortOrder: 3, isActive: true },
      { id: 'vi', label: 'Vodafone Idea (VI) Available', value: 'vi', icon: '🟣', description: 'Standard voice network available', sortOrder: 4, isActive: true }
    ]
  },
  safety_measures: {
    id: 'safety_measures',
    title: 'Safety & Emergency Infrastructure',
    description: 'Safety hardware and round-the-clock staff support',
    options: [
      { id: 'fire_extinguisher', label: 'Fire Extinguishers Installed', value: 'fire_extinguisher', icon: '🧯', description: 'Certified fire safety cylinders on each floor', sortOrder: 1, isActive: true },
      { id: 'first_aid', label: 'First Aid Kit & Emergency Meds', value: 'first_aid', icon: '🩹', description: 'Fully stocked emergency medicine kit', sortOrder: 2, isActive: true },
      { id: 'cctv', label: 'CCTV Surveillance in Premises', value: 'cctv', icon: '📹', description: 'Cameras covering gate and main entrance corridors', sortOrder: 3, isActive: true },
      { id: 'staff_24x7', label: '24x7 Resident Caretaker / Staff', value: 'staff_24x7', icon: '👨‍💼', description: 'In-house staff available around the clock for assistance', sortOrder: 4, isActive: true }
    ]
  },
  room_types: {
    id: 'room_types',
    title: 'Room Category Categories',
    description: 'Structural categories for property accommodation',
    options: [
      { id: 'standard', label: 'Standard Room', value: 'standard', icon: '🛏️', description: 'Cozy room with essential amenities', sortOrder: 1, isActive: true },
      { id: 'deluxe', label: 'Deluxe Room', value: 'deluxe', icon: '🌅', description: 'Upgraded room with mountain view balcony', sortOrder: 2, isActive: true },
      { id: 'suite', label: 'Premium Suite', value: 'suite', icon: '👑', description: 'Luxury layout with attached lounge area', sortOrder: 3, isActive: true },
      { id: 'cottage', label: 'Wooden Cottage', value: 'cottage', icon: '🏡', description: 'Standalone pine wood cottage', sortOrder: 4, isActive: true },
      { id: 'villa', label: 'Private Villa', value: 'villa', icon: '🏰', description: 'Exclusive multi-bedroom villa', sortOrder: 5, isActive: true },
      { id: 'dorm', label: 'Backpacker Dormitory', value: 'dorm', icon: '🏕️', description: 'Shared bunk bed dorms with lockers', sortOrder: 6, isActive: true }
    ]
  },
  bed_types: {
    id: 'bed_types',
    title: 'Bed Layout Types',
    description: 'Mattress sizing and bed arrangements',
    options: [
      { id: 'king', label: 'King Size Bed (72x78 in)', value: 'king', icon: '🛏️', description: 'Spacious bed for couples or family with small child', sortOrder: 1, isActive: true },
      { id: 'queen', label: 'Queen Size Bed (60x78 in)', value: 'queen', icon: '🛏️', description: 'Comfortable double bed', sortOrder: 2, isActive: true },
      { id: 'twin', label: 'Twin Beds (2 Separate Singles)', value: 'twin', icon: '🛏️', description: 'Two individual single beds', sortOrder: 3, isActive: true },
      { id: 'single', label: 'Single Bed', value: 'single', icon: '🛏️', description: 'Compact single bed', sortOrder: 4, isActive: true },
      { id: 'bunk', label: 'Bunk Bed Stack', value: 'bunk', icon: '🪜', description: 'Double decker bunk beds', sortOrder: 5, isActive: true }
    ]
  }
};

// Helper to fetch live configuration library (with localStorage sync for Admin edits)
export const getMasterConfigLibrary = (): Record<string, ConfigCategory> => {
  const stored = localStorage.getItem('hillytrip_master_config_library');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse master config library from localStorage', e);
    }
  }
  return INITIAL_MASTER_CONFIG_LIBRARY;
};

// Helper to save master config library
export const saveMasterConfigLibrary = (lib: Record<string, ConfigCategory>) => {
  localStorage.setItem('hillytrip_master_config_library', JSON.stringify(lib));
};

// Helper to add option
export const addMasterOption = (categoryId: string, option: Omit<ConfigOption, 'id' | 'sortOrder'>) => {
  const lib = getMasterConfigLibrary();
  if (lib[categoryId]) {
    const newId = `${categoryId}_${Date.now()}`;
    const newOption: ConfigOption = {
      ...option,
      id: newId,
      sortOrder: lib[categoryId].options.length + 1
    };
    lib[categoryId].options.push(newOption);
    saveMasterConfigLibrary(lib);
  }
};

// Helper to update option
export const updateMasterOption = (categoryId: string, optionId: string, updates: Partial<ConfigOption>) => {
  const lib = getMasterConfigLibrary();
  if (lib[categoryId]) {
    lib[categoryId].options = lib[categoryId].options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, ...updates };
      }
      return opt;
    });
    saveMasterConfigLibrary(lib);
  }
};

// Helper to remove option
export const removeMasterOption = (categoryId: string, optionId: string) => {
  const lib = getMasterConfigLibrary();
  if (lib[categoryId]) {
    lib[categoryId].options = lib[categoryId].options.filter(opt => opt.id !== optionId);
    saveMasterConfigLibrary(lib);
  }
};
