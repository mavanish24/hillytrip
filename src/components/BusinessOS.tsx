import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  TrendingUp, 
  MessageSquare, 
  Edit3, 
  CheckCircle, 
  XSquare, 
  Loader2, 
  Plus, 
  Search, 
  AlertCircle, 
  Compass, 
  Check, 
  X, 
  Settings, 
  Eye, 
  Smartphone, 
  Calendar, 
  Mail, 
  ChevronRight, 
  Info,
  DollarSign,
  Briefcase,
  Star,
  Clock,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Camera,
  BarChart2,
  Users,
  Bell,
  Upload,
  HelpCircle,
  Layout,
  PieChart,
  ShieldAlert,
  BookOpen,
  Layers,
  ArrowRight,
  Sparkles,
  MapPin,
  Lock,
  Unlock,
  RefreshCw,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { businessConfigurations } from './businessConfigurations';
import { WorkflowEngine } from '../utils/workflowEngine';
import { BusinessLifecycleEngine } from '../utils/businessLifecycleEngine';
import { getLifecycleStateConfig } from '../utils/lifecycleRegistry';
import { getWorkflow } from '../utils/workflowRegistry';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import { UPSEBusinessDashboard } from './UPSEBusinessDashboard';

interface BusinessOSProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error', message: string } | null) => void;
}

export default function BusinessOS({
  user,
  onUpdateUser,
  navigate,
  setNotification
}: BusinessOSProps) {
  
  // Choose or fallback to a business type
  const [activeBusinessType, setActiveBusinessType] = useState<string>(() => {
    if (user?.currentBusinessType) return user.currentBusinessType;
    if (user?.businessType) return user.businessType === 'cab' ? 'taxi_operator' : user.businessType;
    return 'homestay'; // default fallback
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // States for simulated metrics
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Load business config
  const config = businessConfigurations[activeBusinessType] || businessConfigurations.homestay;

  // Read data from user state
  const businessData = user?.partnerDetails?.[activeBusinessType] || {
    formData: {},
    documents: {},
    photos: [],
    status: 'Draft',
    workflowState: {
      workflowId: config.workflowId || 'homestay_verification',
      currentStageId: 'draft',
      history: []
    }
  };

  const workflowState = businessData.workflowState;
  const currentStageId = workflowState?.currentStageId || 'draft';
  const lifecycleStateId = businessData.lifecycleState || 'draft';

  // Retrieve current configurations
  const workflowConfig = getWorkflow(config.workflowId);
  const currentStageConfig = workflowConfig.stages[currentStageId] || workflowConfig.stages.draft;
  const lifecycleConfig = getLifecycleStateConfig(lifecycleStateId) || getLifecycleStateConfig('draft')!;
  const permissions = BusinessLifecycleEngine.getPermissions(lifecycleStateId);

  // Dynamic Profile Completion Calculation
  const [profileCompletion, setProfileCompletion] = useState({
    total: 0,
    sections: {} as Record<string, number>,
    missingItems: [] as { id: string; label: string; sectionId: string; type: 'field' | 'document' | 'photo' }[]
  });

  useEffect(() => {
    let totalItems = 0;
    let filledItems = 0;
    const sectionScores: Record<string, number> = {};
    const missing: typeof profileCompletion.missingItems = [];

    config.sections.forEach(sec => {
      let secTotal = 0;
      let secFilled = 0;

      if (sec.type === 'fields' && sec.fields) {
        sec.fields.forEach(f => {
          if (f.required) {
            secTotal++;
            totalItems++;
            const val = businessData.formData?.[f.id];
            if (val !== undefined && val !== null && val !== '') {
              secFilled++;
              filledItems++;
            } else {
              missing.push({ id: f.id, label: f.label, sectionId: sec.id, type: 'field' });
            }
          }
        });
      } else if (sec.type === 'documents' && sec.requiredDocuments) {
        sec.requiredDocuments.forEach(doc => {
          secTotal++;
          totalItems++;
          const exists = businessData.documents?.[doc.id];
          if (exists) {
            secFilled++;
            filledItems++;
          } else {
            missing.push({ id: doc.id, label: doc.name, sectionId: sec.id, type: 'document' });
          }
        });
      } else if (sec.type === 'photos') {
        secTotal++;
        totalItems++;
        const photoCount = businessData.photos?.length || 0;
        if (photoCount > 0) {
          secFilled++;
          filledItems++;
        } else {
          missing.push({ id: 'photos', label: 'Upload Business Photos', sectionId: sec.id, type: 'photo' });
        }
      }

      sectionScores[sec.id] = secTotal > 0 ? Math.round((secFilled / secTotal) * 100) : 100;
    });

    const totalPercentage = totalItems > 0 ? Math.round((filledItems / totalItems) * 100) : 100;

    setProfileCompletion({
      total: totalPercentage,
      sections: sectionScores,
      missingItems: missing
    });

    // Save actual profile completion score back to user if updated
    if (businessData.profileCompletionPercentage !== totalPercentage) {
      // Avoid infinite loop by only saving on meaningful change
    }
  }, [user, activeBusinessType, config]);

  // Handle Dynamic Onboarding Field Input Change
  const handleFieldChange = (sectionId: string, fieldId: string, value: any) => {
    const updatedFormData = {
      ...businessData.formData,
      [fieldId]: value
    };

    const updatedBusinessTypeData = {
      ...businessData,
      formData: updatedFormData
    };

    const updatedPartnerDetails = {
      ...user.partnerDetails,
      [activeBusinessType]: updatedBusinessTypeData
    };

    onUpdateUser({
      ...user,
      partnerDetails: updatedPartnerDetails
    });
  };

  // Handle Document Upload simulation
  const handleSimulatedDocUpload = (docId: string, docName: string) => {
    const updatedDocs = {
      ...businessData.documents,
      [docId]: {
        filename: `${docId}_verified_scan.pdf`,
        size: '1.4 MB',
        uploadedAt: new Date().toISOString()
      }
    };

    const updatedBusinessTypeData = {
      ...businessData,
      documents: updatedDocs
    };

    const updatedPartnerDetails = {
      ...user.partnerDetails,
      [activeBusinessType]: updatedBusinessTypeData
    };

    onUpdateUser({
      ...user,
      partnerDetails: updatedPartnerDetails
    });

    setNotification({
      type: 'success',
      message: `Successfully uploaded regulatory document: ${docName}`
    });
  };

  // Handle Photo Upload simulation
  const handleSimulatedPhotoUpload = () => {
    const newPhoto = {
      filename: `photo_${Date.now()}.jpg`,
      size: '2.8 MB',
      uploadedAt: new Date().toISOString()
    };

    const updatedPhotos = [...(businessData.photos || []), newPhoto];

    const updatedBusinessTypeData = {
      ...businessData,
      photos: updatedPhotos
    };

    const updatedPartnerDetails = {
      ...user.partnerDetails,
      [activeBusinessType]: updatedBusinessTypeData
    };

    onUpdateUser({
      ...user,
      partnerDetails: updatedPartnerDetails
    });

    setNotification({
      type: 'success',
      message: 'Uploaded new high-resolution photo asset to gallery'
    });
  };

  // Handle simulated workflow trigger/transition
  const handleWorkflowTransition = (actionId: string, targetStageId: string) => {
    // 1. Update workflow stage
    const currentHistory = businessData.workflowState?.history || [];
    const newHistoryEntry = {
      id: 'wf-' + Math.random().toString(36).substring(2, 9),
      fromStageId: currentStageId,
      toStageId: targetStageId,
      actionId: actionId,
      timestamp: new Date().toISOString(),
      reviewerName: 'Admin Desk Automatic Audit',
      comment: 'Dynamic workflow state engine triggered via Sandbox Console.'
    };

    const nextWorkflowState = {
      workflowId: workflowState.workflowId,
      currentStageId: targetStageId,
      history: [...currentHistory, newHistoryEntry]
    };

    // 2. Derive next lifecycle state automatically based on target workflow stage
    let nextLifecycleState = lifecycleStateId;
    if (targetStageId === 'submitted') {
      nextLifecycleState = 'pending_verification';
    } else if (targetStageId === 'approved') {
      nextLifecycleState = 'approved';
    } else if (targetStageId === 'published') {
      nextLifecycleState = 'published';
    } else if (targetStageId === 'draft') {
      nextLifecycleState = 'draft';
    } else if (targetStageId === 'suspended') {
      nextLifecycleState = 'suspended';
    }

    const updatedBusinessTypeData = {
      ...businessData,
      status: targetStageId.toUpperCase(),
      workflowState: nextWorkflowState,
      lifecycleState: nextLifecycleState
    };

    const updatedPartnerDetails = {
      ...user.partnerDetails,
      [activeBusinessType]: updatedBusinessTypeData
    };

    onUpdateUser({
      ...user,
      partnerDetails: updatedPartnerDetails
    });

    setNotification({
      type: 'success',
      message: `Workflow state updated to [${targetStageId.toUpperCase()}] and Lifecycle State changed to [${nextLifecycleState.toUpperCase()}]!`
    });
  };

  // Direct tab navigation for missing items click
  const handleTaskClick = (sectionId: string) => {
    if (sectionId === 'basic_info' || sectionId === 'hotel_details' || sectionId === 'taxi_details' || sectionId === 'tour_details' || sectionId === 'kitchen_specs' || sectionId === 'guide_bio') {
      setActiveTab('profile');
    } else if (sectionId === 'documents') {
      setActiveTab('documents');
    } else if (sectionId === 'photos') {
      setActiveTab('photos');
    } else {
      setActiveTab('profile');
    }
  };

  // Side bar navigation links configuration
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, allowed: true },
    { id: 'profile', label: 'Profile Onboarding', icon: Edit3, allowed: true },
    { id: 'services', label: 'My Services', icon: Layers, allowed: config.businessType !== 'taxi_operator' },
    { id: 'pricing', label: 'Rates & Tariff', icon: DollarSign, allowed: true },
    { id: 'bookings', label: 'Bookings', icon: Calendar, allowed: true, locked: !permissions.canReceiveBookings },
    { id: 'calendar', label: 'Availability Calendar', icon: Clock, allowed: true, locked: !permissions.canReceiveBookings },
    { id: 'reviews', label: 'Reviews & Reputation', icon: Star, allowed: true, locked: !permissions.canReceiveReviews },
    { id: 'photos', label: 'Photos Gallery', icon: Camera, allowed: true },
    { id: 'documents', label: 'Compliance Docs', icon: FileText, allowed: true },
    { id: 'staff', label: 'Staff Management', icon: Users, allowed: true, locked: !permissions.canReceiveBookings },
    { id: 'payments', label: 'Payments & Payouts', icon: TrendingUp, allowed: true, locked: !permissions.canReceivePayments },
    { id: 'analytics', label: 'Business Analytics', icon: BarChart2, allowed: true },
    { id: 'settings', label: 'OS Settings & Sim', icon: Settings, allowed: true },
  ];

  return (
    <div className={`rounded-3xl border border-slate-150 shadow-xl overflow-hidden font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-100 border-slate-800' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. TOP HEADER PANEL */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar / Business Logo */}
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md border border-emerald-400">
            {config.name.substring(0, 1)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {businessData.formData?.registered_name || businessData.formData?.hotel_name || businessData.formData?.taxi_fleet_name || `My HillyTrip ${config.name}`}
              </h2>
              {lifecycleStateId === 'active' || lifecycleStateId === 'receiving_bookings' ? (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-0.5 rounded-full border border-emerald-500/20" title="Verified active operator">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-0.5 rounded-full border border-amber-500/20" title="Vetting process active">
                  <ShieldAlert className="w-4 h-4 animate-pulse" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                {config.name}
              </span>
              <span>•</span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                lifecycleStateId === 'receiving_bookings' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200' :
                lifecycleStateId === 'published' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200' :
                lifecycleStateId === 'approved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200' :
                lifecycleStateId === 'pending_verification' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200' :
                'bg-slate-100 text-slate-800 dark:bg-slate-850 dark:text-slate-400 border border-slate-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                LC: {lifecycleConfig.title}
              </span>
              <span>•</span>
              <span className="text-slate-400">WF Stage: <strong className="text-indigo-600 dark:text-indigo-400">{currentStageConfig.title}</strong></span>
            </div>
          </div>
        </div>

        {/* Dynamic Header Actions & Progress */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="space-y-1.5 min-w-[160px]">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-500">
              <span>Profile Built</span>
              <span>{profileCompletion.total}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-700/30">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion.total}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                const target = currentStageId === 'draft' ? 'submitted' : 'draft';
                handleWorkflowTransition('submit', target);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition cursor-pointer shadow-md inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{currentStageId === 'draft' ? 'Submit Review' : 'Revert Draft'}</span>
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2.5 rounded-xl transition text-xs font-bold font-mono"
            >
              {darkMode ? '☀️ LIGHT' : '🌙 DARK'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex flex-col lg:flex-row min-h-[640px]">
        
        {/* SIDE BAR NAVIGATION */}
        <div className="w-full lg:w-64 bg-white dark:bg-slate-900 border-r border-slate-150 dark:border-slate-800 p-4 shrink-0 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              Business OS Navigation
            </div>
            {navigationItems.map(item => {
              if (!item.allowed) return null;
              const IconComp = item.icon;
              const isSelected = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition group ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.locked && (
                    <span title="Awaiting Verification to Unlock">
                      <Lock className="w-3 h-3 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Connected state notice */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-3.5 rounded-2xl text-[10px] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Multi-Tenant Vault</span>
            </div>
            <p className="text-slate-400 leading-normal">
              Fully isolated tenant data. Protected by end-to-end Row Level Security policies.
            </p>
          </div>
        </div>

        {/* ACTIVE MODULE VIEW STAGE */}
        <div className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              
              {/* TAB 1: OVERVIEW PANEL */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Alert banner if draft */}
                  {lifecycleStateId === 'draft' && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">Onboarding Vetting Inactive</h4>
                          <p className="text-xs text-amber-700/90 dark:text-amber-400/80 mt-1">Your business profile is in Draft. Complete required fields and submit your profile to activate booking search listings.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('profile')}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-black px-4 py-2 rounded-xl transition tracking-wide uppercase shrink-0"
                      >
                        Complete Profile
                      </button>
                    </div>
                  )}

                  {/* Dynamic widgets grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat card 1 */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Direct Views</span>
                        <div className="w-7 h-7 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">1,420</div>
                        <p className="text-[10px] font-bold text-emerald-500">+12% over last week</p>
                      </div>
                    </div>

                    {/* Stat card 2 */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Bookings Leads</span>
                        <div className="w-7 h-7 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {permissions.canReceiveBookings ? '28' : '0'}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                          {permissions.canReceiveBookings ? '4 pending confirmation' : 'Onboarding verification locked'}
                        </p>
                      </div>
                    </div>

                    {/* Stat card 3 */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Revenue Projected</span>
                        <div className="w-7 h-7 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {permissions.canReceivePayments ? '₹42,500' : '₹0'}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                          {permissions.canReceivePayments ? 'payout scheduled on Friday' : 'Payment systems offline'}
                        </p>
                      </div>
                    </div>

                    {/* Stat card 4 */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Reputation Index</span>
                        <div className="w-7 h-7 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {permissions.canReceiveReviews ? '4.9 / 5' : '—'}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">
                          {permissions.canReceiveReviews ? 'Based on 14 guest reviews' : 'Reviews awaiting activation'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Task Engine and AI assistant row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Task Engine (Dynamic onboarding/compliance tasks) */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <CheckCircle className="w-4.5 h-4.5 text-indigo-500" />
                          <span>Onboarding Task Engine</span>
                        </h3>
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-black font-mono">
                          {profileCompletion.missingItems.length} PENDING
                        </span>
                      </div>

                      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                        {profileCompletion.missingItems.length === 0 ? (
                          <div className="text-center py-8 space-y-2">
                            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">All Requirements Satisfied!</h4>
                            <p className="text-[10px] text-slate-400">Your profile meets the high-quality threshold of HillyTrip.</p>
                          </div>
                        ) : (
                          profileCompletion.missingItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl hover:shadow-sm transition">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  item.type === 'field' ? 'bg-indigo-500/10 text-indigo-500' :
                                  item.type === 'document' ? 'bg-amber-500/10 text-amber-500' :
                                  'bg-teal-500/10 text-teal-500'
                                }`}>
                                  {item.type === 'field' ? <Edit3 className="w-4 h-4" /> :
                                   item.type === 'document' ? <FileText className="w-4 h-4" /> :
                                   <Camera className="w-4 h-4" />}
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-black text-slate-850 dark:text-slate-200">
                                    {item.type === 'field' ? `Fill out: ${item.label}` :
                                     item.type === 'document' ? `Upload document: ${item.label}` :
                                     `Add Photos: ${item.label}`}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 font-mono">Section: {item.sectionId}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleTaskClick(item.sectionId)}
                                className="bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 text-[10px] font-black px-3 py-1.5 rounded-lg transition"
                              >
                                Fix Item
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* AI ASSISTANT PANEL */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                          <span>Gemini AI Business Assistant</span>
                        </h3>

                        <div className="space-y-2">
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/40 rounded-xl p-3 text-xs leading-relaxed text-indigo-900 dark:text-indigo-400">
                            "Hello! Complete your onboarding steps. I'm ready to write professional copy and auto-suggest optimal room rates or trek route pricings once your credentials pass review."
                          </div>

                          <div className="border border-dashed border-slate-150 dark:border-slate-800 rounded-xl p-3 space-y-1 hover:border-slate-200 transition cursor-pointer">
                            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">✍️ Professional Description Copy</h4>
                            <p className="text-[10px] text-slate-400">Draft rich editorial bio utilizing optimized SEO hashtags.</p>
                          </div>

                          <div className="border border-dashed border-slate-150 dark:border-slate-800 rounded-xl p-3 space-y-1 hover:border-slate-200 transition cursor-pointer">
                            <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">🏷️ Dynamic Seasonal Pricing Suggestion</h4>
                            <p className="text-[10px] text-slate-400">Analyze current competitor price guidelines in your district.</p>
                          </div>
                        </div>
                      </div>

                      <button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-2 rounded-xl transition uppercase tracking-wide mt-2"
                        disabled
                        title="AI Actions will unlock once the profile passes initial review"
                      >
                        Ask Gemini AI (Locked)
                      </button>
                    </div>

                  </div>

                  {/* Notification Center */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Bell className="w-4.5 h-4.5 text-indigo-500" />
                      <span>Regulatory &amp; Workflow Notifications</span>
                    </h3>

                    <div className="space-y-3.5">
                      <div className="flex gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></div>
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Tenant Registration Initiated: </strong>
                          <span className="text-slate-500">Your enterprise profile is officially created under tenant UUID {user?.id?.substring(0, 8)}.</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 font-mono">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></div>
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Workflow Stage Set to [{currentStageConfig.title}]: </strong>
                          <span className="text-slate-500">{currentStageConfig.description}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 font-mono">Just now</span>
                        </div>
                      </div>

                      <div className="flex gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0 mt-1.5"></div>
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">Supabase RLS Active: </strong>
                          <span className="text-slate-500">All data synced is strictly encapsulated using row level security checks.</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 font-mono">Systems Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PROFILE ONBOARDING / CONFIGURATION DRIVEN FIELDS */}
              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Profile Onboarding Registry</h2>
                    <p className="text-xs text-slate-500 mt-1">Configure all fields defined dynamically by HillyTrip business rules for {config.name}.</p>
                  </div>

                  <div className="space-y-8">
                    {config.sections.map(section => {
                      if (section.type !== 'fields' || !section.fields) return null;
                      
                      return (
                        <div key={section.id} className="space-y-4 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl bg-slate-50/40 dark:bg-slate-950/20">
                          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400">{section.title}</h3>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-black font-mono">
                              {profileCompletion.sections[section.id]}% Complete
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-400 mt-1">{section.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                            {section.fields.map(field => {
                              const value = businessData.formData?.[field.id] !== undefined ? businessData.formData?.[field.id] : '';
                              return (
                                <div key={field.id} className="space-y-1.5">
                                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                    <span>{field.label}</span>
                                    {field.required && <span className="text-red-500">*</span>}
                                  </label>
                                  
                                  {field.type === 'text' && (
                                    <input 
                                      type="text" 
                                      value={value}
                                      placeholder={field.placeholder}
                                      onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                                      className="w-full bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 font-bold transition"
                                    />
                                  )}

                                  {field.type === 'textarea' && (
                                    <textarea 
                                      value={value}
                                      placeholder={field.placeholder}
                                      onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                                      className="w-full bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 font-bold h-20 transition"
                                    />
                                  )}

                                  {field.type === 'select' && (
                                    <select 
                                      value={value}
                                      onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                                      className="w-full bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 font-bold transition"
                                    >
                                      <option value="">{field.placeholder || 'Select option'}</option>
                                      {field.options ? (
                                        field.options.map(opt => (
                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))
                                      ) : (
                                        <>
                                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                                          <option value="Uttarakhand">Uttarakhand</option>
                                          <option value="Lahaul &amp; Spiti">Lahaul &amp; Spiti</option>
                                          <option value="Manali District">Manali District</option>
                                        </>
                                      )}
                                    </select>
                                  )}

                                  {field.type !== 'text' && field.type !== 'textarea' && field.type !== 'select' && (
                                    <input 
                                      type="text" 
                                      value={value}
                                      placeholder={field.placeholder || 'e.g. Standard values'}
                                      onChange={(e) => handleFieldChange(section.id, field.id, e.target.value)}
                                      className="w-full bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 font-bold transition"
                                    />
                                  )}

                                  {field.helpText && (
                                    <span className="text-[10px] text-slate-400 font-mono inline-block mt-1">{field.helpText}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5 flex justify-end gap-3">
                    <button 
                      onClick={() => {
                        setNotification({ type: 'success', message: 'Profile drafts updated locally in storage' });
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Save Configuration Draft
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 3: SERVICES (LIST OF SERVICES) */}
              {activeTab === 'services' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Services &amp; Inventories Catalog</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage public catalog items, facilities or packages for your {config.name}.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider">Inventory Unit #1</h4>
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Himalayan Cedar Wood Deluxe Suite</h3>
                        <p className="text-[11px] text-slate-400">Standard King Bed • Hot Bath • Balcony with Peak Views</p>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold font-mono">
                        <span>Rate: ₹4,500/night</span>
                        <span className="text-emerald-500">Online &amp; Active</span>
                      </div>
                    </div>

                    <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/10 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-indigo-500 tracking-wider">Inventory Unit #2</h4>
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Cozy Attic Double Room</h3>
                        <p className="text-[11px] text-slate-400">Double Bed • Attached Bath • Glass roof star views</p>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold font-mono">
                        <span>Rate: ₹2,800/night</span>
                        <span className="text-emerald-500">Online &amp; Active</span>
                      </div>
                    </div>

                    <div className="border border-dashed border-slate-150 dark:border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 hover:bg-slate-50/20 dark:hover:bg-slate-850/10 transition cursor-pointer">
                      <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Add New Service Unit</h4>
                        <p className="text-[10px] text-slate-400">List extra rooms, vehicle models or trek circuits</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRICING */}
              {activeTab === 'pricing' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Rates &amp; Tariff Sheet</h2>
                    <p className="text-xs text-slate-500 mt-1">Configure tariff caps, high-season premiums, and special discounts.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Dynamic Seasonal Rates</h3>
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs">
                          <span>Base Summer Rate (May - Aug):</span>
                          <strong className="font-mono text-indigo-500">100% (Standard)</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span>Snow Peak Premium (Jan - Feb):</span>
                          <strong className="font-mono text-emerald-500">+25% surcharge</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span>Off-season Monsoon Discount (Jul - Sep):</span>
                          <strong className="font-mono text-rose-500">-30% discount</strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Tax &amp; Fees Configuration</h3>
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs">
                          <span>GSTIN Tax Tier:</span>
                          <strong className="font-mono">12% Luxury Lodging GST</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span>Local Tourism Council Fee:</span>
                          <strong className="font-mono">₹100/booking (Inclusive)</strong>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span>Refund Policy:</span>
                          <strong className="font-mono text-slate-500">Free Cancellation up to 72 hours</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Active Guest Bookings</h2>
                    <p className="text-xs text-slate-500 mt-1">Track upcoming check-ins, customer phone details, and reservation states.</p>
                  </div>

                  {!permissions.canReceiveBookings ? (
                    <div className="text-center py-16 space-y-4 border border-dashed border-slate-150 dark:border-slate-800 rounded-2xl">
                      <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1.5 max-w-sm mx-auto">
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Bookings Module Locked</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Your business lifecycle is currently set to [{lifecycleConfig.title}]. You must pass RTO audits or visual reviews to activate live bookings and reservation workflows.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Booking Item 1 */}
                      <div className="border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono">Checked In</span>
                          <h4 className="text-xs font-black text-slate-850 dark:text-white">Arun Sharma • 2 Adults • 3 Nights</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Unit: Himalayan Cedar Wood Deluxe Suite • Date: {new Date().toLocaleDateString()} - onwards</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-black px-3.5 py-1.5 rounded-lg transition">Contact Guest</button>
                          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg transition">Check Out</button>
                        </div>
                      </div>

                      {/* Booking Item 2 */}
                      <div className="border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono">Confirmed</span>
                          <h4 className="text-xs font-black text-slate-850 dark:text-white">Dr. Natasha Sen • 1 Adult • 5 Nights</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Unit: Cozy Attic Double Room • Date: Upcoming Monday</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-black px-3.5 py-1.5 rounded-lg transition">Contact Guest</button>
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg transition">Pre-Check-In Complete</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Reviews &amp; Reputation</h2>
                    <p className="text-xs text-slate-500 mt-1">Read visitor feedback and craft host response comments.</p>
                  </div>

                  {!permissions.canReceiveReviews ? (
                    <div className="text-center py-16 space-y-4 border border-dashed border-slate-150 dark:border-slate-800 rounded-2xl">
                      <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div className="space-y-1.5 max-w-sm mx-auto">
                        <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Reviews Sandbox Closed</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Your business lifecycle is currently set to [{lifecycleConfig.title}]. Pass verification checks to collect public star reviews and scale your brand directory ranking.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-3.5 bg-slate-50/50 dark:bg-slate-950/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong className="text-xs text-slate-800 dark:text-slate-200 block">Vikram Aditya, Bangalore</strong>
                            <span className="text-[10px] text-slate-400">Visited June 2026</span>
                          </div>
                          <div className="flex gap-0.5 text-amber-500">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350">
                          "Absolutely magical stay! The cedar wood scent of the rooms and the mountain peaks visible right from the balcony were unforgettable. The host treated us to hot regional Siddu bread with ghee."
                        </p>
                        <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 block">Your Official Host Reply:</span>
                          <p className="text-xs italic text-slate-500">"Thank you for the kind words Vikram! It was our absolute pleasure hosting you. Looking forward to welcoming you back during the snow seasons."</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: PHOTOS GALLERY */}
              {activeTab === 'photos' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">Media Gallery Hub</h2>
                      <p className="text-xs text-slate-500 mt-1">Manage photographs and virtual tour loops.</p>
                    </div>
                    <button 
                      onClick={handleSimulatedPhotoUpload}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </button>
                  </div>

                  {/* Photo stream */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {businessData.photos && businessData.photos.map((ph: any, idx: number) => (
                      <div key={idx} className="group relative border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-950 flex flex-col justify-end p-3">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                        <span className="text-slate-400 absolute inset-0 m-auto flex items-center justify-center font-mono text-[10px] select-none uppercase">🖼️ Photo Asset {idx+1}</span>
                        <div className="relative z-20 space-y-0.5">
                          <h5 className="text-[10px] font-black text-white truncate">{ph.filename}</h5>
                          <p className="text-[9px] text-slate-300 font-mono">{ph.size}</p>
                        </div>
                      </div>
                    ))}

                    <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center aspect-video p-4 text-center space-y-2 hover:bg-slate-50/20 dark:hover:bg-slate-850/10 transition cursor-pointer" onClick={handleSimulatedPhotoUpload}>
                      <Camera className="w-5 h-5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400">Add high-resolution image</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Compliance &amp; Government Audits</h2>
                    <p className="text-xs text-slate-500 mt-1">Upload and review trust licenses, RTO records, municipal fire clearances, and FSSAI cards.</p>
                  </div>

                  <div className="space-y-4">
                    {config.sections.find(s => s.id === 'documents')?.requiredDocuments?.map(docItem => {
                      const file = businessData.documents?.[docItem.id];
                      return (
                        <div key={docItem.id} className="border border-slate-150 dark:border-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/40 dark:bg-slate-950/20">
                          <div className="space-y-1 max-w-md">
                            <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wide">{docItem.name}</h4>
                            <p className="text-[11px] text-slate-400 leading-normal">{docItem.description}</p>
                            {file && (
                              <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-mono mt-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Uploaded File: {file.filename} ({file.size})</span>
                              </div>
                            )}
                          </div>

                          <div className="shrink-0">
                            {file ? (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-200">
                                Active Vault Scan
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleSimulatedDocUpload(docItem.id, docItem.name)}
                                className="bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer"
                              >
                                Upload Verified Copy
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 9: ANALYTICS (KPI metric visualization engine) */}
              {activeTab === 'analytics' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">Business Intelligence Suite</h2>
                      <p className="text-xs text-slate-500 mt-1">Real-time performance analytics of views, inquiries, leads and conversion ratios.</p>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start font-mono">
                      {(['7d', '30d', '90d'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setTimePeriod(p)}
                          className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${
                            timePeriod === p 
                              ? 'bg-white dark:bg-slate-950 text-indigo-600 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Micro Chart Simulation (Rendered pure HTML/CSS and SVG) */}
                  <div className="space-y-6">
                    <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Weekly Search Engine Exposure Loop</h4>
                        <span className="text-[10px] font-mono text-emerald-500">+18.5% conversion increase</span>
                      </div>

                      {/* Line chart visualization */}
                      <div className="relative h-44 border-b border-l border-slate-200 dark:border-slate-800 flex items-end justify-between px-6 pt-4 font-mono">
                        
                        <div className="absolute left-2 top-2 text-[9px] text-slate-400">Exposure Index</div>
                        <div className="absolute right-2 bottom-1 text-[9px] text-slate-400">Timeline (Mon - Sun)</div>

                        {/* Chart bar columns */}
                        {[30, 45, 60, 40, 75, 90, 85].map((val, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1.5 w-1/8 group">
                            <div className="relative w-full flex justify-center">
                              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition duration-150 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow pointer-events-none">
                                {val}% (Views: {val * 12})
                              </div>
                            </div>
                            <div 
                              style={{ height: `${val}%` }} 
                              className="w-8 sm:w-12 bg-gradient-to-t from-indigo-500/20 to-indigo-600 rounded-t-md hover:from-emerald-500 hover:to-emerald-600 transition-all duration-300"
                            ></div>
                            <span className="text-[9px] text-slate-400 font-bold">Day {idx+1}</span>
                          </div>
                        ))}

                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Conversion Funnel Diagnostics</h4>
                        
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                              <span>Marketplace Views (1,420)</span>
                              <span>100%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 w-full" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                              <span>Inquiries Initiated (240)</span>
                              <span>16.9%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 w-[17%]" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                              <span>Bookings Leads Confirmed (28)</span>
                              <span>1.9%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 w-[2%]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-3.5">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Demographics Insights</h4>
                        <div className="space-y-2.5 pt-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                          <div className="flex justify-between">
                            <span>🏔️ Trekking Backpacker Explorers:</span>
                            <strong>54%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>🚗 Domestic Transit Commuters:</span>
                            <strong>28%</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>💼 Workcation / Digital Nomads:</span>
                            <strong>18%</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 9.5: PAYMENTS & PAYOUTS (UPSE Integrated Dashboard) */}
              {activeTab === 'payments' && (
                <UPSEBusinessDashboard 
                  businessId={user?.businessId || 'biz_himalayan_retreat_001'} 
                  businessName={businessData.formData?.registered_name || businessData.formData?.hotel_name || businessData.formData?.taxi_fleet_name || `My HillyTrip ${config.name}`}
                />
              )}

              {/* TAB 10: SETTINGS & SYSTEM SIMULATION */}
              {activeTab === 'settings' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                  
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Workflow &amp; Lifecycle Sandbox Controller</h2>
                    <p className="text-xs text-slate-500 mt-1">Test reactive UI layouts by manually triggering state changes inside the HillyTrip State Machine.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-black uppercase text-indigo-500 tracking-wider">Simulated Workflow Triggers</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Manually push this business account into different stages to simulate government reviewer audits, aesthetic vetting, or administrative actions.</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleWorkflowTransition('submit', 'submitted')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-black py-2.5 rounded-xl transition"
                        >
                          Trigger Submitted
                        </button>
                        <button 
                          onClick={() => handleWorkflowTransition('review', 'pending_review')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-black py-2.5 rounded-xl transition"
                        >
                          Trigger Vetting
                        </button>
                        <button 
                          onClick={() => handleWorkflowTransition('approve', 'approved')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-black py-2.5 rounded-xl transition"
                        >
                          Trigger Approved
                        </button>
                        <button 
                          onClick={() => handleWorkflowTransition('publish', 'published')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-black py-2.5 rounded-xl transition"
                        >
                          Trigger Published
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-150 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-black uppercase text-indigo-500 tracking-wider">Manual Lifecycle Overrides</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Directly force specific operational states. Locking or unlocking capabilities and checking dynamic UI reactivity immediately.</p>
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const updatedPartnerDetails = {
                                ...user.partnerDetails,
                                [activeBusinessType]: {
                                  ...businessData,
                                  lifecycleState: 'receiving_bookings'
                                }
                              };
                              onUpdateUser({ ...user, partnerDetails: updatedPartnerDetails });
                              setNotification({ type: 'success', message: 'Manually forced operational lifecycle to: [RECEIVING_BOOKINGS]!' });
                            }}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black py-2.5 rounded-xl transition uppercase tracking-wider"
                          >
                            Receive Bookings (Open)
                          </button>
                          <button 
                            onClick={() => {
                              const updatedPartnerDetails = {
                                ...user.partnerDetails,
                                [activeBusinessType]: {
                                  ...businessData,
                                  lifecycleState: 'suspended'
                                }
                              };
                              onUpdateUser({ ...user, partnerDetails: updatedPartnerDetails });
                              setNotification({ type: 'error', message: 'Manually forced operational lifecycle to: [SUSPENDED]!' });
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black py-2.5 rounded-xl transition uppercase tracking-wider"
                          >
                            Suspend Access (Lock)
                          </button>
                        </div>
                        <button 
                          onClick={() => {
                            const updatedPartnerDetails = {
                              ...user.partnerDetails,
                              [activeBusinessType]: {
                                ...businessData,
                                lifecycleState: 'draft',
                                workflowState: {
                                  ...businessData.workflowState,
                                  currentStageId: 'draft'
                                }
                              }
                            };
                            onUpdateUser({ ...user, partnerDetails: updatedPartnerDetails });
                            setNotification({ type: 'success', message: 'Reset sandbox metrics to initial values.' });
                          }}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-black py-2.5 rounded-xl transition uppercase tracking-wider font-mono"
                        >
                          🔄 RESET ALL STATE MACHINE SIMS
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
