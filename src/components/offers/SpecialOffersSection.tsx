import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Gift, ArrowRight } from 'lucide-react';
import { Offer } from '../../types/offer';
import { getOffers, subscribeOffers } from '../../services/offers/OfferEngine';
import { HomepageOfferCard } from './HomepageOfferCard';
import { HillyV1Mascot } from '../HillyV1Mascot';

interface SpecialOffersSectionProps {
  navigate?: (path: string) => void;
  onOpenCatalog?: () => void;
  className?: string;
}

export const SpecialOffersSection: React.FC<SpecialOffersSectionProps> = ({
  navigate,
  onOpenCatalog,
  className = ''
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const activeDeals = getOffers({ onlyActiveValid: true });
      setOffers(activeDeals);
    };

    loadData();
    const unsub = subscribeOffers(loadData);
    return () => unsub();
  }, []);

  // Auto Scroll Engine (Pauses when hovered)
  useEffect(() => {
    if (isHovered || offers.length <= 4) return;
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.75;
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, offers.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCardSelect = (offer: Offer) => {
    if (navigate) {
      navigate(`/offers/${offer.id}`);
    } else {
      window.location.hash = `#/offers/${offer.id}`;
    }
  };

  return (
    <section className={`w-full py-8 sm:py-12 bg-slate-950 border-t border-b border-slate-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Local Deals</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>🎁 Special Offers</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Exclusive deals from verified local businesses across North Bengal & Sikkim.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Nav Controls */}
            {offers.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-2xl p-1">
                <button
                  onClick={() => handleScroll('left')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Previous offers"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="Next offers"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* View All Link */}
            <button
              onClick={() => {
                if (onOpenCatalog) {
                  onOpenCatalog();
                } else if (navigate) {
                  navigate('/offers');
                }
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* OFFERS CAROUSEL & EMPTY STATE */}
        {offers.length === 0 ? (
          /* EMPTY STATE */
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="w-36 h-40 shrink-0 flex items-center justify-center">
              <HillyV1Mascot
                pose="thinking"
                size="lg"
                showSpeechBubble={false}
              />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-black text-white">No active offers available.</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Check back soon for exciting deals from our verified homestays, taxi operators, and local tour guides in North Bengal & Sikkim.
              </p>
            </div>
          </div>
        ) : (
          /* RESPONSIVE CAROUSEL SLIDER */
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-full"
          >
            <div
              ref={scrollContainerRef}
              className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {offers.map((offer, idx) => (
                <div
                  key={`${offer.id}-${idx}`}
                  className="w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 snap-start flex flex-col"
                >
                  <HomepageOfferCard
                    offer={offer}
                    onSelectOffer={handleCardSelect}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecialOffersSection;
