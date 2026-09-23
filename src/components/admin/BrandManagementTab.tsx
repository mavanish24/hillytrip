import React, { useState, useEffect } from 'react';
import { Globe, Upload, Check, RefreshCw, Image as ImageIcon, Facebook, Instagram, Youtube, Mail, Phone, MessageSquare, Tag } from 'lucide-react';

export interface BrandSettings {
  brandName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  logoUrl: string;
  faviconUrl: string;
}

const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  brandName: 'HillyTrip',
  tagline: 'Explore the Serene Himalayas with Authentic Local Experiences',
  supportEmail: 'support@hillytrip.com',
  supportPhone: '+91 98320 12345',
  whatsappNumber: '+91 98320 12345',
  facebookUrl: 'https://facebook.com/hillytrip',
  instagramUrl: 'https://instagram.com/hillytrip',
  youtubeUrl: 'https://youtube.com/hillytrip',
  logoUrl: '',
  faviconUrl: ''
};

const STORAGE_KEY = 'brand_settings';

export const BrandManagementTab: React.FC = () => {
  const [settings, setSettings] = useState<BrandSettings>(DEFAULT_BRAND_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_BRAND_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load brand settings:', e);
    }
  }, []);

  const handleChange = (field: keyof BrandSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'logoUrl' | 'faviconUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleChange(field, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save brand settings:', e);
    }
  };

  const handleCancel = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_BRAND_SETTINGS, ...JSON.parse(stored) });
      } else {
        setSettings(DEFAULT_BRAND_SETTINGS);
      }
    } catch (e) {
      setSettings(DEFAULT_BRAND_SETTINGS);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Brand Management</h2>
            <p className="text-xs text-slate-400">Configure global brand identity details and contact information.</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Brand settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl text-xs">
        
        {/* Brand Information Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            General Brand Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Brand Name
              </label>
              <input
                type="text"
                required
                value={settings.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
                placeholder="e.g. HillyTrip"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Tagline */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="e.g. Explore the Serene Himalayas"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            Support & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Support Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Support Email</span>
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                placeholder="support@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Support Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Support Phone</span>
              </label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                placeholder="+91 98320 12345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Number</span>
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="+91 98320 12345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            Social Media Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Facebook URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-400" />
                <span>Facebook URL</span>
              </label>
              <input
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Instagram URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram URL</span>
              </label>
              <input
                type="url"
                value={settings.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* YouTube URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>YouTube URL</span>
              </label>
              <input
                type="url"
                value={settings.youtubeUrl}
                onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Media & Branding Images Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            Logo & Favicon Media
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Logo Upload Card */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-200">
                Logo Upload
              </label>

              {/* Logo Preview or Placeholder */}
              <div className="h-28 rounded-xl border border-dashed border-slate-700 bg-slate-900/80 flex items-center justify-center p-3 overflow-hidden">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Brand Logo Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={() => handleChange('logoUrl', '')}
                  />
                ) : (
                  <div className="text-center space-y-1 text-slate-500">
                    <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                    <p className="text-[11px] font-medium">No logo uploaded — placeholder active</p>
                    <p className="text-[10px] text-slate-600">[{settings.brandName || 'Brand Logo'}]</p>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('logoUrl', e)}
                      className="hidden"
                    />
                  </label>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('logoUrl', '')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="Or paste Logo Image URL (https://...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Favicon Upload Card */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-200">
                Favicon Upload
              </label>

              {/* Favicon Preview or Placeholder */}
              <div className="h-28 rounded-xl border border-dashed border-slate-700 bg-slate-900/80 flex items-center justify-center p-3 overflow-hidden">
                {settings.faviconUrl ? (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <img
                      src={settings.faviconUrl}
                      alt="Favicon Preview"
                      className="w-10 h-10 object-contain"
                      onError={() => handleChange('faviconUrl', '')}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-1 text-slate-500">
                    <Globe className="w-8 h-8 mx-auto stroke-1" />
                    <p className="text-[11px] font-medium">No favicon uploaded — placeholder active</p>
                    <p className="text-[10px] text-slate-600">[32x32 Favicon Icon]</p>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('faviconUrl', e)}
                      className="hidden"
                    />
                  </label>
                  {settings.faviconUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('faviconUrl', '')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  value={settings.faviconUrl}
                  onChange={(e) => handleChange('faviconUrl', e.target.value)}
                  placeholder="Or paste Favicon URL (https://...)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/50 transition-all cursor-pointer active:scale-95"
          >
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
};
