import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  TrendingUp, 
  MessageSquare, 
  Edit3, 
  CheckCircle, 
  XSquare, 
  Loader2, 
  Plus, 
  Search, 
  AlertCircle, 
  Compass, 
  Check, 
  X, 
  Settings, 
  Eye, 
  Smartphone, 
  Calendar, 
  Mail, 
  ChevronRight, 
  Info,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClaimRequest, Inquiry, PendingUpdate, Homestay, User as UserType, BookingLead, BookingActivityLog } from '../types';

interface PartnerDashboardProps {
  user: UserType | null;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
  dbHomestays: Homestay[];
  reloadDb?: () => Promise<void> | void;
}

export default function PartnerDashboard({ 
  user, 
  navigate, 
  setNotification, 
  dbHomestays,
  reloadDb 
}: PartnerDashboardProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'claims' | 'listings' | 'inquiries' | 'leads'>('overview');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  
  // Booking Leads Management States
  const [bookingLeads, setBookingLeads] = useState<BookingLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<BookingLead | null>(null);
  const [leadActionNotes, setLeadActionNotes] = useState('');
  const [leadActivityLogs, setLeadActivityLogs] = useState<BookingActivityLog[]>([]);
  const [isLeadActionSubmitting, setIsLeadActionSubmitting] = useState(false);
  const [leadsFilter, setLeadsFilter] = useState<'all' | 'new' | 'accepted' | 'completed' | 'cancelled_or_rejected'>('all');

  const [dashboardStats, setDashboardStats] = useState({
    ownedCount: 0,
    pendingClaims: 0,
    totalInquiries: 0,
    pendingUpdates: 0
  });

  // Modal claim state
  const [claimSearchQuery, setClaimSearchQuery] = useState('');
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedListingForClaim, setSelectedListingForClaim] = useState<Homestay | null>(null);
  
  // Submit Claim Form inputs
  const [claimOwnerName, setClaimOwnerName] = useState(user?.name || '');
  const [claimMobile, setClaimMobile] = useState('');
  const [claimWhatsapp, setClaimWhatsapp] = useState('');
  const [claimEmail, setClaimEmail] = useState(user?.email || '');
  const [claimMessage, setClaimMessage] = useState('');
  const [claimProof, setClaimProof] = useState('');

  // Update Homestay Modal
  const [updatingHomestay, setUpdatingHomestay] = useState<Homestay | null>(null);
  const [updateForm, setUpdateForm] = useState({
    name: '',
    priceMin: 0,
    priceMax: 0,
    description: '',
    whatsappNumber: '',
    roomRates: '',
    contactInfo: '',
    checkInInfo: '',
    houseRules: '',
    amenitiesInput: '',
    breakfastIncluded: 'Included',
    lunchAvailable: false,
    dinnerAvailable: false
  });

  // Fetch partner-related records
  const fetchPartnerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const emailId = user.email.trim().toLowerCase();
      
      // Claims
      const claimRes = await fetch(`/api/partner/claims?partnerUserId=${encodeURIComponent(emailId)}`);
      const claimJson = await claimRes.json();
      if (claimJson.success) {
        setClaims(claimJson.claims || []);
      }

      // Inquiries
      const inqRes = await fetch(`/api/partner/inquiries?partnerUserId=${encodeURIComponent(emailId)}`);
      const inqJson = await inqRes.json();
      if (inqJson.success) {
        setInquiries(inqJson.inquiries || []);
      }

      // Booking Leads
      const leadsRes = await fetch(`/api/booking-leads?role=partner&identifier=${encodeURIComponent(emailId)}`);
      const leadsJson = await leadsRes.json();
      if (leadsJson.success) {
        setBookingLeads(leadsJson.leads || []);
      }

      // Pending updates
      const upRes = await fetch(`/api/partner/updates?partnerUserId=${encodeURIComponent(emailId)}`);
      const upJson = await upRes.json();
      if (upJson.success) {
        setPendingUpdates(upJson.updates || []);
      }

      if (reloadDb) {
        await reloadDb();
      }

    } catch (err: any) {
      console.error('Failed to fetch partner metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadLogs = async (leadId: string) => {
    try {
      const res = await fetch(`/api/booking-leads/${leadId}/activity-log`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLeadActivityLogs(data.logs || []);
        }
      }
    } catch (e) {
      console.error('Failed to load lead activity logs:', e);
    }
  };

  useEffect(() => {
    if (selectedLead) {
      fetchLeadLogs(selectedLead.id);
    }
  }, [selectedLead]);

  const handleLeadAction = async (leadId: string, action: 'accept' | 'reject' | 'need_more_info' | 'confirm' | 'cancel' | 'complete', noteText?: string) => {
    if (!user) return;
    setIsLeadActionSubmitting(true);
    try {
      const res = await fetch(`/api/booking-leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          note: noteText || leadActionNotes,
          userEmail: user.email,
          userRole: 'partner'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: `Booking request successfully updated: ${action.toUpperCase()}` });
        setLeadActionNotes('');
        
        // Reload leads list
        const emailId = user.email.trim().toLowerCase();
        const leadsRes = await fetch(`/api/booking-leads?role=partner&identifier=${encodeURIComponent(emailId)}`);
        const leadsJson = await leadsRes.json();
        if (leadsJson.success) {
          const freshLeads = leadsJson.leads || [];
          setBookingLeads(freshLeads);
          // update the selected lead details view if any
          const updated = freshLeads.find((l: any) => l.id === leadId);
          if (updated) setSelectedLead(updated);
        }
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to update request.' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Error occurred.' });
    } finally {
      setIsLeadActionSubmitting(false);
    }
  };

  const handleTriggerReminders = async () => {
    try {
      const res = await fetch('/api/booking-leads/reminders/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNotification({ 
          type: 'success', 
          message: `Evaluation run. Affected expired/reminded leads: ${data.affectedCount}` 
        });
        if (user) {
          const emailId = user.email.trim().toLowerCase();
          const leadsRes = await fetch(`/api/booking-leads?role=partner&identifier=${encodeURIComponent(emailId)}`);
          const leadsJson = await leadsRes.json();
          if (leadsJson.success) {
            setBookingLeads(leadsJson.leads || []);
          }
        }
      } else {
        setNotification({ type: 'error', message: 'Failed to trigger evaluation.' });
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Failed evaluation connection.' });
    }
  };

  useEffect(() => {
    fetchPartnerData();
  }, [user]);

  // Recalculate stats based on loaded lists and existing homestays
  useEffect(() => {
    if (!user) return;
    const emailId = user.email.trim().toLowerCase();
    const owned = dbHomestays.filter(h => h.ownerId && h.ownerId.trim().toLowerCase() === emailId);
    const pendingClm = claims.filter(c => c.status === 'pending').length;
    const pendingUps = pendingUpdates.filter(u => u.status === 'pending').length;

    setDashboardStats({
      ownedCount: owned.length,
      pendingClaims: pendingClm,
      totalInquiries: inquiries.length,
      pendingUpdates: pendingUps
    });
  }, [claims, inquiries, pendingUpdates, dbHomestays, user]);

  // Submit claim handler
  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedListingForClaim) return;

    try {
      const payload = {
        homestayId: selectedListingForClaim.id,
        partnerUserId: user.email.trim().toLowerCase(),
        ownerName: claimOwnerName,
        mobile: claimMobile,
        whatsapp: claimWhatsapp,
        email: claimEmail,
        message: claimMessage,
        ownershipProof: claimProof
      };

      const res = await fetch('/api/partner/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          message: '🎉 Claim registered successfully! HillyTrip reviewers will verify details.'
        });
        setClaimModalOpen(false);
        setSelectedListingForClaim(null);
        setClaimMessage('');
        setClaimProof('');
        fetchPartnerData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to submit claim request' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Server error occurred' });
    }
  };

  // Open Update Modal and pre-populate
  const openUpdateModal = (hs: any) => {
    setUpdatingHomestay(hs);
    setUpdateForm({
      name: hs.name || '',
      priceMin: hs.priceMin || 1000,
      priceMax: hs.priceMax || 5000,
      description: hs.description || '',
      whatsappNumber: hs.whatsappNumber || '',
      roomRates: hs.roomRates || '',
      contactInfo: hs.contactInfo || '',
      checkInInfo: hs.checkInInfo || '',
      houseRules: hs.houseRules || '',
      amenitiesInput: hs.amenities ? hs.amenities.join(', ') : '',
      breakfastIncluded: hs.breakfastIncluded || 'Included',
      lunchAvailable: hs.lunchAvailable || false,
      dinnerAvailable: hs.dinnerAvailable || false
    });
  };

  // Submit Pending Update
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !updatingHomestay) return;

    try {
      const payload = {
        homestayId: updatingHomestay.id,
        partnerUserId: user.email.trim().toLowerCase(),
        updateData: {
          name: updateForm.name,
          priceMin: Number(updateForm.priceMin),
          priceMax: Number(updateForm.priceMax),
          description: updateForm.description,
          whatsappNumber: updateForm.whatsappNumber,
          roomRates: updateForm.roomRates,
          contactInfo: updateForm.contactInfo,
          checkInInfo: updateForm.checkInInfo,
          houseRules: updateForm.houseRules,
          amenities: updateForm.amenitiesInput.split(',').map(a => a.trim()).filter(Boolean),
          breakfastIncluded: updateForm.breakfastIncluded,
          lunchAvailable: updateForm.lunchAvailable,
          dinnerAvailable: updateForm.dinnerAvailable
        }
      };

      const res = await fetch('/api/partner/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          message: '🙌 Changes submitted successfully! Review pending admin verification.'
        });
        setUpdatingHomestay(null);
        fetchPartnerData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to file draft modification' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Connection failure' });
    }
  };

  // Update Inquiry tracking status
  const updateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/partner/inquiries/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: `Inquiry status changed to: ${newStatus}` });
        fetchPartnerData();
      } else {
        setNotification({ type: 'error', message: data.error });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'converted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'pending':
      case 'new':
      case 'contacted':
        return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'rejected':
      case 'closed':
        return 'bg-rose-50 text-rose-700 border-rose-150';
      default:
        return 'bg-slate-50 text-slate-755 border-slate-150';
    }
  };

  // Filter unclaimed homestays
  const unclaimedHomestays = dbHomestays.filter(
    h => !h.ownerId && 
    (h.name.toLowerCase().includes(claimSearchQuery.toLowerCase()) || 
     (h.destinationId && h.destinationId.toLowerCase().includes(claimSearchQuery.toLowerCase())) ||
     (h.address && h.address.toLowerCase().includes(claimSearchQuery.toLowerCase())))
  );

  // My owned homestays list
  const ownedHomestays = user 
    ? dbHomestays.filter(h => h.ownerId && h.ownerId.trim().toLowerCase() === user.email.trim().toLowerCase())
    : [];

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-xl mx-auto py-16 mt-12 shadow-md">
        <Compass className="w-14 h-14 text-emerald-600 mx-auto mb-4 animate-spin-slow" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Partner Area Access Required</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Please sign in using your verified HillyTrip credentials to initialize the partner module and manage claimed homestays.
        </p>
        <button
          onClick={() => navigate('#/register')}
          className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl text-sm"
        >
          Sign In / Register Partner 🏡
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-4">
      {/* Header Profile Summary block */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-black text-2xl text-emerald-300 border border-white/20 select-none">
              🏡
            </div>
            <div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider block w-fit mb-1">
                Verified Business Account
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {user.name}!</h1>
              <p className="text-slate-200 text-xs mt-1 font-mono font-bold">Partner ID: {user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setClaimSearchQuery('');
                setClaimModalOpen(true);
              }}
              className="bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Claim Existing Homestay
            </button>
            <button
              onClick={fetchPartnerData}
              className="bg-emerald-700/50 hover:bg-emerald-700/70 border border-emerald-500/20 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">My Registered Listings</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{dashboardStats.ownedCount}</span>
            <span className="text-xs text-emerald-600 font-bold">Verified 🏠</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Pending Proof Claims</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-700">{dashboardStats.pendingClaims}</span>
            <span className="text-xs text-slate-500">In review</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Traveler Inquiries</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-teal-800">{dashboardStats.totalInquiries}</span>
            <span className="text-xs text-teal-600 font-bold">Direct Inbox</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Pending Revisions</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-blue-800">{dashboardStats.pendingUpdates}</span>
            <span className="text-xs text-slate-500">Draft updates</span>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`py-3 px-6 -mb-px text-xs font-black uppercase tracking-wider border-b-2 font-mono whitespace-nowrap cursor-pointer ${
            activeSubTab === 'overview'
              ? 'border-emerald-600 text-emerald-800 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-emerald-700'
          }`}
        >
          Overview Stream
        </button>
        <button
          onClick={() => setActiveSubTab('listings')}
          className={`py-3 px-6 -mb-px text-xs font-black uppercase tracking-wider border-b-2 font-mono whitespace-nowrap cursor-pointer ${
            activeSubTab === 'listings'
              ? 'border-emerald-600 text-emerald-800 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-emerald-700'
          }`}
        >
          My Listings ({ownedHomestays.length})
        </button>
        <button
          onClick={() => setActiveSubTab('claims')}
          className={`py-3 px-6 -mb-px text-xs font-black uppercase tracking-wider border-b-2 font-mono whitespace-nowrap cursor-pointer ${
            activeSubTab === 'claims'
              ? 'border-emerald-600 text-emerald-800 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-emerald-700'
          }`}
        >
          Ownership Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveSubTab('inquiries')}
          className={`py-3 px-6 -mb-px text-xs font-black uppercase tracking-wider border-b-2 font-mono whitespace-nowrap cursor-pointer ${
            activeSubTab === 'inquiries'
              ? 'border-emerald-600 text-emerald-800 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-emerald-700'
          }`}
        >
          Direct Inquiries Inbox ({inquiries.length})
        </button>
        <button
          onClick={() => setActiveSubTab('leads')}
          className={`py-3 px-6 -mb-px text-xs font-black uppercase tracking-wider border-b-2 font-mono whitespace-nowrap cursor-pointer ${
            activeSubTab === 'leads'
              ? 'border-emerald-600 text-emerald-800 font-extrabold'
              : 'border-transparent text-slate-450 hover:text-emerald-700'
          }`}
        >
          💼 Booking Leads ({bookingLeads.length})
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {loading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-slate-500 font-sans text-xs animate-pulse">Syncing listings database & pending responses...</p>
        </div>
      ) : (
        <div>
          {/* OVERVIEW TAB */}
          {activeSubTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Information Callout */}
                <div className="bg-amber-50/50 border border-amber-250 p-5 rounded-2xl flex gap-3.5">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-slate-700 text-xs leading-relaxed">
                    <span className="font-extrabold block text-slate-900 mb-1">Ownership Listing Integrity Rule</span>
                    To retain high SEO authority, reviews, and maps context, HillyTrip operates on the **No Double Listing Mapping Principle**. Once your ownership claim is approved, the public URL layout remains intact, routing bookings directly to your verified partner portal.
                  </div>
                </div>

                {/* Recent Inquiries List */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <h3 className="font-extrabold text-base text-slate-900 mb-4">Urgent Inquiries Queue</h3>
                  {inquiries.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No customer requests logged yet. Claim listings to fetch live inquiry routing.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {inquiries.slice(0, 3).map((inq) => {
                        const homestayRef = dbHomestays.find(h => h.id === inq.homestayId);
                        return (
                          <div key={inq.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                            <div className="overflow-hidden">
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full block w-fit mb-1.5 truncate max-w-xs">
                                {homestayRef?.name || 'Assigned Listing'}
                              </span>
                              <h5 className="font-extrabold text-xs text-slate-900">{inq.userName}</h5>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{inq.message}</p>
                            </div>
                            <button
                              onClick={() => setActiveSubTab('inquiries')}
                              className="text-xs font-bold text-emerald-600 hover:underline shrink-0 flex items-center gap-0.5"
                            >
                              Open <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Quick tips */}
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">Partner Task List</h4>
                  <ul className="text-xs text-slate-600 space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">1.</span>
                      <span>Scan unclaimed homestays to locate your regional business listing.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">2.</span>
                      <span>Submit claim form + phone verification proof to administrative desk.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">3.</span>
                      <span>Keep daily room limits and organic dinner prices up-to-date to prevent traveler complaints.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* LISTINGS TAB */}
          {activeSubTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-extrabold text-base text-slate-900">Your Managed Properties</h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{ownedHomestays.length} Listings</span>
              </div>

              {ownedHomestays.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
                  <Home className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  No listings are currently mapped to your partner account.
                  <button
                    onClick={() => setClaimModalOpen(true)}
                    className="block mx-auto mt-4 text-emerald-600 font-extrabold text-xs hover:underline"
                  >
                    Find and Claim Your Business Listing Now →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ownedHomestays.map((hs) => {
                    // Check if there is a pending update for this listing
                    const updatePending = pendingUpdates.find(u => u.homestayId === hs.id && u.status === 'pending');
                    return (
                      <div key={hs.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
                        <div className="p-5">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <h4 className="font-extrabold text-sm text-slate-900">{hs.name}</h4>
                            {updatePending && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">
                                Revision Pending Review
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 uppercase font-bold tracking-widest">{hs.destinationId || hs.address || 'Himalayan Ridge'}</p>
                          <div className="mt-3 bg-slate-50 p-3 rounded-lg flex justify-between text-xs border border-slate-100">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold uppercase">Basic Price Min</span>
                              <span className="font-black text-slate-800 font-mono">₹{hs.priceMin}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold uppercase">Basic Price Max</span>
                              <span className="font-black text-slate-800 font-mono">₹{hs.priceMax}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold uppercase">Verified Host Contact</span>
                              <span className="font-black text-slate-800 font-mono">{hs.contact || 'No Direct Port'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex gap-3 justify-end">
                          <button
                            onClick={() => navigate(`#/homestay/${hs.id}`)}
                            className="bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                          >
                            Preview Listing Page
                          </button>
                          <button
                            onClick={() => openUpdateModal(hs)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Update Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CLAIMS STATUS TAB */}
          {activeSubTab === 'claims' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-base text-slate-900">Your Submitted Claims Tracker</h3>

              {claims.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-450 text-xs">
                  You haven't submitted any ownership claim requests. Use "Claim Existing Homestay" to connect listings.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden divide-y divide-slate-100">
                  {claims.map((clm) => {
                    const linkedHs = dbHomestays.find(h => h.id === clm.homestayId);
                    return (
                      <div key={clm.id} className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-extrabold text-sm text-slate-900">
                              {linkedHs?.name || `Listing Claim (${clm.homestayId})`}
                            </h4>
                            <span className={`text-[10px] font-extrabold border px-2.5 py-0.5 rounded-full capitalize ${getStatusColor(clm.status)}`}>
                              {clm.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-450">Submitted date: {new Date(clm.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-600 mt-2 italic">"{clm.message}"</p>
                          {clm.adminRemarks && (
                            <div className="mt-2 bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-[11px] text-slate-700">
                              <span className="font-extrabold block text-[10px] uppercase text-slate-450">Registrar Remarks</span>
                              {clm.adminRemarks}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => navigate(`#/homestay/${clm.homestayId}`)}
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                          >
                            Explore Property
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* INQUIRIES MANAGEMENT */}
          {activeSubTab === 'inquiries' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-base text-slate-900">Direct Inquiries Inbox</h3>

              {inquiries.length === 0 ? (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-450 text-xs">
                  Inbox is currently empty. Direct bookings routes when homestays are mapped and verified.
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => {
                    const matchedHome = dbHomestays.find(h => h.id === inq.homestayId);
                    return (
                      <div key={inq.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                          <div>
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono tracking-wider block mb-1 w-fit">
                              {matchedHome?.name || 'My Connected Homestay'}
                            </span>
                            <h4 className="font-black text-slate-900 text-base">{inq.userName}</h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-mono">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5 text-slate-450" /> {inq.userEmail}
                              </span>
                              {inq.userMobile && (
                                <span className="flex items-center gap-1">
                                  <Smartphone className="w-3.5 h-3.5 text-slate-450" /> {inq.userMobile}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-450" /> Travel Date: {inq.travelDate || 'Flexible'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Response Stage</span>
                            <select
                              value={inq.inquiryStatus}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value)}
                              className="bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold p-1 cursor-pointer outline-hidden"
                            >
                              <option value="new">New / Unanswered</option>
                              <option value="contacted">Contacted Traveler</option>
                              <option value="converted">Closed (Converted) ✓</option>
                              <option value="closed">Closed (Lost)</option>
                            </select>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-700 font-sans border border-slate-100 inline-block w-full">
                          <span className="font-black text-slate-450 block uppercase text-[10px] mb-1 font-mono tracking-wider">Traveler Notes / Questions</span>
                          {inq.message || 'No specific notes requested.'}
                        </div>

                        <div className="mt-4 flex gap-4 justify-end border-t border-slate-100 pt-4">
                          {inq.userMobile && (
                            <a
                              href={`https://wa.me/${inq.userMobile.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(inq.userName)},%20this%20is%2520the%20host%20of%20${encodeURIComponent(matchedHome?.name || 'our homestay')}!%2520I%20have%20received%20your%20booking%20inquiry%20via%20HillyTrip.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              💬 Initiate WhatsApp Booking
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CLAIM Modal Dialog */}
      <AnimatePresence>
        {claimModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setClaimModalOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-900">Claim Your Business Listing</h4>
                  <p className="text-[11px] text-slate-450 block">Search all Indian registered hill homestays to secure ownership.</p>
                </div>
                <button
                  onClick={() => {
                    setClaimModalOpen(false);
                    setSelectedListingForClaim(null);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!selectedListingForClaim ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Type property identifier, village, or business name..."
                      value={claimSearchQuery}
                      onChange={(e) => setClaimSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-205 rounded-xl text-xs"
                    />
                  </div>

                  <span className="text-[10px] text-slate-450 font-extrabold uppercase font-mono tracking-wider">Unclaimed system indexes ({unclaimedHomestays.length})</span>
                  <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
                    {unclaimedHomestays.slice(0, 15).map((hs) => (
                      <div key={hs.id} className="py-3 flex justify-between items-center gap-3">
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">{hs.name}</span>
                          <span className="text-[10px] text-slate-450 font-mono">📍 {hs.destinationId || hs.address || 'Himalayan Ridge'} | ₹{hs.priceMin} - ₹{hs.priceMax} Nightly</span>
                        </div>
                        <button
                          onClick={() => setSelectedListingForClaim(hs)}
                          className="bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Select Listing
                        </button>
                      </div>
                    ))}
                    {unclaimedHomestays.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No unclaimed listings matching search parameters.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="space-y-4 font-sans text-xs">
                  <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 block mb-1">Target Claim Listing</span>
                    <span className="font-black text-slate-900 block text-xs">{selectedListingForClaim.name}</span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Location ID: {selectedListingForClaim.id} | Spot coordinates check: {selectedListingForClaim.latitude}, {selectedListingForClaim.longitude}</p>
                    <button
                      type="button"
                      onClick={() => setSelectedListingForClaim(null)}
                      className="text-amber-800 underline font-semibold text-[10px] uppercase mt-2 hover:text-amber-900 block"
                    >
                      ← Switch to another property
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Owner / Claimant Name</label>
                      <input
                        type="text"
                        required
                        value={claimOwnerName}
                        onChange={(e) => setClaimOwnerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Claim Partner Email</label>
                      <input
                        type="email"
                        required
                        readOnly
                        value={claimEmail}
                        className="w-full bg-slate-100 border border-slate-205 rounded-lg p-2.5 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Mobile Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        value={claimMobile}
                        onChange={(e) => setClaimMobile(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">WhatsApp Business Contact</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 XXXXX XXXXX"
                        value={claimWhatsapp}
                        onChange={(e) => setClaimWhatsapp(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Proof of Legitimacy / Business Registration License</label>
                    <textarea
                      placeholder="Enter business registration number, utility bill detail, or host certification link to verify legitimacy..."
                      value={claimProof}
                      onChange={(e) => setClaimProof(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 h-16"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Onboarding Message for Review Board</label>
                    <textarea
                      required
                      placeholder="Hi HillyTrip Desk! I need to claim ownership of this property since I am the lead local manager..."
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 h-20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition cursor-pointer font-sans"
                  >
                    Submit Proof & Lodge Registry Request
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPDATE MODAL DIALOG */}
      <AnimatePresence>
        {updatingHomestay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setUpdatingHomestay(null)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-lg text-slate-900">Draft Details Update</h4>
                  <p className="text-[11px] text-slate-450 block">This will submit a draft revision for {updatingHomestay.name}.</p>
                </div>
                <button
                  onClick={() => setUpdatingHomestay(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4 font-sans text-xs">
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Caution:</strong> Changes to name, spatial coordinates, or basic properties are reviewed manually by our administrators within 24 hours to ensure high mountain tourism standards are retained.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Homestay Public Title</label>
                    <input
                      type="text"
                      required
                      value={updateForm.name}
                      onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">WhatsApp Direct Contact (Customers)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91XXXXXXXXXX"
                      value={updateForm.whatsappNumber}
                      onChange={(e) => setUpdateForm({ ...updateForm, whatsappNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Minimum Rate Nightly (INR)</label>
                    <input
                      type="number"
                      required
                      value={updateForm.priceMin || ''}
                      onChange={(e) => setUpdateForm({ ...updateForm, priceMin: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Maximum Rate Nightly (INR)</label>
                    <input
                      type="number"
                      required
                      value={updateForm.priceMax || ''}
                      onChange={(e) => setUpdateForm({ ...updateForm, priceMax: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">General Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide a wonderful description of your homestay location, local host menu, views and organic experiences..."
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Special Room Rates Details</label>
                    <textarea
                      placeholder="Double Bed Deluxe: ₹2500, Family Suite (meals included): ₹4500..."
                      value={updateForm.roomRates}
                      onChange={(e) => setUpdateForm({ ...updateForm, roomRates: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 h-16"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Check-In / Out Instructions</label>
                    <textarea
                      placeholder="Check-In: 12:00 PM, Check-Out: 11:00 AM, Late arrivals context..."
                      value={updateForm.checkInInfo}
                      onChange={(e) => setUpdateForm({ ...updateForm, checkInInfo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 h-16"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">House Rules & Local Etiquette</label>
                    <textarea
                      placeholder="No high volume speakers past 9 PM. Treat local organic orchards with extreme respect..."
                      value={updateForm.houseRules}
                      onChange={(e) => setUpdateForm({ ...updateForm, houseRules: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 h-16"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">General Contact & Hosts Information</label>
                    <textarea
                      placeholder="Primary contact: Mr. Dorjee Lama, Alternate contact: Mrs. Sonam Lama..."
                      value={updateForm.contactInfo}
                      onChange={(e) => setUpdateForm({ ...updateForm, contactInfo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5 h-16"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Provided Amenities (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Hot Water, Organic Meals, Free WiFi, Mountain Balcony, Parking"
                    value={updateForm.amenitiesInput}
                    onChange={(e) => setUpdateForm({ ...updateForm, amenitiesInput: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2.5"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl mt-2 text-left">
                  <span className="text-slate-700 font-extrabold text-sm block mb-2">🍳 Configurable Meal & Dining Services</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-650 text-xs font-bold mb-1">Breakfast Status</label>
                      <select
                        value={updateForm.breakfastIncluded}
                        onChange={(e) => setUpdateForm({ ...updateForm, breakfastIncluded: e.target.value })}
                        className="w-full bg-white border border-slate-205 rounded-lg p-2 text-xs font-semibold focus:outline-emerald-600 focus:ring-1"
                      >
                        <option value="Included">Breakfast Included</option>
                        <option value="Not Included">Breakfast Not Included</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-2 sm:pt-5">
                      <input
                        type="checkbox"
                        id="formLunchAvailable"
                        checked={updateForm.lunchAvailable}
                        onChange={(e) => setUpdateForm({ ...updateForm, lunchAvailable: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 accent-emerald-600 border-slate-205 rounded-sm cursor-pointer"
                      />
                      <label htmlFor="formLunchAvailable" className="text-slate-650 text-xs font-bold cursor-pointer select-none">🥗 Lunch Available</label>
                    </div>
                    <div className="flex items-center gap-2 pt-2 sm:pt-5">
                      <input
                        type="checkbox"
                        id="formDinnerAvailable"
                        checked={updateForm.dinnerAvailable}
                        onChange={(e) => setUpdateForm({ ...updateForm, dinnerAvailable: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 accent-emerald-600 border-slate-205 rounded-sm cursor-pointer"
                      />
                      <label htmlFor="formDinnerAvailable" className="text-slate-650 text-xs font-bold cursor-pointer select-none">🍗 Dinner Available</label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl hover:bg-emerald-700 transition cursor-pointer font-sans"
                >
                  Save Draft & Submit to Review Desk
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
