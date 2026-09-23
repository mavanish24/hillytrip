import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Filter, Gift, Sparkles, MapPin, Tag } from 'lucide-react';
import { Offer, BusinessCategoryType } from '../../types/offer';
import { getOffers, subscribeOffers } from '../../services/offers/OfferEngine';
import { HomepageOfferCard } from './HomepageOfferCard';

interface OffersCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate?: (path: string) => void;
}

const CATEGORIES: { label: string; value: string; icon: string }[] = [
  { label: 'All Offers', value: 'All', icon: '✨' },
  { label: 'Homestays', value: 'Homestay', icon: '🏡' },
  { label: 'Taxi Operators', value: 'Taxi Operator', icon: '🚖' },
  { label: 'Tour Packages', value: 'Tour Operator', icon: '🎒' },
  { label: 'Restaurants & Cafés', value: 'Restaurant', icon: '🍽' },
  { label: 'Activities & Adventures', value: 'Activity', icon: '🎟' },
  { label: 'Local Experiences', value: 'Local Experience', icon: '🛍' }
];

export const OffersCatalogModal: React.FC<OffersCatalogModalProps> = ({
  isOpen,
  onClose,
  navigate
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadOffers = () => {
      const data = getOffers({
        onlyActiveValid: true,
        category: selectedCategory,
        searchQuery: searchQuery
      });
      setOffers(data);
    };

    if (isOpen) {
      loadOffers();
    }

    const unsub = subscribeOffers(loadOffers);
    return () => unsub();
  }, [isOpen, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-6xl w-full my-auto shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold shrink-0 shadow-md">
                🎁
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>HillyTrip Exclusive Offers & Deals</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Verified promotional vouchers and deals across North Bengal & Sikkim
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer self-end sm:self-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls & Filter Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-3">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search offers by title, location (e.g. Darjeeling, Gangtok), or business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md border border-emerald-400/40'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Grid View */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {offers.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                  🔍
                </div>
                <h3 className="text-base font-bold text-white">No active offers match your filter</h3>
                <p className="text-xs text-slate-400">
                  Try clearing your search terms or picking another business category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {offers.map((offer) => (
                  <HomepageOfferCard
                    key={offer.id}
                    offer={offer}
                    onSelectOffer={(selected) => {
                      onClose();
                      if (navigate) {
                        navigate(`/offers/${selected.id}`);
                      } else {
                        window.location.hash = `#/offers/${selected.id}`;
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OffersCatalogModal;
