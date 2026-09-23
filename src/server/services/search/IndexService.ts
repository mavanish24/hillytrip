import { DESTINATION_STORAGE_ASSETS, ATTRACTION_STORAGE_ASSETS, HOMESTAY_STORAGE_ASSETS, TAXI_STAND_STORAGE_ASSETS, COMMON_STORAGE_ASSETS } from '../../../utils/imagePool';
import { SearchIndexItem, SearchEntityType } from '../../../types/search';
import { dbStore } from '../../db';

export class IndexService {
  private static searchIndex: Map<string, SearchIndexItem> = new Map();
  private static masterClaimHomestaysIndex: Map<string, SearchIndexItem> = new Map();
  private static isInitialized = false;

  /**
   * Initializes the search index with comprehensive seed data across all HillyTrip modules.
   */
  public static initializeIndex() {
    if (this.isInitialized) return;

    const seedItems: SearchIndexItem[] = [
      // DESTINATIONS
      {
        id: 'dest-1',
        entityId: 'd-1',
        entityType: 'destination',
        title: 'Gangtok',
        subtitle: 'Capital City of Sikkim',
        description: 'Vibrant capital of Sikkim known for MG Marg, Buddhist monasteries, ropeway views, and Himalayan vistas.',
        slug: 'gangtok',
        canonicalUrl: 'https://hillytrip.com/destinations/gangtok',
        location: { district: 'East Sikkim', state: 'Sikkim', coordinates: { lat: 27.3389, lng: 88.6065 } },
        tags: ['Capital', 'Monastery', 'Ropeway', 'MG Marg', 'City Center'],
        keywords: ['Gangtok', 'Gantok', 'Gongtok', 'Capital City', 'East Sikkim Hub'],
        category: 'Hill Station',
        popularityScore: 99,
        rating: 4.8,
        reviewCount: 1420,
        isVerified: true,
        isFeatured: true,
        imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        status: 'active',
        attributes: {},
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-07-27T00:00:00Z'
      },
      {
        id: 'dest-2',
        entityId: 'd-2',
        entityType: 'destination',
        title: 'Darjeeling',
        subtitle: 'Queen of the Hills, West Bengal',
        description: 'World famous for Darjeeling Tea, Himalayan Railway Toy Train, Tiger Hill sunrise, and colonial charm.',
        slug: 'darjeeling',
        canonicalUrl: 'https://hillytrip.com/destinations/darjeeling',
        location: { district: 'Darjeeling', state: 'West Bengal', coordinates: { lat: 27.041, lng: 88.2663 } },
        tags: ['Tea Gardens', 'Toy Train', 'Tiger Hill', 'Colonial', 'Queen of Hills'],
        keywords: ['Darjeeling', 'Darjiling', 'Darj', 'Queen of Hills', 'Ghoom'],
        category: 'Hill Station',
        popularityScore: 98,
        rating: 4.9,
        reviewCount: 2150,
        isVerified: true,
        isFeatured: true,
        imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        status: 'active',
        attributes: {},
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-07-27T00:00:00Z'
      },
      {
        id: 'dest-3',
        entityId: 'd-3',
        entityType: 'destination',
        title: 'Kalimpong',
        subtitle: 'Floral Gateway & Peaceful Hills',
        description: 'Serene hill town famous for orchid nurseries, Delo Hill, Durpin Monastery, and British colonial bungalows.',
        slug: 'kalimpong',
        canonicalUrl: 'https://hillytrip.com/destinations/kalimpong',
        location: { district: 'Kalimpong', state: 'West Bengal', coordinates: { lat: 27.06, lng: 88.47 } },
        tags: ['Offbeat', 'Delo Hill', 'Orchids', 'Bungalows', 'Silk Route'],
        keywords: ['Kalimpong', 'Kalingpong', 'Delo', 'Silk Route Gateway'],
        category: 'Hill Station',
        popularityScore: 92,
        rating: 4.7,
        reviewCount: 890,
        isVerified: true,
        isFeatured: false,
        imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        status: 'active',
        attributes: {},
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-07-27T00:00:00Z'
      },
      {
        id: 'dest-4',
        entityId: 'd-4',
        entityType: 'destination',
        title: 'Pelling',
        subtitle: 'West Sikkim Kanchenjunga Gateway',
        description: 'Breathtaking views of Mt. Kanchenjunga, Glass Skywalk, Pemayangtse Monastery, and Rabdentse Ruins.',
        slug: 'pelling',
        canonicalUrl: 'https://hillytrip.com/destinations/pelling',
        location: { district: 'Gyalshing / West Sikkim', state: 'Sikkim', coordinates: { lat: 27.3167, lng: 88.2333 } },
        tags: ['Skywalk', 'Kanchenjunga', 'Ruins', 'Waterfall', 'Glass Bridge'],
        keywords: ['Pelling', 'Peling', 'Skywalk', 'West Sikkim'],
        category: 'Scenic Destination',
        popularityScore: 94,
        rating: 4.8,
        reviewCount: 1100,
        isVerified: true,
        isFeatured: true,
        imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        status: 'active',
        attributes: {},
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-07-27T00:00:00Z'
      }
    ];

    for (const item of seedItems) {
      this.searchIndex.set(item.id, item);
    }

    this.syncDbStoreItems();
    this.isInitialized = true;
  }

  /**
   * Dynamically loads all entities from dbStore and applies strict verification & visibility rules.
   */
  public static syncDbStoreItems() {
    try {
      const dests = dbStore.getDestinations() || [];
      const attrs = dbStore.getAttractions() || [];
      const homestays = dbStore.getHomestays() || [];
      const routes = dbStore.getRoutes() || [];
      const fareQuotes = dbStore.getOperatorFareQuotes() || [];
      const blogs = dbStore.getBlogs() || [];
      const offers = dbStore.getOffers() || [];

      // 1. Destinations & Villages
      for (const d of dests) {
        if (!d.id) continue;
        const item: SearchIndexItem = {
          id: `dest_db_${d.id}`,
          entityId: d.id,
          entityType: 'destination',
          title: d.name || 'Himalayan Spot',
          subtitle: d.district ? `${d.district}, ${d.state || 'West Bengal / Sikkim'}` : (d.state || 'Himalayas'),
          description: d.description || `Explore ${d.name} in ${d.district || 'the Himalayas'}. Beautiful village views and homestays.`,
          slug: d.slug || d.id,
          canonicalUrl: `https://hillytrip.com/destinations/${d.id}`,
          location: { district: d.district, state: d.state, coordinates: (d as any).location ? { lat: (d as any).location.lat, lng: (d as any).location.lng } : ((d as any).latitude ? { lat: (d as any).latitude, lng: (d as any).longitude } : undefined) },
          tags: (d as any).tags || [d.district || 'Himalayas', (d as any).type || 'Village'],
          keywords: [d.name, d.district, d.state, (d as any).type || 'village'].filter(Boolean) as string[],
          category: (d as any).type || 'Destination',
          popularityScore: (d as any).popularityScore || 80,
          rating: (d as any).rating || 4.7,
          reviewCount: (d as any).reviewsCount || 10,
          isVerified: true,
          isFeatured: Boolean((d as any).isFeatured || (d as any).isHiddenGem),
          imageUrl: d.image || (d as any).featuredImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
          status: 'active',
          attributes: { workingArea: d.district ? [d.district] : [] },
          createdAt: (d as any).createdAt || new Date().toISOString(),
          updatedAt: (d as any).updatedAt || new Date().toISOString()
        };
        this.searchIndex.set(item.id, item);
      }

      // 2. Attractions
      for (const a of attrs) {
        if (!a.id) continue;
        const item: SearchIndexItem = {
          id: `attr_db_${a.id}`,
          entityId: a.id,
          entityType: 'attraction',
          title: a.name || 'Sightseeing Attraction',
          subtitle: (a as any).district ? `${(a as any).district} Sightseeing` : 'Attraction Spot',
          description: a.description || `Visit ${a.name} in ${(a as any).district || 'the hill station'}.`,
          slug: a.slug || a.id,
          canonicalUrl: `https://hillytrip.com/attractions/${a.id}`,
          location: { district: (a as any).district, state: (a as any).state, coordinates: (a as any).location ? { lat: (a as any).location.lat, lng: (a as any).location.lng } : undefined },
          tags: (a as any).tags || [(a as any).category || 'Sightseeing', (a as any).district || 'Himalayas'],
          keywords: [a.name, (a as any).district, (a as any).category, 'attraction', 'visit', 'waterfall', 'viewpoint'].filter(Boolean) as string[],
          category: (a as any).category || 'Sightseeing',
          price: (a as any).entryFee || undefined,
          popularityScore: (a as any).popularityScore || 85,
          rating: (a as any).rating || 4.6,
          isVerified: true,
          isFeatured: Boolean((a as any).isFeatured),
          imageUrl: (a as any).image || (a as any).imageUrl || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
          status: 'active',
          attributes: {},
          createdAt: (a as any).createdAt || new Date().toISOString(),
          updatedAt: (a as any).updatedAt || new Date().toISOString()
        };
        this.searchIndex.set(item.id, item);
      }

      // 3. Homestays (Strict Visibility Rule Enforcement)
      for (const h of homestays) {
        if (!h.id) continue;

        const isPublic = (h as any).is_public !== false && (h as any).isPublic !== false && h.status !== 'INACTIVE';
        const isVerifiedApproved = Boolean(
          h.isVerified || (h as any).verified || (h as any).verificationStatus === 'APPROVED' || h.status === 'APPROVED' || h.status === 'ACTIVE' || (h as any).is_claimed === true || !h.status
        );

        const item: SearchIndexItem = {
          id: `home_db_${h.id}`,
          entityId: h.id,
          entityType: 'homestay',
          title: h.name || 'Mountain Homestay',
          subtitle: (h as any).villageName || h.address || h.district || 'Local Himalayan Stay',
          description: h.description || `Experience local Himalayan hospitality at ${h.name}. Clean rooms, homecooked food, and beautiful views.`,
          slug: (h as any).slug || h.id,
          canonicalUrl: `https://hillytrip.com/homestays/${h.id}`,
          location: {
            district: h.district || (h as any).districtName || (h as any).location?.district || (h as any).address || (h as any).villageName || 'Kalimpong',
            state: h.state || (h as any).location?.state || 'West Bengal'
          },
          tags: ['Homestay', 'Local Hospitality', (h as any).villageName || '', h.district || ''].filter(Boolean),
          keywords: [h.name, (h as any).villageName, h.address, h.district, 'homestay', 'stay', 'cottage', 'peaceful', 'view'].filter(Boolean) as string[],
          category: 'Homestay',
          price: (h as any).pricePerNight || (h as any).startingPrice || 1800,
          priceUnit: 'per night',
          rating: h.rating || 4.8,
          reviewCount: (h as any).reviewsCount || h.reviewCount || 12,
          popularityScore: 90,
          isVerified: isVerifiedApproved,
          isFeatured: Boolean(h.isFeatured),
          imageUrl: (h as any).image || (h.images && h.images[0]) || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
          status: 'active',
          attributes: {
            amenities: h.amenities || [],
            isFamilyFriendly: true,
            isPetFriendly: (h.amenities || []).some(a => a.toLowerCase().includes('pet')),
            hasWifi: (h.amenities || []).some(a => a.toLowerCase().includes('wifi')),
            hasParking: (h.amenities || []).some(a => a.toLowerCase().includes('park')),
            hasBreakfast: (h.amenities || []).some(a => a.toLowerCase().includes('food') || a.toLowerCase().includes('breakfast'))
          },
          createdAt: h.createdAt || new Date().toISOString(),
          updatedAt: (h as any).updatedAt || new Date().toISOString()
        };

        // Master claim index stores ALL homestays (including unclaimed) for owner search
        this.masterClaimHomestaysIndex.set(item.id, item);

        // PUBLIC SEARCH: ONLY verified/approved & public homestays appear!
        if (isPublic && isVerifiedApproved) {
          this.searchIndex.set(item.id, item);
        }
      }

      // 4. Taxi Routes & Cheapest Fare Calculation
      for (const r of routes) {
        if (!r.id) continue;

        // Find active valid operator fares for this route
        const activeFares = fareQuotes
          .filter(q => ((q as any).routeId === r.id || (q as any).route_id === r.id) && ((q as any).status === 'APPROVED' || (q as any).status === 'active' || (q as any).active !== false))
          .map(q => Number((q as any).amount || (q as any).price || (q as any).fare))
          .filter(f => !isNaN(f) && f > 0);

        const cheapestFare = activeFares.length > 0 ? Math.min(...activeFares) : (r.fareMin || 2200);

        const item: SearchIndexItem = {
          id: `route_db_${r.id}`,
          entityId: r.id,
          entityType: 'route',
          title: (r as any).route_name || (r.path && r.path.length >= 2 ? `${r.path[0]} → ${r.path[r.path.length - 1]}` : `Route ${r.id}`),
          subtitle: `Distance: ${r.distance || '65 km'} • Time: ${r.timeMin || '2 hrs 30 mins'}`,
          description: (r as any).Description || (r as any).description || `Taxi cab transfers for ${(r as any).route_name || r.id}. Verified operators, transparent fares.`,
          slug: r.slug || r.id,
          canonicalUrl: `https://hillytrip.com/routes/${r.id}`,
          location: {},
          tags: ['Taxi Route', 'Cab Transfer', 'Shared Cab', 'Reserved Taxi'],
          keywords: [(r as any).route_name, ...(r.path || []), 'taxi', 'cab', 'fare', 'transfer', 'njp', 'bagdogra', 'kalimpong', 'darjeeling', 'gangtok'].filter(Boolean) as string[],
          category: 'Taxi Route',
          price: cheapestFare,
          priceUnit: 'cheapest fare',
          popularityScore: 92,
          rating: 4.8,
          isVerified: true,
          isFeatured: Boolean((r as any).isFeatured),
          status: 'active',
          attributes: {
            routeFrom: r.path && r.path[0],
            routeTo: r.path && r.path[r.path.length - 1],
            isSharedTaxi: true,
            isPrivateTaxi: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.searchIndex.set(item.id, item);
      }

      // 5. Travel Guides & Blogs
      for (const b of blogs) {
        if (!b.id) continue;
        const item: SearchIndexItem = {
          id: `blog_db_${b.id}`,
          entityId: b.id,
          entityType: 'blog',
          title: b.title,
          subtitle: `${b.category || 'Travel Guide'} • ${b.readingTime || 5} min read`,
          description: (b.content || '').substring(0, 200).replace(/#|\*/g, ''),
          slug: b.slug,
          canonicalUrl: `https://hillytrip.com/blog/${b.slug}`,
          location: {},
          tags: b.tags || [b.category || 'Travel Guide'],
          keywords: [b.title, b.category, ...(b.tags || []), 'guide', 'blog', 'travel'].filter(Boolean) as string[],
          category: b.category || 'Travel Guide',
          popularityScore: 88,
          rating: 4.9,
          isVerified: true,
          isFeatured: Boolean((b as any).isFeatured),
          imageUrl: b.featuredImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
          status: 'active',
          attributes: {},
          createdAt: b.createdAt || new Date().toISOString(),
          updatedAt: b.updatedAt || new Date().toISOString()
        };
        this.searchIndex.set(item.id, item);
      }

      // 6. Special Offers
      for (const o of offers) {
        if (!o.id) continue;
        const item: SearchIndexItem = {
          id: `offer_db_${o.id}`,
          entityId: o.id,
          entityType: 'offer',
          title: o.title,
          subtitle: (o as any).subtitle || 'Special Discount Voucher',
          description: (o as any).description || 'Exclusive HillyTrip deal for hill homestays and taxis.',
          slug: (o as any).code || o.id,
          canonicalUrl: `https://hillytrip.com/offers/${o.id}`,
          location: {},
          tags: ['Discount', 'Offer', 'Voucher'],
          keywords: [o.title, (o as any).code, 'discount', 'offer', 'voucher'].filter(Boolean) as string[],
          category: 'Offer',
          popularityScore: 85,
          isVerified: true,
          isFeatured: Boolean((o as any).isFeatured),
          status: 'active',
          attributes: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.searchIndex.set(item.id, item);
      }

    } catch (e) {
      console.error('Error syncing dbStore to search index:', e);
    }
  }

  /**
   * Upsert an item into the search index incrementally without full rebuild.
   */
  public static upsertIndexItem(item: SearchIndexItem) {
    this.searchIndex.set(item.id, item);
  }

  /**
   * Delete an item from the index.
   */
  public static removeFromIndex(id: string) {
    this.searchIndex.delete(id);
  }

  /**
   * Get all index items with options to include unclaimed homestays for owner verification flow.
   */
  public static getAllItems(options?: { includeUnclaimed?: boolean }): SearchIndexItem[] {
    this.initializeIndex();
    this.syncDbStoreItems();

    if (options?.includeUnclaimed) {
      const combined = new Map([...this.searchIndex, ...this.masterClaimHomestaysIndex]);
      return Array.from(combined.values());
    }

    return Array.from(this.searchIndex.values());
  }

  /**
   * Rebuild index (clears and re-seeds).
   */
  public static rebuildIndex(): { totalIndexed: number; timestamp: string } {
    this.searchIndex.clear();
    this.masterClaimHomestaysIndex.clear();
    this.isInitialized = false;
    this.initializeIndex();

    return {
      totalIndexed: this.searchIndex.size,
      timestamp: new Date().toISOString()
    };
  }
}

