import React, { useState } from 'react';
import { 
  Radio, Plus, ThumbsUp, AlertTriangle, CheckCircle2, XCircle, 
  MapPin, Clock, Search, ShieldAlert, HeartHandshake, User, RefreshCw
} from 'lucide-react';
import { Hub } from '../types';

interface BulletinReport {
  id: string;
  hubName: string;
  location: string;
  status: 'clear' | 'caution' | 'blocked';
  condition: string;
  reportedBy: string;
  votes: number;
  createdAt: string;
}

interface LiveTransitBulletinProps {
  hubs: Hub[];
  reports: BulletinReport[];
  onAddReport: (report: BulletinReport) => void;
  onUpvoteReport: (id: string) => void;
  setNotification: (notif: { type: 'success' | 'error'; message: string }) => void;
  isOffline: boolean;
}

export default function LiveTransitBulletin({
  hubs,
  reports,
  onAddReport,
  onUpvoteReport,
  setNotification,
  isOffline
}: LiveTransitBulletinProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHub, setSelectedHub] = useState('');
  const [preciseSegment, setPreciseSegment] = useState('');
  const [status, setStatus] = useState<'clear' | 'caution' | 'blocked'>('caution');
  const [conditions, setConditions] = useState('');
  const [authorName, setAuthorName] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'clear' | 'caution' | 'blocked'>('all');

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHub) {
      setNotification({ type: 'error', message: 'Pick an active Mountain Hub to anchor the road report.' });
      return;
    }
    if (!conditions.trim()) {
      setNotification({ type: 'error', message: 'Enter detailed conditions so other drivers are informed.' });
      return;
    }

    const newReport: BulletinReport = {
      id: 'report-' + Math.random().toString(36).substring(2, 9),
      hubName: selectedHub,
      location: preciseSegment.trim() || 'General Hub Vicinity',
      status,
      condition: conditions.trim(),
      reportedBy: authorName.trim() || 'Anonymous Mountain Scout',
      votes: 1,
      createdAt: new Date().toISOString()
    };

    onAddReport(newReport);
    setNotification({
      type: 'success',
      message: '🚨 Community transit report submitted! Displayed dynamically in alerts feeds.'
    });

    // Reset Form
    setSelectedHub('');
    setPreciseSegment('');
    setConditions('');
    setAuthorName('');
    setShowAddForm(false);
  };

  const getStatusBadge = (s: 'clear' | 'caution' | 'blocked') => {
    switch (s) {
      case 'clear':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider font-mono">
            <CheckCircle2 className="w-3 h-3" /> clear passable
          </span>
        );
      case 'caution':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider font-mono">
            <AlertTriangle className="w-3 h-3 animate-pulse" /> cautious single lane
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider font-mono">
            <XCircle className="w-3 h-3" /> totally blocked
          </span>
        );
    }
  };

  // Filter and Search logic
  const filteredReports = reports.filter(r => {
    // Hub Name Matching
    const hubMatch = r.hubName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     r.condition.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status Filter Matching
    const statusMatch = statusFilter === 'all' || r.status === statusFilter;

    return hubMatch && statusMatch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-800 dark:text-slate-100">
      
      {/* Top Header Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
              <Radio className="w-7 h-7 text-amber-500 animate-pulse" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 mb-2 uppercase tracking-wider font-mono">
                P2P Mountain Safety Feeds
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Live Community Road & Safety Board
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Mountain weather triggers mudslides and closures within minutes. Check live community logs posted by travelers, local homestay hosts, and commercial taxi drivers.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs font-mono uppercase rounded-xl transition shadow-md shadow-amber-600/10 flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            File Live Transit Update
          </button>
        </div>
      </div>

      {/* Add Transit Alert Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl p-6 mb-8 shadow-md text-left animate-fade-in">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            Report Road Segment Viability State
          </h3>

          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Anchor Hub *</label>
                <select
                  required
                  value={selectedHub}
                  onChange={(e) => setSelectedHub(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white select-none cursor-pointer"
                >
                  <option value="">-- Choose Nearest Village --</option>
                  {hubs.map(h => (
                    <option key={`report-hub-sel-${h.id}`} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Precise Road Segment / Milestone</label>
                <input
                  type="text"
                  value={preciseSegment}
                  onChange={(e) => setPreciseSegment(e.target.value)}
                  placeholder="e.g. 3km after Jhepi on the way to Rimbik, near forest checkpoint"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 block mb-2">Road Traffic Passability State *</label>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStatus('clear')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition border cursor-pointer ${
                      status === 'clear'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40 outline outline-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    PASSABLE CLEAR
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('caution')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition border cursor-pointer ${
                      status === 'caution'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/40 outline outline-amber-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-805 text-slate-400'
                    }`}
                  >
                    CAUTIOUS SLOW
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('blocked')}
                    className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition border cursor-pointer ${
                      status === 'blocked'
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/40 outline outline-rose-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-202 dark:border-slate-802 text-slate-400'
                    }`}
                  >
                    CLOSED / BLOCKED
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Your Name / Driver Badge</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Driver Tenzing G. or Homestay Host sitting"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Detailed Road Conditions Description *</label>
              <textarea
                required
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                rows={3}
                placeholder="Describe current status. Include if JCB machine has arrived, bypass routes available, or weather forecasts on that mountain corner."
                className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-850 dark:text-slate-100 font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs font-mono uppercase tracking-wider py-3.5 rounded-xl cursor-pointer"
            >
              🚀 Broadcast Report to Regional Networks
            </button>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch justify-between mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-3.5 rounded-2xl">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-450 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by village hub or keyword (mudslide, Ghoom)..."
            className="w-full bg-white dark:bg-slate-950 p-2.5 pl-10 rounded-xl text-xs border border-transparent hover:border-slate-350 dark:hover:border-slate-750 text-slate-800 dark:text-slate-100 font-medium"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'clear', 'caution', 'blocked'].map((filterTag) => (
            <button
              key={`filter-${filterTag}`}
              onClick={() => setStatusFilter(filterTag as any)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition cursor-pointer select-none ${
                statusFilter === filterTag
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-950 text-slate-505 dark:text-slate-400 border-slate-200 dark:border-slate-850 hover:bg-slate-50'
              }`}
            >
              {filterTag}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Feeds List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-850 shadow-sm text-slate-500">
            <Radio className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-700 dark:text-slate-300">Clean Slate: No Condition Reports Match</h4>
            <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">
              There are no safety or delays reported in this segment. Always travel safely with extra spare time when heading over high ridges!
            </p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const associatedHub = hubs.find(h => h.id === report.hubName);
            return (
              <div 
                key={report.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-2xl p-5 shadow-sm text-left relative flex flex-col md:flex-row justify-between gap-5 transition hover:shadow-md"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(report.status)}
                    <span className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {associatedHub?.name || report.hubName.toUpperCase()}
                    </span>
                    <span className="text-slate-350 text-xs select-none">•</span>
                    <span className="text-[10px] text-slate-405 font-medium flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(report.createdAt).toLocaleDateString()})
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-850 dark:text-white leading-snug">
                    Segment milestone: <strong className="text-sky-500 font-sans">{report.location}</strong>
                  </h3>

                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-105 dark:border-slate-855 font-medium">
                    {report.condition}
                  </p>

                  <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-850/60 pt-2 text-[10px] font-mono text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span>Reported by: <strong className="text-rose-500">{report.reportedBy}</strong></span>
                  </div>
                </div>

                {/* Vote / Verification module */}
                <div className="flex flex-row md:flex-col items-center justify-between md:justify-center p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl shrink-0 gap-3">
                  <div className="text-left md:text-center shrink-0">
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block font-mono">Verified Score</span>
                    <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-100">{report.votes} confirm reports</span>
                  </div>

                  <button
                    onClick={() => {
                      onUpvoteReport(report.id);
                      setNotification({ type: 'success', message: 'Verification recorded. Thanks for contributing!' });
                    }}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-955/20 hover:text-amber-600 text-slate-600 dark:text-slate-300 hover:border-amber-500/40 border border-slate-205 dark:border-slate-800 rounded-lg text-[10px] font-black uppercase transition-all duration-150 flex items-center gap-1 shadow-3xs cursor-pointer select-none shrink-0"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Verify Alert
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
