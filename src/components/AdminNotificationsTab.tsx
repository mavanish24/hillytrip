import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckCircle, XCircle, Trash2, Edit3, Plus, Search, Filter, 
  MapPin, AlertTriangle, Home, Star, RefreshCw, Eye, Image as ImageIcon,
  ShieldAlert, Radio, AlertCircle
} from 'lucide-react';
import { AppNotification } from '../types';

interface AdminNotificationsTabProps {
  adminEmail: string;
}

export default function AdminNotificationsTab({ adminEmail }: AdminNotificationsTabProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending' | 'published' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<AppNotification | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState<'custom' | 'destination_added' | 'attraction_added' | 'homestay_added' | 'route_alert' | 'travel_advisory'>('custom');
  const [formPriority, setFormPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'draft' | 'pending' | 'published' | 'rejected'>('draft');
  const [formIsPush, setFormIsPush] = useState(false);

  // Special Route Alert fields
  const [formRouteName, setFormRouteName] = useState('');
  const [formRouteStatus, setFormRouteStatus] = useState<'Open' | 'Closed' | 'Restricted' | 'Partially Open'>('Open');

  // Special reference links (optional)
  const [formDestinationId, setFormDestinationId] = useState('');
  const [formAttractionId, setFormAttractionId] = useState('');
  const [formHomestayId, setFormHomestayId] = useState('');

  // Notifications statistics
  const stats = {
    total: notifications.length,
    pending: notifications.filter(n => n.status === 'pending').length,
    published: notifications.filter(n => n.status === 'published').length,
    rejected: notifications.filter(n => n.status === 'rejected').length,
    draft: notifications.filter(n => n.status === 'draft').length
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/app-notifications?email=${encodeURIComponent(adminEmail)}`);
      if (!res.ok) {
        throw new Error('Could not pull backoffice notifications catalogue.');
      }
      const data = await res.json();
      setNotifications(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching app notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [adminEmail]);

  // Open modal for creating new notification
  const handleOpenCreateModal = () => {
    setEditingNotif(null);
    setFormTitle('');
    setFormMessage('');
    setFormType('custom');
    setFormPriority('normal');
    setFormImageUrl('');
    setFormStatus('draft');
    setFormIsPush(false);
    setFormRouteName('');
    setFormRouteStatus('Open');
    setFormDestinationId('');
    setFormAttractionId('');
    setFormHomestayId('');
    setIsModalOpen(true);
  };

  // Open modal for editing existing notification
  const handleOpenEditModal = (notif: AppNotification) => {
    setEditingNotif(notif);
    setFormTitle(notif.title);
    setFormMessage(notif.message);
    setFormType(notif.type as any);
    setFormPriority(notif.priority || 'normal');
    setFormImageUrl(notif.imageUrl || '');
    setFormStatus(notif.status);
    setFormIsPush(!!notif.isPushNotification);
    setFormRouteName(notif.routeName || '');
    setFormRouteStatus((notif.routeStatus as any) || 'Open');
    setFormDestinationId(notif.destinationId || '');
    setFormAttractionId(notif.attractionId || '');
    setFormHomestayId(notif.homestayId || '');
    setIsModalOpen(true);
  };

  // Submit hander for save / edit
  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) {
      alert('Notification title and message are required.');
      return;
    }

    // Build payload
    const payload: any = {
      title: formTitle,
      message: formMessage,
      type: formType,
      priority: formPriority,
      status: formStatus,
      imageUrl: formImageUrl.trim() || null,
      isPushNotification: formIsPush,
      destinationId: formDestinationId.trim() || null,
      attractionId: formAttractionId.trim() || null,
      homestayId: formHomestayId.trim() || null,
      routeName: formType === 'route_alert' ? formRouteName.trim() : null,
      routeStatus: formType === 'route_alert' ? formRouteStatus : null
    };

    try {
      let isSuccess = false;
      if (editingNotif) {
        // Edit flow
        const res = await fetch(`/api/admin/app-notifications/${editingNotif.id}?email=${encodeURIComponent(adminEmail)}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-email': adminEmail
          },
          body: JSON.stringify(payload)
        });
        isSuccess = res.ok;
      } else {
        // Create flow
        const res = await fetch(`/api/admin/app-notifications?email=${encodeURIComponent(adminEmail)}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-admin-email': adminEmail
          },
          body: JSON.stringify(payload)
        });
        isSuccess = res.ok;
      }

      if (isSuccess) {
        setIsModalOpen(false);
        fetchNotifications();
      } else {
        alert('Operation failed. Please review values and try restarting backend stores.');
      }
    } catch (err) {
      console.error(err);
      alert('Network or permissions failure saving notification node.');
    }
  };

  // Update Status directly (e.g. Publish, Approve, Reject)
  const handleStatusUpdate = async (id: string, newStatus: 'published' | 'rejected' | 'pending' | 'draft') => {
    try {
      const res = await fetch(`/api/admin/app-notifications/${id}?email=${encodeURIComponent(adminEmail)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchNotifications();
      } else {
        alert('Could not update notification status registry.');
      }
    } catch (err) {
      console.error(err);
      alert('Internal communications failure during status workflow adjustment.');
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    if (!window.confirm('Delete this notification forever from record archives?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/app-notifications/${id}?email=${encodeURIComponent(adminEmail)}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': adminEmail
        }
      });
      if (res.ok) {
        fetchNotifications();
      } else {
        alert('Delete procedure was unsuccessful.');
      }
    } catch (err) {
      console.error(err);
      alert('Network fault while carrying out deletion.');
    }
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'important':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      default:
        return 'bg-sky-100 text-sky-800 border border-sky-100';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-800 font-semibold';
      case 'pending':
        return 'bg-amber-100 text-amber-800 font-semibold pulse-soft animate-pulse';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 font-semibold';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'destination_added':
        return <MapPin className="w-5 h-5 text-indigo-600" />;
      case 'attraction_added':
        return <Star className="w-5 h-5 text-amber-500" />;
      case 'homestay_added':
        return <Home className="w-5 h-5 text-teal-600" />;
      case 'route_alert':
        return <Radio className="w-5 h-5 text-rose-600 animate-pulse" />;
      case 'travel_advisory':
        return <ShieldAlert className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getNiceFormatType = (type: string) => {
    return type.toUpperCase().replace('_', ' ');
  };

  // Filter application list
  const filteredNotifications = notifications.filter(n => {
    const query = searchQuery.toLowerCase();
    const matchSearch = n.title.toLowerCase().includes(query) || 
                        n.message.toLowerCase().includes(query) ||
                        (n.routeName && n.routeName.toLowerCase().includes(query));
    
    const matchStatus = statusFilter === 'all' || n.status === statusFilter;
    const matchType = typeFilter === 'all' || n.type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  return (
    <div id="admin-notifications-panel" className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            HillyTrip System Notifications Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Gating system: draft & automatically generated pending alerts are quarantined from users until formally approved / published by administrators.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          id="btn-create-notif"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition cursor-pointer text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Broadcast Notification
        </button>
      </div>

      {/* METRICS WIDGETS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Ledger</span>
          <span className="text-2xl font-black text-slate-800 mt-2">{stats.total}</span>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Moderation</span>
          <span className="text-2xl font-black text-amber-700 mt-2">{stats.pending}</span>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Published Live</span>
          <span className="text-2xl font-black text-emerald-700 mt-2">{stats.published}</span>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Rejected Alerts</span>
          <span className="text-2xl font-black text-rose-700 mt-2">{stats.rejected}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Draft Items</span>
          <span className="text-2xl font-black text-slate-700 mt-2">{stats.draft}</span>
        </div>
      </div>

      {/* SEARCH AND FILTER WORKSPACE */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col lg:flex-row gap-4 items-stretch justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notification titles, messages, route statuses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-850 placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-bold text-slate-800"
            >
              <option value="all">All Categories</option>
              <option value="custom">Custom Notification</option>
              <option value="destination_added">Destination Added</option>
              <option value="attraction_added">Attraction Added</option>
              <option value="homestay_added">Homestay Added</option>
              <option value="route_alert">Route / Roads Alert</option>
              <option value="travel_advisory">Travel Advisory</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent focus:outline-none font-bold text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={fetchNotifications}
            title="Refresh database records"
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ERROR HANDLER */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* DATA CATALOGUE LIST */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-3 font-mono">Syncing backoffice notification arrays...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400">
          <Bell className="w-12 h-12 mx-auto stroke-1.5 opacity-50 mb-3" />
          <p className="font-semibold text-slate-700">No Notifications Found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">No records found matching status `{statusFilter}` and type `{typeFilter}` with your keyword search queries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<<<<<<< HEAD
          {filteredNotifications.map((notif, idx) => (
            <div 
              key={notif.id ? `notif-${notif.id}-${idx}` : `notif-idx-${idx}`}
              id={`notif-card-${notif.id || idx}`}
=======
          {filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              id={`notif-card-${notif.id}`}
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
              className="bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col"
            >
              {/* TOP HEADER */}
              <div className="p-4 flex items-start justify-between border-b border-slate-50 bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-105 shadow-xs">
                    {getCategoryIcon(notif.type)}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                      {getNiceFormatType(notif.type)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${getPriorityBadgeClass(notif.priority)}`}>
                    {notif.priority || 'normal'}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md ${getStatusBadgeClass(notif.status)}`}>
                    {notif.status}
                  </span>
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="p-4 flex-1 flex gap-3">
                {notif.imageUrl && (
                  <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                    <img 
                      src={notif.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{notif.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed break-words">{notif.message}</p>

                  {/* SPECIAL ROUTE STATUS BLOCK */}
                  {notif.type === 'route_alert' && notif.routeName && (
                    <div className="mt-2.5 p-2 bg-rose-50/50 border border-rose-100 rounded-lg flex items-center justify-between text-xs font-mono">
                      <div className="text-slate-700">
                        🛣️ <strong className="text-slate-900">{notif.routeName}</strong>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        notif.routeStatus === 'Open' ? 'bg-emerald-100 text-emerald-800' :
                        notif.routeStatus === 'Closed' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {notif.routeStatus || 'Open'}
                      </span>
                    </div>
                  )}

                  {/* RELATED ENTITIES */}
                  <div className="flex flex-wrap gap-1 mt-2 text-[10px] font-mono text-slate-400">
                    {notif.destinationId && <span>📍 dest_id: {notif.destinationId.substring(0,6)}...</span>}
                    {notif.attractionId && <span>⭐ attr_id: {notif.attractionId.substring(0,6)}...</span>}
                    {notif.homestayId && <span>🏠 home_id: {notif.homestayId.substring(0,6)}...</span>}
                  </div>
                </div>
              </div>

              {/* AUDIT DETAILS / PUBLISHED FOOTER */}
              {notif.status === 'published' && notif.approvedAt && (
                <div className="px-4 py-2 bg-emerald-50/30 border-t border-slate-50 text-[10px] text-slate-500 font-mono flex justify-between">
                  <span>Approved By: <strong>{notif.approvedBy || 'Admin'}</strong></span>
                  <span>Approved On: {new Date(notif.approvedAt).toLocaleDateString()}</span>
                </div>
              )}

              {/* ACTION FOOTER */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(notif)}
                    id={`btn-edit-notif-${notif.id}`}
                    className="p-1 px-2.5 border border-slate-200 rounded bg-white hover:text-emerald-600 transition cursor-pointer text-xs font-semibold flex items-center gap-1 text-slate-650"
                  >
                    <Edit3 className="w-3 h-3" />
                    Modify
                  </button>
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    id={`btn-delete-notif-${notif.id}`}
                    className="p-1 px-2 rounded-md hover:bg-rose-50 hover:text-rose-600 text-slate-400 hover:border-rose-100 border border-transparent transition cursor-pointer"
                    title="Remove permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {notif.status !== 'published' && (
                    <button
                      onClick={() => handleStatusUpdate(notif.id, 'published')}
                      id={`btn-approve-notif-${notif.id}`}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve & Publish
                    </button>
                  )}
                  {notif.status === 'published' && (
                    <button
                      onClick={() => handleStatusUpdate(notif.id, 'rejected')}
                      id={`btn-reject-notif-${notif.id}`}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Revoke
                    </button>
                  )}
                  {notif.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(notif.id, 'rejected')}
                      id={`btn-refuse-notif-${notif.id}`}
                      className="px-2.5 py-1 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATION AND EDITING DRAWER / MODAL CONTAINER */}
      {isModalOpen && (
        <div id="notif-modal-backdrop" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            id="notif-modal-body"
            className="bg-white rounded-2xl border border-slate-100 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
                <Bell className="w-5 h-5 text-emerald-600" />
                {editingNotif ? 'Modify App Notification Instance' : 'Publish Broadcast Platform Alert'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 font-black px-2 py-1 text-sm bg-slate-200/50 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNotification} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Type Category */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Alert Category / Trigger Type</label>
                <select 
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-semibold text-slate-800"
                >
                  <option value="custom">💬 Custom Broadcast Alert</option>
                  <option value="route_alert">🛣️ Route status / Road alert</option>
                  <option value="travel_advisory">⚠️ Health & travel advisory</option>
                  <option value="destination_added">📍 Destination addition notification</option>
                  <option value="attraction_added">⭐ Attraction addition notification</option>
                  <option value="homestay_added">🏠 Homestay addition notification</option>
                </select>
              </div>

              {/* Row: Title & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Notification Title</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Landslide near Rohtang Pass"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Priority Stage</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm font-semibold text-slate-800"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Message Payload */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Main Broadcast Description / Alert Message</label>
                <textarea
                  required
                  rows={3}
                  maxLength={500}
                  placeholder="Explain details of road blocks, permit requirements or attractions added..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm placeholder:text-slate-400"
                />
              </div>

              {/* Image URL Decoration */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Cover Image Attachment URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/images/notification.jpg"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 text-sm placeholder:text-slate-400"
                  />
                  {formImageUrl && (
                    <div className="w-10 h-10 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                      <img src={formImageUrl} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>

              {/* SPECIAL FIELDS DEPENDING ON ACTIONS */}
              {formType === 'route_alert' && (
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-3">
                  <div className="text-[11px] font-black uppercase text-rose-800 tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Interactive Road Status Module Fields
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Route Highway Name</label>
                      <input
                        type="text"
                        placeholder="e.g. NH-21 Manali Keylong"
                        value={formRouteName}
                        onChange={(e) => setFormRouteName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-rose-400 text-xs text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Highway Status</label>
                      <select
                        value={formRouteStatus}
                        onChange={(e) => setFormRouteStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-rose-400 text-xs font-bold text-slate-800"
                      >
                        <option value="Open">🟢 Transit Open</option>
                        <option value="Closed">🔴 Closed / Terminated</option>
                        <option value="Restricted">🟡 Restricted (Force)</option>
                        <option value="Partially Open">🟠 Partially Open</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* REFERENCE MAPPINGS */}
              {(formType === 'destination_added' || formType === 'attraction_added' || formType === 'homestay_added') && (
                <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-3">
                  <div className="text-[11px] font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Master Data Reference Mapping (Optional UUID)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Destination ID</label>
                      <input
                        type="text"
                        placeholder="dest-uuid"
                        value={formDestinationId}
                        onChange={(e) => setFormDestinationId(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Attraction ID</label>
                      <input
                        type="text"
                        placeholder="attr-uuid"
                        value={formAttractionId}
                        onChange={(e) => setFormAttractionId(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500">Homestay ID</label>
                      <input
                        type="text"
                        placeholder="home-uuid"
                        value={formHomestayId}
                        onChange={(e) => setFormHomestayId(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status and Push Delivery */}
              <div className="p-3.5 rounded-xl border border-slate-150 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Target State</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                  >
                    <option value="draft">📁 Draft (Internal)</option>
                    <option value="pending">⏳ Pending Approval</option>
                    <option value="published">🚀 Published Live</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="checkbox-push"
                    checked={formIsPush}
                    onChange={(e) => setFormIsPush(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="checkbox-push" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Trigger push notification?
                  </label>
                </div>
              </div>

              {/* Actions Footer inside Modal */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 font-semibold rounded-lg text-slate-700 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-modal"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white rounded-lg transition text-sm cursor-pointer shadow-md"
                >
                  {editingNotif ? 'Update Broadcast' : 'Publish Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
