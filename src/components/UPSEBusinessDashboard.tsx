import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Download,
  Plus,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  HelpCircle,
  FileText,
  AlertCircle,
  User,
  Activity,
  CheckCircle,
  XCircle,
  ChevronRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { UPSEPayment, UPSEPayoutAccount, UPSESettlementRule, UPSELedgerEntry, UPSEPaymentProvider, UPSEPaymentFlow, UPSECancellationPolicyType } from '../types/upse';

interface UPSEBusinessDashboardProps {
  businessId: string;
  businessName: string;
}

export function UPSEBusinessDashboard({ businessId, businessName }: UPSEBusinessDashboardProps) {
  // States
  const [payments, setPayments] = useState<UPSEPayment[]>([]);
  const [ledger, setLedger] = useState<UPSELedgerEntry[]>([]);
  const [rule, setRule] = useState<UPSESettlementRule | null>(null);
  const [accounts, setAccounts] = useState<UPSEPayoutAccount[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modals & UI States
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showConfigureSettle, setShowConfigureSettle] = useState(false);
  const [showSandboxSim, setShowSandboxSim] = useState(false);
  const [payoutRunning, setPayoutRunning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form States - New Payout Account
  const [newAccName, setNewAccName] = useState('');
  const [newAccNum, setNewAccNum] = useState('');
  const [newAccIfsc, setNewAccIfsc] = useState('');
  const [newAccHolder, setNewAccHolder] = useState(businessName);
  const [newAccType, setNewAccType] = useState<'bank' | 'upi'>('bank');
  const [newAccUpi, setNewAccUpi] = useState('');

  // Form States - Settle Configuration
  const [settleType, setSettleType] = useState<'instant' | 'scheduled' | 'manual' | 'weekly' | 'monthly'>('instant');
  const [settleAccount, setSettleAccount] = useState('');
  const [settleFreqDetail, setSettleFreqDetail] = useState('friday');

  // Form States - Sandbox Payment Generator
  const [simAmount, setSimAmount] = useState('6500');
  const [simProvider, setSimProvider] = useState<UPSEPaymentProvider>('stripe');
  const [simFlow, setSimFlow] = useState<UPSEPaymentFlow>('full');
  const [simCategory, setSimCategory] = useState('homestay');
  const [simCampaign, setSimCampaign] = useState('');
  const [simBookingId, setSimBookingId] = useState(() => 'B-' + Math.floor(1000 + Math.random() * 9000));
  const [simulatingStep, setSimulatingStep] = useState<'idle' | 'draft' | 'initiated' | 'authorized' | 'captured' | 'done'>('idle');
  const [simPaymentObj, setSimPaymentObj] = useState<UPSEPayment | null>(null);

  // Fetch all initial dashboard data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch payments for this business
      const resPayments = await fetch(`/api/upse/payments?businessId=${businessId}`);
      if (resPayments.ok) {
        const d = await resPayments.json();
        if (d.success) setPayments(d.payments);
      }

      // 2. Fetch ledger for this business
      const resLedger = await fetch(`/api/upse/ledger?businessId=${businessId}`);
      if (resLedger.ok) {
        const d = await resLedger.json();
        if (d.success) setLedger(d.ledger);
      }

      // 3. Fetch settlement rules & payout accounts
      const resSettle = await fetch(`/api/upse/settlements/rules/${businessId}`);
      if (resSettle.ok) {
        const d = await resSettle.json();
        if (d.success) {
          setRule(d.rule || null);
          setAccounts(d.accounts || []);
          if (d.rule) {
            setSettleType(d.rule.settlementType);
            setSettleAccount(d.rule.payoutBankAccountId);
            setSettleFreqDetail(d.rule.frequencyDetail || 'friday');
          }
        }
      }
    } catch (e) {
      console.error('Failed to load UPSE dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [businessId]);

  // Show temporary messages
  const triggerNotification = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // 1. Trigger Payout Sweep Run
  const handleRunPayoutSweep = async () => {
    setPayoutRunning(true);
    try {
      const res = await fetch('/api/upse/settlements/payouts/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          triggerNotification('success', `Settlement execution completed! Settle count: ${d.count}, Dispatched: INR ${d.totalAmount}`);
          fetchData();
        } else {
          triggerNotification('error', 'No eligible payments found to settle.');
        }
      }
    } catch (e) {
      triggerNotification('error', 'Failed to run payout process.');
    } finally {
      setPayoutRunning(false);
    }
  };

  // 2. Add Payout Account
  const handleAddPayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccType === 'bank' && (!newAccName || !newAccNum || !newAccIfsc)) {
      triggerNotification('error', 'Please fill out all bank credentials.');
      return;
    }
    if (newAccType === 'upi' && !newAccUpi) {
      triggerNotification('error', 'Please enter your UPI ID.');
      return;
    }

    try {
      const payload = {
        businessId,
        bankName: newAccType === 'bank' ? newAccName : 'UPI Virtual Account',
        accountNumber: newAccType === 'bank' ? newAccNum : '',
        routingNumberOrIfsc: newAccType === 'bank' ? newAccIfsc : '',
        accountHolderName: newAccHolder,
        isPrimary: accounts.length === 0, // Primary if first
        payoutType: newAccType,
        upiId: newAccType === 'upi' ? newAccUpi : undefined
      };

      const res = await fetch('/api/upse/settlements/payouts/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          triggerNotification('success', `Linked payout source ${d.account.upiId || d.account.bankName} successfully!`);
          setShowAddAccount(false);
          // Reset
          setNewAccName('');
          setNewAccNum('');
          setNewAccIfsc('');
          setNewAccUpi('');
          fetchData();
        }
      }
    } catch (e) {
      triggerNotification('error', 'Failure adding payout account details.');
    }
  };

  // 3. Configure Settlement Rule
  const handleConfigureSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleAccount) {
      triggerNotification('error', 'Please select a payout bank or UPI target.');
      return;
    }

    try {
      const payload = {
        businessId,
        settlementType: settleType,
        payoutBankAccountId: settleAccount,
        isEnabled: true,
        frequencyDetail: settleType === 'weekly' || settleType === 'monthly' ? settleFreqDetail : undefined
      };

      const res = await fetch('/api/upse/settlements/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          triggerNotification('success', `Settlement configured to ${settleType.toUpperCase()} frequency!`);
          setShowConfigureSettle(false);
          fetchData();
        }
      }
    } catch (e) {
      triggerNotification('error', 'Failure saving settlement frequency rule.');
    }
  };

  // 4. Sandbox Payment Simulation Loop (Draft -> Initiate -> Auth -> Capture)
  const handleRunSandboxSimulation = async () => {
    setSimulatingStep('draft');
    setSimBookingId('B-' + Math.floor(1000 + Math.random() * 9000));
    try {
      // Step A: Create payment draft
      const draftRes = await fetch('/api/upse/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: simBookingId,
          businessId,
          travelerId: `sandbox_traveler_${Math.floor(100 + Math.random()*900)}@hillytrip.com`,
          amount: Number(simAmount),
          currency: 'INR',
          provider: simProvider,
          paymentFlow: simFlow,
          metadata: {
            category: simCategory,
            campaignCode: simCampaign || undefined
          }
        })
      });

      if (!draftRes.ok) throw new Error('Failed creating draft');
      const draftData = await draftRes.json();
      setSimPaymentObj(draftData.payment);

      // Step B: Initiate
      setSimulatingStep('initiated');
      await new Promise(r => setTimeout(r, 1000));
      const initRes = await fetch(`/api/upse/payments/${draftData.payment.id}/initiate`, { method: 'POST' });
      if (!initRes.ok) throw new Error('Initiation failed');
      const initData = await initRes.json();
      setSimPaymentObj(initData.payment);

      // Step C: Authorize
      setSimulatingStep('authorized');
      await new Promise(r => setTimeout(r, 1000));
      const authRes = await fetch(`/api/upse/payments/${draftData.payment.id}/authorize`, { method: 'POST' });
      if (!authRes.ok) throw new Error('Authorization failed');
      const authData = await authRes.json();
      setSimPaymentObj(authData.payment);

      // Step D: Capture
      setSimulatingStep('captured');
      await new Promise(r => setTimeout(r, 1000));
      const capRes = await fetch(`/api/upse/payments/${draftData.payment.id}/capture`, { method: 'POST' });
      if (!capRes.ok) throw new Error('Capture failed');
      const capData = await capRes.json();
      setSimPaymentObj(capData.payment);

      setSimulatingStep('done');
      triggerNotification('success', `Sandbox simulated capture complete for ${simBookingId}!`);
      fetchData();
    } catch (e: any) {
      setSimulatingStep('idle');
      triggerNotification('error', `Sandbox error: ${e.message}`);
    }
  };

  // 5. Simulated financial reports download (CSV)
  const handleExportCSV = () => {
    let csv = 'PaymentID,BookingID,Amount,Taxes,Fees,Commission,SettlementAmount,Status,Provider,Flow,CreatedAt\n';
    payments.forEach(p => {
      csv += `${p.id},${p.bookingId},${p.amount},${p.taxes},${p.fees},${p.commission},${p.settlementAmount},${p.status},${p.provider},${p.paymentFlow},${p.createdAt}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upse_financial_report_${businessId}.csv`;
    a.click();
    triggerNotification('success', 'Financial ledger transaction report dispatched to local download queue.');
  };

  // Calculated totals for metrics panel
  const totalReceived = payments.filter(p => p.status === 'captured' || p.status === 'partially_captured').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSettled = ledger.filter(l => l.category === 'settlement').reduce((acc, curr) => acc + curr.amount, 0);
  const totalUnsettled = Math.max(0, payments.filter(p => p.status === 'captured').reduce((acc, curr) => acc + curr.settlementAmount, 0) - totalSettled);
  const averageCommission = payments.length > 0 ? Math.round(payments.reduce((acc, curr) => acc + curr.commission, 0) / payments.length) : 0;

  return (
    <div className="space-y-6">
      
      {/* Dynamic Toast / Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 border border-emerald-500/30 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl font-sans"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-emerald-400">UPSE System Notice</span>
              <span className="text-slate-300">{successMsg}</span>
            </div>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-red-950 border border-red-500/30 text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl font-sans"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold block text-red-400">UPSE Error Warning</span>
              <span className="text-slate-300">{errorMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. UPSE ENGINE INTRO HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-indigo-950 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-500/30">
              UPSE COMPLIANT
            </span>
            <span className="text-slate-400 text-[10px] font-mono">v1.4 Double-Entry Ledger</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
            Universal Payment &amp; Settlement Engine <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
          </h3>
          <p className="text-xs text-slate-300 leading-normal font-medium">
            Mountain tourism settlement protocol governing secure, provider-independent payment pipelines. Real-time payouts, category-based commissions, and strict immutable ledger audit trails.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setShowSandboxSim(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            Launch Sandbox Sim
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black px-4 py-2.5 rounded-xl transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Ledger
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC STATS PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-850 space-y-2 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Booking Receipts</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">₹{totalReceived.toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">INR</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Accumulated captured gross</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-850 space-y-2 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dispatched Settlements</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">₹{totalSettled.toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-mono text-blue-500 font-bold">PAID</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Payouts routed directly to account</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-850 space-y-2 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Awaiting Settlement</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">₹{totalUnsettled.toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-mono text-amber-500 font-bold">HELD</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">To be cleared on next scheduled cycle</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-150 dark:border-slate-850 space-y-2 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Comm Charge</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">₹{averageCommission.toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-mono text-indigo-500 font-bold">AVG</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">HillyTrip marketplace commission</p>
        </div>
      </div>

      {/* 3. SETTLEMENT TARGETS & SCHEDULER BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settlement rule control */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Settlement Rules
              </h4>
              <button
                onClick={() => setShowConfigureSettle(true)}
                className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-500"
              >
                Configure
              </button>
            </div>

            {rule ? (
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Rule Status:</span>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Type:</span>
                  <span className="font-black text-slate-800 dark:text-white uppercase font-mono tracking-wide">
                    {rule.settlementType}
                  </span>
                </div>
                {rule.frequencyDetail && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Scheduled On:</span>
                    <span className="font-bold text-slate-800 dark:text-white uppercase font-mono">
                      {rule.frequencyDetail}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Payout Route:</span>
                  <span className="font-mono text-indigo-500 font-bold truncate max-w-[150px]">
                    {rule.payoutBankAccountId}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                <p>No custom settlement rule configured yet.</p>
                <button
                  onClick={() => setShowConfigureSettle(true)}
                  className="bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[9px]"
                >
                  Setup Rule Now
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-2">
            <button
              onClick={handleRunPayoutSweep}
              disabled={payoutRunning || totalUnsettled === 0}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                totalUnsettled === 0 
                  ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${payoutRunning ? 'animate-spin' : ''}`} />
              {payoutRunning ? 'Dispatching...' : 'Execute Settlement Sweep'}
            </button>
            <p className="text-[9px] text-slate-400 text-center font-medium leading-normal">
              Manual trigger of the double-entry payout process. Settles eligible captured transactions immediately.
            </p>
          </div>
        </div>

        {/* Connected accounts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                Linked Payout Accounts
              </h4>
              <button
                onClick={() => setShowAddAccount(true)}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-[10px] font-black px-3 py-1 rounded-xl transition border border-slate-200 dark:border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Link Account
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3.5">
              {accounts.map(acc => (
                <div 
                  key={acc.id} 
                  className={`border p-4 rounded-2xl space-y-3 relative overflow-hidden flex flex-col justify-between ${
                    acc.isPrimary 
                      ? 'border-indigo-200 bg-indigo-50/10 dark:border-indigo-900/30' 
                      : 'border-slate-150 dark:border-slate-800 bg-slate-50/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {acc.payoutType === 'upi' ? 'UPI Handle' : 'Bank Account'}
                      </span>
                      {acc.isPrimary && (
                        <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-900/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <h5 className="font-black text-slate-850 dark:text-white text-xs truncate">
                      {acc.bankName || 'UPI Transfer'}
                    </h5>
                    <p className="text-[10px] font-mono text-slate-500 font-bold">
                      {acc.payoutType === 'upi' ? acc.upiId : `•••• •••• ${acc.accountNumber.slice(-4)}`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] font-mono font-medium text-slate-400">
                    <span className="truncate max-w-[120px]">{acc.accountHolderName}</span>
                    <span className="font-bold text-slate-500 uppercase">{acc.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 flex items-start gap-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 mt-4 font-medium leading-normal">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Banking references are stored in highly audited security vaults conformant to strict regional RTO escrow standards. Direct instant UPI payouts scheduled 24/7.
            </span>
          </div>
        </div>
      </div>

      {/* 4. IMMUTABLE FINANCIAL LEDGER LOGS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Double-Entry Financial Ledger
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Real-time system generated bookkeeping debit and credit metrics</p>
          </div>
          <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
            {ledger.length} entries active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                <th className="py-3 px-2 font-mono">Ledger ID</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Description</th>
                <th className="py-3 px-2 text-right">Amount</th>
                <th className="py-3 px-2 font-mono text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map(log => {
                const isCredit = log.type === 'credit';
                return (
                  <tr key={log.id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/20 text-slate-700 dark:text-slate-300">
                    <td className="py-3.5 px-2 font-mono text-[10px] font-bold text-slate-500">{log.id}</td>
                    <td className="py-3.5 px-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isCredit ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
                            Credit
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-rose-500" />
                            Debit
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-mono px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-medium max-w-sm truncate">{log.description}</td>
                    <td className={`py-3.5 px-2 text-right font-bold ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                      {isCredit ? '+' : '-'}₹{log.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-2 font-mono text-[10px] text-slate-400 text-center">
                      {new Date(log.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TRANSACTION MASTER LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <span>Captured Booking Payments &amp; Invoices</span>
          <span className="text-[10px] text-slate-400 font-mono">Provider Independent Log</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-black">
                <th className="py-3 px-2 font-mono">Payment ID</th>
                <th className="py-3 px-2">Booking ID</th>
                <th className="py-3 px-2">Provider</th>
                <th className="py-3 px-2">Flow</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Gross Amount</th>
                <th className="py-3 px-2 text-right">Platform Fee</th>
                <th className="py-3 px-2 text-right">Commission</th>
                <th className="py-3 px-2 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-850 hover:bg-slate-50/20 text-slate-700 dark:text-slate-300">
                  <td className="py-3.5 px-2 font-mono text-[10px] font-bold text-slate-500">{p.id}</td>
                  <td className="py-3.5 px-2 font-bold font-mono text-[10px] text-indigo-500">{p.bookingId}</td>
                  <td className="py-3.5 px-2 uppercase font-mono text-[10px] font-bold">{p.provider}</td>
                  <td className="py-3.5 px-2 text-[10px] capitalize font-medium">{p.paymentFlow.replace(/_/g, ' ')}</td>
                  <td className="py-3.5 px-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      p.status === 'captured' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200/50' :
                      p.status === 'refunded' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/50' :
                      p.status === 'failed' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50' :
                      p.status === 'authorized' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200/50' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50'
                    }`}>
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right font-black text-slate-800 dark:text-white">₹{p.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-2 text-right font-mono text-[10px] text-slate-400">₹{(p.fees + p.taxes).toFixed(0)}</td>
                  <td className="py-3.5 px-2 text-right font-mono text-[10px] text-rose-500 font-bold">₹{p.commission}</td>
                  <td className="py-3.5 px-2 text-right font-bold text-emerald-500">₹{p.settlementAmount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: LINK ACCOUNT */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">Link Settlement Account</h3>
              <button onClick={() => setShowAddAccount(false)} className="text-slate-400 hover:text-slate-600 text-xs">Close</button>
            </div>

            <form onSubmit={handleAddPayoutAccount} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAccType('bank')}
                    className={`py-2 rounded-xl border text-center font-bold font-sans transition ${
                      newAccType === 'bank' 
                        ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600' 
                        : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    Bank Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccType('upi')}
                    className={`py-2 rounded-xl border text-center font-bold font-sans transition ${
                      newAccType === 'upi' 
                        ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600' 
                        : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    UPI / VPA ID
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={newAccHolder}
                  onChange={(e) => setNewAccHolder(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                />
              </div>

              {newAccType === 'bank' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      value={newAccName}
                      onChange={(e) => setNewAccName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">Account Number</label>
                      <input
                        type="text"
                        placeholder="Numeric digits only"
                        value={newAccNum}
                        onChange={(e) => setNewAccNum(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. ICIC0000011"
                        value={newAccIfsc}
                        onChange={(e) => setNewAccIfsc(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">UPI Handle</label>
                  <input
                    type="text"
                    placeholder="e.g. business@okicici"
                    value={newAccUpi}
                    onChange={(e) => setNewAccUpi(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white text-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition shadow-md mt-4 cursor-pointer"
              >
                Confirm Link Authorization
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: CONFIGURE SETTLEMENT RULE */}
      {showConfigureSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">Settlement Configuration</h3>
              <button onClick={() => setShowConfigureSettle(false)} className="text-slate-400 hover:text-slate-600 text-xs">Close</button>
            </div>

            <form onSubmit={handleConfigureSettlement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Settlement Frequency</label>
                <select
                  value={settleType}
                  onChange={(e) => setSettleType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                >
                  <option value="instant">Instant Settlement (On payment capture)</option>
                  <option value="weekly">Weekly Settlement</option>
                  <option value="monthly">Monthly Settlement</option>
                  <option value="manual">Manual Request (Withdraw model)</option>
                </select>
              </div>

              {(settleType === 'weekly' || settleType === 'monthly') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Preferred Day / Date</label>
                  <input
                    type="text"
                    value={settleFreqDetail}
                    onChange={(e) => setSettleFreqDetail(e.target.value)}
                    placeholder={settleType === 'weekly' ? 'e.g. friday, monday' : 'e.g. 1st of month, 15th'}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Select Linked Target Account</label>
                <select
                  value={settleAccount}
                  onChange={(e) => setSettleAccount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                >
                  <option value="">-- Choose Account --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName || 'UPI'} ({acc.upiId || acc.accountNumber.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition shadow-md mt-4 cursor-pointer"
              >
                Save Operational Rule
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: SANDBOX TRANSACTION SIMULATOR */}
      {showSandboxSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 font-sans overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  UPSE Sandbox Sandbox Session
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Verify provider independence, webhooks, and ledger generation</p>
              </div>
              <button onClick={() => setShowSandboxSim(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Form factors */}
              <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[10px] font-black uppercase text-slate-400 block border-b border-slate-200 dark:border-slate-800 pb-1.5">Config parameters</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Total Amount (₹)</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-lg font-bold font-sans outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Provider</label>
                    <select
                      value={simProvider}
                      onChange={(e) => setSimProvider(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-lg font-bold"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="razorpay">Razorpay</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="cashfree">Cashfree</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Flow</label>
                    <select
                      value={simFlow}
                      onChange={(e) => setSimFlow(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-lg font-bold"
                    >
                      <option value="full">Full Payment</option>
                      <option value="advance">Advance</option>
                      <option value="partial">Partial</option>
                      <option value="pay_at_property">Pay on site</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Biz Category</label>
                    <select
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-lg font-bold"
                    >
                      <option value="homestay">Homestay</option>
                      <option value="taxi">Cab / Taxi</option>
                      <option value="guide">Travel Guide</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400">Promo Code</label>
                    <input
                      type="text"
                      placeholder="SUMMER26"
                      value={simCampaign}
                      onChange={(e) => setSimCampaign(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-2 rounded-lg font-mono text-[11px] font-bold uppercase"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunSandboxSimulation}
                  disabled={simulatingStep !== 'idle' && simulatingStep !== 'done'}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${simulatingStep !== 'idle' && simulatingStep !== 'done' ? 'animate-spin' : ''}`} />
                  Execute Sandbox Sequence
                </button>
              </div>

              {/* Simulation visual results logs */}
              <div className="space-y-3.5 bg-slate-900 text-slate-300 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 block border-b border-slate-800 pb-1.5">Simulation State Log</span>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold uppercase">{simulatingStep}</span>
                    </div>
                    {simPaymentObj && (
                      <>
                        <div className="flex justify-between">
                          <span>Payment ID:</span>
                          <span className="text-white">{simPaymentObj.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Booking ID:</span>
                          <span className="text-white">{simPaymentObj.bookingId}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1">
                          <span>Gross:</span>
                          <span className="text-white">₹{simPaymentObj.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commission:</span>
                          <span className="text-rose-400">₹{simPaymentObj.commission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes (18%):</span>
                          <span className="text-slate-400">₹{simPaymentObj.taxes}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1">
                          <span>Settlement:</span>
                          <span className="text-emerald-400 font-bold">₹{simPaymentObj.settlementAmount}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Real-time Hook dispatch</span>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${simulatingStep === 'done' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                    <span>
                      {simulatingStep === 'idle' && 'Awaiting trigger...'}
                      {simulatingStep === 'draft' && 'Initializing payload...'}
                      {simulatingStep === 'initiated' && 'Session active via REST...'}
                      {simulatingStep === 'authorized' && 'Authenticating webhook token...'}
                      {simulatingStep === 'captured' && 'Double-entry log updated!'}
                      {simulatingStep === 'done' && 'Ledger saved successfully.'}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
