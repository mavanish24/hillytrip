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
  let sizeClass = 'h-20';
  let customStyle: React.CSSProperties = {};

  if (typeof size === 'number') {
    customStyle = { height: `${size}px` };
    sizeClass = '';
  } else if (typeof size === 'string') {
    if (size === 'sm') sizeClass = 'h-16 sm:h-20';
    else if (size === 'md') sizeClass = 'h-[100px] md:h-[130px]';
    else if (size === 'lg') sizeClass = 'h-[150px] sm:h-[190px]';
    else if (size === 'xl') sizeClass = 'h-[220px] sm:h-[280px]';
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

  const [imageHasError, setImageHasError] = useState(false);
  const { settings } = useBranding();

  const primaryDesktop = settings?.desktop_logo_url || '/hillytrip_logo.jpg?v=2';
  let logoUrl = primaryDesktop;

  if (variant === 'full' && theme === 'dark' && settings?.footer_logo_url) {
    logoUrl = settings.footer_logo_url;
  } else if (resolvedTheme === 'dark' && settings?.white_logo_url) {
    logoUrl = settings.white_logo_url;
  } else if (resolvedTheme === 'light' && settings?.dark_logo_url) {
    logoUrl = settings.dark_logo_url;
  }

  useEffect(() => {
    setImageHasError(false);
  }, [logoUrl]);

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
        {/* Fallback Vector Gradients */}
        <linearGradient id={`${idPrefix}-trip-grad`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-sky-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="45%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id={`${idPrefix}-pin-stroke-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        <clipPath id={`${idPrefix}-pin-clip`}>
          <path d="M 220 40 C 130 40, 60 110, 60 200 C 60 270, 130 350, 220 420 C 310 350, 380 270, 380 200 C 380 110, 310 40, 220 40 Z" />
        </clipPath>
      </defs>

      <style>{`
        .circle-emblem-group {
          opacity: ${shouldAnimate ? '0' : '1'};
          transform-origin: 220px 220px;
          animation: ${shouldAnimate ? 'logo-circle-entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards' : 'none'};
        }
        .hilly-text-group {
          opacity: ${shouldAnimate ? '0' : '1'};
          transform: ${shouldAnimate ? 'translateY(12px)' : 'translateY(0)'};
          animation: ${shouldAnimate ? 'logo-fade-up-text 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards' : 'none'};
        }
        .trip-text-group {
          opacity: ${shouldAnimate ? '0' : '1'};
          transform: ${shouldAnimate ? 'translateY(12px)' : 'translateY(0)'};
          animation: ${shouldAnimate ? 'logo-fade-up-text 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards' : 'none'};
        }

        @keyframes logo-circle-entrance {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes logo-fade-up-text {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .circle-emblem-group, .hilly-text-group, .trip-text-group {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* If custom raster image is available and loaded without error, render it cleanly */}
      {!imageHasError && logoUrl ? (
        <image
          href={logoUrl}
          xlinkHref={logoUrl}
          x={variant === 'icon' ? '50' : '20'}
          y={variant === 'icon' ? '30' : '50'}
          width={variant === 'icon' ? '340' : '980'}
          height={variant === 'icon' ? '400' : '380'}
          onError={() => setImageHasError(true)}
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <>
          {/* Vector Emblem */}
          {variant !== 'wordmark' && (
            <g className="circle-emblem-group">
              <path
                d="M 220 40 C 130 40, 60 110, 60 200 C 60 270, 130 350, 220 420 C 310 350, 380 270, 380 200 C 380 110, 310 40, 220 40 Z"
                stroke={`url(#${idPrefix}-pin-stroke-grad)`}
                strokeWidth="7"
                fill="#0F382A"
              />
              <circle cx="355" cy="115" r="18" fill="#F59E0B" />
              <g clipPath={`url(#${idPrefix}-pin-clip)`}>
                <rect x="50" y="30" width="340" height="400" fill={`url(#${idPrefix}-sky-grad)`} />
                <circle cx="280" cy="130" r="22" fill="#F59E0B" opacity="0.9" />
                <polygon points="60,340 160,220 230,290 320,170 380,340" fill="#1E293B" opacity="0.9" />
                <polygon points="60,360 180,250 250,310 380,360" fill="#0F172A" />
                <path
                  d="M 220 410 C 220 370, 190 340, 190 300 C 190 260, 220 240, 220 190"
                  stroke="#FFFFFF"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 180 280 L 230 280"
                  stroke="#FFFFFF"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </g>
            </g>
          )}

          {/* Vector Typography */}
          {variant !== 'icon' && (
            <>
              <g className="hilly-text-group">
                <text
                  x="420"
                  y="235"
                  fill={resolvedTheme === 'dark' ? '#FFFFFF' : '#0F172A'}
                  style={{
                    fontFamily: '"Lora", "Georgia", serif',
                    fontSize: '142px',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Hilly
                </text>
              </g>
              <g className="trip-text-group">
                <text
                  x="705"
                  y="235"
                  fill={`url(#${idPrefix}-trip-grad)`}
                  style={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    fontSize: '142px',
                    fontWeight: 800,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Trip
                </text>
                <path
                  d="M 680 150 L 730 100 L 755 120 L 820 50 L 880 120 L 905 100 L 940 150"
                  stroke={`url(#${idPrefix}-trip-grad)`}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
              <line x1="420" y1="295" x2="590" y2="295" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              <circle cx="610" cy="295" r="5" fill="#F59E0B" />
              <line x1="630" y1="295" x2="940" y2="295" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
              <text
                x="680"
                y="342"
                fill={resolvedTheme === 'dark' ? '#E2E8F0' : '#334155'}
                textAnchor="middle"
                style={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '0.35em',
                }}
              >
                EXPLORE BEYOND MAPS
              </text>
            </>
          )}
        </>
      )}
    </svg>
  );
}
