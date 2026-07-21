import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, Bookmark, MessageSquare, Star, HelpCircle, Car, Settings, 
  LogOut, Lock, Bell, Shield, Globe, Trash2, Camera, Compass, Award, Heart, 
  MapPin, Edit3, Image as ImageIcon, Send, Clock, BookOpen, ThumbsUp, Sparkles, Share2, ArrowRight,
  X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight, Check, Loader2, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FeaturedPhotoUploader } from './FeaturedPhotoUploader';
import { UPSETravelerDashboard } from './UPSETravelerDashboard';

interface UserProfileSystemProps {
  user: any; // Logged-in user
  profileUser?: any; // The user whose profile is being viewed (if viewing someone else)
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
  onLogout: () => void;
}

export default function UserProfileSystem({
  user,
  profileUser,
  onUpdateUser,
  navigate,
  setNotification,
  onLogout
}: UserProfileSystemProps) {
  // If profileUser is provided and is different from current user, we are in public view mode
  const isPublic = !!profileUser && profileUser.id !== user?.id;
  const activeUser = isPublic ? profileUser : user;

  // Active state for local tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'moments' | 'payments'>('overview');

  // Local state for interactive items with rich social metadata
  const [profilePhotos, setProfilePhotos] = useState([
    { 
      id: 'p1', 
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 
      caption: 'Sunrise over Sissu Valley, Lahaul', 
      likes: 24,
      location: 'Sissu Valley, Lahaul',
      uploadDate: 'July 14, 2026',
      comments: [
        { user: 'Rohit Sharma', text: 'Stunning light! Did you use a filter?' },
        { user: 'Sneha Gupta', text: 'Heading there next week, any road advice?' }
      ]
    },
    { 
      id: 'p2', 
      url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80', 
      caption: 'Campfire under the starry sky at Solang', 
      likes: 42,
      location: 'Solang Valley, Manali',
      uploadDate: 'July 10, 2026',
      comments: [
        { user: 'Vikram Negi', text: 'The night sky at Solang is truly magical.' }
      ]
    },
    { 
      id: 'p3', 
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 
      caption: 'Gramphu Road adventure with luxury SUV', 
      likes: 18,
      location: 'Gramphu, Spiti Route',
      uploadDate: 'July 08, 2026',
      comments: []
    },
    { 
      id: 'p4', 
      url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80', 
      caption: 'Reaching the majestic peak of Hampta Pass', 
      likes: 35,
      location: 'Hampta Pass Peak',
      uploadDate: 'July 05, 2026',
      comments: [
        { user: 'Arun Singh', text: 'This trek is a bucket list goal!' },
        { user: 'Karan Negi', text: 'Excellent climb, the weather was in your favor.' }
      ]
    }
  ]);

  const [profileReviews, setProfileReviews] = useState([
    { id: 'r1', rating: 5, target: 'Pine Crest Wood Cabin (Solang Valley)', text: 'Absolutely spectacular! The host was incredibly welcoming and local organic breakfast was stellar.', date: 'July 10, 2026' },
    { id: 'r2', rating: 5, target: 'Karan Negi Cab Services', text: 'Highly recommended for any high-altitude transit! Extremely safe driving through Rohtang pass and Atal tunnel.', date: 'July 05, 2026' }
  ]);

  const [profileMoments, setProfileMoments] = useState([
    {
      id: 'm1',
      title: 'Solitude in Lahaul Valley',
      text: 'Crossing the Atal Tunnel on a foggy morning feels like stepping into a parallel dimension. The green slopes of Solang instantly shift to the rugged, cold, and dramatic stone peaks of Lahaul. Sissu is quiet, peaceful, and absolutely pristine.',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      time: '3 days ago',
      likes: 15,
      comments: 3
    },
    {
      id: 'm2',
      title: 'Reaching Chandra Taal Lake',
      text: 'After a bumpy 4 hours on the Spiti overlander camper route, the azure waters of Chandra Taal finally appeared. Nestled at 14,000 feet, this crescent-shaped lake is a true natural wonder.',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      time: '1 week ago',
      likes: 31,
      comments: 7
    }
  ]);

  // For Adding Travel Moments (owner only)
  const [momentTitle, setMomentTitle] = useState('');
  const [momentText, setMomentText] = useState('');
  const [momentImage, setMomentImage] = useState('');
  const [showAddMomentForm, setShowAddMomentForm] = useState(false);

  // For Profile Editing & Image Cropping
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [editBio, setEditBio] = useState('');

  // Synchronize state with current activeUser on open
  useEffect(() => {
    if (activeUser) {
      setEditName(activeUser.name || activeUser.displayName || '');
      setEditPhoto(activeUser.photoURL || '');
      setEditBio(activeUser.bio || '');
    }
  }, [activeUser, isEditingProfile]);

  // Image Cropping States
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  
  // Save status states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Full Screen Photo Viewer States
  const [activeFullPhotoIndex, setActiveFullPhotoIndex] = useState<number | null>(null);
  const [newPhotoComment, setNewPhotoComment] = useState('');
  const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoLocation, setNewPhotoLocation] = useState('');
  const [newPhotoRaw, setNewPhotoRaw] = useState<string | null>(null);

  // Swipe detection refs / states for Full Screen Viewer
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Member Since Calculation
  const getMemberSince = () => {
    if (activeUser?.createdAt) {
      try {
        const date = new Date(activeUser.createdAt);
        return 'Joined ' + date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } catch (e) {
        return 'Joined July 2024';
      }
    }
    return 'Joined July 2024';
  };

  // Draggable cropped image pointer event handlers
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });
  };

  // Base display dimensions calculated to ensure the image covers the 280px cropper box
  const isLandscape = imgDimensions.width > imgDimensions.height;
  const displayWidth = isLandscape ? 280 * (imgDimensions.width / imgDimensions.height) : 280;
  const displayHeight = isLandscape ? 280 : 280 * (imgDimensions.height / imgDimensions.width);

  // Mathematical Canvas Image Cropping mapping to 400x400 output
  const cropImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 400; // Output high-res avatar size
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Crop circle is 220px in a 280px UI box
        const scaleFactor = 400 / 220;

        ctx.save();
        ctx.translate(200, 200);
        ctx.scale(scaleFactor, scaleFactor);
        ctx.translate(position.x, position.y);
        ctx.scale(zoom, zoom);

        const isLand = img.width > img.height;
        const dW = isLand ? 280 * (img.width / img.height) : 280;
        const dH = isLand ? 280 : 280 * (img.height / img.width);

        ctx.drawImage(img, -dW / 2, -dH / 2, dW, dH);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = rawImage || '';
    });
  };

  // Photo Selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      if (setNotification) setNotification({ type: 'error', message: 'Unsupported file type. Please upload JPEG, PNG, or WEBP.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (setNotification) setNotification({ type: 'error', message: 'File size exceeds 5MB limit.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (target === 'avatar') {
        setRawImage(reader.result as string);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setShowCropModal(true);
      } else {
        setNewPhotoRaw(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit avatar cropping and upload to Supabase avatars bucket
  const handleSaveCroppedPhoto = async () => {
    setIsUploading(true);
    try {
      const croppedBase64 = await cropImage();
      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeUser.email,
          imageBase64: croppedBase64
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setEditPhoto(data.publicUrl);
      onUpdateUser({
        ...activeUser,
        photoURL: data.publicUrl
      });

      if (setNotification) {
        setNotification({ type: 'success', message: 'Photo uploaded and synchronized successfully!' });
      }

      setShowCropModal(false);
      setShowPhotoOptions(false);
    } catch (error: any) {
      if (setNotification) {
        setNotification({ type: 'error', message: error.message || 'Failed to upload photo' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Clear avatar photoURL via server endpoint
  const handleRemovePhoto = async () => {
    if (window.confirm('Are you sure you want to remove your profile photo?')) {
      try {
        const response = await fetch('/api/auth/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: activeUser.email,
            photoURL: ''
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to remove photo');
        }

        setEditPhoto('');
        onUpdateUser(data.user);

        if (setNotification) {
          setNotification({ type: 'success', message: 'Profile photo removed' });
        }
        setShowPhotoOptions(false);
      } catch (error: any) {
        if (setNotification) {
          setNotification({ type: 'error', message: error.message || 'Failed to remove photo' });
        }
      }
    }
  };

  // Determine if profile fields have actual changes
  const hasChanges = 
    editName.trim() !== (activeUser?.name || activeUser?.displayName || '').trim() ||
    editBio.trim() !== (activeUser?.bio || '').trim() ||
    editPhoto !== (activeUser?.photoURL || '');

  // Main profile details update (Full Name & Bio)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: activeUser.email,
          name: editName.trim(),
          bio: editBio.trim(),
          photoURL: editPhoto
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSaveSuccess(true);
      onUpdateUser(data.user);

      if (setNotification) {
        setNotification({ type: 'success', message: 'Profile updated successfully!' });
      }

      setTimeout(() => {
        setIsEditingProfile(false);
        setSaveSuccess(false);
        setIsSaving(false);
      }, 1500);

    } catch (error: any) {
      setIsSaving(false);
      if (setNotification) {
        setNotification({ type: 'error', message: error.message || 'Error updating profile' });
      }
    }
  };

  const handleAddMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentTitle.trim() || !momentText.trim()) return;
    const newMoment = {
      id: `m_${Date.now()}`,
      title: momentTitle,
      text: momentText,
      image: momentImage || 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
      time: 'Just now',
      likes: 0,
      comments: 0
    };
    setProfileMoments([newMoment, ...profileMoments]);
    setMomentTitle('');
    setMomentText('');
    setMomentImage('');
    setShowAddMomentForm(false);
    if (setNotification) {
      setNotification({ type: 'success', message: 'Travel moment shared successfully!' });
    }
  };

  // Add new photo to the social gallery list
  const handleAddGalleryPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoCaption.trim() || !newPhotoRaw) {
      if (setNotification) setNotification({ type: 'error', message: 'Please select an image and enter a caption.' });
      return;
    }

    const newPhoto = {
      id: `p_${Date.now()}`,
      url: newPhotoRaw,
      caption: newPhotoCaption.trim(),
      likes: 0,
      location: newPhotoLocation.trim() || 'Himalayas',
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      comments: []
    };

    setProfilePhotos([newPhoto, ...profilePhotos]);
    setNewPhotoCaption('');
    setNewPhotoLocation('');
    setNewPhotoRaw(null);
    setShowAddPhotoForm(false);

    if (setNotification) {
      setNotification({ type: 'success', message: 'Travel photo uploaded successfully to gallery!' });
    }
  };

  // Like a photo inside Full Screen Photo Viewer
  const handleLikePhoto = (photoId: string) => {
    setProfilePhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    }));
  };

  // Post comment on a photo inside Full Screen Photo Viewer
  const handlePostComment = (photoId: string) => {
    if (!newPhotoComment.trim()) return;
    setProfilePhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        return {
          ...p,
          comments: [...p.comments, { user: user?.name || 'You', text: newPhotoComment.trim() }] as any
        };
      }
      return p;
    }));
    setNewPhotoComment('');
  };

  // Delete gallery photo
  const handleDeletePhoto = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this photo from your gallery?')) {
      setProfilePhotos(prev => prev.filter(p => p.id !== photoId));
      if (setNotification) {
        setNotification({ type: 'success', message: 'Photo deleted successfully.' });
      }
    }
  };

  // Full Screen Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || activeFullPhotoIndex === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe && activeFullPhotoIndex < profilePhotos.length - 1) {
      setActiveFullPhotoIndex(activeFullPhotoIndex + 1);
    } else if (isRightSwipe && activeFullPhotoIndex > 0) {
      setActiveFullPhotoIndex(activeFullPhotoIndex - 1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 selection:bg-emerald-500/10">
      
      {/* ========================================================
          PROFILE HEADER
          ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-150 dark:border-slate-800 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-6 transition duration-200">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left w-full md:w-auto">
          {/* Profile Photo */}
          <div className="relative shrink-0 group">
            {activeUser?.photoURL ? (
              <img 
                src={activeUser.photoURL} 
                alt={activeUser.name || 'Explorer'} 
                className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-50 dark:border-slate-800 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-3xl font-black font-sans shrink-0 shadow-md select-none">
                {(activeUser?.name || activeUser?.email || 'T').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {activeUser?.name || activeUser?.displayName || activeUser?.email?.split('@')[0] || 'Explorer'}
              </h2>
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-650 dark:text-emerald-400 shrink-0" />
                <span>Gold Explorer Badge</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
              {activeUser?.bio || 'Mountain enthusiast & certified road-tripper. Exploring the pristine high altitude roads.'}
            </p>

            <div className="text-[11px] text-slate-400 font-bold font-mono tracking-wide flex items-center justify-center md:justify-start gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{getMemberSince()}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile (Owner only) */}
        {!isPublic && (
          <button
            onClick={() => setIsEditingProfile(true)}
            className="w-full md:w-auto px-5 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl border border-slate-150 dark:border-slate-700/80 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Edit Profile Form Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => {
                if (!isSaving && !showPhotoOptions && !showCropModal) {
                  setIsEditingProfile(false);
                }
              }}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden text-slate-800 dark:text-slate-100"
            >
              {/* Success Notification Banner inside Modal */}
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-x-0 top-0 bg-emerald-500 text-white py-4 px-6 text-center font-black text-sm flex items-center justify-center gap-2 z-50 shadow-md"
                  >
                    <Check className="w-5 h-5 shrink-0" />
                    <span>✅ Profile Updated Successfully</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Profile Editor</h3>
                  <p className="text-xs text-slate-400">WhatsApp, Airbnb & Google styled traveller profile.</p>
                </div>
                <button 
                  disabled={isSaving}
                  onClick={() => setIsEditingProfile(false)} 
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* 120-140px CIRCULAR PROFILE AVATAR AT TOP OF EDITOR */}
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-md group flex items-center justify-center bg-slate-100 dark:bg-slate-950">
                    {editPhoto ? (
                      <img 
                        src={editPhoto} 
                        alt={editName || 'Explorer'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-4xl font-black select-none">
                        {(editName || 'T').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* CHANGE PHOTO BUTTON BELOW AVATAR */}
                  <button
                    type="button"
                    onClick={() => setShowPhotoOptions(true)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-black rounded-full border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-650 dark:text-emerald-400" />
                    <span>📷 Change Photo</span>
                  </button>
                </div>

                {/* HIDDEN FILE INPUTS */}
                <input
                  type="file"
                  id="file-upload-device"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => handleFileChange(e, 'avatar')}
                />
                <input
                  type="file"
                  id="file-upload-camera"
                  accept="image/jpeg,image/png,image/webp"
                  capture="user"
                  className="hidden"
                  onChange={e => handleFileChange(e, 'avatar')}
                />

                {/* FIELDS */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Travel Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Write a short travel motto or bio..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!hasChanges || isSaving}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                      !hasChanges 
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Options Modal Sheet */}
      <AnimatePresence>
        {showPhotoOptions && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowPhotoOptions(false)}
            />
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-xs w-full p-6 shadow-2xl text-slate-850 dark:text-slate-100 space-y-4 overflow-hidden"
            >
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Change Profile Photo</h4>
                <p className="text-[10px] text-slate-400">Select how you want to update your avatar</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    document.getElementById('file-upload-device')?.click();
                  }}
                  className="w-full py-3 hover:bg-slate-50 dark:hover:bg-slate-850 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>
                
                <button
                  onClick={() => {
                    document.getElementById('file-upload-camera')?.click();
                  }}
                  className="w-full py-3 hover:bg-slate-50 dark:hover:bg-slate-850 text-sky-600 dark:text-sky-400 text-xs font-black rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Camera (Mobile)</span>
                </button>

                {editPhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full py-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-450 text-xs font-black rounded-xl border border-rose-100/40 dark:border-rose-950/40 cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Current Photo</span>
                  </button>
                )}

                <button
                  onClick={() => setShowPhotoOptions(false)}
                  className="w-full py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 text-[11px] font-bold rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropModal && rawImage && (
          <div className="fixed inset-0 z-[12000] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs"
              onClick={() => {
                if (!isUploading) setShowCropModal(false);
              }}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center gap-5 text-slate-800 dark:text-slate-100"
            >
              <div className="text-center space-y-1 w-full">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Reposition & Zoom</h4>
                <p className="text-[10px] text-slate-400">Drag image to adjust framing within circle</p>
              </div>

              {/* Draggable Circle Cropper Area */}
              <div 
                className="w-[280px] h-[280px] relative overflow-hidden bg-slate-950 rounded-2xl cursor-grab active:cursor-grabbing select-none border border-slate-200 dark:border-slate-800 shadow-inner"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              >
                {/* Draggable Image loaded from user selection */}
                <img
                  src={rawImage}
                  onLoad={handleImageLoad}
                  style={{
                    width: displayWidth,
                    height: displayHeight,
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    maxWidth: 'none',
                    maxHeight: 'none'
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none transition-transform duration-75"
                  alt="Crop Source"
                />

                {/* Circular Crop Guide Mask overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  <div className="w-[220px] h-[220px] rounded-full border-2 border-emerald-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.75)]" />
                </div>
              </div>

              {/* Zoom slider controls */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none"
                  />
                  <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>

              <div className="flex gap-3 w-full pt-1">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setShowCropModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-150 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleSaveCroppedPhoto}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Crop</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Photo Viewer Modal */}
      <AnimatePresence>
        {activeFullPhotoIndex !== null && (
          <div className="fixed inset-0 z-[15000] flex items-center justify-center bg-black/95 backdrop-blur-md select-none text-white overflow-hidden">
            
            {/* Dark background close click */}
            <div 
              className="absolute inset-0 z-0" 
              onClick={() => setActiveFullPhotoIndex(null)}
            />

            {/* Top Bar with actions */}
            <div className="absolute top-0 inset-x-0 h-16 px-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏔️</span>
                <span className="text-xs font-black uppercase tracking-widest font-mono text-emerald-400">HillyTrip Social Feed</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const photo = profilePhotos[activeFullPhotoIndex];
                    navigator.clipboard.writeText(photo.url);
                    if (setNotification) setNotification({ type: 'success', message: 'Photo link copied to clipboard!' });
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-slate-300 hover:text-white"
                  title="Share Photo"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <a
                  href={profilePhotos[activeFullPhotoIndex].url}
                  download={`HillyTrip_${profilePhotos[activeFullPhotoIndex].id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 hover:bg-white/10 rounded-full transition cursor-pointer text-slate-300 hover:text-white"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setActiveFullPhotoIndex(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
                  title="Close Viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Viewer Body */}
            <div className="relative w-full h-full flex flex-col lg:flex-row z-10 max-w-6xl mx-auto pt-16 pb-6 px-4 gap-6 items-center justify-center">
              
              {/* Left pane: Photo with Desktop Sliders & Touch swipe */}
              <div 
                className="relative flex-1 w-full h-[50vh] lg:h-[80vh] flex items-center justify-center overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Desktop Left navigation arrow */}
                {activeFullPhotoIndex > 0 && (
                  <button
                    onClick={() => setActiveFullPhotoIndex(activeFullPhotoIndex - 1)}
                    className="absolute left-4 z-40 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition cursor-pointer border border-white/10 hidden md:block"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* High Resolution Image */}
                <img
                  src={profilePhotos[activeFullPhotoIndex].url}
                  alt={profilePhotos[activeFullPhotoIndex].caption}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl pointer-events-none select-none"
                />

                {/* Desktop Right navigation arrow */}
                {activeFullPhotoIndex < profilePhotos.length - 1 && (
                  <button
                    onClick={() => setActiveFullPhotoIndex(activeFullPhotoIndex + 1)}
                    className="absolute right-4 z-40 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full transition cursor-pointer border border-white/10 hidden md:block"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Mobile swipe indicator overlay */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 md:hidden">
                  {profilePhotos.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all ${idx === activeFullPhotoIndex ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/40'}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Right pane: Social Details & Interactive Comments */}
              <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-[40vh] lg:h-[80vh] max-h-[550px] lg:max-h-none shadow-2xl space-y-4">
                
                {/* Image Details Header */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-wider text-emerald-400 font-mono">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profilePhotos[activeFullPhotoIndex].location || 'Prinstine Himalayas'}</span>
                    <span className="text-slate-600">•</span>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{profilePhotos[activeFullPhotoIndex].uploadDate}</span>
                  </div>

                  <h4 className="text-md font-black tracking-tight leading-snug">
                    {profilePhotos[activeFullPhotoIndex].caption}
                  </h4>
                  
                  {/* Photo Author */}
                  <div className="flex items-center gap-2.5 pt-1.5">
                    {activeUser?.photoURL ? (
                      <img 
                        src={activeUser.photoURL} 
                        alt={activeUser.name} 
                        className="w-7 h-7 rounded-full object-cover border border-white/25"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                        {(activeUser?.name || 'T').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-200">
                      Shared by {activeUser?.name || 'Explorer'}
                    </span>
                  </div>
                </div>

                {/* Comments Scrollable list */}
                <div className="flex-1 overflow-y-auto border-y border-slate-800 py-3.5 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
                  {profilePhotos[activeFullPhotoIndex].comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-[11px] font-semibold">No comments yet. Start the conversation!</p>
                    </div>
                  ) : (
                    profilePhotos[activeFullPhotoIndex].comments.map((c, index) => (
                      <div key={index} className="space-y-1 text-left">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-black">
                          <span>{c.user}</span>
                        </div>
                        <p className="text-xs text-slate-200 bg-slate-950/30 p-2.5 rounded-xl border border-slate-850/40 leading-relaxed">
                          {c.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom Social Action Toolbar & Comment Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleLikePhoto(profilePhotos[activeFullPhotoIndex].id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-350 text-xs font-black transition cursor-pointer border border-white/5"
                    >
                      <span>♥</span>
                      <span>{profilePhotos[activeFullPhotoIndex].likes} Likes</span>
                    </button>
                    
                    <span className="text-[10px] text-slate-500 font-bold font-mono">
                      {profilePhotos[activeFullPhotoIndex].comments.length} Comments
                    </span>
                  </div>

                  {/* Comment Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newPhotoComment}
                      onChange={e => setNewPhotoComment(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handlePostComment(profilePhotos[activeFullPhotoIndex].id);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => handlePostComment(profilePhotos[activeFullPhotoIndex].id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:text-emerald-400 text-slate-400 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          PROFILE STATS CARDS
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 md:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-1">
          <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider font-mono block">Trips Completed</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">14</h3>
          <span className="text-[9.5px] text-emerald-500 font-bold font-mono">● 2 upcoming</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-1">
          <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider font-mono block">Photos Uploaded</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{profilePhotos.length}</h3>
          <span className="text-[9.5px] text-slate-400 font-mono">Himalayan shots</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-1">
          <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider font-mono block">Reviews Written</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{profileReviews.length}</h3>
          <span className="text-[9.5px] text-yellow-500 font-bold font-mono">★ 5.0 Average</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-1">
          <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider font-mono block">Likes Received</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">119</h3>
          <span className="text-[9.5px] text-rose-500 font-bold font-mono">♥ Community lift</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-3xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider font-mono block">Contributions</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">38</h3>
          <span className="text-[9.5px] text-purple-500 font-bold font-mono">XP: 2,400 pts</span>
        </div>
      </div>

      {/* ========================================================
          PROFILE TABS NAVIGATION
          ======================================================== */}
      <div className="flex gap-2 border-b border-slate-150 dark:border-slate-800 pb-px overflow-x-auto">
        {(['overview', 'photos', 'reviews', 'moments', 'payments'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab 
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black' 
                : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'moments' ? 'Travel Moments' : tab === 'payments' ? 'Invoices & Refunds' : tab}
          </button>
        ))}
      </div>

      {/* ========================================================
          ACTIVE TAB VIEWS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Content Area (Tabs) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* BADGES */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">My Explorer Badges</h3>
                  <span className="text-[10px] text-slate-400 font-bold">4 / 8 unlocked</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex gap-3.5">
                    <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Wilderness Trekker</h4>
                      <p className="text-[10px] text-slate-500">Completed 5 high-altitude Himalayan treks above 12,000 feet.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex gap-3.5">
                    <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Peak Climber</h4>
                      <p className="text-[10px] text-slate-500">Conquered standard routes on Hampta Pass and Rohtang.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex gap-3.5">
                    <div className="w-10 h-10 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Roadtripper Champion</h4>
                      <p className="text-[10px] text-slate-500">Explored Lahaul and Spiti Valley backcountry routes successfully.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl flex gap-3.5">
                    <div className="w-10 h-10 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Night Sky Gazer</h4>
                      <p className="text-[10px] text-slate-500">Contributed 3 certified astrophotography shots from Spiti.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* UPCOMING TRIP (Private / Owner Only) */}
              {!isPublic && (
                <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden border border-emerald-950">
                  <div className="absolute inset-0 opacity-10">
                    <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="background" className="w-full h-full object-cover" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Upcoming Adventure
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black tracking-tight">Manali - Lahaul Expedition 2026</h4>
                      <p className="text-xs text-slate-300">Scheduled Departure: July 20, 2026 (5 days left)</p>
                    </div>
                    <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/40 text-[11px] leading-relaxed text-slate-200">
                      <strong>Itinerary Highlight:</strong> Sissu waterfall trek, campfire stargazing, and 4x4 offroad traverse to Gondhla castle. Cab booked with <em>Karan Negi services</em>.
                    </div>
                  </div>
                </div>
              )}

              {/* RECENT ACTIVITY TIMELINE */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Recent Traveller Activity</h3>
                
                <div className="relative border-l border-slate-100 dark:border-slate-850 ml-3.5 pl-6 space-y-6">
                  <div className="relative">
                    <span className="absolute -left-9.5 top-0.5 w-7 h-7 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-xs border border-emerald-200">
                      ✓
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Trip Completed</h4>
                      <p className="text-[11px] text-slate-500">Finished the Gramphu - Keylong Backcountry road traverse.</p>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">Yesterday</span>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-9.5 top-0.5 w-7 h-7 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs border border-blue-200">
                      📷
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Photo Uploaded</h4>
                      <p className="text-[11px] text-slate-500">Shared a majestic peak sunrise photo at Sissu Valley.</p>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">3 days ago</span>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-9.5 top-0.5 w-7 h-7 bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-450 rounded-full flex items-center justify-center text-xs border border-yellow-200">
                      ★
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Review Submitted</h4>
                      <p className="text-[11px] text-slate-500">Rated Pine Crest cabin 5-stars for outstanding hospitality.</p>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">1 week ago</span>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-9.5 top-0.5 w-7 h-7 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-450 rounded-full flex items-center justify-center text-xs border border-rose-200">
                      ♥
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Like Received</h4>
                      <p className="text-[11px] text-slate-500">Your travel moment "Solitude in Lahaul Valley" was liked by 12 other explorers.</p>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PHOTOS */}
          {activeTab === 'photos' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 text-slate-800 dark:text-slate-100">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Uploaded Traveller Photos</h3>
                  <p className="text-[10px] text-slate-400">Pristine geotagged Himalayan visual logs shared by the traveller</p>
                </div>
                {!isPublic && (
                  <button 
                    onClick={() => setShowAddPhotoForm(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-3xs animate-fade-in"
                  >
                    <span>+ Add Photo</span>
                  </button>
                )}
              </div>

              {/* Add New Gallery Photo Form Modal */}
              <AnimatePresence>
                {showAddPhotoForm && (
                  <div className="fixed inset-0 z-[11000] flex items-center justify-center px-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                      onClick={() => setShowAddPhotoForm(false)}
                    />
                    
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden text-slate-850 dark:text-slate-100"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h4 className="text-md font-black tracking-tight text-slate-900 dark:text-white">Share a Travel Photo</h4>
                          <p className="text-xs text-slate-400">Post a geotagged Himalayan shot to your HillyTrip feed.</p>
                        </div>
                        <button 
                          onClick={() => setShowAddPhotoForm(false)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleAddGalleryPhoto} className="space-y-4">
                        
                        {/* Image selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Select Photograph</label>
                          {newPhotoRaw ? (
                            <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-250 dark:border-slate-850">
                              <img src={newPhotoRaw} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewPhotoRaw(null)}
                                className="absolute top-2.5 right-2.5 p-1.5 bg-black/50 hover:bg-black/75 rounded-full text-white transition cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => document.getElementById('gallery-photo-input')?.click()}
                              className="h-44 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-950 flex flex-col items-center justify-center gap-2 cursor-pointer transition"
                            >
                              <ImageIcon className="w-8 h-8 text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">Click to Upload Image</span>
                              <span className="text-[9px] text-slate-400 font-mono">Supports JPEG, PNG, WEBP up to 5MB</span>
                            </div>
                          )}
                          <input
                            type="file"
                            id="gallery-photo-input"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={e => handleFileChange(e, 'gallery')}
                          />
                        </div>

                        {/* Caption input */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Caption *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Majestic view of Chandra Taal water"
                            value={newPhotoCaption}
                            onChange={e => setNewPhotoCaption(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Location geotag */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-mono">Location Geotag</label>
                          <input
                            type="text"
                            placeholder="e.g. Chandra Taal, Spiti"
                            value={newPhotoLocation}
                            onChange={e => setNewPhotoLocation(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddPhotoForm(false)}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-705 rounded-xl text-xs font-black transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition cursor-pointer"
                          >
                            Share Photo
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {profilePhotos.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-150 dark:border-slate-800 rounded-2xl">
                  <ImageIcon className="w-10 h-10 text-slate-350 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-650 dark:text-slate-350">No uploaded photos yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {profilePhotos.map((photo, index) => (
                    <div 
                      key={photo.id} 
                      onClick={() => setActiveFullPhotoIndex(index)}
                      className="group relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 shadow-3xs bg-slate-50 dark:bg-slate-950 cursor-pointer transition hover:shadow-md text-left"
                    >
                      <div className="h-52 overflow-hidden relative">
                        <img 
                          src={photo.url} 
                          alt={photo.caption} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        
                        {/* Location Geotag inside Photo card */}
                        <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/5 select-none z-10">
                          <MapPin className="w-2.5 h-2.5 text-emerald-450" />
                          <span>{photo.location || 'Himalayas'}</span>
                        </div>

                        {/* Photo metrics */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
                          <div className="bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 select-none border border-white/5">
                            <span className="text-rose-450">♥</span>
                            <span>{photo.likes}</span>
                          </div>
                          <div className="bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 select-none border border-white/5">
                            <span>💬</span>
                            <span>{photo.comments.length}</span>
                          </div>
                        </div>

                        {/* Desktop Hover Action overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex flex-col items-center justify-center gap-3 z-20">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveFullPhotoIndex(index);
                              }}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer"
                            >
                              View Photo
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(photo.url);
                                if (setNotification) setNotification({ type: 'success', message: 'Photo link copied to clipboard!' });
                              }}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition cursor-pointer"
                              title="Share link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            {!isPublic && (
                              <button
                                onClick={(e) => handleDeletePhoto(photo.id, e)}
                                className="p-2 bg-rose-950/70 hover:bg-rose-900 text-rose-200 rounded-lg transition border border-rose-900/30 cursor-pointer"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-300 font-bold tracking-wider uppercase font-mono mt-1">Uploaded {photo.uploadDate}</span>
                        </div>
                      </div>

                      {/* Photo details footer on card */}
                      <div className="p-4 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-850">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {photo.caption}
                        </p>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold font-mono">
                          <span>Verifiable Himalayan Geolocation Tagged</span>
                          <span>{photo.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Reviews Written</h3>
              
              <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
                {profileReviews.map((rev, idx) => (
                  <div key={rev.id} className={`space-y-3 ${idx > 0 ? 'pt-6' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{rev.target}</h4>
                        <span className="text-[9px] text-slate-400 font-bold font-mono">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-450 text-xs font-bold gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold italic">
                      "{rev.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TRAVEL MOMENTS */}
          {activeTab === 'moments' && (
            <div className="space-y-8">
              
              {/* Add Travel Moment (Owner Only) */}
              {!isPublic && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Post a Travel Moment</h3>
                      <p className="text-[10px] text-slate-400">Share your high-country stories, advice or vlogs with the HillyTrip community.</p>
                    </div>
                    <button
                      onClick={() => setShowAddMomentForm(!showAddMomentForm)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      {showAddMomentForm ? 'Cancel' : '+ Add New Story'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAddMomentForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddMoment}
                        className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 overflow-hidden"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-400">Moment Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Crossing the treacherous Gramphu turn"
                            value={momentTitle}
                            onChange={e => setMomentTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 font-bold"
                          />
                        </div>
                        <FeaturedPhotoUploader
                          onUploadComplete={(url) => setMomentImage(url)}
                          onClear={() => setMomentImage('')}
                          currentImageUrl={momentImage}
                          email={activeUser?.email || user?.email}
                        />
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-black text-slate-400">Story Narrative *</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Write your adventure story or travel tips here..."
                            value={momentText}
                            onChange={e => setMomentText(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 font-semibold"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition cursor-pointer"
                        >
                          Share Travel Moment
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Moments List */}
              <div className="space-y-6">
                {profileMoments.map(mom => (
                  <div key={mom.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs flex flex-col sm:flex-row">
                    <div className="sm:w-52 h-44 sm:h-auto overflow-hidden shrink-0 relative">
                      <img src={mom.image} alt={mom.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">{mom.title}</h4>
                          <span className="text-[9px] text-slate-400 font-bold font-mono shrink-0">{mom.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold line-clamp-3">
                          {mom.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 font-mono">
                        <button className="flex items-center gap-1 hover:text-rose-500 transition cursor-pointer">
                          <span>♥</span>
                          <span>{mom.likes} Likes</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-emerald-500 transition cursor-pointer">
                          <span>💬</span>
                          <span>{mom.comments} Comments</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab === 'payments' && (
            <UPSETravelerDashboard travelerId={activeUser?.email || user?.email || 'traveler@hillytrip.com'} />
          )}

        </div>

        {/* Right Sidebar Area (Quick Actions, Stats info, etc.) */}
        <div className="space-y-8">
          
          {/* QUICK ACTIONS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-5">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">Quick Actions</h3>
            
            <div className="space-y-2">
              <button 
                onClick={() => navigate('#/destinations')}
                className="w-full h-11 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-xs font-black rounded-xl cursor-pointer transition text-left flex items-center justify-between"
              >
                <span>Explore Destinations</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button 
                onClick={() => navigate('#/homestays')}
                className="w-full h-11 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-xs font-black rounded-xl cursor-pointer transition text-left flex items-center justify-between"
              >
                <span>Explore Homestays</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button 
                onClick={() => navigate('#/my-quote-requests')}
                className="w-full h-11 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-xs font-black rounded-xl cursor-pointer transition text-left flex items-center justify-between"
              >
                <span>Get Live Quotes</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button 
                onClick={() => navigate('#/travel-guides')}
                className="w-full h-11 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-800 dark:text-slate-100 text-xs font-black rounded-xl cursor-pointer transition text-left flex items-center justify-between"
              >
                <span>HillyTrip Travel Guide</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* VERIFIED MEMBER BLOCK */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 space-y-4 text-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">🏔️</span>
              <h4 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-400">Pristine Explorer</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              HillyTrip monitors and rewards positive local contributions, clean trekking guidelines compliance, and certified homestay reviews. Keep uploading moments to progress to your next badge tier!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
