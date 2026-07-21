import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  Phone, 
  Shield, 
  Calendar, 
  MapPin, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  BarChart2, 
  MessageSquare, 
  Send, 
  Download, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle, 
  Trash, 
  Eye, 
  RefreshCw, 
  Sliders, 
  Edit, 
  Ban, 
  UserCheck, 
  Map, 
  UserX,
  Lock,
  MessageCircle,
  Star,
  DollarSign,
  Briefcase,
  Compass,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  LockOpen
} from 'lucide-react';
import { VerificationStatus, TaxiBookingStatus, QuoteStatus, TripStatus } from '../types_taxi';

interface AdminTaxiMarketplaceTabProps {
  adminEmail: string;
}

export default function AdminTaxiMarketplaceTab({ adminEmail }: AdminTaxiMarketplaceTabProps) {
  // Navigation Tabs
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'quotes' | 'bookings' | 'operators' | 'compliance' | 'broadcasts' | 'audit'>('dashboard');
  
  // App states
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [secondaryFilter, setSecondaryFilter] = useState('all');

  // Interactive modals state
  const [editingOperator, setEditingOperator] = useState<any | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'verified_only' | 'specific_operator'>('all');
  const [specificOperatorId, setSpecificOperatorId] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [adminActionNotes, setAdminActionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Load All Taxi Admin Data
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/taxi-marketplace/stats', {
        headers: { 'x-admin-password': 'admin123', 'x-admin-email': adminEmail }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setQuoteRequests(data.quoteRequests || []);
        setBookings(data.bookings || []);
        setOperators(data.operators || []);
        setReviews(data.reviews || []);
        setChatLogs(data.chatLogs || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.error('Failed to load taxi marketplace admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminEmail]);

  // Action: Handle Operator Verification Status
  const handleOperatorStatus = async (userId: string, newStatus: string, actionType: string) => {
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/taxi-marketplace/operators/${userId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ 
          status: newStatus,
          adminNotes: adminActionNotes || `Admin changed status to ${newStatus}` 
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminActionNotes('');
        setEditingOperator(null);
        loadData();
      }
    } catch (e) {
      console.error('Failed to update operator status:', e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Update Operator Profile Details
  const handleEditOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOperator) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/taxi-marketplace/operators/${editingOperator.user_id}/edit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({
          businessName: editingOperator.taxiOperatorDetails?.businessName,
          ownerName: editingOperator.taxiOperatorDetails?.ownerName,
          mobileNumber: editingOperator.taxiOperatorDetails?.mobileNumber,
          businessAddress: editingOperator.taxiOperatorDetails?.businessAddress,
          languagesSpoken: editingOperator.taxiOperatorDetails?.languagesSpoken,
          operatingRegions: editingOperator.taxiOperatorDetails?.operatingRegions,
          yearsInBusiness: editingOperator.taxiOperatorDetails?.yearsInBusiness,
          emergencyContact: editingOperator.taxiOperatorDetails?.emergencyContact
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingOperator(null);
        loadData();
      }
    } catch (e) {
      console.error('Failed to edit operator:', e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Handle Booking status update
  const handleBookingStatus = async (bookingId: string, nextStatus: string) => {
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/taxi-marketplace/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ 
          status: nextStatus,
          notes: adminActionNotes || `Status updated by Admin to ${nextStatus}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminActionNotes('');
        setSelectedBooking(null);
        loadData();
      }
    } catch (e) {
      console.error('Failed to update booking status:', e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Emergency Reassign Driver/Vehicle
  const handleEmergencyReassign = async (bookingId: string, driverName: string, regNo: string) => {
    if (!driverName || !regNo) return;
    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/admin/taxi-marketplace/bookings/${bookingId}/reassign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ driverName, registrationNumber: regNo })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBooking(null);
        loadData();
      }
    } catch (e) {
      console.error('Failed to reassign driver/vehicle:', e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Moderate review
  const handleReviewAction = async (reviewId: string, actionType: 'flag' | 'hide' | 'approve' | 'delete') => {
    try {
      const res = await fetch(`/api/admin/taxi-marketplace/reviews/${reviewId}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ action: actionType })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (e) {
      console.error('Failed to moderate review:', e);
    }
  };

  // Action: Send Broadcast / Targeted notifications
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setSubmittingAction(true);
    try {
      const res = await fetch('/api/admin/taxi-marketplace/broadcast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({
          target: broadcastTarget,
          operatorId: specificOperatorId || null,
          title: broadcastTitle,
          message: broadcastMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastTitle('');
        setBroadcastMessage('');
        setSpecificOperatorId('');
        alert('Broadcast alert dispatched successfully.');
        loadData();
      }
    } catch (e) {
      console.error('Failed to dispatch broadcast:', e);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Helper: Export state table to CSV
  const exportToCSV = (type: 'operators' | 'bookings' | 'quote-requests' | 'audit-logs') => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `hillytrip_taxi_${type}_export.csv`;

    if (type === 'operators') {
      headers = ['Business Name', 'Owner', 'Phone', 'Email', 'Verification Status', 'Active Status', 'Total Quotes', 'Response Rate', 'Cancellation Rate', 'Rating'];
      rows = operators.map(op => [
        op.taxiOperatorDetails?.businessName || op.businessName || 'N/A',
        op.taxiOperatorDetails?.ownerName || op.name || 'N/A',
        op.taxiOperatorDetails?.mobileNumber || op.mobile || 'N/A',
        op.email || 'N/A',
        op.taxiOperatorStatus || 'pending',
        op.taxiOperatorStatus !== 'suspended' ? 'Active' : 'Blocked',
        op.taxiOperatorStats?.totalQuotes || 0,
        `${(op.taxiOperatorStats?.responseRate || 1) * 100}%`,
        `${(op.taxiOperatorStats?.cancellationRate || 0) * 100}%`,
        op.taxiOperatorStats?.rating || 5.0
      ]);
    } else if (type === 'bookings') {
      headers = ['Booking ID', 'Route', 'Travel Date', 'Traveller', 'Operator', 'Fare', 'Booking Status', 'Payment Status', 'Driver Assigned', 'Vehicle Plate'];
      rows = bookings.map(b => [
        b.id,
        `${b.pickupLocation} → ${b.dropLocation}`,
        b.travelDate,
        b.customerName,
        b.operatorBusinessName,
        `INR ${b.fare}`,
        b.bookingStatus,
        b.paymentStatus,
        b.assignedDriverName || 'Unassigned',
        b.assignedVehicleReg || 'Unassigned'
      ]);
    } else if (type === 'quote-requests') {
      headers = ['Request ID', 'Route', 'Travel Date', 'Pickup Time', 'Traveller', 'Vehicle Preference', 'Status', 'Quotes Submitted', 'Expires At'];
      rows = quoteRequests.map(r => [
        r.id,
        `${r.pickup_location} → ${r.drop_location}`,
        r.travel_date,
        r.pickup_time,
        r.travellerName || 'N/A',
        r.vehicle_preference || 'None',
        r.request_status,
        r.quotesCount || 0,
        r.expires_at
      ]);
    } else if (type === 'audit-logs') {
      headers = ['Log ID', 'Admin Email', 'Action Event', 'Details', 'Timestamp', 'IP Address'];
      rows = auditLogs.map(l => [
        l.id,
        l.email,
        l.action,
        l.details,
        l.timestamp,
        l.ipAddress || '127.0.0.1'
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for filters
  const filteredOperators = operators.filter(op => {
    const bizName = (op.taxiOperatorDetails?.businessName || op.businessName || '').toLowerCase();
    const ownerName = (op.taxiOperatorDetails?.ownerName || op.name || '').toLowerCase();
    const email = (op.email || '').toLowerCase();
    const matchesSearch = bizName.includes(searchTerm.toLowerCase()) || ownerName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && op.taxiOperatorStatus === statusFilter;
  });

  const filteredQuoteRequests = quoteRequests.filter(req => {
    const route = `${req.pickup_location} → ${req.drop_location}`.toLowerCase();
    const traveller = (req.travellerName || '').toLowerCase();
    const matchesSearch = route.includes(searchTerm.toLowerCase()) || traveller.includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && req.request_status === statusFilter;
  });

  const filteredBookings = bookings.filter(b => {
    const route = `${b.pickupLocation} → ${b.dropLocation}`.toLowerCase();
    const traveller = (b.customerName || '').toLowerCase();
    const operator = (b.operatorBusinessName || '').toLowerCase();
    const matchesSearch = route.includes(searchTerm.toLowerCase()) || traveller.includes(searchTerm.toLowerCase()) || operator.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    const matchesPayment = secondaryFilter === 'all' || b.paymentStatus === secondaryFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const filteredReviews = reviews.filter(rev => {
    const comm = rev.review_text.toLowerCase();
    const matchesSearch = comm.includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'flagged') return matchesSearch && rev.reported;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-800">
      {/* 1. OPERATIONS HEADER BANNER */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Activity className="w-48 h-48 text-emerald-500 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Taxi Operator Module Live Sync
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Admin Session: {adminEmail}
            </span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">🚕 Reserved Taxi Marketplace Controller</h3>
          <p className="text-slate-400 text-xs max-w-xl">
            Centralized platform control panel to moderate operators, audit active quotes, emergency-dispatch drivers, verify compliance and view conversion dashboards.
          </p>
        </div>
        <div className="flex gap-2 relative z-10 shrink-0">
          <button 
            onClick={loadData}
            disabled={loading}
            className="bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-SYSTEM NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b pb-3">
        {[
          { id: 'dashboard', label: '📊 Dashboard & Insights', color: 'text-emerald-700' },
          { id: 'quotes', label: '📝 Quote Requests', color: 'text-blue-700' },
          { id: 'bookings', label: '🚕 Bookings & Dispatch', color: 'text-indigo-700' },
          { id: 'operators', label: '🏢 Operator Directory', color: 'text-amber-700' },
          { id: 'compliance', label: '💬 Compliance & Chats', color: 'text-rose-700' },
          { id: 'broadcasts', label: '🔔 Broadcasts', color: 'text-purple-700' },
          { id: 'audit', label: '🪵 Audit Trails', color: 'text-slate-700' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id as any);
              setStatusFilter('all');
              setSecondaryFilter('all');
              setSearchTerm('');
            }}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition cursor-pointer border ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. SUB-TAB VIEWPORT */}

      {/* TAB A: DASHBOARD & INSIGHTS */}
      {activeSubTab === 'dashboard' && stats && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
              <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Total Operators</span>
              <span className="text-3xl font-black text-slate-900 font-mono block">{stats.totalOperators}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Verified: {stats.verifiedOperators}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
              <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Active Bookings</span>
              <span className="text-3xl font-black text-slate-900 font-mono block">{stats.activeBookings}</span>
              <span className="text-[10px] text-indigo-600 font-bold block mt-1">✓ Completed Trips: {stats.completedBookings}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
              <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Total Taxi Revenue</span>
              <span className="text-3xl font-black text-slate-900 font-mono block">₹{stats.totalRevenue.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Platform Share (10%): ₹{(stats.totalRevenue * 0.1).toLocaleString()}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
              <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Conversion Rate</span>
              <span className="text-3xl font-black text-slate-900 font-mono block">{stats.conversionRate}%</span>
              <span className="text-[10px] text-red-600 font-bold block mt-1">✗ Cancellation: {stats.cancellationRate}%</span>
            </div>
          </div>

          {/* Marketplace Health Panel Alerts */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left">
            <div className="flex items-center gap-2 border-b border-amber-100 pb-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="text-xs font-black uppercase text-amber-800 tracking-wider">⚠️ Real-Time Marketplace Health & Risk Warnings</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Alert 1 */}
              <div className="bg-white/80 border border-amber-150 p-3.5 rounded-xl flex items-start gap-3 text-xs">
                <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase shrink-0 mt-0.5">High-Risk</span>
                <div>
                  <p className="font-extrabold text-slate-800">Critical Rating Threshold Breach</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Operator <span className="font-bold font-mono">Druk Himalayan Cabs</span> is averaging <span className="text-red-600 font-bold">3.2 stars</span> across their last 5 completed trips. Customer complaints emphasize vehicle cleanliness issues.</p>
                </div>
              </div>
              {/* Alert 2 */}
              <div className="bg-white/80 border border-amber-150 p-3.5 rounded-xl flex items-start gap-3 text-xs">
                <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase shrink-0 mt-0.5">Delayed</span>
                <div>
                  <p className="font-extrabold text-slate-800">Pending Operator Audits (&gt; 48 hrs)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5"><span className="font-bold">Kanchenjunga Travels</span> submitted documents <span className="font-bold text-amber-700">62 hours ago</span>. Immediate verification or rejection action required in Directory tab.</p>
                </div>
              </div>
              {/* Alert 3 */}
              <div className="bg-white/80 border border-amber-150 p-3.5 rounded-xl flex items-start gap-3 text-xs">
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase shrink-0 mt-0.5">Bids Pending</span>
                <div>
                  <p className="font-extrabold text-slate-800">Unresponded Quote Requests (&gt; 24 hrs)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5"><span className="font-bold">4 active quote requests</span> have zero operator bids submitted, expiring soon. Action: trigger matching dispatcher push to nearby service area fleets.</p>
                </div>
              </div>
              {/* Alert 4 */}
              <div className="bg-white/80 border border-amber-150 p-3.5 rounded-xl flex items-start gap-3 text-xs">
                <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase shrink-0 mt-0.5">Emergency</span>
                <div>
                  <p className="font-extrabold text-slate-800">Unassigned Ride Dispatch Alerts</p>
                  <p className="text-[11px] text-slate-500 mt-0.5"><span className="font-bold text-rose-600">1 confirmed booking</span> has no vehicle/driver dispatched for a trip scheduled within 4 hours. Manual reassignment overrides active.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Bento Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            {/* Chart 1: Daily Quote Requests (Bar Chart) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  Daily Quote Requests (Last 7 Days)
                </h5>
                <p className="text-[10px] text-slate-400">Total high-altitude travel queries compiled across platform nodes</p>
              </div>
              <div className="h-48 w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-end justify-between">
                {[
                  { day: 'Mon', count: 18 },
                  { day: 'Tue', count: 24 },
                  { day: 'Wed', count: 32 },
                  { day: 'Thu', count: 28 },
                  { day: 'Fri', count: 45 },
                  { day: 'Sat', count: 52 },
                  { day: 'Sun', count: 41 }
                ].map((item, idx) => {
                  const percentHeight = `${(item.count / 55) * 100}%`;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end w-1/8 group">
                      <div className="text-[9px] font-mono font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-all bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs mb-1">
                        {item.count}
                      </div>
                      <div 
                        style={{ height: percentHeight }} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all rounded-t-md cursor-pointer"
                      ></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Daily Bookings & Conversions (Line Chart) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Network Bookings & Conversions
                </h5>
                <p className="text-[10px] text-slate-400">Total completed bookings matched with platform quote requests</p>
              </div>
              <div className="h-48 w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                    const y = 20 + p * 120;
                    return (
                      <line key={idx} x1={30} y1={y} x2={470} y2={y} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3 3" />
                    );
                  })}
                  {/* Area path */}
                  <path 
                    d="M 30,140 Q 100,100 170,80 T 310,50 T 450,30 L 450,140 Z" 
                    fill="url(#bookingGrad)" 
                  />
                  {/* Stroke path */}
                  <path 
                    d="M 30,140 Q 100,100 170,80 T 310,50 T 450,30" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    strokeLinecap="round" 
                  />
                  {/* Dots & Labels */}
                  <circle cx={170} cy={80} r={5} fill="#fff" stroke="#6366f1" strokeWidth={2.5} />
                  <text x={170} y={65} className="text-[10px] font-mono font-bold fill-indigo-700" textAnchor="middle">16 Trips</text>
                  <circle cx={310} cy={50} r={5} fill="#fff" stroke="#6366f1" strokeWidth={2.5} />
                  <text x={310} y={35} className="text-[10px] font-mono font-bold fill-indigo-700" textAnchor="middle">24 Trips</text>
                  <circle cx={450} cy={30} r={5} fill="#fff" stroke="#6366f1" strokeWidth={2.5} />
                  <text x={450} y={15} className="text-[10px] font-mono font-bold fill-indigo-700" textAnchor="middle">31 Trips (Today)</text>
                </svg>
              </div>
            </div>

            {/* Popular Route pairs horizontally */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-emerald-600" />
                  Popular Route Performance Analytics
                </h5>
                <p className="text-[10px] text-slate-400">Highest volume taxi pickup and drop pairs this season</p>
              </div>
              <div className="space-y-3">
                {[
                  { route: 'NJP Railway Station ⇄ Gangtok', bookings: 78, conversion: '82%', fareAvg: '₹3,500' },
                  { route: 'Bagdogra Airport ⇄ Darjeeling', bookings: 64, conversion: '75%', fareAvg: '₹3,200' },
                  { route: 'Siliguri Stand ⇄ Kalimpong', bookings: 49, conversion: '88%', fareAvg: '₹2,600' },
                  { route: 'Gangtok Center ⇄ Nathula Pass', bookings: 42, conversion: '90%', fareAvg: '₹5,500' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-700">{item.route}</span>
                      <span className="text-[10.5px] font-mono text-slate-500 font-bold">{item.bookings} bookings • Avg {item.fareAvg}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${(item.bookings / 80) * 100}%` }} className="bg-emerald-600 h-full rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peaks, Conversions Funnel */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Demand Peak Time & Dispatch Heatmap
                </h5>
                <p className="text-[10px] text-slate-400">Total bookings requested grouped by time of pickup</p>
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { time: '04:00 - 09:00', label: 'Morning Peak', bookings: 45, load: 'High', color: 'bg-orange-50 border-orange-200 text-orange-800' },
                  { time: '09:00 - 15:00', label: 'Midday Steady', bookings: 58, load: 'Critical', color: 'bg-rose-50 border-rose-200 text-rose-800' },
                  { time: '15:00 - 19:00', label: 'Evening Transfer', bookings: 38, load: 'Medium', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
                  { time: '19:00 - 04:00', label: 'Night Standby', bookings: 12, load: 'Low', color: 'bg-slate-50 border-slate-200 text-slate-600' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-3.5 border rounded-2xl flex flex-col justify-between items-center ${item.color}`}>
                    <span className="text-[10px] font-mono font-bold leading-none">{item.time}</span>
                    <span className="text-[11px] font-extrabold block mt-2">{item.label}</span>
                    <span className="text-xl font-mono font-black block my-1">{item.bookings}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 border border-current">{item.load}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: QUOTE REQUESTS MANAGER */}
      {activeSubTab === 'quotes' && (
        <div className="space-y-4 animate-fade-in text-left">
          {/* Controls */}
          <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search route or traveller name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                <option value="all">All Requests Status</option>
                <option value="pending">Pending Bids</option>
                <option value="completed">Completed Trips</option>
                <option value="cancelled">Cancelled By User</option>
              </select>
              <button 
                onClick={() => exportToCSV('quote-requests')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table list */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-bold font-mono">
                    <th className="p-4 text-left">Request Info</th>
                    <th className="p-4 text-left">Traveller</th>
                    <th className="p-4 text-left">Details</th>
                    <th className="p-4 text-center">Bids Submitted</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuoteRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
                        <p className="font-bold text-sm">No quote requests found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredQuoteRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-extrabold text-slate-900 text-sm">
                            {req.pickup_location} → {req.drop_location}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {req.id}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{req.travellerName || 'User ID: ' + req.traveller_id}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{req.travellerPhone || 'No contact verified'}</p>
                        </td>
                        <td className="p-4 text-slate-600">
                          <p className="font-medium">Date: <span className="font-mono font-bold text-slate-700">{req.travel_date}</span> @ <span className="font-mono font-bold text-slate-700">{req.pickup_time}</span></p>
                          <p className="text-[11px] mt-1 text-slate-500 italic max-w-xs truncate">
                            Prefs: {req.vehicle_preference || 'No Pref'} • Notes: {req.notes || 'None'}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                            {req.quotesCount || 0} quotes
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            req.request_status === 'pending' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : req.request_status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {req.request_status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-slate-800 text-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Bids</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspect Bids Modal overlay */}
          {selectedRequest && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden border border-slate-200 shadow-2xl animate-scale-up text-slate-800 text-left">
                <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30 block w-max uppercase">Quote Request Audit</span>
                    <h3 className="text-lg font-black mt-1">Bids & Quotations for #{selectedRequest.id.substring(0,8)}</h3>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 space-y-5">
                  <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Route specifications</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 font-medium">Pickup/Drop:</p>
                        <p className="font-extrabold text-slate-900 text-sm">{selectedRequest.pickup_location} → {selectedRequest.drop_location}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 font-medium">Schedule & Capacity:</p>
                        <p className="font-extrabold text-slate-900 font-mono text-sm">{selectedRequest.travel_date} @ {selectedRequest.pickup_time}</p>
                        <p className="text-slate-500 mt-1 font-medium">{selectedRequest.passenger_count} Passengers • Luggage: {selectedRequest.luggage || 0} bags</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <span>Submitted Quotations ({selectedRequest.quotesList?.length || 0})</span>
                    </p>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {!selectedRequest.quotesList || selectedRequest.quotesList.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs">
                          No operators have bid on this request yet.
                        </div>
                      ) : (
                        selectedRequest.quotesList.map((q: any) => (
                          <div key={q.id} className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-all">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900">{q.operatorBusinessName}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                                  q.quote_status === 'accepted' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : q.quote_status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                    : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}>
                                  {q.quote_status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">Message: "{q.operator_message || 'None provided'}"</p>
                              <p className="text-[10px] font-mono text-slate-400 mt-1">Submitted at {new Date(q.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-lg font-mono font-black text-slate-900 block">₹{q.fare}</span>
                              <span className="text-[10px] text-slate-400 font-bold block">Vehicle: {q.vehicleType || 'Any'}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border-t flex justify-end gap-2">
                  <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB C: BOOKING & DISPATCH */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4 animate-fade-in text-left">
          {/* Controls */}
          <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings, traveller or operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="all">All Ride Status</option>
                <option value="pending">Pending Dispatch</option>
                <option value="confirmed">Confirmed Rides</option>
                <option value="completed">Completed Trips</option>
                <option value="cancelled">Cancelled Rides</option>
              </select>
              <select
                value={secondaryFilter}
                onChange={(e) => setSecondaryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
              >
                <option value="all">All Payments</option>
                <option value="pending">Payment Pending</option>
                <option value="captured">Captured (Paid)</option>
                <option value="failed">Payment Failed</option>
              </select>
              <button 
                onClick={() => exportToCSV('bookings')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table List */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-3xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-500 font-bold font-mono">
                    <th className="p-4 text-left">Booking ID</th>
                    <th className="p-4 text-left">Route & Date</th>
                    <th className="p-4 text-left">Traveller</th>
                    <th className="p-4 text-left">Operator / Fleet</th>
                    <th className="p-4 text-left">Fare</th>
                    <th className="p-4 text-left">Dispatch Info</th>
                    <th className="p-4 text-left">Booking</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        <Map className="w-10 h-10 mx-auto opacity-30 mb-2" />
                        <p className="font-bold text-sm">No bookings matching criteria located</p>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-slate-600 font-bold">
                          #{b.id.substring(0,8)}
                        </td>
                        <td className="p-4">
                          <p className="font-extrabold text-slate-900">{b.pickupLocation} → {b.dropLocation}</p>
                          <p className="text-[10.5px] font-mono text-slate-400 mt-1">{b.travelDate}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800">{b.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{b.customerMobile}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-700">{b.operatorBusinessName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Phone: {b.operatorPhone || 'N/A'}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-900">
                          ₹{b.fare}
                        </td>
                        <td className="p-4">
                          {b.assignedDriverName ? (
                            <div>
                              <p className="font-extrabold text-slate-800 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                {b.assignedDriverName}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">Plate: {b.assignedVehicleReg}</p>
                            </div>
                          ) : (
                            <span className="text-[10px] bg-red-50 text-red-700 font-bold border border-red-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <AlertCircle className="w-3 h-3 text-red-600" />
                              Unassigned (Alert)
                            </span>
                          )}
                        </td>
                        <td className="p-4 space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            b.bookingStatus === 'confirmed' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : b.bookingStatus === 'completed'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              : b.bookingStatus === 'cancelled'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {b.bookingStatus}
                          </span>
                          <span className={`block w-max px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                            b.paymentStatus === 'captured' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-50'
                              : 'bg-amber-50 text-amber-700 border-amber-50'
                          }`}>
                            Pay: {b.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Dispatch Controller</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Booking Dispatch Controller Modal Overlay */}
          {selectedBooking && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl animate-scale-up text-slate-800 text-left">
                <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30 block w-max uppercase">Enterprise Dispatch Center</span>
                    <h3 className="text-lg font-black mt-1">Booking Control Override: #{selectedBooking.id.substring(0,8)}</h3>
                  </div>
                  <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Status Toggle buttons */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Force Booking Status Overwrite</p>
                    <div className="flex gap-2">
                      {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleBookingStatus(selectedBooking.id, status)}
                          disabled={submittingAction}
                          className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition cursor-pointer border uppercase ${
                            selectedBooking.bookingStatus === status 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Driver Assignment */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleEmergencyReassign(
                        selectedBooking.id, 
                        formData.get('driverName') as string, 
                        formData.get('regNo') as string
                      );
                    }}
                    className="space-y-3 bg-red-50/50 border border-red-100 p-4 rounded-2xl"
                  >
                    <div className="flex items-center gap-1 border-b border-red-100 pb-1.5">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-xs font-black uppercase text-red-800 tracking-wide">🚨 Emergency Fleet Assignment Bypass</p>
                    </div>
                    <p className="text-[11px] text-slate-500">Allows backoffice admins to manually override or assign driver & vehicle to prevent traveller booking failure.</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-extrabold text-slate-500 block mb-1">Driver's Full Name</label>
                        <input 
                          type="text" 
                          name="driverName"
                          required
                          defaultValue={selectedBooking.assignedDriverName || ''}
                          placeholder="e.g. Pemba Tamang" 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-semibold text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="font-extrabold text-slate-500 block mb-1">Vehicle Plate Number</label>
                        <input 
                          type="text" 
                          name="regNo"
                          required
                          defaultValue={selectedBooking.assignedVehicleReg || ''}
                          placeholder="e.g. SK-01-T-8492" 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono font-semibold text-xs text-slate-800"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={submittingAction}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50 mt-1"
                    >
                      {submittingAction ? 'Processing dispatch bypass...' : 'Confirm Force Assignment'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB D: OPERATORS DIRECTORY */}
      {activeSubTab === 'operators' && (
        <div className="space-y-4 animate-fade-in text-left">
          {/* Controls */}
          <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search business name, owner or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <Filter className="w-3 h-3" /> Audit:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                <option value="all">All Operators Status</option>
                <option value="verified">Verified only</option>
                <option value="pending">Pending Audit</option>
                <option value="rejected">Rejected Apps</option>
                <option value="suspended">Suspended / Blocked</option>
              </select>
              <button 
                onClick={() => exportToCSV('operators')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Directory list of operators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOperators.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white border border-slate-200 rounded-3xl">
                <Users className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm font-bold text-slate-400">No taxi operators found matching criteria</p>
              </div>
            ) : (
              filteredOperators.map(op => {
                const det = op.taxiOperatorDetails || {};
                const statsObj = op.taxiOperatorStats || { totalQuotes: 0, responseRate: 1.0, cancellationRate: 0.0, rating: 5.0, totalReviews: 0 };
                return (
                  <div key={op.id} className="bg-white border rounded-3xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Top operator line */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {det.businessName || op.businessName || 'Placeholder Operator'}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono font-bold block mt-0.5">UID: {op.id}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border shrink-0 ${
                          op.taxiOperatorStatus === 'verified' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                            : op.taxiOperatorStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {op.taxiOperatorStatus || 'pending'}
                        </span>
                      </div>

                      {/* Brief parameters list */}
                      <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p><span className="font-extrabold text-slate-400">OWNER:</span> {det.ownerName || op.name || 'N/A'}</p>
                        <p><span className="font-extrabold text-slate-400">CONTACT:</span> {det.mobileNumber || op.mobile || 'No Phone Verified'} • {op.email}</p>
                        <p><span className="font-extrabold text-slate-400">SERVICE AREAS:</span> {det.operatingRegions || 'Sikkim, Darjeeling, West Bengal'}</p>
                        <p><span className="font-extrabold text-slate-400">LANGUAGES:</span> {det.languagesSpoken || 'N/A'}</p>
                      </div>

                      {/* Mini statistics row */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs border-t pt-3">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Quotes</span>
                          <span className="font-mono font-bold text-slate-800 text-sm">{statsObj.totalQuotes}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Response Rate</span>
                          <span className="font-mono font-bold text-emerald-700 text-sm">{Math.round(statsObj.responseRate * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Cancel Rate</span>
                          <span className="font-mono font-bold text-red-600 text-sm">{Math.round(statsObj.cancellationRate * 100)}%</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Rating</span>
                          <span className="font-mono font-bold text-yellow-600 text-sm flex items-center justify-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-600 text-yellow-600" />
                            {statsObj.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operator management actions buttons */}
                    <div className="flex gap-2 border-t pt-3">
                      <button
                        onClick={() => setEditingOperator(op)}
                        className="flex-1 bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>

                      {op.taxiOperatorStatus !== 'verified' && (
                        <button
                          onClick={() => handleOperatorStatus(op.id, 'verified', 'verify')}
                          className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve Fleet</span>
                        </button>
                      )}

                      {op.taxiOperatorStatus !== 'suspended' ? (
                        <button
                          onClick={() => handleOperatorStatus(op.id, 'suspended', 'suspend')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer border border-red-200"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Block Account</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOperatorStatus(op.id, 'verified', 'activate')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer border border-emerald-200"
                        >
                          <LockOpen className="w-3.5 h-3.5" />
                          <span>Unlock Operator</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Edit Operator details modal */}
          {editingOperator && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 shadow-2xl animate-scale-up text-slate-800 text-left">
                <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-indigo-500/25 text-indigo-300 font-extrabold px-2.5 py-1 rounded-full border border-indigo-500/30 block w-max uppercase font-mono">Backoffice Operator Override</span>
                    <h3 className="text-lg font-black mt-1">Edit Fleet Profile: {editingOperator.email}</h3>
                  </div>
                  <button onClick={() => setEditingOperator(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleEditOperator} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-extrabold text-slate-500 block mb-1">Business Name</label>
                      <input
                        type="text"
                        required
                        value={editingOperator.taxiOperatorDetails?.businessName || ''}
                        onChange={(e) => setEditingOperator({
                          ...editingOperator,
                          taxiOperatorDetails: {
                            ...(editingOperator.taxiOperatorDetails || {}),
                            businessName: e.target.value
                          }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-500 block mb-1">Owner Name</label>
                      <input
                        type="text"
                        required
                        value={editingOperator.taxiOperatorDetails?.ownerName || ''}
                        onChange={(e) => setEditingOperator({
                          ...editingOperator,
                          taxiOperatorDetails: {
                            ...(editingOperator.taxiOperatorDetails || {}),
                            ownerName: e.target.value
                          }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-extrabold text-slate-500 block mb-1">Owner Direct Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={editingOperator.taxiOperatorDetails?.mobileNumber || ''}
                        onChange={(e) => setEditingOperator({
                          ...editingOperator,
                          taxiOperatorDetails: {
                            ...(editingOperator.taxiOperatorDetails || {}),
                            mobileNumber: e.target.value
                          }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-500 block mb-1">Emergency Standby Contact</label>
                      <input
                        type="text"
                        required
                        value={editingOperator.taxiOperatorDetails?.emergencyContact || ''}
                        onChange={(e) => setEditingOperator({
                          ...editingOperator,
                          taxiOperatorDetails: {
                            ...(editingOperator.taxiOperatorDetails || {}),
                            emergencyContact: e.target.value
                          }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-extrabold text-slate-500 block mb-1">Years in Business</label>
                      <input
                        type="number"
                        required
                        value={editingOperator.taxiOperatorDetails?.yearsInBusiness || 0}
                        onChange={(e) => setEditingOperator({
                          ...editingOperator,
                          taxiOperatorDetails: {
                            ...(editingOperator.taxiOperatorDetails || {}),
                            yearsInBusiness: Number(e.target.value)
                          }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-extrabold text-slate-500 block mb-1">Languages Spoken</label>
                      <input
                        type="text"
                        required
                        value={editingOperator.taxiOperatorDetails?.languagesSpoken || ''}
                        onChange={(e) => setEditingOperator({
                          ...editingOperator,
                          taxiOperatorDetails: {
                            ...(editingOperator.taxiOperatorDetails || {}),
                            languagesSpoken: e.target.value
                          }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="font-extrabold text-slate-500 block mb-1">Office Address</label>
                    <textarea
                      required
                      value={editingOperator.taxiOperatorDetails?.businessAddress || ''}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        taxiOperatorDetails: {
                          ...(editingOperator.taxiOperatorDetails || {}),
                          businessAddress: e.target.value
                        }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold text-xs h-16 resize-none"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="font-extrabold text-slate-500 block mb-1 font-semibold leading-none">Operating Service Area Coverage</label>
                    <input
                      type="text"
                      required
                      value={editingOperator.taxiOperatorDetails?.operatingRegions || ''}
                      onChange={(e) => setEditingOperator({
                        ...editingOperator,
                        taxiOperatorDetails: {
                          ...(editingOperator.taxiOperatorDetails || {}),
                          operatingRegions: e.target.value
                        }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold mt-1"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 border-t flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setEditingOperator(null)} className="px-4 py-2 bg-slate-200 font-bold rounded-xl text-slate-700 hover:bg-slate-250 cursor-pointer">Cancel</button>
                    <button type="submit" disabled={submittingAction} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl cursor-pointer disabled:opacity-50">
                      {submittingAction ? 'Saving changes...' : 'Save Override'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB E: COMPLIANCE & AUDITING */}
      {activeSubTab === 'compliance' && (
        <div className="space-y-6 animate-fade-in text-left">
          {/* Sub sub tabs: Reviews Moderator vs Message Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: moderate traveler reviews */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                  Moderate Traveller Reviews ({reviews.length})
                </h5>
                <p className="text-[10px] text-slate-400">Moderate feedback submitted by travelers, check detailed rating breakdowns.</p>
              </div>

              <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">No traveler reviews logged yet.</div>
                ) : (
                  reviews.map(rev => (
                    <div key={rev.id} className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs space-y-3 relative">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-slate-800">Traveller: {rev.travellerName || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400">Target Operator: {rev.operatorBusinessName || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-0.5 text-yellow-600 font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-yellow-600" />
                          {rev.rating} stars
                        </div>
                      </div>

                      <p className="text-slate-600 bg-white p-2.5 rounded-xl border italic border-slate-100">
                        "{rev.review_text}"
                      </p>

                      {/* Flag Indicator */}
                      {rev.reported && (
                        <div className="bg-rose-50 text-rose-800 p-2 border border-rose-200 rounded-xl flex items-center gap-1 text-[10.5px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span className="font-bold">Flagged for Compliance Review</span>
                        </div>
                      )}

                      {/* Moderate action buttons */}
                      <div className="flex justify-end gap-1.5 text-[10.5px]">
                        <button
                          onClick={() => handleReviewAction(rev.id, 'flag')}
                          className="bg-white border hover:bg-slate-100 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 text-slate-600"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{rev.reported ? 'Flagged' : 'Flag review'}</span>
                        </button>
                        <button
                          onClick={() => handleReviewAction(rev.id, 'hide')}
                          className="bg-white border hover:bg-slate-100 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 text-slate-600"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Hide review</span>
                        </button>
                        <button
                          onClick={() => handleReviewAction(rev.id, 'delete')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <Trash className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Message Auditing & Suspicious filters */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
              <div>
                <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Compliance: Chat Auditing Logs
                </h5>
                <p className="text-[10px] text-slate-400">Real-time audit trails of messages exchanged. System automatically flags contacts sharing.</p>
              </div>

              <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
                {chatLogs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">No recent platform chat activity logs located.</div>
                ) : (
                  chatLogs.map(log => (
                    <div key={log.id} className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs space-y-2 relative">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-bold text-slate-700">{log.senderName} → {log.receiverName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      
                      <p className="text-slate-600 font-semibold italic">
                        "{log.message}"
                      </p>

                      {/* Suspicious leak warnings */}
                      {log.flagged && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-2.5 rounded-xl flex items-center gap-2 text-[10.5px]">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <p className="font-black leading-none">Suspicious Action Blocked: Direct contact leakage</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Traveller and operator attempted to bypass commission payment by exchanging contact digits: <span className="font-mono font-bold text-red-600">{log.leakDetails}</span>.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB F: BROADCAST CENTER */}
      {activeSubTab === 'broadcasts' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 animate-fade-in text-left">
          <div>
            <h5 className="font-extrabold text-base text-slate-900 flex items-center gap-1.5">
              <Send className="w-5 h-5 text-emerald-600" />
              Dispatch System-Wide Operator Broadcast
            </h5>
            <p className="text-xs text-slate-500 mt-1">Send a high-priority push or in-app announcement to taxi operator fleets, drivers, or specific travelers.</p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="font-extrabold text-slate-500 block mb-1">Target Audience</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-xs text-slate-800"
              >
                <option value="all">System Broadcast: All Operators and Fleets</option>
                <option value="verified_only">Verified Operators Only (Compliance channel)</option>
                <option value="specific_operator">Targeted Operator (Target specific user_id)</option>
              </select>
            </div>

            {broadcastTarget === 'specific_operator' && (
              <div>
                <label className="font-extrabold text-slate-500 block mb-1">Select Target Operator</label>
                <select
                  value={specificOperatorId}
                  onChange={(e) => setSpecificOperatorId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-xs text-slate-800"
                >
                  <option value="">-- Choose Operator --</option>
                  {operators.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.taxiOperatorDetails?.businessName || o.businessName} ({o.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="font-extrabold text-slate-500 block mb-1">Broadcast Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 📢 Landslide warning: NH10 closure details"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs"
              />
            </div>

            <div>
              <label className="font-extrabold text-slate-500 block mb-1">Broadcast Message Body</label>
              <textarea
                required
                rows={4}
                placeholder="Write detailed notification payload here. Operators will receive this alert instantaneously in their dashboard notification bell..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingAction}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingAction ? 'Broadcasting Alert...' : 'Dispatch Notification Broadcast'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB G: AUDIT TRAILS & EXPORTS */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* CSV Export hub */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
            <div>
              <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                CSV Data Export Center
              </h5>
              <p className="text-[10px] text-slate-400">Export high-altitude marketplace databases to local spreadsheet formats.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                onClick={() => exportToCSV('operators')}
                className="bg-slate-50 border hover:bg-slate-100 border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
              >
                <Users className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Taxi Operators</span>
                <span className="text-[10px] text-slate-400 font-mono">Count: {operators.length}</span>
              </button>
              <button 
                onClick={() => exportToCSV('bookings')}
                className="bg-slate-50 border hover:bg-slate-100 border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
              >
                <Map className="w-6 h-6 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Taxi Bookings</span>
                <span className="text-[10px] text-slate-400 font-mono">Count: {bookings.length}</span>
              </button>
              <button 
                onClick={() => exportToCSV('quote-requests')}
                className="bg-slate-50 border hover:bg-slate-100 border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
              >
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">Quote Requests</span>
                <span className="text-[10px] text-slate-400 font-mono">Count: {quoteRequests.length}</span>
              </button>
              <button 
                onClick={() => exportToCSV('audit-logs')}
                className="bg-slate-50 border hover:bg-slate-100 border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer"
              >
                <Shield className="w-6 h-6 text-slate-600" />
                <span className="text-xs font-bold text-slate-700">Admin Audit Logs</span>
                <span className="text-[10px] text-slate-400 font-mono">Count: {auditLogs.length}</span>
              </button>
            </div>
          </div>

          {/* Audit Logs list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
            <div>
              <h5 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                Backoffice Administrative Action Logs
              </h5>
              <p className="text-[10px] text-slate-400">Traceable database audit trails compiled instantly upon administrator actions.</p>
            </div>
            
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-3xs text-xs">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-500 font-bold font-mono">
                      <th className="p-3 text-left">Timestamp</th>
                      <th className="p-3 text-left">Admin Email</th>
                      <th className="p-3 text-left">Action Executed</th>
                      <th className="p-3 text-left">Audit Log Details</th>
                      <th className="p-3 text-right">Node IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">No action logs compiled yet.</td>
                      </tr>
                    ) : (
                      auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono text-slate-400 text-[10.5px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold text-slate-700">{log.email}</td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="bg-emerald-50 text-emerald-800 font-black px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase text-[9.5px]">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{log.details}</td>
                          <td className="p-3 text-right font-mono text-slate-400 font-bold">{log.ipAddress || '127.0.0.1'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
