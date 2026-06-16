export interface Hub {
  id: string;
  name: string;
  type: 'main_hub' | 'sightseeing_hub' | 'sub_hub';
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  country?: string;
}

export interface Route {
  id: string;
  fromHubId: string;
  toHubId: string;
  path: string[]; // e.g. ["NJP", "Kalimpong", "Pedong", "Rishop"]
  type: 'Direct' | 'Indirect';
  fareMin: number;
  fareMax: number;
  timeMin: number; // in minutes
  timeMax: number; // in minutes
  verified: boolean;
  distance?: number; // in kilometers
  lastUpdated: string;
}

export interface Destination {
  id: string; // matches Slug
  name: string;
  description: string;
  tourismType: string;
  bestSeason: string;
  image: string;
  gallery: string[];
  isHiddenGem?: boolean;
  isFeaturedThisWeek?: boolean;
  isPopularDestination?: boolean;
  coverImage?: string;
  coverPrompt?: string;
  coverStatus?: 'pending' | 'generated' | 'failed' | 'manual';
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  country?: string;
  nearestHubId?: string;
  distanceFromHub?: number;
  nearbyAttractions?: { id: string; name: string; distance: number }[];
  nearbyHomestays?: { id: string; name: string; distance: number }[];
  nearbyDestinations?: { id: string; name: string; distance: number; image?: string; tourismType?: string }[];
}

export interface Attraction {
  id: string;
  name: string;
  category: 'Viewpoint' | 'Monastery' | 'Waterfall' | 'Lake' | 'Trek' | 'Village';
  destinationId: string;
  description: string;
  image: string;
  gallery: string[];
  isHiddenGem?: boolean;
  isFeaturedThisWeek?: boolean;
  isFeaturedAttraction?: boolean;
  coverImage?: string;
  coverPrompt?: string;
  coverStatus?: 'pending' | 'generated' | 'failed' | 'manual';
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  country?: string;
  nearestDestinationId?: string;
  distanceFromDestination?: number;
  nearestHubId?: string;
  distanceFromHub?: number;
}

export interface Homestay {
  id: string;
  name: string;
  destinationId: string;
  priceMin: number;
  priceMax: number;
  contact: string; // WhatsApp / Phone
  amenities: string[];
  images: string[];
  ownerId?: string | null; // claimed owner ID
  ownerName?: string;
  mobile?: string;
  whatsapp?: string;
  whatsappNumber?: string;
  address?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'active' | 'inactive' | 'fullyBooked' | 'temporarilyClosed' | string;
  createdAt?: string;
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  country?: string;
  nearestDestinationId?: string;
  distanceFromDestination?: number;
  nearestHubId?: string;
  distanceFromHub?: number;
  description?: string;
  roomRates?: string;
  contactInfo?: string;
  checkInInfo?: string;
  houseRules?: string;
  breakfastIncluded?: 'Included' | 'Not Included' | string;
  lunchAvailable?: boolean;
  dinnerAvailable?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  mobile: string;
  whatsapp: string;
  vehicleType: string;
  vehicleName: string;
  vehicleNumber: string;
  serviceAreas: string;
  pricingPerDay: number;
  licenseNumber?: string;
  createdAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface ImageItem {
  id: string;
  url: string;
  destinationId?: string | null;
  attractionId?: string | null;
  entityType?: 'destination' | 'attraction' | 'homestay';
  entityId?: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  caption: string;
  altText: string;
  userId?: string | null;
  rejectionReason?: string | null;
}

export interface Contribution {
  id: string;
  type: 'add_route' | 'correct_route' | 'report_missing_route' | 'add_attraction' | 'add_homestay' | 'upload_photo';
  details: any; // specific data structures based on type
  contributorName: string;
  contributorMobile: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface TripLead {
  id: string;
  name: string;
  mobile: string;
  destination: string;
  travelDate: string;
  budget: number;
  numTravellers: number;
  services: ('Homestay' | 'Car' | 'Full trip planning')[];
  createdAt: string;
}

export interface CarLead {
  id: string;
  pickup: string;
  destination: string;
  travelDate: string;
  passengers: number;
  name: string;
  mobile: string;
  status: string;
  createdAt: string;
}

// Result of graph pathfinding / route search
export interface RouteSearchResult {
  route: Route;
  fromHub: Hub;
  toHub: Hub;
  // If Indirect / Multi-hop:
  hops?: {
    fromHub: Hub;
    toHub: Hub;
    route: Route;
  }[];
}

export interface UserAnalyticsEvent {
  id: string;
  type: 'route_search' | 'destination_visit' | 'attraction_visit';
  name: string;
  slug?: string;
  source?: string;
  destination?: string;
  timestamp: string;
  count: number;
}

export interface UserRole {
  id: string; // This will store the email address
  email: string;
  role: 'admin' | 'moderator';
  status: 'active' | 'restricted';
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // Hashed password placeholder
  role: 'super_admin' | 'admin' | 'moderator' | 'partner' | 'traveler' | 'contributor'; // legacy single role compatibility
  roles?: string[]; // Multiple roles as part of the unified system
  status: 'active' | 'disabled';
  emailVerified: boolean;
  customPermissions: string[]; // custom combinations
  createdAt: string;
  mobile?: string;
  businessName?: string;
  businessType?: 'homestay' | 'cab' | 'guide';
  partnerLocation?: string;
  partnerMobile?: string;
  partnerStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  partnerDocuments?: string;
  contributorRegion?: string;
  contributorReason?: string;
  contributorExperience?: string;
  contributorStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
}

export interface UserPermission {
  id: string;
  userId: string;
  permissionId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  email: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface PhotoContribution {
  id: string;
  userId: string;
  travellerName: string;
  travellerEmail: string;
  destinationId: string;
  imageUrl: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  uploadedAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}

export interface PhotoNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'custom' | 'destination_added' | 'attraction_added' | 'homestay_added' | 'route_alert' | 'travel_advisory';
  status: 'draft' | 'pending' | 'published' | 'rejected';
  imageUrl?: string | null;
  destinationId?: string | null;
  attractionId?: string | null;
  homestayId?: string | null;
  routeName?: string | null;
  routeStatus?: 'Open' | 'Closed' | 'Restricted' | 'Partially Open' | null;
  createdAt: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  isPushNotification: boolean;
  priority: 'normal' | 'important' | 'urgent';
}

export interface ClaimRequest {
  id: string;
  homestayId: string;
  partnerUserId: string;
  ownerName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  message: string;
  ownershipProof?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminRemarks?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  homestayId: string;
  userName: string;
  userMobile: string;
  userEmail: string;
  travelDate: string;
  numberOfGuests: number;
  message: string;
  inquiryStatus: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: string;
}

export interface OwnershipHistory {
  id: string;
  homestayId: string;
  previousOwnerId: string | null;
  newOwnerId: string | null;
  approvedByAdminId: string;
  reason?: string;
  timestamp: string;
}

export interface PendingUpdate {
  id: string;
  homestayId: string;
  partnerUserId: string;
  updateData: Partial<Homestay>;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface PlatformReview {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userMobile?: string;
  rating: number;
  category: 'General' | 'Routes & Maps' | 'Destinations' | 'Homestays' | 'Cabs / Drivers' | 'App Experience' | 'Other';
  comment: string;
  wouldRecommend: boolean;
  status: 'Approved' | 'Pending' | 'Flagged' | 'Addressed';
  createdAt: string;
}






