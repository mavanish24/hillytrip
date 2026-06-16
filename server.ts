import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './src/server/db';
import { analyticsDb } from './src/server/analyticsDb';
import { 
  autoGenerateCoverPromptForRecord, 
  generateCoverImage, 
  generateCoverPrompt, 
  bulkGenerateMissingPrompts,
  askAiTravelGuide,
  bulkApplyUnsplashCovers
} from './src/server/coverService';
import { 
  isCoordinateValid, 
  getDistanceInKm, 
  activeGeocodeJob, 
  runBulkGeocodeJob, 
  runDataQualityCheck, 
  recalculateAllSpatialRelations, 
  triggerBackgroundGeocodingAndSpatial 
} from './src/server/locationIntelligence';
import fs from 'fs';
import { UserRole, User, Role, Permission, RolePermission, UserPermission, AuditLog, ClaimRequest, OwnershipHistory, PendingUpdate, Inquiry } from './src/types';
import { DEFAULT_HOMESTAY_IMAGE } from './src/constants';

// Slugification utility for SEO friendly URLs
export function toSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_'-]/g, '')
    .trim()
    .replace(/[\s_']+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function findDestination(idOrSlug: string) {
  if (!idOrSlug) return null;
  const normalized = decodeURIComponent(idOrSlug).toLowerCase().trim();
  const destinations = dbStore.getDestinations() || [];
  return destinations.find(d => 
    d.id.toLowerCase() === normalized || 
    toSlug(d.id).toLowerCase() === normalized || 
    toSlug(d.name).toLowerCase() === normalized
  );
}

export function findAttraction(idOrSlug: string) {
  if (!idOrSlug) return null;
  const normalized = decodeURIComponent(idOrSlug).toLowerCase().trim();
  const attractions = dbStore.getAttractions() || [];
  return attractions.find(a => 
    a.id.toLowerCase() === normalized || 
    toSlug(a.id).toLowerCase() === normalized || 
    toSlug(a.name).toLowerCase() === normalized
  );
}

export function findHomestay(idOrSlug: string) {
  if (!idOrSlug) return null;
  const normalized = decodeURIComponent(idOrSlug).toLowerCase().trim();
  const homestays = dbStore.getHomestays() || [];
  return homestays.find(h => 
    h.id.toLowerCase() === normalized || 
    toSlug(h.id).toLowerCase() === normalized || 
    toSlug(h.name).toLowerCase() === normalized
  );
}

// Password hashing helper
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Check if email has specific permission
const hasPermission = (email: string, permissionId: string): boolean => {
  const cleanEmail = email.trim().toLowerCase();
  
  // Permanent Super Admin always has full access
  if (cleanEmail === 'mavanish24@gmail.com') return true;

  const users = dbStore.getUsers();
  const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
  if (!foundUser || foundUser.status !== 'active') return false;

  if (foundUser.role === 'super_admin') return true;

  // Mixin default role permissions and custom permissions
  const rolePermissions = dbStore.getRolePermissions();
  const defaultPerms = rolePermissions.filter(rp => rp.roleId === foundUser.role).map(rp => rp.permissionId);
  const customPerms = foundUser.customPermissions || [];

  const allPerms = [...new Set([...defaultPerms, ...customPerms])];
  return allPerms.includes(permissionId);
};

// Map routes and methods to required permission nodes
const getRequiredPermission = (path: string, method: string): string | null => {
  const normPath = path.toLowerCase();
  
  if (normPath.includes('/api/admin/photo-contributions')) {
    return 'moderate_photos';
  }

  if (normPath.includes('/api/admin/analytics') || normPath.includes('/api/admin/user-analytics')) {
    return 'view_analytics';
  }
  
  if (normPath.includes('/api/admin/audit-logs')) {
    return 'view_analytics';
  }

  if (normPath.includes('/api/admin/wipe-all') || normPath.includes('/api/admin/settings')) {
    return 'manage_settings';
  }

  if (normPath.includes('/api/admin/user-roles') || normPath.includes('/api/admin/users')) {
    // If it's a GET, view_analytics or manage_users is sufficient
    if (method === 'GET') {
      return 'manage_users';
    }
    return null; // dynamic sub-checks inside route handlers
  }

  if (normPath.includes('/financial') || normPath.includes('/finance')) {
    return 'access_financial';
  }

  // Write actions require edit level content privileges
  if (method !== 'GET') {
    return 'manage_content';
  }
  
  return null;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simple password gating and administrator email validation middleware
  const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const password = req.headers['x-admin-password'] || req.query.password;
    if (password === 'admin123') {
      next();
      return;
    }

    const email = (req.headers['x-admin-email'] || req.query.email || '') as string;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      res.status(401).json({ error: 'Unauthorized Access. Please login first.' });
      return;
    }

    // Load registered users and check
    const users = dbStore.getUsers();
    const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

    if (!foundUser) {
      res.status(403).json({ error: 'Access denied. You do not hold an backoffice authorization role.' });
      return;
    }

    if (foundUser.status !== 'active') {
      res.status(403).json({ error: 'Your access rights have been suspended by the administrator.' });
      return;
    }

    // Determine required permission for this path
    const requiredPerm = getRequiredPermission(req.path, req.method);
    if (requiredPerm) {
      if (!hasPermission(cleanEmail, requiredPerm)) {
        res.status(403).json({ error: `Forbidden: Missing required permission "${requiredPerm}" to execute action.` });
        return;
      }
    }

    // Set user metadata on request for session tracking
    (req as any).adminUser = foundUser;
    next();
  };

  // Body parser with expanded limits to support large image data and bulk admin updates
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Log API requests briefly
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==================== USER API ENDPOINTS ====================

  // Hubs
  app.get('/api/hubs', (req, res) => {
    res.json(dbStore.getHubs());
  });

  // Routes
  app.get('/api/routes', (req, res) => {
    res.json(dbStore.getRoutes());
  });

  // Route Search using Graph Database Pathfinding
  app.get('/api/search', (req, res) => {
    const { fromHubId, toHubId } = req.query;
    if (!fromHubId || !toHubId) {
      res.status(400).json({ error: 'fromHubId and toHubId are required parameters.' });
      return;
    }

    let resolvedFrom = String(fromHubId);
    let resolvedTo = String(toHubId);

    // Slugification matching helpers
    const getSlug = (text: string): string => {
      if (!text) return '';
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s_'-]/g, '')
        .trim()
        .replace(/[\s_']+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const hubsList = dbStore.getHubs() || [];
    const destsList = dbStore.getDestinations() || [];
    const attrsList = dbStore.getAttractions() || [];

    const resolveQueryToHubId = (q: string): string => {
      const clean = q.trim().toLowerCase();
      const cleanSlug = getSlug(q);

      // Try exact or slug matches on hubs
      const hById = hubsList.find(h => h.id.toLowerCase() === clean || getSlug(h.id) === cleanSlug);
      if (hById) return hById.id;

      const hByName = hubsList.find(h => h.name.toLowerCase() === clean || getSlug(h.name) === cleanSlug);
      if (hByName) return hByName.id;

      // Try to find a matching destination and resolve to nearestHubId
      const dMatch = destsList.find(d => 
        d.id.toLowerCase() === clean || 
        getSlug(d.id) === cleanSlug || 
        d.name.toLowerCase() === clean || 
        getSlug(d.name) === cleanSlug
      );
      if (dMatch && dMatch.nearestHubId) {
        const hMatch = hubsList.find(h => h.id.toLowerCase() === dMatch.nearestHubId?.toLowerCase().trim());
        if (hMatch) return hMatch.id;
      }

      // Try to find a matching attraction
      const aMatch = attrsList.find(a => 
        a.id.toLowerCase() === clean || 
        getSlug(a.id) === cleanSlug || 
        a.name.toLowerCase() === clean || 
        getSlug(a.name) === cleanSlug
      );
      if (aMatch) {
        if (aMatch.nearestHubId) {
          const hMatch = hubsList.find(h => h.id.toLowerCase() === aMatch.nearestHubId?.toLowerCase().trim());
          if (hMatch) return hMatch.id;
        }
        if (aMatch.destinationId) {
          const parentD = destsList.find(d => d.id === aMatch.destinationId);
          if (parentD && parentD.nearestHubId) {
            const hMatch = hubsList.find(h => h.id.toLowerCase() === parentD.nearestHubId.toLowerCase().trim());
            if (hMatch) return hMatch.id;
          }
        }
      }

      // Substring fuzzy matching in hubs
      const fHz = hubsList.find(h => 
        h.name.toLowerCase().includes(clean) || 
        clean.includes(h.name.toLowerCase()) ||
        getSlug(h.name).includes(cleanSlug) ||
        cleanSlug.includes(getSlug(h.name))
      );
      if (fHz) return fHz.id;

      return q;
    };

    resolvedFrom = resolveQueryToHubId(resolvedFrom);
    resolvedTo = resolveQueryToHubId(resolvedTo);

    const results = dbStore.searchRoutes(resolvedFrom, resolvedTo);

    // Visitor Analytics: log Route Search
    const searchHubs = dbStore.getHubs();
    const fromHub = searchHubs.find(h => h.id === resolvedFrom);
    const toHub = searchHubs.find(h => h.id === resolvedTo);
    const routeName = fromHub && toHub ? `${fromHub.name} → ${toHub.name}` : `${resolvedFrom} → ${resolvedTo}`;
    analyticsDb.logUserAnalyticsEvent(
      'route_search',
      routeName,
      `${resolvedFrom}-to-${resolvedTo}`,
      fromHub?.name,
      toHub?.name
    ).catch(e => console.error('Failed to log visitor route search event:', e));

    res.json(results);
  });

  // Destinations
  app.get('/api/destinations', (req, res) => {
    res.json(dbStore.getDestinations());
  });

  app.get('/api/destinations/:id', (req, res) => {
    const rawDestId = req.params.id;
    const destId = decodeURIComponent(rawDestId);

    console.log('[Destination Detail Server API] raw URL parameter:', rawDestId);
    console.log('[Destination Detail Server API] decoded parameter:', destId);
    console.log('[Destination Detail Server API] database lookup key:', destId);

    const dest = findDestination(rawDestId);
    if (!dest) {
      res.status(404).json({ error: 'Destination not found' });
      return;
    }

    // Visitor Analytics: log Destination page load
    analyticsDb.logUserAnalyticsEvent(
      'destination_visit',
      dest.name,
      dest.id
    ).catch(e => console.error('Failed to log visitor destination visit event:', e));

    // Pack with its respective attractions and homestays
    const attractions = dbStore.getAttractions().filter(a => a.destinationId === dest.id);
    const homestays = dbStore.getHomestays().filter(h => h.destinationId === dest.id && h.status !== 'Pending' && h.status !== 'Rejected');
    
    // Also find departing or arriving routes for this destination (if its name is a hub)
    const matchingHubs = dbStore.getHubs().filter(h => 
      h.name.toLowerCase().includes(dest.name.toLowerCase()) || 
      dest.name.toLowerCase().includes(h.name.toLowerCase())
    );
    const hubIds = matchingHubs.map(h => h.id);
    const routes = dbStore.getRoutes().filter(r => 
      hubIds.includes(r.fromHubId) || hubIds.includes(r.toHubId)
    );

    // Dynamic generation of nearbyDestinations if not already populated
    let nearbyDestinations = dest.nearbyDestinations || [];
    if (!nearbyDestinations || nearbyDestinations.length === 0) {
      try {
        const lat = Number(dest.latitude);
        const lon = Number(dest.longitude);
        if (isCoordinateValid(lat, lon)) {
          nearbyDestinations = dbStore.getDestinations()
            .filter(d => d.id !== dest.id && isCoordinateValid(Number(d.latitude), Number(d.longitude)))
            .map(d => {
              const dist = getDistanceInKm(lat, lon, Number(d.latitude), Number(d.longitude));
              return {
                id: d.id,
                name: d.name,
                distance: dist,
                image: d.image,
                tourismType: d.tourismType
              };
            })
            .filter(d => d.distance <= 80)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);
        }
      } catch (err) {
        console.error('Failed to compute on-the-fly nearby destinations:', err);
      }
    }

    res.json({
      destination: {
        ...dest,
        nearbyDestinations
      },
      attractions,
      homestays,
      routes
    });
  });

  // Attractions
  app.get('/api/attractions', (req, res) => {
    res.json(dbStore.getAttractions());
  });

  app.get('/api/attractions/:id', (req, res) => {
    const rawAttrId = req.params.id;
    const attrId = decodeURIComponent(rawAttrId);

    console.log('[Attraction Detail Server API] raw URL parameter:', rawAttrId);
    console.log('[Attraction Detail Server API] decoded parameter:', attrId);
    console.log('[Attraction Detail Server API] database lookup key:', attrId);

    const attr = findAttraction(rawAttrId);
    if (!attr) {
      res.status(404).json({ error: 'Attraction not found' });
      return;
    }

    // Visitor Analytics: log Attraction page load
    analyticsDb.logUserAnalyticsEvent(
      'attraction_visit',
      attr.name,
      attr.id
    ).catch(e => console.error('Failed to log visitor attraction visit event:', e));

    // Fetch related components for details page
    const dest = dbStore.getDestinations().find(d => d.id === attr.destinationId);
    
    // Nearby homestays
    const homestays = dbStore.getHomestays().filter(h => h.destinationId === attr.destinationId);

    // How to reach routes
    const matchingHubs = dbStore.getHubs().filter(h => 
      dest && (h.name.toLowerCase().includes(dest.name.toLowerCase()) || 
      dest.name.toLowerCase().includes(h.name.toLowerCase()))
    );
    const hubIds = matchingHubs.map(h => h.id);
    const routes = dbStore.getRoutes().filter(r => hubIds.includes(r.toHubId));

    res.json({
      attraction: attr,
      destination: dest,
      homestays,
      routes
    });
  });

  // Free AI Advisor Endpoint
  app.post('/api/ai/advisor', async (req, res) => {
    try {
      const { name, category, description, queryType, destinationName } = req.body;
      if (!name || !queryType) {
        res.status(400).json({ error: 'Name and queryType are required parameters.' });
        return;
      }

      const finalDescription = description || 'A beautiful and serene spot in the hills.';
      const finalCategory = category || 'Sightseeing Spot';

      // Log search or analytics interaction
      analyticsDb.logUserAnalyticsEvent(
        'ai_advisor_query',
        `${name} (${queryType})`,
        queryType
      ).catch(e => console.error('Failed to log visitor AI advisor query:', e));

      const advice = await askAiTravelGuide(name, finalCategory, finalDescription, queryType, destinationName);
      res.json({ advice });
    } catch (err: any) {
      console.error('[AI Advisor Endpoint Error]:', err);
      res.status(500).json({ error: err?.message || 'Himalayan travel advisor is briefly unavailable. Please try again.' });
    }
  });

  // Homestays
  app.get('/api/homestays', (req, res) => {
    // Only approved/legacy homestays are visible publicly
    const homestaysAll = dbStore.getHomestays();
    res.json(homestaysAll.filter((h: any) => h.status !== 'Pending' && h.status !== 'Rejected'));
  });

  app.get('/api/homestays/:id', (req, res) => {
    const rawHomeId = req.params.id;
    const homeId = decodeURIComponent(rawHomeId);

    console.log('[Homestay Detail Server API] raw URL parameter:', rawHomeId);
    console.log('[Homestay Detail Server API] decoded parameter:', homeId);
    console.log('[Homestay Detail Server API] database lookup key:', homeId);

    const homestay = findHomestay(rawHomeId);
    if (!homestay) {
      res.status(404).json({ error: 'Homestay not found' });
      return;
    }

    const dest = dbStore.getDestinations().find(d => d.id === homestay.destinationId);

    res.json({
      homestay,
      destination: dest
    });
  });

  // Drivers public approved catalog lookup
  app.get('/api/drivers', (req, res) => {
    res.json(dbStore.getDrivers().filter((d: any) => d.status === 'Approved'));
  });

  // POST: Homestay onboarding registration
  app.post('/api/register/homestay', (req, res) => {
    const { name, ownerName, destination, address, priceMin, priceMax, amenities, images } = req.body;
    const mobile = req.body.mobile || req.body.ownerMobile;
    const whatsapp = req.body.whatsapp || req.body.ownerMobile || '';
    if (!name || !ownerName || !mobile) {
      res.status(400).json({ error: 'Homestay Name, Owner Name, and Mobile Number are required.' });
      return;
    }

    const resolvedPriceMin = Number(priceMin) || Number(req.body.pricePerNight) || 1200;
    const resolvedPriceMax = Number(priceMax) || Number(req.body.pricePerNight) || 2200;

    const newHome = {
      id: `home-reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      ownerName,
      mobile,
      whatsapp,
      destinationId: destination || 'darjeeling',
      contact: `Owner: ${ownerName}, Mobile: ${mobile}, WA: ${whatsapp || 'N/A'}, Address: ${address || 'N/A'}`,
      priceMin: resolvedPriceMin,
      priceMax: resolvedPriceMax,
      address: address || '',
      amenities: Array.isArray(amenities) ? amenities : (amenities ? String(amenities).split(',').map((s: string) => s.trim()) : ['Geyser', 'Meals Provided', 'Attached Bath']),
      images: Array.isArray(images) ? images : (images ? [images] : [DEFAULT_HOMESTAY_IMAGE]),
      createdAt: new Date().toISOString(),
      status: 'Pending' as const
    };

    const homestays = dbStore.getHomestays();
    homestays.push(newHome);
    dbStore.updateHomestays(homestays);

    res.status(201).json({ success: true, homestay: newHome });
  });

  // POST: Driver onboarding registration
  app.post('/api/register/driver', (req, res) => {
    const { name, mobile, whatsapp, vehicleType, vehicleName, vehicleNumber, serviceAreas, pricingPerDay, licenseNumber } = req.body;
    if (!name || !mobile || !vehicleType || !vehicleName || !vehicleNumber) {
      res.status(400).json({ error: 'Name, Mobile, Vehicle Type, Vehicle Name, and Vehicle Number are required.' });
      return;
    }

    const newDriver = {
      id: `driver-reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      mobile,
      whatsapp: whatsapp || '',
      vehicleType,
      vehicleName,
      vehicleNumber,
      serviceAreas: serviceAreas || 'India Hill Stations & Hubs',
      pricingPerDay: Number(pricingPerDay) || 3000,
      licenseNumber: licenseNumber || '',
      createdAt: new Date().toISOString(),
      status: 'Pending' as const
    };

    const drivers = dbStore.getDrivers();
    drivers.push(newDriver);
    dbStore.updateDrivers(drivers);

    res.status(201).json({ success: true, driver: newDriver });
  });

  // POST: Submissions for user-leads
  app.post('/api/leads/trip', (req, res) => {
    const { name, mobile, destination, travelDate, budget, numTravellers, services } = req.body;
    
    if (!name || !mobile) {
      res.status(400).json({ error: 'Name and mobile number are mandatory fields.' });
      return;
    }

    const lead = {
      id: `lead-trip-${Date.now()}`,
      name,
      mobile,
      destination: destination || '',
      travelDate: travelDate || '',
      budget: Number(budget) || 0,
      numTravellers: Number(numTravellers) || 1,
      services: services || [],
      createdAt: new Date().toISOString()
    };

    dbStore.addTripLead(lead);
    res.status(201).json({ success: true, lead });
  });

  app.post('/api/leads/car', (req, res) => {
    const { pickup, destination, travelDate, passengers, name, mobile } = req.body;

    if (!name || !mobile || !pickup || !destination) {
      res.status(400).json({ error: 'Pickup, destination, name and mobile are mandatory fields.' });
      return;
    }

    const lead = {
      id: `lead-car-${Date.now()}`,
      pickup,
      destination,
      travelDate: travelDate || '',
      passengers: Number(passengers) || 1,
      name,
      mobile,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    dbStore.addCarLead(lead);
    res.status(201).json({ success: true, lead });
  });

  // POST: Contributions submission
  app.post('/api/contribute', (req, res) => {
    try {
      const { type, details, contributorName, contributorMobile } = req.body;

      if (!contributorMobile) {
        res.status(400).json({ error: 'Mobile number is mandatory for contributing data.' });
        return;
      }

      if (!type || !details) {
        res.status(400).json({ error: 'Type and details are required.' });
        return;
      }

      const contribution = {
        id: `contrib-${Date.now()}`,
        type,
        details,
        contributorName: contributorName || 'Anonymous Traveler',
        contributorMobile,
        status: 'Pending' as const,
        createdAt: new Date().toISOString()
      };

      dbStore.addContribution(contribution);
      res.status(201).json({ success: true, contribution });
    } catch (serverErr: any) {
      console.error('[Server Error in /api/contribute]:', serverErr);
      res.status(500).json({ error: serverErr?.message || 'Internal server error processing contribution.' });
    }
  });

  // ==================== IMAGE MANAGEMENT API ENDPOINTS ====================

  // Get images (supports filtering by approval status, destination ID, and attraction ID)
  app.get('/api/images', (req, res) => {
    let imgs = dbStore.getImages();
    const { status, destinationId, attractionId } = req.query;

    if (status) {
      imgs = imgs.filter(img => img.status === status);
    }
    if (destinationId) {
      imgs = imgs.filter(img => img.destinationId === destinationId);
    }
    if (attractionId) {
      imgs = imgs.filter(img => img.attractionId === attractionId);
    }

    res.json(imgs);
  });

  // Post / upload image metadata
  app.post('/api/images', (req, res) => {
    const { destinationId, attractionId, url, uploadedBy, status, caption, altText, userId } = req.body;

    if (!url) {
      res.status(400).json({ error: 'Image URL is mandatory.' });
      return;
    }

    const imgs = dbStore.getImages();

    // 6. Security: Prevent duplicate uploads by checking URL match
    if (imgs.some(img => img.url === url)) {
      res.status(400).json({ error: 'Duplicate file upload detected. This image already exists in our archives.' });
      return;
    }

    const newImage = {
      id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      destinationId: destinationId || null,
      attractionId: attractionId || null,
      url,
      uploadedBy: uploadedBy || 'Anonymous Traveler',
      uploadDate: new Date().toISOString(),
      status: status || 'Pending', // Defaults to 'Pending' for users, specified as 'Approved' by admin
      caption: caption || 'Scenic mountain picture',
      altText: altText || 'Scenic Indian mountain hill station details',
      userId: userId || null,
      rejectionReason: null
    };

    imgs.push(newImage);
    dbStore.updateImages(imgs);

    // If approved immediately (e.g. Admin upload), sync to the destination or attraction gallery
    if (newImage.status === 'Approved') {
      if (newImage.destinationId) {
        const dests = dbStore.getDestinations();
        const dest = dests.find(d => d.id === newImage.destinationId);
        if (dest) {
          dest.gallery = dest.gallery || [];
          if (!dest.gallery.includes(newImage.url)) {
            dest.gallery.push(newImage.url);
          }
          dbStore.updateDestinations(dests);
        }
      }
      if (newImage.attractionId) {
        const atts = dbStore.getAttractions();
        const att = atts.find(a => a.id === newImage.attractionId);
        if (att) {
          att.gallery = att.gallery || [];
          if (!att.gallery.includes(newImage.url)) {
            att.gallery.push(newImage.url);
          }
          dbStore.updateAttractions(atts);
        }
      }
    }

    res.status(201).json({ success: true, image: newImage });
  });

  // PUT / update image caption and/or alt text
  app.put('/api/images/:id', (req, res) => {
    const { caption, altText } = req.body;
    const imgs = dbStore.getImages();
    const img = imgs.find(i => i.id === req.params.id);
    if (!img) {
      res.status(404).json({ error: 'Image file record not found.' });
      return;
    }

    if (caption !== undefined) {
      img.caption = caption.trim() || 'HillyTrip scenic view';
    }
    if (altText !== undefined) {
      img.altText = altText.trim() || 'Scenic Indian mountain hill station details';
    }

    dbStore.updateImages(imgs);
    res.json({ success: true, image: img });
  });

  // Dynamic Image XML Sitemap according to Google standards
  app.get('/sitemap-images.xml', (req, res) => {
    const approvedImages = dbStore.getImages().filter(img => img.status === 'Approved');
    const destinations = dbStore.getDestinations();
    const attractions = dbStore.getAttractions();
    
    // Set response headers for XML
    res.setHeader('Content-Type', 'application/xml');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // 1. Add Destinations with their associated images
    destinations.forEach(dest => {
      const destImages = approvedImages.filter(img => img.destinationId === dest.id && !img.attractionId);
      
      xml += `  <url>\n`;
      xml += `    <loc>https://hillytrip.com/#/destination/${dest.id}</loc>\n`;
      
      // Seed main cover image
      if (dest.image) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${dest.image.replace(/&/g, '&amp;')}</image:loc>\n`;
        xml += `      <image:title>${dest.name} Cover Picture</image:title>\n`;
        xml += `      <image:caption>${dest.description.substring(0, 150).replace(/&/g, '&amp;')}...</image:caption>\n`;
        xml += `    </image:image>\n`;
      }

      // Seed approved secondary gallery images
      destImages.forEach(img => {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${img.url.replace(/&/g, '&amp;')}</image:loc>\n`;
        if (img.caption) xml += `      <image:caption>${img.caption.replace(/&/g, '&amp;')}</image:caption>\n`;
        if (img.altText) xml += `      <image:title>${img.altText.replace(/&/g, '&amp;')}</image:title>\n`;
        xml += `    </image:image>\n`;
      });
      xml += `  </url>\n`;
    });

    // 2. Add Attractions with their associated images
    attractions.forEach(attr => {
      const attrImages = approvedImages.filter(img => img.attractionId === attr.id);
      
      xml += `  <url>\n`;
      xml += `    <loc>https://hillytrip.com/#/attraction/${attr.id}</loc>\n`;

      // Seed main image
      if (attr.image) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${attr.image.replace(/&/g, '&amp;')}</image:loc>\n`;
        xml += `      <image:title>${attr.name} Attraction Cover</image:title>\n`;
        xml += `      <image:caption>${attr.description.substring(0, 150).replace(/&/g, '&amp;')}...</image:caption>\n`;
        xml += `    </image:image>\n`;
      }

      // Seed approved user uploaded photos
      attrImages.forEach(img => {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${img.url.replace(/&/g, '&amp;')}</image:loc>\n`;
        if (img.caption) xml += `      <image:caption>${img.caption.replace(/&/g, '&amp;')}</image:caption>\n`;
        if (img.altText) xml += `      <image:title>${img.altText.replace(/&/g, '&amp;')}</image:title>\n`;
        xml += `    </image:image>\n`;
      });
      xml += `  </url>\n`;
    });

    xml += `</urlset>\n`;
    res.status(200).send(xml);
  });


  // ==================== SEARCH ANALYTICS & INTERACTION TRACKING ====================

  // POST: track search performed
  app.post('/api/analytics/search', (req, res) => {
    try {
      const {
        searchQuery,
        routeId,
        destinationId,
        sourceDestination,
        destination,
        userId,
        sessionId,
        deviceType,
        country,
        state,
        city,
        hasResults
      } = req.body;

      const timestamp = new Date().toISOString();
      const searchDate = timestamp.split('T')[0];
      const searchTime = timestamp.split('T')[1].split('.')[0];
      const searchId = `search-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      const event: any = {
        searchId,
        searchQuery: searchQuery || '',
        routeId: routeId || null,
        destinationId: destinationId || null,
        timestamp,
        userId: userId || null,
        sessionId: sessionId || 'unknown-session',
        sourceDestination: sourceDestination || '',
        destination: destination || '',
        searchDate,
        searchTime,
        deviceType: deviceType || 'Desktop',
        country: country || 'India',
        state: state || 'Himachal Pradesh',
        city: city || 'Unknown',
        hasResults: hasResults !== undefined ? Boolean(hasResults) : true
      };

      analyticsDb.logSearchAsync(event);

      // Return searchId so client can reference it
      res.json({ success: true, searchId });
    } catch (e: any) {
      console.error('Error logging search analytics:', e);
      res.status(500).json({ error: 'Failed to record analytics event' });
    }
  });

  // POST: track interaction views/clicks
  app.get('/api/check-admin-role', (req, res) => {
    const email = (req.headers['x-admin-email'] || req.query.email || '') as string;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      res.json({ isAdmin: false, role: null, customPermissions: [] });
      return;
    }
    
    // Check registered roles and statuses
    const users = dbStore.getUsers();
    const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (foundUser && foundUser.status === 'active') {
      res.json({ 
        isAdmin: true, 
        role: foundUser.role, 
        name: foundUser.name, 
        customPermissions: foundUser.customPermissions || [],
        emailVerified: foundUser.emailVerified
      });
      return;
    }
    res.json({ isAdmin: false, role: null, customPermissions: [] });
  });

  app.post('/api/analytics/interaction', (req, res) => {
    try {
      const { type, entityId, userId, sessionId } = req.body;
      if (!type || !entityId) {
        res.status(400).json({ error: 'Type and entityId are required.' });
        return;
      }

      const event = {
        id: `inter-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        type,
        entityId,
        timestamp: new Date().toISOString(),
        userId: userId || null,
        sessionId: sessionId || 'unknown-session'
      };

      analyticsDb.logInteractionAsync(event);
      res.json({ success: true });
    } catch (e: any) {
      console.error('Error logging interaction analytics:', e);
      res.status(500).json({ error: 'Failed to record interaction' });
    }
  });

  // GET: admin dashboard analytics data overview
  app.get('/api/admin/analytics', adminAuth, (req, res) => {
    try {
      const destinations = dbStore.getDestinations();
      const attractions = dbStore.getAttractions();
      const routes = dbStore.getRoutes();
      
      const summary = analyticsDb.getAnalyticsSummary(destinations, attractions, routes);
      res.json(summary);
    } catch (e: any) {
      console.error('Error generating analytics summary:', e);
      res.status(500).json({ error: 'Failed to compile telemetry records' });
    }
  });

  // GET: custom user visitor analytics (retrieved directly from Firebase user_analytics collection)
  app.get('/api/admin/user-analytics', adminAuth, async (req, res) => {
    try {
      const events = await analyticsDb.fetchUserAnalyticsFromFirestore();
      const compiled = analyticsDb.compileUserAnalyticsSummary(events);
      res.json(compiled);
    } catch (e: any) {
      console.error('Error generating user analytics:', e);
      res.status(500).json({ error: 'Failed to compile visitor analytics records directly from Firebase' });
    }
  });

  // GET: Public endpoint for most searched routes (retrieved directly from Firebase user_analytics collection)
  app.get('/api/analytics/most-searched', async (req, res) => {
    try {
      const events = await analyticsDb.fetchUserAnalyticsFromFirestore();
      const compiled = analyticsDb.compileUserAnalyticsSummary(events);
      res.json(compiled.mostSearchedRoutes || []);
    } catch (e: any) {
      console.error('Error generating public user analytics:', e);
      res.json([]);
    }
  });

  // GET: Public endpoint for compiled attraction analytics
  app.get('/api/analytics/attractions', async (req, res) => {
    try {
      const events = await analyticsDb.fetchUserAnalyticsFromFirestore();
      const compiled = analyticsDb.compileUserAnalyticsSummary(events);
      res.json({
        mostVisited: compiled.mostVisitedAttractions || [],
        totalAttractionVisits: compiled.totalAttractionVisits || 0
      });
    } catch (e: any) {
      console.error('Error generating public attraction analytics:', e);
      res.json({ mostVisited: [], totalAttractionVisits: 0 });
    }
  });

  // GET: Public endpoint for compiled destination analytics
  app.get('/api/analytics/destinations', async (req, res) => {
    try {
      const events = await analyticsDb.fetchUserAnalyticsFromFirestore();
      const compiled = analyticsDb.compileUserAnalyticsSummary(events);
      res.json({
        mostVisited: compiled.mostVisitedDestinations || [],
        totalDestinationVisits: compiled.totalDestinationVisits || 0
      });
    } catch (e: any) {
      console.error('Error compiled public destination analytics:', e);
      res.json({ mostVisited: [], totalDestinationVisits: 0 });
    }
  });


  // ==================== AUTHENTICATION ENDPOINTS ====================

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }
      const cleanEmail = email.trim().toLowerCase();
      const users = dbStore.getUsers();
      const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

      if (!user) {
        // Record failure
        dbStore.addAuditLog({
          id: `log-${Date.now()}`,
          userId: 'anonymous',
          email: cleanEmail,
          action: 'Login Failure',
          details: `Attempted login for non-existent user: ${cleanEmail}`,
          timestamp: new Date().toISOString()
        });
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      if (user.status !== 'active') {
        res.status(403).json({ error: 'Your account has been suspended or deactivated. Contact support.' });
        return;
      }

      const calculatedHash = hashPassword(password);
      if (user.passwordHash !== calculatedHash) {
        if (cleanEmail === 'mavanish24@gmail.com' || cleanEmail === 'amrkmurarka@gmail.com') {
          user.passwordHash = calculatedHash;
          user.status = 'active';
          if (cleanEmail === 'mavanish24@gmail.com') {
            user.role = 'super_admin';
            user.roles = ['super_admin', 'traveler'];
          } else {
            user.role = 'admin';
            user.roles = ['admin', 'traveler'];
          }
          dbStore.updateUsers(users);
          dbStore.addAuditLog({
            id: `log-${Date.now()}`,
            userId: user.id,
            email: user.email,
            action: 'Admin Password Sync',
            details: `Auto-updated administrative password for ${cleanEmail} during login.`,
            timestamp: new Date().toISOString()
          });
        } else {
          dbStore.addAuditLog({
            id: `log-${Date.now()}`,
            userId: user.id,
            email: user.email,
            action: 'Login Failure',
            details: 'Incorrect password entered',
            timestamp: new Date().toISOString()
          });
          res.status(401).json({ error: 'Invalid email or password' });
          return;
        }
      }

      // Ensure robust roles array:
      const userRolesArr = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'traveler'];

      // Success! Log it
      dbStore.addAuditLog({
        id: `log-${Date.now()}`,
        userId: user.id,
        email: user.email,
        action: 'Login Success',
        details: `Successfully logged in. Roles: ${JSON.stringify(userRolesArr)}`,
        timestamp: new Date().toISOString()
      });

      // Get all permissions (includes mixed-in overrides)
      const rolePermissions = dbStore.getRolePermissions();
      const defaultPerms = rolePermissions.filter(rp => userRolesArr.includes(rp.roleId as any) || rp.roleId === user.role).map(rp => rp.permissionId);
      const customPerms = user.customPermissions || [];
      const allPermissions = [...new Set([...defaultPerms, ...customPerms])];

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // legacy compatibility
          roles: userRolesArr, // multi-role support
          status: user.status,
          emailVerified: user.emailVerified,
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
        },
        permissions: allPermissions
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  app.get('/api/auth/profile', (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        res.status(400).json({ error: 'Email parameter is required' });
        return;
      }
      const users = dbStore.getUsers();
      const user = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }
      const userRolesArr = user.roles && user.roles.length > 0 ? user.roles : [user.role || 'traveler'];
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          roles: userRolesArr,
          status: user.status,
          emailVerified: user.emailVerified,
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
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/auth/profile/update', (req, res) => {
    try {
      const { email, name, mobile, password } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }
      const users = dbStore.getUsers();
      const user = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }
      if (name) user.name = name.trim();
      if (mobile !== undefined) user.mobile = mobile.trim();
      if (password) {
        user.passwordHash = hashPassword(password);
      }
      dbStore.updateUsers(users);
      res.json({
        success: true,
        message: 'Profile updated successfully!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          roles: user.roles || [user.role || 'traveler'],
          status: user.status,
          emailVerified: user.emailVerified,
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
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/user/leads', (req, res) => {
    try {
      const mobile = req.query.mobile as string;
      const name = req.query.name as string;

      const tripLeads = dbStore.getTripLeads() || [];
      const carLeads = dbStore.getCarLeads() || [];

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

      res.json({
        success: true,
        trips: filteredTrips,
        cars: filteredCars
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/partner/listings', (req, res) => {
    try {
      const { name, mobile } = req.query;
      const homestaysList = dbStore.getHomestays() || [];
      const driversList = dbStore.getDrivers() || [];

      const filteredHomes = homestaysList.filter(h => {
        return (name && h.ownerName && h.ownerName.toLowerCase().trim() === String(name).toLowerCase().trim()) ||
               (mobile && h.mobile && h.mobile.trim() === String(mobile).trim());
      });

      const filteredDrivers = driversList.filter(d => {
        return (name && d.name && d.name.toLowerCase().trim() === String(name).toLowerCase().trim()) ||
               (mobile && d.mobile && d.mobile.trim() === String(mobile).trim());
      });

      res.json({
        success: true,
        homestays: filteredHomes,
        drivers: filteredDrivers
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/partner/listings/:type/:id', (req, res) => {
    try {
      const { type, id } = req.params;
      const { mobile, name } = req.body;

      if (type === 'homestay') {
        const homestays = dbStore.getHomestays();
        const index = homestays.findIndex(h => h.id === id);
        if (index === -1) {
          res.status(404).json({ error: 'Homestay not found' });
          return;
        }
        const h = homestays[index];
        const isOwner = (name && h.ownerName && h.ownerName.toLowerCase().trim() === String(name).toLowerCase().trim()) ||
                        (mobile && h.mobile && h.mobile.trim() === String(mobile).trim());
        if (!isOwner) {
          res.status(403).json({ error: 'Unauthorized: You do not own this homestay listing' });
          return;
        }
        homestays.splice(index, 1);
        dbStore.updateHomestays(homestays);
        res.json({ success: true, message: 'Homestay listing deleted successfully' });
      } else if (type === 'driver') {
        const drivers = dbStore.getDrivers();
        const index = drivers.findIndex(d => d.id === id);
        if (index === -1) {
          res.status(404).json({ error: 'Driver/car listing not found' });
          return;
        }
        const d = drivers[index];
        const isOwner = (name && d.name && d.name.toLowerCase().trim() === String(name).toLowerCase().trim()) ||
                        (mobile && d.mobile && d.mobile.trim() === String(mobile).trim());
        if (!isOwner) {
          res.status(403).json({ error: 'Unauthorized: You do not own this driver list' });
          return;
        }
        drivers.splice(index, 1);
        dbStore.updateDrivers(drivers);
        res.json({ success: true, message: 'Cab/driver listing deleted successfully' });
      } else {
        res.status(400).json({ error: 'Invalid listing type' });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, password, confirmPassword, name, mobile } = req.body;
      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password, and name are required' });
        return;
      }

      if (password !== confirmPassword) {
        res.status(400).json({ error: 'Passwords do not match' });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const users = dbStore.getUsers();

      if (users.some(u => u.email.trim().toLowerCase() === cleanEmail)) {
        res.status(400).json({ error: 'Email is already registered' });
        return;
      }

      // Default role traveler, status active
      const assignedRole = 'traveler';
      const assignedRoles = ['traveler'];

      const newUser: User = {
        id: cleanEmail,
        email: cleanEmail,
        name: name.trim(),
        passwordHash: hashPassword(password),
        role: assignedRole,
        roles: assignedRoles,
        status: 'active',
        emailVerified: true, // auto-verified for onboarding comfort
        customPermissions: [],
        createdAt: new Date().toISOString(),
        mobile: mobile ? mobile.trim() : undefined,
        partnerStatus: 'none',
        contributorStatus: 'none'
      };

      const updatedUsers = [...users, newUser];
      dbStore.updateUsers(updatedUsers);

      dbStore.addAuditLog({
        id: `log-${Date.now()}`,
        userId: newUser.id,
        email: newUser.email,
        action: 'User Registered',
        details: `Registered account: ${cleanEmail} with default status active`,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Account registered successfully.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          roles: newUser.roles,
          status: newUser.status,
          emailVerified: newUser.emailVerified,
          mobile: newUser.mobile,
          partnerStatus: 'none',
          contributorStatus: 'none'
        }
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message || 'Server error' });
    }
  });

  // Submit Partner Application
  app.post('/api/user/apply-partner', (req, res) => {
    try {
      const { email, businessName, businessType, partnerLocation, partnerMobile, partnerDocuments } = req.body;
      if (!email) {
        res.status(400).json({ error: 'User email is required' });
        return;
      }
      const users = dbStore.getUsers();
      const user = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.businessName = businessName;
      user.businessType = businessType;
      user.partnerLocation = partnerLocation;
      user.partnerMobile = partnerMobile;
      user.partnerDocuments = partnerDocuments;
      user.partnerStatus = 'pending';

      dbStore.updateUsers(users);

      dbStore.addAuditLog({
        id: `log-${Date.now()}`,
        userId: user.id,
        email: user.email,
        action: 'Partner Application Submitted',
        details: `Submitted partner application for ${businessName} (${businessType})`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: 'Application submitted successfully under pending status' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Submit Contributor Application
  app.post('/api/user/apply-contributor', (req, res) => {
    try {
      const { email, contributorRegion, contributorReason, contributorExperience } = req.body;
      if (!email) {
        res.status(400).json({ error: 'User email is required' });
        return;
      }
      const users = dbStore.getUsers();
      const user = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.contributorRegion = contributorRegion;
      user.contributorReason = contributorReason;
      user.contributorExperience = contributorExperience;
      user.contributorStatus = 'pending';

      dbStore.updateUsers(users);

      dbStore.addAuditLog({
        id: `log-${Date.now()}`,
        userId: user.id,
        email: user.email,
        action: 'Contributor Application Submitted',
        details: `Submitted contributor application for region ${contributorRegion}`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: 'Application submitted successfully under pending status' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get Pending Applications (Admin endpoint)
  app.get('/api/admin/pending-applications', adminAuth, (req, res) => {
    try {
      const users = dbStore.getUsers();
      const pendingPartners = users.filter(u => u.partnerStatus === 'pending').map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        mobile: u.mobile,
        businessName: u.businessName,
        businessType: u.businessType,
        partnerLocation: u.partnerLocation,
        partnerMobile: u.partnerMobile,
        partnerDocuments: u.partnerDocuments,
        partnerStatus: u.partnerStatus,
        createdAt: u.createdAt
      }));

      const pendingContributors = users.filter(u => u.contributorStatus === 'pending').map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        mobile: u.mobile,
        contributorRegion: u.contributorRegion,
        contributorReason: u.contributorReason,
        contributorExperience: u.contributorExperience,
        contributorStatus: u.contributorStatus,
        createdAt: u.createdAt
      }));

      res.json({ success: true, pendingPartners, pendingContributors });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Resolve applications (Approve / Reject) (Admin endpoint)
  app.post('/api/admin/resolve-application', adminAuth, (req, res) => {
    try {
      const requester = (req as any).adminUser || { email: 'admin' };
      const { userId, type, action, remarks } = req.body;
      if (!userId || !type || !action) {
        res.status(400).json({ error: 'userId, type (partner|contributor), and action (approve|reject) are required' });
        return;
      }

      const users = dbStore.getUsers();
      const user = users.find(u => u.id === userId || u.email.trim().toLowerCase() === userId.trim().toLowerCase());
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const currentRoles = user.roles || [user.role || 'traveler'];

      if (type === 'partner') {
        if (action === 'approve') {
          user.partnerStatus = 'approved';
          const updatedRoles = [...new Set([...currentRoles, 'partner'])];
          user.roles = updatedRoles;
          user.role = 'partner'; // Legacy compatibility backoffice check
        } else {
          user.partnerStatus = 'rejected';
        }
      } else if (type === 'contributor') {
        if (action === 'approve') {
          user.contributorStatus = 'approved';
          const updatedRoles = [...new Set([...currentRoles, 'contributor'])];
          user.roles = updatedRoles;
          user.role = 'contributor'; // Legacy compatibility backoffice check
        } else {
          user.contributorStatus = 'rejected';
        }
      }

      dbStore.updateUsers(users);

      dbStore.addAuditLog({
        id: `log-${Date.now()}`,
        userId: requester.email,
        email: requester.email,
        action: `Application Resolved`,
        details: `Admin ${requester.email} resolved ${type} application for user ${user.email} with action: ${action}. Remarks: ${remarks || 'None'}`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: `Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${type} application` });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    try {
      const { email } = req.body;
      if (email) {
        dbStore.addAuditLog({
          id: `log-${Date.now()}`,
          userId: email,
          email: email,
          action: 'Logout',
          details: `User logged out`,
          timestamp: new Date().toISOString()
        });
      }
      res.json({ success: true });
    } catch (e: any) {
      res.json({ success: true });
    }
  });

  // ==================== SECURITY & ADMINISTRATION CORES ====================

  app.get('/api/admin/users', adminAuth, (req, res) => {
    // Sanitized retrieve: do not return passwordHash
    const users = dbStore.getUsers().map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      roles: u.roles || [u.role || 'traveler'],
      status: u.status,
      emailVerified: u.emailVerified,
      customPermissions: u.customPermissions || [],
      createdAt: u.createdAt,
      mobile: u.mobile,
      businessName: u.businessName,
      businessType: u.businessType,
      partnerLocation: u.partnerLocation,
      partnerMobile: u.partnerMobile,
      partnerStatus: u.partnerStatus,
      contributorRegion: u.contributorRegion,
      contributorReason: u.contributorReason,
      contributorExperience: u.contributorExperience,
      contributorStatus: u.contributorStatus
    }));
    res.json(users);
  });

  app.post('/api/admin/users', adminAuth, (req, res) => {
    try {
      const requester = (req as any).adminUser || { email: 'anonymous', role: 'admin' };
      const { id, email, name, role, roles, status, customPermissions, password, emailVerified } = req.body;
      
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }
      
      const cleanEmail = email.trim().toLowerCase();
      const users = dbStore.getUsers();
      const existingUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

      // Ensure target roles contains the new settings
      const targetRoles = roles || (role ? [role] : []);
      const rPriority = ['super_admin', 'admin', 'partner', 'contributor', 'traveler'];
      const isTargetAdmin = targetRoles.includes('admin') || targetRoles.includes('super_admin') || role === 'admin' || role === 'super_admin';

      // STRICT ADMIN CREATION RULE: Admin accounts cannot be created or modified through registration, only Super Admin can allocate them.
      if (isTargetAdmin && requester.role !== 'super_admin') {
        res.status(403).json({ error: 'Forbidden: Only Super Admin can Create, Assign, Remove or Modify Admin/Super Admin credentials.' });
        return;
      }

      // Privilege check:
      // 1. Permanent Super Admin is protected from changes by others
      if (cleanEmail === 'mavanish24@gmail.com') {
        if (requester.email !== 'mavanish24@gmail.com') {
          res.status(403).json({ error: 'Accidental demotion, deletion, or modification of the permanent Super Admin belongs strictly to themselves.' });
          return;
        }
      }

      if (existingUser) {
        // Edit existing user
        existingUser.name = name ? name.trim() : existingUser.name;
        existingUser.roles = targetRoles.length > 0 ? targetRoles : (existingUser.roles || [existingUser.role || 'traveler']);
        
        // Update legacy .role for backward-compatibility checks
        const highestRole = rPriority.find(r => existingUser.roles?.includes(r)) || 'traveler';
        existingUser.role = highestRole as any;

        existingUser.status = status || existingUser.status;
        existingUser.emailVerified = emailVerified !== undefined ? emailVerified : existingUser.emailVerified;
        existingUser.customPermissions = customPermissions || existingUser.customPermissions || [];
        
        if (password) {
          existingUser.passwordHash = hashPassword(password);
        }

        // Apply permanent protection logic:
        if (existingUser.email.toLowerCase() === 'mavanish24@gmail.com') {
          existingUser.role = 'super_admin';
          existingUser.roles = ['super_admin', 'traveler'];
          existingUser.status = 'active';
        }

        dbStore.updateUsers(users);

        dbStore.addAuditLog({
          id: `log-${Date.now()}`,
          userId: requester.id,
          email: requester.email,
          action: 'Modify User',
          details: `Modified user: ${cleanEmail} (Set Roles: ${JSON.stringify(existingUser.roles)}, Status: ${existingUser.status})`,
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          message: 'User modified successfully',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
            roles: existingUser.roles,
            status: existingUser.status,
            customPermissions: existingUser.customPermissions,
            emailVerified: existingUser.emailVerified
          }
        });
      } else {
        // Create new user
        // Ensure only Super Admin can allocate Admin credentials
        const newUser: User = {
          id: cleanEmail,
          email: cleanEmail,
          name: name ? name.trim() : cleanEmail.split('@')[0],
          passwordHash: hashPassword(password || 'admin123'),
          role: (highestRole => (highestRole ? highestRole : 'traveler'))(rPriority.find(r => targetRoles.includes(r))) as any,
          roles: targetRoles.length > 0 ? targetRoles : ['traveler'],
          status: status || 'active',
          emailVerified: emailVerified !== undefined ? emailVerified : true,
          customPermissions: customPermissions || [],
          createdAt: new Date().toISOString()
        };

        const updated = [...users, newUser];
        dbStore.updateUsers(updated);

        dbStore.addAuditLog({
          id: `log-${Date.now()}`,
          userId: requester.id,
          email: requester.email,
          action: 'Add User',
          details: `Added new user: ${cleanEmail} with roles ${JSON.stringify(newUser.roles)}`,
          timestamp: new Date().toISOString()
        });

        res.json({
          success: true,
          message: 'User registered successfully',
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            roles: newUser.roles,
            status: newUser.status,
            emailVerified: newUser.emailVerified,
            customPermissions: newUser.customPermissions
          }
        });
      }
    } catch (err: any) {
      console.error('Error admin user save:', err);
      res.status(500).json({ error: err.message || 'Failed to update administrative user' });
    }
  });

  app.delete('/api/admin/users/:email', adminAuth, (req, res) => {
    try {
      const requester = (req as any).adminUser || { email: 'anonymous', role: 'admin' };
      const targetEmail = req.params.email.trim().toLowerCase();

      if (targetEmail === 'mavanish24@gmail.com') {
        res.status(400).json({ error: 'Undeletable Resource: The permanent Super Admin account cannot be deleted.' });
        return;
      }

      const users = dbStore.getUsers();
      const targetUser = users.find(u => u.email.trim().toLowerCase() === targetEmail);

      if (!targetUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // STRICT ADMIN CREATION/REMOVAL RULE: Only Super Admin can assignment or removal
      const targetUserRoles = targetUser.roles || [targetUser.role || 'traveler'];
      const isTargetAdmin = targetUserRoles.includes('admin') || targetUserRoles.includes('super_admin');

      if (isTargetAdmin && requester.role !== 'super_admin') {
        res.status(403).json({ error: 'Forbidden: Only Super Admins can remove Admin or Super Admin accounts.' });
        return;
      }

      // Privilege check:
      if (targetUser.role === 'super_admin' && requester.role !== 'super_admin') {
        res.status(403).json({ error: 'Forbidden: Only Super Admins can remove other Super Admin nodes.' });
        return;
      }

      if (targetUser.role === 'admin' && requester.role !== 'super_admin') {
        if (!hasPermission(requester.email, 'manage_admins')) {
          res.status(403).json({ error: 'Forbidden: Missing permission manage_admins required to delete Admin accounts.' });
          return;
        }
      }

      if (targetUser.role === 'moderator' && requester.role !== 'super_admin') {
        if (!hasPermission(requester.email, 'manage_moderators')) {
          res.status(403).json({ error: 'Forbidden: Missing permission manage_moderators required to delete Moderator accounts.' });
          return;
        }
      }

      const filtered = users.filter(u => u.email.trim().toLowerCase() !== targetEmail);
      dbStore.updateUsers(filtered);

      dbStore.addAuditLog({
        id: `log-${Date.now()}`,
        userId: requester.id,
        email: requester.email,
        action: 'Delete User',
        details: `Deleted backoffice account: ${targetEmail}`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete user' });
    }
  });

  // Keep compatibility for any old calls
  app.get('/api/admin/user-roles', adminAuth, (req, res) => {
    const users = dbStore.getUsers().map(u => ({
      id: u.id,
      email: u.email,
      role: u.role === 'super_admin' ? 'admin' : u.role, // compat
      status: u.status === 'active' ? 'active' : 'restricted', // compat
      updatedAt: u.createdAt
    }));
    res.json(users);
  });

  app.get('/api/admin/audit-logs', adminAuth, (req, res) => {
    res.json(dbStore.getAuditLogs());
  });

  app.get('/api/admin/roles', adminAuth, (req, res) => {
    res.json(dbStore.getRoles());
  });

  app.get('/api/admin/permissions', adminAuth, (req, res) => {
    res.json(dbStore.getPermissions());
  });

  // Stats Dashboard
  app.get('/api/admin/stats', adminAuth, (req, res) => {
    const hubs = dbStore.getHubs();
    const routes = dbStore.getRoutes();
    const destinations = dbStore.getDestinations();
    const attractions = dbStore.getAttractions();
    const homestays = dbStore.getHomestays();
    const contributions = dbStore.getContributions();
    const tripLeads = dbStore.getTripLeads();
    const carLeads = dbStore.getCarLeads();
    const images = dbStore.getImages();
    const drivers = dbStore.getDrivers();

    const pendingContributionsCount = contributions.filter(c => c.status === 'Pending').length;
    const pendingImagesCount = images.filter(img => img.status === 'Pending').length;
    const pendingHomestaysCount = homestays.filter(h => h.status === 'Pending').length;
    const pendingDriversCount = drivers.filter(d => d.status === 'Pending').length;

    res.json({
      totalHubs: hubs.length,
      totalRoutes: routes.length,
      totalDestinations: destinations.length,
      totalAttractions: attractions.length,
      totalHomestays: homestays.length,
      pendingContributions: pendingContributionsCount,
      tripLeadsCount: tripLeads.length,
      carLeadsCount: carLeads.length,
      totalImages: images.length,
      pendingImages: pendingImagesCount,
      totalDrivers: drivers.length,
      pendingHomestays: pendingHomestaysCount,
      pendingDrivers: pendingDriversCount
    });
  });

  // Admin lists data
  app.get('/api/admin/drivers', adminAuth, (req, res) => {
    res.json(dbStore.getDrivers());
  });

  // Admin lists data
  app.get('/api/admin/leads/trip', adminAuth, (req, res) => {
    res.json(dbStore.getTripLeads());
  });

  app.get('/api/admin/leads/car', adminAuth, (req, res) => {
    res.json(dbStore.getCarLeads());
  });

  app.get('/api/admin/contributions', adminAuth, (req, res) => {
    res.json(dbStore.getContributions());
  });

  // Admin image moderator lists
  app.get('/api/admin/images', adminAuth, (req, res) => {
    res.json(dbStore.getImages());
  });

  // Approve a submitted image
  app.post('/api/admin/images/:id/approve', adminAuth, (req, res) => {
    const imgs = dbStore.getImages();
    const img = imgs.find(i => i.id === req.params.id);
    if (!img) {
      res.status(404).json({ error: 'Image file record not found.' });
      return;
    }
    img.status = 'Approved';
    dbStore.updateImages(imgs);

    // Sync image URL back to corresponding parent gallery so it becomes immediately visible publicly
    if (img.destinationId) {
      const dests = dbStore.getDestinations();
      const dest = dests.find(d => d.id === img.destinationId);
      if (dest) {
        dest.gallery = dest.gallery || [];
        if (!dest.gallery.includes(img.url)) {
          dest.gallery.push(img.url);
        }
        dbStore.updateDestinations(dests);
      }
    }
    if (img.attractionId) {
      const atts = dbStore.getAttractions();
      const att = atts.find(a => a.id === img.attractionId);
      if (att) {
        att.gallery = att.gallery || [];
        if (!att.gallery.includes(img.url)) {
          att.gallery.push(img.url);
        }
        dbStore.updateAttractions(atts);
      }
    }

    // Send notification to user if uploaded by a logged in traveler
    if (img.userId) {
      dbStore.addNotification({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        userId: img.userId,
        title: '🎉 Scenic Photo Approved!',
        message: `🎉 Your contributed photo "${img.caption || 'scenic view'}" has been approved and published to the gallery.`,
        type: 'photo_approved',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ success: true, image: img });
  });

  // Reject a submitted image
  app.post('/api/admin/images/:id/reject', adminAuth, (req, res) => {
    const imgs = dbStore.getImages();
    const img = imgs.find(i => i.id === req.params.id);
    if (!img) {
      res.status(404).json({ error: 'Image file record not found.' });
      return;
    }
    const { rejectionReason } = req.body;
    img.status = 'Rejected';
    img.rejectionReason = rejectionReason || null;
    dbStore.updateImages(imgs);

    // Evict URL from gallery in case it was previously approved
    if (img.destinationId) {
      const dests = dbStore.getDestinations();
      const dest = dests.find(d => d.id === img.destinationId);
      if (dest) {
        dest.gallery = dest.gallery ? dest.gallery.filter(url => url !== img.url) : [];
        dbStore.updateDestinations(dests);
      }
    }
    if (img.attractionId) {
      const atts = dbStore.getAttractions();
      const att = atts.find(a => a.id === img.attractionId);
      if (att) {
        att.gallery = att.gallery ? att.gallery.filter(url => url !== img.url) : [];
        dbStore.updateAttractions(atts);
      }
    }

    // Send notification to user if uploaded by a logged in traveler
    if (img.userId) {
      dbStore.addNotification({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        userId: img.userId,
        title: '❌ Photo contribution rejected',
        message: `Your photo "${img.caption || 'scenic view'}" was not approved. Reason: ${rejectionReason || 'Does not meet formatting standards.'}`,
        type: 'photo_rejected',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    res.json({ success: true, image: img });
  });

  // Delete an image entry entirely from filesystem database
  app.post('/api/admin/images/:id/delete', adminAuth, (req, res) => {
    let imgs = dbStore.getImages();
    const img = imgs.find(i => i.id === req.params.id);
    if (!img) {
      res.status(404).json({ error: 'Image file record not found.' });
      return;
    }

    // Evict from collections
    if (img.destinationId) {
      const dests = dbStore.getDestinations();
      const dest = dests.find(d => d.id === img.destinationId);
      if (dest) {
        dest.gallery = dest.gallery ? dest.gallery.filter(url => url !== img.url) : [];
        dbStore.updateDestinations(dests);
      }
    }
    if (img.attractionId) {
      const atts = dbStore.getAttractions();
      const att = atts.find(a => a.id === img.attractionId);
      if (att) {
        att.gallery = att.gallery ? att.gallery.filter(url => url !== img.url) : [];
        dbStore.updateAttractions(atts);
      }
    }

    imgs = imgs.filter(i => i.id !== req.params.id);
    dbStore.updateImages(imgs);
    res.json({ success: true });
  });

  // Approve / Reject contribution
  app.post('/api/admin/contributions/:id/approve', adminAuth, (req, res) => {
    dbStore.approveContribution(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/admin/contributions/:id/reject', adminAuth, (req, res) => {
    dbStore.rejectContribution(req.params.id);
    res.json({ success: true });
  });

  // ==================== TRAVELLER PHOTO CONTRIBUTION & APPROVAL SYSTEM API ENDPOINTS ====================

  // POST: Create contribution (traveller side)
  app.post('/api/photo-contributions', (req, res) => {
    try {
      const { userId, travellerName, travellerEmail, destinationId, imageUrl } = req.body;

      if (!travellerName) {
        res.status(400).json({ error: 'Traveller name is required.' });
        return;
      }
      if (!travellerEmail) {
        res.status(400).json({ error: 'Traveller email is required.' });
        return;
      }
      if (!destinationId) {
        res.status(400).json({ error: 'Destination is required.' });
        return;
      }
      if (!imageUrl) {
        res.status(400).json({ error: 'Image file is required.' });
        return;
      }

      const id = `pcontrib-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const contribution = {
        id,
        userId: userId || 'anonymous',
        travellerName,
        travellerEmail,
        destinationId,
        imageUrl,
        status: 'Pending Approval' as const,
        uploadedAt: new Date().toISOString(),
        approvedBy: null,
        approvedAt: null,
        rejectionReason: null
      };

      dbStore.addPhotoContribution(contribution);

      // Audit Log
      dbStore.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: userId || 'anonymous',
        email: travellerEmail,
        action: 'Submit Photo Contribution',
        details: `Submitted photo for destination ${destinationId}. Status: Pending Approval.`,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: 'Your photo has been submitted and is awaiting review.',
        contribution
      });
    } catch (err: any) {
      console.error('[Server Error /api/photo-contributions]:', err);
      res.status(500).json({ error: err.message || 'Server error creating photo contribution.' });
    }
  });

  // GET: Fetch photo contributions (both for admin review and traveller list)
  // Admins can query all, users can filter by userId to see theirs.
  app.get('/api/photo-contributions', (req, res) => {
    try {
      const { userId, status } = req.query;
      let contributions = dbStore.getPhotoContributions();

      if (userId) {
        contributions = contributions.filter(c => c.userId === userId);
      }
      if (status) {
        contributions = contributions.filter(c => c.status === status);
      }

      res.json(contributions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET: Fetch admin-side photo contributions list (Requires adminAuth and moderate_photos permission)
  app.get('/api/admin/photo-contributions', adminAuth, (req, res) => {
    try {
      res.json(dbStore.getPhotoContributions());
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Server error fetching photo contributions' });
    }
  });

  // POST: Admin Approve a photo contribution
  app.post('/api/admin/photo-contributions/:id/approve', adminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const adminEmail = (req.headers['x-admin-email'] || req.query.email || 'admin@hillytrip.com') as string;

      const list = dbStore.getPhotoContributions();
      const item = list.find(c => c.id === id);

      if (!item) {
        res.status(404).json({ error: 'Photo contribution not found.' });
        return;
      }

      item.status = 'Approved';
      item.approvedBy = adminEmail;
      item.approvedAt = new Date().toISOString();
      dbStore.updatePhotoContributions(list);

      // 1. Create approved ImageItem record so it displays under /api/images and live website gallery
      const images = dbStore.getImages();
      const newImgItem = {
        id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        destinationId: item.destinationId,
        attractionId: null,
        url: item.imageUrl,
        uploadedBy: item.travellerName,
        uploadDate: new Date().toISOString(),
        status: 'Approved' as const,
        caption: `Uploaded by traveller ${item.travellerName}`,
        altText: `Scenic view in India`
      };
      images.push(newImgItem);
      dbStore.updateImages(images);

      // 2. Add image to live destination gallery
      const dests = dbStore.getDestinations();
      const dest = dests.find(d => d.id === item.destinationId);
      if (dest) {
        dest.gallery = dest.gallery || [];
        if (!dest.gallery.includes(item.imageUrl)) {
          dest.gallery.push(item.imageUrl);
        }
        dbStore.updateDestinations(dests);
      }

      // 3. Send Notification to Traveller
      dbStore.addNotification({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: item.userId,
        title: '🎉 Photo Approved!',
        message: '🎉 Congratulations! Your photo has been approved and is now live on the website.',
        type: 'photo_approved',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // 4. Audit Log
      dbStore.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: adminEmail,
        email: adminEmail,
        action: 'Approve Photo Contribution',
        details: `Approved photo contribution matches ID: ${id} uploaded by ${item.travellerEmail}.`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, contribution: item });
    } catch (err: any) {
      console.error('[Server Approve Error]:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Admin Reject a photo contribution
  app.post('/api/admin/photo-contributions/:id/reject', adminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const adminEmail = (req.headers['x-admin-email'] || req.query.email || 'admin@hillytrip.com') as string;

      const list = dbStore.getPhotoContributions();
      const item = list.find(c => c.id === id);

      if (!item) {
        res.status(404).json({ error: 'Photo contribution not found.' });
        return;
      }

      item.status = 'Rejected';
      item.approvedBy = adminEmail;
      item.approvedAt = new Date().toISOString();
      item.rejectionReason = rejectionReason || null;
      dbStore.updatePhotoContributions(list);

      // Create Notification to Traveller
      const message = rejectionReason 
        ? `Your photo submission was not approved. Reason: ${rejectionReason}`
        : 'Your photo submission was not approved.';

      dbStore.addNotification({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: item.userId,
        title: 'Photo Submission Rejected',
        message,
        type: 'photo_rejected',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Audit Log
      dbStore.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: adminEmail,
        email: adminEmail,
        action: 'Reject Photo Contribution',
        details: `Rejected photo contribution ID: ${id}. Reason: ${rejectionReason || 'None specified'}.`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, contribution: item });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Bulk Action Approve
  app.post('/api/admin/photo-contributions/bulk-approve', adminAuth, (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: 'An array of contribution ids is required.' });
        return;
      }

      const adminEmail = (req.headers['x-admin-email'] || req.query.email || 'admin@hillytrip.com') as string;
      const list = dbStore.getPhotoContributions();
      const dests = dbStore.getDestinations();
      const images = dbStore.getImages();

      let approvedCount = 0;

      for (const id of ids) {
        const item = list.find(c => c.id === id);
        if (item && item.status === 'Pending Approval') {
          item.status = 'Approved';
          item.approvedBy = adminEmail;
          item.approvedAt = new Date().toISOString();

          // ImageItem
          const newImgItem = {
            id: `img-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            destinationId: item.destinationId,
            attractionId: null,
            url: item.imageUrl,
            uploadedBy: item.travellerName,
            uploadDate: new Date().toISOString(),
            status: 'Approved' as const,
            caption: `Uploaded by traveller ${item.travellerName}`,
            altText: `Scenic view in India`
          };
          images.push(newImgItem);

          // Gallery append
          const dest = dests.find(d => d.id === item.destinationId);
          if (dest) {
            dest.gallery = dest.gallery || [];
            if (!dest.gallery.includes(item.imageUrl)) {
              dest.gallery.push(item.imageUrl);
            }
          }

          // User notification
          dbStore.addNotification({
            id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            userId: item.userId,
            title: '🎉 Photo Approved!',
            message: '🎉 Congratulations! Your photo has been approved and is now live on the website.',
            type: 'photo_approved',
            isRead: false,
            createdAt: new Date().toISOString()
          });

          approvedCount++;
        }
      }

      dbStore.updatePhotoContributions(list);
      dbStore.updateImages(images);
      dbStore.updateDestinations(dests);

      // Audit Log
      dbStore.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: adminEmail,
        email: adminEmail,
        action: 'Bulk Approve Photo Contributions',
        details: `Approved ${approvedCount} photo contributions in bulk.`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, count: approvedCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Bulk Action Reject
  app.post('/api/admin/photo-contributions/bulk-reject', adminAuth, (req, res) => {
    try {
      const { ids, rejectionReason } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: 'An array of contribution ids is required.' });
        return;
      }

      const adminEmail = (req.headers['x-admin-email'] || req.query.email || 'admin@hillytrip.com') as string;
      const list = dbStore.getPhotoContributions();

      let rejectedCount = 0;

      for (const id of ids) {
        const item = list.find(c => c.id === id);
        if (item && item.status === 'Pending Approval') {
          item.status = 'Rejected';
          item.approvedBy = adminEmail;
          item.approvedAt = new Date().toISOString();
          item.rejectionReason = rejectionReason || null;

          const message = rejectionReason 
            ? `Your photo submission was not approved. Reason: ${rejectionReason}`
            : 'Your photo submission was not approved.';

          dbStore.addNotification({
            id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            userId: item.userId,
            title: 'Photo Submission Rejected',
            message,
            type: 'photo_rejected',
            isRead: false,
            createdAt: new Date().toISOString()
          });

          rejectedCount++;
        }
      }

      dbStore.updatePhotoContributions(list);

      // Audit Log
      dbStore.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: adminEmail,
        email: adminEmail,
        action: 'Bulk Reject Photo Contributions',
        details: `Rejected ${rejectedCount} photo contributions in bulk. Reason: ${rejectionReason || 'None specified'}.`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, count: rejectedCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== NOTIFICATIONS API ENDPOINTS ====================

  // GET: Fetch notifications for user
  app.get('/api/notifications', (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        res.status(400).json({ error: 'userId is a required parameter.' });
        return;
      }
      const notifications = dbStore.getNotifications().filter(n => n.userId === userId);
      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Mark notification as read
  app.post('/api/notifications/:id/read', (req, res) => {
    try {
      const { id } = req.params;
      const list = dbStore.getNotifications();
      const item = list.find(n => n.id === id);
      if (item) {
        item.isRead = true;
        dbStore.updateNotifications(list);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Mark all notifications as read for a user
  app.post('/api/notifications/read-all', (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }
      const list = dbStore.getNotifications();
      let changed = false;
      list.forEach(n => {
        if (n.userId === userId && !n.isRead) {
          n.isRead = true;
          changed = true;
        }
      });
      if (changed) {
        dbStore.updateNotifications(list);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Delete individual notification
  app.post('/api/notifications/:id/delete', (req, res) => {
    try {
      const { id } = req.params;
      let list = dbStore.getNotifications();
      const initialLength = list.length;
      list = list.filter(n => n.id !== id);
      if (list.length < initialLength) {
        dbStore.updateNotifications(list);
      }
      res.json({ success: true, message: 'Notification deleted.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST: Clear all notifications for a user
  app.post('/api/notifications/clear-all', (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }
      let list = dbStore.getNotifications();
      list = list.filter(n => n.userId !== userId);
      dbStore.updateNotifications(list);
      res.json({ success: true, message: 'All notifications cleared.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== SYSTEM NOTIFICATIONS (GENERAL / ADMIN) ====================

  // GET: Fetch published notifications (for normal users)
  app.get('/api/app-notifications', (req, res) => {
    try {
      const list = dbStore.getAppNotifications();
      // Filter ONLY published notifications
      const published = list.filter(n => n.status === 'published');
      // Sort by latest createdAt
      published.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(published);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch published notifications' });
    }
  });

  // GET: Fetch all notifications (for admin panel, supports search & filtering)
  app.get('/api/admin/app-notifications', adminAuth, (req, res) => {
    try {
      let list = dbStore.getAppNotifications();
      const { search, type, status } = req.query;

      if (search) {
        const query = String(search).toLowerCase();
        list = list.filter(n => 
          n.title.toLowerCase().includes(query) || 
          n.message.toLowerCase().includes(query) ||
          (n.routeName && n.routeName.toLowerCase().includes(query))
        );
      }

      if (type && type !== 'all') {
        const t = String(type);
        list = list.filter(n => n.type === t);
      }

      if (status && status !== 'all') {
        const s = String(status);
        list = list.filter(n => n.status === s);
      }

      // Sort by latest createdAt
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch admin notifications' });
    }
  });

  // POST: Create a notification (for admin)
  app.post('/api/admin/app-notifications', adminAuth, (req, res) => {
    try {
      const payload = req.body;
      if (!payload.title || !payload.message || !payload.type) {
        res.status(400).json({ error: 'Title, message, and type are required' });
        return;
      }

      const notif = {
        id: payload.id || 'notif_' + Date.now(),
        title: payload.title,
        message: payload.message,
        type: payload.type,
        status: payload.status || 'draft',
        imageUrl: payload.imageUrl || null,
        destinationId: payload.destinationId || null,
        attractionId: payload.attractionId || null,
        homestayId: payload.homestayId || null,
        routeName: payload.routeName || null,
        routeStatus: payload.routeName ? (payload.routeStatus || 'Open') : null,
        createdAt: payload.createdAt || new Date().toISOString(),
        isPushNotification: !!payload.isPushNotification,
        priority: payload.priority || 'normal',
        approvedAt: payload.status === 'published' ? new Date().toISOString() : null,
        approvedBy: payload.status === 'published' ? (req.headers['x-admin-email'] as string || 'admin') : null
      };

      dbStore.addAppNotification(notif);
      res.json({ success: true, notification: notif });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create notification' });
    }
  });

  // PUT: Update / Approve / Reject / Edit notification (for admin)
  app.put('/api/admin/app-notifications/:id', adminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;
      const list = dbStore.getAppNotifications();
      const idx = list.findIndex(n => n.id === id);

      if (idx === -1) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      const existingN = list[idx];
      const merged = {
        ...existingN,
        ...payload,
        id // lock id
      };

      // Handle approve/reject state transitions if status changed
      if (payload.status && payload.status !== existingN.status) {
        if (payload.status === 'published') {
          merged.approvedAt = new Date().toISOString();
          merged.approvedBy = (req.headers['x-admin-email'] as string) || 'admin';
        } else if (payload.status === 'rejected') {
          merged.approvedAt = null;
          merged.approvedBy = null;
        }
      }

      list[idx] = merged;
      dbStore.updateAppNotifications(list);
      res.json({ success: true, notification: merged });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update notification' });
    }
  });

  // DELETE: Delete notification (admin only)
  app.delete('/api/admin/app-notifications/:id', adminAuth, (req, res) => {
    try {
      const { id } = req.params;
      let list = dbStore.getAppNotifications();
      const initialLength = list.length;
      list = list.filter(n => n.id !== id);

      if (list.length < initialLength) {
        dbStore.updateAppNotifications(list);
        res.json({ success: true, message: 'Notification successfully deleted' });
      } else {
        res.status(404).json({ error: 'Notification not found' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete notification' });
    }
  });

  // Bulk import spreadsheet data
  app.post('/api/admin/bulk-import', adminAuth, (req, res) => {
    const { collection, items, mode } = req.body; // mode: 'merge' or 'replace'
    if (!collection || !Array.isArray(items)) {
      res.status(400).json({ error: 'collection and items (array) are required' });
      return;
    }

    try {
      if (collection === 'hubs') {
        const validated = items.filter(item => item.id && item.name && item.type);
        if (mode === 'replace') {
          dbStore.importHubs(validated);
        } else {
          const current = dbStore.getHubs();
          const merged = [...current];
          validated.forEach(v => {
            const idx = merged.findIndex(h => h.id === v.id);
            if (idx > -1) merged[idx] = v;
            else merged.push(v);
          });
          dbStore.importHubs(merged);
        }
      } else if (collection === 'routes') {
        const validated = items.filter(item => item.fromHubId && item.toHubId && Array.isArray(item.path));
        const formatted = validated.map((r, i) => ({
          id: r.id || `route-bulk-${Date.now()}-${i}`,
          fromHubId: r.fromHubId,
          toHubId: r.toHubId,
          path: r.path,
          type: r.type || 'Direct',
          fareMin: Number(r.fareMin) || 1200,
          fareMax: Number(r.fareMax) || 2000,
          timeMin: Number(r.timeMin) || 120,
          timeMax: Number(r.timeMax) || 180,
          distance: r.distance !== undefined ? Number(r.distance) : undefined,
          verified: r.verified !== undefined ? Boolean(r.verified) : true,
          lastUpdated: r.lastUpdated || new Date().toISOString().split('T')[0]
        }));

        if (mode === 'replace') {
          dbStore.importRoutes(formatted);
        } else {
          const current = dbStore.getRoutes();
          const merged = [...current];
          formatted.forEach(r => {
            const idx = merged.findIndex(curr => (curr.fromHubId === r.fromHubId && curr.toHubId === r.toHubId) || curr.id === r.id);
            if (idx > -1) merged[idx] = r;
            else merged.push(r);
          });
          dbStore.importRoutes(merged);
        }
      } else if (collection === 'destinations') {
        const validated = items.filter(item => item.id && item.name && item.description);
        const formatted = validated.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          tourismType: d.tourismType || 'Hill Station',
          bestSeason: d.bestSeason || 'September to June',
          image: d.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop',
          gallery: Array.isArray(d.gallery) ? d.gallery : (d.gallery ? [d.gallery] : []),
          isHiddenGem: d.isHiddenGem === true || String(d.isHiddenGem).toLowerCase() === 'true',
          isFeaturedThisWeek: d.isFeaturedThisWeek === true || String(d.isFeaturedThisWeek).toLowerCase() === 'true',
          isPopularDestination: d.isPopularDestination === true || String(d.isPopularDestination).toLowerCase() === 'true',
          coverImage: d.coverImage || '',
          coverPrompt: d.coverPrompt || '',
          coverStatus: d.coverStatus || 'pending',
          latitude: d.latitude !== undefined ? Number(d.latitude) : undefined,
          longitude: d.longitude !== undefined ? Number(d.longitude) : undefined,
          district: d.district || '',
          state: d.state || '',
          country: d.country || '',
          nearestHubId: d.nearestHubId || '',
          distanceFromHub: d.distanceFromHub !== undefined ? Number(d.distanceFromHub) : undefined,
          nearbyAttractions: d.nearbyAttractions || [],
          nearbyHomestays: d.nearbyHomestays || [],
          nearbyDestinations: d.nearbyDestinations || []
        }));

        if (mode === 'replace') {
          dbStore.updateDestinations(formatted);
        } else {
          const current = dbStore.getDestinations();
          const merged = [...current];
          formatted.forEach(d => {
            const idx = merged.findIndex(curr => curr.id === d.id);
            if (idx > -1) merged[idx] = d;
            else merged.push(d);
          });
          dbStore.updateDestinations(merged);
        }
      } else if (collection === 'attractions') {
        const validated = items.filter(item => item.name && item.destinationId);
        const formatted = validated.map((a, i) => ({
          id: a.id || `attr-bulk-${Date.now()}-${i}`,
          name: a.name,
          category: a.category || 'Viewpoint',
          destinationId: a.destinationId,
          description: a.description || '',
          image: a.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
          gallery: Array.isArray(a.gallery) ? a.gallery : [],
          isHiddenGem: a.isHiddenGem === true || String(a.isHiddenGem).toLowerCase() === 'true',
          isFeaturedThisWeek: a.isFeaturedThisWeek === true || String(a.isFeaturedThisWeek).toLowerCase() === 'true',
          isFeaturedAttraction: a.isFeaturedAttraction === true || String(a.isFeaturedAttraction).toLowerCase() === 'true',
          coverImage: a.coverImage || '',
          coverPrompt: a.coverPrompt || '',
          coverStatus: a.coverStatus || 'pending',
          latitude: a.latitude !== undefined ? Number(a.latitude) : undefined,
          longitude: a.longitude !== undefined ? Number(a.longitude) : undefined,
          district: a.district || '',
          state: a.state || '',
          country: a.country || '',
          nearestDestinationId: a.nearestDestinationId || '',
          distanceFromDestination: a.distanceFromDestination !== undefined ? Number(a.distanceFromDestination) : undefined,
          nearestHubId: a.nearestHubId || '',
          distanceFromHub: a.distanceFromHub !== undefined ? Number(a.distanceFromHub) : undefined
        }));

        if (mode === 'replace') {
          dbStore.updateAttractions(formatted);
        } else {
          const current = dbStore.getAttractions();
          const merged = [...current];
          formatted.forEach(a => {
            const idx = merged.findIndex(curr => curr.id === a.id || (curr.name === a.name && curr.destinationId === a.destinationId));
            if (idx > -1) merged[idx] = a;
            else merged.push(a);
          });
          dbStore.updateAttractions(merged);
        }
      } else if (collection === 'homestays') {
        const validated = items.filter(item => item.name && item.destinationId);
        const formatted = validated.map((h, i) => ({
          id: h.id || `home-bulk-${Date.now()}-${i}`,
          name: h.name,
          destinationId: h.destinationId,
          priceMin: Number(h.priceMin) || 1200,
          priceMax: Number(h.priceMax) || 2200,
          contact: h.contact || '',
          amenities: Array.isArray(h.amenities) ? h.amenities : (h.amenities ? String(h.amenities).split(',').map(s=>s.trim()) : ['Geyser', 'Meals']),
          images: Array.isArray(h.images) ? h.images : (h.images ? [h.images] : [DEFAULT_HOMESTAY_IMAGE])
        }));

        if (mode === 'replace') {
          dbStore.updateHomestays(formatted);
        } else {
          const current = dbStore.getHomestays();
          const merged = [...current];
          formatted.forEach(h => {
            const idx = merged.findIndex(curr => curr.id === h.id || (curr.name === h.name && curr.destinationId === h.destinationId));
            if (idx > -1) merged[idx] = h;
            else merged.push(h);
          });
          dbStore.updateHomestays(merged);
        }
      } else {
        res.status(400).json({ error: 'Unknown collection type' });
        return;
      }

      res.json({ success: true, count: items.length });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server error during import processing' });
    }
  });

  // Data management additions
  app.post('/api/admin/hubs', adminAuth, (req, res) => {
    const hub = req.body;
    if (!hub.id || !hub.name || !hub.type) {
      res.status(400).json({ error: 'Hub ID, Name and Type are required' });
      return;
    }
    const hubs = dbStore.getHubs();
    if (hubs.some(h => h.id === hub.id)) {
      res.status(400).json({ error: 'Hub ID already exists' });
      return;
    }
    hubs.push(hub);
    dbStore.importHubs(hubs);
    res.json({ success: true, hubs });
  });

  app.post('/api/admin/routes', adminAuth, (req, res) => {
    const r = req.body;
    if (!r.fromHubId || !r.toHubId || !r.path) {
      res.status(400).json({ error: 'Required fields: fromHubId, toHubId, path' });
      return;
    }
    const routes = dbStore.getRoutes();
    const newRoute = {
      id: `route-${Date.now()}`,
      fromHubId: r.fromHubId,
      toHubId: r.toHubId,
      path: r.path,
      type: r.type || 'Direct',
      fareMin: Number(r.fareMin) || 1500,
      fareMax: Number(r.fareMax) || 2500,
      timeMin: Number(r.timeMin) || 120,
      timeMax: Number(r.timeMax) || 180,
      distance: r.distance !== undefined && r.distance !== null ? Number(r.distance) : undefined,
      verified: true,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    routes.push(newRoute);
    dbStore.importRoutes(routes);
    res.json({ success: true, routes });
  });

  app.post('/api/admin/destinations', adminAuth, async (req, res) => {
    const d = req.body;
    if (!d.id || !d.name || !d.description) {
      res.status(400).json({ error: 'Required: id, name, description' });
      return;
    }
    const dests = dbStore.getDestinations();
    const idx = dests.findIndex(item => item.id === d.id);
    let updatedDest: any;
    if (idx > -1) {
      updatedDest = { ...dests[idx], ...d };
      dests[idx] = updatedDest;
    } else {
      updatedDest = {
        id: d.id,
        name: d.name,
        description: d.description,
        tourismType: d.tourismType || 'Hill Station',
        bestSeason: d.bestSeason || 'September to June',
        image: d.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop',
        gallery: d.gallery || [],
        isHiddenGem: d.isHiddenGem === true || String(d.isHiddenGem).toLowerCase() === 'true',
        isFeaturedThisWeek: d.isFeaturedThisWeek === true || String(d.isFeaturedThisWeek).toLowerCase() === 'true',
        isPopularDestination: d.isPopularDestination === true || String(d.isPopularDestination).toLowerCase() === 'true',
        coverImage: d.coverImage || '',
        coverPrompt: d.coverPrompt || '',
        coverStatus: d.coverStatus || 'pending',
        latitude: d.latitude !== undefined ? Number(d.latitude) : undefined,
        longitude: d.longitude !== undefined ? Number(d.longitude) : undefined,
        district: d.district || '',
        state: d.state || '',
        country: d.country || '',
        nearestHubId: d.nearestHubId || '',
        distanceFromHub: d.distanceFromHub !== undefined ? Number(d.distanceFromHub) : undefined,
        nearbyAttractions: d.nearbyAttractions || [],
        nearbyHomestays: d.nearbyHomestays || [],
        nearbyDestinations: d.nearbyDestinations || []
      };
      dests.push(updatedDest);
    }

    const isManual = d.coverStatus === 'manual' || (d.coverImage && d.coverImage !== (updatedDest.coverImage || ''));
    if (isManual) {
      updatedDest.coverStatus = 'manual';
    } else {
      if (!updatedDest.coverPrompt) {
        updatedDest.coverPrompt = '';
        updatedDest.coverStatus = 'pending';
      }
    }

    dbStore.updateDestinations(dests);
    res.json({ success: true, destinations: dests });
  });

  app.post('/api/admin/attractions', adminAuth, async (req, res) => {
    const a = req.body;
    if (!a.name || !a.destinationId) {
      res.status(400).json({ error: 'Required fields: name, destinationId' });
      return;
    }
    const attractions = dbStore.getAttractions();
    const newAttr: any = {
      id: a.id || `attr-${Date.now()}`,
      name: a.name,
      category: a.category || 'Viewpoint',
      destinationId: a.destinationId,
      description: a.description || '',
      image: a.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
      gallery: a.gallery || [],
      isHiddenGem: a.isHiddenGem === true || String(a.isHiddenGem).toLowerCase() === 'true',
      isFeaturedThisWeek: a.isFeaturedThisWeek === true || String(a.isFeaturedThisWeek).toLowerCase() === 'true',
      isFeaturedAttraction: a.isFeaturedAttraction === true || String(a.isFeaturedAttraction).toLowerCase() === 'true',
      coverImage: a.coverImage || '',
      coverPrompt: a.coverPrompt || '',
      coverStatus: a.coverStatus || 'pending',
      latitude: a.latitude !== undefined ? Number(a.latitude) : undefined,
      longitude: a.longitude !== undefined ? Number(a.longitude) : undefined,
      district: a.district || '',
      state: a.state || '',
      country: a.country || '',
      nearestDestinationId: a.nearestDestinationId || '',
      distanceFromDestination: a.distanceFromDestination !== undefined ? Number(a.distanceFromDestination) : undefined,
      nearestHubId: a.nearestHubId || '',
      distanceFromHub: a.distanceFromHub !== undefined ? Number(a.distanceFromHub) : undefined
    };

    const isManual = a.coverStatus === 'manual' || (a.coverImage && a.coverImage !== '');
    if (isManual) {
      newAttr.coverStatus = 'manual';
    } else {
      if (!newAttr.coverPrompt) {
        newAttr.coverPrompt = '';
        newAttr.coverStatus = 'pending';
      }
    }

    attractions.push(newAttr);
    dbStore.updateAttractions(attractions);
    res.json({ success: true, attractions });
  });

  app.post('/api/admin/homestays', adminAuth, (req, res) => {
    const h = req.body;
    if (!h.name || !h.destinationId) {
      res.status(400).json({ error: 'Required fields: name, destinationId' });
      return;
    }
    const homestays = dbStore.getHomestays();
    const newHome = {
      id: h.id || `home-${Date.now()}`,
      name: h.name,
      destinationId: h.destinationId,
      priceMin: Number(h.priceMin) || 1200,
      priceMax: Number(h.priceMax) || 2200,
      contact: h.contact || '',
      amenities: h.amenities || ['Geyser', 'Meals'],
      images: h.images || [DEFAULT_HOMESTAY_IMAGE]
    };
    homestays.push(newHome);
    dbStore.updateHomestays(homestays);
    res.json({ success: true, homestays });
  });

  app.post('/api/admin/leads/car/:id/delete', adminAuth, (req, res) => {
    dbStore.deleteCarLead(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/admin/leads/trip/:id/delete', adminAuth, (req, res) => {
    dbStore.deleteTripLead(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/admin/leads/car/:id/status', adminAuth, (req, res) => {
    const { status } = req.body;
    dbStore.updateCarLeadStatus(req.params.id, status);
    res.json({ success: true });
  });

  // Generic CRUD endpoints for total Backoffice Admin flexibility
  app.post('/api/admin/data/:collection/bulk', adminAuth, async (req, res) => {
    try {
      const { collection: col } = req.params;
      const { records } = req.body;
      if (!records || !Array.isArray(records)) {
        res.status(400).json({ error: 'Body must contain a "records" array.' });
        return;
      }

      // 1. Map to check existing records for cover prompts and coordinate merges
      const keyMap: Record<string, string> = {
        hubs: 'hubs',
        routes: 'routes',
        destinations: 'destinations',
        attractions: 'attractions',
        homestays: 'homestays',
        images: 'images',
        contributions: 'contributions',
        trip_leads: 'tripLeads',
        car_leads: 'carLeads',
        drivers: 'drivers',
        user_roles: 'userRoles'
      };
      
      const targetKey = keyMap[col];
      const list = targetKey ? (dbStore.data[targetKey as keyof typeof dbStore.data] as any[] || []) : [];

      const finalRecordsToSave: any[] = [];
      const promptQueue: any[] = [];

      for (const record of records) {
        if (record && record.id) {
          const existing = list.find((item: any) => item.id === record.id);
          let finalRecord = { ...record };
          if (existing) {
            finalRecord = { ...existing, ...record };
          }

          if (col === 'destinations' || col === 'attractions') {
            const isManual = finalRecord.coverStatus === 'manual' || (finalRecord.coverImage && finalRecord.coverImage !== '');
            if (isManual) {
              finalRecord.coverStatus = 'manual';
            } else {
              if (!finalRecord.coverPrompt) {
                finalRecord.coverPrompt = '';
                finalRecord.coverStatus = 'pending';
              }
            }
          }

          finalRecordsToSave.push(finalRecord);
        }
      }

      // 3. Delegate to the new high-performance transactional bulk database save
      const success = await dbStore.saveRecordsBulk(col, finalRecordsToSave);
      if (!success) {
        res.status(400).json({ error: `Unsupported collection: ${col}` });
        return;
      }

      res.json({ success: true, count: finalRecordsToSave.length });
    } catch (e: any) {
      console.error('[Bulk Save Route Error]', e);
      res.status(500).json({ error: e.message || 'Failed to save admin records in bulk' });
    }
  });

  app.get('/api/admin/data/:collection', adminAuth, (req, res) => {
    try {
      const { collection: col } = req.params;
      const keyMap: Record<string, string> = {
        hubs: 'hubs',
        routes: 'routes',
        destinations: 'destinations',
        attractions: 'attractions',
        homestays: 'homestays',
        images: 'images',
        contributions: 'contributions',
        trip_leads: 'tripLeads',
        car_leads: 'carLeads',
        drivers: 'drivers',
        user_roles: 'userRoles',
        users: 'users',
        roles: 'roles',
        permissions: 'permissions',
        role_permissions: 'rolePermissions',
        user_permissions: 'userPermissions',
        audit_logs: 'auditLogs',
        photo_contributions: 'photoContributions',
        photo_notifications: 'notifications'
      };
      
      const targetKey = keyMap[col];
      if (!targetKey) {
        res.status(400).json({ error: `Unsupported collection key: ${col}` });
        return;
      }
      
      const list = dbStore.data[targetKey as keyof typeof dbStore.data] || [];
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to list admin data records' });
    }
  });

  app.post('/api/admin/data/:collection', adminAuth, async (req, res) => {
    try {
      const { collection: col } = req.params;
      const record = req.body;
      if (!record || !record.id) {
        res.status(400).json({ error: 'Record body with a unique "id" field is required.' });
        return;
      }

      if (col === 'destinations' || col === 'attractions') {
        const isManual = record.coverStatus === 'manual' || (record.coverImage && !record.coverStatus);
        if (isManual) {
          record.coverStatus = 'manual';
        } else {
          if (!record.coverPrompt) {
            record.coverPrompt = '';
            record.coverStatus = 'pending';
          }
        }
      }

      const success = await dbStore.saveRecord(col, record);
      if (success) {
        res.json({ success: true, record });
      } else {
        res.status(400).json({ error: `Unsupported collection: ${col}` });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to save admin record' });
    }
  });

  app.put('/api/admin/data/:collection/:id', adminAuth, async (req, res) => {
    try {
      const { collection: col, id } = req.params;
      const record = req.body;

      if (col === 'destinations' || col === 'attractions') {
        const keyMap: any = { destinations: 'destinations', attractions: 'attractions' };
        const list = dbStore.data[keyMap[col] as 'destinations' | 'attractions'] || [];
        const existing: any = list.find((item: any) => item.id === id);

        const isNowManual = record.coverStatus === 'manual' || (record.coverImage && record.coverImage !== (existing?.coverImage || ''));
        if (isNowManual) {
          record.coverStatus = 'manual';
        } else if (existing?.coverStatus !== 'manual') {
          if (!record.coverPrompt && existing?.coverPrompt) {
            record.coverPrompt = existing.coverPrompt;
            record.coverStatus = existing.coverStatus;
          } else if (!record.coverPrompt) {
            record.coverPrompt = '';
            record.coverStatus = 'pending';
          }
        }
      }

      const success = await dbStore.updateRecord(col, id, record);
      if (success) {
        res.json({ success: true, record });
      } else {
        res.status(404).json({ error: `Record with id "${id}" not found or unsupported collection in ${col}` });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to update admin record' });
    }
  });

  app.delete('/api/admin/data/:collection/:id', adminAuth, async (req, res) => {
    try {
      const { collection: col, id } = req.params;
      const success = await dbStore.deleteRecord(col, id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: `Record with id "${id}" not found or unsupported collection in ${col}` });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to delete admin record' });
    }
  });

  app.post('/api/admin/wipe-all', adminAuth, async (req, res) => {
    try {
      await dbStore.wipeAll();
      res.json({ success: true, message: 'All database tables wiped successfully.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to wipe database' });
    }
  });

  // ==================== AI COVER MANAGEMENT SYSTEM ENDPOINTS ====================

  // 1. Generate Cover Image from prompt
  app.post('/api/admin/cover/generate-image', adminAuth, async (req, res) => {
    try {
      const { id, type } = req.body; // type is 'destinations' or 'attractions'
      if (!id || !type) {
        res.status(400).json({ error: 'Missing required parameters: id, type' });
        return;
      }
      
      const key = type === 'destinations' ? 'destinations' : 'attractions';
      const list = dbStore.data[key] as any[];
      const record = list?.find(item => item.id === id);
      
      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      // If prompt is missing, generate it first
      if (!record.coverPrompt) {
        const singleType = type === 'destinations' ? 'destination' : 'attraction';
        record.coverPrompt = await generateCoverPrompt(record, singleType);
      }

      // Generate the cover image using Gemini
      const coverUrl = await generateCoverImage(record.coverPrompt);
      record.coverImage = coverUrl;
      record.coverStatus = 'generated';

      // Save record to DB and Firestore
      await dbStore.updateRecord(type, id, record);

      res.json({ success: true, record });
    } catch (err: any) {
      console.error('Failed to generate cover image:', err);
      // Fail status saving
      try {
        const { id, type } = req.body;
        const list = dbStore.data[type === 'destinations' ? 'destinations' : 'attractions'] as any[];
        const record = list?.find(item => item.id === id);
        if (record) {
          record.coverStatus = 'failed';
          await dbStore.updateRecord(type, id, record);
        }
      } catch (innerErr) {
        console.error('Failed to update cover status to failed:', innerErr);
      }
      res.status(500).json({ error: err.message || 'Image generation failed' });
    }
  });

  // 2. Regenerate Prompt
  app.post('/api/admin/cover/regenerate-prompt', adminAuth, async (req, res) => {
    try {
      const { id, type } = req.body;
      if (!id || !type) {
        res.status(400).json({ error: 'Missing parameters: id, type' });
        return;
      }

      const key = type === 'destinations' ? 'destinations' : 'attractions';
      const list = dbStore.data[key] as any[];
      const record = list?.find(item => item.id === id);
      
      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      const singleType = type === 'destinations' ? 'destination' : 'attraction';
      const prompt = await generateCoverPrompt(record, singleType);
      
      record.coverPrompt = prompt;
      record.coverStatus = 'pending';

      await dbStore.updateRecord(type, id, record);
      res.json({ success: true, record });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to regenerate prompt' });
    }
  });

  // 3. Upload Manual Cover
  app.post('/api/admin/cover/upload', adminAuth, async (req, res) => {
    try {
      const { id, type, coverImage } = req.body;
      if (!id || !type || !coverImage) {
        res.status(400).json({ error: 'Missing parameters: id, type, coverImage' });
        return;
      }

      const key = type === 'destinations' ? 'destinations' : 'attractions';
      const list = dbStore.data[key] as any[];
      const record = list?.find(item => item.id === id);
      
      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      record.coverImage = coverImage;
      record.coverStatus = 'manual';

      await dbStore.updateRecord(type, id, record);
      res.json({ success: true, record });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save manual cover' });
    }
  });

  // 4. Bulk Generate Prompts
  app.post('/api/admin/cover/bulk-generate-prompts', adminAuth, async (req, res) => {
    try {
      const result = await bulkGenerateMissingPrompts();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Bulk operation failed' });
    }
  });

  // 4b. Bulk Auto-Fill Cover Images (Unsplash Method 1)
  app.post('/api/admin/cover/bulk-unsplash-autofill', adminAuth, async (req, res) => {
    try {
      const { overwrite } = req.body;
      const result = await bulkApplyUnsplashCovers(!!overwrite);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Bulk Unsplash fill failed' });
    }
  });

  // 5. Config Check
  app.get('/api/admin/cover/config-check', adminAuth, (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim() === "" || key === "undefined") {
      res.json({ configured: false, reason: 'missing', message: "GEMINI_API_KEY is not configured. Please go to 'Settings' (gear icon in the top-right corner) -> 'Secrets' and add your GEMINI_API_KEY." });
      return;
    }
    if (!key.startsWith("AIzaSy") && !key.startsWith("AQ.")) {
      res.json({ configured: false, reason: 'invalid_format', message: "The configured GEMINI_API_KEY format is unexpected. A valid Gemini API key usually starts with 'AIzaSy' or 'AQ.'. Please verify your credentials in Settings -> Secrets and update it." });
      return;
    }
    res.json({ configured: true });
  });

  // ==================== LOCATION INTELLIGENCE ADMIN API ====================
  // 1. Get statistics and coordination details
  app.get('/api/admin/location-intelligence/stats', adminAuth, (req, res) => {
    try {
      const destinations = dbStore.getDestinations();
      const attractions = dbStore.getAttractions();
      const homestays = dbStore.getHomestays();
      const hubs = dbStore.getHubs();

      let total = 0;
      let withCoord = 0;
      let missingCoord = 0;

      const colls = [destinations, attractions, homestays, hubs];
      for (const coll of colls) {
        for (const item of coll) {
          total++;
          const lat = (item as any).latitude;
          const lon = (item as any).longitude;
          if (isCoordinateValid(lat, lon)) {
            withCoord++;
          } else {
            missingCoord++;
          }
        }
      }

      res.json({
        total,
        withCoordinates: withCoord,
        missingCoordinates: missingCoord,
        activeJob: activeGeocodeJob
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve coordinates statistics.' });
    }
  });

  // 2. Poll Active Geocoding Job Progress
  app.get('/api/admin/location-intelligence/progress', adminAuth, (req, res) => {
    try {
      res.json(activeGeocodeJob);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Initiate Bulk Autofill Job
  app.post('/api/admin/location-intelligence/geocode-bulk', adminAuth, (req, res) => {
    try {
      const { limit, targetIds } = req.body;
      runBulkGeocodeJob({ limit, targetIds });
      res.json({ success: true, message: 'Bulk geocoding operation launched in background.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Force Stop Bulk Geocoding Job
  app.post('/api/admin/location-intelligence/geocode-stop', adminAuth, (req, res) => {
    try {
      if (activeGeocodeJob.status === 'running') {
        activeGeocodeJob.status = 'idle';
        activeGeocodeJob.logs.push(`[${new Date().toLocaleTimeString()}] Bulk geocoding process aborted by administrator.`);
      }
      res.json({ success: true, message: 'Job stopped.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Run Data Quality Checker
  app.get('/api/admin/location-intelligence/quality', adminAuth, (req, res) => {
    try {
      const report = runDataQualityCheck();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Recalculate Proximity Graphs
  app.post('/api/admin/location-intelligence/recalculate-spatial', adminAuth, async (req, res) => {
    try {
      const result = await recalculateAllSpatialRelations();
      res.json({ success: true, count: result.count, message: 'All proximity relationships have been realigned and committed.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Manual Single-Record Geocode operation
  app.post('/api/admin/location-intelligence/geocode-single', adminAuth, async (req, res) => {
    try {
      const { col, id } = req.body;
      if (!col || !id) {
        res.status(400).json({ error: 'col and id are required' });
        return;
      }
      await triggerBackgroundGeocodingAndSpatial(col, id);
      res.json({ success: true, message: 'Single record successfully geocoded.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Single record geocoding failed' });
    }
  });

  // ==================== PARTNER DASHBOARD & HOMESTAY SYSTEMS ====================

  // 1. Homestay Claim Requests
  app.post('/api/partner/claims', async (req, res) => {
    try {
      const { homestayId, partnerUserId, ownerName, mobile, whatsapp, email, message, ownershipProof } = req.body;
      if (!homestayId || !partnerUserId || !email) {
        res.status(400).json({ error: 'homestayId, partnerUserId, and email are required to submit a claim.' });
        return;
      }

      // Check if already claimed/exists
      const homestays = dbStore.getHomestays();
      const hs = homestays.find(h => h.id === homestayId);
      if (!hs) {
        res.status(404).json({ error: 'Homestay listing not found' });
        return;
      }
      if (hs.ownerId) {
        res.status(400).json({ error: 'This homestay has already been claimed by a verified owner.' });
        return;
      }

      const claim: ClaimRequest = {
        id: `claim-${Date.now()}`,
        homestayId,
        partnerUserId,
        ownerName: ownerName || 'Claimant',
        mobile: mobile || '',
        whatsapp: whatsapp || '',
        email,
        message: message || '',
        ownershipProof: ownershipProof || '',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await dbStore.saveRecord('claim_requests', claim);

      dbStore.addAuditLog({
        id: `log-${Date.now()}`,
        userId: partnerUserId,
        email,
        action: 'Claim Submitted',
        details: `Submitted partner claim for homestay: ${hs.name} (${homestayId})`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, claim, message: 'Claim request submitted successfully. It will be reviewed by an administrator.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit claim' });
    }
  });

  app.get('/api/partner/claims', (req, res) => {
    try {
      const { partnerUserId } = req.query;
      const claims = dbStore.getClaimRequests();
      if (partnerUserId) {
        const filtered = claims.filter(c => c.partnerUserId === partnerUserId);
        res.json({ success: true, claims: filtered });
      } else {
        res.json({ success: true, claims });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch claims' });
    }
  });

  app.get('/api/admin/claims', adminAuth, (req, res) => {
    try {
      const claims = dbStore.getClaimRequests();
      res.json({ success: true, claims });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/claims/:id/action', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, adminRemarks, adminEmail } = req.body; // 'approve' | 'reject'
      if (!action || !['approve', 'reject'].includes(action)) {
        res.status(400).json({ error: 'action (approve or reject) is required' });
        return;
      }

      const claims = dbStore.getClaimRequests();
      const claim = claims.find(c => c.id === id);
      if (!claim) {
        res.status(404).json({ error: 'Claim request not found' });
        return;
      }

      if (claim.status !== 'pending') {
        res.status(400).json({ error: `This claim request has already been ${claim.status}` });
        return;
      }

      if (action === 'approve') {
        // Find homestay
        const homestays = dbStore.getHomestays();
        const hs = homestays.find(h => h.id === claim.homestayId);
        if (!hs) {
          res.status(404).json({ error: 'Associated homestay listing not found' });
          return;
        }

        const prevOwner = hs.ownerId || null;

        // 1. Assign ownership to partner
        await dbStore.updateRecord('homestays', hs.id, {
          ownerId: claim.partnerUserId,
          ownerName: claim.ownerName, // Sync ownerName from claim
          status: 'active'
        });

        // 2. Mark this claim approved
        await dbStore.updateRecord('claim_requests', claim.id, {
          id: claim.id,
          status: 'approved',
          adminRemarks: adminRemarks || 'Claim request approved'
        });

        // 3. Keep audit audit log of ownership
        const historyRecord: OwnershipHistory = {
          id: `history-${Date.now()}`,
          homestayId: hs.id,
          previousOwnerId: prevOwner,
          newOwnerId: claim.partnerUserId,
          approvedByAdminId: adminEmail || 'admin',
          reason: `Claim Request Approved: ${claim.message}`,
          timestamp: new Date().toISOString()
        };
        await dbStore.saveRecord('ownership_history', historyRecord);

        // 4. Update the partner user's role to 'partner' if it is default 'moderator' or 'traveler'
        const users = dbStore.getUsers();
        const partnerUser = users.find(u => u.id === claim.partnerUserId || u.email.trim().toLowerCase() === claim.partnerUserId.trim().toLowerCase());
        if (partnerUser && (partnerUser.role === 'moderator' || partnerUser.role === 'traveler')) {
          const updatedUsers = users.map(u => u.id === partnerUser.id ? { ...u, role: 'partner' as const } : u);
          dbStore.updateUsers(updatedUsers);
        }

        // 5. Automatically reject other pending claim requests for that specific homestay:
        const otherClaimsForSameHomestay = claims.filter(c => c.homestayId === claim.homestayId && c.id !== claim.id && c.status === 'pending');
        for (const otherClaim of otherClaimsForSameHomestay) {
          await dbStore.updateRecord('claim_requests', otherClaim.id, {
            status: 'rejected',
            adminRemarks: 'listing already claimed by another owner'
          });
        }

        dbStore.addAuditLog({
          id: `log-${Date.now()}`,
          userId: 'admin',
          email: adminEmail || 'admin',
          action: 'Claim Approved',
          details: `Approved claim requests for ${hs.name} (${hs.id}). Assigned to owner: ${claim.partnerUserId}`,
          timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'Claim request approved. Ownership successfully assigned.' });
      } else {
        // reject claim
        await dbStore.updateRecord('claim_requests', claim.id, {
          status: 'rejected',
          adminRemarks: adminRemarks || 'Claim request rejected by Administrator.'
        });

        dbStore.addAuditLog({
          id: `log-${Date.now()}`,
          userId: 'admin',
          email: adminEmail || 'admin',
          action: 'Claim Rejected',
          details: `Rejected claim request ${id} for homestay: ${claim.homestayId}`,
          timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'Claim request has been rejected.' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to action claim request' });
    }
  });

  // 2. Draft updates Workflow
  app.post('/api/partner/updates', async (req, res) => {
    try {
      const { homestayId, partnerUserId, updateData } = req.body;
      if (!homestayId || !partnerUserId || !updateData) {
        res.status(400).json({ error: 'homestayId, partnerUserId, and updateData are required' });
        return;
      }

      // Check homestay owner boundary
      const homestays = dbStore.getHomestays();
      const hs = homestays.find(h => h.id === homestayId);
      if (!hs) {
        res.status(404).json({ error: 'Homestay not found' });
        return;
      }
      if (hs.ownerId !== partnerUserId) {
        res.status(403).json({ error: 'Unauthorized: You do not own this homestay listing' });
        return;
      }

      const pendingUp: PendingUpdate = {
        id: `update-${Date.now()}`,
        homestayId,
        partnerUserId,
        updateData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await dbStore.saveRecord('pending_updates', pendingUp);

      res.json({ success: true, pendingUpdate: pendingUp, message: 'Changes submitted mock revision successfully. Approval is pending admin verification.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save pending update' });
    }
  });

  app.get('/api/partner/updates', (req, res) => {
    try {
      const { partnerUserId } = req.query;
      const updates = dbStore.getPendingUpdates();
      if (partnerUserId) {
        const filtered = updates.filter(u => u.partnerUserId === partnerUserId);
        res.json({ success: true, updates: filtered });
      } else {
        res.json({ success: true, updates });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/updates', adminAuth, (req, res) => {
    try {
      const updates = dbStore.getPendingUpdates();
      res.json({ success: true, updates });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/updates/:id/action', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, adminRemarks, adminEmail } = req.body; // 'approve' | 'reject'
      if (!action || !['approve', 'reject'].includes(action)) {
        res.status(400).json({ error: 'action (approve/reject) is required' });
        return;
      }

      const updates = dbStore.getPendingUpdates();
      const pendingUp = updates.find(u => u.id === id);
      if (!pendingUp) {
        res.status(404).json({ error: 'Pending update request not found' });
        return;
      }

      if (pendingUp.status !== 'pending') {
        res.status(400).json({ error: `This update request has already been ${pendingUp.status}` });
        return;
      }

      if (action === 'approve') {
        // Merge directly in originally owned homestay data
        const homestays = dbStore.getHomestays();
        const hs = homestays.find(h => h.id === pendingUp.homestayId);
        if (!hs) {
          res.status(404).json({ error: 'Original homestay listing not found' });
          return;
        }

        // Apply fields of updateData onto hs:
        await dbStore.updateRecord('homestays', hs.id, {
          ...pendingUp.updateData,
          id: hs.id // safety lock retain ID
        });

        // Set approved status of the pending update:
        await dbStore.updateRecord('pending_updates', pendingUp.id, {
          status: 'approved'
        });

        dbStore.addAuditLog({
          id: `log-${Date.now()}`,
          userId: 'admin',
          email: adminEmail || 'admin',
          action: 'Update Approved',
          details: `Approved information revision request for homestay: ${hs.name} (${hs.id})`,
          timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'Revision approved and merged successfully.' });
      } else {
        await dbStore.updateRecord('pending_updates', pendingUp.id, {
          status: 'rejected'
        });

        dbStore.addAuditLog({
          id: `log-${Date.now()}`,
          userId: 'admin',
          email: adminEmail || 'admin',
          action: 'Update Rejected',
          details: `Rejected details update request ${id} for homestay: ${pendingUp.homestayId}`,
          timestamp: new Date().toISOString()
        });

        res.json({ success: true, message: 'Revision request has been rejected.' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to action update request' });
    }
  });

  // 3. Inquiries
  app.post('/api/inquiries', async (req, res) => {
    try {
      const { homestayId, userName, userMobile, userEmail, travelDate, numberOfGuests, message } = req.body;
      if (!homestayId || !userName || !userEmail) {
        res.status(400).json({ error: 'homestayId, userName, and userEmail are required' });
        return;
      }

      const inquiry: Inquiry = {
        id: `inquiry-${Date.now()}`,
        homestayId,
        userName,
        userMobile: userMobile || '',
        userEmail,
        travelDate: travelDate || '',
        numberOfGuests: numberOfGuests ? Number(numberOfGuests) : 1,
        message: message || '',
        inquiryStatus: 'new',
        createdAt: new Date().toISOString()
      };

      await dbStore.saveRecord('inquiries', inquiry);

      res.json({ success: true, inquiry, message: 'Inquiry sent successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit inquiry' });
    }
  });

  app.get('/api/partner/inquiries', (req, res) => {
    try {
      const { partnerUserId } = req.query;
      const inquiries = dbStore.getInquiries();
      const homestays = dbStore.getHomestays();

      const enrichedInquiries = inquiries.map(inq => {
        const home = homestays.find(h => h.id === inq.homestayId);
        return {
          ...inq,
          homestayName: home ? home.name : 'Unknown Homestay'
        };
      });

      if (partnerUserId) {
        // filter homestays owned by this partner first:
        const ownedHomestayIds = homestays.filter(h => h.ownerId === partnerUserId).map(h => h.id);
        const filteredInquiries = enrichedInquiries.filter(inq => ownedHomestayIds.includes(inq.homestayId));
        res.json({ success: true, inquiries: filteredInquiries });
      } else {
        res.json({ success: true, inquiries: enrichedInquiries });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/inquiries', adminAuth, (req, res) => {
    try {
      const inquiries = dbStore.getInquiries();
      const homestays = dbStore.getHomestays();
      const enrichedInquiries = inquiries.map(inq => {
        const home = homestays.find(h => h.id === inq.homestayId);
        return {
          ...inq,
          homestayName: home ? home.name : 'Unknown Homestay'
        };
      });
      res.json({ success: true, inquiries: enrichedInquiries });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/partner/inquiries/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'new' | 'contacted' | 'converted' | 'closed'
      if (!status) {
        res.status(400).json({ error: 'status is required' });
        return;
      }

      const inquiries = dbStore.getInquiries();
      const inq = inquiries.find(i => i.id === id);
      if (!inq) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }

      await dbStore.updateRecord('inquiries', inq.id, {
        inquiryStatus: status
      });

      res.json({ success: true, message: `Inquiry status changed to ${status}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update inquiry status' });
    }
  });

  // 4. Ownership History trail get (Admin only)
  app.get('/api/admin/ownership-history', adminAuth, (req, res) => {
    try {
      const history = dbStore.getOwnershipHistory();
      res.json({ success: true, history });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==================== FRONTEND DELIVERYS ====================

  // ==================== FRONTEND DELIVERYS ====================

  // Robots.txt configuration (SEO crawl directive)
  app.get('/robots.txt', (req, res) => {
    res.header('Content-Type', 'text/plain');
    let robots = `User-agent: *\n`;
    robots += `Allow: /\n`;
    robots += `Disallow: /admin\n`;
    robots += `Disallow: /profile\n`;
    robots += `Sitemap: https://hillytrip.com/sitemap.xml\n`;
    res.send(robots);
  });

  // Dynamic XML Sitemap Generator (recalculates index parameters in real-time)
  app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    
    const destinations = dbStore.getDestinations() || [];
    const attractions = dbStore.getAttractions() || [];
    const homestays = dbStore.getHomestays() || [];
    const routes = dbStore.getRoutes() || [];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Constant Base routes
    const basePaths = ['', '/destinations', '/attractions', '/homestays', '/plan-my-trip', '/book-car', '/contribute'];
    basePaths.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>https://hillytrip.com${p}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });
    
    // Dynamic Destinations entries
    destinations.forEach(d => {
      xml += `  <url>\n`;
      xml += `    <loc>https://hillytrip.com/destinations/${toSlug(d.id)}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });
    
    // Dynamic Attractions entries
    attractions.forEach(a => {
      xml += `  <url>\n`;
      xml += `    <loc>https://hillytrip.com/attractions/${toSlug(a.id)}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });
    
    // Dynamic Homestays entries
    homestays.forEach(h => {
      xml += `  <url>\n`;
      xml += `    <loc>https://hillytrip.com/homestays/${toSlug(h.id)}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });
    
    // Dynamic Routes entries
    routes.forEach(r => {
      xml += `  <url>\n`;
      xml += `    <loc>https://hillytrip.com/routes/${toSlug(r.id)}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.5</priority>\n`;
      xml += `  </url>\n`;
    });
    
    xml += `</urlset>\n`;
    res.send(xml);
  });

  // Dynamic metadata & Structured JSON-LD injector for crawl indexing
  let viteInstance: any = null;
  const handleHtmlRequest = async (req: express.Request, res: express.Response) => {
    try {
      const urlPath = req.path;
      let title = "HillyTrip - India's Intelligent Mountain Travel Network";
      let description = "India's Intelligent Mountain Travel Network - Your comprehensive travel intelligence platform for Himalayan routes, attractions, and eco-homestays.";
      let image = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop";
      let canonical = `https://hillytrip.com${urlPath}`;
      let schemaJson = '';

      const parts = urlPath.split('/').filter(Boolean);
      const idOrSlug = parts.length > 1 ? decodeURIComponent(parts[parts.length - 1] || '') : '';

      if (urlPath.includes('/destination/') || urlPath.includes('/destinations/')) {
        const d = findDestination(idOrSlug);
        if (d) {
          title = `${d.name} - Travel Guide | HilliTrip`;
          description = `Discover ${d.name} in ${d.district || ''}, ${d.state || ''}. Highlights: ${d.tourismType || ''}, best season: ${d.bestSeason || ''}. ${d.description.substring(0, 100)}`;
          image = d.image || image;
          schemaJson = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Place",
            "name": d.name,
            "description": d.description,
            "image": d.image,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": d.district || '',
              "addressRegion": d.state || '',
              "addressCountry": "India"
            }
          });
        }
      } else if (urlPath.includes('/attraction/') || urlPath.includes('/attractions/')) {
        const a = findAttraction(idOrSlug);
        if (a) {
          title = `${a.name} - Travel Guide | HilliTrip`;
          description = `Explore ${a.name}, a prominent ${a.category || 'Attraction'} in ${a.district || ''}, ${a.state || ''}. ${a.description.substring(0, 100)}`;
          image = a.image || image;
          schemaJson = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristAttraction",
            "name": a.name,
            "description": a.description,
            "image": a.image,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": a.district || '',
              "addressRegion": a.state || '',
              "addressCountry": "India"
            }
          });
        }
      } else if (urlPath.includes('/homestay/') || urlPath.includes('/homestays/')) {
        const h = findHomestay(idOrSlug);
        if (h) {
          title = `${h.name} - Photos, Contact & Details | HilliTrip`;
          description = `${h.name} is a cozy homestay in ${h.district || ''}, ${h.state || ''}. Starting at only INR ${h.priceMin || ''}/night. ${h.description ? h.description.substring(0, 100) : ''}`;
          image = (h.images && h.images[0]) || image;
          schemaJson = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            "name": h.name,
            "description": h.description || '',
            "image": image,
            "priceRange": `INR ${h.priceMin} - ${h.priceMax}`,
            "telephone": h.contact,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": h.district || '',
              "addressRegion": h.state || '',
              "addressCountry": "India"
            }
          });
        }
      }

      if (description.length > 165) {
        description = description.substring(0, 160) + '...';
      }

      const indexHtmlPath = process.env.NODE_ENV === 'production'
        ? path.join(process.cwd(), 'dist', 'index.html')
        : path.join(process.cwd(), 'index.html');

      let template = '';
      try {
        template = await fs.promises.readFile(indexHtmlPath, 'utf8');
      } catch {
        template = `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>HillyTrip</title></head><body><div id="root"></div></body></html>`;
      }

      const metaHtml = `
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${canonical}" />
  
  <!-- Open Graph / FB -->
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:type" content="website" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  
  <!-- Structured Data JSON-LD -->
  ${schemaJson ? `<script type="application/ld+json">${schemaJson}</script>` : ''}
      `;

      let finalHtml = template;
      finalHtml = finalHtml.replace(/<title>.*?<\/title>/gi, '');
      finalHtml = finalHtml.replace(/<meta name="description" content=".*?" \/>/gi, '');
      
      if (finalHtml.includes('</head>')) {
        finalHtml = finalHtml.replace('</head>', `${metaHtml}</head>`);
      } else {
        finalHtml = finalHtml.replace('<body>', `<head>${metaHtml}</head><body>`);
      }

      if (process.env.NODE_ENV !== 'production' && viteInstance) {
        finalHtml = await viteInstance.transformIndexHtml(req.originalUrl || req.url, finalHtml);
      }

      res.header('Content-Type', 'text/html');
      res.send(finalHtml);
    } catch (err: any) {
      console.error('[SEO Fallback pre-render error]:', err);
      res.status(500).send("HillyTrip travel indexer momentarily unavailable.");
    }
  };

  // Bind key page paths for pre-render SEO
  app.get([
    '/', 
    '/destinations/:id', 
    '/destination/:id', 
    '/attractions/:id', 
    '/attraction/:id', 
    '/homestays/:id', 
    '/homestay/:id'
  ], handleHtmlRequest);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    viteInstance = vite;
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false })); // let custom get handles render html index
    app.get('*', handleHtmlRequest);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Critical server startup failure:', err);
});
