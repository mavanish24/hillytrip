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
import { ClaimRequest, Inquiry, OwnershipHistory, PendingUpdate, Homestay } from '../types';

interface AdminPartnerManagementTabProps {
  adminEmail: string;
}

export default function AdminPartnerManagementTab({ adminEmail }: AdminPartnerManagementTabProps) {
  const [activeTab, setActiveTab] = useState<'claims' | 'updates' | 'applications' | 'inquiries' | 'ownership-history'>('claims');
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [updates, setUpdates] = useState<PendingUpdate[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [history, setHistory] = useState<OwnershipHistory[]>([]);
  const [dbHomestays, setDbHomestays] = useState<Homestay[]>([]);

  // Onboarding Applications State
  const [pendingPartners, setPendingPartners] = useState<any[]>([]);
  const [pendingContributors, setPendingContributors] = useState<any[]>([]);

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
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-2xl overflow-x-auto">
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
