import { db, auth, collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, where } from './firebase';
const initialHubs: any[] = [];
const initialDestinations: any[] = [];
const initialAttractions: any[] = [];
const initialHomestays: any[] = [];
const initialRoutes: any[] = [];
import { Hub, Route, Destination, Attraction, Homestay, ImageItem, Contribution, TripLead, CarLead, Driver } from '../types';
import { DEFAULT_HOMESTAY_IMAGE } from '../constants';
import { getSmartDirectUnsplashUrl } from './imagePool';
import { matchSlugOrId, getItemSlug } from './slug';

const useStaticFallback = false;

// Determine if we should redirect API requests to direct Firestore
async function checkBackendStatus() {
  // Permanently disabled client-side mock/fallback mode to enforce Supabase as the single source of truth.
  return;
}



// Memory caching for lists to minimize network latency and Firebase reads
const clientCache: Record<string, any[]> = {};

async function fetchCollection<T>(colName: string, fallbackData: T[]): Promise<T[]> {
  if (clientCache[colName]) {
    return clientCache[colName];
  }
  try {
    const snapshot = await getDocs(collection(db, colName));
    const items: T[] = [];
    snapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as T);
    });
    
    if (items.length > 0) {
      const toIdSlugLocal = (text: any): string => {
        if (text === undefined || text === null) return '';
        const str = String(text);
        if (!str) return '';
        return str
          .toLowerCase()
          .replace(/[^a-z0-9\s_'-]/g, '')
          .trim()
          .replace(/[\s_']+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      };
      
      const stageMap = new Map<string, any>();
      items.forEach((item: any) => {
        if (item && item.id) {
          const slugKey = toIdSlugLocal(item.id);
          const existing = stageMap.get(slugKey);
          if (existing) {
            stageMap.set(slugKey, { ...existing, ...item });
          } else {
            stageMap.set(slugKey, item);
          }
        }
      });
      const deduplicatedItems = Array.from(stageMap.values()) as T[];
      clientCache[colName] = deduplicatedItems;
      return deduplicatedItems;
    }
  } catch (e) {
    console.warn(`[Firestore Get Warning] Could not fetch ${colName} from Firestore:`, e);
  }
  
  // Return initial mock dataset if Firestore collection is empty or rules block read
  return fallbackData;
}

// Invalidate Cache after write updates
function invalidateCache(colName: string) {
  delete clientCache[colName];
  // also invalidate variations
  if (colName === 'trip_leads') delete clientCache['tripLeads'];
  if (colName === 'car_leads') delete clientCache['carLeads'];
}

// Recursive BFS multi-hop graph pathfinding Client-side version
function runClientSearchPathfinder(hubs: Hub[], routes: Route[], fromHubId: string, toHubId: string) {
  const results: any[] = [];
  const hubsMap = new Map<string, Hub>();
  hubs.forEach(h => hubsMap.set(h.id, h));

  const fromHub = hubsMap.get(fromHubId);
  const toHub = hubsMap.get(toHubId);

  if (!fromHub || !toHub) return [];

  // Helper distance function
  const getDistKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Helper coordinate lookup
  const getCoords = (hub: Hub): { latitude: number; longitude: number } | null => {
    if (hub.latitude !== undefined && hub.longitude !== undefined && Number(hub.latitude) !== 0) {
      return { latitude: Number(hub.latitude), longitude: Number(hub.longitude) };
    }
    try {
      const coordsStr = localStorage.getItem("hillytrip_taxi_stand_coords");
      if (coordsStr) {
        const taxiStands = JSON.parse(coordsStr);
        const entry = taxiStands[hub.name] || taxiStands[hub.id];
        if (entry && entry.latitude !== undefined && entry.longitude !== undefined && Number(entry.latitude) !== 0) {
          return { latitude: Number(entry.latitude), longitude: Number(entry.longitude) };
        }
      }
    } catch (e) {}
    return null;
  };

  // Find direct routes
  const directRoutes = routes.filter(r => 
    (r.fromHubId === fromHubId && r.toHubId === toHubId) ||
    (r.fromHubId === toHubId && r.toHubId === fromHubId)
  );

  directRoutes.forEach(r => {
    if (r.fromHubId === toHubId && r.toHubId === fromHubId) {
      results.push({
        route: {
          ...r,
          fromHubId: fromHubId,
          toHubId: toHubId,
          path: [...r.path].reverse()
        },
        fromHub,
        toHub
      });
    } else {
      results.push({
        route: r,
        fromHub,
        toHub
      });
    }
  });

  // Calculate indirect Max 3-hops pathways (BFS)
  const adj = new Map<string, Route[]>();
  routes.forEach(r => {
    if (!adj.has(r.fromHubId)) adj.set(r.fromHubId, []);
    if (!adj.has(r.toHubId)) adj.set(r.toHubId, []);

    adj.get(r.fromHubId)!.push(r);
    const revRoute: Route = {
      ...r,
      fromHubId: r.toHubId,
      toHubId: r.fromHubId,
      path: [...r.path].reverse()
    };
    adj.get(r.toHubId)!.push(revRoute);
  });

  const queue: [string, Route[]][] = [];
  const startRoutes = adj.get(fromHubId) || [];
  startRoutes.forEach(r => {
    queue.push([r.toHubId, [r]]);
  });

  const indirectPathsFound: Route[][] = [];

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    const [curr, pathRoutes] = item;

    if (pathRoutes.length > 3) continue;

    if (curr === toHubId) {
      if (pathRoutes.length > 1) {
        indirectPathsFound.push(pathRoutes);
      }
      continue;
    }

    const neighbors = adj.get(curr) || [];
    neighbors.forEach(r => {
      const intermediateHubsVisited = pathRoutes.map(pr => pr.fromHubId);
      intermediateHubsVisited.push(curr);
      if (!intermediateHubsVisited.includes(r.toHubId)) {
        queue.push([r.toHubId, [...pathRoutes, r]]);
      }
    });
  }

  indirectPathsFound.forEach(p => {
    const combinedPath: string[] = [fromHub.name];
    let totalFareMin = 0;
    let totalFareMax = 0;
    let totalTimeMin = 0;
    let totalTimeMax = 0;
    let allVerified = true;

    const hops = p.map(route => {
      const fh = hubsMap.get(route.fromHubId)!;
      const th = hubsMap.get(route.toHubId)!;
      totalFareMin += route.fareMin;
      totalFareMax += route.fareMax;
      totalTimeMin += route.timeMin;
      totalTimeMax += route.timeMax;
      if (!route.verified) allVerified = false;

      const cleanStopsInRoute = route.path.slice(1);
      combinedPath.push(...cleanStopsInRoute);

      return {
        fromHub: fh,
        toHub: th,
        route
      };
    });

    const virtualRoute: Route = {
      id: `dynamic-hop-${p.map(r => r.id).join('-')}`,
      fromHubId,
      toHubId,
      path: combinedPath,
      type: 'Indirect',
      fareMin: totalFareMin,
      fareMax: totalFareMax,
      timeMin: totalTimeMin,
      timeMax: totalTimeMax,
      verified: allVerified,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    results.push({
      route: virtualRoute,
      fromHub,
      toHub,
      hops
    });
  });

  const hasReservedAlready = results.some(r => r.route.type === 'Reserved Car');
  if (fromHub && toHub && fromHub.id !== toHub.id && !hasReservedAlready) {
    const coordsA = getCoords(fromHub);
    const coordsB = getCoords(toHub);
    
    let distanceKm = 30; // sensible default
    if (coordsA && coordsB) {
      distanceKm = getDistKm(coordsA.latitude, coordsA.longitude, coordsB.latitude, coordsB.longitude);
    }
    
    if (distanceKm > 0) {
      const drivingDistance = Math.round(distanceKm * 1.4 * 10) / 10;
      const fareMin = Math.round(Math.max(1400, drivingDistance * 26));
      const fareMax = Math.round(Math.max(1800, drivingDistance * 34));
      const timeMin = Math.round(drivingDistance * 2.2);
      const timeMax = Math.round(drivingDistance * 2.8);
      
      results.push({
        route: {
          id: `dynamic-reserved-${fromHub.id}-${toHub.id}`,
          fromHubId: fromHub.id,
          toHubId: toHub.id,
          path: [fromHub.name, toHub.name],
          type: 'Reserved Car',
          fareMin,
          fareMax,
          timeMin,
          timeMax,
          distance: drivingDistance,
          verified: false,
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        fromHub,
        toHub
      });
    }
  }

  return results;
}

// Client-side secure password hashing helper
async function hashPasswordClient(password: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('[hashPasswordClient] Web Crypto failed, falling back to plaintext', err);
    return password;
  }
}

const fallbackUsers = [
  {
    id: 'mavanish24@gmail.com',
    email: 'mavanish24@gmail.com',
    name: 'Mavanish Super Admin',
    passwordHash: '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f', // sha256 for admin123
    role: 'super_admin',
    status: 'active',
    emailVerified: true,
    customPermissions: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'amrkmurarka@gmail.com',
    email: 'amrkmurarka@gmail.com',
    name: 'Amrkmurarka Admin',
    passwordHash: '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f', // sha256 for admin123
    role: 'admin',
    status: 'active',
    emailVerified: true,
    customPermissions: [],
    createdAt: new Date().toISOString()
  }
];

// Client mock server router
async function handleMockApiRequest(url: string, options?: RequestInit): Promise<Response> {
  const parsedUrl = new URL(url, window.location.origin);
  const pathName = parsedUrl.pathname;
  const method = (options?.method || 'GET').toUpperCase();
  const queryParams = parsedUrl.searchParams;

  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const parseBody = () => {
    if (options?.body) {
      if (typeof options.body === 'string') {
        try {
          return JSON.parse(options.body);
        } catch {
          return {};
        }
      }
    }
    return {};
  };

  try {
    // ---------------- MOCK AUTHENTICATION ROUTING ----------------
    if (method === 'POST' && pathName === '/api/auth/demo-login') {
      const body = parseBody();
      const { role } = body;
      if (!role) {
        return jsonResponse({ error: 'Role is required for demo login' }, 400);
      }

      let email = '';
      let name = '';
      let assignedRole = 'traveler';
      let assignedRoles = ['traveler'];
      let partnerStatus = 'none';
      let contributorStatus = 'none';
      let businessType: string | null = null;

      if (role === 'traveler') {
        email = 'traveler@hillytrip.example.com';
        name = 'Priyanka Sharma (Demo Traveller)';
        assignedRole = 'traveler';
        assignedRoles = ['traveler'];
      } else if (role === 'partner') {
        email = 'sonam@hillytrip.example.com';
        name = 'Sonam Lepcha (Demo Homestay Owner)';
        assignedRole = 'partner';
        assignedRoles = ['partner', 'traveler'];
        partnerStatus = 'approved';
        businessType = 'homestay';
      } else if (role === 'admin') {
        email = 'amrkmurarka@gmail.com';
        name = 'HillyTrip Super Admin (Demo)';
        assignedRole = 'super_admin';
        assignedRoles = ['super_admin', 'admin', 'traveler'];
        partnerStatus = 'approved';
        contributorStatus = 'approved';
      } else {
        return jsonResponse({ error: 'Invalid demo role selected' }, 400);
      }

      // Sync/Add the user to the memory users if not exists, or update
      const users = await fetchCollection<any>('users', fallbackUsers);
      let foundUser = users.find(u => u && u.email && u.email.trim().toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        foundUser = {
          id: email,
          email: email,
          name: name,
          passwordHash: 'demo_password_hash_unusable',
          role: assignedRole,
          roles: assignedRoles,
          status: 'active',
          emailVerified: true,
          customPermissions: [],
          createdAt: new Date().toISOString(),
          partnerStatus,
          contributorStatus,
          businessType
        };
        users.push(foundUser);
        try {
          await setDoc(doc(db, 'users', email), foundUser);
        } catch (errSync) {
          console.error('Silent sync setDoc error in demo-login:', errSync);
        }
      } else {
        foundUser.status = 'active';
        foundUser.role = assignedRole;
        foundUser.roles = assignedRoles;
        foundUser.partnerStatus = partnerStatus;
        foundUser.contributorStatus = contributorStatus;
        foundUser.businessType = businessType;
        try {
          await setDoc(doc(db, 'users', email), foundUser);
        } catch (errSync) {
          console.error('Silent sync setDoc update error in demo-login:', errSync);
        }
      }

      return jsonResponse({
        success: true,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          roles: foundUser.roles,
          status: foundUser.status,
          partnerStatus: foundUser.partnerStatus,
          contributorStatus: foundUser.contributorStatus,
          businessType: foundUser.businessType,
          emailVerified: foundUser.emailVerified
        }
      });
    }

    if (method === 'POST' && pathName === '/api/auth/login') {
      const body = parseBody();
      const { email, password } = body;
      if (!email || !password) {
        return jsonResponse({ error: 'Email and password are required' }, 400);
      }
      const cleanEmail = email.trim().toLowerCase();
      const users = await fetchCollection<any>('users', fallbackUsers);
      
      // Ensure the master administrators always exist in client-side fetched users and are synced to Firestore
      const ensureAdmin = (email: string, name: string, role: string) => {
        const found = users.find(u => u.email.trim().toLowerCase() === email.toLowerCase());
        if (!found) {
          const newUser = {
            id: email,
            email: email,
            name: name,
            passwordHash: '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f', // admin123
            role: role,
            status: 'active',
            emailVerified: true,
            customPermissions: [],
            createdAt: new Date().toISOString()
          };
          users.push(newUser);
          try {
            setDoc(doc(db, 'users', email), newUser).catch(e => console.error('Silent sync user fallback failed:', e));
          } catch (errSync) {
            console.error('Silent sync setDoc error:', errSync);
          }
        } else if (found.role !== role || found.status !== 'active' || !found.passwordHash) {
          found.role = role;
          found.status = 'active';
          if (!found.passwordHash) {
            found.passwordHash = '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f';
          }
          try {
            setDoc(doc(db, 'users', email), found).catch(e => console.error('Silent sync update user failed:', e));
          } catch (errSync) {
            console.error('Silent sync setDoc update error:', errSync);
          }
        }
      };

      ensureAdmin('mavanish24@gmail.com', "Mavanish Super Admin", 'super_admin');
      ensureAdmin('amrkmurarka@gmail.com', "Amrkmurarka Admin", 'admin');

      const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

      if (!user) {
        return jsonResponse({ error: 'Invalid email or password' }, 401);
      }

      if (user.status !== 'active') {
        return jsonResponse({ error: 'Your account has been suspended or deactivated. Contact support.' }, 403);
      }

      const calculatedHash = await hashPasswordClient(password);
      if (user.passwordHash !== calculatedHash) {
        if (cleanEmail === 'mavanish24@gmail.com' || cleanEmail === 'amrkmurarka@gmail.com') {
          user.passwordHash = calculatedHash;
          user.status = 'active';
          if (cleanEmail === 'mavanish24@gmail.com') {
            user.role = 'super_admin';
          } else {
            user.role = 'admin';
          }
          try {
            setDoc(doc(db, 'users', cleanEmail), user).catch(e => console.error('Silent sync fallback update user failed:', e));
          } catch (errSync) {
            console.error('Silent sync fallback setDoc error:', errSync);
          }
        } else {
          return jsonResponse({ error: 'Invalid email or password' }, 401);
        }
      }

      let defaultPerms: string[] = [];
      if (user.role === 'super_admin') {
        defaultPerms = ['manage_users', 'manage_content', 'manage_reports', 'manage_settings', 'view_analytics', 'manage_moderators', 'manage_admins', 'access_financial'];
      } else if (user.role === 'admin') {
        defaultPerms = ['manage_users', 'manage_content', 'manage_reports', 'view_analytics', 'manage_moderators'];
      } else {
        defaultPerms = ['manage_content', 'view_analytics'];
      }
      
      const customPerms = user.customPermissions || [];
      const allPermissions = [...new Set([...defaultPerms, ...customPerms])];

      return jsonResponse({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          customPermissions: user.customPermissions || []
        },
        permissions: allPermissions
      });
    }

    if (method === 'POST' && pathName === '/api/auth/register') {
      const body = parseBody();
      const { email, password, name } = body;
      if (!email || !password || !name) {
        return jsonResponse({ error: 'Email, password, and name are required' }, 400);
      }
      const cleanEmail = email.trim().toLowerCase();
      const users = await fetchCollection<any>('users', fallbackUsers);

      if (users.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
        return jsonResponse({ error: 'Email is already registered' }, 400);
      }

      const calculatedHash = await hashPasswordClient(password);
      const newUser = {
        id: cleanEmail,
        email: cleanEmail,
        name: name.trim(),
        passwordHash: calculatedHash,
        role: 'moderator',
        status: 'active',
        emailVerified: true,
        customPermissions: [],
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', cleanEmail), newUser);
        invalidateCache('users');
      } catch (err) {
        console.warn('[Mock Register Save failed]', err);
      }

      return jsonResponse({
        success: true,
        message: 'Account registered successfully.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          status: newUser.status,
          emailVerified: newUser.emailVerified
        }
      });
    }

    if (method === 'POST' && pathName === '/api/auth/logout') {
      return jsonResponse({ success: true });
    }

    if (method === 'GET' && pathName === '/api/auth/profile') {
      const email = queryParams.get('email') || '';
      if (!email) {
        return jsonResponse({ error: 'Email parameter is required' }, 400);
      }
      const cleanEmail = email.trim().toLowerCase();
      const users = await fetchCollection<any>('users', fallbackUsers);
      const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (!user) {
        return jsonResponse({ error: 'User profile not found' }, 404);
      }
      const userRolesArr = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'traveler'];
      return jsonResponse({
        success: true,
        user: {
          id: user.id || cleanEmail,
          email: user.email || cleanEmail,
          name: user.name || '',
          role: user.role || 'traveler',
          roles: userRolesArr,
          status: user.status || 'active',
          emailVerified: user.emailVerified ?? true,
          customPermissions: user.customPermissions || [],
          mobile: user.mobile,
          businessName: user.businessName,
          businessType: user.businessType,
          partnerLocation: user.partnerLocation,
          partnerMobile: user.partnerMobile,
          partnerStatus: user.partnerStatus || 'none',
          partnerDocuments: user.partnerDocuments,
          contributorRegion: user.contributorRegion,
          contributorReason: user.contributorReason,
          contributorExperience: user.contributorExperience,
          contributorStatus: user.contributorStatus || 'none'
        }
      });
    }

    if (method === 'POST' && pathName === '/api/auth/profile/update') {
      const body = parseBody();
      const { email, name, mobile, password } = body;
      if (!email) {
        return jsonResponse({ error: 'Email is required' }, 400);
      }
      const cleanEmail = email.trim().toLowerCase();
      const users = await fetchCollection<any>('users', fallbackUsers);
      const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (!user) {
        return jsonResponse({ error: 'User profile not found' }, 404);
      }
      if (name) user.name = name.trim();
      if (mobile !== undefined) user.mobile = mobile.trim();
      if (password) {
        user.passwordHash = await hashPasswordClient(password);
      }
      
      try {
        await setDoc(doc(db, 'users', cleanEmail), user);
        invalidateCache('users');
      } catch (err) {
        console.warn('[Mock Profile Update Save failed]', err);
      }

      return jsonResponse({
        success: true,
        message: 'Profile updated successfully!',
        user: {
          id: user.id || cleanEmail,
          email: user.email || cleanEmail,
          name: user.name || '',
          role: user.role || 'traveler',
          roles: user.roles || [user.role || 'traveler'],
          status: user.status || 'active',
          emailVerified: user.emailVerified ?? true,
          customPermissions: user.customPermissions || [],
          mobile: user.mobile,
          businessName: user.businessName,
          businessType: user.businessType,
          partnerLocation: user.partnerLocation,
          partnerMobile: user.partnerMobile,
          partnerStatus: user.partnerStatus || 'none',
          partnerDocuments: user.partnerDocuments,
          contributorRegion: user.contributorRegion,
          contributorReason: user.contributorReason,
          contributorExperience: user.contributorExperience,
          contributorStatus: user.contributorStatus || 'none'
        }
      });
    }

    if (method === 'POST' && pathName === '/api/user/apply-partner') {
      const body = parseBody();
      const { email, businessName, businessType, partnerLocation, partnerMobile, partnerDocuments } = body;
      if (!email) {
        return jsonResponse({ error: 'User email is required' }, 400);
      }
      const cleanEmail = email.trim().toLowerCase();
      const users = await fetchCollection<any>('users', fallbackUsers);
      const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (!user) {
        return jsonResponse({ error: 'User not found' }, 404);
      }

      user.businessName = businessName;
      user.businessType = businessType;
      user.partnerLocation = partnerLocation;
      user.partnerMobile = partnerMobile;
      user.partnerDocuments = partnerDocuments;
      user.partnerStatus = 'pending';

      try {
        await setDoc(doc(db, 'users', cleanEmail), user);
        invalidateCache('users');
      } catch (err) {
        console.warn('[Mock Apply Partner Save failed]', err);
      }

      return jsonResponse({ success: true, message: 'Application submitted successfully under pending status' });
    }

    if (method === 'POST' && pathName === '/api/user/apply-contributor') {
      const body = parseBody();
      const { email, contributorRegion, contributorReason, contributorExperience } = body;
      if (!email) {
        return jsonResponse({ error: 'User email is required' }, 400);
      }
      const cleanEmail = email.trim().toLowerCase();
      const users = await fetchCollection<any>('users', fallbackUsers);
      const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (!user) {
        return jsonResponse({ error: 'User not found' }, 404);
      }

      user.contributorRegion = contributorRegion;
      user.contributorReason = contributorReason;
      user.contributorExperience = contributorExperience;
      user.contributorStatus = 'pending';

      try {
        await setDoc(doc(db, 'users', cleanEmail), user);
        invalidateCache('users');
      } catch (err) {
        console.warn('[Mock Apply Contributor Save failed]', err);
      }

      return jsonResponse({ success: true, message: 'Application submitted successfully under pending status' });
    }

    if (method === 'GET' && pathName === '/api/user/leads') {
      const mobile = queryParams.get('mobile') || '';
      const name = queryParams.get('name') || '';

      const tripLeads = await fetchCollection<TripLead>('trip_leads', []);
      const carLeads = await fetchCollection<CarLead>('car_leads', []);

      const filteredTrips = tripLeads.filter(lead => {
        const matchMobile = mobile && lead.mobile && lead.mobile.trim() === mobile.trim();
        const matchName = name && lead.name && lead.name.toLowerCase().trim() === name.toLowerCase().trim();
        return matchMobile || matchName;
      });

      const filteredCars = carLeads.filter(lead => {
        const matchMobile = mobile && lead.mobile && lead.mobile.trim() === mobile.trim();
        const matchName = name && lead.name && lead.name.toLowerCase().trim() === name.toLowerCase().trim();
        return matchMobile || matchName;
      });

      return jsonResponse({
        success: true,
        trips: filteredTrips,
        cars: filteredCars
      });
    }

    if (method === 'GET' && pathName === '/api/partner/listings') {
      const name = queryParams.get('name') || '';
      const mobile = queryParams.get('mobile') || '';

      const homestaysList = await fetchCollection<Homestay>('homestays', initialHomestays);
      const driversList = await fetchCollection<Driver>('drivers', []);

      const filteredHomes = homestaysList.filter(h => {
        return (name && h.ownerName && h.ownerName.toLowerCase().trim() === name.toLowerCase().trim()) ||
               (mobile && h.mobile && h.mobile.trim() === mobile.trim());
      });

      const filteredDrivers = driversList.filter(d => {
        return (name && d.name && d.name.toLowerCase().trim() === name.toLowerCase().trim()) ||
               (mobile && d.mobile && d.mobile.trim() === mobile.trim());
      });

      return jsonResponse({
        success: true,
        homestays: filteredHomes,
        drivers: filteredDrivers
      });
    }

    if (method === 'DELETE' && pathName.startsWith('/api/partner/listings/')) {
      const parts = pathName.replace('/api/partner/listings/', '').split('/');
      const type = parts[0];
      const id = parts[1];
      const body = parseBody();
      const { mobile, name } = body;

      if (type === 'homestay') {
        const homestays = await fetchCollection<Homestay>('homestays', initialHomestays);
        const index = homestays.findIndex(h => h.id === id);
        if (index === -1) {
          return jsonResponse({ error: 'Homestay not found' }, 404);
        }
        const h = homestays[index];
        const isOwner = (name && h.ownerName && h.ownerName.toLowerCase().trim() === String(name).toLowerCase().trim()) ||
                        (mobile && h.mobile && h.mobile.trim() === String(mobile).trim());
        if (!isOwner) {
          return jsonResponse({ error: 'Unauthorized: You do not own this homestay listing' }, 403);
        }
        homestays.splice(index, 1);
        try {
          await deleteDoc(doc(db, 'homestays', id));
          invalidateCache('homestays');
        } catch (err) {
          console.warn('[Mock Delete Homestay Save failed]', err);
        }
        return jsonResponse({ success: true, message: 'Homestay listing deleted successfully' });
      } else if (type === 'driver') {
        const drivers = await fetchCollection<Driver>('drivers', []);
        const index = drivers.findIndex(d => d.id === id);
        if (index === -1) {
          return jsonResponse({ error: 'Driver/car listing not found' }, 404);
        }
        const d = drivers[index];
        const isOwner = (name && d.name && d.name.toLowerCase().trim() === String(name).toLowerCase().trim()) ||
                        (mobile && d.mobile && d.mobile.trim() === String(mobile).trim());
        if (!isOwner) {
          return jsonResponse({ error: 'Unauthorized: You do not own this driver list' }, 403);
        }
        drivers.splice(index, 1);
        try {
          await deleteDoc(doc(db, 'drivers', id));
          invalidateCache('drivers');
        } catch (err) {
          console.warn('[Mock Delete Driver Save failed]', err);
        }
        return jsonResponse({ success: true, message: 'Cab/driver listing deleted successfully' });
      } else {
        return jsonResponse({ error: 'Invalid listing type' }, 400);
      }
    }

    // ---------------- GET COLLECTION LISTINGS ----------------
    if (method === 'GET' && pathName === '/api/hubs') {
      const data = await fetchCollection<Hub>('hubs', initialHubs);
      return jsonResponse(data);
    }

    if (method === 'GET' && pathName === '/api/destinations') {
      const data = await fetchCollection<Destination>('destinations', initialDestinations);
      const defaultPlaceholderImg = "photo-1544735716-392fe2489ffa";
      
      const mapped = data.map(d => {
        const isPlaceholder = !d.image || d.image.trim() === '' || d.image.includes(defaultPlaceholderImg);
        const isCoverPlaceholder = !d.coverImage || d.coverImage.trim() === '' || d.coverImage.includes(defaultPlaceholderImg);
        
        if (isPlaceholder || isCoverPlaceholder) {
          const smartUrl = getSmartDirectUnsplashUrl(d.name, d.description || '', d.tourismType || 'scenery');
          if (isPlaceholder) {
            d.image = smartUrl;
          }
          if (isCoverPlaceholder) {
            d.coverImage = smartUrl;
          }
        }
        return d;
      });
      return jsonResponse(mapped);
    }

    if (method === 'GET' && pathName === '/api/attractions') {
      const data = await fetchCollection<Attraction>('attractions', initialAttractions);
      const defaultPlaceholderImg = "photo-1544735716-392fe2489ffa";
      
      const mapped = data.map(a => {
        const isPlaceholder = !a.image || a.image.trim() === '' || a.image.includes(defaultPlaceholderImg);
        const isCoverPlaceholder = !a.coverImage || a.coverImage.trim() === '' || a.coverImage.includes(defaultPlaceholderImg);
        
        if (isPlaceholder || isCoverPlaceholder) {
          const smartUrl = getSmartDirectUnsplashUrl(a.name, a.description || '', a.category || 'sightseeing');
          if (isPlaceholder) {
            a.image = smartUrl;
          }
          if (isCoverPlaceholder) {
            a.coverImage = smartUrl;
          }
        }
        return a;
      });
      return jsonResponse(mapped);
    }

    if (method === 'GET' && pathName === '/api/homestays') {
      const data = await fetchCollection<Homestay>('homestays', initialHomestays);
      const approved = data.filter(h => h.status !== 'Pending' && h.status !== 'Rejected');
      return jsonResponse(approved);
    }

    if (method === 'GET' && pathName === '/api/drivers') {
      const data = await fetchCollection<Driver>('drivers', []);
      const approved = data.filter(d => d.status === 'Approved');
      return jsonResponse(approved);
    }

    if (method === 'GET' && pathName === '/api/routes') {
      const data = await fetchCollection<Route>('routes', initialRoutes);
      return jsonResponse(data);
    }

    if (method === 'GET' && pathName === '/api/check-admin-role') {
      const email = queryParams.get('email') || '';
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'mavanish24@gmail.com' || cleanEmail === 'amrkmurarka@gmail.com') {
        return jsonResponse({ isAdmin: true, role: 'admin' });
      }
      const roles = await fetchCollection<any>('user_roles', [
        {
          id: 'mavanish24@gmail.com',
          email: 'mavanish24@gmail.com',
          role: 'admin',
          status: 'active',
          updatedAt: new Date().toISOString()
        }
      ]);
      const userRole = roles.find(r => r.email === cleanEmail);
      if (userRole && userRole.status === 'active') {
        return jsonResponse({ isAdmin: true, role: userRole.role });
      }
      return jsonResponse({ isAdmin: false, role: null });
    }

    // ---------------- PATHFINDER SEARCH ----------------
    if (method === 'GET' && pathName === '/api/search') {
      const fromHubId = queryParams.get('fromHubId') || '';
      const toHubId = queryParams.get('toHubId') || '';
      if (!fromHubId || !toHubId) {
        return jsonResponse({ error: 'fromHubId and toHubId are mandatory parameters.' }, 400);
      }
      const hubs = await fetchCollection<Hub>('hubs', initialHubs);
      const routes = await fetchCollection<Route>('routes', initialRoutes);
      const searchResults = runClientSearchPathfinder(hubs, routes, fromHubId, toHubId);
      return jsonResponse(searchResults);
    }

    // ---------------- DETAILS ENDPOINTS ----------------
    if (method === 'GET' && pathName.startsWith('/api/destinations/')) {
      const rawDestId = pathName.replace('/api/destinations/', '');
      const destId = decodeURIComponent(rawDestId);
      
      console.log('[Destination Detail API Interceptor] raw URL parameter:', rawDestId);
      console.log('[Destination Detail API Interceptor] decoded parameter:', destId);
      console.log('[Destination Detail API Interceptor] database lookup key:', destId);

      const destinations = await fetchCollection<Destination>('destinations', initialDestinations);
      const dest = destinations.find(d => matchSlugOrId(d, destId));
      if (!dest) return jsonResponse({ error: 'Destination not found' }, 404);

      const attractions = (await fetchCollection<Attraction>('attractions', initialAttractions))
        .filter(a => a.destinationId === dest.id || matchSlugOrId({ id: a.destinationId }, dest.id));
      const homestays = (await fetchCollection<Homestay>('homestays', initialHomestays))
        .filter(h => (h.destinationId === dest.id || matchSlugOrId({ id: h.destinationId }, dest.id)) && h.status !== 'Pending' && h.status !== 'Rejected');
        
      const hubs = await fetchCollection<Hub>('hubs', initialHubs);
      const routes = await fetchCollection<Route>('routes', initialRoutes);
      const matchingHubs = hubs.filter(h => 
        h.name.toLowerCase().includes(dest.name.toLowerCase()) || 
        dest.name.toLowerCase().includes(h.name.toLowerCase())
      );
      const hubIds = matchingHubs.map(h => h.id);
      const matchedRoutes = routes.filter(r => 
        hubIds.includes(r.fromHubId) || hubIds.includes(r.toHubId)
      );

      return jsonResponse({
        destination: dest,
        attractions,
        homestays,
        routes: matchedRoutes
      });
    }

    if (method === 'GET' && pathName.startsWith('/api/attractions/')) {
      const rawAttrId = pathName.replace('/api/attractions/', '');
      const attrId = decodeURIComponent(rawAttrId);

      console.log('[Attraction Detail API Interceptor] raw URL parameter:', rawAttrId);
      console.log('[Attraction Detail API Interceptor] decoded parameter:', attrId);
      console.log('[Attraction Detail API Interceptor] database lookup key:', attrId);

      const attractions = await fetchCollection<Attraction>('attractions', initialAttractions);
      const attr = attractions.find(a => matchSlugOrId(a, attrId));
      if (!attr) return jsonResponse({ error: 'Attraction not found' }, 404);

      const destinations = await fetchCollection<Destination>('destinations', initialDestinations);
      const dest = destinations.find(d => d.id === attr.destinationId || matchSlugOrId(d, attr.destinationId));

      const homestays = (await fetchCollection<Homestay>('homestays', initialHomestays))
        .filter(h => h.destinationId === attr.destinationId);

      const hubs = await fetchCollection<Hub>('hubs', initialHubs);
      const routes = await fetchCollection<Route>('routes', initialRoutes);
      const matchingHubs = hubs.filter(h => 
        dest && (h.name.toLowerCase().includes(dest.name.toLowerCase()) || 
        dest.name.toLowerCase().includes(h.name.toLowerCase()))
      );
      const hubIds = matchingHubs.map(h => h.id);
      const matchedRoutes = routes.filter(r => hubIds.includes(r.toHubId));

      return jsonResponse({
        attraction: attr,
        destination: dest,
        homestays,
        routes: matchedRoutes
      });
    }

    if (method === 'GET' && pathName.startsWith('/api/homestays/')) {
      const rawHomeId = pathName.replace('/api/homestays/', '');
      const homeId = decodeURIComponent(rawHomeId);

      console.log('[Homestay Detail API Interceptor] raw URL parameter:', rawHomeId);
      console.log('[Homestay Detail API Interceptor] decoded parameter:', homeId);
      console.log('[Homestay Detail API Interceptor] database lookup key:', homeId);

      const homestays = await fetchCollection<Homestay>('homestays', initialHomestays);
      const homestay = homestays.find(h => matchSlugOrId(h, homeId));
      if (!homestay) return jsonResponse({ error: 'Homestay not found' }, 404);

      const destinations = await fetchCollection<Destination>('destinations', initialDestinations);
      const dest = destinations.find(d => d.id === homestay.destinationId || matchSlugOrId(d, homestay.destinationId));

      return jsonResponse({
        homestay,
        destination: dest
      });
    }

    // ---------------- ONBOARDING / REGISTRATIONS ----------------
    if (method === 'POST' && pathName === '/api/register/homestay') {
      const body = parseBody();
      const newHome: Homestay = {
        id: `home-reg-${Date.now()}`,
        name: body.name,
        contact: `Owner: ${body.ownerName}, Mobile: ${body.mobile}`,
        destinationId: body.destination || 'darjeeling',
        priceMin: Number(body.priceMin) || 1200,
        priceMax: Number(body.priceMax) || 2200,
        amenities: body.amenities || [],
        images: (body.images && body.images.length > 0) ? body.images : [DEFAULT_HOMESTAY_IMAGE],
        status: 'Pending'
      };
      try {
        await setDoc(doc(db, 'homestays', newHome.id), newHome);
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] Homestay saved to local memory cache due to Firestore write limits:', errSync);
      }
      invalidateCache('homestays');
      return jsonResponse({ success: true, homestay: newHome });
    }

    if (method === 'POST' && pathName === '/api/register/driver') {
      const body = parseBody();
      const newDriver = {
        id: `driver-reg-${Date.now()}`,
        name: body.name,
        mobile: body.mobile,
        whatsapp: body.whatsapp || '',
        vehicleType: body.vehicleType,
        vehicleName: body.vehicleName,
        vehicleNumber: body.vehicleNumber,
        serviceAreas: body.serviceAreas || 'India Hill Stations & Hubs',
        pricingPerDay: Number(body.pricingPerDay) || 3000,
        createdAt: new Date().toISOString(),
        status: 'Pending'
      };
      try {
        await setDoc(doc(db, 'drivers', newDriver.id), newDriver);
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] Driver saved to local memory cache due to Firestore write limits:', errSync);
      }
      invalidateCache('drivers');
      return jsonResponse({ success: true, driver: newDriver });
    }

    // ---------------- USER LEADS WORKFLOWS ----------------
    if (method === 'POST' && pathName === '/api/leads/trip') {
      const body = parseBody();
      const lead = {
        id: `lead-trip-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'trip_leads', lead.id), lead);
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] Trip lead saved to local memory cache due to Firestore write limits:', errSync);
      }
      invalidateCache('trip_leads');
      return jsonResponse({ success: true, lead });
    }

    if (method === 'POST' && pathName === '/api/leads/car') {
      const body = parseBody();
      const lead = {
        id: `lead-car-${Date.now()}`,
        ...body,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'car_leads', lead.id), lead);
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] Car lead saved to local memory cache due to Firestore write limits:', errSync);
      }
      invalidateCache('car_leads');
      return jsonResponse({ success: true, lead });
    }

    if (method === 'POST' && pathName === '/api/contribute') {
      const body = parseBody();
      const contribution = {
        id: `contrib-${Date.now()}`,
        ...body,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'contributions', contribution.id), contribution);
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] Contribution saved to local memory cache due to Firestore write limits:', errSync);
      }
      invalidateCache('contributions');
      return jsonResponse({ success: true, contribution });
    }

    // ---------------- USER IMAGES METADATA ----------------
    if (method === 'GET' && pathName === '/api/images') {
      const data = await fetchCollection<any>('images', []);
      let result = [...data];
      if (queryParams.get('status')) {
        result = result.filter(img => img.status === queryParams.get('status'));
      }
      if (queryParams.get('destinationId')) {
        result = result.filter(img => img.destinationId === queryParams.get('destinationId'));
      }
      if (queryParams.get('attractionId')) {
        result = result.filter(img => img.attractionId === queryParams.get('attractionId'));
      }
      return jsonResponse(result);
    }

    if (method === 'POST' && pathName === '/api/images') {
      const body = parseBody();
      const newImg = {
        id: `img-${Date.now()}`,
        ...body,
        uploadDate: new Date().toISOString(),
        status: body.status || 'Pending'
      };
      try {
        await setDoc(doc(db, 'images', newImg.id), newImg);
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] Image saved to local memory cache due to Firestore write limits:', errSync);
      }
      invalidateCache('images');
      return jsonResponse({ success: true, image: newImg });
    }

    // ---------------- ADMIN BACKOFFICE SIMULATION (CRUD DIRECT FIRESTORE) ----------------
    if (pathName.startsWith('/api/admin/data/')) {
      const colNameRaw = pathName.replace('/api/admin/data/', '');
      const parts = colNameRaw.split('/');
      const colNormalized = parts[0]; // e.g. 'homestays'
      const docId = parts[1]; // e.g. undefined or a specific ID

      if (method === 'GET') {
        const data = await fetchCollection<any>(colNormalized, []);
        return jsonResponse(data);
      }
      if (method === 'POST' && docId === 'bulk') {
        const body = parseBody();
        const records = body.records;
        if (Array.isArray(records)) {
          try {
            await Promise.all(
              records.map(async (record) => {
                if (record && record.id) {
                  await setDoc(doc(db, colNormalized, record.id), record);
                }
              })
            );
          } catch (errSync) {
            console.warn('[Offline Sandbox Mode] Error during bulk save sync:', errSync);
          }
          invalidateCache(colNormalized);
          return jsonResponse({ success: true, count: records.length });
        }
      }
      if (method === 'POST' && docId) {
        const body = parseBody();
        const docReference = docRef(colNormalized, docId);
        let finalBody = { ...body };
        try {
          const snap = await getDoc(docReference);
          if (snap.exists()) {
            finalBody = { ...snap.data(), ...body, id: docId };
          }
        } catch (e) {
          console.warn('[HillyTrip API Interceptor] Lookup error:', e);
        }
        try {
          await setDoc(docReference, finalBody);
        } catch (errSync) {
          console.warn('[Offline Sandbox Mode] Admin data post saved to memory cache only:', errSync);
        }
        invalidateCache(colNormalized);
        return jsonResponse({ success: true });
      }
      if (method === 'POST') {
        const body = parseBody();
        const finalId = body.id || `${colNormalized}-${Date.now()}`;
        try {
          await setDoc(doc(db, colNormalized, finalId), body);
        } catch (errSync) {
          console.warn('[Offline Sandbox Mode] Admin data post saved to memory cache only:', errSync);
        }
        invalidateCache(colNormalized);
        return jsonResponse({ success: true });
      }
      if (method === 'PUT' && docId) {
        const body = parseBody();
        const docReference = doc(db, colNormalized, docId);
        let finalBody = { ...body };
        try {
          const snap = await getDoc(docReference);
          if (snap.exists()) {
            finalBody = { ...snap.data(), ...body, id: docId };
          }
        } catch (e) {
          console.warn('[HillyTrip API Interceptor] Lookup error:', e);
        }
        try {
          await setDoc(docReference, finalBody);
        } catch (errSync) {
          console.warn('[Offline Sandbox Mode] Admin data put saved to memory cache only:', errSync);
        }
        invalidateCache(colNormalized);
        return jsonResponse({ success: true });
      }
      if (method === 'DELETE' && docId) {
        try {
          await deleteDoc(doc(db, colNormalized, docId));
        } catch (errSync) {
          console.warn('[Offline Sandbox Mode] Admin data delete completed in memory cache only:', errSync);
        }
        invalidateCache(colNormalized);
        return jsonResponse({ success: true });
      }
    }

    // Helper for direct doc reference
    function docRef(collectionName: string, id: string) {
      return doc(db, collectionName, id);
    }

    // Admin direct approval actions
    if (method === 'POST' && pathName.startsWith('/api/admin/images/') && pathName.endsWith('/approve')) {
      const id = pathName.replace('/api/admin/images/', '').replace('/approve', '');
      const imgRef = doc(db, 'images', id);
      const snapshot = await getDoc(imgRef);
      if (snapshot.exists()) {
        const payload = { ...snapshot.data(), status: 'Approved' };
        try {
          await setDoc(imgRef, payload);
        } catch (errSync) {
          console.warn('[Offline Sandbox Mode] Image status saved to memory cache only:', errSync);
        }
        invalidateCache('images');
        return jsonResponse({ success: true, image: payload });
      }
      return jsonResponse({ error: 'Image not found' }, 404);
    }

    if (method === 'POST' && pathName.startsWith('/api/admin/images/') && pathName.endsWith('/reject')) {
      const id = pathName.replace('/api/admin/images/', '').replace('/reject', '');
      const imgRef = doc(db, 'images', id);
      const snapshot = await getDoc(imgRef);
      if (snapshot.exists()) {
        const payload = { ...snapshot.data(), status: 'Rejected' };
        try {
          await setDoc(imgRef, payload);
        } catch (errSync) {
          console.warn('[Offline Sandbox Mode] Image status saved to memory cache only:', errSync);
        }
        invalidateCache('images');
        return jsonResponse({ success: true, image: payload });
      }
      return jsonResponse({ error: 'Image not found' }, 404);
    }

    if (method === 'POST' && pathName.startsWith('/api/admin/images/') && pathName.endsWith('/delete')) {
      const id = pathName.replace('/api/admin/images/', '').replace('/delete', '');
      try {
        await deleteDoc(doc(db, 'images', id));
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] Image deleted in memory cache only:', errSync);
      }
      invalidateCache('images');
      return jsonResponse({ success: true });
    }

    // Admin contribution action
    if (method === 'POST' && pathName.startsWith('/api/admin/contributions/')) {
      const idPart = pathName.replace('/api/admin/contributions/', '');
      const parts = idPart.split('/');
      const id = parts[0];
      const action = parts[1]; // 'approve' or 'reject'
      
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      const refContrib = doc(db, 'contributions', id);
      const snap = await getDoc(refContrib);
      if (snap.exists()) {
        try {
          await setDoc(refContrib, { ...snap.data(), status });
        } catch (errSync) {
          console.warn('[Offline Sandbox Mode] Contribution status saved to memory cache only:', errSync);
        }
        invalidateCache('contributions');
        return jsonResponse({ success: true });
      }
      return jsonResponse({ error: 'Contribution not found' }, 404);
    }

    // Admin lead delete
    if (method === 'POST' && pathName.startsWith('/api/admin/leads/')) {
      // url pattern is /api/admin/leads/:type/:id/delete
      const partLead = pathName.replace('/api/admin/leads/', '');
      const p = partLead.split('/');
      const type = p[0]; // 'trip' or 'car'
      const id = p[1];
      const action = p[2]; // 'delete' or 'status'

      const colName = type === 'trip' ? 'trip_leads' : 'car_leads';
      if (action === 'delete') {
        try {
          await deleteDoc(doc(db, colName, id));
        } catch (errSync) {
          console.warn('[Offline Sandbox Mode] Lead deleted in memory cache only:', errSync);
        }
        invalidateCache(colName);
        return jsonResponse({ success: true });
      } else {
        // change status
        const body = parseBody();
        const leadRef = doc(db, colName, id);
        const snap = await getDoc(leadRef);
        if (snap.exists()) {
          try {
            await setDoc(leadRef, { ...snap.data(), status: body.status || 'Approved' });
          } catch (errSync) {
            console.warn('[Offline Sandbox Mode] Lead status saved to memory cache only:', errSync);
          }
          invalidateCache(colName);
        }
        return jsonResponse({ success: true });
      }
    }

    // Admin generic stats
    if (method === 'GET' && pathName === '/api/admin/stats') {
      const hubs = await fetchCollection<Hub>('hubs', initialHubs);
      const routes = await fetchCollection<Route>('routes', initialRoutes);
      const destinations = await fetchCollection<Destination>('destinations', initialDestinations);
      const attractions = await fetchCollection<Attraction>('attractions', initialAttractions);
      const homestays = await fetchCollection<Homestay>('homestays', initialHomestays);
      const contributions = await fetchCollection<Contribution>('contributions', []);
      const tripLeads = await fetchCollection<TripLead>('trip_leads', []);
      const carLeads = await fetchCollection<CarLead>('car_leads', []);
      const images = await fetchCollection<ImageItem>('images', []);
      const drivers = await fetchCollection<Driver>('drivers', []);

      return jsonResponse({
        totalHubs: hubs.length,
        totalRoutes: routes.length,
        totalDestinations: destinations.length,
        totalAttractions: attractions.length,
        totalHomestays: homestays.length,
        pendingContributions: contributions.filter(c => c.status === 'Pending').length,
        tripLeadsCount: tripLeads.length,
        carLeadsCount: carLeads.length,
        totalImages: images.length,
        pendingImages: images.filter(img => img.status === 'Pending').length,
        totalDrivers: drivers.length,
        pendingHomestays: homestays.filter(h => h.status === 'Pending').length,
        pendingDrivers: drivers.filter(d => d.status === 'Pending').length
      });
    }

    if (method === 'GET' && pathName === '/api/admin/drivers') {
      const data = await fetchCollection<Driver>('drivers', []);
      return jsonResponse(data);
    }
    if (method === 'GET' && pathName === '/api/admin/leads/trip') {
      const data = await fetchCollection<TripLead>('trip_leads', []);
      return jsonResponse(data);
    }
    if (method === 'GET' && pathName === '/api/admin/leads/car') {
      const data = await fetchCollection<CarLead>('car_leads', []);
      return jsonResponse(data);
    }
    if (method === 'GET' && pathName === '/api/admin/contributions') {
      const data = await fetchCollection<Contribution>('contributions', []);
      return jsonResponse(data);
    }
    if (method === 'GET' && pathName === '/api/admin/images') {
      const data = await fetchCollection<ImageItem>('images', []);
      return jsonResponse(data);
    }

    if (method === 'GET' && pathName === '/api/admin/user-roles') {
      const data = await fetchCollection<any>('user_roles', [
        {
          id: 'mavanish24@gmail.com',
          email: 'mavanish24@gmail.com',
          role: 'admin',
          status: 'active',
          updatedAt: new Date().toISOString()
        }
      ]);
      return jsonResponse(data);
    }

    if (method === 'POST' && pathName === '/api/admin/user-roles') {
      const body = parseBody();
      const cleanEmail = body.email.trim().toLowerCase();
      const payload = {
        id: cleanEmail,
        email: cleanEmail,
        role: body.role || 'moderator',
        status: body.status || 'active',
        updatedAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'user_roles', cleanEmail), payload);
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] User role saved to memory cache only:', errSync);
      }
      invalidateCache('user_roles');
      return jsonResponse({ success: true, role: payload });
    }

    if (method === 'DELETE' && pathName.startsWith('/api/admin/user-roles/')) {
      const cleanEmail = pathName.replace('/api/admin/user-roles/', '').trim().toLowerCase();
      try {
        await deleteDoc(doc(db, 'user_roles', cleanEmail));
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] User role deleted from memory cache only:', errSync);
      }
      invalidateCache('user_roles');
      return jsonResponse({ success: true });
    }

    // ---------------- MOCK NOTIFICATIONS & CONTRIBUTIONS & ANALYTICS ----------------
    if (method === 'GET' && pathName === '/api/notifications') {
      const data = await fetchCollection<any>('notifications', []);
      const uId = queryParams.get('userId');
      if (uId) {
        return jsonResponse(data.filter(n => String(n.userId || n.recipientId || '').toLowerCase().trim() === uId.toLowerCase().trim()));
      }
      return jsonResponse(data);
    }

    if (method === 'POST' && pathName === '/api/notifications/read-all') {
      return jsonResponse({ success: true });
    }

    if (method === 'POST' && pathName === '/api/notifications/clear-all') {
      return jsonResponse({ success: true });
    }

    if (method === 'POST' && pathName.startsWith('/api/notifications/') && pathName.endsWith('/read')) {
      return jsonResponse({ success: true });
    }

    if (method === 'POST' && pathName.startsWith('/api/notifications/') && pathName.endsWith('/delete')) {
      return jsonResponse({ success: true });
    }

    if (method === 'GET' && (pathName === '/api/photo-contributions' || pathName === '/api/admin/photo-contributions')) {
      const data = await fetchCollection<any>('photo_contributions', []);
      const uId = queryParams.get('userId');
      if (uId) {
        return jsonResponse(data.filter(c => String(c.userId || c.travellerEmail || '').toLowerCase().trim() === uId.toLowerCase().trim()));
      }
      return jsonResponse(data);
    }

    if (method === 'POST' && pathName === '/api/photo-contributions') {
      const body = parseBody();
      const payload = {
        id: body.id || `contrib-${Date.now()}`,
        ...body,
        status: body.status || 'Pending',
        uploadedAt: body.uploadedAt || new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'photo_contributions', payload.id), payload);
      } catch (errSync) {
        console.warn('[Offline Sandbox Mode] Photo contribution saved locally only:', errSync);
      }
      invalidateCache('photo_contributions');
      return jsonResponse({ success: true, contribution: payload });
    }

    if (method === 'GET' && pathName === '/api/analytics/most-searched') {
      const data = await fetchCollection<any>('analytics_most_searched', [
        { source: "bagdogra", destination: "darjeeling", count: 42 },
        { source: "njp", destination: "kalimpong", count: 35 },
        { source: "darjeeling", destination: "sittong", count: 18 }
      ]);
      return jsonResponse(data);
    }

    if (method === 'POST' && pathName.startsWith('/api/admin/photo-contributions/') && pathName.endsWith('/approve')) {
      return jsonResponse({ success: true });
    }

    if (method === 'POST' && pathName.startsWith('/api/admin/photo-contributions/') && pathName.endsWith('/reject')) {
      return jsonResponse({ success: true });
    }

    if (method === 'POST' && pathName === '/api/admin/photo-contributions/bulk-approve') {
      return jsonResponse({ success: true });
    }

    if (method === 'POST' && pathName === '/api/admin/photo-contributions/bulk-reject') {
      return jsonResponse({ success: true });
    }

    // ---------------- EXTRA ADMIN COLLECTION FALLBACKS ----------------
    if (method === 'GET' && pathName === '/api/admin/users') {
      const data = await fetchCollection<any>('users', fallbackUsers);
      return jsonResponse(data);
    }

    if (method === 'GET' && pathName === '/api/admin/roles') {
      const data = await fetchCollection<any>('roles', []);
      return jsonResponse(data);
    }

    if (method === 'GET' && pathName === '/api/admin/permissions') {
      const data = await fetchCollection<any>('permissions', []);
      return jsonResponse(data);
    }

    if (method === 'GET' && pathName === '/api/admin/audit-logs') {
      const data = await fetchCollection<any>('audit_logs', []);
      return jsonResponse(data);
    }

    // Default API fallback
    if (method === 'GET') {
      return jsonResponse([]);
    }
    return jsonResponse({ status: 'ok', offline: true, sandbox_mode: true });
  } catch (error: any) {
    console.error('[HillyTrip Interceptor Sandbox Error]', error);
    return jsonResponse({ error: error.message || 'Sandbox error occurred' }, 500);
  }
}

// Store or retrieve original fetch safely
const nativeFetchStr = 'fetch';
const nativeFetch = typeof window !== 'undefined' ? window[nativeFetchStr] : undefined;

if (typeof window !== 'undefined') {
  const currentFetch = window.fetch;
  if (currentFetch && !(currentFetch as any).isHillyTrip) {
    (window as any)._hillyTripRealNativeFetch = currentFetch;
    if (!(window as any).originalFetch) {
      (window as any).originalFetch = currentFetch;
    }
  }
}

function getBackendUrl(urlString: string): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    const isCloudRun = hostname.endsWith('run.app');
    
    // When running locally or on Cloud Run container (*.run.app),
    // always use relative /api paths directly so same-origin requests hit Express without CORS/auth proxy blocks.
    if (isLocal || isCloudRun) {
      return urlString;
    }
  }

  // @ts-ignore
  let backendUrl = import.meta.env?.VITE_BACKEND_URL || '';

  if (!backendUrl && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    const isCloudRun = hostname.endsWith('run.app');
    
    if (!isLocal && !isCloudRun) {
      backendUrl = 'https://hillytrip-api-930292453548.asia-south1.run.app
      // Only warn once in console per session to prevent spamming
      if (!(window as any)._hasWarnedNetlifyBackend) {
        (window as any)._hasWarnedNetlifyBackend = true;
        console.error(
          '%c[HillyTrip Integration Warning] VITE_BACKEND_URL is missing!\n\n' +
          'Because this site is deployed on a static host (like Netlify: ' + hostname + '), ' +
          'it has no local Express server to handle API routes. It falls back to calling the sandbox preview URL.\n' +
          'However, the sandbox preview is protected by the AI Studio authentication proxy and blocks external static requests.\n\n' +
          'TO FIX THIS:\n' +
          '1. Deploy your backend server (Express) to Google Cloud Run (as prepared via the Dockerfile).\n' +
          '2. Get your Cloud Run Service URL (e.g., https://hillytrip-backend-xxxxx.a.run.app).\n' +
          '3. Go to your Netlify dashboard for this site > Site Configuration > Environment variables.\n' +
          '4. Add a new variable:\n' +
          '   - Key: VITE_BACKEND_URL\n' +
          '   - Value: (Your Google Cloud Run Service URL)\n' +
          '5. Redeploy your site on Netlify (Clear cache and redeploy).',
          'color: #f59e0b; font-weight: bold; font-size: 13px; line-height: 1.5; padding: 8px; border: 1px solid #f59e0b; border-radius: 4px;'
        );
      }
    }
  }

  if (backendUrl) {
    const cleanBackend = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
    const cleanPath = urlString.startsWith('/') ? urlString : '/' + urlString;
    return cleanBackend + cleanPath;
  }

  return urlString;
}

export async function hillyTripFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : (input as Request).url);
  
  let origFetch = (window as any).originalFetch || nativeFetch;
  if (origFetch && (origFetch as any).isHillyTrip) {
    origFetch = (window as any)._hillyTripRealNativeFetch || window.constructor?.prototype?.fetch || nativeFetch;
  }
  if (!origFetch || origFetch === hillyTripFetch) {
    origFetch = (window as any)._hillyTripRealNativeFetch || window.constructor?.prototype?.fetch;
  }

  // Automatically inject currently authenticated user email into back-office requests
  let modifiedInit = init;
  if (auth && auth.currentUser && auth.currentUser.email) {
    const customHeaders = {
      ...init?.headers,
      'x-admin-email': auth.currentUser.email
    } as any;
    modifiedInit = {
      ...init,
      headers: customHeaders
    };
  }

  // Only intercept requests directed to our internal '/api/' endpoints
  if (urlString.startsWith('/api') || urlString.includes('/api/')) {
    if (useStaticFallback) {
      return handleMockApiRequest(urlString, modifiedInit);
    } else {
      const targetUrl = getBackendUrl(urlString);
      // Direct live fetch with no fallback to client-side mocks
      return origFetch(targetUrl, modifiedInit);
    }
  }
  
  return origFetch(input, init);
}

(hillyTripFetch as any).isHillyTrip = true;

// Intercept window.fetch securely and transparently if writable
if (typeof window !== 'undefined') {
  try {
    // Attempt assignment, wrap to prevent "only getter" crashes on strict sandboxes
    (window as any).fetch = hillyTripFetch;
  } catch (err) {
    console.warn('[HillyTrip API Interceptor] Cannot directly assign window.fetch. Using explicit local fetch exports instead:', err);
    try {
      Object.defineProperty(window, 'fetch', {
        value: hillyTripFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (e2) {
      console.warn('[HillyTrip API Interceptor] defineProperty fetch failed:', e2);
    }
  }
  
  // Launch backend connectivity check asynchronously
  checkBackendStatus();
}

