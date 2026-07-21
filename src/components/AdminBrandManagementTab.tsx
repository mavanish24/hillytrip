import React, { useState, useEffect } from 'react';
import { useBranding } from './BrandingContext';
import { SiteSettings } from '../types';
import { 
  UploadCloud, Save, Sparkles, Check, RefreshCw, History, Info, AlertTriangle, 
  Settings, Type, Image, Globe, ChevronDown, CheckCircle, Video, Plus, Trash2, ArrowLeft, X
} from 'lucide-react';

export function AdminBrandManagementTab() {
  const { publishedSettings, refreshSettings, previewSettings, setPreviewSettings } = useBranding();
  
  // CMS State
  const [siteName, setSiteName] = useState('');
  const [tagline, setTagline] = useState('');
  const [footerCopyright, setFooterCopyright] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  
  // Logo States
  const [desktopLogo, setDesktopLogo] = useState('');
  const [mobileLogo, setMobileLogo] = useState('');
  const [footerLogo, setFooterLogo] = useState('');
  const [whiteLogo, setWhiteLogo] = useState('');
  const [darkLogo, setDarkLogo] = useState('');
  
  // Icon States
  const [appIcon, setAppIcon] = useState('');
  const [favicon, setFavicon] = useState('');
  const [appleTouchIcon, setAppleTouchIcon] = useState('');
  const [androidPwaIcon, setAndroidPwaIcon] = useState('');
  
  // Hero Assets
  const [heroVideo, setHeroVideo] = useState('');
  const [heroImage, setHeroImage] = useState('');
  
  // Theme Color States
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9');
  const [secondaryColor, setSecondaryColor] = useState('#0f172a');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [successColor, setSuccessColor] = useState('#10b981');
  const [warningColor, setWarningColor] = useState('#f59e0b');
  const [errorColor, setErrorColor] = useState('#ef4444');
  
  // Typography States
  const [headingFont, setHeadingFont] = useState('Plus Jakarta Sans');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [buttonFont, setButtonFont] = useState('Plus Jakarta Sans');
  
  // Social Links
  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  
  // System State
  interface UploadSession {
    file: File | null;
    previewUrl: string | null;
    progress: number;
    status: 'idle' | 'previewing' | 'uploading' | 'success' | 'error';
    errorMsg: string | null;
    xhr: XMLHttpRequest | null;
  }

  const [uploadSessions, setUploadSessions] = useState<Record<string, UploadSession>>({});
  const [versions, setVersions] = useState<SiteSettings[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'logos' | 'colors' | 'typography' | 'history'>('info');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  const fontOptions = [
    'Inter', 'Plus Jakarta Sans', 'Space Grotesk', 'Outfit', 'Playfair Display', 
    'Lora', 'JetBrains Mono', 'Work Sans', 'Manrope', 'Lexend', 'DM Sans', 'Merriweather'
  ];

  // Load current values on mount or settings load
  useEffect(() => {
    if (publishedSettings) {
      setSiteName(publishedSettings.site_name || '');
      setTagline(publishedSettings.tagline || '');
      setFooterCopyright(publishedSettings.footer_copyright || '');
      setContactEmail(publishedSettings.contact_email || '');
      setSupportEmail(publishedSettings.support_email || '');
      
      setDesktopLogo(publishedSettings.desktop_logo_url || '');
      setMobileLogo(publishedSettings.mobile_logo_url || '');
      setFooterLogo(publishedSettings.footer_logo_url || '');
      setWhiteLogo(publishedSettings.white_logo_url || '');
      setDarkLogo(publishedSettings.dark_logo_url || '');
      
      setAppIcon(publishedSettings.app_icon_url || '');
      setFavicon(publishedSettings.favicon_url || '');
      setAppleTouchIcon(publishedSettings.apple_touch_icon_url || '');
      setAndroidPwaIcon(publishedSettings.android_pwa_icon_url || '');
      
      setHeroVideo(publishedSettings.hero_video_url || '');
      setHeroImage(publishedSettings.hero_image_url || '');
      
      setPrimaryColor(publishedSettings.primary_color || '#0ea5e9');
      setSecondaryColor(publishedSettings.secondary_color || '#0f172a');
      setAccentColor(publishedSettings.accent_color || '#f59e0b');
      setSuccessColor(publishedSettings.success_color || '#10b981');
      setWarningColor(publishedSettings.warning_color || '#f59e0b');
      setErrorColor(publishedSettings.error_color || '#ef4444');
      
      setHeadingFont(publishedSettings.heading_font || 'Plus Jakarta Sans');
      setBodyFont(publishedSettings.body_font || 'Inter');
      setButtonFont(publishedSettings.button_font || 'Plus Jakarta Sans');
      
      setFacebookUrl(publishedSettings.social_links?.facebook || '');
      setTwitterUrl(publishedSettings.social_links?.twitter || '');
      setInstagramUrl(publishedSettings.social_links?.instagram || '');
      setYoutubeUrl(publishedSettings.social_links?.youtube || '');
      setLinkedinUrl(publishedSettings.social_links?.linkedin || '');
    }
    fetchVersions();
  }, [publishedSettings]);

  // Clean up any preview settings on unmount
  useEffect(() => {
    return () => {
      setPreviewSettings(null);
    };
  }, [setPreviewSettings]);

  // Update dynamic preview on any value changes
  useEffect(() => {
    const currentPreviewState: SiteSettings = {
      id: 'live_preview_id',
      is_active: false,
      site_name: siteName,
      tagline: tagline,
      footer_copyright: footerCopyright,
      contact_email: contactEmail,
      support_email: supportEmail,
      desktop_logo_url: desktopLogo,
      mobile_logo_url: mobileLogo,
      footer_logo_url: footerLogo,
      white_logo_url: whiteLogo,
      dark_logo_url: darkLogo,
      app_icon_url: appIcon,
      favicon_url: favicon,
      apple_touch_icon_url: appleTouchIcon,
      android_pwa_icon_url: androidPwaIcon,
      hero_video_url: heroVideo,
      hero_image_url: heroImage,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      success_color: successColor,
      warning_color: warningColor,
      error_color: errorColor,
      heading_font: headingFont,
      body_font: bodyFont,
      button_font: buttonFont,
      default_language: 'en',
      social_links: {
        facebook: facebookUrl,
        twitter: twitterUrl,
        instagram: instagramUrl,
        youtube: youtubeUrl,
        linkedin: linkedinUrl
      },
      updated_at: new Date().toISOString(),
      updated_by: 'Admin Preview',
      status: 'draft'
    };
    
    // Set preview settings globally to trigger dynamic stylesheet updates in real-time
    setPreviewSettings(currentPreviewState);
  }, [
    siteName, tagline, footerCopyright, contactEmail, supportEmail,
    desktopLogo, mobileLogo, footerLogo, whiteLogo, darkLogo,
    appIcon, favicon, appleTouchIcon, androidPwaIcon,
    heroVideo, heroImage, primaryColor, secondaryColor, accentColor,
    successColor, warningColor, errorColor, headingFont, bodyFont, buttonFont,
    facebookUrl, twitterUrl, instagramUrl, youtubeUrl, linkedinUrl
  ]);

  // Get Admin Auth Headers
  const getAuthHeaders = (extra: Record<string, string> = {}) => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
    const adminEmail = localStorage.getItem('hillytrip_admin_email') || '';
    const headers: Record<string, string> = {
      'x-admin-email': adminEmail,
      'x-admin-password': 'admin123',
      ...extra
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchVersions = async () => {
    try {
      const res = await fetch('/api/admin/brand/versions', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch (err) {
      console.error('Failed to fetch version history:', err);
    }
  };

  // File Validation
  const validateFile = (file: File, field: string): string | null => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const isVideo = fileType.startsWith('video/') || fileName.endsWith('.mp4');
    
    // Accept extensions: png, svg, jpg, jpeg, webp, ico, mp4
    const validExtensions = ['.png', '.svg', '.jpg', '.jpeg', '.webp', '.ico', '.mp4'];
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExt) {
      return 'Invalid file format. Accepted formats: PNG, SVG, JPG, WEBP, ICO, MP4';
    }
    
    if (isVideo) {
      if (!fileName.endsWith('.mp4') && fileType !== 'video/mp4') {
        return 'Only MP4 format is supported for videos.';
      }
      if (file.size > 100 * 1024 * 1024) {
        return 'Video file is too large. Maximum size is 100 MB.';
      }
    } else {
      if (file.size > 10 * 1024 * 1024) {
        return 'Image file is too large. Maximum size is 10 MB.';
      }
    }
    return null;
  };

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent, field: string, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: active }));
  };

  const handleDrop = async (e: React.DragEvent, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [field]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0], field);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0], field);
    }
  };

  const handleFileSelection = (file: File, field: string) => {
    const error = validateFile(file, field);
    if (error) {
      setErrorMessage(error);
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    setErrorMessage('');
    const previewUrl = URL.createObjectURL(file);
    
    setUploadSessions(prev => ({
      ...prev,
      [field]: {
        file,
        previewUrl,
        progress: 0,
        status: 'previewing',
        errorMsg: null,
        xhr: null
      }
    }));
  };

  const startUpload = async (field: string) => {
    const session = uploadSessions[field];
    if (!session || !session.file) return;
    
    setUploadSessions(prev => {
      const s = prev[field];
      if (!s) return prev;
      return {
        ...prev,
        [field]: { ...s, status: 'uploading', progress: 0, errorMsg: null }
      };
    });
    
    const file = session.file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      
      const xhr = new XMLHttpRequest();
      
      setUploadSessions(prev => {
        const s = prev[field];
        if (!s) return prev;
        return {
          ...prev,
          [field]: { ...s, xhr }
        };
      });
      
      xhr.open('POST', '/api/admin/brand/upload', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('x-admin-password', 'admin123');
      xhr.setRequestHeader('x-admin-email', localStorage.getItem('hillytrip_admin_email') || '');
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.withCredentials = true;
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadSessions(prev => {
            const s = prev[field];
            if (!s) return prev;
            return {
              ...prev,
              [field]: { ...s, progress: percentComplete }
            };
          });
        }
      };
      
      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success && response.url) {
              if (field === 'desktopLogo') setDesktopLogo(response.url);
              else if (field === 'mobileLogo') setMobileLogo(response.url);
              else if (field === 'footerLogo') setFooterLogo(response.url);
              else if (field === 'whiteLogo') setWhiteLogo(response.url);
              else if (field === 'darkLogo') setDarkLogo(response.url);
              else if (field === 'appIcon') setAppIcon(response.url);
              else if (field === 'favicon') setFavicon(response.url);
              else if (field === 'appleTouchIcon') setAppleTouchIcon(response.url);
              else if (field === 'androidPwaIcon') setAndroidPwaIcon(response.url);
              else if (field === 'heroVideo') setHeroVideo(response.url);
              else if (field === 'heroImage') setHeroImage(response.url);
              
              setUploadSessions(prev => {
                const s = prev[field];
                if (!s) return prev;
                return {
                  ...prev,
                  [field]: { ...s, status: 'success', progress: 100 }
                };
              });
              
              const locationMsg = response.isLocal 
                ? 'locally on the server' 
                : 'directly to Supabase storage bucket "branding"';
              setSuccessMessage(`Spectacular! ${field} asset uploaded successfully ${locationMsg} and updated live.`);
              await refreshSettings();
              
              setTimeout(() => {
                setSuccessMessage('');
                setUploadSessions(prev => {
                  const { [field]: removed, ...rest } = prev;
                  return rest;
                });
              }, 4000);
            } else {
              throw new Error(response.error || 'Server rejected file upload');
            }
          } catch (err: any) {
            handleUploadError(field, err.message || 'Error processing server response');
          }
        } else {
          let errMsg = 'Server returned an error status';
          try {
            const response = JSON.parse(xhr.responseText);
            errMsg = response.error || errMsg;
          } catch (e) {}
          handleUploadError(field, errMsg);
        }
      };
      
      xhr.onerror = () => {
        handleUploadError(field, 'Network error during upload. Please check your internet connection.');
      };
      
      xhr.onabort = () => {
        setUploadSessions(prev => {
          const s = prev[field];
          if (!s) return prev;
          return {
            ...prev,
            [field]: { ...s, status: 'idle', progress: 0, file: null, previewUrl: null, xhr: null }
          };
        });
        setErrorMessage('Upload was canceled by the user.');
        setTimeout(() => setErrorMessage(''), 4000);
      };
      
      const filename = `${field}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      xhr.send(JSON.stringify({
        base64: base64Data,
        filename,
        mimeType: file.type,
        field
      }));
    };
    
    reader.onerror = () => {
      handleUploadError(field, 'Failed to read local file.');
    };
  };

  const handleUploadError = (field: string, errorMsg: string) => {
    setUploadSessions(prev => {
      const s = prev[field];
      if (!s) return prev;
      return {
        ...prev,
        [field]: { ...s, status: 'error', errorMsg, xhr: null }
      };
    });
    setErrorMessage(errorMsg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const cancelUpload = (field: string) => {
    const session = uploadSessions[field];
    if (!session) return;
    
    if (session.status === 'uploading' && session.xhr) {
      session.xhr.abort();
    } else {
      if (session.previewUrl) {
        URL.revokeObjectURL(session.previewUrl);
      }
      setUploadSessions(prev => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const deleteAsset = async (field: string) => {
    if (!confirm(`Are you sure you want to delete the asset for ${field}? This will clear it immediately.`)) {
      return;
    }
    
    try {
      const res = await fetch('/api/admin/brand/delete-asset', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ field })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete asset');
      }
      
      if (field === 'desktopLogo') setDesktopLogo('');
      else if (field === 'mobileLogo') setMobileLogo('');
      else if (field === 'footerLogo') setFooterLogo('');
      else if (field === 'whiteLogo') setWhiteLogo('');
      else if (field === 'darkLogo') setDarkLogo('');
      else if (field === 'appIcon') setAppIcon('');
      else if (field === 'favicon') setFavicon('');
      else if (field === 'appleTouchIcon') setAppleTouchIcon('');
      else if (field === 'androidPwaIcon') setAndroidPwaIcon('');
      else if (field === 'heroVideo') setHeroVideo('');
      else if (field === 'heroImage') setHeroImage('');
      
      setSuccessMessage(`Asset for ${field} deleted successfully.`);
      await refreshSettings();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete asset');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const payload: Partial<SiteSettings> = {
        site_name: siteName,
        tagline,
        footer_copyright: footerCopyright,
        contact_email: contactEmail,
        support_email: supportEmail,
        desktop_logo_url: desktopLogo,
        mobile_logo_url: mobileLogo,
        footer_logo_url: footerLogo,
        white_logo_url: whiteLogo,
        dark_logo_url: darkLogo,
        app_icon_url: appIcon,
        favicon_url: favicon,
        apple_touch_icon_url: appleTouchIcon,
        android_pwa_icon_url: androidPwaIcon,
        hero_video_url: heroVideo,
        hero_image_url: heroImage,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        success_color: successColor,
        warning_color: warningColor,
        error_color: errorColor,
        heading_font: headingFont,
        body_font: bodyFont,
        button_font: buttonFont,
        social_links: {
          facebook: facebookUrl,
          twitter: twitterUrl,
          instagram: instagramUrl,
          youtube: youtubeUrl,
          linkedin: linkedinUrl
        },
        updated_by: 'Administrator'
      };

      const res = await fetch('/api/admin/brand/save-draft', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Could not save draft on backend');
      }

      setSuccessMessage('Branding configuration draft saved successfully! You can find it in Version History.');
      await fetchVersions();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save branding draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const payload: Partial<SiteSettings> = {
        site_name: siteName,
        tagline,
        footer_copyright: footerCopyright,
        contact_email: contactEmail,
        support_email: supportEmail,
        desktop_logo_url: desktopLogo,
        mobile_logo_url: mobileLogo,
        footer_logo_url: footerLogo,
        white_logo_url: whiteLogo,
        dark_logo_url: darkLogo,
        app_icon_url: appIcon,
        favicon_url: favicon,
        apple_touch_icon_url: appleTouchIcon,
        android_pwa_icon_url: androidPwaIcon,
        hero_video_url: heroVideo,
        hero_image_url: heroImage,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        success_color: successColor,
        warning_color: warningColor,
        error_color: errorColor,
        heading_font: headingFont,
        body_font: bodyFont,
        button_font: buttonFont,
        social_links: {
          facebook: facebookUrl,
          twitter: twitterUrl,
          instagram: instagramUrl,
          youtube: youtubeUrl,
          linkedin: linkedinUrl
        },
        updated_by: 'Administrator'
      };

      const res = await fetch('/api/admin/brand/publish', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to publish brand changes');
      }

      const data = await res.json();
      setPreviewSettings(null); // Clear preview override to apply standard global setting
      await refreshSettings();
      await fetchVersions();
      
      setSuccessMessage('Spectacular! Brand settings published live globally! Clear your cache or reload to verify.');
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      const res = await fetch(`/api/admin/brand/restore/${versionId}`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' })
      });

      if (!res.ok) {
        throw new Error('Failed to restore selected brand version');
      }

      setPreviewSettings(null); // Reset preview
      await refreshSettings();
      await fetchVersions();
      
      setSuccessMessage(`Successfully restored brand version ${versionId} live!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Restore operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderUploadField = (label: string, value: string, field: string, accept: string, description: string) => {
    const isDragActive = dragActive[field] || false;
    const session = uploadSessions[field];

    return (
      <div className="flex flex-col space-y-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
            <span>{label}</span>
          </label>
          {value && !session && (
            <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Configured
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
        
        {/* Main interactive area */}
        <div 
          onDragOver={(e) => handleDrag(e, field, true)}
          onDragLeave={(e) => handleDrag(e, field, false)}
          onDrop={(e) => handleDrop(e, field)}
          className={`relative border-2 border-dashed rounded-xl p-5 transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[160px] ${
            isDragActive 
              ? 'border-emerald-500 bg-emerald-500/10' 
              : 'border-slate-300 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          {/* Active upload session states */}
          {session ? (
            <div className="w-full flex flex-col items-center space-y-4 py-2">
              {/* Status: Previewing */}
              {session.status === 'previewing' && (
                <>
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-900/50">
                    <span className="animate-ping w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Asset Preview (Not Saved Yet)
                  </div>
                  
                  {session.file && session.file.type.startsWith('video/') ? (
                    <div className="relative w-full max-w-[280px] rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
                      <video src={session.previewUrl || undefined} controls className="w-full max-h-[120px] object-contain" />
                    </div>
                  ) : (
                    <img 
                      src={session.previewUrl || undefined} 
                      alt="Local Preview" 
                      className="max-h-[100px] max-w-[200px] object-contain rounded-lg border border-slate-200 bg-white/10 p-1" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="font-bold block truncate max-w-[240px] text-slate-700 dark:text-slate-300">{session.file?.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{session.file && formatSize(session.file.size)}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => startUpload(field)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" /> Save to Supabase
                    </button>
                    <button
                      onClick={() => cancelUpload(field)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Status: Uploading */}
              {session.status === 'uploading' && (
                <div className="w-full max-w-[260px] flex flex-col items-center">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Uploading: {session.progress}%</span>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3 shadow-inner">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-150 rounded-full"
                      style={{ width: `${session.progress}%` }}
                    />
                  </div>
                  
                  <button
                    onClick={() => cancelUpload(field)}
                    className="mt-4 flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-bold transition cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Stop Upload
                  </button>
                </div>
              )}

              {/* Status: Error */}
              {session.status === 'error' && (
                <div className="flex flex-col items-center max-w-[260px]">
                  <span className="p-1.5 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-full mb-1">
                    <X className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-black text-red-600">Upload Failed</span>
                  <p className="text-[10px] text-slate-500 mt-1 mb-3 leading-relaxed text-center break-words max-w-full">
                    {session.errorMsg || 'Failed to upload brand asset.'}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startUpload(field)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                    <button
                      onClick={() => cancelUpload(field)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Status: Success */}
              {session.status === 'success' && (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
                  <span className="text-xs font-extrabold text-emerald-600 mt-2">Saved Successfully!</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Asset synced with Supabase.</span>
                </div>
              )}
            </div>
          ) : (
            /* Idle State: Saved values vs empty slate */
            <>
              {value ? (
                <div className="flex flex-col items-center space-y-4">
                  {accept.includes('video') ? (
                    <div className="relative w-full max-w-[280px] rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-inner">
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-md">
                        <Video className="w-3 h-3" /> Active Loop
                      </div>
                      <video src={value} autoPlay loop muted playsInline className="w-full max-h-[120px] object-contain" />
                    </div>
                  ) : (
                    <img 
                      src={value} 
                      alt={label} 
                      className="h-16 max-w-[200px] object-contain rounded-lg border border-slate-200 bg-white/10 p-1.5 shadow-sm" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  <div className="flex flex-col items-center space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-500 break-all max-w-[240px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200/60 dark:border-slate-800">
                      {value}
                    </span>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-[10px] cursor-pointer transition">
                        <RefreshCw className="w-3 h-3 text-slate-500" /> Replace
                        <input 
                          type="file" 
                          className="hidden" 
                          accept={accept} 
                          onChange={(e) => handleFileChange(e, field)} 
                        />
                      </label>
                      <button
                        onClick={() => deleteAsset(field)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 bg-white dark:bg-slate-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-[10px] cursor-pointer transition"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">
                      Choose a file
                      <input 
                        type="file" 
                        className="hidden" 
                        accept={accept} 
                        onChange={(e) => handleFileChange(e, field)} 
                      />
                    </span>
                    <span className="text-slate-400"> or drag & drop</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                    {accept.includes('video') ? 'MP4 (Max 100MB)' : 'Images (Max 10MB)'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Manual URL override option */}
        {!session && (
          <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-850/60 flex flex-col space-y-1 text-left w-full">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Or input asset URL manually:</span>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                const newVal = e.target.value;
                if (field === 'desktopLogo') setDesktopLogo(newVal);
                else if (field === 'mobileLogo') setMobileLogo(newVal);
                else if (field === 'footerLogo') setFooterLogo(newVal);
                else if (field === 'whiteLogo') setWhiteLogo(newVal);
                else if (field === 'darkLogo') setDarkLogo(newVal);
                else if (field === 'appIcon') setAppIcon(newVal);
                else if (field === 'favicon') setFavicon(newVal);
                else if (field === 'appleTouchIcon') setAppleTouchIcon(newVal);
                else if (field === 'androidPwaIcon') setAndroidPwaIcon(newVal);
                else if (field === 'heroVideo') setHeroVideo(newVal);
                else if (field === 'heroImage') setHeroImage(newVal);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500"
              placeholder="https://example.com/my-asset.png"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">🎨</span> Brand Settings & Assets CMS
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Centralized platform branding manager. Customize logos, icons, colors, and typography instantly without touching any code.
          </p>
        </div>
        
        {/* Save & Publish Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 transition cursor-pointer"
          >
            <History className="w-4 h-4" /> Save Draft
          </button>
          
          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 shadow-md shadow-emerald-500/10 disabled:opacity-50 transition cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Publish Changes
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-bold">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border-2 border-red-400 text-red-950 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-bold">{errorMessage}</span>
        </div>
      )}

      {/* Navigation Subtabs */}
      <div className="flex flex-wrap border-b border-slate-200">
        {[
          { id: 'info', label: '🌐 Site Information', icon: Globe },
          { id: 'logos', label: '🖼️ Logos & Assets', icon: Image },
          { id: 'colors', label: '🎨 Color Scheme', icon: Settings },
          { id: 'typography', label: '✏️ Typography', icon: Type },
          { id: 'history', label: '📜 Version History', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition ${
                isActive 
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Subtab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Editable Form Panels */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subtab: General Site Info */}
          {activeSubTab === 'info' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 text-left">
              <h3 className="text-lg font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-slate-500" /> Website Meta Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Site Name</label>
                  <input 
                    type="text" 
                    value={siteName} 
                    onChange={e => setSiteName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    placeholder="HillyTrip"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Tagline</label>
                  <input 
                    type="text" 
                    value={tagline} 
                    onChange={e => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    placeholder="India's Intelligent Mountain Travel Network"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Contact Email</label>
                  <input 
                    type="email" 
                    value={contactEmail} 
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    placeholder="contact@hillytrip.com"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Support Email</label>
                  <input 
                    type="email" 
                    value={supportEmail} 
                    onChange={e => setSupportEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    placeholder="support@hillytrip.com"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Footer Copyright</label>
                <input 
                  type="text" 
                  value={footerCopyright} 
                  onChange={e => setFooterCopyright(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  placeholder="© 2026 HillyTrip. All rights reserved."
                />
              </div>

              <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mt-6 pt-6 border-t">Social Profiles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Facebook</label>
                  <input 
                    type="text" 
                    value={facebookUrl} 
                    onChange={e => setFacebookUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Twitter (X)</label>
                  <input 
                    type="text" 
                    value={twitterUrl} 
                    onChange={e => setTwitterUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Instagram</label>
                  <input 
                    type="text" 
                    value={instagramUrl} 
                    onChange={e => setInstagramUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">YouTube</label>
                  <input 
                    type="text" 
                    value={youtubeUrl} 
                    onChange={e => setYoutubeUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subtab: Logo & File Uploads */}
          {activeSubTab === 'logos' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-8 text-left animate-fade-in">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Image className="w-5 h-5 text-slate-500" /> Platform Branding Logos</h3>
                <p className="text-xs text-slate-500 mt-1">Upload different logo configurations for maximum UI compliance across headers, footers, dark and light backgrounds.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderUploadField('Desktop Logo', desktopLogo, 'desktopLogo', 'image/*', 'The primary logo rendered in the main navbar for large displays.')}
                {renderUploadField('Mobile Logo', mobileLogo, 'mobileLogo', 'image/*', 'Compact brand emblem for mobile navigation headers.')}
                {renderUploadField('Footer Logo', footerLogo, 'footerLogo', 'image/*', 'Logo variations shown inside footer sections.')}
                {renderUploadField('White Logo (Dark Background)', whiteLogo, 'whiteLogo', 'image/*', 'All-white logo optimized for slate/dark background panels.')}
                {renderUploadField('Dark Logo (Light Background)', darkLogo, 'darkLogo', 'image/*', 'All-black/dark logo optimized for soft light background panels.')}
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-slate-500" /> Web App Launcher Icons</h3>
                <p className="text-xs text-slate-500 mt-1">Configure progressive web app (PWA) manifest and browser launcher icons.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderUploadField('App Icon (1024×1024)', appIcon, 'appIcon', 'image/*', 'Full-sized master app icon artwork (1024x1024 PNG).')}
                {renderUploadField('Favicon', favicon, 'favicon', 'image/*', 'Browser bookmark toolbar icon (.ico or .png).')}
                {renderUploadField('Apple Touch Icon', appleTouchIcon, 'appleTouchIcon', 'image/*', 'Home screen icon for iOS Safari users.')}
                {renderUploadField('Android PWA Icon', androidPwaIcon, 'androidPwaIcon', 'image/*', 'PWA launcher icon for Google Chrome Android users.')}
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-bold flex items-center gap-2"><Video className="w-5 h-5 text-slate-500" /> Home Screen Hero Assets</h3>
                <p className="text-xs text-slate-500 mt-1">Configure full screen ambient background resources for the homepage hero section.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderUploadField('Homepage Hero Video', heroVideo, 'heroVideo', 'video/*', 'High definition background video loop (.mp4, max 25MB).')}
                {renderUploadField('Homepage Hero Fallback Image', heroImage, 'heroImage', 'image/*', 'Static landscape banner for slow/offline networks.')}
              </div>
            </div>
          )}

          {/* Subtab: Brand Color Palettes */}
          {activeSubTab === 'colors' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 text-left animate-fade-in">
              <h3 className="text-lg font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-slate-500" /> Platform Color Palette</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block">Primary Color</label>
                    <span className="text-[10px] text-slate-500">Buttons, active headers & accents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-20 text-xs font-mono text-center p-1 rounded border"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block">Secondary Color</label>
                    <span className="text-[10px] text-slate-500">Sidebars, footers & main backdrops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={secondaryColor} 
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={secondaryColor} 
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-20 text-xs font-mono text-center p-1 rounded border"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block">Accent Color</label>
                    <span className="text-[10px] text-slate-500">Alert flags, secondary stars & ratings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={accentColor} 
                      onChange={e => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={accentColor} 
                      onChange={e => setAccentColor(e.target.value)}
                      className="w-20 text-xs font-mono text-center p-1 rounded border"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block">Success Color</label>
                    <span className="text-[10px] text-slate-500">Approved logs & success highlights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={successColor} 
                      onChange={e => setSuccessColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={successColor} 
                      onChange={e => setSuccessColor(e.target.value)}
                      className="w-20 text-xs font-mono text-center p-1 rounded border"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block">Warning Color</label>
                    <span className="text-[10px] text-slate-500">Pending reviews & alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={warningColor} 
                      onChange={e => setWarningColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={warningColor} 
                      onChange={e => setWarningColor(e.target.value)}
                      className="w-20 text-xs font-mono text-center p-1 rounded border"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block">Error Color</label>
                    <span className="text-[10px] text-slate-500">Rejections, deletions & crash notices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={errorColor} 
                      onChange={e => setErrorColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input 
                      type="text" 
                      value={errorColor} 
                      onChange={e => setErrorColor(e.target.value)}
                      className="w-20 text-xs font-mono text-center p-1 rounded border"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Subtab: Typography Fonts */}
          {activeSubTab === 'typography' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 text-left animate-fade-in">
              <h3 className="text-lg font-bold flex items-center gap-2"><Type className="w-5 h-5 text-slate-500" /> Platform Typography</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Heading Font</label>
                  <select 
                    value={headingFont} 
                    onChange={e => setHeadingFont(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold focus:outline-none"
                  >
                    {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Body Font</label>
                  <select 
                    value={bodyFont} 
                    onChange={e => setBodyFont(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold focus:outline-none"
                  >
                    {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-black uppercase text-slate-600 tracking-wider">Button Font</label>
                  <select 
                    value={buttonFont} 
                    onChange={e => setButtonFont(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold focus:outline-none"
                  >
                    {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                  </select>
                </div>
              </div>

              {/* Typography Preview Panel */}
              <div className="mt-8 p-6 border rounded-2xl bg-slate-50 text-left space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Typography Preview</span>
                <div className="space-y-2">
                  <h1 className="text-2xl font-black" style={{ fontFamily: `"${headingFont}", sans-serif` }}>
                    The gorgeous mountains are calling {headingFont}
                  </h1>
                  <p className="text-sm text-slate-600" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>
                    Explore off-beat scenic Himalayan villages and plan intelligent routes in Northern India. Styled elegantly in {bodyFont} body font.
                  </p>
                  <div className="pt-2">
                    <button 
                      className="px-4 py-2 rounded-xl text-white font-bold text-xs" 
                      style={{ fontFamily: `"${buttonFont}", sans-serif`, backgroundColor: primaryColor }}
                    >
                      Book Cab ({buttonFont})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab: History & Rollback */}
          {activeSubTab === 'history' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 text-left animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2"><History className="w-5 h-5 text-slate-500" /> Branding Version History</h3>
                <button 
                  onClick={fetchVersions}
                  className="p-1.5 rounded-lg border text-slate-500 hover:text-slate-900 transition flex items-center gap-1.5 text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reload List
                </button>
              </div>

              <div className="space-y-4">
                {versions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-medium">No previous versions or drafts saved yet. Save a draft or publish to start.</div>
                ) : (
                  versions.map((ver, idx) => (
                    <div 
                      key={ver.id || idx} 
                      className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition ${
                        ver.is_active 
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/10' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black uppercase text-slate-500 tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                            {ver.id?.substring(0, 12)}
                          </span>
                          
                          {ver.is_active && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                              Active Settings
                            </span>
                          )}
                          
                          {ver.status === 'draft' && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">
                              Draft Mode
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {ver.site_name || 'HillyTrip Branding Version'}
                        </p>
                        
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Updated: {ver.updated_at ? new Date(ver.updated_at).toLocaleString() : 'N/A'}</span>
                          <span>•</span>
                          <span>By: {ver.updated_by || 'Admin'}</span>
                        </div>
                      </div>

                      {/* Version Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Live colors preview badges */}
                        <div className="flex items-center -space-x-1 border p-1 rounded-lg bg-white">
                          <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: ver.primary_color }} title="Primary" />
                          <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: ver.secondary_color }} title="Secondary" />
                          <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: ver.accent_color }} title="Accent" />
                        </div>

                        {!ver.is_active && (
                          <button
                            onClick={() => handleRestoreVersion(ver.id)}
                            disabled={isSaving}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 transition cursor-pointer"
                          >
                            Restore Version
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Column: Device Live Preview Simulator */}
        <div className="space-y-6">
          <div className="sticky top-6 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col h-[580px] text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Branding Preview</span>
                <h4 className="text-sm font-black text-white">Interactive Device Simulator</h4>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full select-none animate-pulse">
                Live Rendering
              </span>
            </div>

            {/* Device Frame */}
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative flex flex-col">
              
              {/* Virtual Browser Bar */}
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2 shrink-0">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 bg-slate-950 rounded-md px-3 py-0.5 text-[9px] font-mono text-slate-500 select-none flex items-center justify-between">
                  <span>https://{siteName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'hillytrip'}.com</span>
                  <RefreshCw className="w-2 h-2" />
                </div>
              </div>

              {/* Virtual Page Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-6 relative text-slate-800 bg-white" style={{ fontFamily: `"${bodyFont}", sans-serif` }}>
                
                {/* Simulated Header Navbar */}
                <div className="border-b pb-3 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    {desktopLogo ? (
                      <img src={desktopLogo} alt="Logo" className="h-6 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-white text-[10px] font-black">H</div>
                    )}
                    <span className="text-xs font-black uppercase tracking-tight" style={{ fontFamily: `"${headingFont}", sans-serif` }}>
                      {siteName || 'HillyTrip'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-[9px] font-extrabold text-slate-500">
                    <span>Explorer</span>
                    <span>Cabs</span>
                    <span>Homestays</span>
                  </div>
                </div>

                {/* Simulated Hero Section */}
                <div 
                  className="rounded-xl h-32 relative overflow-hidden flex flex-col justify-end p-3 text-white"
                  style={{ 
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1)), url(${heroImage || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="space-y-0.5 relative z-10">
                    <h2 className="text-sm font-black" style={{ fontFamily: `"${headingFont}", sans-serif` }}>
                      {tagline || "India's Intelligent Mountain Network"}
                    </h2>
                    <p className="text-[9px] opacity-80">Book scenic drives, homestays, and tour planners.</p>
                  </div>
                </div>

                {/* Interactive buttons with theme colors */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Themes preview</span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-white shadow-sm"
                      style={{ backgroundColor: primaryColor, fontFamily: `"${buttonFont}", sans-serif` }}
                    >
                      Book Intelligent Cab
                    </button>
                    
                    <button 
                      className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold border bg-white"
                      style={{ color: primaryColor, borderColor: primaryColor, fontFamily: `"${buttonFont}", sans-serif` }}
                    >
                      Explore Destinations
                    </button>
                  </div>
                </div>

                {/* Theme palette flags */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: successColor }} />
                    <span>Success Color</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: warningColor }} />
                    <span>Warning Color</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: errorColor }} />
                    <span>Error Color</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: accentColor }} />
                    <span>Accent Color</span>
                  </div>
                </div>

                {/* Simulated Footer */}
                <div className="pt-4 border-t text-center space-y-1 shrink-0">
                  <div className="flex justify-center gap-4 text-slate-400">
                    {facebookUrl && <span className="text-[9px] font-bold">Facebook</span>}
                    {twitterUrl && <span className="text-[9px] font-bold">Twitter</span>}
                    {instagramUrl && <span className="text-[9px] font-bold">Instagram</span>}
                  </div>
                  <p className="text-[8px] text-slate-400">
                    {footerCopyright || `© 2026 ${siteName || 'HillyTrip'}. All rights reserved.`}
                  </p>
                </div>

              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-3 text-center flex items-center justify-center gap-1">
              <Info className="w-3.5 h-3.5" /> Overrides apply to the simulator instantly. Click <b>Publish</b> to save live globally.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
