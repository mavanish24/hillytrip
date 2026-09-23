import React, { Suspense } from 'react';
import { Destination, Attraction, Homestay, Route, Driver, Hub, ImageItem, User } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';
import safeLazy from '../utils/safeLazy';
import { HomepageView } from '../components/HomepageView';
import { getOptimizedImageUrl } from '../utils/imagePool';

// ONE lazy boundary per public route module (no nested waterfalls)
const DestinationView = safeLazy(() => import('../views/DestinationView').then((m: any) => ({ default: m.DestinationView || m.default })));
const AttractionView = safeLazy(() => import('../views/AttractionView').then((m: any) => ({ default: m.AttractionView || m.default })));
const HomestayView = safeLazy(() => import('../views/HomestayView').then((m: any) => ({ default: m.HomestayView || m.default })));
const ExploreView = safeLazy(() => import('../components/ExploreView').then((m: any) => ({ default: m.ExploreView || m.default })));
const TravelGuidesView = safeLazy(() => import('../components/TravelGuidesView').then((m: any) => ({ default: m.TravelGuidesView || m.default })));
const UniversalSearchResultsView = safeLazy(() => import('../components/search/UniversalSearchResultsView').then((m: any) => ({ default: m.UniversalSearchResultsView || m.default })));

// Modal components can remain safely lazy
const OffersCatalogModal = safeLazy(() => import('../components/offers/OffersCatalogModal').then((m: any) => ({ default: m.OffersCatalogModal || m.default })));
const OfferDetailPage = safeLazy(() => import('../components/offers/OfferDetailPage').then((m: any) => ({ default: m.OfferDetailPage || m.default })));
const WishlistView = safeLazy(() => import('../components/WishlistView').then((m: any) => ({ default: m.default || m })));

interface PublicRoutesProps {
  currentPath: string;
  currentHash: string;
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  routes: Route[];
  drivers: Driver[];
  hubs: Hub[];
  likes: any[];
  comments?: any[];
  publicPhotos: ImageItem[];
  destinationStats: Record<string, number>;
  attractionStats: Record<string, number>;
  toggleLike: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  navigate: (path: string) => void;
  user: User | null;
  searchFrom: string;
  setSearchFrom: (val: string) => void;
  searchTo: string;
  setSearchTo: (val: string) => void;
  handleRouteSearchSubmit: (e: React.FormEvent) => void;
  clickQuickSearchRoute: (fromId: string, toId: string) => void;
  setDestTypeFilter: (val: string) => void;
  setDestSearchQuery: (val: string) => void;
  setAttractionFilter: (val: string) => void;
  setAttractionSearchQuery: (val: string) => void;
  executeProtectedAction?: (actionName: string, actionCallback: () => void, requiresVerification?: boolean, serializableAction?: any) => void;
  activeDestDetail?: Destination | null;
  activeAttrDetail?: Attraction | null;
  activeHomeDetail?: Homestay | null;
  setNotification?: any;
  isAdmin?: boolean;
  themeMode?: 'light' | 'dark';
  onMomentUploaded?: (newMoment: any) => void;
}

export const PublicRoutes: React.FC<PublicRoutesProps> = ({
  currentPath,
  currentHash,
  destinations,
  attractions,
  homestays,
  routes,
  drivers,
  hubs,
  likes,
  comments,
  publicPhotos,
  destinationStats,
  attractionStats,
  toggleLike,
  navigate,
  user,
  searchFrom,
  setSearchFrom,
  searchTo,
  setSearchTo,
  handleRouteSearchSubmit,
  clickQuickSearchRoute,
  setDestTypeFilter,
  setDestSearchQuery,
  setAttractionFilter,
  setAttractionSearchQuery,
  executeProtectedAction,
  activeDestDetail,
  activeAttrDetail,
  activeHomeDetail,
  setNotification,
  isAdmin,
  themeMode,
  onMomentUploaded
}) => {
  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isHome = cleanPath === '' || cleanPath === '/' || currentHash === '#/' || currentHash === '#';

  const isExplore = cleanPath === '/explore' || cleanPath.startsWith('/explore/');
  const isDestinations = cleanPath === '/villages' || cleanPath === '/village' || cleanPath.startsWith('/villages/') || cleanPath.startsWith('/village/') || cleanPath === '/destinations' || cleanPath === '/destination' || cleanPath.startsWith('/destinations/') || cleanPath.startsWith('/destination/');
  const isAttractions = cleanPath === '/attractions' || cleanPath === '/attraction' || cleanPath.startsWith('/attractions/') || cleanPath.startsWith('/attraction/');
  const isHomestays = cleanPath === '/homestays' || cleanPath === '/homestay' || cleanPath === '/stays' || cleanPath === '/stay' || cleanPath.startsWith('/homestays/') || cleanPath.startsWith('/homestay/') || cleanPath.startsWith('/stays/') || cleanPath.startsWith('/stay/');
  const isGuides = cleanPath === '/travel-guides' || cleanPath === '/guides' || cleanPath.startsWith('/travel-guides/') || cleanPath.startsWith('/guides/');
  const isOffers = cleanPath === '/offers' || cleanPath === '/offer' || cleanPath.startsWith('/offers/') || cleanPath.startsWith('/offer/');
  const isSearch = cleanPath === '/search' || cleanPath === '/results' || cleanPath.startsWith('/search/') || cleanPath.startsWith('/results/');
  const isLikes = cleanPath === '/likes' || cleanPath === '/wishlist' || cleanPath === '/saved' || currentHash === '#/likes' || currentHash === '#/wishlist' || currentHash === '#/saved';

  if (!isHome && !isExplore && !isDestinations && !isAttractions && !isHomestays && !isGuides && !isOffers && !isSearch && !isLikes) {
    return null;
  }

  return (
    <ErrorBoundary fallbackTitle="Public Route Error" fallbackMessage="Could not load the requested section. Please try resetting or refreshing.">
      <Suspense fallback={
        <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl w-full" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800/60 rounded-xl w-2/3" />
        </div>
      }>
      {/* 1. HOMEPAGE VIEW */}
      {isHome && (
        <HomepageView
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          routes={routes}
          drivers={drivers}
          hubs={hubs}
          likes={likes}
          comments={comments}
          publicPhotos={publicPhotos}
          destinationStats={destinationStats}
          attractionStats={attractionStats}
          toggleLike={toggleLike}
          navigate={navigate}
          user={user}
          searchFrom={searchFrom}
          setSearchFrom={setSearchFrom}
          searchTo={searchTo}
          setSearchTo={setSearchTo}
          handleRouteSearchSubmit={handleRouteSearchSubmit}
          clickQuickSearchRoute={clickQuickSearchRoute}
          setDestTypeFilter={setDestTypeFilter}
          setDestSearchQuery={setDestSearchQuery}
          setAttractionFilter={setAttractionFilter}
          setAttractionSearchQuery={setAttractionSearchQuery}
          executeProtectedAction={executeProtectedAction}
          isAdmin={isAdmin}
          themeMode={themeMode}
          onMomentUploaded={onMomentUploaded}
        />
      )}

      {/* 2. EXPLORE VIEW */}
      {isExplore && (
        <ExploreView navigate={navigate} />
      )}

      {/* 3. DESTINATIONS CATALOG & DETAIL */}
      {isDestinations && (
        <DestinationView
          currentPath={currentPath}
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          hubs={hubs}
          likes={likes}
          destinationStats={destinationStats}
          toggleLike={toggleLike}
          navigate={navigate}
          user={user}
          isAdmin={isAdmin || false}
          setNotification={setNotification ? ((notif: any) => setNotification(typeof notif === 'string' ? notif : notif?.message || '')) : (() => {})}
          reviews={[]}
          comments={comments || []}
          publicPhotos={publicPhotos}
          loading={false}
          activeDestDetail={activeDestDetail}
          activePhotos={publicPhotos}
          setActivePhotos={() => {}}
          addCommentAction={async () => {}}
          deleteCommentAction={async () => {}}
          addReviewAction={async () => {}}
          deleteReviewAction={async () => {}}
          handleToggleSave={() => {}}
          isItemSaved={() => false}
          handleUserLogin={() => {}}
          executeProtectedAction={executeProtectedAction}
        />
      )}

      {/* 4. ATTRACTIONS CATALOG & DETAIL */}
      {isAttractions && (
        <AttractionView
          currentPath={currentPath}
          attractions={attractions}
          destinations={destinations}
          homestays={homestays}
          drivers={drivers}
          likes={likes}
          comments={comments || []}
          attractionStats={attractionStats}
          savedPlaces={[]}
          toggleLike={toggleLike}
          navigate={navigate}
          user={user}
          isAdmin={isAdmin || false}
          loading={false}
          activeAttrDetail={activeAttrDetail}
          activePhotos={publicPhotos}
          setActivePhotos={() => {}}
          handleToggleSave={() => {}}
          isItemSaved={() => false}
          toSlug={(s) => s.toLowerCase()}
          safeSrc={(s, fallback) => getOptimizedImageUrl(s || fallback, 500)}
          calculateDistanceInKm={() => 0}
          setComments={() => {}}
          deleteCommentAction={async () => {}}
          addCommentAction={async () => {}}
          handleUserLogin={() => {}}
          submittingAttrLead={false}
          setSubmittingAttrLead={() => {}}
          attrLeadSuccess={false}
          setAttrLeadSuccess={() => {}}
          handleAttractionLeadSubmit={async () => {}}
          executeProtectedAction={executeProtectedAction || (() => {})}
          setNotification={setNotification ? ((notif: any) => setNotification(typeof notif === 'string' ? notif : notif?.message || '')) : (() => {})}
          attractionFilter="all"
          setAttractionFilter={setAttractionFilter}
          attractionSearchQuery=""
          setAttractionSearchQuery={setAttractionSearchQuery}
        />
      )}

      {/* 5. HOMESTAYS CATALOG & DETAIL */}
      {isHomestays && (
        <HomestayView
          currentPath={currentPath}
          homestays={homestays}
          destinations={destinations}
          attractions={attractions}
          activeHomeDetail={activeHomeDetail}
          loading={false}
          user={user}
          isAdmin={isAdmin || false}
          navigate={navigate}
          isItemSaved={() => false}
          handleToggleSave={() => {}}
          setIsIframeLoginModalOpen={() => {}}
          executeProtectedAction={executeProtectedAction || (() => {})}
          setNotification={setNotification ? ((notif: any) => setNotification(typeof notif === 'string' ? notif : notif?.message || '')) : (() => {})}
        />
      )}

      {/* 6. TRAVEL GUIDES */}
      {isGuides && (
        <TravelGuidesView currentPath={currentPath} navigate={navigate} />
      )}

      {/* 8. SPECIAL OFFERS */}
      {(cleanPath === '/offers' || currentHash === '#/offers') && (
        <OffersCatalogModal
          isOpen={true}
          onClose={() => navigate('#/')}
          navigate={navigate}
        />
      )}
      {(cleanPath.startsWith('/offers/') || cleanPath.startsWith('/offer/')) && cleanPath !== '/offers' && cleanPath !== '/offer' && (
        <OfferDetailPage offerId={cleanPath.split('/').pop() || ''} navigate={navigate} />
      )}

      {/* 9. SEARCH RESULTS */}
      {isSearch && (
        <UniversalSearchResultsView />
      )}

      {/* 10. WISHLIST / SAVED ITEMS */}
      {isLikes && (
        <WishlistView
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          likes={likes}
          toggleLike={toggleLike}
          navigate={navigate}
          setNotification={setNotification}
          user={user}
        />
      )}
    </Suspense>
    </ErrorBoundary>
  );
};

export default PublicRoutes;
