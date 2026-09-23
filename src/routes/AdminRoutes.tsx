import React, { Suspense } from 'react';
import { RoleGuard } from '../components/navigation/RoleGuard';
import safeLazy from '../utils/safeLazy';

const AdminOperationsPlatform = safeLazy(() => 
  import('../components/admin/AdminOperationsPlatform').then((m: any) => ({ default: m.AdminOperationsPlatform || m.default }))
);

const LocationAdminDashboard = safeLazy(() => 
  import('../components/location/LocationAdminDashboard').then((m: any) => ({ default: m.LocationAdminDashboard || m.default }))
);
const ContentIntelligenceHub = safeLazy(() => 
  import('../components/content/ContentIntelligenceHub').then((m: any) => ({ default: m.ContentIntelligenceHub || m.default }))
);
const GlobalMapExplorer = safeLazy(() => 
  import('../components/location/GlobalMapExplorer').then((m: any) => ({ default: m.GlobalMapExplorer || m.default }))
);

interface AdminRoutesProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const AdminRoutes: React.FC<AdminRoutesProps> = ({
  currentPath,
  navigate
}) => {
  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isLocationAdmin = cleanPath === '/admin/location' || cleanPath === '/admin/map';
  const isMapExplorer = cleanPath === '/map' || cleanPath === '/location-platform' || cleanPath === '/map-explorer';
  const isContentHub = cleanPath === '/content-hub' || cleanPath === '/content-platform' || cleanPath === '/smart-page';
  const isContentAdmin = cleanPath === '/admin/cms' || cleanPath === '/admin/content';

  const isAdminOps = cleanPath === '/admin' || 
                     cleanPath.startsWith('/admin/') || 
                     cleanPath === '/operations' || 
                     cleanPath === '/ops' ||
                     cleanPath === '/admin/platform' || 
                     cleanPath === '/platform-console' || 
                     cleanPath === '/system-health' || 
                     cleanPath === '/platform';

  if (!isAdminOps && !isLocationAdmin && !isMapExplorer && !isContentHub && !isContentAdmin) {
    return null;
  }

  const getInitialAdminTab = (path: string): string => {
    if (path.includes('geocoding') || path.includes('geocodes')) return 'geocoding';
    if (path.includes('branding') || path.includes('brand')) return 'branding';
    if (path.includes('attraction-categories') || path.includes('categories')) return 'attraction-categories';
    if (path.includes('content') || path.includes('cms')) return 'content';
    if (path.includes('businesses') || path.includes('homestays') || path.includes('taxis')) return 'businesses';
    if (path.includes('bookings') || path.includes('payments')) return 'bookings';
    if (path.includes('users')) return 'users';
    if (path.includes('moderation')) return 'moderation';
    if (path.includes('offers')) return 'offers';
    if (path.includes('notifications')) return 'notifications';
    if (path.includes('settings') || path.includes('flags')) return 'settings';
    return 'dashboard';
  };

  return (
    <Suspense fallback={
      <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl w-full" />
      </div>
    }>
      {/* 1. MAP EXPLORER PAGE */}
      {isMapExplorer && (
        <div id="map-platform-view" className="animate-fade-in text-slate-800 dark:text-slate-100">
          <GlobalMapExplorer />
        </div>
      )}

      {/* 2. LOCATION ADMIN DASHBOARD */}
      {isLocationAdmin && (
        <RoleGuard routePath={currentPath} onNavigate={navigate}>
          <div id="location-admin-view" className="animate-fade-in text-slate-800 dark:text-slate-100">
            <LocationAdminDashboard />
          </div>
        </RoleGuard>
      )}

      {/* 3. CONTENT INTELLIGENCE HUB */}
      {isContentHub && (
        <div id="content-hub-assembler-view" className="animate-fade-in text-slate-800 dark:text-slate-100">
          <ContentIntelligenceHub initialTab="assembler" onNavigate={navigate} />
        </div>
      )}

      {/* 4. CONTENT ADMIN CMS */}
      {isContentAdmin && (
        <RoleGuard routePath={currentPath} onNavigate={navigate}>
          <div id="content-hub-admin-view" className="animate-fade-in text-slate-800 dark:text-slate-100">
            <ContentIntelligenceHub initialTab="admin" onNavigate={navigate} />
          </div>
        </RoleGuard>
      )}

      {/* 5. ADMIN OPERATIONS PLATFORM */}
      {isAdminOps && (
        <RoleGuard routePath={currentPath} onNavigate={navigate}>
          <div id="admin-operations-platform-view" className="animate-fade-in text-slate-800 dark:text-slate-100">
            <AdminOperationsPlatform initialTab={getInitialAdminTab(cleanPath)} onNavigate={navigate} />
          </div>
        </RoleGuard>
      )}
    </Suspense>
  );
};

export default AdminRoutes;
