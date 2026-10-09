import React, { useState } from 'react';
import { Gift, Tag, Check, Sparkles, Percent, ShieldAlert } from 'lucide-react';

interface TaxiOffersSectionProps {
  fromLocation: string;
  toLocation: string;
  onApplyPromoCode?: (code: string, discount: number) => void;
}

export const TaxiOffersSection: React.FC<TaxiOffersSectionProps> = ({
  fromLocation,
  toLocation,
  onApplyPromoCode
}) => {
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const routeOffers = [
    {
      code: 'FIRSTTRIP',
      title: '₹300 OFF First Mountain Taxi',
      desc: 'Valid on first reserved cab booking across NJP, Darjeeling & Kalimpong corridors.',
      discount: 300,
      badge: 'Welcome Offer'
    },
    {
      code: 'HILLYBANK',
      title: '10% HDFC & ICICI Cashback',
      desc: 'Instant cashback on direct UPI/Card payments to verified taxi partners.',
      discount: 250,
      badge: 'Bank Cashback'
    },
    {
      code: 'MONSOON2026',
      title: 'Festival & Hill Pass Discount',
      desc: 'Flat ₹200 OFF on shared/reserved cabs for Kalimpong & Sikkim gateways.',
      discount: 200,
      badge: 'Season Special'
    }
  ];

  const handleApply = (code: string, discount: number) => {
    setAppliedCode(code);
    if (onApplyPromoCode) {
      onApplyPromoCode(code, discount);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 rounded-3xl p-5 shadow-lg space-y-3 my-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🎁 Available Offers for {fromLocation.split(' ')[0]} → {toLocation}</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Apply verified route promo codes at booking confirmation
            </p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">
          Route Verified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {routeOffers.map((offer) => {
          const isApplied = appliedCode === offer.code;

          return (
            <div
              key={offer.code}
              className={`p-3.5 rounded-2xl border transition-all space-y-2 flex flex-col justify-between ${
                isApplied
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-amber-500/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {offer.badge}
                  </span>
                  <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">
                    {offer.code}
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{offer.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{offer.desc}</p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  Save ₹{offer.discount}
                </span>

                <button
                  onClick={() => handleApply(offer.code, offer.discount)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                    isApplied
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-400 hover:text-slate-950'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-3 h-3" />
                      <span>Apply Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
