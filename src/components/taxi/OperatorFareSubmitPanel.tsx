import React, { useState, useEffect } from 'react';
import { Send, Clock, CheckCircle2, AlertCircle, RefreshCw, Plus, Tag, ShieldAlert } from 'lucide-react';
import { OperatorFareQuote } from '../../types_taxi';

interface OperatorFareSubmitPanelProps {
  operatorId?: string;
  operatorName?: string;
  businessName?: string;
}

export const OperatorFareSubmitPanel: React.FC<OperatorFareSubmitPanelProps> = ({
  operatorId = 'op-default',
  operatorName = 'Local Operator',
  businessName = 'HillyTrip Taxi Partner'
}) => {
  const [fromEntityId, setFromEntityId] = useState('');
  const [fromEntityType, setFromEntityType] = useState<'taxi_stand' | 'destination' | 'attraction'>('taxi_stand');
  const [toEntityId, setToEntityId] = useState('');
  const [toEntityType, setToEntityType] = useState<'taxi_stand' | 'destination' | 'attraction'>('destination');
  const [serviceType, setServiceType] = useState<'shared_taxi' | 'reserved_car'>('reserved_car');
  const [vehicleCategory, setVehicleCategory] = useState('Bolero / Standard SUV');
  const [fareMin, setFareMin] = useState<number | ''>('');
  const [fareMax, setFareMax] = useState<number | ''>('');
  const [fareUnit, setFareUnit] = useState<'per_seat' | 'per_vehicle'>('per_vehicle');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [effectiveTo, setEffectiveTo] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [myQuotes, setMyQuotes] = useState<OperatorFareQuote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const fetchMyQuotes = async () => {
    setLoadingQuotes(true);
    try {
      const res = await fetch(`/api/operator-fares/my-quotes?operator_id=${encodeURIComponent(operatorId)}`);
      if (res.ok) {
        const data = await res.json();
        setMyQuotes(data.quotes || []);
      }
    } catch (err) {
      console.error('Failed to load operator quotes', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    fetchMyQuotes();
  }, [operatorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!fromEntityId.trim() || !toEntityId.trim()) {
      setSubmitError('Origin and destination entities are required.');
      return;
    }

    const minNum = Number(fareMin);
    const maxNum = Number(fareMax);

    if (isNaN(minNum) || isNaN(maxNum) || minNum <= 0 || maxNum < minNum) {
      setSubmitError('Fare min must be > 0 and Fare max must be >= Fare min.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/operator-fares/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: operatorId,
          operator_name: operatorName,
          business_name: businessName,
          from_entity_id: fromEntityId.trim(),
          from_entity_type: fromEntityType,
          to_entity_id: toEntityId.trim(),
          to_entity_type: toEntityType,
          service_type: serviceType,
          vehicle_category: vehicleCategory,
          fare_min: minNum,
          fare_max: maxNum,
          fare_unit: fareUnit,
          effective_from: effectiveFrom,
          effective_to: effectiveTo || null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quote.');
      }

      setSubmitSuccess('Submitted — Under Admin Review');
      setFromEntityId('');
      setToEntityId('');
      setFareMin('');
      setFareMax('');
      await fetchMyQuotes();
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting fare quote.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto set fare_unit when serviceType changes
  const handleServiceTypeChange = (st: 'shared_taxi' | 'reserved_car') => {
    setServiceType(st);
    if (st === 'shared_taxi') {
      setFareUnit('per_seat');
    } else {
      setFareUnit('per_vehicle');
    }
  };

  return (
    <div className="space-y-8">
      {/* SUBMISSION FORM CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              Submit Operator Fare Quote
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Publish actual operational fares for routes in your service network. Submitted quotes require admin verification before public display.
            </p>
          </div>
        </div>

        {submitSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-2xl text-xs font-bold border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {submitError && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-2xl text-xs font-bold border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ORIGIN ENTITY */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Origin Entity
              </label>
              <div className="flex gap-2">
                <select
                  value={fromEntityType}
                  onChange={(e) => setFromEntityType(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="taxi_stand">Taxi Stand</option>
                  <option value="destination">Destination</option>
                  <option value="attraction">Attraction</option>
                </select>
                <input
                  type="text"
                  placeholder="e.g., NJP Railway Station"
                  value={fromEntityId}
                  onChange={(e) => setFromEntityId(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                  required
                />
              </div>
            </div>

            {/* DESTINATION ENTITY */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Destination Entity
              </label>
              <div className="flex gap-2">
                <select
                  value={toEntityType}
                  onChange={(e) => setToEntityType(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="destination">Destination</option>
                  <option value="taxi_stand">Taxi Stand</option>
                  <option value="attraction">Attraction</option>
                </select>
                <input
                  type="text"
                  placeholder="e.g., Darjeeling Clock Tower"
                  value={toEntityId}
                  onChange={(e) => setToEntityId(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400"
                  required
                />
              </div>
            </div>

            {/* SERVICE TYPE */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Service Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleServiceTypeChange('reserved_car')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    serviceType === 'reserved_car'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Reserved Car
                </button>
                <button
                  type="button"
                  onClick={() => handleServiceTypeChange('shared_taxi')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    serviceType === 'shared_taxi'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Shared Taxi
                </button>
              </div>
            </div>

            {/* VEHICLE CATEGORY */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Vehicle Category
              </label>
              <select
                value={vehicleCategory}
                onChange={(e) => setVehicleCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="Bolero / Standard SUV">Bolero / Standard SUV</option>
                <option value="Innova / Luxury SUV">Innova / Luxury SUV</option>
                <option value="Ertiga / MUV">Ertiga / MUV</option>
                <option value="Alto / Hatchback">Alto / Hatchback</option>
                <option value="Traveller / Minibus">Traveller / Minibus</option>
              </select>
            </div>

            {/* FARE MIN */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Fare Min (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={fareMin}
                onChange={(e) => setFareMin(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                required
                min={1}
              />
            </div>

            {/* FARE MAX */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Fare Max (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 3500"
                value={fareMax}
                onChange={(e) => setFareMax(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                required
                min={1}
              />
            </div>

            {/* FARE UNIT */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Fare Unit
              </label>
              <select
                value={fareUnit}
                onChange={(e) => setFareUnit(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="per_vehicle">per_vehicle</option>
                <option value="per_seat">per_seat</option>
              </select>
            </div>

            {/* EFFECTIVE FROM */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Effective From
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Quote...' : 'Submit Fare Quote for Review'}
            </button>
          </div>
        </form>
      </div>

      {/* SUBMITTED QUOTES LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
            My Submitted Fare Quotes
          </h4>
          <button
            onClick={fetchMyQuotes}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loadingQuotes ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {myQuotes.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            You haven't submitted any fare quotes yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myQuotes.map((q) => (
              <div
                key={q.id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {q.from_entity_id} → {q.to_entity_id}
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5 capitalize">
                      {q.service_type === 'shared_taxi' ? 'Shared Taxi' : 'Reserved Car'} • {q.vehicle_category}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase ${
                      q.status === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : q.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}
                  >
                    {q.status === 'pending' ? 'Under Review' : q.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 pt-1">
                  <div>
                    Fare: <span className="text-emerald-600 font-black">₹{q.fare_min} – ₹{q.fare_max}</span> / {q.fare_unit === 'per_seat' ? 'seat' : 'vehicle'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(q.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
