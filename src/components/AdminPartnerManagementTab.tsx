import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  User, 
  Home, 
  Award, 
  FileText, 
  TrendingUp, 
  Clock, 
  FileCheck, 
  Mail, 
  Phone, 
  MessageSquare, 
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  History,
  Activity,
  Heart
} from 'lucide-react';
<<<<<<< HEAD
import { ClaimRequest, Inquiry, OwnershipHistory, PendingUpdate, Homestay, BookingLead, BookingStatusHistory, BookingActivityLog } from '../types';
=======
import { ClaimRequest, Inquiry, OwnershipHistory, PendingUpdate, Homestay } from '../types';
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8

interface AdminPartnerManagementTabProps {
  adminEmail: string;
}

export default function AdminPartnerManagementTab({ adminEmail }: AdminPartnerManagementTabProps) {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<'claims' | 'updates' | 'applications' | 'inquiries' | 'ownership-history' | 'bookings'>('claims');
=======
  const [activeTab, setActiveTab] = useState<'claims' | 'updates' | 'applications' | 'inquiries' | 'ownership-history'>('claims');
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [updates, setUpdates] = useState<PendingUpdate[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [history, setHistory] = useState<OwnershipHistory[]>([]);
  const [dbHomestays, setDbHomestays] = useState<Homestay[]>([]);

<<<<<<< HEAD
  // Booking Leads States
  const [bookingLeads, setBookingLeads] = useState<BookingLead[]>([]);
  const [bookingStatusHistories, setBookingStatusHistories] = useState<BookingStatusHistory[]>([]);
  const [bookingActivityLogs, setBookingActivityLogs] = useState<BookingActivityLog[]>([]);
  const [selectedLead, setSelectedLead] = useState<BookingLead | null>(null);
  const [leadsFilter, setLeadsFilter] = useState<'all' | 'new' | 'accepted' | 'confirmed' | 'completed' | 'cancelled_or_rejected'>('all');
  const [leadsTypeFilter, setLeadsTypeFilter] = useState<'all' | 'homestay' | 'taxi' | 'planner' | 'guide' | 'activity'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [reassigningLeadId, setReassigningLeadId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState<boolean>(false);
  const [leadActionNotes, setLeadActionNotes] = useState<string>('');
  const [isLeadActionSubmitting, setIsLeadActionSubmitting] = useState<boolean>(false);

  // Onboarding Applications State
  const [pendingPartners, setPendingPartners] = useState<any[]>([]);
  const [pendingContributors, setPendingContributors] = useState<any[]>([]);
  const [taxiOperators, setTaxiOperators] = useState<any[]>([]);
=======
  // Onboarding Applications State
  const [pendingPartners, setPendingPartners] = useState<any[]>([]);
  const [pendingContributors, setPendingContributors] = useState<any[]>([]);
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8

  // Actions remarks state
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Claims
      const claimsRes = await fetch('/api/admin/claims', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      const claimsJson = await claimsRes.json();
      if (claimsJson.success) setClaims(claimsJson.claims || []);

      // 2. Updates
      const updatesRes = await fetch('/api/admin/updates', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      const updatesJson = await updatesRes.json();
      if (updatesJson.success) setUpdates(updatesJson.updates || []);

      // 3. Inquiries
      const inqRes = await fetch('/api/admin/inquiries', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      const inqJson = await inqRes.json();
      if (inqJson.success) setInquiries(inqJson.inquiries || []);

      // 4. Ownership History
      const histRes = await fetch('/api/admin/ownership-history', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      const histJson = await histRes.json();
      if (histJson.success) setHistory(histJson.history || []);

      // 5. Homestays list for labels
      const homestaysRes = await fetch('/api/admin/data/homestays', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      const homestaysJson = await homestaysRes.json();
      if (homestaysJson.success) setDbHomestays(homestaysJson.data || []);

      // 6. Onboarding Applications
      const appsRes = await fetch('/api/admin/pending-applications', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      const appsJson = await appsRes.json();
      if (appsJson.success) {
        setPendingPartners(appsJson.pendingPartners || []);
        setPendingContributors(appsJson.pendingContributors || []);
      }
<<<<<<< HEAD

      // 7. Booking Leads
      const leadsRes = await fetch('/api/admin/data/booking_leads', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      if (leadsRes.ok) {
        const leadsList = await leadsRes.json();
        setBookingLeads(leadsList || []);
      }

      // 8. Booking Status History
      const statusHistRes = await fetch('/api/admin/data/booking_status_history', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      if (statusHistRes.ok) {
        const historiesList = await statusHistRes.json();
        setBookingStatusHistories(historiesList || []);
      }

      // 9. Booking Activity Log
      const activityRes = await fetch('/api/admin/data/booking_activity_log', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      if (activityRes.ok) {
        const logsList = await activityRes.json();
        setBookingActivityLogs(logsList || []);
      }

      // 10. Users List
      const usersRes = await fetch('/api/admin/data/users', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      if (usersRes.ok) {
        const usersList = await usersRes.json();
        setUsers(usersList || []);
      }

      // 11. Taxi Operators
      const taxiOpsRes = await fetch('/api/admin/taxi-operators', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      if (taxiOpsRes.ok) {
        const taxiOpsJson = await taxiOpsRes.json();
        if (taxiOpsJson.success) {
          setTaxiOperators(taxiOpsJson.data || []);
        }
      }
=======
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
    } catch (err: any) {
      console.error('Failed to load partner administrative resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminEmail]);

  // Approve/Reject Partner or Contributor application
  const handleResolveApplication = async (userId: string, type: 'partner' | 'contributor', action: 'approve' | 'reject') => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch('/api/admin/resolve-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ userId, type, action, remarks: remarks[userId] || '' })
      });
      const data = await res.json();
      if (data.success) {
        setRemarks(prev => {
          const clone = { ...prev };
          delete clone[userId];
          return clone;
        });
        fetchData();
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Connection failure');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

<<<<<<< HEAD
  // Resolve Taxi Operator Onboarding / Account Action
  const handleResolveTaxiOperator = async (userId: string, action: 'approve' | 'reject' | 'suspend' | 'restore') => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const statusMap = {
        approve: 'verified',
        reject: 'rejected',
        suspend: 'suspended',
        restore: 'verified'
      };

      const payload = {
        status: statusMap[action],
        adminNotes: remarks[userId] || '',
        rejectionReason: action === 'reject' ? (remarks[userId] || 'Documents uploaded were unreadable or expired.') : ''
      };

      const res = await fetch(`/api/admin/taxi-operators/${userId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRemarks(prev => {
          const clone = { ...prev };
          delete clone[userId];
          return clone;
        });
        fetchData();
      } else {
        alert(data.error || 'Failed to update operator status.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred while resolving operator application.');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

=======
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
  // Approve/Reject Claim request
  const handleClaimAction = async (claimId: string, action: 'approve' | 'reject') => {
    const adminRemarks = remarks[claimId] || '';
    setActionLoading(prev => ({ ...prev, [claimId]: true }));
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ action, adminRemarks, adminEmail })
      });
      const data = await res.json();
      if (data.success) {
        // clear remarks input
        setRemarks(prev => {
          const clone = { ...prev };
          delete clone[claimId];
          return clone;
        });
        fetchData();
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Connection failure');
    } finally {
      setActionLoading(prev => ({ ...prev, [claimId]: false }));
    }
  };

  // Approve/Reject Draft updates
  const handleUpdateAction = async (updateId: string, action: 'approve' | 'reject') => {
    setActionLoading(prev => ({ ...prev, [updateId]: true }));
    try {
      const res = await fetch(`/api/admin/updates/${updateId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ action, adminEmail })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Connection failure');
    } finally {
      setActionLoading(prev => ({ ...prev, [updateId]: false }));
    }
  };

<<<<<<< HEAD
  // Administrative Booking Actions
  const handleUpdateBookingStatus = async (leadId: string, action: string, note: string) => {
    setIsLeadActionSubmitting(true);
    try {
      const res = await fetch(`/api/booking-leads/${leadId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          note,
          userEmail: adminEmail,
          userRole: 'admin'
        })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchData();
        setLeadActionNotes('');
        // Update selected lead state if it's the active one
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: data.lead?.status || prev.status, contactRevealed: data.lead?.contactRevealed ?? prev.contactRevealed } : null);
        }
        alert(`Booking status successfully changed to "${action}"!`);
      } else {
        alert(data.error || 'Failed to update booking status.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status.');
    } finally {
      setIsLeadActionSubmitting(false);
    }
  };

  const handleReassignPartner = async (leadId: string, partnerId: string) => {
    setIsReassigning(true);
    try {
      const lead = bookingLeads.find(l => l.id === leadId);
      if (!lead) return;

      let partnerName = 'HillyTrip Partner';
      
      const foundUser = users.find(u => u.id === partnerId || u.email === partnerId);
      if (foundUser) {
        partnerName = foundUser.name || foundUser.email;
      } else {
        const foundHome = dbHomestays.find(h => h.ownerId === partnerId);
        if (foundHome) {
          partnerName = foundHome.ownerName || 'Homestay Host';
        }
      }

      const updatedLead = {
        ...lead,
        assignedPartnerId: partnerId,
        assignedPartnerName: partnerName,
        updatedAt: new Date().toISOString()
      };

      const res = await fetch('/api/admin/data/booking_leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify(updatedLead)
      });

      if (res.ok) {
        // Log activity
        const log = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          leadId,
          activityType: 'update',
          description: `Admin reassigned lead to Partner: ${partnerName} (${partnerId}).`,
          performedBy: adminEmail,
          createdAt: new Date().toISOString()
        };

        await fetch('/api/admin/data/booking_activity_log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': 'admin123',
            'x-admin-email': adminEmail
          },
          body: JSON.stringify(log)
        });

        // Add a notification to the new partner!
        const partNotification = {
          id: `notif-${Date.now()}-p`,
          userId: partnerId,
          role: 'partner',
          leadId,
          title: `Assigned Booking Request - #${leadId}`,
          message: `Administrative override: You have been assigned a booking request. Tap to view details.`,
          category: 'booking_submitted',
          isRead: false,
          createdAt: new Date().toISOString()
        };

        await fetch('/api/admin/data/booking_notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': 'admin123',
            'x-admin-email': adminEmail
          },
          body: JSON.stringify(partNotification)
        });

        await fetchData();
        setReassigningLeadId(null);
        setSelectedPartnerId('');
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead({ ...updatedLead });
        }
        alert('Partner successfully reassigned!');
      } else {
        alert('Failed to reassign partner.');
      }
    } catch (err: any) {
      alert(err.message || 'Error reassigning partner.');
    } finally {
      setIsReassigning(false);
    }
  };

  const handleTriggerPartnerReminder = async (lead: BookingLead) => {
    if (!lead.assignedPartnerId) return;
    try {
      const reminderNotif = {
        id: `notif-${Date.now()}-r`,
        userId: lead.assignedPartnerId,
        role: 'partner',
        leadId: lead.id,
        title: `⚠️ URGENT: Booking Action Required - #${lead.id}`,
        message: `HillyTrip Admin has sent an urgent reminder to review the booking request for customer "${lead.customerName}".`,
        category: 'booking_reminder',
        isRead: false,
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/admin/data/booking_notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify(reminderNotif)
      });

      if (res.ok) {
        const log = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          leadId: lead.id,
          activityType: 'reminder',
          description: `Admin sent urgent booking action reminder to Partner (${lead.assignedPartnerId}).`,
          performedBy: adminEmail,
          createdAt: new Date().toISOString()
        };

        await fetch('/api/admin/data/booking_activity_log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': 'admin123',
            'x-admin-email': adminEmail
          },
          body: JSON.stringify(log)
        });

        await fetchData();
        alert('Action reminder successfully sent to partner!');
      } else {
        alert('Failed to send reminder.');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending reminder.');
    }
  };

=======
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
  const getHomestayLabel = (homestayId: string) => {
    const found = dbHomestays.find(h => h.id === homestayId);
    return found ? found.name : homestayId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'converted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-150';
      case 'pending':
      case 'new':
      case 'contacted':
        return 'bg-amber-50 text-amber-850 border-amber-100';
      case 'rejected':
      case 'closed':
        return 'bg-rose-50 text-rose-800 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="font-sans text-xs">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            🤝 Partner Management Dashboard Center
          </h2>
          <span className="text-[11px] text-slate-450 block">Approve homestay claim requests, manage direct inbox routing and verify listing drafts.</span>
        </div>
        <button
          onClick={fetchData}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1.5 rounded-lg border border-emerald-100 cursor-pointer"
        >
          🔄 Refresh
        </button>
      </div>

      {/* ADMIN SUB-TABS */}
<<<<<<< HEAD
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-4xl overflow-x-auto">
=======
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-2xl overflow-x-auto">
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex-1 py-2 px-3 whitespace-nowrap text-center rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'claims' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Claims Queue ({claims.filter(c => c.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('updates')}
          className={`flex-1 py-2 px-3 whitespace-nowrap text-center rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'updates' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Draft Updates ({updates.filter(u => u.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-2 px-3 whitespace-nowrap text-center rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'applications' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Applications ({pendingPartners.length + pendingContributors.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex-1 py-2 px-3 whitespace-nowrap text-center rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'inquiries' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Inquiries ({inquiries.length})
        </button>
        <button
<<<<<<< HEAD
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 py-2 px-3 whitespace-nowrap text-center rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'bookings' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Bookings & Journeys ({bookingLeads.length})
        </button>
        <button
=======
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
          onClick={() => setActiveTab('ownership-history')}
          className={`flex-1 py-2 px-3 whitespace-nowrap text-center rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === 'ownership-history' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Audit History ({history.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-slate-500 animate-pulse font-bold">Latching databases...</p>
        </div>
      ) : (
        <div>
          {/* CLAIMS TAB */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              {claims.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400">
                  No homestay claim requests found in database.
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((clm) => (
                    <div key={clm.id} className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                              Homestay Claim Request
                            </span>
                            <span className={`text-[9px] border px-2 py-0.5 rounded-full capitalize font-black ${getStatusColor(clm.status)}`}>
                              {clm.status}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            🏢 Homestay: {getHomestayLabel(clm.homestayId)}
                          </h4>
                          <span className="text-[10px] text-slate-450 block font-mono mt-0.5">Identifer ID: {clm.homestayId}</span>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 bg-white p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-black block">Claimant Owner Name</span>
                              <span className="font-bold text-slate-750">{clm.ownerName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-black block">Partner User Account</span>
                              <span className="font-bold text-slate-750">{clm.partnerUserId}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase font-black block">Contact Details</span>
                              <span className="font-bold text-slate-750 flex items-center gap-1">
                                📞 {clm.mobile || 'No Phone'} | 💬 {clm.whatsapp || 'No Whatsapp'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 bg-slate-100/50 p-3 rounded-lg border border-slate-150">
                            <span className="text-[9px] text-slate-450 uppercase font-black block mb-1">Onboarding Claim message</span>
                            <p className="text-slate-700 italic">"{clm.message}"</p>
                          </div>

                          {clm.ownershipProof && (
                            <div className="mt-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-150">
                              <span className="text-[9px] text-emerald-800 uppercase font-black block">Business Legitimacy Proof / License Link</span>
                              <code className="text-[10px] font-mono text-emerald-700">{clm.ownershipProof}</code>
                            </div>
                          )}
                        </div>

                        {clm.status === 'pending' && (
                          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs w-full md:max-w-xs">
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Admin Resolution Comments</label>
                            <textarea
                              placeholder="Add review remarks or grounds for suspension/approval..."
                              value={remarks[clm.id] || ''}
                              onChange={(e) => setRemarks({ ...remarks, [clm.id]: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 mb-3 h-14"
                            />
                            <div className="flex gap-2">
                              <button
                                disabled={actionLoading[clm.id]}
                                onClick={() => handleClaimAction(clm.id, 'reject')}
                                className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold py-2 rounded-lg cursor-pointer"
                              >
                                Reject Claim
                              </button>
                              <button
                                disabled={actionLoading[clm.id]}
                                onClick={() => handleClaimAction(clm.id, 'approve')}
                                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1"
                              >
                                {actionLoading[clm.id] && <Loader2 className="w-3 h-3 animate-spin" />}
                                Approve & Assign
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DRAFT UPDATES TAB */}
          {activeTab === 'updates' && (
            <div className="space-y-4">
              {updates.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400">
                  No draft listing modifications logged.
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map((up) => {
                    const originalHs = dbHomestays.find(h => h.id === up.homestayId);
                    return (
                      <div key={up.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div>
                            <span className="bg-indigo-50 text-indigo-850 px-2.5 py-0.5 rounded-full text-[9px] font-mono border border-indigo-100 uppercase">
                              Proposed Listing Revision
                            </span>
                            <h4 className="font-black text-sm text-slate-900 mt-1.5">
                              🏡 Original Property: {originalHs?.name || `Listing ID: ${up.homestayId}`}
                            </h4>
                            <span className="text-[10px] text-slate-450 font-mono block">Submitted by claimed owner: {up.partnerUserId}</span>
                          </div>
                          <span className={`text-[9px] border px-2 py-0.5 rounded-full capitalize font-extrabold ${getStatusColor(up.status)}`}>
                            {up.status}
                          </span>
                        </div>

                        {/* DIFF GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white p-4 rounded-xl border border-slate-150">
                          <div>
                            <span className="text-[9px] uppercase font-black text-rose-500 block mb-2">Original State in Firestore</span>
                            {originalHs ? (
                              <div className="space-y-2 text-[11px] text-slate-600 border-r border-slate-100 pr-2">
                                <p><strong>Title:</strong> {originalHs.name}</p>
                                <p><strong>Price nightly:</strong> ₹{originalHs.priceMin} - ₹{originalHs.priceMax}</p>
                                <p><strong>Description:</strong> {originalHs.description || 'No custom description'}</p>
                                <p><strong>Phone:</strong> {originalHs.contact}</p>
                                <p><strong>Amenities:</strong> {originalHs.amenities?.join(', ') || 'None'}</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">No original record loaded.</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-black text-emerald-600 block mb-2">Proposed Revision Fields</span>
                            <div className="space-y-2 text-[11px] text-slate-750 font-sans">
                              {Object.entries(up.updateData).map(([key, val]) => (
                                <p key={key}>
                                  <strong>{key}:</strong> {Array.isArray(val) ? val.join(', ') : String(val)}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {up.status === 'pending' && (
                          <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-3">
                            <button
                              disabled={actionLoading[up.id]}
                              onClick={() => handleUpdateAction(up.id, 'reject')}
                              className="bg-white border border-rose-205 text-rose-700 hover:bg-rose-50 font-bold px-4 py-2 rounded-xl cursor-pointer"
                            >
                              Reject Revision
                            </button>
                            <button
                              disabled={actionLoading[up.id]}
                              onClick={() => handleUpdateAction(up.id, 'approve')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              {actionLoading[up.id] && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              Approve & Merge Changes
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* INQUIRIES TAB */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <div className="bg-slate-50 text-slate-400 rounded-2xl p-8 text-center text-xs">
                  No traveler inquiries logged in network records.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden divide-y divide-slate-100">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded text-[8px] uppercase">
                            Property: {getHomestayLabel(inq.homestayId)}
                          </span>
                          <span className={`text-[8px] font-extrabold border px-2 py-0.5 rounded-full capitalize ${getStatusColor(inq.inquiryStatus)}`}>
                            {inq.inquiryStatus}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-900">{inq.userName}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-450 mt-1 font-mono">
                          <span>📧 {inq.userEmail}</span>
                          <span>📞 {inq.userMobile}</span>
                          <span>📅 {inq.travelDate || 'Flexible'}</span>
                          <span>👤 Guests: {inq.numberOfGuests}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-sans">
                          "{inq.message}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ONBOARDING APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Partner Onboarding requests */}
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight mb-3">
                  💼 Partner Onboarding Requests ({pendingPartners.length})
                </h3>
                {pendingPartners.length === 0 ? (
                  <div className="bg-slate-50 text-slate-400 rounded-2xl p-6 text-center text-xs border border-slate-150">
                    No pending partner applications.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPartners.map((partner) => (
                      <div key={partner.id} className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                          <div className="space-y-2">
                            <span className="bg-orange-150 text-orange-850 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase">
                              {partner.businessType || 'Homestay'} Partner Application
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-800">{partner.businessName}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">Applicant name</span>
                                <span className="font-extrabold text-slate-700">{partner.name}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">E-mail</span>
                                <span className="font-mono text-slate-600">{partner.email}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">Contact Mobile</span>
                                <span className="font-mono text-slate-600">{partner.partnerMobile || partner.mobile || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold font-semibold">Location / Region</span>
                                <span className="font-bold text-slate-700">{partner.partnerLocation || 'N/A'}</span>
                              </div>
                            </div>
                            {partner.partnerDocuments && (
                              <div className="text-xs bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-150">
                                <span className="text-[9px] text-emerald-800 uppercase font-black block">Supported Identification / Licensing Docs</span>
                                <span className="font-mono text-emerald-700 font-bold">{partner.partnerDocuments}</span>
                              </div>
                            )}
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 shadow-3xs w-full md:max-w-xs text-left">
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Administrative Remarks</label>
                            <textarea
                              placeholder="Add review remarks or grounds for approval/rejection..."
                              value={remarks[partner.id] || ''}
                              onChange={(e) => setRemarks({ ...remarks, [partner.id]: e.target.value })}
                              className="w-full bg-white border border-slate-205 rounded-lg p-2 mb-3 h-14"
                            />
                            <div className="flex gap-2">
                              <button
                                disabled={actionLoading[partner.id]}
                                onClick={() => handleResolveApplication(partner.id, 'partner', 'reject')}
                                className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold py-2 rounded-lg cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                disabled={actionLoading[partner.id]}
                                onClick={() => handleResolveApplication(partner.id, 'partner', 'approve')}
                                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1"
                              >
                                {actionLoading[partner.id] && <Loader2 className="w-3 h-3 animate-spin" />}
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contributor Onboarding requests */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 tracking-tight mb-3">
                  ✍️ Contributor Onboarding Requests ({pendingContributors.length})
                </h3>
                {pendingContributors.length === 0 ? (
                  <div className="bg-slate-50 text-slate-400 rounded-2xl p-6 text-center text-xs border border-slate-150">
                    No pending contributor applications.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingContributors.map((contrib) => (
                      <div key={contrib.id} className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                          <div className="space-y-2 flex-grow">
                            <span className="bg-violet-100 text-violet-850 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase">
                              Local Guide Contributor Application
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-800">{contrib.name}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">Email address</span>
                                <span className="font-mono text-slate-600">{contrib.email}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">Mobile number</span>
                                <span className="font-mono text-slate-600">{contrib.mobile || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">Region of interest</span>
                                <span className="font-extrabold text-slate-700">{contrib.contributorRegion || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="space-y-1 bg-slate-50/55 p-3 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-600">
                                <strong>Experience Level:</strong> {contrib.contributorExperience || 'N/A'}
                              </p>
                              <p className="text-xs text-slate-600 italic">
                                <strong>Motivation/Reason:</strong> "{contrib.contributorReason || 'N/A'}"
                              </p>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 shadow-3xs w-full md:max-w-xs text-left shrink-0">
                            <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Administrative Remarks</label>
                            <textarea
                              placeholder="Add review remarks..."
                              value={remarks[contrib.id] || ''}
                              onChange={(e) => setRemarks({ ...remarks, [contrib.id]: e.target.value })}
                              className="w-full bg-white border border-slate-205 rounded-lg p-2 mb-3 h-14"
                            />
                            <div className="flex gap-2">
                              <button
                                disabled={actionLoading[contrib.id]}
                                onClick={() => handleResolveApplication(contrib.id, 'contributor', 'reject')}
                                className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold py-2 rounded-lg cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                disabled={actionLoading[contrib.id]}
                                onClick={() => handleResolveApplication(contrib.id, 'contributor', 'approve')}
                                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1"
                              >
                                {actionLoading[contrib.id] && <Loader2 className="w-3 h-3 animate-spin" />}
                                Approve
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
<<<<<<< HEAD

              {/* Taxi Operator Onboarding requests */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                  <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                    🚕 Taxi Operator Onboarding & Verification ({taxiOperators.length})
                  </h3>
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-[10px]">
                    <span className="px-2 py-0.5 rounded-lg font-bold bg-amber-500 text-white">Pending: {taxiOperators.filter(o => o.taxiOperatorStatus === 'pending').length}</span>
                    <span className="px-2 py-0.5 rounded-lg font-bold bg-emerald-500 text-white">Verified: {taxiOperators.filter(o => o.taxiOperatorStatus === 'verified').length}</span>
                  </div>
                </div>

                {taxiOperators.length === 0 ? (
                  <div className="bg-slate-50 text-slate-400 rounded-2xl p-6 text-center text-xs border border-slate-150">
                    No taxi operator applications or profiles found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {taxiOperators.map((operator) => {
                      const details = operator.taxiOperatorDetails || {};
                      const docs = details.documents || {};
                      const status = operator.taxiOperatorStatus || 'draft';
                      
                      let badgeColor = "bg-slate-100 text-slate-800 border-slate-200";
                      if (status === 'pending') badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
                      if (status === 'verified') badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse";
                      if (status === 'rejected') badgeColor = "bg-rose-100 text-rose-800 border-rose-200";
                      if (status === 'suspended') badgeColor = "bg-slate-900 text-slate-100 border-slate-950";

                      return (
                        <div key={operator.id} className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs hover:border-amber-350 transition-all">
                          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                            
                            {/* Details Left */}
                            <div className="space-y-2 flex-grow">
                              <div className="flex items-center gap-2">
                                <span className="bg-amber-105 text-amber-900 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase">
                                  Taxi Operator Hub
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                                  ● {status}
                                </span>
                              </div>

                              <h4 className="font-extrabold text-sm text-slate-800">{details.businessName || 'Unnamed Agency'}</h4>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
                                <div>
                                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Owner Registered</span>
                                  <span className="font-extrabold text-slate-700">{details.ownerName || operator.name || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Registered E-mail</span>
                                  <span className="font-mono text-slate-600 break-all">{operator.email}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Contact Mobile</span>
                                  <span className="font-mono text-slate-600">{details.mobileNumber || operator.mobile || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Hub Station / Region</span>
                                  <span className="font-bold text-slate-700">{details.primaryTaxiStand || 'N/A'} ({details.district || 'N/A'}, {details.state || 'N/A'})</span>
                                </div>
                              </div>

                              {details.businessDescription && (
                                <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 font-sans">
                                  "{details.businessDescription}"
                                </p>
                              )}

                              {/* Uploaded Documents List */}
                              <div className="space-y-1.5 pt-1 font-sans">
                                <span className="text-[9px] text-slate-400 block uppercase font-bold">Uploaded Support Documents</span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {docs.ownerIdProof ? (
                                    <a href={docs.ownerIdProof} target="_blank" rel="noreferrer" className="bg-emerald-50 border border-emerald-150 p-2 rounded-lg text-emerald-800 hover:bg-emerald-100 transition-all font-bold text-[10px] block text-center">
                                      ✓ Owner ID Proof
                                    </a>
                                  ) : (
                                    <span className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-slate-400 text-[10px] block text-center">
                                      ✗ No Owner ID
                                    </span>
                                  )}

                                  {docs.addressProof ? (
                                    <a href={docs.addressProof} target="_blank" rel="noreferrer" className="bg-emerald-50 border border-emerald-150 p-2 rounded-lg text-emerald-800 hover:bg-emerald-100 transition-all font-bold text-[10px] block text-center">
                                      ✓ Address Proof
                                    </a>
                                  ) : (
                                    <span className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-slate-400 text-[10px] block text-center">
                                      ✗ No Address Proof
                                    </span>
                                  )}

                                  {docs.businessRegistration ? (
                                    <a href={docs.businessRegistration} target="_blank" rel="noreferrer" className="bg-emerald-50 border border-emerald-150 p-2 rounded-lg text-emerald-800 hover:bg-emerald-100 transition-all font-bold text-[10px] block text-center">
                                      ✓ Biz Registration
                                    </a>
                                  ) : (
                                    <span className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-slate-400 text-[10px] block text-center">
                                      ✗ No Biz Reg
                                    </span>
                                  )}

                                  {docs.taxiPermit ? (
                                    <a href={docs.taxiPermit} target="_blank" rel="noreferrer" className="bg-emerald-50 border border-emerald-150 p-2 rounded-lg text-emerald-800 hover:bg-emerald-100 transition-all font-bold text-[10px] block text-center">
                                      ✓ Taxi Permit
                                    </a>
                                  ) : (
                                    <span className="bg-slate-50 border border-slate-150 p-2 rounded-lg text-slate-400 text-[10px] block text-center">
                                      ✗ No Permit
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Administration Action Panel Right */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 shadow-3xs w-full md:max-w-xs text-left shrink-0 font-sans">
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Onboarding Review Remarks</label>
                              <textarea
                                placeholder="Add review remarks or grounds for status change..."
                                value={remarks[operator.id] || ''}
                                onChange={(e) => setRemarks({ ...remarks, [operator.id]: e.target.value })}
                                className="w-full bg-white border border-slate-205 rounded-lg p-2 mb-3 h-14 text-xs font-semibold focus:outline-amber-500 animate-none"
                              />
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <button
                                    disabled={actionLoading[operator.id]}
                                    onClick={() => handleResolveTaxiOperator(operator.id, 'reject')}
                                    className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold py-2 rounded-lg cursor-pointer text-xs"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    disabled={actionLoading[operator.id]}
                                    onClick={() => handleResolveTaxiOperator(operator.id, 'approve')}
                                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1 text-xs"
                                  >
                                    {actionLoading[operator.id] && <Loader2 className="w-3 h-3 animate-spin" />}
                                    Approve
                                  </button>
                                </div>
                                {status === 'verified' && (
                                  <button
                                    disabled={actionLoading[operator.id]}
                                    onClick={() => handleResolveTaxiOperator(operator.id, 'suspend')}
                                    className="w-full bg-slate-800 text-white hover:bg-slate-900 font-bold py-1.5 rounded-lg cursor-pointer text-[11px]"
                                  >
                                    Suspend Account
                                  </button>
                                )}
                                {status === 'suspended' && (
                                  <button
                                    disabled={actionLoading[operator.id]}
                                    onClick={() => handleResolveTaxiOperator(operator.id, 'restore')}
                                    className="w-full bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold py-1.5 rounded-lg cursor-pointer text-[11px]"
                                  >
                                    Restore Account
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOOKINGS & JOURNEYS TAB */}
          {activeTab === 'bookings' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEADS LIST SIDE (Left, 5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                  <h3 className="font-extrabold text-slate-900 tracking-tight mb-3 flex items-center gap-1.5">
                    🎛️ Filter Leads Queue
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Lead Type</label>
                      <select
                        value={leadsTypeFilter}
                        onChange={(e: any) => setLeadsTypeFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-700 text-xs"
                      >
                        <option value="all">All Types</option>
                        <option value="homestay">🏡 Homestays</option>
                        <option value="taxi">🚕 Taxi Drivers</option>
                        <option value="planner">🗺️ Trip Planners</option>
                        <option value="guide">🥾 Tour Guides</option>
                        <option value="activity">🧗 Sports & Activities</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Status Code</label>
                      <select
                        value={leadsFilter}
                        onChange={(e: any) => setLeadsFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-700 text-xs"
                      >
                        <option value="all">All Statuses</option>
                        <option value="new">🆕 New / Pending</option>
                        <option value="accepted">✔️ Accepted</option>
                        <option value="confirmed">💰 Confirmed</option>
                        <option value="completed">🎉 Completed</option>
                        <option value="cancelled_or_rejected">❌ Cancelled / Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Queue list */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {bookingLeads
                    .filter(lead => {
                      if (leadsTypeFilter !== 'all' && lead.leadType !== leadsTypeFilter) return false;
                      if (leadsFilter !== 'all') {
                        if (leadsFilter === 'cancelled_or_rejected') {
                          return lead.status === 'cancelled' || lead.status === 'rejected';
                        }
                        return lead.status === leadsFilter;
                      }
                      return true;
                    })
                    .map(lead => {
                      const isSelected = selectedLead?.id === lead.id;
                      return (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setLeadActionNotes('');
                            setReassigningLeadId(null);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-emerald-50/50 border-emerald-500 shadow-3xs ring-1 ring-emerald-500/20'
                              : 'bg-white border-slate-150 hover:bg-slate-50 shadow-4xs'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="font-mono text-[9px] font-extrabold tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-750">
                              #{lead.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-800 text-sm mb-1">{lead.customerName}</h4>
                          <p className="text-[10px] text-slate-450 flex items-center gap-1.5 mb-2 font-medium">
                            <span>
                              {lead.leadType === 'homestay' ? '🏡 Homestay Stay' : lead.leadType === 'taxi' ? '🚕 Alpine Cab Ride' : '🗺️ Guided Tour'}
                            </span>
                            <span>•</span>
                            <span>Guests: {lead.numberOfGuests}</span>
                          </p>

                          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
                            <span>📅 {lead.checkInDate ? new Date(lead.checkInDate).toLocaleDateString() : 'No Date'}</span>
                            <span className="bg-slate-50 px-2 py-0.5 rounded text-[9px] text-slate-450 font-bold max-w-[150px] truncate">
                              👤 {lead.assignedPartnerName || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {bookingLeads.filter(lead => {
                    if (leadsTypeFilter !== 'all' && lead.leadType !== leadsTypeFilter) return false;
                    if (leadsFilter !== 'all') {
                      if (leadsFilter === 'cancelled_or_rejected') {
                        return lead.status === 'cancelled' || lead.status === 'rejected';
                      }
                      return lead.status === leadsFilter;
                    }
                    return true;
                  }).length === 0 && (
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-8 text-center text-slate-400">
                      No matching booking leads found in queue.
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION & DETAILS PANEL (Right, 7 cols) */}
              <div className="lg:col-span-7">
                {selectedLead ? (
                  <div className="bg-white border border-slate-150 rounded-2xl shadow-3xs overflow-hidden text-left">
                    {/* Header bar */}
                    <div className="bg-slate-50 border-b border-slate-150 p-4 flex justify-between items-center">
                      <div>
                        <span className="bg-emerald-100 text-emerald-850 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono mr-2">
                          {selectedLead.leadType} Booking
                        </span>
                        <span className="font-mono text-slate-700 font-extrabold">#{selectedLead.id}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                    </div>

                    <div className="p-5 space-y-6">
                      {/* Customer Info Card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Traveler Customer</span>
                          <span className="font-extrabold text-slate-800 text-sm block">{selectedLead.customerName}</span>
                          <span className="font-mono text-xs text-slate-500 block">{selectedLead.customerEmail || 'No email provided'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Phone / WhatsApp</span>
                          {selectedLead.contactRevealed ? (
                            <span className="font-mono text-xs font-bold text-slate-800 bg-emerald-100/40 border border-emerald-150 px-2 py-0.5 rounded block w-fit">
                              📞 {selectedLead.customerMobile}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono text-xs text-slate-405">★★★★★{selectedLead.customerMobile.slice(-4)}</span>
                              <button
                                onClick={async () => {
                                  const updated = { ...selectedLead, contactRevealed: true };
                                  const res = await fetch('/api/admin/data/booking_leads', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'x-admin-password': 'admin123',
                                      'x-admin-email': adminEmail
                                    },
                                    body: JSON.stringify(updated)
                                  });
                                  if (res.ok) {
                                    setSelectedLead(updated);
                                    await fetchData();
                                  }
                                }}
                                className="bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 cursor-pointer"
                              >
                                👁️ Reveal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Travel Details Grid */}
                      <div>
                        <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                          📅 Trip Specifications
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white border border-slate-150 p-4 rounded-xl">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-405 block">Check-In / Departure</span>
                            <span className="font-bold text-slate-700 text-xs">
                              {selectedLead.checkInDate ? new Date(selectedLead.checkInDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-405 block">Check-Out / Return</span>
                            <span className="font-bold text-slate-700 text-xs">
                              {selectedLead.checkOutDate ? new Date(selectedLead.checkOutDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-405 block">Travelers Count</span>
                            <span className="font-bold text-slate-700 text-xs">{selectedLead.numberOfGuests} Guests</span>
                          </div>
                          {selectedLead.numberOfRooms && (
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-405 block">Rooms Allocated</span>
                              <span className="font-bold text-slate-700 text-xs">{selectedLead.numberOfRooms} Rooms</span>
                            </div>
                          )}
                          {selectedLead.pickupLocation && (
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-405 block">Route Pick Up</span>
                              <span className="font-bold text-slate-700 text-xs truncate max-w-[150px] block">{selectedLead.pickupLocation}</span>
                            </div>
                          )}
                          {selectedLead.dropLocation && (
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-405 block">Route Drop Off</span>
                              <span className="font-bold text-slate-700 text-xs truncate max-w-[150px] block">{selectedLead.dropLocation}</span>
                            </div>
                          )}
                        </div>

                        {selectedLead.specialRequest && (
                          <div className="mt-3 bg-indigo-50/50 border border-indigo-150 p-3 rounded-xl text-indigo-900 text-xs font-medium">
                            <span className="text-[9px] uppercase text-indigo-800 font-bold block mb-0.5">Special Requests or Instructions</span>
                            "{selectedLead.specialRequest}"
                          </div>
                        )}
                      </div>

                      {/* Partner Assignment Controls */}
                      <div className="border border-slate-150 rounded-xl p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider block mb-0.5">
                              👤 Assigned Operator Partner
                            </h4>
                            <span className="font-bold text-slate-600 font-mono text-xs">
                              {selectedLead.assignedPartnerName || 'No Partner Assigned'} ({selectedLead.assignedPartnerId || 'Direct HillyTrip Routing'})
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {reassigningLeadId === selectedLead.id ? (
                              <div className="flex gap-1.5 items-center">
                                <select
                                  value={selectedPartnerId}
                                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                                  className="bg-white border border-slate-300 rounded-lg p-1.5 font-bold text-xs"
                                >
                                  <option value="">-- Choose Partner --</option>
                                  {users
                                    .filter(u => u.roles?.includes('partner') || u.role === 'partner')
                                    .map(u => (
                                      <option key={u.id} value={u.email || u.id}>
                                        {u.name || u.email} ({u.email})
                                      </option>
                                    ))}
                                </select>
                                <button
                                  disabled={isReassigning || !selectedPartnerId}
                                  onClick={() => handleReassignPartner(selectedLead.id, selectedPartnerId)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setReassigningLeadId(null)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setReassigningLeadId(selectedLead.id);
                                    setSelectedPartnerId(selectedLead.assignedPartnerId || '');
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                >
                                  🔄 Reassign Partner
                                </button>
                                {selectedLead.assignedPartnerId && selectedLead.status === 'new' && (
                                  <button
                                    onClick={() => handleTriggerPartnerReminder(selectedLead)}
                                    className="bg-amber-50 hover:bg-amber-100 text-amber-850 border border-amber-200 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                  >
                                    🔔 Send Reminder Alert
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Override Controller Form */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl">
                        <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-3">
                          🛠️ Admin Override Status & Action Log
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Trigger State Event</label>
                              <div className="flex gap-1.5 flex-wrap">
                                <button
                                  disabled={isLeadActionSubmitting}
                                  onClick={() => handleUpdateBookingStatus(selectedLead.id, 'accept', leadActionNotes || 'Override accept by HillyTrip Admin.')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Accept & Reveal Info
                                </button>
                                <button
                                  disabled={isLeadActionSubmitting}
                                  onClick={() => handleUpdateBookingStatus(selectedLead.id, 'confirm', leadActionNotes || 'Confirmed by HillyTrip Admin.')}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Confirm Stays
                                </button>
                                <button
                                  disabled={isLeadActionSubmitting}
                                  onClick={() => handleUpdateBookingStatus(selectedLead.id, 'complete', leadActionNotes || 'Completed by HillyTrip Admin.')}
                                  className="bg-slate-800 hover:bg-slate-950 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Complete Journey
                                </button>
                                <button
                                  disabled={isLeadActionSubmitting}
                                  onClick={() => handleUpdateBookingStatus(selectedLead.id, 'cancel', leadActionNotes || 'Cancelled by HillyTrip Admin.')}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer"
                                >
                                  Cancel / Expire
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Action Note / Remark</label>
                              <textarea
                                value={leadActionNotes}
                                onChange={(e) => setLeadActionNotes(e.target.value)}
                                placeholder="Add administrative notes regarding this status change..."
                                className="w-full bg-white border border-slate-205 rounded-lg p-2 h-14 text-xs font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status History & Audit Trail */}
                      <div className="border-t border-slate-100 pt-5 space-y-4">
                        <div>
                          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            ⏳ Status Transition History
                          </h4>
                          {bookingStatusHistories.filter(h => h.leadId === selectedLead.id).length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No transition logs registered for this lead yet.</p>
                          ) : (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3 max-h-36 overflow-y-auto">
                              {bookingStatusHistories
                                .filter(h => h.leadId === selectedLead.id)
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map(h => (
                                  <div key={h.id} className="text-[10px] flex items-start gap-2.5 font-mono">
                                    <span className="text-slate-400 font-bold shrink-0">{new Date(h.createdAt).toLocaleTimeString()}</span>
                                    <div className="flex-1">
                                      <p className="font-bold text-slate-700">
                                        Transition: <span className="bg-slate-200 px-1 py-0.2 rounded text-[9px]">{h.oldStatus || 'NONE'}</span> → <span className="bg-emerald-100 text-emerald-850 px-1 py-0.2 rounded text-[9px]">{h.newStatus}</span>
                                      </p>
                                      {h.note && <p className="text-slate-500 italic font-sans mt-0.5">"{h.note}"</p>}
                                    </div>
                                    <span className="text-[9px] uppercase bg-slate-200/60 px-1.5 py-0.2 rounded font-bold">{h.changedBy}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            📋 Activity Logs & Operations Trail
                          </h4>
                          {bookingActivityLogs.filter(l => l.leadId === selectedLead.id).length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No operations trail logs registered for this lead yet.</p>
                          ) : (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3 max-h-36 overflow-y-auto">
                              {bookingActivityLogs
                                .filter(l => l.leadId === selectedLead.id)
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map(l => (
                                  <div key={l.id} className="text-[10px] flex items-start gap-2.5 font-mono">
                                    <span className="text-slate-400 font-bold shrink-0">{new Date(l.createdAt).toLocaleTimeString()}</span>
                                    <div className="flex-1">
                                      <p className="font-bold text-slate-700">
                                        Type: <span className="bg-indigo-100 text-indigo-850 px-1 py-0.2 rounded text-[9px]">{l.activityType}</span>
                                      </p>
                                      <p className="text-slate-600 font-sans mt-0.5">{l.description}</p>
                                    </div>
                                    <span className="text-[9px] uppercase bg-slate-200/60 px-1.5 py-0.2 rounded font-bold">BY: {l.performedBy}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-150 border-dashed rounded-2xl p-24 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                    <div className="bg-white p-4 rounded-full border border-slate-100 shadow-4xs mb-3 text-2xl">
                      🗂️
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm mb-1">No Booking Selected</h3>
                    <p className="text-slate-455 max-w-xs text-[11px]">Select any booking lead from the queue on the left to override parameters, manage status states, or assign partner operators.</p>
                  </div>
                )}
              </div>
=======
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
            </div>
          )}

          {/* AUDIT LOG TRAIL */}
          {activeTab === 'ownership-history' && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="bg-slate-50 text-slate-400 rounded-2xl p-8 text-center text-xs">
                  No ownership transfer trail history logged yet.
                </div>
              ) : (
                <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-150">
                  {history.map((h) => (
                    <div key={h.id} className="p-4 text-xs">
                      <div className="flex justify-between items-center mb-1.5 font-mono text-[10px] text-slate-450">
                        <span className="font-extrabold bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded uppercase">History ID: {h.id}</span>
                        <span>Approved: {new Date(h.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="font-black text-slate-900 mb-1">
                        🏠 Property: {getHomestayLabel(h.homestayId)}
                      </p>
                      <div className="bg-slate-50 p-2.5 rounded-lg inline-block w-full border border-slate-100 font-mono text-[10px] text-slate-600 mt-1 space-y-1">
                        <p>⏮ Former Owner ID: <span className="font-extrabold text-slate-800">{h.previousOwnerId || 'HilliTrip Direct System'}</span></p>
                        <p>⏭ New Managed Owner ID: <span className="font-extrabold text-emerald-700">{h.newOwnerId}</span></p>
                        <p>🔑 Active Registrar Approver: <span className="font-extrabold text-slate-800">{h.approvedByAdminId}</span></p>
                        {h.reason && <p className="italic text-slate-500 font-sans mt-1">"{h.reason}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
