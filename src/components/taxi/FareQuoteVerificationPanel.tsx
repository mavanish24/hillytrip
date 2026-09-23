import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, Clock, RefreshCw, Filter, Tag, Calendar, Car } from 'lucide-react';
import { OperatorFareQuote } from '../../types_taxi';

export const FareQuoteVerificationPanel: React.FC = () => {
  const [quotes, setQuotes] = useState<OperatorFareQuote[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = statusFilter === 'pending'
        ? '/api/admin/operator-fares/pending'
        : '/api/operator-fares/my-quotes'; // or fetch all quotes
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch fare quotes');
      const data = await res.json();
      setQuotes(data.quotes || []);
    } catch (err: any) {
      setError(err.message || 'Error loading fare quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  const handleVerify = async (quoteId: string, action: 'approve' | 'reject' | 'expire') => {
    setActioningId(quoteId);
    try {
      const res = await fetch('/api/admin/operator-fares/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId,
          action,
          adminId: 'admin_dashboard'
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to process action');
      }
      await fetchQuotes();
    } catch (err: any) {
      alert(err.message || 'Error updating quote status');
    } finally {
      setActioningId(null);
    }
  };

  const filteredQuotes = quotes.filter(q => {
    if (statusFilter === 'all') return true;
    return q.status === statusFilter;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Operator Fare Quote Verification
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Review and verify submitted taxi operator fare quotes for public marketplace publication.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchQuotes}
            disabled={loading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-mono font-bold text-slate-400 mr-2">Status:</span>
        {(['pending', 'verified', 'rejected', 'all'] as const).map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black uppercase transition cursor-pointer ${
              statusFilter === st
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-semibold border border-rose-200 dark:border-rose-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-mono">
          Loading fare quotes...
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          No {statusFilter !== 'all' ? statusFilter : ''} fare quotes found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuotes.map(q => (
            <div
              key={q.id}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {q.business_name || q.operator_name || 'Taxi Operator'}
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {q.from_entity_id} → {q.to_entity_id}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Entity Types: {q.from_entity_type} → {q.to_entity_type}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                    q.status === 'verified'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : q.status === 'pending'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}
                >
                  {q.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Service & Vehicle</div>
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
                    {q.service_type === 'shared_taxi' ? 'Shared Taxi' : 'Reserved Car'}
                  </div>
                  <div className="text-slate-500 font-medium text-[11px] mt-0.5">{q.vehicle_category}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Quoted Fare</div>
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm">
                    ₹{q.fare_min.toLocaleString('en-IN')} {q.fare_max > q.fare_min ? `– ₹${q.fare_max.toLocaleString('en-IN')}` : ''}
                  </div>
                  <div className="text-slate-500 font-medium text-[11px] mt-0.5">/ {q.fare_unit === 'per_seat' ? 'seat' : 'vehicle'}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Submitted: {new Date(q.created_at).toLocaleDateString('en-IN')}
                </div>
                {q.verified_at && (
                  <div className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified by {q.verified_by || 'Admin'}
                  </div>
                )}
              </div>

              {q.status === 'pending' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    onClick={() => handleVerify(q.id, 'approve')}
                    disabled={actioningId === q.id}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Approve Fare Quote
                  </button>
                  <button
                    onClick={() => handleVerify(q.id, 'reject')}
                    disabled={actioningId === q.id}
                    className="py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
