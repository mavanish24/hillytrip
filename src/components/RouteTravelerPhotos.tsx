// src/components/RouteTravelerPhotos.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Heart, MessageSquare, Send, X, PlusCircle, CheckCircle, UploadCloud, FileImage, AlertTriangle, Loader2
} from 'lucide-react';
import { User } from '../types';
import { compressAndConvertToWebP } from '../utils/imageOptimizer';
import { uploadImageToFirebase, googleSignIn } from '../utils/firebase';

interface TravelerPhoto {
  id: string;
  url: string;
  caption: string;
  userName: string;
  userAvatar: string;
  likes: number;
  likedByUser: boolean;
  comments: Array<{
    userName: string;
    text: string;
    time: string;
  }>;
  createdAt: string;
}

interface RouteTravelerPhotosProps {
  routeId: string;
  fromName: string;
  toName: string;
  setNotification?: (notif: { type: 'success' | 'error' | 'info', message: string } | null) => void;
  user?: User | null;
}

export default function RouteTravelerPhotos({
  routeId,
  fromName,
  toName,
  setNotification,
  user
}: RouteTravelerPhotosProps) {
  const storageKey = `hillytrip_photos_${routeId}`;

  // Initial seed photos
  const initialPhotos: TravelerPhoto[] = [
    {
      id: 'photo-1',
      url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop',
      caption: `Just passed the mountain gates! Mount Kanchenjunga standing high and clear. Absolutely mind-blowing landscape.`,
      userName: "Srinjoy Dutta",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
      likes: 42,
      likedByUser: false,
      comments: [
        { userName: "Pritha Sen", text: "Stunning shot! What time did you cross this point?", time: "2 hours ago" },
        { userName: "Srinjoy Dutta", text: "Around 9:15 AM! The clouds cleared up perfectly.", time: "1 hour ago" }
      ],
      createdAt: "1 day ago"
    },
    {
      id: 'photo-2',
      url: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=800&auto=format&fit=crop',
      caption: `The roadside waterfalls are roaring! Make sure to ask your taxi driver to stop for a quick photography session.`,
      userName: "Rohit Karki",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
      likes: 29,
      likedByUser: false,
      comments: [
        { userName: "Amit G.", text: "Wow, is this waterfall right on the route?", time: "1 day ago" },
        { userName: "Rohit Karki", text: "Yes! About 15km before the main valley checkpoint.", time: "1 day ago" }
      ],
      createdAt: "2 days ago"
    }
  ];

  const [photos, setPhotos] = useState<TravelerPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<TravelerPhoto | null>(null);
  
  // Comment drawer states
  const [newComment, setNewComment] = useState<string>('');
  
  // Upload photo states
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Pre-loaded Himalayan images for selection
  const preLoadedPresets = [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop"
  ];
  const [selectedPreset, setSelectedPreset] = useState<string>(preLoadedPresets[0]);

  // Load photos
  useEffect(() => {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      try {
        setPhotos(JSON.parse(cached));
      } catch (e) {
        setPhotos(initialPhotos);
      }
    } else {
      setPhotos(initialPhotos);
      localStorage.setItem(storageKey, JSON.stringify(initialPhotos));
    }
  }, [routeId]);

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process selected file
  const processFile = async (file: File) => {
    if (!file) return;
    setIsOptimizing(true);
    try {
      const webpBlob = await compressAndConvertToWebP(file, 800, 800, 0.7);
      const base64Url = await uploadImageToFirebase(webpBlob, file.name);
      setSelectedFile(file);
      setUploadPreview(base64Url);
      if (setNotification) {
        setNotification({ type: 'success', message: '📸 Image optimized successfully!' });
      }
    } catch (err: any) {
      console.error(err);
      if (setNotification) {
        setNotification({ type: 'error', message: err.message || 'Failed to process image.' });
      }
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle manual file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Instant login inside modal
  const handleInstantLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res && setNotification) {
        setNotification({ type: 'success', message: `Welcome, ${res.user.displayName}! Ready to share snapshots.` });
      }
    } catch (err) {
      console.error(err);
      if (setNotification) {
        setNotification({ type: 'error', message: 'Failed to sign in. Please try again.' });
      }
    }
  };

  // Handle Like clicks
  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = photos.map(ph => {
      if (ph.id === id) {
        const liked = !ph.likedByUser;
        return {
          ...ph,
          likedByUser: liked,
          likes: liked ? ph.likes + 1 : ph.likes - 1
        };
      }
      return ph;
    });
    setPhotos(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Update active sheet
    if (selectedPhoto && selectedPhoto.id === id) {
      const activePh = updated.find(x => x.id === id);
      if (activePh) setSelectedPhoto(activePh);
    }
  };

  // Post Comment
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPhoto) return;

    const commenterName = user?.name || user?.displayName || "Amr K Murarka";
    const updated = photos.map(ph => {
      if (ph.id === selectedPhoto.id) {
        return {
          ...ph,
          comments: [
            ...ph.comments,
            { userName: commenterName, text: newComment, time: "Just now" }
          ]
        };
      }
      return ph;
    });

    setPhotos(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewComment('');

    // Sync selected photo details
    const activePh = updated.find(x => x.id === selectedPhoto.id);
    if (activePh) setSelectedPhoto(activePh);

    if (setNotification) {
      setNotification({ type: 'success', message: 'Comment posted successfully!' });
    }
  };

  // Submit Simulated Upload
  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (setNotification) {
        setNotification({ type: 'error', message: 'Please sign in first to upload photos.' });
      }
      return;
    }

    if (!uploadCaption.trim()) {
      if (setNotification) {
        setNotification({ type: 'error', message: 'Please write a caption first.' });
      }
      return;
    }

    // Determine final photo URL
    const finalUrl = uploadPreview || selectedPreset;

    const newPhoto: TravelerPhoto = {
      id: `photo-${Date.now()}`,
      url: finalUrl,
      caption: uploadCaption,
      userName: user?.name || user?.displayName || "Amr K Murarka",
      userAvatar: (user as any)?.avatarUrl || (user as any)?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      likes: 1,
      likedByUser: true,
      comments: [],
      createdAt: "Just now"
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    // Clear upload fields
    setUploadCaption('');
    setSelectedFile(null);
    setUploadPreview(null);
    setShowUploadModal(false);

    if (setNotification) {
      setNotification({ type: 'success', message: 'Himalayan snap uploaded! Synced to dynamic traveler grid.' });
    }
  };

  return (
    <div className="bg-[#05120c] border border-emerald-500/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(3,10,6,0.5)] text-left relative">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-emerald-500/10">
        <div>
          <h3 className="font-extrabold text-lg text-emerald-400 tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" /> Traveler Photo Stream
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Explore recent snapshot posts uploaded by travelers along the {fromName} - {toName} corridor.</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs tracking-wider uppercase rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" /> Share Snapshot
        </button>
      </div>

      {/* Grid Layout of photos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map(ph => (
          <div 
            key={ph.id}
            onClick={() => setSelectedPhoto(ph)}
            className="group bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden relative aspect-square cursor-pointer hover:border-emerald-500/30 hover:scale-[1.01] transition-all duration-300"
          >
            <img 
              src={ph.url} 
              alt={ph.caption} 
              className="w-full h-full object-cover group-hover:scale-103 transition-all duration-500" 
            />

            {/* Faint Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

            {/* Hearts / Comments overlays */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate flex-grow mr-2">
                @{ph.userName.split(' ')[0]}
              </span>
              <div className="flex items-center gap-2 text-white text-xs">
                <button 
                  onClick={(e) => handleLike(ph.id, e)}
                  className="p-1 rounded-md hover:bg-white/10 transition cursor-pointer flex items-center gap-0.5"
                >
                  <Heart className={`w-3.5 h-3.5 ${ph.likedByUser ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                  <span className="text-[10.5px] font-bold">{ph.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PHOTO DETAILS MODAL WITH DISQUS COMMENTS SHEET */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4 text-white"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-[#05120c] border border-emerald-500/15 rounded-3xl overflow-hidden max-w-4xl w-full max-h-[85vh] grid grid-cols-1 md:grid-cols-12 shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Left side: Large photo */}
            <div className="md:col-span-7 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[450px]">
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.caption} 
                className="w-full h-full object-cover max-h-[45vh] md:max-h-[85vh]" 
              />
              
              {/* Like overlay trigger */}
              <button
                onClick={(e) => handleLike(selectedPhoto.id, e)}
                className="absolute top-4 left-4 p-2.5 bg-slate-950/70 backdrop-blur-md border border-white/5 rounded-full hover:bg-slate-950 transition cursor-pointer shadow-md"
              >
                <Heart className={`w-5 h-5 ${selectedPhoto.likedByUser ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} />
              </button>
            </div>

            {/* Right side: Comments & details */}
            <div className="md:col-span-5 p-5 flex flex-col justify-between h-[350px] md:h-full max-h-[40vh] md:max-h-[85vh] text-left border-t md:border-t-0 md:border-l border-emerald-500/10">
              
              {/* Photo uploader profile */}
              <div>
                <div className="flex items-center justify-between gap-3 border-b border-emerald-500/10 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={selectedPhoto.userAvatar} 
                      alt={selectedPhoto.userName} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-800" 
                    />
                    <div>
                      <h5 className="text-xs font-black text-white flex items-center gap-1 uppercase tracking-wider">
                        {selectedPhoto.userName} <CheckCircle className="w-3 h-3 text-emerald-400" />
                      </h5>
                      <span className="text-[9px] text-slate-500 font-mono uppercase">{selectedPhoto.createdAt}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPhoto(null)}
                    className="p-1 bg-white/5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Caption content */}
                <p className="text-[11px] text-slate-200 font-medium leading-relaxed mb-4">
                  {selectedPhoto.caption}
                </p>

                {/* Comments box header */}
                <span className="text-[9px] font-black text-slate-500 font-mono uppercase block mb-2 border-b border-slate-900 pb-1">
                  COMMENTS BOARD ({selectedPhoto.comments.length})
                </span>

                {/* Comments scroll area */}
                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[160px] md:max-h-[260px] pr-1.5 scrollbar-thin">
                  {selectedPhoto.comments.length > 0 ? (
                    selectedPhoto.comments.map((cm, idx) => (
                      <div key={idx} className="bg-slate-950/30 p-2 rounded-xl border border-slate-900">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wide">
                            {cm.userName}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">{cm.time}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 font-medium mt-0.5">{cm.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-500 font-medium italic text-center py-4">No comments yet. Be the first to reply!</p>
                  )}
                </div>
              </div>

              {/* Input write comment footer */}
              <form onSubmit={handlePostComment} className="flex gap-2 border-t border-emerald-500/10 pt-3 mt-3 relative">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a friendly reply..."
                  className="flex-grow bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/30 pr-8"
                />
                <button 
                  type="submit"
                  className="absolute right-2.5 top-5.5 text-emerald-400 hover:text-white transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* SNAPSHOT UPLOAD MODAL SHELL */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-[110] p-4 text-white animate-fade-in"
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className="bg-[#05120c] border border-emerald-500/20 p-6 rounded-3xl max-w-md w-full shadow-2xl relative text-left animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!user ? (
              <div className="flex flex-col items-center justify-center text-center py-6 px-2">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-full text-amber-400 mb-4 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">Authentication Required</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mb-6">
                  Only authenticated travelers can upload photos and share high-altitude scenic snapshots. Please log in to contribute!
                </p>
                
                <button
                  onClick={handleInstantLogin}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Sign In with Google
                </button>
                
                <p className="text-[10px] text-slate-500 mt-3 font-mono">
                  Or use the "Log In" option in the main navigation bar.
                </p>
              </div>
            ) : (
              <>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">Post a High-Altitude Snapshot</h4>
                
                <form onSubmit={handleUploadPhoto} className="flex flex-col gap-4">
                  
                  {/* Custom File Upload Dropzone */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Upload Custom Photo</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                        dragActive 
                          ? 'border-emerald-400 bg-emerald-500/5' 
                          : uploadPreview 
                            ? 'border-emerald-500/30 bg-emerald-500/5' 
                            : 'border-slate-800 hover:border-emerald-500/20 bg-slate-950'
                      }`}
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      
                      {isOptimizing ? (
                        <div className="flex flex-col items-center py-2">
                          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                          <span className="text-xs text-slate-300 font-bold font-mono uppercase tracking-wider">Optimizing & Converting...</span>
                        </div>
                      ) : uploadPreview ? (
                        <div className="flex flex-col items-center">
                          <div className="relative w-full max-h-[160px] rounded-lg overflow-hidden border border-emerald-500/30 mb-2">
                            <img src={uploadPreview} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                setUploadPreview(null);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-slate-950/80 hover:bg-slate-950 rounded-full text-slate-400 hover:text-white transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Custom photo ready to upload!
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-2">
                          <UploadCloud className="w-8 h-8 text-slate-500 mb-2" />
                          <p className="text-xs text-slate-200 font-bold">Drag & drop your scenic photo here</p>
                          <p className="text-[10px] text-slate-500 mt-1">or click to browse local files (max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Select preset image (Fallback) */}
                  {!uploadPreview && (
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Or Choose a Scenic Preset</label>
                      <div className="grid grid-cols-4 gap-2">
                        {preLoadedPresets.map((preset, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setSelectedPreset(preset)}
                            className={`relative rounded-lg aspect-square overflow-hidden cursor-pointer border-2 transition-all ${
                              selectedPreset === preset ? 'border-emerald-400 scale-95 shadow-lg' : 'border-slate-900 opacity-60'
                            }`}
                          >
                            <img src={preset} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Caption field */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Snapshot Caption</label>
                    <textarea
                      rows={3}
                      value={uploadCaption}
                      onChange={(e) => setUploadCaption(e.target.value)}
                      placeholder="e.g. Magnificent blue skies reflecting off river boulders near Kalimpong halt!"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/40 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isOptimizing}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition duration-150 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing Image...
                      </>
                    ) : (
                      "Upload & Sync To Community Board"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
