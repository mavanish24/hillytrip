import React from 'react';
import { 
  MarketFareResult, 
  MarketFareQuery, 
  calculateMarketReferenceFare 
} from '../../services/taxi/MarketReferenceFareEngine';
import { Scale, CheckCircle2, Info, AlertCircle } from 'lucide-react';

interface OperatorFareGuidanceBannerProps {
  fromTaxiStand: string;
  destination: string;
  journeyType: 'shared' | 'reserved_one_way' | 'reserved_round_trip' | 'reserved';
  vehicleCategory?: string;
  currentOperatorFare?: number | string;
  operators?: any[];
  className?: string;
}

export const OperatorFareGuidanceBanner: React.FC<OperatorFareGuidanceBannerProps> = ({
  fromTaxiStand,
  destination,
  journeyType,
  vehicleCategory = 'Bolero',
  currentOperatorFare,
  operators = [],
  className = ''
}) => {
  const query: MarketFareQuery = {
    fromTaxiStand,
    destination,
    journeyType,
    vehicleCategory
  };

  const result: MarketFareResult = calculateMarketReferenceFare(query, operators);

  const numFare = Number(currentOperatorFare) || 0;

  return (
    <div className={`bg-gradient-to-r from-sky-50 via-white to-sky-50/50 rounded-2xl border border-sky-200/80 p-4 md:p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-xl shrink-0 mt-0.5">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-sky-700 block">
              Market Pricing Guidance
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              Current Market Reference Fare
            </h4>

            {result.available && result.referenceFare ? (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900">
                  ₹{result.referenceFare.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500">
                  Based on <strong>{result.verifiedOperatorCount} verified operators</strong>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                  Confidence: {result.confidenceLevel}
                </span>
              </div>
            ) : (
              <div className="text-xs font-semibold text-amber-800 mt-1">
                Market Reference Fare is not available yet (Requires at least 5 verified operators).
              </div>
            )}
          </div>
        </div>

        {/* Live preview badge of entered fare */}
        {numFare > 0 && result.available && result.referenceFare && (
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 text-center shrink-0">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Your Entered Fare</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">₹{numFare.toLocaleString('en-IN')}</div>
            <div className="mt-1">
              {numFare < result.referenceFare * 0.93 ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Below Market (-{Math.round((1 - numFare / result.referenceFare) * 100)}%)
                </span>
              ) : numFare > result.referenceFare * 1.07 ? (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Premium (+{Math.round((numFare / result.referenceFare - 1) * 100)}%)
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Market Price (Aligned)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Strict Marketplace Freedom Mandate for Operators */}
      <div className="mt-3.5 pt-3 border-t border-sky-200/60 flex items-center gap-2 text-xs text-slate-600">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Operator Freedom:</strong> You may enter a <em>Higher</em>, <em>Lower</em>, or <em>Equal</em> fare. HillyTrip never blocks or automatically modifies operator pricing.
        </span>
      </div>
    </div>
  );
};
