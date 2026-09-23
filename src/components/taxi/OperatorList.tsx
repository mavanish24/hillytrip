import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Star, Car, MessageSquare, ChevronRight, MapPin, 
  Building, Home, Briefcase, SlidersHorizontal 
} from 'lucide-react';
import { TaxiOperatorProfile, OwnerType } from '../../types/taxi';
import { SmartPriceBadge } from './SmartPriceBadge';
import { formatTaxiStand } from '../../services/taxi/taxiDataService';
import { 
  getSmartPriceIndicator, 
  calculateMarketReferenceFare, 
  rankOperators,
  MarketFareQuery 
} from '../../services/taxi/MarketReferenceFareEngine';

interface OperatorListProps {
  operators: TaxiOperatorProfile[];
  fromLocation: string;
  toLocation: string;
  journeyType?: 'shared' | 'reserved_one_way' | 'reserved_round_trip' | 'reserved';
  vehicleCategory?: string;
  hubs?: any[];
  onOpenFleet: (operator: TaxiOperatorProfile) => void;
  onOpenLeadModal: (operator: TaxiOperatorProfile) => void;
  onSelectOperator?: (operator: TaxiOperatorProfile) => void;
}

export const OperatorList: React.FC<OperatorListProps> = ({
  operators,
  fromLocation,
  toLocation,
  journeyType = 'reserved_one_way',
  vehicleCategory = 'Bolero',
  hubs = [],
  onOpenFleet,
  onOpenLeadModal,
  onSelectOperator
}) => {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);

  // Compute current market reference fare to evaluate Smart Price Indicator badges
  const marketQuery: MarketFareQuery = {
    fromTaxiStand: fromLocation,
    destination: toLocation,
    journeyType,
    vehicleCategory
  };

  const marketFareResult = useMemo(() => {
    return calculateMarketReferenceFare(marketQuery, operators);
  }, [fromLocation, toLocation, journeyType, vehicleCategory, operators]);

  // Dynamic Filtered & Multi-Factor Ranked Operators
  const filteredOperators = useMemo(() => {
    const list = operators.filter((op) => {
      // Verified Filter
      if (verifiedOnly && !op.is_verified) return false;

      // Owner Type Filter
      if (ownerTypeFilter !== 'all' && op.owner_type !== ownerTypeFilter) return false;

      // Rating Filter
      if (op.rating < minRating) return false;

      // Vehicle Category Filter
      if (selectedCategory !== 'all') {
        const hasCategory = op.fleet?.some((f) => 
          f.category_name.toLowerCase().includes(selectedCategory.toLowerCase())
        );
        if (!hasCategory) return false;
      }

      return true;
    });

    // Multi-factor ranking priority: Verified, Route match, Vehicle availability, Rating, Response/Acceptance Rate, Competitive Fare
    return rankOperators(list, fromLocation, toLocation, marketFareResult);
  }, [operators, verifiedOnly, ownerTypeFilter, minRating, selectedCategory, fromLocation, toLocation, marketFareResult]);

  const getOwnerTypeBadge = (type: OwnerType) => {
    switch (type) {
      case 'homestay_owner':
        return (
          <span className="bg-purple-500/10 border border-purple-500/20 text-purple-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
            <Home className="w-3 h-3" /> Homestay Partner
          </span>
        );
      case 'travel_agency':
        return (
          <span className="bg-sky-500/10 border border-sky-500/20 text-sky-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Travel Agency
          </span>
        );
      default:
        return (
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
            <Building className="w-3 h-3" /> Taxi Operator
          </span>
        );
    }
  };

  return (
    <div id="operators-section" className="space-y-4 pt-2">
      {/* Header & Filter Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Verified Local Taxi Operators</span>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {filteredOperators.length} Available
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare actual fares set by verified operators for <strong className="text-slate-700">{fromLocation || 'Pickup'}</strong> → <strong className="text-slate-700">{toLocation || 'Destination'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Filters</span>
          </div>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          {/* Vehicle Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {[
              { id: 'all', label: 'All Fleet' },
              { id: 'bolero', label: 'Bolero' },
              { id: 'ertiga', label: 'Ertiga' },
              { id: 'innova', label: 'Innova' },
              { id: 'traveller', label: 'Traveller' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Verified Only Toggle */}
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
              verifiedOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Only</span>
          </button>

          {/* Partner Category Filter */}
          <select
            value={ownerTypeFilter}
            onChange={(e) => setOwnerTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Partner Types</option>
            <option value="taxi_operator">Taxi Operators</option>
            <option value="homestay_owner">Homestay Partners</option>
            <option value="travel_agency">Travel Agencies</option>
          </select>

          {/* Rating Filter */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value={0}>Any Rating</option>
            <option value={4.5}>4.5★ &amp; Above</option>
            <option value={4.8}>4.8★ Top Rated</option>
          </select>
        </div>
      </div>

      {/* Operator Cards Grid */}
      {filteredOperators.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
            <Car className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">No Operators Match Active Filters</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your vehicle category or rating filters to view all available verified drivers serving this route.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setVerifiedOnly(false);
              setOwnerTypeFilter('all');
              setMinRating(0);
            }}
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOperators.map((operator) => {
            // Find specific operator fare match details from market engine calculation
            const opFareDetail = marketFareResult.operatorFares.find(
              (f) => f.operatorId === operator.id || f.businessName === operator.business_name
            );

            // Actual fare set by this operator
            let actualFare = opFareDetail?.actualFare;
            if (!actualFare) {
              const routeMatch = operator.fixedRoutes?.find((r) => r.from_location.includes(fromLocation) || r.to_location.includes(toLocation));
              actualFare = routeMatch?.private_starting_price || undefined;
            }

            // Smart price indicator badge
            const indicator = actualFare && opFareDetail?.smartPriceIndicator ? opFareDetail.smartPriceIndicator : 
              (actualFare && marketFareResult.available ? getSmartPriceIndicator(actualFare, marketFareResult.referenceFare) : null);

            const handleProfileClick = () => {
              if (onSelectOperator) {
                onSelectOperator(operator);
              } else {
                window.location.hash = `#/taxi/operator/${operator.id}`;
              }
            };

            return (
              <div
                key={operator.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3 cursor-pointer" onClick={handleProfileClick}>
                  {/* Top Row: Logo, Name, Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={operator.logo_url || '/images/hillytrip/taxi-transit.svg'}
                        alt={operator.business_name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition">{operator.business_name}</h4>
                          {operator.is_verified && (
                            <span className="text-emerald-600 font-bold text-xs flex items-center gap-0.5" title="HillyTrip Verified Operator">
                              <ShieldCheck className="w-4 h-4 fill-emerald-100" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getOwnerTypeBadge(operator.owner_type)}
                          {(() => {
                            const owner = (operator.owner_name || '').trim();
                            if (!owner || owner.toLowerCase() === 'null' || owner.toLowerCase() === 'undefined') return null;
                            return (
                              <span className="text-xs text-slate-500">
                                Owner: <strong className="text-slate-700">{owner}</strong>
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl text-center shrink-0">
                      <span className="font-extrabold text-amber-800 text-sm flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {operator.rating || 5.0}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-bold">({operator.reviews_count || 12} reviews)</span>
                    </div>
                  </div>

                  {/* Fare & Smart Price Badge Section */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Operator Actual Fare
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-black text-slate-900">
                          {actualFare ? `₹${actualFare.toLocaleString('en-IN')}` : 'Fare not available'}
                        </span>
                        {actualFare && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {journeyType === 'shared' ? 'per seat' : 'reserved fare'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Smart Price Indicator Badge */}
                    <SmartPriceBadge indicator={indicator} />
                  </div>

                  {/* Base Stand & Service Areas */}
                  {(() => {
                    const standDisplay = formatTaxiStand(operator.base_taxi_stand, hubs);
                    if (!standDisplay) return null;
                    return (
                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Stand: <strong className="text-slate-900">{standDisplay}</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Fleet Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Fleet:</span>
                    {(operator.fleet || []).map((f, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 font-semibold text-[11px] px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                        {f.category_name} ({f.vehicle_count})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onOpenFleet(operator)}
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5 text-slate-600" />
                    <span>View Fleet</span>
                  </button>

                  <button
                    onClick={() => onOpenLeadModal(operator)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="In-App Messaging"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenLeadModal(operator)}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{actualFare ? `Book @ ₹${actualFare.toLocaleString('en-IN')}` : 'Request Quote'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
