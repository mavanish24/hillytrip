import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Briefcase, Car, ChevronRight, AlertCircle, RefreshCw, MessageSquare, Sparkles } from 'lucide-react';
import { User } from '../types';

interface MyQuoteRequestsPageProps {
  navigate: (path: string) => void;
  user?: User | null;
}

export default function MyQuoteRequestsPage({
  navigate,
  user
}: MyQuoteRequestsPageProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a fallback guest identifier if user is not logged in to let them demo the feature
  const travellerId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('hillytrip_guest_id') : null) || 'guest_traveller';

  const fetchRequests = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch(`/api/quote-requests?travellerId=${travellerId}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve quote history.');
      }
      const data = await response.json();
      if (data.success && data.data) {
        setRequests(data.data);
      }
    } catch (err: any) {
      console.error('[MyQuoteRequests] Fetch failed:', err);
      setError(err.message || 'Could not load your history.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Store traveler's guest ID if they are demoing
    if (!user?.id && travellerId !== 'guest_traveller') {
      localStorage.setItem('hillytrip_guest_id', travellerId);
    }
    fetchRequests(true);
  }, [user, travellerId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-white bg-[#030d07] min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">Retrieving historic quote logs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030d07] text-white py-12 px-4 select-none">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate('#/routes')}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 font-mono uppercase tracking-widest transition cursor-pointer mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Discovery</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xl">📋</span>
              <h1 className="text-2xl font-black uppercase tracking-wider text-white">My Quotation Requests</h1>
            </div>
            <p className="text-slate-400 text-xs">
              Monitor, track, and accept live custom quotations from verified HillyTrip taxi operators.
            </p>
          </div>

          <button
            onClick={() => fetchRequests(true)}
            className="px-4 py-2 bg-slate-950 border border-slate-900 hover:border-emerald-500/25 rounded-xl text-xs font-mono text-slate-300 hover:text-emerald-400 transition cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live Status</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/20 px-4 py-3 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-[#05120c] border border-emerald-500/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/5 rounded-full flex items-center justify-center border border-emerald-500/10">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-2 max-w-md">
              <p className="font-bold text-white uppercase text-sm tracking-wider">No Quotation Requests Sent</p>
              <p className="text-slate-400 text-xs leading-normal">
                You haven't requested any custom operator quotations yet. Explore any route detail page and click "Get Live Quotes from Operators" inside the Reserved Taxi tab to begin!
              </p>
            </div>
            <button
              onClick={() => navigate('#/routes')}
              className="mt-4 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-widest uppercase rounded-xl transition duration-150 cursor-pointer shadow-md"
            >
              Explore Transit Routes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isCancelled = req.request_status === 'cancelled';
              const isExpired = req.isExpired;
              
              let statusBadge = (
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold">
                  Active Broadcast
                </span>
              );

              if (isCancelled) {
                statusBadge = (
                  <span className="bg-slate-950 border border-slate-900 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider">
                    Cancelled
                  </span>
                );
              } else if (isExpired) {
                statusBadge = (
                  <span className="bg-rose-950/20 border border-rose-500/15 text-rose-400 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider">
                    Expired
                  </span>
                );
              }

              return (
                <div 
                  key={req.id}
                  onClick={() => navigate(`#/quote-request-status/${req.id}`)}
                  className="bg-[#05120c] border border-emerald-500/10 hover:border-emerald-500/25 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition cursor-pointer hover:translate-y-[-1px] duration-150"
                >
                  <div className="space-y-4 flex-1">
                    {/* Status & Metadata */}
                    <div className="flex flex-wrap items-center gap-3">
                      {statusBadge}
                      <span className="text-[11px] text-slate-500 font-mono">ID: {req.id.substring(0, 8)}...</span>
                    </div>

                    {/* Path Routing display */}
                    <div className="flex items-center gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">ROUTE PATTERN</p>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-black text-white uppercase tracking-wide">{req.pickup_location}</span>
                          <span className="text-emerald-400 font-mono">➜</span>
                          <span className="text-sm font-black text-white uppercase tracking-wide">{req.drop_location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{req.travel_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{req.pickup_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{req.passenger_count} Pax</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{req.vehicle_preference}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quotes Count & Action */}
                  <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center border-t border-slate-950 md:border-t-0 pt-4 md:pt-0 shrink-0 gap-4">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest">OFFERS RECEIVED</p>
                      <div className="flex items-center gap-1.5 md:justify-end mt-1">
                        <span className="text-2xl font-black font-mono text-emerald-400">{req.quoteCount || 0}</span>
                        <span className="text-xs text-slate-500">Quotes</span>
                      </div>
                    </div>

                    <button className="flex items-center gap-1 py-1.5 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer">
                      <span>View Bids</span>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
