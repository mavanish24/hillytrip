import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, ZoomIn, ZoomOut, RotateCcw, Trash2, Check, Loader2 } from 'lucide-react';
import { compressAndConvertToWebP } from '../utils/imageOptimizer';

interface FeaturedPhotoUploaderProps {
  onUploadComplete: (url: string) => void;
  onClear: () => void;
  currentImageUrl?: string;
  email?: string;
}

export const FeaturedPhotoUploader: React.FC<FeaturedPhotoUploaderProps> = ({
  onUploadComplete,
  onClear,
  currentImageUrl,
  email = 'anonymous'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  
  // Crop / Zoom state
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [imgName, setImgName] = useState('photo.webp');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperBoxRef = useRef<HTMLDivElement>(null);

  // Default beautiful stock Himalayan cover
  const DEFAULT_COVER = 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Unsupported file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    setImgName(file.name.substring(0, file.name.lastIndexOf('.')) + '.webp');

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });
  };

  // Dragging inside the crop box
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
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

  // Aspect ratio calculations (16:9 for Featured Cover)
  const cropperWidth = 320;
  const cropperHeight = 180; // 16:9 aspect ratio

  const isLandscape = imgDimensions.width / imgDimensions.height > cropperWidth / cropperHeight;
  const displayWidth = isLandscape ? cropperHeight * (imgDimensions.width / imgDimensions.height) : cropperWidth;
  const displayHeight = isLandscape ? cropperHeight : cropperWidth * (imgDimensions.height / imgDimensions.width);

  // Perform client-side cropping via Canvas and upload
  const handleCropAndUpload = async () => {
    if (!rawImageSrc) return;
    setIsUploading(true);

    try {
      // 1. Render the cropped image onto canvas at 16:9 ratio (800x450 resolution)
      const croppedBase64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const outputWidth = 800;
          const outputHeight = 450;
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to create canvas context'));
            return;
          }

          // Fill background white
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, outputWidth, outputHeight);

          // Calculate scale factor from UI cropper box (320px) to output resolution (800px)
          const scaleFactor = outputWidth / cropperWidth;

          ctx.save();
          // Translate to center of canvas
          ctx.translate(outputWidth / 2, outputHeight / 2);
          ctx.scale(scaleFactor, scaleFactor);
          
          // Apply user panning and zooming
          ctx.translate(position.x, position.y);
          ctx.scale(zoom, zoom);

          const isLand = img.width / img.height > cropperWidth / cropperHeight;
          const dW = isLand ? cropperHeight * (img.width / img.height) : cropperWidth;
          const dH = isLand ? cropperHeight : cropperWidth * (img.height / img.width);

          ctx.drawImage(img, -dW / 2, -dH / 2, dW, dH);
          ctx.restore();

          resolve(canvas.toDataURL('image/jpeg', 0.90));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = rawImageSrc;
      });

      // 2. Convert cropped image base64 to File object to optimize
      const responseBlob = await fetch(croppedBase64);
      const blob = await responseBlob.blob();
      const fileToOptimize = new File([blob], imgName, { type: 'image/jpeg' });

      // 3. Compress and convert to WebP
      const compressedBlob = await compressAndConvertToWebP(fileToOptimize, 1200, 675, 0.80);

      // 4. Convert compressed blob back to base64 for API upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        const finalBase64 = reader.result as string;
        
        // 5. POST to server upload proxy endpoint
        const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
        const uniqueFileName = `${cleanEmail}_moment_${Date.now()}.webp`;

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: finalBase64,
            filename: uniqueFileName,
            bucketName: 'travel-moments'
          })
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || 'Failed to upload image to storage.');
        }

        const data = await uploadRes.json();
        onUploadComplete(data.publicUrl);
        setIsEditing(false);
        setRawImageSrc(null);
        setIsUploading(false);
      };
      reader.readAsDataURL(compressedBlob);

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred while uploading.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3" id="featured-photo-uploader-container">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-black text-slate-400">Featured Photo *</label>
        {currentImageUrl && currentImageUrl !== DEFAULT_COVER && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove Photo (Use Default)</span>
          </button>
        )}
      </div>

      {/* Main Upload / State View Area */}
      {!isEditing ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[160px] ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md'
              : currentImageUrl && currentImageUrl !== DEFAULT_COVER
              ? 'border-emerald-300 dark:border-emerald-900 bg-slate-50 dark:bg-slate-950/50'
              : 'border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:border-emerald-400 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-950/50'
          }`}
        >
          {/* File inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {currentImageUrl && currentImageUrl !== DEFAULT_COVER ? (
            <div className="w-full h-full relative group">
              <img
                src={currentImageUrl}
                alt="Featured cover preview"
                className="w-full h-32 object-cover rounded-xl shadow-xs"
              />
              <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-black gap-2">
                <Upload className="w-4 h-4 animate-bounce" />
                <span>Change Featured Image</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-3xs">
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  Drag & Drop image here, or <span className="text-emerald-600 dark:text-emerald-400 hover:underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">Supports JPG, PNG, WEBP (auto-optimized)</p>
              </div>

              {/* Mobile Camera Option */}
              <div className="pt-2 flex justify-center md:hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full text-[10px] font-black border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer hover:bg-slate-150 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Live Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Native Image Crop & Zoom Experience */
        <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Crop & Center Image (16:9 aspect)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setRawImageSrc(null);
              }}
              className="text-[10px] text-slate-400 font-bold hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          {/* Interactive Crop Stage */}
          <div className="flex justify-center">
            <div
              ref={cropperBoxRef}
              className="relative overflow-hidden bg-slate-900 border border-slate-300 dark:border-slate-750 rounded-xl cursor-move select-none"
              style={{ width: `${cropperWidth}px`, height: `${cropperHeight}px` }}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              {rawImageSrc && (
                <img
                  ref={imageRef}
                  src={rawImageSrc}
                  alt="Source crop preview"
                  onLoad={handleImageLoad}
                  className="absolute pointer-events-none origin-center max-w-none"
                  style={{
                    width: `${displayWidth}px`,
                    height: `${displayHeight}px`,
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  }}
                />
              )}
              {/* Outer Shadow Mask */}
              <div className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none" />
            </div>
          </div>

          {/* Zoom controls & Sliders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>ZOOM SLIDER</span>
              <span>{(zoom * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(1, prev - 0.1))}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-600 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                title="Reset crop adjustments"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Upload and Confirm buttons */}
          <button
            type="button"
            disabled={isUploading}
            onClick={handleCropAndUpload}
            className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition shadow-xs disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing & Uploading to Supabase...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Crop, Compress & Post Cover</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
