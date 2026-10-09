import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Mountain,
  Move,
  Sparkles,
  Loader2
} from 'lucide-react';
import { DEFAULT_HOMESTAY_IMAGE } from '../constants';
import { resolveVillageImage } from '../utils/imagePool';

const safeSrc = (url?: string, fallback: string = DEFAULT_HOMESTAY_IMAGE) => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) {
    return url;
  }
  return resolveVillageImage(url);
};

export interface InteractiveImageZoomViewerProps {
  url: string;
  altText?: string;
  caption?: string;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  index?: number;
  total?: number;
  containerClassName?: string;
  maxZoom?: number;
  minZoom?: number;
  initialZoom?: number;
  showMinimap?: boolean;
  showControls?: boolean;
  onZoomChange?: (zoom: number) => void;
}

export const InteractiveImageZoomViewer: React.FC<InteractiveImageZoomViewerProps> = ({
  url,
  altText,
  caption,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  index = 0,
  total = 1,
  containerClassName = '',
  maxZoom = 4.5,
  minZoom = 1.0,
  initialZoom = 1.0,
  showMinimap = true,
  showControls = true,
  onZoomChange,
}) => {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [showHelpBadge, setShowHelpBadge] = useState<boolean>(true);
  
  // Mobile swipe tracking when zoom === 1
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);

  // Reset zoom & pan whenever the image URL changes
  useEffect(() => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setSwipeOffset(0);
    setIsSwiping(false);
    setImageLoaded(false);
    if (onZoomChange) onZoomChange(1.0);
  }, [url, onZoomChange]);

  // Auto-dismiss the micro-help badge after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHelpBadge(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Clamping helper for pan coordinates based on current zoom and container dimensions
  const clampPan = useCallback((targetPan: { x: number; y: number }, targetZoom: number) => {
    if (!containerRef.current || targetZoom <= 1.0) {
      return { x: 0, y: 0 };
    }
    const rect = containerRef.current.getBoundingClientRect();
    // Allow panning up to the zoomed extra width/height margin
    const maxX = (rect.width * (targetZoom - 1)) / 2;
    const maxY = (rect.height * (targetZoom - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, targetPan.x)),
      y: Math.max(-maxY, Math.min(maxY, targetPan.y)),
    };
  }, []);

  // Update zoom and notify parent
  const applyZoom = useCallback((newZoom: number, focalPoint?: { x: number; y: number }) => {
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
    setZoom(clampedZoom);
    if (onZoomChange) onZoomChange(clampedZoom);

    if (clampedZoom <= 1.0) {
      setPan({ x: 0, y: 0 });
      return;
    }

    if (focalPoint && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = focalPoint.x - rect.left - centerX;
      const dy = focalPoint.y - rect.top - centerY;
      
      const scaleRatio = clampedZoom / zoom;
      const newPanX = pan.x - dx * (scaleRatio - 1);
      const newPanY = pan.y - dy * (scaleRatio - 1);
      setPan(clampPan({ x: newPanX, y: newPanY }, clampedZoom));
    } else {
      setPan(prev => clampPan(prev, clampedZoom));
    }
  }, [minZoom, maxZoom, onZoomChange, zoom, pan, clampPan]);

  const handleZoomIn = () => {
    applyZoom(Math.min(maxZoom, zoom * 1.35));
  };

  const handleZoomOut = () => {
    applyZoom(Math.max(minZoom, zoom / 1.35));
  };

  const handleResetZoom = () => {
    applyZoom(1.0);
  };

  const handleSetPresetZoom = (preset: number) => {
    applyZoom(preset);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.18 : 0.85;
    applyZoom(zoom * factor, { x: e.clientX, y: e.clientY });
  };

  // Double click to toggle zoom between 1.0 and 2.5x at point
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (zoom > 1.05) {
      applyZoom(1.0);
    } else {
      applyZoom(2.5, { x: e.clientX, y: e.clientY });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Left click only
    if (zoom > 1.0) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart({ ...pan });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || zoom <= 1.0) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const newPan = {
      x: panStart.x + deltaX,
      y: panStart.y + deltaY,
    };
    setPan(clampPan(newPan, zoom));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan, pinch-to-zoom, and swipe
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStartX(touch.clientX);
      setTouchStartY(touch.clientY);

      if (zoom > 1.0) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX, y: touch.clientY });
        setPanStart({ ...pan });
      } else {
        setIsSwiping(true);
      }
    } else if (e.touches.length === 2) {
      // Pinch gesture
      setIsSwiping(false);
      setIsDragging(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      setInitialPinchDist(dist);
      setInitialPinchZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (zoom > 1.0 && isDragging) {
        const deltaX = touch.clientX - dragStart.x;
        const deltaY = touch.clientY - dragStart.y;
        setPan(clampPan({ x: panStart.x + deltaX, y: panStart.y + deltaY }, zoom));
      } else if (zoom === 1.0 && isSwiping) {
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        // Horizontal swipe constraint
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setSwipeOffset(deltaX);
        }
      }
    } else if (e.touches.length === 2 && initialPinchDist) {
      // Pinch scale
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const scale = currentDist / initialPinchDist;
      const targetZoom = Math.max(minZoom, Math.min(maxZoom, initialPinchZoom * scale));
      
      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      applyZoom(targetZoom, { x: midX, y: midY });
    }
  };

  const handleTouchEnd = () => {
    if (zoom === 1.0 && isSwiping) {
      if (swipeOffset < -60 && hasNext && onNext) {
        onNext();
      } else if (swipeOffset > 60 && hasPrev && onPrev) {
        onPrev();
      }
    }
    setIsDragging(false);
    setIsSwiping(false);
    setSwipeOffset(0);
    setInitialPinchDist(null);
  };

  // Fullscreen toggler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Minimap click-to-pan handler
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!minimapRef.current || !containerRef.current || zoom <= 1.0) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const clickXRatio = (e.clientX - rect.left) / rect.width; // 0 to 1
    const clickYRatio = (e.clientY - rect.top) / rect.height; // 0 to 1

    const containerRect = containerRef.current.getBoundingClientRect();
    const maxX = (containerRect.width * (zoom - 1)) / 2;
    const maxY = (containerRect.height * (zoom - 1)) / 2;

    const targetPanX = - (clickXRatio - 0.5) * 2 * maxX;
    const targetPanY = - (clickYRatio - 0.5) * 2 * maxY;

    setPan(clampPan({ x: targetPanX, y: targetPanY }, zoom));
  };

  // Cursor style computation
  const getCursorClass = () => {
    if (zoom > 1.0) {
      return isDragging ? 'cursor-grabbing' : 'cursor-grab';
    }
    return 'cursor-zoom-in';
  };

  // Radar minimap viewport rectangle coordinates calculation
  const minimapViewport = (() => {
    if (zoom <= 1.0) return { widthPct: 100, heightPct: 100, leftPct: 0, topPct: 0 };
    const widthPct = Math.min(100, 100 / zoom);
    const heightPct = Math.min(100, 100 / zoom);

    if (!containerRef.current) return { widthPct, heightPct, leftPct: 50 - widthPct / 2, topPct: 50 - heightPct / 2 };
    const containerRect = containerRef.current.getBoundingClientRect();
    const maxX = (containerRect.width * (zoom - 1)) / 2 || 1;
    const maxY = (containerRect.height * (zoom - 1)) / 2 || 1;

    const panRatioX = pan.x / maxX; // -1 to 1
    const panRatioY = pan.y / maxY; // -1 to 1

    const leftPct = (50 - panRatioX * 50 * (1 - 1 / zoom)) - (widthPct / 2);
    const topPct = (50 - panRatioY * 50 * (1 - 1 / zoom)) - (heightPct / 2);

    return {
      widthPct: Math.max(10, widthPct),
      heightPct: Math.max(10, heightPct),
      leftPct: Math.max(0, Math.min(100 - widthPct, leftPct)),
      topPct: Math.max(0, Math.min(100 - heightPct, topPct)),
    };
  })();

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      ref={containerRef}
      id="interactive-image-zoom-container"
      className={`relative flex-grow bg-slate-950 flex items-center justify-center min-h-[300px] md:min-h-0 md:w-3/5 overflow-hidden select-none touch-none ${getCursorClass()} ${containerClassName}`}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Mountain Grid Pattern for high-tech geospatial inspection feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Loading Spinner */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-xs font-mono tracking-wider">Loading high-res alpine vista...</span>
        </div>
      )}

      {/* Left Navigation Chevron Button */}
      {hasPrev && onPrev && zoom <= 1.05 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full shadow-xl transition backdrop-blur-md border border-white/10 active:scale-95 cursor-pointer flex items-center justify-center"
          title="Previous Photo (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Main Interactive Zoomable & Pannable Image */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none"
        style={{
          transform: zoom === 1.0 ? `translateX(${swipeOffset}px)` : 'none',
          transition: isSwiping ? 'none' : 'transform 200ms ease-out',
        }}
      >
        <img
          ref={imageRef}
          src={safeSrc(url)}
          alt={altText || caption || 'Scenic Himalayan Mountain Vista'}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging || isSwiping ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
          className={`max-w-full max-h-[50vh] md:max-h-[82vh] object-contain p-2 select-none pointer-events-none transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Right Navigation Chevron Button */}
      {hasNext && onNext && zoom <= 1.05 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-slate-900/80 hover:bg-slate-900 text-white p-2.5 rounded-full shadow-xl transition backdrop-blur-md border border-white/10 active:scale-95 cursor-pointer flex items-center justify-center"
          title="Next Photo (Right Arrow)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Floating Mountain Inspection Toolbar */}
      {showControls && (
        <div 
          className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Zoom Out (-) */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= minZoom}
            className="p-2 text-slate-200 hover:text-white hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent rounded-xl transition cursor-pointer flex items-center justify-center"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Percentage / Mountain Badge */}
          <div className="px-2 py-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-lg flex items-center gap-1 min-w-[54px] justify-center shadow-inner">
            {zoomPercent}%
          </div>

          {/* Zoom In (+) */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= maxZoom}
            className="p-2 text-slate-200 hover:text-white hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent rounded-xl transition cursor-pointer flex items-center justify-center"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/15 mx-0.5" />

          {/* Quick Preset Buttons: 1x, 2x, 3.5x */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSetPresetZoom(1.0)}
              className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                zoom === 1.0
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Overview Fit (100%)"
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => handleSetPresetZoom(2.0)}
              className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                Math.abs(zoom - 2.0) < 0.1
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Valley & Ridge Inspection (200%)"
            >
              2x
            </button>
            <button
              type="button"
              onClick={() => handleSetPresetZoom(3.5)}
              className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                Math.abs(zoom - 3.5) < 0.1
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title="Peak & Trail Deep Inspection (350%)"
            >
              3.5x
            </button>
          </div>

          <div className="w-px h-5 bg-white/15 mx-0.5 hidden sm:block" />

          {/* Reset Zoom */}
          {zoom > 1.05 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer flex items-center justify-center"
              title="Reset Zoom & Center (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer flex items-center justify-center"
            title={isFullscreen ? "Exit Fullscreen" : "Inspect in Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Mountain Detail Mode Active Pill Indicator */}
      {zoom > 1.3 && (
        <div 
          className="absolute top-4 right-4 z-30 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase font-mono tracking-wider backdrop-blur-md shadow-lg flex items-center gap-1.5 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mountain Inspection Active</span>
        </div>
      )}

      {/* Interactive Radar Minimap (Shows when zoomed in) */}
      {showMinimap && zoom > 1.25 && (
        <div
          ref={minimapRef}
          onClick={handleMinimapClick}
          className="absolute bottom-4 right-4 z-30 w-28 h-20 bg-slate-950/90 border border-emerald-500/40 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md cursor-crosshair group transition hover:border-emerald-400"
          title="Radar View: Click or drag to inspect specific mountain section"
        >
          {/* Background thumbnail */}
          <img
            src={safeSrc(url)}
            alt="Minimap preview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 pointer-events-none"
          />
          {/* Active Viewport Window Rectangle */}
          <div
            className="absolute border-2 border-emerald-400 bg-emerald-500/25 shadow-xs transition-all duration-75 pointer-events-none rounded-xs"
            style={{
              width: `${minimapViewport.widthPct}%`,
              height: `${minimapViewport.heightPct}%`,
              left: `${minimapViewport.leftPct}%`,
              top: `${minimapViewport.topPct}%`,
            }}
          />
          <div className="absolute top-1 left-1.5 text-[8px] font-mono text-emerald-300 font-bold bg-slate-950/80 px-1 rounded-xs pointer-events-none">
            RADAR
          </div>
        </div>
      )}

      {/* Helpful Quick Instructions Badge */}
      {showHelpBadge && (
        <div 
          onClick={() => setShowHelpBadge(false)}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-25 bg-slate-900/90 text-slate-200 border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-medium backdrop-blur-md shadow-xl flex items-center gap-2 cursor-pointer hover:bg-slate-900 transition animate-fade-in whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Scroll wheel or double-click to inspect mountain details</span>
          <span className="text-[9px] text-slate-400 ml-1 underline">Dismiss</span>
        </div>
      )}

      {/* Bottom Counter Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-950/85 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] text-slate-300 font-mono tracking-wider font-extrabold shadow-sm uppercase border border-white/10 whitespace-nowrap flex items-center gap-1.5">
        <span>{index + 1}</span>
        <span className="text-slate-500">/</span>
        <span>{total}</span>
        {zoom > 1.0 && (
          <>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-sans flex items-center gap-1">
              <Move className="w-2.5 h-2.5" /> Drag to pan
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default InteractiveImageZoomViewer;
