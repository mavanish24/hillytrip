import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, RefreshCw, Search, Filter, CheckCircle2, 
  DollarSign, Percent, Clock, AlertTriangle, ArrowUpRight,
  ShieldCheck, FileText, XCircle, Check, Settings,
  Building2, Eye, EyeOff, UserCheck, AlertCircle, Calendar, Hash, CreditCard
} from 'lucide-react';

interface SettlementRecord {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  serviceName?: string;
  leadType?: string;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  bookingAmount: number;
  commissionRate: number;
  commissionAmount: number;
  ownerAmount: number;
  paymentId?: string;
  orderId?: string;
  paymentStatus?: string;
  settlementStatus: 'Pending' | 'Settled' | 'Refunded';
  settlementDate?: string;
  settlementUtr?: string;
  settlementMethod?: string;
  settlementAmount?: number;
  settlementNotes?: string;
  settledByAdminUserId?: string;
  refundedAmount?: number;
  isPartialRefund?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PayoutProfileRecord {
  id: string;
  ownerUserId: string;
  ownerEmail?: string;
  ownerName?: string;
  homestayId?: string;
  homestayTitle?: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  accountNumberMasked?: string;
  ifsc: string;
  upiId?: string;
  payoutDetailsStatus: 'NOT_SUBMITTED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedByAdminUserId?: string;
  createdAt: string;
  updatedAt: string;
}

interface SummaryData {
  totalVolume: number;
  totalCommission: number;
  totalOwnerPayouts: number;
  pendingCount: number;
  settledCount: number;
  refundedCount: number;
  pendingAmount: number;
  settledAmount: number;
}

interface BookingPaymentOpsTabProps {
  onRefresh: () => void;
}

export const BookingPaymentOpsTab: React.FC<BookingPaymentOpsTabProps> = ({ onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'pending' | 'settled' | 'payout_profiles'>('all');
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [payoutProfiles, setPayoutProfiles] = useState<PayoutProfileRecord[]>([]);
  const [profileStatusFilter, setProfileStatusFilter] = useState<'ALL' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'>('ALL');
  
  const [summary, setSummary] = useState<SummaryData>({
    totalVolume: 0,
    totalCommission: 0,
    totalOwnerPayouts: 0,
    pendingCount: 0,
    settledCount: 0,
    refundedCount: 0,
    pendingAmount: 0,
    settledAmount: 0
  });

  const [commissionRate, setCommissionRate] = useState<number>(10.0);
  const [editingRate, setEditingRate] = useState<string>('10.0');
  const [savingCommission, setSavingCommission] = useState<boolean>(false);
  const [commissionMessage, setCommissionMessage] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Settlement action modal
  const [selectedRecord, setSelectedRecord] = useState<SettlementRecord | null>(null);
  const [settlementAction, setSettlementAction] = useState<'Settled' | 'Refunded' | 'Pending'>('Settled');
  const [payoutMethod, setPayoutMethod] = useState<string>('NEFT');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutDate, setPayoutDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [settlementNotesInput, setSettlementNotesInput] = useState<string>('');
  const [settlementError, setSettlementError] = useState<string>('');
  const [isSubmittingSettlement, setIsSubmittingSettlement] = useState<boolean>(false);

  // Payout Profile Action States
  const [rejectingProfileId, setRejectingProfileId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [isProcessingProfile, setIsProcessingProfile] = useState<boolean>(false);
  const [revealedAccountIds, setRevealedAccountIds] = useState<Record<string, boolean>>({});

  // Fetch System Settings, Settlements, and Payout Profiles
  const fetchSettlementsData = async () => {
    setLoading(true);
    try {
      const [settleRes, settingsRes, profilesRes] = await Promise.all([
        fetch('/api/admin/settlements?password=admin123').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/system-settings').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/payout-profiles?password=admin123').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (settingsRes.success && settingsRes.settings) {
        const rate = settingsRes.settings.default_commission ?? 10.0;
        setCommissionRate(rate);
        setEditingRate(String(rate));
      }

      if (settleRes.success) {
        setSettlements(settleRes.settlements || []);
        if (settleRes.summary) {
          setSummary(settleRes.summary);
        }
      }

      if (profilesRes.success && Array.isArray(profilesRes.profiles)) {
        setPayoutProfiles(profilesRes.profiles);
      }
    } catch (e) {
      console.error('Failed to load settlements and payout profiles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlementsData();
  }, []);

  const handleRefresh = () => {
    fetchSettlementsData();
    onRefresh();
  };

  // Update System Commission Rate
  const handleSaveCommissionRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = Number(editingRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setCommissionMessage('Please enter a valid percentage between 0 and 100.');
      return;
    }

    setSavingCommission(true);
    setCommissionMessage('');
    try {
      const res = await fetch('/api/admin/system-settings?password=admin123', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_commission: rateNum })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCommissionRate(data.settings.default_commission);
        setCommissionMessage('✓ Commission rate updated in system settings!');
        setTimeout(() => setCommissionMessage(''), 4000);
        fetchSettlementsData();
      } else {
        setCommissionMessage(data.error || 'Failed to update commission rate.');
      }
    } catch (err: any) {
      setCommissionMessage('Error updating commission rate.');
    } finally {
      setSavingCommission(false);
    }
  };

  // Open Settlement Modal with prefilled values
  const handleOpenSettlementModal = (item: SettlementRecord) => {
    setSelectedRecord(item);
    setSettlementAction(item.settlementStatus === 'Pending' ? 'Settled' : item.settlementStatus);
    setPayoutMethod(item.settlementMethod || 'NEFT');
    setUtrNumber(item.settlementUtr || '');
    setPayoutAmount(item.settlementAmount || item.ownerAmount || 0);
    setPayoutDate(item.settlementDate ? item.settlementDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setSettlementNotesInput(item.settlementNotes || '');
    setSettlementError('');
  };

  // Submit Settlement
  const handleSubmitSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setSettlementError('');

    if (settlementAction === 'Settled') {
      if (!utrNumber.trim()) {
        setSettlementError('Bank UTR Number is required for marking a booking payout as Settled.');
        return;
      }
      if (!payoutAmount || payoutAmount <= 0) {
        setSettlementError('Payout amount must be greater than 0.');
        return;
      }

      setIsSubmittingSettlement(true);
      try {
        const res = await fetch(`/api/admin/settlements/${selectedRecord.id}/settle?password=admin123`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payoutMethod,
            utrNumber: utrNumber.trim(),
            payoutAmount,
            payoutDate,
            settlementNotes: settlementNotesInput.trim(),
            password: 'admin123'
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSelectedRecord(null);
          await fetchSettlementsData();
        } else {
          setSettlementError(data.error || 'Failed to settle booking payout.');
        }
      } catch (err: any) {
        setSettlementError(err.message || 'Error processing settlement.');
      } finally {
        setIsSubmittingSettlement(false);
      }
    } else {
      // Pending or Refunded status update
      setIsSubmittingSettlement(true);
      try {
        const res = await fetch(`/api/admin/settlements/${selectedRecord.id}/update?password=admin123`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settlementStatus: settlementAction,
            settlementNotes: settlementNotesInput.trim(),
            password: 'admin123'
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSelectedRecord(null);
          await fetchSettlementsData();
        } else {
          setSettlementError(data.error || 'Failed to update settlement record.');
        }
      } catch (err: any) {
        setSettlementError(err.message || 'Error updating settlement record.');
      } finally {
        setIsSubmittingSettlement(false);
      }
    }
  };

  // Verify Payout Profile
  const handleVerifyProfile = async (profileId: string) => {
    setIsProcessingProfile(true);
    try {
      const res = await fetch(`/api/admin/payout-profiles/${profileId}/verify?password=admin123`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'admin123' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchSettlementsData();
      } else {
        alert(data.error || 'Failed to verify payout profile.');
      }
    } catch (err: any) {
      alert(err.message || 'Error verifying profile.');
    } finally {
      setIsProcessingProfile(false);
    }
  };

  // Reject Payout Profile
  const handleRejectProfile = async (profileId: string) => {
    if (!rejectionReasonInput.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setIsProcessingProfile(true);
    try {
      const res = await fetch(`/api/admin/payout-profiles/${profileId}/reject?password=admin123`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReasonInput.trim(), password: 'admin123' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRejectingProfileId(null);
        setRejectionReasonInput('');
        await fetchSettlementsData();
      } else {
        alert(data.error || 'Failed to reject payout profile.');
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting profile.');
    } finally {
      setIsProcessingProfile(false);
    }
  };

  // Helper to find partner's profile
  const getPartnerProfile = (partnerId?: string, serviceName?: string): PayoutProfileRecord | undefined => {
    if (!partnerId && !serviceName) return undefined;
    return payoutProfiles.find(p => 
      (partnerId && (p.ownerUserId === partnerId || p.ownerEmail === partnerId)) ||
      (serviceName && (p.homestayId === serviceName || p.homestayTitle === serviceName))
    );
  };

  // Filter logic for bookings
  const filteredRecords = settlements.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      (item.id || '').toLowerCase().includes(query) ||
      (item.customerName || '').toLowerCase().includes(query) ||
      (item.assignedPartnerName || '').toLowerCase().includes(query) ||
      (item.serviceName || '').toLowerCase().includes(query) ||
      (item.paymentId || '').toLowerCase().includes(query) ||
      (item.orderId || '').toLowerCase().includes(query) ||
      (item.settlementUtr || '').toLowerCase().includes(query);

    if (activeSubTab === 'pending') {
      return matchesQuery && item.settlementStatus === 'Pending';
    }
    if (activeSubTab === 'settled') {
      return matchesQuery && (item.settlementStatus === 'Settled' || item.settlementStatus === 'Refunded');
    }
    return matchesQuery;
  });

  // Filter logic for payout profiles
  const filteredProfiles = payoutProfiles.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      (p.accountHolderName || '').toLowerCase().includes(query) ||
      (p.bankName || '').toLowerCase().includes(query) ||
      (p.ownerEmail || '').toLowerCase().includes(query) ||
      (p.ownerName || '').toLowerCase().includes(query) ||
      (p.homestayTitle || '').toLowerCase().includes(query) ||
      (p.ifsc || '').toLowerCase().includes(query);

    if (profileStatusFilter === 'ALL') return matchesQuery;
    return matchesQuery && p.payoutDetailsStatus === profileStatusFilter;
  });

  const pendingProfilesCount = payoutProfiles.filter(p => p.payoutDetailsStatus === 'PENDING_VERIFICATION').length;

  return (
    <div className="space-y-6">
      {/* Header Banner & Commission Setting Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-black text-white">Booking Settlements &amp; Owner Payout Desk</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Audit customer payments, verify partner bank accounts, and process secure manual settlements for confirmed homestay bookings.
          </p>
        </div>

        {/* Commission Percentage Control */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Percent className="w-3.5 h-3.5 text-indigo-400" />
              <span>System Commission Rate</span>
            </div>
            <p className="text-[10px] text-slate-500">Configured in system_settings (never hardcoded)</p>
          </div>

          <form onSubmit={handleSaveCommissionRate} className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={editingRate}
                onChange={(e) => setEditingRate(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-700 text-emerald-400 text-sm font-bold rounded-lg px-2 py-1.5 text-right focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-2 top-2 text-xs font-bold text-slate-500">%</span>
            </div>
            <button
              type="submit"
              disabled={savingCommission}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              {savingCommission ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Settings className="w-3 h-3" />}
              <span>Save</span>
            </button>
          </form>
        </div>
      </div>

      {commissionMessage && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          commissionMessage.startsWith('✓') ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
        }`}>
          <span>{commissionMessage}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Booking Volume</span>
            <span className="p-2 rounded-xl bg-slate-800 text-slate-300"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-black text-white mt-2">₹{summary.totalVolume.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">Gross paid customer bookings</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Platform Commission</span>
            <span className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800"><Percent className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">₹{summary.totalCommission.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">Platform earnings @ {commissionRate}%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pending Settlements</span>
            <span className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">₹{summary.pendingAmount.toLocaleString()}</div>
          <div className="text-[11px] text-amber-500/80 mt-1">{summary.pendingCount} bookings awaiting payout</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Settled Payouts</span>
            <span className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">₹{summary.settledAmount.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">{summary.settledCount} completed host settlements</div>
        </div>
      </div>

      {/* Main Subtab Controls & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Subtab Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Booking Payments ({settlements.length})
            </button>
            <button
              onClick={() => setActiveSubTab('pending')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>Pending Settlements</span>
              <span className="bg-amber-950 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-800/80">
                {summary.pendingCount}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('settled')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'settled'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Completed Settlements ({summary.settledCount})
            </button>
            <button
              onClick={() => setActiveSubTab('payout_profiles')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'payout_profiles'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Owner Payout Profiles</span>
              {pendingProfilesCount > 0 ? (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {pendingProfilesCount} pending
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-300 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {payoutProfiles.length}
                </span>
              )}
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={activeSubTab === 'payout_profiles' ? "Search owner, bank, IFSC..." : "Search booking ID, UTR, partner..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700"
              />
            </div>
            <button 
              onClick={handleRefresh}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. VIEW FOR BOOKING SETTLEMENTS */}
        {activeSubTab !== 'payout_profiles' && (
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Booking / Date</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Host / Operator</th>
                  <th className="px-4 py-3.5">Owner Payout Status</th>
                  <th className="px-4 py-3.5">Booking Amount</th>
                  <th className="px-4 py-3.5">Commission</th>
                  <th className="px-4 py-3.5">Net Payout</th>
                  <th className="px-4 py-3.5">Settlement Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                      Loading booking payment records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                      No booking records match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(item => {
                    const profile = getPartnerProfile(item.assignedPartnerId, item.serviceName);
                    const isProfileVerified = profile?.payoutDetailsStatus === 'VERIFIED';
                    const isSettled = item.settlementStatus === 'Settled';

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-mono font-bold text-indigo-400">{item.id}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 capitalize">{item.serviceName || item.leadType}</div>
                          {item.paymentId && (
                            <div className="text-[9px] font-mono text-emerald-500/80 mt-0.5">Pay: {item.paymentId}</div>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{item.customerName || 'Guest Customer'}</div>
                          <div className="text-[10px] text-slate-400">{item.customerEmail || '—'}</div>
                          <div className="text-[10px] text-slate-500">{item.customerMobile || '—'}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-emerald-400">{item.assignedPartnerName || 'Property Host'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{item.assignedPartnerId || 'partner_default'}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          {isProfileVerified ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                                <ShieldCheck className="w-3 h-3" />
                                Bank Verified
                              </span>
                              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{profile?.bankName}</div>
                            </div>
                          ) : profile?.payoutDetailsStatus === 'PENDING_VERIFICATION' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3" />
                              Review Pending
                            </span>
                          ) : profile?.payoutDetailsStatus === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-md">
                              <AlertCircle className="w-3 h-3" />
                              Bank Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              No Bank Details
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 font-bold text-white">
                          ₹{(item.bookingAmount || 0).toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-bold text-indigo-400">₹{(item.commissionAmount || 0).toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500">({item.commissionRate || commissionRate}%)</div>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-emerald-400">
                          ₹{(item.ownerAmount || 0).toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                              item.settlementStatus === 'Settled'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : item.settlementStatus === 'Refunded'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}>
                              {item.settlementStatus === 'Settled' && <CheckCircle2 className="w-3 h-3" />}
                              {item.settlementStatus === 'Pending' && <Clock className="w-3 h-3" />}
                              {item.settlementStatus === 'Refunded' && <XCircle className="w-3 h-3" />}
                              <span>{item.settlementStatus || 'Pending'}</span>
                            </span>

                            {item.settlementUtr && (
                              <div className="text-[10px] font-mono text-slate-400">
                                UTR: <strong className="text-slate-200">{item.settlementUtr}</strong>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleOpenSettlementModal(item)}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                              isSettled 
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                : isProfileVerified
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                                : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500'
                            }`}
                          >
                            {isSettled ? 'View / Edit' : 'Settle Payout'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. VIEW FOR OWNER PAYOUT PROFILES */}
        {activeSubTab === 'payout_profiles' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setProfileStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  profileStatusFilter === 'ALL' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Profiles ({payoutProfiles.length})
              </button>
              <button
                onClick={() => setProfileStatusFilter('PENDING_VERIFICATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  profileStatusFilter === 'PENDING_VERIFICATION' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-amber-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Verification ({pendingProfilesCount})</span>
              </button>
              <button
                onClick={() => setProfileStatusFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  profileStatusFilter === 'VERIFIED' ? 'bg-emerald-600 text-white font-black' : 'bg-slate-800 text-emerald-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified ({payoutProfiles.filter(p => p.payoutDetailsStatus === 'VERIFIED').length})</span>
              </button>
              <button
                onClick={() => setProfileStatusFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  profileStatusFilter === 'REJECTED' ? 'bg-rose-600 text-white font-black' : 'bg-slate-800 text-rose-400 hover:text-white'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rejected ({payoutProfiles.filter(p => p.payoutDetailsStatus === 'REJECTED').length})</span>
              </button>
            </div>

            {/* Profiles Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Owner / Homestay</th>
                    <th className="px-4 py-3.5">Bank &amp; Account Holder</th>
                    <th className="px-4 py-3.5">Account Number</th>
                    <th className="px-4 py-3.5">IFSC &amp; UPI</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Last Updated</th>
                    <th className="px-4 py-3.5 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                        Loading owner payout profiles...
                      </td>
                    </tr>
                  ) : filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        No owner payout profiles match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map(p => {
                      const isRevealed = !!revealedAccountIds[p.id];
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white">{p.ownerName || p.accountHolderName}</div>
                            <div className="text-[10px] text-slate-400">{p.ownerEmail}</div>
                            <div className="text-[10px] font-semibold text-emerald-400 mt-0.5">{p.homestayTitle || 'Homestay Owner'}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-200">{p.bankName}</div>
                            <div className="text-[10px] text-slate-400">A/C: {p.accountHolderName}</div>
                          </td>

                          <td className="px-4 py-3.5 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200 font-semibold">
                                {isRevealed ? p.accountNumber : (p.accountNumberMasked || `••••••••••••${p.accountNumber.slice(-4)}`)}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRevealedAccountIds(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                                className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                                title={isRevealed ? "Hide Account Number" : "Reveal Account Number for Transfer"}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-mono">
                            <div className="font-bold text-indigo-400">{p.ifsc}</div>
                            {p.upiId && <div className="text-[10px] font-sans text-slate-400 mt-0.5">{p.upiId}</div>}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                                p.payoutDetailsStatus === 'VERIFIED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : p.payoutDetailsStatus === 'PENDING_VERIFICATION'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}>
                                {p.payoutDetailsStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                                {p.payoutDetailsStatus === 'PENDING_VERIFICATION' && <Clock className="w-3 h-3" />}
                                {p.payoutDetailsStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                <span>{p.payoutDetailsStatus}</span>
                              </span>

                              {p.rejectionReason && (
                                <div className="text-[10px] text-rose-400 max-w-[180px] truncate" title={p.rejectionReason}>
                                  Reason: {p.rejectionReason}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-[11px] text-slate-400">
                            {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN') : 'Recent'}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {p.payoutDetailsStatus !== 'VERIFIED' && (
                                <button
                                  onClick={() => handleVerifyProfile(p.id)}
                                  disabled={isProcessingProfile}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Verify</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setRejectingProfileId(p.id);
                                  setRejectionReasonInput(p.rejectionReason || '');
                                }}
                                disabled={isProcessingProfile}
                                className="bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-800 transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* REJECT PROFILE MODAL */}
      {rejectingProfileId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>Reject Owner Payout Profile</span>
              </h3>
              <button
                onClick={() => setRejectingProfileId(null)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Provide a clear reason for rejecting the owner's bank details. The owner will see this notice and be prompted to re-submit corrected information.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. IFSC code mismatch with bank branch, Name does not match account holder..."
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingProfileId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectProfile(rejectingProfileId)}
                disabled={isProcessingProfile || !rejectionReasonInput.trim()}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessingProfile && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTLEMENT ACTION MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Execute Owner Payout Settlement</span>
                </h3>
                <p className="text-xs text-slate-400">Booking ID: <span className="font-mono text-indigo-400">{selectedRecord.id}</span></p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-500 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Partial refund notice if applicable */}
            {(selectedRecord.refundedAmount || selectedRecord.isPartialRefund) && (
              <div className="bg-amber-950/70 border border-amber-800 p-3 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Partial Refund Detected:</strong> Partial refund recalculation remains pending for this phase. Please verify the actual net settlement amount manually with banking records.
                </div>
              </div>
            )}

            {/* Payout Breakdown Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Booking Price:</span>
                <span className="font-bold text-white">₹{selectedRecord.bookingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">System Commission ({selectedRecord.commissionRate || commissionRate}%):</span>
                <span className="font-bold text-indigo-400">- ₹{selectedRecord.commissionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                <span className="font-bold text-slate-200">Net Owner Amount to Settle:</span>
                <span className="font-extrabold text-emerald-400">₹{selectedRecord.ownerAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Owner Bank Account Card */}
            {(() => {
              const partnerProf = getPartnerProfile(selectedRecord.assignedPartnerId, selectedRecord.serviceName);
              if (!partnerProf) {
                return (
                  <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>No Bank Payout Profile:</strong> The property owner ({selectedRecord.assignedPartnerName || selectedRecord.assignedPartnerId}) has not submitted bank details. Payout cannot be settled until verified.
                    </div>
                  </div>
                );
              }

              if (partnerProf.payoutDetailsStatus !== 'VERIFIED') {
                return (
                  <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Payout Profile Status: {partnerProf.payoutDetailsStatus}</strong>
                      <div className="text-[11px] text-amber-400/80 mt-0.5">
                        Please verify this partner's payout profile under the "Owner Payout Profiles" tab before executing settlement.
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-emerald-950/30 border border-emerald-800/50 p-3 rounded-xl text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-400 border-b border-emerald-900/40 pb-1.5 mb-1.5">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Owner Bank Details
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">VERIFIED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-500">Bank:</span> {partnerProf.bankName}</div>
                    <div><span className="text-slate-500">A/C Name:</span> {partnerProf.accountHolderName}</div>
                    <div><span className="text-slate-500">A/C No:</span> {partnerProf.accountNumber}</div>
                    <div><span className="text-slate-500">IFSC:</span> {partnerProf.ifsc}</div>
                    {partnerProf.upiId && <div className="col-span-2"><span className="text-slate-500">UPI:</span> {partnerProf.upiId}</div>}
                  </div>
                </div>
              );
            })()}

            {settlementError && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{settlementError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSettlement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Settlement Status Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlementAction('Settled')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      settlementAction === 'Settled'
                        ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Settled
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementAction('Pending')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      settlementAction === 'Pending'
                        ? 'bg-amber-950 border-amber-600 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementAction('Refunded')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      settlementAction === 'Refunded'
                        ? 'bg-rose-950 border-rose-600 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Refunded
                  </button>
                </div>
              </div>

              {settlementAction === 'Settled' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Payout Method *</label>
                      <select
                        value={payoutMethod}
                        onChange={(e) => setPayoutMethod(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="NEFT">NEFT (National Electronic Funds)</option>
                        <option value="RTGS">RTGS (Real Time Gross Settlement)</option>
                        <option value="IMPS">IMPS (Immediate Payment)</option>
                        <option value="UPI">UPI Transfer</option>
                        <option value="Manual Bank Transfer">Manual Bank Transfer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Bank UTR / Reference No. *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. UTR123456789012"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Actual Payout Amount (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedRecord.ownerAmount}
                        required
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Payout Execution Date *</label>
                      <input
                        type="date"
                        required
                        value={payoutDate}
                        onChange={(e) => setPayoutDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Settlement Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={settlementNotesInput}
                  onChange={(e) => setSettlementNotesInput(e.target.value)}
                  placeholder="Additional transfer notes, reference IDs, or notes for records..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSettlement}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingSettlement && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Settlement Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
