import React, { Suspense } from 'react';
import safeLazy from '../utils/safeLazy';
import ErrorBoundary from '../components/ErrorBoundary';
import { Route, Hub, Destination, Attraction, Homestay, Driver } from '../types';

const TaxiMarketplaceView = safeLazy(() => import('../components/taxi/TaxiMarketplaceView').then((m: any) => ({ default: m.TaxiMarketplaceView || m.default })));
const TaxiOperatorProfilePage = safeLazy(() => import('../components/taxi/TaxiOperatorProfilePage'));

const SubviewLoadingFallback = () => (
  <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
    <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl w-full" />
  </div>
);

export interface TaxiViewProps {
  currentPath: string;
  routes: Route[];
  hubs: Hub[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  drivers: Driver[];
  searchFrom?: string;
  searchTo?: string;
  navigate: (path: string) => void;
  setNotification?: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  themeMode?: 'light' | 'dark';
  handleCarLeadSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  formatWhatsAppNumber?: (num?: string) => string;
  user?: any;
  handleUserLogin?: () => void;
}

export const TaxiView: React.FC<TaxiViewProps> = (props) => {
  const {
    currentPath,
    hubs,
    navigate,
    user,
    handleUserLogin,
  } = props;

  const isOperatorProfile = 
    currentPath.startsWith('/taxi/operator/') ||
    currentPath.startsWith('#/taxi/operator/') ||
    currentPath.startsWith('/operator/') ||
    currentPath.startsWith('#/operator/') ||
    currentPath.startsWith('/taxi-operator/') ||
    currentPath.startsWith('#/taxi-operator/');

  if (isOperatorProfile) {
    const operatorId = currentPath
      .replace('/taxi/operator/', '')
      .replace('#/taxi/operator/', '')
      .replace('/operator/', '')
      .replace('#/operator/', '')
      .replace('/taxi-operator/', '')
      .replace('#/taxi-operator/', '')
      .split('?')[0];

    return (
      <ErrorBoundary fallbackTitle="Operator Profile Error" fallbackMessage="Could not load the operator profile. Let's try resetting.">
        <Suspense fallback={<SubviewLoadingFallback />}>
          <TaxiOperatorProfilePage
            operatorId={operatorId}
            navigate={navigate}
            user={user}
            hubs={hubs}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Default Taxi Marketplace View for /taxi, #/taxi, /book-car, /taxi-operators
  return (
    <ErrorBoundary fallbackTitle="Taxi Module Error" fallbackMessage="Could not load the taxi marketplace. Let's try resetting.">
      <Suspense fallback={<SubviewLoadingFallback />}>
        <TaxiMarketplaceView 
          user={user}
          navigate={navigate}
          onOpenLoginModal={handleUserLogin}
          hubs={hubs}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default TaxiView;

