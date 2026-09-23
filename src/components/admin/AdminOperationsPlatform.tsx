import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Building2, ShoppingBag, 
  Users, ShieldAlert, Tag, Bell, Settings, ArrowLeft,
  MapPin, Compass, Navigation, BookOpen, Home, Car, Star, Image, ShieldCheck, Globe, ListOrdered
} from 'lucide-react';

import { 
  AdminUser, ManagedBusiness, BusinessClaimRequest, 
  ModerationQueueItem, FeatureFlag, GlobalPlatformSetting 
} from '../../types/admin';

import { AdminOverviewTab } from './AdminOverviewTab';
import { UserManagementTab } from './UserManagementTab';
import { BusinessClaimsTab } from './BusinessClaimsTab';
import { ContentModerationTab } from './ContentModerationTab';
import { BookingPaymentOpsTab } from './BookingPaymentOpsTab';
import { FeatureFlagsSettingsTab } from './FeatureFlagsSettingsTab';
import { AdminOffersManagerTab } from '../offers/AdminOffersManagerTab';
import { ContentAdminCMS } from '../content/ContentAdminCMS';
import AdminTravelGuidesTab from '../AdminTravelGuidesTab';
import AdminHomestayManagementTab from '../AdminHomestayManagementTab';
import AdminTaxiModule from '../taxi/AdminTaxiModule';
import AdminNotificationsTab from '../AdminNotificationsTab';
import { MasterGeocodesAdminTab } from './MasterGeocodesAdminTab';
import { AttractionGeocodingAdminTab } from './AttractionGeocodingAdminTab';
import { BrandManagementTab } from './BrandManagementTab';
import { AttractionCategoryMasterTab } from './AttractionCategoryMasterTab';

interface AdminOperationsPlatformProps {
  initialTab?: string;
  onNavigate?: (path: string) => void;
}

export const AdminOperationsPlatform: React.FC<AdminOperationsPlatformProps> = ({
  initialTab = 'dashboard',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab === 'overview' ? 'dashboard' : initialTab);
  const [activeSubtab, setActiveSubtab] = useState<string>('destinations');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'overview' ? 'dashboard' : initialTab);
    }
  }, [initialTab]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [businesses, setBusinesses] = useState<ManagedBusiness[]>([]);
  const [claims, setClaims] = useState<BusinessClaimRequest[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [settings, setSettings] = useState<GlobalPlatformSetting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize state from API endpoints
  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [resUsers, resClaims, resHomestays, resMod, resSettings] = await Promise.all([
        fetch('/api/admin/users').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/claims').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/homestays').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/admin/moderation').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/settings').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (resUsers.success) setUsers(resUsers.users || []);
      if (resClaims.success) {
        setClaims(resClaims.claims || []);
      }
      if (resHomestays && (resHomestays.data || Array.isArray(resHomestays))) {
        const rawList = Array.isArray(resHomestays) ? resHomestays : (resHomestays.data || []);
        const mappedBiz: ManagedBusiness[] = rawList.map((h: any) => ({
          id: h.id || h.homestay_id,
          name: h.name || h.homestay_name,
          type: 'homestay',
          ownerId: h.ownerId || h.owner_user_id || '',
          ownerName: h.ownerName || h.owner_name || 'Unclaimed',
          district: h.district || '',
          state: h.state || 'Sikkim / West Bengal',
          status: (h.claim_status === 'claimed' || h.claim_status === 'verified' || h.status === 'CLAIMED') ? 'approved' : 'pending',
          verified: !!(h.verified || h.isVerified),
          isFeatured: !!h.isFeatured,
          rating: h.rating || 4.5,
          totalBookingsCount: h.bookingsCount || 0,
          totalRevenueInr: 0,
          createdAt: h.createdAt || new Date().toISOString()
        }));
        setBusinesses(mappedBiz);
      }
      if (resMod.success) setModerationQueue(resMod.queue || []);
      if (resSettings.success) {
        setFlags(resSettings.flags || []);
        setSettings(resSettings.settings || []);
      }
    } catch (e) {
      console.error('Failed to load admin platform state:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // Handlers for user management
  const handleUpdateUserStatus = async (userId: string, status: AdminUser['status']) => {
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status, adminName: 'Admin' })
      }).then(r => r.json());

      if (res.success) fetchAllAdminData();
    } catch (e) {
      console.error('Failed to update user status:', e);
    }
  };

  const handleToggleUserVerify = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, adminName: 'Admin' })
      }).then(r => r.json());

      if (res.success) fetchAllAdminData();
    } catch (e) {
      console.error('Failed to toggle verification:', e);
    }
  };

  // Handlers for business management
  const handleUpdateBizStatus = async (bizId: string, status: ManagedBusiness['status']) => {
    try {
      const res = await fetch('/api/admin/businesses/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bizId, status, adminName: 'Admin' })
      }).then(r => r.json());

      if (res.success) fetchAllAdminData();
    } catch (e) {
      console.error('Failed to update business status:', e);
    }
  };

  const handleReviewClaim = async (claimId: string, status: BusinessClaimRequest['status'], notes?: string) => {
    try {
      const action = (status === 'approved' || (status as string) === 'approve') ? 'approve' : 'reject';
      const res = await fetch(`/api/admin/claims/${encodeURIComponent(claimId)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminRemarks: notes, adminEmail: 'admin@hillytrip.com' })
      }).then(r => r.json());

      if (res.success) {
        fetchAllAdminData();
      } else {
        alert(res.error || 'Failed to review claim');
      }
    } catch (e) {
      console.error('Failed to review claim:', e);
    }
  };

  // Handlers for moderation
  const handleModerateItem = async (itemId: string, status: ModerationQueueItem['status']) => {
    try {
      const res = await fetch('/api/admin/moderation/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status, adminName: 'Admin' })
      }).then(r => r.json());

      if (res.success) fetchAllAdminData();
    } catch (e) {
      console.error('Failed to moderate content:', e);
    }
  };

  // Handlers for settings
  const handleToggleFlag = async (key: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/flags/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled, adminName: 'Admin' })
      }).then(r => r.json());

      if (res.success) fetchAllAdminData();
    } catch (e) {
      console.error('Failed to toggle feature flag:', e);
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      const res = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, adminName: 'Admin' })
      }).then(r => r.json());

      if (res.success) fetchAllAdminData();
    } catch (e) {
      console.error('Failed to update setting:', e);
    }
  };

  // Pending counts for badges
  const pendingClaimsCount = claims.filter(c => c.status === 'pending').length;
  const pendingModerationCount = moderationQueue.filter(m => m.status === 'pending').length;

  const mainNavigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'branding', label: 'Brand Management', icon: Globe },
    { id: 'geocoding', label: 'Universal Geocoder', icon: Compass },
    { id: 'attraction-categories', label: 'Attraction Category Master', icon: ListOrdered },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'businesses', label: 'Businesses', icon: Building2, badge: pendingClaimsCount },
    { id: 'bookings', label: 'Bookings', icon: ShoppingBag },
    { id: 'users', label: 'Users', icon: Users, badge: users.length },
    { id: 'moderation', label: 'Moderation', icon: ShieldAlert, badge: pendingModerationCount },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabChange = (tabId: string, defaultSub?: string) => {
    setActiveTab(tabId);
    if (tabId === 'content') setActiveSubtab(defaultSub || 'destinations');
    else if (tabId === 'businesses') setActiveSubtab(defaultSub || 'homestays');
    else if (tabId === 'moderation') setActiveSubtab(defaultSub || 'reviews');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* Clean, Minimal Solo Founder Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button 
              onClick={() => onNavigate('#/explore')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Return to Main Website"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              HillyTrip Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Simple & fast solo-founder management portal.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-medium text-slate-300">Logged in as Administrator</span>
        </div>
      </div>

      {/* Main Navigation Sidebar / Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
          {mainNavigation.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sub-Navigation Pills for Content, Businesses & Moderation */}
        {activeTab === 'content' && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Content:</span>
            {[
              { id: 'destinations', label: 'Destinations', icon: MapPin },
              { id: 'attractions', label: 'Attractions', icon: Compass },
              { id: 'category-master', label: 'Category Master (24)', icon: ListOrdered },
              { id: 'routes', label: 'Routes', icon: Navigation },
              { id: 'blogs', label: 'Blogs', icon: BookOpen }
            ].map(sub => {
              const Icon = sub.icon;
              const isSubActive = activeSubtab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubtab(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSubActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'businesses' && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Businesses:</span>
            {[
              { id: 'homestays', label: 'Homestays', icon: Home },
              { id: 'taxis', label: 'Taxi Operators', icon: Car }
            ].map(sub => {
              const Icon = sub.icon;
              const isSubActive = activeSubtab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubtab(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSubActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Moderation:</span>
            {[
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'photos', label: 'Photos', icon: Image },
              { id: 'claims', label: 'Claims', icon: ShieldCheck }
            ].map(sub => {
              const Icon = sub.icon;
              const isSubActive = activeSubtab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubtab(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSubActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="pt-2">
        {/* 1. Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <AdminOverviewTab
            claims={claims}
            businesses={businesses}
            moderationQueue={moderationQueue}
            onNavigateTab={(tab, subtab) => handleTabChange(tab, subtab)}
            onRefresh={fetchAllAdminData}
          />
        )}

        {/* Brand Management Tab */}
        {activeTab === 'branding' && (
          <BrandManagementTab />
        )}

        {/* Attraction Geocoding Batch Processor Tab (9,828 Records) */}
        {activeTab === 'attraction-geocoding' && (
          <AttractionGeocodingAdminTab />
        )}

        {/* Master Geocodes Tab */}
        {activeTab === 'geocoding' && (
          <MasterGeocodesAdminTab />
        )}

        {/* Attraction Category Master Tab */}
        {activeTab === 'attraction-categories' && (
          <AttractionCategoryMasterTab />
        )}

        {/* 2. Content Tab */}
        {activeTab === 'content' && (
          <div>
            {activeSubtab === 'blogs' ? (
              <AdminTravelGuidesTab adminEmail="admin@hillytrip.com" />
            ) : activeSubtab === 'category-master' ? (
              <AttractionCategoryMasterTab />
            ) : (
              <ContentAdminCMS initialSection={activeSubtab as 'destinations' | 'attractions' | 'routes'} />
            )}
          </div>
        )}

        {/* 3. Businesses Tab */}
        {activeTab === 'businesses' && (
          <div>
            {activeSubtab === 'homestays' ? (
              <AdminHomestayManagementTab />
            ) : (
              <AdminTaxiModule />
            )}
          </div>
        )}

        {/* 4. Bookings Tab */}
        {activeTab === 'bookings' && (
          <BookingPaymentOpsTab onRefresh={fetchAllAdminData} />
        )}

        {/* 5. Users Tab */}
        {activeTab === 'users' && (
          <UserManagementTab
            users={users}
            onUpdateStatus={handleUpdateUserStatus}
            onToggleVerify={handleToggleUserVerify}
            onRefresh={fetchAllAdminData}
          />
        )}

        {/* 6. Moderation Tab */}
        {activeTab === 'moderation' && (
          <div>
            {activeSubtab === 'claims' ? (
              <BusinessClaimsTab
                businesses={businesses}
                claims={claims}
                onUpdateBizStatus={handleUpdateBizStatus}
                onReviewClaim={handleReviewClaim}
                onRefresh={fetchAllAdminData}
              />
            ) : (
              <ContentModerationTab
                queue={moderationQueue}
                onModerateItem={handleModerateItem}
                onRefresh={fetchAllAdminData}
              />
            )}
          </div>
        )}

        {/* 7. Offers Tab */}
        {activeTab === 'offers' && (
          <AdminOffersManagerTab />
        )}

        {/* 8. Notifications Tab */}
        {activeTab === 'notifications' && (
          <AdminNotificationsTab adminEmail="admin@hillytrip.com" />
        )}

        {/* 9. Settings Tab */}
        {activeTab === 'settings' && (
          <FeatureFlagsSettingsTab
            flags={flags}
            settings={settings}
            onToggleFlag={handleToggleFlag}
            onUpdateSetting={handleUpdateSetting}
            onRefresh={fetchAllAdminData}
          />
        )}
      </div>
    </div>
  );
};
