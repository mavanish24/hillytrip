import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Check, 
  X, 
  Route, 
  MessageSquare, 
  Search, 
  MapPin, 
  Car, 
  User, 
  Phone
} from 'lucide-react';
import { TaxiOperatorProfile, OperatorFixedRoute, TaxiQuoteRequest } from '../../types/taxi';
import { useTaxiOperators, formatTaxiStand } from '../../services/taxi/taxiDataService';
import { FareQuoteVerificationPanel } from './FareQuoteVerificationPanel';

export default function AdminTaxiModule() {
  const [activeTab, setActiveTab] = useState<'operators' | 'routes' | 'quotes' | 'fare_quotes'>('fare_quotes');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const { operators: liveOperators } = useTaxiOperators();
  const [operators, setOperators] = useState<TaxiOperatorProfile[]>([]);

  useEffect(() => {
    if (liveOperators && liveOperators.length > 0) {
      setOperators(liveOperators);
    }
  }, [liveOperators]);

  const handleApprove = (id: string) => {
    setOperators(prev => prev.map(op => op.id === id ? { ...op, verification_status: 'approved' } : op));
  };

  const handleReject = (id: string) => {
    setOperators(prev => prev.map(op => op.id === id ? { ...op, verification_status: 'rejected' } : op));
  };

  const filteredOperators = operators.filter(op => {
    if (statusFilter === 'all') return true;
    return op.verification_status === statusFilter;
  });

  // Extract all fixed routes across operators
  const allFixedRoutes = operators.flatMap(op => 
    (op.fixedRoutes || []).map(r => ({ ...r, operator_name: op.business_name }))
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Taxi Network Administration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage operator approvals, view fixed route listings, and inspect quote requests.
          </p>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('fare_quotes')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'fare_quotes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Fare Quote Verification
          </button>
          <button
            onClick={() => setActiveTab('operators')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'operators'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Operators ({operators.length})
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === 'routes'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Fixed Routes ({allFixedRoutes.length})
          </button>
        </div>
      </div>

      {/* FARE QUOTES VERIFICATION TAB */}
      {activeTab === 'fare_quotes' && (
        <FareQuoteVerificationPanel />
      )}

      {/* OPERATORS TAB */}
      {activeTab === 'operators' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">Filter Status:</span>
            <div className="flex items-center gap-2">
              {(['all', 'approved', 'pending', 'rejected'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold uppercase transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOperators.map(op => (
              <div 
                key={op.id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">{op.business_name}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {(() => {
                        const owner = (op.owner_name || '').trim();
                        const hasOwner = Boolean(owner && owner.toLowerCase() !== 'null' && owner.toLowerCase() !== 'undefined');
                        return hasOwner ? `Owner: ${owner} • ` : '';
                      })()}
                      {op.phone}
                    </p>
                    {(() => {
                      const stand = formatTaxiStand(op.base_taxi_stand);
                      if (!stand) return null;
                      return <p className="text-xs text-slate-500 font-medium">Stand: {stand}</p>;
                    })()}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase ${
                    op.verification_status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  }`}>
                    {op.verification_status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <strong>Working Areas:</strong> {op.working_areas.join(', ')}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  {op.verification_status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(op.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Operator
                    </button>
                  )}
                  {op.verification_status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(op.id)}
                      className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FIXED ROUTES TAB */}
      {activeTab === 'routes' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allFixedRoutes.map(r => (
              <div key={r.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-500">{r.operator_name}</span>
                <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">{r.from_location} → {r.to_location}</h5>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>Private: ₹{r.private_starting_price}</span>
                  {r.shared_taxi_available && <span>Shared: ₹{r.shared_fare}/seat</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
