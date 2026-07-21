import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '../types';

interface BrandingContextType {
  settings: SiteSettings;
  publishedSettings: SiteSettings;
  previewSettings: SiteSettings | null;
  setPreviewSettings: (settings: SiteSettings | null) => void;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  id: 'default_v1',
  is_active: true,
  site_name: 'HillyTrip',
  desktop_logo_url: '/hillytrip_logo.jpg?v=2',
  mobile_logo_url: '/hillytrip_logo.jpg?v=2',
  footer_logo_url: '/hillytrip_logo.jpg?v=2',
  white_logo_url: '/hillytrip_logo.jpg?v=2',
  dark_logo_url: '/hillytrip_logo.jpg?v=2',
  favicon_url: '/hillytrip_logo.jpg?v=2',
  app_icon_url: '/hillytrip_logo.jpg?v=2',
  apple_touch_icon_url: '/hillytrip_logo.jpg?v=2',
  android_pwa_icon_url: '/hillytrip_logo.jpg?v=2',
  hero_video_url: '',
  hero_image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
  primary_color: '#0ea5e9',
  secondary_color: '#0f172a',
  accent_color: '#f59e0b',
  success_color: '#10b981',
  warning_color: '#f59e0b',
  error_color: '#ef4444',
  heading_font: 'Plus Jakarta Sans',
  body_font: 'Inter',
  button_font: 'Plus Jakarta Sans',
  default_language: 'en',
  tagline: "India's Intelligent Mountain Travel Network",
  footer_copyright: '© 2026 HillyTrip. All rights reserved.',
  contact_email: 'contact@hillytrip.com',
  support_email: 'support@hillytrip.com',
  social_links: { facebook: 'https://facebook.com', twitter: 'https://twitter.com', instagram: 'https://instagram.com' },
  updated_at: new Date().toISOString(),
  updated_by: 'System Default',
  status: 'published'
};

const BrandingContext = createContext<BrandingContextType>({
  settings: defaultSettings,
  publishedSettings: defaultSettings,
  previewSettings: null,
  setPreviewSettings: () => {},
  isLoading: true,
  refreshSettings: async () => {}
});

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [previewSettings, setPreviewSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load site branding settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Apply the active settings (or preview settings if currently previewing)
  useEffect(() => {
    const active = previewSettings || settings;
    if (!active) return;

    // 1. Dynamic Site Metadata (Title, Tagline)
    document.title = active.site_name ? `${active.site_name} | ${active.tagline || 'Intelligent Travel'}` : 'HillyTrip';

    // 2. Load Google Fonts dynamically
    const fontsToLoad = Array.from(new Set([active.heading_font, active.body_font, active.button_font])).filter(Boolean);
    if (fontsToLoad.length > 0) {
      const fontsQuery = fontsToLoad.map(f => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`).join('&');
      let linkEl = document.getElementById('dynamic-brand-fonts') as HTMLLinkElement | null;
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.id = 'dynamic-brand-fonts';
        linkEl.rel = 'stylesheet';
        document.head.appendChild(linkEl);
      }
      linkEl.href = `https://fonts.googleapis.com/css2?${fontsQuery}&display=swap`;
    }

    // 3. Inject styling overrides for Colors & Typography
    let styleEl = document.getElementById('dynamic-brand-styles') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-brand-styles';
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      :root {
        --color-primary: ${active.primary_color};
        --color-secondary: ${active.secondary_color};
        --color-accent: ${active.accent_color};
        --color-success: ${active.success_color};
        --color-warning: ${active.warning_color};
        --color-error: ${active.error_color};
        
        --font-heading: "${active.heading_font}", "Plus Jakarta Sans", sans-serif;
        --font-body: "${active.body_font}", "Inter", sans-serif;
        --font-button: "${active.button_font}", "Plus Jakarta Sans", sans-serif;
      }
      
      /* Target Tailwind colors and force override with active branding variables */
      .bg-sky-500, 
      .bg-sky-600, 
      .hover\\:bg-sky-600:hover, 
      .hover\\:bg-sky-500:hover,
      .bg-blue-600,
      .from-blue-600,
      .to-sky-500,
      .bg-sky-400,
      .bg-sky-500\\/10 {
        background-color: var(--color-primary) !important;
      }
      
      .text-sky-500, 
      .text-sky-600, 
      .text-sky-450,
      .text-sky-400, 
      .text-sky-305,
      .text-sky-750,
      .text-sky-850,
      .group-hover\\:text-sky-600:hover,
      .group-hover\\:text-sky-450:hover {
        color: var(--color-primary) !important;
      }
      
      .border-sky-500, 
      .border-sky-600, 
      .border-sky-400\\/20,
      .border-sky-100,
      .hover\\:border-sky-100:hover,
      .hover\\:border-sky-200:hover,
      .hover\\:border-sky-500\\/40:hover {
        border-color: var(--color-primary) !important;
      }
      
      .shadow-sky-500\\/15,
      .shadow-sky-500\\/20 {
        --tw-shadow-color: var(--color-primary) !important;
        box-shadow: 0 10px 15px -3px rgba(var(--color-primary), 0.15) !important;
      }

      /* Apply typography fonts universally */
      h1, h2, h3, h4, h5, h6, .font-heading, [class*="font-display"], [class*="font-sans"] {
        font-family: var(--font-heading) !important;
      }
      
      body, p, span, div, li, a, .font-body {
        font-family: var(--font-body) !important;
      }
      
      button, input, select, textarea, .font-button {
        font-family: var(--font-button) !important;
      }
    `;

    // 4. Update Favicon dynamically
    if (active.favicon_url) {
      let iconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = active.favicon_url;
    }
  }, [settings, previewSettings]);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <BrandingContext.Provider value={{
      settings: previewSettings || settings,
      publishedSettings: settings,
      previewSettings,
      setPreviewSettings,
      isLoading,
      refreshSettings
    }}>
      {children}
    </BrandingContext.Provider>
  );
};
