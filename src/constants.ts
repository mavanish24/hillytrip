import { 
  HOMESTAY_STORAGE_ASSETS, 
  DESTINATION_STORAGE_ASSETS, 
  ATTRACTION_STORAGE_ASSETS, 
  COMMON_STORAGE_ASSETS 
} from './utils/imagePool';

export const DEFAULT_HOMESTAY_IMAGE = HOMESTAY_STORAGE_ASSETS.woodenExterior;

export interface RepresentativeGalleryImage {
  id: string;
  image_url: string;
  title: string;
  caption: string;
  category: 'Exterior' | 'Bedroom' | 'Balcony View' | 'Dining & Food' | 'Bonfire Garden' | 'Scenic View';
}

export const REPRESENTATIVE_HIMALAYAN_GALLERY: RepresentativeGalleryImage[] = [
  {
    id: 'rep-exterior-1',
    image_url: HOMESTAY_STORAGE_ASSETS.woodenExterior,
    title: 'Exterior of Wooden Mountain Homestay',
    caption: 'Authentic wooden Himalayan homestay architecture nestled in lush green mountain hills',
    category: 'Exterior'
  },
  {
    id: 'rep-bedroom-2',
    image_url: HOMESTAY_STORAGE_ASSETS.cozyBedroom,
    title: 'Cozy Bedroom',
    caption: 'Warm wooden interior with plush bedding and natural Himalayan morning sunlight',
    category: 'Bedroom'
  },
  {
    id: 'rep-balcony-3',
    image_url: HOMESTAY_STORAGE_ASSETS.balconyMountainView,
    title: 'Balcony with Mountain View',
    caption: 'Private wooden terrace overlooking misty pine valleys and high mountain ridges',
    category: 'Balcony View'
  },
  {
    id: 'rep-dining-4',
    image_url: HOMESTAY_STORAGE_ASSETS.localFoodDining,
    title: 'Dining Area with Local Food',
    caption: 'Rustic dining corner with fresh home-cooked local organic mountain delicacies',
    category: 'Dining & Food'
  },
  {
    id: 'rep-bonfire-5',
    image_url: HOMESTAY_STORAGE_ASSETS.livingCommon,
    title: 'Bonfire or Living Lounge Seating',
    caption: 'Warm mountain hearth and lounge for cozy evening conversations',
    category: 'Bonfire Garden'
  },
  {
    id: 'rep-view-6',
    image_url: DESTINATION_STORAGE_ASSETS.grandHimalayanLandscape,
    title: 'Scenic Valley or Sunrise View',
    caption: 'Golden morning sunrise casting warm light across the Himalayan valley slopes',
    category: 'Scenic View'
  }
];

export const DESTINATION_REPRESENTATIVE_GALLERIES: Record<string, RepresentativeGalleryImage[]> = {
  jibhi: [
    {
      id: 'jibhi-ext-1',
      image_url: HOMESTAY_STORAGE_ASSETS.woodenExterior1,
      title: 'Traditional Wooden Jibhi Cottage Exterior',
      caption: 'Authentic Kath-Kuni style wooden cottage nestled in lush pine valley forest',
      category: 'Exterior'
    },
    {
      id: 'jibhi-bed-2',
      image_url: HOMESTAY_STORAGE_ASSETS.cozyBedroom,
      title: 'Attic Bedroom with Cedar Scent',
      caption: 'Warm wooden interior attic with plush bedding and forest stream views',
      category: 'Bedroom'
    },
    {
      id: 'jibhi-balc-3',
      image_url: HOMESTAY_STORAGE_ASSETS.balconyMountainView2,
      title: 'Veranda overlooking Pine Valleys',
      caption: 'Sun-kissed private deck with panoramic views of green pine tree slopes',
      category: 'Balcony View'
    },
    {
      id: 'jibhi-din-4',
      image_url: HOMESTAY_STORAGE_ASSETS.localFoodDining,
      title: 'Himachali Kitchen & Siddu Meal',
      caption: 'Fresh homecooked Siddu, Ghee & authentic Himachali pahadi cuisine',
      category: 'Dining & Food'
    },
    {
      id: 'jibhi-bonf-5',
      image_url: HOMESTAY_STORAGE_ASSETS.livingCommon2,
      title: 'Pine Forest Evening Campfire',
      caption: 'Cozy garden campfire area under brilliant starry mountain skies',
      category: 'Bonfire Garden'
    }
  ],
  spiti: [
    {
      id: 'spiti-ext-1',
      image_url: DESTINATION_STORAGE_ASSETS.monasterySideVillage,
      title: 'Authentic Mud-Brick Spitian Homestay',
      caption: 'Traditional whitewashed Tibetan mud home framed by high mountain peaks',
      category: 'Exterior'
    },
    {
      id: 'spiti-bed-2',
      image_url: HOMESTAY_STORAGE_ASSETS.simpleBedroom,
      title: 'Insulated High-Altitude Suite',
      caption: 'Warmly carpeted Tibetan room with thick quilts for cold mountain nights',
      category: 'Bedroom'
    },
    {
      id: 'spiti-balc-3',
      image_url: DESTINATION_STORAGE_ASSETS.snowMountains,
      title: 'Rooftop Deck with Snow Range View',
      caption: 'Panoramic rooftop overlooking ancient monasteries and rugged Himalayan canyons',
      category: 'Balcony View'
    },
    {
      id: 'spiti-din-4',
      image_url: HOMESTAY_STORAGE_ASSETS.localFoodDining,
      title: 'Spitian Dining Corner & Gur Gur Chai',
      caption: 'Steaming Tibetan momos, Thukpa and traditional salty butter tea',
      category: 'Dining & Food'
    },
    {
      id: 'spiti-bonf-5',
      image_url: DESTINATION_STORAGE_ASSETS.snoweeLake,
      title: 'Starlit Courtyard Firepit',
      caption: 'Crisp cold desert evening gathered around a warm courtyard hearth',
      category: 'Bonfire Garden'
    }
  ],
  manali: [
    {
      id: 'manali-ext-1',
      image_url: HOMESTAY_STORAGE_ASSETS.mountainViewExterior,
      title: 'Alpine Cedar Villa in Old Manali',
      caption: 'Charming mountain lodge surrounded by apple orchards and pine ridges',
      category: 'Exterior'
    },
    {
      id: 'manali-bed-2',
      image_url: HOMESTAY_STORAGE_ASSETS.premiumBedroom,
      title: 'Modern Himalayan Deluxe Suite',
      caption: 'Sunlit wooden master room with mountain view glass windows',
      category: 'Bedroom'
    },
    {
      id: 'manali-balc-3',
      image_url: HOMESTAY_STORAGE_ASSETS.balconyMountainView,
      title: 'Balcony Facing Snow-Capped Peaks',
      caption: 'Direct unblocked vista of Rohtang and Solang glacier summits',
      category: 'Balcony View'
    },
    {
      id: 'manali-din-4',
      image_url: HOMESTAY_STORAGE_ASSETS.localFoodDining,
      title: 'Fresh River Trout & Mountain Breakfast',
      caption: 'Pan-fried local trout, farm fresh eggs and piping hot pahadi tea',
      category: 'Dining & Food'
    },
    {
      id: 'manali-bonf-5',
      image_url: HOMESTAY_STORAGE_ASSETS.livingCommon,
      title: 'Orchard Garden Night Bonfire',
      caption: 'Spacious green lawn with comfortable chairs and woodfire hearth',
      category: 'Bonfire Garden'
    }
  ],
  dharamshala: [
    {
      id: 'dharamshala-ext-1',
      image_url: DESTINATION_STORAGE_ASSETS.teaGardenVillage,
      title: 'Dhauladhar Slope Homestay Exterior',
      caption: 'Tranquil hillside residence nestled among tea bushes and oak trees',
      category: 'Exterior'
    },
    {
      id: 'dharamshala-bed-2',
      image_url: HOMESTAY_STORAGE_ASSETS.cozyBedroom,
      title: 'Zen Mountain Suite with Garden Access',
      caption: 'Minimalist wooden room filled with fresh mountain breeze',
      category: 'Bedroom'
    },
    {
      id: 'dharamshala-balc-3',
      image_url: DESTINATION_STORAGE_ASSETS.sunriseMountains,
      title: 'Sunset Terrace facing Kangra Valley',
      caption: 'Elevated porch showcasing golden sunset clouds over green hills',
      category: 'Balcony View'
    },
    {
      id: 'dharamshala-din-4',
      image_url: HOMESTAY_STORAGE_ASSETS.localFoodDining,
      title: 'Kangri Dham Homecooked Spread',
      caption: 'Authentic Kangri Dham dishes cooked slowly over wood fires',
      category: 'Dining & Food'
    },
    {
      id: 'dharamshala-bonf-5',
      image_url: HOMESTAY_STORAGE_ASSETS.livingCommon2,
      title: 'Garden Lawn & Acoustic Fireside',
      caption: 'Peaceful garden seating area ideal for evening tea and bonfire chats',
      category: 'Bonfire Garden'
    }
  ]
};

export function getRepresentativeGalleryForDestination(destinationName?: string): RepresentativeGalleryImage[] {
  if (!destinationName) return REPRESENTATIVE_HIMALAYAN_GALLERY;
  const key = destinationName.toLowerCase();
  
  if (key.includes('spiti') || key.includes('leh') || key.includes('ladakh') || key.includes('kaza')) {
    return DESTINATION_REPRESENTATIVE_GALLERIES.spiti;
  }
  if (key.includes('manali') || key.includes('solang') || key.includes('sethan') || key.includes('kullu')) {
    return DESTINATION_REPRESENTATIVE_GALLERIES.manali;
  }
  if (key.includes('jibhi') || key.includes('tirthan') || key.includes('shoji') || key.includes('banjar')) {
    return DESTINATION_REPRESENTATIVE_GALLERIES.jibhi;
  }
  if (key.includes('dharamshala') || key.includes('mcleod') || key.includes('bir') || key.includes('palampur')) {
    return DESTINATION_REPRESENTATIVE_GALLERIES.dharamshala;
  }

  return REPRESENTATIVE_HIMALAYAN_GALLERY;
}
