// src/components/RouteGallery.tsx
import React, { useState } from 'react';
import { 
  Camera, Eye, Layers, ChevronLeft, ChevronRight, X, Play, RotateCw
} from 'lucide-react';

interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'pano360';
  url: string;
  title: string;
  category: 'landscape' | 'traveler' | 'admin' | 'virtual';
  caption: string;
}

interface RouteGalleryProps {
  routeId: string;
  fromName: string;
  toName: string;
}

export default function RouteGallery({
  routeId,
  fromName,
  toName
}: RouteGalleryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'landscape' | 'traveler' | 'pano360'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  // Interactive drag state for 360 panoramic mock view
  const [panoOffset, setPanoOffset] = useState<number>(0);
  const [isDraggingPano, setIsDraggingPano] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);

  // Pool of high quality landscape images
  const items: GalleryItem[] = React.useMemo(() => {
    return [
      {
        id: 'gal-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
        title: "Kanchenjunga Dawn Crest",
        category: 'landscape',
        caption: "Breathtaking peak shadows cast over the high valleys during early golden dawn transit hours."
      },
      {
        id: 'gal-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=1200&auto=format&fit=crop',
        title: "Alpine Forest Sinuous Road",
        category: 'landscape',
        caption: "A sweeping aerial look at the high-altitude pine forests and steep blacktop lanes climbing northward."
      },
      {
        id: 'gal-3',
        type: 'pano360',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
        title: "360° Virtual High Valley Ridge",
        category: 'virtual',
        caption: "Drag left/right to explore a full spherical panorama of snowy ranges and steep tea fields."
      },
      {
        id: 'gal-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
        title: "Teesta Bridge Crossing",
        category: 'landscape',
        caption: "Handcrafted wooden bridge connecting remote valleys, complete with sacred Buddhist prayer flags."
      },
      {
        id: 'gal-5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200&auto=format&fit=crop',
        title: "Snow-capped Mountain Wall",
        category: 'traveler',
        caption: "A stunning traveler's snap captured right outside the jeep window near Mangan checkpost."
      },
      {
        id: 'gal-6',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=1200&auto=format&fit=crop',
        title: "Cascading Bhim Nala Falls",
        category: 'traveler',
        caption: "Water spray hitting traveler camera lenses along the rocky roadside halt point."
      }
    ];
  }, [routeId]);

  // Filters
  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pano360') return item.type === 'pano360';
    return item.category === activeTab;
  });

  // Lightbox handlers
  const openLightbox = (index: number) => {
    // Find the item in the filtered list
    const originalItem = filteredItems[index];
    const originalIdx = items.findIndex(it => it.id === originalItem.id);
    if (originalIdx > -1) {
      setLightboxIndex(originalIdx);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % items.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + items.length) % items.length);
    }
  };

  // Panoramic mock interactions
  const handlePanoMouseDown = (e: React.MouseEvent) => {
    setIsDraggingPano(true);
    setStartX(e.clientX - panoOffset);
  };

  const handlePanoMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPano) return;
    const offset = e.clientX - startX;
    // Bound the scroll between -400 and 400 pixels
    setPanoOffset(Math.max(-400, Math.min(400, offset)));
  };

  const handlePanoMouseUp = () => {
    setIsDraggingPano(false);
  };

  return (
    <div className="bg-[#05120c] border border-emerald-500/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(3,10,6,0.5)] text-left">
      
      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-emerald-500/10 pb-4">
        <div>
          <h3 className="font-extrabold text-lg text-emerald-400 tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" /> Route Media Gallery
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Explore authentic high-resolution landscape images, traveler snaps, and immersive virtual views.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Photos' },
            { id: 'landscape', label: 'Landscapes' },
            { id: 'traveler', label: 'Traveler Snaps' },
            { id: 'pano360', label: '360° Virtuals' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-md transition duration-150 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-slate-950 font-black' 
                  : 'bg-slate-950/40 text-slate-400 hover:text-white hover:bg-slate-950/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry-like Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => {
          const is360 = item.type === 'pano360';
          return (
            <div 
              key={item.id}
              onClick={() => openLightbox(index)}
              className="group bg-slate-950/40 border border-slate-900 rounded-2xl overflow-hidden relative h-[200px] cursor-pointer shadow-sm hover:scale-[1.01] hover:border-emerald-500/25 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="w-full h-full relative overflow-hidden">
                <img 
                  src={item.url} 
                  alt={item.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                />
                
                {/* Back Gradient Tint */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-80" />
              </div>

              {/* Extra visual indicators for panoramas or video */}
              {is360 && (
                <span className="absolute top-3 left-3 bg-teal-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
                  <RotateCw className="w-3 h-3 animate-spin-slow" /> 360° Virtual
                </span>
              )}

              {/* Overlay description text */}
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <h4 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors duration-200 uppercase tracking-wider">{item.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{item.caption}</p>
              </div>

              {/* Hover magnifying glass indicator */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <Eye className="w-5 h-5 font-bold" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX MODAL WITH FULLSCREEN PREVIEW & DETAILED PANORAMIC PANNER */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in text-white p-4"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/15 rounded-full text-slate-400 hover:text-white transition cursor-pointer z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Arrow */}
          <button 
            onClick={handlePrev}
            className="absolute left-6 p-2 bg-white/5 hover:bg-white/15 rounded-full text-slate-400 hover:text-white transition cursor-pointer z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Core Content View */}
          <div 
            className="w-full max-w-4xl max-h-[80vh] flex flex-col items-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* If regular photo */}
            {items[lightboxIndex].type !== 'pano360' ? (
              <img 
                src={items[lightboxIndex].url} 
                alt={items[lightboxIndex].title} 
                className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border border-white/5" 
              />
            ) : (
              /* If 360 panoramic mock viewer! Unique Awwwards interactive experience */
              <div className="w-full max-w-2xl text-center">
                <span className="bg-teal-500 text-slate-950 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1 mb-3 shadow-md">
                  <RotateCw className="w-3.5 h-3.5 animate-spin-slow" /> Interactive 360° Panorama
                </span>
                
                <p className="text-[11px] text-slate-400 mb-2 font-mono">CLICK & DRAG HORIZONTALLY ON IMAGE BELOW TO SPIN PANORAMIC HORIZONS</p>
                
                <div 
                  className="w-full h-[280px] rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl relative select-none cursor-ew-resize"
                  onMouseDown={handlePanoMouseDown}
                  onMouseMove={handlePanoMouseMove}
                  onMouseUp={handlePanoMouseUp}
                  onMouseLeave={handlePanoMouseUp}
                >
                  <div 
                    className="h-full absolute left-1/2 flex transition-transform duration-75"
                    style={{ 
                      transform: `translateX(calc(-50% + ${panoOffset}px))`, 
                      width: '1800px',
                      backgroundImage: `url(${items[lightboxIndex].url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  
                  {/* Subtle directional markers overlay */}
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-45">
                    <ChevronLeft className="w-7 h-7 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-45">
                    <ChevronRight className="w-7 h-7 text-white animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* Lightbox Description HUD */}
            <div className="w-full max-w-xl text-center mt-6 select-none">
              <h4 className="text-base font-black text-emerald-400 uppercase tracking-widest">{items[lightboxIndex].title}</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                {items[lightboxIndex].caption}
              </p>
              <div className="text-[10px] text-slate-500 font-mono mt-4 uppercase">
                PHOTO {lightboxIndex + 1} OF {items.length} • HILLYTRIP VERIFIED REPOSITORY
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button 
            onClick={handleNext}
            className="absolute right-6 p-2 bg-white/5 hover:bg-white/15 rounded-full text-slate-400 hover:text-white transition cursor-pointer z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
