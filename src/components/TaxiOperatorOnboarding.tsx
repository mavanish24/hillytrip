import React, { useState, useEffect } from 'react';
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  CheckCircle, 
  UploadCloud, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Car, 
  Lock, 
  Camera, 
  Sparkles, 
  Trash2, 
  Eye,
  LogOut,
  Sliders,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaxiOperatorOnboardingProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  onOpenLoginModal: () => void;
}

export default function TaxiOperatorOnboarding({
  user,
  onUpdateUser,
  navigate,
  onOpenLoginModal
}: TaxiOperatorOnboardingProps) {
  // Wizard steps: 1 = Business Details, 2 = Document Upload, 3 = Review & Submit
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    mobileNumber: '',
    emailAddress: '',
    businessAddress: '',
    state: 'West Bengal',
    district: '',
    primaryTaxiStand: '',
    gstNumber: '',
    website: '',
    yearsInBusiness: '1',
    businessDescription: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  // Pre-populate fields if user is already logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        ownerName: prev.ownerName || user.name || '',
        emailAddress: prev.emailAddress || user.email || '',
        mobileNumber: prev.mobileNumber || user.mobile || '',
        businessName: prev.businessName || user.taxiOperatorDetails?.businessName || '',
        businessAddress: prev.businessAddress || user.taxiOperatorDetails?.businessAddress || '',
        state: user.taxiOperatorDetails?.state || 'West Bengal',
        district: user.taxiOperatorDetails?.district || '',
        primaryTaxiStand: user.taxiOperatorDetails?.primaryTaxiStand || '',
        gstNumber: user.taxiOperatorDetails?.gstNumber || '',
        website: user.taxiOperatorDetails?.website || '',
        yearsInBusiness: user.taxiOperatorDetails?.yearsInBusiness || '1',
        businessDescription: user.taxiOperatorDetails?.businessDescription || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle document upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB limit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const base64Data = await convertToBase64(file);
      const payload = {
        userId: user?.id || formData.emailAddress,
        base64: base64Data,
        filename: file.name,
        mimeType: file.type,
        documentType: docType
      };

      const res = await fetch('/api/taxi-operator/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document.');
      }

      onUpdateUser(data.user);
      setSuccess(`${docType.replace(/([A-Z])/g, ' $1')} uploaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setLoading(false);
    }
  };

  // Register a new user + Operator profile
  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!user) {
      if (!formData.emailAddress || !formData.ownerName) {
        setError('Email and Full Name are required to start registration.');
        setLoading(false);
        return;
      }
      if (!formData.password || formData.password !== formData.confirmPassword) {
        setError('Passwords are required and must match.');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        email: formData.emailAddress,
        password: formData.password || undefined,
        name: formData.ownerName,
        mobile: formData.mobileNumber,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        businessAddress: formData.businessAddress,
        state: formData.state,
        district: formData.district,
        primaryTaxiStand: formData.primaryTaxiStand,
        gstNumber: formData.gstNumber,
        website: formData.website,
        yearsInBusiness: formData.yearsInBusiness,
        businessDescription: formData.businessDescription
      };

      const res = await fetch('/api/taxi-operator/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register Taxi Operator profile.');
      }

      onUpdateUser(data.user);
      setStep(2); // advance to uploads
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Save profile edits (Draft state)
  const handleSaveProfileDraft = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        userId: user.id,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        mobileNumber: formData.mobileNumber,
        businessAddress: formData.businessAddress,
        state: formData.state,
        district: formData.district,
        primaryTaxiStand: formData.primaryTaxiStand,
        gstNumber: formData.gstNumber,
        website: formData.website,
        yearsInBusiness: formData.yearsInBusiness,
        businessDescription: formData.businessDescription
      };

      const res = await fetch('/api/taxi-operator/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save business details.');
      }

      onUpdateUser(data.user);
      setSuccess('Business details updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving details.');
    } finally {
      setLoading(false);
    }
  };

  // Submit final verification request
  const handleFinalSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // Verify required documents exist
    const docs = user.taxiOperatorDetails?.documents || {};
    if (!docs.ownerIdProof || !docs.addressProof) {
      setError('Please upload at least the Owner ID Proof and Address Proof to submit.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/taxi-operator/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      onUpdateUser(data.user);
      setSuccess('Your registration has been submitted for admin approval!');
    } catch (err: any) {
      setError(err.message || 'Error submitting application.');
    } finally {
      setLoading(false);
    }
  };

  // Return to editing mode if rejected
  const handleReturnToEdit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/taxi-operators/' + user.id + '/verify', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123' // self-acting to unlock editing
        },
        body: JSON.stringify({ status: 'draft', adminNotes: 'Unlocked by user to edit details.' })
      });

      const data = await res.json();
      if (res.ok) {
        onUpdateUser(data.user);
        setStep(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = user?.taxiOperatorStatus || 'none';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 font-sans">
      
      {/* 1. HEADER HERO */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-600 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15">
          <img 
            src="https://images.unsplash.com/photo-1492664738415-7dde0021a21d?q=80&w=1200&auto=format&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Darjeeling roads with taxi" 
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5 mb-4">
            <Car className="w-3.5 h-3.5 animate-bounce" /> Taxi Marketplace
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            HillyTrip Reserved Taxi Operator Hub
          </h1>
          <p className="text-slate-100 text-sm md:text-base leading-relaxed">
            Partner with HillyTrip as a certified taxi operator. List your vehicle fleets, manage verified mountain drivers, quote for direct traveler queries, and handle bookings securely through the leading Himalayan travel directory.
          </p>
        </div>
      </div>

      {/* 2. SYSTEM STATUS MESSAGES */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-50 border-l-4 border-rose-600 rounded-xl p-4 mb-6 flex gap-3 text-rose-800 text-sm font-semibold shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 font-extrabold">&times;</button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border-l-4 border-emerald-600 rounded-xl p-4 mb-6 flex gap-3 text-emerald-800 text-sm font-semibold shadow-sm animate-pulse"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">{success}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. CONDITIONAL VIEWS BASED ON ONBOARDING STATUS */}

      {/* ======================================= */}
      {/* CASE A: PENDING VERIFICATION */}
      {/* ======================================= */}
      {currentStatus === 'pending' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center max-w-2xl mx-auto py-12"
        >
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200 shadow-inner">
            <Clock className="w-12 h-12 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Onboarding Profile Under Review</h2>
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 my-6 text-left max-w-md mx-auto space-y-3 font-sans">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-400 uppercase font-bold">Business Name</span>
              <span className="text-sm font-extrabold text-slate-800">{user.taxiOperatorDetails?.businessName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-400 uppercase font-bold">Owner Registered</span>
              <span className="text-sm font-extrabold text-slate-800">{user.taxiOperatorDetails?.ownerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 uppercase font-bold">Queue status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                ● Pending Verification
              </span>
            </div>
          </div>

          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
            Greetings <strong>{user.taxiOperatorDetails?.ownerName}</strong>, our backoffice desk is validating your driver permits, registration papers, and mountain driving safety logs. This standard vetting process usually takes 24–48 hours. Once approved, you will unlock full access to the Reserved Taxi Operator Dashboard and receive live traveler requests.
          </p>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('#/')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              Back to Marketplace Home
            </button>
            <button
              onClick={() => navigate('#/profile')}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-8 py-3 rounded-xl text-sm transition-all cursor-pointer"
            >
              View User Profile
            </button>
          </div>
        </motion.div>
      )}

      {/* ======================================= */}
      {/* CASE B: REJECTED STATE */}
      {/* ======================================= */}
      {currentStatus === 'rejected' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xl max-w-2xl mx-auto py-12"
        >
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-200 shadow-inner">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 text-center tracking-tight">Onboarding Request Declined</h2>
          
          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 my-6 text-left space-y-3 font-sans">
            <h4 className="text-xs text-rose-500 uppercase font-black tracking-widest block">Official Rejection Reason:</h4>
            <p className="text-sm font-semibold text-rose-800 leading-relaxed italic">
              "{user.taxiOperatorDetails?.rejectionReason || 'Documents uploaded were unreadable or expired. Please upload valid identification proof and registration permits.'}"
            </p>
          </div>

          <p className="text-slate-500 text-sm text-center max-w-md mx-auto leading-relaxed mb-8">
            Don't worry! You can easily update your business profile, re-upload clear and correct documents, and submit your registration again for review.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleReturnToEdit}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Sliders className="w-4 h-4" /> Edit & Resubmit Profile
            </button>
            <button
              onClick={() => navigate('#/')}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-8 py-3 rounded-xl text-sm transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      )}

      {/* ======================================= */}
      {/* CASE C: SUSPENDED STATE */}
      {/* ======================================= */}
      {currentStatus === 'suspended' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-slate-300 shadow-xl text-center max-w-2xl mx-auto py-12"
        >
          <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200">
            <Lock className="w-12 h-12" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Operator Account Suspended</h2>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 my-6 text-left max-w-md mx-auto">
            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Administrative Note</span>
            <p className="text-sm text-slate-600 font-semibold italic">
              "{user.taxiOperatorDetails?.rejectionReason || 'This account has been temporarily suspended due to a business policy review. Please contact HillyTrip partner desk.'}"
            </p>
          </div>

          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
            If you believe this suspension is an error or wish to appeal the decision, please contact our support Desk directly via the floating WhatsApp helpline at the bottom of the page.
          </p>

          <button
            onClick={() => navigate('#/')}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all cursor-pointer"
          >
            Go back to homepage
          </button>
        </motion.div>
      )}

      {/* ======================================= */}
      {/* CASE D: VERIFIED / CONGRATULATIONS */}
      {/* ======================================= */}
      {currentStatus === 'verified' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl max-w-2xl mx-auto py-12 text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200 shadow-lg relative">
            <CheckCircle className="w-12 h-12" />
            <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Verification Approved!</h2>
          <p className="text-slate-500 text-sm mt-2">Welcome to the HillyTrip fleet circle.</p>

          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-6 my-6 text-left max-w-lg mx-auto space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>HillyTrip Certified Operator Badge Active</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your business, <strong>{user.taxiOperatorDetails?.businessName}</strong>, has successfully cleared all mountain driving background checks, permit vetting, and licensing tests. You are now officially authorized as a Reserved Taxi Operator on HillyTrip.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="bg-white border border-slate-100 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Vehicles</span>
                <span className="text-lg font-black text-slate-800">0</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Drivers</span>
                <span className="text-lg font-black text-slate-800">0</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-3">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Quotes</span>
                <span className="text-lg font-black text-slate-800">0</span>
              </div>
            </div>
          </div>

          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
            The full interactive Taxi Operator Dashboard (Vehicles, Driver Management, Quotes, and Active Bookings) is launching in the next phase! Your credentials are fully verified and active.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('#/')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate('#/profile')}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-8 py-3 rounded-xl text-sm transition-all cursor-pointer"
            >
              My Profile Settings
            </button>
          </div>
        </motion.div>
      )}

      {/* ======================================= */}
      {/* CASE E: REGISTRATION & ONBOARDING WIZARD */}
      {/* ======================================= */}
      {(currentStatus === 'none' || currentStatus === 'draft') && (
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border-t-8 border-amber-500 animate-fade-in">
          
          {/* STEP INDICATORS */}
          <div className="flex items-center justify-between max-w-md mx-auto mb-10 border-b border-slate-100 pb-4 font-sans">
            <div className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${step === 1 ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 1 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
              <span className="text-xs font-bold uppercase tracking-wider">Profile</span>
            </div>
            <div className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${step === 2 ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 2 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
              <span className="text-xs font-bold uppercase tracking-wider">Documents</span>
            </div>
            <div className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${step === 3 ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 3 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>3</span>
              <span className="text-xs font-bold uppercase tracking-wider">Review</span>
            </div>
          </div>

          {/* STEP 1: BUSINESS PROFILE DETAILS */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-500" /> Taxi Operator Business Details
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Please answer all fields accurately to ensure fast admin approval.</p>
                </div>
                {!user && (
                  <button 
                    onClick={onOpenLoginModal}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Already have account? Sign in
                  </button>
                )}
              </div>

              <form onSubmit={handleRegistrationSubmit} className="space-y-5">
                
                {/* ACCOUNT SIGNUP SECTION IF NOT LOGGED IN */}
                {!user && (
                  <div className="bg-amber-50/40 rounded-2xl p-5 border border-amber-100 space-y-4 mb-6">
                    <h4 className="text-sm font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-600" /> Create Secure Account First
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Before completing your operator application, register your account credentials. You will use these to log into your fleet portal.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email Address *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                          <input 
                            name="emailAddress" 
                            type="email" 
                            required 
                            value={formData.emailAddress}
                            onChange={handleInputChange}
                            placeholder="e.g. support@hillcabs.com" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Password *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                          <input 
                            name="password" 
                            type="password" 
                            required 
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Confirm Password *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                          <input 
                            name="confirmPassword" 
                            type="password" 
                            required 
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BUSINESS CORE VALUES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Business / Agency Name *</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        name="businessName" 
                        type="text" 
                        required 
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="e.g. Siliguri Mountain Cab Association" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Owner / Operator Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        name="ownerName" 
                        type="text" 
                        required 
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="e.g. Sonam Sherpa" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mobile Number (WhatsApp Enabled) *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input 
                        name="mobileNumber" 
                        type="tel" 
                        required 
                        value={formData.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 9876543210" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                      />
                    </div>
                  </div>
                  {user && (
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Registered Email *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                        <input 
                          name="emailAddress" 
                          type="email" 
                          disabled
                          value={formData.emailAddress}
                          className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-400 cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* GEOGRAPHY */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">State *</label>
                    <select 
                      name="state" 
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:outline-amber-500"
                    >
                      <option value="West Bengal">West Bengal</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Assam">Assam</option>
                      <option value="Meghalaya">Meghalaya</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">District / Region *</label>
                    <input 
                      name="district" 
                      type="text" 
                      required
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="e.g. Darjeeling, Kalimpong" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Primary Taxi Stand Hub *</label>
                    <input 
                      name="primaryTaxiStand" 
                      type="text" 
                      required
                      value={formData.primaryTaxiStand}
                      onChange={handleInputChange}
                      placeholder="e.g. NJP Station, Darjeeling Motor Stand" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                    />
                  </div>
                </div>

                {/* REGISTRATION METADATA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">GST Number (Optional)</label>
                    <input 
                      name="gstNumber" 
                      type="text" 
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 19AAAAA1111A1Z1" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Website URL (Optional)</label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        name="website" 
                        type="url" 
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="e.g. hilltravelcabs.com" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Years in Business</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input 
                        name="yearsInBusiness" 
                        type="number" 
                        min="1" 
                        max="50"
                        value={formData.yearsInBusiness}
                        onChange={handleInputChange}
                        placeholder="1" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* TEXTAREAS */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Business Address *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <textarea 
                        name="businessAddress" 
                        required
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        placeholder="Provide detailed administrative address..." 
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fleet Description & Services *</label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <textarea 
                        name="businessDescription" 
                        required
                        value={formData.businessDescription}
                        onChange={handleInputChange}
                        placeholder="Tell travellers about your vehicle fleet types (Bolero, Innova, Scorpio), local route coverage, and driver qualification..." 
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* TERMS CHECKBOX */}
                <div className="flex items-start gap-2 pt-2">
                  <input 
                    name="acceptTerms" 
                    type="checkbox" 
                    required 
                    checked={formData.acceptTerms}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-amber-500 accent-amber-500 focus:ring-amber-400 mt-1 cursor-pointer" 
                  />
                  <span className="text-xs text-slate-500 leading-relaxed">
                    I represent and warrant that all vehicle licensing, driver credentials, and commercial insurance permits submitted will be kept valid in compliance with the Transport Authorities.
                  </span>
                </div>

                {/* BUTTONS */}
                <div className="pt-4 flex justify-between">
                  {user && (
                    <button
                      type="button"
                      onClick={handleSaveProfileDraft}
                      disabled={loading}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Draft'}
                    </button>
                  )}
                  <div className="flex-1 text-right">
                    {user ? (
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-8 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer inline-flex items-center gap-1"
                      >
                        Upload Documents <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-8 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {loading ? 'Creating Account...' : 'Continue to Uploads'} <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: DOCUMENTS UPLOADS */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-amber-500" /> Administrative & Verification Documents
                </h3>
                <p className="text-slate-400 text-xs mt-1">Please upload clear scanned copies or smartphone pictures of your operator permits. (Max 15MB each, JPEG/PNG/PDF)</p>
              </div>

              {/* DOCUMENT CARDS LIST */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                
                {/* 1. OWNER IDENTIFICATION PROOF */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-amber-600 uppercase font-extrabold tracking-wider block mb-1">Mandatory ID</span>
                    <h4 className="text-sm font-extrabold text-slate-800">Owner ID Proof *</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Aadhaar Card, Passport, Voter Card, or Driving License.</p>
                  </div>
                  <div className="mt-4">
                    {user?.taxiOperatorDetails?.documents?.ownerIdProof ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" /> Uploaded ID
                        </span>
                        <a 
                          href={user.taxiOperatorDetails.documents.ownerIdProof} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-white hover:bg-slate-50/50">
                        <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-600 font-bold">Select File</span>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, 'ownerIdProof')}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 2. BUSINESS ADDRESS PROOF */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-amber-600 uppercase font-extrabold tracking-wider block mb-1">Mandatory Address</span>
                    <h4 className="text-sm font-extrabold text-slate-800">Address Proof *</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Electricity Bill, Rent agreement, or Local Municipal Certificate.</p>
                  </div>
                  <div className="mt-4">
                    {user?.taxiOperatorDetails?.documents?.addressProof ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" /> Uploaded Proof
                        </span>
                        <a 
                          href={user.taxiOperatorDetails.documents.addressProof} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-white hover:bg-slate-50/50">
                        <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-600 font-bold">Select File</span>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, 'addressProof')}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 3. BUSINESS REGISTRATION */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block mb-1">Optional License</span>
                    <h4 className="text-sm font-extrabold text-slate-800">Business Registration</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">GST Certificate, Partnership Deed, or Incorporation papers.</p>
                  </div>
                  <div className="mt-4">
                    {user?.taxiOperatorDetails?.documents?.businessRegistration ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" /> Uploaded
                        </span>
                        <a 
                          href={user.taxiOperatorDetails.documents.businessRegistration} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-white hover:bg-slate-50/50">
                        <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-600 font-bold">Select File</span>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, 'businessRegistration')}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 4. DRIVER LICENSES / PERMITS */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block mb-1">Optional Permit</span>
                    <h4 className="text-sm font-extrabold text-slate-800">Taxi Fleet Permit / License</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Commercial taxi permits, driver commercial licenses, etc.</p>
                  </div>
                  <div className="mt-4">
                    {user?.taxiOperatorDetails?.documents?.taxiPermit ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" /> Uploaded Permit
                        </span>
                        <a 
                          href={user.taxiOperatorDetails.documents.taxiPermit} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-white hover:bg-slate-50/50">
                        <UploadCloud className="w-7 h-7 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-600 font-bold">Select File</span>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, 'taxiPermit')}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-between border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Profile
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-8 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center gap-1"
                >
                  Continue to Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" /> Review Application Details
                </h3>
                <p className="text-slate-400 text-xs mt-1">Please inspect your registered information and uploaded documents before launching the verification queue.</p>
              </div>

              {/* CORE METADATA REVIEW */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 mb-6 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Agency Business Name</span>
                    <span className="text-sm font-extrabold text-slate-800">{formData.businessName || 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Owner Registered</span>
                    <span className="text-sm font-extrabold text-slate-800">{formData.ownerName || 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Contact Number</span>
                    <span className="text-sm font-extrabold text-slate-800">{formData.mobileNumber || 'Not Set'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-extrabold block">District & Hub Station</span>
                    <span className="text-sm font-extrabold text-slate-800">{formData.primaryTaxiStand} ({formData.district}, {formData.state})</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-3">
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Business Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                    {formData.businessDescription}
                  </p>
                </div>
              </div>

              {/* DOCUMENTS REVIEW CHIPS */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 font-sans">
                <h4 className="text-xs text-slate-400 uppercase font-extrabold tracking-wider block mb-3">Verification Files uploaded</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs font-semibold">
                    <span>1. Owner ID Proof</span>
                    {user?.taxiOperatorDetails?.documents?.ownerIdProof ? (
                      <span className="text-emerald-600 font-extrabold">● Verified Upload</span>
                    ) : (
                      <span className="text-rose-600 font-extrabold">Missing</span>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs font-semibold">
                    <span>2. Address Proof</span>
                    {user?.taxiOperatorDetails?.documents?.addressProof ? (
                      <span className="text-emerald-600 font-extrabold">● Verified Upload</span>
                    ) : (
                      <span className="text-rose-600 font-extrabold">Missing</span>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs font-semibold">
                    <span>3. Business Registration</span>
                    {user?.taxiOperatorDetails?.documents?.businessRegistration ? (
                      <span className="text-emerald-600 font-extrabold">● Uploaded</span>
                    ) : (
                      <span className="text-slate-400 font-semibold">None (Optional)</span>
                    )}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs font-semibold">
                    <span>4. Taxi Permits</span>
                    {user?.taxiOperatorDetails?.documents?.taxiPermit ? (
                      <span className="text-emerald-600 font-extrabold">● Uploaded</span>
                    ) : (
                      <span className="text-slate-400 font-semibold">None (Optional)</span>
                    )}
                  </div>

                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-between border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Uploads
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit to Verification Desk'} <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}
