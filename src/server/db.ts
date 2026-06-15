import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, getDocFromServer, deleteDoc, onSnapshot, setLogLevel } from 'firebase/firestore';
import { Hub, Route, Destination, Attraction, Homestay, ImageItem, Contribution, TripLead, CarLead, RouteSearchResult, Driver, UserRole, User, Role, Permission, RolePermission, UserPermission, AuditLog, PhotoContribution, PhotoNotification, AppNotification, ClaimRequest, Inquiry, OwnershipHistory, PendingUpdate, DEFAULT_HOMESTAY_IMAGE } from '../types';
import { initialHubs, initialDestinations, initialAttractions, initialHomestays, initialRoutes } from '../data/initialData';

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
if (firebaseConfig) {
  try {
    const app = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (e) {
    console.error('Failed to initialize Firebase on server:', e);
  }
}

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

async function testConnection(): Promise<boolean> {
  if (!firestoreDb) return false;
  try {
    await withTimeout(
      getDocFromServer(doc(firestoreDb, 'hubs', 'connection-test-doc-id')),
      3000,
      "Firestore connection check timed out"
    );
    console.log("Firebase Firestore connection verified successfully.");
    return true;
  } catch (error) {
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
    destinations: ['id', 'name', 'description', 'tourismType', 'bestSeason', 'image', 'gallery', 'isHiddenGem', 'isFeaturedThisWeek', 'isPopularDestination', 'coverImage', 'coverPrompt', 'coverStatus', 'latitude', 'longitude', 'district', 'state', 'country', 'nearestHubId', 'distanceFromHub', 'nearbyAttractions', 'nearbyHomestays'],
    attractions: ['id', 'name', 'category', 'destinationId', 'description', 'image', 'gallery', 'isHiddenGem', 'isFeaturedThisWeek', 'isFeaturedAttraction', 'coverImage', 'coverPrompt', 'coverStatus', 'latitude', 'longitude', 'district', 'state', 'country', 'nearestDestinationId', 'distanceFromDestination', 'nearestHubId', 'distanceFromHub'],
    homestays: ['id', 'name', 'destinationId', 'priceMin', 'priceMax', 'contact', 'amenities', 'images', 'status', 'latitude', 'longitude', 'district', 'state', 'country', 'nearestDestinationId', 'distanceFromDestination', 'nearestHubId', 'distanceFromHub', 'ownerId', 'description', 'whatsappNumber', 'roomRates', 'contactInfo', 'checkInInfo', 'houseRules', 'breakfastIncluded', 'lunchAvailable', 'dinnerAvailable'],
    drivers: ['id', 'name', 'mobile', 'whatsapp', 'vehicleType', 'vehicleName', 'vehicleNumber', 'serviceAreas', 'pricingPerDay', 'createdAt', 'status', 'licenseNumber'],
    images: ['id', 'destinationId', 'attractionId', 'url', 'uploadedBy', 'uploadDate', 'status', 'caption', 'altText', 'userId', 'rejectionReason'],
    contributions: ['id', 'type', 'details', 'contributorName', 'contributorMobile', 'status', 'createdAt'],
    trip_leads: ['id', 'name', 'mobile', 'destination', 'travelDate', 'budget', 'numTravellers', 'services', 'createdAt'],
    car_leads: ['id', 'pickup', 'destination', 'travelDate', 'passengers', 'name', 'mobile', 'status', 'createdAt'],
    users: ['id', 'email', 'name', 'passwordHash', 'role', 'roles', 'status', 'emailVerified', 'customPermissions', 'createdAt', 'mobile', 'businessName', 'businessType', 'partnerLocation', 'partnerMobile', 'partnerStatus', 'partnerDocuments', 'contributorRegion', 'contributorReason', 'contributorExperience', 'contributorStatus'],
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
    pending_updates: ['id', 'homestayId', 'partnerUserId', 'updateData', 'status', 'createdAt']
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

async function syncDoc(collectionName: string, docId: string, data: any) {
  if (!firestoreDb) return;
  try {
    const cleaned = sanitizeDocumentPayload(collectionName, data);
    const docRef = doc(firestoreDb, collectionName, docId);
    await setDoc(docRef, cleaned);
  } catch (err: any) {
    console.error(`Failed to sync doc ${docId} of ${collectionName} to Firestore:`, err);
    throw new Error(formatFirestoreErrorMessage(err, 'write', `${collectionName}/${docId}`));
  }
}

async function deleteDocInFirestore(collectionName: string, docId: string) {
  if (!firestoreDb) return;
  try {
    const docRef = doc(firestoreDb, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error(`Failed to delete doc ${docId} of ${collectionName} in Firestore:`, err);
    throw new Error(formatFirestoreErrorMessage(err, 'delete', `${collectionName}/${docId}`));
  }
}

async function syncCollectionToFirestore(collectionName: string, items: any[]) {
  if (!firestoreDb) return;
  try {
    for (const item of items) {
      if (!item.id) continue;
      const cleaned = sanitizeDocumentPayload(collectionName, item);
      const docRef = doc(firestoreDb, collectionName, item.id);
      await setDoc(docRef, cleaned);
    }
    console.log(`Synced ${items.length} records of ${collectionName} to Firestore.`);
  } catch (e) {
    console.error(`Error syncing ${collectionName} to Firestore:`, e);
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
  inquiries?: Inquiry[];
  ownershipHistory?: OwnershipHistory[];
  pendingUpdates?: PendingUpdate[];
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
    inquiries: [],
    ownershipHistory: [],
    pendingUpdates: []
  };

  private routeGraph: { adj: Map<string, Route[]>; hubsMap: Map<string, Hub> } | null = null;

  public invalidateRouteGraph() {
    this.routeGraph = null;
  }

  constructor() {
    this.load();
    testConnection().then((isOk) => {
      if (isOk) {
        this.loadFromFirestore().catch(err => {
          console.error("[Firestore Sync] Error loading from Firestore:", err);
        });
      } else {
        console.log("[Firestore Sync] Connection check failed or timed out. Standard local database files used natively, preventing any startup hangs.");
      }
    }).catch(err => {
      console.error("[Firestore Sync] Exception during Firestore connection check:", err);
    });
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure lists exist
        this.data.hubs = this.data.hubs || [];
        this.data.routes = this.data.routes || [];
        this.data.destinations = this.data.destinations || [];
        this.data.attractions = this.data.attractions || [];
        // Self-healing: Clean stale or broken default homestay images on load
        let dbHomestaysChanged = false;
        this.data.homestays = (this.data.homestays || []).map(h => {
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
          console.log('[Database Healing] Automatically migrator replaced broken default homestay image URLs with working ones.');
          this.save();
        }
        this.data.images = this.data.images || [];
        this.data.contributions = this.data.contributions || [];
        this.data.tripLeads = this.data.tripLeads || [];
        this.data.carLeads = this.data.carLeads || [];
        this.data.drivers = this.data.drivers || [];
        this.data.userRoles = this.data.userRoles || [];
        this.data.users = this.data.users || [];
        this.data.roles = this.data.roles || [];
        this.data.permissions = this.data.permissions || [];
        this.data.rolePermissions = this.data.rolePermissions || [];
        this.data.userPermissions = this.data.userPermissions || [];
        this.data.auditLogs = this.data.auditLogs || [];
        this.data.photoContributions = this.data.photoContributions || [];
        this.data.notifications = this.data.notifications || [];
        this.data.appNotifications = this.data.appNotifications || [];
        this.data.claimRequests = this.data.claimRequests || [];
        this.data.inquiries = this.data.inquiries || [];
        this.data.ownershipHistory = this.data.ownershipHistory || [];
        this.data.pendingUpdates = this.data.pendingUpdates || [];

        // Protection check: Ensure mavanish24@gmail.com is always the Super Admin and active
        const superId = 'mavanish24@gmail.com';
        const sAdmin = this.data.users.find(u => u.email.trim().toLowerCase() === superId);
        if (!sAdmin) {
          this.data.users.push({
            id: superId,
            email: superId,
            name: 'Mavanish Super Admin',
            passwordHash: '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f', // sha256 for admin123
            role: 'super_admin',
            status: 'active',
            emailVerified: true,
            customPermissions: [],
            createdAt: new Date().toISOString()
          });
          this.save();
        } else {
          if (sAdmin.role !== 'super_admin' || sAdmin.status !== 'active') {
            sAdmin.role = 'super_admin';
            sAdmin.status = 'active';
            this.save();
          }
        }

        // Action check: Ensure amrkmurarka@gmail.com is always a Super Admin and active
        const adminId = 'amrkmurarka@gmail.com';
        const sAdmin2 = this.data.users.find(u => u.email.trim().toLowerCase() === adminId);
        if (!sAdmin2) {
          this.data.users.push({
            id: adminId,
            email: adminId,
            name: 'Amrkmurarka Admin',
            passwordHash: '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f', // sha256 for admin123
            role: 'super_admin',
            status: 'active',
            emailVerified: true,
            customPermissions: [],
            createdAt: new Date().toISOString()
          });
          this.save();
        } else {
          if (sAdmin2.role !== 'super_admin' || sAdmin2.status !== 'active') {
            sAdmin2.role = 'super_admin';
            sAdmin2.status = 'active';
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
    this.data = {
      hubs: initialHubs,
      routes: initialRoutes,
      destinations: initialDestinations,
      attractions: initialAttractions,
      homestays: initialHomestays,
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
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database to file:', error);
    }
  }

  public async pullAllFromFirestore() {
    if (!firestoreDb) return;
    const pullCollection = async (collectionName: string, dataKey: keyof Schema) => {
      try {
        const snap = await withTimeout(
          getDocs(collection(firestoreDb, collectionName)),
          3000,
          `Pull collection ${collectionName} timed out`
        );
        const list: any[] = [];
        const seen = new Set<string>();
        snap.forEach(docSnap => {
          const item = docSnap.data();
          if (item && item.id) {
            const normalizedId = String(item.id).toLowerCase().trim();
            if (!seen.has(normalizedId)) {
              seen.add(normalizedId);
              list.push(item);
            }
          } else {
            list.push(item);
          }
        });
        (this.data[dataKey] as any) = list;
        console.log(`[Firestore Sync] Successfully loaded ${list.length} records for ${collectionName}`);
      } catch (err) {
        console.error(`[Firestore Sync Warning] Failed to pull collection ${collectionName} from Firestore:`, err);
      }
    };

    console.log("Pulling all collections from Firestore to memory state...");
    try {
      await Promise.all([
        pullCollection('hubs', 'hubs'),
        pullCollection('routes', 'routes'),
        pullCollection('destinations', 'destinations'),
        pullCollection('attractions', 'attractions'),
        pullCollection('homestays', 'homestays'),
        pullCollection('images', 'images'),
        pullCollection('contributions', 'contributions'),
        pullCollection('trip_leads', 'tripLeads'),
        pullCollection('car_leads', 'carLeads'),
        pullCollection('drivers', 'drivers'),
        pullCollection('user_roles', 'userRoles'),
        pullCollection('users', 'users'),
        pullCollection('roles', 'roles'),
        pullCollection('permissions', 'permissions'),
        pullCollection('role_permissions', 'rolePermissions'),
        pullCollection('user_permissions', 'userPermissions'),
        pullCollection('audit_logs', 'auditLogs'),
        pullCollection('photo_contributions', 'photoContributions'),
        pullCollection('photo_notifications', 'notifications'),
        pullCollection('notifications', 'appNotifications'),
        pullCollection('claim_requests', 'claimRequests'),
        pullCollection('inquiries', 'inquiries'),
        pullCollection('ownership_history', 'ownershipHistory'),
        pullCollection('pending_updates', 'pendingUpdates')
      ]);
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
  }

  public async loadFromFirestore() {
    if (!firestoreDb) return;
    try {
      console.log("Checking for master data sync in Firestore in parallel...");
      const [destSnap, hubsSnap, routesSnap, attractionsSnap, homestaysSnap, usersSnap] = await withTimeout(
        Promise.all([
          getDocs(collection(firestoreDb, 'destinations')),
          getDocs(collection(firestoreDb, 'hubs')),
          getDocs(collection(firestoreDb, 'routes')),
          getDocs(collection(firestoreDb, 'attractions')),
          getDocs(collection(firestoreDb, 'homestays')),
          getDocs(collection(firestoreDb, 'users'))
        ]),
        4000,
        "Master data check timed out"
      );
      
      let seededAny = false;
      if (hubsSnap.empty) {
        console.log("Firestore empty of master hubs. Seeding initial hubs...");
        this.data.hubs = initialHubs;
        await syncCollectionToFirestore('hubs', this.data.hubs);
        seededAny = true;
      }
      if (destSnap.empty) {
        console.log("Firestore empty of master destinations. Seeding initial destinations...");
        this.data.destinations = initialDestinations;
        await syncCollectionToFirestore('destinations', this.data.destinations);
        seededAny = true;
      }
      if (routesSnap.empty) {
        console.log("Firestore empty of master routes. Seeding initial routes...");
        this.data.routes = initialRoutes;
        await syncCollectionToFirestore('routes', this.data.routes);
        seededAny = true;
      }
      if (attractionsSnap.empty) {
        console.log("Firestore empty of master attractions. Seeding initial attractions...");
        this.data.attractions = initialAttractions;
        await syncCollectionToFirestore('attractions', this.data.attractions);
        seededAny = true;
      }
      if (homestaysSnap.empty) {
        console.log("Firestore empty of master homestays. Seeding initial homestays...");
        this.data.homestays = initialHomestays;
        await syncCollectionToFirestore('homestays', this.data.homestays);
        seededAny = true;
      }
      if (usersSnap.empty) {
        console.log("Firestore empty of security users. Syncing initial security setups...");
        await syncCollectionToFirestore('users', this.data.users);
        await syncCollectionToFirestore('roles', this.data.roles);
        await syncCollectionToFirestore('permissions', this.data.permissions);
        await syncCollectionToFirestore('role_permissions', this.data.rolePermissions);
        await syncCollectionToFirestore('user_permissions', this.data.userPermissions || []);
        await syncCollectionToFirestore('audit_logs', this.data.auditLogs || []);
        seededAny = true;
      }

      if (seededAny) {
        this.save();
      }

      console.log("Performing startup pull to synchronize client-to-server cache...");
      await this.pullAllFromFirestore();

      // Ensure that both super-admin and amrkmurarka exist in memory and are synced to Firestore!
      let hasChange = false;
      const superId = 'mavanish24@gmail.com';
      let sAdmin = this.data.users.find(u => u.email.trim().toLowerCase() === superId);
      if (!sAdmin) {
        sAdmin = {
          id: superId,
          email: superId,
          name: 'Mavanish Super Admin',
          passwordHash: '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f', 
          role: 'super_admin',
          status: 'active',
          emailVerified: true,
          customPermissions: [],
          createdAt: new Date().toISOString()
        };
        this.data.users.push(sAdmin);
        await syncDoc('users', superId, sAdmin);
        hasChange = true;
      } else if (sAdmin.role !== 'super_admin' || sAdmin.status !== 'active' || !sAdmin.passwordHash) {
        sAdmin.role = 'super_admin';
        sAdmin.status = 'active';
        if (!sAdmin.passwordHash) {
          sAdmin.passwordHash = '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f';
        }
        await syncDoc('users', superId, sAdmin);
        hasChange = true;
      }

      const adminId = 'amrkmurarka@gmail.com';
      let sAdmin2 = this.data.users.find(u => u.email.trim().toLowerCase() === adminId);
      if (!sAdmin2) {
        sAdmin2 = {
          id: adminId,
          email: adminId,
          name: 'Amrkmurarka Admin',
          passwordHash: '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f', 
          role: 'super_admin',
          status: 'active',
          emailVerified: true,
          customPermissions: [],
          createdAt: new Date().toISOString()
        };
        this.data.users.push(sAdmin2);
        await syncDoc('users', adminId, sAdmin2);
        hasChange = true;
      } else if (sAdmin2.role !== 'super_admin' || sAdmin2.status !== 'active' || !sAdmin2.passwordHash) {
        sAdmin2.role = 'super_admin';
        sAdmin2.status = 'active';
        if (!sAdmin2.passwordHash) {
          sAdmin2.passwordHash = '240eb51823022bc13764b301c276326177fcbe84d142ab4843ed24010a30b42f';
        }
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
  public getRoutes(): Route[] { return this.data.routes; }
  public getDestinations(): Destination[] { return this.data.destinations; }
  public getAttractions(): Attraction[] { return this.data.attractions; }
  public getHomestays(): Homestay[] { return this.data.homestays; }
  public getImages(): ImageItem[] { return this.data.images; }
  public getContributions(): Contribution[] { return this.data.contributions; }
  public getTripLeads(): TripLead[] { return this.data.tripLeads; }
  public getCarLeads(): CarLead[] { return this.data.carLeads; }
  public getDrivers(): Driver[] { return this.data.drivers || []; }
  public getUserRoles(): UserRole[] { return this.data.userRoles || []; }
  
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

  public updateUsers(users: User[]) {
    // Protection Rule: Prevent Super Admin demotion/deactivation or deletion
    const superId = 'mavanish24@gmail.com';
    const hasSuper = users.some(u => u.email.trim().toLowerCase() === superId);
    if (!hasSuper) {
      // Re-insert Super Admin if missing
      const oldSuper = this.data.users.find(u => u.email.trim().toLowerCase() === superId) || {
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
      const sAdminObj = users.find(u => u.email.trim().toLowerCase() === superId);
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
        images: [details.image || DEFAULT_HOMESTAY_IMAGE]
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
      hubs: 'hubs',
      routes: 'routes',
      destinations: 'destinations',
      attractions: 'attractions',
      homestays: 'homestays',
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
      pendingUpdates: 'pendingUpdates'
    };

    const targetKey = keyMap[col];
    if (!targetKey) return false;

    // First push directly to firestore to ensure validity of rules and data constraints:
    const fsCol = (
      col === 'tripLeads' ? 'trip_leads' : 
      (col === 'carLeads' ? 'car_leads' : 
      (col === 'userRoles' ? 'user_roles' : 
      (col === 'claimRequests' ? 'claim_requests' : 
      (col === 'ownershipHistory' ? 'ownership_history' : 
      (col === 'pendingUpdates' ? 'pending_updates' : col)))))
    );
    await syncDoc(fsCol, record.id, record);

    // If writing to Firestore succeeds, safely commit locally to memory and save to hillytrip_db_store.json file
    const arr = this.data[targetKey] as any[];
    const idx = arr.findIndex(item => item.id === record.id);
    const isNew = idx === -1;
    if (idx > -1) {
      arr[idx] = record;
    } else {
      arr.push(record);
    }
    this.save();

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

  public async updateRecord(col: string, id: string, updatedRecord: any): Promise<boolean> {
    const keyMap: Record<string, keyof Schema> = {
      hubs: 'hubs',
      routes: 'routes',
      destinations: 'destinations',
      attractions: 'attractions',
      homestays: 'homestays',
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
      pendingUpdates: 'pendingUpdates'
    };

    const targetKey = keyMap[col];
    if (!targetKey) return false;

    const arr = this.data[targetKey] as any[];
    const idx = arr.findIndex(item => item.id === id);
    if (idx === -1) return false;

    const mergedRecord = { ...arr[idx], ...updatedRecord, id };

    // Push to Firestore first to assert constraints and validate
    const fsCol = (
      col === 'tripLeads' ? 'trip_leads' : 
      (col === 'carLeads' ? 'car_leads' : 
      (col === 'userRoles' ? 'user_roles' : 
      (col === 'claimRequests' ? 'claim_requests' : 
      (col === 'ownershipHistory' ? 'ownership_history' : 
      (col === 'pendingUpdates' ? 'pending_updates' : col)))))
    );
    await syncDoc(fsCol, id, mergedRecord);

    // Commit only on success
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
      hubs: 'hubs',
      routes: 'routes',
      destinations: 'destinations',
      attractions: 'attractions',
      homestays: 'homestays',
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
      pendingUpdates: 'pendingUpdates'
    };

    const targetKey = keyMap[col];
    if (!targetKey) return false;

    const arr = this.data[targetKey] as any[];
    const beforeLen = arr.length;
    const recordToDelete = arr.find(item => item.id === id);
    if (!recordToDelete) return false;

    // Delete from Firestore first
    const fsCol = (
      col === 'tripLeads' ? 'trip_leads' : 
      (col === 'carLeads' ? 'car_leads' : 
      (col === 'userRoles' ? 'user_roles' : 
      (col === 'claimRequests' ? 'claim_requests' : 
      (col === 'ownershipHistory' ? 'ownership_history' : 
      (col === 'pendingUpdates' ? 'pending_updates' : col)))))
    );
    await deleteDocInFirestore(fsCol, id);

    // Only apply locally if firestore successfully deleted the item
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
      this.data.hubs.forEach(h => hubsMap.set(h.id.toLowerCase().trim(), h));

      const adj = new Map<string, Route[]>();
      this.data.routes.forEach(r => {
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
          path: [...r.path].reverse()
        };
        adj.get(rt)!.push(revRoute);
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
            path: [...r.path].reverse() // reverse visual order of path stops
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
        const cleanStopsInRoute = route.path.slice(1);
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

    return results;
  }

  public async wipeAll() {
    const collectionsToWipe = ['hubs', 'routes', 'destinations', 'attractions', 'homestays', 'images', 'contributions', 'trip_leads', 'car_leads', 'drivers'];
    if (firestoreDb) {
      for (const col of collectionsToWipe) {
        try {
          const snap = await getDocs(collection(firestoreDb, col));
          for (const document of snap.docs) {
            await deleteDocInFirestore(col, document.id);
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
      users: [
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
        }
      ],
      roles: [
        { id: 'super_admin', name: 'Super Admin', description: 'Undeletable master credentials system admin' },
        { id: 'admin', name: 'Admin', description: 'Administrative staff with delegated sections panel access' },
        { id: 'moderator', name: 'Moderator', description: 'Limited backoffice moderator with moderation privileges' }
      ],
      permissions: [
        { id: 'manage_users', name: 'User & Admin Management', description: 'Ability to invite, view, modify, and delete admin or moderator officers' },
        { id: 'view_analytics', name: 'Audit Trail and Visitor Analytics', description: 'View system-wide visitor streams and access compliance logs' },
        { id: 'moderate_leads', name: 'Lead Moderation', description: 'Manage visitor queries, homestay requests, and partner applications' },
        { id: 'edit_schema', name: 'Edit Hub Schema', description: 'Seed or update custom destinations, routes, and geographic hubs' },
        { id: 'moderate_photos', name: 'Review Photo Contributions', description: 'Ability to review, approve, reject and view photo approvals' }
      ],
      rolePermissions: [
        { id: 'rp1', roleId: 'super_admin', permissionId: 'manage_users' },
        { id: 'rp2', roleId: 'super_admin', permissionId: 'view_analytics' },
        { id: 'rp3', roleId: 'super_admin', permissionId: 'moderate_leads' },
        { id: 'rp4', roleId: 'super_admin', permissionId: 'edit_schema' },
        { id: 'rp5', roleId: 'super_admin', permissionId: 'moderate_photos' },
        { id: 'rp6', roleId: 'admin', permissionId: 'view_analytics' },
        { id: 'rp7', roleId: 'admin', permissionId: 'moderate_leads' },
        { id: 'rp8', roleId: 'admin', permissionId: 'moderate_photos' },
        { id: 'rp9', roleId: 'moderator', permissionId: 'moderate_leads' }
      ],
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
