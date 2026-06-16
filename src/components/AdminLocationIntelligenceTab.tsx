import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Compass,
  Map,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Activity
} from "lucide-react";

interface StatsData {
  total: number;
  withCoordinates: number;
  missingCoordinates: number;
  activeJob: {
    status: 'idle' | 'running' | 'completed' | 'failed';
    total: number;
    current: number;
    successCount: number;
    failureCount: number;
    logs: string[];
  };
}

interface QualityReport {
  missingCoordinates: { col: string; id: string; name: string }[];
  missingStateOrDistrict: { col: string; id: string; name: string; missing: string[] }[];
  invalidCoordinates: { col: string; id: string; name: string; lat: any; lon: any }[];
  healthyCount: number;
  totalChecked: number;
}

export const AdminLocationIntelligenceTab: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [report, setReport] = useState<QualityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [singleLoadingId, setSingleLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [diagnosticsTab, setDiagnosticsTab] = useState<'missing-coord' | 'invalid-coord' | 'missing-fields'>('missing-coord');
  const [showLogs, setShowLogs] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchSizeLimit, setBatchSizeLimit] = useState<number>(3);

  const logsEndRef = useRef<HTMLDivElement | null>(null);

  const showNotify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch("/api/admin/location-intelligence/stats", {
        headers: { "x-admin-password": "admin123" }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        const errData = await res.json();
        showNotify("error", errData.error || "Failed to load intelligence stats.");
      }
    } catch (e: any) {
      showNotify("error", e.message || "Failed to contact database statistics server");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Poll progress state dynamically while running
  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(() => {
      if (stats?.activeJob?.status === "running") {
        fetchStats(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [stats?.activeJob?.status]);

  // Keep log panel scrolled to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [stats?.activeJob?.logs]);

  const startBulkGeocode = async (customLimit?: number, customTargetIds?: string[]) => {
    try {
      const res = await fetch("/api/admin/location-intelligence/geocode-bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "admin123"
        },
        body: JSON.stringify({
          limit: customLimit,
          targetIds: customTargetIds
        })
      });
      if (res.ok) {
        showNotify("success", "Bulk geocoding launched successfully! Processing approved records...");
        setSelectedIds([]); // Clear selections upon triggering
        fetchStats();
      } else {
        const body = await res.json();
        showNotify("error", body.error || "Failed to trigger bulk processing.");
      }
    } catch (e: any) {
      showNotify("error", e.message || "Bulk resolve request failed.");
    }
  };

  const stopBulkGeocode = async () => {
    try {
      const res = await fetch("/api/admin/location-intelligence/geocode-stop", {
        method: "POST",
        headers: { "x-admin-password": "admin123" }
      });
      if (res.ok) {
        showNotify("success", "Bulk geocode runner stopped by operator.");
        fetchStats();
      }
    } catch (e: any) {
      showNotify("error", e.message);
    }
  };

  const runDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const res = await fetch("/api/admin/location-intelligence/quality", {
        headers: { "x-admin-password": "admin123" }
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        showNotify("success", "Data Quality Diagnostics report refreshed!");
      } else {
        showNotify("error", "Failed to retrieve diagnostics checks.");
      }
    } catch (e: any) {
      showNotify("error", e.message);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const recalculateDistances = async () => {
    setRecalculating(true);
    try {
      const res = await fetch("/api/admin/location-intelligence/recalculate-spatial", {
        method: "POST",
        headers: { "x-admin-password": "admin123" }
      });
      if (res.ok) {
        const data = await res.json();
        showNotify("success", `Proximity network successfully realigned for ${data.count} records!`);
        fetchStats();
      } else {
        showNotify("error", "Recalculation error returned from database server.");
      }
    } catch (e: any) {
      showNotify("error", e.message);
    } finally {
      setRecalculating(false);
    }
  };

  const geocodeSingle = async (col: string, id: string) => {
    setSingleLoadingId(`${col}-${id}`);
    try {
      const res = await fetch("/api/admin/location-intelligence/geocode-single", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": "admin123"
        },
        body: JSON.stringify({ col, id })
      });
      if (res.ok) {
        showNotify("success", "Record coordinates resolved successfully!");
        fetchStats();
        // Refresh diagnostics if open
        if (report) {
          runDiagnostics();
        }
      } else {
        const body = await res.json();
        showNotify("error", body.error || "Geocoding failed for this single entry.");
      }
    } catch (e: any) {
      showNotify("error", e.message);
    } finally {
      setSingleLoadingId(null);
    }
  };

  const formatCollectionName = (col: string) => {
    if (col === 'destinations') return 'Destination 📍';
    if (col === 'attractions') return 'Attraction 🌲';
    if (col === 'homestays') return 'Homestay 🏡';
    if (col === 'hubs') return 'Transit Hub 🚉';
    return col;
  };

  const getProgressPercentage = () => {
    if (!stats?.activeJob || stats.activeJob.total === 0) return 0;
    return Math.round((stats.activeJob.current / stats.activeJob.total) * 100);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Toast notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-white/95 text-sm ${
          notification.type === "success" ? "bg-emerald-600 font-medium" : "bg-rose-600 font-medium"
        }`}>
          {notification.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Compass className="h-7 w-7 text-emerald-600 animate-spin-slow" />
            HilliTryp Location Intelligence Center
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Comprehensive geocoding, multi-hop routing, proximity graph realignments, and data quality assurance dashboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fetchStats(false)}
            disabled={loading}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Stats
          </button>
          
          <button
            onClick={recalculateDistances}
            disabled={recalculating}
            className="px-4 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {recalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
            Realign Proximity Graphs
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm">Retrieving Master Location analytics...</p>
        </div>
      ) : (
        <>
          {/* Bento Grid Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Managed Locations</span>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-3xl font-extrabold text-slate-900">{stats?.total ?? 0}</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">100% checked</span>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Geocoded Coordinates</span>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-3xl font-extrabold text-emerald-800">{stats?.withCoordinates ?? 0}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {stats?.total ? Math.round(((stats.withCoordinates) / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Missing Coordinates</span>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-3xl font-extrabold text-rose-800">{stats?.missingCoordinates ?? 0}</span>
                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                  {stats?.total ? Math.round(((stats.missingCoordinates) / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Active Bulk Engine</span>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-base font-extrabold capitalize text-purple-800">
                  {stats?.activeJob?.status === "running" ? "🔥 Resolving..." : stats?.activeJob?.status === "completed" ? "✅ Completed" : "💤 Idle"}
                </span>
                <span className="text-xs text-purple-600 font-medium">Gemini-3.5 Engine</span>
              </div>
            </div>
          </div>

          {/* Bulk Runner Control Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Gemini-Powered Coordinates Auto-Fills
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Enforces continuous coordinates auto-population querying Google Gemini models across all Destinations, Attractions, Homestays and Hub entries with zero coordinates.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 items-center gap-1.5 shadow-2xs">
                  <span className="text-xs font-semibold px-2 text-slate-500">Auto-Batch Limit:</span>
                  <select
                    value={batchSizeLimit}
                    onChange={(e) => setBatchSizeLimit(Number(e.target.value))}
                    className="text-xs font-semibold bg-white border border-slate-200 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={3}>3 (Small Batch)</option>
                    <option value={5}>5 (Safe Batch)</option>
                    <option value={10}>10 (Standard)</option>
                    <option value={20}>20 (Large)</option>
                    <option value={99999}>Full Bulk</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  {stats?.activeJob?.status === "running" ? (
                    <button
                      onClick={stopBulkGeocode}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all animate-pulse"
                    >
                      <XCircle className="h-4 w-4" />
                      Stop Bulk Operation
                    </button>
                  ) : (
                    <button
                      onClick={() => startBulkGeocode(batchSizeLimit)}
                      disabled={stats?.missingCoordinates === 0}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      Run Auto-Batch
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Live Progress Metrics */}
            {stats?.activeJob && stats.activeJob.status !== "idle" && (
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600 animate-pulse" />
                    <span>Resolution Progress: {stats.activeJob.current} / {stats.activeJob.total}</span>
                  </div>
                  <span className="font-mono text-xs">{getProgressPercentage()}% resolved</span>
                </div>
                
                {/* Visual Progress Bar Wrapper */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs text-slate-600 mt-2">
                  <div>Success Resolves: <span className="font-bold text-emerald-600">{stats.activeJob.successCount}</span></div>
                  <div>Resolution Failures: <span className="font-bold text-rose-600">{stats.activeJob.failureCount}</span></div>
                  <div className="col-span-2 sm:col-span-1">Active Status: <span className="font-bold text-purple-700 uppercase">{stats.activeJob.status}</span></div>
                </div>
              </div>
            )}

            {/* Logs Collapse Section */}
            {stats?.activeJob && stats.activeJob.logs && stats.activeJob.logs.length > 0 && (
              <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 p-4 border-b border-slate-150 transition-all flex items-center justify-between"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Live Generation Terminal Output ({stats.activeJob.logs.length} entries)
                  </span>
                  {showLogs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showLogs && (
                  <div className="p-4 bg-slate-900 border-t border-slate-800 text-slate-300 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto space-y-1 select-text">
                    {stats.activeJob.logs.map((log, idx) => (
                      <div key={idx} className={log.includes("✓") ? "text-emerald-400" : log.includes("✗") ? "text-rose-400 font-medium" : "text-slate-300"}>
                        {log}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Diagnostics Section */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  On-Demand Data Quality Diagnostics Checker
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Examines geographic coordinates, state consistency, districts validation, and limits of coordinates bound verification.
                </p>
              </div>

              <button
                onClick={runDiagnostics}
                disabled={diagnosticsLoading}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {diagnosticsLoading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> : <Activity className="h-4 w-4 text-slate-500" />}
                Run Diagnostics Check
              </button>
            </div>

            {report && (
              <div className="space-y-6 pt-4 border-t border-slate-100">
                {/* Selection Approval Banner */}
                {selectedIds.length > 0 && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-emerald-900 block">
                          Approved {selectedIds.length} location records
                        </span>
                        <span className="text-xs text-emerald-700">
                          These records will be geocoded using Google Gemini in a controlled batch.
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-white border border-emerald-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                        <span className="text-xs font-semibold text-emerald-800">Approved limit:</span>
                        <select
                          value={batchSizeLimit}
                          onChange={(e) => setBatchSizeLimit(Number(e.target.value))}
                          className="text-xs font-bold text-emerald-900 bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                        >
                          <option value={99999}>All Approved ({selectedIds.length})</option>
                          <option value={1}>1 record</option>
                          <option value={3}>3 (Small Batch)</option>
                          <option value={5}>5 (Safe Batch)</option>
                          <option value={10}>10 (Standard)</option>
                        </select>
                      </div>
                      <button
                        onClick={() => startBulkGeocode(batchSizeLimit, selectedIds)}
                        disabled={loading || stats?.activeJob?.status === "running"}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Geocode Approved Batch
                      </button>
                      <button
                        onClick={() => setSelectedIds([])}
                        className="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* Diagnostics Quality Scores Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Checked Entries</span>
                    <span className="text-2xl font-extrabold text-slate-950 mt-2">{report.totalChecked}</span>
                  </div>
                  <div className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Optimal / Healthy Entries</span>
                    <span className="text-2xl font-extrabold text-emerald-800 mt-2">{report.healthyCount}</span>
                  </div>
                  <div className="bg-orange-50/20 border border-orange-100 p-4 rounded-xl flex flex-col justify-between">
                    <span className="text-xs text-orange-700 font-semibold uppercase tracking-wider">Entries with Deficiencies</span>
                    <span className="text-2xl font-extrabold text-orange-800 mt-2">{report.totalChecked - report.healthyCount}</span>
                  </div>
                </div>

                {/* Categories Tabs */}
                <div className="flex border-b border-slate-150 gap-2">
                  <button
                    onClick={() => setDiagnosticsTab('missing-coord')}
                    className={`py-2 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                      diagnosticsTab === 'missing-coord'
                        ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Missing Coordinates ({report.missingCoordinates.length})
                  </button>

                  <button
                    onClick={() => setDiagnosticsTab('invalid-coord')}
                    className={`py-2 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                      diagnosticsTab === 'invalid-coord'
                        ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Invalid / Bad Coordinates ({report.invalidCoordinates.length})
                  </button>

                  <button
                    onClick={() => setDiagnosticsTab('missing-fields')}
                    className={`py-2 px-4 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                      diagnosticsTab === 'missing-fields'
                        ? 'border-emerald-600 text-emerald-800 bg-emerald-50/20'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Missing District/State ({report.missingStateOrDistrict.length})
                  </button>
                </div>

                {/* Tab content display */}
                <div className="space-y-4">
                  {diagnosticsTab === 'missing-coord' && (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="w-10 px-5 py-3">
                              <input
                                type="checkbox"
                                checked={report.missingCoordinates.length > 0 && selectedIds.length === report.missingCoordinates.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds(report.missingCoordinates.map(m => m.id));
                                  } else {
                                    setSelectedIds([]);
                                  }
                                }}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                              />
                            </th>
                            <th className="px-5 py-3">Location Name</th>
                            <th className="px-5 py-3">Domain Type</th>
                            <th className="px-5 py-3 text-right">Quick Remediation Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-150 text-sm">
                          {report.missingCoordinates.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                                Perfect! Zero records are missing geographic positions.
                              </td>
                            </tr>
                          ) : (
                            report.missingCoordinates.map((item, id) => (
                              <tr key={id} className={`hover:bg-slate-55/40 ${selectedIds.includes(item.id) ? "bg-emerald-50/20" : ""}`}>
                                <td className="w-10 px-5 py-2.5">
                                  <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedIds([...selectedIds, item.id]);
                                      } else {
                                        setSelectedIds(selectedIds.filter(selectedId => selectedId !== item.id));
                                      }
                                    }}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                  />
                                </td>
                                <td className="px-5 py-2.5 font-semibold text-slate-900">{item.name}</td>
                                <td className="px-5 py-2.5 text-slate-500 capitalize">{formatCollectionName(item.col)}</td>
                                <td className="px-5 py-2.5 text-right">
                                  <button
                                    onClick={() => geocodeSingle(item.col, item.id)}
                                    disabled={singleLoadingId === `${item.col}-${item.id}`}
                                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 disabled:opacity-50 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
                                  >
                                    {singleLoadingId === `${item.col}-${item.id}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin text-emerald-700" />
                                    ) : (
                                      <Sparkles className="h-3 w-3 text-emerald-600" />
                                    )}
                                    Quick Geocode
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {diagnosticsTab === 'invalid-coord' && (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-5 py-3">Location Name</th>
                            <th className="px-5 py-3">Entity Type</th>
                            <th className="px-5 py-3">Reported Coordinates (Lat/Lon)</th>
                            <th className="px-5 py-3 text-right">Emergency Repair</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-150 text-sm">
                          {report.invalidCoordinates.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                                Excellent! All recorded values lies validly inside regional bounds bounds.
                              </td>
                            </tr>
                          ) : (
                            report.invalidCoordinates.map((item, id) => (
                              <tr key={id} className="hover:bg-slate-55/40 text-left">
                                <td className="px-5 py-2.5 font-semibold text-slate-900">{item.name}</td>
                                <td className="px-5 py-2.5 text-slate-500 capitalize">{formatCollectionName(item.col)}</td>
                                <td className="px-5 py-2.5 font-mono text-xs text-rose-600 font-bold bg-rose-50/30">
                                  {item.lat ?? 0} , {item.lon ?? 0}
                                </td>
                                <td className="px-5 py-2.5 text-right">
                                  <button
                                    onClick={() => geocodeSingle(item.col, item.id)}
                                    disabled={singleLoadingId === `${item.col}-${item.id}`}
                                    className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 disabled:opacity-50 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
                                  >
                                    {singleLoadingId === `${item.col}-${item.id}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-3 w-3" />
                                    )}
                                    Force Recalculate Positions
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {diagnosticsTab === 'missing-fields' && (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-5 py-3">Location Name</th>
                            <th className="px-5 py-3">Category Type</th>
                            <th className="px-5 py-3">Deficient Properties</th>
                            <th className="px-5 py-3 text-right font-medium">Automatic Field Resolution</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-150 text-sm">
                          {report.missingStateOrDistrict.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                                Ideal! No locations are missing district boundaries or state classifications.
                              </td>
                            </tr>
                          ) : (
                            report.missingStateOrDistrict.map((item, id) => (
                              <tr key={id} className="hover:bg-slate-55/40">
                                <td className="px-5 py-2.5 font-semibold text-slate-900">{item.name}</td>
                                <td className="px-5 py-2.5 text-slate-500 capitalize">{formatCollectionName(item.col)}</td>
                                <td className="px-5 py-2.5">
                                  <div className="flex gap-1.5">
                                    {item.missing.map((it, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold uppercase rounded-md">
                                        {it}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-5 py-2.5 text-right">
                                  <button
                                    onClick={() => geocodeSingle(item.col, item.id)}
                                    disabled={singleLoadingId === `${item.col}-${item.id}`}
                                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 disabled:opacity-50 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5"
                                  >
                                    {singleLoadingId === `${item.col}-${item.id}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Sparkles className="h-3 w-3" />
                                    )}
                                    Auto Resolve Properties
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
