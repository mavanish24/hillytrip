import React, { Suspense } from 'react';
import { User, Hub, Route, Destination, Attraction, Homestay, ImageItem } from '../types';
import ErrorBoundary from '../components/ErrorBoundary';
import safeLazy from '../utils/safeLazy';

const CommunityHubView = safeLazy(() => import('../components/CommunityHubView'));
const TravellerMomentsSection = safeLazy(() => import('../components/TravellerMomentsSection'));
const RegionalContributorDesk = safeLazy(() => import('../components/RegionalContributorDesk'));
const UnifiedInbox = safeLazy(() => import('../components/UnifiedInbox'));
const ReviewCenter = safeLazy(() => import('../components/ReviewCenter'));
const LiveTransitBulletin = safeLazy(() => import('../components/LiveTransitBulletin'));
const SurvivalIndex = safeLazy(() => import('../components/SurvivalIndex'));
const OfflineTravelHub = safeLazy(() => import('../components/OfflineTravelHub'));

interface CommunityRoutesProps {
  currentPath: string;
  user: User | null;
  hubs: Hub[];
  routes: Route[];
  destinations: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  publicPhotos?: ImageItem[];
  likes?: any[];
  bulletinReports: any[];
  handleAddLiveReport: (report: any) => void;
  handleUpvoteLiveReport: (id: string) => void;
  setNotification: (notif: any) => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
  handleUserLogin: () => void;
  isAdmin?: boolean;
  navigate: (path: string) => void;
  onMomentUploaded?: (newMoment: any) => void;
}

export const CommunityRoutes: React.FC<CommunityRoutesProps> = ({
  currentPath,
  user,
  hubs,
  routes,
  destinations,
  attractions = [],
  homestays = [],
  publicPhotos = [],
  likes = [],
  bulletinReports,
  handleAddLiveReport,
  handleUpvoteLiveReport,
  setNotification,
  isOffline,
  setIsOffline,
  handleUserLogin,
  isAdmin,
  navigate,
  onMomentUploaded
}) => {
  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isCommunityHub = cleanPath === '/community' || cleanPath === '/forum';
  const isMoments = cleanPath === '/moments' || cleanPath.startsWith('/moments/') || cleanPath === '/moment' || cleanPath.startsWith('/moment/');
  const isContribute = cleanPath === '/contribute';
  const isMessages = cleanPath === '/messages' || cleanPath.startsWith('/messages/');
  const isReviews = cleanPath === '/feedback' || cleanPath === '/reviews';
  const isBulletin = cleanPath === '/live-bulletin';
  const isSurvival = cleanPath === '/survival-index';
  const isOfflineCenter = cleanPath === '/offline-center';

  if (!isCommunityHub && !isMoments && !isContribute && !isMessages && !isReviews && !isBulletin && !isSurvival && !isOfflineCenter) {
    return null;
  }

  return (
    <ErrorBoundary fallbackTitle="Community Section Error" fallbackMessage="Could not load the community features. Please try resetting.">
      <Suspense fallback={
        <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl w-full" />
        </div>
      }>
        {/* 1. COMMUNITY HUB DASHBOARD */}
        {isCommunityHub && (
          <CommunityHubView
            user={user}
            hubs={hubs}
            routes={routes}
            destinations={destinations}
            bulletinReports={bulletinReports}
            navigate={navigate}
          />
        )}

        {/* 2. TRAVELLER MOMENTS & PHOTOS */}
        {isMoments && (
          <div className="animate-fade-in min-h-screen bg-slate-950 pt-8 pb-16">
            <TravellerMomentsSection
              publicPhotos={publicPhotos}
              destinations={destinations}
              attractions={attractions}
              homestays={homestays}
              likes={likes}
              navigate={navigate}
              user={user}
              onMomentUploaded={onMomentUploaded}
              initialMomentId={currentPath.startsWith('/moments/') ? currentPath.replace('/moments/', '').replace('#/moments/', '') : undefined}
            />
          </div>
        )}

        {/* 3. CONTRIBUTOR DESK */}
        {isContribute && (
          <RegionalContributorDesk
            user={user}
            hubs={hubs}
            destinations={destinations}
            navigate={navigate}
            setNotification={setNotification}
          />
        )}

        {/* 4. UNIFIED MESSAGING / INBOX */}
        {isMessages && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {!user ? (
              <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">HillyTrip Live Messaging</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Please log in or register to access your personal workspace, message homestays, and view active conversations.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition cursor-pointer"
                >
                  Go to Login / Register
                </button>
              </div>
            ) : (
              <UnifiedInbox currentUser={user} />
            )}
          </div>
        )}

        {/* 5. REVIEWS & FEEDBACK */}
        {isReviews && (
          <ReviewCenter
            user={user}
            onLogin={handleUserLogin}
            isAdmin={isAdmin}
          />
        )}

        {/* 6. LIVE TRANSIT BULLETIN */}
        {isBulletin && (
          <LiveTransitBulletin
            hubs={hubs}
            reports={bulletinReports}
            onAddReport={handleAddLiveReport}
            onUpvoteReport={handleUpvoteLiveReport}
            setNotification={setNotification}
            isOffline={isOffline}
          />
        )}

        {/* 7. SURVIVAL INDEX */}
        {isSurvival && (
          <SurvivalIndex destinations={destinations} />
        )}

        {/* 8. OFFLINE TRAVEL HUB */}
        {isOfflineCenter && (
          <OfflineTravelHub
            isOffline={isOffline}
            setIsOffline={setIsOffline}
            hubs={hubs}
            routes={routes}
            setNotification={setNotification}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  );
};

export default CommunityRoutes;
