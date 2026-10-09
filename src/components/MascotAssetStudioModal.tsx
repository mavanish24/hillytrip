import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Upload, Image as ImageIcon, CheckCircle, RefreshCw, Eye, FolderPlus, Download, Info, ShieldCheck, Heart } from 'lucide-react';
import { HillyV1Mascot } from './HillyV1Mascot';

interface MascotAssetStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MASCOT_POSES = [
  { id: 'standing', name: 'Front View (Standing)', file: 'hilly-standing.png' },
  { id: 'back', name: 'Back View', file: 'hilly-back.png' },
  { id: 'waving', name: 'Waving Greeting', file: 'hilly-waving.png' },
  { id: 'pointing', name: 'Pointing Guide', file: 'hilly-pointing.png' },
  { id: 'reading_map', name: 'Reading Map', file: 'hilly-reading_map.png' },
  { id: 'drinking_tea', name: 'Drinking Himalayan Tea', file: 'hilly-drinking_tea.png' },
  { id: 'thinking', name: 'Thinking / Planning', file: 'hilly-thinking.png' },
  { id: 'celebrating', name: 'Celebrating / Happy', file: 'hilly-celebrating.png' },
  { id: 'excited', name: 'Excited Discovery', file: 'hilly-excited.png' }
];

export const MascotAssetStudioModal: React.FC<MascotAssetStudioModalProps> = ({ isOpen, onClose }) => {
  const [customAssets, setCustomAssets] = useState<Record<string, string>>({});
  const [selectedPose, setSelectedPose] = useState<string>('waving');
  const [activeTab, setActiveTab] = useState<'preview' | 'upload' | 'folder_guide'>('preview');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hillytrip_mascot_custom_assets');
      if (saved) {
        setCustomAssets(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleFileUpload = (poseId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const url = e.target.result as string;
        const updated = { ...customAssets, [poseId]: url };
        setCustomAssets(updated);
        localStorage.setItem('hillytrip_mascot_custom_assets', JSON.stringify(updated));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearAsset = (poseId: string) => {
    const updated = { ...customAssets };
    delete updated[poseId];
    setCustomAssets(updated);
    localStorage.setItem('hillytrip_mascot_custom_assets', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setCustomAssets({});
    localStorage.removeItem('hillytrip_mascot_custom_assets');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-slate-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                🏔️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Mascot Asset Manager
                  </span>
                  <span className="text-xs text-slate-400">/public/mascots/</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Hilly Mascot Expressions & Studio
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Emotions Showcase</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browser Quick Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('folder_guide')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'folder_guide'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Folder File Structure Guide</span>
            </button>
          </div>

          {/* TAB 1: PREVIEW SHOWCASE */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200 leading-relaxed">
                  Hilly is HillyTrip&apos;s AI travel buddy. Select any pose below to inspect the animation, speech bubbles, and expression rendering. If you upload your artwork files into <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300">/public/mascots/</code> or via the upload tab, Hilly will seamlessly switch to your custom assets!
                </p>
              </div>

              {/* Main Interactive Stage */}
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-6">
                <div className="w-52 h-60 flex items-center justify-center relative">
                  <HillyV1Mascot
                    pose={selectedPose === 'back' ? 'standing' : selectedPose}
                    view={selectedPose === 'back' ? 'back' : 'front'}
                    size="xl"
                    showNameTag={true}
                    nameTagLabel={`Hilly • ${selectedPose.toUpperCase()}`}
                    showSpeechBubble={true}
                    speechText={
                      selectedPose === 'waving' ? 'Namaste! Welcome to the Himalayas!' :
                      selectedPose === 'reading_map' ? 'Let me find the safest scenic route for you!' :
                      selectedPose === 'drinking_tea' ? 'Sipping hot Himalayan chai near Solang Valley...' :
                      selectedPose === 'thinking' ? 'Optimizing homestay budgets and travel times...' :
                      selectedPose === 'celebrating' ? 'Woohoo! Your itinerary is ready!' :
                      selectedPose === 'back' ? 'Looking towards the snow-capped mountain peaks...' :
                      'Ready to explore mountain trails!'
                    }
                  />
                </div>

                <div className="space-y-3 max-w-md w-full">
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                    Select Emotion / View Pose:
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MASCOT_POSES.map((p) => {
                      const isSelected = selectedPose === p.id;
                      const hasCustom = !!customAssets[p.id];
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPose(p.id)}
                          className={`p-2.5 rounded-2xl text-left border text-xs font-bold transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-lg scale-[1.02]'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          <div className="truncate">{p.name}</div>
                          {hasCustom && (
                            <span className="text-[9px] text-amber-300 block font-semibold">
                              ✓ Custom Uploaded
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROWSER QUICK UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Upload Custom Artwork Assets Directly</h3>
                  <p className="text-xs text-slate-400">Instant browser memory storage for testing and immediate UI display.</p>
                </div>
                {Object.keys(customAssets).length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reset All Custom Assets
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MASCOT_POSES.map((pose) => {
                  const hasAsset = !!customAssets[pose.id];
                  return (
                    <div key={pose.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{pose.name}</span>
                        {hasAsset && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="h-28 bg-slate-900 rounded-xl border border-dashed border-slate-800 flex items-center justify-center p-2 relative overflow-hidden">
                        {hasAsset ? (
                          <img src={customAssets[pose.id]} alt={pose.name} className="h-full object-contain" />
                        ) : (
                          <div className="text-center space-y-1">
                            <ImageIcon className="w-6 h-6 text-slate-600 mx-auto" />
                            <span className="text-[10px] text-slate-500 block">No custom file attached</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer text-center border border-slate-700 transition-colors">
                          <span>{hasAsset ? 'Replace' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(pose.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        {hasAsset && (
                          <button
                            onClick={() => handleClearAsset(pose.id)}
                            className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FOLDER GUIDE */}
          {activeTab === 'folder_guide' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  Standard Folder Path: /public/mascots/
                </h3>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  We have created the folder <code className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded font-mono">public/mascots</code> in your project repository. Simply save your mascot PNG, JPG, or SVG image files into that directory with these standard names:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300">
                    📂 public/mascots/hilly-standing.png
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300">
                    📂 public/mascots/hilly-back.png
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-sky-300">
                    📂 public/mascots/hilly-waving.png
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-sky-300">
                    📂 public/mascots/hilly-pointing.png
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300">
                    📂 public/mascots/hilly-reading_map.png
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-amber-300">
                    📂 public/mascots/hilly-drinking_tea.png
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-purple-300">
                    📂 public/mascots/hilly-thinking.png
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-purple-300">
                    📂 public/mascots/hilly-celebrating.png
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Once saved into <code className="text-slate-300">/public/mascots/</code>, the Hilly character across the entire application will automatically use your image artwork instead of vector fallback graphics!
                </p>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors shadow-lg cursor-pointer"
            >
              Done & Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MascotAssetStudioModal;
