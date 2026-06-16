import React, { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { Camera, UploadCloud, FileImage, Sparkles, LogIn, Loader2, CheckCircle2, AlertCircle, Info, Heart, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { compressAndConvertToWebP } from '../utils/imageOptimizer';
import { uploadImageToFirebase } from '../utils/firebase';
import { hillyTripFetch } from '../utils/apiInterceptor';
import { DEFAULT_HOMESTAY_IMAGE } from '../constants';

const fetch = hillyTripFetch;


interface ImageItem {
  id: string;
  destinationId: string | null;
  attractionId: string | null;
  url: string;
  uploadedBy: string;
  uploadDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  caption: string;
  altText: string;
}

interface ImageGallerySystemProps {
  entityType: 'destination' | 'attraction';
  entityId: string;
  staticGallery: string[];
  activePhotos: ImageItem[];
  user: any; // Auth user
  isAdmin: boolean;
  onLogin: () => void;
  onPhotoUploaded: (newPhoto: ImageItem) => void;
  onPhotoUpdated?: (updatedPhoto: ImageItem) => void;
  setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
  likes?: any[];
  onToggleLike?: (contentId: string, contentType: 'destination' | 'attraction' | 'photo') => Promise<void>;
}

export default function ImageGallerySystem({
  entityType,
  entityId,
  staticGallery = [],
  activePhotos = [],
  user,
  isAdmin,
  onLogin,
  onPhotoUploaded,
  onPhotoUpdated,
  setNotification,
  likes = [],
  onToggleLike
}: ImageGallerySystemProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [webpBlob, setWebpBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Caption Editing & Lightbox states
  const [selectedPhotoForViewer, setSelectedPhotoForViewer] = useState<any | null>(null);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editingCaptionText, setEditingCaptionText] = useState('');
  const [editingAltTextText, setEditingAltTextText] = useState('');
  const [isSavingCaption, setIsSavingCaption] = useState(false);

  // Combine all photos (static + dynamic) for seamless lightbox swipe/arrow navigation
  const allViewerItems = [
    ...staticGallery.map((imgUrl, idx) => ({
      id: `static-${idx}`,
      url: imgUrl,
      isStatic: true,
      caption: 'Official Showcase View',
      altText: `${entityType === 'destination' ? 'Destination' : 'Attraction'} premium scenic highlight view`,
      uploadedBy: 'HillyTrip Guides',
      uploadDate: ''
    })),
    ...activePhotos.map(photo => ({
      ...photo,
      isStatic: false
    }))
  ];

  // Keyboard navigation and Escape closer for Lightbox modal
  useEffect(() => {
    if (!selectedPhotoForViewer) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPhotoForViewer(null);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const idx = allViewerItems.findIndex(item => item.url === selectedPhotoForViewer.url);
        if (idx !== -1 && idx < allViewerItems.length - 1) {
          const nextPhoto = allViewerItems[idx + 1];
          setSelectedPhotoForViewer(nextPhoto);
          setEditingCaptionText(nextPhoto.caption || '');
          setEditingAltTextText(nextPhoto.altText || '');
          setIsEditingCaption(false);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const idx = allViewerItems.findIndex(item => item.url === selectedPhotoForViewer.url);
        if (idx !== -1 && idx > 0) {
          const prevPhoto = allViewerItems[idx - 1];
          setSelectedPhotoForViewer(prevPhoto);
          setEditingCaptionText(prevPhoto.caption || '');
          setEditingAltTextText(prevPhoto.altText || '');
          setIsEditingCaption(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPhotoForViewer, allViewerItems]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Drag & Drop events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  // 2. Client-side Image compression and WebP conversion
  const processSelectedFile = async (file: File) => {
    // 6. Security & Performance: Validate file format in user browser
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Unsupported file type. Please upload a high-resolution JPEG, JPG, WebP, or PNG file.");
      setUploadStatus('error');
      return;
    }

    // Checking max size of 10MB as recommended in constraints
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds the 10MB size restriction. Please upload an image under 10MB.");
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setUploadStatus('compressing');
    setErrorMessage('');

    try {
      // Automatic compression and WebP conversion
      const compressed = await compressAndConvertToWebP(file);
      setWebpBlob(compressed);
      
      // Generate object url for local preview before remote sync
      const blobUrl = URL.createObjectURL(compressed);
      setPreviewUrl(blobUrl);
      setUploadStatus('idle');

      // Autofill alt texts and captions based on file name or location as dynamic guide
      const cleanName = file.name.split('.')[0].replace(/[-_]+/g, ' ');
      setCaption(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      setAltText(`Scenic traveler photo of hill state view showing ${cleanName}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to process, scale or convert image.");
      setUploadStatus('error');
    }
  };

  // 3. Form upload trigger
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webpBlob || !selectedFile) return;

    setUploadStatus('uploading');
    setIsProcessing(true);

    try {
      // Select appropriate target path
      const targetName = `${entityType}_${entityId}_${selectedFile.name.replace(/\.[^/.]+$/, "")}.webp`;
      
      // Upload binary to Firebase Storage and receive URL
      const secureDownloadUrl = await uploadImageToFirebase(webpBlob, targetName);

      // Save database record with appropriate statuses
      const metaPayload = {
        destinationId: entityType === 'destination' ? entityId : null,
        attractionId: entityType === 'attraction' ? entityId : null,
        url: secureDownloadUrl,
        uploadedBy: user?.displayName || user?.email || 'Registered Traveler',
        status: isAdmin ? 'Approved' : 'Pending', // Admins bypass the moderation queue
        caption: caption.trim() || 'HillyTrip scenic view',
        altText: altText.trim() || 'Indian Hills and regional Darjeeling panoramic views',
        userId: user?.uid || user?.email || 'anonymous'
      };

      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload)
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Server rejected metadata persistence.');
      }

      const resBody = await response.json();
      
      setUploadStatus('success');
      setNotification({
        type: 'success',
        message: isAdmin 
          ? 'Successfully uploaded direct-to-gallery as administrator.' 
          : 'Scenic picture uploaded to administrator review queue!'
      });

      if (resBody.image) {
        onPhotoUploaded(resBody.image);
      }

      // Reset states
      setSelectedFile(null);
      setWebpBlob(null);
      setCaption('');
      setAltText('');
      setPreviewUrl('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while saving image metadata.');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const viewerIndex = allViewerItems.findIndex(item => item.url === selectedPhotoForViewer?.url);
  const hasNext = viewerIndex !== -1 && viewerIndex < allViewerItems.length - 1;
  const hasPrev = viewerIndex !== -1 && viewerIndex > 0;

  const navigateNext = () => {
    if (hasNext) {
      const nextPhoto = allViewerItems[viewerIndex + 1];
      setSelectedPhotoForViewer(nextPhoto);
      setEditingCaptionText(nextPhoto.caption || '');
      setEditingAltTextText(nextPhoto.altText || '');
      setIsEditingCaption(false);
    }
  };

  const navigatePrev = () => {
    if (hasPrev) {
      const prevPhoto = allViewerItems[viewerIndex - 1];
      setSelectedPhotoForViewer(prevPhoto);
      setEditingCaptionText(prevPhoto.caption || '');
      setEditingAltTextText(prevPhoto.altText || '');
      setIsEditingCaption(false);
    }
  };

  const handleDownload = (imgUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'hillytrip_scenic_photo'}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-200 mt-12 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-extrabold text-2xl text-slate-800 flex items-center gap-2">
            <Camera className="w-6 h-6 text-emerald-600 animate-pulse" />
            Visual Guide Gallery
          </h3>
          <p className="text-sm text-slate-500 mt-1">Scenic photos contributed by local travelers and guide admins</p>
        </div>
        {isAdmin && (
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-full inline-block border border-emerald-200">
            👑 Admin Direct Sync Active
          </span>
        )}
      </div>

      {/* 5. Lazy-Loaded Images Gallery Display Block */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Seeded default fallback images with Lazy-Load support */}
        {staticGallery.map((imgUrl, idx) => (
          <div 
            key={`static-${idx}`} 
            id={`gallery-static-card-${idx}`} 
            onClick={() => {
              const matchedShowcase = allViewerItems.find(item => item.url === imgUrl);
              setSelectedPhotoForViewer(matchedShowcase || { url: imgUrl, isStatic: true, caption: 'Official Showcase View', altText: `${entityType === 'destination' ? 'Destination' : 'Attraction'} premium scenic highlight view`, uploadedBy: 'HillyTrip Guides', uploadDate: '' });
              setEditingCaptionText('Official Showcase View');
              setEditingAltTextText(`${entityType === 'destination' ? 'Destination' : 'Attraction'} premium scenic highlight view`);
              setIsEditingCaption(false);
            }}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-200 border border-slate-105 shadow-xs hover:scale-[1.02] transition-all cursor-pointer"
            title="Click to view photo"
          >
            <img 
              src={imgUrl || DEFAULT_HOMESTAY_IMAGE} 
              alt={`${entityType} high-resolution tour visual`} 
              referrerPolicy="no-referrer"
              loading="lazy" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <span className="text-[10px] text-white font-medium">Official Photo</span>
            </div>
          </div>
        ))}

        {/* Dynamic active user approved images with lazy loading */}
        {activePhotos.map((photo) => {
          const isLikedByCurrentUser = user && likes.some((l) => l.id === `${user.uid}_${photo.id}`);
          const totalPhotoLikes = likes.filter((l) => l.contentId === photo.id).length;
          return (
            <div 
              key={photo.id} 
              id={`gallery-photo-card-${photo.id}`} 
              onClick={() => {
                setSelectedPhotoForViewer({ ...photo, isStatic: false });
                setEditingCaptionText(photo.caption || '');
                setEditingAltTextText(photo.altText || '');
                setIsEditingCaption(false);
              }}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-250 shadow-xs hover:scale-[1.02] transition-all cursor-pointer"
              title="Click to view and edit caption"
            >
              <img 
                src={photo.url || DEFAULT_HOMESTAY_IMAGE} 
                alt={photo.altText || photo.caption} 
                referrerPolicy="no-referrer"
                loading="lazy" 
                className="w-full h-full object-cover" 
              />
              
              {/* Photo Like Button */}
              {onToggleLike && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(photo.id, 'photo');
                  }}
                  className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-xs hover:bg-white p-1.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 border border-slate-100"
                  title="Like photo"
                >
                  <Heart 
                    className={`w-3.5 h-3.5 transition-colors ${
                      isLikedByCurrentUser 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-slate-500 hover:text-red-500'
                    }`} 
                  />
                  <span className="text-[10px] font-bold text-slate-800">{totalPhotoLikes}</span>
                </button>
              )}

              {/* SEO Descriptive alt layout overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-left">
                <span className="text-white text-xs font-bold truncate">{photo.caption}</span>
                <span className="text-slate-300 text-[9px] truncate">By {photo.uploadedBy}</span>
                <span className="text-emerald-400 text-[8px] tracking-wider uppercase font-semibold mt-0.5" title={photo.altText}>SEO Alt: {photo.altText.substring(0, 30)}...</span>
              </div>
            </div>
          );
        })}
        
        {staticGallery.length === 0 && activePhotos.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            <FileImage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium">No community photography shared yet. Be the first to share your journey!</p>
          </div>
        )}
      </div>

      {/* Upload segment */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h4 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-1.5">
          <UploadCloud className="w-5 h-5 text-emerald-600" />
          Share Traveler Highlights
        </h4>
        <p className="text-xs text-slate-500 mb-4 font-sans">
          Your photos will be automatically optimized to speedy, high-efficiency WebP format in the browser for super-fast mobile page loading.
        </p>

        {user ? (
          <div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Area */}
              <div 
                id="file-dropzone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileBrowser}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  dragActive 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="file"
                  id="image-file-picker"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={previewUrl || DEFAULT_HOMESTAY_IMAGE} alt="WebP preview" className="w-32 h-20 rounded-lg object-cover border-2 border-emerald-400 shadow-sm" />
                    <div>
                      <span className="text-xs font-bold text-emerald-700 block">✓ Optimized WebP Compression Complete</span>
                      <span className="text-[10px] text-slate-400">File ready: {selectedFile?.name} (Compressed to ~80% size)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Drag & drop your scenic photo here, or <span className="text-emerald-600 underline">browse local drive</span></p>
                    <p className="text-[10px] text-slate-400">Supports JPEG, PNG, JPG, or WebP. Automatic optimization, max size 10MB limit</p>
                  </div>
                )}
              </div>

              {/* Upload settings (Only if folder image selected) */}
              {previewUrl && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Image Title / Caption</label>
                    <input 
                      type="text"
                      required
                      value={caption || ''}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder='e.g. Majestic peak views of Sandakphu range'
                      className="w-full text-xs bg-slate-50 border border-slate-200 focus:outline bg-white rounded-lg p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      SEO Descriptive Alt Text
                      <span className="group relative">
                        <Info className="w-3 h-3 text-slate-400 cursor-help" />
                        <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white font-normal p-2 rounded text-[9px] w-48 leading-relaxed mb-1 z-20">
                          Explain what's in the image to help search engines like Google discover these hill coordinates!
                        </span>
                      </span>
                    </label>
                    <input 
                      type="text"
                      required
                      value={altText || ''}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder='e.g. sandakphu snowy pine forest mountain sunrise visual'
                      className="w-full text-xs bg-slate-50 border border-slate-200 focus:outline bg-white rounded-lg p-2.5"
                    />
                  </div>
                </div>
              )}

              {/* Status and Action Buttons */}
              {uploadStatus === 'compressing' && (
                <div className="flex items-center gap-2.5 text-xs text-amber-700 bg-amber-50 rounded-xl p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Converting image to highly-performing low-latency .webp extension...</span>
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div className="flex items-center gap-2.5 text-xs text-emerald-700 bg-emerald-50 rounded-xl p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Uploading files to Firebase Secure Cloud Storage...</span>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2.5 text-xs text-red-700 bg-red-50 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {previewUrl && (
                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setWebpBlob(null);
                      setPreviewUrl('');
                      setUploadStatus('idle');
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Clear File
                  </button>
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    {isAdmin ? 'Approve & Publish Photo' : 'Submit Traveler Photo'}
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-sans mb-3 font-semibold leading-relaxed">
              🔐 User Sign In Required
            </p>
            <p className="text-[11px] text-slate-400 mb-4 max-w-sm mx-auto">
              Please authorize using Google in the navigation menu to submit traveler snapshots. Images undergo active moderation before being publicized.
            </p>
            <button 
              onClick={onLogin}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition hover:scale-[1.02] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In with Google to upload
            </button>
          </div>
        )}
      </div>

      {/* 6. High-Quality Lightbox View & Caption Management Modal */}
      {selectedPhotoForViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          {/* Backdrop closer */}
          <div className="absolute inset-0 cursor-default" onClick={() => setSelectedPhotoForViewer(null)} />
          
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] z-10 border border-slate-200 dark:border-slate-800">
            {/* Close icon */}
            <button 
              type="button"
              onClick={() => setSelectedPhotoForViewer(null)}
              className="absolute top-4 right-4 z-20 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Portion: Cinematic Image Viewer with arrows and image index badges */}
            <div className="flex-grow bg-slate-900 flex items-center justify-center relative min-h-[280px] md:min-h-0 md:w-3/5">
              {/* Previous Button */}
              {hasPrev && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-slate-950/70 hover:bg-slate-950 text-white p-2.5 rounded-full shadow-lg transition duration-200 cursor-pointer border border-white/10 active:scale-95 flex items-center justify-center"
                  title="Previous Photo (Left Arrow Key)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              <img 
                src={selectedPhotoForViewer.url || DEFAULT_HOMESTAY_IMAGE} 
                alt={selectedPhotoForViewer.altText || selectedPhotoForViewer.caption || 'HillyTrip scenic landscape'} 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[45vh] md:max-h-[80vh] object-contain p-2 relative z-10 transition-transform duration-300" 
              />

              {/* Next Button */}
              {hasNext && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigateNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-slate-950/70 hover:bg-slate-950 text-white p-2.5 rounded-full shadow-lg transition duration-200 cursor-pointer border border-white/10 active:scale-95 flex items-center justify-center"
                  title="Next Photo (Right Arrow Key)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Photo indicators count */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-950/75 backdrop-blur-xs px-3.5 py-1 rounded-full text-[10px] text-slate-300 font-mono tracking-wider font-extrabold shadow-sm uppercase border border-white/5 whitespace-nowrap">
                {viewerIndex + 1} / {allViewerItems.length}
              </div>
            </div>

            {/* Right Portion: Captions, Contributors & Meta Controller */}
            <div className="w-full md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 max-h-[45vh] md:max-h-none">
              <div className="space-y-6 text-left">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2 font-mono">
                    {selectedPhotoForViewer.isStatic ? '✨ Verified Showcase' : '📸 Traveler Capture'}
                  </span>
                  
                  {isEditingCaption ? (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">Image Caption / Title</label>
                        <input
                          type="text"
                          value={editingCaptionText}
                          onChange={(e) => setEditingCaptionText(e.target.value)}
                          placeholder="Provide a wonderful title..."
                          required
                          className="w-full text-xs font-semibold bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-slate-800 dark:text-white focus:border-emerald-500 focus:outline outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 font-mono">SEO Descriptive Alt Text</label>
                        <textarea
                          rows={2}
                          value={editingAltTextText}
                          onChange={(e) => setEditingAltTextText(e.target.value)}
                          placeholder="Describe the landscape element (mountains, lake, temple)..."
                          className="w-full text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-slate-800 dark:text-white focus:border-emerald-500 focus:outline outline-hidden"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingCaption(false)}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-300 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSavingCaption}
                          onClick={async () => {
                            if (!editingCaptionText.trim()) return;
                            setIsSavingCaption(true);
                            try {
                              const photoId = selectedPhotoForViewer.id;
                              const response = await fetch(`/api/images/${photoId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  caption: editingCaptionText.trim(),
                                  altText: editingAltTextText.trim()
                                })
                              });
                              if (!response.ok) {
                                throw new Error('Failed to update caption database record.');
                              }
                              const data = await response.json();
                              if (data.image) {
                                setSelectedPhotoForViewer({ ...data.image, isStatic: false });
                                if (onPhotoUpdated) {
                                  onPhotoUpdated(data.image);
                                }
                                setNotification({ type: 'success', message: 'Scenic photo caption updated successfully!' });
                              }
                              setIsEditingCaption(false);
                            } catch (err: any) {
                              setNotification({ type: 'error', message: err.message || 'Error occurred while saving.' });
                            } finally {
                              setIsSavingCaption(false);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          {isSavingCaption ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-snug">
                        {selectedPhotoForViewer.caption || 'HillyTrip Scenic Landscape View'}
                      </h4>
                      {selectedPhotoForViewer.altText && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                          🎯 <span className="font-bold text-slate-650">Alt SEO context:</span> "{selectedPhotoForViewer.altText}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-120 dark:border-slate-800/80 pt-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contributed By</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {selectedPhotoForViewer.uploadedBy || 'HillyTrip Guides'}
                    </span>
                  </div>
                  {selectedPhotoForViewer.uploadDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shared On</span>
                      <span className="font-medium text-slate-6 tracking-tight text-slate-600 dark:text-slate-400">
                        {new Date(selectedPhotoForViewer.uploadDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {!selectedPhotoForViewer.isStatic && (
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100/30">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3.5 leading-relaxed">
                      Add a story, regional title, or accurate sightseeing spot to help prospective mountain travelers plan their itinerary!
                    </p>
                    
                    {user ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingCaption(true);
                          setEditingCaptionText(selectedPhotoForViewer.caption || '');
                          setEditingAltTextText(selectedPhotoForViewer.altText || '');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Edit or Add Caption
                      </button>
                    ) : (
                      <div className="text-[11px] text-slate-400 font-sans">
                        🔐 <button type="button" onClick={() => { setSelectedPhotoForViewer(null); onLogin(); }} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Sign in with Google</button> to add/edit travelers' captions.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-120 dark:border-slate-800 pt-4 mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedPhotoForViewer.url, selectedPhotoForViewer.caption || 'hillytrip_photo')}
                  className="flex-grow py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-100 dark:border-emerald-950/30"
                  title="Download picture to your device"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download HD
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoForViewer(null)}
                  className="flex-grow py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
