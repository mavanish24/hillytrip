import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle, XCircle, Trash2, Edit3, Plus, 
  Search, Filter, MapPin, Home, Star, RefreshCw, Eye, MessageSquare, 
  User, Mail, Phone, Calendar, Clock, Bookmark, UserCheck, Shield
} from 'lucide-react';
import { SystemReport } from '../types';

interface AdminReportsTabProps {
  adminEmail: string;
}

export default function AdminReportsTab({ adminEmail }: AdminReportsTabProps) {
  const [reports, setReports] = useState<SystemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'investigating' | 'resolved' | 'dismissed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal / Form state for edit/details
  const [selectedReport, setSelectedReport] = useState<SystemReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [reportStatus, setReportStatus] = useState<SystemReport['status']>('new');
  const [reportPriority, setReportPriority] = useState<SystemReport['priority']>('medium');
  const [assignedTo, setAssignedTo] = useState('');

  // Simulator State (incoming traveler issue form)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [simMobile, setSimMobile] = useState('');
  const [simCategory, setSimCategory] = useState<SystemReport['category']>('route_error');
  const [simTitle, setSimTitle] = useState('');
  const [simDescription, setSimDescription] = useState('');
  const [simPriority, setSimPriority] = useState<SystemReport['priority']>('medium');
  const [simRefId, setSimRefId] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?email=${encodeURIComponent(adminEmail)}`);
      if (!res.ok) {
        throw new Error('Could not pull backoffice system reports catalogue.');
      }
      const data = await res.json();
      setReports(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching system reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [adminEmail]);

  // Seeding simulated/mock reports if list is empty
  const handleSeedReports = async () => {
    setLoading(true);
    const mockReports: Omit<SystemReport, 'id'>[] = [
      {
        reporterName: 'Tshering Dorjee',
        reporterEmail: 'tshering.d@gmail.com',
        reporterMobile: '+91 98005 12345',
        category: 'route_error',
        referenceId: 'route-njp-gangtok',
        title: 'Incorrect share jeep fare listed for NJP to Gangtok',
        description: 'The listed fare says ₹350 per seat, but the local syndicate has updated the fare to ₹450 since last week. Travelers are getting confused at the taxi stand.',
        status: 'new',
        priority: 'high',
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      },
      {
        reporterName: 'Ananya Sharma',
        reporterEmail: 'ananya.sharma@yahoo.com',
        reporterMobile: '+91 87654 32109',
        category: 'homestay_issue',
        referenceId: 'homestay-pine-ridge-kalimpong',
        title: 'Pine Ridge Homestay contact number is unresponsive',
        description: 'I tried calling the WhatsApp number listed on the site multiple times to inquire about rooms, but the owner says this number belongs to someone else now.',
        status: 'investigating',
        priority: 'medium',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: adminEmail,
        adminNotes: 'Verifying with the property owner directly. Reached out on their registered email.',
      },
      {
        reporterName: 'Rohit Gurung',
        reporterEmail: 'rohit.g89@gmail.com',
        category: 'app_bug',
        title: 'Flickering on the sitemap visual chart',
        description: 'When searching for multi-hop routes under offline mode, the visual chart bars sometimes flicker on Google Chrome on mobile devices.',
        status: 'resolved',
        priority: 'low',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'tech-support@hillytrip.com',
        adminNotes: 'Refactored CSS animations and disabled layout flickers on mobile touch. Re-verified on Android chrome.',
      },
      {
        reporterName: 'Driver Passang',
        reporterEmail: 'passang.cab@outlook.com',
        reporterMobile: '+91 94340 54321',
        category: 'driver_complaint',
        title: 'False review posted by anonymous account',
        description: 'An anonymous review was posted claiming I overcharged them for the Kalimpong to Lava trip, but I was out of town that day and my vehicle was in the garage. Please review this inappropriate comment.',
        status: 'new',
        priority: 'medium',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      }
    ];

    try {
      for (const report of mockReports) {
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
        });
      }
      await fetchReports();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (report: SystemReport) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setReportStatus(report.status);
    setReportPriority(report.priority);
    setAssignedTo(report.assignedTo || adminEmail);
    setIsModalOpen(true);
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await fetch(`/api/admin/reports/${selectedReport.id}?email=${encodeURIComponent(adminEmail)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reportStatus,
          priority: reportPriority,
          adminNotes: adminNotes,
          assignedTo: assignedTo || null
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update system report status.');
      }

      setIsModalOpen(false);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Error updating report.');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this report from logs?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/reports/${id}?email=${encodeURIComponent(adminEmail)}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete report.');
      }

      setIsModalOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Error deleting report.');
    }
  };

  const handleCreateSimulatedReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simEmail.trim() || !simTitle.trim() || !simDescription.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterName: simName,
          reporterEmail: simEmail,
          reporterMobile: simMobile || undefined,
          category: simCategory,
          referenceId: simRefId || undefined,
          title: simTitle,
          description: simDescription,
          priority: simPriority
        })
      });

      if (!res.ok) {
        throw new Error('Failed to log simulated traveler report.');
      }

      setIsSimulating(false);
      // Reset form
      setSimName('');
      setSimEmail('');
      setSimMobile('');
      setSimTitle('');
      setSimDescription('');
      setSimRefId('');
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Error submitting simulated report.');
    }
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // Calculate statistics
  const stats = {
    total: reports.length,
    new: reports.filter(r => r.status === 'new').length,
    investigating: reports.filter(r => r.status === 'investigating').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
    critical: reports.filter(r => r.priority === 'critical' && r.status !== 'resolved').length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return 'bg-sky-50 text-sky-700 border-sky-100 animate-pulse';
      case 'investigating': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'route_error': return <MapPin className="w-4 h-4 text-rose-600" />;
      case 'homestay_issue': return <Home className="w-4 h-4 text-emerald-600" />;
      case 'driver_complaint': return <UserCheck className="w-4 h-4 text-amber-600" />;
      case 'inappropriate_review': return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'app_bug': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Bookmark className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace('_', ' ').toUpperCase();
  };

  return (
    <div id="admin-reports-dashboard" className="space-y-6 animate-fade-in text-slate-800 text-left">
      {/* HEADER WITH ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <ShieldAlert className="w-48 h-48 text-emerald-500" />
        </div>
        <div className="relative z-10 space-y-1">
          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
            Phase 4 Operations
          </span>
          <h1 className="text-xl font-black tracking-tight">🚨 System Integrity & Reports Center</h1>
          <p className="text-[11px] text-slate-400 max-w-xl">
            Triage, investigate, and resolve traveler issues, route inaccuracies, driver grievances, and data corrections reported in the field.
          </p>
        </div>

        <div className="flex gap-2 relative z-10">
          <button
            onClick={() => setIsSimulating(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Field Report</span>
          </button>
          
          <button
            onClick={fetchReports}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl transition border border-slate-700 flex items-center gap-1 cursor-pointer"
            title="Reload database logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
          <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wide">Total Logged</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[10px] text-slate-400 font-mono">active</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
          <span className="text-[10px] uppercase font-black text-sky-600 block tracking-wide">New / Unread</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-sky-700">{stats.new}</span>
            <span className="text-[10px] text-sky-400 font-mono">triaging</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
          <span className="text-[10px] uppercase font-black text-amber-600 block tracking-wide">Investigating</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-700">{stats.investigating}</span>
            <span className="text-[10px] text-amber-400 font-mono">assigned</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
          <span className="text-[10px] uppercase font-black text-emerald-600 block tracking-wide">Resolved</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700">{stats.resolved}</span>
            <span className="text-[10px] text-emerald-400 font-mono">completed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-3xs bg-rose-50/20 col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-black text-rose-600 block tracking-wide">Critical Alerts</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-700">{stats.critical}</span>
            <span className="text-[10px] text-rose-500 font-black animate-pulse">action required</span>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by reporter, email, title or description details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs outline-none transition"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Type:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="route_error">Route Error</option>
                <option value="homestay_issue">Homestay Issue</option>
                <option value="driver_complaint">Driver Complaint</option>
                <option value="inappropriate_review">Inappropriate Review</option>
                <option value="app_bug">App Bug</option>
                <option value="other">Other Issues</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* REPORTS LIST TABLE / CARDS */}
      {loading ? (
        <div className="py-24 text-center bg-white border border-slate-200 rounded-3xl">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-bold">Synchronizing system report catalog...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl py-16 px-6 text-center space-y-4">
          <ShieldCheckIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-sm">No active system reports matching criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            All mountain routes, driver claims, reviews and application modules are verified and operating within bounds. Zero unaddressed reports.
          </p>
          {reports.length === 0 && (
            <button
              onClick={handleSeedReports}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition"
            >
              Seed Standard Operational Reports
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleOpenDetails(report)}
              className={`p-5 bg-white border hover:border-slate-300 hover:shadow-2xs rounded-2xl transition duration-150 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden ${
                report.status === 'new' ? 'border-sky-200 bg-sky-50/5' : 'border-slate-200'
              }`}
            >
              {/* Highlight bar for critical reports */}
              {report.priority === 'critical' && report.status !== 'resolved' && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
              )}

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getPriorityColor(report.priority)}`}>
                    <Bookmark className="w-2.5 h-2.5" />
                    {report.priority.toUpperCase()}
                  </span>

                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1 uppercase tracking-wide">
                    {getCategoryIcon(report.category)}
                    {formatCategoryName(report.category)}
                  </span>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(report.status)}`}>
                    {report.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight leading-snug truncate">
                  {report.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-bold font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {report.reporterName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {report.reporterEmail}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  {report.assignedTo && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        Assigned: {report.assignedTo}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 md:self-center shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDetails(report);
                  }}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteReport(report.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Delete report log permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INSPECT REPORT MODAL DETAIL VIEW */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Report Identifier: {selectedReport.id}
              </span>
              <h2 className="text-lg font-black mt-1 leading-snug">{selectedReport.title}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-6 top-6 text-slate-400 hover:text-white transition text-xs font-mono border border-slate-700 rounded-lg px-2 py-1 cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleUpdateReport} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side: Reporter Information */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wide">Reporter Information</span>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Full Name</span>
                        <span className="font-extrabold text-slate-800">{selectedReport.reporterName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Email Address</span>
                        <span className="font-extrabold text-slate-800 break-all">{selectedReport.reporterEmail}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Phone Connection</span>
                        <span className="font-extrabold text-slate-800">{selectedReport.reporterMobile || 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Meta indicators */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wide">Report Meta Information</span>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Date Logged</span>
                        <span className="font-extrabold text-slate-800">{new Date(selectedReport.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="text-slate-400 block text-[9px] font-bold font-mono uppercase">Resolution Date</span>
                        <span className="font-extrabold text-slate-800">
                          {selectedReport.resolvedAt ? new Date(selectedReport.resolvedAt).toLocaleString() : 'Pending Resolution'}
                        </span>
                      </div>
                    </div>

                    {selectedReport.referenceId && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <div>
                          <span className="text-indigo-400 block text-[9px] font-bold font-mono uppercase">Referenced Entity ID</span>
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                            {selectedReport.referenceId}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Detail block */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wide">Report Description details</span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs text-slate-700 leading-relaxed font-semibold italic whitespace-pre-wrap">
                  "{selectedReport.description}"
                </div>
              </div>

              {/* Action Update Fields Form */}
              <div className="border-t border-slate-150 pt-5 space-y-4">
                <span className="text-[10px] uppercase font-black text-emerald-600 block tracking-wide">Operational Resolution & Triaging controls</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Status update */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">SET STATUS</label>
                    <select
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-250 p-2 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="new">New</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                  {/* Priority update */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">SET PRIORITY</label>
                    <select
                      value={reportPriority}
                      onChange={(e) => setReportPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-250 p-2 rounded-xl text-xs font-bold text-slate-700"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Assigned to admin */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">ASSIGNED AGENT</label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Admin email"
                      className="w-full bg-slate-50 border border-slate-250 p-2 rounded-xl text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>

                {/* Admin notes textarea */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">INVESTIGATION NOTES / ACTIONS TAKEN</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter diagnostic notes, direct contacts verified, route adjustments processed, or reasons for dismissal/resolution..."
                    className="w-full bg-slate-50 border border-slate-250 p-3 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-150 pt-5 flex justify-between items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDeleteReport(selectedReport.id)}
                  className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-rose-100"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Log</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-sm transition"
                  >
                    Commit Resolution Updates
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INCOMING FIELD REPORT SIMULATOR FORM (MODAL) */}
      {isSimulating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 text-left">
            <div className="bg-emerald-600 text-white p-6 relative">
              <h2 className="text-base font-black">🚨 Log Incoming traveler / Partner Field Report</h2>
              <p className="text-[11px] text-emerald-100 mt-1">
                Log reports received offline via help desks, mobile calls, or driver representatives directly into the platform cluster.
              </p>
              <button
                onClick={() => setIsSimulating(false)}
                className="absolute right-6 top-6 text-emerald-200 hover:text-white transition text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSimulatedReport} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">REPORTER NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Passang Sherpa"
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">REPORTER EMAIL *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. passang@gmail.com"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">MOBILE CONTACT (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94341..."
                    value={simMobile}
                    onChange={(e) => setSimMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">ISSUE CATEGORY *</label>
                  <select
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="route_error">Route Error / Fares Outdated</option>
                    <option value="homestay_issue">Homestay Info Discrepancy</option>
                    <option value="driver_complaint">Driver / Cabin complaint</option>
                    <option value="inappropriate_review">Abusive Comment / Review</option>
                    <option value="app_bug">Sitemap / App response issue</option>
                    <option value="other">Other Inquiry / Report</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">REPORT PRIORITY *</label>
                  <select
                    value={simPriority}
                    onChange={(e) => setSimPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical (Impacts Safety/Transit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">REFERENCED ENTITY ID (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="e.g. route-siliguri-lava"
                    value={simRefId}
                    onChange={(e) => setSimRefId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">ISSUE TITLE / HEADING *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outdated jeep fare listed for Kalimpong to Lava path"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">DETAILED DESCRIPTION *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide precise details of the discrepancies. List names, locations, rates observed, contact details or steps to reproduce errors."
                  value={simDescription}
                  onChange={(e) => setSimDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 transition"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimulating(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-sm transition cursor-pointer"
                >
                  Log Active Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple placeholder fallback icons if some imports are missing or custom styled
function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  );
}
