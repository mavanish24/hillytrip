import fs from 'fs';
import path from 'path';
import { firestoreDb, isFirestoreOnline, supabase, isSupabaseOnline, googleFirestoreDb } from './db';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

const ANALYTICS_FILE = path.join(process.cwd(), 'hillytrip_analytics_store.json');

export interface SearchEvent {
  searchId: string;
  searchQuery: string; // Search_Term / Search_Query
  routeId: string | null;
  destinationId: string | null;
  timestamp: string;
  userId: string | null;
  sessionId: string;
  sourceDestination: string;
  destination: string;
  searchDate: string;
  searchTime: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  country: string;
  state: string;
  city: string;
  hasResults: boolean;
}

export interface InteractionEvent {
  id: string;
  type: 'destination_view' | 'image_view' | 'route_click';
  entityId: string; // Destination ID, Route ID or Attraction ID
  timestamp: string;
  userId: string | null;
  sessionId: string;
}

interface AnalyticsSchema {
  searches: SearchEvent[];
  interactions: InteractionEvent[];
  userAnalytics?: any[];
}

class AnalyticsDatabase {
  private data: AnalyticsSchema = {
    searches: [],
    interactions: [],
    userAnalytics: []
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(ANALYTICS_FILE)) {
        const fileContent = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        this.data.searches = this.data.searches || [];
        this.data.interactions = this.data.interactions || [];
        this.data.userAnalytics = this.data.userAnalytics || [];
      } else {
        this.data = { searches: [], interactions: [], userAnalytics: [] };
        this.save();
      }
    } catch (e) {
      console.error('Error loading analytics database, resetting:', e);
      this.data = { searches: [], interactions: [], userAnalytics: [] };
      this.save();
    }
  }

  public save() {
    // Local file writes disabled to make the app fully stateless
    console.log('[Analytics Database] save() called (local file writes disabled to maintain statelessness in Cloud Run)');
  }

  public async logSearchAsync(event: SearchEvent): Promise<void> {
    // 7. Performance: Asynchronous logging to prevent slowing down requests
    setImmediate(async () => {
      try {
        this.data.searches.push(event);
        this.save();
        if (supabase && isSupabaseOnline) {
          try {
            const { error } = await supabase.from('searches').upsert(event);
            if (error) throw error;
          } catch (e: any) {
            console.error('[Supabase Analytics Search Warning]', e.message || e);
          }
        } else if (googleFirestoreDb) {
          try {
            await googleFirestoreDb.collection('searches').doc(event.searchId).set(event);
          } catch (err: any) {
            console.error('[Admin SDK Analytics Search Error]', err);
          }
        } else if (firestoreDb) {
          await setDoc(doc(firestoreDb, 'searches', event.searchId), event);
        }
      } catch (err) {
        console.error('Failed to log search event asynchronously to cloud or file:', err);
      }
    });
  }

  public async logInteractionAsync(event: InteractionEvent): Promise<void> {
    // 7. Performance: Asynchronous logging
    setImmediate(async () => {
      try {
        this.data.interactions.push(event);
        this.save();
        if (supabase && isSupabaseOnline) {
          try {
            const { error } = await supabase.from('interactions').upsert(event);
            if (error) throw error;
          } catch (e: any) {
            console.error('[Supabase Analytics Interaction Warning]', e.message || e);
          }
        } else if (googleFirestoreDb) {
          try {
            await googleFirestoreDb.collection('interactions').doc(event.id).set(event);
          } catch (err: any) {
            console.error('[Admin SDK Analytics Interaction Error]', err);
          }
        } else if (firestoreDb) {
          await setDoc(doc(firestoreDb, 'interactions', event.id), event);
        }
      } catch (err) {
        console.error('Failed to log interaction asynchronously to cloud or file:', err);
      }
    });
  }


  public getSearches(): SearchEvent[] {
    return this.data.searches;
  }

  public getInteractions(): InteractionEvent[] {
    return this.data.interactions;
  }

  public getAnalyticsSummary(allDestinations: any[], allAttractions: any[], allRoutes: any[]) {
    const searches = this.data.searches;
    const interactions = this.data.interactions;
    const totalSearches = searches.length;

    // Unique Users (unique combination of user_id or session_id)
    const uniqueUsersSet = new Set<string>();
    searches.forEach(s => {
      if (s.userId) uniqueUsersSet.add(`user-${s.userId}`);
      else if (s.sessionId) uniqueUsersSet.add(`sess-${s.sessionId}`);
    });
    interactions.forEach(i => {
      if (i.userId) uniqueUsersSet.add(`user-${i.userId}`);
      else if (i.sessionId) uniqueUsersSet.add(`sess-${i.sessionId}`);
    });
    const totalUsers = uniqueUsersSet.size;

    // Time calculations
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Searches this week (last 7 days window)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Month strings
    const currentYearStr = String(now.getFullYear());
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
    const thisMonthStr = `${currentYearStr}-${currentMonthNum}`; // e.g. "2026-06"

    // 1. Most searched routes
    const routeSearchCounts: Record<string, number> = {};
    searches.forEach(s => {
      if (s.sourceDestination && s.destination) {
        const routeLabel = `${s.sourceDestination} → ${s.destination}`;
        routeSearchCounts[routeLabel] = (routeSearchCounts[routeLabel] || 0) + 1;
      }
    });
    const mostSearchedRoutes = Object.entries(routeSearchCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count);

    // 2. Most searched destinations
    const destSearchCounts: Record<string, number> = {};
    searches.forEach(s => {
      if (s.destination) {
        destSearchCounts[s.destination] = (destSearchCounts[s.destination] || 0) + 1;
      }
    });
    const mostSearchedDestinations = Object.entries(destSearchCounts)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count);

    // 3. Most searched attractions (match searches matching description or category)
    const attractionSearchCounts: Record<string, number> = {};
    allAttractions.forEach(attr => {
      attractionSearchCounts[attr.name] = 0;
    });

    searches.forEach(s => {
      const q = (s.searchQuery || '').toLowerCase().trim();
      const dest = (s.destination || '').toLowerCase().trim();
      allAttractions.forEach(attr => {
        const attrNameLower = attr.name.toLowerCase();
        if (q.includes(attrNameLower) || (dest.includes(attr.destinationId.toLowerCase()))) {
          attractionSearchCounts[attr.name] = (attractionSearchCounts[attr.name] || 0) + 1;
        }
      });
    });

    const mostSearchedAttractions = Object.entries(attractionSearchCounts)
      .map(([name, count]) => ({ name, count }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count);

    // 4. Searches by date
    const searchesByDateMap: Record<string, number> = {};
    searches.forEach(s => {
      if (s.searchDate) {
        searchesByDateMap[s.searchDate] = (searchesByDateMap[s.searchDate] || 0) + 1;
      }
    });
    const searchesByDate = Object.entries(searchesByDateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 5. Searches by month
    const searchesByMonthMap: Record<string, number> = {};
    searches.forEach(s => {
      if (s.searchDate) {
        const month = s.searchDate.substring(0, 7); // "YYYY-MM"
        searchesByMonthMap[month] = (searchesByMonthMap[month] || 0) + 1;
      }
    });

    const monthNames: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };

    const searchesByMonth = Object.entries(searchesByMonthMap)
      .map(([month, count]) => {
        const [year, mNum] = month.split('-');
        const readable = `${monthNames[mNum] || mNum} ${year}`;
        return { month, readable, count };
      })
      .sort((a, b) => a.month.localeCompare(b.month));

    // 6. Searches by state
    const searchesByStateMap: Record<string, number> = {};
    searches.forEach(s => {
      const state = s.state || 'Himachal Pradesh'; // Default state region
      searchesByStateMap[state] = (searchesByStateMap[state] || 0) + 1;
    });
    const searchesByState = Object.entries(searchesByStateMap)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);

    // 7. Searches with no results
    const searchesWithNoResultsMap: Record<string, number> = {};
    searches.forEach(s => {
      if (s.hasResults === false && s.searchQuery) {
        searchesWithNoResultsMap[s.searchQuery] = (searchesWithNoResultsMap[s.searchQuery] || 0) + 1;
      }
    });
    const searchesWithNoResults = Object.entries(searchesWithNoResultsMap)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count);

    // 8. Trending searches (overall most frequently searched keywords/queries)
    const trendingSearchesMap: Record<string, number> = {};
    searches.forEach(s => {
      const q = s.searchQuery ? s.searchQuery.trim().toLowerCase() : '';
      if (q && q.length > 2) {
        trendingSearchesMap[q] = (trendingSearchesMap[q] || 0) + 1;
      } else if (s.sourceDestination && s.destination) {
        const routeQ = `${s.sourceDestination} to ${s.destination}`.toLowerCase();
        trendingSearchesMap[routeQ] = (trendingSearchesMap[routeQ] || 0) + 1;
      }
    });
    const trendingSearches = Object.entries(trendingSearchesMap)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 9. Route Analytics (Total, Month, Week, Today)
    const routesAnalyticsList = allRoutes.map(item => {
      const rId = item.id;
      const fromId = item.fromHubId;
      const toId = item.toHubId;

      // Filter searches that match this route (either via routeId or matching endpoints)
      const matchingSearches = searches.filter(s => {
        if (s.routeId === rId) return true;
        // Endpoints comparison (both forward and reverse since routes are bi-directional)
        const matchesForward = s.sourceDestination === fromId && s.destination === toId;
        const matchesReverse = s.sourceDestination === toId && s.destination === fromId;
        return matchesForward || matchesReverse;
      });

      const total = matchingSearches.length;
      let month = 0;
      let week = 0;
      let today = 0;

      matchingSearches.forEach(s => {
        const sDate = s.searchDate;
        const sTime = new Date(s.timestamp);

        if (sDate === todayStr) {
          today += 1;
        }
        if (sTime >= sevenDaysAgo) {
          week += 1;
        }
        if (sDate.startsWith(thisMonthStr)) {
          month += 1;
        }
      });

      return {
        id: rId,
        fromHubId: fromId,
        toHubId: toId,
        total,
        month,
        week,
        today
      };
    }).sort((a, b) => b.total - a.total);

    // 10. Destination Analytics (Views, Searches, Image Views, Route Clicks)
    const destinationAnalyticsList = allDestinations.map(dest => {
      // Views: interactions for destination detail view page
      const views = interactions.filter(i => i.type === 'destination_view' && i.entityId === dest.id).length;

      // Searches query or destinationName matches
      const searchesCount = searches.filter(s => {
        return s.destinationId === dest.id || 
               (s.destination && s.destination.toLowerCase() === dest.name.toLowerCase());
      }).length;

      // Image Views: interactions inside this destination
      const imageViews = interactions.filter(i => i.type === 'image_view' && i.entityId === dest.id).length;

      // Route Clicks: route click interactions
      const routeClicks = interactions.filter(i => i.type === 'route_click' && i.entityId === dest.id).length;

      return {
        id: dest.id,
        name: dest.name,
        views,
        searches: searchesCount,
        imageViews,
        routeClicks
      };
    }).sort((a, b) => b.views - a.views);

    return {
      totalSearches,
      totalUsers,
      mostSearchedRoutes,
      mostSearchedDestinations,
      mostSearchedAttractions,
      searchesByDate,
      searchesByMonth,
      searchesByState,
      searchesWithNoResults,
      trendingSearches,
      routeAnalytics: routesAnalyticsList,
      destinationAnalytics: destinationAnalyticsList,
      recentSearches: searches.slice().reverse().slice(0, 50)
    };
  }

  public async logUserAnalyticsEvent(
    type: 'route_search' | 'destination_visit' | 'attraction_visit' | 'ai_advisor_query',
    name: string,
    slug?: string,
    source?: string,
    destination?: string
  ): Promise<void> {
    setImmediate(async () => {
      try {
        const id = `ana-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
        const timestamp = new Date().toISOString();
        const event = {
          id,
          type,
          name,
          slug: slug || '',
          source: source || '',
          destination: destination || '',
          timestamp,
          count: 1
        };

        // Cache locally first
        if (!this.data.userAnalytics) {
          this.data.userAnalytics = [];
        }
        this.data.userAnalytics.push(event);
        this.save();

        if (supabase && isSupabaseOnline) {
          try {
            const { error } = await supabase.from('user_analytics').upsert(event);
            if (error) {
              if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                // Table not created yet - handle gracefully as info
                console.log(`[User Analytics Info] Table "user_analytics" does not exist in Supabase yet. Retained locally: ${type} - ${name}`);
              } else {
                throw error;
              }
            } else {
              console.log(`[User Analytics] Logged to Supabase successfully: ${type} - ${name}`);
            }
          } catch (err: any) {
            console.log(`[User Analytics Graceful Info] Cannot sync ${type} - ${name} event to Supabase (falling back to local):`, err.message || err);
          }
        } else if (googleFirestoreDb) {
          try {
            await googleFirestoreDb.collection('user_analytics').doc(id).set(event);
            console.log(`[User Analytics] Logged to Firestore successfully (Admin SDK): ${type} - ${name}`);
          } catch (err: any) {
            console.log(`[User Analytics Info] Cannot sync ${type} - ${name} event to Firestore via Admin SDK:`, err.message || err);
          }
        } else if (firestoreDb) {
          try {
            await setDoc(doc(firestoreDb, 'user_analytics', id), event);
            console.log(`[User Analytics] Logged to Firestore successfully: ${type} - ${name}`);
          } catch (err: any) {
            const isPermissionDenied = err?.message?.toLowerCase().includes('permission') || String(err).toLowerCase().includes('permission');
            if (isPermissionDenied) {
              console.log(`[User Analytics Sync Info] Firestore permission not available to log event ${type} - ${name}. Local cache preserved structure (No action required).`);
            } else {
              console.log(`[User Analytics Info] Cannot sync ${type} - ${name} event to Firestore:`, err.message || err);
            }
          }
        } else {
          console.log('[User Analytics Info] Cloud connection inactive. Event saved in regional offline cache.');
        }
      } catch (err) {
        console.log('Failed to log user analytics event asynchronously:', err);
      }
    });
  }

  public async fetchUserAnalyticsFromFirestore(): Promise<any[]> {
    if (supabase && isSupabaseOnline) {
      try {
        const { data, error } = await supabase.from('user_analytics').select('*');
        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            console.log('[User Analytics Info] Table "user_analytics" does not exist in Supabase yet. Standard routing data fallback.');
            return this.data.userAnalytics || [];
          }
          throw error;
        }
        return data || [];
      } catch (err: any) {
        console.log('[User Analytics Info] Quiet fallback to local database for analytics fetch:', err.message || err);
        return this.data.userAnalytics || [];
      }
    }
    if (!firestoreDb) {
      console.log('[User Analytics Info] External cloud engine not ready. Returning local cache.');
      return this.data.userAnalytics || [];
    }
    try {
      const snap = await getDocs(collection(firestoreDb, 'user_analytics'));
      const list: any[] = [];
      snap.forEach(docSnap => {
        list.push(docSnap.data());
      });
      return list;
    } catch (err: any) {
      const isPermissionDenied = err?.message?.toLowerCase().includes('permission') || String(err).toLowerCase().includes('permission');
      if (isPermissionDenied) {
        console.log('[User Analytics Sync Info] Firestore permission not available for fetch. Falling back to local/cached visitor analytics.');
      } else {
        console.log('Failed to fetch user analytics from Firestore (falling back to local):', err.message || err);
      }
      return this.data.userAnalytics || [];
    }
  }


  public compileUserAnalyticsSummary(events: any[]) {
    let totalRouteSearches = 0;
    let totalDestinationVisits = 0;
    let totalAttractionVisits = 0;

    const routeMap = new Map<string, { name: string; count: number; source: string; destination: string; type: string }>();
    const destMap = new Map<string, { name: string; count: number; slug: string; type: string }>();
    const attrMap = new Map<string, { name: string; count: number; slug: string; type: string }>();

    // Activity over time mapping
    const dailyActivityMap = new Map<string, { date: string; searches: number; destinations: number; attractions: number; total: number }>();

    events.forEach(evt => {
      const { type, name, slug, source, destination, timestamp, count = 1 } = evt;
      const dateStr = timestamp ? timestamp.substring(0, 10) : 'Unknown';

      // Ensure daily structure exists
      if (dateStr && dateStr !== 'Unknown') {
        if (!dailyActivityMap.has(dateStr)) {
          dailyActivityMap.set(dateStr, { date: dateStr, searches: 0, destinations: 0, attractions: 0, total: 0 });
        }
        const daily = dailyActivityMap.get(dateStr)!;
        daily.total += count;
        if (type === 'route_search') daily.searches += count;
        else if (type === 'destination_visit') daily.destinations += count;
        else if (type === 'attraction_visit') daily.attractions += count;
      }

      if (type === 'route_search') {
        totalRouteSearches += count;
        const current = routeMap.get(name) || { name, count: 0, source: source || '', destination: destination || '', type: 'route_search' };
        current.count += count;
        routeMap.set(name, current);
      } else if (type === 'destination_visit') {
        totalDestinationVisits += count;
        const current = destMap.get(name) || { name, count: 0, slug: slug || '', type: 'destination_visit' };
        current.count += count;
        destMap.set(name, current);
      } else if (type === 'attraction_visit') {
        totalAttractionVisits += count;
        const current = attrMap.get(name) || { name, count: 0, slug: slug || '', type: 'attraction_visit' };
        current.count += count;
        attrMap.set(name, current);
      }
    });

    const mostSearchedRoutes = Array.from(routeMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const mostVisitedDestinations = Array.from(destMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const mostVisitedAttractions = Array.from(attrMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const activityOverTime = Array.from(dailyActivityMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRouteSearches,
      totalDestinationVisits,
      totalAttractionVisits,
      totalCount: totalRouteSearches + totalDestinationVisits + totalAttractionVisits,
      mostSearchedRoutes,
      mostVisitedDestinations,
      mostVisitedAttractions,
      activityOverTime
    };
  }
}

export const analyticsDb = new AnalyticsDatabase();
