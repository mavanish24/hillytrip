import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, Smartphone, Laptop, CheckCircle } from 'lucide-react';

interface PWAInstallPromptProps {
  themeMode: 'light' | 'dark';
}

export default function PWAInstallPrompt({ themeMode }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android_desktop' | null>(null);

  useEffect(() => {
    // 1. Detect if the app is already running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandaloneMedia || isIOSStandalone;
    };

    if (checkStandalone()) {
      return; // Already installed, do not show prompt
    }

    // 2. Suppress prompt if user explicitly dismissed it in this session
    const isDismissed = sessionStorage.getItem('hillytrip-pwa-install-dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // 3. Detect operating system
    const userAgent = window.navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setPlatform(isIOS ? 'ios' : 'android_desktop');

    // 4. Handle installation prompt event for Android & Desktop browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait slightly after loading to display the install prompt elegantly
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    };

    // If it's iOS, we don't get the beforeinstallprompt event, but we can show custom guide
    if (isIOS) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 8000); // Wait 8 seconds on iOS to not overwhelm user immediately
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native install dialog
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    try {
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA Install] User choice outcome: ${outcome}`);
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    } catch (err) {
      console.error('[PWA Install Error] Failed to complete install flow:', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss temporarily for this session so the user can browse in peace
    sessionStorage.setItem('hillytrip-pwa-install-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[10000]"
        >
          <div className={`p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border backdrop-blur-xl transition-all duration-300 ${
            themeMode === 'dark' 
              ? 'bg-slate-900/95 border-slate-800 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}>
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className={`absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-500/20 transition-colors cursor-pointer`}
              aria-label="Dismiss installation prompt"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
            </button>

            {/* Core Info Row */}
            <div className="flex gap-4 items-start">
              <div className="bg-gradient-to-tr from-slate-100 to-slate-200 p-1.5 rounded-2xl flex-shrink-0 shadow-lg border border-slate-200/50">
                <img 
                  src="/hillytrip_logo.jpg?v=2" 
                  alt="HillyTrip" 
                  className="w-12 h-12 object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-base font-extrabold tracking-tight">Install HillyTrip App</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Get India's Intelligent Mountain Travel Network instantly on your home screen for rapid route mapping & offline database support.
                </p>
              </div>
            </div>

            {/* Platform Conditional Body */}
            <div className="mt-4 pt-4 border-t border-slate-500/10">
              {platform === 'ios' ? (
                /* iOS Custom Safari Guide Checklist */
                <div className="space-y-3">
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    How to install on iOS / iPhone:
                  </p>
                  <ol className="space-y-2.5 text-xs text-slate-400 list-none pl-0">
                    <li className="flex items-center gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-500/20 text-[10px] font-bold">1</span>
                      <span>Tap the Safari browser <span className="inline-flex items-center align-middle bg-slate-500/20 p-1 rounded mx-0.5"><Share className="w-3.5 h-3.5 text-blue-400 inline" /> Share</span> button.</span>
                    </li>
                    <li className="flex items-center gap-3 font-medium">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-500/20 text-[10px] font-bold">2</span>
                      <span>Scroll down and select <span className="inline-flex items-center align-middle bg-slate-500/20 px-1.5 py-0.5 rounded mx-0.5 text-[11px] font-bold text-white"><PlusSquare className="w-3.5 h-3.5 text-slate-300 inline mr-1" /> Add to Home Screen</span>.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android & Desktop Flow */
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400 pb-1">
                    <Laptop className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Cross-platform desktop & mobile installer ready</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDismiss}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        themeMode === 'dark'
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={handleInstallClick}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Install Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Offline Badging Detail */}
            <div className="mt-3 text-[10px] text-slate-500 flex items-center gap-1 justify-center bg-slate-500/5 py-1 rounded-lg">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span>Offline caching & real-time travel intelligence activated</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
