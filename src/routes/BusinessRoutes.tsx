import React, { Suspense } from 'react';
import { User, Destination, Attraction, Homestay, Route, Hub } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';
import safeLazy from '../utils/safeLazy';

const BusinessOS = safeLazy(() => import('../components/BusinessOS'));
const PartnerDashboard = safeLazy(() => import('../components/PartnerDashboard'));
const UniversalInventoryEngineView = safeLazy(() => import('../components/UniversalInventoryEngineView'));
const BusinessOnboardingFlow = safeLazy(() => import('../components/BusinessOnboardingFlow'));
const UniversalPublicProfile = safeLazy(() => import('../components/UniversalPublicProfile'));

interface BusinessRoutesProps {
  currentPath: string;
  user: User | null;
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  routes: Route[];
  hubs: Hub[];
  navigate: (path: string) => void;
  setNotification?: any;
  handleSetUser?: (u: User | null) => void;
  handleUserLogin?: () => void;
  isAdmin?: boolean;
}

export const BusinessRoutes: React.FC<BusinessRoutesProps> = ({
  currentPath,
  user,
  destinations,
  attractions,
  homestays,
  routes,
  hubs,
  navigate,
  setNotification,
  handleSetUser,
  handleUserLogin,
  isAdmin
}) => {
  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isBusinessOS = cleanPath === '/business-os' || cleanPath === '/partner-os';
  const isPartnerDashboard = cleanPath === '/partner/dashboard' || cleanPath === '/partner';
  const isInventory = cleanPath === '/inventory' || cleanPath === '/business-inventory';
  const isOnboarding = cleanPath === '/become-partner' || cleanPath === '/become-taxi-operator' || cleanPath === '/register' || cleanPath.startsWith('/register/');
  const isUniversalBizProfile = cleanPath.startsWith('/biz/') || 
                                cleanPath.startsWith('/business/') || 
                                cleanPath.startsWith('/guide/') || 
                                cleanPath.startsWith('/cafe/') || 
                                cleanPath.startsWith('/restaurant/') || 
                                cleanPath.startsWith('/rental/') || 
                                cleanPath.startsWith('/activity/') || 
                                cleanPath.startsWith('/resort/') || 
                                cleanPath.startsWith('/hotel/');

  if (!isBusinessOS && !isPartnerDashboard && !isInventory && !isOnboarding && !isUniversalBizProfile) {
    return null;
  }

  return (
    <Suspense fallback={
      <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl w-full" />
      </div>
    }>
      {/* 1. BUSINESS OS */}
      {isBusinessOS && (
        <BusinessOS
          user={user}
          navigate={navigate}
          onUpdateUser={handleSetUser || (() => {})}
          setNotification={(notif: any) => setNotification?.(typeof notif === 'string' ? notif : notif?.message || '')}
        />
      )}

      {/* 2. PARTNER DASHBOARD */}
      {isPartnerDashboard && (
        <PartnerDashboard
          user={user}
          navigate={navigate}
          setNotification={(notif: any) => setNotification?.(typeof notif === 'string' ? notif : notif?.message || '')}
          dbHomestays={homestays}
        />
      )}

      {/* 3. UNIVERSAL INVENTORY ENGINE */}
      {isInventory && (
        <UniversalInventoryEngineView user={user} navigate={navigate} />
      )}

      {/* 4. BUSINESS ONBOARDING FLOW */}
      {isOnboarding && (
        <div id="business-onboarding-route-view" className="animate-fade-in text-slate-800 dark:text-slate-100">
          <BusinessOnboardingFlow
            user={user}
            onUpdateUser={handleSetUser}
            navigate={navigate}
            onOpenLoginModal={handleUserLogin}
            currentPath={currentPath}
          />
        </div>
      )}

      {/* 5. UNIVERSAL PUBLIC BUSINESS PROFILE */}
      {isUniversalBizProfile && (
        <div id="universal-business-profile-route-view" className="animate-fade-in text-slate-800 dark:text-slate-100">
          <UniversalPublicProfile
            businessSlug={currentPath.split('/').pop() || 'himalayan-homestay'}
            onNavigate={navigate}
            destinations={destinations}
            attractions={attractions}
            homestays={homestays}
            routes={routes}
            hubs={hubs}
            user={user}
          />
        </div>
      )}
    </Suspense>
  );
};

export default BusinessRoutes;
