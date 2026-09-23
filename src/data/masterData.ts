export interface MasterDataOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export const masterData: Record<string, MasterDataOption[]> = {
  amenities: [
    { id: 'wifi', label: 'Wi-Fi Access', value: 'wifi', icon: '📶', description: 'High speed wireless internet', sortOrder: 1, isActive: true },
    { id: 'hot_water', label: 'Hot Water', value: 'hot_water', icon: '🔥', description: '24/7 running hot water', sortOrder: 2, isActive: true },
    { id: 'parking', label: 'Free Parking', value: 'parking', icon: '🅿️', description: 'Secure on-site parking space', sortOrder: 3, isActive: true },
    { id: 'meals', label: 'Meals Included', value: 'meals', icon: '🍲', description: 'Homecooked meals served daily', sortOrder: 4, isActive: true },
    { id: 'heating', label: 'Room Heating', value: 'heating', icon: '❄️', description: 'Heater or electric blankets provided', sortOrder: 5, isActive: true },
    { id: 'power_backup', label: 'Power Backup', value: 'power_backup', icon: '⚡', description: 'Inverter/generator support', sortOrder: 6, isActive: true }
  ],
  vehicle_types: [
    { id: 'hatchback', label: 'Hatchback (Alto/WagonR)', value: 'hatchback', icon: '🚗', description: 'Perfect for solo travelers & budget trips', sortOrder: 1, isActive: true },
    { id: 'sedan', label: 'Sedan (Dzire/Etios)', value: 'sedan', icon: '🚙', description: 'Comfortable family highway ride', sortOrder: 2, isActive: true },
    { id: 'suv', label: 'SUV (Innova/Bolero)', value: 'suv', icon: '🚙', description: 'Rugged terrain specialist for high altitudes', sortOrder: 3, isActive: true },
    { id: 'tempo', label: 'Tempo Traveller', value: 'tempo', icon: '🚌', description: 'Spacious passenger van for large groups', sortOrder: 4, isActive: true }
  ],
  room_types: [
    { id: 'standard', label: 'Standard Room', value: 'standard', icon: '🛏️', description: 'Cozy and budget-friendly basic amenities', sortOrder: 1, isActive: true },
    { id: 'deluxe', label: 'Deluxe Room', value: 'deluxe', icon: '🌅', description: 'Scenic mountain view balcony included', sortOrder: 2, isActive: true },
    { id: 'suite', label: 'Premium Suite', value: 'suite', icon: '👑', description: 'Luxury spacious layout with a separate lounge', sortOrder: 3, isActive: true },
    { id: 'cottage', label: 'Wooden Cottage', value: 'cottage', icon: '🏡', description: 'Immersive private forest cottage experience', sortOrder: 4, isActive: true }
  ],
  languages: [
    { id: 'english', label: 'English', value: 'english', icon: '🇬🇧', sortOrder: 1, isActive: true },
    { id: 'hindi', label: 'Hindi', value: 'hindi', icon: '🇮🇳', sortOrder: 2, isActive: true },
    { id: 'nepali', label: 'Nepali', value: 'nepali', icon: '🇳🇵', sortOrder: 3, isActive: true },
    { id: 'bengali', label: 'Bengali', value: 'bengali', icon: '🇮🇳', sortOrder: 4, isActive: true },
    { id: 'tibetan', label: 'Tibetan', value: 'tibetan', icon: '🏔️', sortOrder: 5, isActive: true }
  ],
  payment_methods: [
    { id: 'upi', label: 'UPI / GooglePay / PhonePe', value: 'upi', icon: '📱', description: 'Instant QR code scan & transfer', sortOrder: 1, isActive: true },
    { id: 'cash', label: 'Cash on Arrival', value: 'cash', icon: '💵', description: 'Direct physical cash payment', sortOrder: 2, isActive: true },
    { id: 'card', label: 'Credit / Debit Cards', value: 'card', icon: '💳', description: 'Swipe terminal accepted at main desk', sortOrder: 3, isActive: true },
    { id: 'bank_transfer', label: 'Direct Bank Transfer', value: 'bank_transfer', icon: '🏦', description: 'NEFT / IMPS corporate bank details', sortOrder: 4, isActive: true }
  ],
  fuel_types: [
    { id: 'petrol', label: 'Petrol', value: 'petrol', icon: '⛽', sortOrder: 1, isActive: true },
    { id: 'diesel', label: 'Diesel', value: 'diesel', icon: '⛽', sortOrder: 2, isActive: true },
    { id: 'ev', label: 'Electric (EV)', value: 'ev', icon: '⚡', sortOrder: 3, isActive: true },
    { id: 'cng', label: 'CNG', value: 'cng', icon: '💨', sortOrder: 4, isActive: true }
  ],
  meal_plans: [
    { id: 'ep', label: 'European Plan (Room Only)', value: 'ep', sortOrder: 1, isActive: true },
    { id: 'cp', label: 'Continental Plan (Bed & Breakfast)', value: 'cp', sortOrder: 2, isActive: true },
    { id: 'map', label: 'Modified American Plan (Half Board)', value: 'map', sortOrder: 3, isActive: true },
    { id: 'ap', label: 'American Plan (Full Board)', value: 'ap', sortOrder: 4, isActive: true }
  ],
  property_types: [
    { id: 'homestay', label: 'Homestay', value: 'homestay', icon: '🏡', sortOrder: 1, isActive: true },
    { id: 'hotel', label: 'Hotel', value: 'hotel', icon: '🏢', sortOrder: 2, isActive: true },
    { id: 'resort', label: 'Resort', value: 'resort', icon: '🏰', sortOrder: 3, isActive: true },
    { id: 'camping', label: 'Camping', value: 'camping', icon: '⛺', sortOrder: 4, isActive: true }
  ],
  cuisine_types: [
    { id: 'indian', label: 'North & South Indian', value: 'indian', sortOrder: 1, isActive: true },
    { id: 'local_himalayan', label: 'Local Himalayan (Tibetan/Nepalese)', value: 'local_himalayan', sortOrder: 2, isActive: true },
    { id: 'chinese', label: 'Chinese / Indo-Chinese', value: 'chinese', sortOrder: 3, isActive: true },
    { id: 'continental', label: 'Continental / Italian', value: 'continental', sortOrder: 4, isActive: true }
  ],
  adventure_activities: [
    { id: 'paragliding', label: 'Paragliding', value: 'paragliding', icon: '🪂', sortOrder: 1, isActive: true },
    { id: 'rafting', label: 'River Rafting', value: 'rafting', icon: '🚣', sortOrder: 2, isActive: true },
    { id: 'bungee', label: 'Bungee Jumping', value: 'bungee', icon: '🧗', sortOrder: 3, isActive: true },
    { id: 'trekking', label: 'High Altitude Trekking', value: 'trekking', icon: '🥾', sortOrder: 4, isActive: true }
  ],
  facilities: [
    { id: 'gym', label: 'Fitness Center / Gym', value: 'gym', icon: '🏋️', sortOrder: 1, isActive: true },
    { id: 'spa', label: 'Spa & Sauna', value: 'spa', icon: '💆', sortOrder: 2, isActive: true },
    { id: 'pool', label: 'Swimming Pool', value: 'pool', icon: '🏊', sortOrder: 3, isActive: true },
    { id: 'restaurant', label: 'In-house Dining Restaurant', value: 'restaurant', icon: '🍽️', sortOrder: 4, isActive: true }
  ],
  parking_types: [
    { id: 'onsite_free', label: 'On-site Private Free Parking', value: 'onsite_free', sortOrder: 1, isActive: true },
    { id: 'valet', label: 'Valet Parking Offered', value: 'valet', sortOrder: 2, isActive: true },
    { id: 'public_nearby', label: 'Nearby Public Paid Parking', value: 'public_nearby', sortOrder: 3, isActive: true }
  ],
  bed_types: [
    { id: 'single', label: 'Single Bed', value: 'single', sortOrder: 1, isActive: true },
    { id: 'double', label: 'Double Bed', value: 'double', sortOrder: 2, isActive: true },
    { id: 'queen', label: 'Queen Size Bed', value: 'queen', sortOrder: 3, isActive: true },
    { id: 'king', label: 'King Size Bed', value: 'king', sortOrder: 4, isActive: true }
  ],
  cancellation_policies: [
    { id: 'flexible', label: 'Flexible: Free cancellation up to 24h before check-in', value: 'flexible', sortOrder: 1, isActive: true },
    { id: 'moderate', label: 'Moderate: Free cancellation up to 5 days before check-in', value: 'moderate', sortOrder: 2, isActive: true },
    { id: 'strict', label: 'Strict: Non-refundable or cancellations lose entire deposit', value: 'strict', sortOrder: 3, isActive: true }
  ],
  check_in_slots: [
    { id: 'slot_12pm', label: '12:00 PM (Standard)', value: '12:00 PM', sortOrder: 1, isActive: true },
    { id: 'slot_2pm', label: '02:00 PM', value: '02:00 PM', sortOrder: 2, isActive: true },
    { id: 'slot_flexible', label: 'Flexible / Any time', value: 'Flexible', sortOrder: 3, isActive: true }
  ],
  check_out_slots: [
    { id: 'slot_10am', label: '10:00 AM (Standard)', value: '10:00 AM', sortOrder: 1, isActive: true },
    { id: 'slot_11am', label: '11:00 AM', value: '11:00 AM', sortOrder: 2, isActive: true },
    { id: 'slot_flexible', label: 'Flexible / Late checkout option', value: 'Flexible', sortOrder: 3, isActive: true }
  ],
  business_days: [
    { id: 'all_week', label: 'All Week (Mon - Sun)', value: 'all_week', sortOrder: 1, isActive: true },
    { id: 'weekdays', label: 'Weekdays Only (Mon - Fri)', value: 'weekdays', sortOrder: 2, isActive: true },
    { id: 'weekends', label: 'Weekends Only (Sat - Sun)', value: 'weekends', sortOrder: 3, isActive: true }
  ],
  states: [
    { id: 'wb', label: 'West Bengal', value: 'West Bengal', sortOrder: 1, isActive: true },
    { id: 'hp', label: 'Himachal Pradesh', value: 'Himachal Pradesh', sortOrder: 2, isActive: true },
    { id: 'uk', label: 'Uttarakhand', value: 'Uttarakhand', sortOrder: 3, isActive: true },
    { id: 'jk', label: 'Jammu & Kashmir', value: 'Jammu & Kashmir', sortOrder: 4, isActive: true },
    { id: 'sk', label: 'Sikkim', value: 'Sikkim', sortOrder: 5, isActive: true }
  ],
  districts: [
    { id: 'darjeeling', label: 'Darjeeling (West Bengal)', value: 'Darjeeling', sortOrder: 1, isActive: true },
    { id: 'shimla', label: 'Shimla (Himachal Pradesh)', value: 'Shimla', sortOrder: 2, isActive: true },
    { id: 'dehradun', label: 'Dehradun (Uttarakhand)', value: 'Dehradun', sortOrder: 3, isActive: true },
    { id: 'srinagar', label: 'Srinagar (Jammu & Kashmir)', value: 'Srinagar', sortOrder: 4, isActive: true },
    { id: 'gangtok', label: 'Gangtok (Sikkim)', value: 'Gangtok', sortOrder: 5, isActive: true }
  ]
};

export const getMasterOptions = (sourceKey?: string): { label: string; value: string }[] => {
  if (!sourceKey || !masterData[sourceKey]) {
    return [];
  }
  return masterData[sourceKey]
    .filter(opt => opt.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(opt => ({
      label: opt.label,
      value: opt.value
    }));
};
