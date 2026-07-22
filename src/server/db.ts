import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

function getDefaultAdminBcryptHash(): string {
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!adminPassword) {
    throw new Error('FATAL CONFIGURATION ERROR: ADMIN_INITIAL_PASSWORD environment variable is required but missing!');
  }
  if (adminPassword.length < 8) {
    throw new Error('FATAL CONFIGURATION ERROR: ADMIN_INITIAL_PASSWORD must be at least 8 characters long!');
  }
  return bcrypt.hashSync(adminPassword, 10);
}
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, getDocFromServer, deleteDoc, onSnapshot, setLogLevel } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import { Hub, Route, Destination, Attraction, Homestay, ImageItem, Contribution, TripLead, CarLead, RouteSearchResult, Driver, UserRole, User, Role, Permission, RolePermission, UserPermission, AuditLog, PhotoContribution, PhotoNotification, AppNotification, ClaimRequest, Inquiry, OwnershipHistory, PendingUpdate, SiteSettings, BookingLead, BookingStatusHistory, BookingNotification, BookingActivityLog, SystemReport, BlogCategory, BlogTag, BlogTagMap, BlogAuthor, BlogImage, BlogRelatedLink, BlogFaq, BlogVersion, BlogView, BlogLike, BlogBookmark, BlogShare, BlogComment, BlogSeo, BlogSchedule, BlogRelatedLink as BlogActivityLog, Blog, GeospatialRelationship, RoomCategory, RoomImage, HomestayGallery, HomestayReview, ChatProfile, ConversationParticipant, ChatConversation, ChatMessage, ChatNotification, QuoteRequest, QuoteRequestRecipient, Quote } from '../types';
import { DEFAULT_HOMESTAY_IMAGE } from '../constants';
import { getSmartDirectUnsplashUrl } from '../utils/imagePool';
import { TaxiOperator } from '../types';

export function toIdSlug(id: any): string {
  if (id === undefined || id === null) return '';
  return String(id)
    .toLowerCase()
    .replace(/[^a-z0-9\s_'-]/g, '')
    .trim()
    .replace(/[\s_']+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
      lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 0;
  }
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const aClamped = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(aClamped), Math.sqrt(1 - aClamped));
  const d = R * c; // Distance in km
  if (isNaN(d)) return 0;
  return Math.round(d * 10) / 10;
}

export function getHubCoordinates(hub: Hub, destinations: Destination[]): { latitude: number; longitude: number } | null {
  if (hub.latitude !== undefined && hub.longitude !== undefined && Number(hub.latitude) !== 0) {
    return { latitude: Number(hub.latitude), longitude: Number(hub.longitude) };
  }
  
  // Try dbStore hubs first
  try {
    const entry = dbStore.getHubs().find(h => h.name === hub.name || h.id === hub.id);
    if (entry && entry.latitude !== undefined && entry.longitude !== undefined && Number(entry.latitude) !== 0) {
      return { latitude: Number(entry.latitude), longitude: Number(entry.longitude) };
    }
  } catch (e) {}

  // Find destinations mapping to this taxi stand
  const matchedDests = destinations ? destinations.filter(d => 
    d && d.nearestTaxiStand && 
    (d.nearestTaxiStand.toLowerCase().trim() === hub.name.toLowerCase().trim() ||
     d.nearestTaxiStand.toLowerCase().trim() === hub.id.toLowerCase().trim())
  ) : [];
  
  for (const d of matchedDests) {
    if (d.latitude !== undefined && d.longitude !== undefined && Number(d.latitude) !== 0) {
      return { latitude: Number(d.latitude), longitude: Number(d.longitude) };
    }
  }
  
  return null;
}

const DB_FILE = path.join(process.cwd(), 'hillytrip_db_store.json');
const CONFIG_FILE = path.join(process.cwd(), 'firebase-applet-config.json');

// Silence internal Firestore warning/error logs to prevent sandboxed iframe notifications
try {
  setLogLevel('silent');
} catch (e) {
  console.warn('Failed to set firestore log level on server:', e);
}

let firebaseConfig: any = null;
if (fs.existsSync(CONFIG_FILE)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch (e) {
    console.error('Error loading firebase applet config on server:', e);
  }
}

export let firestoreDb: any = null;
export let googleFirestoreDb: any = null;
export let isFirestoreOnline = false;

export let supabase: any = null;
export let isSupabaseOnline = false;

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || '';

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("[db.ts] Supabase JS Client initialized successfully.");
  } catch (e) {
    console.error('Failed to initialize Supabase on server:', e);
  }
}

export async function writeToInteractions(type: string, id: string, payload: any) {
  if (supabase && isSupabaseOnline) {
    try {
      const { error } = await supabase.from('interactions').insert({
        id: `${type}_${id}_${Date.now()}`,
        type: type,
        entityId: typeof payload === 'string' ? payload : JSON.stringify(payload),
        timestamp: new Date().toISOString()
      });
      if (error) {
        console.error(`[Custom Persistence] Failed to insert interaction for ${type} id ${id}:`, error);
      } else {
        console.log(`[Custom Persistence] Successfully persisted ${type} id ${id} to interactions.`);
      }
    } catch (e: any) {
      console.error(`[Custom Persistence] Exception inserting interaction for ${type}:`, e);
    }
  }
}

// Firebase is completely disabled as the application has migrated entirely to Supabase
firestoreDb = null;
googleFirestoreDb = null;
isFirestoreOnline = false;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage = "Operation timed out"): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<T>;
}

async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) {
    isSupabaseOnline = false;
    return false;
  }
  try {
    const { error } = await withTimeout(
      supabase.from('destinations').select('destination_id').limit(1),
      5000,
      "Supabase connection check timed out"
    ) as any;
    if (error) {
      const isTableMissing = error.code === 'PGRST205' || 
                             error.code === 'PGRST116' || 
                             error.code === '42P01' ||
                             error.message?.includes('schema cache') || 
                             error.message?.includes('not found') || 
                             error.message?.includes('does not exist') ||
                             error.message?.includes('relation');
      if (isTableMissing) {
        console.warn("[Supabase Connection Warning] Connected to Supabase, but the 'destinations' table was not found. Please run the SQL schema to initialize the tables.");
        isSupabaseOnline = false;
        return false;
      } else {
        // If it's a permission issue or another postgres error, the host is connected and ready
        console.warn(`[Supabase Connection Warning] Connected but query returned error: ${error.message || JSON.stringify(error)}.`);
      }
    }
    console.log("Supabase cloud database connection verified successfully via destinations table.");
    isSupabaseOnline = true;
    return true;
  } catch (error) {
    isSupabaseOnline = false;
    console.log("Supabase connection check failed or timed out.");
    return false;
  }
}

async function testConnection(): Promise<boolean> {
  if (!firestoreDb) {
    isFirestoreOnline = false;
    return false;
  }
  try {
    await withTimeout(
      getDocFromServer(doc(firestoreDb, 'hubs', 'connection-test-doc-id')),
      10000,
      "Firestore connection check timed out"
    );
    console.log("Firebase Firestore connection verified successfully.");
    isFirestoreOnline = true;
    return true;
  } catch (error) {
    isFirestoreOnline = false;
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration. The client is offline.");
    } else {
      console.log("Firestore connection check completed (test document did not exist or connection timed out, running on local/cache fallback).");
    }
    return false;
  }
}


enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function formatFirestoreErrorMessage(error: any, operation: string, path: string): string {
  const originalMessage = error instanceof Error ? error.message : String(error);
  if (originalMessage.toLocaleLowerCase().includes('permission-denied') || originalMessage.toLocaleLowerCase().includes('permission') || originalMessage.toLocaleLowerCase().includes('insufficient')) {
    return `Firebase Security Rules Denied: Insufficient permissions for ${operation} on path "${path}". Please make sure the unique string ID conforms to matches('^[a-zA-Z0-9_\\\\-]+$') (no spaces, pure alphanumeric/dash/underscore chars) and all required fields are populated without custom extraneous properties.`;
  }
  return `Firestore Error during ${operation} on "${path}": ${originalMessage}`;
}

function sanitizeDocumentPayload(colName: string, data: any): any {
  if (!data || typeof data !== 'object') return data;
  const cleaned: any = {};
  
  const schemaKeys: Record<string, string[]> = {
    hubs: ['id', 'name', 'type', 'latitude', 'longitude', 'district', 'state', 'country'],
    routes: ['id', 'fromHubId', 'toHubId', 'path', 'type', 'fareMin', 'fareMax', 'timeMin', 'timeMax', 'verified', 'lastUpdated', 'distance'],
    destinations: ['id', 'name', 'description', 'tourismType', 'bestSeason', 'image', 'gallery', 'isHiddenGem', 'isFeaturedThisWeek', 'isPopularDestination', 'coverImage', 'coverPrompt', 'coverStatus', 'latitude', 'longitude', 'district', 'state', 'country', 'nearestHubId', 'distanceFromHub', 'nearbyAttractions', 'nearbyHomestays', 'nearbyDestinations'],
    attractions: ['id', 'name', 'category', 'destinationId', 'description', 'image', 'gallery', 'isHiddenGem', 'isFeaturedThisWeek', 'isFeaturedAttraction', 'coverImage', 'coverPrompt', 'coverStatus', 'latitude', 'longitude', 'district', 'state', 'country', 'nearestDestinationId', 'distanceFromDestination', 'nearestHubId', 'distanceFromHub'],
    homestays: ['id', 'name', 'destinationId', 'priceMin', 'priceMax', 'contact', 'amenities', 'images', 'status', 'latitude', 'longitude', 'district', 'state', 'country', 'nearestDestinationId', 'distanceFromDestination', 'nearestHubId', 'distanceFromHub', 'ownerId', 'description', 'whatsappNumber', 'roomRates', 'contactInfo', 'checkInInfo', 'houseRules', 'breakfastIncluded', 'lunchAvailable', 'dinnerAvailable'],
    drivers: ['id', 'name', 'mobile', 'whatsapp', 'vehicleType', 'vehicleName', 'vehicleNumber', 'serviceAreas', 'pricingPerDay', 'createdAt', 'status', 'licenseNumber'],
    images: ['id', 'destinationId', 'attractionId', 'url', 'uploadedBy', 'uploadDate', 'status', 'caption', 'altText', 'userId', 'rejectionReason'],
    contributions: ['id', 'type', 'details', 'contributorName', 'contributorMobile', 'status', 'createdAt'],
    trip_leads: ['id', 'name', 'mobile', 'destination', 'travelDate', 'budget', 'numTravellers', 'services', 'createdAt'],
    car_leads: ['id', 'pickup', 'destination', 'travelDate', 'passengers', 'name', 'mobile', 'status', 'createdAt'],
    users: ['id', 'email', 'name', 'passwordHash', 'role', 'roles', 'status', 'emailVerified', 'customPermissions', 'createdAt', 'mobile', 'businessName', 'businessType', 'partnerLocation', 'partnerMobile', 'partnerStatus', 'partnerDocuments', 'contributorRegion', 'contributorReason', 'contributorExperience', 'contributorStatus', 'taxiOperatorStatus', 'taxiOperatorDetails'],
    taxi_operators: ['id', 'user_id', 'business_name', 'owner_name', 'phone', 'email', 'address', 'verification_status', 'is_active', 'created_at', 'updated_at'],
    roles: ['id', 'name', 'description'],
    permissions: ['id', 'name', 'description'],
    role_permissions: ['id', 'roleId', 'permissionId'],
    user_permissions: ['id', 'userId', 'permissionId'],
    audit_logs: ['id', 'userId', 'email', 'action', 'details', 'timestamp', 'ipAddress'],
    photo_contributions: ['id', 'userId', 'travellerName', 'travellerEmail', 'destinationId', 'imageUrl', 'status', 'uploadedAt', 'approvedBy', 'approvedAt', 'rejectionReason'],
    photo_notifications: ['id', 'userId', 'title', 'message', 'type', 'isRead', 'createdAt'],
    notifications: ['id', 'title', 'message', 'type', 'status', 'imageUrl', 'destinationId', 'attractionId', 'homestayId', 'routeName', 'routeStatus', 'createdAt', 'approvedAt', 'approvedBy', 'isPushNotification', 'priority'],
    claim_requests: ['id', 'homestayId', 'partnerUserId', 'ownerName', 'mobile', 'whatsapp', 'email', 'message', 'ownershipProof', 'status', 'adminRemarks', 'createdAt'],
    inquiries: ['id', 'homestayId', 'userName', 'userMobile', 'userEmail', 'travelDate', 'numberOfGuests', 'message', 'inquiryStatus', 'createdAt'],
    ownership_history: ['id', 'homestayId', 'previousOwnerId', 'newOwnerId', 'approvedByAdminId', 'reason', 'timestamp'],
    pending_updates: ['id', 'homestayId', 'partnerUserId', 'updateData', 'status', 'createdAt'],
    site_settings: ['id', 'is_active', 'site_name', 'desktop_logo_url', 'mobile_logo_url', 'footer_logo_url', 'white_logo_url', 'dark_logo_url', 'favicon_url', 'app_icon_url', 'apple_touch_icon_url', 'android_pwa_icon_url', 'hero_video_url', 'hero_image_url', 'primary_color', 'secondary_color', 'accent_color', 'success_color', 'warning_color', 'error_color', 'heading_font', 'body_font', 'button_font', 'default_language', 'tagline', 'footer_copyright', 'contact_email', 'support_email', 'social_links', 'updated_at', 'updated_by', 'status']
  };

  const normColName = colName.toLowerCase().trim();
  const allowedKeys = schemaKeys[normColName] || schemaKeys[normColName.replace(/s$/, '')];
  if (!allowedKeys) {
    Object.keys(data).forEach(k => {
      if (!k.startsWith('_')) {
        cleaned[k] = data[k];
      }
    });
    return cleaned;
  }

  allowedKeys.forEach(k => {
    if (k in data) {
      cleaned[k] = data[k];
    }
  });
  return cleaned;
}

function getSupabaseTableAndPayload(collectionName: string, docId: string, data: any): { table: string; payload: any; idCol: string } {
  if (collectionName === 'destinations') {
    return {
      table: 'destinations',
      idCol: 'destination_id',
      payload: {
        destination_id: docId,
        village_name: data.name || '',
        description: data.description || '',
        district: data.district || '',
        state: data.state || '',
        latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : null,
        longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : null,
        elevation: data.elevation !== undefined && data.elevation !== null ? Number(data.elevation) : null,
        known_for: data.known_for || data.tourismType || ''
      }
    };
  }
  if (collectionName === 'hubs') {
    return {
      table: 'taxi_stands',
      idCol: 'taxi_id',
      payload: {
        taxi_id: docId,
        destination_id: data.nearestHubId || data.nearestDestinationId || 'VIL0001',
        taxi_stand_name: data.name || '',
        latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : null,
        longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : null
      }
    };
  }
  if (collectionName === 'attractions') {
    return {
      table: 'attractions',
      idCol: 'attraction_id',
      payload: {
        attraction_id: docId,
        attraction_name: data.name || '',
        category: data.category || 'Viewpoint',
        destination_id: data.destinationId || data.destination_id || '',
        description: data.description || '',
        latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : null,
        longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : null,
        isHiddenGem: data.isHiddenGem || false,
        isFeaturedAttraction: data.isFeaturedAttraction || false,
        image: data.image || '',
        district: data.district || '',
        state: data.state || '',
        country: data.country || 'India'
      }
    };
  }
  if (collectionName === 'homestays') {
    return {
      table: 'homestays',
      idCol: 'homestay_id',
      payload: {
        homestay_id: docId,
        destination_id: data.destinationId || data.nearestDestinationId || data.destination_id || '',
        homestay_name: data.name || '',
        contact_number: data.contact || data.contact_number || '',
        latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : null,
        longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : null,
        image_url: (Array.isArray(data.images) && data.images[0]) || data.image_url || data.image || '',
        status: data.status || null,
        ownerId: data.ownerId || null,
        destinationId: data.destinationId || null,
        priceMin: data.priceMin !== undefined && data.priceMin !== null ? Number(data.priceMin) : null,
        priceMax: data.priceMax !== undefined && data.priceMax !== null ? Number(data.priceMax) : null,
        nearestDestinationId: data.nearestDestinationId || null,
        distanceFromDestination: data.distanceFromDestination !== undefined && data.distanceFromDestination !== null ? Number(data.distanceFromDestination) : null,
        nearestHubId: data.nearestHubId || null,
        distanceFromHub: data.distanceFromHub !== undefined && data.distanceFromHub !== null ? Number(data.distanceFromHub) : null,
        whatsappNumber: data.whatsappNumber || null,
        roomRates: data.roomRates || [],
        contactInfo: data.contactInfo || null,
        checkInInfo: data.checkInInfo || null,
        houseRules: data.houseRules || null,
        breakfastIncluded: data.breakfastIncluded === true || String(data.breakfastIncluded).toLowerCase() === 'true',
        lunchAvailable: data.lunchAvailable === true || String(data.lunchAvailable).toLowerCase() === 'true',
        dinnerAvailable: data.dinnerAvailable === true || String(data.dinnerAvailable).toLowerCase() === 'true',
        amenities: data.amenities || []
      }
    };
  }
  return {
    table: collectionName,
    idCol: 'id',
    payload: { ...data, id: docId }
  };
}

async function runWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const isNetworkError = err?.message?.includes('fetch failed') || 
                             err instanceof TypeError || 
                             String(err).includes('fetch failed') ||
                             err?.message?.includes('network') ||
                             err?.message?.includes('timeout') ||
                             err?.message?.includes('ECONNRESET') ||
                             err?.message?.includes('ETIMEDOUT');
      if (isNetworkError && attempt < maxRetries) {
        const delay = attempt * 1500;
        console.log(`[Supabase Retry] Network/Fetch error. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

async function syncDoc(collectionName: string, docId: string, data: any) {
  const cleaned = sanitizeDocumentPayload(collectionName, data);

  if (supabase && isSupabaseOnline) {
    let table = '';
    try {
      const result = getSupabaseTableAndPayload(collectionName, docId, cleaned);
      table = result.table;
      await runWithRetry(async () => {
        const { error } = await supabase.from(table).upsert(result.payload);
        if (error) throw error;
      });
      return;
    } catch (err: any) {
      const isFetchError = err?.message?.includes('fetch failed') || 
                           err instanceof TypeError || 
                           String(err).includes('fetch failed') ||
                           err?.message?.includes('network') ||
                           err?.message?.includes('timeout') ||
                           err?.message?.includes('ECONNRESET') ||
                           err?.message?.includes('ETIMEDOUT') ||
                           err?.message?.includes('fetch');
      if (isFetchError) {
        console.log(`[Supabase Sync] Network/fetch error during syncDoc. Setting isSupabaseOnline to false for graceful fallback.`);
        isSupabaseOnline = false;
      }

      if (err.code === '42501' || err.message?.includes('permission denied')) {
        console.log(`[Database Sync Info] Read-only permission enforced/RLS active on "${table}" for doc "${docId}". Local cache remains primary.`);
      } else if (err.code === '42P01' || err.code === 'PGRST205' || err.code === 'PGRST116' || err.message?.includes('schema cache') || err.message?.includes('not found') || err.message?.includes('does not exist')) {
        console.log(`[Database Sync Info] Table or column mapping mismatch for "${table}" on doc "${docId}" in Supabase. Local cache holds authoritative status.`);
      } else if (!isFetchError) {
        console.warn(`[Database Sync Warn] Failed to sync ${docId} of ${collectionName}:`, err.message || err);
      }
      if (!isFetchError) {
        return;
      }
    }
  }

  if (googleFirestoreDb) {
    try {
      const docRef = googleFirestoreDb.collection(collectionName).doc(docId);
      await docRef.set(cleaned);
      return;
    } catch (err: any) {
      console.error(`Failed to sync doc ${docId} of ${collectionName} to Firestore via Admin SDK:`, err);
    }
  }

  if (!firestoreDb) {
    console.log(`[Database Offline] Skipping sync for ${collectionName}/${docId} because connection is not established.`);
    return;
  }
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    await setDoc(docRef, cleaned);
  } catch (err: any) {
    console.error(`Failed to sync doc ${docId} of ${collectionName} to Firestore via Client SDK:`, err);
    throw new Error(formatFirestoreErrorMessage(err, 'write', `${collectionName}/${docId}`));
  }
}

async function deleteDocInFirestore(collectionName: string, docId: string) {
  if (supabase && isSupabaseOnline) {
    let table = '';
    try {
      const result = getSupabaseTableAndPayload(collectionName, docId, {});
      table = result.table;
      await runWithRetry(async () => {
        const { error } = await supabase.from(table).delete().eq(result.idCol, docId);
        if (error) throw error;
      });
      return;
    } catch (err: any) {
      const isFetchError = err?.message?.includes('fetch failed') || 
                           err instanceof TypeError || 
                           String(err).includes('fetch failed') ||
                           err?.message?.includes('network') ||
                           err?.message?.includes('timeout') ||
                           err?.message?.includes('ECONNRESET') ||
                           err?.message?.includes('ETIMEDOUT') ||
                           err?.message?.includes('fetch');
      if (isFetchError) {
        console.log(`[Supabase Sync] Network/fetch error during deleteDocInFirestore. Setting isSupabaseOnline to false for graceful fallback.`);
        isSupabaseOnline = false;
      }

      if (err.code === '42501' || err.message?.includes('permission denied')) {
        console.log(`[Database Sync Info] Read-only permission enforced/RLS active on "${table}" for delete of "${docId}". Local sandbox preserved.`);
      } else if (!isFetchError) {
        console.warn(`[Database Sync Warn] Failed to delete doc ${docId} of ${collectionName} in Supabase:`, err.message || err);
      }
      if (!isFetchError) {
        return;
      }
    }
  }

  if (googleFirestoreDb) {
    try {
      const docRef = googleFirestoreDb.collection(collectionName).doc(docId);
      await docRef.delete();
      return;
    } catch (err: any) {
      console.error(`Failed to delete doc ${docId} of ${collectionName} in Firestore via Admin SDK:`, err);
    }
  }

  if (!firestoreDb) {
    console.log(`[Database Offline] Skipping delete for ${collectionName}/${docId} because connection is not established.`);
    return;
  }
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error(`Failed to delete doc ${docId} of ${collectionName} in Firestore via Client SDK:`, err);
    throw new Error(formatFirestoreErrorMessage(err, 'delete', `${collectionName}/${docId}`));
  }
}

async function syncCollectionToFirestore(collectionName: string, items: any[]) {
  const validItems = items.filter(item => item && item.id);
  const limit = 40; // Write 40 documents concurrently in stages
  const chunks: any[][] = [];
  for (let i = 0; i < validItems.length; i += limit) {
    chunks.push(validItems.slice(i, i + limit));
  }

  if (supabase && isSupabaseOnline) {
    try {
      let successCount = 0;
      for (const chunk of chunks) {
        const payloads = chunk.map(item => {
          const cleaned = sanitizeDocumentPayload(collectionName, item);
          const { payload } = getSupabaseTableAndPayload(collectionName, item.id, cleaned);
          return payload;
        });
        const firstId = chunk[0].id;
        const { table } = getSupabaseTableAndPayload(collectionName, firstId, {});
        
        await runWithRetry(async () => {
          const { error } = await supabase.from(table).upsert(payloads);
          if (error) throw error;
        });

        successCount += chunk.length;
      }
      console.log(`Synced ${successCount} records of ${collectionName} to Supabase in throttled concurrent chunks.`);
      return;
    } catch (e: any) {
      const isFetchError = e?.message?.includes('fetch failed') || 
                           e instanceof TypeError || 
                           String(e).includes('fetch failed') ||
                           e?.message?.includes('network') ||
                           e?.message?.includes('timeout') ||
                           e?.message?.includes('ECONNRESET') ||
                           e?.message?.includes('ETIMEDOUT') ||
                           e?.message?.includes('fetch');
      if (isFetchError) {
        console.log(`[Supabase Sync] Network/fetch error during syncCollectionToFirestore. Setting isSupabaseOnline to false for graceful fallback.`);
        isSupabaseOnline = false;
      }

      if (e.code === '42501' || e.message?.includes('permission denied')) {
        console.log(`[Database Sync Info] Read-only permission enforced/RLS active when bulk syncing "${collectionName}". Local cache remains authoritative.`);
      } else if (e.code === '42P01' || e.code === 'PGRST205' || e.code === 'PGRST116' || e.message?.includes('schema cache') || e.message?.includes('not found') || e.message?.includes('does not exist')) {
        console.log(`[Database Sync Info] Table or column mapping mismatch for bulk sync of "${collectionName}". Local cache is authoritative.`);
      } else if (!isFetchError) {
        console.warn(`[Database Sync Warn] Failed to bulk sync ${collectionName} to Supabase:`, e.message || e);
      }
      if (!isFetchError) {
        return;
      }
    }
  }

  if (googleFirestoreDb) {
    try {
      let successCount = 0;
      for (const chunk of chunks) {
        const batch = googleFirestoreDb.batch();
        for (const item of chunk) {
          const cleaned = sanitizeDocumentPayload(collectionName, item);
          const docRef = googleFirestoreDb.collection(collectionName).doc(item.id);
          batch.set(docRef, cleaned);
        }
        await batch.commit();
        successCount += chunk.length;
      }
      console.log(`Synced ${successCount} records of ${collectionName} to Firestore via Admin SDK in throttled concurrent chunks.`);
      return;
    } catch (e) {
      console.error(`Error syncing ${collectionName} to Firestore via Admin SDK:`, e);
    }
  }

  if (!firestoreDb) return;
  try {
    let successCount = 0;
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (item) => {
          const cleaned = sanitizeDocumentPayload(collectionName, item);
          const docRef = doc(firestoreDb, collectionName, item.id);
          await setDoc(docRef, cleaned);
          successCount++;
        })
      );
    }
    console.log(`Synced ${successCount} records of ${collectionName} to Firestore via Client SDK in throttled concurrent chunks.`);
  } catch (e) {
    console.error(`Error syncing ${collectionName} to Firestore via Client SDK:`, e);
  }
}


interface Schema {
  hubs: Hub[];
  routes: Route[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  images: ImageItem[];
  contributions: Contribution[];
  tripLeads: TripLead[];
  carLeads: CarLead[];
  drivers: Driver[];
  userRoles: UserRole[];
  users: User[];
  roles: Role[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  userPermissions: UserPermission[];
  auditLogs: AuditLog[];
  photoContributions: PhotoContribution[];
  notifications: PhotoNotification[];
  appNotifications: AppNotification[];
  claimRequests?: ClaimRequest[];
  taxiOperators?: TaxiOperator[];
  vehicles?: any[];
  inquiries?: Inquiry[];
  ownershipHistory?: OwnershipHistory[];
  pendingUpdates?: PendingUpdate[];
  siteSettings?: SiteSettings[];
  bookingLeads?: BookingLead[];
  bookingStatusHistory?: BookingStatusHistory[];
  bookingNotifications?: BookingNotification[];
  bookingActivityLog?: BookingActivityLog[];
  systemReports?: SystemReport[];
  dashboardConfigurations?: any[];
  menuConfigurations?: any[];
  widgetConfigurations?: any[];
  formTemplates?: any[];
  formFields?: any[];
  fieldOptions?: any[];
  tableConfigurations?: any[];
  notificationPreferences?: any[];
  notificationRules?: any[];
  featureFlags?: any[];
  workflowDefinitions?: any[];
  workflowSteps?: any[];
  bookingPayments?: any[];
  bookingDocuments?: any[];
  bookingReviews?: any[];
  bookingNotes?: any[];
  bookingReminders?: any[];
  brandSettings?: any[];
  homepageSettings?: any[];
  heroSettings?: any[];
  businessRules?: any[];
  permissionRoles?: any[];
  permissionMappings?: any[];
  systemLogs?: any[];
  blogs?: Blog[];
  blogCategories?: BlogCategory[];
  blogTags?: BlogTag[];
  blogTagMaps?: BlogTagMap[];
  blogAuthors?: BlogAuthor[];
  blogImages?: BlogImage[];
  blogRelatedLinks?: BlogRelatedLink[];
  blogFaqs?: BlogFaq[];
  blogVersions?: BlogVersion[];
  blogViews?: BlogView[];
  blogLikes?: BlogLike[];
  blogBookmarks?: BlogBookmark[];
  blogShares?: BlogShare[];
  blogComments?: BlogComment[];
  blogSeos?: BlogSeo[];
  blogSchedules?: BlogSchedule[];
  blogActivityLogs?: BlogActivityLog[];
  geospatial_relationships?: GeospatialRelationship[];
  roomCategories?: RoomCategory[];
  roomImages?: RoomImage[];
  homestayGallery?: HomestayGallery[];
  homestayReviews?: HomestayReview[];
  conversations?: ChatConversation[];
  conversationParticipants?: ConversationParticipant[];
  chatMessages?: ChatMessage[];
  chatNotifications?: ChatNotification[];
  quoteRequests?: QuoteRequest[];
  quoteRequestRecipients?: QuoteRequestRecipient[];
  quotes?: Quote[];
  taxiBookings?: any[];
  taxiReviews?: any[];
  taxiAuditLogs?: any[];
  supportCases?: any[];
  recommendationSettings?: any;
}

class GraphDatabase {
  public data: Schema = {
    hubs: [],
    routes: [],
    destinations: [],
    attractions: [],
    homestays: [],
    images: [],
    contributions: [],
    tripLeads: [],
    carLeads: [],
    drivers: [],
    userRoles: [],
    users: [],
    roles: [],
    permissions: [],
    rolePermissions: [],
    userPermissions: [],
    auditLogs: [],
    photoContributions: [],
    notifications: [],
    appNotifications: [],
    claimRequests: [],
    taxiOperators: [],
    vehicles: [],
    inquiries: [],
    ownershipHistory: [],
    pendingUpdates: [],
    siteSettings: [],
    bookingLeads: [],
    bookingStatusHistory: [],
    bookingNotifications: [],
    bookingActivityLog: [],
    systemReports: [],
    dashboardConfigurations: [],
    menuConfigurations: [],
    widgetConfigurations: [],
    formTemplates: [],
    formFields: [],
    fieldOptions: [],
    tableConfigurations: [],
    notificationPreferences: [],
    notificationRules: [],
    featureFlags: [],
    workflowDefinitions: [],
    workflowSteps: [],
    bookingPayments: [],
    bookingDocuments: [],
    bookingReviews: [],
    bookingNotes: [],
    bookingReminders: [],
    brandSettings: [],
    homepageSettings: [],
    heroSettings: [],
    businessRules: [],
    permissionRoles: [],
    permissionMappings: [],
    systemLogs: [],
    blogs: [],
    blogCategories: [],
    blogTags: [],
    blogTagMaps: [],
    blogAuthors: [],
    blogImages: [],
    blogRelatedLinks: [],
    blogFaqs: [],
    blogVersions: [],
    blogViews: [],
    blogLikes: [],
    blogBookmarks: [],
    blogShares: [],
    blogComments: [],
    blogSeos: [],
    blogSchedules: [],
    blogActivityLogs: [],
    geospatial_relationships: [],
    roomCategories: [],
    roomImages: [],
    homestayGallery: [],
    homestayReviews: [],
    conversations: [],
    conversationParticipants: [],
    chatMessages: [],
    chatNotifications: [],
    quoteRequests: [],
    quoteRequestRecipients: [],
    quotes: [],
    taxiBookings: [],
    taxiReviews: [],
    taxiAuditLogs: [],
    supportCases: [],
    recommendationSettings: null
  };

  public queryErrors: Record<string, string> = {};

  private routeGraph: { adj: Map<string, Route[]>; hubsMap: Map<string, Hub> } | null = null;

  public initPromise: Promise<void> = Promise.resolve();

  public invalidateRouteGraph() {
    this.routeGraph = null;
  }

  constructor() {
    this.load();
    if (supabase) {
      this.initPromise = testSupabaseConnection().then(async (isOk) => {
        isSupabaseOnline = isOk;
        if (isOk) {
          console.log("[Database Status] Supabase connected successfully. Loading cache...");
          try {
            await this.loadFromFirestore();
          } catch (err) {
            console.error("[Supabase Sync] Error loading from Supabase:", err);
          }
        } else {
          console.error("[Database Status] Running in read-only degraded mode (Supabase database is offline/unavailable). Local persistent storage is disabled.");
        }
      }).catch(err => {
        isSupabaseOnline = false;
        console.error("[Database Status] Running in read-only degraded mode (Supabase connection error). Local persistent storage is disabled.", err);
      });
    } else {
      this.initPromise = testConnection().then(async (isOk) => {
        isFirestoreOnline = isOk;
        if (isOk) {
          try {
            await this.loadFromFirestore();
          } catch (err) {
            console.error("[Firestore Sync] Error loading from Firestore:", err);
          }
        } else {
          console.log("[Firestore Sync] Connection check failed or timed out. Standard local database files used natively, preventing any startup hangs.");
        }
      }).catch(err => {
        isFirestoreOnline = false;
        console.error("[Firestore Sync] Exception during Firestore connection check:", err);
      });
    }
  }


  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = { ...this.data, ...parsed };

        // Self-healing: Unpack any flat arrays that were erroneously stored as a nested object under ID "bulk"
        let didUnpackBulk = false;
        for (const colKey of Object.keys(this.data)) {
          const arr = this.data[colKey as keyof Schema];
          if (Array.isArray(arr)) {
            const bulkIdx = arr.findIndex((x: any) => x && x.id === 'bulk');
            if (bulkIdx > -1) {
            const bulkObj: any = arr[bulkIdx];
            console.log(`[Database Healing Local] Detected nested "bulk" document in collection "${colKey}". Processing unpack...`);
              if (bulkObj.records && Array.isArray(bulkObj.records)) {
                const existingMap = new Map<string, any>();
                arr.forEach((item: any, idx: number) => {
                  if (idx !== bulkIdx && item && item.id) {
                    existingMap.set(String(item.id).toLowerCase().trim(), item);
                  }
                });
                bulkObj.records.forEach((item: any) => {
                  if (item && item.id) {
                    existingMap.set(String(item.id).toLowerCase().trim(), item);
                  }
                });
                this.data[colKey as keyof Schema] = Array.from(existingMap.values()) as any;
                didUnpackBulk = true;
                console.log(`[Database Healing Local] Successfully unpacked and flattened ${bulkObj.records.length} records in collection "${colKey}".`);
              } else {
                arr.splice(bulkIdx, 1);
                didUnpackBulk = true;
                console.log(`[Database Healing Local] Stale or empty "bulk" document removed from collection "${colKey}".`);
              }
            }
          }
        }
        if (didUnpackBulk) {
          this.save();
        }

        // Self-healing helper: ensure lists exist and filter out any items missing 'id'
        let didHealIds = false;
        const cleanArr = (arr: any[] | undefined, label: string): any[] => {
          if (!arr || !Array.isArray(arr)) return [];
          const initialLen = arr.length;
          const filtered = arr.filter(item => item && typeof item === 'object' && item.id);
          if (filtered.length !== initialLen) {
            console.log(`[Database Healing] Removed ${initialLen - filtered.length} corrupt records missing IDs from collection ${label}`);
            didHealIds = true;
          }
          return filtered;
        };

        // Filter and assign with healing
        this.data.hubs = cleanArr(this.data.hubs, 'hubs');
        this.data.routes = cleanArr(this.data.routes, 'routes');
        this.data.destinations = cleanArr(this.data.destinations, 'destinations');
        this.data.attractions = cleanArr(this.data.attractions, 'attractions');

        // Self-healing: Clean stale or broken default homestay images on load
        let dbHomestaysChanged = false;
        const rawHomestays = cleanArr(this.data.homestays, 'homestays');
        this.data.homestays = rawHomestays.map(h => {
          let homestayImgChanged = false;
          if (h.images && h.images.length > 0) {
            const cleanedImages = h.images.map(img => {
              if (!img || img.trim() === '' || img.includes('photo-1588880331179-bc9b93a8c5c2')) {
                homestayImgChanged = true;
                return DEFAULT_HOMESTAY_IMAGE;
              }
              return img;
            });
            if (homestayImgChanged) {
              h.images = cleanedImages;
              dbHomestaysChanged = true;
            }
          } else {
            h.images = [DEFAULT_HOMESTAY_IMAGE];
            dbHomestaysChanged = true;
          }
          return h;
        });

        if (dbHomestaysChanged) {
          console.log('[Database Healing] Automatically replaced broken default homestay image URLs with working ones.');
        }

        this.data.images = cleanArr(this.data.images, 'images');
        this.data.contributions = cleanArr(this.data.contributions, 'contributions');
        this.data.tripLeads = cleanArr(this.data.tripLeads, 'tripLeads');
        this.data.carLeads = cleanArr(this.data.carLeads, 'carLeads');
        this.data.drivers = cleanArr(this.data.drivers, 'drivers');
        this.data.userRoles = cleanArr(this.data.userRoles, 'userRoles');
        this.data.users = cleanArr(this.data.users, 'users');
        this.data.roles = cleanArr(this.data.roles, 'roles');
        this.data.permissions = cleanArr(this.data.permissions, 'permissions');
        this.data.rolePermissions = cleanArr(this.data.rolePermissions, 'rolePermissions');
        this.data.userPermissions = cleanArr(this.data.userPermissions, 'userPermissions');
        this.data.auditLogs = cleanArr(this.data.auditLogs, 'auditLogs');
        this.data.photoContributions = cleanArr(this.data.photoContributions, 'photoContributions');
        this.data.notifications = cleanArr(this.data.notifications, 'notifications');
        this.data.appNotifications = cleanArr(this.data.appNotifications, 'appNotifications');
        this.data.claimRequests = cleanArr(this.data.claimRequests, 'claimRequests');
        this.data.inquiries = cleanArr(this.data.inquiries, 'inquiries');
        this.data.ownershipHistory = cleanArr(this.data.ownershipHistory, 'ownershipHistory');
        this.data.bookingLeads = cleanArr(this.data.bookingLeads || [], 'bookingLeads');
        this.data.bookingStatusHistory = cleanArr(this.data.bookingStatusHistory || [], 'bookingStatusHistory');
        this.data.bookingNotifications = cleanArr(this.data.bookingNotifications || [], 'bookingNotifications');
        this.data.bookingActivityLog = cleanArr(this.data.bookingActivityLog || [], 'bookingActivityLog');
        this.data.systemReports = cleanArr(this.data.systemReports || [], 'systemReports');
        this.data.dashboardConfigurations = cleanArr(this.data.dashboardConfigurations || [], 'dashboardConfigurations');
        this.data.menuConfigurations = cleanArr(this.data.menuConfigurations || [], 'menuConfigurations');
        this.data.widgetConfigurations = cleanArr(this.data.widgetConfigurations || [], 'widgetConfigurations');
        this.data.formTemplates = cleanArr(this.data.formTemplates || [], 'formTemplates');
        this.data.formFields = cleanArr(this.data.formFields || [], 'formFields');
        this.data.fieldOptions = cleanArr(this.data.fieldOptions || [], 'fieldOptions');
        this.data.tableConfigurations = cleanArr(this.data.tableConfigurations || [], 'tableConfigurations');
        this.data.notificationPreferences = cleanArr(this.data.notificationPreferences || [], 'notificationPreferences');
        this.data.notificationRules = cleanArr(this.data.notificationRules || [], 'notificationRules');
        this.data.featureFlags = cleanArr(this.data.featureFlags || [], 'featureFlags');
        this.data.workflowDefinitions = cleanArr(this.data.workflowDefinitions || [], 'workflowDefinitions');
        this.data.workflowSteps = cleanArr(this.data.workflowSteps || [], 'workflowSteps');
        this.data.bookingPayments = cleanArr(this.data.bookingPayments || [], 'bookingPayments');
        this.data.bookingDocuments = cleanArr(this.data.bookingDocuments || [], 'bookingDocuments');
        this.data.bookingReviews = cleanArr(this.data.bookingReviews || [], 'bookingReviews');
        this.data.bookingNotes = cleanArr(this.data.bookingNotes || [], 'bookingNotes');
        this.data.bookingReminders = cleanArr(this.data.bookingReminders || [], 'bookingReminders');
        this.data.brandSettings = cleanArr(this.data.brandSettings || [], 'brandSettings');
        this.data.homepageSettings = cleanArr(this.data.homepageSettings || [], 'homepageSettings');
        this.data.heroSettings = cleanArr(this.data.heroSettings || [], 'heroSettings');
        this.data.businessRules = cleanArr(this.data.businessRules || [], 'businessRules');
        this.data.permissionRoles = cleanArr(this.data.permissionRoles || [], 'permissionRoles');
        this.data.permissionMappings = cleanArr(this.data.permissionMappings || [], 'permissionMappings');
        this.data.systemLogs = cleanArr(this.data.systemLogs || [], 'systemLogs');
        this.data.pendingUpdates = cleanArr(this.data.pendingUpdates, 'pendingUpdates');

        if (didHealIds || dbHomestaysChanged) {
          this.save();
        }

        // Protection check: Ensure mavanish24@gmail.com is always the Super Admin and active
        const superId = 'mavanish24@gmail.com';
        const sAdmin = this.data.users.find(u => u && u.email && u.email.trim().toLowerCase() === superId);
        if (!sAdmin) {
          this.data.users.push({
            id: superId,
            email: superId,
            name: 'Mavanish Super Admin',
            passwordHash: getDefaultAdminBcryptHash(),
            role: 'super_admin',
            status: 'active',
            emailVerified: true,
            customPermissions: [],
            createdAt: new Date().toISOString()
          });
          this.save();
        } else {
          let sAdminChanged = false;
          if (sAdmin.role !== 'super_admin' || sAdmin.status !== 'active') {
            sAdmin.role = 'super_admin';
            sAdmin.status = 'active';
            sAdminChanged = true;
          }
          if (!sAdmin.passwordHash || !sAdmin.passwordHash.startsWith('$2')) {
            sAdmin.passwordHash = getDefaultAdminBcryptHash();
            sAdminChanged = true;
          }
          if (sAdminChanged) {
            this.save();
          }
        }

        // Action check: Ensure amrkmurarka@gmail.com is always a Super Admin and active
        const adminId = 'amrkmurarka@gmail.com';
        const sAdmin2 = this.data.users.find(u => u && u.email && u.email.trim().toLowerCase() === adminId);
        if (!sAdmin2) {
          this.data.users.push({
            id: adminId,
            email: adminId,
            name: 'Amrkmurarka Admin',
            passwordHash: getDefaultAdminBcryptHash(),
            role: 'super_admin',
            status: 'active',
            emailVerified: true,
            customPermissions: [],
            createdAt: new Date().toISOString()
          });
          this.save();
        } else {
          let sAdmin2Changed = false;
          if (sAdmin2.role !== 'super_admin' || sAdmin2.status !== 'active') {
            sAdmin2.role = 'super_admin';
            sAdmin2.status = 'active';
            sAdmin2Changed = true;
          }
          if (!sAdmin2.passwordHash || !sAdmin2.passwordHash.startsWith('$2')) {
            sAdmin2.passwordHash = getDefaultAdminBcryptHash();
            sAdmin2Changed = true;
          }
          if (sAdmin2Changed) {
            this.save();
          }
        }
      } else {
        this.seed();
      }
    } catch (error) {
      console.error('Error loading DB, seeding with defaults:', error);
      this.seed();
    }
  }

  private seed() {
    const adminHash = getDefaultAdminBcryptHash();
    this.data = {
      hubs: [],
      routes: [],
      destinations: [],
      attractions: [],
      homestays: [],
      images: [],
      contributions: [],
      tripLeads: [],
      carLeads: [],
      drivers: [],
      userRoles: [],
      users: [
        {
          id: 'mavanish24@gmail.com',
          email: 'mavanish24@gmail.com',
          name: 'Mavanish Super Admin',
          passwordHash: adminHash,
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
          passwordHash: adminHash,
          role: 'super_admin',
          status: 'active',
          emailVerified: true,
          customPermissions: [],
          createdAt: new Date().toISOString()
        }
      ],
      roles: [
        { id: 'super_admin', name: 'Super Admin', description: 'Full system access, admin management, assign/revoke permissions.' },
        { id: 'admin', name: 'Admin', description: 'Can manage moderators and access assigned sections, cannot modify Super Admin.' },
        { id: 'moderator', name: 'Moderator', description: 'Limited access based on assigned permissions, cannot manage admins.' }
      ],
      permissions: [
        { id: 'manage_users', name: 'Manage Users', description: 'Allows viewing, modifying or deleting standard users.' },
        { id: 'manage_content', name: 'Manage Content', description: 'Approve or reject routes, destinations, attractions, homestays, and images.' },
        { id: 'manage_reports', name: 'Manage Reports', description: 'Access user-contributed correction reports.' },
        { id: 'manage_settings', name: 'Manage Settings', description: 'Control backoffice parameters and configurations.' },
        { id: 'view_analytics', name: 'View Analytics', description: 'Access real-time platform traffic, search events, and click analytics.' },
        { id: 'manage_moderators', name: 'Manage Moderators', description: 'Suspend, restore, or edit Moderator accounts.' },
        { id: 'manage_admins', name: 'Manage Admins', description: 'Add, suspend, or manage other Admins.' },
        { id: 'access_financial', name: 'Access Financial Data', description: 'Access booking fees, estimates, driver wages data.' }
      ],
      rolePermissions: [
        // super_admin has all permissions
        { id: 'rp1', roleId: 'super_admin', permissionId: 'manage_users' },
        { id: 'rp2', roleId: 'super_admin', permissionId: 'manage_content' },
        { id: 'rp3', roleId: 'super_admin', permissionId: 'manage_reports' },
        { id: 'rp4', roleId: 'super_admin', permissionId: 'manage_settings' },
        { id: 'rp5', roleId: 'super_admin', permissionId: 'view_analytics' },
        { id: 'rp6', roleId: 'super_admin', permissionId: 'manage_moderators' },
        { id: 'rp7', roleId: 'super_admin', permissionId: 'manage_admins' },
        { id: 'rp8', roleId: 'super_admin', permissionId: 'access_financial' },
        // admin has manage_users, manage_content, manage_reports, view_analytics, manage_moderators
        { id: 'rp9', roleId: 'admin', permissionId: 'manage_users' },
        { id: 'rp10', roleId: 'admin', permissionId: 'manage_content' },
        { id: 'rp11', roleId: 'admin', permissionId: 'manage_reports' },
        { id: 'rp12', roleId: 'admin', permissionId: 'view_analytics' },
        { id: 'rp13', roleId: 'admin', permissionId: 'manage_moderators' },
        // moderator has manage_content, view_analytics
        { id: 'rp14', roleId: 'moderator', permissionId: 'manage_content' },
        { id: 'rp15', roleId: 'moderator', permissionId: 'view_analytics' }
      ],
      userPermissions: [],
      auditLogs: [
        {
          id: 'log_init',
          userId: 'system',
          email: 'system',
          action: 'System Init',
          details: 'Authentication and permission system initialized securely.',
          timestamp: new Date().toISOString()
        }
      ],
      photoContributions: [],
      notifications: [],
      appNotifications: []
    };
    this.save();
  }

  public save() {
    // Local persistent writes disabled to make the backend fully stateless in Google Cloud Run
    console.log('[Database] save() called (local file writes are disabled to maintain statelessness in Cloud Run)');
  }

  public async pullAllFromFirestore() {
    if (!firestoreDb && !(supabase && isSupabaseOnline)) return;
    const pullCollection = async (collectionName: string, dataKey: keyof Schema) => {
      try {
        let list: any[] = [];
        let hasSucceeded = false;
        if (supabase && isSupabaseOnline) {
          try {
            let dbTableName = collectionName;
            if (collectionName === 'hubs') {
              dbTableName = 'taxi_stands';
            }

            const fetchAllPages = async (tableName: string) => {
              let allRows: any[] = [];
              let page = 0;
              const pageSize = 1000;
              let hasMore = true;
              
              while (hasMore) {
                const fromRange = page * pageSize;
                const toRange = (page + 1) * pageSize - 1;
                const { data, error } = await supabase
                  .from(tableName)
                  .select('*')
                  .range(fromRange, toRange);
                
                if (error) {
                  return { data: null, error };
                }
                
                if (data && data.length > 0) {
                  allRows = allRows.concat(data);
                  if (data.length < pageSize) {
                    hasMore = false;
                  } else {
                    page++;
                  }
                } else {
                  hasMore = false;
                }
              }
              return { data: allRows, error: null };
            };

            const { data, error } = await withTimeout(
              fetchAllPages(dbTableName),
              45000,
              `Pull collection ${collectionName} from Supabase timed out`
            ) as any;
            if (error) {
              const isTableMissing = error.code === '42P01' || 
                                     error.code === '42501' || 
                                     error.code === 'PGRST205' || 
                                     error.code === 'PGRST116' || 
                                     error.message?.includes('not found') || 
                                     error.message?.includes('does not exist') || 
                                     error.message?.includes('relation') ||
                                     error.message?.includes('permission denied');
              if (isTableMissing) {
                console.log(`[Database Sync] Table "${dbTableName}" initializing...`);
                this.queryErrors[dbTableName] = `Status: pending setup`;
              } else {
                console.log(`[Database Sync] Table "${dbTableName}" setup pending...`);
                this.queryErrors[dbTableName] = error.message;
              }
            } else {
              list = data || [];
              if (collectionName === 'destinations') {
                list = list.map(item => {
                  const mapped: any = {
                    id: item.destination_id || item.id || '',
                    name: item.village_name || item.name || '',
                    description: item.description || '',
                    district: item.district || '',
                    state: item.state || '',
                    country: item.country || 'India',
                    latitude: item.latitude !== undefined && item.latitude !== null ? Number(item.latitude) : 27.03,
                    longitude: item.longitude !== undefined && item.longitude !== null ? Number(item.longitude) : 88.26,
                    elevation: item.elevation !== undefined && item.elevation !== null ? Number(item.elevation) : 1800,
                    tourismType: item.known_for || item.tourismType || 'Scenic Village',
                    bestSeason: item.bestSeason || 'September to June',
                    image: item.image || '',
                    gallery: Array.isArray(item.gallery) ? item.gallery : []
                  };
                  return mapped;
                });
              } else if (collectionName === 'hubs') {
                list = list.map(item => {
                  const mapped: any = {
                    id: item.taxi_id || item.id || '',
                    name: item.taxi_stand_name || item.name || '',
                    latitude: item.latitude !== undefined && item.latitude !== null ? Number(item.latitude) : 27.03,
                    longitude: item.longitude !== undefined && item.longitude !== null ? Number(item.longitude) : 88.26,
                    district: item.district || '',
                    state: item.state || '',
                    country: item.country || 'India',
                    type: 'main_hub'
                  };
                  return mapped;
                });
              } else if (collectionName === 'attractions') {
                list = list.map(item => {
                  const mapped: any = {
                    id: item.attraction_id || item.id || '',
                    name: item.attraction_name || item.name || '',
                    category: item.category || 'Viewpoint',
                    destinationId: item.destination_id || item.destinationId || '',
                    description: item.description || '',
                    latitude: item.latitude !== undefined && item.latitude !== null ? Number(item.latitude) : null,
                    longitude: item.longitude !== undefined && item.longitude !== null ? Number(item.longitude) : null,
                    isHiddenGem: item.isHiddenGem === true || String(item.isHiddenGem).toLowerCase() === 'true',
                    isFeaturedAttraction: item.isFeaturedAttraction === true || String(item.isFeaturedAttraction).toLowerCase() === 'true',
                    image: item.image || item.coverImage || '',
                    district: item.district || '',
                    state: item.state || '',
                    country: item.country || 'India'
                  };
                  return mapped;
                });
              } else if (collectionName === 'homestays') {
                list = list.map(item => {
                  let imgList: string[] = [];
                  if (Array.isArray(item.images)) {
                    imgList = item.images;
                  } else if (typeof item.images === 'string') {
                    try {
                      imgList = JSON.parse(item.images);
                    } catch (e) {
                      imgList = [item.images];
                    }
                  } else if (item.image_url) {
                    imgList = [item.image_url];
                  } else if (item.image) {
                    imgList = [item.image];
                  }
                  
                  if (!Array.isArray(imgList) || imgList.length === 0) {
                    imgList = [DEFAULT_HOMESTAY_IMAGE];
                  }

                  const mapped: any = {
                    id: item.homestay_id || item.id || '',
                    name: item.homestay_name || item.name || '',
                    destinationId: item.destinationId || item.destination_id || '',
                    priceMin: item.priceMin !== undefined && item.priceMin !== null ? Number(item.priceMin) : 0,
                    priceMax: item.priceMax !== undefined && item.priceMax !== null ? Number(item.priceMax) : 0,
                    contact: item.contact_number || item.contact || '',
                    amenities: Array.isArray(item.amenities) ? item.amenities : (typeof item.amenities === 'string' ? item.amenities.split(',').map((s: string) => s.trim()) : []),
                    images: imgList,
                    status: item.status || 'Active',
                    latitude: item.latitude !== undefined && item.latitude !== null ? Number(item.latitude) : null,
                    longitude: item.longitude !== undefined && item.longitude !== null ? Number(item.longitude) : null,
                    district: item.district || '',
                    state: item.state || '',
                    country: item.country || 'India',
                    nearestDestinationId: item.nearestDestinationId || item.destination_id || item.destinationId || '',
                    distanceFromDestination: item.distanceFromDestination !== undefined && item.distanceFromDestination !== null ? Number(item.distanceFromDestination) : 0,
                    nearestHubId: item.nearestHubId || '',
                    distanceFromHub: item.distanceFromHub !== undefined && item.distanceFromHub !== null ? Number(item.distanceFromHub) : 0,
                    ownerId: item.ownerId || '',
                    description: item.description || '',
                    whatsappNumber: item.whatsappNumber || '',
                    roomRates: Array.isArray(item.roomRates) ? item.roomRates : (typeof item.roomRates === 'string' ? JSON.parse(item.roomRates) : []),
                    contactInfo: item.contactInfo || '',
                    checkInInfo: item.checkInInfo || '',
                    houseRules: item.houseRules || '',
                    breakfastIncluded: item.breakfastIncluded === true || String(item.breakfastIncluded).toLowerCase() === 'true',
                    lunchAvailable: item.lunchAvailable === true || String(item.lunchAvailable).toLowerCase() === 'true',
                    dinnerAvailable: item.dinnerAvailable === true || String(item.dinnerAvailable).toLowerCase() === 'true'
                  };
                  return mapped;
                });
              }
              hasSucceeded = true;
            }
          } catch (e: any) {
            console.log(`[Database Sync] Supabase query completed for "${collectionName}"`);
          }
        } else if (firestoreDb) {
          try {
            const snap = await withTimeout(
              getDocs(collection(firestoreDb, collectionName)),
              20000,
              `Pull collection ${collectionName} from Firestore timed out`
            );
            snap.forEach(docSnap => {
              const item = docSnap.data();
              if (item) list.push(item);
            });
            hasSucceeded = true;
          } catch (e: any) {
            console.log(`[Database Sync] Firestore query completed for "${collectionName}"`);
          }
        }

        if (hasSucceeded) {
          const filteredList: any[] = [];
          const seen = new Set<string>();
          list.forEach(item => {
            if (item && item.id) {
              const normalizedId = toIdSlug(item.id);
              if (!seen.has(normalizedId)) {
                seen.add(normalizedId);
                filteredList.push(item);
              }
            }
          });

          // Protective guard: If the fetched list from Supabase/Firestore is empty or near-empty (e.g., 0 records), 
          // but our current local memory has substantial data, DO NOT overwrite it with empty data!
          // This prevents accidental blank tables in cloud from wiping our entire production cache.
          const existingList = this.data[dataKey] as any[];
          if (filteredList.length === 0 && existingList && existingList.length > 5) {
            console.warn(`[Database Sync WARNING] Fetched 0 records for collection "${collectionName}" from cloud, but local cache contains ${existingList.length} records. Keeping local cache as backup.`);
          } else {
            (this.data[dataKey] as any) = filteredList;
            console.log(`[Database Sync] Successfully loaded ${filteredList.length} records for collection ${collectionName} directly from cloud.`);
          }
        } else {
          console.log(`[Database Sync] Cache active for collection "${collectionName}"`);
        }
      } catch (err: any) {
        console.log(`[Database Sync] Collection ${collectionName} sync handled`);
      }
    };


    console.log("Pulling all collections from Firestore to memory state sequentially...");
    try {
      const collectionsToPull: { name: string; key: keyof Schema }[] = [
        { name: 'hubs', key: 'hubs' },
        { name: 'routes', key: 'routes' },
        { name: 'destinations', key: 'destinations' },
        { name: 'attractions', key: 'attractions' },
        { name: 'homestays', key: 'homestays' },
        { name: 'images', key: 'images' },
        { name: 'contributions', key: 'contributions' },
        { name: 'trip_leads', key: 'tripLeads' },
        { name: 'car_leads', key: 'carLeads' },
        { name: 'drivers', key: 'drivers' },
        { name: 'user_roles', key: 'userRoles' },
        { name: 'users', key: 'users' },
        { name: 'taxi_operators', key: 'taxiOperators' },
        { name: 'roles', key: 'roles' },
        { name: 'permissions', key: 'permissions' },
        { name: 'role_permissions', key: 'rolePermissions' },
        { name: 'user_permissions', key: 'userPermissions' },
        { name: 'audit_logs', key: 'auditLogs' },
        { name: 'photo_contributions', key: 'photoContributions' },
        { name: 'photo_notifications', key: 'notifications' },
        { name: 'notifications', key: 'appNotifications' },
        { name: 'claim_requests', key: 'claimRequests' },
        { name: 'inquiries', key: 'inquiries' },
        { name: 'ownership_history', key: 'ownershipHistory' },
        { name: 'pending_updates', key: 'pendingUpdates' },
        { name: 'site_settings', key: 'siteSettings' },
        { name: 'booking_leads', key: 'bookingLeads' },
        { name: 'booking_status_history', key: 'bookingStatusHistory' },
        { name: 'booking_notifications', key: 'bookingNotifications' },
        { name: 'booking_activity_log', key: 'bookingActivityLog' },
        { name: 'system_reports', key: 'systemReports' },
        { name: 'vehicles', key: 'vehicles' },
        { name: 'geospatial_relationships', key: 'geospatial_relationships' },
        { name: 'quote_requests', key: 'quoteRequests' },
        { name: 'quote_request_recipients', key: 'quoteRequestRecipients' },
        { name: 'quotes', key: 'quotes' }
      ];

      for (const col of collectionsToPull) {
        await pullCollection(col.name, col.key);
      }

      // Self-healing check: Extract unique nearestTaxiStand names from destinations and ensure they exist as routable Hubs!
      const existingHubIds = new Set<string>();
      (this.data.hubs || []).forEach(h => {
        if (h && h.id) {
          existingHubIds.add(h.id.toLowerCase().trim());
          existingHubIds.add(toIdSlug(h.id));
        }
      });

      const destinationsList = this.data.destinations || [];
      const missingStandsToSync: Hub[] = [];

      // Lazy load taxi stands coordinates from in-memory hubs
      let taxiStandsStore: Record<string, any> = {};
      try {
        (this.data.hubs || []).forEach(h => {
          if (h && h.name) {
            taxiStandsStore[h.name] = h;
          }
        });
      } catch (e) {}

      destinationsList.forEach(d => {
        if (d && d.nearestTaxiStand) {
          const standName = d.nearestTaxiStand.trim();
          const standId = standName;
          const slugId = toIdSlug(standName);
          
          if (!existingHubIds.has(standId.toLowerCase().trim()) && !existingHubIds.has(slugId)) {
            const coords = taxiStandsStore[standName] || {};
            const newHub: Hub = {
              id: standId,
              name: standName,
              type: 'sub_hub',
              latitude: coords.latitude !== undefined ? Number(coords.latitude) : (d.latitude !== undefined ? Number(d.latitude) : undefined),
              longitude: coords.longitude !== undefined ? Number(coords.longitude) : (d.longitude !== undefined ? Number(d.longitude) : undefined),
              district: coords.district || d.district || undefined,
              state: coords.state || d.state || undefined,
              country: "India"
            };
            
            this.data.hubs.push(newHub);
            existingHubIds.add(standId.toLowerCase().trim());
            existingHubIds.add(slugId);
            missingStandsToSync.push(newHub);
          }
        }
      });

      if (missingStandsToSync.length > 0) {
        console.log(`[Database Healing] Automatically registered ${missingStandsToSync.length} missing taxi stands as Hubs from Destinations!`);
        // Sync new hubs to Firestore in background
        if (googleFirestoreDb) {
          const syncCollectionToFirestoreAdmin = async (collectionName: string, dataList: any[]) => {
            const batch = googleFirestoreDb!.batch();
            for (const item of dataList) {
              if (item && item.id) {
                const docRef = googleFirestoreDb!.collection(collectionName).doc(item.id);
                batch.set(docRef, item, { merge: true });
              }
            }
            await batch.commit();
          };
          syncCollectionToFirestoreAdmin('hubs', this.data.hubs).catch(err => {
            console.error("[Database Healing Warning] Failed to sync auto-healed Hubs to Firestore via Admin SDK:", err);
          });
        } else if (firestoreDb) {
          const syncCollectionToFirestoreClient = async (collectionName: string, dataList: any[]) => {
            for (const item of dataList) {
              if (item && item.id) {
                await setDoc(doc(firestoreDb, collectionName, item.id), item, { merge: true });
              }
            }
          };
          syncCollectionToFirestoreClient('hubs', this.data.hubs).catch(err => {
            console.error("[Database Healing Warning] Failed to sync auto-healed Hubs to Firestore via Client SDK:", err);
          });
        }
      }

      this.save();
    } catch (err) {
      console.error("[Firestore Sync] Error during multi-collection pull:", err);
    }
  }

  private bindRealtimeListeners() {
    if (!firestoreDb) return;
    console.log("Setting up robust periodic silent background pulls instead of unstable stream listeners...");
    
    // Refresh memory cache in the background every 5 minutes
    setInterval(() => {
      this.pullAllFromFirestore().catch(e => {
        console.error("[Firestore Sync] Background interval pull failed silently:", e);
      });
    }, 5 * 60 * 1000);
  }

  public async syncAllToFirestore() {
    if (!firestoreDb) return;
    console.log("Starting full Firestore sync...");
    await syncCollectionToFirestore('hubs', this.data.hubs);
    await syncCollectionToFirestore('routes', this.data.routes);
    await syncCollectionToFirestore('destinations', this.data.destinations);
    await syncCollectionToFirestore('attractions', this.data.attractions);
    await syncCollectionToFirestore('homestays', this.data.homestays);
    await syncCollectionToFirestore('images', this.data.images);
    await syncCollectionToFirestore('contributions', this.data.contributions);
    await syncCollectionToFirestore('trip_leads', this.data.tripLeads);
    await syncCollectionToFirestore('car_leads', this.data.carLeads);
    await syncCollectionToFirestore('drivers', this.data.drivers || []);
    await syncCollectionToFirestore('user_roles', this.data.userRoles || []);
    await syncCollectionToFirestore('users', this.data.users || []);
    await syncCollectionToFirestore('roles', this.data.roles || []);
    await syncCollectionToFirestore('permissions', this.data.permissions || []);
    await syncCollectionToFirestore('role_permissions', this.data.rolePermissions || []);
    await syncCollectionToFirestore('user_permissions', this.data.userPermissions || []);
    await syncCollectionToFirestore('audit_logs', this.data.auditLogs || []);
    await syncCollectionToFirestore('photo_contributions', this.data.photoContributions || []);
    await syncCollectionToFirestore('photo_notifications', this.data.notifications || []);
    await syncCollectionToFirestore('notifications', this.data.appNotifications || []);
    await syncCollectionToFirestore('geospatial_relationships', this.data.geospatial_relationships || []);
  }

  public async loadFromFirestore() {
    if (!firestoreDb && !(supabase && isSupabaseOnline)) return;
    try {
      console.log("Performing startup pull to synchronize client-to-server cache directly from cloud...");
      await this.pullAllFromFirestore();

      // Load custom persistent settings/lists from interactions table
      if (supabase && isSupabaseOnline) {
        try {
          console.log("[Custom Persistence] Loading Recommendation Settings, Reviews, and Taxi Stands from interactions table...");
          const { data, error } = await supabase
            .from('interactions')
            .select('*')
            .in('type', ['recommendation_settings', 'taxi_stands_list', 'taxi_reviews_list', 'booking_review', 'homestay_review']);
          
          if (error) {
            console.error("[Custom Persistence] Error loading custom persistence from interactions table:", error);
          } else if (data && data.length > 0) {
            console.log(`[Custom Persistence] Retrieved ${data.length} custom persistence records from interactions.`);
            
            // 1. Process Recommendation Settings
            const recSettingsRecords = data.filter(r => r.type === 'recommendation_settings');
            if (recSettingsRecords.length > 0) {
              recSettingsRecords.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
              try {
                this.data.recommendationSettings = JSON.parse(recSettingsRecords[0].entityId);
                console.log("[Custom Persistence] Loaded latest Recommendation Settings successfully.");
              } catch (e) {
                console.error("[Custom Persistence] Failed to parse Recommendation Settings:", e);
              }
            }

            // 2. Process Taxi Stands List (Hubs)
            const taxiStandsRecords = data.filter(r => r.type === 'taxi_stands_list');
            if (taxiStandsRecords.length > 0) {
              taxiStandsRecords.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
              try {
                this.data.hubs = JSON.parse(taxiStandsRecords[0].entityId);
                this.invalidateRouteGraph();
                console.log(`[Custom Persistence] Loaded latest Taxi Stands List (${this.data.hubs.length} hubs) successfully.`);
              } catch (e) {
                console.error("[Custom Persistence] Failed to parse Taxi Stands List:", e);
              }
            }

            // 3. Process Taxi Reviews List
            const taxiReviewsRecords = data.filter(r => r.type === 'taxi_reviews_list');
            if (taxiReviewsRecords.length > 0) {
              taxiReviewsRecords.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
              try {
                this.data.taxiReviews = JSON.parse(taxiReviewsRecords[0].entityId);
                console.log(`[Custom Persistence] Loaded latest Taxi Reviews List (${this.data.taxiReviews.length} reviews) successfully.`);
              } catch (e) {
                console.error("[Custom Persistence] Failed to parse Taxi Reviews List:", e);
              }
            }

            // 4. Process Booking Reviews Map-Merge
            const bookingReviewsMap = new Map<string, any>();
            (this.data.bookingReviews || []).forEach(r => { if (r && r.id) bookingReviewsMap.set(r.id, r); });
            
            const bookingRecords = data.filter(r => r.type === 'booking_review');
            bookingRecords.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
            bookingRecords.forEach(r => {
              try {
                const review = JSON.parse(r.entityId);
                if (review && review.id) {
                  bookingReviewsMap.set(review.id, review);
                }
              } catch (e) {}
            });
            this.data.bookingReviews = Array.from(bookingReviewsMap.values());

            // 5. Process Homestay Reviews Map-Merge
            const homestayReviewsMap = new Map<string, any>();
            (this.data.homestayReviews || []).forEach(r => { if (r && r.id) homestayReviewsMap.set(r.id, r); });

            const homestayRecords = data.filter(r => r.type === 'homestay_review');
            homestayRecords.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
            homestayRecords.forEach(r => {
              try {
                const review = JSON.parse(r.entityId);
                if (review && review.id) {
                  homestayReviewsMap.set(review.id, review);
                }
              } catch (e) {}
            });
            this.data.homestayReviews = Array.from(homestayReviewsMap.values());
            
            console.log(`[Custom Persistence] Initialization complete. Loaded Booking(${this.data.bookingReviews.length}) and Homestay(${this.data.homestayReviews.length}) reviews.`);
          }
        } catch (e: any) {
          console.error("[Custom Persistence] Exception during custom persistence load:", e);
        }
      }

      // Self-healing: Automatically unpack and delete nested "bulk" records from any collection in cloud
      let didUnpackAnyBulk = false;
      const keyMapToFirestoreCol: Record<string, string> = {
        hubs: 'hubs',
        routes: 'routes',
        destinations: 'destinations',
        attractions: 'attractions',
        homestays: 'homestays'
      };

      for (const colKey of Object.keys(this.data)) {
        const arr = this.data[colKey as keyof Schema];
        if (Array.isArray(arr)) {
          const bulkIdx = arr.findIndex((x: any) => x && x.id === 'bulk');
          if (bulkIdx > -1) {
            const bulkObj: any = arr[bulkIdx];
            console.log(`[Database Healing Cloud] Detected nested "bulk" document in collection "${colKey}". Automatically unpacking and deleting bulk document...`);
            
            const fsCol = keyMapToFirestoreCol[colKey];
            if (fsCol) {
              // Delete the bulk document from cloud
              deleteDocInFirestore(fsCol, 'bulk').catch(err => {
                console.error(`[Database Healing Cloud] Minor: Failed to delete "bulk" document from collection "${fsCol}":`, err);
              });
            }

            if (bulkObj.records && Array.isArray(bulkObj.records)) {
              // Merge standard records case-insensitive
              const existingMap = new Map<string, any>();
              arr.forEach((item: any, idx: number) => {
                if (idx !== bulkIdx && item && item.id) {
                  existingMap.set(String(item.id).toLowerCase().trim(), item);
                }
              });

              bulkObj.records.forEach((item: any) => {
                if (item && item.id) {
                  existingMap.set(String(item.id).toLowerCase().trim(), item);
                }
              });
              
              const mergedList = Array.from(existingMap.values());
              this.data[colKey as keyof Schema] = mergedList as any;
              didUnpackAnyBulk = true;

              // Re-upload the unpacked individual documents to Firestore flatly so everything is fully restored in the cloud!
              if (fsCol) {
                console.log(`[Database Healing Firestore] Re-syncing ${mergedList.length} flat unpacked records back to Firestore collection "${fsCol}"...`);
                syncCollectionToFirestore(fsCol, mergedList).catch(err => {
                  console.error(`[Database Healing Firestore] Re-sync error for collection "${fsCol}":`, err);
                });
              }
            } else {
              // No sub records, just splice out
              arr.splice(bulkIdx, 1);
              didUnpackAnyBulk = true;
            }
          }
        }
      }

      if (didUnpackAnyBulk) {
        this.save();
      }

      // Ensure that both super-admin and amrkmurarka exist in memory and are synced to Firestore!
      let hasChange = false;
      const superId = 'mavanish24@gmail.com';
      let sAdmin = this.data.users.find(u => u && u.email && u.email.trim().toLowerCase() === superId);
      if (!sAdmin) {
        sAdmin = {
          id: superId,
          email: superId,
          name: 'Mavanish Super Admin',
          passwordHash: getDefaultAdminBcryptHash(), 
          role: 'super_admin',
          status: 'active',
          emailVerified: true,
          customPermissions: [],
          createdAt: new Date().toISOString()
        };
        this.data.users.push(sAdmin);
        await syncDoc('users', superId, sAdmin);
        hasChange = true;
      } else if (sAdmin.role !== 'super_admin' || sAdmin.status !== 'active' || !sAdmin.passwordHash || !sAdmin.passwordHash.startsWith('$2')) {
        sAdmin.role = 'super_admin';
        sAdmin.status = 'active';
        sAdmin.passwordHash = getDefaultAdminBcryptHash();
        await syncDoc('users', superId, sAdmin);
        hasChange = true;
      }

      const adminId = 'amrkmurarka@gmail.com';
      let sAdmin2 = this.data.users.find(u => u && u.email && u.email.trim().toLowerCase() === adminId);
      if (!sAdmin2) {
        sAdmin2 = {
          id: adminId,
          email: adminId,
          name: 'Amrkmurarka Admin',
          passwordHash: getDefaultAdminBcryptHash(), 
          role: 'super_admin',
          status: 'active',
          emailVerified: true,
          customPermissions: [],
          createdAt: new Date().toISOString()
        };
        this.data.users.push(sAdmin2);
        await syncDoc('users', adminId, sAdmin2);
        hasChange = true;
      } else if (sAdmin2.role !== 'super_admin' || sAdmin2.status !== 'active' || !sAdmin2.passwordHash || !sAdmin2.passwordHash.startsWith('$2')) {
        sAdmin2.role = 'super_admin';
        sAdmin2.status = 'active';
        sAdmin2.passwordHash = getDefaultAdminBcryptHash();
        await syncDoc('users', adminId, sAdmin2);
        hasChange = true;
      }

      if (hasChange) {
        this.save();
      }

      this.bindRealtimeListeners();
    } catch (e) {
      console.error("Failed to load/sync from Firestore:", e);
    }
  }

  // Gets
  public getHubs(): Hub[] { return this.data.hubs; }
  public getRoutes(): Route[] {
    const hubs = this.getHubs();
    return this.data.routes.map(r => {
      const isMissingData = r.fareMin === null || r.fareMin === undefined || r.fareMin === 0 ||
                            r.timeMin === null || r.timeMin === undefined || r.timeMin === 0 ||
                            r.distance === null || r.distance === undefined || r.distance === 0;
      if (isMissingData) {
        const hubA = hubs.find(h => String(h.id).toLowerCase().trim() === String(r.fromHubId).toLowerCase().trim());
        const hubB = hubs.find(h => String(h.id).toLowerCase().trim() === String(r.toHubId).toLowerCase().trim());
        let dist = 50;
        if (hubA && hubB && hubA.latitude && hubA.longitude && hubB.latitude && hubB.longitude) {
          dist = getDistanceInKm(Number(hubA.latitude), Number(hubA.longitude), Number(hubB.latitude), Number(hubB.longitude));
        }
        const routeType = (r.type === 'Direct' || r.type === 'Indirect' || r.type === 'Reserved' || r.type === 'Reserved Car') ? r.type : 'Direct';
        return {
          ...r,
          distance: r.distance || dist || 50,
          fareMin: r.fareMin || Math.max(50, Math.round(dist * 8)),
          fareMax: r.fareMax || Math.max(100, Math.round(dist * 12)),
          timeMin: r.timeMin || Math.max(15, Math.round(dist * 1.5 + 10)),
          timeMax: r.timeMax || Math.max(30, Math.round(dist * 2.2 + 20)),
          type: routeType,
          verified: r.verified !== null && r.verified !== undefined ? r.verified : true,
          lastUpdated: r.lastUpdated || 'Verified by regional drivers',
          path: Array.isArray(r.path) ? r.path : []
        };
      }
      return r;
    });
  }
  
  public getDestinations(): Destination[] {
    const defaultPlaceholderImg = "photo-1544735716-392fe2489ffa";
    return this.data.destinations.map(d => {
      const isPlaceholder = !d.image || d.image.trim() === '' || d.image.includes(defaultPlaceholderImg);
      const isCoverPlaceholder = !d.coverImage || d.coverImage.trim() === '' || d.coverImage.includes(defaultPlaceholderImg);
      
      if (isPlaceholder || isCoverPlaceholder) {
        const smartUrl = getSmartDirectUnsplashUrl(d.name, d.description || "", d.tourismType || "scenery");
        if (isPlaceholder) {
          d.image = smartUrl;
        }
        if (isCoverPlaceholder) {
          d.coverImage = smartUrl;
        }
      }
      return d;
    });
  }

  public getAttractions(): Attraction[] {
    const defaultPlaceholderImg = "photo-1544735716-392fe2489ffa";
    return this.data.attractions.map(a => {
      const isPlaceholder = !a.image || a.image.trim() === '' || a.image.includes(defaultPlaceholderImg);
      const isCoverPlaceholder = !a.coverImage || a.coverImage.trim() === '' || a.coverImage.includes(defaultPlaceholderImg);
      
      if (isPlaceholder || isCoverPlaceholder) {
        const smartUrl = getSmartDirectUnsplashUrl(a.name, a.description || "", a.category || "sightseeing");
        if (isPlaceholder) {
          a.image = smartUrl;
        }
        if (isCoverPlaceholder) {
          a.coverImage = smartUrl;
        }
      }
      return a;
    });
  }

  public getHomestays(): Homestay[] { return this.data.homestays; }
  public getRoomCategories(): RoomCategory[] { return this.data.roomCategories || []; }
  public getRoomImages(): RoomImage[] { return this.data.roomImages || []; }
  public getHomestayGallery(): HomestayGallery[] { return this.data.homestayGallery || []; }
  public getHomestayReviews(): HomestayReview[] { return this.data.homestayReviews || []; }
  public getGeospatialRelationships(): GeospatialRelationship[] { return this.data.geospatial_relationships || []; }

  public getConversations(): ChatConversation[] { return this.data.conversations || []; }
  public getConversationParticipants(): ConversationParticipant[] { return this.data.conversationParticipants || []; }
  public getChatMessages(): ChatMessage[] { return this.data.chatMessages || []; }
  public getChatNotifications(): ChatNotification[] { return this.data.chatNotifications || []; }

  public updateConversations(convs: ChatConversation[]) {
    this.data.conversations = convs;
    this.save();
  }
  public updateConversationParticipants(parts: ConversationParticipant[]) {
    this.data.conversationParticipants = parts;
    this.save();
  }
  public updateChatMessages(msgs: ChatMessage[]) {
    this.data.chatMessages = msgs;
    this.save();
  }
  public updateChatNotifications(notifs: ChatNotification[]) {
    this.data.chatNotifications = notifs;
    this.save();
  }
  public getRecommendationSettings(): any {
    return this.data.recommendationSettings || null;
  }
  public setRecommendationSettings(settings: any) {
    this.data.recommendationSettings = settings;
  }

  public getImages(): ImageItem[] { return this.data.images; }
  public getContributions(): Contribution[] { return this.data.contributions; }
  public getTripLeads(): TripLead[] { return this.data.tripLeads; }
  public getCarLeads(): CarLead[] { return this.data.carLeads; }
  public getDrivers(): Driver[] { return this.data.drivers || []; }
  public getUserRoles(): UserRole[] { return this.data.userRoles || []; }
  
  public getTaxiOperators(): TaxiOperator[] { return this.data.taxiOperators || []; }
  public updateTaxiOperators(items: TaxiOperator[]) {
    this.data.taxiOperators = items;
    this.save();
    syncCollectionToFirestore('taxi_operators', items);
  }
  
  public getVehicles(): any[] { return this.data.vehicles || []; }
  public updateVehicles(items: any[]) {
    this.data.vehicles = items;
    this.save();
    syncCollectionToFirestore('vehicles', items);
  }

  public getQuoteRequests(): QuoteRequest[] { return this.data.quoteRequests || []; }
  public updateQuoteRequests(items: QuoteRequest[]) {
    this.data.quoteRequests = items;
    this.save();
    syncCollectionToFirestore('quote_requests', items);
  }

  public getTaxiBookings(): any[] { return this.data.taxiBookings || []; }
  public updateTaxiBookings(items: any[]) {
    this.data.taxiBookings = items;
    this.save();
    syncCollectionToFirestore('taxi_bookings', items);
  }

  public getTaxiReviews(): any[] { return this.data.taxiReviews || []; }
  public updateTaxiReviews(items: any[]) {
    this.data.taxiReviews = items;
    this.save();
    syncCollectionToFirestore('taxi_reviews', items);
    writeToInteractions('taxi_reviews_list', 'list', items);
  }

  public getTaxiAuditLogs(): any[] { return this.data.taxiAuditLogs || []; }
  public updateTaxiAuditLogs(items: any[]) {
    this.data.taxiAuditLogs = items;
    this.save();
    syncCollectionToFirestore('taxi_audit_logs', items);
  }

  public getSupportCases(): any[] { return this.data.supportCases || []; }
  public updateSupportCases(items: any[]) {
    this.data.supportCases = items;
    this.save();
    syncCollectionToFirestore('support_cases', items);
  }
  public addQuoteRequest(item: QuoteRequest) {
    this.data.quoteRequests = this.data.quoteRequests || [];
    this.data.quoteRequests.push(item);
    this.save();
    syncDoc('quote_requests', item.id, item).catch(err => {
      console.error('[Background Sync Warning] addQuoteRequest failed:', err);
    });
  }

  public getQuoteRequestRecipients(): QuoteRequestRecipient[] { return this.data.quoteRequestRecipients || []; }
  public updateQuoteRequestRecipients(items: QuoteRequestRecipient[]) {
    this.data.quoteRequestRecipients = items;
    this.save();
    syncCollectionToFirestore('quote_request_recipients', items);
  }
  public addQuoteRequestRecipient(item: QuoteRequestRecipient) {
    this.data.quoteRequestRecipients = this.data.quoteRequestRecipients || [];
    this.data.quoteRequestRecipients.push(item);
    this.save();
    syncDoc('quote_request_recipients', item.id, item).catch(err => {
      console.error('[Background Sync Warning] addQuoteRequestRecipient failed:', err);
    });
  }

  public getQuotes(): Quote[] { return this.data.quotes || []; }
  public updateQuotes(items: Quote[]) {
    this.data.quotes = items;
    this.save();
    syncCollectionToFirestore('quotes', items);
  }
  public addQuote(item: Quote) {
    this.data.quotes = this.data.quotes || [];
    this.data.quotes.push(item);
    this.save();
    syncDoc('quotes', item.id, item).catch(err => {
      console.error('[Background Sync Warning] addQuote failed:', err);
    });
  }
  
  public getUsers(): User[] { return this.data.users || []; }
  public getRoles(): Role[] { return this.data.roles || []; }
  public getPermissions(): Permission[] { return this.data.permissions || []; }
  public getRolePermissions(): RolePermission[] { return this.data.rolePermissions || []; }
  public getUserPermissions(): UserPermission[] { return this.data.userPermissions || []; }
  public getAuditLogs(): AuditLog[] { return this.data.auditLogs || []; }
  
  public getClaimRequests(): ClaimRequest[] { return this.data.claimRequests || []; }
  public getInquiries(): Inquiry[] { return this.data.inquiries || []; }
  public getOwnershipHistory(): OwnershipHistory[] { return this.data.ownershipHistory || []; }
  public getPendingUpdates(): PendingUpdate[] { return this.data.pendingUpdates || []; }
  public getSiteSettings(): SiteSettings[] { return this.data.siteSettings || []; }
  public setSiteSettings(settings: SiteSettings[]) { this.data.siteSettings = settings; this.save(); }

  public getBookingLeads(): BookingLead[] { return this.data.bookingLeads || []; }
  public getBookingStatusHistory(): BookingStatusHistory[] { return this.data.bookingStatusHistory || []; }
  public getBookingNotifications(): BookingNotification[] { return this.data.bookingNotifications || []; }
  public updateBookingNotifications(items: BookingNotification[]) {
    this.data.bookingNotifications = items;
    this.save();
    syncCollectionToFirestore('booking_notifications', items);
  }
  public getBookingActivityLog(): BookingActivityLog[] { return this.data.bookingActivityLog || []; }
  public getBookingReviews(): any[] { return this.data.bookingReviews || []; }

  public getSystemReports(): SystemReport[] { return this.data.systemReports || []; }

  public getBlogs(): Blog[] { return this.data.blogs || []; }
  public getBlogCategories(): BlogCategory[] { return this.data.blogCategories || []; }
  public getBlogTags(): BlogTag[] { return this.data.blogTags || []; }
  public getBlogTagMaps(): BlogTagMap[] { return this.data.blogTagMaps || []; }
  public getBlogAuthors(): BlogAuthor[] { return this.data.blogAuthors || []; }
  public getBlogImages(): BlogImage[] { return this.data.blogImages || []; }
  public getBlogRelatedLinks(): BlogRelatedLink[] { return this.data.blogRelatedLinks || []; }
  public getBlogFaqs(): BlogFaq[] { return this.data.blogFaqs || []; }
  public getBlogVersions(): BlogVersion[] { return this.data.blogVersions || []; }
  public getBlogViews(): BlogView[] { return this.data.blogViews || []; }
  public getBlogLikes(): BlogLike[] { return this.data.blogLikes || []; }
  public getBlogBookmarks(): BlogBookmark[] { return this.data.blogBookmarks || []; }
  public getBlogShares(): BlogShare[] { return this.data.blogShares || []; }
  public getBlogComments(): BlogComment[] { return this.data.blogComments || []; }
  public getBlogSeos(): BlogSeo[] { return this.data.blogSeos || []; }
  public getBlogSchedules(): BlogSchedule[] { return this.data.blogSchedules || []; }
  public getBlogActivityLogs(): BlogActivityLog[] { return this.data.blogActivityLogs || []; }
  public addSystemReport(item: SystemReport) {
    this.data.systemReports = this.data.systemReports || [];
    this.data.systemReports.push(item);
    this.save();
    syncDoc('system_reports', item.id, item).catch(err => {
      console.error('[Background Sync Warning] addSystemReport failed:', err);
    });
  }
  public updateSystemReports(items: SystemReport[]) {
    this.data.systemReports = items;
    this.save();
    syncCollectionToFirestore('system_reports', items);
  }

  public updateUsers(users: User[]) {
    // Protection Rule: Prevent Super Admin demotion/deactivation or deletion
    const superId = 'mavanish24@gmail.com';
    const hasSuper = users.some(u => u && u.email && u.email.trim().toLowerCase() === superId);
    if (!hasSuper) {
      // Re-insert Super Admin if missing
      const oldSuper = this.data.users.find(u => u && u.email && u.email.trim().toLowerCase() === superId) || {
        id: superId,
        email: superId,
        name: 'Mavanish Super Admin',
        passwordHash: '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f',
        role: 'super_admin' as const,
        status: 'active' as const,
        emailVerified: true,
        customPermissions: [],
        createdAt: new Date().toISOString()
      };
      users.push(oldSuper);
    } else {
      const sAdminObj = users.find(u => u && u.email && u.email.trim().toLowerCase() === superId);
      if (sAdminObj) {
        sAdminObj.role = 'super_admin';
        sAdminObj.status = 'active';
      }
    }

    this.data.users = users;
    this.save();
    syncCollectionToFirestore('users', users);
  }

  public updateRoles(roles: Role[]) {
    this.data.roles = roles;
    this.save();
    syncCollectionToFirestore('roles', roles);
  }

  public updatePermissions(perms: Permission[]) {
    this.data.permissions = perms;
    this.save();
    syncCollectionToFirestore('permissions', perms);
  }

  public updateRolePermissions(rolePerms: RolePermission[]) {
    this.data.rolePermissions = rolePerms;
    this.save();
    syncCollectionToFirestore('role_permissions', rolePerms);
  }

  public updateUserPermissions(userPerms: UserPermission[]) {
    this.data.userPermissions = userPerms;
    this.save();
    syncCollectionToFirestore('user_permissions', userPerms);
  }

  public updateAuditLogs(logs: AuditLog[]) {
    this.data.auditLogs = logs;
    this.save();
    syncCollectionToFirestore('audit_logs', logs);
  }

  public addAuditLog(log: AuditLog) {
    this.data.auditLogs = this.data.auditLogs || [];
    this.data.auditLogs.unshift(log);
    this.save();
    syncDoc('audit_logs', log.id, log).catch(err => {
      console.error('[Background Sync Warning] addAuditLog push failed:', err);
    });
  }

  public getPhotoContributions(): PhotoContribution[] { return this.data.photoContributions || []; }
  public addPhotoContribution(item: PhotoContribution) {
    this.data.photoContributions = this.data.photoContributions || [];
    this.data.photoContributions.push(item);
    this.save();
    syncDoc('photo_contributions', item.id, item).catch(err => {
      console.error('[Background Sync Warning] addPhotoContribution failed:', err);
    });
  }
  public updatePhotoContributions(items: PhotoContribution[]) {
    this.data.photoContributions = items;
    this.save();
    syncCollectionToFirestore('photo_contributions', items);
  }

  public getNotifications(): PhotoNotification[] { return this.data.notifications || []; }
  public addNotification(item: PhotoNotification) {
    this.data.notifications = this.data.notifications || [];
    this.data.notifications.push(item);
    this.save();
    syncDoc('photo_notifications', item.id, item).catch(err => {
      console.error('[Background Sync Warning] addNotification failed:', err);
    });
  }
  public updateNotifications(items: PhotoNotification[]) {
    this.data.notifications = items;
    this.save();
    syncCollectionToFirestore('photo_notifications', items);
  }

  public getAppNotifications(): AppNotification[] { return this.data.appNotifications || []; }
  public addAppNotification(item: AppNotification) {
    this.data.appNotifications = this.data.appNotifications || [];
    this.data.appNotifications.push(item);
    this.save();
    syncDoc('notifications', item.id, item).catch(err => {
      console.error('[Background Sync Warning] addAppNotification failed:', err);
    });
  }
  public updateAppNotifications(items: AppNotification[]) {
    this.data.appNotifications = items;
    this.save();
    syncCollectionToFirestore('notifications', items);
  }
  public updateDrivers(drivers: Driver[]) {
    this.data.drivers = drivers;
    this.save();
    syncCollectionToFirestore('drivers', drivers);
  }

  // Imports / Resets
  public importHubs(hubs: Hub[]) {
    this.data.hubs = hubs;
    this.invalidateRouteGraph();
    this.save();
    syncCollectionToFirestore('hubs', hubs);
    writeToInteractions('taxi_stands_list', 'list', hubs);
  }

  public importRoutes(routes: Route[]) {
    this.data.routes = routes;
    this.invalidateRouteGraph();
    this.save();
    syncCollectionToFirestore('routes', routes);
  }

  // Create or Update
  public updateDestinations(dests: Destination[]) {
    this.data.destinations = dests;
    this.save();
    syncCollectionToFirestore('destinations', dests);
  }

  public updateAttractions(attrs: Attraction[]) {
    this.data.attractions = attrs;
    this.save();
    syncCollectionToFirestore('attractions', attrs);
  }

  public updateHomestays(homestays: Homestay[]) {
    this.data.homestays = homestays;
    this.save();
    syncCollectionToFirestore('homestays', homestays);
  }

  public updateImages(images: ImageItem[]) {
    this.data.images = images;
    this.save();
    syncCollectionToFirestore('images', images);
  }

  public addTripLead(lead: TripLead) {
    this.data.tripLeads.push(lead);
    this.save();
    syncDoc('trip_leads', lead.id, lead).catch(err => {
      console.error('[Background Sync Warning] addTripLead push failed:', err);
    });
  }

  public addCarLead(lead: CarLead) {
    this.data.carLeads.push(lead);
    this.save();
    syncDoc('car_leads', lead.id, lead).catch(err => {
      console.error('[Background Sync Warning] addCarLead push failed:', err);
    });
  }

  public addContribution(cont: Contribution) {
    this.data.contributions.push(cont);
    this.save();
    syncDoc('contributions', cont.id, cont).catch(err => {
      console.error('[Background Sync Warning] addContribution push failed:', err);
    });
  }

  public approveContribution(id: string) {
    const cont = this.data.contributions.find(c => c.id === id);
    if (!cont) return;
    cont.status = 'Approved';

    // If Approved, convert into corresponding official data
    const details = cont.details;
    if (cont.type === 'add_route') {
      const newRoute: Route = {
        id: `route-${Date.now()}`,
        fromHubId: details.fromHubId,
        toHubId: details.toHubId,
        path: details.path || [],
        type: details.type || 'Direct',
        fareMin: Number(details.fareMin) || 1200,
        fareMax: Number(details.fareMax) || 2000,
        timeMin: Number(details.timeMin) || 90,
        timeMax: Number(details.timeMax) || 150,
        distance: details.distance ? Number(details.distance) : undefined,
        verified: true,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      this.data.routes.push(newRoute);
    } else if (cont.type === 'add_attraction') {
      const newAttr: Attraction = {
        id: `attr-${Date.now()}`,
        name: details.name,
        category: details.category || 'Viewpoint',
        destinationId: details.destinationId,
        description: details.description || '',
        image: details.image || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop',
        gallery: []
      };
      this.data.attractions.push(newAttr);
    } else if (cont.type === 'add_homestay') {
      const newHome: Homestay = {
        id: `home-${Date.now()}`,
        name: details.name,
        destinationId: details.destinationId,
        priceMin: Number(details.priceMin) || 1000,
        priceMax: Number(details.priceMax) || 2000,
        contact: details.contact || '',
        amenities: details.amenities || ['Meals Provided', 'Geyser'],
        images: [details.image || DEFAULT_HOMESTAY_IMAGE],
        tagline: details.tagline || '',
        description: details.description || '',
        address: details.address || '',
        breakfastIncluded: details.breakfastIncluded || 'Included',
        lunchAvailable: !!details.lunchAvailable,
        dinnerAvailable: !!details.dinnerAvailable,
        vegOnly: !!details.vegOnly,
        bonfireAvailable: !!details.bonfireAvailable,
        bbqAvailable: !!details.bbqAvailable,
        taxiReachesProperty: !!details.taxiReachesProperty,
        walkingDistanceParking: details.walkingDistanceParking !== undefined ? Number(details.walkingDistanceParking) : undefined,
        wifi: !!details.wifi,
        powerBackup: !!details.powerBackup,
        familyFriendly: !!details.familyFriendly,
        unmarriedCouplesAllowed: !!details.unmarriedCouplesAllowed,
        petPolicy: details.petPolicy || '',
        checkInTime: details.checkInTime || '12:00 PM',
        checkOutTime: details.checkOutTime || '11:00 AM',
        langEnglish: !!details.langEnglish,
        langHindi: !!details.langHindi,
        langBengali: !!details.langBengali,
        langNepali: !!details.langNepali,
        langOthers: details.langOthers || '',
        kanchenjungaView: !!details.kanchenjungaView,
        teaGardenView: !!details.teaGardenView,
        forestView: !!details.forestView,
        riverView: !!details.riverView,
        stargazing: !!details.stargazing,
        droneAllowed: !!details.droneAllowed,
        preWeddingShoot: !!details.preWeddingShoot,
        commercialPhotography: !!details.commercialPhotography,
        birdWatching: !!details.birdWatching,
        cctv: !!details.cctv,
        caretaker: !!details.caretaker,
        firstAidKit: !!details.firstAidKit,
        wheelchairAccessible: !!details.wheelchairAccessible,
        groundFloorRooms: !!details.groundFloorRooms,
        emergencyContact: details.emergencyContact || '',
        status: 'Approved',
        isVerified: false,
        isFeatured: false
      };
      this.data.homestays.push(newHome);
    } else if (cont.type === 'upload_photo') {
      const newImage: ImageItem = {
        id: `img-${Date.now()}`,
        url: details.url,
        entityType: details.entityType,
        entityId: details.entityId,
        destinationId: details.entityType === 'destination' ? details.entityId : null,
        attractionId: details.entityType === 'attraction' ? details.entityId : null,
        uploadedBy: cont.contributorName || 'Traveler Contribution',
        uploadDate: new Date().toISOString(),
        status: 'Approved',
        caption: details.caption || 'Contributor Photo',
        altText: details.altText || 'Indian Hill Scenic View'
      };
      this.data.images.push(newImage);

      // Append to the gallery of the respective entity:
      if (details.entityType === 'destination') {
        const dest = this.data.destinations.find(d => d.id === details.entityId);
        if (dest) dest.gallery.push(details.url);
      } else if (details.entityType === 'attraction') {
        const att = this.data.attractions.find(a => a.id === details.entityId);
        if (att) att.gallery.push(details.url);
      } else if (details.entityType === 'homestay') {
        const hs = this.data.homestays.find(h => h.id === details.entityId);
        if (hs) hs.images.push(details.url);
      }
    } else if (cont.type === 'correct_route') {
      const route = this.data.routes.find(r => r.id === details.routeId);
      if (route) {
        if (details.fareMin) route.fareMin = Number(details.fareMin);
        if (details.fareMax) route.fareMax = Number(details.fareMax);
        if (details.timeMin) route.timeMin = Number(details.timeMin);
        if (details.timeMax) route.timeMax = Number(details.timeMax);
        if (details.distance !== undefined) route.distance = Number(details.distance);
        if (details.path) route.path = details.path;
        route.verified = true;
        route.lastUpdated = new Date().toISOString().split('T')[0];
      }
    }

    this.save();
    this.syncAllToFirestore();
  }

  public rejectContribution(id: string) {
    const cont = this.data.contributions.find(c => c.id === id);
    if (!cont) return;
    cont.status = 'Rejected';
    this.save();
    syncDoc('contributions', id, cont).catch(err => {
      console.error('[Background Sync Warning] rejectContribution update failed:', err);
    });
  }

  public deleteCarLead(id: string) {
    this.data.carLeads = this.data.carLeads.filter(l => l.id !== id);
    this.save();
    deleteDocInFirestore('car_leads', id).catch(err => {
      console.error('[Background Sync Warning] deleteCarLead delete failed:', err);
    });
  }

  public deleteTripLead(id: string) {
    this.data.tripLeads = this.data.tripLeads.filter(l => l.id !== id);
    this.save();
    deleteDocInFirestore('trip_leads', id).catch(err => {
      console.error('[Background Sync Warning] deleteTripLead delete failed:', err);
    });
  }

  public updateCarLeadStatus(id: string, status: string) {
    const lead = this.data.carLeads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      this.save();
      syncDoc('car_leads', id, lead).catch(err => {
        console.error('[Background Sync Warning] updateCarLeadStatus failed:', err);
      });
    }
  }

  // Generic CRUD administrative operations for admin panel
  public async saveRecord(col: string, record: any): Promise<boolean> {
    const keyMap: Record<string, keyof Schema> = {
      booking_reviews: 'bookingReviews',
      bookingReviews: 'bookingReviews',
      hubs: 'hubs',
      routes: 'routes',
      destinations: 'destinations',
      attractions: 'attractions',
      homestays: 'homestays',
      room_categories: 'roomCategories',
      room_images: 'roomImages',
      homestay_gallery: 'homestayGallery',
      homestay_reviews: 'homestayReviews',
      images: 'images',
      contributions: 'contributions',
      trip_leads: 'tripLeads',
      car_leads: 'carLeads',
      tripLeads: 'tripLeads',
      carLeads: 'carLeads',
      drivers: 'drivers',
      user_roles: 'userRoles',
      userRoles: 'userRoles',
      notifications: 'appNotifications',
      appNotifications: 'appNotifications',
      claim_requests: 'claimRequests',
      claimRequests: 'claimRequests',
      inquiries: 'inquiries',
      ownership_history: 'ownershipHistory',
      ownershipHistory: 'ownershipHistory',
      pending_updates: 'pendingUpdates',
      pendingUpdates: 'pendingUpdates',
      site_settings: 'siteSettings',
      siteSettings: 'siteSettings',
      booking_leads: 'bookingLeads',
      bookingLeads: 'bookingLeads',
      booking_status_history: 'bookingStatusHistory',
      bookingStatusHistory: 'bookingStatusHistory',
      booking_notifications: 'bookingNotifications',
      bookingNotifications: 'bookingNotifications',
      booking_activity_log: 'bookingActivityLog',
      bookingActivityLog: 'bookingActivityLog',
      blogs: 'blogs',
      blog_categories: 'blogCategories',
      blogCategories: 'blogCategories',
      blog_tags: 'blogTags',
      blogTags: 'blogTags',
      blog_tag_map: 'blogTagMaps',
      blogTagMaps: 'blogTagMaps',
      blog_authors: 'blogAuthors',
      blogAuthors: 'blogAuthors',
      blog_images: 'blogImages',
      blogImages: 'blogImages',
      blog_related_links: 'blogRelatedLinks',
      blogRelatedLinks: 'blogRelatedLinks',
      blog_faqs: 'blogFaqs',
      blogFaqs: 'blogFaqs',
      blog_versions: 'blogVersions',
      blogVersions: 'blogVersions',
      blog_views: 'blogViews',
      blogViews: 'blogViews',
      blog_likes: 'blogLikes',
      blogLikes: 'blogLikes',
      blog_bookmarks: 'blogBookmarks',
      blogBookmarks: 'blogBookmarks',
      blog_shares: 'blogShares',
      blogShares: 'blogShares',
      blog_comments: 'blogComments',
      blogComments: 'blogComments',
      blog_seo: 'blogSeos',
      blogSeos: 'blogSeos',
      blog_schedule: 'blogSchedules',
      blogSchedules: 'blogSchedules',
      blog_activity_logs: 'blogActivityLogs',
      blogActivityLogs: 'blogActivityLogs'
    };

    let targetKey = keyMap[col];
    if (!targetKey) {
      const dynamicMap: Record<string, keyof Schema> = {
        dashboard_configurations: 'dashboardConfigurations',
        dashboardConfigurations: 'dashboardConfigurations',
        menu_configurations: 'menuConfigurations',
        menuConfigurations: 'menuConfigurations',
        widget_configurations: 'widgetConfigurations',
        widgetConfigurations: 'widgetConfigurations',
        form_templates: 'formTemplates',
        formTemplates: 'formTemplates',
        form_fields: 'formFields',
        formFields: 'formFields',
        field_options: 'fieldOptions',
        fieldOptions: 'fieldOptions',
        table_configurations: 'tableConfigurations',
        tableConfigurations: 'tableConfigurations',
        notification_preferences: 'notificationPreferences',
        notificationPreferences: 'notificationPreferences',
        notification_rules: 'notificationRules',
        notificationRules: 'notificationRules',
        feature_flags: 'featureFlags',
        featureFlags: 'featureFlags',
        workflow_definitions: 'workflowDefinitions',
        workflowDefinitions: 'workflowDefinitions',
        workflow_steps: 'workflowSteps',
        workflowSteps: 'workflowSteps',
        booking_payments: 'bookingPayments',
        bookingPayments: 'bookingPayments',
        booking_documents: 'bookingDocuments',
        bookingDocuments: 'bookingDocuments',
        booking_reviews: 'bookingReviews',
        bookingReviews: 'bookingReviews',
        booking_notes: 'bookingNotes',
        bookingNotes: 'bookingNotes',
        booking_reminders: 'bookingReminders',
        bookingReminders: 'bookingReminders',
        brand_settings: 'brandSettings',
        brandSettings: 'brandSettings',
        homepage_settings: 'homepageSettings',
        homepageSettings: 'homepageSettings',
        hero_settings: 'heroSettings',
        heroSettings: 'heroSettings',
        business_rules: 'businessRules',
        businessRules: 'businessRules',
        permission_roles: 'permissionRoles',
        permissionRoles: 'permissionRoles',
        permission_mappings: 'permissionMappings',
        permissionMappings: 'permissionMappings',
        system_logs: 'systemLogs',
        systemLogs: 'systemLogs'
      };
      targetKey = dynamicMap[col];
    }
    if (!targetKey) return false;

    // First push directly to firestore to ensure validity of rules and data constraints:
    const fsCol = 
      col === 'tripLeads' ? 'trip_leads' : 
      col === 'carLeads' ? 'car_leads' : 
      col === 'userRoles' ? 'user_roles' : 
      col === 'claimRequests' ? 'claim_requests' : 
      col === 'ownershipHistory' ? 'ownership_history' : 
      col === 'pendingUpdates' ? 'pending_updates' : 
      col === 'siteSettings' ? 'site_settings' : 
      col === 'bookingLeads' ? 'booking_leads' : 
      col === 'bookingStatusHistory' ? 'booking_status_history' : 
      col === 'bookingNotifications' ? 'booking_notifications' : 
      col === 'bookingActivityLog' ? 'booking_activity_log' : col;
    try {
      await syncDoc(fsCol, record.id, record);
    } catch (errSync: any) {
      console.warn(`[Firestore Sync Warning] Failed to sync doc ${record.id} in collection ${fsCol} to Firestore (local save will proceed):`, errSync.message || errSync);
    }

    // Safely commit locally to memory and save to hillytrip_db_store.json file
    if (!this.data[targetKey]) {
      (this.data[targetKey] as any) = [];
    }
    const arr = this.data[targetKey] as any[];
    const idx = arr.findIndex(item => item.id === record.id);
    const isNew = idx === -1;
    if (idx > -1) {
      arr[idx] = record;
    } else {
      arr.push(record);
    }
    this.save();

    if (col === 'bookingReviews' || col === 'booking_reviews') {
      writeToInteractions('booking_review', record.id, record);
    }
    if (col === 'homestayReviews' || col === 'homestay_reviews') {
      writeToInteractions('homestay_review', record.id, record);
    }

    // Trigger auto pending notification generation for new Master Data records
    if (isNew) {
      try {
        if (col === 'destinations') {
          const notifId = 'notif_dest_' + record.id + '_' + Date.now();
          const notif: AppNotification = {
            id: notifId,
            title: `Explore ${record.name}!`,
            message: `New Destination added: ${record.description ? record.description.substring(0, 100) : ''}... Visit ${record.name} now!`,
            type: 'destination_added',
            status: 'pending',
            imageUrl: record.image || null,
            destinationId: record.id,
            createdAt: new Date().toISOString(),
            isPushNotification: false,
            priority: 'normal'
          };
          this.addAppNotification(notif);
        } else if (col === 'attractions') {
          const notifId = 'notif_attr_' + record.id + '_' + Date.now();
          const notif: AppNotification = {
            id: notifId,
            title: `New Attraction: ${record.name}!`,
            message: `A new sightseeing attraction "${record.name}" (${record.category || 'Sightseeing'}) has been added under destination.`,
            type: 'attraction_added',
            status: 'pending',
            imageUrl: record.image || null,
            destinationId: record.destinationId || null,
            attractionId: record.id,
            createdAt: new Date().toISOString(),
            isPushNotification: false,
            priority: 'normal'
          };
          this.addAppNotification(notif);
        } else if (col === 'homestays') {
          const notifId = 'notif_home_' + record.id + '_' + Date.now();
          const notif: AppNotification = {
            id: notifId,
            title: `Cozy Homestay: ${record.name}!`,
            message: `Check out the cozy homestay "${record.name}" with modern amenities. Starting at only ₹${record.priceMin || 0}/night!`,
            type: 'homestay_added',
            status: 'pending',
            imageUrl: (record.images && record.images.length > 0) ? record.images[0] : null,
            destinationId: record.destinationId || null,
            homestayId: record.id,
            createdAt: new Date().toISOString(),
            isPushNotification: false,
            priority: 'normal'
          };
          this.addAppNotification(notif);
        }
      } catch (e) {
        console.error('[Auto Notification] Hook generation failed:', e);
      }
    }

    // Trigger on-the-fly background geocoding & spatial calculations for location masters
    if (['destinations', 'attractions', 'homestays', 'hubs'].includes(col)) {
      import('./locationIntelligence').then(({ triggerBackgroundGeocodingAndSpatial }) => {
        triggerBackgroundGeocodingAndSpatial(col, record.id).catch(err => {
          console.error('[On-the-fly GPS Hook Error]', err);
        });
      });
    }

    if (['hubs', 'routes'].includes(col)) {
      this.invalidateRouteGraph();
    }

    return true;
  }

  public async saveRecordsBulk(col: string, records: any[]): Promise<boolean> {
    const keyMap: Record<string, keyof Schema> = {
      booking_reviews: 'bookingReviews',
      bookingReviews: 'bookingReviews',
      hubs: 'hubs',
      routes: 'routes',
      destinations: 'destinations',
      attractions: 'attractions',
      homestays: 'homestays',
      room_categories: 'roomCategories',
      room_images: 'roomImages',
      homestay_gallery: 'homestayGallery',
      homestay_reviews: 'homestayReviews',
      images: 'images',
      contributions: 'contributions',
      trip_leads: 'tripLeads',
      car_leads: 'carLeads',
      tripLeads: 'tripLeads',
      carLeads: 'carLeads',
      drivers: 'drivers',
      user_roles: 'userRoles',
      userRoles: 'userRoles',
      notifications: 'appNotifications',
      appNotifications: 'appNotifications',
      claim_requests: 'claimRequests',
      claimRequests: 'claimRequests',
      inquiries: 'inquiries',
      ownership_history: 'ownershipHistory',
      ownershipHistory: 'ownershipHistory',
      pending_updates: 'pendingUpdates',
      pendingUpdates: 'pendingUpdates',
      site_settings: 'siteSettings',
      siteSettings: 'siteSettings',
      booking_leads: 'bookingLeads',
      bookingLeads: 'bookingLeads',
      booking_status_history: 'bookingStatusHistory',
      bookingStatusHistory: 'bookingStatusHistory',
      booking_notifications: 'bookingNotifications',
      bookingNotifications: 'bookingNotifications',
      booking_activity_log: 'bookingActivityLog',
      bookingActivityLog: 'bookingActivityLog'
    };

    let targetKey = keyMap[col];
    if (!targetKey) {
      const dynamicMap: Record<string, keyof Schema> = {
        dashboard_configurations: 'dashboardConfigurations',
        dashboardConfigurations: 'dashboardConfigurations',
        menu_configurations: 'menuConfigurations',
        menuConfigurations: 'menuConfigurations',
        widget_configurations: 'widgetConfigurations',
        widgetConfigurations: 'widgetConfigurations',
        form_templates: 'formTemplates',
        formTemplates: 'formTemplates',
        form_fields: 'formFields',
        formFields: 'formFields',
        field_options: 'fieldOptions',
        fieldOptions: 'fieldOptions',
        table_configurations: 'tableConfigurations',
        tableConfigurations: 'tableConfigurations',
        notification_preferences: 'notificationPreferences',
        notificationPreferences: 'notificationPreferences',
        notification_rules: 'notificationRules',
        notificationRules: 'notificationRules',
        feature_flags: 'featureFlags',
        featureFlags: 'featureFlags',
        workflow_definitions: 'workflowDefinitions',
        workflowDefinitions: 'workflowDefinitions',
        workflow_steps: 'workflowSteps',
        workflowSteps: 'workflowSteps',
        booking_payments: 'bookingPayments',
        bookingPayments: 'bookingPayments',
        booking_documents: 'bookingDocuments',
        bookingDocuments: 'bookingDocuments',
        booking_reviews: 'bookingReviews',
        bookingReviews: 'bookingReviews',
        booking_notes: 'bookingNotes',
        bookingNotes: 'bookingNotes',
        booking_reminders: 'bookingReminders',
        bookingReminders: 'bookingReminders',
        brand_settings: 'brandSettings',
        brandSettings: 'brandSettings',
        homepage_settings: 'homepageSettings',
        homepageSettings: 'homepageSettings',
        hero_settings: 'heroSettings',
        heroSettings: 'heroSettings',
        business_rules: 'businessRules',
        businessRules: 'businessRules',
        permission_roles: 'permissionRoles',
        permissionRoles: 'permissionRoles',
        permission_mappings: 'permissionMappings',
        permissionMappings: 'permissionMappings',
        system_logs: 'systemLogs',
        systemLogs: 'systemLogs'
      };
      targetKey = dynamicMap[col];
    }
    if (!targetKey) return false;

    const fsCol = 
      col === 'tripLeads' ? 'trip_leads' : 
      col === 'carLeads' ? 'car_leads' : 
      col === 'userRoles' ? 'user_roles' : 
      col === 'claimRequests' ? 'claim_requests' : 
      col === 'ownershipHistory' ? 'ownership_history' : 
      col === 'pendingUpdates' ? 'pending_updates' : 
      col === 'siteSettings' ? 'site_settings' : 
      col === 'bookingLeads' ? 'booking_leads' : 
      col === 'bookingStatusHistory' ? 'booking_status_history' : 
      col === 'bookingNotifications' ? 'booking_notifications' : 
      col === 'bookingActivityLog' ? 'booking_activity_log' : col;

    // 1. Concurrently sync directly to Firestore in throttled parallel chunks (prevents connection exhaustion and timeouts)
    const syncErrors: string[] = [];
    const validRecords = records.filter(r => r && r.id);
    const limit = 40; // Sync 40 entries concurrently
    const chunks: any[][] = [];
    for (let i = 0; i < validRecords.length; i += limit) {
      chunks.push(validRecords.slice(i, i + limit));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (record) => {
          try {
            await syncDoc(fsCol, record.id, record);
          } catch (err: any) {
            console.error(`[saveRecordsBulk Sync Error] on record "${record.id}":`, err);
            syncErrors.push(`${record.id}: ${err.message || err}`);
          }
        })
      );
    }

    // 2. Commit all changes locally to memory
    const arr = this.data[targetKey] as any[];
    for (const record of records) {
      if (record && record.id) {
        const idx = arr.findIndex(item => item.id === record.id);
        if (idx > -1) {
          arr[idx] = { ...arr[idx], ...record };
        } else {
          arr.push(record);
        }

        // Trigger on-the-fly background geocoding & spatial calculations
        if (['destinations', 'attractions', 'homestays', 'hubs'].includes(col)) {
          import('./locationIntelligence').then(({ triggerBackgroundGeocodingAndSpatial }) => {
            triggerBackgroundGeocodingAndSpatial(col, record.id).catch(err => {
              console.error('[On-the-fly GPS Hook Error during bulk]', err);
            });
          });
        }
      }
    }

    // 3. Save database to disk exactly ONCE at the end
    this.save();

    if (['hubs', 'routes'].includes(col)) {
      this.invalidateRouteGraph();
    }

    if (syncErrors.length > 0) {
      console.warn(`[saveRecordsBulk Completed with Warnings] Local save succeeded, but ${syncErrors.length} records failed to sync to Firestore:`, syncErrors);
    }

    return true;
  }

  public async updateRecord(col: string, id: string, updatedRecord: any): Promise<boolean> {
    const keyMap: Record<string, keyof Schema> = {
      booking_reviews: 'bookingReviews',
      bookingReviews: 'bookingReviews',
      hubs: 'hubs',
      routes: 'routes',
      destinations: 'destinations',
      attractions: 'attractions',
      homestays: 'homestays',
      room_categories: 'roomCategories',
      room_images: 'roomImages',
      homestay_gallery: 'homestayGallery',
      homestay_reviews: 'homestayReviews',
      geospatial_relationships: 'geospatial_relationships',
      images: 'images',
      contributions: 'contributions',
      trip_leads: 'tripLeads',
      car_leads: 'carLeads',
      tripLeads: 'tripLeads',
      carLeads: 'carLeads',
      drivers: 'drivers',
      user_roles: 'userRoles',
      userRoles: 'userRoles',
      notifications: 'appNotifications',
      appNotifications: 'appNotifications',
      claim_requests: 'claimRequests',
      claimRequests: 'claimRequests',
      inquiries: 'inquiries',
      ownership_history: 'ownershipHistory',
      ownershipHistory: 'ownershipHistory',
      pending_updates: 'pendingUpdates',
      pendingUpdates: 'pendingUpdates',
      site_settings: 'siteSettings',
      siteSettings: 'siteSettings',
      booking_leads: 'bookingLeads',
      bookingLeads: 'bookingLeads',
      booking_status_history: 'bookingStatusHistory',
      bookingStatusHistory: 'bookingStatusHistory',
      booking_notifications: 'bookingNotifications',
      bookingNotifications: 'bookingNotifications',
      booking_activity_log: 'bookingActivityLog',
      bookingActivityLog: 'bookingActivityLog',
      blogs: 'blogs',
      blog_categories: 'blogCategories',
      blogCategories: 'blogCategories',
      blog_tags: 'blogTags',
      blogTags: 'blogTags',
      blog_tag_map: 'blogTagMaps',
      blogTagMaps: 'blogTagMaps',
      blog_authors: 'blogAuthors',
      blogAuthors: 'blogAuthors',
      blog_images: 'blogImages',
      blogImages: 'blogImages',
      blog_related_links: 'blogRelatedLinks',
      blogRelatedLinks: 'blogRelatedLinks',
      blog_faqs: 'blogFaqs',
      blogFaqs: 'blogFaqs',
      blog_versions: 'blogVersions',
      blogVersions: 'blogVersions',
      blog_views: 'blogViews',
      blogViews: 'blogViews',
      blog_likes: 'blogLikes',
      blogLikes: 'blogLikes',
      blog_bookmarks: 'blogBookmarks',
      blogBookmarks: 'blogBookmarks',
      blog_shares: 'blogShares',
      blogShares: 'blogShares',
      blog_comments: 'blogComments',
      blogComments: 'blogComments',
      blog_seo: 'blogSeos',
      blogSeos: 'blogSeos',
      blog_schedule: 'blogSchedules',
      blogSchedules: 'blogSchedules',
      blog_activity_logs: 'blogActivityLogs',
      blogActivityLogs: 'blogActivityLogs'
    };

    let targetKey = keyMap[col];
    if (!targetKey) {
      const dynamicMap: Record<string, keyof Schema> = {
        dashboard_configurations: 'dashboardConfigurations',
        dashboardConfigurations: 'dashboardConfigurations',
        menu_configurations: 'menuConfigurations',
        menuConfigurations: 'menuConfigurations',
        widget_configurations: 'widgetConfigurations',
        widgetConfigurations: 'widgetConfigurations',
        form_templates: 'formTemplates',
        formTemplates: 'formTemplates',
        form_fields: 'formFields',
        formFields: 'formFields',
        field_options: 'fieldOptions',
        fieldOptions: 'fieldOptions',
        table_configurations: 'tableConfigurations',
        tableConfigurations: 'tableConfigurations',
        notification_preferences: 'notificationPreferences',
        notificationPreferences: 'notificationPreferences',
        notification_rules: 'notificationRules',
        notificationRules: 'notificationRules',
        feature_flags: 'featureFlags',
        featureFlags: 'featureFlags',
        workflow_definitions: 'workflowDefinitions',
        workflowDefinitions: 'workflowDefinitions',
        workflow_steps: 'workflowSteps',
        workflowSteps: 'workflowSteps',
        booking_payments: 'bookingPayments',
        bookingPayments: 'bookingPayments',
        booking_documents: 'bookingDocuments',
        bookingDocuments: 'bookingDocuments',
        booking_reviews: 'bookingReviews',
        bookingReviews: 'bookingReviews',
        booking_notes: 'bookingNotes',
        bookingNotes: 'bookingNotes',
        booking_reminders: 'bookingReminders',
        bookingReminders: 'bookingReminders',
        brand_settings: 'brandSettings',
        brandSettings: 'brandSettings',
        homepage_settings: 'homepageSettings',
        homepageSettings: 'homepageSettings',
        hero_settings: 'heroSettings',
        heroSettings: 'heroSettings',
        business_rules: 'businessRules',
        businessRules: 'businessRules',
        permission_roles: 'permissionRoles',
        permissionRoles: 'permissionRoles',
        permission_mappings: 'permissionMappings',
        permissionMappings: 'permissionMappings',
        system_logs: 'systemLogs',
        systemLogs: 'systemLogs'
      };
      targetKey = dynamicMap[col];
    }
    if (!targetKey) return false;

    const arr = this.data[targetKey] as any[];
    const idx = arr.findIndex(item => item.id === id);
    if (idx === -1) return false;

    const mergedRecord = { ...arr[idx], ...updatedRecord, id };

    // Push to Firestore first to assert constraints and validate
    const fsCol = 
      col === 'tripLeads' ? 'trip_leads' : 
      col === 'carLeads' ? 'car_leads' : 
      col === 'userRoles' ? 'user_roles' : 
      col === 'claimRequests' ? 'claim_requests' : 
      col === 'ownershipHistory' ? 'ownership_history' : 
      col === 'pendingUpdates' ? 'pending_updates' : 
      col === 'siteSettings' ? 'site_settings' : 
      col === 'bookingLeads' ? 'booking_leads' : 
      col === 'bookingStatusHistory' ? 'booking_status_history' : 
      col === 'bookingNotifications' ? 'booking_notifications' : 
      col === 'bookingActivityLog' ? 'booking_activity_log' : col;
    try {
      await syncDoc(fsCol, id, mergedRecord);
    } catch (errSync: any) {
      console.warn(`[Firestore Sync Warning] Failed to update doc ${id} in collection ${fsCol} to Firestore (local save will proceed):`, errSync.message || errSync);
    }

    // Commit changes locally
    arr[idx] = mergedRecord;
    this.save();

    // Trigger on-the-fly background geocoding & spatial calculations for location masters
    if (['destinations', 'attractions', 'homestays', 'hubs'].includes(col)) {
      import('./locationIntelligence').then(({ triggerBackgroundGeocodingAndSpatial }) => {
        triggerBackgroundGeocodingAndSpatial(col, id).catch(err => {
          console.error('[On-the-fly GPS Hook Error]', err);
        });
      });
    }

    if (['hubs', 'routes'].includes(col)) {
      this.invalidateRouteGraph();
    }

    return true;
  }

  public async deleteRecord(col: string, id: string): Promise<boolean> {
    const keyMap: Record<string, keyof Schema> = {
      booking_reviews: 'bookingReviews',
      bookingReviews: 'bookingReviews',
      hubs: 'hubs',
      routes: 'routes',
      destinations: 'destinations',
      attractions: 'attractions',
      homestays: 'homestays',
      room_categories: 'roomCategories',
      room_images: 'roomImages',
      homestay_gallery: 'homestayGallery',
      homestay_reviews: 'homestayReviews',
      geospatial_relationships: 'geospatial_relationships',
      images: 'images',
      contributions: 'contributions',
      trip_leads: 'tripLeads',
      car_leads: 'carLeads',
      tripLeads: 'tripLeads',
      carLeads: 'carLeads',
      drivers: 'drivers',
      user_roles: 'userRoles',
      userRoles: 'userRoles',
      notifications: 'appNotifications',
      appNotifications: 'appNotifications',
      claim_requests: 'claimRequests',
      claimRequests: 'claimRequests',
      inquiries: 'inquiries',
      ownership_history: 'ownershipHistory',
      ownershipHistory: 'ownershipHistory',
      pending_updates: 'pendingUpdates',
      pendingUpdates: 'pendingUpdates',
      site_settings: 'siteSettings',
      siteSettings: 'siteSettings',
      booking_leads: 'bookingLeads',
      bookingLeads: 'bookingLeads',
      booking_status_history: 'bookingStatusHistory',
      bookingStatusHistory: 'bookingStatusHistory',
      booking_notifications: 'bookingNotifications',
      bookingNotifications: 'bookingNotifications',
      booking_activity_log: 'bookingActivityLog',
      bookingActivityLog: 'bookingActivityLog',
      blogs: 'blogs',
      blog_categories: 'blogCategories',
      blogCategories: 'blogCategories',
      blog_tags: 'blogTags',
      blogTags: 'blogTags',
      blog_tag_map: 'blogTagMaps',
      blogTagMaps: 'blogTagMaps',
      blog_authors: 'blogAuthors',
      blogAuthors: 'blogAuthors',
      blog_images: 'blogImages',
      blogImages: 'blogImages',
      blog_related_links: 'blogRelatedLinks',
      blogRelatedLinks: 'blogRelatedLinks',
      blog_faqs: 'blogFaqs',
      blogFaqs: 'blogFaqs',
      blog_versions: 'blogVersions',
      blogVersions: 'blogVersions',
      blog_views: 'blogViews',
      blogViews: 'blogViews',
      blog_likes: 'blogLikes',
      blogLikes: 'blogLikes',
      blog_bookmarks: 'blogBookmarks',
      blogBookmarks: 'blogBookmarks',
      blog_shares: 'blogShares',
      blogShares: 'blogShares',
      blog_comments: 'blogComments',
      blogComments: 'blogComments',
      blog_seo: 'blogSeos',
      blogSeos: 'blogSeos',
      blog_schedule: 'blogSchedules',
      blogSchedules: 'blogSchedules',
      blog_activity_logs: 'blogActivityLogs',
      blogActivityLogs: 'blogActivityLogs'
    };

    let targetKey = keyMap[col];
    if (!targetKey) {
      const dynamicMap: Record<string, keyof Schema> = {
        dashboard_configurations: 'dashboardConfigurations',
        dashboardConfigurations: 'dashboardConfigurations',
        menu_configurations: 'menuConfigurations',
        menuConfigurations: 'menuConfigurations',
        widget_configurations: 'widgetConfigurations',
        widgetConfigurations: 'widgetConfigurations',
        form_templates: 'formTemplates',
        formTemplates: 'formTemplates',
        form_fields: 'formFields',
        formFields: 'formFields',
        field_options: 'fieldOptions',
        fieldOptions: 'fieldOptions',
        table_configurations: 'tableConfigurations',
        tableConfigurations: 'tableConfigurations',
        notification_preferences: 'notificationPreferences',
        notificationPreferences: 'notificationPreferences',
        notification_rules: 'notificationRules',
        notificationRules: 'notificationRules',
        feature_flags: 'featureFlags',
        featureFlags: 'featureFlags',
        workflow_definitions: 'workflowDefinitions',
        workflowDefinitions: 'workflowDefinitions',
        workflow_steps: 'workflowSteps',
        workflowSteps: 'workflowSteps',
        booking_payments: 'bookingPayments',
        bookingPayments: 'bookingPayments',
        booking_documents: 'bookingDocuments',
        bookingDocuments: 'bookingDocuments',
        booking_reviews: 'bookingReviews',
        bookingReviews: 'bookingReviews',
        booking_notes: 'bookingNotes',
        bookingNotes: 'bookingNotes',
        booking_reminders: 'bookingReminders',
        bookingReminders: 'bookingReminders',
        brand_settings: 'brandSettings',
        brandSettings: 'brandSettings',
        homepage_settings: 'homepageSettings',
        homepageSettings: 'homepageSettings',
        hero_settings: 'heroSettings',
        heroSettings: 'heroSettings',
        business_rules: 'businessRules',
        businessRules: 'businessRules',
        permission_roles: 'permissionRoles',
        permissionRoles: 'permissionRoles',
        permission_mappings: 'permissionMappings',
        permissionMappings: 'permissionMappings',
        system_logs: 'systemLogs',
        systemLogs: 'systemLogs'
      };
      targetKey = dynamicMap[col];
    }
    if (!targetKey) return false;

    const arr = this.data[targetKey] as any[];
    const beforeLen = arr.length;
    const recordToDelete = arr.find(item => item.id === id);
    if (!recordToDelete) return false;

    // Delete from Firestore first
    const fsCol = 
      col === 'tripLeads' ? 'trip_leads' : 
      col === 'carLeads' ? 'car_leads' : 
      col === 'userRoles' ? 'user_roles' : 
      col === 'claimRequests' ? 'claim_requests' : 
      col === 'ownershipHistory' ? 'ownership_history' : 
      col === 'pendingUpdates' ? 'pending_updates' : 
      col === 'siteSettings' ? 'site_settings' : 
      col === 'bookingLeads' ? 'booking_leads' : 
      col === 'bookingStatusHistory' ? 'booking_status_history' : 
      col === 'bookingNotifications' ? 'booking_notifications' : 
      col === 'bookingActivityLog' ? 'booking_activity_log' : col;
    try {
      await deleteDocInFirestore(fsCol, id);
    } catch (errSync: any) {
      console.warn(`[Firestore Sync Warning] Failed to delete doc ${id} in collection ${fsCol} from Firestore (local deletion will proceed):`, errSync.message || errSync);
    }

    // Apply deletion locally
    this.data[targetKey] = arr.filter(item => item.id !== id) as any;
    
    if (['hubs', 'routes'].includes(col)) {
      this.invalidateRouteGraph();
    }

    this.save();
    return true;
  }

  /**
   * GRAPH DATABASE PATHFINDING (BFS / Dijkstra-Style Multi-Hop Graph Traversal)
   * Find routes from one hub to another.
   * If a direct route exists, we can return it.
   * If no direct route exists, we find multi-hop connections!
   */
  public searchRoutes(fromHubId: string, toHubId: string): RouteSearchResult[] {
    if (!this.routeGraph) {
      const hubsMap = new Map<string, Hub>();
      this.data.hubs.forEach(h => {
        if (h && h.id) {
          hubsMap.set(h.id.toLowerCase().trim(), h);
        }
      });

      const adj = new Map<string, Route[]>();
      this.data.routes.forEach(r => {
        if (r && r.fromHubId && r.toHubId) {
          const rf = r.fromHubId.toLowerCase().trim();
          const rt = r.toHubId.toLowerCase().trim();

          if (!adj.has(rf)) adj.set(rf, []);
          if (!adj.has(rt)) adj.set(rt, []);

          adj.get(rf)!.push(r);
          
          // Reversed connection
          const revRoute: Route = {
            ...r,
            fromHubId: r.toHubId,
            toHubId: r.fromHubId,
            path: r.path ? [...r.path].reverse() : []
          };
          adj.get(rt)!.push(revRoute);
        }
      });

      this.routeGraph = { adj, hubsMap };
    }

    const { adj, hubsMap } = this.routeGraph;
    const results: RouteSearchResult[] = [];

    const fromHub = hubsMap.get(fromHubId.toLowerCase().trim());
    const toHub = hubsMap.get(toHubId.toLowerCase().trim());

    if (!fromHub || !toHub) return [];

    const fIdNormalized = fromHub.id.toLowerCase().trim();
    const tIdNormalized = toHub.id.toLowerCase().trim();

    // Find direct routes (both primary direction and reversed since mountain routes can be traveled both ways)
    const directRoutes = this.data.routes.filter(r => {
      if (!r || !r.fromHubId || !r.toHubId) return false;
      const rf = r.fromHubId.toLowerCase().trim();
      const rt = r.toHubId.toLowerCase().trim();
      return (rf === fIdNormalized && rt === tIdNormalized) ||
             (rf === tIdNormalized && rt === fIdNormalized);
    });

    directRoutes.forEach(r => {
      const rf = r.fromHubId.toLowerCase().trim();
      const rt = r.toHubId.toLowerCase().trim();
      // If of reversed direction, let's adapt it matching our search direction
      if (rf === tIdNormalized && rt === fIdNormalized) {
        results.push({
          route: {
            ...r,
            fromHubId: fromHub.id,
            toHubId: toHub.id,
            path: r.path ? [...r.path].reverse() : [] // reverse visual order of path stops
          },
          fromHub,
          toHub
        });
      } else {
        results.push({
          route: {
            ...r,
            fromHubId: fromHub.id,
            toHubId: toHub.id
          },
          fromHub,
          toHub
        });
      }
    });

    // Queue for BFS: holds [currentHubIdNormalized, pathOfRoutesBuiltSoFar]
    const queue: [string, Route[]][] = [];
    
    // Seed BFS from start hub
    const startRoutes = adj.get(fIdNormalized) || [];
    startRoutes.forEach(r => {
      const rt = r.toHubId.toLowerCase().trim();
      queue.push([rt, [r]]);
    });

    const indirectPathsFound: Route[][] = [];

    // Strict Safeguards and Optimization for Graph Traversal
    const MAX_HOPS = 18; // Complete coverage for longest shortest path diameter of 18
    const MAX_VISITS_PER_NODE = 1; // Standard single-visit BFS traversal bounds iterations/memory to O(V+E)
    const MAX_PATHS = 8; // Limit total alternative paths returned for UI and resource conservation

    // Track the number of times each node has been expanded (popped from queue and processing neighbors)
    const expansionCount = new Map<string, number>();

    while (queue.length > 0 && indirectPathsFound.length < MAX_PATHS) {
      const [curr, pathRoutes] = queue.shift()!;

      // Limit hops
      if (pathRoutes.length > MAX_HOPS) continue;

      if (curr === tIdNormalized) {
        if (pathRoutes.length > 1) {
          indirectPathsFound.push(pathRoutes);
        }
        continue;
      }

      // Limit expansions per node to avoid exponential states and queue bloating
      const expansions = expansionCount.get(curr) || 0;
      if (expansions >= MAX_VISITS_PER_NODE) continue;
      
      expansionCount.set(curr, expansions + 1);

      const neighbors = adj.get(curr) || [];
      for (const r of neighbors) {
        const nextHub = r.toHubId.toLowerCase().trim();

        // 1. Cycle prevention within current path search
        const visitedInCurrentPath = pathRoutes.some(pr => pr.fromHubId.toLowerCase().trim() === nextHub) || (curr === nextHub);
        if (visitedInCurrentPath) continue;

        queue.push([nextHub, [...pathRoutes, r]]);
      }
    }

    // Now format standard multi-hop indirect route records and add to our results
    indirectPathsFound.forEach(p => {
      // Sum up minimum / maximum fares and times over the individual hops
      const combinedPath: string[] = [fromHub.name];
      let totalFareMin = 0;
      let totalFareMax = 0;
      let totalTimeMin = 0;
      let totalTimeMax = 0;
      let allVerified = true;

      const hops = p.map(route => {
        const fh = hubsMap.get(route.fromHubId.toLowerCase().trim())!;
        const th = hubsMap.get(route.toHubId.toLowerCase().trim())!;
        totalFareMin += route.fareMin;
        totalFareMax += route.fareMax;
        totalTimeMin += route.timeMin;
        totalTimeMax += route.timeMax;
        if (!route.verified) allVerified = false;

        // Add intermediate stops to the path representation
        // Skip adding the origin node's name to avoid duplication across hops
        const cleanStopsInRoute = route.path ? route.path.slice(1) : [];
        combinedPath.push(...cleanStopsInRoute);

        return {
          fromHub: fh,
          toHub: th,
          route
        };
      });

      const virtualMultiHopRoute: Route = {
        id: `dynamic-hop-${p.map(r => r.id).join('-')}`,
        fromHubId: fromHub.id,
        toHubId: toHub.id,
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
        route: virtualMultiHopRoute,
        fromHub,
        toHub,
        hops
      });
    });

    // If no routes are found or as a premium direct choice, we append/fall back to a calculated Reserved Car option!
    // Since mountains may not have shared shuttle service for all pairs of the 1900+ villages, a Reserved Car is the ultimate fallback option.
    const hasReservedAlready = results.some(r => r.route.type === 'Reserved Car');
    if (fromHub && toHub && fromHub.id !== toHub.id && !hasReservedAlready) {
      const coordsA = getHubCoordinates(fromHub, this.data.destinations || []);
      const coordsB = getHubCoordinates(toHub, this.data.destinations || []);
      
      let distanceKm = 30; // sensible default
      if (coordsA && coordsB) {
        distanceKm = getDistanceInKm(coordsA.latitude, coordsA.longitude, coordsB.latitude, coordsB.longitude);
      }
      
      if (distanceKm > 0) {
        // Mountain driving buffer (actual winding road distance is ~1.4x of direct line)
        const drivingDistance = Math.round(distanceKm * 1.4 * 10) / 10;
        
        // Calculate standard mountain car hire rates (approx Rs. 26 - Rs. 38 per km, min charge Rs. 1400)
        const fareMin = Math.round(Math.max(1400, drivingDistance * 26));
        const fareMax = Math.round(Math.max(1800, drivingDistance * 34));
        
        // Duration (speeds in mountain curves average 22 - 28 km/h, i.e., 2.2 - 2.8 mins/km)
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

  public async wipeAll() {
    const collectionsToWipe = ['hubs', 'routes', 'destinations', 'attractions', 'homestays', 'images', 'contributions', 'trip_leads', 'car_leads', 'drivers'];
    if (firestoreDb) {
      for (const col of collectionsToWipe) {
        try {
          const snap = await getDocs(collection(firestoreDb, col));
          for (const docRef of snap.docs) {
            await deleteDocInFirestore(col, docRef.id);
          }
        } catch (e) {
          console.error(`Failed to wipe Firestore collection ${col}:`, e);
        }
      }
    }
    
    this.data = {
      hubs: [],
      routes: [],
      destinations: [],
      attractions: [],
      homestays: [],
      images: [],
      contributions: [],
      tripLeads: [],
      carLeads: [],
      drivers: [],
      userRoles: [],
      users: [],
      roles: [],
      permissions: [],
      rolePermissions: [],
      userPermissions: [],
      auditLogs: [],
      photoContributions: [],
      notifications: [],
      appNotifications: []
    };
    this.invalidateRouteGraph();
    this.save();
  }
}

export const dbStore = new GraphDatabase();
