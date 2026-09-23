import React, { useState } from 'react';
import { 
  Mountain, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  User, 
  X,
  ChevronLeft
} from 'lucide-react';
import { auth, googleSignIn, signInWithEmailAndPassword, signUpWithEmailAndPassword, sendPasswordResetEmail } from '../utils/firebase';

interface HillyTripLoginPageProps {
  onClose?: () => void;
  onSuccess?: (user: any) => void;
  onBackToHome?: () => void;
  initialMode?: 'login' | 'signup' | 'forgot_password';
  isModal?: boolean;
}

export default function HillyTripLoginPage({
  onClose,
  onSuccess,
  onBackToHome,
  initialMode = 'login',
  isModal = false
}: HillyTripLoginPageProps) {
  // Navigation & Mode States
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  
  // Input fields
  const [identifier, setIdentifier] = useState(''); // Email or Mobile
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Submit Handler for Email/Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your email address or mobile number and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const emailToUse = identifier.includes('@') 
        ? identifier.trim() 
        : `${identifier.trim().toLowerCase()}@hillytrip.com`;

      const res = await signInWithEmailAndPassword(emailToUse, password);
      if (res?.user) {
        setSuccessMsg(`Welcome back to the mountains, ${res.user.displayName || res.user.name || res.user.user_metadata?.full_name || 'Adventurer'}!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.user);
          if (onClose) onClose();
        }, 600);
      } else {
        setErrorMsg('Invalid login credentials. Please check your details and try again.');
      }
    } catch (err: any) {
      console.error('[HillyTrip Login Error]', err);
      setErrorMsg(err.message || 'Unable to authenticate. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler for Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !identifier.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!identifier.includes('@')) {
      setErrorMsg('Please enter a valid email address (e.g. example@email.com).');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const cleanEmail = identifier.trim();
      const cleanUsername = username ? username.toLowerCase().replace(/[^a-z0-9_-]/g, '') : cleanEmail.split('@')[0];

      const res = await signUpWithEmailAndPassword(
        cleanEmail,
        cleanUsername,
        fullName.trim() || cleanUsername,
        password
      );

      if (res?.user) {
        setSuccessMsg('✨ Account created successfully! Welcome to HillyTrip.');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.user);
          if (onClose) onClose();
        }, 800);
      } else {
        setErrorMsg('Registration failed. Please try a different email address.');
      }
    } catch (err: any) {
      console.error('[HillyTrip Register Error]', err);
      setErrorMsg(err.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setSuccessMsg(`Authenticated via Google: ${res.user.displayName || res.user.name || res.user.user_metadata?.full_name || res.user.email}`);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.user);
          if (onClose) onClose();
        }, 600);
      }
    } catch (err: any) {
      const isCancellation = 
        err?.code === 'auth/popup-closed-by-user' ||
        err?.isCancellation ||
        err?.message?.includes('closed by the user') ||
        err?.message?.includes('cancelled');

      if (isCancellation) {
        console.info('[Google Auth] Sign-in was cancelled or popup was closed by user.');
        setErrorMsg('Google Sign-In was closed. You can click to try again, or sign in using email or Demo account.');
      } else {
        console.warn('[Google Auth]', err);
        setErrorMsg(err?.message || 'Google Sign-In was cancelled or failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // One-Click Demo Traveler Login
  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const demoEmail = 'explorer@hillytrip.com';
      const demoPassword = 'DemoPassword123!';
      let res;
      try {
        res = await signInWithEmailAndPassword(demoEmail, demoPassword);
      } catch (signInErr) {
        res = await signUpWithEmailAndPassword(demoEmail, 'himalayan_explorer', 'Himalayan Explorer', demoPassword);
      }
      if (res?.user) {
        setSuccessMsg('✨ Signed in as Himalayan Explorer demo account!');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.user);
          if (onClose) onClose();
        }, 600);
      }
    } catch (err: any) {
      console.warn('[Demo Login Error]', err);
      setErrorMsg('Unable to start demo session. Please try signing up with your email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setSuccessMsg(`If an account exists for ${resetEmail.trim()}, a password reset link has been sent. Please check your inbox.`);
    } catch (err: any) {
      console.error('[Forgot Password Error]', err);
      setErrorMsg(err?.message || 'Unable to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden select-none ${isModal ? 'bg-slate-950/80 backdrop-blur-lg fixed inset-0 z-[100000]' : 'bg-slate-950'}`}>
      
      {/* ================= BACKGROUND CINEMATIC HIMALAYAN LANDSCAPE ================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* High Definition Himalayan Background Image */}
        <img 
          src="https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/common/hero.png" 
          alt="Himalayan Mountain Landscape" 
          className="w-full h-full object-cover object-center scale-105 animate-pulse-slow transition-transform duration-1000 filter brightness-90 contrast-105"
        />

        {/* Soft Moving Cloud Layers (Micro-Animations) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-slate-950/80 pointer-events-none"></div>
        
        {/* Animated Floating Clouds Overlay */}
        <div className="absolute top-0 left-0 w-[200%] h-full bg-repeat-x opacity-25 animate-float-clouds pointer-events-none"
             style={{
               backgroundImage: `url('https://raw.githubusercontent.com/sammypics/clouds/master/cloud.png')`,
               backgroundSize: '1000px 400px'
             }}>
        </div>

        {/* Morning Golden Sunlight & Deep Forest Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-emerald-950/30 to-slate-950/85 backdrop-brightness-95"></div>
      </div>

      {/* Back to Home button if rendered as a dedicated full-screen page */}
      {!isModal && (
        <button 
          onClick={() => {
            if (onBackToHome) {
              onBackToHome();
            } else if (typeof window !== 'undefined') {
              window.history.pushState(null, '', '/');
              window.dispatchEvent(new Event('popstate'));
            }
          }}
          aria-label="Back to Home"
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-105 cursor-pointer shadow-lg text-xs font-bold font-sans group"
        >
          <ChevronLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
      )}

      {/* Close button if rendered inside a modal overlay */}
      {isModal && onClose && (
        <button 
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all duration-200 hover:scale-105 cursor-pointer shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* ================= FLOATING GLASS CARD ================= */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto animate-fade-in my-auto">
        
        {/* Glassmorphic Container Box */}
        <div className="bg-white/15 dark:bg-slate-900/65 backdrop-blur-[24px] border border-white/25 dark:border-white/20 rounded-[28px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] shadow-emerald-950/30 text-white relative overflow-hidden transition-all duration-300 hover:border-white/35">
          
          {/* Subtle Golden/Emerald Glow Accent at top */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-emerald-400/30 to-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* ================= TOP SECTION ================= */}
          <div className="text-center space-y-2 mb-6 relative">
            {/* HillyTrip Logo */}
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-600/30 flex items-center justify-center transform hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950/40 rounded-[14px] backdrop-blur-xs flex items-center justify-center">
                  <Mountain className="w-6 h-6 text-emerald-300 stroke-[2.2]" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-sans drop-shadow-md">
                Hilly<span className="text-emerald-400">Trip</span>
              </span>
            </div>

            {/* Tagline */}
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-300/90 font-mono">
              Travel Deep, Experience More
            </p>

            {/* Greeting */}
            <div className="pt-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans drop-shadow-sm">
                {mode === 'signup' 
                  ? 'Begin Your Journey' 
                  : mode === 'forgot_password'
                  ? 'Reset Your Password'
                  : 'Welcome Back'}
              </h1>
              <p className="text-xs text-slate-200/90 font-medium mt-1">
                {mode === 'signup' 
                  ? 'Join our Himalayan community of wanderers.' 
                  : mode === 'forgot_password'
                  ? 'Enter your email address to receive a reset link.'
                  : 'Continue your mountain journey.'
                }
              </p>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-100 text-xs font-semibold leading-relaxed backdrop-blur-md animate-shake flex items-start gap-2">
              <span className="text-base shrink-0">⚠️</span>
              <span className="flex-1">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-xs font-semibold leading-relaxed backdrop-blur-md animate-fade-in flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <span className="flex-1">{successMsg}</span>
            </div>
          )}

          {/* ================= FORM CONTENT ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Field 1: Email or Mobile */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1.5 ml-1">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="example@email.com or XXXX-XXXX-XXXX"
                    className="w-full bg-slate-950/40 border border-white/20 focus:border-emerald-400 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all duration-300 backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Field 2: Password with Show/Hide Toggle */}
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="text-[11px] font-bold text-slate-200">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setMode('forgot_password');
                    }}
                    className="text-[10px] font-bold text-emerald-300 hover:text-emerald-200 hover:underline transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="XXXXXX"
                    className="w-full bg-slate-950/40 border border-white/20 focus:border-emerald-400 rounded-2xl py-3.5 pl-10 pr-11 text-xs font-medium text-white placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all duration-300 backdrop-blur-md font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode = Registration */}
          {mode === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1 ml-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Your Name"
                    className="w-full bg-slate-950/40 border border-white/20 focus:border-emerald-400 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all duration-300 backdrop-blur-md"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="example@email.com"
                    className="w-full bg-slate-950/40 border border-white/20 focus:border-emerald-400 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all duration-300 backdrop-blur-md"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1 ml-1">
                  Choose Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="XXXXXX"
                    className="w-full bg-slate-950/40 border border-white/20 focus:border-emerald-400 rounded-2xl py-3 pl-10 pr-11 text-xs font-medium text-white placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all duration-300 backdrop-blur-md font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Sign Up to Explore'}
              </button>
            </form>
          )}

          {/* Mode = Forgot Password */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1.5 ml-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="example@email.com"
                    className="w-full bg-slate-950/40 border border-white/20 focus:border-emerald-400 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all duration-300 backdrop-blur-md"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Sending Request...' : 'Send Password Reset Link'}
              </button>

              <button 
                type="button" 
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setMode('login');
                }}
                className="w-full text-center text-xs text-slate-300 hover:text-white transition font-medium cursor-pointer"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* ================= DIVIDER ================= */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300/80 px-1 font-mono">
              OR CONTINUE WITH
            </span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* ================= SOCIAL BUTTONS ================= */}
          <div className="space-y-2.5">
            {/* Google OAuth Button */}
            <button 
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white/85 hover:bg-white text-slate-800 border border-white/40 backdrop-blur-md shadow-sm font-bold text-xs py-3 px-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.95 1 12 1 7.37 1 3.4 3.65 1.51 7.5l3.85 3C6.31 7.51 8.94 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.46c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.84c2.25-2.07 3.57-5.12 3.57-8.66z" />
                <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.51 6.9C.55 8.84 0 11.01 0 13.3c0 2.29.55 4.46 1.51 6.4l3.85-3.2z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.84-2.98c-1.07.72-2.44 1.15-4.12 1.15-3.06 0-5.69-2.47-6.64-5.46L1.51 16.3C3.4 20.15 7.37 23 12 23z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Instant Demo Explorer Account Option */}
            <button 
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-sm font-bold text-xs py-2.5 px-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Explore as Guest / Demo Traveler</span>
            </button>
          </div>

          {/* ================= BOTTOM VALUE PROP & SIGN UP SWITCH ================= */}
          <div className="mt-6 pt-5 border-t border-white/15 text-center space-y-3">
            {/* Value Proposition List */}
            <p className="text-[11px] text-slate-200/90 leading-relaxed font-medium">
              Save your favourite destinations, homestays, reviews, bookings, journeys.
            </p>

            {/* Toggle Sign Up / Login */}
            <div className="pt-1 flex items-center justify-center gap-1.5 text-xs">
              <span className="text-slate-300">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button 
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setMode(mode === 'signup' ? 'login' : 'signup');
                }}
                className="font-extrabold text-emerald-300 hover:text-emerald-200 hover:underline transition cursor-pointer"
              >
                {mode === 'signup' ? 'Login' : 'Sign Up'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
