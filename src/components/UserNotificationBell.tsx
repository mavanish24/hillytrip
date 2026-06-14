import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Check, CheckCheck, MapPin, Star, Home, Radio, ShieldAlert, 
  Trash2, AlertTriangle, ExternalLink, Calendar, RefreshCw
} from 'lucide-react';
import { AppNotification } from '../types';

export default function UserNotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read notification IDs from local storage
  const loadReadHistory = () => {
    try {
      const stored = localStorage.getItem('hillytrip_read_notifs');
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load read notification history from local storage', e);
    }
  };

  // Save read notification IDs to local storage
  const saveReadHistory = (ids: string[]) => {
    try {
      localStorage.setItem('hillytrip_read_notifs', JSON.stringify(ids));
      setReadIds(ids);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPublishedNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/app-notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch system notifications on portal side:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadHistory();
    fetchPublishedNotifications();

    // Polling hourly for auto-updates while browsing
    const interval = setInterval(fetchPublishedNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside click to collapse popover dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter unread
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readIds.includes(id)) {
      const next = [...readIds, id];
      saveReadHistory(next);
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    saveReadHistory(allIds);
  };

  const handleClearRead = () => {
    saveReadHistory([]);
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

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'destination_added':
        return <MapPin className="w-4 h-4 text-indigo-600" />;
      case 'attraction_added':
        return <Star className="w-4 h-4 text-amber-500" />;
      case 'homestay_added':
        return <Home className="w-4 h-4 text-teal-600" />;
      case 'route_alert':
        return <Radio className="w-4 h-4 text-rose-600" />;
      case 'travel_advisory':
        return <ShieldAlert className="w-4 h-4 text-orange-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getNiceFormatType = (type: string) => {
    return type.toUpperCase().replace('_', ' ');
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} id="portal-notification-bell-container">
      {/* BELL TRIGGER KEY */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="portal-btn-bell-notifs"
        className="relative p-2.5 rounded-full text-slate-705 border border-slate-200/80 bg-white hover:bg-slate-50 hover:text-slate-900 transition focus:outline-none cursor-pointer"
        aria-label="Toggle notifications dropdown menu"
      >
        <Bell className="w-5 h-5 text-slate-650" />
        {unreadCount > 0 && (
          <span 
            id="notif-badge-count"
            className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-rose-600 rounded-full border border-white transform translate-x-1 -translate-y-1 scale-95"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN CONTAINER POPOVER */}
      {isOpen && (
        <div 
          id="portal-notifs-dropdown"
          className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-slate-150 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-950 text-sm tracking-tight">HillyTrip Alert Center</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchPublishedNotifications}
                title="Refresh listings"
                className="p-1 hover:bg-slate-200/60 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              {unreadCount > 0 ? (
                <button
                  onClick={handleMarkAllAsRead}
                  id="btn-mark-all-read"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-extrabold transition cursor-pointer flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              ) : readIds.length > 0 ? (
                <button
                  onClick={handleClearRead}
                  className="text-[10px] text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  Reset read filter
                </button>
              ) : null}
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <SpinnerIcon />
                <span className="mt-2 block">Syncing fresh travel advisories...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 opacity-40 mx-auto stroke-1.5 mb-2" />
                <span className="text-xs font-bold text-slate-600">No Notifications Available</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Everything is clear on your highways!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isRead = readIds.includes(notif.id);
                return (
                  <div 
                    key={notif.id}
                    id={`portal-notif-item-${notif.id}`}
                    onClick={(e) => handleMarkAsRead(notif.id, e as any)}
                    className={`p-3.5 hover:bg-slate-50 transition duration-150 cursor-pointer flex gap-3 ${
                      !isRead ? 'bg-emerald-50/20 font-medium border-l-3 border-emerald-500' : 'opacity-80'
                    }`}
                  >
                    {/* Cover Thumbnail if attached */}
                    {notif.imageUrl && (
                      <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shrink-0 mt-0.5">
                        <img 
                          src={notif.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="p-0.5 rounded bg-slate-100 border border-slate-200">
                          {getCategoryIcon(notif.type)}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 tracking-wider">
                          {getNiceFormatType(notif.type)}
                        </span>
                        {notif.priority !== 'normal' && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${getPriorityBadgeClass(notif.priority)}`}>
                            {notif.priority}
                          </span>
                        )}
                      </div>

                      <h4 className="text-slate-900 text-xs font-extrabold leading-tight tracking-tight break-words">
                        {notif.title}
                      </h4>
                      <p className="text-slate-600 text-[11px] leading-snug break-words">
                        {notif.message}
                      </p>

                      {/* SPECIAL ROUTE STATUS BLOCK */}
                      {notif.type === 'route_alert' && notif.routeName && (
                        <div className="mt-1.5 p-1.5 bg-rose-50/30 border border-rose-100 rounded flex items-center justify-between text-[10px] font-mono">
                          <div className="text-slate-700 font-bold">🛣️ {notif.routeName}</div>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                            notif.routeStatus === 'Open' ? 'bg-emerald-100 text-emerald-800' :
                            notif.routeStatus === 'Closed' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {notif.routeStatus || 'Open'}
                          </span>
                        </div>
                      )}

                      <div className="text-[9px] text-slate-400 flex items-center justify-between pt-1">
                        <span className="font-mono">{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        {!isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            id={`btn-read-item-${notif.id}`}
                            className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer view */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono">
            HillyTrip Platform Notifications • Realtime
          </div>
        </div>
      )}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-5 w-5 text-emerald-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
