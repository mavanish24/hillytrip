import {
  AdminUser,
  ManagedBusiness,
  BusinessClaimRequest,
  ModerationQueueItem,
  AuditLogEntry,
  FeatureFlag,
  GlobalPlatformSetting,
  PlatformOverviewAnalytics
} from '../../../types/admin';

class AdminService {
  private users: Map<string, AdminUser> = new Map();
  private businesses: Map<string, ManagedBusiness> = new Map();
  private claims: Map<string, BusinessClaimRequest> = new Map();
  private moderationQueue: Map<string, ModerationQueueItem> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private settings: Map<string, GlobalPlatformSetting> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed Users
    const seedUsers: AdminUser[] = [
      {
        id: 'usr_admin_01',
        name: 'Amrit Kumar (Super Admin)',
        email: 'admin@hillytrip.com',
        phone: '+91 98320 11223',
        role: 'admin',
        status: 'active',
        verified: true,
        district: 'Darjeeling',
        state: 'West Bengal',
        createdAt: '2025-01-10T10:00:00Z',
        lastLoginAt: new Date().toISOString(),
        totalBookingsCount: 42,
        totalSpentInr: 125000
      },
      {
        id: 'usr_driver_phurba',
        name: 'Phurba Sherpa (Taxi Owner)',
        email: 'phurba.taxis@gmail.com',
        phone: '+91 97331 44556',
        role: 'taxi_operator',
        status: 'active',
        verified: true,
        district: 'Darjeeling',
        state: 'West Bengal',
        createdAt: '2025-02-15T09:30:00Z',
        lastLoginAt: '2026-07-26T18:20:00Z',
        totalBookingsCount: 184,
        totalSpentInr: 0
      },
      {
        id: 'usr_hmst_pema',
        name: 'Pema Bhutia (Homestay Host)',
        email: 'pema.pinegrove@outlook.com',
        phone: '+91 98002 99887',
        role: 'homestay_owner',
        status: 'active',
        verified: true,
        district: 'East Sikkim',
        state: 'Sikkim',
        createdAt: '2025-03-01T14:10:00Z',
        lastLoginAt: '2026-07-27T08:00:00Z',
        totalBookingsCount: 96,
        totalSpentInr: 0
      },
      {
        id: 'usr_traveller_rahul',
        name: 'Rahul Sharma',
        email: 'rahul.s@yahoo.com',
        phone: '+91 98112 33445',
        role: 'traveller',
        status: 'active',
        verified: true,
        district: 'Kolkata',
        state: 'West Bengal',
        createdAt: '2026-04-12T11:20:00Z',
        lastLoginAt: '2026-07-25T12:00:00Z',
        totalBookingsCount: 5,
        totalSpentInr: 42000
      }
    ];

    seedUsers.forEach(u => this.users.set(u.id, u));

    // Seed Businesses
    const seedBiz: ManagedBusiness[] = [
      {
        id: 'biz_pine_grove_homestay',
        name: 'Pine Grove Eco Heritage Homestay',
        type: 'homestay',
        ownerId: 'usr_hmst_pema',
        ownerName: 'Pema Bhutia',
        district: 'Darjeeling',
        state: 'West Bengal',
        status: 'approved',
        verified: true,
        isFeatured: true,
        rating: 4.9,
        totalBookingsCount: 142,
        totalRevenueInr: 485000,
        createdAt: '2025-03-01T14:10:00Z'
      },
      {
        id: 'biz_darjeeling_hills_cabs',
        name: 'Darjeeling Hills Taxi Syndicate',
        type: 'taxi_operator',
        ownerId: 'usr_driver_phurba',
        ownerName: 'Phurba Sherpa',
        district: 'Darjeeling',
        state: 'West Bengal',
        status: 'approved',
        verified: true,
        isFeatured: true,
        rating: 4.8,
        totalBookingsCount: 310,
        totalRevenueInr: 920000,
        createdAt: '2025-02-15T09:30:00Z'
      },
      {
        id: 'biz_gangtok_flavor_bistro',
        name: 'Gangtok Organic Flavor Bistro',
        type: 'restaurant',
        ownerId: 'usr_bistro_owner',
        ownerName: 'Tenzing Norgay',
        district: 'East Sikkim',
        state: 'Sikkim',
        status: 'pending',
        verified: false,
        isFeatured: false,
        rating: 4.5,
        totalBookingsCount: 18,
        totalRevenueInr: 32000,
        createdAt: '2026-07-20T10:00:00Z'
      }
    ];

    seedBiz.forEach(b => this.businesses.set(b.id, b));

    // Seed Claims
    const seedClaims: BusinessClaimRequest[] = [
      {
        id: 'clm_101',
        businessId: 'biz_gangtok_flavor_bistro',
        businessName: 'Gangtok Organic Flavor Bistro',
        claimantName: 'Tenzing Norgay',
        claimantEmail: 'tenzing.gangtok@gmail.com',
        claimantPhone: '+91 97330 11223',
        documentType: 'trade_license',
        documentUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/default-fallback.png',
        status: 'pending',
        submittedAt: '2026-07-21T09:00:00Z',
        notes: 'Submitted Gangtok Municipal Corporation Trade License copy.'
      }
    ];

    seedClaims.forEach(c => this.claims.set(c.id, c));

    // Seed Moderation Queue
    const seedMod: ModerationQueueItem[] = [
      {
        id: 'mod_201',
        targetType: 'review',
        targetId: 'rev_9921',
        contentSnippet: 'Driver demanded extra toll cash that was already included in online voucher!',
        authorName: 'Siddharth M.',
        flagReason: 'user_reported',
        status: 'pending',
        reportedCount: 3,
        createdAt: '2026-07-26T14:30:00Z'
      },
      {
        id: 'mod_202',
        targetType: 'traveler_moment',
        targetId: 'mom_5541',
        contentSnippet: 'Check out this secret shortcut trail near Tiger Hill!',
        authorName: 'Ananya Roy',
        flagReason: 'spam',
        status: 'pending',
        reportedCount: 1,
        createdAt: '2026-07-27T07:15:00Z'
      }
    ];

    seedMod.forEach(m => this.moderationQueue.set(m.id, m));

    // Seed Feature Flags
    const seedFlags: FeatureFlag[] = [
      {
        id: 'flg_upse_escrow',
        key: 'upse_escrow_settlements',
        name: 'UPSE Automated Escrow Payments',
        description: 'Auto-release driver payments upon GPS trip completion verification.',
        enabled: true,
        module: 'Payments',
        rolledOutDistricts: ['Darjeeling', 'East Sikkim'],
        updatedAt: new Date().toISOString()
      },
      {
        id: 'flg_location_graph',
        key: 'location_graph_nearby_engine',
        name: 'Spatial Graph Haversine Engine',
        description: 'Auto-bind nearby homestays and attractions within 35km radius.',
        enabled: true,
        module: 'Location',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'flg_instant_taxi_confirm',
        key: 'instant_taxi_dispatch',
        name: 'Instant Driver Dispatch Mode',
        description: 'Skip manual operator confirmation for urgent airport taxi bookings.',
        enabled: false,
        module: 'Taxi',
        updatedAt: new Date().toISOString()
      }
    ];

    seedFlags.forEach(f => this.featureFlags.set(f.key, f));

    // Seed Settings
    const seedSettings: GlobalPlatformSetting[] = [
      {
        key: 'platform_commission_pct',
        category: 'commission',
        label: 'Platform Booking Commission (%)',
        value: 12.5,
        updatedAt: new Date().toISOString()
      },
      {
        key: 'cancellation_grace_mins',
        category: 'booking',
        label: 'Free Cancellation Window (Minutes)',
        value: 60,
        updatedAt: new Date().toISOString()
      },
      {
        key: 'maintenance_mode',
        category: 'maintenance',
        label: 'Maintenance Mode Active',
        value: false,
        updatedAt: new Date().toISOString()
      }
    ];

    seedSettings.forEach(s => this.settings.set(s.key, s));

    // Initial Audit Entry
    this.logAudit({
      adminId: 'usr_admin_01',
      adminName: 'Amrit Kumar',
      adminRole: 'super_admin',
      action: 'INITIALIZE_OPERATIONS_PLATFORM',
      module: 'settings',
      details: 'HillyTrip Global Operations Control Center initialized with default parameters.'
    });
  }

  // AUDIT LOGGER
  public logAudit(log: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const entry: AuditLogEntry = {
      ...log,
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  public getAuditLogs(limit: number = 50): AuditLogEntry[] {
    return this.auditLogs.slice(0, limit);
  }

  // USER MANAGEMENT
  public getUsers(role?: string, status?: string, search?: string): AdminUser[] {
    let list = Array.from(this.users.values());
    if (role) list = list.filter(u => u.role === role);
    if (status) list = list.filter(u => u.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
    }
    return list;
  }

  public updateUserStatus(userId: string, status: AdminUser['status'], adminName: string): AdminUser | null {
    const user = this.users.get(userId);
    if (!user) return null;

    const oldStatus = user.status;
    user.status = status;
    this.users.set(userId, user);

    this.logAudit({
      adminId: 'usr_admin_01',
      adminName,
      adminRole: 'super_admin',
      action: 'UPDATE_USER_STATUS',
      module: 'users',
      targetId: userId,
      details: `Changed status of ${user.name} (${user.email}) from ${oldStatus} to ${status}.`
    });

    return user;
  }

  public toggleUserVerification(userId: string, adminName: string): AdminUser | null {
    const user = this.users.get(userId);
    if (!user) return null;

    user.verified = !user.verified;
    this.users.set(userId, user);

    this.logAudit({
      adminId: 'usr_admin_01',
      adminName,
      adminRole: 'super_admin',
      action: 'TOGGLE_USER_VERIFICATION',
      module: 'users',
      targetId: userId,
      details: `User ${user.name} verification set to ${user.verified}.`
    });

    return user;
  }

  // BUSINESS MANAGEMENT
  public getBusinesses(type?: string, status?: string): ManagedBusiness[] {
    let list = Array.from(this.businesses.values());
    if (type) list = list.filter(b => b.type === type);
    if (status) list = list.filter(b => b.status === status);
    return list;
  }

  public updateBusinessStatus(bizId: string, status: ManagedBusiness['status'], adminName: string): ManagedBusiness | null {
    const biz = this.businesses.get(bizId);
    if (!biz) return null;

    const oldStatus = biz.status;
    biz.status = status;
    this.businesses.set(bizId, biz);

    this.logAudit({
      adminId: 'usr_admin_01',
      adminName,
      adminRole: 'super_admin',
      action: 'UPDATE_BUSINESS_STATUS',
      module: 'businesses',
      targetId: bizId,
      details: `Updated status of business '${biz.name}' from ${oldStatus} to ${status}.`
    });

    return biz;
  }

  // CLAIM MANAGEMENT
  public getClaims(): BusinessClaimRequest[] {
    return Array.from(this.claims.values());
  }

  public reviewClaim(claimId: string, status: BusinessClaimRequest['status'], adminName: string, notes?: string): BusinessClaimRequest | null {
    const claim = this.claims.get(claimId);
    if (!claim) return null;

    claim.status = status;
    claim.reviewedBy = adminName;
    if (notes) claim.notes = notes;
    this.claims.set(claimId, claim);

    if (status === 'approved') {
      const biz = this.businesses.get(claim.businessId);
      if (biz) {
        biz.verified = true;
        biz.status = 'approved';
        this.businesses.set(biz.id, biz);
      }
    }

    this.logAudit({
      adminId: 'usr_admin_01',
      adminName,
      adminRole: 'operations',
      action: 'REVIEW_BUSINESS_CLAIM',
      module: 'claims',
      targetId: claimId,
      details: `Reviewed business claim for ${claim.businessName}. Decision: ${status.toUpperCase()}.`
    });

    return claim;
  }

  // MODERATION QUEUE
  public getModerationQueue(): ModerationQueueItem[] {
    return Array.from(this.moderationQueue.values());
  }

  public updateModerationItem(itemId: string, status: ModerationQueueItem['status'], adminName: string): ModerationQueueItem | null {
    const item = this.moderationQueue.get(itemId);
    if (!item) return null;

    item.status = status;
    this.moderationQueue.set(itemId, item);

    this.logAudit({
      adminId: 'usr_admin_01',
      adminName,
      adminRole: 'moderator',
      action: 'MODERATE_CONTENT',
      module: 'moderation',
      targetId: itemId,
      details: `Moderated ${item.targetType} item (${item.targetId}). New status: ${status}.`
    });

    return item;
  }

  // FEATURE FLAGS & GLOBAL SETTINGS
  public getFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  public toggleFeatureFlag(key: string, enabled: boolean, adminName: string): FeatureFlag | null {
    const flag = this.featureFlags.get(key);
    if (!flag) return null;

    flag.enabled = enabled;
    flag.updatedAt = new Date().toISOString();
    this.featureFlags.set(key, flag);

    this.logAudit({
      adminId: 'usr_admin_01',
      adminName,
      adminRole: 'super_admin',
      action: 'TOGGLE_FEATURE_FLAG',
      module: 'flags',
      targetId: key,
      details: `Feature flag '${flag.name}' (${key}) set to ${enabled}.`
    });

    return flag;
  }

  public getSettings(): GlobalPlatformSetting[] {
    return Array.from(this.settings.values());
  }

  public updateSetting(key: string, value: any, adminName: string): GlobalPlatformSetting | null {
    const setting = this.settings.get(key);
    if (!setting) return null;

    setting.value = value;
    setting.updatedAt = new Date().toISOString();
    this.settings.set(key, setting);

    this.logAudit({
      adminId: 'usr_admin_01',
      adminName,
      adminRole: 'super_admin',
      action: 'UPDATE_PLATFORM_SETTING',
      module: 'settings',
      targetId: key,
      details: `Platform setting '${setting.label}' updated to ${JSON.stringify(value)}.`
    });

    return setting;
  }

  // OVERVIEW ANALYTICS
  public getPlatformAnalytics(): PlatformOverviewAnalytics {
    return {
      activeUsers24h: 1420,
      totalRegisteredUsers: this.users.size + 1280,
      totalBusinesses: this.businesses.size,
      totalBookings: 890,
      grossBookingValueInr: 2840000,
      netCommissionInr: 355000,
      pendingApprovalsCount: Array.from(this.businesses.values()).filter(b => b.status === 'pending').length,
      moderationQueueCount: Array.from(this.moderationQueue.values()).filter(m => m.status === 'pending').length,
      activeClaimsCount: Array.from(this.claims.values()).filter(c => c.status === 'pending').length,
      systemHealthStatus: 'healthy',
      trendingSearchQueries: [
        { query: 'Nathula Pass Cab', count: 420 },
        { query: 'Darjeeling Tea Homestay', count: 380 },
        { query: 'Gangtok Ropeway', count: 290 },
        { query: 'Pelling Skywalk Taxi', count: 210 }
      ],
      zeroResultQueries: [
        { query: 'Helicopter booking Darjeeling', count: 48 },
        { query: 'Direct bus NJP to Gurudongmar', count: 32 }
      ],
      topDestinations: [
        { name: 'Darjeeling', bookings: 380, pageViews: 14200 },
        { name: 'Gangtok', bookings: 310, pageViews: 11800 },
        { name: 'Kalimpong', bookings: 120, pageViews: 4900 },
        { name: 'Pelling', bookings: 80, pageViews: 3800 }
      ]
    };
  }
}

export const adminService = new AdminService();
