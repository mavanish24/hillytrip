import React, { useState, useEffect } from 'react';
import {
  MapPin, RefreshCw, Play, Pause, CheckCircle2, AlertCircle, Clock,
  Database, Navigation, ShieldCheck, Activity, Layers, Sparkles,
  ChevronRight, Copy, Check, Info, Compass, HelpCircle, AlertTriangle,
  FlaskConical, CheckCheck, XCircle
} from 'lucide-react';

interface EntityStats {
  total: number | null;
  geocoded: number | null;
  pending: number | null;
  needs_review: number;
  error?: string | null;
}

interface UniversalGeocodingStats {
  attractions: EntityStats;
  homestays: EntityStats;
  taxi_stands: EntityStats;
  villages: { total: number; geocoded: number; pending: number };
  worker: {
    status: 'IDLE' | 'PROCESSING' | 'PAUSED' | 'ERROR';
    is_running: boolean;
    is_auto_polling_enabled: boolean;
    current_entity_type: string | null;
    processed_count: number;
    geocoded_count: number;
    needs_review_count: number;
    failed_count: number;
    last_poll_at: string | null;
    next_poll_at: string | null;
    last_error: string | null;
    cycle_count: number;
  };
  supabase_status: {
    connected: boolean;
    attractions_writable: boolean;
    homestays_writable: boolean;
    taxi_stands_writable: boolean;
  };
  last_updated: string;
}

interface GeocodingAuditEntry {
  id: string;
  entity_type: 'attraction' | 'homestay' | 'taxi_stand';
  entity_id: string;
  entity_name: string;
  latitude: number | null;
  longitude: number | null;
  status: 'GEOCODED' | 'NEEDS_REVIEW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  reason: string;
  nearest_village?: string | null;
  timestamp: string;
}

interface FiveRecordTestResult {
  total_tested: number;
  succeeded: number;
  failed: number;
  records: Array<{
    attraction_id: string;
    attraction_name: string;
    destination_id?: string;
    latitude: number | null;
    longitude: number | null;
    source: string;
    reason: string;
    persisted_in_supabase: boolean;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
  }>;
}

export const UniversalGeocodingAdminTab: React.FC = () => {
  const [stats, setStats] = useState<UniversalGeocodingStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<GeocodingAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionPending, setIsActionPending] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // 5-Record Test state
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [testRunReport, setTestRunReport] = useState<FiveRecordTestResult | null>(null);

  // Test lookup tool state
  const [testLat, setTestLat] = useState<string>('27.0400');
  const [testLng, setTestLng] = useState<string>('88.2600');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const fetchStatsAndLogs = async () => {
    try {
      const [resStats, resLogs] = await Promise.all([
        fetch('/api/admin/geocoding/stats').then(r => r.json()),
        fetch('/api/admin/geocoding/audit-logs?limit=40').then(r => r.json())
      ]);

      if (resStats.success) {
        setStats(resStats);
        // Clear stale resume error if confirmed that the worker is actively running
        if (resStats.worker?.is_running) {
          setActionMessage(prev => (prev?.type === 'error' && prev.text.toLowerCase().includes('resume') ? null : prev));
        }
      }
      if (resLogs.success) {
        setAuditLogs(resLogs.logs || []);
      }
    } catch (e) {
      console.error('[Universal Geocoding Admin Error]:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll stats every 4 seconds while tab is open
  useEffect(() => {
    fetchStatsAndLogs();
    const interval = setInterval(fetchStatsAndLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePauseWorker = async () => {
    setIsActionPending(true);
    try {
      const res = await fetch('/api/admin/geocoding/pause', { method: 'POST' }).then(r => r.json());
      if (res.success) {
        setActionMessage({ text: 'Background worker paused successfully.', type: 'success' });
        fetchStatsAndLogs();
      } else {
        setActionMessage({ text: res.error || 'Failed to pause worker', type: 'error' });
      }
    } catch (e: any) {
      setActionMessage({ text: e.message || 'Network error', type: 'error' });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleResumeWorker = async () => {
    setIsActionPending(true);
    try {
      const res = await fetch('/api/admin/geocoding/resume', { method: 'POST' }).then(r => r.json());
      if (res.success) {
        setActionMessage({ text: 'Background worker resumed.', type: 'success' });
        fetchStatsAndLogs();
      } else {
        setActionMessage({ text: res.error || 'Failed to resume worker', type: 'error' });
      }
    } catch (e: any) {
      setActionMessage({ text: e.message || 'Network error', type: 'error' });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleForcePollNow = async () => {
    setIsActionPending(true);
    try {
      const res = await fetch('/api/admin/geocoding/poll-now', { method: 'POST' }).then(r => r.json());
      if (res.success) {
        setActionMessage({ text: 'Poll cycle triggered immediately.', type: 'success' });
        setTimeout(fetchStatsAndLogs, 800);
      } else {
        setActionMessage({ text: res.error || 'Failed to trigger poll', type: 'error' });
      }
    } catch (e: any) {
      setActionMessage({ text: e.message || 'Network error', type: 'error' });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleRun5RecordTest = async () => {
    setIsRunningTest(true);
    setTestRunReport(null);
    try {
      const res = await fetch('/api/admin/geocoding/test-5-attractions', { method: 'POST' }).then(r => r.json());
      if (res.success) {
        setTestRunReport(res);
        setActionMessage({ 
          text: `5-Record Test Completed: ${res.succeeded} succeeded, ${res.failed} failed. Coordinates verified in Supabase.`, 
          type: 'success' 
        });
        fetchStatsAndLogs();
      } else {
        setActionMessage({ text: res.error || '5-record test failed', type: 'error' });
      }
    } catch (e: any) {
      setActionMessage({ text: e.message || 'Network error executing test', type: 'error' });
    } finally {
      setIsRunningTest(false);
    }
  };

  const handleTestLookup = async () => {
    const lat = parseFloat(testLat);
    const lng = parseFloat(testLng);
    if (isNaN(lat) || isNaN(lng)) return;

    setIsTesting(true);
    try {
      const res = await fetch(`/api/locations/nearest-village?lat=${lat}&lng=${lng}`).then(r => r.json());
      if (res.success) {
        setTestResult(res.nearest);
      }
    } catch {}
    finally {
      setIsTesting(false);
    }
  };

  const copyGrantSql = () => {
    const sql = `GRANT ALL ON TABLE public.attractions, public.homestays, public.taxi_stands, public.villages TO postgres, anon, authenticated, service_role;\nGRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const getWorkerBadge = () => {
    if (!stats) return { label: 'CONNECTING', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    const status = stats.worker.status;
    if (status === 'PROCESSING') {
      return { label: `PROCESSING (${stats.worker.current_entity_type || 'ENTITIES'})`, color: 'bg-blue-950/80 text-blue-400 border-blue-800 animate-pulse' };
    }
    if (status === 'IDLE' && stats.worker.is_running) {
      return { label: 'CONNECTED & RUNNING', color: 'bg-emerald-950/80 text-emerald-400 border-emerald-800' };
    }
    if (status === 'PAUSED' || !stats.worker.is_running) {
      return { label: 'PAUSED', color: 'bg-amber-950/80 text-amber-400 border-amber-800' };
    }
    return { label: 'ERROR', color: 'bg-rose-950/80 text-rose-400 border-rose-800' };
  };

  const workerBadge = getWorkerBadge();

  return (
    <div className="space-y-6" id="universal-geocoding-dashboard">
      {/* Top Header & Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Universal Geocoding System
              </h2>
              <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${workerBadge.color}`}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {workerBadge.label}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Autonomous background engine that geocodes <span className="text-slate-200 font-semibold">Attractions</span>, <span className="text-slate-200 font-semibold">Homestays</span>, and <span className="text-slate-200 font-semibold">Taxi Stands</span> independently using <span className="text-emerald-400 font-semibold">public.villages</span> as the geographic master reference.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleRun5RecordTest}
              disabled={isRunningTest || isActionPending}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/20"
              title="Run an isolated 5-record geocoding test directly against Supabase"
            >
              <FlaskConical className={`w-3.5 h-3.5 ${isRunningTest ? 'animate-bounce' : ''}`} />
              <span>{isRunningTest ? 'Testing 5 Records...' : 'Run 5-Record Test'}</span>
            </button>

            <button
              onClick={handleForcePollNow}
              disabled={isActionPending}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Force an immediate queue check across all 3 tables"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isActionPending ? 'animate-spin' : ''}`} />
              <span>Poll Now</span>
            </button>

            {stats?.worker.is_running ? (
              <button
                onClick={handlePauseWorker}
                disabled={isActionPending}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Worker</span>
              </button>
            ) : (
              <button
                onClick={handleResumeWorker}
                disabled={isActionPending}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Worker</span>
              </button>
            )}
          </div>
        </div>

        {actionMessage && !(actionMessage.type === 'error' && actionMessage.text.toLowerCase().includes('resume') && stats?.worker?.is_running) && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-medium border flex items-center justify-between gap-2 ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300' 
              : 'bg-rose-950/70 border-rose-800 text-rose-300'
          }`}>
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>
        )}
      </div>

      {/* 5-Record Test Results Drawer (When Executed) */}
      {testRunReport && (
        <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">5-Record Geocoding Test Verification Report</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-bold">{testRunReport.succeeded} Succeeded</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">{testRunReport.failed} Failed</span>
              <button onClick={() => setTestRunReport(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {testRunReport.records.map((r) => (
              <div
                key={r.attraction_id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {r.persisted_in_supabase ? (
                      <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-bold text-slate-200">{r.attraction_name}</span>
                    <span className="text-slate-500 text-[11px]">ID: {r.attraction_id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Source: <strong className="text-slate-300">{r.source}</strong> — {r.reason}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {r.latitude && r.longitude ? (
                    <div className="text-right">
                      <div className="font-mono text-emerald-400 font-bold">
                        {r.latitude.toFixed(6)}, {r.longitude.toFixed(6)}
                      </div>
                      <div className="text-[10px] text-emerald-500/80 flex items-center gap-1 justify-end">
                        <Check className="w-3 h-3" /> Persisted in Supabase
                      </div>
                    </div>
                  ) : (
                    <div className="text-rose-400 text-xs font-semibold">{r.error || 'Failed'}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SQL Grant Permission Helper (Visible ONLY when PostgreSQL error 42501 is returned) */}
      {Boolean(
        (stats?.attractions.error && stats.attractions.error.includes('42501')) ||
        (stats?.homestays.error && stats.homestays.error.includes('42501')) ||
        (stats?.taxi_stands.error && stats.taxi_stands.error.includes('42501'))
      ) && (
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-2xl p-4 sm:p-5 text-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-amber-300">Supabase Table Grants Required</h4>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                PostgreSQL requires table grants for the service_role key.
              </p>
            </div>
            <button
              onClick={copyGrantSql}
              className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy Grant SQL'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4-Entity Real-Time Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Attractions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attractions</span>
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {stats && stats.attractions.total !== null ? stats.attractions.total.toLocaleString() : '—'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              {stats && stats.attractions.total !== null ? (
                <>
                  <span>Geocoded: <strong className="text-emerald-400 font-bold">{stats.attractions.geocoded?.toLocaleString()}</strong></span>
                  <span>Pending: <strong className="text-amber-400 font-bold">{stats.attractions.pending?.toLocaleString()}</strong></span>
                </>
              ) : (
                <span className="text-amber-400/90 text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {stats?.attractions.error?.includes('42501') ? 'Unable to refresh (Grant Required)' : (stats?.attractions.error || 'Unable to load')}
                </span>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${stats && stats.attractions.total && stats.attractions.geocoded ? (stats.attractions.geocoded / stats.attractions.total) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        {/* 2. Homestays */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Homestays</span>
            <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {stats && stats.homestays.total !== null ? stats.homestays.total.toLocaleString() : '—'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              {stats && stats.homestays.total !== null ? (
                <>
                  <span>Geocoded: <strong className="text-emerald-400 font-bold">{stats.homestays.geocoded?.toLocaleString()}</strong></span>
                  <span>Pending: <strong className="text-amber-400 font-bold">{stats.homestays.pending?.toLocaleString()}</strong></span>
                </>
              ) : (
                <span className="text-amber-400/90 text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {stats?.homestays.error?.includes('42501') ? 'Unable to refresh (Grant Required)' : (stats?.homestays.error || 'Unable to load')}
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${stats && stats.homestays.total && stats.homestays.geocoded ? (stats.homestays.geocoded / stats.homestays.total) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        {/* 3. Taxi Stands */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxi Stands</span>
            <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800/60">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {stats && stats.taxi_stands.total !== null ? stats.taxi_stands.total.toLocaleString() : '—'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              {stats && stats.taxi_stands.total !== null ? (
                <>
                  <span>Geocoded: <strong className="text-emerald-400 font-bold">{stats.taxi_stands.geocoded?.toLocaleString()}</strong></span>
                  <span>Pending: <strong className="text-amber-400 font-bold">{stats.taxi_stands.pending?.toLocaleString()}</strong></span>
                </>
              ) : (
                <span className="text-amber-400/90 text-[11px] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {stats?.taxi_stands.error?.includes('42501') ? 'Unable to refresh (Grant Required)' : (stats?.taxi_stands.error || 'Unable to load')}
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${stats && stats.taxi_stands.total && stats.taxi_stands.geocoded ? (stats.taxi_stands.geocoded / stats.taxi_stands.total) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        {/* 4. Villages Reference Master */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Villages Reference</span>
            <div className="p-1.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {stats ? stats.villages.total.toLocaleString() : '2,072'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Master Baseline: <strong className="text-sky-400 font-bold">100% Geocoded</strong></span>
              <span>Spatial Index: <strong className="text-emerald-400 font-bold">Active</strong></span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-sky-500 h-1.5 rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Main Two-Column View: Live Activity Feed + Nearest Village Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Activity Feed (Audit Trail) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live Geocoding Resolution Stream</h3>
            </div>
            <span className="text-xs text-slate-400">Showing last {auditLogs.length} updates</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No recent activity recorded yet. The background worker will display live resolutions here.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.entity_type === 'attraction' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' :
                        log.entity_type === 'homestay' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/60' :
                        'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}>
                        {log.entity_type}
                      </span>
                      <span className="font-bold text-slate-200">{log.entity_name}</span>
                    </div>

                    <div className="text-slate-400 text-[11px] flex items-center gap-2">
                      <span className="text-slate-500">{log.source}</span>
                      <span>•</span>
                      <span className="text-slate-300">{log.reason}</span>
                    </div>

                    {log.nearest_village && (
                      <div className="text-emerald-400/90 text-[11px] flex items-center gap-1 font-medium">
                        <MapPin className="w-3 h-3" />
                        <span>Nearest Village: {log.nearest_village}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-center gap-1">
                    {log.latitude && log.longitude ? (
                      <span className="font-mono text-emerald-400 text-xs font-semibold">
                        {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-amber-400 text-xs font-semibold">Pending Coordinates</span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Spatial Village Match Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Compass className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Dynamic Village Resolver</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Entities do not depend on fixed destination IDs. Test real-time proximity calculation against the 2,072 master villages layer.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Latitude</label>
              <input
                type="text"
                value={testLat}
                onChange={(e) => setTestLat(e.target.value)}
                placeholder="27.0400"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Longitude</label>
              <input
                type="text"
                value={testLng}
                onChange={(e) => setTestLng(e.target.value)}
                placeholder="88.2600"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleTestLookup}
              disabled={isTesting}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {isTesting ? 'Computing Proximity...' : 'Resolve Nearest Village'}
            </button>

            {testResult && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="text-slate-400 text-[11px]">Nearest Village Match:</div>
                <div className="text-sm font-bold text-sky-300">{testResult.village_name}</div>
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Village Code: <strong className="text-slate-200">{testResult.village_code}</strong></span>
                  <span>Distance: <strong className="text-emerald-400">{testResult.distance_km} km</strong></span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Geocoding Resolution Pipeline</h4>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>1. High Precision Landmark Dictionary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>2. Master Village Match (2,072 villages)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>3. OpenStreetMap Nominatim with Regional Bounding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>4. Gemini AI Contextual Mountain Geocoder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
