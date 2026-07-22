import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface FloatingWhatsAppSupportProps {
  currentPath: string;
  activeDestDetail?: any;
  activeHomeDetail?: any;
  activeAttrDetail?: any;
}

export default function FloatingWhatsAppSupport({
  currentPath,
  activeDestDetail,
  activeHomeDetail,
  activeAttrDetail,
}: FloatingWhatsAppSupportProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 1. Detect device type (mobile vs desktop)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Tooltip logic
  useEffect(() => {
    // Show tooltip after a small delay on load
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // On mobile, automatically hide the tooltip after 6 seconds of showing
  useEffect(() => {
    if (isMobile && showTooltip) {
      const autoHideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 6000);
      return () => clearTimeout(autoHideTimer);
    }
  }, [isMobile, showTooltip]);

  // 3. Visibility rules
  // Hide on Login, Signup (e.g. /register routes), Admin Panel, Owner Dashboard, Internal Messaging
  const isHidden = () => {
    const cleanPath = currentPath.toLowerCase();
    
    // Check path prefixes
    const hiddenPrefixes = [
      '/admin',
      '/partner-dashboard',
      '/dashboard',
      '/messages',
      '/register',
    ];
    
    return hiddenPrefixes.some(prefix => cleanPath.startsWith(prefix));
  };

  if (isHidden()) {
    return null;
  }

  // 4. Retrieve phone number from environment variable with a resilient fallback
  const rawNumber = (import.meta as any).env?.VITE_SUPPORT_WHATSAPP_NUMBER || '+919876543210';
  // Clean all non-digit characters for the link
  const cleanNumber = rawNumber.replace(/\D/g, '');

  // 5. Dynamic Contextual message logic
  const getContextualMessage = () => {
    const cleanPath = currentPath.split('?')[0];

    // Home Page
    if (cleanPath === '' || cleanPath === '/' || cleanPath === '#/') {
      return `Hi HillyTrip,
I would like to know more about your services.

Please help me.`;
    }

    // Destination Page
    if (cleanPath.startsWith('/destination/') || cleanPath.startsWith('/destinations/')) {
      const destName = activeDestDetail?.destination?.name || 'this destination';
      return `Hi HillyTrip,
I have a question about ${destName}.

Please help me.`;
    }

    // Homestay Page
    if (cleanPath.startsWith('/homestay/') || cleanPath.startsWith('/homestays/')) {
      const homestayName = activeHomeDetail?.homestay?.name || 'this homestay';
      return `Hi HillyTrip,
I have a question regarding ${homestayName}.

Please help me.`;
    }

    // Attraction Page
    if (cleanPath.startsWith('/attraction/') || cleanPath.startsWith('/attractions/')) {
      const attractionName = activeAttrDetail?.attraction?.name || 'this attraction';
      return `Hi HillyTrip,
I would like more information about ${attractionName}.

Please help me.`;
    }

    // Taxi Page (specifically routes or /book-car matching context)
    if (cleanPath === '/book-car') {
      return `Hi HillyTrip,
I need help with my booking.

Please help me.`;
    }

    if (cleanPath === '/routes' || cleanPath.startsWith('/route/') || cleanPath.startsWith('/routes/')) {
      const taxiStandName = activeDestDetail?.destination?.nearestTaxiStand || 'local taxi stands';
      return `Hi HillyTrip,
I need help regarding ${taxiStandName}.

Please help me.`;
    }

    // Booking Page fallback (any generic booking/payment references)
    if (cleanPath.includes('booking') || cleanPath.includes('payment')) {
      return `Hi HillyTrip,
I need help with my booking.

Please help me.`;
    }

    // Default fallback
    return `Hi HillyTrip,
I need assistance regarding your website.

Please help me.`;
  };

  const handleSupportClick = () => {
    // Hide tooltip on interaction
    setShowTooltip(false);

    // Track click event in the HillyTrip analytics engine
    try {
      trackEvent('whatsapp_support_click', {
        current_page: currentPath,
        device_type: isMobile ? 'mobile' : 'desktop',
        timestamp: new Date().toISOString(),
        prefilled_message_type: (currentPath.startsWith('/destination/') || currentPath.startsWith('/destinations/')) ? 'destination' :
                                (currentPath.startsWith('/homestay/') || currentPath.startsWith('/homestays/')) ? 'homestay' :
                                (currentPath.startsWith('/attraction/') || currentPath.startsWith('/attractions/')) ? 'attraction' :
                                currentPath === '/book-car' ? 'booking' : 'general'
      });
    } catch (err) {
      console.warn('Analytics tracking quiet fallback:', err);
    }

    // Open internal platform messaging system
    window.location.hash = '#/messages';
  };

  // 6. Dynamic Safe Position (to prevent overlapping mobile bottom bars on Detail pages)
  const isDetailPage = 
    currentPath.startsWith('/homestay/') || currentPath.startsWith('/homestays/') || 
    currentPath.startsWith('/route/') || currentPath.startsWith('/routes/') ||
    currentPath.startsWith('/destination/') || currentPath.startsWith('/destinations/') ||
    currentPath.startsWith('/attraction/') || currentPath.startsWith('/attractions/');
  const positionClasses = isMobile && isDetailPage
    ? 'bottom-24 right-5 sm:right-6' // Push higher on mobile detail pages to avoid sticky bottom CTA
    : 'bottom-5 right-5 sm:bottom-8 sm:right-8';

  return (
    <div 
      id="hillytrip-whatsapp-container" 
      className={`fixed z-50 flex items-center gap-3 transition-all duration-300 ${positionClasses}`}
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 15 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            id="whatsapp-support-tooltip"
            className="relative flex items-center bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs font-semibold whitespace-nowrap"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowTooltip(false)}
              className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              aria-label="Close tooltip"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Tooltip Content */}
            <div className="flex flex-col text-left pr-1">
              <span className="font-extrabold text-[11px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Need Help?
              </span>
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                Chat with HillyTrip
              </span>
            </div>

            {/* Small Speech Bubble Arrow pointing right */}
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-r border-t border-slate-100 dark:border-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={handleSupportClick}
        id="whatsapp-floating-support-btn"
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba56] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800 cursor-pointer animate-whatsapp-pulse group"
        aria-label="Contact HillyTrip Support on WhatsApp"
        title="Chat with HillyTrip Support on WhatsApp"
      >
        {/* Official WhatsApp Logo SVG */}
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:rotate-12"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.858-4.419 9.86-9.86.001-2.636-1.024-5.113-2.887-6.978C16.378 1.9 13.903.879 11.262.879 5.828.879 1.406 5.3 1.404 10.74c-.002 1.517.401 2.998 1.166 4.31l-.993 3.626 3.714-.974zm11.365-6.852c-.27-.135-1.597-.788-1.846-.878-.249-.09-.431-.135-.612.135-.181.27-.701.878-.859 1.058-.158.18-.317.202-.587.067-.27-.135-1.14-.42-2.172-1.341-.803-.715-1.345-1.6-1.503-1.87-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.472.135-.158.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.612-1.474-.838-2.016-.22-.529-.441-.458-.612-.458-.158-.008-.339-.01-.52-.01-.18 0-.474.068-.722.337-.249.27-.95.923-.95 2.25 0 1.327.966 2.61 1.1 2.79.135.18 1.9 2.901 4.603 4.068.643.277 1.145.443 1.536.567.646.206 1.233.177 1.697.108.518-.077 1.597-.652 1.822-1.25.226-.597.226-1.103.158-1.216-.068-.113-.249-.18-.518-.315z" />
        </svg>
      </button>
    </div>
  );
}
