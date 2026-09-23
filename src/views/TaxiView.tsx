import React, { Suspense, useEffect } from 'react';
import safeLazy from '../utils/safeLazy';
import ErrorBoundary from '../components/ErrorBoundary';
import { Route, Hub, Destination, Attraction, Homestay, Driver } from '../types';
import { FEATURED_CIRCUITS, LOOP_JOURNEYS, POPULAR_POINT_TO_POINT_JOURNEYS } from '../data/journeysData';

// Dynamic import factory with shared promise caching for instant preload reuse
let routeDetailsPagePromise: Promise<any> | null = null;
export const preloadRouteDetailsPage = () => {
  if (!routeDetailsPagePromise) {
    routeDetailsPagePromise = import('../components/RouteDetailsPage').catch(err => {
      // Clear cache on failure so retry logic can recover
      routeDetailsPagePromise = null;
      throw err;
    });
  }
  return routeDetailsPagePromise;
};

const RoutesCatalogPage = safeLazy(() => import('../components/RoutesCatalogPage'));
const JourneyDiscoveryPage = safeLazy(() => import('../components/JourneyDiscoveryPage'));
const RouteDetailsPage = safeLazy(() => preloadRouteDetailsPage());
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
  searchFrom: string;
  searchTo: string;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  themeMode?: 'light' | 'dark';
  handleCarLeadSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  formatWhatsAppNumber: (num?: string) => string;
  user?: any;
  handleUserLogin?: () => void;
}

export const TaxiView: React.FC<TaxiViewProps> = (props) => {
  const {
    currentPath,
    routes,
    hubs,
    destinations,
    attractions,
    homestays,
    searchFrom,
    searchTo,
    navigate,
    setNotification,
    themeMode,
  } = props;

  const isJourneyExplore = 
    currentPath === '/journeys/explore' || 
    currentPath === '#/journeys/explore' || 
    currentPath.startsWith('/journeys/explore') ||
    currentPath.startsWith('#/journeys/explore') ||
    currentPath === '/routes/explore' || 
    currentPath === '#/routes/explore' ||
    currentPath.startsWith('/routes/explore') ||
    currentPath.startsWith('#/routes/explore');

  const isJourneyCatalog = 
    !isJourneyExplore && (
      currentPath === '/journeys' || 
      currentPath === '#/journeys' || 
      currentPath.split('?')[0] === '/journeys' ||
      currentPath === '/routes' || 
      currentPath === '#/routes' || 
      currentPath.split('?')[0] === '/routes'
    );

  const isJourneyDetail = 
    !isJourneyExplore && (
      currentPath.startsWith('/journeys/') || 
      currentPath.startsWith('/journey/') || 
      currentPath.startsWith('/routes/') || 
      currentPath.startsWith('/route/')
    );

  // Preload RouteDetailsPage bundle in the background when the user is on the journey catalog or explore page
  // so that clicking "Find Route" or any journey card renders immediately with zero chunk-download delay.
  useEffect(() => {
    if (isJourneyCatalog || isJourneyExplore) {
      preloadRouteDetailsPage();
    }
  }, [isJourneyCatalog, isJourneyExplore]);

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
            user={props.user}
            hubs={hubs}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (isJourneyExplore) {
    return (
      <ErrorBoundary fallbackTitle="Journey Discovery Error" fallbackMessage="Could not display the Himalayan journey discovery catalog. Let's try resetting.">
        <Suspense fallback={<SubviewLoadingFallback />}>
          <JourneyDiscoveryPage
            routes={routes}
            hubs={hubs}
            destinations={destinations}
            attractions={attractions}
            homestays={homestays}
            setNotification={setNotification}
            navigate={navigate}
            themeMode={themeMode}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (isJourneyCatalog) {
    return (
      <ErrorBoundary fallbackTitle="Journey Catalog Error" fallbackMessage="Could not display the Himalayan journeys landing view. Let's try resetting.">
        <Suspense fallback={<SubviewLoadingFallback />}>
          <RoutesCatalogPage
            routes={routes}
            hubs={hubs}
            destinations={destinations}
            attractions={attractions}
            homestays={homestays}
            setNotification={setNotification}
            navigate={navigate}
            themeMode={themeMode}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (isJourneyDetail) {
    const cleanPath = currentPath.split('?')[0];
    const pathParts = cleanPath.replace(/^#\//, '/').split('/').filter(Boolean);
    
    const routeSlug = cleanPath
      .replace('/journeys/', '')
      .replace('#/journeys/', '')
      .replace('/journey/', '')
      .replace('#/journey/', '')
      .replace('/routes/', '')
      .replace('#/routes/', '')
      .replace('/route/', '')
      .replace('#/route/', '')
      .split('?')[0];

    const slugClean = decodeURIComponent(routeSlug).toLowerCase().trim();
    const matchedCircuit = FEATURED_CIRCUITS.find(c => c.slug.toLowerCase() === slugClean || c.id.toLowerCase() === slugClean);
    const matchedLoop = LOOP_JOURNEYS.find(l => l.slug.toLowerCase() === slugClean || l.id.toLowerCase() === slugClean);
    const matchedCuratedP2P = POPULAR_POINT_TO_POINT_JOURNEYS.find(p => p.slug.toLowerCase() === slugClean || p.id.toLowerCase() === slugClean);

    let derivedFrom = searchFrom;
    let derivedTo = searchTo;

    if (matchedCircuit) {
      derivedFrom = matchedCircuit.fromHubId || '';
      derivedTo = matchedCircuit.toHubId || '';
    } else if (matchedLoop) {
      derivedFrom = matchedLoop.startHub.toLowerCase();
      derivedTo = matchedLoop.startHub.toLowerCase();
    } else if (matchedCuratedP2P) {
      derivedFrom = matchedCuratedP2P.fromHubId || '';
      derivedTo = matchedCuratedP2P.toHubId || '';
    } else if (pathParts.length >= 3 && pathParts[1] && pathParts[2] && !pathParts[1].includes('-to-')) {
      derivedFrom = pathParts[1];
      derivedTo = pathParts[2];
    } else if (pathParts.length >= 2 && pathParts[1] && pathParts[1].includes('-to-')) {
      const [f, t] = pathParts[1].split('-to-');
      derivedFrom = f;
      derivedTo = t;
    }

    return (
      <ErrorBoundary fallbackTitle="Journey Pathfinding Error" fallbackMessage="Could not compute journey intelligence map over the high-altitude map grid. Let's try resetting.">
        <Suspense fallback={<SubviewLoadingFallback />}>
          <RouteDetailsPage
            fromHubId={derivedFrom}
            toHubId={derivedTo}
            routeSlug={routeSlug}
            routes={routes}
            hubs={hubs}
            destinations={destinations}
            attractions={attractions}
            homestays={homestays}
            navigate={navigate}
            themeMode={themeMode}
            setNotification={setNotification}
            user={props.user}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Default Taxi Module for /taxi, #/taxi, /book-car, /taxi-operators
  return (
    <ErrorBoundary fallbackTitle="Taxi Module Error" fallbackMessage="Could not load the taxi marketplace. Let's try resetting.">
      <Suspense fallback={<SubviewLoadingFallback />}>
        <TaxiMarketplaceView 
          user={props.user}
          navigate={navigate}
          onOpenLoginModal={props.handleUserLogin}
          hubs={props.hubs}
        />
      </Suspense>
    </ErrorBoundary>
  );
};

export default TaxiView;
