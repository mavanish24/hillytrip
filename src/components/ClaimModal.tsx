import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Check,
  RefreshCw,
  Award,
  Upload,
  FileText,
  AlertCircle,
  FileCheck,
  ExternalLink,
  Info,
  Clock
} from 'lucide-react';
import { ClaimSource, ClaimPlatform, User } from '../types';
import { submitClaimRequest, savePendingClaim, getPendingClaim, clearPendingClaim } from '../lib/claimSystem';
import HillyTripLoginPage from './HillyTripLoginPage';

export interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    name: string;
    type?: string;
    location?: string;
    image?: string;
  } | null;
  currentUser?: User | null;
  claimSource?: ClaimSource;
  onSuccessNavigate?: (listingId: string) => void;
  setNotification?: (notif: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export function ClaimModal({
  isOpen,
  onClose,
  listing,
  currentUser,
  claimSource = 'Listing Page',
  onSuccessNavigate,
  setNotification
}: ClaimModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Contact Details, 2: Ownership Proof, 3: Under Review
  const [activeUser, setActiveUser] = useState<User | null>(currentUser || null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Form Fields
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [role, setRole] = useState<'Owner' | 'Manager' | 'Authorized Representative'>('Owner');
  const [documentType, setDocumentType] = useState<string>('trade_license');
  const [ownershipProof, setOwnershipProof] = useState<string>('');
  const [attachedFileName, setAttachedFileName] = useState<string>('');
  const [claimMessage, setClaimMessage] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update activeUser when currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      setActiveUser(currentUser);
    }
  }, [currentUser]);

  // Restore or reset modal state on open
  useEffect(() => {
    if (isOpen && listing) {
      const pending = getPendingClaim();
      const isMatchingPending = pending && pending.listingId === listing.id;

      setStep(1);
      setShowAuthModal(false);
      setIsSubmitting(false);

      if (isMatchingPending) {
        setOwnerName(pending.ownerName || currentUser?.name || '');
        setMobile(pending.mobile || currentUser?.mobile || '');
        setOwnerEmail(currentUser?.email || pending.email || '');
        setRole((pending.role as any) || 'Owner');
        setDocumentType(pending.documentType || 'trade_license');
        setOwnershipProof(pending.ownershipProof || '');
        setClaimMessage(pending.message || '');
      } else {
        setOwnerName(currentUser?.name || '');
        setMobile(currentUser?.mobile || '');
        setOwnerEmail(currentUser?.email || '');
        setRole('Owner');
        setDocumentType('trade_license');
        setOwnershipProof('');
        setAttachedFileName('');
        setClaimMessage('');
      }
    }
  }, [isOpen, listing, currentUser]);

  if (!isOpen || !listing) return null;

  const isAuthenticated = Boolean(
    activeUser && (activeUser.id || activeUser.email)
  );

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
      if (!ownershipProof.trim()) {
        setOwnershipProof(`Attached Document: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      }
    }
  };

  const handleSaveAndPromptAuth = () => {
    savePendingClaim({
      listingId: listing.id,
      listingName: listing.name,
      listingType: listing.type || 'Homestay',
      ownerName: ownerName.trim(),
      mobile: mobile.trim(),
      email: ownerEmail.trim(),
      role,
      documentType,
      ownershipProof: ownershipProof.trim(),
      message: claimMessage.trim(),
      claimSource
    });
    setShowAuthModal(true);
  };

  const handleNextToProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      if (setNotification) setNotification({ type: 'error', message: 'Please enter owner or manager name' });
      return;
    }
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      if (setNotification) setNotification({ type: 'error', message: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    // If not authenticated, require authentication before proceeding
    if (!isAuthenticated) {
      handleSaveAndPromptAuth();
      return;
    }

    setStep(2);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      if (setNotification) setNotification({ type: 'error', message: 'Please accept the verification terms' });
      return;
    }

    if (!ownershipProof.trim() && !attachedFileName) {
      if (setNotification) {
        setNotification({
          type: 'error',
          message: 'Please provide ownership documentation proof (registration number, link, or attached document)'
        });
      }
      return;
    }

    // Require authentication check
    if (!isAuthenticated) {
      handleSaveAndPromptAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      const proofPayload = attachedFileName && !ownershipProof.includes(attachedFileName)
        ? `${ownershipProof.trim()} [File: ${attachedFileName}]`
        : ownershipProof.trim();

      const result = await submitClaimRequest({
        listingId: listing.id,
        listingName: listing.name,
        listingType: listing.type || 'Homestay',
        ownerName: ownerName.trim(),
        mobile: mobile.trim(),
        whatsapp: mobile.trim(),
        email: activeUser?.email || ownerEmail.trim(),
        role,
        documentType,
        ownershipProof: proofPayload,
        message: claimMessage.trim() || `Ownership claim submitted for ${listing.name}`,
        claimSource
      });

      setSubmissionResult(result.claim);
      setIsSubmitting(false);
      setStep(3);

      if (setNotification) {
        setNotification({
          type: 'success',
          message: "Claim submitted successfully. Your ownership proof is under review. We'll notify you after verification."
        });
      }

      // Celebrate successful submission
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6']
        });
      } catch (e) {}
    } catch (err: any) {
      setIsSubmitting(false);
      if (setNotification) {
        setNotification({
          type: 'error',
          message: err.message || 'Failed to submit claim. Please try again or contact support.'
        });
      }
    }
  };

  const businessTypeName = listing.type || 'Business';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase font-mono tracking-wider text-amber-500 block">
                  HillyTrip Partner Program
                </span>
                <h3 className="text-sm font-extrabold text-white line-clamp-1">
                  Claim & Verify {businessTypeName}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Business Preview Banner */}
          <div className="bg-slate-850/60 p-4 border-b border-slate-800 flex items-center gap-3">
            <img
              src={listing.image || "https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png"}
              alt={listing.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-700/80 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-amber-500/30">
                  🟠 Unclaimed Listing
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {listing.id}</span>
              </div>
              <h4 className="text-sm font-black text-white line-clamp-1">{listing.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{listing.location || 'Himalayan Mountain Region'}</p>
            </div>
          </div>

          {/* Step Indicator */}
          {step < 3 && (
            <div className="px-6 pt-3 pb-2 flex items-center justify-between text-xs font-mono border-b border-slate-800/40">
              <span className={`flex items-center gap-1 font-bold ${step === 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                1. Contact & Owner
              </span>
              <span className="text-slate-600">•</span>
              <span className={`flex items-center gap-1 font-bold ${step === 2 ? 'text-amber-400' : 'text-slate-500'}`}>
                2. Ownership Proof
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 font-bold text-slate-500">
                3. Verification Review
              </span>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6">
            {/* STEP 1: OWNER & CONTACT DETAILS */}
            {step === 1 && (
              <form onSubmit={handleNextToProof} className="space-y-4">
                {/* Authentication Status Badge */}
                {isAuthenticated ? (
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-emerald-300 font-medium">
                        Authenticated as <strong className="text-white font-mono">{activeUser?.email || activeUser?.name}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Verified Account
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-amber-300 block mb-0.5">
                          Account Required for Ownership Verification
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          To protect listings against unauthorized claims, all ownership requests must be linked to a verified HillyTrip account.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveAndPromptAuth}
                      className="w-full mt-1 py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Sign In / Register with Google or Email
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">
                    Owner / Manager Full Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Pemba Tsering Sherpa"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-amber-500 transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">
                      Contact Phone (+91)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98000 00000"
                        className="w-full pl-11 pr-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">
                      Business / Notification Email
                    </label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="owner@homestay.com"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">
                    Your Relationship with Business
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="Owner">Primary Owner / Founder</option>
                    <option value="Manager">Property Manager / General Manager</option>
                    <option value="Authorized Representative">Authorized Family / Staff Member</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-sm font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Continue to Ownership Proof
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OWNERSHIP PROOF & DOCUMENTATION */}
            {step === 2 && (
              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Proof-Based Verification (Admin Review)
                  </span>
                  <p className="leading-relaxed">
                    Provide verifiable proof of ownership or management authority. Our review board examines documents before conferring verified ownership.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">
                    Document / Proof Category
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="trade_license">Homestay / Tourism Trade License or Certificate</option>
                    <option value="utility_bill">Electricity / Water / Internet Bill (Latest 3 Months)</option>
                    <option value="property_tax">Property Deed / Tax Receipt / Revenue Record</option>
                    <option value="owner_id">Government ID & Host Authorization Letterhead</option>
                    <option value="other">Other Official Registration Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">
                    Document URL or Registration / Certificate No.
                  </label>
                  <input
                    type="text"
                    value={ownershipProof}
                    onChange={(e) => setOwnershipProof(e.target.value)}
                    placeholder="e.g. License Reg #TR-2024-8891 or https://drive.google.com/..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition"
                    required={!attachedFileName}
                  />
                </div>

                {/* File Attachment Helper */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">
                    Attach Document File (Optional)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileAttach}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/40 rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-slate-400" />
                    {attachedFileName ? (
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" /> {attachedFileName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Click to attach file (PDF, PNG, JPG, DOC up to 10MB)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase font-mono mb-1.5">
                    Notes for Review Board
                  </label>
                  <textarea
                    rows={2}
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    placeholder="Brief description of the submitted proof or ownership background..."
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-xs text-slate-300 leading-tight cursor-pointer">
                    I declare that I am the authorized owner or manager of <strong>{listing.name}</strong> and that the submitted proof is genuine. I accept HillyTrip Verification Terms.
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-2xl transition cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !termsAccepted}
                    className="w-2/3 py-3.5 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-sm font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Submitting for Review...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Submit Claim for Verification
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: SUBMISSION SUCCESS & UNDER REVIEW SCREEN */}
            {step === 3 && (
              <div className="text-center py-3 space-y-4">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.25)]"
                >
                  <Clock className="w-9 h-9" />
                </motion.div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
                    🟡 CLAIM SUBMITTED • UNDER REVIEW
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight pt-1">
                    Claim Submitted Successfully
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Claim submitted successfully. Your ownership proof is under review. We'll notify you after verification.
                  </p>
                </div>

                {/* Review Details Card */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Target Listing</span>
                    <span className="font-bold text-white font-mono line-clamp-1 max-w-[200px] text-right">
                      {listing.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Claimant</span>
                    <span className="font-mono text-slate-200">
                      {ownerName} ({mobile})
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Review Status</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending Administrative Verification
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Estimated SLA</span>
                    <span className="font-mono text-slate-300">
                      24 – 48 Hours
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed px-2">
                  Your listing remains publicly visible to travelers. Once our team approves your ownership documentation, full owner dashboard controls and the official <strong className="text-emerald-400 font-medium">🟢 Verified Partner</strong> badge will be activated.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="w-1/2 py-3.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-2xl transition cursor-pointer"
                  >
                    Done & Return to Listing
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onSuccessNavigate) {
                        onSuccessNavigate(listing.id);
                      } else if (typeof window !== 'undefined') {
                        window.location.hash = '#/partner';
                      }
                    }}
                    className="w-1/2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-2xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Go to Partner Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Authentication Modal with State Preservation */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <HillyTripLoginPage
            isModal={true}
            initialMode="signup"
            onClose={() => setShowAuthModal(false)}
            onSuccess={(authenticatedUser) => {
              setActiveUser(authenticatedUser);
              if (authenticatedUser?.email && !ownerEmail) {
                setOwnerEmail(authenticatedUser.email);
              }
              if (authenticatedUser?.name && !ownerName) {
                setOwnerName(authenticatedUser.name);
              }
              setShowAuthModal(false);
              // Move directly to ownership proof step with authenticated user
              setStep(2);
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

export default ClaimModal;
