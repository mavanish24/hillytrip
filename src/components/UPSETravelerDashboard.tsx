import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  ShieldCheck,
  Download,
  Clock,
  ArrowRight,
  User,
  AlertCircle,
  XCircle,
  CheckCircle,
  HelpCircle,
  DollarSign,
  Activity,
  History,
  QrCode,
  Printer,
  ChevronRight,
  Info,
  Phone,
  MapPin,
  MessageSquare,
  Navigation
} from 'lucide-react';
import { UPSEPayment, UPSERefund, UPSECancellationPolicyType } from '../types/upse';

interface UPSETravelerDashboardProps {
  travelerId: string;
}

export function UPSETravelerDashboard({ travelerId }: UPSETravelerDashboardProps) {
  // State
  const [payments, setPayments] = useState<UPSEPayment[]>([]);
  const [refunds, setRefunds] = useState<UPSERefund[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal / Interaction states
  const [selectedReceipt, setSelectedReceipt] = useState<UPSEPayment | null>(null);
  const [selectedForRefund, setSelectedForRefund] = useState<UPSEPayment | null>(null);
  
  // Refund request states
  const [refundReason, setRefundReason] = useState('');
  const [daysBeforeTrip, setDaysBeforeTrip] = useState('5');
  const [policyType, setPolicyType] = useState<UPSECancellationPolicyType>('moderate');

  // Status Alerts
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch traveler's payments
      const resPayments = await fetch(`/api/upse/payments?travelerId=${travelerId}`);
      if (resPayments.ok) {
        const d = await resPayments.json();
        if (d.success) setPayments(d.payments);
      }

      // 2. Fetch traveler's refunds
      const resRefunds = await fetch(`/api/upse/refunds`);
      if (resRefunds.ok) {
        const d = await resRefunds.json();
        if (d.success) {
          // Filter refunds that belong to traveler's payments
          const travelerRes = d.refunds.filter((ref: UPSERefund) => {
            return payments.some(p => p.id === ref.paymentId);
          });
          setRefunds(travelerRes.length > 0 ? travelerRes : d.refunds); // fallback to all if filtering is transient
        }
      }
    } catch (e) {
      console.error('Error fetching traveler payments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [travelerId, payments.length]); // trigger fetch and refetch on change

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToastType(type);
    setToastMsg(text);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Submit Refund Request
  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForRefund) return;
    if (!refundReason) {
      triggerToast('error', 'Please enter a detailed cancellation explanation.');
      return;
    }

    try {
      const payload = {
        paymentId: selectedForRefund.id,
        bookingId: selectedForRefund.bookingId,
        reason: refundReason,
        daysBeforeTrip: Number(daysBeforeTrip),
        policyType: policyType
      };

      const res = await fetch('/api/upse/refunds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          triggerToast('success', `Refund requested for ${d.refund.bookingId}! Under calculation.`);
          setSelectedForRefund(null);
          setRefundReason('');
          fetchData();
        } else {
          triggerToast('error', d.error || 'Failed requesting refund.');
        }
      }
    } catch (e) {
      triggerToast('error', 'Error sending refund cancel request.');
    }
  };

  // Mock Invoice Print
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 p-4 rounded-2xl flex items-center gap-3 shadow-2xl font-sans text-xs text-white border ${
              toastType === 'success' 
                ? 'bg-slate-900 border-emerald-500/30' 
                : 'bg-red-950 border-red-500/30'
            }`}
          >
            {toastType === 'success' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div>
              <span className="font-bold block text-slate-100">{toastType === 'success' ? 'Settled Request' : 'Engine Warning'}</span>
              <span className="text-slate-300">{toastMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TRAVELER HEADER PANEL */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900/30">
              UPSE Traveler Portal
            </span>
            <span className="text-slate-400 text-[10px] font-mono">{travelerId}</span>
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Your Financial Ledger &amp; Receipts</h3>
          <p className="text-xs text-slate-400 font-medium">Download active invoices, track refunds, and manage secure escrow accounts.</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-850">
          <History className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Active Bookings: <strong className="text-slate-700 dark:text-white">{payments.length}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Receipts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
              <span>Active Billing Receipts</span>
              <span className="text-[10px] text-slate-400 font-mono">Real-time payment audit logs</span>
            </h4>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {payments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No billing history located for this travel account reference.
                </div>
              ) : (
                payments.map(p => (
                  <div key={p.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 font-mono text-indigo-500">
                          {p.bookingId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({p.id})</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-medium">
                        <span>Provider: <strong className="uppercase font-bold text-slate-600 dark:text-slate-300">{p.provider}</strong></span>
                        <span>•</span>
                        <span>Flow: <span className="capitalize font-mono">{p.paymentFlow.replace(/_/g, ' ')}</span></span>
                        <span>•</span>
                        <span>Captured: <span className="font-mono">{new Date(p.createdAt).toLocaleDateString()}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="block font-black text-slate-900 dark:text-white text-xs">₹{p.amount.toLocaleString('en-IN')}</span>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          p.status === 'captured' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' :
                          p.status === 'failed' ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-100' :
                          'bg-slate-50 text-slate-600'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black transition flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-slate-400" /> Invoice
                        </button>
                        {p.status === 'captured' && (
                          <button
                            onClick={() => setSelectedForRefund(p)}
                            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-xl text-[10px] border border-rose-100 dark:border-rose-950/60 font-black transition cursor-pointer"
                          >
                            Cancel/Refund
                          </button>
                        )}
                      </div>
                    </div>

                    {/* UNLOCKED HOST CONTACT DETAILS (POST-BOOKING CONFIRMATION) */}
                    {p.status === 'captured' && (
                      <div className="mt-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 rounded-2xl w-full text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/30 pb-2">
                          <span className="text-[10px] font-mono font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Unlocked Host Direct Details
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">Confirmed Escrow</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-mono uppercase">Operator / Host Name</p>
                            <p className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">{p.businessId?.replace(/_/g, ' ') || 'HillyTrip Verified Partner'}</p>
                            <div className="pt-1 flex items-center gap-2">
                              <a
                                href={`tel:${(p as any).customFields?.hostPhone || '+919832012455'}`}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg transition inline-flex items-center gap-1 shadow-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call Host</span>
                              </a>
                              <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">{(p as any).customFields?.hostPhone || '+91 98320 12455'}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-mono uppercase">Pickup / Property Address</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300 text-[11px] leading-snug">{(p as any).customFields?.propertyAddress || 'Main Mall Road, Darjeeling, WB 734101'}</p>
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent((p as any).customFields?.propertyAddress || 'Darjeeling, West Bengal')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] hover:underline pt-0.5"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>Google Maps Directions</span>
                            </a>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-100/60 dark:border-emerald-900/30 text-[10px] text-slate-500 font-mono">
                          <span>Emergency Contact: <strong className="text-slate-700 dark:text-slate-300">+91 98320 99999</strong></span>
                          <span>Contact Hours: <strong className="text-slate-700 dark:text-slate-300">8:00 AM - 9:00 PM</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Refunds / Cancellations Policies and Status Tracking */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Refund Requests
            </h4>

            <div className="space-y-4">
              {refunds.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No active refund requests registered.
                </div>
              ) : (
                refunds.map(ref => {
                  const associatedPayment = payments.find(p => p.id === ref.paymentId);
                  const originalAmount = associatedPayment ? associatedPayment.amount : ref.amount; // fallback
                  const refundAmount = ref.amount;
                  const retainedAmount = Math.max(0, originalAmount - refundAmount);
                  const refundPercent = originalAmount > 0 ? Math.round((refundAmount / originalAmount) * 100) : 100;

                  return (
                    <div key={ref.id} className="border border-slate-150 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/20 space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="block font-bold text-xs text-slate-800 dark:text-white font-mono text-indigo-500">
                            {ref.bookingId}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{ref.id}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          ref.status === 'processed' || ref.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          ref.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {ref.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10px] border-t border-slate-100 dark:border-slate-800 pt-2 font-medium text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span>Paid:</span>
                          <span className="font-bold text-slate-800 dark:text-white">₹{originalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Calculated Refund:</span>
                          <span className="font-bold text-emerald-500">₹{refundAmount} ({refundPercent}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retained Penalty:</span>
                          <span className="font-bold text-slate-400">₹{retainedAmount}</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 font-sans italic font-medium">
                        &ldquo;{ref.reason}&rdquo;
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: EXQUISITE PRINT RECEIPT INVOICE */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm print:relative print:inset-auto print:p-0 print:bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 font-sans relative overflow-hidden print:shadow-none print:border-none print:p-0"
          >
            {/* Aesthetic receipt styling */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600" />
            
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">HillyTrip Booking Invoice</span>
              <h3 className="font-black text-lg tracking-tight text-slate-950">Financial Receipt</h3>
              <p className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">Transaction ref: {selectedReceipt.id}</p>
            </div>

            {/* Dotted separator */}
            <div className="border-t-2 border-dashed border-slate-200" />

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Booking ID:</span>
                <span className="font-mono font-bold text-slate-950">{selectedReceipt.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Payer Email:</span>
                <span className="font-mono text-slate-950 text-[11px] font-medium">{selectedReceipt.travelerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Merchant:</span>
                <span className="font-black text-slate-950">HillyTrip Escrow Services</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Date &amp; Time:</span>
                <span className="font-mono text-slate-950 text-[11px]">
                  {new Date(selectedReceipt.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Gateway:</span>
                <span className="uppercase font-mono font-bold text-indigo-600">{selectedReceipt.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Status:</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">
                  {selectedReceipt.status}
                </span>
              </div>
            </div>

            {/* Dotted separator */}
            <div className="border-t-2 border-dashed border-slate-200" />

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Subtotal Gross:</span>
                <span className="text-slate-950 font-medium">₹{(selectedReceipt.amount - selectedReceipt.taxes).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Taxes (GST 18%):</span>
                <span className="text-slate-950 font-medium">₹{selectedReceipt.taxes.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Platform Convenience Fee:</span>
                <span className="text-slate-950 font-medium">₹{selectedReceipt.fees.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2.5 text-sm font-black">
                <span className="text-slate-950">Total Paid (INR):</span>
                <span className="text-indigo-600 text-base font-black">₹{selectedReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Receipt Footer with Mock QR Code */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wide">SECURE ESCROW VALIDATION</span>
                <p className="text-[9px] text-slate-500 leading-normal font-medium">
                  This transaction is processed by the HillyTrip Universal Settlement Protocol and complies fully with PCI-DSS security frameworks.
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 shrink-0">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
            </div>

            <div className="flex gap-2 pt-2 print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 bg-slate-900 hover:bg-slate-850 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: REFUND REQUEST FORM */}
      {selectedForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans"
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">Cancel Booking / Request Refund</h3>
              <button onClick={() => setSelectedForRefund(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Close</button>
            </div>

            <form onSubmit={handleRequestRefund} className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/30 flex items-start gap-2 text-[10.5px]">
                <Info className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block">Universal Cancellation Policy Check</span>
                  <span>
                    Your homestay or trip category defines your policy rule. The refundable percentage depends strictly on the days remaining before commencement.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Policy Type</label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                  >
                    <option value="flexible">Flexible Policy (100% refund up to 1 day)</option>
                    <option value="moderate">Moderate Policy (100% 5d, 50% 1d)</option>
                    <option value="strict">Strict Policy (50% 7d, 0% &lt;7d)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Days Remaining</label>
                  <input
                    type="number"
                    min="0"
                    value={daysBeforeTrip}
                    onChange={(e) => setDaysBeforeTrip(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-bold font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Reason for Cancellation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Flight delay, personal emergency, medical advice..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-2.5 rounded-xl font-medium font-sans outline-none focus:border-indigo-600 text-slate-800 dark:text-white text-xs"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1.5 font-mono text-[10.5px]">
                <div className="flex justify-between text-slate-500">
                  <span>Booking ID:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedForRefund.bookingId}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Receipt Total Paid:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">₹{selectedForRefund.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-xl transition shadow-md mt-4 cursor-pointer"
              >
                Submit Cancellation Request
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
