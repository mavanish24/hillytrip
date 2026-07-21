import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  Upload, 
  Check, 
  Image as ImageIcon, 
  AlertTriangle, 
  Loader2, 
  Save, 
  Video, 
  Trash2, 
  Eye, 
  ChevronRight, 
  Undo,
  Film
} from "lucide-react";
import { doc, getDoc, setDoc, ref, uploadBytes, getDownloadURL, deleteObject, db, storage } from "../utils/firebase";

// Default assets for Hero
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1600&auto=format&fit=crop";
const DEFAULT_HERO_VIDEO = "/videos/home-hero.mp4";

// Default assets for Feature Cards
const DEFAULT_FEATURES = {
  villages: {
    title: "Explore Secret Villages",
    img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=800&auto=format&fit=crop"
  },
  attractions: {
    title: "Mountain Sights & Trails",
    img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop"
  },
  taxi: {
    title: "Verified Taxi Routes",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"
  },
  homestays: {
    title: "Cozy Rural Homestays",
    img: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=800&auto=format&fit=crop"
  }
};

// Default assets for Experiences
const DEFAULT_EXPERIENCES = {
  "waterfalls": {
    name: "Waterfalls",
    img: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=1200&auto=format&fit=crop"
  },
  "mountain-villages": {
    name: "Mountain Villages",
    img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1200&auto=format&fit=crop"
  },
  "tea-gardens": {
    name: "Tea Gardens",
    img: "https://images.unsplash.com/photo-1555899434-94d1368aa712?q=80&w=1200&auto=format&fit=crop"
  },
  "monasteries": {
    name: "Monasteries",
    img: "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1200&auto=format&fit=crop"
  },
  "sunrise-viewpoints": {
    name: "Sunrise Viewpoints",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop"
  },
  "lakes": {
    name: "Lakes",
    img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop"
  },
  "pine-forests": {
    name: "Pine Forests",
    img: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop"
  },
  "trekking-trails": {
    name: "Trekking Trails",
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop"
  },
  "flower-valleys": {
    name: "Flower Valleys",
    img: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=1200&auto=format&fit=crop"
  },
  "hanging-bridges": {
    name: "Hanging Bridges",
    img: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1200&auto=format&fit=crop"
  },
  "camping": {
    name: "Camping",
    img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop"
  },
  "wildlife": {
    name: "Wildlife",
    img: "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1200&auto=format&fit=crop"
  },
  "hidden-gems": {
    name: "Hidden Gems",
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop"
  },
  "scenic-drives": {
    name: "Scenic Drives",
    img: "https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=1200&auto=format&fit=crop"
  },
  "photography-spots": {
    name: "Photography Spots",
    img: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1200&auto=format&fit=crop"
  }
};

export const AdminHomepageContentTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<"hero" | "features" | "experiences">("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Firestore states
  const [heroData, setHeroData] = useState<{ imageUrl?: string; videoUrl?: string }>({});
  const [featuresData, setFeaturesData] = useState<{ [key: string]: { imageUrl?: string; videoUrl?: string } }>({});
  const [experiencesData, setExperiencesData] = useState<{ [key: string]: { imageUrl?: string; videoUrl?: string } }>({});

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchHomepageContent = async () => {
      setLoading(true);
      try {
        // Fetch Hero
        const heroDoc = await getDoc(doc(db, "homepage_content", "hero"));
        if (heroDoc.exists()) {
          setHeroData(heroDoc.data() as any);
        }

        // Fetch Features
        const featuresDoc = await getDoc(doc(db, "homepage_content", "features"));
        if (featuresDoc.exists()) {
          setFeaturesData((featuresDoc.data()?.cards || {}) as any);
        }

        // Fetch Experiences
        const experiencesDoc = await getDoc(doc(db, "homepage_content", "experiences"));
        if (experiencesDoc.exists()) {
          setExperiencesData((experiencesDoc.data()?.categories || {}) as any);
        }
      } catch (err: any) {
        console.error("Error loading homepage static content from Firestore:", err);
        showNotification("error", "Failed to load homepage media configurations.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageContent();
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    section: "hero" | "features" | "experiences",
    type: "image" | "video",
    keyId?: string // card ID or category ID
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic file validation
    if (type === "image" && !file.type.startsWith("image/")) {
      showNotification("error", "Please select a valid image file.");
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      showNotification("error", "Please select a valid video file.");
      return;
    }

    const uploadFieldKey = `${section}-${type}${keyId ? `-${keyId}` : ""}`;
    setUploadingField(uploadFieldKey);

    try {
      // Upload file directly to Firebase Storage
      const fileRef = ref(storage, `homepage_content/${section}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      if (section === "hero") {
        setHeroData(prev => ({
          ...prev,
          [type === "image" ? "imageUrl" : "videoUrl"]: downloadUrl
        }));
      } else if (section === "features" && keyId) {
        setFeaturesData(prev => ({
          ...prev,
          [keyId]: {
            ...(prev[keyId] || {}),
            [type === "image" ? "imageUrl" : "videoUrl"]: downloadUrl
          }
        }));
      } else if (section === "experiences" && keyId) {
        setExperiencesData(prev => ({
          ...prev,
          [keyId]: {
            ...(prev[keyId] || {}),
            [type === "image" ? "imageUrl" : "videoUrl"]: downloadUrl
          }
        }));
      }

      showNotification("success", `${type === "image" ? "Image" : "Video"} uploaded successfully! Remember to Save changes.`);
    } catch (err: any) {
      console.error("File upload failed:", err);
      showNotification("error", err.message || "Failed to upload file.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleDeleteMedia = (
    section: "hero" | "features" | "experiences",
    type: "image" | "video",
    keyId?: string
  ) => {
    if (!window.confirm(`Are you sure you want to delete this custom ${type}? It will revert back to the default fallback asset.`)) {
      return;
    }

    if (section === "hero") {
      setHeroData(prev => {
        const next = { ...prev };
        if (type === "image") delete next.imageUrl;
        else delete next.videoUrl;
        return next;
      });
    } else if (section === "features" && keyId) {
      setFeaturesData(prev => {
        const next = { ...prev };
        if (next[keyId]) {
          if (type === "image") delete next[keyId].imageUrl;
          else delete next[keyId].videoUrl;
        }
        return next;
      });
    } else if (section === "experiences" && keyId) {
      setExperiencesData(prev => {
        const next = { ...prev };
        if (next[keyId]) {
          if (type === "image") delete next[keyId].imageUrl;
          else delete next[keyId].videoUrl;
        }
        return next;
      });
    }

    showNotification("success", `Removed custom ${type}. Click "Save Configuration" to apply changes.`);
  };

  const handleSaveConfiguration = async () => {
    setSaving(true);
    try {
      if (activeSection === "hero") {
        await setDoc(doc(db, "homepage_content", "hero"), {
          id: "hero",
          imageUrl: heroData.imageUrl || "",
          videoUrl: heroData.videoUrl || "",
          updatedAt: new Date().toISOString()
        });
      } else if (activeSection === "features") {
        await setDoc(doc(db, "homepage_content", "features"), {
          id: "features",
          cards: featuresData,
          updatedAt: new Date().toISOString()
        });
      } else if (activeSection === "experiences") {
        await setDoc(doc(db, "homepage_content", "experiences"), {
          id: "experiences",
          categories: experiencesData,
          updatedAt: new Date().toISOString()
        });
      }

      showNotification("success", `Saved ${activeSection.toUpperCase()} media configurations successfully!`);
    } catch (err: any) {
      console.error("Error saving to Firestore:", err);
      showNotification("error", "Failed to save configuration: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-700">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold transition-all transform flex items-center gap-2 ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          <span>{notification.type === "success" ? "✅" : "⚠️"}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 leading-relaxed">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight">Homepage Content Manager</h2>
          </div>
          <p className="text-xs text-slate-500 mt-2 max-w-xl">
            Centralized panel to manage static visual media across the HillyTrip Homepage. Easily replace images, upload videos, and preview custom visual setups.
          </p>
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleSaveConfiguration}
          disabled={saving || loading}
          className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-100 border border-emerald-700 shrink-0 self-start md:self-auto"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving Media..." : `Save ${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Config`}
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSection("hero")}
          className={`px-5 py-3 text-xs font-black transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "hero" 
              ? "border-emerald-600 text-emerald-600" 
              : "border-transparent text-slate-500 hover:text-slate-850"
          }`}
        >
          🏔️ Homepage Hero Media
        </button>
        <button
          onClick={() => setActiveSection("features")}
          className={`px-5 py-3 text-xs font-black transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "features" 
              ? "border-emerald-600 text-emerald-600" 
              : "border-transparent text-slate-500 hover:text-slate-850"
          }`}
        >
          🏡 Feature Cards Media
        </button>
        <button
          onClick={() => setActiveSection("experiences")}
          className={`px-5 py-3 text-xs font-black transition-all cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "experiences" 
              ? "border-emerald-600 text-emerald-600" 
              : "border-transparent text-slate-500 hover:text-slate-850"
          }`}
        >
          🎒 Explore by Experience Media
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 font-semibold space-y-2 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-sm">Synchronizing static media settings from cloud...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: HOMEPAGE HERO */}
          {activeSection === "hero" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b pb-2">Hero Video &amp; Image Slots</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image slot */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      Hero Image
                    </label>
                    {heroData.imageUrl && (
                      <button
                        onClick={() => handleDeleteMedia("hero", "image")}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Custom Image
                      </button>
                    )}
                  </div>

                  <div className="relative group aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={heroData.imageUrl || DEFAULT_HERO_IMAGE}
                      alt="Hero Image Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-white border border-white/10">
                      {heroData.imageUrl ? "✨ Custom Image Active" : "📦 System Default Placeholder"}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition text-slate-700">
                      {uploadingField === "hero-image" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{uploadingField === "hero-image" ? "Uploading Image..." : "Upload New Cover Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "hero", "image")}
                        disabled={uploadingField !== null}
                      />
                    </label>
                  </div>
                </div>

                {/* Video slot */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-emerald-600" />
                      Hero Video (Optional overlay)
                    </label>
                    {heroData.videoUrl && (
                      <button
                        onClick={() => handleDeleteMedia("hero", "video")}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Custom Video
                      </button>
                    )}
                  </div>

                  <div className="relative group aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                    {heroData.videoUrl || DEFAULT_HERO_VIDEO ? (
                      <video
                        key={heroData.videoUrl || DEFAULT_HERO_VIDEO}
                        src={heroData.videoUrl || DEFAULT_HERO_VIDEO}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-slate-400">
                        <Film className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="text-xs font-bold">No active background video asset.</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-white border border-white/10">
                      {heroData.videoUrl ? "✨ Custom Video Active" : "📦 System Default Video"}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition text-slate-700">
                      {uploadingField === "hero-video" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      ) : (
                        <Upload className="w-4 h-4 text-slate-400" />
                      )}
                      <span>{uploadingField === "hero-video" ? "Uploading Video..." : "Upload New Cover Video"}</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "hero", "video")}
                        disabled={uploadingField !== null}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: HOMEPAGE FEATURE CARDS */}
          {activeSection === "features" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b pb-2 mb-6">Master Features Navigation Cards</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(DEFAULT_FEATURES).map(([cardId, meta]) => {
                    const customImage = featuresData[cardId]?.imageUrl;
                    const customVideo = featuresData[cardId]?.videoUrl;

                    return (
                      <div key={cardId} className="border border-slate-200 rounded-3xl p-5 bg-slate-50/50 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Feature Node ID: {cardId}</span>
                            <h4 className="font-black text-sm text-slate-800 leading-tight">{meta.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            {customImage && (
                              <button
                                onClick={() => handleDeleteMedia("features", "image", cardId)}
                                className="text-[10px] font-extrabold text-rose-600 hover:text-rose-800 transition flex items-center gap-0.5 cursor-pointer"
                                title="Remove Custom Image"
                              >
                                <Trash2 className="w-3 h-3" /> Image
                              </button>
                            )}
                            {customVideo && (
                              <button
                                onClick={() => handleDeleteMedia("features", "video", cardId)}
                                className="text-[10px] font-extrabold text-rose-600 hover:text-rose-800 transition flex items-center gap-0.5 cursor-pointer"
                                title="Remove Custom Video"
                              >
                                <Trash2 className="w-3 h-3" /> Video
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Stage Preview */}
                        <div className="relative group h-44 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
                          {customVideo ? (
                            <video
                              key={customVideo}
                              src={customVideo}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={customImage || meta.img}
                              alt={meta.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold text-white border border-white/10">
                            {customVideo ? "🎬 Video Active" : customImage ? "✨ Custom Image" : "📦 Default Image"}
                          </div>
                        </div>

                        {/* File pickers */}
                        <div className="grid grid-cols-2 gap-3">
                          <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition text-slate-700">
                            {uploadingField === `features-image-${cardId}` ? (
                              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "features", "image", cardId)}
                              disabled={uploadingField !== null}
                            />
                          </label>

                          <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition text-slate-700">
                            {uploadingField === `features-video-${cardId}` ? (
                              <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                            ) : (
                              <Video className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <span>Upload Video</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, "features", "video", cardId)}
                              disabled={uploadingField !== null}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: EXPLORE BY EXPERIENCE */}
          {activeSection === "experiences" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b pb-2 mb-6">Explore By Experience Categories (15 Nodes)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(DEFAULT_EXPERIENCES).map(([catId, meta]) => {
                  const customImage = experiencesData[catId]?.imageUrl;
                  const customVideo = experiencesData[catId]?.videoUrl;

                  return (
                    <div key={catId} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 space-y-3.5">
                      <div className="flex justify-between items-center border-b pb-1.5">
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-800 leading-tight">{meta.name}</h4>
                          <span className="text-[9px] text-slate-400 font-mono">Category ID: {catId}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {customImage && (
                            <button
                              onClick={() => handleDeleteMedia("experiences", "image", catId)}
                              className="text-[9px] font-black text-rose-600 hover:text-rose-800 transition flex items-center gap-0.5 cursor-pointer"
                              title="Delete custom image"
                            >
                              <Trash2 className="w-3 h-3" /> Image
                            </button>
                          )}
                          {customVideo && (
                            <button
                              onClick={() => handleDeleteMedia("experiences", "video", catId)}
                              className="text-[9px] font-black text-rose-600 hover:text-rose-800 transition flex items-center gap-0.5 cursor-pointer"
                              title="Delete custom video"
                            >
                              <Trash2 className="w-3 h-3" /> Video
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cover Photo/Video preview */}
                      <div className="relative group h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
                        {customVideo ? (
                          <video
                            key={customVideo}
                            src={customVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={customImage || meta.img}
                            alt={meta.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold text-white border border-white/5">
                          {customVideo ? "🎥 Video" : customImage ? "✨ Custom" : "📦 Default"}
                        </div>
                      </div>

                      {/* File select controls */}
                      <div className="grid grid-cols-2 gap-2">
                        <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg py-1.5 px-2 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition text-slate-700">
                          {uploadingField === `experiences-image-${catId}` ? (
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                          ) : (
                            <Upload className="w-3 h-3 text-slate-400" />
                          )}
                          <span>Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "experiences", "image", catId)}
                            disabled={uploadingField !== null}
                          />
                        </label>

                        <label className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg py-1.5 px-2 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition text-slate-700">
                          {uploadingField === `experiences-video-${catId}` ? (
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                          ) : (
                            <Video className="w-3 h-3 text-slate-400" />
                          )}
                          <span>Video</span>
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, "experiences", "video", catId)}
                            disabled={uploadingField !== null}
                          />
                        </label>
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
  );
};
