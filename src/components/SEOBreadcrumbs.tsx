import React from 'react';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
  navigate: (path: string) => void;
  className?: string;
  themeMode?: 'light' | 'dark';
}

export default function SEOBreadcrumbs({
  items,
  navigate,
  className = '',
  themeMode = 'dark'
}: SEOBreadcrumbsProps) {
  // Ensure "Home" is at position 1
  const fullItems: BreadcrumbItem[] = items[0]?.path === '/' || items[0]?.path === '#/' 
    ? items 
    : [{ name: 'Home', path: '/' }, ...items];

  // Filter out any admin items from breadcrumbs
  const sanitizedItems = fullItems.filter(item => !item.path.includes('/admin') && !item.path.includes('/system-health') && !item.path.includes('/platform-console'));

  const hasAdminPath = fullItems.some(item => item.path.includes('/admin') || item.path.includes('/system-health') || item.path.includes('/platform-console'));

  const jsonLd = hasAdminPath ? null : {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": sanitizedItems.map((item, index) => {
      let cleanPath = item.path.startsWith('#') ? item.path.substring(1) : item.path;
      if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
      return {
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://hillytrip.com${cleanPath}`
      };
    })
  };

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`py-2.5 px-4 sm:px-6 lg:px-8 text-xs font-medium select-none relative z-30 transition-colors ${className}`}
    >
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center gap-1.5 sm:gap-2">
        {sanitizedItems.map((item, index) => {
          const isLast = index === sanitizedItems.length - 1;
          return (
            <React.Fragment key={`${index}-${item.path}`}>
              {index > 0 && (
                <span className="text-slate-400 dark:text-slate-600 font-bold select-none" aria-hidden="true">
                  /
                </span>
              )}
              {isLast ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.path}
                  onClick={(e) => handleNavigation(e, item.path)}
                  className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 font-semibold transition cursor-pointer whitespace-nowrap"
                >
                  {item.name}
                </a>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
