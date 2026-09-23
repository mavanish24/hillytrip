import React, { useState, useEffect } from 'react';
import {
  getOptimizedImageUrl,
  getUnsplashSrcSet,
  getDeterministicDefaultImage,
  ImageCategory
} from '../utils/imagePool';

export interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  alt?: string;
  isPriority?: boolean; // Above the fold LCP image priority
  category?: ImageCategory;
  itemName?: string;
  targetWidth?: number; // e.g., 400 for thumbnails, 600-800 for desktop cards, 1200 for hero
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  fallbackSrc,
  className = '',
  containerClassName = '',
  alt = '',
  isPriority = false,
  category,
  itemName = '',
  targetWidth = 400,
  loading: passedLoading,
  srcSet: passedSrcSet,
  sizes: passedSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  decoding = 'async',
  ...props
}) => {
  const effectiveCategory = category;
  const seed = itemName || alt || 'hillytrip';

  // Real Image Priority:
  // 1. Provided src (optimized for targetWidth)
  // 2. Custom fallbackSrc if provided
  // 3. Category default image resolved deterministically
  const initialSrc = src
    ? getOptimizedImageUrl(src, targetWidth)
    : fallbackSrc
    ? getOptimizedImageUrl(fallbackSrc, targetWidth)
    : getDeterministicDefaultImage(seed, effectiveCategory, targetWidth);

  const [currentSrc, setCurrentSrc] = useState<string>(initialSrc);
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(isPriority); // Priority images skip blur shimmer to boost LCP

  useEffect(() => {
    setHasError(false);
    setLoaded(isPriority);
    const newSrc = src
      ? getOptimizedImageUrl(src, targetWidth)
      : fallbackSrc
      ? getOptimizedImageUrl(fallbackSrc, targetWidth)
      : getDeterministicDefaultImage(seed, effectiveCategory, targetWidth);
    setCurrentSrc(newSrc);
  }, [src, fallbackSrc, isPriority, seed, effectiveCategory, targetWidth]);

  // Loading strategy
  const loadingStrategy = passedLoading || (isPriority ? 'eager' : 'lazy');
  const fetchPriorityVal = isPriority ? 'high' : undefined;

  // Generate responsive srcset for Unsplash images if not explicitly passed
  const responsiveSrcSet = passedSrcSet || getUnsplashSrcSet(currentSrc);

  const handleError = () => {
    if (hasError) return; // Prevent infinite fallback loops
    setHasError(true);

    const defaultFallback = getDeterministicDefaultImage(seed, effectiveCategory, targetWidth);
    if (currentSrc !== defaultFallback) {
      setCurrentSrc(defaultFallback);
    } else {
      // Ultimate safe fallback SVG data URI if even the default fails to load
      setCurrentSrc(
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><path d="M150 180l40-50 50 60 30-30 50 60H100z" fill="%23334155"/><circle cx="140" cy="110" r="18" fill="%230284c7"/></svg>'
      );
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${containerClassName || ''}`}
      style={{ minHeight: '100%', width: '100%' }}
    >
      {!loaded && !isPriority && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center z-10 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 bg-[length:200%_100%] animate-shimmer opacity-80" />
        </div>
      )}
      <img
        {...props}
        src={currentSrc}
        srcSet={responsiveSrcSet || undefined}
        sizes={responsiveSrcSet ? passedSizes : undefined}
        alt={alt}
        loading={loadingStrategy}
        decoding={decoding}
        {...({ fetchPriority: fetchPriorityVal } as any)}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded || isPriority ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};

export default ProgressiveImage;

