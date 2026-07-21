import React, { useState, useEffect } from 'react';
import { 
  Bell, Mail, Phone, Clock, ShieldAlert, CheckCircle, XCircle, Info,
  AlertTriangle, Filter, Search, CheckCheck, ExternalLink, Calendar
} from 'lucide-react';
import { BookingNotification } from '../types';

interface BookingNotificationCenterProps {
  userId: string;
  role: 'customer' | 'partner';
  onSelectLead?: (leadId: string) => void;
}

export default function BookingNotificationCenter({ 
  userId, 
  role,
  onSelectLead 
}: BookingNotificationCenterProps) {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/booking-notifications?userId=${encodeURIComponent(userId)}&role=${role}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch booking notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [userId, role]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/booking-notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/booking-notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Filter & Search Logic
  const filteredNotifs = notifications.filter(n => {
    const matchesSearch = searchQuery 
      ? (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.message.toLowerCase().includes(searchQuery.toLowerCase()) || n.leadId.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesCategory = activeCategory === 'all'
      ? true
      : activeCategory === 'unread'
        ? !n.isRead
        : n.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'expired':
        return <ShieldAlert className="w-4 h-4 text-slate-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-indigo-600" />;
      case 'need_more_info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-450" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-2">
            🔔 Live Alerts Inbox
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-mono animate-pulse">
                {unreadCount} UNREAD
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-455 dark:text-slate-400 mt-1">Real-time status updates & partner reminders.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs px-3.5 py-1.5 rounded-xl transition font-bold font-mono cursor-pointer shadow-3xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-905/60 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts or Booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'reminder', label: 'Reminders' },
            { id: 'need_more_info', label: 'Inquiries' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto max-h-[450px] divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mb-2"></div>
            <p className="text-slate-400 text-xs font-mono">Syncing alert inbox...</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-xs text-slate-900 dark:text-slate-400 font-extrabold">Your Alert Inbox is Clean</p>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">No notifications match your current search and filter criteria.</p>
          </div>
        ) : (
          filteredNotifs.map((notif, idx) => (
            <div
              key={notif.id ? `booking-notif-${notif.id}-${idx}` : `booking-notif-idx-${idx}`}
              onClick={() => {
                handleMarkAsRead(notif.id);
                if (onSelectLead && notif.leadId) {
                  onSelectLead(notif.leadId);
                }
              }}
              className={`p-4 flex gap-3.5 transition-all text-left cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850 ${
                !notif.isRead ? 'bg-emerald-50/15 dark:bg-emerald-950/5 border-l-3 border-emerald-500' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {getCategoryIcon(notif.category)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-xs font-extrabold ${!notif.isRead ? 'text-slate-950 dark:text-white' : 'text-slate-800 dark:text-slate-300'}`}>
                    {notif.title}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-500 dark:text-slate-400 font-mono px-2 py-0.5 rounded-full font-bold">
                    ID: {notif.leadId}
                  </span>
                  {onSelectLead && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono flex items-center gap-1 hover:underline">
                      View Lead <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
