import React, { useState, useEffect } from 'react';
import { useBranding } from './BrandingContext';

export interface AnimatedLogoProps {
  /**
   * Whether to run the intro animation. If false, renders statically.
   * Defaults to true (runs once per session).
   */
  animated?: boolean;
  /**
   * Sizing of the logo. Can be 'sm', 'md', 'lg', 'xl', or a custom string/number.
   * If a number is passed, it is set as the height in pixels.
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | string | number;
  /**
   * The design variant of the logo.
   * - 'full': Circular mountain emblem + "Hilly" + "Trip" with peaks outline.
   * - 'icon': Only the circular mountain/river valley emblem.
   * - 'wordmark': Text "Hilly" + "Trip" with drawing mountain peaks outline above "Trip".
   */
  variant?: 'full' | 'icon' | 'wordmark';
  /**
   * Color theme override.
   * - 'light': Forces dark text for "Hilly" wordmark.
   * - 'dark': Forces white text for "Hilly" wordmark.
   * - 'auto': Uses system/tailwind context class `fill-slate-900 dark:fill-white`.
   */
  theme?: 'light' | 'dark' | 'auto';
  /**
   * Additional className to apply to the wrapping element.
   */
  className?: string;
}

// Module-level variable to guarantee it only animates once per SPA session across components
let hasAnimatedGlobal = false;

export function AnimatedLogo({
  animated = true,
  size = 'md',
  variant = 'full',
  theme = 'auto',
  className = '',
}: AnimatedLogoProps) {
  const [shouldAnimate, setShouldAnimate] = useState(() => {
    if (!animated) return false;
    if (hasAnimatedGlobal) return false;
    
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('hillytrip_logo_animated_once');
        if (stored === 'true') {
          return false;
        }
      } catch (e) {
        // Fallback for cookie/storage restricted sandbox
      }
    }
    return true;
  });

  useEffect(() => {
    if (shouldAnimate) {
      hasAnimatedGlobal = true;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('hillytrip_logo_animated_once', 'true');
        } catch (e) {
          // Ignore storage errors in restricted contexts
        }
      }
    }
  }, [shouldAnimate]);

  // Generate size styles or tailwind height classes
  let sizeClass = 'h-10';
  let customStyle: React.CSSProperties = {};

  if (typeof size === 'number') {
    customStyle = { height: `${size}px` };
    sizeClass = '';
  } else if (typeof size === 'string') {
    if (size === 'sm') sizeClass = 'h-10';
    else if (size === 'md') sizeClass = 'h-[38px] md:h-[46px]';
    else if (size === 'lg') sizeClass = 'h-[68px] sm:h-[78px]';
    else if (size === 'xl') sizeClass = 'h-[96px] sm:h-[116px]';
    else if (size.startsWith('h-') || size.startsWith('w-')) {
      sizeClass = size;
    } else {
      customStyle = { height: size };
      sizeClass = '';
    }
  }

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme !== 'auto') return theme;
    return 'light'; // default fallback
  });

  useEffect(() => {
    if (theme !== 'auto') {
      setResolvedTheme(theme);
      return;
    }

    const detectTheme = () => {
      const rootEl = document.getElementById('hillytrip-root');
      if (rootEl && rootEl.classList.contains('dark')) {
        setResolvedTheme('dark');
        return;
      }
      if (document.documentElement.classList.contains('dark') || document.body.classList.contains('dark')) {
        setResolvedTheme('dark');
        return;
      }
      setResolvedTheme('light');
    };

    detectTheme();

    // Set up a MutationObserver to watch for class changes on #hillytrip-root or documentElement
    const rootEl = document.getElementById('hillytrip-root') || document.documentElement;
    const observer = new MutationObserver(detectTheme);
    observer.observe(rootEl, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [theme]);

  const { settings } = useBranding();
  let logoUrl = settings?.desktop_logo_url || '/hillytrip_logo.jpg?v=2';
  if (resolvedTheme === 'dark') {
    logoUrl = settings?.white_logo_url || logoUrl;
  } else if (resolvedTheme === 'light') {
    logoUrl = settings?.dark_logo_url || logoUrl;
  }

  // Determine standard colors based on resolvedTheme
  const textFillColorClass = resolvedTheme === 'dark' ? 'fill-white' : 'fill-slate-900';

  // Set the dynamic ViewBox depending on the variant selected
  // Full view: 25 65 985 380 (Cropped vertical padding to let content fill space efficiently)
  // Icon only: 29 71 370 370 (Centered around the left circular emblem)
  // Wordmark only: 360 80 580 320 (Centered around the text and mountain peaks on the right)
  let viewBox = '25 65 985 380';
  if (variant === 'icon') {
    viewBox = '29 71 370 370';
  } else if (variant === 'wordmark') {
    viewBox = '360 80 580 320';
  }

  // Unique clip and gradient IDs so multiple instances don't collide
  const idPrefix = `logo-${variant}-${theme}`;

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-auto select-none group/logo inline-block ${sizeClass} ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...customStyle }}
    >
      <defs>
        {/* Clip path for the circular mountain emblem */}
        <clipPath id={`${idPrefix}-circle-emblem-clip`}>
          <circle cx="214" cy="256" r="185" />
          <rect x="214" y="256" width="246" height="230" />
        </clipPath>

        {/* Clip path for center-peak left facet sunrise highlight */}
        <clipPath id={`${idPrefix}-center-peak-left-clip`}>
          <polygon points="700,195 765,120 765,225" />
        </clipPath>

        {/* Gradients for text and mountains */}
        <linearGradient id={`${idPrefix}-trip-text-gradient`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10B981" /> {/* Emerald 500 */}
          <stop offset="50%" stopColor="#059669" /> {/* Emerald 600 */}
          <stop offset="100%" stopColor="#0284C7" /> {/* Sky 600 */}
        </linearGradient>

        <linearGradient id={`${idPrefix}-mountain-ridge-gradient`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-peak-left-gradient`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-peak-right-gradient`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1E3A8A" /> {/* Deep Blue */}
          <stop offset="100%" stopColor="#0ea5e9" /> {/* Sky Blue */}
        </linearGradient>

        {/* Sunrise highlight gradient sweep */}
        <linearGradient id={`${idPrefix}-sunrise-sweep-gradient`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.85" /> {/* Gold sunrise */}
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Shimmer effect gradient on hover */}
        <linearGradient id={`${idPrefix}-shimmer-gradient`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="35%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#A7F3D0" /> {/* Bright Emerald highlight */}
          <stop offset="65%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {/* CSS Styles block supporting high-performance 60 FPS hardware accelerated animation */}
      <style>{`
        /* 1. Circular Mountain Emblem Scale & Fade-In */
        .circle-emblem-group {
          opacity: ${shouldAnimate ? '0' : '1'};
          transform-origin: 214px 256px;
          animation: ${shouldAnimate ? 'logo-circle-entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards' : 'none'};
          will-change: transform, opacity;
        }

        /* 2. Mountain Ridge Outline Stroke Draw */
        .mountain-outline-path {
          stroke-dasharray: 450;
          stroke-dashoffset: ${shouldAnimate ? '450' : '0'};
          animation: ${shouldAnimate ? 'logo-draw-ridge 1.4s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards' : 'none'};
          transition: stroke 0.3s ease;
          will-change: stroke-dashoffset;
        }

        /* 3. Mountain Shaded Facets Fade-In */
        .mountain-facet-left {
          opacity: ${shouldAnimate ? '0' : '1'};
          animation: ${shouldAnimate ? 'logo-fade-in-facets 0.8s ease-out 1.2s forwards' : 'none'};
        }
        .mountain-facet-right {
          opacity: ${shouldAnimate ? '0' : '1'};
          animation: ${shouldAnimate ? 'logo-fade-in-facets 0.8s ease-out 1.3s forwards' : 'none'};
        }

        /* 4. Sunrise Highlight Sweep (only on highest central peak left facet) */
        .sunrise-highlight {
          opacity: 0;
          animation: ${shouldAnimate ? 'logo-sunrise-highlight-sweep 1.1s ease-in-out 1.4s forwards' : 'none'};
          will-change: transform, opacity;
        }

        /* 5. Typography Fade-Up & Reveals */
        .hilly-text-group {
          opacity: ${shouldAnimate ? '0' : '1'};
          transform: ${shouldAnimate ? 'translateY(14px)' : 'translateY(0)'};
          animation: ${shouldAnimate ? 'logo-fade-up-text 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards' : 'none'};
          will-change: transform, opacity;
        }

        .trip-text-group {
          opacity: ${shouldAnimate ? '0' : '1'};
          transform: ${shouldAnimate ? 'translateY(14px)' : 'translateY(0)'};
          animation: ${shouldAnimate ? 'logo-fade-up-text 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.68s forwards' : 'none'};
          will-change: transform, opacity;
        }

        /* Hover Interaction Shimmer Sweep on Mountain Outline */
        .group\\/logo:hover .mountain-outline-path {
          animation: logo-hover-shimmer-sweep 1.2s cubic-bezier(0.4, 0, 0.2, 1) 1 !important;
          stroke: url(#${idPrefix}-shimmer-gradient);
        }

        /* Keyframes Definitions */
        @keyframes logo-circle-entrance {
          0% {
            opacity: 0;
            transform: scale(0.96);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes logo-draw-ridge {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes logo-fade-in-facets {
          to {
            opacity: 1;
          }
        }

        @keyframes logo-sunrise-highlight-sweep {
          0% {
            opacity: 0;
            transform: translateX(-35px) translateY(-5px) scale(0.97);
          }
          30% {
            opacity: 0.85;
          }
          70% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translateX(45px) translateY(5px) scale(1.02);
          }
        }

        @keyframes logo-fade-up-text {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logo-hover-shimmer-sweep {
          0% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 40;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* Accessibility: Respect user prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .circle-emblem-group,
          .mountain-outline-path,
          .mountain-facet-left,
          .mountain-facet-right,
          .hilly-text-group,
          .trip-text-group {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
          .sunrise-highlight {
            display: none !important;
          }
        }
      `}</style>

      {/* A. Circular Mountain Emblem (Left Part) - Hidden if variant is wordmark */}
      {variant !== 'wordmark' && (
        <g className="circle-emblem-group">
          {/* Render clipped region of original premium emblem background */}
          <image
            href={logoUrl}
            xlinkHref={logoUrl}
            x="-16"
            y="26"
            width="460"
            height="460"
            clipPath={`url(#${idPrefix}-circle-emblem-clip)`}
          />
        </g>
      )}

      {/* B. Mountain peaks & typography (Right Part) - Hidden if variant is icon */}
      {variant !== 'icon' && (
        <>
          {/* Mountain Peaks above "Trip" text */}
          <g className="mountain-peaks-group">
            {/* Peak 1 (Left): Soft Blue facets */}
            <polygon
              points="620,225 675,175 675,225"
              fill={`url(#${idPrefix}-peak-right-gradient)`}
              fillOpacity="0.85"
              className="mountain-facet-left"
            />
            <polygon
              points="675,175 700,195 675,225"
              fill={`url(#${idPrefix}-peak-right-gradient)`}
              fillOpacity="0.95"
              className="mountain-facet-right"
            />

            {/* Peak 2 (Center / Highest Majestic peak): Glowing Green facets */}
            <polygon
              points="700,195 765,120 765,225"
              fill={`url(#${idPrefix}-peak-left-gradient)`}
              fillOpacity="0.9"
              className="mountain-facet-left"
            />
            <polygon
              points="765,120 830,198 765,225"
              fill={`url(#${idPrefix}-peak-left-gradient)`}
              fillOpacity="0.75"
              className="mountain-facet-right"
            />

            {/* Sunrise highlight overlay - sweeps across the center left facet */}
            <g clipPath={`url(#${idPrefix}-center-peak-left-clip)`}>
              <polygon
                points="700,195 765,120 765,225"
                fill={`url(#${idPrefix}-sunrise-sweep-gradient)`}
                className="sunrise-highlight"
                style={{ transformOrigin: '732px 157px' }}
              />
            </g>

            {/* Peak 3 (Right): Dark Blue-Green facets */}
            <polygon
              points="830,198 855,180 855,225"
              fill={`url(#${idPrefix}-peak-right-gradient)`}
              fillOpacity="0.95"
              className="mountain-facet-left"
            />
            <polygon
              points="855,180 890,225 855,225"
              fill={`url(#${idPrefix}-peak-right-gradient)`}
              fillOpacity="0.85"
              className="mountain-facet-right"
            />

            {/* The vector mountain outline path */}
            <path
              d="M 620,225 L 675,175 L 700,195 L 765,120 L 830,198 L 855,180 L 890,225"
              stroke={`url(#${idPrefix}-mountain-ridge-gradient)`}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="mountain-outline-path"
            />
          </g>

          {/* "Hilly" Text Group in elegant premium serif (Lora style) */}
          <g className="hilly-text-group">
            <text
              x="395"
              y="336"
              className={`${textFillColorClass} font-serif transition-colors duration-300`}
              style={{
                fontFamily: '"Lora", "Georgia", "Merriweather", serif',
                fontSize: '154px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              Hilly
            </text>
          </g>

          {/* "Trip" Text Group in modern sans-serif (Plus Jakarta Sans/Satoshi style) */}
          <g className="trip-text-group">
            <text
              x="704"
              y="336"
              fill={`url(#${idPrefix}-trip-text-gradient)`}
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", "Satoshi", sans-serif',
                fontSize: '154px',
                fontWeight: 800,
                letterSpacing: '-0.04em',
              }}
            >
              Trip
            </text>
          </g>
        </>
      )}
    </svg>
  );
}
