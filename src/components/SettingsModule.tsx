import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Bell, Globe, Sparkles, Trash2, Shield, Heart, Eye, ArrowRight, Info, Check, MessageSquare, Sun, Moon, Compass, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useThemeEngine } from './ThemeContext';

interface SettingsModuleProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
}

export default function SettingsModule({
  user,
  onUpdateUser,
  navigate,
  setNotification,
  themeMode,
  setThemeMode
}: SettingsModuleProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'communication' | 'language' | 'appearance' | 'about'>('profile');
  const { activeTheme, setTheme, themes } = useThemeEngine();

  // Active section routing listener
  useEffect(() => {
    const handleCheckTab = () => {
      const saved = localStorage.getItem('hillytrip_settings_tab');
      if (saved === 'appearance') {
        setActiveSection('appearance');
        localStorage.removeItem('hillytrip_settings_tab');
      } else if (window.location.hash.includes('section=appearance') || window.location.href.includes('section=appearance')) {
        setActiveSection('appearance');
      }
    };
    handleCheckTab();
    window.addEventListener('hashchange', handleCheckTab);
    return () => window.removeEventListener('hashchange', handleCheckTab);
  }, []);

  // Input states
  const [name, setName] = useState(user?.name || user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || 'Mountain enthusiast & certified road-tripper.');
  const [mobile, setMobile] = useState(user?.mobile || '9832049219');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  const [language, setLanguage] = useState('English');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      displayName: name,
      bio,
      mobile
    });
    if (setNotification) {
      setNotification({ type: 'success', message: 'Profile details saved successfully!' });
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      if (setNotification) setNotification({ type: 'error', message: 'Password field cannot be empty.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      if (setNotification) setNotification({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setNewPassword('');
    setConfirmPassword('');
    if (setNotification) {
      setNotification({ type: 'success', message: 'Security password updated successfully (simulated).' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 selection:bg-emerald-500/10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account & App Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure your personal preferences, localizations, and application interface.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Left Nav Tabs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4.5 space-y-1 shadow-3xs">
          <span className="text-[10px] uppercase font-black text-slate-400 font-mono tracking-wider block mb-3 pl-2.5">Settings areas</span>
          
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex items-center gap-3 w-full h-11 px-3 rounded-xl text-xs font-black transition text-left cursor-pointer ${
              activeSection === 'profile' 
                ? 'bg-slate-950 dark:bg-slate-800 text-white dark:text-emerald-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`flex items-center gap-3 w-full h-11 px-3 rounded-xl text-xs font-black transition text-left cursor-pointer ${
              activeSection === 'security' 
                ? 'bg-slate-950 dark:bg-slate-800 text-white dark:text-emerald-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Security</span>
          </button>

          <button
            onClick={() => setActiveSection('communication')}
            className={`flex items-center gap-3 w-full h-11 px-3 rounded-xl text-xs font-black transition text-left cursor-pointer ${
              activeSection === 'communication' 
                ? 'bg-slate-950 dark:bg-slate-800 text-white dark:text-emerald-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Communications</span>
          </button>

          <button
            onClick={() => setActiveSection('language')}
            className={`flex items-center gap-3 w-full h-11 px-3 rounded-xl text-xs font-black transition text-left cursor-pointer ${
              activeSection === 'language' 
                ? 'bg-slate-950 dark:bg-slate-800 text-white dark:text-emerald-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>Language</span>
          </button>

          <button
            onClick={() => setActiveSection('appearance')}
            className={`flex items-center gap-3 w-full h-11 px-3 rounded-xl text-xs font-black transition text-left cursor-pointer ${
              activeSection === 'appearance' 
                ? 'bg-slate-950 dark:bg-slate-800 text-white dark:text-emerald-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Appearance</span>
          </button>

          <button
            onClick={() => setActiveSection('about')}
            className={`flex items-center gap-3 w-full h-11 px-3 rounded-xl text-xs font-black transition text-left cursor-pointer ${
              activeSection === 'about' 
                ? 'bg-slate-950 dark:bg-slate-800 text-white dark:text-emerald-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>About HillyTrip</span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-3" />

          <button
            onClick={() => {
              if (setNotification) setNotification({ type: 'error', message: 'Delete Account process requires administrator bypass code.' });
            }}
            className="flex items-center gap-3 w-full h-11 px-3 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left cursor-pointer transition"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Delete Account</span>
          </button>
        </div>

        {/* Right Form Fields */}
        <div className="md:col-span-3">
          
          {activeSection === 'profile' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-3xs">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Profile Details</h3>
                <p className="text-xs text-slate-500">Edit how your explorer credentials appear to other travelers across high roads.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Traveller Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-850 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Contact Number</label>
                    <input
                      type="text"
                      required
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Travel Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold text-slate-850 dark:text-slate-100 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer"
                >
                  Save Profile Details
                </button>
              </form>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-3xs">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Password & Security</h3>
                <p className="text-xs text-slate-500">Configure multi-factor security and update active passwords.</p>
              </div>

              <form onSubmit={handleSaveSecurity} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-3 bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeSection === 'communication' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-3xs">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Communication Preferences</h3>
                <p className="text-xs text-slate-500">Enable or disable various real-time notifications from homestay hosts or cab drivers.</p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                <label className="flex items-center gap-4 cursor-pointer pt-3 first:pt-0">
                  <input
                    type="checkbox"
                    checked={emailNotif}
                    onChange={e => setEmailNotif(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-800 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">Email Alerts</span>
                    <span className="text-[10px] text-slate-500">Receive receipt invoices, booking confirmations and direct messaging digests.</span>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={smsNotif}
                    onChange={e => setSmsNotif(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-800 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">SMS Updates (High Priority)</span>
                    <span className="text-[10px] text-slate-500">Crucial for weak signal areas. High altitude emergency road bulletins or route alerts sent instantly.</span>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={pushNotif}
                    onChange={e => setPushNotif(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-800 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">Browser Push Notifications</span>
                    <span className="text-[10px] text-slate-500">Get alerted immediately in real-time when another traveller posts a comment or message thread.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeSection === 'language' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-3xs">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Language & Dialect</h3>
                <p className="text-xs text-slate-500">Select your preferred system language. Localized Himalayan dialects are available for audio-guides.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['English', 'Hindi (हिन्दी)', 'Nepali (नेपाली)', 'Tibetan (བོད་སྐད)'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      if (setNotification) setNotification({ type: 'success', message: `Language updated to ${lang}` });
                    }}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition ${
                      language === lang 
                        ? 'border-emerald-500 bg-emerald-50/10 text-emerald-600 dark:text-emerald-400 font-bold' 
                        : 'border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black">{lang}</span>
                    {language === lang && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-8 shadow-3xs">
              
              {/* Display Mode Selector */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">1. Select Display Preference</h3>
                  <p className="text-xs text-slate-500">Configure visual appearances to support low-light evening travel reading or high-altitude glare protection.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setThemeMode('light');
                      if (setNotification) setNotification({ type: 'success', message: 'Light Display Mode Activated' });
                    }}
                    className={`p-4 rounded-2xl border text-center space-y-2 cursor-pointer transition-all duration-200 ${
                      themeMode === 'light' 
                        ? 'border-emerald-500 bg-emerald-50/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm' 
                        : 'border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl block select-none">☀️</span>
                    <span className="text-xs font-black uppercase tracking-wider font-mono">Light Mode</span>
                  </button>

                  <button
                    onClick={() => {
                      setThemeMode('dark');
                      if (setNotification) setNotification({ type: 'success', message: 'Dark Display Mode Activated' });
                    }}
                    className={`p-4 rounded-2xl border text-center space-y-2 cursor-pointer transition-all duration-200 ${
                      themeMode === 'dark' 
                        ? 'border-emerald-500 bg-emerald-50/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm' 
                        : 'border-slate-150 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl block select-none">🌙</span>
                    <span className="text-xs font-black uppercase tracking-wider font-mono">Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800" />

              {/* Theme Preset Selector */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      2. HillyTrip Premium Theme Engine
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    Transform the entire character and design language of the HillyTrip explorer platform instantly. 
                    Each preset features an independent color scheme, typography pairing, border radii, shadows, 
                    background style, and micro-interactions.
                  </p>
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {themes.map((t) => {
                    const isActive = activeTheme.id === t.id;
                    const modeStyle = themeMode === 'dark' ? t.dark : t.light;

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          if (setNotification) {
                            setNotification({
                              type: 'success',
                              message: `🎉 Theme Preset "${t.name}" loaded successfully!`
                            });
                          }
                        }}
                        className={`relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-full group ${
                          isActive
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-50/40 dark:bg-slate-950/20 shadow-lg'
                            : 'border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                        }`}
                      >
                        {/* Top Metadata */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-2xl">{t.emoji}</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                                  {t.name}
                                </span>
                                {t.id === 'signature' && (
                                  <span className="text-[8px] bg-emerald-500/10 text-emerald-500 font-bold px-1.5 py-0.5 rounded-sm font-mono tracking-wider">
                                    DEFAULT
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {t.mood}
                              </p>
                            </div>

                            {isActive ? (
                              <span className="flex items-center justify-center w-5 h-5 bg-emerald-500 text-white rounded-full">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 group-hover:border-emerald-500/50 transition-colors" />
                            )}
                          </div>

                          {/* 🖼️ HIGH FIDELITY LIVE MINIATURE PREVIEW FRAME */}
                          <div 
                            className="rounded-2xl p-3 mb-4 border relative overflow-hidden flex flex-col justify-between h-36 transition-all"
                            style={{
                              backgroundColor: modeStyle.backgroundColor,
                              borderColor: modeStyle.borderStyle.split(' ')[2] || 'rgba(0,0,0,0.1)',
                              color: modeStyle.textColor,
                              boxShadow: modeStyle.shadow,
                              fontFamily: t.bodyFont
                            }}
                          >
                            {/* Inner Background Canvas Overlay Sim */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-transparent to-black/35" />

                            {/* Mini Navbar */}
                            <div 
                              className="flex items-center justify-between px-2 py-1 border-b text-[8px] font-black tracking-wider"
                              style={{ 
                                borderColor: 'rgba(128,128,128,0.15)',
                                fontFamily: t.headingFont 
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-xs">{t.emoji}</span>
                                <span className="text-[9px]">HillyTrip</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: modeStyle.primaryColor }} />
                                <span className="opacity-50 text-[7px]">Search</span>
                              </div>
                            </div>

                            {/* Mini Card */}
                            <div 
                              className="mx-1 my-1.5 p-2 rounded-xl border flex items-center justify-between gap-2"
                              style={{
                                background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.55)' : '#ffffff',
                                borderColor: 'rgba(128,128,128,0.15)',
                                borderRadius: t.borderRadius === '24px' ? '12px' : t.borderRadius === '16px' ? '8px' : '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                              }}
                            >
                              <div className="space-y-0.5">
                                <h5 
                                  className="text-[9px] font-bold tracking-tight"
                                  style={{ fontFamily: t.headingFont }}
                                >
                                  Solang Valley Trek
                                </h5>
                                <p className="text-[7px] opacity-60">High-altitude alpine trails</p>
                              </div>

                              {/* Mini Action Button */}
                              <span 
                                className="text-[7px] font-black px-2 py-1 inline-block select-none pointer-events-none rounded transition-transform"
                                style={{
                                  background: t.id === 'signature' ? 'linear-gradient(135deg, #10b981, #14b8a6)' :
                                              t.id === 'aurora' ? 'linear-gradient(135deg, #06b6d4, #10b981)' :
                                              t.id === 'sunset' ? 'linear-gradient(135deg, #f97316, #ec4899)' :
                                              modeStyle.primaryColor,
                                  color: t.id === 'signature' ? '#020617' : '#ffffff',
                                  borderRadius: t.id === 'signature' ? '9999px' : t.id === 'alpine-light' ? '6px' : '3px',
                                  fontFamily: t.headingFont
                                }}
                              >
                                Book
                              </span>
                            </div>

                            {/* Mini Bottom Tab Navigation */}
                            <div className="flex justify-around items-center text-[7px] font-bold opacity-60 pt-1 border-t border-slate-500/10">
                              <span>🗺️ Explore</span>
                              <span>🏨 Homestays</span>
                              <span>🚖 Taxis</span>
                            </div>
                          </div>
                        </div>

                        {/* Apply Preset Button / Active Status */}
                        <div className="flex justify-end pt-4 mt-1 border-t border-slate-50 dark:border-slate-850/60">
                          <button
                            type="button"
                            className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-wider transition-all duration-155 cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                : 'bg-slate-100 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isActive ? '✓ Active Preset' : 'Apply Design System'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-3xs">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">About HillyTrip</h3>
                <p className="text-xs text-slate-500">Certified secure high altitude mountain tourism navigation engine.</p>
              </div>

              <div className="p-4.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-3 text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
                <p>HillyTrip is built specifically for travelers and adventurers exploring high-altitude mountain environments, including Lahaul, Solang, Sissu, and the greater Spiti valleys.</p>
                <p>By connecting verified local homestays and mountain-qualified cab operators, we guarantee safe transits, premium hospitality, and genuine eco-friendly tourism.</p>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                <div className="flex justify-between text-[10px] font-black font-mono text-slate-400 uppercase tracking-wider">
                  <span>Version: 3.5.0 Stable</span>
                  <span>Encryption: AES-256</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
