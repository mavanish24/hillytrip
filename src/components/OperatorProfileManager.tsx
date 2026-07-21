import React, { useState } from 'react';
import { 
  Building, User, Phone, Globe, Facebook, Instagram, ShieldCheck, 
  MapPin, Clock, Award, Image as ImageIcon, CheckCircle, AlertTriangle, 
  Trash2, UploadCloud, Plus, Star, Map, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OperatorProfileManagerProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

export default function OperatorProfileManager({ user, onUpdateUser }: OperatorProfileManagerProps) {
  const details = user?.taxiOperatorDetails || {};

  // Form Fields
  const [businessName, setBusinessName] = useState(details.businessName || '');
  const [ownerName, setOwnerName] = useState(details.ownerName || user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(details.mobileNumber || user?.mobile || '');
  const [emailAddress, setEmailAddress] = useState(details.emailAddress || user?.email || '');
  const [businessAddress, setBusinessAddress] = useState(details.businessAddress || '');
  const [state, setState] = useState(details.state || 'West Bengal');
  const [district, setDistrict] = useState(details.district || 'Darjeeling');
  const [yearsInBusiness, setYearsInBusiness] = useState(details.yearsInBusiness || '1');
  const [businessDescription, setBusinessDescription] = useState(details.businessDescription || '');
  
  // Custom Business Profile additions
  const [businessLogo, setBusinessLogo] = useState(details.businessLogo || '');
  const [coverImage, setCoverImage] = useState(details.coverImage || '');
  const [businessHours, setBusinessHours] = useState(details.businessHours || 'Daily 9:00 AM - 9:00 PM');
  const [emergencyContact, setEmergencyContact] = useState(details.emergencyContact || '');
  const [website, setWebsite] = useState(details.website || '');
  const [facebookUrl, setFacebookUrl] = useState(details.facebookUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(details.instagramUrl || '');
  
  // Map coordinates
  const [latitude, setLatitude] = useState(details.latitude || '27.0398');
  const [longitude, setLongitude] = useState(details.longitude || '88.2638');

  // Tag lists (Operating Regions and Languages)
  const [regionInput, setRegionInput] = useState('');
  const [regions, setRegions] = useState<string[]>(details.operatingRegions || ['Darjeeling', 'Siliguri', 'Gangtok', 'Kalka', 'Shimla']);
  const [langInput, setLangInput] = useState('');
  const [languages, setLanguages] = useState<string[]>(details.languagesSpoken || ['Hindi', 'English', 'Nepali']);

  // Gallery (array of objects with url and category: 'office' | 'fleet' | 'team')
  const [gallery, setGallery] = useState<{ url: string; category: 'office' | 'fleet' | 'team' }[]>(details.gallery || [
    { url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400', category: 'fleet' },
    { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400', category: 'fleet' }
  ]);
  const [galleryCategory, setGalleryCategory] = useState<'office' | 'fleet' | 'team'>('fleet');

  // Services checkboxes
  const [services, setServices] = useState<{
    airportTransfer: boolean;
    railwayPickup: boolean;
    sightseeing: boolean;
    multiDayTours: boolean;
    outstationTrips: boolean;
    corporateTravel: boolean;
    weddingTravel: boolean;
  }>(details.services || {
    airportTransfer: true,
    railwayPickup: true,
    sightseeing: true,
    multiDayTours: false,
    outstationTrips: true,
    corporateTravel: false,
    weddingTravel: false
  });

  // Vehicle types checkboxes
  const [vehicleTypes, setVehicleTypes] = useState<{
    suv: boolean;
    sedan: boolean;
    hatchback: boolean;
    luxury: boolean;
    traveller: boolean;
  }>(details.vehicleTypes || {
    suv: true,
    sedan: true,
    hatchback: false,
    luxury: false,
    traveller: false
  });

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'basic' | 'gallery' | 'services'>('basic');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper to read file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Upload logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/taxi-operator/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.email,
          base64,
          filename: file.name,
          mimeType: file.type,
          documentType: 'business_logo'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBusinessLogo(data.publicUrl || base64);
      } else {
        setBusinessLogo(base64); // Local fallback
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload cover image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/taxi-operator/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.email,
          base64,
          filename: file.name,
          mimeType: file.type,
          documentType: 'cover_image'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCoverImage(data.publicUrl || base64);
      } else {
        setCoverImage(base64); // Local fallback
      }
    } catch (err) {
      console.error('Error uploading cover:', err);
    } finally {
      setUploadingCover(false);
    }
  };

  // Upload gallery photo
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (gallery.length >= 20) {
      alert('You can upload a maximum of 20 photos to your gallery.');
      return;
    }
    setUploadingGallery(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/taxi-operator/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.email,
          base64,
          filename: file.name,
          mimeType: file.type,
          documentType: `gallery_${galleryCategory}_${Date.now()}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGallery(prev => [...prev, { url: data.publicUrl || base64, category: galleryCategory }]);
      } else {
        setGallery(prev => [...prev, { url: base64, category: galleryCategory }]);
      }
    } catch (err) {
      console.error('Error uploading gallery photo:', err);
    } finally {
      setUploadingGallery(false);
    }
  };

  // Remove photo from gallery
  const handleRemovePhoto = (indexToRemove: number) => {
    setGallery(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Add operating region
  const handleAddRegion = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = regionInput.trim();
    if (clean && !regions.includes(clean)) {
      setRegions(prev => [...prev, clean]);
      setRegionInput('');
    }
  };

  // Remove region
  const handleRemoveRegion = (region: string) => {
    setRegions(prev => prev.filter(r => r !== region));
  };

  // Add language spoken
  const handleAddLang = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = langInput.trim();
    if (clean && !languages.includes(clean)) {
      setLanguages(prev => [...prev, clean]);
      setLangInput('');
    }
  };

  // Remove language
  const handleRemoveLang = (lang: string) => {
    setLanguages(prev => prev.filter(l => l !== lang));
  };

  // Toggle service checkbox
  const handleToggleService = (key: keyof typeof services) => {
    setServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle vehicle type checkbox
  const handleToggleVehicle = (key: keyof typeof vehicleTypes) => {
    setVehicleTypes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Calculate Profile Completeness Score and retrieve recommendations
  const getCompletenessStats = () => {
    let score = 0;
    const suggestions: { label: string; boost: number }[] = [];

    // Core identification (Always present if they exist, but verify)
    if (businessName) score += 10; else suggestions.push({ label: 'Set Business Name', boost: 10 });
    if (ownerName) score += 10; else suggestions.push({ label: 'Provide Owner Name', boost: 10 });
    
    // Custom media profile branding
    if (businessLogo) score += 10; else suggestions.push({ label: 'Upload Business Logo', boost: 10 });
    if (coverImage) score += 10; else suggestions.push({ label: 'Upload Profile Cover Banner', boost: 10 });
    
    // Description and metadata
    if (businessDescription && businessDescription.length > 30) score += 15; else suggestions.push({ label: 'Write descriptive Bio (>30 characters)', boost: 15 });
    if (yearsInBusiness) score += 5; else suggestions.push({ label: 'Add Years in Business', boost: 5 });
    
    // Specific metadata
    if (languages.length > 0) score += 5; else suggestions.push({ label: 'Add Languages Spoken', boost: 5 });
    if (regions.length > 0) score += 5; else suggestions.push({ label: 'Add Operating Regions Covered', boost: 5 });
    
    // Location and Contact info
    if (businessAddress) score += 10; else suggestions.push({ label: 'Provide Office Address', boost: 10 });
    if (latitude && longitude) score += 10; else suggestions.push({ label: 'Pin Coordinates of your office on Map', boost: 10 });
    if (businessHours) score += 5; else suggestions.push({ label: 'Specify Business Operating Hours', boost: 5 });
    if (emergencyContact) score += 5; else suggestions.push({ label: 'Add a 24/7 Emergency Helpline Number', boost: 5 });
    
    // Gallery
    if (gallery.length > 0) score += 10; else suggestions.push({ label: 'Upload at least one Office/Fleet photo to Gallery', boost: 10 });

    return { score, suggestions };
  };

  const { score: completenessPercent, suggestions: missingSuggestions } = getCompletenessStats();

  // Save changes via standard backend POST route
  const handleSaveChanges = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payloadDetails = {
        businessName,
        ownerName,
        mobileNumber,
        emailAddress,
        businessAddress,
        state,
        district,
        yearsInBusiness,
        businessDescription,
        businessLogo,
        coverImage,
        businessHours,
        emergencyContact,
        website,
        facebookUrl,
        instagramUrl,
        latitude,
        longitude,
        operatingRegions: regions,
        languagesSpoken: languages,
        gallery,
        services,
        vehicleTypes
      };

      const res = await fetch('/api/taxi-operator/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.email,
          ...payloadDetails
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          onUpdateUser(data.user);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4000);
        } else {
          alert('Failed to update operator profile on the database.');
        }
      } else {
        alert('Could not save profile details to HillyTrip servers.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Error occurred while synchronizing profile edits.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="operator_profile_editor">
      {/* COMPLETENESS HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className="w-48 h-48 text-emerald-400" />
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Business Profile Integrity</span>
            </h3>
            <p className="text-slate-400 text-xs leading-normal">
              Travelers are <strong>85% more likely</strong> to choose taxi operators with a fully completed profile. Complete your setup to qualify for premium verification badges.
            </p>
            
            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>PROFILE COMPLETENESS</span>
                <span className="font-bold text-emerald-400">{completenessPercent}% COMPLETE</span>
              </div>
              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    completenessPercent < 50 ? 'bg-amber-500' : completenessPercent < 85 ? 'bg-sky-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${completenessPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actionable suggestions */}
          {missingSuggestions.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 lg:w-80 shrink-0 text-xs">
              <p className="font-bold text-white uppercase text-[10px] tracking-wider mb-2 text-slate-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Next Steps for 100% Boost:</span>
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {missingSuggestions.slice(0, 3).map((sug, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-900 border border-slate-800/50 p-1.5 rounded-lg font-mono">
                    <span className="text-slate-300 truncate mr-2">✦ {sug.label}</span>
                    <span className="text-emerald-400 shrink-0 font-bold">+{sug.boost}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto pb-px gap-1">
        {[
          { id: 'basic', label: 'Basic Business Info', icon: Building },
          { id: 'gallery', label: 'Office & Fleet Gallery', icon: ImageIcon },
          { id: 'services', label: 'Services & Fleet Type', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 rounded-t-xl shrink-0 ${
                isActive 
                  ? 'border-amber-500 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* FORM SECTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {/* BASIC BUSINESS PROFILE */}
        {activeSubTab === 'basic' && (
          <div className="space-y-6">
            {/* Logo and Cover Banner Editor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
              {/* Cover image banner */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">COVER IMAGE BANNER</label>
                <div className="relative h-44 w-full bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden flex items-center justify-center">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover Banner" className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-[11px] text-slate-500">No cover image uploaded</p>
                    </div>
                  )}
                  
                  {/* Upload overlay */}
                  <label className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 border border-slate-800 shadow-lg">
                    {uploadingCover ? <span className="animate-spin">⌛</span> : <UploadCloud className="w-3.5 h-3.5" />}
                    <span>{coverImage ? 'Change Cover' : 'Upload Cover'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                  </label>
                </div>
              </div>

              {/* Logo Profile upload */}
              <div className="space-y-2 flex flex-col justify-between">
                <div>
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">BUSINESS LOGO</label>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">Represent your brand in quotation bids. Max 2MB square photo.</p>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 relative shadow-inner">
                    {businessLogo ? (
                      <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building className="w-8 h-8 text-slate-700" />
                    )}
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-xs">⌛</div>
                    )}
                  </div>
                  
                  <label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-200/50 dark:border-slate-700 shadow-sm">
                    <span>Upload Logo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                </div>
              </div>
            </div>

            {/* Standard Grid Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">Business Registered Name *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    required
                    value={businessName} 
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Darjeeling Hill Luxury Cabs" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">Owner / Representative Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    required
                    value={ownerName} 
                    onChange={e => setOwnerName(e.target.value)}
                    placeholder="e.g. Sonam Tshering" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">Primary Booking Mobile *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="tel" 
                    required
                    value={mobileNumber} 
                    onChange={e => setMobileNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">Booking Email Address *</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="email" 
                    required
                    value={emailAddress} 
                    onChange={e => setEmailAddress(e.target.value)}
                    placeholder="e.g. contact@hillcabs.com" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">Years in Business</label>
                <input 
                  type="number" 
                  min="0"
                  value={yearsInBusiness} 
                  onChange={e => setYearsInBusiness(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">Standard Operating Hours</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={businessHours} 
                    onChange={e => setBusinessHours(e.target.value)}
                    placeholder="e.g. Daily 8:00 AM - 10:00 PM" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">24/7 Emergency Helpline Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="tel" 
                    value={emergencyContact} 
                    onChange={e => setEmergencyContact(e.target.value)}
                    placeholder="e.g. +91 99332 90022" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">Physical Registered Office Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={businessAddress} 
                    onChange={e => setBusinessAddress(e.target.value)}
                    placeholder="e.g. Shop 14, Mall Road Extension, Darjeeling (Next to State Bank)" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black block mb-1">Business Description Bio *</label>
                <textarea 
                  required
                  value={businessDescription} 
                  onChange={e => setBusinessDescription(e.target.value)}
                  placeholder="Describe your driver experience, fleet size, reliability, safety practices, and tour packages. (Min 50 characters)" 
                  rows={4} 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed" 
                />
              </div>
            </div>

            {/* Operating Regions Tag Selector */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">operating regions & service corridors</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Add individual areas or specific town nodes you serve. Travelers will match quotes based on these.</p>
              
              <form onSubmit={handleAddRegion} className="flex gap-2 max-w-md">
                <input 
                  type="text" 
                  value={regionInput}
                  onChange={e => setRegionInput(e.target.value)}
                  placeholder="Add town (e.g. Kalimpong)" 
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 flex-1 focus:outline-none"
                />
                <button type="submit" className="bg-slate-900 hover:bg-black dark:bg-slate-800 text-white text-xs font-bold px-4 rounded-xl flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {regions.map((reg, index) => (
                  <span key={index} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    <span>{reg}</span>
                    <button type="button" onClick={() => handleRemoveRegion(reg)} className="text-slate-400 hover:text-slate-600 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages Tag Selector */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">languages spoken by staff/drivers</h4>
              
              <form onSubmit={handleAddLang} className="flex gap-2 max-w-md">
                <input 
                  type="text" 
                  value={langInput}
                  onChange={e => setLangInput(e.target.value)}
                  placeholder="Add language (e.g. Nepali)" 
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 flex-1 focus:outline-none"
                />
                <button type="submit" className="bg-slate-900 hover:bg-black dark:bg-slate-800 text-white text-xs font-bold px-4 rounded-xl flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {languages.map((lang, index) => (
                  <span key={index} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    <span>{lang}</span>
                    <button type="button" onClick={() => handleRemoveLang(lang)} className="text-slate-400 hover:text-slate-600 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">social profiles & website (optional)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Website URL</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.hillcabs.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Facebook Page</label>
                  <div className="relative">
                    <Facebook className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input type="text" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/hillcabs" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Instagram Handle</label>
                  <div className="relative">
                    <Instagram className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input type="text" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/hillcabs" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 p-2.5 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinates / Map Simulator section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-amber-500 animate-bounce" />
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">office geospatial coordinate mapping</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Required for geofencing and nearest-dispatch routing. Input exact Google Maps latitude & longitude coordinates.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Latitude</label>
                    <input type="text" value={latitude} onChange={e => setLatitude(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono font-bold text-slate-700 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Longitude</label>
                    <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 font-mono font-bold text-slate-700 dark:text-slate-200 focus:outline-none" />
                  </div>
                  
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40 p-3 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Coordinates will be verified by HillyTrip field validation officers before featuring on local map searches.</span>
                  </div>
                </div>

                {/* Simulated Geolocation Map widget */}
                <div className="md:col-span-2 bg-slate-950 border border-slate-900 h-44 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#475569 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
                  
                  <div className="z-10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg">🛰️ HILLYTRIP SPATIAL SIMULATOR</span>
                    <span className="text-emerald-400 font-bold">● ONLINE STATE</span>
                  </div>

                  <div className="z-10 flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500 flex items-center justify-center animate-ping absolute" />
                    <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center text-amber-500 font-black text-sm z-10 shadow-lg shadow-amber-500/20">
                      🚖
                    </div>
                  </div>

                  <div className="z-10 bg-slate-900/95 border border-slate-800 rounded-xl p-2 px-3 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                    <div className="truncate mr-4">
                      📍 Lat: {latitude} | Lon: {longitude}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setLatitude('27.0398'); // Darjeeling base
                        setLongitude('88.2638');
                      }}
                      className="text-amber-400 hover:underline font-bold shrink-0 cursor-pointer"
                    >
                      Reset to Darjeeling Base
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OFFICE & FLEET GALLERY */}
        {activeSubTab === 'gallery' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">Manage Operator Visual Assets</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Upload photos of your actual office lobby, registered cars and SUVs in your fleet, and your team of local drivers. Maximum 20 photos.
              </p>
            </div>

            {/* Gallery Upload Actions */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Category for next uploads:</span>
                <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-bold">
                  {(['fleet', 'office', 'team'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGalleryCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                        galleryCategory === cat 
                          ? 'bg-slate-900 text-white dark:bg-slate-800' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Input */}
              <label className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm">
                {uploadingGallery ? <span className="animate-spin">⌛</span> : <UploadCloud className="w-4 h-4" />}
                <span>Upload {galleryCategory.toUpperCase()} Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={uploadingGallery} />
              </label>
            </div>

            {/* Gallery Photo List Counter */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>ACTIVE ASSETS</span>
              <span>{gallery.length} / 20 PHOTO ITEMS</span>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((img, idx) => (
                <div key={idx} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm">
                  <img src={img.url} alt={`Gallery Asset ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  
                  {/* Category Tag overlay */}
                  <span className="absolute top-2 left-2 bg-slate-900/85 text-amber-400 px-2 py-0.5 rounded-md text-[9px] font-mono tracking-wider font-bold uppercase">
                    {img.category}
                  </span>

                  {/* Delete button hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => handleRemovePhoto(idx)}
                      className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full shadow-lg transition-all transform hover:scale-110 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {gallery.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400">
                  <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs">No photos uploaded to your gallery yet. Complete your gallery to get 10% completeness boost.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SERVICES OFFERED & VEHICLES */}
        {activeSubTab === 'services' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">Service Portfolio & Vehicle Capabilities</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Check all vehicle categories you actively hold in your fleet and check the trip service categories you cover. Travelers match with operators based on these parameters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vehicle Types */}
              <div className="space-y-4">
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">AVAILABLE VEHICLE CATEGORIES</h5>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {[
                    { id: 'suv', label: 'SUV (e.g. Innova Crysta, Scorpio, Bolero)', desc: 'Heavy duty high-altitude mountain utility' },
                    { id: 'sedan', label: 'Sedan (e.g. Dzire, Etios)', desc: 'Comfortable family cruising on plain highways' },
                    { id: 'hatchback', label: 'Hatchback (e.g. Alto, WagonR)', desc: 'Pocket-friendly local sightseeing runs' },
                    { id: 'luxury', label: 'Luxury Class (e.g. Fortuner, Pajero)', desc: 'Premium executive transfers with blankets/wifi' },
                    { id: 'traveller', label: 'Force Traveller / Minibus', desc: 'Large tour groups (12-26 passengers)' }
                  ].map(v => (
                    <label key={v.id} className="flex items-start gap-3 cursor-pointer p-1.5 hover:bg-slate-100/55 dark:hover:bg-slate-900 rounded-lg transition-all">
                      <input 
                        type="checkbox" 
                        checked={vehicleTypes[v.id as keyof typeof vehicleTypes]} 
                        onChange={() => handleToggleVehicle(v.id as any)}
                        className="w-4.5 h-4.5 text-amber-500 accent-amber-500 focus:ring-amber-400 rounded mt-0.5" 
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{v.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{v.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Specific Service Offerings */}
              <div className="space-y-4">
                <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">SERVICE CAPABILITIES & COVERAGE</h5>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {[
                    { id: 'airportTransfer', label: 'Airport Transfer Corridor', desc: 'Reliable punctual pickups from Bagdogra, Pakyong or Kazi Nazrul Islam airports' },
                    { id: 'railwayPickup', label: 'Railway Junction Pickup', desc: 'Train alignment monitoring with board cards from NJP, Kalka or Haridwar' },
                    { id: 'sightseeing', label: 'Local Tourist Sightseeing', desc: 'Pre-vetted tour packages (3-point, 5-point, 7-point, or custom local tours)' },
                    { id: 'multiDayTours', label: 'Multi-Day Himalayan Tours', desc: 'Dedicated car/driver for complete 5-10 day regional tours' },
                    { id: 'outstationTrips', label: 'Outstation Intercity Runs', desc: 'One-way drop-offs or round-trips to outside states/districts' },
                    { id: 'corporateTravel', label: 'Corporate & Executive Travel', desc: 'GST billing and neat corporate arrangements' },
                    { id: 'weddingTravel', label: 'Wedding & Bulk Event Fleet', desc: 'Coordinated dispatching of multiple clean cabs for guests' }
                  ].map(s => (
                    <label key={s.id} className="flex items-start gap-3 cursor-pointer p-1.5 hover:bg-slate-100/55 dark:hover:bg-slate-900 rounded-lg transition-all">
                      <input 
                        type="checkbox" 
                        checked={services[s.id as keyof typeof services]} 
                        onChange={() => handleToggleService(s.id as any)}
                        className="w-4.5 h-4.5 text-amber-500 accent-amber-500 focus:ring-amber-400 rounded mt-0.5" 
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{s.label}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{s.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SAVE ACTIONS BAR */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl">
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Operator business profile synchronized successfully!</span>
            </motion.div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={saving}
          className="bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <span className="animate-spin">⌛</span>
          ) : (
            <CheckCircle className="w-4 h-4 text-amber-400" />
          )}
          <span>{saving ? 'Syncing Profile...' : 'Save Profile Changes'}</span>
        </button>
      </div>
    </div>
  );
}
