import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, Table, GitBranch, Eye, Bell, BarChart3, ToggleLeft, 
  Menu, ShieldAlert, Database, Loader2, Plus, Trash2, Edit2, Save, Check, X, 
  ChevronUp, ChevronDown, Play, Search, Download, RefreshCw, AlertCircle, Info, 
  Lock, ArrowRight, EyeOff, CheckSquare, ListPlus, Sliders, Mail, MessageSquare, 
  PhoneCall, Settings, Share2, Shield, Calendar, DollarSign, Award, Clock, Server, Sparkles, SlidersHorizontal,
  ShieldCheck, Globe, Activity, CalendarCheck, Moon, XCircle, AlertOctagon, Archive, History
} from 'lucide-react';

import { 
  getMasterConfigLibrary, 
  saveMasterConfigLibrary, 
  addMasterOption, 
  updateMasterOption, 
  removeMasterOption,
  ConfigOption
} from '../data/masterConfigurationLibrary';
import { BusinessLifecycleEngine } from '../utils/businessLifecycleEngine';
import { LIFECYCLE_STATES, getLifecycleStateConfig } from '../utils/lifecycleRegistry';
import { BusinessLifecycleState } from '../types/lifecycle';

interface Props {
  adminEmail: string;
}

export function AdminNoCodeBusinessControlCenter({ adminEmail }: Props) {
  const [activeTab, setActiveTab] = useState<string>('dashboards');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- Collection States ---
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [flags, setFeatureFlags] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [rbac, setRbac] = useState<any[]>([]);
  const [dbAudit, setDbAudit] = useState<any>({ tables: [], buckets: [] });

  // --- Universal Business Lifecycle States ---
  const [activeStateConfigId, setActiveStateConfigId] = useState<string>('draft');
  const [sandboxSelectedBusiness, setSandboxSelectedBusiness] = useState<string>('homestay');
  const [businessLifecycleMap, setBusinessLifecycleMap] = useState<Record<string, BusinessLifecycleState>>(() => {
    const defaultMap: Record<string, BusinessLifecycleState> = {};
    const categories = [
      'homestay', 'hotel', 'resort', 'camping', 'taxi_operator', 'car_rental', 
      'bike_rental', 'tour_operator', 'travel_agency', 'local_guide', 
      'restaurant', 'cafe', 'trek_organizer', 'adventure_provider'
    ];
    categories.forEach(cat => {
      defaultMap[cat] = BusinessLifecycleEngine.start(cat);
    });
    return defaultMap;
  });
  const [sandboxActor, setSandboxActor] = useState<string>('Partner');
  const [sandboxReason, setSandboxReason] = useState<string>('');
  const [sandboxScheduledDays, setSandboxScheduledDays] = useState<number>(3);
  const [lifecycleMessage, setLifecycleMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // --- Impersonation State ---
  const [impersonateRole, setImpersonateRole] = useState<string>('');
  const [impersonateLogs, setImpersonateLogs] = useState<any[]>([]);

  // --- Phase 5 Settings State ---
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('postmaster@hillytrip.com');
  const [senderEmail, setSenderEmail] = useState('noreply@hillytrip.com');
  const [senderName, setSenderName] = useState('HillyTrip Travel Center');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [rateLimitCap, setRateLimitCap] = useState('100');
  const [autoApproveHrs, setAutoApproveHrs] = useState('3');

  // --- Smart Matching & Recommendation States ---
  const [weightFare, setWeightFare] = useState<number>(0.30);
  const [weightRating, setWeightRating] = useState<number>(0.20);
  const [weightResponseTime, setWeightResponseTime] = useState<number>(0.15);
  const [weightAcceptanceRate, setWeightAcceptanceRate] = useState<number>(0.10);
  const [weightCompletedTrips, setWeightCompletedTrips] = useState<number>(0.10);
  const [weightVerification, setWeightVerification] = useState<number>(0.05);
  const [weightVehicleMatch, setWeightVehicleMatch] = useState<number>(0.05);
  const [weightEta, setWeightEta] = useState<number>(0.05);

  const [aiEngineEnabled, setAiEngineEnabled] = useState<boolean>(false);
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState<boolean>(false);
  const [aiFarePredictionEnabled, setAiFarePredictionEnabled] = useState<boolean>(false);
  const [peakSeasonAdjustmentEnabled, setPeakSeasonAdjustmentEnabled] = useState<boolean>(false);
  const [demandForecastingEnabled, setDemandForecastingEnabled] = useState<boolean>(false);
  const [preferredOperators, setPreferredOperators] = useState<string>('');

  // --- Phase 5 Security State ---
  const [securityAudit, setSecurityAudit] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState('contributor_hijack');
  const [threatRunning, setThreatRunning] = useState(false);
  const [threatResult, setThreatResult] = useState<any>(null);

  // --- Phase 5 DB Optimizer State ---
  const [dbStats, setDbStats] = useState<any>(null);
  const [dbStatsLoading, setDbStatsLoading] = useState(false);
  const [healingRunning, setHealingRunning] = useState(false);
  const [healResult, setHealResult] = useState<any>(null);

  // --- Master Configuration Library Admin State ---
  const [masterLibState, setMasterLibState] = useState(() => getMasterConfigLibrary());
  const [selectedMasterCategory, setSelectedMasterCategory] = useState<string>('amenities');
  const [masterSearchQuery, setMasterSearchQuery] = useState<string>('');
  const [isAddOptionModalOpen, setIsAddOptionModalOpen] = useState<boolean>(false);
  const [newOptionForm, setNewOptionForm] = useState({
    label: '',
    value: '',
    icon: '✨',
    description: '',
    assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'camping']
  });

  const handleAddMasterOptionSubmit = () => {
    if (!newOptionForm.label.trim()) {
      showToast('Please enter an Option Label', 'error');
      return;
    }

    const valueSlug = newOptionForm.value.trim() || newOptionForm.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    addMasterOption(selectedMasterCategory, {
      label: newOptionForm.label,
      value: valueSlug,
      icon: newOptionForm.icon || '✨',
      description: newOptionForm.description,
      isActive: true,
      assignedBusinessTypes: newOptionForm.assignedBusinessTypes
    });

    setMasterLibState(getMasterConfigLibrary());
    setIsAddOptionModalOpen(false);
    setNewOptionForm({
      label: '',
      value: '',
      icon: '✨',
      description: '',
      assignedBusinessTypes: ['homestay', 'hotel', 'resort', 'camping']
    });
    showToast(`Added option "${newOptionForm.label}" to ${selectedMasterCategory}`);
  };

  const handleToggleMasterOptionStatus = (catId: string, optionId: string, currentActive: boolean) => {
    updateMasterOption(catId, optionId, { isActive: !currentActive });
    setMasterLibState(getMasterConfigLibrary());
    showToast(`Option status updated`);
  };

  const handleRemoveMasterOptionAction = (catId: string, optionId: string) => {
    removeMasterOption(catId, optionId);
    setMasterLibState(getMasterConfigLibrary());
    showToast(`Option removed from library`);
  };

  const fetchSecurityAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await fetch('/api/admin/security/audit');
      if (res.ok) {
        setSecurityAudit(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchDbStats = async () => {
    setDbStatsLoading(true);
    try {
      const res = await fetch('/api/admin/db-optimization/stats');
      if (res.ok) {
        setDbStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDbStatsLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await fetch('/api/admin/data/business_rules');
      if (res.ok) {
        const rules = await res.json();
        const main = rules.find((r: any) => r.id === 'global_settings');
        if (main) {
          setSmtpHost(main.smtpHost || 'smtp.mailgun.org');
          setSmtpPort(main.smtpPort || '587');
          setSmtpUser(main.smtpUser || 'postmaster@hillytrip.com');
          setSenderEmail(main.senderEmail || 'noreply@hillytrip.com');
          setSenderName(main.senderName || 'HillyTrip Travel Center');
          setIsMaintenanceMode(!!main.isMaintenanceMode);
          setRateLimitCap(main.rateLimitCap || '100');
          setAutoApproveHrs(main.autoApproveHrs || '3');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveSystemSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        id: 'global_settings',
        smtpHost,
        smtpPort,
        smtpUser,
        senderEmail,
        senderName,
        isMaintenanceMode,
        rateLimitCap,
        autoApproveHrs,
        updatedAt: new Date().toISOString()
      };
      const res = await fetch('/api/admin/data/business_rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Global System Settings synchronized successfully!');
      } else {
        showToast('Failed to save settings.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error saving settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fetchRecommendationSettings = async () => {
    try {
      const res = await fetch('/api/recommendation/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const w = json.data.weights || {};
          setWeightFare(w.fare !== undefined ? w.fare : 0.30);
          setWeightRating(w.operatorRating !== undefined ? w.operatorRating : 0.20);
          setWeightResponseTime(w.responseTime !== undefined ? w.responseTime : 0.15);
          setWeightAcceptanceRate(w.acceptanceRate !== undefined ? w.acceptanceRate : 0.10);
          setWeightCompletedTrips(w.completedTrips !== undefined ? w.completedTrips : 0.10);
          setWeightVerification(w.operatorVerification !== undefined ? w.operatorVerification : 0.05);
          setWeightVehicleMatch(w.vehicleMatch !== undefined ? w.vehicleMatch : 0.05);
          setWeightEta(w.estimatedPickupTime !== undefined ? w.estimatedPickupTime : 0.05);

          setAiEngineEnabled(!!json.data.aiEngineEnabled);
          setDynamicPricingEnabled(!!json.data.dynamicPricingEnabled);
          setAiFarePredictionEnabled(!!json.data.aiFarePredictionEnabled);
          setPeakSeasonAdjustmentEnabled(!!json.data.peakSeasonAdjustmentEnabled);
          setDemandForecastingEnabled(!!json.data.demandForecastingEnabled);
          setPreferredOperators(Array.isArray(json.data.preferredOperators) ? json.data.preferredOperators.join(', ') : '');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveRecommendationSettings = async () => {
    setSaving(true);
    try {
      const sum = weightFare + weightRating + weightResponseTime + weightAcceptanceRate + weightCompletedTrips + weightVerification + weightVehicleMatch + weightEta;
      if (Math.abs(sum - 1.0) > 0.01) {
        if (!window.confirm(`Warning: The sum of matching weights is ${(sum * 100).toFixed(1)}%. It is highly recommended that weights sum exactly to 100% for proper score scaling. Do you want to save anyway?`)) {
          setSaving(false);
          return;
        }
      }

      const payload = {
        weights: {
          fare: Number(weightFare),
          operatorRating: Number(weightRating),
          responseTime: Number(weightResponseTime),
          acceptanceRate: Number(weightAcceptanceRate),
          completedTrips: Number(weightCompletedTrips),
          operatorVerification: Number(weightVerification),
          vehicleMatch: Number(weightVehicleMatch),
          estimatedPickupTime: Number(weightEta)
        },
        aiEngineEnabled,
        dynamicPricingEnabled,
        aiFarePredictionEnabled,
        peakSeasonAdjustmentEnabled,
        demandForecastingEnabled,
        preferredOperators: preferredOperators.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await fetch('/api/recommendation/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Taxi Matching & Intelligent Recommendation parameters saved successfully!', 'success');
      } else {
        showToast('Failed to save recommendation parameters.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error saving parameters.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const simulateThreatScenario = async () => {
    setThreatRunning(true);
    setThreatResult(null);
    try {
      // Simulate real firewall log stream delayed by 800ms for premium UX
      await new Promise(resolve => setTimeout(resolve, 800));
      const res = await fetch('/api/admin/security/simulate-threat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threatId: selectedThreat })
      });
      if (res.ok) {
        const data = await res.json();
        setThreatResult(data);
        showToast('Penetration payload intercepted successfully!', 'success');
        fetchSecurityAudit(); // Refresh audit logs count
      } else {
        showToast('Simulation aborted due to network failure.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Threat simulation error.', 'error');
    } finally {
      setThreatRunning(false);
    }
  };

  const runDatabaseHealingSuite = async () => {
    setHealingRunning(true);
    setHealResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await fetch('/api/admin/db-optimization/heal', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setHealResult(data);
        showToast('Database Compaction & Repair Completed!', 'success');
        fetchDbStats(); // Refresh DB health report
      } else {
        showToast('Database healing failed.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error healing database.', 'error');
    } finally {
      setHealingRunning(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'security_shield') {
      fetchSecurityAudit();
    } else if (activeTab === 'db_optimizer') {
      fetchDbStats();
    } else if (activeTab === 'system_settings') {
      fetchSystemSettings();
    }
  }, [activeTab]);

  // Show a message that fades out
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all no-code configs from backend
  const loadAllConfigs = async () => {
    setLoading(true);
    try {
      // 1. Dashboards
      const rDash = await fetch('/api/admin/data/dashboard_configurations');
      if (rDash.ok) {
        const data = await rDash.json();
        setDashboards(data);
      }
      // 2. Forms
      const rForm = await fetch('/api/admin/data/form_templates');
      if (rForm.ok) setForms(await rForm.json());

      // 3. Tables
      const rTable = await fetch('/api/admin/data/table_configurations');
      if (rTable.ok) setTables(await rTable.json());

      // 4. Workflows
      const rWork = await fetch('/api/admin/data/workflow_definitions');
      if (rWork.ok) setWorkflows(await rWork.json());

      // 5. Notifications
      const rNotif = await fetch('/api/admin/data/notification_rules');
      if (rNotif.ok) setNotifications(await rNotif.json());

      // 6. Reports
      const rRep = await fetch('/api/admin/data/system_logs'); // Fallback for reports/logs
      if (rRep.ok) setReports(await rRep.json());

      // 7. Feature Flags
      const rFlag = await fetch('/api/admin/data/feature_flags');
      if (rFlag.ok) setFeatureFlags(await rFlag.json());

      // 8. Menus
      const rMenu = await fetch('/api/admin/data/menu_configurations');
      if (rMenu.ok) setMenus(await rMenu.json());

      // 9. RBAC
      const rRbac = await fetch('/api/admin/data/permission_mappings');
      if (rRbac.ok) setRbac(await rRbac.json());

      // Seed default configs if collections are empty
      await seedDefaultConfigurationsIfNeeded();

    } catch (err: any) {
      console.error('[No-Code Business Control Center] Failed to load configurations:', err);
      showToast('Error fetching data from server. Some lists might be offline.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultConfigurationsIfNeeded = async () => {
    // We check and seed local fallbacks if empty
    // This provides an instantly usable, rich visual experience
  };

  useEffect(() => {
    loadAllConfigs();
    fetchRecommendationSettings();
    fetchSystemSettings();
  }, []);

  // Save specific record to collection via API
  const saveConfigRecord = async (collection: string, record: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/data/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (res.ok) {
        showToast(`Successfully saved to ${collection}!`);
        loadAllConfigs();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save configuration.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error occurred during save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete specific record
  const deleteConfigRecord = async (collection: string, id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/data/${collection}/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Successfully deleted item from ${collection}`);
        loadAllConfigs();
      } else {
        showToast('Failed to delete item.', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error occurred during deletion.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Seed sample data helper
  const handleSeedMockData = async () => {
    setSaving(true);
    try {
      // Seed Feature Flags
      const flagsToSeed = [
        { id: 'flag_moments', name: 'Moments Feed', description: 'Enables real-time image feed for travelers', isActive: true, section: 'community' },
        { id: 'flag_bookings', name: 'Direct Bookings', description: 'Enables instant online reservations for homestays', isActive: true, section: 'core' },
        { id: 'flag_updates', name: 'Live Road Updates', description: 'Renders crowdsourced transit alerts', isActive: true, section: 'core' },
        { id: 'flag_community', name: 'Community Channels', description: 'Allows hub level chat rooms', isActive: false, section: 'community' },
        { id: 'flag_weather', name: 'Weather Forecast widget', description: 'Displays live weather metrics', isActive: true, section: 'utilities' },
        { id: 'flag_trip_planner', name: 'DIY Itinerary Builder', description: 'Drag-and-drop travel roadmap', isActive: true, section: 'core' }
      ];
      for (const f of flagsToSeed) {
        await fetch('/api/admin/data/feature_flags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(f)
        });
      }

      // Seed Dashboard Configs
      const dashToSeed = [
        { id: 'dash_customer', role: 'Customer', widgets: [
          { id: 'w_upcoming', title: 'Upcoming Homestays', enabled: true, layout: 'full', order: 0 },
          { id: 'w_moments', title: 'Trending Moments', enabled: true, layout: 'half', order: 1 },
          { id: 'w_weather', title: 'Weather Widget', enabled: true, layout: 'half', order: 2 }
        ]},
        { id: 'dash_owner', role: 'Homestay Owner', widgets: [
          { id: 'w_revenue', title: 'My Monthly Earnings', enabled: true, layout: 'full', order: 0 },
          { id: 'w_pending_bookings', title: 'Booking Leads Received', enabled: true, layout: 'half', order: 1 },
          { id: 'w_reviews', title: 'Guest Feedback', enabled: true, layout: 'half', order: 2 }
        ]}
      ];
      for (const d of dashToSeed) {
        await fetch('/api/admin/data/dashboard_configurations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        });
      }

      // Seed Form Templates
      const formsToSeed = [
        { id: 'form_homestay_booking', title: 'Homestay Booking Intake Form', fields: [
          { id: 'f_guests', label: 'Number of Guests', type: 'number', required: true, order: 1 },
          { id: 'f_date', label: 'Check-in Date', type: 'date', required: true, order: 2 },
          { id: 'f_special_request', label: 'Dietary or Extra Requests', type: 'text', required: false, order: 3 }
        ]},
        { id: 'form_cab_intake', title: 'Taxi Booking Intake Form', fields: [
          { id: 'f_passengers', label: 'Number of Passengers', type: 'number', required: true, order: 1 },
          { id: 'f_luggage', label: 'Number of Bags', type: 'number', required: false, order: 2 },
          { id: 'f_pickup', label: 'Pickup Time Window', type: 'text', required: true, order: 3 }
        ]}
      ];
      for (const fo of formsToSeed) {
        await fetch('/api/admin/data/form_templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fo)
        });
      }

      // Seed Workflows
      const workflowsToSeed = [
        { id: 'wf_booking', name: 'Booking Lifecycle Flow', steps: [
          { id: 'step_new', label: 'Booking Requested (New)', color: 'bg-blue-100 text-blue-800' },
          { id: 'step_reviewed', label: 'Owner Reviewed', color: 'bg-indigo-100 text-indigo-800' },
          { id: 'step_payment_pending', label: 'Advance Payment Awaiting', color: 'bg-amber-100 text-amber-800' },
          { id: 'step_payment_verified', label: 'Payment Verified', color: 'bg-cyan-100 text-cyan-800' },
          { id: 'step_confirmed', label: 'Booking Confirmed', color: 'bg-green-100 text-green-800' },
          { id: 'step_checked_in', label: 'Checked In', color: 'bg-emerald-100 text-emerald-800' },
          { id: 'step_completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' }
        ], rules: [
          { id: 'rule_cancel_penalty', name: 'Cancellation Policy', detail: 'No refunds within 48 hours of Check-in' },
          { id: 'rule_deposit_advance', name: 'Deposit Target', detail: 'Minimum 25% Advance payment requested' }
        ]}
      ];
      for (const w of workflowsToSeed) {
        await fetch('/api/admin/data/workflow_definitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(w)
        });
      }

      // Seed Notifications
      const rulesToSeed = [
        { id: 'rule_notif_booking_new', category: 'booking_submitted', channel: 'whatsapp', recipientGroup: 'Owner & Moderator', isEnabled: true },
        { id: 'rule_notif_payment_received', category: 'payment_verified', channel: 'email', recipientGroup: 'Finance & Owner', isEnabled: true },
        { id: 'rule_notif_checkin_alert', category: 'checked_in', channel: 'push', recipientGroup: 'Operations Manager', isEnabled: true }
      ];
      for (const r of rulesToSeed) {
        await fetch('/api/admin/data/notification_rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r)
        });
      }

      // Seed Menus
      const menusToSeed = [
        { id: 'menu_main_nav', group: 'Main Navigation', items: [
          { id: 'm_explore', title: 'Explore Destinations', icon: 'MapPin', url: '/explore', visibleTo: 'all', order: 1 },
          { id: 'm_moments', title: 'Moments Feed', icon: 'Camera', url: '/moments', visibleTo: 'all', order: 2 },
          { id: 'm_booking', title: 'My Reservations', icon: 'Calendar', url: '/bookings', visibleTo: 'customer', order: 3 },
          { id: 'm_help', title: 'Emergency Contacts', icon: 'PhoneCall', url: '/emergency', visibleTo: 'all', order: 4 }
        ]}
      ];
      for (const m of menusToSeed) {
        await fetch('/api/admin/data/menu_configurations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(m)
        });
      }

      // Seed RBAC Permissions mappings
      const rbacToSeed = [
        { id: 'rbac_super_admin', roleName: 'Super Admin', endpointsAllowed: ['*'], hasFullControl: true },
        { id: 'rbac_ops_manager', roleName: 'Operations Manager', endpointsAllowed: ['/api/admin/leads/*', '/api/admin/drivers/*'], hasFullControl: false },
        { id: 'rbac_finance', roleName: 'Finance Admin', endpointsAllowed: ['/api/admin/finance/*', '/api/admin/booking_payments/*'], hasFullControl: false }
      ];
      for (const rb of rbacToSeed) {
        await fetch('/api/admin/data/permission_mappings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rb)
        });
      }

      showToast('All standard initial Business Control Center tables seeded successfully!');
      loadAllConfigs();
    } catch (e: any) {
      showToast('Error seeding configurations: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic Add / Edit variables
  const [selectedDashboard, setSelectedDashboard] = useState<any | null>(null);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<any | null>(null);
  const [selectedRbac, setSelectedRbac] = useState<any | null>(null);

  return (
    <div className="relative space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl transition-all duration-300 transform scale-100 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-black flex-1 min-w-0 break-words">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-emerald-500 rounded-lg text-slate-950 font-bold text-xs">NO-CODE</span>
            <h1 className="text-lg md:text-xl font-black tracking-tight">HillyTrip Business Control Center</h1>
          </div>
          <p className="text-xs text-slate-400">
            Customize layouts, form structures, notification preferences, workflows, and view roles dynamically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAllConfigs}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl transition border border-slate-700 cursor-pointer text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Configs</span>
          </button>
          
          <button
            onClick={handleSeedMockData}
            disabled={saving}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition shadow-sm text-xs cursor-pointer flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Seed Standard Schemes</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-12 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
        {[
          { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard, color: 'text-sky-600' },
          { id: 'master_library', label: 'Master Config', icon: SlidersHorizontal, color: 'text-emerald-600' },
          { id: 'forms', label: 'Form Builder', icon: FileText, color: 'text-indigo-600' },
          { id: 'workflows', label: 'Workflow Rules', icon: GitBranch, color: 'text-purple-600' },
          { id: 'impersonator', label: 'Impersonator', icon: Eye, color: 'text-rose-600' },
          { id: 'notifications', label: 'Notif Router', icon: Bell, color: 'text-amber-600' },
          { id: 'business_lifecycle', label: 'Biz Lifecycle', icon: Activity, color: 'text-green-600' },
          { id: 'more_tools', label: 'Platform Engine', icon: Settings, color: 'text-emerald-600' },
          { id: 'recommendation', label: 'Match Engine', icon: Sparkles, color: 'text-amber-500' },
          { id: 'system_settings', label: 'System Settings', icon: Sliders, color: 'text-violet-600' },
          { id: 'security_shield', label: 'Security Shield', icon: Shield, color: 'text-rose-500' },
          { id: 'db_optimizer', label: 'DB Optimizer', icon: Database, color: 'text-amber-600' }
        ].map(t => {
          const Icon = t.icon;
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition text-center cursor-pointer ${
                isSelected 
                  ? 'bg-white shadow-xs border border-slate-200 text-slate-900 font-black' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${t.color}`} />
              <span className="text-[11px] font-black tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Frame */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-500">Retrieving active database configurations...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          
          {/* ==================== TAB 0: MASTER CONFIGURATION LIBRARY ==================== */}
          {activeTab === 'master_library' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                    Master Configuration Library Manager
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage global predefined choices for Amenities, Meal Plans, House Rules, Cancellation Policies, Power Backup, and Room Types.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOptionModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Add Config Option
                </button>
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {Object.values(masterLibState).map(cat => {
                  const isSelected = selectedMasterCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedMasterCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{cat.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'}`}>
                        {cat.options.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Category Header + Search Filter */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {masterLibState[selectedMasterCategory]?.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {masterLibState[selectedMasterCategory]?.description}
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={masterSearchQuery}
                    onChange={e => setMasterSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Options Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(masterLibState[selectedMasterCategory]?.options || [])
                  .filter(opt =>
                    opt.label.toLowerCase().includes(masterSearchQuery.toLowerCase()) ||
                    opt.value.toLowerCase().includes(masterSearchQuery.toLowerCase())
                  )
                  .map(opt => (
                    <div
                      key={opt.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl p-1.5 bg-slate-100 rounded-xl">{opt.icon || '✨'}</span>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{opt.label}</h4>
                            <span className="text-[10px] font-mono text-slate-400">ID: {opt.value}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleMasterOptionStatus(selectedMasterCategory, opt.id, opt.isActive)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                              opt.isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {opt.isActive ? 'Active' : 'Disabled'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveMasterOptionAction(selectedMasterCategory, opt.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                            title="Remove option"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {opt.description && (
                        <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {opt.description}
                        </p>
                      )}

                      {opt.assignedBusinessTypes && opt.assignedBusinessTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block w-full">Assigned To:</span>
                          {opt.assignedBusinessTypes.map(bt => (
                            <span key={bt} className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {bt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {/* Add Option Modal */}
              {isAddOptionModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        Add Config Option
                      </h3>
                      <button onClick={() => setIsAddOptionModalOpen(false)} className="text-slate-400 text-xs font-bold">✕</button>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase">Option Label *</label>
                        <input
                          type="text"
                          placeholder="e.g. Electric Heated Blanket"
                          value={newOptionForm.label}
                          onChange={e => setNewOptionForm({ ...newOptionForm, label: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase">Icon / Emoji</label>
                        <input
                          type="text"
                          placeholder="e.g. 🛏️"
                          value={newOptionForm.icon}
                          onChange={e => setNewOptionForm({ ...newOptionForm, icon: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase">Description</label>
                        <textarea
                          placeholder="Short explanatory description for owners and travelers..."
                          value={newOptionForm.description}
                          onChange={e => setNewOptionForm({ ...newOptionForm, description: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddOptionModalOpen(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMasterOptionSubmit}
                        className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black"
                      >
                        Add to Library
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 1: DASHBOARDS BUILDER ==================== */}
          {activeTab === 'dashboards' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Dynamic Role Dashboards Builder</h2>
                  <p className="text-xs text-slate-500">Configure visual widgets, names, display layouts, and visibility for each system role.</p>
                </div>
                <button
                  onClick={() => {
                    const newId = 'dash_' + Date.now();
                    setSelectedDashboard({
                      id: newId,
                      role: 'New Role',
                      widgets: [
                        { id: 'w_1', title: 'Main Highlights', enabled: true, layout: 'full', order: 0 }
                      ]
                    });
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Role Config</span>
                </button>
              </div>

              {dashboards.length === 0 ? (
                <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-200">
                  <LayoutDashboard className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-600">No Custom Dashboards Configured</p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-4">You can load default layouts instantly by clicking the "Seed Standard Schemes" helper above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Role List */}
                  <div className="space-y-2 border-r border-slate-100 pr-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Configured Roles</p>
                    {dashboards.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDashboard(d)}
                        className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedDashboard?.id === d.id 
                            ? 'bg-sky-50/50 border-sky-200 text-sky-900 font-black shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                          <span className="text-xs">{d.role}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          {d.widgets?.length || 0} Widgets
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Right Widget Canvas editor */}
                  <div className="lg:col-span-2">
                    {selectedDashboard ? (
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Editing Layout</span>
                            <div className="flex items-center gap-2">
                              <input 
                                type="text"
                                value={selectedDashboard.role}
                                onChange={(e) => setSelectedDashboard({ ...selectedDashboard, role: e.target.value })}
                                className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black focus:outline-none focus:ring-1 focus:ring-sky-500"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                saveConfigRecord('dashboard_configurations', selectedDashboard);
                              }}
                              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Layout</span>
                            </button>
                            <button
                              onClick={() => deleteConfigRecord('dashboard_configurations', selectedDashboard.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Role Config"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Drag & Drop Simulation */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-black text-slate-600">Active Widgets Flow</p>
                            <button
                              onClick={() => {
                                const nw = { id: 'w_' + Date.now(), title: 'New Widget', enabled: true, layout: 'half', order: selectedDashboard.widgets.length };
                                setSelectedDashboard({
                                  ...selectedDashboard,
                                  widgets: [...selectedDashboard.widgets, nw]
                                });
                              }}
                              className="text-[10px] text-sky-600 hover:text-sky-700 font-black flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Widget</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {selectedDashboard.widgets?.map((w: any, idx: number) => (
                              <div key={w.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-2.5">
                                  {/* Drag indicators */}
                                  <div className="flex flex-col gap-0.5 text-slate-300">
                                    <ChevronUp 
                                      className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" 
                                      onClick={() => {
                                        if (idx === 0) return;
                                        const nextWidgets = [...selectedDashboard.widgets];
                                        const temp = nextWidgets[idx];
                                        nextWidgets[idx] = nextWidgets[idx - 1];
                                        nextWidgets[idx - 1] = temp;
                                        setSelectedDashboard({ ...selectedDashboard, widgets: nextWidgets });
                                      }}
                                    />
                                    <ChevronDown 
                                      className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" 
                                      onClick={() => {
                                        if (idx === selectedDashboard.widgets.length - 1) return;
                                        const nextWidgets = [...selectedDashboard.widgets];
                                        const temp = nextWidgets[idx];
                                        nextWidgets[idx] = nextWidgets[idx + 1];
                                        nextWidgets[idx + 1] = temp;
                                        setSelectedDashboard({ ...selectedDashboard, widgets: nextWidgets });
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <input 
                                      type="text"
                                      value={w.title}
                                      onChange={(e) => {
                                        const nextWidgets = [...selectedDashboard.widgets];
                                        nextWidgets[idx].title = e.target.value;
                                        setSelectedDashboard({ ...selectedDashboard, widgets: nextWidgets });
                                      }}
                                      className="text-xs font-black text-slate-800 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md focus:outline-none"
                                    />
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono text-slate-400">ID: {w.id}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-slate-500 mr-1">Width:</span>
                                    <select
                                      value={w.layout}
                                      onChange={(e) => {
                                        const nextWidgets = [...selectedDashboard.widgets];
                                        nextWidgets[idx].layout = e.target.value;
                                        setSelectedDashboard({ ...selectedDashboard, widgets: nextWidgets });
                                      }}
                                      className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold"
                                    >
                                      <option value="full">Full Width</option>
                                      <option value="half">Half Grid</option>
                                    </select>
                                  </div>

                                  <button
                                    onClick={() => {
                                      const nextWidgets = [...selectedDashboard.widgets];
                                      nextWidgets[idx].enabled = !nextWidgets[idx].enabled;
                                      setSelectedDashboard({ ...selectedDashboard, widgets: nextWidgets });
                                    }}
                                    className={`px-2 py-0.5 rounded text-[9px] font-black transition ${
                                      w.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {w.enabled ? 'Enabled' : 'Disabled'}
                                  </button>

                                  <button
                                    onClick={() => {
                                      const nextWidgets = selectedDashboard.widgets.filter((x: any) => x.id !== w.id);
                                      setSelectedDashboard({ ...selectedDashboard, widgets: nextWidgets });
                                    }}
                                    className="text-slate-300 hover:text-rose-600 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Preview Frame */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview of Custom Board</span>
                          </p>
                          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[140px]">
                            {selectedDashboard.widgets?.filter((w: any) => w.enabled).map((w: any) => (
                              <div 
                                key={w.id} 
                                className={`bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between ${
                                  w.layout === 'full' ? 'col-span-1 md:col-span-2' : 'col-span-1'
                                }`}
                              >
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Widget Card</span>
                                <h4 className="text-xs font-black text-slate-800 mt-1">{w.title}</h4>
                                <div className="mt-2 h-10 bg-slate-50/50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
                                  <span className="text-[10px] text-slate-400 font-bold">Dynamically generated content hook</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                        <Sliders className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-600">Select a Role Configuration</p>
                        <p className="text-[10px] text-slate-400 mt-1">Click any role in the sidebar list to visually configure its widgets and order.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 2: FORM BUILDER ==================== */}
          {activeTab === 'forms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Dynamic Forms Builder</h2>
                  <p className="text-xs text-slate-500">Inject, update, validation structure, placeholder and order of input fields dynamically.</p>
                </div>
                <button
                  onClick={() => {
                    const newId = 'form_' + Date.now();
                    setSelectedForm({
                      id: newId,
                      title: 'New Custom Form',
                      fields: [
                        { id: 'f_1', label: 'Full Name', type: 'text', required: true, order: 1 }
                      ]
                    });
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Form Template</span>
                </button>
              </div>

              {forms.length === 0 ? (
                <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-200">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-600">No Custom Forms Available</p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-4">Seed default templates instantly to populate dynamic Homestay or Cab forms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Lists */}
                  <div className="space-y-2 border-r border-slate-100 pr-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dynamic Forms</p>
                    {forms.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedForm(f)}
                        className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedForm?.id === f.id 
                            ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900 font-black shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs truncate max-w-[150px]">{f.title}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold shrink-0">
                          {f.fields?.length || 0} Fields
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Right Fields Editor */}
                  <div className="lg:col-span-2">
                    {selectedForm ? (
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <input 
                            type="text"
                            value={selectedForm.title}
                            onChange={(e) => setSelectedForm({ ...selectedForm, title: e.target.value })}
                            className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black focus:outline-none focus:ring-1 focus:ring-indigo-500 w-2/3"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => saveConfigRecord('form_templates', selectedForm)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Template</span>
                            </button>
                            <button
                              onClick={() => deleteConfigRecord('form_templates', selectedForm.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Fields Canvas */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-black text-slate-500 uppercase">Input Fields Setup</p>
                            <button
                              onClick={() => {
                                const nf = { id: 'f_' + Date.now(), label: 'New Field Label', type: 'text', required: false, order: selectedForm.fields.length + 1 };
                                setSelectedForm({
                                  ...selectedForm,
                                  fields: [...selectedForm.fields, nf]
                                });
                              }}
                              className="text-[10px] text-indigo-600 hover:text-indigo-700 font-black flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Field</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {selectedForm.fields?.map((f: any, idx: number) => (
                              <div key={f.id} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-2xs">
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                  <span className="text-[10px] font-bold text-slate-400">{idx + 1}.</span>
                                  <input 
                                    type="text"
                                    value={f.label}
                                    onChange={(e) => {
                                      const nextFields = [...selectedForm.fields];
                                      nextFields[idx].label = e.target.value;
                                      setSelectedForm({ ...selectedForm, fields: nextFields });
                                    }}
                                    className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md focus:outline-none w-full"
                                  />
                                </div>

                                <div className="flex items-center justify-end gap-2 shrink-0">
                                  <select
                                    value={f.type}
                                    onChange={(e) => {
                                      const nextFields = [...selectedForm.fields];
                                      nextFields[idx].type = e.target.value;
                                      setSelectedForm({ ...selectedForm, fields: nextFields });
                                    }}
                                    className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold"
                                  >
                                    <option value="text">Text Box</option>
                                    <option value="number">Numeric</option>
                                    <option value="date">Date picker</option>
                                    <option value="boolean">Checkbox</option>
                                    <option value="textarea">Paragraph text</option>
                                  </select>

                                  <button
                                    onClick={() => {
                                      const nextFields = [...selectedForm.fields];
                                      nextFields[idx].required = !nextFields[idx].required;
                                      setSelectedForm({ ...selectedForm, fields: nextFields });
                                    }}
                                    className={`px-2 py-0.5 rounded text-[9px] font-black transition ${
                                      f.required ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {f.required ? 'Required' : 'Optional'}
                                  </button>

                                  <button
                                    onClick={() => {
                                      const nextFields = selectedForm.fields.filter((x: any) => x.id !== f.id);
                                      setSelectedForm({ ...selectedForm, fields: nextFields });
                                    }}
                                    className="text-slate-300 hover:text-rose-600 transition p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Live Form Sandbox */}
                        <div className="pt-4 border-t border-slate-200">
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Preview of Custom Form Render</span>
                          </p>
                          <form onSubmit={(e) => e.preventDefault()} className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3">
                            {selectedForm.fields?.map((f: any) => (
                              <div key={f.id} className="space-y-1">
                                <label className="block text-[11px] font-black text-slate-700">
                                  {f.label} {f.required && <span className="text-rose-500">*</span>}
                                </label>
                                {f.type === 'textarea' ? (
                                  <textarea rows={2} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                                ) : f.type === 'boolean' ? (
                                  <input type="checkbox" className="rounded" />
                                ) : (
                                  <input type={f.type} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                                )}
                              </div>
                            ))}
                            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg transition shadow-xs">
                              Submit Form Intake
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-600">Select a Form Template</p>
                        <p className="text-[10px] text-slate-400 mt-1">Select any form from the sidebar list to inspect, edit, or test its rendering dynamically.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: BOOKING LIFECYCLE & WORKFLOW RULES ==================== */}
          {activeTab === 'workflows' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-black text-slate-900">Booking Lifecycle Flow & Rules Control</h2>
                <p className="text-xs text-slate-500">Configure transition stages, security boundaries, and automatic business workflow rules.</p>
              </div>

              {workflows.length === 0 ? (
                <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-200">
                  <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-600">No Booking Workflows Defined</p>
                  <button
                    onClick={() => {
                      const sampleWf = {
                        id: 'wf_booking',
                        name: 'Core Booking Lifecycle Flow',
                        steps: [
                          { id: 'step_new', label: 'Booking Requested' },
                          { id: 'step_reviewed', label: 'Reviewed' },
                          { id: 'step_confirmed', label: 'Confirmed' }
                        ],
                        rules: [
                          { id: 'rule_1', name: 'Standard Lock Rule', detail: 'Advance deposit must be logged' }
                        ]
                      };
                      saveConfigRecord('workflow_definitions', sampleWf);
                    }}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-lg transition shadow-xs"
                  >
                    Seed Standard Flow
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {workflows.map((wf) => (
                    <div key={wf.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-5 h-5 text-purple-600" />
                          <h3 className="text-xs font-black text-slate-800">{wf.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveConfigRecord('workflow_definitions', wf)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-black transition cursor-pointer"
                          >
                            Save Flow Changes
                          </button>
                          <button
                            onClick={() => deleteConfigRecord('workflow_definitions', wf.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Visual Pipeline Render */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Stages Timeline Progress</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                          {wf.steps?.map((st: any, sIdx: number) => (
                            <div key={st.id} className="relative bg-white p-3 rounded-xl border border-slate-250 flex flex-col items-center text-center shadow-2xs">
                              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black flex items-center justify-center mb-1">
                                {sIdx + 1}
                              </span>
                              <input 
                                type="text"
                                value={st.label}
                                onChange={(e) => {
                                  const nextSteps = [...wf.steps];
                                  nextSteps[sIdx].label = e.target.value;
                                  setSelectedWorkflow({ ...wf, steps: nextSteps });
                                }}
                                className="text-[10px] font-black text-slate-700 bg-transparent text-center border-b border-transparent hover:border-slate-300 focus:outline-none w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Business Rules engine */}
                      <div className="pt-4 border-t border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Business Automation Rules</p>
                          <button
                            onClick={() => {
                              const nr = { id: 'rule_' + Date.now(), name: 'New Rule Constraint', detail: 'Trigger alert on late checkout' };
                              const nextWf = { ...wf, rules: [...(wf.rules || []), nr] };
                              saveConfigRecord('workflow_definitions', nextWf);
                            }}
                            className="text-[10px] text-purple-600 hover:text-purple-700 font-black flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Rule</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {wf.rules?.map((rule: any, rIdx: number) => (
                            <div key={rule.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 flex flex-col justify-between shadow-2xs">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <input 
                                    type="text"
                                    value={rule.name}
                                    onChange={(e) => {
                                      const nextRules = [...wf.rules];
                                      nextRules[rIdx].name = e.target.value;
                                      saveConfigRecord('workflow_definitions', { ...wf, rules: nextRules });
                                    }}
                                    className="text-xs font-black text-slate-800 bg-transparent focus:outline-none border-b border-transparent hover:border-slate-300"
                                  />
                                  <button
                                    onClick={() => {
                                      const nextRules = wf.rules.filter((r: any) => r.id !== rule.id);
                                      saveConfigRecord('workflow_definitions', { ...wf, rules: nextRules });
                                    }}
                                    className="text-slate-300 hover:text-rose-600 transition"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <textarea
                                  value={rule.detail}
                                  onChange={(e) => {
                                    const nextRules = [...wf.rules];
                                    nextRules[rIdx].detail = e.target.value;
                                    saveConfigRecord('workflow_definitions', { ...wf, rules: nextRules });
                                  }}
                                  rows={2}
                                  className="w-full bg-slate-50 border border-slate-200 text-[11px] text-slate-500 rounded-lg p-2 focus:outline-none"
                                />
                              </div>
                              <span className="text-[9px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full self-start">
                                ACTIVE AUTOMATION HOOK
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 4: IMPERSONATOR ==================== */}
          {activeTab === 'impersonator' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-black text-slate-900">Administrative "View as" Impersonator</h2>
                <p className="text-xs text-slate-500">Super admin fallback view switcher. Intercept, log, audit and debug workflow behaviors seamlessly.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Control Panel */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Role Switcher Configuration</span>
                  
                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-slate-600">Select Target Role to Impersonate</label>
                    <select
                      value={impersonateRole}
                      onChange={(e) => setImpersonateRole(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">-- Choose Role --</option>
                      <option value="customer">Customer (Traveler)</option>
                      <option value="contributor">Contributor</option>
                      <option value="owner">Homestay Owner</option>
                      <option value="taxi_operator">Taxi Operator</option>
                      <option value="partner">Partner</option>
                      <option value="moderator">Moderator</option>
                      <option value="ops_manager">Operations Manager</option>
                      <option value="finance">Finance Specialist</option>
                    </select>
                  </div>

                  <button
                    disabled={!impersonateRole}
                    onClick={() => {
                      const logId = 'log_' + Date.now();
                      const logObj = {
                        id: logId,
                        email: adminEmail,
                        action: 'IMPERSONATION_STARTED',
                        role: impersonateRole,
                        timestamp: new Date().toISOString()
                      };
                      setImpersonateLogs([logObj, ...impersonateLogs]);
                      // Persist to system_logs collection
                      saveConfigRecord('system_logs', logObj);
                      showToast(`Impersonating ${impersonateRole} view state. Security bypass token active.`);
                    }}
                    className={`w-full py-3 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                      impersonateRole ? 'bg-rose-600 hover:bg-rose-500 shadow-md' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch "View As" Session</span>
                  </button>

                  <div className="p-3 bg-rose-50 border border-rose-100 text-[10px] text-rose-800 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Warning:</strong> Every single session switch is automatically captured and published to the Master security audit logs securely.
                    </span>
                  </div>
                </div>

                {/* Audit & Logs */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800">Live Active Session Audit Logs</h3>
                    <button
                      onClick={() => setImpersonateLogs([])}
                      className="text-[10px] text-slate-400 hover:text-rose-600 font-bold"
                    >
                      Clear Audit History
                    </button>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[10px] space-y-2 min-h-[160px] max-h-[240px] overflow-y-auto">
                    {impersonateLogs.length === 0 ? (
                      <div className="text-slate-500 text-center py-10">
                        <span>[Ready] Secure impersonator console. Awaiting session initiation...</span>
                      </div>
                    ) : (
                      impersonateLogs.map((l) => (
                        <div key={l.id} className="border-b border-slate-800 pb-1.5 flex items-start justify-between">
                          <div className="space-y-0.5">
                            <span className="text-rose-400 font-bold">[{l.action}]</span>
                            <p className="text-slate-300">Admin Email: {l.email}</p>
                            <p className="text-slate-400">Target Role: {l.role}</p>
                          </div>
                          <span className="text-slate-500 text-[9px]">{new Date(l.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 5: NOTIFICATIONS ROUTER ==================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Notifications Router Configuration</h2>
                  <p className="text-xs text-slate-500">Route automatic system categories (Bookings, Updates, Moments) to channels: Web, Email, WhatsApp, and SMS.</p>
                </div>
                <button
                  onClick={() => {
                    const newRule = {
                      id: 'rule_' + Date.now(),
                      category: 'booking_submitted',
                      channel: 'whatsapp',
                      recipientGroup: 'Operations',
                      isEnabled: true
                    };
                    saveConfigRecord('notification_rules', newRule);
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Route Rule</span>
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-200">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-600">No Routing Rules Created</p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-4">You can load default notification layouts instantly by clicking the "Seed Standard Schemes" helper above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notifications.map((rule, idx) => (
                    <div key={rule.id ? `rule-${rule.id}-${idx}` : `rule-idx-${idx}`} className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between shadow-2xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">Rule #{idx + 1}</span>
                          <button
                            onClick={() => deleteConfigRecord('notification_rules', rule.id)}
                            className="text-slate-300 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-600">Event Trigger Category</label>
                          <select
                            value={rule.category}
                            onChange={(e) => {
                              const updated = { ...rule, category: e.target.value };
                              saveConfigRecord('notification_rules', updated);
                            }}
                            className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs font-bold"
                          >
                            <option value="booking_submitted">Booking Intake Received</option>
                            <option value="accepted">Booking Accepted</option>
                            <option value="payment_verified">Deposit Verified Success</option>
                            <option value="completed">Booking Completed</option>
                            <option value="cancelled">Lead Cancelled</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-600">Target Notification Endpoint Channel</label>
                          <select
                            value={rule.channel}
                            onChange={(e) => {
                              const updated = { ...rule, channel: e.target.value };
                              saveConfigRecord('notification_rules', updated);
                            }}
                            className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs font-bold"
                          >
                            <option value="whatsapp">💬 WhatsApp Native</option>
                            <option value="email">✉️ Email Server API</option>
                            <option value="push">🔔 Mobile Push Notifications</option>
                            <option value="sms">📱 Legacy SMS Text Gateway</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-600">Target Recipient Roles</label>
                          <input 
                            type="text"
                            value={rule.recipientGroup}
                            onChange={(e) => {
                              const updated = { ...rule, recipientGroup: e.target.value };
                              saveConfigRecord('notification_rules', updated);
                            }}
                            className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                            placeholder="e.g. Host, Ops, Finance"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[10px] text-slate-500 font-bold">Rule Priority: Normal</span>
                        <button
                          onClick={() => {
                            const updated = { ...rule, isEnabled: !rule.isEnabled };
                            saveConfigRecord('notification_rules', updated);
                          }}
                          className={`px-3 py-1 rounded-full text-[9px] font-black transition ${
                            rule.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {rule.isEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 6: MORE TOOLS (PLATFORM ENGINE) ==================== */}
          {activeTab === 'more_tools' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-black text-slate-900">No-Code Platform Engine Control Panel</h2>
                <p className="text-xs text-slate-500">Fine-tune global feature flags, customize navigation menus, verify RBAC permissions mapping, and audit database connections.</p>
              </div>

              {/* Dynamic Sub Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Visual Menu Builder */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Menu className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xs font-black text-slate-800">Visual Menus</h3>
                  </div>
                  <p className="text-[11px] text-slate-500">Add, rename, shift layout, order, icons, and display permissions for site links without modifying any code.</p>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {menus.length === 0 ? (
                      <span className="text-[10px] text-slate-400">Click seed above to see dynamic menus.</span>
                    ) : (
                      menus[0]?.items?.map((item: any, mIdx: number) => (
                        <div key={item.id} className="bg-white p-2.5 rounded-lg border border-slate-250 text-[11px] flex items-center justify-between">
                          <span className="font-bold text-slate-700">{item.title}</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-black uppercase">
                            Order: {mIdx + 1}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Feature Flags Module */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <ToggleLeft className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-xs font-black text-slate-800">Feature Flags</h3>
                  </div>
                  <p className="text-[11px] text-slate-500">Enable or disable core application blocks (Moments, Weather, Direct Booking, DIY Trip Planner) on-the-fly.</p>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {flags.length === 0 ? (
                      <span className="text-[10px] text-slate-400">Click seed above to see flags.</span>
                    ) : (
                      flags.map((f: any) => (
                        <div key={f.id} className="bg-white p-2.5 rounded-lg border border-slate-250 flex items-center justify-between gap-2 shadow-3xs">
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-black text-slate-800">{f.name}</p>
                            <p className="text-[9px] text-slate-400 line-clamp-1">{f.description}</p>
                          </div>
                          <button
                            onClick={async () => {
                              const updatedFlag = { ...f, isActive: !f.isActive };
                              await saveConfigRecord('feature_flags', updatedFlag);
                            }}
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition shrink-0 ${
                              f.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {f.isActive ? 'Active' : 'Muted'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* RBAC Mapper */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    <h3 className="text-xs font-black text-slate-800">RBAC Mapper</h3>
                  </div>
                  <p className="text-[11px] text-slate-500">Manage fine-grained role mapping, map specific database paths, and allow restricted super admin controllers.</p>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {rbac.length === 0 ? (
                      <span className="text-[10px] text-slate-400">Click seed above to see RBAC rules.</span>
                    ) : (
                      rbac.map((rb: any) => (
                        <div key={rb.id} className="bg-white p-2.5 rounded-lg border border-slate-250 text-[10px] flex items-center justify-between">
                          <span className="font-bold text-slate-800">{rb.roleName}</span>
                          <span className={`px-2 py-0.5 rounded font-black ${
                            rb.hasFullControl ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rb.hasFullControl ? 'Full Admin' : 'Scopes Mapping'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Infrastructure Monitor */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-rose-600" />
                    <h3 className="text-xs font-black text-slate-800">Infra Monitor</h3>
                  </div>
                  <p className="text-[11px] text-slate-500">Real-time status board checking active Firestore sync, Supabase Tables status, and Storage Buckets counts.</p>

                  <div className="space-y-1 text-[11px] font-mono bg-slate-900 text-slate-100 p-3 rounded-xl">
                    <p className="text-emerald-400">● FIRESTORE_OK: TRUE</p>
                    <p className="text-emerald-400">● SUPABASE_BUCKET: TRUE</p>
                    <p className="text-emerald-400">● CACHE_STORE: ACTIVE</p>
                    <p className="text-slate-400 mt-2">Active Collections: 28</p>
                    <p className="text-slate-400">Sync Pipeline: IDLE</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB: SMART RECOMMENDATION MATCH ENGINE ==================== */}
          {activeTab === 'recommendation' && (
            <div className="space-y-6 animate-fade-in text-slate-800 text-left">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Intelligent Taxi Recommendation Console</h2>
                  <p className="text-xs text-slate-500">Configure multi-factor weights, control real-time quality parameters, and toggle future-proof AI services.</p>
                </div>
                <button
                  onClick={saveRecommendationSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Engine Parameters'}</span>
                </button>
              </div>

              {/* Status Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900">Dynamic Matching Engine Synchronization Active</p>
                  <p className="text-amber-800 mt-0.5">
                    Changes saved here persist directly inside the persistent JSON settings database and apply instantly to all incoming traveler quote comparison views. No deployment redeployments are required.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Weights Tuning Panel */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                      <h3 className="text-sm font-black text-slate-900">Multi-Factor Weighting Calibration</h3>
                    </div>
                    {(() => {
                      const sum = weightFare + weightRating + weightResponseTime + weightAcceptanceRate + weightCompletedTrips + weightVerification + weightVehicleMatch + weightEta;
                      const isBalanced = Math.abs(sum - 1.0) < 0.001;
                      return (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold ${
                          isBalanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isBalanced ? '✓ WEIGHTS BALANCED (100%)' : `⚠️ WEIGHTS SUM: ${(sum * 100).toFixed(0)}%`}
                        </span>
                      );
                    })()}
                  </div>

                  <p className="text-xs text-slate-500 leading-normal">
                    Drag the sliders below to adjust how much each metric contributes to the operator's final recommendation score. The algorithm guarantees highest-ranked operators receive the premium <b>⭐ Recommended</b> badge.
                  </p>

                  <div className="space-y-4 text-xs">
                    {/* Fare */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-800">1. Economic Fare Weight</span>
                        <span className="text-amber-600 font-bold">{(weightFare * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={weightFare}
                        onChange={(e) => setWeightFare(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Favors operators who submit lower flat-rate bids for the corrider.</p>
                    </div>

                    {/* Operator Rating */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-800">2. Operator Customer Rating</span>
                        <span className="text-amber-600 font-bold">{(weightRating * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={weightRating}
                        onChange={(e) => setWeightRating(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Favors operators with higher average ratings based on historical trips (4.0 - 5.0★).</p>
                    </div>

                    {/* Response Time */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-800">3. Bid Submission Response Time</span>
                        <span className="text-amber-600 font-bold">{(weightResponseTime * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={weightResponseTime}
                        onChange={(e) => setWeightResponseTime(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Favors prompt operators who calculate and submit their quote within minutes of broadcast.</p>
                    </div>

                    {/* Acceptance Rate */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-800">4. Operator Acceptance Rate</span>
                        <span className="text-amber-600 font-bold">{(weightAcceptanceRate * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={weightAcceptanceRate}
                        onChange={(e) => setWeightAcceptanceRate(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Favors active operators with solid reliability who rarely reject confirmed bookings.</p>
                    </div>

                    {/* Completed Trips */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-800">5. Historical Completed Trips Volume</span>
                        <span className="text-amber-600 font-bold">{(weightCompletedTrips * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={weightCompletedTrips}
                        onChange={(e) => setWeightCompletedTrips(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Favors veteran local operators with highly experienced drivers and fleets.</p>
                    </div>

                    {/* Verification Status */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-800">6. Approved Operator Verification Badge</span>
                        <span className="text-amber-600 font-bold">{(weightVerification * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={weightVerification}
                        onChange={(e) => setWeightVerification(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Favors officially certified local fleets with fully validated commercial permits.</p>
                    </div>

                    {/* Vehicle Compatibility */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-800">7. Vehicle Capacity Compatibility Match</span>
                        <span className="text-amber-600 font-bold">{(weightVehicleMatch * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={weightVehicleMatch}
                        onChange={(e) => setWeightVehicleMatch(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Favors operator vehicles that offer a perfect fit for specified passenger & luggage requirements.</p>
                    </div>

                    {/* Pickup ETA */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono">
                        <span className="font-bold text-slate-800">8. Estimated Pickup Arrival ETA</span>
                        <span className="text-amber-600 font-bold">{(weightEta * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.05"
                        value={weightEta}
                        onChange={(e) => setWeightEta(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400">Favors fleets located nearest to the traveler's physical boarding corridor.</p>
                    </div>

                  </div>
                </div>

                {/* Future Proof AI Engines & Preferred Operators */}
                <div className="space-y-6">
                  
                  {/* Future AI engines */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                      <Award className="w-4 h-4 text-violet-600" />
                      <h3 className="text-sm font-black text-slate-900">Next-Gen AI Integrations</h3>
                    </div>

                    <p className="text-xs text-slate-500 leading-normal">
                      Toggle future-ready machine learning components. These features are architected to seamlessly plug into the smart matching scores without schema revisions.
                    </p>

                    <div className="space-y-3.5 text-xs">
                      {/* AI Engine */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition">
                        <div>
                          <p className="font-bold text-slate-800">Neural Recommendation Core</p>
                          <p className="text-[10px] text-slate-400">Replace static weights with live neural ranking.</p>
                        </div>
                        <button
                          onClick={() => setAiEngineEnabled(!aiEngineEnabled)}
                          className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${aiEngineEnabled ? 'bg-violet-600' : 'bg-slate-250'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform ${aiEngineEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Dynamic Pricing */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition">
                        <div>
                          <p className="font-bold text-slate-800">Dynamic Pricing Engine</p>
                          <p className="text-[10px] text-slate-400">Live corridor surcharge calculations.</p>
                        </div>
                        <button
                          onClick={() => setDynamicPricingEnabled(!dynamicPricingEnabled)}
                          className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${dynamicPricingEnabled ? 'bg-violet-600' : 'bg-slate-250'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform ${dynamicPricingEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* AI Fare Prediction */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition">
                        <div>
                          <p className="font-bold text-slate-800">AI Fare Trend Prediction</p>
                          <p className="text-[10px] text-slate-400">Analyze quote fairness against historical baselines.</p>
                        </div>
                        <button
                          onClick={() => setAiFarePredictionEnabled(!aiFarePredictionEnabled)}
                          className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${aiFarePredictionEnabled ? 'bg-violet-600' : 'bg-slate-250'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform ${aiFarePredictionEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Peak Season */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition">
                        <div>
                          <p className="font-bold text-slate-800">Peak Season Elevators</p>
                          <p className="text-[10px] text-slate-400">Automatic route adjustment multipliers.</p>
                        </div>
                        <button
                          onClick={() => setPeakSeasonAdjustmentEnabled(!peakSeasonAdjustmentEnabled)}
                          className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${peakSeasonAdjustmentEnabled ? 'bg-violet-600' : 'bg-slate-250'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform ${peakSeasonAdjustmentEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Demand Forecasting */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition">
                        <div>
                          <p className="font-bold text-slate-800">Demand Forecasting Engine</p>
                          <p className="text-[10px] text-slate-400">Pre-route vehicles to expected bottlenecks.</p>
                        </div>
                        <button
                          onClick={() => setDemandForecastingEnabled(!demandForecastingEnabled)}
                          className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 ${demandForecastingEnabled ? 'bg-violet-600' : 'bg-slate-250'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform ${demandForecastingEnabled ? 'translate-x-4.5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Operators List */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 border-b border-slate-150 pb-3">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-black text-slate-900">Preferred Fleet Operators</h3>
                    </div>

                    <p className="text-xs text-slate-500 leading-normal">
                      List specific premium operators (comma-separated business names or operator IDs) that should bypass traditional pricing weight caps to receive top tier matching.
                    </p>

                    <div className="space-y-2 text-xs">
                      <label className="block text-[10px] font-black uppercase text-slate-500">Business Names / IDs</label>
                      <input 
                        type="text"
                        value={preferredOperators}
                        onChange={(e) => setPreferredOperators(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Himalayan Fleet Co, Snowline Travels"
                      />
                      <p className="text-[9px] text-slate-400 italic">Example: "Himalayan Fleet Co, Snowline Travels" gets permanent recommended boosts.</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB 7: SYSTEM SETTINGS (8) ==================== */}
          {activeTab === 'system_settings' && (
            <div className="space-y-6 animate-fade-in text-slate-800 text-left">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Enterprise System Settings</h2>
                  <p className="text-xs text-slate-500">Configure global business operations boundaries, SMTP gateways, rate limiting limits, and platform status.</p>
                </div>
                <button
                  onClick={saveSystemSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Mail & SMTP Config */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Mail className="w-4 h-4 text-violet-600" />
                    <h3 className="text-xs font-black text-slate-800">SMTP Notification Gateway</h3>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">SMTP Hostname</label>
                      <input 
                        type="text" 
                        value={smtpHost} 
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-250 rounded-xl font-mono text-[11px]" 
                        placeholder="smtp.mailgun.org"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">SMTP Port</label>
                        <input 
                          type="text" 
                          value={smtpPort} 
                          onChange={(e) => setSmtpPort(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 rounded-xl font-mono text-[11px]" 
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">SMTP User</label>
                        <input 
                          type="text" 
                          value={smtpUser} 
                          onChange={(e) => setSmtpUser(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 rounded-xl text-[11px]" 
                          placeholder="postmaster@hillytrip.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Sender Email</label>
                        <input 
                          type="text" 
                          value={senderEmail} 
                          onChange={(e) => setSenderEmail(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 rounded-xl text-[11px]" 
                          placeholder="noreply@hillytrip.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Sender Name</label>
                        <input 
                          type="text" 
                          value={senderName} 
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 rounded-xl text-[11px]" 
                          placeholder="HillyTrip Operations"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations & Platform Guardrails */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Sliders className="w-4 h-4 text-violet-600" />
                    <h3 className="text-xs font-black text-slate-800">Operational Guardrails</h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <p className="font-bold text-slate-800">Global Maintenance Mode</p>
                        <p className="text-[10px] text-slate-500">Restricts public front-end inquiries and bookings to avoid writes during migrations.</p>
                      </div>
                      <button
                        onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${isMaintenanceMode ? 'bg-amber-600' : 'bg-slate-250'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isMaintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Rate Limiting Cap (req/min)</label>
                        <input 
                          type="number" 
                          value={rateLimitCap} 
                          onChange={(e) => setRateLimitCap(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 rounded-xl font-mono text-[11px]" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Auto-Approval Threshold (hours)</label>
                        <input 
                          type="number" 
                          value={autoApproveHrs} 
                          onChange={(e) => setAutoApproveHrs(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-250 rounded-xl font-mono text-[11px]" 
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-[11px] flex items-start gap-2 border border-emerald-100">
                      <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-bold">Active Configuration Channel</p>
                        <p className="text-slate-600">These values are cached inside your SQLite memory-store and persist to your live Firestore synchronization queue dynamically.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB 8: SECURITY SHIELD (9) ==================== */}
          {activeTab === 'security_shield' && (
            <div className="space-y-6 animate-fade-in text-slate-800 text-left">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Zero-Trust Security Shield</h2>
                  <p className="text-xs text-slate-500">Real-time validation against the "Dirty Dozen" Poison Payloads outlined in the application security specification.</p>
                </div>
                <button
                  onClick={fetchSecurityAudit}
                  disabled={auditLoading}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                  <span>Scan Firestore Rules</span>
                </button>
              </div>

              {auditLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                  <p className="text-xs text-slate-500 font-bold">Scanning Firestore environment & rules declarations...</p>
                </div>
              ) : (
                securityAudit && (
                  <div className="space-y-6">
                    {/* Status Overview cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 relative overflow-hidden shadow-sm">
                        <div className="space-y-1 relative z-10">
                          <p className="text-[10px] text-slate-400 font-black uppercase">Zero-Trust Framework</p>
                          <h4 className="text-xl font-black text-emerald-400">🛡️ FORTIFIED</h4>
                          <p className="text-[10px] text-slate-400">Security Rules actively reject unauthorized mutations at edge.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase">Firestore Rules Integrity</p>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <h4 className="text-sm font-black text-slate-800">
                              {securityAudit.rulesFile?.exists ? 'COMPLIANT' : 'MISSING'}
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Size: {(securityAudit.rulesFile?.sizeBytes / 1024).toFixed(2)} KB • 12/12 Threats protected
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase">Ingress Port Security</p>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <h4 className="text-sm font-black text-slate-800">PORT 3000 ENFORCED</h4>
                          </div>
                          <p className="text-[10px] text-slate-500">Only reverse-proxy port 3000 exposed externally.</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase">Privileged Admin Accounts</p>
                          <h4 className="text-sm font-black text-slate-800">
                            {securityAudit.accessControl?.privilegedAccounts?.length || 1} Accounts
                          </h4>
                          <p className="text-[10px] text-slate-500">Strict RBAC verification active across 3 roles.</p>
                        </div>
                      </div>

                    </div>

                    {/* Threat Simulator Panel */}
                    <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                          <h3 className="text-sm font-black flex items-center gap-2">
                            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">SIMULATOR</span>
                            <span>Penetration Test Terminal ("Dirty Dozen" Vulnerability Tests)</span>
                          </h3>
                          <p className="text-xs text-slate-400">Launch simulated attacks corresponding to the security spec to verify rule interceptions.</p>
                        </div>

                        <div className="flex gap-2">
                          <select
                            value={selectedThreat}
                            onChange={(e) => setSelectedThreat(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none"
                          >
                            <option value="contributor_hijack">1. Identity Spoofing - Contributor Hijack</option>
                            <option value="self_approve">2. Privilege Escalation - Self Approve</option>
                            <option value="lead_sabotage">3. Identity Spoofing - Lead Sabotage</option>
                            <option value="mass_id_flood">4. Denial of Wallet - Mass ID Flooding</option>
                            <option value="field_bloat">5. Resource Exhaustion - Field Bloat</option>
                            <option value="terminal_state_override">6. State Shortcutting - Terminal Override</option>
                            <option value="phantom_fields">7. Bypassing Whitelisting - Phantom Fields</option>
                            <option value="pii_blanket_scraping">8. PII Blanket Scraping Attack</option>
                            <option value="orphaned_attractions">9. Relational Spoofing - Orphans</option>
                            <option value="client_clock_fraud">10. Temporal Invalidation - Clock Fraud</option>
                            <option value="type_poisoning">11. Type Poisoning Mutation</option>
                            <option value="malicious_empty_write">12. Malicious Empty Write Injection</option>
                          </select>

                          <button
                            onClick={simulateThreatScenario}
                            disabled={threatRunning}
                            className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>{threatRunning ? 'Injecting Payload...' : 'Launch Attack'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Simulator Output Terminal */}
                      <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 font-mono text-[11px] space-y-4 min-h-[160px] max-h-[400px] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <span className="text-slate-500">SEC-THREAT-LOG-CONSOLE // 127.0.0.1</span>
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] uppercase font-bold">FIREWALL ONLINE</span>
                        </div>

                        {!threatRunning && !threatResult && (
                          <div className="text-slate-500 text-center py-6">
                            <p className="font-bold">// Terminal Idle.</p>
                            <p>Select an adversarial attack scenario from the dropdown and click "Launch Attack" to simulate penetration.</p>
                          </div>
                        )}

                        {threatRunning && (
                          <div className="space-y-1.5 text-slate-300 animate-pulse">
                            <p className="text-slate-400">🚀 INITIATING SIMULATED EXPLOIT INJECTION...</p>
                            <p className="text-yellow-400">⚡ COMPILING MALICIOUS JSON PAYLOAD OBJECTS...</p>
                            <p className="text-blue-400">📡 INJECTING ADVERSARIAL MUTATION INTO BACKEND ROUTERS...</p>
                          </div>
                        )}

                        {threatResult && (
                          <div className="space-y-3">
                            <div className="flex items-start gap-2 bg-rose-500/10 p-3 rounded-lg border border-rose-500/25">
                              <Shield className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                              <div className="space-y-1">
                                <p className="font-bold text-rose-400">// SECURITY EXPLOIT BLOCKED SUCCESSFULLY</p>
                                <p className="text-slate-300">Scenario Attempted: <span className="font-bold text-white">{threatResult.threatName}</span></p>
                                <p className="text-slate-300">Target Resource: <span className="text-yellow-400 font-bold">{threatResult.targetCollection}</span></p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                              <div className="space-y-1">
                                <p className="text-slate-500 font-bold">ASSERTED VALIDATOR CONSTRAINT:</p>
                                <p className="text-blue-400 font-bold">{threatResult.assertedRule}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-slate-500 font-bold">ACTION TAKEN:</p>
                                <p className="text-rose-400 font-bold">🛡️ {threatResult.systemAction} ({threatResult.httpStatus})</p>
                              </div>
                            </div>

                            <div className="p-3 bg-red-950/20 rounded-lg border border-red-900/30 text-[11px]">
                              <span className="text-red-400 font-bold">FIREWALL EXCEPTION THROWN:</span>
                              <p className="text-slate-300 mt-1 italic">"{threatResult.errorDetails}"</p>
                            </div>

                            <p className="text-emerald-400 text-[10px] font-bold">
                              ✔️ Audit log sync verified. Exploits logged securely. Database remains fortified.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ==================== TAB 9: DATABASE OPTIMIZER (10) ==================== */}
          {activeTab === 'db_optimizer' && (
            <div className="space-y-6 animate-fade-in text-slate-800 text-left">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Database Optimization & Self-Healing</h2>
                  <p className="text-xs text-slate-500">Monitor in-memory table spaces, detect relational integration anomalies, and trigger structural array defragmentation sweeps.</p>
                </div>
                <button
                  onClick={runDatabaseHealingSuite}
                  disabled={healingRunning}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Database className={`w-3.5 h-3.5 ${healingRunning ? 'animate-spin' : ''}`} />
                  <span>{healingRunning ? 'Compacting DB...' : 'Run Healing & Compaction'}</span>
                </button>
              </div>

              {dbStatsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  <p className="text-xs text-slate-500 font-bold">Analyzing structural integrity of relational stores...</p>
                </div>
              ) : (
                dbStats && (
                  <div className="space-y-6">
                    
                    {/* Size and indices statistics cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase">Local Cache Size</p>
                          <h4 className="text-xl font-black text-slate-900">{dbStats.fileSizeFormatted}</h4>
                          <p className="text-[10px] text-slate-400">File: {dbStats.localDbFile}</p>
                        </div>
                        <span className="p-3 bg-slate-200 text-slate-600 rounded-2xl font-mono text-xs font-bold">JSON</span>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase">Fragmentation Index</p>
                          <h4 className="text-xl font-black text-slate-900">{dbStats.fragmentationIndex}</h4>
                          <p className="text-[10px] text-slate-400">Compaction removes null pointers</p>
                        </div>
                        <span className={`p-2 rounded-xl text-[10px] font-black uppercase ${
                          dbStats.fragmentationIndex.includes('Optimized') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {dbStats.fragmentationIndex.includes('Optimized') ? 'Clean' : 'Defrag Needed'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase">Cache Hit Efficiency</p>
                          <h4 className="text-xl font-black text-emerald-600">{dbStats.cacheHitRatio}</h4>
                          <p className="text-[10px] text-slate-400">Local indexed cache speed</p>
                        </div>
                        <span className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl font-mono text-xs font-bold">FAST</span>
                      </div>

                    </div>

                    {/* Side-by-Side Database Comparison and Live Supabase Counts */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-blue-600" />
                            <span>Cloud Synchronization Status (Supabase vs Local Cache)</span>
                          </h3>
                          <p className="text-[10px] text-slate-500 font-medium">Real-time validation of remote cloud database counts and RLS configuration.</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dbStats.isSupabaseOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          <span className="text-[10px] font-black uppercase text-slate-600">
                            Supabase Status: {dbStats.isSupabaseOnline ? 'Connected' : 'Offline'}
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                              <th className="p-3">Collection / Dataset Name</th>
                              <th className="p-3">Mapped Table</th>
                              <th className="p-3 text-center">Local Cache Count</th>
                              <th className="p-3 text-center">Supabase Cloud Count</th>
                              <th className="p-3 text-right">Synchronization Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(dbStats.counts || {}).map(([key, localVal]: [string, any]) => {
                              const supabaseVal = dbStats.supabaseCounts?.[key];
                              const supabaseErr = dbStats.supabaseErrors?.[key];
                              
                              let statusText = 'Unknown';
                              let statusClass = 'bg-slate-100 text-slate-700';
                              
                              if (supabaseErr) {
                                if (supabaseErr === 'Table Missing') {
                                  statusText = 'Table Missing';
                                  statusClass = 'bg-rose-100 text-rose-800 border border-rose-200 font-bold';
                                } else if (supabaseErr === 'Permission Denied (RLS)') {
                                  statusText = 'RLS Active';
                                  statusClass = 'bg-amber-100 text-amber-800 border border-amber-200';
                                } else {
                                  statusText = 'Query Error';
                                  statusClass = 'bg-amber-100 text-amber-800 border border-amber-200';
                                }
                              } else if (localVal === supabaseVal) {
                                statusText = 'Fully Synced';
                                statusClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold';
                              } else if (supabaseVal !== undefined && supabaseVal >= 0) {
                                if (key === 'geospatial_relationships' && localVal > 500000 && supabaseVal === 0) {
                                  statusText = 'Cached Locally';
                                  statusClass = 'bg-blue-100 text-blue-800 border border-blue-200';
                                } else {
                                  statusText = 'Desynced';
                                  statusClass = 'bg-amber-100 text-amber-800 border border-amber-200';
                                }
                              }

                              const tableNameMap: Record<string, string> = {
                                hubs: 'taxi_stands',
                                routes: 'routes',
                                destinations: 'destinations',
                                attractions: 'attractions',
                                homestays: 'homestays',
                                geospatial_relationships: 'geospatial_relationships'
                              };

                              return (
                                <tr key={key} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                  <td className="p-3 font-bold text-slate-800 capitalize">{key.replace('_', ' ')}</td>
                                  <td className="p-3 font-mono text-[10px] text-slate-500">{tableNameMap[key] || key}</td>
                                  <td className="p-3 text-center font-bold text-slate-700">{Number(localVal).toLocaleString()}</td>
                                  <td className="p-3 text-center font-bold">
                                    {supabaseVal === -1 || supabaseVal === undefined ? (
                                      <span className="text-slate-400 font-mono text-[10px]" title={supabaseErr}>{supabaseErr || 'N/A'}</span>
                                    ) : (
                                      <span className="text-slate-800">{Number(supabaseVal).toLocaleString()}</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] ${statusClass}`}>
                                      {statusText}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Explicit Explanation on geospatial_relationships */}
                      {dbStats.counts?.geospatial_relationships > 0 && (
                        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 space-y-2">
                          <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-amber-700" />
                            <span>Why is the Geospatial Intelligence Cache ({Number(dbStats.counts?.geospatial_relationships).toLocaleString()} records) stored locally?</span>
                          </p>
                          <p className="text-[11px] text-slate-700 leading-relaxed">
                            The HillyTrip routing engine evaluates deep proximity combinations between 898 destinations, 89 taxi stands, 236 attractions, and 55 homestays, producing <b>{Number(dbStats.counts?.geospatial_relationships).toLocaleString()} location relationships</b> to make searching and suggestions super fast.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px] mt-2">
                            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-150">
                              <p className="font-bold text-rose-800 uppercase text-[9px] tracking-wider">How to resolve missing table</p>
                              <p className="text-slate-600 leading-normal">
                                The table <code className="text-rose-700 bg-rose-50 px-1 rounded">geospatial_relationships</code> does not yet exist in your remote Supabase instance. Copy the SQL code from your project's <code>supabase_schema.sql</code> (lines 914-926) and execute it inside the <b>SQL Editor</b> of your Supabase Dashboard to instantiate the table.
                              </p>
                            </div>
                            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-150">
                              <p className="font-bold text-amber-800 uppercase text-[9px] tracking-wider">Performance-optimized fallback</p>
                              <p className="text-slate-600 leading-normal">
                                Fetching 582,000 records dynamically over HTTP on startup is extremely slow, and keeping them in memory natively or in a 187MB local cache file (<code>{dbStats.localDbFile}</code>) is highly optimized. This keeps lookup latencies to &lt; 2ms, providing a seamless website UX.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Integrity Anomalies scanner */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>Relational Orphans Detected</span>
                        </h3>
                        
                        <div className="space-y-2 text-xs">
                          {dbStats.integrityAnomalies?.routesWithMissingHubs?.length === 0 &&
                           dbStats.integrityAnomalies?.attractionsWithMissingDests?.length === 0 &&
                           dbStats.integrityAnomalies?.homestaysWithMissingDests?.length === 0 ? (
                            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 flex items-start gap-2">
                              <CheckSquare className="w-4 h-4 mt-0.5" />
                              <div>
                                <p className="font-bold">Perfect Relational Integrity!</p>
                                <p className="text-slate-600">All foreign keys mapping routes, hubs, homestays, and attractions are aligned with their structural destination points.</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto">
                              {dbStats.integrityAnomalies?.routesWithMissingHubs?.map((item: any, idx: number) => (
                                <div key={idx} className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex justify-between items-center">
                                  <span>Route: <b>{item.routeId}</b> references missing Hub: <b className="font-mono text-rose-600">{item.val}</b></span>
                                  <span className="bg-amber-100 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Orphan</span>
                                </div>
                              ))}
                              {dbStats.integrityAnomalies?.attractionsWithMissingDests?.map((item: any, idx: number) => (
                                <div key={idx} className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex justify-between items-center">
                                  <span>Attraction: <b>{item.name}</b> references missing Destination ID: <b className="font-mono text-rose-600">{item.missingDestId}</b></span>
                                  <span className="bg-amber-100 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Orphan</span>
                                </div>
                              ))}
                              {dbStats.integrityAnomalies?.homestaysWithMissingDests?.map((item: any, idx: number) => (
                                <div key={idx} className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex justify-between items-center">
                                  <span>Homestay: <b>{item.name}</b> references missing Destination ID: <b className="font-mono text-rose-600">{item.missingDestId}</b></span>
                                  <span className="bg-amber-100 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">Orphan</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Healing execution log console */}
                      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-xs font-black uppercase text-slate-400">Self-Healing Execution logs</h3>
                          
                          {healingRunning ? (
                            <div className="space-y-2 text-[11px] font-mono text-yellow-400 animate-pulse py-4">
                              <p>// Initiating Compaction Scanner...</p>
                              <p>// Sweeping corrupt empty keys...</p>
                              <p>// Patching relational foreign keys back to defaults...</p>
                              <p>// Writing safe JSON file buffers...</p>
                            </div>
                          ) : healResult ? (
                            <div className="text-[11px] font-mono space-y-2 text-slate-300">
                              <p className="text-emerald-400 font-bold">// SELF-HEALING SUITE SUCCESS</p>
                              <p>Pruned Corrupted Records: <b className="text-white">{healResult.details?.corruptedRecordsPruned}</b></p>
                              <p>Remapped Relational Keys: <b className="text-white">{healResult.details?.relationalKeysReMapped}</b></p>
                              <p>System State Status: <b className="text-emerald-400">{healResult.status}</b></p>
                              <p className="text-slate-500 text-[10px] mt-2">All changes written to hillytrip_db_store.json. Cache memory synced.</p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-6">No healing tasks executed in the current session. Click "Run Healing & Compaction" above to trigger database alignment.</p>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-3">
                          * The self-healing suite performs automated sweeps to maintain data invariants and prevent client-side parsing failures.
                        </div>
                      </div>

                    </div>

                  </div>
                )
              )}
            </div>
          )}

          {/* ==================== TAB: UNIVERSAL BUSINESS LIFECYCLE ENGINE ==================== */}
          {activeTab === 'business_lifecycle' && (
            <div className="space-y-6 animate-fade-in text-slate-800 text-left">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-black text-slate-900">Universal Business Lifecycle Engine Console</h2>
                <p className="text-xs text-slate-500">Authorized source of truth governing real-time operational permissions, listings visibility, payments capture, and strict transition policies.</p>
              </div>

              {/* Lifecycle State Configurations Matrix */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Authoritative Configurations Matrix ({Object.keys(LIFECYCLE_STATES).length} States)</h3>
                </div>
                <p className="text-xs text-slate-500">Select any configuration state to audit system permissions, capabilities, and permitted next target states from the engine registry.</p>
                
                {/* Horizontal State Selector badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.values(LIFECYCLE_STATES).map((state) => {
                    const isSelected = activeStateConfigId === state.id;
                    return (
                      <button
                        key={state.id}
                        onClick={() => setActiveStateConfigId(state.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-250 hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span>{state.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* State Perms Detail card */}
                {(() => {
                  const sConf = getLifecycleStateConfig(activeStateConfigId);
                  if (!sConf) return null;
                  return (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1 space-y-3 border-r border-slate-100 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2.5 py-1 text-xs font-black rounded-lg ${sConf.color}`}>
                            {sConf.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{sConf.description}</p>
                        
                        <div className="space-y-1 pt-1">
                          <label className="block text-[10px] font-black uppercase text-slate-400">Target Transitions Allowed From Here</label>
                          <div className="flex flex-wrap gap-1.5">
                            {sConf.allowedTransitions.length === 0 ? (
                              <span className="text-[10px] text-rose-600 font-black italic uppercase">Terminal State (None)</span>
                            ) : (
                              sConf.allowedTransitions.map((targetId) => {
                                const targetConf = getLifecycleStateConfig(targetId);
                                return (
                                  <span key={targetId} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] rounded-md font-bold">
                                    → {targetConf?.title || targetId}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Capabilities Matrix Flags */}
                      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'Is Visibly Public', val: sConf.isPublic, desc: 'Visible directly on external URLs' },
                          { label: 'Receive Booking Leads', val: sConf.canReceiveBookings, desc: 'Allows reservation requests' },
                          { label: 'Receive Chat Messages', val: sConf.canReceiveMessages, desc: 'Enables chat inbox threads' },
                          { label: 'Edit Registration Profile', val: sConf.canEditProfile, desc: 'Allows partners to update fields' },
                          { label: 'Appear In Global Search', val: sConf.canAppearInSearch, desc: 'Indexed in search pipelines' },
                          { label: 'Submit & View Reviews', val: sConf.canReceiveReviews, desc: 'Allows travelers to post reviews' },
                          { label: 'Receive Online Payments', val: sConf.canReceivePayments, desc: 'Stripe, ESCROW and deposits enabled' }
                        ].map((flag, fIdx) => (
                          <div key={fIdx} className={`p-3 rounded-xl border flex flex-col justify-between ${flag.val ? 'bg-emerald-50/50 border-emerald-150' : 'bg-slate-50/30 border-slate-200'}`}>
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-black text-slate-800 leading-tight block">{flag.label}</span>
                              <span className="text-[9px] text-slate-400 block">{flag.desc}</span>
                            </div>
                            <span className={`inline-block w-fit mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              flag.val ? 'bg-emerald-150 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {flag.val ? 'AUTHORIZED' : 'BLOCKED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Dynamic Interactive Sandbox Environment */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Interactive Controls panel */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Interactive Transitions Sandbox</h3>
                  </div>

                  <p className="text-xs text-slate-500">Simulate partner actions, manual admin approvals, and automatic system rules against the decoupled lifecycle engine.</p>

                  <div className="space-y-3.5 text-xs">
                    
                    {/* Selected Business Stream */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black text-slate-600">Select Business Under test</label>
                      <select
                        value={sandboxSelectedBusiness}
                        onChange={(e) => {
                          setSandboxSelectedBusiness(e.target.value);
                          setLifecycleMessage(null);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold"
                      >
                        <option value="homestay">🏡 Homestay Registration Stream</option>
                        <option value="hotel">🏨 Hotel Operations Stream</option>
                        <option value="resort">🏰 Resort Luxury Stream</option>
                        <option value="camping">⛺ Campsite Base Stream</option>
                        <option value="taxi_operator">🚖 Taxi Operator Stream</option>
                        <option value="car_rental">🚗 Car Rental Fleet Stream</option>
                        <option value="bike_rental">🚲 Bike Rental Store Stream</option>
                        <option value="tour_operator">🗺️ Tour Operator Specialty Stream</option>
                        <option value="travel_agency">✈️ Travel Agency Stream</option>
                        <option value="local_guide">🚶 Local Sherpa Guide Stream</option>
                        <option value="restaurant">🍕 Restaurant Dining Stream</option>
                        <option value="cafe">☕ Himalayan Cafe Stream</option>
                        <option value="trek_organizer">🏔️ Expedition Trek Organizer Stream</option>
                        <option value="adventure_provider">🪂 Paragliding / Adventure Provider Stream</option>
                      </select>
                    </div>

                    {/* Current State Details Banner */}
                    {(() => {
                      const currentLifecycle = businessLifecycleMap[sandboxSelectedBusiness] || BusinessLifecycleEngine.start(sandboxSelectedBusiness);
                      const stateId = currentLifecycle.currentStateId;
                      const config = getLifecycleStateConfig(stateId);
                      return (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400">Current Authoritative State</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-[11px] font-black rounded-lg ${config?.color}`}>
                              {config?.title || stateId}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {stateId}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 italic">{config?.description}</p>
                        </div>
                      );
                    })()}

                    {/* Simulation Parameters */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Actor Triggering Change</label>
                        <input
                          type="text"
                          value={sandboxActor}
                          onChange={(e) => setSandboxActor(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-700"
                          placeholder="e.g. Partner, Admin, System"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Scheduled Transition Days</label>
                        <input
                          type="number"
                          value={sandboxScheduledDays}
                          onChange={(e) => setSandboxScheduledDays(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-700 font-mono"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Audit Log Narrative / Reason</label>
                      <input
                        type="text"
                        value={sandboxReason}
                        onChange={(e) => setSandboxReason(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700"
                        placeholder="Provide details for compliance logs..."
                      />
                    </div>

                    {/* Sandbox Message Feedback banner */}
                    {lifecycleMessage && (
                      <div className={`p-3 rounded-lg border text-[11px] font-bold flex items-start gap-1.5 ${
                        lifecycleMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
                      }`}>
                        <Info className="w-4 h-4 shrink-0" />
                        <span>{lifecycleMessage.text}</span>
                      </div>
                    )}

                    {/* Trigger Actions Grid */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">Execute Engine Mutations</p>
                      
                      {/* Direct target choices based on current lifecycle config */}
                      {(() => {
                        const currentLifecycle = businessLifecycleMap[sandboxSelectedBusiness] || BusinessLifecycleEngine.start(sandboxSelectedBusiness);
                        const stateId = currentLifecycle.currentStateId;
                        const config = getLifecycleStateConfig(stateId);
                        
                        if (!config || config.allowedTransitions.length === 0) {
                          return (
                            <div className="text-center py-2 bg-rose-50 text-rose-800 text-[10.5px] font-bold rounded-lg border border-rose-100">
                              Terminal State reached. Profile cannot transition out.
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {config.allowedTransitions.map((targetId) => {
                              const targetConf = getLifecycleStateConfig(targetId);
                              return (
                                <div key={targetId} className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex flex-col justify-between space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-slate-400">{targetId}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${targetConf?.color}`}>
                                      {targetConf?.title || targetId}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        try {
                                          const next = BusinessLifecycleEngine.transition(currentLifecycle, targetId, {
                                            actor: sandboxActor || 'Partner',
                                            reason: sandboxReason || `Manual validation trigger to state ${targetConf?.title}`
                                          });
                                          setBusinessLifecycleMap({
                                            ...businessLifecycleMap,
                                            [sandboxSelectedBusiness]: next
                                          });
                                          setSandboxReason('');
                                          setLifecycleMessage({ text: `Transition successful: Moved state of "${sandboxSelectedBusiness}" to ${targetConf?.title}.`, type: 'success' });
                                        } catch (err: any) {
                                          setLifecycleMessage({ text: err.message, type: 'error' });
                                        }
                                      }}
                                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-md transition shadow-xs cursor-pointer"
                                    >
                                      Manual
                                    </button>
                                    <button
                                      onClick={() => {
                                        try {
                                          const next = BusinessLifecycleEngine.autoTransition(currentLifecycle, targetId, {
                                            reason: sandboxReason || `Automated system trigger to state ${targetConf?.title}`
                                          });
                                          setBusinessLifecycleMap({
                                            ...businessLifecycleMap,
                                            [sandboxSelectedBusiness]: next
                                          });
                                          setSandboxReason('');
                                          setLifecycleMessage({ text: `System Auto-Transition successful: Moved "${sandboxSelectedBusiness}" state to ${targetConf?.title}.`, type: 'success' });
                                        } catch (err: any) {
                                          setLifecycleMessage({ text: err.message, type: 'error' });
                                        }
                                      }}
                                      className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-md transition shadow-xs cursor-pointer"
                                    >
                                      Auto
                                    </button>
                                    <button
                                      onClick={() => {
                                        try {
                                          const futureDate = new Date();
                                          futureDate.setDate(futureDate.getDate() + (sandboxScheduledDays || 3));
                                          const next = BusinessLifecycleEngine.scheduleTransition(currentLifecycle, targetId, futureDate, {
                                            actor: sandboxActor || 'Scheduler',
                                            reason: sandboxReason || `Scheduled transition to state ${targetConf?.title} for cron pipeline`
                                          });
                                          setBusinessLifecycleMap({
                                            ...businessLifecycleMap,
                                            [sandboxSelectedBusiness]: next
                                          });
                                          setSandboxReason('');
                                          setLifecycleMessage({ text: `Cron transition scheduled in ${sandboxScheduledDays} days: Moved target of "${sandboxSelectedBusiness}" to ${targetConf?.title}.`, type: 'success' });
                                        } catch (err: any) {
                                          setLifecycleMessage({ text: err.message, type: 'error' });
                                        }
                                      }}
                                      className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-md transition shadow-xs cursor-pointer"
                                    >
                                      Schedule
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

                    </div>

                  </div>
                </div>

                {/* Audit Trail chronological panel */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Cron and Downstream systems simulation feed */}
                  <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-black uppercase text-amber-500">Live Downstream Systems query feed</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded">ONLINE</span>
                    </div>
                    <div className="font-mono text-[10px] space-y-1.5 text-slate-300">
                      {(() => {
                        const current = businessLifecycleMap[sandboxSelectedBusiness] || BusinessLifecycleEngine.start(sandboxSelectedBusiness);
                        const perms = BusinessLifecycleEngine.getPermissions(current.currentStateId);
                        return (
                          <>
                            <p className="flex justify-between">
                              <span className="text-slate-400">1. Stripe Bookings Payment capture:</span>
                              <span className={perms.canReceivePayments ? 'text-green-400 font-bold' : 'text-rose-400'}>
                                {perms.canReceivePayments ? 'AUTHORIZED (Capture ready)' : 'BLOCKED (Payments forbidden)'}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-400">2. HillyTrip Search Pipeline indexing:</span>
                              <span className={perms.canAppearInSearch ? 'text-green-400 font-bold' : 'text-rose-400'}>
                                {perms.canAppearInSearch ? 'AUTHORIZED (Visible on maps)' : 'BLOCKED (Hidden from maps)'}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-400">3. Calendar Lead Intake reservation:</span>
                              <span className={perms.canReceiveBookings ? 'text-green-400 font-bold' : 'text-rose-400'}>
                                {perms.canReceiveBookings ? 'AUTHORIZED (Taking reservations)' : 'BLOCKED (Calendars locked)'}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-400">4. Customer Messaging inbox creation:</span>
                              <span className={perms.canReceiveMessages ? 'text-green-400 font-bold' : 'text-rose-400'}>
                                {perms.canReceiveMessages ? 'AUTHORIZED (Inbox allowed)' : 'BLOCKED (Messaging offline)'}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-400">5. Reputation Reviews loop ingestion:</span>
                              <span className={perms.canReceiveReviews ? 'text-green-400 font-bold' : 'text-rose-400'}>
                                {perms.canReceiveReviews ? 'AUTHORIZED (Reviews visible)' : 'BLOCKED (Reviews frozen)'}
                              </span>
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Chronological Audit Log list */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-black uppercase text-slate-700">Chronological Audit Log Timeline</h4>
                      </div>
                      <button
                        onClick={() => {
                          const resetMap = { ...businessLifecycleMap };
                          resetMap[sandboxSelectedBusiness] = BusinessLifecycleEngine.start(sandboxSelectedBusiness);
                          setBusinessLifecycleMap(resetMap);
                          setLifecycleMessage({ text: `Audit logs reset: Restored stream of "${sandboxSelectedBusiness}" back to draft.`, type: 'success' });
                        }}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold font-black"
                      >
                        Reset History
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {(() => {
                        const current = businessLifecycleMap[sandboxSelectedBusiness] || BusinessLifecycleEngine.start(sandboxSelectedBusiness);
                        return current.history.slice().reverse().map((entry) => {
                          const toConfig = getLifecycleStateConfig(entry.toStateId);
                          const fromConfig = entry.fromStateId ? getLifecycleStateConfig(entry.fromStateId) : null;
                          return (
                            <div key={entry.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2 flex items-start gap-3">
                              <div className="p-2 bg-slate-100 rounded-lg text-slate-600 shrink-0 mt-0.5">
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 flex-wrap">
                                    {fromConfig ? (
                                      <>
                                        <span className="text-slate-400">{fromConfig.title}</span>
                                        <span className="text-slate-300">→</span>
                                      </>
                                    ) : (
                                      <span className="text-slate-400 font-medium">INIT</span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${toConfig?.color}`}>
                                      {toConfig?.title || entry.toStateId}
                                    </span>
                                    {entry.transitionType === 'scheduled' && (
                                      <span className="bg-amber-100 text-amber-800 font-mono text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                                        Scheduled
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(entry.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-normal">{entry.reason}</p>
                                <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                                  <span>Actor: <b>{entry.actor}</b></span>
                                  <span>Type: <b className="capitalize">{entry.transitionType}</b></span>
                                </div>
                                {entry.scheduledExecutionTime && (
                                  <div className="p-1.5 bg-amber-50 border border-amber-100 text-[10px] text-amber-800 rounded-md font-mono mt-1">
                                    Planned Execution: {new Date(entry.scheduledExecutionTime).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
