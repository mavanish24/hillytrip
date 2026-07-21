import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, Search, Trash2, FolderSync, RefreshCw, Layers, CheckCircle, XCircle, 
  Eye, FileText, Info, Play, Image as ImageIcon, Database, HelpCircle, HardDrive, Shield,
  ChevronRight, Calendar, User, FileVideo, Check, AlertCircle, Copy, Link as LinkIcon
} from 'lucide-react';
import { ImageItem } from '../types';

export function AdminMediaLibraryTab() {
  const [assets, setAssets] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBucket, setActiveBucket] = useState<string>('destination-images');
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [aiFilter, setAiFilter] = useState<string>('all');
  
  // Selected single asset for full inspector modal
  const [selectedAsset, setSelectedAsset] = useState<ImageItem | null>(null);
  
  // Migration UI state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{ name: string; progress: number; status: 'uploading' | 'success' | 'error'; error?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replacement / Action State
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetCategory, setMoveTargetCategory] = useState('gallery');
  const [moveTargetEntityId, setMoveTargetEntityId] = useState('');
  const [isMoving, setIsMoving] = useState(false);

  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  const [isModerating, setIsModerating] = useState(false);

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [generatingSigned, setGeneratingSigned] = useState(false);

  // Notification Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const buckets = [
    { id: 'destination-images', name: 'Destination Assets', icon: ImageIcon, desc: 'Hero backgrounds, galleries and user contributions.' },
    { id: 'attraction-images', name: 'Attraction Gallery', icon: Layers, desc: 'Hotspots, monuments and viewpoint illustrations.' },
    { id: 'route-images', name: 'Route & Maps Gallery', icon: Database, desc: 'Pass routes, elevation overlays and maps media.' },
    { id: 'homestay-images', name: 'Homestay Catalog', icon: HardDrive, desc: 'Room, food, amenities and structural portraits.' },
    { id: 'user-avatars', name: 'User Avatars (Private)', icon: User, desc: 'Encrypted partner and customer profile avatars.', private: true },
    { id: 'community-photos', name: 'Community Photos', icon: HelpCircle, desc: 'Moderation pipeline for traveler trip shares.', private: true },
    { id: 'website-assets', name: 'Website Theme Assets', icon: FileText, desc: 'Brand logos, system videos and theme elements.' },
    { id: 'weather-assets', name: 'Weather Overlays', icon: RefreshCw, desc: 'Seasonal atmospheric live backgrounds.' },
    { id: 'seasonal-assets', name: 'Seasonal Banners', icon: Calendar, desc: 'Festival, autumn/winter custom promotional materials.' },
    { id: 'ai-generated', name: 'AI Generation (Private)', icon: Shield, desc: 'Dall-E / Midjourney generated local backdrops.', private: true },
  ];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/media/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error('Failed to load media assets:', err);
      showToast('error', 'Failed to retrieve media library datasets.');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = async (files: FileList) => {
    const list = Array.from(files);
    const initialUploads = list.map(f => ({ name: f.name, progress: 10, status: 'uploading' as const }));
    setUploadingFiles(prev => [...prev, ...initialUploads]);

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        const base64 = await fileToBase64(file);
        
        // Infer default properties based on active bucket selection
        let entityType = 'general';
        if (activeBucket.includes('destination')) entityType = 'destination';
        else if (activeBucket.includes('attraction')) entityType = 'attraction';
        else if (activeBucket.includes('route')) entityType = 'route';
        else if (activeBucket.includes('homestay')) entityType = 'homestay';

        const payload = {
          base64,
          filename: file.name,
          mimeType: file.type,
          bucketId: activeBucket,
          entityType,
          entityId: 'general',
          assetCategory: 'gallery',
          uploadedBy: 'Administrator',
          userId: 'admin-system',
          caption: `Uploaded via HillyTrip Media Library Manager`,
          altText: `HillyTrip ${file.name} optimized storage media`
        };

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          // Update upload progress
          setUploadingFiles(prev => prev.map(uf => uf.name === file.name ? { ...uf, progress: 100, status: 'success' } : uf));
          showToast('success', `Uploaded ${file.name} successfully.`);
          fetchAssets();
        } else {
          const errData = await res.json();
          setUploadingFiles(prev => prev.map(uf => uf.name === file.name ? { ...uf, progress: 100, status: 'error', error: errData.error } : uf));
          showToast('error', `Failed to upload ${file.name}: ${errData.error}`);
        }
      } catch (err: any) {
        setUploadingFiles(prev => prev.map(uf => uf.name === file.name ? { ...uf, progress: 100, status: 'error', error: err.message } : uf));
        showToast('error', `Exception uploading ${file.name}: ${err.message}`);
      }
    }

    // Dismiss upload logs after 5 seconds
    setTimeout(() => {
      setUploadingFiles([]);
    }, 6000);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Run the batch migration on local assets
  const runMigration = async () => {
    setIsMigrating(true);
    setMigrationLogs(['[Migration Initiated] Establishing communication with Node.js storage daemon...', '[Progress] Triggering automatic directory sweep...']);
    try {
      const res = await fetch('/api/media/run-migration', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMigrationLogs(prev => [...prev, ...data.log, `[COMPLETE] Successfully migrated ${data.migratedCount} asset files to Supabase Storage!`]);
        showToast('success', 'Asset storage migration finished successfully.');
        fetchAssets();
      } else {
        const errData = await res.json();
        setMigrationLogs(prev => [...prev, `[CRITICAL FAILURE] Daemon returned: ${errData.error}`]);
        showToast('error', `Migration failed: ${errData.error}`);
      }
    } catch (err: any) {
      setMigrationLogs(prev => [...prev, `[EXCEPTION ERROR] Failed to connect: ${err.message}`]);
      showToast('error', `Migration error: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // Delete an asset completely
  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to permanently delete this media asset? This will completely purge the original file, all responsive sizes, and all database links to prevent orphan files.')) {
      return;
    }
    try {
      const res = await fetch('/api/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assetId })
      });
      if (res.ok) {
        showToast('success', 'Permanently deleted asset and clean-purged corresponding responsive files.');
        setSelectedAsset(null);
        fetchAssets();
      } else {
        const err = await res.json();
        showToast('error', `Failed to delete: ${err.error}`);
      }
    } catch (err: any) {
      showToast('error', `Error deleting asset: ${err.message}`);
    }
  };

  // Moderation Approval / Rejection
  const handleModeration = async (approved: boolean) => {
    if (!selectedAsset) return;
    setIsModerating(true);
    try {
      const action = approved ? 'Approved' : 'Rejected';
      const res = await fetch('/api/media/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAsset.id,
          action,
          rejectionReason: approved ? null : moderationReason,
          approvedBy: 'System Admin'
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast('success', `Media item successfully ${action}.`);
        setSelectedAsset(data.asset);
        setShowModerationModal(false);
        setModerationReason('');
        fetchAssets();
      } else {
        const err = await res.json();
        showToast('error', `Moderation failed: ${err.error}`);
      }
    } catch (err: any) {
      showToast('error', `Error moderating asset: ${err.message}`);
    } finally {
      setIsModerating(false);
    }
  };

  // Move Asset within folder structures
  const handleMoveAsset = async () => {
    if (!selectedAsset) return;
    setIsMoving(true);
    try {
      const res = await fetch('/api/media/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAsset.id,
          targetCategory: moveTargetCategory,
          targetEntityId: moveTargetEntityId
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast('success', 'Successfully moved file and responsive nodes within storage buckets.');
        setSelectedAsset(data.asset);
        setShowMoveModal(false);
        fetchAssets();
      } else {
        const err = await res.json();
        showToast('error', `File move failed: ${err.error}`);
      }
    } catch (err: any) {
      showToast('error', `Error moving asset: ${err.message}`);
    } finally {
      setIsMoving(false);
    }
  };

  // Replace Asset while keeping identical linkages active
  const handleReplaceAsset = async () => {
    if (!selectedAsset || !replaceFile) return;
    setIsReplacing(true);
    try {
      const base64 = await fileToBase64(replaceFile);
      const res = await fetch('/api/media/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAsset.id,
          base64,
          filename: replaceFile.name,
          mimeType: replaceFile.type
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast('success', 'Asset successfully replaced in Supabase and database links maintained.');
        setSelectedAsset(data.asset);
        setShowReplaceModal(false);
        setReplaceFile(null);
        fetchAssets();
      } else {
        const err = await res.json();
        showToast('error', `Failed to replace: ${err.error}`);
      }
    } catch (err: any) {
      showToast('error', `Error replacing asset: ${err.message}`);
    } finally {
      setIsReplacing(false);
    }
  };

  // Generate private signed link
  const generatePrivateLink = async () => {
    if (!selectedAsset) return;
    setGeneratingSigned(true);
    setSignedUrl(null);
    try {
      const res = await fetch('/api/media/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: selectedAsset.url,
          bucketId: selectedAsset.bucketId || activeBucket,
          expiresIn: 3600 // 1 hour
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSignedUrl(data.signedUrl);
        showToast('success', 'Generated secure signed URL valid for 60 minutes.');
      } else {
        const err = await res.json();
        showToast('error', `Signed link failed: ${err.error}`);
      }
    } catch (err: any) {
      showToast('error', `Error generating signed URL: ${err.message}`);
    } finally {
      setGeneratingSigned(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Copied URL to your system clipboard.');
  };

  // Filtering Logic
  const filteredAssets = assets.filter(asset => {
    if (asset.bucketId !== activeBucket) return false;
    
    if (mediaTypeFilter === 'image' && asset.isVideo) return false;
    if (mediaTypeFilter === 'video' && !asset.isVideo) return false;

    if (statusFilter !== 'all' && asset.status !== statusFilter) return false;

    if (aiFilter === 'ai' && !asset.aiGenerated) return false;
    if (aiFilter === 'manual' && asset.aiGenerated) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (asset.caption || '').toLowerCase().includes(q) ||
        (asset.altText || '').toLowerCase().includes(q) ||
        (asset.uploadedBy || '').toLowerCase().includes(q) ||
        (asset.storagePath || '').toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getFormattedSize = (bytes?: number) => {
    if (!bytes) return 'Unknown Size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const activeBucketMeta = buckets.find(b => b.id === activeBucket);

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-900 font-sans" id="supabase-media-library-panel">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 flex items-center gap-2 p-4 rounded-xl shadow-lg border animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-slate-50 text-slate-800 border-slate-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="text-xs font-bold flex-1 min-w-0 break-words">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="w-7 h-7 text-emerald-600 animate-pulse" />
            <span>Supabase Media Vault</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl font-medium">
            HillyTrip's single source of truth for media assets. Zero local image dependencies. Enterprise-grade, scalable, secure, and fully optimized with automatic on-the-fly multi-size responsive generators.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowMigrationModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
          >
            <FolderSync className="w-4 h-4 text-emerald-400" />
            <span>Migrate Local Assets</span>
          </button>
          <button 
            onClick={fetchAssets}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Stats</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Vault Assets</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{assets.length}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Storage Buckets</span>
            <div className="text-2xl font-black text-slate-900 mt-1">10 Active</div>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl">
            <Database className="w-5 h-5 text-slate-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Videos Managed</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{assets.filter(a => a.isVideo).length} Files</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl">
            <FileVideo className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Moderation</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{assets.filter(a => a.status === 'Pending').length} Items</div>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Bucket list */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 mb-2">Vault Buckets</div>
          <div className="space-y-1 bg-white p-2 rounded-2xl border border-slate-200">
            {buckets.map(b => {
              const IconComp = b.icon;
              const count = assets.filter(a => a.bucketId === b.id).length;
              const isActive = b.id === activeBucket;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBucket(b.id);
                    setSelectedAsset(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition flex flex-col ${
                    isActive ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-xs font-bold">
                      <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{b.name}</span>
                    </span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-500 text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </div>
                  <span className={`text-[10px] mt-1 truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {b.desc}
                  </span>
                  {b.private && (
                    <span className="text-[8px] font-black tracking-widest uppercase text-amber-500 mt-1">
                      🔒 Enforced RLS Guarded
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Assets list with toolbar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Bucket Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-black text-slate-900">{activeBucketMeta?.name}</h2>
                {activeBucketMeta?.private ? (
                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-black rounded-full uppercase tracking-wider">Private</span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-black rounded-full uppercase tracking-wider">Public CDN</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">{activeBucketMeta?.desc}</p>
            </div>
            
            {/* Direct upload trigger */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Direct Upload</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              multiple 
              className="hidden" 
              accept="image/*,video/*"
            />
          </div>

          {/* Filtering controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, caption, path or uploader..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            
            <div>
              <select
                value={mediaTypeFilter}
                onChange={e => setMediaTypeFilter(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none"
              >
                <option value="all">Image + Video</option>
                <option value="image">Only Images</option>
                <option value="video">Only Videos</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Approved">Approved Only</option>
                <option value="Pending">Pending Moderation</option>
                <option value="Rejected">Rejected Only</option>
              </select>
            </div>
          </div>

          {/* Upload progress list */}
          {uploadingFiles.length > 0 && (
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Upload Daemon Live Processing</span>
              </div>
              <div className="space-y-1.5">
                {uploadingFiles.map((uf, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs gap-4">
                    <span className="truncate max-w-[200px] text-slate-300 font-mono">{uf.name}</span>
                    <div className="flex items-center gap-2 flex-grow justify-end">
                      <div className="w-24 bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className={`h-full ${uf.status === 'error' ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${uf.progress}%` }} />
                      </div>
                      <span className="text-[10px] font-bold">
                        {uf.status === 'uploading' && 'Processing...'}
                        {uf.status === 'success' && '✅ Uploaded'}
                        {uf.status === 'error' && '❌ Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition ${
              dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <UploadCloud className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <div className="text-xs font-bold text-slate-700">Drag & drop files here to upload to "{activeBucketMeta?.name}"</div>
            <div className="text-[10px] text-slate-400 mt-1">Or click 'Direct Upload' to select files from your operating system. Supports PNG, JPG, WEBP, AVIF, GIF, MP4, and WEBM up to 100MB.</div>
          </div>

          {/* Grid of Assets */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Reading Supabase Vault...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-2xl border border-slate-200">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-200 mb-2" />
              <div className="text-xs font-bold text-slate-500">No media assets found in this bucket.</div>
              <p className="text-[10px] text-slate-400 max-w-sm mx-auto mt-1">Try relaxing filters, searching for a different name, or dragging files into the dropper above to populate the vault.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map(asset => (
                <div 
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition duration-200 group cursor-pointer ${
                    selectedAsset?.id === asset.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                >
                  <div className="aspect-video w-full bg-slate-900 relative flex items-center justify-center overflow-hidden">
                    {asset.isVideo ? (
                      <>
                        <video 
                          src={asset.url} 
                          poster={asset.posterUrl || undefined}
                          className="w-full h-full object-cover opacity-80" 
                          muted 
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                        <span className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 font-black text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded">Video</span>
                      </>
                    ) : (
                      <img 
                        src={asset.thumbnailUrl || asset.url} 
                        alt={asset.altText || ''} 
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    {/* Status badge Overlay */}
                    <span className={`absolute top-2 right-2 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      asset.status === 'Approved' ? 'bg-emerald-500 text-white' :
                      asset.status === 'Rejected' ? 'bg-rose-500 text-white' :
                      'bg-amber-500 text-slate-950 animate-pulse'
                    }`}>
                      {asset.status === 'Pending' ? 'Pending' : asset.status || 'Approved'}
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="text-[10px] font-mono text-slate-400 font-bold truncate">
                      {asset.storagePath?.split('/').pop() || asset.id}
                    </div>
                    <p className="text-[11px] text-slate-700 font-bold truncate mt-1">
                      {asset.caption || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 font-mono border-t border-slate-100 pt-1.5">
                      <span>{getFormattedSize(asset.fileSize)}</span>
                      <span>{asset.format?.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Inspector/Modal for Selected Asset */}
      {selectedAsset && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between animate-slide-left">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-150 pb-4 mb-6">
                <div>
                  <h3 className="font-black text-sm text-slate-500 uppercase tracking-widest">Asset Inspector</h3>
                  <div className="text-lg font-black text-slate-900 mt-1 truncate max-w-[320px]">{selectedAsset.id}</div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedAsset(null);
                    setSignedUrl(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition"
                >
                  <XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Preview Box */}
              <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center mb-6">
                {selectedAsset.isVideo ? (
                  <video 
                    src={selectedAsset.url} 
                    poster={selectedAsset.posterUrl || undefined}
                    controls 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src={selectedAsset.url} 
                    alt={selectedAsset.altText || ''} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Action Ribbon */}
              <div className="grid grid-cols-2 gap-2 mb-6 border-b border-slate-100 pb-6">
                <button
                  onClick={() => setShowMoveModal(true)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl text-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <FolderSync className="w-4 h-4 text-emerald-500" />
                  <span>Re-Route / Move</span>
                </button>
                <button
                  onClick={() => setShowReplaceModal(true)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl text-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                  <span>Replace File</span>
                </button>
                
                {activeBucketMeta?.private && (
                  <button
                    onClick={generatePrivateLink}
                    disabled={generatingSigned}
                    className="col-span-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-xl text-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <LinkIcon className="w-4 h-4 text-amber-500" />
                    <span>{generatingSigned ? 'Encrypting Link...' : 'Generate Signed Guard URL'}</span>
                  </button>
                )}
              </div>

              {/* Signed URL Preview */}
              {signedUrl && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
                  <div className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Temporary Access Signed URL (60m)</span>
                  </div>
                  <div className="flex gap-2 items-center mt-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={signedUrl}
                      className="bg-white border border-slate-200 text-[10px] font-mono p-2 rounded-lg flex-grow focus:outline-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(signedUrl)}
                      className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                      title="Copy Signed Link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Moderation Controls (Shown if pending moderation) */}
              {selectedAsset.status === 'Pending' && (
                <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl mb-6 space-y-3">
                  <div className="text-xs font-black text-amber-800 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Traveler Contribution Moderation Queue</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    This image was submitted dynamically by a platform contributor or guest traveler. Approve to authorize distribution to HillyTrip's static CDN, map boards, and homestay guides.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleModeration(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex-grow flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Release</span>
                    </button>
                    <button 
                      onClick={() => setShowModerationModal(true)}
                      className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-black rounded-xl transition flex-grow flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject & Trash</span>
                    </button>
                  </div>
                </div>
              )}

              {/* File Info Specs */}
              <div className="space-y-3.5 text-xs">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Specifications</div>
                
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">Storage Bucket</span>
                    <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.bucketId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">File System Format</span>
                    <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.format?.toUpperCase() || 'WEBP'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">Image Resolution</span>
                    <p className="font-bold text-slate-700 mt-0.5">{selectedAsset.width && selectedAsset.height ? `${selectedAsset.width}x${selectedAsset.height} px` : 'Vector/Flex'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">Asset Size</span>
                    <p className="font-bold text-slate-700 mt-0.5">{getFormattedSize(selectedAsset.fileSize)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold">Internal Storage Path</span>
                    <p className="font-mono text-[10px] text-slate-700 mt-0.5 truncate" title={selectedAsset.storagePath}>{selectedAsset.storagePath}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold">Primary CDN Endpoint</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedAsset.url}
                      className="bg-slate-50 border border-slate-150 text-[10px] font-mono p-2.5 rounded-xl flex-grow focus:outline-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(selectedAsset.url)}
                      className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-sizes grid of on-the-fly resized webp files */}
                {selectedAsset.thumbnailUrl && (
                  <div className="space-y-2 border-t border-slate-100 pt-4 mt-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Multi-Size CDN Endpoints (Optimized)</span>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Thumbnail (150px)', val: selectedAsset.thumbnailUrl },
                        { label: 'Small Display (300px)', val: selectedAsset.smallUrl },
                        { label: 'Medium Display (600px)', val: selectedAsset.mediumUrl },
                        { label: 'Large Detail (1200px)', val: selectedAsset.largeUrl },
                        { label: 'Hero Banner (1920px)', val: selectedAsset.heroUrl }
                      ].map((sz, sIdx) => sz.val && (
                        <div key={sIdx} className="flex justify-between items-center text-[10px] border border-slate-100 p-2 rounded-xl bg-slate-50/50">
                          <span className="font-bold text-slate-500">{sz.label}</span>
                          <div className="flex gap-1.5">
                            <a href={sz.val} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-0.5 font-bold">
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </a>
                            <button onClick={() => copyToClipboard(sz.val as string)} className="text-slate-500 hover:text-slate-800 font-bold">
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delete button wrapper */}
            <div className="border-t border-slate-150 pt-4 mt-8 flex gap-2">
              <button 
                onClick={() => handleDeleteAsset(selectedAsset.id)}
                className="w-full px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Permanently Purge Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration Modal */}
      {showMigrationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 max-w-xl w-full p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                  <FolderSync className="w-5.5 h-5.5 text-emerald-400" />
                  <span>Enterprise Migration Center</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Automatic folder sweep, media compression, and uploading engine for local system files.</p>
              </div>
              <button onClick={() => setShowMigrationModal(false)} className="text-slate-500 hover:text-slate-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl h-64 overflow-y-auto font-mono text-[10px] space-y-1 text-slate-300">
              {migrationLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-500 font-sans">
                  Ready to stream live file systems logs...
                </div>
              ) : (
                migrationLogs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes('[SUCCESS]') ? 'text-emerald-400' :
                    log.includes('[FAILED]') || log.includes('[ERROR]') ? 'text-rose-400' :
                    log.includes('[COMPLETE]') ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }>
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowMigrationModal(false);
                  setMigrationLogs([]);
                }}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold text-slate-400 transition"
              >
                Close Panel
              </button>
              <button
                disabled={isMigrating}
                onClick={runMigration}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-1"
              >
                {isMigrating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FolderSync className="w-4 h-4" />}
                <span>{isMigrating ? 'Running Migration Sweep...' : 'Trigger Vault Migration'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-Route / Move Modal */}
      {showMoveModal && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-scale-up text-slate-900">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
              <FolderSync className="w-5 h-5 text-emerald-600" />
              <span>Hierarchical Re-Route</span>
            </h3>
            <p className="text-xs text-slate-500">Move this media file and its compiled responsive thumbnail nodes to another subfolder structures inside the bucket to maintain perfect system integrity.</p>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Target Category Directory</label>
                <select
                  value={moveTargetCategory}
                  onChange={e => setMoveTargetCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="hero">Hero Backgrounds (Header)</option>
                  <option value="gallery">Main Photo Gallery</option>
                  <option value="rooms">Homestay Bedrooms</option>
                  <option value="food">Local Food / Dining</option>
                  <option value="amenities">Features / Amenities</option>
                  <option value="logos">System Logos & Marks</option>
                  <option value="banners">Promotional Banners</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Entity Identifier ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. shimla, manali-leh-pass"
                  value={moveTargetEntityId}
                  onChange={e => setMoveTargetEntityId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                disabled={isMoving}
                onClick={handleMoveAsset}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white text-xs font-black rounded-xl transition flex items-center gap-1"
              >
                {isMoving ? 'Moving files...' : 'Verify & Move File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Asset Modal */}
      {showReplaceModal && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-scale-up text-slate-900">
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
              <span>Overwrite Storage Node</span>
            </h3>
            <p className="text-xs text-slate-500">
              Replace this asset file in Supabase with a fresh upload. The database identifiers, uploader names, and links remain untouched, but the physical images will be overwritten immediately.
            </p>

            <div className="border border-dashed border-slate-200 p-6 text-center rounded-xl hover:border-slate-300 cursor-pointer relative">
              <input 
                type="file" 
                onChange={e => setReplaceFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept={selectedAsset.isVideo ? 'video/*' : 'image/*'}
              />
              <UploadCloud className="w-8 h-8 mx-auto text-slate-300 mb-1" />
              <div className="text-xs font-bold text-slate-700">
                {replaceFile ? replaceFile.name : 'Select Overwrite File'}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setShowReplaceModal(false);
                  setReplaceFile(null);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                disabled={isReplacing || !replaceFile}
                onClick={handleReplaceAsset}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-1"
              >
                {isReplacing ? 'Replacing...' : 'Upload & Overwrite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Moderation Modal */}
      {showModerationModal && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-scale-up text-slate-900">
            <h3 className="text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Reject Traveler Share</span>
            </h3>
            <p className="text-xs text-slate-500">Provide an administrative reason explaining why this image is being rejected and permanently scrubbed from traveler profiles.</p>
            
            <textarea
              rows={4}
              placeholder="e.g. Blurry photo, copyright violation, low quality..."
              value={moderationReason}
              onChange={e => setModerationReason(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowModerationModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                disabled={isModerating || !moderationReason}
                onClick={() => handleModeration(false)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white text-xs font-black rounded-xl transition"
              >
                {isModerating ? 'Trashing...' : 'Reject and Purge File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
