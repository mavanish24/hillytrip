import React, { useState } from 'react';
import { 
  MarketFareResult, 
  JourneyTypeOption, 
  MarketFareQuery,
  calculateMarketReferenceFare
} from '../../services/taxi/MarketReferenceFareEngine';
import { ShieldCheck, Info, Scale } from 'lucide-react';

interface MarketReferenceFareCardProps {
  fromLocation: string;
  toLocation: string;
  initialJourneyType?: JourneyTypeOption;
  initialVehicleCategory?: string;
  operators?: any[];
  onDimensionChange?: (query: MarketFareQuery) => void;
  compact?: boolean;
}

export const MarketReferenceFareCard: React.FC<MarketReferenceFareCardProps> = ({
  fromLocation,
  toLocation,
  initialJourneyType = 'reserved_one_way',
  initialVehicleCategory = 'Bolero',
  operators = [],
  onDimensionChange,
  compact = false
}) => {
  const [journeyType, setJourneyType] = useState<JourneyTypeOption>(initialJourneyType);
  const [vehicleCategory, setVehicleCategory] = useState<string>(initialVehicleCategory);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const safeOperators = Array.isArray(operators)
    ? operators
    : (operators && typeof operators === 'object' && Array.isArray((operators as any).data))
      ? (operators as any).data
      : (operators && typeof operators === 'object' && Array.isArray((operators as any).operators))
        ? (operators as any).operators
        : [];

  // Execute Market Reference Engine calculation
  const query: MarketFareQuery = {
    fromTaxiStand: fromLocation,
    destination: toLocation,
    journeyType,
    vehicleCategory
  };

  const marketFareResult: MarketFareResult = calculateMarketReferenceFare(query, safeOperators);

  const handleJourneyChange = (jt: JourneyTypeOption) => {
    setJourneyType(jt);
    if (onDimensionChange) {
      onDimensionChange({
        fromTaxiStand: fromLocation,
        destination: toLocation,
        journeyType: jt,
        vehicleCategory
      });
    }
  };

  const handleCategoryChange = (vc: string) => {
    setVehicleCategory(vc);
    if (onDimensionChange) {
      onDimensionChange({
        fromTaxiStand: fromLocation,
        destination: toLocation,
        journeyType,
        vehicleCategory: vc
      });
    }
  };

  const isState1 = marketFareResult.verifiedOperatorCount === 0;
  const isState2 = marketFareResult.verifiedOperatorCount > 0 && (!marketFareResult.available || marketFareResult.referenceFare === null);
  const isState3 = marketFareResult.available && marketFareResult.referenceFare !== null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 md:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Expected Fare
              </h3>
              <button
                onClick={() => setShowInfoModal(true)}
                className="p-1 text-slate-400 hover:text-amber-600 transition-colors rounded-full hover:bg-amber-50 cursor-pointer"
                title="Expected Fare Information"
                aria-label="Expected Fare Information"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Route fare guidance for {fromLocation} → {toLocation}
            </p>
          </div>
        </div>
      </div>

      {/* Dimension Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* Journey Type Tabs */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Journey Type
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 text-xs">
            <button
              onClick={() => handleJourneyChange('shared')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                journeyType === 'shared'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shared
            </button>
            <button
              onClick={() => handleJourneyChange('reserved_one_way')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                journeyType === 'reserved_one_way' || journeyType === 'reserved'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reserved One Way
            </button>
            <button
              onClick={() => handleJourneyChange('reserved_round_trip')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                journeyType === 'reserved_round_trip'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Round Trip
            </button>
          </div>
        </div>

        {/* Vehicle Category Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Vehicle Category
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {['Bolero', 'Ertiga', 'Innova', 'Traveller', 'All Vehicles'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`py-1.5 px-3 rounded-xl border whitespace-nowrap font-medium transition-all cursor-pointer ${
                  vehicleCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Reference Value Box */}
      <div className="mt-5 p-4.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {isState3 && marketFareResult.referenceFare !== null && (
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Expected Fare
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ₹{marketFareResult.referenceFare.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {journeyType === 'shared' ? 'per seat' : 'per vehicle'}
              </span>
              <button
                onClick={() => setShowInfoModal(true)}
                className="p-1 text-slate-400 hover:text-amber-600 transition-colors rounded-full hover:bg-amber-50 cursor-pointer inline-flex items-center"
                title="Expected Fare Information"
                aria-label="Expected Fare Information"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1.5">
              Most verified operators charge around this price.
            </p>
          </div>
        )}

        {isState1 && (
          <div className="py-1">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Expected Fare
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Expected Fare is not available yet.
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-lg leading-relaxed">
              We're currently verifying local taxi operators for this route. Once verified operators publish their fares, an expected fare will automatically appear here.
            </p>
          </div>
        )}

        {isState2 && (
          <div className="py-1">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Expected Fare
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Collecting more verified fares.
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-lg leading-relaxed">
              We're gathering fare information from verified taxi operators. The expected fare will appear once enough verified fares are available.
            </p>
          </div>
        )}

        {/* Informational Disclaimer Badge */}
        <div className="sm:max-w-xs text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 shrink-0">
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Marketplace Guarantee</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            Your final booking price will always be the operator's quoted fare below.
          </p>
        </div>
      </div>

      {/* Info Tooltip / Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Expected Fare Information
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2 cursor-pointer"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/60 border border-amber-100 p-4 rounded-xl font-medium">
              This is an estimated market price based on fares from verified taxi operators. Operators set their own prices independently. Your final booking price will always be the operator's quoted fare.
            </p>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowInfoModal(false)}
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


