import React, { Suspense } from 'react';
import { Route, Hub, Destination, Attraction, Homestay, Driver, User } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';
import safeLazy from '../utils/safeLazy';

const TaxiView = safeLazy(() => import('../views/TaxiView').then(m => ({ default: m.TaxiView })));
const BookTaxiPage = safeLazy(() => import('../components/taxi/BookTaxiPage'));
const OperatorDashboard = safeLazy(() => import('../components/taxi/OperatorDashboard'));
const TaxiDashboard = safeLazy(() => import('../components/TaxiDashboard'));
const PublicOperatorProfile = safeLazy(() => import('../components/PublicOperatorProfile'));
const TaxiOperatorOnboarding = safeLazy(() => import('../components/TaxiOperatorOnboarding'));

interface TaxiRoutesProps {
  currentPath: string;
  routes: Route[];
  hubs: Hub[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  drivers: Driver[];
  user: User | null;
  navigate: (path: string) => void;
  setNotification?: any;
  handleSetUser?: (u: User | null) => void;
  handleUserLogin?: () => void;
}

export const TaxiRoutes: React.FC<TaxiRoutesProps> = ({
  currentPath,
  routes,
  hubs,
  destinations,
  attractions,
  homestays,
  drivers,
  user,
  navigate,
  setNotification,
  handleSetUser,
  handleUserLogin
}) => {
  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isTaxi = cleanPath === '/taxi' || 
                 cleanPath === '/taxis' || 
                 cleanPath.startsWith('/taxi/') ||
                 cleanPath === '/journeys' || 
                 cleanPath.startsWith('/journeys/') || 
                 cleanPath === '/journey' || 
                 cleanPath.startsWith('/journey/') || 
                 cleanPath === '/routes' || 
                 cleanPath.startsWith('/routes/') || 
                 cleanPath === '/route' || 
                 cleanPath.startsWith('/route/') || 
                 cleanPath === '/book-car';
  const isOperatorProfile = cleanPath.startsWith('/taxi-operator/') || cleanPath.startsWith('/operator/');
  const isBookTaxi = cleanPath === '/book-taxi' || cleanPath.startsWith('/book-taxi/');

  if (!isTaxi && !isOperatorProfile && !isBookTaxi) {
    return null;
  }

  return (
    <ErrorBoundary fallbackTitle="Transit & Journeys Error" fallbackMessage="Could not load taxi and route services. Please try refreshing.">
      <Suspense fallback={
        <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl w-full" />
        </div>
      }>
        {/* 1. TAXI MARKETPLACE & SEARCH & JOURNEYS */}
        {isTaxi && cleanPath !== '/taxi/dashboard' && cleanPath !== '/taxi/operator' && cleanPath !== '/taxi/onboarding' && (
          <TaxiView
            currentPath={currentPath}
            routes={routes}
            hubs={hubs}
            destinations={destinations}
            attractions={attractions}
            homestays={homestays}
            drivers={drivers}
            searchFrom=""
            searchTo=""
            navigate={navigate}
            setNotification={setNotification || (() => {})}
            handleCarLeadSubmit={() => {}}
            formatWhatsAppNumber={(s) => s || ''}
            user={user}
          />
        )}

      {/* 2. BOOK TAXI PAGE */}
      {isBookTaxi && (
        <BookTaxiPage
          user={user}
          navigate={navigate}
          hubs={hubs}
          destinations={destinations}
        />
      )}

      {/* 3. TAXI OPERATOR DASHBOARDS */}
      {(currentPath === '/taxi/dashboard' || currentPath === '/taxi/operator') && (
        user?.role === 'taxi_operator' || user?.roles?.includes('taxi_operator') ? (
          <OperatorDashboard user={user} navigate={navigate} onUpdateUser={handleSetUser} />
        ) : (
          <TaxiDashboard
            user={user}
            onUpdateUser={handleSetUser || (() => {})}
            navigate={navigate}
            currentPath={currentPath}
          />
        )
      )}

      {/* 4. TAXI OPERATOR PUBLIC PROFILE */}
      {isOperatorProfile && (
        <PublicOperatorProfile
          operatorId={currentPath.split('/').pop() || ''}
          onNavigate={navigate}
        />
      )}

      {/* 5. TAXI ONBOARDING */}
      {currentPath === '/taxi/onboarding' && (
        <TaxiOperatorOnboarding
          user={user}
          onUpdateUser={handleSetUser}
          navigate={navigate}
          onOpenLoginModal={handleUserLogin}
        />
      )}
      </Suspense>
    </ErrorBoundary>
  );
};

export default TaxiRoutes;
