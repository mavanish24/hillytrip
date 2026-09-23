import { DESTINATION_STORAGE_ASSETS, ATTRACTION_STORAGE_ASSETS, HOMESTAY_STORAGE_ASSETS, TAXI_STAND_STORAGE_ASSETS, COMMON_STORAGE_ASSETS } from '../../../utils/imagePool';
import {
  ContentItem,
  ContentType,
  ContentStatus,
  AssembledSmartPage,
  SEOMetadata,
  MediaItem,
  RedirectRule,
  ContentAnalytics
} from '../../../types/content';
import { calculateHaversineDistance } from '../location/LocationService';

class ContentService {
  private items: Map<string, ContentItem> = new Map();
  private versions: Map<string, ContentItem[]> = new Map();
  private mediaItems: Map<string, MediaItem> = new Map();
  private redirects: Map<string, RedirectRule> = new Map();

  constructor() {
    this.seedInitialContent();
  }

  private seedInitialContent() {
    // Media Library Seed
    const mediaSeed: MediaItem[] = [
      {
        id: 'med_darjeeling_banner',
        title: 'Darjeeling Tea Garden Vista',
        url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
        fileType: 'image',
        folder: 'destinations',
        altText: 'Scenic green tea plantation view in Darjeeling, West Bengal',
        caption: 'Panoramic slope of Happy Valley Tea Estate with Kanchenjunga backdrop',
        copyright: 'HillyTrip Media',
        sizeBytes: 1240000,
        width: 1920,
        height: 1080,
        tags: ['darjeeling', 'tea', 'landscape'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'med_gangtok_mg_marg',
        title: 'Gangtok MG Marg Promenade',
        url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
        fileType: 'image',
        folder: 'destinations',
        altText: 'Clean pedestrian square of MG Marg in Gangtok, Sikkim',
        caption: 'The vibrant heart of Sikkim capital with flower beds and pristine lanes',
        copyright: 'HillyTrip Media',
        sizeBytes: 1100000,
        width: 1920,
        height: 1080,
        tags: ['gangtok', 'sikkim', 'city'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'med_rumtek_monastery',
        title: 'Rumtek Monastery Courtyard',
        url: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
        fileType: 'image',
        folder: 'attractions',
        altText: 'Rumtek Monastery ornate facade in Gangtok',
        caption: 'Dharma Chakra Centre with golden stupas and Tibetan art',
        copyright: 'HillyTrip Media',
        sizeBytes: 1350000,
        width: 1920,
        height: 1080,
        tags: ['monastery', 'gangtok', 'culture'],
        createdAt: new Date().toISOString()
      }
    ];

    mediaSeed.forEach(m => this.mediaItems.set(m.id, m));

    // Content Items Seed
    const initialItems: ContentItem[] = [
      {
        id: 'cnt_dst_darjeeling',
        entityId: 'dst_darjeeling',
        contentType: 'destination',
        title: 'Darjeeling - The Queen of the Hills',
        slug: 'darjeeling',
        shortDescription: 'World-famous hill station nestled in West Bengal known for UNESCO Himalayan Railway, lush tea estates, and views of Mount Kanchenjunga.',
        longDescription: 'Darjeeling stands at an elevation of 2,045 meters in the Lesser Himalayas. Famous worldwide for its aromatic Darjeeling tea and breathtaking vistas of the Eastern Himalayas, it offers heritage colonial architecture, Buddhist monasteries, and vibrant cultural markets.',
        richContent: '<h2>Why Visit Darjeeling?</h2><p>Experience early morning sunrise over Mt. Kanchenjunga at Tiger Hill, taste single-origin flush teas at Happy Valley Estate, and ride the historic steam toy train.</p>',
        featuredImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
        gallery: [
          'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
          'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png'
        ],
        tags: ['darjeeling', 'hill-station', 'tea-gardens', 'unesco-heritage'],
        categories: ['Hill Station', 'UNESCO World Heritage', 'Tea Tourism'],
        status: 'published',
        visibility: 'public',
        priority: 10,
        isFeatured: true,
        lat: 27.0410,
        lng: 88.2663,
        district: 'Darjeeling',
        state: 'West Bengal',
        country: 'India',
        seo: {
          title: 'Darjeeling Travel Guide & Top Attractions | HillyTrip',
          metaDescription: 'Explore Darjeeling hill station. Book local taxis, homestays, tea garden tours, and view live travel insights for Darjeeling, West Bengal.',
          canonicalUrl: 'https://hillytrip.com/destinations/darjeeling',
          ogTitle: 'Discover Darjeeling - Queen of the Hills',
          ogDescription: 'Your ultimate travel companion for Darjeeling tea gardens, Toy Train rides, and Tiger Hill sunrise views.',
          ogImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
          twitterCard: 'summary_large_image',
          keywords: ['Darjeeling tourism', 'Tiger hill sunrise', 'Darjeeling tea estate', 'Himalayan railway'],
          schemaType: 'TouristAttraction',
          score: 95
        },
        author: { id: 'usr_editor_01', name: 'HillyTrip Editorial Team', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HillyTripEditor' },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      },
      {
        id: 'cnt_dst_gangtok',
        entityId: 'dst_gangtok',
        contentType: 'destination',
        title: 'Gangtok - Capital Jewel of Sikkim',
        slug: 'gangtok',
        shortDescription: 'Modern hill capital blending Tibetan Buddhist culture, alpine ropeways, organic food culture, and gateways to high-altitude lakes.',
        longDescription: 'Perched at 1,650 meters, Gangtok offers pristine, litter-free urban promenades like MG Marg alongside ancient monasteries like Rumtek and Enchey. It serves as the primary base for trips to Tsomgo Lake, Nathula Pass, and Lachung.',
        richContent: '<h2>Exploring Gangtok</h2><p>Stroll along MG Marg, ride the Gangtok Ropeway for panoramic valley views, and savor authentic momos and thukpa.</p>',
        featuredImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
        tags: ['gangtok', 'sikkim', 'monasteries', 'capital'],
        categories: ['State Capital', 'Buddhist Pilgrimage', 'Adventure Base'],
        status: 'published',
        visibility: 'public',
        priority: 9,
        isFeatured: true,
        lat: 27.3389,
        lng: 88.6065,
        district: 'East Sikkim',
        state: 'Sikkim',
        country: 'India',
        seo: {
          title: 'Gangtok Travel Portal - Homestays, Taxis & Permits | HillyTrip',
          metaDescription: 'Complete guide to Gangtok, Sikkim. Plan Nathula Pass permits, book local shared cabs, stay at luxury organic homestays.',
          canonicalUrl: 'https://hillytrip.com/destinations/gangtok',
          ogTitle: 'Gangtok Sikkim Travel Guide',
          ogDescription: 'Experience Gangtok culture, local markets, and mountain vistas with HillyTrip platform.',
          ogImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
          twitterCard: 'summary_large_image',
          keywords: ['Gangtok tourism', 'Nathula pass cab', 'MG Marg Gangtok', 'Rumtek monastery'],
          schemaType: 'TouristAttraction',
          score: 92
        },
        author: { id: 'usr_editor_01', name: 'HillyTrip Editorial Team' },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      },
      {
        id: 'cnt_attr_tiger_hill',
        entityId: 'attr_tiger_hill',
        contentType: 'attraction',
        title: 'Tiger Hill Sunrise Viewpoint',
        slug: 'tiger-hill-darjeeling',
        shortDescription: 'Famous peak near Darjeeling offering panoramic views of Mount Everest and Mt. Kanchenjunga illuminated by early sunrise rays.',
        longDescription: 'Located 11 km from Darjeeling town at an altitude of 2,590 m, Tiger Hill is renowned for its breathtaking sunrise view of Mount Kanchenjunga as its snow peaks turn from gold to pale pink.',
        featuredImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
        tags: ['darjeeling', 'sunrise', 'viewpoint', 'kanchenjunga'],
        categories: ['Viewpoint', 'Nature', 'Must-Visit'],
        status: 'published',
        visibility: 'public',
        priority: 8,
        isFeatured: true,
        lat: 26.9967,
        lng: 88.2868,
        district: 'Darjeeling',
        state: 'West Bengal',
        seo: {
          title: 'Tiger Hill Sunrise Timings & Taxi Booking | HillyTrip',
          metaDescription: 'Book early morning Tiger Hill cabs in Darjeeling. Learn optimal sunrise timings and view weather forecasts.',
          canonicalUrl: 'https://hillytrip.com/attractions/tiger-hill-darjeeling',
          schemaType: 'TouristAttraction',
          score: 88
        },
        author: { id: 'usr_editor_02', name: 'Pema Bhutia' },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      },
      {
        id: 'cnt_hmst_pine_grove',
        entityId: 'hmst_pine_grove',
        contentType: 'homestay',
        title: 'Pine Grove Eco Heritage Homestay',
        slug: 'pine-grove-homestay-darjeeling',
        shortDescription: 'Cozy colonial heritage homestay surrounded by pine forests offering traditional Gorkhalee hospitality and homemade meals.',
        longDescription: 'Located 1.5 km from Darjeeling Mall Road, Pine Grove Eco Heritage Homestay offers mountain-view wooden balcony suites, organic local dining, and dedicated driver assistance.',
        featuredImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
        tags: ['darjeeling', 'homestay', 'eco-stay', 'heritage'],
        categories: ['Heritage Homestay', 'Eco Lodge'],
        status: 'published',
        visibility: 'public',
        priority: 7,
        isFeatured: true,
        lat: 27.0450,
        lng: 88.2600,
        district: 'Darjeeling',
        state: 'West Bengal',
        seo: {
          title: 'Pine Grove Homestay Darjeeling - Book Direct | HillyTrip',
          metaDescription: 'Stay at Pine Grove Eco Heritage Homestay in Darjeeling. Wooden suites, organic food, and Kanchenjunga balcony views.',
          canonicalUrl: 'https://hillytrip.com/homestays/pine-grove-homestay-darjeeling',
          schemaType: 'Hotel',
          score: 90
        },
        author: { id: 'usr_editor_02', name: 'Pema Bhutia' },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      },
      {
        id: 'cnt_blog_best_time_darjeeling',
        contentType: 'blog',
        title: 'Best Time to Visit Darjeeling & Sikkim in 2026',
        slug: 'best-time-to-visit-darjeeling-sikkim',
        shortDescription: 'Complete seasonal breakdown covering spring rhododendron blooms, clear autumn skies, and winter snowfalls.',
        longDescription: 'Planning a trip to the Eastern Himalayas? Our comprehensive month-by-month guide breaks down temperatures, road conditions, rainfall patterns, and festive seasons across Darjeeling and Sikkim.',
        featuredImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png',
        tags: ['darjeeling', 'sikkim', 'travel-guide', 'weather', 'itinerary'],
        categories: ['Travel Advice', 'Seasonal Guide'],
        status: 'published',
        visibility: 'public',
        priority: 9,
        isFeatured: true,
        district: 'Darjeeling',
        state: 'West Bengal',
        seo: {
          title: 'When to Visit Darjeeling & Sikkim (Month-By-Month Guide)',
          metaDescription: 'Detailed month-by-month weather, road status, and festival calendar for Darjeeling, Gangtok, and Pelling.',
          canonicalUrl: 'https://hillytrip.com/blogs/best-time-to-visit-darjeeling-sikkim',
          schemaType: 'Article',
          score: 94
        },
        author: { id: 'usr_editor_01', name: 'HillyTrip Editorial Team' },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      },
      {
        id: 'cnt_faq_darjeeling_permits',
        contentType: 'faq',
        title: 'Darjeeling & Sikkim Travel FAQ & Permits',
        slug: 'darjeeling-sikkim-faq-permits',
        shortDescription: 'Frequently asked questions regarding Inner Line Permits (ILP), Nathula Pass passes, and child entry requirements.',
        longDescription: 'Answers to essential tourist questions when traveling between West Bengal and Sikkim borders.',
        tags: ['permits', 'sikkim', 'darjeeling', 'faq'],
        categories: ['Travel Requirements'],
        status: 'published',
        visibility: 'public',
        priority: 5,
        isFeatured: false,
        district: 'East Sikkim',
        state: 'Sikkim',
        seo: {
          title: 'Sikkim ILP & Nathula Permit FAQ Guide | HillyTrip',
          metaDescription: 'Everything you need to know about Sikkim Inner Line Permits, documents required, and online cab pass applications.',
          schemaType: 'FAQPage',
          score: 87
        },
        author: { id: 'usr_editor_01', name: 'HillyTrip Editorial Team' },
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      }
    ];

    initialItems.forEach(item => {
      this.items.set(item.id, item);
      this.versions.set(item.id, [item]);
    });

    // Seed Redirects
    this.redirects.set('red_01', {
      id: 'red_01',
      sourceSlug: 'darjeeling-guide-2025',
      targetSlug: 'darjeeling',
      redirectType: 301,
      isActive: true,
      hitsCount: 142,
      createdAt: new Date().toISOString()
    });
  }

  // CRUD & Listing
  public getAllItems(filter?: {
    contentType?: ContentType;
    district?: string;
    status?: ContentStatus;
    search?: string;
  }): ContentItem[] {
    let list = Array.from(this.items.values());

    if (filter?.contentType) {
      list = list.filter(i => i.contentType === filter.contentType);
    }
    if (filter?.status) {
      list = list.filter(i => i.status === filter.status);
    }
    if (filter?.district) {
      list = list.filter(i => i.district?.toLowerCase() === filter.district?.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.shortDescription.toLowerCase().includes(q) ||
          i.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => b.priority - a.priority || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getItemByIdOrSlug(identifier: string): ContentItem | undefined {
    return (
      this.items.get(identifier) ||
      Array.from(this.items.values()).find(i => i.slug === identifier || i.entityId === identifier)
    );
  }

  public createOrUpdateItem(itemData: Partial<ContentItem>): ContentItem {
    const existing = itemData.id ? this.items.get(itemData.id) : undefined;
    const now = new Date().toISOString();

    const id = existing ? existing.id : `cnt_${Date.now()}`;
    const version = existing ? existing.version + 1 : 1;

    // Calculate SEO Health Score
    const score = this.calculateSeoScore({
      title: itemData.seo?.title || itemData.title || '',
      metaDescription: itemData.seo?.metaDescription || itemData.shortDescription || '',
      canonicalUrl: itemData.seo?.canonicalUrl,
      keywords: itemData.seo?.keywords || itemData.tags,
      featuredImage: itemData.featuredImage
    });

    const newItem: ContentItem = {
      id,
      entityId: itemData.entityId || existing?.entityId,
      contentType: itemData.contentType || existing?.contentType || 'destination',
      title: itemData.title || existing?.title || 'Untitled Content',
      slug: itemData.slug || existing?.slug || `content-${id}`,
      shortDescription: itemData.shortDescription || existing?.shortDescription || '',
      longDescription: itemData.longDescription || existing?.longDescription,
      richContent: itemData.richContent || existing?.richContent,
      featuredImage: itemData.featuredImage || existing?.featuredImage,
      gallery: itemData.gallery || existing?.gallery || [],
      videos: itemData.videos || existing?.videos || [],
      tags: itemData.tags || existing?.tags || [],
      categories: itemData.categories || existing?.categories || [],
      status: itemData.status || existing?.status || 'draft',
      visibility: itemData.visibility || existing?.visibility || 'public',
      priority: itemData.priority ?? existing?.priority ?? 5,
      isFeatured: itemData.isFeatured ?? existing?.isFeatured ?? false,
      lat: itemData.lat ?? existing?.lat,
      lng: itemData.lng ?? existing?.lng,
      district: itemData.district || existing?.district,
      state: itemData.state || existing?.state,
      country: itemData.country || existing?.country || 'India',
      seo: {
        ...(existing?.seo || {}),
        ...(itemData.seo || {}),
        score
      },
      author: itemData.author || existing?.author || { id: 'usr_admin', name: 'System Admin' },
      version,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      publishedAt: itemData.status === 'published' ? (existing?.publishedAt || now) : existing?.publishedAt
    };

    this.items.set(id, newItem);

    // Save version history
    const history = this.versions.get(id) || [];
    this.versions.set(id, [newItem, ...history]);

    return newItem;
  }

  // SEO Score Analyzer & Generator
  private calculateSeoScore(data: {
    title: string;
    metaDescription: string;
    canonicalUrl?: string;
    keywords?: string[];
    featuredImage?: string;
  }): number {
    let score = 0;
    if (data.title && data.title.length >= 20 && data.title.length <= 70) score += 30;
    else if (data.title) score += 15;

    if (data.metaDescription && data.metaDescription.length >= 50 && data.metaDescription.length <= 160) score += 30;
    else if (data.metaDescription) score += 15;

    if (data.canonicalUrl) score += 15;
    if (data.keywords && data.keywords.length > 0) score += 15;
    if (data.featuredImage) score += 10;

    return Math.min(100, score);
  }

  // CONTENT RELATIONSHIP ENGINE & AUTOMATIC PAGE ASSEMBLER
  public assembleSmartPage(identifier: string): AssembledSmartPage | null {
    const mainContent = this.getItemByIdOrSlug(identifier);
    if (!mainContent) return null;

    const allContent = Array.from(this.items.values());

    // 1. Compute Geographic & Categorical Derived Relationships
    let nearbyAttractions: ContentItem[] = [];
    let nearbyHomestays: ContentItem[] = [];
    let nearbyTaxiStands: ContentItem[] = [];
    let nearbyBusinesses: ContentItem[] = [];
    let nearbyOffers: ContentItem[] = [];
    let relatedBlogs: ContentItem[] = [];

    allContent.forEach(item => {
      if (item.id === mainContent.id) return;

      // Distance calculation if lat/lng are present
      let distanceKm = 999;
      if (mainContent.lat && mainContent.lng && item.lat && item.lng) {
        distanceKm = calculateHaversineDistance(
          mainContent.lat,
          mainContent.lng,
          item.lat,
          item.lng
        );
      }

      // Check district match or tag overlap
      const sameDistrict =
        mainContent.district &&
        item.district &&
        mainContent.district.toLowerCase() === item.district.toLowerCase();

      const tagMatch = item.tags.some(t => mainContent.tags.includes(t));

      const isNearby = distanceKm <= 35 || sameDistrict || tagMatch;

      if (isNearby) {
        switch (item.contentType) {
          case 'attraction':
            nearbyAttractions.push(item);
            break;
          case 'homestay':
            nearbyHomestays.push(item);
            break;
          case 'taxi_stand':
            nearbyTaxiStands.push(item);
            break;
          case 'business':
            nearbyBusinesses.push(item);
            break;
          case 'offer':
            nearbyOffers.push(item);
            break;
          case 'blog':
          case 'travel_guide':
            relatedBlogs.push(item);
            break;
        }
      }
    });

    // Generate FAQ list
    const faqs = [
      {
        question: `How do I reach ${mainContent.title}?`,
        answer: `${mainContent.title} is easily accessible via reserved or shared taxis from Siliguri / NJP Railway Station and Bagdogra Airport. HillyTrip offers pre-booked taxis and driver connections.`
      },
      {
        question: `What is the best time to visit ${mainContent.title}?`,
        answer: `The ideal months to visit are October through May, offering clear blue Himalayan skies and pleasant daytime mountain weather.`
      },
      {
        question: `Are there homestays and hotels near ${mainContent.title}?`,
        answer: `Yes, HillyTrip features verified homestays and eco-lodges near ${mainContent.title} with local food and mountain balconies.`
      }
    ];

    // Build Schema.org JSON-LD
    const seoSchemaJsonLd = {
      '@context': 'https://schema.org',
      '@type': mainContent.seo.schemaType || 'TouristAttraction',
      'name': mainContent.title,
      'description': mainContent.shortDescription,
      'url': mainContent.seo.canonicalUrl || `https://hillytrip.com/destinations/${mainContent.slug}`,
      'image': mainContent.featuredImage,
      'geo': mainContent.lat && mainContent.lng ? {
        '@type': 'GeoCoordinates',
        'latitude': mainContent.lat,
        'longitude': mainContent.lng
      } : undefined,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': mainContent.district || 'Eastern Himalayas',
        'addressRegion': mainContent.state || 'West Bengal',
        'addressCountry': mainContent.country || 'IN'
      }
    };

    return {
      mainContent,
      derivedLocation: mainContent.lat && mainContent.lng ? {
        lat: mainContent.lat,
        lng: mainContent.lng,
        district: mainContent.district || 'Himalayan District',
        state: mainContent.state || 'India'
      } : undefined,
      relationships: {
        nearbyAttractions: nearbyAttractions.slice(0, 6),
        nearbyHomestays: nearbyHomestays.slice(0, 6),
        nearbyTaxiStands: nearbyTaxiStands.slice(0, 4),
        nearbyBusinesses: nearbyBusinesses.slice(0, 4),
        nearbyOffers: nearbyOffers.slice(0, 4),
        relatedBlogs: relatedBlogs.slice(0, 4),
        faqs
      },
      seoSchemaJsonLd,
      assembledAt: new Date().toISOString()
    };
  }

  // Media Operations
  public getAllMedia(): MediaItem[] {
    return Array.from(this.mediaItems.values());
  }

  public addMedia(media: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem {
    const id = `med_${Date.now()}`;
    const newMedia: MediaItem = {
      ...media,
      id,
      createdAt: new Date().toISOString()
    };
    this.mediaItems.set(id, newMedia);
    return newMedia;
  }

  // Redirects Manager
  public getRedirects(): RedirectRule[] {
    return Array.from(this.redirects.values());
  }

  public addRedirect(rule: Omit<RedirectRule, 'id' | 'hitsCount' | 'createdAt'>): RedirectRule {
    const id = `red_${Date.now()}`;
    const newRule: RedirectRule = {
      ...rule,
      id,
      hitsCount: 0,
      createdAt: new Date().toISOString()
    };
    this.redirects.set(id, newRule);
    return newRule;
  }

  // Analytics
  public getAnalytics(): ContentAnalytics {
    const items = Array.from(this.items.values());
    const byContentType: Record<ContentType, number> = {
      destination: 0,
      village: 0,
      attraction: 0,
      homestay: 0,
      taxi_stand: 0,
      taxi_route: 0,
      business: 0,
      offer: 0,
      travel_guide: 0,
      blog: 0,
      faq: 0,
      policy: 0,
      landing_page: 0,
      event: 0
    };

    let totalSeoScore = 0;
    let publishedCount = 0;
    let draftCount = 0;

    items.forEach(i => {
      byContentType[i.contentType] = (byContentType[i.contentType] || 0) + 1;
      if (i.status === 'published') publishedCount++;
      if (i.status === 'draft') draftCount++;
      totalSeoScore += i.seo.score || 70;
    });

    const mediaList = Array.from(this.mediaItems.values());
    const mediaTotalSizeBytes = mediaList.reduce((acc, m) => acc + (m.sizeBytes || 0), 0);

    return {
      totalItems: items.length,
      publishedCount,
      draftCount,
      byContentType,
      averageSeoScore: items.length ? Math.round(totalSeoScore / items.length) : 0,
      mediaTotalSizeBytes,
      activeRedirectsCount: Array.from(this.redirects.values()).filter(r => r.isActive).length
    };
  }
}

export const contentService = new ContentService();
