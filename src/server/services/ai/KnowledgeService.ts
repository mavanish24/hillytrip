import { KnowledgeItem } from '../../../types/aiPlatform';

export class KnowledgeService {
  private static knowledgeBase: KnowledgeItem[] = [
    // Destinations & Villages
    {
      id: 'dest-darjeeling',
      title: 'Darjeeling',
      category: 'destination',
      location: 'West Bengal, North Bengal Hills',
      summary: 'The Queen of Hills known for Tiger Hill sunrise, Kanchenjunga views, heritage Toy Train, and world-famous Darjeeling tea estates.',
      fullContent: `Darjeeling is located at an altitude of 2,045m (6,709 ft) in the Eastern Himalayas. Key attractions include Tiger Hill (sunrise view of Mount Everest & Mount Kanchenjunga), Batasia Loop, Happy Valley Tea Estate, Himalayan Mountaineering Institute (HMI), and Mall Road. Best time to visit: March to May (spring) and October to December (clear winter skies). Average homestay budget: ₹1,500 - ₹4,500 per night.`,
      tags: ['heritage', 'tea-gardens', 'mountain-view', 'toy-train', 'family'],
      rating: 4.8,
      priceRange: '₹1,500 - ₹5,000/night'
    },
    {
      id: 'dest-sitong',
      title: 'Sitong (Orange Village)',
      category: 'destination',
      location: 'Kurseong Division, Darjeeling District',
      summary: 'Tranquil offbeat village famous for lush orange orchards, views of Kanchenjunga, and eco-homestays.',
      fullContent: `Sitong is a cluster of villages (Sitong 1, 2, 3) located 33km from Siliguri / NGP. Known as the Orange Village, Sitong blossoms with bright orange orchards from November to January. Attractions include Ahaldara Viewpoint, Namthing Pokhari (habitat of Himalayan Salamander), Sitong Church, and Jogighat bridge over the Riyang river.`,
      tags: ['offbeat', 'oranges', 'nature', 'quiet', 'eco-homestay'],
      rating: 4.9,
      priceRange: '₹1,200 - ₹2,500/night (with meals)'
    },
    {
      id: 'dest-gangtok',
      title: 'Gangtok',
      category: 'destination',
      location: 'East Sikkim',
      summary: 'Capital city of Sikkim offering MG Marg, Rumtek Monastery, cable car rides, and gateway to Tsomgo Lake and Nathula Pass.',
      fullContent: `Gangtok stands at 1,650m (5,410 ft). Highlights: MG Marg (pedestrian eco-friendly mall street), Tashi Viewpoint, Ganesh Tok, Ban Jhakri Falls, Enchey Monastery, and ropeway. Requires Inner Line Permit (ILP) for foreign tourists and PAP for Nathula Pass / Baba Mandir.`,
      tags: ['sikkim', 'capital', 'monasteries', 'shopping', 'lake-gateway'],
      rating: 4.7,
      priceRange: '₹1,800 - ₹6,000/night'
    },
    {
      id: 'dest-zuluk',
      title: 'Zuluk (Silk Route)',
      category: 'destination',
      location: 'East Sikkim, Ancient Silk Route',
      summary: 'Historical hamlet on the Silk Route famous for the 32-turn zig-zag road, Thambi View Point, and high-altitude alpine landscape.',
      fullContent: `Zuluk is situated at 2,865m (9,400 ft) on the historic Silk Route. Features dramatic zig-zag hairpin bends at Thambi Viewpoint, Lungthung, Gnathang Valley, Kupup Lake (Elephant Lake), and Baba Mandir. Permits are mandatory at Rangpo/Rongli. Homestays provide traditional Sikkimese hospitality and warm wooden rooms.`,
      tags: ['silk-route', 'adventure', 'offbeat', 'zig-zag-road', 'snow'],
      rating: 4.9,
      priceRange: '₹1,400 - ₹2,200/night (per head with meals)'
    },
    {
      id: 'dest-kalimpong',
      title: 'Kalimpong',
      category: 'destination',
      location: 'West Bengal',
      summary: 'Quiet hill station famed for flower nurseries, Deolo Hill panoramic views, Cactus Nursery, and colonial architecture.',
      fullContent: `Kalimpong overlooks the Teesta River at 1,250m altitude. Famous for Deolo Park, Morgan House, Pine View Cactus Nursery, Durpin Monastery, and traditional handmade paper factories. Great for families and couples seeking peace.`,
      tags: ['peaceful', 'flowers', 'nurseries', 'colonial', 'family'],
      rating: 4.6,
      priceRange: '₹1,500 - ₹4,000/night'
    },
    {
      id: 'dest-pelling',
      title: 'Pelling',
      category: 'destination',
      location: 'West Sikkim',
      summary: 'Picturesque destination offering the closest views of Mount Kanchenjunga, Skywalk, Pemayangtse Monastery, and Rabdentse Ruins.',
      fullContent: `Pelling sits at 2,150m in West Sikkim. Key spots: Sikkim Skywalk (first glass skywalk in India at Chenrezig statue), Pemayangtse Monastery, Rabdentse Ruins, Khecheopalri Wish-Fulfilling Lake, and Rimbi Waterfall.`,
      tags: ['skywalk', 'kanchenjunga', 'monastery', 'heritage', 'west-sikkim'],
      rating: 4.8,
      priceRange: '₹1,600 - ₹4,500/night'
    },

    // Homestays
    {
      id: 'home-mountain-view-sitong',
      title: 'Kanchenjunga Bliss Eco Homestay',
      category: 'homestay',
      location: 'Sitong Village, Kurseong',
      summary: 'Family-run organic farm homestay with unobstructed 180-degree mountain views and organic Nepali/Lepcha meals included.',
      fullContent: `Located in Sitong-1, surrounded by private orange orchards. Facilities: Hot water, mountain-view balcony, bonfire setup, traditional homecooked meals (Rai/Nepali cuisine), organic tea tasting. Price: ₹1,500 per person/day (includes breakfast, lunch, tea, dinner).`,
      tags: ['sitong', 'eco', 'organic-food', 'bonfire', 'kanchenjunga-view'],
      rating: 4.9,
      priceRange: '₹1,500/head with all meals'
    },
    {
      id: 'home-hermitage-darjeeling',
      title: 'Cedar Cottage Heritage Homestay',
      category: 'homestay',
      location: 'Near Chowrasta Mall, Darjeeling',
      summary: 'Cozy colonial British-era wooden cottage 5 minutes walk from Mall Road with fireplace and tea garden valley views.',
      fullContent: `Located near Step Aside (C.R. Das Memorial). Cozy double bedrooms with pine wood paneling, heritage fireplace lounge, complimentary morning Darjeeling First Flush tea, fast Wi-Fi, and localized tour planning.`,
      tags: ['darjeeling', 'heritage', 'mall-road', 'fireplace', 'family'],
      rating: 4.8,
      priceRange: '₹2,800/night'
    },

    // Taxi & Transportation
    {
      id: 'taxi-bagdogra-darjeeling',
      title: 'Bagdogra Airport (IXB) / NGP to Darjeeling Taxi',
      category: 'taxi_route',
      location: 'Siliguri to Darjeeling (70 km)',
      summary: 'Direct reserved or shared taxi service from Bagdogra Airport or NJP Railway Station to Darjeeling.',
      fullContent: `Distance: 70 km via Rohini Road or Pankhabari Road. Travel Time: 2.5 to 3 hours. Standard Vehicle Fares: Small Taxi (Alto/WagonR): ₹2,500 - ₹2,800; SUV (Innova/Xylo/Bolero): ₹3,500 - ₹4,200; Shared Taxi from Siliguri Junction: ₹300 - ₹400 per seat.`,
      tags: ['taxi', 'bagdogra', 'njp', 'darjeeling', 'airport-transfer'],
      priceRange: '₹2,500 - ₹4,200 (Reserved)'
    },
    {
      id: 'taxi-darjeeling-gangtok',
      title: 'Darjeeling to Gangtok Inter-State Taxi Route',
      category: 'taxi_route',
      location: 'Darjeeling to Gangtok (100 km)',
      summary: 'Cross-border scenic hill route running along the Teesta river through Melli checkpoint.',
      fullContent: `Distance: 100 km. Travel Time: 3.5 to 4 hours. Passes through Teesta Bazaar and Rangpo border. Fares: Small reserved taxi ₹3,200 - ₹3,600; SUV ₹4,500 - ₹5,200.`,
      tags: ['interstate', 'gangtok', 'darjeeling', 'teesta-river'],
      priceRange: '₹3,200 - ₹5,200'
    },

    // FAQs & HillyTrip Policies
    {
      id: 'faq-permit-sikkim',
      title: 'Sikkim Travel Permits (ILP / PAP) Guide',
      category: 'policy',
      location: 'Sikkim State Boundary',
      summary: 'Official rules for Inner Line Permit (ILP) and Restricted Area Permit (RAP) for Nathula, Zuluk, and North Sikkim.',
      fullContent: `Indian national tourists need PAP (Protected Area Permit) for Nathula Pass, Tsomgo Lake, Zuluk Silk Route, Gurudongmar Lake, and Yumthang Valley. Permits require 2 passport photos and photo ID proof (Voter ID/Passport/Aadhaar for adults, Birth Cert for kids). HillyTrip certified taxi drivers assist in arranging permits smoothly at Gangtok / Rongli. Foreign nationals need Inner Line Permit (ILP) obtainable free at Melli / Rangpo checkposts.`,
      tags: ['permits', 'sikkim', 'nathula', 'zuluk', 'ilp', 'pap'],
      rating: 5.0
    }
  ];

  public static searchKnowledge(query: string, limit: number = 4): KnowledgeItem[] {
    const q = query.toLowerCase();
    const scored = this.knowledgeBase.map(item => {
      let score = 0;
      if (item.title.toLowerCase().includes(q)) score += 10;
      if (item.summary.toLowerCase().includes(q)) score += 5;
      if (item.fullContent.toLowerCase().includes(q)) score += 3;
      if (item.tags.some(t => q.includes(t) || t.includes(q))) score += 4;
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.filter(s => s.score > 0).slice(0, limit).map(s => s.item);
  }

  public static getKnowledgeContext(query: string): { contextText: string; citations: string[] } {
    const items = this.searchKnowledge(query, 5);
    if (items.length === 0) {
      // Return default top destinations & homestays context
      const defaultItems = this.knowledgeBase.slice(0, 4);
      return {
        contextText: defaultItems.map(i => `[Source: ${i.title} (${i.category})]\n${i.fullContent}`).join('\n\n'),
        citations: defaultItems.map(i => `${i.title} (${i.category})`)
      };
    }

    return {
      contextText: items.map(i => `[Source: ${i.title} (${i.category})]\n${i.fullContent}`).join('\n\n'),
      citations: items.map(i => `${i.title} (${i.category})`)
    };
  }

  public static getAllItems(): KnowledgeItem[] {
    return this.knowledgeBase;
  }
}
