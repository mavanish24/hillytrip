import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Sparkles,
  Layers,
  Search,
  Filter,
  FileText,
  Play,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  Activity,
  UserCheck,
  Server
} from 'lucide-react';
import {
  CommunicationStats,
  NotificationQueueItem,
  NotificationDeliveryLog,
  NotificationFailure,
  NotificationTemplate,
  NotificationEventType,
  NotificationChannel
} from '../../types/communication';

export default function AdminCommunicationDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'logs' | 'templates' | 'tester'>('overview');
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [queue, setQueue] = useState<NotificationQueueItem[]>([]);
  const [logs, setLogs] = useState<NotificationDeliveryLog[]>([]);
  const [failures, setFailures] = useState<NotificationFailure[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Selected Template for editing
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [templateSavedMsg, setTemplateSavedMsg] = useState(false);

  // Tester state
  const [testEventType, setTestEventType] = useState<NotificationEventType>('BOOKING_CONFIRMED');
  const [testRecipientEmail, setTestRecipientEmail] = useState('customer@hillytrip.com');
  const [testRecipientPhone, setTestRecipientPhone] = useState('+919832012345');
  const [testCustomerName, setTestCustomerName] = useState('Ananya Sen');
  const [testPickup, setTestPickup] = useState('NJP Railway Station Stand');
  const [testDestination, setTestDestination] = useState('Gangtok Main Stand');
  const [testPrice, setTestPrice] = useState('3500');
  const [testResultMsg, setTestResultMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, queueRes, logsRes, failRes, tplRes] = await Promise.all([
        fetch('/api/admin/communication/stats'),
        fetch('/api/admin/communication/queue'),
        fetch('/api/admin/communication/logs'),
        fetch('/api/admin/communication/failures'),
        fetch('/api/admin/communication/templates')
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.success) setStats(d.stats);
      }

      if (queueRes.ok) {
        const d = await queueRes.json();
        if (d.success) setQueue(d.queue || []);
      }

      if (logsRes.ok) {
        const d = await logsRes.json();
        if (d.success) setLogs(d.logs || []);
      }

      if (failRes.ok) {
        const d = await failRes.json();
        if (d.success) setFailures(d.failures || []);
      }

      if (tplRes.ok) {
        const d = await tplRes.json();
        if (d.success) setTemplates(d.templates || []);
      }
    } catch (err) {
      console.error('Error loading communication dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRetry = async (queueItemId: string) => {
    try {
      const res = await fetch('/api/admin/communication/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueItemId })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch('/api/admin/communication/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate)
      });
      if (res.ok) {
        setTemplateSavedMsg(true);
        setTimeout(() => setTemplateSavedMsg(false), 2000);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFireTestEvent = async () => {
    setTesting(true);
    setTestResultMsg(null);
    try {
      const res = await fetch('/api/admin/communication/test-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: testEventType,
          recipientId: 'test_user_1',
          recipientEmail: testRecipientEmail,
          recipientPhone: testRecipientPhone,
          recipientRole: 'customer',
          variables: {
            booking_id: `HT-LIVE-${Math.floor(1000 + Math.random() * 9000)}`,
            customer_name: testCustomerName,
            pickup: testPickup,
            destination: testDestination,
            journey_date: '2026-08-05',
            vehicle: 'Innova Crysta 4x4',
            quote_price: testPrice,
            operator_name: 'Gangtok Royal Mountain Cabs',
            driver_name: 'Tenzing Sherpa',
            driver_phone: testRecipientPhone
          }
        })
      });

      if (res.ok) {
        const d = await res.json();
        setTestResultMsg(`Event Dispatched Successfully! In-App Created: ${d.result.notificationsCreated}, Queued across external channels: ${d.result.queuedCount}`);
        fetchDashboardData();
      } else {
        setTestResultMsg('Failed to dispatch test event.');
      }
    } catch (err) {
      setTestResultMsg('Error firing event.');
    } finally {
      setTesting(false);
    }
  };

  const ALL_EVENT_TYPES: NotificationEventType[] = [
    'BOOKING_CREATED',
    'BOOKING_ASSIGNED',
    'BOOKING_CONFIRMED',
    'BOOKING_REJECTED',
    'BOOKING_CANCELLED',
    'BOOKING_EXPIRED',
    'DRIVER_ASSIGNED',
    'DRIVER_CHANGED',
    'DRIVER_ARRIVING',
    'TRIP_STARTED',
    'TRIP_COMPLETED',
    'QUOTE_REQUESTED',
    'QUOTE_SUBMITTED',
    'QUOTE_ACCEPTED',
    'QUOTE_EXPIRED',
    'OPERATOR_ONLINE',
    'OPERATOR_OFFLINE',
    'OPERATOR_APPROVED',
    'OPERATOR_SUSPENDED',
    'CUSTOMER_REVIEW_REQUESTED',
    'PAYMENT_RECEIVED',
    'REFUND_ISSUED'
  ];

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">Communication Engine Control Center</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Phase 2B Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Event-driven multi-channel notifier (In-App, Push, WhatsApp, SMS, Email) with retry engine
            </p>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-2 border border-slate-700 self-start md:self-auto"
        >
          <RotateCw className="w-4 h-4 text-emerald-400" /> Refresh Bus
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold">Total Processed</span>
            <Send className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.totalSent || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Notifications dispatched</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.delivered || 0}
          </p>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 font-semibold">100% provider success</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold">Queue Backlog</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.queued || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Pending retry/dispatch</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold">Retry Count</span>
            <RotateCw className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.retryCount || 0}
          </p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 font-semibold">Backoff policy active</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold">Failures</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {stats?.failed || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Max 5 retries reached</p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" /> System Overview
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'queue'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> Live Queue ({queue.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Delivery Logs ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'templates'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Template Editor ({templates.length})
        </button>

        <button
          onClick={() => setActiveTab('tester')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'tester'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Play className="w-4 h-4" /> Event Bus Tester
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CHANNELS BREAKDOWN */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" /> Channel Providers Health & Traffic
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Business Cloud API</h4>
                    <p className="text-[10px] text-slate-400">Direct WhatsApp messages with template variables</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {stats?.byChannel?.whatsapp || 0} sent
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Web & Mobile Push Notifications</h4>
                    <p className="text-[10px] text-slate-400">Firebase FCM / WebPush gateway</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                  {stats?.byChannel?.push || 0} sent
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">SMS Gateway (DLT Verified)</h4>
                    <p className="text-[10px] text-slate-400">Himalayan low-connectivity fallback</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  {stats?.byChannel?.sms || 0} sent
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Email Transactional Engine</h4>
                    <p className="text-[10px] text-slate-400">SendGrid / SES HTML Itinerary receipts</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  {stats?.byChannel?.email || 0} sent
                </span>
              </div>
            </div>
          </div>

          {/* PRIORITY RULES & POLICY */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Event Bus Routing Policy
            </h3>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs space-y-2">
              <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Decoupled Event Architecture
              </div>
              <p className="text-emerald-800 dark:text-emerald-400 leading-relaxed">
                The Booking Engine dispatches lightweight event objects without wait states. The Communication Engine validates preferences, renders template strings, and routes to appropriate channel providers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Exponential Retry Policy:</div>
              <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 space-y-1 font-mono text-[11px]">
                <li>1st Attempt: Instant upon event dispatch</li>
                <li>2nd Retry: 1 minute delay</li>
                <li>3rd Retry: 5 minutes delay</li>
                <li>4th Retry: 15 minutes delay</li>
                <li>5th Retry: 1 hour delay (Max 5 attempts)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Live Delivery Queue</h3>
            <span className="text-[10px] font-mono text-slate-400">{queue.length} items queued</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">Next Try</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No notifications currently in queue backlog.
                    </td>
                  </tr>
                ) : (
                  queue.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {item.eventType}
                      </td>
                      <td className="p-3 uppercase text-[10px] font-bold text-slate-500">
                        {item.channel}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {item.recipientContact}
                      </td>
                      <td className="p-3 font-mono">
                        {item.attemptCount} / {item.maxAttempts}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">
                        {new Date(item.nextAttemptAt).toLocaleTimeString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 uppercase">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleManualRetry(item.id)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <RotateCw className="w-3 h-3" /> Retry
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Delivery History & Provider Logs</h3>
            <span className="text-[10px] font-mono text-slate-400">{logs.length} logged events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">Time</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Channel / Provider</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No delivery logs recorded yet. Use the tester to generate event logs.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {log.eventType}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        <span className="uppercase text-[10px] font-bold text-emerald-600 block">{log.channel}</span>
                        <span className="text-[10px] text-slate-400">{log.providerName}</span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {log.recipient}
                      </td>
                      <td className="p-3 font-mono">{log.attemptCount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 uppercase">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TEMPLATE EDITOR */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TEMPLATE LIST */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Templates ({templates.length})</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={`p-3 rounded-2xl cursor-pointer border transition ${
                    selectedTemplate?.id === t.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>{t.eventType}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[9px] uppercase">
                      {t.channel}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-1">{t.titleTemplate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* TEMPLATE EDITOR FORM */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            {selectedTemplate ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Edit Template: {selectedTemplate.eventType} ({selectedTemplate.channel.toUpperCase()})
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {selectedTemplate.id}</p>
                  </div>
                  {templateSavedMsg && (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Template Saved!
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    Title / Subject Template
                  </label>
                  <input
                    type="text"
                    value={selectedTemplate.titleTemplate}
                    onChange={e =>
                      setSelectedTemplate({ ...selectedTemplate, titleTemplate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    Body Template (Supports {'{{variable_name}}'})
                  </label>
                  <textarea
                    rows={5}
                    value={selectedTemplate.bodyTemplate}
                    onChange={e =>
                      setSelectedTemplate({ ...selectedTemplate, bodyTemplate: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-mono"
                  />
                </div>

                <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-2xl text-[10px] font-mono text-slate-500">
                  Available Variables: customer_name, booking_id, operator_name, vehicle, journey_date, pickup, destination, quote_price, driver_name, driver_phone
                </div>

                <button
                  onClick={handleSaveTemplate}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
                >
                  Save Template Changes
                </button>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold">Select a template from the left list to inspect or edit.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: EVENT BUS TESTER */}
      {activeTab === 'tester' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-500" /> Live Event Bus Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Select any event type and trigger live notifications across In-App, Push, WhatsApp, SMS, and Email channels simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Event Type *
              </label>
              <select
                value={testEventType}
                onChange={e => setTestEventType(e.target.value as any)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-semibold"
              >
                {ALL_EVENT_TYPES.map(evt => (
                  <option key={evt} value={evt}>
                    {evt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={testCustomerName}
                onChange={e => setTestCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={testRecipientEmail}
                onChange={e => setTestRecipientEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Recipient Phone (WhatsApp/SMS)
              </label>
              <input
                type="text"
                value={testRecipientPhone}
                onChange={e => setTestRecipientPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Pickup Hub
              </label>
              <input
                type="text"
                value={testPickup}
                onChange={e => setTestPickup(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Destination Hub
              </label>
              <input
                type="text"
                value={testDestination}
                onChange={e => setTestDestination(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleFireTestEvent}
              disabled={testing}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Fire Test Event
            </button>

            {testResultMsg && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {testResultMsg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
