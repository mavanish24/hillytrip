import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, File, Plus, Trash2, Edit3, Move, ArrowLeft, Upload, RefreshCw, 
  ExternalLink, Copy, Check, Eye, Lock, Globe, HardDrive, Search, Loader2,
  FolderPlus, ChevronRight, AlertTriangle, FileText, FileVideo, Image as ImageIcon
} from 'lucide-react';

export function AdminStorageManagerTab() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>(''); // empty means root
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isListingFiles, setIsListingFiles] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Modals state
  const [showCreateBucketModal, setShowCreateBucketModal] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [isNewBucketPublic, setIsNewBucketPublic] = useState(true);
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);

  const [showRenameBucketModal, setShowRenameBucketModal] = useState(false);
  const [renameBucketOld, setRenameBucketOld] = useState('');
  const [renameBucketNew, setRenameBucketNew] = useState('');
  const [isRenamingBucket, setIsRenamingBucket] = useState(false);

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [oldFolderName, setOldFolderName] = useState('');
  const [newFolderNameRename, setNewFolderNameRename] = useState('');
  const [isRenamingFolder, setIsRenamingFolder] = useState(false);

  const [showMoveFileModal, setShowMoveFileModal] = useState(false);
  const [moveFileName, setMoveFileName] = useState('');
  const [moveTargetBucket, setMoveTargetBucket] = useState('');
  const [moveTargetPath, setMoveTargetPath] = useState('');
  const [isMovingFile, setIsMovingFile] = useState(false);

  const [showRenameFileModal, setShowRenameFileModal] = useState(false);
  const [renameFileOldName, setRenameFileOldName] = useState('');
  const [renameFileNewName, setRenameFileNewName] = useState('');
  const [isRenamingFile, setIsRenamingFile] = useState(false);

  // Asset Migration
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // Search/Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Get Admin Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
    const adminEmail = localStorage.getItem('hillytrip_admin_email') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-admin-email': adminEmail,
      'x-admin-password': 'admin123'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch Buckets
  const fetchBuckets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/storage/buckets', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBuckets(data.buckets || []);
        // Automatically select the first bucket if none selected
        if (data.buckets && data.buckets.length > 0 && !selectedBucket) {
          setSelectedBucket(data.buckets[0].name);
        }
      } else {
        showToast('error', data.error || 'Failed to retrieve storage buckets.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Network error while retrieving storage buckets.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Files & Folders in current selected bucket and path
  const fetchFiles = async (bucket: string, path: string) => {
    if (!bucket) return;
    setIsListingFiles(true);
    try {
      const url = `/api/admin/storage/files?bucketName=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`;
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Filter out empty folder placeholder if present
        const list = (data.files || []).filter((f: any) => f.name !== '.emptyFolderPlaceholder');
        setFiles(list);
      } else {
        showToast('error', data.error || 'Failed to list bucket contents.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error listing files in the bucket.');
    } finally {
      setIsListingFiles(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  useEffect(() => {
    if (selectedBucket) {
      fetchFiles(selectedBucket, currentPath);
    }
  }, [selectedBucket, currentPath]);

  // 3. Create Bucket Action
  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      showToast('error', 'Bucket name cannot be empty.');
      return;
    }
    const cleanName = newBucketName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setIsCreatingBucket(true);
    try {
      const res = await fetch('/api/admin/storage/buckets', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: cleanName,
          isPublic: isNewBucketPublic
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Bucket "${cleanName}" created successfully!`);
        setShowCreateBucketModal(false);
        setNewBucketName('');
        fetchBuckets();
      } else {
        showToast('error', data.error || 'Failed to create bucket.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error creating bucket.');
    } finally {
      setIsCreatingBucket(false);
    }
  };

  // 4. Delete Bucket Action
  const handleDeleteBucket = async (bucketName: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete bucket "${bucketName}"? This action is IRREVERSIBLE and will fail if the bucket is not empty.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/storage/buckets/${encodeURIComponent(bucketName)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Bucket "${bucketName}" was deleted.`);
        if (selectedBucket === bucketName) {
          setSelectedBucket('');
          setCurrentPath('');
        }
        fetchBuckets();
      } else {
        showToast('error', data.error || 'Failed to delete bucket. Empty files inside first.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error deleting bucket.');
    }
  };

  // 5. Rename Bucket Action (Simulated by copy-then-delete)
  const handleRenameBucket = async () => {
    if (!renameBucketNew.trim()) {
      showToast('error', 'New bucket name cannot be empty.');
      return;
    }
    const cleanNew = renameBucketNew.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setIsRenamingBucket(true);
    try {
      const res = await fetch('/api/admin/storage/buckets/rename', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          oldName: renameBucketOld,
          newName: cleanNew
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Bucket renamed and files migrated successfully to "${cleanNew}"!`);
        setShowRenameBucketModal(false);
        setRenameBucketNew('');
        if (selectedBucket === renameBucketOld) {
          setSelectedBucket(cleanNew);
        }
        fetchBuckets();
      } else {
        showToast('error', data.error || 'Failed to rename bucket.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error renaming bucket.');
    } finally {
      setIsRenamingBucket(false);
    }
  };

  // 6. Create Folder Action
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showToast('error', 'Folder name cannot be empty.');
      return;
    }
    const cleanFolder = newFolderName.trim().replace(/[^a-zA-Z0-9-_]/g, '_');
    setIsCreatingFolder(true);
    try {
      const res = await fetch('/api/admin/storage/folders/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bucketName: selectedBucket,
          path: currentPath,
          folderName: cleanFolder
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Folder "${cleanFolder}" created successfully!`);
        setShowCreateFolderModal(false);
        setNewFolderName('');
        fetchFiles(selectedBucket, currentPath);
      } else {
        showToast('error', data.error || 'Failed to create folder.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error creating folder.');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // 7. Rename Folder Action
  const handleRenameFolder = async () => {
    if (!newFolderNameRename.trim()) {
      showToast('error', 'New folder name cannot be empty.');
      return;
    }
    const cleanNew = newFolderNameRename.trim().replace(/[^a-zA-Z0-9-_]/g, '_');
    setIsRenamingFolder(true);
    
    const oldPathFull = currentPath ? `${currentPath}/${oldFolderName}` : oldFolderName;
    const newPathFull = currentPath ? `${currentPath}/${cleanNew}` : cleanNew;

    try {
      const res = await fetch('/api/admin/storage/folders/rename', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bucketName: selectedBucket,
          oldPath: oldPathFull,
          newPath: newPathFull
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Folder renamed to "${cleanNew}".`);
        setShowRenameFolderModal(false);
        setNewFolderNameRename('');
        fetchFiles(selectedBucket, currentPath);
      } else {
        showToast('error', data.error || 'Failed to rename folder.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error renaming folder.');
    } finally {
      setIsRenamingFolder(false);
    }
  };

  // 8. File Upload Action
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFile(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadFile = async (file: File) => {
    setUploadProgress(10);
    try {
      const base64 = await fileToBase64(file);
      setUploadProgress(40);
      
      const res = await fetch('/api/admin/storage/files/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bucketName: selectedBucket,
          path: currentPath,
          filename: file.name,
          base64,
          mimeType: file.type
        })
      });
      setUploadProgress(80);
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `Uploaded "${file.name}" successfully!`);
        fetchFiles(selectedBucket, currentPath);
      } else {
        showToast('error', data.error || 'Failed to upload file.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error during file upload.');
    } finally {
      setUploadProgress(null);
    }
  };

  // 9. Delete File Action
  const handleDeleteFile = async (fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete file "${fileName}"?`)) {
      return;
    }
    const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
    try {
      const res = await fetch('/api/admin/storage/files/delete', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bucketName: selectedBucket,
          paths: [fullPath]
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `File "${fileName}" deleted.`);
        fetchFiles(selectedBucket, currentPath);
      } else {
        showToast('error', data.error || 'Failed to delete file.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error deleting file.');
    }
  };

  // 10. Move File Action
  const handleMoveFile = async () => {
    if (!moveTargetBucket) {
      showToast('error', 'Target bucket is required.');
      return;
    }
    setIsMovingFile(true);
    
    const fromPathFull = currentPath ? `${currentPath}/${moveFileName}` : moveFileName;
    // If bucket remains same, move in current bucket. If different, we might have to copy and delete.
    // The server-side move API moves within the same bucket. Let's make sure that's clear, or we do cross-bucket in API.
    try {
      const res = await fetch('/api/admin/storage/files/move', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bucketName: selectedBucket,
          fromPath: fromPathFull,
          toPath: moveTargetPath ? `${moveTargetPath}/${moveFileName}` : moveFileName
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `File moved successfully to "${moveTargetPath || 'root'}"`);
        setShowMoveFileModal(false);
        fetchFiles(selectedBucket, currentPath);
      } else {
        showToast('error', data.error || 'Failed to move file. Notice: Move currently operates within the same bucket.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error moving file.');
    } finally {
      setIsMovingFile(false);
    }
  };

  // 11. Rename File Action
  const handleRenameFile = async () => {
    if (!renameFileNewName.trim()) {
      showToast('error', 'New file name is required.');
      return;
    }
    setIsRenamingFile(true);
    const oldPathFull = currentPath ? `${currentPath}/${renameFileOldName}` : renameFileOldName;
    const newPathFull = currentPath ? `${currentPath}/${renameFileNewName.trim()}` : renameFileNewName.trim();

    try {
      const res = await fetch('/api/admin/storage/files/move', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          bucketName: selectedBucket,
          fromPath: oldPathFull,
          toPath: newPathFull
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', `File renamed successfully to "${renameFileNewName.trim()}"`);
        setShowRenameFileModal(false);
        fetchFiles(selectedBucket, currentPath);
      } else {
        showToast('error', data.error || 'Failed to rename file.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Error renaming file.');
    } finally {
      setIsRenamingFile(false);
    }
  };

  // 12. Run Migration Action
  const runAssetMigration = async () => {
    setIsMigrating(true);
    setMigrationLogs(['[Migration Started] Calling local asset synchronization...']);
    setShowMigrationModal(true);
    try {
      const res = await fetch('/api/media/run-migration', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMigrationLogs(prev => [
          ...prev,
          `[COMPLETED] Migrated ${data.migratedCount} assets.`,
          ... (data.log || [])
        ]);
        showToast('success', 'Asset migration completed successfully!');
        fetchBuckets();
      } else {
        setMigrationLogs(prev => [...prev, `[FAILED] ${data.error || 'Server error during migration'}`]);
        showToast('error', data.error || 'Migration failed.');
      }
    } catch (err: any) {
      console.error(err);
      setMigrationLogs(prev => [...prev, `[EXCEPTION] ${err.message || err}`]);
      showToast('error', 'Migration failed due to network exception.');
    } finally {
      setIsMigrating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    showToast('success', 'URL copied to clipboard.');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(prev => prev ? `${prev}/${folderName}` : folderName);
  };

  const navigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const navigateToBreadcrumb = (index: number) => {
    const parts = currentPath.split('/');
    const newPath = parts.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
  };

  // Helpers for identifying file types and file sizes
  const getFileIcon = (metadata: any) => {
    const mime = (metadata?.mimetype || '').toLowerCase();
    if (mime.startsWith('image/')) return ImageIcon;
    if (mime.startsWith('video/')) return FileVideo;
    return FileText;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper to generate a reliable preview URL
  const getFilePreviewUrl = (fileName: string, bucketObj: any) => {
    const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
    const url = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    if (url) {
      return `${url}/storage/v1/object/public/${bucketObj.name}/${fullPath}`;
    }
    // Fallback if not configured
    return '';
  };

  // Filter buckets based on search
  const filteredBuckets = buckets.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeBucketObj = buckets.find(b => b.name === selectedBucket);

  // Group files and folders from the flat list
  // Supabase Storage list() returns objects with metadata.
  // Folder objects do not have metadata (or have `id: null` / `metadata: null` depending on exact response, or we check for directory marker)
  const foldersList = files.filter(f => !f.metadata && f.id === null);
  const filesList = files.filter(f => f.metadata);

  return (
    <div id="storage-manager-tab" className="space-y-6 text-slate-800">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HardDrive className="w-7 h-7 text-emerald-600" />
            Supabase Storage Architecture Control
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise grade bucket configuration, access credentials mapping, and real-time asset delivery dashboard.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchBuckets}
            className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
            title="Refresh Buckets"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={runAssetMigration}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4 animate-pulse" />
            Run Local Asset Sync Migration
          </button>

          <button
            onClick={() => setShowCreateBucketModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Bucket
          </button>
        </div>
      </div>

      {/* Two Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Pane - Buckets List */}
        <div className="lg:col-span-1 bg-slate-50/60 rounded-2xl border border-slate-150 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Storage Buckets</span>
            <span className="text-xs font-mono font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md">
              {buckets.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search buckets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[480px]">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            ) : filteredBuckets.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No buckets found.</p>
            ) : (
              filteredBuckets.map((bucket) => {
                const isSelected = selectedBucket === bucket.name;
                return (
                  <div
                    key={bucket.id}
                    className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xs' 
                        : 'bg-white hover:bg-slate-100 border-slate-100 hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedBucket(bucket.name);
                        setCurrentPath('');
                      }}
                      className="flex-1 flex items-center gap-2.5 text-left text-xs font-semibold focus:outline-none"
                    >
                      {bucket.public ? (
                        <Globe className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      ) : (
                        <Lock className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                      )}
                      <span className="truncate">{bucket.name}</span>
                    </button>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setRenameBucketOld(bucket.name);
                          setRenameBucketNew(bucket.name);
                          setShowRenameBucketModal(true);
                        }}
                        className="p-1 hover:text-emerald-600 hover:bg-white rounded transition-colors"
                        title="Rename Bucket Options"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBucket(bucket.name)}
                        className="p-1 hover:text-rose-600 hover:bg-white rounded transition-colors"
                        title="Delete Bucket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane - Content Explorer */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 min-h-[500px] flex flex-col justify-between">
          
          <div>
            {/* Explorer Toolbar / Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
              <div className="flex items-center gap-2 flex-wrap text-sm font-medium">
                <button
                  onClick={() => setCurrentPath('')}
                  className="text-slate-600 hover:text-emerald-600 font-bold transition-colors"
                >
                  {selectedBucket || 'Choose Bucket'}
                </button>
                
                {currentPath && <ChevronRight className="w-4 h-4 text-slate-400" />}
                
                {currentPath.split('/').map((part, idx) => {
                  if (!part) return null;
                  return (
                    <React.Fragment key={idx}>
                      <button
                        onClick={() => navigateToBreadcrumb(idx)}
                        className="text-slate-600 hover:text-emerald-600 font-medium transition-colors"
                      >
                        {part}
                      </button>
                      {idx < currentPath.split('/').length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {currentPath && (
                  <button
                    onClick={navigateUp}
                    className="p-1.5 text-slate-500 hover:bg-white rounded-lg border border-slate-200 hover:text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Up One Level
                  </button>
                )}

                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  disabled={!selectedBucket}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
                >
                  <FolderPlus className="w-3.5 h-3.5" /> Create Folder
                </button>

                <button
                  onClick={handleFileUploadClick}
                  disabled={!selectedBucket || !!uploadProgress}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Active upload progress indicator */}
            {uploadProgress !== null && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden relative">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* Main Listing Grid */}
            {isListingFiles ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="text-sm text-slate-400">Loading files and directories...</span>
              </div>
            ) : !selectedBucket ? (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <HardDrive className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-semibold text-slate-700">No Bucket Selected</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
                  Select an active storage bucket from the left menu panel to view, upload, and manage files.
                </p>
              </div>
            ) : foldersList.length === 0 && filesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Folder className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-semibold text-slate-700">This Folder is Empty</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Upload static assets or create child directories using the buttons above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Folders List */}
                {foldersList.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Folders</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {foldersList.map((folder) => (
                        <div
                          key={folder.name}
                          className="group flex items-center justify-between p-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
                        >
                          <button
                            onClick={() => navigateToFolder(folder.name)}
                            className="flex items-center gap-3 text-xs font-semibold text-slate-700 hover:text-emerald-600 focus:outline-none truncate"
                          >
                            <Folder className="w-5 h-5 text-emerald-500 fill-emerald-100 shrink-0" />
                            <span className="truncate">{folder.name}</span>
                          </button>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => {
                                setOldFolderName(folder.name);
                                setNewFolderNameRename(folder.name);
                                setShowRenameFolderModal(true);
                              }}
                              className="p-1 hover:text-slate-900 text-slate-400 hover:bg-white rounded shadow-2xs border border-transparent hover:border-slate-200 transition-all"
                              title="Rename Folder"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files List */}
                {filesList.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Files</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filesList.map((file) => {
                        const Icon = getFileIcon(file.metadata);
                        const publicUrl = getFilePreviewUrl(file.name, activeBucketObj);
                        
                        return (
                          <div
                            key={file.id || file.name}
                            className="group bg-slate-50/40 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex flex-col justify-between gap-3 transition-all hover:shadow-xs relative"
                          >
                            {/* File Icon & Info */}
                            <div className="flex gap-3 items-start">
                              <div className="p-2.5 bg-slate-100 rounded-lg shrink-0 group-hover:bg-emerald-50 transition-colors">
                                <Icon className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                                  {file.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                                  <span>{formatBytes(file.metadata?.size || 0)}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[120px]">{file.metadata?.mimetype || 'binary'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1 shrink-0">
                              <span className="text-[10px] text-slate-400">
                                {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'N/A'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {publicUrl && (
                                  <>
                                    <button
                                      onClick={() => copyToClipboard(publicUrl)}
                                      className="p-1 hover:text-emerald-600 text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 rounded shadow-2xs transition-all"
                                      title="Copy Asset CDN URL"
                                    >
                                      {copiedUrl === publicUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <a
                                      href={publicUrl}
                                      target="_blank"
                                      rel="noreferrer referrer"
                                      className="p-1 hover:text-slate-900 text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 rounded shadow-2xs transition-all flex"
                                      title="Open CDN Preview URL"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </>
                                )}

                                <button
                                  onClick={() => {
                                    setRenameFileOldName(file.name);
                                    setRenameFileNewName(file.name);
                                    setShowRenameFileModal(true);
                                  }}
                                  className="p-1 hover:text-slate-900 text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 rounded shadow-2xs transition-all"
                                  title="Rename / Move File"
                                >
                                  <Move className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteFile(file.name)}
                                  className="p-1 hover:text-rose-600 text-slate-400 hover:bg-white border border-transparent hover:border-slate-200 rounded shadow-2xs transition-all"
                                  title="Delete File"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Quick Metrics */}
          {activeBucketObj && (
            <div className="border-t border-slate-100 pt-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span>Bucket Status: <strong className={activeBucketObj.public ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{activeBucketObj.public ? 'Public Access' : 'Private (Authenticated)'}</strong></span>
                <span>•</span>
                <span>Cache Policy: <strong className="text-slate-600">3600s</strong></span>
              </div>
              <div className="font-mono text-[10px]">
                ID: {activeBucketObj.id}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CREATE BUCKET MODAL */}
      {showCreateBucketModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Create Storage Bucket
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Bucket Name</label>
                <input
                  type="text"
                  placeholder="e.g. destinations"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
                <p className="text-[10px] text-slate-400 mt-1">Lower-case alphanumeric, dashes or underscores only.</p>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-left">
                  <span className="text-xs font-semibold text-slate-700">Public Bucket</span>
                  <p className="text-[10px] text-slate-400">Allows direct retrieval via Public URL CDN without keys.</p>
                </div>
                <input
                  type="checkbox"
                  checked={isNewBucketPublic}
                  onChange={(e) => setIsNewBucketPublic(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateBucketModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBucket}
                disabled={isCreatingBucket}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isCreatingBucket && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Creation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME BUCKET MODAL */}
      {showRenameBucketModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              Rename Bucket (File Migration)
            </h3>
            
            <p className="text-xs text-slate-500">
              Note: Changing a bucket ID triggers creation of a new bucket, full transfer of existing assets, and final deletion of the original bucket.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Original ID</label>
                <input
                  type="text"
                  disabled
                  value={renameBucketOld}
                  className="w-full mt-1 px-3 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-xl text-sm font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">New Bucket Name</label>
                <input
                  type="text"
                  placeholder="e.g. destinations-new"
                  value={renameBucketNew}
                  onChange={(e) => setRenameBucketNew(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRenameBucketModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameBucket}
                disabled={isRenamingBucket}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isRenamingBucket && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Migrate & Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-emerald-600" />
              Create Child Directory
            </h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Folder Name</label>
              <input
                type="text"
                placeholder="e.g. room_photos"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={isCreatingFolder}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isCreatingFolder && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME FOLDER MODAL */}
      {showRenameFolderModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-emerald-600" />
              Rename Folder Directory
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Original Folder Name</label>
                <input
                  type="text"
                  disabled
                  value={oldFolderName}
                  className="w-full mt-1 px-3 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-xl text-sm font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">New Folder Name</label>
                <input
                  type="text"
                  placeholder="e.g. room_photos_v2"
                  value={newFolderNameRename}
                  onChange={(e) => setNewFolderNameRename(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRenameFolderModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameFolder}
                disabled={isRenamingFolder}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isRenamingFolder && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Rename Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME / MOVE FILE MODAL */}
      {showRenameFileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Move className="w-5 h-5 text-emerald-600" />
              Rename or Move File
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Original Filename</label>
                <input
                  type="text"
                  disabled
                  value={renameFileOldName}
                  className="w-full mt-1 px-3 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-xl text-sm font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">New Storage Path / Filename</label>
                <input
                  type="text"
                  placeholder="e.g. subfolder/filename.jpg"
                  value={renameFileNewName}
                  onChange={(e) => setRenameFileNewName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRenameFileModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameFile}
                disabled={isRenamingFile}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isRenamingFile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rename/Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSET MIGRATION LOGGER MODAL */}
      {showMigrationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className={`w-5 h-5 text-amber-600 ${isMigrating ? 'animate-spin' : ''}`} />
              Local Static Asset Sync Migration Runner
            </h3>
            
            <p className="text-xs text-slate-500">
              Sweeping public logos, brand imagery, and MP4/WebM hero background video layouts to seed the newly created separate Supabase Storage buckets.
            </p>

            <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl h-64 overflow-y-auto space-y-1">
              {migrationLogs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {log}
                </div>
              ))}
              {isMigrating && (
                <div className="flex items-center gap-2 text-slate-400 italic animate-pulse mt-1">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                  Writing blocks and updating site settings...
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setShowMigrationModal(false)}
                disabled={isMigrating}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 rounded-xl transition-all"
              >
                Close Logs Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
