import React, { Suspense } from 'react';
import { User, Hub, Destination, Attraction, Homestay } from '../types';
import safeLazy from '../utils/safeLazy';

const UserProfileSystem = safeLazy(() => import('../components/UserProfileSystem'));
const HillyTripLoginPage = safeLazy(() => import('../components/HillyTripLoginPage'));
const PublicTravelerProfile = safeLazy(() => import('../components/PublicTravelerProfile'));
const ContributorProfile = safeLazy(() => import('../components/ContributorProfile'));
const BookingEngine = safeLazy(() => import('../components/BookingEngine'));

interface ProfileRoutesProps {
  currentPath: string;
  user: User | null;
  hubs: Hub[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  likes: any[];
  toggleLike: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
  navigate: (path: string) => void;
  setNotification: (notif: any) => void;
  handleSetUser: (user: User | null) => void;
  handleUserLogout: () => void;
  executeProtectedAction?: (actionName: string, actionCallback: () => void) => void;
}

export const ProfileRoutes: React.FC<ProfileRoutesProps> = ({
  currentPath,
  user,
  hubs,
  destinations,
  attractions,
  homestays,
  likes,
  toggleLike,
  navigate,
  setNotification,
  handleSetUser,
  handleUserLogout,
  executeProtectedAction
}) => {
  const cleanPath = (currentPath || '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  const isProfile = cleanPath === '/profile' || currentPath.startsWith('/profile?') || cleanPath === '/dashboard' || currentPath.startsWith('/dashboard?');
  const isContributor = cleanPath.startsWith('/contributor/');
  const isPublicProfile = cleanPath.startsWith('/u/') || 
                          cleanPath.startsWith('/user/') || 
                          cleanPath.startsWith('/traveler/') || 
                          cleanPath.startsWith('/traveller/') || 
                          cleanPath.startsWith('/public-profile');
  const isBookingsTab = (cleanPath === '/bookings' || currentPath.startsWith('/bookings?')) && !isProfile;

  if (!isProfile && !isContributor && !isPublicProfile && !isBookingsTab) {
    return null;
  }

  return (
    <Suspense fallback={
      <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-64 sm:h-96 bg-slate-200 dark:bg-slate-800/60 rounded-3xl w-full" />
      </div>
    }>
      {/* 1. CONTRIBUTOR PORTFOLIO & PROFILE */}
      {isContributor && (
        <ContributorProfile
          user={user}
          hubs={hubs}
          destinations={destinations}
          attractions={attractions}
          homestays={homestays}
          likes={likes}
          toggleLike={toggleLike}
          navigate={navigate}
          setNotification={setNotification}
        />
      )}

      {/* 2. UNIFIED MY PROFILE & ACCOUNT DASHBOARD */}
      {isProfile && (
        <div id="profile-unified-view" className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in text-slate-800 dark:text-slate-100">
          {!user ? (
            <div className="max-w-md mx-auto py-12">
              <HillyTripLoginPage
                initialMode="login"
                isModal={false}
                onSuccess={(loggedUser) => handleSetUser(loggedUser)}
              />
            </div>
          ) : (
            <UserProfileSystem 
              user={user} 
              onUpdateUser={handleSetUser} 
              navigate={navigate} 
              setNotification={setNotification} 
              onLogout={handleUserLogout}
              destinations={destinations}
              attractions={attractions}
              homestays={homestays}
              likes={likes}
              toggleLike={toggleLike}
              currentPath={currentPath}
            />
          )}
        </div>
      )}

      {/* 3. PUBLIC TRAVELER PROFILE */}
      {isPublicProfile && (
        <div id="public-profile-route-view" className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in text-slate-800 dark:text-slate-100">
          <PublicTravelerProfile username={currentPath.split('/').pop()} navigate={navigate} />
        </div>
      )}

      {/* 4. UNIVERSAL BOOKING ENGINE INTEGRATION */}
      {isBookingsTab && (
        <div id="booking-engine-route-view" className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-fade-in text-slate-800 dark:text-slate-100">
          {!user ? (
            <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl mt-6 text-center animate-fade-in">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Bookings Workspace</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-sans">Please sign in to view and manage your booked itineraries, homestay inquiries, and taxi confirmations.</p>
              <button
                onClick={() => {
                  if (executeProtectedAction) {
                    executeProtectedAction('access bookings workspace', () => {});
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign In with Google
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 mb-6 text-left">
                <button
                  id="tab-btn-profile-workspace"
                  onClick={() => navigate('#/profile')}
                  className="pb-3 text-sm font-bold relative cursor-pointer transition-all text-slate-450 hover:text-slate-800 dark:hover:text-white"
                >
                  👤 My Profile Workspace
                </button>
                <button
                  id="tab-btn-profile-bookings"
                  onClick={() => navigate('#/profile?tab=bookings')}
                  className="pb-3 text-sm font-black relative cursor-pointer transition-all text-emerald-600 dark:text-emerald-400"
                >
                  📅 Universal Booking Engine (UBE)
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                </button>
              </div>

              <BookingEngine currentUser={user} onNavigate={navigate} />
            </div>
          )}
        </div>
      )}
    </Suspense>
  );
};

export default ProfileRoutes;
