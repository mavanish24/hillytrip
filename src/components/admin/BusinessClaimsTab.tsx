import React, { useState } from 'react';
import { 
  Building2, CheckCircle2, XCircle, ShieldAlert, FileText, 
  ExternalLink, Clock, AlertTriangle, Eye, RefreshCw, AlertCircle
} from 'lucide-react';
import { ManagedBusiness, BusinessClaimRequest } from '../../types/admin';

interface BusinessClaimsTabProps {
  businesses: ManagedBusiness[];
  claims: BusinessClaimRequest[];
  onUpdateBizStatus: (bizId: string, status: ManagedBusiness['status']) => void;
  onReviewClaim: (claimId: string, status: BusinessClaimRequest['status'], notes?: string) => void;
  onRefresh: () => void;
}

export const BusinessClaimsTab: React.FC<BusinessClaimsTabProps> = ({
  businesses,
  claims,
  onUpdateBizStatus,
  onReviewClaim,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'businesses' | 'claims'>('businesses');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [claimStatusFilter, setClaimStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedClaim, setSelectedClaim] = useState<BusinessClaimRequest | null>(null);
  const [rejectModalClaim, setRejectModalClaim] = useState<BusinessClaimRequest | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredBusinesses = businesses.filter(b => {
    if (typeFilter !== 'all' && b.type !== typeFilter) return false;
    return true;
  });

  const filteredClaims = claims.filter(c => {
    if (claimStatusFilter === 'all') return true;
    if (claimStatusFilter === 'pending') return c.status === 'pending';
    if (claimStatusFilter === 'approved') return c.status === 'approved' || (c.status as string) === 'instant_verified';
    if (claimStatusFilter === 'rejected') return c.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Business Management & Listing Claims
          </h2>
          <p className="text-xs text-slate-400">Review homestay, taxi operator & merchant approvals, verify trade license documents and process claims.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('businesses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'businesses' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Listings ({businesses.length})
            </button>
            <button
              onClick={() => setActiveSubTab('claims')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'claims' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Claims Queue ({claims.filter(c => c.status === 'pending').length})
            </button>
          </div>

          <button 
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Tab 1: Businesses Directory */}
      {activeSubTab === 'businesses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Registered Business Directory</h3>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Business Types</option>
              <option value="homestay">Homestays</option>
              <option value="taxi_operator">Taxi Operators</option>
              <option value="restaurant">Restaurants & Bistros</option>
              <option value="guide">Tour Guides</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Business Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Owner Details</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No registered business listings found.</td>
                  </tr>
                ) : (
                  filteredBusinesses.map(biz => (
                    <tr key={biz.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-white">
                        {biz.name}
                        {biz.isFeatured && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Featured
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="capitalize font-semibold text-indigo-400">{biz.type.replace('_', ' ')}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {biz.ownerName}
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {biz.district}, {biz.state}
                      </td>

                      <td className="px-4 py-3">
                        {biz.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Approved
                          </span>
                        )}
                        {biz.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending Approval
                          </span>
                        )}
                        {biz.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right space-x-2">
                        {biz.status !== 'approved' && (
                          <button
                            onClick={() => onUpdateBizStatus(biz.id, 'approved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-semibold cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {biz.status !== 'rejected' && (
                          <button
                            onClick={() => onUpdateBizStatus(biz.id, 'rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Claims Review Queue */}
      {activeSubTab === 'claims' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Claim Ownership Submissions
            </h3>

            {/* Claim Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => {
                const count = status === 'all' 
                  ? claims.length 
                  : status === 'approved' 
                    ? claims.filter(c => c.status === 'approved' || (c.status as string) === 'instant_verified').length
                    : claims.filter(c => c.status === status).length;
                return (
                  <button
                    key={status}
                    onClick={() => setClaimStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      claimStatusFilter === status
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {status} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {filteredClaims.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 p-8 text-center text-xs text-slate-500 rounded-xl">
                No claims match the selected filter ({claimStatusFilter}).
              </div>
            ) : (
              filteredClaims.map(claim => {
                const listingIdentifier = (claim as any).listingId || (claim as any).homestayId || claim.businessId || 'Unknown Listing';
                const isPending = claim.status === 'pending';
                const isApproved = claim.status === 'approved' || (claim.status as string) === 'instant_verified';
                const isRejected = claim.status === 'rejected';

                return (
                  <div key={claim.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{claim.businessName || (claim as any).listingName || 'Listing Claim'}</h4>
                          <span className="text-[10px] font-mono bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800">
                            Listing ID: {listingIdentifier}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Claimant: <span className="text-slate-200 font-semibold">{claim.claimantName || (claim as any).ownerName || 'Unknown'}</span>
                          {claim.claimantEmail && ` (${claim.claimantEmail}`}
                          {claim.claimantPhone && ` • ${claim.claimantPhone})`}
                        </p>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isRejected
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        Status: {claim.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-slate-500">Document Type:</span>{' '}
                        <span className="font-bold uppercase text-indigo-400">
                          {String(claim.documentType || (claim as any).ownershipProofType || 'Ownership Proof').replace(/_/g, ' ')}
                        </span>
                      </div>

                      {claim.documentUrl && (
                        <a 
                          href={claim.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          Inspect Uploaded Proof <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {claim.notes && (
                      <p className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 font-semibold">Claim Remarks / Notes:</span> {claim.notes}
                      </p>
                    )}

                    {isApproved && (
                      <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-800/40 p-2.5 rounded-lg flex items-center justify-between">
                        <span>✓ Verified & Approved — Listing ownership assigned to partner.</span>
                        {claim.submittedAt && (
                          <span className="text-slate-500 text-[10px]">{new Date(claim.submittedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}

                    {isRejected && (
                      <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-800/40 p-2.5 rounded-lg">
                        ✕ Rejected by Admin. Reason: {claim.notes || 'Verification failed.'}
                      </div>
                    )}

                    {isPending && (
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          disabled={isProcessing}
                          onClick={() => {
                            setRejectModalClaim(claim);
                            setRejectRemarks('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          Reject Claim
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to approve this claim for "${claim.businessName}" and grant listing ownership?`)) {
                              setIsProcessing(true);
                              try {
                                await onReviewClaim(claim.id, 'approved', 'Verified and approved by administrator.');
                              } finally {
                                setIsProcessing(false);
                              }
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-50"
                        >
                          {isProcessing ? 'Processing...' : 'Approve & Grant Listing Ownership'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Reject Remarks Modal */}
      {rejectModalClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Reject Business Claim
            </h3>

            <p className="text-xs text-slate-400">
              Provide a clear reason for rejecting the claim request for{' '}
              <strong className="text-slate-200">{rejectModalClaim.businessName}</strong>. This remark will be recorded in the audit log.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Rejection Reason / Admin Remarks</label>
              <textarea
                value={rejectRemarks}
                onChange={e => setRejectRemarks(e.target.value)}
                placeholder="e.g. Uploaded proof is illegible or does not match municipal registration..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setRejectModalClaim(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    await onReviewClaim(
                      rejectModalClaim.id,
                      'rejected',
                      rejectRemarks.trim() || 'Claim rejected: verification documentation insufficient or failed.'
                    );
                    setRejectModalClaim(null);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
