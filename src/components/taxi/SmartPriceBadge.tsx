import React from 'react';
import { SmartPriceIndicator } from '../../services/taxi/MarketReferenceFareEngine';
import { TrendingDown, CheckCircle2, Sparkles } from 'lucide-react';

interface SmartPriceBadgeProps {
  indicator: SmartPriceIndicator | null;
  size?: 'sm' | 'md';
  className?: string;
}

export const SmartPriceBadge: React.FC<SmartPriceBadgeProps> = ({
  indicator,
  size = 'md',
  className = ''
}) => {
  if (!indicator) return null;

  const isSmall = size === 'sm';

  switch (indicator) {
    case 'Below Market':
      return (
        <span
          title="Operator fare is lower than current Expected Fare"
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${
            isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <TrendingDown className={isSmall ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
          <span>Below Market</span>
        </span>
      );

    case 'Market Price':
      return (
        <span
          title="Operator fare is aligned with current Expected Fare"
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${
            isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <CheckCircle2 className={isSmall ? 'w-3 h-3 text-blue-600' : 'w-3.5 h-3.5 text-blue-600'} />
          <span>Market Price</span>
        </span>
      );

    case 'Premium':
      return (
        <span
          title="Operator fare is higher than current Expected Fare"
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${
            isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          <Sparkles className={isSmall ? 'w-3 h-3 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
          <span>Premium</span>
        </span>
      );

    default:
      return null;
  }
};
