import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Check, CheckCheck, MapPin, Star, Home, Radio, ShieldAlert, 
<<<<<<< HEAD
  Trash2, AlertTriangle, ExternalLink, Calendar, RefreshCw, Filter, 
  Search, Sliders, Volume2, UserCheck, CheckCircle, XCircle, Info, 
  Mail, Settings, AlertOctagon, HelpCircle, Activity, Award, Eye, 
  ArrowRight, Zap, X, BellOff, MessageSquare, Shield, Megaphone,
  Car, Cloud, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UNENotification, UNENotificationPreferences } from '../types';

interface UserNotificationBellProps {
  userId?: string;
  role?: string;
}

export default function UserNotificationBell({ userId: propUserId, role: propRole }: UserNotificationBellProps) {
  const [notifications, setNotifications] = useState<UNENotification[]>([]);
  const [preferences, setPreferences] = useState<UNENotificationPreferences | null>(null);
  
  // Local state for actions / layout
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [smartGrouping, setSmartGrouping] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Track archived and deleted IDs in local storage to keep database unchanged but support full lifecycle
  const [archivedIds, setArchivedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hillytrip_une_archived_ids');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hillytrip_une_deleted_ids');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Dynamic user detection (handles authenticated traveler, partner, or guest)
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = () => {
      try {
        const raw = localStorage.getItem('hillytrip_user');
        if (raw) {
          setUser(JSON.parse(raw));
          return;
        }
        const rawSession = localStorage.getItem('hillytrip_user_session');
        if (rawSession) {
          setUser(JSON.parse(rawSession));
          return;
        }
        // Fallback to finding admin user
        const rawAdmin = localStorage.getItem('hillytrip_admin_user');
        if (rawAdmin) {
          setUser(JSON.parse(rawAdmin));
          return;
        }
      } catch (e) {
        console.error('Error fetching user from local storage:', e);
      }
    };

    fetchUser();
    // Listen to storage events to auto-sync user state
    window.addEventListener('storage', fetchUser);
    return () => window.removeEventListener('storage', fetchUser);
  }, []);

  const currentUserId = propUserId || user?.id || user?.email || localStorage.getItem('hillytrip_guest_id') || 'guest_traveller';
  const currentUserRole = propRole || user?.role || 'customer';

  // Show customized toast notifications
  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch normalized aggregated notifications from UNE Gateway
  const fetchAggregatedNotifications = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/une/notifications?userId=${encodeURIComponent(currentUserId)}&role=${currentUserRole}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (err) {
      console.error('UNE: Failed to fetch notifications:', err);
=======
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
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // Fetch UNE Preferences
  const fetchUnePreferences = async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`/api/une/preferences?userId=${encodeURIComponent(currentUserId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (err) {
      console.error('UNE: Failed to fetch preferences:', err);
    }
  };

  // Update UNE Preferences
  const handleUpdatePreferences = async (updated: UNENotificationPreferences) => {
    setPreferences(updated);
    try {
      const res = await fetch('/api/une/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, preferences: updated })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          triggerToast('Preferences saved successfully!', 'success');
          // Re-fetch because preferences affect notification visibility
          fetchAggregatedNotifications();
        }
      }
    } catch (err) {
      console.error('UNE: Failed to update preferences:', err);
      triggerToast('Could not sync preferences with server.', 'error');
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchAggregatedNotifications();
      fetchUnePreferences();
    }
  }, [currentUserId, currentUserRole]);

  // Real-time polling to keep notifications synced instantly (Simulated WebSocket Realtime)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUserId && isOpen) {
        fetchAggregatedNotifications();
      }
    }, 4500); // Poll every 4.5s while drawer is open
    return () => clearInterval(interval);
  }, [currentUserId, isOpen]);

  // Handle outside click to close popover dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      const panel = document.getElementById('une-alert-panel');
      const isOutsidePanel = !panel || !panel.contains(event.target as Node);
      if (isOutsideDropdown && isOutsidePanel) {
=======
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
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

<<<<<<< HEAD
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const updateCoords = () => {
    if (!dropdownRef.current) return;
    const rect = dropdownRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      setCoords({
        top: rect.bottom + 12,
        left: 12,
        width: window.innerWidth - 24
      });
    } else {
      const width = 420;
      // Align right edge of popup with right edge of button
      let left = rect.right - width;
      
      // If it clips left edge, shift right
      if (left < 12) {
        left = 12;
      }
      
      // If it clips right edge, shift left
      const rightBoundary = window.innerWidth - 12;
      if (left + width > rightBoundary) {
        left = rightBoundary - width;
      }
      
      // Safety guard for left clipping
      if (left < 12) {
        left = 12;
      }

      setCoords({
        top: rect.bottom + 12,
        left,
        width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  // Mark specific notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/une/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        triggerToast('Notification marked as read', 'success');
      }
    } catch (err) {
      console.error('UNE: Failed to mark read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/une/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, role: currentUserRole })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        triggerToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      console.error('UNE: Failed to mark all read:', err);
    }
  };

  // Archive notification (saved in LocalStorage to maintain clean DB)
  const handleArchiveNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...archivedIds, id];
    setArchivedIds(updated);
    localStorage.setItem('hillytrip_une_archived_ids', JSON.stringify(updated));
    triggerToast('Notification archived', 'info');
  };

  // Soft delete notification (saved in LocalStorage)
  const handleDeleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    localStorage.setItem('hillytrip_une_deleted_ids', JSON.stringify(updated));
    triggerToast('Notification deleted', 'info');
  };

  // Simulator Handler: Calls the UNE Simulation API and instantly updates state
  const handleTriggerSimulation = async (eventType: string) => {
    try {
      const res = await fetch('/api/une/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, userId: currentUserId, role: currentUserRole })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          triggerToast(`Simulated event: ${eventType.replace(/_/g, ' ')}!`, 'success');
          // Instant reload (Optimistic UI update)
          fetchAggregatedNotifications();
          // Bounce to alerts tab to see the result
          setActiveTab('all');
        }
      }
    } catch (e) {
      console.error('UNE: Simulation trigger failed:', e);
      triggerToast('Simulation failed to trigger.', 'error');
    }
  };

  // Helper styles, labels, & icons for premium look
  const getCategoryTheme = (category: string) => {
    const norm = (category || '').toLowerCase();
    switch (norm) {
      case 'taxi':
        return {
          icon: <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30',
          label: '🚕 Taxi Marketplace'
        };
      case 'homestay':
      case 'homestays':
      case 'tour':
      case 'booking':
      case 'bookings':
        return {
          icon: <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30',
          label: '🏡 Bookings & Reservations'
        };
      case 'weather':
        return {
          icon: <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
          bg: 'bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/30',
          label: '⛈️ Weather Update'
        };
      case 'roads':
      case 'road':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30',
          label: '🚧 Road Update'
        };
      case 'offers':
      case 'marketing':
      case 'promo':
        return {
          icon: <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30',
          label: '🎁 Exclusive Offer'
        };
      case 'messages':
      case 'message':
      case 'chat':
        return {
          icon: <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
          bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30',
          label: '💬 Messages'
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
          bg: 'bg-slate-50 dark:bg-slate-850 border-slate-150 dark:border-slate-800',
          label: '🔔 Alert Update'
        };
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-4 border-rose-500 bg-rose-50/40 dark:bg-rose-950/10 shadow-sm animate-pulse';
      case 'high':
        return 'border-l-3 border-amber-500 bg-amber-50/10 dark:bg-amber-950/5';
      default:
        return 'border-l-3 border-slate-200 dark:border-slate-800';
    }
  };

  // Helper function to format timestamp beautifully
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return past.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Some time ago';
    }
  };

  // Core smart grouping and filtering engine
  const processAndFilterNotifications = () => {
    // 1. Remove soft-deleted and archived items
    let list = notifications.filter(n => !deletedIds.includes(n.id) && !archivedIds.includes(n.id));

    // 2. Filter by search query (if notifications >= 20 and query exists)
    if (notifications.length >= 20 && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n => 
        (n.title || '').toLowerCase().includes(q) || 
        (n.message || '').toLowerCase().includes(q) || 
        (n.id || '').toLowerCase().includes(q) ||
        (n.category || '').toLowerCase().includes(q)
      );
    }

    // 3. Filter by category
    if (activeCategoryFilter !== 'all') {
      list = list.filter(n => {
        const cat = (n.category || '').toLowerCase();
        const titleAndMsg = ((n.title || '') + ' ' + (n.message || '')).toLowerCase();
        
        switch (activeCategoryFilter) {
          case 'bookings':
            return ['homestay', 'homestays', 'tour', 'booking', 'bookings'].includes(cat) || 
                   titleAndMsg.includes('booking') || titleAndMsg.includes('reservation');
          case 'taxi':
            return cat === 'taxi' || titleAndMsg.includes('taxi') || titleAndMsg.includes('cab');
          case 'weather':
            return cat === 'weather' || titleAndMsg.includes('weather') || titleAndMsg.includes('forecast') || titleAndMsg.includes('rain') || titleAndMsg.includes('snow');
          case 'roads':
            return ['roads', 'road', 'highway', 'traffic'].includes(cat) || 
                   titleAndMsg.includes('road') || titleAndMsg.includes('highway') || titleAndMsg.includes('landslide') || titleAndMsg.includes('monsoon') || titleAndMsg.includes('permit');
          case 'offers':
            return ['marketing', 'offers', 'offer', 'promo', 'discount'].includes(cat) || 
                   titleAndMsg.includes('offer') || titleAndMsg.includes('discount') || titleAndMsg.includes('promo');
          case 'messages':
            return ['messages', 'message', 'chat'].includes(cat) || 
                   titleAndMsg.includes('message') || titleAndMsg.includes('chat');
          default:
            return cat === activeCategoryFilter;
        }
      });
    }

    // 4. Apply smart grouping (Anti-Spam Requirement)
    if (smartGrouping && !searchQuery) {
      const grouped: UNENotification[] = [];
      const messagesGroup: UNENotification[] = [];
      const quotesGroup: UNENotification[] = [];
      const homestaysGroup: UNENotification[] = [];
      
      list.forEach(item => {
        if (!item.isRead) {
          if (item.category === 'messages' && item.type === 'new_message') {
            messagesGroup.push(item);
          } else if (item.category === 'taxi' && item.type === 'booking_submitted') {
            quotesGroup.push(item);
          } else if (item.category === 'homestay' && item.type === 'booking_submitted') {
            homestaysGroup.push(item);
          } else {
            grouped.push(item);
          }
        } else {
          grouped.push(item);
        }
      });

      // Collapse Messages Group
      if (messagesGroup.length > 1) {
        grouped.unshift({
          id: `group_msg_${Date.now()}`,
          userId: currentUserId,
          title: '💬 Unread Live Messages Group',
          message: `You have ${messagesGroup.length} unread messages in your chats.`,
          type: 'new_message_group',
          category: 'messages',
          priority: 'high',
          isRead: false,
          isArchived: false,
          isDeleted: false,
          createdAt: messagesGroup[0].createdAt,
          actionUrl: '/messages',
          actionLabel: 'Open Chat Inbox'
        });
      } else if (messagesGroup.length === 1) {
        grouped.push(messagesGroup[0]);
      }

      // Collapse Taxi Quotes Group
      if (quotesGroup.length > 1) {
        grouped.unshift({
          id: `group_taxi_${Date.now()}`,
          userId: currentUserId,
          title: '🚕 Multiple Taxi Quotations',
          message: `You received ${quotesGroup.length} new taxi quotes for review.`,
          type: 'taxi_quote_group',
          category: 'taxi',
          priority: 'high',
          isRead: false,
          isArchived: false,
          isDeleted: false,
          createdAt: quotesGroup[0].createdAt,
          actionUrl: '/messages',
          actionLabel: 'View Quotations'
        });
      } else if (quotesGroup.length === 1) {
        grouped.push(quotesGroup[0]);
      }

      // Collapse Homestays Group
      if (homestaysGroup.length > 1) {
        grouped.unshift({
          id: `group_homestay_${Date.now()}`,
          userId: currentUserId,
          title: '🏡 Multiple Homestay Requests',
          message: `You have ${homestaysGroup.length} pending Homestay enquiries.`,
          type: 'homestay_booking_group',
          category: 'homestay',
          priority: 'high',
          isRead: false,
          isArchived: false,
          isDeleted: false,
          createdAt: homestaysGroup[0].createdAt,
          actionUrl: '/messages',
          actionLabel: 'Open Inbox'
        });
      } else if (homestaysGroup.length === 1) {
        grouped.push(homestaysGroup[0]);
      }

      // Sort with critical/high first, then date
      return grouped.sort((a, b) => {
        if (a.priority === 'critical' && b.priority !== 'critical') return -1;
        if (a.priority !== 'critical' && b.priority === 'critical') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return list;
  };

  const rawVisible = processAndFilterNotifications();
  const visibleNotifications = activeTab === 'unread' ? rawVisible.filter(n => !n.isRead) : rawVisible;
  const unreadCount = notifications.filter(n => !n.isRead && !deletedIds.includes(n.id) && !archivedIds.includes(n.id)).length;

  return (
    <div className="relative inline-block" ref={dropdownRef} id="hillytrip-une-bell-root">
      {/* Dynamic Toast notifications in popover */}
      {toastMessage && (
        <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-in slide-in-from-bottom-5 duration-300 ${
          toastMessage.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
          toastMessage.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
          'bg-slate-900 text-white border-slate-800'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
          {toastMessage.type === 'error' && <XCircle className="w-4 h-4 shrink-0" />}
          <span className="flex-1 min-w-0 break-words">{toastMessage.text}</span>
        </div>
      )}

      {/* Trigger Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchAggregatedNotifications();
            fetchUnePreferences();
          }
        }}
        id="une-bell-btn"
        className={`relative p-2.5 rounded-full border transition duration-250 focus:outline-none cursor-pointer flex items-center justify-center ${
          isOpen 
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
        }`}
        title="Notifications"
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span 
            id="une-badge-count"
            className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 py-0.5 text-[10px] font-black leading-none text-white bg-rose-600 rounded-full border border-white transform translate-x-1 -translate-y-1"
=======
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
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
          >
            {unreadCount}
          </span>
        )}
      </button>

<<<<<<< HEAD
      {/* Main Drawer Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            id="une-alert-panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Notifications Panel"
            className="fixed z-50 bg-[var(--surface,white)] dark:bg-[var(--surface,#0f172a)] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] rounded-[20px] flex flex-col h-auto max-h-[calc(100vh-120px)] md:max-h-[80vh] overflow-hidden"
            style={coords ? { top: coords.top, left: coords.left, width: coords.width } : { opacity: 0, position: 'fixed' }}
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight flex items-center gap-1.5">
                  🔔 Notifications
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Stay updated about your trips
                </p>
              </div>

              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg cursor-pointer"
                    aria-label="Mark all as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/35">
              {[
                { id: 'all', label: 'All', icon: <Bell className="w-3.5 h-3.5" /> },
                { id: 'unread', label: 'Unread', icon: <CheckCircle className="w-3.5 h-3.5" /> },
                { id: 'settings', label: 'Settings', icon: <Sliders className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === 'all' && notifications.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-330 text-[9px] font-black rounded-full leading-none">
                      {notifications.length}
                    </span>
                  )}
                  {tab.id === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-slate-900 custom-scrollbar">
              {/* ALERTS VIEW (ALL or UNREAD) */}
              {(activeTab === 'all' || activeTab === 'unread') && (
                <div className="flex flex-col h-full">
                  {/* Search bar & Horizontal Categories Scroll */}
                  <div className="p-3 bg-slate-50/40 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
                    {/* Only show search input if there are >= 20 notifications */}
                    {notifications.length >= 20 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search notifications..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Horizontal Categories Scroll */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'bookings', label: 'Bookings' },
                        { id: 'taxi', label: 'Taxi' },
                        { id: 'weather', label: 'Weather' },
                        { id: 'roads', label: 'Roads' },
                        { id: 'offers', label: 'Offers' },
                        { id: 'messages', label: 'Messages' }
                      ].map(filter => (
                        <button
                          key={filter.id}
                          onClick={() => setActiveCategoryFilter(filter.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                            activeCategoryFilter === filter.id
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 border border-slate-200/60 dark:border-slate-700/60'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    {/* Anti-Spam Control Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-450 dark:text-slate-500">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smartGrouping}
                          onChange={(e) => setSmartGrouping(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 h-3 w-3"
                        />
                        <span className="font-semibold flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> Enable Smart Anti-Spam Grouping
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Notifications List Area */}
                  <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto">
                    {loading && visibleNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center h-full my-auto">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
                        <p className="text-xs text-slate-400">Syncing updates...</p>
                      </div>
                    ) : visibleNotifications.length === 0 ? (
                      /* Centered Empty State */
                      <div className="flex flex-col items-center justify-center py-16 px-6 text-center h-full my-auto">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                          <Bell className="w-8 h-8 text-slate-400 dark:text-slate-500 stroke-1" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
                          You're all caught up!
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs leading-relaxed">
                          We'll notify you about bookings, taxi confirmations, weather, permits and road updates.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[280px] mt-8">
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              window.location.hash = '#/';
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer shadow-sm text-center"
                          >
                            Explore Destinations
                          </button>
                          <button
                            onClick={() => setActiveTab('settings')}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer border border-slate-200/50 dark:border-slate-700/50 text-center"
                          >
                            Notification Settings
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Animated Notification Items List */
                      <div className="flex flex-col">
                        {visibleNotifications.map((notif) => {
                          const theme = getCategoryTheme(notif.category);
                          return (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                              key={notif.id}
                              className={`p-4 flex gap-3 transition-all duration-200 text-left relative ${getPriorityClass(notif.priority)} ${
                                !notif.isRead 
                                  ? 'bg-emerald-500/5 dark:bg-emerald-500/2 font-medium' 
                                  : 'opacity-80 hover:opacity-100 bg-white dark:bg-slate-900/40'
                              } hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:shadow-xs`}
                            >
                              {/* Left Icon Badge */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${theme.bg}`}>
                                {theme.icon}
                              </div>

                              {/* Central Message Info */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-350">
                                      {theme.label}
                                    </span>
                                    {notif.priority !== 'normal' && (
                                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                        notif.priority === 'critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400' : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {notif.priority}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                    {formatTimeAgo(notif.createdAt)}
                                  </span>
                                </div>

                                <h4 className="text-slate-900 dark:text-white text-sm font-extrabold leading-tight tracking-tight break-words">
                                  {notif.title}
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed break-words font-sans">
                                  {notif.message}
                                </p>

                                {/* Metadata / Road status / Smart actions block */}
                                {notif.metadata?.routeName && (
                                  <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-750 rounded-xl flex items-center justify-between text-[11px] font-mono">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">🛣️ {notif.metadata.routeName}</span>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400">
                                      {notif.metadata.routeStatus || 'Closed'}
                                    </span>
                                  </div>
                                )}

                                {/* Dynamic Action Buttons */}
                                <div className="flex items-center justify-between pt-2 gap-2">
                                  <div className="flex items-center gap-2">
                                    {notif.actionUrl && (
                                      <a
                                        href={notif.actionUrl}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleMarkAsRead(notif.id);
                                          setIsOpen(false);
                                          if (notif.actionUrl?.startsWith('open_chat_')) {
                                            const cid = notif.actionUrl.replace('open_chat_', '');
                                            window.location.hash = `/messages?active=${cid}`;
                                            window.location.reload();
                                          } else {
                                            window.location.hash = notif.actionUrl || '';
                                            window.location.reload();
                                          }
                                        }}
                                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-sm cursor-pointer"
                                      >
                                        <span>{notif.actionLabel || 'View Details'}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                    
                                    {!notif.isRead && (
                                      <button
                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                        className="text-[11px] text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 font-semibold flex items-center gap-1 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition"
                                      >
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        Mark read
                                      </button>
                                    )}
                                  </div>

                                  {/* Archive / Delete controls */}
                                  <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition">
                                    <button
                                      onClick={(e) => handleArchiveNotif(notif.id, e)}
                                      title="Archive alert"
                                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteNotif(notif.id, e)}
                                      title="Soft Delete"
                                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SETTINGS VIEW */}
              {activeTab === 'settings' && (
                <div className="p-5 space-y-6 text-xs text-slate-800 dark:text-slate-200">
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex gap-3">
                    <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Configure Alerts Delivery</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                        Toggle delivery categories and channels to prevent notification overload. Settings are instantly persisted.
                      </p>
                    </div>
                  </div>

                  {/* Category Toggles */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                      Category Subscriptions
                    </h4>
                    
                    {[
                      { id: 'taxi', label: '🚕 Taxi Marketplace', desc: 'Driver bids, quotes accepted, revisions, trip starting' },
                      { id: 'homestays', label: '🏡 Homestay & Cabin Bookings', desc: 'Stay check-in instructions, booking confirmations, reservation cancellations' },
                      { id: 'bookings', label: '📅 General Bookings', desc: 'Tour operator package bookings, activities, guide arrangements' },
                      { id: 'messages', label: '💬 Live Messaging Alerts', desc: 'Direct chat messages, operator replies, traveler requests' },
                      { id: 'reviews', label: '⭐ Review Alerts & Stars', desc: 'Review approvals, ratings left by travelers, replies' },
                      { id: 'marketing', label: '🎁 Discounts & Promotions', desc: 'Special custom pricing, travel suggestions, off-season rates' },
                      { id: 'announcements', label: '📢 Platforms Announcements', desc: 'Monsoon advisories, road closures, government updates' }
                    ].map(cat => {
                      const isChecked = preferences ? (preferences as any)[cat.id] !== false : true;
                      return (
                        <div key={cat.id} className="flex items-start justify-between gap-4">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-900 dark:text-white block text-sm">{cat.label}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-450 leading-snug block">{cat.desc}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updated = {
                                  ...preferences,
                                  [cat.id]: e.target.checked
                                } as any;
                                handleUpdatePreferences(updated);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Channels */}
                  <div className="space-y-4 pt-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                      Multi-Channel Integrations
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'inApp', label: '🔔 In-App Bell Alert', status: 'Active', active: true },
                        { id: 'browserPush', label: '🌐 Browser Push', status: 'Enabled', active: true },
                        { id: 'email', label: '📧 Email Updates', status: 'Active', active: true },
                        { id: 'whatsapp', label: '💬 WhatsApp Messenger', status: 'Phase 2 (Stub)', active: false },
                        { id: 'sms', label: '📱 SMS Alerts', status: 'Phase 2 (Stub)', active: false }
                      ].map(ch => (
                        <div key={ch.id} className="p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col justify-between">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{ch.label}</span>
                          <div className="flex items-center justify-between pt-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              ch.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {ch.status}
                            </span>
                            <input 
                              type="checkbox"
                              checked={ch.active}
                              disabled={!ch.active}
                              className="rounded text-emerald-600 h-3.5 w-3.5 border-slate-300"
                              readOnly
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
=======
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
>>>>>>> 2b89dbe2640650f239b483f99d03b06df15072a8
