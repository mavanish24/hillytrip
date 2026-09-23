import { UserRole, UserProfile } from '../../types/navigation';
import { auditService } from './AuditService';
import { getSupabase } from '../../utils/supabaseClient';

const LOCAL_STORAGE_ACTIVE_ROLE_KEY = 'hillytrip_active_user_role';
const LOCAL_STORAGE_REAL_ROLE_KEY = 'hillytrip_real_user_role';
const LOCAL_STORAGE_IMPERSONATED_USER_KEY = 'hillytrip_impersonated_user';
const LOCAL_STORAGE_REASON_KEY = 'hillytrip_role_switch_reason';

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  GUEST: {
    id: 'guest-000',
    name: 'Guest Traveller',
    role: 'GUEST'
  },
  TRAVELLER: {
    id: 'usr-trav-101',
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'TRAVELLER',
    membershipLevel: 'GOLD_VALLEY',
    verified: true
  },
  BUSINESS_OWNER: {
    id: 'usr-biz-202',
    name: 'Pemba Tsering',
    email: 'pemba.sitong@hillytrip.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'BUSINESS_OWNER',
    businessName: 'Sitong Orange Blossom Homestay',
    verified: true
  },
  HOMESTAY_OWNER: {
    id: 'usr-home-203',
    name: 'Dawa Lepcha',
    email: 'dawa.rinchenpong@hillytrip.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'HOMESTAY_OWNER',
    businessName: 'Kanchenjunga View Homestay, Rinchenpong',
    verified: true
  },
  TAXI_OPERATOR: {
    id: 'usr-tax-303',
    name: 'Rajesh Gurung',
    email: 'rajesh.fleet@hillytrip.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'TAXI_OPERATOR',
    businessName: 'Darjeeling Himalayan Taxi Association',
    verified: true
  },
  GUIDE: {
    id: 'usr-gd-305',
    name: 'Tashi Narbu',
    email: 'tashi.guide@hillytrip.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'GUIDE',
    businessName: 'Kanchenjunga Treks & Expeditions',
    verified: true
  },
  CONTENT_EDITOR: {
    id: 'usr-ce-404',
    name: 'Siddharth Sharma',
    email: 'editorial@hillytrip.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'CONTENT_EDITOR',
    verified: true
  },
  MODERATOR: {
    id: 'usr-mod-505',
    name: 'Priya Chhetri',
    email: 'moderation@hillytrip.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'MODERATOR',
    verified: true
  },
  ADMIN: {
    id: 'usr-adm-606',
    name: 'Vikramaditya Tamang',
    email: 'admin@hillytrip.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'ADMIN',
    verified: true
  },
  SUPER_ADMIN: {
    id: 'usr-sa-707',
    name: 'Amrit Murarka',
    email: 'superadmin@hillytrip.com',
    avatarUrl: '/images/hillytrip/hillytrip-default.svg',
    role: 'SUPER_ADMIN',
    membershipLevel: 'PLATINUM_PEAK',
    verified: true
  }
};

export const SYSTEM_PROFILES: UserProfile[] = [];

export interface ImpersonationState {
  realRole: UserRole;
  activeRole: UserRole;
  impersonatedUser: UserProfile | null;
  isImpersonating: boolean;
  isViewOnly: boolean;
  reason?: string;
}

class RoleService {
  private listeners: ((state: ImpersonationState) => void)[] = [];
  private cachedSupabaseUser: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSupabaseAuthListener();
    }
  }

  private async initSupabaseAuthListener() {
    try {
      const supabase = await getSupabase();
      if (!supabase?.auth) return;

      // 1. Fetch initial Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.cachedSupabaseUser = session.user;
        this.notifyListeners();
      }

      // 2. Listen to active Supabase auth changes
      supabase.auth.onAuthStateChange((_event: string, session: any) => {
        this.cachedSupabaseUser = session?.user || null;
        this.notifyListeners();
      });
    } catch (e) {
      console.error('[RoleService] Error initializing Supabase auth listener:', e);
    }
  }

  private parseRoleFromUser(userObj: any): UserRole {
    if (!userObj) return 'GUEST';

    const r = (
      userObj.app_metadata?.role ||
      userObj.user_metadata?.role ||
      userObj.role ||
      ''
    ).toLowerCase();

    const rawRoles =
      userObj.app_metadata?.roles ||
      userObj.user_metadata?.roles ||
      userObj.roles ||
      [];
    const roles = Array.isArray(rawRoles) ? rawRoles.map((x: any) => String(x).toLowerCase()) : [r];

    // Synchronize with existing verified admin state established by App.tsx
    let verifiedAdminUser: any = null;
    let adminEmail = '';
    if (typeof window !== 'undefined') {
      try {
        const storedAdminUser = localStorage.getItem('hillytrip_admin_user');
        if (storedAdminUser) {
          const parsed = JSON.parse(storedAdminUser);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            verifiedAdminUser = parsed;
          }
        }
      } catch (e) {}

      adminEmail = (
        localStorage.getItem('hillytrip_admin_email') ||
        verifiedAdminUser?.email ||
        ''
      ).trim().toLowerCase();
    }

    const userEmail = (userObj.email || '').trim().toLowerCase();
    const isMatchingAdmin = Boolean(
      userEmail &&
      adminEmail &&
      userEmail === adminEmail
    );

    const adminRole = (isMatchingAdmin ? (verifiedAdminUser?.role || '') : '').toLowerCase();
    const adminRawRoles = isMatchingAdmin ? (verifiedAdminUser?.roles || []) : [];
    const adminRoles = Array.isArray(adminRawRoles) ? adminRawRoles.map((x: any) => String(x).toLowerCase()) : [];

    const isSuper =
      r === 'super_admin' ||
      roles.includes('super_admin') ||
      userObj.app_metadata?.isSuperAdmin === true ||
      userObj.user_metadata?.isSuperAdmin === true ||
      userObj.isSuperAdmin === true ||
      (isMatchingAdmin && (
        adminRole === 'super_admin' ||
        adminRoles.includes('super_admin') ||
        verifiedAdminUser?.isSuperAdmin === true
      ));

    const isAdmin =
      isSuper ||
      r === 'admin' ||
      roles.includes('admin') ||
      userObj.app_metadata?.isAdmin === true ||
      userObj.user_metadata?.isAdmin === true ||
      userObj.isAdmin === true ||
      (isMatchingAdmin && (
        adminRole === 'admin' ||
        adminRoles.includes('admin') ||
        verifiedAdminUser?.isAdmin === true ||
        Boolean(verifiedAdminUser)
      ));

    if (isSuper) return 'SUPER_ADMIN';
    if (isAdmin) return 'ADMIN';
    if (r === 'business_owner' || userObj.isBusinessOwner) return 'BUSINESS_OWNER';
    if (r === 'homestay_owner') return 'HOMESTAY_OWNER';
    if (r === 'taxi_operator') return 'TAXI_OPERATOR';
    if (r === 'guide') return 'GUIDE';
    if (r === 'content_editor') return 'CONTENT_EDITOR';
    if (r === 'moderator') return 'MODERATOR';

    return 'TRAVELLER';
  }

  public getRealRole(): UserRole {
    if (typeof window === 'undefined') return 'GUEST';

    // 1. Check live Supabase user state
    if (this.cachedSupabaseUser) {
      return this.parseRoleFromUser(this.cachedSupabaseUser);
    }

    // 2. Check direct persisted Supabase session in localStorage
    const sessionStr = localStorage.getItem('hillytrip_user') || localStorage.getItem('hillytrip_user_session');
    if (sessionStr) {
      try {
        const userObj = JSON.parse(sessionStr);
        if (userObj) {
          return this.parseRoleFromUser(userObj);
        }
      } catch (e) {}
    }

    // 3. Check established admin user session if user authenticated via admin flow
    const adminUserStr = localStorage.getItem('hillytrip_admin_user');
    if (adminUserStr) {
      try {
        const adminObj = JSON.parse(adminUserStr);
        if (adminObj && typeof adminObj === 'object' && !Array.isArray(adminObj) && adminObj.email) {
          const adminEmail = (localStorage.getItem('hillytrip_admin_email') || '').trim().toLowerCase();
          if (!adminEmail || adminEmail === String(adminObj.email).trim().toLowerCase()) {
            return this.parseRoleFromUser(adminObj);
          }
        }
      } catch (e) {}
    }

    // 4. Fallback to persisted stored role
    const stored = localStorage.getItem(LOCAL_STORAGE_REAL_ROLE_KEY) as UserRole;
    if (stored && ROLE_PROFILES[stored] && stored !== 'GUEST') {
      return stored;
    }

    return 'GUEST';
  }

  public getActiveRole(): UserRole {
    if (typeof window === 'undefined') return 'GUEST';

    const realRole = this.getRealRole();
    if (realRole === 'GUEST') return 'GUEST';

    // If super admin or admin, check if impersonating / role switched
    if (realRole === 'SUPER_ADMIN' || realRole === 'ADMIN') {
      const storedActive = localStorage.getItem(LOCAL_STORAGE_ACTIVE_ROLE_KEY) as UserRole;
      if (storedActive && ROLE_PROFILES[storedActive]) {
        return storedActive;
      }
      return realRole;
    }

    return realRole;
  }

  public getImpersonatedUser(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(LOCAL_STORAGE_IMPERSONATED_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  public getImpersonationState(): ImpersonationState {
    const realRole = this.getRealRole();
    const activeRole = this.getActiveRole();
    const impersonatedUser = this.getImpersonatedUser();
    const isImpersonating = activeRole !== realRole || impersonatedUser !== null;
    const reason = typeof window !== 'undefined' ? (localStorage.getItem(LOCAL_STORAGE_REASON_KEY) || undefined) : undefined;

    return {
      realRole,
      activeRole,
      impersonatedUser,
      isImpersonating,
      isViewOnly: isImpersonating, // Impersonation is View Mode Only
      reason
    };
  }

  public switchRole(role: UserRole, reason?: string): void {
    if (typeof window === 'undefined') return;

    const currentState = this.getImpersonationState();
    const superAdmin = ROLE_PROFILES.SUPER_ADMIN;

    localStorage.setItem(LOCAL_STORAGE_ACTIVE_ROLE_KEY, role);
    localStorage.removeItem(LOCAL_STORAGE_IMPERSONATED_USER_KEY);
    if (reason) {
      localStorage.setItem(LOCAL_STORAGE_REASON_KEY, reason);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_REASON_KEY);
    }

    // Audit Log
    if (role !== currentState.realRole) {
      auditService.logEvent({
        superAdminId: superAdmin.id,
        superAdminName: superAdmin.name,
        originalRole: currentState.realRole,
        switchedRole: role,
        reason: reason || 'Super Admin role switch for testing UI & permissions',
        actionType: 'ROLE_SWITCH',
        details: `Switched view mode to role: ${role}`
      });
    } else {
      auditService.logEvent({
        superAdminId: superAdmin.id,
        superAdminName: superAdmin.name,
        originalRole: currentState.activeRole,
        switchedRole: role,
        reason: 'Restored original Super Admin role',
        actionType: 'EXIT_IMPERSONATION',
        details: 'Returned to standard Super Admin mode'
      });
    }

    this.notifyListeners();
  }

  public impersonateUser(targetUser: UserProfile, reason?: string): void {
    if (typeof window === 'undefined') return;

    const currentState = this.getImpersonationState();
    const superAdmin = ROLE_PROFILES.SUPER_ADMIN;

    localStorage.setItem(LOCAL_STORAGE_ACTIVE_ROLE_KEY, targetUser.role);
    localStorage.setItem(LOCAL_STORAGE_IMPERSONATED_USER_KEY, JSON.stringify(targetUser));
    if (reason) {
      localStorage.setItem(LOCAL_STORAGE_REASON_KEY, reason);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_REASON_KEY);
    }

    auditService.logEvent({
      superAdminId: superAdmin.id,
      superAdminName: superAdmin.name,
      originalRole: currentState.realRole,
      switchedRole: targetUser.role,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      reason: reason || `Impersonating user ${targetUser.name} (${targetUser.email || targetUser.role}) in View Mode`,
      actionType: 'USER_IMPERSONATION',
      details: `Entered View Mode as specific user: ${targetUser.name}`
    });

    this.notifyListeners();
  }

  public exitImpersonation(): void {
    if (typeof window === 'undefined') return;

    const currentState = this.getImpersonationState();
    const superAdmin = ROLE_PROFILES.SUPER_ADMIN;

    localStorage.setItem(LOCAL_STORAGE_ACTIVE_ROLE_KEY, 'SUPER_ADMIN');
    localStorage.removeItem(LOCAL_STORAGE_IMPERSONATED_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_REASON_KEY);

    auditService.logEvent({
      superAdminId: superAdmin.id,
      superAdminName: superAdmin.name,
      originalRole: currentState.activeRole,
      switchedRole: 'SUPER_ADMIN',
      targetUserId: currentState.impersonatedUser?.id,
      targetUserName: currentState.impersonatedUser?.name,
      reason: 'Exited impersonation mode',
      actionType: 'EXIT_IMPERSONATION',
      details: 'Restored full Super Admin control'
    });

    this.notifyListeners();
  }

  public getUserProfile(role?: UserRole): UserProfile {
    const impersonated = this.getImpersonatedUser();
    if (impersonated && (!role || role === impersonated.role)) {
      return impersonated;
    }
    const activeRole = role || this.getActiveRole();
    return ROLE_PROFILES[activeRole] || ROLE_PROFILES.GUEST;
  }

  public attemptSensitiveAction(actionName: string): { allowed: boolean; message?: string } {
    const state = this.getImpersonationState();
    if (state.isViewOnly) {
      const superAdmin = ROLE_PROFILES.SUPER_ADMIN;
      auditService.logEvent({
        superAdminId: superAdmin.id,
        superAdminName: superAdmin.name,
        originalRole: state.realRole,
        switchedRole: state.activeRole,
        targetUserId: state.impersonatedUser?.id,
        targetUserName: state.impersonatedUser?.name,
        reason: `Blocked sensitive action: ${actionName} while in View Mode`,
        actionType: 'SENSITIVE_ACTION_BLOCKED',
        details: `Sensitive modification attempt (${actionName}) blocked during impersonation.`
      });

      return {
        allowed: false,
        message: `Sensitive modifications (${actionName}) are disabled while in User Impersonation / View Mode. Please exit impersonation to perform this action.`
      };
    }
    return { allowed: true };
  }

  public subscribe(listener: (state: ImpersonationState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const state = this.getImpersonationState();
    this.listeners.forEach(listener => listener(state));
  }
}

export const roleService = new RoleService();
