import React, { Suspense, useState, useEffect } from 'react';
import HomestaysCatalogView from '../components/HomestaysCatalogView';
import HomestayDetailPage from '../components/HomestayDetailPage';
import ErrorBoundary from '../components/ErrorBoundary';
import { Homestay, Destination, Attraction, User } from '../types';
import { matchSlugOrId, toSlug, getItemSlug } from '../utils/slug';

export interface HomestayViewProps {
  currentPath: string;
  homestays: Homestay[];
  destinations: Destination[];
  attractions: Attraction[];
  activeHomeDetail: any;
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  navigate: (path: string) => void;
  isItemSaved: (id: string) => boolean;
  handleToggleSave: (id: string, name: string, type: string) => void;
  setIsIframeLoginModalOpen: (open: boolean) => void;
  executeProtectedAction: (actionName: string, actionCallback: () => void, requiresVerification?: boolean, serializableAction?: any) => void;
  setNotification: (notif: { type: 'success' | 'error' | 'info'; message: string } | null) => void;
}

export const HomestayView: React.FC<HomestayViewProps> = (props) => {
  const {
    currentPath,
    homestays,
    destinations,
    attractions,
    activeHomeDetail,
    loading,
    user,
    isAdmin,
    navigate,
    isItemSaved,
    handleToggleSave,
    setIsIframeLoginModalOpen,
    executeProtectedAction,
    setNotification,
  } = props;

  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isCatalog = cleanPath === '/homestays' || cleanPath === '/homestay' || cleanPath === '/stays' || cleanPath === '/stay' || cleanPath === '' || cleanPath === '/';
  const isDetail = cleanPath.startsWith('/homestays/') || cleanPath.startsWith('/homestay/') || cleanPath.startsWith('/stays/') || cleanPath.startsWith('/stay/');

  const rawHomeId = isDetail ? decodeURIComponent(cleanPath.replace(/^\/(homestays|homestay|stays|stay)\//, '').replace(/^#\/(homestays|homestay|stays|stay)\//, '')) : '';

  const localResolved = (rawHomeId ? (() => {
    const targetSlug = toSlug(rawHomeId);
    const found = (homestays || []).find(h => 
      matchSlugOrId(h, rawHomeId) ||
      (h?.id || '').toLowerCase() === rawHomeId.toLowerCase() || 
      (h?.slug || '').toLowerCase() === rawHomeId.toLowerCase() ||
      toSlug(h?.name) === targetSlug ||
      toSlug(h?.id) === targetSlug ||
      getItemSlug(h) === targetSlug
    );
    if (found) {
      const dest = (destinations || []).find(d => d.id === found.destinationId || (d as any).destination_id === found.destinationId);
      return {
        homestay: found,
        destination: dest || null,
        roomCategories: [],
        roomImages: [],
        homestayGallery: (found.images || []).map((url: string, index: number) => ({
          id: `HG-${found.id}-${index}`,
          homestayId: found.id,
          image_url: url,
          display_order: index + 1
        })),
        homestayReviews: []
      };
    }
    return null;
  })() : null) || activeHomeDetail;

  const [asyncHomeDetail, setAsyncHomeDetail] = useState<any>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState<boolean>(false);

  // Clear async detail when target homestay changes
  useEffect(() => {
    setAsyncHomeDetail(null);
  }, [rawHomeId]);

  useEffect(() => {
    if (isDetail && rawHomeId) {
      let isMounted = true;
      if (!localResolved) {
        setIsFetchingDetail(true);
      }
      fetch(`/api/homestays/${encodeURIComponent(rawHomeId)}`)
        .then(res => {
          if (!res.ok) throw new Error('Homestay not found');
          return res.json();
        })
        .then(data => {
          if (isMounted && data && data.homestay) {
            setAsyncHomeDetail(data);
          }
        })
        .catch(err => {
          console.warn('[HomestayView] Failed to fetch single homestay:', err);
        })
        .finally(() => {
          if (isMounted) setIsFetchingDetail(false);
        });

      return () => { isMounted = false; };
    }
  }, [isDetail, rawHomeId]);

  const effectiveDetail = asyncHomeDetail || localResolved;

  if (isCatalog) {
    return (
      <div id="homestays-view" className="animate-fade-in">
        <HomestaysCatalogView
          homestays={homestays}
          destinations={destinations}
          navigate={navigate}
          user={user}
          setNotification={setNotification}
          executeProtectedAction={executeProtectedAction}
        />
      </div>
    );
  }

  if (isDetail) {
    return (
      <ErrorBoundary fallbackTitle="Homestay Guide Error" fallbackMessage="The homestay information sheet could not be processed. Let's try resetting.">
        <HomestayDetailPage 
          activeHomeDetail={effectiveDetail}
          loading={(loading || isFetchingDetail) && !effectiveDetail}
          user={user}
          isAdmin={isAdmin}
          navigate={navigate}
          isItemSaved={isItemSaved}
          handleToggleSave={(id, type) => handleToggleSave(id, effectiveDetail?.homestay?.name || '', type)}
          onLogin={() => navigate('/login')}
          executeProtectedAction={executeProtectedAction}
          allHomestays={homestays}
          allAttractions={attractions}
          allDestinations={destinations}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div id="homestays-view-fallback" className="animate-fade-in">
      <HomestaysCatalogView
        homestays={homestays}
        destinations={destinations}
        navigate={navigate}
        user={user}
        setNotification={setNotification}
        executeProtectedAction={executeProtectedAction}
      />
    </div>
  );
};

export default HomestayView;
