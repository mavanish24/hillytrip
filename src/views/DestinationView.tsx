import React, { Suspense } from 'react';
import { DestinationsCatalogView } from '../components/DestinationsCatalogView';
import DestinationDetailFlow from '../components/DestinationDetailFlow';
import { AnimatedLogo } from '../components/AnimatedLogo';
import ErrorBoundary from '../components/ErrorBoundary';
import { Destination, Homestay, Attraction, Hub, ImageItem, User } from '../types';
import { findNearbyEntities, isValidGeoCoordinate } from '../services/geoProximityService';

export interface DestinationViewProps {
  currentPath: string;
  destinations: Destination[];
  homestays: Homestay[];
  attractions: Attraction[];
  hubs: Hub[];
  likes: any;
  destinationStats: Record<string, number>;
  toggleLike: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  navigate: (path: string) => void;
  user: User | null;
  isAdmin: boolean;
  setNotification: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
  reviews: any[];
  comments: any[];
  publicPhotos: ImageItem[];
  loading: boolean;
  activeDestDetail: any;
  activePhotos: ImageItem[];
  setActivePhotos: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  addCommentAction: any;
  deleteCommentAction: any;
  addReviewAction: any;
  deleteReviewAction: any;
  handleToggleSave: any;
  isItemSaved: any;
  handleUserLogin: any;
  executeProtectedAction: any;
}

export const DestinationView: React.FC<DestinationViewProps> = (props) => {
  const {
    currentPath,
    destinations,
    homestays,
    attractions,
    hubs,
    likes,
    destinationStats,
    toggleLike,
    navigate,
    user,
    isAdmin,
    setNotification,
    reviews,
    comments,
    publicPhotos,
    loading,
    activeDestDetail,
    activePhotos,
    setActivePhotos,
    addCommentAction,
    deleteCommentAction,
    addReviewAction,
    deleteReviewAction,
    handleToggleSave,
    isItemSaved,
    handleUserLogin,
    executeProtectedAction
  } = props;

  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isCatalog = cleanPath === '/villages' || cleanPath === '/village' || cleanPath === '/destinations' || cleanPath === '/destination' || cleanPath === '' || cleanPath === '/';
  const isDetail = cleanPath.startsWith('/villages/') || cleanPath.startsWith('/village/') || cleanPath.startsWith('/destinations/') || cleanPath.startsWith('/destination/');

  // Helper function to turn strings into clean URL slugs
  const toSlugStr = (str: any) => {
    if (!str) return '';
    return String(str).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const rawDestId = isDetail ? decodeURIComponent(cleanPath.replace(/^\/(villages|village|destinations|destination)\//, '').replace(/^#\/(villages|village|destinations|destination)\//, '')) : '';

  const resolvedDestDetail = React.useMemo(() => {
    let baseDetail: any = activeDestDetail;
    if (!baseDetail && rawDestId) {
      const targetSlug = toSlugStr(rawDestId);
      const found = (destinations || []).find(d => 
        (d?.id || '').toLowerCase() === rawDestId.toLowerCase() || 
        (d?.slug || '').toLowerCase() === rawDestId.toLowerCase() ||
        ((d as any)?.village_code || '').toLowerCase() === rawDestId.toLowerCase() ||
        toSlugStr(d?.name) === targetSlug ||
        toSlugStr(d?.id) === targetSlug
      );
      if (found) {
        baseDetail = {
          destination: found,
          attractions: [],
          homestays: [],
          routes: []
        };
      }
    }

    if (!baseDetail || !baseDetail.destination) return null;

    const dest = baseDetail.destination;
    const numLat = dest.latitude != null ? Number(dest.latitude) : null;
    const numLng = dest.longitude != null ? Number(dest.longitude) : null;
    const hasValidCoords = isValidGeoCoordinate(numLat, numLng);

    let enrichedAttractions = Array.isArray(baseDetail.attractions) ? [...baseDetail.attractions] : [];
    let enrichedHomestays = Array.isArray(baseDetail.homestays) ? [...baseDetail.homestays] : [];
    let enrichedTaxiStands = Array.isArray(baseDetail.taxi_stands || (baseDetail as any).taxiStands)
      ? [...(baseDetail.taxi_stands || (baseDetail as any).taxiStands)]
      : [];

    if (hasValidCoords && numLat != null && numLng != null) {
      if (enrichedAttractions.length === 0 && attractions && attractions.length > 0) {
        enrichedAttractions = findNearbyEntities(numLat, numLng, attractions, { maxRadiusKm: 25, limit: 36 })
          .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
      }
      if (enrichedHomestays.length === 0 && homestays && homestays.length > 0) {
        enrichedHomestays = findNearbyEntities(numLat, numLng, homestays, { maxRadiusKm: 25, limit: 36 })
          .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
      }
      if (enrichedTaxiStands.length === 0 && hubs && hubs.length > 0) {
        enrichedTaxiStands = findNearbyEntities(numLat, numLng, hubs, { maxRadiusKm: 35, limit: 36 })
          .map(r => ({ ...r.entity, distanceKm: r.distanceKm, distanceFormatted: r.distanceFormatted }));
      }
    }

    return {
      ...baseDetail,
      destination: dest,
      attractions: enrichedAttractions,
      homestays: enrichedHomestays,
      taxi_stands: enrichedTaxiStands,
      routes: baseDetail.routes || []
    };
  }, [activeDestDetail, rawDestId, destinations, attractions, homestays, hubs]);

  if (isCatalog) {
    return (
      <div id="destinations-view" className="animate-fade-in">
        <DestinationsCatalogView
          destinations={destinations}
          homestays={homestays}
          attractions={attractions}
          likes={likes}
          destinationStats={destinationStats}
          toggleLike={toggleLike}
          navigate={navigate}
          user={user}
          setNotification={setNotification}
          reviews={reviews}
          comments={comments}
          publicPhotos={publicPhotos}
        />
      </div>
    );
  }

  if (isDetail) {
    return (
      <ErrorBoundary fallbackTitle="Destination Guide Error" fallbackMessage="The destination travel guide could not be rendered. Let's try resetting.">
        <div id="destination-detail-view" className="animate-fade-in bg-slate-50 min-h-screen">
          {resolvedDestDetail ? (
            <DestinationDetailFlow
              activeDestDetail={resolvedDestDetail}
              hubs={hubs}
              allDestinations={destinations}
              allAttractions={attractions}
              allHomestays={homestays}
              user={user}
              isAdmin={isAdmin}
              likes={likes}
              comments={comments}
              reviews={reviews}
              activePhotos={activePhotos}
              setActivePhotos={setActivePhotos}
              setNotification={setNotification}
              toggleLike={toggleLike}
              addCommentAction={addCommentAction}
              deleteCommentAction={deleteCommentAction}
              addReviewAction={addReviewAction}
              deleteReviewAction={deleteReviewAction}
              handleToggleSave={handleToggleSave}
              isItemSaved={isItemSaved}
              handleUserLogin={handleUserLogin}
              executeProtectedAction={executeProtectedAction}
              currentPath={currentPath}
              navigate={navigate}
            />
          ) : loading ? (
            <div className="text-center py-24 flex flex-col items-center justify-center min-h-[50vh]">
              <AnimatedLogo variant="icon" size="lg" className="animate-pulse mb-4" />
              <p className="text-slate-500 font-semibold text-xs">Gathering local attraction data & homestay files...</p>
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-slate-500 font-semibold">Destination not found or unavailable.</p>
              <button onClick={() => navigate('/destinations')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs">
                Back to Destinations
              </button>
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div id="destinations-view-fallback" className="animate-fade-in">
      <DestinationsCatalogView
        destinations={destinations}
        homestays={homestays}
        attractions={attractions}
        likes={likes}
        destinationStats={destinationStats}
        toggleLike={toggleLike}
        navigate={navigate}
        user={user}
        setNotification={setNotification}
        reviews={reviews}
        comments={comments}
        publicPhotos={publicPhotos}
      />
    </div>
  );
};

export default DestinationView;
