export interface Hub {
  id: string;
  name: string;
  slug?: string;
  type: 'main_hub' | 'sightseeing_hub' | 'sub_hub';
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  country?: string;
}

export interface Route {
  id: string;
  slug?: string;
  fromHubId: string;
  toHubId: string;
  path: string[]; // e.g. ["NJP", "Kalimpong", "Pedong", "Rishop"]
  type: 'Direct' | 'Indirect' | 'Reserved' | 'Reserved Car';
  fareMin: number;
  fareMax: number;
  timeMin: number; // in minutes
  timeMax: number; // in minutes
  verified: boolean;
  distance?: number; // in kilometers
  lastUpdated: string;
}

export interface Destination {
  id: string; // matches Slug or ID
  name: string;
  slug?: string;
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
  nearbyAttractions?: { id: string; name: string; distance: number; slug?: string }[];
  nearbyHomestays?: { id: string; name: string; distance: number; slug?: string }[];
  nearbyDestinations?: { id: string; name: string; distance: number; image?: string; tourismType?: string; slug?: string }[];
  nearestTaxiStand?: string;
}

export interface Attraction {
  id: string;
  name: string;
  slug?: string;
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
  slug?: string;
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
  experiences?: string[];
  collections?: string[];
  seasons?: string[];
  specials?: string[];
  isVerified?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  tagline?: string;
  roomTypes?: string[];
  meals?: string[];
  videoUrl?: string;
  isActive?: boolean;

  // Guest Policies
  unmarriedCouplesAllowed?: boolean;
  localIdsAccepted?: boolean;
  foreignGuestsAllowed?: boolean;
  minCheckInAge?: number;
  bachelorGroupsAllowed?: boolean;
  familyFriendly?: boolean;
  childrenAllowed?: boolean;
  seniorCitizenFriendly?: boolean;
  soloFemaleFriendly?: boolean;
  petPolicy?: string;

  // Property Rules
  checkInTime?: string;
  checkOutTime?: string;
  earlyCheckIn?: string;
  lateCheckOut?: string;
  cancellationPolicy?: string;
  advancePayment?: string;
  paymentMethods?: string[];
  gstInvoice?: boolean;
  extraBedPolicy?: string;
  driverAccommodation?: string;
  driverMeals?: string;
  visitorPolicy?: string;
  quietHours?: string;

  // Food & Dining
  vegOnly?: boolean;
  nonVegAvailable?: boolean;
  jainFoodAvailable?: boolean;
  veganFoodAvailable?: boolean;
  outsideFoodAllowed?: boolean;
  selfCooking?: boolean;
  kitchenAccess?: boolean;

  // Smoking & Alcohol
  smokingPolicy?: string;
  alcoholPolicy?: string;
  partiesAllowed?: boolean;
  loudMusic?: boolean;
  bbqAvailable?: boolean;
  bonfireAvailable?: boolean;

  // Parking & Transport
  carParking?: boolean;
  bikeParking?: boolean;
  evCharging?: boolean;
  taxiReachesProperty?: boolean;
  driverParking?: boolean;

  // Connectivity
  wifi?: boolean;
  wifiSpeed?: string;
  mobileNetworks?: string[];
  networkStrength?: string;

  // Electricity & Water
  electricity24x7?: boolean;
  powerBackup?: boolean;
  generator?: boolean;
  solar?: boolean;
  hotWater?: boolean;
  waterSupply?: string;

  // Safety
  cctv?: boolean;
  fireExtinguisher?: boolean;
  firstAidKit?: boolean;
  caretaker?: boolean;
  emergencyContact?: string;

  // Accessibility
  wheelchairAccessible?: boolean;
  groundFloorRooms?: boolean;
  lift?: boolean;
  suitableForSeniors?: boolean;
  suitableForChildren?: boolean;

  // Photography
  droneAllowed?: boolean;
  commercialPhotography?: boolean;
  preWeddingShoot?: boolean;

  // Mountain Information
  roadCondition?: string;
  roadType?: string;
  walkingDistanceParking?: number;
  steepWalkRequired?: boolean;
  bikeFriendly?: boolean;
  suitableForSedan?: boolean;
  snowAccessible?: boolean;
  monsoonAccessible?: boolean;

  // Scenic Information
  kanchenjungaView?: boolean;
  sunriseView?: boolean;
  sunsetView?: boolean;
  riverView?: boolean;
  forestView?: boolean;
  teaGardenView?: boolean;
  birdWatching?: boolean;
  stargazing?: boolean;

  // Languages Spoken
  langEnglish?: boolean;
  langHindi?: boolean;
  langBengali?: boolean;
  langNepali?: boolean;
  langOthers?: string;

  // Special Information
  thingsGuestsShouldKnow?: string;
}

export interface RoomCategory {
  id: string; // matches room_category_id
  homestayId: string; // matches homestay_id
  room_name: string;
  description: string;
  price: number;
  room_size: string;
  bed_type: string;
  maximum_guests: number;
  bathroom: 'Attached' | 'Shared' | string;
  balcony: 'Private' | 'Shared' | 'No Balcony' | string;
  view_type: string;
  breakfast_included: boolean;
  extra_bed_price: number;
  number_of_rooms_available: number;
  room_amenities: string[];
  status: 'Active' | 'Inactive' | string;
}

export interface RoomImage {
  id: string; // matches room_image_id
  roomCategoryId: string; // matches room_category_id
  image_url: string;
  display_order: number;
}

export interface HomestayGallery {
  id: string; // matches gallery_id
  homestayId: string; // matches homestay_id
  image_url: string;
  display_order: number;
}

export interface HomestayReview {
  id: string;
  homestayId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  ratingCleanliness?: number;
  ratingLocation?: number;
  ratingService?: number;
  ratingFood?: number;
  title: string;
  content: string;
  visitDate: string;
  recommends: boolean;
  travelerPhotos?: string[];
  isVerified?: boolean;
  createdAt: string;
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
  entityType?: 'destination' | 'attraction' | 'homestay' | 'route' | 'website' | 'weather' | 'seasonal' | 'ai-generated' | 'avatar' | 'community';
  entityId?: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  caption: string;
  altText: string;
  userId?: string | null;
  rejectionReason?: string | null;
  
  // Storage metadata
  bucketId?: string;
  storagePath?: string;
  fileSize?: number;
  format?: string;
  width?: number;
  height?: number;
  aspectRatio?: string | number;
  aiGenerated?: boolean;
  assetCategory?: string;
  
  // Responsive / processed URLs
  thumbnailUrl?: string;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  heroUrl?: string;
  
  // Video fields
  isVideo?: boolean;
  posterUrl?: string;
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
  uid?: string;
  email: string;
  name: string;
  displayName?: string;
  photoURL?: string | null;
  bio?: string | null;
  theme?: string | null;
  themeMode?: 'light' | 'dark' | null;
  passwordHash: string; // Hashed password placeholder
  role: 'super_admin' | 'admin' | 'moderator' | 'partner' | 'traveler' | 'contributor' | 'taxi_operator'; // legacy single role compatibility
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
  taxiOperatorStatus?: 'draft' | 'submitted' | 'pending' | 'verified' | 'rejected' | 'suspended';
  taxiOperatorDetails?: {
    businessName: string;
    ownerName: string;
    mobileNumber: string;
    emailAddress: string;
    businessAddress: string;
    state: string;
    district: string;
    primaryTaxiStand: string;
    gstNumber?: string;
    website?: string;
    yearsInBusiness?: string;
    businessDescription: string;
    documents?: {
      businessRegistration?: string;
      tradeLicense?: string;
      taxiPermit?: string;
      ownerIdProof?: string;
      addressProof?: string;
      profilePhoto?: string;
    };
    submittedAt?: string;
    adminNotes?: string;
    rejectionReason?: string;
    serviceCoverage?: any[];
    serviceCoverageUpdatedAt?: string;
    serviceCoverageUpdatedBy?: string;
  };
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
  attractionId?: string | null;
  caption?: string | null;
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

export interface BookingReview {
  id: string;
  bookingId: string;
  travellerId: string;
  travellerName: string;
  operatorId: string;
  operatorName: string;
  driverName?: string;
  route?: string;
  rating: number;
  title?: string;
  comment: string;
  wouldRecommend: boolean;
  tripExperience: number;
  vehicleCleanliness: number;
  driverBehaviour: number;
  punctuality: number;
  valueForMoney: number;
  photos?: string[];
  status: 'active' | 'hidden';
  reported: boolean;
  reportReason?: 'Spam' | 'Abusive Language' | 'False Information' | 'Other';
  reportComment?: string;
  operatorReply?: string;
  operatorReplyCreatedAt?: string;
  operatorReplyUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  is_active: boolean;
  site_name: string;
  desktop_logo_url: string;
  mobile_logo_url: string;
  footer_logo_url: string;
  white_logo_url: string;
  dark_logo_url: string;
  favicon_url: string;
  app_icon_url: string;
  apple_touch_icon_url: string;
  android_pwa_icon_url: string;
  hero_video_url: string;
  hero_image_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  heading_font: string;
  body_font: string;
  button_font: string;
  default_language: string;
  tagline: string;
  footer_copyright: string;
  contact_email: string;
  support_email: string;
  social_links: { facebook?: string; twitter?: string; instagram?: string; youtube?: string; linkedin?: string };
  updated_at: string;
  updated_by: string;
  status: 'draft' | 'published';
}

export type LeadType = 'homestay' | 'taxi' | 'planner' | 'guide' | 'activity' | 'tour';
export type LeadStatus = 
  | 'new' 
  | 'accepted' 
  | 'rejected' 
  | 'need_more_info' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'expired' 
  | 'payment_pending' 
  | 'payment_verified' 
  | 'checked_in' 
  | 'pending' 
  | 'trip_info_shared'
  | 'draft'
  | 'reserved'
  | 'awaiting_payment'
  | 'in_progress'
  | 'refund_pending'
  | 'refunded'
  | 'no_show';

export interface PricingSnapshot {
  baseRate: number;
  seasonalAdjustment: number;
  weekendAdjustment: number;
  holidayAdjustment: number;
  taxes: number;
  fees: number;
  discounts: number;
  grandTotal: number;
  currency: string;
}

export interface BookingLead {
  id: string;
  customerName: string;
  customerMobile: string; // OTP verified placeholder in UI
  customerEmail?: string;
  leadType: LeadType;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  
  // Details depending on leadType
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests: number;
  numberOfRooms?: number;
  pickupLocation?: string;
  dropLocation?: string;
  specialRequest?: string;
  
  // Associated entities
  homestayId?: string;
  homestayName?: string;
  cabDriverId?: string;
  cabDriverName?: string;
  serviceId?: string;
  serviceName?: string;
  
  // Universal Inventory connection
  inventoryItemId?: string;
  inventoryItemName?: string;
  quantityBooked?: number;
  
  // Assignment
  assignedPartnerId?: string | null;
  assignedPartnerName?: string;
  
  // Extra fields for booking engine
  bookingAmount?: number;
  currency?: string;
  notes?: string;
  
  // Pricing Snapshot (will never change once booking is locked)
  pricingSnapshot?: PricingSnapshot;
  
  // Flags & tracking
  contactRevealed: boolean;
  reminderSentCount: number;
  lastReminderSentAt?: string;
  expiredAt?: string;
  reservationExpiresAt?: string; // Countdown timer timestamp
  tripInformationHistory?: any[];
}

export interface BookingStatusHistory {
  id: string;
  leadId: string;
  oldStatus: LeadStatus | null;
  newStatus: LeadStatus;
  changedBy: 'customer' | 'partner' | 'admin' | 'system';
  changedById?: string;
  changedByName?: string;
  note?: string;
  createdAt: string;
}

export interface BookingNotification {
  id: string;
  userId: string; // targeted user ID (traveler uid, partner uid, or 'admin')
  role: 'customer' | 'partner' | 'admin';
  leadId: string;
  title: string;
  message: string;
  category: 'booking_submitted' | 'accepted' | 'rejected' | 'need_more_info' | 'confirmed' | 'cancelled' | 'completed' | 'expired' | 'reminder' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface BookingActivityLog {
  id: string;
  leadId: string;
  activityType: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface SystemReport {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reporterMobile?: string;
  category: 'route_error' | 'homestay_issue' | 'driver_complaint' | 'inappropriate_review' | 'app_bug' | 'other';
  referenceId?: string;
  title: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  adminNotes?: string;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ==========================================
// TRAVEL GUIDE & BLOG SYSTEM TYPES
// ==========================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTagMap {
  id: string;
  blogId: string;
  tagId: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

export interface BlogImage {
  id: string;
  blogId: string;
  imageUrl: string;
  altText?: string;
  caption?: string;
}

export interface BlogRelatedLink {
  id: string;
  blogId: string;
  title: string;
  url: string;
  type: 'destination' | 'attraction' | 'village' | 'homestay' | 'taxi' | 'route' | 'external';
  referenceId?: string;
}

export interface BlogFaq {
  id: string;
  blogId: string;
  question: string;
  answer: string;
}

export interface BlogVersion {
  id: string;
  blogId: string;
  version: number;
  content: string; // Serialized string representation of the body content
  title: string;
  seoData?: any;
  updatedBy: string;
  createdAt: string;
}

export interface BlogView {
  id: string;
  blogId: string;
  viewerIp?: string;
  viewerSession?: string;
  readingTime?: number; // in seconds
  createdAt: string;
}

export interface BlogLike {
  id: string;
  blogId: string;
  userId?: string;
  createdAt: string;
}

export interface BlogBookmark {
  id: string;
  blogId: string;
  userId: string;
  createdAt: string;
}

export interface BlogShare {
  id: string;
  blogId: string;
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy_link' | 'other';
  createdAt: string;
}

export interface BlogComment {
  id: string;
  blogId: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  commentText: string;
  status: 'pending' | 'approved' | 'spam' | 'deleted';
  createdAt: string;
}

export interface BlogSeo {
  id: string;
  blogId: string;
  metaTitle: string;
  metaDescription: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  imageAltText?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  lsiKeywords?: string[];
  faqSchema?: any;
  breadcrumbSchema?: any;
  canonicalUrl?: string;
}

export interface BlogSchedule {
  id: string;
  blogId: string;
  scheduleTime: string;
  isPublished: boolean;
  recurringType?: 'none' | 'daily' | 'weekly';
}

export interface BlogActivityLog {
  id: string;
  blogId: string;
  userId: string;
  userEmail: string;
  action: 'create' | 'update' | 'status_change' | 'delete' | 'generate' | 'publish';
  details?: string;
  createdAt: string;
}

export type BlogStatus = 'Draft' | 'Under Review' | 'Approved' | 'Scheduled' | 'Published' | 'Archived';

export interface Blog {
  id: string;
  title: string;
  content: string; // Markdown or detailed content
  slug: string;
  status: BlogStatus;
  categoryId?: string;
  authorId?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  featuredImage?: string;
  readingTime?: number; // in minutes
  tags?: string[]; // list of tag names
}

export interface GeospatialRelationship {
  id: string; // e.g. `${type}_${sourceId}_${targetId}`
  type: string; // e.g. 'village_taxi_stand', 'village_destination', etc.
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  distance?: number;
  travelTime?: number;
  bearing?: string;
  confidence?: number;
  metadata?: any;
}

export interface GraphNode {
  id: string;
  name: string;
  type: 'village' | 'attraction' | 'taxi_stand' | 'homestay' | 'hotel' | 'hub' | string;
  latitude: number;
  longitude: number;
  isPublic: boolean;
  metadata: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoadSegment {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceKm: number;
  travelTimeMinutes: number;
  status: 'open' | 'closed' | 'congested' | 'under_construction' | string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'impassable' | string;
  isOneWay: boolean;
  isPublic: boolean;
  metadata: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransportService {
  id: string;
  nodeId: string;
  name: string;
  type: 'shared_taxi' | 'reserved_cab' | 'bus' | 'shuttle' | string;
  routeDescription?: string;
  schedule?: string;
  farePrice?: number;
  isPublic: boolean;
  metadata: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoadEvent {
  id: string;
  roadSegmentId?: string;
  eventType: 'landslide' | 'accident' | 'weather_delay' | 'road_closure' | 'heavy_traffic' | string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical' | string;
  status: 'active' | 'resolved' | string;
  latitude?: number;
  longitude?: number;
  startTime: string;
  endTime?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatProfile {
  id: string;
  role: 'traveler' | 'partner' | 'admin' | string;
  name: string;
  avatar: string;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  role: string;
}

export interface ChatConversation {
  id: string;
  listing_type: string; // 'homestay' | 'taxi' | 'tour' | 'guide' | 'support' etc.
  listing_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  is_archived?: boolean;
  is_resolved?: boolean;
  is_reported?: boolean;
  reported_by?: string;
  is_pinned?: boolean;
  last_message?: string;
  unread_count?: Record<string, number>; // user_id -> count
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  attachment_url?: string | null;
  attachment_type?: 'image' | 'pdf' | string | null;
  is_seen: boolean;
  created_at: string;
  delivered_at?: string | null;
  seen_at?: string | null;
  is_deleted?: boolean;
}

export interface ChatNotification {
  id: string;
  receiver_id: string;
  type: 'new_message' | 'booking_enquiry' | 'reply_received' | 'booking_confirmed' | 'booking_cancelled' | string;
  reference_id: string; // e.g. conversation_id or booking_id
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface UNENotification {
  id: string;
  userId: string; // targeted user ID, or 'all' for public
  role?: 'customer' | 'partner' | 'admin' | string;
  title: string;
  message: string;
  type: string; // e.g. 'taxi_quote_request', 'taxi_quote_received', 'homestay_booking_confirmed', 'new_message', etc.
  category: 'taxi' | 'homestay' | 'tour' | 'support' | 'messages' | 'reviews' | 'system' | 'marketing' | 'announcements';
  priority: 'critical' | 'high' | 'normal' | 'low';
  isRead: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  actionUrl?: string; // route path or action key
  actionLabel?: string; // button text
  metadata?: Record<string, any>; // context like price, bookingId, etc.
}

export interface UNENotificationPreferences {
  userId: string;
  taxi: boolean;
  homestays: boolean;
  bookings: boolean;
  messages: boolean;
  reviews: boolean;
  marketing: boolean;
  announcements: boolean;
  channels: {
    inApp: boolean;
    browserPush: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
}

// Re-export HillyTrip Reserved Taxi Marketplace types
export * from './types_taxi';












