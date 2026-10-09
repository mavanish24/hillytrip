import React, { useState, useEffect } from 'react';
import { Car, ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { fetchDynamicRouteEstimate, getRouteEstimate, hasVerifiedMountainRoute, RouteEstimate } from '../../utils/taxiRoutingEngine';
import { getItemSlug } from '../../utils/slug';
import { UniversalCarousel } from '../UniversalCarousel';

export interface PopularRouteItem {
  id: string;
  fromName: string;
  toName: string;
  categoryLabel: string;
}

const CURATED_POPULAR_ROUTES: PopularRouteItem[] = [
  { id: 'njp-kalimpong', fromName: 'NJP Railway Station', toName: 'Kalimpong', categoryLabel: 'RESERVED CAR' },
  { id: 'njp-darjeeling', fromName: 'NJP Railway Station', toName: 'Darjeeling', categoryLabel: 'SHARED & PRIVATE CAB' },
  { id: 'njp-gangtok', fromName: 'NJP Railway Station', toName: 'Gangtok', categoryLabel: 'RESERVED SUV' },
  { id: 'bagdogra-darjeeling', fromName: 'Bagdogra Airport', toName: 'Darjeeling', categoryLabel: 'PREPAID CAB' },
  { id: 'bagdogra-gangtok', fromName: 'Bagdogra Airport', toName: 'Gangtok', categoryLabel: 'PREPAID SUV' },
  { id: 'kalimpong-lava', fromName: 'Kalimpong', toName: 'Lava', categoryLabel: 'LOCAL JEEP' },
  { id: 'gangtok-pelling', fromName: 'Gangtok', toName: 'Pelling', categoryLabel: 'PRIVATE CAB' },
  { id: 'darjeeling-kalimpong', fromName: 'Darjeeling', toName: 'Kalimpong', categoryLabel: 'SHARED / PRIVATE' }
];

interface PopularTaxiRoutesSectionProps {
  onSelectRoute: (from: string, to: string) => void;
}

function PopularRouteCard({ item, onSelectRoute }: { item: PopularRouteItem; onSelectRoute: (from: string, to: string) => void }) {
  const [estimate, setEstimate] = useState<RouteEstimate>(() => getRouteEstimate(item.fromName, item.toName));
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    // If the route already has verified mountain metrics, avoid remote Google Routes/API request
    if (hasVerifiedMountainRoute(item.fromName, item.toName)) {
      return;
    }

    let isMounted = true;
    setSyncing(true);
    fetchDynamicRouteEstimate(item.fromName, item.toName)
      .then((est) => {
        if (isMounted) {
          setEstimate(est);
          setSyncing(false);
        }
      })
      .catch((err) => {
        console.warn(`[PopularRouteCard] Dynamic route estimation error for ${item.fromName} -> ${item.toName}:`, err);
        if (isMounted) setSyncing(false);
      });

    return () => { isMounted = false; };
  }, [item.fromName, item.toName]);

  const fareDisplay = estimate.reservedStartingPrice 
    ? `From ₹${estimate.reservedStartingPrice.toLocaleString('en-IN')}`
    : estimate.sharedFarePerson 
    ? `From ₹${estimate.sharedFarePerson.toLocaleString('en-IN')}`
    : 'Get Fare →';

  return (
    <div
      onClick={() => onSelectRoute(item.fromName, item.toName)}
      className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between h-full min-h-[250px]"
    >
      <div>
        {/* Category Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-black tracking-wider uppercase">
            <Car className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {item.categoryLabel}
          </span>
        </div>

        {/* Origin -> Destination Visual Stack */}
        <div className="space-y-1 my-3 text-left">
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {item.fromName}
          </div>
          <div className="flex items-center gap-2 text-slate-400 my-1">
            <span className="text-xs font-bold text-emerald-500">↓</span>
            <div className="h-[1px] w-12 bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {item.toName}
          </div>
        </div>

        {/* Dynamic Distance & Travel Time */}
        <div className="mt-4 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-left">
          <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>~{estimate.distanceKm} km · ~{estimate.estimatedTime}</span>
        </div>
      </div>

      {/* Fare & CTA Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
          {fareDisplay}
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
          <span>View Journey</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

export function PopularTaxiRoutesSection({ onSelectRoute }: PopularTaxiRoutesSectionProps) {
  return (
    <div className="relative py-12 sm:py-16 bg-slate-50/60 dark:bg-slate-950/40 border-t border-b border-slate-200/60 dark:border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <UniversalCarousel
          items={CURATED_POPULAR_ROUTES}
          visibleCards={{ mobile: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
          autoPlayInterval={8000}
          title="Popular Taxi Routes"
          subtitle="Easy ways to get around the hills"
          renderItem={(item) => (
            <PopularRouteCard 
              key={item.id} 
              item={item} 
              onSelectRoute={onSelectRoute} 
            />
          )}
        />
      </div>
    </div>
  );
}
