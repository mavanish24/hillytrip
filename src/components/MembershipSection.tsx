import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  Calendar, 
  ArrowUpRight,
  RefreshCw,
  Building2
} from 'lucide-react';
import { Membership, MembershipPlan, User } from '../types';

interface MembershipSectionProps {
  user: User | null;
  businessId?: string;
  businessType?: string;
  businessName?: string;
  setNotification: (notif: { type: 'success' | 'error'; message: string } | null) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function MembershipSection({
  user,
  businessId = user?.email || 'partner',
  businessType = 'Homestay',
  businessName,
  setNotification
}: MembershipSectionProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [activeMembership, setActiveMembership] = useState<Membership | null>(null);
  const [membershipHistory, setMembershipHistory] = useState<Membership[]>([]);
  const [trialActive, setTrialActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Upgrade / Renew Modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Fetch plans, status & history
  const fetchMembershipData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Plans
      const plansRes = await fetch('/api/membership/plans');
      const plansJson = await plansRes.json();
      if (plansJson.success && Array.isArray(plansJson.plans)) {
        setPlans(plansJson.plans);
        if (plansJson.plans.length > 0) {
          setSelectedPlanId(plansJson.plans[0].id);
        }
      }

      // 2. Fetch Status
      const targetBizId = businessId || user?.email || 'partner';
      const statusRes = await fetch(`/api/membership/status/${encodeURIComponent(targetBizId)}`);
      const statusJson = await statusRes.json();
      if (statusJson.success) {
        setTrialActive(!!statusJson.trialActive);
        setActiveMembership(statusJson.activeMembership || null);
      }

      // 3. Fetch History
      const histRes = await fetch(`/api/membership/history/${encodeURIComponent(targetBizId)}?email=${encodeURIComponent(user?.email || '')}`);
      const histJson = await histRes.json();
      if (histJson.success && Array.isArray(histJson.history)) {
        setMembershipHistory(histJson.history);
      }
    } catch (err: any) {
      console.error('Failed to load membership data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipData();
  }, [businessId, user?.email]);

  // Load Razorpay SDK
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Determine current membership status string
  const getStatusType = (): 'FREE' | 'ACTIVE' | 'EXPIRED' => {
    if (!activeMembership) return 'FREE';
    const statusUpper = activeMembership.status.toUpperCase();
    if (statusUpper === 'ACTIVE') {
      // Check expiry date
      if (activeMembership.expires_at) {
        const expTime = new Date(activeMembership.expires_at).getTime();
        if (expTime < Date.now()) {
          return 'EXPIRED';
        }
      }
      return 'ACTIVE';
    }
    if (statusUpper === 'EXPIRED' || statusUpper === 'CANCELLED') {
      return 'EXPIRED';
    }
    return 'FREE';
  };

  const currentStatus = getStatusType();

  // Helper date functions
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return 0;
    const expTime = new Date(expiresAt).getTime();
    const diffMs = expTime - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  // Days remaining in membership
  const daysRemaining = activeMembership?.expires_at ? getDaysRemaining(activeMembership.expires_at) : 0;

  // Handle Payment via Razorpay
  const handleInitiatePayment = async () => {
    setIsProcessingPayment(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setNotification({
          type: 'error',
          message: 'Failed to load Razorpay checkout SDK. Please check your internet connection.'
        });
        setIsProcessingPayment(false);
        return;
      }

      const targetBizId = businessId || user?.email || 'partner';

      // 1. Create Razorpay order on server
      const res = await fetch('/api/membership/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: targetBizId,
          businessType: businessType || 'Homestay',
          planId: selectedPlanId,
          forcePayment: true
        })
      });

      const orderData = await res.json();

      if (!res.ok) {
        setNotification({
          type: 'error',
          message: orderData.error || 'Failed to create membership order.'
        });
        setIsProcessingPayment(false);
        return;
      }

      if (!orderData.paymentRequired) {
        setNotification({
          type: 'success',
          message: orderData.message || 'Free trial active. Access granted without payment.'
        });
        setCheckoutModalOpen(false);
        await fetchMembershipData();
        setIsProcessingPayment(false);
        return;
      }

      // 2. Open Razorpay Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'HillyTrip Membership',
        description: `Annual Subscription - ${orderData.plan?.businessType || 'Partner'} Plan`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#059669' // Emerald 600
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/membership/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                businessId: targetBizId,
                businessType: businessType || 'Homestay',
                planId: selectedPlanId
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setNotification({
                type: 'success',
                message: 'Membership activated successfully!'
              });
              setCheckoutModalOpen(false);
              await fetchMembershipData();
            } else {
              setNotification({
                type: 'error',
                message: verifyData.error || 'Payment verification failed.'
              });
            }
          } catch (err: any) {
            setNotification({
              type: 'error',
              message: 'Failed to verify payment with server.'
            });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setNotification({
          type: 'error',
          message: response.error?.description || 'Payment failed. Please try again.'
        });
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred during payment processing.'
      });
      setIsProcessingPayment(false);
    }
  };

  // Find plan label helper
  const getPlanName = (planId?: string) => {
    if (!planId) return 'FREE';
    const found = plans.find(p => p.id === planId);
    if (found) {
      return `₹${found.price} Plan`;
    }
    if (planId.includes('1999')) return '₹1999 Plan';
    if (planId.includes('999')) return '₹999 Plan';
    if (planId.includes('499')) return '₹499 Plan';
    return 'FREE';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-slate-500 text-xs font-mono">Loading Membership details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. FREE TRIAL BANNER (If Active) */}
      {trialActive && (
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 border border-emerald-700/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 text-emerald-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md font-mono border border-emerald-400/30">
                  Special Offer
                </span>
                <h3 className="font-extrabold text-sm text-white">Free Trial Active</h3>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1">
                Enjoy unlimited property listings & direct leads. No subscription charge required during promotional trial.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCheckoutModalOpen(true)}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            Explore Plans <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. MEMBERSHIP STATUS CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Current Membership</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {currentStatus === 'FREE' && 'FREE Plan'}
              {currentStatus === 'ACTIVE' && (activeMembership ? getPlanName(activeMembership.plan_id) : 'ACTIVE Membership')}
              {currentStatus === 'EXPIRED' && (activeMembership ? getPlanName(activeMembership.plan_id) : 'EXPIRED Membership')}
            </h2>
            {businessName && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Business: {businessName}
              </p>
            )}
          </div>

          {/* STATUS BADGES & ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            {currentStatus === 'FREE' && (
              <div className="flex items-center gap-3">
                <span className="bg-slate-100 text-slate-700 font-extrabold text-xs px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                  FREE
                </span>
                <button
                  onClick={() => setCheckoutModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  Upgrade Membership <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentStatus === 'ACTIVE' && (
              <div className="flex items-center gap-3">
                <span className="bg-emerald-50 text-emerald-800 font-extrabold text-xs px-3.5 py-1.5 rounded-lg border border-emerald-200 font-mono flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Membership Active
                </span>
                <button
                  onClick={() => setCheckoutModalOpen(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-4 py-2 rounded-xl transition-all border border-slate-300 cursor-pointer"
                >
                  Change Plan
                </button>
              </div>
            )}

            {currentStatus === 'EXPIRED' && (
              <div className="flex items-center gap-3">
                <span className="bg-rose-50 text-rose-800 font-extrabold text-xs px-3.5 py-1.5 rounded-lg border border-rose-200 font-mono flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" /> Membership Expired
                </span>
                <button
                  onClick={() => setCheckoutModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  Renew Membership <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider block mb-1">
              Membership Start Date
            </span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-extrabold text-slate-800">
                {activeMembership?.started_at ? formatDate(activeMembership.started_at) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider block mb-1">
              Membership Expiry Date
            </span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-extrabold text-slate-800">
                {activeMembership?.expires_at ? formatDate(activeMembership.expires_at) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider block mb-1">
              Days Remaining
            </span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-extrabold text-slate-900">
                {currentStatus === 'ACTIVE' ? `${daysRemaining} Days` : '0 Days'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MEMBERSHIP PLANS EXAMPLES */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-black text-slate-900">Available Membership Plans</h3>
          <p className="text-xs text-slate-500">Choose an annual subscription tier designed for your business capacity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* FREE PLAN */}
          <div className={`bg-white rounded-2xl p-5 border ${currentStatus === 'FREE' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'} shadow-2xs flex flex-col justify-between`}>
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase font-mono tracking-wider text-slate-500">FREE</span>
                {currentStatus === 'FREE' && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded font-mono">Current</span>
                )}
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">FREE</div>
              <p className="text-xs text-slate-500 mb-4">Basic listing access on HillyTrip marketplace</p>
              <ul className="text-xs text-slate-600 space-y-2 mb-6 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Standard Search Listing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Direct Customer Inquiries
                </li>
              </ul>
            </div>
            {currentStatus === 'FREE' ? (
              <div className="text-center text-xs font-extrabold text-slate-400 py-2 border border-slate-200 rounded-xl bg-slate-50">
                Active Tier
              </div>
            ) : (
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Select Tier
              </button>
            )}
          </div>

          {/* ₹499 PLAN */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase font-mono tracking-wider text-emerald-700">STARTER</span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">1–2 Capacity</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">₹499<span className="text-xs text-slate-400 font-normal">/year</span></div>
              <p className="text-xs text-slate-500 mb-4">Ideal for homestays with 1–2 rooms or single taxis</p>
              <ul className="text-xs text-slate-600 space-y-2 mb-6 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Verified Partner Badge
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Verified Booking Leads
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> 365 Days Validity
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                const p = plans.find(pl => pl.price === 499);
                if (p) setSelectedPlanId(p.id);
                setCheckoutModalOpen(true);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Choose ₹499 Plan
            </button>
          </div>

          {/* ₹999 PLAN */}
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-600 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg font-mono">
              POPULAR
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase font-mono tracking-wider text-emerald-800">STANDARD</span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">3–7 Capacity</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">₹999<span className="text-xs text-slate-400 font-normal">/year</span></div>
              <p className="text-xs text-slate-500 mb-4">For medium-sized homestays or fleet operators</p>
              <ul className="text-xs text-slate-600 space-y-2 mb-6 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Priority Booking Lead Dispatch
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Featured Property Badge
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Direct WhatsApp Routing
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                const p = plans.find(pl => pl.price === 999);
                if (p) setSelectedPlanId(p.id);
                setCheckoutModalOpen(true);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Choose ₹999 Plan
            </button>
          </div>

          {/* ₹1999 PLAN */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase font-mono tracking-wider text-emerald-700">PRO</span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">8+ Capacity</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">₹1999<span className="text-xs text-slate-400 font-normal">/year</span></div>
              <p className="text-xs text-slate-500 mb-4">For large resorts, hotels, or regional transport groups</p>
              <ul className="text-xs text-slate-600 space-y-2 mb-6 border-t border-slate-100 pt-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Unlimited Lead Captures
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Top Marketplace Placement
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Account Manager
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                const p = plans.find(pl => pl.price === 1999);
                if (p) setSelectedPlanId(p.id);
                setCheckoutModalOpen(true);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Choose ₹1999 Plan
            </button>
          </div>

        </div>
      </div>

      {/* 4. MEMBERSHIP HISTORY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">Membership History</h3>
            <p className="text-xs text-slate-500">Log of all subscription transactions and renewals (Newest first)</p>
          </div>
          <span className="text-xs font-mono font-extrabold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
            {membershipHistory.length} Records
          </span>
        </div>

        {membershipHistory.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No previous membership purchases recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6 font-bold">Plan</th>
                  <th className="py-3.5 px-6 font-bold">Amount</th>
                  <th className="py-3.5 px-6 font-bold">Purchase Date</th>
                  <th className="py-3.5 px-6 font-bold">Expiry Date</th>
                  <th className="py-3.5 px-6 font-bold">Payment Status</th>
                  <th className="py-3.5 px-6 font-bold">Payment ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {membershipHistory.map((item) => {
                  const statusUp = item.status.toUpperCase();
                  const isSuccess = statusUp === 'ACTIVE' || statusUp === 'SUCCESS' || statusUp === 'COMPLETED';
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-900">
                        {getPlanName(item.plan_id)}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900 font-mono">
                        ₹{item.price}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-mono">
                        {formatDate(item.started_at || item.created_at)}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-mono">
                        {formatDate(item.expires_at)}
                      </td>
                      <td className="py-4 px-6">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> ACTIVE / PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-black px-2.5 py-0.5 rounded-md border border-slate-200 font-mono">
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-500 text-[11px]">
                        {item.payment_id || item.order_id || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. CHECKOUT / UPGRADE MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Select Membership Plan</h3>
                <p className="text-xs text-slate-500">Secure Razorpay payment integration</p>
              </div>
            </div>

            <div className="space-y-3 my-6 max-h-60 overflow-y-auto pr-1">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <label
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {p.business_type} Tier (Capacity: {p.min_capacity}{p.max_capacity ? `–${p.max_capacity}` : '+'})
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5 font-mono">
                        Validity: {p.duration_days} Days
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 font-mono">₹{p.price}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">/ year</span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5 mb-6 font-mono">
              <div className="flex justify-between">
                <span>Business Type:</span>
                <span className="font-bold text-slate-900">{businessType}</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Plan Amount:</span>
                <span className="font-bold text-slate-900">
                  ₹{plans.find(p => p.id === selectedPlanId)?.price || 499}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gateway:</span>
                <span className="font-bold text-emerald-700">Razorpay (Cards, UPI, NetBanking)</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isProcessingPayment}
                onClick={handleInitiatePayment}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Proceed to Pay <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Check({ className }: { className?: string }) {
  return <CheckCircle className={className} />;
}
