import { UserRole } from '../../types/navigation';

class PermissionService {
  private superAdminOnlyRoutes = [
    '/admin/brand',
    '/admin/brand-management',
    '/admin/system-settings',
    '/admin/settings',
    '/admin/commission',
    '/admin/memberships',
    '/admin/payments',
    '/admin/user-roles',
    '/admin/users/status',
    '/admin/users/verify',
    '/admin/rbac',
    '/admin/flags',
    '/admin/backup',
    '/admin/environment-health',
    '/system-health',
    '/admin/platform',
    '/admin/dev-tools',
    '/platform-console',
    '/ai-platform',
    '/admin/security',
    '/admin/audit',
    '/admin/platform-analytics'
  ];

  private adminRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/businesses',
    '/admin/bookings',
    '/admin/payments',
    '/admin/content',
    '/admin/analytics',
    '/admin/moderation',
    '/admin/reports',
    '/admin/settings'
  ];

  private businessRoutes = [
    '/business',
    '/business/dashboard',
    '/business/listings',
    '/business/bookings',
    '/business/offers',
    '/business/reviews',
    '/business/analytics',
    '/business/photos',
    '/business/profile',
    '/business/claims',
    '/business/settings'
  ];

  private taxiOperatorRoutes = [
    '/taxi-operator',
    '/taxi-operator/dashboard',
    '/taxi-operator/bookings',
    '/taxi-operator/fleet',
    '/taxi-operator/areas',
    '/taxi-operator/routes',
    '/taxi-operator/quotes',
    '/taxi-operator/analytics',
    '/taxi-operator/earnings',
    '/taxi-operator/settings'
  ];

  private contentEditorRoutes = [
    '/content-editor',
    '/content-editor/dashboard',
    '/content-editor/articles',
    '/content-editor/media',
    '/content-editor/seo',
    '/content-editor/workflow',
    '/content-editor/publishing'
  ];

  private moderatorRoutes = [
    '/moderator',
    '/moderator/dashboard',
    '/moderator/reviews',
    '/moderator/comments',
    '/moderator/photos',
    '/moderator/reports',
    '/moderator/queue'
  ];

  public canAccessRoute(role: UserRole, path: string): boolean {
    const cleanPath = path.replace(/^#/, '');

    // Super Admin platform routes
    if (this.superAdminOnlyRoutes.some(r => cleanPath.startsWith(r))) {
      return role === 'SUPER_ADMIN';
    }

    // General Admin routes
    if (this.adminRoutes.some(r => cleanPath.startsWith(r))) {
      return role === 'ADMIN' || role === 'SUPER_ADMIN';
    }

    // Business Owner & Homestay Owner routes
    if (this.businessRoutes.some(r => cleanPath.startsWith(r))) {
      return role === 'BUSINESS_OWNER' || role === 'HOMESTAY_OWNER' || role === 'ADMIN' || role === 'SUPER_ADMIN';
    }

    // Taxi Operator routes
    if (this.taxiOperatorRoutes.some(r => cleanPath.startsWith(r))) {
      return role === 'TAXI_OPERATOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
    }

    // Content Editor routes
    if (this.contentEditorRoutes.some(r => cleanPath.startsWith(r))) {
      return role === 'CONTENT_EDITOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
    }

    // Moderator routes
    if (this.moderatorRoutes.some(r => cleanPath.startsWith(r))) {
      return role === 'MODERATOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
    }

    // All public or account routes accessible to Guest & Logged-in Travellers
    return true;
  }
}

export const permissionService = new PermissionService();
