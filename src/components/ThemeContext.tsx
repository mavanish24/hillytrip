import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeModeStyle {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  shadow: string;
  borderStyle: string;
}

export interface Theme {
  id: string;
  name: string;
  mood: string;
  headingFont: string;
  bodyFont: string;
  buttonStyle: string;
  cardStyle: string;
  animationStyle: string;
  borderRadius: string;
  navStyle: string;
  emoji: string;
  light: ThemeModeStyle;
  dark: ThemeModeStyle;
  // Dynamic resolved properties (added at runtime for compatibility)
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  shadow?: string;
  borderStyle?: string;
}

// Exactly 10 Premium Themes with Dual-Mode Support
export const PRESETS: Theme[] = [
  {
    id: 'signature',
    name: 'HillyTrip Signature',
    mood: 'Premium Himalayan Luxury',
    headingFont: 'General Sans', // Fallback to Manrope
    bodyFont: 'Inter',
    buttonStyle: 'Premium Gradient Pill with Soft Glow',
    cardStyle: 'Glassmorphism with Elevated Borders',
    animationStyle: 'Premium Motion, Smooth Mountain Flow',
    borderRadius: '24px',
    navStyle: 'Glassy floating',
    emoji: '🏔️',
    light: {
      primaryColor: '#10b981', // emerald
      secondaryColor: '#f8fafc',
      accentColor: '#14b8a6', // teal
      backgroundColor: '#f1f5f9', // light gray-blue
      textColor: '#0f172a', // dark slate
      shadow: '0 10px 30px rgba(16,185,129,0.08)',
      borderStyle: '1px solid rgba(16,185,129,0.12)'
    },
    dark: {
      primaryColor: '#10b981', // emerald
      secondaryColor: '#0f172a', // dark slate
      accentColor: '#14b8a6', // teal
      backgroundColor: '#020617', // premium deep navy/black
      textColor: '#f8fafc',
      shadow: '0 20px 40px -15px rgba(16,185,129,0.25)',
      borderStyle: '1px solid rgba(16,185,129,0.15)'
    }
  },
  {
    id: 'alpine-light',
    name: 'Alpine Pure',
    mood: 'Minimal Luxury Fresh',
    headingFont: 'Manrope',
    bodyFont: 'Inter',
    buttonStyle: 'Rounded Slate Minimalist',
    cardStyle: 'Minimal Pure White with Fine Borders',
    animationStyle: 'Elegant Soft Fade',
    borderRadius: '16px',
    navStyle: 'Flat white border-b',
    emoji: '❄️',
    light: {
      primaryColor: '#0ea5e9', // sky blue
      secondaryColor: '#f1f5f9',
      accentColor: '#f43f5e',
      backgroundColor: '#f8fafc', // ice slate 50
      textColor: '#0f172a',
      shadow: '0 8px 30px rgba(0,0,0,0.03)',
      borderStyle: '1px solid #e2e8f0'
    },
    dark: {
      primaryColor: '#38bdf8', // light sky blue
      secondaryColor: '#0f172a',
      accentColor: '#fb7185',
      backgroundColor: '#090d16', // mountain slate
      textColor: '#f1f5f9',
      shadow: '0 10px 35px rgba(56,189,248,0.1)',
      borderStyle: '1px solid rgba(56,189,248,0.15)'
    }
  },
  {
    id: 'himalayan-night',
    name: 'Himalayan Night',
    mood: 'Dark Premium Mystic',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'DM Sans',
    buttonStyle: 'Glowing Neon Border',
    cardStyle: 'Deep Space Glassmorphism',
    animationStyle: 'Bioluminescent Glow Fade',
    borderRadius: '20px',
    navStyle: 'Semi-transparent dark',
    emoji: '🌌',
    light: {
      primaryColor: '#8b5cf6', // Indigo-purple
      secondaryColor: '#faf5ff',
      accentColor: '#06b6d4', // Cyan
      backgroundColor: '#fdfaff',
      textColor: '#1e1b4b',
      shadow: '0 8px 30px rgba(168,85,247,0.08)',
      borderStyle: '1px solid rgba(168,85,247,0.1)'
    },
    dark: {
      primaryColor: '#a855f7', // Purple
      secondaryColor: '#090514',
      accentColor: '#06b6d4', // Cyan
      backgroundColor: '#03000a', // extremely dark purple-black
      textColor: '#f3f4f6',
      shadow: '0 0 30px rgba(168,85,247,0.15)',
      borderStyle: '1px solid rgba(168,85,247,0.2)'
    }
  },
  {
    id: 'forest-escape',
    name: 'Forest Escape',
    mood: 'Nature, Organic Woodland',
    headingFont: 'Nunito Sans',
    bodyFont: 'Source Sans 3',
    buttonStyle: 'Organic Soft Forest Filled',
    cardStyle: 'Earthy Textures & Organic Corners',
    animationStyle: 'Soft Leaf Slide',
    borderRadius: '28px',
    navStyle: 'Organic rounded bar',
    emoji: '🌲',
    light: {
      primaryColor: '#16a34a', // Forest green
      secondaryColor: '#f0fdf4',
      accentColor: '#84cc16', // Lime
      backgroundColor: '#f7fee7', // lime-tinted light
      textColor: '#14532d',
      shadow: '0 10px 25px rgba(22,163,74,0.06)',
      borderStyle: '1px solid rgba(22,163,74,0.1)'
    },
    dark: {
      primaryColor: '#16a34a', // Forest green
      secondaryColor: '#022c22',
      accentColor: '#84cc16', // Lime
      backgroundColor: '#011c12', // deep forest green shadow
      textColor: '#f0fdf4',
      shadow: '0 15px 35px rgba(22,163,74,0.12)',
      borderStyle: '1px solid rgba(22,163,74,0.15)'
    }
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    mood: 'Modern Shimmering Luxury',
    headingFont: 'Outfit',
    bodyFont: 'Urbanist',
    buttonStyle: 'Morphing Aurora Gradient Pill',
    cardStyle: 'Floating Multi-Layer Glass Plates',
    animationStyle: 'Dynamic Gradient Shimmer',
    borderRadius: '18px',
    navStyle: 'Iridescent blur',
    emoji: '✨',
    light: {
      primaryColor: '#2563eb', // Royal blue
      secondaryColor: '#eff6ff',
      accentColor: '#10b981', // Mint/teal
      backgroundColor: '#f8fafc',
      textColor: '#1e3a8a',
      shadow: '0 10px 30px rgba(37,99,235,0.08)',
      borderStyle: '1px solid rgba(37,99,235,0.1)'
    },
    dark: {
      primaryColor: '#2563eb', // Royal blue
      secondaryColor: '#030712',
      accentColor: '#10b981', // Mint/teal
      backgroundColor: '#010413', // Midnight sky
      textColor: '#f8fafc',
      shadow: '0 25px 50px -12px rgba(37,99,235,0.2)',
      borderStyle: '1px solid rgba(16,185,129,0.15)'
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    mood: 'Calm, Fresh & Marine',
    headingFont: 'Lexend',
    bodyFont: 'Manrope',
    buttonStyle: 'Floating Ocean Pill',
    cardStyle: 'Deep Marine Blue Gradients',
    animationStyle: 'Gentle Wave Motion Ripple',
    borderRadius: '24px',
    navStyle: 'Liquid wave header',
    emoji: '🌊',
    light: {
      primaryColor: '#06b6d4', // Cyan
      secondaryColor: '#ecfeff',
      accentColor: '#3b82f6', // Ocean Blue
      backgroundColor: '#f0f9ff',
      textColor: '#083344',
      shadow: '0 10px 30px rgba(6,182,212,0.08)',
      borderStyle: '1px solid rgba(6,182,212,0.1)'
    },
    dark: {
      primaryColor: '#06b6d4', // Cyan
      secondaryColor: '#0c4a6e',
      accentColor: '#3b82f6', // Ocean Blue
      backgroundColor: '#022f4b', // deep abyss blue
      textColor: '#e0f2fe',
      shadow: '0 20px 35px rgba(6,182,212,0.15)',
      borderStyle: '1px solid rgba(6,182,212,0.2)'
    }
  },
  {
    id: 'royal-heritage',
    name: 'Royal Heritage',
    mood: 'Elegant Classic Luxury',
    headingFont: 'Playfair Display',
    bodyFont: 'Lato',
    buttonStyle: 'Luxury Gold Borders & Serif',
    cardStyle: 'Vintage Outline Sharp Panels',
    animationStyle: 'Imperial Elegant Fade',
    borderRadius: '4px', // classic minimal rounded
    navStyle: 'Vintage framed header',
    emoji: '👑',
    light: {
      primaryColor: '#b45309', // Amber Gold
      secondaryColor: '#fffbeb',
      accentColor: '#7f1d1d', // Burgundy
      backgroundColor: '#fafaf9', // Creamy white
      textColor: '#451a03',
      shadow: '0 8px 24px rgba(180,83,9,0.06)',
      borderStyle: '1px solid rgba(180,83,9,0.15)'
    },
    dark: {
      primaryColor: '#d97706', // Gold / Amber
      secondaryColor: '#1c1917',
      accentColor: '#991b1b', // Burgundy
      backgroundColor: '#100e0d', // Royal stone
      textColor: '#fef3c7', // Gold wheat
      shadow: '0 25px 50px rgba(217,119,6,0.08)',
      borderStyle: '1px solid rgba(217,119,6,0.25)'
    }
  },
  {
    id: 'adventure',
    name: 'Adventure Bold',
    mood: 'Dynamic Brutalist Explorer',
    headingFont: 'Space Grotesk',
    bodyFont: 'DM Sans',
    buttonStyle: 'Strong 3D Tactile Orange Filled',
    cardStyle: 'High Contrast Mechanical Plates',
    animationStyle: 'Snappy Spring Scale & Slide',
    borderRadius: '12px',
    navStyle: 'Bold solid bordered',
    emoji: '🥾',
    light: {
      primaryColor: '#ea580c', // Flame Orange
      secondaryColor: '#fff7ed',
      accentColor: '#d97706',
      backgroundColor: '#fafaf9',
      textColor: '#0f172a',
      shadow: '4px 4px 0px 0px rgba(234,88,12,0.15)',
      borderStyle: '2px solid #ea580c'
    },
    dark: {
      primaryColor: '#ea580c', // Flame Orange
      secondaryColor: '#0f172a',
      accentColor: '#eab308', // Amber yellow
      backgroundColor: '#080c15', // Tactical dark slate
      textColor: '#f8fafc',
      shadow: '6px 6px 0px 0px rgba(234,88,12,0.2)',
      borderStyle: '2px solid #ea580c'
    }
  },
  {
    id: 'mist',
    name: 'Mist Grey',
    mood: 'Professional Clean Slate',
    headingFont: 'IBM Plex Sans',
    bodyFont: 'Inter',
    buttonStyle: 'Minimal Flat Slate Fill',
    cardStyle: 'Completely Flat Slate-200 Bordered',
    animationStyle: 'Precise Micro Motion',
    borderRadius: '8px',
    navStyle: 'Flat border bottom',
    emoji: '🌫️',
    light: {
      primaryColor: '#475569', // Slate grey
      secondaryColor: '#f1f5f9',
      accentColor: '#0f172a', // Charcoal
      backgroundColor: '#f8fafc', // Soft light ash
      textColor: '#1e293b',
      shadow: 'none',
      borderStyle: '1px solid #cbd5e1'
    },
    dark: {
      primaryColor: '#94a3b8',
      secondaryColor: '#1e293b',
      accentColor: '#f8fafc',
      backgroundColor: '#0f172a',
      textColor: '#cbd5e1',
      shadow: 'none',
      borderStyle: '1px solid #475569'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset Twilight',
    mood: 'Warm Golden Serenity',
    headingFont: 'Sora',
    bodyFont: 'Nunito Sans',
    buttonStyle: 'Warm Sunset Orange-Pink Gradient',
    cardStyle: 'Cozy Twilight Dream Shadows',
    animationStyle: 'Floating Dreamy Fade-up',
    borderRadius: '24px',
    navStyle: 'Soft floating pink-indigo',
    emoji: '🌅',
    light: {
      primaryColor: '#f97316', // Sunset orange
      secondaryColor: '#fff7ed',
      accentColor: '#ec4899', // Pink rose
      backgroundColor: '#fff5f5',
      textColor: '#431407',
      shadow: '0 10px 30px rgba(236,72,153,0.08)',
      borderStyle: '1px solid rgba(236,72,153,0.12)'
    },
    dark: {
      primaryColor: '#f97316', // Sunset orange
      secondaryColor: '#1e1b4b', // Twilight indigo
      accentColor: '#ec4899', // Pink rose
      backgroundColor: '#0d0926', // Warm deep sunset indigo
      textColor: '#fdf2f8',
      shadow: '0 20px 45px rgba(236,72,153,0.12)',
      borderStyle: '1px solid rgba(236,72,153,0.12)'
    }
  }
];

interface ThemeContextType {
  activeTheme: Theme;
  setTheme: (id: string) => Promise<void>;
  themes: Theme[];
  isLoading: boolean;
  themeMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  activeTheme: PRESETS[0],
  setTheme: async () => {},
  themes: PRESETS,
  isLoading: true,
  themeMode: 'dark'
});

export const useThemeEngine = () => useContext(ThemeContext);

interface ThemeEngineProviderProps {
  children: React.ReactNode;
  user: any;
  onUpdateUser?: (updatedUser: any) => void;
  themeMode: 'light' | 'dark';
  onThemeChange?: (themeId: string) => void;
}

export const ThemeEngineProvider: React.FC<ThemeEngineProviderProps> = ({ 
  children, 
  user, 
  onUpdateUser, 
  themeMode,
  onThemeChange
}) => {
  const [activeThemeId, setActiveThemeId] = useState<string>('signature');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load Saved Theme
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        if (user && user.theme) {
          setActiveThemeId(user.theme);
          if (onThemeChange) onThemeChange(user.theme);
        } else {
          const localSaved = localStorage.getItem('hillytrip_premium_theme');
          if (localSaved && PRESETS.some(t => t.id === localSaved)) {
            setActiveThemeId(localSaved);
            if (onThemeChange) onThemeChange(localSaved);
          }
        }
      } catch (err) {
        console.error('Error loading theme:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSavedTheme();
  }, [user]);

  // Persist Theme Selection
  const setTheme = async (id: string) => {
    if (!PRESETS.some(t => t.id === id)) return;
    setActiveThemeId(id);
    localStorage.setItem('hillytrip_premium_theme', id);
    localStorage.setItem('hillytrip-theme', id);
    if (onThemeChange) {
      onThemeChange(id);
    }

    // Persist to user profile
    if (user && user.email) {
      try {
        const res = await fetch('/api/auth/profile/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, theme: id })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && onUpdateUser) {
            onUpdateUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to save theme choice in database:', err);
      }
    }
  };

  const selectedThemeRaw = PRESETS.find(t => t.id === activeThemeId) || PRESETS[0];

  // Resolve dynamic theme properties depending on light/dark mode
  const currentModeStyle = themeMode === 'dark' ? selectedThemeRaw.dark : selectedThemeRaw.light;
  const activeTheme: Theme = {
    ...selectedThemeRaw,
    primaryColor: currentModeStyle.primaryColor,
    secondaryColor: currentModeStyle.secondaryColor,
    accentColor: currentModeStyle.accentColor,
    backgroundColor: currentModeStyle.backgroundColor,
    textColor: currentModeStyle.textColor,
    shadow: currentModeStyle.shadow,
    borderStyle: currentModeStyle.borderStyle
  };

  // Dynamically apply document styles & class triggers
  useEffect(() => {
    const loadFonts = () => {
      const fontsQuery = `family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&family=Nunito+Sans:wght@300;400;500;600;700;800&family=Source+Sans+3:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Urbanist:wght@300;400;500;600;700;800&family=Lexend:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Sora:wght@300;400;500;600;700;800&display=swap`;
      let linkEl = document.getElementById('premium-theme-fonts') as HTMLLinkElement | null;
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.id = 'premium-theme-fonts';
        linkEl.rel = 'stylesheet';
        document.head.appendChild(linkEl);
      }
      linkEl.href = `https://fonts.googleapis.com/css2?${fontsQuery}`;
    };
    loadFonts();

    let styleEl = document.getElementById('premium-theme-styles') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'premium-theme-styles';
      document.head.appendChild(styleEl);
    }

    // Body class trigger for light/dark tailwind styles
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dynamic legacy and premium theme classes sync to update variables in index.css
    const themeClasses = [
      'theme-slate-dark', 'theme-mountain-blue', 'theme-forest-green', 'theme-himalayan-night',
      'theme-sunrise-gold', 'theme-alpine-purple', 'theme-mist-grey', 'theme-river-teal',
      'theme-autumn-trail', 'theme-snow-peak', 'signature', 'alpine-light', 'himalayan-night',
      'forest-escape', 'aurora', 'ocean-breeze', 'royal-heritage', 'adventure', 'mist', 'sunset'
    ];
    document.documentElement.classList.remove(...themeClasses);

    let themeClass = 'theme-slate-dark';
    if (activeTheme.id === 'signature') themeClass = 'theme-slate-dark';
    else if (activeTheme.id === 'alpine-light') themeClass = 'theme-river-teal';
    else if (activeTheme.id === 'himalayan-night') themeClass = 'theme-himalayan-night';
    else if (activeTheme.id === 'forest-escape') themeClass = 'theme-forest-green';
    else if (activeTheme.id === 'aurora') themeClass = 'theme-alpine-purple';
    else if (activeTheme.id === 'ocean-breeze') themeClass = 'theme-mountain-blue';
    else if (activeTheme.id === 'royal-heritage') themeClass = 'theme-autumn-trail';
    else if (activeTheme.id === 'adventure') themeClass = 'theme-snow-peak';
    else if (activeTheme.id === 'mist') themeClass = 'theme-mist-grey';
    else if (activeTheme.id === 'sunset') themeClass = 'theme-sunrise-gold';

    document.documentElement.classList.add(themeClass);

    let headingFontStack = `"${activeTheme.headingFont}", sans-serif`;
    if (activeTheme.id === 'signature') headingFontStack = `"General Sans", "Manrope", sans-serif`;
    const bodyFontStack = `"${activeTheme.bodyFont}", sans-serif`;

    styleEl.innerHTML = `
      :root {
        --color-theme-primary: ${activeTheme.primaryColor};
        --color-theme-secondary: ${activeTheme.secondaryColor};
        --color-theme-accent: ${activeTheme.accentColor};
        --color-theme-bg: ${activeTheme.backgroundColor};
        --color-theme-text: ${activeTheme.textColor};
        
        --radius-theme-card: ${activeTheme.borderRadius};
        --radius-theme-btn: ${activeTheme.id === 'signature' ? '9999px' : activeTheme.id === 'alpine-light' ? '12px' : activeTheme.id === 'royal-heritage' ? '4px' : '16px'};
        --radius-theme-input: ${activeTheme.id === 'signature' ? '16px' : activeTheme.id === 'alpine-light' ? '8px' : activeTheme.id === 'royal-heritage' ? '0px' : activeTheme.id === 'forest-escape' ? '24px' : activeTheme.id === 'adventure' ? '6px' : '12px'};
        --radius-theme-chip: ${activeTheme.id === 'signature' ? '9999px' : activeTheme.id === 'royal-heritage' ? '2px' : activeTheme.id === 'forest-escape' ? '18px' : '10px'};
        
        --theme-shadow: ${activeTheme.shadow};
        --theme-border: ${activeTheme.borderStyle};
        --font-theme-heading: ${headingFontStack};
        --font-theme-body: ${bodyFontStack};

        --theme-weight-heading: ${activeTheme.id === 'royal-heritage' ? '400' : activeTheme.id === 'adventure' ? '900' : activeTheme.id === 'signature' ? '800' : '700'};
        --theme-letter-spacing-heading: ${activeTheme.id === 'signature' ? '-0.04em' : activeTheme.id === 'adventure' ? '-0.03em' : activeTheme.id === 'royal-heritage' ? '0.06em' : 'normal'};
        --theme-line-height-heading: ${activeTheme.id === 'signature' ? '1.15' : '1.25'};
        --theme-style-heading: ${activeTheme.id === 'royal-heritage' ? 'italic' : 'normal'};

        --theme-input-border: ${activeTheme.id === 'adventure' ? '2px solid #ea580c' : activeTheme.id === 'royal-heritage' ? '1px solid #b45309' : activeTheme.id === 'himalayan-night' ? '1px solid rgba(168,85,247,0.35)' : '1px solid rgba(128,128,128,0.18)'};
        --theme-input-bg: ${themeMode === 'dark' ? (activeTheme.id === 'signature' ? 'rgba(15,23,42,0.45)' : activeTheme.id === 'himalayan-night' ? 'rgba(9,5,20,0.6)' : 'rgba(30,30,40,0.5)') : 'rgba(255,255,255,0.85)'};
        --theme-chip-bg: ${activeTheme.primaryColor}15;
        --theme-chip-border: 1px solid ${activeTheme.primaryColor}30;
      }

      body {
        background-color: var(--color-theme-bg) !important;
        color: var(--color-theme-text) !important;
        font-family: var(--font-theme-body) !important;
        transition: background-color 0.4s ease, color 0.4s ease;
      }

      .premium-theme-canvas {
        background-color: var(--color-theme-bg);
        position: relative;
        overflow: hidden;
        transition: background-color 0.4s ease;
      }

      ${activeTheme.id === 'signature' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 50% 100%, rgba(16,185,129,0.15), transparent 70%),
                            radial-gradient(circle at 0% 0%, rgba(20,184,166,0.08), transparent 40%);
          pointer-events: none;
        }
      ` : activeTheme.id === 'alpine-light' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }
      ` : activeTheme.id === 'himalayan-night' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 80% 20%, rgba(168,85,247,0.12), transparent 50%),
                            radial-gradient(circle at 20% 80%, rgba(6,182,212,0.1), transparent 50%);
          pointer-events: none;
        }
      ` : activeTheme.id === 'forest-escape' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 50% 0%, rgba(22,163,74,0.1), transparent 60%),
                            radial-gradient(circle at 100% 100%, rgba(132,204,22,0.05), transparent 50%);
          pointer-events: none;
        }
      ` : activeTheme.id === 'aurora' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 30%, rgba(37,99,235,0.1), transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(16,185,129,0.1), transparent 50%),
                            radial-gradient(circle at 50% 50%, rgba(6,182,212,0.08), transparent 60%);
          pointer-events: none;
        }
      ` : activeTheme.id === 'ocean-breeze' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(180deg, rgba(6,182,212,0.06) 0%, rgba(59,130,246,0.04) 100%);
          pointer-events: none;
        }
      ` : activeTheme.id === 'royal-heritage' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 50% 50%, rgba(180,83,9,0.03) 0%, transparent 80%);
          pointer-events: none;
        }
      ` : activeTheme.id === 'adventure' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(234,88,12,0.05) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
          pointer-events: none;
        }
      ` : activeTheme.id === 'sunset' ? `
        .premium-theme-canvas::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(236,72,153,0.06) 100%);
          pointer-events: none;
        }
      ` : ''}

      h1, h2, h3, h4, h5, h6, .font-heading {
        font-family: var(--font-theme-heading) !important;
        font-weight: var(--theme-weight-heading) !important;
        letter-spacing: var(--theme-letter-spacing-heading) !important;
        line-height: var(--theme-line-height-heading) !important;
        font-style: var(--theme-style-heading) !important;
      }

      body, p, span, div, li, a, select, textarea {
        font-family: var(--font-theme-body);
      }

      /* Global Input overrides inside HillyTrip canvas */
      .theme-adaptive-input,
      .premium-theme-canvas input[type="text"],
      .premium-theme-canvas input[type="email"],
      .premium-theme-canvas input[type="password"],
      .premium-theme-canvas input[type="number"],
      .premium-theme-canvas input[type="search"],
      .premium-theme-canvas select,
      .premium-theme-canvas textarea {
        border-radius: var(--radius-theme-input) !important;
        border: var(--theme-input-border) !important;
        background-color: var(--theme-input-bg) !important;
        color: var(--color-theme-text) !important;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        box-shadow: ${activeTheme.id === 'adventure' ? '3px 3px 0px 0px rgba(234,88,12,0.15)' : 'none'} !important;
      }

      .theme-adaptive-input:focus,
      .theme-adaptive-input:focus-within,
      .premium-theme-canvas input[type="text"]:focus,
      .premium-theme-canvas input[type="email"]:focus,
      .premium-theme-canvas input[type="password"]:focus,
      .premium-theme-canvas input[type="number"]:focus,
      .premium-theme-canvas input[type="search"]:focus,
      .premium-theme-canvas select:focus,
      .premium-theme-canvas textarea:focus {
        outline: none !important;
        border-color: var(--color-theme-primary) !important;
        box-shadow: ${activeTheme.id === 'adventure' ? '1px 1px 0px 0px #ea580c' : `0 0 0 3px ${activeTheme.primaryColor}30`} !important;
        transform: ${activeTheme.id === 'adventure' ? 'translate(1px, 1px)' : 'none'} !important;
      }

      /* 1. Dynamic Card overrides */
      .theme-adaptive-card {
        background: ${themeMode === 'dark' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.8)'};
        border: var(--theme-border);
        border-radius: var(--radius-theme-card);
        box-shadow: var(--theme-shadow);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .theme-adaptive-card:hover {
        transform: ${activeTheme.id === 'adventure' ? 'translate(-4px, -4px)' : activeTheme.id === 'signature' ? 'translateY(-3px)' : 'translateY(-1.5px)'};
        box-shadow: ${activeTheme.id === 'adventure' ? '10px 10px 0px 0px rgba(234,88,12,0.3)' : activeTheme.id === 'signature' ? '0 30px 60px -15px rgba(16,185,129,0.35)' : 'var(--theme-shadow)'};
      }

      /* 2. Dynamic Button styling overrides */
      .theme-adaptive-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-theme-heading) !important;
        font-weight: 850;
        letter-spacing: ${activeTheme.id === 'royal-heritage' ? '0.12em' : 'normal'};
        text-transform: ${activeTheme.id === 'royal-heritage' ? 'uppercase' : 'none'};
        border-radius: var(--radius-theme-btn);
        padding: 0.75rem 1.75rem;
        font-size: 0.8125rem;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
      }

      ${activeTheme.id === 'signature' ? `
        .theme-adaptive-btn {
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: #020617;
          border: none;
          box-shadow: 0 10px 25px -5px rgba(16,185,129,0.4);
        }
        .theme-adaptive-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(16,185,129,0.5);
          filter: brightness(1.05);
        }
      ` : activeTheme.id === 'alpine-light' ? `
        .theme-adaptive-btn {
          background: ${themeMode === 'dark' ? '#38bdf8' : '#0f172a'};
          color: ${themeMode === 'dark' ? '#0f172a' : '#ffffff'};
          border: 1px solid ${themeMode === 'dark' ? '#38bdf8' : '#0f172a'};
        }
        .theme-adaptive-btn:hover {
          filter: brightness(1.1);
        }
      ` : activeTheme.id === 'himalayan-night' ? `
        .theme-adaptive-btn {
          background: rgba(168,85,247,0.1);
          color: #d8b4fe;
          border: 1.5px solid rgba(168,85,247,0.4);
          box-shadow: 0 0 15px rgba(168,85,247,0.15);
        }
        .theme-adaptive-btn:hover {
          background: #a855f7;
          color: #ffffff;
          box-shadow: 0 0 25px rgba(168,85,247,0.45);
        }
      ` : activeTheme.id === 'forest-escape' ? `
        .theme-adaptive-btn {
          background: #15803d;
          color: #ffffff;
          border: none;
        }
        .theme-adaptive-btn:hover {
          background: #166534;
        }
      ` : activeTheme.id === 'aurora' ? `
        .theme-adaptive-btn {
          background: linear-gradient(135deg, #06b6d4 0%, #10b981 50%, #2563eb 100%);
          background-size: 200% 200%;
          color: #ffffff;
          border: none;
          animation: auroraGradient 6s ease infinite;
        }
        .theme-adaptive-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 10px 25px rgba(37,99,235,0.3);
        }
      ` : activeTheme.id === 'ocean-breeze' ? `
        .theme-adaptive-btn {
          background: #06b6d4;
          color: #ffffff;
          border: none;
          box-shadow: 0 8px 20px rgba(6,182,212,0.2);
        }
        .theme-adaptive-btn:hover {
          transform: translateY(-2px);
          background: #0891b2;
        }
      ` : activeTheme.id === 'royal-heritage' ? `
        .theme-adaptive-btn {
          background: transparent;
          color: ${activeTheme.primaryColor};
          border: 1.5px solid ${activeTheme.primaryColor};
        }
        .theme-adaptive-btn:hover {
          background: rgba(217,119,6,0.1);
        }
      ` : activeTheme.id === 'adventure' ? `
        .theme-adaptive-btn {
          background: #ea580c;
          color: #ffffff;
          border: 2px solid #ea580c;
          border-bottom: 4px solid #9a3412;
        }
        .theme-adaptive-btn:hover {
          border-bottom-width: 2px;
          transform: translateY(2px);
        }
      ` : activeTheme.id === 'mist' ? `
        .theme-adaptive-btn {
          background: ${activeTheme.primaryColor};
          color: ${themeMode === 'dark' ? '#0f172a' : '#ffffff'};
          border: none;
        }
        .theme-adaptive-btn:hover {
          opacity: 0.9;
        }
      ` : `
        .theme-adaptive-btn {
          background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
          color: #ffffff;
          border: none;
          box-shadow: 0 8px 25px rgba(236,72,153,0.25);
        }
        .theme-adaptive-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
      `}

      /* Chips/Badges customization */
      .theme-adaptive-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.3rem 0.75rem;
        font-size: 0.6875rem;
        font-weight: 800;
        text-transform: ${activeTheme.id === 'royal-heritage' ? 'uppercase' : 'none'};
        letter-spacing: ${activeTheme.id === 'royal-heritage' ? '0.05em' : 'normal'};
        border-radius: var(--radius-theme-chip);
        background: var(--theme-chip-bg);
        color: var(--theme-chip-text);
        border: var(--theme-chip-border);
        transition: all 0.2s ease;
      }
      .theme-adaptive-chip:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      /* Icons customization wrapper */
      .theme-adaptive-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        transition: all 0.25s ease;
        ${activeTheme.id === 'signature' ? `
          border-radius: 9999px;
          background: rgba(16,185,129,0.08);
          border: 1px solid rgba(16,185,129,0.12);
        ` : activeTheme.id === 'alpine-light' ? `
          border-radius: 6px;
          background: ${themeMode === 'dark' ? '#1e293b' : '#f1f5f9'};
          border: 1px solid ${themeMode === 'dark' ? '#334155' : '#e2e8f0'};
        ` : activeTheme.id === 'himalayan-night' ? `
          border-radius: 12px;
          background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.25);
          box-shadow: 0 0 10px rgba(168,85,247,0.2);
        ` : activeTheme.id === 'forest-escape' ? `
          border-radius: 16px 4px 16px 4px;
          background: rgba(22,163,74,0.08);
          border: 1.5px solid rgba(22,163,74,0.15);
        ` : activeTheme.id === 'aurora' ? `
          border-radius: 14px;
          background: rgba(37,99,235,0.08);
          border: 1.5px solid rgba(16,185,129,0.2);
          box-shadow: 0 4px 12px rgba(37,99,235,0.08);
        ` : activeTheme.id === 'ocean-breeze' ? `
          border-radius: 9999px;
          background: rgba(6,182,212,0.1);
          border: 1px solid rgba(6,182,212,0.15);
        ` : activeTheme.id === 'royal-heritage' ? `
          border-radius: 0px;
          background: transparent;
          border: 1.5px solid #b45309;
        ` : activeTheme.id === 'adventure' ? `
          border-radius: 8px;
          background: #ea580c10;
          border: 2px solid #ea580c;
        ` : activeTheme.id === 'mist' ? `
          border-radius: 4px;
          background: ${themeMode === 'dark' ? '#1e293b' : '#f1f5f9'};
          border: none;
        ` : `
          border-radius: 9999px;
          background: rgba(249,115,22,0.1);
          border: 1px solid rgba(236,72,153,0.15);
        `}
      }

      /* Skeleton loader customizations */
      .theme-adaptive-skeleton,
      .premium-theme-canvas .animate-pulse {
        border-radius: var(--radius-theme-card) !important;
        animation: ${
          activeTheme.id === 'adventure' ? 'brutalistPulse 0.4s steps(2) infinite' :
          activeTheme.id === 'himalayan-night' ? 'cosmicPulse 2.5s ease-in-out infinite' :
          'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        } !important;
        background-color: ${
          themeMode === 'dark'
            ? (activeTheme.id === 'signature' ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.05)')
            : (activeTheme.id === 'signature' ? 'rgba(16,185,129,0.04)' : 'rgba(0,0,0,0.05)')
        } !important;
        border: ${activeTheme.id === 'royal-heritage' ? '1px dashed #b45309' : 'none'} !important;
      }

      @keyframes brutalistPulse {
        0%, 100% { opacity: 0.15; background-color: #ea580c30; }
        50% { opacity: 0.4; background-color: #ea580c50; }
      }

      @keyframes cosmicPulse {
        0%, 100% { opacity: 0.2; filter: drop-shadow(0 0 1px rgba(168,85,247,0.1)); }
        50% { opacity: 0.5; filter: drop-shadow(0 0 12px rgba(168,85,247,0.4)); background-color: rgba(168,85,247,0.12); }
      }

      /* Dialog overrides */
      .theme-adaptive-dialog {
        background: ${themeMode === 'dark' ? 'rgba(8, 12, 28, 0.95)' : '#ffffff'} !important;
        border: var(--theme-border) !important;
        border-radius: var(--radius-theme-card) !important;
        box-shadow: var(--theme-shadow) !important;
        backdrop-filter: blur(24px) !important;
      }

      /* Empty states adaptation */
      .theme-adaptive-empty-state {
        border: 2px dashed ${activeTheme.primaryColor}30;
        border-radius: var(--radius-theme-card);
        background: ${themeMode === 'dark' ? 'rgba(15,23,42,0.2)' : 'rgba(255,255,255,0.3)'};
        padding: 3rem;
        text-align: center;
        transition: all 0.3s ease;
      }

      @keyframes auroraGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .theme-route-transition {
        animation: ${
          activeTheme.id === 'signature' ? 'mountainFlow 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' :
          activeTheme.id === 'alpine-light' ? 'fadeIn 0.3s ease both' :
          activeTheme.id === 'himalayan-night' ? 'glowFade 0.7s ease-in-out both' :
          activeTheme.id === 'forest-escape' ? 'softLeafSlide 0.5s cubic-bezier(0.1, 0.8, 0.2, 1) both' :
          activeTheme.id === 'aurora' ? 'auroraShift 0.8s ease both' :
          activeTheme.id === 'ocean-breeze' ? 'waveMotion 0.6s ease both' :
          activeTheme.id === 'royal-heritage' ? 'classicFade 0.7s ease both' :
          activeTheme.id === 'adventure' ? 'snappySpring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' :
          activeTheme.id === 'mist' ? 'microFade 0.2s linear both' :
          'floatingFade 0.6s ease both'
        };
      }

      @keyframes mountainFlow {
        from { opacity: 0; transform: translateY(20px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes glowFade {
        from { opacity: 0; filter: drop-shadow(0 0 0px transparent); }
        to { opacity: 1; filter: drop-shadow(0 0 10px rgba(168,85,247,0.1)); }
      }
      @keyframes softLeafSlide {
        from { opacity: 0; transform: translateY(15px) rotate(-1deg); }
        to { opacity: 1; transform: translateY(0) rotate(0deg); }
      }
      @keyframes auroraShift {
        from { opacity: 0; transform: translateY(10px); background-position: 100% 0%; }
        to { opacity: 1; transform: translateY(0); background-position: 0% 100%; }
      }
      @keyframes waveMotion {
        0% { opacity: 0; transform: translateY(15px); }
        50% { transform: translateY(-3px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes classicFade {
        from { opacity: 0; transform: scale(0.99); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes snappySpring {
        0% { opacity: 0; transform: scale(0.92) translateY(10px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes microFade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes floatingFade {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
  }, [activeThemeId, themeMode]);

  return (
    <ThemeContext.Provider value={{
      activeTheme,
      setTheme,
      themes: PRESETS,
      isLoading,
      themeMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
